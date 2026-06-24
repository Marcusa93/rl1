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
//
// Dos ejes independientes:
//  - MATERIAL: caso propio (sube lo suyo) o caso de ejemplo (descarga piezas).
//  - TAREA: qué produce (redactar hechos / analizar sentencia / agravios / audiencia).
//  + un ejercicio aparte: "verificar una cita" (flujo distinto, con búsqueda).
// ============================================================

export const POSTA_SLUG = "posta";
export const POSTA_TITLE = "Clase 2 · La Posta — varias IA en cadena";

export const NOTEBOOKLM_URL = "https://notebooklm.google.com/";

export type ModoCaso = "propio" | "ejemplo" | "cita";

/** Qué tiene que traer/subir quien usa SU PROPIO caso. */
export const CHECKLIST_PROPIO: string[] = [
  "El escrito o la pieza central (demanda, contestación, sentencia, contrato…).",
  "La prueba o documentos que tengas en texto o PDF (cartas documento, recibos, actas).",
  "Un par de líneas tuyas con qué querés lograr.",
];

// --- Destilados (Estación 1, se ejecutan DENTRO de NotebookLM) ------------
// Insisten en NO inventar: NotebookLM responde anclado a las fuentes.

const DESTILADO_CASO = `A partir EXCLUSIVAMENTE de las fuentes que cargué en este cuaderno (no agregues nada que no esté en ellas), armá un RESUMEN ESTRUCTURADO de mi caso para usarlo después como base de trabajo.

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

const DESTILADO_SENTENCIA = `A partir EXCLUSIVAMENTE de las fuentes que cargué (no agregues nada que no esté en ellas), armá un MAPA del fallo para analizarlo después.

Devolvélo con estas secciones:
1. CARÁTULA Y PARTES: tribunal, fuero y quién es quién.
2. QUÉ SE PIDIÓ: pretensiones y planteos de cada parte (si surgen del expediente cargado).
3. HECHOS QUE EL TRIBUNAL TUVO POR ACREDITADOS.
4. PRUEBA QUE VALORÓ (y la que descartó, si lo dice).
5. NORMATIVA Y FUNDAMENTOS que invoca para decidir.
6. PARTE RESOLUTIVA: qué resolvió en concreto.
7. LO QUE NO SURGE DEL TEXTO: puntos que el fallo no explicita.

Reglas:
- Si algo no surge de las fuentes, escribí "No surge de las fuentes". No lo completes de memoria.
- No inventes fallos, artículos ni datos.
- Citá entre paréntesis el considerando o apartado de donde sale cada punto.`;

// --- Consultas (Estación 3, se pegan en el Proyecto ya armado) -----------

const CONSULTA_HECHOS = `Con las fuentes cargadas en este Proyecto, redactá la SECCIÓN DE HECHOS de mi escrito.

- Orden cronológico, en primera persona del plural.
- Solo hechos: sin derecho, sin valoraciones y sin petitorio.
- Donde falte un dato, dejá un [corchete] con lo que tengo que completar.

Al final, listá los 3 datos que debería verificar o completar antes de presentar el escrito.`;

const CONSULTA_ANALIZAR = `Con la sentencia cargada en este Proyecto, hacé un ANÁLISIS CRÍTICO para uso interno del tribunal.

1. Resumí en pocas líneas qué resolvió y con qué fundamentos centrales.
2. Evaluá la CONGRUENCIA: ¿lo resuelto se corresponde con los hechos planteados y la prueba valorada? Señalá desajustes (extra/ultra/citra petita) si los hubiera.
3. Marcá posibles vicios o puntos débiles: falta de fundamentación, prueba no valorada, saltos lógicos.
4. Indicá qué deberías verificar en el expediente o en la norma antes de afirmar cada observación.

No inventes jurisprudencia ni artículos: si hace falta una cita, escribí "[verificar]". No redactes un fallo nuevo; es un análisis.`;

const CONSULTA_AGRAVIOS = `Con la sentencia cargada en este Proyecto, ayudame a preparar la APELACIÓN (sin redactar el escrito todavía).

1. Identificá los puntos de la sentencia que me perjudican (lo que voy a apelar).
2. Para cada uno, esbozá el AGRAVIO: por qué el fallo está equivocado (error en los hechos, en la prueba, en el derecho o falta de fundamentación).
3. Señalá qué parte de la prueba o del expediente respalda cada agravio.
4. Marcá los agravios más fuertes y los más débiles, con una línea de por qué.

