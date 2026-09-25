// ============================================================
// Laboratorio de IA · BBVA — Clase inicial (25/09/2026, 15:00).
// Intervención de Marco Rossi: "Antes del prompt está el proceso".
//
// /bbva          → app del participante (celular): elige su área y responde
// /bbva/clase    → presentación (la proyecta Marco; activa cada actividad sola)
// /bbva/control  → control remoto desde el celular de Marco (con ayuda memoria)
//
// Lógica de conducción: PREGUNTA → RESPUESTA DEL GRUPO → VISUALIZACIÓN →
// INTERPRETACIÓN → CONCEPTO → NUEVA PREGUNTA. Las respuestas quedan ocultas
// en la pantalla hasta que Marco toca "Mostrar resultados".
//
// Respuestas: se guardan con el endpoint genérico /api/session/[slug]/respond
// como { activity, item_key, payload: { v } } (v es string o string[]).
// El área de cada participante se guarda como su "name" al unirse.
// ============================================================

export const BBVA_SLUG = "bbva-lab";
export const BBVA_TITLE = "Laboratorio de IA";
export const BBVA_SUBTITLE = "¿En qué parte de mi trabajo tiene sentido la IA?";
export const BBVA_TESIS = "Antes del prompt está el proceso";
export const BBVA_EVENTO = "Laboratorio de IA · BBVA · Clase inicial";
export const BBVA_FECHA = "Viernes 25 de septiembre de 2026";
export const BBVA_AUTOR = "Marco Rossi";
export const BBVA_COAUTOR = "Sebastián Chumbita";
/** Dirección que se muestra para escribir a mano (el QR apunta a la misma). */
export const BBVA_LINK = "taller.rossi-ia.com/bbva";
export const BBVA_URL = "https://taller.rossi-ia.com/bbva";
export const BBVA_QR = "/bbva/qr.svg";
export const BBVA_LOGO = "/bbva/logo-bbva.png";

// --- Áreas (se eligen al entrar; no se pide nombre) --------------------------

export type AreaId = "comercial" | "operaciones" | "riesgos" | "it" | "ia" | "otro";

export interface Area {
  id: AreaId;
  label: string;
  corto: string;
  emoji: string;
}

export const BBVA_AREAS: Area[] = [
  { id: "comercial", label: "Comercial / Atención", corto: "Comercial", emoji: "🤝" },
  { id: "operaciones", label: "Operaciones", corto: "Operaciones", emoji: "⚙️" },
  { id: "riesgos", label: "Riesgos", corto: "Riesgos", emoji: "🛡️" },
  { id: "it", label: "Tecnología / IT", corto: "IT", emoji: "💻" },
  { id: "ia", label: "IA / Procesos", corto: "IA / Procesos", emoji: "🧭" },
  { id: "otro", label: "Otro", corto: "Otro", emoji: "✳️" },
];

export function getArea(id: string | null | undefined): Area | undefined {
  return BBVA_AREAS.find((a) => a.id === id);
}

// --- Actividades ---------------------------------------------------------------

export type BbvaActivityKey = "bbva_a1" | "bbva_a2" | "bbva_a3" | "bbva_a4" | "bbva_a5";

export interface Opcion {
  id: string;
  label: string;
  /** Texto más largo para el celular (opcional). */
  detalle?: string;
}

/** Un ítem = una pregunta o un caso dentro de la actividad (item_key de la respuesta). */
export interface Item {
  id: string;
  /** Enunciado del caso / pregunta. */
  texto: string;
  /** Rótulo corto para la pantalla (ej.: "Caso 1"). */
  rotulo?: string;
  opciones: Opcion[];
  /** Cuántas opciones se pueden elegir (1 = una sola; >1 = hasta N). */
  max: number;
}

export interface ActividadBbva {
  key: BbvaActivityKey;
  numero: number;
  nombre: string;
  /** Lo que se lee grande en el celular y en la placa. */
  pregunta: string;
  consigna: string;
  items: Item[];
  /** Nombre de la visualización colectiva. */
  resultado: string;
}

const SND: Opcion[] = [
  { id: "si", label: "Sí" },
  { id: "no", label: "No" },
  { id: "depende", label: "Depende" },
];

const TECNO: Opcion[] = [
  { id: "chatbot", label: "Chatbot" },
  { id: "automatizacion", label: "Automatización" },
  { id: "agente", label: "Agente" },
  { id: "falta_info", label: "No alcanza la información" },
];

