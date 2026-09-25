import { ok } from "@/lib/api";
import { isTeacher, setTeacherCookie } from "@/lib/teacher";

export async function GET() {
  const teacher = await isTeacher();
  // Renueva las 12 h al abrir una pantalla docente: si la clave se puso de madrugada,
  // no vence en medio de la clase (las activaciones y el control remoto darían 401).
  if (teacher) await setTeacherCookie();
  return ok({ teacher });
}
