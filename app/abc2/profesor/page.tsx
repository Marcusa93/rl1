"use client";

import { useEffect, useMemo, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { ABC2_ACTIVITY, ABC2_ITEM, ABC2_SLUG, MODULOS, emptyAbc2State, getFlujo, type Abc2State } from "@/lib/abc2";
import { cn } from "@/lib/utils";

const SLUG = ABC2_SLUG;

export default function Abc2ProfesorPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/teacher/me").then((r) => r.json()).then((d) => setAuthed(d.teacher)).catch(() => setAuthed(false));
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/teacher/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (res.ok) setAuthed(true);
    else setErr("Clave incorrecta");
  }

  if (authed === null) return <main className="flex min-h-dvh items-center justify-center"><Spinner /></main>;

  if (!authed)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <form onSubmit={login} className="glass w-full max-w-sm rounded-2xl p-6 rise">
          <div className="mb-5 flex justify-center"><LogoRL1 size={38} /></div>
          <h1 className="text-lg font-semibold">Tu equipo invisible · docente</h1>
          <p className="mt-1 text-sm text-muted">Ingresá la clave para ver el avance.</p>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="clave" autoFocus className="mt-4 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 outline-none placeholder:text-faint focus:border-teal/60" />
          {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
          <Button type="submit" disabled={busy} className="mt-4 w-full">{busy ? <Spinner /> : "Entrar"}</Button>
        </form>
      </main>
    );

  return <Panel />;
}

type Row = { name: string; state: Abc2State; updatedAt: number };

