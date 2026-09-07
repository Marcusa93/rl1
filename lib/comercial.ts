// ============================================================
// Clase "Empresas e IA" (/empresas) — Derecho Comercial, UNT.
// Clase de grado EN VIVO dirigida por el docente: mismo motor de sesión
// que la Clase 1, pero con contenido propio y dimensionada para ~200
// alumnos. Diferencia clave de diseño: el alumno responde desde el
// celular y los resultados se ven en el PROYECTOR (/empresas/pantalla),
// no en cada teléfono — así cada celular consulta un solo endpoint.
// ============================================================

export const COM_SLUG = "empresas";
export const COM_TITLE = "Empresas e IA";
export const COM_SUBTITLE = "Transformación digital, trabajo y riesgos";
export const COM_MATERIA = "Derecho Comercial · Facultad de Derecho y Cs. Sociales, UNT";

export const COM_AUTOR = "Dr. Marco Rossi";
export const COM_AUTOR_CARGO = "Director del Laboratorio de IA de la Facultad de Derecho";
export const COM_INSTAGRAM_URL = "https://www.instagram.com/marquitorossi";
export const COM_QR_SRC = "/empresas/qr-instagram.png";
/** QR que apunta a https://rl1-beige.vercel.app/empresas (ingreso de alumnos). */
export const COM_QR_PLATAFORMA = "/empresas/qr-plataforma.png";

/**
 * Intervalos de polling (ms) pensados para un aula grande.
 * Con ~200 celulares, el alumno consulta la sesión cada 5 s y NADA más;
 * los agregados los piden solo el docente y el proyector (2 clientes).
 */
export const COM_POLL = {
  alumno: 5000,
  alumnoMe: 20000,
  docente: 2500,
  pantalla: 2500,
} as const;

// --- Actividades y agenda ------------------------------------------------

export type ComActivity =
  | "lobby"
  | "emp_encuesta"
  | "emp_usos"
  | "emp_b1"
  | "emp_b2"
  | "emp_b3"
  | "emp_b4"
  | "emp_b5"
  | "emp_cierre";

export interface ComAgendaStep {
  key: ComActivity;
  label: string;
  short: string;
  desc: string;
}

export const COM_AGENDA: ComAgendaStep[] = [
  {
    key: "lobby",
    label: "Sala de espera",
    short: "Ingreso",
    desc: "Los alumnos entran con su nombre desde el celular y esperan el inicio.",
  },
  {
    key: "emp_encuesta",
    label: "Encuesta relámpago",
    short: "Encuesta",
    desc: "Cuatro preguntas rápidas para leer al curso: cuánto usan IA, si trabajaron en una empresa y qué les preocupa.",
  },
  {
    key: "emp_usos",
    label: "¿Dónde ya está la IA en una empresa?",
    short: "Usos",
    desc: "Tarjetas de usos reales (atención al cliente, scoring, pricing, selección de personal…). Mapa del curso en vivo.",
  },
  {
    key: "emp_b1",
    label: "Bloque 1 · Quiero incorporar IA a mi empresa",
    short: "Bloque 1",
    desc: "Qué es la IA (inputs → modelo → outputs) y la primera pregunta profesional: qué actividad se quiere delegar.",
  },
  {
    key: "emp_b2",
    label: "Bloque 2 · Encontré una herramienta y quiero contratarla",
    short: "Bloque 2",
    desc: "Qué se está contratando realmente y qué mirar antes de firmar: datos, confidencialidad, resultados, responsabilidad.",
  },
  {
    key: "emp_b3",
    label: "Bloque 3 · Quiero que mis empleados usen IA",
    short: "Bloque 3",
    desc: "El riesgo puertas adentro: qué información se puede cargar, dónde y bajo qué política interna.",
  },
  {
    key: "emp_b4",
    label: "Bloque 4 · Generamos esto con IA y queremos venderlo",
    short: "Bloque 4",
    desc: "Usar, tener derechos e impedir que otros usen no es lo mismo. Titularidad de lo generado con IA.",
  },
  {
    key: "emp_b5",
    label: "Caso: Óptica Prisma",
    short: "Caso Prisma",
    desc: "Los cuatro bloques anteriores, juntos, en un conflicto real: reconstruir el caso y proponer un protocolo.",
  },
  {
    key: "emp_cierre",
    label: "Cierre y glosario",
    short: "Cierre",
    desc: "Una palabra que se llevan + descarga del glosario de conceptos trabajados en clase (PDF).",
  },
];

