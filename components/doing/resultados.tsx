"use client";

// Resultados en vivo de las seis experiencias de /doing. Cada una tiene su
// propia forma de mostrar las respuestas: nube tipográfica, matriz de celdas,
// circuito con puntos destacados, distribución por columnas, conexiones con
// grosor según los votos y un flujo que se colorea con las decisiones del
// grupo. Los colores nunca son la única pista: siempre hay números y rótulos.
// En modo demostración (D) se usan datos ilustrativos, rotulados como tales.

import { createContext, useContext, useEffect, useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { C } from "@/components/doing/piezas";
import { NUBE_MAX, tamanosNube } from "@/lib/nube";
import { CATEGORIAS_SABEMOS, GRADOS, RESOLUCION, type DgActividad } from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

/** Estado de una experiencia en el deck: si se ven los resultados y si se reveló la orientación. */
export interface VistaAct {
  mostrar: boolean;
  revelada: boolean;
}

export interface CtxVivo {
  slug: string;
  intervalo: number;
  demo: boolean;
  vista: (act: DgActividad) => VistaAct;
  /** Palabras ocultas por moderación. */
  ocultas: (key: string) => string[];
  alternarMostrar: (act: DgActividad) => void;
  alternarRevelar: (act: DgActividad) => void;
  /** Experiencia abierta en los dispositivos y desde cuándo (para el reloj). */
  abierta: { key: string; desde: number } | null;
}

export const VivoCtx = createContext<CtxVivo>({
  slug: "",
  intervalo: 3000,
  demo: false,
  vista: (a) => ({ mostrar: !a.ocultos, revelada: false }),
  ocultas: () => [],
  alternarMostrar: () => {},
  alternarRevelar: () => {},
  abierta: null,
});
export const useVivo = () => useContext(VivoCtx);

export type Datos = { participants: number; responded: number; summary: Record<string, unknown> };

/** Resultados de una experiencia (los reales o, en modo demostración, los ilustrativos). */
export function useDatos(act: DgActividad | undefined, intervalo?: number): Datos | null {
  const ctx = useVivo();
  const { data } = useResultados(ctx.slug, act?.key ?? "lobby", intervalo ?? ctx.intervalo);
  if (!act) return null;
  if (ctx.demo) return { participants: act.demo.respondieron + 3, responded: act.demo.respondieron, summary: act.demo.summary };
  return data;
}

const pct = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
const suma = (o: Record<string, number> | undefined) => Object.values(o ?? {}).reduce((a, b) => a + b, 0);

// --- Cinta, reloj, ocultos y revelación --------------------------------------------------------------

function Reloj({ desde, max }: { desde: number; max: number }) {
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seg = Math.max(0, Math.floor((ahora - desde) / 1000));
  const paso = seg > max * 60;
  return (
    <span className={cn("dg-maquina rounded-md px-2 py-0.5 text-[0.95rem] tabular-nums", paso ? "bg-dg-lacre-claro text-dg-lacre" : "text-dg-pizarra")}>
      {Math.floor(seg / 60)}:{String(seg % 60).padStart(2, "0")} <span className="text-[0.75rem] text-dg-niebla">/ {max}:00</span>
    </span>
  );
}

/** Encabezado de una experiencia: número, formato, estado de la recepción y cuántos respondieron. */
export function CintaActividad({ act, datos, cerrada }: { act: DgActividad; datos: Datos | null; cerrada?: boolean }) {
  const { demo, abierta } = useVivo();
  const enCurso = !cerrada && abierta?.key === act.key;
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className={cn("flex items-center gap-2 rounded-full border px-4 py-1.5", enCurso ? "border-dg-ocre/50 bg-dg-ocre-claro" : "border-dg-linea bg-dg-hoja")}>
        <span className={cn("size-2 rounded-full", enCurso ? "animate-pulse bg-dg-ocre" : "bg-dg-niebla")} />
        <span className={cn("dg-rotulo text-[0.66rem]", enCurso ? "text-dg-ocre" : "text-dg-pizarra")}>
          {enCurso ? "Participación abierta" : "Recepción cerrada"} · {act.numero} de 6
        </span>
        <span className="text-[0.9rem] text-dg-tinta">{act.formato}</span>
      </span>
      {enCurso && abierta && <Reloj desde={abierta.desde} max={act.duracion} />}
      {datos && (
        <span className="text-[0.95rem] text-dg-pizarra tabular-nums">
          <b className="dg-serif text-[1.5rem] font-normal text-dg-tinta">{datos.responded}</b> de {Math.max(datos.participants, datos.responded)} participantes respondieron
        </span>
      )}
      {demo && (
        <span className="rounded-md bg-dg-tinta px-2 py-0.5 text-[0.7rem] font-semibold tracking-wider text-white">
          RESULTADO ILUSTRATIVO · no son respuestas de la sala
        </span>
      )}
    </div>
  );
}

