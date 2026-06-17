import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const db = getAdmin();
  const { count } = await db
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id);

  return ok({ session, participants: count ?? 0 });
}
