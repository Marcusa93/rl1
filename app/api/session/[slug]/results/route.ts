import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import type { CotioVar } from "@/lib/types";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await getSession(slug);
  if (!session) return fail("Sesión no encontrada", 404);

  const url = new URL(req.url);
  const activity = url.searchParams.get("activity") || session.current_activity;
  const db = getAdmin();

  const { count: participants } = await db
    .from("participants")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id);

  const { data: rows } = await db
    .from("responses")
    .select("*, participants(name)")
    .eq("session_id", session.id)
    .eq("activity", activity);

  const list = rows ?? [];
  let summary: Record<string, unknown> = { total: list.length };

  if (activity === "diagnostico") {
    const counts: Record<string, number> = {};
    for (const r of list) {
      const sel = (r.payload?.selected as string[]) ?? [];
      for (const id of sel) counts[id] = (counts[id] ?? 0) + 1;
    }
    summary = { total: list.length, counts };
  } else if (activity === "verdadero_falso") {
    const perIndex: Record<string, { true: number; false: number }> = {};
    for (const r of list) {
      const idx = String(r.item_key ?? r.payload?.index ?? "0");
      perIndex[idx] ??= { true: 0, false: 0 };
      if (r.payload?.answer === true) perIndex[idx].true++;
      else perIndex[idx].false++;
    }
    summary = { perIndex, total: list.length };
  } else if (activity === "cotio") {
    const vars: CotioVar[] = ["contexto", "objetivo", "tarea", "input", "output"];
    const sums: Record<string, number> = {};
    let overall = 0;
    let confidential = 0;
    let analyzed = 0;
    for (const r of list) {
      const a = r.payload?.analysis;
      if (!a) continue;
      analyzed++;
      overall += a.overall ?? 0;
      if (a.confidential?.found) confidential++;
      for (const s of a.scores ?? []) sums[s.var] = (sums[s.var] ?? 0) + (s.score ?? 0);
    }
    const avgByVar: Record<string, number> = {};
    for (const v of vars) avgByVar[v] = analyzed ? Math.round(sums[v] / analyzed) : 0;
    summary = {
      total: list.length,
      analyzed,
      avgOverall: analyzed ? Math.round(overall / analyzed) : 0,
      avgByVar,
      confidential,
    };
  } else if (activity === "demanda") {
    let naive = 0;
    let cotio = 0;
    for (const r of list) {
      if (r.payload?.naive_output) naive++;
      if (r.payload?.cotio_output) cotio++;
    }
    summary = { total: list.length, naive, cotio };
  } else if (activity === "tarea") {
    const casos = list
      .filter((r) => r.payload?.compromiso)
      .map((r) => ({
        name: r.participants?.name ?? "—",
        caso: r.payload?.caso ?? "",
        herramienta: r.payload?.herramienta ?? "",
      }));
    summary = { total: list.length, comprometidos: casos.length, casos };
  }

  return ok({
    activity,
    participants: participants ?? 0,
    responded: list.length,
    summary,
    config: session.activity_config ?? {},
  });
}
