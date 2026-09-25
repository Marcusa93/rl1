"use client";

// "Llevate la clase": al final, cada participante baja con un clic la guía en PDF
// (lo que dio Sebastián Chumbita + lo que dio Marco + su tarjeta y su hipótesis).
// El PDF se arma en el propio dispositivo (components/bbva/guia-pdf.tsx).

import { useState } from "react";
import type { ResultadosBbva } from "@/lib/bbva-clase";

export function BotonGuia({
  nombre,
  area,
  respuestas,
}: {
  nombre: string;
  area?: string;
  respuestas: Record<string, Record<string, string | string[]>>;
}) {
  const [estado, setEstado] = useState<"listo" | "armando" | "error">("listo");

  async function descargar() {
    setEstado("armando");
    try {
      let grupo: ResultadosBbva | null = null;
      try {
        const r = await fetch("/api/bbva/resultados?activity=bbva_a1", { cache: "no-store" });
        if (r.ok) grupo = (await r.json()) as ResultadosBbva;
      } catch {
        /* sin datos del grupo: la guía sale igual */
      }
      const { buildGuiaBlob } = await import("./guia-pdf");
      const blob = await buildGuiaBlob({ nombre, area, respuestas, grupo });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laboratorio-IA-BBVA-clase-1${nombre ? `-${nombre.replace(/\s+/g, "_")}` : ""}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="bbva-recorte bbva-cae relative mb-8 w-full rounded-[3px] px-4 pb-4 pt-5 text-left" style={{ "--rot": "0.6deg" } as React.CSSProperties}>
      <span className="bbva-cinta absolute -top-2.5 right-8 h-5 w-16 rotate-6" aria-hidden="true" />
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-naranja">Para llevar</p>
      <p className="bbva-titular mt-1 text-[2rem] leading-[0.9] text-tinta">Llevate la clase</p>
      <p className="bbva-serif mt-2 text-[1.08rem] italic leading-snug text-grafito">
        La guía con lo que vimos con Sebastián y con Marco, más tu tarjeta y tu hipótesis.
      </p>
      <button
        type="button"
        onClick={descargar}
        disabled={estado === "armando"}
        className="alu-boton mt-4 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[4px] bg-naranja font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-blanco disabled:opacity-60"
      >
        {estado === "armando" ? "Armando tu guía…" : "↓ Descargar la guía (PDF)"}
      </button>
      {estado === "error" && <p className="mt-2 font-mono text-[11px] text-rojo">No se pudo armar. Probá de nuevo.</p>}
    </div>
  );
}
