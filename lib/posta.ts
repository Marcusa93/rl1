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

const DESTILADO_CASO = `[CONTEXTO] Trabajás SOLO con las fuentes que cargué en este cuaderno. No sabés nada fuera de ellas.
[OBJETO] Quiero un resumen estructurado y fiel de mi caso, para usarlo después como base de trabajo.
[TAREA] Extraé y ordená, citando entre paréntesis de qué fuente sale cada punto:
1. Carátula y partes: actor, demandado, rol procesal y fuero/jurisdicción si surge.
2. Hechos en orden cronológico, con fecha cuando exista; lenguaje neutro y factual.
3. Prueba disponible y qué hecho respalda cada elemento.
4. Normativa o derecho mencionado (solo lo citado en las fuentes).
5. Contradicciones o inconsistencias entre las fuentes, si las hay.
6. Datos faltantes: información necesaria que NO surge de las fuentes.
[INPUT] Las fuentes cargadas en el cuaderno; nada más.
[OUTPUT] Las seis secciones, en viñetas. Si algo no surge de las fuentes, escribí "No surge de las fuentes". No inventes fallos, artículos ni datos. No opines: ordená.`;

const DESTILADO_SENTENCIA = `[CONTEXTO] Trabajás SOLO con la sentencia (y el expediente) que cargué. No agregues nada externo.
[OBJETO] Quiero un "mapa" fiel del fallo, para analizarlo después.
[TAREA] Extraé, citando entre paréntesis el considerando o apartado de origen:
1. Carátula y partes; tribunal y fuero.
2. Qué pidió cada parte (pretensiones y planteos), si surge.
3. Hechos que el tribunal tuvo por acreditados.
4. Prueba que valoró y la que descartó (si lo dice).
5. Normativa y fundamentos que invoca para decidir.
6. Parte resolutiva: qué resolvió, punto por punto.
7. Lo que el fallo NO explicita (silencios, saltos).
[INPUT] Solo las fuentes cargadas.
[OUTPUT] Las siete secciones, en viñetas. "No surge de las fuentes" para lo ausente. No inventes ni opines: esto es un mapa, no el análisis.`;

// --- Consultas (Estación 3, se pegan en el Proyecto ya armado) -----------

const CONSULTA_HECHOS = `[CONTEXTO] Sos mi asistente de redacción jurídica en derecho argentino; trabajás con las fuentes cargadas en este Proyecto (mi caso).
[OBJETO] Necesito la SECCIÓN DE HECHOS lista para revisar e insertar en mi escrito.
[TAREA]
1. Ordená los hechos cronológicamente y numeralos.
2. Redactá en primera persona del plural (esta parte), en pretérito y tono formal.
3. Narrá solo hechos: sin derecho, sin valoraciones, sin petitorio.
4. Para cada hecho relevante, indicá entre paréntesis con qué prueba se acredita.
5. Si un dato no surge de las fuentes, dejá "[falta: …]"; no lo inventes.
[INPUT] Usá exclusivamente las fuentes del Proyecto; si algo es ambiguo, explicitá el supuesto.
[OUTPUT] La sección numerada (~500 palabras salvo que el caso exija más) y, debajo, un apartado "A verificar / completar" con datos faltantes y dudas. Sin encabezados ni fórmulas procesales de estilo.`;

const CONSULTA_ANALIZAR = `[CONTEXTO] Sos mi asistente jurídico; trabajás con la sentencia y el expediente cargados en este Proyecto. Es un análisis interno.
[OBJETO] Un análisis crítico del fallo: si es congruente, si está bien fundado y dónde flaquea.
[TAREA]
1. Resumí en pocas líneas qué resolvió y sus fundamentos centrales (con cita del considerando).
2. Congruencia: ¿lo resuelto se corresponde con lo pedido y la prueba valorada? Señalá extra/ultra/citra petita si los hay.
3. Fundamentación: marcá afirmaciones sin sustento, prueba no valorada o saltos lógicos.
4. En cada observación, distinguí la CITA TEXTUAL del fallo de TU comentario.
[INPUT] Solo las fuentes del Proyecto.
[OUTPUT] Las secciones 1 a 4. Indicá qué habría que verificar en el expediente o la norma antes de afirmarlo. No inventes jurisprudencia ni artículos: si hace falta una cita, escribí "[verificar]". No redactes un fallo nuevo.`;

