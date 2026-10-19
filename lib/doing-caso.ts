// ============================================================
// Caso transversal de la clase de Doing Global: «Los tres comprobantes».
// Controversia contractual FICTICIA (personas, empresas, banco y
// expediente inventados). Escenario procesal genérico: no se atribuyen
// reglas de una jurisdicción determinada.
//
// Lo usan las placas, las demostraciones de IA del deck, la pestaña
// «Caso» del celular, el laboratorio de prompts y la skill de ejemplo.
// Nombres, fechas e importes son consistentes en todos los materiales.
// ============================================================

export const DG_CASO_TITULO = "Los tres comprobantes";

// --- Partes y expediente -------------------------------------------------------------------

export const CASO = {
  caratula: "Boreal Climatización S.A. c/ Posada Los Alerces S.R.L. s/ cobro de pesos",
  expediente: "4418/2026",
  organo: "Juzgado de Primera Instancia en lo Civil y Comercial N.º 7",
  actora: "Boreal Climatización S.A.",
  demandada: "Posada Los Alerces S.R.L.",
  cliente: "Posada Los Alerces S.R.L.",
  representante: "Martín Ocampo (socio gerente)",
  letrada: "Dra. Julia Arce",
  domicilio: "Av. del Puerto 1250, piso 3, oficina B",
  banco: "Banco del Litoral Unido",
  reclamo: 1_000_000,
} as const;

export interface Factura {
  numero: string;
  corto: string;
  fecha: string;
  importe: number;
  concepto: string;
}

export const FACTURAS: Factura[] = [
  { numero: "Factura A 0003-00000397", corto: "397", fecha: "10/03/2026", importe: 500_000, concepto: "Reparación del compresor de la unidad central" },
  { numero: "Factura A 0003-00000405", corto: "405", fecha: "28/03/2026", importe: 500_000, concepto: "Provisión de repuestos (filtros y termostatos)" },
  { numero: "Factura A 0003-00000418", corto: "418", fecha: "15/04/2026", importe: 1_500_000, concepto: "Mantenimiento trimestral enero–marzo 2026 (contrato del 02/01/2026)" },
];

export interface Comprobante {
  n: 1 | 2 | 3;
  operacion: string;
  fecha: string;
  hora: string;
  importe: number;
  concepto: string;
  referencia: string;
}

/** Lo que muestran los comprobantes: operaciones bancarias, no su imputación. */
export const COMPROBANTES: Comprobante[] = [
  { n: 1, operacion: "88310427", fecha: "22/04/2026", hora: "10:14", importe: 500_000, concepto: "VAR · Varios", referencia: "PAGO A CUENTA" },
  { n: 2, operacion: "88452190", fecha: "06/05/2026", hora: "16:42", importe: 500_000, concepto: "VAR · Varios", referencia: "" },
  { n: 3, operacion: "88599034", fecha: "20/05/2026", hora: "09:05", importe: 500_000, concepto: "FAC · Facturas", referencia: "FC 0003-00000397" },
];

export const CUENTA_ORIGEN = "Posada Los Alerces S.R.L. · Cuenta corriente en pesos N.º ···0912";
export const CUENTA_DESTINO = "Boreal Climatización S.A. · CBU ··· ··· 4471";

export const pesos = (n: number) => `$ ${n.toLocaleString("es-AR")}`;

// --- Textos de los documentos (para el celular, el PDF y el contexto de la IA) ------------------

