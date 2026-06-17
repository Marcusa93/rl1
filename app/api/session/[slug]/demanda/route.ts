import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { chat, chatJSON, isOpenRouterConfigured } from "@/lib/openrouter";
import type { CotioVar } from "@/lib/types";

const GEN_SYSTEM = `Sos un asistente jurídico para abogados en Argentina. Redactás en español jurídico,
claro y formal. Regla crítica: NO inventes citas, fallos ni artículos. Si una norma o cita es necesaria,
escribí "[verificar normativa aplicable]" en vez de inventarla. Producí solo el escrito solicitado.`;

const COTIO_ORDER: CotioVar[] = ["contexto", "objetivo", "tarea", "input", "output"];

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

  const body = await req.json().catch(() => ({}));
  const mode = body.mode as "naive" | "cotio";
  const db = getAdmin();

  // payload existente para mergear
  const { data: existing } = await db
    .from("responses")
    .select("payload")
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "demanda")
    .eq("item_key", "")
    .maybeSingle();
  const payload: Record<string, unknown> = { ...(existing?.payload ?? {}) };

  try {
    if (mode === "naive") {
      const prompt = (body.naive_prompt as string)?.trim();
      if (!prompt) return fail("Escribí el prompt sin método");
      const out = await chat({
        messages: [
          { role: "system", content: GEN_SYSTEM },
          { role: "user", content: prompt.slice(0, 4000) },
        ],
        temperature: 0.5,
        maxTokens: 1300,
      });
      payload.naive_prompt = prompt;
      payload.naive_output = out;
    } else if (mode === "cotio") {
      const fields = (body.cotio ?? {}) as Record<CotioVar, string>;
      const built = COTIO_ORDER.map(
        (k) => `[${k.toUpperCase()}] ${(fields[k] ?? "").trim()}`,
      ).join("\n");
      if (built.replace(/\[[A-Z]+\]/g, "").trim().length < 10)
        return fail("Completá las variables de COTIO");

      const out = await chat({
        messages: [
          { role: "system", content: GEN_SYSTEM },
          { role: "user", content: built.slice(0, 4000) },
        ],
        temperature: 0.4,
        maxTokens: 1500,
      });

      // cerrar el círculo con la alucinación: qué verificar antes de presentar
      let verification: string[] = [];
      try {
        const v = await chatJSON<{ items: string[] }>({
          messages: [
            {
              role: "system",
              content:
                "Devolvés JSON {\"items\": string[]} con los puntos que un abogado DEBE verificar antes de presentar este escrito (citas normativas, jurisprudencia, datos, plazos, montos). Máx 6 ítems, en español.",
            },
            { role: "user", content: out.slice(0, 4000) },
          ],
          temperature: 0.2,
          maxTokens: 500,
        });
        verification = v.items?.slice(0, 6) ?? [];
      } catch {
        verification = ["Verificá toda cita normativa y de jurisprudencia.", "Confirmá datos, plazos y montos."];
      }

      payload.cotio = fields;
      payload.cotio_output = out;
      payload.verification = verification;
    } else {
      return fail("Modo inválido");
    }
  } catch (e) {
    return fail(`Error de generación: ${(e as Error).message}`, 502);
  }

  await db.from("responses").upsert(
    { session_id: session.id, participant_id: pid, activity: "demanda", item_key: "", payload },
    { onConflict: "session_id,participant_id,activity,item_key" },
  );

  return ok({ payload });
}
