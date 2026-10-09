// ============================================================
// Tribunal Fiscal · Primera charla: "Introducción a la inteligencia
// artificial" (120 minutos). Placas del Dr. Mario Rodolfo Leal con su
// texto literal (19 placas) y, entre ellas, las actividades en vivo:
//
//   portada · ingreso ─ perfil (abogado/a, contador/a, administrativo/a)
//   04 Diagnóstico inicial ─ ¿usa IA? ¿cuál? (su primera pregunta)
//   05 Inteligencia artificial ─ ¿para qué tarea la utilizó? (la segunda)
//   09 La fluidez puede ocultar errores ─ ¿cómo verificó? (la tercera)
//   10 Dos formas de pedir ayuda ─ ¿qué le falta a este pedido?
//   11 Usos jurídicos ─ ¿qué tareas realiza con mayor frecuencia?
//   12 Usos contables ─ ¿qué le gustaría delegar?
//   13 Interdisciplinario ─ franja con los perfiles de la sala
//   14 Riesgos ─ ¿qué riesgo le preocupa más?
//   15 Confidencialidad ─ ¿qué no delegaría nunca?
//   18 Clasificación A/C/N ─ diez tareas + riesgo y control por grupo
//   síntesis: delegaría / no delegaría ─ 19 Cinco ideas de cierre
//
// Nunca dos preguntas seguidas (salvo el taller A/C/N y su riesgo y
// control, que son un mismo ejercicio). Las placas de contenido no cambian
// la actividad abierta: quien llegó tarde puede terminar de responder.
// ============================================================

import type { ClaseVivoConfig } from "./clase-vivo";
import { TF_EXPOSITOR, TF_INSTITUCION, type TfActividad, type TfClase, type TfSlide, type TfTramo } from "./tribunal";

export const TF1_SLUG = "tribunal-fiscal-1";
export const TF1_TITULO = "Introducción a la inteligencia artificial";

const TRAMOS: TfTramo[] = [
  { rango: "0–30", nombre: "Conceptos básicos", minutos: 30 },
  { rango: "30–65", nombre: "Funcionamiento y usos", minutos: 35 },
  { rango: "65–75", nombre: "Pausa", minutos: 10, pausa: true },
  { rango: "75–105", nombre: "Riesgos y demostración", minutos: 30 },
  { rango: "105–120", nombre: "Taller y cierre", minutos: 15 },
];

// --- Actividades en vivo ----------------------------------------------------------

// Botones cortos para que las tres opciones entren en una fila del celular;
// la bajada y la placa 18 dicen qué es cada letra.
const ACN = [
  { id: "a", emoji: "🟢", label: "A" },
  { id: "c", emoji: "🟡", label: "C" },
  { id: "n", emoji: "🔴", label: "N" },
];

/**
 * Tareas del taller de clasificación.
 * PROVISORIAS: reemplazar por las diez tareas del anexo del Dr. Leal.
 * Están armadas con frases de sus propias placas (usos, riesgos y confidencialidad).
 */
const TAREAS_ACN: [string, string][] = [
  ["agravios", "Ordenar los agravios de un recurso"],
  ["hechos", "Separar hechos, argumentos e inferencias de un escrito"],
  ["terminos", "Proponer términos de búsqueda de jurisprudencia"],
  ["citar", "Citar la jurisprudencia que sugiere la herramienta"],
  ["clasificar", "Clasificar conceptos de una planilla ficticia"],
  ["explicar", "Explicar un cálculo ya verificado"],
  ["intereses", "Calcular los intereses de un ajuste"],
  ["cargar", "Cargar un expediente real para resumirlo"],
  ["coherencia", "Revisar la coherencia interna de un borrador"],
  ["decidir", "Decidir quién tiene razón y redactar la decisión"],
];

