"use client";

// App del participante — Tribunal Fiscal de la Provincia de Tucumán, segunda
// charla del ciclo ("Cómo formular instrucciones y verificar resultados").
// Se entra sin nombre (alias); el celular sigue la placa y abre las
// actividades que activa la presentación. Ver components/tribunal2/participante.tsx.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { MarcaTf2, SeguimientoTf2 } from "@/components/tribunal2/participante";
import { TF2_CONFIG } from "@/lib/tribunal-clase2";

export default function TribunalPage() {
  return (
    <div className="tf2 tf2-papel flex min-h-dvh flex-1 flex-col">
      <AlumnoApp config={TF2_CONFIG} seguimiento={SeguimientoTf2} marca={<MarcaTf2 />} sinEncabezado />
    </div>
  );
}
