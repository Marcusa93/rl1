"use client";

// Control remoto de la clase desde el celular del equipo (Marco o Franco):
// /tribunal/control. Pasa placas, muestra la ayuda memoria (las notas del
// Dr. Leal), modera las respuestas abiertas antes de proyectarlas y exporta
// las respuestas. Abajo, la placa tal como la ven los participantes.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { PanelTribunal } from "@/components/tribunal/moderacion";
import { VistaParticipante } from "@/components/tribunal/seguimiento";
import { tituloPlacaTf } from "@/lib/tribunal";
import { TF1 } from "@/lib/tribunal-clase1";

const TITULOS = TF1.slides.map((s) => tituloPlacaTf(TF1, s));

export default function TribunalControlPage() {
  return (
    <AccesoDocente titulo={`Control remoto · ${TF1.titulo}`}>
      <ControlRemoto
        slug={TF1.slug}
        titulos={TITULOS}
        nombre={`Tribunal Fiscal · ${TF1.titulo}`}
        panel={(e) => <PanelTribunal clase={TF1} idx={e.idx} />}
        vista={(e) => (
          <VistaParticipante clase={TF1} idx={e.idx} abiertas={(e.botones ?? []).filter((b) => b.activo).map((b) => b.label)} />
        )}
      />
    </AccesoDocente>
  );
}
