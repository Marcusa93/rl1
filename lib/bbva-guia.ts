// Contenido de la guía descargable del Laboratorio de IA · BBVA (clase inicial, 25/09/2026).
// Dos partes: lo que trabajó Sebastián Chumbita (síntesis de la transcripción de su
// intervención) y lo que trabajó Marco Rossi (las placas y actividades de /bbva/clase).
// Lo usa components/bbva/guia-pdf.tsx, que agrega la tarjeta personal de cada participante.

export interface Idea {
  titulo: string;
  texto: string;
  puntos?: string[];
}

export interface ParteGuia {
  docente: string;
  pregunta: string;
  ideas: Idea[];
}

export const GUIA_TITULO = "Laboratorio de IA · Clase inicial";
export const GUIA_SUBTITULO = "Del prompt al proceso: cómo trabajar con la IA y dónde tiene sentido usarla";

export const GUIA_CHUMBITA: ParteGuia = {
  docente: "Sebastián Chumbita",
  pregunta: "¿Cómo hablar y trabajar con la IA?",
  ideas: [
    {
      titulo: "Aprender la lógica, no los botones",
      texto:
        "Los entornos, las pantallas y los nombres de las funciones van a seguir cambiando. Lo que queda es la lógica de la interacción: cómo le pido algo a la IA, con qué contexto y para qué. La tendencia es ir hacia un único agente conversacional al que le pedimos algo y lo resuelve con cada vez más autonomía.",
    },
    {
      titulo: "Tres tipos de tarea, tres formas de trabajar",
      texto: "Antes de elegir herramienta, identificá qué tipo de tarea tenés entre manos.",
      puntos: [
        "Tareas únicas: aparecen hoy y no se repiten (una opinión, una búsqueda puntual). Van en el chat general, donde la atención del modelo es más amplia.",
        "Tareas habituales: mecánicas, repetitivas y estandarizables. Van en una ventana dedicada (un GPT, una Gema, un complemento) con instrucciones previas y skills, para que la atención sea focalizada y el resultado consistente.",
        "Tareas prolongadas: necesitan contexto y persistencia (el seguimiento de un informe, un proyecto, un cliente). Combinan system prompt, skills y una base de conocimiento, en un proyecto o cuaderno separado del chat general.",
      ],
    },
    {
      titulo: "Mismo proceso, distinto propósito",
      texto:
        "Buscar pasajes para un viaje y buscar la última circular del Banco Central siguen el mismo procedimiento de búsqueda; lo que cambia es el objetivo. No hay que confundir el propósito de una interacción con la forma de ejecutarla.",
    },
    {
      titulo: "Skills: habilidades que la herramienta aprende",
      texto:
        "Son instrucciones que ajustan un comportamiento para que sea consistente y perdurable (por ejemplo: cada vez que me des un resultado web, poné el link). Se activan a mano o solas cuando el contexto las pide, así que hay que cuidar cuándo sí y cuándo no deben activarse. Ahorran consumo de tokens.",
      puntos: [
        "Se pueden escribir con un prompt, importar, pedirle a la IA que las desarrolle con tus instrucciones o grabar la pantalla mientras hacés la tarea para que la IA detecte el procedimiento.",
        "Los GPT personalizados migran a complementos y las Gemas tienden a transformarse en skills: todo va hacia más autonomía (auto manual → automático → no tripulado).",
      ],
    },
    {
      titulo: "Un buen system prompt no es una línea",
      texto:
        "“Hacés informes mensuales de crédito bancario” es demasiado precario para lograr precisión. Un asistente necesita instrucciones robustas.",
      puntos: [
        "¿Qué hace? ¿Para qué lo hace?",
        "¿Cuál es el formato de respuesta?",
        "¿Cuáles son sus instrucciones y qué es lo que NO tiene que hacer?",
        "¿Cuál es su base de conocimiento? (ej.: “para el informe deudor usá el modelo deudor1.pdf”)",
        "El esfuerzo se invierte una vez al armarlo; después cada uso pide muy poco: se invierte la pirámide.",
      ],
    },
    {
      titulo: "Gobernanza de datos",
      texto:
        "Los documentos se preparan antes de cargarlos a la base de conocimiento: no sirve subir un manual de 300 páginas si el modelo que necesito está en la página 1. En esa eficiencia está la eficacia.",
    },
    {
      titulo: "Datos, permisos y conectores",
      texto:
        "La IA siempre necesitó datos: cuantos menos tenga, menos precisa será. Conectarla a Drive, al correo o a otras bases amplía lo que puede hacer, pero abre la pregunta por la información sensible y los permisos. Gemini integra de fábrica el entorno de Google (NotebookLM se actualiza solo con Drive); en ChatGPT se logra con conectores.",
    },
    {
      titulo: "Para el laboratorio",
      texto:
        "Identificá cómo hacés hoy la tarea y la secuencia lógica de pasos que seguís (entro a una página, verifico un dato, lo extraigo, armo el informe). Esa secuencia es la que después la IA va a replicar, y el grado de detalle define cuánto hay que corregir. Lo que buscamos: datos reales, concretos y precisos, sin alucinaciones.",
    },
  ],
};

