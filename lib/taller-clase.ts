// ============================================================
// Taller práctico "IA aplicada a la resolución de conflictos" — Semana de
// la Mediación, El Salvador (miércoles 16 y jueves 17/09/2026, mismo taller
// para dos grupos: reiniciar la sesión con Shift+R entre uno y otro).
// Público: estudiantes y personal de la PGR. 110 minutos (9:10 a 11:00).
//
// Un laboratorio: los grupos trabajan un caso sintético (lib/taller-caso.ts)
// con herramientas de IA externas. El deck libera documentos y prompts a la
// app de cada grupo (tutor de trabajo) y muestra siempre los dos recorridos:
// CASO y TRABAJO. Cada grupo recorre una rama; al cierre se muestra otra.
//
// /taller-ia          → app del grupo (celular o computadora)
// /taller-ia/clase    → presentación del docente
// /taller-ia/control  → control remoto desde el celular del docente
// En taller.rossi-ia.com: "/", "/clase" y "/control" (ver proxy.ts).
// ============================================================

import type { ActividadVivo, ActOpcion, ClaseVivoConfig, Explorable } from "./clase-vivo";
import type { ActivityKey } from "./types";
import type { DocId, LiberadoId, PromptId } from "./taller-caso";

export const TAL_SLUG = "taller-ia";
export const TAL_TITLE = "IA aplicada a la resolución de conflictos";
export const TAL_SUBTITLE = "Un caso, decisiones y herramientas de IA bajo control humano";
export const TAL_EVENTO = "Taller práctico · Semana de la Mediación · El Salvador";
export const TAL_FECHA = "Miércoles 16 y jueves 17 de septiembre de 2026";
export const TAL_LINK = "taller.rossi-ia.com";
export const TAL_QR_PLATAFORMA = "/taller-ia/qr-plataforma.png";
export const TAL_AUTOR = "Dr. Marco Rossi";
export const TAL_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT (Argentina)";

export const TAL_LOGOS = [
  { src: "/justicia/logo-pgr.png", alt: "Procuraduría General de la República de El Salvador", fondo: false },
  { src: "/justicia/logo-uees.png", alt: "Universidad Evangélica de El Salvador", fondo: true },
];

// --- Actividades en vivo (cada grupo responde desde un dispositivo) --------------

const FICHA: ActOpcion[] = [
  { id: "hecho", emoji: "📌", label: "Hecho conocido" },
  { id: "afirma", emoji: "🗣️", label: "Lo afirma una parte" },
  { id: "nose", emoji: "❓", label: "No lo sabemos" },
];
const MARCA: ActOpcion[] = [
  { id: "respaldada", emoji: "✅", label: "Respaldada" },
  { id: "inferida", emoji: "💭", label: "Inferida" },
  { id: "nodemo", emoji: "❌", label: "No demostrada" },
];
const MEDIACION: ActOpcion[] = [
  { id: "posicion", emoji: "🎯", label: "Posición" },
  { id: "interes", emoji: "💛", label: "Interés o necesidad" },
  { id: "limite", emoji: "🚧", label: "Límite o condición" },
  { id: "propuesta", emoji: "💡", label: "Propuesta" },
];

