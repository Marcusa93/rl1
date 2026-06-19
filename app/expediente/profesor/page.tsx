"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import {
  CASOS,
  ETAPAS,
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

type Row = { name: string; activity: string; item_key: string; payload: ExpedienteState };
type AllResp = { rows: Row[] };

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

function Panel() {
  const { data } = useLive<AllResp>(`/api/session/${SLUG}/all-responses`, 2500);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const parsed = useMemo(() => {
    const rows = (data?.rows ?? []).filter(
      (r) => r.activity === EXP_ACTIVITY && r.item_key === EXP_ITEM,
    );
    return rows.map((r) => ({
      name: r.name,
      state: { ...emptyState(), ...(r.payload ?? {}) } as ExpedienteState,
    }));
  }, [data]);

  const total = parsed.length;
  const completados = parsed.filter((p) => p.state.completado).length;
  const porCaso = CASOS.map((c) => ({
    caso: c,
    n: parsed.filter((p) => p.state.caso === c.id).length,
  }));

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = [
      "nombre",
      "caso",
      "etapa",
      "completado",
      "via_elegida",
      "rol",
      ...FICHA_CAMPOS.map((c) => c.key),
      "regla1",
      "regla2",
      "regla3",
      "regla4",
      "regla5",
    ];
    const lines = parsed.map((p) => {
      const caso = getCaso(p.state.caso);
      const hip = caso?.hipotesis.find((h) => h.id === p.state.estrategia);
      return [
        esc(p.name),
        esc(caso ? `${caso.area} — ${caso.caratula}` : ""),
        esc(p.state.etapa),
        esc(p.state.completado ? "sí" : "no"),
        esc(hip?.titulo ?? ""),
        esc(p.state.rol),
        ...FICHA_CAMPOS.map((c) => esc(p.state.ficha[c.key])),
        ...p.state.reglas.map((r) => esc(r)),
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
      <header className="border-b border-line/60 bg-ink/80 backdrop-blur">
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

        {/* Resumen */}
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Participantes" value={total} />
          <Stat label="Fichas completas" value={completados} />
          {porCaso.map((c) => (
            <Stat key={c.caso.id} label={`${c.caso.emoji} ${c.caso.area}`} value={c.n} />
          ))}
        </div>

        {/* Tabla de avance */}
        {!data ? (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        ) : total === 0 ? (
          <p className="rounded-2xl border border-line bg-panel/40 p-6 text-center text-sm text-muted">
            Todavía no entró nadie. Compartí el link de arriba.
          </p>
        ) : (
          <div className="space-y-2">
            {parsed
              .slice()
              .sort((a, b) => b.state.etapa - a.state.etapa)
              .map((p, i) => {
                const caso = getCaso(p.state.caso);
                const hip = caso?.hipotesis.find((h) => h.id === p.state.estrategia);
                return (
                  <div key={i} className="rounded-2xl border border-line bg-panel/40 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{p.name}</p>
                        <p className="text-xs text-muted">
                          {caso ? `${caso.emoji} ${caso.area} — ${caso.caratula}` : "Sin caso elegido"}
                          {hip ? ` · ${hip.titulo}` : ""}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {p.state.completado ? (
                          <span className="rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase text-teal">
                            ✓ Completo
                          </span>
                        ) : (
                          <span className="text-xs text-faint">
                            Etapa {p.state.etapa}/10
                          </span>
                        )}
                      </div>
                    </div>
                    {/* barra de progreso */}
                    <div className="mt-2 flex gap-0.5">
                      {ETAPAS.map((e) => (
                        <span
                          key={e.n}
                          className={cn(
                            "h-1.5 flex-1 rounded-full",
                            e.n <= p.state.etapa ? "bg-teal" : "bg-line",
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/40 p-3 text-center">
      <p className="text-2xl font-bold text-gradient">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
