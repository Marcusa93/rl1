import { ok } from "@/lib/api";
import { isTeacher } from "@/lib/teacher";

export async function GET() {
  return ok({ teacher: await isTeacher() });
}
