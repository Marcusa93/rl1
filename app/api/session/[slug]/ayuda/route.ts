// Pedidos de ayuda del taller: cada computadora toca la campana y el docente
// los ve en su celular (/control) con el nombre, para acercarse a esa mesa.
//
// La computadora escribe por /respond (activity "tal_ayuda"); acá vive lo que
// solo puede hacer el docente: ver la lista con nombres y marcar "atendido".

import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";

export const dynamic = "force-dynamic";

/** Un pedido se considera vencido si nadie lo tocó en media hora (compu que se fue). */
const VENCE_MS = 30 * 60 * 1000;

/** El join de Supabase puede venir como objeto o como lista de un elemento. */
function nombreDe(p: unknown): string {
  const fila = Array.isArray(p) ? p[0] : p;
  const n = (fila as { name?: string } | null | undefined)?.name;
  return n && n.trim() ? n : "—";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await isTeacher())) return fail("Solo el docente", 401);
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const db = getAdmin();
  const { data } = await db
    .from("responses")
    .select(
      "participant_id, payload, created_at, updated_at, participants(name)",
    )
    .eq("session_id", session.id)
    .eq("activity", "tal_ayuda");

  const ahora = Date.now();
  const pedidos = (data ?? [])
    .filter((r) => r.payload?.pidiendo)
    .map((r) => ({
      participant_id: r.participant_id as string,
      name: nombreDe(r.participants),
      etapa: Number(r.payload?.etapa ?? 0),
      paso: String(r.payload?.paso ?? ""),
      desde: new Date(String(r.updated_at ?? r.created_at)).getTime(),
    }))
    .filter((p) => ahora - p.desde < VENCE_MS)
    .sort((a, b) => a.desde - b.desde);

  return ok({ pedidos });
}

/** El docente marca que ya fue a esa mesa: baja la mano en esa computadora. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  if (!(await isTeacher())) return fail("Solo el docente", 401);
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const body = await req.json().catch(() => ({}));
  const pid = String(body.participant_id ?? "");
  if (!pid) return fail("Falta participant_id");

  const db = getAdmin();
  const { data: fila } = await db
    .from("responses")
    .select("payload")
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "tal_ayuda")
    .maybeSingle();

  const { error } = await db
    .from("responses")
    .update({
      payload: {
        ...(fila?.payload ?? {}),
        pidiendo: false,
        atendido: Date.now(),
      },
    })
    .eq("session_id", session.id)
    .eq("participant_id", pid)
    .eq("activity", "tal_ayuda");
  if (error) return fail(error.message, 500);
  return ok({ atendido: true });
}
