"use client";

// App del participante — masterclass "Justicia aumentada" (El Salvador).
// El celular sigue la placa que se proyecta y puede volver a las anteriores.
// Al final (nube de palabras) aparece la guía de la clase para descargar y compartir.

import { AlumnoApp } from "@/components/clase/alumno-app";
import { SeguimientoJusticia } from "@/components/justicia/seguimiento";
import { JUS_CONFIG, JUS_LOGOS } from "@/lib/justicia-clase";

export default function JusticiaPage() {
  return <AlumnoApp config={JUS_CONFIG} logos={JUS_LOGOS} seguimiento={SeguimientoJusticia} />;
}
