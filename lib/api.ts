import { NextResponse } from "next/server";
import { getAdmin } from "./supabase/server";
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
  return (data as SessionRow) ?? null;
}
