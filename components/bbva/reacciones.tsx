"use client";

// Botonera de reacciones del Laboratorio BBVA (celular o compu del participante).
// Cada toque viaja a la pantalla grande, donde el deck las hace flotar con
// LluviaReacciones (components/clase/reacciones.tsx), por la misma API.
// Se esconde mientras la persona escribe (el teclado del celular la taparía).

import { useEffect, useRef, useState } from "react";
import { BBVA_REACCIONES, BBVA_SLUG } from "@/lib/bbva-clase";

type Eco = { id: number; emoji: string; x: number; dx: number; dur: number };

const PAUSA_MS = 350;

export function BotoneraReacciones() {
  const [ecos, setEcos] = useState<Eco[]>([]);
  const [aviso, setAviso] = useState("");
  const [escribiendo, setEscribiendo] = useState(false);
  const ultimo = useRef(0);
  const n = useRef(0);

  useEffect(() => {
    const esCampo = (el: EventTarget | null) =>
      el instanceof HTMLElement && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
    const entra = (e: FocusEvent) => esCampo(e.target) && setEscribiendo(true);
    const sale = (e: FocusEvent) => esCampo(e.target) && setEscribiendo(false);
    document.addEventListener("focusin", entra);
    document.addEventListener("focusout", sale);
    return () => {
      document.removeEventListener("focusin", entra);
      document.removeEventListener("focusout", sale);
    };
  }, []);

  function enviar(emoji: string, i: number, ahora: number) {
    if (ahora - ultimo.current < PAUSA_MS) return;
    ultimo.current = ahora;

    // Eco local: el emoji sube desde el botón tocado.
    const id = ++n.current;
    const eco: Eco = {
      id,
      emoji,
      x: ((i + 0.5) / BBVA_REACCIONES.length) * 100,
      dx: ((id % 5) - 2) * 1.2,
      dur: 1.4 + (id % 3) * 0.15,
    };
    setEcos((prev) => [...prev.slice(-10), eco]);
    setTimeout(() => setEcos((prev) => prev.filter((e) => e.id !== id)), eco.dur * 1000 + 100);
    try {
      navigator.vibrate?.(12);
    } catch {
      /* no todos vibran */
    }

    fetch(`/api/session/${BBVA_SLUG}/reaccion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    })
      .then((r) => setAviso(r.ok ? "" : r.status === 401 ? "Volvé a entrar para reaccionar" : "No llegó, probá de nuevo"))
      .catch(() => setAviso("Sin conexión"));
  }

  if (escribiendo) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto relative w-full max-w-md">
        {/* Ecos que suben desde la botonera */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-full h-[40vh] overflow-hidden">
          {ecos.map((e) => (
            <span
              key={e.id}
              className="flotar-corto absolute bottom-0 select-none text-[1.9rem]"
              style={{ left: `calc(${e.x}% - 0.95rem)`, "--dur": `${e.dur}s`, "--dx": `${e.dx}vw` } as React.CSSProperties}
            >
              {e.emoji}
            </span>
          ))}
        </div>

        <div className="rounded-[6px] border-[1.5px] border-tinta bg-blanco/95 px-2 pb-2 pt-1.5 shadow-[0_14px_28px_-16px_rgba(40,30,10,0.55)] backdrop-blur">
          <p className="mb-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-gris">
            {aviso || "Reaccioná · llega a la pantalla grande"}
          </p>
          <div className="flex items-center justify-between gap-1.5">
            {BBVA_REACCIONES.map((emoji, i) => (
              <button
                key={emoji}
                type="button"
                onClick={(ev) => enviar(emoji, i, ev.timeStamp)}
                className="bbva-boton flex h-11 flex-1 items-center justify-center rounded-[4px] border border-tinta/15 bg-papel text-[1.45rem] transition hover:border-naranja/60 hover:bg-blanco active:scale-90 active:border-naranja"
                aria-label={`Enviar ${emoji} a la pantalla`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
