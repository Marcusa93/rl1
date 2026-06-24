// ============================================================
// Clase 2 · "La Posta" — Encadenar varias IA para un caso propio
// Diplomatura en IA y Derecho · UNT · RL1 Abogados
//
// La app NO procesa nada: es la DIRECTORA de la posta. Marca en qué
// estación estás, qué tenés que sacar de cada herramienta y a dónde vas
// después. Cada estación abre la herramienta correcta en otra pestaña
// (NotebookLM / Claude / ChatGPT) y entrega el prompt listo para copiar.
//
// El "testigo de la posta" es el PASE: copiar lo que salió de una
// herramienta y pegarlo en la app antes de seguir a la siguiente.
// ============================================================

export const POSTA_SLUG = "posta";
export const POSTA_TITLE = "Clase 2 · La Posta — varias IA en cadena";

export const NOTEBOOKLM_URL = "https://notebooklm.google.com/";

// --- Caso propio vs. caso de ejemplo -------------------------------------

export type ModoCaso = "propio" | "ejemplo";

/** Qué tiene que traer/subir quien usa SU PROPIO caso. */
export const CHECKLIST_PROPIO: string[] = [
  "El escrito o la pieza central (demanda, contestación, sentencia, contrato…).",
  "La prueba o documentos que tengas en texto o PDF (cartas documento, recibos, actas).",
  "Un par de líneas tuyas con qué querés lograr (ej.: «redactar la sección de hechos»).",
];

export interface CasoEjemplo {
  id: string;
  area: string;
  emoji: string;
  titulo: string;
  resumen: string;
  /** Archivo .txt en /public/posta para subir como fuente a NotebookLM. */
  file: string;
}

// Tres ejemplos alineados a las áreas que más pidió el grupo en la Clase 1
// (laboral, familia, consumo). Material ficticio, listo para subir.
export const CASOS_EJEMPLO: CasoEjemplo[] = [
  {
    id: "laboral",
    area: "Laboral",
    emoji: "⚙️",
    titulo: "Despido sin causa con jornada no registrada",
    resumen:
      "Vendedora de comercio despedida sin causa; reclama sábados trabajados sin registrar y comisiones impagas. Intercambio epistolar y recibos.",
    file: "/posta/ejemplo-laboral.txt",
  },
  {
    id: "familia",
    area: "Familia",
    emoji: "👨‍👩‍👧",
    titulo: "Alimentos y canasta de crianza",
    resumen:
      "Demanda de alimentos a favor de una hija; el progenitor factura de manera informal. Hace falta ordenar hechos, prueba de ingresos y necesidades.",
    file: "/posta/ejemplo-familia.txt",
  },
  {
    id: "consumo",
    area: "Consumidor",
    emoji: "🛒",
    titulo: "Contestación de demanda de consumo",
    resumen:
      "Concesionaria demandada por una acción de consumo. Se trabaja falta de legitimación pasiva, contrato de adhesión y reproche al actor.",
    file: "/posta/ejemplo-consumo.txt",
  },
];

export function getEjemplo(id: string | null | undefined): CasoEjemplo | null {
  return CASOS_EJEMPLO.find((c) => c.id === id) ?? null;
}

// --- Las tres estaciones (mapa mental para la clase) ---------------------

export interface EstacionDef {
  n: number;
  titulo: string;
  short: string;
  bajada: string;
}

export const ESTACIONES: EstacionDef[] = [
  {
    n: 0,
    titulo: "Tu caso",
    short: "Tu caso",
    bajada: "Elegí con qué vas a trabajar: tu propio caso o uno de ejemplo.",
  },
  {
    n: 1,
    titulo: "Anclar las fuentes",
    short: "NotebookLM",
    bajada: "Subí tu material a NotebookLM y destilalo. Es la base que no inventa.",
  },
  {
    n: 2,
    titulo: "Armar tu asistente",
    short: "Proyecto",
    bajada: "Creá un Proyecto en Claude o ChatGPT y dejalo configurado con tu caso.",
  },
  {
    n: 3,
    titulo: "Redactar tu caso",
    short: "Redactar",
    bajada: "Hacele la primera consulta y mirá cómo responde con todo el contexto.",
  },
];

// --- Prompts listos para copiar (uno por estación) -----------------------

/**
 * Estación 1 — destilar en NotebookLM.
 * Se ejecuta DENTRO de NotebookLM, sobre las fuentes ya cargadas. Por eso
 * insiste en NO inventar: NotebookLM responde anclado a las fuentes.
 */
