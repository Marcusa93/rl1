"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import {
  CASOS,
  MOMENTOS,
  FICHA_CAMPOS,
  EXP_ACTIVITY,
  EXP_ITEM,
  EXP_SLUG,
  emptyState,
  getCaso,
  type ExpedienteState,
} from "@/lib/expediente";
import { cn } from "@/lib/utils";

const SLUG = EXP_SLUG;
const STUCK_MIN = 8;

export default function ExpedienteProfesorPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/teacher/me")
      .then((r) => r.json())
      .then((d) => setAuthed(d.teacher))
      .catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/teacher/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (res.ok) setAuthed(true);
    else setErr("Clave incorrecta");
  }

  if (authed === null)
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </main>
    );

  if (!authed)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <form onSubmit={login} className="glass w-full max-w-sm rounded-2xl p-6 rise">
          <div className="mb-5 flex justify-center">
            <LogoRL1 size={38} />
          </div>
          <h1 className="text-lg font-semibold">Expediente Vivo · docente</h1>
          <p className="mt-1 text-sm text-muted">Ingresá la clave para ver el avance del aula.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="clave"
            autoFocus
            className="mt-4 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 outline-none placeholder:text-faint focus:border-teal/60"
          />
          {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
          <Button type="submit" disabled={busy} className="mt-4 w-full">
            {busy ? <Spinner /> : "Entrar"}
          </Button>
        </form>
      </main>
    );

  return <Panel />;
}

type ParsedRow = { name: string; state: ExpedienteState; updatedAt: number };

