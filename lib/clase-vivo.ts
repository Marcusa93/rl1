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
}
