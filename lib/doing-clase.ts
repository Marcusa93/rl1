// ============================================================
// «Redacción de escritos jurídicos con inteligencia artificial» —
// Doing Global · Marco Rossi. Clase sincrónica de 90 minutos:
// 5 bloques, 24 placas, 4 demostraciones de IA, 6 experiencias
// participativas y un laboratorio de skills.
//
// /doing          → vista del participante (la abren desde el chat de Zoom; anónima)
// /doing/clase    → presentación (se comparte en la videollamada)
// /doing/notas    → notas del orador en otra ventana (no se comparte)
//
// La pantalla manda: al llegar a la pantalla de una actividad, se abre sola
// en los dispositivos. Las demás pantallas no cambian nada (quien llegó tarde
// puede terminar de responder). Reusa el motor de clase en vivo (lib/clase-vivo.ts).
// Brief: «Doing Global/DOCUMENTO CONTEXTUAL DE PRODUCCIÓN.txt».
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";
import type { Demo } from "./doing-caso";

export const DG_SLUG = "doing-redaccion";
export const DG_TITULO = "Redacción de escritos jurídicos con inteligencia artificial";
export const DG_TITULO_CORTO = "Redacción jurídica con IA";
export const DG_INSTITUCION = "Doing Global";
export const DG_DOCENTE = "Marco Rossi";
/** Dirección que se pega en el chat de Zoom (el QR de la pantalla de ingreso apunta a la misma). */
export const DG_LINK = "taller.rossi-ia.com/doing";
export const DG_QR = "/doing/qr.svg";
export const DG_PREGUNTA = "La IA puede escribir por vos. ¿Pero puede decidir qué tenés que escribir?";
export const DG_TESIS =
  "La inteligencia artificial puede producir el texto, pero el profesional debe diseñar y dirigir el proceso que permite llegar a un escrito jurídicamente defendible.";
export const DG_FRASE_FINAL =
  "La inteligencia artificial puede escribir cada vez más. Nuestro desafío es aprender a dirigir cada vez mejor aquello que le pedimos escribir.";
export const DG_MINUTOS = 90;

// --- Bloques (línea de tiempo del pie) -------------------------------------------------------------

export interface DgBloque {
  num: string;
  nombre: string;
  rango: string;
  minutos: number;
}

export const DG_BLOQUES: DgBloque[] = [
  { num: "I", nombre: "Escribir no es razonar", rango: "0–15", minutos: 15 },
  { num: "II", nombre: "Human in the loop", rango: "15–35", minutos: 20 },
  { num: "III", nombre: "Del pedido al escrito", rango: "35–60", minutos: 25 },
  { num: "IV", nombre: "Automatización de escritos", rango: "60–80", minutos: 20 },
  { num: "V", nombre: "Control, sesgos y responsabilidad", rango: "80–90", minutos: 10 },
];

// --- Experiencias participativas -----------------------------------------------------------------

export type DgKey = "dg_usos" | "dg_automatizar" | "dg_controles" | "dg_sabemos" | "dg_salto" | "dg_flujo";

export type DgActividad = ActividadVivo & {
  key: DgKey;
  /** 1 a 6: el orden de las experiencias en la clase. */
  numero: number;
  formato: string;
  /** Duración máxima sugerida (minutos). */
  duracion: number;
  /** Placa a la que pertenece. */
  placa: number;
  /** Los resultados empiezan ocultos: que nadie vote por arrastre. */
  ocultos?: boolean;
  /** Categoría orientativa de cada fila y por qué (se muestra al revelar). */
  clasificacion?: Record<string, { correcta: string; por: string }>;
  /** Etiquetas cortas de las filas para la pantalla compartida. */
  cortas?: Record<string, string>;
  /** Resultado ilustrativo (modo demostración): nunca se presenta como respuesta de la sala. */
  demo: { respondieron: number; summary: Record<string, unknown> };
};

export const GRADOS = [
  { id: "puntual", emoji: "✏️", label: "Asistencia puntual" },
  { id: "asistida", emoji: "🧩", label: "Redacción asistida" },
  { id: "integral", emoji: "📄", label: "Borrador integral" },
  { id: "plantilla", emoji: "⚙️", label: "Plantilla o flujo" },
];

export const CATEGORIAS_SABEMOS = [
  { id: "dato", emoji: "📎", label: "Dato documentado" },
  { id: "alegacion", emoji: "🗣️", label: "Alegación de parte" },
  { id: "inferencia", emoji: "🔗", label: "Inferencia" },
  { id: "sin", emoji: "❔", label: "Sin respaldo suficiente" },
];

export const RESOLUCION = [
  { id: "reglas", emoji: "⚙️", label: "Reglas o plantilla" },
  { id: "ia", emoji: "✨", label: "Asistencia de IA" },
  { id: "profesional", emoji: "⚖️", label: "Decisión profesional" },
];

/** Variantes evidentes de una misma expresión en la nube (sin fusionar conceptos distintos). */
const SINONIMOS_USOS: Record<string, string> = {
  redactar: "redacción",
  redaccion: "redacción",
  "redactar escritos": "redacción",
  "redaccion de escritos": "redacción",
  escritos: "redacción",
  escribir: "redacción",
  resumir: "resúmenes",
  resumen: "resúmenes",
  resumenes: "resúmenes",
  "resumir documentos": "resúmenes",
  investigar: "investigación",
  investigacion: "investigación",
  jurisprudencia: "búsqueda de jurisprudencia",
  "buscar jurisprudencia": "búsqueda de jurisprudencia",
  "busqueda de jurisprudencia": "búsqueda de jurisprudencia",
  traducir: "traducción",
  traduccion: "traducción",
  corregir: "corrección",
  correccion: "corrección",
  "corregir textos": "corrección",
  "revision": "revisión",
  revisar: "revisión",
  analizar: "análisis",
  analisis: "análisis",
  organizar: "organización",
  organizacion: "organización",
  ideas: "ideas",
  "lluvia de ideas": "ideas",
  contratos: "contratos",
  "redactar contratos": "contratos",
  "revisar contratos": "contratos",
  mails: "correos",
  emails: "correos",
  correos: "correos",
  "redactar mails": "correos",
};

