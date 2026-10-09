"use client";

// Presentación del ciclo del Tribunal Fiscal (motor de /diplomatura con las
// placas del Dr. Leal). La placa manda: al llegar a una placa con actividad,
// la abre sola en los celulares (POST /api/session/<slug>/activity, cookie
// docente). Las placas de contenido no cambian nada: quien llegó tarde puede
// terminar de responder mientras el Dr. Leal sigue.
//
// Revelado paso a paso: en las placas con lista, → muestra los ítems de a uno
// (y al final la conclusión y el banner); ← vuelve un paso. Al volver a una
// placa anterior se ve entera. Tocar un ítem lo destaca y atenúa el resto.
//
// Todo se maneja también desde el celular de control (/tribunal/control):
// ◀ ▶ respetan los pasos, cada ítem visible se puede destacar, y arriba de la
// lista están los interruptores (QR para ingresar, revelado, contraste).
//
// Teclado (también clickers, que mandan PageDown/PageUp):
//   → Espacio PageDown  siguiente paso o pantalla · ← PageUp  anterior
//   Home / End  portada / última · G  grilla de pantallas · Esc  quitar foco
//   Q  QR para ingresar · P  revelado paso a paso sí/no · C  alto contraste
//   R  proyectar las respuestas abiertas (ya revisadas) · + −  tamaño
//   Shift+R  reiniciar la sesión (borra participantes, respuestas y
//   moderación: usar después de ensayar)

import { useCallback, useEffect, useRef, useState } from "react";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { ActividadTf, IngresoTf, PlacaTf, PortadaTf, Recorrido, SintesisTf } from "@/components/tribunal/placas";
import { useModeracion } from "@/components/tribunal/resultados";
import { RevelaCtx } from "@/components/tribunal/revelado";
import { useLive } from "@/components/use-live";
import { rem } from "@/lib/remoto";
import { getActividadTf, pasosPlaca, TF_INSTITUCION, TF_LINK, TF_QR, tituloPlacaTf, type TfClase, type TfSlide } from "@/lib/tribunal";
import { cn } from "@/lib/utils";

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

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

