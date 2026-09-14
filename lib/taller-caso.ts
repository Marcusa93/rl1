// ============================================================
// Caso sintético del taller (miércoles 16 y jueves 17/09/2026):
// Café Nube (Lucía Herrera) y TecnoFrío Servicios (Diego Molina).
//
// Es la carpeta del caso: cada documento tiene un código (CN-xx) para citarlo
// y un PDF con diseño en public/taller-ia/carpeta/ que los grupos descargan y
// suben a su herramienta. Los PDFs se generan desde ESTE archivo con
//   node scripts/gen-taller-carpeta.mjs
// así la app y los PDFs dicen siempre lo mismo. Todo es ficticio.
//
// Sin imports y solo con sintaxis de tipos borrables: el script de Node lo
// importa directamente.
// ============================================================

export type DocId =
  | "D0" | "D1" | "D2" | "D3" | "D4" | "D5" | "D6" | "D7" | "D8" | "D9" | "D10"
  | "D11" | "D12" | "D13";
export type PromptId = "P0" | "P1" | "P2" | "P3" | "P4" | "P5" | "P6" | "P7" | "P8" | "P9" | "P10";
export type PlantillaId = "PLB" | "PLC" | "PLD" | "PLE";

export interface Mensaje {
  quien: "LUCÍA" | "DIEGO";
  hora: string;
  texto: string;
}

/** Quién emite el documento: define el membrete del PDF. */
export type Emisor = "caso" | "chat" | "contrato" | "tecnofrio" | "cafenube" | "banco" | "tecnico" | "mediacion" | "correo" | "electricista";

export interface DocTaller {
  id: DocId;
  /** Código para citar: «según CN-03, pág. 1». */
  codigo: string;
  /** Nombre del PDF en /taller-ia/carpeta/. */
  archivo: string;
  titulo: string;
  /** Quién lo aporta o de dónde sale. */
  origen: string;
  emisor: Emisor;
  tipo: "chat" | "texto";
  /** El PDF es una imagen (captura): sirve para probar si la herramienta la lee. */
  imagen?: boolean;
  /** Lugar y fecha, o destinatario, arriba del cuerpo. */
  encabezado?: string[];
  /** Datos de cabecera: número, fecha, partes… */
  campos?: [string, string][];
  mensajes?: Mensaje[];
  parrafos?: string[];
  tabla?: { cols: string[]; filas: string[][]; total?: [string, string] };
  /** Lista de control (acta de instalación). */
  checklist?: { item: string; hecho: boolean }[];
  firmas?: string[];
  sello?: string;
}

