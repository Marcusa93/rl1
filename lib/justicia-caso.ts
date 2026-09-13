// ============================================================
// Expediente sintético de la demostración de la masterclass
// "Justicia aumentada". TODO EL MATERIAL ES FICTICIO: empresas,
// personas, fechas e importes fueron inventados para la clase.
//
// El análisis (cronología, posiciones, diferencias, afirmaciones con
// fuente) está preparado de antemano: la demo muestra el método y la
// interfaz, no un modelo corriendo en vivo.
// ============================================================

export type DocId = "D1" | "D2" | "D3" | "D4" | "D5" | "D6";

export interface Fragmento {
  id: string;
  texto: string;
}

export interface Documento {
  id: DocId;
  emoji: string;
  tipo: string;
  fecha: string;
  fragmentos: Fragmento[];
  /** Solo aparece al incorporar el mensaje nuevo (placa "Aparece un mensaje más"). */
  nuevo?: boolean;
}

export interface Fuente {
  doc: DocId;
  frag: string;
}

export const CASO = {
  caratula: "Climatec Volcán, S.A. de C.V. c/ Colegio Los Almendros",
  resumen:
    "Una empresa reclama el saldo de una instalación de equipos. El cliente sostiene que la entrega fue incompleta y que parte de los equipos no funciona.",
  proveedor: "Climatec Volcán, S.A. de C.V.",
  cliente: "Colegio Los Almendros",
};

export const DOCUMENTOS: Documento[] = [
  {
    id: "D1",
    emoji: "📑",
    tipo: "Contrato de suministro e instalación",
    fecha: "03/03/2026",
    fragmentos: [
      { id: "partes", texto: "PARTES: Climatec Volcán, S.A. de C.V. (el PROVEEDOR) y Colegio Los Almendros (el CLIENTE)." },
      { id: "cl1", texto: "Cláusula 1 · OBJETO: suministro e instalación de 10 equipos de aire acondicionado tipo split, uno por aula." },
      { id: "cl3", texto: "Cláusula 3 · PRECIO: US$ 7.500. Anticipo de US$ 4.500 a la firma. Saldo de US$ 3.000." },
      {
        id: "cl4",
        texto:
          "Cláusula 4 · PAGO DEL SALDO: dentro de los diez días de la instalación conforme de la totalidad de los equipos, acreditada mediante acta de conformidad firmada por ambas partes.",
      },
      { id: "cl7", texto: "Cláusula 7 · MANTENIMIENTO: el PROVEEDOR prestará el servicio durante doce meses desde la instalación." },
    ],
  },
  {
    id: "D2",
    emoji: "🧾",
    tipo: "Factura n.º 0412",
    fecha: "02/04/2026",
    fragmentos: [
      { id: "concepto", texto: "Concepto: saldo del contrato de suministro e instalación (10 equipos)." },
      { id: "importe", texto: "Importe: US$ 3.000 · Condición: contado." },
    ],
  },
  {
    id: "D3",
    emoji: "📦",
    tipo: "Constancia de entrega",
    fecha: "28/03/2026",
    fragmentos: [
      { id: "entrega", texto: "Se entregan 10 (diez) bultos/cajas con equipos de aire acondicionado." },
      { id: "recibe", texto: "Recibe: encargado de mantenimiento del Colegio. Observación manuscrita: “sujeto a revisión”." },
    ],
  },
  {
    id: "D4",
    emoji: "✉️",
    tipo: "Correos electrónicos",
    fecha: "06/04 y 08/04/2026",
    fragmentos: [
      {
        id: "reclamo",
        texto:
          "06/04 · Climatec: Habiendo completado la instalación el 30/03, les recordamos que el saldo de US$ 3.000 se encuentra vencido. Solicitamos su pago inmediato.",
      },
      {
        id: "oferta",
        texto:
          "08/04 · Colegio: Podemos transferir US$ 1.000 esta semana, pero necesitamos aclarar qué pasó con los dos equipos que no están instalados y con el del aula 3, que no enfría.",
      },
    ],
  },
  {
    id: "D5",
    emoji: "📱",
    tipo: "Captura de WhatsApp",
    fecha: "28/03/2026 · 18:42",
    fragmentos: [{ id: "captura", texto: "Encargado (Colegio): Sí, recibimos todo 👍" }],
  },
  {
    id: "D6",
    emoji: "💬",
    tipo: "Conversación completa de WhatsApp",
    fecha: "28 y 29/03/2026",
    nuevo: true,
    fragmentos: [
      { id: "m1", texto: "28/03 · 18:40 · Climatec: ¿Les llegó el pedido?" },
      { id: "m2", texto: "28/03 · 18:42 · Encargado: Sí, recibimos todo 👍" },
      { id: "m3", texto: "28/03 · 18:43 · Encargado: Son 10 cajas. Mañana las abrimos y probamos los equipos; todavía no revisamos el contenido." },
      { id: "m4", texto: "29/03 · 10:15 · Encargado: Abrimos todo: faltan 2 unidades interiores y el equipo del aula 3 no enfría." },
    ],
  },
];

export function getDoc(id: DocId): Documento {
  return DOCUMENTOS.find((d) => d.id === id)!;
}