/** Mientras los resultados están ocultos: solo la cuenta, para no influir en las respuestas. */
export function Ocultos({ datos, act }: { datos: Datos | null; act: DgActividad }) {
  const { alternarMostrar } = useVivo();
  const n = datos?.responded ?? 0;
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-[1.25rem] border border-dashed border-dg-linea bg-dg-hoja/60 py-10 text-center">
      <p className="dg-titular text-[5.5rem] leading-none text-dg-azul tabular-nums">{n}</p>
      <p className="text-[1.2rem] text-dg-pizarra">{n === 1 ? "respuesta recibida" : "respuestas recibidas"}</p>
      <p className="max-w-md text-[0.95rem] text-dg-niebla">Los resultados se muestran cuando se cierre la votación, para no influir en las respuestas.</p>
      <button
        onClick={() => alternarMostrar(act)}
        className="mt-1 rounded-xl border border-dg-azul/40 bg-dg-azul-claro px-4 py-2 text-[0.95rem] font-semibold text-dg-azul transition hover:bg-dg-azul hover:text-white"
      >
        Mostrar resultados <span className="ml-1 text-xs font-normal opacity-70">R</span>
      </button>
    </div>
  );
}

/** Explicación orientativa que aparece al revelar (E). */
export function Revelacion({ texto, className }: { texto?: string; className?: string }) {
  if (!texto) return null;
  return (
    <p className={cn("tf-sube flex gap-3 rounded-2xl border border-dg-verde/30 bg-dg-salvia-claro px-5 py-3.5 text-[1.12rem] leading-snug text-dg-tinta", className)}>
      <span className="dg-serif text-[1.6rem] leading-none text-dg-verde">✓</span>
      <span>{texto}</span>
    </p>
  );
}

/** Visualización que corresponde a cada experiencia. */
export function Visualizacion({ act, datos, compacto, alto = 20 }: { act: DgActividad; datos: Datos | null; compacto?: boolean; alto?: number }) {
  switch (act.key) {
    case "dg_usos":
      return <Nube act={act} datos={datos} alto={alto} compacto={compacto} />;
    case "dg_automatizar":
      return <Matriz act={act} datos={datos} compacto={compacto} />;
    case "dg_controles":
      return <Circuito act={act} datos={datos} compacto={compacto} />;
    case "dg_sabemos":
      return <Columnas act={act} datos={datos} compacto={compacto} />;
    case "dg_salto":
      return <Inferencias act={act} datos={datos} compacto={compacto} />;
    case "dg_flujo":
      return <Flujo act={act} datos={datos} compacto={compacto} />;
  }
}

function Vacio({ texto = "Esperando las primeras respuestas…" }: { texto?: string }) {
  return <p className="py-10 text-center text-[1.2rem] text-dg-niebla">{texto}</p>;
}

// --- 1 · Nube tipográfica -----------------------------------------------------------------------------

const TONOS_NUBE = [C.verde, C.azul, C.tinta, C.lacre, "#5f7d70", C.pizarra];

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Nube({ act, datos, alto, compacto }: { act: DgActividad; datos: Datos | null; alto: number; compacto?: boolean }) {
  const { ocultas } = useVivo();
  const fuera = new Set(ocultas(act.key));
  const palabras = ((datos?.summary.palabras as { palabra: string; n: number }[]) ?? []).filter((p) => !fuera.has(p.palabra));
  if (!palabras.length) return <Vacio texto="Esperando las primeras palabras…" />;
  const max = Math.max(1, ...palabras.map((p) => p.n));
  const orden = [...palabras].sort((a, b) => b.n - a.n || a.palabra.localeCompare(b.palabra)).slice(0, compacto ? 14 : NUBE_MAX);
  const nube: typeof orden = [];
  orden.forEach((p, i) => (i % 2 ? nube.push(p) : nube.unshift(p)));
  const tamanos = tamanosNube(nube, alto);
  return (
    <div className={cn("flex flex-1 flex-wrap items-center justify-center", compacto ? "gap-x-3 gap-y-1" : "gap-x-7 gap-y-2 py-3")}>
      {nube.map((p, i) => {
        const peso = p.n / max;
        return (
          <span
            key={p.palabra}
            title={`${p.palabra}: ${p.n}`}
            className="dg-serif tf-sube inline-block leading-none transition-all duration-700"
            style={{
              fontSize: `${compacto ? tamanos[i] * 0.42 : tamanos[i] * 1.12}rem`,
              color: peso > 0.75 ? C.lacre : TONOS_NUBE[hash(p.palabra) % TONOS_NUBE.length],
              opacity: 0.6 + peso * 0.4,
            }}
          >
            {p.palabra}
          </span>
        );
      })}
    </div>
  );
}

