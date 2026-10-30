"use client";

// Presentación de la tercera charla del Tribunal Fiscal (proyector). Pide la
// clave docente porque abre actividades y libera el expediente en los celulares.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { DeckTribunal3 } from "@/components/tribunal3/deck";
import { TF3_TITULO } from "@/lib/tribunal-clase3";

export default function TribunalClasePage() {
  return (
    <div className="tf2 flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo={`Presentación · ${TF3_TITULO}`}>
        <DeckTribunal3 />
      </AccesoDocente>
    </div>
  );
}
