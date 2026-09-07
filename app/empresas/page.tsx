"use client";

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { ComercialActivity } from "@/components/comercial/flow";
import {
  COM_MATERIA,
  COM_POLL,
  COM_SLUG,
  COM_SUBTITLE,
  COM_TITLE,
  comAgendaStep,
} from "@/lib/comercial";
import type { ParticipantRow, SessionRow } from "@/lib/types";

type SessionResp = { session: SessionRow; participants: number };

export default function EmpresasPage() {
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // Único endpoint que consulta cada celular durante la clase (aula de ~200).
  const { data } = useLive<SessionResp>(`/api/session/${COM_SLUG}`, COM_POLL.alumno);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(`/api/session/${COM_SLUG}/me`)
        .then((r) => r.json())
        .then((d) => {
          if (active) setMe(d.participant);
        })
        .catch(() => {});
    load();
    // chequeo espaciado: si el docente reinicia la clase, vuelve solo al ingreso
    const id = setInterval(load, COM_POLL.alumnoMe);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  async function join(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch(`/api/session/${COM_SLUG}/join`, {
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
            <h1 className="text-gradient font-mono text-3xl font-bold tracking-tight">{COM_TITLE}</h1>
            <p className="mt-2 text-sm text-muted">{COM_SUBTITLE}</p>
            <p className="mt-1 text-xs text-faint">{COM_MATERIA}</p>
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

  const step = comAgendaStep(data.session.current_activity);

  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <LogoRL1 size={24} />
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-teal/10 px-2.5 py-1 text-xs text-teal">
              <span className="size-1.5 animate-pulse rounded-full bg-teal" />
              {data.participants} en clase
            </span>
            <div className="text-right">
              <p className="text-xs text-faint">{me.name.split(/\s+/)[0]}</p>
              <p className="text-xs font-medium text-teal">{step.short}</p>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <ComercialActivity session={data.session} me={me} />
      </main>
    </div>
  );
}
