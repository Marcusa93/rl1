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
import type { AudioId } from "./taller-guiado";

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
    bajada: "Compárenlo con el contrato, la conversación y la transferencia.",
    opciones: [
      { id: "monto", emoji: "💵", label: "El monto que reclama" },
      { id: "fecha", emoji: "📅", label: "La fecha de entrega" },
      { id: "firma", emoji: "✍️", label: "Falta la firma de Lucía" },
      { id: "nada", emoji: "👌", label: "Nada: el reclamo es consistente" },
    ],
    correcta: "monto",
    revela:
      "Reclama USD 3.000, pero el contrato (CN-03) fija 2.000 contra entrega y 1.000 contra instalación terminada, y la transferencia (CN-07) prueba que ya cobró 2.000. Además apoya todo en la captura aislada (CN-01).",
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
    key: "tal_research",
    kind: "texto",
    titulo: "El mejor dato de su investigación",
    bajada: "Péguelo con su fuente: ¿cómo ayuda a la mediación?",
    placeholder: "El dato… (fuente: …)",
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
  nombre: { etiqueta: "Nombre (o los nombres, si comparten compu)", placeholder: "Ej.: Compu 12 · Ana y Luis" },
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
  /** Abre esta etapa del itinerario guiado en las computadoras al llegar. */
  etapa?: number;
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
  visual?: "recorridos" | "matriz" | "recorrido-final" | "roles" | "gem" | "caucus" | "vs" | "research" | "mapa";
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
/** Una entrevista privada sonando por los parlantes de la sala. */
export interface TalAudioSlide {
  t: "audio";
  audio: AudioId;
}
/** Tablero de sala: cuántas compus terminaron cada paso de la etapa. */
export interface TalTablero {
  t: "tablero";
  /** Etapa cuyos pasos se muestran. */
  n: number;
}
export interface TalFinal {
  t: "final";
}
export type TalSlide = (TalPortada | TalIngreso | TalPlaca | TalActividad | TalDocumento | TalPrompt | TalAudioSlide | TalTablero | TalFinal) & Comun;

