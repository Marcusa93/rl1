// ============================================================
// Clase "Web3, descentralización y gobernanza" — Diplomatura en
// Derecho 5.0 (UMSA).
//
// Dos rutas: /web3 es la app del alumno (entra con su nombre, vota
// y escribe desde el celular) y /web3/clase es la presentación que
// el docente comparte por Zoom. La placa manda: al llegar a una
// placa de actividad, la presentación la activa sola vía la API y
// muestra los resultados en vivo incrustados.
// ============================================================

import type { ActivityKey } from "./types";
import type { DiagramaW3Id } from "@/components/web3/diagramas";

export const W3_SLUG = "web3";
export const W3_TITLE = "Web3, descentralización y gobernanza";
export const W3_SUBTITLE = "De la palabra al algoritmo";
export const W3_MATERIA = "Diplomatura en Derecho 5.0 · Transformación digital de la abogacía — UMSA";
export const W3_LINK = "rl1-beige.vercel.app/web3";
export const W3_QR_PLATAFORMA = "/web3/qr-plataforma.png";

/** Polling (ms): el alumno consulta solo la sesión; los agregados los pide el deck. */
export const W3_POLL = { alumno: 4000, alumnoMe: 20000, deck: 2500 } as const;

// --- Actividades interactivas -------------------------------------------

export type W3ActKind = "encuesta" | "opciones" | "chips" | "texto" | "palabra";

export interface W3Opcion {
  id: string;
  emoji: string;
  label: string;
}
export interface W3Pregunta {
  id: string;
  q: string;
  opciones: W3Opcion[];
}

export interface W3Actividad {
  key: ActivityKey;
  kind: W3ActKind;
  titulo: string;
  bajada: string;
  /** kind "encuesta" */
  preguntas?: W3Pregunta[];
  /** kind "opciones" (una sola) o "chips" (varias) */
  opciones?: W3Opcion[];
  /** kind "chips": opción que deselecciona a las demás */
  exclusiva?: string;
  /** kind "texto" */
  placeholder?: string;
  maxChars?: number;
}

export const W3_ACTIVIDADES: W3Actividad[] = [
  {
    key: "w3_encuesta",
    kind: "encuesta",
    titulo: "Encuesta relámpago",
    bajada: "Tres preguntas para leer a la sala.",
    preguntas: [
      {
        id: "cripto",
        q: "¿Alguna vez compraste o usaste cripto?",
        opciones: [
          { id: "varias", emoji: "🪙", label: "Sí, varias veces" },
          { id: "alguna", emoji: "🤏", label: "Alguna vez" },
          { id: "nunca", emoji: "🚫", label: "Nunca" },
        ],
      },
      {
        id: "phishing",
        q: "¿Te llegó alguna vez un intento de phishing?",
        opciones: [
          { id: "note", emoji: "🎣", label: "Sí, y lo noté" },
          { id: "casi", emoji: "😅", label: "Sí, y casi caigo" },
          { id: "no", emoji: "🤷", label: "Creo que no" },
        ],
      },
      {
        id: "firmar",
        q: "¿Dejarías que una IA haga un trámite simple por vos?",
        opciones: [
          { id: "si", emoji: "✅", label: "Sí" },
          { id: "depende", emoji: "⚖️", label: "Depende cuál" },
          { id: "no", emoji: "❌", label: "No" },
        ],
      },
    ],
  },
  {
    key: "w3_confianza",
    kind: "opciones",
    titulo: "¿A quién le confiás tu plata hoy?",
    bajada: "Elegí una. Es anónimo en la pantalla.",
    opciones: [
      { id: "banco", emoji: "🏦", label: "Banco tradicional" },
      { id: "billetera", emoji: "📱", label: "Billetera digital" },
      { id: "efectivo", emoji: "🛏️", label: "Efectivo, bajo el colchón" },
      { id: "cripto", emoji: "₿", label: "Cripto" },
    ],
  },
  {
    key: "w3_cual",
    kind: "opciones",
    titulo: "¿Cuál es real?",
    bajada: "Mirá las dos en la pantalla compartida y votá.",
    opciones: [
      { id: "a", emoji: "🅰️", label: "La A" },
      { id: "b", emoji: "🅱️", label: "La B" },
    ],
  },
  {
    key: "w3_probar",
    kind: "texto",
    titulo: "Aparece un audio con tu voz pidiendo plata",
    bajada: "Vos sabés que es falso. Sos abogado/a: ¿qué hacés primero para probarlo?",
    placeholder: "Primero…",
    maxChars: 200,
  },
  {
    key: "w3_delegar",
    kind: "chips",
    titulo: "¿Qué dejarías que un agente haga solo?",
    bajada: "Sin pedirte confirmación. Marcá todas las que aceptarías.",
    opciones: [
      { id: "borradores", emoji: "📝", label: "Redactar borradores" },
      { id: "agenda", emoji: "📅", label: "Agendar y responder mails" },
      { id: "pagos", emoji: "💸", label: "Pagar facturas chicas" },
      { id: "escrito", emoji: "⚖️", label: "Presentar un escrito" },
      { id: "nada", emoji: "✋", label: "Nada sin mi ok" },
    ],
    exclusiva: "nada",
  },
  {
    key: "w3_dao",
    kind: "opciones",
    titulo: "Votemos como una DAO",
    bajada: "Propuesta nº 1 de la DAO-Diplo: “destinar el 10% del tesoro común a marketing”.",
    opciones: [
      { id: "favor", emoji: "✅", label: "A favor" },
      { id: "contra", emoji: "❌", label: "En contra" },
      { id: "abstencion", emoji: "😐", label: "Me abstengo" },
    ],
  },
  {
    key: "w3_palabra",
    kind: "palabra",
    titulo: "Una palabra que te llevás",
    bajada: "De esta clase, o de toda la diplomatura. Va a la pantalla.",
    maxChars: 22,
  },
];

