import { NextResponse } from "next/server";
import { getAdmin } from "./supabase/server";
import { DEFAULT_SLUG, WORKSHOP_TITLE } from "./constants";
import { EXP_SLUG, EXP_TITLE } from "./expediente";
import { POSTA_SLUG, POSTA_TITLE } from "./posta";
import type { SessionRow } from "./types";

// Clases que la app puede auto-crear la primera vez que alguien entra.
const AUTO_SESSIONS: Record<string, string> = {
  [DEFAULT_SLUG]: WORKSHOP_TITLE,
  [EXP_SLUG]: EXP_TITLE,
  [POSTA_SLUG]: POSTA_TITLE,
};

export function ok<T>(data: T, init?: number) {
  return NextResponse.json(data, { status: init ?? 200 });
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function getSession(slug: string): Promise<SessionRow | null> {
  const db = getAdmin();
  const { data } = await db
    .from("sessions")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (data) return data as SessionRow;

  // Las clases conocidas se auto-crean para que nunca falle el acceso.
  const title = AUTO_SESSIONS[slug];
  if (title) {
    const { data: created, error } = await db
      .from("sessions")
      .insert({ slug, title, current_activity: "lobby", status: "lobby" })
      .select("*")
      .single();
    if (created) return created as SessionRow;
    // carrera: otro request la creó primero → re-leer
    if (error) {
      const { data: again } = await db.from("sessions").select("*").eq("slug", slug).maybeSingle();
      return (again as SessionRow) ?? null;
    }
  }
  return null;
}
