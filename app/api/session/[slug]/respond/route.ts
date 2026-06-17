import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";

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

  const db = getAdmin();
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
