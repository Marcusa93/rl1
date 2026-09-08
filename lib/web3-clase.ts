// ============================================================
// Guion de la clase "Web3, descentralización y gobernanza"
// (/web3) — Diplomatura en Derecho 5.0: Transformación digital de
// la abogacía (UMSA). Presentación pura (sin actividades en vivo):
// mismo motor y estética que /empresas/clase.
// ============================================================

import type { DiagramaW3Id } from "@/components/web3/diagramas";

export const W3_TITLE = "Web3, descentralización y gobernanza";
export const W3_SUBTITLE = "La historia de la confianza, de la palabra dada a la infraestructura digital";
export const W3_MATERIA = "Diplomatura en Derecho 5.0 · Transformación digital de la abogacía — UMSA";

export interface W3Portada {
  t: "portada";
}
export interface W3Placa {
  t: "placa";
  titulo: string;
  /** La bajada de la placa (segunda línea del guion). */
  bajada: string;
  /** Nota breve opcional bajo el diagrama. */
  lede?: string;
  /** Píldoras: listas cortas de términos (se muestran como chips). */
  pills?: string[];
  diagrama: DiagramaW3Id;
}
export interface W3Final {
  t: "final";
}
export type W3Slide = (W3Portada | W3Placa | W3Final) & {
  /** Marca el comienzo de una parte; se muestra en el pie hasta la próxima marca. */
  parte?: string;
};

