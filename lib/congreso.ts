// ============================================================
// Congreso de Inteligencia Artificial · Facultad de Derecho y Ciencias
// Sociales · UNT. Ponencia de Marco Rossi: "Vibe coding para abogados".
// Diseño integral: "Congreso IA/DISEÑO INTEGRAL DE PONENCIA_ VIBE CODING PARA ABOGADOS.txt".
//
// Una experiencia con dos pantallas:
//   /congreso          → app del público (celular, sin registro ni nombre)
//   /congreso/clase    → la sala de control proyectada (la placa manda: al
//                        llegar a una interacción, la abre sola en los celulares)
//   /congreso/control  → control remoto en el celular de Marco (guion + resultados)
//   /congreso/demo     → los tres caminos de la demo, versión por versión (plan B)
// En congreso.rossi-ia.com, "/" es el público y "/clase", "/control", "/demo" lo demás.
//
// Respuestas: /api/session/[slug]/respond { activity, item_key, payload: { v } }.
// Resultados agregados: /api/congreso/resultados. Estado para los celulares
// (actividad, placa, versión publicada): /api/congreso/estado.
// ============================================================

export const CONG_SLUG = "congreso-vibe";
export const CONG_TITLE = "Vibe coding para abogados";
export const CONG_PREGUNTA = "¿Qué pasa cuando para crear software ya no hace falta empezar escribiendo código, sino explicando un problema?";
export const CONG_EVENTO = "Congreso de Inteligencia Artificial";
export const CONG_SEDE = "Facultad de Derecho y Ciencias Sociales · UNT";
export const CONG_AUTOR = "Marco Rossi";
/** Dirección que se muestra para escribir a mano (el QR apunta a la misma). */
export const CONG_LINK = "congreso.rossi-ia.com";
export const CONG_URL = "https://congreso.rossi-ia.com";
export const CONG_QR = "/congreso/qr.svg";
/** Botonera de emojis del celular (deben estar en REACCIONES o REACCIONES_EXTRA de lib/clase-vivo.ts). */
export const CONG_REACCIONES = ["👏", "💡", "🤔", "😮", "👍", "🔥"] as const;

// --- Interacciones ---------------------------------------------------------------

export type CongKey = "cong_molestia" | "cong_usar" | "cong_elegir" | "cong_datos" | "cong_intentar";

/**
 * Pregunta de seguimiento de una opción: al elegirla, el celular pide una frase
 * y la pantalla la muestra. Es una capacidad general de la app: cualquier opción
 * puede tenerla con solo agregarle `seguimiento`.
 */
export interface Seguimiento {
  pregunta: string;
  placeholder: string;
  max: number;
}

export interface Opcion {
  id: string;
  label: string;
  /** Texto chico debajo del botón (opcional). */
  detalle?: string;
  seguimiento?: Seguimiento;
}

/** Un ítem = un caso o pregunta dentro de la interacción (su id es el item_key). */
export interface Item {
  id: string;
  texto: string;
  rotulo?: string;
  opciones: Opcion[];
}

interface Base {
  key: CongKey;
  numero: number;
  nombre: string;
  /** Lo que se lee grande en el celular y en la placa. */
  pregunta: string;
  consigna: string;
}

/** Respuesta breve escrita → nube de palabras. */
export interface ActividadTexto extends Base {
  tipo: "texto";
  placeholder: string;
  max: number;
  /** Atajos que completan el campo (no hace falta escribir). */
  sugerencias: string[];
}

/** Botones: uno por ítem. */
export interface ActividadOpciones extends Base {
  tipo: "opciones";
  items: Item[];
}

export type ActividadCong = ActividadTexto | ActividadOpciones;

/** item_key donde se guarda la frase de seguimiento de un ítem. */
export const itemSeguimiento = (itemId: string) => `${itemId}~porque`;

export const CONG_ACTIVIDADES: ActividadCong[] = [
  {
    key: "cong_molestia",
    tipo: "texto",
    numero: 1,
    nombre: "Una molestia",
    pregunta: "Si pudieras construir una pequeña aplicación para resolver UNA molestia de tu trabajo jurídico, ¿qué haría?",
    consigna: "En pocas palabras. Podés tocar una idea y editarla.",
    placeholder: "Que me avise cuando vence un plazo…",
    max: 90,
    sugerencias: [
      "Que me avise los vencimientos de mis causas",
      "Que ordene cronológicamente un expediente",
      "Que busque jurisprudencia sobre mi caso",
      "Que calcule una liquidación",
      "Que me arme un escrito a partir de un modelo",
      "Que me recuerde las audiencias",
    ],
  },
  {
    key: "cong_elegir",
    tipo: "opciones",
    numero: 2,
    nombre: "¿Qué construimos?",
    pregunta: "¿Qué construimos ahora, en vivo?",
    consigna: "Elegí un problema. El más votado lo construimos desde cero.",
    items: [
      {
        id: "caso",
        texto: "¿Qué construimos ahora, en vivo?",
        opciones: [
          { id: "cronologia", label: "A · Reconstruir cronológicamente un expediente" },
          { id: "prueba", label: "B · Vincular hechos controvertidos con la prueba" },
          { id: "entrevista", label: "C · Preparar la entrevista inicial con un cliente" },
        ],
      },
    ],
  },
  {
    key: "cong_datos",
    tipo: "opciones",
    numero: 3,
    nombre: "¿La usarías?",
    pregunta: "La aplicación funciona. ¿Le cargarías ahora mismo información de un expediente real?",
    consigna: "Una sola respuesta.",
    items: [
      {
        id: "q",
        texto: "La aplicación funciona. ¿Le cargarías ahora mismo información de un expediente real?",
        opciones: [
          { id: "si", label: "Sí" },
          { id: "no", label: "No" },
          { id: "depende", label: "Depende" },
        ],
      },
    ],
  },
  {
    key: "cong_intentar",
    tipo: "texto",
    numero: 4,
    nombre: "¿Qué intentarías?",
    pregunta: "Después de ver esto, ¿qué intentarías construir?",
    consigna: "En pocas palabras. Puede ser lo mismo de antes… o no.",
    placeholder: "Una herramienta que…",
    max: 90,
    sugerencias: [
      "Un tablero con los plazos de todas mis causas",
      "Una guía de preguntas para la primera entrevista",
      "Una matriz de hechos y prueba",
      "Un calculador de intereses",
      "Un buscador de mis propios escritos",
      "Nada todavía: primero quiero entender mejor el problema",
    ],
  },
];

