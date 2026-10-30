// ============================================================
// Tribunal Fiscal · Tercera charla: "Inteligencia artificial aplicada al
// análisis jurídico tributario". Documento rector de Mario Rodolfo Leal,
// Marco Rossi y Franco Orellana (contexto profundo para la clase 3).
//
// Tesis: antes de pedirle a una IA que analice o ayude a resolver un
// recurso, hay que entender qué hace el Tribunal, qué información necesita
// y qué operaciones jurídicas realiza. COTIO describe ese trabajo; no
// automatiza la decisión.
//
// 15 placas (títulos y bajadas literales), un recupero de la clase 2 con
// datos reales de la app y EXACTAMENTE cuatro actividades sobre un
// expediente real anonimizado (apelación de una clausura de seis días):
//   06 · ¿Contexto o input?        (tf3_a1)
//   09 · ¿Qué necesita saber el Tribunal?  (tf3_a2)
//   11 · ¿Qué hacemos con los agravios?    (tf3_a3)
//   13 · ¿Qué falta antes de resolver?     (tf3_a4; se revela en la 14)
//
// Las piezas D1–D5 se liberan de a poco en los celulares (D1 en la 08,
// D2 y D3 en la 10, D4 en la 12 y D5 en la 14). Su texto vive solo en el
// servidor (lib/tribunal-clase3-docs.ts). Texto circular: SOLO 07 y 13.
// No hay sentencia definitiva del caso: no se inventa.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";

export const TF3_SLUG = "tribunal-fiscal-3";
export const TF3_TITULO = "Inteligencia artificial aplicada al análisis jurídico tributario";
export const TF3_TESIS =
  "Antes de pedirle a una IA que analice o ayude a resolver un recurso, debemos entender qué hace el Tribunal, qué información necesita y qué operaciones jurídicas realiza.";
export const TF3_PREGUNTA = "¿Qué necesita saber y hacer un decisor para analizar jurídicamente una apelación contra una clausura?";

// --- Tramos de la clase (versión de ~75 minutos) ------------------------------------------------

export const TF3_TRAMOS = [
  { nombre: "De la clase 2 a hoy", minutos: 11 },
  { nombre: "COTIO: diseñar el razonamiento", minutos: 20 },
  { nombre: "El expediente", minutos: 24 },
  { nombre: "Lo que falta comprobar", minutos: 18 },
  { nombre: "Método antes que decisión", minutos: 7 },
];

// --- Expediente de trabajo (D1–D5) ------------------------------------------------------------------

export type Tf3DocId = "D1" | "D2" | "D3" | "D4" | "D5";

export interface Tf3Doc {
  id: Tf3DocId;
  titulo: string;
  paginas: number;
  /** Para qué sirve en el análisis (breve, funcional). */
  funcion: string;
  /** Número de placa en la que se libera sola en los celulares. */
  libera: string;
}

export const TF3_DOCS: Tf3Doc[] = [
  { id: "D1", titulo: "Resolución de la DGR", paginas: 2, funcion: "La decisión recurrida: clausura de seis días por trabajadoras no registradas.", libera: "08" },
  { id: "D2", titulo: "Apelación", paginas: 6, funcion: "Los agravios del contribuyente contra la resolución.", libera: "10" },
  { id: "D3", titulo: "Contestación de la DGR", paginas: 12, funcion: "La respuesta de Rentas a cada agravio.", libera: "10" },
  { id: "D4", titulo: "Declaración de puro derecho", paginas: 2, funcion: "El Tribunal rechaza la testimonial y declara la cuestión de puro derecho.", libera: "12" },
  { id: "D5", titulo: "Medida para mejor proveer", paginas: 4, funcion: "Antes de resolver, el Tribunal pide constancias laborales de dieciséis meses.", libera: "14" },
];

/** Aviso (fila `~avisos`) que libera una pieza en todos los celulares. */
export const avisoDoc = (id: Tf3DocId) => `doc:${id}`;
/** Aviso que proyecta el recupero de la clase 2 (datos validados por Marco el 30/10/2026). */
export const TF3_AVISO_RECUPERO = "recupero-validado";

export const TF3_NOTA_ANONIMIZACION =
  "Transcripción anonimizada del expediente para uso docente: se reemplazaron nombres, CUIT/DNI, domicilios, profesionales particulares, números de expediente y firmas. Se conservan fechas, normas, agravios y la numeración de páginas del original.";

// --- Recupero de la clase 2 (datos REALES de la app, 23/10/2026) -------------------------------------
// Fuente: respuestas guardadas en la app de la clase 2 (agregadas, sin nombres). La nube de palabras
// (actividad 1) no registró respuestas en la app: no se muestra. Marco validó los datos el 30/10/2026;
// se proyectan con el botón «📊 Proyectar recupero de la clase 2» del control (aviso `recupero-validado`).

export const TF3_RECUPERO = {
  fecha: "23/10/2026",
  ingresos: 38,
  laboratorio: {
    hicieron: 24,
    reflexionaron: 12,
    cambios: [
      { label: "Usó los datos que le dimos", n: 8 },
      { label: "El formato es más útil", n: 7 },
      { label: "Marcó lo que faltaba", n: 3 },
      { label: "El tono es más adecuado", n: 2 },
    ],
  },
  contexto: { votaron: 20, conContexto: 14, sinContexto: 6 },
  humanoIa: { votaron: 8, acertaron: 4 },
  desafio: {
    empezaron: 24,
    armaron: 10,
    probaron: 5,
    fichas: 4,
    /** Cuántos completaron cada campo (de 24): lo menos completado fue fuentes y verificaciones. */
    campos: [
      { label: "Tarea", n: 23 },
      { label: "Propósito", n: 21 },
      { label: "Rol", n: 19 },
      { label: "Contexto", n: 15 },
      { label: "Etapas", n: 12 },
      { label: "Fuentes", n: 11 },
      { label: "Formato", n: 10 },
      { label: "Verificaciones", n: 9 },
    ],
    /** Tareas que escribieron (literales, sin autor). */
    pedidos: [
      "Analizá los argumentos y pruebas del apelante y la DGR",
      "Resumen de las piezas principales del expediente",
      "Redactar la sentencia del expediente",
      "Hacer una sentencia declarando cuestión de puro derecho",
      "Ordenar los expedientes que prescriben en los próximos 6 meses",
    ],
    /** De 23 tareas escritas, cuántas le pedían a la IA redactar o dictar una sentencia. */
    pedianSentencia: 4,
    tareas: 23,
  },
  hallazgos: [
    "Mejoró la respuesta cuando le dimos datos y formato.",
    "Lo que menos completamos: fuentes (11 de 24) y verificaciones (9 de 24).",
    "4 de 23 tareas le pedían a la IA redactar o dictar una sentencia.",
  ],
  puente: "Ya sabemos dar mejores instrucciones. ¿Sabemos qué información necesita el Tribunal para resolver?",
};

// --- Actividades (especificación ejecutable, sección 8 bis) ---------------------------------------------
// Cada una: ABRIR (al llegar a la placa), VER RESULTADOS (▶), MOSTRAR DEVOLUCIÓN (▶ o botón) y CERRAR.
// En el celular basta tocar y ENVIAR. Se puede avanzar con una sola respuesta o ninguna.

export type Tf3ActKey = "tf3_a1" | "tf3_a2" | "tf3_a3" | "tf3_a4";

