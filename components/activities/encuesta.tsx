"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { ENCUESTA_QUESTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Encuesta({ slug }: ActivityProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function pick(qId: string, optId: string) {
    const next = { ...answers, [qId]: optId };
    setAnswers(next);
    fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "encuesta", payload: { answers: next } }),
    }).catch(() => {});
  }

  const done = Object.keys(answers).length;

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Encuesta relámpago</h2>
      <p className="mt-1 text-sm text-muted">Tres preguntas rápidas para conocer al grupo.</p>

      <div className="mt-5 space-y-5">
        {ENCUESTA_QUESTIONS.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium">
              <span className="mr-1 text-faint">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = answers[q.id] === o.id;
                return (
                  <button
                    key={o.id}
                    onClick={() => pick(q.id, o.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition active:scale-[0.98]",
                      on
                        ? "border-teal/70 bg-teal/15 text-teal glow-teal"
                        : "border-line bg-panel/40 hover:border-faint",
                    )}
                  >
                    <span className="text-base">{o.emoji}</span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {done === ENCUESTA_QUESTIONS.length && (
        <p className="mt-5 rounded-xl border border-teal/40 bg-teal/10 p-3 text-center text-sm text-teal">
          ✓ ¡Listo! Mirá los resultados del grupo abajo.
        </p>
      )}
    </div>
  );
}
