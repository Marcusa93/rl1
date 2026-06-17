"use client";

import { useEffect, useState } from "react";
import type { ActivityProps } from "./student-activity";
import { VF_ITEMS, COURSE_BLOCKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function VerdaderoFalso({ slug, session }: ActivityProps) {
  const idx = Number(session.activity_config?.vf_index ?? 0);
  const revealed = Boolean(session.activity_config?.revealed);
  const item = VF_ITEMS[idx] ?? VF_ITEMS[0];

  const [answer, setAnswer] = useState<boolean | null>(null);

  // reset al cambiar de afirmación
  useEffect(() => {
    setAnswer(null);
  }, [idx]);

  async function send(val: boolean) {
    if (answer !== null || revealed) return;
    setAnswer(val);
    await fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity: "verdadero_falso",
        item_key: String(idx),
        payload: { index: idx, answer: val },
      }),
    });
  }

  const tagColor =
    item.tag === "tokens"
      ? "text-cyan"
      : item.tag === "alucinacion"
        ? "text-magenta"
        : "text-violet";

  return (
    <div className="rise">
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <MiniConcept title="Tokens" body={COURSE_BLOCKS.tokens} color="cyan" />
        <MiniConcept title="Alucinación" body={COURSE_BLOCKS.alucinacion} color="magenta" />
      </div>

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between text-xs">
          <span className={cn("font-mono uppercase tracking-wider", tagColor)}>{item.tag}</span>
          <span className="text-faint">
            {idx + 1} / {VF_ITEMS.length}
          </span>
        </div>
        <p className="mt-3 text-lg font-medium leading-snug">{item.statement}</p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <VFButton
            label="Verdadero"
            picked={answer === true}
            correct={revealed && item.answer === true}
            wrong={revealed && answer === true && item.answer !== true}
            disabled={answer !== null || revealed}
            onClick={() => send(true)}
          />
          <VFButton
            label="Falso"
            picked={answer === false}
            correct={revealed && item.answer === false}
            wrong={revealed && answer === false && item.answer !== false}
            disabled={answer !== null || revealed}
            onClick={() => send(false)}
          />
        </div>

        {answer !== null && !revealed && (
          <p className="mt-4 text-center text-sm text-teal">✓ Respuesta enviada. Esperá la reveal.</p>
        )}
        {revealed && (
          <div className="mt-4 rounded-xl border border-line bg-ink-2/60 p-4 text-sm">
            <p className="font-semibold text-teal">
              Respuesta: {item.answer ? "Verdadero" : "Falso"}
            </p>
            <p className="mt-1 text-muted">{item.explain}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniConcept({
  title,
  body,
  color,
}: {
  title: string;
  body: string;
  color: "cyan" | "magenta";
}) {
  return (
    <div className="rounded-xl border border-line bg-panel/40 p-3">
      <p className={cn("text-xs font-bold uppercase tracking-wider", color === "cyan" ? "text-cyan" : "text-magenta")}>
        {title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{body}</p>
    </div>
  );
}

function VFButton({
  label,
  picked,
  correct,
  wrong,
  disabled,
  onClick,
}: {
  label: string;
  picked: boolean;
  correct: boolean;
  wrong: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "rounded-2xl border py-6 text-lg font-semibold transition active:scale-[0.98]",
        correct
          ? "border-teal bg-teal/20 text-teal"
          : wrong
            ? "border-magenta bg-magenta/20 text-magenta"
            : picked
              ? "border-cyan bg-cyan/15 text-cyan"
              : "border-line bg-panel/40 hover:border-faint disabled:opacity-50",
      )}
    >
      {label}
    </button>
  );
}