export const TAL_ACTIVIDADES: ActividadVivo[] = [
  {
    key: "tal_ficha",
    kind: "encuesta",
    titulo: "Ficha inicial: ¿qué es cada cosa?",
    bajada: "Sin IA todavía. Clasifiquen cada frase del caso.",
    preguntas: [
      { id: "precio", q: "El precio total del contrato es de USD 3.000.", opciones: FICHA },
      { id: "cajas", q: "Diego entregó las cajas con los equipos.", opciones: FICHA },
      { id: "entrega", q: "La entrega principal ya fue realizada.", opciones: FICHA },
      { id: "abrir", q: "Lucía no puede abrir en condiciones normales.", opciones: FICHA },
      { id: "modulo", q: "Quién debía conseguir el módulo de conexión.", opciones: FICHA },
      { id: "conexion", q: "Si el local tiene las conexiones necesarias.", opciones: FICHA },
    ],
  },
  {
    key: "tal_camino1",
    kind: "opciones",
    titulo: "¿Qué quieren investigar primero?",
    bajada: "No hay una respuesta correcta: solo define el primer recorrido.",
    opciones: [
      { id: "mensajes", emoji: "💬", label: "Los mensajes" },
      { id: "contrato", emoji: "📄", label: "El contrato" },
    ],
  },
  {
    key: "tal_captura",
    kind: "opciones",
    titulo: "¿Qué podemos afirmar con seguridad a partir de esta captura?",
    bajada: "Elijan en grupo y prepárense para justificarlo.",
    opciones: [
      { id: "terminado", emoji: "🏁", label: "Lucía reconoció que todo estaba terminado" },
      { id: "recibio", emoji: "📦", label: "Lucía confirmó que recibió los elementos entregados" },
      { id: "noalcanza", emoji: "🤷", label: "La captura no alcanza para saber qué quiso decir" },
    ],
  },
  {
    key: "tal_marcar",
    kind: "encuesta",
    titulo: "Revisen la respuesta de la IA",
    bajada: "Marquen cada afirmación: ¿está respaldada, es una inferencia o no está demostrada?",
    preguntas: [
      { id: "a", q: "«Lucía afirma que recibió todo lo entregado.»", opciones: MARCA },
      { id: "b", q: "«Diego pidió coordinar el pago pendiente.»", opciones: MARCA },
      { id: "c", q: "«Diego entiende que la prestación está cumplida.»", opciones: MARCA },
      { id: "d", q: "«Lucía aceptó que la instalación estaba terminada.»", opciones: MARCA },
    ],
  },
  {
    key: "tal_obligaciones",
    kind: "chips",
    titulo: "¿Qué obligaciones parecen relevantes?",
    bajada: "Marquen todas las que surgen del contrato.",
    opciones: [
      { id: "entrega", emoji: "📦", label: "Entrega" },
      { id: "instalacion", emoji: "🔧", label: "Instalación" },
      { id: "funcionamiento", emoji: "⚙️", label: "Funcionamiento" },
      { id: "conexiones", emoji: "🔌", label: "Preparación de conexiones" },
      { id: "pago", emoji: "💵", label: "Pago contra finalización" },
      { id: "garantia", emoji: "🛡️", label: "Garantía por un año" },
      { id: "capacitacion", emoji: "🎓", label: "Capacitación del personal" },
    ],
  },
  {
    key: "tal_camino2",
    kind: "opciones",
    titulo: "¿Cómo sigue su grupo?",
    bajada: "Elijan el camino que van a trabajar.",
    opciones: [
      { id: "tercero", emoji: "⚖️", label: "Que decida un tercero (reclamo)" },
      { id: "mediacion", emoji: "🤝", label: "Intentar una solución negociada" },
    ],
  },
  {
    key: "tal_correccion",
    kind: "texto",
    titulo: "Registren una corrección",
    bajada: "Qué dijo la IA y qué cambiaron ustedes (aceptar, corregir o descartar).",
    placeholder: "La IA dijo… y lo corregimos porque…",
    maxChars: 240,
  },
  {
    key: "tal_inconsistencia",
    kind: "opciones",
    titulo: "¿Qué no cierra en el reclamo de Diego?",
    bajada: "Compárenlo con el contrato y con la conversación.",
    opciones: [
      { id: "monto", emoji: "💵", label: "El monto que reclama" },
      { id: "fecha", emoji: "📅", label: "La fecha de entrega" },
      { id: "firma", emoji: "✍️", label: "Falta la firma de Lucía" },
      { id: "nada", emoji: "👌", label: "Nada: el reclamo es consistente" },
    ],
    correcta: "monto",
    revela:
      "Reclama USD 3.000, pero el contrato fija USD 2.000 contra entrega y USD 1.000 contra instalación terminada. Y apoya todo en la captura aislada, no en la conversación completa.",
  },
  {
    key: "tal_intereses",
    kind: "encuesta",
    titulo: "Posiciones, intereses y límites",
    bajada: "Clasifiquen cada frase de las notas de Lucía y de Diego.",
    preguntas: [
      { id: "viernes", q: "«Necesito el local operativo el viernes a las 18:00.»", opciones: MEDIACION },
      { id: "conflicto", q: "«No quiero iniciar un conflicto con Diego.»", opciones: MEDIACION },
      { id: "mil", q: "«Necesito recibir USD 1.000 para retirar el módulo.»", opciones: MEDIACION },
      { id: "temporal", q: "«Puedo dejar un equipo de hielo temporal una semana.»", opciones: MEDIACION },
      { id: "responde", q: "«Que quede claro quién responde si vuelve a fallar.»", opciones: MEDIACION },
    ],
  },
  {
    key: "tal_alternativa",
    kind: "opciones",
    titulo: "¿Qué alternativa exploramos?",
    bajada: "La IA las va a comparar; la elección es de ustedes.",
    opciones: [
      { id: "definitiva", emoji: "🔧", label: "Instalación definitiva" },
      { id: "temporal", emoji: "🧊", label: "Equipo temporal" },
      { id: "escalonado", emoji: "💵", label: "Pago escalonado" },
      { id: "responsabilidades", emoji: "📋", label: "Distribución de responsabilidades" },
    ],
  },
  {
    key: "tal_giro",
    kind: "opciones",
    titulo: "¿La nueva información cambia su solución?",
    bajada: "La falla puede no depender solo del módulo.",
    opciones: [
      { id: "rehacer", emoji: "🔄", label: "Sí: hay que rehacerla" },
      { id: "parte", emoji: "✏️", label: "Cambia en parte" },
      { id: "nada", emoji: "✅", label: "No cambia" },
    ],
  },
  {
    key: "tal_prompt_util",
    kind: "texto",
    titulo: "El prompt más útil de su grupo",
    bajada: "Péguenlo o resúmanlo. Lo vemos en la puesta en común.",
    placeholder: "Nuestro mejor prompt fue…",
    maxChars: 280,
  },
  {
    key: "tal_nube",
    kind: "palabra",
    titulo: "Una palabra para llevarse",
    bajada: "¿Con qué palabra se va de este taller?",
  },
];

