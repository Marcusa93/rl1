// ============================================================
// Masterclass "Justicia aumentada" — Semana de la Mediación,
// El Salvador (lunes 14/09/2026). Público: Corte Suprema de
// Justicia, PGR, docentes y estudiantes de la UEES.
//
// /justicia        → app del participante (celular)
// /justicia/clase  → presentación del docente (comparte pantalla)
// Motor genérico en components/clase/ y lib/clase-vivo.ts.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";
import type { ActivityKey } from "./types";
import type { DiagramaJusId } from "@/components/justicia/diagramas";

export const JUS_SLUG = "justicia";
export const JUS_TITLE = "Justicia aumentada";
export const JUS_SUBTITLE = "Del conflicto a las herramientas que construimos";
export const JUS_EVENTO = "Masterclass de apertura · Semana de la Mediación · El Salvador";
export const JUS_FECHA = "Lunes 14 de septiembre de 2026";
export const JUS_LINK = "rl1-beige.vercel.app/justicia";
export const JUS_QR_PLATAFORMA = "/justicia/qr-plataforma.png";
export const JUS_AUTOR = "Dr. Marco Rossi";
export const JUS_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT (Argentina)";

export const JUS_LOGOS = [
  { src: "/justicia/logo-csj.png", alt: "Órgano Judicial — Corte Suprema de Justicia de El Salvador", fondo: false },
  { src: "/justicia/logo-pgr.png", alt: "Procuraduría General de la República de El Salvador", fondo: false },
  { src: "/justicia/logo-uees.png", alt: "Universidad Evangélica de El Salvador", fondo: true },
];

// --- Actividades en vivo --------------------------------------------------

export const JUS_ACTIVIDADES: ActividadVivo[] = [
  {
    key: "jus_encuesta",
    kind: "encuesta",
    titulo: "¿Quiénes estamos hoy?",
    bajada: "Dos preguntas para conocer la sala.",
    preguntas: [
      {
        id: "rol",
        q: "¿Desde dónde participa?",
        opciones: [
          { id: "judicial", emoji: "⚖️", label: "Órgano Judicial" },
          { id: "pgr", emoji: "🏛️", label: "PGR" },
          { id: "docente", emoji: "👩‍🏫", label: "Docente" },
          { id: "estudiante", emoji: "🎓", label: "Estudiante" },
          { id: "otro", emoji: "✨", label: "Otro" },
        ],
      },
      {
        id: "ia",
        q: "¿Usa inteligencia artificial en su trabajo o estudio?",
        opciones: [
          { id: "diario", emoji: "🔥", label: "Todos los días" },
          { id: "aveces", emoji: "🙂", label: "A veces" },
          { id: "nunca", emoji: "🚫", label: "Nunca" },
        ],
      },
    ],
  },
  {
    key: "jus_tarea",
    kind: "chips",
    titulo: "¿Qué dejarían de hacer mañana?",
    bajada: "Marque las tareas repetitivas que más tiempo le quitan.",
    opciones: [
      { id: "antecedentes", emoji: "🔎", label: "Buscar antecedentes" },
      { id: "ordenar", emoji: "🗂️", label: "Ordenar documentos" },
      { id: "transcribir", emoji: "🎙️", label: "Transcribir audiencias" },
      { id: "plazos", emoji: "📅", label: "Revisar datos y plazos" },
      { id: "borradores", emoji: "📝", label: "Preparar borradores" },
      { id: "consultas", emoji: "💬", label: "Responder lo mismo muchas veces" },
      { id: "notificar", emoji: "📨", label: "Notificar y comunicar" },
    ],
  },
  {
    key: "jus_camino",
    kind: "opciones",
    titulo: "¿Qué camino elegirían?",
    bajada: "Un proveedor y su cliente discuten un saldo, pero necesitan seguir trabajando juntos un año más.",
    opciones: [
      { id: "negociar", emoji: "🤝", label: "Negociar" },
      { id: "mediar", emoji: "🗣️", label: "Mediar" },
      { id: "arbitrar", emoji: "📜", label: "Arbitrar" },
      { id: "juzgar", emoji: "⚖️", label: "Juzgar" },
    ],
  },
  {
    key: "jus_herramienta",
    kind: "texto",
    titulo: "¿Qué herramienta construirían?",
    bajada: "Una función que le gustaría tener mañana en su oficina. En una frase.",
    placeholder: "Una herramienta que…",
    maxChars: 160,
  },
  {
    key: "jus_resumen",
    kind: "opciones",
    titulo: "¿Aceptarían este resumen?",
    bajada: "Lea el correo y el resumen que aparecen en la pantalla. Después vote.",
    opciones: [
      { id: "si", emoji: "✅", label: "Sí, es correcto" },
      { id: "no", emoji: "❌", label: "No, agrega algo" },
      { id: "nose", emoji: "🤔", label: "Necesito más información" },
    ],
  },
  {
    key: "jus_entrada",
    kind: "opciones",
    titulo: "¿Por dónde empezamos?",
    bajada: "Les llega este expediente hoy. ¿Qué necesitan saber primero?",
    opciones: [
      { id: "hechos", emoji: "🕐", label: "Qué ocurrió" },
      { id: "posiciones", emoji: "🧭", label: "Qué reclama cada parte" },
      { id: "diferencias", emoji: "🔀", label: "Dónde difieren los documentos" },
    ],
  },
  {
    key: "jus_frase",
    kind: "opciones",
    titulo: "“Sí, recibimos todo”",
    bajada: "Una captura de WhatsApp del 28/03. ¿Qué les permite concluir esta frase?",
    opciones: [
      { id: "todo", emoji: "✅", label: "Que el cliente recibió todo conforme" },
      { id: "cajas", emoji: "📦", label: "Que llegaron las cajas" },
      { id: "nada", emoji: "🤷", label: "Nada, sin más contexto" },
    ],
  },
  {
    key: "jus_oficina",
    kind: "texto",
    titulo: "¿Qué construiríamos para su oficina?",
    bajada: "Una tarea concreta con la que empezaría. Sobre esa tarea se arma un primer prototipo.",
    placeholder: "Empezaría por…",
    maxChars: 160,
  },
];

