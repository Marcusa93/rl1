"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import {
  ABC_ACTIVITY,
  ABC_ITEM,
  ABC_SLUG,
  PASOS,
  SITUACIONES,
  TARJETAS,
  emptyAbcState,
  getTarjeta,
  type AbcState,
} from "@/lib/abc";
import { cn } from "@/lib/utils";

const SLUG = ABC_SLUG;
const STUCK_MIN = 10;

export default function AbcProfesorPage() {
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
          <h1 className="text-lg font-semibold">La IA no es Google · docente</h1>
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

type ParsedRow = { name: string; state: AbcState; updatedAt: number };

function Panel() {
  const { data } = useLive<{
    rows: { name: string; activity: string; item_key: string; payload: AbcState; updated_at: string }[];
  }>(`/api/session/${SLUG}/all-responses`, 2500);
  const [open, setOpen] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const parsed: ParsedRow[] = useMemo(() => {
    const rows = (data?.rows ?? []).filter((r) => r.activity === ABC_ACTIVITY && r.item_key === ABC_ITEM);
    return rows.map((r) => ({
      name: r.name,
      state: { ...emptyAbcState(), ...(r.payload ?? {}) } as AbcState,
      updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : 0,
    }));
  }, [data]);

  const total = parsed.length;
  const completados = parsed.filter((p) => p.state.completado).length;
  const usaronIA = parsed.filter((p) => p.state.resultado.trim()).length;
  const consultas = parsed.reduce((acc, p) => acc + (p.state.copilotoUsos ?? 0), 0);
  const trabados = parsed.filter(
    (p) => !p.state.completado && p.updatedAt > 0 && now - p.updatedAt > STUCK_MIN * 60000,
  ).length;

  const porPaso = PASOS.map((m) => ({ paso: m, n: parsed.filter((p) => p.state.paso === m.n).length }));
  const maxPaso = Math.max(1, ...porPaso.map((x) => x.n));
  const porSituacion = SITUACIONES.map((s) => ({ s, n: parsed.filter((p) => p.state.situaciones.includes(s.id)).length }));
  const porTarjeta = TARJETAS.map((t) => ({ t, n: parsed.filter((p) => p.state.tarjeta === t.id).length }));
  const aprendizajes = parsed.filter((p) => p.state.aprendi.trim());

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["nombre", "ocupacion", "situaciones", "negocio", "equipo", "estilo", "tarjeta", "subtarea", "completado", "aprendi"];
    const lines = parsed.map((p) => {
      const t = getTarjeta(p.state.tarjeta);
      return [
        esc(p.name),
        esc(p.state.ocupacion),
        esc(p.state.situaciones.join(" | ")),
        esc(p.state.negocio ?? ""),
        esc(p.state.equipo ?? ""),
        esc(p.state.estilo ?? ""),
        esc(t ? t.titulo : ""),
        esc(p.state.subtarea ?? ""),
        esc(p.state.completado ? "sí" : "no"),
        esc(p.state.aprendi),
      ].join(",");
    });
    const csv = "﻿" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `LaIAnoesGoogle-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function resetAll() {
    if (!confirm("Vaciar la clase: saca a todos los participantes y borra todo el trabajo. ¿Seguir?")) return;
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
            <span className="text-gradient font-mono text-sm font-bold">La IA no es Google · docente</span>
          </span>
          <span className="rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">{total} en sala</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 rounded-2xl border-gradient p-4">
          <p className="text-xs text-faint">Link para los participantes</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="break-all font-mono text-lg font-bold text-gradient">{origin ? `${origin}/abc` : "/abc"}</p>
            <button
              onClick={() => navigator.clipboard?.writeText(`${origin}/abc`)}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
            >
              Copiar
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="px-3 py-1.5 text-xs">⬇ Descargar (CSV)</Button>
            <Button variant="danger" onClick={resetAll} className="px-3 py-1.5 text-xs">Reiniciar clase</Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Participantes" value={total} />
          <Stat label="Terminaron" value={completados} />
          <Stat label="Usaron la IA" value={usaronIA} />
          <Stat label="Consultas copiloto" value={consultas} />
          <Stat label={`Trabados (>${STUCK_MIN}m)`} value={trabados} alert={trabados > 0} />
        </div>

        {total === 0 ? (
          <p className="rounded-2xl border border-line bg-panel/40 p-6 text-center text-sm text-muted">
            Todavía no entró nadie. Compartí el link de arriba.
          </p>
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-2">
              <section className="rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted">Ritmo del aula · en qué paso están</h2>
                <div className="space-y-1.5">
                  {porPaso.map(({ paso, n }) => (
                    <div key={paso.n} className="flex items-center gap-2">
                      <span className="w-20 shrink-0 truncate text-xs text-faint">{paso.short}</span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-2/70">
                        <div className="h-full rounded-full bg-gradient-to-r from-teal to-violet" style={{ width: `${(n / maxPaso) * 100}%` }} />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted">Qué les suena · qué tarjeta eligen</h2>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-violet">Situaciones</p>
                <div className="space-y-1">
                  {porSituacion.map(({ s, n }) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <span className="flex-1 truncate text-xs text-muted">{s.emoji} {s.label}</span>
                      <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-semibold text-teal">{n}</span>
                    </div>
                  ))}
                </div>
                <p className="mb-1 mt-3 text-xs font-bold uppercase tracking-wide text-violet">Tarjetas</p>
                <div className="space-y-1">
                  {porTarjeta.map(({ t, n }) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className="flex-1 truncate text-xs text-muted">{t.emoji} {t.titulo}</span>
                      <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-semibold text-teal">{n}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {aprendizajes.length > 0 && (
              <section className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-1 text-sm font-semibold text-muted">Lo que se llevan (para leer en el cierre)</h2>
                <p className="mb-3 text-xs text-faint">{aprendizajes.length} respuestas.</p>
                <div className="space-y-2">
                  {aprendizajes.map((p) => (
                    <div key={p.name} className="rounded-xl border border-line bg-ink-2/40 p-3 text-sm">
                      <span className="text-faint">{p.name}:</span> <span className="text-foreground">«{p.state.aprendi}»</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-muted">Participantes ({total}) · tocá un nombre para ver su recorrido</h2>
              <div className="space-y-2">
                {parsed
                  .slice()
                  .sort((a, b) => b.state.paso - a.state.paso)
                  .map((p) => {
                    const t = getTarjeta(p.state.tarjeta);
                    const mins = p.updatedAt ? Math.floor((now - p.updatedAt) / 60000) : null;
                    const stuck = !p.state.completado && mins !== null && mins >= STUCK_MIN;
                    const isOpen = open === p.name;
                    return (
                      <div key={p.name} className={cn("rounded-2xl border bg-panel/40 p-4 transition", stuck ? "border-amber-400/50" : "border-line")}>
                        <button onClick={() => setOpen(isOpen ? null : p.name)} className="flex w-full items-center justify-between gap-3 text-left">
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {p.name}
                              {stuck && <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-300">trabado</span>}
                            </p>
                            <p className="truncate text-xs text-muted">{p.state.ocupacion || "—"}{t ? ` · ${t.emoji} ${t.titulo}` : ""}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            {p.state.completado ? (
                              <span className="rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase text-teal">🎉 Terminó</span>
                            ) : (
                              <span className="text-xs text-faint">Paso {p.state.paso + 1}/{PASOS.length}</span>
                            )}
                            {mins !== null && <p className="mt-0.5 text-[11px] text-faint">{mins <= 0 ? "activo ahora" : `hace ${mins} min`}</p>}
                          </div>
                        </button>
                        <div className="mt-2 flex gap-1">
                          {PASOS.map((m) => (
                            <span key={m.n} className={cn("h-1.5 flex-1 rounded-full", m.n <= p.state.paso ? "bg-teal" : "bg-line")} />
                          ))}
                        </div>
                        {isOpen && <Detalle p={p} />}
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

function Detalle({ p }: { p: ParsedRow }) {
  const s = p.state;
  const t = getTarjeta(s.tarjeta);
  const sit = s.situaciones.map((id) => SITUACIONES.find((x) => x.id === id)?.label).filter(Boolean).join("; ");
  return (
    <div className="mt-3 space-y-2 border-t border-line/60 pt-3 text-sm">
      {s.ocupacion && <Line k="Hace" v={s.ocupacion} />}
      {sit && <Line k="Le suena" v={sit} />}
      {(s.negocio || s.equipo || s.estilo) && (
        <Line k="Perfil" v={[s.negocio, s.equipo, s.estilo].filter(Boolean).join(" · ")} />
      )}
      {t && <Line k="Caso" v={`${t.emoji} ${t.titulo}${s.subtarea ? ` · ${s.subtarea}` : ""}`} />}
      {s.detalle && <Line k="Contó" v={s.detalle} />}
      {s.resultado && (
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">Lo que generó la IA</p>
          <p className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted">{s.resultado}</p>
        </div>
      )}
      {s.aprendi && <Line k="Se lleva" v={s.aprendi} />}
      {!s.ocupacion && !s.aprendi && <p className="text-xs text-faint">Entró pero todavía no cargó nada.</p>}
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
    <div className={cn("rounded-2xl border bg-panel/40 p-3 text-center", alert ? "border-amber-400/50" : "border-line")}>
      <p className={cn("text-2xl font-bold", alert ? "text-amber-300" : "text-gradient")}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
