"use client";

// BBV(AI): el acompañante de la clase en el celular o la compu del participante.
// Explica los conceptos de la clase 2 y ayuda a construir el asistente propio
// (conoce el borrador que la persona viene armando). API: /api/bbva/bbvai.

import { useEffect, useRef, useState } from "react";
import { BBVA_LOGO } from "@/lib/bbva-clase";

type Msg = { role: "user" | "assistant"; content: string };

const SUGERENCIAS = [
  "¿Qué va en instrucciones, qué en contexto y qué en conocimiento?",
  "Ayudame a mejorar mi borrador",
  "¿Cómo creo mi Gem en Gemini?",
  "¿Cómo pruebo si mi asistente funciona?",
];

const GUARDA = "bbvai-chat";

/** Saca el Markdown más común para leerlo limpio en el celular. */
const limpio = (t: string) => t.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#{1,6}\s*/gm, "").replace(/^\s*[-*]\s+/gm, "• ");

function Marca({ className }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.15em] ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={BBVA_LOGO} alt="BBV" className="h-[0.9em] w-auto" />
      <span className="font-mono font-semibold tracking-tight text-[#004481]">(AI)</span>
    </span>
  );
}

export function BBVAI({
  abierto,
  onCerrar,
  enPantalla,
  borrador,
}: {
  abierto: boolean;
  onCerrar: () => void;
  enPantalla: string | null;
  borrador: string;
}) {
  const setAbierto = (v: boolean) => !v && onCerrar();
  const [msgs, setMsgs] = useState<Msg[]>(() => {
    try {
      const g = sessionStorage.getItem(GUARDA);
      return g ? (JSON.parse(g) as Msg[]) : [];
    } catch {
      return [];
    }
  });
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fin = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(GUARDA, JSON.stringify(msgs.slice(-30)));
    } catch {
      /* sin almacenamiento */
    }
    fin.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, pensando, abierto]);

  async function preguntar(q: string) {
    const pregunta = q.trim();
    if (!pregunta || pensando) return;
    const nuevos: Msg[] = [...msgs, { role: "user", content: pregunta }];
    setMsgs(nuevos);
    setTexto("");
    setError(null);
    setPensando(true);
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 45000);
      const r = await fetch("/api/bbva/bbvai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nuevos.slice(-12), enPantalla, borrador }),
        signal: ctrl.signal,
      });
      clearTimeout(t);
      const d = (await r.json().catch(() => ({}))) as { respuesta?: string; error?: string };
      if (r.ok && d.respuesta) setMsgs((m) => [...m, { role: "assistant", content: d.respuesta! }]);
      else setError(d.error ?? "No pude responder. Probá de nuevo.");
    } catch {
      setError("Sin conexión. Probá de nuevo.");
    } finally {
      setPensando(false);
    }
  }

  if (!abierto) return null;

  return (
    // Celular: hoja desde abajo (deja ver el encabezado y lo de arriba). Compu: panel lateral, la actividad queda a la vista.
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex justify-center xl:inset-x-auto xl:inset-y-0 xl:right-0">
      <section
        role="dialog"
        aria-label="BBV(AI)"
        className="alu-entra pointer-events-auto flex h-[72dvh] w-full max-w-md flex-col rounded-t-[14px] border-t-[1.5px] border-[#004481]/30 bg-papel shadow-[0_-18px_40px_-20px_rgba(0,0,0,0.55)] xl:h-full xl:w-[25rem] xl:rounded-none xl:border-l-[1.5px] xl:border-t-0 xl:shadow-[-18px_0_40px_-24px_rgba(0,0,0,0.5)]"
      >
        <header className="flex items-center justify-between border-b border-tinta/10 px-4 py-3">
          <div>
            <Marca className="text-[1.35rem]" />
            <p className="mt-0.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-gris">Tu acompañante de la clase · solo sobre esta clase</p>
          </div>
          <button type="button" onClick={() => setAbierto(false)} className="alu-boton grid size-11 place-items-center rounded-full font-mono text-lg text-grafito" aria-label="Cerrar">
            ✕
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          {msgs.length === 0 && (
            <div>
              <p className="bbva-serif text-[1.15rem] leading-snug text-tinta">
                Hola. Te acompaño durante la clase: te explico los conceptos y te ayudo a construir tu asistente. ¿Por dónde empezamos?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {SUGERENCIAS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => preguntar(s)}
                    className="alu-boton rounded-[4px] border border-tinta/25 bg-blanco px-3 py-2.5 text-left text-[0.95rem] text-tinta"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <ol className="flex flex-col gap-3">
            {msgs.map((m, i) => (
              <li
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 self-end rounded-[10px] rounded-br-[3px] bg-tinta px-3.5 py-2.5 text-[0.98rem] leading-snug text-papel"
                    : "mr-4 whitespace-pre-wrap rounded-[10px] rounded-bl-[3px] border border-tinta/10 bg-blanco px-3.5 py-2.5 text-[0.98rem] leading-snug text-tinta"
                }
              >
                {m.role === "assistant" ? limpio(m.content) : m.content}
              </li>
            ))}
            {pensando && <li className="mr-4 rounded-[10px] bg-blanco px-3.5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-gris">pensando…</li>}
          </ol>
          {error && <p className="mt-3 font-mono text-[11px] text-rojo">{error}</p>}
          <div ref={fin} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void preguntar(texto);
          }}
          className="flex items-end gap-2 border-t border-tinta/10 px-3 pb-[calc(env(safe-area-inset-bottom)+0.7rem)] pt-2.5"
        >
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void preguntar(texto);
              }
            }}
            rows={1}
            maxLength={2000}
            placeholder="Preguntale a BBV(AI)…"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-[6px] border-[1.5px] border-tinta/60 bg-blanco px-3 py-2.5 text-[1rem] text-tinta focus:border-[#004481] focus:outline-none"
          />
          <button
            type="submit"
            disabled={pensando || !texto.trim()}
            className="alu-boton min-h-11 rounded-[6px] bg-[#004481] px-4 font-mono text-[12px] font-semibold uppercase tracking-[0.12em] text-blanco disabled:opacity-40"
          >
            Enviar
          </button>
        </form>
      </section>
    </div>
  );
}
