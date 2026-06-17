import { fail, getSession } from "@/lib/api";
import { getParticipantId } from "@/lib/participant";
import { defaultModel, isOpenRouterConfigured } from "@/lib/openrouter";
import type { ChatMessage } from "@/lib/openrouter";

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

const DEFAULT_SYSTEM = `Sos un asistente de IA para abogados en ejercicio, dentro de un taller de formación.
Respondés en español rioplatense, tono profesional y directo, de igual a igual. Sos útil para redactar
borradores, resumir, organizar ideas y explicar. Regla: NO inventes citas, fallos ni artículos; si una
norma o cita es necesaria, escribí "[verificar]" en vez de inventarla.`;

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
  const incoming = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
  const system = typeof body.system === "string" && body.system.trim() ? body.system : DEFAULT_SYSTEM;

  // sanea y limita el historial
  const history = incoming
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 6000) }));

  if (!history.length || history[history.length - 1].role !== "user")
    return fail("Falta el mensaje del usuario");

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "RL1 Taller IA Abogacía",
    },
    body: JSON.stringify({
      model: defaultModel(),
      temperature: body.temperature ?? 0.5,
      max_tokens: body.maxTokens ?? 1600,
      stream: true,
      messages: [{ role: "system", content: system }, ...history],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const t = await upstream.text().catch(() => "");
    return fail(`OpenRouter ${upstream.status}: ${t.slice(0, 200)}`, 502);
  }

  // Transforma el SSE de OpenRouter en texto plano en streaming.
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
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // línea parcial: se ignora
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
