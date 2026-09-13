"use client";

// App del grupo — taller "IA aplicada a la resolución de conflictos" (El Salvador).
// Debajo de la actividad en vivo, el tutor muestra los documentos y prompts liberados.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { TutorTaller } from "@/components/taller/tutor";
import { TAL_CONFIG, TAL_LOGOS } from "@/lib/taller-clase";

export default function TallerPage() {
  return <AlumnoApp config={TAL_CONFIG} logos={TAL_LOGOS} tutor={TutorTaller} />;
}
