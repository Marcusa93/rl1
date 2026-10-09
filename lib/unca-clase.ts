// ============================================================
// "La arquitectura de la confianza digital" — Diplomatura en
// Instrumentos Públicos y Privados (UNCA) · Módulo III · Dr. Marco Rossi.
// Clase virtual de 80 minutos: 30 placas, 3 laboratorios en vivo y
// 8 intervenciones de la sala, integradas en sus placas.
//
// /unca         → app del participante (celular o computadora; anónima)
// /unca/clase   → presentación (se comparte por la videollamada)
// /unca/notas   → notas del orador en otra ventana (no se comparte)
// /unca/validar · /unca/va1idar → destinos de los dos QR de la placa 15
//
// La placa manda: al llegar a una placa con intervención, la actividad se
// abre sola en los dispositivos de la sala. Las placas sin intervención no
// cambian nada (quien llegó tarde puede terminar de responder).
// Reusa el motor de clase en vivo (lib/clase-vivo.ts).
// ============================================================

import type { ActividadVivo, ClaseVivoConfig } from "./clase-vivo";

export const UC_SLUG = "unca-confianza";
export const UC_TITULO = "La arquitectura de la confianza digital";
export const UC_SUBTITULO = "Criptografía de clave pública, inteligencia artificial y nuevos desafíos de los instrumentos públicos y privados";
export const UC_DIPLOMATURA = "Diplomatura en Instrumentos Públicos y Privados";
export const UC_MODULO = "Módulo III · Digitalización y soportes digitales";
export const UC_INSTITUCION = "Universidad Nacional de Catamarca";
export const UC_DOCENTE = "Dr. Marco Rossi";
/** Dirección que se dicta o se pega en el chat; el QR apunta a la misma. */
export const UC_LINK = "taller.rossi-ia.com/unca";
export const UC_QR = "/unca/qr.svg";
export const UC_LOGO = "/unca/logo-unca.png";
export const UC_PREGUNTA = "¿Qué podemos saber realmente de un documento digital cuando una computadora nos dice que es auténtico?";
export const UC_FRASE_FINAL =
  "El desafío no es elegir entre confiar en las personas o confiar en la tecnología. Es saber qué podemos exigirle a cada una.";

/**
 * Material audiovisual de la intervención 7 (placa 24). Se prepara antes de la
 * clase, con una persona inexistente, y se guarda en public/unca/ia/.
 * Si el archivo no está, la placa muestra un recuadro para cargarlo.
 */
export const UC_MATERIAL_IA = {
  src: "/unca/ia/real-o-ia.mp4",
  tipo: "video" as "video" | "imagen",
  /** Origen verdadero del material: lo que se revela al final. */
  origen: "ia" as "real" | "ia",
  revela:
    "El material fue generado con inteligencia artificial para esta clase: la persona no existe. Que no pudiéramos asegurarlo mirando es justamente el punto.",
};

// --- Bloques de la clase (línea de tiempo del pie) -------------------------------------

export interface UcBloque {
  num: string;
  nombre: string;
  rango: string;
  minutos: number;
}

export const UC_BLOQUES: UcBloque[] = [
  { num: "I", nombre: "El problema de confiar", rango: "0–15", minutos: 15 },
  { num: "II", nombre: "Cómo funciona la criptografía", rango: "15–35", minutos: 20 },
  { num: "III", nombre: "La práctica profesional", rango: "35–55", minutos: 20 },
  { num: "IV", nombre: "IA, identidad y fraude", rango: "55–70", minutos: 15 },
  { num: "V", nombre: "El futuro de la fe pública", rango: "70–80", minutos: 10 },
];

// --- Intervenciones de la sala --------------------------------------------------------------

export type UcKey =
  | "uc_confianza"
  | "uc_tres_docs"
  | "uc_huella"
  | "uc_firma_prueba"
  | "uc_testimonio"
  | "uc_blockchain"
  | "uc_real_ia"
  | "uc_decision";

export type UcActividad = ActividadVivo & {
  key: UcKey;
  /** 1 a 8: el orden de las intervenciones en la clase. */
  numero: number;
  formato: string;
  /** Los resultados empiezan ocultos (predicciones: que nadie vote por arrastre). */
  ocultos?: boolean;
  /** Escala 1 a 5 (opciones "1"…"5"): histograma y promedio. */
  escala?: { min: string; max: string };
  /** Clasificación: categoría orientativa de cada afirmación y por qué. */
  clasificacion?: Record<string, { correcta: string; por: string }>;
  /** Opción que es una trampa (se marca al revelar). */
  trampa?: string;
  /** Datos ficticios para el modo demostración (si falla la conexión o para ensayar). */
  demo: { respondieron: number; summary: Record<string, unknown> };
};

const CLASIFICA = [
  { id: "si", emoji: "✅", label: "Acredita o permite presumir" },
  { id: "no", emoji: "❌", label: "No acredita por sí sola" },
  { id: "dep", emoji: "🔍", label: "Depende de otras verificaciones" },
];

