"use client";

// La sala de entrevistas: dos pestañas (Lucía y Diego) donde el participante
// pregunta y la parte responde en personaje. Las conversaciones quedan en la
// compu y se copian con un botón para llevarlas al Gem. Tope de 30 preguntas.

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/lib/openrouter";
import { PARTES, type ParteId } from "@/lib/partes";
import { BotonCopiar } from "@/components/taller/piezas";
import { Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

const LS = "tal-entrevistas";

type Historias = Record<ParteId, ChatMessage[]>;

function leer(): Historias {
  try {
    const d = JSON.parse(localStorage.getItem(LS) ?? "{}");
    return { lucia: d.lucia ?? [], diego: d.diego ?? [] };
  } catch {
    return { lucia: [], diego: [] };
  }
}

function comoTexto(h: Historias): string {
  const bloque = (id: ParteId) =>
    h[id].length
      ? `— ENTREVISTA A ${PARTES[id].nombre.toUpperCase()} —\n${h[id].map((m) => `${m.role === "user" ? "MEDIADOR/A" : PARTES[id].nombre.split(" ")[0].toUpperCase()}: ${m.content}`).join("\n")}`
      : "";
  return ["MI SALA DE ENTREVISTAS (preguntas propias a las partes)", bloque("lucia"), bloque("diego")].filter(Boolean).join("\n\n");
}

export function SalaEntrevistas() {
  const [parte, setParte] = useState<ParteId>("lucia");
  const [historias, setHistorias] = useState<Historias>({ lucia: [], diego: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const listaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHistorias(leer()), []);
  // Baja al último mensaje moviendo solo la conversación (nunca la página).
  useEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [historias, busy, parte]);

  function guardar(next: Historias) {
    setHistorias(next);
    try {
      localStorage.setItem(LS, JSON.stringify(next));
    } catch {}
  }

  async function preguntar(texto: string) {
    const clean = texto.trim();
    if (!clean || busy) return;
    setErr("");
    setInput("");
    const previa = historias[parte];
    const conPregunta: ChatMessage[] = [...previa, { role: "user", content: clean }];
    guardar({ ...historias, [parte]: [...conPregunta, { role: "assistant", content: "" }] });
    setBusy(true);
    try {
      const res = await fetch("/api/partes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parte, messages: conPregunta }),
      });
      if (!res.ok || !res.body) {
        let msg = "La parte no responde; pruebe de nuevo";
        try {
          msg = (await res.json()).error || msg;
        } catch {}
        throw new Error(msg);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acumulado = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acumulado += decoder.decode(value, { stream: true });
        const parcial = acumulado;
        setHistorias((prev) => ({ ...prev, [parte]: [...conPregunta, { role: "assistant", content: parcial }] }));
      }
      guardar({ ...historias, [parte]: [...conPregunta, { role: "assistant", content: acumulado }] });
    } catch (e) {
      setErr((e as Error).message);
      guardar({ ...historias, [parte]: previa });
      setInput(clean);
    } finally {
      setBusy(false);
    }
  }

  const h = historias[parte];
  const info = PARTES[parte];
  const esLucia = parte === "lucia";

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-ink-2/40">
      <div className="flex items-center gap-2 border-b border-line/60 bg-panel/50 px-3 py-2.5">
        <p className="min-w-0 flex-1 truncate text-xs font-bold uppercase tracking-widest text-teal">🎤 Sala de entrevistas · responden en personaje</p>
        <BotonCopiar texto={comoTexto(historias)} label="Copiar todo" />
      </div>

      {/* Pestañas */}
      <div className="flex gap-1.5 px-3 pt-3">
        {(Object.keys(PARTES) as ParteId[]).map((id) => (
          <button
            key={id}
            onClick={() => setParte(id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-base font-semibold transition",
              parte === id
                ? id === "lucia"
                  ? "border-amber-300/60 bg-amber-400/15 text-amber-200"
                  : "border-cyan/60 bg-cyan/10 text-cyan"
                : "border-line bg-panel/40 text-muted",
            )}
          >
            <span className="text-xl">{PARTES[id].emoji}</span>
            {PARTES[id].nombre.split(" ")[0]}
            {historias[id].length > 0 && <span className="font-mono text-xs text-faint">({Math.ceil(historias[id].length / 2)})</span>}
          </button>
        ))}
      </div>

      {/* Conversación */}
      <div ref={listaRef} className="max-h-80 space-y-2.5 overflow-y-auto p-3 xl:max-h-[26rem]">
        <div className={cn("rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed", esLucia ? "border-amber-300/40 bg-amber-400/5" : "border-cyan/40 bg-cyan/5")}>
          <b>
            {info.emoji} {info.nombre}
          </b>{" "}
          <span className="text-muted">({info.rol}) está en la sala. Pruebe la diferencia entre una pregunta cerrada y una abierta: el personaje reacciona a su técnica.</span>
        </div>
        {h.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div
              className={cn(
                "max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                m.role === "user"
                  ? "bg-gradient-to-r from-teal to-cyan text-ink"
                  : esLucia
                    ? "border border-amber-300/40 bg-amber-400/10"
                    : "border border-cyan/40 bg-cyan/10",
              )}
            >
              {m.content || (busy && i === h.length - 1 ? <Spinner /> : null)}
            </div>
          </div>
        ))}
        {h.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(esLucia
              ? ["Cuénteme, ¿cómo vive esto de la apertura de mañana?", "¿Usted firmó que recibió todo, sí o no?"]
              : ["Cuénteme de su trabajo, ¿cómo llegó a este oficio?", "¿Por qué reclamó 3.000 si le deben 1.000?"]
            ).map((a) => (
              <button
                key={a}
                onClick={() => preguntar(a)}
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
              preguntar(input);
            }
          }}
          rows={1}
          placeholder={`Su pregunta a ${info.nombre.split(" ")[0]}… (Enter envía)`}
          className="max-h-24 flex-1 resize-none rounded-xl border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
        <button
          onClick={() => preguntar(input)}
          disabled={busy || !input.trim()}
          className="rounded-xl bg-gradient-to-r from-teal to-cyan px-3.5 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
        >
          {busy ? <Spinner /> : "➤"}
        </button>
      </div>
      <p className="border-t border-line/40 px-3 py-1.5 text-center text-[10px] text-faint">Hasta 30 preguntas por compu, entre las dos partes · las entrevistas quedan guardadas acá</p>
    </div>
  );
}
