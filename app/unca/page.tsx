"use client";

// App del participante — "La arquitectura de la confianza digital" (UNCA,
// Módulo III). Anónima: entra sin escribir nada. Sigue la placa que se
// comparte en la videollamada y responde las intervenciones cuando se abren.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { MarcaUnca, SeguimientoUnca } from "@/components/unca/seguimiento";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";
import { UC_CONFIG } from "@/lib/unca-clase";

function Seguimiento(p: { session: SessionRow; placa: PlacaVivo | null; actividad: React.ReactNode }) {
  return <SeguimientoUnca {...p} />;
}

export default function UncaPage() {
  return (
    <div className="uc uc-papel flex min-h-dvh flex-1 flex-col">
      <AlumnoApp config={UC_CONFIG} seguimiento={Seguimiento} marca={<MarcaUnca />} />
    </div>
  );
}