const ACTIVIDADES: TfActividad[] = [
  {
    key: "tf1_perfil",
    kind: "opciones",
    titulo: "¿Cuál es su perfil?",
    bajada: "Para conocer la sala. Elija la opción que corresponda.",
    opciones: [
      { id: "abogado", emoji: "⚖️", label: "Abogado/a" },
      { id: "contador", emoji: "📊", label: "Contador/a" },
      { id: "administrativo", emoji: "🗂️", label: "Personal administrativo" },
      { id: "otro", emoji: "✨", label: "Otro perfil" },
    ],
  },
  {
    key: "tf1_uso",
    kind: "encuesta",
    titulo: "¿Utiliza inteligencia artificial?",
    bajada: "Si usó varias herramientas, elija la que más utiliza.",
    preguntas: [
      {
        id: "usa",
        q: "¿Usó alguna herramienta de IA?",
        opciones: [
          { id: "frecuente", emoji: "🔁", label: "Sí, con frecuencia en el trabajo" },
          { id: "aveces", emoji: "🙂", label: "Sí, alguna vez en el trabajo" },
          { id: "fuera", emoji: "🏠", label: "Solo fuera del trabajo" },
          { id: "nunca", emoji: "🚫", label: "Nunca la usé" },
        ],
      },
      {
        id: "herramienta",
        q: "¿Qué herramienta de IA utilizó?",
        opciones: [
          { id: "chatgpt", emoji: "🟢", label: "ChatGPT" },
          { id: "gemini", emoji: "🔵", label: "Gemini" },
          { id: "copilot", emoji: "🟣", label: "Copilot" },
          { id: "claude", emoji: "🟠", label: "Claude" },
          { id: "meta", emoji: "💬", label: "Meta AI (WhatsApp)" },
          { id: "otra", emoji: "✨", label: "Otra" },
          { id: "ninguna", emoji: "➖", label: "Ninguna" },
        ],
      },
    ],
  },
  {
    key: "tf1_para_que",
    kind: "palabra",
    titulo: "¿Para qué tarea la utilizó?",
    bajada: "Una o dos palabras. Ej.: resumir, buscar, redactar… Si nunca la usó, escriba «ninguna».",
    maxChars: 24,
    moderada: true,
  },
  {
    key: "tf1_verifico",
    kind: "opciones",
    titulo: "¿Cómo verificó la respuesta?",
    bajada: "Elija la forma principal.",
    opciones: [
      { id: "fuente", emoji: "📖", label: "Leí la fuente oficial" },
      { id: "comparar", emoji: "🔁", label: "La comparé con otra fuente" },
      { id: "calculo", emoji: "🧮", label: "Volví a hacer el cálculo" },
      { id: "colega", emoji: "👥", label: "La consulté con un colega" },
      { id: "no", emoji: "🙈", label: "No la verifiqué" },
      { id: "nouso", emoji: "➖", label: "No uso IA" },
    ],
  },
  {
    key: "tf1_falta",
    kind: "palabra",
    titulo: "¿Qué le falta a este pedido?",
    bajada: "«Decime quién tiene razón y redactá la decisión». Una o dos palabras.",
    maxChars: 24,
    moderada: true,
  },
  {
    key: "tf1_tareas",
    kind: "chips",
    titulo: "¿Qué tareas realiza con mayor frecuencia?",
    bajada: "Marque todas las que correspondan.",
    opciones: [
      { id: "expedientes", emoji: "📂", label: "Estudiar expedientes y recursos" },
      { id: "proyectos", emoji: "✍️", label: "Redactar proyectos de sentencia o resolución" },
      { id: "prueba", emoji: "📑", label: "Analizar prueba y documentación" },
      { id: "calculos", emoji: "🧮", label: "Revisar liquidaciones, cálculos o pericias" },
      { id: "normativa", emoji: "🔎", label: "Buscar normativa y jurisprudencia" },
      { id: "tramite", emoji: "📨", label: "Proveer escritos y notificar" },
      { id: "plazos", emoji: "🗓️", label: "Controlar plazos y registrar actuaciones" },
      { id: "mesa", emoji: "🛎️", label: "Atender mesa de entradas y consultas" },
      { id: "informes", emoji: "📊", label: "Preparar informes, planillas o estadísticas" },
      { id: "notas", emoji: "✉️", label: "Redactar notas, oficios y comunicaciones" },
    ],
  },
  {
    key: "tf1_delegar",
    kind: "palabra",
    titulo: "¿Qué tarea le gustaría delegar en la IA?",
    bajada: "Una tarea de su trabajo, en pocas palabras. Ej.: resumir expedientes.",
    maxChars: 28,
    moderada: true,
  },
  {
    key: "tf1_riesgo",
    kind: "opciones",
    titulo: "¿Qué riesgo le preocupa más en su trabajo?",
    bajada: "Los seis riesgos de la placa. Elija uno.",
    opciones: [
      { id: "invenciones", emoji: "🎭", label: "Invenciones · datos o citas falsos" },
      { id: "omisiones", emoji: "🕳️", label: "Omisiones · excepciones ausentes" },
      { id: "sesgos", emoji: "⚖️", label: "Sesgos · asociaciones impropias" },
      { id: "desactualizacion", emoji: "📅", label: "Desactualización · normas o criterios superados" },
      { id: "confidencialidad", emoji: "🔒", label: "Confidencialidad · exposición de información" },
      { id: "automatizacion", emoji: "⚙️", label: "Automatización · delegación de la decisión" },
    ],
  },
  {
    key: "tf1_no_delegar",
    kind: "palabra",
    titulo: "¿Qué tarea no delegaría nunca en la IA?",
    bajada: "En pocas palabras. Ej.: decidir, valorar la prueba…",
    maxChars: 28,
    moderada: true,
  },
  {
    key: "tf1_acn",
    kind: "encuesta",
    titulo: "Clasificación de tareas",
    bajada: "Para cada tarea: A (uso admisible), C (uso condicionado) o N (no delegar).",
    preguntas: TAREAS_ACN.map(([id, q]) => ({ id, q, opciones: ACN })),
    acn: true,
  },
  {
    key: "tf1_control",
    kind: "texto",
    titulo: "Un riesgo y un control",
    bajada: "Una respuesta por grupo: la tarea, el riesgo identificado y el control propuesto.",
    placeholder: "Grupo … · Tarea: … · Riesgo: … · Control: …",
    maxChars: 280,
    moderada: true,
  },
];

