"use client";

import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Markdown } from "@/components/markdown";
import { useLive } from "@/components/use-live";
import { useComResults, type ComResultsResp } from "@/components/comercial/results";
import {
  COM_ENCUESTA,
  COM_POLL,
  COM_SLUG,
  COM_SUBTITLE,
  COM_TITLE,
  COM_USOS,
  getBloque,
} from "@/lib/comercial";
import type { SessionRow } from "@/lib/types";

type SessionResp = { session: SessionRow; participants: number };

/** Proyector del aula: lo que ve el curso. Solo esta pantalla y el panel docente piden agregados. */
export default function PantallaEmpresasPage() {
  const { data: s } = useLive<SessionResp>(`/api/session/${COM_SLUG}`, COM_POLL.pantalla);
  const activity = s?.session.current_activity ?? "lobby";
  const { data: r } = useComResults(activity, COM_POLL.pantalla);
  const bloque = getBloque(activity);

  return (
    <div className="bg-grid relative min-h-dvh overflow-hidden">
      <header className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-4">
          <LogoRL1 size={34} />
          <div>
            <p className="text-sm font-semibold">{COM_TITLE}</p>
            <p className="text-xs text-faint">{COM_SUBTITLE}</p>
          </div>
        </div>
        <span className="rounded-full bg-teal/15 px-4 py-1.5 text-sm font-medium text-teal">
          {s?.participants ?? 0} en clase
        </span>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col px-8 pb-10">
        {activity === "lobby" && <Lobby count={s?.participants ?? 0} />}
        {activity === "emp_encuesta" && <Encuesta r={r} />}
        {activity === "emp_usos" && <Usos r={r} />}
        {bloque && <Bloque bloque={bloque} r={r} />}
        {activity === "emp_cierre" && <Cierre r={r} />}
      </main>
    </div>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return <h1 className="mb-6 text-4xl font-bold tracking-tight">{children}</h1>;
}

function Lobby({ count }: { count: number }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const shown = `${origin.replace(/^https?:\/\//, "")}/empresas`;
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

function BigBar({ label, emoji, n, max }: { label: string; emoji?: string; n: number; max: number }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-72 shrink-0 text-right text-base">
        {emoji && <span className="mr-2">{emoji}</span>}
        {label}
      </div>
      <div className="h-8 flex-1 overflow-hidden rounded-lg bg-panel/50">
        <div
          className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-teal via-cyan to-violet px-3 text-sm font-bold text-ink transition-all duration-700"
          style={{ width: `${(n / Math.max(1, max)) * 100}%` }}
        >
          {n > 0 && n}
        </div>
      </div>
    </div>
  );
}

function Encuesta({ r }: { r: ComResultsResp | null }) {
  const byQ = (r?.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="rise">
      <Title>Encuesta relámpago</Title>
      <div className="grid gap-7 lg:grid-cols-2">
        {COM_ENCUESTA.map((q) => {
          const counts = byQ[q.id] ?? {};
          const max = Math.max(1, ...Object.values(counts));
          return (
            <div key={q.id}>
              <p className="mb-3 text-lg font-semibold text-muted">{q.q}</p>
              <div className="space-y-2">
                {q.options.map((o) => (
                  <div key={o.id} className="flex items-center gap-3">
                    <div className="w-52 shrink-0 text-right text-sm">
                      <span className="mr-1.5">{o.emoji}</span>
                      {o.label}
                    </div>
                    <div className="h-6 flex-1 overflow-hidden rounded-lg bg-panel/50">
                      <div
                        className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-teal via-cyan to-violet px-2 text-xs font-bold text-ink transition-all duration-700"
                        style={{ width: `${((counts[o.id] ?? 0) / max) * 100}%` }}
                      >
                        {(counts[o.id] ?? 0) > 0 && counts[o.id]}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-6 text-center text-sm text-faint">{Number(r?.responded ?? 0)} respondieron</p>
    </div>
  );
}

function Usos({ r }: { r: ComResultsResp | null }) {
  const counts = (r?.summary?.counts as Record<string, number>) ?? {};
  const max = Math.max(1, ...Object.values(counts));
  const rows = [...COM_USOS].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  return (
    <div className="rise">
      <Title>¿Dónde ya está la IA en una empresa?</Title>
      <div className="space-y-2.5">
        {rows.map((c) => (
          <BigBar key={c.id} label={c.label} emoji={c.emoji} n={counts[c.id] ?? 0} max={max} />
        ))}
      </div>
      <p className="mt-6 text-center text-sm text-faint">{Number(r?.responded ?? 0)} respondieron</p>
    </div>
  );
}

function Bloque({
  bloque,
  r,
}: {
  bloque: NonNullable<ReturnType<typeof getBloque>>;
  r: ComResultsResp | null;
}) {
  const respuestas = (r?.summary?.respuestas as Array<{ name: string; respuesta: string }>) ?? [];
  return (
    <div className="rise">
      <p className="mb-2 font-mono text-sm uppercase tracking-widest text-faint">Bloque {bloque.n}</p>
      <Title>{bloque.titulo}</Title>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="glass rounded-2xl p-6">
            <Markdown text={bloque.cuerpoMd} />
          </div>
          <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal">La pregunta del abogado</p>
            <p className="mt-1 text-lg leading-relaxed">{bloque.pregunta}</p>
          </div>
        </div>
        <div className="glass max-h-[62vh] overflow-auto rounded-2xl p-5">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-teal">
            Respuestas del curso ({Number(r?.summary?.total ?? 0)})
          </p>
          {respuestas.length === 0 ? (
            <p className="text-sm text-faint">Todavía no hay respuestas.</p>
          ) : (
            <div className="space-y-2.5">
              {respuestas
                .slice()
                .reverse()
                .map((p, i) => (
                  <p key={i} className="text-sm leading-snug text-muted">
                    <span className="font-semibold text-teal">{p.name.split(/\s+/)[0]}</span> · {p.respuesta}
                  </p>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Cierre({ r }: { r: ComResultsResp | null }) {
  const palabras = (r?.summary?.palabras as Array<{ palabra: string; n: number }>) ?? [];
  const max = Math.max(1, ...palabras.map((p) => p.n));
  return (
    <div className="rise">
      <Title>Una palabra que se llevan</Title>
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 py-6">
        {palabras.length === 0 ? (
          <p className="text-lg text-faint">Esperando las primeras palabras…</p>
        ) : (
          palabras.map((p) => {
            const escala = 1 + (p.n / max) * 1.6;
            return (
              <span
                key={p.palabra}
                className="font-semibold text-foreground transition-all duration-700"
                style={{ fontSize: `${escala}rem`, opacity: 0.55 + (p.n / max) * 0.45 }}
              >
                {p.palabra}
                {p.n > 1 && <span className="ml-1 text-base text-teal">×{p.n}</span>}
              </span>
            );
          })
        )}
      </div>
      <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-teal/40 bg-teal/10 p-5 text-center">
        <p className="text-lg font-semibold text-teal">📘 El glosario queda para descargar</p>
        <p className="mt-1 text-muted">
          En el celular, en esta última pantalla: los conceptos de hoy (scoring, pricing, compliance,
          sesgo, gobernanza…) definidos en criollo, en PDF.
        </p>
      </div>
    </div>
  );
}
