"use client";

// App del participante — clase "IA y ejercicio profesional" (Diplomatura, por Zoom).
// Sigue la placa que se proyecta y puede volver a las anteriores.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { SeguimientoDiplo } from "@/components/diplo/seguimiento";
import { DIP_CONFIG, DIP_LOGOS } from "@/lib/diplo-clase";

export default function DiplomaturaPage() {
  return <AlumnoApp config={DIP_CONFIG} logos={DIP_LOGOS} seguimiento={SeguimientoDiplo} />;
}
