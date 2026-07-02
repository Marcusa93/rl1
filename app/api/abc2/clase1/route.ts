import { ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { ABC_ACTIVITY, ABC_ITEM, type AbcState } from "@/lib/abc";
import { profilesFromClase1 } from "@/lib/abc2";

// Devuelve los perfiles deduplicados de la Clase 1 (/abc) para que el
// Módulo 1 de la Clase 2 reconozca al participante por su nombre.
export async function GET() {
  const db = getAdmin();
  const { data: s } = await db.from("sessions").select("id").eq("slug", "abc").maybeSingle();
  if (!s) return ok({ profiles: [] });

  const { data: parts } = await db.from("participants").select("id,name").eq("session_id", s.id);
  const { data: rows } = await db
    .from("responses")
    .select("participant_id,payload")
    .eq("session_id", s.id)
    .eq("activity", ABC_ACTIVITY)
    .eq("item_key", ABC_ITEM);

  const profiles = profilesFromClase1(
    (parts ?? []) as { id: string; name: string }[],
    (rows ?? []) as { participant_id: string; payload: AbcState }[],
  );
  return ok({ profiles });
}
