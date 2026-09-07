// ============================================================
// Guion de la clase "Empresas e IA" (/empresas/clase).
// Presentación que el docente comparte por Zoom: los alumnos ven
// esta pantalla y responden desde su propio celular en /empresas.
//
// La placa manda: al llegar a una placa de actividad, la presentación
// activa sola esa actividad vía la API (no hace falta tocar el panel
// docente) y muestra los resultados en vivo incrustados.
// ============================================================

import type { ComActivity } from "./comercial";
import type { DiagramaId } from "@/components/comercial/diagramas";

export interface SlidePortada {
  t: "portada";
  activa: ComActivity; // al pararse acá, manda a todos al lobby
}
export interface SlideTexto {
  t: "texto";
  eyebrow: string;
  titulo: string;
  lede?: string; // admite **negrita**
  bullets?: string[];
  pasos?: string[]; // lista numerada
  diagrama?: DiagramaId;
}
export interface SlideCaso {
  t: "caso";
  emoji: string;
  empresa: string;
  titulo: string;
  bullets: string[];
  pregunta: string; // la pregunta jurídica que abre
  diagrama: DiagramaId;
}
export interface SlideVideo {
  t: "video";
  eyebrow: string;
  titulo: string;
  youtubeId: string;
  nota: string;
}
export interface SlideActividad {
  t: "actividad";
  activa: ComActivity; // actividad que se activa sola al llegar acá
  escena: string;
  titulo: string;
  pregunta: string;
  resumen?: string; // contexto breve visible en pantalla (ej. caso Prisma)
}
export interface SlideFinal {
  t: "final";
}

export type ClaseSlide =
  | SlidePortada
  | SlideTexto
  | SlideCaso
  | SlideVideo
  | SlideActividad
  | SlideFinal;

