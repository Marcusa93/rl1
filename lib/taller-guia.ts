// ============================================================
// Guía del taller "IA aplicada a la resolución de conflictos" (El Salvador,
// 16 y 17/09/2026): el método, los conceptos y las herramientas, para leer,
// descargar y compartir. Una sola fuente para la página web
// (taller.rossi-ia.com/guia) y el PDF (generado con
// node scripts/gen-taller-guia.mjs).
// ============================================================

export const GUIA_TITULO = "El mediador aumentado";
export const GUIA_BAJADA = "Guía del taller «IA aplicada a la resolución de conflictos»: el método de 8 etapas, los conceptos y las herramientas";
export const GUIA_EVENTO = "Taller práctico · Semana de la Mediación · El Salvador";
export const GUIA_FECHA = "Miércoles 16 y jueves 17 de septiembre de 2026";
export const GUIA_AUTOR = "Dr. Marco Rossi";
export const GUIA_CARGO = "Director del Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT (Argentina)";

export const GUIA_URL = "https://taller.rossi-ia.com/guia";
export const GUIA_PDF = "/taller-ia/guia-mediador-aumentado.pdf";

export const GUIA_LOGOS = [
  { src: "/justicia/logo-pgr.png", alt: "Procuraduría General de la República", fondo: false },
  { src: "/justicia/logo-uees.png", alt: "Universidad Evangélica de El Salvador", fondo: true },
];

export const GUIA_GRACIAS =
  "Gracias a la Procuraduría General de la República y a la Universidad Evangélica de El Salvador por la invitación y la organización, y a cada participante por animarse a mediar con herramientas nuevas sin soltar el criterio propio.";

export interface Enlace {
  emoji: string;
  label: string;
  detalle: string;
  url: string;
}

export const GUIA_REDES: Enlace[] = [
  { emoji: "📸", label: "Instagram", detalle: "@marquitorossi", url: "https://www.instagram.com/marquitorossi" },
  { emoji: "🌐", label: "Plataforma del taller", detalle: "taller.rossi-ia.com", url: "https://taller.rossi-ia.com" },
];

export const GUIA_RECURSERO: Enlace[] = [
  { emoji: "🔵", label: "Gemini", detalle: "Chat, Gems y Deep Research", url: "https://gemini.google.com" },
  { emoji: "💎", label: "Crear un Gem", detalle: "Su asistente con prompt de sistema, en un clic", url: "https://gemini.google.com/gems/create" },
  { emoji: "📓", label: "Notebook Gemini", detalle: "Respuestas desde sus propios documentos y audios", url: "https://notebooklm.google.com" },
  { emoji: "🟢", label: "ChatGPT", detalle: "El equivalente del Gem: un GPT o las instrucciones", url: "https://chatgpt.com" },
  { emoji: "🟠", label: "Claude", detalle: "El equivalente del Gem: un proyecto", url: "https://claude.ai" },
  { emoji: "🧰", label: "La app del taller", detalle: "El caso completo, los audios, los prompts y el acta", url: "https://taller.rossi-ia.com" },
];

export interface Concepto {
  emoji: string;
  termino: string;
  definicion: string;
  clave?: string;
}

export interface Seccion {
  titulo: string;
  bajada: string;
  conceptos: Concepto[];
}