/** Actividad 1: cuatro tarjetas, dos botones por tarjeta. */
export const TF3_TARJETAS = [
  { id: "a", letra: "A", texto: "Competencia del Tribunal Fiscal", respuesta: "contexto" as const },
  { id: "b", letra: "B", texto: "Fecha de la inspección de este comercio", respuesta: "input" as const },
  { id: "c", letra: "C", texto: "Reglas del procedimiento tributario", respuesta: "contexto" as const },
  { id: "d", letra: "D", texto: "Cantidad de días de clausura impuesta", respuesta: "input" as const },
];
export const TF3_A1_PROYECTADA = "El Tribunal revisa una clausura. ¿Qué es contexto y qué es input?";
export const TF3_A1_DEVOLUCION = [
  "A y C son marco institucional y normativo reutilizable.",
  "B y D son variables del caso particular.",
  "No es una regla rígida: una norma sancionatoria especial también puede formar parte de la especificación del tipo de caso; algunas variables nacen de la norma.",
];
export const TF3_A1_CIERRE = "El contexto define el terreno de juego; el input son los datos que necesitamos examinar en este expediente.";

/** Actividad 2: seis casillas (A–E necesarias, F accesoria). */
export const TF3_VARIABLES = [
  { id: "a", letra: "A", label: "Conducta imputada y norma aplicada", necesaria: true, hoy: "Se encuentra en D1 (p.1): es lo que afirma Rentas, no un hecho probado." },
  { id: "b", letra: "B", label: "Acta de inspección y qué constató", necesaria: true, hoy: "D1 la menciona (p.1): relevamiento del 17/01/2025 y acta de fs. 10. Qué constató exactamente se discute." },
  { id: "c", letra: "C", label: "Descargo y prueba ofrecida por el contribuyente", necesaria: true, hoy: "Requiere examinar actuaciones: D1 resume el descargo, pero no la prueba ofrecida." },
  { id: "d", letra: "D", label: "Sanción impuesta y sus fundamentos", necesaria: true, hoy: "En D1 (p.1–2): seis días, graduados por cantidad de trabajadoras." },
  { id: "e", letra: "E", label: "Situación registral de la trabajadora en las fechas jurídicamente pertinentes", necesaria: true, hoy: "Requiere corroboración: D1 informa un alta enviada el 28/01/2025, posterior al relevamiento." },
  { id: "f", letra: "F", label: "Color de la fachada del establecimiento", necesaria: false, hoy: "Accesorio: en este expediente no tiene relevancia jurídica." },
];
export const TF3_A2_PROYECTADA = "Para revisar esta clausura, ¿qué datos deberíamos conocer?";
export const TF3_A2_ACLARACION = "Que una variable sea necesaria no significa que la parte que la invoca ya la haya acreditado.";
/** Opción voluntaria del celular («¿qué falta?»): un ejemplo, sin adelantar D5. */
export const TF3_A2_QUE_FALTA = "Ejemplo: D1 dice que el alta de la trabajadora se envió después del relevamiento. ¿Qué pasó con esa relación laboral después? En D1 no consta.";

/** Actividad 3: una elección. */
export const TF3_A3_PROYECTADA = "El contribuyente cuestiona la competencia de Rentas y la prueba; la DGR responde. ¿Cuál es la mejor próxima tarea para la IA?";
export const TF3_A3_OPCIONES = [
  { id: "a", letra: "A", label: "Redactar ya la sentencia definitiva", veredicto: "Inadecuado en esta etapa: anticipa la conclusión." },
  { id: "b", letra: "B", label: "Comparar agravios y respuestas; identificar la cuestión jurídica y sus fuentes", veredicto: "La operación adecuada ahora." },
  { id: "c", letra: "C", label: "Resumir solamente la apelación", veredicto: "Insuficiente por sí solo: puede ser un subpaso, pero no reemplaza el contraste." },
  { id: "d", letra: "D", label: "Aceptar como verdaderos todos los hechos narrados por Rentas", veredicto: "Inadecuado: confunde afirmaciones con hechos establecidos." },
];
export const TF3_A3_CIERRE = "La tarea no es fallar. Es descomponer: qué plantea cada parte, qué debemos examinar y con qué fuentes.";

/**
 * Matriz demostrativa (dos filas). Páginas cotejadas contra los escaneos originales; la transcripción
 * anonimizada conserva esa paginación. Sin citas literales.
 */
export const TF3_MATRIZ_A3 = [
  {
    fila: "Competencia para fiscalizar",
    agravio: "Rentas no tiene competencia en materia de inspección laboral: corresponde a la Secretaría de Trabajo; las normas que la habilitan serían inconstitucionales.",
    dgr: "La competencia surge del art. 80 y del art. 9 del CTP y del Impuesto para la Salud Pública, cuya base es la cantidad de empleados.",
    pregunta: "¿Puede la DGR constatar y sancionar la falta de registración laboral?",
    fuente: "D2 p.4 · D3 p.7–8",
  },
  {
    fila: "Tratamiento de la prueba testimonial",
    agravio: "Ofreció como testigos a las personas relevadas y la DGR no produjo esa prueba ni la trató.",
    dgr: "El descargo sí se valoró; el acta es instrumento público y solo se desvirtúa por redargución de falsedad.",
    pregunta: "¿La falta de producción de esa prueba afectó el derecho de defensa? ¿Qué alcance tiene el acta?",
    fuente: "D2 p.1–2 · D3 p.4–6",
  },
];

/** Actividad 4: una opción (VOTAR). La revelación (D5) la sirve el servidor recién cuando se libera. */
export const TF3_A4_PROYECTADA = "Con lo que viste del expediente, ¿qué harías ahora?";
export const TF3_A4_OPCIONES = [
  { id: "a", letra: "A", label: "Confirmar inmediatamente la clausura" },
  { id: "b", letra: "B", label: "Requerir constancias laborales y registrales pertinentes antes de decidir" },
  { id: "c", letra: "C", label: "Revocar inmediatamente la clausura sin nuevas comprobaciones" },
  { id: "d", letra: "D", label: "No puedo decidir todavía con estos documentos" },
];
export const TF3_A4_DEVOLUCION = [
  "Todas las respuestas valen: no hay penalización.",
  "B expresa una medida de investigación posible; D reconoce que la información es insuficiente.",
  "A y C anticipan una decisión sin examinar las comprobaciones que el caso plantea.",
];

export interface Tf3Actividad {
  key: Tf3ActKey;
  numero: number;
  nombre: string;
  /** Instrucción en el celular (máximo 20 palabras). */
  instruccion: string;
  /** Texto del botón de envío. */
  enviar: "ENVIAR" | "VOTAR";
  vivo: ActividadVivo;
}

export const TF3_ACTIVIDADES: Tf3Actividad[] = [
  {
    key: "tf3_a1",
    numero: 1,
    nombre: "¿Contexto o input?",
    instruccion: "Tocá dónde ubicarías cada elemento.",
    enviar: "ENVIAR",
    vivo: {
      key: "tf3_a1",
      kind: "encuesta",
      titulo: "¿Contexto o input?",
      bajada: "Tocá dónde ubicarías cada elemento.",
      preguntas: TF3_TARJETAS.map((t) => ({
        id: t.id,
        q: t.texto,
        opciones: [
          { id: "contexto", emoji: "📚", label: "Contexto" },
          { id: "input", emoji: "🧩", label: "Input" },
        ],
      })),
    },
  },
  {
    key: "tf3_a2",
    numero: 2,
    nombre: "¿Qué necesita saber el Tribunal?",
    instruccion: "Marcá los datos que considerás necesarios. Podés elegir varios.",
    enviar: "ENVIAR",
    vivo: {
      key: "tf3_a2",
      kind: "chips",
      titulo: "¿Qué necesita saber el Tribunal?",
      bajada: "Marcá los datos que considerás necesarios.",
      opciones: TF3_VARIABLES.map((v) => ({ id: v.id, emoji: v.letra, label: v.label })),
    },
  },
  {
    key: "tf3_a3",
    numero: 3,
    nombre: "¿Qué hacemos con los agravios?",
    instruccion: "Elegí la mejor próxima tarea para la IA.",
    enviar: "ENVIAR",
    vivo: {
      key: "tf3_a3",
      kind: "opciones",
      titulo: "¿Qué hacemos con los agravios?",
      bajada: "Una elección.",
      opciones: TF3_A3_OPCIONES.map((o) => ({ id: o.id, emoji: o.letra, label: o.label })),
    },
  },
  {
    key: "tf3_a4",
    numero: 4,
    nombre: "¿Qué falta antes de resolver?",
    instruccion: "Con lo que viste del expediente, ¿qué harías ahora?",
    enviar: "VOTAR",
    vivo: {
      key: "tf3_a4",
      kind: "opciones",
      titulo: "¿Qué falta antes de resolver?",
      bajada: "Una opción.",
      opciones: TF3_A4_OPCIONES.map((o) => ({ id: o.id, emoji: o.letra, label: o.label })),
    },
  },
];

