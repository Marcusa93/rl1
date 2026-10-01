"use client";

// Control remoto de la masterclass desde el celular del docente:
// taller.rossi-ia.com/diplomatura/control. Pasa placas y toca las
// tarjetas y botones que se ven en la presentación. Abajo muestra la placa
// tal como la ven los participantes en su celular.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { VistaParticipante } from "@/components/diplo/seguimiento";
import { DIP_SLIDES, DIP_SLUG, DIP_TITLE, tituloPlaca } from "@/lib/diplo-clase";

const TITULOS = DIP_SLIDES.map(tituloPlaca);

export default function DiplomaturaControlPage() {
  return (
    <AccesoDocente titulo={`Control remoto · ${DIP_TITLE}`}>
      <ControlRemoto
        slug={DIP_SLUG}
        titulos={TITULOS}
        nombre={DIP_TITLE}
        vista={(e) => (
          <VistaParticipante idx={e.idx} abiertas={(e.botones ?? []).filter((b) => b.activo).map((b) => b.label)} />
        )}
      />
    </AccesoDocente>
  );
}