export function DeckTribunal({ clase }: { clase: TfClase }) {
  const total = clase.slides.length;
  const storageKey = `${clase.slug}-placa`;
  const intervalo = clase.config.poll.deck;
  const pasosDe = useCallback((i: number) => {
    const s = clase.slides[i];
    return s?.t === "placa" ? pasosPlaca(s) : 0;
  }, [clase]);

  const [idx, setIdx] = useState(() => {
    const v = parseInt(leer(storageKey) ?? "0", 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), total - 1) : 0;
  });
  // Al recargar, la placa actual se ve entera (no se pierde lo ya mostrado).
  const [paso, setPaso] = useState(() => pasosDe(idx));
  const [foco, setFoco] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(() => leer("tf-revelado") !== "0");
  const [contraste, setContraste] = useState(() => leer("tf-contraste") === "1");
  const [grilla, setGrilla] = useState(false);
  // QR para ingresar sobre cualquier pantalla (se prende y apaga desde el celular).
  const [qr, setQr] = useState(false);
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const lastActivada = useRef<string | null>(null);
  const { moderacion, cambiar } = useModeracion(clase.slug, intervalo);

  /** Ir a una pantalla: desde el principio de su revelado, o entera (al volver). */
  const irA = useCallback(
    (n: number, entera = false) => {
      const next = Math.min(Math.max(n, 0), total - 1);
      setIdx(next);
      setPaso(entera ? pasosDe(next) : 0);
      setFoco(null);
      guardar(storageKey, String(next));
    },
    [total, storageKey, pasosDe],
  );

  const pasosActual = pasosDe(idx);
  const conPasos = revelado && pasosActual > 0;

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

  const slide = clase.slides[idx];

  const activar = useCallback(
    (key: string) => {
      lastActivada.current = key;
      setEstado({ key, status: "enviando" });
      fetch(`/api/session/${clase.slug}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: key }),
      })
        .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
        .catch(() => setEstado({ key, status: "error" }));
    },
    [clase.slug],
  );

  // La placa manda: si tiene actividad asociada, se activa sola.
  useEffect(() => {
    const key = "activa" in slide ? slide.activa : undefined;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [slide, activar]);

  const proyectar = useCallback((activity: string, valor: boolean) => cambiar({ activity, proyectar: valor }), [cambiar]);

  const alternarRevelado = useCallback(() => {
    setRevelado((r) => {
      guardar("tf-revelado", r ? "0" : "1");
      return !r;
    });
    setPaso(pasosDe(idx)); // la placa actual queda entera
  }, [idx, pasosDe]);

  const alternarContraste = useCallback(() => {
    setContraste((c) => {
      guardar("tf-contraste", c ? "0" : "1");
      return !c;
    });
  }, []);

  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes, sus respuestas y la moderación.")) return;
      await fetch(`/api/session/${clase.slug}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await cambiar({ reiniciar: true });
      const actual = clase.slides[idx];
      if ("activa" in actual) activar(actual.activa);
    }
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (grilla) {
        if (e.key === "Escape" || e.key === "g" || e.key === "G") setGrilla(false);
        return;
      }
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        avanzar();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        retroceder();
      } else if (e.key === "Home") irA(0);
      else if (e.key === "End") irA(total - 1, true);
      else if (e.key === "Escape") setFoco(null);
      else if (e.key === "g" || e.key === "G") setGrilla(true);
      else if (e.key === "q" || e.key === "Q") setQr((v) => !v);
      else if (e.key === "p" || e.key === "P") alternarRevelado();
      else if (e.key === "c" || e.key === "C") alternarContraste();
      else if (e.key === "R" && e.shiftKey) reiniciar();
      else if (e.key === "r") {
        // Proyectar u ocultar las respuestas abiertas de la placa actual.
        const keys = slide.t === "actividad" ? [slide.activa] : slide.t === "sintesis" ? slide.actividades : [];
        const abiertas = keys.filter((k) => getActividadTf(clase, k)?.moderada);
        if (!abiertas.length) return;
        const mostrar = !abiertas.every((k) => moderacion[k]?.proyectar);
        abiertas.forEach((k) => proyectar(k, mostrar));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grilla, avanzar, retroceder, irA, total, idx, activar, cambiar, clase, slide, moderacion, proyectar, alternarRevelado, alternarContraste]);

  const tramo = clase.tramos[slide.tramo];

  // Control desde el celular del equipo (/tribunal/control): ◀ ▶ respetan los pasos.
  useRemotoDeck({
    slug: clase.slug,
    idx,
    total,
    titulo: `${tituloPlacaTf(clase, slide)}${conPasos ? ` · paso ${paso}/${pasosActual}` : ""}`,
    parte: tramo ? `${tramo.rango} · ${tramo.nombre}` : undefined,
    nota: "nota" in slide ? slide.nota : undefined,
    go: (n) => (n === idx + 1 ? avanzar() : n === idx - 1 ? retroceder() : irA(n)),
  });

  const { zoom, aviso: avisoZoom } = useZoomDeck();
  const estadoNombre = estado ? (getActividadTf(clase, estado.key)?.titulo ?? "En espera") : "";
  const revela = {
    visibles: conPasos ? paso : Infinity,
    foco,
    alternarFoco: (i: number) => setFoco((f) => (f === i ? null : i)),
  };

  return (
    <div className={cn("deck-escala relative flex min-h-dvh flex-col overflow-hidden bg-tf-papel text-tf-tinta", contraste && "tf-contraste")}>
      <AvisoZoom zoom={zoom} visible={avisoZoom} />

      <RevelaCtx.Provider value={revela}>
        <main key={idx} className="mx-auto flex w-full max-w-[84rem] flex-1 flex-col px-16 pb-24 pt-14">
          {/* Interruptores para el celular de control (no se ven en el proyector). */}
          <div className="sr-only">
            <button onClick={() => setQr((v) => !v)} {...rem("🔳 QR para ingresar", qr)}>
              QR para ingresar
            </button>
            {foco !== null && (
              <button onClick={() => setFoco(null)} {...rem("✕ Quitar el foco")}>
                Quitar el foco
              </button>
            )}
            <button onClick={alternarRevelado} {...rem("▶ Revelado paso a paso", revelado)}>
              Revelado paso a paso
            </button>
            <button onClick={alternarContraste} {...rem("◐ Alto contraste", contraste)}>
              Alto contraste
            </button>
          </div>
          <Slide clase={clase} slide={slide} moderacion={moderacion} onProyectar={proyectar} intervalo={intervalo} />
        </main>
      </RevelaCtx.Provider>

      {qr && <QrFlotante slug={clase.slug} onCerrar={() => setQr(false)} />}

      <footer className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-6 bg-gradient-to-t from-tf-papel via-tf-papel/95 to-transparent px-16 pb-4 pt-6 text-sm text-tf-pizarra">
        <span className="min-w-0 flex-1 truncate">{slide.t !== "portada" && TF_INSTITUCION}</span>
        {tramo && (
          <span className="hidden items-center gap-3 md:flex">
            <Recorrido clase={clase} actual={slide.tramo} />
            <span className="text-xs text-tf-niebla">
              {tramo.rango} · {tramo.nombre}
            </span>
          </span>
        )}
        <span className="flex flex-1 items-center justify-end gap-3 whitespace-nowrap">
          {estado && (
            <span
              className={cn(
                "hidden max-w-[22rem] items-center gap-2 truncate rounded-full px-3 py-1 text-xs font-medium lg:flex",
                estado.status === "error" ? "bg-tf-lacre/10 text-tf-lacre" : "bg-tf-ocre-claro text-tf-ocre",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", estado.status === "error" ? "bg-tf-lacre" : "animate-pulse bg-tf-ocre")} />
              <span className="truncate">
                {estado.status === "enviando" && "abriendo…"}
                {estado.status === "ok" && <>en los celulares: {estadoNombre}</>}
                {estado.status === "error" && "no se pudo abrir la actividad: vuelva a ingresar la clave"}
              </span>
            </span>
          )}
          {conPasos && (
            <span className="flex items-center gap-1" aria-label={`Paso ${paso} de ${pasosActual}`}>
              {Array.from({ length: pasosActual }, (_, i) => (
                <span key={i} className={cn("size-1.5 rounded-full", i < paso ? "bg-tf-petroleo" : "bg-tf-linea")} />
              ))}
            </span>
          )}
          <button
            onClick={() => setQr((v) => !v)}
            className={cn("rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition hover:text-tf-petroleo", qr ? "border-tf-petroleo bg-tf-petroleo text-white" : "border-tf-linea bg-white")}
            title="QR para ingresar (Q)"
          >
            QR
          </button>
          <button onClick={() => setGrilla(true)} className="rounded-lg border border-tf-linea bg-white px-2.5 py-1.5 transition hover:text-tf-petroleo" title="Todas las pantallas (G)">
            ▦
          </button>
          <button
            onClick={alternarContraste}
            className={cn("rounded-lg border px-2.5 py-1.5 transition hover:text-tf-petroleo", contraste ? "border-tf-tinta bg-tf-tinta text-white" : "border-tf-linea bg-white")}
            title="Alto contraste (C)"
          >
            ◐
          </button>
          <button onClick={retroceder} className="rounded-lg border border-tf-linea bg-white px-3 py-1.5 transition hover:text-tf-petroleo" aria-label="Anterior">
            ◀
          </button>
          <span className="tabular-nums">
            {idx + 1} / {total}
          </span>
          <button onClick={avanzar} className="rounded-lg border border-tf-linea bg-white px-3 py-1.5 transition hover:text-tf-petroleo" aria-label="Siguiente">
            ▶
          </button>
        </span>
      </footer>

      {grilla && (
        <Grilla
          clase={clase}
          actual={idx}
          onIr={(i) => {
            irA(i);
            setGrilla(false);
          }}
          onCerrar={() => setGrilla(false)}
          revelado={revelado}
          onRevelado={alternarRevelado}
        />
      )}
    </div>
  );
}

function Slide({
  clase,
  slide,
  moderacion,
  onProyectar,
  intervalo,
}: {
  clase: TfClase;
  slide: TfSlide;
  moderacion: ReturnType<typeof useModeracion>["moderacion"];
  onProyectar: (activity: string, valor: boolean) => void;
  intervalo: number;
}) {
  switch (slide.t) {
    case "portada":
      return <PortadaTf clase={clase} />;
    case "ingreso":
      return <IngresoTf clase={clase} />;
    case "placa":
      return <PlacaTf clase={clase} placa={slide} intervalo={intervalo} />;
    case "actividad":
      return <ActividadTf clase={clase} slide={slide} moderacion={moderacion} onProyectar={onProyectar} intervalo={intervalo} />;
    case "sintesis":
      return <SintesisTf clase={clase} slide={slide} moderacion={moderacion} onProyectar={onProyectar} intervalo={intervalo} />;
  }
}

/** QR para ingresar, sobre cualquier pantalla: para los que llegan tarde o se desconectaron. */
function QrFlotante({ slug, onCerrar }: { slug: string; onCerrar: () => void }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 4000);
  return (
    <div className="tf-sube fixed bottom-20 right-16 z-40 flex items-center gap-6 rounded-[1.5rem] border border-tf-linea bg-white p-5 pr-8 shadow-[0_24px_60px_-20px_rgba(23,33,43,0.45)]">
      <img src={TF_QR} alt="Código QR para ingresar" className="size-[15rem]" />
      <div className="max-w-[15rem]">
        <p className="tf-rotulo flex items-center gap-2 text-tf-ocre">
          <span className="size-2 animate-pulse rounded-full bg-tf-ocre" />
          Participe desde su celular
        </p>
        <p className="tf-serif mt-3 text-[1.5rem] font-medium leading-tight text-tf-petroleo">{TF_LINK}</p>
        <p className="mt-4 text-sm text-tf-pizarra">
          <b className="tf-serif text-[2rem] font-medium text-tf-azul tabular-nums">{data?.participants ?? 0}</b> conectados
        </p>
        <button onClick={onCerrar} className="mt-4 text-xs text-tf-niebla underline-offset-2 hover:underline">
          Ocultar · Q
        </button>
      </div>
    </div>
  );
}

