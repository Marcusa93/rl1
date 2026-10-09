"use client";

// Resultados en vivo del ciclo del Tribunal Fiscal, con la estética de las
// placas: barras, nube de palabras, clasificación A/C/N apilada y muro de
// respuestas (anónimo). Las respuestas abiertas pasan por la moderación:
// no se proyectan hasta que el equipo las revisa (ver lib/moderacion.ts).

import { useCallback } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useLive } from "@/components/use-live";
import type { ActOpcion } from "@/lib/clase-vivo";
import type { Moderacion, ModeracionActividad } from "@/lib/moderacion";
import { tamanosNube, NUBE_MAX } from "@/lib/nube";
import { rem } from "@/lib/remoto";
import type { TfActividad } from "@/lib/tribunal";
import { cn } from "@/lib/utils";

// --- Moderación ---------------------------------------------------------------------------

/** Estado de la moderación de la clase (deck y control lo leen; ambos con la cookie docente). */
export function useModeracion(slug: string, intervalo = 2500) {
  const { data, refresh } = useLive<{ moderacion: Moderacion }>(`/api/session/${slug}/moderacion`, intervalo);
  const cambiar = useCallback(
    async (cambio: { activity: string; valor?: string; oculta?: boolean; proyectar?: boolean } | { reiniciar: true }) => {
      await fetch(`/api/session/${slug}/moderacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambio),
      }).catch(() => {});
      await refresh();
    },
    [slug, refresh],
  );
  return { moderacion: data?.moderacion ?? {}, cargada: Boolean(data), cambiar };
}

// --- Datos ------------------------------------------------------------------------------------

type Palabra = { palabra: string; n: number };
type Respuesta = { name: string; respuesta: string };

const NUBE = ["#173b63", "#007a87", "#17212b", "#1d6d93", "#0b5f6a", "#5e6974"];
const ACN_COLOR: Record<string, string> = { a: "#007a87", c: "#b7791f", n: "#b4372f" };
/** Las categorías de la placa 18 (en el celular los botones dicen solo la letra). */
const ACN_NOMBRE: Record<string, string> = { a: "A · Uso admisible", c: "C · Uso condicionado", n: "N · No delegar" };

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

// --- Resultados de una actividad ------------------------------------------------------------------

export function ResultadosTf({
  slug,
  act,
  mod,
  onProyectar,
  intervalo,
  compacto,
}: {
  slug: string;
  act: TfActividad;
  mod?: ModeracionActividad;
  onProyectar: (proyectar: boolean) => void;
  intervalo: number;
  /** Versión chica (síntesis): sin contador grande. */
  compacto?: boolean;
}) {
  const { data: r } = useResultados(slug, act.key, intervalo);
  const s = r?.summary ?? {};
  const ocultas = new Set(mod?.ocultas ?? []);
  const visible = !act.moderada || Boolean(mod?.proyectar);
  const etiquetaProyectar = compacto ? `👁 Proyectar: ${act.titulo}` : "👁 Proyectar respuestas";

  return (
    <div className={cn("tf-hoja flex flex-1 flex-col rounded-[1.25rem] border border-tf-linea", compacto ? "p-5" : "p-6 sm:p-7")}>
      <div className="mb-4 flex items-center gap-3 text-tf-pizarra">
        <span className="size-2 animate-pulse rounded-full bg-tf-ocre" />
        <span className="tf-rotulo text-[0.68rem] text-tf-pizarra">Resultados en vivo</span>
        {r && (
          <span className="ml-auto text-sm tabular-nums">
            <b className="text-base text-tf-tinta">{r.responded}</b> de {Math.max(r.participants, r.responded)} respondieron
          </span>
        )}
      </div>

      {!r ? (
        <p className="text-tf-pizarra">Cargando…</p>
      ) : !visible ? (
        <EnRevision total={Number(s.total ?? 0)} onProyectar={() => onProyectar(true)} etiqueta={etiquetaProyectar} />
      ) : act.kind === "encuesta" && act.acn ? (
        <ClasificacionAcn act={act} byQ={(s.byQuestion as Record<string, Record<string, number>>) ?? {}} />
      ) : act.kind === "encuesta" ? (
        <EncuestaTf act={act} byQ={(s.byQuestion as Record<string, Record<string, number>>) ?? {}} />
      ) : act.kind === "opciones" || act.kind === "chips" ? (
        <BarrasTf
          opciones={act.opciones ?? []}
          counts={(s.counts as Record<string, number>) ?? {}}
          total={act.kind === "chips" ? r.responded : Number(s.total ?? 0)}
          ordenar={act.kind === "chips"}
        />
      ) : act.kind === "texto" ? (
        <MuroTf items={((s.respuestas as Respuesta[]) ?? []).filter((x) => !ocultas.has(x.respuesta))} />
      ) : (
        <NubeTf palabras={((s.palabras as Palabra[]) ?? []).filter((p) => !ocultas.has(p.palabra))} alto={compacto ? 13 : 19} />
      )}

      {act.moderada && visible && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => onProyectar(false)}
            {...rem(etiquetaProyectar, true)}
            className="rounded-lg border border-tf-linea px-3 py-1.5 text-xs text-tf-pizarra transition hover:border-tf-petroleo hover:text-tf-petroleo"
          >
            Ocultar de la pantalla
          </button>
        </div>
      )}
    </div>
  );
}

/** Respuestas abiertas recibidas pero todavía sin revisar: solo se ve cuántas llegaron. */
function EnRevision({ total, onProyectar, etiqueta }: { total: number; onProyectar: () => void; etiqueta: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-8 text-center">
      <p className="tf-titular text-[4.5rem] leading-none text-tf-azul tabular-nums">{total}</p>
      <p className="text-lg text-tf-pizarra">{total === 1 ? "respuesta recibida" : "respuestas recibidas"}</p>
      <p className="max-w-md text-sm text-tf-niebla">Las respuestas abiertas se proyectan después de que el equipo las revisa.</p>
      <button
        onClick={onProyectar}
        {...rem(etiqueta, false)}
        className="mt-1 rounded-xl border border-tf-petroleo/40 bg-tf-petroleo/10 px-4 py-2 text-sm font-semibold text-tf-petroleo transition hover:bg-tf-petroleo/15"
      >
        Proyectar respuestas <span className="ml-1 text-xs font-normal text-tf-pizarra">R</span>
      </button>
    </div>
  );
}

// --- Barras ------------------------------------------------------------------------------------------

function BarrasTf({
  opciones,
  counts,
  total,
  ordenar,
}: {
  opciones: ActOpcion[];
  counts: Record<string, number>;
  total: number;
  ordenar?: boolean;
}) {
  const max = Math.max(1, ...Object.values(counts));
  const filas = ordenar ? [...opciones].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)) : opciones;
  const lider = max > 0 ? Object.entries(counts).find(([, n]) => n === max)?.[0] : undefined;
  const muchas = opciones.length > 7;
  return (
    <div className={cn("grid content-start", muchas ? "gap-2" : "gap-3")}>
      {filas.map((o) => {
        const n = counts[o.id] ?? 0;
        return (
          <div key={o.id} className="grid grid-cols-[minmax(0,27rem)_1fr_4.5rem] items-center gap-4">
            <p className={cn("line-clamp-2 text-right leading-snug", muchas ? "text-base" : "text-lg", o.id === lider && n > 0 ? "font-semibold text-tf-tinta" : "text-tf-pizarra")}>
              <span className="mr-2">{o.emoji}</span>
              {o.label}
            </p>
            <div className={cn("overflow-hidden rounded-full bg-tf-celeste/70", muchas ? "h-5" : "h-7")}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(n / max) * 100}%`, background: o.id === lider && n > 0 ? "#173b63" : "#007a87" }}
              />
            </div>
            <p className="text-right tabular-nums">
              <b className="text-lg text-tf-tinta">{n}</b>
              <span className="ml-1.5 text-sm text-tf-niebla">{pct(n, total)}%</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

/** Encuesta de varias preguntas: una columna de barras por pregunta. */
function EncuestaTf({ act, byQ }: { act: TfActividad; byQ: Record<string, Record<string, number>> }) {
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {(act.preguntas ?? []).map((q) => {
        const counts = byQ[q.id] ?? {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="tf-serif mb-3 text-xl text-tf-azul">{q.q}</p>
            <div className="grid gap-2">
              {q.opciones.map((o) => {
                const n = counts[o.id] ?? 0;
                return (
                  <div key={o.id}>
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-base text-tf-tinta">
                        <span className="mr-1.5">{o.emoji}</span>
                        {o.label}
                      </p>
                      <p className="shrink-0 text-sm tabular-nums text-tf-pizarra">
                        <b className="text-base text-tf-tinta">{n}</b> · {pct(n, total)}%
                      </p>
                    </div>
                    <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-tf-celeste/70">
                      <div className="h-full rounded-full bg-tf-petroleo transition-all duration-700" style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Taller A/C/N: una barra apilada por tarea, para ver dónde la sala coincide y dónde se divide. */
function ClasificacionAcn({ act, byQ }: { act: TfActividad; byQ: Record<string, Record<string, number>> }) {
  const preguntas = act.preguntas ?? [];
  const opciones = preguntas[0]?.opciones ?? [];
  return (
    <div className="grid gap-2.5">
      <div className="mb-1 flex flex-wrap justify-end gap-5 text-sm text-tf-pizarra">
        {opciones.map((o) => (
          <span key={o.id} className="flex items-center gap-2">
            <span className="size-3 rounded-sm" style={{ background: ACN_COLOR[o.id] }} />
            {ACN_NOMBRE[o.id] ?? o.label}
          </span>
        ))}
      </div>
      {preguntas.map((q, i) => {
        const counts = byQ[q.id] ?? {};
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return (
          <div key={q.id} className="grid grid-cols-[1.6rem_minmax(0,31rem)_1fr] items-center gap-3">
            <span className="text-right text-sm tabular-nums text-tf-niebla">{i + 1}</span>
            <p className="line-clamp-2 text-base leading-snug text-tf-tinta">{q.q}</p>
            <div className="flex h-7 overflow-hidden rounded-md bg-tf-celeste/60">
              {total > 0 &&
                opciones.map((o) => {
                  const n = counts[o.id] ?? 0;
                  const p = pct(n, total);
                  return (
                    <div
                      key={o.id}
                      className="flex items-center justify-center text-xs font-semibold text-white transition-all duration-700"
                      style={{ width: `${(n / total) * 100}%`, background: ACN_COLOR[o.id] }}
                      title={`${ACN_NOMBRE[o.id] ?? o.label}: ${n}`}
                    >
                      {p >= 12 && `${o.id.toUpperCase()} ${p}%`}
                    </div>
                  );
                })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Nube y muro -------------------------------------------------------------------------------------

export function NubeTf({ palabras, alto }: { palabras: Palabra[]; alto: number }) {
  if (!palabras.length) return <p className="py-10 text-center text-lg text-tf-niebla">Esperando las primeras palabras…</p>;
  const max = Math.max(1, ...palabras.map((p) => p.n));
  const orden = [...palabras].sort((a, b) => b.n - a.n || a.palabra.localeCompare(b.palabra)).slice(0, NUBE_MAX);
  const nube: Palabra[] = [];
  orden.forEach((p, i) => (i % 2 ? nube.push(p) : nube.unshift(p)));
  const tamanos = tamanosNube(nube, alto);
  return (
    <div className="flex flex-1 flex-wrap items-center justify-center gap-x-7 gap-y-2 py-4">
      {nube.map((p, i) => {
        const peso = p.n / max;
        return (
          <span
            key={p.palabra}
            className="tf-serif tf-sube inline-block font-semibold leading-none transition-all duration-700"
            style={{
              fontSize: `${tamanos[i]}rem`,
              color: peso > 0.75 ? "#173b63" : NUBE[hash(p.palabra) % NUBE.length],
              opacity: 0.55 + peso * 0.45,
            }}
          >
            {p.palabra}
          </span>
        );
      })}
    </div>
  );
}

function MuroTf({ items }: { items: Respuesta[] }) {
  if (!items.length) return <p className="py-10 text-center text-lg text-tf-niebla">Todavía no hay respuestas.</p>;
  return (
    <div className="grid max-h-[46vh] content-start gap-3 overflow-auto pr-1 lg:grid-cols-2">
      {items
        .slice()
        .reverse()
        .map((p, i) => (
          <p key={i} className="tf-sube rounded-xl border border-tf-linea bg-tf-papel px-4 py-3 text-base leading-snug text-tf-tinta">
            {p.respuesta}
          </p>
        ))}
    </div>
  );
}

// --- Franja que recuerda una actividad anterior ----------------------------------------------------

/** Resultado de una actividad de opciones en una línea (ej.: los perfiles de la sala en la placa 13). */
export function FranjaRecuerdo({ slug, act, intervalo }: { slug: string; act: TfActividad; intervalo: number }) {
  const { data: r } = useResultados(slug, act.key, intervalo);
  const counts = (r?.summary?.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!total) return null;
  return (
    <div className="tf-sube flex flex-wrap items-center gap-x-6 gap-y-2 rounded-2xl border border-tf-ocre/40 bg-tf-ocre-claro/70 px-5 py-3">
      <span className="tf-rotulo text-tf-ocre">En esta sala</span>
      {(act.opciones ?? [])
        .filter((o) => counts[o.id])
        .map((o) => (
          <span key={o.id} className="text-base text-tf-tinta">
            {o.emoji} {o.label} <b className="tabular-nums">{counts[o.id]}</b>
          </span>
        ))}
    </div>
  );
}
