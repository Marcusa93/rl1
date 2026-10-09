"use client";

// Notas del orador en otra ventana (no se comparte en la videollamada).

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { NotasUnca } from "@/components/unca/notas";

export default function UncaNotasPage() {
  return (
    <div className="uc flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo="Notas del orador · Módulo III">
        <NotasUnca />
      </AccesoDocente>
    </div>
  );
}