export const DESTILADO_PROMPT = `A partir EXCLUSIVAMENTE de las fuentes que cargué en este cuaderno (no agregues nada que no esté en ellas), armá un RESUMEN ESTRUCTURADO de mi caso para usarlo después como base de trabajo.

Devolvélo con estas secciones:
1. CARÁTULA Y PARTES: quién es quién (actor, demandado, rol procesal) y fuero/jurisdicción si surge.
2. HECHOS EN ORDEN CRONOLÓGICO: lista de hechos con fecha cuando exista, en lenguaje neutro y factual.
3. PRUEBA DISPONIBLE: qué documento o prueba respalda cada hecho.
4. NORMATIVA O DERECHO MENCIONADO: solo lo que aparezca citado en las fuentes.
5. DATOS FALTANTES: qué información necesaria NO surge de las fuentes.

Reglas:
- Si algo no surge de las fuentes, escribí "No surge de las fuentes". No lo completes de memoria.
- No inventes fallos, artículos ni datos.
- Citá entre paréntesis de qué fuente sale cada punto importante.`;

/**
 * Estación 2 — instrucciones del Proyecto (system prompt).
 * Se pega en el campo "instrucciones" del Proyecto de Claude/ChatGPT.
 * A diferencia del laboratorio anterior, acá SÍ va a redactar: el objetivo
 * de la clase es producir la sección de hechos del caso propio.
 */
export const SYSTEM_PROMPT_POSTA = `Sos un asistente de redacción jurídica especializado en derecho argentino. Trabajás sobre EL CASO cuyas fuentes están cargadas en este Proyecto.

REGLAS:
1. Basate solo en las fuentes cargadas y en lo que yo te indique. Si falta un dato, preguntámelo: nunca lo inventes.
2. No inventás jurisprudencia ni artículos. Si no estás seguro de que un fallo o una norma existe, lo decís expresamente.
3. Escribís en español jurídico argentino, con tono formal y claro.
4. Cuando redactes hechos, los ordenás cronológicamente, en primera persona del plural (esta parte), con narración solo factual: sin valoraciones, sin derecho y sin petitorio.
5. Marcás entre [corchetes] cualquier dato que yo deba completar o verificar antes de presentar.`;

/** Explicación de cada parte del system prompt (la app la muestra al lado). */
export const SYSTEM_PROMPT_PARTES: { titulo: string; texto: string }[] = [
  {
    titulo: "Quién es (rol)",
    texto: "La primera línea le da identidad y especialidad: asistente de redacción jurídica argentina sobre TU caso.",
  },
  {
    titulo: "Qué NO hace (anti-alucinación)",
    texto: "Reglas 1 a 3: no inventa datos, fallos ni normas, y avisa cuando algo no surge de las fuentes.",
  },
  {
    titulo: "Cómo escribe (formato)",
    texto: "Reglas 4 y 5: estilo formal, hechos en orden cronológico y solo factuales, con [corchetes] para lo que falta verificar.",
  },
];

/** Estación 3 — primera consulta al asistente ya armado. */
export const PRIMERA_CONSULTA_PROMPT = `Con las fuentes cargadas en este Proyecto, redactá la SECCIÓN DE HECHOS de mi escrito.

- Orden cronológico, en primera persona del plural.
- Solo hechos: sin derecho, sin valoraciones y sin petitorio.
- Donde falte un dato, dejá un [corchete] con lo que tengo que completar.

Al final, listá los 3 datos que debería verificar o completar antes de presentar el escrito.`;

// --- Marquito · copiloto de la clase (OpenRouter) ------------------------
// Marquito NO procesa documentos ni hace el trabajo jurídico: orienta sobre
// el uso de la app y el método. Ve en qué estación está el estudiante para
// ayudar justo donde está parado (la duda que más se repitió en la Clase 1:
// "dónde estoy, qué hago ahora, a dónde voy después").

/** Guía por estación: qué está haciendo y dónde se suele trabar. */
const AYUDA_ESTACION: Record<number, string> = {
  0: "Está eligiendo con qué caso trabajar: el propio (sube su material) o uno de ejemplo (lo descarga). Si no sabe cuál, sugerile el de ejemplo de su área.",
  1: "Estación 1 (NotebookLM): tiene que abrir NotebookLM en otra pestaña, subir su material como fuente, copiar el prompt de destilado, y pegar en la app lo que NotebookLM le devolvió (el pase). Dudas típicas: no encuentra dónde subir el archivo, no sabe si volver a la app, no le sale el botón.",
  2: "Estación 2 (Proyecto): crea un Proyecto nuevo en Claude o ChatGPT, pega las instrucciones (system prompt) que le da la app, y carga sus fuentes al Proyecto. Dudas típicas: no encuentra dónde crear el Proyecto, dónde pegar las instrucciones, qué subir.",
  3: "Estación 3 (Redactar): le hace la primera consulta a su asistente ya armado y pega el borrador en la app. Dudas típicas: la respuesta salió genérica (suele ser porque no cargó bien las fuentes en el Proyecto).",
};

