"use client";

// Presentación de la clase "Web3, descentralización y gobernanza"
// (Diplomatura en Derecho 5.0, UMSA). Mismo motor y estética que
// /empresas/clase, sin actividades en vivo: es una clase magistral.
// Navegación: ← →, clic en los botones del pie, Home vuelve al inicio.

import { useCallback, useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { DiagramaW3 } from "@/components/web3/diagramas";
import { W3_SLIDES, W3_MATERIA, W3_SUBTITLE, W3_TITLE, type W3Slide } from "@/lib/web3-clase";
import { COM_AUTOR, COM_AUTOR_CARGO, COM_INSTAGRAM_URL, COM_QR_SRC } from "@/lib/comercial";

const STORAGE_KEY = "web3-clase-slide";

export default function Web3ClasePage() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), W3_SLIDES.length - 1) : 0;
    } catch {
      return 0;
    }
  });

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

  const slide = W3_SLIDES[idx];
  const parteActual = W3_SLIDES.slice(0, idx + 1)
    .reverse()
    .find((s) => s.parte)?.parte;

  return (
    <div className="bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / W3_SLIDES.length) * 100}%` }}
        />
      </div>

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

// --- Placas ----------------------------------------------------------------

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
          <a
            href={COM_INSTAGRAM_URL}
            target="_blank"
            rel="noreferrer"
            className="rise mt-9 flex flex-col items-center gap-2"
            style={{ animationDelay: "0.6s" }}
          >
            <img src={COM_QR_SRC} alt="QR a Instagram" width={150} height={150} className="rounded-xl border border-line bg-white p-2" />
            <span className="font-mono text-sm text-faint">@marquitorossi</span>
          </a>
        </div>
      );

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