// --- Placas -----------------------------------------------------------------------------

const SLIDES: TfSlide[] = [
  { t: "portada", activa: "tf1_perfil", tramo: 0 },
  { t: "ingreso", activa: "tf1_perfil", tramo: 0 },
  {
    t: "actividad",
    activa: "tf1_perfil",
    escena: "¿Quiénes estamos hoy?",
    tramo: 0,
    nota: "Primera actividad: al entrar, cada uno marca su perfil. Comentar la mezcla de la sala (abogados, contadores, administrativos): de ahí la idea de un lenguaje común. El resultado vuelve en la placa 13.",
  },
  {
    t: "placa",
    num: "02",
    titulo: "Propósito del encuentro",
    tramo: 0,
    cuerpo: {
      forma: "lema",
      lema: "Construir un lenguaje común para usar IA con criterio institucional",
      items: [
        "Comprender qué hace una herramienta generativa",
        "Reconocer usos razonables y usos impropios",
        "Mantener la verificación y la decisión bajo control humano",
      ],
      kickers: ["Comprensión", "Reconocimiento", "Control"],
    },
    nota: "Explique que la clase busca comprensión práctica. La IA puede asistir tareas, pero no sustituye competencia, valoración de prueba ni deliberación.",
  },
  {
    t: "placa",
    num: "03",
    titulo: "Recorrido de los 120 minutos",
    tramo: 0,
    cuerpo: { forma: "recorrido" },
    nota: "Presente la agenda para que el público conozca el ritmo. La demostración y la actividad forman parte del tiempo total.",
  },
  {
    t: "placa",
    num: "04",
    titulo: "Diagnóstico inicial",
    tramo: 0,
    cuerpo: {
      forma: "preguntas",
      preguntas: ["¿Qué herramienta de IA utilizó?", "¿Para qué tarea?", "¿Cómo verificó la respuesta?"],
      cierre: "Escuchar tres experiencias breves",
    },
    banner: "¿Utiliza inteligencia artificial? ¿Cuál?",
    nota: "Pida tres respuestas. Registre tarea solicitada y control efectuado. Evite corregir de inmediato y use los errores como oportunidades de aprendizaje.\n\n▶ En el celular, solo su primera pregunta: ¿usa IA y qué herramienta? «¿Para qué?» llega después de la placa 05 y «¿cómo verificó?» después de la 09.",
  },
  {
    t: "actividad",
    activa: "tf1_uso",
    escena: "Diagnóstico inicial",
    tramo: 0,
    nota: "La primera pregunta del Dr. Leal: quiénes usan IA y con qué herramienta. Comentar cuántos nunca la usaron: nadie queda afuera.",
  },
  {
    t: "placa",
    num: "05",
    titulo: "Inteligencia artificial",
    tramo: 0,
    cuerpo: {
      forma: "verbos",
      definicion: "Conjunto de técnicas capaces de reconocer patrones, clasificar, predecir o generar contenido",
      verbos: ["reconocer patrones", "clasificar", "predecir", "generar contenido"],
      items: [
        "No existe una única inteligencia artificial",
        "Cada sistema sirve para tareas determinadas",
        "La utilidad depende de los datos, la instrucción y el control",
      ],
    },
    banner: "¿Para qué utiliza la inteligencia artificial?",
    nota: "Distinga IA como expresión amplia. Mencione sistemas de clasificación, predicción y generación. No use metáforas que atribuyan conciencia a la herramienta.\n\n▶ Después de «cada sistema sirve para tareas determinadas»: ¿para qué tarea la utilizó? (nube, se modera).",
  },
  {
    t: "actividad",
    activa: "tf1_para_que",
    escena: "Diagnóstico inicial · ¿para qué?",
    tramo: 0,
    nota: "La segunda pregunta del Dr. Leal. Respuesta abierta: revisen las palabras en este celular (abajo) y ocúltenlas si hace falta; después toquen «Proyectar respuestas». Si en la placa 04 no surgieron las tres experiencias, el Dr. Leal puede tomarlas de esta nube.",
  },
  {
    t: "placa",
    num: "06",
    titulo: "Inteligencia artificial generativa",
    tramo: 0,
    cuerpo: {
      forma: "generativa",
      definicion: "Produce texto, imágenes, cuadros u otros contenidos a partir de patrones aprendidos y de la instrucción del usuario",
      imita: "Puede imitar la forma de una respuesta jurídica",
      cierre: "La apariencia profesional no garantiza que el contenido sea verdadero",
    },
    nota: "Explique que el sistema genera contenido probable. No tiene experiencia profesional, conciencia del expediente ni responsabilidad por la decisión.",
  },
  {
    t: "placa",
    num: "07",
    titulo: "Cuatro elementos básicos",
    tramo: 0,
    cuerpo: {
      forma: "flujo",
      pares: [
        { k: "MODELO", v: "Sistema entrenado" },
        { k: "DATOS", v: "Información disponible" },
        { k: "INSTRUCCIÓN", v: "Pedido del usuario" },
        { k: "RESPUESTA", v: "Contenido generado" },
      ],
      cierre: "La respuesta es una propuesta que requiere examen",
    },
    nota: "Desarrolle modelo, datos, instrucción y respuesta. Compare la herramienta con un colaborador veloz que puede completar vacíos inventando.",
  },
  {
    t: "placa",
    num: "08",
    titulo: "Buscar información y generar una respuesta",
    tramo: 1,
    cuerpo: {
      forma: "columnas",
      columnas: [
        { k: "BUSCAR", lineas: ["Localiza documentos existentes", "La fuente debe abrirse y leerse"] },
        { k: "GENERAR", lineas: ["Produce contenido nuevo", "La salida puede incluir errores"] },
      ],
      cierre: "Toda cita jurídica exige comprobación en la fuente oficial",
    },
    nota: "Subraye que un modelo generativo no equivale a una base jurídica oficial. Incluso cuando navega, puede interpretar mal o seleccionar una fuente inadecuada.",
  },
  {
    t: "placa",
    num: "09",
    titulo: "La fluidez puede ocultar errores",
    tramo: 1,
    cuerpo: {
      forma: "documento",
      items: [
        "Una cita puede ser inexistente",
        "Una cifra puede surgir de una premisa falsa",
        "Una síntesis puede omitir una excepción",
        "El tono seguro no equivale a certeza",
      ],
    },
    banner: "¿Cómo verificó la respuesta?",
    nota: "Explique por qué los modelos producen secuencias plausibles. Cada hecho, cita, cifra, cálculo y conclusión relevante necesita verificación independiente.\n\n▶ Sigue la tercera pregunta de la placa 04: ¿cómo verificó la respuesta?",
  },
  {
    t: "actividad",
    activa: "tf1_verifico",
    escena: "La fluidez puede ocultar errores",
    tramo: 1,
    nota: "La tercera pregunta del Dr. Leal, justo después de hablar de verificación. Si muchos marcan «No la verifiqué», él lo retoma. Sin corregir: es diagnóstico.",
  },
  {
    t: "placa",
    num: "10",
    titulo: "Dos formas de pedir ayuda",
    tramo: 1,
    cuerpo: {
      forma: "columnas",
      cita: true,
      columnas: [
        { k: "PEDIDO ABIERTO", lineas: ["“Decime quién tiene razón y redactá la decisión”"] },
        { k: "PEDIDO CONTROLABLE", lineas: ["Ordenar hechos, argumentos, documentos y datos faltantes sin proponer una decisión"] },
      ],
      cierre: "Más precisión facilita la revisión, pero no elimina el riesgo",
    },
    banner: "¿Qué le falta a este pedido?",
    nota: "Pregunte qué elementos faltan en el pedido abierto. Recoja documentos, período, norma, hechos, límites y formato.",
  },
  {
    t: "actividad",
    activa: "tf1_falta",
    escena: "Dos formas de pedir ayuda",
    tramo: 1,
    nota: "Breve. Revisen las palabras abajo y proyecten. El Dr. Leal recoge: documentos, período, norma, hechos, límites y formato.",
  },
  {
    t: "placa",
    num: "11",
    titulo: "Usos jurídicos",
    tramo: 1,
    cuerpo: {
      forma: "expediente",
      items: [
        "Ordenar agravios y cuestiones controvertidas",
        "Separar hechos, argumentos e inferencias",
        "Comparar textos normativos aportados",
        "Proponer términos de búsqueda",
        "Revisar coherencia interna de un borrador",
      ],
      cierre: "Jurisprudencia y normas siempre se comprueban en la publicación oficial",
    },
    banner: "¿Qué tareas realiza con mayor frecuencia?",
    nota: "Aclare que estos son usos auxiliares. El profesional debe controlar vigencia normativa, fuente, cita, razonamiento y congruencia.\n\n▶ Sigue: ¿qué tareas realiza con mayor frecuencia? (varias opciones).",
  },
  {
    t: "actividad",
    activa: "tf1_tareas",
    escena: "Usos jurídicos y contables",
    tramo: 1,
    nota: "Después de los usos jurídicos: qué hace cada uno todos los días. Leer las tres tareas más marcadas; sirven de puente a los usos contables y a «¿qué le gustaría delegar?».",
  },
  {
    t: "placa",
    num: "12",
    titulo: "Usos contables",
    tramo: 1,
    cuerpo: {
      forma: "planilla",
      items: [
        "Clasificar conceptos y documentación ficticia",
        "Describir variaciones y preparar controles",
        "Explicar un cálculo ya verificado",
        "Detectar inconsistencias para su revisión",
      ],
      cierre: "Recalcular y controlar datos, períodos, unidades, bases y fórmulas",
    },
    banner: "¿Qué tarea le gustaría delegar?",
    nota: "Destaque que una tabla prolija no valida los datos. El contador conserva la responsabilidad de repetir operaciones y comprobar premisas.",
  },
  {
    t: "actividad",
    activa: "tf1_delegar",
    escena: "Usos jurídicos y contables",
    tramo: 1,
    nota: "Después de ver los usos: qué le gustaría delegar a cada uno. Revisen y proyecten. Vuelve en la síntesis del final, junto a «lo que no delegaría».",
  },
  {
    t: "placa",
    num: "13",
    titulo: "Comprensión y trabajo interdisciplinario",
    tramo: 1,
    cuerpo: {
      forma: "perfiles",
      pares: [
        { k: "ABOGADO", v: "Control normativo y argumental" },
        { k: "CONTADOR", v: "Control de datos y operaciones" },
        { k: "INTEGRANTE LEGO", v: "Control de claridad y comprensión" },
      ],
      cierre: "La revisión cruzada permite detectar errores que una sola mirada puede pasar por alto",
    },
    recuerda: "tf1_perfil",
    nota: "Explique que el integrante lego puede pedir explicaciones y organizar preguntas. La herramienta no reemplaza el intercambio interdisciplinario.\n\n▶ La franja de abajo recuerda los perfiles que marcó la sala al ingresar.",
  },
  {
    t: "placa",
    num: "14",
    titulo: "Riesgos principales",
    tramo: 3,
    cuerpo: {
      forma: "matriz",
      pares: [
        { k: "INVENCIONES", v: "Datos o citas falsos" },
        { k: "OMISIONES", v: "Excepciones ausentes" },
        { k: "SESGOS", v: "Asociaciones impropias" },
        { k: "DESACTUALIZACIÓN", v: "Normas o criterios superados" },
        { k: "CONFIDENCIALIDAD", v: "Exposición de información" },
        { k: "AUTOMATIZACIÓN", v: "Delegación de la decisión" },
      ],
    },
    banner: "¿Qué riesgo le preocupa más en su trabajo?",
    nota: "Desarrolle cada riesgo con ejemplos. Dedique especial atención a inventar jurisprudencia, omitir salvedades y utilizar información desactualizada.",
  },
  {
    t: "actividad",
    activa: "tf1_riesgo",
    escena: "Riesgos principales",
    tramo: 3,
    nota: "La distribución acompaña la explicación; no la reemplaza. Comentar el riesgo más votado y el menos votado.",
  },
  {
    t: "placa",
    num: "15",
    titulo: "Confidencialidad y secreto fiscal",
    tramo: 3,
    cuerpo: {
      forma: "reserva",
      encabezado: "No ingresar en herramientas no autorizadas",
      items: [
        "Expedientes reales",
        "Datos personales o tributarios",
        "Documentación reservada",
        "Combinaciones de datos que permitan identificar",
      ],
      cierre: "Cambiar solamente el nombre puede ser insuficiente",
    },
    banner: "¿Qué tarea no delegaría nunca?",
    nota: "Explique anonimización y minimización. Ante la duda, usar un caso completamente ficticio o suspender la carga y consultar la política institucional.",
  },
  {
    t: "actividad",
    activa: "tf1_no_delegar",
    escena: "Riesgos y límites",
    tramo: 3,
    nota: "La contracara de «qué delegaría». Revisen y proyecten. Las dos nubes se comparan en la síntesis antes del cierre.",
  },
  {
    t: "placa",
    num: "16",
    titulo: "Demostración con un caso ficticio",
    tramo: 3,
    cuerpo: {
      forma: "caso",
      nombre: "Norte Azul SA",
      asunto: ["Ajuste de ingresos brutos", "Enero a marzo de 2025"],
      montosTitulo: "Transferencias discutidas",
      montos: ["$18 millones", "$12 millones"],
      items: [
        "La empresa afirma que son aportes de socios",
        "La administración cuestiona la documentación",
        "Existen datos y comprobaciones pendientes",
      ],
    },
    nota: "Lea el caso ficticio completo desde la guía. Compare la instrucción deficiente con la controlable y revise montos, períodos, afirmaciones y datos faltantes.",
  },
  {
    t: "placa",
    num: "17",
    titulo: "Instrucción para la demostración",
    tramo: 3,
    cuerpo: {
      forma: "instruccion",
      encabezado: "Trabaje exclusivamente con el caso ficticio",
      items: [
        "Identifique hechos informados",
        "Separe las afirmaciones de cada parte",
        "Enumere los documentos mencionados",
        "Marque las cuestiones que requieren comprobación",
        "No decida ni cite normas o jurisprudencia",
      ],
    },
    nota: "Ejecute la consulta y someta el resultado a control por perfiles. Si el sistema agrega información, muestre por qué no puede incorporarse.",
  },
  {
    t: "placa",
    num: "18",
    titulo: "Clasificación de tareas",
    tramo: 4,
    cuerpo: {
      forma: "acn",
      pares: [
        { k: "A", v: "Uso admisible" },
        { k: "C", v: "Uso condicionado" },
        { k: "N", v: "No delegar" },
      ],
      cierre: "Cada grupo debe identificar un riesgo y proponer un control",
    },
    banner: "¿Admisible, condicionado o no delegable?",
    nota: "Forme grupos mixtos y utilice las diez tareas del anexo. La categoría puede variar según la herramienta, la información y el control disponible.",
  },
  {
    t: "actividad",
    activa: "tf1_acn",
    escena: "Taller · Clasificación de tareas",
    tramo: 4,
    nota: "Cada participante clasifica las diez tareas en su celular. Mirar dónde la sala coincide y dónde se divide: esas tareas son las que vale la pena discutir en grupo.",
  },
  {
    t: "actividad",
    activa: "tf1_control",
    escena: "Taller · Clasificación de tareas",
    tramo: 4,
    nota: "Un integrante por grupo escribe tarea, riesgo y control. Revisen las respuestas abajo antes de proyectar. Quedan registradas para el material de la clase.",
  },
  {
    t: "sintesis",
    titulo: "Lo que la sala delegaría… y lo que no",
    actividades: ["tf1_delegar", "tf1_no_delegar"],
    tramo: 4,
    nota: "Las dos nubes juntas: qué tareas la sala quiere delegar y cuáles no entregaría. Puente a las cinco ideas de cierre.",
  },
  {
    t: "placa",
    num: "19",
    titulo: "Cinco ideas de cierre",
    tramo: 4,
    cuerpo: {
      forma: "ideas",
      items: [
        "La respuesta probable no es una verdad garantizada",
        "La fuente oficial se distingue del texto generado",
        "La instrucción precisa mejora el control",
        "La confidencialidad limita la información que puede cargarse",
        "La decisión permanece bajo responsabilidad humana",
      ],
      proxima: { k: "Próxima charla", v: "Cómo formular instrucciones y verificar resultados" },
    },
    material: true,
    nota: "Cierre con las cinco ideas y encargue observar una tarea habitual: qué parte admitiría asistencia, qué información debe excluirse y quién valida.\n\n▶ En los celulares aparece el material del encuentro para descargar (PDF).",
  },
];

