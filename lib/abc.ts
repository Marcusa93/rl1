// ============================================================
// Taller /abc · "La IA no es Google" — para personas que NUNCA usaron IA.
// Diplomatura/curso introductorio. Self-paced, dirigido por el docente.
//
// La app acompaña 4 momentos interactivos (los demos en vivo los hace el
// docente): onboarding → analogías → memoria persistente → primer caso real
// → cierre. En el caso real la IA corre DENTRO de la app (principiantes:
// no los mandamos a herramientas externas).
// ============================================================

export const ABC_SLUG = "abc";
export const ABC_TITLE = "La IA no es Google — taller para empezar";
export const ABC_ACTIVITY = "abc";
export const ABC_ITEM = "state";

export const FRASE_ANCLA =
  "La IA no es Google: no te da una lista de links, te da una mano para hacer.";

// --- Tema 2 · Onboarding: situaciones cotidianas ------------------------

export interface Situacion {
  id: string;
  emoji: string;
  label: string; // como lo elige el participante (1ª persona)
  voz: string; // como lo dice la IA sobre el participante ("que te cuesta…")
}

export const SITUACIONES: Situacion[] = [
  { id: "mensajes", emoji: "✍️", label: "Me cuesta redactar mensajes difíciles", voz: "que te cuesta redactar mensajes difíciles" },
  { id: "buscar", emoji: "🔎", label: "Pierdo tiempo buscando información", voz: "que perdés tiempo buscando información" },
  { id: "ordenar", emoji: "🧠", label: "No sé cómo organizar mis ideas antes de escribir", voz: "que te cuesta organizar tus ideas antes de escribir" },
  { id: "resumir", emoji: "📄", label: "Tengo que resumir cosas largas y me lleva horas", voz: "que resumir cosas largas te lleva mucho tiempo" },
  { id: "otro", emoji: "✨", label: "Otra cosa (la escribo yo)", voz: "" },
];

// --- Tema 3 · Analogías (pantalla estática que refuerza al docente) ------

export interface Analogia {
  emoji: string;
  titulo: string;
  texto: string;
}

export const ANALOGIAS: Analogia[] = [
  {
    emoji: "🧑‍💼",
    titulo: "El asistente nuevo en la oficina",
    texto:
      "Es muy capaz, pero recién llega: no sabe nada de vos ni de tu trabajo. Si le explicás bien qué necesitás, lo hace bárbaro. Si le pedís cualquier cosa a medias, te trae cualquier cosa.",
  },
  {
    emoji: "👨‍🍳",
    titulo: "El chef",
    texto:
      "Cocina muy bien, pero el plato sale según cómo se lo pidas. Si decís solo «algo de comer», improvisa. Si le contás qué te gusta y para qué es, te clava el plato justo.",
  },
];

// --- Tema 4 · Preguntas para profundizar el perfil ----------------------

export interface PerfilPregunta {
  id: string;
  q: string;
  multi?: boolean;
  opciones: { id: string; label: string }[];
}

export const PERFIL_PREGUNTAS: PerfilPregunta[] = [
  {
    id: "negocio",
    q: "¿Tenés un negocio propio o trabajás para alguien?",
    opciones: [
      { id: "propio", label: "Negocio propio" },
      { id: "empleado", label: "Trabajo para alguien" },
    ],
  },
  {
    id: "equipo",
    q: "¿Trabajás solo/a o con equipo?",
    opciones: [
      { id: "solo", label: "Solo/a" },
      { id: "equipo", label: "Con equipo" },
    ],
  },
  {
    id: "escribe",
    q: "¿Qué tipo de cosas escribís seguido?",
    multi: true,
    opciones: [
      { id: "clientes", label: "Mensajes a clientes" },
      { id: "mails", label: "Mails de trabajo" },
      { id: "redes", label: "Publicaciones para redes" },
      { id: "notas", label: "Notas o apuntes" },
      { id: "formales", label: "Documentos formales" },
    ],
  },
  {
    id: "estilo",
    q: "¿Cómo preferís las respuestas?",
    opciones: [
      { id: "cortas", label: "Cortas y directas" },
      { id: "largas", label: "Más desarrolladas" },
    ],
  },
];

// --- Tema 6 · Tarjetas del primer caso real -----------------------------

export interface SubtareaDef {
  id: string;
  label: string;
  pedido: string; // cómo se le pide a la IA
}
export interface Tarjeta {
  id: string;
  emoji: string;
  titulo: string;
  desc: string;
  detalleHint: string;
  subtareas: SubtareaDef[];
}

