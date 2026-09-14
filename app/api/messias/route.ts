import { fail, getSession } from "@/lib/api";
import { buildMessiasSystem, messiasKey, messiasModel } from "@/lib/messias";
import type { ChatMessage } from "@/lib/openrouter";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { TAL_SLUG } from "@/lib/taller-clase";
import type { ConfigTaller } from "@/lib/taller-caso";

// MessIAs, el asistente del taller. Streaming de texto plano.
// Cada pregunta queda registrada en `responses` (activity "tal_messias"):
// sirve de límite por participante y le muestra al docente qué se preguntó.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_PREGUNTAS = 80;

export async function POST(req: Request) {
  const key = messiasKey();
  if (!key) return fail("MessIAs no está configurado (falta la clave)", 500);

  const session = await getSession(TAL_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  const pid = await getParticipantId();
  if (!pid) return fail("Ingrese a la clase primero", 401);

  const db = getAdmin();
  const { data: p } = await db.from("participants").select("id").eq("id", pid).eq("session_id", session.id).maybeSingle();
  if (!p) return fail("Vuelva a ingresar a la clase", 401);

  const body = await req.json().catch(() => ({}));
  const incoming = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
  const history = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!history.length || history[history.length - 1].role !== "user") return fail("Falta el mensaje");

  // Límite por participante + registro de la pregunta para el docente.
  const { count } = await db
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "tal_messias");
  if ((count ?? 0) >= MAX_PREGUNTAS) return fail("Se alcanzó el límite de preguntas de esta compu por hoy", 429);
  await db.from("responses").insert({
    session_id: session.id,
    participant_id: pid,
    activity: "tal_messias",
    item_key: crypto.randomUUID(),
    payload: { q: history[history.length - 1].content.slice(0, 500) },
  });

  const system = buildMessiasSystem((session.activity_config ?? {}) as ConfigTaller);

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "MessIAs · Taller RAC El Salvador",
    },
    body: JSON.stringify({
      model: messiasModel(),
      temperature: 0.5,
      max_tokens: 700,
      stream: true,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const t = await upstream.text().catch(() => "");
    return fail(`MessIAs no responde (${upstream.status}): ${t.slice(0, 160)}`, 502);
  }

  // SSE de OpenRouter → texto plano en streaming.
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
