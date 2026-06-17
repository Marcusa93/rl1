"use client";

import { useEffect, useRef, useState } from "react";
import type { ActivityProps } from "./student-activity";
import type { ChatMessage } from "@/lib/openrouter";
import { streamGenerate } from "@/components/use-stream";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Chat({ slug }: ActivityProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const recorded = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setErr("");
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);

    if (!recorded.current) {
      recorded.current = true;
      fetch(`/api/session/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: "chat", payload: { used: true } }),
      }).catch(() => {});
    }

    try {
      await streamGenerate(slug, next, (chunk) => {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      });
    } catch (e) {
      setErr((e as Error).message);
      setMessages((prev) => prev.slice(0, -1)); // saca el placeholder vacío
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise flex flex-col" style={{ minHeight: "70vh" }}>
      <h2 className="text-xl font-semibold">Asistente IA</h2>
      <p className="mt-1 text-sm text-muted">
        Probá lo que quieras: redactar, resumir, explicar. Aplicá COTIO y vas a ver la diferencia.
      </p>
      <p className="mt-2 rounded-lg border border-magenta/30 bg-magenta/5 px-3 py-2 text-xs text-muted">
        🔒 No cargues datos reales de clientes ni expedientes. Verificá siempre el contenido jurídico.
      </p>

      <div className="mt-4 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-line bg-ink-2/40 p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-faint">
            Escribí tu primer mensaje para empezar.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-r from-teal to-cyan text-ink"
                  : "border border-line bg-panel/60",
              )}
            >
              {m.content || (busy && i === messages.length - 1 ? <Spinner /> : null)}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="Escribí tu mensaje… (Enter para enviar)"
          className="flex-1 resize-none rounded-xl border border-line bg-ink-2/70 p-3 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
        <Button onClick={send} disabled={busy || !input.trim()} className="h-12 px-5">
          {busy ? <Spinner /> : "Enviar"}
        </Button>
      </div>
    </div>
  );
}
