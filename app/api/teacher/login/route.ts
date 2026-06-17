import { fail, ok } from "@/lib/api";
import { setTeacherCookie, teacherPassword, clearTeacherCookie } from "@/lib/teacher";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (password !== teacherPassword()) return fail("Clave incorrecta", 401);
  await setTeacherCookie();
  return ok({ ok: true });
}

export async function DELETE() {
  await clearTeacherCookie();
  return ok({ ok: true });
}
