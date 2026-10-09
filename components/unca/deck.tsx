"use client";

// Presentación de "La arquitectura de la confianza digital" (/unca/clase).
// Clase virtual: se comparte esta ventana en la videollamada; las notas del
// orador van en otra ventana (/unca/notas, tecla N) que no se comparte.
//
// La placa manda: al llegar a una placa con intervención, la actividad se
// abre sola en los dispositivos de la sala (POST /api/session/<slug>/activity,
// cookie docente). Las placas sin intervención no cambian nada.
//
// Teclado (también clickers, que mandan PageDown/PageUp):
//   → Espacio PageDown  siguiente paso o pantalla · ← PageUp  anterior
//   Home / End  portada / última · G  grilla · Esc  quitar el foco
//   R  mostrar u ocultar los resultados · E  revelar la respuesta orientativa
//   X  cerrar o reabrir la recepción de respuestas · N  notas del orador
//   D  modo demostración (datos ficticios) · Q  QR · P  revelado paso a paso
//   C  alto contraste · + −  tamaño · Shift+R  reiniciar la sesión (ensayos)

import { useCallback, useEffect, useRef, useState } from "react";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { RevelaCtx } from "@/components/tribunal/revelado";
import { useModeracion } from "@/components/tribunal/resultados";
import { useLive } from "@/components/use-live";
import { CANAL_UC, type MensajeDeck } from "@/components/unca/canal";
import { LabCertWeb, LabFirma, LabHash } from "@/components/unca/labs";
import { Ingreso, LabMarco, PlacaMarco, Portada } from "@/components/unca/marco";
import { CUERPOS_A } from "@/components/unca/placas-a";
import { CUERPOS_B } from "@/components/unca/placas-b";
import { VivoCtx, type VistaAct } from "@/components/unca/resultados";
import {
  getUcActividad,
  pasosSlideUc,
  tituloSlideUc,
  UC_BLOQUES,
  UC_DIPLOMATURA,
  UC_LINK,
  UC_QR,
  UC_SLIDES,
  UC_SLUG,
  type UcActividad,
  type UcSlide,
} from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

const CUERPOS = { ...CUERPOS_A, ...CUERPOS_B };
const INTERVALO = 2500;
const TOTAL = UC_SLIDES.length;

type Activacion = { key: string; status: "enviando" | "ok" | "error" } | null;

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

const actDe = (s: UcSlide | undefined) => (s && s.t === "placa" && s.activa ? getUcActividad(s.activa) : undefined);

