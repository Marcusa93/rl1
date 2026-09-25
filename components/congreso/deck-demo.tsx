"use client";

// La mesa de la demo (placas 8, 9 y 10): la app ensayada corriendo dentro de
// la sala de control, versión por versión, con la instrucción que la produce.
// Es el plan B siempre a mano: si la generación en vivo falla, se sigue acá.

import { useState } from "react";
import { getCaso, type CasoId } from "@/lib/congreso";
import { cn } from "@/lib/utils";
import { DemoApp } from "./demos";
import { BotonCopiar, BotonPlaca, vars } from "./deck-piezas";
import { CG, FUENTE } from "./paleta";

type V = 1 | 2 | 3 | 4;

/** Escala de la app ensayada dentro del marco de la placa. */
const ZOOM = 0.66;

/** Ventana de "vista previa" con la app ensayada adentro. */
export function MarcoApp({ caso, v, children, className }: { caso: CasoId; v: V; children?: React.ReactNode; className?: string }) {
  const c = getCaso(caso);
  return (
    <div className={cn("relative flex min-h-0 flex-col overflow-hidden rounded-[0.6rem] border border-cg-tinta/15 bg-white shadow-[0_24px_40px_-28px_rgba(60,40,12,0.7)]", className)}>
      <div className="flex h-[2.2rem] shrink-0 items-center gap-[0.8rem] border-b border-cg-tinta/10 bg-cg-papel-2/70 px-[0.9rem]">
        <span className="flex gap-[0.35rem]" aria-hidden>
          {[CG.lacre, CG.ocre, CG.salvia].map((col) => (
            <span key={col} className="size-[0.6rem] rounded-full" style={{ background: col, opacity: 0.7 }} />
          ))}
        </span>
        <span className="min-w-0 flex-1 truncate rounded-full bg-cg-blanco px-[0.8rem] py-[0.12rem] cg-mono text-[0.7rem] text-cg-sepia">
          vista previa · {c?.app} · versión {v}
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden">
        {/* Achicada: así la app se arma como en una pantalla de escritorio (línea de tiempo a la vista). */}
        <div className="h-full w-full" style={{ zoom: ZOOM }}>
          <DemoApp key={`${caso}-${v}`} caso={caso} v={v} />
        </div>
        {children}
      </div>
    </div>
  );
}

/** Pestañas V1…V4 (también desde el control remoto). */
function Versiones({ v, setV, desde = 1 }: { v: V; setV: (v: V) => void; desde?: V }) {
  return (
    <div className="flex items-center gap-[0.35rem]">
      {([1, 2, 3, 4] as V[])
        .filter((x) => x >= desde)
        .map((x) => (
          <BotonPlaca key={x} activo={v === x} onClick={() => setV(x)} remoto={`Ver versión ${x}`} className="px-[0.75rem]">
            V{x}
          </BotonPlaca>
        ))}
    </div>
  );
}

/** La marca de corrección sobre la V1: tachadura, flecha y la nota del abogado. */
function Correccion({ falla, frase }: { falla: string; frase: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* margen de corrección, como en un borrador */}
      <div className="absolute inset-y-[0.6rem] left-[0.5rem] w-[0.3rem] rounded-full bg-cg-lacre/70 cg-sube" />
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
        <p className="mt-[0.3rem] text-[1rem] leading-snug text-cg-tinta">{falla}</p>
        <p className="mt-[0.5rem] text-[1.45rem] leading-[1.05] text-cg-lacre" style={{ fontFamily: FUENTE.mano }}>
          “{frase}”
        </p>
      </div>
    </div>
  );
}

/** Tira con la instrucción que produce la versión que se está viendo. */
function Instruccion({ caso, v }: { caso: CasoId; v: V }) {
  const c = getCaso(caso);
  const paso = c?.pasos.find((p) => p.v === v);
  if (!paso) return null;
  return (
    <div className="flex items-start gap-[1rem] rounded-[0.4rem] border border-cg-tinta/15 bg-cg-blanco/80 px-[1rem] py-[0.7rem]">
      <span className="mt-[0.15rem] shrink-0 cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-lacre">{v === 1 ? "Instrucción" : `Corrección ${v - 1}`}</span>
      <p className="min-w-0 flex-1 cg-mono text-[0.86rem] leading-snug text-cg-tinta">{paso.prompt}</p>
      <BotonCopiar texto={paso.prompt} etiqueta="Copiar" />
    </div>
  );
}

/** Placa 9: la V1 con la falla marcada; se puede pasar a la V2 (la corrección). */
export function MesaError({ caso }: { caso: CasoId }) {
  const [v, setV] = useState<V>(1);
  const [marca, setMarca] = useState(false);
  const c = getCaso(caso);
  if (!c) return null;
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
      <MarcoApp caso={caso} v={v} className="flex-1">
        {v === 1 && marca && <Correccion falla={c.falla} frase={c.frase} />}
      </MarcoApp>
      <Instruccion caso={caso} v={v} />
    </div>
  );
}

/** Placa 10: segunda y tercera modificación. */
export function MesaPrueba({ caso }: { caso: CasoId }) {
  const [v, setV] = useState<V>(3);
  return (
    <div className="flex h-full min-h-0 flex-col gap-[0.7rem]">
      <div className="flex items-center justify-between gap-[1rem]">
        <Versiones v={v} setV={setV} desde={2} />
        <span className="cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-gris">versiones ensayadas · plan B</span>
      </div>
      <MarcoApp caso={caso} v={v} className="flex-1" />
      <Instruccion caso={caso} v={v} />
    </div>
  );
}
