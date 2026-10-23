"use client";

// App del participante — Tribunal Fiscal de la Provincia de Tucumán, primera
// charla del ciclo. El celular sigue la placa que se proyecta y responde las
// actividades que abre la presentación.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { MarcaTribunal, SeguimientoTribunal } from "@/components/tribunal/seguimiento";
import { TF1 } from "@/lib/tribunal-clase1";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";

function Seguimiento(p: { session: SessionRow; placa: PlacaVivo | null; actividad: React.ReactNode; avisos?: string[] }) {
  return <SeguimientoTribunal clase={TF1} {...p} />;
}

export default function TribunalPage() {
  return (
    <div className="tf flex min-h-dvh flex-1 flex-col">
      <AlumnoApp config={TF1.config} seguimiento={Seguimiento} marca={<MarcaTribunal />} />
    </div>
  );
}