export function getW3Actividad(key: string): W3Actividad | undefined {
  return W3_ACTIVIDADES.find((a) => a.key === key);
}

// --- Placas del deck -----------------------------------------------------

export interface W3Portada {
  t: "portada";
  activa: ActivityKey;
}
export interface W3Ingreso {
  t: "ingreso";
  activa: ActivityKey;
}
export interface W3Placa {
  t: "placa";
  titulo: string;
  bajada: string;
  lede?: string;
  pills?: string[];
  diagrama: DiagramaW3Id;
  /** Botón para salir a una demo en vivo (ej. explorador de blockchain). */
  link?: { url: string; label: string };
  /** Momento de demo física en el aula (ej. mostrar el visor Quest 3). */
  demo?: string;
}
export interface W3SlideActividad {
  t: "actividad";
  activa: ActivityKey;
  escena: string;
  /** Imágenes A/B incrustadas en la placa (ej. el juego "¿cuál es real?"). */
  imagenes?: { a: string; b: string };
}
export interface W3Final {
  t: "final";
}
export type W3Slide = (W3Portada | W3Ingreso | W3Placa | W3SlideActividad | W3Final) & {
  parte?: string;
};

export const W3_SLIDES: W3Slide[] = [
  { t: "portada", activa: "lobby" },
  { t: "ingreso", activa: "lobby" },
  { t: "actividad", activa: "w3_encuesta", escena: "Para arrancar" },

  // --- Parte I · De la palabra al algoritmo ------------------------------
  {
    t: "placa",
    parte: "Parte I · De la palabra al algoritmo",
    titulo: "La confianza viene primero",
    bajada: "Antes de cualquier tecnología, hubo que aprender a creer en otros.",
    diagrama: "palabra",
  },
  {
    t: "placa",
    titulo: "Cuando alcanzaba con la palabra",
    bajada: "La confianza empezó siendo personal.",
    diagrama: "aldea",
  },
  {
    t: "placa",
    titulo: "Después fuimos demasiados",
    bajada: "Conocer personalmente al otro dejó de ser posible.",
    diagrama: "escala",
  },
  {
    t: "placa",
    titulo: "Inventamos quién diera fe",
    bajada: "Sellos, firmas, documentos y autoridades.",
    pills: ["sellos", "firmas", "documentos", "escribanos", "registros", "jueces"],
    diagrama: "certificar",
  },
  {
    t: "placa",
    titulo: "El Derecho también es tecnología",
    bajada: "Organiza confianza entre personas que no se conocen.",
    diagrama: "derecho",
  },
  {
    t: "placa",
    titulo: "Después digitalizamos la confianza",
    bajada: "Del papel pasamos a cuentas, plataformas y sistemas.",
    diagrama: "evolucion",
  },
  {
    t: "placa",
    titulo: "Los intermediarios no desaparecieron",
    bajada: "Sólo cambiaron de forma.",
    diagrama: "internet",
  },
  { t: "actividad", activa: "w3_confianza", escena: "A ver la sala" },
  {
    t: "placa",
    titulo: "¿Y si sacamos al centro?",
    bajada: "Web3 intenta distribuir algunas formas de confianza.",
    diagrama: "sincentro",
  },
  {
    t: "placa",
    titulo: "Esto se puede ver",
    bajada: "Una blockchain es también un registro que podemos consultar.",
    diagrama: "bloques",
    link: { url: "https://mempool.space/es", label: "Abrir un explorador de blockchain ↗" },
  },
  {
    t: "placa",
    titulo: "La confianza cambió de lugar",
    bajada: "No desapareció: cambió la infraestructura.",
    diagrama: "enquien",
    lede: "No dejamos de necesitar confianza. Cambiamos la forma de producirla.",
  },

  // --- Parte II · ¿Cómo sabemos que sos vos? -----------------------------
  {
    t: "placa",
    parte: "Parte II · ¿Cómo sabemos que sos vos?",
    titulo: "Ahora el problema sos vos",
    bajada: "¿Cómo sabemos que realmente sos quien decís ser?",
    diagrama: "sosvos",
  },
  {
    t: "placa",
    titulo: "Tu identidad ya no es sólo un documento",
    bajada: "También son tus cuentas, tu cara, tu voz y tus datos.",
    diagrama: "rastros",
  },
  {
    t: "placa",
    titulo: "Durante mucho tiempo, ver era creer",
    bajada: "Una imagen parecía una prueba de realidad.",
    diagrama: "verescuchar",
  },
  {
    t: "placa",
    titulo: "Eso cambió",
    bajada: "Hoy una imagen puede mostrar algo que nunca ocurrió.",
    diagrama: "deepfake",
  },
  // A = fotografía real (Picsum #1018) · B = imagen generada con IA.
  { t: "actividad", activa: "w3_cual", escena: "El juego", imagenes: { a: "/web3/cual-a.jpg", b: "/web3/cual-b.jpg" } },
  {
    t: "placa",
    titulo: "También puedo fabricar una voz",
    bajada: "La apariencia ya no es solamente visual.",
    diagrama: "voz",
  },
  {
    t: "placa",
    titulo: "El phishing también aprendió IA",
    bajada: "El engaño puede ser personalizado y convincente.",
    diagrama: "phishing",
  },
  {
    t: "placa",
    titulo: "Tu imagen puede actuar sin vos",
    bajada: "Una persona puede aparecer diciendo o haciendo algo que nunca hizo.",
    diagrama: "imagenajena",
  },
  {
    t: "placa",
    titulo: "Entonces, ¿qué significa ser vos?",
    bajada: "Identidad y autenticidad dejaron de ser exactamente lo mismo.",
    diagrama: "autenticidad",
    lede: "Antes alcanzaba con reconocer. Ahora también hay que autenticar.",
  },
  { t: "actividad", activa: "w3_probar", escena: "Ahora ustedes" },
  {
    t: "placa",
    titulo: "Verificar sin mostrar todo",
    bajada: "A veces alcanza con demostrar un dato.",
    diagrama: "credencial",
  },
  {
    t: "placa",
    titulo: "Ahora también entramos a la pantalla",
    bajada: "Realidad virtual y realidad aumentada: presencia sin cuerpo, datos sobre el mundo.",
    diagrama: "vrar",
    demo: "🥽 Demo en vivo: probamos un visor Quest 3",
  },
  {
    t: "placa",
    titulo: "Lo virtual también es jurídico",
    bajada: "Tu avatar actúa, compra y se relaciona en mundos persistentes.",
    pills: ["identidad del avatar", "bienes virtuales", "NFTs", "conductas y daños en VR", "jurisdicción"],
    diagrama: "avatar",
  },

  // --- Parte III · La máquina ya no sólo responde ------------------------
  {
    t: "placa",
    parte: "Parte III · La máquina ya no sólo responde",
    titulo: "La máquina antes respondía",
    bajada: "Ahora también puede hacer cosas.",
    diagrama: "maquina",
  },
  {
    t: "placa",
    titulo: "Primero generó",
    bajada: "Texto, imágenes, respuestas y análisis.",
    diagrama: "genera",
  },
  {
    t: "placa",
    titulo: "Después empezó a actuar",
    bajada: "Los agentes pueden encadenar tareas.",
    diagrama: "agente",
  },
  {
    t: "placa",
    titulo: "Y algunas reglas pueden ejecutarse solas",
    bajada: "Los smart contracts automatizan condiciones.",
    diagrama: "smart",
  },
  {
    t: "placa",
    titulo: "Generar no es decidir",
    bajada: "Y decidir no es ejecutar.",
    diagrama: "grados",
  },
  { t: "actividad", activa: "w3_delegar", escena: "¿Cuánto delegamos?" },

  // --- Parte IV · ¿Y si también distribuimos las decisiones? -------------
  {
    t: "placa",
    parte: "Parte IV · Gobernar sin centro",
    titulo: "¿Y si también distribuimos las decisiones?",
    bajada: "La tecnología puede organizar comunidades de otra manera.",
    diagrama: "distribuidas",
  },
  {
    t: "placa",
    titulo: "¿Quién manda si nadie manda?",
    bajada: "Una DAO puede votar y ejecutar decisiones digitalmente.",
    diagrama: "dao",
  },
  { t: "actividad", activa: "w3_dao", escena: "La votación" },
  {
    t: "placa",
    titulo: "Descentralizar no elimina el poder",
    bajada: "Siempre hay que mirar quién puede decidir.",
    diagrama: "ballena",
    lede: "Sacar el centro no significa eliminar el poder.",
  },

  // --- Cierre · Todo esto ya lo vimos ------------------------------------
  {
    t: "placa",
    parte: "Cierre · Todo esto ya lo vimos",
    titulo: "El trabajo sigue siendo traducir",
    bajada: "Entender la tecnología para hacer las preguntas jurídicas correctas.",
    pills: ["blockchain", "IA generativa", "phishing", "identidad", "agentes", "smart contracts", "gobernanza"],
    diagrama: "traductor",
    lede: "El abogado del futuro no es el que conoce todas las tecnologías. Es el que sabe traducirlas jurídicamente.",
  },
  { t: "actividad", activa: "w3_palabra", escena: "Cierre" },
  { t: "final" },
];
