"use client";

import { useMemo, useState } from "react";
import type { ActivityProps } from "./student-activity";
import { CASO_FERNANDEZ_CONSIGNA, CASO_FERNANDEZ_MD, COTIO_VARS } from "@/lib/constants";
import type { CotioVar } from "@/lib/types";
import { Markdown } from "@/components/markdown";
import { OpenInAi } from "@/components/open-in-ai";

export function Caso({ slug }: ActivityProps) {
  const [fields, setFields] = useState<Record<CotioVar, string>>({
    contexto: "",
    objeto: "",
    tarea: "",
    input: "Uso el resumen del expediente Fernández (incluido).",
    output: "",
  });

  const prompt = useMemo(() => {
    const built = COTIO_VARS.map((v) => `[${v.name.toUpperCase()}] ${fields[v.key].trim()}`).join("\n");
    return `${built}\n\n--- EXPEDIENTE (input) ---\n${CASO_FERNANDEZ_MD}`;
  }, [fields]);

  const enough = fields.contexto.trim() && fields.objeto.trim() && fields.tarea.trim();

  function marcar() {
    fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "caso", payload: { done: true, objeto: fields.objeto } }),
    }).catch(() => {});
  }

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

      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">Llevá tu prompt a la IA</p>
        <p className="mt-1 text-xs text-muted">
          Copia tu prompt (con el expediente) y lo abre en la herramienta que elijas.
        </p>
        <div className="mt-3">
          <OpenInAi prompt={enough ? prompt : ""} onOpen={marcar} disabled={!enough} />
        </div>
        {!enough && (
          <p className="mt-2 text-xs text-faint">Completá al menos Contexto, Objeto y Tarea.</p>
        )}
      </div>

      <details className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">
          Ver expediente del caso
        </summary>
        <div className="mt-3">
          <Markdown text={CASO_FERNANDEZ_MD} />
        </div>
      </details>
    </div>
  );
}
