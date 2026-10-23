"use client";

// Control remoto de la segunda charla desde el celular del equipo (Marco o
// Franco): /tribunal/control. Pasa placas, muestra la nota de conducción de
// cada placa, toca los interruptores de la pantalla (QR, Plan B, revelar,
// proyectar) y modera lo que se proyecta. Abajo, lo que ven los celulares.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { PanelTf2 } from "@/components/tribunal2/control";
import { VistaParticipante2 } from "@/components/tribunal2/participante";
import { TF2_SLIDES, TF2_SLUG, TF2_TITULO, tituloTf2 } from "@/lib/tribunal-clase2";

const TITULOS = TF2_SLIDES.map(tituloTf2);

export default function TribunalControlPage() {
  return (
    <AccesoDocente titulo={`Control remoto · ${TF2_TITULO}`}>
      <ControlRemoto
        slug={TF2_SLUG}
        titulos={TITULOS}
        nombre={`Tribunal Fiscal · Clase 2`}
        panel={(e) => <PanelTf2 idx={e.idx} />}
        vista={(e) => <VistaParticipante2 idx={e.idx} abiertas={(e.botones ?? []).filter((b) => b.activo).map((b) => b.label)} />}
      />
    </AccesoDocente>
  );
}
