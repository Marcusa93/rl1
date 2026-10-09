"use client";

// El celular del participante sigue la presentación del Tribunal Fiscal:
// muestra la placa que se proyecta (el texto del Dr. Leal, en letra grande y
// sin diagramas) y permite volver a las anteriores, nunca adelantarse.
// Cuando se proyecta una actividad, la actividad va primero; si no, la placa
// arriba y debajo la actividad que sigue abierta (para quien llegó tarde).

import { Component, useState, type ReactNode } from "react";
import { getActividadTf, lineasPlaca, TF_INSTITUCION, type TfClase, type TfSlide } from "@/lib/tribunal";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Si algo de este panel falla, el celular sigue mostrando la actividad. */
class Blindaje extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

/** Marca tipográfica del ciclo (en lugar del logo RL1 en la app del participante). */
export function MarcaTribunal() {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <span className="tf-serif flex size-8 items-center justify-center rounded-lg bg-tf-azul text-sm font-semibold text-white">TF</span>
      <span className="text-left leading-tight">
        <span className="block whitespace-nowrap text-[0.7rem] font-semibold text-tf-tinta">Tribunal Fiscal</span>
        <span className="block whitespace-nowrap text-[0.65rem] text-tf-pizarra">Tucumán · IA 2026</span>
      </span>
    </span>
  );
}

export function SeguimientoTribunal({
  clase,
  session,
  placa,
  actividad,
}: {
  clase: TfClase;
  session: SessionRow;
  placa: PlacaVivo | null;
  actividad: ReactNode;
}) {
  const abierta = getActividadTf(clase, session.current_activity);
  const panel = abierta ? actividad : <Espera />;
  return (
    <Blindaje fallback={panel}>
      <Seguimiento clase={clase} placa={placa} actividad={panel} />
    </Blindaje>
  );
}

function Espera() {
  return (
    <div className="rounded-3xl border border-line bg-panel/40 p-5 text-center">
      <p className="text-sm text-muted">Cuando se abra una actividad, va a aparecer acá.</p>
    </div>
  );
}

/** Para el control del equipo: la placa tal como la ve el participante (solo lectura). */
export function VistaParticipante({ clase, idx }: { clase: TfClase; idx: number }) {
  const slide = clase.slides[idx];
  if (!slide) return null;
  return (
    <Blindaje fallback={null}>
      <VistaPlaca clase={clase} slide={slide} />
      {(slide.t === "actividad" || slide.t === "ingreso") && <PreviaActividad clase={clase} activa={slide.activa} />}
    </Blindaje>
  );
}

/** Lo que el participante tiene para responder, sin poder enviarlo. */
function PreviaActividad({ clase, activa }: { clase: TfClase; activa: string }) {
  const act = getActividadTf(clase, activa);
  if (!act) return null;
  const Opcion = ({ emoji, label }: { emoji: string; label: string }) => (
    <p className="rounded-xl border border-line bg-ink-2/60 px-3 py-2 text-base">
      {emoji} {label}
    </p>
  );
  return (
    <Marco>
      <p className="text-xs font-bold uppercase tracking-widest text-teal">🗳️ En el celular</p>
      <div className="mt-3 grid gap-2">
        {act.opciones?.map((o) => <Opcion key={o.id} emoji={o.emoji} label={o.label} />)}
        {act.preguntas?.slice(0, 3).map((p) => (
          <div key={p.id} className="grid gap-1.5">
            <p className="mt-1 text-base font-semibold">{p.q}</p>
            {p.opciones.map((o) => (
              <Opcion key={o.id} emoji={o.emoji} label={o.label} />
            ))}
          </div>
        ))}
        {(act.preguntas?.length ?? 0) > 3 && <p className="text-sm text-faint">… y {(act.preguntas?.length ?? 0) - 3} tareas más</p>}
        {act.kind === "palabra" && <p className="rounded-xl border border-line bg-ink-2/60 px-3 py-2 text-base text-faint">[ una palabra ]</p>}
        {act.kind === "texto" && <p className="rounded-xl border border-line bg-ink-2/60 px-3 py-2 text-base text-faint">[ respuesta escrita ]</p>}
      </div>
    </Marco>
  );
}

/** Placas en las que la pregunta va primero en el celular (la portada y el ingreso ya abren el perfil). */
const esActividad = (s: TfSlide) => s.t !== "placa";

