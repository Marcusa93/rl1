import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { REACCION_ACTIVITY, REACCIONES } from "@/lib/clase-vivo";

// Emojis que los participantes mandan desde el celular y el deck muestra
// flotando. Se guardan en `responses` (activity "reaccion", item_key único),
// así el reinicio de la sesión los borra junto con todo lo demás.

/** POST { emoji } — un emoji de la lista permitida. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const pid = await getParticipantId();
  if (!pid) return fail("Unite a la clase primero", 401);

  const body = await req.json().catch(() => ({}));
  const emoji = String(body.emoji ?? "");
  if (!(REACCIONES as readonly string[]).includes(emoji)) return fail("Emoji inválido");

  const { error } = await getAdmin()
    .from("responses")
    .insert({
      session_id: session.id,
      participant_id: pid,
      activity: REACCION_ACTIVITY,
      item_key: crypto.randomUUID(),
      payload: { emoji },
    });
  // FK: la cookie apunta a un participante borrado (la clase se reinició)
  if (error) return fail("Volvé a unirte a la clase", 401);
  return ok({ ok: true });
}

/**
 * GET ?desde=<cursor> — reacciones posteriores al cursor. Sin cursor devuelve
 * solo el cursor actual, para que el deck no reproduzca las viejas al abrir.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const desde = new URL(req.url).searchParams.get("desde");
  const db = getAdmin();

  if (!desde) {
    const { data } = await db
      .from("responses")
      .select("created_at")
      .eq("session_id", session.id)
      .eq("activity", REACCION_ACTIVITY)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return ok({ cursor: data?.created_at ?? new Date().toISOString(), items: [] });
  }

  const { data, error } = await db
    .from("responses")
    .select("id, payload, created_at")
    .eq("session_id", session.id)
    .eq("activity", REACCION_ACTIVITY)
    .gt("created_at", desde)
    .order("created_at", { ascending: true })
    .limit(80);
  if (error) return fail(error.message, 500);

  const items = (data ?? []).map((r) => ({ id: r.id as string, emoji: String(r.payload?.emoji ?? "") }));
  const cursor = data?.length ? (data[data.length - 1].created_at as string) : desde;
  return ok({ cursor, items });
}