const ACTIVIDADES: DgActividad[] = [
  {
    key: "dg_usos",
    numero: 1,
    placa: 1,
    formato: "Nube de palabras",
    duracion: 2,
    kind: "palabra",
    palabras: 3,
    normalizar: true,
    sinonimos: SINONIMOS_USOS,
    maxChars: 28,
    titulo: "¿Para qué usamos IA?",
    bajada: "¿Para qué utilizás inteligencia artificial en tu trabajo jurídico? Hasta tres palabras o expresiones breves.",
    demo: {
      respondieron: 34,
      summary: {
        total: 34,
        palabras: [
          { palabra: "redacción", n: 21 },
          { palabra: "resúmenes", n: 14 },
          { palabra: "búsqueda de jurisprudencia", n: 9 },
          { palabra: "corrección", n: 8 },
          { palabra: "investigación", n: 7 },
          { palabra: "contratos", n: 6 },
          { palabra: "análisis", n: 5 },
          { palabra: "correos", n: 4 },
          { palabra: "ideas", n: 4 },
          { palabra: "traducción", n: 3 },
          { palabra: "organización", n: 3 },
          { palabra: "demandas", n: 2 },
          { palabra: "cartas documento", n: 2 },
          { palabra: "preparar audiencias", n: 1 },
          { palabra: "nada todavía", n: 1 },
        ],
      },
    },
  },
  {
    key: "dg_automatizar",
    numero: 2,
    placa: 4,
    formato: "Matriz de decisiones",
    duracion: 3,
    kind: "encuesta",
    titulo: "¿Cuánto automatizarías?",
    bajada: "Para cada tarea, elegí el grado de automatización que te parece apropiado.",
    preguntas: [
      { id: "corregir", q: "Corregir un párrafo", opciones: GRADOS },
      { id: "argumentar", q: "Redactar una respuesta argumentativa", opciones: GRADOS },
      { id: "tramite", q: "Completar un escrito de mero trámite", opciones: GRADOS },
      { id: "complejo", q: "Revisar un documento jurídico complejo", opciones: GRADOS },
    ],
    demo: {
      respondieron: 33,
      summary: {
        total: 33,
        byQuestion: {
          corregir: { puntual: 24, asistida: 6, integral: 1, plantilla: 2 },
          argumentar: { puntual: 6, asistida: 19, integral: 7, plantilla: 1 },
          tramite: { puntual: 2, asistida: 5, integral: 8, plantilla: 18 },
          complejo: { puntual: 13, asistida: 12, integral: 5, plantilla: 3 },
        },
      },
    },
  },
  {
    key: "dg_controles",
    numero: 3,
    placa: 7,
    formato: "Mapa de controles",
    duracion: 3,
    kind: "chips",
    max: 2,
    titulo: "¿Dónde debe intervenir el abogado?",
    bajada: "¿Dónde pondrías los controles humanos más importantes? Elegí dos etapas del circuito.",
    opciones: [
      { id: "encargo", emoji: "🎯", label: "Definición del encargo" },
      { id: "antecedentes", emoji: "🗂️", label: "Preparación de antecedentes" },
      { id: "argumentos", emoji: "🧭", label: "Construcción argumentativa" },
      { id: "borrador", emoji: "📝", label: "Generación del borrador" },
      { id: "aprobacion", emoji: "✅", label: "Aprobación final" },
    ],
    demo: { respondieron: 32, summary: { total: 32, counts: { encargo: 14, antecedentes: 9, argumentos: 17, borrador: 5, aprobacion: 19 } } },
  },
  {
    key: "dg_sabemos",
    numero: 4,
    placa: 12,
    formato: "Clasificación de afirmaciones",
    duracion: 3,
    kind: "encuesta",
    ocultos: true,
    titulo: "¿Qué sabemos realmente?",
    bajada: "Cuatro afirmaciones sobre el caso. Clasificá cada una.",
    preguntas: [
      { id: "transferencia", q: "El 22/04/2026 se registró una transferencia de $ 500.000 a la cuenta de Boreal.", opciones: CATEGORIAS_SABEMOS },
      { id: "sostiene", q: "Posada sostiene que con las tres transferencias canceló la factura 418.", opciones: CATEGORIAS_SABEMOS },
      { id: "para_pagar", q: "Las transferencias se hicieron para pagar la factura 418.", opciones: CATEGORIAS_SABEMOS },
      { id: "mala_fe", q: "Boreal actuó deliberadamente de mala fe al imputar los pagos.", opciones: CATEGORIAS_SABEMOS },
    ],
    cortas: {
      transferencia: "Hubo una transferencia de $ 500.000 el 22/04",
      sostiene: "Posada sostiene que canceló la factura 418",
      para_pagar: "Las transferencias fueron para pagar la factura 418",
      mala_fe: "Boreal actuó de mala fe",
    },
    clasificacion: {
      transferencia: { correcta: "dato", por: "Surge del comprobante 1 y la actora no lo desconoce." },
      sostiene: { correcta: "alegacion", por: "Es la posición de la demandada: describe lo que una parte afirma." },
      para_pagar: { correcta: "inferencia", por: "Los comprobantes no lo dicen; el tercero menciona otra factura." },
      mala_fe: { correcta: "sin", por: "Ningún material del caso permite sostenerlo; es una calificación." },
    },
    revela:
      "Un sistema generativo puede convertir una alegación en un hecho aparentemente establecido, o incorporar una inferencia sin justificarla. La clasificación depende de los documentos del caso.",
    demo: {
      respondieron: 31,
      summary: {
        total: 31,
        byQuestion: {
          transferencia: { dato: 26, alegacion: 2, inferencia: 2, sin: 1 },
          sostiene: { dato: 5, alegacion: 22, inferencia: 3, sin: 1 },
          para_pagar: { dato: 9, alegacion: 7, inferencia: 13, sin: 2 },
          mala_fe: { dato: 0, alegacion: 9, inferencia: 6, sin: 16 },
        },
      },
    },
  },
  {
    key: "dg_salto",
    numero: 5,
    placa: 14,
    formato: "Mapa de inferencias",
    duracion: 3,
    kind: "opciones",
    ocultos: true,
    titulo: "¿Dónde está el salto argumental?",
    bajada: "Conclusión: «La factura 418 se encuentra completamente cancelada». ¿Qué conexión necesita mayor justificación?",
    opciones: [
      { id: "existencia", emoji: "🧾", label: "Existieron tres transferencias por $ 1.500.000" },
      { id: "recepcion", emoji: "🏦", label: "Boreal recibió los fondos" },
      { id: "imputacion", emoji: "🧷", label: "Los pagos se aplicaron a la factura 418" },
    ],
    correcta: "imputacion",
    revela:
      "Existencia y recepción tienen respaldo (comprobantes y reconocimiento de la actora). La imputación es el salto: los comprobantes no la indican y uno menciona otra factura. Detectar una inferencia débil no significa que la conclusión sea falsa: significa que necesita más justificación.",
    demo: { respondieron: 30, summary: { total: 30, counts: { existencia: 3, recepcion: 6, imputacion: 21 } } },
  },
  {
    key: "dg_flujo",
    numero: 6,
    placa: 20,
    formato: "Flujo documental colectivo",
    duracion: 4,
    kind: "encuesta",
    titulo: "¿Qué puede automatizarse?",
    bajada: "¿Qué operación resolverías con reglas, cuál con IA y cuál reservarías al profesional?",
    preguntas: [
      { id: "caratula", q: "Completar la carátula y los datos del expediente", opciones: RESOLUCION },
      { id: "campos", q: "Verificar los campos obligatorios", opciones: RESOLUCION },
      { id: "describir", q: "Describir documentos heterogéneos", opciones: RESOLUCION },
      { id: "pertinencia", q: "Decidir si corresponde presentar el escrito", opciones: RESOLUCION },
      { id: "borrador", q: "Generar el borrador del escrito", opciones: RESOLUCION },
    ],
    cortas: {
      caratula: "Completar la carátula",
      campos: "Verificar campos obligatorios",
      describir: "Describir los documentos",
      pertinencia: "Decidir si se presenta",
      borrador: "Generar el borrador",
    },
    clasificacion: {
      caratula: { correcta: "reglas", por: "Datos estables: se insertan sin reformular." },
      campos: { correcta: "reglas", por: "Una validación determinista detecta faltantes y formatos." },
      describir: { correcta: "ia", por: "Tarea lingüística delimitada: reformular sin interpretar." },
      pertinencia: { correcta: "profesional", por: "Es una decisión jurídica." },
      borrador: { correcta: "reglas", por: "La plantilla arma lo fijo; la IA, solo fragmentos; el profesional revisa." },
    },
    revela:
      "Arquitectura híbrida: reglas para las operaciones estables, IA para tareas lingüísticas delimitadas y controles profesionales para las decisiones jurídicas.",
    demo: {
      respondieron: 29,
      summary: {
        total: 29,
        byQuestion: {
          caratula: { reglas: 23, ia: 5, profesional: 1 },
          campos: { reglas: 19, ia: 8, profesional: 2 },
          describir: { reglas: 4, ia: 21, profesional: 4 },
          pertinencia: { reglas: 0, ia: 3, profesional: 26 },
          borrador: { reglas: 12, ia: 14, profesional: 3 },
        },
      },
    },
  },
];

