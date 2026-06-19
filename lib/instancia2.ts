// ============================================================
// Instancia 2 — Producción de un instrumento jurídico con IA
//
// Segunda instancia del laboratorio: el alumno elige UN instrumento
// (demanda / sentencia / proyecto de ley), descarga las piezas ficticias,
// las sube a NotebookLM o a su IA y produce el instrumento.
// ============================================================

export type InstrumentoId = "demanda" | "sentencia" | "ley";

export interface Pieza {
  n: number;
  titulo: string;
  blurb: string; // por qué importa (para el alumno)
  file: string; // ruta en /public
}

export interface Instrumento {
  id: InstrumentoId;
  tipo: string; // "Demanda", "Sentencia", "Proyecto de ley"
  emoji: string;
  titulo: string;
  resumen: string;
  consigna: string; // qué tiene que producir
  piezas: Pieza[];
}

export const INSTRUMENTOS: Instrumento[] = [
  {
    id: "demanda",
    tipo: "Demanda",
    emoji: "⚖️",
    titulo: "La influencer y el escrache coordinado",
    resumen:
      "Una creadora de contenido (600 mil seguidores) es blanco de una campaña organizada: varias cuentas difunden capturas editadas que la muestran haciendo comentarios racistas que nunca hizo. En 72 horas pierde tres sponsoreos y su marca principal rescinde el vínculo.",
    consigna:
      "Redactá la DEMANDA civil por daño al honor, a la imagen y daño económico cuantificable contra las tres cuentas identificables y, solidariamente, contra la marca que difundió las capturas antes de rescindir.",
    piezas: [
      {
        n: 1,
        titulo: "Peritaje informático de autenticidad",
        blurb:
          "Prueba central de la antijuridicidad: determina que las capturas son apócrifas (metadatos, versión de la app y texto superpuesto).",
        file: "/instancia2/demanda-p1-peritaje.txt",
      },
      {
        n: 2,
        titulo: "Contrato de sponsoreo rescindido (cláusula de moralidad)",
        blurb:
          "Acredita el nexo causal con el daño económico: la cláusula se activó citando las capturas falsas, no una conducta real.",
        file: "/instancia2/demanda-p2-contrato.txt",
      },
      {
        n: 3,
        titulo: "Registro del hilo coordinado (timestamps y usuarios)",
        blurb:
          "Permite sostener la actuación concertada que habilita la responsabilidad solidaria, frente a la crítica individual.",
        file: "/instancia2/demanda-p3-hilo.txt",
      },
      {
        n: 4,
        titulo: "Métricas de engagement antes y después",
        blurb:
          "Cuantifica el daño económico: la caída de alcance e interacción es el indicador con que las marcas valúan una cuenta.",
        file: "/instancia2/demanda-p4-metricas.txt",
      },
    ],
  },
  {
    id: "sentencia",
    tipo: "Sentencia",
    emoji: "🧑‍⚖️",
    titulo: "El streamer suspendido sin aviso",
    resumen:
      "Un streamer (280 mil suscriptores, dos años de actividad continua) es dado de baja sin notificación ni descargo. La plataforma invoca una cláusula genérica sobre 'contenido que genera división'. Pierde su fuente principal de ingresos y demanda por rescisión abusiva de un contrato de adhesión.",
    consigna:
      "Redactá la SENTENCIA: resolvé si una plataforma privada puede aplicar sus términos de forma discrecional sin debido proceso y si ello genera responsabilidad resarcible. Fundá hechos, derecho y parte resolutiva.",
    piezas: [
      {
        n: 1,
        titulo: "Términos de servicio (cláusula invocada)",
        blurb:
          "Base del argumento de la plataforma y su punto más débil: cláusula vaga, discrecional y sin proceso (régimen de defensa del consumidor).",
        file: "/instancia2/sentencia-p1-terminos.txt",
      },
      {
        n: 2,
        titulo: "Historial de ingresos (18 meses)",
        blurb:
          "Acredita una relación económica consolidada y creciente: la baja generó un daño patrimonial concreto y mensurable.",
        file: "/instancia2/sentencia-p2-ingresos.txt",
      },
      {
        n: 3,
        titulo: "Transcripción del clip que motivó la baja",
        blurb:
          "Permite evaluar si hubo causa legítima o aplicación arbitraria de la cláusula vaga (no hay insultos ni prohibición explícita).",
        file: "/instancia2/sentencia-p3-clip.txt",
      },
      {
        n: 4,
        titulo: "Comunicación de baja y respuesta",
        blurb:
          "Ilustra la ausencia de debido proceso: sin hecho imputado, sin descargo y sin apelación, frente a la buena fe contractual.",
        file: "/instancia2/sentencia-p4-baja.txt",
      },
    ],
  },
  {
    id: "ley",
    tipo: "Proyecto de ley",
    emoji: "📜",
    titulo: "Identidad digital y anonimato responsable",
    resumen:
      "Una ley que regula cuándo una persona puede mantener el anonimato en plataformas y el procedimiento judicial para levantarlo ante daño concreto. Equilibra anonimato (libertad de expresión) con honor, imagen y no discriminación, define responsabilidades de plataformas y crea una cautelar urgente.",
    consigna:
      "Redactá el PROYECTO DE LEY (con fundamentos y articulado): derecho al anonimato, estándar y procedimiento judicial para levantarlo, deberes de las plataformas y procedimiento cautelar urgente para daño inminente.",
    piezas: [
      {
        n: 1,
        titulo: "Fallo (ficticio) sobre expresión anónima",
        blurb:
          "Piso constitucional: anonimato protegido salvo daño concreto; identificación como último recurso y con orden judicial fundada.",
        file: "/instancia2/ley-p1-csjn.txt",
      },
      {
        n: 2,
        titulo: "Informe de estándares de DD.HH. (anonimato)",
        blurb:
          "Estándar internacional: legalidad, necesidad, proporcionalidad y orden judicial para levantar el anonimato.",
        file: "/instancia2/ley-p2-cidh.txt",
      },
      {
        n: 3,
        titulo: "Caso documentado de escrache anónimo",
        blurb:
          "Justifica la necesidad de la ley: el vacío actual genera daños irreparables que el sistema no repara a tiempo.",
        file: "/instancia2/ley-p3-escrache.txt",
      },
      {
        n: 4,
        titulo: "Derecho comparado: DSA (UE), adaptado",
        blurb:
          "Modelo más avanzado: seudónimo público con identidad recuperable por orden judicial, plazos y cooperación.",
        file: "/instancia2/ley-p4-dsa.txt",
      },
    ],
  },
];

export function getInstrumento(id: InstrumentoId | null | undefined): Instrumento | null {
  return INSTRUMENTOS.find((i) => i.id === id) ?? null;
}