export const TARJETAS: Tarjeta[] = [
  {
    id: "negocio",
    emoji: "🏪",
    titulo: "Mi negocio o trabajo",
    desc: "Vender, comunicar, atender clientes.",
    detalleHint: "Ej: «vendo tortas por encargo, quiero promocionar una nueva de chocolate».",
    subtareas: [
      { id: "describir", label: "Describir un producto o servicio", pedido: "Ayudame a escribir una descripción atractiva de un producto o servicio." },
      { id: "cliente", label: "Responder a un cliente", pedido: "Ayudame a redactar una respuesta para un cliente." },
      { id: "promo", label: "Escribir una promoción o anuncio", pedido: "Ayudame a escribir una promoción o un anuncio breve." },
      { id: "otro", label: "Otra cosa (la escribo abajo)", pedido: "Ayudame con esto que necesito para mi negocio o trabajo:" },
    ],
  },
  {
    id: "finanzas",
    emoji: "💰",
    titulo: "Mis cuentas",
    desc: "Ordenar la plata, entender en qué se va.",
    detalleHint: "Ej: pegá tus ingresos y gastos del mes, aunque sea aproximado.",
    subtareas: [
      { id: "ordenar", label: "Ordenar mis ingresos y gastos", pedido: "Ayudame a ordenar y entender mis ingresos y gastos del mes." },
      { id: "donde", label: "Ver dónde se me va la plata", pedido: "Mirá estos números y decime dónde se me va más la plata y qué podría recortar." },
      { id: "presupuesto", label: "Armar un presupuesto simple", pedido: "Ayudame a armar un presupuesto mensual simple con estos datos." },
      { id: "otro", label: "Otra cosa (la escribo abajo)", pedido: "Ayudame con esto que necesito sobre mis cuentas:" },
    ],
  },
  {
    id: "cotidiano",
    emoji: "💬",
    titulo: "Lo de todos los días",
    desc: "Ese mensaje, ese texto que tenés pendiente.",
    detalleHint: "Ej: «tengo que avisarle a un amigo que no le puedo devolver la plata todavía».",
    subtareas: [
      { id: "mensaje", label: "Escribir un mensaje difícil", pedido: "Ayudame a escribir un mensaje difícil. Dame tres versiones: una directa, una conciliadora y una formal." },
      { id: "resumir", label: "Resumir algo largo", pedido: "Resumime esto en pocos puntos claros y fáciles de leer." },
      { id: "ideas", label: "Ordenar mis ideas para escribir algo", pedido: "Ayudame a ordenar mis ideas para escribir esto, con una estructura simple." },
      { id: "otro", label: "Otra cosa (la escribo abajo)", pedido: "Ayudame con esto que necesito:" },
    ],
  },
];

export function getTarjeta(id: string | null | undefined): Tarjeta | null {
  return TARJETAS.find((t) => t.id === id) ?? null;
}

// --- Pestaña Recursos: herramientas de IA con para qué sirve cada una ---

export interface Recurso {
  nombre: string;
  emoji: string;
  para: string;
  url: string;
}

export const RECURSOS: Recurso[] = [
  { nombre: "ChatGPT", emoji: "🟢", para: "El asistente más conocido: escribir, responder, resumir.", url: "https://chatgpt.com/" },
  { nombre: "Claude", emoji: "🟣", para: "Asistente para escribir y pensar, muy bueno con textos largos.", url: "https://claude.ai/" },
  { nombre: "Gemini", emoji: "🔵", para: "El asistente de Google, integrado con sus apps.", url: "https://gemini.google.com/app" },
  { nombre: "NotebookLM", emoji: "📓", para: "Subís tus documentos y te los resume o responde sobre ellos.", url: "https://notebooklm.google.com/" },
  { nombre: "Gamma", emoji: "📊", para: "Hacé presentaciones y documentos lindos en minutos.", url: "https://gamma.app/" },
  { nombre: "Suno", emoji: "🎵", para: "Creá canciones y música a partir de una idea.", url: "https://suno.com/" },
  { nombre: "Napkin", emoji: "✏️", para: "Convertí un texto en diagramas y gráficos.", url: "https://napkin.ai/" },
];

// --- Pestaña Práctica: ida y vuelta con una IA ---------------------------
// Copiar un prompt de la plataforma, pegarlo en una IA, traer el resultado
// y analizarlo. Enseña el "viaje" copiar → pegar → volver.

