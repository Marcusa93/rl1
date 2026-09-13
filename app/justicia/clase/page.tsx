"use client";

// Presentación de la masterclass "Justicia aumentada" (El Salvador,
// 14/09/2026). La placa manda: al llegar a una placa de actividad, la
// activa sola vía la API (cookie docente) y muestra los resultados en
// vivo. Los participantes responden desde /justicia.
//
// Teclado: ← → avanzar · Home inicio · Shift+R reiniciar la sesión
// (borra participantes y respuestas — usar después de ensayar).

import { useCallback, useEffect, useRef, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import { ChipResponda, Constelacion, ganador, PlacaIngreso, ResultadosVivo, useResultados } from "@/components/clase/vivo";
import { DiagramaJus } from "@/components/justicia/diagramas";
import { DEMO_INICIAL, DemoExpediente, EtiquetaDemo, type DemoEstado } from "@/components/justicia/expediente";
import {
  getJusActividad,
  JUS_AUTOR,
  JUS_CARGO,
  JUS_CONFIG,
  JUS_EVENTO,
  JUS_FECHA,
  JUS_LINK,
  JUS_LOGOS,
  JUS_QR_PLATAFORMA,
  JUS_SLIDES,
  JUS_SLUG,
  JUS_SUBTITLE,
  JUS_TITLE,
  type JusDemo,
  type JusSlide,
} from "@/lib/justicia-clase";
import { getDoc } from "@/lib/justicia-caso";
import { COM_INSTAGRAM_URL, COM_QR_SRC } from "@/lib/comercial";
import type { ActividadVivo } from "@/lib/clase-vivo";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "justicia-clase-slide";

// --- Acceso docente -----------------------------------------------------------

export default function JusticiaClasePage() {
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
          <h1 className="text-lg font-semibold">Presentación · {JUS_TITLE}</h1>
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

// --- La presentación ------------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

function Deck() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), JUS_SLIDES.length - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const [demo, setDemoRaw] = useState<DemoEstado>(DEMO_INICIAL);
  const setDemo = useCallback((fn: (e: DemoEstado) => DemoEstado) => setDemoRaw(fn), []);
  const lastActivada = useRef<string | null>(null);

  const go = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 0), JUS_SLIDES.length - 1);
    setIdx(next);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }, []);

  const slide = JUS_SLIDES[idx];

  const activar = useCallback((key: string) => {
    lastActivada.current = key;
    setEstado({ key, status: "enviando" });
    fetch(`/api/session/${JUS_SLUG}/activity`, {
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
      await fetch(`/api/session/${JUS_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      setDemoRaw(DEMO_INICIAL);
      const actual = JUS_SLIDES[idx];
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

  const parteActual = JUS_SLIDES.slice(0, idx + 1)
    .reverse()
    .find((s) => s.parte)?.parte;

  const estadoNombre = estado ? (getJusActividad(estado.key)?.titulo ?? "Ingreso") : "";

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / JUS_SLIDES.length) * 100}%` }}
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

      <main key={idx} className="rise mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-10 py-16">
        <Slide slide={slide} demo={demo} setDemo={setDemo} />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between px-5 py-3 text-xs text-faint">
        <span className="hidden sm:block">{JUS_AUTOR} · Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT</span>
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
            {idx + 1} / {JUS_SLIDES.length}
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

// --- Placas -----------------------------------------------------------------------

function Logos({ alto = 64 }: { alto?: number }) {
  return (
    <div className="flex items-center justify-center gap-8">
      {JUS_LOGOS.map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt={l.alt}
          style={{ height: alto }}
          className={cn("w-auto", l.fondo && "rounded-xl bg-white p-1.5")}
        />
      ))}
    </div>
  );
}

function Slide({
  slide,
  demo,
  setDemo,
}: {
  slide: JusSlide;
  demo: DemoEstado;
  setDemo: (fn: (e: DemoEstado) => DemoEstado) => void;
}) {
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
          <Logos alto={62} />
          <h1 className="text-gradient mt-8 font-mono text-7xl font-bold tracking-tight">{JUS_TITLE}</h1>
          <p className="rise mt-4 max-w-3xl text-2xl text-muted" style={{ animationDelay: "0.2s" }}>
            {JUS_SUBTITLE}
          </p>
          <p className="rise mt-2 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
            {JUS_EVENTO} · {JUS_FECHA}
          </p>
          <p className="rise mt-5 text-lg font-medium" style={{ animationDelay: "0.4s" }}>
            {JUS_AUTOR}
          </p>
          <p className="rise text-sm text-muted" style={{ animationDelay: "0.45s" }}>
            {JUS_CARGO}
          </p>
          <div className="rise mt-8 flex items-center gap-10" style={{ animationDelay: "0.6s" }}>
            <div className="flex items-center gap-5">
              <img src={JUS_QR_PLATAFORMA} alt="Código QR para ingresar" width={150} height={150} className="rounded-xl border border-line bg-white p-2" />
              <div className="pulse-ring rounded-2xl border-gradient px-7 py-5 text-left">
                <p className="text-xs uppercase tracking-widest text-faint">Ingrese desde su celular</p>
                <p className="text-gradient mt-1 font-mono text-2xl font-bold">{JUS_LINK}</p>
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
      return <PlacaIngreso slug={JUS_SLUG} qr={JUS_QR_PLATAFORMA} link={JUS_LINK} />;

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
          <div className="rise mx-auto mt-7 w-full max-w-3xl" style={{ animationDelay: "0.25s" }}>
            <div className="glass rounded-2xl p-5">
              <DiagramaJus id={slide.diagrama} />
            </div>
          </div>
          {slide.pills && (
            <div className="mt-5 flex flex-wrap justify-center gap-2">
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
            <p className="rise mx-auto mt-5 max-w-3xl text-center text-xl italic leading-relaxed text-muted" style={{ animationDelay: "0.4s" }}>
              {slide.lede}
            </p>
          )}
        </div>
      );

    case "actividad": {
      const act = getJusActividad(slide.activa);
      if (!act) return null;
      return <SlideActividad act={act} escena={slide.escena} material={slide.material} />;
    }

    case "demo":
      return <SlideDemo slide={slide} demo={demo} setDemo={setDemo} />;

    case "final":
      return (
        <div className="flex flex-col items-center text-center">
          <Logos alto={54} />
          <h1 className="text-gradient mt-8 font-mono text-7xl font-bold tracking-tight">Gracias</h1>
          <p className="mt-4 text-lg text-muted">{JUS_EVENTO}</p>
          <p className="mt-5 text-lg font-medium">{JUS_AUTOR}</p>
          <p className="text-sm text-muted">{JUS_CARGO}</p>
          <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-8 flex flex-col items-center gap-3">
            <img src={COM_QR_SRC} alt="Código QR a Instagram" width={190} height={190} className="rounded-2xl border border-line bg-white p-3" />
            <span className="font-mono text-lg text-teal">@marquitorossi</span>
          </a>
        </div>
      );
  }
}

