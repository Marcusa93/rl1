"use client";

import { LogoRL1 } from "@/components/brand/logo-rl1";
import { useLive } from "@/components/use-live";
import {
  CASO_FERNANDEZ_CONSIGNA,
  COTIO_VARS,
  DEFAULT_SLUG,
  DIAGNOSTICO_CARDS,
  VF_ITEMS,
} from "@/lib/constants";
import type { SessionRow } from "@/lib/types";
import { cn, pct } from "@/lib/utils";

type SessionResp = { session: SessionRow; participants: number };
type ResultsResp = {
  activity: string;
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
  config: Record<string, unknown>;
};
const SLUG = DEFAULT_SLUG;

export default function PantallaPage() {
  const { data: s } = useLive<SessionResp>(`/api/session/${SLUG}`, 2000);
  const { data: r } = useLive<ResultsResp>(`/api/session/${SLUG}/results`, 2000);

  const activity = s?.session.current_activity ?? "lobby";

  return (
    <div className="bg-grid relative min-h-dvh overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5">
        <LogoRL1 size={34} />
        <span className="rounded-full bg-teal/15 px-4 py-1.5 text-sm font-medium text-teal">
          {s?.participants ?? 0} participantes
        </span>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col px-8 pb-10">
        {activity === "lobby" && <Lobby count={s?.participants ?? 0} />}
        {activity === "diagnostico" && <Diagnostico r={r} />}
        {activity === "verdadero_falso" && <VF r={r} />}
        {activity === "cotio" && <Cotio r={r} />}
        {activity === "caso" && <Caso r={r} />}
        {activity === "tarea" && <Tarea r={r} />}
      </main>
    </div>
  );
}

