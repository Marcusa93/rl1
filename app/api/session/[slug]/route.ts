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
  const { data: rows, count } = await db
    .from("participants")
    .select("name", { count: "exact" })
    .eq("session_id", session.id)
    .order("created_at", { ascending: true })
    .limit(60);

  const names = (rows ?? []).map((r) => r.name as string);
  return ok({ session, participants: count ?? names.length, names });
}
