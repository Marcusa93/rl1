"use client";

// Los materiales del caso ficticio tal como se leen: la ficha, los tres
// comprobantes, el escrito de la actora, el mensaje del cliente y la
// plantilla. Los usa la pestaña «Caso» del celular y el visor del deck.

import { useState } from "react";
import { copiar } from "@/components/doing/ia";
import { ComprobanteVisual } from "@/components/doing/piezas";
import { CASO_COMPLETO, COMPROBANTES, MATERIALES, type Material } from "@/lib/doing-caso";
import { cn } from "@/lib/utils";

export function VistaMaterial({ m, className }: { m: Material; className?: string }) {
  if (m === "comprobantes")
    return (
      <div className={cn("grid gap-3", className)}>
        {COMPROBANTES.map((c) => (
          <ComprobanteVisual key={c.n} c={c} />
        ))}
      </div>
    );
  const texto = m === "plantilla" ? MATERIALES.plantilla.texto : MATERIALES[m].texto;
  return (
    <div className={cn("dg-hoja rounded-xl border border-dg-linea px-4 py-4", m === "relato" && "bg-[#eef4ea]", className)}>
      <p className="dg-maquina whitespace-pre-wrap text-[0.86rem] leading-relaxed text-dg-tinta">
        {m === "plantilla"
          ? texto.split(/(\{\{[a-z_]+\}\})/).map((p, i) => (p.startsWith("{{") ? <span key={i} className="dg-campo">{p}</span> : <span key={i}>{p}</span>))
          : texto}
      </p>
    </div>
  );
}

/** Botones para llevarse el caso: PDF (para NotebookLM, Pinpoint…) y texto (para pegar en un chat). */
export function DescargasCaso({ className }: { className?: string }) {
  const [estado, setEstado] = useState<"" | "pdf" | "copiado" | "error">("");
  async function pdf() {
    setEstado("pdf");
    try {
      const { descargarCasoPdf } = await import("./caso-pdf");
      await descargarCasoPdf();
      setEstado("");
    } catch {
      setEstado("error");
    }
  }
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="grid grid-cols-2 gap-2">
        <button onClick={pdf} disabled={estado === "pdf"} className="rounded-xl bg-dg-verde px-3 py-3 text-[0.95rem] font-semibold text-white disabled:opacity-60">
          {estado === "pdf" ? "Armando el PDF…" : "⬇ PDF del caso"}
        </button>
        <button
          onClick={async () => setEstado((await copiar(CASO_COMPLETO)) ? "copiado" : "error")}
          className="rounded-xl border border-dg-verde/50 bg-dg-hoja px-3 py-3 text-[0.95rem] font-semibold text-dg-verde"
        >
          {estado === "copiado" ? "✓ Copiado" : "Copiar el caso"}
        </button>
      </div>
      {estado === "error" && <p className="text-center text-sm text-dg-lacre">No se pudo. Probá de nuevo.</p>}
      <p className="text-center text-xs leading-snug text-dg-pizarra">El PDF sirve para subirlo a NotebookLM, Pinpoint, Claude o ChatGPT. Es todo ficticio.</p>
    </div>
  );
}

/** Modal del deck para mostrar un material en grande. */
export function VisorMaterial({ m, onCerrar }: { m: Material; onCerrar: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dg-tinta/40 p-10 backdrop-blur-sm" onClick={onCerrar}>
      <div className="max-h-full w-full max-w-[52rem] overflow-auto rounded-2xl bg-dg-papel p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <p className="dg-serif text-[2rem] text-dg-tinta">
            {MATERIALES[m].emoji} {MATERIALES[m].nombre}
          </p>
          <button onClick={onCerrar} className="rounded-lg border border-dg-linea bg-dg-hoja px-3 py-1.5 text-sm">
            Cerrar
          </button>
        </div>
        <VistaMaterial m={m} className="text-[1.15rem]" />
      </div>
    </div>
  );
}
