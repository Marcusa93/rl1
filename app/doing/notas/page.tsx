"use client";

// Notas del orador y panel de conducción en otra ventana (no se comparte en Zoom).

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { NotasDoing } from "@/components/doing/notas";

export default function DoingNotasPage() {
  return (
    <div className="dg flex min-h-dvh flex-1 flex-col">
      <AccesoDocente titulo="Notas del orador · Doing Global">
        <NotasDoing />
      </AccesoDocente>
    </div>
  );
}
