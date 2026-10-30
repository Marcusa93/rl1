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
  { nombre: "Lo que nos quedó", minutos: 6 },
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
/** Aviso que habilita proyectar el recupero (Marco validó los datos de la clase 2). */
export const TF3_AVISO_RECUPERO = "recupero-validado";

export const TF3_NOTA_ANONIMIZACION =
  "Transcripción anonimizada del expediente para uso docente: se reemplazaron nombres, CUIT/DNI, domicilios, profesionales particulares, números de expediente y firmas. Se conservan fechas, normas, agravios y la numeración de páginas del original.";

// --- Recupero de la clase 2 (datos REALES de la app, 23/10/2026) -------------------------------------
// Fuente: respuestas guardadas en la app de la clase 2 (agregadas, sin nombres). La nube de palabras
// (actividad 1) no registró respuestas en la app: no se muestra. Se proyecta solo cuando Marco lo valida
// desde el control (aviso `recupero-validado`).

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

export interface Tf3Placa {
  t: "placa";
  num: string;
  titulo: string;
  bajada: string;
  /** Lo que se dice (nota de conducción, solo en el celular de control). */
  nota: string;
  tramo: number;
  visual: Tf3Visual;
  pasos: number;
  actividad?: Tf3ActKey;
  /** Texto circular: SOLO en las placas de giro (07 y 13). */
  curva?: string;
  /** Piezas del expediente que se liberan en los celulares al llegar. */
  libera?: Tf3DocId[];
}

export type Tf3Slide = Tf3Placa | { t: "ingreso"; tramo: number } | { t: "matriz"; tramo: number };

const P = (p: Omit<Tf3Placa, "t">): Tf3Placa => ({ t: "placa", ...p });

