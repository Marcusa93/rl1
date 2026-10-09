import { fail, ok } from "@/lib/api";
import { leerFila } from "@/lib/filas";
import { filaModeracion, type Moderacion } from "@/lib/moderacion";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

// Moderación de respuestas abiertas (ver lib/moderacion.ts). Solo con la cookie docente:
//   GET                                   → { moderacion }
//   POST { activity, valor, oculta }      → oculta o vuelve a mostrar una palabra/respuesta
//   POST { activity, proyectar }          → muestra u oculta las respuestas en la pantalla
//   POST { reiniciar: true }              → borra todo (al reiniciar la sesión después de ensayar)

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const fila = await leerFila(filaModeracion(slug), "moderación");
  return ok({ moderacion: (fila.activity_config?.moderacion as Moderacion | undefined) ?? {} });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const fila = await leerFila(filaModeracion(slug), "moderación");
  const moderacion: Moderacion = body.reiniciar
    ? {}
    : { ...((fila.activity_config?.moderacion as Moderacion | undefined) ?? {}) };

  if (!body.reiniciar) {
    const activity = String(body.activity ?? "");
    if (!activity) return fail("Falta activity");
    const actual = { ...(moderacion[activity] ?? {}) };
    if (typeof body.proyectar === "boolean") actual.proyectar = body.proyectar;
    if (typeof body.valor === "string" && typeof body.oculta === "boolean") {
      const ocultas = new Set(actual.ocultas ?? []);
      if (body.oculta) ocultas.add(body.valor);
      else ocultas.delete(body.valor);
      actual.ocultas = [...ocultas];
    }
    moderacion[activity] = actual;
  }

  const { error } = await getAdmin().from("sessions").update({ activity_config: { moderacion } }).eq("id", fila.id);
  if (error) return fail(error.message, 500);
  return ok({ moderacion });
}
