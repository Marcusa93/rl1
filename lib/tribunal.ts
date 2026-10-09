// ============================================================
// Ciclo de capacitación en IA · Tribunal Fiscal de la Provincia de
// Tucumán (2026). Seis encuentros. Dirección académica y exposición:
// Dr. Mario Rodolfo Leal. Recursos participativos: Dr. Marco Rossi y
// Dr. Franco Orellana.
//
// Lo común a las seis clases: institución, enlace, QR, tipos de placa.
// Cada clase vive en su archivo (lib/tribunal-clase1.ts, …) y reusa el
// motor de clase en vivo (lib/clase-vivo.ts).
//
// /tribunal          → app del participante (celular)
// /tribunal/clase    → presentación (proyector)
// /tribunal/control  → control remoto + moderación (celular del equipo)
//
// El texto de las placas es el del Dr. Leal, literal. Las actividades son
// pantallas aparte, intercaladas donde él trata cada tema.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";

export const TF_INSTITUCION = "Tribunal Fiscal de la Provincia de Tucumán";
export const TF_CICLO = "Ciclo de capacitación 2026";
export const TF_EXPOSITOR = "Dr. Mario Rodolfo Leal";
export const TF_EQUIPO = "Dr. Marco Rossi · Dr. Franco Orellana";
/** Dirección que se escribe a mano; el QR apunta a la misma. */
export const TF_LINK = "taller.rossi-ia.com/tribunal";
export const TF_QR = "/tribunal/qr.svg";

/** Los seis encuentros del ciclo (para la continuidad entre clases). */
export const TF_ENCUENTROS = [
  "Introducción a la inteligencia artificial",
  "Cómo formular instrucciones y verificar resultados",
  "Análisis jurídico tributario",
  "Análisis contable y probatorio",
  "Redacción y revisión de decisiones tributarias",
  "Confidencialidad, gobernanza y taller integrador",
];

// --- Tipos de placa ------------------------------------------------------------

export interface TfPar {
  k: string;
  v: string;
}

export interface TfColumna {
  k: string;
  lineas: string[];
}

/** Tramo de la agenda de la clase (la línea de tiempo del pie de cada placa). */
export interface TfTramo {
  rango: string;
  nombre: string;
  minutos: number;
  pausa?: boolean;
}

/** Cuerpo de una placa del Dr. Leal: su texto literal, según la composición. */
export type TfCuerpo =
  | { forma: "lema"; lema: string; items: string[]; kickers: string[] }
  | { forma: "recorrido" }
  | { forma: "preguntas"; preguntas: string[]; cierre: string }
  | { forma: "verbos"; definicion: string; verbos: string[]; items: string[] }
  | { forma: "generativa"; definicion: string; imita: string; cierre: string }
  | { forma: "flujo"; pares: TfPar[]; cierre: string }
  | { forma: "columnas"; columnas: [TfColumna, TfColumna]; cierre: string; cita?: boolean }
  | { forma: "documento"; items: string[] }
  | { forma: "expediente"; items: string[]; cierre: string }
  | { forma: "planilla"; items: string[]; cierre: string }
  | { forma: "perfiles"; pares: TfPar[]; cierre: string }
  | { forma: "matriz"; pares: TfPar[] }
  | { forma: "reserva"; encabezado: string; items: string[]; cierre: string }
  | { forma: "caso"; nombre: string; asunto: string[]; montosTitulo: string; montos: string[]; items: string[] }
  | { forma: "instruccion"; encabezado: string; items: string[] }
  | { forma: "acn"; pares: TfPar[]; cierre: string }
  | { forma: "ideas"; items: string[]; proxima: TfPar };

export interface TfPlaca {
  t: "placa";
  /** Número de la placa en la presentación original ("02"). */
  num: string;
  titulo: string;
  cuerpo: TfCuerpo;
  tramo: number;
  /** Notas del orador de la presentación original: solo en el celular del equipo. */
  nota: string;
  /** Banner complementario que anuncia la actividad que sigue. */
  banner?: string;
  /** Franja con el resultado de una actividad anterior (ej.: los perfiles de la sala). */
  recuerda?: string;
}