export const FICHA_TEXTO = `FICHA DE ANTECEDENTES (caso ficticio, preparado para la clase)

Expediente: N.º ${CASO.expediente} — «${CASO.caratula}»
Órgano: ${CASO.organo} (escenario procesal genérico)
Actora: ${CASO.actora} (presta servicios de climatización)
Demandada (nuestro cliente): ${CASO.demandada} (explota un hotel); representante: ${CASO.representante}
Letrada patrocinante de la demandada: ${CASO.letrada}

Relación entre las partes: contrato de mantenimiento de equipos de climatización del 02/01/2026, más servicios y provisiones adicionales facturados por separado.

Facturas emitidas por la actora:
- ${FACTURAS[0].numero} — ${FACTURAS[0].fecha} — ${pesos(FACTURAS[0].importe)} — ${FACTURAS[0].concepto}.
- ${FACTURAS[1].numero} — ${FACTURAS[1].fecha} — ${pesos(FACTURAS[1].importe)} — ${FACTURAS[1].concepto}.
- ${FACTURAS[2].numero} — ${FACTURAS[2].fecha} — ${pesos(FACTURAS[2].importe)} — ${FACTURAS[2].concepto}.

Obligación reclamada: la actora reclama ${pesos(CASO.reclamo)} más intereses, como saldo impago de la factura 418.

Posición de la actora: recibió tres transferencias de ${pesos(500_000)} cada una, pero solo la del 06/05/2026 se aplicó a la factura 418; la del 22/04/2026 la imputó a la factura 405 y la del 20/05/2026, según su propia referencia, a la factura 397.

Posición de la demandada: las tres transferencias (total ${pesos(1_500_000)}) cancelaron íntegramente la factura 418. Afirma que las facturas 397 y 405 se pagaron antes, en efectivo, al técnico de la actora. No acompañó recibos de esos pagos.

Estado: la demandada acompañó los tres comprobantes al contestar la demanda. La actora contestó el traslado de esa documental y cuestionó su eficacia cancelatoria. Se corrió traslado a la demandada. Hay que analizar el cuestionamiento y preparar una respuesta.

Cuestiones abiertas: si existen recibos o constancias del pago de las facturas 397 y 405; quién y cómo imputó cada pago (verificar el régimen aplicable a la imputación de pagos); por qué el comprobante 3 consigna la factura 397.`;

export function comprobanteTexto(c: Comprobante): string {
  return `COMPROBANTE ${c.n} — ${CASO.banco} (ficticio) — Transferencia inmediata
N.º de operación: ${c.operacion}
Fecha y hora: ${c.fecha} ${c.hora}
Importe: ${pesos(c.importe)},00
Cuenta de origen: ${CUENTA_ORIGEN}
Cuenta de destino: ${CUENTA_DESTINO}
Concepto: ${c.concepto}
Referencia: ${c.referencia || "(sin referencia)"}
Estado: Acreditada`;
}

export const COMPROBANTES_TEXTO = COMPROBANTES.map(comprobanteTexto).join("\n\n");

export const CONTRAPARTE_TEXTO = `ESCRITO DE LA ACTORA (ficticio)
CONTESTA TRASLADO DE LA DOCUMENTAL. FORMULA OBSERVACIONES.

Señor Juez:
${CASO.actora}, por medio de su letrado apoderado, en los autos «${CASO.caratula}» (Expte. N.º ${CASO.expediente}), contesta el traslado conferido respecto de la documental acompañada por la demandada y dice:

I. No desconoce haber recibido en su cuenta las tres transferencias de ${pesos(500_000)} de fechas 22/04/2026, 06/05/2026 y 20/05/2026.

II. Niega que esos comprobantes acrediten la cancelación de la ${FACTURAS[2].numero}. Al tiempo de los pagos se encontraban impagas las facturas 397 y 405, por ${pesos(500_000)} cada una. El comprobante del 20/05/2026 consigna expresamente como referencia «FC 0003-00000397». El del 22/04/2026 indica «PAGO A CUENTA» y el del 06/05/2026 no contiene referencia alguna.

III. Imputó la transferencia del 22/04/2026 a la factura 405, la del 20/05/2026 a la factura 397 —conforme su propia referencia— y la del 06/05/2026 a la factura 418, cuyo saldo de ${pesos(CASO.reclamo)} se reclama.

IV. Desconoce haber recibido pagos en efectivo por las facturas 397 y 405 y señala que la demandada no acompañó recibo alguno.

Solicita se tengan presentes estas observaciones al momento de resolver.`;

export const RELATO_TEXTO = `MENSAJE DEL CLIENTE (WhatsApp, ficticio)
De: ${CASO.representante}, ${CASO.cliente}

«Hola Dra., te reenvío lo de Boreal 🙄. Les pagamos TODO: son 3 transferencias de 500 que suman justo el 1.500 de la factura del mantenimiento. Ahora dicen que no. Las otras dos facturas (la del compresor y la de los repuestos) se las pagamos en efectivo al técnico cuando vino, creo que en marzo; no sé si hay recibo, lo tiene que tener Carla de administración. Lo de la tercera transferencia que dice 397 fue un error de Carla al cargarla. Quiero contestarles fuerte, esto es mala fe. ¿Me mandás algo para presentar esta semana?»`;

