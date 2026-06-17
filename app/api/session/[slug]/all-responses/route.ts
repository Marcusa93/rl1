import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const db = getAdmin();
  const { data } = await db
    .from("responses")
    .select("activity, item_key, payload, created_at, participants(name)")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  const rows = ((data ?? []) as unknown as Array<{
    activity: string;
    item_key: string;
    payload: unknown;
    created_at: string;
    participants?: { name?: string } | { name?: string }[] | null;
  }>).map((r) => {
    const part = Array.isArray(r.participants) ? r.participants[0] : r.participants;
    return {
      name: part?.name ?? "—",
      activity: r.activity,
      item_key: r.item_key,
      payload: r.payload,
      created_at: r.created_at,
    };
  });

  return ok({ rows });
}
