import { fail, getSession, ok } from "@/lib/api";
import { filaEstado, type EstadoRemoto, type PlacaVivo } from "@/lib/remoto";
import { getAdmin } from "@/lib/supabase/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const db = getAdmin();
  const [{ data: rows, count }, { data: fila }] = await Promise.all([
    db
      .from("participants")
      .select("name", { count: "exact" })
      .eq("session_id", session.id)
      .order("created_at", { ascending: true })
      .limit(60),
    // placa que proyecta el deck, para que los celulares la sigan (sin la nota del docente)
    db.from("sessions").select("activity_config").eq("slug", filaEstado(slug)).maybeSingle(),
  ]);

  const estado = fila?.activity_config?.estado as EstadoRemoto | undefined;
  const placa: PlacaVivo | null = estado
    ? { idx: estado.idx, abiertas: (estado.botones ?? []).filter((b) => b.activo).map((b) => b.label) }
    : null;

  const names = (rows ?? []).map((r) => r.name as string);
  return ok({ session, participants: count ?? names.length, names, placa });
}