const ACTIVIDADES: UcActividad[] = [
  {
    key: "uc_confianza",
    numero: 1,
    formato: "Nube de palabras",
    kind: "palabra",
    palabras: 3,
    normalizar: true,
    maxChars: 24,
    titulo: "¿Qué genera confianza?",
    bajada: "Cuando recibís un documento jurídico, ¿qué elemento te genera más confianza? Hasta tres palabras.",
    demo: {
      respondieron: 38,
      summary: {
        total: 38,
        palabras: [
          { palabra: "firma", n: 16 },
          { palabra: "sello", n: 12 },
          { palabra: "escribano", n: 9 },
          { palabra: "certificado", n: 7 },
          { palabra: "juez", n: 5 },
          { palabra: "firma digital", n: 4 },
          { palabra: "membrete", n: 4 },
          { palabra: "registro", n: 4 },
          { palabra: "fe pública", n: 3 },
          { palabra: "autenticidad", n: 3 },
          { palabra: "protocolo", n: 3 },
          { palabra: "original", n: 2 },
          { palabra: "institución", n: 2 },
          { palabra: "legalidad", n: 2 },
          { palabra: "seguridad", n: 2 },
          { palabra: "papel", n: 2 },
          { palabra: "código qr", n: 1 },
          { palabra: "número de expediente", n: 1 },
        ],
      },
    },
  },
  {
    key: "uc_tres_docs",
    numero: 2,
    formato: "Votación visual",
    kind: "opciones",
    titulo: "Tres documentos, una decisión",
    bajada: "Recibís tres documentos visualmente similares. ¿Cuál te inspira mayor confianza inicialmente?",
    opciones: [
      { id: "a", emoji: "✍️", label: "A · PDF con una firma manuscrita insertada como imagen" },
      { id: "b", emoji: "🔏", label: "B · PDF con firma digital verificable" },
      { id: "c", emoji: "🔳", label: "C · PDF con un código QR" },
      { id: "d", emoji: "🤔", label: "D · No podría decidir sin otras verificaciones" },
    ],
    demo: { respondieron: 40, summary: { total: 40, counts: { a: 4, b: 18, c: 6, d: 12 } } },
  },
  {
    key: "uc_huella",
    numero: 3,
    formato: "Predicción y revelación",
    kind: "opciones",
    ocultos: true,
    titulo: "¿Cambió el documento?",
    bajada: "Si modifico una sola palabra de un documento digital, ¿qué sucede con su huella criptográfica?",
    opciones: [
      { id: "a", emoji: "Ⓐ", label: "A · Cambia solamente una pequeña parte de la huella" },
      { id: "b", emoji: "Ⓑ", label: "B · Generalmente se genera una huella completamente diferente" },
      { id: "c", emoji: "Ⓒ", label: "C · La huella permanece igual si el documento conserva su formato" },
      { id: "d", emoji: "Ⓓ", label: "D · Depende exclusivamente del programa utilizado para abrirlo" },
    ],
    correcta: "b",
    revela:
      "Con una función hash criptográfica adecuada (por ejemplo, SHA-256), un cambio mínimo produce normalmente una huella completamente distinta. Se comparan los datos exactos procesados: el resultado depende del algoritmo y de esos datos, no del programa que los muestra.",
    demo: { respondieron: 39, summary: { total: 39, counts: { a: 11, b: 20, c: 5, d: 3 } } },
  },
  {
    key: "uc_firma_prueba",
    numero: 4,
    formato: "Clasificación",
    kind: "encuesta",
    titulo: "¿Qué demuestra una firma?",
    bajada: "Una firma digital se verifica correctamente. Clasificá cada afirmación.",
    preguntas: [
      { id: "integro", q: "El documento no fue modificado desde que se firmó", opciones: CLASIFICA },
      { id: "verdad", q: "Todo lo declarado en el documento es verdadero", opciones: CLASIFICA },
      { id: "titular", q: "La firma corresponde al titular del certificado", opciones: CLASIFICA },
      { id: "libre", q: "El firmante actuó libremente y sin vicios de voluntad", opciones: CLASIFICA },
    ],
    clasificacion: {
      integro: { correcta: "si", por: "Presunción de integridad (art. 8, Ley 25.506), salvo prueba en contrario." },
      verdad: { correcta: "no", por: "La matemática verifica datos: no examina la verdad de lo declarado." },
      titular: { correcta: "si", por: "Presunción de autoría (art. 7), con certificado válido y vigente al firmar (art. 9)." },
      libre: { correcta: "no", por: "La voluntad libre y sin vicios exige otros elementos de valoración." },
    },
    revela:
      "Cumplidos los requisitos legales, la verificación favorable permite aplicar presunciones relativas de autoría e integridad. La verdad del contenido y la ausencia de vicios de la voluntad no surgen del resultado criptográfico.",
    demo: {
      respondieron: 37,
      summary: {
        total: 37,
        byQuestion: {
          integro: { si: 27, no: 3, dep: 7 },
          verdad: { si: 6, no: 24, dep: 7 },
          titular: { si: 17, no: 4, dep: 16 },
          libre: { si: 5, no: 21, dep: 11 },
        },
      },
    },
  },
  {
    key: "uc_testimonio",
    numero: 5,
    formato: "Caso práctico · varias respuestas",
    kind: "chips",
    titulo: "¿Verificarías este documento?",
    bajada:
      "Recibís por correo un testimonio judicial digital con firma visible y código QR. Lo necesitás para una actuación profesional. ¿Qué verificarías antes de usarlo? Marcá todas las que correspondan.",
    opciones: [
      { id: "origen", emoji: "🏛️", label: "Comprobar el origen institucional" },
      { id: "firma", emoji: "🔏", label: "Verificar la firma digital" },
      { id: "qr", emoji: "🔳", label: "Comprobar a dónde lleva el QR" },
      { id: "original", emoji: "🗂️", label: "Conservar el archivo original" },
      { id: "plataforma", emoji: "🔎", label: "Contrastar con la plataforma oficial" },
      { id: "apariencia", emoji: "👀", label: "Considerar suficiente la apariencia visual" },
    ],
    trampa: "apariencia",
    revela:
      "Cada comprobación responde a un riesgo distinto: origen, integridad, autoría, destino del QR, conservación. La apariencia visual sola no alcanza para ninguno.",
    demo: {
      respondieron: 36,
      summary: { total: 36, counts: { origen: 29, firma: 31, qr: 19, original: 14, plataforma: 27, apariencia: 2 } },
    },
  },
  {
    key: "uc_blockchain",
    numero: 6,
    formato: "Escala de confianza",
    kind: "opciones",
    titulo: "¿Qué puede probar blockchain?",
    bajada:
      "La huella de un documento se registró en una blockchain pública. Años después coincide con la del archivo presentado. ¿Cuánto demuestra eso sobre la veracidad de su contenido?",
    opciones: [
      { id: "1", emoji: "1️⃣", label: "No acredita la verdad del contenido" },
      { id: "2", emoji: "2️⃣", label: "Acredita poco" },
      { id: "3", emoji: "3️⃣", label: "Acredita en parte" },
      { id: "4", emoji: "4️⃣", label: "Acredita bastante" },
      { id: "5", emoji: "5️⃣", label: "Acredita completamente la verdad del contenido" },
    ],
    escala: { min: "No acredita la verdad del contenido", max: "Acredita completamente la verdad del contenido" },
    revela:
      "Que la huella coincida acredita integridad y existencia de esos datos en un momento. Registrar un dato falso en un registro confiable no lo vuelve verdadero.",
    demo: { respondieron: 38, summary: { total: 38, counts: { "1": 15, "2": 9, "3": 7, "4": 5, "5": 2 } } },
  },
  {
    key: "uc_real_ia",
    numero: 7,
    formato: "Votación con video",
    kind: "opciones",
    ocultos: true,
    titulo: "¿Real o generado por IA?",
    bajada: "¿La persona que observás es una grabación auténtica o una representación generada mediante inteligencia artificial?",
    opciones: [
      { id: "real", emoji: "🎥", label: "Real" },
      { id: "ia", emoji: "🤖", label: "Generado con IA" },
      { id: "nose", emoji: "🤷", label: "No puedo determinarlo" },
    ],
    correcta: UC_MATERIAL_IA.origen,
    revela: UC_MATERIAL_IA.revela,
    demo: { respondieron: 37, summary: { total: 37, counts: { real: 15, ia: 12, nose: 10 } } },
  },
  {
    key: "uc_decision",
    numero: 8,
    formato: "Resolución de caso",
    kind: "opciones",
    ocultos: true,
    titulo: "La decisión profesional",
    bajada:
      "Documento firmado digitalmente, certificado verificado. El acto estuvo precedido por una videoconferencia y hay indicios de que uno de los intervinientes fue suplantado con IA. ¿Qué harías antes de continuar?",
    opciones: [
      { id: "a", emoji: "Ⓐ", label: "A · Continuar: la firma digital se verificó correctamente" },
      { id: "b", emoji: "Ⓑ", label: "B · Descartar el documento porque hubo una videoconferencia" },
      { id: "c", emoji: "Ⓒ", label: "C · Verificar identidad y circunstancias por vías independientes y evaluar sus consecuencias" },
      { id: "d", emoji: "Ⓓ", label: "D · Confiar en que un detector de deepfakes lo resuelva" },
    ],
    correcta: "c",
    revela:
      "La firma verificada acredita lo que acredita. Ante indicios de suplantación, hay que verificar identidad y circunstancias por canales independientes, y evaluar las consecuencias jurídicas. Ni confiar a ciegas ni descartar por reflejo.",
    demo: { respondieron: 38, summary: { total: 38, counts: { a: 2, b: 3, c: 31, d: 2 } } },
  },
];

