"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { normalizeSlug } from "@/lib/code";

export default function DocentePage() {
  const router = useRouter();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [slug, setSlug] = useState("");
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

  async function crear() {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const d = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/clase/${d.session.slug}/panel`);
    else setErr(d.error || "Error al crear");
  }

  if (authed === null)
    return (
      <main className="flex min-h-dvh items-center justify-center">
        <Spinner />
      </main>
    );

  return (
    <main className="bg-grid flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rise">
        <div className="mb-8 flex justify-center">
          <LogoRL1 size={40} />
        </div>

        {!authed ? (
          <form onSubmit={login} className="glass rounded-2xl p-6">
            <h1 className="text-lg font-semibold">Acceso docente</h1>
            <p className="mt-1 text-sm text-muted">Ingresá la clave para gestionar la clase.</p>
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
        ) : (
          <div className="glass glow-teal rounded-2xl p-6">
            <h1 className="text-lg font-semibold">Panel docente</h1>
            <p className="mt-1 text-sm text-muted">Creá una clase nueva o abrí una existente.</p>
            <Button onClick={crear} disabled={busy} className="mt-4 w-full">
              {busy ? <Spinner /> : "Crear clase nueva"}
            </Button>

            <div className="my-5 flex items-center gap-3 text-xs text-faint">
              <span className="h-px flex-1 bg-line" /> o abrir existente <span className="h-px flex-1 bg-line" />
            </div>

            <div className="flex gap-2">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="código de clase"
                className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-2.5 font-mono outline-none placeholder:text-faint focus:border-teal/60"
              />
              <Button
                variant="outline"
                onClick={() => {
                  const s = normalizeSlug(slug);
                  if (s.length >= 3) router.push(`/clase/${s}/panel`);
                }}
              >
                Abrir
              </Button>
            </div>
            {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
          </div>
        )}
      </div>
    </main>
  );
}