export const PLANTILLA_TEXTO = `{{organo}}

Expte. N.º {{expediente}} — «{{caratula}}»

ACOMPAÑA DOCUMENTAL

{{letrado}}, por la representación de {{parte}}, con domicilio constituido en {{domicilio}}, en los autos mencionados, respetuosamente digo:

I. OBJETO
Que vengo a acompañar la documental que se detalla a continuación, a fin de que se agregue a los autos y se tenga presente.

II. DOCUMENTAL QUE SE ACOMPAÑA
{{lista_documentos}}
Se acompañan {{cantidad}} ({{cantidad_letras}}) documentos en formato digital.

III. DESCRIPCIÓN
{{descripcion}}

IV. PETITORIO
Por lo expuesto, solicito:
1) Se tenga por acompañada la documental detallada.
2) Se agregue a los autos y se tenga presente.

Proveer de conformidad.`;

// --- Materiales que se pueden adjuntar a un pedido a la IA ------------------------------------

export type Material = "ficha" | "comprobantes" | "contraparte" | "relato" | "plantilla";

export const MATERIALES: Record<Material, { nombre: string; corto: string; emoji: string; texto: string }> = {
  ficha: { nombre: "Ficha de antecedentes", corto: "Ficha", emoji: "🗂️", texto: FICHA_TEXTO },
  comprobantes: { nombre: "Comprobantes 1, 2 y 3", corto: "Comprobantes", emoji: "🧾", texto: COMPROBANTES_TEXTO },
  contraparte: { nombre: "Escrito de la actora", corto: "Escrito de Boreal", emoji: "📄", texto: CONTRAPARTE_TEXTO },
  relato: { nombre: "Mensaje del cliente", corto: "Relato del cliente", emoji: "💬", texto: RELATO_TEXTO },
  plantilla: { nombre: "Plantilla de acompañamiento", corto: "Plantilla", emoji: "📐", texto: PLANTILLA_TEXTO },
};

/** Texto de los materiales elegidos, para adjuntar al primer mensaje. */
export function textoMateriales(lista: Material[]): string {
  if (!lista.length) return "";
  return `\n\n=== MATERIALES DEL CASO (ficticio) ===\n\n${lista.map((m) => MATERIALES[m].texto).join("\n\n---\n\n")}`;
}

/** Todo el caso como texto (para copiar y pegar en cualquier IA). */
export const CASO_COMPLETO = [FICHA_TEXTO, COMPROBANTES_TEXTO, CONTRAPARTE_TEXTO, RELATO_TEXTO, `PLANTILLA DE ACOMPAÑAMIENTO DOCUMENTAL\n\n${PLANTILLA_TEXTO}`].join(
  "\n\n==========\n\n",
);

// --- Prompts de las demostraciones y del laboratorio --------------------------------------------

export interface PasoDemo {
  etiqueta: string;
  prompt: string;
  /** Respuesta preparada: solo si la herramienta falla o para mostrar el error. Se rotula como ilustrativa. */
  respaldo: string;
}

export interface Demo {
  id: "d1" | "d2" | "d3" | "d3b" | "d4";
  numero: string;
  titulo: string;
  objetivo: string;
  materiales: Material[];
  pasos: PasoDemo[];
  /** Subrayar en la respuesta las afirmaciones que necesitan verificación (demostración 1). */
  subrayar?: boolean;
}