export const getTf3Actividad = (key: string) => TF3_ACTIVIDADES.find((a) => a.key === key);
export const getTf3Vivo = (key: string) => getTf3Actividad(key)?.vivo;

/** ¿La presentación ya habilitó esta actividad? La abierta y las anteriores; con la actividad cerrada, ninguna. */
export function tf3Habilitada(activity: string, actual: string): boolean {
  const n = getTf3Actividad(activity)?.numero ?? 0;
  return n > 0 && n <= (getTf3Actividad(actual)?.numero ?? 0);
}

/** Interruptores de la presentación que también ven los celulares (fase de cada actividad). */
export const TF3_DEVOLUCION = "💡 Mostrar devolución";
export const TF3_VER_MATRIZ = "🧾 Ver matriz";
export const TF3_REVELAR_D5 = "🔓 Revelar actuación real (libera D5)";
export const TF3_VER_PROMPT = "🧩 Ver el prompt COTIO";
export const TF3_PROYECTAR_RECUPERO = "📊 Proyectar recupero de la clase 2";

// --- COTIO ------------------------------------------------------------------------------------------------

export const TF3_COTIO = [
  { letra: "C", nombre: "Contexto", def: "Órgano, función revisora, procedimiento, competencia y fuentes.", caso: "Marco institucional: Tribunal Fiscal, recurso de apelación contra una clausura de la DGR." },
  { letra: "O", nombre: "Objetivo", def: "Qué queremos conseguir con el ejercicio.", caso: "Analizar el recurso: un análisis inicial organizado, no fallar." },
  { letra: "T", nombre: "Tarea", def: "El procesamiento: aislar agravios, comparar, verificar.", caso: "Contrastar posiciones y examinar hechos, normas y prueba." },
  { letra: "I", nombre: "Input", def: "Las variables jurídicamente relevantes, no todo el expediente.", caso: "Variables específicas de la clausura, con su estado de acreditación." },
  { letra: "O", nombre: "Output", def: "Un producto controlable, con fuentes y estados.", caso: "Ficha de análisis controlable. No una sentencia." },
];

// --- Placas -----------------------------------------------------------------------------------------------

export type Tf3Visual =
  | "recupero"
  | "ventana"
  | "skills"
  | "apelacion"
  | "comoPiensa"
  | "cotio"
  | "contexto"
  | "a1"
  | "input"
  | "seisDias"
  | "a2"
  | "dosRelatos"
  | "a3"
  | "sabemos"
  | "a4"
  | "mejorProveer"
  | "metodo";

/** Guion de conducción de cada pantalla (solo en el celular de control). */
export interface Tf3Guion {
  /** Qué aprenden con esta pantalla (una frase). */
  aprenden: string;
  /** Frases listas para decir, en orden. */
  decir: string[];
  /** Pregunta optativa para la sala. */
  preguntar?: string;
  /** Cómo pasar a la siguiente. */
  puente: string;
}

export interface Tf3Placa {
  t: "placa";
  num: string;
  titulo: string;
  bajada: string;
  /** Operación de la app en esta placa (qué se abre, qué tocar). Solo en el celular de control. */
  nota: string;
  /** Guion para el docente (celular de control). */
  guion: Tf3Guion;
  /** Idea clave proyectada (explícita, una o dos líneas). Las placas de actividad usan su devolución. */
  clave?: string;
  /** Qué letras de COTIO trabaja la placa (0 C · 1 O · 2 T · 3 I · 4 O). */
  cotio?: number[];
  tramo: number;
  visual: Tf3Visual;
  pasos: number;
  actividad?: Tf3ActKey;
  /** Texto circular: SOLO en las placas de giro (07 y 13). */
  curva?: string;
  /** Piezas del expediente que se liberan en los celulares al llegar. */
  libera?: Tf3DocId[];
}

export type Tf3Slide = Tf3Placa | { t: "ingreso"; tramo: number } | { t: "skill"; tramo: number } | { t: "matriz"; tramo: number };

const P = (p: Omit<Tf3Placa, "t">): Tf3Placa => ({ t: "placa", ...p });

const TODO_COTIO = [0, 1, 2, 3, 4];

