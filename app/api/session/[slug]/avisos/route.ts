import { fail, ok } from "@/lib/api";
import { filaAvisos } from "@/lib/avisos";
import { leerFila } from "@/lib/filas";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

// Avisos para todos los celulares (ver lib/avisos.ts). Solo con la cookie docente:
//   POST { id, abierto }  → abre o cierra un aviso (ej.: el box de expectativas)

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const id = String(body.id ?? "");
  if (!id || typeof body.abierto !== "boolean") return fail("Falta id o abierto");

  const fila = await leerFila(filaAvisos(slug), "avisos");
  const abiertos = new Set((fila.activity_config?.abiertos as string[] | undefined) ?? []);
  if (body.abierto) abiertos.add(id);
  else abiertos.delete(id);

  const { error } = await getAdmin()
    .from("sessions")
    .update({ activity_config: { abiertos: [...abiertos] } })
    .eq("id", fila.id);
  if (error) return fail(error.message, 500);
  return ok({ abiertos: [...abiertos] });
}