export const DG_ACTIVIDADES = ACTIVIDADES;

export function getDgActividad(key: string): DgActividad | undefined {
  return ACTIVIDADES.find((a) => a.key === key);
}

// --- Pantallas ---------------------------------------------------------------------------------------

export type DgCuerpo =
  | "decide"
  | "impecable"
  | "estaciones"
  | "giro-tarea"
  | "loop"
  | "decidir"
  | "capas"
  | "mapa"
  | "giro-criterio"
  | "relato"
  | "cotio"
  | "contexto"
  | "puentes"
  | "adversarial"
  | "palabra"
  | "giro-repite"
  | "caso-uso"
  | "domicilio"
  | "plantilla-ia"
  | "formulario"
  | "giro-detenerse"
  | "calidad"
  | "costo"
  | "cierre";

export interface DgPlaca {
  t: "placa";
  num: number;
  titulo: string;
  bajada: string;
  bloque: number;
  /** Minutos aproximados de la clase (para el orador). */
  minuto: string;
  cuerpo: DgCuerpo;
  /** Partes que aparecen de a una con → (0: la placa se ve entera). */
  pasos: number;
  /** Placa de giro: texto circular, señal para el docente de sintetizar y cambiar de dirección. */
  giro?: string;
  /** Prompt del laboratorio que la vista del participante ofrece probar en esta placa. */
  probar?: string;
  /** Texto de la placa para el dispositivo del participante (sin diagramas). */
  lineas: string[];
  /** Notas del orador: solo en /doing/notas, nunca en la pantalla compartida. */
  nota: string;
}

export interface DgPantallaActividad {
  t: "actividad";
  activa: DgKey;
  bloque: number;
  minuto: string;
  nota: string;
}

export interface DgPantallaDemo {
  t: "demo";
  demo: Demo["id"];
  bloque: number;
  minuto: string;
  probar?: string;
  nota: string;
}

export interface DgPantallaSkill {
  t: "skill";
  titulo: string;
  bajada: string;
  bloque: number;
  minuto: string;
  lineas: string[];
  nota: string;
}

export type DgSlide =
  | { t: "portada"; bloque: number; minuto: string; nota: string }
  | { t: "ingreso"; bloque: number; minuto: string; nota: string }
  | DgPlaca
  | DgPantallaActividad
  | DgPantallaDemo
  | DgPantallaSkill;

