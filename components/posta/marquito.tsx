"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/openrouter";
import { buildMarquitoSystem, type MarquitoCtx } from "@/lib/posta";
import { streamGenerate } from "@/components/use-stream";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const SALUDO =
  "¡Hola! Soy Marquito, tu copiloto en esta clase. Te ayudo a moverte por la app y con el método de tu caso. ¿En qué te doy una mano?";

// Dudas frecuentes (las que más se repitieron): atajos de un toque.
const ATAJOS = [
  "¿Dónde estoy y qué hago ahora?",
  "No me sale abrir NotebookLM",
  "¿Cómo hago el pase?",
  "¿Voy a otra herramienta o me quedo acá?",
];

export function Marquito({
  slug,
  ctx,
  onUse,
}: {
  slug: string;
  ctx: MarquitoCtx;
  onUse?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  // ctx siempre fresco para el system prompt aunque cambie de estación mientras chatea
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setErr("");
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: clean }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    onUse?.();

    try {
      await streamGenerate(
        slug,
        next,
        (chunk) => {
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              role: "assistant",
              content: copy[copy.length - 1].content + chunk,
            };
            return copy;
          });
        },
        { system: buildMarquitoSystem(ctxRef.current), temperature: 0.4, maxTokens: 700 },
      );
    } catch (e) {
      setErr((e as Error).message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition",
          open
            ? "border border-line bg-panel text-muted"
            : "bg-gradient-to-r from-teal via-cyan to-violet text-ink",
        )}
        aria-label="Abrir el copiloto Marquito"
      >
        <span className="text-lg">{open ? "✕" : "💬"}</span>
        {!open && <span>Marquito</span>}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-5 z-30 flex max-h-[70vh] w-[min(92vw,22rem)] flex-col overflow-hidden rounded-2xl border border-line bg-ink/95 shadow-2xl backdrop-blur rise">
          <div className="flex items-center gap-2 border-b border-line/60 bg-panel/60 px-4 py-3">
            <span className="text-lg">🤖</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">Marquito · copiloto</p>
              <p className="truncate text-[11px] text-faint">
                Te ayuda con la app y tu caso · no hace el trabajo por vos
              </p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            <div className="flex justify-start">
              <div className="max-w-[88%] rounded-2xl border border-line bg-panel/60 px-3.5 py-2.5 text-sm leading-relaxed">
                {SALUDO}
              </div>
            </div>
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                    m.role === "user"
                      ? "bg-gradient-to-r from-teal to-cyan text-ink"
                      : "border border-line bg-panel/60",
                  )}
                >
                  {m.content || (busy && i === messages.length - 1 ? <Spinner /> : null)}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5">
                {ATAJOS.map((a) => (
                  <button
                    key={a}
                    onClick={() => send(a)}
                    className="rounded-full border border-line bg-panel/40 px-2.5 py-1 text-[11px] text-muted transition hover:border-teal/60 hover:text-teal"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {err && <p className="px-3 text-xs text-magenta">{err}</p>}

          <div className="flex items-end gap-2 border-t border-line/60 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Escribí tu duda… (Enter para enviar)"
              className="max-h-24 flex-1 resize-none rounded-xl border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
            />
            <button
              onClick={() => send(input)}
              disabled={busy || !input.trim()}
              className="rounded-xl bg-gradient-to-r from-teal to-cyan px-3.5 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
            >
              {busy ? <Spinner /> : "➤"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
