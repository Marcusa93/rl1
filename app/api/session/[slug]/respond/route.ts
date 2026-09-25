import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { BBVA_SLUG, HIPOTESIS_ITEM } from "@/lib/bbva-clase";

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
  const activity = body.activity as string;
  if (!activity) return fail("Falta activity");
  const item_key = String(body.item_key ?? "");
  const payload = body.payload ?? {};

  // Laboratorio BBVA: una actividad se responde solo mientras su placa está proyectada
  // (la presentación pone "lobby" en el resto). La hipótesis de la actividad 5 es personal:
  // se puede terminar de escribir y guardar después.
  if (
    slug === BBVA_SLUG &&
    activity.startsWith("bbva_") &&
    activity !== session.current_activity &&
    item_key !== HIPOTESIS_ITEM
  )
    return fail("Esta actividad ya está cerrada", 409);

  // Respuesta tocada antes de un "Reiniciar actividad" que ese celular todavía no vio:
  // no puede revivir lo que se acaba de borrar. (Las apps viejas no mandan la marca.)
  const reinicio = (session.activity_config as { reinicio?: { activity?: string; t?: number } } | null)?.reinicio;
  if (
    slug === BBVA_SLUG &&
    body.reinicio !== undefined &&
    reinicio?.activity === activity &&
    item_key !== HIPOTESIS_ITEM &&
    body.reinicio !== reinicio.t
  )
    return fail("La actividad se reinició", 409);

  const db = getAdmin();

  // la cookie puede apuntar a un participante borrado (ej. tras reiniciar la clase)
  const { data: p, error: errP } = await db
    .from("participants")
    .select("id")
    .eq("id", pid)
    .eq("session_id", session.id)
    .maybeSingle();
  // Si la base no respondió no es "no existe": 503 para que el celular reintente sin echar a nadie.
  if (errP) return fail(errP.message, 503);
  if (!p) return fail("Volvé a unirte a la clase", 401);
  const { data, error } = await db
    .from("responses")
    .upsert(
      { session_id: session.id, participant_id: pid, activity, item_key, payload },
      { onConflict: "session_id,participant_id,activity,item_key" },
    )
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  return ok({ response: data });
}
