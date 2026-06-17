import { NextResponse } from "next/server";
import { getAdmin } from "./supabase/server";
import { DEFAULT_SLUG, WORKSHOP_TITLE } from "./constants";
import type { SessionRow } from "./types";

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

  // La clase por defecto se auto-crea para que nunca falle el acceso.
  if (slug === DEFAULT_SLUG) {
    const { data: created } = await db
      .from("sessions")
      .insert({ slug, title: WORKSHOP_TITLE, current_activity: "lobby", status: "lobby" })
      .select("*")
      .single();
    return (created as SessionRow) ?? null;
  }
  return null;
}