export const TF3_SLIDES: Tf3Slide[] = [
  { t: "ingreso", tramo: 0 },
  P({
    num: "01",
    tramo: 0,
    titulo: "¿Qué nos quedó de la clase pasada?",
    bajada: "Antes de avanzar, recuperamos lo que aprendimos al darle contexto e instrucciones a una IA.",
    nota: "Tocá «📊 Proyectar recupero de la clase 2»: aparecen los datos validados. El mismo botón los oculta.",
    guion: {
      aprenden: "Recordar qué funcionó en la clase 2 y abrir la pregunta de hoy.",
      decir: [
        "En la clase pasada, 14 de 20 eligieron la respuesta con contexto: cuando le damos datos y formato, la IA responde mejor.",
        "Lo que menos completamos en el desafío fueron las fuentes y las verificaciones.",
        "4 de 23 tareas le pedían a la IA redactar o dictar una sentencia. Hoy vamos a ver por qué ese no es el primer paso.",
      ],
      preguntar: "¿Alguien usó algo de la clase pasada en su trabajo?",
      puente: "«Ya sabemos dar mejores instrucciones. ¿Sabemos qué información necesita el Tribunal para resolver?» → ▶",
    },
    clave: "Clase 2: con contexto, formato y verificación, la IA responde mejor. Hoy, un paso más: ¿qué información necesita el Tribunal?",
    visual: "recupero",
    pasos: 4,
  }),
  // Dos placas de introducción técnica (pedido de Marco, 30/10): cómo trabaja la IA por dentro.
  // No llevan número del guion (se marcan «IA 1» e «IA 2») para no correr la numeración 01–15.
  P({
    num: "IA 1",
    tramo: 0,
    titulo: "La IA no recuerda: vuelve a leer",
    bajada: "Cada respuesta sale solo de lo que entra en su ventana de contexto. La memoria persistente es texto que se vuelve a cargar.",
    nota: "▶ ×3: primero lo que se carga siempre, después lo de este caso y al final la conclusión del diagrama.",
    guion: {
      aprenden: "Cómo trabaja la IA por dentro: no recuerda; en cada respuesta relee todo lo que le cargan (la ventana de contexto).",
      decir: [
        "Un modelo de lenguaje no guarda recuerdos ni se modifica mientras lo usamos.",
        "En cada respuesta vuelve a leer todo lo que tiene en su «ventana de contexto»: las instrucciones de la aplicación, la memoria, los documentos, la conversación y nuestro pedido.",
        "La «memoria persistente» de ChatGPT o de Claude no es un recuerdo: es texto guardado que la aplicación vuelve a poner al principio de cada conversación.",
        "La ventana es grande pero finita, y cargar el expediente entero no garantiza una mejor respuesta: importa elegir qué entra.",
      ],
      preguntar: "¿Les pasó que la IA «se olvidó» de algo que le habían dicho en otro chat?",
      puente: "«Si todo es texto que se carga, ¿qué conviene guardar y qué conviene escribir cada vez?» → ▶",
    },
    clave: "La IA no se actualiza mientras la usamos: en cada respuesta relee su ventana de contexto. Lo que no está ahí, no existe para ella.",
    visual: "ventana",
    pasos: 3,
  }),
  P({
    num: "IA 2",
    tramo: 0,
    titulo: "Prompt, memoria y skills",
    bajada: "Lo que cambia en cada caso va en el pedido. Lo que se repite se guarda para reutilizarlo.",
    nota: "▶ ×3 muestra prompt, memoria y skill; ▶ final, la nota que lleva a COTIO.",
    guion: {
      aprenden: "Hay tres lugares para una instrucción: el prompt (cada vez), la memoria (siempre) y la skill (cuando la tarea lo pide).",
      decir: [
        "En la clase 2 armamos pedidos completos: rol, tarea, contexto, formato, fuentes y verificaciones. No hace falta reescribir todo cada vez.",
        "Prompt: lo que pedimos ahora, con los datos de este expediente.",
        "Memoria o instrucciones del proyecto: lo estable, que la aplicación carga siempre. Por ejemplo: dónde trabajamos y que cite documento y página.",
        "Skill: un paquete reutilizable para un tipo de tarea, con instrucciones, plantilla y ejemplos. La IA tiene a la vista solo su nombre y descripción, y la carga entera cuando el pedido coincide.",
        "Cada herramienta lo llama distinto (skills, proyectos, GPTs, Gems), pero la idea es la misma: guardar lo que se repite. Y para escribir una buena skill hay que saber describir el trabajo: eso hacemos hoy. Al final se llevan una, escrita.",
      ],
      preguntar: "¿Qué tarea del Tribunal repiten tanto que valdría la pena guardarla como skill?",
      puente: "«Empecemos por el trabajo: ¿qué hace el Tribunal cuando llega una apelación?» → ▶",
    },
    clave: "Lo que se repite se guarda (memoria o skill); lo que cambia en cada expediente va en el pedido.",
    visual: "skills",
    pasos: 4,
  }),
  P({
    num: "02",
    tramo: 1,
    titulo: "Una apelación llega al Tribunal",
    bajada: "La DGR ya decidió. Al Tribunal le corresponde revisar una decisión cuestionada.",
    nota: "▶ muestra el recorrido: carpeta de Rentas → apelación → Tribunal.",
    guion: {
      aprenden: "El Tribunal cumple una función revisora: no inspecciona ni sanciona; revisa una decisión cuestionada.",
      decir: [
        "Primero decide la administración: Rentas inspeccionó y aplicó una clausura de seis días.",
        "El contribuyente no está de acuerdo y apela. Ahí entra el Tribunal: revisa esa decisión.",
        "El Tribunal tiene otras competencias, pero hoy trabajamos un caso concreto: una apelación contra una clausura.",
      ],
      preguntar: "Cuando llega un recurso, ¿qué es lo primero que miran?",
      puente: "«¿Y cómo piensa el Tribunal un caso así?» → ▶",
    },
    clave: "El Tribunal no decide de cero: revisa lo que Rentas ya resolvió, a partir de lo que el contribuyente cuestiona.",
    cotio: [0],
    visual: "apelacion",
    pasos: 2,
  }),
  P({
    num: "03",
    tramo: 1,
    titulo: "¿Cómo piensa un caso el Tribunal?",
    bajada: "La decisión exige información, operaciones jurídicas y un resultado fundado.",
    nota: "▶ ×4 muestra cada pregunta: qué pasó · qué norma · qué está probado · qué falta.",
    guion: {
      aprenden: "Antes de usar IA, hay que saber cómo se razona el caso. Primero el problema; después las siglas.",
      decir: [
        "Pensemos en un juez laboral antes de fallar: necesita saber qué pasó, qué norma se aplica, qué está probado y qué falta.",
        "Con un recurso fiscal pasa lo mismo. Tenemos la resolución, el recurso y la contestación: cada pieza responde algunas preguntas y deja otras abiertas.",
        "Si no sabemos qué preguntarle al expediente, tampoco vamos a saber qué pedirle a la IA.",
      ],
      preguntar: "¿Cuál de estas cuatro preguntas les lleva más tiempo en un expediente real?",
      puente: "«Para ordenar estas preguntas usamos un modelo de cinco partes: COTIO» → ▶",
    },
    clave: "Antes de usar IA: ¿qué pasó?, ¿qué norma se aplica?, ¿qué está probado?, ¿qué falta? Ese razonamiento es el que vamos a describir.",
    visual: "comoPiensa",
    pasos: 4,
  }),
  P({
    num: "04",
    tramo: 1,
    titulo: "COTIO: diseñar el razonamiento",
    bajada: "Contexto, Objetivo, Tarea, Input y Output: cinco decisiones para organizar el trabajo con IA.",
    nota: "▶ ×5 muestra cada letra.",
    guion: {
      aprenden: "Los cinco elementos de COTIO, con foco en dos: la T es el procesamiento y la I son las variables relevantes.",
      decir: [
        "C, Contexto: quién decide, con qué función, competencia, procedimiento y fuentes.",
        "O, Objetivo: qué queremos lograr. Hoy, un análisis inicial ordenado; no un fallo.",
        "T, Tarea: el procesamiento. Aislar agravios, comparar posiciones, verificar. No es «pedirle algo» a la IA: son las operaciones jurídicas que hay que hacer.",
        "I, Input: los datos de este caso que hacen falta. No es «todo el expediente».",
        "O, Output: un producto controlable, como una ficha con fuentes y el estado de cada dato. No una sentencia.",
      ],
      puente: "«Empecemos por la C: el contexto» → ▶",
    },
    clave: "COTIO no le pide a la IA que decida: describe nuestro trabajo para que la IA ayude a ordenarlo.",
    cotio: TODO_COTIO,
    visual: "cotio",
    pasos: 5,
  }),
  P({
    num: "05",
    tramo: 1,
    titulo: "El contexto no es el expediente",
    bajada: "El marco institucional y normativo puede reutilizarse en muchos casos.",
    nota: "▶ muestra la carpeta del caso y la frase «la carpeta cambia; la biblioteca queda».",
    guion: {
      aprenden: "El contexto es reutilizable: se arma una vez y sirve para muchos expedientes.",
      decir: [
        "La biblioteca no cambia de un caso a otro: Código Tributario, procedimiento, reglamento del Tribunal, jurisprudencia, competencia.",
        "Lo que cambia es la carpeta: los hechos de cada expediente. Eso es el input.",
        "En la práctica: el contexto se escribe una vez y se reutiliza. No hace falta cargar todo el expediente para describirlo.",
        "Volviendo a la placa IA 2: el contexto es lo que guardaríamos en la memoria o en una skill; el input va en cada pedido.",
      ],
      puente: "«Probémoslo con el celular» → ▶ abre la Actividad 1",
    },
    clave: "Contexto: lo que se repite en todos los casos (Tribunal, normas, procedimiento). Input: los datos de este expediente.",
    cotio: [0],
    visual: "contexto",
    pasos: 2,
  }),
  P({
    num: "06",
    tramo: 1,
    titulo: "¿Contexto o input?",
    bajada: "No es lo mismo la regla que aplicamos que el dato concreto que necesitamos conocer.",
    nota: "ACTIVIDAD 1 (3 min). Se abre sola en los celulares. ▶ resultados por tarjeta; ▶ (o «💡 Mostrar devolución») la respuesta, aunque nadie haya votado. Sin puntos ni penalidades.",
    guion: {
      aprenden: "Distinguir el contexto (la regla que aplicamos) del input (el dato concreto del caso).",
      decir: [
        "En el celular tienen cuatro tarjetas: toquen si cada una es contexto o input.",
        "Devolución: A (competencia del Tribunal) y C (reglas del procedimiento) son contexto. B (fecha de la inspección) y D (días de clausura) son input.",
        "No es rígido: una norma especial también puede ayudar a definir el tipo de caso. Lo charlamos sin dogmatismo.",
      ],
      preguntar: "¿Alguien ubicó distinto alguna tarjeta? ¿Por qué?",
      puente: "«El contexto define el terreno de juego; el input son los datos que necesitamos examinar en este expediente» → ▶",
    },
    cotio: [0, 3],
    visual: "a1",
    pasos: 2,
    actividad: "tf3_a1",
  }),
  P({
    num: "07",
    tramo: 1,
    titulo: "El input define qué podemos analizar",
    bajada: "Cada tipo de expediente exige variables particulares, aunque el Tribunal sea el mismo.",
    nota: "↻ GIRO: cerrás la parte conceptual y entrás al expediente.",
    guion: {
      aprenden: "El input depende del tipo de caso: una clausura pide unos datos; ingresos brutos, otros.",
      decir: [
        "En una clausura importan el trabajador relevado, el acta y los días de sanción.",
        "En un caso de ingresos brutos importan la base imponible, la alícuota y el período.",
        "El marco es el mismo, pero las variables cambian. Y aunque una variable falte o no esté probada, igual hay que examinarla.",
      ],
      puente: "↻ Cierre de bloque: «Ahora entremos al caso» → ▶",
    },
    clave: "Mismo Tribunal, distinto expediente: otras variables. Aunque un dato falte o no esté probado, hay que examinarlo.",
    cotio: [3],
    visual: "input",
    pasos: 2,
    curva: "El contexto se reutiliza; el input cambia con cada expediente",
  }),
  P({
    num: "08",
    tramo: 2,
    titulo: "Seis días de clausura",
    bajada: "Un comercio recurre una sanción de Rentas por una presunta infracción registral.",
    nota: "D1 (resolución de Rentas) se libera sola en los celulares. ▶ destaca el motivo y la sanción.",
    guion: {
      aprenden: "Conocer el caso real, anonimizado, a partir de la resolución de Rentas (D1).",
      decir: [
        "Es un expediente real del Tribunal, anonimizado: el contribuyente es «Contribuyente A».",
        "El 17/01/2025 Rentas hizo un relevamiento y encontró tres personas trabajando sin acreditar su registración.",
        "Aplicó la clausura del establecimiento por seis días. El comercio apeló.",
        "Ya pueden abrir D1, la resolución de Rentas, en el celular.",
      ],
      preguntar: "Con esta sola hoja, ¿ya podríamos decidir?",
      puente: "«¿Qué datos necesita el Tribunal para revisar esta clausura?» → ▶ abre la Actividad 2",
    },
    clave: "El caso: Rentas clausuró por 6 días un comercio en el que encontró 3 personas trabajando sin registración acreditada. El comercio apeló.",
    cotio: [3],
    visual: "seisDias",
    pasos: 2,
    libera: ["D1"],
  }),
  P({
    num: "09",
    tramo: 2,
    titulo: "¿Qué datos necesitamos?",
    bajada: "Antes de argumentar, tenemos que identificar las variables esenciales de la controversia.",
    nota: "ACTIVIDAD 2 (4 min). D1 accesible en el celular («VER RESOLUCIÓN DGR»). ▶ porcentaje por variable; ▶ ficha «variable / ¿qué sabemos hoy?».",
    guion: {
      aprenden: "Identificar las variables necesarias y separarlas de lo accesorio. Necesario no quiere decir probado.",
      decir: [
        "Marquen en el celular qué datos necesita conocer el Tribunal. Pueden elegir varios.",
        "Devolución: de A a E son necesarias (conducta y norma, acta, descargo y prueba, sanción, situación registral). F, el color de la fachada, es accesoria.",
        "Clave: que una variable sea necesaria no significa que ya esté acreditada. La ficha muestra qué sabemos hoy de cada una.",
      ],
      preguntar: "¿Qué dato agregarían que no está en la lista?",
      puente: "«Ya sabemos qué buscar. Veamos qué dice cada parte» → ▶",
    },
    cotio: [3],
    visual: "a2",
    pasos: 2,
    actividad: "tf3_a2",
  }),
  P({
    num: "10",
    tramo: 2,
    titulo: "Una sanción, dos relatos",
    bajada: "El contribuyente cuestiona la decisión; la DGR responde. No son hechos probados por narrarse.",
    nota: "D2 (apelación) y D3 (contestación) se liberan solas en los celulares. ▶ muestra la columna de Rentas.",
    guion: {
      aprenden: "Separar lo que cada parte afirma de lo que está probado.",
      decir: [
        "El contribuyente dice que no se produjo su prueba, que Rentas no tiene competencia laboral y que la clausura es desproporcionada.",
        "Rentas responde que el descargo se trató y el acta es instrumento público; que su competencia surge de los arts. 80 y 9 del CTP; y que la sanción es tarifada: dos días por trabajador.",
        "Son dos versiones: las dos columnas dicen «alegado». Todavía no concluimos nada.",
        "Ya pueden abrir D2 y D3 en el celular.",
      ],
      preguntar: "¿Cuál de los tres agravios necesitaría más prueba para resolverse?",
      puente: "«¿Qué le pediríamos a la IA con estos dos relatos?» → ▶ abre la Actividad 3",
    },
    clave: "Que una parte lo afirme no lo vuelve un hecho probado: cada agravio se contrasta con la respuesta y con la prueba.",
    cotio: [2],
    visual: "dosRelatos",
    pasos: 2,
    libera: ["D2", "D3"],
  }),
  P({
    num: "11",
    tramo: 2,
    titulo: "La tarea es el procesamiento",
    bajada: "Comparar, distinguir, interpretar y comprobar: eso debe hacer la IA, no decidir por anticipado.",
    nota: "ACTIVIDAD 3 (4 min). ▶ votos; ▶ devolución. «🧾 Ver matriz» proyecta las dos filas preparadas. «🧩 Ver el prompt COTIO» proyecta el pedido marcado letra por letra (y aparece en los celulares para copiar); después «🤖 Ejecutar en vivo» lo corre con D1–D3 anonimizadas.",
    guion: {
      aprenden: "La tarea (T) es el procesamiento: comparar, distinguir, interpretar y comprobar. No decidir por anticipado.",
      decir: [
        "Elijan en el celular la mejor próxima tarea para la IA.",
        "Devolución: B, comparar agravios y respuestas e identificar la cuestión jurídica con sus fuentes. A anticipa la conclusión; C se queda corta; D toma como cierto lo que dice una parte.",
        "La matriz muestra el resultado de esa tarea: agravio, respuesta, pregunta jurídica y página de cada fuente.",
        "Con «🧩 Ver el prompt COTIO»: este es el pedido completo, marcado letra por letra. Cada bloque responde a una decisión. Ahora lo ejecutamos en vivo y vemos qué produce.",
        "En el celular tienen el asistente COTIO: eligen una tarea y una salida; responde solo con las piezas anonimizadas y cita la página.",
      ],
      preguntar: "¿Cómo verificarían que la IA citó bien la página?",
      puente: "«La tarea no es fallar: es descomponer qué plantea cada parte, qué debemos examinar y con qué fuentes» → ▶",
    },
    cotio: [2],
    visual: "a3",
    pasos: 2,
    actividad: "tf3_a3",
  }),
  P({
    num: "12",
    tramo: 3,
    titulo: "¿Qué sabemos de verdad?",
    bajada: "Una afirmación puede constar, estar controvertida o necesitar una comprobación adicional.",
    nota: "D4 (puro derecho) se libera sola. ▶ ×4 muestra cada ficha con su sello.",
    guion: {
      aprenden: "Clasificar el estado de cada dato antes de razonar con él.",
      decir: [
        "Consta: el relevamiento del 17/01/2025, con tres personas trabajando, está en D1 y en D3.",
        "Alegado: que dos de ellas serían una familiar y una amiga del titular lo afirma el contribuyente.",
        "Controvertido: si el acta tiene defectos lo discuten las partes.",
        "Pendiente: qué pasó después con esa relación laboral. No consta en D1 a D4.",
        "D4: el Tribunal declaró la cuestión de puro derecho, es decir, sin abrir a prueba. Eso no le impide pedir información para mejor proveer.",
      ],
      preguntar: "Si le damos todo esto a una IA sin estos estados, ¿qué riesgo hay?",
      puente: "«Con esto, ¿qué harían ustedes con el expediente?» → ▶ abre la Actividad 4",
    },
    clave: "Cada afirmación tiene un estado: consta en una pieza, está alegada, está controvertida o está pendiente de comprobar.",
    cotio: [3],
    visual: "sabemos",
    pasos: 4,
    libera: ["D4"],
  }),
  P({
    num: "13",
    tramo: 3,
    titulo: "Antes de resolver, una pregunta más",
    bajada: "La información que falta puede cambiar el camino jurídico del expediente.",
    nota: "↻ GIRO · ACTIVIDAD 4 (5 min). D5 sigue OCULTA. ▶ muestra las proporciones. «🔓 Revelar actuación real» (o ▶) cierra la votación, libera D5 y pasa a la 14.",
    guion: {
      aprenden: "Lo que falta también es un dato del análisis.",
      decir: [
        "Voten en el celular: con D1 a D4, ¿qué harían ahora?",
        "Todas las respuestas valen. No se trata de adivinar qué hicieron los vocales.",
        "Cuando cerremos la votación, vemos qué hizo realmente el Tribunal.",
      ],
      preguntar: "¿Qué dato les falta para estar seguros?",
      puente: "Tocá «🔓 Revelar actuación real» (o ▶): cierra la votación, libera D5 y pasa a la 14.",
    },
    cotio: [3],
    visual: "a4",
    pasos: 1,
    actividad: "tf3_a4",
    curva: "Lo que falta también es un dato del análisis",
  }),
  P({
    num: "14",
    tramo: 3,
    titulo: "El Tribunal pidió más información",
    bajada: "La medida para mejor proveer requiere constancias laborales y registrales durante dieciséis meses.",
    nota: "REVELACIÓN (D5 liberada). ▶ extracto · ▶ línea de 16 meses · ▶ ficha. En el celular, cada uno ve lo que votó.",
    guion: {
      aprenden: "Ver cómo un órgano real pide la información que falta antes de decidir.",
      decir: [
        "Antes de resolver, el Tribunal dictó una medida para mejor proveer.",
        "Pidió acreditar que la relación laboral con la trabajadora se mantuvo al menos 16 meses sin reducir el plantel, con los F.931 de ARCA y las altas y bajas.",
        "¿Por qué importa? El Tribunal lo vincula con el art. 80 del CTP: podría tener incidencia en la sanción. Pero no es una condonación comprobada ni una sentencia.",
        "La ficha muestra variable, evidencia, estado, fuente y posible efecto: ese es el tipo de producto (output) que buscamos.",
      ],
      preguntar: "¿Qué nuevo dato quería conocer el Tribunal y por qué podría importar?",
      puente: "«Juntemos todo: primero el método, después la decisión» → ▶",
    },
    clave: "El análisis mostró un dato faltante y el Tribunal lo pidió: constancias laborales de 16 meses. Todavía no hay sentencia.",
    cotio: [3, 4],
    visual: "mejorProveer",
    pasos: 3,
  }),
  P({
    num: "15",
    tramo: 4,
    titulo: "Primero el método. Después la decisión.",
    bajada: "COTIO nos ayuda a saber qué pedir, qué examinar y qué verificar antes de fundamentar una resolución.",
    nota: "▶ ×5 arma COTIO sobre el caso.",
    guion: {
      aprenden: "Recapitular COTIO aplicado al caso y llevarlo a otros expedientes.",
      decir: [
        "C: el Tribunal y el recurso contra una clausura de Rentas.",
        "O: un análisis inicial ordenado, no un fallo.",
        "T: contrastar posiciones y examinar hechos, normas y prueba.",
        "I: las variables de la clausura, con su estado: consta, alegado, controvertido, pendiente.",
        "O: una ficha controlable con fuentes. La resolución sigue sin escribir: eso es la clase 5; los números y registros, la clase 4.",
      ],
      preguntar: "¿En qué tipo de expediente de su trabajo lo aplicarían primero?",
      puente: "«Y ahora, lo que se llevan» → ▶ la skill escrita con COTIO",
    },
    clave: "Primero describimos el trabajo con COTIO; después la IA ayuda a ordenarlo. La decisión sigue siendo humana.",
    cotio: TODO_COTIO,
    visual: "metodo",
    pasos: 5,
  }),
  { t: "skill", tramo: 4 },
  { t: "matriz", tramo: 4 },
];

