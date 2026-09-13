// ============================================================
// Caso sintético del taller (miércoles 16 y jueves 17/09/2026):
// Café Nube (Lucía) y TecnoFrío Servicios (Diego).
// Documentos y prompts guiados que el deck va liberando a los grupos.
// Todos los hechos y documentos son ficticios.
// ============================================================

export type DocId = "D0" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" | "D10";
export type PromptId = "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8";

export interface Mensaje {
  quien: "LUCÍA" | "DIEGO";
  hora: string;
  texto: string;
}

export interface DocTaller {
  id: DocId;
  numero?: number;
  titulo: string;
  /** Quién lo aporta o de dónde sale. */
  origen: string;
  tipo: "chat" | "texto";
  mensajes?: Mensaje[];
  parrafos?: string[];
}

export interface PromptTaller {
  id: PromptId;
  titulo: string;
  /** Para qué sirve, en una línea. */
  para: string;
  texto: string;
}

export const TAL_DOCS: Record<DocId, DocTaller> = {
  D0: {
    id: "D0",
    titulo: "Hechos iniciales",
    origen: "Presentación del caso",
    tipo: "texto",
    parrafos: [
      "Lucía administra Café Nube, un local gastronómico que debe abrir el viernes. Contrató a Diego, titular de TecnoFrío Servicios, para proveer e instalar una máquina de hielo, una cámara frigorífica y un sistema de refrigeración.",
      "El precio total del contrato es de USD 3.000. Diego ya entregó las cajas con los equipos, pero la instalación no está completamente terminada porque falta un módulo de conexión.",
      "Lucía sostiene que no puede abrir en condiciones normales. Diego considera que la entrega principal ya fue realizada y necesita cobrar para adquirir el módulo faltante.",
    ],
  },
  D1: {
    id: "D1",
    numero: 1,
    titulo: "Captura aislada",
    origen: "Aportada por Diego",
    tipo: "chat",
    mensajes: [
      { quien: "LUCÍA", hora: "Martes, 16:42", texto: "Sí, recibimos todo." },
      { quien: "DIEGO", hora: "Martes, 16:45", texto: "Perfecto. Entonces mañana coordinamos el pago pendiente." },
    ],
  },
  D2: {
    id: "D2",
    numero: 2,
    titulo: "Conversación completa",
    origen: "Aportada por Lucía",
    tipo: "chat",
    mensajes: [
      {
        quien: "DIEGO",
        hora: "Martes, 16:35",
        texto: "Ya dejamos las tres cajas en el local. Falta traer el módulo automático porque el proveedor me confirmó que llega el jueves.",
      },
      { quien: "LUCÍA", hora: "Martes, 16:42", texto: "Sí, recibimos todo." },
      { quien: "LUCÍA", hora: "Martes, 16:44", texto: "Digo, recibimos todas las cajas. Ahora falta abrirlas y probar que funcione la máquina de hielo." },
      { quien: "DIEGO", hora: "Martes, 16:47", texto: "La instalación queda lista cuando llegue el módulo. Es una pieza menor." },
      { quien: "LUCÍA", hora: "Martes, 16:50", texto: "Para mí es importante porque sin eso no puedo usar la máquina." },
      { quien: "DIEGO", hora: "Martes, 17:02", texto: "Lo vemos el jueves. Igual el saldo queda pendiente." },
    ],
  },
  D3: {
    id: "D3",
    numero: 3,
    titulo: "Contrato de provisión e instalación de equipos",
    origen: "Firmado por ambas partes",
    tipo: "texto",
    parrafos: [
      "TecnoFrío Servicios proveerá una máquina de hielo, una cámara frigorífica y los elementos necesarios para su instalación.",
      "La entrega e instalación deberán encontrarse finalizadas antes del viernes.",
      "El precio total será de USD 3.000. Se abonarán USD 2.000 al momento de la entrega y USD 1.000 una vez finalizada la instalación.",
      "Los equipos deberán entregarse en condiciones de funcionamiento, siempre que el local cuente con las conexiones necesarias.",
      "Las modificaciones solicitadas por la contratante después de la firma podrán generar costos adicionales.",
    ],
  },
  D4: {
    id: "D4",
    numero: 4,
    titulo: "Anexo técnico",
    origen: "Integra el contrato",
    tipo: "texto",
    parrafos: [
      "La máquina de hielo requiere: a. conexión eléctrica independiente; b. módulo automático de alimentación; c. prueba de funcionamiento durante dos horas.",
      "La instalación se considera finalizada cuando el equipo haya sido probado y se encuentre operativo.",
    ],
  },
  D5: {
    id: "D5",
    numero: 5,
    titulo: "Reclamo de Diego",
    origen: "Presentado por Diego",
    tipo: "texto",
    parrafos: [
      "Solicito el pago de USD 3.000 por la provisión e instalación de los equipos contratados.",
      "La entrega fue realizada el martes y fue reconocida por Lucía mediante el mensaje: «Sí, recibimos todo».",
      "La falta de pago configura un incumplimiento de la obligación asumida.",
    ],
  },
  D6: {
    id: "D6",
    numero: 6,
    titulo: "Respuesta de Lucía",
    origen: "Presentada por Lucía",
    tipo: "texto",
    parrafos: [
      "La entrega fue incompleta y la instalación no se encuentra finalizada.",
      "El mensaje citado se refería a la recepción de las cajas. En la misma conversación aclaré que todavía faltaba revisar el contenido y comprobar el funcionamiento.",
      "No me niego a pagar. El saldo debe abonarse cuando los equipos estén instalados y funcionen.",
    ],
  },
  D7: {
    id: "D7",
    numero: 7,
    titulo: "Informe técnico",
    origen: "Técnico independiente",
    tipo: "texto",
    parrafos: [
      "El equipo principal se encuentra en condiciones de ser instalado.",
      "No es posible ponerlo en funcionamiento automático sin el módulo de conexión.",
      "La instalación definitiva podría realizarse en una jornada, siempre que el módulo sea entregado y exista alimentación eléctrica adecuada.",
      "No puede determinarse con la documentación examinada quién es responsable por la demora.",
    ],
  },
  D8: {
    id: "D8",
    numero: 8,
    titulo: "Nota de Lucía",
    origen: "Escrita por Lucía",
    tipo: "texto",
    parrafos: [
      "Necesito que el local esté operativo el viernes a las 18:00 porque ya tengo reservas y una actividad de inauguración.",
      "No quiero iniciar un conflicto con Diego porque probablemente vuelva a necesitar mantenimiento.",
      "Mi principal preocupación es que el equipo funcione y que quede claro quién responde si vuelve a fallar.",
    ],
  },
  D9: {
    id: "D9",
    numero: 9,
    titulo: "Respuesta de Diego",
    origen: "Escrita por Diego",
    tipo: "texto",
    parrafos: [
      "El módulo llega el jueves por la tarde. Puedo instalarlo esa misma noche, pero necesito recibir USD 1.000 para retirarlo y pagar el traslado.",
      "También puedo dejar un equipo de hielo temporal durante una semana, aunque eso tendría un costo adicional.",
    ],
  },
  D10: {
    id: "D10",
    numero: 10,
    titulo: "Condiciones del local",
    origen: "Informe del electricista",
    tipo: "texto",
    parrafos: [
      "El local cuenta con una conexión eléctrica general suficiente para la cámara frigorífica. La máquina de hielo requiere una línea independiente que todavía no fue instalada.",
      "La contratación de esa línea no aparece expresamente incluida en el contrato principal ni en el presupuesto inicial.",
    ],
  },
};