const CONSULTA_AGRAVIOS = `[CONTEXTO] Sos mi asistente; trabajás con la sentencia cargada en este Proyecto. Represento a la parte que va a apelar.
[OBJETO] Un punteo estratégico de los agravios (todavía no el memorial).
[TAREA]
1. Identificá los puntos del fallo que me perjudican.
2. Por cada uno, esbozá el AGRAVIO: por qué el fallo se equivoca (hechos, prueba, derecho o falta de fundamentación), citando el pasaje del fallo.
3. Indicá qué parte de la prueba o del expediente respalda cada agravio.
4. Ordená los agravios de más fuerte a más débil, con una línea de por qué.
[INPUT] Solo las fuentes del Proyecto.
[OUTPUT] La lista de agravios con su fundamento y respaldo. No inventes citas: "[verificar]" si hace falta. Es un punteo, no el escrito.`;

const CONSULTA_AUDIENCIA = `[CONTEXTO] Sos mi asistente; trabajás con el caso cargado en este Proyecto. Voy a una audiencia.
[OBJETO] Material de preparación para la audiencia (no un escrito).
[TAREA]
1. Resumí el caso en 5 puntos que tengo que tener fijos.
2. Punteo de hechos y prueba a invocar, en el orden conveniente.
3. Preguntas para testigos/contraparte, agrupadas por tema.
4. Los 3 planteos más probables de la otra parte y cómo respondería a cada uno.
[INPUT] Solo las fuentes del Proyecto.
[OUTPUT] Las cuatro secciones, en viñetas accionables. "[verificar]" para cualquier cita; no inventes.`;

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
  audio?: boolean; // true = audio (NotebookLM lo transcribe)
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
        titulo: "Testimonio de la trabajadora (audio)",
        blurb: "La clienta cuenta su caso. Audio: NotebookLM lo transcribe.",
        file: "/posta/audio/laboral-testimonio.mp3",
        audio: true,
      },
      {
        n: 5,
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
        titulo: "Chat de WhatsApp (reclamo de cuota)",
        blurb: "El reclamo de alimentos y la falta de respuesta. Imagen: NotebookLM la lee con OCR.",
        file: "/posta/img/familia-whatsapp.png",
        img: true,
      },
      {
        n: 2,
        titulo: "Comprobante del jardín",
        blurb: "Gasto fijo de la niña a cargo de la madre ($95.000). Imagen con OCR.",
        file: "/posta/img/familia-comprobante-jardin.png",
        img: true,
      },
      {
        n: 3,
        titulo: "Comprobante de transferencia (2022)",
        blurb: "El progenitor antes sí aportaba: conoce el deber y la vía de pago. Imagen con OCR.",
        file: "/posta/img/familia-transferencia.png",
        img: true,
      },
      {
        n: 4,
        titulo: "Testimonio de la madre (audio)",
        blurb: "La progenitora cuenta su situación. Audio: NotebookLM lo transcribe.",
        file: "/posta/audio/familia-testimonio.mp3",
        audio: true,
      },
      {
        n: 5,
        titulo: "Relato y cronología",
        blurb: "El contexto narrado (separación, ingresos, necesidades). Texto, por si querés el resumen.",
        file: "/posta/ejemplo-familia.txt",
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
        titulo: "Contrato de compraventa (adhesión)",
        blurb: "Las cláusulas firmadas: garantía de la terminal y services obligatorios. Imagen con OCR.",
        file: "/posta/img/consumo-contrato.png",
        img: true,
      },
      {
        n: 2,
        titulo: "Plan de mantenimiento",
        blurb: "Los services que condicionan la garantía; el Service 1 no se hizo. Imagen con OCR.",
        file: "/posta/img/consumo-plan-mantenimiento.png",
        img: true,
      },
      {
        n: 3,
        titulo: "Testimonio del gerente (audio)",
        blurb: "La concesionaria (demandada) explica su defensa. Audio: NotebookLM lo transcribe.",
        file: "/posta/audio/consumo-testimonio.mp3",
        audio: true,
      },
      {
        n: 4,
        titulo: "Relato de la empresa y puntos de defensa",
        blurb: "La versión de la demandada y los ejes para contestar. Texto, por si querés el resumen.",
        file: "/posta/ejemplo-consumo.txt",
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
        titulo: "La sentencia (con membrete del juzgado)",
        blurb: "El fallo completo: vistos, considerandos y parte resolutiva. Imagen: NotebookLM la lee con OCR.",
        file: "/posta/img/tribunales-sentencia.png",
        img: true,
      },
      {
        n: 2,
        titulo: "Resumen del expediente (lo que pidió cada parte)",
        blurb: "Para comparar lo pedido con lo resuelto: la base del análisis de congruencia. Texto.",
        file: "/posta/ejemplo-sentencia-expediente.txt",
      },
      {
        n: 3,
        titulo: "Testimonio de una testigo (audio)",
        blurb: "Una excompañera declara sobre los sábados y las comisiones. Audio: NotebookLM lo transcribe.",
        file: "/posta/audio/tribunales-testimonio.mp3",
        audio: true,
      },
    ],
  },
];

