import { fail, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { makeSlug } from "@/lib/code";
import { WORKSHOP_TITLE } from "@/lib/constants";

export async function POST(req: Request) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const body = await req.json().catch(() => ({}));
  const title = (body.title as string)?.trim() || WORKSHOP_TITLE;
  const db = getAdmin();

  // reintenta hasta conseguir slug único
  for (let i = 0; i < 5; i++) {
    const slug = makeSlug(5);
    const { data, error } = await db
      .from("sessions")
      .insert({ slug, title, current_activity: "lobby", status: "lobby" })
      .select("*")
      .single();
    if (!error && data) return ok({ session: data });
    if (error && !error.message.includes("duplicate")) return fail(error.message, 500);
  }
  return fail("No se pudo crear la sesión", 500);
}
