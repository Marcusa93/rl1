"use client";

// Presentación de «Redacción de escritos jurídicos con IA» (/doing/clase).
// Clase por Zoom: se comparte esta ventana; las notas del orador van en otra
// ventana (/doing/notas, tecla N) que no se comparte.
//
// La pantalla manda: al llegar a la pantalla de una experiencia, se abre sola
// en la vista de los participantes (POST /api/session/<slug>/activity, cookie
// docente). Las demás pantallas no cambian nada. El deck publica qué pantalla
// se proyecta para que los participantes la sigan (useRemotoDeck).
//
// Teclado (también clickers, que mandan PageDown/PageUp):
//   → Espacio PageDown  siguiente paso o pantalla · ← PageUp  anterior
//   Home / End  portada / última · G  grilla · Esc  quitar el foco
//   R  mostrar u ocultar resultados · E  revelar la orientación
//   X  cerrar o reabrir la recepción · N  notas del orador
//   D  modo demostración (datos ilustrativos) · Q  enlace y QR · P  revelado paso a paso
//   C  alto contraste · + −  tamaño · Shift+R  reiniciar la sesión (ensayos)

import { useCallback, useEffect, useRef, useState } from "react";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { CANAL_DG, type MensajeDeck } from "@/components/doing/canal";
import { DemoIA } from "@/components/doing/demo";
import { Generador } from "@/components/doing/generador";
import { Ingreso, PantallaActividad, PlacaMarco, Portada } from "@/components/doing/marco";
import { CUERPOS_A } from "@/components/doing/placas-a";
import { CUERPOS_B } from "@/components/doing/placas-b";
import { VivoCtx, type VistaAct } from "@/components/doing/resultados";
import { PantallaSkill } from "@/components/doing/skill";
import { RevelaCtx } from "@/components/tribunal/revelado";
import { useModeracion } from "@/components/tribunal/resultados";
import { useLive } from "@/components/use-live";
import { getDemo } from "@/lib/doing-caso";
import {
  DG_BLOQUES,
  DG_INSTITUCION,
  DG_LINK,
  DG_QR,
  DG_SLIDES,
  DG_SLUG,
  getDgActividad,
  pasosSlideDg,
  tituloSlideDg,
  type DgActividad,
  type DgSlide,
} from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

const CUERPOS = { ...CUERPOS_A, ...CUERPOS_B };
const INTERVALO = 2500;
const TOTAL = DG_SLIDES.length;

type Activacion = { key: string; status: "enviando" | "ok" | "error"; desde: number } | null;

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {}
}

const actDe = (s: DgSlide | undefined) => (s && s.t === "actividad" ? getDgActividad(s.activa) : undefined);

