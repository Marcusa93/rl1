// ============================================================
// Clase "IA y ejercicio profesional" — Diplomatura en IA, Tecnología
// y Proceso Judicial · Módulo 6 (jueves 01/10/2026, 19 a 21 h, Zoom).
// De lo general a lo particular: qué es la IA → cómo se instruye →
// cómo se descompone el trabajo → analizar, confrontar, documentos
// propios → límites. Público: 100 a 150 personas desde la computadora.
//
// /diplomatura          → app del participante (computadora o celular)
// /diplomatura/clase    → presentación (compartir en Zoom)
// /diplomatura/control  → control remoto desde el celular del docente
// Reusa el motor y las placas de /justicia (lib/clase-vivo.ts).
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";
import type { JusSlide } from "./justicia-clase";
export type { JusPlaca, JusSlide } from "./justicia-clase";

export const DIP_SLUG = "diplomatura";
export const DIP_TITLE = "IA y ejercicio profesional";
export const DIP_SUBTITLE = "De pedirle cosas a diseñar cómo trabajamos con ella";
export const DIP_EVENTO = "Diplomatura en IA, Tecnología y Proceso Judicial · Módulo 6";
export const DIP_FECHA = "Jueves 1 de octubre de 2026";
export const DIP_LINK = "taller.rossi-ia.com/diplomatura";
export const DIP_AUTOR = "Dr. Marco Rossi";
export const DIP_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT";
export const DIP_LOGOS: { src: string; alt: string; fondo: boolean }[] = [];

// --- Actividades en vivo --------------------------------------------------

const SEMAFORO = [
  { id: "si", emoji: "🟢", label: "Sí" },
  { id: "revision", emoji: "🟡", label: "Con revisión" },
  { id: "no", emoji: "🔴", label: "No" },
];

const HIPOTESIS = [
  { id: "a", emoji: "🅰️", label: "A · El despido está justificado" },
  { id: "b", emoji: "🅱️", label: "B · El despido no está justificado" },
  { id: "ns", emoji: "🤷", label: "No tengo suficiente información" },
];

export const DIP_ACTIVIDADES: ActividadVivo[] = [
  {
    key: "dip_encuesta",
    kind: "encuesta",
    titulo: "¿Quiénes estamos hoy?",
    bajada: "Dos preguntas para conocer la sala.",
    preguntas: [
      {
        id: "rol",
        q: "¿Desde dónde trabajás?",
        opciones: [
          { id: "abogacia", emoji: "💼", label: "Ejercicio de la abogacía" },
          { id: "judicial", emoji: "⚖️", label: "Poder Judicial / MPF" },
          { id: "publico", emoji: "🏛️", label: "Administración pública" },
          { id: "docencia", emoji: "🎓", label: "Docencia o estudio" },
          { id: "otro", emoji: "✨", label: "Otro" },
        ],
      },
      {
        id: "ia",
        q: "¿Usás IA en tu trabajo?",
        opciones: [
          { id: "diario", emoji: "🔥", label: "Todos los días" },
          { id: "aveces", emoji: "🙂", label: "A veces" },
          { id: "probe", emoji: "🧪", label: "La probé alguna vez" },
          { id: "nunca", emoji: "🚫", label: "Nunca" },
        ],
      },
    ],
  },
  {
    key: "dip_antes",
    kind: "palabra",
    titulo: "¿Para qué usás hoy IA en tu trabajo?",
    bajada: "Una palabra. Ej.: redactar, resumir, buscar… o «nada».",
  },
  {
    key: "dip_x_alucina",
    kind: "opciones",
    titulo: "Exprés: ¿de dónde sale la respuesta?",
    bajada: "Un chat general, sin búsqueda ni documentos cargados. Le pido un fallo que respalde mi postura. ¿Qué hace?",
    opciones: [
      { id: "busca", emoji: "🔎", label: "Lo busca en una base de fallos" },
      { id: "predice", emoji: "🧠", label: "Genera el texto más probable" },
      { id: "avisa", emoji: "🙋", label: "Me avisa si no lo sabe" },
    ],
    correcta: "predice",
    revela: "Genera. Sin búsqueda ni documentos, arma la respuesta que suena más probable, aunque el fallo no exista.",
  },
  {
    key: "dip_falta",
    kind: "chips",
    titulo: "«Explicame esta sentencia.» ¿Qué le falta?",
    bajada: "Marcá todo lo que le agregarías a esa instrucción.",
    opciones: [
      { id: "objetivo", emoji: "🎯", label: "Para qué lo necesito" },
      { id: "rol", emoji: "👤", label: "Quién soy y para quién es" },
      { id: "material", emoji: "📄", label: "El texto de la sentencia" },
      { id: "criterio", emoji: "🔍", label: "Qué mirar: hechos, prueba, regla…" },
      { id: "formato", emoji: "🧾", label: "Cómo quiero el resultado" },
      { id: "faltantes", emoji: "🚧", label: "Qué hacer si falta información" },
    ],
  },
  {
    key: "dip_audiencia",
    kind: "texto",
    titulo: "Tenés que preparar una audiencia",
    bajada: "Escribí UNA acción concreta que forme parte de esa tarea.",
    placeholder: "Ej.: releer la contestación y marcar los hechos negados",
    maxChars: 120,
  },
  {
    key: "dip_categoria",
    kind: "opciones",
    titulo: "¿Dónde dejarías intervenir más a la IA?",
    bajada: "Pensá en las acciones que escribió el grupo.",
    opciones: [
      { id: "obtener", emoji: "📥", label: "Obtener información" },
      { id: "organizar", emoji: "🗂️", label: "Organizar información" },
      { id: "razonar", emoji: "🧠", label: "Razonar o decidir" },
      { id: "producir", emoji: "✍️", label: "Producir un resultado" },
    ],
  },
  {
    key: "dip_x_delegar",
    kind: "encuesta",
    titulo: "Semáforo: ¿se lo delegarías a una IA?",
    bajada: "Verde, amarillo (con revisión) o rojo.",
    preguntas: [
      { id: "cronologia", q: "Armar la cronología de un expediente", opciones: SEMAFORO },
      { id: "jurisprudencia", q: "Buscar jurisprudencia para un escrito", opciones: SEMAFORO },
      { id: "cliente", q: "Explicarle al cliente su situación en lenguaje claro", opciones: SEMAFORO },
      { id: "estrategia", q: "Decidir la estrategia del caso", opciones: SEMAFORO },
    ],
  },
  {
    key: "dip_hip1",
    kind: "opciones",
    titulo: "Primera votación: ¿qué pensás?",
    bajada: "Antes de escuchar a la IA. Nadie gana: interesa ver si cambiamos.",
    opciones: HIPOTESIS,
  },
  {
    key: "dip_hip2",
    kind: "opciones",
    titulo: "Segunda votación: ¿y ahora?",
    bajada: "La misma pregunta, después de la discusión.",
    opciones: HIPOTESIS,
  },
  {
    key: "dip_nunca",
    kind: "palabra",
    titulo: "«En mi trabajo nunca dejaría que una IA…»",
    bajada: "Completá con una o dos palabras. Ej.: decida, firme, invente…",
  },
  {
    key: "dip_despues",
    kind: "palabra",
    titulo: "¿Para qué usarías mañana IA en tu trabajo?",
    bajada: "Una palabra. Puede ser la misma de antes… o no.",
  },
];

