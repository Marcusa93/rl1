"use client";

import { MEMORIA_CARDS } from "@/lib/constants";

export function Memoria() {
  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Memorias y Proyectos en la IA</h2>
      <p className="mt-1 text-sm text-muted">
        Cómo lograr que la IA no arranque de cero cada vez — en Claude, ChatGPT o Gemini.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {MEMORIA_CARDS.map((c) => (
          <div key={c.title} className="rounded-2xl border border-line bg-panel/40 p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">{c.icon}</span>
              <h3 className="font-semibold">{c.title}</h3>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
