// ============================================================
// Tribunal Fiscal · Segunda charla: "Cómo formular instrucciones y
// verificar resultados" (120 minutos). Guion de Mario Rodolfo Leal,
// Marco Rossi y Franco Orellana (documento del 22/10/2026).
//
// La app es el entorno ÚNICO de la clase: proyecta las 31 placas y recibe
// la participación desde los celulares. Cinco intervenciones integradas al
// flujo docente:
//   02 · Nube de palabras (¿qué hizo fallar las instrucciones al robot?)
//   07 · Laboratorio de prompts (chatbot: pedido simple → estructurado)
//   15 · Contexto en comparación (misma tarea, mismo modelo, otro contexto)
//   26 · Humano o IA (tres textos de autoría conocida)
//   29 · Desafío final (instrucción reutilizable + prueba + ficha)
//
// Estética: collage editorial de arqueología tecnológica sobre papel
// cálido; lo "tech" está en la experiencia (revelado, tableros en vivo,
// chatbot), no en fondos oscuros ni neón. Texto circular SOLO en las
// placas de curva (11, 16, 22, 27).
//
// El texto de las placas (títulos, bajadas y notas) es literal del guion.
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";

export const TF2_SLUG = "tribunal-fiscal-2";
export const TF2_TITULO = "Cómo formular instrucciones y verificar resultados";
export const TF2_TESIS =
  "No se trata de preguntar mejor solamente: se trata de dirigir procesos, dar contexto pertinente, usar fuentes, registrar y comprobar.";

// --- Bloques (120 minutos) --------------------------------------------------------------------

export interface Tf2Bloque {
  nombre: string;
  minutos: number;
}

export const TF2_BLOQUES: Tf2Bloque[] = [
  { nombre: "El problema de entendernos", minutos: 12 },
  { nombre: "Aprender a dar instrucciones", minutos: 26 },
  { nombre: "Una IA que conoce nuestro trabajo", minutos: 20 },
  { nombre: "Fuentes, datos y trazabilidad", minutos: 24 },
  { nombre: "De la respuesta al documento", minutos: 18 },
  { nombre: "Hacia las tareas complejas", minutos: 20 },
];

// --- Chatbot de la clase: dos perfiles comparables ---------------------------------------------
// Mismo modelo y misma temperatura: solo cambia el contexto del sistema.

export const TF2_PERFILES = {
  A: {
    nombre: "Perfil A · generalista",
    sistema: "Sos un asistente de IA de uso general. Respondé en español, de manera útil y clara.",
  },
  B: {
    nombre: "Perfil B · contexto de trabajo",
    sistema: [
      "Sos un asistente para tareas de apoyo administrativo de un tribunal fiscal provincial.",
      "Destinatarios habituales: personas sin formación jurídica ni contable. Escribí en lenguaje claro, respetuoso y formal (trato de usted).",
      "No brindás asesoramiento ni anticipás decisiones del tribunal.",
      "Si la consulta es ambigua o falta información, preguntá o señalalo antes de suponer.",
      "Distinguí los hechos informados de tus inferencias.",
      "Citá fuentes solo si te fueron proporcionadas; si no, indicá qué debe verificarse en la fuente oficial.",
      "No inventes plazos, normas, números de expediente ni datos de contacto: marcalos entre corchetes para que una persona los complete.",
    ].join(" "),
  },
} as const;

export type Tf2Perfil = keyof typeof TF2_PERFILES;

/** Lo que el perfil B agrega respecto del A (se revela en la Actividad 3). */
export const TF2_DIFERENCIAS_B = [
  "Para quién trabaja: apoyo administrativo de un tribunal fiscal",
  "A quién le escribe: personas sin formación jurídica ni contable",
  "Tono: lenguaje claro y trato de usted",
  "Límite: no asesora ni anticipa decisiones",
  "Ante la duda: pregunta en lugar de suponer",
  "No inventa plazos, normas ni datos: los marca entre corchetes",
];

// --- Actividad 3: dos salidas preparadas (misma tarea, mismo modelo) ---------------------------
// Generadas con anthropic/claude-haiku-4.5 el 23/10/2026, temperatura 0,3. Plan B sin conexión.

export const TF2_A3 = {
  tarea:
    "Redactá una respuesta a este correo: «Hola, presenté un recurso hace unos meses y no tengo novedades. ¿En qué estado está y cuándo lo van a resolver? Gracias.»",
  modelo: "anthropic/claude-haiku-4.5",
  A: `Hola,

Agradezco tu consulta. Lamento que no hayas recibido actualizaciones sobre tu recurso.

Para poder brindarte información precisa sobre el estado actual y los plazos de resolución, necesitaría que me proporciones los siguientes datos:

- **Número de expediente o referencia** del recurso
- **Fecha de presentación**
- **Área o departamento** responsable

Una vez que cuente con esta información, podré:
1. Localizar tu solicitud en nuestro sistema
2. Verificar en qué etapa del proceso se encuentra
3. Informarte sobre los tiempos estimados de resolución

Te recomiendo que respondas con estos datos a la brevedad para agilizar la búsqueda.

Quedo atento a tu respuesta.

Saludos cordiales,`,
  B: `Estimado/a [NOMBRE],

Agradecemos su consulta respecto al estado de su recurso.

Para poder brindarle información precisa sobre el trámite de su expediente, necesitamos algunos datos:

- **Número de expediente** (si lo posee)
- **Fecha aproximada de presentación** del recurso
- **Tipo de recurso** presentado (apelación, recurso de revisión, etc.)
- **Nombre completo** del contribuyente o razón social

Una vez que cuente con esta información, podrá:

1. **Consultar el estado** a través de [SISTEMA DE CONSULTA DISPONIBLE - completar con datos locales]
2. **Comunicarse directamente** con [ÁREA/DEPENDENCIA RESPONSABLE - completar con datos locales] en el horario de atención [HORARIO - completar]
3. **Presentarse personalmente** en nuestras oficinas con la documentación mencionada

Respecto a los plazos de resolución, estos varían según la complejidad del caso y la carga de trabajo del tribunal.

(respuesta recortada por extensión)`,
};

