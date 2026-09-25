import { fail, getSession, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { BBVA_SLUG, HIPOTESIS_ITEM, type Conteo, type ResultadosBbva } from "@/lib/bbva-clase";

// Resultados agregados del Laboratorio BBVA (ver ResultadosBbva en lib/bbva-clase.ts).
//   GET ?activity=bbva_a1   → conteos por ítem y opción, también por área
//   GET (sin activity)      → la actividad activa (o solo el ingreso si está en lobby)
// El área de cada participante es su "name" (se elige al entrar).

export async function GET(req: Request) {
  const session = await getSession(BBVA_SLUG);
  if (!session) return fail("Sesión no encontrada", 404);

  const url = new URL(req.url);
  const activity = url.searchParams.get("activity") || session.current_activity;
  const db = getAdmin();

  const [{ data: gente }, { data: rows }] = await Promise.all([
    db.from("participants").select("id, name").eq("session_id", session.id).limit(1000),
    activity === "lobby"
      ? Promise.resolve({ data: [] as { participant_id: string; item_key: string; payload: { v?: unknown } }[] })
      : db
          .from("responses")
          .select("participant_id, item_key, payload")
          .eq("session_id", session.id)
          .eq("activity", activity)
          .limit(5000),
  ]);

  const areaDe = new Map<string, string>();
  const porArea: Conteo = {};
  for (const p of gente ?? []) {
    areaDe.set(p.id as string, p.name as string);
    porArea[p.name as string] = (porArea[p.name as string] ?? 0) + 1;
  }

  const items: Record<string, Conteo> = {};
  const itemsPorArea: Record<string, Record<string, Conteo>> = {};
  const quienesItem: Record<string, Set<string>> = {};
  const quienes = new Set<string>();
  const hipotesis: { area: string; texto: string }[] = [];

  for (const r of rows ?? []) {
    const pid = r.participant_id as string;
    const area = areaDe.get(pid);
    if (!area) continue; // participante borrado
    const item = r.item_key as string;
    const v = (r.payload as { v?: unknown })?.v;
    if (item === HIPOTESIS_ITEM) {
      const texto = typeof v === "string" ? v.trim() : "";
      if (texto) hipotesis.push({ area, texto: texto.slice(0, 1200) });
      continue;
    }
    const valores = (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string" && x.length > 0);
    if (!valores.length) continue;
    quienes.add(pid);
    (quienesItem[item] ??= new Set()).add(pid);
    const conteo = (items[item] ??= {});
    const conteoArea = ((itemsPorArea[area] ??= {})[item] ??= {});
    for (const x of valores) {
      conteo[x] = (conteo[x] ?? 0) + 1;
      conteoArea[x] = (conteoArea[x] ?? 0) + 1;
    }
  }

  const respondieronItem: Conteo = {};
  for (const [k, s] of Object.entries(quienesItem)) respondieronItem[k] = s.size;

  const out: ResultadosBbva = {
    activity,
    actual: session.current_activity,
    participantes: gente?.length ?? 0,
    porArea,
    respondieron: quienes.size,
    respondieronItem,
    items,
    itemsPorArea,
  };
  if (activity === "bbva_a5" && (await isTeacher())) out.hipotesis = hipotesis;
  return ok(out);
}
