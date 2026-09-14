"use client";

// Diagramas animados del deck del taller: el Gem, el caucus, el careo
// mediador vs. IA, el agente de Deep Research y el mapa de las 8 etapas.
// Todo CSS (vaiven / pulse-ring / animate-pulse): sobrevive a pestañas lentas.

import { TAL_ETAPAS } from "@/lib/taller-guiado";
import { cn } from "@/lib/utils";

function Flecha({ className }: { className?: string }) {
  return <span className={cn("text-2xl text-faint", className)}>→</span>;
}

/** El Gem: P0 se escribe una vez; todo entra a la misma conversación. */
export function DiagramaGem() {
  const entran = [
    ["🎙️", "EA-01 · EA-02"],
    ["📄", "CN-00 … CN-13"],
    ["📝", "mi ficha"],
    ["✅", "criterios verificados"],
  ];
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-nowrap lg:gap-6">
        {/* P0 */}
        <div className="vaiven w-56 shrink-0 rounded-2xl border border-violet/50 bg-violet/10 p-4" style={{ animationDelay: "0.4s" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-violet">P0 · prompt de sistema</p>
          <div className="mt-2 space-y-1 font-mono text-sm">
            {[
              ["C", "ontexto"],
              ["O", "bjetivo"],
              ["T", "areas"],
              ["I", "nput"],
              ["O", "utput"],
            ].map(([l, resto], i) => (
              <p key={i}>
                <b className="text-violet">{l}</b>
                <span className="text-muted">{resto}</span>
              </p>
            ))}
          </div>
          <p className="mt-2 text-xs text-faint">se escribe UNA vez</p>
        </div>

        <Flecha />

        {/* La gema */}
        <div className="relative shrink-0">
          <div className="pulse-ring flex size-44 items-center justify-center rounded-3xl border-gradient bg-ink-2/60" style={{ transform: "rotate(45deg)" }}>
            <div style={{ transform: "rotate(-45deg)" }} className="text-center">
              <p className="text-4xl">💎</p>
              <p className="mt-1 px-2 text-sm font-bold leading-tight">
                Asistente de<br />mediación
              </p>
            </div>
          </div>
        </div>

        <Flecha />

        {/* Salida */}
        <div className="vaiven w-56 shrink-0 rounded-2xl border border-teal/50 bg-teal/10 p-4" style={{ animationDelay: "1.2s" }}>
          <p className="text-xs font-bold uppercase tracking-widest text-teal">Cada respuesta</p>
          <ul className="mt-2 space-y-1.5 text-sm leading-snug text-muted">
            <li>📌 cita el documento (CN-03, pág. 1)</li>
            <li>💭 marca sus hipótesis</li>
            <li>🚫 no decide por usted</li>
            <li>🧠 recuerda TODO lo anterior</li>
          </ul>
        </div>
      </div>

      {/* Lo que va entrando a la misma conversación */}
      <div className="mt-7 rounded-2xl border border-line/60 bg-panel/40 px-4 py-3">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-faint">Todo entra a la misma conversación, etapa por etapa</p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {entran.map(([e, t], i) => (
            <span
              key={t}
              className="vaiven flex items-center gap-1.5 rounded-full border border-line bg-ink-2/70 px-3 py-1.5 text-sm"
              style={{ animationDelay: `${i * 0.55}s`, ["--dur" as string]: "3.6s" }}
            >
              <span>{e}</span>
              {t}
            </span>
          ))}
          <span className="text-faint">⟶ 💎</span>
        </div>
      </div>
    </div>
  );
}

/** El caucus: dos salas privadas, un equipo en el medio, nada se cruza sin permiso. */
export function DiagramaCaucus() {
  const sala = (emoji: string, nombre: string, dice: string, delay: string) => (
    <div className="vaiven w-64 rounded-2xl border border-line bg-panel/50 p-4" style={{ animationDelay: delay }}>
      <p className="text-3xl">{emoji}</p>
      <p className="mt-1 text-lg font-bold">{nombre}</p>
      <p className="mt-1 text-sm leading-snug text-muted">{dice}</p>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-400/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
        🔒 lo que dijo a solas
      </p>
    </div>
  );
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <div className="flex flex-wrap items-center justify-center gap-4 lg:flex-nowrap lg:gap-6">
        {sala("☕", "Sala de Lucía", "«Abrimos mañana… si es que abrimos.»", "0s")}
        <span className="text-2xl text-teal">⇄</span>
        <div className="pulse-ring flex size-40 shrink-0 flex-col items-center justify-center rounded-full border-gradient bg-ink-2/60 text-center">
          <p className="text-3xl">🧑‍⚖️</p>
          <p className="px-3 text-sm font-bold leading-tight">Equipo de mediación</p>
          <p className="mt-0.5 text-[11px] text-faint">escucha a los dos</p>
        </div>
        <span className="text-2xl text-teal">⇄</span>
        {sala("🔧", "Sala de Diego", "«Yo cumplí con traer los equipos.»", "0.8s")}
      </div>
      <div className="mx-auto mt-6 flex max-w-2xl items-center gap-3">
        <div className="h-px flex-1 border-t-2 border-dashed border-magenta/50" />
        <p className="shrink-0 rounded-full border border-magenta/50 bg-magenta/10 px-4 py-1.5 text-sm font-semibold text-magenta">
          ✕ entre salas no viaja nada sin autorización
        </p>
        <div className="h-px flex-1 border-t-2 border-dashed border-magenta/50" />
      </div>
    </div>
  );
}

