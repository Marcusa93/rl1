"use client";

// El dispositivo del participante sigue la presentación de /unca: la placa que
// se comparte (su texto, sin diagramas), la intervención cuando se abre y,
// en algunas placas, una herramienta para probar en el propio dispositivo
// (cifrado César, huella SHA-256, cadena de bloques). Puede volver a las
// placas anteriores, nunca adelantarse.

import { Component, useEffect, useState, type ReactNode } from "react";
import { Cadena, Cesar, MiniHash } from "@/components/unca/labs";
import { getUcActividad, UC_INSTITUCION, UC_LOGO, UC_MATERIAL_IA, UC_PREGUNTA, UC_SLIDES, UC_TITULO, type UcSlide } from "@/lib/unca-clase";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Si algo de este panel falla, el dispositivo sigue mostrando la actividad. */
class Blindaje extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export function MarcaUnca() {
  return (
    <span className="flex shrink-0 items-center gap-2.5">
      <img src={UC_LOGO} alt={UC_INSTITUCION} className="h-7 w-auto" />
    </span>
  );
}

export function SeguimientoUnca({ session, placa, actividad }: { session: SessionRow; placa: PlacaVivo | null; actividad: ReactNode }) {
  const abierta = getUcActividad(session.current_activity);
  const revelada = Boolean((session.activity_config as { revelada?: boolean } | null)?.revelada);
  const vivo = placa && placa.idx >= 0 && placa.idx < UC_SLIDES.length ? placa.idx : null;
  const slideVivo = vivo === null ? null : UC_SLIDES[vivo];
  const cerrada = !abierta && slideVivo?.t === "placa" && Boolean(slideVivo.activa);
  const panel = abierta ? (
    <>
      {actividad}
      {revelada && abierta.revela && (
        <p className="rise mt-4 rounded-2xl border border-uc-verde/30 bg-uc-salvia-claro p-4 text-base leading-snug">
          <b className="text-uc-verde">✓ Respuesta orientativa. </b>
          {abierta.revela}
        </p>
      )}
    </>
  ) : cerrada ? (
    <Aviso texto="La recepción de respuestas está cerrada. Mirá la pantalla." />
  ) : (
    <Aviso texto="Cuando se abra una actividad, va a aparecer acá." />
  );
  return (
    <>
      <SinConexion />
      <Blindaje fallback={panel}>
        <Seguimiento vivo={vivo} actividad={panel} actividadPrimero={Boolean(abierta) && slideVivo?.t === "placa" && slideVivo.activa === abierta?.key} />
      </Blindaje>
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
    <p className="mb-4 rounded-2xl border border-uc-lacre/40 bg-uc-lacre-claro p-3 text-center text-sm text-uc-lacre">
      Sin conexión. Cuando vuelva la señal, la clase se actualiza sola; si una respuesta no se envió, tocala de nuevo.
    </p>
  );
}

function Seguimiento({ vivo, actividad, actividadPrimero }: { vivo: number | null; actividad: ReactNode; actividadPrimero: boolean }) {
  const [viendo, setViendo] = useState<number | null>(null);
  const total = UC_SLIDES.length;
  const i = vivo === null ? null : viendo !== null && viendo < vivo ? viendo : vivo;
  const slide = i === null ? null : UC_SLIDES[i];
  const enVivo = i !== null && i === vivo;
  const placaArriba = slide !== null && !(enVivo && actividadPrimero);
  const ir = (n: number) => setViendo(vivo !== null && n >= vivo ? null : Math.max(0, n));
  const nav = i !== null && vivo !== null ? <Navegacion i={i} total={total} vivo={vivo} enVivo={enVivo} onIr={ir} /> : null;

  // Misma estructura siempre, para que la actividad no se vuelva a montar al
  // cambiar de placa y no se pierda lo que se escribió.
  return (
    <>
      {placaArriba && slide && i !== null ? (
        <div className="rise">
          {nav}
          <VistaPlaca key={i} slide={slide} />
        </div>
      ) : null}
      {enVivo && slide && <Material slide={slide} />}
      <div className={cn(placaArriba && "mt-6")}>{actividad}</div>
      {enVivo && slide && <Probar slide={slide} />}
      {slide ? <div className="mt-6">{nav}</div> : null}
    </>
  );
}

