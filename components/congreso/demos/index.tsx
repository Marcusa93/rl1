"use client";

// Las tres apps "ensayadas" de la demo (plan B si la generación en vivo falla),
// cada una en sus cuatro versiones. Las usan:
//   /congreso/demo            → el tablero de Marco (BotonCopiarPrompt)
//   /congreso/demo/[caso]?v=  → la app a pantalla completa (DemoPantalla)
//   el deck                   → <DemoApp caso v /> dentro de un marco escalado

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CasoId } from "@/lib/congreso";
import { Cronologia } from "./cronologia";
import { Entrevista } from "./entrevista";
import { MatrizPrueba } from "./prueba";

export type VersionDemo = 1 | 2 | 3 | 4;

/** Una app ensayada en una versión. Llena su contenedor (h-full w-full, con scroll propio). */
export function DemoApp({ caso, v }: { caso: CasoId; v: VersionDemo }) {
  // key={v}: cada versión arranca de cero, como una app recién generada.
  switch (caso) {
    case "cronologia":
      return <Cronologia key={v} v={v} />;
    case "prueba":
      return <MatrizPrueba key={v} v={v} />;
    case "entrevista":
      return <Entrevista key={v} v={v} />;
  }
}

/** ¿El foco está en un campo donde se escribe? (ahí la H es una letra, no un atajo). */
function escribiendo(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  if (t.isContentEditable) return true;
  if (t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement) return true;
  if (t instanceof HTMLInputElement) return !["checkbox", "radio", "button", "submit", "reset", "range", "color"].includes(t.type);
  return false;
}

/** Pantalla completa de /congreso/demo/[caso]: barra fina (se oculta con H) + la app. */
export function DemoPantalla({
  caso,
  v,
  letra,
  prompt,
}: {
  caso: CasoId;
  v: VersionDemo;
  letra: string;
  prompt: string;
}) {
  const [barra, setBarra] = useState(true);

  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key !== "h" && e.key !== "H") return;
      if (e.metaKey || e.ctrlKey || e.altKey || escribiendo(e.target)) return;
      e.preventDefault();
      setBarra((b) => !b);
    }
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, []);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-white">
      {barra ? (
        <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-hidden bg-cg-tinta px-2 text-[13px] text-cg-blanco sm:gap-3 sm:px-3">
          <span className="cg-mono hidden shrink-0 font-semibold tracking-wide sm:inline">
            <span className="hidden md:inline">Versión ensayada · </span>
            {letra} · V{v}
          </span>
          <span className="min-w-0 flex-1 truncate italic text-cg-niebla" title={prompt}>
            “{prompt}”
          </span>
          <nav className="flex shrink-0 items-center gap-0.5" aria-label="Versiones">
            {([1, 2, 3, 4] as const).map((n) => (
              <Link
                key={n}
                href={`/congreso/demo/${caso}?v=${n}`}
                aria-current={n === v ? "page" : undefined}
                className={`cg-mono rounded px-1.5 py-1 font-semibold transition sm:px-2 ${
                  n === v ? "bg-cg-blanco text-cg-tinta" : "text-cg-blanco/75 hover:bg-white/10 hover:text-cg-blanco"
                }`}
              >
                V{n}
              </Link>
            ))}
          </nav>
          <Link
            href={`/congreso/demo#${caso}`}
            className="shrink-0 rounded px-2 py-1 text-cg-blanco/80 hover:bg-white/10 hover:text-cg-blanco"
          >
            ← Demo
          </Link>
          <button
            type="button"
            onClick={() => setBarra(false)}
            title="Ocultar la barra (tecla H)"
            className="shrink-0 cursor-pointer rounded px-2 py-1 text-cg-blanco/80 hover:bg-white/10 hover:text-cg-blanco"
          >
            Ocultar <kbd className="cg-mono hidden rounded border border-white/25 px-1 text-[11px] sm:inline">H</kbd>
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setBarra(true)}
          title="Mostrar la barra (tecla H)"
          className="absolute left-1/2 top-0 z-20 -translate-x-1/2 cursor-pointer rounded-b-md px-3 pb-0.5 text-[11px] text-transparent transition hover:bg-cg-tinta hover:text-cg-blanco focus-visible:bg-cg-tinta focus-visible:text-cg-blanco"
        >
          Mostrar barra · H
        </button>
      )}
      <div className="min-h-0 flex-1">
        <DemoApp caso={caso} v={v} />
      </div>
    </div>
  );
}

async function copiarTexto(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Botón "Copiar" del tablero de la demo (estética del Congreso). */
export function BotonCopiarPrompt({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<"" | "ok" | "error">("");
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copiarTexto(texto);
        setEstado(ok ? "ok" : "error");
        setTimeout(() => setEstado(""), 1800);
      }}
      className={`cg-mono shrink-0 cursor-pointer rounded-md border px-3 py-1.5 text-[13px] font-semibold transition active:scale-95 ${
        estado === "ok"
          ? "border-cg-musgo bg-cg-musgo text-cg-blanco"
          : "border-cg-tinta/25 bg-cg-blanco text-cg-tinta hover:bg-cg-tinta hover:text-cg-blanco"
      }`}
    >
      {estado === "ok" ? "¡Copiado!" : estado === "error" ? "Seleccionalo a mano" : "Copiar"}
    </button>
  );
}