/** Lo que aprenden hoy (pantalla de ingreso y mapa del control). */
export const TF3_APRENDEN = [
  "Distinguir el contexto que se repite (Tribunal, normas, procedimiento) de los datos de cada expediente.",
  "Identificar qué necesita saber el Tribunal para revisar una clausura.",
  "Reconocer el estado de cada dato: consta, alegado, controvertido o pendiente.",
  "Usar la IA para ordenar un análisis controlable, con fuentes, sin pedirle que decida.",
];

/** Mapa de la clase para el docente (control). */
export const TF3_MAPA = {
  tesis: "Antes de pedirle a una IA que analice un recurso, hay que entender qué hace el Tribunal, qué información necesita y qué operaciones jurídicas realiza. COTIO describe ese trabajo; no automatiza la decisión.",
  pregunta: "¿Qué necesita saber y hacer un decisor para analizar jurídicamente una apelación contra una clausura?",
  caso: "Rentas clausuró por seis días un comercio porque en un relevamiento (17/01/2025) encontró tres personas trabajando sin registración acreditada (D1). El comercio apeló: prueba no producida, incompetencia de Rentas, desproporción (D2). Rentas contestó (D3). El Tribunal declaró la cuestión de puro derecho (D4) y, antes de resolver, pidió constancias laborales de dieciséis meses (D5). No hay sentencia.",
  noHoy: "Hoy NO: redactar sentencias (clase 5) ni analizar números o registros contables (clase 4).",
  recorrido: [
    { tramo: 0, placas: "01, IA 1 e IA 2", detalle: "recupero de la clase 2 y cómo trabaja la IA por dentro (memoria, prompt, skills)" },
    { tramo: 1, placas: "02–07", detalle: "Actividad 1 en la 06" },
    { tramo: 2, placas: "08–11", detalle: "Actividades 2 (09) y 3 (11) · D1, D2 y D3" },
    { tramo: 3, placas: "12–14", detalle: "Actividad 4 (13) y revelación de D5 (14)" },
    { tramo: 4, placas: "15, skill y matriz", detalle: "cierre: la skill que se llevan (copiar o descargar en el celular)" },
  ],
};

