"use client";

// Control remoto del taller desde el celular del docente:
// taller.rossi-ia.com/control (o /taller-ia/control).

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { TAL_SLIDES, TAL_SLUG, TAL_TITLE, tituloPlacaTaller } from "@/lib/taller-clase";

const TITULOS = TAL_SLIDES.map(tituloPlacaTaller);

export default function TallerControlPage() {
  return (
    <AccesoDocente titulo="Control remoto · Taller">
      <ControlRemoto slug={TAL_SLUG} titulos={TITULOS} nombre={TAL_TITLE} />
    </AccesoDocente>
  );
}
