import { fail, getSession } from "@/lib/api";
import { messiasKey, messiasModel } from "@/lib/messias";
import type { ChatMessage } from "@/lib/openrouter";
import { buildParteSystem, type ParteId } from "@/lib/partes";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { TAL_SLUG } from "@/lib/taller-clase";

// La sala de entrevistas: Lucía o Diego responden en personaje (streaming).
// Tope de preguntas por participante entre AMBAS partes (activity tal_parte),
// y cada pregunta queda registrada para el docente.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_PREGUNTAS = 30;

export async function POST(req: Request) {
  const key = messiasKey();
  if (!key) return fail("La sala de entrevistas no está configurada", 500);

  const session = await getSession(TAL_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  const pid = await getParticipantId();
  if (!pid) return fail("Ingrese a la clase primero", 401);

  const db = getAdmin();
  const { data: p } = await db.from("participants").select("id").eq("id", pid).eq("session_id", session.id).maybeSingle();
  if (!p) return fail("Vuelva a ingresar a la clase", 401);

  const body = await req.json().catch(() => ({}));
  const parte = body.parte as ParteId;
  if (parte !== "lucia" && parte !== "diego") return fail("Falta la parte");
  const incoming = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
  const history = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 1500) }));
  if (!history.length || history[history.length - 1].role !== "user") return fail("Falta la pregunta");

  const { count } = await db
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "tal_parte");
  if ((count ?? 0) >= MAX_PREGUNTAS) {
    return fail("Se terminaron las preguntas de esta compu: las entrevistas reales también tienen fin. Sigan con lo anotado.", 429);
  }
  await db.from("responses").insert({
    session_id: session.id,
    participant_id: pid,
    activity: "tal_parte",
    item_key: crypto.randomUUID(),
    payload: { parte, q: history[history.length - 1].content.slice(0, 400) },
  });

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "Sala de entrevistas · Taller RAC El Salvador",
    },
    body: JSON.stringify({
      model: messiasModel(),
      temperature: 0.8,
      max_tokens: 300,
      stream: true,
      messages: [{ role: "system", content: buildParteSystem(parte) }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const t = await upstream.text().catch(() => "");
    return fail(`La parte no responde (${upstream.status}): ${t.slice(0, 160)}`, 502);
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data:")) continue;
            const data = t.slice(5).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const delta = json?.choices?.[0]?.delta?.content;
              if (typeof delta === "string" && delta) controller.enqueue(encoder.encode(delta));
            } catch {
              /* línea SSE incompleta */
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
