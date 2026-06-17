"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { ENCUESTA_QUESTIONS, type EncuestaQuestion } from "@/lib/constants";
import { cn } from "@/lib/utils";

type Answers = Record<string, string | string[]>;

export function Encuesta({ slug }: ActivityProps) {
  const [answers, setAnswers] = useState<Answers>({});

  function save(next: Answers) {
    setAnswers(next);
    fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "encuesta", payload: { answers: next } }),
    }).catch(() => {});
  }

  function pick(q: EncuestaQuestion, optId: string) {
    if (q.multi) {
      const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
      const nextArr = cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId];
      save({ ...answers, [q.id]: nextArr });
    } else {
      save({ ...answers, [q.id]: optId });
    }
  }

  function isOn(q: EncuestaQuestion, optId: string) {
    const v = answers[q.id];
    return Array.isArray(v) ? v.includes(optId) : v === optId;
  }

  const answered = ENCUESTA_QUESTIONS.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Encuesta relámpago</h2>
      <p className="mt-1 text-sm text-muted">Unas preguntas rápidas para conocer al grupo.</p>

      <div className="mt-5 space-y-5">
        {ENCUESTA_QUESTIONS.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium">
              <span className="mr-1 text-faint">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = isOn(q, o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => pick(q, o.id)}
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

      {answered === ENCUESTA_QUESTIONS.length && (
        <p className="mt-5 rounded-xl border border-teal/40 bg-teal/10 p-3 text-center text-sm text-teal">
          ✓ ¡Listo! Mirá los resultados del grupo abajo.
        </p>
      )}
    </div>
  );
}
