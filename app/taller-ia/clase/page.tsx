"use client";

// Presentación del taller "IA para arbitraje y mediación" (El Salvador,
// 16 y 17/09/2026). Mismo motor que /justicia/clase: la placa manda (activa
// sola su actividad), resultados en vivo, kit de herramientas abajo.
// Teclado: ← → avanzar · Home inicio · Shift+R reiniciar la sesión
// (usarlo entre el grupo del miércoles y el del jueves).

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { ChipResponda, Constelacion, PlacaIngreso, ResultadosVivo } from "@/components/clase/vivo";
import { Explorables } from "@/components/clase/explorables";
import {
  getTalActividad,
  TAL_AUTOR,
  TAL_CARGO,
  TAL_CONFIG,
  TAL_EVENTO,
  TAL_FECHA,
  TAL_LINK,
  TAL_LOGOS,
  TAL_QR_PLATAFORMA,
  TAL_SLIDES,
  TAL_SLUG,
  TAL_SUBTITLE,
  TAL_TITLE,
  type TalSlide,
} from "@/lib/taller-clase";
import { JUS_KIT } from "@/lib/justicia-clase";
import { COM_INSTAGRAM_URL, COM_QR_SRC } from "@/lib/comercial";
import type { ActividadVivo } from "@/lib/clase-vivo";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "taller-ia-clase-slide";

// --- Acceso docente -------------------------------------------------------------

