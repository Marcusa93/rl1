"use client";

import { useLive } from "@/components/use-live";
import { CASO_FERNANDEZ_CONSIGNA, DIAGNOSTICO_CARDS, ENCUESTA_QUESTIONS, VF_ITEMS } from "@/lib/constants";
import type { ActivityConfig, ActivityKey } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

type ResultsResp = {
  activity: string;
  participants: number;
  responded: number;
  responders: string[];
  summary: Record<string, unknown>;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "·";
}

/** Resultados agregados en vivo, visibles en la pantalla del alumno y del docente. */
export function LiveResults({
  slug,
  activity,
  config,
}: {
  slug: string;
  activity: ActivityKey;
  config?: ActivityConfig | null;
}) {
  const { data: r } = useLive<ResultsResp>(`/api/session/${slug}/results?activity=${activity}`, 1200);
  if (activity === "lobby" || activity === "memoria") return null;

  const responded = r?.responded ?? 0;
  const participants = Math.max(r?.participants ?? 0, responded);
  const ratio = participants ? Math.round((responded / participants) * 100) : 0;

  return (
    <section className="mt-6">
      <div className="mb-2 flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        <h3 className="text-sm font-semibold text-muted">Resultados en vivo</h3>
        {r && (
          <span className="ml-auto text-xs text-faint">
            <b className="text-teal">{responded}</b>/{participants} participando
          </span>
        )}
      </div>
      {r && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-ink-2/70">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-500"
            style={{ width: `${ratio}%` }}
          />
        </div>
      )}
      {r && r.responders.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {r.responders.map((n) => (
            <span
              key={n}
              title={n}
              className="rise inline-flex items-center gap-1.5 rounded-full bg-gradient-to-br from-teal/15 to-violet/15 py-1 pl-1 pr-2.5 text-xs text-foreground ring-1 ring-teal/30"
            >
              <span className="inline-flex size-5 items-center justify-center rounded-full bg-teal/30 text-[9px] font-bold text-teal">
                {initials(n)}
              </span>
              {n.split(/\s+/)[0]}
            </span>
          ))}
        </div>
      )}
      <div className="glass rounded-2xl p-4">
        {!r ? (
          <p className="text-sm text-faint">Cargando…</p>
        ) : activity === "encuesta" ? (
          <EncuestaR r={r} />
        ) : activity === "diagnostico" ? (
          <Diag r={r} />
        ) : activity === "verdadero_falso" ? (
          <VF r={r} config={config} />
        ) : activity === "cotio" ? (
          <Cotio r={r} />
        ) : activity === "chat" ? (
          <div className="flex items-center gap-3">
            <p className="text-gradient text-4xl font-bold">{Number((r.summary?.usando as number) ?? 0)}</p>
            <p className="text-sm font-medium">están usando el asistente IA</p>
          </div>
        ) : activity === "caso" ? (
          <Caso r={r} />
        ) : activity === "tarea" ? (
          <Tarea r={r} />
        ) : null}
      </div>
    </section>
  );
}