export const W3_SLIDES: W3Slide[] = [
  { t: "portada" },

  // --- Parte I · La historia de la confianza -----------------------------
  {
    t: "placa",
    parte: "Parte I · La historia de la confianza",
    titulo: "Antes de la tecnología, estaba la confianza",
    bajada: "Toda sociedad necesita alguna forma de creer en los demás.",
    diagrama: "palabra",
  },
  {
    t: "placa",
    titulo: "Cuando todos se conocían",
    bajada: "La confianza empezó siendo personal.",
    diagrama: "aldea",
  },
  {
    t: "placa",
    titulo: "La sociedad creció",
    bajada: "Y conocer personalmente al otro dejó de alcanzar.",
    diagrama: "escala",
  },
  {
    t: "placa",
    titulo: "Inventamos intermediarios",
    bajada: "Alguien tenía que certificar que algo era verdadero.",
    pills: ["escribanos", "registros", "monedas", "autoridades", "jueces", "bancos"],
    diagrama: "certificar",
  },
  {
    t: "placa",
    titulo: "El Derecho también fabrica confianza",
    bajada: "Registra, certifica, reconoce y resuelve.",
    diagrama: "derecho",
  },
  {
    t: "placa",
    titulo: "Después llegó Internet",
    bajada: "Pero los intermediarios no desaparecieron.",
    diagrama: "internet",
  },
  {
    t: "placa",
    titulo: "La confianza cambió de manos",
    bajada: "Del Estado y las instituciones a las plataformas.",
    diagrama: "manos",
  },
  {
    t: "placa",
    titulo: "¿Y si la confianza no tuviera un centro?",
    bajada: "Esta es una de las promesas de Web3.",
    diagrama: "sincentro",
  },
  {
    t: "placa",
    titulo: "No es magia. Es arquitectura",
    bajada: "Blockchain propone una forma distinta de registrar y verificar.",
    diagrama: "bloques",
  },
  {
    t: "placa",
    titulo: "Web3 cambia una pregunta",
    bajada: "Ya no sólo importa qué confiamos, sino en quién confiamos.",
    diagrama: "enquien",
  },

  // --- Parte II · ¿Sos vos? ----------------------------------------------
  {
    t: "placa",
    parte: "Parte II · ¿Sos vos?",
    titulo: "Ahora el problema sos vos",
    bajada: "¿Cómo sabemos que alguien es quien dice ser?",
    diagrama: "sosvos",
  },
  {
    t: "placa",
    titulo: "Tu identidad ya no entra en un DNI",
    bajada: "Datos, cuentas, rostros, voces y rastros también te representan.",
    diagrama: "rastros",
  },
  {
    t: "placa",
    titulo: "Durante años confiamos en ver y escuchar",
    bajada: "Una voz o una imagen parecían evidencia suficiente.",
    diagrama: "verescuchar",
  },
  {
    t: "placa",
    titulo: "Eso se terminó",
    bajada: "La IA puede fabricar una presencia que nunca existió.",
    diagrama: "deepfake",
  },
  {
    t: "placa",
    titulo: "¿Sos vos o parece que sos vos?",
    bajada: "La identidad entra en una crisis de autenticidad.",
    diagrama: "autenticidad",
  },
  {
    t: "placa",
    titulo: "El phishing también evolucionó",
    bajada: "Ya no necesita un mail mal escrito.",
    diagrama: "phishing",
  },
  {
    t: "placa",
    titulo: "Tu imagen puede actuar sin vos",
    bajada: "La IA permite usar una identidad sin presencia ni consentimiento.",
    diagrama: "imagenajena",
  },
  {
    t: "placa",
    titulo: "Entonces, ¿qué protegemos?",
    bajada: "Identidad, imagen, datos y autenticidad empiezan a mezclarse.",
    pills: ["derechos personalísimos", "protección de datos", "consentimiento", "fraude", "responsabilidad", "prueba"],
    diagrama: "proteger",
  },
  {
    t: "placa",
    titulo: "Demostrar menos puede ser mejor",
    bajada: "Una identidad digital no debería revelar todo para probar algo.",
    diagrama: "credencial",
  },
  {
    t: "placa",
    titulo: "La pregunta ya no es “quién sos”",
    bajada: "También importa demostrar qué es auténticamente tuyo.",
    pills: ["firma digital", "credenciales verificables", "trazabilidad", "identidad soberana"],
    diagrama: "procedencia",
  },

  // --- Parte III · Cuando el código hace cumplir la regla ----------------
  {
    t: "placa",
    parte: "Parte III · El código como regla",
    titulo: "Las reglas también se digitalizaron",
    bajada: "Del texto jurídico al comportamiento programado.",
    diagrama: "reglascodigo",
  },
  {
    t: "placa",
    titulo: "Antes la norma decía “no podés”",
    bajada: "Ahora un sistema puede directamente impedirlo.",
    diagrama: "nopodes",
  },
  {
    t: "placa",
    titulo: "Cuando el código ejecuta la regla",
    bajada: "El smart contract reduce el espacio entre decisión y cumplimiento.",
    diagrama: "smart",
  },
  {
    t: "placa",
    titulo: "¿Puede programarse la justicia?",
    bajada: "El código ejecuta condiciones, pero no comprende todo el Derecho.",
    diagrama: "justicia",
  },
  {
    t: "placa",
    titulo: "Y si las reglas están distribuidas…",
    bajada: "También puede distribuirse la organización.",
    diagrama: "distribuidas",
  },

  // --- Parte IV · ¿Quién manda si nadie manda? ---------------------------
  {
    t: "placa",
    parte: "Parte IV · ¿Quién manda si nadie manda?",
    titulo: "¿Quién manda si nadie manda?",
    bajada: "Las DAOs intentan organizar decisiones sin un centro tradicional.",
    diagrama: "dao",
  },
  {
    t: "placa",
    titulo: "Descentralizado no significa democrático",
    bajada: "El poder también puede concentrarse dentro de una red distribuida.",
    diagrama: "ballena",
  },
  {
    t: "placa",
    titulo: "Si nadie manda, ¿quién responde?",
    bajada: "La descentralización vuelve incómodas muchas categorías jurídicas.",
    pills: ["responsabilidad", "representación", "domicilio", "jurisdicción", "patrimonio", "competencia judicial"],
    diagrama: "responde",
  },

  // --- Cierre · El abogado como traductor --------------------------------
  {
    t: "placa",
    parte: "Cierre · El abogado como traductor",
    titulo: "El abogado no necesita convertirse en programador",
    bajada: "Pero sí entender qué hace el sistema que está regulando.",
    diagrama: "arquitectura",
  },
  {
    t: "placa",
    titulo: "El abogado como traductor",
    bajada: "Entre personas, normas y sistemas tecnológicos.",
    lede: "El Derecho siempre fue una tecnología para organizar la confianza. Lo que cambia no es esa necesidad: es la infraestructura sobre la que la construimos.",
    diagrama: "traductor",
  },

  { t: "final" },
];
