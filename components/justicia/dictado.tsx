"use client";

// "Del dictado a la cronología": demostración simulada de una herramienta que
// escucha una audiencia de mediación laboral y, con su prompt de sistema,
// convierte el relato desordenado en hechos jurídicamente relevantes,
// detecta lo que falta y propone preguntas. El docente habla como Carlos
// (el trabajador) siguiendo el guion; la desgrabación en pantalla es la
// preparada, no reconocimiento de voz real.

import { useEffect, useState } from "react";
import { GUION_CARLOS } from "@/lib/justicia-clase";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

const PALABRAS = GUION_CARLOS.split(" ");
const PALABRAS_POR_SEG = 2.6;

const PROMPT_SISTEMA: { l: string; t: string; c: string }[] = [
  { l: "C", t: "Asiste a quien media en audiencias laborales, a partir del relato oral de las partes.", c: "text-teal" },
  { l: "O", t: "Convertir el relato en hechos jurídicamente relevantes, ordenados y verificables.", c: "text-cyan" },
  {
    l: "T",
    t: "1) Ordenar por fecha y convertir fechas relativas. 2) Encuadrar cada dato: relación laboral, salario, extinción, créditos pendientes, oferta, interés. 3) Detectar inconsistencias. 4) Proponer tres preguntas para precisar.",
    c: "text-violet",
  },
  { l: "I", t: "Solo lo dicho en la audiencia. No suponer datos. Anonimizar nombres y datos personales: usar roles (T1, E1).", c: "text-amber-300" },
  { l: "O", t: "Tabla (fecha · lo dicho · hecho relevante · control) y preguntas. No calcular montos ni decidir.", c: "text-rose-300" },
];

const PASOS_PROCESO = [
  "Desgrabando el audio",
  "Anonimizando datos personales",
  "Ordenando por fecha",
  "Encuadrando los hechos",
  "Buscando inconsistencias y faltantes",
];

const FILAS: { fecha: string; dicho: string; hecho: string; control: string; alerta?: boolean }[] = [
  { fecha: "—", dicho: "«soy [nombre anonimizado]»", hecho: "Parte: persona trabajadora (T1)", control: "🔒 dato personal protegido" },
  { fecha: "04/05/2024", dicho: "«entré el 4 de mayo de 2024, como vendedor… de lunes a sábado»", hecho: "Inicio de la relación laboral · vendedor · seis días por semana", control: "📎 contrato o constancia de ingreso" },
  { fecha: "Desde el ingreso", dicho: "«al principio ganaba 300 dólares»", hecho: "Salario inicial: USD 300", control: "📎 boletas de pago" },
  { fecha: "≈ febrero 2026", dicho: "«hace un mes me habían aumentado a 600»", hecho: "Último salario: USD 600 — dato clave para el cálculo", control: "⚠ fecha relativa: confirmar", alerta: true },
  { fecha: "2025", dicho: "«nunca me pagaron las vacaciones del año pasado»", hecho: "Crédito pendiente: vacaciones 2025", control: "📎 recibos de vacaciones" },
  { fecha: "03/03/2026", dicho: "«me despidieron… sin ningún aviso»", hecho: "Extinción: despido sin preaviso ni causa expresada", control: "⚠ año inferido · 📎 carta, si existe", alerta: true },
  { fecha: "Sin fecha", dicho: "«me ofrecieron 800 dólares»", hecho: "Oferta de la empresa: USD 800", control: "⚠ ¿qué conceptos incluye?", alerta: true },
  { fecha: "14/09/2026", dicho: "«quiero cerrar esto sin ir a juicio»", hecho: "Interés: acuerdo sin juicio", control: "—" },
];

const PREGUNTAS = [
  "Usted dijo «casi tres años», pero si entró el 4 de mayo de 2024, trabajó 1 año y 10 meses. ¿Cuál es la fecha correcta de ingreso?",
  "¿Le entregaron algo por escrito al despedirlo, o se lo dijeron de palabra?",
  "Los 800 dólares que le ofrecieron, ¿incluyen las vacaciones pendientes o son solo por el despido?",
];