export const IDA_VUELTA_PREGUNTA = `Dame 3 ideas concretas para promocionar lo que hago esta semana.`;

// --- Pasos (mapa mental del taller) -------------------------------------

export interface PasoDef {
  n: number;
  titulo: string;
  short: string;
  bajada: string;
}

export const PASOS: PasoDef[] = [
  { n: 0, titulo: "Vos", short: "Vos", bajada: "Contanos quién sos. Sin teoría todavía." },
  { n: 1, titulo: "Qué es la IA", short: "Qué es", bajada: "Dos analogías para entenderla en un minuto." },
  { n: 2, titulo: "Pedir bien", short: "Pedir bien", bajada: "Probá pedir mal y pedir bien. La diferencia se ve sola." },
  { n: 3, titulo: "Tu memoria", short: "Memoria", bajada: "Armá lo que la IA tiene que saber de vos." },
  { n: 4, titulo: "Probá tu memoria", short: "Probala", bajada: "Llevá tu memoria a una IA y mirá el contraste." },
  { n: 5, titulo: "Tu primer caso", short: "Tu caso", bajada: "Usala para algo tuyo, de verdad." },
  { n: 6, titulo: "Cierre", short: "Cierre", bajada: "Una idea para llevarte." },
];

// --- Paso "Pedir bien": mismo pedido, flojo vs COTIO (corre en la app) ---

export const PRUEBA_ESCENARIO =
  "Imaginá que tenés que escribirle un mensaje a tu jefe para avisarle que mañana no vas a poder ir a trabajar.";

export const PRUEBA_SYSTEM =
  "Sos un asistente en español rioplatense, claro y directo. Respondé solo con lo que te piden.";

export const PROMPT_FLOJO = "escribime un mensaje para mi jefe";

export const PROMPT_BUENO = `Sos mi asistente para escribir mensajes.
[Contexto] Trabajo en una oficina y mi jefe es bastante formal.
[Objetivo] Avisarle que mañana no voy a poder ir por un tema de salud.
[Tarea] Escribime el mensaje.
[Info] Quiero ser respetuoso, sin dar detalles personales de más, y ofrecer ponerme al día con lo pendiente.
[Output] Cortito, formal, en un solo párrafo.`;

/** COTIO explicado para principiantes (cada letra en criollo). */
export const COTIO_SIMPLE: { letra: string; nombre: string; texto: string }[] = [
  { letra: "C", nombre: "Contexto", texto: "Quién sos y cuál es la situación." },
  { letra: "O", nombre: "Objetivo", texto: "Qué querés lograr." },
  { letra: "T", nombre: "Tarea", texto: "Qué tiene que hacer la IA." },
  { letra: "I", nombre: "Info", texto: "Los datos que le das." },
  { letra: "O", nombre: "Output", texto: "Cómo querés la respuesta (corta, formal, etc.)." },
];

// --- Estado del participante --------------------------------------------

export interface AbcState {
  paso: number; // máximo alcanzado (0..5)
  ocupacion: string; // qué hace en el día a día
  situaciones: string[]; // ids (1-2)
  situacionOtro: string; // texto libre si eligió "otro"
  resFlojo: string; // resultado del prompt flojo (paso "pedir bien")
  resBueno: string; // resultado del prompt bien hecho (COTIO)
  negocio: string | null;
  equipo: string | null;
  escribe: string[];
  estilo: string | null;
  tarjeta: string | null;
  subtarea: string | null;
  detalle: string;
  resultado: string; // lo último que generó la IA en el caso real
  ivResultado: string; // ida y vuelta: lo que trajo de la IA
  ivNota: string; // ida y vuelta: su análisis
  aprendi: string; // una cosa que aprendió hoy
  completado: boolean;
  copilotoUsos: number;
}

export function emptyAbcState(): AbcState {
  return {
    paso: 0,
    ocupacion: "",
    situaciones: [],
    situacionOtro: "",
    resFlojo: "",
    resBueno: "",
    negocio: null,
    equipo: null,
    escribe: [],
    estilo: null,
    tarjeta: null,
    subtarea: null,
    detalle: "",
    resultado: "",
    ivResultado: "",
    ivNota: "",
    aprendi: "",
    completado: false,
    copilotoUsos: 0,
  };
}

// --- Texto generado a partir del perfil ---------------------------------

const ESCRIBE_LABEL: Record<string, string> = Object.fromEntries(
  (PERFIL_PREGUNTAS.find((p) => p.id === "escribe")?.opciones ?? []).map((o) => [o.id, o.label.toLowerCase()]),
);

