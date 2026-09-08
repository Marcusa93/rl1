"use client";

// Presentación de la clase Web3 (Diplomatura Derecho 5.0, UMSA), para
// compartir por Zoom. La placa manda: al llegar a una placa de actividad,
// la activa sola vía la API (cookie docente) y muestra los resultados en
// vivo incrustados. Los alumnos responden desde /web3.

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { useLive } from "@/components/use-live";
import { DiagramaW3 } from "@/components/web3/diagramas";
import {
  getW3Actividad,
  W3_LINK,
  W3_MATERIA,
  W3_POLL,
  W3_QR_PLATAFORMA,
  W3_SLIDES,
  W3_SLUG,
  W3_SUBTITLE,
  W3_TITLE,
  type W3Actividad,
  type W3Slide,
} from "@/lib/web3-clase";
import { COM_AUTOR, COM_AUTOR_CARGO, COM_INSTAGRAM_URL, COM_QR_SRC } from "@/lib/comercial";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "web3-clase-slide";

// --- Acceso docente (misma clave que los paneles) --------------------------

export default function W3ClasePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
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
          <h1 className="text-lg font-semibold">Presentación de la clase</h1>
          <p className="mt-1 text-sm text-muted">
            {W3_TITLE} — la presentación activa las actividades sola, por eso pide la clave docente.
          </p>
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

  return <Deck />;
}

// --- La presentación --------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