No inventes jurisprudencia ni artículos: si hace falta una cita, escribí "[verificar]". Es un punteo estratégico, no el memorial.`;

const CONSULTA_AUDIENCIA = `Con las fuentes cargadas en este Proyecto, ayudame a PREPARAR LA AUDIENCIA.

1. Resumí el caso en 5 puntos que tengo que tener fijos en la cabeza.
2. Hacé un punteo de los hechos y la prueba que voy a invocar, en el orden en que conviene plantearlos.
3. Sugerí preguntas para los testigos / la otra parte, agrupadas por tema.
4. Anticipá los 3 planteos más probables de la contraparte y cómo respondería a cada uno.

No inventes jurisprudencia ni artículos: si hace falta una cita, escribí "[verificar]". Es material de preparación, no un escrito.`;

// --- Tareas: qué produce el alumno --------------------------------------

export interface TareaDef {
  id: string;
  label: string;
  emoji: string;
  hint: string;
  destilado: string;
  consulta: string;
}

export const TAREAS: TareaDef[] = [
  {
    id: "hechos",
    label: "Redactar la sección de hechos",
    emoji: "✍️",
    hint: "Demanda o contestación: hechos en orden, solo factual.",
    destilado: DESTILADO_CASO,
    consulta: CONSULTA_HECHOS,
  },
  {
    id: "analizar-sentencia",
    label: "Analizar una sentencia",
    emoji: "🔎",
    hint: "Congruencia, fundamentos y posibles vicios del fallo.",
    destilado: DESTILADO_SENTENCIA,
    consulta: CONSULTA_ANALIZAR,
  },
  {
    id: "agravios",
    label: "De la sentencia a los agravios",
    emoji: "📑",
    hint: "Identificar los puntos para fundar una apelación.",
    destilado: DESTILADO_SENTENCIA,
    consulta: CONSULTA_AGRAVIOS,
  },
  {
    id: "audiencia",
    label: "Preparar una audiencia",
    emoji: "🎙️",
    hint: "Punteo de hechos, prueba, preguntas y previsibles de la otra parte.",
    destilado: DESTILADO_CASO,
    consulta: CONSULTA_AUDIENCIA,
  },
];

export function getTarea(id: string | null | undefined): TareaDef | null {
  return TAREAS.find((t) => t.id === id) ?? null;
}

// --- Casos de ejemplo (MATERIAL documental) -----------------------------
// Cada caso trae varias PIEZAS para descargar y subir como fuentes a
// NotebookLM (es lo que hace realista el ejercicio: sintetizar varias
// fuentes). Material ficticio. `tareas` = ids aplicables (la 1ª es default).

export interface Pieza {
  n: number;
  titulo: string;
  blurb: string; // por qué importa
  file: string; // ruta en /public
  img?: boolean; // true = imagen (NotebookLM la lee con OCR)
}

export interface CasoEjemplo {
  id: string;
  area: string;
  emoji: string;
  titulo: string;
  resumen: string;
  tareas: string[];
  piezas: Pieza[];
}

export const CASOS_EJEMPLO: CasoEjemplo[] = [
  {
    id: "laboral",
    area: "Laboral",
    emoji: "⚙️",
    titulo: "Despido sin causa con jornada no registrada",
    resumen:
      "Vendedora de comercio despedida sin causa; reclama sábados trabajados sin registrar y comisiones impagas.",
    tareas: ["hechos"],
    piezas: [
      {
        n: 1,
        titulo: "Telegrama de despido",
        blurb: "El despido sin causa, tal como llegó. Imagen: NotebookLM la lee con OCR.",
        file: "/posta/img/laboral-telegrama.png",
        img: true,
      },
      {
        n: 2,
        titulo: "Carta documento de intimación",
        blurb: "La intimación previa de la trabajadora (sábados y comisiones). Imagen con OCR.",
        file: "/posta/img/laboral-carta-documento.png",
        img: true,
      },
      {
        n: 3,
        titulo: "Recibo de haberes",
        blurb: "Comisiones en $0 y jornada solo de lunes a viernes. Imagen con OCR.",
        file: "/posta/img/laboral-recibo.png",
        img: true,
      },
      {
        n: 4,
        titulo: "Relato y cronología del caso",
        blurb: "El contexto narrado (ingreso, jornada, reclamos). Texto, por si querés el resumen.",
        file: "/posta/ejemplo-laboral.txt",
      },
    ],
  },
  {
    id: "familia",
    area: "Familia",
    emoji: "👨‍👩‍👧",
    titulo: "Alimentos y canasta de crianza",
    resumen:
      "Demanda de alimentos a favor de una hija; el progenitor factura de manera informal. Sirve para redactar hechos o preparar la audiencia.",
    tareas: ["hechos", "audiencia"],
    piezas: [
      {
        n: 1,
        titulo: "Relato y cronología",
        blurb: "Separación, aportes irregulares y necesidades de la niña.",
        file: "/posta/ejemplo-familia.txt",
      },
      {
        n: 2,
        titulo: "Comprobantes e indicios de ingresos",
        blurb: "Gastos del jardín y la obra social; señales de ingresos no declarados del progenitor.",
        file: "/posta/ejemplo-familia-prueba.txt",
      },
    ],
  },
  {
    id: "consumo",
    area: "Consumidor",
    emoji: "🛒",
    titulo: "Contestación de demanda de consumo",
    resumen:
      "Concesionaria demandada por una acción de consumo: falta de legitimación pasiva, contrato de adhesión y reproche al actor.",
    tareas: ["hechos"],
    piezas: [
      {
        n: 1,
        titulo: "Relato de la empresa y puntos de defensa",
        blurb: "La versión de la demandada y los ejes para contestar.",
        file: "/posta/ejemplo-consumo.txt",
      },
      {
        n: 2,
        titulo: "Contrato de adhesión y plan de mantenimiento",
        blurb: "La prueba clave: condiciones firmadas y services que el actor no hizo.",
        file: "/posta/ejemplo-consumo-prueba.txt",
      },
    ],
  },
  {
    id: "sentencia",
    area: "Tribunales",
    emoji: "⚖️",
    titulo: "Una sentencia para analizar o apelar",
    resumen:
      "Sentencia laboral de primera instancia. Podés analizarla (congruencia y fundamentos, para tribunales) o trabajar los agravios para apelarla (litigantes).",
    tareas: ["analizar-sentencia", "agravios"],
    piezas: [
      {
        n: 1,
        titulo: "La sentencia",
        blurb: "El fallo completo: vistos, considerandos y parte resolutiva.",
        file: "/posta/ejemplo-sentencia.txt",
      },
      {
        n: 2,
        titulo: "Resumen del expediente (lo que pidió cada parte)",
        blurb: "Para comparar lo pedido con lo resuelto: la base de todo análisis de congruencia.",
        file: "/posta/ejemplo-sentencia-expediente.txt",
      },
    ],
  },
];

export function getEjemplo(id: string | null | undefined): CasoEjemplo | null {
  return CASOS_EJEMPLO.find((c) => c.id === id) ?? null;
}

// --- Ejercicio aparte: verificar una cita -------------------------------
// Flujo DISTINTO al de la posta: no se sube material a NotebookLM, se usa
// una IA con BÚSQUEDA web para chequear si una cita (fallo/artículo) existe
// y dice lo que la IA afirmó. Refuerza el reflejo anti-alucinación.

export const VERIFICAR_CITA_PROMPT = `Necesito verificar si esta cita jurídica es REAL y dice lo que se afirma. Activá la búsqueda web y trabajá solo con fuentes oficiales o confiables (boletín oficial, sitios de los tribunales, bases reconocidas).

