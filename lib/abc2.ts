// ============================================================
// Clase 2 · "Tu equipo invisible" (/abc2) — continuación de /abc.
// Reconoce al participante por nombre contra la base de la Clase 1,
// precarga su perfil y arma un "kit" (prompt contextual + problema +
// flujo de herramientas + mini-reto) a medida de su rubro.
// ============================================================

import { SITUACIONES, type AbcState } from "./abc";

export const ABC2_SLUG = "abc2";
export const ABC2_TITLE = "Tu equipo invisible — Clase 2";
export const ABC2_ACTIVITY = "abc2";
export const ABC2_ITEM = "state";

// ⚠️ Pegá acá el link de invitación del grupo de WhatsApp del taller.
export const WHATSAPP_GRUPO = "";

// --- Perfil que viaja por todos los módulos (viene de la Clase 1) --------

export interface Perfil {
  nombre: string;
  rubro: string; // ocupación de la Clase 1
  leCostaba: string; // qué le costaba
  casoTrabajado: string; // el caso que hizo
  seLlevo: string; // lo que se llevó
  contexto: string; // línea corta para la lista de candidatos
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const claves = (nombre: string) => {
  const t = norm(nombre).split(" ").filter(Boolean);
  return t.length >= 2 ? [t[0], t[t.length - 1]] : t;
};

/** Construye perfiles deduplicados a partir de los datos crudos de la Clase 1. */
export function profilesFromClase1(
  parts: { id: string; name: string }[],
  rows: { participant_id: string; payload: AbcState }[],
): Perfil[] {
  const stByP: Record<string, AbcState> = {};
  for (const r of rows) stByP[r.participant_id] = r.payload;
  const sitLabel = (id: string) => SITUACIONES.find((x) => x.id === id)?.label ?? id;

  const perfiles: (Perfil & { _score: number })[] = [];
  for (const p of parts) {
    const st = stByP[p.id];
    if (!st) continue;
    const leCostaba = [
      ...(st.situaciones ?? []).filter((x) => x !== "otro").map(sitLabel),
      st.situacionOtro?.trim(),
    ]
      .filter(Boolean)
      .join("; ");
    const caso = [st.tarjeta, st.subtarea, st.detalle?.trim()].filter(Boolean).join(" · ").slice(0, 200);
    const rubro = (st.ocupacion ?? "").trim();
    const contexto = rubro ? rubro.replace(/\s+/g, " ").slice(0, 60) : "sin datos de rubro";
    const score = (st.paso ?? 0) + (st.completado ? 5 : 0) + (rubro ? 3 : 0) + (st.aprendi ? 2 : 0);
    perfiles.push({
      nombre: p.name,
      rubro,
      leCostaba,
      casoTrabajado: caso,
      seLlevo: (st.aprendi ?? "").trim(),
      contexto,
      _score: score,
    });
  }

  // dedupe por nombre normalizado (nombre+apellido), quedándose con el mejor
  const best: Record<string, Perfil & { _score: number }> = {};
  for (const p of perfiles) {
    const k = claves(p.nombre).join(" ");
    if (!best[k] || p._score > best[k]._score) best[k] = p;
  }
  return Object.values(best)
    .filter((p) => p.rubro) // descarta ingresos vacíos / de prueba sin rubro
    .map(({ _score, ...rest }) => rest)
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export type MatchResult =
  | { tipo: "exacto"; perfil: Perfil }
  | { tipo: "candidatos"; candidatos: Perfil[] }
  | { tipo: "nuevo" };

/** Cruza un nombre tipeado contra los perfiles de la Clase 1. */
export function reconocer(nombre: string, perfiles: Perfil[]): MatchResult {
  const nn = norm(nombre);
  const inTok = new Set(nn.split(" ").filter(Boolean));
  if (inTok.size === 0) return { tipo: "nuevo" };
  // 1) igualdad exacta de nombre completo (cubre nombres de una sola palabra)
  const igual = perfiles.find((p) => norm(p.nombre) === nn);
  if (igual) return { tipo: "exacto", perfil: igual };
  // 2) match por nombre + apellido
  const exact = perfiles.find((p) => {
    const kt = claves(p.nombre);
    return kt.length >= 2 && kt.every((t) => inTok.has(t)) && inTok.size <= 3;
  });
  if (exact) return { tipo: "exacto", perfil: exact };
  // candidatos: comparten al menos un token de nombre (>= 3 letras)
  const cand = perfiles.filter((p) =>
    norm(p.nombre)
      .split(" ")
      .some((t) => t.length >= 3 && inTok.has(t)),
  );
  if (cand.length) return { tipo: "candidatos", candidatos: cand.slice(0, 6) };
  return { tipo: "nuevo" };
}

// --- Mapa de herramientas (Módulo 3 referencia) --------------------------

export interface Herramienta {
  id: string;
  nombre: string;
  emoji: string;
  fuerte: string;
}
export const HERRAMIENTAS: Herramienta[] = [
  { id: "claude", nombre: "Claude", emoji: "🟣", fuerte: "razonar, redactar, analizar, iterar" },
  { id: "gemini", nombre: "Gemini", emoji: "🔵", fuerte: "investigar con fuentes e info actualizada" },
  { id: "notebooklm", nombre: "NotebookLM", emoji: "📓", fuerte: "tus propios documentos (corpus cerrado)" },
  { id: "gpt", nombre: "ChatGPT", emoji: "🟢", fuerte: "asistente general, versátil" },
];

// --- Flujos preconstruidos por categoría de problema ---------------------

export interface PasoFlujo {
  herramienta: string; // nombre visible
  que: string; // qué hace ahí
}
export interface Flujo {
  id: string;
  titulo: string;
  pasos: PasoFlujo[];
}

export const FLUJOS: Flujo[] = [
  {
    id: "asistente-faq",
    titulo: "Un asistente que responde por vos",
    pasos: [
      { herramienta: "NotebookLM", que: "Cargá tu lista de precios y las preguntas que más te hacen." },
      { herramienta: "Claude (Project)", que: "Armá un asistente que responda como tu negocio, con tu tono." },
      { herramienta: "Claude", que: "Probalo con preguntas reales y ajustá lo que no suene bien." },
    ],
  },
  {
    id: "redes-contenido",
    titulo: "Contenido para redes",
    pasos: [
      { herramienta: "Gemini", que: "Investigá qué hacen otros de tu rubro y qué funciona hoy." },
      { herramienta: "Claude", que: "Armá un plan de contenido y los textos de los posts." },
      { herramienta: "Edición de imágenes", que: "Generá/ajustá las imágenes para que no parezcan hechas con IA." },
    ],
  },
  {
    id: "ordenar-docs",
    titulo: "Ordenar y resumir tus documentos",
    pasos: [
      { herramienta: "NotebookLM", que: "Subí los documentos (reportes, expedientes, planillas)." },
      { herramienta: "Claude", que: "Pedile un resumen ordenado (por fecha, vencimiento o tema)." },
      { herramienta: "Claude", que: "Iterá hasta tener la salida como la necesitás." },
    ],
  },
  {
    id: "propuesta-comercial",
    titulo: "Armar una propuesta comercial",
    pasos: [
      { herramienta: "Gemini", que: "Buscá datos/novedades verificables que respalden la propuesta." },
      { herramienta: "Claude (Project)", que: "Redactá la propuesta con tu contexto y tu tono." },
      { herramienta: "NotebookLM", que: "Cargá tus modelos previos para mantener coherencia." },
    ],
  },
  {
    id: "captacion",
    titulo: "Conseguir más clientes",
    pasos: [
      { herramienta: "Claude", que: "Definí tu propuesta de valor: qué ofrecés y a quién." },
      { herramienta: "Gemini", que: "Identificá dónde están tus clientes y qué canales usar." },
      { herramienta: "Claude", que: "Generá el contenido/mensajes para esos canales." },
    ],
  },
  {
    id: "organizar-negocio",
    titulo: "Ordenar la información del negocio",
    pasos: [
      { herramienta: "Claude", que: "Volcá todo lo que tenés suelto y pedile que lo ordene en áreas." },
      { herramienta: "NotebookLM", que: "Sumá tus reportes/planillas como fuente." },
      { herramienta: "Claude", que: "Armá un plan simple de seguimiento." },
    ],
  },
];

export function getFlujo(id: string | null | undefined): Flujo | null {
  return FLUJOS.find((f) => f.id === id) ?? null;
}

// --- Kits curados por participante (problemas + mini-reto) ---------------

export interface Problema {
  titulo: string;
  flujoId: string;
}
export interface Kit {
  problemas: Problema[];
  miniReto: string;
}

// keyed por nombre normalizado "nombre apellido"
const KITS: { nombre: string; kit: Kit }[] = [
  { nombre: "Quesada Lucas", kit: { problemas: [
    { titulo: "Que un asistente responda las consultas de siempre", flujoId: "asistente-faq" },
    { titulo: "Armar promos y contenido para redes", flujoId: "redes-contenido" },
    { titulo: "Ordenar las cuentas corrientes", flujoId: "ordenar-docs" },
  ], miniReto: "Esta semana probá el asistente de LAND respondiendo cinco preguntas frecuentes reales y ajustá lo que no suene bien." } },
  { nombre: "meli", kit: { problemas: [
    { titulo: "Ordenar la info del negocio (compras y administración)", flujoId: "organizar-negocio" },
    { titulo: "Separar lo del trabajo y lo del Trapiche", flujoId: "organizar-negocio" },
    { titulo: "Un asistente para responder pedidos", flujoId: "asistente-faq" },
  ], miniReto: "Esta semana armá el prompt contextual del Trapiche y usalo para ordenar tus compras de la semana." } },
  { nombre: "Dodo", kit: { problemas: [
    { titulo: "Que más gente conozca el club", flujoId: "redes-contenido" },
    { titulo: "Organizar la comunicación con socios", flujoId: "organizar-negocio" },
    { titulo: "Contenido para la cantina", flujoId: "redes-contenido" },
  ], miniReto: "Esta semana armá el prompt contextual del club y generá tres ideas de post para Instagram." } },
  { nombre: "Aguitos", kit: { problemas: [
    { titulo: "Ordenar los cheques por vencimiento", flujoId: "ordenar-docs" },
    { titulo: "Resumir datos financieros", flujoId: "ordenar-docs" },
    { titulo: "Responder consultas más rápido", flujoId: "asistente-faq" },
  ], miniReto: "Esta semana cargá tus documentos en NotebookLM y sacá un resumen ordenado por vencimiento." } },
  { nombre: "Verónica", kit: { problemas: [
    { titulo: "Ordenar y resumir expedientes", flujoId: "ordenar-docs" },
    { titulo: "Armar un índice de cada expediente", flujoId: "ordenar-docs" },
  ], miniReto: "Esta semana subí un expediente a NotebookLM y pedile un resumen con los puntos clave." } },
  { nombre: "Marcelo", kit: { problemas: [
    { titulo: "Armar propuestas de asesoramiento", flujoId: "propuesta-comercial" },
    { titulo: "Explicar seguros de forma simple", flujoId: "propuesta-comercial" },
    { titulo: "Captar más clientes", flujoId: "captacion" },
  ], miniReto: "Esta semana armá una propuesta comercial para un cliente real usando tu prompt contextual." } },
  { nombre: "Milagros", kit: { problemas: [
    { titulo: "Organizar los pedidos de la pizzería", flujoId: "organizar-negocio" },
    { titulo: "Promos y contenido para la pizzería", flujoId: "redes-contenido" },
    { titulo: "Ordenar tareas (sin datos sensibles del juzgado)", flujoId: "ordenar-docs" },
  ], miniReto: "Esta semana armá el prompt contextual de la pizzería y generá dos promos para el finde." } },
  { nombre: "Maria Acuña", kit: { problemas: [
    { titulo: "Conseguir más clientes", flujoId: "captacion" },
    { titulo: "Armar contenido profesional", flujoId: "redes-contenido" },
    { titulo: "Ordenar tu oferta de servicios", flujoId: "organizar-negocio" },
  ], miniReto: "Esta semana definí tu propuesta de valor con Claude y armá un mensaje para difundir tus servicios." } },
  { nombre: "Sebastián Rodriguez", kit: { problemas: [
    { titulo: "Ordenar la operación de la distribuidora", flujoId: "organizar-negocio" },
    { titulo: "Contenido y promos para clientes", flujoId: "redes-contenido" },
    { titulo: "Un asistente para pedidos frecuentes", flujoId: "asistente-faq" },
  ], miniReto: "Esta semana armá el prompt contextual de la distribuidora y ordená tu operativa de la semana." } },
  { nombre: "Federico Javier", kit: { problemas: [
    { titulo: "Resumir y ordenar documentos", flujoId: "ordenar-docs" },
    { titulo: "Preparar material para tus clases", flujoId: "organizar-negocio" },
    { titulo: "Conseguir clientes para tu estudio", flujoId: "captacion" },
  ], miniReto: "Esta semana usá tu asistente para resumir un fallo o preparar una clase, y registrá qué salió." } },
  { nombre: "Leonor", kit: { problemas: [
    { titulo: "Potenciar la gestión y creatividad del equipo", flujoId: "organizar-negocio" },
    { titulo: "Explorar ideas y alternativas distintas", flujoId: "propuesta-comercial" },
  ], miniReto: "Esta semana usá tu asistente para preparar una reunión de equipo con tres enfoques distintos." } },
  { nombre: "Florencia", kit: { problemas: [
    { titulo: "Ordenar tareas administrativas", flujoId: "organizar-negocio" },
    { titulo: "Redactar mensajes y mails más rápido", flujoId: "asistente-faq" },
  ], miniReto: "Esta semana armá tu prompt contextual y usalo para escribir tres mails de trabajo." } },
  { nombre: "Carlos Arnau", kit: { problemas: [
    { titulo: "Organizar y resumir lo que tengo que estudiar", flujoId: "ordenar-docs" },
    { titulo: "Preparar un trabajo práctico o una exposición", flujoId: "organizar-negocio" },
    { titulo: "Ordenar mi semana entre el estudio y el rugby", flujoId: "organizar-negocio" },
  ], miniReto: "Esta semana subí los apuntes de una materia a NotebookLM y pedile un resumen para estudiar para la próxima prueba." } },
  { nombre: "Benjamin de la Torre", kit: { problemas: [
    { titulo: "Ordenar la información de la empresa", flujoId: "organizar-negocio" },
    { titulo: "Un asistente para las tareas de todos los días", flujoId: "asistente-faq" },
    { titulo: "Analizar datos para tomar decisiones", flujoId: "ordenar-docs" },
  ], miniReto: "Esta semana armá el prompt contextual de tu empresa y usalo para ordenar una tarea concreta de la semana." } },
  { nombre: "Marco Rossi", kit: { problemas: [
    { titulo: "Preparar material para mis clases", flujoId: "organizar-negocio" },
    { titulo: "Generar contenido (posts, apuntes, ejercicios)", flujoId: "redes-contenido" },
    { titulo: "Resumir y ordenar información", flujoId: "ordenar-docs" },
  ], miniReto: "Esta semana usá tu asistente para preparar una clase o un contenido, y registrá qué salió." } },
];

/** Genérico cuando no hay kit curado (o es participante nuevo). */
export function kitGenerico(rubro: string): Kit {
  const r = rubro ? `tu rubro (${rubro.slice(0, 40)})` : "lo tuyo";
  return {
    problemas: [
      { titulo: `Ordenar la información de ${r}`, flujoId: "organizar-negocio" },
      { titulo: `Un asistente que responda por vos`, flujoId: "asistente-faq" },
      { titulo: `Contenido para difundir lo que hacés`, flujoId: "redes-contenido" },
    ],
    miniReto: "Esta semana armá tu prompt contextual y usalo para resolver una tarea concreta de tu semana.",
  };
}

export function kitPara(perfil: Perfil | null): Kit {
  if (!perfil) return kitGenerico("");
  const inTok = new Set(norm(perfil.nombre).split(" ").filter(Boolean));
  const hit = KITS.find((e) => claves(e.nombre).every((t) => inTok.has(t)));
  return hit ? hit.kit : kitGenerico(perfil.rubro);
}

// --- Módulo 2 · generador de prompt contextual ---------------------------

export interface PromptSeed {
  queHaces: string;
  paraQuien: string;
  comoSuena: string;
  objetivo: string;
}

/** Borrador precargado de los 4 campos, a partir del perfil de la Clase 1. */
export function seedPrompt(perfil: Perfil | null): PromptSeed {
  return {
    queHaces: perfil?.rubro ?? "",
    paraQuien: "",
    comoSuena: "cercano, claro y directo",
    objetivo: perfil?.leCostaba ? `Me cuesta: ${perfil.leCostaba}. Quiero resolver eso.` : "",
  };
}

export const PC_SYSTEM = `Sos un asistente que ayuda a una persona a crear el "prompt contextual" (memoria institucional) de su negocio o proyecto, para pegar en las instrucciones de un Project de Claude o ChatGPT.

A partir de los datos que te paso, redactá ese texto siguiendo estas reglas ESTRICTAS:
- En PRIMERA PERSONA (como si lo escribiera la persona: "Tengo…", "Mi objetivo es…").
- Lenguaje natural, SIN markdown, sin títulos, sin viñetas, sin asteriscos: es un texto corrido en párrafos.
- Que incluya: quién es y qué hace, para quién trabaja o a quién le vende, el tono con el que quiere que le respondan, y su objetivo principal.
- Arrancá con algo como "Quiero que recuerdes esto sobre mí y mi trabajo cada vez que hablemos:".
- Concreto y usable, sin relleno. Español rioplatense.

Devolvé SOLO ese texto, nada más.`;

export function buildPcUser(s: {
  pcQueHaces: string;
  pcParaQuien: string;
  pcComoSuena: string;
  pcObjetivo: string;
}): string {
  return `Datos:
- Qué hago / mi proyecto: ${s.pcQueHaces || "(no especificado)"}
- Para quién trabajo / a quién le vendo: ${s.pcParaQuien || "(no especificado)"}
- Cómo quiero que suene el asistente: ${s.pcComoSuena || "cercano y claro"}
- Mi objetivo principal: ${s.pcObjetivo || "(no especificado)"}`;
}

// --- Módulos (stepper) ---------------------------------------------------

export interface ModuloDef {
  n: number;
  titulo: string;
  short: string;
  bajada: string;
}
export const MODULOS: ModuloDef[] = [
  { n: 0, titulo: "Sos vos", short: "Ingreso", bajada: "Te reconocemos de la Clase 1." },
  { n: 1, titulo: "Tu prompt contextual", short: "Prompt", bajada: "La memoria de tu negocio, lista para tu Project." },
  { n: 2, titulo: "Tu problema y tu flujo", short: "Flujo", bajada: "Elegí qué resolver y con qué herramientas, en orden." },
  { n: 3, titulo: "Manos a la obra", short: "Práctica", bajada: "Ejecutá tu flujo y contanos qué salió." },
  { n: 4, titulo: "Cierre", short: "Cierre", bajada: "Tu reto de la semana y el mes de consultas." },
];

// --- Estado del participante --------------------------------------------

export interface Abc2State {
  modulo: number; // máximo alcanzado (0..4)
  perfil: Perfil | null;
  esNuevo: boolean;
  // M2
  pcQueHaces: string;
  pcParaQuien: string;
  pcComoSuena: string;
  pcObjetivo: string;
  promptContextual: string; // resultado generado
  // M3
  problema: string;
  problemaPropio: string;
  flujoId: string | null;
  // M4
  registro: string;
  // M5
  miniReto: string;
  completado: boolean;
  copilotoUsos: number;
}

export function emptyAbc2State(): Abc2State {
  return {
    modulo: 0,
    perfil: null,
    esNuevo: false,
    pcQueHaces: "",
    pcParaQuien: "",
    pcComoSuena: "",
    pcObjetivo: "",
    promptContextual: "",
    problema: "",
    problemaPropio: "",
    flujoId: null,
    registro: "",
    miniReto: "",
    completado: false,
    copilotoUsos: 0,
  };
}

// --- Copiloto -----------------------------------------------------------

const AYUDA_MOD: Record<number, string> = {
  0: "Se está identificando: escribe su nombre y la app lo reconoce de la Clase 1. Si no aparece, elige de una lista o entra como nuevo.",
  1: "Está armando su prompt contextual (la memoria de su negocio) a partir de 4 campos; la app lo genera con IA para pegar en un Project. Ayudalo a completar los campos con ejemplos concretos de su rubro.",
  2: "Está eligiendo un problema concreto y viendo el flujo de herramientas sugerido (qué herramienta en cada paso). Ayudalo a entender qué hace cada paso y a adaptarlo.",
  3: "Está ejecutando su flujo y registrando qué salió. Ayudalo a pedir mejor, a encadenar (el output de una es el input de la siguiente) y a no frustrarse si el primer intento no sale.",
  4: "Está en el cierre: su reto de la semana y cómo usar el grupo de WhatsApp para consultas. Reforzá el compromiso.",
};

export function buildAbc2CopilotoSystem(ctx: { modulo: number; perfil: Perfil | null }): string {
  const quien = ctx.perfil ? `${ctx.perfil.nombre} (${ctx.perfil.rubro.slice(0, 60)})` : "un participante nuevo";
  return `Sos el copiloto de la Clase 2 "Tu equipo invisible", un taller de IA para personas que recién empiezan (ya hicieron la Clase 1). Hablás en español rioplatense, cálido, simple y breve (2-4 oraciones). Nada de tecnicismos.

LA IDEA DE LA CLASE: usar varias IA en secuencia (un "equipo invisible") coordinadas por la persona, sin programar. El output de una herramienta es el input de la siguiente. Herramientas: Claude (razonar/redactar), Gemini (investigar con fuentes), NotebookLM (tus documentos).

QUIÉN ES: ${quien}.
DÓNDE ESTÁ: ${AYUDA_MOD[ctx.modulo] ?? AYUDA_MOD[0]}

Ayudás a pensar y a pedir mejor; no hacés la tarea por la persona. Si se traba, bajá todo a un ejemplo de su rubro.`;
}