export function getEjemplo(id: string | null | undefined): CasoEjemplo | null {
  return CASOS_EJEMPLO.find((c) => c.id === id) ?? null;
}

// --- Recomendación por nombre (a partir de lo que pidió en la Clase 1) ---
// Mapa curado con lo que cada participante trabajó/pidió en la Clase 1
// (sesión `taller`). Al ingresar a La Posta, si el nombre matchea, le
// sugerimos por dónde seguir. Si no matchea, flujo normal sin sugerencia.

export interface Reco {
  etiqueta: string; // qué le sugerimos (corto)
  modo: ModoCaso; // "propio" | "ejemplo"
  ejemploId?: string;
  tareaId: string;
  nota: string; // por qué (referencia a la Clase 1)
}

const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// Tokens clave de un nombre: primero + último (ignora segundos nombres).
function claves(nombre: string): string[] {
  const t = norm(nombre).split(" ").filter(Boolean);
  return t.length >= 2 ? [t[0], t[t.length - 1]] : t;
}

const RECOS: { nombre: string; reco: Reco }[] = [
  { nombre: "Eugenia Balvidares", reco: { etiqueta: "Laboral → redactar hechos", modo: "ejemplo", ejemploId: "laboral", tareaId: "hechos", nota: "En la Clase 1 trabajaste un caso laboral (despido sin causa)." } },
  { nombre: "Analía Páez", reco: { etiqueta: "Laboral → redactar hechos", modo: "ejemplo", ejemploId: "laboral", tareaId: "hechos", nota: "Veníamos de lo laboral (prueba testimonial y art. 23 LCT)." } },
  { nombre: "Sigrid Porcel", reco: { etiqueta: "Familia → redactar hechos", modo: "ejemplo", ejemploId: "familia", tareaId: "hechos", nota: "Trabajaste un caso de familia (alimentos)." } },
  { nombre: "Maria Gabriela Pintos", reco: { etiqueta: "Familia → redactar hechos", modo: "ejemplo", ejemploId: "familia", tareaId: "hechos", nota: "Veníamos de familia (régimen de comunicación)." } },
  { nombre: "Diego Ton", reco: { etiqueta: "Familia → preparar una audiencia", modo: "ejemplo", ejemploId: "familia", tareaId: "audiencia", nota: "Querías prepararte para una audiencia de alimentos." } },
  { nombre: "Magali Campos", reco: { etiqueta: "Consumo → redactar hechos", modo: "ejemplo", ejemploId: "consumo", tareaId: "hechos", nota: "Trabajaste una contestación de demanda de consumo." } },
  { nombre: "Soledad Richard", reco: { etiqueta: "Consumo → redactar hechos", modo: "ejemplo", ejemploId: "consumo", tareaId: "hechos", nota: "Veníamos de consumo (contestación contra una concesionaria)." } },
  { nombre: "Analia Cajal", reco: { etiqueta: "Consumo → redactar hechos", modo: "ejemplo", ejemploId: "consumo", tareaId: "hechos", nota: "Trabajaste un caso de consumo." } },
  { nombre: "Rosana Guzman", reco: { etiqueta: "Consumo → redactar hechos", modo: "ejemplo", ejemploId: "consumo", tareaId: "hechos", nota: "Tu mirada venía del consumo / la conciliación." } },
  { nombre: "Sofia Spalletti", reco: { etiqueta: "Sentencia → de la sentencia a los agravios", modo: "ejemplo", ejemploId: "sentencia", tareaId: "agravios", nota: "Querías ver qué puntos apelar de una sentencia." } },
  { nombre: "Marcelo Velasco", reco: { etiqueta: "Sentencia → analizar la sentencia", modo: "ejemplo", ejemploId: "sentencia", tareaId: "analizar-sentencia", nota: "Trabajaste el análisis de un fallo." } },
  { nombre: "Marco Rossi", reco: { etiqueta: "Sentencia → analizar la sentencia", modo: "ejemplo", ejemploId: "sentencia", tareaId: "analizar-sentencia", nota: "Veníamos de la congruencia entre hechos, prueba y resolución." } },
  { nombre: "Maria Marta Garriga", reco: { etiqueta: "Tu caso propio → analizar una sentencia", modo: "propio", tareaId: "analizar-sentencia", nota: "Trabajaste lo penal (estrategia, jurados); traé tu caso." } },
  { nombre: "Frida Salazar", reco: { etiqueta: "Tu caso propio → analizar una sentencia", modo: "propio", tareaId: "analizar-sentencia", nota: "Veníamos de lo penal (jurisprudencia para dictámenes)." } },
  { nombre: "Federico Licciardi", reco: { etiqueta: "Sentencia → analizar la sentencia", modo: "ejemplo", ejemploId: "sentencia", tareaId: "analizar-sentencia", nota: "Trabajaste el resumen/análisis de un fallo." } },
  { nombre: "Gustavo Salloum", reco: { etiqueta: "Tu caso propio → redactar hechos", modo: "propio", tareaId: "hechos", nota: "Trabajaste una carta documento; traé tu propio caso." } },
];