export const BBVA_ACTIVIDADES: ActividadBbva[] = [
  {
    key: "bbva_a1",
    numero: 1,
    nombre: "Nube de operaciones",
    pregunta: "En un día normal, ¿qué hacés más?",
    consigna: "Elegí hasta tres.",
    resultado: "La nube del grupo",
    items: [
      {
        id: "ops",
        texto: "En un día normal, ¿qué hacés más?",
        max: 3,
        opciones: [
          { id: "leer", label: "Leer" },
          { id: "buscar", label: "Buscar" },
          { id: "comparar", label: "Comparar" },
          { id: "responder", label: "Responder" },
          { id: "clasificar", label: "Clasificar" },
          { id: "revisar", label: "Revisar" },
          { id: "decidir", label: "Decidir" },
          { id: "redactar", label: "Redactar" },
          { id: "resolver", label: "Resolver problemas" },
          { id: "atender", label: "Atender personas" },
          { id: "programar", label: "Programar" },
          { id: "controlar", label: "Controlar" },
          { id: "derivar", label: "Derivar" },
          { id: "analizar", label: "Analizar datos" },
        ],
      },
    ],
  },
  {
    key: "bbva_a2",
    numero: 2,
    nombre: "¿Se lo darías a una IA?",
    pregunta: "¿Esto se lo darías a una IA?",
    consigna: "Cinco situaciones. Sí, no o depende.",
    resultado: "Sí · No · Depende, caso por caso",
    items: [
      { id: "c1", rotulo: "Caso 1", texto: "Preparar un resumen de un incidente de IT.", opciones: SND, max: 1 },
      { id: "c2", rotulo: "Caso 2", texto: "Clasificar el motivo de una consulta de un cliente.", opciones: SND, max: 1 },
      {
        id: "c3",
        rotulo: "Caso 3",
        texto: "Comparar información de una solicitud con determinados criterios de riesgo.",
        opciones: SND,
        max: 1,
      },
      { id: "c4", rotulo: "Caso 4", texto: "Redactar una primera respuesta comercial personalizada.", opciones: SND, max: 1 },
      { id: "c5", rotulo: "Caso 5", texto: "Decidir definitivamente si aprobar una operación.", opciones: SND, max: 1 },
    ],
  },
  {
    key: "bbva_a3",
    numero: 3,
    nombre: "¿Hasta dónde la dejarías llegar?",
    pregunta: "Llega una consulta o reclamo de un cliente. ¿Hasta dónde dejarías actuar automáticamente al sistema?",
    consigna: "Tocá el último paso que permitirías sin intervención humana.",
    resultado: "Termómetro de autonomía",
    items: [
      {
        id: "nivel",
        texto: "¿Hasta dónde dejarías actuar automáticamente al sistema?",
        max: 1,
        opciones: [
          { id: "1", label: "Encontrar información" },
          { id: "2", label: "Analizarla" },
          { id: "3", label: "Preparar una respuesta" },
          { id: "4", label: "Enviar la respuesta" },
          { id: "5", label: "Resolver el caso sin revisión" },
        ],
      },
    ],
  },
  {
    key: "bbva_a4",
    numero: 4,
    nombre: "¿Qué tecnología necesitás?",
    pregunta: "¿Qué tecnología necesitás?",
    consigna: "Cuatro pedidos. Elegí una opción para cada uno.",
    resultado: "Chatbot · Automatización · Agente · Falta información",
    items: [
      { id: "c1", rotulo: "Caso 1", texto: "“Quiero ayuda para redactar mejor un mail difícil.”", opciones: TECNO, max: 1 },
      {
        id: "c2",
        rotulo: "Caso 2",
        texto: "“Cada vez que llega determinado tipo de solicitud quiero clasificarla y enviarla automáticamente al sector correspondiente.”",
        opciones: TECNO,
        max: 1,
      },
      {
        id: "c3",
        rotulo: "Caso 3",
        texto: "“Quiero que un sistema reciba un caso, determine qué información necesita, consulte fuentes autorizadas, detecte faltantes y prepare una propuesta para revisión.”",
        opciones: TECNO,
        max: 1,
      },
      { id: "c4", rotulo: "Caso 4", texto: "“Quiero mejorar la atención de consultas frecuentes de clientes.”", opciones: TECNO, max: 1 },
    ],
  },
  {
    key: "bbva_a5",
    numero: 5,
    nombre: "Encontrá tu candidato",
    pregunta: "Pensá en algo de tu trabajo que hacés todas las semanas.",
    consigna: "Cuatro preguntas. Al final, tu tarjeta.",
    resultado: "El mapa del grupo",
    items: [
      {
        id: "q1",
        rotulo: "Lo que molesta",
        texto: "¿Qué te molesta de ese proceso?",
        max: 1,
        opciones: [
          { id: "tiempo", label: "Consume tiempo" },
          { id: "repetitivo", label: "Es repetitivo" },
          { id: "buscar", label: "Tengo que buscar mucha información" },
          { id: "pasos", label: "Tiene demasiados pasos" },
          { id: "parecidas", label: "Genero siempre cosas parecidas" },
          { id: "revisar", label: "Tengo que revisar mucho" },
          { id: "casos", label: "Hay muchos casos para analizar" },
        ],
      },
      {
        id: "q2",
        rotulo: "La operación",
        texto: "¿Qué hacés principalmente?",
        max: 1,
        opciones: [
          { id: "buscar", label: "Buscar" },
          { id: "clasificar", label: "Clasificar" },
          { id: "comparar", label: "Comparar" },
          { id: "analizar", label: "Analizar" },
          { id: "redactar", label: "Redactar" },
          { id: "controlar", label: "Controlar" },
          { id: "decidir", label: "Decidir" },
          { id: "responder", label: "Responder" },
        ],
      },
      {
        id: "q3",
        rotulo: "La autonomía",
        texto: "Si incorporaras IA, ¿qué preferirías que hiciera?",
        max: 1,
        opciones: [
          { id: "ayude", label: "Me ayude" },
          { id: "prepare", label: "Prepare algo para que yo lo revise" },
          { id: "recomiende", label: "Me recomiende qué hacer" },
          { id: "ejecute", label: "Ejecute algunos pasos" },
          { id: "casi_todo", label: "Haga casi todo salvo excepciones" },
        ],
      },
      {
        id: "q4",
        rotulo: "La frecuencia",
        texto: "¿Con qué frecuencia ocurre?",
        max: 1,
        opciones: [
          { id: "diario", label: "Todos los días" },
          { id: "varias", label: "Varias veces por semana" },
          { id: "semanal", label: "Semanalmente" },
          { id: "ocasional", label: "Ocasionalmente" },
        ],
      },
    ],
  },
];