CITA A VERIFICAR:
[pegá acá el fallo, artículo o cita tal como te lo dieron]

Hacé esto:
1. Buscá la fuente oficial. Decime si la cita EXISTE, si está mal citada, o si no encontrás respaldo.
2. Si existe, transcribí textual el pasaje pertinente y el link/fuente.
3. Decime si efectivamente dice lo que se afirma, o si se le atribuye algo que no dice.
4. Si no podés confirmarla con una fuente, decílo claramente: "No verificada". No la des por buena.

No completes de memoria: si no hay fuente, no hay cita.`;

export const VERIFICAR_CITA_PASOS: string[] = [
  "Tomá la cita que querés chequear (un fallo o artículo que te dio una IA, o que viste en un escrito).",
  "Abrí una IA CON BÚSQUEDA activada (ChatGPT, Claude o Gemini con web) — NotebookLM no sirve acá porque no busca en internet.",
  "Pegá el prompt de verificación con la cita adentro.",
  "Contrastá: ¿la fuente oficial existe y dice lo mismo? Registrá el veredicto abajo.",
];

// --- Estaciones (mapa mental para la clase) -----------------------------

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
    bajada: "Elegí con qué trabajás y qué vas a producir.",
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
    titulo: "Probar tu asistente",
    short: "Producir",
    bajada: "Hacele la primera consulta y mirá cómo responde con todo el contexto.",
  },
];

// --- Estación 2 · instrucciones del Proyecto (system prompt) -------------

export const SYSTEM_PROMPT_POSTA = `Sos un asistente jurídico especializado en derecho argentino. Trabajás sobre EL CASO cuyas fuentes están cargadas en este Proyecto.

