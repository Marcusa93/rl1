// ============================================================
// Masterclass "Justicia aumentada" — Semana de la Mediación,
// El Salvador (lunes 14/09/2026). Público: Corte Suprema de
// Justicia, PGR, docentes y estudiantes de la UEES.
// Duración objetivo: 40 a 60 minutos (≈28 placas + simulador de 5 min).
//
// /justicia        → app del participante (celular)
// /justicia/clase  → presentación del docente (comparte pantalla)
// Motor genérico en components/clase/ y lib/clase-vivo.ts.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig, Explorable } from "./clase-vivo";
import type { ActivityKey } from "./types";
import type { DiagramaJusId } from "@/components/justicia/diagramas";
import type { CapturaId } from "@/components/justicia/capturas";

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

const SEMAFORO = [
  { id: "si", emoji: "🟢", label: "Sí" },
  { id: "revision", emoji: "🟡", label: "Con revisión" },
  { id: "no", emoji: "🔴", label: "No" },
];

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
  // --- Exprés: un toque y listo --------------------------------------------
  {
    key: "jus_x_alucina",
    kind: "opciones",
    titulo: "Exprés: ¿de dónde sale la respuesta?",
    bajada: "Un chat general, sin búsqueda ni documentos cargados. Le pido un precedente. ¿Qué hace?",
    opciones: [
      { id: "busca", emoji: "🔎", label: "Lo busca en una base de fallos" },
      { id: "predice", emoji: "🧠", label: "Predice el texto más probable" },
      { id: "avisa", emoji: "🙋", label: "Me avisa si no lo sabe" },
    ],
    correcta: "predice",
    revela: "Predice. Sin búsqueda ni documentos, arma la respuesta que suena más probable, aunque el fallo no exista.",
  },
  {
    key: "jus_x_principio",
    kind: "opciones",
    titulo: "Exprés: ¿qué principio es el más difícil de cumplir hoy?",
    bajada: "Piense en su oficina, no en el ideal.",
    opciones: [
      { id: "verificacion", emoji: "🔍", label: "Verificación" },
      { id: "control", emoji: "✋", label: "Control humano" },
      { id: "privacidad", emoji: "🔐", label: "Privacidad" },
      { id: "transparencia", emoji: "🪟", label: "Transparencia" },
      { id: "igualdad", emoji: "⚖️", label: "Igualdad" },
    ],
  },
  {
    key: "jus_x_delegar",
    kind: "encuesta",
    titulo: "Exprés: ¿se lo delegaría a una IA?",
    bajada: "Semáforo: verde, amarillo (con revisión) o rojo.",
    preguntas: [
      { id: "transcribir", q: "Transcribir una audiencia", opciones: SEMAFORO },
      { id: "notificar", q: "Redactar una notificación en lenguaje claro", opciones: SEMAFORO },
      { id: "decidir", q: "Decidir una medida cautelar", opciones: SEMAFORO },
    ],
  },
  // --- Simulador final: "Un conflicto. Un clic. Dos formas de resolverlo" ----
  {
    key: "jus_sim",
    kind: "opciones",
    titulo: "¿Qué miramos primero?",
    bajada: "Si tuviera que empezar a trabajar este caso, ¿por dónde empezaría?",
    opciones: [
      { id: "mensajes", emoji: "💬", label: "Ver los mensajes" },
      { id: "contrato", emoji: "📄", label: "Ver el contrato" },
    ],
  },
  {
    key: "jus_nube",
    kind: "palabra",
    titulo: "Una palabra para llevarse",
    bajada: "¿Con qué palabra se va de esta clase?",
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
  reacciones: true,
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
  /** Tarjetas que el docente toca para desplegar una explicación o un ejemplo. */
  explora?: Explorable[];
  /** Componente interactivo propio que reemplaza al diagrama. */
  interactivo?: "pdfs" | "cotio";
  /** Capturas ilustrativas a un clic (respaldo si no se puede mostrar en vivo). */
  capturas?: CapturaId[];
}
export interface JusActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
}
/** Simulador de la actividad final: caso, votación, documentos e IA a un clic. */
export interface JusSimulador {
  t: "simulador";
  activa: ActivityKey;
}
export interface JusFinal {
  t: "final";
}
export type JusSlide = (JusPortada | JusIngreso | JusPlaca | JusActividad | JusSimulador | JusFinal) & {
  parte?: string;
  /** Abre el kit de herramientas al llegar a esta placa. */
  kit?: boolean;
};

