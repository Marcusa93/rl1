"use client";

// Presentación de la clase (se comparte en la videollamada). Pide la clave
// docente porque abre las intervenciones en los dispositivos de la sala.
// Ver components/unca/deck.tsx.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { DeckUnca } from "@/components/unca/deck";
import { UC_TITULO } from "@/lib/unca-clase";

export default function UncaClasePage() {
  return (
    <div className="uc flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo={`Presentación · ${UC_TITULO}`}>
        <DeckUnca />
      </AccesoDocente>
    </div>
  );
}