// --- Actividad 4: tres textos de autoría conocida --------------------------------------------------
// Igual tema, extensión y tipografía. NO usar textos de personas sin su consentimiento.

export interface Tf2Texto {
  id: "a" | "b" | "c";
  texto: string;
  autoria: "humano" | "ia";
  /** Quién o qué lo escribió (se muestra al revelar). */
  origen: string;
  /** Rasgos para comentar al revelar. */
  rasgos: string;
}

/** El texto humano ya está cargado (si se reemplaza por otro, debe ser con consentimiento de quien lo escribió). */
export const TF2_TEXTO_HUMANO_PENDIENTE = false;

/**
 * Los tres textos son del mismo género y extensión: el relato del trámite de una
 * causa hasta el llamado a sentencia (el «resulta»), como los que se escriben en
 * el Tribunal. El humano es un fragmento real aportado por el equipo; los otros
 * dos los escribió una IA imitando ese registro. Fechas y fojas: sin datos de partes.
 */
export const TF2_A4_TEMA = "El trámite de una causa hasta el llamado a sentencia";
export const TF2_A4: Tf2Texto[] = [
  {
    id: "a",
    autoria: "ia",
    origen: "Escrito por una IA (Claude) con la consigna «relato del trámite de una causa del Tribunal hasta el llamado a sentencia, registro técnico, 50 palabras».",
    rasgos: "Vocabulario procesal correcto y bien ordenado: imita el estilo, pero ninguna de esas actuaciones existió.",
    texto:
      "Corrido traslado del recurso a la Dirección General de Rentas, el organismo lo contestó por escrito del 14/07/26. Producida la prueba ofrecida, por decreto del 04/08/26 se clausuró el período probatorio y pasaron los autos a despacho para resolver, providencia que notificada a las partes quedó firme, y",
  },
  {
    id: "b",
    autoria: "humano",
    origen: "Escrito por una persona: fragmento de una resolución, aportado por el equipo.",
    rasgos: "Fórmulas del oficio («alegó la accionada», «pasaron los autos a despacho»): las aprendemos las personas y también las imita la IA.",
    texto:
      "Por presentación de fecha 30/07/26 alegó la parte actora y por escrito del 31/07/26 alegó la accionada. Mediante decreto del 07/08/26 pasaron los autos a despacho para el dictado de sentencia definitiva, providencia que notificada a las partes dejó la causa en estado de ser resuelta, y",
  },
  {
    id: "c",
    autoria: "ia",
    origen: "Escrito por una IA (Claude) a la que se le pidió imitar a un relator del Tribunal, con fojas y fórmulas habituales.",
    rasgos: "Copia hasta las fojas y el «en término»: el registro técnico se puede imitar, y no prueba que alguien haya hecho el trámite.",
    texto:
      "A fs. 112 la recurrente presentó su alegato y a fs. 118 hizo lo propio la Dirección General de Rentas, ambos en término. Por decreto de fecha 12/08/26 se llamaron autos para sentencia, el que fue notificado a las partes y se encuentra firme, quedando la causa en condiciones de ser resuelta, y",
  },
];

// --- Actividad 5: desafío final ------------------------------------------------------------------

export type Tf2CampoId = "tarea" | "proposito" | "rol" | "contexto" | "fuentes" | "etapas" | "formato" | "verificaciones";

export interface Tf2Campo {
  id: Tf2CampoId;
  etiqueta: string;
  ayuda: string;
  ejemplo: string;
  /** Lo que queda en la instrucción si el campo está vacío. */
  vacio: string;
  /** Va en la misma pantalla que el campo anterior (el propósito, junto a la tarea). */
  junto?: boolean;
}

/** Los siete campos del asistente (sección 5): la tarea lleva su propósito en la misma pantalla. */
export const TF2_CAMPOS: Tf2Campo[] = [
  {
    id: "tarea",
    etiqueta: "Tarea concreta",
    ayuda: "Qué hay que hacer. Una tarea propia, permitida y sin datos reales.",
    ejemplo: "ordenar los expedientes que entraron en la semana para la reunión de secretaría",
    vacio: "[tarea concreta]",
  },
  {
    id: "proposito",
    etiqueta: "¿Con qué objetivo?",
    ayuda: "Para qué sirve el resultado (empezá con «de…»).",
    ejemplo: "de que cada vocalía sepa qué tiene pendiente y qué plazos vencen",
    vacio: "[propósito]",
    junto: true,
  },
  {
    id: "rol",
    etiqueta: "Rol del asistente y destinatario",
    ayuda: "Qué función cumple el asistente (una función, no una autoridad) y para quién trabaja.",
    ejemplo: "apoyo de la secretaría del Tribunal",
    vacio: "[rol funcional y destinatario]",
  },
  {
    id: "contexto",
    etiqueta: "Contexto permitido",
    ayuda: "Solo información no sensible y relevante. Nada de expedientes reales ni datos personales.",
    ejemplo: "que el Tribunal recibe recursos contra resoluciones de Rentas y los distribuye entre las vocalías",
    vacio: "[información no sensible y relevante]",
  },
  {
    id: "fuentes",
    etiqueta: "Fuentes permitidas",
    ayuda: "Con qué material puede trabajar: el texto que le pegues, fuentes públicas o autorizadas.",
    ejemplo: "el listado ficticio de expedientes que te pego a continuación",
    vacio: "[fuentes disponibles o autorizadas]",
  },
  {
    id: "etapas",
    etiqueta: "Etapas",
    ayuda: "En qué pasos conviene dividir la tarea.",
    ejemplo: "1) agrupar por vocalía, 2) ordenar por vencimiento, 3) señalar los datos que faltan",
    vacio: "[pasos]",
  },
  {
    id: "formato",
    etiqueta: "Formato de salida",
    ayuda: "Cómo querés recibir el resultado para poder revisarlo.",
    ejemplo: "una tabla con expediente, vocalía, próximo vencimiento y dato faltante",
    vacio: "[formato]",
  },
  {
    id: "verificaciones",
    etiqueta: "Verificaciones",
    ayuda: "Qué hay que controlar antes de usar el resultado.",
    ejemplo: "números de expediente, fechas de notificación y que no agregue expedientes que no estaban",
    vacio: "[elementos a verificar]",
  },
];