export default function TallerClasePage() {
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
          <h1 className="text-lg font-semibold">Presentación · {TAL_TITLE}</h1>
          <p className="mt-1 text-sm text-muted">La presentación activa las actividades por su cuenta; por eso pide la clave docente.</p>
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

// --- La presentación ---------------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

function Deck() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), TAL_SLIDES.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  // null = lo que indique la placa; true/false = lo que eligió el docente en esta placa
  const [kitManual, setKitManual] = useState<boolean | null>(null);
  const lastActivada = useRef<string | null>(null);

  const go = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 0), TAL_SLIDES.length - 1);
    setIdx(next);
    setKitManual(null);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }, []);

  const slide = TAL_SLIDES[idx];

  const activar = useCallback((key: string) => {
    lastActivada.current = key;
    setEstado({ key, status: "enviando" });
    fetch(`/api/session/${TAL_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_activity: key }),
    })
      .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
      .catch(() => setEstado({ key, status: "error" }));
  }, []);

  // La placa manda: si tiene actividad asociada, se activa sola.
  useEffect(() => {
    const key = "activa" in slide ? slide.activa : undefined;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [slide, activar]);

  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes y sus respuestas.")) return;
      await fetch(`/api/session/${TAL_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const actual = TAL_SLIDES[idx];
      if ("activa" in actual) activar(actual.activa);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(idx + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "R" && e.shiftKey) reiniciar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx, activar]);

  const parteActual = TAL_SLIDES.slice(0, idx + 1)
    .reverse()
    .find((s) => s.parte)?.parte;
  const estadoNombre = estado ? (getTalActividad(estado.key)?.titulo ?? "Ingreso") : "";
  const kitVisible = kitManual ?? Boolean(slide.kit);

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / TAL_SLIDES.length) * 100}%` }}
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
          {estado.status === "error" && "no se pudo activar — vuelva a ingresar la clave"}
        </div>
      )}

      <main
        key={idx}
        className={cn(
          "rise mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-10 sm:px-10 sm:py-16",
          kitVisible && "pb-32 sm:pb-32",
        )}
      >
        <Slide slide={slide} />
      </main>

      {kitVisible && (
        <div className="fixed inset-x-0 bottom-14 z-40 flex justify-center px-4">
          <div className="rise glass flex max-w-full flex-wrap items-center justify-center gap-2 rounded-2xl px-3 py-2">
            <span className="px-1 text-[11px] uppercase tracking-widest text-faint">Kit</span>
            {JUS_KIT.map((h) => (
              <a
                key={h.id}
                href={h.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-line bg-panel/60 px-3 py-1.5 text-sm text-foreground transition hover:border-teal/60 hover:text-teal"
              >
                <span>{h.emoji}</span>
                {h.label}
              </a>
            ))}
          </div>
        </div>
      )}

      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 px-5 py-3 text-xs text-faint">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setKitManual(!kitVisible)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 transition",
              kitVisible ? "border-teal/60 bg-teal/15 text-teal" : "border-line bg-panel/60 text-muted hover:text-teal",
            )}
            aria-expanded={kitVisible}
            aria-label="Kit de herramientas"
          >
            🧰 Herramientas
          </button>
          <span className="hidden min-w-0 truncate lg:block">{TAL_AUTOR} · Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT</span>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
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
            {idx + 1} / {TAL_SLIDES.length}
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

// --- Placas ------------------------------------------------------------------------------

function Logos({ alto = 64 }: { alto?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
      {TAL_LOGOS.map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt={l.alt}
          style={{ height: alto, maxHeight: "9vw" }}
          className={cn("w-auto", l.fondo && "rounded-xl bg-white p-1.5")}
        />
      ))}
    </div>
  );
}

function Slide({ slide }: { slide: TalSlide }) {
  switch (slide.t) {
    case "portada":
      return (
        <div className="relative flex flex-col items-center text-center">
          <Constelacion />
          <Logos alto={62} />
          <h1 className="text-gradient mt-8 max-w-full break-words font-mono text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {TAL_TITLE}
          </h1>
          <p className="rise mt-4 max-w-3xl text-lg text-muted sm:text-2xl" style={{ animationDelay: "0.2s" }}>
            {TAL_SUBTITLE}
          </p>
          <p className="rise mt-2 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
            {TAL_EVENTO} · {TAL_FECHA}
          </p>
          <p className="rise mt-5 text-lg font-medium" style={{ animationDelay: "0.4s" }}>
            {TAL_AUTOR}
          </p>
          <p className="rise text-sm text-muted" style={{ animationDelay: "0.45s" }}>
            {TAL_CARGO}
          </p>
          <div className="rise mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10" style={{ animationDelay: "0.6s" }}>
            <div className="flex flex-wrap items-center justify-center gap-5">
              <img src={TAL_QR_PLATAFORMA} alt="Código QR para ingresar" width={150} height={150} className="rounded-xl border border-line bg-white p-2" />
              <div className="pulse-ring rounded-2xl border-gradient px-5 py-4 text-left sm:px-7 sm:py-5">
                <p className="text-xs uppercase tracking-widest text-faint">Ingrese desde su celular</p>
                <p className="text-gradient mt-1 break-all font-mono text-xl font-bold sm:text-2xl">{TAL_LINK}</p>
                <p className="mt-1 text-xs text-faint">escanee el código o escriba la dirección</p>
              </div>
            </div>
            <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5">
              <img src={COM_QR_SRC} alt="Código QR a Instagram" width={110} height={110} className="rounded-xl border border-line bg-white p-2" />
              <span className="text-xs text-faint">@marquitorossi</span>
            </a>
          </div>
        </div>
      );

    case "ingreso":
      return <PlacaIngreso slug={TAL_SLUG} qr={TAL_QR_PLATAFORMA} link={TAL_LINK} />;

    case "placa":
      return (
        <div>
          {slide.parte && (
            <p className="mb-4 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-violet">
              <span className="size-1.5 rounded-full bg-current" />
              {slide.parte}
            </p>
          )}
          <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{slide.titulo}</h1>
          <p className="rise mt-3 max-w-3xl text-lg leading-snug text-muted sm:text-2xl" style={{ animationDelay: "0.12s" }}>
            {slide.bajada}
          </p>
          {slide.explora && (
            <div className="mt-6">
              <Explorables items={slide.explora} />
            </div>
          )}
          {slide.lede && (
            <p className="rise mx-auto mt-5 max-w-3xl text-center text-xl italic leading-relaxed text-muted" style={{ animationDelay: "0.4s" }}>
              {slide.lede}
            </p>
          )}
        </div>
      );

    case "actividad": {
      const act = getTalActividad(slide.activa);
      if (!act) return null;
      return <SlideActividad act={act} escena={slide.escena} />;
    }

    case "final":
      return (
        <div className="flex flex-col items-center text-center">
          <Logos alto={54} />
          <h1 className="text-gradient mt-8 font-mono text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">Gracias</h1>
          <p className="mt-4 text-lg text-muted">{TAL_EVENTO}</p>
          <p className="mt-5 text-lg font-medium">{TAL_AUTOR}</p>
          <p className="text-sm text-muted">{TAL_CARGO}</p>
          <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-8 flex flex-col items-center gap-3">
            <img src={COM_QR_SRC} alt="Código QR a Instagram" width={190} height={190} className="rounded-2xl border border-line bg-white p-3" />
            <span className="font-mono text-lg text-teal">@marquitorossi</span>
          </a>
        </div>
      );
  }
}

function SlideActividad({ act, escena }: { act: ActividadVivo; escena: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col-reverse items-start gap-5 md:flex-row md:justify-between md:gap-6">
        <div className="min-w-0">
          <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-yellow-400 sm:text-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {escena} · en vivo
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{act.titulo}</h1>
          <p className="mt-3 max-w-3xl text-base italic leading-snug text-muted sm:text-xl">{act.bajada}</p>
        </div>
        <ChipResponda qr={TAL_QR_PLATAFORMA} link={TAL_LINK} />
      </div>
      <div className="rise mt-5 flex-1" style={{ animationDelay: "0.25s" }}>
        <ResultadosVivo slug={TAL_SLUG} act={act} intervalo={TAL_CONFIG.poll.deck} />
      </div>
    </div>
  );
}
