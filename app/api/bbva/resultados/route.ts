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

  // Solo cuenta a quienes entraron HOY (la sesión es la misma de la clase 1).
  const inicioHoy = new Date(Date.now() - 3 * 3600_000);
  inicioHoy.setUTCHours(3, 0, 0, 0); // 00:00 en Buenos Aires
  const [{ data: gente, error: errGente }, { data: rows, error: errRows }, { data: perfiles }] = await Promise.all([
    db.from("participants").select("id, name, created_at").eq("session_id", session.id).gte("created_at", inicioHoy.toISOString()).order("created_at").limit(1000),
    activity === "lobby"
      ? Promise.resolve({ data: [] as { participant_id: string; item_key: string; payload: { v?: unknown } }[], error: null })
      : db
          .from("responses")
          .select("participant_id, item_key, payload")
          .eq("session_id", session.id)
          .eq("activity", activity)
          .limit(5000),
    db.from("responses").select("participant_id, payload").eq("session_id", session.id).eq("activity", "perfil").eq("item_key", "nombre").limit(3000),
  ]);

  // Si la base falla, 503: el deck conserva el último dato (con un 200 vacío el gráfico
  // proyectado se desarmaba a "Esperando respuestas…" en medio de la clase).
  const errDb = errGente ?? errRows;
  if (errDb) return fail(errDb.message, 503);

  // Una persona = un nombre y apellido (si entró desde dos dispositivos, cuenta una vez).
  const norm = (x: string) => x.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
  const nombreDe = new Map<string, string>();
  for (const r of perfiles ?? []) {
    const v = (r.payload as { v?: unknown })?.v;
    if (typeof v === "string" && v.trim()) nombreDe.set(r.participant_id as string, norm(v));
  }
  const areaDe = new Map<string, string>();
  const persona = new Map<string, string>(); // persona → área (la del último ingreso)
  for (const p of gente ?? []) {
    areaDe.set(p.id as string, p.name as string);
    persona.set(nombreDe.get(p.id as string) ?? `id:${p.id}`, p.name as string);
  }
  const porArea: Conteo = {};
  for (const area of persona.values()) porArea[area] = (porArea[area] ?? 0) + 1;

  const items: Record<string, Conteo> = {};
  const itemsPorArea: Record<string, Record<string, Conteo>> = {};
  const quienesItem: Record<string, Set<string>> = {};
  const quienes = new Set<string>();
  const hipotesis: { area: string; texto: string }[] = [];
  /** persona|ítem ya contado (misma persona en dos dispositivos: un solo voto). */
  const contado = new Set<string>();

  for (const r of rows ?? []) {
    const pidReal = r.participant_id as string;
    const area = areaDe.get(pidReal);
    if (!area) continue; // participante borrado o de otro día
    const pid = nombreDe.get(pidReal) ?? `id:${pidReal}`;
    const item = r.item_key as string;
    if (contado.has(`${pid}|${item}`)) continue;
    contado.add(`${pid}|${item}`);
    const v = (r.payload as { v?: unknown })?.v;
    if (item === HIPOTESIS_ITEM) {
      const texto = typeof v === "string" ? v.trim() : "";
      if (texto) hipotesis.push({ area, texto: texto.slice(0, 1200) });
      continue;
    }
    if (item.startsWith("txt_")) continue; // textos propios de la clase 2: no se proyectan
    // Clase 2, "Armá el método": además de cada paso, la cadena completa en orden.
    if (item === "metodo" && Array.isArray(v) && v.length) {
      const cadena = v.filter((x): x is string => typeof x === "string").join(">");
      const c = (items.cadena ??= {});
      c[cadena] = (c[cadena] ?? 0) + 1;
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
    participantes: persona.size,
    porArea,
    respondieron: quienes.size,
    respondieronItem,
    items,
    itemsPorArea,
  };
  if (activity === "bbva_a5" && (await isTeacher())) out.hipotesis = hipotesis;
  return ok(out);
}
