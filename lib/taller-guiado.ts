// ============================================================
// Itinerario guiado del taller: 8 etapas con pasos tipo receta, para que 40
// computadoras avancen solas sin asistencia una por una. La placa del deck da
// el "por qué" (mini-clase) y abre la etapa; la app da el "cómo" (estos pasos).
//
// También viven acá las entrevistas privadas en audio (el caucus), con su
// transcripción oficial, y las misiones de investigación con Deep Research.
// Sin imports de runtime: el script de PDFs y MessIAs lo importan directo.
// ============================================================

import type { DocId, PlantillaId, PromptId } from "./taller-caso";

// --- Entrevistas privadas (caucus) ------------------------------------------------

export type AudioId = "EA1" | "EA2";

export interface AudioCaso {
  id: AudioId;
  /** Código para citar, como los CN. */
  codigo: string;
  /** Archivo en /taller-ia/audios/. */
  archivo: string;
  titulo: string;
  quien: string;
  emoji: string;
  dur: string;
  /** Transcripción oficial (respaldo si falla el audio y para accesibilidad). */
  transcripcion: string[];
}

export const AUDIOS_URL = "/taller-ia/audios";

export const TAL_AUDIOS: Record<AudioId, AudioCaso> = {
  EA1: {
    id: "EA1",
    codigo: "EA-01",
    archivo: "EA-01-lucia.mp3",
    titulo: "Entrevista privada a Lucía Herrera",
    quien: "Lucía Herrera · Café Nube",
    emoji: "☕",
    dur: "2:32",
    transcripcion: [
      "Buenas tardes. Soy Lucía Herrera, de Café Nube. Mire, le cuento: abrimos mañana, viernes, a las seis de la tarde. Bueno… si es que abrimos. A finales de agosto contraté a Diego, de TecnoFrío. Firmamos por la máquina de hielo, la cámara frigorífica y el sistema de refrigeración, todo instalado, por tres mil dólares. El martes llegó con las tres cajas. Yo estaba con los pintores, con el proveedor del café, un desorden. Firmé el papel de que recibía las cajas y le escribí por WhatsApp: «sí, recibimos todo». Y enseguida le aclaré: recibimos las cajas; falta abrirlas y probar que la máquina funcione. Él mismo me había escrito que faltaba un módulo, que llegaba el jueves. Ese mismo martes, en la tarde, le transferí dos mil dólares, como dice el contrato. ¿Y sabe qué me mandó al otro día? Una carta exigiéndome tres mil dólares en cuarenta y ocho horas. ¡Tres mil! Como si no le hubiera pagado nada.",
      "Necesito abrir mañana con la máquina de hielo funcionando. Fíjese que aquí, con este calor, la mitad de lo que vendemos lleva hielo: cafés fríos, frappés, limonadas. El contrato dice clarito que los equipos tienen que quedar funcionando. Yo no me niego a pagar, que quede claro. El saldo se lo pago cuando esté instalado y probado.",
      "Me preocupa quedar mal el primer día. Tengo reservas, invité a gente a la inauguración… Hoy vino un técnico independiente, que lo pedimos los dos. Dijo que la máquina está bien, pero que sin el módulo no funciona en automático. Y dijo algo de la alimentación eléctrica que no terminé de entender. También me preocupa quién responde si la máquina falla la primera semana. Eso lo quiero por escrito. Y con Diego no quiero pelear. Me lo recomendó mi cuñado, trabaja bien, y voy a necesitar mantenimiento todo el año.",
      "Sí… pero que quede entre nosotros. Para abrir el café saqué un préstamo, y la primera cuota vence a fin de mes. Si no abro, no sé cómo la voy a pagar. Si hace falta, le puedo adelantar una parte del saldo para que retire el módulo hoy mismo. Pero solo si me asegura que esta noche queda instalado y probado. No quiero ofrecerlo yo primero, porque después me va a pedir todo.",
    ],
  },
  EA2: {
    id: "EA2",
    codigo: "EA-02",
    archivo: "EA-02-diego.mp3",
    titulo: "Entrevista privada a Diego Molina",
    quien: "Diego Molina · TecnoFrío Servicios",
    emoji: "🔧",
    dur: "1:45",
    transcripcion: [
      "Buenas. Diego Molina, de TecnoFrío Servicios. Tengo doce años en refrigeración; somos yo y un ayudante. A Lucía le hice el presupuesto el veinticinco de agosto, y el primero de septiembre firmamos el contrato: tres mil dólares, con la instalación. Los equipos los compré yo, con mi propio pisto. Los adelanté yo. El martes ocho le llevé las tres cajas al local, y ahí mismo le avisé que el módulo llegaba el jueves. Ella me escribió: «sí, recibimos todo». Púchica, ¿y qué entiende uno con eso? Que recibió todo. Después puso otras cosas, pero lo primero que dijo fue eso. Ese día me transfirió dos mil, eso es cierto. La carta me la ayudó a hacer un conocido que sabe de esas cosas, y puso tres mil, que es el total del contrato. Pero lo que se me debe son mil.",
      "Que me paguen lo que es justo. Yo cumplí con traer los equipos. El módulo es una pieza chiquita, y el proveedor lo tiene para hoy en la tarde. Pero para retirarlo tengo que pagarlo, y pagar el flete. Por eso le pedí los mil dólares. Si me los da, esta misma noche se lo instalo. Mientras tanto, la máquina se puede llenar a mano; no es que no sirva para nada. Y le ofrecí dejarle una máquina de hielo de las mías, prestada por una semana. Eso tiene un costo, claro.",
      "Hay algo que nadie está diciendo: la máquina necesita una línea eléctrica aparte. Eso lo tiene que tener el local; está en el anexo del contrato. Yo se lo dije desde el principio. Si esa línea no está, no es culpa mía. Y me preocupa mi nombre. En este rubro vivimos de la recomendación. Si Lucía anda diciendo que la dejé colgada en la inauguración, me hace daño. Además, me interesa quedarme con el mantenimiento: un café usa los equipos todos los días. A juicio no quiero ir. Sale más caro que lo que se está discutiendo.",
      "Aquí entre nos… el módulo lo tendría que haber pedido antes. Se me pasó, y por eso llega tarde. Y la máquina temporal la tengo parada en el taller; prestarla unos días no me cuesta nada. Con que me adelante quinientos para sacar el módulo, yo pongo el flete y esta noche se la dejo funcionando. Pero eso no se lo diga todavía.",
    ],
  },
};