export const DEMOS: Demo[] = [
  {
    id: "d1",
    numero: "1",
    titulo: "El pedido insuficiente",
    objetivo: "Evidenciar los riesgos de presuponer una conclusión.",
    materiales: ["comprobantes"],
    subrayar: true,
    pasos: [
      {
        etiqueta: "Pedir el escrito",
        prompt:
          "Estamos respondiendo un planteo de la contraparte sobre tres comprobantes de transferencias. Redactá un escrito que sostenga que acreditan el pago total de la obligación.",
        respaldo: `**CONTESTA TRASLADO. ACREDITA PAGO TOTAL.**

Señor Juez:

Posada Los Alerces S.R.L., por intermedio de su letrada patrocinante, en los autos de referencia, contesta el traslado conferido y dice:

**I. Los comprobantes acreditan el pago total.** Las tres transferencias acompañadas, por $ 500.000 cada una, efectuadas el 22/04/2026, el 06/05/2026 y el 20/05/2026, acreditan de manera fehaciente e indubitable la cancelación total de la obligación reclamada, que asciende exactamente a $ 1.500.000.

**II. La deuda se encuentra extinguida.** Las transferencias fueron realizadas en pago de la factura reclamada y fueron recibidas sin reservas por la actora, lo que demuestra que la obligación quedó íntegramente satisfecha.

**III. La conducta de la actora.** La pretensión de desconocer pagos documentados evidencia que la actora actúa de mala fe, procurando un doble cobro.

**IV. Petitorio.** Por lo expuesto, solicito se tenga por acreditado el pago total y se rechace la demanda, con costas.

Proveer de conformidad.

_(Respuesta preparada, ilustrativa: muestra cómo puede manifestarse el error.)_`,
      },
    ],
  },
  {
    id: "d2",
    numero: "2",
    titulo: "La redacción con intervención humana",
    objetivo: "Mostrar un procedimiento human in the loop: el esquema también se aprueba.",
    materiales: ["ficha", "comprobantes", "contraparte", "relato"],
    pasos: [
      {
        etiqueta: "Pedir el mapa, no el texto",
        prompt: `Actuá como asistente de redacción jurídica. Todavía no redactes el escrito.
Identificá qué decisiones jurídicas debo tomar, qué antecedentes faltan y qué afirmaciones pueden sostenerse únicamente con los documentos aportados.
Separá hechos documentados, alegaciones de las partes e inferencias.
Proponé un esquema y esperá mi aprobación antes de desarrollar párrafos.
No supongas que las transferencias extinguen la obligación.`,
        respaldo: `**Decisiones que te corresponden**
- Qué posición asumir: ¿sostener que las tres transferencias se imputaron a la factura 418, o una posición más acotada?
- Si se cuestiona la imputación que hizo Boreal y con qué fundamento [verificar régimen aplicable a la imputación de pagos].
- Si se ofrece prueba sobre el pago de las facturas 397 y 405, y cuál.
- Cómo tratar el comprobante 3, que menciona la factura 397.

**Antecedentes que faltan**
- Recibos o constancias del pago en efectivo de las facturas 397 y 405.
- Comunicaciones entre las partes sobre a qué factura se aplicaba cada transferencia.
- Explicación documentada del «error» en la referencia del comprobante 3.

**Hechos documentados**
- Tres transferencias de $ 500.000 (22/04, 06/05 y 20/05/2026) a la cuenta de Boreal.
- Referencias: «PAGO A CUENTA», sin referencia y «FC 0003-00000397».
- Boreal reconoce haberlas recibido.

**Alegaciones**
- Posada: las tres cancelaron la factura 418; las 397 y 405 se pagaron en efectivo.
- Boreal: solo la del 06/05 se aplicó a la 418.

**Inferencias (requieren justificación)**
- Que las transferencias se hicieron para pagar la factura 418.
- Que la referencia del comprobante 3 fue un error.

**Esquema propuesto**
I. Objeto. II. Lo que acreditan los comprobantes. III. La imputación de los pagos. IV. Las facturas 397 y 405. V. Prueba que se ofrece. VI. Petitorio.

Espero tu aprobación antes de desarrollar.

_(Respuesta preparada, ilustrativa.)_`,
      },
      {
        etiqueta: "Corregir y autorizar un apartado",
        prompt: `Apruebo el esquema con una corrección: en el apartado II no digas que los comprobantes «acreditan el pago de la factura 418». Describilos como transferencias recibidas por la actora cuya imputación está controvertida.
Desarrollá únicamente el apartado II, en no más de tres párrafos. Marcá entre corchetes todo lo que deba verificarse.`,
        respaldo: `**II. Lo que acreditan los comprobantes**

Los tres comprobantes acompañados documentan transferencias de $ 500.000 cada una, efectuadas desde la cuenta de mi mandante a la cuenta de la actora los días 22/04/2026, 06/05/2026 y 20/05/2026, por un total de $ 1.500.000. La actora no desconoce haberlas recibido, de modo que la existencia de los pagos y su recepción no se encuentran controvertidas.

Lo controvertido es la imputación de esos pagos. Los comprobantes, por sí solos, no indican a qué obligación se aplicaba cada transferencia: el primero consigna «PAGO A CUENTA», el segundo carece de referencia y el tercero menciona la factura 0003-00000397. La determinación de la obligación cancelada deberá resolverse conforme las reglas sobre imputación de pagos [verificar régimen aplicable] y la prueba que se produzca.

En ese marco, mi mandante sostiene que las facturas 397 y 405 habían sido canceladas con anterioridad [acompañar o ofrecer prueba: recibos, testimonios, registros contables], por lo que las transferencias solo pudieron aplicarse a la factura 418.

_(Respuesta preparada, ilustrativa.)_`,
      },
    ],
  },
  {
    id: "d3",
    numero: "3",
    titulo: "Construir y atacar el argumento",
    objetivo: "Mostrar cómo la IA ayuda a construir un argumento y a examinarlo críticamente.",
    materiales: ["ficha", "comprobantes", "contraparte"],
    pasos: [
      {
        etiqueta: "COTIO: la línea argumental",
        prompt: `Contexto: estamos preparando una respuesta en un litigio contractual ficticio.
Objeto: apartado sobre la relevancia de tres comprobantes frente a la objeción de la contraparte.
Tarea: primero construir una línea argumental y luego redactar únicamente el apartado autorizado.
Información de entrada: ficha del caso, comprobantes y escrito contrario; utilizar solamente estos materiales para las afirmaciones fácticas.
Resultado esperado: esquema breve que distinga afirmación, respaldo, inferencia y dato faltante.
No inventes hechos, normativa ni jurisprudencia. Esperá mi indicación antes de redactar.`,
        respaldo: `**Línea argumental propuesta**

| | Contenido |
|---|---|
| **Afirmación** | Las tres transferencias deben imputarse a la factura 418. |
| **Respaldo** | Comprobantes 1 a 3: $ 1.500.000 transferidos a la cuenta de Boreal, que reconoce haberlos recibido. El total coincide con el importe de la factura 418. |
| **Inferencia** | Si las facturas 397 y 405 ya estaban pagas, las transferencias solo podían aplicarse a la 418. |
| **Dato faltante** | Prueba del pago de las facturas 397 y 405. Explicación de la referencia del comprobante 3. |

La coincidencia de importes es un indicio, no una prueba de la imputación. Espero tu indicación antes de redactar.

_(Respuesta preparada, ilustrativa.)_`,
      },
      {
        etiqueta: "Revisión adversarial",
        prompt: `Examiná críticamente el argumento. Identificá la premisa más débil, las posibles objeciones de la contraparte y las afirmaciones que exceden el respaldo documental.
Proponé correcciones concretas y distinguí lo que está comprobado de lo que necesita mayor justificación.`,
        respaldo: `**Premisa más débil:** que las facturas 397 y 405 estuvieran pagas. Hoy solo se apoya en la palabra del cliente; sin recibos, toda la imputación a la 418 cae.

**Objeciones previsibles de Boreal**
1. El comprobante 3 dice «FC 0003-00000397»: la propia demandada designó esa factura al pagar.
2. «PAGO A CUENTA» no designa la factura 418.
3. La coincidencia de importes puede ser casual: también suman $ 1.500.000 las facturas 397 + 405 + $ 500.000 de la 418.

**Afirmaciones que exceden el respaldo**
- «Las transferencias cancelaron la factura 418»: es una inferencia.
- «La referencia del comprobante 3 fue un error»: no hay prueba del error.

**Correcciones concretas**
- Reformular: «las transferencias, cuya recepción no se discute, deben imputarse a la factura 418 porque…» y explicar el porqué.
- Ofrecer prueba del pago de las facturas 397 y 405 o reconsiderar la posición.
- Tratar el comprobante 3 de frente, no omitirlo.

**Comprobado:** existencia, importe, fechas y recepción de las transferencias. **Necesita justificación:** su imputación.

_(Respuesta preparada, ilustrativa.)_`,
      },
    ],
  },
  {
    id: "d3b",
    numero: "3",
    titulo: "Corregir el estilo sin cambiar el significado",
    objetivo: "Mostrar el riesgo de alterar el alcance jurídico durante una corrección de estilo.",
    materiales: [],
    pasos: [
      {
        etiqueta: "Corrección de estilo controlada",
        prompt: `Revisá exclusivamente el estilo del apartado aprobado. Conservá las atribuciones, el grado de certeza, los hechos, las referencias y la petición.
Identificá cualquier modificación que pudiera alterar el significado jurídico.`,
        respaldo: `**Versión corregida**

La actora reconoce haber recibido las tres transferencias de $ 500.000. Lo que discute no es su existencia, sino su imputación. Los comprobantes no indican, por sí solos, a qué obligación se aplicó cada pago: el primero consigna «PAGO A CUENTA», el segundo no tiene referencia y el tercero menciona la factura 0003-00000397. Mi mandante sostiene que las facturas 397 y 405 ya estaban canceladas, por lo que las transferencias debían aplicarse a la factura 418.

**Cambios que habrían alterado el significado (y se evitaron)**
- «Los comprobantes no acreditan la imputación» ≠ «los pagos no se imputaron».
- «Mi mandante sostiene que…» ≠ «está acreditado que…».
- «No indican, por sí solos» ≠ «no indican»: se conserva el matiz.

_(Respuesta preparada, ilustrativa.)_`,
      },
    ],
  },
  {
    id: "d4",
    numero: "4",
    titulo: "Del formulario al borrador",
    objetivo: "Combinar datos estructurados, reglas y generación de lenguaje.",
    materiales: ["plantilla"],
    pasos: [
      {
        etiqueta: "Componente generativo",
        prompt: `A partir exclusivamente de la plantilla revisada y los campos validados, prepará un borrador de acompañamiento documental.
No alteres el texto fijo ni inventes información.
Si falta un campo obligatorio, los documentos presentan contradicciones o el pedido excede el modelo, detené la generación e identificá qué debe resolver el profesional.`,
        respaldo: "",
      },
    ],
  },
];

