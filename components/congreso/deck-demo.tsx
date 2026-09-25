"use client";

// La mesa de la demo (placa "No era eso."): el anonimizador ensayado corriendo
// dentro de la sala de control, versión por versión, con la instrucción que la
// produce. Es el plan B siempre a mano: si la generación en vivo falla, se sigue acá.

import { useState } from "react";
import { ANON_FALLA, ANON_FRASE, ANON_PASOS, ANON_PLAN_B } from "@/lib/congreso";
import { cn } from "@/lib/utils";
import { BotonCopiar, BotonPlaca, vars } from "./deck-piezas";
import { CG, FUENTE } from "./paleta";

type V = 1 | 2 | 3;

/** Dirección del anonimizador ensayado con la versión y las categorías que eligió la sala. */
export function urlAnonimizador(v: V, ocultar: string[], doc?: string) {
  return `${ANON_PLAN_B}?v=${v}&cats=${ocultar.join(",")}${doc ? `&doc=${doc}` : ""}`;
}

/** El iframe se dibuja más grande y se achica: así la herramienta se arma como en una pantalla de escritorio. */
const ESCALA = 0.62;

/** Con el foco adentro de la herramienta, el clicker (PageDown/PageUp) y Esc siguen manejando la sala. */
export function reenviarTeclas(e: React.SyntheticEvent<HTMLIFrameElement>) {
  try {
    e.currentTarget.contentWindow?.addEventListener("keydown", (ev) => {
      if (["Escape", "PageDown", "PageUp"].includes(ev.key)) {
        ev.preventDefault();
        window.dispatchEvent(new KeyboardEvent("keydown", { key: ev.key }));
      }
    });
  } catch {
    /* otro origen: no se puede escuchar */
  }
}

/** Ventana de "vista previa" con el anonimizador ensayado adentro. */
function MarcoApp({ v, ocultar, children, className }: { v: V; ocultar: string[]; children?: React.ReactNode; className?: string }) {
  const url = urlAnonimizador(v, ocultar, "docs/demanda-ledesma.pdf");
  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden rounded-[0.6rem] border border-cg-tinta/15 bg-white shadow-[0_24px_40px_-28px_rgba(60,40,12,0.7)]", className)}>
      <div className="flex h-[2.2rem] shrink-0 items-center gap-[0.8rem] border-b border-cg-tinta/10 bg-cg-papel-2/70 px-[0.9rem]">
        <span className="flex gap-[0.35rem]" aria-hidden>
          {[CG.lacre, CG.ocre, CG.salvia].map((col) => (
            <span key={col} className="size-[0.6rem] rounded-full" style={{ background: col, opacity: 0.7 }} />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-cg-blanco px-[0.8rem] py-[0.12rem] cg-mono text-[0.7rem] text-cg-sepia">
          anonimizador.html · versión {v} · un solo archivo, sin servidor
        </span>
        <a href={url} target="_blank" rel="noreferrer" className="shrink-0 cg-mono text-[0.66rem] uppercase tracking-[0.14em] text-cg-sepia hover:text-cg-tinta">
          abrir ↗
        </a>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <iframe
          key={url}
          src={url}
          title={`Anonimizador · versión ${v}`}
          className="absolute left-0 top-0 origin-top-left border-0 bg-white"
          style={{ width: `${100 / ESCALA}%`, height: `${100 / ESCALA}%`, transform: `scale(${ESCALA})` }}
          onLoad={reenviarTeclas}
        />
        {children}
      </div>
    </div>
  );
}

/** Pestañas V1…V3 (también desde el control remoto). */
function Versiones({ v, setV }: { v: V; setV: (v: V) => void }) {
  return (
    <div className="flex items-center gap-[0.35rem]">
      {([1, 2, 3] as V[]).map((x) => (
        <BotonPlaca key={x} activo={v === x} onClick={() => setV(x)} remoto={`Ver versión ${x}`} className="px-[0.75rem]">
          V{x}
        </BotonPlaca>
      ))}
    </div>
  );
}

/** La marca de corrección sobre la V1: tachadura, flecha y la nota del abogado. */
function Correccion() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="cg-sube absolute inset-y-[0.6rem] left-[0.5rem] w-[0.3rem] rounded-full bg-cg-lacre/70" />
      <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          d="M 30 60 C 120 40, 260 90, 370 70"
          fill="none"
          stroke={CG.lacre}
          strokeWidth={3}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="cg-traza"
          style={vars({ "--largo": 420 })}
        />
      </svg>
      <div
        className="cg-cae absolute bottom-[1.2rem] right-[1.2rem] max-w-[24rem] rounded-[0.2rem] border-l-[0.3rem] border-cg-lacre bg-cg-blanco/95 px-[1.1rem] py-[0.8rem] shadow-[0_14px_24px_-16px_rgba(60,40,12,0.8)]"
        style={vars({ "--rot": "-1.2deg", animationDelay: "0.5s" })}
      >
        <p className="cg-mono text-[0.68rem] uppercase tracking-[0.2em] text-cg-lacre">No era eso</p>
        <p className="mt-[0.3rem] text-[1rem] leading-snug text-cg-tinta">{ANON_FALLA}</p>
        <p className="mt-[0.5rem] text-[1.45rem] leading-[1.05] text-cg-lacre" style={{ fontFamily: FUENTE.mano }}>
          “{ANON_FRASE}”
        </p>
      </div>
    </div>
  );
}

/** Tira con la instrucción que produce la versión que se está viendo. */
function Instruccion({ v, prompt }: { v: V; prompt: string }) {
  return (
    <div className="flex items-start gap-[1rem] rounded-[0.4rem] border border-cg-tinta/15 bg-cg-blanco/80 px-[1rem] py-[0.7rem]">
      <span className="mt-[0.15rem] shrink-0 cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-lacre">{v === 1 ? "Instrucción" : `Corrección ${v - 1}`}</span>
      <p className="line-clamp-4 min-w-0 flex-1 cg-mono text-[0.86rem] leading-snug text-cg-tinta">{prompt}</p>
      <BotonCopiar texto={prompt} etiqueta="Copiar" />
    </div>
  );
}

/** Placa "No era eso.": la V1 con la falla marcada; se puede pasar a la V2 y a la V3. */
export function MesaAnonimizador({ ocultar, promptV1 }: { ocultar: string[]; promptV1: string }) {
  const [v, setV] = useState<V>(1);
  const [marca, setMarca] = useState(false);
  const paso = ANON_PASOS.find((p) => p.v === v);
  return (
    <div className="flex h-full min-h-0 flex-col gap-[0.7rem]">
      <div className="flex items-center justify-between gap-[1rem]">
        <Versiones v={v} setV={setV} />
        {v === 1 && (
          <BotonPlaca activo={marca} onClick={() => setMarca((m) => !m)} remoto="Marcar la falla">
            {marca ? "✓ Falla marcada" : "Marcar la falla"}
          </BotonPlaca>
        )}
      </div>
      <MarcoApp v={v} ocultar={ocultar} className="flex-1">
        {v === 1 && marca && <Correccion />}
      </MarcoApp>
      <Instruccion v={v} prompt={v === 1 ? promptV1 : (paso?.prompt ?? "")} />
    </div>
  );
}