export function getUcActividad(key: string): UcActividad | undefined {
  return ACTIVIDADES.find((a) => a.key === key);
}

// --- Placas -------------------------------------------------------------------------------------

/** Composición de cada placa (un componente por cuerpo en components/unca). */
export type UcCuerpo =
  | "confianza"
  | "historia"
  | "papel"
  | "tres-docs"
  | "rayos-x"
  | "giro-huella"
  | "cesar"
  | "dos-llaves"
  | "clave-privada"
  | "huella"
  | "firma-flujo"
  | "certificado"
  | "giro-firma"
  | "expediente"
  | "qr"
  | "testimonio"
  | "imprimir"
  | "tiempo"
  | "obsolescencia"
  | "cadena"
  | "giro-hechos"
  | "sinteticos"
  | "videollamada"
  | "real-ia"
  | "identidad"
  | "giro-voluntad"
  | "maquina"
  | "criterios"
  | "decision"
  | "arquitectura";

/** Herramienta que el participante puede probar en su dispositivo durante esa placa. */
export type UcProbar = "cesar" | "hash" | "cadena";

export interface UcPlaca {
  t: "placa";
  num: number;
  titulo: string;
  bajada: string;
  bloque: number;
  /** Minutos aproximados de la clase en los que se proyecta (para el orador). */
  minuto: string;
  cuerpo: UcCuerpo;
  /** Partes que aparecen de a una con → (0: la placa se ve entera). */
  pasos: number;
  /** Intervención que se abre sola al llegar a esta placa. */
  activa?: UcKey;
  /** Placa de giro: texto circular, señal de cambio de dirección para el docente. */
  giro?: string;
  probar?: UcProbar;
  /** Texto de la placa para el dispositivo del participante (sin diagramas). */
  lineas: string[];
  /** Notas del orador: solo en /unca/notas, nunca en la pantalla compartida. */
  nota: string;
}

export interface UcLab {
  t: "lab";
  id: "hash" | "firma" | "certweb";
  titulo: string;
  bajada: string;
  bloque: number;
  minuto: string;
  probar?: UcProbar;
  lineas: string[];
  nota: string;
}

export type UcSlide =
  | { t: "portada"; bloque: number; minuto: string; nota: string }
  | { t: "ingreso"; bloque: number; minuto: string; nota: string }
  | UcPlaca
  | UcLab;