export function getActividadCong(key: string | null | undefined): ActividadCong | undefined {
  return CONG_ACTIVIDADES.find((a) => a.key === key);
}

export function labelOpcion(act: ActividadCong | undefined, itemId: string, opcionId: string): string {
  if (!act || act.tipo !== "opciones") return opcionId;
  return act.items.find((i) => i.id === itemId)?.opciones.find((o) => o.id === opcionId)?.label ?? opcionId;
}

/**
 * Plan B del experimento en vivo (placa "Cambiémosla ahora"): si la modificación
 * por lenguaje natural no llega a publicarse, el control la habilita sin deploy
 * (activity_config.seguimiento = true). Es exactamente lo que se le pide a la IA.
 */
export const CONG_PLAN_B = {
  activity: "cong_datos" as CongKey,
  item: "q",
  opcion: "depende",
  seguimiento: {
    pregunta: "¿De qué depende?",
    placeholder: "Depende de dónde se guardan los datos…",
    max: 120,
  } satisfies Seguimiento,
};

/** La instrucción que Marco le da a la IA para cambiar la app que está usando el público. */
export const CONG_INSTRUCCION_EN_VIVO =
  "En la pregunta “¿Le cargarías información de un expediente real?”, cuando una persona elija DEPENDE, permitile escribir en una frase de qué depende, y mostrá esas frases en la pantalla grande. Después publicalo.";

/** La opción con su seguimiento vigente: el del código o, si el plan B está activo, el de CONG_PLAN_B. */
export function seguimientoDe(act: ActividadCong, itemId: string, opcion: Opcion, planB: boolean): Seguimiento | undefined {
  if (opcion.seguimiento) return opcion.seguimiento;
  if (planB && act.key === CONG_PLAN_B.activity && itemId === CONG_PLAN_B.item && opcion.id === CONG_PLAN_B.opcion)
    return CONG_PLAN_B.seguimiento;
  return undefined;
}

// --- Nube de palabras: de frases a problemas ----------------------------------------
// Sin IA y al instante: cada frase se normaliza y se busca en un diccionario
// jurídico (raíces → término). Lo que no entra en ningún término aparece solo
// si lo repiten dos personas o más (así una palabra suelta no copa la pantalla).

export const CONG_TERMINOS: { termino: string; raices: string[] }[] = [
  { termino: "Plazos", raices: ["plazo", "venc", "caduc", "prescrip", "termino", "perentori", "dias habiles"] },
  { termino: "Expedientes", raices: ["expediente", "causa", "juicio", "actuacion", "estado procesal", "cronolog", "mesa de entrada"] },
  { termino: "Jurisprudencia", raices: ["jurisprud", "fallo", "sentencia", "precedente", "doctrina", "antecedente"] },
  { termino: "Prueba", raices: ["prueba", "probator", "testig", "pericia", "perito", "hechos"] },
  { termino: "Contratos", raices: ["contrat", "clausul", "convenio", "acuerdo"] },
  { termino: "Clientes", raices: ["client", "entrevist", "consultante"] },
  { termino: "Audiencias", raices: ["audiencia", "mediac", "conciliac"] },
  { termino: "Liquidaciones", raices: ["liquidac", "calcul", "interes", "indemniz", "actualizac", "monto", "tasa"] },
  { termino: "Escritos", raices: ["escrito", "demanda", "modelo", "plantilla", "redact", "contestac", "recurso", "apelac"] },
  { termino: "Documentos", raices: ["document", "archivo", "pdf", "carpeta", "papeles"] },
  { termino: "Notificaciones", raices: ["notific", "cedula", "correo", "mail", "casilla"] },
  { termino: "Honorarios", raices: ["honorar", "factur", "cobr", "regulac"] },
  { termino: "Normativa", raices: ["ley", "norma", "codigo", "legislac", "decreto", "boletin"] },
  { termino: "Agenda", raices: ["agenda", "calendar", "turno", "recordator", "avis", "alerta", "organiz"] },
  { termino: "Búsqueda", raices: ["busc", "encontr", "investig", "rastre"] },
  { termino: "Resúmenes", raices: ["resum", "sintesis", "sintetiz"] },
  { termino: "Trámites", raices: ["tramite", "oficio", "registro", "formulario", "gestion"] },
  { termino: "Riesgos", raices: ["riesgo", "privacid", "confidencial", "segur", "dato"] },
  { termino: "Aprender", raices: ["aprend", "entender", "capacit"] },
];

