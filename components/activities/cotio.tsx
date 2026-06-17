"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { COTIO_VARS } from "@/lib/constants";
import type { CotioAnalysis } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Cotio({ slug }: ActivityProps) {
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<CotioAnalysis | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function analyze() {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${slug}/cotio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) setAnalysis(d.analysis);
    else setErr(d.error || "Error");
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Método COTIO + optimizador</h2>
      <p className="mt-1 text-sm text-muted">
        Escribí un prompt. El optimizador lo analiza variable por variable.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {COTIO_VARS.map((v) => (
          <span key={v.key} className="rounded-lg border border-line bg-panel/40 px-2.5 py-1 text-xs">
            <b className="text-teal">{v.letter}</b> <span className="text-muted">{v.name}</span>
          </span>
        ))}
      </div>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={5}
        placeholder="Escribí tu prompt acá…"
        className="mt-4 w-full resize-y rounded-xl border border-line bg-ink-2/70 p-4 text-sm outline-none placeholder:text-faint focus:border-teal/60"
      />
      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
      <Button onClick={analyze} disabled={busy || prompt.trim().length < 5} className="mt-3 w-full">
        {busy ? <Spinner /> : "Analizar mi prompt"}
      </Button>

      {analysis && (
        <div className="mt-6 space-y-4 rise">
          <div className="flex items-center gap-3">
            <ScoreRing value={analysis.overall} />
            <div>
              <p className="text-sm font-semibold">Puntaje general</p>
              <p className="text-xs text-muted">Cuánto cubre tu prompt el método COTIO.</p>
            </div>
          </div>

          <div className="space-y-2">
            {COTIO_VARS.map((v) => {
              const s = analysis.scores.find((x) => x.var === v.key);
              const score = s?.score ?? 0;
              return (
                <div key={v.key} className="rounded-xl border border-line bg-panel/40 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      <b className="text-teal">{v.letter}</b> {v.name}
                    </span>
                    <span className={cn(score >= 60 ? "text-teal" : "text-faint")}>{score}</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ink-2">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  {s?.feedback && <p className="mt-2 text-xs text-muted">{s.feedback}</p>}
                </div>
              );
            })}
          </div>

          {analysis.confidential?.found && (
            <div className="rounded-xl border border-magenta/50 bg-magenta/10 p-4">
              <p className="text-sm font-semibold text-magenta">⚠️ Confidencialidad</p>
              <p className="mt-1 text-xs text-muted">{analysis.confidential.note}</p>
            </div>
          )}

          {analysis.improved_prompt && (
            <div className="rounded-xl border border-teal/40 bg-teal/5 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-teal">Prompt optimizado</p>
                <button
                  onClick={() => navigator.clipboard?.writeText(analysis.improved_prompt)}
                  className="text-xs text-faint hover:text-teal"
                >
                  Copiar
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {analysis.improved_prompt}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const deg = (value / 100) * 360;
  return (
    <div
      className="grid size-14 shrink-0 place-items-center rounded-full"
      style={{ background: `conic-gradient(#5eead4 ${deg}deg, #2f2270 ${deg}deg)` }}
    >
      <div className="grid size-11 place-items-center rounded-full bg-ink">
        <span className="text-sm font-bold">{value}</span>
      </div>
    </div>
  );
}