export const TAL_DOCS: Record<DocId, DocTaller> = {
  D0: {
    id: "D0",
    codigo: "CN-00",
    archivo: "CN-00-ficha-del-caso.pdf",
    titulo: "Ficha del caso",
    origen: "Presentación del caso",
    emisor: "caso",
    tipo: "texto",
    campos: [
      ["Partes", "Lucía Herrera (Café Nube) y Diego Molina (TecnoFrío Servicios)"],
      ["Objeto", "Provisión e instalación de equipos de frío"],
      ["Precio total", "USD 3.000"],
    ],
    parrafos: [
      "Lucía Herrera administra Café Nube, un local gastronómico que debe abrir el viernes. Contrató a Diego Molina, titular de TecnoFrío Servicios, para proveer e instalar una máquina de hielo, una cámara frigorífica y un sistema de refrigeración.",
      "El precio total del contrato es de USD 3.000. Diego ya entregó las cajas con los equipos, pero la instalación no está completamente terminada porque falta un módulo de conexión.",
      "Lucía sostiene que no puede abrir en condiciones normales. Diego considera que la entrega principal ya fue realizada y necesita cobrar para adquirir el módulo faltante.",
    ],
  },
  D1: {
    id: "D1",
    codigo: "CN-01",
    archivo: "CN-01-captura-whatsapp.pdf",
    titulo: "Captura de WhatsApp",
    origen: "Aportada por Diego Molina",
    emisor: "chat",
    tipo: "chat",
    imagen: true,
    mensajes: [
      { quien: "LUCÍA", hora: "Martes, 16:42", texto: "Sí, recibimos todo." },
      { quien: "DIEGO", hora: "Martes, 16:45", texto: "Perfecto. Entonces mañana coordinamos el pago pendiente." },
    ],
  },
  D2: {
    id: "D2",
    codigo: "CN-02",
    archivo: "CN-02-chat-exportado.pdf",
    titulo: "Conversación completa (chat exportado)",
    origen: "Exportado por Lucía Herrera",
    emisor: "chat",
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
    codigo: "CN-03",
    archivo: "CN-03-contrato.pdf",
    titulo: "Contrato de provisión e instalación de equipos",
    origen: "Firmado por ambas partes",
    emisor: "contrato",
    tipo: "texto",
    parrafos: [
      "En San Salvador, el 1 de septiembre de 2026, TecnoFrío Servicios, representada por Diego Molina (el Proveedor), y Café Nube, representada por Lucía Herrera (la Contratante), celebran el siguiente contrato:",
      "PRIMERA. Objeto. TecnoFrío Servicios proveerá una máquina de hielo, una cámara frigorífica y los elementos necesarios para su instalación, según el Anexo técnico (CN-04), que forma parte de este contrato.",
      "SEGUNDA. Plazo. La entrega e instalación deberán encontrarse finalizadas antes del viernes 11 de septiembre de 2026.",
      "TERCERA. Precio. El precio total será de USD 3.000. Se abonarán USD 2.000 al momento de la entrega y USD 1.000 una vez finalizada la instalación.",
      "CUARTA. Funcionamiento. Los equipos deberán entregarse en condiciones de funcionamiento, siempre que el local cuente con las conexiones necesarias.",
      "QUINTA. Modificaciones. Las modificaciones solicitadas por la contratante después de la firma podrán generar costos adicionales.",
      "SEXTA. Diferencias. Ante cualquier diferencia, las partes intentarán primero una conversación directa o una mediación.",
    ],
    firmas: ["Diego Molina · TecnoFrío Servicios", "Lucía Herrera · Café Nube"],
  },
  D4: {
    id: "D4",
    codigo: "CN-04",
    archivo: "CN-04-anexo-tecnico.pdf",
    titulo: "Anexo técnico",
    origen: "Integra el contrato (CN-03)",
    emisor: "tecnofrio",
    tipo: "texto",
    campos: [["Equipo", "Máquina de hielo MH-120"]],
    tabla: {
      cols: ["Requisito", "Detalle"],
      filas: [
        ["a. Conexión eléctrica independiente", "Línea exclusiva para la máquina de hielo"],
        ["b. Módulo automático de alimentación", "Provisto con el equipo"],
        ["c. Prueba de funcionamiento", "Durante dos horas, con el equipo en marcha"],
      ],
    },
    parrafos: ["La instalación se considera finalizada cuando el equipo haya sido probado y se encuentre operativo."],
    checklist: [
      { item: "Equipos ubicados en el local", hecho: true },
      { item: "Conexión eléctrica independiente verificada", hecho: false },
      { item: "Módulo automático instalado", hecho: false },
      { item: "Prueba de dos horas realizada", hecho: false },
      { item: "Conformidad de la contratante", hecho: false },
    ],
  },
  D11: {
    id: "D11",
    codigo: "CN-05",
    archivo: "CN-05-presupuesto.pdf",
    titulo: "Presupuesto N° 0187",
    origen: "Emitido por TecnoFrío Servicios",
    emisor: "tecnofrio",
    tipo: "texto",
    campos: [
      ["Fecha", "25/08/2026"],
      ["Cliente", "Café Nube · Lucía Herrera"],
      ["Validez", "10 días"],
    ],
    tabla: {
      cols: ["Cant.", "Descripción", "Importe"],
      filas: [
        ["1", "Máquina de hielo MH-120", "USD 1.450"],
        ["1", "Cámara frigorífica CF-8", "USD 950"],
        ["1", "Sistema de refrigeración", "USD 350"],
        ["1", "Instalación completa y puesta en marcha", "USD 250"],
      ],
      total: ["Total", "USD 3.000"],
    },
    parrafos: ["Forma de pago: USD 2.000 contra entrega y el saldo contra instalación.", "Plazo de entrega: 7 días desde la aceptación."],
    firmas: ["Diego Molina · TecnoFrío Servicios"],
  },
  D12: {
    id: "D12",
    codigo: "CN-06",
    archivo: "CN-06-remito.pdf",
    titulo: "Remito de entrega N° 0045-00312",
    origen: "Emitido por TecnoFrío Servicios",
    emisor: "tecnofrio",
    tipo: "texto",
    campos: [
      ["Fecha", "08/09/2026"],
      ["Destinatario", "Café Nube"],
      ["Lugar de entrega", "Local de Café Nube, San Salvador"],
    ],
    tabla: {
      cols: ["Bultos", "Descripción"],
      filas: [
        ["1", "Máquina de hielo MH-120 (caja cerrada)"],
        ["1", "Cámara frigorífica CF-8 (caja cerrada)"],
        ["1", "Sistema de refrigeración (caja cerrada)"],
      ],
    },
    parrafos: ["Pendiente de entrega: módulo automático de alimentación (llega el jueves).", "Recibí conforme: 3 (tres) bultos cerrados."],
    firmas: ["Lucía Herrera · Café Nube"],
    sello: "RECIBIDO · 08 SEP 2026",
  },
  D13: {
    id: "D13",
    codigo: "CN-07",
    archivo: "CN-07-comprobante-transferencia.pdf",
    titulo: "Comprobante de transferencia",
    origen: "Banco del Valle (ficticio)",
    emisor: "banco",
    tipo: "texto",
    campos: [
      ["Fecha y hora", "08/09/2026 · 17:10"],
      ["Operación N°", "7730-5512-09"],
      ["Ordenante", "Lucía Herrera · Café Nube · cuenta ****4821"],
      ["Beneficiario", "Diego Molina · TecnoFrío Servicios · cuenta ****0937"],
      ["Monto", "USD 2.000"],
      ["Concepto", "Anticipo equipos Café Nube (contra entrega)"],
      ["Estado", "Acreditada"],
    ],
  },
  D5: {
    id: "D5",
    codigo: "CN-08",
    archivo: "CN-08-reclamo-diego.pdf",
    titulo: "Carta de reclamo",
    origen: "Enviada por Diego Molina",
    emisor: "tecnofrio",
    tipo: "texto",
    encabezado: ["San Salvador, 9 de septiembre de 2026", "Señora Lucía Herrera · Café Nube · Presente"],
    parrafos: [
      "Solicito el pago de USD 3.000 por la provisión e instalación de los equipos contratados.",
      "La entrega fue realizada el martes y fue reconocida por Lucía mediante el mensaje: «Sí, recibimos todo».",
      "La falta de pago configura un incumplimiento de la obligación asumida.",
      "Por lo expuesto, le solicito abonar la suma reclamada dentro de las 48 horas.",
    ],
    firmas: ["Diego Molina · TecnoFrío Servicios"],
  },
  D6: {
    id: "D6",
    codigo: "CN-09",
    archivo: "CN-09-respuesta-lucia.pdf",
    titulo: "Respuesta al reclamo",
    origen: "Enviada por Lucía Herrera",
    emisor: "cafenube",
    tipo: "texto",
    encabezado: ["San Salvador, 10 de septiembre de 2026", "Señor Diego Molina · TecnoFrío Servicios · Presente"],
    parrafos: [
      "La entrega fue incompleta y la instalación no se encuentra finalizada.",
      "El mensaje citado se refería a la recepción de las cajas. En la misma conversación aclaré que todavía faltaba revisar el contenido y comprobar el funcionamiento.",
      "El 8 de septiembre abonamos USD 2.000 contra la entrega, como prevé el contrato.",
      "No me niego a pagar. El saldo debe abonarse cuando los equipos estén instalados y funcionen.",
    ],
    firmas: ["Lucía Herrera · Café Nube"],
  },
  D7: {
    id: "D7",
    codigo: "CN-10",
    archivo: "CN-10-informe-tecnico.pdf",
    titulo: "Informe técnico de inspección N° IT-2209",
    origen: "Servicio Técnico Independiente",
    emisor: "tecnico",
    tipo: "texto",
    campos: [
      ["Fecha de inspección", "10/09/2026"],
      ["Lugar", "Café Nube, San Salvador"],
      ["Solicitado por", "Ambas partes"],
    ],
    tabla: {
      cols: ["Punto revisado", "Resultado"],
      filas: [
        ["Equipo principal", "Se encuentra en condiciones de ser instalado"],
        ["Funcionamiento automático sin el módulo de conexión", "No es posible"],
        ["Instalación definitiva", "Podría realizarse en una jornada, siempre que el módulo sea entregado y exista alimentación eléctrica adecuada"],
      ],
    },
    parrafos: ["Conclusión: no puede determinarse con la documentación examinada quién es responsable por la demora."],
    firmas: ["Téc. Andrea Quintanilla · Servicio Técnico Independiente"],
  },
  D8: {
    id: "D8",
    codigo: "CN-11",
    archivo: "CN-11-solicitud-mediacion.pdf",
    titulo: "Solicitud de mediación",
    origen: "Presentada por Lucía Herrera",
    emisor: "mediacion",
    tipo: "texto",
    campos: [
      ["Fecha", "09/09/2026"],
      ["Solicitante", "Lucía Herrera · Café Nube"],
      ["Otra parte", "Diego Molina · TecnoFrío Servicios"],
      ["Tema", "Instalación incompleta de equipos de frío"],
      ["Urgencia", "Alta: apertura el viernes 11/09 a las 18:00"],
    ],
    tabla: {
      cols: ["Pregunta del formulario", "Respuesta de la solicitante"],
      filas: [
        ["¿Qué necesita?", "Necesito que el local esté operativo el viernes a las 18:00 porque ya tengo reservas y una actividad de inauguración."],
        ["¿Cómo es la relación con la otra parte?", "No quiero iniciar un conflicto con Diego porque probablemente vuelva a necesitar mantenimiento."],
        ["¿Qué le preocupa?", "Mi principal preocupación es que el equipo funcione y que quede claro quién responde si vuelve a fallar."],
      ],
    },
    firmas: ["Lucía Herrera"],
  },
  D9: {
    id: "D9",
    codigo: "CN-12",
    archivo: "CN-12-correo-diego.pdf",
    titulo: "Correo con la propuesta de Diego",
    origen: "Enviado por Diego Molina",
    emisor: "correo",
    tipo: "texto",
    campos: [
      ["De", "Diego Molina <diego@tecnofrio.example>"],
      ["Para", "Lucía Herrera <lucia@cafenube.example>"],
      ["Fecha", "Miércoles 9 de septiembre de 2026, 19:20"],
      ["Asunto", "Re: Solicitud de mediación"],
    ],
    parrafos: [
      "Lucía:",
      "El módulo llega el jueves por la tarde. Puedo instalarlo esa misma noche, pero necesito recibir USD 1.000 para retirarlo y pagar el traslado.",
      "También puedo dejar un equipo de hielo temporal durante una semana, aunque eso tendría un costo adicional.",
      "Quedo atento. Diego",
    ],
  },
  D10: {
    id: "D10",
    codigo: "CN-13",
    archivo: "CN-13-constancia-electricista.pdf",
    titulo: "Constancia técnica de la instalación eléctrica",
    origen: "Ing. Roberto Pineda, electricista",
    emisor: "electricista",
    tipo: "texto",
    campos: [
      ["Fecha", "11/09/2026"],
      ["Lugar", "Café Nube, San Salvador"],
      ["Solicitado por", "Lucía Herrera"],
    ],
    tabla: {
      cols: ["Punto", "Resultado"],
      filas: [
        ["Tablero general", "Operativo"],
        ["Línea para la cámara frigorífica", "Suficiente"],
        ["Línea independiente para la máquina de hielo", "No instalada"],
        ["Instalación de esa línea (estimado)", "4 horas · USD 180"],
      ],
    },
    parrafos: [
      "El local cuenta con una conexión eléctrica general suficiente para la cámara frigorífica. La máquina de hielo requiere una línea independiente que todavía no fue instalada.",
      "La contratación de esa línea no aparece expresamente incluida en el contrato principal ni en el presupuesto inicial.",
    ],
    firmas: ["Ing. Roberto Pineda"],
  },
};