const GUION_INGRESO: Tf3Guion = {
  aprenden: "Entran a la app y saben para qué es la clase de hoy.",
  decir: [
    "Hoy trabajamos con un expediente real del Tribunal, anonimizado: una clausura de seis días que el comercio apeló.",
    "La idea no es que la IA decida. Es aprender a describir nuestro propio razonamiento para que la IA ayude a ordenarlo.",
    "Escaneen el QR: no hace falta nombre ni cuenta. Lo usan para votar y para leer el expediente.",
  ],
  puente: "Cuando la mayoría esté adentro: «Arranquemos por lo que nos quedó de la clase pasada» → ▶",
};

const GUION_SKILL: Tf3Guion = {
  aprenden: "Ver escrita una skill real hecha con COTIO, y llevársela.",
  decir: [
    "En la placa IA 2 dijimos que para escribir una buena skill hay que saber describir el trabajo. Acá está, escrita.",
    "1: una skill es una carpeta con un archivo, SKILL.md.",
    "2: el encabezado tiene el nombre y la descripción. Es lo único que la IA ve siempre: con eso decide cuándo usarla.",
    "3: el cuerpo son las instrucciones, ordenadas con COTIO: contexto, objetivo, tarea, qué variables buscar, la salida y los límites. Se carga solo cuando el pedido coincide.",
    "4: lo que no va son los datos del expediente. Llegan en cada pedido; la skill solo dice qué buscar. Es la diferencia entre contexto e input.",
    "La tienen en el celular: pueden copiarla o descargarla, con las instrucciones para usarla en Claude, ChatGPT o Gemini.",
  ],
  preguntar: "¿Qué cambiarían en esta skill para otro tipo de expediente, por ejemplo ingresos brutos?",
  puente: "«Y este es el mapa completo del expediente» → ▶ matriz COTIO",
};

