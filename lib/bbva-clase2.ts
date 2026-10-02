// ============================================================
// Laboratorio de IA · BBVA — Clase 2 (02/10/2026, 15:00): "Del proceso al asistente".
// Tesis: UN ASISTENTE ES UNA IA A LA QUE LE DISEÑAMOS UN TRABAJO.
//
// La app deja de ser una encuesta y pasa a ser un constructor progresivo:
//   TAREA → MÉTODO → INFORMACIÓN → LÍMITES → BORRADOR → PRUEBA
// Cada etapa se abre cuando Marco llega a su placa; las decisiones se acumulan y
// en la placa 27 el celular arma el system prompt BORRADOR V0.1 (armarBorrador).
//
// Mismo slug, mismo QR y mismo link que la clase 1: quien vino la semana pasada
// entra directo con su nombre y su candidato (bbva_a5) sigue disponible.
// Ítems "txt_*": texto libre del participante; no se cuentan ni se proyectan.
// ============================================================

import type { ActividadBbva, Opcion, SlideBbva } from "./bbva-clase";

export const C2_FECHA = "Viernes 2 de octubre de 2026";
export const C2_TESIS = "Un asistente es una IA a la que le diseñamos un trabajo";
export const C2_GEM_URL = "https://gemini.google.com/gems/create";

/** Indicador del celular: cada etapa agrupa una o más actividades. */
export const C2_ETAPAS = [
  { id: "tarea", label: "Tarea", acts: ["bbva2_a1"] },
  { id: "metodo", label: "Método", acts: ["bbva2_a2"] },
  { id: "info", label: "Información", acts: ["bbva2_a3", "bbva2_a4"] },
  { id: "limites", label: "Límites", acts: ["bbva2_a5"] },
  { id: "borrador", label: "Borrador", acts: ["bbva2_a6"] },
  { id: "prueba", label: "Prueba", acts: ["bbva2_a7"] },
] as const;

const op = (id: string, label: string, detalle?: string): Opcion => ({ id, label, detalle });

const DONDE: Opcion[] = [
  op("instruccion", "Instrucción", "cómo trabaja siempre"),
  op("contexto", "Contexto", "lo de este caso"),
  op("conocimiento", "Conocimiento", "las fuentes con que trabaja"),
];

const RESULTADO_PRUEBA: Opcion[] = [op("bien", "Funcionó"), op("fallo", "Falló"), op("noprobe", "No llegué a probar")];