export const TAL_SLIDES: TalSlide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby", etapa: 0 },

  // --- 0 · Ustedes median (10 min) --------------------------------------------------
  {
    t: "placa",
    parte: "0 · Ustedes median",
    titulo: "Hoy ustedes son el equipo de mediación",
    bajada: "Un caso real por resolver, un itinerario guiado en cada computadora y la IA como asistente.",
    etapa: 0,
    libera: ["PLA"],
    kit: true,
    explora: [
      {
        emoji: "🧭",
        label: "El itinerario",
        texto: "En su computadora: 8 etapas con pasos tipo receta. Cada paso trae lo que necesita: el audio, el PDF, el prompt para copiar, el enlace. Avanza a su ritmo; las etapas se abren desde esta pantalla.",
      },
      {
        emoji: "⚽",
        label: "MessIAs, su asistente",
        texto: "El botón con cara de crack, abajo a la derecha. Sabe el caso, las herramientas y el método. Guía paso a paso, pero no resuelve: las decisiones del mediador son suyas.",
      },
      {
        emoji: "💎",
        label: "Su propio Gem",
        texto: "Lo primero que hace cada uno: crear en Gemini su «Asistente de mediación» pegando un prompt de sistema COTIO (P0). Todo el taller pasa dentro de ese Gem: el asistente acumula el caso completo, audio por audio y documento por documento.",
      },
      {
        emoji: "✓",
        label: "Marcar «Listo»",
        texto: "Cada paso termina con un botón «Listo». Acá en pantalla se ve cuántos van terminando: nadie tiene que levantar la mano para avisar.",
      },
    ],
  },
  {
    t: "placa",
    titulo: "Su asistente se llama Gem",
    bajada: "Un chat con instrucciones fijas: el prompt de sistema hecho herramienta. Se arma una vez y trabaja todo el taller.",
    libera: ["P0"],
    visual: "gem",
    kit: true,
    explora: [
      {
        emoji: "🛠️",
        label: "Se crea en cuatro toques",
        texto: "1) gemini.google.com con cuenta de Google · 2) «Explorar Gems» → «Crear Gem» (si no aparece, entren directo a gemini.google.com/gems/create) · 3) pegar P0 en «Instrucciones» · 4) Guardar. El paso a paso, con el botón de copiar, está en su computadora.",
      },
      {
        emoji: "📐",
        label: "P0 es un COTIO",
        texto: "Contexto: asistís al equipo de mediación. Objetivo: preparar la mediación. Tareas: ordenar, extraer, comparar. Input: solo lo que yo suba (CN y EA). Output: con citas y las hipótesis marcadas. La misma estructura que sirve para cualquier prompt, usada como instrucciones permanentes.",
      },
      {
        emoji: "🔁",
        label: "Plan B, mismo efecto",
        texto: "¿En su cuenta no está Gems? Abran un chat nuevo, peguen P0 como PRIMER mensaje y no se muevan de ese chat en todo el taller. La habilidad es la misma: darle a la herramienta un contexto estable.",
      },
      {
        emoji: "🧠",
        label: "Por qué conviene",
        texto: "El asistente acumula el caso: cuando llegue la hora del acuerdo, ya escuchó a las partes, leyó la carpeta entera y tiene los criterios verificados. Nadie repite el contexto en cada pedido.",
      },
    ],
  },
  {
    t: "documento",
    titulo: "Café Nube y TecnoFrío",
    bajada: "Los hechos iniciales (CN-00). Nada más, por ahora.",
    docs: ["D0"],
    libera: ["D0"],
    explora: [
      { emoji: "☕", label: "Lucía", texto: "Administra Café Nube. Debe abrir el viernes. Sostiene que no puede abrir en condiciones normales." },
      { emoji: "🔧", label: "Diego", texto: "Titular de TecnoFrío Servicios. Entregó las cajas; necesita cobrar para comprar el módulo faltante." },
      { emoji: "💵", label: "El contrato", texto: "Máquina de hielo, cámara frigorífica y refrigeración: USD 3.000 en total." },
      { emoji: "⏳", label: "La tensión", texto: "Ella necesita abrir; él necesita cobrar. Y falta una pieza." },
    ],
  },
  { t: "actividad", activa: "tal_ficha", escena: "Sin IA todavía" },

  // --- 1 · Escuchar (15 min) ---------------------------------------------------------
  {
    t: "placa",
    parte: "1 · Escuchar",
    titulo: "Escuchar es el primer oficio del mediador",
    bajada: "Cada parte pidió hablar a solas. Eso, en mediación, tiene nombre y reglas.",
    etapa: 1,
    libera: ["PLD"],
    visual: "caucus",
    explora: [
      { emoji: "🚪", label: "Caucus: la sesión privada", texto: "Una reunión a solas del mediador con una parte. Sirve para que diga lo que no diría frente a la otra. Lo que se escucha ahí es confidencial." },
      { emoji: "👂", label: "Escucha activa", texto: "Escuchar para entender, no para contestar: parafrasear («si entiendo bien, usted necesita…»), preguntar abierto, tolerar el silencio." },
      { emoji: "🎯", label: "Posición e interés", texto: "La posición es lo que se pide («que me pague los mil»). El interés es lo que se necesita (retirar el módulo hoy). Los acuerdos se construyen sobre intereses." },
      { emoji: "📝", label: "La ficha PL-D", texto: "Ya está en su compu: posiciones, intereses, emociones, datos a confirmar y una fila especial: lo CONFIDENCIAL. Se completa a mano, mientras escuchan." },
      { emoji: "🤫", label: "La regla de oro", texto: "Lo confidencial de un caucus solo se usa con autorización de quien lo dijo. Romper esa regla rompe la mediación." },
    ],
  },
  { t: "audio", audio: "EA1" },
  { t: "audio", audio: "EA2" },
  { t: "tablero", n: 1 },

  // --- 2 · La IA escucha (15 min) ------------------------------------------------------
  {
    t: "placa",
    parte: "2 · La IA escucha",
    titulo: "El mismo audio, ahora lo procesa la IA",
    bajada: "Suban la entrevista a su Gem y comparen con su ficha. ¿Quién escuchó mejor?",
    etapa: 2,
    libera: ["P9", "P10"],
    visual: "vs",
    kit: true,
    explora: [
      { emoji: "⚡", label: "Lo que hace bien", texto: "Transcribe en segundos, ordena fechas y montos, arma la ficha completa sin cansarse. Para eso es imbatible." },
      { emoji: "🌫️", label: "Lo que se le escapa", texto: "El tono, las pausas, el miedo de Lucía, el orgullo de Diego. La emoción es información de mediador, y no viaja en el archivo." },
      { emoji: "🔓", label: "La prueba clave", texto: "Cada parte terminó con un secreto. Fíjense qué hizo la herramienta con eso: ¿lo marcó como confidencial o lo mezcló con todo? El prompt P10 se lo pregunta de frente." },
      { emoji: "🛡️", label: "La lección", texto: "La confidencialidad la custodia el mediador, no la herramienta. Antes de subir un audio real: ¿puedo? ¿está anonimizado? ¿dónde queda guardado?" },
    ],
  },
  { t: "tablero", n: 2 },

  // --- 3 · La carpeta (15 min) ----------------------------------------------------------
  {
    t: "placa",
    parte: "3 · La carpeta",
    titulo: "La carpeta del caso, con control",
    bajada: "Ahora los documentos: cada PDF se descarga, se sube y se cita por su código.",
    etapa: 3,
    libera: ["D1", "D2", "D3", "D4", "D11", "D12", "D13", "P1", "P2", "P3"],
    kit: true,
    explora: [
      { emoji: "📷", label: "Una captura aislada", texto: "CN-01 es la prueba de Diego: una imagen. Primero, ¿la herramienta la lee? Si «lee» algo que no está, eso es una alucinación." },
      { emoji: "💬", label: "El contexto la cambia", texto: "CN-02 es el mismo chat, completo. El «sí, recibimos todo» significa otra cosa dos mensajes después. Una captura no es la conversación." },
      { emoji: "📜", label: "El contrato entero", texto: "CN-03 y su anexo CN-04. La cláusula CUARTA tiene una condición que casi nadie lee: «siempre que el local cuente con las conexiones necesarias»." },
      { emoji: "🏷️", label: "Citar para verificar", texto: "Cada respuesta de la IA debe citar el código (CN-03, pág. 1). Lo que no se puede verificar, no se usa." },
    ],
  },
  { t: "actividad", activa: "tal_captura", escena: "Decidan y justifiquen" },
  { t: "actividad", activa: "tal_marcar", escena: "Controlar la respuesta" },

  // --- 4 · La matriz (10 min) -----------------------------------------------------------
  {
    t: "placa",
    parte: "4 · La matriz",
    titulo: "Todo el caso en una tabla",
    bajada: "Hechos, quién lo afirma, qué documento lo respalda y qué falta. La IA arma; ustedes revisan.",
    etapa: 4,
    libera: ["D5", "D6", "D7", "PLB", "P4", "P5"],
    visual: "matriz",
    kit: true,
  },
  { t: "actividad", activa: "tal_correccion", escena: "La intervención humana queda registrada" },
  { t: "tablero", n: 4 },

  // --- 5 · Investigar (10 min + corre solo) ------------------------------------------------
  {
    t: "placa",
    parte: "5 · Investigar",
    titulo: "Deep Research: traer datos que nadie pueda discutir",
    bajada: "Un agente que planifica, busca, lee y cita. Lo lanzan ahora y sigue solo mientras trabajamos.",
    etapa: 5,
    kit: true,
    visual: "research",
    explora: [
      { emoji: "🤖", label: "Qué es", texto: "No es un chat: es un agente. Arma un plan de búsqueda, visita fuentes, las lee, las cruza y entrega un informe con citas. Tarda 5 a 15 minutos." },
      { emoji: "⚖️", label: "Para qué, en mediación", texto: "Criterios objetivos: precios de mercado, lo que exige la ley, lo que costaría un juicio. Datos de afuera que ninguna parte pueda discutir (método Harvard)." },
      { emoji: "🎯", label: "Tres misiones", texto: "A: ¿los montos que se discuten son de mercado? · B: ¿qué necesita el acuerdo para ser exigible en El Salvador? · C: si no acuerdan, ¿qué les espera en un juicio? Cada compu elige una." },
      { emoji: "🔗", label: "La regla de siempre", texto: "Del informe se usan solo los datos cuya fuente abrieron y verificaron. Un enlace que no existe es la misma alucinación de siempre, con mejor prosa." },
      { emoji: "⏱️", label: "Lancen y sigan", texto: "Peguen la misión, toquen «Iniciar investigación» y NO esperen: pasamos a la etapa 6 y volvemos cuando el informe esté listo." },
    ],
  },

  // --- 6 · El acuerdo (15 min) ----------------------------------------------------------
  {
    t: "placa",
    parte: "6 · El acuerdo",
    titulo: "De las posiciones a las cláusulas",
    bajada: "Lo que cada uno pide ya lo sabemos. El acuerdo se escribe sobre lo que cada uno necesita.",
    etapa: 6,
    libera: ["P6", "P7"],
    kit: true,
    explora: [
      { emoji: "🎯", label: "Los intereses del caso", texto: "Lucía: abrir el viernes, saber quién responde, no pelearse con su técnico. Diego: cobrar para retirar el módulo, cuidar su nombre, conservar el mantenimiento." },
      { emoji: "🧭", label: "La MAAN", texto: "La mejor alternativa si no acuerdan: un juicio por mil dólares. La misión C le pone números; suele ser el mejor argumento para acordar." },
      { emoji: "💡", label: "Opciones sin decidir", texto: "El prompt P7 compara alternativas con costos y riesgos. La IA compara; elegir es de las partes, con ayuda del mediador." },
      {
        emoji: "📝",
        label: "El acta se redacta en la app",
        texto: "Un acta de mediación con membrete PGR–UEES: comparecencia, antecedentes, objeto y ocho cláusulas que se completan y se corrigen sobre el documento, más las que quieran agregar. Se descarga en PDF: es su producto del taller. Un acuerdo vago es un conflicto nuevo con fecha posterior.",
      },
    ],
  },
  { t: "actividad", activa: "tal_intereses", escena: "Separar para entender" },
  { t: "tablero", n: 6 },

  // --- 7 · El giro y el cierre (20 min) -----------------------------------------------------
  {
    t: "documento",
    parte: "7 · El giro",
    titulo: "CN-13 · La constancia del electricista",
    bajada: "Llega un documento nuevo. La falla no depende solo del módulo.",
    docs: ["D10"],
    libera: ["D10", "P8"],
    etapa: 7,
    pregunta: "¿El acuerdo que estaban escribiendo resiste esta información?",
    puntos: [
      "La máquina de hielo necesita una línea eléctrica independiente.",
      "Esa línea no está instalada: 4 horas y USD 180.",
      "El contrato no dice quién la paga.",
    ],
  },
  { t: "actividad", activa: "tal_giro", escena: "Revisar lo construido" },
  { t: "actividad", activa: "tal_research", escena: "Puesta en común · el dato" },
  {
    t: "placa",
    titulo: "El método que se llevan",
    bajada: "Sirve para cualquier conflicto y cualquier herramienta.",
    visual: "mapa",
    explora: [
      { emoji: "👂", label: "Escuchar primero", texto: "La ficha del mediador se completa con las personas delante. La IA ordena después." },
      { emoji: "🤖", label: "IA con control", texto: "Subir, pedir con límites, exigir citas y revisar fila por fila. La corrección humana es el trabajo, no un trámite." },
      { emoji: "🔎", label: "Datos verificados", texto: "Los criterios objetivos se investigan y se verifican en la fuente antes de llevarlos a la mesa." },
      { emoji: "🤫", label: "Lo confidencial se custodia", texto: "Lo que una parte dijo en privado no entra a una herramienta externa ni a la sesión conjunta sin su permiso." },
      { emoji: "📝", label: "Acuerdos que se cumplen", texto: "Concretos: quién, qué, cuándo, quién paga y qué pasa si falla. Y que resistan la información que llegue mañana." },
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
    case "audio":
      return s.audio === "EA1" ? "🎙️ Entrevista a Lucía" : "🎙️ Entrevista a Diego";
    case "tablero":
      return `📊 Tablero · etapa ${s.n}`;
    case "final":
      return "Gracias";
  }
}
