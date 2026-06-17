import { getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  const pid = await getParticipantId();
  if (!session || !pid) return ok({ participant: null });

  const db = getAdmin();
  const { data } = await db
    .from("participants")
    .select("*")
    .eq("id", pid)
    .eq("session_id", session.id)
    .maybeSingle();
  return ok({ participant: data ?? null });
}
