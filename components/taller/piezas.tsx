"use client";

// Piezas visuales del taller: documentos del caso, prompts guiados, los dos
// recorridos (CASO y TRABAJO), la matriz de trabajo y el recorrido final.
// Las usan el deck (/taller-ia/clase) y el tutor del grupo (/taller-ia).

import { useState } from "react";
import { rem } from "@/lib/remoto";
import { RECORRIDO_CASO, RECORRIDO_TRABAJO, type DocTaller, type PromptTaller } from "@/lib/taller-caso";
import { cn } from "@/lib/utils";

/** Copia al portapapeles, con respaldo para navegadores sin permiso de clipboard. */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export function BotonCopiar({ texto, label = "Copiar", className }: { texto: string; label?: string; className?: string }) {
  const [estado, setEstado] = useState<"" | "ok" | "error">("");
  return (
    <button
      onClick={async () => {
        const ok = await copiarTexto(texto);
        setEstado(ok ? "ok" : "error");
        setTimeout(() => setEstado(""), 1800);
      }}
      className={cn(
        "shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition active:scale-95",
        estado === "ok" ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300" : "border-line bg-panel/70 text-muted hover:text-teal",
        className,
      )}
    >
      {estado === "ok" ? "✓ Copiado" : estado === "error" ? "Selecciónelo a mano" : `📋 ${label}`}
    </button>
  );
}

// --- Documentos ----------------------------------------------------------------------