export type TfSlide =
  | { t: "portada"; activa: string; tramo: number }
  | { t: "ingreso"; activa: string; tramo: number }
  | TfPlaca
  | { t: "actividad"; activa: string; escena: string; tramo: number; nota: string }
  | { t: "sintesis"; titulo: string; actividades: [string, string]; tramo: number; nota: string };

/** Actividad del ciclo: las abiertas se moderan antes de proyectarse. */
export type TfActividad = ActividadVivo & {
  /** Respuestas abiertas: el equipo las revisa antes de mostrarlas en la pantalla. */
  moderada?: boolean;
  /** Encuesta de clasificación A/C/N: barras apiladas por tarea. */
  acn?: boolean;
};

export interface TfClase {
  numero: number;
  slug: string;
  /** Rótulo de las placas ("PRIMERA CHARLA"). */
  etiqueta: string;
  titulo: string;
  bajada: string[];
  expositor: string;
  tramos: TfTramo[];
  slides: TfSlide[];
  actividades: TfActividad[];
  config: ClaseVivoConfig;
}

export function getActividadTf(clase: TfClase, key: string): TfActividad | undefined {
  return clase.actividades.find((a) => a.key === key);
}

/** Nombre corto de una placa (índice del control remoto). */
export function tituloPlacaTf(clase: TfClase, s: TfSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso con QR";
    case "placa":
      return `${s.num} · ${s.titulo}`;
    case "actividad":
      return `🗳️ ${getActividadTf(clase, s.activa)?.titulo ?? "Actividad"}`;
    case "sintesis":
      return `🗳️ ${s.titulo}`;
  }
}

/** Actividades cuyas respuestas se ven en una placa (para moderarlas desde el control). */
export function actividadesDeSlide(s: TfSlide): string[] {
  if (s.t === "actividad") return [s.activa];
  if (s.t === "sintesis") return s.actividades;
  return [];
}

/** Una línea de texto de la placa, para leerla en el celular (sin diagramas). */
export type TfLinea = { tipo: "lema" | "item" | "par" | "cierre" | "dato"; texto: string; k?: string };

export function lineasPlaca(p: TfPlaca, clase: TfClase): TfLinea[] {
  const c = p.cuerpo;
  const items = (xs: string[]): TfLinea[] => xs.map((texto) => ({ tipo: "item", texto }));
  const pares = (xs: TfPar[]): TfLinea[] => xs.map(({ k, v }) => ({ tipo: "par", k, texto: v }));
  switch (c.forma) {
    case "lema":
      return [{ tipo: "lema", texto: c.lema }, ...items(c.items)];
    case "recorrido":
      return clase.tramos.map((t) => ({ tipo: "par", k: t.rango, texto: t.nombre }));
    case "preguntas":
      return [...items(c.preguntas), { tipo: "cierre", texto: c.cierre }];
    case "verbos":
      return [{ tipo: "lema", texto: c.definicion }, ...items(c.items)];
    case "generativa":
      return [{ tipo: "lema", texto: c.definicion }, { tipo: "dato", texto: c.imita }, { tipo: "cierre", texto: c.cierre }];
    case "flujo":
    case "perfiles":
    case "acn":
      return [...pares(c.pares), { tipo: "cierre", texto: c.cierre }];
    case "matriz":
      return pares(c.pares);
    case "columnas":
      return [...c.columnas.map((col) => ({ tipo: "par" as const, k: col.k, texto: col.lineas.join(" · ") })), { tipo: "cierre", texto: c.cierre }];
    case "documento":
      return items(c.items);
    case "expediente":
    case "planilla":
      return [...items(c.items), { tipo: "cierre", texto: c.cierre }];
    case "reserva":
      return [{ tipo: "lema", texto: c.encabezado }, ...items(c.items), { tipo: "cierre", texto: c.cierre }];
    case "caso":
      return [
        { tipo: "lema", texto: c.nombre },
        ...c.asunto.map((texto) => ({ tipo: "dato" as const, texto })),
        { tipo: "par", k: c.montosTitulo, texto: c.montos.join(" · ") },
        ...items(c.items),
      ];
    case "instruccion":
      return [{ tipo: "lema", texto: c.encabezado }, ...items(c.items)];
    case "ideas":
      return [...items(c.items), { tipo: "par", k: c.proxima.k, texto: c.proxima.v }];
  }
}