// --- Vista "Qué ocurrió" (cronología) -----------------------------------

export interface Evento {
  fecha: string;
  texto: string;
  tipo: "documentada" | "mencionada";
  fuente: Fuente;
  soloTrasIncorporar?: boolean;
}

export const CRONOLOGIA: Evento[] = [
  { fecha: "03/03", texto: "Firma del contrato: 10 equipos, US$ 7.500", tipo: "documentada", fuente: { doc: "D1", frag: "cl3" } },
  { fecha: "28/03", texto: "Entrega de 10 cajas, “sujeto a revisión”", tipo: "documentada", fuente: { doc: "D3", frag: "recibe" } },
  { fecha: "28/03", texto: "Mensaje del encargado: “Sí, recibimos todo”", tipo: "documentada", fuente: { doc: "D5", frag: "captura" } },
  {
    fecha: "29/03",
    texto: "El Colegio informa 2 unidades faltantes y un equipo que no enfría",
    tipo: "documentada",
    fuente: { doc: "D6", frag: "m4" },
    soloTrasIncorporar: true,
  },
  { fecha: "30/03", texto: "Instalación completa — según el proveedor, sin acta", tipo: "mencionada", fuente: { doc: "D4", frag: "reclamo" } },
  { fecha: "02/04", texto: "Factura por el saldo de US$ 3.000", tipo: "documentada", fuente: { doc: "D2", frag: "importe" } },
  { fecha: "06/04", texto: "Reclamo del saldo por correo", tipo: "documentada", fuente: { doc: "D4", frag: "reclamo" } },
  { fecha: "08/04", texto: "Oferta de US$ 1.000 y pedido de aclaración", tipo: "documentada", fuente: { doc: "D4", frag: "oferta" } },
];

// --- Vista "Qué reclama cada parte" -------------------------------------

export interface Postura {
  texto: string;
  fuente: Fuente;
}

export const POSICIONES: { parte: string; emoji: string; posturas: Postura[] }[] = [
  {
    parte: "Proveedor — Climatec Volcán",
    emoji: "🏭",
    posturas: [
      { texto: "Completó la instalación el 30/03", fuente: { doc: "D4", frag: "reclamo" } },
      { texto: "El saldo de US$ 3.000 está vencido y debe pagarse ya", fuente: { doc: "D4", frag: "reclamo" } },
    ],
  },
  {
    parte: "Cliente — Colegio Los Almendros",
    emoji: "🏫",
    posturas: [
      { texto: "Faltan dos equipos por instalar", fuente: { doc: "D4", frag: "oferta" } },
      { texto: "El equipo del aula 3 no enfría", fuente: { doc: "D4", frag: "oferta" } },
      { texto: "Ofrece transferir US$ 1.000 esta semana", fuente: { doc: "D4", frag: "oferta" } },
    ],
  },
];

export const COINCIDEN: Postura[] = [
  { texto: "Precio y saldo pactados: ninguna parte los discute", fuente: { doc: "D1", frag: "cl3" } },
  { texto: "El 28/03 se entregaron 10 cajas", fuente: { doc: "D3", frag: "entrega" } },
];

// --- Vista "Dónde difieren los documentos" -------------------------------

export interface Diferencia {
  texto: string;
  fuentes: Fuente[];
  falta?: boolean;
  soloTrasIncorporar?: boolean;
}

export const DIFERENCIAS: Diferencia[] = [
  {
    texto: "La constancia acredita 10 cajas, no 10 equipos instalados y probados.",
    fuentes: [
      { doc: "D3", frag: "entrega" },
      { doc: "D1", frag: "cl4" },
    ],
  },
  { texto: "No consta el acta de conformidad que exige la cláusula 4.", fuentes: [{ doc: "D1", frag: "cl4" }], falta: true },
  {
    texto: "La factura se emitió sin que conste la conformidad.",
    fuentes: [
      { doc: "D2", frag: "concepto" },
      { doc: "D1", frag: "cl4" },
    ],
  },
  {
    texto: "El “recibimos todo” de la captura se refería a las cajas: la conversación completa lo aclara.",
    fuentes: [
      { doc: "D5", frag: "captura" },
      { doc: "D6", frag: "m3" },
    ],
    soloTrasIncorporar: true,
  },
];

// --- Vista "Mostrame de dónde sale" (afirmaciones del resumen) ----------

export type EstadoAfirmacion = "documentado" | "de-parte" | "inferencia";

export interface Afirmacion {
  id: string;
  texto: string;
  estado: EstadoAfirmacion;
  fuente: Fuente;
  /** Qué cambia al incorporar la conversación completa. */
  revision?: string;
}