/** Nombre corto de una placa (índice del control remoto). */
export function tituloPlaca(s: JusSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso con QR";
    case "placa":
      return s.titulo;
    case "actividad":
      return `🗳️ ${getJusActividad(s.activa)?.titulo ?? "Actividad"}`;
    case "simulador":
      return "🎬 Un conflicto. Un clic.";
    case "final":
      return "Gracias";
  }
}

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

  // --- 1 · Del conflicto al diálogo ---------------------------------------
  {
    t: "placa",
    parte: "1 · Del conflicto al diálogo",
    titulo: "Inventamos formas de resolver",
    bajada: "Acuerdos, terceros, reglas e instituciones.",
    diagrama: "formas",
    lede: "No se reemplazan unas a otras: conviven y se transforman.",
    explora: [
      {
        emoji: "🤝",
        label: "Negociación directa",
        texto: "Las partes buscan el acuerdo sin un tercero. Desde el regateo en el mercado hasta la negociación entre abogados antes de un juicio.",
      },
      {
        emoji: "🧓",
        label: "Personas reconocidas por la comunidad",
        texto: "Consejos de ancianos, autoridades religiosas, jueces de paz: un tercero con autoridad moral ayuda a acordar o decide. Su fuerza es la confianza.",
      },
      {
        emoji: "📜",
        label: "Costumbres",
        texto: "Reglas no escritas que la comunidad cumple como obligatorias: el derecho consuetudinario de los pueblos originarios o los usos del comercio.",
      },
      {
        emoji: "🏛️",
        label: "Procedimientos ante autoridades",
        texto: "El Estado organiza el conflicto con reglas escritas, tribunales y decisiones que se pueden ejecutar. No reemplazó a las otras formas: convive con ellas.",
      },
    ],
  },
  {
    t: "placa",
    titulo: "El juicio es una tecnología",
    bajada: "Y no es el único camino: negociar, mediar, arbitrar, juzgar.",
    diagrama: "caminos",
    explora: [
      { emoji: "🤝", label: "Negociar", texto: "Deciden las partes, sin tercero. Sirve cuando hay confianza y el vínculo importa. La IA puede ayudar a preparar opciones." },
      {
        emoji: "🗣️",
        label: "Mediar",
        texto: "Deciden las partes, con alguien que facilita la conversación. La herramienta ayuda a preparar preguntas; los intereses se confirman con las personas.",
      },
      { emoji: "📜", label: "Arbitrar", texto: "Deciden árbitros que las partes eligieron. Útil en lo técnico y lo comercial. La asistencia sirve para organizar prueba y antecedentes." },
      { emoji: "⚖️", label: "Juzgar", texto: "Decide la autoridad judicial, con fuerza obligatoria. La asistencia ordena el expediente; la decisión y su fundamento son del juez." },
    ],
  },

  // --- 2 · Qué transforma lo digital -----------------------------------------
  {
    t: "placa",
    parte: "2 · Qué transforma lo digital",
    titulo: "Del papel a la pantalla",
    bajada: "Tener el PDF es apenas el comienzo.",
    interactivo: "pdfs",
  },

  // --- 3 · IA: capacidades y riesgos conocidos ------------------------------
  {
    t: "placa",
    parte: "3 · IA: capacidades y riesgos",
    titulo: "IA: trabajar con lenguaje",
    bajada: "Preguntar, resumir, comparar y generar.",
    diagrama: "verbos",
    kit: true,
    explora: [
      {
        emoji: "❓",
        label: "Preguntar",
        texto: "Consultar un documento en lenguaje natural, sin buscar palabra por palabra.",
        ejemplo: {
          pedido: "Según el acta de audiencia adjunta, ¿cuándo fue notificada la parte demandada?",
          respuesta: "El 14/02/2026, según el acta de audiencia preliminar (página 2).",
        },
      },
      {
        emoji: "📝",
        label: "Resumir",
        texto: "Reducir un texto largo a lo esencial, con una estructura que usted define.",
        ejemplo: {
          pedido: "Resuma esta sentencia en cinco líneas: hechos, pretensión, decisión y fundamento principal.",
          respuesta: "Hechos: despido sin causa en 2025. · Pretensión: indemnización. · Decisión: se admite parcialmente. · Fundamento: no se probaron las horas extra.",
        },
      },
      {
        emoji: "🔀",
        label: "Comparar",
        texto: "Detectar diferencias entre versiones, relatos o documentos.",
        ejemplo: {
          pedido: "Compare estas dos versiones del contrato y liste qué cambió.",
          respuesta: "Cláusula 4: el plazo de pago pasó de 30 a 10 días. · Cláusula 7: se agregó una penalidad por mora.",
        },
      },
      {
        emoji: "✍️",
        label: "Generar",
        texto: "Producir un primer borrador que la persona revisa y corrige.",
        ejemplo: {
          pedido: "Redacte un borrador de oficio al Registro solicitando informe de dominio del inmueble, en lenguaje claro.",
          respuesta: "«Solicitamos que informe quién figura como titular del inmueble inscrito bajo la matrícula indicada…» — revisar los datos antes de firmar.",
        },
      },
    ],
  },
  { t: "actividad", activa: "jus_x_alucina", escena: "Exprés · un toque" },
  {
    t: "placa",
    titulo: "Alucinación: seis precedentes que no existían",
    bajada: "Mata v. Avianca, Nueva York, 2023. Hablar con seguridad no alcanza.",
    diagrama: "alucinacion",
    kit: true,
    explora: [
      {
        emoji: "📰",
        label: "Qué pasó",
        texto: "Un escrito citó seis precedentes con nombres, fechas y citas verosímiles. Ninguno existía. Los abogados los habían obtenido de ChatGPT sin verificarlos, y el tribunal los sancionó.",
      },
      {
        emoji: "⚙️",
        label: "Por qué ocurre",
        texto: "El modelo predice el texto más probable; no consulta una base de fallos. Si no sabe, puede completar con algo que suena correcto.",
      },
      {
        emoji: "💭",
        label: "Dicho, inferido, propuesto",
        texto: "Distinga lo que surge de un documento, lo que el modelo infiere y lo que propone. Solo lo primero es un dato; lo demás hay que confirmarlo.",
      },
      {
        emoji: "🛡️",
        label: "Cómo prevenirla",
        texto: "Pedir la fuente de cada cita, verificarla en una base oficial y usar herramientas que respondan desde documentos cargados (RAG).",
      },
    ],
  },
  {
    t: "placa",
    titulo: "Sesgos: el modelo aprende de lo que ve",
    bajada: "Si los datos del pasado discriminan, la herramienta repite la discriminación.",
    diagrama: "sesgos",
    kit: true,
    explora: [
      {
        emoji: "⚖️",
        label: "COMPAS (EE. UU., 2016)",
        texto: "Un sistema que estimaba el riesgo de reincidencia. Una investigación periodística encontró que marcaba como «alto riesgo» a personas negras que no reincidieron casi el doble de veces que a personas blancas.",
      },
      {
        emoji: "👔",
        label: "Amazon (2018)",
        texto: "Una herramienta de selección aprendió de currículums de años anteriores, en su mayoría de hombres, y penalizaba los que mencionaban a mujeres. La empresa la abandonó.",
      },
      {
        emoji: "🤖",
        label: "Sesgo de automatización",
        texto: "La tendencia a creerle a la máquina aunque se equivoque. El riesgo no está solo en el sistema: también en cuánto lo revisamos.",
      },
    ],
  },

  // --- 4 · Cómo se instruye un modelo ----------------------------------------
  {
    t: "placa",
    parte: "4 · Cómo se instruye un modelo",
    titulo: "¿Qué es un prompt?",
    bajada: "Una instrucción con cinco piezas: Contexto, Objetivo, Tareas, Input y Output.",
    interactivo: "cotio",
    kit: true,
  },
  {
    t: "placa",
    titulo: "El contexto sostiene el pedido",
    bajada: "Sin documentos ni reglas, el modelo completa con lo que «sabe» en general.",
    diagrama: "contexto",
    kit: true,
    explora: [
      { emoji: "🗂️", label: "Fuentes", texto: "Qué documentos usar y cuáles no. Con fuentes definidas, cada dato se puede verificar." },
      {
        emoji: "⚙️",
        label: "Dónde vive el prompt de sistema",
        texto: "En Claude, en las instrucciones de un proyecto; en ChatGPT, en un GPT o en las instrucciones personalizadas; en Gemini, en un Gem. Se escribe una vez.",
      },
      {
        emoji: "✅",
        label: "Un pedido completo",
        texto: "Fuentes, tarea, formato y qué hacer con lo que falta, en un solo pedido.",
        ejemplo: {
          pedido: "Con base solo en los documentos adjuntos, arme una cronología en una tabla (fecha, hecho, documento). Si falta un dato, indíquelo; no lo complete.",
          respuesta: "03/03 · firma del contrato · D1 | 28/03 · entrega de 10 cajas · D3 | Falta: acta de conformidad.",
        },
      },
    ],
  },
  {
    t: "placa",
    titulo: "Memoria persistente",
    bajada: "La herramienta recuerda de una conversación a otra.",
    diagrama: "memoria",
    kit: true,
    capturas: ["memoria"],
    explora: [
      { emoji: "🧠", label: "Qué recuerda", texto: "Lo que usted le cuenta o le pide guardar: su cargo, su estilo, sus formatos habituales." },
      { emoji: "🗑️", label: "Cómo se controla", texto: "Se puede ver, editar y borrar desde la configuración, o desactivar. Conviene revisarla cada tanto." },
      { emoji: "⚠️", label: "En el trabajo judicial", texto: "No dejar datos de casos ni de personas en la memoria de herramientas externas. Lo estable sí; lo sensible, no." },
    ],
  },
  {
    t: "placa",
    titulo: "Proyectos y skills",
    bajada: "Dónde se trabaja un asunto y cómo se hace una tarea.",
    diagrama: "proyectos",
    kit: true,
    capturas: ["proyecto", "skill"],
    explora: [
      {
        emoji: "📁",
        label: "Proyecto",
        texto: "Un espacio para un asunto o una materia: instrucciones propias, documentos y conversaciones juntas. Existe en Claude y en ChatGPT; en Gemini se parece a un Gem.",
      },
      {
        emoji: "🧩",
        label: "Skill",
        texto: "Un procedimiento empaquetado (pasos, plantillas, criterios) que la herramienta usa cuando la tarea lo requiere, en cualquier asunto.",
      },
      { emoji: "🤔", label: "¿Cuál uso?", texto: "Proyecto para el contexto de un caso; skill para una forma de trabajar que se repite en muchos casos." },
    ],
  },
  {
    t: "placa",
    titulo: "Tareas programadas y agentes",
    bajada: "La herramienta ya no solo responde: también trabaja sola.",
    diagrama: "tareas",
    kit: true,
    capturas: ["tarea"],
    explora: [
      { emoji: "⏰", label: "Tarea programada", texto: "Una consulta que se ejecuta sola a una hora fija: «cada lunes, resumir las resoluciones nuevas sobre familia»." },
      { emoji: "🤖", label: "Agente", texto: "Encadena pasos para cumplir un objetivo: buscar, leer, resumir y enviar, sin que alguien intervenga entre paso y paso." },
      { emoji: "✋", label: "El límite", texto: "Cuanto más actúa sola, más importa definir qué puede hacer, revisar lo que hizo y poder detenerla." },
    ],
  },
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
    kit: true,
    explora: [
      { emoji: "📥", label: "Incorporar", texto: "Se cargan los documentos: expedientes, normas, fallos." },
      { emoji: "🧩", label: "Organizar", texto: "Se dividen en fragmentos y se indexan por su significado." },
      { emoji: "🎯", label: "Recuperar", texto: "Ante cada pregunta, se buscan los fragmentos más relevantes." },
      {
        emoji: "📌",
        label: "Responder con fuente",
        texto: "El modelo responde con esos fragmentos y señala de dónde salió cada dato. Si no está en los documentos, debería decirlo. Así trabaja NotebookLM.",
      },
      { emoji: "🧠", label: "RAG no es reentrenar", texto: "El modelo no aprende el expediente: lo consulta en el momento. Por eso se puede actualizar o borrar." },
    ],
  },

  // --- 5 · Lo que dijo la Sala de lo Constitucional ------------------------------
  // Inconstitucionalidad 57-2025 (resolución del 13/03/2026, comunicado del
  // 16/03/2026) y seminario-taller de la Sala de lo Penal con GIZ (04/09/2026).
  {
    t: "placa",
    parte: "5 · Lo que dijo la Sala",
    titulo: "La Sala de lo Constitucional ya se pronunció",
    bajada: "Estándares éticos y legales para usar IA en el Estado y en los tribunales.",
    diagrama: "ambitos",
    pills: ["Inconstitucionalidad 57-2025", "Resolución del 13 de marzo de 2026"],
    explora: [
      {
        emoji: "📝",
        label: "Cómo empezó",
        texto: "Unos ciudadanos usaron IA para redactar su demanda. La Sala aclaró qué es la IA, qué tipos hay y cómo funciona, revisó las reglas nacionales e internacionales y analizó sus beneficios y riesgos para los derechos fundamentales.",
      },
      {
        emoji: "🏢",
        label: "Administración pública",
        texto: "La IA puede agilizar trámites, mejorar la eficiencia y reducir la corrupción. Pero la automatización no debe provocar discriminación algorítmica por sesgos en los sistemas.",
      },
      {
        emoji: "⚖️",
        label: "Administración de justicia",
        texto: "Toda persona tiene derecho a un juez humano y a un procurador humano: la PGR también está alcanzada. La IA en labores judiciales va bajo estrictos controles éticos y legales, con supervisión humana obligatoria.",
      },
      {
        emoji: "🎓",
        label: "Y siguió",
        texto: "El 4 de septiembre, la Sala de lo Penal (con la cooperación alemana, GIZ) hizo un seminario-taller con el mismo eje: que la IA no sustituya el razonamiento judicial ni la valoración humana.",
      },
    ],
  },
  {
    t: "placa",
    titulo: "Los principios que fijó la Sala",
    bajada: "Y el porqué de cada uno, con lo que vimos hoy.",
    lede: "El objetivo: equilibrar los avances tecnológicos con las obligaciones del Estado, los jueces y los abogados frente a las personas.",
    explora: [
      { emoji: "🪟", label: "Transparencia", texto: "Saber cuándo y cómo se usó IA. Por qué: quien recibe una decisión tiene derecho a entender de dónde salió." },
      { emoji: "🧾", label: "Responsabilidad", texto: "Siempre responde una persona. Por qué: la herramienta no firma. En Mata v. Avianca se sancionó a los abogados, no a ChatGPT." },
      { emoji: "🔐", label: "Privacidad", texto: "Los datos de un expediente son de las personas. Por qué: lo que se carga en una herramienta externa puede quedar en su memoria o en sus servidores." },
      { emoji: "✋", label: "Control humano", texto: "La IA asiste; no decide. Por qué: el derecho a un juez humano y a un procurador humano." },
      { emoji: "🛡️", label: "Prevención de riesgos", texto: "Evaluar antes de usar. Por qué: conocer las fallas (alucinación, sesgo) permite diseñar controles antes del error." },
      { emoji: "⚖️", label: "Igualdad", texto: "No discriminar. Por qué: si los datos del pasado discriminan, la herramienta repite la discriminación, como en COMPAS." },
      { emoji: "🔍", label: "Verificación", texto: "Contrastar cada dato con su fuente. Por qué: una respuesta convincente puede ser falsa. RAG ayuda, pero no reemplaza la revisión." },
      { emoji: "🧭", label: "Ética", texto: "Lo técnicamente posible no siempre es lo debido. Por qué: la dignidad humana y el debido proceso van primero." },
      { emoji: "📘", label: "Buenas prácticas", texto: "Un método compartido en la oficina: pedir, verificar, corregir, aprobar. Por qué: sin método, cada persona improvisa." },
      { emoji: "🔄", label: "Adaptación constante", texto: "Revisar reglas y capacitarse. Por qué: las herramientas cambian cada pocos meses; los criterios deben acompañarlas." },
    ],
  },
  { t: "actividad", activa: "jus_x_principio", escena: "Exprés · un toque" },

  // --- 6 · Human in the loop -------------------------------------------------
  {
    t: "placa",
    parte: "6 · Human in the loop",
    titulo: "Human in the loop",
    bajada: "Pedir. Verificar. Corregir. Aprobar.",
    diagrama: "metodo",
    lede: "Vale para cualquier herramienta, propia o ajena.",
    explora: [
      { emoji: "📨", label: "Pedir", texto: "Una tarea concreta, con fuentes definidas y un formato claro." },
      { emoji: "🔍", label: "Verificar", texto: "Cada afirmación relevante, contra su fuente." },
      { emoji: "✏️", label: "Corregir", texto: "Ajustar lo que no coincide y pedir aclaraciones." },
      { emoji: "✅", label: "Aprobar", texto: "Solo la versión que usted puede explicar y defender." },
      { emoji: "🚩", label: "Señales de alarma", texto: "Aprobar sin leer las fuentes, no poder explicar una conclusión, quedarse con el primer borrador." },
    ],
  },
  { t: "actividad", activa: "jus_x_delegar", escena: "Exprés · semáforo" },

  // --- 7 · Que la justicia construya sus herramientas -----------------------
  {
    t: "placa",
    parte: "7 · Soberanía tecnológica",
    titulo: "Que la justicia sea dueña de sus herramientas",
    bajada: "La tecnología amplifica lo que hacemos bien… y también lo que hacemos mal.",
    diagrama: "soberania",
    explora: [
      { emoji: "⚠️", label: "Amplifica", texto: "Una oficina puede atender más consultas y más rápido. Pero si la herramienta reproduce un sesgo, lo reproduce en miles de casos." },
      { emoji: "🔐", label: "Datos", texto: "Los datos de las personas y de los expedientes no salen de la institución." },
      { emoji: "📏", label: "Reglas", texto: "La justicia decide qué puede hacer la herramienta y qué no." },
      { emoji: "🧾", label: "Registro", texto: "Cada uso queda registrado y puede auditarse." },
      { emoji: "🔓", label: "Independencia", texto: "No depender de que un proveedor externo cambie precios, términos o funciones." },
    ],
  },
  {
    t: "placa",
    titulo: "Lo que la justicia puede construir",
    bajada: "Herramientas de IA al servicio del justiciable. Toque cada una para verla funcionar.",
    lede: "CuscatIA investiga cómo diseñar asistencia para la redacción judicial, con control humano y trazabilidad. Es un proyecto en desarrollo.",
    explora: [
      {
        emoji: "🔎",
        label: "Búsqueda de jurisprudencia",
        texto: "Encontrar precedentes por su contenido, no solo por palabras exactas, con enlace al fallo completo.",
        demo: "jurisprudencia",
      },
      {
        emoji: "📝",
        label: "Asistencia en redacción",
        texto: "Borradores de providencias y oficios a partir de plantillas propias y datos del expediente, con revisión humana.",
        demo: "redaccion",
      },
      {
        emoji: "🤖",
        label: "Agentes por temática",
        texto: "Asistentes especializados en familia, laboral o consumo, que responden desde normas y criterios de la institución.",
        demo: "agentes",
      },
      {
        emoji: "📊",
        label: "Jurimetría y estadística",
        texto: "Tiempos de resolución, carga de trabajo, patrones de litigio: datos para gestionar mejor y rendir cuentas.",
        demo: "jurimetria",
      },
      {
        emoji: "💬",
        label: "Lenguaje claro",
        texto: "Explicarle a cada persona, en palabras simples, qué pasa con su caso. La IA propone la versión clara; la persona revisa que diga exactamente lo mismo.",
        demo: "lenguaje",
      },
      { emoji: "🇦🇷", label: "Un antecedente", texto: "Prometea, en el Ministerio Público Fiscal de la Ciudad de Buenos Aires: automatización documental y asistencia en tareas repetitivas." },
    ],
  },

  // --- 8 · Actividad final: un conflicto, un clic ---------------------------------
  { t: "simulador", parte: "8 · Un conflicto, un clic", activa: "jus_sim" },
  { t: "actividad", activa: "jus_nube", escena: "Para cerrar" },
  { t: "final" },
];