// --- 2 · Matriz de automatización ---------------------------------------------------------------------

export function Matriz({ act, datos, compacto }: { act: DgActividad; datos: Datos | null; compacto?: boolean }) {
  const byQ = (datos?.summary.byQuestion as Record<string, Record<string, number>>) ?? {};
  const preguntas = act.preguntas ?? [];
  return (
    <div className={cn("grid", compacto ? "gap-1" : "gap-2")} style={{ gridTemplateColumns: `${compacto ? "minmax(0,7rem)" : "minmax(0,19rem)"} repeat(${GRADOS.length}, minmax(0,1fr))` }}>
      <span />
      {GRADOS.map((g) => (
        <p key={g.id} className={cn("text-center leading-tight text-dg-pizarra", compacto ? "text-[0.55rem]" : "pb-1 text-[1rem]")}>
          {!compacto && <span className="mb-1 block text-[1.5rem]">{g.emoji}</span>}
          {g.label}
        </p>
      ))}
      {preguntas.map((q) => {
        const fila = byQ[q.id] ?? {};
        const total = suma(fila);
        const maxFila = Math.max(0, ...Object.values(fila));
        return (
          <div key={q.id} className="contents">
            <p className={cn("flex items-center leading-snug text-dg-tinta", compacto ? "text-[0.6rem]" : "dg-serif pr-3 text-[1.45rem]")}>{q.q}</p>
            {GRADOS.map((g) => {
              const n = fila[g.id] ?? 0;
              const p = pct(n, total);
              const intensidad = total ? n / total : 0;
              const top = n > 0 && n === maxFila;
              return (
                <div
                  key={g.id}
                  title={`${q.q} · ${g.label}: ${n}`}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg transition-all duration-700",
                    compacto ? "h-6" : "h-[5.2rem]",
                    top && !compacto && "ring-2 ring-dg-tinta/70 ring-offset-2 ring-offset-dg-hoja",
                  )}
                  style={{ background: `rgba(62, 93, 81, ${0.06 + intensidad * 0.9})` }}
                >
                  {!compacto && (
                    <>
                      <span className={cn("dg-serif text-[2rem] leading-none tabular-nums", intensidad > 0.45 ? "text-white" : "text-dg-tinta")}>{n}</span>
                      <span className={cn("mt-1 text-[0.85rem] tabular-nums", intensidad > 0.45 ? "text-white/85" : "text-dg-pizarra")}>{p}%</span>
                    </>
                  )}
                  {compacto && <span className={cn("text-[0.55rem] tabular-nums", intensidad > 0.45 ? "text-white" : "text-dg-pizarra")}>{p}%</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// --- 3 · Circuito de controles ------------------------------------------------------------------------

export function Circuito({ act, datos, compacto }: { act: DgActividad; datos: Datos | null; compacto?: boolean }) {
  const counts = (datos?.summary.counts as Record<string, number>) ?? {};
  const respondieron = datos?.responded ?? 0;
  const opciones = act.opciones ?? [];
  const max = Math.max(1, ...opciones.map((o) => counts[o.id] ?? 0));
  return (
    <div className="relative flex flex-1 flex-col justify-center">
      <div className={cn("relative grid items-start", compacto ? "gap-1" : "gap-4")} style={{ gridTemplateColumns: `repeat(${opciones.length}, minmax(0,1fr))` }}>
        <div className={cn("absolute left-[10%] right-[10%] border-t-[3px] border-dashed border-dg-linea", compacto ? "top-[1.1rem]" : "top-[4.6rem]")} />
        {opciones.map((o, i) => {
          const n = counts[o.id] ?? 0;
          const peso = n / max;
          const tam = compacto ? 1.2 + peso * 1.1 : 4.4 + peso * 4.8;
          return (
            <div key={o.id} className="relative flex flex-col items-center text-center">
              <div className={cn("flex items-center justify-center", compacto ? "h-[2.3rem]" : "h-[9.2rem]")}>
                <div
                  className="flex items-center justify-center rounded-full transition-all duration-700"
                  style={{
                    width: `${tam}rem`,
                    height: `${tam}rem`,
                    background: `rgba(173, 70, 48, ${0.1 + peso * 0.82})`,
                    boxShadow: compacto ? undefined : `0 0 0 ${0.4 + peso * 1.2}rem rgba(173, 70, 48, ${0.06 + peso * 0.1})`,
                  }}
                >
                  {!compacto && <span className="text-[1.8rem]">{o.emoji}</span>}
                </div>
              </div>
              {!compacto && <span className="dg-maquina mt-2 text-[0.8rem] text-dg-niebla">Etapa {i + 1}</span>}
              <p className={cn("leading-tight text-dg-tinta", compacto ? "text-[0.5rem]" : "mt-1 text-[1.2rem] font-medium")}>{o.label}</p>
              {!compacto && (
                <p className="mt-1.5 tabular-nums">
                  <b className="dg-serif text-[2rem] font-normal text-dg-tinta">{n}</b>
                  <span className="ml-1.5 text-[0.95rem] text-dg-pizarra">{pct(n, respondieron)}% de quienes respondieron</span>
                </p>
              )}
            </div>
          );
        })}
      </div>
      {!compacto && (
        <p className="mt-6 text-center text-[1rem] text-dg-pizarra">
          Cada persona eligió dos etapas. Lo menos votado no es lo que puede quedar sin control: la intensidad depende de la tarea y del riesgo.
        </p>
      )}
    </div>
  );
}

// --- 4 · Clasificador de afirmaciones (columnas) ----------------------------------------------------

const COLOR_CAT: Record<string, string> = { dato: C.azul, alegacion: C.verde, inferencia: C.ocre, sin: C.lacre };

export function Columnas({ act, datos, compacto }: { act: DgActividad; datos: Datos | null; compacto?: boolean }) {
  const { vista } = useVivo();
  const revelada = vista(act).revelada && !compacto;
  const byQ = (datos?.summary.byQuestion as Record<string, Record<string, number>>) ?? {};
  const preguntas = act.preguntas ?? [];
  return (
    <div className={cn("grid", compacto ? "gap-x-1 gap-y-0.5" : "gap-x-3 gap-y-2")} style={{ gridTemplateColumns: `${compacto ? "minmax(0,6.5rem)" : "minmax(0,22rem)"} repeat(${CATEGORIAS_SABEMOS.length}, minmax(0,1fr))` }}>
      <span />
      {CATEGORIAS_SABEMOS.map((c) => (
        <div key={c.id} className={cn("flex flex-col items-center rounded-t-xl text-center", compacto ? "py-0.5" : "py-2")} style={{ background: `${COLOR_CAT[c.id]}14` }}>
          {!compacto && <span className="text-[1.5rem]">{c.emoji}</span>}
          <span className={cn("font-semibold leading-tight", compacto ? "text-[0.5rem]" : "text-[1rem]")} style={{ color: COLOR_CAT[c.id] }}>
            {c.label}
          </span>
        </div>
      ))}
      {preguntas.map((q) => {
        const fila = byQ[q.id] ?? {};
        const total = suma(fila);
        const orient = act.clasificacion?.[q.id];
        return (
          <div key={q.id} className="contents">
            <div className={cn("flex flex-col justify-center", compacto ? "" : "border-t border-dg-linea/70 py-2 pr-2")}>
              <p className={cn("leading-snug text-dg-tinta", compacto ? "text-[0.52rem]" : "dg-serif text-[1.22rem]")}>«{act.cortas?.[q.id] ?? q.q}»</p>
              {revelada && orient && <p className="tf-sube mt-1 text-[0.9rem] leading-snug text-dg-pizarra">{orient.por}</p>}
            </div>
            {CATEGORIAS_SABEMOS.map((c) => {
              const n = fila[c.id] ?? 0;
              const p = total ? n / total : 0;
              const esOrient = revelada && orient?.correcta === c.id;
              const d = compacto ? 0.35 + p * 1.2 : 1.3 + p * 4;
              return (
                <div
                  key={c.id}
                  className={cn("relative flex items-center justify-center", compacto ? "h-5" : "h-[5.8rem] border-t border-dg-linea/70")}
                  style={{ background: `${COLOR_CAT[c.id]}0a` }}
                  title={`${q.q} · ${c.label}: ${n}`}
                >
                  <span
                    className={cn("flex items-center justify-center rounded-full transition-all duration-700", revelada && !esOrient && "opacity-30")}
                    style={{ width: `${d}rem`, height: `${d}rem`, background: COLOR_CAT[c.id] }}
                  >
                    {!compacto && n > 0 && <span className="text-[1rem] font-semibold text-white tabular-nums">{Math.round(p * 100)}%</span>}
                  </span>
                  {esOrient && <span className="pointer-events-none absolute inset-1.5 rounded-xl border-[3px]" style={{ borderColor: COLOR_CAT[c.id] }} />}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// --- 5 · Mapa de inferencias --------------------------------------------------------------------------

export function Inferencias({ act, datos, compacto }: { act: DgActividad; datos: Datos | null; compacto?: boolean }) {
  const { vista } = useVivo();
  const revelada = vista(act).revelada && !compacto;
  const counts = (datos?.summary.counts as Record<string, number>) ?? {};
  const opciones = act.opciones ?? [];
  const total = opciones.reduce((a, o) => a + (counts[o.id] ?? 0), 0);
  const max = Math.max(1, ...opciones.map((o) => counts[o.id] ?? 0));
  const ys = [16.6, 50, 83.4];
  const respaldo: Record<string, string> = {
    existencia: "Comprobantes 1, 2 y 3",
    recepcion: "Destino de las cuentas y reconocimiento de Boreal",
    imputacion: "Ninguno: el comprobante 3 menciona otra factura",
  };
  return (
    <div className={cn("grid flex-1 items-stretch", compacto ? "grid-cols-[1fr_2.2rem_0.8fr]" : "grid-cols-[minmax(0,26rem)_1fr_minmax(0,21rem)]")}>
      <div className="flex flex-col justify-around gap-2">
        {opciones.map((o) => {
          const salto = revelada && o.id === act.correcta;
          return (
            <div
              key={o.id}
              className={cn(
                "rounded-xl border bg-dg-hoja transition",
                compacto ? "px-1.5 py-1" : "px-4 py-3",
                salto ? "border-dg-lacre ring-2 ring-dg-lacre/40" : "border-dg-linea",
              )}
            >
              <p className={cn("leading-snug text-dg-tinta", compacto ? "text-[0.5rem]" : "text-[1.15rem] font-medium")}>
                {!compacto && <span className="mr-2">{o.emoji}</span>}
                {o.label}
              </p>
              {!compacto && <p className={cn("mt-1 text-[0.85rem]", salto ? "font-semibold text-dg-lacre" : "text-dg-niebla")}>Respaldo: {respaldo[o.id]}</p>}
            </div>
          );
        })}
      </div>
      <div className="relative">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {opciones.map((o, i) => {
            const n = counts[o.id] ?? 0;
            const salto = revelada && o.id === act.correcta;
            const ancho = compacto ? 0.08 + (n / max) * 0.3 : 0.15 + (n / max) * 1.5;
            return (
              <path
                key={o.id}
                d={`M0 ${ys[i]} C 50 ${ys[i]}, 50 50, 100 50`}
                fill="none"
                stroke={salto ? C.lacre : revelada ? C.verde : C.azul}
                strokeOpacity={n ? 0.85 : 0.25}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                // El salto se dibuja punteado: un puente que no termina de apoyarse.
                style={{ strokeWidth: `${ancho}rem`, strokeDasharray: salto ? `0 ${ancho * 1.7}rem` : undefined, transition: "stroke-width 0.7s" }}
              />
            );
          })}
        </svg>
        {!compacto &&
          opciones.map((o, i) => {
            const n = counts[o.id] ?? 0;
            return (
              <span
                key={o.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-dg-linea bg-dg-hoja px-3 py-1 text-[1rem] tabular-nums shadow-sm"
                style={{ left: "50%", top: `${(ys[i] + 50) / 2}%` }}
              >
                <b className="text-dg-tinta">{n}</b> <span className="text-dg-niebla">· {pct(n, total)}%</span>
              </span>
            );
          })}
      </div>
      <div className="flex items-center">
        <div className={cn("w-full rounded-2xl border-2 border-dg-tinta bg-dg-hoja", compacto ? "px-1.5 py-1.5" : "px-5 py-6")}>
          {!compacto && <p className="dg-rotulo text-[0.62rem] text-dg-pizarra">Conclusión</p>}
          <p className={cn("dg-serif leading-snug text-dg-tinta", compacto ? "text-[0.55rem]" : "mt-2 text-[1.75rem]")}>
            «La factura 418 se encuentra completamente cancelada»
          </p>
        </div>
      </div>
    </div>
  );
}

// --- 6 · Flujo documental colectivo -------------------------------------------------------------------

const COLOR_RES: Record<string, string> = { reglas: C.azul, ia: C.verde, profesional: C.tinta };

export function Flujo({ act, datos, compacto }: { act: DgActividad; datos: Datos | null; compacto?: boolean }) {
  const { vista } = useVivo();
  const revelada = vista(act).revelada && !compacto;
  const byQ = (datos?.summary.byQuestion as Record<string, Record<string, number>>) ?? {};
  const preguntas = act.preguntas ?? [];
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      {!compacto && (
        <div className="flex flex-wrap justify-end gap-5 text-[0.95rem] text-dg-pizarra">
          {RESOLUCION.map((r) => (
            <span key={r.id} className="flex items-center gap-2">
              <span className="size-3.5 rounded-sm" style={{ background: COLOR_RES[r.id] }} />
              {r.emoji} {r.label}
            </span>
          ))}
          <span className="flex items-center gap-2">
            <span className="tf-trama size-3.5 rounded-sm border border-dg-linea" /> Sin mayoría clara
          </span>
        </div>
      )}
      <div className={cn("flex items-stretch", compacto ? "gap-0.5" : "gap-1")}>
        {preguntas.map((q, i) => {
          const fila = byQ[q.id] ?? {};
          const total = suma(fila);
          const orden = RESOLUCION.map((r) => ({ ...r, n: fila[r.id] ?? 0 })).sort((a, b) => b.n - a.n);
          const top = orden[0];
          const mayoria = total > 0 && top.n / total > 0.5;
          const orient = act.clasificacion?.[q.id];
          const resOrient = RESOLUCION.find((r) => r.id === orient?.correcta);
          return (
            <div key={q.id} className="contents">
              {i > 0 && (
                <div className="flex items-center text-dg-niebla">
                  <span className={compacto ? "text-[0.5rem]" : "text-[1.6rem]"}>→</span>
                </div>
              )}
              <div className="flex min-w-0 flex-1 flex-col">
                <div
                  className={cn("flex flex-1 flex-col justify-between rounded-xl transition-colors duration-700", compacto ? "min-h-[2.4rem] p-1" : "min-h-[11rem] p-4", !mayoria && "tf-trama border border-dg-linea")}
                  style={mayoria ? { background: COLOR_RES[top.id], color: "#fff" } : undefined}
                >
                  {!compacto && <span className="dg-maquina text-[0.8rem] opacity-80">Paso {i + 1}</span>}
                  <p className={cn("leading-snug", compacto ? "text-[0.45rem]" : "dg-serif mt-1 text-[1.35rem]", !mayoria && "text-dg-tinta")}>
                    {act.cortas?.[q.id] ?? q.q}
                  </p>
                  {!compacto && (
                    <p className={cn("mt-3 text-[0.95rem] font-semibold", !mayoria && "text-dg-pizarra")}>
                      {total === 0 ? "—" : mayoria ? `${top.emoji} ${top.label} · ${pct(top.n, total)}%` : "Sin mayoría clara"}
                    </p>
                  )}
                </div>
                <div className={cn("flex overflow-hidden rounded-md bg-dg-linea/50", compacto ? "mt-0.5 h-1" : "mt-2 h-6")}>
                  {total > 0 &&
                    RESOLUCION.map((r) => {
                      const n = fila[r.id] ?? 0;
                      const p = pct(n, total);
                      return (
                        <div
                          key={r.id}
                          title={`${r.label}: ${n}`}
                          className="flex items-center justify-center text-[0.75rem] font-semibold text-white transition-all duration-700"
                          style={{ width: `${(n / total) * 100}%`, background: COLOR_RES[r.id] }}
                        >
                          {!compacto && p >= 14 && `${p}%`}
                        </div>
                      );
                    })}
                </div>
                {revelada && orient && resOrient && (
                  <p className="tf-sube mt-2 text-[0.88rem] leading-snug text-dg-tinta">
                    <b style={{ color: COLOR_RES[resOrient.id] }}>
                      {resOrient.emoji} {resOrient.label}.
                    </b>{" "}
                    {orient.por}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
