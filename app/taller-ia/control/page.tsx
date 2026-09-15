"use client";

// Control remoto del taller desde el celular del docente:
// taller.rossi-ia.com/control (o /taller-ia/control). Pasa placas, muestra la
// ayuda memoria de tiempos de cada etapa y, abajo, el tablero de la sala.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { TableroControl } from "@/components/taller/tablero";
import { TAL_SLIDES, TAL_SLUG, TAL_TITLE, tituloPlacaTaller } from "@/lib/taller-clase";

const TITULOS = TAL_SLIDES.map(tituloPlacaTaller);

export default function TallerControlPage() {
  return (
    <AccesoDocente titulo="Control remoto · Taller">
      <ControlRemoto
        slug={TAL_SLUG}
        titulos={TITULOS}
        nombre={TAL_TITLE}
        vistaTitulo="📊 Tablero de la sala"
        vista={(e) => <TableroControl idx={e.idx} />}
      />
    </AccesoDocente>
  );
}
