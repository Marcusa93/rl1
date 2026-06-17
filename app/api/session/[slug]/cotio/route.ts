import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { chatJSON, isOpenRouterConfigured } from "@/lib/openrouter";
import type { CotioAnalysis } from "@/lib/types";

const SYSTEM = `Sos un optimizador de prompts para abogados, basado en el método COTIO
(Contexto, Objetivo, Tarea, Input, Output). Analizás el prompt del usuario variable por variable.

Devolvés EXCLUSIVAMENTE un JSON con esta forma exacta:
{
  "scores": [
    {"var":"contexto","present":bool,"score":0-100,"feedback":"texto breve y accionable en español"},
    {"var":"objetivo","present":bool,"score":0-100,"feedback":"..."},
    {"var":"tarea","present":bool,"score":0-100,"feedback":"..."},
    {"var":"input","present":bool,"score":0-100,"feedback":"..."},
    {"var":"output","present":bool,"score":0-100,"feedback":"..."}
  ],
  "overall": 0-100,
  "confidential": {"found": bool, "note": "si detectás datos personales reales (nombres, DNI, CUIT, expedientes, direcciones), advertí sobre confidencialidad; si no, deja una nota breve recordando no cargar datos sensibles"},
  "improved_prompt": "una reescritura del prompt aplicando COTIO, lista para usar"
}

Reglas: feedback concreto y corto (máx 2 frases). Penalizá la ausencia de variables. No agregues texto fuera del JSON.`;

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
