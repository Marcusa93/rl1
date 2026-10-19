"use client";

// Vista del participante de /doing (la abren desde el chat de Zoom, en la
// computadora; también funciona en el celular). A la izquierda sigue la
// pantalla que se comparte y responde las experiencias cuando se abren; en
// las placas con demostración ofrece probar el mismo pedido. A la derecha,
// siempre disponibles: el laboratorio de IA, el caso y la skill. Puede volver
// a las pantallas anteriores, nunca adelantarse.

import { Component, useEffect, useState, type ReactNode } from "react";
import { MarcaDoing } from "@/components/doing/marco";
import { CasoParticipante, Laboratorio, TarjetaPrompt } from "@/components/doing/laboratorio";
import { SkillParticipante } from "@/components/doing/skill";
import { getDemo, PROMPTS_LAB } from "@/lib/doing-caso";
import { DG_PREGUNTA, DG_SLIDES, DG_TITULO, getDgActividad, tituloSlideDg, type DgSlide } from "@/lib/doing-clase";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Si algo de este panel falla, sigue a la vista la experiencia. */
class Blindaje extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export { MarcaDoing };

type Pestana = "lab" | "caso" | "skill";

export function SeguimientoDoing({ session, placa, actividad }: { session: SessionRow; placa: PlacaVivo | null; actividad: ReactNode }) {
  const abierta = getDgActividad(session.current_activity);
  const revelada = Boolean((session.activity_config as { revelada?: boolean } | null)?.revelada);
  const vivo = placa && placa.idx >= 0 && placa.idx < DG_SLIDES.length ? placa.idx : null;
  const slideVivo = vivo === null ? null : DG_SLIDES[vivo];
  const cerrada = !abierta && slideVivo?.t === "actividad";
  const panel = abierta ? (
    <>
      {actividad}
      {revelada && abierta.revela && (
        <p className="rise mt-4 rounded-2xl border border-dg-verde/30 bg-dg-salvia-claro p-4 text-base leading-snug">
          <b className="text-dg-verde">✓ Orientación. </b>
          {abierta.revela}
        </p>
      )}
    </>
  ) : cerrada ? (
    <Aviso texto="La recepción de respuestas está cerrada. Mirá la pantalla compartida." />
  ) : (
    <Aviso texto="Cuando se abra una experiencia, va a aparecer acá. Mientras tanto, podés probar el laboratorio de la derecha." />
  );

  const [pestana, setPestana] = useState<Pestana>("lab");
  // Al llegar a la pantalla de la skill, la pestaña de la skill se abre sola.
  const [tipoPrevio, setTipoPrevio] = useState(slideVivo?.t);
  if (slideVivo?.t !== tipoPrevio) {
    setTipoPrevio(slideVivo?.t);
    if (slideVivo?.t === "skill") setPestana("skill");
  }

  return (
    <>
      <SinConexion />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start">
        <section>
          <p className="dg-rotulo mb-2 text-[0.65rem] text-dg-ocre">● En la pantalla compartida</p>
          <Blindaje fallback={panel}>
            <Seguimiento vivo={vivo} actividad={panel} actividadPrimero={Boolean(abierta) && slideVivo?.t === "actividad"} />
          </Blindaje>
        </section>
        <section className="lg:sticky lg:top-20">
          <div className="mb-3 grid grid-cols-3 gap-1 rounded-2xl border border-dg-linea bg-dg-hoja p-1">
            {(
              [
                ["lab", "🧪 Laboratorio IA"],
                ["caso", "🗂️ El caso"],
                ["skill", "🧰 La skill"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setPestana(id)}
                className={cn("rounded-xl px-2 py-2 text-sm font-semibold transition", pestana === id ? "bg-dg-verde text-white" : "text-dg-tinta hover:bg-dg-papel")}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="lg:max-h-[calc(100dvh-9rem)] lg:overflow-auto lg:pr-1">
            {pestana === "lab" && <Laboratorio />}
            {pestana === "caso" && <CasoParticipante />}
            {pestana === "skill" && <SkillParticipante />}
          </div>
        </section>
      </div>
    </>
  );
}

function Aviso({ texto }: { texto: string }) {
  return (
    <div className="rounded-3xl border border-line bg-panel/40 p-5 text-center">
      <p className="text-sm text-muted">{texto}</p>
    </div>
  );
}

/** Cartel cuando el dispositivo pierde la conexión. */
function SinConexion() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const act = () => setOnline(navigator.onLine);
    act();
    window.addEventListener("online", act);
    window.addEventListener("offline", act);
    return () => {
      window.removeEventListener("online", act);
      window.removeEventListener("offline", act);
    };
  }, []);
  if (online) return null;
  return (
    <p className="mb-4 rounded-2xl border border-dg-lacre/40 bg-dg-lacre-claro p-3 text-center text-sm text-dg-lacre">
      Sin conexión. Cuando vuelva, la clase se actualiza sola; si una respuesta no se envió, tocala de nuevo.
    </p>
  );
}

