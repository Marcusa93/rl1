"use client";

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { ComResults } from "@/components/comercial/results";
import { DescargarGlosario } from "@/components/comercial/descargar-glosario";
import { COM_AGENDA, COM_POLL, COM_SLUG, COM_TITLE } from "@/lib/comercial";
import type { ActivityKey, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type SessionResp = { session: SessionRow; participants: number };

export default function ProfesorEmpresasPage() {
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
          <h1 className="text-lg font-semibold">Acceso docente</h1>
          <p className="mt-1 text-sm text-muted">{COM_TITLE} — ingresá la clave para controlar la clase.</p>
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
  const { data } = useLive<SessionResp>(`/api/session/${COM_SLUG}`, COM_POLL.docente);

  async function setActivity(key: ActivityKey) {
    await fetch(`/api/session/${COM_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    });
  }
  async function reset(activity: string) {
    if (!confirm("¿Borrar las respuestas de esta actividad?")) return;
    await fetch(`/api/session/${COM_SLUG}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity }),
    });
  }
  async function resetAll() {
    if (!confirm("Vaciar la clase: saca a todos los alumnos y borra todas las respuestas. ¿Seguir?"))
      return;
    await fetch(`/api/session/${COM_SLUG}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
  }
  async function exportCsv() {
    const res = await fetch(`/api/session/${COM_SLUG}/all-responses`);
    const d = await res.json();
    const rows = (d.rows ?? []) as Array<{
      name: string;
      activity: string;
      item_key: string;
      payload: unknown;
      created_at: string;
    }>;
    const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const header = ["nombre", "actividad", "item", "respuesta", "fecha"].join(",");
    const lines = rows.map((r) =>
      [esc(r.name), esc(r.activity), esc(r.item_key), esc(JSON.stringify(r.payload)), esc(r.created_at)].join(","),
    );
    const csv = "﻿" + [header, ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `RL1-empresas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  if (!data)
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </main>
    );

  const session = data.session;
  const current = session.current_activity;
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const linkAlumnos = `${origin}/empresas`;

  return (
    <div className="bg-grid min-h-dvh">
      <header className="border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <LogoRL1 size={26} />
            <span className="text-sm font-medium text-muted">{COM_TITLE}</span>
          </div>
          <span className="rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">
            {data.participants} en clase
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 rounded-2xl border-gradient p-4">
            <p className="text-xs text-faint">Link para los alumnos</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-bold text-gradient break-all">
                {linkAlumnos.replace(/^https?:\/\//, "") || "/empresas"}
              </p>
              <button
                onClick={() => navigator.clipboard?.writeText(linkAlumnos)}
                className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
              >
                Copiar
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <a
                href="/empresas/pantalla"
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-teal/60 hover:text-teal"
              >
                🖥 Abrir el proyector
              </a>
              <Button variant="outline" onClick={exportCsv} className="px-3 py-1.5 text-xs">
                ⬇ Respuestas (CSV)
              </Button>
              <Button variant="danger" onClick={resetAll} className="px-3 py-1.5 text-xs">
                Reiniciar clase
              </Button>
            </div>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-muted">Actividades</h2>
          <div className="space-y-2">
            {COM_AGENDA.map((a, i) => {
              const active = current === a.key;
              return (
                <div
                  key={a.key}
                  className={cn(
                    "rounded-2xl border p-4 transition",
                    active ? "border-teal/70 bg-teal/10 glow-teal" : "border-line bg-panel/40",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-faint">{i}</span>
                        <h3 className="font-semibold">{a.label}</h3>
                        {active && (
                          <span className="rounded-full bg-teal/20 px-2 py-0.5 text-[10px] font-bold uppercase text-teal">
                            En vivo
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted">{a.desc}</p>
                    </div>
                    <Button
                      variant={active ? "outline" : "primary"}
                      onClick={() => setActivity(a.key)}
                      className="shrink-0 px-3 py-2 text-xs"
                    >
                      {active ? "Activa" : "Activar"}
                    </Button>
                  </div>

                  {active && a.key === "emp_cierre" && (
                    <div className="mt-3 border-t border-line/60 pt-3">
                      <DescargarGlosario variant="outline" />
                    </div>
                  )}

                  {active && a.key !== "lobby" && (
                    <button
                      onClick={() => reset(a.key)}
                      className="mt-2 text-xs text-faint underline-offset-2 hover:text-magenta hover:underline"
                    >
                      Reiniciar respuestas
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ComResults activity={current} />
        </aside>
      </main>
    </div>
  );
}
