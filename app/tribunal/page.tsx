"use client";

// App del participante — Tribunal Fiscal de la Provincia de Tucumán, tercera
// charla del ciclo ("Inteligencia artificial aplicada al análisis jurídico
// tributario"). Sin nombre; sigue la placa, abre las actividades y el
// expediente a medida que se libera. Ver components/tribunal3/participante.tsx.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { MarcaTf3, SeguimientoTf3 } from "@/components/tribunal3/participante";
import { TF3_CONFIG } from "@/lib/tribunal-clase3";

export default function TribunalPage() {
  return (
    <div className="tf2 tf2-papel flex min-h-dvh flex-1 flex-col">
      <AlumnoApp config={TF3_CONFIG} seguimiento={SeguimientoTf3} marca={<MarcaTf3 />} sinEncabezado />
    </div>
  );
}
