// Resumen agregado de una actividad de clase en vivo (lib/clase-vivo.ts),
// según su tipo. Lo usan los resultados en vivo del deck y el material
// descargable del Tribunal Fiscal.

import type { ActKind } from "./clase-vivo";

type Fila = {
  payload?: Record<string, unknown> | null;
  participants?: { name?: string } | { name?: string }[] | null;
};

const nombre = (r: Fila) => {
  const p = Array.isArray(r.participants) ? r.participants[0] : r.participants;
  return p?.name ?? "—";
};

export function resumenVivo(kind: ActKind, list: Fila[]): Record<string, unknown> {
  if (kind === "encuesta") {
    const byQuestion: Record<string, Record<string, number>> = {};
    for (const r of list) {
      const ans = (r.payload?.answers as Record<string, string>) ?? {};
      for (const [q, opt] of Object.entries(ans)) {
        byQuestion[q] ??= {};
        byQuestion[q][String(opt)] = (byQuestion[q][String(opt)] ?? 0) + 1;
      }
    }
    return { total: list.length, byQuestion };
  }
  if (kind === "opciones") {
    const counts: Record<string, number> = {};
    for (const r of list) {
      const op = String(r.payload?.opcion ?? "");
      if (op) counts[op] = (counts[op] ?? 0) + 1;
    }
    return { total: list.length, counts };
  }
  if (kind === "chips") {
    const counts: Record<string, number> = {};
    for (const r of list)
      for (const id of (r.payload?.selected as string[]) ?? [])
        counts[id] = (counts[id] ?? 0) + 1;
    return { total: list.length, counts };
  }
  if (kind === "texto") {
    const respuestas = list
      .map((r) => ({
        name: nombre(r),
        respuesta: String(r.payload?.respuesta ?? "").slice(0, 300),
      }))
      .filter((r) => r.respuesta.trim())
      .slice(-40);
    return { total: list.length, respuestas };
  }
  // "palabra"
  const counts: Record<string, number> = {};
  for (const r of list) {
    const w = String(r.payload?.palabra ?? "")
      .trim()
      .toLowerCase();
    if (w) counts[w] = (counts[w] ?? 0) + 1;
  }
  const palabras = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([palabra, n]) => ({ palabra, n }));
  return { total: list.length, palabras };
}