REGLAS:
1. Basate solo en las fuentes cargadas y en lo que yo te indique. Si falta un dato, preguntámelo: nunca lo inventes.
2. No inventás jurisprudencia ni artículos. Si no estás seguro de que un fallo o una norma existe, lo decís expresamente.
3. Escribís en español jurídico argentino, con tono formal y claro.
4. Seguís la estructura que te pida cada consulta. Si redactás hechos de una demanda o contestación: orden cronológico, primera persona del plural y narración solo factual (sin valoraciones, sin derecho, sin petitorio). Si analizás una sentencia o preparás una audiencia: ordenás por puntos y distinguís hechos, prueba, fundamentos y conclusiones.
5. Marcás entre [corchetes] cualquier dato que yo deba completar o verificar antes de usar el resultado.`;

export const SYSTEM_PROMPT_PARTES: { titulo: string; texto: string }[] = [
  {
    titulo: "Quién es (rol)",
    texto: "La primera línea le da identidad y especialidad: asistente jurídico argentino sobre TU caso.",
  },
  {
    titulo: "Qué NO hace (anti-alucinación)",
    texto: "Reglas 1 a 3: no inventa datos, fallos ni normas, y avisa cuando algo no surge de las fuentes.",
  },
  {
    titulo: "Cómo escribe (formato)",
    texto: "Reglas 4 y 5: estilo formal y la estructura que pidas, con [corchetes] para lo que falta verificar.",
  },
];

// --- Marquito · copiloto de la clase (OpenRouter) ------------------------
// Marquito NO procesa documentos ni hace el trabajo jurídico: orienta sobre
// el uso de la app y el método. Ve en qué estación está el estudiante para
// ayudar justo donde está parado.

const AYUDA_ESTACION: Record<number, string> = {
  0: "Está eligiendo con qué trabajar (caso propio o de ejemplo) y qué va a producir (hechos, analizar sentencia, agravios, audiencia). Si dudan, sugerí el caso de ejemplo de su área.",
  1: "Estación 1 (NotebookLM): abre NotebookLM en otra pestaña, sube su material como fuente, copia el prompt de destilado, y pega en la app lo que NotebookLM le devolvió (el pase). Dudas típicas: no encuentra dónde subir el archivo, no sabe si volver a la app.",
  2: "Estación 2 (Proyecto): crea un Proyecto en Claude o ChatGPT, pega las instrucciones (system prompt) que le da la app, y carga sus fuentes al Proyecto. Dudas típicas: dónde crear el Proyecto, dónde pegar las instrucciones, qué subir.",
  3: "Estación 3 (Producir): le hace la primera consulta a su asistente ya armado y pega el resultado en la app. Dudas típicas: la respuesta salió genérica (suele ser porque no cargó bien las fuentes en el Proyecto).",
};

const AYUDA_CITA =
  "Está en el ejercicio de VERIFICAR UNA CITA: toma un fallo o artículo y lo chequea en una IA CON BÚSQUEDA web (no en NotebookLM, que no busca en internet). El objetivo es confirmar si la cita existe y dice lo que se afirma. Ayudalo a buscar la fuente oficial y a no dar por buena una cita sin respaldo.";

export interface MarquitoCtx {
  estacion: number;
  modo: ModoCaso | null;
  ejemplo: string | null;
  tarea: string | null;
}

export function buildMarquitoSystem(ctx: MarquitoCtx): string {
  const ej = getEjemplo(ctx.ejemplo);
  const tarea = getTarea(ctx.tarea);
  const caso =
    ctx.modo === "cita"
      ? "el ejercicio de verificar una cita"
      : ctx.modo === "propio"
        ? "su PROPIO caso"
        : ej
          ? `un caso de ejemplo (${ej.area}: ${ej.titulo})`
          : "todavía no eligió caso";
  const queProduce = tarea && ctx.modo !== "cita" ? ` Va a producir: ${tarea.label}.` : "";
  const donde = ctx.modo === "cita" ? AYUDA_CITA : AYUDA_ESTACION[ctx.estacion] ?? AYUDA_ESTACION[0];

  return `Sos "Marquito", el copiloto de la clase 2 "La Posta" de la Diplomatura en IA y Derecho (UNT), para abogados y abogadas. Hablás en español rioplatense, cálido, breve y tranquilizador. Tuteás. Respuestas cortas (2-5 oraciones), concretas y de a un paso. Si la persona está perdida, primero ubicala: dónde está, qué hace ahora, a dónde va después.

