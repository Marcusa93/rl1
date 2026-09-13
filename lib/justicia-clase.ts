// ============================================================
// Masterclass "Justicia aumentada" — Semana de la Mediación,
// El Salvador (lunes 14/09/2026). Público: Corte Suprema de
// Justicia, PGR, docentes y estudiantes de la UEES.
//
// /justicia        → app del participante (celular)
// /justicia/clase  → presentación del docente (comparte pantalla)
// Motor genérico en components/clase/ y lib/clase-vivo.ts.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig, Explorable } from "./clase-vivo";
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
  /** Tarjetas que el docente toca para desplegar una explicación o un ejemplo. */
  explora?: Explorable[];
  /** Componente interactivo propio que reemplaza al diagrama. */
  interactivo?: "pdfs";
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
    explora: [
      { emoji: "🔎", label: "Buscar", texto: "Encontrar un dato entre decenas de documentos. Una búsqueda por contenido lo resuelve en segundos." },
      { emoji: "📋", label: "Copiar y ordenar", texto: "Pasar nombres, fechas y montos de un escrito a otro. Se puede extraer y ordenar automáticamente, con revisión." },
      { emoji: "✅", label: "Revisar", texto: "Controlar plazos, referencias y coherencia. Una herramienta puede alertar; la persona confirma." },
      { emoji: "⚖️", label: "Comprender y decidir", texto: "Valorar la prueba, interpretar y resolver. Acá está el criterio: esto no se delega." },
    ],
  },

  // --- 1 · Del conflicto al diálogo ---------------------------------------
  {
    t: "placa",
    parte: "1 · Del conflicto al diálogo",
    titulo: "Antes del expediente, el conflicto",
    bajada: "Convivir también es aprender a resolver.",
    diagrama: "conflicto",
    explora: [
      { emoji: "💧", label: "Recursos", texto: "Dos vecinos y un solo pozo de agua; dos hermanos y una herencia. Lo que alcanza para uno no alcanza para dos." },
      { emoji: "🚧", label: "Límites", texto: "Hasta dónde llega lo mío: un muro medianero, el ruido de madrugada, el uso de un espacio común." },
      { emoji: "🧺", label: "Responsabilidades", texto: "Quién hace qué: el cuidado de un familiar, el mantenimiento de un bien compartido." },
      { emoji: "🤝", label: "Compromisos", texto: "Lo que se prometió y cómo se entiende: un contrato, una palabra dada, un plazo." },
    ],
  },
  {
    t: "placa",
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

  // --- 2 · Tecnologías sociales --------------------------------------------
  {
    t: "placa",
    parte: "2 · Juicio, arbitraje y mediación",
    titulo: "El juicio es una tecnología",
    bajada: "Personas y reglas organizadas para decidir.",
    diagrama: "juicio",
    explora: [
      { emoji: "📣", label: "Pretensión", texto: "Quien reclama dice qué pide y por qué. Desde el inicio organiza de qué se va a discutir." },
      { emoji: "🛡️", label: "Respuesta", texto: "La otra parte contesta: reconoce, niega u opone defensas. Nadie es juzgado sin ser oído." },
      { emoji: "🔍", label: "Prueba y debate", texto: "Se aportan documentos, testigos y peritajes, y se discute qué demuestran." },
      { emoji: "⚖️", label: "Decisión", texto: "Una autoridad resuelve con fundamentos. La tecnología puede ordenar antecedentes; la decisión es humana." },
    ],
  },
  {
    t: "placa",
    titulo: "Un conflicto, distintos caminos",
    bajada: "Negociar. Mediar. Arbitrar. Juzgar.",
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
  { t: "actividad", activa: "jus_camino", escena: "La herramienta depende del problema" },

  // --- 3 · Del procedimiento al entorno digital ----------------------------
  {
    t: "placa",
    parte: "3 · Qué transforma lo digital",
    titulo: "Del papel a la pantalla",
    bajada: "El expediente cambió de soporte.",
    diagrama: "papel",
    explora: [
      { emoji: "📄", label: "Documentos digitales", texto: "Se acabó el papel, pero no siempre su lógica: muchos PDF se leen igual que antes, página por página." },
      { emoji: "📤", label: "Presentaciones electrónicas", texto: "Se presenta a cualquier hora y sin trasladarse. Cambia el acceso, sobre todo para quien vive lejos del tribunal." },
      { emoji: "🔔", label: "Notificaciones", texto: "Llegan al instante y dejan constancia. El desafío es que la persona las entienda." },
      { emoji: "🎥", label: "Audiencias remotas", texto: "Menos traslados y más participación, con preguntas nuevas: conectividad, privacidad, cómo se toma la palabra." },
    ],
  },
  {
    t: "placa",
    titulo: "¿Y cuánto cambió el trabajo?",
    bajada: "Tener el PDF es apenas el comienzo.",
    interactivo: "pdfs",
  },

  // --- 4 · IA: capacidades y riesgos conocidos ------------------------------
  {
    t: "placa",
    parte: "4 · IA: capacidades y riesgos",
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
  {
    t: "placa",
    titulo: "Hablar con seguridad no alcanza",
    bajada: "Una respuesta convincente puede equivocarse.",
    diagrama: "seguridad",
    explora: [
      { emoji: "📄", label: "Lo que surge de los antecedentes", texto: "Está escrito en un documento y se puede señalar: «el cliente ofreció US$ 1.000»." },
      { emoji: "💭", label: "Lo que infiere el modelo", texto: "Una conclusión razonable, pero no escrita: «necesita dinero con urgencia». Hay que confirmarla." },
      { emoji: "💡", label: "Lo que propone", texto: "Una idea para discutir: «ofrecer un plan de pagos». No es un hecho: es una opción." },
    ],
  },
  {
    t: "placa",
    titulo: "Alucinación: seis precedentes que no existían",
    bajada: "Mata v. Avianca, Nueva York, 2023.",
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
        emoji: "🛡️",
        label: "Cómo prevenirla",
        texto: "Pedir la fuente de cada cita, verificarla en una base oficial y usar herramientas que respondan desde documentos cargados (RAG).",
      },
    ],
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

  // --- 5 · Cómo se instruye un modelo ----------------------------------------
  {
    t: "placa",
    parte: "5 · Cómo se instruye un modelo",
    titulo: "Prompt de sistema y prompt de usuario",
    bajada: "Reglas estables de la herramienta y el pedido de cada consulta.",
    diagrama: "sistema",
    kit: true,
    explora: [
      {
        emoji: "⚙️",
        label: "Prompt de sistema",
        texto: "Las reglas permanentes: rol, límites, formato, qué hacer si falta información. Lo define quien configura la herramienta.",
      },
      { emoji: "💬", label: "Prompt de usuario", texto: "Lo que se pide en cada consulta. Cambia todo el tiempo; las reglas de sistema se mantienen." },
      {
        emoji: "🧭",
        label: "Dónde se configura",
        texto: "En Claude, en las instrucciones de un proyecto; en ChatGPT, en las instrucciones personalizadas o en un GPT; en Gemini, en un Gem.",
      },
    ],
  },
  {
    t: "placa",
    titulo: "Responder bien requiere contexto",
    bajada: "Documentos, instrucciones y una tarea clara.",
    diagrama: "contexto",
    kit: true,
    explora: [
      { emoji: "🗂️", label: "Fuentes", texto: "Qué documentos usar y cuáles no. Sin esto, el modelo completa con lo que «sabe» en general." },
      { emoji: "🎯", label: "Tarea", texto: "Qué se necesita exactamente: una cronología, un resumen, una lista de puntos en discusión." },
      { emoji: "🧾", label: "Formato", texto: "Cómo presentar el resultado: tabla, viñetas, extensión máxima, con la fuente de cada dato." },
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
    explora: [
      {
        emoji: "📁",
        label: "Proyecto",
        texto: "Un espacio para un asunto o una materia: instrucciones propias, documentos y conversaciones juntas. Existe en Claude y en ChatGPT.",
      },
      { emoji: "💎", label: "Gem (Gemini)", texto: "Un asistente con instrucciones fijas para una tarea que se repite." },
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
    explora: [
      { emoji: "⏰", label: "Tarea programada", texto: "Una consulta que se ejecuta sola a una hora fija: «cada lunes, resumir las resoluciones nuevas sobre familia»." },
      { emoji: "🤖", label: "Agente", texto: "Encadena pasos para cumplir un objetivo: buscar, leer, resumir y enviar, sin que alguien intervenga entre paso y paso." },
      { emoji: "✋", label: "El límite", texto: "Cuanto más actúa sola, más importa definir qué puede hacer, revisar lo que hizo y poder detenerla." },
    ],
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
    explora: [
      { emoji: "🔎", label: "Buscador", texto: "Encuentra dónde está un dato o un fallo." },
      { emoji: "🧮", label: "Cálculo", texto: "Calcula intereses, plazos o montos sin errores de cuenta. Un modelo de lenguaje no es una calculadora." },
      { emoji: "📏", label: "Reglas", texto: "Aplica criterios fijos: vencimientos, días inhábiles, requisitos formales." },
      { emoji: "✨", label: "Modelo de lenguaje", texto: "Lee, resume y redacta. Combinado con los otros tres, forma una herramienta confiable." },
    ],
  },

  // --- 6 · Human in the loop -------------------------------------------------
  {
    t: "placa",
    parte: "6 · Human in the loop",
    titulo: "Human in the loop",
    bajada: "Dirigir, contrastar y corregir.",
    diagrama: "hitl",
    explora: [
      { emoji: "🎯", label: "Definir", texto: "¿Qué problema quiero resolver y qué necesito saber? Esto se piensa antes de abrir la herramienta." },
      { emoji: "📨", label: "Encargar", texto: "Pedir tareas acotadas, con fuentes y formato definidos." },
      { emoji: "🔍", label: "Contrastar", texto: "Comparar el resultado con los documentos. ¿Omite algo? ¿Hay otra interpretación posible?" },
      { emoji: "✍️", label: "Decidir", texto: "Aceptar, corregir o descartar, y poder explicar por qué." },
    ],
  },
  {
    t: "placa",
    titulo: "Delegar tareas, conservar el criterio",
    bajada: "La responsabilidad exige participación.",
    diagrama: "delegacion",
    explora: [
      { emoji: "🧑‍⚖️", label: "Asistencia", texto: "La persona define qué importa y decide; la IA organiza y propone." },
      { emoji: "⚠️", label: "Delegación total", texto: "La IA elige qué importa, arma las hipótesis y redacta; la persona solo firma." },
      { emoji: "🚩", label: "Señales de alarma", texto: "Aprobar sin leer las fuentes, no poder explicar una conclusión, quedarse con el primer borrador." },
    ],
  },
  {
    t: "placa",
    titulo: "Una forma concreta de trabajar",
    bajada: "Pedir. Verificar. Corregir. Aprobar.",
    diagrama: "metodo",
    lede: "Vale para cualquier herramienta, propia o ajena.",
    explora: [
      { emoji: "📨", label: "Pedir", texto: "Una tarea concreta, con fuentes definidas y un formato claro." },
      { emoji: "🔍", label: "Verificar", texto: "Cada afirmación relevante, contra su fuente." },
      { emoji: "✏️", label: "Corregir", texto: "Ajustar lo que no coincide y pedir aclaraciones." },
      { emoji: "✅", label: "Aprobar", texto: "Solo la versión que usted puede explicar y defender." },
    ],
  },

  // --- 7 · Que la justicia construya sus herramientas -----------------------
  {
    t: "placa",
    parte: "7 · Soberanía tecnológica",
    titulo: "La tecnología amplifica capacidades",
    bajada: "Lo que hacemos bien… y también lo que hacemos mal.",
    diagrama: "amplifica",
    explora: [
      { emoji: "🚀", label: "Más alcance", texto: "Una oficina puede atender más consultas, más rápido y con respuestas más claras." },
      { emoji: "⚠️", label: "El error también", texto: "Si la herramienta reproduce un sesgo, lo reproduce en miles de casos." },
      { emoji: "🧭", label: "Por eso", texto: "Importa quién la diseña, con qué datos y bajo qué reglas." },
    ],
  },
  {
    t: "placa",
    titulo: "Que la justicia sea dueña de sus herramientas",
    bajada: "Datos propios, reglas propias, control propio.",
    diagrama: "soberania",
    explora: [
      { emoji: "🔐", label: "Datos", texto: "Los datos de las personas y de los expedientes no salen de la institución." },
      { emoji: "📏", label: "Reglas", texto: "La justicia decide qué puede hacer la herramienta y qué no." },
      { emoji: "🧾", label: "Registro", texto: "Cada uso queda registrado y puede auditarse." },
      { emoji: "🔓", label: "Independencia", texto: "No depender de que un proveedor externo cambie precios, términos o funciones." },
    ],
  },
  {
    t: "placa",
    titulo: "Lo que la justicia puede construir",
    bajada: "Herramientas de IA al servicio del justiciable.",
    diagrama: "herramientas",
    lede: "CuscatIA investiga cómo diseñar asistencia para la redacción judicial, con control humano y trazabilidad. Es un proyecto en desarrollo.",
    explora: [
      { emoji: "🔎", label: "Búsqueda de jurisprudencia", texto: "Encontrar precedentes por su contenido, no solo por palabras exactas, con enlace al fallo completo." },
      { emoji: "📝", label: "Asistencia en redacción", texto: "Borradores de providencias y oficios a partir de plantillas propias, con revisión humana." },
      { emoji: "🤖", label: "Agentes por temática", texto: "Asistentes especializados en familia, laboral o consumo, que responden desde normas y criterios de la institución." },
      { emoji: "📊", label: "Jurimetría y estadística", texto: "Tiempos de resolución, carga de trabajo, patrones de litigio: datos para gestionar mejor y rendir cuentas." },
      { emoji: "💬", label: "Lenguaje claro", texto: "Explicarle a cada persona, en palabras simples, qué pasa con su caso." },
    ],
  },
  {
    t: "placa",
    titulo: "Lenguaje claro",
    bajada: "Que la persona entienda su propio caso.",
    diagrama: "lenguajeclaro",
    kit: true,
    explora: [
      { emoji: "💬", label: "Qué es", texto: "Comunicar para que la persona destinataria entienda a la primera, sin perder precisión jurídica." },
      { emoji: "✨", label: "Cómo ayuda la IA", texto: "Propone en segundos una versión clara de una notificación o una resolución." },
      { emoji: "🔍", label: "Qué revisa la persona", texto: "Que la versión clara diga exactamente lo mismo: fechas, plazos y consecuencias." },
    ],
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
