"use client";

// Ilustraciones de las placas del Congreso ("Vibe coding para abogados").
// Arqueología tecnológica aplicada al Derecho: papel, expediente, formularios,
// viejas interfaces, código y lenguaje natural. Las imágenes argumentan.
//
// Cada ilustración es un SVG con viewBox que llena su caja (h-full w-full):
//   layout "lado"   → 800 × 620 (≈ 44rem × 34rem)
//   layout "centro" → 1200 × 390 (≈ 80rem × 26rem)
//   p01 (fondo de la placa tipográfica) → 1600 × 1000, recortado (slice)
//   p11 (franja de fondo de la vitrina) → 1800 × 400, centro quieto
// `paso` = cuántos pasos reveló Marco (solo lo usan p02, p05 y p14).

import type { JSX } from "react";
import type { IlusId } from "@/lib/congreso";
import { P01PantallaVieja, P02Clausula, P03Collage, P05Cadena, type PropsIlus } from "@/components/congreso/ilus-1";
import { P06FraseInterfaz, P07PedirConstruir, P10Ciclo, P11ExpedienteCodigo } from "@/components/congreso/ilus-2";
import { P13Capas, P14Madurez, P15Espacio } from "@/components/congreso/ilus-3";

const ILUS: Record<IlusId, (props: PropsIlus) => JSX.Element> = {
  "p01-pantalla-vieja": P01PantallaVieja,
  "p02-clausula": P02Clausula,
  "p03-collage": P03Collage,
  "p05-cadena": P05Cadena,
  "p06-frase-interfaz": P06FraseInterfaz,
  "p07-pedir-construir": P07PedirConstruir,
  "p10-ciclo": P10Ciclo,
  "p11-expediente-codigo": P11ExpedienteCodigo,
  "p13-capas": P13Capas,
  "p14-madurez": P14Madurez,
  "p15-espacio": P15Espacio,
};

export function Ilus({ id, paso = 0, className }: { id: IlusId; paso?: number; className?: string }): JSX.Element {
  const C = ILUS[id];
  return <C paso={Math.max(0, paso)} className={className} />;
}