export function comAgendaStep(key: string): ComAgendaStep {
  return COM_AGENDA.find((a) => a.key === key) ?? COM_AGENDA[0];
}

// --- 1 · Encuesta relámpago ---------------------------------------------

export interface ComOption {
  id: string;
  label: string;
  emoji: string;
}
export interface ComQuestion {
  id: string;
  q: string;
  options: ComOption[];
  multi?: boolean;
}

export const COM_ENCUESTA: ComQuestion[] = [
  {
    id: "uso",
    q: "¿Usás IA para estudiar o trabajar?",
    options: [
      { id: "diario", label: "Todos los días", emoji: "🔥" },
      { id: "aveces", label: "A veces", emoji: "🙂" },
      { id: "casi", label: "Casi nunca", emoji: "😐" },
      { id: "nunca", label: "Nunca", emoji: "🚫" },
    ],
  },
  {
    id: "empresa",
    q: "¿Trabajás o trabajaste en una empresa?",
    options: [
      { id: "ahora", label: "Sí, ahora", emoji: "💼" },
      { id: "antes", label: "Sí, antes", emoji: "🕘" },
      { id: "no", label: "Todavía no", emoji: "🎓" },
    ],
  },
  {
    id: "reemplazo",
    q: "¿La IA va a reemplazar trabajo humano en tu profesión?",
    options: [
      { id: "mucho", label: "Sí, mucho", emoji: "⚠️" },
      { id: "parte", label: "En parte", emoji: "⚖️" },
      { id: "poco", label: "Casi nada", emoji: "🛡️" },
      { id: "nose", label: "No sé", emoji: "🤔" },
    ],
  },
  {
    id: "preocupa",
    q: "Si asesorás a una empresa que quiere usar IA, ¿qué mirarías primero? (varias)",
    multi: true,
    options: [
      { id: "danos", label: "Quién responde por los daños", emoji: "⚖️" },
      { id: "datos", label: "Los datos que usa", emoji: "🔐" },
      { id: "empleo", label: "El impacto en el empleo", emoji: "👥" },
      { id: "pi", label: "De quién es lo que genera", emoji: "©️" },
      { id: "competencia", label: "El efecto en la competencia", emoji: "🏁" },
      { id: "nada", label: "Nada: es solo tecnología", emoji: "🤷" },
    ],
  },
];

// --- 2 · Tarjetas: usos de IA en la empresa ------------------------------

export interface ComCard {
  id: string;
  emoji: string;
  label: string;
}

export const COM_USOS: ComCard[] = [
  { id: "atencion", emoji: "💬", label: "Atención al cliente (chatbots)" },
  { id: "admin", emoji: "🧾", label: "Facturación y tareas administrativas" },
  { id: "rrhh", emoji: "🧑‍💼", label: "Filtrar CVs y seleccionar personal" },
  { id: "scoring", emoji: "💳", label: "Decidir a quién se le presta (scoring)" },
  { id: "pricing", emoji: "🏷️", label: "Precios que se mueven solos (pricing)" },
  { id: "marketing", emoji: "📣", label: "Publicidad y contenido de marketing" },
  { id: "logistica", emoji: "📦", label: "Stock, logística y reparto" },
  { id: "produccion", emoji: "🏭", label: "Producción y control de calidad" },
  { id: "fraude", emoji: "🔍", label: "Detección de fraude" },
  { id: "legal", emoji: "⚖️", label: "Contratos, legales y compliance" },
  { id: "control", emoji: "👀", label: "Control de la productividad del personal" },
  { id: "ninguno", emoji: "🚫", label: "No vi ninguno" },
];

/** Tarjeta que, si se elige, deselecciona todas las demás. */
export const COM_USOS_EXCLUSIVA = "ninguno";

