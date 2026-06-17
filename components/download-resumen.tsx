"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";

export function DownloadResumen({
  slug,
  label = "📄 Descargar mi resumen (PDF)",
  variant = "primary",
}: {
  slug: string;
  label?: string;
  variant?: "primary" | "outline";
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(`/api/session/${slug}/my-responses`);
      const d = await res.json();
      const { buildResumenBlob } = await import("@/components/pdf/resumen-doc");
      const date = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const blob = await buildResumenBlob({
        name: d.name || "Participante",
        date,
        responses: d.responses || [],
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `RL1-resumen-${(d.name || "taller").replace(/\s+/g, "_")}.pdf`;
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
      <Button onClick={go} disabled={busy} variant={variant} className="w-full">
        {busy ? <Spinner /> : label}
      </Button>
      {err && <p className="mt-1 text-xs text-magenta">{err}</p>}
    </div>
  );
}