/** El careo de la etapa 2: qué capta cada uno del mismo audio. */
export function DiagramaVs() {
  return (
    <div className="mx-auto mt-8 flex w-full max-w-5xl flex-wrap items-stretch justify-center gap-4 lg:flex-nowrap">
      <div className="vaiven min-w-0 flex-1 rounded-2xl border border-teal/50 bg-teal/5 p-5">
        <div className="flex items-center gap-3">
          <span className="text-3xl">👂</span>
          <p className="text-lg font-bold text-teal">El mediador</p>
          <span className="ml-auto flex items-end gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="onda w-1.5 rounded-full bg-teal/70" style={{ animationDelay: `${i * 0.14}s` }} />
            ))}
          </span>
        </div>
        <ul className="mt-3 space-y-2 text-base leading-snug">
          <li>🎭 capta el tono, el miedo, el orgullo</li>
          <li>🤫 distingue y custodia lo confidencial</li>
          <li>💡 intuye el acuerdo que nadie dijo</li>
          <li>🐢 escribe más lento, capta menos datos</li>
        </ul>
      </div>

      <div className="flex shrink-0 flex-col items-center justify-center gap-1 px-2">
        <div className="pulse-ring flex size-20 items-center justify-center rounded-full border-gradient bg-ink-2/70">
          <p className="font-mono text-xl font-bold text-violet">P10</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-faint">el careo</p>
      </div>

      <div className="vaiven min-w-0 flex-1 rounded-2xl border border-violet/50 bg-violet/5 p-5" style={{ animationDelay: "1s" }}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          <p className="text-lg font-bold text-violet">La IA</p>
          <span className="ml-auto size-2.5 animate-pulse rounded-full bg-violet" />
        </div>
        <ul className="mt-3 space-y-2 text-base leading-snug">
          <li>⚡ transcribe 2 minutos en segundos</li>
          <li>🗂️ ordena fechas y montos sin cansarse</li>
          <li>🌫️ no escucha el tono ni el silencio</li>
          <li>🔓 mezcla lo confidencial con todo</li>
        </ul>
      </div>
    </div>
  );
}

/** Deep Research: un agente que planifica, busca, lee y cita; la persona verifica. */
export function DiagramaResearch() {
  const pasos: [string, string][] = [
    ["🎯", "misión"],
    ["🧠", "planifica"],
    ["🌐", "busca"],
    ["📖", "lee y cruza"],
    ["🔗", "informe con citas"],
  ];
  return (
    <div className="mx-auto mt-8 w-full max-w-5xl">
      <div className="flex items-center justify-end">
        <p className="rounded-full border border-line bg-panel/60 px-3.5 py-1.5 text-sm text-muted">⏱ tarda 5–15 min · lancen y sigan con la etapa 6</p>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:flex-nowrap lg:gap-0">
        {pasos.map(([e, t], i) => (
          <div key={t} className="flex items-center">
            <div
              className="flex w-36 flex-col items-center rounded-2xl border border-line bg-panel/50 px-3 py-4 text-center"
            >
              <span className="animate-pulse text-3xl" style={{ animationDelay: `${i * 0.45}s`, animationDuration: "2.6s" }}>
                {e}
              </span>
              <p className="mt-1.5 text-sm font-semibold leading-tight">{t}</p>
            </div>
            {i < pasos.length - 1 && <span className="px-1.5 text-xl text-faint lg:px-2">→</span>}
          </div>
        ))}
        <span className="px-1.5 text-xl text-teal lg:px-2">⇒</span>
        <div className="vaiven flex w-44 flex-col items-center rounded-2xl border-2 border-teal bg-teal/10 px-3 py-4 text-center">
          <span className="text-3xl">🕵️</span>
          <p className="mt-1.5 text-sm font-bold leading-tight text-teal">USTED abre cada fuente y verifica</p>
        </div>
      </div>
      <p className="mt-5 text-center text-base text-muted">
        Es el mismo control de siempre: <b className="text-foreground">un dato sin fuente verificada no entra a la mediación</b>.
      </p>
    </div>
  );
}

/** El mapa de las 8 etapas (cierre): el método completo de un vistazo. */
export function MapaTaller({ hechas }: { hechas?: boolean }) {
  return (
    <div className="mx-auto mt-8 grid w-full max-w-5xl grid-cols-2 gap-3 sm:grid-cols-4">
      {TAL_ETAPAS.map((e, i) => (
        <div
          key={e.n}
          className="vaiven relative rounded-2xl border border-line bg-panel/50 p-4"
          style={{ animationDelay: `${i * 0.35}s` }}
        >
          {hechas && <span className="absolute right-3 top-3 text-teal">✓</span>}
          <p className="font-mono text-xs text-faint">etapa {e.n}</p>
          <p className="mt-1 text-2xl">{e.emoji}</p>
          <p className="mt-1 text-base font-bold leading-tight">{e.titulo}</p>
          <p className="mt-1 text-xs leading-snug text-muted">{e.bajada}</p>
        </div>
      ))}
    </div>
  );
}