/** item_key donde la actividad 5 guarda el texto libre de la hipótesis (opcional). */
export const HIPOTESIS_ITEM = "hipotesis";

export function getActividadBbva(key: string | null | undefined): ActividadBbva | undefined {
  return BBVA_ACTIVIDADES.find((a) => a.key === key);
}

export function labelOpcion(act: ActividadBbva, itemId: string, opcionId: string): string {
  return act.items.find((i) => i.id === itemId)?.opciones.find((o) => o.id === opcionId)?.label ?? opcionId;
}

// --- La tarjeta del candidato (actividad 5) ------------------------------------
// Se arma sin IA, con reglas fijas: no afirma que sea el proyecto correcto,
// señala una dirección para explorar.

const MOLESTIA: Record<string, string> = {
  tiempo: "consume mucho tiempo",
  repetitivo: "se repite una y otra vez",
  buscar: "te obliga a buscar mucha información",
  pasos: "tiene demasiados pasos",
  parecidas: "te hace producir siempre cosas parecidas",
  revisar: "te exige revisar mucho",
  casos: "junta muchos casos para analizar",
};

const OPERACION: Record<string, string> = {
  buscar: "BUSCÁS INFORMACIÓN",
  clasificar: "CLASIFICÁS CASOS",
  comparar: "COMPARÁS INFORMACIÓN",
  analizar: "ANALIZÁS DATOS",
  redactar: "REDACTÁS",
  controlar: "CONTROLÁS",
  decidir: "PREPARÁS O TOMÁS DECISIONES",
  responder: "RESPONDÉS",
};

const PREFERENCIA: Record<string, string> = {
  ayude: "AYUDARTE MIENTRAS TRABAJÁS",
  prepare: "PREPARAR UN BORRADOR O ANÁLISIS PARA TU REVISIÓN",
  recomiende: "RECOMENDARTE QUÉ HACER, CON SUS RAZONES",
  ejecute: "EJECUTAR ALGUNOS PASOS DEL PROCESO",
  casi_todo: "HACER CASI TODO Y DETENERSE EN LAS EXCEPCIONES",
};

const FRECUENCIA: Record<string, string> = {
  diario: "que ocurre todos los días",
  varias: "que ocurre varias veces por semana",
  semanal: "que ocurre todas las semanas",
  ocasional: "que ocurre ocasionalmente",
};

/** Lo que la persona conserva, según lo que elige delegar. */
const HUMANO: Record<string, string> = {
  ayude: "el trabajo y la decisión",
  prepare: "la revisión y la versión final",
  recomiende: "la decisión",
  ejecute: "la aprobación de cada paso sensible",
  casi_todo: "las excepciones y la supervisión del resultado",
};