export interface MarquitoCtx {
  estacion: number;
  modo: ModoCaso | null;
  ejemplo: string | null;
}

export function buildMarquitoSystem(ctx: MarquitoCtx): string {
  const ej = getEjemplo(ctx.ejemplo);
  const caso =
    ctx.modo === "propio"
      ? "su PROPIO caso"
      : ej
        ? `un caso de ejemplo (${ej.area}: ${ej.titulo})`
        : "todavía no eligió caso";

  return `Sos "Marquito", el copiloto de la clase 2 "La Posta" de la Diplomatura en IA y Derecho (UNT), para abogados y abogadas. Hablás en español rioplatense, cálido, breve y tranquilizador. Tuteás. Respuestas cortas (2-5 oraciones), concretas y de a un paso. Si la persona está perdida, primero ubicala: dónde está, qué hace ahora, a dónde va después.

QUÉ ES LA CLASE: el estudiante encadena varias IA para trabajar un caso. El recorrido es una posta de 3 estaciones: (1) NotebookLM para anclar las fuentes y destilar el caso, (2) crear un Proyecto en Claude o ChatGPT y configurarlo con un system prompt y las fuentes, (3) hacerle la primera consulta y redactar la sección de hechos. El "pase" es copiar lo que sale de una herramienta y pegarlo en la siguiente; la app es la directora de la posta, no procesa nada.

DÓNDE ESTÁ AHORA EL ESTUDIANTE: ${AYUDA_ESTACION[ctx.estacion] ?? AYUDA_ESTACION[0]} Está trabajando con ${caso}.

LO QUE SÍ PODÉS HACER:
- Orientar sobre el uso de la app: en qué estación está, qué tiene que hacer ahora y a dónde sigue.
- Resolver dudas operativas: dónde está un botón o link, cómo abrir NotebookLM/Claude/ChatGPT, cómo crear un Proyecto, dónde pegar las instrucciones, cómo hacer el pase, si tiene que ir a otra pestaña o quedarse.
- Ayudar con el MÉTODO de su caso: qué conviene subir como fuente, cómo mejorar un prompt, cómo leer críticamente lo que devolvió la IA, qué verificar en el borrador.
- Bajar la ansiedad: recordarle que va de a un paso y que nadie se queda atrás.

LO QUE NO HACÉS (y lo decís con amabilidad si te lo piden):
- No hacés el trabajo jurídico por la persona: no redactás la demanda/escrito completo ni decidís la estrategia. Ese criterio profesional es de ella; vos la guiás.
- No inventás jurisprudencia, fallos ni artículos. Si hace falta una cita, escribí "[verificar]" y aclará que debe chequearla en una fuente oficial.
- No analizás ni "leés" archivos dentro de la app: la app no corre IA sobre documentos. Eso pasa en NotebookLM o en su Proyecto de Claude/ChatGPT; vos explicás cómo.
- No te salís del recorrido de la clase ni adelantás cosas de otras instancias. Si preguntan algo ajeno, reconducí con suavidad hacia la posta.

Si no sabés algo de la app, decilo y sugerí tocar el botón de ayuda o avisar al docente.`;
}

// --- Estado per-participante (una sola respuesta, como en /expediente) ----

export const POSTA_ACTIVITY = "posta";
export const POSTA_ITEM = "state";

export type HerramientaProyecto = "claude" | "gpt";

export interface PostaState {
  modo: ModoCaso | null;
  ejemploId: string | null;
  estacion: number; // estación máxima alcanzada (0..3)
  destilado: string; // PASE 1: lo que devolvió NotebookLM
  conf1: string; // microconfirmación estación 1
  herramienta: HerramientaProyecto | null; // dónde armó el Proyecto
  conf2: string; // microconfirmación estación 2
  borrador: string; // PASE final: el texto/link que produjo
  completado: boolean;
  marquitoUsos: number; // cuántas veces consultó al copiloto (para el docente)
}

export function emptyPostaState(): PostaState {
  return {
    modo: null,
    ejemploId: null,
    estacion: 0,
    destilado: "",
    conf1: "",
    herramienta: null,
    conf2: "",
    borrador: "",
    completado: false,
    marquitoUsos: 0,
  };
}
