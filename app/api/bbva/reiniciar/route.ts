import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { BBVA_SLUG, getActividadBbva, HIPOTESIS_ITEM } from "@/lib/bbva-clase";

// Reinicia UNA actividad del Laboratorio BBVA (botón "Reiniciar actividad" del deck):
// borra sus respuestas (las hipótesis escritas de la actividad 5 se conservan) y deja
// una marca en activity_config.reinicio para que cada celular o compu limpie lo suyo
// y vuelva a mostrar la actividad vacía.
//   POST { activity: "bbva_a1" … "bbva_a5" }   (solo con la cookie docente)

export async function POST(req: Request) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const session = await getSession(BBVA_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);

  const body = await req.json().catch(() => ({}));
  const activity = String(body.activity ?? "");
  if (!getActividadBbva(activity)) return fail("Actividad inválida");

  const db = getAdmin();
  const { error, count } = await db
    .from("responses")
    .delete({ count: "exact" })
    .eq("session_id", session.id)
    .eq("activity", activity)
    .neq("item_key", HIPOTESIS_ITEM);
  if (error) return fail(error.message, 503);

  const reinicio = { activity, t: Date.now() };
  const { error: errMarca } = await db
    .from("sessions")
    .update({ activity_config: { ...(session.activity_config ?? {}), reinicio } })
    .eq("id", session.id);
  if (errMarca) return fail(errMarca.message, 503);

  return ok({ ok: true, borradas: count ?? 0, reinicio });
}
