"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";

/** Descarga el glosario de la clase (PDF generado en el navegador). */
export function DescargarGlosario({
  variant = "primary",
  className,
}: {
  variant?: "primary" | "outline";
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function go() {
    setBusy(true);
    setErr("");
    try {
      const { buildGlosarioBlob } = await import("@/components/pdf/glosario-doc");
      const date = new Date().toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      const blob = await buildGlosarioBlob(date);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "RL1-glosario-empresas-e-IA.pdf";
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
    <div className={className}>
      <Button onClick={go} disabled={busy} variant={variant} className="w-full">
        {busy ? <Spinner /> : "📘 Descargar el glosario (PDF)"}
      </Button>
      {err && <p className="mt-1 text-xs text-magenta">{err}</p>}
    </div>
  );
}