const GUION_MATRIZ: Tf3Guion = {
  aprenden: "Llevarse el mapa: qué pedir, qué examinar y qué verificar.",
  decir: [
    "Esta es la matriz COTIO del expediente: sirve como plantilla para otros casos.",
    "La IA ayudó a ordenar, comparar y señalar lo que falta. No decidió.",
    "Próximas charlas: la 4, análisis contable y probatorio; la 5, redacción y revisión de decisiones.",
  ],
  preguntar: "¿Qué se llevan para usar mañana?",
  puente: "Cierre y agradecimiento.",
};

/** Guion de cualquier pantalla. */
export function guionTf3(s: Tf3Slide): Tf3Guion {
  return s.t === "placa" ? s.guion : s.t === "ingreso" ? GUION_INGRESO : s.t === "skill" ? GUION_SKILL : GUION_MATRIZ;
}

/** Operación de la app en cualquier pantalla. */
export function notaTf3(s: Tf3Slide): string {
  if (s.t === "placa") return s.nota;
  if (s.t === "ingreso") return "Pedí que escaneen el QR y dejen el celular a mano. La pantalla cuenta cuántos entraron.";
  if (s.t === "skill") return "▶ ×4 arma la anatomía: carpeta y encabezado → contexto, objetivo y tarea → input, output y límites → lo que no va. En los celulares aparece «Lo que te llevás» para copiar o descargar.";
  return "Si querés guardar las respuestas, «⬇ Exportar respuestas (CSV)» más abajo.";
}

/** Número visible de una placa: «03 / 15» o, en las de introducción, «IA 1 de 2». */
export function marcaTf3(p: Tf3Placa): string {
  return p.num.startsWith("IA") ? `${p.num} de 2` : `${p.num} / 15`;
}

export function tituloTf3(s: Tf3Slide): string {
  if (s.t === "ingreso") return "Ingreso con QR";
  if (s.t === "matriz") return "Matriz COTIO del expediente";
  if (s.t === "skill") return "La skill que se llevan";
  const a = s.actividad ? getTf3Actividad(s.actividad) : undefined;
  return `${s.num} · ${a ? `📱 ${a.numero} · ` : ""}${s.titulo}`;
}

// --- Chatbot de la clase ----------------------------------------------------------------------------------

/** Instrucción de sistema del documento rector (sección 11). */
export const TF3_SISTEMA =
  "Sos un asistente de análisis jurídico didáctico del Tribunal Fiscal de Apelación de Tucumán. No decidís recursos ni redactás resoluciones finales. Distinguís alegaciones, hechos que constan documentalmente, hechos controvertidos, inferencias e información pendiente. Cada afirmación relativa al expediente debe indicar documento y página; si la pieza no permite corroborar un dato, declaralo. No inventes hechos, normas, jurisprudencia o resultados. Al comparar posiciones, representá fielmente ambas. Para tareas con datos no necesarios, recomendá minimización.";

/**
 * Prompt COTIO de la demo en vivo (placa 11): se proyecta marcado letra por letra («🧩 Ver el prompt
 * COTIO») y es exactamente el pedido que recibe el chatbot al «🤖 Ejecutar en vivo».
 */
export const TF3_PROMPT_DEMO = [
  { letra: "C", nombre: "Contexto", texto: "Tribunal Fiscal de Apelación de Tucumán. Recurso de apelación contra una clausura de seis días aplicada por la DGR por presunta falta de registración laboral." },
  { letra: "O", nombre: "Objetivo", texto: "Un análisis jurídico inicial y organizado del recurso. No decidas ni redactes la resolución." },
  { letra: "T", nombre: "Tarea", texto: "Compará dos agravios del recurrente con la respuesta de la DGR (1. competencia para fiscalizar; 2. tratamiento de la prueba testimonial) e identificá la pregunta jurídica de cada uno." },
  { letra: "I", nombre: "Input", texto: "Usá solamente las piezas anonimizadas D1 (resolución de la DGR), D2 (apelación) y D3 (contestación de la DGR)." },
  {
    letra: "O",
    nombre: "Output",
    texto: "Una tabla de dos filas con las columnas: agravio del recurrente | respuesta de la DGR | pregunta jurídica | fuente (documento y página). Cada celda con 20 palabras como máximo, sin citas literales. Si no podés ubicar la página, escribí «verificar página». No digas qué parte tiene razón. Respondé solo con la tabla.",
  },
];

export const TF3_PEDIDO_DEMO = TF3_PROMPT_DEMO.map((b) => `${b.nombre.toUpperCase()}: ${b.texto}`).join("\n");

// --- Skill del cierre --------------------------------------------------------------------------------------
// Lo que se llevan: una skill escrita con COTIO para recursos contra clausuras. Es genérica (sin datos del
// caso): guarda contexto, objetivo, tarea, qué variables buscar y la salida; los datos llegan en cada pedido.
// Se proyecta como anatomía (carpeta → encabezado → cuerpo) y se copia o descarga desde el celular.

export interface Tf3SeccionSkill {
  letra: string;
  nombre: string;
  /** Aclaración corta junto al nombre (proyección). */
  aclaracion?: string;
  /** Paso del revelado en que aparece en la proyección. */
  paso: number;
  /** Fichas cortas que se proyectan. */
  fichas: string[];
  /** Las fichas forman una fila de tabla (la salida). */
  tabla?: boolean;
  /** Línea corta bajo las fichas (proyección). */
  nota?: string;
  /** Texto completo en el SKILL.md. */
  md: string[];
}

