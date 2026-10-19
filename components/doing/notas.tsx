"use client";

// Notas del orador de /doing en una ventana aparte (tecla N en la
// presentación). En Zoom se comparte solo la ventana de la presentación:
// esta queda para el docente. Es el panel de conducción: sigue la pantalla en
// vivo por un BroadcastChannel (misma computadora y navegador), muestra el
// guion, el tiempo y lo que sigue, abre y cierra la recepción, muestra y
// revela resultados, modera la nube y exporta los resultados de la sala.

import { useEffect, useRef, useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { CANAL_DG, type MensajeDeck } from "@/components/doing/canal";
import { useModeracion } from "@/components/tribunal/resultados";
import { DG_ACTIVIDADES, DG_BLOQUES, DG_MINUTOS, DG_SLIDES, DG_SLUG, DG_TITULO, getDgActividad, tituloSlideDg, type DgActividad } from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

type Estado = Extract<MensajeDeck, { tipo: "estado" }>;

export function NotasDoing() {
  const [estado, setEstado] = useState<Estado | null>(null);
  const [visto, setVisto] = useState(0);
  const [guion, setGuion] = useState(false);
  const canal = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(CANAL_DG);
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

  const slide = estado ? DG_SLIDES[estado.idx] : null;
  const siguiente = estado ? DG_SLIDES[estado.idx + 1] : null;
  const act = slide?.t === "actividad" ? getDgActividad(slide.activa) : undefined;

  return (
    <div className="dg dg-papel min-h-dvh text-dg-tinta">
      <header className="sticky top-0 z-10 border-b border-dg-linea bg-dg-hoja/95 px-5 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-dg-verde">📝 Notas del orador · no compartir</p>
          <span className={cn("flex items-center gap-1.5 text-xs", conectado ? "text-dg-verde" : "text-dg-lacre")}>
            <span className={cn("size-2 rounded-full", conectado ? "animate-pulse bg-dg-verde" : "bg-dg-lacre")} />
            {conectado ? "presentación conectada" : "abrí la presentación en otra pestaña"}
          </span>
        </div>
        <Cronometro />
      </header>

      <main className="space-y-4 px-5 py-4 pb-32">
        {!slide ? (
          <p className="pt-10 text-center text-dg-pizarra">Esperando la presentación (/doing/clase, en este mismo navegador)…</p>
        ) : (
          <>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-dg-pizarra">
                {estado!.idx + 1} / {DG_SLIDES.length} · Bloque {DG_BLOQUES[slide.bloque].num} · minuto {slide.minuto}
                {estado!.pasos > 0 && ` · paso ${estado!.paso}/${estado!.pasos}`}
              </p>
              <h1 className="dg-serif mt-1 text-3xl leading-tight">{tituloSlideDg(slide)}</h1>
              {estado!.demo && <p className="mt-1 text-xs font-semibold text-dg-lacre">MODO DEMOSTRACIÓN · resultados ilustrativos en pantalla</p>}
            </div>
            <div className="rounded-2xl border border-dg-ocre/50 bg-dg-ocre-claro/70 p-4">
              <p className="whitespace-pre-line text-[1.08rem] leading-relaxed">{slide.nota}</p>
            </div>

            {act && (
              <div className="grid gap-2 rounded-2xl border border-dg-linea bg-dg-hoja p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-dg-ocre">
                  Experiencia {act.numero} · {act.titulo} · máx. {act.duracion} min
                </p>
                <Conteo act={act} />
                <div className="grid grid-cols-3 gap-2">
                  <Accion activo={estado!.mostrar} onClick={() => enviar({ tipo: "cmd", accion: "mostrar" })}>
                    {estado!.mostrar ? "Ocultar resultados" : "Mostrar resultados"}
                  </Accion>
                  <Accion activo={estado!.revelada} onClick={() => enviar({ tipo: "cmd", accion: "revelar" })} deshabilitado={!(act.revela || act.correcta || act.clasificacion)}>
                    {estado!.revelada ? "Ocultar orientación" : "Revelar orientación"}
                  </Accion>
                  <Accion activo={!estado!.cerrada} onClick={() => enviar({ tipo: "cmd", accion: "recepcion" })}>
                    {estado!.cerrada ? "Reabrir recepción" : "Cerrar recepción"}
                  </Accion>
                </div>
                {act.kind === "palabra" && <Moderar act={act} />}
              </div>
            )}

            {siguiente && (
              <p className="text-sm text-dg-pizarra">
                <span className="font-semibold uppercase tracking-widest text-dg-niebla">Sigue · </span>
                {tituloSlideDg(siguiente)}
              </p>
            )}

            <div className="flex flex-wrap gap-2 pt-2">
              <Accion activo={estado!.demo} onClick={() => enviar({ tipo: "cmd", accion: "demo" })}>
                Modo demostración
              </Accion>
              <Accion onClick={() => setGuion(true)}>Guion completo</Accion>
              <Exportar />
            </div>
          </>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 grid grid-cols-2 gap-2 border-t border-dg-linea bg-dg-hoja/95 p-3 backdrop-blur">
        <button onClick={() => enviar({ tipo: "cmd", accion: "ant" })} className="h-14 rounded-2xl border border-dg-linea bg-dg-papel text-xl font-bold">
          ◀
        </button>
        <button onClick={() => enviar({ tipo: "cmd", accion: "sig" })} className="h-14 rounded-2xl bg-dg-verde text-xl font-bold text-white">
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
        activo ? "border-dg-verde bg-dg-verde text-white" : "border-dg-linea bg-dg-papel text-dg-tinta",
      )}
    >
      {children}
    </button>
  );
}

/** Participantes conectados y respuestas recibidas (distintas: un participante puede no responder). */
function Conteo({ act }: { act: DgActividad }) {
  const { data } = useResultados(DG_SLUG, act.key, 2500);
  return (
    <p className="text-sm text-dg-pizarra">
      <b className="text-lg text-dg-tinta">{data?.responded ?? 0}</b> respondieron de <b className="text-lg text-dg-tinta">{data?.participants ?? 0}</b> conectados
    </p>
  );
}

/** Cronómetro de la clase (90 minutos). */
function Cronometro() {
  const [inicio, setInicio] = useState<number | null>(() => {
    try {
      const v = Number(localStorage.getItem("dg-inicio"));
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
      if (v) localStorage.setItem("dg-inicio", String(v));
      else localStorage.removeItem("dg-inicio");
    } catch {}
  }
  return (
    <div className="mt-2 flex items-center gap-3">
      <span className={cn("dg-maquina text-2xl tabular-nums", seg > DG_MINUTOS * 60 ? "text-dg-lacre" : "text-dg-tinta")}>
        {mm}:{ss}
      </span>
      <span className="text-xs text-dg-niebla">de {DG_MINUTOS}:00</span>
      <button onClick={() => cambiar(inicio ? null : Date.now())} className="ml-auto rounded-lg border border-dg-linea px-3 py-1 text-xs font-semibold">
        {inicio ? "Reiniciar" : "▶ Empezar la clase"}
      </button>
    </div>
  );
}

/** Moderación de la nube: lo que se oculta desaparece al instante de la pantalla. */
function Moderar({ act }: { act: DgActividad }) {
  const { data } = useResultados(DG_SLUG, act.key, 2500);
  const { moderacion, cambiar } = useModeracion(DG_SLUG, 2500);
  const ocultas = moderacion[act.key]?.ocultas ?? [];
  const palabras = (data?.summary.palabras as { palabra: string; n: number }[]) ?? [];
  return (
    <div className="mt-2">
      <p className="text-xs text-dg-pizarra">Tocá una palabra para ocultarla de la pantalla (contenido inapropiado o datos personales), o para volver a mostrarla.</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {!palabras.length && <span className="text-sm text-dg-niebla">Sin palabras todavía.</span>}
        {palabras.map((p) => {
          const oculta = ocultas.includes(p.palabra);
          return (
            <button
              key={p.palabra}
              onClick={() => cambiar({ activity: act.key, valor: p.palabra, oculta: !oculta })}
              className={cn("rounded-full border px-3 py-1 text-sm", oculta ? "border-dg-lacre/40 bg-dg-lacre-claro text-dg-lacre line-through" : "border-dg-linea bg-dg-papel")}
            >
              {p.palabra} <span className="text-xs text-dg-niebla">×{p.n}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Exporta los resultados agregados de las seis experiencias (anónimos) en JSON. */
function Exportar() {
  const [estado, setEstado] = useState("");
  async function exportar() {
    setEstado("…");
    try {
      const resultados = await Promise.all(
        DG_ACTIVIDADES.map(async (a) => {
          const r = await fetch(`/api/session/${DG_SLUG}/results?activity=${a.key}`, { cache: "no-store" }).then((x) => x.json());
          return { experiencia: a.numero, titulo: a.titulo, formato: a.formato, participantes: r.participants, respondieron: r.responded, resumen: r.summary };
        }),
      );
      const blob = new Blob([JSON.stringify({ clase: DG_TITULO, exportado: new Date().toISOString(), resultados }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doing-global-resultados-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setEstado("");
    } catch {
      setEstado("no se pudo");
    }
  }
  return <Accion onClick={exportar}>{estado ? `Exportar resultados ${estado}` : "⬇ Exportar resultados"}</Accion>;
}

/** El guion completo: todas las pantallas con sus notas (para preparar la clase o imprimir). */
function Guion({ onCerrar }: { onCerrar: () => void }) {
  return (
    <div className="dg acta-imprimible min-h-dvh bg-white px-8 py-8 text-dg-tinta print:px-0">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <button onClick={onCerrar} className="rounded-lg border border-dg-linea px-3 py-1.5 text-sm">
            ← Volver a las notas en vivo
          </button>
          <button onClick={() => window.print()} className="rounded-lg bg-dg-verde px-3 py-1.5 text-sm font-semibold text-white">
            Imprimir o guardar en PDF
          </button>
        </div>
        <h1 className="dg-serif mt-6 text-4xl">Guion · {DG_TITULO}</h1>
        <p className="mt-1 text-sm text-dg-pizarra">
          Notas del orador por pantalla. {DG_MINUTOS} minutos, 5 bloques, 24 placas, 4 demostraciones, 6 experiencias y un laboratorio de skills.
        </p>
        {DG_BLOQUES.map((b, bi) => (
          <section key={b.num} className="mt-8 break-inside-avoid-page">
            <h2 className="border-b border-dg-linea pb-1 text-lg font-bold text-dg-verde">
              Bloque {b.num} · {b.nombre} · min {b.rango}
            </h2>
            {DG_SLIDES.map((s, i) =>
              s.bloque === bi ? (
                <div key={i} className="mt-4 break-inside-avoid">
                  <p className="text-sm font-semibold">
                    {i + 1}. {tituloSlideDg(s)} <span className="font-normal text-dg-niebla">· min {s.minuto}</span>
                  </p>
                  <p className="mt-1 whitespace-pre-line text-[0.95rem] leading-relaxed text-dg-pizarra">{s.nota}</p>
                </div>
              ) : null,
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