export function getJusActividad(key: string): ActividadVivo | undefined {
  return JUS_ACTIVIDADES.find((a) => a.key === key);
}

export const JUS_CONFIG: ClaseVivoConfig = {
  slug: JUS_SLUG,
  titulo: JUS_TITLE,
  materia: JUS_EVENTO,
  autor: JUS_AUTOR,
  cargo: JUS_CARGO,
  poll: { alumno: 4000, alumnoMe: 20000, deck: 2500 },
  getActividad: getJusActividad,
};

// --- Placas del deck --------------------------------------------------------

export type ModoDemo = "documentos" | "recorrido" | "fuentes" | "nuevo" | "revision";

export interface JusPortada {
  t: "portada";
  activa: ActivityKey;
}
export interface JusIngreso {
  t: "ingreso";
  activa: ActivityKey;
}
export interface JusPlaca {
  t: "placa";
  titulo: string;
  bajada: string;
  lede?: string;
  pills?: string[];
  diagrama: DiagramaJusId;
}
export interface JusActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
  /** Material que se muestra en la placa, sobre los resultados. */
  material?: "resumen" | "captura";
}
export interface JusDemo {
  t: "demo";
  titulo: string;
  bajada: string;
  modo: ModoDemo;
}
export interface JusFinal {
  t: "final";
}
export type JusSlide = (JusPortada | JusIngreso | JusPlaca | JusActividad | JusDemo | JusFinal) & {
  parte?: string;
};