export interface TarjetaCandidato {
  titulo: string;
  busca: string;
  hipotesis: string;
  humano: string;
  siguiente: string;
  aviso?: string;
  /** Borrador de la fórmula "Cuando ocurre… / actualmente tengo que…". */
  formula: { cuando: string; tengo: string; requiere: string; ayudar: string; humano: string };
}

export function armarTarjeta(r: Record<string, string | undefined>): TarjetaCandidato {
  const q1 = r.q1 ?? "tiempo";
  const q2 = r.q2 ?? "buscar";
  const q3 = r.q3 ?? "prepare";
  const q4 = r.q4 ?? "semanal";
  const ocasional = q4 === "ocasional";
  const autonomiaAlta = q3 === "casi_todo" || q3 === "ejecute";
  return {
    titulo: ocasional ? "Tenés una pista" : "Tenés un candidato",
    busca: `Buscá un proceso ${FRECUENCIA[q4]} en el que hoy ${OPERACION[q2]} y que ${MOLESTIA[q1]}.`,
    hipotesis: `Tu primera hipótesis puede ser usar IA para ${PREFERENCIA[q3]}.`,
    humano: `Bajo intervención humana: ${HUMANO[q3]}.`,
    siguiente: "Elegí un caso real de ese proceso.",
    aviso: ocasional
      ? "Si ocurre pocas veces, quizás no justifique el esfuerzo: fijate si hay otro parecido que sea más frecuente."
      : autonomiaAlta
        ? "Mucha autonomía exige poder verificar el resultado y saber qué pasa si se equivoca. Empezá por un tramo chico."
        : undefined,
    formula: {
      cuando: "",
      tengo: OPERACION[q2].toLowerCase(),
      requiere: MOLESTIA[q1],
      ayudar: PREFERENCIA[q3].toLowerCase(),
      humano: HUMANO[q3],
    },
  };
}

// --- Resultados (lo que devuelve /api/bbva/resultados) ---------------------------

export type Conteo = Record<string, number>;

export interface ResultadosBbva {
  /** Actividad consultada (o "lobby" para el ingreso). */
  activity: string;
  /** Actividad que está activa ahora en la sesión. */
  actual: string;
  /** Personas conectadas en total. */
  participantes: number;
  /** Personas conectadas por área (AreaId → cantidad). */
  porArea: Conteo;
  /** Personas distintas que respondieron algo en esta actividad. */
  respondieron: number;
  /** item_key → cantidad de personas que respondieron ese ítem. */
  respondieronItem: Conteo;
  /** item_key → opción → cantidad. */
  items: Record<string, Conteo>;
  /** AreaId → item_key → opción → cantidad. */
  itemsPorArea: Record<string, Record<string, Conteo>>;
  /** Solo con la cookie docente y en la actividad 5: las hipótesis escritas. */
  hipotesis?: { area: string; texto: string }[];
}

// --- Placas ----------------------------------------------------------------------

/** Identificadores de ilustración (components/bbva/ilustraciones.tsx). */
export type IlusId =
  | "p01-escritorio"
  | "p02-credencial"
  | "p03-operaciones"
  | "p04-repeticion"
  | "p05-sino"
  | "p06-depende"
  | "p08-errores"
  | "p09-lupa"
  | "p10-espectro"
  | "p11-humano"
  | "p12-desarme"
  | "p13-reclamo"
  | "p14-anatomia"
  | "p15-donde-ia"
  | "p16-tres-formas"
  | "p17-autonomia"
  | "p19-desarma"
  | "p20-escritorio-ordenado";

export type Bloque =
  | "Apertura"
  | "¿Qué hacemos realmente?"
  | "¿Qué estamos dispuestos a delegar?"
  | "¿Hasta dónde puede avanzar la IA?"
  | "¿Cómo se desarma un proceso?"
  | "¿Qué tipo de solución necesitamos?"
  | "¿Qué proceso de mi trabajo podría transformar?"
  | "Cierre";

interface Base {
  bloque: Bloque;
  /** Ayuda memoria para Marco: solo se ve en el control remoto. */
  nota: string;
}