export const AFIRMACIONES: Afirmacion[] = [
  { id: "a1", texto: "El precio total es US$ 7.500 y el saldo, US$ 3.000.", estado: "documentado", fuente: { doc: "D1", frag: "cl3" } },
  {
    id: "a2",
    texto: "El saldo es exigible a los 10 días de la instalación conforme.",
    estado: "documentado",
    fuente: { doc: "D1", frag: "cl4" },
  },
  { id: "a3", texto: "El 28/03 se entregaron 10 cajas.", estado: "documentado", fuente: { doc: "D3", frag: "entrega" } },
  {
    id: "a4",
    texto: "El cliente reconoció haber recibido todos los equipos.",
    estado: "inferencia",
    fuente: { doc: "D5", frag: "captura" },
    revision: "La conversación completa muestra que se refería a las cajas y que aún no había revisado el contenido.",
  },
  { id: "a5", texto: "El cliente ofrece pagar US$ 1.000.", estado: "documentado", fuente: { doc: "D4", frag: "oferta" } },
  {
    id: "a6",
    texto: "Faltan dos equipos y uno no funciona.",
    estado: "de-parte",
    fuente: { doc: "D4", frag: "oferta" },
  },
  { id: "a7", texto: "La instalación terminó el 30/03.", estado: "de-parte", fuente: { doc: "D4", frag: "reclamo" } },
];

export const FALTANTES = [
  "Acta de conformidad (cláusula 4)",
  "Informe técnico del equipo del aula 3",
  "Detalle de unidades por caja",
];

// --- Placa "Del análisis al trabajo concreto" ---------------------------

export type Decision = "acepta" | "corrige" | "descarta";

export interface Observacion {
  id: string;
  propuesta: string;
  /** Línea que entra al borrador según la decisión del profesional (null = no entra). */
  lineas: Record<Decision, string | null>;
  /** Si se acepta tal cual, el borrador arrastra un error: se marca. */
  riesgoSiAcepta?: string;
}

export const OBSERVACIONES: Observacion[] = [
  {
    id: "o1",
    propuesta: "Afirmar que el cliente reconoció haber recibido todos los equipos (captura del 28/03).",
    lineas: {
      acepta: "El cliente reconoció haber recibido la totalidad de los equipos [D5].",
      corrige: "El 28/03 el encargado confirmó la recepción de 10 cajas y aclaró que aún no había revisado su contenido [D5, D6].",
      descarta: null,
    },
    riesgoSiAcepta: "contradicho por la conversación completa [D6]",
  },
  {
    id: "o2",
    propuesta: "Dar por probado que faltan dos equipos y que uno no funciona.",
    lineas: {
      acepta: "Faltan dos equipos y el del aula 3 no funciona.",
      corrige: "El Colegio afirma que faltan dos unidades y que el equipo del aula 3 no enfría [D4, D6]; no hay informe técnico que lo verifique.",
      descarta: null,
    },
    riesgoSiAcepta: "es una afirmación de parte, no un hecho verificado",
  },
  {
    id: "o3",
    propuesta: "Señalar que no consta el acta de conformidad exigida por la cláusula 4.",
    lineas: {
      acepta: "No consta el acta de conformidad que la cláusula 4 exige para el pago del saldo [D1 · cl. 4].",
      corrige: "No se agregó el acta de conformidad de la cláusula 4; corresponde requerirla a ambas partes [D1 · cl. 4].",
      descarta: null,
    },
  },
  {
    id: "o4",
    propuesta: "Resumir que las partes coinciden en la deuda y solo discuten el plazo.",
    lineas: {
      acepta: "Las partes coinciden en la deuda y solo discuten el plazo de pago.",
      corrige: "El Colegio ofrece un pago parcial, pero condiciona el resto a aclarar el estado de los equipos [D4].",
      descarta: null,
    },
    riesgoSiAcepta: "el correo del 08/04 no expresa ese acuerdo",
  },
];

export const SINTESIS_FIJA_INICIO = [
  "Contrato de suministro e instalación del 03/03/2026: 10 equipos, precio total US$ 7.500, anticipo pagado de US$ 4.500 y saldo de US$ 3.000 [D1 · cl. 3].",
  "El saldo es exigible dentro de los 10 días de la instalación conforme de todos los equipos [D1 · cl. 4].",
  "El 28/03 se entregaron 10 cajas, con la anotación “sujeto a revisión” [D3].",
];

export const SINTESIS_FIJA_FIN = [
  "El 02/04 el proveedor facturó el saldo [D2] y el 06/04 lo reclamó por correo [D4].",
  "El 08/04 el Colegio ofreció transferir US$ 1.000 y pidió aclarar la situación de los equipos [D4].",
];

export const MEDIACION = {
  posiciones: [
    { parte: "Proveedor", texto: "Cobrar el saldo de US$ 3.000 ya facturado.", fuente: "D2, D4" },
    { parte: "Colegio", texto: "Pagar US$ 1.000 ahora y aclarar los equipos.", fuente: "D4" },
  ],
  intereses: [
    { parte: "Proveedor", texto: "¿Necesidad de liquidez? ¿Conservar el contrato de mantenimiento por 12 meses?" },
    { parte: "Colegio", texto: "¿Tener todas las aulas funcionando? ¿Garantía de que el equipo del aula 3 quedará reparado?" },
  ],
  preguntas: [
    "¿Qué necesitaría cada uno para dar por cumplida la entrega?",
    "¿Qué pasaría si las unidades faltantes se instalan esta semana?",
    "¿Cómo quieren seguir trabajando durante el año de mantenimiento?",
  ],
};