function Panel() {
  const { data } = useLive<{ rows: { name: string; activity: string; item_key: string; payload: Abc2State }[] }>(`/api/session/${SLUG}/all-responses`, 2500);
  const [open, setOpen] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const parsed: Row[] = useMemo(() => {
    const rows = (data?.rows ?? []).filter((r) => r.activity === ABC2_ACTIVITY && r.item_key === ABC2_ITEM);
    return rows.map((r) => ({ name: r.name, state: { ...emptyAbc2State(), ...(r.payload ?? {}) } as Abc2State, updatedAt: 0 }));
  }, [data]);

  const total = parsed.length;
  const terminaron = parsed.filter((p) => p.state.completado).length;
  const conPrompt = parsed.filter((p) => p.state.promptContextual.trim()).length;
  const conRegistro = parsed.filter((p) => p.state.registro.trim()).length;
  const nuevos = parsed.filter((p) => p.state.esNuevo && !p.state.perfil).length;

  const porModulo = MODULOS.map((m) => ({ m, n: parsed.filter((p) => p.state.modulo === m.n).length }));
  const maxMod = Math.max(1, ...porModulo.map((x) => x.n));

  function exportCsv() {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const header = ["nombre", "reconocido", "rubro", "prompt_contextual", "problema", "flujo", "registro", "mini_reto", "llego_a_cierre"];
    const lines = parsed.map((p) => {
      const s = p.state;
      const flujo = getFlujo(s.flujoId);
      const problema = s.problema === "__propio__" ? s.problemaPropio : s.problema;
      return [
        esc(p.name),
        esc(s.perfil ? "sí" : "nuevo"),
        esc(s.perfil?.rubro ?? ""),
        esc(s.promptContextual),
        esc(problema),
        esc(flujo?.titulo ?? ""),
        esc(s.registro),
        esc(s.miniReto),
        esc(s.completado ? "sí" : "no"),
      ].join(",");
    });
    const csv = "﻿" + [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `TuEquipoInvisible-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function resetAll() {
    if (!confirm("Vaciar la clase: saca a todos y borra el trabajo. ¿Seguir?")) return;
    await fetch(`/api/session/${SLUG}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) });
  }

  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2"><LogoRL1 size={26} wordmark={false} /><span className="text-gradient font-mono text-sm font-bold">Tu equipo invisible · docente</span></span>
          <span className="rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">{total} en sala</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-4 rounded-2xl border-gradient p-4">
          <p className="text-xs text-faint">Link para los participantes</p>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="break-all font-mono text-lg font-bold text-gradient">{origin ? `${origin}/abc2` : "/abc2"}</p>
            <button onClick={() => navigator.clipboard?.writeText(`${origin}/abc2`)} className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal">Copiar</button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={exportCsv} className="px-3 py-1.5 text-xs">⬇ Descargar (CSV)</Button>
            <Button variant="danger" onClick={resetAll} className="px-3 py-1.5 text-xs">Reiniciar clase</Button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Participantes" value={total} />
          <Stat label="Terminaron" value={terminaron} />
          <Stat label="Generaron prompt" value={conPrompt} />
          <Stat label="Con registro" value={conRegistro} />
          <Stat label="Nuevos" value={nuevos} />
        </div>

        {total === 0 ? (
          <p className="rounded-2xl border border-line bg-panel/40 p-6 text-center text-sm text-muted">Todavía no entró nadie. Compartí el link.</p>
        ) : (
          <>
            <section className="mb-4 rounded-2xl border border-line bg-panel/40 p-4">
              <h2 className="mb-3 text-sm font-semibold text-muted">Ritmo · en qué módulo están</h2>
              <div className="space-y-1.5">
                {porModulo.map(({ m, n }) => (
                  <div key={m.n} className="flex items-center gap-2">
                    <span className="w-20 shrink-0 truncate text-xs text-faint">{m.short}</span>
                    <div className="h-4 flex-1 overflow-hidden rounded-full bg-ink-2/70"><div className="h-full rounded-full bg-gradient-to-r from-teal to-violet" style={{ width: `${(n / maxMod) * 100}%` }} /></div>
                    <span className="w-6 shrink-0 text-right text-xs font-semibold text-foreground">{n}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-2 text-sm font-semibold text-muted">Participantes ({total}) · tocá para ver todo</h2>
              <div className="space-y-2">
                {parsed.slice().sort((a, b) => b.state.modulo - a.state.modulo).map((p) => {
                  const isOpen = open === p.name;
                  const flujo = getFlujo(p.state.flujoId);
                  return (
                    <div key={p.name} className="rounded-2xl border border-line bg-panel/40 p-4">
                      <button onClick={() => setOpen(isOpen ? null : p.name)} className="flex w-full items-center justify-between gap-3 text-left">
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{p.name}{p.state.esNuevo && !p.state.perfil && <span className="ml-2 rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase text-violet">nuevo</span>}</p>
                          <p className="truncate text-xs text-muted">{p.state.perfil?.rubro || "—"}{flujo ? ` · ${flujo.titulo}` : ""}</p>
                        </div>
                        {p.state.completado ? <span className="shrink-0 rounded-full bg-teal/20 px-2.5 py-1 text-[10px] font-bold uppercase text-teal">🚀 Terminó</span> : <span className="shrink-0 text-xs text-faint">Mód. {p.state.modulo + 1}/{MODULOS.length}</span>}
                      </button>
                      {isOpen && <Detalle s={p.state} />}
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

function Detalle({ s }: { s: Abc2State }) {
  const flujo = getFlujo(s.flujoId);
  const problema = s.problema === "__propio__" ? s.problemaPropio : s.problema;
  return (
    <div className="mt-3 space-y-3 border-t border-line/60 pt-3 text-sm">
      {problema && <Line k="Problema" v={problema} />}
      {flujo && <Line k="Flujo" v={flujo.titulo} />}
      {s.promptContextual && (
        <Block titulo="Prompt contextual generado"><p className="max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted">{s.promptContextual}</p></Block>
      )}
      {s.registro && (
        <Block titulo="Registro de práctica"><p className="whitespace-pre-wrap text-xs text-muted">{s.registro}</p></Block>
      )}
      {s.miniReto && <Line k="Reto de la semana" v={s.miniReto} />}
      {!problema && !s.promptContextual && !s.registro && <p className="text-xs text-faint">Entró pero todavía no cargó nada.</p>}
    </div>
  );
}

function Block({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return <div><p className="mb-1 text-xs font-bold uppercase tracking-wide text-teal">{titulo}</p><div className="space-y-1">{children}</div></div>;
}
function Line({ k, v }: { k: string; v: string }) {
  return <p className="text-muted"><span className="text-faint">{k}:</span> {v}</p>;
}
function Stat({ label, value }: { label: string; value: number }) {
  return <div className={cn("rounded-2xl border border-line bg-panel/40 p-3 text-center")}><p className="text-2xl font-bold text-gradient">{value}</p><p className="text-xs text-muted">{label}</p></div>;
}
