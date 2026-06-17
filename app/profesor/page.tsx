"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { AGENDA, DEFAULT_SLUG, VF_ITEMS } from "@/lib/constants";
import type { ActivityKey, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type SessionResp = { session: SessionRow; participants: number };
type ResultsResp = { activity: string; participants: number; responded: number; summary: Record<string, unknown> };
const SLUG = DEFAULT_SLUG;

export default function ProfesorPage() {
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
          <p className="mt-1 text-sm text-muted">Ingresá la clave para controlar la clase.</p>
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
  const { data } = useLive<SessionResp>(`/api/session/${SLUG}`, 2500);
  const { data: results } = useLive<ResultsResp>(`/api/session/${SLUG}/results`, 2500);

  async function setActivity(key: ActivityKey) {
    await fetch(`/api/session/${SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    });
  }
  async function setConfig(config: Record<string, unknown>) {
    await fetch(`/api/session/${SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_config: config }),
    });
  }
  async function reset(activity: string) {
    if (!confirm("¿Borrar las respuestas de esta actividad?")) return;
    await fetch(`/api/session/${SLUG}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity }),
    });
  }

  if (!data)
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </main>
    );

  const session = data.session;
  const current = session.current_activity;
  const cfg = session.activity_config ?? {};
  const vfIndex = Number(cfg.vf_index ?? 0);
  const revealed = Boolean(cfg.revealed);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="bg-grid min-h-dvh">
      <header className="border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <LogoRL1 size={26} />
          <div className="flex items-center gap-3">
            <Link
              href="/pantalla"
              target="_blank"
              className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:text-teal"
            >
              Abrir proyector ↗
            </Link>
            <span className="rounded-lg bg-teal/15 px-3 py-1.5 text-xs font-medium text-teal">
              {data.participants} en sala
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-5 px-4 py-6 lg:grid-cols-[1fr_320px]">
        <section>
          <div className="mb-4 rounded-2xl border-gradient p-4">
            <p className="text-xs text-faint">Link para los alumnos (sin código)</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <p className="font-mono text-lg font-bold text-gradient break-all">{origin || "/"}</p>
              <button
                onClick={() => navigator.clipboard?.writeText(origin)}
                className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
              >
                Copiar
              </button>
            </div>
            <p className="mt-2 text-xs text-faint">Entran, ponen su nombre y listo.</p>
          </div>

          <h2 className="mb-2 text-sm font-semibold text-muted">Actividades</h2>
          <div className="space-y-2">
            {AGENDA.map((a, i) => {
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

                  {active && a.key === "verdadero_falso" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
                      <span className="text-xs text-faint">
                        Afirmación {vfIndex + 1}/{VF_ITEMS.length}
                      </span>
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() => setConfig({ vf_index: Math.max(0, vfIndex - 1), revealed: false })}
                      >
                        ◀
                      </Button>
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() =>
                          setConfig({ vf_index: Math.min(VF_ITEMS.length - 1, vfIndex + 1), revealed: false })
                        }
                      >
                        ▶
                      </Button>
                      <Button
                        variant={revealed ? "outline" : "primary"}
                        className="px-3 py-1 text-xs"
                        onClick={() => setConfig({ vf_index: vfIndex, revealed: !revealed })}
                      >
                        {revealed ? "Ocultar respuesta" : "Revelar respuesta"}
                      </Button>
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
          <div className="glass rounded-2xl p-4">
            <h2 className="text-sm font-semibold">Pulso en vivo</h2>
            <p className="mt-1 text-xs text-faint">Actividad: {current}</p>
            {results ? (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-teal">{results.responded}</span>
                  <span className="text-xs text-faint">/ {results.participants} respondieron</span>
                </div>
                <p className="mt-3 text-xs text-faint">
                  Vista completa en el{" "}
                  <Link href="/pantalla" target="_blank" className="text-teal underline">
                    proyector
                  </Link>
                  .
                </p>
              </div>
            ) : (
              <Spinner />
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
