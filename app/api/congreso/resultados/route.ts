import { fail, ok } from "@/lib/api";
import { sesionCong } from "@/lib/congreso-server";
import {
  esProyectable,
  getActividadCong,
  terminosDe,
  type Conteo,
  type ResultadosCong,
} from "@/lib/congreso";
import { getAdmin } from "@/lib/supabase/server";

// Resultados agregados del Congreso (ver ResultadosCong en lib/congreso.ts).
//   GET ?activity=cong_usar → conteos por ítem y opción
//   GET ?activity=cong_molestia → nube de términos + últimas frases proyectables
//   GET (sin activity) → la interacción abierta ahora
// Las frases de seguimiento ("¿de qué depende?") llegan en item_key "<ítem>~porque".

const MAX_FRASES = 40;

export async function GET(req: Request) {
  const session = await sesionCong();
  if (!session) return fail("Sesión no encontrada", 404);

  const url = new URL(req.url);
  const activity = url.searchParams.get("activity") || session.current_activity;
  const act = getActividadCong(activity);
  const db = getAdmin();

  const [{ count }, { data: rows }] = await Promise.all([
    db.from("participants").select("id", { count: "exact", head: true }).eq("session_id", session.id),
    act
      ? db
          .from("responses")
          .select("participant_id, item_key, payload, updated_at")
          .eq("session_id", session.id)
          .eq("activity", activity)
          .order("updated_at", { ascending: false })
          .limit(5000)
      : Promise.resolve({ data: [] as { participant_id: string; item_key: string; payload: { v?: unknown }; updated_at: string }[] }),
  ]);

  const items: Record<string, Conteo> = {};
  const quienesItem: Record<string, Set<string>> = {};
  const quienes = new Set<string>();
  const seguimientos: Record<string, string[]> = {};
  const nube: Conteo = {};
  const sueltas: Conteo = {};
  const formaDe = new Map<string, string>();
  const frases: string[] = [];
  const vistas = new Set<string>();

  for (const r of rows ?? []) {
    const pid = r.participant_id as string;
    const item = r.item_key as string;
    const v = (r.payload as { v?: unknown })?.v;

    if (item.endsWith("~porque")) {
      const t = typeof v === "string" ? v.trim().slice(0, 160) : "";
      const lista = (seguimientos[item.slice(0, -"~porque".length)] ??= []);
      if (t && esProyectable(t) && !lista.some((x) => x.toLowerCase() === t.toLowerCase())) lista.push(t);
      continue;
    }

    if (act?.tipo === "texto") {
      const t = typeof v === "string" ? v.trim().slice(0, 120) : "";
      if (!t) continue;
      quienes.add(pid);
      (quienesItem[item] ??= new Set()).add(pid);
      const { terminos, sueltas: s } = terminosDe(t);
      for (const x of terminos) nube[x] = (nube[x] ?? 0) + 1;
      for (const x of s) {
        sueltas[x.clave] = (sueltas[x.clave] ?? 0) + 1;
        if (!formaDe.has(x.clave)) formaDe.set(x.clave, x.palabra);
      }
      const clave = t.toLowerCase();
      if (frases.length < MAX_FRASES && !vistas.has(clave) && esProyectable(t)) {
        vistas.add(clave);
        frases.push(t);
      }
      continue;
    }

    // Selección múltiple: se guarda "a|b|c".
    const valores = (Array.isArray(v) ? v : [v])
      .flatMap((x) => (typeof x === "string" ? x.split("|") : []))
      .filter((x) => x.length > 0);
    if (!valores.length) continue;
    quienes.add(pid);
    (quienesItem[item] ??= new Set()).add(pid);
    const conteo = (items[item] ??= {});
    for (const x of valores) conteo[x] = (conteo[x] ?? 0) + 1;
  }

  const respondieronItem: Conteo = {};
  for (const [k, s] of Object.entries(quienesItem)) respondieronItem[k] = s.size;

  const out: ResultadosCong = {
    activity,
    actual: session.current_activity,
    participantes: count ?? 0,
    respondieron: quienes.size,
    respondieronItem,
    items,
    config: (session.activity_config ?? {}) as Record<string, unknown>,
  };
  if (act?.tipo === "texto") {
    // Una palabra suelta entra a la nube solo si la repiten dos o más personas.
    for (const [w, n] of Object.entries(sueltas)) {
      const palabra = formaDe.get(w) ?? w;
      if (n >= 2 && esProyectable(w)) nube[palabra] = (nube[palabra] ?? 0) + n;
    }
    out.nube = Object.entries(nube)
      .map(([termino, n]) => ({ termino, n }))
      .sort((a, b) => b.n - a.n || a.termino.localeCompare(b.termino))
      .slice(0, 36);
    out.frases = frases;
  }
  if (Object.keys(seguimientos).length) out.seguimientos = seguimientos;
  return ok(out);
}
