import { fail, ok } from "@/lib/api";
import { teacherPassword } from "@/lib/teacher";

// Verifica la clave secreta (la misma del docente) para desbloquear la
// Instancia 2 (instrumentos). NO otorga privilegios de docente: solo
// responde si la clave es correcta. La habilitación se guarda en el estado
// del participante del lado del cliente.
export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  if (typeof password !== "string" || password !== teacherPassword()) {
    return fail("Clave incorrecta", 401);
  }
  return ok({ ok: true });
}