export function DeckDoing() {
  const [idx, setIdx] = useState(() => {
    const v = parseInt(leer(`${DG_SLUG}-placa`) ?? "0", 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), TOTAL - 1) : 0;
  });
  const [paso, setPaso] = useState(() => pasosSlideDg(DG_SLIDES[idx]));
  const [foco, setFoco] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(() => leer("dg-revelado") !== "0");
  const [contraste, setContraste] = useState(() => leer("dg-contraste") === "1");
  const [demo, setDemo] = useState(() => leer("dg-demo") === "1");
  const [grilla, setGrilla] = useState(false);
  const [qr, setQr] = useState(false);
  const [vistas, setVistas] = useState<Record<string, VistaAct>>(() => {
    try {
      return JSON.parse(leer(`${DG_SLUG}-vistas`) ?? "{}");
    } catch {
      return {};
    }
  });
  const [activacion, setActivacion] = useState<Activacion>(null);
  const [cerrada, setCerrada] = useState(false);
  const lastActivada = useRef<string | null>(null);
  const { moderacion, cambiar } = useModeracion(DG_SLUG, INTERVALO);

  const slide = DG_SLIDES[idx];
  const pasosActual = pasosSlideDg(slide);
  const conPasos = revelado && pasosActual > 0;
  const actActual = actDe(slide);

  const irA = useCallback((n: number, entera = false) => {
    const next = Math.min(Math.max(n, 0), TOTAL - 1);
    setIdx(next);
    setPaso(entera ? pasosSlideDg(DG_SLIDES[next]) : 0);
    setFoco(null);
    guardar(`${DG_SLUG}-placa`, String(next));
  }, []);

  const avanzar = useCallback(() => {
    if (conPasos && paso < pasosActual) {
      setPaso(paso + 1);
      setFoco(null);
    } else irA(idx + 1);
  }, [conPasos, paso, pasosActual, idx, irA]);

  const retroceder = useCallback(() => {
    if (conPasos && paso > 0) {
      setPaso(paso - 1);
      setFoco(null);
    } else irA(idx - 1, true);
  }, [conPasos, paso, idx, irA]);

  // Los participantes siguen la pantalla que se proyecta.
  useRemotoDeck({ slug: DG_SLUG, idx, total: TOTAL, titulo: tituloSlideDg(slide), parte: DG_BLOQUES[slide.bloque]?.nombre, go: irA });

  // --- Apertura de las experiencias ---------------------------------------------------------------
  const postActividad = useCallback((body: Record<string, unknown>) => {
    return fetch(`/api/session/${DG_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, []);

  const activar = useCallback(
    (key: string) => {
      lastActivada.current = key;
      setCerrada(false);
      const desde = Date.now();
      setActivacion({ key, status: "enviando", desde });
      postActividad({ current_activity: key })
        .then((r) => setActivacion({ key, status: r.ok ? "ok" : "error", desde }))
        .catch(() => setActivacion({ key, status: "error", desde }));
    },
    [postActividad],
  );

  // La pantalla manda: si es una experiencia, se abre sola.
  useEffect(() => {
    const key = actActual?.key;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [actActual, activar]);

  /** Cierra o reabre la recepción de la experiencia abierta (X). */
  const alternarRecepcion = useCallback(() => {
    const key = cerrada ? (actActual?.key ?? activacion?.key) : lastActivada.current;
    if (!key || key === "lobby") return;
    if (cerrada) activar(key);
    else {
      lastActivada.current = "lobby";
      setCerrada(true);
      postActividad({ current_activity: "lobby" }).catch(() => {});
    }
  }, [cerrada, actActual, activacion, activar, postActividad]);

  // --- Resultados: mostrar (R) y revelar (E) --------------------------------------------------------
  const vista = useCallback((act: DgActividad): VistaAct => vistas[act.key] ?? { mostrar: !act.ocultos, revelada: false }, [vistas]);

  const cambiarVista = useCallback((act: DgActividad, cambio: Partial<VistaAct>) => {
    setVistas((v) => {
      const next = { ...v, [act.key]: { ...(v[act.key] ?? { mostrar: !act.ocultos, revelada: false }), ...cambio } };
      guardar(`${DG_SLUG}-vistas`, JSON.stringify(next));
      return next;
    });
  }, []);

  const alternarMostrar = useCallback((act: DgActividad) => cambiarVista(act, { mostrar: !vista(act).mostrar }), [cambiarVista, vista]);

  const alternarRevelar = useCallback(
    (act: DgActividad) => {
      const revelada = !vista(act).revelada;
      cambiarVista(act, revelada ? { revelada, mostrar: true } : { revelada });
      // Los participantes ven la orientación debajo de la experiencia (si sigue abierta).
      if (lastActivada.current === act.key) postActividad({ activity_config: { revelada } }).catch(() => {});
    },
    [cambiarVista, vista, postActividad],
  );

  const alternarDemo = useCallback(() => {
    setDemo((d) => {
      guardar("dg-demo", d ? "0" : "1");
      return !d;
    });
  }, []);

  const alternarRevelado = useCallback(() => {
    setRevelado((r) => {
      guardar("dg-revelado", r ? "0" : "1");
      return !r;
    });
    setPaso(pasosSlideDg(DG_SLIDES[idx]));
  }, [idx]);

  const alternarContraste = useCallback(() => {
    setContraste((c) => {
      guardar("dg-contraste", c ? "0" : "1");
      return !c;
    });
  }, []);

  const abrirNotas = useCallback(() => {
    window.open("/doing/notas", "doing-notas", "width=580,height=920");
  }, []);

  // --- Ventana de notas: estado y órdenes ---------------------------------------------------------
  const canal = useRef<BroadcastChannel | null>(null);
  const ordenes = useRef({ avanzar, retroceder, irA, actActual, alternarMostrar, alternarRevelar, alternarRecepcion, alternarDemo });
  ordenes.current = { avanzar, retroceder, irA, actActual, alternarMostrar, alternarRevelar, alternarRecepcion, alternarDemo };
  const estadoMsg: MensajeDeck = {
    tipo: "estado",
    idx,
    paso,
    pasos: conPasos ? pasosActual : 0,
    demo,
    cerrada,
    act: actActual?.key,
    mostrar: actActual ? vista(actActual).mostrar : undefined,
    revelada: actActual ? vista(actActual).revelada : undefined,
  };
  const estadoRef = useRef(estadoMsg);
  estadoRef.current = estadoMsg;

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(CANAL_DG);
    canal.current = bc;
    bc.onmessage = (e: MessageEvent<MensajeDeck>) => {
      const m = e.data;
      if (m?.tipo !== "cmd") return;
      const o = ordenes.current;
      if (m.accion === "sig") o.avanzar();
      else if (m.accion === "ant") o.retroceder();
      else if (m.accion === "ir") o.irA(m.idx);
      else if (m.accion === "mostrar" && o.actActual) o.alternarMostrar(o.actActual);
      else if (m.accion === "revelar" && o.actActual) o.alternarRevelar(o.actActual);
      else if (m.accion === "recepcion") o.alternarRecepcion();
      else if (m.accion === "demo") o.alternarDemo();
      else if (m.accion === "pedir") bc.postMessage(estadoRef.current);
    };
    return () => {
      bc.close();
      canal.current = null;
    };
  }, []);

  const firmaEstado = JSON.stringify(estadoMsg);
  useEffect(() => {
    canal.current?.postMessage(JSON.parse(firmaEstado));
  }, [firmaEstado]);

  // --- Teclado -------------------------------------------------------------------------------------
  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todas las respuestas de la sala, la moderación y las demostraciones guardadas. Solo después de ensayar.")) return;
      await fetch(`/api/session/${DG_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await cambiar({ reiniciar: true });
      setVistas({});
      guardar(`${DG_SLUG}-vistas`, "{}");
      try {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("doing-demo-") || k === "doing-apartado")
          .forEach((k) => localStorage.removeItem(k));
      } catch {}
      lastActivada.current = null;
      if (actActual) activar(actActual.key);
      else location.reload();
    }
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (grilla) {
        if (e.key === "Escape" || e.key === "g" || e.key === "G") setGrilla(false);
        return;
      }
      const k = e.key;
      if (["ArrowRight", "PageDown", " "].includes(k)) {
        e.preventDefault();
        avanzar();
      } else if (["ArrowLeft", "PageUp"].includes(k)) {
        e.preventDefault();
        retroceder();
      } else if (k === "Home") irA(0);
      else if (k === "End") irA(TOTAL - 1, true);
      else if (k === "Escape") setFoco(null);
      else if (k === "g" || k === "G") setGrilla(true);
      else if (k === "q" || k === "Q") setQr((v) => !v);
      else if (k === "p" || k === "P") alternarRevelado();
      else if (k === "c" || k === "C") alternarContraste();
      else if (k === "d" || k === "D") alternarDemo();
      else if (k === "n" || k === "N") abrirNotas();
      else if (k === "x" || k === "X") alternarRecepcion();
      else if (k === "R" && e.shiftKey) reiniciar();
      else if (k === "r" && actActual) alternarMostrar(actActual);
      else if ((k === "e" || k === "E") && actActual) alternarRevelar(actActual);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grilla, avanzar, retroceder, irA, actActual, activar, cambiar, alternarRevelado, alternarContraste, alternarDemo, abrirNotas, alternarRecepcion, alternarMostrar, alternarRevelar]);

  const { zoom, aviso: avisoZoom } = useZoomDeck();
  const revela = { visibles: conPasos ? paso : Infinity, foco, alternarFoco: (i: number) => setFoco((f) => (f === i ? null : i)) };
  const ctxVivo = {
    slug: DG_SLUG,
    intervalo: INTERVALO,
    demo,
    vista,
    ocultas: (key: string) => moderacion[key]?.ocultas ?? [],
    alternarMostrar,
    alternarRevelar,
    abierta: activacion && !cerrada && activacion.status !== "error" ? { key: activacion.key, desde: activacion.desde } : null,
  };
  const bloque = DG_BLOQUES[slide.bloque];
  const tituloAbierta = activacion ? (getDgActividad(activacion.key)?.titulo ?? "") : "";

  return (
    <div className={cn("dg dg-papel deck-escala relative flex min-h-dvh flex-col overflow-hidden text-dg-tinta", contraste && "dg-contraste")}>
      <AvisoZoom zoom={zoom} visible={avisoZoom} />

      <VivoCtx.Provider value={ctxVivo}>
        <RevelaCtx.Provider value={revela}>
          <main key={idx} className="mx-auto flex w-full max-w-[84rem] flex-1 flex-col px-16 pb-24 pt-11">
            <Pantalla slide={slide} cerrada={cerrada} onRecepcion={alternarRecepcion} />
          </main>
        </RevelaCtx.Provider>
      </VivoCtx.Provider>

      {qr && <EnlaceFlotante onCerrar={() => setQr(false)} demo={demo} />}

      <footer className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-5 bg-gradient-to-t from-[#f2ebdf] via-[#f2ebdf]/95 to-transparent px-16 pb-4 pt-6 text-sm text-dg-pizarra">
        <span className="hidden min-w-0 flex-1 items-center gap-3 truncate md:flex">
          {slide.t !== "portada" && (
            <>
              <Progreso actual={slide.bloque} />
              <span className="truncate text-xs text-dg-niebla">
                {bloque.num} · {bloque.nombre}
              </span>
            </>
          )}
        </span>
        <span className="flex flex-1 items-center justify-end gap-2 whitespace-nowrap">
          {(activacion || cerrada) && (
            <span
              className={cn(
                "hidden max-w-[20rem] items-center gap-2 truncate rounded-full px-3 py-1 text-xs font-medium lg:flex",
                activacion?.status === "error" ? "bg-dg-lacre/10 text-dg-lacre" : cerrada ? "bg-dg-linea text-dg-pizarra" : "bg-dg-ocre-claro text-dg-ocre",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", activacion?.status === "error" ? "bg-dg-lacre" : cerrada ? "bg-dg-niebla" : "animate-pulse bg-dg-ocre")} />
              <span className="truncate">
                {cerrada
                  ? "recepción cerrada"
                  : activacion?.status === "enviando"
                    ? "abriendo…"
                    : activacion?.status === "ok"
                      ? `abierta: ${tituloAbierta}`
                      : "no se pudo abrir: volvé a ingresar la clave"}
              </span>
            </span>
          )}
          {conPasos && (
            <span className="mr-1 flex items-center gap-1" aria-label={`Paso ${paso} de ${pasosActual}`}>
              {Array.from({ length: pasosActual }, (_, i) => (
                <span key={i} className={cn("size-1.5 rounded-full", i < paso ? "bg-dg-lacre" : "bg-dg-linea")} />
              ))}
            </span>
          )}
          <BotonPie activo={demo} onClick={alternarDemo} titulo="Modo demostración: resultados ilustrativos (D)">
            Demo
          </BotonPie>
          <BotonPie activo={qr} onClick={() => setQr((v) => !v)} titulo="Enlace para participar (Q)">
            Enlace
          </BotonPie>
          <BotonPie onClick={abrirNotas} titulo="Notas del orador en otra ventana (N)">
            Notas
          </BotonPie>
          <BotonPie onClick={() => setGrilla(true)} titulo="Todas las pantallas (G)">
            ▦
          </BotonPie>
          <BotonPie activo={contraste} onClick={alternarContraste} titulo="Alto contraste (C)">
            ◐
          </BotonPie>
          <BotonPie onClick={retroceder} titulo="Anterior (←)">
            ◀
          </BotonPie>
          <span className="w-14 text-center tabular-nums">
            {idx + 1} / {TOTAL}
          </span>
          <BotonPie onClick={avanzar} titulo="Siguiente (→)">
            ▶
          </BotonPie>
        </span>
      </footer>

      {grilla && (
        <Grilla
          actual={idx}
          onIr={(i) => {
            irA(i);
            setGrilla(false);
          }}
          onCerrar={() => setGrilla(false)}
        />
      )}
    </div>
  );
}

function Pantalla({ slide, cerrada, onRecepcion }: { slide: DgSlide; cerrada: boolean; onRecepcion: () => void }) {
  switch (slide.t) {
    case "portada":
      return <Portada />;
    case "ingreso":
      return <Ingreso slug={DG_SLUG} />;
    case "actividad": {
      const act = getDgActividad(slide.activa);
      return act ? <PantallaActividad act={act} cerrada={cerrada} onRecepcion={onRecepcion} /> : null;
    }
    case "demo": {
      if (slide.demo === "d4") return <Generador bloque={slide.bloque} />;
      const d = getDemo(slide.demo);
      return d ? <DemoIA demo={d} bloque={slide.bloque} /> : null;
    }
    case "skill":
      return <PantallaSkill slide={slide} />;
    case "placa": {
      const Cuerpo = CUERPOS[slide.cuerpo];
      return (
        <PlacaMarco placa={slide}>
          <Cuerpo placa={slide} />
        </PlacaMarco>
      );
    }
  }
}

function BotonPie({ children, onClick, activo, titulo }: { children: React.ReactNode; onClick: () => void; activo?: boolean; titulo: string }) {
  return (
    <button
      onClick={onClick}
      title={titulo}
      className={cn(
        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:text-dg-verde",
        activo ? "border-dg-verde bg-dg-verde text-white hover:text-white" : "border-dg-linea bg-dg-hoja",
      )}
    >
      {children}
    </button>
  );
}

/** Avance de la clase: un tramo por bloque, proporcional a sus minutos. */
function Progreso({ actual }: { actual: number }) {
  return (
    <span className="flex w-52 items-center gap-1" aria-label="Avance de la clase">
      {DG_BLOQUES.map((b, i) => (
        <span
          key={b.num}
          title={`${b.num} · ${b.nombre} (${b.rango} min)`}
          className={cn("h-1.5 rounded-full", i <= actual ? "bg-dg-verde" : "bg-dg-linea", i === actual && "h-2.5")}
          style={{ flexGrow: b.minutos, flexBasis: 0 }}
        />
      ))}
    </span>
  );
}

/** Enlace para participar, sobre cualquier pantalla (para quien llega tarde). */
function EnlaceFlotante({ onCerrar, demo }: { onCerrar: () => void; demo: boolean }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${DG_SLUG}`, 4000);
  return (
    <div className="tf-sube fixed bottom-20 right-16 z-40 flex items-center gap-6 rounded-[1.5rem] border border-dg-linea bg-dg-hoja p-5 pr-8 shadow-[0_24px_60px_-20px_rgba(34,39,42,0.45)]">
      <img src={DG_QR} alt="Código QR para entrar" className="size-[9rem]" />
      <div className="max-w-[17rem]">
        <p className="dg-rotulo flex items-center gap-2 text-dg-ocre">
          <span className="size-2 animate-pulse rounded-full bg-dg-ocre" />
          Enlace en el chat de Zoom
        </p>
        <p className="dg-maquina mt-3 text-[1.45rem] font-bold leading-tight text-dg-verde">{DG_LINK}</p>
        <p className="mt-4 text-sm text-dg-pizarra">
          <b className="dg-serif text-[2rem] font-normal text-dg-azul tabular-nums">{demo ? 37 : (data?.participants ?? 0)}</b> conectados
        </p>
        <button onClick={onCerrar} className="mt-3 text-xs text-dg-niebla underline-offset-2 hover:underline">
          Ocultar · Q
        </button>
      </div>
    </div>
  );
}

/** Todas las pantallas de un vistazo (G): saltar a cualquiera con un clic. */
function Grilla({ actual, onIr, onCerrar }: { actual: number; onIr: (i: number) => void; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#f2ebdf]/97 px-16 py-10 backdrop-blur-sm" onClick={onCerrar}>
      <div className="mx-auto max-w-[84rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="dg-rotulo text-dg-verde">{DG_INSTITUCION} · Redacción jurídica con IA</p>
            <h2 className="dg-titular mt-2 text-[2.6rem] text-dg-tinta">Todas las pantallas</h2>
          </div>
          <button onClick={onCerrar} className="rounded-lg border border-dg-linea bg-dg-hoja px-3 py-1.5 text-sm">
            Cerrar <span className="ml-1 text-xs text-dg-niebla">Esc</span>
          </button>
        </div>
        <div className="mt-8 grid grid-cols-5 gap-3 xl:grid-cols-7">
          {DG_SLIDES.map((s, i) => (
            <button
              key={i}
              onClick={() => onIr(i)}
              className={cn(
                "flex min-h-[7.5rem] flex-col rounded-xl border bg-dg-hoja p-3 text-left transition hover:border-dg-verde",
                i === actual
                  ? "border-2 border-dg-verde shadow-md"
                  : s.t === "actividad"
                    ? "border-dg-ocre/50 bg-dg-ocre-claro/60"
                    : s.t === "demo"
                      ? "border-dg-lacre/40 bg-dg-lacre-claro/50"
                      : s.t === "skill"
                        ? "border-dg-azul/40 bg-dg-azul-claro/60"
                        : "border-dg-linea",
              )}
            >
              <span className="flex items-center justify-between">
                <span className="text-xs tabular-nums text-dg-niebla">{i + 1}</span>
                {s.t === "actividad" ? (
                  <span className="text-[0.6rem] font-semibold tracking-widest text-dg-ocre">EXPERIENCIA {getDgActividad(s.activa)?.numero}</span>
                ) : s.t === "demo" ? (
                  <span className="text-[0.6rem] font-semibold tracking-widest text-dg-lacre">DEMO IA</span>
                ) : s.t === "skill" ? (
                  <span className="text-[0.6rem] font-semibold tracking-widest text-dg-azul">SKILLS</span>
                ) : s.t === "placa" && s.giro ? (
                  <span className="text-[0.6rem] font-semibold tracking-widest text-dg-lacre">GIRO</span>
                ) : null}
              </span>
              <span className="dg-serif mt-2 line-clamp-3 text-[1.05rem] leading-snug text-dg-tinta">
                {tituloSlideDg(s).replace(/^\d+ · /, "").replace(/^[●▶🧰] /u, "")}
              </span>
              <span className="mt-auto pt-2 text-[0.65rem] text-dg-niebla">{DG_BLOQUES[s.bloque]?.nombre}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