function Deck() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), W3_SLIDES.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const lastActivada = useRef<string | null>(null);

  const go = useCallback((n: number) => {
    setIdx(() => {
      const next = Math.min(Math.max(n, 0), W3_SLIDES.length - 1);
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        setIdx((i) => {
          const n = Math.min(i + 1, W3_SLIDES.length - 1);
          try { localStorage.setItem(STORAGE_KEY, String(n)); } catch {}
          return n;
        });
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        setIdx((i) => {
          const n = Math.max(i - 1, 0);
          try { localStorage.setItem(STORAGE_KEY, String(n)); } catch {}
          return n;
        });
      } else if (e.key === "Home") go(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // La placa manda: si tiene actividad asociada, se activa sola.
  const slide = W3_SLIDES[idx];
  useEffect(() => {
    const key = "activa" in slide ? slide.activa : undefined;
    if (!key || lastActivada.current === key) return;
    lastActivada.current = key;
    setEstado({ key, status: "enviando" });
    fetch(`/api/session/${W3_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    })
      .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
      .catch(() => setEstado({ key, status: "error" }));
  }, [slide]);

  const parteActual = W3_SLIDES.slice(0, idx + 1)
    .reverse()
    .find((s) => s.parte)?.parte;

  const estadoNombre = estado ? (getW3Actividad(estado.key)?.titulo ?? "Ingreso") : "";

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / W3_SLIDES.length) * 100}%` }}
        />
      </div>

      {estado && (
        <div
          className={cn(
            "fixed right-4 top-3 z-40 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
            estado.status === "error" ? "bg-magenta/15 text-magenta" : "bg-teal/15 text-teal",
          )}
        >
          <span className={cn("size-1.5 rounded-full", estado.status === "error" ? "bg-magenta" : "animate-pulse bg-teal")} />
          {estado.status === "enviando" && "activando…"}
          {estado.status === "ok" && <>en vivo: {estadoNombre}</>}
          {estado.status === "error" && "no se pudo activar — reingresá como docente"}
        </div>
      )}

      <main key={idx} className="rise mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-10 py-16">
        <Slide slide={slide} />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between px-5 py-3 text-xs text-faint">
        <span className="hidden sm:block">
          {COM_AUTOR} · {COM_AUTOR_CARGO}
        </span>
        <div className="flex items-center gap-3">
          {idx === 0 && <span className="hidden md:block">← → para avanzar</span>}
          {parteActual && (
            <span className="hidden rounded-full border border-line bg-panel/60 px-2.5 py-1 font-mono text-[11px] text-muted md:block">
              {parteActual}
            </span>
          )}
          <button
            onClick={() => go(idx - 1)}
            className="rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-muted transition hover:text-teal"
            aria-label="Anterior"
          >
            ◀
          </button>
          <span className="font-mono">
            {idx + 1} / {W3_SLIDES.length}
          </span>
          <button
            onClick={() => go(idx + 1)}
            className="rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-muted transition hover:text-teal"
            aria-label="Siguiente"
          >
            ▶
          </button>
        </div>
      </footer>
    </div>
  );
}

// --- Placas -----------------------------------------------------------------

function Slide({ slide }: { slide: W3Slide }) {
  switch (slide.t) {
    case "portada":
      return (
        <div className="relative flex flex-col items-center text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/4 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(94,234,212,0.5), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.5), transparent 60%)",
            }}
          />
          <Constelacion />
          <LogoRL1 size={56} wordmark={false} className="mb-6" />
          <h1 className="text-gradient max-w-4xl font-mono text-6xl font-bold tracking-tight">{W3_TITLE}</h1>
          <p className="rise mt-4 max-w-3xl text-2xl text-muted" style={{ animationDelay: "0.2s" }}>
            {W3_SUBTITLE}
          </p>
          <p className="rise mt-2 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
            {W3_MATERIA}
          </p>
          <p className="rise mt-6 text-lg font-medium" style={{ animationDelay: "0.4s" }}>
            {COM_AUTOR}
          </p>
          <p className="rise text-sm text-muted" style={{ animationDelay: "0.45s" }}>
            {COM_AUTOR_CARGO}
          </p>
          <div className="rise mt-9 flex items-center gap-10" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-5">
              <img
                src={W3_QR_PLATAFORMA}
                alt="QR para entrar a la plataforma"
                width={160}
                height={160}
                className="rounded-xl border border-line bg-white p-2"
              />
              <div className="pulse-ring rounded-2xl border-gradient px-7 py-5 text-left">
                <p className="text-xs uppercase tracking-widest text-faint">Entrá desde tu celular</p>
                <p className="text-gradient mt-1 font-mono text-2xl font-bold">{W3_LINK}</p>
                <p className="mt-1 text-xs text-faint">escaneá el QR o escribí el link</p>
              </div>
            </div>
            <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5">
              <img src={COM_QR_SRC} alt="QR a Instagram" width={120} height={120} className="rounded-xl border border-line bg-white p-2" />
              <span className="text-xs text-faint">@marquitorossi</span>
            </a>
          </div>
        </div>
      );

    case "ingreso":
      return <Ingreso />;

    case "placa":
      return (
        <div>
          {slide.parte && (
            <p className="mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-violet">
              <span className="size-1.5 rounded-full bg-current" />
              {slide.parte}
            </p>
          )}
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight">{slide.titulo}</h1>
          <p className="rise mt-3 max-w-3xl text-2xl leading-snug text-muted" style={{ animationDelay: "0.12s" }}>
            {slide.bajada}
          </p>
          <div className="rise mx-auto mt-8 w-full max-w-3xl" style={{ animationDelay: "0.25s" }}>
            <div className="glass rounded-2xl p-5">
              <DiagramaW3 id={slide.diagrama} />
            </div>
          </div>
          {slide.link && (
            <div className="rise mt-5 flex justify-center" style={{ animationDelay: "0.35s" }}>
              <a
                href={slide.link.url}
                target="_blank"
                rel="noreferrer"
                className="pulse-ring rounded-xl border-gradient px-6 py-3 font-mono text-base font-semibold text-teal transition hover:brightness-110"
              >
                {slide.link.label}
              </a>
            </div>
          )}
          {slide.pills && (
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {slide.pills.map((p, i) => (
                <span
                  key={p}
                  className="rise rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 text-base text-foreground"
                  style={{ animationDelay: `${0.35 + i * 0.1}s` }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
          {slide.lede && (
            <p className="rise mx-auto mt-6 max-w-3xl text-center text-xl italic leading-relaxed text-muted" style={{ animationDelay: "0.4s" }}>
              {slide.lede}
            </p>
          )}
        </div>
      );

    case "actividad": {
      const act = getW3Actividad(slide.activa);
      if (!act) return null;
      return <SlideActividad act={act} escena={slide.escena} />;
    }

    case "final":
      return (
        <div className="flex flex-col items-center text-center">
          <h1 className="text-gradient font-mono text-7xl font-bold tracking-tight">Gracias</h1>
          <p className="mt-4 text-lg text-muted">{W3_MATERIA}</p>
          <p className="mt-6 text-lg font-medium">{COM_AUTOR}</p>
          <p className="text-sm text-muted">{COM_AUTOR_CARGO}</p>
          <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-10 flex flex-col items-center gap-3">
            <img src={COM_QR_SRC} alt="QR a Instagram" width={210} height={210} className="rounded-2xl border border-line bg-white p-3" />
            <span className="font-mono text-lg text-teal">@marquitorossi</span>
          </a>
        </div>
      );
  }
}

/** Placa de ingreso: QR gigante + contador en vivo. */
function Ingreso() {
  const { data } = useLive<{ participants: number }>(`/api/session/${W3_SLUG}`, 3000);
  return (
    <div className="flex flex-col items-center text-center">
      <p className="text-sm uppercase tracking-[0.3em] text-faint">Sacá el celular y escaneá</p>
      <div className="rise mt-6" style={{ animationDelay: "0.15s" }}>
        <img
          src={W3_QR_PLATAFORMA}
          alt="QR para entrar a la plataforma"
          className="pulse-ring rounded-3xl border border-line bg-white p-4"
          style={{ width: "min(46vh, 420px)", height: "min(46vh, 420px)" }}
        />
      </div>
      <p className="rise mt-6 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
        o escribí el link
      </p>
      <p className="text-gradient rise font-mono text-4xl font-bold tracking-tight" style={{ animationDelay: "0.35s" }}>
        {W3_LINK}
      </p>
      <div className="rise mt-6 flex items-center gap-3 text-muted" style={{ animationDelay: "0.5s" }}>
        <span className="size-3 animate-pulse rounded-full bg-teal" />
        <span className="text-3xl font-semibold text-foreground">{data?.participants ?? 0}</span>
        <span className="text-lg">ya entraron</span>
      </div>
    </div>
  );
}

// --- Placa de actividad + resultados en vivo -------------------------------

function SlideActividad({ act, escena }: { act: W3Actividad; escena: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-yellow-400">
            <span className="size-1.5 rounded-full bg-current" />
            {escena} · en vivo
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{act.titulo}</h1>
          <p className="mt-3 max-w-3xl text-xl italic leading-snug text-muted">“{act.bajada}”</p>
        </div>
        <div className="pulse-ring flex shrink-0 items-center gap-3 rounded-xl border-gradient px-4 py-3">
          <img
            src={W3_QR_PLATAFORMA}
            alt="QR para entrar a la plataforma"
            width={92}
            height={92}
            className="rounded-lg border border-line bg-white p-1"
          />
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest text-faint">Respondé en tu celular</p>
            <p className="text-gradient mt-0.5 font-mono text-sm font-bold">{W3_LINK}</p>
          </div>
        </div>
      </div>
      <div className="rise mt-6 flex-1" style={{ animationDelay: "0.2s" }}>
        <Vivo act={act} />
      </div>
    </div>
  );
}

type VivoResp = {
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
};

function Vivo({ act }: { act: W3Actividad }) {
  const { data } = useLive<VivoResp>(`/api/session/${W3_SLUG}/results?activity=${act.key}`, W3_POLL.deck);
  const r = data ?? null;

  return (
    <div className="glass glow-teal flex min-h-[40vh] flex-col rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2 text-sm text-faint">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        Resultados en vivo
        {r && (
          <span className="ml-auto">
            <b className="text-teal">{r.responded}</b>/{Math.max(r.participants, r.responded)} respondieron
          </span>
        )}
      </div>
      {!r ? (
        <p className="text-sm text-faint">Cargando…</p>
      ) : act.kind === "encuesta" ? (
        <VivoEncuesta act={act} r={r} />
      ) : act.key === "w3_dao" ? (
        <VivoDao act={act} r={r} />
      ) : act.kind === "opciones" || act.kind === "chips" ? (
        <VivoBarras counts={(r.summary?.counts as Record<string, number>) ?? {}} opciones={act.opciones ?? []} />
      ) : act.kind === "texto" ? (
        <VivoMuro items={(r.summary?.respuestas as Array<{ name: string; respuesta: string }>) ?? []} />
      ) : (
        <VivoPalabras palabras={(r.summary?.palabras as Array<{ palabra: string; n: number }>) ?? []} />
      )}
    </div>
  );
}

function VivoEncuesta({ act, r }: { act: W3Actividad; r: VivoResp }) {
  const byQ = (r.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {(act.preguntas ?? []).map((q) => {
        const counts = byQ[q.id] ?? {};
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="mb-2 text-sm font-semibold text-muted">{q.q}</p>
            <div className="space-y-1.5">
              {q.opciones.map((o) => (
                <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** La votación DAO: un voto por persona… y después, un voto por token. */
function VivoDao({ act, r }: { act: W3Actividad; r: VivoResp }) {
  const counts = (r.summary?.counts as Record<string, number>) ?? {};
  const opciones = act.opciones ?? [];
  const max = Math.max(1, ...Object.values(counts));
  // El giro de la placa siguiente: el profesor tiene 10.000 tokens y vota en contra.
  const TOKENS_BALLENA = 10000;
  const conBallena: Record<string, number> = { ...counts, contra: (counts.contra ?? 0) + TOKENS_BALLENA };
  const maxB = Math.max(1, ...Object.values(conBallena));
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-sm font-semibold text-teal">🙋 1 persona = 1 voto</p>
        <div className="space-y-2">
          {opciones.map((o) => (
            <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} grande />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-violet">🪙 1 token = 1 voto — 🐋 el profesor tiene 10.000 y vota en contra</p>
        <div className="space-y-2">
          {opciones.map((o) => (
            <Barra key={o.id} label={o.label} emoji={o.emoji} n={conBallena[o.id] ?? 0} max={maxB} grande />
          ))}
        </div>
      </div>
    </div>
  );
}

function VivoBarras({ counts, opciones }: { counts: Record<string, number>; opciones: Array<{ id: string; emoji: string; label: string }> }) {
  const max = Math.max(1, ...Object.values(counts));
  const rows = [...opciones].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0));
  return (
    <div className="space-y-2">
      {rows.map((o) => (
        <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} grande />
      ))}
    </div>
  );
}

function Barra({ label, emoji, n, max, grande }: { label: string; emoji?: string; n: number; max: number; grande?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("shrink-0 truncate text-right", grande ? "w-64 text-base" : "w-44 text-xs")}>
        {emoji && <span className="mr-1.5">{emoji}</span>}
        {label}
      </div>
      <div className={cn("flex-1 overflow-hidden rounded-lg bg-panel/50", grande ? "h-7" : "h-5")}>
        <div
          className="flex h-full items-center justify-end rounded-lg bg-gradient-to-r from-teal via-cyan to-violet px-2 text-xs font-bold text-ink transition-all duration-700"
          style={{ width: `${(n / max) * 100}%` }}
        >
          {n > 0 && n}
        </div>
      </div>
    </div>
  );
}

function VivoMuro({ items }: { items: Array<{ name: string; respuesta: string }> }) {
  if (!items.length) return <p className="text-sm text-faint">Todavía no hay respuestas — dales un minuto.</p>;
  return (
    <div className="grid max-h-[46vh] content-start gap-x-8 gap-y-2.5 overflow-auto lg:grid-cols-2">
      {items
        .slice()
        .reverse()
        .map((p, i) => (
          <p key={i} className="text-base leading-snug text-muted">
            <span className="font-semibold text-teal">{p.name.split(/\s+/)[0]}</span> · {p.respuesta}
          </p>
        ))}
    </div>
  );
}

function VivoPalabras({ palabras }: { palabras: Array<{ palabra: string; n: number }> }) {
  if (!palabras.length) return <p className="text-sm text-faint">Esperando las primeras palabras…</p>;
  const max = Math.max(1, ...palabras.map((p) => p.n));
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-6">
      {palabras.map((p) => (
        <span
          key={p.palabra}
          className="font-semibold transition-all duration-700"
          style={{ fontSize: `${1 + (p.n / max) * 1.8}rem`, opacity: 0.55 + (p.n / max) * 0.45 }}
        >
          {p.palabra}
          {p.n > 1 && <span className="ml-1 text-base text-teal">×{p.n}</span>}
        </span>
      ))}
    </div>
  );
}

/** Red de nodos flotando detrás de la portada. */
function Constelacion() {
  const nodos: Array<[number, number, number]> = [
    [80, 60, 3], [220, 30, 2.5], [370, 80, 3.5], [520, 40, 2.5], [660, 90, 3],
    [140, 190, 2.5], [330, 220, 3], [500, 200, 2.5], [620, 240, 3.5], [60, 300, 3],
    [250, 330, 2.5], [450, 310, 3], [680, 330, 2.5],
  ];
  const lineas: Array<[number, number]> = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [2, 6], [4, 8], [5, 6], [6, 7], [7, 8], [5, 9], [6, 10], [7, 11], [8, 12], [10, 11],
  ];
  return (
    <svg
      aria-hidden
      viewBox="0 0 740 380"
      className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-25"
    >
      {lineas.map(([a, b], i) => (
        <line key={i} x1={nodos[a][0]} y1={nodos[a][1]} x2={nodos[b][0]} y2={nodos[b][1]} stroke="#5eead4" strokeWidth="0.7">
          <animate attributeName="opacity" values="0.15;0.6;0.15" dur={`${4 + (i % 5)}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodos.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? "#8b5cf6" : "#5eead4"}>
          <animate attributeName="opacity" values="0.4;1;0.4" dur={`${3 + (i % 4)}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" />
          <animate attributeName="cy" values={`${y};${y - 6};${y}`} dur={`${6 + (i % 5)}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}
