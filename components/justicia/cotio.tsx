"use client";

// "¿Qué es un prompt?": el docente toca las piezas COTIO (Contexto, Objetivo,
// Tareas, Input y Output) y el prompt se va armando, como prompt de usuario
// (una consulta concreta) o como prompt de sistema (las reglas estables de
// un asistente). Todas las piezas se pueden tocar desde el control remoto.

import { useState } from "react";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

type Modo = "usuario" | "sistema";
type Pieza = "c" | "o" | "t" | "i" | "s";

const PIEZAS: { id: Pieza; letra: string; nombre: string; que: string; color: string; borde: string }[] = [
  { id: "c", letra: "C", nombre: "Contexto", que: "Quién pide, en qué situación y para qué ámbito.", color: "text-teal", borde: "border-teal" },
  { id: "o", letra: "O", nombre: "Objetivo", que: "Qué se quiere lograr con la respuesta.", color: "text-cyan", borde: "border-cyan" },
  { id: "t", letra: "T", nombre: "Tarea o tareas", que: "Qué tiene que hacer, paso por paso.", color: "text-violet", borde: "border-violet" },
  { id: "i", letra: "I", nombre: "Input", que: "Con qué información trabaja y con cuál no.", color: "text-amber-300", borde: "border-amber-300" },
  { id: "s", letra: "O", nombre: "Output", que: "Cómo tiene que entregar el resultado.", color: "text-rose-300", borde: "border-rose-300" },
];

const TEXTOS: Record<Modo, Record<Pieza, string>> = {
  usuario: {
    c: "Soy defensora pública de la PGR en un proceso de familia por cuota alimenticia. La audiencia es mañana.",
    o: "Necesito preparar la audiencia sin omitir ningún dato relevante.",
    t: "1) Arme una cronología de los hechos. 2) Señale las contradicciones entre los escritos. 3) Liste la prueba pendiente.",
    i: "Use solo los documentos adjuntos: la demanda, la contestación y el acta de la audiencia anterior.",
    s: "Entregue una tabla (fecha · hecho · documento). Si falta un dato, indíquelo; no lo complete.",
  },
  sistema: {
    c: "Usted asiste a defensores públicos de la PGR de El Salvador en materia de familia.",
    o: "Su objetivo es ayudar a preparar audiencias con información verificable.",
    t: "Puede ordenar hechos, resumir escritos y detectar contradicciones. No decide ni aconseja a las partes.",
    i: "Trabaje solo con los documentos que se carguen en cada consulta. No use información de otros casos.",
    s: "Responda en lenguaje claro, cite el documento de cada dato y avise cuando algo falte.",
  },
};

const MODOS: Record<Modo, { label: string; emoji: string; nota: string; vacio: string }> = {
  usuario: {
    label: "Prompt de usuario",
    emoji: "💬",
    nota: "Cambia en cada consulta: es el pedido concreto.",
    vacio: "Resuma este expediente.",
  },
  sistema: {
    label: "Prompt de sistema",
    emoji: "⚙️",
    nota: "Se escribe una vez y vale para todas las consultas: las instrucciones de un proyecto, un GPT o un Gem.",
    vacio: "Sea un asistente útil.",
  },
};

export function ConstructorCotio() {
  const [modo, setModo] = useState<Modo>("usuario");
  const [elegidas, setElegidas] = useState<Pieza[]>([]);
  const orden = PIEZAS.filter((p) => elegidas.includes(p.id));

  const alternar = (id: Pieza) => setElegidas((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));

  return (
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1fr_1.25fr]">
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MODOS) as Modo[]).map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              {...rem(`${MODOS[m].emoji} ${MODOS[m].label}`, modo === m)}
              className={cn(
                "rounded-xl border px-3 py-2.5 text-sm font-semibold transition sm:text-base",
                modo === m ? "border-teal bg-teal/15 text-teal" : "border-line bg-panel/50 text-muted hover:border-teal/50",
              )}
            >
              {MODOS[m].emoji} {MODOS[m].label}
            </button>
          ))}
        </div>
        <p className="text-sm text-muted">{MODOS[modo].nota}</p>

        <div className="flex flex-col gap-2">
          {PIEZAS.map((p, i) => {
            const on = elegidas.includes(p.id);
            return (
              <button
                key={p.id}
                onClick={() => alternar(p.id)}
                {...rem(`${p.letra} · ${p.nombre}`, on)}
                className={cn(
                  "rise flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition active:scale-[0.98]",
                  on ? `${p.borde} bg-panel` : "border-line bg-panel/50 hover:border-teal/50",
                )}
                style={{ animationDelay: `${0.2 + i * 0.07}s` }}
              >
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-lg border-2 font-mono text-xl font-bold", p.borde, p.color)}>
                  {p.letra}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-base font-semibold", on && p.color)}>{p.nombre}</span>
                  <span className="block text-xs leading-snug text-faint sm:text-sm">{p.que}</span>
                </span>
                {on && <span className={cn("ml-auto text-sm", p.color)}>✓</span>}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setElegidas(PIEZAS.map((p) => p.id))}
            {...rem("✨ Armar el prompt completo", elegidas.length === PIEZAS.length)}
            className="flex-1 rounded-xl border border-violet/60 bg-violet/15 px-3 py-2 text-sm font-semibold text-violet-200 transition hover:bg-violet/25"
          >
            ✨ Armar completo
          </button>
          <button
            onClick={() => setElegidas([])}
            {...rem("↺ Empezar de nuevo")}
            className="rounded-xl border border-line bg-panel/60 px-3 py-2 text-sm text-muted transition hover:text-teal"
          >
            ↺ Vaciar
          </button>
        </div>
      </div>

      <div className="glass flex min-h-[22rem] flex-col rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-faint">
            {MODOS[modo].emoji} {MODOS[modo].label} · en construcción
          </p>
          <p className="font-mono text-xs text-faint">{orden.length}/5</p>
        </div>

        {orden.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <p className="rounded-xl border border-dashed border-line px-5 py-3 font-mono text-xl text-muted">«{MODOS[modo].vacio}»</p>
            <p className="max-w-sm text-sm text-faint">Así pide casi todo el mundo. Toque las piezas para ver cómo cambia el pedido.</p>
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5">
            {orden.map((p) => (
              <div key={`${modo}-${p.id}`} className={cn("rise border-l-4 pl-3", p.borde)}>
                <p className={cn("font-mono text-[11px] font-bold uppercase tracking-wider", p.color)}>
                  {p.letra} · {p.nombre}
                </p>
                <p className="text-base leading-snug sm:text-lg">{TEXTOS[modo][p.id]}</p>
              </div>
            ))}
            {orden.length === PIEZAS.length && (
              <p className="rise mt-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">
                ✓ Un pedido completo: la herramienta sabe quién pide, para qué, qué hacer, con qué y cómo entregarlo.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
