import { fail, ok } from "@/lib/api";
import { sesionCong } from "@/lib/congreso-server";
import { getParticipantId, setParticipantCookie } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";

// Entrar sin registro ni nombre: una cookie identifica al celular para que
// cada persona vote una vez por pregunta (y pueda cambiar su respuesta).

export async function POST() {
  const session = await sesionCong();
  if (!session) return fail("Sesión no encontrada", 404);
  const db = getAdmin();

  const existente = await getParticipantId();
  if (existente) {
    const { data } = await db
      .from("participants")
      .select("id")
      .eq("id", existente)
      .eq("session_id", session.id)
      .maybeSingle();
    if (data) return ok({ participant: { id: data.id as string } });
  }

  const { data, error } = await db
    .from("participants")
    .insert({ session_id: session.id, name: "público" })
    .select("id")
    .single();
  if (error || !data) return fail(error?.message ?? "No se pudo entrar", 500);
  await setParticipantCookie(data.id as string);
  return ok({ participant: { id: data.id as string } });
}
