import { fail, getSession, ok } from "@/lib/api";
import { getBloque } from "@/lib/comercial";
import { getW3Actividad } from "@/lib/web3-clase";
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
  // quiénes participaron en esta actividad (distinct, en orden de llegada)
  const responders: string[] = [];
  for (const r of list) {
    const n = r.participants?.name as string | undefined;
    if (n && !responders.includes(n)) responders.push(n);
  }
  let summary: Record<string, unknown> = { total: list.length };

  // --- Empresas e IA (/empresas) — aula grande: se agrega y se recorta ---
  if (activity === "emp_encuesta") {
    const byQuestion: Record<string, Record<string, number>> = {};
    for (const r of list) {
      const ans = (r.payload?.answers as Record<string, string | string[]>) ?? {};
      for (const [q, opt] of Object.entries(ans)) {
        byQuestion[q] ??= {};
        for (const o of Array.isArray(opt) ? opt : [opt]) byQuestion[q][o] = (byQuestion[q][o] ?? 0) + 1;
      }
    }
    return ok({ activity, participants: participants ?? 0, responded: responders.length, responders: [], summary: { total: list.length, byQuestion }, config: session.activity_config ?? {} });
  }
  if (activity === "emp_usos") {
    const counts: Record<string, number> = {};
    for (const r of list) for (const id of (r.payload?.selected as string[]) ?? []) counts[id] = (counts[id] ?? 0) + 1;
    return ok({ activity, participants: participants ?? 0, responded: responders.length, responders: [], summary: { total: list.length, counts }, config: session.activity_config ?? {} });
  }
  const bloque = getBloque(activity);
  if (bloque) {
    const base = { activity, participants: participants ?? 0, responded: responders.length, responders: [], config: session.activity_config ?? {} };
    if (bloque.kind === "chips") {
      const counts: Record<string, number> = {};
      for (const r of list) for (const id of (r.payload?.selected as string[]) ?? []) counts[id] = (counts[id] ?? 0) + 1;
      return ok({ ...base, summary: { total: list.length, counts } });
    }
    if (bloque.kind === "opciones") {
      const counts: Record<string, number> = {};
      for (const r of list) {
        const op = String(r.payload?.opcion ?? "");
        if (op) counts[op] = (counts[op] ?? 0) + 1;
      }
      const comentarios = list
        .filter((r) => String(r.payload?.comentario ?? "").trim())
        .slice(-40)
        .map((r) => ({
          name: (r.participants?.name as string) ?? "—",
          comentario: String(r.payload?.comentario ?? "").slice(0, 200),
        }));
      return ok({ ...base, summary: { total: list.length, counts, comentarios } });
    }
    // "texto" y "texto2": razonamiento abierto — solo las últimas respuestas,
    // para no mandar 200 textos en cada poll; el docente elige qué leer en voz alta.
    const respuestas = list
      .map((r) => {
        if (bloque.kind === "texto2") {
          const [c1, c2] = bloque.campos;
          const v1 = String(r.payload?.[c1.id] ?? "").trim();
          const v2 = String(r.payload?.[c2.id] ?? "").trim();
          return { name: (r.participants?.name as string) ?? "—", respuesta: v1 || v2 ? `${c1.label} ${v1 || "—"} · ${c2.label} ${v2 || "—"}` : "" };
        }
        return { name: (r.participants?.name as string) ?? "—", respuesta: String(r.payload?.respuesta ?? "").slice(0, 300) };
      })
      .filter((r) => r.respuesta.trim())
      .slice(-40);
    return ok({ ...base, summary: { total: list.length, respuestas } });
  }
  // --- Web3 (/web3) — agregación por tipo de actividad -------------------
  const w3 = getW3Actividad(activity);
  if (w3) {
    const base = { activity, participants: participants ?? 0, responded: responders.length, responders: [], config: session.activity_config ?? {} };
    if (w3.kind === "encuesta") {
      const byQuestion: Record<string, Record<string, number>> = {};
      for (const r of list) {
        const ans = (r.payload?.answers as Record<string, string>) ?? {};
        for (const [q, opt] of Object.entries(ans)) {
          byQuestion[q] ??= {};
          byQuestion[q][String(opt)] = (byQuestion[q][String(opt)] ?? 0) + 1;
        }
      }
      return ok({ ...base, summary: { total: list.length, byQuestion } });
    }
    if (w3.kind === "opciones") {
      const counts: Record<string, number> = {};
      for (const r of list) {
        const op = String(r.payload?.opcion ?? "");
        if (op) counts[op] = (counts[op] ?? 0) + 1;
      }
      return ok({ ...base, summary: { total: list.length, counts } });
    }
    if (w3.kind === "chips") {
      const counts: Record<string, number> = {};
      for (const r of list) for (const id of (r.payload?.selected as string[]) ?? []) counts[id] = (counts[id] ?? 0) + 1;
      return ok({ ...base, summary: { total: list.length, counts } });
    }
    if (w3.kind === "texto") {
      const respuestas = list
        .map((r) => ({ name: (r.participants?.name as string) ?? "—", respuesta: String(r.payload?.respuesta ?? "").slice(0, 300) }))
        .filter((r) => r.respuesta.trim())
        .slice(-40);
      return ok({ ...base, summary: { total: list.length, respuestas } });
    }
    // "palabra"
    const counts: Record<string, number> = {};
    for (const r of list) {
      const w = String(r.payload?.palabra ?? "").trim().toLowerCase();
      if (w) counts[w] = (counts[w] ?? 0) + 1;
    }
    const palabras = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([palabra, n]) => ({ palabra, n }));
    return ok({ ...base, summary: { total: list.length, palabras } });
  }

  if (activity === "emp_cierre") {
    const counts: Record<string, number> = {};
    for (const r of list) {
      const w = String(r.payload?.palabra ?? "").trim().toLowerCase();
      if (w) counts[w] = (counts[w] ?? 0) + 1;
    }
    const palabras = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 60)
      .map(([palabra, n]) => ({ palabra, n }));
    return ok({ activity, participants: participants ?? 0, responded: responders.length, responders: [], summary: { total: list.length, palabras }, config: session.activity_config ?? {} });
  }

  if (activity === "encuesta") {
    const byQuestion: Record<string, Record<string, number>> = {};
    for (const r of list) {
      const ans = (r.payload?.answers as Record<string, string | string[]>) ?? {};
      for (const [q, opt] of Object.entries(ans)) {
        byQuestion[q] ??= {};
        const opts = Array.isArray(opt) ? opt : [opt];
        for (const o of opts) byQuestion[q][o] = (byQuestion[q][o] ?? 0) + 1;
      }
    }
    summary = { total: list.length, byQuestion };
  } else if (activity === "diagnostico") {
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
    const vars: CotioVar[] = ["contexto", "objeto", "tarea", "input", "output"];
    const points: Record<string, number> = {};
    let analyzed = 0;
    for (const r of list) {
      const a = r.payload?.analysis;
      if (!a) continue;
      analyzed++;
      for (const s of a.scores ?? []) {
        const p = s.status === "presente" ? 100 : s.status === "incompleto" ? 50 : 0;
        points[s.var] = (points[s.var] ?? 0) + p;
      }
    }
    const avgByVar: Record<string, number> = {};
    let overall = 0;
    for (const v of vars) {
      avgByVar[v] = analyzed ? Math.round(points[v] / analyzed) : 0;
      overall += avgByVar[v];
    }
    summary = {
      total: list.length,
      analyzed,
      avgOverall: Math.round(overall / vars.length),
      avgByVar,
    };
  } else if (activity === "caso") {
    const drafts = list
      .filter((r) => r.payload?.output)
      .map((r) => ({
        name: r.participants?.name ?? "—",
        objeto: r.payload?.objeto ?? "",
        output: r.payload?.output ?? "",
      }));
    summary = { total: list.length, done: list.filter((r) => r.payload?.done).length, drafts };
  } else if (activity === "chat") {
    summary = { total: list.length, usando: list.length };
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
    responded: responders.length,
    responders,
    summary,
    config: session.activity_config ?? {},
  });
}