export const ACTIVIDADES_C2: ActividadBbva[] = [
  {
    key: "bbva2_a1",
    numero: 1,
    tipo: "eleccion",
    nombre: "Elegí el trabajo",
    pregunta: "¿Qué trabajo le vas a dar?",
    consigna: "Una operación y un resultado. Achicalo.",
    resultado: "Qué trabajos y qué resultados",
    completa: "salida",
    items: [
      {
        id: "op",
        rotulo: "La operación",
        texto: "¿Qué va a hacer principalmente?",
        max: 1,
        opciones: [
          op("buscar", "Buscar"),
          op("clasificar", "Clasificar"),
          op("comparar", "Comparar"),
          op("analizar", "Analizar"),
          op("extraer", "Extraer"),
          op("controlar", "Controlar"),
          op("redactar", "Redactar"),
          op("responder", "Responder"),
          op("resumir", "Resumir"),
          op("decision", "Preparar una decisión"),
        ],
      },
      {
        id: "salida",
        rotulo: "El resultado",
        texto: "¿Qué tiene que producir?",
        max: 1,
        opciones: [
          op("borrador", "Borrador"),
          op("analisis", "Análisis"),
          op("clasificacion", "Clasificación"),
          op("alerta", "Alerta"),
          op("resumen", "Resumen"),
          op("recomendacion", "Recomendación"),
          op("respuesta", "Respuesta"),
          op("checklist", "Checklist"),
          op("informe", "Informe"),
        ],
      },
      {
        id: "txt_tarea",
        rotulo: "En una línea",
        texto: "Describí la tarea concreta (opcional).",
        libre: "clasificar el motivo de cada reclamo que entra por mail…",
        max: 1,
        opciones: [],
      },
      {
        id: "txt_nombre",
        rotulo: "Su nombre",
        texto: "Ponele nombre a tu asistente (opcional).",
        libre: "Clasificador de reclamos",
        max: 1,
        opciones: [],
      },
    ],
  },
  {
    key: "bbva2_a2",
    numero: 2,
    tipo: "metodo",
    nombre: "Armá el método",
    pregunta: "¿Qué recibe y qué hace, en qué orden?",
    consigna: "Elegí la entrada y armá la cadena de pasos.",
    resultado: "Las cadenas del grupo",
    completa: "metodo",
    items: [
      {
        id: "entrada",
        rotulo: "La entrada",
        texto: "¿Qué necesita recibir para empezar?",
        max: 2,
        opciones: [
          op("consulta", "Una consulta"),
          op("documento", "Un documento"),
          op("ticket", "Un ticket"),
          op("datos", "Datos / planilla"),
          op("solicitud", "Una solicitud"),
          op("incidente", "Un incidente"),
          op("mail", "Un mail"),
        ],
      },
      {
        id: "metodo",
        rotulo: "El método",
        texto: "Tocá los pasos en orden (hasta 6).",
        max: 6,
        opciones: [
          op("leer", "Leer"),
          op("identificar", "Identificar"),
          op("extraer", "Extraer"),
          op("buscar", "Buscar"),
          op("comparar", "Comparar"),
          op("clasificar", "Clasificar"),
          op("verificar", "Verificar"),
          op("faltantes", "Detectar faltantes"),
          op("proponer", "Proponer"),
          op("redactar", "Redactar"),
          op("controlar", "Controlar"),
        ],
      },
    ],
  },
  {
    key: "bbva2_a3",
    numero: 3,
    tipo: "donde",
    nombre: "¿Dónde va esto?",
    pregunta: "¿Dónde va esto?",
    consigna: "Seis piezas. Instrucción, contexto o conocimiento.",
    resultado: "Dónde aparecen las confusiones",
    items: [
      { id: "p1", rotulo: "Pieza 1", texto: "“Respondé siempre con esta estructura.”", opciones: DONDE, max: 1, correcta: "instruccion" },
      { id: "p2", rotulo: "Pieza 2", texto: "“Este es el reclamo recibido hoy.”", opciones: DONDE, max: 1, correcta: "contexto" },
      { id: "p3", rotulo: "Pieza 3", texto: "El manual interno del procedimiento.", opciones: DONDE, max: 1, correcta: "conocimiento" },
      { id: "p4", rotulo: "Pieza 4", texto: "“Si falta información, pedila antes de concluir.”", opciones: DONDE, max: 1, correcta: "instruccion" },
      { id: "p5", rotulo: "Pieza 5", texto: "Los datos particulares de esta solicitud.", opciones: DONDE, max: 1, correcta: "contexto" },
      { id: "p6", rotulo: "Pieza 6", texto: "El documento de criterios de referencia.", opciones: DONDE, max: 1, correcta: "conocimiento" },
    ],
  },
  {
    key: "bbva2_a4",
    numero: 4,
    tipo: "eleccion",
    nombre: "La mochila del asistente",
    pregunta: "¿Qué necesita tener a mano para hacer su trabajo?",
    consigna: "Las fuentes y qué hace si no están.",
    resultado: "La mochila del grupo",
    completa: "faltante",
    items: [
      {
        id: "fuentes",
        rotulo: "La mochila",
        texto: "¿Qué necesita tener a mano?",
        max: 9,
        opciones: [
          op("procedimientos", "Procedimientos"),
          op("manuales", "Manuales"),
          op("politicas", "Políticas"),
          op("faqs", "FAQs"),
          op("ejemplos", "Ejemplos resueltos"),
          op("plantillas", "Plantillas"),
          op("tecnica", "Documentación técnica"),
          op("criterios", "Criterios"),
          op("otros", "Otros"),
        ],
      },
      {
        id: "txt_fuentes",
        rotulo: "Cuáles",
        texto: "¿Qué documentos concretos? (opcional)",
        libre: "procedimiento de reclamos v2026, plantilla de respuesta…",
        max: 1,
        opciones: [],
      },
      {
        id: "faltante",
        rotulo: "Si no está",
        texto: "¿Qué pasa si esa información no está?",
        max: 1,
        opciones: [
          op("pedirla", "La pide"),
          op("advertir", "Advierte que falta"),
          op("continuar", "Continúa sin ella"),
          op("derivar", "Deriva a una persona"),
        ],
      },
    ],
  },
  {
    key: "bbva2_a5",
    numero: 5,
    tipo: "eleccion",
    nombre: "Poné los límites",
    pregunta: "¿Hasta dónde puede llegar?",
    consigna: "Autonomía, dudas e intervención humana.",
    resultado: "El mapa de límites",
    completa: "sinhumano",
    items: [
      {
        id: "autonomia",
        rotulo: "Hasta dónde",
        texto: "¿Hasta dónde puede llegar?",
        max: 1,
        opciones: [
          op("asistir", "Asistir"),
          op("preparar", "Preparar"),
          op("recomendar", "Recomendar"),
          op("ejecutar", "Ejecutar algunos pasos"),
          op("resolver", "Resolver salvo excepciones"),
        ],
      },
      {
        id: "incertidumbre",
        rotulo: "Si no sabe",
        texto: "¿Qué hace si no tiene información suficiente?",
        max: 1,
        opciones: [
          op("pedir", "Pide más datos"),
          op("fuentes", "Consulta las fuentes"),
          op("advertir", "Advierte la incertidumbre"),
          op("derivar", "Deriva a una persona"),
        ],
      },
      {
        id: "sinhumano",
        rotulo: "Nunca solo",
        texto: "¿Qué NO debe hacer sin intervención humana?",
        max: 5,
        opciones: [
          op("decision", "La decisión final"),
          op("comunicacion", "Comunicación externa"),
          op("datos", "Modificar datos"),
          op("accion", "Ejecutar una acción"),
          op("depende", "Depende del caso"),
        ],
      },
    ],
  },
  {
    key: "bbva2_a6",
    numero: 6,
    tipo: "borrador",
    nombre: "Borrador V0.1",
    pregunta: "Ahora sí: tu system prompt",
    consigna: "Revisalo, copialo y pegalo en una Gem.",
    resultado: "Borradores copiados",
    completa: "copiado",
    contador: "ya copiaron su borrador",
    items: [
      { id: "copiado", texto: "Copié el borrador", max: 1, opciones: [op("si", "Sí")] },
      { id: "txt_borrador", texto: "Mi borrador editado", max: 1, opciones: [] },
    ],
  },
  {
    key: "bbva2_a7",
    numero: 7,
    tipo: "eleccion",
    nombre: "Rompelo",
    pregunta: "No pruebes si funciona. Buscá dónde falla.",
    consigna: "Tres casos y qué observaste.",
    resultado: "Dónde se rompieron",
    completa: "dificil",
    items: [
      { id: "normal", rotulo: "Caso normal", texto: "Un ejemplo típico.", max: 1, opciones: RESULTADO_PRUEBA },
      { id: "incompleto", rotulo: "Caso incompleto", texto: "Falta información necesaria.", max: 1, opciones: RESULTADO_PRUEBA },
      { id: "dificil", rotulo: "Caso difícil", texto: "Una excepción o ambigüedad donde debería detenerse.", max: 1, opciones: RESULTADO_PRUEBA },
      {
        id: "fallas",
        rotulo: "Lo que viste",
        texto: "¿Dónde falló? (todas las que apliquen)",
        max: 6,
        opciones: [
          op("metodo", "No siguió el método"),
          op("info", "Usó información equivocada"),
          op("invento", "Inventó"),
          op("limites", "No respetó los límites"),
          op("datos", "No pidió datos"),
          op("salida", "Salida distinta a la esperada"),
        ],
      },
    ],
  },
];