export function DocumentoCaso({ doc, grande }: { doc: DocTaller; grande?: boolean }) {
  const cab = (
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <p className={cn("font-bold uppercase tracking-wider text-zinc-500", grande ? "text-xs" : "text-[10px]")}>
        {doc.numero ? `Documento ${doc.numero} · ` : ""}
        {doc.origen}
      </p>
      <p className={cn("font-mono text-zinc-400", grande ? "text-[11px]" : "text-[10px]")}>ficticio</p>
    </div>
  );

  if (doc.tipo === "chat")
    return (
      <div className={cn("rounded-2xl bg-[#e9e4dc] text-zinc-900", grande ? "p-4 sm:p-5" : "p-3")}>
        {cab}
        <p className={cn("mt-1 font-semibold", grande ? "text-lg" : "text-sm")}>{doc.titulo}</p>
        <div className="mt-3 flex flex-col gap-2">
          {(doc.mensajes ?? []).map((m, i) => (
            <div key={i} className={cn("flex", m.quien === "LUCÍA" ? "justify-start" : "justify-end")}>
              <div
                className={cn(
                  "max-w-[88%] rounded-2xl px-3.5 py-2 shadow-sm",
                  m.quien === "LUCÍA" ? "rounded-tl-sm bg-white" : "rounded-tr-sm bg-[#d9fdd3]",
                )}
              >
                <p className={cn("font-semibold", grande ? "text-xs" : "text-[10px]", m.quien === "LUCÍA" ? "text-rose-700" : "text-emerald-800")}>
                  {m.quien} · {m.hora}
                </p>
                <p className={cn("leading-snug", grande ? "text-lg sm:text-xl" : "text-sm")}>{m.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  return (
    <div className={cn("rounded-2xl bg-white text-zinc-800", grande ? "p-5 sm:p-6" : "p-3.5")}>
      {cab}
      <p className={cn("mt-1 font-serif font-bold", grande ? "text-xl" : "text-sm")}>{doc.titulo}</p>
      <div className={cn("mt-2 space-y-2 font-serif leading-relaxed", grande ? "text-base sm:text-lg" : "text-[13px]")}>
        {(doc.parrafos ?? []).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

// --- Prompts ---------------------------------------------------------------------------

export function PromptCaja({ prompt, grande }: { prompt: PromptTaller; grande?: boolean }) {
  return (
    <div className={cn("rounded-2xl border border-violet/50 bg-violet/10", grande ? "p-5" : "p-3.5")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={cn("font-bold uppercase tracking-wider text-violet", grande ? "text-xs" : "text-[10px]")}>Prompt guiado · {prompt.para}</p>
          <p className={cn("font-semibold", grande ? "text-lg" : "text-sm")}>{prompt.titulo}</p>
        </div>
        <BotonCopiar texto={prompt.texto} />
      </div>
      <pre className={cn("mt-3 whitespace-pre-wrap font-mono leading-relaxed text-foreground", grande ? "text-base sm:text-lg" : "text-[12.5px]")}>
        {prompt.texto}
      </pre>
    </div>
  );
}

// --- Los dos recorridos ---------------------------------------------------------------------

function Fila({ nombre, pasos, actual, color }: { nombre: string; pasos: string[]; actual?: number; color: "teal" | "violet" }) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className={cn("w-16 shrink-0 font-mono text-[10px] font-bold uppercase tracking-widest", color === "teal" ? "text-teal" : "text-violet")}>
        {nombre}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {pasos.map((p, i) => {
          const on = actual === i;
          const hecho = actual !== undefined && i < actual;
          return (
            <span key={p} className="flex items-center gap-1">
              <span
                className={cn(
                  "whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] transition sm:text-xs",
                  on
                    ? color === "teal"
                      ? "border-teal bg-teal/20 font-semibold text-teal"
                      : "border-violet bg-violet/20 font-semibold text-violet-200"
                    : hecho
                      ? "border-line text-muted"
                      : "border-line/50 text-faint",
                )}
              >
                {p}
              </span>
              {i < pasos.length - 1 && <span className="text-[10px] text-faint">→</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Barra compacta con la etapa actual de cada recorrido. */
export function BarraRecorridos({ caso, trabajo }: { caso?: number; trabajo?: number }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-line/60 bg-ink-2/50 px-3 py-2">
      <Fila nombre="Caso" pasos={RECORRIDO_CASO} actual={caso} color="teal" />
      <Fila nombre="Trabajo" pasos={RECORRIDO_TRABAJO} actual={trabajo} color="violet" />
    </div>
  );
}

/** Versión grande para la placa "Dos recorridos al mismo tiempo". */
export function RecorridosGrande() {
  const bloque = (titulo: string, pasos: string[], color: "teal" | "violet", nota: string) => (
    <div className="glass rounded-2xl p-5">
      <p className={cn("font-mono text-sm font-bold uppercase tracking-[0.25em]", color === "teal" ? "text-teal" : "text-violet")}>{titulo}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {pasos.map((p, i) => (
          <span key={p} className="rise flex items-center gap-2" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
            <span
              className={cn(
                "rounded-xl border px-3.5 py-2 text-base font-semibold sm:text-lg",
                color === "teal" ? "border-teal/60 bg-teal/10" : "border-violet/60 bg-violet/10",
              )}
            >
              {p}
            </span>
            {i < pasos.length - 1 && <span className="text-faint">→</span>}
          </span>
        ))}
      </div>
      <p className="mt-4 text-base text-muted">{nota}</p>
    </div>
  );
  return (
    <div className="mt-6 grid gap-4">
      {bloque("Caso", RECORRIDO_CASO, "teal", "Lo administra el simulador: la información aparece según lo que decidan.")}
      {bloque("Trabajo", RECORRIDO_TRABAJO, "violet", "Lo organiza el tutor: qué pedir, qué verificar y qué registrar.")}
    </div>
  );
}

// --- Matriz de trabajo --------------------------------------------------------------------

const MATRIZ: [string, string, string][] = [
  ["Hecho", "Qué ocurrió o qué se afirma", "Lucía recibió las cajas el martes."],
  ["Fuente", "Documento que lo respalda", "Documento 2, mensaje de las 16:44."],
  ["Parte que lo sostiene", "Lucía, Diego o ambas", "Ambas."],
  ["Estado", "Confirmado, discutido o pendiente", "Confirmado."],
  ["Relevancia", "Por qué importa", "Separa la recepción de la instalación."],
  ["Próxima pregunta", "Qué necesitamos investigar", "¿Quién debía conseguir el módulo?"],
];

export function MatrizTrabajo() {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full min-w-[620px] border-separate border-spacing-y-1.5 text-left">
        <thead>
          <tr className="text-xs uppercase tracking-wider text-faint">
            <th className="px-3">Elemento</th>
            <th className="px-3">Registro del grupo</th>
            <th className="px-3">Ejemplo</th>
          </tr>
        </thead>
        <tbody>
          {MATRIZ.map(([e, r, ej], i) => (
            <tr key={e} className="rise glass" style={{ animationDelay: `${0.15 + i * 0.07}s` }}>
              <td className="rounded-l-xl px-3 py-2.5 text-base font-semibold text-teal sm:text-lg">{e}</td>
              <td className="px-3 py-2.5 text-base sm:text-lg">{r}</td>
              <td className="rounded-r-xl px-3 py-2.5 text-sm italic text-muted sm:text-base">{ej}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// --- Recorrido final ---------------------------------------------------------------------

const FINAL = [
  { emoji: "🧭", label: "Decisión inicial" },
  { emoji: "🗂️", label: "Documentos consultados" },
  { emoji: "✍️", label: "Prompts utilizados" },
  { emoji: "🤖", label: "Respuestas obtenidas" },
  { emoji: "✏️", label: "Correcciones humanas" },
  { emoji: "📄", label: "Producto final" },
  { emoji: "❓", label: "Cuestiones pendientes" },
];

export function RecorridoFinal() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {FINAL.map((f, i) => (
        <span key={f.label} className="rise flex items-center gap-2" style={{ animationDelay: `${0.15 + i * 0.12}s` }}>
          <span className={cn("glass flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-base font-semibold sm:text-lg", i === 4 && "ring-2 ring-teal/60")}>
            <span className="text-xl">{f.emoji}</span>
            {f.label}
          </span>
          {i < FINAL.length - 1 && <span className="text-faint">→</span>}
        </span>
      ))}
    </div>
  );
}

// --- Roles del grupo ------------------------------------------------------------------------

export function RolesGrupo() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {["🧭", "🤖", "🔍", "🎤"].map((e, i) => (
        <span key={e} className="rise flex size-16 items-center justify-center rounded-full border border-teal/50 bg-teal/10 text-3xl" style={{ animationDelay: `${0.15 + i * 0.1}s` }}>
          {e}
        </span>
      ))}
      <span className="rise rounded-full border border-dashed border-violet/60 px-4 py-2 text-base text-violet-200" style={{ animationDelay: "0.6s" }}>
        + 1 dispositivo con la app del grupo
      </span>
    </div>
  );
}

/** Botones de salto de una placa (bifurcaciones). */
export function Saltos({ saltos, onSalto }: { saltos: { label: string; a: string }[]; onSalto: (a: string) => void }) {
  return (
    <div className="mt-5 flex flex-wrap justify-end gap-3">
      {saltos.map((s) => (
        <button
          key={s.a + s.label}
          onClick={() => onSalto(s.a)}
          {...rem(s.label)}
          className="rounded-2xl border border-teal/60 bg-teal/10 px-5 py-3 text-base font-semibold text-teal transition hover:bg-teal/20 active:scale-[0.98] sm:text-lg"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