export function recomendarPara(name: string | null | undefined): Reco | null {
  if (!name) return null;
  const inTok = new Set(norm(name).split(" ").filter(Boolean));
  for (const e of RECOS) {
    const kt = claves(e.nombre);
    if (kt.length >= 2 && kt.every((t) => inTok.has(t))) return e.reco;
  }
  return null;
}

// --- Ejercicio aparte: verificar una cita -------------------------------
// Flujo DISTINTO al de la posta: no se sube material a NotebookLM, se usa
// una IA con BÚSQUEDA web para chequear si una cita (fallo/artículo) existe
// y dice lo que la IA afirmó. Refuerza el reflejo anti-alucinación.

export const VERIFICAR_CITA_PROMPT = `[CONTEXTO] Sos un verificador de fuentes jurídicas. Activá la BÚSQUEDA WEB y usá solo fuentes oficiales o reconocidas (Boletín Oficial, sitios de los tribunales, bases serias).
[OBJETO] Confirmar si esta cita es REAL y si dice lo que se afirma.
[INPUT] Cita a verificar: [pegá acá el fallo, artículo o cita tal como te lo dieron]
[TAREA]
1. Buscá la fuente oficial. Decí si la cita EXISTE, si está mal citada o si no hay respaldo.
2. Si existe, transcribí textual el pasaje pertinente con su link/fuente.
3. Decí si efectivamente dice lo que se afirma, o si se le atribuye algo que no dice.
4. Si no podés confirmarla con una fuente, declarála "NO VERIFICADA".
[OUTPUT] Un veredicto claro (verificada / mal citada / no verificada) + fuente o link + una nota breve. No completes de memoria: si no hay fuente, no hay cita.`;

export const VERIFICAR_CITA_PASOS: string[] = [
  "Tomá la cita que querés chequear (un fallo o artículo que te dio una IA, o que viste en un escrito).",
  "Abrí una IA CON BÚSQUEDA activada (ChatGPT, Claude o Gemini con web) — NotebookLM no sirve acá porque no busca en internet.",
  "Pegá el prompt de verificación con la cita adentro.",
  "Contrastá: ¿la fuente oficial existe y dice lo mismo? Registrá el veredicto abajo.",
];

// --- Investigación profunda (Deep Research) — función agéntica ----------
// Paso opcional en la Estación 1: la IA investiga sola por varios minutos
// (planifica, busca, lee muchas fuentes) y trae normativa/jurisprudencia/
// doctrina TRAZABLE y VERIFICABLE, que se suma como otra fuente.

