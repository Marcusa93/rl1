"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { CASO_FERNANDEZ_MD, CASO_FERNANDEZ_CONSIGNA, CLAUDE_URL, COTIO_VARS } from "@/lib/constants";
import { Button, Spinner } from "@/components/ui";
import { Markdown } from "@/components/markdown";

export function Caso({ slug }: ActivityProps) {
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function marcar() {
    setBusy(true);
    const res = await fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "caso", payload: { done: true } }),
    });
    setBusy(false);
    if (res.ok) setDone(true);
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Ejercicio: el caso Fernández</h2>

      <div className="mt-3 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">Consigna</p>
        <p className="mt-1 text-sm text-muted">{CASO_FERNANDEZ_CONSIGNA}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {COTIO_VARS.map((v) => (
            <span key={v.key} className="rounded-lg border border-line bg-panel/40 px-2.5 py-1 text-xs">
              <b className="text-teal">{v.letter}</b> <span className="text-muted">{v.name}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-5">
        <Markdown text={CASO_FERNANDEZ_MD} />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a href={CLAUDE_URL} target="_blank" rel="noreferrer" className="flex-1">
          <Button className="w-full">Abrir Claude ↗</Button>
        </a>
        <Button variant="outline" onClick={marcar} disabled={busy || done} className="flex-1">
          {busy ? <Spinner /> : done ? "✓ Ejercicio marcado" : "Ya lo trabajé en Claude"}
        </Button>
      </div>
      <p className="mt-3 text-xs text-faint">
        🔒 Usá datos ficticios. No cargues información real de clientes ni expedientes en la herramienta.
      </p>
    </div>
  );
}
