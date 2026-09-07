"use client";

import { useLive } from "@/components/use-live";
import { COM_ENCUESTA, COM_POLL, COM_SLUG, COM_USOS, getBloque } from "@/lib/comercial";

export type ComResultsResp = {
  activity: string;
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
  config: Record<string, unknown>;
};

/** Hook compartido por el panel docente y el proyector. */
export function useComResults(activity: string, interval = COM_POLL.docente) {
  return useLive<ComResultsResp>(`/api/session/${COM_SLUG}/results?activity=${activity}`, interval);
}

/** Resultados compactos para el panel del docente. */
export function ComResults({ activity }: { activity: string }) {
  const { data: r } = useComResults(activity);
  if (activity === "lobby") return null;
  const bloque = getBloque(activity);

  const responded = r?.responded ?? 0;
  const participants = Math.max(r?.participants ?? 0, responded);
  const ratio = participants ? Math.round((responded / participants) * 100) : 0;

  return (
    <section>
      <div className="mb-2 flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        <h3 className="text-sm font-semibold text-muted">Resultados en vivo</h3>
        {r && (
          <span className="ml-auto text-xs text-faint">
            <b className="text-teal">{responded}</b>/{participants} respondieron
          </span>
        )}
      </div>
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-ink-2/70">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-500"
          style={{ width: `${ratio}%` }}
        />
      </div>
      <div className="glass rounded-2xl p-4">
        {!r ? (
          <p className="text-sm text-faint">Cargando…</p>
        ) : activity === "emp_encuesta" ? (
          <EncuestaR r={r} />
        ) : activity === "emp_usos" ? (
          <UsosR r={r} />
        ) : bloque ? (
          <BloqueR r={r} />
        ) : activity === "emp_cierre" ? (
          <CierreR r={r} />
        ) : null}
      </div>
    </section>
  );
}

function Bar({ label, emoji, n, max }: { label: string; emoji?: string; n: number; max: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="w-36 shrink-0 truncate text-right text-xs sm:w-44">
        {emoji && <span className="mr-1">{emoji}</span>}
        {label}
      </div>
      <div className="h-5 flex-1 overflow-hidden rounded bg-ink-2/70">
        <div
          className="flex h-full items-center justify-end rounded bg-gradient-to-r from-teal via-cyan to-violet px-2 text-[11px] font-bold text-ink transition-all duration-500"
          style={{ width: `${(n / Math.max(1, max)) * 100}%` }}
        >
          {n > 0 && n}
        </div>
      </div>
    </div>
  );
}

function EncuestaR({ r }: { r: ComResultsResp }) {
  const byQ = (r.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="space-y-4">
      {COM_ENCUESTA.map((q) => {
        const counts = byQ[q.id] ?? {};
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="mb-1.5 text-xs font-semibold text-muted">{q.q}</p>
            <div className="space-y-1.5">
              {q.options.map((o) => (
                <Bar key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UsosR({ r }: { r: ComResultsResp }) {
  const counts = (r.summary?.counts as Record<string, number>) ?? {};
  const max = Math.max(1, ...Object.values(counts));
  const rows = [...COM_USOS].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  return (
    <div className="space-y-2">
      {rows.map((c) => (
        <Bar key={c.id} label={c.label} emoji={c.emoji} n={counts[c.id] ?? 0} max={max} />
      ))}
    </div>
  );
}

function BloqueR({ r }: { r: ComResultsResp }) {
  const respuestas = (r.summary?.respuestas as Array<{ name: string; respuesta: string }>) ?? [];
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-muted">
        Respuestas del curso ({Number(r.summary?.total ?? 0)})
      </p>
      {respuestas.length === 0 ? (
        <p className="text-xs text-faint">Todavía no hay respuestas.</p>
      ) : (
        <div className="max-h-72 space-y-2 overflow-auto">
          {respuestas
            .slice()
            .reverse()
            .map((p, i) => (
              <p key={i} className="text-xs leading-snug text-muted">
                <span className="font-semibold text-teal">{p.name.split(/\s+/)[0]}</span> · {p.respuesta}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

function CierreR({ r }: { r: ComResultsResp }) {
  const palabras = (r.summary?.palabras as Array<{ palabra: string; n: number }>) ?? [];
  if (!palabras.length) return <p className="text-xs text-faint">Todavía no hay palabras.</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {palabras.map((p) => (
        <span
          key={p.palabra}
          className="rounded-full border border-teal/30 bg-teal/10 px-2.5 py-1 text-xs text-foreground"
        >
          {p.palabra}
          {p.n > 1 && <span className="ml-1 text-teal">×{p.n}</span>}
        </span>
      ))}
    </div>
  );
}
