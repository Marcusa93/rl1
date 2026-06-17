import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId, setParticipantCookie } from "@/lib/participant";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const { name } = await req.json().catch(() => ({ name: "" }));
  const clean = (name as string)?.trim();
  if (!clean || clean.length < 2) return fail("Ingresá tu nombre");

  const db = getAdmin();

  // ¿ya tiene cookie y existe en esta sesión? reusar
  const existing = await getParticipantId();
  if (existing) {
    const { data } = await db
      .from("participants")
      .select("*")
      .eq("id", existing)
      .eq("session_id", session.id)
      .maybeSingle();
    if (data) return ok({ participant: data });
  }

  const { data, error } = await db
    .from("participants")
    .insert({ session_id: session.id, name: clean.slice(0, 40) })
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  await setParticipantCookie(data.id);
  return ok({ participant: data });
}
