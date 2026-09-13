"use client";

// Tarjetas explorables de una placa: el docente toca una (o aprieta 1–9) y
// se despliega su explicación, con un ejemplo opcional de pedido a la IA y
// respuesta. Esc o 0 la cierra. Genérico: lo puede usar cualquier deck.

import { useEffect, useState } from "react";
import type { Explorable } from "@/lib/clase-vivo";
import { cn } from "@/lib/utils";

export function Explorables({ items, columnas = 2 }: { items: Explorable[]; columnas?: 1 | 2 }) {
  const [sel, setSel] = useState<number | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= items.length) setSel(n - 1);
      else if (e.key === "0" || e.key === "Escape") setSel(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length]);

  const actual = sel === null ? null : items[sel];

  return (
    <div className="flex flex-col gap-3">
      <div className={cn("grid gap-2", columnas === 2 && "sm:grid-cols-2")}>
        {items.map((it, i) => {
          const on = sel === i;
          return (
            <button
              key={it.label}
              onClick={() => setSel(on ? null : i)}
              className={cn(
                "rise flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition active:scale-[0.98]",
                on ? "border-teal bg-teal/15 text-teal glow-teal" : "border-line bg-panel/50 hover:border-teal/50",
              )}
              style={{ animationDelay: `${0.3 + i * 0.07}s` }}
              aria-pressed={on}
            >
              <span className="text-xl">{it.emoji}</span>
              <span className="min-w-0 flex-1 text-sm font-medium leading-snug sm:text-base">{it.label}</span>
              <span className="hidden font-mono text-[10px] text-faint lg:inline">{i + 1}</span>
            </button>
          );
        })}
      </div>

      {actual ? (
        <div key={sel} className="rise glass rounded-2xl p-4 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-bold text-teal">
            <span className="text-lg">{actual.emoji}</span>
            {actual.label}
          </p>
          <p className="mt-2 text-base leading-relaxed text-foreground sm:text-lg">{actual.texto}</p>
          {actual.ejemplo && (
            <div className="mt-3 space-y-2">
              <div className="rounded-xl border border-violet/40 bg-violet/10 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-violet">Pedido</p>
                <p className="mt-1 font-mono text-sm leading-relaxed">{actual.ejemplo.pedido}</p>
              </div>
              <div className="rise rounded-xl border border-teal/40 bg-teal/10 p-3" style={{ animationDelay: "0.35s" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider text-teal">Respuesta · ejemplo ilustrativo</p>
                <p className="mt-1 text-sm leading-relaxed">{actual.ejemplo.respuesta}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-xs text-faint">Toque una tarjeta para ver más</p>
      )}
    </div>
  );
}