export const GUIA_SECCIONES: Seccion[] = [
  {
    titulo: "El oficio de mediar",
    bajada: "Los conceptos de mediación y resolución alterna que usamos en el caso.",
    conceptos: [
      {
        emoji: "🤝",
        termino: "Mediación",
        definicion:
          "Un procedimiento voluntario en el que un tercero imparcial ayuda a las partes a conversar y a construir su propio acuerdo. Nadie decide por ellas: la solución es de las partes.",
        clave: "En El Salvador la regula la Ley de Mediación, Conciliación y Arbitraje (Decreto 914, año 2002).",
      },
      {
        emoji: "🧭",
        termino: "Los cuatro principios",
        definicion:
          "Voluntariedad (nadie está obligado a quedarse), confidencialidad (lo conversado no puede invocarse en un juicio), imparcialidad (quien media no toma partido) y autocomposición (el acuerdo lo construyen las partes).",
      },
      {
        emoji: "🚪",
        termino: "Caucus (sesión privada)",
        definicion:
          "La reunión a solas del mediador con una parte. Ahí aparece lo que no se dice frente al otro: el préstamo que angustia a Lucía, el error que Diego no quiere admitir.",
        clave: "Lo dicho en caucus solo se usa con autorización de quien lo dijo. Romper esa regla rompe la mediación.",
      },
      {
        emoji: "👂",
        termino: "Escucha activa",
        definicion:
          "Escuchar para entender, no para contestar: parafrasear («si entiendo bien, usted necesita…»), preguntar abierto, tolerar el silencio y registrar la emoción, que también es información.",
        clave: "La ficha de escucha: posiciones, intereses, emociones, datos a confirmar y lo confidencial.",
      },
      {
        emoji: "🎯",
        termino: "Posición e interés",
        definicion:
          "La posición es lo que se pide («que me pague los mil»). El interés es lo que se necesita de verdad (retirar el módulo hoy, cuidar el nombre, abrir el viernes). Los acuerdos duraderos se construyen sobre intereses (Fisher y Ury).",
      },
      {
        emoji: "🧮",
        termino: "MAAN",
        definicion:
          "La Mejor Alternativa a un Acuerdo Negociado: qué le espera a cada parte si NO acuerdan. Conocerla ordena la negociación y suele ser el mejor argumento para acordar.",
        clave: "En el caso: un juicio por USD 1.000, con sus tasas, honorarios y demoras.",
      },
      {
        emoji: "📏",
        termino: "Criterios objetivos",
        definicion:
          "Datos externos que ninguna parte puede discutir: precios de mercado, plazos legales, costos reales. Despersonalizan la discusión: ya no es «mi palabra contra la suya».",
        clave: "Se consiguen investigando y se verifican en la fuente antes de llevarlos a la mesa.",
      },
      {
        emoji: "📝",
        termino: "El acta de acuerdo",
        definicion:
          "El acuerdo se escribe para poder cumplirse: quién hace qué, cuándo, quién paga y qué pasa si falla. Comparecencia, antecedentes, objeto, cláusulas y firmas.",
        clave: "Un acuerdo vago es un conflicto nuevo con fecha posterior.",
      },
    ],
  },
  {
    titulo: "La IA del mediador",
    bajada: "Las habilidades que practicamos. Sirven para cualquier caso y cualquier herramienta.",
    conceptos: [
      {
        emoji: "💬",
        termino: "Prompt y COTIO",
        definicion:
          "La instrucción que se le da al modelo. Un buen prompt tiene cinco piezas: Contexto, Objetivo, Tareas, Input y Output.",
      },
      {
        emoji: "⚙️",
        termino: "Prompt de sistema",
        definicion:
          "Las reglas estables del asistente: rol, límites, fuentes permitidas, formato. Se escribe una vez y ordena todas las consultas.",
        clave: "El P0 del taller: «asistís al equipo de mediación, usá solo lo que yo suba, citá por código, no decidas por mí».",
      },
      {
        emoji: "💎",
        termino: "Gem",
        definicion:
          "Un chat con instrucciones fijas: el prompt de sistema hecho herramienta. En Gemini: menú Gems, «Crear Gem», pegar las instrucciones y guardar.",
        clave: "El equivalente en Claude es un proyecto; en ChatGPT, un GPT o las instrucciones personalizadas.",
      },
      {
        emoji: "🧠",
        termino: "El contexto acumulado",
        definicion:
          "Trabajar todo el caso en una misma conversación: cuando llega la hora del acuerdo, el asistente ya escuchó a las partes, leyó la carpeta y tiene los criterios verificados. Nadie repite el contexto en cada pedido.",
      },
      {
        emoji: "🎙️",
        termino: "Transcribir y ordenar audio",
        definicion:
          "La IA convierte una entrevista de dos minutos en una ficha ordenada en segundos: hechos, fechas, montos, preguntas. Lo que no capta: el tono, el silencio, el miedo, el orgullo.",
      },
      {
        emoji: "🌀",
        termino: "Alucinación y verificación",
        definicion:
          "El modelo puede producir datos falsos con total seguridad: fallos, precios o artículos que no existen. Por eso cada dato entra citado por su fuente («según CN-03, pág. 1») y la fuente se abre y se verifica.",
      },
      {
        emoji: "🔎",
        termino: "Deep Research (agente de investigación)",
        definicion:
          "No es un chat: es un agente que planifica la búsqueda, visita fuentes, las lee, las cruza y entrega un informe con citas. Ideal para conseguir criterios objetivos.",
        clave: "Tarda entre 5 y 15 minutos: se lanza y se sigue trabajando. Del informe se usa solo lo verificado.",
      },
      {
        emoji: "🤫",
        termino: "Confidencialidad e IA",
        definicion:
          "La herramienta no distingue secretos: mezcla lo confidencial con todo lo demás. Lo dicho en un caucus real no entra a una herramienta externa sin autorización y sin anonimizar.",
        clave: "La confidencialidad la custodia el mediador, no la herramienta.",
      },
    ],
  },
  {
    titulo: "El control humano",
    bajada: "La IA asiste; el mediador decide y responde.",
    conceptos: [
      {
        emoji: "🔁",
        termino: "Human in the loop",
        definicion: "La persona interviene en todo el recorrido: pedir con límites, verificar contra la fuente, corregir y aprobar solo lo que puede explicar y defender.",
      },
      {
        emoji: "⚔️",
        termino: "El careo (mediador contra IA)",
        definicion:
          "Comparar la ficha propia con la de la herramienta: qué captó cada uno, qué se le escapó, qué hizo con lo confidencial. La diferencia entre las dos fichas es su valor profesional.",
      },
      {
        emoji: "🕵️",
        termino: "El abogado hostil",
        definicion:
          "Antes de firmar, pedirle a la IA que ataque el propio trabajo: cláusulas ambiguas, incumplimientos sin prever, contradicciones con los documentos. Usted decide qué corregir.",
        clave: "La IA también sirve para encontrar los huecos del propio acuerdo antes de que los encuentre otro.",
      },
      {
        emoji: "✏️",
        termino: "La corrección registrada",
        definicion:
          "Cambiar lo que la IA dijo —y poder decir por qué— es el trabajo del profesional. La señal de alarma es la contraria: aprobar sin leer las fuentes.",
      },
    ],
  },
];

