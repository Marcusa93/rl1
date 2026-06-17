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
  if (!session || !pid) return ok({ name: null, responses: [] });

  const db = getAdmin();
  const { data: p } = await db
    .from("participants")
    .select("name")
    .eq("id", pid)
    .eq("session_id", session.id)
    .maybeSingle();
  if (!p) return ok({ name: null, responses: [] });

  const { data } = await db
    .from("responses")
    .select("activity, item_key, payload")
    .eq("session_id", session.id)
    .eq("participant_id", pid);

  return ok({ name: p.name, responses: data ?? [] });
}
