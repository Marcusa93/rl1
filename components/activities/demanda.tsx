"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { COTIO_VARS, DEMANDA_BRIEF, DEMANDA_NAIVE_PLACEHOLDER } from "@/lib/constants";
import type { CotioVar } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";

export function Demanda({ slug }: ActivityProps) {
  const [naivePrompt, setNaivePrompt] = useState("");
  const [naiveOut, setNaiveOut] = useState("");
  const [fields, setFields] = useState<Record<CotioVar, string>>({
    contexto: "",
    objetivo: "",
    tarea: "",
    input: "",
    output: "",
  });
  const [cotioOut, setCotioOut] = useState("");
  const [verif, setVerif] = useState<string[]>([]);
  const [busy, setBusy] = useState<"naive" | "cotio" | null>(null);
  const [err, setErr] = useState("");

  async function gen(mode: "naive" | "cotio") {
    setBusy(mode);
    setErr("");
    const body =
      mode === "naive"
        ? { mode, naive_prompt: naivePrompt }
        : { mode, cotio: fields };
    const res = await fetch(`/api/session/${slug}/demanda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const d = await res.json();
    setBusy(null);
    if (!res.ok) {
      setErr(d.error || "Error");
      return;
    }
    if (mode === "naive") setNaiveOut(d.payload.naive_output || "");
    else {
      setCotioOut(d.payload.cotio_output || "");
      setVerif(d.payload.verification || []);
    }
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Demanda laboral: sin método vs COTIO</h2>
      <p className="mt-1 text-sm text-muted">{DEMANDA_BRIEF}</p>
      <p className="mt-2 rounded-lg border border-magenta/30 bg-magenta/5 px-3 py-2 text-xs text-muted">
        🔒 Confidencialidad: no cargues datos reales de clientes ni expedientes. Usá datos ficticios.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* Sin método */}
        <div className="rounded-2xl border border-line bg-panel/40 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-faint">1 · Sin método</p>
          <textarea
            value={naivePrompt}
            onChange={(e) => setNaivePrompt(e.target.value)}
            rows={3}
            placeholder={DEMANDA_NAIVE_PLACEHOLDER}
            className="mt-2 w-full resize-y rounded-xl border border-line bg-ink-2/70 p-3 text-sm outline-none placeholder:text-faint focus:border-faint"
          />
          <Button
            variant="outline"
            onClick={() => gen("naive")}
            disabled={busy !== null || naivePrompt.trim().length < 3}
            className="mt-2 w-full"
          >
            {busy === "naive" ? <Spinner /> : "Generar sin método"}
          </Button>
          {naiveOut && <OutputBox text={naiveOut} tone="faint" />}
        </div>

        {/* Con COTIO */}
        <div className="rounded-2xl border-gradient p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">2 · Con COTIO</p>
          <div className="mt-2 space-y-2">
            {COTIO_VARS.map((v) => (
              <div key={v.key}>
                <label className="text-xs text-muted">
                  <b className="text-teal">{v.letter}</b> · {v.question}
                </label>
                <textarea
                  value={fields[v.key]}
                  onChange={(e) => setFields((f) => ({ ...f, [v.key]: e.target.value }))}
                  rows={2}
                  placeholder={v.placeholder}
                  className="mt-1 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2 text-sm outline-none placeholder:text-faint focus:border-teal/60"
                />
              </div>
            ))}
          </div>
          <Button
            onClick={() => gen("cotio")}
            disabled={busy !== null}
            className="mt-3 w-full"
          >
            {busy === "cotio" ? <Spinner /> : "Generar con COTIO"}
          </Button>
          {cotioOut && <OutputBox text={cotioOut} tone="teal" />}
          {verif.length > 0 && (
            <div className="mt-3 rounded-xl border border-cyan/40 bg-cyan/5 p-3">
              <p className="text-xs font-semibold text-cyan">🔎 Antes de presentar, verificá:</p>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-xs text-muted">
                {verif.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-magenta">{err}</p>}

      {naiveOut && cotioOut && (
        <p className="mt-5 rounded-xl border border-teal/40 bg-teal/10 p-4 text-center text-sm text-teal">
          La diferencia habla sola. Compará los dos resultados y comentá en clase.
        </p>
      )}
    </div>
  );
}

function OutputBox({ text, tone }: { text: string; tone: "teal" | "faint" }) {
  return (
    <div
      className={`mt-3 max-h-72 overflow-auto rounded-xl border bg-ink-2/60 p-3 ${
        tone === "teal" ? "border-teal/30" : "border-line"
      }`}
    >
      <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">{text}</p>
    </div>
  );
}
