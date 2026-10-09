// Resumen agregado de una actividad de clase en vivo (lib/clase-vivo.ts),
// según su tipo. Lo usan los resultados en vivo del deck y el material
// descargable del Tribunal Fiscal.

import type { ActKind, ActividadVivo } from "./clase-vivo";

type Fila = {
  payload?: Record<string, unknown> | null;
  participants?: { name?: string } | { name?: string }[] | null;
};

const nombre = (r: Fila) => {
  const p = Array.isArray(r.participants) ? r.participants[0] : r.participants;
  return p?.name ?? "—";
};

/** Clave para agrupar palabras sin distinguir mayúsculas, tildes ni espacios. */
const clavePalabra = (w: string) =>
  w
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

export function resumenVivo(kind: ActKind, list: Fila[], act?: Pick<ActividadVivo, "normalizar">): Record<string, unknown> {
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
  // "palabra" (una por participante, o varias en payload.palabras)
  const counts: Record<string, number> = {};
  // Con `normalizar`, las variantes se agrupan y se muestra la forma más usada.
  const formas: Record<string, Record<string, number>> = {};
  for (const r of list) {
    const varias = Array.isArray(r.payload?.palabras) ? (r.payload.palabras as unknown[]) : [r.payload?.palabra];
    const vistas = new Set<string>();
    for (const v of varias) {
      const w = String(v ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
      if (!w) continue;
      const k = act?.normalizar ? clavePalabra(w) : w;
      if (vistas.has(k)) continue; // la misma palabra dos veces cuenta una
      vistas.add(k);
      counts[k] = (counts[k] ?? 0) + 1;
      formas[k] ??= {};
      formas[k][w] = (formas[k][w] ?? 0) + 1;
    }
  }
  const forma = (k: string) => Object.entries(formas[k] ?? {}).sort((a, b) => b[1] - a[1])[0]?.[0] ?? k;
  const palabras = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 60)
    .map(([k, n]) => ({ palabra: act?.normalizar ? forma(k) : k, n }));
  return { total: list.length, palabras };
}
