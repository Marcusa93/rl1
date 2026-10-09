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
/** Material descargable del encuentro (se anuncia en la última placa). */
export const TF_MATERIAL = "/tribunal/material";

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

/**
 * Respuesta de una IA preparada antes de la clase para la demostración: se
 * muestra con un botón (también desde el celular) al lado de la instrucción.
 */
export interface TfRespuestaIa {
  secciones: TfColumna[];
  cierre: string;
  /** Aclaración de origen: preparada antes de la clase, no generada en vivo. */
  nota: string;
}

/**
 * Box de preguntas para todos los conectados (expectativas y devolución): el
 * equipo lo envía desde el celular de control y lee las respuestas con nombre.
 * No se proyecta ni va al material.
 */
export interface TfBox {
  /** Clave con la que se guardan las respuestas (ej.: "tf1_box"). */
  key: string;
  titulo: string;
  aviso: string;
  preguntas: { id: string; q: string; placeholder: string; obligatoria?: boolean }[];
}

/** Etiqueta del botón que muestra la respuesta preparada (deck y celulares). */
export const TF_RESPUESTA_IA = "🤖 Respuesta de la IA";

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
  | { forma: "instruccion"; encabezado: string; items: string[]; respuesta?: TfRespuestaIa }
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
  /** Desde esta placa el celular ofrece el material descargable del encuentro. */
  material?: boolean;
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
  /** Encargo del expositor para la próxima charla (va en el material descargable). */
  encargo?: string;
  /** Box de expectativas y devolución que el equipo envía a todos los celulares. */
  box?: TfBox;
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

/**
 * Revelado paso a paso: cuántas partes de la placa aparecen de a una con →
 * (ítems y, al final, la conclusión). 0 = la placa se muestra entera
 * (la agenda y la instrucción de la demostración, que se leen completas).
 */
export function pasosPlaca(p: TfPlaca): number {
  const c = p.cuerpo;
  switch (c.forma) {
    case "recorrido":
    case "instruccion":
      return 0;
    case "lema":
    case "verbos":
    case "caso":
      return c.items.length;
    case "preguntas":
      return c.preguntas.length + 1;
    case "generativa":
      return 2;
    case "flujo":
    case "perfiles":
    case "acn":
      return c.pares.length + 1;
    case "matriz":
      return c.pares.length;
    case "columnas":
      return c.columnas.length + 1;
    case "documento":
    case "ideas":
      return c.items.length;
    case "expediente":
    case "planilla":
    case "reserva":
      return c.items.length + 1;
  }
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

// --- Material descargable ---------------------------------------------------------

/** Resultados de una actividad tal como los entrega /api/session/<slug>/material. */
export interface TfMaterialActividad {
  key: string;
  respondieron: number;
  /** Respuestas abiertas que el equipo no revisó: no se incluyen. */
  pendiente?: boolean;
  summary?: Record<string, unknown>;
}

export interface TfMaterial {
  participantes: number;
  actividades: TfMaterialActividad[];
  generado: string;
}

export type TfFilaBarra = { label: string; n: number; pct: number };

/** Un resultado listo para dibujar (en la página del material y en el PDF). */
export type TfBloque =
  | { tipo: "barras"; pregunta?: string; filas: TfFilaBarra[] }
  | { tipo: "acn"; filas: { tarea: string; a: number; c: number; n: number; total: number }[] }
  | { tipo: "palabras"; palabras: { palabra: string; n: number }[] }
  | { tipo: "textos"; textos: string[] };

const porcentaje = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

function barras(opciones: { id: string; label: string }[], counts: Record<string, number>, total: number, ordenar: boolean): TfFilaBarra[] {
  const filas = opciones.map((o) => ({ label: o.label, n: counts[o.id] ?? 0, pct: porcentaje(counts[o.id] ?? 0, total) }));
  return ordenar ? filas.sort((a, b) => b.n - a.n) : filas;
}

export function bloquesMaterial(act: TfActividad, summary: Record<string, unknown>): TfBloque[] {
  if (act.kind === "encuesta") {
    const byQ = (summary.byQuestion as Record<string, Record<string, number>>) ?? {};
    if (act.acn)
      return [
        {
          tipo: "acn",
          filas: (act.preguntas ?? []).map((q) => {
            const c = byQ[q.id] ?? {};
            return { tarea: q.q, a: c.a ?? 0, c: c.c ?? 0, n: c.n ?? 0, total: (c.a ?? 0) + (c.c ?? 0) + (c.n ?? 0) };
          }),
        },
      ];
    return (act.preguntas ?? []).map((q) => {
      const c = byQ[q.id] ?? {};
      const total = Object.values(c).reduce((x, y) => x + y, 0);
      return { tipo: "barras", pregunta: q.q, filas: barras(q.opciones, c, total, false) };
    });
  }
  if (act.kind === "opciones" || act.kind === "chips") {
    const counts = (summary.counts as Record<string, number>) ?? {};
    const total = act.kind === "chips" ? Number(summary.total ?? 0) : Object.values(counts).reduce((x, y) => x + y, 0);
    return [{ tipo: "barras", filas: barras(act.opciones ?? [], counts, total, act.kind === "chips") }];
  }
  if (act.kind === "texto")
    return [{ tipo: "textos", textos: ((summary.respuestas as { respuesta: string }[]) ?? []).map((r) => r.respuesta) }];
  return [{ tipo: "palabras", palabras: (summary.palabras as { palabra: string; n: number }[]) ?? [] }];
}