/** Las cuatro preguntas que el entrevistador hace en cada audio (una por bloque). */
export const PREGUNTAS_ENTREVISTA = [
  "Cuénteme, ¿qué pasó?",
  "¿Qué necesita que pase ahora?",
  "¿Qué le preocupa?",
  "¿Hay algo que quiera decirme solo a mí?",
];

// --- Misiones de investigación (Deep Research) ------------------------------------

export interface MisionResearch {
  id: "A" | "B" | "C";
  emoji: string;
  titulo: string;
  pregunta: string;
  /** Prompt completo para pegar en Deep Research. */
  texto: string;
}

export const TAL_MISIONES: MisionResearch[] = [
  {
    id: "A",
    emoji: "💰",
    titulo: "El precio justo",
    pregunta: "¿Los montos que se discuten son razonables en el mercado?",
    texto: `Investigá precios de mercado en El Salvador (o, si no hay datos locales, en Centroamérica) para:

1. Alquiler semanal de una máquina de hielo comercial (100–150 kg/día).
2. Un módulo automático de alimentación de agua para máquina de hielo comercial (repuesto), y su flete urgente dentro de San Salvador.
3. La instalación de una línea eléctrica independiente para un equipo comercial (materiales y mano de obra).

Entregá una tabla con: concepto, rango de precios, fuente con enlace y fecha del dato. Si un dato no aparece para El Salvador, decilo y usá el país más cercano, aclarándolo. No inventes precios ni fuentes.`,
  },
  {
    id: "B",
    emoji: "📜",
    titulo: "El acuerdo que sirva",
    pregunta: "¿Qué tiene que tener el acuerdo firmado para ser exigible?",
    texto: `Investigá el marco legal de la mediación y la conciliación en El Salvador (en particular la Ley de Mediación, Conciliación y Arbitraje, Decreto 914 de 2002, y sus reformas si existen):

1. ¿Qué requisitos de forma debe cumplir un acuerdo de mediación entre dos comerciantes?
2. ¿Qué efectos tiene el acuerdo firmado? ¿Es título de ejecución? ¿Ante quién se ejecuta si una parte no cumple?
3. ¿La confidencialidad de lo conversado en la mediación está protegida por ley? ¿Con qué alcance?

Entregá las respuestas con el artículo exacto y un enlace a la fuente oficial o académica. Si algo no surge de la norma, decilo; no lo completes.`,
  },
  {
    id: "C",
    emoji: "⚖️",
    titulo: "La alternativa (MAAN)",
    pregunta: "Si NO acuerdan, ¿qué le espera a cada uno en un juicio?",
    texto: `Investigá qué implicaría para un pequeño comerciante de El Salvador reclamar judicialmente unos USD 1.000 por un contrato de provisión e instalación incumplido:

1. ¿Qué tipo de proceso correspondería y ante qué tribunal?
2. ¿Cuánto suele durar un proceso así (plazos legales y duración real si hay datos)?
3. ¿Qué costos implica (tasas, honorarios mínimos de abogado, peritajes)?

Entregá un cuadro con: punto, respuesta, fuente con enlace. Distinguí lo que surge de normas de lo que surge de estadísticas o notas de prensa. Si no hay datos confiables sobre la duración real, decilo.`,
  },
];

