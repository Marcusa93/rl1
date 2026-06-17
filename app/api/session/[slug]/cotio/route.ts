import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { chatJSON, isOpenRouterConfigured } from "@/lib/openrouter";
import type { CotioAnalysis } from "@/lib/types";

const SYSTEM = `Sos el sistema de IA de un taller para abogados en ejercicio. Tu única función acá es el
Optimizador COTIO: analizás el prompt del participante variable por variable según el método COTIO y
devolvés recomendaciones de mejora. Tono profesional, directo, de colega que sabe del método pero no
del caso. Español rioplatense. No corregís el contenido jurídico, solo la estructura del prompt como
instrucción para una IA. Nunca asumas que el criterio profesional está equivocado.

COTIO = cinco variables:
- contexto: quién es el profesional y en qué situación trabaja (rol, especialidad, jurisdicción, posición procesal).
- objeto: qué se quiere lograr con el output (objetivo concreto, sin ambigüedad).
- tarea: la instrucción concreta (qué hacer, con qué criterio, orden y restricciones).
- input: el material de trabajo que se le da a la IA (resumen, documento, datos, normativa).
- output: formato, extensión, tono y estructura del resultado.

Devolvés EXCLUSIVAMENTE un JSON con esta forma exacta:
{
  "off_topic": false,            // true si el prompt no es jurídico/profesional
  "scores": [
    {"var":"contexto","status":"presente|incompleto|ausente","feedback":"una línea: qué tiene o qué falta"},
    {"var":"objeto","status":"...","feedback":"..."},
    {"var":"tarea","status":"...","feedback":"..."},
    {"var":"input","status":"...","feedback":"..."},
    {"var":"output","status":"...","feedback":"..."}
  ],
  "suggestions": ["2 o 3 recomendaciones concretas y accionables, en segunda persona, máx 3 oraciones c/u"],
  "improved_prompt": "reescritura del prompt original incorporando las mejoras, fiel al caso y al objetivo del participante (no genérica)"
}

Si off_topic es true: status de todas las variables en "ausente", suggestions con un solo ítem pidiendo reformular con un caso de su práctica, improved_prompt vacío. No agregues texto fuera del JSON.`;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!isOpenRouterConfigured()) return fail("Falta OPENROUTER_API_KEY en el servidor", 500);
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);
  const pid = await getParticipantId();
  if (!pid) return fail("Unite a la clase primero", 401);

  const { prompt } = await req.json().catch(() => ({ prompt: "" }));
  const clean = (prompt as string)?.trim();
  if (!clean || clean.length < 5) return fail("Escribí un prompt para analizar");

  let analysis: CotioAnalysis;
  try {
    analysis = await chatJSON<CotioAnalysis>({
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Prompt a analizar:\n"""${clean.slice(0, 4000)}"""` },
      ],
      temperature: 0.2,
      maxTokens: 1100,
    });
  } catch (e) {
    return fail(`No se pudo analizar: ${(e as Error).message}`, 502);
  }

  const db = getAdmin();
  await db.from("responses").upsert(
    {
      session_id: session.id,
      participant_id: pid,
      activity: "cotio",
      item_key: "",
      payload: { prompt: clean, analysis },
    },
    { onConflict: "session_id,participant_id,activity,item_key" },
  );

  return ok({ analysis });
}