// --- El borrador V0.1 ------------------------------------------------------------------

const VERBO: Record<string, string> = {
  buscar: "buscar información",
  clasificar: "clasificar casos",
  comparar: "comparar información contra criterios",
  analizar: "analizar datos y documentos",
  extraer: "extraer datos de documentos",
  controlar: "controlar que se cumplan requisitos",
  redactar: "redactar textos",
  responder: "responder consultas",
  resumir: "resumir información",
  decision: "preparar decisiones para que una persona las tome",
};

const SALIDA: Record<string, string> = {
  borrador: "un borrador listo para revisar",
  analisis: "un análisis breve y fundado",
  clasificacion: "una clasificación con su motivo",
  alerta: "una alerta clara cuando corresponda",
  resumen: "un resumen",
  recomendacion: "una recomendación con sus razones",
  respuesta: "una respuesta lista para revisar",
  checklist: "un checklist",
  informe: "un informe",
};

const FORMATO: Record<string, string> = {
  borrador: "Un borrador completo, marcado como BORRADOR, con los puntos que la persona debe revisar al final.",
  analisis: "Hallazgos en viñetas, luego conclusión en 2–3 líneas, luego qué no se pudo verificar.",
  clasificacion: "Categoría asignada · motivo en una línea · nivel de confianza (alto/medio/bajo) · dato que falta, si falta.",
  alerta: "ALERTA o SIN ALERTA, motivo en una línea y la evidencia que la sostiene.",
  resumen: "Un resumen de máximo 10 líneas, con los puntos clave en viñetas.",
  recomendacion: "Recomendación en una línea, razones en viñetas, riesgos y qué debe decidir la persona.",
  respuesta: "El texto de la respuesta listo para revisar, y aparte, lo que la persona debe verificar antes de enviarlo.",
  checklist: "Un checklist con cada punto marcado como cumple / no cumple / falta información.",
  informe: "Informe con secciones: situación, hallazgos, faltantes, conclusión.",
};

const ENTRADA: Record<string, string> = {
  consulta: "una consulta",
  documento: "un documento",
  ticket: "un ticket",
  datos: "datos o una planilla",
  solicitud: "una solicitud",
  incidente: "un incidente",
  mail: "un mail",
};

const PASO: Record<string, string> = {
  leer: "Leé completa la entrada.",
  identificar: "Identificá de qué tipo de caso se trata.",
  extraer: "Extraé los datos relevantes.",
  buscar: "Buscá en las fuentes cargadas lo que corresponde a este caso.",
  comparar: "Compará el caso con los criterios de las fuentes.",
  clasificar: "Clasificá el caso según las categorías definidas.",
  verificar: "Verificá cada dato contra las fuentes.",
  faltantes: "Detectá qué información falta y señalala.",
  proponer: "Proponé un curso de acción, con sus razones.",
  redactar: "Redactá el resultado con el formato de salida.",
  controlar: "Controlá el resultado antes de entregarlo.",
};

