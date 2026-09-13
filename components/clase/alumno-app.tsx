"use client";

// App del participante de una clase en vivo (motor genérico): ingresa con
// su nombre y el celular sigue solo las actividades que el deck activa.

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { ActividadParticipante } from "@/components/clase/flow-vivo";
import type { ClaseVivoConfig } from "@/lib/clase-vivo";
import type { ParticipantRow, SessionRow } from "@/lib/types";

type SessionResp = { session: SessionRow; participants: number };

export function AlumnoApp({
  config,
  logos,
}: {
  config: ClaseVivoConfig;
  logos?: { src: string; alt: string; fondo?: boolean }[];
}) {
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { data } = useLive<SessionResp>(`/api/session/${config.slug}`, config.poll.alumno);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(`/api/session/${config.slug}/me`)
        .then((r) => r.json())
        .then((d) => {
          if (active) setMe(d.participant);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, config.poll.alumnoMe);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [config.slug, config.poll.alumnoMe]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${config.slug}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const d = await res.json().catch(() => ({ error: "Error de red" }));
    setBusy(false);
    if (res.ok) setMe(d.participant);
    else setErr(d.error || "Error");
  }

  if (me === undefined || !data)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <Spinner />
      </main>
    );

  if (!me)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-sm rise">
          <div className="mb-7 flex flex-col items-center text-center">
            {logos && (
              <div className="mb-5 flex items-center justify-center gap-4">
                {logos.map((l) => (
                  <img
                    key={l.src}
                    src={l.src}
                    alt={l.alt}
                    className={l.fondo ? "h-12 w-auto rounded-lg bg-white p-1" : "h-12 w-auto"}
                  />
                ))}
              </div>
            )}
            <LogoRL1 size={44} wordmark={false} className="mb-3" />
            <h1 className="text-gradient font-mono text-3xl font-bold tracking-tight">{config.titulo}</h1>
            <p className="mt-2 text-xs text-faint">{config.materia}</p>
            <p className="mt-3 text-xs text-faint">
              {config.autor} · {config.cargo}
            </p>
          </div>
          <form onSubmit={join} className="glass glow-teal rounded-2xl p-6">
            <label className="text-sm text-muted">Su nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              autoFocus
              className="mt-2 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 outline-none placeholder:text-faint focus:border-teal/60"
            />
            {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
            <Button type="submit" disabled={busy || name.trim().length < 2} className="mt-4 w-full">
              {busy ? <Spinner /> : "Ingresar"}
            </Button>
          </form>
        </div>
      </main>
    );

  const act = config.getActividad(data.session.current_activity);

  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <LogoRL1 size={24} className="shrink-0" />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-teal/10 px-2.5 py-1 text-xs text-teal">
              <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-teal" />
              {data.participants} conectados
            </span>
            <div className="min-w-0 text-right">
              <p className="truncate text-xs text-faint">{me.name.split(/\s+/)[0]}</p>
              <p className="truncate text-xs font-medium text-teal">{act ? act.titulo : "En espera"}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ActividadParticipante config={config} session={data.session} me={me} />
      </main>
    </div>
  );
}