// --- Placa de actividad ---------------------------------------------------------------

function SlideActividad({ act, escena, material }: { act: ActividadVivo; escena: string; material?: "resumen" | "captura" }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-yellow-400">
            <span className="size-1.5 rounded-full bg-current" />
            {escena} · en vivo
          </p>
          <h1 className="text-4xl font-bold tracking-tight">{act.titulo}</h1>
          <p className="mt-3 max-w-3xl text-xl italic leading-snug text-muted">{act.bajada}</p>
        </div>
        <ChipResponda qr={JUS_QR_PLATAFORMA} link={JUS_LINK} />
      </div>

      {material === "resumen" && <MaterialResumen />}
      {material === "captura" && <MaterialCaptura />}

      <div className="rise mt-5 flex-1" style={{ animationDelay: "0.25s" }}>
        <ResultadosVivo slug={JUS_SLUG} act={act} intervalo={JUS_CONFIG.poll.deck} compacto={Boolean(material)} />
      </div>
    </div>
  );
}

/** Placa 18: el intercambio y el resumen que la IA produjo sobre él. */
function MaterialResumen() {
  const d4 = getDoc("D4");
  return (
    <div className="rise mt-5 grid gap-5 lg:grid-cols-2" style={{ animationDelay: "0.12s" }}>
      <div className="glass rounded-2xl p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-cyan">El intercambio (ficticio)</p>
        <div className="space-y-2.5">
          {d4.fragmentos.map((f) => (
            <p key={f.id} className="rounded-lg border border-line/60 p-3 text-base leading-relaxed">
              {f.texto}
            </p>
          ))}
        </div>
      </div>
      <div className="glass flex flex-col rounded-2xl p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet">✨ Resumen generado por IA</p>
        <p className="flex flex-1 items-center rounded-xl border border-violet/40 bg-violet/10 p-5 text-2xl font-medium leading-snug">
          “Las partes coinciden en la deuda; solo discuten el plazo de pago.”
        </p>
      </div>
    </div>
  );
}

/** Placa 28: la captura que se incorporó al expediente. */
function MaterialCaptura() {
  return (
    <div className="rise mt-6 flex justify-center" style={{ animationDelay: "0.12s" }}>
      <div className="w-full max-w-md rounded-3xl border border-line bg-ink-2/80 p-5 shadow-2xl">
        <div className="mb-4 flex items-center gap-3 border-b border-line/60 pb-3">
          <span className="flex size-9 items-center justify-center rounded-full bg-teal/20 text-sm">🏫</span>
          <div>
            <p className="text-sm font-semibold">Encargado · Colegio Los Almendros</p>
            <p className="text-xs text-faint">captura agregada al expediente · D5 · ficticia</p>
          </div>
        </div>
        <div className="flex justify-start">
          <p className="rounded-2xl rounded-tl-sm bg-teal/15 px-5 py-3 text-2xl">Sí, recibimos todo 👍</p>
        </div>
        <p className="mt-2 text-right font-mono text-xs text-faint">28/03/2026 · 18:42</p>
      </div>
    </div>
  );
}

// --- Placa de demostración ---------------------------------------------------------------

function SlideDemo({
  slide,
  demo,
  setDemo,
}: {
  slide: JusDemo;
  demo: DemoEstado;
  setDemo: (fn: (e: DemoEstado) => DemoEstado) => void;
}) {
  // El voto del público ("¿por dónde empezamos?") decide la vista inicial del recorrido.
  const { data } = useResultados(JUS_SLUG, "jus_entrada", 4000);
  const elegida = ganador(data?.summary?.counts as Record<string, number> | undefined);

  return (
    <div>
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{slide.titulo}</h1>
          <p className="mt-2 text-xl text-muted">{slide.bajada}</p>
        </div>
        <EtiquetaDemo />
      </div>
      <DemoExpediente modo={slide.modo} estado={demo} setEstado={setDemo} ganador={elegida} />
      {slide.modo === "revision" && (
        <p className="mt-4 text-center text-sm text-faint">
          <b className="text-muted">CuscatIA</b> investiga cómo diseñar asistencia para tareas instrumentales de redacción judicial, con control
          humano y trazabilidad. Es un proyecto en desarrollo, no un sistema institucional implementado.
        </p>
      )}
    </div>
  );
}
