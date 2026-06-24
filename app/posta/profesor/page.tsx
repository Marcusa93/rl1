"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import {
  CASOS_EJEMPLO,
  ESTACIONES,
  POSTA_ACTIVITY,
  POSTA_ITEM,
  POSTA_SLUG,
  emptyPostaState,
  getEjemplo,
  type PostaState,
} from "@/lib/posta";
import { cn } from "@/lib/utils";

const SLUG = POSTA_SLUG;
const STUCK_MIN = 8;

export default function PostaProfesorPage() {
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
          <h1 className="text-lg font-semibold">La Posta · docente</h1>
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

type ParsedRow = { name: string; state: PostaState; updatedAt: number };

function Panel() {
  const { data } = useLive<{
    rows: { name: string; activity: string; item_key: string; payload: PostaState; updated_at: string }[];
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
      (r) => r.activity === POSTA_ACTIVITY && r.item_key === POSTA_ITEM,
    );
    return rows.map((r) => ({
      name: r.name,
      state: { ...emptyPostaState(), ...(r.payload ?? {}) } as PostaState,
      updatedAt: r.updated_at ? new Date(r.updated_at).getTime() : 0,
    }));
  }, [data]);

  const total = parsed.length;
  const completados = parsed.filter((p) => p.state.completado).length;
  const conPase = parsed.filter((p) => p.state.destilado.trim()).length;
  const consultasMarquito = parsed.reduce((acc, p) => acc + (p.state.marquitoUsos ?? 0), 0);

  // Ritmo: en qué estación están (incluye estación 0)
  const porEstacion = ESTACIONES.map((e) => ({
    est: e,
    n: parsed.filter((p) => p.state.estacion === e.n).length,
  }));
  const maxEst = Math.max(1, ...porEstacion.map((x) => x.n));

  // Modo de caso
  const propios = parsed.filter((p) => p.state.modo === "propio").length;
  const ejemplos = parsed.filter((p) => p.state.modo === "ejemplo").length;
  const porEjemplo = CASOS_EJEMPLO.map((c) => ({
    caso: c,
    n: parsed.filter((p) => p.state.ejemploId === c.id).length,
  }));

  const trabados = parsed.filter(
    (p) => !p.state.completado && p.updatedAt > 0 && now - p.updatedAt > STUCK_MIN * 60000,
  ).length;

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "nombre",
      "modo",
      "caso_ejemplo",
      "estacion",
      "completado",
      "herramienta_proyecto",
      "destilado",
      "borrador",
      "conf1",
      "conf2",
    ];
    const lines = parsed.map((p) => {
      const ej = getEjemplo(p.state.ejemploId);
      return [
        esc(p.name),
        esc(p.state.modo ?? ""),
        esc(ej ? `${ej.area} — ${ej.titulo}` : ""),
        esc(p.state.estacion),
        esc(p.state.completado ? "sí" : "no"),
        esc(p.state.herramienta ?? ""),
        esc(p.state.destilado),
        esc(p.state.borrador),
        esc(p.state.conf1),
        esc(p.state.conf2),
      ].join(",");
    });
    const csv = "﻿" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `LaPosta-recorridos-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function resetAll() {
    if (!confirm("Vaciar la clase: saca a todos los participantes y borra todo el trabajo. ¿Seguir?"))
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
            <span className="text-gradient font-mono text-sm font-bold">La Posta · docente</span>
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
              {origin ? `${origin}/posta` : "/posta"}
            </p>
            <button
              onClick={() => navigator.clipboard?.writeText(`${origin}/posta`)}
              className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
            >
              Copiar
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="px-3 py-1.5 text-xs">
              ⬇ Descargar recorridos (CSV)
            </Button>
            <Button variant="danger" onClick={resetAll} className="px-3 py-1.5 text-xs">
              Reiniciar clase
            </Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Participantes" value={total} />
          <Stat label="Terminaron" value={completados} />
          <Stat label="Hicieron el pase" value={conPase} />
          <Stat label="Caso propio" value={propios} />
          <Stat label={`Trabados (>${STUCK_MIN}m)`} value={trabados} alert={trabados > 0} />
        </div>

        <div className="mb-4 text-xs text-faint">
          🤖 {consultasMarquito} consultas a Marquito en total
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
                <h2 className="mb-3 text-sm font-semibold text-muted">Ritmo del aula · en qué estación están</h2>
                <div className="space-y-1.5">
                  {porEstacion.map(({ est, n }) => (
                    <div key={est.n} className="flex items-center gap-2">
                      <span className="w-24 shrink-0 truncate text-xs text-faint">
                        <span className="font-mono">{est.n}</span> {est.short}
                      </span>
                      <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-2/70">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal to-violet transition-all"
                          style={{ width: `${(n / maxEst) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">{n}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Caso elegido */}
              <section className="rounded-2xl border border-line bg-panel/40 p-4">
                <h2 className="mb-3 text-sm font-semibold text-muted">Con qué caso trabajan</h2>
                <div className="mb-3 flex gap-2 text-xs">
                  <span className="rounded-full bg-teal/15 px-2.5 py-1 font-semibold text-teal">
                    {propios} propio
                  </span>
                  <span className="rounded-full bg-violet/15 px-2.5 py-1 font-semibold text-violet">
                    {ejemplos} de ejemplo
                  </span>
                </div>
                <div className="space-y-1">
                  {porEjemplo.map(({ caso, n }) => (
                    <div key={caso.id} className="flex items-center gap-2">
                      <span className="flex-1 truncate text-xs text-muted">
                        {caso.emoji} {caso.area} — {caso.titulo}
                      </span>
                      <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-semibold text-teal">
                        {n}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Alumnos */}
            <section className="mt-4">
              <h2 className="mb-2 text-sm font-semibold text-muted">
                Alumnos ({total}) · tocá un nombre para ver su recorrido
              </h2>
              <div className="space-y-2">
                {parsed
                  .slice()
                  .sort((a, b) => b.state.estacion - a.state.estacion)
                  .map((p) => {
                    const ej = getEjemplo(p.state.ejemploId);
                    const casoLabel = p.state.modo === "propio" ? "Caso propio" : ej ? `${ej.emoji} ${ej.area} — ${ej.titulo}` : "Sin caso elegido";
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
                            <p className="text-xs text-muted">{casoLabel}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            {p.state.completado ? (
                              <span className="rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase text-teal">
                                🏁 Terminó
                              </span>
                            ) : (
                              <span className="text-xs text-faint">Estación {p.state.estacion}/3</span>
                            )}
                            {mins !== null && (
                              <p className="mt-0.5 text-[11px] text-faint">
                                {mins <= 0 ? "activo ahora" : `hace ${mins} min`}
                              </p>
                            )}
                          </div>
                        </button>

                        <div className="mt-2 flex gap-1">
                          {ESTACIONES.filter((e) => e.n > 0).map((e) => (
                            <span
                              key={e.n}
                              className={cn(
                                "h-1.5 flex-1 rounded-full",
                                e.n <= p.state.estacion ? "bg-teal" : "bg-line",
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
  const ej = getEjemplo(s.ejemploId);
  const algo = s.destilado || s.borrador || s.conf1 || s.conf2;
  return (
    <div className="mt-3 space-y-3 border-t border-line/60 pt-3 text-sm">
      <Line k="Caso" v={s.modo === "propio" ? "Propio" : ej ? `${ej.area} — ${ej.titulo}` : "—"} />
      {s.herramienta && <Line k="Proyecto en" v={s.herramienta === "claude" ? "Claude" : "ChatGPT"} />}
      {s.conf1 && (
        <Block titulo="Pase 1 · qué ordenó NotebookLM">
          <p className="text-muted">{s.conf1}</p>
        </Block>
      )}
      {s.destilado && (
        <Block titulo="Destilado (NotebookLM)">
          <p className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted">{s.destilado}</p>
        </Block>
      )}
      {s.conf2 && (
        <Block titulo="Estación 2 · su asistente">
          <p className="text-muted">{s.conf2}</p>
        </Block>
      )}
      {s.borrador && (
        <Block titulo="Borrador final / link">
          <p className="max-h-40 overflow-auto whitespace-pre-wrap text-xs text-muted">{s.borrador}</p>
        </Block>
      )}
      {!algo && (
        <p className="text-xs text-faint">
          {s.modo ? "Eligió caso pero todavía no cargó nada." : "Todavía no eligió caso."}
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
