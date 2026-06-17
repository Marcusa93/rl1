"use client";

import { useEffect, useState } from "react";
import type { ActivityProps } from "./student-activity";
import { COTIO_VARS } from "@/lib/constants";
import type { CotioAnalysis, CotioStatus } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";
import { OpenInAi } from "@/components/open-in-ai";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<CotioStatus, string> = {
  presente: "border-teal/60 bg-teal/10 text-teal",
  incompleto: "border-cyan/50 bg-cyan/10 text-cyan",
  ausente: "border-magenta/40 bg-magenta/10 text-magenta",
};

export function Cotio({ slug }: ActivityProps) {
  const [prompt, setPrompt] = useState("");
  const [analysis, setAnalysis] = useState<CotioAnalysis | null>(null);
  const [improved, setImproved] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (analysis?.improved_prompt) setImproved(analysis.improved_prompt);
  }, [analysis]);

  async function analyze() {
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${slug}/cotio`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const d = await res.json().catch(() => ({ error: "Error de red" }));
    setBusy(false);
    if (res.ok) setAnalysis(d.analysis);
    else setErr(d.error || "Error");
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Optimizador COTIO</h2>
      <p className="mt-1 text-sm text-muted">
        Escribí un prompt como lo harías naturalmente. La IA lo analiza variable por variable.
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
        <div className="rise mt-6 space-y-4">
          {analysis.off_topic ? (
            <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-4 text-sm text-muted">
              {analysis.suggestions?.[0] ??
                "Este prompt no parece de tu práctica profesional. Reformulalo con un caso jurídico tuyo."}
            </div>
          ) : (
            <>
              <p className="text-sm font-semibold text-muted">Análisis de tu prompt</p>
              <div className="space-y-2">
                {COTIO_VARS.map((v) => {
                  const s = analysis.scores.find((x) => x.var === v.key);
                  const status = s?.status ?? "ausente";
                  return (
                    <div key={v.key} className="rounded-xl border border-line bg-panel/40 p-3">
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="font-medium">
                          <b className="text-teal">{v.letter}</b> {v.name}
                        </span>
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase",
                            STATUS_STYLE[status],
                          )}
                        >
                          {status}
                        </span>
                      </div>
                      {s?.feedback && <p className="mt-1.5 text-xs text-muted">{s.feedback}</p>}
                    </div>
                  );
                })}
              </div>

              {analysis.suggestions?.length > 0 && (
                <div className="rounded-xl border border-line bg-ink-2/60 p-4">
                  <p className="text-sm font-semibold">Sugerencias de mejora</p>
                  <ul className="mt-2 list-disc space-y-1.5 pl-4 text-sm text-muted">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="rounded-xl border border-teal/40 bg-teal/5 p-4">
                <p className="text-sm font-semibold text-teal">Prompt mejorado (editalo si querés)</p>
                <textarea
                  value={improved}
                  onChange={(e) => setImproved(e.target.value)}
                  rows={7}
                  className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-3 font-mono text-xs leading-relaxed outline-none focus:border-teal/60"
                />
                <p className="mt-3 text-xs text-muted">Llevalo a la IA que uses:</p>
                <div className="mt-2">
                  <OpenInAi prompt={improved} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