export const DEEP_RESEARCH_PROMPT = `[CONTEXTO] Sos un investigador jurídico en derecho argentino. Activá la INVESTIGACIÓN PROFUNDA (Deep Research / Investigación profunda). Jurisdicción y fuero: [completar, ej.: laboral — Tucumán].
[OBJETO] Reunir el marco jurídico aplicable a mi caso, TRAZABLE y VERIFICABLE, para incorporarlo a un expediente real.
[INPUT] Mi caso (pegá el destilado de NotebookLM o un resumen): [pegá acá tu caso]
[TAREA]
1. NORMATIVA vigente: leyes y códigos con número de norma y artículo.
2. JURISPRUDENCIA relevante: fallos con carátula, tribunal, fecha y cita o enlace para ubicarlos.
3. DOCTRINA pertinente: autor, obra y referencia.
[OUTPUT / REGLAS]
- Todo con su FUENTE y, cuando exista, link a la fuente oficial (Boletín Oficial, sitio del tribunal, bases reconocidas).
- NO inventes fallos ni artículos: lo que no puedas confirmar, marcalo "[no verificado]".
- Distinguí lo VIGENTE de lo derogado o modificado, con la fecha del cambio.
- Secciones: Normativa / Jurisprudencia / Doctrina / Fuentes citadas (con links).
- Cerrá con un CHECKLIST de verificación: 3 cosas que yo debería chequear antes de citar esto en un escrito.`;

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

CÓMO TRABAJÁS:
1. Te basás solo en las fuentes cargadas y en lo que yo indique. Si falta un dato clave, primero PREGUNTÁ; no lo inventes ni lo completes de memoria.
2. No inventás jurisprudencia ni artículos. Si no estás seguro de que un fallo o una norma existe, lo decís; si hace falta una cita, escribís "[verificar]".
3. Antes de un texto largo, ofrecé un ESQUEMA breve y esperá mi visto bueno (no dispares un borrador a ciegas).
4. Cuando afirmes un hecho, indicá de qué fuente sale.
5. Marcás entre [corchetes] cualquier dato a completar o verificar antes de usar el resultado.

ESTILO: español jurídico argentino, formal y claro. Seguís la estructura que te pida cada consulta (hechos cronológicos y solo factuales para una demanda o contestación; análisis por puntos para una sentencia o una audiencia). Si el fuero o la jurisdicción importan y no los aclaré, preguntámelos.`;

export const SYSTEM_PROMPT_PARTES: { titulo: string; texto: string }[] = [
  {
    titulo: "Quién es (rol)",
    texto: "La primera línea le da identidad y especialidad: asistente jurídico argentino sobre TU caso.",
  },
  {
    titulo: "Qué NO hace (anti-alucinación)",
    texto: "Reglas 1 y 2: no inventa datos, fallos ni normas; si falta algo pregunta, y si hace falta una cita escribe [verificar].",
  },
  {
    titulo: "Cómo trabaja (método)",
    texto: "Reglas 3 a 5: primero un esquema y después el texto, cita de qué fuente sale cada hecho, estilo formal y la estructura que pidas.",
  },
];

// --- Marquito · copiloto de la clase (OpenRouter) ------------------------
// Marquito NO procesa documentos ni hace el trabajo jurídico: orienta sobre
// el uso de la app y el método. Ve en qué estación está el estudiante para
// ayudar justo donde está parado.

const AYUDA_ESTACION: Record<number, string> = {
  0: "Está eligiendo con qué trabajar (caso propio o de ejemplo) y qué va a producir (hechos, analizar sentencia, agravios, audiencia). Si dudan, sugerí el caso de ejemplo de su área.",
  1: "Estación 1 (NotebookLM): abre NotebookLM en otra pestaña, sube su material como fuente, copia el prompt de destilado, y pega en la app lo que NotebookLM le devolvió (el pase). Dudas típicas: no encuentra dónde subir el archivo, no sabe si volver a la app. Hay además un paso OPCIONAL de Investigación Profunda (Deep Research): una función agéntica que investiga sola varios minutos y trae normativa/jurisprudencia/doctrina con su fuente, para sumar como otra fuente y verificar después.",
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
