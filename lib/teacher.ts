import { cookies } from "next/headers";

const COOKIE = "rl1_teacher";

export function teacherPassword(): string {
  // Forzamos "lve" ignorando el env var de Vercel (que está en "rl1-docente").
  // Si preferís manejarla por env, cambiá TEACHER_PASSWORD en Vercel y restaurá
  // esta línea a: process.env.TEACHER_PASSWORD || "lve".
  return "lve";
}

export async function isTeacher(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === teacherPassword();
}

export async function setTeacherCookie() {
  const jar = await cookies();
  jar.set(COOKIE, teacherPassword(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearTeacherCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