// --- Itinerario: etapas y pasos -----------------------------------------------------

export interface PasoTaller {
  /** Id estable: viaja al servidor cuando marcan "Listo" (tablero del deck). */
  id: string;
  titulo: string;
  /** Instrucciones numeradas, exactas, para hacer sin ayuda. */
  hacer: string[];
  /** Piezas que el paso muestra con sus botones. */
  audio?: AudioId;
  prompt?: PromptId;
  docs?: DocId[];
  plantilla?: PlantillaId;
  herramienta?: { label: string; url: string };
  /** Muestra las tres misiones de investigación. */
  misiones?: boolean;
  /** Muestra la ficha de escucha digital (se completa en la app). */
  ficha?: boolean;
  /** Muestra el acta de acuerdo para redactar en la app. */
  acta?: boolean;
  /** Paso opcional, para quienes terminan antes. */
  extra?: boolean;
  nota?: string;
}

export interface EtapaTaller {
  n: number;
  emoji: string;
  titulo: string;
  bajada: string;
  pasos: PasoTaller[];
}

const GEMINI = { label: "Gemini", url: "https://gemini.google.com" };
const NOTEBOOK = { label: "Notebook Gemini", url: "https://notebooklm.google.com" };

export const TAL_ETAPAS: EtapaTaller[] = [
  {
    n: 0,
    emoji: "🤝",
    titulo: "Ustedes median",
    bajada: "El caso, su rol y su asistente.",
    pasos: [
      {
        id: "e0-rol",
        titulo: "Su rol en este taller",
        plantilla: "PLA",
        hacer: [
          "Hoy ustedes NO son abogados de Lucía ni de Diego: son el equipo de mediación.",
          "Su trabajo: entender el conflicto, ayudar a las partes a conversar y construir un acuerdo posible.",
          "Las herramientas de IA son sus asistentes. Las decisiones son suyas.",
          "Descargue la Guía de bolsillo (PL-A) y déjela abierta o a mano: tiene el mapa completo, las reglas de oro y todos los códigos del caso.",
        ],
      },
      {
        id: "e0-caso",
        titulo: "Conozca el caso en dos minutos",
        docs: ["D0"],
        hacer: [
          "Lea la ficha del caso (CN-00), acá abajo o en PDF.",
          "Quédese con lo esencial: una cafetería que abre el viernes, equipos entregados, instalación sin terminar, USD 3.000 en juego.",
        ],
      },
      {
        id: "e0-messias",
        titulo: "Salude a MessIAs",
        hacer: [
          "Toque el botón de MessIAs (abajo a la derecha).",
          "Pregúntele lo que quiera del taller o del caso; por ejemplo: «¿qué es una mediación?».",
          "Úselo cada vez que se trabe: está para eso. No le va a resolver el caso: lo va a guiar.",
        ],
      },
      {
        id: "e0-gem",
        titulo: "Cree su asistente (su primer prompt de sistema)",
        prompt: "P0",
        herramienta: { label: "Crear Gem (directo)", url: "https://gemini.google.com/gems/create" },
        hacer: [
          "Abra gemini.google.com e inicie sesión con una cuenta de Google.",
          "En el menú de la izquierda toque «Explorar Gems» (o «Gems») y luego «Crear Gem». ¿No lo encuentra? Use el botón «Crear Gem (directo)» de acá abajo: lo lleva derecho.",
          "Nombre: «Asistente de mediación». En «Instrucciones», pegue el prompt P0 (botón Copiar de acá abajo). Guarde.",
          "Abra su Gem y escríbale: «presentate en dos líneas». Ya tiene un asistente que conoce su rol.",
          "TODO el taller se trabaja DENTRO de este Gem: cada audio y documento que suba queda en la misma conversación, y el asistente acumula el caso completo.",
          "¿No le aparece Gems? Plan B: abra un chat nuevo, pegue P0 como PRIMER mensaje y no cambie de chat en todo el taller. Es la misma idea: el contexto se construye una vez.",
        ],
      },
    ],
  },
  {
    n: 1,
    emoji: "👂",
    titulo: "Escuchar",
    bajada: "Las entrevistas privadas, primero sin IA.",
    pasos: [
      {
        id: "e1-ficha",
        titulo: "Prepare la ficha de escucha",
        ficha: true,
        plantilla: "PLD",
        hacer: [
          "La ficha se completa ACÁ MISMO, abajo: queda guardada en esta compu.",
          "La va a llenar MIENTRAS escucha: posiciones (qué pide), intereses (qué necesita), emociones, datos a confirmar y lo confidencial.",
          "Si prefiere papel, el PDF PL-D es la misma ficha para tener de guía.",
        ],
      },
      {
        id: "e1-lucia",
        titulo: "Escuche a Lucía (2:32)",
        audio: "EA1",
        ficha: true,
        hacer: [
          "Toque ▶ y escuche la entrevista completa, sin pausa, como en una sesión privada real.",
          "Anote en la ficha (acá abajo), columna Lucía. No busque la frase perfecta: capte lo importante.",
          "Al final, Lucía dice algo «que quede entre nosotros»: va a la fila CONFIDENCIAL.",
        ],
      },
      {
        id: "e1-diego",
        titulo: "Escuche a Diego (1:45)",
        audio: "EA2",
        ficha: true,
        hacer: [
          "Lo mismo con Diego, columna Diego.",
          "Diego también termina con un «no se lo diga todavía»: a la fila CONFIDENCIAL.",
        ],
      },
      {
        id: "e1-confidencial",
        titulo: "El secreto profesional del mediador",
        hacer: [
          "Relea lo que marcó como confidencial de cada parte.",
          "Pregunta clave: ¿ve ya un acuerdo posible que las partes todavía no ven? Escríbalo para usted. No lo comparta: en mediación, lo confidencial solo se usa con autorización de quien lo dijo.",
        ],
      },
    ],
  },
  {
    n: 2,
    emoji: "🎙️",
    titulo: "La IA escucha",
    bajada: "El mismo audio, procesado por la herramienta. ¿Quién escuchó mejor?",
    pasos: [
      {
        id: "e2-subir",
        titulo: "Suba el audio de Lucía a su Gem",
        audio: "EA1",
        prompt: "P9",
        herramienta: GEMINI,
        hacer: [
          "Descargue el audio de Lucía con ⬇️ (queda en su carpeta de Descargas).",
          "Abra su Gem «Asistente de mediación» (en Gemini → Gems). Si usó el plan B, vuelva a SU chat.",
          "Toque el signo + (o el clip 📎) → «Subir archivos» → elija EA-01-lucia.mp3.",
          "Copie el prompt P9 con el botón «Copiar», péguelo y envíe.",
          "Repita con el audio de Diego si le queda tiempo.",
        ],
      },
      {
        id: "e2-comparar",
        titulo: "Compare: usted contra la IA",
        prompt: "P10",
        ficha: true,
        hacer: [
          "En el mismo chat del Gem, pegue el prompt P10 y, debajo, SU ficha: botón «Copiar mi ficha» (acá abajo) y pegar. Envíe.",
          "Lea con atención: ¿qué captó cada uno? ¿Qué solo captó usted (el tono, el miedo, el orgullo)?",
          "Y lo central: ¿qué hizo la IA con lo que cada parte pidió mantener en reserva? ¿Lo marcó como confidencial o lo mezcló con todo?",
          "Esa es la lección de esta etapa: la confidencialidad la custodia el mediador, no la herramienta.",
        ],
      },
    ],
  },
  {
    n: 3,
    emoji: "📂",
    titulo: "La carpeta",
    bajada: "Leer los documentos con la IA, sin soltarle el control.",
    pasos: [
      {
        id: "e3-captura",
        titulo: "La captura aislada (la prueba de Diego)",
        docs: ["D1"],
        prompt: "P1",
        hacer: [
          "Descargue CN-01 (la captura de WhatsApp que aporta Diego) y súbala a su Gem, en la misma conversación de siempre.",
          "Es una imagen: primero pruebe si la herramienta la lee.",
          "Envíe el prompt P1. Fíjese que la IA no dé por probado lo que la captura no dice.",
        ],
      },
      {
        id: "e3-chat",
        titulo: "La conversación completa (la prueba de Lucía)",
        docs: ["D2"],
        hacer: [
          "Ahora suba CN-02: el mismo chat, completo, exportado por Lucía.",
          "Pregúntele a la IA: «¿cambia tu análisis con la conversación completa? ¿Qué significa ahora el “sí, recibimos todo”?»",
          "Lección: el contexto cambia el documento. Una captura aislada no es la conversación.",
        ],
      },
      {
        id: "e3-contrato",
        titulo: "El contrato y su anexo técnico",
        docs: ["D3", "D4"],
        prompt: "P3",
        hacer: [
          "Suba CN-03 (contrato) y CN-04 (anexo técnico) al mismo chat.",
          "Envíe el prompt P3: obligaciones de cada parte, con su respaldo textual.",
          "Subraye la cláusula CUARTA: «siempre que el local cuente con las conexiones necesarias». Va a importar.",
        ],
      },
      {
        id: "e3-comerciales",
        titulo: "Extra: los papeles del negocio",
        docs: ["D11", "D12", "D13"],
        prompt: "P2",
        extra: true,
        hacer: [
          "¿Terminó antes? Suba CN-05 (presupuesto), CN-06 (remito) y CN-07 (transferencia).",
          "Pregunta guía: ¿cuánto se pagó, cuándo, y qué decía el remito sobre lo pendiente?",
        ],
      },
    ],
  },
  {
    n: 4,
    emoji: "🗺️",
    titulo: "La matriz",
    bajada: "Todo el caso en una tabla: hechos, pruebas, contradicciones.",
    pasos: [
      {
        id: "e4-docs",
        titulo: "Complete la carpeta",
        docs: ["D5", "D6", "D7"],
        hacer: [
          "Suba lo que falta: CN-08 (reclamo de Diego), CN-09 (respuesta de Lucía) y CN-10 (informe técnico).",
          "Ya tiene el expediente completo hasta hoy.",
        ],
      },
      {
        id: "e4-matriz",
        titulo: "Pida la matriz de hechos y prueba",
        plantilla: "PLB",
        prompt: "P4",
        hacer: [
          "Envíe el prompt P4. Puede descargar la plantilla PL-B para ver el formato esperado (o subirla).",
          "Revise la tabla FILA POR FILA contra los documentos: ¿cada afirmación cita bien su fuente?",
          "Corrija al menos un error o marque una inferencia como hipótesis. La corrección es el trabajo del profesional.",
        ],
      },
      {
        id: "e4-contraparte",
        titulo: "Extra: mirar con los ojos del otro",
        prompt: "P5",
        extra: true,
        hacer: ["Envíe el prompt P5: la IA revisa el expediente como si fuera la contraparte. Sirve para encontrar los puntos débiles del propio análisis."],
      },
    ],
  },
  {
    n: 5,
    emoji: "🔎",
    titulo: "Investigar",
    bajada: "Deep Research: datos externos que ninguna parte pueda discutir.",
    pasos: [
      {
        id: "e5-mision",
        titulo: "Elija su misión",
        misiones: true,
        hacer: [
          "Un buen mediador trae CRITERIOS OBJETIVOS: datos de afuera que las partes no puedan discutir.",
          "Elija UNA misión (idealmente, repártanse con las compus vecinas): A el precio justo, B el acuerdo que sirva, C la alternativa al juicio.",
        ],
      },
      {
        id: "e5-lanzar",
        titulo: "Lance la investigación y NO espere",
        herramienta: GEMINI,
        hacer: [
          "Deep Research corre FUERA del Gem: en Gemini, abra un chat nuevo y elija «Deep Research» (en el selector de herramientas o modelos).",
          "Copie el prompt de su misión, péguelo y envíe. Gemini propone un plan: toque «Iniciar investigación».",
          "IMPORTANTE: tarda entre 5 y 15 minutos. Déjelo trabajando en esa pestaña y siga con la etapa siguiente. Vuelva después.",
        ],
      },
      {
        id: "e5-verificar",
        titulo: "Cuando termine: verifique antes de usar",
        hacer: [
          "Vuelva a la pestaña de Deep Research y lea el informe.",
          "Elija los 3 datos más útiles para la mediación y ABRA el enlace de la fuente de cada uno: ¿existe? ¿dice eso?",
          "Un dato sin fuente verificada no entra a la mediación. Igual que un precedente sin verificar no entra a un escrito.",
          "Pegue los 3 datos verificados en su Gem: «Criterios objetivos verificados: …». Así su asistente los tiene para el acuerdo.",
        ],
      },
    ],
  },
  {
    n: 6,
    emoji: "📝",
    titulo: "El acuerdo",
    bajada: "De las posiciones a los intereses; de los intereses a las cláusulas.",
    pasos: [
      {
        id: "e6-intereses",
        titulo: "Separe posiciones de intereses",
        prompt: "P6",
        hacer: [
          "Envíe el prompt P6 en su Gem: a esta altura, el asistente ya tiene los audios, los documentos y sus criterios verificados.",
          "Compare con su ficha de escucha: ¿la IA encontró los mismos intereses que usted? ¿Le faltó alguno que solo estaba en el tono de voz?",
        ],
      },
      {
        id: "e6-opciones",
        titulo: "Ponga las opciones sobre la mesa",
        prompt: "P7",
        hacer: [
          "Envíe el prompt P7 describiendo las alternativas que ve (la propuesta de Diego en CN-12, lo que pide Lucía en CN-11, y las que usted imagine).",
          "Si su Deep Research ya terminó, agregue los datos verificados: «considerá además que el alquiler de una máquina temporal cuesta…».",
        ],
      },
      {
        id: "e6-borrador",
        titulo: "Redacte el acta de acuerdo",
        acta: true,
        hacer: [
          "El acta se redacta ACÁ MISMO, sobre el documento: complete los espacios punteados y corrija el texto de cada cláusula como le parezca. Se guarda sola.",
          "Puede pedirle un borrador de cláusula a su Gem y pegarlo, pero las decisiones (montos, fechas, quién paga qué) son suyas.",
          "¿Necesita pactar algo más? «+ Agregar una cláusula». No se olvide de la preocupación de Lucía: ¿quién responde si la máquina falla la primera semana?",
          "Cuando esté conforme: «Descargar en PDF» (elija destino «Guardar como PDF»). Es su producto del taller.",
        ],
      },
    ],
  },
  {
    n: 7,
    emoji: "⚡",
    titulo: "El giro",
    bajada: "Llega un documento nuevo. ¿Su acuerdo resiste?",
    pasos: [
      {
        id: "e7-giro",
        titulo: "La constancia del electricista",
        docs: ["D10"],
        prompt: "P8",
        hacer: [
          "Se incorpora CN-13: la constancia técnica de la instalación eléctrica. Léala.",
          "Súbala y envíe el prompt P8: qué conclusiones se mantienen, cuáles cambian.",
          "La línea independiente no está instalada, cuesta USD 180 y el contrato no dice quién la paga. ¿Su acuerdo lo había previsto?",
        ],
      },
      {
        id: "e7-ajuste",
        titulo: "Ajuste su acta",
        acta: true,
        hacer: [
          "Su acta sigue acá, tal como la dejó. Ajuste lo que haga falta: ¿quién contrata al electricista? ¿quién paga los 180? ¿cambia la fecha de la prueba? (La cláusula CUARTA lo espera.)",
          "Así funciona una mediación real: el acuerdo se construye, se tensiona y se vuelve a construir.",
          "Cuando cierre la versión final: «Descargar en PDF».",
        ],
      },
      {
        id: "e7-cierre",
        titulo: "Puesta en común",
        hacer: [
          "Cuando el docente lo pida, responda la actividad que aparece arriba: su mejor dato de la investigación y su palabra de cierre.",
          "Guarde sus PDFs completados: la ficha PL-D y el acuerdo PL-E son su producto del taller.",
        ],
      },
    ],
  },
];

export const TAL_ETAPA_MAX = TAL_ETAPAS.length - 1;

export function getEtapa(n: number): EtapaTaller | undefined {
  return TAL_ETAPAS.find((e) => e.n === n);
}
