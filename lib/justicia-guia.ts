// ============================================================
// Guía de la masterclass "Justicia aumentada" (El Salvador, 14/09/2026):
// lo que se vio en clase, para descargar y compartir. Una sola fuente para
// la página web (/justicia/guia, en justicia.rossi-ia.com/guia) y el PDF
// (public/justicia/guia-justicia-aumentada.pdf, generado con
// node scripts/gen-justicia-guia.mjs). Sin imports: el script de Node lo lee.
// ============================================================

export const GUIA_TITULO = "Justicia aumentada";
export const GUIA_BAJADA = "Guía de la masterclass: conceptos, herramientas y criterios para trabajar con IA en la justicia";
export const GUIA_EVENTO = "Masterclass de apertura · Semana de la Mediación · El Salvador";
export const GUIA_FECHA = "Lunes 14 de septiembre de 2026";
export const GUIA_AUTOR = "Dr. Marco Rossi";
export const GUIA_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT (Argentina)";

export const GUIA_URL = "https://justicia.rossi-ia.com/guia";
export const GUIA_PDF = "/justicia/guia-justicia-aumentada.pdf";

export const GUIA_LOGOS = [
  { src: "/justicia/logo-csj.png", alt: "Corte Suprema de Justicia de El Salvador", fondo: false },
  { src: "/justicia/logo-pgr.png", alt: "Procuraduría General de la República", fondo: false },
  { src: "/justicia/logo-uees.png", alt: "Universidad Evangélica de El Salvador", fondo: true },
];

export const GUIA_GRACIAS =
  "Gracias a la Universidad Evangélica de El Salvador, a la Procuraduría General de la República y a la Corte Suprema de Justicia de El Salvador por la invitación, la organización y la apertura para pensar juntos cómo la tecnología puede servir mejor a las personas.";

export interface Enlace {
  emoji: string;
  label: string;
  detalle: string;
  url: string;
}

/** Mis redes y la plataforma de la clase. */
export const GUIA_REDES: Enlace[] = [
  { emoji: "📸", label: "Instagram", detalle: "@marquitorossi", url: "https://www.instagram.com/marquitorossi" },
  { emoji: "🌐", label: "Plataforma de la clase", detalle: "justicia.rossi-ia.com", url: "https://justicia.rossi-ia.com" },
];

/** Recursero: las herramientas que se mostraron, a un clic. */
export const GUIA_RECURSERO: Enlace[] = [
  { emoji: "🟠", label: "Claude", detalle: "Proyectos, skills y memoria", url: "https://claude.ai" },
  { emoji: "🟢", label: "ChatGPT", detalle: "Prompt de sistema, GPTs y tareas programadas", url: "https://chatgpt.com" },
  { emoji: "🔵", label: "Gemini", detalle: "Gems y búsqueda con fuentes", url: "https://gemini.google.com" },
  { emoji: "📓", label: "Notebook Gemini", detalle: "Respuestas desde sus propios documentos (RAG)", url: "https://notebooklm.google.com" },
  { emoji: "📌", label: "Pinpoint", detalle: "Buscar en grandes volúmenes de documentos", url: "https://journaliststudio.google.com/pinpoint" },
  { emoji: "⏰", label: "Tareas programadas", detalle: "Consultas que se ejecutan solas", url: "https://chatgpt.com/tasks" },
];

export interface Concepto {
  emoji: string;
  termino: string;
  definicion: string;
  /** Ejemplo o clave práctica, en una línea. */
  clave?: string;
}

export interface Seccion {
  titulo: string;
  bajada: string;
  conceptos: Concepto[];
}

