"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import type { ParticipantRow } from "@/lib/types";
import { EXP_ACTIVITY, EXP_ITEM, emptyState, type ExpedienteState } from "@/lib/expediente";

export function DownloadFicha({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/session/${slug}/my-responses`);
      const d = await res.json();
      const row = (d.responses ?? []).find(
        (r: { activity: string; item_key: string }) =>
          r.activity === EXP_ACTIVITY && r.item_key === EXP_ITEM,
      );
      const state = { ...emptyState(), ...(row?.payload ?? {}) } as ExpedienteState;
      const { buildFichaBlob } = await import("@/components/pdf/ficha-doc");
      const date = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const blob = await buildFichaBlob({ name: d.name || me.name || "Participante", date, state });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Ficha-ExpedienteVivo-${(d.name || me.name || "alumno").replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setErr((e as Error).message || "No se pudo generar el PDF");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Button onClick={go} disabled={busy} className="w-full">
        {busy ? <Spinner /> : "📄 Descargar mi ficha (PDF)"}
      </Button>
      {err && <p className="mt-1 text-xs text-magenta">{err}</p>}
    </div>
  );
}
