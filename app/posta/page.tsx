"use client";

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import type { ParticipantRow } from "@/lib/types";
import { POSTA_SLUG } from "@/lib/posta";
import { PostaFlow } from "@/components/posta/flow";

const SLUG = POSTA_SLUG;

export default function PostaPage() {
  const [me, setMe] = useState<ParticipantRow | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let active = true;
    const load = () =>
      fetch(`/api/session/${SLUG}/me`)
        .then((r) => r.json())
        .then((d) => {
          if (active) setMe(d.participant ?? null);
        })
        .catch(() => {});
    load();
    // Si el docente reinicia la clase, el participante deja de existir:
    // volvemos solos al ingreso (re-chequeo cada 4s).
    const id = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(id);
    };
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

  if (me === undefined)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <Spinner />
      </main>
    );

  // Pantalla de ingreso
  if (!me)
    return (
      <main className="bg-grid flex min-h-dvh items-center justify-center px-5">
        <div className="w-full max-w-sm rise">
          <div className="mb-7 flex flex-col items-center text-center">
            <LogoRL1 size={52} wordmark={false} className="mb-3" />
            <h1 className="text-gradient font-mono text-2xl font-bold tracking-tight">La Posta</h1>
            <p className="mt-2 text-sm text-muted">
              Clase 2 · Encadenar varias IA para tu propio caso · Diplomatura en IA y Derecho · UNT
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
          <p className="mt-4 text-center text-xs text-faint">
            Hoy no le hablamos a una IA: hacemos que varias trabajen en cadena. La app te lleva de a un
            paso por vez.
          </p>
        </div>
      </main>
    );

  // Flujo de la posta
  return (
    <div className="bg-grid min-h-dvh">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <span className="flex items-center gap-2">
            <LogoRL1 size={24} wordmark={false} />
            <span className="text-gradient font-mono text-sm font-bold">La Posta</span>
          </span>
          <p className="text-xs text-faint">{me.name}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <PostaFlow slug={SLUG} me={me} />
      </main>
    </div>
  );
}
