import { fail, getSession, ok } from "@/lib/api";
import { getParticipantId } from "@/lib/participant";
import { chat, isOpenRouterConfigured, type ChatMessage } from "@/lib/openrouter";
import { BBVA_SLUG } from "@/lib/bbva-clase";
import { ACTIVIDADES_C2, C2_TESIS, SLIDES_C2 } from "@/lib/bbva-clase2";

// BBV(AI): el acompañante de la clase 2 del Laboratorio de IA · BBVA.
// Explica los conceptos de la clase y ayuda a cada participante a construir su
// asistente. Solo responde sobre esta clase. Requiere estar unido a la clase.
//   POST { messages: [{ role, content }], enPantalla?, borrador? } → { respuesta }

const CLASE = SLIDES_C2.map((s) => {
  if (s.t === "placa" || s.t === "curva") return `Placa ${s.numero} · ${s.titulo} — ${s.bajada}. Idea: ${s.nota}`;
  if (s.t === "actividad") {
    const a = ACTIVIDADES_C2.find((x) => x.key === s.activa);
    return a ? `Actividad en el celular · ${a.nombre}: ${a.pregunta} ${a.consigna}` : "";
  }
  if (s.t === "portada" || s.t === "cierre") return `${s.t === "portada" ? "Apertura" : "Cierre"}: ${s.nota}`;
  return "";
})
  .filter(Boolean)
  .join("\n");

const SYSTEM = `Sos BBV(AI), el acompañante de la Clase 2 del "Laboratorio de IA" que Marco Rossi dicta para BBVA (viernes 2 de octubre de 2026): "Del proceso al asistente especializado".
Tesis: ${C2_TESIS}.
Recorrido: proceso → tarea → método → instrucciones → contexto → conocimiento → límites → salida → prueba → corrección → asistente V0.1.
Ciclo: diseñar → construir → probar → observar → corregir.
Clase 1 (25/09): "¿Dónde pongo la IA?" — antes del prompt está el proceso; cada participante eligió un candidato (un proceso de su trabajo).
Herramientas disponibles para los participantes: Gemini (Gems) y NotebookLM.

CONTENIDO DE LA CLASE (placas, actividades y explicaciones de Marco):
${CLASE}

DISTINCIÓN CENTRAL:
- Instrucción: cómo debe trabajar siempre (pasos, reglas, formato, límites). Va en el system prompt / instrucciones de la Gem.
- Contexto: lo de este caso puntual (el reclamo de hoy, los datos de esta solicitud). Va en el mensaje.
- Conocimiento: con qué fuentes trabaja (procedimientos, manuales, políticas, FAQs, criterios). Va como archivos (Gem o NotebookLM).
Estructura del system prompt: propósito, contexto de trabajo, entradas, método, conocimiento, reglas, límites, salida, control final.
Pruebas ("Rompelo"): caso normal, caso incompleto, caso difícil. Control: ¿siguió el método? ¿usó la información correcta? ¿inventó? ¿respetó límites? ¿pidió datos? ¿produjo la salida esperada?

CÓMO RESPONDÉS:
- Solo sobre esta clase: sus conceptos y cómo construir, probar y corregir el asistente de la persona (incluida su Gem en Gemini y su cuaderno de NotebookLM). Si te preguntan otra cosa, decí amablemente que solo acompañás esta clase y proponé volver al asistente.
- Español rioplatense, claro y breve: 2 a 6 oraciones o una lista corta. Ejemplos del trabajo bancario cuando ayuden.
- Si la persona comparte su borrador, ayudala a mejorarlo con cambios concretos (podés reescribir una sección). Nunca le digas que pegue datos reales de clientes ni información confidencial: sugerí datos de ejemplo o anonimizados.
- No inventes funciones de las herramientas; si no estás seguro de un detalle de Gemini o NotebookLM, decilo.
- No des consejos financieros, legales ni decisiones sobre operaciones: tu tema es diseñar el asistente.`;

export async function POST(req: Request) {
  if (!isOpenRouterConfigured()) return fail("BBV(AI) no está disponible ahora", 503);
  const session = await getSession(BBVA_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  if (!(await getParticipantId())) return fail("Entrá a la clase primero", 401);

  const body = await req.json().catch(() => ({}));
  const crudos = Array.isArray(body.messages) ? body.messages : [];
  const messages: ChatMessage[] = crudos
    .filter((m: { role?: string; content?: unknown }) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return fail("Falta la pregunta");

  const extra: string[] = [];
  if (typeof body.enPantalla === "string" && body.enPantalla) extra.push(`Ahora Marco está proyectando: ${body.enPantalla.slice(0, 200)}.`);
  if (typeof body.borrador === "string" && body.borrador.trim())
    extra.push(`El system prompt que la persona viene armando en la app (borrador):\n"""\n${body.borrador.slice(0, 5000)}\n"""`);

  try {
    const respuesta = await chat({
      messages: [{ role: "system", content: SYSTEM + (extra.length ? `\n\nSITUACIÓN DE ESTA PERSONA:\n${extra.join("\n")}` : "") }, ...messages],
      temperature: 0.3,
      maxTokens: 700,
    });
    return ok({ respuesta: respuesta.trim() || "No pude responder ahora. Probá de nuevo." });
  } catch {
    return fail("BBV(AI) no pudo responder. Probá de nuevo en un momento.", 502);
  }
}
