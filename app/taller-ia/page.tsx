"use client";

// App del participante — taller "IA aplicada a la resolución de conflictos".
// Cada computadora sigue el itinerario guiado de 8 etapas (la placa del deck
// abre etapas; acá está el paso a paso con audios, PDFs, prompts y misiones).

import { AlumnoApp } from "@/components/clase/alumno-app";
import { TallerGuiado } from "@/components/taller/guiado";
import { TAL_CONFIG, TAL_LOGOS } from "@/lib/taller-clase";

export default function TallerPage() {
  return (
    <AlumnoApp
      config={TAL_CONFIG}
      logos={TAL_LOGOS}
      seguimiento={({ session, actividad }) => <TallerGuiado session={session} actividad={actividad} />}
    />
  );
}