// --- 3 · Bloques del recorrido del cliente -------------------------------
//
// El recorrido completo de un cliente de estudio jurídico —incorpora IA,
// contrata una herramienta, habilita su uso interno, explota los resultados
// y enfrenta las consecuencias— en 5 bloques, cada uno cerrado por "la
// pregunta del abogado". Se activan como cualquier otra actividad: al
// activar el bloque, el alumno ve todo junto (escenario + pregunta + forma
// de responder) — no hay un paso aparte para "mostrar la pregunta".
//
// Formas de responder, de más simple a más abierta:
// - "texto": una frase corta libre (bloques 1 y 5, más conceptuales).
// - "texto2": dos frases cortas guiadas, con pistas (bloque 2).
// - "chips": elegir tarjetas, como en "Usos de la IA" (bloque 3).
// - "opciones": elegir entre 2-3 posturas + un comentario corto opcional (bloque 4).

export type ComBloqueKind = "texto" | "texto2" | "chips" | "opciones";

interface ComBloqueBase {
  key: Extract<ComActivity, `emp_b${number}`>;
  n: number;
  titulo: string;
  bajada: string;
  /** Texto del escenario, en markdown simple (##, **, -). */
  cuerpoMd: string;
  /** "La pregunta del abogado", destacada al pie del bloque. */
  pregunta: string;
}

export interface ComBloqueTexto extends ComBloqueBase {
  kind: "texto";
  placeholder: string;
  maxChars: number;
}

export interface ComCampo {
  id: string;
  label: string;
  placeholder: string;
  maxChars: number;
}

export interface ComBloqueTexto2 extends ComBloqueBase {
  kind: "texto2";
  campos: [ComCampo, ComCampo];
  /** Pistas que se muestran como referencia, no interactivas. */
  ayuda: string[];
}

export interface ComBloqueChips extends ComBloqueBase {
  kind: "chips";
  opciones: ComCard[];
  /** Tarjeta que, si se elige, deselecciona todas las demás (ej. "ninguna de estas"). */
  exclusiva?: string;
}

export interface ComOpcion {
  id: string;
  emoji: string;
  label: string;
}

export interface ComBloqueOpciones extends ComBloqueBase {
  kind: "opciones";
  opciones: ComOpcion[];
  comentarioPlaceholder: string;
  comentarioMax: number;
}

export type ComBloque = ComBloqueTexto | ComBloqueTexto2 | ComBloqueChips | ComBloqueOpciones;