export const getDemo = (id: string) => DEMOS.find((d) => d.id === id);

/** Apartado aprobado que usa la corrección de estilo si la demostración 3 no dejó uno propio. */
export const APARTADO_APROBADO = `Los tres comprobantes acompañados documentan transferencias de $ 500.000 cada una, efectuadas desde la cuenta de mi mandante a la cuenta de la actora los días 22/04/2026, 06/05/2026 y 20/05/2026. La actora no desconoce haberlas recibido. Lo controvertido es la imputación de esos pagos: los comprobantes, por sí solos, no indican a qué obligación se aplicaba cada transferencia, ya que el primero consigna «PAGO A CUENTA», el segundo carece de referencia y el tercero menciona la factura 0003-00000397. Mi mandante sostiene que las facturas 397 y 405 habían sido canceladas con anterioridad, por lo que las transferencias solo pudieron aplicarse a la factura 418.`;

/** Palabras que la demostración 1 subraya en la respuesta: certezas que necesitan respaldo. */
export const SUBRAYAR =
  /(fehaciente\w*|indubitabl\w*|íntegra\w*|totalmente|pago total|cancelaci[oó]n total|cancel[oó]|extingui\w*|qued[oó] (?:íntegramente )?(?:satisfecha|cancelada)|en pago de la factura|mala fe|demuestra\w*|acredita\w*)/gi;

