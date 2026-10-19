"use client";

// Vista del participante — «Redacción de escritos jurídicos con IA» (Doing
// Global). La abren desde el chat de Zoom; es anónima. Sigue la pantalla que
// se comparte, responde las experiencias y tiene a mano el laboratorio de IA,
// el caso ficticio y la skill.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { MarcaDoing, SeguimientoDoing } from "@/components/doing/seguimiento";
import { DG_CONFIG } from "@/lib/doing-clase";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";

function Seguimiento(p: { session: SessionRow; placa: PlacaVivo | null; actividad: React.ReactNode }) {
  return <SeguimientoDoing {...p} />;
}

export default function DoingPage() {
  return (
    <div className="dg dg-papel flex min-h-dvh flex-1 flex-col">
      <AlumnoApp config={DG_CONFIG} seguimiento={Seguimiento} marca={<MarcaDoing className="text-lg" />} ancho="amplio" />
    </div>
  );
}