const FUENTE: Record<string, string> = {
  procedimientos: "procedimientos",
  manuales: "manuales",
  politicas: "políticas",
  faqs: "preguntas frecuentes",
  ejemplos: "ejemplos resueltos",
  plantillas: "plantillas",
  tecnica: "documentación técnica",
  criterios: "criterios de referencia",
  otros: "otros documentos cargados",
};

const FALTANTE: Record<string, string> = {
  pedirla: "Si falta información necesaria, pedila antes de avanzar. No concluyas sin ella.",
  advertir: "Si falta información necesaria, seguí con lo que haya pero advertí al principio qué falta y qué parte del resultado queda débil.",
  continuar: "Si falta información, continuá con lo disponible y marcá con [SUPUESTO] todo lo que no surja de los datos.",
  derivar: "Si falta información necesaria, detenete y derivá el caso a una persona explicando qué falta.",
};

const INCERTIDUMBRE: Record<string, string> = {
  pedir: "Ante la duda, pedí más datos antes de responder.",
  fuentes: "Ante la duda, volvé a las fuentes cargadas y citá de dónde sale cada afirmación.",
  advertir: "Ante la duda, decilo explícitamente e indicá tu nivel de confianza.",
  derivar: "Ante la duda, no resuelvas: derivá a una persona y explicá por qué.",
};

const AUTONOMIA: Record<string, string> = {
  asistir: "asistís a la persona mientras trabaja; no producís resultados finales",
  preparar: "preparás el material para que una persona lo revise",
  recomendar: "recomendás qué hacer, con tus razones; la decisión es de una persona",
  ejecutar: "podés ejecutar algunos pasos del proceso; los pasos sensibles requieren aprobación",
  resolver: "resolvés los casos normales y te detenés en las excepciones",
};

const SIN_HUMANO: Record<string, string> = {
  decision: "tomar la decisión final",
  comunicacion: "comunicarte con clientes o terceros",
  datos: "modificar datos o registros",
  accion: "ejecutar acciones en sistemas",
};

const lista = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : typeof v === "string" && v ? [v] : []);
const texto = (v: unknown): string => (typeof v === "string" ? v.trim() : "");

export interface DatosBorrador {
  /** respuestas[activity][item] del participante. */
  resp: Record<string, Record<string, string | string[]>>;
  /** Etiqueta del área (opcional). */
  area?: string;
}

/** Arma el system prompt BORRADOR V0.1 con las decisiones acumuladas en la clase. */
export function armarBorrador({ resp, area }: DatosBorrador): string {
  const a1 = resp.bbva2_a1 ?? {};
  const a2 = resp.bbva2_a2 ?? {};
  const a4 = resp.bbva2_a4 ?? {};
  const a5 = resp.bbva2_a5 ?? {};
  const c1 = resp.bbva_a5 ?? {};

  const opId = texto(a1.op);
  const salidaId = texto(a1.salida);
  const nombre = texto(a1.txt_nombre) || "Asistente especializado";
  const tarea = texto(a1.txt_tarea);
  const hipotesis = texto(c1.hipotesis);
  const entradas = lista(a2.entrada).map((e) => ENTRADA[e]).filter(Boolean);
  const pasos = lista(a2.metodo).map((p) => PASO[p]).filter(Boolean);
  const fuentes = lista(a4.fuentes).map((f) => FUENTE[f]).filter(Boolean);
  const fuentesTxt = texto(a4.txt_fuentes);
  const faltante = texto(a4.faltante);
  const autonomia = texto(a5.autonomia);
  const incertidumbre = texto(a5.incertidumbre);
  const sinHumano = lista(a5.sinhumano);
  const nunca = sinHumano.map((s) => SIN_HUMANO[s]).filter(Boolean);

  const l: string[] = [];
  l.push(`# ${nombre}`);
  l.push("BORRADOR V0.1 — primera hipótesis, para probar y corregir.");
  l.push("");
  l.push("## PROPÓSITO");
  l.push(
    `Sos un asistente especializado. Tu único trabajo es ${VERBO[opId] ?? "[qué operación hace]"} para producir ${SALIDA[salidaId] ?? "[qué resultado entrega]"}.`,
  );
  if (tarea) l.push(`La tarea concreta: ${tarea}`);
  l.push("No hacés otras tareas: si te piden algo fuera de este trabajo, decilo y no lo hagas.");
  l.push("");
  l.push("## CONTEXTO DE TRABAJO");
  l.push(`Trabajás para una persona del área ${area ?? "[área]"} de una entidad bancaria.`);
  if (hipotesis) l.push(`El proceso donde intervenís: ${hipotesis}`);
  l.push("Tu resultado lo revisa una persona antes de usarse.");
  l.push("");
  l.push("## ENTRADAS");
  l.push(`En cada conversación vas a recibir ${entradas.length ? entradas.join(" o ") : "[qué recibe]"}.`);
  l.push("Si no recibís la entrada completa, pedila antes de empezar.");
  l.push("");
  l.push("## MÉTODO");
  l.push("Seguí siempre estos pasos, en este orden:");
  (pasos.length ? pasos : ["[paso 1]", "[paso 2]", "[paso 3]"]).forEach((p, i) => l.push(`${i + 1}. ${p}`));
  l.push("");
  l.push("## CONOCIMIENTO");
  l.push(
    `Trabajá solo con las fuentes cargadas${fuentes.length ? `: ${fuentes.join(", ")}` : ""}${fuentesTxt ? ` (${fuentesTxt})` : ""}.`,
  );
  l.push("Citá de qué fuente sale cada afirmación importante. Si algo no surge de las fuentes, decilo: no lo completes con conocimiento general sin advertirlo.");
  l.push("");
  l.push("## REGLAS");
  if (FALTANTE[faltante]) l.push(`- ${FALTANTE[faltante]}`);
  if (INCERTIDUMBRE[incertidumbre]) l.push(`- ${INCERTIDUMBRE[incertidumbre]}`);
  l.push("- Nunca inventes datos, cifras, normas, nombres ni referencias.");
  l.push("- Separá lo que surge de las fuentes de lo que es tu inferencia.");
  l.push("");
  l.push("## LÍMITES");
  l.push(`- Tu alcance: ${AUTONOMIA[autonomia] ?? "[hasta dónde llega]"}.`);
  if (nunca.length) l.push(`- Sin intervención humana NO podés: ${nunca.join(", ")}.`);
  if (sinHumano.includes("depende"))
    l.push("- Si el caso es sensible o excepcional, detenete y pedí la intervención de una persona antes de seguir.");
  l.push("- Cuando un caso exceda tu alcance, detenete y explicá por qué.");
  l.push("");
  l.push("## SALIDA");
  l.push(FORMATO[salidaId] ?? "[cómo entrega el resultado]");
  l.push("");
  l.push("## CONTROL FINAL");
  l.push("Antes de entregar, verificá: ¿seguiste el método? ¿usaste solo las fuentes? ¿marcaste lo que falta? ¿respetaste los límites? ¿la salida tiene el formato pedido?");
  return l.join("\n");
}

