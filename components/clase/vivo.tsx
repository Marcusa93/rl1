"use client";

// Piezas del deck reutilizables por cualquier clase en vivo: resultados
// agregados de una actividad, placa de ingreso con QR y el fondo de nodos.

import { useLive } from "@/components/use-live";
import type { ActividadVivo, ActOpcion } from "@/lib/clase-vivo";
import { cn } from "@/lib/utils";

type VivoResp = {
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
};

/** Hook: resultados de una actividad (lo usa también la demo para leer el voto ganador). */
export function useResultados(slug: string, activity: string, intervalo: number) {
  return useLive<VivoResp>(`/api/session/${slug}/results?activity=${activity}`, intervalo);
}

export function ganador(counts: Record<string, number> | undefined): string | undefined {
  if (!counts) return undefined;
  const orden = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  return orden[0]?.[1] ? orden[0][0] : undefined;
}

export function ResultadosVivo({
  slug,
  act,
  intervalo,
  compacto,
}: {
  slug: string;
  act: ActividadVivo;
  intervalo: number;
  compacto?: boolean;
}) {
  const { data: r } = useResultados(slug, act.key, intervalo);

  return (
    <div className={cn("glass glow-teal flex flex-col rounded-2xl p-5", compacto ? "min-h-[14vh]" : "min-h-[38vh]")}>
      <div className="mb-3 flex items-center gap-2 text-sm text-faint">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        Resultados en vivo
        {r && (
          <span className="ml-auto">
            <b className="text-teal">{r.responded}</b>/{Math.max(r.participants, r.responded)} respondieron
          </span>
        )}
      </div>
      {!r ? (
        <p className="text-sm text-faint">Cargando…</p>
      ) : act.kind === "encuesta" ? (
        <VivoEncuesta act={act} byQ={(r.summary?.byQuestion as Record<string, Record<string, number>>) ?? {}} />
      ) : act.kind === "opciones" || act.kind === "chips" ? (
        <VivoBarras
          counts={(r.summary?.counts as Record<string, number>) ?? {}}
          opciones={act.opciones ?? []}
          ordenar={act.kind === "chips"}
        />
      ) : act.kind === "texto" ? (
        <VivoMuro items={(r.summary?.respuestas as Array<{ name: string; respuesta: string }>) ?? []} />
      ) : (
        <VivoPalabras palabras={(r.summary?.palabras as Array<{ palabra: string; n: number }>) ?? []} />
      )}
    </div>
  );
}