function EncuestaR({ r }: { r: ResultsResp }) {
  const byQ = (r.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="space-y-4">
      {ENCUESTA_QUESTIONS.map((q) => {
        const counts = byQ[q.id] ?? {};
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="mb-1.5 text-xs font-semibold text-muted">{q.q}</p>
            <div className="space-y-1.5">
              {q.options.map((o) => {
                const n = counts[o.id] ?? 0;
                return (
                  <div key={o.id} className="flex items-center gap-2 text-sm">
                    <div className="w-32 shrink-0 text-xs">
                      <span className="mr-1">{o.emoji}</span>
                      {o.label}
                    </div>
                    <div className="h-5 flex-1 overflow-hidden rounded bg-ink-2/70">
                      <div
                        className="flex h-full items-center justify-end rounded bg-gradient-to-r from-teal via-cyan to-violet px-2 text-[11px] font-bold text-ink transition-all duration-500"
                        style={{ width: `${(n / max) * 100}%` }}
                      >
                        {n > 0 && n}
                      </div>
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

function Diag({ r }: { r: ResultsResp }) {
  const counts = (r.summary?.counts as Record<string, number>) ?? {};
  const max = Math.max(1, ...Object.values(counts));
  const rows = [...DIAGNOSTICO_CARDS].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  return (
    <div className="space-y-2">
      {rows.map((c) => {
        const n = counts[c.id] ?? 0;
        return (
          <div key={c.id} className="flex items-center gap-2 text-sm">
            <div className="w-40 shrink-0 truncate text-right text-xs sm:w-52">
              <span className="mr-1">{c.emoji}</span>
              {c.label}
            </div>
            <div className="h-5 flex-1 overflow-hidden rounded bg-ink-2/70">
              <div
                className="flex h-full items-center justify-end rounded bg-gradient-to-r from-teal via-cyan to-violet px-2 text-[11px] font-bold text-ink transition-all duration-500"
                style={{ width: `${(n / max) * 100}%` }}
              >
                {n > 0 && n}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VF({ r, config }: { r: ResultsResp; config?: ActivityConfig | null }) {
  const idx = Number(config?.vf_index ?? 0);
  const item = VF_ITEMS[idx] ?? VF_ITEMS[0];
  const per = (r.summary?.perIndex as Record<string, { true: number; false: number }>) ?? {};
  const c = per[String(idx)] ?? { true: 0, false: 0 };
  const total = c.true + c.false;
  const revealed = Boolean(config?.revealed);
  return (
    <div className="grid grid-cols-2 gap-3 text-center">
      <Cell label="Verdadero" n={c.true} total={total} ok={revealed && item.answer === true} />
      <Cell label="Falso" n={c.false} total={total} ok={revealed && item.answer === false} />
    </div>
  );
}

function Cell({ label, n, total, ok }: { label: string; n: number; total: number; ok: boolean }) {
  return (
    <div className={cn("rounded-xl border p-3", ok ? "border-teal bg-teal/10" : "border-line bg-ink-2/50")}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-gradient text-3xl font-bold">{n}</p>
      <p className="text-xs text-faint">{pct(n, total)}%</p>
    </div>
  );
}

function Cotio({ r }: { r: ResultsResp }) {
  const s = r.summary ?? {};
  const avgByVar = (s.avgByVar as Record<string, number>) ?? {};
  const labels: Record<string, string> = {
    contexto: "Contexto",
    objeto: "Objeto",
    tarea: "Tarea",
    input: "Input",
    output: "Output",
  };
  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        <div className="text-center">
          <p className="text-gradient text-3xl font-bold">{Number(s.avgOverall ?? 0)}</p>
          <p className="text-[11px] text-faint">completitud prom.</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{Number(s.analyzed ?? 0)}</p>
          <p className="text-[11px] text-faint">prompts</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {Object.keys(labels).map((k) => {
          const v = avgByVar[k] ?? 0;
          return (
            <div key={k} className="flex items-center gap-2 text-xs">
              <span className="w-16 shrink-0">{labels[k]}</span>
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink-2/70">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-500"
                  style={{ width: `${v}%` }}
                />
              </div>
              <span className="w-7 text-right text-teal">{v}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Caso({ r }: { r: ResultsResp }) {
  const s = r.summary ?? {};
  const drafts = (s.drafts as Array<{ name: string; objeto: string; output: string }>) ?? [];
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <p className="text-gradient text-3xl font-bold">{drafts.length}</p>
        <p className="text-sm font-medium">borradores generados por el grupo</p>
      </div>
      {drafts.length === 0 ? (
        <p className="text-xs text-faint">{CASO_FERNANDEZ_CONSIGNA.slice(0, 80)}…</p>
      ) : (
        <div className="space-y-2">
          {drafts.map((d, i) => (
            <details key={i} className="rounded-xl border border-line bg-ink-2/50 p-3">
              <summary className="cursor-pointer text-sm">
                <span className="font-semibold text-teal">{d.name}</span>
                {d.objeto && <span className="text-faint"> · {d.objeto.slice(0, 60)}</span>}
              </summary>
              <p className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground">
                {d.output}
              </p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

function Tarea({ r }: { r: ResultsResp }) {
  const s = r.summary ?? {};
  return (
    <div className="flex items-center gap-3">
      <p className="text-gradient text-4xl font-bold">{Number(s.comprometidos ?? 0)}</p>
      <p className="text-sm font-medium">se comprometieron a traer un caso real a la Clase 2 🔗</p>
    </div>
  );
}