export function getTalActividad(key: string): ActividadVivo | undefined {
  return TAL_ACTIVIDADES.find((a) => a.key === key);
}

export const TAL_CONFIG: ClaseVivoConfig = {
  slug: TAL_SLUG,
  titulo: TAL_TITLE,
  materia: TAL_EVENTO,
  autor: TAL_AUTOR,
  cargo: TAL_CARGO,
  poll: { alumno: 4000, alumnoMe: 20000, deck: 2500 },
  getActividad: getTalActividad,
  reacciones: true,
  nombre: { etiqueta: "Nombre del grupo", placeholder: "Ej.: Grupo 3 · Ana, Luis, Carla y Pedro" },
};

// --- Kit de herramientas externas ---------------------------------------------------

export interface HerramientaKit {
  id: string;
  label: string;
  emoji: string;
  url: string;
}

export const TAL_KIT: HerramientaKit[] = [
  { id: "chatgpt", label: "ChatGPT", emoji: "🟢", url: "https://chatgpt.com" },
  { id: "claude", label: "Claude", emoji: "🟠", url: "https://claude.ai" },
  { id: "gemini", label: "Gemini", emoji: "🔵", url: "https://gemini.google.com" },
  { id: "notebooklm", label: "Notebook Gemini", emoji: "📓", url: "https://notebooklm.google.com" },
];

// --- Placas ------------------------------------------------------------------------

/** Botón para saltar a otra placa (bifurcaciones del caso). */
export interface Salto {
  label: string;
  a: string;
}

interface Comun {
  parte?: string;
  /** Identificador para saltar a esta placa. */
  id?: string;
  /** Abre el kit de herramientas al llegar a esta placa. */
  kit?: boolean;
  /** Etapa del recorrido CASO (0–4) y del recorrido TRABAJO (0–5). */
  caso?: number;
  trabajo?: number;
  /** Documentos y prompts que se liberan a los grupos al llegar. */
  libera?: LiberadoId[];
  saltos?: Salto[];
}

