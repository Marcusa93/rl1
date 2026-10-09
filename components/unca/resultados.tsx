"use client";

// Resultados en vivo de las intervenciones de /unca, con la estética de las
// placas. Cada placa con intervención los integra: nube, barras, escala con
// promedio, clasificación apilada. El docente decide cuándo se ven (R) y
// cuándo se revela la respuesta orientativa (E). En modo demostración (D) se
// usan datos ficticios: por si falla la conexión colectiva o para ensayar.

import { createContext, useContext } from "react";
import { useResultados } from "@/components/clase/vivo";
import { C } from "@/components/unca/piezas";
import { NUBE_MAX, tamanosNube } from "@/lib/nube";
import type { UcActividad } from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

/** Estado de una intervención en el deck: si se ven los resultados y si se reveló la respuesta. */
export interface VistaAct {
  mostrar: boolean;
  revelada: boolean;
}

export interface CtxVivo {
  slug: string;
  intervalo: number;
  demo: boolean;
  vista: (act: UcActividad) => VistaAct;
  /** Palabras ocultas por moderación (desde la ventana de notas). */
  ocultas: (key: string) => string[];
  alternarMostrar: (act: UcActividad) => void;
  alternarRevelar: (act: UcActividad) => void;
}

export const VivoCtx = createContext<CtxVivo>({
  slug: "",
  intervalo: 3000,
  demo: false,
  vista: (a) => ({ mostrar: !a.ocultos, revelada: false }),
  ocultas: () => [],
  alternarMostrar: () => {},
  alternarRevelar: () => {},
});
export const useVivo = () => useContext(VivoCtx);

type Datos = { participants: number; responded: number; summary: Record<string, unknown> };

/** Resultados de una intervención (los reales o, en modo demostración, los ficticios). */
export function useDatos(act: UcActividad | undefined): Datos | null {
  const { slug, intervalo, demo } = useVivo();
  const { data } = useResultados(slug, act?.key ?? "lobby", intervalo);
  if (!act) return null;
  if (demo) return { participants: act.demo.respondieron + 3, responded: act.demo.respondieron, summary: act.demo.summary };
  return data;
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);

/** Encabezado de una intervención: número, formato y cuántos respondieron. */
export function CintaIntervencion({ act, datos }: { act: UcActividad; datos: Datos | null }) {
  const { demo } = useVivo();
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="flex items-center gap-2 rounded-full border border-uc-ocre/50 bg-uc-ocre-claro px-4 py-1.5">
        <span className="size-2 animate-pulse rounded-full bg-uc-ocre" />
        <span className="uc-rotulo text-[0.66rem] text-uc-ocre">Participación en vivo · {act.numero} de 8</span>
        <span className="text-[0.9rem] text-uc-tinta">{act.formato}</span>
      </span>
      {datos && (
        <span className="text-[0.95rem] text-uc-pizarra tabular-nums">
          <b className="uc-serif text-[1.4rem] text-uc-tinta">{datos.responded}</b> de {Math.max(datos.participants, datos.responded)} respondieron
        </span>
      )}
      {demo && <span className="rounded-md bg-uc-tinta px-2 py-0.5 text-[0.7rem] font-semibold tracking-wider text-white">MODO DEMOSTRACIÓN</span>}
    </div>
  );
}

/** Mientras los resultados están ocultos: solo la cuenta, para no influir en el voto. */
export function Ocultos({ datos, act }: { datos: Datos | null; act: UcActividad }) {
  const { alternarMostrar } = useVivo();
  const n = datos?.responded ?? 0;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-uc-linea bg-uc-hoja/60 py-10 text-center">
      <p className="uc-titular text-[5rem] leading-none text-uc-azul tabular-nums">{n}</p>
      <p className="text-[1.2rem] text-uc-pizarra">{n === 1 ? "respuesta recibida" : "respuestas recibidas"}</p>
      <p className="max-w-md text-[0.95rem] text-uc-niebla">Los resultados se muestran cuando cierre la votación.</p>
      <button
        onClick={() => alternarMostrar(act)}
        className="mt-1 rounded-xl border border-uc-cian/40 bg-uc-hielo px-4 py-2 text-[0.95rem] font-semibold text-uc-cian transition hover:bg-uc-cian hover:text-white"
      >
        Mostrar resultados <span className="ml-1 text-xs font-normal opacity-70">R</span>
      </button>
    </div>
  );
}

