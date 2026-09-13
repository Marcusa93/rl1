"use client";

// App del alumno de la clase Web3 (Diplomatura Derecho 5.0, UMSA).
// Entra con su nombre y el celular sigue solo las actividades que la
// presentación (/web3/clase) va activando.

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { W3Activity } from "@/components/web3/flow";
import { getW3Actividad, W3_MATERIA, W3_POLL, W3_SLUG, W3_TITLE } from "@/lib/web3-clase";
import { COM_AUTOR, COM_AUTOR_CARGO } from "@/lib/comercial";
import type { ParticipantRow, SessionRow } from "@/lib/types";

type SessionResp = { session: SessionRow; participants: number };

export default function Web3Page() {
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { data } = useLive<SessionResp>(`/api/session/${W3_SLUG}`, W3_POLL.alumno);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(`/api/session/${W3_SLUG}/me`)
        .then((r) => r.json())
        .then((d) => {
          if (active) setMe(d.participant);
        })
        .catch(() => {});
    load();
    const id = setInterval(load, W3_POLL.alumnoMe);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${W3_SLUG}/join`, {
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
            <LogoRL1 size={52} wordmark={false} className="mb-3" />
            <h1 className="text-gradient font-mono text-2xl font-bold tracking-tight">{W3_TITLE}</h1>
            <p className="mt-2 text-xs text-faint">{W3_MATERIA}</p>
            <p className="mt-3 text-xs text-faint">
              {COM_AUTOR} · {COM_AUTOR_CARGO}
            </p>
          </div>
          <form onSubmit={join} className="glass glow-teal rounded-2xl p-6">
            <label className="text-sm text-muted">Tu nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
              autoFocus
              className="mt-2 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 outline-none placeholder:text-faint focus:border-teal/60"
            />
            {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
            <Button type="submit" disabled={busy || name.trim().length < 2} className="mt-4 w-full">
              {busy ? <Spinner /> : "Entrar a la clase"}
            </Button>
          </form>
        </div>
      </main>
    );

  const act = getW3Actividad(data.session.current_activity);

  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <LogoRL1 size={24} className="shrink-0" />
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-teal/10 px-2.5 py-1 text-xs text-teal">
              <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-teal" />
              {data.participants} en clase
            </span>
            <div className="min-w-0 text-right">
              <p className="truncate text-xs text-faint">{me.name.split(/\s+/)[0]}</p>
              <p className="truncate text-xs font-medium text-teal">{act ? act.titulo : "Esperando"}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <W3Activity session={data.session} me={me} />
      </main>
    </div>
  );
}
