// Modelo de datos del aula en vivo RL1

export type ActivityKey =
  | "lobby"
  | "diagnostico"
  | "verdadero_falso"
  | "cotio"
  | "demanda"
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

export interface DemandaPayload {
  naive_prompt: string;
  naive_output?: string;
  cotio: Record<CotioVar, string>;
  cotio_output?: string;
  verification?: string[];
}

export interface TareaPayload {
  caso: string;
  herramienta: string;
  compromiso: boolean;
}

// --- COTIO ---

export type CotioVar = "contexto" | "objetivo" | "tarea" | "input" | "output";

export interface CotioVarScore {
  var: CotioVar;
  present: boolean;
  score: number; // 0..100
  feedback: string;
}

export interface CotioAnalysis {
  scores: CotioVarScore[];
  overall: number; // 0..100
  confidential: {
    found: boolean;
    note: string;
  };
  improved_prompt: string;
}
