"use client";

// MessIAs — el 10 de la mediación. Botón flotante con su cara en cada compu;
// guía el paso a paso de las herramientas y los conceptos, sin resolver el caso.

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/openrouter";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const AVATAR = "/taller-ia/messias.png";

const SALUDO =
  "¡Hola! Soy MessIAs, el 10 de la mediación ⚽. Estoy para guiarle el paso a paso: las herramientas, los conceptos y el caso. Si se traba en algo, acá me tiene. ¿Arrancamos?";

/** Atajos según la etapa abierta: las dudas más probables a un toque. */
const ATAJOS: Record<number, string[]> = {
  0: ["¿Cómo creo el Gem?", "No tengo cuenta de Google", "No me aparece la opción Gems"],
  1: ["¿Qué anoto en cada fila de la ficha?", "¿Qué es un caucus?", "¿Qué hago con lo confidencial?"],
  2: ["¿Cómo subo el audio a mi Gem?", "¿Cómo copio mi ficha?", "No tengo cuenta de Google en esta compu"],
  3: ["¿Cómo subo un PDF a Gemini?", "La IA no lee la imagen, ¿qué hago?", "¿Qué busco en el contrato?"],
  4: ["¿Cómo reviso la matriz?", "¿Qué es una inferencia?", "¿Para qué sirve mirar como la contraparte?"],
  5: ["No encuentro Deep Research", "¿Qué misión me conviene?", "¿Cómo verifico una fuente?"],
  6: ["¿Posiciones e intereses no son lo mismo?", "¿Qué tiene que tener el acuerdo?", "¿Qué es la MAAN?"],
  7: ["¿Cómo incorporo el documento nuevo?", "¿Qué ajusto del acuerdo?", "¿Qué presento en la puesta en común?"],
};

async function streamMessias(messages: ChatMessage[], onChunk: (t: string) => void): Promise<void> {
  const res = await fetch("/api/messias", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });
  if (!res.ok || !res.body) {
    let msg = "MessIAs no responde, pruebe de nuevo";
    try {
      msg = (await res.json()).error || msg;
    } catch {}
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}

export function MessIAs({ etapa, acoplado }: { etapa: number; /** Panel fijo en la columna derecha (escritorio). */ acoplado?: boolean }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);

  // Baja al último mensaje moviendo solo la lista (nunca la página).
  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, busy, open]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setErr("");
    setInput("");
    const next: ChatMessage[] = [...messages, { role: "user", content: clean }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setBusy(true);
    try {
      await streamMessias(next, (chunk) =>
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: copy[copy.length - 1].content + chunk };
          return copy;
        }),
      );
    } catch (e) {
      setErr((e as Error).message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setBusy(false);
    }
  }

  const atajos = ATAJOS[etapa] ?? ATAJOS[0];

  const panel = (
    <>
      <div className="flex items-center gap-3 border-b border-line/60 bg-gradient-to-r from-teal/15 to-violet/15 px-4 py-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={AVATAR} alt="MessIAs" className="size-10 rounded-full border border-teal/50 object-cover" />
        <div className="min-w-0">
          <p className="text-sm font-bold">MessIAs · el 10 de la mediación</p>
          <p className="truncate text-[11px] text-faint">Le guía el paso a paso · no resuelve el caso por usted</p>
        </div>
        {acoplado && <span className="ml-auto size-2 shrink-0 animate-pulse rounded-full bg-teal" />}
      </div>

      <div ref={listaRef} className="flex-1 space-y-3 overflow-y-auto p-3">
        <Burbuja rol="assistant">{SALUDO}</Burbuja>
        {messages.map((m, i) => (
          <Burbuja key={i} rol={m.role}>
            {m.content || (busy && i === messages.length - 1 ? <Spinner /> : null)}
          </Burbuja>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {atajos.map((a) => (
              <button
                key={a}
                onClick={() => send(a)}
                className="rounded-full border border-line bg-panel/40 px-2.5 py-1.5 text-xs text-muted transition hover:border-teal/60 hover:text-teal"
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {err && <p className="px-3 pb-1 text-xs text-magenta">{err}</p>}

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
          placeholder="Su duda… (Enter envía)"
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
    </>
  );

  if (acoplado) {
    return <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-teal/40 bg-ink/70 shadow-2xl backdrop-blur">{panel}</div>;
  }

  return (
    <>
      {/* Botón flotante con la cara (arriba de la barra de reacciones) */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir MessIAs, el asistente del taller"
        className={cn(
          "fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full shadow-xl transition active:scale-95",
          open ? "border border-line bg-panel p-2" : "border-2 border-teal/70 bg-ink p-1 pr-4",
        )}
      >
        {open ? (
          <span className="px-1.5 text-lg">✕</span>
        ) : (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={AVATAR} alt="" className="size-11 rounded-full border border-teal/40 object-cover" />
            <span className="text-sm font-bold text-teal">MessIAs</span>
          </>
        )}
      </button>

      {open && (
        <div className="fixed bottom-40 right-4 z-40 flex max-h-[64vh] w-[min(92vw,23rem)] flex-col overflow-hidden rounded-3xl border border-teal/40 bg-ink/95 shadow-2xl backdrop-blur rise">
          {panel}
        </div>
      )}
    </>
  );
}

function Burbuja({ rol, children }: { rol: "user" | "assistant" | "system"; children: React.ReactNode }) {
  return (
    <div className={cn("flex", rol === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          rol === "user" ? "bg-gradient-to-r from-teal to-cyan text-ink" : "border border-line bg-panel/60",
        )}
      >
        {children}
      </div>
    </div>
  );
}
