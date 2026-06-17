"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { agendaStep } from "@/lib/constants";
import { StudentActivity } from "@/components/activities/student-activity";

type SessionResp = { session: SessionRow; participants: number };

export default function ClasePage() {
  const slug = String(useParams().slug);
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const { data, error } = useLive<SessionResp>(`/api/session/${slug}`, 2500);

  useEffect(() => {
    fetch(`/api/session/${slug}/me`)
      .then((r) => r.json())
      .then((d) => setMe(d.participant))
      .catch(() => setMe(null));
  }, [slug]);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${slug}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) setMe(d.participant);
    else setErr(d.error || "Error");
  }

  if (error && !data)
    return (
      <Centered>
        <p className="text-magenta">No se encontró la clase «{slug}».</p>
      </Centered>
    );

  if (me === undefined || !data)
    return (
      <Centered>
        <Spinner />
      </Centered>
    );

  // Pantalla de ingreso
  if (!me)
    return (
      <Centered>
        <div className="w-full max-w-sm rise">
          <div className="mb-6 flex flex-col items-center text-center">
            <LogoRL1 size={44} wordmark={false} className="mb-3" />
            <p className="text-xs uppercase tracking-widest text-faint">Clase {slug}</p>
            <h1 className="mt-1 text-xl font-semibold">{data.session.title}</h1>
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
              {busy ? <Spinner /> : "Unirme a la clase"}
            </Button>
          </form>
        </div>
      </Centered>
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
        <StudentActivity slug={slug} session={data.session} me={me} />
      </main>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <main className="bg-grid flex min-h-dvh items-center justify-center px-5">{children}</main>
  );
}