export type Tf2Valores = Partial<Record<Tf2CampoId, string>>;

const sinPunto = (s: string) => s.trim().replace(/[.;:\s]+$/, "");

/** Plantilla común (sección 6 del documento): la arma la app con los campos del participante. */
export function armarInstruccion(v: Tf2Valores): string {
  const c = (id: Tf2CampoId) => sinPunto(v[id] ?? "") || TF2_CAMPOS.find((x) => x.id === id)!.vacio;
  return [
    `Actuá como asistente de ${c("rol")} para ayudarme a ${c("tarea")} con el objetivo ${c("proposito")}.`,
    `El contexto necesario es ${c("contexto")}.`,
    `Trabajá exclusivamente con ${c("fuentes")}.`,
    `Dividí la tarea en ${c("etapas")}.`,
    "No supongas datos ausentes ni sustituyas decisiones humanas. Señalá dudas e inferencias.",
    `Respondé en ${c("formato")}.`,
    `Incluí una sección final con elementos a verificar (${c("verificaciones")}) y fuentes a cotejar.`,
  ].join(" ");
}

/** Campos que conviene completar (se puede enviar igual: la instrucción los deja entre corchetes). */
export const camposVacios = (v: Tf2Valores) => TF2_CAMPOS.filter((c) => !(v[c.id] ?? "").trim());

/** Controles de la ficha de trazabilidad (sección 6): cada uno, verificado o pendiente. */
export const TF2_CONTROLES = ["Nombres", "Fechas", "Montos", "Normas", "Citas", "Cálculos"] as const;
export type Tf2Control = (typeof TF2_CONTROLES)[number];
export type Tf2EstadoControl = "verificado" | "pendiente" | "no aplica";

/** Lo que guarda el celular en la Actividad 5 (respuesta `tf2_a5`). */
export interface Tf2A5 {
  campos: Tf2Valores;
  /** Instrucción final (editable a partir de la plantilla). */
  instruccion?: string;
  /** Versión del prompt: sube cada vez que se edita después de probarla. */
  version?: number;
  prueba?: { material: string; salida: string; t: number; perfil: string; instruccion?: string };
  controles?: Partial<Record<Tf2Control, Tf2EstadoControl>>;
  correcciones?: string;
  responsable?: string;
  /** Hasta dónde llegó: "campos" → "instruccion" → "prueba" → "ficha". */
  etapa?: "campos" | "instruccion" | "prueba" | "ficha";
}

/** Ficha de trazabilidad (sección 6) en texto: para copiar, descargar o proyectar. */
export function armarFicha(a: Tf2A5, perfilNombre: string): string {
  const t = a.prueba?.t ? new Date(a.prueba.t) : new Date();
  const fecha = t.toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" });
  const controles = TF2_CONTROLES.map((c) => `  · ${c}: ${a.controles?.[c] ?? "pendiente"}`).join("\n");
  return [
    "FICHA DE TRAZABILIDAD (prueba con datos ficticios)",
    `Marca temporal: ${fecha}`,
    `Herramienta / perfil: ${perfilNombre}`,
    `Versión del prompt: v${a.version ?? 1}`,
    `Materiales: ${!a.prueba ? "pendiente (todavía sin prueba)" : a.prueba.material?.trim() ? "ficticios, cargados por el participante" : "sin material: ejemplo ficticio generado"}`,
    `Salida de prueba: ${a.prueba?.salida ? `${a.prueba.salida.slice(0, 160).replace(/\s+/g, " ")}…` : "pendiente"}`,
    "Controles:",
    controles,
    `Correcciones: ${a.correcciones?.trim() || "—"}`,
    `Responsable del control: ${a.responsable?.trim() || "[completar]"}`,
    "No se conserva contenido fiscal sensible. Ninguna salida está validada institucionalmente.",
  ].join("\n");
}

/** El producto final completo, como texto descargable (funciona sin conexión). */
export function productoFinal(a: Tf2A5, perfilNombre: string): string {
  return [
    "TRIBUNAL FISCAL DE LA PROVINCIA DE TUCUMÁN · CICLO DE INTELIGENCIA ARTIFICIAL 2026",
    `Segunda charla · ${TF2_TITULO}`,
    "",
    "INSTRUCCIÓN REUTILIZABLE",
    a.instruccion?.trim() || armarInstruccion(a.campos),
    "",
    armarFicha(a, perfilNombre),
    ...(a.prueba?.salida ? ["", "SALIDA DE PRUEBA (datos ficticios, sin verificar)", a.prueba.salida] : []),
    "",
    "Antes de usarla: probala con datos ficticios, cotejá cada dato con su fuente y registrá lo que corregiste.",
  ].join("\n");
}

