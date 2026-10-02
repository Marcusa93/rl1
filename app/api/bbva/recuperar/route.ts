import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { getParticipantId } from "@/lib/participant";
import { BBVA_SLUG } from "@/lib/bbva-clase";

// Laboratorio BBVA: "el sistema se acuerda de vos". Quien entra (otro día, otro
// celular) y escribe el mismo nombre y apellido recupera lo que respondió antes:
// se copian a su participante actual las respuestas de los participantes anteriores
// con ese nombre (sin pisar nada de lo que ya respondió en este dispositivo).
//   POST { nombre }  (con la cookie del participante)  → { recuperadas }

const normalizar = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-zñ ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function POST(req: Request) {
  const session = await getSession(BBVA_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  const pid = await getParticipantId();
  if (!pid) return fail("Unite a la clase primero", 401);
  const body = await req.json().catch(() => ({}));
  const nombre = normalizar(String(body.nombre ?? ""));
  if (nombre.length < 5 || !nombre.includes(" ")) return ok({ recuperadas: 0 });

  const db = getAdmin();
  const { data: perfiles, error: e1 } = await db
    .from("responses")
    .select("participant_id, payload")
    .eq("session_id", session.id)
    .eq("activity", "perfil")
    .eq("item_key", "nombre")
    .limit(2000);
  if (e1) return fail(e1.message, 503);

  const otros = (perfiles ?? [])
    .filter((r) => r.participant_id !== pid && normalizar(String((r.payload as { v?: unknown })?.v ?? "")) === nombre)
    .map((r) => r.participant_id as string);
  if (!otros.length) return ok({ recuperadas: 0 });

  const [{ data: previas, error: e2 }, { data: mias, error: e3 }] = await Promise.all([
    db
      .from("responses")
      .select("participant_id, activity, item_key, payload")
      .eq("session_id", session.id)
      .in("participant_id", otros)
      .neq("activity", "perfil")
      .limit(5000),
    db.from("responses").select("activity, item_key").eq("session_id", session.id).eq("participant_id", pid).limit(2000),
  ]);
  if (e2 || e3) return fail((e2 ?? e3)!.message, 503);

  const tengo = new Set((mias ?? []).map((r) => `${r.activity}|${r.item_key}`));
  // Si hay varias versiones (varios dispositivos), queda una cualquiera de ellas.
  const porClave = new Map<string, { activity: string; item_key: string; payload: unknown }>();
  for (const r of previas ?? []) {
    const k = `${r.activity}|${r.item_key}`;
    if (!tengo.has(k)) porClave.set(k, { activity: r.activity as string, item_key: r.item_key as string, payload: r.payload });
  }
  const filas = [...porClave.values()].map((r) => ({ session_id: session.id, participant_id: pid, ...r }));
  if (!filas.length) return ok({ recuperadas: 0 });

  const { error: e4 } = await db
    .from("responses")
    .upsert(filas, { onConflict: "session_id,participant_id,activity,item_key", ignoreDuplicates: true });
  if (e4) return fail(e4.message, 503);
  return ok({ recuperadas: filas.length });
}