type Fase = "listo" | "grabando" | "detenido" | "procesando" | "resultado";

export function DemoDictado() {
  const [fase, setFase] = useState<Fase>("listo");
  const [segundos, setSegundos] = useState(0);
  const [pasos, setPasos] = useState(0);

  // Reloj de la grabación.
  useEffect(() => {
    if (fase !== "grabando") return;
    const inicio = Date.now() - segundos * 1000;
    const id = setInterval(() => setSegundos((Date.now() - inicio) / 1000), 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase]);

  // Procesamiento: pasos de a uno y después el resultado.
  useEffect(() => {
    if (fase !== "procesando") return;
    setPasos(0);
    const id = setInterval(() => setPasos((p) => p + 1), 480);
    const fin = setTimeout(() => setFase("resultado"), 480 * (PASOS_PROCESO.length + 1));
    return () => {
      clearInterval(id);
      clearTimeout(fin);
    };
  }, [fase]);

  const visibles = fase === "grabando" ? Math.min(PALABRAS.length, Math.floor(segundos * PALABRAS_POR_SEG)) : PALABRAS.length;
  const reloj = `${Math.floor(segundos / 60)}:${String(Math.floor(segundos % 60)).padStart(2, "0")}`;

  function reiniciar() {
    setSegundos(0);
    setPasos(0);
    setFase("listo");
  }

  const cabecera = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="text-xs font-bold uppercase tracking-wider text-faint">🎧 Asistente de audiencias · mediación laboral</p>
      <p className="text-xs text-faint">Habla el trabajador</p>
    </div>
  );

  if (fase === "resultado")
    return (
      <div className="rise mt-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <p className="rounded-full border border-violet/50 bg-violet/10 px-3 py-1 text-xs text-violet-200">
              ⚙️ Procesado con el prompt de sistema: cronología · hechos relevantes · tres preguntas
            </p>
            <p className="rounded-full border border-emerald-400/50 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
              🔒 Anonimizado: <s className="opacity-70">Carlos González</s> → T1 (persona trabajadora)
            </p>
          </div>
          <button onClick={reiniciar} {...rem("↺ Nueva grabación")} className="text-sm text-faint hover:text-teal">
            ↺ nueva grabación
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-separate border-spacing-y-1 text-left text-sm sm:text-base">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-faint">
                <th className="px-3">Fecha</th>
                <th className="px-3">Lo que dijo</th>
                <th className="px-3">Hecho jurídicamente relevante</th>
                <th className="px-3">Control</th>
              </tr>
            </thead>
            <tbody>
              {FILAS.map((f, i) => (
                <tr key={f.fecha + i} className="rise glass" style={{ animationDelay: `${i * 0.08}s` }}>
                  <td className="whitespace-nowrap rounded-l-xl px-3 py-2 font-mono text-sm text-teal">{f.fecha}</td>
                  <td className="px-3 py-2 text-sm italic text-muted">{f.dicho}</td>
                  <td className="px-3 py-2 font-semibold">{f.hecho}</td>
                  <td className={cn("rounded-r-xl px-3 py-2 text-sm", f.alerta ? "text-amber-300" : "text-muted")}>{f.control}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
          <div className="rise flex flex-col gap-3" style={{ animationDelay: "0.6s" }}>
            <p className="rounded-xl border border-rose-400/50 bg-rose-400/10 p-3 text-base leading-snug">
              <b className="text-rose-300">⚠ Inconsistencia:</b> dijo «casi tres años», pero según las fechas trabajó <b>1 año y 10 meses</b> (04/05/2024 →
              03/03/2026).
            </p>
            <p className="rounded-xl border border-line bg-panel/60 p-3 text-sm leading-snug text-muted">
              <b className="text-foreground">Límite:</b> no calcula la indemnización ni dice si la oferta es justa. Eso lo determina la persona profesional con la
              norma.
            </p>
          </div>
          <div className="rise glass rounded-2xl p-4" style={{ animationDelay: "0.75s" }}>
            <p className="text-xs font-bold uppercase tracking-wider text-teal">Preguntas para T1 (la persona trabajadora)</p>
            <ol className="mt-2 space-y-2 text-base leading-snug sm:text-lg">
              {PREGUNTAS.map((p, i) => (
                <li key={i} className="flex gap-2">
                  <b className="font-mono text-teal">{i + 1}.</b>
                  {p}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );

  return (
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.45fr_1fr]">
      <div className="glass flex min-h-[20rem] flex-col gap-4 rounded-2xl p-5">
        {cabecera}

        {fase === "listo" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <button
              onClick={() => setFase("grabando")}
              {...rem("🎙️ Grabar")}
              className="pulse-ring flex size-28 items-center justify-center rounded-full bg-gradient-to-br from-teal to-cyan text-5xl shadow-lg transition active:scale-95"
              aria-label="Grabar"
            >
              🎙️
            </button>
            <p className="text-base text-muted">Toque para empezar a escuchar la audiencia</p>
          </div>
        )}

        {(fase === "grabando" || fase === "detenido" || fase === "procesando") && (
          <>
            <div className="flex items-center gap-3">
              <span className={cn("size-3 rounded-full", fase === "grabando" ? "animate-pulse bg-rose-500" : "bg-faint")} />
              <span className="font-mono text-lg">{reloj}</span>
              <span className="text-sm text-muted">{fase === "grabando" ? "Escuchando…" : fase === "detenido" ? "Grabación terminada" : "Procesando…"}</span>
            </div>
            <Onda activa={fase === "grabando"} />
            <div className="max-h-44 overflow-auto rounded-xl border border-line bg-ink-2/60 p-3 text-base leading-relaxed sm:text-lg">
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-faint">Desgrabación</p>
              {PALABRAS.slice(0, visibles).join(" ")}
              {fase === "grabando" && <span className="animate-pulse text-teal"> ▍</span>}
            </div>
          </>
        )}

        {fase === "grabando" && (
          <button
            onClick={() => setFase("detenido")}
            {...rem("⏹ Detener")}
            className="self-center rounded-2xl border border-rose-400/60 bg-rose-400/15 px-6 py-3 text-lg font-semibold text-rose-200 transition active:scale-95"
          >
            ⏹ Detener
          </button>
        )}

        {fase === "detenido" && (
          <button
            onClick={() => setFase("procesando")}
            {...rem("✨ Procesar")}
            className="self-center rounded-2xl bg-gradient-to-r from-violet to-cyan px-6 py-3 text-lg font-semibold text-ink transition hover:brightness-110 active:scale-95"
          >
            ✨ Procesar
          </button>
        )}

        {fase === "procesando" && (
          <ul className="space-y-1.5">
            {PASOS_PROCESO.map((p, i) => (
              <li key={p} className={cn("text-base transition", i < pasos ? "text-emerald-300" : i === pasos ? "text-foreground" : "text-faint")}>
                {i < pasos ? "✓" : i === pasos ? "⋯" : "·"} {p}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet">⚙️ Prompt de sistema de la herramienta</p>
        <p className="mt-1 text-xs text-faint">Se escribió una vez; se aplica a cada audiencia.</p>
        <div className="mt-3 space-y-2">
          {PROMPT_SISTEMA.map((p, i) => (
            <p key={i} className="flex gap-2 text-sm leading-snug">
              <b className={cn("font-mono", p.c)}>{p.l}</b>
              <span>{p.t}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Onda de audio simulada, como la de las apps de voz. */
function Onda({ activa }: { activa: boolean }) {
  return (
    <div className="flex h-14 items-center justify-center gap-[3px]">
      {Array.from({ length: 42 }, (_, i) => (
        <span
          key={i}
          className={cn("w-1.5 rounded-full bg-gradient-to-t from-teal to-cyan", activa ? "onda" : "opacity-40")}
          style={{
            height: activa ? undefined : `${8 + ((i * 7) % 11)}px`,
            animationDelay: `${(i * 0.09) % 1.1}s`,
            animationDuration: `${0.7 + ((i * 13) % 7) / 10}s`,
          }}
        />
      ))}
    </div>
  );
}