export interface SlidePortada extends Base {
  t: "portada";
}
export interface SlideIngreso extends Base {
  t: "ingreso";
}
/** Placa de contenido (numeradas del 01 al 20). */
export interface SlidePlaca extends Base {
  t: "placa";
  numero: number;
  titulo: string;
  bajada: string;
  ilus?: IlusId;
  /** "lado": título a la izquierda e ilustración a la derecha; "centro": título arriba, ilustración grande abajo; "tipo": solo tipografía gigante. */
  layout: "lado" | "centro" | "tipo";
  /** Si la placa activa una actividad al llegar (la 19 abre la actividad 5). */
  activa?: BbvaActivityKey;
}
/** Placa de curva (07, 12, 18): texto circular = frenar, sintetizar, cambiar de dirección. */
export interface SlideCurva extends Base {
  t: "curva";
  numero: number;
  titulo: string;
  bajada: string;
  /** Texto que gira alrededor. */
  anillo: string;
  /** Palabra o fórmula del centro. */
  centro: string;
  ilus?: IlusId;
  /** De qué a qué gira la clase. */
  de: string;
  a: string;
}
/** Placa de actividad: pregunta + contador en vivo; resultados a pedido. */
export interface SlideActividad extends Base {
  t: "actividad";
  activa: BbvaActivityKey;
}
/** Resultado colectivo de una actividad ya abierta (ej.: el mapa del grupo). */
export interface SlideResultado extends Base {
  t: "resultado";
  de: BbvaActivityKey;
  titulo: string;
  bajada: string;
}
export interface SlideCierre extends Base {
  t: "cierre";
}

export type SlideBbva = SlidePortada | SlideIngreso | SlidePlaca | SlideCurva | SlideActividad | SlideResultado | SlideCierre;