// El alumno escribe la ocupación en 1ª persona ("tengo un bar"); el resumen
// lo dice la IA en 2ª persona, así que pasamos el verbo inicial a voseo.
const VOS_VERBOS: Record<string, string> = {
  tengo: "tenés",
  soy: "sos",
  estoy: "estás",
  trabajo: "trabajás",
  atiendo: "atendés",
  manejo: "manejás",
  administro: "administrás",
  coordino: "coordinás",
  dirijo: "dirigís",
  llevo: "llevás",
  hago: "hacés",
  vendo: "vendés",
  compro: "comprás",
  doy: "das",
  enseño: "enseñás",
  dicto: "dictás",
  estudio: "estudiás",
  cuido: "cuidás",
  cocino: "cocinás",
  arreglo: "arreglás",
  reparo: "reparás",
  reparto: "repartís",
  cobro: "cobrás",
  limpio: "limpiás",
  corto: "cortás",
  peino: "peinás",
  conduzco: "conducís",
  escribo: "escribís",
  diseño: "diseñás",
  programo: "programás",
  produzco: "producís",
  fabrico: "fabricás",
  instalo: "instalás",
  pinto: "pintás",
  construyo: "construís",
  gestiono: "gestionás",
  organizo: "organizás",
  planifico: "planificás",
  asesoro: "asesorás",
  represento: "representás",
  ayudo: "ayudás",
  entreno: "entrenás",
  alquilo: "alquilás",
  saco: "sacás",
};

// Verbos reflexivos comunes ("me dedico a…" → "te dedicás a…").
const VOS_REFLEX: Record<string, string> = {
  "me dedico": "te dedicás",
  "me ocupo": "te ocupás",
  "me encargo": "te encargás",
};

function ocupacionEnVos(txt: string): string {
  const t = txt.trim();
  if (!t) return t;
  const words = t.split(/\s+/);
  const dos = `${words[0]} ${words[1] ?? ""}`.toLowerCase().trim();
  if (VOS_REFLEX[dos]) return [VOS_REFLEX[dos], ...words.slice(2)].join(" ");
  const v = VOS_VERBOS[words[0].toLowerCase()];
  return v ? [v, ...words.slice(1)].join(" ") : t;
}

/** Tema 4 — "esto es lo que tu asistente sabe de vos", en voz de la IA. */
export function resumenMemoria(s: AbcState, nombre: string): string {
  const partes: string[] = [`que te llamás ${nombre || "…"}`];
  if (s.ocupacion.trim()) partes.push(`que ${ocupacionEnVos(s.ocupacion)}`);
  const sit = s.situaciones
    .filter((id) => id !== "otro")
    .map((id) => SITUACIONES.find((x) => x.id === id)?.voz)
    .filter(Boolean);
  if (sit.length) partes.push(sit.join(" y "));
  if (s.situaciones.includes("otro") && s.situacionOtro.trim())
    partes.push(`y esto que me contaste: «${s.situacionOtro.trim()}»`);
  return `Sé ${partes.join(", ")}.`;
}

/** Tema 4 — prompt de memoria para copiar y pegar en cualquier IA. */
export function promptMemoria(s: AbcState, nombre: string): string {
  const L: string[] = ["Quiero que recuerdes esto sobre mí cada vez que hablemos:"];
  L.push(`- Me llamo ${nombre || "[tu nombre]"}.`);
  if (s.ocupacion.trim()) L.push(`- En mi día a día: ${s.ocupacion.trim()}.`);
  if (s.negocio) L.push(`- ${s.negocio === "propio" ? "Tengo un negocio propio." : "Trabajo en relación de dependencia."}`);
  if (s.equipo) L.push(`- ${s.equipo === "solo" ? "Trabajo solo/a." : "Trabajo con un equipo."}`);
  if (s.escribe.length) L.push(`- Suelo escribir: ${s.escribe.map((id) => ESCRIBE_LABEL[id] ?? id).join(", ")}.`);
  const sit = s.situaciones
    .map((id) => (id === "otro" ? s.situacionOtro.trim() || null : SITUACIONES.find((x) => x.id === id)?.label.toLowerCase()))
    .filter(Boolean);
  if (sit.length) L.push(`- Lo que más me cuesta o necesito: ${sit.join("; ")}.`);
  L.push(
    s.estilo === "largas"
      ? "Cuando me respondas, desarrollá un poco más, con ejemplos."
      : "Cuando me respondas, andá al grano: respuestas cortas y directas.",
  );
  return L.join("\n");
}