function Panel() {
  const { data } = useLive<{
    rows: { name: string; activity: string; item_key: string; payload: ExpedienteState; updated_at: string }[];
  }>(`/api/session/${SLUG}/all-responses`, 2500);
  const [open, setOpen] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const parsed: ParsedRow[] = useMemo(() => {
    const rows = (data?.rows ?? []).filter(
      (r) => r.activity === EXP_ACTIVITY && r.item_key === EXP_ITEM,
    );
    return rows.map((r) => ({
      name: r.name,
      state: { ...emptyState(), ...(r.payload ?? {}) } as ExpedienteState,
      updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : 0,
    }));
  }, [data]);

  const total = parsed.length;
  const completados = parsed.filter((p) => p.state.completado).length;

  const porMomento = MOMENTOS.map((m) => ({
    momento: m,
    n: parsed.filter((p) => p.state.momento === m.n).length,
  }));
  const maxMomento = Math.max(1, ...porMomento.map((x) => x.n));

  const porCaso = CASOS.map((c) => ({
    caso: c,
    n: parsed.filter((p) => p.state.caso === c.id).length,
  }));

  const hipPorCaso = CASOS.map((c) => {
    const enCaso = parsed.filter((p) => p.state.caso === c.id);
    return {
      caso: c,
      total: enCaso.length,
      hip: c.hipotesis.map((h) => ({ h, n: enCaso.filter((p) => p.state.estrategia === h.id).length })),
    };
  }).filter((x) => x.total > 0);

  // Alucinaciones detectadas (por caso) — para la puesta en común
  const alucPorCaso = CASOS.map((c) => {
    const enCaso = parsed.filter((p) => p.state.caso === c.id);
    return {
      caso: c,
      total: enCaso.length,
      riesgos: c.riesgosIA.map((r, i) => ({
        r,
        n: enCaso.filter((p) => p.state.alucinaciones.includes(String(i))).length,
      })),
    };
  }).filter((x) => x.total > 0);

  const trabados = parsed.filter(
    (p) => !p.state.completado && p.updatedAt > 0 && now - p.updatedAt > STUCK_MIN * 60000,
  ).length;

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "nombre",
      "caso",
      "momento",
      "completado",
      "via_elegida",
      "alucinaciones_detectadas",
      ...FICHA_CAMPOS.map((c) => c.key),
    ];
    const lines = parsed.map((p) => {
      const caso = getCaso(p.state.caso);
      const hip = caso?.hipotesis.find((h) => h.id === p.state.estrategia);
      const aluc = caso
        ? p.state.alucinaciones.map((i) => caso.riesgosIA[Number(i)]).filter(Boolean).join(" | ")
        : "";
      return [
        esc(p.name),
        esc(caso ? `${caso.area} — ${caso.caratula}` : ""),
        esc(p.state.momento),
        esc(p.state.completado ? "sí" : "no"),
        esc(hip?.titulo ?? ""),
        esc(aluc),
        ...FICHA_CAMPOS.map((c) => esc(p.state.ficha[c.key])),
      ].join(",");
    });
    const csv = "﻿" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `ExpedienteVivo-fichas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function resetAll() {
    if (!confirm("Vaciar el laboratorio: saca a todos los participantes y borra todo el trabajo. ¿Seguir?"))
      return;
    await fetch(`/api/session/${SLUG}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }

  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2">
            <LogoRL1 size={26} wordmark={false} />
            <span className="text-gradient font-mono text-sm font-bold">Expediente Vivo · docente</span>
          </span>
          <span className="rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">
            {total} en sala
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 rounded-2xl border-gradient p-4">
          <p className="text-xs text-faint">Link para los alumnos (sin código)</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="break-all font-mono text-lg font-bold text-gradient">
              {origin ? `${origin}/expediente` : "/expediente"}
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(`${origin}/expediente`)}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
            >
              Copiar
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="px-3 py-1.5 text-xs">
              ⬇ Descargar fichas (CSV)
            </Button>
            <Button variant="danger" onClick={resetAll} className="px-3 py-1.5 text-xs">
              Reiniciar laboratorio
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Participantes" value={total} />
          <Stat label="Terminaron" value={completados} />
          <Stat label={`Trabados (>${STUCK_MIN}m)`} value={trabados} alert={trabados > 0} />
          {porCaso.map((c) => (
            <Stat key={c.caso.id} label={`${c.caso.emoji} ${c.caso.area}`} value={c.n} />
          ))}
        </div>

        {total === 0 ? (
          <p className="rounded-2xl border border-line bg-panel/40 p-6 text-center text-sm text-muted">
            Todavía no entró nadie. Compartí el link de arriba.
          </p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Ritmo */}
              <section className="rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted">Ritmo del aula · en qué momento están</h2>
                <div className="space-y-1.5">
                  {porMomento.map(({ momento, n }) => (
                    <div key={momento.n} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 truncate text-xs text-faint">
                        <span className="font-mono">{momento.n}</span> {momento.short}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-2/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal to-violet transition-all"
                          style={{ width: `${(n / maxMomento) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Hipótesis por caso */}
              <section className="rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted">Estrategia elegida · por caso</h2>
                {hipPorCaso.length === 0 ? (
                  <p className="text-xs text-faint">Todavía nadie eligió estrategia.</p>
                ) : (
                  <div className="space-y-4">
                    {hipPorCaso.map(({ caso, hip }) => (
                      <div key={caso.id}>
                        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-violet">
                          {caso.emoji} {caso.area}
                        </p>
                        <div className="space-y-1">
                          {hip.map(({ h, n }) => (
                            <div key={h.id} className="flex items-center gap-2">
                              <span className="flex-1 truncate text-xs text-muted" title={h.titulo}>
                                {h.titulo}
                              </span>
                              <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-semibold text-teal">
                                {n}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Alucinaciones detectadas */}
            {alucPorCaso.length > 0 && (
              <section className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-1 text-sm font-semibold text-muted">
                  Alucinaciones / riesgos que el aula detectó
                </h2>
                <p className="mb-3 text-xs text-faint">Cuántos marcaron cada error de la IA. Ideal para abrir el debate.</p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {alucPorCaso.map(({ caso, riesgos }) => (
                    <div key={caso.id}>
                      <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-violet">
                        {caso.emoji} {caso.area}
                      </p>
                      <div className="space-y-1.5">
                        {riesgos.map(({ r, n }, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="shrink-0 rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[11px] font-semibold text-amber-300">
                              {n}
                            </span>
                            <span className="text-[11px] leading-snug text-muted">{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Alumnos */}
            <section className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-muted">
                Alumnos ({total}) · tocá un nombre para ver su trabajo
              </h2>
              <div className="space-y-2">
                {parsed
                  .slice()
                  .sort((a, b) => b.state.momento - a.state.momento)
                  .map((p) => {
                    const caso = getCaso(p.state.caso);
                    const hip = caso?.hipotesis.find((h) => h.id === p.state.estrategia);
                    const mins = p.updatedAt ? Math.floor((now - p.updatedAt) / 60000) : null;
                    const stuck = !p.state.completado && mins !== null && mins >= STUCK_MIN;
                    const isOpen = open === p.name;
                    return (
                      <div
                        key={p.name}
                        className={cn(
                          "rounded-2xl border bg-panel/40 p-4 transition",
                          stuck ? "border-amber-400/50" : "border-line",
                        )}
                      >
                        <button
                          onClick={() => setOpen(isOpen ? null : p.name)}
                          className="flex w-full items-center justify-between gap-3 text-left"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {p.name}
                              {stuck && (
                                <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">
                                  trabado
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted">
                              {caso ? `${caso.emoji} ${caso.area} — ${caso.caratula}` : "Sin caso elegido"}
                              {hip ? ` · ${hip.titulo}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            {p.state.completado ? (
                              <span className="rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase text-teal">
                                ✓ Terminó
                              </span>
                            ) : (
                              <span className="text-xs text-faint">Momento {p.state.momento}/4</span>
                            )}
                            {mins !== null && (
                              <p className="mt-0.5 text-[11px] text-faint">
                                {mins <= 0 ? "activo ahora" : `hace ${mins} min`}
                              </p>
                            )}
                          </div>
                        </button>

                        <div className="mt-2 flex gap-1">
                          {MOMENTOS.map((m) => (
                            <span
                              key={m.n}
                              className={cn(
                                "h-1.5 flex-1 rounded-full",
                                m.n <= p.state.momento ? "bg-teal" : "bg-line",
                              )}
                            />
                          ))}
                        </div>

                        {isOpen && <StudentDetail p={p} />}
                      </div>
                    );
                  })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StudentDetail({ p }: { p: ParsedRow }) {
  const s = p.state;
  const caso = getCaso(s.caso);
  const aluc = caso ? s.alucinaciones.map((i) => caso.riesgosIA[Number(i)]).filter(Boolean) : [];
  return (
    <div className="mt-3 space-y-3 border-t border-line/60 pt-3 text-sm">
      {s.diagnosticoNota && (
        <Block titulo="Diagnóstico (momento 2)">
          <p className="text-muted">{s.diagnosticoNota}</p>
        </Block>
      )}
      {aluc.length > 0 && (
        <Block titulo="Alucinaciones detectadas (momento 3)">
          <ul className="list-disc space-y-0.5 pl-5 text-muted">
            {aluc.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          {s.alucinacionPorque && <Line k="Por qué la descarta" v={s.alucinacionPorque} />}
        </Block>
      )}
      {FICHA_CAMPOS.some((c) => s.ficha[c.key]) && (
        <Block titulo="Su decisión (momento 4)">
          {FICHA_CAMPOS.map((c) =>
            s.ficha[c.key] ? <Line key={c.key} k={c.label} v={s.ficha[c.key]} /> : null,
          )}
        </Block>
      )}
      {!s.diagnosticoNota && aluc.length === 0 && !s.estrategia && (
        <p className="text-xs text-faint">
          {caso ? "Eligió caso pero todavía no cargó nada." : "Todavía no eligió caso."}
        </p>
      )}
    </div>
  );
}

function Block({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">{titulo}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <p className="text-muted">
      <span className="text-faint">{k}:</span> {v}
    </p>
  );
}

function Stat({ label, value, alert }: { label: string; value: number; alert?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-panel/40 p-3 text-center",
        alert ? "border-amber-400/50" : "border-line",
      )}
    >
      <p className={cn("text-2xl font-bold", alert ? "text-amber-300" : "text-gradient")}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