export const TAL_PROMPTS: Record<PromptId, PromptTaller> = {
  P1: {
    id: "P1",
    titulo: "Analizar la captura aislada",
    para: "Separar lo que se dice de lo que se interpreta",
    texto: `Analizá esta conversación aislada.

Indicá:
- qué afirma expresamente Lucía;
- qué interpreta Diego;
- qué información no puede determinarse;
- qué documento deberíamos buscar para comprender el contexto.

No concluyas que existe aceptación definitiva.`,
  },
  P2: {
    id: "P2",
    titulo: "Instrucción controlada",
    para: "Pedir con límites y con fuente",
    texto: "Identificá qué afirma cada parte en esta conversación, separá hechos e inferencias y citá el fragmento en que apoyás cada respuesta.",
  },
  P3: {
    id: "P3",
    titulo: "Extraer obligaciones del contrato",
    para: "Leer el contrato completo, no una frase",
    texto: `Extraé las obligaciones de cada parte.

Para cada obligación indicá:
- texto contractual de respaldo;
- momento en que debe cumplirse;
- condición o excepción;
- información que permite saber si se cumplió;
- información que todavía falta.

No determines quién tiene razón.`,
  },
  P4: {
    id: "P4",
    titulo: "Matriz de hechos y prueba",
    para: "Organizar lo que sabemos y lo que falta",
    texto: `A partir de los documentos incorporados, prepará una matriz de hechos y prueba.

Para cada punto indicá:
- qué afirma cada parte;
- qué documento respalda la afirmación;
- si existe contradicción;
- qué prueba adicional sería útil;
- qué cuestión debería resolver quien intervenga.

No redactes una sentencia ni determines el resultado.
Marcá las inferencias como hipótesis.`,
  },
  P5: {
    id: "P5",
    titulo: "Revisar como la contraparte",
    para: "Poner a prueba una interpretación",
    texto: `Revisá el expediente como si fueras la contraparte.

Señalá:
- afirmaciones no respaldadas;
- puntos que favorecen a cada parte;
- contradicciones entre documentos;
- prueba adicional necesaria;
- cuestiones que debería resolver un juez o árbitro.

No reemplaces el análisis anterior.`,
  },
  P6: {
    id: "P6",
    titulo: "Preparar la mediación",
    para: "De las posiciones a las necesidades",
    texto: `Analizá las posiciones de Lucía y Diego utilizando únicamente las fuentes incorporadas al proyecto.

Separá:
- lo que cada parte pide;
- qué necesita;
- qué información falta confirmar;
- qué hipótesis no deben darse por ciertas.

Proponé cinco preguntas abiertas para una mediación.
No redactes todavía un acuerdo.`,
  },
  P7: {
    id: "P7",
    titulo: "Comparar alternativas",
    para: "Explorar opciones sin elegir por las partes",
    texto: `Compará estas alternativas de solución.

Para cada una indicá:
- beneficios para cada parte;
- costos;
- riesgos;
- condiciones necesarias;
- posibles objeciones;
- cuestiones que deberían redactarse con precisión.

No declares cuál es la mejor.`,
  },
  P8: {
    id: "P8",
    titulo: "Incorporar la nueva información",
    para: "Actualizar el análisis sin borrarlo",
    texto: `Incorporá el nuevo informe al análisis anterior.

Indicá:
- qué conclusiones se mantienen;
- qué conclusiones deben revisarse;
- qué nueva cuestión aparece;
- qué parte debería aportar información adicional.

No borres el análisis anterior.
Mostrá qué cambió y por qué.`,
  },
};

export type LiberadoId = DocId | PromptId;

export const esDoc = (id: string): id is DocId => id in TAL_DOCS;
export const esPrompt = (id: string): id is PromptId => id in TAL_PROMPTS;

/** Texto plano del documento, para pegar en la herramienta de IA. */
export function docComoTexto(d: DocTaller): string {
  const cab = `${d.numero ? `Documento ${d.numero}: ` : ""}${d.titulo} (${d.origen})`;
  if (d.tipo === "chat") return `${cab}\n\n${(d.mensajes ?? []).map((m) => `${m.quien} — ${m.hora}\n${m.texto}`).join("\n\n")}`;
  return `${cab}\n\n${(d.parrafos ?? []).join("\n\n")}`;
}

// --- Los dos recorridos que muestra siempre la app --------------------------------

export const RECORRIDO_CASO = ["Hechos", "Documentos", "Decisiones", "Nueva información", "Desenlace"];
export const RECORRIDO_TRABAJO = ["Comprender", "Organizar", "Investigar", "Contrastar", "Producir", "Revisar"];

/** Lo que el deck le pasa a la app del grupo (session.activity_config). */
export interface ConfigTaller {
  liberados?: LiberadoId[];
  caso?: number;
  trabajo?: number;
}