const SLIDES: DgSlide[] = [
  {
    t: "portada",
    bloque: 0,
    minuto: "previo",
    nota:
      "Mientras entra la gente. Compartí ESTA ventana en Zoom (no la de notas). Atajos: Q muestra el enlace con QR, N abre las notas, D activa el modo demostración (datos ilustrativos rotulados) por si falla la conexión, G muestra todas las pantallas.\n\nAntes de empezar: abrí las notas (N) en otra ventana o monitor y probá un pedido de IA en una demostración para confirmar que la conexión responde.",
  },
  {
    t: "ingreso",
    bloque: 0,
    minuto: "0–1",
    nota:
      "Pegá el enlace en el chat de Zoom: taller.rossi-ia.com/doing (que lo abran en otra pestaña o ventana). No piden nombre ni datos: es anónimo y los resultados se muestran agrupados. Ahí, además de seguir la clase, tienen el caso, los prompts, la skill y las herramientas para probar.\n\nPregunta generadora (decila y dejala flotando): «La IA puede escribir por vos. ¿Pero puede decidir qué tenés que escribir?». Atraviesa toda la clase y vuelve al cierre.",
  },

  // ─── BLOQUE I · Escribir no es razonar (0–15) ─────────────────────────────────────────
  {
    t: "placa",
    num: 1,
    titulo: "La IA escribe. ¿Quién decide?",
    bajada: "Redacción jurídica más allá del texto.",
    bloque: 0,
    minuto: "1–2",
    cuerpo: "decide",
    pasos: 0,
    lineas: [
      "Hoy se puede generar un escrito jurídico en segundos, con una calidad formal sorprendente",
      "Pero antes de redactar se selecciona información, se interpreta, se decide una posición y qué pedir",
      "El riesgo: que la facilidad de generar texto nos lleve a delegar esas operaciones sin darnos cuenta",
    ],
    nota:
      "Instalá la pregunta principal. Hoy se genera un escrito en segundos y la calidad formal sorprende, aun con instrucciones breves.\n\nPero el trabajo jurídico no es producir oraciones correctas: antes de redactar se selecciona información, se interpreta una situación, se decide una posición y qué petición formular. El problema aparece cuando la facilidad de generar texto lleva a delegar implícitamente esas operaciones.\n\nVisual: la máquina de escribir y la interfaz de IA son dos momentos de una misma actividad profesional. Cambió la herramienta; las decisiones siguen siendo nuestras.\n\nRecordá el enlace del chat: la próxima pantalla abre la primera actividad.",
  },
  {
    t: "actividad",
    activa: "dg_usos",
    bloque: 0,
    minuto: "2–3",
    nota:
      "EXPERIENCIA 1 · nube · máximo 2 minutos. Se abrió sola en la vista de los participantes.\n\nMirá qué aparece con más frecuencia: redacción, investigación, análisis, jurisprudencia, organización documental. Vinculalo con lo que viene en la clase.\n\nSi hay pocas respuestas: interpretación prudente, sin atribuirle representatividad. Si una palabra no corresponde, ocultala desde las notas (abajo).\n\nTransición: «Muchos usamos estas herramientas para redactar. Pero veamos qué ocurre cuando les pedimos que escriban sin explicar suficientemente qué deben hacer».",
  },
  {
    t: "placa",
    num: 2,
    titulo: "Un escrito impecable. Un problema invisible.",
    bajada: "La fluidez puede disimular una inferencia.",
    bloque: 0,
    minuto: "3–4",
    cuerpo: "impecable",
    pasos: 2,
    probar: "insuficiente",
    lineas: [
      "El caso: Boreal reclama un saldo; Posada (nuestro cliente) acompañó tres comprobantes de transferencias",
      "Los comprobantes muestran operaciones bancarias, no necesariamente su imputación a la deuda",
      "La calidad lingüística no garantiza la corrección de las afirmaciones",
    ],
    nota:
      "Presentá el caso en un minuto: Boreal Climatización reclama $ 1.000.000 como saldo de la factura 418. Posada (nuestro cliente) dice que pagó todo con tres transferencias de $ 500.000. Boreal reconoce haberlas recibido, pero dice que se aplicaron a otras facturas.\n\nCon → aparece un escrito «impecable» y su afirmación clave conectada con el comprobante: el comprobante 3 dice «FC 0003-00000397», otra factura.\n\nSigue la demostración 1: el pedido insuficiente, en vivo.",
  },
  {
    t: "demo",
    demo: "d1",
    bloque: 0,
    minuto: "4–7",
    probar: "insuficiente",
    nota:
      "DEMOSTRACIÓN 1 · el pedido insuficiente. Solo se adjuntan los comprobantes. El pedido es deliberadamente insuficiente: no distingue entre las transferencias y la extinción de la obligación.\n\nEjecutá en vivo (o abrí en ChatGPT/Claude). Con «Subrayar» se marcan las certezas que necesitan respaldo. Identificá: ¿de dónde sale «pago total»? ¿qué dice el comprobante 3? ¿cuánto reclama realmente Boreal? (la respuesta preparada inventa que reclama $ 1.500.000: reclama $ 1.000.000).\n\nSi el modelo evita conclusiones no justificadas, decilo como un control útil y mostrá la respuesta preparada (rotulada como ilustrativa).\n\nTransición: «No todas las tareas de redacción exigen el mismo grado de autonomía».",
  },
  {
    t: "placa",
    num: 3,
    titulo: "No todo se automatiza igual.",
    bajada: "Corregir, redactar, estructurar o generar.",
    bloque: 0,
    minuto: "7–11",
    cuerpo: "estaciones",
    pasos: 4,
    lineas: [
      "Asistencia puntual: corregir o mejorar un fragmento",
      "Redacción por secciones: desarrollar apartados determinados",
      "Borrador completo: un documento integral a partir de instrucciones y antecedentes",
      "Automatización documental: procedimientos configurados para escritos repetitivos",
      "Una plantilla tradicional puede funcionar sin IA generativa; un mismo escrito puede combinar grados",
    ],
    nota:
      "Cuatro estaciones, de a una (→). Ejemplo de cada una con el caso: corregir el párrafo del apartado II; desarrollar solo «lo que acreditan los comprobantes»; pedir la respuesta completa a Boreal; generar el escrito de acompañamiento documental desde una plantilla.\n\nDestacá dos cosas: una plantilla tradicional funciona sin IA generativa, por sustitución de campos; y un mismo documento puede combinar grados (carátula por plantilla, descripción con IA, argumento con asistencia).\n\nTransición: «La pregunta no debería ser cuánto podemos automatizar, sino qué conviene automatizar en cada tarea».",
  },
  {
    t: "placa",
    num: 4,
    titulo: "La tarea define la herramienta.",
    bajada: "El riesgo no se mide en páginas.",
    bloque: 0,
    minuto: "11–12",
    cuerpo: "giro-tarea",
    pasos: 0,
    giro: "¿QUIÉN CONTROLA EL SALTO? · ",
    lineas: [
      "Un escrito breve puede contener una decisión decisiva",
      "Un documento extenso puede ser repetitivo y estable",
      "Acompañar tres documentos no es lo mismo que sostener una interpretación sobre ellos",
    ],
    nota:
      "GIRO (texto circular): sintetizá y cambiá de dirección. Compará un escrito breve con decisiones relevantes y un documento extenso de contenido repetitivo. Acompañar tres comprobantes es una actuación relativamente estructurada; sostener que cancelaron la factura 418 exige otro nivel de análisis.\n\nLa balanza: lo que pesa es la decisión, no la extensión. Sigue la experiencia 2.",
  },
  {
    t: "actividad",
    activa: "dg_automatizar",
    bloque: 0,
    minuto: "12–15",
    nota:
      "EXPERIENCIA 2 · matriz · máximo 3 minutos. Cuatro tareas, cuatro grados.\n\nNo hay una respuesta universal: usá las diferencias. Si «revisar un documento complejo» se reparte entre asistencia puntual y redacción asistida, es la mejor discusión: la complejidad aumenta el riesgo, pero también el valor de una ayuda delimitada.\n\nLa distribución depende de la complejidad, la información disponible y el riesgo de cada actuación.\n\nTransición: «Una vez que decidimos qué tareas puede asumir la tecnología, necesitamos establecer dónde interviene el profesional».",
  },

  // ─── BLOQUE II · Human in the loop (15–35) ─────────────────────────────────────────────
  {
    t: "placa",
    num: 5,
    titulo: "Human in the loop no es firmar al final.",
    bajada: "Es intervenir mientras se construye.",
    bloque: 1,
    minuto: "15–19",
    cuerpo: "loop",
    pasos: 2,
    lineas: [
      "Las decisiones humanas forman parte del circuito, en momentos determinados",
      "Intervenir: establecer el encargo, seleccionar antecedentes, aprobar una estructura, corregir afirmaciones, detener la generación",
      "Un control efectivo exige entender qué se revisa y poder modificarlo de verdad",
    ],
    nota:
      "Human in the loop describe un procedimiento donde las decisiones humanas forman parte del circuito: la persona no aparece solo al final.\n\nPrimero (→) el circuito con una sola aprobación final: la firma llega cuando ya todo está decidido. Después (→) el circuito con controles intermedios: encargo, antecedentes, esquema, borrador, aprobación.\n\nUn control efectivo exige comprender qué se revisa y tener posibilidades reales de modificación. Firmar 40 páginas generadas en un minuto no es controlar.\n\nTransición: «El primer control ocurre antes de que exista un solo párrafo».",
  },
  {
    t: "placa",
    num: 6,
    titulo: "Antes de redactar, hay que decidir.",
    bajada: "Objeto, posición y límites.",
    bloque: 1,
    minuto: "19–23",
    cuerpo: "decidir",
    pasos: 2,
    probar: "preguntas",
    lineas: [
      "«Contestá este escrito» deja abiertas cuestiones esenciales",
      "Si no las decidimos, la IA elige qué discutir, qué hechos importan y qué posición asumir",
      "La herramienta puede ayudar formulando preguntas, sin convertir una ambigüedad en una autorización",
    ],
    nota:
      "Pedir «contestá este escrito» deja abiertas cuestiones esenciales: qué afirmaciones discutir, qué hechos son relevantes, qué posición asumir.\n\nLos dos caminos parten de los mismos comprobantes. Camino A (prudente): «acreditan transferencias por $ 1.500.000 recibidas por Boreal; la imputación está controvertida». Camino B (mayor alcance): «la factura 418 está cancelada». Los dos pueden redactarse impecables; solo uno está respaldado hoy.\n\nLa IA puede colaborar formulando preguntas (en la vista de los participantes está el prompt «Que te pregunte antes de redactar»), pero no debe convertir una ambigüedad del usuario en una autorización implícita para resolver cuestiones sustantivas.\n\nTransición: «Aun con la posición bien definida, podemos equivocarnos si no distinguimos qué sabemos y qué suponemos».",
  },
  {
    t: "placa",
    num: 7,
    titulo: "Un dato no es una conclusión.",
    bajada: "Alegación, documento e inferencia.",
    bloque: 1,
    minuto: "23–25",
    cuerpo: "capas",
    pasos: 3,
    lineas: [
      "Alegación: una parte sostiene que pagó completamente",
      "Documento: un comprobante acredita la existencia de una transferencia",
      "Inferencia: que esa transferencia extinguió una obligación determinada necesita justificarse",
    ],
    nota:
      "Tres capas, de a una. Alegación: «les pagamos TODO» (el cliente). Documento: el comprobante acredita una transferencia de $ 500.000 el 22/04. Inferencia: que esa transferencia extinguió la factura 418 necesita justificar la relación entre ambos elementos.\n\nLa IA puede formular esa conclusión con apariencia convincente; el profesional examina si tiene respaldo suficiente.\n\nSigue la experiencia 3.",
  },
  {
    t: "actividad",
    activa: "dg_controles",
    bloque: 1,
    minuto: "25–27",
    nota:
      "EXPERIENCIA 3 · mapa de controles · máximo 3 minutos. Cada uno elige DOS etapas.\n\nAdvertencia clave: los resultados no autorizan a eliminar controles en las etapas menos votadas. La intensidad del control depende del tipo de tarea y del riesgo.\n\nSi «aprobación final» gana: es la intuición de «firmar al final» que acabamos de discutir. Si gana «definición del encargo»: ya incorporaron la placa 6.\n\nTransición: «Para conservar el control, primero necesitamos organizar el razonamiento».",
  },
  {
    t: "placa",
    num: 8,
    titulo: "Primero el mapa. Después el texto.",
    bajada: "El esquema también se aprueba.",
    bloque: 1,
    minuto: "27–28",
    cuerpo: "mapa",
    pasos: 3,
    probar: "mapa",
    lineas: [
      "1 · Propuesta: la IA identifica hechos, faltantes y posibles argumentos, sin redactar",
      "2 · Intervención profesional: se revisa el esquema y se corrige lo que excede los documentos",
      "3 · Desarrollo: se autoriza la redacción de un apartado específico",
    ],
    nota:
      "Tres pasos: propuesta, intervención profesional y desarrollo. La herramienta ordena el problema sin asumir automáticamente las decisiones jurídicas.\n\nSigue la demostración 2 en vivo.",
  },
  {
    t: "demo",
    demo: "d2",
    bloque: 1,
    minuto: "28–32",
    probar: "mapa",
    nota:
      "DEMOSTRACIÓN 2 · human in the loop. Se adjuntan ficha, comprobantes, escrito de Boreal y mensaje del cliente.\n\nPaso 1: la IA no redacta: decisiones, faltantes, hechos/alegaciones/inferencias y esquema. Revisá en voz alta una sección y señalá una afirmación que exceda los documentos.\n\nPaso 2: tu corrección y autorización de UN apartado (está precargada; podés editarla antes de enviar). Mostrá que el texto respeta la corrección y marca lo que hay que verificar.\n\nTransición: «La diferencia no está solamente en el resultado. Está en el procedimiento que permite llegar hasta él».",
  },
  {
    t: "placa",
    num: 9,
    titulo: "Delegar texto no es delegar criterio.",
    bajada: "El control cambia con la tarea.",
    bloque: 1,
    minuto: "32–35",
    cuerpo: "giro-criterio",
    pasos: 0,
    giro: "¿CON QUÉ INSTRUCCIONES? · ",
    lineas: [
      "Definir el encargo, revisar antecedentes, aprobar un esquema y controlar el borrador son operaciones distintas",
      "No todas necesitan la misma intensidad en cualquier documento",
      "Se trata de organizar controles adecuados a cada tarea",
    ],
    nota:
      "GIRO. Recuperá las decisiones de la demostración: definir el encargo, revisar antecedentes, aprobar un esquema y controlar el borrador son operaciones distintas. No todas necesitan la misma intensidad en cualquier documento: organizamos controles adecuados a la naturaleza de cada tarea.\n\nTransición: «Ahora que sabemos dónde intervenir, necesitamos aprender a convertir una necesidad jurídica en un encargo suficientemente claro».",
  },

  // ─── BLOQUE III · Del pedido al escrito (35–60) ───────────────────────────────────────
  {
    t: "placa",
    num: 10,
    titulo: "El cliente trae un relato. No un prompt.",
    bajada: "Primero se construye el encargo.",
    bloque: 2,
    minuto: "35–38",
    cuerpo: "relato",
    pasos: 2,
    probar: "relato",
    lineas: [
      "El trabajo empieza con una narración, un mensaje o documentación incompleta",
      "El profesional interpreta y establece qué actuación corresponde",
      "La IA ayuda a encontrar contradicciones, faltantes y alternativas; el relato no se convierte solo en un escrito",
    ],
    nota:
      "El mensaje de Martín Ocampo (ficticio): «les pagamos TODO», «en efectivo al técnico, no sé si hay recibo», «fue un error de Carla», «quiero contestarles fuerte, esto es mala fe».\n\nCon → se transforma en una ficha profesional: objeto, hechos afirmados, documentos, contradicciones y faltantes. Lo que el cliente pide («contestar fuerte», «mala fe») no es lo que corresponde escribir.\n\nEn la vista de los participantes está el prompt «Del relato a la ficha».\n\nTransición: «Para ordenar ese pasaje podemos utilizar una estructura sencilla».",
  },
  {
    t: "placa",
    num: 11,
    titulo: "Un pedido tiene cinco piezas.",
    bajada: "Contexto, objeto, tarea, input y output.",
    bloque: 2,
    minuto: "38–42",
    cuerpo: "cotio",
    pasos: 5,
    probar: "cotio",
    lineas: [
      "Contexto: en qué trabajo estamos",
      "Objeto: sobre qué parte del problema",
      "Tarea: qué operación se espera",
      "Input: con qué antecedentes y con qué límites",
      "Output: qué resultado y en qué formato",
    ],
    nota:
      "COTIO, pieza por pieza (→), con el caso. No es una fórmula que garantice respuestas correctas: es una estructura para pensar qué información necesita el sistema y qué operación se espera de él.\n\nEl prompt completo está en la vista de los participantes («Un pedido con cinco piezas») y es el que usamos en la demostración 3.\n\nTransición: «Pero no alcanza con cargar documentos. Necesitamos explicar qué función cumple cada uno».",
  },
  {
    t: "placa",
    num: 12,
    titulo: "El contexto no es una bolsa de archivos.",
    bajada: "Cada fuente tiene una función.",
    bloque: 2,
    minuto: "42–44",
    cuerpo: "contexto",
    pasos: 0,
    probar: "clasificar",
    lineas: [
      "Prueba documental: los comprobantes",
      "Alegaciones: el escrito de Boreal y el relato del cliente",
      "Fuentes jurídicas: normas a verificar",
      "Modelos de estructura y referencias de estilo: solo forma",
      "Una plantilla anterior no debe trasladar nombres, hechos ni argumentos de otro expediente",
    ],
    nota:
      "Diferenciá documentos probatorios, alegaciones, fuentes jurídicas, modelos de estructura y referencias de estilo. El sistema tiene que saber qué materiales contienen hechos del caso y cuáles solo sirven como ejemplos de redacción.\n\nEjemplo clásico: el escrito de otro expediente usado como modelo y la IA que «hereda» un nombre o un monto. Decile a la IA qué función cumple cada archivo.\n\nSigue la experiencia 4.",
  },
  {
    t: "actividad",
    activa: "dg_sabemos",
    bloque: 2,
    minuto: "44–46",
    nota:
      "EXPERIENCIA 4 · clasificador · máximo 3 minutos. Resultados ocultos (R los muestra; E revela la categoría orientativa de cada una).\n\nAnalizá la de mayor discrepancia, casi seguro «las transferencias se hicieron para pagar la factura 418»: muchos la ven como dato. Es una inferencia: los comprobantes no lo dicen y el tercero menciona otra factura.\n\nMensaje: un sistema generativo puede transformar una alegación en un hecho aparentemente establecido o incorporar una inferencia sin justificarla.\n\nTransición: «Cuando la información está bien organizada, recién podemos comenzar a construir el razonamiento».",
  },
  {
    t: "placa",
    num: 13,
    titulo: "Un argumento necesita puentes.",
    bajada: "Afirmación, apoyo y conclusión.",
    bloque: 2,
    minuto: "46–50",
    cuerpo: "puentes",
    pasos: 2,
    lineas: [
      "Qué se sostiene, sobre qué se apoya y cómo se justifica la conclusión",
      "No basta con colocar una norma o mencionar una prueba: hay que explicar la relación",
      "La IA ayuda a detectar relaciones implícitas y omisiones; esas conexiones se examinan profesionalmente",
    ],
    nota:
      "Tres plataformas: afirmación, apoyo, conclusión. No basta con poner una norma o mencionar una prueba: hay que explicar la relación entre el elemento y la proposición.\n\nCon → aparece el puente incompleto: de «Boreal recibió $ 1.500.000» a «la factura 418 está cancelada» falta la imputación.\n\nTransición: «Y una buena forma de descubrir dónde falta un puente consiste en intentar atacar nuestro propio argumento».",
  },
  {
    t: "placa",
    num: 14,
    titulo: "Que la IA cuestione lo que acaba de escribir.",
    bajada: "La revisión adversarial mejora el borrador.",
    bloque: 2,
    minuto: "50–51",
    cuerpo: "adversarial",
    pasos: 3,
    probar: "adversarial",
    lineas: [
      "La IA puede redactar, cuestionar y proponer correcciones",
      "Pedirle la premisa más débil, las objeciones de la contraparte y lo que excede el respaldo",
      "Sus observaciones también se examinan: no se aceptan automáticamente",
    ],
    nota:
      "Las notas al margen aparecen de a una. La IA puede cumplir distintas funciones en el proceso: redactar, cuestionar y proponer correcciones. Pero sus observaciones se examinan; no se aceptan automáticamente.\n\nSigue la demostración 3 en vivo.",
  },
  {
    t: "demo",
    demo: "d3",
    bloque: 2,
    minuto: "51–54",
    probar: "adversarial",
    nota:
      "DEMOSTRACIÓN 3 · construir y atacar. Paso 1: COTIO pide un esquema que distinga afirmación, respaldo, inferencia y dato faltante (no redacta). Paso 2: revisión adversarial: premisa más débil, objeciones de Boreal y afirmaciones que exceden el respaldo.\n\nSeñalá: la coincidencia de importes es un indicio, no una prueba de la imputación; el comprobante 3 hay que tratarlo de frente.\n\nLa corrección de estilo de la placa 15 usa el apartado que redactó la demostración 2 (o el preparado). Sigue la experiencia 5.",
  },
  {
    t: "actividad",
    activa: "dg_salto",
    bloque: 2,
    minuto: "54–56",
    nota:
      "EXPERIENCIA 5 · mapa de inferencias · máximo 3 minutos. Resultados ocultos: R muestra las líneas (grosor = votos), E marca el salto.\n\nExplicá por qué una inferencia puede parecer natural y requerir información adicional: el total coincide justo con la factura 418, pero eso no prueba a qué se aplicó cada pago.\n\nImportante: detectar una inferencia débil es diferente de afirmar que la conclusión es falsa. Puede ser verdadera; necesita más justificación (recibos de las facturas 397 y 405, comunicaciones).\n\nTransición: «Hay errores grandes que reconocemos fácilmente. Otros aparecen cuando cambiamos apenas unas palabras».",
  },
  {
    t: "placa",
    num: 15,
    titulo: "Una palabra puede cambiar el caso.",
    bajada: "Corregir estilo sin alterar significado.",
    bloque: 2,
    minuto: "56–57",
    cuerpo: "palabra",
    pasos: 2,
    probar: "estilo",
    lineas: [
      "«El documento no acredita el pago» no es lo mismo que «el pago no existió»",
      "«La parte sostiene» no es lo mismo que «se encuentra acreditado»",
      "Mejorar la redacción no autoriza a modificar la certeza, las atribuciones ni el contenido",
    ],
    nota:
      "Dos pares, de a uno. «El documento no acredita el pago» habla de una insuficiencia de respaldo; «el pago no existió» afirma algo distinto sobre el acontecimiento. «La parte sostiene» atribuye; «se encuentra acreditado» certifica.\n\nUna corrección de estilo «para que suene mejor» puede hacer exactamente ese cambio. Sigue la corrección de estilo controlada, en vivo.",
  },
  {
    t: "demo",
    demo: "d3b",
    bloque: 2,
    minuto: "57–58",
    probar: "estilo",
    nota:
      "DEMOSTRACIÓN 3 (cierre) · estilo. Usa el apartado que redactó la demostración 2 en vivo (o el preparado, si no hubo). El prompt pide revisar solo el estilo y conservar atribuciones, certeza, hechos, referencias y petición, e identificar cualquier cambio de significado.\n\nComparalo con la placa 15: ¿cambió algún «sostiene» por «acredita»? Breve: 1 minuto.\n\nTransición: «Hasta ahora trabajamos sobre un escrito particular. Pero hay tareas que se repiten prácticamente todos los días».",
  },
  {
    t: "placa",
    num: 16,
    titulo: "No todo escrito empieza de cero.",
    bajada: "Lo repetitivo exige otro diseño.",
    bloque: 2,
    minuto: "58–60",
    cuerpo: "giro-repite",
    pasos: 0,
    giro: "¿QUÉ SE REPITE? · ",
    lineas: [
      "Muchos escritos tienen estructuras estables y campos variables",
      "Si la actuación ya fue definida profesionalmente, no hace falta reconstruirla a mano cada vez",
      "Qué partes se repiten, qué datos cambian y qué situaciones exceden el supuesto",
    ],
    nota:
      "GIRO. Muchos escritos contienen estructuras estables y campos variables. Cuando la actuación ya fue definida profesionalmente, puede ser innecesario reconstruir todo el documento a mano.\n\nTres preguntas: qué partes pueden repetirse, qué datos cambian y qué situaciones exceden el supuesto previsto.\n\nTransición: «Cuando identificamos qué se repite, podemos empezar a pensar en sistemas que preparen los borradores automáticamente».",
  },

  // ─── BLOQUE IV · Automatización de escritos (60–80) ─────────────────────────────────────
  {
    t: "placa",
    num: 17,
    titulo: "Automatizar no es pedir «hacelo solo».",
    bajada: "Primero se define un caso de uso.",
    bloque: 3,
    minuto: "60–63",
    cuerpo: "caso-uso",
    pasos: 3,
    lineas: [
      "«Automatizar todos los escritos del estudio» es demasiado amplio para empezar",
      "Conviene una actuación específica, conocida y estable: el acompañamiento documental",
      "Antes del sistema: qué información necesita, qué partes son fijas y qué situaciones exigen intervención",
    ],
    nota:
      "Automatizar todos los escritos de un estudio es un objetivo demasiado amplio. Empezá con una actuación específica, conocida y relativamente estable: el escrito de acompañamiento documental.\n\nAntes de construir nada, el profesional define: qué información necesita, qué partes del documento permanecen fijas y qué situaciones exigen intervención. Recorré la plantilla (→): texto fijo, campos variables, excepciones.\n\nTransición: «Para generar documentos de manera confiable, primero tenemos que ordenar los datos».",
  },
  {
    t: "placa",
    num: 18,
    titulo: "Un dato tiene que tener domicilio.",
    bajada: "Campos, fuentes y validaciones.",
    bloque: 3,
    minuto: "63–66",
    cuerpo: "domicilio",
    pasos: 2,
    lineas: [
      "Cada dato va en un campo con significado definido: carátula, expediente, órgano, parte, documentos",
      "Validaciones: que no falte nada, que la fecha tenga formato, que la cantidad de documentos coincida",
      "Detectan errores formales; no sustituyen el control jurídico del contenido",
    ],
    nota:
      "Cada dato se incorpora en un campo con significado definido y va a una posición concreta del documento. Las validaciones comprueban que no falte información, que una fecha tenga el formato correcto o que la cantidad de documentos declarada coincida con los archivos.\n\nLímite (→): estas reglas detectan errores formales, pero no sustituyen el control jurídico del contenido. Una validación no sabe si conviene presentar.\n\nTransición: «Una vez estructurados los datos, tenemos dos formas principales de producir el escrito».",
  },
  {
    t: "placa",
    num: 19,
    titulo: "La plantilla sabe repetir. La IA sabe reformular.",
    bajada: "Conviene que cada una haga lo suyo.",
    bloque: 3,
    minuto: "66–69",
    cuerpo: "plantilla-ia",
    pasos: 2,
    lineas: [
      "La plantilla inserta datos sin modificar las formulaciones fijas",
      "La IA generativa produce fragmentos variables: una descripción de documentos, una síntesis",
      "Combinadas: estabilidad en unas partes y flexibilidad en otras",
    ],
    nota:
      "Dos mecanismos que desembocan en un documento: sustitución de campos (estable, predecible, auditable) y generación de lenguaje (flexible, útil para fragmentos variables como describir documentos heterogéneos).\n\nLa combinación conserva la estabilidad de ciertas partes y agrega flexibilidad en otras. No le pidas a un modelo de lenguaje que «recuerde» el texto fijo: dáselo hecho.\n\nTransición: «Veamos cómo funciona cuando lo llevamos a un ejemplo concreto».",
  },
  {
    t: "placa",
    num: 20,
    titulo: "Del formulario al borrador.",
    bajada: "Generar no significa presentar.",
    bloque: 3,
    minuto: "69–70",
    cuerpo: "formulario",
    pasos: 0,
    lineas: [
      "Datos del expediente → validaciones → plantilla → descripción con IA → borrador",
      "El resultado es un borrador para revisión profesional, no una presentación",
    ],
    nota:
      "Presentá el generador: un formulario con datos ficticios, los comprobantes seleccionados, reglas que validan y una plantilla. La IA solo escribe la descripción de los documentos.\n\nSigue la demostración 4: completá, generá, y después introducí un error (campo vacío, cantidad que no coincide o un pedido que excede) para ver qué pasa cuando el procedimiento no puede continuar.",
  },
  {
    t: "demo",
    demo: "d4",
    bloque: 3,
    minuto: "70–72",
    nota:
      "DEMOSTRACIÓN 4 · generador. 1) «Generar»: las reglas validan, la plantilla arma el texto fijo (gris) con los campos (resaltados) y la IA redacta solo el apartado III. 2) Probá los interruptores de error: «Vaciar el expediente» (las reglas detienen antes de llamar a la IA), «Declarar 4 documentos» (no coincide la cantidad) y «Pedir que argumente la cancelación» (excede el modelo: decisión profesional).\n\nDistinguí qué se resolvió con reglas y qué con generación. Si la IA no responde, el borrador usa una descripción preparada (rotulada).\n\nSigue la experiencia 6.",
  },
  {
    t: "actividad",
    activa: "dg_flujo",
    bloque: 3,
    minuto: "72–75",
    nota:
      "EXPERIENCIA 6 · flujo colectivo · máximo 4 minutos. Cinco operaciones, tres categorías. Cada operación se colorea según la opción predominante; si no hay mayoría clara, se muestra la distribución real sin imponer consenso.\n\nContrastá: «generar el borrador» suele dividirse entre reglas e IA, y es la clave: arquitectura combinada. Reglas para lo estable, IA para tareas lingüísticas delimitadas, profesional para decisiones jurídicas. E revela una clasificación orientativa.\n\nTransición: «Ese procedimiento se puede empaquetar para que la IA lo aplique siempre igual».",
  },
  {
    t: "skill",
    titulo: "Del procedimiento a la skill",
    bajada: "Un procedimiento definido por el profesional, empaquetado para que la IA lo aplique siempre igual.",
    bloque: 3,
    minuto: "75–78",
    lineas: [
      "Una skill es una carpeta: instrucciones (SKILL.md), plantillas, checklists y, si hace falta, scripts",
      "Su descripción le dice a la IA cuándo usarla; el cuerpo, cómo trabajar y cuándo detenerse",
      "Se prueba como cualquier procedimiento: caso normal, caso incompleto y caso que excede",
      "En Claude se instala como skill; en otras herramientas, el mismo contenido sirve como instrucciones de un proyecto, GPT o Gem",
    ],
    nota:
      "LABORATORIO DE SKILLS · 3 minutos (si vas atrasado, mostrala en 1 minuto: queda en la vista de los participantes para después).\n\nUna skill es la forma de empaquetar lo que acabamos de diseñar: caso de uso, datos obligatorios, plantilla, reglas y cuándo detenerse. Es una carpeta con un SKILL.md (nombre + descripción + instrucciones) y recursos (la plantilla, el checklist). La descripción le dice a la IA cuándo usarla; el cuerpo, cómo.\n\nLa diferencia con un prompt: no se reescribe cada vez; se diseña una vez, se prueba y se mejora. Probala en vivo con las tres pruebas: caso normal, falta un dato, pide demasiado (las dos últimas tienen que detenerse).\n\nDesde su vista pueden descargarla (.zip lista para subir a Claude: Configuración → Capacidades → Skills) o copiarla como instrucciones de un proyecto, GPT o Gem.\n\nTransición: «Una skill bien diseñada, como cualquier sistema confiable, también sabe detenerse».",
  },
  {
    t: "placa",
    num: 21,
    titulo: "Un sistema confiable también sabe detenerse.",
    bajada: "Las excepciones forman parte del diseño.",
    bloque: 3,
    minuto: "78–80",
    cuerpo: "giro-detenerse",
    pasos: 0,
    giro: "¿CÓMO VERIFICAMOS? · ",
    lineas: [
      "Campos incompletos, información contradictoria o pedidos que exceden la finalidad",
      "En esos casos, el sistema solicita intervención o detiene la producción",
      "El procedimiento termina en un borrador para revisión; presentar ante un tribunal es otra actuación",
    ],
    nota:
      "GIRO. El sistema puede encontrar campos incompletos, información contradictoria o pedidos que exceden la finalidad prevista: debe solicitar intervención o detenerse.\n\nEl procedimiento termina con un borrador disponible para revisión profesional. La presentación electrónica ante un tribunal es una actuación distinta que requeriría controles adicionales.\n\nTransición: «Cuando empezamos a generar documentos con mayor facilidad, también necesitamos revisar de otra manera su calidad».",
  },

  // ─── BLOQUE V · Control, sesgos y responsabilidad (80–90) ───────────────────────────────
  {
    t: "placa",
    num: 22,
    titulo: "Que suene jurídico no alcanza.",
    bajada: "Fidelidad, respaldo y coherencia.",
    bloque: 4,
    minuto: "80–84",
    cuerpo: "calidad",
    pasos: 2,
    lineas: [
      "Antecedentes, consistencia del argumento, fuentes normativas y jurisprudenciales",
      "Atribuciones, importes, fechas y correspondencia entre fundamentos y petición",
      "En una plantilla: verificar campos y condiciones; en un escrito argumentativo: la relación entre afirmaciones y fundamentos",
    ],
    nota:
      "Un escrito puede tener estructura ordenada y sintaxis correcta y responder mal al encargo. Controles: antecedentes, consistencia, fuentes, atribuciones, importes, fechas, correspondencia entre fundamentos y petición.\n\nCompará (→) el primer borrador de la demostración 1 con la versión corregida: importe inventado, inferencia presentada como hecho, calificación de mala fe sin respaldo.\n\nLa intensidad de la revisión se adecua al procedimiento: en una plantilla, campos y condiciones de generación; en un documento argumentativo, la relación entre afirmaciones y fundamentos.\n\nTransición: «El control no termina en lo que aparece escrito. También importa cómo se produjo el documento».",
  },
  {
    t: "placa",
    num: 23,
    titulo: "El costo oculto de un borrador rápido.",
    bajada: "Sesgos, confidencialidad y correcciones.",
    bloque: 4,
    minuto: "84–87",
    cuerpo: "costo",
    pasos: 2,
    lineas: [
      "La herramienta puede introducir sesgos, reforzar una posición sin examinar alternativas o agregar afirmaciones no respaldadas",
      "Información personal y confidencial: seleccionar los datos según la finalidad y el entorno tecnológico",
      "La eficiencia se mide por el esfuerzo total: preparar, revisar y corregir",
    ],
    nota:
      "Riesgos del procedimiento: sesgos (la IA «le da la razón» a quien pregunta: pedile que contestara «fuerte» y lo hará), refuerzo de una posición sin alternativas, afirmaciones no respaldadas.\n\nConfidencialidad: qué datos personales y confidenciales usamos, según la finalidad y las condiciones de la herramienta (cuenta personal vs. entorno institucional). En la clase usamos un caso ficticio por eso.\n\nCon →: dos procesos. La generación rápida parece barata hasta que se suma la corrección. La eficiencia se mide por el esfuerzo total.\n\nTransición: «Volvamos ahora al primer escrito que generamos al comenzar».",
  },
  {
    t: "placa",
    num: 24,
    titulo: "No delegamos la decisión. Rediseñamos el trabajo.",
    bajada: "La IA redacta mejor cuando el profesional conduce mejor.",
    bloque: 4,
    minuto: "87–90",
    cuerpo: "cierre",
    pasos: 2,
    lineas: [
      "Al inicio: un pedido directo, sin contexto ni decisiones previas",
      "Ahora: organizar la información, definir el encargo, controlar inferencias, construir argumentos, revisar y automatizar lo repetitivo",
      DG_FRASE_FINAL,
    ],
    nota:
      "Compará el primer pedido con el procedimiento construido: organizar la información, definir el encargo, controlar las inferencias, construir argumentos, revisar críticamente y automatizar lo repetitivo.\n\nRecuperá las seis visualizaciones de la sala (están en la placa) como evidencia del recorrido.\n\nVolvé a la pregunta: la cuestión no es permitir o impedir que la IA redacte, sino diseñar procedimientos adecuados a cada tarea, con distintos grados de autonomía y control.\n\nFrase final (→): «La inteligencia artificial puede escribir cada vez más. Nuestro desafío es aprender a dirigir cada vez mejor aquello que le pedimos escribir».\n\nRecordales que el caso, los prompts, la skill y las herramientas siguen disponibles en el enlace.",
  },
];

