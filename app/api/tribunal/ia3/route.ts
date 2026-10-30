// Chatbot didáctico de la tercera charla (análisis jurídico asistido).
//
// Trabaja SOLO con las piezas anonimizadas del expediente (lib/tribunal-clase3-docs.ts):
//   { modo: "demo" }                 → equipo docente: la variante en vivo de la Actividad 3 (D1–D3)
//   { modo: "cotio", tarea, salida, piezas } → participante: pedido armado por toques (asistente COTIO)
//   { modo: "pregunta", pregunta }   → participante: consulta breve sobre las piezas ya liberadas
// Instrucción de sistema del documento rector: no decide ni redacta resoluciones, cita documento y
// página, distingue alegado / consta / controvertido / pendiente y no inventa. Límite por persona.

import { fail, getSession, ok } from "@/lib/api";
import { filaAvisos } from "@/lib/avisos";
import { chat, isOpenRouterConfigured } from "@/lib/openrouter";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { armarPedidoCotio, avisoDoc, TF3_DOCS, TF3_PEDIDO_DEMO, TF3_SISTEMA, TF3_SLUG, type Tf3DocId } from "@/lib/tribunal-clase3";
import { TF3_TEXTOS } from "@/lib/tribunal-clase3-docs";

export const dynamic = "force-dynamic";

const modelo = () => process.env.TF3_MODEL || process.env.TF2_MODEL || "anthropic/claude-haiku-4.5";
const LIMITE = 12;
const VENTANA_MS = 30 * 60 * 1000;
const usos = new Map<string, number[]>();

function expediente(ids: Tf3DocId[]): string {
  return TF3_DOCS.filter((d) => ids.includes(d.id))
    .map((d) => `### ${d.id} · ${d.titulo} (${d.paginas} páginas)\n` + TF3_TEXTOS[d.id].map((p) => `[${d.id} p.${p.n}]\n${p.texto}`).join("\n\n"))
    .join("\n\n");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const modo = body.modo === "demo" ? "demo" : body.modo === "cotio" ? "cotio" : "pregunta";
  let ids: Tf3DocId[];
  let pedido: string;

  if (modo === "demo") {
    if (!(await isTeacher())) return fail("Solo el equipo docente", 401);
    ids = ["D1", "D2", "D3"];
    pedido = TF3_PEDIDO_DEMO;
  } else {
    const pid = await getParticipantId();
    if (!pid) return fail("Entrá a la clase desde el QR", 401);
    pedido = String(body.pregunta ?? "").trim();
    if (modo === "pregunta" && pedido.length < 6) return fail("Escribí una pregunta");
    if (pedido.length > 600) return fail("La pregunta es demasiado larga");
    const session = await getSession(TF3_SLUG);
    if (!session) return fail("Sesión no disponible", 503);
    const db = getAdmin();
    const [{ data: p }, { data: av }] = await Promise.all([
      db.from("participants").select("id").eq("id", pid).eq("session_id", session.id).maybeSingle(),
      db.from("sessions").select("activity_config").eq("slug", filaAvisos(TF3_SLUG)).maybeSingle(),
    ]);
    if (!p) return fail("Volvé a entrar a la clase desde el QR", 401);
    const abiertos = (av?.activity_config?.abiertos as string[] | undefined) ?? [];
    ids = TF3_DOCS.map((d) => d.id).filter((id) => abiertos.includes(avisoDoc(id)));
    if (!ids.length) return fail("Todavía no se liberó ninguna pieza del expediente", 409);
    if (modo === "cotio") {
      // Input: solo las piezas que eligió y que ya están liberadas.
      const elegidas = (Array.isArray(body.piezas) ? body.piezas : []).filter((x: string) => ids.includes(x as Tf3DocId)) as Tf3DocId[];
      const armado = armarPedidoCotio(String(body.tarea ?? ""), String(body.salida ?? ""), elegidas);
      if (!armado) return fail("Elegí una tarea, al menos una pieza y un formato");
      ids = elegidas;
      pedido = armado;
    }
    const ahora = Date.now();
    const recientes = (usos.get(pid) ?? []).filter((t) => ahora - t < VENTANA_MS);
    if (recientes.length >= LIMITE) return fail("Llegaste al límite de consultas de esta clase.", 429);
    usos.set(pid, [...recientes, ahora]);
  }

  if (!isOpenRouterConfigured()) return ok({ error: "El chatbot no está configurado", planB: true }, 503);
  try {
    const texto = await chat({
      model: modelo(),
      temperature: 0.2,
      maxTokens: modo === "pregunta" ? 700 : 1200,
      messages: [
        { role: "system", content: `${TF3_SISTEMA}\n\nPiezas disponibles (transcripción anonimizada; solo podés usar esto):\n\n${expediente(ids)}` },
        { role: "user", content: pedido },
      ],
    });
    return ok({ texto: texto.trim(), piezas: ids });
  } catch (e) {
    console.error("[tribunal/ia3]", (e as Error).message);
    return ok({ error: "El chatbot no responde en este momento", planB: true }, 503);
  }
}