export const COM_BLOQUES: ComBloque[] = [
  {
    key: "emp_b1",
    n: 1,
    kind: "texto",
    titulo: "Quiero incorporar inteligencia artificial a mi empresa",
    bajada: "Antes de hablar de riesgos, hay que entender qué se quiere delegar.",
    cuerpoMd: `Una automatización tradicional sigue reglas fijas. Un sistema de **IA** puede clasificar, predecir, recomendar o generar contenidos a partir de patrones.

La lógica de la **IA generativa**, en su esquema más simple: recibe información e instrucciones (**inputs**), las procesa con un modelo, y produce texto, imagen, audio, video o código (**outputs**).

Un cliente llega al estudio y dice que quiere usar IA. La primera tarea profesional no es hablar de riesgos: es entender qué proceso de la empresa quiere modificar. ¿Diseñar productos? ¿Seleccionar personal? ¿Atender consumidores? ¿Analizar contratos? ¿Tomar decisiones comerciales?`,
    pregunta: "¿Qué actividad quiere delegar la empresa, y qué consecuencias podría producir esa delegación?",
    placeholder: "La empresa quiere delegar… y eso podría producir…",
    maxChars: 220,
  },
  {
    key: "emp_b2",
    n: 2,
    kind: "texto2",
    titulo: "Encontré una herramienta de IA y quiero contratarla",
    bajada: "El cliente ya eligió una plataforma. Hay que saber qué está contratando realmente.",
    cuerpoMd: `¿Una licencia de software? ¿Un servicio en línea? ¿Una solución hecha a medida? ¿El acceso a un modelo administrado por un tercero? Cada una trae un régimen distinto.

Antes de firmar hay que revisar: los términos de uso, el precio y la duración, si el proveedor puede modificar el servicio unilateralmente, qué hace con los datos, la confidencialidad, de quién son los resultados, los límites de responsabilidad, y qué pasa con la información de la empresa si el vínculo termina.`,
    pregunta: "¿Qué recibe la empresa, y qué conserva el proveedor?",
    campos: [
      { id: "empresa", label: "La empresa recibe…", placeholder: "usar la herramienta, soporte…", maxChars: 90 },
      { id: "proveedor", label: "El proveedor conserva…", placeholder: "tus datos, el código…", maxChars: 90 },
    ],
    ayuda: ["Precio y duración", "Tus datos", "Confidencialidad", "De quién son los resultados", "Qué pasa si te vas"],
  },
  {
    key: "emp_b3",
    n: 3,
    kind: "chips",
    titulo: "Quiero que mis empleados empiecen a usar IA",
    bajada: "El riesgo ya no está solo en el contrato con el proveedor: está puertas adentro.",
    cuerpoMd: `Los trabajadores podrían cargar, sin pensarlo dos veces, bases de clientes, contratos, diseños, fotografías, código fuente, información contable o estrategia comercial en una herramienta de terceros.

El abogado tiene que clasificar esa información —datos personales, secretos comerciales, know-how, obras protegidas, material confidencial— y después diseñar una política interna: qué herramientas pueden usarse, qué información puede cargarse, qué usos requieren autorización, y cuáles quedan directamente prohibidos.`,
    pregunta: "¿Qué NO debería cargar nunca un empleado en una herramienta de IA de terceros?",
    opciones: [
      { id: "datos_clientes", emoji: "🧾", label: "Datos personales de clientes" },
      { id: "contratos", emoji: "📑", label: "Contratos y cifras del negocio" },
      { id: "codigo", emoji: "💻", label: "Código fuente o diseños propios" },
      { id: "accesos", emoji: "🔑", label: "Contraseñas y accesos" },
      { id: "legajos", emoji: "🗂️", label: "Legajos o datos de empleados" },
      { id: "nada", emoji: "🤷", label: "Nada: se puede cargar cualquier cosa" },
    ],
    exclusiva: "nada",
  },
  {
    key: "emp_b4",
    n: 4,
    kind: "opciones",
    titulo: "Generamos esto con IA y queremos venderlo",
    bajada: "Usar, tener derechos e impedir que otros usen no es lo mismo.",
    cuerpoMd: `El cliente lleva al estudio una campaña, un logotipo, un diseño, un programa o una colección creada con IA, y pregunta si puede explotarla comercialmente.

Hay tres preguntas distintas escondidas en una: ¿la empresa puede usar el resultado? ¿tiene derechos sobre él? ¿puede impedir que otros lo utilicen? Hay que mirar qué intervención humana existió, qué materiales se usaron como referencia, qué establecen los términos del proveedor, y si el resultado puede afectar derechos de autor, marcas o diseños de terceros.`,
    pregunta: "¿La empresa tiene un activo jurídicamente protegible, o solamente un resultado que puede utilizar?",
    opciones: [
      { id: "activo", emoji: "🔒", label: "Tiene un activo protegible" },
      { id: "uso", emoji: "🔓", label: "Solo puede usarlo" },
    ],
    comentarioPlaceholder: "¿Por qué? (opcional)",
    comentarioMax: 140,
  },
  {
    key: "emp_b5",
    n: 5,
    kind: "texto",
    titulo: "Caso: Óptica Prisma",
    bajada: "Los cuatro bloques anteriores, juntos, en un conflicto real.",
    cuerpoMd: `## Óptica Prisma — caso ficticio

Cadena de ópticas. Hace algunos años contrató a una actriz para una campaña publicitaria **limitada**: uso acordado por un tiempo y unos medios determinados.

Este año, para lanzar una colección nueva, el área de marketing tomó esas fotos viejas y, con una herramienta de IA, generó **videos nuevos** de la actriz para las redes de la colección actual. Nadie volvió a hablar con ella ni con la agencia que había gestionado el contrato original.

La actriz reclama: dice que nunca autorizó ese uso, y mucho menos generar contenido nuevo con su imagen.

Sos el abogado/a de Prisma. Te llaman hoy: hay que pedir los contratos, reconstruir quién tomó la decisión, determinar qué derechos tenía cada participante, revisar la licencia de la herramienta de IA y evaluar la responsabilidad de la empresa, la agencia y el proveedor tecnológico.`,
    pregunta:
      "¿Qué contratos pedís y a quién le preguntás primero? ¿Quién puede haber respondido por esto —la empresa, la agencia, el proveedor de la IA— y qué protocolo le proponés a Prisma para que no vuelva a pasar?",
    placeholder: "Primero pediría… y el protocolo sería…",
    maxChars: 280,
  },
];