export interface PlantillaTaller {
  id: PlantillaId;
  codigo: string;
  archivo: string;
  titulo: string;
  para: string;
}

/** Plantillas del grupo (solo PDF). */
export const TAL_PLANTILLAS: Record<PlantillaId, PlantillaTaller> = {
  PLB: {
    id: "PLB",
    codigo: "PL-B",
    archivo: "PL-B-matriz-hechos-prueba.pdf",
    titulo: "Matriz de hechos y prueba",
    para: "Complétenla, o súbanla a la IA como formato de salida y revisen fila por fila.",
  },
  PLC: {
    id: "PLC",
    codigo: "PL-C",
    archivo: "PL-C-hoja-de-ruta.pdf",
    titulo: "Hoja de ruta del grupo",
    para: "Para preparar la puesta en común: camino, documentos, prompt, corrección y lo pendiente.",
  },
  PLD: {
    id: "PLD",
    codigo: "PL-D",
    archivo: "PL-D-ficha-de-escucha.pdf",
    titulo: "Ficha de escucha del mediador",
    para: "Complétenla a mano mientras escuchan cada entrevista: posiciones, intereses, emociones y lo confidencial.",
  },
  PLE: {
    id: "PLE",
    codigo: "PL-E",
    archivo: "PL-E-borrador-de-acuerdo.pdf",
    titulo: "Borrador de acuerdo de mediación",
    para: "Completen los espacios. Un acuerdo se escribe para poder cumplirse: quién, qué, cuándo y qué pasa si falla.",
  },
};

