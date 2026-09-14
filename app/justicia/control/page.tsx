"use client";

// Control remoto de la masterclass desde el celular del docente:
// justicia.rossi-ia.com/control (o /justicia/control). Pasa placas y toca las
// tarjetas y botones que se ven en la presentación. Abajo muestra la placa
// tal como la ven los participantes en su celular.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { VistaParticipante } from "@/components/justicia/seguimiento";
import { JUS_SLIDES, JUS_SLUG, JUS_TITLE, tituloPlaca } from "@/lib/justicia-clase";

const TITULOS = JUS_SLIDES.map(tituloPlaca);

export default function JusticiaControlPage() {
  return (
    <AccesoDocente titulo={`Control remoto · ${JUS_TITLE}`}>
      <ControlRemoto
        slug={JUS_SLUG}
        titulos={TITULOS}
        nombre={JUS_TITLE}
        vista={(e) => (
          <VistaParticipante idx={e.idx} abiertas={(e.botones ?? []).filter((b) => b.activo).map((b) => b.label)} />
        )}
      />
    </AccesoDocente>
  );
}
