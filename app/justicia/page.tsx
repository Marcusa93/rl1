"use client";

// App del participante — masterclass "Justicia aumentada" (El Salvador).

import { AlumnoApp } from "@/components/clase/alumno-app";
import { JUS_CONFIG, JUS_LOGOS } from "@/lib/justicia-clase";

export default function JusticiaPage() {
  return <AlumnoApp config={JUS_CONFIG} logos={JUS_LOGOS} />;
}