QUÉ ES LA CLASE: el estudiante encadena varias IA para trabajar un caso. El recorrido principal es una posta de 3 estaciones: (1) NotebookLM para anclar las fuentes y destilar el caso, (2) crear un Proyecto en Claude o ChatGPT y configurarlo con un system prompt y las fuentes, (3) hacerle la primera consulta y producir lo que eligió (redactar hechos, analizar una sentencia, trabajar agravios o preparar una audiencia). Hay además un ejercicio aparte: verificar una cita. El "pase" es copiar lo que sale de una herramienta y pegarlo en la siguiente; la app es la directora de la posta, no procesa nada.

DÓNDE ESTÁ AHORA EL ESTUDIANTE: ${donde} Está trabajando con ${caso}.${queProduce}

LO QUE SÍ PODÉS HACER:
- Orientar sobre el uso de la app: en qué estación está, qué tiene que hacer ahora y a dónde sigue.
- Resolver dudas operativas: dónde está un botón o link, cómo abrir NotebookLM/Claude/ChatGPT, cómo crear un Proyecto, dónde pegar las instrucciones, cómo hacer el pase, si tiene que ir a otra pestaña o quedarse.
- Ayudar con el MÉTODO de su caso: qué conviene subir como fuente, cómo mejorar un prompt, cómo leer críticamente lo que devolvió la IA, qué verificar.
- Bajar la ansiedad: recordarle que va de a un paso y que nadie se queda atrás.

LO QUE NO HACÉS (y lo decís con amabilidad si te lo piden):
- No hacés el trabajo jurídico por la persona: no redactás el escrito completo ni decidís la estrategia. Ese criterio profesional es de ella; vos la guiás.
- No inventás jurisprudencia, fallos ni artículos. Si hace falta una cita, escribí "[verificar]" y aclará que debe chequearla en una fuente oficial.
- No analizás ni "leés" archivos dentro de la app: la app no corre IA sobre documentos. Eso pasa en NotebookLM o en su Proyecto de Claude/ChatGPT; vos explicás cómo.
- No te salís del recorrido de la clase ni adelantás cosas de otras instancias. Si preguntan algo ajeno, reconducí con suavidad.

Si no sabés algo de la app, decilo y sugerí tocar el botón de ayuda o avisar al docente.`;
}

// --- Estado per-participante (una sola respuesta, como en /expediente) ----

export const POSTA_ACTIVITY = "posta";
export const POSTA_ITEM = "state";

export type HerramientaProyecto = "claude" | "gpt";

export interface PostaState {
  modo: ModoCaso | null;
  ejemploId: string | null;
  tareaId: string | null; // qué produce (id de TAREAS)
  estacion: number; // estación máxima alcanzada (0..3)
  destilado: string; // PASE 1: lo que devolvió NotebookLM
  conf1: string; // microconfirmación estación 1
  herramienta: HerramientaProyecto | null; // dónde armó el Proyecto
  conf2: string; // microconfirmación estación 2
  borrador: string; // PASE final: el texto/link que produjo
  completado: boolean;
  // ejercicio "verificar una cita"
  citaTexto: string; // la cita que está chequeando
  citaResultado: string; // veredicto / notas
  marquitoUsos: number; // cuántas veces consultó al copiloto (para el docente)
}

export function emptyPostaState(): PostaState {
  return {
    modo: null,
    ejemploId: null,
    tareaId: null,
    estacion: 0,
    destilado: "",
    conf1: "",
    herramienta: null,
    conf2: "",
    borrador: "",
    completado: false,
    citaTexto: "",
    citaResultado: "",
    marquitoUsos: 0,
  };
}
