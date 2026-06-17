"use client";

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { agendaStep, DEFAULT_SLUG, WORKSHOP_TITLE } from "@/lib/constants";
import { StudentActivity } from "@/components/activities/student-activity";
import { LiveResults } from "@/components/live-results";

type SessionResp = { session: SessionRow; participants: number };
const SLUG = DEFAULT_SLUG;

export default function Home() {
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { data } = useLive<SessionResp>(`/api/session/${SLUG}`, 2500);

  useEffect(() => {
    fetch(`/api/session/${SLUG}/me`)
      .then((r) => r.json())
      .then((d) => setMe(d.participant))
      .catch(() => setMe(null));
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${SLUG}/join`, {
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

  // Pantalla de ingreso (solo nombre)
  if (!me)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-sm rise">
          <div className="mb-7 flex flex-col items-center text-center">
            <LogoRL1 size={52} wordmark={false} className="mb-3" />
            <h1 className="text-gradient font-mono text-3xl font-bold tracking-tight">RL1</h1>
            <p className="mt-2 text-sm text-muted">{WORKSHOP_TITLE}</p>
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
              {busy ? <Spinner /> : "Entrar al taller"}
            </Button>
          </form>
        </div>
      </main>
    );

  const step = agendaStep(data.session.current_activity);

  // Vista de actividad
  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <LogoRL1 size={24} />
          <div className="text-right">
            <p className="text-xs text-faint">{me.name}</p>
            <p className="text-xs font-medium text-teal">{step.short}</p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <StudentActivity slug={SLUG} session={data.session} me={me} />
        <LiveResults
          slug={SLUG}
          activity={data.session.current_activity}
          config={data.session.activity_config}
        />
      </main>
    </div>
  );
}