export function DeckUnca() {
  const [idx, setIdx] = useState(() => {
    const v = parseInt(leer(`${UC_SLUG}-placa`) ?? "0", 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), TOTAL - 1) : 0;
  });
  const [paso, setPaso] = useState(() => pasosSlideUc(UC_SLIDES[idx]));
  const [foco, setFoco] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(() => leer("uc-revelado") !== "0");
  const [contraste, setContraste] = useState(() => leer("uc-contraste") === "1");
  const [demo, setDemo] = useState(() => leer("uc-demo") === "1");
  const [grilla, setGrilla] = useState(false);
  const [qr, setQr] = useState(false);
  const [vistas, setVistas] = useState<Record<string, VistaAct>>(() => {
    try {
      return JSON.parse(leer(`${UC_SLUG}-vistas`) ?? "{}");
    } catch {
      return {};
    }
  });
  const [activacion, setActivacion] = useState<Activacion>(null);
  const [cerrada, setCerrada] = useState(false);
  const lastActivada = useRef<string | null>(null);
  const { moderacion, cambiar } = useModeracion(UC_SLUG, INTERVALO);

  const slide = UC_SLIDES[idx];
  const pasosActual = pasosSlideUc(slide);
  const conPasos = revelado && pasosActual > 0;
  const actActual = actDe(slide);

  const irA = useCallback((n: number, entera = false) => {
    const next = Math.min(Math.max(n, 0), TOTAL - 1);
    setIdx(next);
    setPaso(entera ? pasosSlideUc(UC_SLIDES[next]) : 0);
    setFoco(null);
    guardar(`${UC_SLUG}-placa`, String(next));
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

  // --- Apertura de las intervenciones ---------------------------------------------------------
  const postActividad = useCallback((body: Record<string, unknown>) => {
    return fetch(`/api/session/${UC_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }, []);

  const activar = useCallback(
    (key: string) => {
      lastActivada.current = key;
      setCerrada(false);
      setActivacion({ key, status: "enviando" });
      postActividad({ current_activity: key })
        .then((r) => setActivacion({ key, status: r.ok ? "ok" : "error" }))
        .catch(() => setActivacion({ key, status: "error" }));
    },
    [postActividad],
  );

  // La placa manda: si tiene intervención, se abre sola en los dispositivos.
  useEffect(() => {
    const key = actActual?.key;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [actActual, activar]);

  /** Cierra o reabre la recepción de la intervención abierta (X). */
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
  const vista = useCallback((act: UcActividad): VistaAct => vistas[act.key] ?? { mostrar: !act.ocultos, revelada: false }, [vistas]);

  const cambiarVista = useCallback(
    (act: UcActividad, cambio: Partial<VistaAct>) => {
      setVistas((v) => {
        const next = { ...v, [act.key]: { ...(v[act.key] ?? { mostrar: !act.ocultos, revelada: false }), ...cambio } };
        guardar(`${UC_SLUG}-vistas`, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const alternarMostrar = useCallback((act: UcActividad) => cambiarVista(act, { mostrar: !vista(act).mostrar }), [cambiarVista, vista]);

  const alternarRevelar = useCallback(
    (act: UcActividad) => {
      const revelada = !vista(act).revelada;
      // Revelar implica mostrar los resultados.
      cambiarVista(act, revelada ? { revelada, mostrar: true } : { revelada });
      // Los dispositivos ven la explicación debajo de la actividad (si sigue abierta).
      if (lastActivada.current === act.key) postActividad({ activity_config: { revelada } }).catch(() => {});
    },
    [cambiarVista, vista, postActividad],
  );

  const alternarDemo = useCallback(() => {
    setDemo((d) => {
      guardar("uc-demo", d ? "0" : "1");
      return !d;
    });
  }, []);

  const alternarRevelado = useCallback(() => {
    setRevelado((r) => {
      guardar("uc-revelado", r ? "0" : "1");
      return !r;
    });
    setPaso(pasosSlideUc(UC_SLIDES[idx]));
  }, [idx]);

  const alternarContraste = useCallback(() => {
    setContraste((c) => {
      guardar("uc-contraste", c ? "0" : "1");
      return !c;
    });
  }, []);

  const abrirNotas = useCallback(() => {
    window.open("/unca/notas", "unca-notas", "width=560,height=900");
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
    const bc = new BroadcastChannel(CANAL_UC);
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

  // --- Teclado -----------------------------------------------------------------------------------------
  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todas las respuestas de la sala y la moderación. Solo después de ensayar.")) return;
      await fetch(`/api/session/${UC_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await cambiar({ reiniciar: true });
      setVistas({});
      guardar(`${UC_SLUG}-vistas`, "{}");
      lastActivada.current = null;
      if (actActual) activar(actActual.key);
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
    slug: UC_SLUG,
    intervalo: INTERVALO,
    demo,
    vista,
    ocultas: (key: string) => moderacion[key]?.ocultas ?? [],
    alternarMostrar,
    alternarRevelar,
  };
  const bloque = UC_BLOQUES[slide.bloque];
  const tituloAbierta = activacion ? (getUcActividad(activacion.key)?.titulo ?? "") : "";
  const puedeRevelar = actActual && (actActual.revela || actActual.correcta || actActual.clasificacion);

  return (
    <div className={cn("uc uc-papel deck-escala relative flex min-h-dvh flex-col overflow-hidden text-uc-tinta", contraste && "uc-contraste")}>
      <AvisoZoom zoom={zoom} visible={avisoZoom} />

      <VivoCtx.Provider value={ctxVivo}>
        <RevelaCtx.Provider value={revela}>
          <main key={idx} className="mx-auto flex w-full max-w-[84rem] flex-1 flex-col px-16 pb-24 pt-12">
            <Pantalla slide={slide} />
          </main>
        </RevelaCtx.Provider>
      </VivoCtx.Provider>

      {qr && <QrFlotante onCerrar={() => setQr(false)} demo={demo} />}

      <footer className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-5 bg-gradient-to-t from-[#f4efe4] via-[#f4efe4]/95 to-transparent px-16 pb-4 pt-6 text-sm text-uc-pizarra">
        <span className="hidden min-w-0 flex-1 items-center gap-3 truncate md:flex">
          {slide.t !== "portada" && (
            <>
              <Progreso actual={slide.bloque} />
              <span className="truncate text-xs text-uc-niebla">
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
                activacion?.status === "error" ? "bg-uc-lacre/10 text-uc-lacre" : cerrada ? "bg-uc-linea text-uc-pizarra" : "bg-uc-ocre-claro text-uc-ocre",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", activacion?.status === "error" ? "bg-uc-lacre" : cerrada ? "bg-uc-niebla" : "animate-pulse bg-uc-ocre")} />
              <span className="truncate">
                {cerrada
                  ? "recepción cerrada"
                  : activacion?.status === "enviando"
                    ? "abriendo…"
                    : activacion?.status === "ok"
                      ? `en los dispositivos: ${tituloAbierta}`
                      : "no se pudo abrir: volvé a ingresar la clave"}
              </span>
            </span>
          )}
          {conPasos && (
            <span className="mr-1 flex items-center gap-1" aria-label={`Paso ${paso} de ${pasosActual}`}>
              {Array.from({ length: pasosActual }, (_, i) => (
                <span key={i} className={cn("size-1.5 rounded-full", i < paso ? "bg-uc-verde" : "bg-uc-linea")} />
              ))}
            </span>
          )}
          {actActual && (
            <>
              <BotonPie activo={vista(actActual).mostrar} onClick={() => alternarMostrar(actActual)} titulo="Mostrar u ocultar los resultados (R)">
                Resultados
              </BotonPie>
              {puedeRevelar && (
                <BotonPie activo={vista(actActual).revelada} onClick={() => alternarRevelar(actActual)} titulo="Revelar la respuesta orientativa (E)">
                  Revelar
                </BotonPie>
              )}
              <BotonPie activo={!cerrada} onClick={alternarRecepcion} titulo="Cerrar o reabrir la recepción (X)">
                {cerrada ? "Reabrir" : "Recepción"}
              </BotonPie>
            </>
          )}
          <BotonPie activo={demo} onClick={alternarDemo} titulo="Modo demostración: datos ficticios (D)">
            Demo
          </BotonPie>
          <BotonPie activo={qr} onClick={() => setQr((v) => !v)} titulo="QR para ingresar (Q)">
            QR
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

function Pantalla({ slide }: { slide: UcSlide }) {
  switch (slide.t) {
    case "portada":
      return <Portada />;
    case "ingreso":
      return <Ingreso slug={UC_SLUG} />;
    case "lab":
      return (
        <LabMarco lab={slide}>
          {slide.id === "hash" ? <LabHash /> : slide.id === "firma" ? <LabFirma /> : <LabCertWeb />}
        </LabMarco>
      );
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
        "rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:text-uc-verde",
        activo ? "border-uc-verde bg-uc-verde text-white hover:text-white" : "border-uc-linea bg-uc-hoja",
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
      {UC_BLOQUES.map((b, i) => (
        <span
          key={b.num}
          title={`${b.num} · ${b.nombre} (${b.rango} min)`}
          className={cn("h-1.5 rounded-full", i <= actual ? "bg-uc-verde" : "bg-uc-linea", i === actual && "h-2.5")}
          style={{ flexGrow: b.minutos, flexBasis: 0 }}
        />
      ))}
    </span>
  );
}

/** QR para ingresar, sobre cualquier pantalla (para quien llega tarde). */
function QrFlotante({ onCerrar, demo }: { onCerrar: () => void; demo: boolean }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${UC_SLUG}`, 4000);
  return (
    <div className="tf-sube fixed bottom-20 right-16 z-40 flex items-center gap-6 rounded-[1.5rem] border border-uc-linea bg-uc-hoja p-5 pr-8 shadow-[0_24px_60px_-20px_rgba(29,38,41,0.45)]">
      <img src={UC_QR} alt="Código QR para ingresar" className="size-[14rem]" />
      <div className="max-w-[15rem]">
        <p className="uc-rotulo flex items-center gap-2 text-uc-ocre">
          <span className="size-2 animate-pulse rounded-full bg-uc-ocre" />
          Participá desde tu dispositivo
        </p>
        <p className="uc-serif mt-3 text-[1.45rem] font-medium leading-tight text-uc-verde">{UC_LINK}</p>
        <p className="mt-4 text-sm text-uc-pizarra">
          <b className="uc-serif text-[2rem] font-medium text-uc-azul tabular-nums">{demo ? 41 : (data?.participants ?? 0)}</b> conectados
        </p>
        <button onClick={onCerrar} className="mt-4 text-xs text-uc-niebla underline-offset-2 hover:underline">
          Ocultar · Q
        </button>
      </div>
    </div>
  );
}

/** Todas las pantallas de un vistazo (G): saltar a cualquiera con un clic. */
function Grilla({ actual, onIr, onCerrar }: { actual: number; onIr: (i: number) => void; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#f4efe4]/97 px-16 py-10 backdrop-blur-sm" onClick={onCerrar}>
      <div className="mx-auto max-w-[84rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="uc-rotulo text-uc-verde">{UC_DIPLOMATURA}</p>
            <h2 className="uc-titular mt-2 text-[2.4rem] text-uc-tinta">Todas las pantallas</h2>
          </div>
          <button onClick={onCerrar} className="rounded-lg border border-uc-linea bg-uc-hoja px-3 py-1.5 text-sm">
            Cerrar <span className="ml-1 text-xs text-uc-niebla">Esc</span>
          </button>
        </div>
        <div className="mt-8 grid grid-cols-5 gap-3 xl:grid-cols-7">
          {UC_SLIDES.map((s, i) => {
            const act = actDe(s);
            return (
              <button
                key={i}
                onClick={() => onIr(i)}
                className={cn(
                  "flex min-h-[7.5rem] flex-col rounded-xl border bg-uc-hoja p-3 text-left transition hover:border-uc-verde",
                  i === actual ? "border-2 border-uc-verde shadow-md" : act ? "border-uc-ocre/50 bg-uc-ocre-claro/60" : s.t === "lab" ? "border-uc-cian/40 bg-uc-hielo/60" : "border-uc-linea",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-xs tabular-nums text-uc-niebla">{i + 1}</span>
                  {act ? (
                    <span className="text-[0.6rem] font-semibold tracking-widest text-uc-ocre">EN VIVO {act.numero}</span>
                  ) : s.t === "lab" ? (
                    <span className="text-[0.6rem] font-semibold tracking-widest text-uc-cian">LAB</span>
                  ) : s.t === "placa" && s.giro ? (
                    <span className="text-[0.6rem] font-semibold tracking-widest text-uc-verde">GIRO</span>
                  ) : null}
                </span>
                <span className="uc-serif mt-2 line-clamp-3 text-[1rem] leading-snug text-uc-tinta">{tituloSlideUc(s).replace(/^\d+ · /, "").replace(/^🧪 /, "")}</span>
                <span className="mt-auto pt-2 text-[0.65rem] text-uc-niebla">{UC_BLOQUES[s.bloque]?.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