function Seguimiento({ vivo, actividad, actividadPrimero }: { vivo: number | null; actividad: ReactNode; actividadPrimero: boolean }) {
  const [viendo, setViendo] = useState<number | null>(null);
  const total = DG_SLIDES.length;
  const i = vivo === null ? null : viendo !== null && viendo < vivo ? viendo : vivo;
  const slide = i === null ? null : DG_SLIDES[i];
  const enVivo = i !== null && i === vivo;
  const placaArriba = slide !== null && !(enVivo && actividadPrimero);
  const ir = (n: number) => setViendo(vivo !== null && n >= vivo ? null : Math.max(0, n));
  const nav = i !== null && vivo !== null ? <Navegacion i={i} total={total} vivo={vivo} enVivo={enVivo} onIr={ir} /> : null;

  // Misma estructura siempre, para que la experiencia no se vuelva a montar al
  // cambiar de pantalla y no se pierda lo que se escribió.
  return (
    <>
      {placaArriba && slide && i !== null ? (
        <div className="rise">
          {nav}
          <VistaSlide key={i} slide={slide} />
        </div>
      ) : null}
      <div className={cn(placaArriba && "mt-5")}>{actividad}</div>
      {enVivo && slide && <Probar slide={slide} />}
      {slide && !placaArriba ? <div className="mt-5">{nav}</div> : null}
    </>
  );
}

/** En las placas y demostraciones con un pedido para probar: el mismo pedido, listo. */
function Probar({ slide }: { slide: DgSlide }) {
  const id = slide.t === "placa" || slide.t === "demo" ? slide.probar : undefined;
  const p = id ? PROMPTS_LAB.find((x) => x.id === id) : undefined;
  if (!p) return null;
  return (
    <section className="mt-5">
      <p className="dg-rotulo mb-2 text-[0.65rem] text-dg-lacre">▶ Probalo vos · el mismo pedido</p>
      <TarjetaPrompt key={p.id} p={p} abierta destacada />
    </section>
  );
}

function Navegacion({ i, total, vivo, enVivo, onIr }: { i: number; total: number; vivo: number; enVivo: boolean; onIr: (n: number) => void }) {
  return (
    <div className="mb-3 grid gap-2">
      <div className="flex items-center gap-2">
        <button onClick={() => onIr(i - 1)} disabled={i === 0} className="rounded-xl border border-line bg-ink-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-30">
          ‹ Anterior
        </button>
        <p className="min-w-0 flex-1 text-center text-sm">
          {enVivo ? (
            <span className="font-semibold text-teal">
              ● En pantalla · {i + 1} de {total}
            </span>
          ) : (
            <span className="text-muted">
              Pantalla {i + 1} de {total}
            </span>
          )}
        </p>
        <button onClick={() => onIr(i + 1)} disabled={enVivo} className="rounded-xl border border-line bg-ink-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-30">
          Siguiente ›
        </button>
      </div>
      {!enVivo && (
        <button onClick={() => onIr(vivo)} className="rounded-xl bg-teal px-4 py-2 text-sm font-bold text-white">
          Volver a lo que se proyecta ({vivo + 1})
        </button>
      )}
    </div>
  );
}

function VistaSlide({ slide }: { slide: DgSlide }) {
  if (slide.t === "portada")
    return (
      <Marco>
        <MarcaDoing className="text-lg" />
        <h2 className="dg-titular mt-3 text-4xl">{DG_TITULO}</h2>
        <p className="mt-2 text-lg text-muted">Marco Rossi</p>
      </Marco>
    );
  if (slide.t === "ingreso")
    return (
      <Marco>
        <h2 className="dg-titular text-4xl">¡Ya ingresaste!</h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          Acá vas a seguir cada pantalla y responder las experiencias cuando se abran. Es anónimo. A la derecha tenés el laboratorio de IA, el caso y la skill.
        </p>
        <p className="dg-serif mt-4 border-l-4 border-dg-lacre pl-3 text-2xl leading-snug">{DG_PREGUNTA}</p>
      </Marco>
    );
  if (slide.t === "actividad") {
    const a = getDgActividad(slide.activa);
    return (
      <Marco>
        <p className="text-xs font-semibold uppercase tracking-widest text-dg-ocre">Experiencia {a?.numero} de 6</p>
        <h2 className="dg-titular mt-1 text-3xl">{a?.titulo}</h2>
        <p className="mt-1 text-base text-muted">{a?.bajada}</p>
      </Marco>
    );
  }
  if (slide.t === "demo") {
    const d = getDemo(slide.demo);
    return (
      <Marco>
        <p className="text-xs font-semibold uppercase tracking-widest text-dg-lacre">▶ Demostración en vivo</p>
        <h2 className="dg-titular mt-1 text-3xl">{tituloSlideDg(slide).replace(/^▶ Demostración · /, "")}</h2>
        <p className="mt-1 text-base text-muted">{d?.objetivo}</p>
        {slide.demo === "d4" && (
          <p className="mt-3 text-sm leading-relaxed text-dg-tinta">
            Formulario → validación con reglas → plantilla → descripción con IA → borrador para revisión. Mirá qué pasa cuando falta un dato o el pedido excede lo previsto.
          </p>
        )}
      </Marco>
    );
  }
  const rotulo = slide.t === "skill" ? "🧰 Laboratorio de skills" : `Placa ${slide.num}`;
  return (
    <Marco>
      <p className={cn("text-xs font-semibold uppercase tracking-widest", slide.t === "skill" ? "text-dg-azul" : "text-teal")}>{rotulo}</p>
      <h2 className="dg-titular mt-1 text-3xl leading-tight">{slide.titulo}</h2>
      <p className="mt-1 text-base leading-snug text-muted">{slide.bajada}</p>
      <div className="mt-3 grid gap-2">
        {slide.lineas.map((l) => (
          <p key={l} className="flex gap-2 text-base leading-snug">
            <span className="text-teal">•</span>
            {l}
          </p>
        ))}
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return <section className="rounded-3xl border border-line bg-ink-2 p-5">{children}</section>;
}