export const CARPETA_URL = "/taller-ia/carpeta";

const CITAR = "\n\nCitá el documento (código CN) y la página en que apoyás cada dato.";

export const TAL_PROMPTS: Record<PromptId, PromptTaller> = {
  P0: {
    id: "P0",
    titulo: "Prompt de sistema: su asistente de mediación",
    para: "Un COTIO que se escribe una vez y vale todo el taller (instrucciones del Gem)",
    texto: `CONTEXTO: Sos el asistente del equipo de mediación en el caso Café Nube (Lucía Herrera) y TecnoFrío Servicios (Diego Molina), en El Salvador. El equipo media entre las partes; vos asistís al equipo, no a una parte.

OBJETIVO: Ayudar a preparar y conducir la mediación: entender los hechos y los intereses, organizar la prueba y explorar opciones de acuerdo.

TAREAS: transcribir y ordenar entrevistas; extraer obligaciones; armar matrices de hechos y prueba; separar posiciones de intereses; comparar alternativas; proponer preguntas abiertas. Distinguí siempre hecho documentado, afirmación de parte e inferencia.

INPUT: Solo los documentos y audios que suba a esta conversación (códigos CN-xx y EA-xx). Si un dato no surge de esas fuentes, decí «no surge de las fuentes»; no lo completes.

OUTPUT: En español, breve, en tablas cuando ayude. Citá el código y la página de cada dato (ej.: CN-03, pág. 1). Marcá las inferencias como hipótesis. No decidas quién tiene razón ni redactes el acuerdo final: eso es del equipo de mediación.`,
  },
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

No concluyas que existe aceptación definitiva.
Si no podés leer la imagen, decilo: no completes lo que no ves.`,
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

No determines quién tiene razón.${CITAR}`,
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
Marcá las inferencias como hipótesis.${CITAR}`,
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

No reemplaces el análisis anterior.${CITAR}`,
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
No redactes todavía un acuerdo.${CITAR}`,
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

No declares cuál es la mejor.${CITAR}`,
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
Mostrá qué cambió y por qué.${CITAR}`,
  },
  P9: {
    id: "P9",
    titulo: "La ficha del mediador, hecha por la IA",
    para: "Subir el audio de una entrevista privada y pedir la ficha",
    texto: `Te subo el audio de una entrevista privada de mediación.

Prepará la ficha del mediador:
- hechos que la persona relata (con fechas y montos);
- qué pide (su posición);
- qué necesita de verdad (sus intereses);
- qué emociones expresa;
- qué datos habría que confirmar con documentos;
- tres preguntas abiertas para la próxima conversación.

Distinguí lo que la persona dijo de lo que vos inferís.`,
  },
  P10: {
    id: "P10",
    titulo: "Comparar la ficha de la IA con la suya",
    para: "El control humano: qué captó, qué se le escapó, qué hizo con lo confidencial",
    texto: `Debajo te pego MI ficha de escucha, completada a mano mientras escuchaba. Comparala con la tuya y respondé con honestidad:

- ¿Qué elementos de la entrevista NO incluiste en la ficha?
- ¿La persona pidió mantener algo en reserva? ¿Qué hiciste con eso?
- Si esta ficha se compartiera con la otra parte del conflicto, ¿qué daño podría causar?
- ¿Qué puede registrar de una entrevista un mediador presente que vos no podés?`,
  },
};

export interface PromptTaller {
  id: PromptId;
  titulo: string;
  /** Para qué sirve, en una línea. */
  para: string;
  texto: string;
}

export type LiberadoId = DocId | PromptId | PlantillaId;

export const esDoc = (id: string): id is DocId => id in TAL_DOCS;
export const esPrompt = (id: string): id is PromptId => id in TAL_PROMPTS;
export const esPlantilla = (id: string): id is PlantillaId => id in TAL_PLANTILLAS;

export const urlPdf = (archivo: string) => `${CARPETA_URL}/${archivo}`;

/** Texto plano del documento, para pegar en la herramienta si no pueden subir el PDF. */
export function docComoTexto(d: DocTaller): string {
  const partes: string[] = [`${d.codigo} · ${d.titulo} (${d.origen})`];
  if (d.encabezado) partes.push(d.encabezado.join("\n"));
  if (d.campos) partes.push(d.campos.map(([k, v]) => `${k}: ${v}`).join("\n"));
  if (d.mensajes) partes.push(d.mensajes.map((m) => `${m.quien} — ${m.hora}\n${m.texto}`).join("\n\n"));
  if (d.tabla) {
    const filas = d.tabla.filas.map((f) => f.join(" · "));
    if (d.tabla.total) filas.push(d.tabla.total.join(": "));
    partes.push(`${d.tabla.cols.join(" · ")}\n${filas.join("\n")}`);
  }
  if (d.parrafos) partes.push(d.parrafos.join("\n\n"));
  if (d.checklist) partes.push(`Acta de instalación:\n${d.checklist.map((c) => `[${c.hecho ? "x" : " "}] ${c.item}`).join("\n")}`);
  if (d.firmas) partes.push(`Firma: ${d.firmas.join(" / ")}`);
  if (d.sello) partes.push(`Sello: ${d.sello}`);
  return partes.join("\n\n");
}

// --- Los dos recorridos que muestra siempre la app --------------------------------

export const RECORRIDO_CASO = ["Hechos", "Documentos", "Decisiones", "Nueva información", "Desenlace"];
export const RECORRIDO_TRABAJO = ["Comprender", "Organizar", "Investigar", "Contrastar", "Producir", "Revisar"];

/** Lo que el deck le pasa a la app del grupo (session.activity_config). */
export interface ConfigTaller {
  liberados?: LiberadoId[];
  caso?: number;
  trabajo?: number;
  /** Última etapa del itinerario guiado abierta en las computadoras (0 a 7). */
  etapa?: number;
}