export const TF3_SLIDES: Tf3Slide[] = [
  { t: "ingreso", tramo: 0 },
  P({
    num: "01",
    tramo: 0,
    titulo: "¿Qué nos quedó de la clase pasada?",
    bajada: "Antes de avanzar, recuperamos lo que aprendimos al darle contexto e instrucciones a una IA.",
    nota: "Recupero con datos reales de la app de la clase 2 (agregados, sin nombres). Recuperar hallazgos concretos, no repetir definiciones. Puente: «Ya sabemos dar mejores instrucciones. ¿Sabemos qué información necesita el Tribunal para resolver?».\n\nLos números se proyectan solo si los validaste: botón «✓ Datos de la clase 2 validados».",
    visual: "recupero",
    pasos: 4,
  }),
  P({
    num: "02",
    tramo: 1,
    titulo: "Una apelación llega al Tribunal",
    bajada: "La DGR ya decidió. Al Tribunal le corresponde revisar una decisión cuestionada.",
    nota: "Función revisora: diferencia entre la decisión administrativa y la revisión recursiva. Hay otras competencias, pero este caso es una apelación de clausura.",
    visual: "apelacion",
    pasos: 2,
  }),
  P({
    num: "03",
    tramo: 1,
    titulo: "¿Cómo piensa un caso el Tribunal?",
    bajada: "La decisión exige información, operaciones jurídicas y un resultado fundado.",
    nota: "Analogía: reconstruir qué necesita saber un juez laboral antes de fallar. Introducir el problema antes de las siglas.",
    visual: "comoPiensa",
    pasos: 4,
  }),
  P({
    num: "04",
    tramo: 1,
    titulo: "COTIO: diseñar el razonamiento",
    bajada: "Contexto, Objetivo, Tarea, Input y Output: cinco decisiones para organizar el trabajo con IA.",
    nota: "Definir los cinco elementos. Destacar: T es el procesamiento (no un pedido textual) e I es el conjunto de variables jurídicamente relevantes.",
    visual: "cotio",
    pasos: 5,
  }),
  P({
    num: "05",
    tramo: 1,
    titulo: "El contexto no es el expediente",
    bajada: "El marco institucional y normativo puede reutilizarse en muchos casos.",
    nota: "Función del Tribunal, competencias, reglas y fuentes: por qué no se confunden con los hechos propios del caso.",
    visual: "contexto",
    pasos: 2,
  }),
  P({
    num: "06",
    tramo: 1,
    titulo: "¿Contexto o input?",
    bajada: "No es lo mismo la regla que aplicamos que el dato concreto que necesitamos conocer.",
    nota: "ACTIVIDAD 1 (3 min). Se abre sola. ▶ resultados por tarjeta; ▶ devolución (A y C contexto; B y D input), aunque nadie haya respondido. Sin puntos ni penalidades: una norma especial también puede especificar el tipo de caso.\n\nCierre (20 s): «El contexto define el terreno de juego; el input son los datos que necesitamos examinar en este expediente».",
    visual: "a1",
    pasos: 2,
    actividad: "tf3_a1",
  }),
  P({
    num: "07",
    tramo: 1,
    titulo: "El input define qué podemos analizar",
    bajada: "Cada tipo de expediente exige variables particulares, aunque el Tribunal sea el mismo.",
    nota: "↻ GIRO: cerrar la distinción general y entrar al caso. Comparar clausura con ingresos brutos. Una variable puede estar ausente o no probada y aun así ser indispensable examinarla.",
    visual: "input",
    pasos: 2,
    curva: "El contexto se reutiliza; el input cambia con cada expediente",
  }),
  P({
    num: "08",
    tramo: 2,
    titulo: "Seis días de clausura",
    bajada: "Un comercio recurre una sanción de Rentas por una presunta infracción registral.",
    nota: "Presentar D1 (se libera sola en los celulares): origen del procedimiento y estado del caso, sin adelantar la medida para mejor proveer.",
    visual: "seisDias",
    pasos: 2,
    libera: ["D1"],
  }),
  P({
    num: "09",
    tramo: 2,
    titulo: "¿Qué datos necesitamos?",
    bajada: "Antes de argumentar, tenemos que identificar las variables esenciales de la controversia.",
    nota: "ACTIVIDAD 2 (4 min) con D1 accesible («VER RESOLUCIÓN DGR» en el celular). ▶ porcentaje por variable; ▶ ficha «variable necesaria / ¿qué sabemos hoy?».\n\nDecir: «Que una variable sea necesaria no significa que la parte que la invoca ya la haya acreditado». La matriz no atribuye cargas probatorias.",
    visual: "a2",
    pasos: 2,
    actividad: "tf3_a2",
  }),
  P({
    num: "10",
    tramo: 2,
    titulo: "Una sanción, dos relatos",
    bajada: "El contribuyente cuestiona la decisión; la DGR responde. No son hechos probados por narrarse.",
    nota: "Se liberan D2 y D3. Extraer agravios y réplicas, sin pasar todavía a conclusiones.",
    visual: "dosRelatos",
    pasos: 2,
    libera: ["D2", "D3"],
  }),
  P({
    num: "11",
    tramo: 2,
    titulo: "La tarea es el procesamiento",
    bajada: "Comparar, distinguir, interpretar y comprobar: eso debe hacer la IA, no decidir por anticipado.",
    nota: "ACTIVIDAD 3 (4 min), D2 y D3 ya liberadas. ▶ votos; ▶ devolución (B es la adecuada ahora). «🧾 Ver matriz» proyecta las dos filas preparadas, independiente del voto. «🤖 Ejecutar en vivo» corre una variante con el chatbot (solo piezas anonimizadas).\n\nCierre: «La tarea no es fallar. Es descomponer: qué plantea cada parte, qué debemos examinar y con qué fuentes».",
    visual: "a3",
    pasos: 2,
    actividad: "tf3_a3",
  }),
  P({
    num: "12",
    tramo: 3,
    titulo: "¿Qué sabemos de verdad?",
    bajada: "Una afirmación puede constar, estar controvertida o necesitar una comprobación adicional.",
    nota: "Se libera D4 (puro derecho). Examen preliminar de la documentación y sus límites; relación entre la declaración de puro derecho y las facultades para mejor proveer, sin prejuzgar.",
    visual: "sabemos",
    pasos: 4,
    libera: ["D4"],
  }),
  P({
    num: "13",
    tramo: 3,
    titulo: "Antes de resolver, una pregunta más",
    bajada: "La información que falta puede cambiar el camino jurídico del expediente.",
    nota: "↻ GIRO · ACTIVIDAD 4 (5 min). D1–D4 liberadas; D5 OCULTA. ▶ proporciones de la votación. Para revelar: «🔓 Revelar actuación real» (o ▶): cierra la votación, libera D5 y pasa a la 14.\n\nNo presentar B como la única decisión obligatoria. No se trata de adivinar qué votaron los vocales.",
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
    nota: "REVELACIÓN de la Actividad 4 (D5 liberada). «El Tribunal dictó una medida para mejor proveer y solicitó documentación relativa a continuidad de la relación laboral y mantenimiento del incremento de dotación durante dieciséis meses». ▶ extracto · ▶ línea de 16 meses · ▶ ficha.\n\nPreguntar: «¿Qué nuevo dato quería conocer y por qué podría importar?». No es condonación comprobada ni sentencia definitiva.",
    visual: "mejorProveer",
    pasos: 3,
  }),
  P({
    num: "15",
    tramo: 4,
    titulo: "Primero el método. Después la decisión.",
    bajada: "COTIO nos ayuda a saber qué pedir, qué examinar y qué verificar antes de fundamentar una resolución.",
    nota: "Recapitular los cinco elementos anclados al caso; transferir a otro tipo de expediente; puente a las clases 4 (análisis contable y probatorio) y 5 (redacción). Producto: mapa de variables y tareas, no sentencia.",
    visual: "metodo",
    pasos: 5,
  }),
  { t: "matriz", tramo: 4 },
];

export function tituloTf3(s: Tf3Slide): string {
  if (s.t === "ingreso") return "Ingreso con QR";
  if (s.t === "matriz") return "Matriz COTIO del expediente";
  const a = s.actividad ? getTf3Actividad(s.actividad) : undefined;
  return `${s.num} · ${a ? `📱 ${a.numero} · ` : ""}${s.titulo}`;
}

// --- Chatbot de la clase ----------------------------------------------------------------------------------

/** Instrucción de sistema del documento rector (sección 11). */
export const TF3_SISTEMA =
  "Sos un asistente de análisis jurídico didáctico del Tribunal Fiscal de Apelación de Tucumán. No decidís recursos ni redactás resoluciones finales. Distinguís alegaciones, hechos que constan documentalmente, hechos controvertidos, inferencias e información pendiente. Cada afirmación relativa al expediente debe indicar documento y página; si la pieza no permite corroborar un dato, declaralo. No inventes hechos, normas, jurisprudencia o resultados. Al comparar posiciones, representá fielmente ambas. Para tareas con datos no necesarios, recomendá minimización.";

export const TF3_PEDIDO_DEMO =
  "Con las piezas D1, D2 y D3, armá una matriz de dos filas: 1) competencia para fiscalizar y 2) tratamiento de la prueba testimonial. Columnas: agravio del recurrente | respuesta de la DGR | pregunta jurídica | fuente (documento y página). Cada celda con 20 palabras como máximo. Sin citas literales. Si no podés ubicar la página, escribí «verificar página». No adelantes la decisión ni digas qué parte tiene razón. Respondé solo con la tabla."

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