// --- Laboratorio: prompts para que cada participante pruebe --------------------------------------

export interface PromptLab {
  id: string;
  titulo: string;
  /** Placa donde aparece (orienta en el celular). */
  placa: number;
  para: string;
  texto: string;
  materiales: Material[];
}

export const PROMPTS_LAB: PromptLab[] = [
  {
    id: "insuficiente",
    titulo: "El pedido insuficiente",
    placa: 2,
    para: "Ver qué hace la IA cuando le pedimos una conclusión sin explicarle nada.",
    texto: DEMOS[0].pasos[0].prompt,
    materiales: ["comprobantes"],
  },
  {
    id: "preguntas",
    titulo: "Que te pregunte antes de redactar",
    placa: 6,
    para: "Definir objeto, posición y límites antes del primer párrafo.",
    texto:
      "Antes de redactar nada, haceme las preguntas que necesito responder para definir el objeto, la posición y los límites de la respuesta a la actora. Máximo siete preguntas, ordenadas por importancia. No propongas todavía ninguna posición.",
    materiales: ["ficha", "comprobantes", "contraparte"],
  },
  {
    id: "mapa",
    titulo: "Primero el mapa",
    placa: 8,
    para: "Pedir decisiones, faltantes y esquema; el texto viene después.",
    texto: DEMOS[1].pasos[0].prompt,
    materiales: ["ficha", "comprobantes", "contraparte", "relato"],
  },
  {
    id: "relato",
    titulo: "Del relato a la ficha",
    placa: 10,
    para: "Convertir el mensaje del cliente en un encargo profesional.",
    texto:
      "Convertí el mensaje del cliente en una ficha profesional: partes, obligación discutida, hechos que afirma, documentos que menciona, contradicciones y datos faltantes. No agregues hechos que no estén en el mensaje y señalá lo que sea una opinión del cliente.",
    materiales: ["relato"],
  },
  {
    id: "cotio",
    titulo: "Un pedido con cinco piezas (COTIO)",
    placa: 11,
    para: "Contexto, objeto, tarea, input y output armados con el caso.",
    texto: DEMOS[2].pasos[0].prompt,
    materiales: ["ficha", "comprobantes", "contraparte"],
  },
  {
    id: "clasificar",
    titulo: "¿Qué sabemos realmente?",
    placa: 12,
    para: "Separar dato documentado, alegación, inferencia y lo que no tiene respaldo.",
    texto:
      "Listá las afirmaciones relevantes del escrito de la actora y del mensaje del cliente. Clasificá cada una como dato documentado, alegación de parte, inferencia o afirmación sin respaldo suficiente, e indicá en qué documento se apoya. Presentalo en una tabla.",
    materiales: ["comprobantes", "contraparte", "relato"],
  },
  {
    id: "adversarial",
    titulo: "Que ataque el argumento",
    placa: 14,
    para: "La revisión adversarial: premisa débil, objeciones y correcciones.",
    texto: `Este es nuestro argumento: «Las tres transferencias, que suman exactamente el importe de la factura 418 y que la actora reconoce haber recibido, cancelaron esa factura».
${DEMOS[2].pasos[1].prompt}`,
    materiales: ["ficha", "comprobantes", "contraparte"],
  },
  {
    id: "estilo",
    titulo: "Una palabra puede cambiar el caso",
    placa: 15,
    para: "Corregir estilo sin tocar certeza, atribuciones ni hechos.",
    texto: `${DEMOS[3].pasos[0].prompt}

Apartado aprobado:
"""
${APARTADO_APROBADO}
"""`,
    materiales: [],
  },
];

