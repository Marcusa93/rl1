import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const body = await req.json().catch(() => ({}));
  const db = getAdmin();

  // Reinicio total: vacía participantes (respuestas en cascada) y vuelve a lobby.
  if (body.all) {
    await db.from("participants").delete().eq("session_id", session.id);
    await db
      .from("sessions")
      .update({ current_activity: "lobby", status: "lobby", activity_config: {} })
      .eq("id", session.id);
    return ok({ ok: true, all: true });
  }

  let q = db.from("responses").delete().eq("session_id", session.id);
  if (body.activity) q = q.eq("activity", body.activity);
  const { error } = await q;
  if (error) return fail(error.message, 500);
  return ok({ ok: true });
}