const SLIDES: UcSlide[] = [
  {
    t: "portada",
    bloque: 0,
    minuto: "previo",
    nota:
      "Mientras entra la gente. Compartí esta ventana (no la de notas). Con Q aparece el QR para ingresar; con D, el modo demostración por si falla la conexión colectiva.",
  },
  {
    t: "ingreso",
    bloque: 0,
    minuto: "0–2",
    nota:
      "Pegá el enlace en el chat: taller.rossi-ia.com/unca. No piden nombre ni datos: la participación es anónima y los resultados se muestran agrupados.\n\nPregunta generadora (decila y dejala flotando): «¿Qué podemos saber realmente de un documento digital cuando una computadora nos dice que es auténtico?». Va a cambiar de significado a lo largo de la clase.",
  },

  // ─── BLOQUE I · El problema de la confianza digital ───────────────────────────────
  {
    t: "placa",
    num: 1,
    titulo: "¿En quién confiamos?",
    bajada: "La confianza es el fundamento de cualquier instrumento jurídico.",
    bloque: 0,
    minuto: "2–5",
    cuerpo: "confianza",
    pasos: 0,
    activa: "uc_confianza",
    lineas: ["Cuando recibimos una escritura, una sentencia o una certificación, necesitamos saber si es auténtica y qué podemos tener por acreditado."],
    nota:
      "INTERVENCIÓN 1 · nube · 90 segundos. La actividad ya se abrió sola en los dispositivos.\n\nNo arranques por la tecnología: arrancá por una preocupación compartida. Cuando recibimos una escritura, una sentencia, una certificación, ¿qué miramos para confiar?\n\nAl leer la nube: casi todo remite a signos (firma, sello, membrete), procedimientos (registro, protocolo), instituciones o personas (escribano, juez). Pregunta puente: ¿cómo construimos esa confianza cuando el documento existe solo en formato digital?\n\nEsta nube vuelve en la placa 30. Si una palabra no corresponde, ocultala desde esta ventana (abajo).",
  },
  {
    t: "placa",
    num: 2,
    titulo: "La confianza también tiene historia",
    bajada: "De los sellos antiguos a las firmas y certificados digitales.",
    bloque: 0,
    minuto: "5–7",
    cuerpo: "historia",
    pasos: 6,
    lineas: [
      "c. 3500 a. C. · Sellos cilíndricos: identificar al autor y cerrar el envío",
      "1503 · Pragmática de Alcalá: los escribanos deben conservar protocolos",
      "1976–1977 · Diffie, Hellman y RSA: nace la criptografía de clave pública",
      "2001 · Ley 25.506 de firma digital",
      "2015 · Código Civil y Comercial, art. 288: la firma digital satisface el requisito de firma",
      "Hoy · La IA generativa fabrica imágenes, voces y documentos verosímiles",
    ],
    nota:
      "Recorrido breve, no una historia del notariado. Las sociedades siempre inventaron procedimientos para tres cosas: identificar autores, detectar alteraciones y preservar evidencias.\n\nEl lacre es la mejor metáfora de la clase: solo el dueño tiene el sello (clave privada) y cualquiera puede comparar la impronta (clave pública). Volvé a esa imagen en la placa 8.\n\nGiro: los problemas siguen siendo los mismos; cambian las soluciones.",
  },
  {
    t: "placa",
    num: 3,
    titulo: "El papel nos daba pistas",
    bajada: "Firmas, sellos, tinta y soporte material.",
    bloque: 0,
    minuto: "7–9",
    cuerpo: "papel",
    pasos: 3,
    lineas: [
      "Papel: soporte, tinta, firma manuscrita, sellos, protocolo",
      "Digital: datos, metadatos, huella criptográfica, firma y certificado, sello de tiempo",
      "Ninguno es infalible: cambian las pistas, no el problema",
    ],
    nota:
      "Comparación justa. En el papel hay rasgos que se examinan físicamente (soporte, tinta, firma, sellos) y aun así hay falsificaciones. En lo digital desaparecen pistas materiales pero aparecen otras posibilidades de verificación.\n\nEvitá el binario «papel confiable / digital vulnerable». Ambos tienen fortalezas y límites diferentes.",
  },
  {
    t: "placa",
    num: 4,
    titulo: "En una pantalla todo puede parecer auténtico",
    bajada: "La apariencia visual no demuestra el origen de un archivo.",
    bloque: 0,
    minuto: "9–12",
    cuerpo: "tres-docs",
    pasos: 0,
    activa: "uc_tres_docs",
    lineas: [
      "A · PDF con una firma manuscrita insertada como imagen",
      "B · PDF con firma digital verificable",
      "C · PDF con un código QR",
    ],
    nota:
      "INTERVENCIÓN 2 · votación · 90 segundos. Los tres documentos son ficticios y se ven casi iguales.\n\nNo corrijas. Recuperá las respuestas y dejá la duda instalada: en el supuesto, la firma digital verificable aporta garantías técnicas y efectos jurídicos específicos que una imagen de firma o un QR aislado no dan. Pero la opción D abre lo importante: decidir exige examinar el documento concreto y el acto.\n\nFrase de salida: «En los próximos minutos vamos a ver qué se puede verificar de verdad».",
  },
  {
    t: "placa",
    num: 5,
    titulo: "Un documento es mucho más que lo que vemos",
    bajada: "El archivo contiene información que no aparece en la pantalla.",
    bloque: 0,
    minuto: "12–14",
    cuerpo: "rayos-x",
    pasos: 2,
    lineas: [
      "Lo que vemos es una representación visual",
      "El archivo son datos: estructura, metadatos, firma, certificado",
      "El dibujo de una firma puede ser solo una imagen; la firma verificable está en otra parte del archivo",
    ],
    nota:
      "Mostrá la placa entera y después → para la «radiografía». Dos documentos de apariencia idéntica pueden tener estructuras y propiedades técnicas diferentes.\n\nSeñalá dos líneas: /Im1 es el garabato (una imagen cualquiera) y /Contents es la firma criptográfica real. Si un documento solo tiene la imagen, no hay nada que verificar.\n\nPrepara la idea: si el archivo son datos, los datos se pueden procesar matemáticamente.",
  },
  {
    t: "placa",
    num: 6,
    titulo: "¿Y si pudiéramos detectar cualquier cambio?",
    bajada: "La primera herramienta de confianza será una huella matemática.",
    bloque: 0,
    minuto: "14–15",
    cuerpo: "giro-huella",
    pasos: 0,
    giro: "PRIMER GIRO · DE MIRAR A VERIFICAR · ",
    lineas: ["Mirar un documento no alcanza para conocer sus propiedades", "¿Podemos generar una identificación matemática que delate cualquier modificación?"],
    nota:
      "PRIMER GIRO (texto circular). Cerrá el bloque en una frase: mirar no alcanza. Abrí la pregunta: ¿podemos generar una identificación matemática de los datos que nos permita detectar modificaciones? La respuesta abre el bloque II.",
  },

  // ─── BLOQUE II · Cómo funciona la criptografía ─────────────────────────────────────
  {
    t: "placa",
    num: 7,
    titulo: "El secreto es tan antiguo como la escritura",
    bajada: "La criptografía nació para proteger mensajes.",
    bloque: 1,
    minuto: "15–17",
    cuerpo: "cesar",
    pasos: 0,
    probar: "cesar",
    lineas: [
      "Cifrar: transformar un mensaje para que un tercero no lo entienda",
      "Cifrado César: cada letra se corre un número fijo de lugares",
      "Hoy la criptografía también sirve para integridad, autenticación y firmas",
    ],
    nota:
      "Muy breve. El cifrado César: cada letra se corre tres lugares. Escribí FE PUBLICA en la placa y mové el desplazamiento: se ve la rueda girar.\n\nLos participantes pueden probarlo en su dispositivo.\n\nDistinción clave: la criptografía clásica buscaba secreto; la moderna también da integridad, autenticación y firma. No conviertas esto en una historia de los cifrados.",
  },
  {
    t: "placa",
    num: 8,
    titulo: "Una llave que todos conocen",
    bajada: "El descubrimiento que transformó la seguridad digital.",
    bloque: 1,
    minuto: "17–20",
    cuerpo: "dos-llaves",
    pasos: 0,
    lineas: [
      "Dos claves matemáticamente relacionadas: una pública y una privada",
      "Para firmar: el titular usa su clave privada; cualquiera verifica con la pública",
      "Para cifrar: se usa la clave pública del destinatario; solo su privada abre",
      "No son intercambiables en todas las operaciones",
    ],
    nota:
      "Concepto fundamental: desarrollalo lento. Usá los dos modos de la placa (tocá «Firmar» y «Cifrar»).\n\nVolvé al lacre: solo el dueño tiene el sello (privada), todos pueden comparar la impronta (pública). La analogía tiene límites: no se trata de copiar una llave física, y las dos claves no cumplen la misma función.\n\nLo que importa para el derecho es el modo «Firmar».",
  },
  {
    t: "placa",
    num: 9,
    titulo: "La clave privada no se comparte",
    bajada: "El control de una credencial es parte de la seguridad.",
    bloque: 1,
    minuto: "20–22",
    cuerpo: "clave-privada",
    pasos: 4,
    lineas: [
      "La firma se genera con la clave privada (token, tarjeta, firma remota con PIN)",
      "Riesgos: pérdida, divulgación, uso indebido",
      "La matemática asocia la firma con una clave; la intervención personal del titular es otra cuestión",
    ],
    nota:
      "Riesgos de la clave privada: pérdida, divulgación, uso indebido (el PIN anotado en el token, la secretaria que «firma por» el titular).\n\nDejá sembrada la distinción que vuelve en la placa 26: la asociación técnica de una firma con una clave no prueba, por sí sola, la intervención personal efectiva del titular.",
  },
  {
    t: "placa",
    num: 10,
    titulo: "La huella que revela las modificaciones",
    bajada: "Un algoritmo puede representar los datos mediante un resumen criptográfico.",
    bloque: 1,
    minuto: "22–25",
    cuerpo: "huella",
    pasos: 0,
    activa: "uc_huella",
    lineas: [
      "Una función hash produce una huella de longitud fija (SHA-256: 64 caracteres)",
      "Los mismos datos dan siempre la misma huella",
      "No impide modificar: permite detectar diferencias contra una referencia confiable",
    ],
    nota:
      "INTERVENCIÓN 3 · predicción · 90 segundos. Los resultados están ocultos para que nadie vote por arrastre.\n\nPrimero que voten. Con R mostrás los resultados y con E revelás la respuesta (B).\n\nAclaración precisa: la huella depende del algoritmo y de los datos exactos procesados. Las funciones hash no impiden modificar un documento: permiten detectar diferencias cuando hay una referencia confiable con la cual comparar.\n\nSigue el laboratorio en vivo.",
  },
  {
    t: "lab",
    id: "hash",
    titulo: "Laboratorio · La huella en vivo",
    bajada: "Dos versiones de un documento ficticio, una sola diferencia.",
    bloque: 1,
    minuto: "25–27",
    probar: "hash",
    lineas: [
      "Escribí un texto y mirá su huella SHA-256",
      "Cambiá una sola letra: la huella cambia por completo",
      "La huella no permite reconstruir el texto",
    ],
    nota:
      "DEMOSTRACIÓN DE HASH. Los dos contratos difieren en un dígito ($ 850.000 / $ 860.000). Mostrá: mismos datos → misma huella; un carácter → cerca de la mitad de los bits cambian.\n\nBotones: «Cambiar un carácter», «Igualar». Podés soltar un archivo propio (se calcula en esta computadora, no se sube) y pegar una huella esperada para comparar: así se verifica un certificado de una página web (lo vemos en el bloque III).\n\nLos participantes tienen la calculadora en su dispositivo.",
  },
  {
    t: "placa",
    num: 11,
    titulo: "Firmar sin lapicera",
    bajada: "La firma digital combina claves, algoritmos y certificados.",
    bloque: 1,
    minuto: "27–29",
    cuerpo: "firma-flujo",
    pasos: 5,
    lineas: [
      "1 · Se calcula la huella del documento",
      "2 · La huella se firma con la clave privada",
      "3 · Viajan juntos: documento, firma y certificado",
      "4 · Quien recibe recalcula la huella y verifica la firma con la clave pública",
      "5 · Si coinciden: presunción de autoría (art. 7) e integridad (art. 8), salvo prueba en contrario",
    ],
    nota:
      "Reconstruí el procedimiento de a un paso (→). Lo que hay que llevarse: qué se verifica matemáticamente (que estos datos se firmaron con la clave privada que corresponde a esta clave pública, y que no cambiaron) y qué consecuencias jurídicas se atribuyen a esa verificación (arts. 7 y 8 de la Ley 25.506, presunciones relativas).\n\nNo repitas el régimen jurídico del Módulo II: solo el puente técnico-jurídico. Sigue la demostración de firma real.",
  },
  {
    t: "lab",
    id: "firma",
    titulo: "Laboratorio · Firmar y verificar",
    bajada: "Una firma real, generada en este navegador, sobre un documento ficticio.",
    bloque: 1,
    minuto: "29–31",
    lineas: [
      "Se genera un par de claves",
      "Se firma el documento con la privada",
      "Se verifica con la pública: válida",
      "Si se altera una coma o se usa otra clave pública: inválida",
    ],
    nota:
      "DEMOSTRACIÓN DE FIRMA, con criptografía real del navegador (ECDSA P-256). Ensayada, sin depender de un PDF.\n\n1) Generar claves. 2) Firmar. 3) Verificar → válida. 4) Alterar el documento → inválida. 5) Restaurar y verificar con la clave de un impostor → inválida.\n\nUn lector de PDF hace lo mismo y además revisa el certificado: quién es el titular, quién lo emitió, si estaba vigente. Eso es la placa que sigue.",
  },
  {
    t: "placa",
    num: 12,
    titulo: "Una firma también tiene una historia",
    bajada: "Certificados, vigencia, revocación y sellado temporal.",
    bloque: 1,
    minuto: "31–33",
    cuerpo: "certificado",
    pasos: 1,
    lineas: [
      "El certificado vincula una clave pública con un titular, y lo emite un certificador",
      "Importa su estado: vigente, vencido o revocado",
      "El sello de tiempo de un tercero acredita que esos datos existían en un momento",
      "La fecha del documento y el reloj del equipo no son lo mismo que una evidencia temporal",
    ],
    nota:
      "El certificado responde a: ¿cómo vinculo una clave con una persona? No basta un cartel de «firma válida»: importan la confianza en el certificador, el estado del certificado y la evidencia temporal.\n\nUsá la línea de tiempo: mové la fecha de firma y prendé o apagá el sello de tiempo. Mensaje: sin sello de tiempo, ¿cómo sé si se firmó antes o después de la revocación?\n\nTres relojes distintos: la fecha que dice el documento, la hora del dispositivo y el sello de un servicio confiable. La autoridad de sello de tiempo recibe solo la huella: nunca ve el documento.",
  },
  {
    t: "placa",
    num: 13,
    titulo: "¿Qué acaba de demostrar la matemática?",
    bajada: "Integridad, identidad y verdad no son lo mismo.",
    bloque: 1,
    minuto: "33–35",
    cuerpo: "giro-firma",
    pasos: 0,
    activa: "uc_firma_prueba",
    giro: "SEGUNDO GIRO · DE LA MATEMÁTICA A LA PRÁCTICA · ",
    lineas: [
      "Una firma verificada permite presumir integridad y autoría",
      "No acredita por sí sola la verdad del contenido ni la voluntad libre del firmante",
    ],
    nota:
      "SEGUNDO GIRO + INTERVENCIÓN 4 · clasificación · 2 minutos.\n\nCuatro afirmaciones, tres categorías. Con E aparece la categoría orientativa de cada una.\n\nDevolución: cumplidos los requisitos legales, la verificación favorable permite aplicar las presunciones relativas de autoría e integridad. La verdad material del contenido y la ausencia de vicios de la voluntad no se desprenden del resultado criptográfico.\n\nSi «la firma corresponde al titular» divide a la sala entre «acredita» y «depende», es una buena discusión: la presunción del art. 7 existe, pero supone certificado válido y vigente al firmar (art. 9).\n\nFrase: comprender los límites de una tecnología es tan importante como conocer sus capacidades.",
  },

  // ─── BLOQUE III · Documentos digitales en la práctica profesional ─────────────────────
  {
    t: "placa",
    num: 14,
    titulo: "El expediente ya no vive en papel",
    bajada: "La documentación judicial se produce, circula y conserva digitalmente.",
    bloque: 2,
    minuto: "35–38",
    cuerpo: "expediente",
    pasos: 4,
    lineas: [
      "Escrito firmado → cargo digital con fecha y hora",
      "Providencias y sentencias firmadas digitalmente",
      "Notificación electrónica al domicilio constituido",
      "Testimonios y certificaciones digitales que salen hacia escribanías y registros",
    ],
    nota:
      "Trasladá lo aprendido al expediente electrónico. Cada paso tiene una propiedad técnica verificable: firma, cargo con fecha y hora, huella.\n\nTu experiencia en gestión judicial digital: ejemplos operativos, sin datos de expedientes reales.\n\nMantené el puente con lo notarial y lo administrativo: el testimonio sale del juzgado y entra a una escribanía o a un registro. Lo que vale en el sistema no siempre se traslada a una impresión.",
  },
  {
    t: "placa",
    num: 15,
    titulo: "Un QR no es una firma digital",
    bajada: "El código puede facilitar el acceso a una verificación, pero no reemplazarla.",
    bloque: 2,
    minuto: "38–41",
    cuerpo: "qr",
    pasos: 2,
    lineas: [
      "Un QR es solo texto (habitualmente una dirección web) dibujado en cuadraditos",
      "Cualquiera puede generar uno, copiarlo o reemplazarlo",
      "Lo que verifica no es el código: es el sitio oficial y el mecanismo al que conduce",
    ],
    nota:
      "DEMOSTRACIÓN DE QR (entorno exclusivamente demostrativo, institución ficticia). Pedí que escaneen los dos códigos con el celular, desde la pantalla de la videollamada.\n\nLos dos muestran «documento válido». Con → aparece lo que dice cada código: el B lleva a «va1idar», con un uno en lugar de la ele. El señuelo se delata solo a los pocos segundos.\n\nMensaje: distinguir el código, el sitio al que conduce y el mecanismo que efectivamente verifica. La presencia de un QR no acredita autenticidad.",
  },
  {
    t: "placa",
    num: 16,
    titulo: "Recibimos un documento. ¿Ahora qué?",
    bajada: "La verificación exige más que abrir un PDF.",
    bloque: 2,
    minuto: "41–44",
    cuerpo: "testimonio",
    pasos: 0,
    activa: "uc_testimonio",
    lineas: [
      "Caso: llega por correo un testimonio judicial digital con firma visible y QR",
      "¿Qué archivo recibí? ¿Conserva su estructura original?",
      "¿Qué firma tiene y cómo se verifica? ¿Cuál es su origen institucional?",
    ],
    nota:
      "INTERVENCIÓN 5 · caso práctico · 2 minutos. Un testimonio judicial digital ficticio llega a una escribanía para usarse en una operación.\n\nCon los porcentajes, armá en voz alta un criterio de revisión documental. Con E se marca la trampa (la apariencia visual) y queda la lista de verificaciones.\n\nNo se trata de que una sola acción resuelva todo: cada comprobación responde a un riesgo distinto.",
  },
  {
    t: "placa",
    num: 17,
    titulo: "Imprimir no siempre es conservar",
    bajada: "Una reproducción visual puede perder propiedades del documento original.",
    bloque: 2,
    minuto: "44–46",
    cuerpo: "imprimir",
    pasos: 2,
    lineas: [
      "La impresión muestra el contenido, pero no lleva la firma criptográfica ni la huella",
      "En el papel no hay nada que verificar matemáticamente",
      "El valor de una copia depende de las normas y del procedimiento: copias, testimonios y certificaciones tienen sus reglas",
    ],
    nota:
      "Humor posible: imprimimos el documento digital para sentirnos más seguros… y en ese acto perdemos la posibilidad de verificarlo.\n\nCuidado: no digas que toda impresión carece de valor. Distinguí la reproducción material del documento electrónico de los procedimientos jurídicamente reconocidos para expedir copias, testimonios y certificaciones.",
  },
  {
    t: "placa",
    num: 18,
    titulo: "El tiempo también importa",
    bajada: "La fecha de un documento y la evidencia temporal son cuestiones diferentes.",
    bloque: 2,
    minuto: "46–48",
    cuerpo: "tiempo",
    pasos: 3,
    lineas: [
      "Una página web hoy existe y mañana responde «404: no encontrada»",
      "Certificarla con sello de tiempo acredita qué se veía y cuándo",
      "Los archivos históricos (Wayback Machine) muestran versiones anteriores",
      "Años después hay que poder verificar la firma tal como estaba al firmar",
    ],
    nota:
      "Caso práctico ficticio con la metodología que uso en mis informes (certificación de páginas web, por ejemplo con SaveTheProof): una publicación certificada el 5/7 respondía 200 (existía) y el 10/7 respondía 404 (ya no estaba). Las capturas históricas de Wayback acreditan publicaciones anteriores.\n\nTres relojes: la fecha que declara el documento, la hora del dispositivo y la evidencia de un tercero confiable. Solo la tercera se puede verificar desde afuera.\n\nFirmas de largo plazo: no es lo mismo poder abrir un archivo que poder verificar su firma muchos años después (evidencias de validación, sellos de archivo).",
  },
  {
    t: "lab",
    id: "certweb",
    titulo: "Laboratorio · Anatomía de una certificación web",
    bajada: "Qué hay dentro del paquete que preserva una página y cómo se comprueba que no cambió.",
    bloque: 2,
    minuto: "48–50",
    lineas: [
      "El certificado identifica la URL, asigna un número y fija la fecha de captura",
      "Los metadatos, firmados y sellados, consignan la huella SHA-256 de cada archivo",
      "El HAR registra cada comunicación: qué se pidió, qué respondió el servidor, desde qué dominio y cuándo",
      "Para verificar: recalcular la huella y compararla con la consignada",
    ],
    nota:
      "Tu práctica real, con datos ficticios. Recorré el paquete: PDF (la representación visible), metadatos (firmados y sellados), HAR (el comprobante técnico de la navegación) y el sello de tiempo.\n\n1) Abrí «metadatos» y tocá «Verificar»: la huella recalculada coincide con la consignada. 2) Tocá «Alterar un segundo»: ya no coincide.\n3) Abrí el HAR: cada barra es una solicitud; mostrá el 200 del documento y las imágenes servidas desde otro dominio.\n\nAbajo está cómo lo consigno en un informe pericial. Las capturas del informe son reproducciones; los certificados originales quedan en el anexo digital.",
  },
  {
    t: "placa",
    num: 19,
    titulo: "¿Quién abrirá este archivo dentro de treinta años?",
    bajada: "Conservar documentos digitales también exige conservar su accesibilidad.",
    bloque: 2,
    minuto: "50–52",
    cuerpo: "obsolescencia",
    pasos: 2,
    lineas: [
      "Formatos, soportes y programas envejecen",
      "Conservar es conservar el archivo, su formato, sus evidencias de validación y sus metadatos",
      "Formatos de archivo estables (PDF/A), respaldos y procedimientos institucionales",
    ],
    nota:
      "Compará: un protocolo en papel se lee con los ojos dentro de cien años; un archivo necesita programas que cambian. Ejemplos: disquetes, WordPerfect, Flash (dejó de funcionar en 2020).\n\nLa preservación es un procedimiento institucional, no un pendrive en un cajón: almacenamiento, respaldos, formatos apropiados (PDF/A) y conservación de las evidencias que permitirán verificar las firmas en el futuro.",
  },
  {
    t: "placa",
    num: 20,
    titulo: "Blockchain: ¿un registro que nadie puede borrar?",
    bajada: "La criptografía también permite construir registros distribuidos y verificables.",
    bloque: 2,
    minuto: "52–54",
    cuerpo: "cadena",
    pasos: 0,
    probar: "cadena",
    lineas: [
      "Cada bloque guarda la huella del anterior: alterar uno rompe los siguientes",
      "Muchas copias en muchos nodos: una alteración se detecta",
      "Que un dato permanezca en la cadena no lo vuelve verdadero",
    ],
    nota:
      "Recuperá blockchain del Módulo II, ahora conectado con hash, firmas y trazabilidad. Editá el bloque 2 en la placa: se rompen los eslabones siguientes y la copia deja de coincidir con las de los demás nodos.\n\nEjemplo local: la Blockchain Federal Argentina ofrece registrar huellas de documentos como sello de tiempo.\n\nLímite: si el dato registrado era falso, la cadena conserva con fidelidad… un dato falso. Nada de criptomonedas: eje documental, registral y probatorio.",
  },
  {
    t: "placa",
    num: 21,
    titulo: "La tecnología verifica datos. ¿Quién verifica los hechos?",
    bajada: "La autenticidad técnica no agota el problema jurídico.",
    bloque: 2,
    minuto: "54–56",
    cuerpo: "giro-hechos",
    pasos: 0,
    activa: "uc_blockchain",
    giro: "TERCER GIRO · DE LOS DATOS A LAS PERSONAS · ",
    lineas: [
      "Un documento técnicamente íntegro puede tener un origen dudoso",
      "Puede no ser quien dice ser quien intervino",
      "Lo declarado puede ser falso",
    ],
    nota:
      "TERCER GIRO + INTERVENCIÓN 6 · escala de 1 a 5 · 90 segundos.\n\nMirá el promedio. Explicá: blockchain contribuye a acreditar propiedades de los registros y su trazabilidad, pero incorporar datos falsos a un registro técnicamente confiable no los convierte en verdaderos.\n\nPregunta que abre el bloque IV: ¿qué sucede cuando la tecnología permite fabricar una persona o una situación que aparenta ser real?",
  },

  // ─── BLOQUE IV · Inteligencia artificial, identidad y fraude ──────────────────────────
  {
    t: "placa",
    num: 22,
    titulo: "Ver ya no es creer",
    bajada: "La inteligencia artificial puede fabricar apariencias convincentes.",
    bloque: 3,
    minuto: "56–58",
    cuerpo: "sinteticos",
    pasos: 4,
    lineas: [
      "Imágenes, voces, videos y documentos sintéticos",
      "El engaño no nace con la IA: la IA lo facilita, lo abarata y lo escala",
    ],
    nota:
      "No expliques modelos de lenguaje ni redes neuronales. Una consecuencia concreta: se pueden generar representaciones que se confunden con registros auténticos de personas o acontecimientos.\n\nEstos riesgos no nacen con la IA, pero las herramientas actuales los vuelven más fáciles, baratos y masivos.",
  },
  {
    t: "placa",
    num: 23,
    titulo: "La persona de la pantalla podría no estar ahí",
    bajada: "Deepfakes, clonación de voz y suplantación de identidad.",
    bloque: 3,
    minuto: "58–61",
    cuerpo: "videollamada",
    pasos: 3,
    lineas: [
      "Ver la imagen de una persona no es acreditar su identidad",
      "Tampoco su presencia ni su voluntad",
      "Que la videoconferencia sea técnicamente posible no la habilita jurídicamente para cualquier acto",
    ],
    nota:
      "Videoconferencia ficticia: alguien parece comparecer para una actuación notarial o judicial. Diferenciá observar una imagen de acreditar identidad, presencia y voluntad.\n\nCaso público: Hong Kong, 2024. Un empleado de la firma Arup transfirió unos US$ 25 millones después de una videollamada en la que el director financiero y otros colegas eran recreaciones con IA.\n\nConectá con el programa: otorgamiento de actos por videoconferencia, jurisdicción, inmediación digital, validez de la manifestación de voluntad. La posibilidad técnica no equivale a una habilitación jurídica general.",
  },
  {
    t: "placa",
    num: 24,
    titulo: "¿Podés distinguir lo real de lo artificial?",
    bajada: "La apariencia puede ser persuasiva sin ser auténtica.",
    bloque: 3,
    minuto: "61–65",
    cuerpo: "real-ia",
    pasos: 0,
    activa: "uc_real_ia",
    lineas: ["Mirá el material y votá: real, generado con IA o no puedo determinarlo", "No existe una prueba visual universal que detecte todas las falsificaciones"],
    nota:
      "INTERVENCIÓN 7 · votación con video · 2 minutos. El material es sintético, preparado para la clase y sin personas reales (archivo en public/unca/ia/). Los resultados están ocultos.\n\nPedí que busquen indicios. Con R mostrás los resultados; con E revelás el origen.\n\nNo fomentes una falsa confianza en la capacidad de detectar deepfakes: «No puedo determinarlo» es una respuesta razonable. Conectá con la identificación de comparecientes y las audiencias virtuales.",
  },
  {
    t: "placa",
    num: 25,
    titulo: "Una identidad no es solamente una cara",
    bajada: "Identificar exige algo más que reconocer una imagen.",
    bloque: 3,
    minuto: "65–68",
    cuerpo: "identidad",
    pasos: 0,
    lineas: [
      "Algo que sabés, algo que tenés, algo que sos",
      "Prueba de vida, intervención institucional y contexto del acto",
      "Cada capa aporta y tiene límites: las garantías se combinan según el riesgo del acto",
    ],
    nota:
      "Tocá cada capa para mostrar qué aporta y cuál es su límite. Credenciales, factores de autenticación, biometría, prueba de vida, intervención institucional, contexto del acto.\n\nLa biometría también falla y trata datos sensibles. La intervención profesional no es infalible: es parte de un conjunto de garantías que se organizan según los riesgos y requisitos del acto.",
  },
  {
    t: "placa",
    num: 26,
    titulo: "Una firma válida. Una voluntad inexistente.",
    bajada: "La verificación criptográfica no resuelve todos los vicios de un acto.",
    bloque: 3,
    minuto: "68–70",
    cuerpo: "giro-voluntad",
    pasos: 3,
    giro: "CUARTO GIRO · DE LA TECNOLOGÍA A LA FUNCIÓN JURÍDICA · ",
    lineas: [
      "Caso ficticio: la firma se verifica correctamente",
      "Pero la clave la usó otra persona, o el consentimiento se obtuvo con engaño",
      "Una verificación técnica favorable no vuelve jurídicamente perfecto lo sucedido",
    ],
    nota:
      "CUARTO GIRO. Recuperá la placa 9: la firma prueba que se usó la clave; no prueba quién apretó el botón ni por qué.\n\nCaso ficticio: el token del titular estaba en manos de un colaborador, o la firma se obtuvo durante una videollamada con un supuesto banco. La firma verifica, la voluntad no existe.\n\nEl texto circular marca el regreso desde la tecnología hacia la función jurídica de los profesionales.",
  },

  // ─── BLOQUE V · El futuro de la confianza y la función profesional ──────────────────
  {
    t: "placa",
    num: 27,
    titulo: "¿Una máquina puede dar fe?",
    bajada: "Automatizar verificaciones no equivale a ejercer una función jurídica.",
    bloque: 4,
    minuto: "70–72",
    cuerpo: "maquina",
    pasos: 3,
    lineas: [
      "Automatizable: comparar huellas, verificar firmas, consultar el estado de un certificado",
      "Requiere interpretación jurídica: calificar el acto, valorar la prueba, capacidad y competencia",
      "Depende de procedimientos institucionales: fe pública, protocolo, identificación del compareciente",
    ],
    nota:
      "Distinguí el resultado de un proceso automatizado de los efectos propios de la intervención de un funcionario investido de competencias.\n\nNo presentes a la tecnología como adversaria de escribanos o jueces: se trata de identificar con precisión las funciones de cada uno.",
  },
  {
    t: "placa",
    num: 28,
    titulo: "El problema no es la tecnología. Es confiar sin verificar.",
    bajada: "La seguridad jurídica exige comprender qué acredita cada sistema.",
    bloque: 4,
    minuto: "72–75",
    cuerpo: "criterios",
    pasos: 6,
    lineas: [
      "Origen · ¿De dónde viene y por qué canal llegó?",
      "Integridad · ¿Cambió desde que se firmó?",
      "Firma y certificado · ¿De quién es, quién lo emitió, estaba vigente?",
      "Tiempo · ¿Hay evidencia temporal de un tercero?",
      "Identidad · ¿Quién intervino realmente?",
      "Contexto del acto · ¿Qué se quiso, con qué requisitos?",
    ],
    nota:
      "Síntesis de criterios profesionales: seis preguntas que recorren toda la clase.\n\nDoble riesgo: adoptar tecnología sin entenderla genera riesgos; rechazarla sin conocerla priva de herramientas valiosas. La salida es un uso informado y crítico.",
  },
  {
    t: "placa",
    num: 29,
    titulo: "¿Qué harías ahora?",
    bajada: "Resolver un caso exige integrar tecnología, hechos y derecho.",
    bloque: 4,
    minuto: "75–78",
    cuerpo: "decision",
    pasos: 0,
    activa: "uc_decision",
    lineas: ["Caso final: firma digital verificada, videoconferencia previa e indicios de suplantación con IA"],
    nota:
      "INTERVENCIÓN 8 · resolución de caso · 2 minutos. Resultados ocultos hasta que cierren: R los muestra, E revela la C.\n\nNo es un examen: recuperá conocimientos de toda la exposición. El profesional tiene que comprender qué acredita cada sistema y qué sigue requiriendo comprobaciones adicionales.\n\nPuente al cierre: «Volvamos a la primera nube».",
  },
  {
    t: "placa",
    num: 30,
    titulo: "La confianza cambia de arquitectura",
    bajada: "La tecnología transforma las garantías; no elimina la responsabilidad.",
    bloque: 4,
    minuto: "78–80",
    cuerpo: "arquitectura",
    pasos: 2,
    lineas: [
      "Los mecanismos de confianza no desaparecieron: se ampliaron, se combinaron y se hicieron más complejos",
      UC_FRASE_FINAL,
    ],
    nota:
      "Volvé a la pregunta de la placa 1 y a la nube de la sala (está a la izquierda). Al empezar, la autenticidad se asociaba con la apariencia o con ciertos signos. Ahora: los entornos digitales permiten verificaciones extraordinariamente precisas, pero ninguna resuelve sola los problemas de identidad, voluntad, legalidad y verdad.\n\nReivindicá la comprensión tecnológica como competencia profesional, sin confundir garantías matemáticas con garantías jurídicas.\n\nFrase final (→): «El desafío no es elegir entre confiar en las personas o confiar en la tecnología. Es saber qué podemos exigirle a cada una».",
  },
];

export const UC_SLIDES = SLIDES;
export const UC_ACTIVIDADES = ACTIVIDADES;

/** Nombre corto de una pantalla (grilla y notas). */
export function tituloSlideUc(s: UcSlide): string {
  switch (s.t) {
    case "portada":
      return "Portada";
    case "ingreso":
      return "Ingreso de la sala";
    case "placa":
      return `${String(s.num).padStart(2, "0")} · ${s.titulo}`;
    case "lab":
      return `🧪 ${s.titulo.replace(/^Laboratorio · /, "")}`;
  }
}

export function pasosSlideUc(s: UcSlide | undefined): number {
  return s?.t === "placa" ? s.pasos : 0;
}

export const UC_CONFIG: ClaseVivoConfig = {
  slug: UC_SLUG,
  titulo: UC_TITULO,
  materia: `${UC_DIPLOMATURA} · ${UC_INSTITUCION}`,
  autor: UC_DOCENTE,
  cargo: "Módulo III",
  poll: { alumno: 3500, alumnoMe: 20000, deck: 2500 },
  getActividad: getUcActividad,
  anonimo: true,
};
