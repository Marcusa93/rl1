"use client";

// Presentación de la segunda charla del ciclo del Tribunal Fiscal (proyector).
// Pide la clave docente porque abre las actividades en los celulares.
// Ver components/tribunal2/deck.tsx.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { DeckTribunal2 } from "@/components/tribunal2/deck";
import { TF2_TITULO } from "@/lib/tribunal-clase2";

export default function TribunalClasePage() {
  return (
    <div className="tf2 flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo={`Presentación · ${TF2_TITULO}`}>
        <DeckTribunal2 />
      </AccesoDocente>
    </div>
  );
}