export const GUIA_SECCIONES: Seccion[] = [
  {
    titulo: "Las bases",
    bajada: "De qué hablamos cuando hablamos de justicia digital e IA.",
    conceptos: [
      {
        emoji: "⚖️",
        termino: "Justicia digital",
        definicion: "El uso de tecnologías digitales para tramitar, gestionar y resolver conflictos: expedientes electrónicos, audiencias remotas, notificaciones y herramientas de IA, con las mismas garantías del debido proceso.",
        clave: "Tener el PDF es apenas el comienzo: lo que cambia es cómo se busca, se ordena y se decide.",
      },
      {
        emoji: "🧮",
        termino: "Algoritmo",
        definicion: "Una secuencia de pasos definidos para resolver un problema o tomar una decisión. Puede ser una regla simple o un modelo entrenado con datos.",
        clave: "Un algoritmo no es neutral: refleja las reglas y los datos con que se construyó.",
      },
      {
        emoji: "🤖",
        termino: "Inteligencia artificial (IA)",
        definicion: "Sistemas que realizan tareas que asociamos a la inteligencia humana —reconocer, clasificar, predecir, redactar— a partir de grandes cantidades de datos.",
      },
      {
        emoji: "✨",
        termino: "IA generativa",
        definicion: "Modelos que producen texto, imágenes o audio nuevos a partir de una instrucción. Funcionan prediciendo la continuación más probable, no consultando una base de verdades.",
        clave: "Preguntar, resumir, comparar y generar: cuatro verbos para trabajar con lenguaje.",
      },
    ],
  },
  {
    titulo: "Los riesgos conocidos",
    bajada: "Lo que hay que saber antes de confiar en una respuesta.",
    conceptos: [
      {
        emoji: "🌀",
        termino: "Alucinación",
        definicion: "Cuando el modelo produce información falsa con apariencia convincente: fallos, citas o datos que no existen.",
        clave: "Mata v. Avianca (Nueva York, 2023): seis precedentes inventados y abogados sancionados. Cada cita se verifica en su fuente.",
      },
      {
        emoji: "⚠️",
        termino: "Sesgo",
        definicion: "La herramienta repite las desigualdades de los datos con que aprendió. Si el pasado discriminó, el sistema puede discriminar en miles de casos.",
        clave: "COMPAS y la herramienta de selección de Amazon son dos ejemplos conocidos.",
      },
      {
        emoji: "🤝",
        termino: "Sesgo de automatización",
        definicion: "La tendencia a creerle a la máquina aunque se equivoque. El riesgo no está solo en el sistema: también en cuánto lo revisamos.",
      },
    ],
  },
  {
    titulo: "Cómo se instruye un modelo",
    bajada: "Pedir bien es la mitad del trabajo.",
    conceptos: [
      {
        emoji: "💬",
        termino: "Prompt",
        definicion: "La instrucción que se le da al modelo. Un buen prompt tiene cinco piezas: Contexto, Objetivo, Tareas, Input y Output (COTIO).",
        clave: "En lugar de «Resuma este expediente»: quién pide, para qué, qué hacer, con qué documentos y en qué formato.",
      },
      {
        emoji: "⚙️",
        termino: "Prompt de sistema",
        definicion: "Las reglas estables de la herramienta: rol, límites, formato, qué hacer si falta información. Se escribe una vez y vale para todas las consultas.",
        clave: "Vive en las instrucciones de un proyecto (Claude), de un GPT (ChatGPT) o de un Gem (Gemini).",
      },
      {
        emoji: "🗣️",
        termino: "Prompt de usuario",
        definicion: "El pedido concreto de cada consulta. Cambia todo el tiempo; las reglas de sistema se mantienen.",
      },
      {
        emoji: "🗂️",
        termino: "Contexto",
        definicion: "Los documentos y datos que la herramienta usa para responder. Sin contexto, el modelo completa con lo que «sabe» en general.",
      },
      {
        emoji: "🧠",
        termino: "Memoria persistente",
        definicion: "Lo que la herramienta recuerda de una conversación a otra: su cargo, su estilo, sus formatos. Se puede ver, editar, borrar o desactivar.",
        clave: "Lo estable, sí. Los datos de casos y de personas, no.",
      },
      {
        emoji: "📁",
        termino: "Proyecto",
        definicion: "Un espacio para un asunto o una materia: instrucciones propias, documentos y conversaciones juntas.",
      },
      {
        emoji: "🧩",
        termino: "Skill",
        definicion: "Un procedimiento empaquetado (pasos, plantillas, criterios) que la herramienta aplica cuando la tarea lo requiere, en cualquier asunto.",
        clave: "Proyecto para el contexto de un caso; skill para una forma de trabajar que se repite.",
      },
      {
        emoji: "⏰",
        termino: "Tarea programada",
        definicion: "Una consulta que se ejecuta sola a una hora fija: «cada lunes, resumir las resoluciones nuevas sobre familia».",
      },
      {
        emoji: "🛰️",
        termino: "Agente",
        definicion: "Un sistema que encadena pasos para cumplir un objetivo —buscar, leer, resumir, enviar— sin intervención entre paso y paso.",
        clave: "Cuanto más actúa solo, más importa definir qué puede hacer, revisar lo que hizo y poder detenerlo.",
      },
      {
        emoji: "📌",
        termino: "RAG (generación aumentada por recuperación)",
        definicion: "Responder desde fuentes propias: incorporar los documentos, organizarlos, recuperar los fragmentos relevantes y responder citando de dónde sale cada dato.",
        clave: "El modelo no aprende el expediente: lo consulta en el momento. Así trabaja Notebook Gemini.",
      },
    ],
  },
  {
    titulo: "Criterios para trabajar",
    bajada: "La herramienta asiste; la persona decide y responde.",
    conceptos: [
      {
        emoji: "🔁",
        termino: "Human in the loop",
        definicion: "La persona interviene en todo el recorrido: pedir, verificar, corregir y aprobar solo lo que puede explicar y defender.",
        clave: "Señales de alarma: aprobar sin leer las fuentes, no poder explicar una conclusión, quedarse con el primer borrador.",
      },
      {
        emoji: "🔐",
        termino: "Soberanía tecnológica",
        definicion: "Que la justicia sea dueña de sus herramientas: los datos no salen de la institución, las reglas las fija la justicia, cada uso queda registrado y no se depende de un proveedor externo.",
      },
      {
        emoji: "💬",
        termino: "Lenguaje claro",
        definicion: "Comunicar para que la persona entienda su propio caso a la primera, sin perder precisión jurídica. La IA propone la versión clara; la persona revisa que diga lo mismo.",
      },
      {
        emoji: "📊",
        termino: "Jurimetría",
        definicion: "La medición y el análisis estadístico de datos judiciales: tiempos, cargas de trabajo, resultados. Sirve para gestionar y rendir cuentas, no para predecir un caso concreto.",
      },
    ],
  },
];