export const JUS_SLIDES: JusSlide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby" },
  {
    t: "placa",
    titulo: "Estuve de ese lado",
    bajada: "Trabajé en la justicia. Hoy desarrollo tecnología.",
    diagrama: "bio",
  },
  { t: "actividad", activa: "jus_encuesta", escena: "Para empezar" },
  { t: "actividad", activa: "jus_tarea", escena: "Una tarea. Todos los días." },
  {
    t: "placa",
    titulo: "El tiempo también importa",
    bajada: "Buscar. Copiar. Revisar. Volver a empezar.",
    diagrama: "tiempo",
  },

  // --- 1 · Del conflicto al diálogo ---------------------------------------
  {
    t: "placa",
    parte: "1 · Del conflicto al diálogo",
    titulo: "Antes del expediente, el conflicto",
    bajada: "Convivir también es aprender a resolver.",
    diagrama: "conflicto",
  },
  {
    t: "placa",
    titulo: "Inventamos formas de resolver",
    bajada: "Acuerdos, terceros, reglas e instituciones.",
    pills: ["negociación directa", "personas reconocidas por la comunidad", "costumbres", "procedimientos ante autoridades"],
    diagrama: "formas",
    lede: "No se reemplazan unas a otras: conviven y se transforman.",
  },

  // --- 2 · Tecnologías sociales --------------------------------------------
  {
    t: "placa",
    parte: "2 · Juicio, arbitraje y mediación",
    titulo: "El juicio es una tecnología",
    bajada: "Personas y reglas organizadas para decidir.",
    diagrama: "juicio",
  },
  {
    t: "placa",
    titulo: "Un conflicto, distintos caminos",
    bajada: "Negociar. Mediar. Arbitrar. Juzgar.",
    diagrama: "caminos",
    lede: "¿Quién decide? ¿Qué necesita conocer? ¿Cómo participan las partes? ¿Qué resultado se busca?",
  },
  { t: "actividad", activa: "jus_camino", escena: "La herramienta depende del problema" },

  // --- 3 · Del procedimiento al entorno digital ----------------------------
  {
    t: "placa",
    parte: "3 · Qué transforma lo digital",
    titulo: "Del papel a la pantalla",
    bajada: "El expediente cambió de soporte.",
    pills: ["documentos digitales", "presentaciones electrónicas", "notificaciones", "audiencias remotas"],
    diagrama: "papel",
  },
  {
    t: "placa",
    titulo: "¿Y cuánto cambió el trabajo?",
    bajada: "Tener el PDF es apenas el comienzo.",
    diagrama: "pdfs",
    lede: "Tener la información disponible no es lo mismo que poder usarla.",
  },
  {
    t: "placa",
    titulo: "Diseñar cómo trabajamos",
    bajada: "Ingreso, organización, consulta y revisión.",
    diagrama: "flujo",
  },
  { t: "actividad", activa: "jus_herramienta", escena: "Partamos de una necesidad real" },

  // --- 4 · IA: capacidades y límites ----------------------------------------
  {
    t: "placa",
    parte: "4 · IA: capacidades y límites",
    titulo: "IA: trabajar con lenguaje",
    bajada: "Preguntar, resumir, comparar y generar.",
    diagrama: "verbos",
  },
  {
    t: "placa",
    titulo: "Responder bien requiere contexto",
    bajada: "Documentos, instrucciones y una tarea clara.",
    diagrama: "contexto",
  },
  {
    t: "placa",
    titulo: "Una herramienta combina capacidades",
    bajada: "IA, búsquedas, cálculos y reglas.",
    diagrama: "combina",
  },
  {
    t: "placa",
    titulo: "Hablar con seguridad no alcanza",
    bajada: "Una respuesta convincente puede equivocarse.",
    pills: ["lo que surge de los antecedentes", "lo que infiere el modelo", "lo que propone y debe discutirse"],
    diagrama: "seguridad",
  },
  { t: "actividad", activa: "jus_resumen", escena: "Lean primero. Decidan después.", material: "resumen" },
  {
    t: "placa",
    titulo: "Lo que el resumen agregó",
    bajada: "Ofrecer un pago no aclara todo.",
    diagrama: "agrego",
  },

  // --- 5 · Human in the loop -------------------------------------------------
  {
    t: "placa",
    parte: "5 · Human in the loop",
    titulo: "Human in the loop",
    bajada: "Dirigir, contrastar y corregir.",
    diagrama: "hitl",
  },
  {
    t: "placa",
    titulo: "Delegar tareas, conservar el criterio",
    bajada: "La responsabilidad exige participación.",
    diagrama: "delegacion",
  },
  {
    t: "placa",
    titulo: "Una forma concreta de trabajar",
    bajada: "Pedir. Verificar. Corregir. Aprobar.",
    diagrama: "metodo",
    lede: "Estos cuatro pasos los vamos a ver ahora, en la herramienta.",
  },

  // --- 6 · Del expediente a la acción ----------------------------------------
  {
    t: "placa",
    parte: "6 · Del expediente a la acción",
    titulo: "En Argentina ya hay experiencias",
    bajada: "Tecnología aplicada al trabajo judicial.",
    pills: ["Prometea · Ministerio Público Fiscal de la Ciudad de Buenos Aires", "automatización documental", "asistencia en tareas repetitivas"],
    diagrama: "antecedente",
  },
  {
    t: "demo",
    titulo: "Ahora, nuestro propio caso",
    bajada: "Un conflicto ficticio. Documentos para explorar.",
    modo: "documentos",
  },
  { t: "actividad", activa: "jus_entrada", escena: "Ustedes eligen por dónde empezar" },
  {
    t: "demo",
    titulo: "El recorrido que eligieron",
    bajada: "Cada resultado, vinculado al documento que lo sostiene.",
    modo: "recorrido",
  },
  {
    t: "placa",
    titulo: "¿Cómo “aprende” del expediente?",
    bajada: "Incorporar, organizar y recuperar contexto.",
    diagrama: "rag",
    lede: "Trabajar con el contexto de un expediente no significa reentrenar el modelo.",
  },
  {
    t: "demo",
    titulo: "Mostrame de dónde sale",
    bajada: "Cada afirmación, con su fuente.",
    modo: "fuentes",
  },
  { t: "actividad", activa: "jus_frase", escena: "Prueba digital", material: "captura" },
  {
    t: "demo",
    titulo: "Aparece un mensaje más",
    bajada: "Nuevo contexto. Conclusiones en revisión.",
    modo: "nuevo",
  },
  {
    t: "demo",
    titulo: "Del análisis al trabajo concreto",
    bajada: "Antecedentes judiciales y preparación de una mediación.",
    modo: "revision",
  },
  { t: "actividad", activa: "jus_oficina", escena: "Una tarea concreta. Un primer prototipo." },
  { t: "final" },
];