export function getDipActividad(key: string): ActividadVivo | undefined {
  return DIP_ACTIVIDADES.find((a) => a.key === key);
}

export const DIP_CONFIG: ClaseVivoConfig = {
  slug: DIP_SLUG,
  titulo: DIP_TITLE,
  materia: DIP_EVENTO,
  autor: DIP_AUTOR,
  cargo: DIP_CARGO,
  poll: { alumno: 4000, alumnoMe: 20000, deck: 2500 },
  getActividad: getDipActividad,
  reacciones: true,
  nombre: { etiqueta: "Tu nombre (opcional: podés poner un apodo)", placeholder: "Nombre o apodo" },
};

// --- Kit de herramientas (barra inferior del deck) -------------------------

export interface HerramientaKit {
  id: string;
  label: string;
  emoji: string;
  url: string;
}

export const DIP_KIT: HerramientaKit[] = [
  { id: "claude", label: "Claude", emoji: "🟠", url: "https://claude.ai" },
  { id: "chatgpt", label: "ChatGPT", emoji: "🟢", url: "https://chatgpt.com" },
  { id: "gemini", label: "Gemini", emoji: "🔵", url: "https://gemini.google.com" },
  { id: "notebooklm", label: "NotebookLM", emoji: "📓", url: "https://notebooklm.google.com" },
  { id: "pinpoint", label: "Pinpoint", emoji: "📌", url: "https://journaliststudio.google.com/pinpoint" },
  { id: "tareas", label: "Tareas programadas", emoji: "⏰", url: "https://chatgpt.com/tasks" },
];

/** Nombre corto de una placa (índice del control remoto). */
export function tituloPlaca(s: JusSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso";
    case "placa":
      return s.titulo;
    case "actividad":
      return `🗳️ ${getDipActividad(s.activa)?.titulo ?? "Actividad"}`;
    case "simulador":
      return "Simulador";
    case "final":
      return "Gracias";
  }
}

// --- El caso ficticio de "Hacela pelear" -------------------------------------

