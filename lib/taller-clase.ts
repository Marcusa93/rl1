// ============================================================
// Taller práctico "IA para arbitraje y mediación" — Semana de la
// Mediación, El Salvador (miércoles 16 y jueves 17/09/2026, mismo taller
// para dos grupos: reiniciar la sesión con Shift+R entre uno y otro).
// Público: estudiantes y personal de la PGR.
//
// /taller-ia        → app del participante (celular)
// /taller-ia/clase  → presentación del docente
// En taller.rossi-ia.com: "/" y "/clase" (ver proxy.ts).
//
// ESQUELETO: el contenido (placas y actividades) todavía no está cargado.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig, Explorable } from "./clase-vivo";
import type { ActivityKey } from "./types";

export const TAL_SLUG = "taller-ia";
export const TAL_TITLE = "IA para arbitraje y mediación";
export const TAL_SUBTITLE = "Herramientas gratuitas, casos ficticios y control humano";
export const TAL_EVENTO = "Taller práctico · Semana de la Mediación · El Salvador";
export const TAL_FECHA = "Miércoles 16 y jueves 17 de septiembre de 2026";
export const TAL_LINK = "taller.rossi-ia.com";
export const TAL_QR_PLATAFORMA = "/taller-ia/qr-plataforma.png";
export const TAL_AUTOR = "Dr. Marco Rossi";
export const TAL_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT (Argentina)";

export const TAL_LOGOS = [
  { src: "/justicia/logo-pgr.png", alt: "Procuraduría General de la República de El Salvador", fondo: false },
  { src: "/justicia/logo-uees.png", alt: "Universidad Evangélica de El Salvador", fondo: true },
];

// --- Actividades en vivo (claves tal_*, a definir) -----------------------------

export const TAL_ACTIVIDADES: ActividadVivo[] = [];

export function getTalActividad(key: string): ActividadVivo | undefined {
  return TAL_ACTIVIDADES.find((a) => a.key === key);
}

export const TAL_CONFIG: ClaseVivoConfig = {
  slug: TAL_SLUG,
  titulo: TAL_TITLE,
  materia: TAL_EVENTO,
  autor: TAL_AUTOR,
  cargo: TAL_CARGO,
  poll: { alumno: 4000, alumnoMe: 20000, deck: 2500 },
  getActividad: getTalActividad,
};

// --- Placas ------------------------------------------------------------------------

export interface TalPortada {
  t: "portada";
  activa: ActivityKey;
}
export interface TalIngreso {
  t: "ingreso";
  activa: ActivityKey;
}
export interface TalPlaca {
  t: "placa";
  titulo: string;
  bajada: string;
  lede?: string;
  explora?: Explorable[];
}
export interface TalActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
}
export interface TalFinal {
  t: "final";
}
export type TalSlide = (TalPortada | TalIngreso | TalPlaca | TalActividad | TalFinal) & {
  parte?: string;
  /** Abre el kit de herramientas al llegar a esta placa. */
  kit?: boolean;
};

export const TAL_SLIDES: TalSlide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby" },
  {
    t: "placa",
    titulo: "Contenido en preparación",
    bajada: "Acá van los casos de arbitraje y mediación y el método de trabajo con IA.",
    kit: true,
  },
  { t: "final" },
];