function VivoEncuesta({ act, byQ }: { act: ActividadVivo; byQ: Record<string, Record<string, number>> }) {
  const preguntas = act.preguntas ?? [];
  return (
    <div className={cn("grid gap-6", preguntas.length >= 3 ? "lg:grid-cols-3" : "lg:grid-cols-2")}>
      {preguntas.map((q) => {
        const counts = byQ[q.id] ?? {};
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="mb-2 text-sm font-semibold text-muted">{q.q}</p>
            <div className="space-y-1.5">
              {q.opciones.map((o) => (
                <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VivoBarras({ counts, opciones, ordenar }: { counts: Record<string, number>; opciones: ActOpcion[]; ordenar?: boolean }) {
  const max = Math.max(1, ...Object.values(counts));
  const rows = ordenar ? [...opciones].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)) : opciones;
  return (
    <div className="space-y-2">
      {rows.map((o) => (
        <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} grande />
      ))}
    </div>
  );
}

export function Barra({ label, emoji, n, max, grande }: { label: string; emoji?: string; n: number; max: number; grande?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("shrink-0 truncate text-right", grande ? "w-72 text-base" : "w-44 text-xs")}>
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {label}
      </div>
      <div className={cn("flex-1 overflow-hidden rounded-lg bg-panel/50", grande ? "h-7" : "h-5")}>
        <div
          className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-teal via-cyan to-violet px-2 text-xs font-bold text-ink transition-all duration-700"
          style={{ width: `${(n / max) * 100}%` }}
        >
          {n > 0 && n}
        </div>
      </div>
    </div>
  );
}

function VivoMuro({ items }: { items: Array<{ name: string; respuesta: string }> }) {
  if (!items.length) return <p className="text-sm text-faint">Todavía no hay respuestas — denles un minuto.</p>;
  return (
    <div className="grid max-h-[44vh] content-start gap-x-8 gap-y-2.5 overflow-auto lg:grid-cols-2">
      {items
        .slice()
        .reverse()
        .map((p, i) => (
          <p key={i} className="text-base leading-snug text-muted">
            <span className="font-semibold text-teal">{p.name.split(/\s+/)[0]}</span> · {p.respuesta}
          </p>
        ))}
    </div>
  );
}

function VivoPalabras({ palabras }: { palabras: Array<{ palabra: string; n: number }> }) {
  if (!palabras.length) return <p className="text-sm text-faint">Esperando las primeras palabras…</p>;
  const max = Math.max(1, ...palabras.map((p) => p.n));
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-6">
      {palabras.map((p) => (
        <span
          key={p.palabra}
          className="font-semibold transition-all duration-700"
          style={{ fontSize: `${1 + (p.n / max) * 1.8}rem`, opacity: 0.55 + (p.n / max) * 0.45 }}
        >
          {p.palabra}
          {p.n > 1 && <span className="ml-1 text-base text-teal">×{p.n}</span>}
        </span>
      ))}
    </div>
  );
}

/** Placa de ingreso: QR gigante + contador en vivo. */
export function PlacaIngreso({ slug, qr, link }: { slug: string; qr: string; link: string }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 3000);
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-faint">Escanee el código con su celular</p>
      <div className="rise mt-6" style={{ animationDelay: "0.15s" }}>
        <img
          src={qr}
          alt="Código QR para ingresar a la plataforma"
          className="pulse-ring rounded-3xl border border-line bg-white p-4"
          style={{ width: "min(46vh, 420px)", height: "min(46vh, 420px)" }}
        />
      </div>
      <p className="rise mt-6 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
        o escriba la dirección
      </p>
      <p className="text-gradient rise font-mono text-4xl font-bold tracking-tight" style={{ animationDelay: "0.35s" }}>
        {link}
      </p>
      <div className="rise mt-6 flex items-center gap-3 text-muted" style={{ animationDelay: "0.5s" }}>
        <span className="size-3 animate-pulse rounded-full bg-teal" />
        <span className="text-3xl font-semibold text-foreground">{data?.participants ?? 0}</span>
        <span className="text-lg">personas conectadas</span>
      </div>
    </div>
  );
}

/** Chip de "responda en su celular" con mini-QR, para las placas de actividad. */
export function ChipResponda({ qr, link }: { qr: string; link: string }) {
  return (
    <div className="pulse-ring flex shrink-0 items-center gap-3 rounded-xl border-gradient px-4 py-3">
      <img src={qr} alt="Código QR para ingresar" width={92} height={92} className="rounded-lg border border-line bg-white p-1" />
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-widest text-faint">Responda en su celular</p>
        <p className="text-gradient mt-0.5 font-mono text-sm font-bold">{link}</p>
      </div>
    </div>
  );
}

/** Red de nodos flotando detrás de la portada. */
export function Constelacion() {
  const nodos: Array<[number, number, number]> = [
    [80, 60, 3], [220, 30, 2.5], [370, 80, 3.5], [520, 40, 2.5], [660, 90, 3],
    [140, 190, 2.5], [330, 220, 3], [500, 200, 2.5], [620, 240, 3.5], [60, 300, 3],
    [250, 330, 2.5], [450, 310, 3], [680, 330, 2.5],
  ];
  const lineas: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [2, 6], [4, 8], [5, 6], [6, 7], [7, 8], [5, 9], [6, 10], [7, 11], [8, 12], [10, 11],
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 740 380"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-25"
    >
      {lineas.map(([a, b], i) => (
        <line key={i} x1={nodos[a][0]} y1={nodos[a][1]} x2={nodos[b][0]} y2={nodos[b][1]} stroke="#5eead4" strokeWidth="0.7">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${4 + (i % 5)}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodos.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#8b5cf6" : "#5eead4"}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${3 + (i % 4)}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${6 + (i % 5)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
