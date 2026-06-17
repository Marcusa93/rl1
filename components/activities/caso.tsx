"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import {
  CASO_FERNANDEZ_CONSIGNA,
  CASO_FERNANDEZ_MD,
  CLAUDE_URL,
  COTIO_VARS,
} from "@/lib/constants";
import type { CotioVar } from "@/lib/types";
import { Button, Spinner } from "@/components/ui";
import { Markdown } from "@/components/markdown";
import { streamGenerate } from "@/components/use-stream";

export function Caso({ slug }: ActivityProps) {
  const [fields, setFields] = useState<Record<CotioVar, string>>({
    contexto: "",
    objeto: "",
    tarea: "",
    input: "Uso el resumen del expediente Fernández que figura más abajo.",
    output: "",
  });
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function generar() {
    setBusy(true);
    setErr("");
    setOutput("");

    const built = COTIO_VARS.map((v) => `[${v.name.toUpperCase()}] ${fields[v.key].trim()}`).join("\n");
    const prompt = `${built}\n\n--- EXPEDIENTE (input) ---\n${CASO_FERNANDEZ_MD}`;

    let acc = "";
    try {
      await streamGenerate(
        slug,
        [{ role: "user", content: prompt }],
        (chunk) => {
          acc += chunk;
          setOutput((o) => o + chunk);
        },
        { maxTokens: 1800 },
      );
      // guarda el borrador para que todo el grupo lo vea en el feed
      fetch(`/api/session/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: "caso",
          payload: { done: true, output: acc.slice(0, 8000), objeto: fields.objeto },
        }),
      }).catch(() => {});
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const enoughFields =
    fields.contexto.trim() && fields.objeto.trim() && fields.tarea.trim();

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Ejercicio: el caso Fernández</h2>

      <div className="mt-3 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">Consigna</p>
        <p className="mt-1 text-sm text-muted">{CASO_FERNANDEZ_CONSIGNA}</p>
      </div>

      {/* COTIO builder */}
      <div className="mt-4 space-y-2">
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

      <Button onClick={generar} disabled={busy || !enoughFields} className="mt-3 w-full">
        {busy ? <Spinner /> : "✨ Generar borrador con IA"}
      </Button>

      {(output || busy) && (
        <div className="mt-4 rounded-2xl border border-teal/30 bg-ink-2/60 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal">Borrador generado</p>
          <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
            {output}
            {busy && <span className="ml-0.5 animate-pulse">▌</span>}
          </p>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}

      {/* Expediente */}
      <details className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          Ver expediente del caso
        </summary>
        <div className="mt-3">
          <Markdown text={CASO_FERNANDEZ_MD} />
        </div>
      </details>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-faint">
          🔒 Datos ficticios. Verificá toda cita antes de usar el escrito.
        </p>
        <a href={CLAUDE_URL} target="_blank" rel="noreferrer" className="shrink-0">
          <Button variant="outline" className="px-3 py-2 text-xs">
            También en Claude ↗
          </Button>
        </a>
      </div>
    </div>
  );
}
