"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button } from "@/components/ui";
import { WORKSHOP_TITLE } from "@/lib/constants";
import { normalizeSlug } from "@/lib/code";

export default function Home() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function enter(e: React.FormEvent) {
    e.preventDefault();
    const slug = normalizeSlug(code);
    if (slug.length >= 3) router.push(`/clase/${slug}`);
  }

  return (
    <main className="bg-grid relative flex min-h-dvh flex-col items-center justify-center px-5 py-12">
      <div className="w-full max-w-md rise">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoRL1 size={56} wordmark={false} className="mb-4" />
          <h1 className="text-gradient font-mono text-4xl font-bold tracking-tight">RL1</h1>
          <p className="mt-2 text-sm text-muted">{WORKSHOP_TITLE} · Aula en vivo</p>
        </div>

        <div className="glass glow-teal rounded-2xl p-6">
          <h2 className="text-lg font-semibold">Unirme a la clase</h2>
          <p className="mt-1 text-sm text-muted">
            Ingresá el código que te comparte el docente.
          </p>
          <form onSubmit={enter} className="mt-4 flex flex-col gap-3">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="código (ej. k7m2x)"
              autoFocus
              className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-center font-mono text-lg uppercase tracking-[0.3em] outline-none placeholder:text-faint focus:border-teal/60"
            />
            <Button type="submit" disabled={normalizeSlug(code).length < 3}>
              Entrar →
            </Button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/docente"
            className="text-sm text-faint underline-offset-4 transition hover:text-teal hover:underline"
          >
            Soy el docente →
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-5 text-xs text-faint">
        <LogoRL1 size={18} className="opacity-70" />
      </footer>
    </main>
  );
}
