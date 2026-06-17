"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { Button, Spinner } from "@/components/ui";

export function Tarea({ slug }: ActivityProps) {
  const [caso, setCaso] = useState("");
  const [herramienta, setHerramienta] = useState("");
  const [compromiso, setCompromiso] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function send() {
    setBusy(true);
    const res = await fetch(`/api/session/${slug}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activity: "tarea",
        payload: { caso, herramienta, compromiso },
      }),
    });
    setBusy(false);
    if (res.ok) setSent(true);
  }

  if (sent)
    return (
      <div className="rise rounded-2xl border border-teal/40 bg-teal/10 p-8 text-center">
        <p className="text-3xl">🤝</p>
        <h2 className="mt-3 text-xl font-semibold text-teal">¡Compromiso registrado!</h2>
        <p className="mt-2 text-sm text-muted">
          Durante la semana usá la herramienta en tu caso real y guardá el <b>prompt</b> y el{" "}
          <b>output</b> — salga bien o mal. Ese material arranca la Clase 2.
        </p>
      </div>
    );

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Tarea bisagra 🔗</h2>
      <p className="mt-1 text-sm text-muted">
        Antes de la próxima clase: usá la herramienta <b>una vez en un caso real tuyo</b>. Traé el
        prompt y el output a la Clase 2, no importa si salió bien o mal.
      </p>

      <div className="mt-5 space-y-4">
        <div>
          <label className="text-sm text-muted">¿En qué caso o tarea la vas a usar?</label>
          <textarea
            value={caso}
            onChange={(e) => setCaso(e.target.value)}
            rows={3}
            placeholder="Ej. resumir un fallo del Superior Tribunal para un cliente…"
            className="mt-1 w-full resize-y rounded-xl border border-line bg-ink-2/70 p-3 text-sm outline-none placeholder:text-faint focus:border-teal/60"
          />
        </div>
        <div>
          <label className="text-sm text-muted">¿Qué herramienta?</label>
          <input
            value={herramienta}
            onChange={(e) => setHerramienta(e.target.value)}
            placeholder="Claude, ChatGPT, etc."
            className="mt-1 w-full rounded-xl border border-line bg-ink-2/70 px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-panel/40 p-3">
          <input
            type="checkbox"
            checked={compromiso}
            onChange={(e) => setCompromiso(e.target.checked)}
            className="mt-0.5 size-5 accent-teal"
          />
          <span className="text-sm">
            Me comprometo a traer el prompt y el output a la Clase 2.
          </span>
        </label>
      </div>

      <Button
        onClick={send}
        disabled={busy || !compromiso || caso.trim().length < 5}
        className="mt-5 w-full"
      >
        {busy ? <Spinner /> : "Confirmar compromiso"}
      </Button>
    </div>
  );
}
