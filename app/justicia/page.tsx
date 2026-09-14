"use client";

// App del participante — masterclass "Justicia aumentada" (El Salvador).
// Al final (nube de palabras) aparece la guía de la clase para descargar y compartir.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { GuiaFinal } from "@/components/justicia/guia-card";
import { JUS_CONFIG, JUS_LOGOS } from "@/lib/justicia-clase";

export default function JusticiaPage() {
  return <AlumnoApp config={JUS_CONFIG} logos={JUS_LOGOS} tutor={GuiaFinal} />;
}
