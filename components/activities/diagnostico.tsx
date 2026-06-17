"use client";

import { useState } from "react";
import type { ActivityProps } from "./student-activity";
import { DIAGNOSTICO_CARDS } from "@/lib/constants";
import { Button, Spinner } from "@/components/ui";
import { cn } from "@/lib/utils";

export function Diagnostico({ slug }: ActivityProps) {
  const [sel, setSel] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function toggle(id: string) {
    setSel((prev) => {
      if (id === "nunca") return prev.includes("nunca") ? [] : ["nunca"];
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.filter((x) => x !== "nunca");
    });
  }

  async function send() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/session/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: "diagnostico", payload: { selected: sel } }),
      });
      if (res.ok) setSent(true);
      else {
        const d = await res.json().catch(() => ({}));
        setErr(d.error || "No se pudo enviar. Probá de nuevo.");
      }
    } catch {
      setErr("Sin conexión. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">¿Qué tareas jurídicas ya hiciste con IA?</h2>
      <p className="mt-1 text-sm text-muted">
        Marcá todas las que correspondan. Es anónimo en el proyector — sirve para leer al grupo.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {DIAGNOSTICO_CARDS.map((c) => {
          const on = sel.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => !sent && toggle(c.id)}
              disabled={sent}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
                on
                  ? "border-teal/70 bg-teal/10 glow-teal"
                  : "border-line bg-panel/40 hover:border-faint",
                sent && "opacity-70",
              )}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-sm font-medium leading-tight">{c.label}</span>
            </button>
          );
        })}
      </div>

      {err && <p className="mt-3 text-center text-sm text-magenta">{err}</p>}
      {!sent ? (
        <Button onClick={send} disabled={busy || sel.length === 0} className="mt-3 w-full">
          {busy ? <Spinner /> : "Enviar"}
        </Button>
      ) : (
        <div className="mt-6 rounded-xl border border-teal/40 bg-teal/10 p-4 text-center text-sm text-teal">
          ✓ Respuesta enviada. Mirá el proyector.
          <button
            onClick={() => setSent(false)}
            className="mt-1 block w-full text-xs text-faint underline-offset-2 hover:underline"
          >
            Editar
          </button>
        </div>
      )}
    </div>
  );
}
