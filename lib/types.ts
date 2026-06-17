// Modelo de datos del aula en vivo RL1

export type ActivityKey =
  | "lobby"
  | "diagnostico"
  | "verdadero_falso"
  | "cotio"
  | "caso"
  | "tarea";

export type SessionStatus = "lobby" | "live" | "ended";

export interface SessionRow {
  id: string;
  slug: string;
  title: string;
  current_activity: ActivityKey;
  activity_config: ActivityConfig | null;
  status: SessionStatus;
  created_at: string;
}

/** Config volátil que el docente cambia dentro de una actividad (ej. qué afirmación V/F está activa). */
export interface ActivityConfig {
  vf_index?: number; // índice de la afirmación V/F activa
  revealed?: boolean; // si se reveló la respuesta correcta
  [k: string]: unknown;
}

export interface ParticipantRow {
  id: string;
  session_id: string;
  name: string;
  created_at: string;
}

export interface ResponseRow {
  id: string;
  session_id: string;
  participant_id: string;
  activity: ActivityKey;
  /** payload distinto según la actividad (ver shapes abajo) */
  payload: Record<string, unknown>;
  created_at: string;
}

// --- payloads por actividad ---

export interface DiagnosticoPayload {
  selected: string[]; // ids de las tarjetas elegidas
}

export interface VerdaderoFalsoPayload {
  index: number; // afirmación
  answer: boolean; // respuesta del participante
}

export interface CotioPayload {
  prompt: string;
  analysis?: CotioAnalysis;
}

export interface CasoPayload {
  done: boolean; // marcó que completó el ejercicio en Claude
}

export interface TareaPayload {
  caso: string;
  herramienta: string;
  compromiso: boolean;
}

// --- COTIO ---  (Contexto, Objeto, Tarea, Input, Output)

export type CotioVar = "contexto" | "objeto" | "tarea" | "input" | "output";

export type CotioStatus = "presente" | "incompleto" | "ausente";

export interface CotioVarScore {
  var: CotioVar;
  status: CotioStatus;
  feedback: string; // una línea: qué tiene o qué falta
}

export interface CotioAnalysis {
  scores: CotioVarScore[];
  suggestions: string[]; // 2-3 recomendaciones accionables
  improved_prompt: string;
  off_topic?: boolean; // true si el prompt no es jurídico/profesional
  confidential?: {
    found: boolean;
    note: string;
  };
}
