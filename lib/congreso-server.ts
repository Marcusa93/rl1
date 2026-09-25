// Servidor del Congreso: la sesión se crea sola la primera vez (sin tocar el
// registro compartido de lib/api.ts) y la versión publicada sale del deploy.

import { getSession } from "./api";
import { getAdmin } from "./supabase/server";
import { CONG_SLUG, CONG_TITLE } from "./congreso";
import type { SessionRow } from "./types";

export async function sesionCong(): Promise<SessionRow | null> {
  const existente = await getSession(CONG_SLUG);
  if (existente) return existente;
  const db = getAdmin();
  const { data } = await db
    .from("sessions")
    .insert({ slug: CONG_SLUG, title: CONG_TITLE, current_activity: "lobby", status: "lobby" })
    .select("*")
    .single();
  if (data) return data as SessionRow;
  // carrera: otro request la creó primero
  return getSession(CONG_SLUG);
}

/** Versión publicada: el commit del deploy en Vercel ("local" en desarrollo). */
export function versionPublicada(): { version: string; cambio?: string } {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  const version = sha ? sha.slice(0, 7) : (process.env.VERCEL_DEPLOYMENT_ID ?? "local");
  const cambio = process.env.VERCEL_GIT_COMMIT_MESSAGE?.split("\n")[0]?.slice(0, 140);
  return { version, cambio };
}