export const BBVA_SLIDES: SlideBbva[] = [
  {
    t: "portada",
    bloque: "Apertura",
    nota: "Chumbita mostró CÓMO trabajar con la IA. Mi pregunta es otra: ¿DÓNDE tiene sentido usarla en nuestro trabajo? No vengo a hablar de herramientas: vengo a hablar de su trabajo.",
  },
  {
    t: "ingreso",
    bloque: "Apertura",
    nota: "Un solo QR para toda la hora: no hay que volver a escanear. Solo eligen su área, sin nombre. Esperar a que la mayoría entre. Comentar la mezcla de áreas que va apareciendo.",
  },
  {
    t: "placa",
    numero: 1,
    bloque: "¿Qué hacemos realmente?",
    titulo: "¿Qué hiciste ayer?",
    bajada: "No tu puesto. Tu trabajo.",
    ilus: "p01-escritorio",
    layout: "lado",
    nota: "No empiezo por la IA. Pregunto: ¿qué hicieron ayer? ¿Qué información recibieron? ¿Qué buscaron, compararon, decidieron, redactaron, verificaron? ¿Qué le pasaron a otra persona? ¿Qué repitieron varias veces? Pedir 2 o 3 respuestas en voz alta.",
  },
  {
    t: "placa",
    numero: 2,
    bloque: "¿Qué hacemos realmente?",
    titulo: "Tu cargo no me sirve",
    bajada: "Decime qué hacés.",
    ilus: "p02-credencial",
    layout: "lado",
    nota: "Riesgos, sistemas, operaciones, comercial… Eso es el cargo. Me interesan los verbos: leer, buscar, comparar, responder, revisar, decidir, clasificar. La IA rara vez reemplaza un puesto: interviene en operaciones.",
  },
  {
    t: "actividad",
    activa: "bbva_a1",
    bloque: "¿Qué hacemos realmente?",
    nota: "ACTIVIDAD 1 (1 min). Hasta tres botones, sin escribir. Mirar el contador. Cuando la mayoría respondió: MOSTRAR RESULTADOS. Frase: \"En la lista parecían veinte trabajos distintos. Cuando miramos qué hacen, aparecen un montón de operaciones compartidas.\"",
  },
  {
    t: "placa",
    numero: 3,
    bloque: "¿Qué hacemos realmente?",
    titulo: "Trabajos distintos. Operaciones parecidas.",
    bajada: "Leer · buscar · comparar · clasificar · decidir · redactar.",
    ilus: "p03-operaciones",
    layout: "centro",
    nota: "Ponerle nombre a lo que mostró la nube: las áreas están alrededor, las operaciones compartidas en el centro (son las que eligieron ustedes). De puestos de trabajo a operaciones dentro de procesos.",
  },
  {
    t: "placa",
    numero: 4,
    bloque: "¿Qué estamos dispuestos a delegar?",
    titulo: "¿Dónde perdés tiempo?",
    bajada: "Repetir también es información.",
    ilus: "p04-repeticion",
    layout: "lado",
    nota: "Copiar y pegar, mails parecidos, documentos semejantes, la misma búsqueda todas las semanas. Lo que se repite no es solo cansancio: es una señal de que ahí hay un patrón. Y donde hay patrón, puede haber intervención.",
  },
  {
    t: "placa",
    numero: 5,
    bloque: "¿Qué estamos dispuestos a delegar?",
    titulo: "¿Esto se lo darías a una IA?",
    bajada: "Sí · No · Depende.",
    ilus: "p05-sino",
    layout: "tipo",
    nota: "Placa limpia. Anuncio: les voy a mostrar cinco situaciones. Solo tres botones. Respondan rápido, sin pensar demasiado.",
  },
  {
    t: "actividad",
    activa: "bbva_a2",
    bloque: "¿Qué estamos dispuestos a delegar?",
    nota: "ACTIVIDAD 2 (1-2 min). Cinco casos seguidos en el celular. No busco quién tiene razón: busco mostrar que la aceptación cambia según la naturaleza de la tarea. Mostrar resultados y mirar dónde crece el DEPENDE (sin anticiparlo: la placa 06 lo trae marcado).",
  },
  {
    t: "placa",
    numero: 6,
    bloque: "¿Qué estamos dispuestos a delegar?",
    titulo: "“Depende” es la respuesta interesante",
    bajada: "¿De qué depende?",
    ilus: "p06-depende",
    layout: "lado",
    nota: "Preguntar: ¿por qué aceptaron IA para algunas cosas y no para otras? Dejar que aparezcan solos: riesgo, error, control, sensibilidad, responsabilidad, posibilidad de revisión. Tocar cada criterio cuando lo nombre alguien.",
  },
  {
    t: "curva",
    numero: 7,
    bloque: "¿Qué estamos dispuestos a delegar?",
    titulo: "Poder ≠ convenir",
    bajada: "Que pueda hacerlo no significa que debamos delegarlo.",
    anillo: "Que pueda hacerlo no significa que debamos delegarlo · ",
    centro: "PODER ≠ CONVENIR",
    de: "¿Qué puede hacer la IA?",
    a: "¿Qué conviene delegarle?",
    nota: "CURVA 1 · FRENAR. Síntesis: hasta ahora preguntamos \"¿puede hacerlo una IA?\". Ahora cambia la pregunta: \"¿conviene que lo haga?\". Pausa. Recién después, avanzar.",
  },
  {
    t: "placa",
    numero: 8,
    bloque: "¿Hasta dónde puede avanzar la IA?",
    titulo: "¿Qué pasa si se equivoca?",
    bajada: "No todos los errores cuestan lo mismo.",
    ilus: "p08-errores",
    layout: "lado",
    nota: "Costo del error y reversibilidad. Un borrador mal escrito se corrige en un minuto. Una operación aprobada por error produce una consecuencia real. ¿El error es fácilmente reversible?",
  },
  {
    t: "placa",
    numero: 9,
    bloque: "¿Hasta dónde puede avanzar la IA?",
    titulo: "¿Podés revisar el resultado?",
    bajada: "Automatizar algo que nadie puede controlar es otra decisión.",
    ilus: "p09-lupa",
    layout: "lado",
    nota: "Verificabilidad. Si el resultado se puede revisar, puedo delegar más. Si nadie puede controlarlo, o el proceso necesita explicar por qué se llegó a ese resultado, la decisión es otra.",
  },
  {
    t: "actividad",
    activa: "bbva_a3",
    bloque: "¿Hasta dónde puede avanzar la IA?",
    nota: "ACTIVIDAD 3 (1 min). Llega un reclamo: ¿hasta qué paso lo dejarías avanzar solo? Mostrar resultados: el termómetro. Si sirve, tocar POR ÁREA (no suponer de antemano qué área es más proclive: se descubre acá). La discusión no es humano/IA: es hasta dónde avanza antes de necesitar a una persona.",
  },
  {
    t: "placa",
    numero: 10,
    bloque: "¿Hasta dónde puede avanzar la IA?",
    titulo: "No es humano o máquina",
    bajada: "Hay muchas cosas en el medio.",
    ilus: "p10-espectro",
    layout: "centro",
    nota: "Asiste, prepara, propone, ejecuta. No es una escala científica: son grados posibles de delegación. Puede detenerse ante una excepción, pedir aprobación o actuar solo dentro de ciertos límites.",
  },
  {
    t: "placa",
    numero: 11,
    bloque: "¿Hasta dónde puede avanzar la IA?",
    titulo: "¿Dónde querés seguir estando vos?",
    bajada: "Human in the loop es una decisión de diseño.",
    ilus: "p11-humano",
    layout: "centro",
    nota: "No solo \"¿dónde necesito un humano porque la IA no puede?\", también \"¿dónde QUIERO conservarlo aunque pudiera automatizar más?\". Automatizar no es eliminar a la persona: cambia qué hace. De recopilar a verificar. De redactar a revisar. De clasificar todo a atender excepciones.",
  },
  {
    t: "curva",
    numero: 12,
    bloque: "¿Cómo se desarma un proceso?",
    titulo: "Primero, rompé la tarea",
    bajada: "Una tarea grande esconde muchas tareas pequeñas.",
    anillo: "Una tarea grande esconde muchas tareas pequeñas · ",
    centro: "ROMPÉ LA TAREA",
    ilus: "p12-desarme",
    de: "Evaluar tareas",
    a: "Desarmar procesos",
    nota: "CURVA 2 · FRENAR. Hasta ahora evaluamos qué cosas podrían delegarse. Ahora hay que aprender a mirar el trabajo de otra manera: DE LA TAREA AL PROCESO.",
  },
  {
    t: "placa",
    numero: 13,
    bloque: "¿Cómo se desarma un proceso?",
    titulo: "“Responder un reclamo” no es una tarea",
    bajada: "Es un proceso.",
    ilus: "p13-reclamo",
    layout: "centro",
    nota: "Recibir, identificar, buscar, comparar, decidir, responder, registrar. Detrás de una actividad aparentemente única hay muchas operaciones distintas. Eso permite que la IA intervenga en algunas sin intervenir en todas.",
  },
  {
    t: "placa",
    numero: 14,
    bloque: "¿Cómo se desarma un proceso?",
    titulo: "Todo proceso tiene una anatomía",
    bajada: "Entrada → operaciones → decisiones → salida.",
    ilus: "p14-anatomia",
    layout: "centro",
    nota: "Herramienta mental reutilizable. ENTRADA: ¿qué recibo? OPERACIONES: ¿qué hago? DECISIONES: ¿dónde necesito criterio? SALIDA: ¿qué produzco? Y ¿quién usa ese resultado?",
  },
  {
    t: "placa",
    numero: 15,
    bloque: "¿Cómo se desarma un proceso?",
    titulo: "¿Dónde entra la IA?",
    bajada: "No necesariamente en todo.",
    ilus: "p15-donde-ia",
    layout: "centro",
    nota: "Mismo flujo del reclamo. Primero se representa el proceso; después se incorpora la tecnología. Algunos nodos son candidatos a IA, otros quedan humanos, otros son cooperación. Revelar las marcas de a una.",
  },
  {
    t: "placa",
    numero: 16,
    bloque: "¿Qué tipo de solución necesitamos?",
    titulo: "Una necesidad. Tres formas.",
    bajada: "Chatbot · Automatización · Agente.",
    ilus: "p16-tres-formas",
    layout: "centro",
    nota: "Mismo reclamo, tres arquitecturas. CHATBOT: la persona pregunta, la IA responde. AUTOMATIZACIÓN: ocurre un evento y se ejecutan acciones prediseñadas. AGENTE: recibe un objetivo y decide qué pasos dar. La diferencia clave no es tecnológica: es el GRADO DE AUTONOMÍA.",
  },
  {
    t: "actividad",
    activa: "bbva_a4",
    bloque: "¿Qué tipo de solución necesitamos?",
    nota: "ACTIVIDAD 4 (1-2 min). Los tres primeros casos explican las diferencias. El cuarto es ambiguo a propósito: la respuesta más interesante es NO ALCANZA LA INFORMACIÓN. No sabemos cómo funciona hoy ese proceso, qué parte se quiere transformar ni cuánta autonomía hace falta.",
  },
  {
    t: "placa",
    numero: 17,
    bloque: "¿Qué tipo de solución necesitamos?",
    titulo: "¿Cuánta autonomía le das?",
    bajada: "La diferencia no es sólo qué hace. Es cuánto decide.",
    ilus: "p17-autonomia",
    layout: "centro",
    nota: "Mover el control: asiste, prepara, propone, actúa. En cada punto, ¿dónde ponemos el control humano? Sin tecnicismos.",
  },
  {
    t: "curva",
    numero: 18,
    bloque: "¿Qué tipo de solución necesitamos?",
    titulo: "No necesitás un agente",
    bajada: "Necesitás resolver un problema.",
    anillo: "No necesitás un agente · Necesitás resolver un problema · ",
    centro: "PROBLEMA",
    de: "Elegir tecnologías",
    a: "Volver al problema",
    nota: "CURVA 3 · FRENAR. Cerrar la parte tecnológica. Evitar el fetiche de lo complejo porque está de moda. Un problema puede pedir un buen prompt, un asistente, una automatización, integrar herramientas… y solo algunos, un agente. El éxito es resolver mejor el problema.",
  },
  {
    t: "placa",
    numero: 19,
    bloque: "¿Qué proceso de mi trabajo podría transformar?",
    titulo: "Ahora desarmá tu trabajo",
    bajada: "Elegí algo real. Algo que hagas.",
    ilus: "p19-desarma",
    layout: "lado",
    activa: "bbva_a5",
    nota: "ACTIVIDAD 5 (3-4 min) — se abre sola en esta placa. Pensar en algo que hacen todas las semanas. Cuatro preguntas con botones y reciben su tarjeta. Dejar esta placa proyectada mientras responden. Invitar a completar la hipótesis y guardarla: es el punto de partida del proyecto.",
  },
  {
    t: "resultado",
    de: "bbva_a5",
    bloque: "¿Qué proceso de mi trabajo podría transformar?",
    titulo: "El mapa del grupo",
    bajada: "Qué nos molesta, qué hacemos, cuánta autonomía queremos y cada cuánto pasa.",
    nota: "Mostrar resultados cuando la mayoría tenga su tarjeta. Leer el mapa: qué problemas se repiten, qué operaciones quieren intervenir, qué grado de autonomía prefieren para empezar, qué tan frecuentes son los procesos. Todo sale de sus respuestas reales.",
  },
  {
    t: "placa",
    numero: 20,
    bloque: "Cierre",
    titulo: "Antes del prompt está el proceso",
    bajada: "Primero entendé qué querés transformar.",
    ilus: "p20-escritorio-ordenado",
    layout: "lado",
    nota: "\"Hace una hora les pregunté qué hicieron ayer. Nada de eso cambió: siguen siendo los mismos mails, documentos, consultas, incidentes, planillas y decisiones. Lo que cambió es cómo podemos mirarlos. Donde veíamos tareas, ahora vemos entradas, operaciones, decisiones, excepciones y resultados. Y recién cuando vemos el proceso podemos decidir dónde tiene sentido poner IA.\"",
  },
  {
    t: "cierre",
    bloque: "Cierre",
    nota: "Lo que queda deliberadamente incompleto: hoy saben QUÉ quieren intervenir, todavía no CÓMO. Próximo encuentro: convertir ese problema en un asistente especializado. Tarea: traer un caso real del candidato.",
  },
];