const VACIAS = new Set(
  "a al algo algun alguna algunas alguno algunos ante antes aplicacion app aqui asi aun cada casi como con contra cual cuales cuando de del desde donde dos el ella ellas ellos en entre era es esa esas ese eso esos esta estas este esto estos fue ha hace hacer haga hay hoy la las le les lo los mas me mi mis mucho muy nada ni no nos o otra otro para pero poco por porque que quien se sea segun ser si sin sobre solo su sus tambien tan te tengo tener todo todos tu un una uno unos usar ya yo herramienta sistema pueda puedo quiero automaticamente automatica cosas mismo misma cosa manera forma cada vez veces juridica juridico juridicas juridicos abogado abogados abogada abogadas trabajo necesito necesitaria sirva sirve ayude ayudar ayuda tenga poder pequena pequeno mejor primero todavia".split(
    " ",
  ),
);

/** minúsculas y sin tildes. */
export function normalizar(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Términos del diccionario que menciona una frase (sin repetir) y, si no encajó
 * en ninguno, hasta tres palabras sueltas: `clave` normalizada para contar y
 * `palabra` tal como se escribió (con tildes, en mayúscula inicial) para mostrar.
 */
export function terminosDe(frase: string): { terminos: string[]; sueltas: { clave: string; palabra: string }[] } {
  const n = ` ${normalizar(frase)} `;
  const terminos: string[] = [];
  for (const t of CONG_TERMINOS) if (t.raices.some((r) => n.includes(` ${r}`))) terminos.push(t.termino);
  if (terminos.length) return { terminos, sueltas: [] };
  const sueltas: { clave: string; palabra: string }[] = [];
  for (const w of frase.split(/[^\p{L}\p{N}]+/u)) {
    const clave = normalizar(w);
    if (clave.length <= 3 || VACIAS.has(clave) || sueltas.some((x) => x.clave === clave)) continue;
    sueltas.push({ clave, palabra: w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() });
    if (sueltas.length === 3) break;
  }
  return { terminos, sueltas };
}

/** Palabras que no deberían proyectarse (filtro básico: frases que las tengan no se muestran). */
const GROSERIAS = [
  "puta", "puto", "mierda", "concha", "boludo", "pelotud", "forro", "verga", "pija", "choto", "garcha", "culo", "cagar", "carajo", "idiota", "imbecil", "tarado", "mogolic", "trolo", "negro de mierda", "hdp", "ctm", "fuck", "shit",
];
export function esProyectable(frase: string): boolean {
  const n = ` ${normalizar(frase)} `;
  return !GROSERIAS.some((g) => n.includes(g));
}

/** Nube de ejemplo mientras no hay respuestas (la pantalla nunca queda vacía). */
export const CONG_NUBE_EJEMPLO = [
  "Plazos", "Expedientes", "Jurisprudencia", "Prueba", "Contratos", "Clientes", "Audiencias", "Liquidaciones", "Documentos", "Notificaciones",
];

// --- Resultados (lo que devuelve /api/congreso/resultados) -------------------------------

export type Conteo = Record<string, number>;

export interface ResultadosCong {
  activity: string;
  actual: string;
  participantes: number;
  respondieron: number;
  /** Solo opciones: item_key → opción → cantidad. */
  items: Record<string, Conteo>;
  /** item_key → cantidad de personas que respondieron ese ítem. */
  respondieronItem: Conteo;
  /** Solo texto: término → cantidad de frases que lo mencionan (ordenado de mayor a menor). */
  nube?: { termino: string; n: number }[];
  /** Solo texto: las últimas frases proyectables (la más nueva primero). */
  frases?: string[];
  /** Frases de seguimiento por ítem (ej.: "¿de qué depende?"), la más nueva primero. */
  seguimientos?: Record<string, string[]>;
  /** activity_config de la sesión (ej.: { seguimiento: true } del plan B). */
  config: Record<string, unknown>;
}

// --- Estado para los celulares (/api/congreso/estado) ------------------------------------

export interface EstadoCong {
  actividad: string;
  config: Record<string, unknown>;
  placa: number | null;
  conectados: number;
  /** Versión publicada (commit): si cambia, los celulares se actualizan solos. */
  version: string;
  /** Mensaje del último cambio publicado (commit), si se conoce. */
  cambio?: string;
}

// --- La demo: tres caminos, cada uno ensayado versión por versión ------------------------
// V0 = la herramienta vacía con la primera instrucción; V1 = primera app (con
// una limitación a propósito); V2 = primera corrección; V3 = segunda; V4 = final.

export type CasoId = "cronologia" | "prueba" | "entrevista";

export interface PasoDemo {
  v: 1 | 2 | 3 | 4;
  /** Lo que cambia en esta versión (corto, para la botonera). */
  titulo: string;
  /** La instrucción en lenguaje natural que produce esta versión. */
  prompt: string;
  /** Qué mostrar o probar en voz alta con esta versión. */
  probar: string;
}

export interface CasoDemo {
  id: CasoId;
  letra: "A" | "B" | "C";
  titulo: string;
  /** Nombre de la app que se construye. */
  app: string;
  /** El problema, en la voz del abogado. */
  problema: string;
  /** La limitación que aparece en la V1 (la placa "No era eso"). */
  falla: string;
  /** La frase de Marco al detectar la falla. */
  frase: string;
  pasos: PasoDemo[];
}

export const CONG_CASOS: CasoDemo[] = [
  {
    id: "cronologia",
    letra: "A",
    titulo: "Reconstruir cronológicamente un expediente",
    app: "Línea de tiempo del expediente",
    problema: "Tengo un expediente de 300 fojas y necesito ver qué pasó, cuándo y quién lo hizo.",
    falla: "Dos actuaciones del mismo día aparecen como una sola: la segunda pisa a la primera.",
    frase: "En un expediente puede haber varias actuaciones el mismo día. No quiero que las trate como una sola.",
    pasos: [
      {
        v: 1,
        titulo: "Primera versión",
        prompt:
          "Necesito una aplicación sencilla para abogados que permita cargar acontecimientos de un expediente. Cada acontecimiento debe contener fecha, tipo de actuación, parte que lo produjo y descripción. Ordenalos cronológicamente y mostralos mediante una línea de tiempo.",
        probar: "Cargar una actuación nueva con la misma fecha que otra (14/03/2025) y mirar la línea de tiempo: una desaparece.",
      },
      {
        v: 2,
        titulo: "Varias actuaciones el mismo día",
        prompt:
          "En un expediente puede haber varias actuaciones el mismo día. No quiero que las trate como una sola: mostralas todas, agrupadas bajo la misma fecha y en el orden en que se cargaron.",
        probar: "El 14/03/2025 ahora muestra la contestación y el ofrecimiento de prueba, uno debajo del otro.",
      },
      {
        v: 3,
        titulo: "Actor, demandado, tribunal",
        prompt:
          "Diferenciá con colores quién produjo cada actuación: actor, demandado y tribunal. Y permitime marcar las actuaciones importantes con una estrella.",
        probar: "Se lee de un vistazo quién movió el expediente. Marcar con estrella la sentencia o la apertura a prueba.",
      },
      {
        v: 4,
        titulo: "Plazos pendientes",
        prompt:
          "Agregá plazos: cuando una actuación abre un plazo, que pueda cargar cuántos días hábiles tiene. Mostrame arriba cuáles están pendientes y cuándo vencen.",
        probar: "Aparece el panel de vencimientos. Preguntar: ¿y los feriados? ¿y la feria judicial? — eso lo sabe el abogado, no la IA.",
      },
    ],
  },
  {
    id: "prueba",
    letra: "B",
    titulo: "Vincular hechos controvertidos con elementos probatorios",
    app: "Matriz de hechos y prueba",
    problema: "Antes de la audiencia necesito saber qué hecho está probado con qué, y qué me falta.",
    falla: "Cada prueba se puede vincular a un solo hecho: la pericia que acredita dos hechos obliga a elegir uno.",
    frase: "Una misma prueba puede acreditar varios hechos. Y un hecho puede tener varias pruebas.",
    pasos: [
      {
        v: 1,
        titulo: "Primera versión",
        prompt:
          "Necesito una aplicación sencilla para abogados que me permita cargar los hechos controvertidos de un juicio y los elementos de prueba que tengo (documental, testimonial, pericial, informativa). Quiero poder vincular cada hecho con la prueba que lo acredita y ver el resultado en una tabla.",
        probar: "Intentar vincular la pericia mecánica a los hechos 2 y 3: al elegir el segundo, se desvincula del primero.",
      },
      {
        v: 2,
        titulo: "Muchos a muchos",
        prompt:
          "Una misma prueba puede acreditar varios hechos, y un hecho puede tener varias pruebas. Permití vincularlos libremente, de muchos a muchos.",
        probar: "La pericia queda vinculada a los dos hechos; la tabla lo muestra en ambas filas.",
      },
      {
        v: 3,
        titulo: "Hechos sin prueba",
        prompt: "Marcame en rojo los hechos controvertidos que todavía no tienen ninguna prueba, y arriba decime cuántos son.",
        probar: "Aparece el aviso: un hecho sin prueba. Es exactamente lo que uno quiere saber antes de la audiencia.",
      },
      {
        v: 4,
        titulo: "Carga y estado de la prueba",
        prompt:
          "Agregá para cada hecho quién tiene la carga de la prueba (actor o demandado) y el estado de cada prueba: ofrecida, producida o desistida. Mostrame un resumen de lo que falta producir.",
        probar: "El resumen dice qué falta producir y de quién es la carga. Preguntar: ¿la carga dinámica de la prueba? — criterio jurídico.",
      },
    ],
  },
  {
    id: "entrevista",
    letra: "C",
    titulo: "Preparar la entrevista inicial con un cliente",
    app: "Guía de primera entrevista",
    problema: "En la primera entrevista siempre me olvido de preguntar algo, y después falta un dato clave.",
    falla: "Hace las mismas preguntas para cualquier caso: a un despido le pregunta si hubo lesionados.",
    frase: "Las preguntas no pueden ser las mismas para todos los casos. Un despido no es un accidente.",
    pasos: [
      {
        v: 1,
        titulo: "Primera versión",
        prompt:
          "Necesito una aplicación sencilla para abogados que me ayude a preparar la primera entrevista con un cliente. Que me haga preguntas paso a paso para reunir la información necesaria y al final me arme una ficha con el resumen del caso.",
        probar: "Empezar un caso de despido: pregunta por lesionados y por el seguro del vehículo. No sirve para todos los casos.",
      },
      {
        v: 2,
        titulo: "Preguntas según el caso",
        prompt:
          "Las preguntas no pueden ser las mismas para todos los casos. Primero preguntá de qué tipo de asunto se trata (laboral, familia, accidente de tránsito o consumidor) y adaptá las preguntas a cada uno. Y que se pueda contestar “no sé”.",
        probar: "Elegir “laboral”: ahora pregunta fecha de ingreso, categoría, forma del despido.",
      },
      {
        v: 3,
        titulo: "Alerta de plazos",
        prompt:
          "Si el cliente recibió una notificación, una carta documento o una intimación, o si los hechos pasaron hace mucho, mostrame una alerta de plazo urgente al principio de la ficha.",
        probar: "Marcar que recibió una carta documento: la ficha abre con la alerta. Preguntar: ¿qué plazo? — depende del caso, y eso es derecho.",
      },
      {
        v: 4,
        titulo: "Documentación a pedir",
        prompt:
          "Al final, agregá la lista de documentación que el cliente tiene que traer según el tipo de caso, y un botón para copiar la ficha.",
        probar: "La ficha termina con qué tiene que traer el cliente. Copiarla.",
      },
    ],
  },
];

export function getCaso(id: string | null | undefined): CasoDemo | undefined {
  return CONG_CASOS.find((c) => c.id === id);
}

// --- Placa 11: herramientas reales de Marco -------------------------------------------------

export interface Herramienta {
  nombre: string;
  donde: string;
  /** Qué clase de objeto es (votación, simulador, recorrido…). */
  tipo: string;
  hace: string;
  ruta: string;
}

export const CONG_VITRINA: Herramienta[] = [
  {
    nombre: "Expediente Vivo",
    donde: "Diplomatura en IA y Derecho · UNT",
    tipo: "Recorrido de decisiones",
    hace: "Un litigio que se desbloquea por etapas: cada grupo decide con la información que tiene en ese momento.",
    ruta: "/expediente",
  },
  {
    nombre: "La Posta",
    donde: "Diplomatura en IA y Derecho · UNT",
    tipo: "Circuito de herramientas",
    hace: "Dirige una posta entre varias IA: qué sacar de cada una y a cuál pasarle el testigo.",
    ruta: "/posta",
  },
  {
    nombre: "Justicia aumentada",
    donde: "Semana de la Mediación · El Salvador",
    tipo: "Simulador y nube",
    hace: "El celular sigue la presentación; un conflicto cambia según lo que elige la sala.",
    ruta: "/justicia",
  },
  {
    nombre: "Taller de resolución de conflictos",
    donde: "PGR · El Salvador",
    tipo: "Tutor de trabajo en grupo",
    hace: "Cada mesa recorre ocho etapas de un caso; la pantalla grande ve quién pide ayuda y en qué paso.",
    ruta: "/taller-ia",
  },
  {
    nombre: "Web3 y gobernanza",
    donde: "Diplomatura Derecho 5.0 · UMSA",
    tipo: "Votación",
    hace: "El aula funciona como una DAO: se delega, se vota y se ve el resultado en vivo.",
    ruta: "/web3",
  },
];

// --- La revelación: cómo se hizo esta app ------------------------------------------------------

/** El pedido real con el que empezó esta app (tal cual, sin corregir). */
export const CONG_ORIGEN = {
  pedido:
    "Necesito armar la presentacion que sea congreso.rossi-ia.com tambien, quiero que sea una presentacion genial con algo de participacion en vivo pero que me permita mostrar cosas tambien",
  segundo: "usa la carpeta congreso ia",
  /** El documento de diseño que acompañó el pedido. */
  diseno: "DISEÑO INTEGRAL DE PONENCIA: VIBE CODING PARA ABOGADOS",
  fragmentos: [
    "El público accede mediante QR desde sus teléfonos. No requiere registro. No requiere nombre.",
    "La aplicación no es un complemento decorativo.",
    "Marco debe poder continuar aunque nadie participe.",
  ],
};

// --- Placas ------------------------------------------------------------------------------------

export type Movimiento =
  | "Apertura"
  | "1 · Los abogados ya pensaban en sistemas"
  | "2 · Programar hablando"
  | "3 · Construyamos algo"
  | "4 · Funciona. ¿Entonces está bien?"
  | "5 · Del abogado usuario al abogado constructor";

/** Ilustración de cada placa (components/congreso/ilus.tsx). */
export type IlusId =
  | "p01-pantalla-vieja"
  | "p02-clausula"
  | "p03-collage"
  | "p05-cadena"
  | "p06-frase-interfaz"
  | "p07-pedir-construir"
  | "p10-ciclo"
  | "p11-expediente-codigo"
  | "p13-capas"
  | "p14-madurez"
  | "p15-espacio";

interface SlideBase {
  movimiento: Movimiento;
  /** Guion para Marco: solo se ve en el control remoto. */
  nota: string;
}

export interface SlidePortada extends SlideBase {
  t: "portada";
}
/** Placa numerada del diseño (1 a 15). */
export interface SlidePlaca extends SlideBase {
  t: "placa";
  numero: number;
  titulo: string;
  bajada: string;
  ilus?: IlusId;
  /** "tipo": tipografía sola; "lado": texto a la izquierda e ilustración a la derecha; "centro": texto arriba e ilustración abajo. */
  layout: "tipo" | "lado" | "centro";
  /** Cosas que Marco revela de a una (botones en la placa y en el control). */
  pasos?: { label: string; texto: string }[];
}
/** Curvas (4 y 12): texto circular = frenar, sintetizar, cambiar de dirección. */
export interface SlideCurva extends SlideBase {
  t: "curva";
  numero: number;
  titulo: string;
  bajada: string;
  anillo: string;
  /** La curva principal ("Funciona."): palabra enorme y el anillo chico en un rincón. */
  principal?: boolean;
}
/** Interacción: pregunta + QR + contador; el resultado aparece en vivo o a pedido. */
export interface SlideActividad extends SlideBase {
  t: "actividad";
  activa: CongKey;
  /** Preguntas que aparecen de a una después del resultado (interacción 4). */
  preguntas?: string[];
}
/** Placas 8, 9 y 10: la demo, según el problema que eligió la sala. */
export interface SlideDemo extends SlideBase {
  t: "demo";
  numero: number;
  titulo: string;
  bajada: string;
  fase: "construir" | "error" | "probar";
}
/** Placa 11: herramientas reales (se abren en vivo). */
export interface SlideVitrina extends SlideBase {
  t: "vitrina";
  numero: number;
  titulo: string;
  bajada: string;
}
export interface SlideRevelacion extends SlideBase {
  t: "revelacion";
}
/** El experimento: modificar la app del público en vivo. */
export interface SlideExperimento extends SlideBase {
  t: "experimento";
  activa: CongKey;
}
export interface SlideFinal extends SlideBase {
  t: "final";
}

export type SlideCong =
  | SlidePortada
  | SlidePlaca
  | SlideCurva
  | SlideActividad
  | SlideDemo
  | SlideVitrina
  | SlideRevelacion
  | SlideExperimento
  | SlideFinal;

// Versión corta (~17 min, 19 placas): se quitaron las placas que repetían una idea
// ya dicha (ya diseñamos sistemas, empezar hablando, usar o construir, probar
// también es programar, puedo ≠ debo); su contenido vive en el guion de la vecina.
export const CONG_SLIDES: SlideCong[] = [
  {
    t: "portada",
    movimiento: "Apertura",
    nota: "Mientras la gente se acomoda. No explicar nada todavía. Cuando empiece: saludar corto y pasar directo a la primera pregunta.",
  },
  // --- Movimiento 1 · ~3 min ---
  {
    t: "placa",
    numero: 1,
    movimiento: "1 · Los abogados ya pensaban en sistemas",
    titulo: "¿Sabés programar?",
    bajada: "Probablemente no. Y quizás eso ya no sea lo más importante.",
    ilus: "p01-pantalla-vieja",
    layout: "tipo",
    nota: "MANO ALZADA: \"¿Cuántos de ustedes saben programar?\" Contar en voz alta, con humor. NO explicar todavía qué es vibe coding. Recordar el número: vuelve al final.",
  },
  {
    t: "placa",
    numero: 2,
    movimiento: "1 · Los abogados ya pensaban en sistemas",
    titulo: "Si A → B",
    bajada: "Salvo que ocurra C.",
    ilus: "p02-clausula",
    layout: "lado",
    pasos: [
      { label: "Condición", texto: "Si el locatario no paga dos meses consecutivos…" },
      { label: "Consecuencia", texto: "…el locador puede resolver el contrato…" },
      { label: "Excepción", texto: "…salvo que pague lo adeudado antes de la intimación." },
      { label: "Entrada", texto: "¿Qué datos necesito? Fechas de pago, montos, fecha de la intimación." },
    ],
    nota: "Revelar rápido: CONDICIÓN, CONSECUENCIA, EXCEPCIÓN, ENTRADA. \"Esto no es código: es una cláusula. Pero tiene la misma estructura.\" (Es una analogía, no una equivalencia.) Remate: \"Ya diseñamos sistemas. Sólo que no los llamábamos así.\" Y: saquen el teléfono.",
  },
  {
    t: "actividad",
    activa: "cong_molestia",
    movimiento: "1 · Los abogados ya pensaban en sistemas",
    nota: "INTERACCIÓN 1 (1 min). QR en pantalla: sin registro, sin nombre. La nube se arma sola. Cierre: \"Fíjense algo: todavía no estamos hablando de aplicaciones. Estamos hablando de problemas.\" (Tecla V = ver frases.)",
  },
  {
    t: "curva",
    numero: 3,
    movimiento: "1 · Los abogados ya pensaban en sistemas",
    titulo: "¿Y si desaparece la barrera?",
    bajada: "De describir una idea a construir algo.",
    anillo: "De describir una idea a construir algo · ¿Y si desaparece la barrera? · ",
    nota: "CURVA · FRENAR. \"Tenemos problemas que sabemos explicar: los acaban de escribir. Entre explicar un problema y tener una herramienta había una barrera enorme. ¿Y si desaparece?\"",
  },
  // --- Movimiento 2 · ~3 min ---
  {
    t: "placa",
    numero: 4,
    movimiento: "2 · Programar hablando",
    titulo: "Antes había que traducir",
    bajada: "Problema → especificación → código → software.",
    ilus: "p05-cadena",
    layout: "centro",
    pasos: [
      { label: "El problema", texto: "“Necesito un sistema que me ordene los vencimientos de mis causas.”" },
      { label: "La especificación", texto: "Alguien lo traduce a requisitos, pantallas, campos." },
      { label: "El desarrollo", texto: "Un equipo lo presupuesta, lo diseña, lo programa." },
      { label: "El software", texto: "Meses después, llega algo. Y no era exactamente eso." },
    ],
    nota: "Revelar las capas de traducción (cada una: una persona, un presupuesto, un malentendido). Humor: \"y cuando llega, no era exactamente eso\". Giro: \"Ahora podés empezar hablando: la frase del principio ya es el punto de partida.\"",
  },
  {
    t: "placa",
    numero: 5,
    movimiento: "2 · Programar hablando",
    titulo: "Pedir ≠ construir",
    bajada: "Una respuesta termina. Una herramienta permanece.",
    ilus: "p07-pedir-construir",
    layout: "centro",
    nota: "Izquierda: pido un resumen, me responde, se terminó. Derecha: construyo algo que queda, que usa otro, mañana, con otros datos, y que repite el criterio que YO definí. Eso es vibe coding: usar la IA para construir herramientas. \"Construyamos una. Ustedes eligen cuál.\"",
  },
  {
    t: "actividad",
    activa: "cong_elegir",
    movimiento: "2 · Programar hablando",
    nota: "INTERACCIÓN 2 (1 min). Que la sala elija. Mostrar resultados (→ o R). \"Bueno. Construyamos esa.\" Las tres están ensayadas (plan B adentro de la placa siguiente). Empate: la A.",
  },
  // --- Movimiento 3 · ~6 min ---
  {
    t: "demo",
    numero: 6,
    movimiento: "3 · Construyamos algo",
    titulo: "Hagamos una app",
    bajada: "Ahora. Desde cero.",
    fase: "construir",
    nota: "Salir a la herramienta. Pegar la instrucción (botón Copiar). Generar, abrir, probar. Mientras genera: \"No escribí una línea de código. Escribí lo que un abogado le pediría a un colega.\" Si falla: \"Perfecto. Bienvenidos al desarrollo de software.\" y seguir con la V1 ensayada.",
  },
  {
    t: "demo",
    numero: 7,
    movimiento: "3 · Construyamos algo",
    titulo: "No era eso.",
    bajada: "Y acá empieza lo interesante.",
    fase: "error",
    nota: "Encontrar la limitación en vivo (Marcar la falla). Decir la frase del abogado y pedir la corrección (V2). Si hay tiempo, una más (V3). Remate: \"La IA escribió el código. Pero yo tuve que explicarle qué estaba mal. Construir es conversar con el error.\"",
  },
  {
    t: "vitrina",
    numero: 8,
    titulo: "El código no era el problema",
    bajada: "El problema era entender el problema.",
    movimiento: "3 · Construyamos algo",
    nota: "Abrir UNA herramienta real (30 segundos, no un catálogo): \"Esto no es una posibilidad teórica: son objetos que construí para mis clases.\" En todas, lo difícil no fue el código: fue entender la clase.",
  },
  // --- Movimiento 4 · ~4 min ---
  {
    t: "curva",
    numero: 9,
    principal: true,
    movimiento: "4 · Funciona. ¿Entonces está bien?",
    titulo: "Funciona.",
    bajada: "¿Entonces está bien?",
    anillo: "Funciona · ¿Entonces está bien? · ",
    nota: "CURVA PRINCIPAL · HACER SILENCIO. Tres segundos sin hablar. Después: \"Funciona. ¿Entonces está bien?\" Y pasar a la pregunta.",
  },
  {
    t: "actividad",
    activa: "cong_datos",
    movimiento: "4 · Funciona. ¿Entonces está bien?",
    preguntas: [
      "¿Dónde se procesan los datos?",
      "¿Dónde se almacenan?",
      "¿Quién puede acceder?",
      "¿Probamos suficientemente el resultado?",
      "¿Qué ocurre si cambia una regla jurídica?",
      "¿Quién responde cuando falla?",
    ],
    nota: "INTERACCIÓN 3. Mostrar resultados. \"Los que pusieron DEPENDE: ¿de qué depende?\" Dos respuestas orales y revelar las preguntas (→). \"Puedo ≠ debo: construir rápido no elimina la responsabilidad.\" EXPERIMENTO: acá dictarle a la IA el cambio (placa \"Cambiémosla ahora\") — \"le pedí algo, después volvemos\" — y seguir: el deploy tarda 1-2 min.",
  },
  {
    t: "placa",
    numero: 10,
    movimiento: "4 · Funciona. ¿Entonces está bien?",
    titulo: "Prototipar no es implementar",
    bajada: "Una idea funcionando todavía no es un sistema confiable.",
    ilus: "p14-madurez",
    layout: "centro",
    pasos: [
      { label: "Herramienta experimental", texto: "La pruebo yo, con datos inventados." },
      { label: "Prototipo", texto: "Sirve para mostrar una idea y discutirla." },
      { label: "Herramienta personal", texto: "La uso en mi trabajo; el riesgo es mío." },
      { label: "Automatización interna", texto: "La usa mi equipo: alguien tiene que mantenerla." },
      { label: "Sistema profesional", texto: "Pruebas, seguridad, responsables, auditoría." },
      { label: "Sistema sobre derechos de terceros", texto: "Información sensible, decisiones que afectan a otros: el máximo de exigencia." },
    ],
    nota: "Subir la escalera sin detenerse en cada escalón. No es malo vs bueno: es madurez distinta, y la exigencia sube con el contexto. \"¿Sabemos dónde terminarían los datos que cargamos hace un rato?\"",
  },
  {
    t: "revelacion",
    movimiento: "4 · Funciona. ¿Entonces está bien?",
    nota: "LA REVELACIÓN. \"Hay algo que todavía no les conté.\" (→) \"La aplicación que vienen usando desde el teléfono también la hice con vibe coding.\" PAUSA. Mostrar el pedido real, con sus errores de tipeo. (→) \"No estuvieron viendo ejemplos de vibe coding. Estuvieron adentro de uno.\"",
  },
  {
    t: "experimento",
    activa: "cong_datos",
    movimiento: "4 · Funciona. ¿Entonces está bien?",
    nota: "EXPERIMENTO. \"Y como la hice así, la puedo cambiar ahora.\" Si el cambio ya se publicó, se ve el sello arriba. Si no llegó: botón PLAN B (acá y en el control). Pedir a los de DEPENDE que escriban de qué depende. Leer dos frases. Necesidad → descripción → modificación → uso real.",
  },
  // --- Movimiento 5 · ~2 min ---
  {
    t: "placa",
    numero: 11,
    movimiento: "5 · Del abogado usuario al abogado constructor",
    titulo: "El código dejó de ser la primera barrera",
    bajada: "Ahora la barrera es saber qué queremos construir.",
    ilus: "p15-espacio",
    layout: "lado",
    nota: "Durante décadas decíamos \"necesitaríamos un sistema que haga esto\". Ahora aparece otra frase: \"tengo una idea, construí una primera versión, probémosla\". El abogado no reemplaza al desarrollador: aprende a convertir una intuición profesional en algo que puede probarse.",
  },
  {
    t: "actividad",
    activa: "cong_intentar",
    movimiento: "5 · Del abogado usuario al abogado constructor",
    nota: "INTERACCIÓN 4. La pregunta del principio, pero ahora: ¿qué intentarías construir? ANTES y AHORA lado a lado. Cerrar: \"Hace veinte minutos les pregunté cuántos sabían programar.\" Pausa. \"Ahora esa pregunta me interesa bastante menos.\"",
  },
  {
    t: "final",
    movimiento: "5 · Del abogado usuario al abogado constructor",
    nota: "\"La pregunta es qué problema de nuestro trabajo sabemos explicar lo suficientemente bien como para intentar construir una solución.\" NO decir \"muchas gracias\" enseguida. Dejar respirar la pregunta. Recién después, agradecer.",
  },
];

/** Nombre corto de una placa (índice del control remoto). */
export function tituloSlide(s: SlideCong): string {
  const n = (x: number) => String(x).padStart(2, "0");
  switch (s.t) {
    case "portada":
      return "Portada";
    case "placa":
    case "demo":
    case "vitrina":
      return `${n(s.numero)} · ${s.titulo}`;
    case "curva":
      return `${n(s.numero)} · ${s.titulo} ↻`;
    case "actividad": {
      const a = getActividadCong(s.activa);
      return `Interacción ${a?.numero ?? ""} · ${a?.nombre ?? ""}`;
    }
    case "revelacion":
      return "La revelación";
    case "experimento":
      return "Cambiémosla ahora";
    case "final":
      return "La última pregunta";
  }
}

/** Actividad que abre una placa al llegar ("lobby" en la portada; undefined si no toca nada). */
export function actividadDeSlide(s: SlideCong): string | undefined {
  if (s.t === "portada") return "lobby";
  if (s.t === "actividad" || s.t === "experimento") return s.activa;
  return undefined;
}

/** Actividad cuyos resultados muestra la placa. */
export function resultadosDeSlide(s: SlideCong): CongKey | undefined {
  if (s.t === "actividad" || s.t === "experimento") return s.activa;
  return undefined;
}
