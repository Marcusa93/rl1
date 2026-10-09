"use client";

// Notas del orador de /unca, en una ventana aparte (tecla N en la
// presentación). En la videollamada se comparte solo la ventana de la
// presentación: esta queda para el docente. Sigue la placa en vivo por un
// BroadcastChannel (misma computadora y mismo navegador), muestra el guion,
// el tiempo y la placa que sigue, y permite moderar la nube de palabras.

import { useEffect, useRef, useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useModeracion } from "@/components/tribunal/resultados";
import { CANAL_UC, type MensajeDeck } from "@/components/unca/canal";
import { getUcActividad, tituloSlideUc, UC_BLOQUES, UC_SLIDES, UC_SLUG, type UcActividad } from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

type Estado = Extract<MensajeDeck, { tipo: "estado" }>;

export function NotasUnca() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [visto, setVisto] = useState(0);
  const [guion, setGuion] = useState(false);
  const canal = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(CANAL_UC);
    canal.current = bc;
    bc.onmessage = (e: MessageEvent<MensajeDeck>) => {
      if (e.data?.tipo === "estado") {
        setEstado(e.data);
        setVisto(Date.now());
      }
    };
    bc.postMessage({ tipo: "cmd", accion: "pedir" } satisfies MensajeDeck);
    const id = setInterval(() => bc.postMessage({ tipo: "cmd", accion: "pedir" } satisfies MensajeDeck), 5000);
    return () => {
      clearInterval(id);
      bc.close();
    };
  }, []);

  const enviar = (m: MensajeDeck) => canal.current?.postMessage(m);
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const conectado = estado && ahora - visto < 12000;

  if (guion) return <Guion onCerrar={() => setGuion(false)} />;

  const slide = estado ? UC_SLIDES[estado.idx] : null;
  const siguiente = estado ? UC_SLIDES[estado.idx + 1] : null;
  const act = slide?.t === "placa" && slide.activa ? getUcActividad(slide.activa) : undefined;

  return (
    <div className="uc uc-papel min-h-dvh text-uc-tinta">
      <header className="sticky top-0 z-10 border-b border-uc-linea bg-uc-hoja/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-uc-verde">📝 Notas del orador · no compartir</p>
          <span className={cn("flex items-center gap-1.5 text-xs", conectado ? "text-uc-verde" : "text-uc-lacre")}>
            <span className={cn("size-2 rounded-full", conectado ? "animate-pulse bg-uc-verde" : "bg-uc-lacre")} />
            {conectado ? "presentación conectada" : "abrí la presentación en otra pestaña"}
          </span>
        </div>
        <Cronometro />
      </header>

      <main className="space-y-4 px-5 py-4 pb-32">
        {!slide ? (
          <p className="pt-10 text-center text-uc-pizarra">Esperando la presentación (/unca/clase, en este mismo navegador)…</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-uc-pizarra">
                {estado!.idx + 1} / {UC_SLIDES.length} · Bloque {UC_BLOQUES[slide.bloque].num} · minuto {slide.minuto}
                {estado!.pasos > 0 && ` · paso ${estado!.paso}/${estado!.pasos}`}
              </p>
              <h1 className="uc-serif mt-1 text-2xl leading-tight">{tituloSlideUc(slide)}</h1>
              {estado!.demo && <p className="mt-1 text-xs font-semibold text-uc-lacre">MODO DEMOSTRACIÓN · datos ficticios en pantalla</p>}
            </div>
            <div className="rounded-2xl border border-uc-ocre/50 bg-uc-ocre-claro/70 p-4">
              <p className="whitespace-pre-line text-[1.08rem] leading-relaxed">{slide.nota}</p>
            </div>

            {act && (
              <div className="grid gap-2 rounded-2xl border border-uc-linea bg-uc-hoja p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-uc-ocre">
                  Intervención {act.numero} · {act.titulo}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Accion activo={estado!.mostrar} onClick={() => enviar({ tipo: "cmd", accion: "mostrar" })}>
                    {estado!.mostrar ? "Ocultar resultados" : "Mostrar resultados"}
                  </Accion>
                  <Accion activo={estado!.revelada} onClick={() => enviar({ tipo: "cmd", accion: "revelar" })} deshabilitado={!(act.revela || act.correcta || act.clasificacion)}>
                    {estado!.revelada ? "Ocultar respuesta" : "Revelar respuesta"}
                  </Accion>
                  <Accion activo={!estado!.cerrada} onClick={() => enviar({ tipo: "cmd", accion: "recepcion" })}>
                    {estado!.cerrada ? "Reabrir recepción" : "Cerrar recepción"}
                  </Accion>
                </div>
                {act.kind === "palabra" && <Moderar act={act} />}
              </div>
            )}

            {siguiente && (
              <p className="text-sm text-uc-pizarra">
                <span className="font-semibold uppercase tracking-widest text-uc-niebla">Sigue · </span>
                {tituloSlideUc(siguiente)}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Accion activo={estado!.demo} onClick={() => enviar({ tipo: "cmd", accion: "demo" })}>
                Modo demostración
              </Accion>
              <Accion onClick={() => setGuion(true)}>Guion completo</Accion>
            </div>
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-2 gap-2 border-t border-uc-linea bg-uc-hoja/95 p-3 backdrop-blur">
        <button onClick={() => enviar({ tipo: "cmd", accion: "ant" })} className="h-14 rounded-2xl border border-uc-linea bg-uc-papel text-xl font-bold">
          ◀
        </button>
        <button onClick={() => enviar({ tipo: "cmd", accion: "sig" })} className="h-14 rounded-2xl bg-uc-verde text-xl font-bold text-white">
          ▶
        </button>
      </nav>
    </div>
  );
}

function Accion({ children, onClick, activo, deshabilitado }: { children: React.ReactNode; onClick: () => void; activo?: boolean; deshabilitado?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={deshabilitado}
      className={cn(
        "rounded-xl border px-3 py-2 text-sm font-semibold transition disabled:opacity-30",
        activo ? "border-uc-verde bg-uc-verde text-white" : "border-uc-linea bg-uc-papel text-uc-tinta",
      )}
    >
      {children}
    </button>
  );
}

/** Cronómetro de la clase (80 minutos), para saber si vamos en tiempo. */
function Cronometro() {
  const [inicio, setInicio] = useState<number | null>(() => {
    try {
      const v = Number(localStorage.getItem("uc-inicio"));
      return v > 0 ? v : null;
    } catch {
      return null;
    }
  });
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  const seg = inicio ? Math.floor((Date.now() - inicio) / 1000) : 0;
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");
  function cambiar(v: number | null) {
    setInicio(v);
    try {
      if (v) localStorage.setItem("uc-inicio", String(v));
      else localStorage.removeItem("uc-inicio");
    } catch {}
  }
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className={cn("uc-mono text-2xl tabular-nums", seg > 80 * 60 ? "text-uc-lacre" : "text-uc-tinta")}>
        {mm}:{ss}
      </span>
      <span className="text-xs text-uc-niebla">de 80:00</span>
      <button onClick={() => cambiar(inicio ? null : Date.now())} className="ml-auto rounded-lg border border-uc-linea px-3 py-1 text-xs font-semibold">
        {inicio ? "Reiniciar" : "▶ Empezar la clase"}
      </button>
    </div>
  );
}

/** Moderación de la nube: lo que se oculta desaparece al instante de la pantalla. */
function Moderar({ act }: { act: UcActividad }) {
  const { data } = useResultados(UC_SLUG, act.key, 2500);
  const { moderacion, cambiar } = useModeracion(UC_SLUG, 2500);
  const ocultas = moderacion[act.key]?.ocultas ?? [];
  const palabras = (data?.summary.palabras as { palabra: string; n: number }[]) ?? [];
  return (
    <div className="mt-2">
      <p className="text-xs text-uc-pizarra">Tocá una palabra para ocultarla de la pantalla (o volver a mostrarla).</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {!palabras.length && <span className="text-sm text-uc-niebla">Sin palabras todavía.</span>}
        {palabras.map((p) => {
          const oculta = ocultas.includes(p.palabra);
          return (
            <button
              key={p.palabra}
              onClick={() => cambiar({ activity: act.key, valor: p.palabra, oculta: !oculta })}
              className={cn("rounded-full border px-3 py-1 text-sm", oculta ? "border-uc-lacre/40 bg-uc-lacre-claro text-uc-lacre line-through" : "border-uc-linea bg-uc-papel")}
            >
              {p.palabra} <span className="text-xs text-uc-niebla">×{p.n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** El guion completo: todas las pantallas con sus notas (para preparar la clase o imprimir). */
function Guion({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="uc acta-imprimible min-h-dvh bg-white px-8 py-8 text-uc-tinta print:px-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <button onClick={onCerrar} className="rounded-lg border border-uc-linea px-3 py-1.5 text-sm">
            ← Volver a las notas en vivo
          </button>
          <button onClick={() => window.print()} className="rounded-lg bg-uc-verde px-3 py-1.5 text-sm font-semibold text-white">
            Imprimir o guardar en PDF
          </button>
        </div>
        <h1 className="uc-serif mt-6 text-3xl">Guion de la clase · La arquitectura de la confianza digital</h1>
        <p className="mt-1 text-sm text-uc-pizarra">Notas del orador por placa. 80 minutos, 5 bloques, 8 intervenciones.</p>
        {UC_BLOQUES.map((b, bi) => (
          <section key={b.num} className="mt-8 break-inside-avoid-page">
            <h2 className="border-b border-uc-linea pb-1 text-lg font-bold text-uc-verde">
              Bloque {b.num} · {b.nombre} · min {b.rango}
            </h2>
            {UC_SLIDES.map((s, i) =>
              s.bloque === bi ? (
                <div key={i} className="mt-4 break-inside-avoid">
                  <p className="text-sm font-semibold">
                    {i + 1}. {tituloSlideUc(s)} <span className="font-normal text-uc-niebla">· min {s.minuto}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-uc-pizarra">{s.nota}</p>
                </div>
              ) : null,
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
