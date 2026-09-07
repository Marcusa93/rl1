"use client";

// Presentación de la clase "Empresas e IA", pensada para compartir por Zoom.
// La placa manda: al llegar a una placa de actividad, activa sola esa
// actividad en la sesión (vía la API, con la cookie docente) y muestra los
// resultados en vivo incrustados. Navegación: ← → , clic en los bordes o
// los botones de abajo.

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { Diagrama } from "@/components/comercial/diagramas";
import { useComResults } from "@/components/comercial/results";
import { CLASE_SLIDES, type ClaseSlide, type SlideActividad } from "@/lib/comercial-clase";
import {
  COM_AUTOR,
  COM_AUTOR_CARGO,
  COM_ENCUESTA,
  COM_INSTAGRAM_URL,
  COM_MATERIA,
  COM_QR_SRC,
  COM_SLUG,
  COM_SUBTITLE,
  COM_TITLE,
  COM_USOS,
  getBloque,
  comAgendaStep,
} from "@/lib/comercial";
import { cn } from "@/lib/utils";

const LINK_ALUMNOS = "rl1-beige.vercel.app/empresas";

// --- Acceso docente (misma clave que el panel) ---------------------------

export default function ClasePage() {
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
            {COM_TITLE} — la presentación activa las actividades sola, por eso pide la clave docente.
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

// --- La presentación ------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

function Deck() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem("empresas-clase-slide") ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), CLASE_SLIDES.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const lastActivada = useRef<string | null>(null);

  const go = useCallback((n: number) => {
    setIdx((prev) => {
      const next = Math.min(Math.max(n, 0), CLASE_SLIDES.length - 1);
      try {
        localStorage.setItem("empresas-clase-slide", String(next));
      } catch {}
      return next;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        setIdx((i) => {
          const n = Math.min(i + 1, CLASE_SLIDES.length - 1);
          try { localStorage.setItem("empresas-clase-slide", String(n)); } catch {}
          return n;
        });
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        setIdx((i) => {
          const n = Math.max(i - 1, 0);
          try { localStorage.setItem("empresas-clase-slide", String(n)); } catch {}
          return n;
        });
      } else if (e.key === "Home") go(0);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // La placa manda: si esta placa tiene actividad asociada, se activa sola.
  const slide = CLASE_SLIDES[idx];
  useEffect(() => {
    const key = "activa" in slide ? slide.activa : undefined;
    if (!key || lastActivada.current === key) return;
    lastActivada.current = key;
    setEstado({ key, status: "enviando" });
    fetch(`/api/session/${COM_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    })
      .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
      .catch(() => setEstado({ key, status: "error" }));
  }, [slide]);

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      {/* barra de progreso */}
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / CLASE_SLIDES.length) * 100}%` }}
        />
      </div>

      {/* estado de la actividad en vivo */}
      {estado && (
        <div
          className={cn(
            "fixed right-4 top-3 z-40 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
            estado.status === "error" ? "bg-magenta/15 text-magenta" : "bg-teal/15 text-teal",
          )}
        >
          <span className={cn("size-1.5 rounded-full", estado.status === "error" ? "bg-magenta" : "animate-pulse bg-teal")} />
          {estado.status === "enviando" && "activando…"}
          {estado.status === "ok" && <>en vivo: {comAgendaStep(estado.key).short}</>}
          {estado.status === "error" && "no se pudo activar — reingresá como docente"}
        </div>
      )}

      <main key={idx} className="rise mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-10 py-16">
        <Slide slide={slide} />
      </main>

      {/* pie: navegación + créditos + folio */}
      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between px-5 py-3 text-xs text-faint">
        <span className="hidden sm:block">
          {COM_AUTOR} · {COM_AUTOR_CARGO}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => go(idx - 1)}
            className="rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-muted transition hover:text-teal"
            aria-label="Anterior"
          >
            ◀
          </button>
          <span className="font-mono">
            {idx + 1} / {CLASE_SLIDES.length}
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

// --- Render por tipo de placa ---------------------------------------------

/** **negrita** inline sin markdown completo. */
function Rico({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Eyebrow({ children, color = "teal" }: { children: React.ReactNode; color?: "teal" | "violet" | "amber" }) {
  const cls = { teal: "text-teal", violet: "text-violet", amber: "text-yellow-400" }[color];
  return (
    <p className={cn("mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em]", cls)}>
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </p>
  );
}

function Slide({ slide }: { slide: ClaseSlide }) {
  switch (slide.t) {
    case "portada":
      return (
        <div className="flex flex-col items-center text-center">
          <LogoRL1 size={56} wordmark={false} className="mb-6" />
          <h1 className="text-gradient font-mono text-7xl font-bold tracking-tight">{COM_TITLE}</h1>
          <p className="mt-4 text-2xl text-muted">{COM_SUBTITLE}</p>
          <p className="mt-2 text-sm text-faint">{COM_MATERIA}</p>
          <p className="mt-6 text-lg font-medium">{COM_AUTOR}</p>
          <p className="text-sm text-muted">{COM_AUTOR_CARGO}</p>
          <div className="mt-10 flex items-center gap-8">
            <div className="rounded-2xl border-gradient px-8 py-5">
              <p className="text-xs uppercase tracking-widest text-faint">Entrá desde tu celular</p>
              <p className="text-gradient mt-1 font-mono text-2xl font-bold">{LINK_ALUMNOS}</p>
            </div>
            <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5">
              <img src={COM_QR_SRC} alt="QR a Instagram" width={104} height={104} className="rounded-lg border border-line bg-white p-1.5" />
              <span className="text-xs text-faint">@marquitorossi</span>
            </a>
          </div>
        </div>
      );

    case "texto":
      return (
        <div>
          <Eyebrow color={slide.eyebrow === "Concepto" ? "teal" : "violet"}>{slide.eyebrow}</Eyebrow>
          <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight">{slide.titulo}</h1>
          {slide.diagrama && (
            <div className="mt-8 flex justify-center">
              <Diagrama id={slide.diagrama} />
            </div>
          )}
          {slide.bullets && (
            <ul className="mt-8 max-w-3xl space-y-4">
              {slide.bullets.map((b) => (
                <li key={b} className="flex gap-4 text-2xl leading-snug">
                  <span className="font-bold text-teal">—</span>
                  <span>
                    <Rico text={b} />
                  </span>
                </li>
              ))}
            </ul>
          )}
          {slide.pasos && (
            <ol className="mt-8 max-w-3xl space-y-4">
              {slide.pasos.map((p, i) => (
                <li key={p} className="flex items-baseline gap-4 text-2xl">
                  <span className="flex size-9 flex-none items-center justify-center rounded-full bg-violet/25 font-mono text-base text-violet">
                    {i + 1}
                  </span>
                  {p}
                </li>
              ))}
            </ol>
          )}
          {slide.lede && (
            <p className="mt-8 max-w-3xl text-2xl leading-relaxed text-muted">
              <Rico text={slide.lede} />
            </p>
          )}
        </div>
      );

    case "caso":
      return (
        <div>
          <Eyebrow color="violet">Caso real</Eyebrow>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{slide.emoji}</span>
            <div>
              <p className="font-mono text-sm uppercase tracking-widest text-faint">{slide.empresa}</p>
              <h1 className="text-4xl font-bold tracking-tight">{slide.titulo}</h1>
            </div>
          </div>
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
            <ul className="space-y-4">
              {slide.bullets.map((b) => (
                <li key={b} className="flex gap-3 text-xl leading-snug">
                  <span className="font-bold text-teal">—</span>
                  {b}
                </li>
              ))}
            </ul>
            <div className="glass rounded-2xl p-4">
              <Diagrama id={slide.diagrama} />
            </div>
          </div>
          <div className="mt-8 max-w-4xl rounded-2xl border border-violet/40 bg-violet/10 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-violet">La pregunta jurídica</p>
            <p className="mt-1 text-2xl leading-snug">{slide.pregunta}</p>
          </div>
        </div>
      );

    case "video":
      return (
        <div>
          <Eyebrow color="violet">{slide.eyebrow}</Eyebrow>
          <h1 className="text-4xl font-bold tracking-tight">{slide.titulo}</h1>
          <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-black" style={{ aspectRatio: "16/9", maxHeight: "60vh" }}>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${slide.youtubeId}`}
              title={slide.titulo}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="mt-3 text-sm text-faint">
            {slide.nota}{" "}
            <a
              href={`https://www.youtube.com/watch?v=${slide.youtubeId}`}
              target="_blank"
              rel="noreferrer"
              className="text-teal underline-offset-2 hover:underline"
            >
              Abrir en YouTube ↗
            </a>
          </p>
        </div>
      );

    case "actividad":
      return <Actividad slide={slide} />;

    case "final":
      return (
        <div className="flex flex-col items-center text-center">
          <h1 className="text-gradient font-mono text-7xl font-bold tracking-tight">Gracias</h1>
          <p className="mt-4 text-lg text-muted">{COM_MATERIA}</p>
          <p className="mt-6 text-lg font-medium">{COM_AUTOR}</p>
          <p className="text-sm text-muted">{COM_AUTOR_CARGO}</p>
          <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-10 flex flex-col items-center gap-2">
            <img src={COM_QR_SRC} alt="QR a Instagram" width={130} height={130} className="rounded-xl border border-line bg-white p-2" />
            <span className="font-mono text-sm text-teal">@marquitorossi</span>
          </a>
        </div>
      );
  }
}

// --- Placa de actividad: se activa sola + resultados en vivo --------------

function Actividad({ slide }: { slide: SlideActividad }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-6">
        <div>
          <Eyebrow color="amber">{slide.escena} · en vivo</Eyebrow>
          <h1 className="text-4xl font-bold tracking-tight">{slide.titulo}</h1>
          {slide.resumen && <p className="mt-2 max-w-3xl text-base leading-relaxed text-muted">{slide.resumen}</p>}
          <p className="mt-3 max-w-3xl text-xl italic leading-snug text-muted">“{slide.pregunta}”</p>
        </div>
        <div className="shrink-0 rounded-xl border-gradient px-4 py-3 text-center">
          <p className="text-[10px] uppercase tracking-widest text-faint">Respondé en tu celular</p>
          <p className="text-gradient mt-0.5 font-mono text-sm font-bold">{LINK_ALUMNOS}</p>
        </div>
      </div>
      <div className="mt-6 flex-1">
        <Vivo activity={slide.activa} />
      </div>
    </div>
  );
}

type VivoResp = {
  participants: number;
  responded: number;
  summary: Record<string, unknown>;
};

function Vivo({ activity }: { activity: string }) {
  const { data } = useComResults(activity, 2500);
  const r = data as VivoResp | null;
  const bloque = getBloque(activity);

  return (
    <div className="glass flex min-h-[40vh] flex-col rounded-2xl p-5">
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
      ) : activity === "emp_encuesta" ? (
        <VivoEncuesta r={r} />
      ) : activity === "emp_usos" ? (
        <VivoBarras counts={(r.summary?.counts as Record<string, number>) ?? {}} opciones={COM_USOS} />
      ) : bloque?.kind === "chips" ? (
        <VivoBarras counts={(r.summary?.counts as Record<string, number>) ?? {}} opciones={bloque.opciones} />
      ) : bloque?.kind === "opciones" ? (
        <>
          <VivoBarras counts={(r.summary?.counts as Record<string, number>) ?? {}} opciones={bloque.opciones} />
          <VivoMuro items={((r.summary?.comentarios as Array<{ name: string; comentario: string }>) ?? []).map((c) => ({ name: c.name, texto: c.comentario }))} className="mt-4 border-t border-line/60 pt-3" />
        </>
      ) : bloque ? (
        <VivoMuro items={((r.summary?.respuestas as Array<{ name: string; respuesta: string }>) ?? []).map((c) => ({ name: c.name, texto: c.respuesta }))} />
      ) : activity === "emp_cierre" ? (
        <VivoPalabras palabras={(r.summary?.palabras as Array<{ palabra: string; n: number }>) ?? []} />
      ) : null}
    </div>
  );
}

function VivoEncuesta({ r }: { r: VivoResp }) {
  const byQ = (r.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {COM_ENCUESTA.map((q) => {
        const counts = byQ[q.id] ?? {};
        const max = Math.max(1, ...Object.values(counts));
        return (
          <div key={q.id}>
            <p className="mb-2 text-sm font-semibold text-muted">{q.q}</p>
            <div className="space-y-1.5">
              {q.options.map((o) => (
                <Barra key={o.id} label={o.label} emoji={o.emoji} n={counts[o.id] ?? 0} max={max} />
              ))}
            </div>
          </div>
        );
      })}
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
      <div className={cn("shrink-0 truncate text-right", grande ? "w-72 text-base" : "w-48 text-xs")}>
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

function VivoMuro({ items, className }: { items: Array<{ name: string; texto: string }>; className?: string }) {
  if (!items.length) return <p className={cn("text-sm text-faint", className)}>Todavía no hay respuestas — dales un minuto.</p>;
  return (
    <div className={cn("grid max-h-[46vh] content-start gap-x-8 gap-y-2.5 overflow-auto lg:grid-cols-2", className)}>
      {items
        .slice()
        .reverse()
        .map((p, i) => (
          <p key={i} className="text-base leading-snug text-muted">
            <span className="font-semibold text-teal">{p.name.split(/\s+/)[0]}</span> · {p.texto}
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