// --- Placas ---------------------------------------------------------------------------

export const SLIDES_C2: SlideBbva[] = [
  {
    t: "portada",
    bloque: "Apertura",
    nota: "\"La semana pasada encontramos lugares de nuestro trabajo donde podía tener sentido incorporar inteligencia artificial. Hoy vamos a hacer algo distinto: vamos a construir la primera versión de la inteligencia artificial que queremos poner ahí.\"",
  },
  {
    t: "ingreso",
    bloque: "Apertura",
    nota: "Mismo QR y mismo link que la semana pasada. Quien ya entró, entra directo con su nombre. Quien no vino: nombre y área. Hoy el celular no es una encuesta: es donde se va a construir su asistente, etapa por etapa.",
  },
  {
    t: "placa",
    numero: 1,
    bloque: "Apertura",
    titulo: "La semana pasada encontramos el lugar",
    bajada: "Hoy vamos a construir lo que va ahí.",
    ilus: "c2-nodo-vacio",
    layout: "lado",
    nota: "Recuperar la clase 1: proceso → operaciones → delegación → autonomía → humano en el circuito → candidato. El nodo vacío es el candidato de cada uno. Hoy: ¿cómo construyo la IA que va ahí?",
  },
  {
    t: "placa",
    numero: 2,
    bloque: "Apertura",
    titulo: "Hoy tiene que funcionar",
    bajada: "Aunque sea una versión 0.1.",
    ilus: "c2-prototipo",
    layout: "lado",
    nota: "Es una clase de construcción. La meta no es un producto perfecto: es atravesar por primera vez el ciclo DISEÑAR → CONSTRUIR → PROBAR → OBSERVAR → CORREGIR. Tesis: un asistente es una IA a la que le diseñamos un trabajo.",
  },
  {
    t: "placa",
    numero: 3,
    bloque: "La tarea",
    titulo: "¿Qué trabajo le vas a dar?",
    bajada: "Un asistente necesita una tarea, no una intención.",
    ilus: "c2-tarea",
    layout: "lado",
    nota: "\"Que me ayude con los reclamos\" es una intención. \"Clasificar el motivo de cada reclamo que entra\" es una tarea. Reducir los proyectos demasiado amplios.",
  },
  {
    t: "placa",
    numero: 4,
    bloque: "La tarea",
    titulo: "Achicalo",
    bajada: "Cuanto más concreto el trabajo, mejor podemos diseñarlo.",
    ilus: "c2-achicalo",
    layout: "centro",
    nota: "Del proceso grande a una operación específica. Si el candidato de la semana pasada es un proceso entero, elegir UN tramo. Ahora lo deciden en el celular.",
  },
  {
    t: "actividad",
    activa: "bbva2_a1",
    bloque: "La tarea",
    nota: "APP 1 (2 min). Eligen la operación principal y qué debe producir. Opcional: la tarea en una línea y un nombre. Mostrar resultados: qué operaciones y qué salidas predominan. Esta decisión ya queda guardada en su asistente.",
  },
  {
    t: "placa",
    numero: 5,
    bloque: "Sin preparar nada",
    titulo: "Probemos sin preparar nada",
    bajada: "Un chat vacío también puede responder.",
    ilus: "c2-chat-vacio",
    layout: "lado",
    nota: "DEMO en vivo: abrir Gemini sin nada y pedir la tarea de alguien del grupo (ej.: \"armame el informe mensual\"). Mostrar que responde algo plausible.",
  },
  {
    t: "placa",
    numero: 6,
    bloque: "Sin preparar nada",
    titulo: "Responder no es saber trabajar",
    bajada: "Una buena respuesta aislada puede ser casualidad.",
    ilus: "c2-plausible",
    layout: "lado",
    nota: "Repetir el mismo pedido 2 o 3 veces: cambian formato, criterio y supuestos. Respuesta plausible ≠ consistencia operativa. En el trabajo necesitamos que lo haga igual, bien, todas las veces.",
  },
  {
    t: "placa",
    numero: 7,
    bloque: "Sin preparar nada",
    titulo: "¿Qué le falta?",
    bajada: "Método · contexto · conocimiento · límites.",
    ilus: "c2-faltan",
    layout: "centro",
    nota: "Preguntar al grupo qué le faltó al chat vacío. Dejar que aparezcan: no sabe cómo lo hacemos (método), no sabe de este caso (contexto), no tiene nuestras fuentes (conocimiento), no sabe dónde parar (límites).",
  },
  {
    t: "curva",
    numero: 8,
    bloque: "Diseñar el trabajo",
    titulo: "Diseñar antes de escribir",
    bajada: "El system prompt viene después.",
    anillo: "Diseñar antes de escribir · El system prompt viene después · ",
    centro: "DISEÑAR",
    de: "Escribir instrucciones",
    a: "Diseñar el trabajo",
    nota: "CURVA 1 · FRENAR. El impulso es ponerse a escribir un prompt largo. No: primero decidimos el trabajo. El system prompt es la traducción de decisiones de diseño.",
  },
  {
    t: "placa",
    numero: 9,
    bloque: "Diseñar el trabajo",
    titulo: "Propósito",
    bajada: "¿Para qué existe este asistente?",
    ilus: "c2-plano-proposito",
    layout: "centro",
    nota: "Una misión específica, en una frase. Ya la tienen: es la operación + el resultado que eligieron en la app 1.",
  },
  {
    t: "placa",
    numero: 10,
    bloque: "Diseñar el trabajo",
    titulo: "Entradas",
    bajada: "¿Qué necesita recibir para empezar?",
    ilus: "c2-plano-entradas",
    layout: "centro",
    nota: "Consulta, documento, ticket, datos, solicitud, incidente. Si no sabemos qué entra, no sabemos qué tiene que hacer.",
  },
  {
    t: "placa",
    numero: 11,
    bloque: "Diseñar el trabajo",
    titulo: "Método",
    bajada: "¿Qué debería hacer y en qué orden?",
    ilus: "c2-plano-metodo",
    layout: "centro",
    nota: "Traducir el proceso a operaciones, como en la clase 1 (anatomía del proceso). Ahora lo arman en el celular.",
  },
  {
    t: "actividad",
    activa: "bbva2_a2",
    bloque: "Diseñar el trabajo",
    nota: "APP 2 (2-3 min). Eligen la entrada y tocan los pasos en orden: la app arma la cadena (RECIBIR → EXTRAER → COMPARAR → …). Mostrar resultados: los pasos más usados y las cadenas que más se repiten.",
  },
  {
    t: "placa",
    numero: 12,
    bloque: "Diseñar el trabajo",
    titulo: "Salida",
    bajada: "¿Qué tiene que entregar cuando termina?",
    ilus: "c2-plano-salida",
    layout: "centro",
    nota: "Definir el output también es diseñar: formato, extensión, secciones, qué marca como dudoso.",
  },
  {
    t: "placa",
    numero: 13,
    bloque: "Diseñar el trabajo",
    titulo: "No le pidas “que ayude”",
    bajada: "Definí qué significa terminar bien el trabajo.",
    ilus: "c2-ayude",
    layout: "lado",
    nota: "Combatir instrucciones vagas. \"Ayudame\" no tiene criterio de terminado. Preguntar: ¿cómo te das cuenta de que lo hizo bien?",
  },
  {
    t: "placa",
    numero: 14,
    bloque: "Diseñar el trabajo",
    titulo: "Ya tenemos un esqueleto",
    bajada: "Propósito + entrada + método + salida.",
    ilus: "c2-esqueleto",
    layout: "centro",
    nota: "Primera síntesis. Todo eso ya está guardado en su celular. Falta saber qué información usa y dónde se detiene.",
  },
  {
    t: "placa",
    numero: 15,
    bloque: "Instrucción, contexto, conocimiento",
    titulo: "No todo va en el prompt",
    bajada: "Instrucción, contexto y conocimiento cumplen funciones distintas.",
    ilus: "c2-cajas",
    layout: "centro",
    nota: "La distinción central de la clase. Tres cajones distintos.",
  },
  {
    t: "placa",
    numero: 16,
    bloque: "Instrucción, contexto, conocimiento",
    titulo: "Instrucciones",
    bajada: "Cómo debe trabajar siempre.",
    ilus: "c2-cajas-instrucciones",
    layout: "centro",
    nota: "Pasos, reglas, comportamiento, formato y límites persistentes. Van en el system prompt (las instrucciones de la Gem). No cambian de caso a caso.",
  },
  {
    t: "placa",
    numero: 17,
    bloque: "Instrucción, contexto, conocimiento",
    titulo: "Contexto",
    bajada: "Qué necesita saber de este caso.",
    ilus: "c2-cajas-contexto",
    layout: "centro",
    nota: "Información variable de cada interacción: el reclamo de hoy, los datos de esta solicitud. Va en el mensaje, no en las instrucciones.",
  },
  {
    t: "placa",
    numero: 18,
    bloque: "Instrucción, contexto, conocimiento",
    titulo: "Conocimiento",
    bajada: "Con qué fuentes debe trabajar.",
    ilus: "c2-cajas-conocimiento",
    layout: "centro",
    nota: "Procedimientos, manuales, políticas, documentación, FAQs. Van como archivos de conocimiento (en la Gem o en NotebookLM).",
  },
  {
    t: "actividad",
    activa: "bbva2_a3",
    bloque: "Instrucción, contexto, conocimiento",
    nota: "APP 3 (1-2 min). Seis piezas, cada una a su cajón. Mostrar resultados y mirar dónde aparecen las confusiones (la marca roja señala la pieza más discutida). Correctas: 1 y 4 instrucción · 2 y 5 contexto · 3 y 6 conocimiento.",
  },
  {
    t: "curva",
    numero: 19,
    bloque: "Conocimiento",
    titulo: "Método ≠ biblioteca",
    bajada: "Una cosa es enseñarle cómo trabajar. Otra, darle con qué trabajar.",
    anillo: "Una cosa es enseñarle cómo trabajar · Otra, darle con qué trabajar · ",
    centro: "MÉTODO ≠ BIBLIOTECA",
    de: "Cómo trabaja",
    a: "Con qué trabaja",
    nota: "CURVA 2 · FRENAR. Hasta acá diseñamos el método. Ahora: ¿de dónde sale lo que sabe? Entramos en bases de conocimiento.",
  },
  {
    t: "placa",
    numero: 20,
    bloque: "Conocimiento",
    titulo: "¿De dónde sale lo que “sabe”?",
    bajada: "No todo conocimiento debería quedar librado al modelo.",
    ilus: "c2-de-donde",
    layout: "lado",
    nota: "El modelo \"sabe\" cosas generales, desactualizadas o de otro país. Para nuestro trabajo necesitamos fuentes delimitadas: las nuestras, vigentes.",
  },
  {
    t: "placa",
    numero: 21,
    bloque: "Conocimiento",
    titulo: "Una base de conocimiento",
    bajada: "Acotar fuentes también es diseñar.",
    ilus: "c2-base",
    layout: "lado",
    nota: "Seleccionar el corpus forma parte de la arquitectura (Chumbita: gobernanza de datos). No subir un manual de 300 páginas si lo que importa es la página 1. Versión vigente, nombre claro, una cosa por archivo.",
  },
  {
    t: "placa",
    numero: 22,
    bloque: "Conocimiento",
    titulo: "NotebookLM",
    bajada: "Trabajar sobre un conjunto explícito de fuentes.",
    ilus: "c2-notebook",
    layout: "lado",
    nota: "DEMO: un cuaderno con 2 o 3 fuentes. Responde desde esas fuentes y cita de dónde sale cada cosa. No es \"otro chatbot\": es trabajar sobre un corpus que elegimos. Si no está en las fuentes, lo dice.",
  },
  {
    t: "placa",
    numero: 23,
    bloque: "Conocimiento",
    titulo: "¿Qué documentos necesita el tuyo?",
    bajada: "El conocimiento también se diseña.",
    ilus: "c2-mochila",
    layout: "lado",
    nota: "Trasladar la demo al proyecto de cada uno. ¿Qué necesita tener a mano? Lo deciden en el celular.",
  },
  {
    t: "actividad",
    activa: "bbva2_a4",
    bloque: "Conocimiento",
    nota: "APP 4 (2 min). La mochila: qué fuentes necesita y qué hace si no están. Mostrar resultados: qué fuentes predominan y cuántos dejan que \"continúe sin ella\" (riesgo de inventar).",
  },
  {
    t: "placa",
    numero: 24,
    bloque: "Límites",
    titulo: "¿Qué hace cuando no sabe?",
    bajada: "La duda y la derivación también se diseñan.",
    ilus: "c2-no-sabe",
    layout: "lado",
    nota: "Prevenir respuestas inventadas: pedir, advertir, derivar. Si no se lo decimos, completa. \"Si no está en las fuentes, decilo\" es una de las instrucciones más valiosas.",
  },
  {
    t: "placa",
    numero: 25,
    bloque: "Límites",
    titulo: "¿Dónde termina su trabajo?",
    bajada: "Un buen asistente también sabe cuándo detenerse.",
    ilus: "c2-detenerse",
    layout: "lado",
    nota: "Recuperar humano en el circuito de la clase 1 (asiste · prepara · propone · ejecuta). ¿Hasta qué paso llega y quién sigue?",
  },
  {
    t: "placa",
    numero: 26,
    bloque: "Límites",
    titulo: "El humano no es un parche",
    bajada: "Es parte de la arquitectura.",
    ilus: "c2-humano",
    layout: "lado",
    nota: "La intervención humana no se agrega al final porque falló algo: se diseña desde el principio, como una pieza del circuito.",
  },
  {
    t: "actividad",
    activa: "bbva2_a5",
    bloque: "Límites",
    nota: "APP 5 (2 min). Hasta dónde llega, qué hace si no sabe, qué no hace nunca sin una persona. Mostrar resultados: el mapa de límites del grupo.",
  },
  {
    t: "placa",
    numero: 27,
    bloque: "Borrador V0.1",
    titulo: "Ahora sí: system prompt",
    bajada: "Convertimos decisiones de diseño en instrucciones persistentes.",
    ilus: "c2-system-prompt",
    layout: "lado",
    activa: "bbva2_a6",
    nota: "Se abre solo el BORRADOR V0.1 en el celular: combina tarea + salida + método + fuentes + conducta ante faltantes + autonomía + límites. Estructura: propósito, contexto, entradas, método, conocimiento, reglas, límites, salida, control final. Que lo lean y editen. No es el prompt perfecto: es una hipótesis.",
  },
  {
    t: "placa",
    numero: 28,
    bloque: "Borrador V0.1",
    titulo: "¿Dónde vive?",
    bajada: "Gem · GPT o asistente equivalente · otras plataformas.",
    ilus: "c2-contenedores",
    layout: "lado",
    activa: "bbva2_a6",
    nota: "DEMO: Gemini → Gems → Nueva Gem → pegar instrucciones → subir archivos de conocimiento → probar en la vista previa → guardar. La lógica es la misma en un GPT o en otros: instrucciones persistentes + conocimiento + conversación. La herramienta se elige después del diseño. Dar 8-10 min para que la creen.",
  },
  {
    t: "placa",
    numero: 29,
    bloque: "Prueba",
    titulo: "Rompelo",
    bajada: "No pruebes si funciona. Buscá dónde falla.",
    ilus: "c2-rompelo",
    layout: "lado",
    activa: "bbva2_a7",
    nota: "Tres situaciones: CASO NORMAL (ejemplo típico), CASO INCOMPLETO (falta información), CASO DIFÍCIL (excepción o ambigüedad donde debería detenerse). Control: ¿siguió el método? ¿usó la información correcta? ¿inventó? ¿respetó límites? ¿pidió datos? ¿produjo la salida esperada? Anotan en el celular.",
  },
  {
    t: "resultado",
    de: "bbva2_a7",
    bloque: "Prueba",
    titulo: "Dónde se rompieron",
    bajada: "Cada falla es una instrucción que falta.",
    nota: "Mostrar resultados: cuántos asistentes funcionaron en cada caso y qué fallas aparecieron. Cada falla se corrige volviendo a una decisión de diseño (método, conocimiento, límites, salida).",
  },
  {
    t: "placa",
    numero: 30,
    bloque: "Cierre",
    titulo: "V0.1",
    bajada: "Construir → probar → corregir → volver a probar.",
    ilus: "c2-nodo-lleno",
    layout: "lado",
    nota: "\"La semana pasada encontramos un lugar de nuestro trabajo donde podía tener sentido incorporar IA. Hoy construimos algo para poner ahí. No está terminado, y eso es importante. Un asistente especializado aparece cuando podemos describir un trabajo, convertirlo en instrucciones, darle las fuentes correctas, ponerle límites, probarlo contra casos reales y corregirlo.\"",
  },
  {
    t: "cierre",
    bloque: "Cierre",
    nota: "\"Un asistente no se especializa porque le escribimos un prompt largo. Se especializa cuando entendemos el trabajo, diseñamos cómo debe hacerlo, le damos la información correcta, decidimos sus límites y somos capaces de probar si realmente hace aquello para lo que lo construimos.\" UN ASISTENTE NO SE ENCUENTRA. SE DISEÑA, SE PRUEBA Y SE CORRIGE.",
  },
];