export function getTf1Actividad(key: string): TfActividad | undefined {
  return ACTIVIDADES.find((a) => a.key === key);
}

const CONFIG: ClaseVivoConfig = {
  slug: TF1_SLUG,
  titulo: TF1_TITULO,
  materia: `${TF_INSTITUCION} · Primera charla del ciclo`,
  autor: TF_EXPOSITOR,
  cargo: "Dirección académica y exposición",
  poll: { alumno: 4000, alumnoMe: 20000, deck: 2500 },
  getActividad: getTf1Actividad,
  nombre: { etiqueta: "Su nombre o un apodo", placeholder: "Nombre o apodo" },
  aviso: "No hace falta crear una cuenta: puede participar con un apodo. Las respuestas se usan solo para esta capacitación y se proyectan agrupadas.",
};

export const TF1: TfClase = {
  numero: 1,
  slug: TF1_SLUG,
  etiqueta: "PRIMERA CHARLA",
  titulo: TF1_TITULO,
  bajada: ["Primera charla del ciclo", "Duración 120 minutos"],
  expositor: TF_EXPOSITOR,
  tramos: TRAMOS,
  // De las notas de la placa 19: lo que el Dr. Leal encarga para la próxima charla.
  encargo: "Observar una tarea habitual: qué parte admitiría asistencia, qué información debe excluirse y quién valida.",
  slides: SLIDES,
  actividades: ACTIVIDADES,
  config: CONFIG,
};