export const CASO_TEXTO =
  "Laura trabaja hace 6 años como vendedora en una cadena de electrodomésticos. Un domingo publica en su Instagram personal (1.200 seguidores, cuenta abierta): «En esta empresa te exprimen y encima te pagan tarde. Si pueden, compren en otro lado». No nombra a la empresa, pero en su perfil figura dónde trabaja. Un compañero le muestra la publicación al gerente. El martes la empresa la despide con causa por «injuria y pérdida de confianza». Laura no tenía sanciones previas. Caso ficticio.";

// --- Placas del deck --------------------------------------------------------

export const DIP_SLIDES: JusSlide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby" },
  {
    t: "placa",
    titulo: "La puerta de entrada no es el destino",
    bajada: "Si mañana incorporaras IA en serio, ¿qué parte de tu trabajo le darías y qué parte conservarías para vos?",
    lede: "La redacción fue nuestra puerta de entrada a la IA. No necesariamente es su uso más interesante.",
    pills: ["preguntar", "dar contexto", "organizar un entorno", "descomponer", "confrontar", "trabajar con fuentes propias", "poner límites", "controlar"],
    nota: "Preguntá a mano alzada (o en el chat de Zoom) para qué la usan hoy: seguramente gana «redactar». Planteá la pregunta generadora; vuelve al final. Las pills son el recorrido de la clase, de lo general a lo particular.",
  },

  // --- 1 · Qué es lo que estamos usando ------------------------------------
  {
    t: "placa",
    parte: "1 · ¿Qué estamos usando?",
    titulo: "De la IA a la IA generativa",
    bajada: "Un mapa de lo general a lo particular.",
    lede: "Cada círculo está dentro del anterior. ChatGPT, Gemini o Claude viven en el más chico.",
    explora: [
      {
        emoji: "🌐",
        label: "Inteligencia artificial",
        texto: "Sistemas que hacen tareas que asociamos a la inteligencia humana: reconocer, clasificar, predecir, decidir. Existe desde los años 50: el corrector ortográfico, el filtro de spam o el GPS son IA.",
      },
      {
        emoji: "📊",
        label: "Aprendizaje automático",
        texto: "En lugar de programar cada regla, el sistema aprende patrones a partir de muchos ejemplos. Así funciona la recomendación de Netflix o la detección de fraude con tarjetas.",
      },
      {
        emoji: "✨",
        label: "IA generativa",
        texto: "Entrenada con enormes cantidades de información para generar contenido nuevo: texto, imágenes, audio, código. No busca una respuesta guardada: la produce.",
      },
      {
        emoji: "💬",
        label: "Modelos de lenguaje (LLM)",
        texto: "La IA generativa de texto. Calcula, palabra por palabra, qué continuación es más probable según el pedido y el contexto. ChatGPT, Gemini, Claude, Copilot.",
      },
      {
        emoji: "🧰",
        label: "Asistentes y herramientas",
        texto: "La capa que usamos: el chat, más búsqueda web, archivos, memoria, proyectos, agentes. El mismo modelo puede rendir muy distinto según la herramienta y la forma de trabajo.",
      },
    ],
  },
  {
    t: "placa",
    titulo: "Trabajar con lenguaje",
    bajada: "Preguntar, resumir, comparar y generar.",
    diagrama: "verbos",
    kit: true,
    explora: [
      {
        emoji: "❓",
        label: "Preguntar",
        texto: "Consultar un documento en lenguaje natural, sin buscar palabra por palabra.",
        ejemplo: {
          pedido: "Según el acta de audiencia adjunta, ¿cuándo fue notificada la parte demandada?",
          respuesta: "El 14/02/2026, según el acta de audiencia preliminar (página 2).",
        },
      },
      {
        emoji: "📝",
        label: "Resumir",
        texto: "Reducir un texto largo a lo esencial, con una estructura que vos definís.",
        ejemplo: {
          pedido: "Resumí esta sentencia en cinco líneas: hechos, pretensión, decisión y fundamento principal.",
          respuesta: "Hechos: despido sin causa en 2025. · Pretensión: indemnización. · Decisión: se admite parcialmente. · Fundamento: no se probaron las horas extra.",
        },
      },
      {
        emoji: "🔀",
        label: "Comparar",
        texto: "Detectar diferencias entre versiones, relatos o documentos.",
        ejemplo: {
          pedido: "Compará estas dos versiones del contrato y listá qué cambió.",
          respuesta: "Cláusula 4: el plazo de pago pasó de 30 a 10 días. · Cláusula 7: se agregó una penalidad por mora.",
        },
      },
      {
        emoji: "✍️",
        label: "Generar",
        texto: "Producir un primer borrador que la persona revisa y corrige.",
        ejemplo: {
          pedido: "Redactá un borrador de oficio al Registro solicitando informe de dominio del inmueble, en lenguaje claro.",
          respuesta: "«Solicitamos que informe quién figura como titular del inmueble inscripto bajo la matrícula indicada…» — revisar los datos antes de firmar.",
        },
      },
    ],
  },
  { t: "actividad", activa: "dip_x_alucina", escena: "Exprés · un clic" },
  {
    t: "placa",
    titulo: "No piensa como vos",
    bajada: "Generar lenguaje convincente no equivale a conocer la verdad.",
    diagrama: "alucinacion",
    kit: true,
    explora: [
      {
        emoji: "📰",
        label: "Mata v. Avianca (2023)",
        texto: "Un escrito citó seis precedentes con nombres, fechas y citas verosímiles. Ninguno existía. Los abogados los habían obtenido de ChatGPT sin verificarlos, y el tribunal los sancionó.",
      },
      {
        emoji: "⚙️",
        label: "Por qué ocurre",
        texto: "El modelo calcula el texto más probable; no consulta una base de fallos. Lo mismo que lo hace flexible lo hace capaz de afirmar con seguridad algo falso.",
      },
      {
        emoji: "💭",
        label: "Dicho, inferido, propuesto",
        texto: "Distinguí lo que surge de un documento, lo que el modelo infiere y lo que propone. Solo lo primero es un dato; lo demás hay que confirmarlo.",
      },
      {
        emoji: "⚖️",
        label: "Sesgos",
        texto: "Aprende de lo que ve: si los datos del pasado discriminan, la herramienta repite la discriminación (COMPAS, Amazon). Y nosotros tendemos a creerle a la máquina: sesgo de automatización.",
      },
    ],
  },

  // --- 2 · Cómo se le habla -------------------------------------------------
  { t: "actividad", activa: "dip_falta", escena: "2 · Una instrucción pobre", parte: "2 · Cómo se le habla" },
  {
    t: "placa",
    titulo: "No hay palabras mágicas",
    bajada: "Un prompt es una especificación de trabajo: Contexto, Objetivo, Tareas, Input y Output.",
    interactivo: "cotio",
    kit: true,
    nota: "Ordená lo que votó la sala en las cinco piezas. Después, en vivo: «Explicame esta sentencia» vs. «Analizá esta sentencia para identificar hechos relevantes, cuestión jurídica, posición de cada parte, prueba considerada, regla aplicada y fundamento. Separá lo que surge del texto de cualquier inferencia. Si falta información, indicá qué dato no está disponible.» Idea: un buen prompt no reemplaza el conocimiento profesional; lo hace operativo.",
  },
  {
    t: "placa",
    titulo: "Sin contexto, adivina",
    bajada: "Un profesional que entra a una causa sin expediente no puede trabajar bien. Una IA tampoco.",
    diagrama: "contexto",
    kit: true,
    lede: "Más contexto no siempre es mejor: tiene que ser pertinente, ordenado y que puedas cargarlo legítimamente.",
    explora: [
      { emoji: "🎯", label: "La tarea y quién la hace", texto: "Qué hay que hacer, quién lo hace (abogada de la actora, relator, juez) y para quién es el resultado." },
      { emoji: "🗂️", label: "Fuentes", texto: "Qué documentos existen, cuáles usar y cuáles no. Con fuentes definidas, cada dato se puede verificar." },
      { emoji: "🚧", label: "Restricciones y antecedentes", texto: "Qué no puede hacer, qué se hizo antes, qué criterio sigue la oficina o el estudio." },
      {
        emoji: "✅",
        label: "Un pedido completo",
        texto: "Fuentes, tarea, formato y qué hacer con lo que falta, en un solo pedido.",
        ejemplo: {
          pedido: "Con base solo en los documentos adjuntos, armá una cronología en una tabla (fecha, hecho, documento). Si falta un dato, indicalo; no lo completes.",
          respuesta: "03/03 · firma del contrato · D1 | 28/03 · entrega de 10 cajas · D3 | Falta: acta de conformidad.",
        },
      },
    ],
  },
  {
    t: "placa",
    titulo: "Una charla no es un sistema",
    bajada: "Consulta aislada, conversación y entorno persistente.",
    lede: "Cuanto más subís de nivel, menos reconstruís el contexto cada vez… y más importa revisar qué quedó guardado.",
    kit: true,
    explora: [
      { emoji: "1️⃣", label: "Consulta aislada", texto: "Una pregunta, una respuesta. Sirve para lo puntual, pero cada vez hay que explicar todo de nuevo." },
      { emoji: "2️⃣", label: "Conversación", texto: "La herramienta conserva el hilo de ese intercambio y se apoya en lo trabajado antes, dentro de esa conversación." },
      { emoji: "3️⃣", label: "Entorno persistente", texto: "Un proyecto, un GPT o un Gem reúne instrucciones, archivos, antecedentes y criterios que se reutilizan en distintas sesiones." },
      { emoji: "⚠️", label: "La memoria no es neutra", texto: "No es perfecta ni completa, y lo que guarda puede ser sensible. Es una capa más que hay que revisar." },
    ],
  },
  {
    t: "placa",
    titulo: "Memoria persistente",
    bajada: "¿Qué tendría sentido que recordara… y qué no querrías que guardara nunca?",
    diagrama: "memoria",
    kit: true,
    capturas: ["memoria"],
    explora: [
      { emoji: "🧠", label: "Qué recuerda", texto: "Lo que le contás o le pedís guardar: tu función, tu estilo, tus formatos habituales." },
      { emoji: "🗑️", label: "Cómo se controla", texto: "Se puede ver, editar y borrar desde la configuración, o desactivar. Conviene revisarla cada tanto." },
      { emoji: "🔐", label: "Secreto profesional", texto: "No dejar datos de clientes, causas ni personas en la memoria de herramientas externas. Lo estable sí; lo sensible, no." },
    ],
  },
  {
    t: "placa",
    titulo: "Proyectos y skills",
    bajada: "Dónde se trabaja un asunto y cómo se hace una tarea.",
    diagrama: "proyectos",
    kit: true,
    capturas: ["proyecto", "skill"],
    explora: [
      {
        emoji: "📁",
        label: "Proyecto",
        texto: "Un espacio para un asunto o una materia: instrucciones propias, documentos y conversaciones juntas. Existe en Claude y en ChatGPT; en Gemini se parece a un Gem.",
      },
      {
        emoji: "⚙️",
        label: "Dónde vive el prompt de sistema",
        texto: "En Claude, en las instrucciones de un proyecto; en ChatGPT, en un GPT o en las instrucciones personalizadas; en Gemini, en un Gem. Se escribe una vez.",
      },
      {
        emoji: "🧩",
        label: "Skill",
        texto: "Un procedimiento empaquetado (pasos, plantillas, criterios) que la herramienta usa cuando la tarea lo requiere, en cualquier asunto.",
      },
      { emoji: "🤔", label: "¿Cuál uso?", texto: "Proyecto para el contexto de un caso; skill para una forma de trabajar que se repite en muchos casos." },
    ],
  },
  {
    t: "placa",
    titulo: "Tareas programadas y agentes",
    bajada: "La herramienta ya no solo responde: también trabaja sola.",
    diagrama: "tareas",
    kit: true,
    capturas: ["tarea"],
    explora: [
      { emoji: "⏰", label: "Tarea programada", texto: "Una consulta que se ejecuta sola a una hora fija: «cada lunes, resumir las novedades normativas sobre consumo»." },
      { emoji: "🤖", label: "Agente", texto: "Encadena pasos para cumplir un objetivo: buscar, leer, resumir y enviar, sin que alguien intervenga entre paso y paso." },
      { emoji: "✋", label: "El límite", texto: "Cuanto más actúa sola, más importa definir qué puede hacer, revisar lo que hizo y poder detenerla." },
    ],
  },
  {
    t: "placa",
    titulo: "Veámoslo en vivo",
    bajada: "Las mismas ideas, en herramientas que ya existen.",
    herramientas: ["claude", "chatgpt", "gemini", "notebooklm"],
    nota: "Mostrá un proyecto (instrucciones + archivos), la memoria y un Gem. No más de 5 minutos.",
  },

  // --- 3 · Desarmá el trabajo ------------------------------------------------
  {
    t: "placa",
    parte: "3 · Desarmá el trabajo",
    titulo: "«Contestar una demanda» no es una tarea",
    bajada: "Es un sistema de tareas. No automatizamos profesiones: intervenimos tareas.",
    pills: [
      "leer",
      "identificar hechos",
      "reconstruir la cronología",
      "separar admitidos y controvertidos",
      "detectar pretensiones",
      "identificar normativa",
      "localizar prueba",
      "evaluar faltantes",
      "buscar precedentes",
      "construir hipótesis",
      "anticipar argumentos contrarios",
      "diseñar la estrategia",
      "redactar",
      "controlar citas",
      "revisar",
    ],
    explora: [
      { emoji: "📥", label: "Obtener información", texto: "Leer, localizar prueba, buscar normativa y precedentes. La IA ayuda mucho… si después verificás la fuente." },
      { emoji: "🗂️", label: "Organizar información", texto: "Cronología, hechos admitidos y controvertidos, faltantes. Es donde más rinde y donde el error es más fácil de detectar." },
      { emoji: "🧠", label: "Razonar o decidir", texto: "Hipótesis, argumentos contrarios, estrategia. La IA puede discutir con vos; la decisión es tuya." },
      { emoji: "✍️", label: "Producir un resultado", texto: "Redactar y controlar citas. El borrador puede ser de la IA; la firma y la responsabilidad, no." },
    ],
    nota: "Lo mismo vale para «resolver un expediente». Después de la actividad, agrupá en voz alta lo que escribieron en las 4 categorías y preguntá dónde dejarían intervenir más a la IA. Concepto de llegada: antes de automatizar, hay que entender el trabajo.",
  },
  { t: "actividad", activa: "dip_audiencia", escena: "Armemos el mapa entre todos" },

  // --- 4 · Analizar antes que redactar -----------------------------------------
  {
    t: "placa",
    parte: "4 · Analizar antes que redactar",
    titulo: "Antes de redactar, entendé",
    bajada: "No le pedimos que piense por nosotros: le pedimos que vuelva visible la arquitectura del problema.",
    kit: true,
    lede: "En lugar de «resumime esta norma», trabajá por capas. Tocá cada una para ver el pedido.",
    explora: [
      { emoji: "🏗️", label: "Estructura", texto: "Cómo está organizada la norma o la sentencia.", ejemplo: { pedido: "Describí la estructura de este documento: partes, artículos o considerandos, y qué función cumple cada uno.", respuesta: "Título I (definiciones, arts. 1-3) · Título II (obligaciones, arts. 4-12) · Título III (sanciones)…" } },
      { emoji: "👥", label: "Sujetos y obligaciones", texto: "A quién alcanza y qué tiene que hacer cada uno.", ejemplo: { pedido: "Identificá los sujetos alcanzados y, para cada uno, sus obligaciones, citando el artículo.", respuesta: "Proveedor: informar el precio total (art. 4) · Usuario: …" } },
      { emoji: "🔀", label: "Condiciones y excepciones", texto: "Cuándo se aplica y cuándo no.", ejemplo: { pedido: "Listá las condiciones de aplicación y las excepciones, con su artículo. No agregues nada que no esté en el texto.", respuesta: "Se aplica si… (art. 2) · No se aplica a… (art. 3, inc. b)" } },
      { emoji: "⚡", label: "Consecuencias", texto: "Qué pasa si se cumple o se incumple.", ejemplo: { pedido: "¿Qué consecuencias prevé el texto para cada incumplimiento? Distinguí las expresas de las que infieras.", respuesta: "Expresa: multa (art. 15) · Inferida: posible nulidad de la cláusula — verificar." } },
      { emoji: "❗", label: "Conflictos interpretativos", texto: "Dónde el texto admite más de una lectura.", ejemplo: { pedido: "Señalá los términos ambiguos o los puntos que admiten interpretaciones distintas, y explicá cada lectura posible.", respuesta: "«Plazo razonable» (art. 7): no se define; podría leerse como… o como…" } },
      { emoji: "📋", label: "Y al final, una matriz", texto: "Todo lo anterior en una tabla analizable.", ejemplo: { pedido: "Armá una matriz con columnas: sujeto, obligación, condición, excepción, consecuencia, artículo.", respuesta: "| Proveedor | Informar precio | Venta a distancia | — | Multa | Art. 4 |" } },
    ],
    nota: "Demo en vivo: cargá una norma o resolución breve en Claude/ChatGPT y pedí las capas en orden, terminando en la matriz.",
  },

  // --- 5 · Hacela pelear ---------------------------------------------------------
  {
    t: "placa",
    parte: "5 · Hacela pelear",
    titulo: "El caso de Laura",
    bajada: "Despedida con causa por una publicación en su Instagram personal.",
    lede: CASO_TEXTO,
    pills: ["6 años de antigüedad", "sin sanciones previas", "cuenta personal y abierta", "no nombra a la empresa", "despido con causa"],
    nota: "Leé el caso en voz alta. Aclarar que es ficticio. Pasá a la votación: A (justificado) / B (no justificado) / no tengo información.",
  },
  { t: "actividad", activa: "dip_hip1", escena: "Antes de la discusión" },
  {
    t: "placa",
    titulo: "No le pidas una respuesta: hacela discutir",
    bajada: "Cuatro rondas en el mismo chat. Tocá cada una para ver el pedido.",
    kit: true,
    lede: "IA que confirma → IA que confronta. Una hipótesis mejora cuando encuentra resistencia.",
    explora: [
      {
        emoji: "🅰️",
        label: "Ronda 1 · La mejor defensa de A",
        texto: "Pedile el mejor argumento posible para la empresa.",
        ejemplo: {
          pedido: "Te paso un caso ficticio. Actuá como abogado de la empresa y construí la mejor argumentación posible para sostener que el despido con causa está justificado. Separá hechos del caso, normas aplicables e inferencias. [pegar el caso]",
          respuesta: "Injuria al empleador, deber de fidelidad (art. 85 LCT), daño a la imagen comercial, publicidad del perfil…",
        },
      },
      {
        emoji: "🅱️",
        label: "Ronda 2 · Que ataque a A",
        texto: "Ahora, del otro lado.",
        ejemplo: {
          pedido: "Ahora actuá como abogado de Laura y atacá esa argumentación punto por punto. Señalá sus debilidades fácticas y jurídicas.",
          respuesta: "Proporcionalidad (art. 242 LCT), falta de sanción previa, libertad de expresión, no nombra a la empresa…",
        },
      },
      {
        emoji: "⚖️",
        label: "Ronda 3 · Qué decidiría el caso",
        texto: "Del debate a la prueba.",
        ejemplo: {
          pedido: "Identificá qué hechos o pruebas permitirían decidir entre ambas posiciones. Para cada uno, a quién favorece y cómo se acreditaría.",
          respuesta: "¿Hubo atrasos salariales reales? ¿Cuántos clientes vieron la publicación? ¿Hay daño acreditado? ¿La empresa intimó antes?…",
        },
      },
      {
        emoji: "❓",
        label: "Ronda 4 · La pregunta que falta",
        texto: "La más valiosa.",
        ejemplo: {
          pedido: "¿Qué pregunta relevante todavía no formulamos sobre este caso?",
          respuesta: "¿Qué dice el reglamento interno sobre redes sociales? ¿Laura borró la publicación? ¿Hubo otros casos tratados distinto?",
        },
      },
    ],
    nota: "Hacé las 4 rondas EN VIVO en Claude o ChatGPT (los pedidos están en cada tarjeta). Las referencias normativas de la IA hay que verificarlas: aprovechá para decirlo. Después, segunda votación.",
  },
  { t: "actividad", activa: "dip_hip2", escena: "Después de la discusión" },
  {
    t: "placa",
    titulo: "El argumento que todavía no viste",
    bajada: "Una IA es más útil cuando te ayuda a encontrar la objeción que cuando confirma lo que ya pensabas.",
    lede: "No interesa quién ganó. Interesa si escuchar al otro lado movió algo.",
    explora: [
      { emoji: "🪞", label: "El riesgo de la complacencia", texto: "Los modelos tienden a darte la razón. Si preguntás «¿no es cierto que…?», te van a decir que sí. Pedí explícitamente el contraargumento." },
      { emoji: "🎭", label: "Roles", texto: "Abogado contrario, juez escéptico, perito de la otra parte, cliente que no entiende: cada rol muestra un flanco distinto." },
      { emoji: "🧭", label: "Para qué sirve", texto: "Preparar una audiencia, anticipar una contestación, testear un recurso, revisar un proyecto de sentencia antes de firmarlo." },
    ],
    nota: "Volvé a la votación anterior (←) si querés comparar. Comentá cuánto se movió el «no tengo suficiente información».",
  },

  // --- 6 · Tus documentos ---------------------------------------------------------
  {
    t: "placa",
    parte: "6 · Tus propios documentos",
    titulo: "Tus PDF todavía no son conocimiento",
    bajada: "Guardar información no significa poder interrogarla.",
    diagrama: "rag",
    kit: true,
    explora: [
      { emoji: "📥", label: "Incorporar", texto: "Cargás tus fuentes: sentencias, dictámenes, escritos, reglamentos, acordadas." },
      { emoji: "🧩", label: "Organizar", texto: "La herramienta las divide en fragmentos y las indexa por su significado." },
      { emoji: "🎯", label: "Recuperar", texto: "Ante cada pregunta, busca los fragmentos más relevantes." },
      {
        emoji: "📌",
        label: "Responder con fuente",
        texto: "Responde con esos fragmentos y señala de dónde salió cada dato. Si no está en tus documentos, debería decirlo. Así trabaja NotebookLM.",
      },
      { emoji: "🧠", label: "No es reentrenar", texto: "El modelo no aprende tus documentos: los consulta en el momento. Modelo general = patrones; corpus delimitado = las fuentes que vos elegiste." },
    ],
  },
  {
    t: "placa",
    titulo: "¿Dónde dice eso?",
    bajada: "Una cita sugerida por una IA no existe jurídicamente hasta que fue verificada en la fuente.",
    herramientas: ["notebooklm", "pinpoint"],
    explora: [
      { emoji: "🔎", label: "Criterios", texto: "«¿Qué criterios aparecen en estos fallos respecto de la carga de la prueba?»" },
      { emoji: "📑", label: "Requisitos", texto: "«¿En qué documentos se exige la intimación previa?»" },
      { emoji: "🔀", label: "Diferencias", texto: "«¿Qué decisiones usan argumentos distintos para el mismo problema?»" },
      { emoji: "📌", label: "La fuente", texto: "«¿Qué fuente respalda esta afirmación? ¿Dónde aparece exactamente?» — y abrís el documento." },
    ],
    nota: "Demo en NotebookLM con 3 o 4 fallos: preguntá y hacé clic en la cita numerada para ver el fragmento. Esto no elimina errores, pero cambia el entorno de control.",
  },

  // --- 7 · Atate antes --------------------------------------------------------------
  {
    t: "placa",
    parte: "7 · Poner límites",
    titulo: "Atate antes",
    bajada: "Ulises no decidió resistir a las sirenas mientras las escuchaba: se hizo atar antes.",
    lede: "Hasta ahora aprendimos a pedirle que haga más cosas. Ahora, a impedirle algunas. Los límites se diseñan antes de necesitarlos.",
    kit: true,
    explora: [
      { emoji: "🚫", label: "No inventes", texto: "«No inventes jurisprudencia ni doctrina. Si no tenés una fuente, decilo.»" },
      { emoji: "📚", label: "Solo mis fuentes", texto: "«Trabajá solamente con los documentos proporcionados. Si no hay respaldo documental, indicalo.»" },
      { emoji: "🏷️", label: "Separá", texto: "«Diferenciá hechos, inferencias y opiniones. Marcá las afirmaciones que requieren verificación.»" },
      { emoji: "🕳️", label: "No completes", texto: "«No completes información faltante: listá qué datos faltan.»" },
      { emoji: "⚖️", label: "No decidas", texto: "«No adoptes una decisión jurídica final: presentá opciones con sus riesgos.»" },
      {
        emoji: "📁",
        label: "Todo junto, en un proyecto",
        texto: "Estas reglas van una sola vez en las instrucciones del proyecto, GPT o Gem. Así se aplican siempre.",
        ejemplo: {
          pedido: "Sos asistente de un estudio jurídico. Trabajá solo con los documentos cargados. No inventes citas. Separá hechos, inferencias y opiniones. Si falta información, decilo. No tomes decisiones finales. Marcá todo lo que deba verificarse.",
          respuesta: "Entendido. Voy a trabajar solo con las fuentes cargadas y a señalar lo que requiera verificación.",
        },
      },
    ],
  },
  {
    t: "placa",
    titulo: "Que pueda no significa que deba",
    bajada: "Capacidad técnica y decisión profesional son preguntas distintas.",
    lede: "El Poder Judicial de Tucumán ya empezó a fijar reglas institucionales para el uso de IA: cuando una organización la incorpora, deja de ser solo una decisión individual.",
    explora: [
      { emoji: "👤", label: "¿Datos personales?", texto: "¿Estoy cargando datos personales o información sensible? ¿Puedo anonimizar antes?" },
      { emoji: "🤐", label: "¿Secreto profesional?", texto: "¿Estoy habilitado para cargar estos documentos? ¿Qué diría mi cliente?" },
      { emoji: "💾", label: "¿Qué guarda la herramienta?", texto: "¿Almacena la información? ¿La usa para entrenar? ¿Necesito una herramienta institucional o un entorno controlado?" },
      { emoji: "🔍", label: "¿Quién verifica?", texto: "Cada cita, cada dato, cada fecha: alguien con nombre y apellido." },
      { emoji: "✍️", label: "¿Quién decide?", texto: "La IA asiste; no firma. La responsabilidad profesional sigue siendo tuya." },
    ],
  },

  // --- Cierre -------------------------------------------------------------------------
  {
    t: "placa",
    parte: "Cierre",
    titulo: "Mañana",
    bajada: "Analizar. Descomponer. Confrontar. Construir. Autorrestringir.",
    lede: "Cinco operaciones profesionales, no cinco herramientas.",
    explora: [
      { emoji: "🔬", label: "Analizar", texto: "Interrogar una norma, sentencia o documento para volver visible su estructura." },
      { emoji: "🧩", label: "Descomponer", texto: "Separar una tarea compleja en operaciones más pequeñas antes de decidir dónde entra la IA." },
      { emoji: "🥊", label: "Confrontar", texto: "Usar la herramienta para construir la mejor objeción posible contra tu propia hipótesis." },
      { emoji: "📚", label: "Construir conocimiento", texto: "Transformar archivos dispersos en un corpus consultable y verificable." },
      { emoji: "⛓️", label: "Autorrestringir", texto: "Diseñar antes los límites, las fuentes, los criterios y la revisión." },
    ],
    nota: "«Hace dos horas les pregunté para qué usaban IA: redactar, resumir, buscar. Todo sigue valiendo. Pero ahora la pregunta es qué lugar queremos darle en nuestro trabajo.»",
  },
  {
    t: "placa",
    titulo: "Delegar, controlar, decidir",
    bajada: "Trabajar con IA no es delegar cada vez más: es diseñar cada vez mejor qué delegamos, qué controlamos y qué decidimos nosotros.",
    lede: "¿Qué parte de tu trabajo querés transformar… y qué parte no estás dispuesto a entregar?",
  },
  { t: "final" },
];