function Lobby({ count }: { count: number }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shown = origin.replace(/^https?:\/\//, "");
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-faint">Entrá desde tu celular</p>
      <p className="text-gradient mt-4 font-mono text-6xl font-bold tracking-tight break-all">
        {shown || "…"}
      </p>
      <p className="mt-4 text-lg text-muted">Abrí el link, poné tu nombre y listo.</p>
      <div className="mt-10 flex items-center gap-3 text-muted">
        <span className="size-3 animate-pulse rounded-full bg-teal" />
        <span className="text-2xl font-semibold">{count}</span> conectados
      </div>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-4xl font-bold tracking-tight">{children}</h1>;
}

function Diagnostico({ r }: { r: ResultsResp | null }) {
  const counts = (r?.summary?.counts as Record<string, number>) ?? {};
  const total = Number(r?.responded ?? 0);
  const max = Math.max(1, ...Object.values(counts));
  const rows = [...DIAGNOSTICO_CARDS].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  return (
    <div className="rise">
      <Title>¿Qué tareas jurídicas ya hicieron con IA?</Title>
      <div className="space-y-2.5">
        {rows.map((c) => {
          const n = counts[c.id] ?? 0;
          return (
            <div key={c.id} className="flex items-center gap-4">
              <div className="w-80 shrink-0 text-right text-base">
                <span className="mr-2">{c.emoji}</span>
                {c.label}
              </div>
              <div className="h-8 flex-1 overflow-hidden rounded-lg bg-panel/50">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-teal via-cyan to-violet px-3 text-sm font-bold text-ink transition-all duration-700"
                  style={{ width: `${(n / max) * 100}%` }}
                >
                  {n > 0 && n}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-faint">{total} respuestas</p>
    </div>
  );
}

function VF({ r }: { r: ResultsResp | null }) {
  const idx = Number(r?.config?.vf_index ?? 0);
  const revealed = Boolean(r?.config?.revealed);
  const item = VF_ITEMS[idx] ?? VF_ITEMS[0];
  const per = (r?.summary?.perIndex as Record<string, { true: number; false: number }>) ?? {};
  const c = per[String(idx)] ?? { true: 0, false: 0 };
  const total = c.true + c.false;

  return (
    <div className="rise text-center">
      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-faint">
        Afirmación {idx + 1}/{VF_ITEMS.length}
      </p>
      <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-snug">{item.statement}</h1>

      <div className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6">
        <VFBar label="Verdadero" n={c.true} total={total} ok={revealed && item.answer === true} dim={revealed && item.answer !== true} />
        <VFBar label="Falso" n={c.false} total={total} ok={revealed && item.answer === false} dim={revealed && item.answer !== false} />
      </div>

      {revealed && (
        <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-teal/40 bg-teal/10 p-5">
          <p className="text-xl font-bold text-teal">{item.answer ? "VERDADERO" : "FALSO"}</p>
          <p className="mt-2 text-muted">{item.explain}</p>
        </div>
      )}
    </div>
  );
}

function VFBar({ label, n, total, ok, dim }: { label: string; n: number; total: number; ok: boolean; dim: boolean }) {
  return (
    <div className={cn("rounded-2xl border p-6 transition", ok ? "border-teal glow-teal" : "border-line", dim && "opacity-40")}>
      <p className="text-2xl font-semibold">{label}</p>
      <p className="text-gradient mt-2 text-6xl font-bold">{n}</p>
      <p className="mt-1 text-sm text-faint">{pct(n, total)}%</p>
    </div>
  );
}

function Cotio({ r }: { r: ResultsResp | null }) {
  const s = r?.summary ?? {};
  const avgByVar = (s.avgByVar as Record<string, number>) ?? {};
  const labels: Record<string, string> = {
    contexto: "Contexto",
    objeto: "Objeto",
    tarea: "Tarea",
    input: "Input",
    output: "Output",
  };
  return (
    <div className="rise">
      <Title>Optimizador COTIO — pulso del grupo</Title>
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <p className="text-gradient text-7xl font-bold">{Number(s.avgOverall ?? 0)}</p>
          <p className="mt-1 text-sm text-faint">completitud promedio</p>
          <p className="mt-4 text-2xl font-semibold">{Number(s.analyzed ?? 0)}</p>
          <p className="text-sm text-faint">prompts analizados</p>
          {Number(s.confidential ?? 0) > 0 && (
            <p className="mt-4 rounded-lg bg-magenta/15 px-3 py-1.5 text-sm text-magenta">
              ⚠️ {Number(s.confidential)} con posibles datos sensibles
            </p>
          )}
        </div>
        <div className="space-y-3">
          {Object.keys(labels).map((k) => {
            const v = avgByVar[k] ?? 0;
            return (
              <div key={k}>
                <div className="flex justify-between text-lg">
                  <span>{labels[k]}</span>
                  <span className="text-teal">{v}</span>
                </div>
                <div className="mt-1 h-4 overflow-hidden rounded-full bg-panel/50">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-700"
                    style={{ width: `${v}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Caso({ r }: { r: ResultsResp | null }) {
  const s = r?.summary ?? {};
  return (
    <div className="rise">
      <Title>Ejercicio: el caso Fernández</Title>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="glass rounded-2xl p-6">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">Consigna</p>
          <p className="mt-2 text-xl leading-relaxed text-muted">{CASO_FERNANDEZ_CONSIGNA}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {COTIO_VARS.map((v) => (
              <span key={v.key} className="rounded-lg border border-line bg-panel/40 px-3 py-1.5 text-base">
                <b className="text-teal">{v.letter}</b> <span className="text-muted">{v.name}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-6 text-center">
          <p className="text-gradient text-7xl font-bold">{Number(s.done ?? 0)}</p>
          <p className="mt-1 text-sm text-faint">trabajando en Claude</p>
        </div>
      </div>
    </div>
  );
}

function Tarea({ r }: { r: ResultsResp | null }) {
  const s = r?.summary ?? {};
  const casos = (s.casos as Array<{ name: string; caso: string; herramienta: string }>) ?? [];
  return (
    <div className="rise">
      <Title>Tarea bisagra 🔗</Title>
      <p className="text-2xl text-muted">
        <span className="text-gradient font-bold">{Number(s.comprometidos ?? 0)}</span> se
        comprometieron a traer un caso real a la Clase 2.
      </p>
      <div className="mt-6 grid max-h-[60vh] gap-3 overflow-auto md:grid-cols-2">
        {casos.map((c, i) => (
          <div key={i} className="glass rounded-xl p-4">
            <p className="text-sm font-semibold text-teal">{c.name}</p>
            <p className="mt-1 text-sm text-muted">{c.caso}</p>
            {c.herramienta && <p className="mt-1 text-xs text-faint">🛠 {c.herramienta}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