// --- IA dentro de la app (Tema 6) ---------------------------------------

/** System del asistente personal para el caso real. */
export function casoSystem(s: AbcState, nombre: string): string {
  return `Sos el asistente personal de ${nombre || "esta persona"}. Hablás en español rioplatense, claro y simple, sin tecnicismos ni vueltas (es alguien que recién empieza a usar IA).

${promptMemoria(s, nombre)}

Trabajás sobre lo que te pida ahora. Si te falta algún dato, no te traben: hacé una versión razonable y marcá entre [corchetes] lo que la persona debería completar. No inventes datos personales ni cifras que no te haya dado.`;
}

/** Mensaje del usuario para el caso real. */
export function casoUserMsg(s: AbcState): string {
  const t = getTarjeta(s.tarjeta);
  const sub = t?.subtareas.find((x) => x.id === s.subtarea);
  const pedido = sub?.pedido ?? "Ayudame con esto.";
  const detalle = s.detalle.trim() || "(No agregué detalles; hacé una versión de ejemplo simple que yo pueda ajustar.)";
  return `${pedido}\n\nEsto es lo que tengo:\n${detalle}`;
}

// --- Copiloto (igual que Marquito, tono principiante) -------------------

const AYUDA_PASO: Record<number, string> = {
  0: "Está en el onboarding: escribe qué hace en el día a día y elige una o dos situaciones que le suenan. Si no sabe qué poner, dale ejemplos simples.",
  1: "Está leyendo las analogías (el asistente nuevo, el chef). Es solo para entender la idea; no hay que hacer nada más que leer y seguir.",
  2: "Está probando la diferencia entre un prompt flojo y uno bien hecho (método COTIO), corriendo los dos en la app. Explicale que cuanto mejor le explica a la IA, mejor le responde; podés repasarle las letras de COTIO en palabras simples.",
  3: "Está armando su memoria: responde 4 preguntas con opciones y la app le arma un texto para pegar en cualquier IA. Explicale que ese texto hace que la IA lo conozca y le responda mejor.",
  4: "Está en PROBÁ TU MEMORIA (ida y vuelta): copia su prompt de memoria, lo pega en una IA y hace una pregunta; después hace la misma pregunta SIN la memoria, en otra conversación, y compara. Ayudalo a hacer el viaje (copiar → pegar → volver) y a notar el contraste con y sin memoria.",
  5: "Está en su primer caso real: eligió una tarjeta (negocio, finanzas o lo cotidiano), elige qué quiere hacer y escribe un detalle; la IA le genera el resultado dentro de la app. Ayudalo a pedir mejor o a ajustar el resultado.",
  6: "Está en el cierre: anota una cosa que aprendió hoy.",
  7: "Está en RECURSOS: una lista de herramientas de IA (ChatGPT, Claude, Gemini, NotebookLM, Gamma, Suno, Napkin) con para qué sirve cada una y un botón para abrirlas. Si pregunta cuál usar, orientalo según lo que quiera hacer.",
};

export interface AbcCtx {
  paso: number;
  tarjeta: string | null;
}

export function buildAbcCopilotoSystem(ctx: AbcCtx): string {
  const t = getTarjeta(ctx.tarjeta);
  return `Sos el copiloto de un taller llamado "La IA no es Google", para personas que NUNCA usaron inteligencia artificial. Hablás en español rioplatense, muy cálido, paciente y simple. Nada de tecnicismos. Respuestas cortas (2-4 oraciones), de a un paso. Tranquilizás: acá nadie se queda atrás.

DÓNDE ESTÁ LA PERSONA AHORA: ${AYUDA_PASO[ctx.paso] ?? AYUDA_PASO[0]}${t ? ` Eligió la tarjeta "${t.titulo}".` : ""}

LO QUE SÍ HACÉS:
- Explicás con palabras de todos los días qué hacer en cada paso y para qué sirve.
- Das ejemplos concretos cuando no saben qué escribir.
- Ayudás a pedirle mejor a la IA (más contexto, qué quieren lograr).

LO QUE NO HACÉS:
- No hacés la tarea por la persona: la guiás para que la haga ella.
- No te ponés técnico ni largo. Si algo es complejo, lo bajás a una analogía simple.
- Si preguntan algo muy fuera del taller, los traés de vuelta con amabilidad.`;
}