/** Material que acompaña a la placa en el dispositivo (el video de la placa 24). */
function Material({ slide }: { slide: UcSlide }) {
  const [falta, setFalta] = useState(false);
  if (slide.t !== "placa" || slide.cuerpo !== "real-ia" || falta) return null;
  return (
    <div className="mt-4 overflow-hidden rounded-2xl bg-black">
      {UC_MATERIAL_IA.tipo === "video" ? (
        <video src={UC_MATERIAL_IA.src} controls playsInline className="w-full" onError={() => setFalta(true)} />
      ) : (
        <img src={UC_MATERIAL_IA.src} alt="Material para la votación" className="w-full" onError={() => setFalta(true)} />
      )}
    </div>
  );
}

/** Herramienta para probar en el propio dispositivo durante la placa en vivo. */
function Probar({ slide }: { slide: UcSlide }) {
  const que = slide.t === "placa" || slide.t === "lab" ? slide.probar : undefined;
  if (!que) return null;
  const titulo = { cesar: "Cifrá tu propio mensaje", hash: "Calculá huellas", cadena: "Alterá un bloque" }[que];
  return (
    <section className="mt-6 rounded-3xl border border-uc-cian/30 bg-uc-hielo/60 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-uc-cian">📱 Probalo vos · {titulo}</p>
      <div className="mt-3">
        {que === "cesar" && <Cesar compacto />}
        {que === "hash" && <MiniHash />}
        {que === "cadena" && <Cadena compacto />}
      </div>
    </section>
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
              Pantalla {i + 1} de {total}
            </span>
          )}
        </p>
        <button onClick={() => onIr(i + 1)} disabled={enVivo} className="rounded-xl border border-line bg-ink-2 px-3 py-2 text-base font-semibold disabled:opacity-30">
          Siguiente ›
        </button>
      </div>
      {!enVivo && (
        <button onClick={() => onIr(vivo)} className="rounded-xl bg-teal px-4 py-2.5 text-base font-bold text-white">
          Volver a lo que se proyecta ({vivo + 1})
        </button>
      )}
    </div>
  );
}

function VistaPlaca({ slide }: { slide: UcSlide }) {
  if (slide.t === "portada")
    return (
      <Marco>
        <p className="text-xs font-semibold uppercase tracking-widest text-teal">Módulo III · Diplomatura en Instrumentos Públicos y Privados</p>
        <h2 className="uc-serif mt-3 text-4xl leading-tight">{UC_TITULO}</h2>
        <p className="mt-3 text-lg text-muted">Dr. Marco Rossi</p>
      </Marco>
    );
  if (slide.t === "ingreso")
    return (
      <Marco>
        <h2 className="uc-serif text-3xl leading-tight">¡Ya ingresaste!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Acá vas a ver cada placa y las actividades cuando se abran. Es anónimo: no hace falta escribir tu nombre.
        </p>
        <p className="uc-serif mt-4 border-l-4 border-uc-ocre pl-3 text-xl leading-snug">{UC_PREGUNTA}</p>
      </Marco>
    );
  const rotulo = slide.t === "lab" ? "🧪 Laboratorio en vivo" : `Placa ${slide.num}`;
  return (
    <Marco>
      <p className={cn("text-xs font-semibold uppercase tracking-widest", slide.t === "lab" ? "text-uc-cian" : "text-teal")}>{rotulo}</p>
      <h2 className="uc-serif mt-2 text-3xl leading-tight">{slide.titulo.replace(/^Laboratorio · /, "")}</h2>
      <p className="mt-2 text-lg leading-snug text-muted">{slide.bajada}</p>
      <div className="mt-4 grid gap-2.5">
        {slide.lineas.map((l) => (
          <p key={l} className="flex gap-2 text-lg leading-snug">
            <span className="text-teal">•</span>
            {l}
          </p>
        ))}
      </div>
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return <section className="mt-4 rounded-3xl border border-line bg-ink-2 p-5">{children}</section>;
}