/** Texto de una respuesta del chatbot para leer en pantalla: sin marcas de markdown (#, **, ---). */
export function textoPlano(t: string): string {
  return t
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*(-{3,}|\*{3,}|_{3,})\s*$/gm, "")
    .replace(/^(\s*)[-*]\s+/gm, "$1• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// --- Actividad 2: laboratorio de prompts --------------------------------------------------------

export interface Tf2TareaA2 {
  id: string;
  label: string;
  /** El pedido simple (prompt A) que se propone para empezar. */
  simple: string;
  /** Datos ficticios que el pedido estructurado le puede dar. */
  datos: string;
}

/** Tareas ficticias para el laboratorio (el participante también puede escribir la suya). */
export const TF2_A2_TAREAS: Tf2TareaA2[] = [
  {
    id: "feria",
    label: "Aviso de la feria de enero",
    simple: "Escribí un aviso sobre la feria de enero del Tribunal.",
    datos: "feria del 2 al 31 de enero; los plazos se suspenden; hay guardia en mesa de entradas de 8 a 12 (datos ficticios)",
  },
  {
    id: "rentas",
    label: "Nota pidiendo un informe a Rentas",
    simple: "Escribí una nota para pedirle un informe a la Dirección General de Rentas.",
    datos: "Expte. 1234/2026 (ficticio); se necesita el informe de deuda actualizado; plazo para contestar: 10 días hábiles (datos ficticios)",
  },
  {
    id: "escrito",
    label: "Cómo presentar un escrito ante el Tribunal",
    simple: "Explicá cómo se presenta un escrito ante el Tribunal.",
    datos: "se presenta en mesa de entradas o por [canal oficial]; con una copia para el traslado; firmado por el contribuyente o su apoderado (datos ficticios)",
  },
];

export type Tf2CampoA2Id = "rol" | "tarea" | "contexto" | "fuentes" | "limites" | "formato";

/** Campos asistidos del pedido estructurado (prompt B): cada uno con sugerencias tocables. */
export const TF2_A2_CAMPOS: { id: Tf2CampoA2Id; etiqueta: string; ayuda: string; chips: string[] }[] = [
  {
    id: "rol",
    etiqueta: "Rol",
    ayuda: "Qué función cumple (no quién es).",
    chips: ["asistente de la mesa de entradas del Tribunal", "asistente de la secretaría", "asistente para ordenar expedientes"],
  },
  { id: "tarea", etiqueta: "Tarea", ayuda: "Qué tiene que hacer, con precisión.", chips: [] },
  {
    id: "contexto",
    etiqueta: "Contexto",
    ayuda: "Para quién es y en qué situación.",
    chips: ["lo lee el contribuyente que llega a mesa de entradas", "lo lee el personal de las vocalías", "va dirigido a la Dirección General de Rentas"],
  },
  {
    id: "fuentes",
    etiqueta: "Fuentes y datos",
    ayuda: "Con qué información trabaja.",
    chips: ["usá solo estos datos", "si falta un dato, marcalo entre corchetes"],
  },
  {
    id: "limites",
    etiqueta: "Límites",
    ayuda: "Lo que no tiene que hacer.",
    chips: ["no inventes fechas, plazos ni normas", "no anticipes decisiones del Tribunal", "máximo 120 palabras"],
  },
  {
    id: "formato",
    etiqueta: "Formato",
    ayuda: "Cómo querés recibirlo.",
    chips: ["título y tres puntos breves", "lenguaje claro y trato de usted", "al final, qué hay que verificar"],
  },
];

/** Pedido estructurado (prompt B) a partir de los campos asistidos. */
export function armarPedidoB(v: Partial<Record<Tf2CampoA2Id, string>>): string {
  return TF2_A2_CAMPOS.map((c) => [c.etiqueta, (v[c.id] ?? "").trim()] as const)
    .filter(([, x]) => x)
    .map(([k, x]) => `${k}: ${x}`)
    .join("\n");
}

/** Qué cambió entre la primera y la segunda salida (reflexión del participante, varias). */
export const TF2_A2_CAMBIOS = [
  { id: "datos", emoji: "📌", label: "Usó los datos que le di" },
  { id: "inventa", emoji: "🧩", label: "Inventó menos" },
  { id: "falta", emoji: "⬜", label: "Marcó lo que faltaba" },
  { id: "formato", emoji: "🧾", label: "El formato es más útil" },
  { id: "tono", emoji: "🗣️", label: "El tono es más adecuado" },
  { id: "nada", emoji: "➖", label: "No cambió mucho" },
];

/** Lo que guarda el celular en la Actividad 2 (respuesta `tf2_a2`). */
export interface Tf2A2 {
  tarea: string;
  pedidoA?: string;
  salidaA?: string;
  campos?: Partial<Record<Tf2CampoA2Id, string>>;
  pedidoB?: string;
  salidaB?: string;
  selected?: string[];
  /** Sin chatbot: siguió con el ejemplo preparado. */
  ejemplo?: boolean;
}

/**
 * Ejemplo preparado antes de la clase (Plan B y proyección): la misma tarea con un
 * pedido simple y con uno estructurado. Texto generado con IA y revisado.
 */
export const TF2_A2_EJEMPLO: Required<Pick<Tf2A2, "tarea" | "pedidoA" | "salidaA" | "pedidoB" | "salidaB">> = {
  tarea: "Aviso de la feria de enero",
  pedidoA: "Escribí un aviso sobre la feria de enero del Tribunal.",
  salidaA: `AVISO IMPORTANTE

Se comunica a contribuyentes, profesionales y público en general que el Tribunal Fiscal permanecerá en feria desde el 1 hasta el 31 de enero inclusive.

Durante ese período quedan suspendidos todos los plazos procesales y no se recibirán escritos.

La actividad se reanudará normalmente el lunes 2 de febrero.

Agradecemos su comprensión.
La Presidencia`,
  pedidoB: `Rol: asistente de la mesa de entradas del Tribunal
Tarea: escribí un aviso sobre la feria de enero del Tribunal
Contexto: lo lee el contribuyente que llega a mesa de entradas
Fuentes y datos: usá solo estos datos: feria del 2 al 31 de enero; los plazos se suspenden; hay guardia en mesa de entradas de 8 a 12 (datos ficticios)
Límites: no inventes fechas, plazos ni normas
Formato: título y tres puntos breves; al final, qué hay que verificar`,
  salidaB: `Feria de enero en el Tribunal

• Del 2 al 31 de enero el Tribunal está en feria y los plazos se suspenden.
• Mesa de entradas atiende una guardia de 8 a 12.
• Norma que dispone la feria: [completar con la acordada o resolución vigente]

Para verificar antes de publicar: las fechas de la feria, el horario de la guardia y la norma que la dispone.`,
};

/** Qué conviene mirar al comparar el ejemplo preparado (lo dice el docente). */
export const TF2_A2_EJEMPLO_MARCAS = [
  "La primera inventó las fechas, dijo que no se reciben escritos y firmó como «La Presidencia».",
  "La segunda usó solo los datos que le dimos y dejó entre corchetes la norma que no conocía.",
  "Ninguna de las dos está verificada: la mejora es que ahora se puede controlar.",
];

// --- Recapitulación (después de la placa 31) -----------------------------------------------------

/** Una idea por bloque: las conclusiones de las actividades y de las curvas. */
export const TF2_RECAP = [
  "Lo omitido puede ser tan importante como lo expresado.",
  "Una instrucción puede mejorar la verificabilidad, pero no asegura la verdad.",
  "El contexto selectivo y persistente tiene valor, pero debe actualizarse.",
  "Una IA que vuelve a contestar no es una fuente de verificación.",
  "La imitación de estilo no equivale a razonamiento correcto.",
  "Cada participante se lleva un procedimiento con revisión y registro.",
];

/** Próxima charla (puente de la placa 31). */
export const TF2_PROXIMA = "Análisis jurídico tributario";

// --- Etiquetas de los interruptores que también ven los celulares ------------------------------

/** Actividad 3: se revela qué cambió en el contexto del sistema. */
export const TF2_REVELA_A3 = "🔎 Qué cambió en el contexto";
/** Actividad 4: se revela la autoría de los tres textos. */
export const TF2_REVELA_A4 = "🎭 Revelar la autoría";
/** Respaldo sin conexión: versión proyectada y respuesta a mano alzada. */
export const TF2_PLAN_B = "🅱 Plan B sin conexión";

// --- Actividades en vivo -------------------------------------------------------------------------

export type Tf2ActKey = "tf2_a1" | "tf2_a2" | "tf2_a3" | "tf2_a4" | "tf2_a5";

export interface Tf2Actividad {
  key: Tf2ActKey;
  numero: number;
  nombre: string;
  /** Pregunta visible en el celular. */
  pregunta: string;
  conclusion: string;
  /** Para el motor genérico (nube, votos): resultados agregados y celular de la nube. */
  vivo?: ActividadVivo;
}

export const TF2_ACTIVIDADES: Tf2Actividad[] = [
  {
    key: "tf2_a1",
    numero: 1,
    nombre: "Nube de palabras",
    pregunta: "¿Qué hizo que fallaran las instrucciones al robot?",
    conclusion: "Lo omitido puede ser tan importante como lo expresado.",
    vivo: {
      key: "tf2_a1",
      kind: "palabra",
      titulo: "¿Qué hizo que fallaran las instrucciones al robot?",
      bajada: "Una o dos palabras.",
      maxChars: 28,
      normalizar: true,
    },
  },
  {
    key: "tf2_a2",
    numero: 2,
    nombre: "Laboratorio de prompts",
    pregunta: "Conseguí que el chatbot haga una tarea concreta y mejorá el resultado.",
    conclusion: "Una instrucción puede mejorar la verificabilidad, pero no asegura la verdad.",
  },
  {
    key: "tf2_a3",
    numero: 3,
    nombre: "Contexto en comparación",
    pregunta: "¿Qué salida ayuda más y qué información cambió el resultado?",
    conclusion: "El contexto selectivo y persistente tiene valor, pero debe actualizarse.",
    vivo: {
      key: "tf2_a3",
      kind: "encuesta",
      titulo: "¿Qué salida ayuda más y qué información cambió el resultado?",
      bajada: "Leé las dos respuestas a la misma tarea.",
      preguntas: [
        {
          id: "ayuda",
          q: "¿Qué salida ayuda más?",
          opciones: [
            { id: "A", emoji: "🅰️", label: "Salida A" },
            { id: "B", emoji: "🅱️", label: "Salida B" },
          ],
        },
        {
          id: "cambio",
          q: "¿Qué cambió más el resultado?",
          opciones: [
            { id: "destinatario", emoji: "👤", label: "A quién le habla" },
            { id: "tono", emoji: "🗣️", label: "El tono" },
            { id: "inventa", emoji: "🧩", label: "Qué inventa y qué deja marcado" },
            { id: "limites", emoji: "🚧", label: "Lo que promete o no promete" },
            { id: "formato", emoji: "🧾", label: "El formato" },
          ],
        },
      ],
    },
  },
  {
    key: "tf2_a4",
    numero: 4,
    nombre: "Humano o IA",
    pregunta: "¿Cuál de estos tres textos fue escrito por una persona?",
    conclusion: "La imitación de estilo no equivale a razonamiento correcto.",
    vivo: {
      key: "tf2_a4",
      kind: "opciones",
      titulo: "¿Cuál de estos tres textos fue escrito por una persona?",
      bajada: "Un solo voto.",
      opciones: [
        { id: "a", emoji: "A", label: "Texto A" },
        { id: "b", emoji: "B", label: "Texto B" },
        { id: "c", emoji: "C", label: "Texto C" },
      ],
    },
  },
  {
    key: "tf2_a5",
    numero: 5,
    nombre: "Desafío final",
    pregunta: "Construí una instrucción reutilizable para una tarea de tu trabajo.",
    conclusion: "Cada participante se lleva un procedimiento con revisión y registro.",
  },
];

export function getTf2Actividad(key: string): Tf2Actividad | undefined {
  return TF2_ACTIVIDADES.find((a) => a.key === key);
}

/** Para el motor genérico (resultados agregados): solo las que tienen forma estándar. */
export function getTf2Vivo(key: string): ActividadVivo | undefined {
  return getTf2Actividad(key)?.vivo;
}

// --- Placas ----------------------------------------------------------------------------------------

export type Tf2Visual =
  | "robot"
  | "supuestos"
  | "noRobot"
  | "contexto"
  | "instruir"
  | "anatomia"
  | "misma"
  | "iteracion"
  | "dividir"
  | "discutir"
  | "decidir"
  | "reusar"
  | "memoria"
  | "ecosistemas"
  | "disenar"
  | "biblioteca"
  | "fueraExpediente"
  | "minimizar"
  | "fuente"
  | "verificar"
  | "historia"
  | "autorrevision"
  | "formato"
  | "plantilla"
  | "estilo"
  | "humano"
  | "parecido"
  | "proceso"
  | "asistente"
  | "huellas"
  | "futuro";

export interface Tf2Placa {
  t: "placa";
  num: string;
  titulo: string;
  bajada: string;
  nota: string;
  bloque: number;
  visual: Tf2Visual;
  /** Revelado paso a paso: cuántas partes del visual aparecen con ▶ (0 = entero). */
  pasos: number;
  /** Placa con actividad: la abre en los celulares al llegar. */
  actividad?: Tf2ActKey;
  /** Placa de curva: frase de síntesis en texto circular (solo 11, 16, 22 y 27). */
  curva?: string;
}

export type Tf2Slide = Tf2Placa | { t: "ingreso"; bloque: number } | { t: "recapitulacion"; bloque: number };

const P = (p: Omit<Tf2Placa, "t">): Tf2Placa => ({ t: "placa", ...p });

export const TF2_SLIDES: Tf2Slide[] = [
  { t: "ingreso", bloque: 0 },

  // --- Bloque 1 · El problema de entendernos (12 min)
  P({
    num: "01",
    bloque: 0,
    titulo: "¿Podés pensar como un robot?",
    bajada: "Una tarea sencilla se complica cuando las instrucciones dejan cosas sin decir.",
    nota: "Experimento en vivo: un docente interpreta un robot que debe servir agua. Ordenes ambiguas producen dudas. No caricaturizar la IA como ejecutor literal.",
    visual: "robot",
    pasos: 4,
  }),
  P({
    num: "02",
    bloque: 0,
    titulo: "El problema no era el robot",
    bajada: "Gran parte de lo que comunicamos depende de supuestos que no explicitamos.",
    nota: "APP 1: nube de palabras: ¿Qué hizo que fallaran las instrucciones? Conversar las palabras más frecuentes.\n\n▶ con ▶ pasás del aviso a la nube. Revisá las palabras abajo y proyectalas. Tocá hasta 3 palabras en el celular (🔦) para analizarlas.",
    visual: "supuestos",
    pasos: 1,
    actividad: "tf2_a1",
  }),
  P({
    num: "03",
    bloque: 0,
    titulo: "La IA no es un robot",
    bajada: "Interpreta, completa vacíos y produce respuestas plausibles, aunque no siempre correctas.",
    nota: "Contrastar lenguaje natural y programa determinista; conectar con clase 1.",
    visual: "noRobot",
    pasos: 2,
  }),
  P({
    num: "04",
    bloque: 0,
    titulo: "El contexto cambia todo",
    bajada: "Una misma petición cambia cuando conocemos el propósito, el destinatario y las condiciones.",
    nota: "Dos situaciones cotidianas para idéntica consigna; giro hacia el método.",
    visual: "contexto",
    pasos: 2,
  }),

  // --- Bloque 2 · Aprender a dar instrucciones (26 min)
  P({
    num: "05",
    bloque: 1,
    titulo: "Preguntar no es lo mismo que instruir",
    bajada: "Una buena instrucción establece qué hacer y bajo qué condiciones hacerlo.",
    nota: "Mostrar un pedido vago y destacar que deja al modelo decidir demasiado.",
    visual: "instruir",
    pasos: 2,
  }),
  P({
    num: "06",
    bloque: 1,
    titulo: "Anatomía de un buen prompt",
    bajada: "Rol funcional, tarea, contexto, fuentes, límites, formato y criterios de control.",
    nota: "Desplegar elementos por capas, sin hacer del rol una personificación con autoridad.",
    visual: "anatomia",
    pasos: 7,
  }),
  P({
    num: "07",
    bloque: 1,
    titulo: "La misma tarea, otra respuesta",
    bajada: "Incorporar contexto y restricciones permite comparar resultados y reconocer mejoras.",
    nota: "APP 2: chatbot, pedido simple → pedido estructurado; dos salidas visibles y reflexión sobre cambios.\n\n▶ pasa del aviso al tablero. Desde el control podés proyectar el par de un participante (sin su nombre) o el ejemplo preparado.",
    visual: "misma",
    pasos: 1,
    actividad: "tf2_a2",
  }),
  P({
    num: "08",
    bloque: 1,
    titulo: "No existe el prompt mágico",
    bajada: "Una instrucción útil se prueba, se revisa y se ajusta según el resultado.",
    nota: "Mostrar una corrección concreta de la primera salida.",
    visual: "iteracion",
    pasos: 3,
  }),
  P({
    num: "09",
    bloque: 1,
    titulo: "Los problemas grandes se dividen",
    bajada: "Separar operaciones permite detectar errores sin perder de vista el objetivo.",
    nota: "Ejemplo general: preparar un informe sin pedir informe final: inventario, preguntas, opciones, comprobaciones.",
    visual: "dividir",
    pasos: 4,
  }),
  P({
    num: "10",
    bloque: 1,
    titulo: "La IA también puede discutir con vos",
    bajada: "Pedir objeciones, contraargumentos y preguntas pendientes ayuda a razonar mejor.",
    nota: "Microdemo adversarial; evitar que la IA sea árbitro final.",
    visual: "discutir",
    pasos: 3,
  }),
  P({
    num: "11",
    bloque: 1,
    titulo: "Pensar mejor no es decidir por nosotros",
    bajada: "La IA amplía alternativas; la responsabilidad de elegir y comprobar sigue siendo humana.",
    nota: "Síntesis de fragmentación y razonamiento; curva hacia contexto persistente.\n\n↻ GIRO: sintetizar en una frase lo aprendido antes de abrir el siguiente bloque.",
    visual: "decidir",
    pasos: 0,
    curva: "No se trata de preguntar mejor solamente: se trata de dirigir procesos",
  }),

  // --- Bloque 3 · Una IA que conoce nuestro trabajo (20 min)
  P({
    num: "12",
    bloque: 2,
    titulo: "¿Y si no explicaras todo otra vez?",
    bajada: "Las instrucciones reutilizables permiten empezar cada tarea con un marco definido.",
    nota: "Diferenciar conversación aislada de plantilla reutilizable.",
    visual: "reusar",
    pasos: 2,
  }),
  P({
    num: "13",
    bloque: 2,
    titulo: "La memoria no es una sola cosa",
    bajada: "Instrucciones, memorias, proyectos y archivos mantienen contextos de modos distintos.",
    nota: "Diferenciar perfil, instrucción activa y repositorio; no prometer retención perfecta.",
    visual: "memoria",
    pasos: 4,
  }),
  P({
    num: "14",
    bloque: 2,
    titulo: "ChatGPT, Claude y Gemini",
    bajada: "Tres ecosistemas, diversas maneras de personalizar asistentes y reunir fuentes.",
    nota: "Comparación conceptual, no tutorial de menús; disponibilidad depende plan y configuración.",
    visual: "ecosistemas",
    pasos: 3,
  }),
  P({
    num: "15",
    bloque: 2,
    titulo: "El contexto también se diseña",
    bajada: "Lo importante no es contar todo, sino seleccionar información relevante y vigente.",
    nota: "APP 3: comparar dos respuestas a tarea idéntica, una sin contexto y otra con contexto institucional no sensible.\n\n▶ 1: los votos en vivo. ▶ 2: se revela qué cambió en el contexto del sistema (mismo modelo, misma tarea).",
    visual: "disenar",
    pasos: 2,
    actividad: "tf2_a3",
  }),
  P({
    num: "16",
    bloque: 2,
    titulo: "Una biblioteca también es contexto",
    bajada: "Normas, doctrina, jurisprudencia y precedentes pueden orientar tareas generales.",
    nota: "Puente hacia fuentes institucionales y datos mínimos.\n\n↻ GIRO: sintetizar en una frase lo aprendido antes de abrir el siguiente bloque.",
    visual: "biblioteca",
    pasos: 0,
    curva: "El contexto selectivo y persistente tiene valor, pero debe actualizarse",
  }),

  // --- Bloque 4 · Fuentes, datos y trazabilidad (24 min)
  P({
    num: "17",
    bloque: 3,
    titulo: "No todo está dentro del expediente",
    bajada: "Muchas tareas útiles pueden realizarse con fuentes externas o información pública.",
    nota: "Ejemplos: glosarios, normativas, doctrina, precedentes; no profundizar análisis tributario de clase 3.",
    visual: "fueraExpediente",
    pasos: 4,
  }),
  P({
    num: "18",
    bloque: 3,
    titulo: "No hace falta contarle todo",
    bajada: "Minimizar y anonimizar reduce exposición, pero anonimizar no equivale a borrar nombres.",
    nota: "Datos identificadores directos e indirectos; usar ficticios y sistemas autorizados.",
    visual: "minimizar",
    pasos: 2,
  }),
  P({
    num: "19",
    bloque: 3,
    titulo: "La fuente es parte de la respuesta",
    bajada: "La cita de una norma o de un precedente exige corroboración en la fuente original.",
    nota: "Demostrar diferencia entre respuesta creíble y comprobación efectiva.",
    visual: "fuente",
    pasos: 2,
  }),
  P({
    num: "20",
    bloque: 3,
    titulo: "Lo que no verificamos, no lo sabemos",
    bajada: "Fechas, montos, nombres, normas, citas y cálculos necesitan un control específico.",
    nota: "Tabla mental: dato informado, origen, ubicación, estado de control.",
    visual: "verificar",
    pasos: 6,
  }),
  P({
    num: "21",
    bloque: 3,
    titulo: "Una respuesta tiene historia",
    bajada: "Registrar prompt, versión, fecha, fuentes y correcciones permite reconstruir el trabajo.",
    nota: "Mostrar registro mínimo de una interacción ficticia; usuario revisor y herramienta.",
    visual: "historia",
    pasos: 5,
  }),
  P({
    num: "22",
    bloque: 3,
    titulo: "Que la IA revise no alcanza",
    bajada: "La autocorrección ayuda, pero el cotejo independiente sigue siendo indispensable.",
    nota: "Cierre del bloque con respuesta intencionalmente defectuosa y validación externa.\n\n↻ GIRO: sintetizar en una frase lo aprendido antes de abrir el siguiente bloque.",
    visual: "autorrevision",
    pasos: 2,
    curva: "Una IA que vuelve a contestar no es una fuente de verificación",
  }),

  // --- Bloque 5 · De la respuesta al documento (18 min)
  P({
    num: "23",
    bloque: 4,
    titulo: "El contenido no es el formato",
    bajada: "La estructura de salida debe responder a la tarea y facilitar su revisión.",
    nota: "Comparar párrafo vs tabla con fuentes y dudas.",
    visual: "formato",
    pasos: 1,
  }),
  P({
    num: "24",
    bloque: 4,
    titulo: "Una plantilla ahorra decisiones repetidas",
    bajada: "Podemos construir modelos de instrucciones y de documentos que conserven un estándar.",
    nota: "Distinguir plantilla de prompt y plantilla de salida; mostrar campos editables.",
    visual: "plantilla",
    pasos: 2,
  }),
  P({
    num: "25",
    bloque: 4,
    titulo: "¿Puede la IA escribir como vos?",
    bajada: "Ejemplos de escritura ayudan a orientar tono, estructura y vocabulario.",
    nota: "Advertir imitación consentida, revisión y autoría; no pedir hacerse pasar por terceros.",
    visual: "estilo",
    pasos: 3,
  }),
  P({
    num: "26",
    bloque: 4,
    titulo: "¿Humano o inteligencia artificial?",
    bajada: "La apariencia de naturalidad no demuestra quién escribió ni si el texto es verdadero.",
    nota: "APP 4: votar cuál de tres textos fue escrito por humano; revelar autoría de piezas preparadas.\n\n▶ 1: los tres textos y los votos. ▶ 2: se revela la autoría (también en los celulares).",
    visual: "humano",
    pasos: 2,
    actividad: "tf2_a4",
  }),
  P({
    num: "27",
    bloque: 4,
    titulo: "Escribir parecido no es pensar igual",
    bajada: "Un estilo convincente puede ocultar datos ausentes o argumentos débiles.",
    nota: "Vincular con Turing como disparador, no prueba formal de inteligencia ni autenticidad.\n\n↻ GIRO: sintetizar en una frase lo aprendido antes de abrir el siguiente bloque.",
    visual: "parecido",
    pasos: 0,
    curva: "La imitación de estilo no equivale a razonamiento correcto",
  }),

  // --- Bloque 6 · Hacia las tareas complejas (20 min)
  P({
    num: "28",
    bloque: 5,
    titulo: "Una tarea compleja es un proceso",
    bajada: "La utilidad aparece al combinar objetivos, etapas, contexto, fuentes, formatos y controles.",
    nota: "Integrar recorrido previo sin entrar a técnicas especializadas de clases 3–5.",
    visual: "proceso",
    pasos: 6,
  }),
  P({
    num: "29",
    bloque: 5,
    titulo: "Diseñá tu asistente de trabajo",
    bajada: "Cada participante construye una instrucción reutilizable para una tarea propia y permitida.",
    nota: "APP 5: asistente guiado construye prompt, prueba con datos ficticios, verifica y ofrece texto copiable.\n\n▶ pasa del aviso al tablero de avance.",
    visual: "asistente",
    pasos: 1,
    actividad: "tf2_a5",
  }),
  P({
    num: "30",
    bloque: 5,
    titulo: "Una buena respuesta deja huellas",
    bajada: "El producto final incluye límites, fuentes, verificación y registro de lo realizado.",
    nota: "Mostrar ficha de trazabilidad de una prueba de cada participante.\n\nDesde el control elegís qué ficha proyectar (sin nombre).",
    visual: "huellas",
    pasos: 0,
  }),
  P({
    num: "31",
    bloque: 5,
    titulo: "El futuro no es preguntar mejor",
    bajada: "Es construir procesos donde la IA amplía capacidades sin reemplazar el criterio humano.",
    nota: "Recuperar robot inicial: hoy ya sabemos diseñar instrucciones y controles; cierre con puente a clase 3.",
    visual: "futuro",
    pasos: 3,
  }),
  { t: "recapitulacion", bloque: 5 },
];

/** Etiqueta corta de cada pantalla (índice del control remoto). */
export function tituloTf2(s: Tf2Slide): string {
  if (s.t === "ingreso") return "Ingreso con QR";
  if (s.t === "recapitulacion") return "Recapitulación";
  const act = s.actividad ? getTf2Actividad(s.actividad) : undefined;
  return `${s.num} · ${act ? `📱 ${act.numero} · ` : ""}${s.titulo}`;
}

// --- Configuración para el motor de clase en vivo -----------------------------------------------

export const TF2_CONFIG: ClaseVivoConfig = {
  slug: TF2_SLUG,
  titulo: TF2_TITULO,
  materia: "Tribunal Fiscal de la Provincia de Tucumán · Segunda charla del ciclo",
  autor: "Mario Rodolfo Leal · Marco Rossi · Franco Orellana",
  cargo: "Ciclo de inteligencia artificial 2026",
  poll: { alumno: 3500, alumnoMe: 20000, deck: 2500 },
  getActividad: getTf2Vivo,
  // "No exigir nombres reales": se entra sin escribir nada, con un alias.
  anonimo: true,
  aviso: "No hace falta crear una cuenta ni dar tu nombre. En la pantalla solo se ven resultados agrupados o respuestas revisadas, sin nombres.",
};

/** Perfil del chatbot en las actividades 2 y 5: el generalista (solo cambia el pedido). */
export const TF2_PERFIL_LAB: Tf2Perfil = "A";
