"use client";

import { MEMORIA_CARDS, MEMORIA_LINKS } from "@/lib/constants";

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

      <h3 className="mt-6 text-sm font-semibold text-muted">Configuralo en tu herramienta</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {MEMORIA_LINKS.map((t) => (
          <div key={t.tool} className="rounded-2xl border-gradient p-4">
            <p className="font-semibold text-teal">{t.tool}</p>
            <p className="mt-1 text-xs text-muted">{t.hint}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {t.links.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-line bg-panel/40 px-3 py-1.5 text-xs text-foreground transition hover:border-teal/60 hover:text-teal"
                >
                  {l.label} ↗
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
