"use client";

// Material del encuentro para los participantes: el contenido de la charla y
// los resultados de la sala, para leer en el celular y bajar en PDF.

import { MaterialTribunal } from "@/components/tribunal/material";
import { TF1 } from "@/lib/tribunal-clase1";

export default function TribunalMaterialPage() {
  return (
    <div className="tf flex min-h-dvh flex-1 flex-col">
      <MaterialTribunal clase={TF1} />
    </div>
  );
}