/** Explicación que aparece al revelar (E). */
export function Revelacion({ texto, className }: { texto?: string; className?: string }) {
  if (!texto) return null;
  return (
    <p className={cn("tf-sube flex gap-3 rounded-2xl border border-uc-verde/30 bg-uc-salvia-claro px-5 py-4 text-[1.15rem] leading-snug text-uc-tinta", className)}>
      <span className="uc-serif text-[1.6rem] leading-none text-uc-verde">✓</span>
      <span>{texto}</span>
    </p>
  );
}

// --- Barras --------------------------------------------------------------------------------------------

export function Barras({ act, datos, compacto }: { act: UcActividad; datos: Datos | null; compacto?: boolean }) {
  const { vista } = useVivo();
  const { revelada } = vista(act);
  const counts = (datos?.summary.counts as Record<string, number>) ?? {};
  const total = act.kind === "chips" ? (datos?.responded ?? 0) : Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(counts));
  const opciones = act.kind === "chips" ? [...(act.opciones ?? [])].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0)) : (act.opciones ?? []);
  return (
    <div className={cn("grid content-start", compacto ? "gap-2" : "gap-3")}>
      {opciones.map((o) => {
        const n = counts[o.id] ?? 0;
        const correcta = revelada && act.correcta === o.id;
        const trampa = revelada && act.trampa === o.id;
        const apagada = revelada && act.correcta && !correcta;
        return (
          <div key={o.id} className={cn("grid grid-cols-[minmax(0,30rem)_1fr_5.5rem] items-center gap-4 transition-opacity", apagada && "opacity-40")}>
            <p className={cn("line-clamp-2 text-right leading-snug", compacto ? "text-[1rem]" : "text-[1.12rem]", correcta ? "font-semibold text-uc-verde" : trampa ? "font-semibold text-uc-lacre" : "text-uc-tinta")}>
              {correcta && "✓ "}
              {trampa && "✗ "}
              {o.label}
            </p>
            <div className={cn("overflow-hidden rounded-full bg-uc-linea/60", compacto ? "h-5" : "h-7")}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(n / max) * 100}%`, background: correcta ? C.verde : trampa ? C.lacre : C.cian }}
              />
            </div>
            <p className="text-right tabular-nums">
              <b className="text-[1.15rem] text-uc-tinta">{n}</b>
              <span className="ml-1.5 text-[0.9rem] text-uc-niebla">{pct(n, total)}%</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

// --- Escala de 1 a 5 ---------------------------------------------------------------------------------------

export function Escala({ act, datos }: { act: UcActividad; datos: Datos | null }) {
  const counts = (datos?.summary.counts as Record<string, number>) ?? {};
  const niveles = ["1", "2", "3", "4", "5"];
  const total = niveles.reduce((a, k) => a + (counts[k] ?? 0), 0);
  const max = Math.max(1, ...niveles.map((k) => counts[k] ?? 0));
  const promedio = total ? niveles.reduce((a, k) => a + Number(k) * (counts[k] ?? 0), 0) / total : 0;
  const tono = (i: number) => [C.verde, "#5c8a72", C.salvia, "#c79a52", C.lacre][i];
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative grid flex-1 grid-cols-5 items-end gap-5 border-b-2 border-uc-tinta/20 px-2" style={{ minHeight: "17rem" }}>
        {niveles.map((k, i) => {
          const n = counts[k] ?? 0;
          return (
            <div key={k} className="flex h-full flex-col items-center justify-end gap-2">
              <span className="text-[1.1rem] tabular-nums text-uc-tinta">
                <b>{n}</b> <span className="text-[0.85rem] text-uc-niebla">{pct(n, total)}%</span>
              </span>
              <div className="w-full rounded-t-xl transition-all duration-700" style={{ height: `${(n / max) * 13}rem`, background: tono(i), minHeight: n ? "0.5rem" : 0 }} />
            </div>
          );
        })}
        {total > 0 && (
          <div className="pointer-events-none absolute -bottom-3 top-0 transition-all duration-700" style={{ left: `calc(${((promedio - 0.5) / 5) * 100}%)` }}>
            <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-uc-tinta" />
            <span className="absolute -top-2 -translate-x-1/2 whitespace-nowrap rounded-full bg-uc-tinta px-3 py-1 text-[0.95rem] font-semibold text-white">
              promedio {promedio.toFixed(1)}
            </span>
          </div>
        )}
      </div>
      <div className="mt-2 grid grid-cols-5 gap-5 px-2 text-center">
        {niveles.map((k) => (
          <span key={k} className="uc-serif text-[1.8rem] text-uc-tinta">
            {k}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between px-2 text-[0.95rem] text-uc-pizarra">
        <span className="max-w-[16rem]">{act.escala?.min}</span>
        <span className="max-w-[16rem] text-right">{act.escala?.max}</span>
      </div>
    </div>
  );
}

// --- Clasificación (afirmación × categoría) ------------------------------------------------------------------

const CAT_COLOR: Record<string, string> = { si: C.verde, no: C.lacre, dep: C.ocre };

export function Clasificacion({ act, datos }: { act: UcActividad; datos: Datos | null }) {
  const { vista } = useVivo();
  const { revelada } = vista(act);
  const byQ = (datos?.summary.byQuestion as Record<string, Record<string, number>>) ?? {};
  const opciones = act.preguntas?.[0]?.opciones ?? [];
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap justify-end gap-5 text-[0.95rem] text-uc-pizarra">
        {opciones.map((o) => (
          <span key={o.id} className="flex items-center gap-2">
            <span className="size-3.5 rounded-sm" style={{ background: CAT_COLOR[o.id] }} />
            {o.label}
          </span>
        ))}
      </div>
      {(act.preguntas ?? []).map((q) => {
        const c = byQ[q.id] ?? {};
        const total = Object.values(c).reduce((a, b) => a + b, 0);
        const orient = act.clasificacion?.[q.id];
        const cat = opciones.find((o) => o.id === orient?.correcta);
        return (
          <div key={q.id} className="grid grid-cols-[minmax(0,24rem)_1fr] items-center gap-5">
            <p className="uc-serif text-[1.3rem] leading-snug text-uc-tinta">«{q.q}»</p>
            <div>
              <div className="flex h-9 overflow-hidden rounded-lg bg-uc-linea/50">
                {total > 0 &&
                  opciones.map((o) => {
                    const n = c[o.id] ?? 0;
                    const p = pct(n, total);
                    return (
                      <div
                        key={o.id}
                        className={cn("flex items-center justify-center text-[0.85rem] font-semibold text-white transition-all duration-700", revelada && orient && o.id !== orient.correcta && "opacity-35")}
                        style={{ width: `${(n / total) * 100}%`, background: CAT_COLOR[o.id] }}
                        title={`${o.label}: ${n}`}
                      >
                        {p >= 10 && `${p}%`}
                      </div>
                    );
                  })}
              </div>
              {revelada && orient && cat && (
                <p className="tf-sube mt-1.5 text-[0.98rem] leading-snug text-uc-tinta">
                  <b style={{ color: CAT_COLOR[cat.id] }}>
                    {cat.emoji} {cat.label}.
                  </b>{" "}
                  {orient.por}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Nube de palabras -----------------------------------------------------------------------------------------

const NUBE = [C.verde, C.azul, C.tinta, C.cian, "#5c7d6c", C.ocre];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Nube({ act, datos, alto }: { act: UcActividad; datos: Datos | null; alto: number }) {
  const { ocultas } = useVivo();
  const fuera = new Set(ocultas(act.key));
  const palabras = ((datos?.summary.palabras as { palabra: string; n: number }[]) ?? []).filter((p) => !fuera.has(p.palabra));
  if (!palabras.length) return <p className="py-10 text-center text-[1.2rem] text-uc-niebla">Esperando las primeras palabras…</p>;
  const max = Math.max(1, ...palabras.map((p) => p.n));
  const orden = [...palabras].sort((a, b) => b.n - a.n || a.palabra.localeCompare(b.palabra)).slice(0, NUBE_MAX);
  const nube: typeof orden = [];
  orden.forEach((p, i) => (i % 2 ? nube.push(p) : nube.unshift(p)));
  const tamanos = tamanosNube(nube, alto);
  return (
    <div className="flex flex-1 flex-wrap items-center justify-center gap-x-7 gap-y-2 py-3">
      {nube.map((p, i) => {
        const peso = p.n / max;
        return (
          <span
            key={p.palabra}
            className="uc-serif tf-sube inline-block font-semibold leading-none transition-all duration-700"
            style={{ fontSize: `${tamanos[i]}rem`, color: peso > 0.75 ? C.verde : NUBE[hash(p.palabra) % NUBE.length], opacity: 0.55 + peso * 0.45 }}
          >
            {p.palabra}
          </span>
        );
      })}
    </div>
  );
}
