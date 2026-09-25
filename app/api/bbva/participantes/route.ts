import { NextResponse } from "next/server";
import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { armarTarjeta, BBVA_SLUG, getArea, HIPOTESIS_ITEM } from "@/lib/bbva-clase";

// Asistentes del Laboratorio BBVA para la próxima clase (solo docente):
//   GET                → { participantes: [{ nombre, area, entro, candidato, hipotesis }] }
//   GET ?formato=csv   → el mismo listado en CSV (abre directo en Excel)
// El nombre se guarda como respuesta { activity: "perfil", item_key: "nombre" }.

export async function GET(req: Request) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const session = await getSession(BBVA_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);
  const db = getAdmin();

  const [{ data: gente, error: e1 }, { data: resp, error: e2 }] = await Promise.all([
    db.from("participants").select("id, name, created_at").eq("session_id", session.id).order("created_at").limit(1000),
    db
      .from("responses")
      .select("participant_id, activity, item_key, payload")
      .eq("session_id", session.id)
      .in("activity", ["perfil", "bbva_a5"])
      .limit(5000),
  ]);
  if (e1 || e2) return fail((e1 ?? e2)!.message, 503);

  const por = new Map<string, Record<string, string>>();
  for (const r of resp ?? []) {
    const v = (r.payload as { v?: unknown })?.v;
    if (typeof v !== "string") continue;
    const m = por.get(r.participant_id as string) ?? {};
    m[`${r.activity}.${r.item_key}`] = v;
    por.set(r.participant_id as string, m);
  }

  const participantes = (gente ?? []).map((p) => {
    const m = por.get(p.id as string) ?? {};
    const q = { q1: m["bbva_a5.q1"], q2: m["bbva_a5.q2"], q3: m["bbva_a5.q3"], q4: m["bbva_a5.q4"] };
    const completo = q.q1 && q.q2 && q.q3 && q.q4;
    const t = completo ? armarTarjeta(q) : null;
    return {
      nombre: m["perfil.nombre"] ?? "",
      area: getArea(p.name as string)?.label ?? (p.name as string),
      entro: new Date(p.created_at as string).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" }),
      candidato: t ? `${t.busca} ${t.hipotesis}` : "",
      hipotesis: m[`bbva_a5.${HIPOTESIS_ITEM}`] ?? "",
    };
  });

  if (new URL(req.url).searchParams.get("formato") === "csv") {
    const esc = (x: string) => `"${x.replace(/"/g, '""')}"`;
    const filas = [
      ["Nombre y apellido", "Área", "Ingresó", "Candidato (actividad 5)", "Hipótesis escrita"],
      ...participantes.map((p) => [p.nombre || "(sin nombre)", p.area, p.entro, p.candidato, p.hipotesis]),
    ];
    const csv = "﻿" + filas.map((f) => f.map(esc).join(";")).join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="laboratorio-ia-bbva-asistentes.csv"',
        "Cache-Control": "no-store",
      },
    });
  }
  return ok({ participantes });
}
