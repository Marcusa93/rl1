import { fail, ok } from "@/lib/api";
import { sesionCong, versionPublicada } from "@/lib/congreso-server";
import { CONG_SLUG, type EstadoCong } from "@/lib/congreso";
import { filaEstado, type EstadoRemoto } from "@/lib/remoto";
import { getAdmin } from "@/lib/supabase/server";

// Lo que consultan los celulares (y la sala de control) cada pocos segundos:
// qué interacción está abierta, qué placa se proyecta, cuántos hay conectados
// y qué versión de la app está publicada (si cambia, el celular se actualiza).

export async function GET() {
  const session = await sesionCong();
  if (!session) return fail("Sesión no encontrada", 404);
  const db = getAdmin();
  const [{ count }, { data: fila }] = await Promise.all([
    db.from("participants").select("id", { count: "exact", head: true }).eq("session_id", session.id),
    db.from("sessions").select("activity_config").eq("slug", filaEstado(CONG_SLUG)).maybeSingle(),
  ]);
  const estado = fila?.activity_config?.estado as EstadoRemoto | undefined;
  const out: EstadoCong = {
    actividad: session.current_activity,
    config: (session.activity_config ?? {}) as Record<string, unknown>,
    placa: typeof estado?.idx === "number" ? estado.idx : null,
    conectados: count ?? 0,
    ...versionPublicada(),
  };
  return ok(out);
}
