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
export const JUS_LINK = "justicia.rossi-ia.com";
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
    key: "jus_ias",
    kind: "chips",
    titulo: "¿Qué herramientas de IA usa?",
    bajada: "Marque todas las que haya usado alguna vez.",
    opciones: [
      { id: "chatgpt", emoji: "🟢", label: "ChatGPT" },
      { id: "claude", emoji: "🟠", label: "Claude" },
      { id: "gemini", emoji: "🔵", label: "Gemini" },
      { id: "notebooklm", emoji: "📓", label: "NotebookLM" },
      { id: "copilot", emoji: "🪟", label: "Copilot" },
      { id: "otra", emoji: "✨", label: "Otra" },
      { id: "ninguna", emoji: "🚫", label: "Ninguna" },
    ],
    exclusiva: "ninguna",
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

// --- Kit de herramientas (barra inferior del deck) -------------------------

export interface HerramientaKit {
  id: string;
  label: string;
  emoji: string;
  url: string;
}

/** Siempre a mano abajo en la presentación, para abrir en vivo lo que haga falta. */
export const JUS_KIT: HerramientaKit[] = [
  { id: "claude", label: "Claude", emoji: "🟠", url: "https://claude.ai" },
  { id: "chatgpt", label: "ChatGPT", emoji: "🟢", url: "https://chatgpt.com" },
  { id: "gemini", label: "Gemini", emoji: "🔵", url: "https://gemini.google.com" },
  { id: "notebooklm", label: "NotebookLM", emoji: "📓", url: "https://notebooklm.google.com" },
  { id: "pinpoint", label: "Pinpoint", emoji: "📌", url: "https://journaliststudio.google.com/pinpoint" },
  { id: "tareas", label: "Tareas programadas", emoji: "⏰", url: "https://chatgpt.com/tasks" },
];

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
  diagrama?: DiagramaJusId;
  /** Tarjetas grandes para abrir herramientas en vivo (reemplazan al diagrama). */
  herramientas?: string[];
}
export interface JusActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
  /** Material que se muestra en la placa, sobre los resultados. */
  material?: "resumen";
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
  /** Abre el kit de herramientas al llegar a esta placa. */
  kit?: boolean;
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

  // --- 4 · IA: capacidades y riesgos conocidos ------------------------------
  {
    t: "placa",
    parte: "4 · IA: capacidades y riesgos",
    titulo: "IA: trabajar con lenguaje",
    bajada: "Preguntar, resumir, comparar y generar.",
    diagrama: "verbos",
  },
  {
    t: "placa",
    titulo: "Hablar con seguridad no alcanza",
    bajada: "Una respuesta convincente puede equivocarse.",
    pills: ["lo que surge de los antecedentes", "lo que infiere el modelo", "lo que propone y debe discutirse"],
    diagrama: "seguridad",
  },
  {
    t: "placa",
    titulo: "Alucinación: seis precedentes que no existían",
    bajada: "Mata v. Avianca, Nueva York, 2023.",
    diagrama: "alucinacion",
    lede: "Los abogados los obtuvieron de ChatGPT y no los verificaron. El tribunal los sancionó.",
    kit: true,
  },
  { t: "actividad", activa: "jus_resumen", escena: "Lean primero. Decidan después.", material: "resumen" },
  {
    t: "placa",
    titulo: "Lo que el resumen agregó",
    bajada: "Ofrecer un pago no aclara todo.",
    diagrama: "agrego",
  },
  {
    t: "placa",
    titulo: "Sesgos: el modelo aprende de lo que ve",
    bajada: "Si los datos del pasado discriminan, la herramienta repite la discriminación.",
    pills: [
      "COMPAS (EE. UU., 2016): el doble de falsos “alto riesgo” en personas negras",
      "Amazon (2018): selección de personal que penalizaba a mujeres",
      "sesgo de automatización: confiar de más en la máquina",
    ],
    diagrama: "sesgos",
    kit: true,
  },

  // --- 5 · Cómo se instruye un modelo ----------------------------------------
  {
    t: "placa",
    parte: "5 · Cómo se instruye un modelo",
    titulo: "Prompt de sistema y prompt de usuario",
    bajada: "Reglas estables de la herramienta y el pedido de cada consulta.",
    diagrama: "sistema",
  },
  {
    t: "placa",
    titulo: "Responder bien requiere contexto",
    bajada: "Documentos, instrucciones y una tarea clara.",
    diagrama: "contexto",
    kit: true,
  },
  {
    t: "placa",
    titulo: "Memoria persistente",
    bajada: "La herramienta recuerda de una conversación a otra.",
    diagrama: "memoria",
    lede: "Ahorra repetir el contexto. En el trabajo judicial, cuidado con lo que queda guardado.",
    kit: true,
  },
  {
    t: "placa",
    titulo: "Proyectos y skills",
    bajada: "Dónde se trabaja un asunto y cómo se hace una tarea.",
    pills: ["Proyectos en Claude y ChatGPT", "Gems en Gemini", "Skills: procedimientos reutilizables"],
    diagrama: "proyectos",
    kit: true,
  },
  {
    t: "placa",
    titulo: "Tareas programadas y agentes",
    bajada: "La herramienta ya no solo responde: también trabaja sola.",
    diagrama: "tareas",
    kit: true,
  },
  { t: "actividad", activa: "jus_ias", escena: "Antes de mostrarlo en vivo" },
  {
    t: "placa",
    titulo: "Veámoslo en vivo",
    bajada: "Las mismas ideas, en herramientas que ya existen.",
    herramientas: ["claude", "chatgpt", "gemini", "notebooklm", "pinpoint"],
  },
  {
    t: "placa",
    titulo: "RAG: responder desde sus fuentes",
    bajada: "Incorporar, organizar y recuperar contexto.",
    diagrama: "rag",
    lede: "Así trabaja NotebookLM: responde desde los documentos que usted carga y señala el pasaje. No se reentrena el modelo.",
    kit: true,
  },
  {
    t: "demo",
    titulo: "Una herramienta propia: cada afirmación, con su fuente",
    bajada: "Expediente ficticio · haga clic en una afirmación.",
    modo: "fuentes",
  },
  {
    t: "placa",
    titulo: "Una herramienta combina capacidades",
    bajada: "IA, búsquedas, cálculos y reglas.",
    diagrama: "combina",
  },

  // --- 6 · Human in the loop -------------------------------------------------
  {
    t: "placa",
    parte: "6 · Human in the loop",
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
    lede: "Vale para cualquier herramienta, propia o ajena.",
  },

  // --- 7 · Que la justicia construya sus herramientas -----------------------
  {
    t: "placa",
    parte: "7 · Soberanía tecnológica",
    titulo: "La tecnología amplifica capacidades",
    bajada: "Lo que hacemos bien… y también lo que hacemos mal.",
    diagrama: "amplifica",
  },
  {
    t: "placa",
    titulo: "Que la justicia sea dueña de sus herramientas",
    bajada: "Datos propios, reglas propias, control propio.",
    diagrama: "soberania",
  },
  {
    t: "placa",
    titulo: "Lo que la justicia puede construir",
    bajada: "Herramientas de IA al servicio del justiciable.",
    diagrama: "herramientas",
    lede: "CuscatIA investiga cómo diseñar asistencia para la redacción judicial, con control humano y trazabilidad. Es un proyecto en desarrollo.",
  },
  {
    t: "placa",
    titulo: "Lenguaje claro",
    bajada: "Que la persona entienda su propio caso.",
    diagrama: "lenguajeclaro",
    kit: true,
  },
  {
    t: "placa",
    titulo: "En Argentina ya hay experiencias",
    bajada: "Tecnología aplicada al trabajo judicial.",
    pills: ["Prometea · Ministerio Público Fiscal de la Ciudad de Buenos Aires", "automatización documental", "asistencia en tareas repetitivas"],
    diagrama: "antecedente",
  },
  { t: "actividad", activa: "jus_oficina", escena: "Una tarea concreta. Un primer prototipo." },
  { t: "final" },
];