export const CLASE_SLIDES: ClaseSlide[] = [
  { t: "portada", activa: "lobby" },

  {
    t: "texto",
    eyebrow: "Apertura",
    titulo: "Una empresa que ya cambió",
    lede:
      "En algún lugar, ahora mismo, un sistema decide **a quién le prestan**, **qué precio ve cada cliente**, o **qué currículum pasa a la próxima ronda**. Nadie lo escribió a mano: lo entrenaron con datos y lo dejaron correr.",
  },
  {
    t: "texto",
    eyebrow: "El plan de hoy",
    titulo: "Tres partes, un hilo",
    pasos: [
      "La empresa y la IA, hoy — con casos reales",
      "El abogado en el recorrido del cliente — cinco escenas",
      "Un conflicto: el caso Óptica Prisma",
    ],
    lede: "Vas a responder desde tu celular varias veces. Entrá ahora: **rl1-beige.vercel.app/empresas**",
  },

  {
    t: "actividad",
    activa: "emp_encuesta",
    escena: "Actividad 1",
    titulo: "Encuesta relámpago",
    pregunta: "¿Usás IA? ¿Trabajaste en una empresa? ¿Creés que te va a reemplazar?",
  },

  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "¿Qué es la IA?",
    bullets: [
      "Automatización tradicional: reglas fijas, escritas a mano.",
      "IA: clasifica, predice, recomienda o genera — a partir de patrones en datos.",
      "No “entiende”: procesa y devuelve un resultado.",
    ],
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "Inputs → modelo → outputs",
    diagrama: "io",
    lede: "Guardá este esquema: vuelve cuando el cliente llegue al estudio.",
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "Transformación digital ≠ comprar software",
    bullets: [
      "Es cambiar procesos, decisiones y organización.",
      "Sin cambiar el proceso, no hay transformación — hay gasto.",
    ],
  },

  {
    t: "actividad",
    activa: "emp_usos",
    escena: "Actividad 2",
    titulo: "¿Dónde ya viste IA en una empresa?",
    pregunta: "Marcá en tu celular todos los usos que viste, te contaron o te imaginás.",
  },

  {
    t: "texto",
    eyebrow: "Casos reales",
    titulo: "Esto no es futuro: ya maneja empresas",
    lede:
      "Tres empresas que usás todas las semanas donde las decisiones centrales —el precio, quién trabaja, quién recibe crédito— **ya las toma un algoritmo**.",
  },
  {
    t: "caso",
    emoji: "🚗",
    empresa: "Uber",
    titulo: "El precio lo pone el sistema",
    diagrama: "surge",
    bullets: [
      "Tarifa dinámica: el precio cambia solo según demanda, clima y hora.",
      "El sistema asigna los viajes y evalúa a cada conductor.",
      "Con calificación baja, la app puede desactivar al conductor: nadie lo “despidió”.",
    ],
    pregunta: "¿Ese precio fue “acordado”? ¿Y quién es el empleador del conductor?",
  },
  {
    t: "caso",
    emoji: "🛵",
    empresa: "PedidosYa · Rappi",
    titulo: "El supervisor es un algoritmo",
    diagrama: "reparto",
    bullets: [
      "El ranking del repartidor define qué franjas y cuántos pedidos recibe.",
      "Tiempos de entrega, aceptación y conexión: todo se mide, todo puntúa.",
      "En Argentina ya hay litigios sobre si eso es una relación de dependencia.",
    ],
    pregunta: "Si el algoritmo organiza, controla y sanciona… ¿eso no es dirigir el trabajo?",
  },
  {
    t: "caso",
    emoji: "📦",
    empresa: "Mercado Libre · Mercado Pago",
    titulo: "Reputación y crédito, sin humanos",
    diagrama: "scoring",
    bullets: [
      "La reputación decide qué vendedor aparece primero — y quién queda suspendido.",
      "Mercado Pago ofrece o niega crédito por scoring, sin oficial de cuentas.",
      "Para miles de pymes, ese puntaje ES el acceso al mercado.",
    ],
    pregunta: "¿Cómo se defiende el sancionado por un algoritmo que nadie le explica?",
  },
  {
    t: "video",
    eyebrow: "Para ver",
    titulo: "La dictadura del algoritmo",
    youtubeId: "TVornWcWTAg",
    nota: "Fragmento sugerido: los primeros minutos. Si no carga, abrilo directo en YouTube.",
  },

  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "Tarea, no puesto",
    bullets: [
      "Se automatizan tareas, no profesiones enteras.",
      "El puesto cambia de contenido — no siempre desaparece.",
      "Reconversión laboral (reskilling): la alternativa al recorte.",
    ],
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "Quien decide, responde",
    bullets: [
      "El sistema ejecuta.",
      "La empresa decide incorporarlo, cómo, y con qué controles.",
      "Esa decisión es de gestión — no un detalle técnico.",
    ],
  },

  {
    t: "texto",
    eyebrow: "Parte II",
    titulo: "Ahora, del otro lado del escritorio",
    lede:
      "Ya vimos a la empresa. Pasemos al **abogado que la asesora** — cinco escenas de un mismo cliente, del primer llamado al primer conflicto.",
  },
  {
    t: "texto",
    eyebrow: "El recorrido del cliente",
    titulo: "Cinco escenas",
    pasos: [
      "Quiere incorporar IA",
      "Encontró una herramienta y quiere contratarla",
      "Quiere que sus empleados la usen",
      "Generó algo con IA y quiere venderlo",
      "Un conflicto: Óptica Prisma",
    ],
  },

  {
    t: "actividad",
    activa: "emp_b1",
    escena: "Escena 1",
    titulo: "Quiero incorporar IA a mi empresa",
    pregunta: "¿Qué actividad quiere delegar la empresa, y qué consecuencias podría producir?",
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "¿Qué estás contratando, en realidad?",
    bullets: [
      "¿Licencia? ¿Servicio en línea? ¿Un modelo de un tercero?",
      "Mirá: precio y duración, tus datos, confidencialidad, de quién son los resultados, qué pasa si te vas.",
    ],
  },
  {
    t: "actividad",
    activa: "emp_b2",
    escena: "Escena 2",
    titulo: "Encontré una herramienta y quiero contratarla",
    pregunta: "¿Qué recibe la empresa, y qué conserva el proveedor?",
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "El riesgo puertas adentro",
    bullets: [
      "Datos personales, secreto comercial, know-how, material confidencial.",
      "Una política interna: qué se puede cargar, dónde, y bajo qué autorización.",
    ],
  },
  {
    t: "actividad",
    activa: "emp_b3",
    escena: "Escena 3",
    titulo: "Quiero que mis empleados usen IA",
    pregunta: "¿Qué NO debería cargar nunca un empleado en una IA de terceros?",
  },
  {
    t: "texto",
    eyebrow: "Concepto",
    titulo: "Usar, tener derechos, impedir — no es lo mismo",
    bullets: [
      "¿Qué intervención humana hubo?",
      "¿Qué dicen los términos del proveedor?",
      "¿Pisa derechos de autor, marcas o diseños de terceros?",
    ],
  },
  {
    t: "actividad",
    activa: "emp_b4",
    escena: "Escena 4",
    titulo: "Generamos esto con IA y queremos venderlo",
    pregunta: "¿La empresa tiene un activo protegible, o solo un resultado que puede usar?",
  },

  {
    t: "texto",
    eyebrow: "Antes del caso",
    titulo: "Dos ideas más",
    bullets: [
      "Derecho a la imagen y a la voz: una autorización limitada no se extiende sola.",
      "Responsabilidad en cadena: empresa, agencia, proveedor — hay que reconstruir el rol de cada uno.",
    ],
  },
  {
    t: "actividad",
    activa: "emp_b5",
    escena: "Escena 5 · Caso",
    titulo: "Óptica Prisma",
    resumen:
      "Contrató a una actriz para una campaña limitada. Años después, marketing usó esas fotos para generar con IA videos nuevos de una colección actual. Nadie volvió a hablar con ella. La actriz reclama.",
    pregunta: "¿Qué contratos pedís primero? ¿Quién puede haber respondido? ¿Qué protocolo proponés?",
  },

  {
    t: "texto",
    eyebrow: "Síntesis",
    titulo: "Cinco ideas para llevarse",
    bullets: [
      "La IA automatiza tareas antes que puestos: preguntá siempre qué tarea, no qué profesión.",
      "El sistema ejecuta; la empresa decide incorporarlo. Quien decide, responde.",
      "Sin registro de lo que el sistema hizo, la empresa no puede explicarse después.",
      "Delegar la atención o la decisión en un sistema no delega los deberes frente a clientes y empleados.",
      "Casi todo lo que hoy no está resuelto por norma, la empresa lo ordena por contrato y controles internos.",
    ],
  },
  {
    t: "actividad",
    activa: "emp_cierre",
    escena: "Cierre",
    titulo: "Una palabra que te llevás",
    pregunta: "Escribila en tu celular — y descargá el glosario en PDF antes de salir.",
  },

  { t: "final" },
];