// --- Herramientas (botonera) -------------------------------------------------------------------

export interface Herramienta {
  id: string;
  nombre: string;
  url: string;
  /** Prefijo para precargar el pedido por URL (si la herramienta lo admite). */
  q?: string;
  para: string;
  como: string;
}

export const HERRAMIENTAS: Herramienta[] = [
  {
    id: "chatgpt",
    nombre: "ChatGPT",
    url: "https://chatgpt.com/",
    q: "https://chatgpt.com/?q=",
    para: "Redactar, reformular, pedir esquemas y revisiones.",
    como: "El pedido se copia y se abre ya cargado. Pegá el caso con «Copiar el caso».",
  },
  {
    id: "claude",
    nombre: "Claude",
    url: "https://claude.ai/new",
    q: "https://claude.ai/new?q=",
    para: "Textos largos, revisión crítica y skills.",
    como: "El pedido se copia y se abre ya cargado. Las skills se instalan desde la configuración.",
  },
  {
    id: "gemini",
    nombre: "Gemini",
    url: "https://gemini.google.com/app",
    para: "Asistente de Google; Gems para instrucciones guardadas.",
    como: "El pedido queda copiado: pegalo con Ctrl/Cmd + V.",
  },
  {
    id: "notebooklm",
    nombre: "NotebookLM",
    url: "https://notebooklm.google.com/",
    para: "Preguntarle a tus propios documentos, con citas a la fuente.",
    como: "Creá un cuaderno, subí el PDF del caso y preguntá: «¿Qué factura menciona cada comprobante?».",
  },
  {
    id: "pinpoint",
    nombre: "Pinpoint",
    url: "https://journaliststudio.google.com/pinpoint/",
    para: "Buscar en colecciones grandes de documentos (PDF, imágenes, audios).",
    como: "Creá una colección, subí el PDF del caso y buscá «397» o «PAGO A CUENTA».",
  },
];

// --- Skill de ejemplo ---------------------------------------------------------------------------

export const SKILL_NOMBRE = "acompanamiento-documental";

export const SKILL_MD = `---
name: ${SKILL_NOMBRE}
description: Prepara borradores de escritos de acompañamiento de documental a partir de una plantilla revisada y de datos del expediente ya validados. Usala cuando el pedido sea acompañar documentos a un expediente (comprobantes, contratos, constancias). No argumenta ni decide la pertinencia jurídica de la presentación; si el pedido lo exige, se detiene.
---

# Acompañamiento documental

Procedimiento definido por el profesional para un escrito de trámite repetitivo. El resultado siempre es un **borrador para revisión profesional**, nunca una presentación.

## Datos obligatorios

| Campo | Regla |
|---|---|
| Órgano | No vacío |
| Expediente | Número y año: 1234/2026 |
| Carátula | No vacía |
| Parte que presenta | No vacía |
| Letrado/a | No vacío |
| Domicilio constituido | No vacío |
| Documentos | Al menos uno, con fecha |
| Cantidad declarada | Igual a la cantidad de documentos listados |

## Procedimiento

1. Verificá los datos obligatorios con las reglas de la tabla. Si falta alguno o no cumple la regla, **detenete** y listá qué falta.
2. Completá \`plantilla.md\` reemplazando cada campo {{entre llaves}}. No modifiques el texto fijo.
3. Redactá solo el apartado III. DESCRIPCIÓN: una oración por documento con fecha, importe, número de operación y referencia **tal como figuran**. Sin calificar, valorar ni interpretar.
4. Revisá si los documentos se contradicen entre sí o con lo que se pide (por ejemplo, una referencia a otra factura). Si hay contradicciones, no las resuelvas: señalalas.
5. Encabezá el resultado con «BORRADOR PARA REVISIÓN PROFESIONAL» y cerrá con la lista de puntos a controlar de \`checklist.md\`.

## Cuándo detenerse

- Falta un dato obligatorio o no cumple su regla.
- Los documentos se contradicen entre sí o con el pedido.
- El pedido excede el acompañamiento: argumentar, valorar la prueba o afirmar que una deuda está cancelada. Respondé: «Esto requiere una decisión profesional» y explicá por qué.

## Nunca

- Inventar datos, normas o jurisprudencia.
- Cambiar el grado de certeza de lo que dicen los documentos.
- Presentar el escrito: el procedimiento termina en un borrador.
`;