/** El caso, en lugar de doctrina: qué se trabajó y qué produjo cada participante. */
export const GUIA_CASO = {
  titulo: "El caso que trabajamos",
  referencia: "Café Nube c/ TecnoFrío Servicios · todo ficticio",
  puntos: [
    "Una cafetería que debía abrir el viernes, los equipos entregados, la instalación sin terminar y USD 1.000 en discusión.",
    "Escuchamos a cada parte en privado (con su secreto), ordenamos la carpeta CN-00 a CN-13, trajimos criterios objetivos con Deep Research y redactamos el acta.",
    "El giro final —la línea eléctrica de CN-13— puso a prueba cada acuerdo: se ajustó el acta en lugar de empezar de nuevo, como en una mediación real.",
  ],
  productos: ["Ficha de escucha", "Su Gem asistente (P0)", "Matriz de hechos y prueba", "Criterios verificados", "Acta de acuerdo en PDF", "El método de 8 etapas"],
};

/** El método completo: las 8 etapas del taller (espejo de TAL_ETAPAS, sin import para el script de Node). */
export const GUIA_METODO = [
  { paso: "Ustedes median", texto: "El caso, su rol y su asistente." },
  { paso: "Escuchar", texto: "Las entrevistas privadas, primero sin IA." },
  { paso: "La IA escucha", texto: "El mismo audio, procesado por la herramienta. ¿Quién escuchó mejor?" },
  { paso: "La carpeta", texto: "Leer los documentos con la IA, sin soltarle el control." },
  { paso: "La matriz", texto: "Todo el caso en una tabla: hechos, pruebas, contradicciones." },
  { paso: "Investigar", texto: "Deep Research: datos externos que ninguna parte pueda discutir." },
  { paso: "El acuerdo", texto: "De las posiciones a los intereses; de los intereses a las cláusulas." },
  { paso: "El giro", texto: "Llega un documento nuevo. ¿Su acuerdo resiste?" },
];

export const GUIA_WHATSAPP = `https://wa.me/?text=${encodeURIComponent(
  `Guía del taller «${GUIA_TITULO}» (${GUIA_AUTOR}, Semana de la Mediación, El Salvador): ${GUIA_URL}`,
)}`;