export function getBloque(key: string): ComBloque | undefined {
  return COM_BLOQUES.find((b) => b.key === key);
}

// --- 5 · Cierre ----------------------------------------------------------

export const COM_CIERRE_TITULO = "Una palabra que te llevás";
export const COM_CIERRE_BAJADA =
  "Escribí una sola palabra: lo que te queda dando vueltas de la clase. Va al proyector.";
export const COM_PALABRA_MAX = 22;

export const COM_CIERRE_NOTA =
  "Llevate el glosario: los conceptos que trabajamos hoy, definidos en criollo, para tenerlos a mano cuando aparezcan en la materia.";

// --- Glosario descargable (PDF) -----------------------------------------

export interface GlosarioTermino {
  termino: string;
  definicion: string;
  /** Cómo aparece concretamente adentro de una empresa. */
  enLaEmpresa?: string;
}
export interface GlosarioBloque {
  titulo: string;
  bajada: string;
  terminos: GlosarioTermino[];
}

export const GLOSARIO: GlosarioBloque[] = [
  {
    titulo: "Cómo funciona esto",
    bajada: "Los conceptos mínimos para no hablar de IA como si fuera magia.",
    terminos: [
      {
        termino: "Inteligencia artificial (IA)",
        definicion:
          "Sistemas informáticos que resuelven tareas que asociábamos a la inteligencia humana: reconocer, clasificar, predecir, redactar, recomendar. No es un sujeto que 'entiende': es software que procesa datos y produce un resultado.",
      },
      {
        termino: "IA generativa",
        definicion:
          "La que genera contenido nuevo (texto, imagen, audio, código) en lugar de solo clasificar o predecir. Es la que se popularizó con los asistentes conversacionales.",
        enLaEmpresa: "Redacción de contenido, respuestas al cliente, borradores de documentos.",
      },
      {
        termino: "Algoritmo",
        definicion:
          "La secuencia de pasos y reglas con la que un sistema llega a un resultado. En IA moderna esas reglas no se escriben todas a mano: surgen del entrenamiento sobre datos.",
      },
      {
        termino: "Modelo y entrenamiento",
        definicion:
          "El modelo es el sistema ya 'aprendido'; el entrenamiento es el proceso de ajustarlo con grandes volúmenes de datos. Lo que el modelo hace bien o mal depende en buena medida de con qué se entrenó.",
      },
      {
        termino: "Dato",
        definicion:
          "El insumo. Sin datos no hay IA que funcione. En la empresa, la calidad de los datos internos (ventas, stock, clientes, legajos) define qué se puede automatizar y qué no.",
      },
      {
        termino: "Alucinación",
        definicion:
          "Cuando el sistema produce información falsa con tono seguro: datos, citas o hechos inexistentes. No es un error ocasional que se 'arregla': es una característica del funcionamiento que obliga a verificar.",
      },
      {
        termino: "Sesgo algorítmico",
        definicion:
          "Cuando el sistema reproduce o amplifica desigualdades presentes en los datos con los que fue entrenado. No hace falta mala intención: alcanza con que los datos históricos ya tuvieran ese patrón.",
        enLaEmpresa: "Un filtro de CVs que replica a quién contrató la empresa en los últimos diez años.",
      },
      {
        termino: "Caja negra y explicabilidad",
        definicion:
          "Muchos sistemas no permiten reconstruir por qué decidieron lo que decidieron ('caja negra'). Explicabilidad es la capacidad de dar razones entendibles de una decisión automatizada.",
      },
      {
        termino: "Supervisión humana",
        definicion:
          "Que una persona revise, pueda corregir o vetar la decisión del sistema, especialmente cuando esa decisión afecta derechos de alguien. Es la diferencia entre asistir a una persona y sustituirla.",
      },
    ],
  },
  {
    titulo: "La IA dentro de la empresa",
    bajada: "El vocabulario con el que la empresa describe lo que está haciendo.",
    terminos: [
      {
        termino: "Transformación digital",
        definicion:
          "Rediseñar procesos, decisiones y organización usando tecnología. No es comprar software: es cambiar cómo se trabaja y cómo se decide. Si la empresa incorpora tecnología sin cambiar procesos, no hay transformación, hay gasto.",
      },
      {
        termino: "Automatización",
        definicion:
          "Que una tarea que hacía una persona pase a ejecutarla un sistema. Se automatizan tareas antes que puestos: lo habitual es que el puesto cambie de contenido, no que desaparezca de un día para el otro.",
      },
      {
        termino: "Chatbot / asistente virtual",
        definicion:
          "Sistema que atiende consultas o reclamos por chat, web o mensajería, con o sin derivación a una persona. Lo que informa o promete es comunicación de la empresa.",
      },
      {
        termino: "Scoring",
        definicion:
          "Puntaje automático que estima el riesgo o el comportamiento futuro de una persona (por ejemplo, la probabilidad de que pague). Se usa para otorgar o negar crédito, fijar límites o condiciones.",
      },
      {
        termino: "Pricing algorítmico (o dinámico)",
        definicion:
          "Fijación automática de precios que varía según demanda, stock, horario, canal o precios de la competencia. El precio deja de ser una decisión puntual y pasa a ser una salida continua del sistema.",
      },
      {
        termino: "Analítica de datos / decisión basada en datos",
        definicion:
          "Usar los datos de la propia operación para decidir (qué stockear, a qué cliente contactar, cuándo reponer). Es la base sobre la que después se monta cualquier automatización.",
      },
      {
        termino: "Trazabilidad (registro / logs)",
        definicion:
          "Dejar constancia de qué hizo el sistema, cuándo y con qué datos. Sin registro, la empresa no puede explicar después por qué se decidió lo que se decidió.",
      },
      {
        termino: "Reconversión laboral (reskilling)",
        definicion:
          "Formar al personal cuyas tareas se automatizaron para que ocupe funciones nuevas dentro de la empresa. Es la alternativa organizativa al recorte cuando la tarea desaparece pero la persona sigue siendo útil.",
      },
      {
        termino: "Productividad",
        definicion:
          "Cuánto se produce con los mismos recursos. Es el argumento económico central de la incorporación de IA — y el que suele medirse mal si no se cuentan los costos de control, error y rehacer trabajo.",
      },
    ],
  },
  {
    titulo: "Lo que mira el derecho",
    bajada: "Dónde estos conceptos se cruzan con la materia.",
    terminos: [
      {
        termino: "Compliance",
        definicion:
          "El conjunto de políticas, controles y procedimientos internos con los que la empresa se asegura de cumplir la normativa y sus propias reglas, y de poder demostrarlo.",
      },
      {
        termino: "Gobernanza de la IA",
        definicion:
          "Cómo se decide, dentro de la empresa, qué sistemas se usan, para qué, con qué controles y quién responde por cada uno. Es compliance aplicado específicamente a estos sistemas.",
      },
      {
        termino: "Deber de diligencia del administrador",
        definicion:
          "El estándar de conducta exigible a quien administra una sociedad: informarse, controlar y decidir con el cuidado de un buen hombre de negocios. Incorporar un sistema que decide sobre clientes o personal es una decisión de gestión, no un detalle técnico.",
      },
      {
        termino: "Debida diligencia (due diligence)",
        definicion:
          "La investigación previa razonable antes de contratar o incorporar algo: qué hace el sistema, con qué datos, qué garantiza el proveedor, qué pasa si falla.",
      },
      {
        termino: "Responsabilidad",
        definicion:
          "El deber de responder por el daño causado. Un sistema informático no es sujeto de derecho: la discusión siempre es entre quién lo usa, quién lo desarrolló y quién lo introdujo en el mercado.",
      },
      {
        termino: "Datos personales",
        definicion:
          "Información referida a personas identificadas o identificables. Casi toda IA empresarial útil se alimenta de datos de clientes, empleados o proveedores, lo que activa deberes sobre su tratamiento y conservación.",
      },
      {
        termino: "Deber de información al consumidor",
        definicion:
          "La obligación de informar de manera cierta, clara y detallada. Que la atención o la oferta salgan de un sistema automatizado no reduce el estándar: el canal cambia, el deber no.",
      },
      {
        termino: "Colusión algorítmica",
        definicion:
          "Situación en la que algoritmos de precios de empresas competidoras convergen en precios más altos sin que haya existido un acuerdo expreso entre ellas. Tensiona categorías pensadas para acuerdos entre personas.",
      },
      {
        termino: "Propiedad intelectual sobre lo generado",
        definicion:
          "La pregunta de a quién pertenece lo que produce una IA (texto, imagen, diseño) y qué pasa con el material usado para entrenarla. Hoy es un terreno abierto: en la práctica empresarial se resuelve por contrato y términos de servicio.",
      },
      {
        termino: "Secreto comercial y confidencialidad",
        definicion:
          "Información con valor por no ser conocida. Riesgo concreto y cotidiano: cargar información sensible de la empresa o de un cliente en una herramienta de IA de terceros sin saber qué hace esa herramienta con lo cargado.",
      },
      {
        termino: "Cláusula de IA en contratos",
        definicion:
          "Previsión contractual sobre el uso de estos sistemas: si se permiten, con qué límites, quién responde por errores, qué pasa con la confidencialidad y con la titularidad de lo generado. Es la herramienta con la que hoy se ordena la incertidumbre.",
      },
      {
        termino: "Know-how",
        definicion:
          "El conocimiento práctico y no obvio que una empresa acumuló con su experiencia (procesos, fórmulas, formas de hacer las cosas) y que tiene valor precisamente por no ser público.",
        enLaEmpresa: "Es de lo primero que un empleado puede filtrar sin querer al cargarlo en una IA de terceros.",
      },
      {
        termino: "Licencia de software / SaaS",
        definicion:
          "El contrato por el que un proveedor autoriza el uso de su software (instalado, o como servicio en línea). Define qué puede hacer la empresa con la herramienta y qué se reserva el proveedor: ahí conviene mirar precio, duración, cambios unilaterales, datos y salida del servicio.",
      },
      {
        termino: "Cesión de derechos",
        definicion:
          "El acto por el cual el titular de un derecho (de autor, de imagen) lo transfiere a otro, o autoriza un uso determinado. La discusión típica: si una cesión para un uso limitado (una campaña, un tiempo) habilita o no un uso posterior distinto.",
      },
      {
        termino: "Derecho a la imagen y a la voz",
        definicion:
          "El derecho de una persona a autorizar o no el uso de su imagen o su voz. Una autorización para un uso específico no se extiende automáticamente a usos nuevos — mucho menos a generar contenido nuevo con IA a partir de material antiguo.",
      },
      {
        termino: "Responsabilidad en cadena",
        definicion:
          "Cuando varios actores participan de un mismo hecho dañoso (la empresa que usa el sistema, la agencia que gestionó un contrato, el proveedor de la tecnología), determinar quién responde por qué exige reconstruir el rol y el control de cada uno — no alcanza con señalar 'a la IA'.",
      },
    ],
  },
];

/** Ideas fuerza que cierran el glosario. */
export const GLOSARIO_CIERRE = [
  "La IA automatiza tareas antes que puestos: preguntá siempre qué tarea, no qué profesión.",
  "El sistema ejecuta; la empresa decide incorporarlo. Quien decide, responde.",
  "Sin registro de lo que el sistema hizo, la empresa no puede explicarse después.",
  "Delegar la atención o la decisión en un sistema no delega los deberes frente a clientes y empleados.",
  "Casi todo lo que hoy no está resuelto por norma, la empresa lo ordena por contrato y por controles internos.",
];
