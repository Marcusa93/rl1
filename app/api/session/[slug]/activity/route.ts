import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import type { ActivityKey } from "@/lib/types";

const VALID: ActivityKey[] = [
  "lobby",
  "diagnostico",
  "verdadero_falso",
  "cotio",
  "caso",
  "tarea",
];

export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const body = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};

  if (body.current_activity) {
    if (!VALID.includes(body.current_activity)) return fail("Actividad inválida");
    patch.current_activity = body.current_activity;
    patch.status = body.current_activity === "lobby" ? "lobby" : "live";
    // reinicia config al cambiar de actividad salvo que venga explícita
    patch.activity_config = body.activity_config ?? {};
  } else if (body.activity_config !== undefined) {
    patch.activity_config = body.activity_config;
  }
  if (body.status) patch.status = body.status;

  const db = getAdmin();
  const { data, error } = await db
    .from("sessions")
    .update(patch)
    .eq("id", session.id)
    .select("*")
    .single();
  if (error) return fail(error.message, 500);
  return ok({ session: data });
}
