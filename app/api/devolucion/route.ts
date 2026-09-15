import { fail, getSession, ok } from "@/lib/api";
import { messiasKey, messiasModel } from "@/lib/messias";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { TAL_SLUG } from "@/lib/taller-clase";

// La devolución del mediador senior: MessIAs lee el acta entregada y devuelve
// cinco líneas personales. Tope de 3 por participante; si algo falla, el
// cliente ya entregó el acta y ofrece el paracaídas (P11 en su Gem).

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MAX_DEVOLUCIONES = 3;

const SISTEMA = `Sos un mediador formador senior en un taller de mediación con IA (caso ficticio Café Nube c/ TecnoFrío, El Salvador). Te paso el acta de acuerdo redactada por un participante. Devolvé EXACTAMENTE esta estructura, en texto plano, sin Markdown, máximo 120 palabras, trato de usted, tono cálido y exigente:

1. Lo más fuerte: (una línea sobre lo mejor del acta)
2. La cláusula más floja: (cuál y por qué, dos líneas; mirá especialmente espacios sin completar, fechas u horas vagas, responsables sin nombre)
3. Un interés sin resolver: (una línea; recordá: Lucía necesita garantía por escrito y abrir el viernes; Diego, cuidar su nombre y el mantenimiento)
4. Para pensar: (una pregunta incisiva de una línea)

Si el acta viene casi vacía, decilo con humor suave y sugerí por dónde empezar. No inventes cláusulas que no estén.`;

export async function POST(req: Request) {
  const key = messiasKey();
  if (!key) return fail("Sin clave", 500);

  const session = await getSession(TAL_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  const pid = await getParticipantId();
  if (!pid) return fail("Ingrese a la clase primero", 401);

  const db = getAdmin();
  const { data: p } = await db.from("participants").select("id").eq("id", pid).eq("session_id", session.id).maybeSingle();
  if (!p) return fail("Vuelva a ingresar a la clase", 401);

  const { count } = await db
    .from("responses")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "tal_devolucion");
  if ((count ?? 0) >= MAX_DEVOLUCIONES) return fail("Ya usó sus devoluciones: la última palabra es suya (o de su Gem, con P11)", 429);

  const body = await req.json().catch(() => ({}));
  const texto = String(body.texto ?? "").slice(0, 12000);
  if (texto.length < 100) return fail("El acta llegó vacía");

  await db.from("responses").insert({
    session_id: session.id,
    participant_id: pid,
    activity: "tal_devolucion",
    item_key: crypto.randomUUID(),
    payload: { chars: texto.length },
  });

  const upstream = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "Devolución del acta · Taller RAC El Salvador",
    },
    body: JSON.stringify({
      model: messiasModel(),
      temperature: 0.5,
      max_tokens: 350,
      messages: [
        { role: "system", content: SISTEMA },
        { role: "user", content: texto },
      ],
    }),
  });
  if (!upstream.ok) {
    const t = await upstream.text().catch(() => "");
    return fail(`Sin devolución (${upstream.status}): ${t.slice(0, 120)}`, 502);
  }
  const data = await upstream.json().catch(() => null);
  const salida = data?.choices?.[0]?.message?.content;
  if (typeof salida !== "string" || !salida.trim()) return fail("Sin devolución", 502);
  return ok({ texto: salida.trim() });
}