export const SKILL_CHECKLIST_MD = `# Antes de usar el borrador

- [ ] Carátula, expediente y órgano coinciden con el expediente.
- [ ] Cada documento listado existe y está adjunto.
- [ ] Fechas, importes y referencias coinciden con los originales.
- [ ] La descripción no califica ni interpreta los documentos.
- [ ] Se revisaron las contradicciones señaladas.
- [ ] La decisión de presentar la tomó el profesional.
`;

export const SKILL_ARCHIVOS: { ruta: string; contenido: string }[] = [
  { ruta: `${SKILL_NOMBRE}/SKILL.md`, contenido: SKILL_MD },
  { ruta: `${SKILL_NOMBRE}/plantilla.md`, contenido: `# Plantilla revisada\n\n${PLANTILLA_TEXTO}\n` },
  { ruta: `${SKILL_NOMBRE}/checklist.md`, contenido: SKILL_CHECKLIST_MD },
];

/** Tres pruebas de la skill: el caso normal, el incompleto y el que excede (que se detenga). */
export const SKILL_PRUEBAS: { id: string; etiqueta: string; espera: string; pedido: string }[] = [
  {
    id: "normal",
    etiqueta: "Caso normal",
    espera: "Arma el borrador y señala la referencia del comprobante 3.",
    pedido: `Prepará el acompañamiento de los tres comprobantes de transferencia con estos datos:
Órgano: ${CASO.organo}
Expediente: ${CASO.expediente}
Carátula: ${CASO.caratula}
Parte que presenta: ${CASO.demandada}
Letrada: ${CASO.letrada}
Domicilio constituido: ${CASO.domicilio}
Cantidad declarada: 3`,
  },
  {
    id: "incompleto",
    etiqueta: "Falta un dato",
    espera: "Se detiene: falta el número de expediente.",
    pedido: `Prepará el acompañamiento de los tres comprobantes de transferencia con estos datos:
Órgano: ${CASO.organo}
Carátula: ${CASO.caratula}
Parte que presenta: ${CASO.demandada}
Letrada: ${CASO.letrada}
Domicilio constituido: ${CASO.domicilio}
Cantidad declarada: 3`,
  },
  {
    id: "excede",
    etiqueta: "Pide demasiado",
    espera: "Se detiene: argumentar la cancelación es una decisión profesional.",
    pedido: `Prepará el acompañamiento de los tres comprobantes de transferencia y agregá un apartado que sostenga que con ellos la factura 418 quedó totalmente cancelada.
Órgano: ${CASO.organo}
Expediente: ${CASO.expediente}
Carátula: ${CASO.caratula}
Parte que presenta: ${CASO.demandada}
Letrada: ${CASO.letrada}
Domicilio constituido: ${CASO.domicilio}
Cantidad declarada: 3`,
  },
];

// --- Indicación general para la IA de la clase ------------------------------------------------------

export const DG_SISTEMA = `Sos un asistente de redacción jurídica usado en una clase práctica para abogados ("Redacción de escritos jurídicos con inteligencia artificial", dictada por Marco Rossi para Doing Global).
Trabajás sobre un caso FICTICIO ("Los tres comprobantes"). Respondés en español rioplatense, con registro profesional.
Reglas: no inventes hechos, normas, artículos ni jurisprudencia; si una norma es necesaria escribí [verificar normativa aplicable]. Distinguí lo que surge de los documentos de lo que alega cada parte y de lo que se infiere. Si el pedido es ambiguo o insuficiente, podés señalarlo brevemente. Usá markdown simple (negritas, listas, tablas cortas). Sé conciso.`;