export interface TalPortada {
  t: "portada";
  activa: ActivityKey;
}
export interface TalIngreso {
  t: "ingreso";
  activa: ActivityKey;
}
export interface TalPlaca {
  t: "placa";
  titulo: string;
  bajada: string;
  lede?: string;
  explora?: Explorable[];
  /** Pieza visual propia en lugar de un diagrama. */
  visual?: "recorridos" | "matriz" | "recorrido-final" | "roles";
}
export interface TalActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
}
/** Uno o dos documentos del caso en pantalla grande. */
export interface TalDocumento {
  t: "documento";
  titulo: string;
  bajada: string;
  docs: DocId[];
  pregunta?: string;
  /** Lista de "estado del caso" o puntos a destacar junto al documento. */
  puntos?: string[];
  explora?: Explorable[];
}
/** Prompt guiado del tutor: lo copian y lo usan en su herramienta. */
export interface TalPrompt {
  t: "prompt";
  titulo: string;
  bajada: string;
  prompt: PromptId;
  /** Qué documentos pegar junto con el prompt. */
  con: DocId[];
  /** Qué hace el grupo con la respuesta. */
  despues: string;
}
export interface TalFinal {
  t: "final";
}
export type TalSlide = (TalPortada | TalIngreso | TalPlaca | TalActividad | TalDocumento | TalPrompt | TalFinal) & Comun;

/** "Cómo formular un buen prompt": se ve en los dos caminos iniciales. */
const PLACA_PROMPT: TalSlide = {
  t: "placa",
  parte: "5 · Cómo formular un buen prompt",
  titulo: "Una instrucción útil tiene límites",
  bajada: "Qué documento, qué tarea, qué límites, qué no concluir y cómo mostrar la fuente.",
  trabajo: 3,
  libera: ["P2"],
  kit: true,
  explora: [
    { emoji: "📄", label: "Qué documento", texto: "Diga sobre qué trabaja: «esta conversación», «el contrato y su anexo». Sin fuente, la IA completa con lo que supone." },
    { emoji: "🎯", label: "Qué tarea", texto: "Un verbo concreto: identificar, separar, extraer, comparar. «Analizá» solo es demasiado amplio." },
    { emoji: "🚧", label: "Qué límites", texto: "Hasta dónde llega: «usá solo estos documentos», «si falta un dato, indicalo»." },
    { emoji: "🚫", label: "Qué no debe concluir", texto: "«No determines quién tiene razón», «no concluyas que hubo aceptación». Evita que decida por usted." },
    { emoji: "📌", label: "Cómo mostrar la fuente", texto: "«Citá el fragmento en que apoyás cada respuesta». Así se puede verificar." },
    {
      emoji: "⚖️",
      label: "Vaga o controlada",
      texto: "Vaga: «Analizá este caso». Controlada: «Identificá qué afirma cada parte en esta conversación, separá hechos e inferencias y citá el fragmento en que apoyás cada respuesta».",
    },
  ],
};

