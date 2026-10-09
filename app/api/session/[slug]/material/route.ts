import { fail, getSession, ok } from "@/lib/api";
import { leerFila } from "@/lib/filas";
import { filaModeracion, type Moderacion } from "@/lib/moderacion";
import { resumenVivo } from "@/lib/resumen-vivo";
import { getAdmin } from "@/lib/supabase/server";
import { claseTf } from "@/lib/tribunal-clases";

// Material descargable de una clase del Tribunal Fiscal: los resultados
// agregados de todas sus actividades, para cualquiera (sin clave).
// Las respuestas abiertas salen solo si el equipo las revisó (las proyectó)
// y sin lo que ocultó; nunca con nombres.

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const clase = claseTf(slug);
  if (!clase) return fail("Clase no encontrada", 404);
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const db = getAdmin();
  const keys = clase.actividades.map((a) => a.key as string);
  const [{ count }, { data: rows, error }, fila] = await Promise.all([
    db.from("participants").select("id", { count: "exact", head: true }).eq("session_id", session.id),
    db.from("responses").select("activity, participant_id, payload").eq("session_id", session.id).in("activity", keys),
    leerFila(filaModeracion(slug), "moderación"),
  ]);
  if (error) return fail(error.message, 500);
  const moderacion = (fila.activity_config?.moderacion as Moderacion | undefined) ?? {};

  const actividades = clase.actividades.map((act) => {
    const list = (rows ?? []).filter((r) => r.activity === act.key);
    const respondieron = new Set(list.map((r) => r.participant_id)).size;
    const mod = moderacion[act.key];
    if (act.moderada && !mod?.revisada) return { key: act.key, respondieron, pendiente: true };
    const ocultas = new Set(mod?.ocultas ?? []);
    const summary = resumenVivo(act.kind, list);
    if (Array.isArray(summary.palabras))
      summary.palabras = (summary.palabras as { palabra: string }[]).filter((p) => !ocultas.has(p.palabra));
    if (Array.isArray(summary.respuestas))
      summary.respuestas = (summary.respuestas as { respuesta: string }[])
        .filter((r) => !ocultas.has(r.respuesta))
        .map((r) => ({ respuesta: r.respuesta }));
    return { key: act.key, respondieron, summary };
  });

  return ok({ participantes: count ?? 0, actividades, generado: new Date().toISOString() });
}
