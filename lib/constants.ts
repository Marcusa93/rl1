import type { ActivityKey, CotioVar } from "./types";

export const APP_NAME = "RL1";
export const WORKSHOP_TITLE = "Taller IA Abogacía";

// --- Agenda / flujo de la clase (orden en que el docente activa) ---

export interface AgendaStep {
  key: ActivityKey;
  label: string;
  short: string;
  desc: string;
}

export const AGENDA: AgendaStep[] = [
  {
    key: "lobby",
    label: "Sala de espera",
    short: "Ingreso",
    desc: "Los participantes entran con su nombre y esperan el inicio.",
  },
  {
    key: "diagnostico",
    label: "Diagnóstico inicial",
    short: "Leer al grupo",
    desc: "Cada uno marca qué tareas jurídicas ya hizo con IA. Gráfico en vivo para leer al grupo antes de arrancar.",
  },
  {
    key: "verdadero_falso",
    label: "Cómo funciona la IA generativa",
    short: "Tokens + alucinación",
    desc: "Dos conceptos (tokens y alucinación) y un verdadero/falso para consolidar y debatir.",
  },
  {
    key: "cotio",
    label: "Método COTIO + optimizador",
    short: "COTIO",
    desc: "Construcción de prompts con COTIO. El optimizador analiza el prompt variable por variable.",
  },
  {
    key: "demanda",
    label: "Demanda laboral: sin método vs COTIO",
    short: "Comparador",
    desc: "Redactar una demanda laboral primero sin método y después con COTIO. Comparan los dos outputs en vivo.",
  },
  {
    key: "tarea",
    label: "Tarea bisagra",
    short: "Cierre",
    desc: "Usar la herramienta en un caso real durante la semana y traer prompt + output a la Clase 2.",
  },
];

export function agendaStep(key: ActivityKey): AgendaStep {
  return AGENDA.find((a) => a.key === key) ?? AGENDA[0];
}

// --- Diagnóstico: tarjetas (tareas jurídicas con IA) ---

export interface DiagCard {
  id: string;
  emoji: string;
  label: string;
}

export const DIAGNOSTICO_CARDS: DiagCard[] = [
  { id: "redactar", emoji: "✍️", label: "Redactar un escrito o demanda" },
  { id: "resumir", emoji: "📄", label: "Resumir un fallo o expediente" },
  { id: "jurisprudencia", emoji: "⚖️", label: "Buscar jurisprudencia o doctrina" },
  { id: "contrato", emoji: "📑", label: "Redactar o revisar un contrato" },
  { id: "traducir", emoji: "🌐", label: "Traducir o corregir un texto legal" },
  { id: "consultas", emoji: "💬", label: "Responder consultas de clientes" },
  { id: "plazos", emoji: "📅", label: "Calcular plazos o liquidaciones" },
  { id: "estudiar", emoji: "📚", label: "Estudiar o capacitarme" },
  { id: "nunca", emoji: "🚫", label: "Nunca usé IA para trabajo jurídico" },
];

// --- Verdadero / Falso (tokens + alucinación) ---

export interface VFItem {
  statement: string;
  answer: boolean; // true = verdadero
  explain: string;
  tag: "tokens" | "alucinacion" | "responsabilidad";
}

export const VF_ITEMS: VFItem[] = [
  {
    statement: "La IA lee el texto palabra por palabra, igual que una persona.",
    answer: false,
    explain:
      "Falso. El modelo parte el texto en tokens (fragmentos de palabras) y predice el siguiente. Por eso CÓMO escribís el prompt cambia el resultado a nivel técnico.",
    tag: "tokens",
  },
  {
    statement: "La forma en que redactás el prompt impacta técnicamente en la respuesta.",
    answer: true,
    explain:
      "Verdadero. Cada token condiciona la predicción del siguiente. Un prompt preciso reduce ambigüedad y mejora el output.",
    tag: "tokens",
  },
  {
    statement: "Si la IA responde con seguridad, la información es confiable.",
    answer: false,
    explain:
      "Falso. El modelo puede 'alucinar': genera texto plausible aunque sea incorrecto. La seguridad del tono no garantiza veracidad.",
    tag: "alucinacion",
  },
  {
    statement: "Una cita de jurisprudencia inexistente generada por la IA es una alucinación.",
    answer: true,
    explain:
      "Verdadero. Es el caso más peligroso para el abogado: fallos, artículos o autos que suenan reales pero no existen.",
    tag: "alucinacion",
  },
  {
    statement: "El abogado es responsable de verificar todo lo que devuelve la IA.",
    answer: true,
    explain:
      "Verdadero. La IA es asistente, no fuente. La responsabilidad profesional sobre el contenido siempre es del abogado.",
    tag: "responsabilidad",
  },
];

// --- COTIO ---

export interface CotioVarDef {
  key: CotioVar;
  letter: string;
  name: string;
  question: string;
  placeholder: string;
}

export const COTIO_VARS: CotioVarDef[] = [
  {
    key: "contexto",
    letter: "C",
    name: "Contexto",
    question: "¿Quién sos y en qué marco trabajás?",
    placeholder: "Soy abogado/a laboralista en Tucumán, Argentina. Asesoro a un trabajador despedido sin causa…",
  },
  {
    key: "objetivo",
    letter: "O",
    name: "Objetivo",
    question: "¿Qué querés lograr?",
    placeholder: "Iniciar una demanda por despido injustificado reclamando indemnización…",
  },
  {
    key: "tarea",
    letter: "T",
    name: "Tarea",
    question: "¿Qué acción concreta tiene que hacer la IA?",
    placeholder: "Redactá el escrito de demanda con sus partes: hechos, derecho, prueba y petitorio…",
  },
  {
    key: "input",
    letter: "I",
    name: "Input",
    question: "¿Qué datos o material le das?",
    placeholder: "Fecha de ingreso, fecha de despido, remuneración, categoría, antigüedad… (sin datos reales sensibles)",
  },
  {
    key: "output",
    letter: "O",
    name: "Output",
    question: "¿Cómo querés la respuesta?",
    placeholder: "En formato de escrito judicial, lenguaje formal, con apartados numerados y citando normativa aplicable.",
  },
];

export const DEMANDA_BRIEF =
  "Ejercicio: redactá una demanda laboral por despido injustificado. Primero escribí un prompt rápido, sin método (como lo harías de apuro). Después armalo con COTIO. Vas a comparar los dos resultados en vivo.";

export const DEMANDA_NAIVE_PLACEHOLDER = "Haceme una demanda laboral por despido.";

export const COURSE_BLOCKS = {
  tokens:
    "Tokens: la IA no entiende letras, parte el texto en fragmentos y predice el siguiente. Por eso el prompt importa a nivel técnico — no es 'pedir bien', es darle la mejor base para predecir.",
  alucinacion:
    "Alucinación: el modelo puede inventar con tono seguro (fallos, artículos, citas). El abogado nunca baja la guardia: todo lo que va a un expediente se verifica.",
};