/** Nombre corto de una placa (índice del control remoto y del celular). */
export function tituloSlide(s: SlideBbva): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso con QR";
    case "placa":
    case "curva":
      return `${String(s.numero).padStart(2, "0")} · ${s.titulo}${s.t === "curva" ? " ↻" : ""}`;
    case "actividad": {
      const a = getActividadBbva(s.activa);
      return `Actividad ${a?.numero ?? ""} · ${a?.nombre ?? ""}`;
    }
    case "resultado":
      return `Resultado · ${s.titulo}`;
    case "cierre":
      return "Lo que sigue";
  }
}

/** Actividad que abre una placa al llegar (o undefined si no abre ninguna). */
export function actividadDeSlide(s: SlideBbva): BbvaActivityKey | undefined {
  if (s.t === "actividad") return s.activa;
  if (s.t === "placa") return s.activa;
  return undefined;
}

/** Actividad cuyos resultados muestra la placa (actividad o resultado). */
export function resultadosDeSlide(s: SlideBbva): BbvaActivityKey | undefined {
  if (s.t === "actividad") return s.activa;
  if (s.t === "resultado") return s.de;
  return undefined;
}

/** Recorrido del programa (placa de cierre). */
export const BBVA_RECORRIDO = [
  { etapa: "Clase inicial", pregunta: "¿Qué parte de mi trabajo quiero transformar?", hoy: true },
  { etapa: "Clase de construcción", pregunta: "¿Cómo convierto ese problema en un asistente especializado?", hoy: false },
  { etapa: "Desarrollo posterior", pregunta: "¿Cómo lo pruebo, corrijo, integro y eventualmente aumento su autonomía?", hoy: false },
  { etapa: "Proyecto final", pregunta: "¿La solución realmente mejora el proceso que originalmente quería transformar?", hoy: false },
];

/** La fórmula de la hipótesis (placa 19 y tarjeta del celular). */
export const BBVA_FORMULA = [
  { id: "cuando", antes: "Cuando ocurre", placeholder: "llega una solicitud de…" },
  { id: "tengo", antes: "actualmente tengo que", placeholder: "revisar a mano distintas fuentes…" },
  { id: "requiere", antes: "Esto requiere", placeholder: "buscar, comparar, completar…" },
  { id: "ayudar", antes: "Me gustaría explorar si un sistema de IA puede ayudarme a", placeholder: "hacer una primera revisión…" },
  { id: "humano", antes: "manteniendo bajo intervención humana", placeholder: "la decisión final" },
] as const;