function Seguimiento({ clase, placa, actividad }: { clase: TfClase; placa: PlacaVivo | null; actividad: ReactNode }) {
  const [viendo, setViendo] = useState<number | null>(null);
  const total = clase.slides.length;
  const vivo = placa && placa.idx >= 0 && placa.idx < total ? placa.idx : null;
  const i = vivo === null ? null : viendo !== null && viendo < vivo ? viendo : vivo;
  const slide = i === null ? null : clase.slides[i];
  const enVivo = i !== null && i === vivo;
  // Actividad en pantalla: primero la actividad; si no, primero la placa.
  const placaArriba = slide !== null && !(enVivo && esActividad(slide));
  const ir = (n: number) => setViendo(vivo !== null && n >= vivo ? null : Math.max(0, n));

  const nav = i !== null && vivo !== null ? <Navegacion i={i} total={total} vivo={vivo} enVivo={enVivo} onIr={ir} /> : null;

  // Misma estructura siempre (tres lugares fijos) para que la actividad no se
  // vuelva a montar al cambiar de placa y no pierda lo que se escribió.
  return (
    <>
      {placaArriba && slide && i !== null ? (
        <div className="rise">
          {nav}
          <VistaPlaca key={i} clase={clase} slide={slide} />
          <div className="mt-6">{nav}</div>
        </div>
      ) : null}
      <div className={cn(placaArriba && "mt-8 border-t border-line/60 pt-6")}>{actividad}</div>
      {!placaArriba && slide ? <div className="mt-6">{nav}</div> : null}
    </>
  );
}

function Navegacion({ i, total, vivo, enVivo, onIr }: { i: number; total: number; vivo: number; enVivo: boolean; onIr: (n: number) => void }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => onIr(i - 1)} disabled={i === 0} className="rounded-xl border border-line bg-ink-2 px-3 py-2 text-base font-semibold disabled:opacity-30">
          ‹ Anterior
        </button>
        <p className="min-w-0 flex-1 text-center text-sm">
          {enVivo ? (
            <span className="font-semibold text-teal">● En pantalla · {i + 1} de {total}</span>
          ) : (
            <span className="text-muted">
              Placa {i + 1} de {total}
            </span>
          )}
        </p>
        <button onClick={() => onIr(i + 1)} disabled={enVivo} className="rounded-xl border border-line bg-ink-2 px-3 py-2 text-base font-semibold disabled:opacity-30">
          Siguiente ›
        </button>
      </div>
      {!enVivo && (
        <button onClick={() => onIr(vivo)} className="rounded-xl bg-teal px-4 py-2.5 text-base font-bold text-ink">
          Volver a lo que se proyecta ({vivo + 1})
        </button>
      )}
    </div>
  );
}

function VistaPlaca({ clase, slide }: { clase: TfClase; slide: TfSlide }) {
  if (slide.t === "portada")
    return (
      <Marco>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal">{TF_INSTITUCION}</p>
        <h2 className="tf-serif mt-3 text-4xl leading-tight">{clase.titulo}</h2>
        <p className="mt-3 text-lg text-muted">{clase.bajada.join(" · ")}</p>
        <p className="tf-serif mt-4 text-xl">{clase.expositor}</p>
      </Marco>
    );
  if (slide.t === "ingreso")
    return (
      <Marco>
        <h2 className="tf-serif text-3xl leading-tight">¡Ya ingresó!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Acá va a ver cada placa de la presentación y las actividades cuando se abran. Puede volver a las placas anteriores cuando quiera.
        </p>
      </Marco>
    );
  if (slide.t === "actividad" || slide.t === "sintesis") {
    const titulo = slide.t === "actividad" ? getActividadTf(clase, slide.activa)?.titulo : slide.titulo;
    return (
      <Marco>
        <p className="text-xs font-bold uppercase tracking-widest text-teal">🗳️ {slide.t === "actividad" ? slide.escena : "Lo que respondió la sala"}</p>
        <h2 className="tf-serif mt-2 text-3xl leading-tight">{titulo ?? "Actividad"}</h2>
        <p className="mt-3 text-sm text-faint">Los resultados se ven en la pantalla.</p>
      </Marco>
    );
  }

  // Placa del Dr. Leal: su texto, línea por línea.
  return (
    <Marco>
      <p className="text-xs font-semibold uppercase tracking-widest text-teal">
        {clase.etiqueta} · {slide.num}
      </p>
      <h2 className="tf-serif mt-2 text-3xl leading-tight">{slide.titulo}</h2>
      <div className="mt-4 grid gap-3">
        {lineasPlaca(slide, clase).map((l, j) =>
          l.tipo === "lema" ? (
            <p key={j} className="tf-serif text-xl leading-snug text-violet">
              {l.texto}
            </p>
          ) : l.tipo === "cierre" ? (
            <p key={j} className="border-l-4 border-teal pl-3 text-lg font-medium leading-snug">
              {l.texto}
            </p>
          ) : l.tipo === "par" ? (
            <p key={j} className="text-lg leading-snug">
              <span className="block text-xs font-semibold uppercase tracking-widest text-muted">{l.k}</span>
              {l.texto}
            </p>
          ) : l.tipo === "dato" ? (
            <p key={j} className="text-lg text-muted">
              {l.texto}
            </p>
          ) : (
            <p key={j} className="flex gap-2 text-lg leading-snug">
              <span className="text-teal">•</span>
              {l.texto}
            </p>
          ),
        )}
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return <section className="mt-4 rounded-3xl border border-line bg-ink-2 p-5">{children}</section>;
}
