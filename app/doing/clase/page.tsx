"use client";

// Presentación de la clase (se comparte en Zoom). Pide la clave docente
// porque abre las experiencias en la vista de los participantes y usa la IA
// en las demostraciones. Ver components/doing/deck.tsx.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { DeckDoing } from "@/components/doing/deck";
import { DG_TITULO_CORTO } from "@/lib/doing-clase";

export default function DoingClasePage() {
  return (
    <div className="dg flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo={`Presentación · ${DG_TITULO_CORTO}`}>
        <DeckDoing />
      </AccesoDocente>
    </div>
  );
}
