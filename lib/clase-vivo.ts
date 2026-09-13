// ============================================================
// Motor genérico de "clase en vivo": el alumno responde desde el
// celular y la presentación del docente activa cada actividad sola
// al llegar a su placa. Lo usan las clases de El Salvador (/justicia
// y siguientes); /web3 y /empresas tienen su versión propia anterior.
// ============================================================

import type { ActivityKey } from "./types";

export type ActKind = "encuesta" | "opciones" | "chips" | "texto" | "palabra";

export interface ActOpcion {
  id: string;
  emoji: string;
  label: string;
}

export interface ActPregunta {
  id: string;
  q: string;
  opciones: ActOpcion[];
}

export interface ActividadVivo {
  key: ActivityKey;
  kind: ActKind;
  titulo: string;
  bajada: string;
  /** kind "encuesta" */
  preguntas?: ActPregunta[];
  /** kind "opciones" (una sola) o "chips" (varias) */
  opciones?: ActOpcion[];
  /** kind "chips": opción que deselecciona a las demás */
  exclusiva?: string;
  /** kind "texto" */
  placeholder?: string;
  maxChars?: number;
  /** Pregunta exprés con respuesta: el deck la revela a pedido del docente. */
  correcta?: string;
  /** Explicación que acompaña a la respuesta revelada. */
  revela?: string;
}

/** Emojis que el participante puede mandar a la pantalla en cualquier momento. */
export const REACCIONES = ["👏", "💡", "🤖", "😮", "❤️", "🔥"] as const;
export type Reaccion = (typeof REACCIONES)[number];
/** Actividad bajo la que se guardan las reacciones en `responses`. */
export const REACCION_ACTIVITY = "reaccion";

/**
 * Tarjeta explorable de una placa: el docente la toca y se despliega una
 * explicación, con un ejemplo opcional (pedido a la IA y respuesta).
 */
export interface Explorable {
  emoji: string;
  label: string;
  texto: string;
  ejemplo?: { pedido: string; respuesta: string };
}

/** Datos de una clase que necesitan la app del alumno y el deck. */
export interface ClaseVivoConfig {
  slug: string;
  titulo: string;
  materia: string;
  autor: string;
  cargo: string;
  poll: { alumno: number; alumnoMe: number; deck: number };
  getActividad: (key: string) => ActividadVivo | undefined;
  /** Muestra la barra de emojis en el celular (llegan flotando a la pantalla). */
  reacciones?: boolean;
}