export const TAL_SLIDES: TalSlide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby" },

  // --- 1 · Presentación (10 min) --------------------------------------------------
  {
    t: "placa",
    parte: "1 · Presentación",
    titulo: "Un laboratorio, no una clase",
    bajada: "No vamos a preguntarle a la IA quién tiene razón.",
    lede: "Cada decisión abrirá información diferente. La IA los va a asistir, pero ustedes deberán definir qué necesitan saber y controlar cada resultado.",
    kit: true,
    explora: [
      { emoji: "🎬", label: "El simulador del caso", texto: "Administra los hechos, los documentos, las decisiones y los caminos posibles. La información llega de a poco, según lo que elijan." },
      { emoji: "🧭", label: "El tutor de trabajo", texto: "En su dispositivo: los documentos liberados, los prompts guiados para copiar y lo que hay que verificar en cada paso." },
      { emoji: "🧰", label: "Las herramientas", texto: "ChatGPT, Claude, Gemini o Notebook Gemini: la que tengan a mano. Copian el documento y el prompt, y revisan la respuesta." },
      { emoji: "🎁", label: "Lo que se llevan", texto: "Un producto jurídico concreto y un método: ordenar, investigar, contrastar, producir y revisar con IA." },
    ],
  },
  {
    t: "placa",
    titulo: "Dos recorridos al mismo tiempo",
    bajada: "El caso avanza y el grupo aprende a trabajar con IA.",
    visual: "recorridos",
    lede: "La IA puede asistir distintas tareas jurídicas; el profesional define el problema, selecciona las fuentes, controla la respuesta y decide qué hacer con ella.",
  },
  {
    t: "placa",
    titulo: "El juicio y la mediación son tecnologías",
    bajada: "Formas de organizar un conflicto. La IA entra como una herramienta dentro de ellas.",
    explora: [
      { emoji: "⚖️", label: "Juicio", texto: "Un tercero decide con reglas: pretensiones, prueba y una resolución fundada. La IA puede ordenar el expediente; la decisión es humana." },
      { emoji: "🤝", label: "Mediación", texto: "Las partes deciden con alguien que facilita. La IA puede ayudar a preparar preguntas y opciones; los intereses se confirman con las personas." },
      { emoji: "🗣️", label: "Negociación", texto: "Sin tercero. Sirve cuando el vínculo importa, como entre Lucía y Diego, que probablemente vuelvan a trabajar juntos." },
      { emoji: "🧩", label: "Dónde entra la IA", texto: "En tareas: ordenar, investigar, comparar, redactar un borrador. Nunca en lugar de la persona que decide." },
    ],
  },

  // --- 2 · El caso y los grupos (10 min) ------------------------------------------------
  {
    t: "placa",
    parte: "2 · El caso y los grupos",
    titulo: "Armen grupos de cuatro o cinco",
    bajada: "Un dispositivo por grupo: ingresen con el nombre del grupo.",
    visual: "roles",
    explora: [
      { emoji: "🧭", label: "Coordinación", texto: "Ordena los tiempos, lleva la decisión del grupo y registra las respuestas en la app." },
      { emoji: "🤖", label: "Trabajo con la IA", texto: "Copia los documentos y los prompts en la herramienta y trae la respuesta al grupo." },
      { emoji: "🔍", label: "Control de fuentes", texto: "Verifica cada afirmación contra el documento: ¿está respaldada, es una inferencia o no está demostrada?" },
      { emoji: "🎤", label: "Presentación final", texto: "Prepara la puesta en común: camino, prompt más útil, una corrección y lo que quedó pendiente." },
    ],
  },
  {
    t: "documento",
    titulo: "Café Nube y TecnoFrío",
    bajada: "Los hechos iniciales. Nada más, por ahora.",
    docs: ["D0"],
    libera: ["D0"],
    caso: 0,
    trabajo: 0,
    explora: [
      { emoji: "☕", label: "Lucía", texto: "Administra Café Nube. Debe abrir el viernes. Sostiene que no puede abrir en condiciones normales." },
      { emoji: "🔧", label: "Diego", texto: "Titular de TecnoFrío Servicios. Entregó las cajas; necesita cobrar para comprar el módulo faltante." },
      { emoji: "💵", label: "El contrato", texto: "Máquina de hielo, cámara frigorífica y refrigeración: USD 3.000 en total." },
      { emoji: "⏳", label: "La tensión", texto: "Ella necesita abrir; él necesita cobrar. Y falta una pieza." },
    ],
  },
  { t: "actividad", activa: "tal_ficha", escena: "Sin IA todavía", caso: 0, trabajo: 1 },

  // --- 3 · Cómo se organiza un caso (8 min) ---------------------------------------------
  {
    t: "placa",
    parte: "3 · Cómo se organiza un caso",
    titulo: "Antes de preguntarle a una herramienta",
    bajada: "Distinguir qué sabemos, quién lo dice y qué falta.",
    lede: "Una afirmación repetida en un documento no se convierte automáticamente en un hecho probado.",
    trabajo: 1,
    explora: [
      { emoji: "📌", label: "Hechos documentados", texto: "Lo que surge de un documento y se puede señalar: «Diego entregó las cajas»." },
      { emoji: "🗣️", label: "Afirmaciones de las partes", texto: "Lo que cada una sostiene: «la entrega principal ya fue realizada» (Diego)." },
      { emoji: "💭", label: "Inferencias", texto: "Conclusiones razonables pero no escritas: «Lucía aceptó el trabajo». Hay que confirmarlas." },
      { emoji: "❓", label: "Cuestiones pendientes", texto: "Lo que todavía no sabemos: quién debía conseguir el módulo, si el local tiene las conexiones." },
      { emoji: "🗂️", label: "Documentos para verificar", texto: "Qué habría que buscar: la conversación completa, el contrato, un informe técnico." },
      { emoji: "🔁", label: "Sirve para todo", texto: "Esta distinción sirve para una demanda, una audiencia de mediación, un informe técnico o una resolución." },
    ],
  },

  // --- 4 · Primera decisión (7 min) ------------------------------------------------------
  {
    t: "actividad",
    activa: "tal_camino1",
    escena: "Primera decisión",
    caso: 2,
    trabajo: 2,
    saltos: [
      { label: "💬 Seguir por los mensajes", a: "mensajes" },
      { label: "📄 Seguir por el contrato", a: "contrato" },
    ],
  },

  // Camino de los mensajes
  {
    t: "documento",
    id: "mensajes",
    parte: "4 · Camino de los mensajes",
    titulo: "Documento 1: una captura aislada",
    bajada: "Es lo que Diego muestra para reclamar.",
    docs: ["D1"],
    libera: ["D1"],
    pregunta: "¿Qué podemos afirmar con seguridad a partir de esta captura?",
    caso: 1,
    trabajo: 2,
  },
  { t: "actividad", activa: "tal_captura", escena: "Decidan y justifiquen", caso: 1, trabajo: 2 },
  {
    t: "prompt",
    titulo: "Pedirle a la IA, con límites",
    bajada: "Copien la instrucción desde su dispositivo y úsenla en su herramienta.",
    prompt: "P1",
    con: ["D1"],
    despues: "Revisen la respuesta: ¿qué está respaldado por la captura y qué no?",
    libera: ["P1"],
    kit: true,
    caso: 1,
    trabajo: 2,
  },
  { t: "actividad", activa: "tal_marcar", escena: "Controlar la respuesta", caso: 1, trabajo: 3 },
  PLACA_PROMPT,
  {
    t: "documento",
    titulo: "Documento 2: la conversación completa",
    bajada: "Lo que la captura no mostraba.",
    docs: ["D2"],
    libera: ["D2"],
    caso: 3,
    trabajo: 3,
    puntos: [
      "Se recibieron las cajas.",
      "Falta un módulo.",
      "La instalación no está terminada.",
      "Lucía no afirmó expresamente que todo funcionara.",
      "Diego interpreta la entrega de manera más amplia.",
    ],
    saltos: [{ label: "Siguiente: segunda decisión →", a: "decision2" }],
  },

  // Camino del contrato
  {
    t: "documento",
    id: "contrato",
    parte: "4 · Camino del contrato",
    titulo: "Documento 3: el contrato",
    bajada: "Lo que las partes firmaron.",
    docs: ["D3"],
    libera: ["D3"],
    pregunta: "¿Qué obligaciones parecen relevantes?",
    caso: 1,
    trabajo: 2,
  },
  { t: "actividad", activa: "tal_obligaciones", escena: "Leer el contrato completo", caso: 1, trabajo: 2 },
  {
    t: "prompt",
    titulo: "Extraer las obligaciones",
    bajada: "Copien la instrucción desde su dispositivo y úsenla en su herramienta.",
    prompt: "P3",
    con: ["D3"],
    despues: "Contrasten cada obligación con el texto del contrato: ¿la IA agregó algo que no dice?",
    libera: ["P3"],
    kit: true,
    caso: 1,
    trabajo: 2,
  },
  PLACA_PROMPT,
  {
    t: "documento",
    titulo: "Documento 4: el anexo técnico",
    bajada: "Un contrato no se lee como una frase aislada.",
    docs: ["D3", "D4"],
    libera: ["D4"],
    caso: 3,
    trabajo: 3,
    puntos: [
      "La instalación termina cuando el equipo fue probado y está operativo.",
      "Se necesita una conexión eléctrica independiente.",
      "La IA puede relacionar cláusulas; el profesional revisa el texto y busca documentos complementarios.",
    ],
    saltos: [{ label: "Siguiente: segunda decisión →", a: "decision2" }],
  },

  // --- Segunda decisión y organización (15 min) --------------------------------------------
  { t: "actividad", id: "decision2", activa: "tal_camino2", escena: "Segunda decisión", caso: 2, trabajo: 1 },
  {
    t: "placa",
    parte: "6 · Organizar la información",
    titulo: "La matriz de trabajo",
    bajada: "Cualquiera sea el camino, primero se ordena.",
    visual: "matriz",
    caso: 1,
    trabajo: 1,
  },
  {
    t: "prompt",
    titulo: "La IA arma una primera versión",
    bajada: "Péguenle todos los documentos que tienen y esta instrucción.",
    prompt: "P4",
    con: [],
    despues: "Acepten, corrijan o descarten cada afirmación. Lo que cambien, regístrenlo.",
    libera: ["P4"],
    kit: true,
    caso: 1,
    trabajo: 1,
  },
  { t: "actividad", activa: "tal_correccion", escena: "La intervención humana queda registrada", caso: 1, trabajo: 3 },
  {
    t: "placa",
    parte: "7 · Asistente, no sustituto",
    titulo: "La IA asiste; no decide",
    bajada: "Puede ordenar, comparar y proponer. No puede convertir una afirmación en un hecho probado.",
    trabajo: 3,
    explora: [
      { emoji: "🗂️", label: "Ordenar documentos", texto: "Cronologías, índices, quién dijo qué y cuándo." },
      { emoji: "🔀", label: "Comparar versiones", texto: "La captura contra la conversación completa; el reclamo contra el contrato." },
      { emoji: "⚡", label: "Identificar contradicciones", texto: "«Recibimos todo» contra «recibimos todas las cajas»." },
      { emoji: "❓", label: "Proponer preguntas", texto: "Para una audiencia, para un perito, para la otra parte." },
      { emoji: "🧱", label: "Estructurar un texto", texto: "El esqueleto de un escrito o de una agenda de mediación." },
      { emoji: "💡", label: "Explorar alternativas", texto: "Opciones de acuerdo con sus costos y riesgos." },
      { emoji: "🚫", label: "Lo que no puede", texto: "Transformar por sí sola una afirmación en un hecho probado, ni decidir qué interpretación adopta el profesional." },
    ],
  },
  {
    t: "actividad",
    activa: "tal_camino2",
    escena: "Cada grupo sigue su camino",
    caso: 2,
    saltos: [
      { label: "⚖️ Que decida un tercero", a: "tercero" },
      { label: "🤝 Explorar una mediación", a: "mediacion" },
    ],
  },

  // --- 8a · Rama adjudicativa ------------------------------------------------------------------
  {
    t: "documento",
    id: "tercero",
    parte: "8 · Que decida un tercero",
    titulo: "Documentos 5 y 6: el reclamo y la respuesta",
    bajada: "Dos versiones del mismo hecho.",
    docs: ["D5", "D6"],
    libera: ["D5", "D6"],
    caso: 1,
    trabajo: 2,
  },
  { t: "actividad", activa: "tal_inconsistencia", escena: "¿Qué no cierra?", caso: 1, trabajo: 3 },
  {
    t: "prompt",
    titulo: "Revisar como la contraparte",
    bajada: "Poner a prueba la propia interpretación.",
    prompt: "P5",
    con: ["D5", "D6"],
    despues: "Usen el resultado para completar la matriz: ¿qué prueba falta?",
    libera: ["P5"],
    kit: true,
    caso: 1,
    trabajo: 3,
  },
  {
    t: "documento",
    titulo: "Documento 7: el informe técnico",
    bajada: "Lo que el técnico puede y no puede afirmar.",
    docs: ["D7"],
    libera: ["D7"],
    caso: 3,
    trabajo: 4,
    puntos: ["Producto de esta rama: una matriz de hechos y prueba, una teoría del caso o un esquema de cuestiones a resolver."],
    saltos: [{ label: "Siguiente: nueva información →", a: "giro" }],
  },

  // --- 8b · Rama de mediación ------------------------------------------------------------------
  {
    t: "documento",
    id: "mediacion",
    parte: "8 · Explorar una mediación",
    titulo: "Documentos 8 y 9: lo que cada parte necesita",
    bajada: "Detrás de cada posición hay un interés.",
    docs: ["D8", "D9"],
    libera: ["D8", "D9"],
    caso: 1,
    trabajo: 2,
  },
  { t: "actividad", activa: "tal_intereses", escena: "Separar para entender", caso: 1, trabajo: 1 },
  {
    t: "prompt",
    titulo: "Preparar la mediación",
    bajada: "De las posiciones a las necesidades.",
    prompt: "P6",
    con: ["D8", "D9"],
    despues: "Elijan las dos mejores preguntas abiertas y descarten las que suponen algo no confirmado.",
    libera: ["P6"],
    kit: true,
    caso: 1,
    trabajo: 4,
  },
  { t: "actividad", activa: "tal_alternativa", escena: "¿Qué alternativa exploramos?", caso: 2, trabajo: 4 },
  {
    t: "prompt",
    titulo: "Comparar alternativas",
    bajada: "Explorar opciones sin elegir por las partes.",
    prompt: "P7",
    con: ["D8", "D9"],
    despues: "Producto de esta rama: una agenda de mediación, un mapa de intereses y una propuesta de acuerdo sujeta a revisión.",
    libera: ["P7"],
    kit: true,
    caso: 2,
    trabajo: 4,
    saltos: [{ label: "Siguiente: nueva información →", a: "giro" }],
  },

  // --- 9 · Nueva información ---------------------------------------------------------------------
  {
    t: "documento",
    id: "giro",
    parte: "9 · Nueva información",
    titulo: "Documento 10: las condiciones del local",
    bajada: "La falla no depende solo del módulo.",
    docs: ["D10"],
    libera: ["D10"],
    caso: 3,
    trabajo: 5,
    pregunta: "¿La nueva información cambia la solución que estaban construyendo?",
  },
  { t: "actividad", activa: "tal_giro", escena: "Revisar lo construido", caso: 3, trabajo: 5 },
  {
    t: "prompt",
    titulo: "Actualizar sin borrar",
    bajada: "La IA ayuda a ver qué conclusiones cambian.",
    prompt: "P8",
    con: ["D10"],
    despues: "Revisen su matriz, su estrategia o su propuesta: qué se mantiene y qué cambia.",
    libera: ["P8"],
    kit: true,
    caso: 3,
    trabajo: 5,
  },

  // --- 10 · Producto final y cierre (15 min) -----------------------------------------------------
  {
    t: "placa",
    parte: "10 · Producto final",
    titulo: "Cada grupo presenta",
    bajada: "Dos minutos por grupo.",
    caso: 4,
    trabajo: 4,
    explora: [
      { emoji: "🧭", label: "El camino elegido", texto: "¿Mensajes o contrato? ¿Tercero o mediación? ¿Por qué?" },
      { emoji: "🗂️", label: "Los documentos consultados", texto: "Cuáles usaron y cuál fue decisivo." },
      { emoji: "✍️", label: "El prompt más útil", texto: "El que mejor funcionó, y por qué." },
      { emoji: "🤖", label: "Un resultado de IA", texto: "Algo que la herramienta hizo bien." },
      { emoji: "✏️", label: "Una corrección", texto: "Algo que el grupo tuvo que corregir o descartar." },
      { emoji: "❓", label: "Lo pendiente", texto: "La cuestión que todavía quedó abierta." },
    ],
  },
  { t: "actividad", activa: "tal_prompt_util", escena: "Puesta en común", caso: 4, trabajo: 5 },
  {
    t: "placa",
    titulo: "El recorrido completo",
    bajada: "La herramienta cambió porque cambió la tarea jurídica.",
    visual: "recorrido-final",
    lede: "«La IA no se utilizó del mismo modo en todas las etapas. Primero ayudó a ordenar, después a investigar, luego a poner a prueba una interpretación y finalmente a construir un producto.»",
    caso: 4,
    trabajo: 5,
    saltos: [
      { label: "↺ Camino alternativo: los mensajes", a: "mensajes" },
      { label: "↺ Camino alternativo: el contrato", a: "contrato" },
      { label: "↺ Rama: que decida un tercero", a: "tercero" },
      { label: "↺ Rama: mediación", a: "mediacion" },
    ],
  },
  { t: "actividad", activa: "tal_nube", escena: "Para cerrar" },
  { t: "final" },
];

/** Nombre corto de una placa (índice del control remoto). */
export function tituloPlacaTaller(s: TalSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso con QR";
    case "placa":
    case "documento":
      return s.titulo;
    case "prompt":
      return `✍️ ${s.titulo}`;
    case "actividad":
      return `🗳️ ${getTalActividad(s.activa)?.titulo ?? "Actividad"}`;
    case "final":
      return "Gracias";
  }
}
