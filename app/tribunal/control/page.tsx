"use client";

// Control remoto de la tercera charla desde el celular del equipo:
// /tribunal/control. Pasa placas, muestra la nota de conducción, toca los
// interruptores (devolución, matriz, chatbot en vivo, revelar D5, cerrar la
// votación, QR) y maneja el recupero y el expediente. Arriba, el guion de cada
// placa (qué aprenden, qué decir, qué preguntar) y el mapa de la clase.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { GuionTf3, PanelTf3 } from "@/components/tribunal3/control";
import { VistaParticipante3 } from "@/components/tribunal3/participante";
import { TF3_SLIDES, TF3_SLUG, TF3_TITULO, tituloTf3 } from "@/lib/tribunal-clase3";

const TITULOS = TF3_SLIDES.map(tituloTf3);

export default function TribunalControlPage() {
  return (
    <AccesoDocente titulo={`Control remoto · ${TF3_TITULO}`}>
      <ControlRemoto
        slug={TF3_SLUG}
        titulos={TITULOS}
        nombre="Tribunal Fiscal · Clase 3"
        guion={(e) => <GuionTf3 estado={e} />}
        panel={(e) => <PanelTf3 estado={e} />}
        vista={(e) => <VistaParticipante3 idx={e.idx} />}
      />
    </AccesoDocente>
  );
}
