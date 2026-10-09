import { getAdmin } from "./supabase/server";

/**
 * Fila auxiliar de `sessions` (control remoto, moderación…), identificada por
 * su slug (ej. `<clase>~remoto-estado`). Se crea la primera vez que se usa.
 */
export async function leerFila(slug: string, titulo = "control remoto") {
  const db = getAdmin();
  const { data } = await db.from("sessions").select("id, activity_config").eq("slug", slug).maybeSingle();
  if (data) return data as { id: string; activity_config: Record<string, unknown> };
  const { data: creada } = await db
    .from("sessions")
    .insert({ slug, title: titulo, current_activity: "lobby", status: "lobby" })
    .select("id, activity_config")
    .single();
  if (creada) return creada as { id: string; activity_config: Record<string, unknown> };
  // carrera: la creó otro request
  const { data: otra } = await db.from("sessions").select("id, activity_config").eq("slug", slug).single();
  return otra as { id: string; activity_config: Record<string, unknown> };
}