/** Inconstitucionalidad 57-2025, Sala de lo Constitucional (13/03/2026). */
export const GUIA_SALA = {
  titulo: "Lo que dijo la Sala de lo Constitucional",
  referencia: "Inconstitucionalidad 57-2025 · resolución del 13 de marzo de 2026",
  puntos: [
    "Toda persona tiene derecho a un juez humano y a un procurador humano.",
    "La IA en labores judiciales va bajo estrictos controles éticos y legales, con supervisión humana obligatoria.",
    "En la administración pública, la automatización no debe provocar discriminación algorítmica.",
  ],
  principios: [
    "Transparencia",
    "Responsabilidad",
    "Privacidad",
    "Control humano",
    "Prevención de riesgos",
    "Igualdad",
    "Verificación",
    "Ética",
    "Buenas prácticas",
    "Adaptación constante",
  ],
};

/** El método de trabajo, en cuatro pasos. */
export const GUIA_METODO = [
  { paso: "Pedir", texto: "Una tarea concreta, con fuentes definidas y un formato claro." },
  { paso: "Verificar", texto: "Cada afirmación relevante, contra su fuente." },
  { paso: "Corregir", texto: "Ajustar lo que no coincide y pedir aclaraciones." },
  { paso: "Aprobar", texto: "Solo la versión que usted puede explicar y defender." },
];

export const GUIA_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(
  `Guía de la masterclass «${GUIA_TITULO}» (${GUIA_AUTOR}, Semana de la Mediación, El Salvador): ${GUIA_URL}`,
)}`;