export const DG_SLIDES = SLIDES;

/** Nombre corto de una pantalla (grilla y notas). */
export function tituloSlideDg(s: DgSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso de la sala";
    case "placa":
      return `${String(s.num).padStart(2, "0")} · ${s.titulo}`;
    case "actividad": {
      const a = getDgActividad(s.activa);
      return `● Experiencia ${a?.numero} · ${a?.titulo}`;
    }
    case "demo":
      return `▶ Demostración · ${s.demo === "d3b" ? "Estilo sin cambiar el significado" : demoTitulo(s.demo)}`;
    case "skill":
      return `🧰 ${s.titulo}`;
  }
}

const DEMO_TITULOS: Record<string, string> = {
  d1: "El pedido insuficiente",
  d2: "La redacción con intervención humana",
  d3: "Construir y atacar el argumento",
  d4: "Del formulario al borrador",
};
const demoTitulo = (id: string) => DEMO_TITULOS[id] ?? "";

export function pasosSlideDg(s: DgSlide | undefined): number {
  return s?.t === "placa" ? s.pasos : 0;
}

export const DG_CONFIG: ClaseVivoConfig = {
  slug: DG_SLUG,
  titulo: DG_TITULO_CORTO,
  materia: `${DG_INSTITUCION} · ${DG_TITULO}`,
  autor: DG_DOCENTE,
  cargo: "Clase sincrónica",
  poll: { alumno: 3000, alumnoMe: 20000, deck: 2500 },
  getActividad: getDgActividad,
  anonimo: true,
};