export const GUIA_MARCO: ParteGuia = {
  docente: "Marco Rossi",
  pregunta: "¿En qué parte de mi trabajo tiene sentido usarla?",
  ideas: [
    {
      titulo: "Antes del prompt está el proceso",
      texto:
        "Se puede escribir un gran prompt y no saber dónde la IA mejora de verdad el trabajo. La primera pregunta no es “¿qué puedo hacer con IA?” sino “¿cómo hago hoy mi trabajo?” y, recién después, “¿qué parte podría hacerse de otra manera?”.",
    },
    {
      titulo: "Tu cargo no me sirve: decime qué hacés",
      texto:
        "Puestos distintos comparten operaciones parecidas: leer, buscar, comparar, clasificar, extraer, detectar diferencias, resumir, redactar, verificar, priorizar, derivar, registrar, evaluar, preparar y tomar decisiones. La IA rara vez reemplaza un puesto: interviene en operaciones dentro de procesos.",
    },
    {
      titulo: "Poder ≠ convenir",
      texto: "Que la IA pueda hacerlo no significa que convenga delegarlo. Preguntas para pensar:",
      puntos: [
        "¿Ocurre con frecuencia? ¿Consume tiempo significativo?",
        "¿Hay información disponible y patrones identificables?",
        "¿El resultado se puede verificar?",
        "¿Qué pasa si se equivoca? ¿El error es reversible?",
        "¿Hay una decisión que debe conservar una persona? ¿Información sensible?",
        "¿Hay que explicar por qué se llegó al resultado?",
      ],
    },
    {
      titulo: "No es humano o máquina",
      texto:
        "Entre hacerlo todo a mano y delegarlo todo hay muchos grados: la IA puede asistir, preparar, proponer o ejecutar; detenerse ante una excepción, pedir aprobación o actuar sola dentro de ciertos límites. Human in the loop es una decisión de diseño: automatizar no es eliminar a la persona, es cambiar lo que hace (de recopilar a verificar, de redactar a revisar, de clasificar todo a atender las excepciones).",
    },
    {
      titulo: "De la tarea al proceso",
      texto: "“Responder un reclamo” no es una tarea: es un proceso. La IA puede intervenir en algunos pasos sin intervenir en todos.",
      puntos: ["Recibir → identificar → buscar → comparar → decidir → responder → registrar"],
    },
    {
      titulo: "La anatomía de un proceso",
      texto: "Una herramienta mental para cualquier trabajo:",
      puntos: [
        "Entrada: ¿qué recibo?",
        "Operaciones: ¿qué hago con eso?",
        "Decisiones: ¿dónde necesito criterio? ¿Qué excepciones hay?",
        "Salida: ¿qué produzco?",
        "Destino: ¿quién usa ese resultado?",
      ],
    },
    {
      titulo: "Una necesidad, tres formas",
      texto: "La diferencia no es solo tecnológica: es el grado de autonomía que le damos al sistema.",
      puntos: [
        "Chatbot: persona → pregunta → IA → respuesta. La persona inicia.",
        "Automatización: evento → reglas → acciones. Un flujo diseñado de antemano.",
        "Agente: objetivo → acciones y herramientas → resultado. Decide qué pasos dar.",
      ],
    },
    {
      titulo: "No necesitás un agente: necesitás resolver un problema",
      texto:
        "Algunos problemas se resuelven con un buen prompt; otros con un asistente especializado, una automatización sencilla o integrando herramientas; y solo algunos justifican un agente. La sofisticación no es el objetivo: el criterio de éxito es resolver mejor el problema.",
    },
  ],
};

/** "Desarmá tu trabajo" (placa 19). */
export const GUIA_DESARMA = [
  "¿Qué lo dispara?",
  "¿Qué información entra?",
  "¿Qué hacés?",
  "¿Dónde decidís?",
  "¿Qué sale?",
  "¿Dónde podría intervenir la IA?",
  "¿Dónde necesitás seguir vos?",
];

export const GUIA_PROXIMO =
  "Para el próximo encuentro: elegí un caso real de tu candidato. Hoy sabés QUÉ querés intervenir; todavía no CÓMO. En la clase de construcción lo vamos a convertir en un asistente especializado (instrucciones persistentes, contexto, base de conocimiento).";
