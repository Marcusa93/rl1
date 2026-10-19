import { fail, getSession } from "@/lib/api";
import { DG_SISTEMA, MATERIALES, PLANTILLA_TEXTO, SKILL_CHECKLIST_MD, SKILL_MD, textoMateriales, type Material } from "@/lib/doing-caso";
import { DG_SLUG } from "@/lib/doing-clase";
import { defaultModel, isOpenRouterConfigured } from "@/lib/openrouter";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

// IA de la clase de Doing Global (demostraciones del deck y laboratorio del celular).
//   POST { mensajes: [{ role, content }], materiales?: Material[], skill?: boolean } → texto en streaming
// Los materiales del caso se adjuntan acá, del lado del servidor, al primer mensaje
// del usuario: el celular solo dice cuáles. Con `skill`, la IA trabaja con la skill
// de acompañamiento documental instalada. Pueden usarla el docente (cookie) y los
// participantes de esta clase, con un tope de pedidos por persona.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const TOPE = 25;
const VENTANA = 10 * 60 * 1000;
const usos = new Map<string, number[]>();

function excedido(pid: string): boolean {
  const ahora = Date.now();
  const recientes = (usos.get(pid) ?? []).filter((t) => ahora - t < VENTANA);
  if (recientes.length >= TOPE) {
    usos.set(pid, recientes);
    return true;
  }
  recientes.push(ahora);
  usos.set(pid, recientes);
  return false;
}

const SKILL_INSTALADA = `\n\nTenés instalada esta skill. Aplicala cuando el pedido corresponda a su descripción y respetá sus condiciones para detenerte.\n\n=== SKILL.md ===\n${SKILL_MD}\n=== plantilla.md ===\n${PLANTILLA_TEXTO}\n=== checklist.md ===\n${SKILL_CHECKLIST_MD}`;

export async function POST(req: Request) {
  if (!isOpenRouterConfigured()) return fail("La IA no está disponible ahora. Usá los botones para abrir ChatGPT, Claude o Gemini.", 503);

  const docente = await isTeacher();
  if (!docente) {
    const pid = await getParticipantId();
    if (!pid) return fail("Entrá a la clase primero", 401);
    const session = await getSession(DG_SLUG);
    if (!session) return fail("Sesión no encontrada", 404);
    const { data: p } = await getAdmin().from("participants").select("id").eq("id", pid).eq("session_id", session.id).maybeSingle();
    if (!p) return fail("Volvé a entrar a la clase", 401);
    if (excedido(pid)) return fail("Hiciste muchos pedidos seguidos. Esperá unos minutos o abrí el pedido en ChatGPT, Claude o Gemini.", 429);
  }

  const body = await req.json().catch(() => ({}));
  const crudos: unknown[] = Array.isArray(body.mensajes) ? body.mensajes : [];
  const mensajes = crudos
    .filter((m): m is { role: "user" | "assistant"; content: string } => {
      const x = m as { role?: string; content?: unknown };
      return (x.role === "user" || x.role === "assistant") && typeof x.content === "string" && x.content.trim().length > 0;
    })
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 7000) }));
  if (!mensajes.length || mensajes[mensajes.length - 1].role !== "user") return fail("Falta el pedido");

  const materiales = (Array.isArray(body.materiales) ? body.materiales : []).filter((m: unknown): m is Material =>
    typeof m === "string" && m in MATERIALES,
  );
  if (materiales.length) {
    const primero = mensajes.findIndex((m) => m.role === "user");
    mensajes[primero] = { ...mensajes[primero], content: mensajes[primero].content + textoMateriales(materiales) };
  }
  const system = DG_SISTEMA + (body.skill ? SKILL_INSTALADA : "");

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "Doing Global · Redacción jurídica con IA",
    },
    body: JSON.stringify({
      model: process.env.DOING_MODEL || defaultModel(),
      temperature: 0.4,
      max_tokens: 1500,
      stream: true,
      messages: [{ role: "system", content: system }, ...mensajes],
    }),
  }).catch(() => null);

  if (!upstream?.ok || !upstream.body) {
    const t = upstream ? await upstream.text().catch(() => "") : "";
    console.error("doing/ia", upstream?.status, t.slice(0, 300));
    return fail("La IA no respondió. Probá de nuevo o abrí el pedido en otra herramienta.", 502);
  }

  // El SSE de OpenRouter se transforma en texto plano en streaming.
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
              const delta = JSON.parse(data)?.choices?.[0]?.delta?.content;
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
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", "X-Accel-Buffering": "no" },
  });
}
