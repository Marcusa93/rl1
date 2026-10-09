"use client";

// Presentación de la primera charla del ciclo del Tribunal Fiscal (la
// proyecta el equipo mientras expone el Dr. Leal). Pide la clave docente
// porque abre las actividades en los celulares. Ver components/tribunal/deck.tsx.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { DeckTribunal } from "@/components/tribunal/deck";
import { TF1 } from "@/lib/tribunal-clase1";

export default function TribunalClasePage() {
  return (
    <div className="tf flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo={`Presentación · ${TF1.titulo}`}>
        <DeckTribunal clase={TF1} />
      </AccesoDocente>
    </div>
  );
}
