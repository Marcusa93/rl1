import { cookies } from "next/headers";

const COOKIE = "rl1_teacher";

export function teacherPassword(): string {
  return process.env.TEACHER_PASSWORD || "lve";
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