export const TF3_SKILL = {
  carpeta: "analisis-recurso-clausura",
  nombre: "analisis-recurso-clausura",
  descripcion:
    "Análisis jurídico inicial de un recurso de apelación contra una clausura aplicada por la Dirección General de Rentas, ante el Tribunal Fiscal de Apelación de Tucumán. Usala cuando se pida ordenar agravios, comparar posiciones, identificar variables o el estado de la prueba de un expediente de clausura. No decide el recurso ni redacta la resolución.",
  titulo: "Análisis inicial de un recurso contra una clausura",
  secciones: [
    {
      letra: "C",
      nombre: "Contexto",
      paso: 1,
      fichas: ["Tribunal Fiscal de Apelación de Tucumán", "función revisora", "recurso contra una clausura de la DGR", "solo fuentes citables"],
      md: [
        "- Órgano: Tribunal Fiscal de Apelación de Tucumán, en su función revisora.",
        "- Caso tipo: recurso de apelación contra una sanción de clausura aplicada por la Dirección General de Rentas (DGR).",
        "- Fuentes: el Código Tributario de Tucumán y su procedimiento. Usá solo normas y precedentes que el usuario aporte o que puedas citar con una fuente comprobable.",
      ],
    },
    {
      letra: "O",
      nombre: "Objetivo",
      paso: 1,
      fichas: ["análisis inicial, organizado y controlable", "no decidir", "no redactar"],
      md: ["Producir un análisis jurídico inicial, organizado y controlable del recurso. No decidir ni redactar la resolución: eso lo hacen las personas."],
    },
    {
      letra: "T",
      nombre: "Tarea",
      paso: 1,
      fichas: ["1 · acto impugnado", "2 · aislar agravios", "3 · comparar con la DGR", "4 · estado de cada hecho", "5 · cuestión jurídica", "6 · qué falta comprobar"],
      md: [
        "1. Identificá el acto impugnado: qué se sancionó, con qué norma, con qué duración y alcance.",
        "2. Aislá los agravios del recurrente, uno por uno.",
        "3. Para cada agravio, compará lo que plantea el recurrente con lo que responde la DGR, representando fielmente ambas posiciones.",
        "4. Clasificá cada hecho según su estado (ver Input).",
        "5. Formulá la cuestión jurídica que plantea cada agravio.",
        "6. Señalá qué información falta y qué constancia permitiría comprobarla.",
      ],
    },
    {
      letra: "I",
      nombre: "Input",
      aclaracion: "qué buscar; los datos llegan en cada pedido",
      paso: 2,
      fichas: ["conducta imputada", "acta: qué constata", "norma del deber y de la sanción", "situación registral", "fundamentos y duración", "agravios", "prueba ofrecida y faltante", "respuesta de la DGR", "cuestiones procesales", "condiciones de reducción"],
      nota: "estado: consta · alegado · controvertido · pendiente · no aplica — con documento y página",
      md: [
        "En cada pedido, el usuario aporta las piezas del expediente, anonimizadas. Buscá en ellas estas variables:",
        "",
        "- Conducta imputada y modalidad de la infracción.",
        "- Sujeto sancionado y vínculo con el establecimiento.",
        "- Fecha, lugar y circunstancias de la constatación.",
        "- Acta de inspección: qué constata y qué no.",
        "- Norma que establece el deber y norma que prevé la sanción (texto y vigencia).",
        "- Situación registral de las personas relevadas.",
        "- Fundamentos, duración y alcance de la clausura.",
        "- Descargo y agravios del recurrente, por cuestión.",
        "- Prueba ofrecida, producida, rechazada y faltante.",
        "- Respuesta de la DGR a cada agravio.",
        "- Cuestiones procesales y decisiones interlocutorias.",
        "- Condiciones legales de reducción o condonación que puedan aplicarse, y los datos que permitirían corroborarlas.",
        "",
        "A cada variable asignale un estado (consta en pieza, alegado, controvertido, pendiente o no aplica) e indicá siempre documento y página.",
      ],
    },
    {
      letra: "O",
      nombre: "Output",
      paso: 2,
      tabla: true,
      fichas: ["variable", "evidencia", "estado", "fuente", "efecto posible"],
      nota: "si no ubicás la página: «verificar página»",
      md: [
        "Una ficha por variable o por agravio, con estas columnas:",
        "",
        "variable | evidencia | estado | fuente (documento y página) | posible efecto jurídico (a verificar)",
        "",
        "Si no podés ubicar la página, escribí «verificar página».",
      ],
    },
    {
      letra: "!",
      nombre: "Límites",
      paso: 2,
      fichas: ["no decide", "no redacta", "no inventa normas", "alegar no es probar", "solo piezas anonimizadas"],
      md: [
        "- No decidas el recurso ni digas qué parte tiene razón.",
        "- No redactes la resolución.",
        "- No inventes hechos, normas ni jurisprudencia; si un dato no surge de las piezas, decilo.",
        "- Lo que afirma una parte no es un hecho probado.",
        "- Trabajá solo con piezas anonimizadas y pedí el mínimo de datos necesario.",
      ],
    },
  ] as Tf3SeccionSkill[],
  /** Cómo usarla en cada herramienta (celular). */
  uso: [
    "Claude: guardá el texto como SKILL.md dentro de una carpeta llamada analisis-recurso-clausura, comprimí la carpeta en .zip y subila en la sección Skills de la configuración.",
    "ChatGPT: pegá el texto (sin el encabezado entre ---) en las instrucciones de un proyecto o de un GPT.",
    "Gemini: creá un Gem y pegá el texto como instrucciones.",
    "En cada pedido, adjuntá las piezas anonimizadas del expediente: ese es el input.",
  ],
};

/** Encabezado del SKILL.md (lo que la IA ve siempre). */
export const TF3_SKILL_ENCABEZADO = `---\nname: ${TF3_SKILL.nombre}\ndescription: ${TF3_SKILL.descripcion}\n---`;

/** Texto completo del SKILL.md. */
export function skillMd(): string {
  const cuerpo = TF3_SKILL.secciones.map((s) => [`## ${s.letra === "!" ? "" : `${s.letra} · `}${s.nombre}`, "", ...s.md].join("\n"));
  return [TF3_SKILL_ENCABEZADO, "", `# ${TF3_SKILL.titulo}`, "", ...cuerpo.flatMap((c) => [c, ""])].join("\n").trimEnd() + "\n";
}

/**
 * Asistente COTIO del celular: el participante arma el pedido tocando (Tarea, Input = piezas
 * liberadas, Output) y ve cómo queda; el Contexto y el Objetivo son fijos. Sin teclado.
 */
export const TF3_ASISTENTE = {
  contexto: "Tribunal Fiscal de Apelación de Tucumán · recurso contra una clausura de la DGR",
  objetivo: "Un análisis jurídico inicial organizado. No decidir ni redactar la resolución.",
  tareas: [
    { id: "agravios", label: "Aislar los agravios", pedido: "Identificá y separá los agravios del recurrente, uno por uno." },
    { id: "comparar", label: "Comparar agravio y respuesta de la DGR", pedido: "Para cada agravio, compará lo que plantea el recurrente con lo que responde la DGR, representando fielmente ambas posiciones." },
    { id: "estados", label: "Clasificar qué consta, qué está alegado y qué está controvertido", pedido: "Clasificá las afirmaciones relevantes según consten en una pieza, estén solo alegadas, estén controvertidas o pendientes." },
    { id: "falta", label: "Detectar qué información falta", pedido: "Detectá qué información necesaria para analizar el recurso no consta todavía en las piezas y por qué podría importar." },
    { id: "cuestiones", label: "Formular las cuestiones jurídicas", pedido: "Formulá las preguntas jurídicas que el Tribunal tendría que responder, sin responderlas." },
  ],
  salidas: [
    { id: "tabla", label: "Tabla con documento y página", pedido: "Respondé solo con una tabla breve en markdown (máximo 4 filas, cada celda con 30 palabras como máximo); incluí siempre documento y página." },
    { id: "lista", label: "Lista breve", pedido: "Respondé con una lista breve (máximo 6 puntos), cada uno con documento y página." },
    { id: "ficha", label: "Ficha de control", pedido: "Respondé con una ficha: variable, qué dice cada pieza (documento y página), estado y qué hay que verificar." },
  ],
};

export function armarPedidoCotio(tarea: string, salida: string, piezas: Tf3DocId[]): string | null {
  const t = TF3_ASISTENTE.tareas.find((x) => x.id === tarea);
  const o = TF3_ASISTENTE.salidas.find((x) => x.id === salida);
  if (!t || !o || !piezas.length) return null;
  return [
    `CONTEXTO: ${TF3_ASISTENTE.contexto}.`,
    `OBJETIVO: ${TF3_ASISTENTE.objetivo}`,
    `TAREA: ${t.pedido}`,
    `INPUT: usá solamente las piezas ${piezas.join(", ")}.`,
    `OUTPUT: ${o.pedido} No adelantes la decisión ni digas qué parte tiene razón.`,
  ].join("\n");
}

export const TF3_CONFIG: ClaseVivoConfig = {
  slug: TF3_SLUG,
  titulo: TF3_TITULO,
  materia: "Tribunal Fiscal de la Provincia de Tucumán · Tercera charla del ciclo",
  autor: "Mario Rodolfo Leal · Marco Rossi · Franco Orellana",
  cargo: "Ciclo de inteligencia artificial 2026",
  poll: { alumno: 3500, alumnoMe: 20000, deck: 2500 },
  getActividad: getTf3Vivo,
  anonimo: true,
  aviso: "No hace falta crear una cuenta ni dar tu nombre. En la pantalla solo se ven resultados agrupados.",
};
