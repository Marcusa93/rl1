"use client";

// Pide la clave docente (cookie) antes de mostrar una pantalla del docente.

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";

export function AccesoDocente({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("/api/teacher/me")
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.teacher)))
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
          <h1 className="text-lg font-semibold">{titulo}</h1>
          <p className="mt-1 text-sm text-muted">Pantalla del docente: pide la clave.</p>
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

  return <>{children}</>;
}
