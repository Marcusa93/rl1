"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { AGENDA, VF_ITEMS } from "@/lib/constants";
import type { ActivityKey, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type SessionResp = { session: SessionRow; participants: number };
type ResultsResp = {
  activity: string;
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
};

export default function PanelPage() {
  const slug = String(useParams().slug);
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);

  const { data } = useLive<SessionResp>(`/api/session/${slug}`, 2500);
  const { data: results } = useLive<ResultsResp>(`/api/session/${slug}/results`, 2500);

  useEffect(() => {
    fetch("/api/teacher/me")
      .then((r) => r.json())
      .then((d) => {
        setAuthed(d.teacher);
        if (!d.teacher) router.replace("/docente");
      });
  }, [router]);

  async function setActivity(key: ActivityKey) {
    await fetch(`/api/session/${slug}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    });
  }

  async function setConfig(config: Record<string, unknown>) {
    await fetch(`/api/session/${slug}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity_config: config }),
    });
  }

  async function reset(activity: string) {
    if (!confirm("¿Borrar las respuestas de esta actividad?")) return;
    await fetch(`/api/session/${slug}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity }),
    });
  }

  if (authed === null || !data)
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
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}/clase/${slug}` : "";

  return (
    <div className="bg-grid min-h-dvh">
      <header className="border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <LogoRL1 size={26} />
          <div className="flex items-center gap-3">
            <Link
              href={`/clase/${slug}/proyector`}
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
        {/* Columna izquierda: agenda */}
        <section>
          <div className="mb-4 flex items-center justify-between rounded-2xl border-gradient p-4">
            <div>
              <p className="text-xs text-faint">Código de la clase</p>
              <p className="font-mono text-3xl font-bold tracking-[0.2em] text-gradient">{slug}</p>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(joinUrl)}
              className="rounded-lg border border-line px-3 py-2 text-xs text-muted hover:text-teal"
            >
              Copiar link
            </button>
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

                  {/* Controles contextuales */}
                  {active && a.key === "verdadero_falso" && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line/60 pt-3">
                      <span className="text-xs text-faint">
                        Afirmación {vfIndex + 1}/{VF_ITEMS.length}
                      </span>
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() =>
                          setConfig({ vf_index: Math.max(0, vfIndex - 1), revealed: false })
                        }
                      >
                        ◀
                      </Button>
                      <Button
                        variant="outline"
                        className="px-2 py-1 text-xs"
                        onClick={() =>
                          setConfig({
                            vf_index: Math.min(VF_ITEMS.length - 1, vfIndex + 1),
                            revealed: false,
                          })
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

        {/* Columna derecha: pulso en vivo */}
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
                <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-line bg-ink-2/60 p-2 text-[10px] leading-relaxed text-muted">
                  {JSON.stringify(results.summary, null, 1)}
                </pre>
                <p className="mt-2 text-xs text-faint">
                  Vista completa en el{" "}
                  <Link href={`/clase/${slug}/proyector`} target="_blank" className="text-teal underline">
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