/** Todas las pantallas de un vistazo (tecla G): saltar a cualquiera con un clic. */
function Grilla({
  clase,
  actual,
  onIr,
  onCerrar,
  revelado,
  onRevelado,
}: {
  clase: TfClase;
  actual: number;
  onIr: (i: number) => void;
  onCerrar: () => void;
  revelado: boolean;
  onRevelado: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-tf-papel/97 px-16 py-10 backdrop-blur-sm" onClick={onCerrar}>
      <div className="mx-auto max-w-[84rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <p className="tf-rotulo text-tf-petroleo">{clase.etiqueta}</p>
            <h2 className="tf-titular mt-2 text-[2.4rem] text-tf-tinta">Todas las pantallas</h2>
          </div>
          <div className="flex items-center gap-3 text-sm text-tf-pizarra">
            <button
              onClick={onRevelado}
              className={cn("rounded-lg border px-3 py-1.5 transition", revelado ? "border-tf-petroleo bg-tf-petroleo/10 text-tf-petroleo" : "border-tf-linea bg-white")}
            >
              Revelado paso a paso: {revelado ? "sí" : "no"} <span className="ml-1 text-xs text-tf-niebla">P</span>
            </button>
            <button onClick={onCerrar} className="rounded-lg border border-tf-linea bg-white px-3 py-1.5">
              Cerrar <span className="ml-1 text-xs text-tf-niebla">Esc</span>
            </button>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-3 xl:grid-cols-6">
          {clase.slides.map((s, i) => {
            const vivo = s.t === "actividad" || s.t === "sintesis" || s.t === "ingreso";
            return (
              <button
                key={i}
                onClick={() => onIr(i)}
                className={cn(
                  "flex min-h-[7.5rem] flex-col rounded-xl border bg-white p-3 text-left transition hover:border-tf-petroleo",
                  i === actual ? "border-2 border-tf-petroleo shadow-md" : vivo ? "border-tf-ocre/50 bg-tf-ocre-claro/50" : "border-tf-linea",
                )}
              >
                <span className="flex items-center justify-between">
                  <span className="text-xs tabular-nums text-tf-niebla">{i + 1}</span>
                  {s.t === "placa" ? (
                    <span className="rounded bg-tf-celeste px-1.5 text-xs font-semibold text-tf-azul">{s.num}</span>
                  ) : vivo ? (
                    <span className="text-[0.6rem] font-semibold tracking-widest text-tf-ocre">EN VIVO</span>
                  ) : null}
                </span>
                <span className="tf-serif mt-2 line-clamp-3 text-[1.02rem] leading-snug text-tf-tinta">
                  {tituloPlacaTf(clase, s).replace(/^🗳️\s*/, "").replace(/^\d+ · /, "")}
                </span>
                <span className="mt-auto pt-2 text-[0.65rem] text-tf-niebla">{clase.tramos[s.tramo]?.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
