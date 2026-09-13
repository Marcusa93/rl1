"use client";

// App del participante — taller "IA para arbitraje y mediación" (El Salvador).

import { AlumnoApp } from "@/components/clase/alumno-app";
import { TAL_CONFIG, TAL_LOGOS } from "@/lib/taller-clase";

export default function TallerPage() {
  return <AlumnoApp config={TAL_CONFIG} logos={TAL_LOGOS} />;
}
