import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pid = await getParticipantId();
  if (!pid) return ok({ name: null, responses: [] });
  // Un error de la base NO es "no estás en la clase" (el celular te mandaría al ingreso)
  // ni "no tenés respuestas" (se vaciaría la pantalla): 503 y el celular conserva lo suyo.
  const session = await getSession(slug);
  if (!session) return fail("Sesión no disponible", 503);

  const db = getAdmin();
  const { data: p, error: errP } = await db
    .from("participants")
    .select("name")
    .eq("id", pid)
    .eq("session_id", session.id)
    .maybeSingle();
  if (errP) return fail(errP.message, 503);
  if (!p) return ok({ name: null, responses: [] });

  const { data, error } = await db
    .from("responses")
    .select("activity, item_key, payload")
    .eq("session_id", session.id)
    .eq("participant_id", pid);
  if (error) return fail(error.message, 503);

  return ok({ name: p.name, responses: data ?? [] });
}
