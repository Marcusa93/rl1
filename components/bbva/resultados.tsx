"use client";

// ============================================================
// Laboratorio de IA · BBVA — visualizaciones colectivas en vivo.
//
// Las usa la presentación (proyector 16:9; el contenedor da ~70rem × 30rem)
// y el control remoto del docente (celular, `compacto`, ~340px de ancho).
// Reciben el último dato de useResultadosBbva: nada "salta" entre un poll y
// el siguiente (orden fijo por opción, cambios de tamaño/ancho con
// transición). Con 0 respuestas se ve la estructura en gris y un post-it
// "Esperando respuestas…"; con 1 o con 80 respuestas se lee igual de claro.
//
// Estética: láminas impresas y recortes de papel. Tinta, grafito y pizarra;
// un solo acento naranja (lo más elegido) y el lápiz rojo para anotar.
// ============================================================

import type { CSSProperties, ReactNode } from "react";
import {
  BBVA_AREAS,
  getActividadBbva,
  type ActividadBbva,
  type AreaId,
  type BbvaActivityKey,
  type Conteo,
  type Item,
  type ResultadosBbva,
} from "@/lib/bbva-clase";
import { porc, suma } from "./use-resultados";

// --- Paleta (mismos valores que @theme en globals.css) ---------------------------

const PAPEL = "#f2eee6";
const BLANCO = "#fbfaf7";
const TINTA = "#17181b";
const GRAFITO = "#45484f";
const NIEBLA = "#c9ccd1";
const PIZARRA = "#5d7087";
const PIZARRA_2 = "#3c4d61";
const NARANJA = "#e2582b";
const ROJO = "#c0392b";
/** "No": gris claro con trama rayada (lápiz sobre papel). */
const TRAMA_NO = "repeating-linear-gradient(135deg, #dfe1e4 0 0.42rem, #c3c7cd 0.42rem 0.6rem)";
const SOMBRA_RECORTE = "0 1px 0 rgba(0,0,0,0.06), 0 12px 20px -14px rgba(40,30,10,0.55)";

// --- Utilidades --------------------------------------------------------------------

const VACIO: Conteo = {};
const IDS_AREA = new Set<string>(BBVA_AREAS.map((a) => a.id));

/** Rotaciones leves y fijas por índice: collage, pero determinístico. */
const ROT = [-2.4, 1.6, -1, 2.2, -1.7, 0.8, 2.7, -2.1, 1.2, -0.6, 1.9, -2.8, 0.5, -1.4];
const rot = (i: number) => ROT[i % ROT.length];
/** Pequeño desplazamiento vertical (en em) para que la nube no parezca una grilla. */
const SALTO = [0.05, -0.12, 0.1, -0.04, 0.14, -0.1, 0.02, -0.14, 0.08, 0.12, -0.06, 0.04, -0.1, 0.1];

function conteo(data: ResultadosBbva | null, item: string): Conteo {
  return data?.items?.[item] ?? VACIO;
}

/** Conteo de un área. "otro" junta también cualquier nombre que no sea un área conocida. */
function conteoArea(data: ResultadosBbva | null, area: AreaId, item: string): Conteo {
  const src = data?.itemsPorArea ?? {};
  if (area !== "otro") return src[area]?.[item] ?? VACIO;
  const out: Conteo = {};
  for (const [k, porItem] of Object.entries(src)) {
    if (k !== "otro" && IDS_AREA.has(k)) continue;
    for (const [op, n] of Object.entries(porItem[item] ?? {})) out[op] = (out[op] ?? 0) + n;
  }
  return out;
}

/** Suma solo las opciones válidas del ítem (ignora valores viejos o raros). */
function totalItem(c: Conteo, ids: string[]) {
  return ids.reduce((s, id) => s + (c[id] ?? 0), 0);
}

function maximo(c: Conteo, ids: string[]) {
  return ids.reduce((m, id) => Math.max(m, c[id] ?? 0), 0);
}

/** Opciones con el máximo. Si empatan más de `hasta`, ninguna: el naranja pierde sentido. */
function destacadas(c: Conteo, ids: string[], hasta = 2): Set<string> {
  const max = maximo(c, ids);
  if (!max) return new Set();
  const tops = ids.filter((id) => (c[id] ?? 0) === max);
  return new Set(tops.length <= hasta ? tops : []);
}

/** Mediana (índice del nivel) de una distribución ordenada: primer nivel que junta la mitad. */
function mediana(c: Conteo, ids: string[]): number | null {
  const total = totalItem(c, ids);
  if (!total) return null;
  const mitad = Math.ceil(total / 2);
  let acc = 0;
  for (let k = 0; k < ids.length; k++) {
    acc += c[ids[k]] ?? 0;
    if (acc >= mitad) return k;
  }
  return ids.length - 1;
}

const varRot = (deg: number) => ({ "--rot": `${deg}deg`, transform: `rotate(${deg}deg)` }) as CSSProperties;

// --- Piezas comunes ------------------------------------------------------------------

function Rotulo({ children, compacto }: { children: ReactNode; compacto?: boolean }) {
  return (
    <p className={`font-mono uppercase text-grafito ${compacto ? "text-[0.62rem] tracking-[0.12em]" : "text-[0.95rem] tracking-[0.16em]"}`}>
      {children}
    </p>
  );
}

/** "respondieron 23": rótulo técnico chico + número grande. */
function Contador({ n, compacto, etiqueta = "respondieron" }: { n: number; compacto?: boolean; etiqueta?: string }) {
  return (
    <p
      className={`flex shrink-0 items-baseline font-mono uppercase text-grafito ${
        compacto ? "gap-1.5 text-[0.62rem] tracking-[0.12em]" : "gap-[0.6rem] text-[0.95rem] tracking-[0.16em]"
      }`}
    >
      {etiqueta}
      <span className={`bbva-titular tabular-nums tracking-normal text-tinta ${compacto ? "text-lg" : "text-[2rem]"}`}>{n}</span>
    </p>
  );
}

/** Línea superior: leyenda a la izquierda, cuántos respondieron a la derecha. */
function Cabecera({ izq, n, compacto, etiqueta }: { izq?: ReactNode; n: number; compacto?: boolean; etiqueta?: string }) {
  return (
    <div className={`flex items-end justify-between gap-4 ${compacto ? "mb-2.5" : "mb-[1.1rem]"}`}>
      <div className="min-w-0">{izq}</div>
      <Contador n={n} compacto={compacto} etiqueta={etiqueta} />
    </div>
  );
}

/** Sin respuestas: post-it sobre la estructura vacía (pantalla) o una línea (celular). */
function AvisoEspera({ compacto, texto = "Esperando respuestas…" }: { compacto?: boolean; texto?: string }) {
  if (compacto) return <p className="bbva-mano mt-2 text-center text-lg leading-none text-grafito">{texto}</p>;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <div className="bbva-postit bbva-cae px-[1.8rem] pb-[0.8rem] pt-[1rem]" style={varRot(-3)}>
        <p className="bbva-mano text-[2.3rem] leading-none text-tinta">{texto}</p>
      </div>
    </div>
  );
}

/** Aro de lápiz rojo alrededor de algo (un segmento, una celda). */
function Aro({ ancho, alto, minAncho, grosor = 2.6, z = true }: { ancho: string; alto: string; minAncho?: string; grosor?: number; z?: boolean }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${z ? "z-10" : ""}`}
      style={{ width: ancho, height: alto, minWidth: minAncho }}
    >
      <svg viewBox="0 0 120 60" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <path
          d="M14 36 C 8 14, 58 3, 104 9 C 119 13, 118 48, 72 54 C 34 59, 3 51, 8 29 C 10 19, 24 12, 38 10"
          fill="none"
          stroke={ROJO}
          strokeWidth={grosor}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}

interface VizProps {
  act: ActividadBbva;
  data: ResultadosBbva | null;
  porArea: boolean;
  compacto: boolean;
}

// ============================================================
// Actividad 1 · Nube de operaciones
// ============================================================

/** Filas fijas: cada palabra vive siempre en su fila y su lugar (no salta con el poll). */
const FILAS_NUBE: string[][] = [
  ["leer", "resolver", "clasificar"],
  ["comparar", "buscar", "atender", "derivar"],
  ["analizar", "responder", "decidir", "revisar"],
  ["programar", "redactar", "controlar"],
];

/** Tamaño (rem) de cada palabra: raíz de la cantidad, con un factor común para que ninguna fila desborde. */
function tamaniosNube(item: Item, c: Conteo, compacto: boolean): Record<string, number> {
  const min = compacto ? 0.9 : 1.5;
  const max = compacto ? 1.9 : 5.4;
  const cero = compacto ? 0.78 : 1.35;
  const ancho = compacto ? 17.5 : 64; // rem por fila
  const alto = compacto ? 99 : 24.5; // rem para las cuatro filas (pantalla)
  const gap = compacto ? 0.5 : 1.3;
  const tope = maximo(c, item.opciones.map((o) => o.id));
  const largo = new Map(item.opciones.map((o) => [o.id, o.label.length]));
  const base: Record<string, number> = {};
  for (const o of item.opciones) {
    const n = c[o.id] ?? 0;
    base[o.id] = n && tope ? min + (max - min) * Math.pow(n / tope, 0.8) : cero;
  }
  // Titular condensada en mayúsculas: ~0.5em por letra + 0.84em de relleno (medido).
  let factor = 1;
  let altoTotal = (compacto ? 0.6 : 1.6) * (FILAS_NUBE.length - 1);
  for (const fila of FILAS_NUBE) {
    const w = fila.reduce((s, id) => s + base[id] * ((largo.get(id) ?? 8) * 0.51 + 0.95), 0) + gap * (fila.length - 1);
    factor = Math.min(factor, ancho / w);
    altoTotal += Math.max(...fila.map((id) => base[id])) * 1.3;
  }
  factor = Math.min(factor, alto / altoTotal);
  const out: Record<string, number> = {};
  for (const id of Object.keys(base)) out[id] = Math.max(base[id] * factor, base[id] === cero ? cero * 0.85 : min * 0.8);
  return out;
}

function Palabra({ label, n, size, i, top, compacto }: { label: string; n: number; size: number; i: number; top: boolean; compacto: boolean }) {
  const vacio = n === 0;
  const estilo = vacio
    ? "border border-dashed border-niebla text-gris opacity-60"
    : top
      ? "bg-naranja text-blanco"
      : i % 3 === 1
        ? "bg-tinta text-blanco" // cinta de rotuladora
        : "bbva-recorte text-tinta";
  return (
    <div
      className="relative transition-[font-size,transform] duration-700 ease-out"
      style={{ fontSize: `${size}rem`, transform: `translateY(${SALTO[i % SALTO.length]}em) rotate(${vacio ? rot(i) * 0.4 : rot(i)}deg)` }}
    >
      <span
        className={`bbva-titular block whitespace-nowrap transition-colors duration-700 ${estilo}`}
        style={{ padding: "0.17em 0.42em 0.1em", boxShadow: vacio || estilo.includes("recorte") ? undefined : SOMBRA_RECORTE }}
      >
        {label}
      </span>
      {top && !compacto && (
        <span aria-hidden className="bbva-cinta absolute -top-[0.55rem] left-1/2 h-[1.05rem] w-[3.4rem] -translate-x-1/2 -rotate-6" />
      )}
      {!vacio && (
        <span
          className={`absolute rounded-full border border-tinta/60 bg-blanco font-mono leading-none tabular-nums text-tinta ${
            compacto ? "-right-1.5 -top-2 px-1 py-[2px] text-[0.58rem]" : "-right-[0.75rem] -top-[0.8rem] px-[0.42rem] py-[0.24rem] text-[0.9rem]"
          }`}
        >
          {n}
        </span>
      )}
    </div>
  );
}

function Nube({ act, data, porArea, compacto }: VizProps) {
  const item = act.items[0];
  if (porArea) return <NubePorArea item={item} data={data} compacto={compacto} />;
  const c = conteo(data, item.id);
  const n = data?.respondieronItem?.[item.id] ?? 0;
  const tam = tamaniosNube(item, c, compacto);
  const tops = destacadas(c, item.opciones.map((o) => o.id));
  const info = new Map(item.opciones.map((o, i) => [o.id, { label: o.label, i }]));

  return (
    <div className="relative flex h-full w-full flex-col">
      <Cabecera
        compacto={compacto}
        n={n}
        izq={<Rotulo compacto={compacto}>{item.opciones.length} operaciones · hasta {item.max} por persona</Rotulo>}
      />
      <div className={`flex flex-1 flex-col items-center justify-center ${compacto ? "gap-y-2.5 py-2" : "gap-y-[1.6rem] py-[0.8rem]"}`}>
        {FILAS_NUBE.map((fila, f) => (
          <div
            key={f}
            className={`flex flex-wrap items-center justify-center ${compacto ? "gap-x-2 gap-y-2.5" : "gap-x-[1.3rem] gap-y-[0.9rem]"}`}
          >
            {fila.map((id) => {
              const o = info.get(id);
              if (!o) return null;
              return <Palabra key={id} label={o.label} n={c[id] ?? 0} size={tam[id]} i={o.i} top={tops.has(id)} compacto={compacto} />;
            })}
          </div>
        ))}
      </div>
      {n === 0 && <AvisoEspera compacto={compacto} />}
    </div>
  );
}

/** Pequeño múltiplo: el top 3 de cada área con respuestas. */
function NubePorArea({ item, data, compacto }: { item: Item; data: ResultadosBbva | null; compacto: boolean }) {
  const orden = item.opciones.map((o) => o.id);
  const lab = new Map(item.opciones.map((o) => [o.id, o.label]));
  const conDatos = BBVA_AREAS.map((a) => ({ a, c: conteoArea(data, a.id, item.id) })).filter((x) => suma(x.c) > 0);
  const vacio = conDatos.length === 0;
  const areas = vacio ? BBVA_AREAS.map((a) => ({ a, c: VACIO })) : conDatos;
  const n = data?.respondieronItem?.[item.id] ?? 0;
  const cols = compacto ? "grid-cols-1" : areas.length > 4 ? "grid-cols-3" : areas.length > 1 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div className="relative flex h-full w-full flex-col">
      <Cabecera compacto={compacto} n={n} izq={<Rotulo compacto={compacto}>Las tres operaciones más marcadas en cada área</Rotulo>} />
      <div className={`grid flex-1 content-center ${cols} ${compacto ? "gap-2" : "gap-x-[1.6rem] gap-y-[1.5rem]"}`}>
        {areas.map(({ a, c }, k) => {
          const top3 = orden
            .filter((id) => (c[id] ?? 0) > 0)
            .sort((x, y) => (c[y] ?? 0) - (c[x] ?? 0) || orden.indexOf(x) - orden.indexOf(y))
            .slice(0, 3);
          const max = top3.length ? c[top3[0]] ?? 1 : 1;
          const tops = destacadas(c, top3);
          return (
            <section
              key={a.id}
              className={`relative ${vacio ? "border border-dashed border-niebla opacity-60" : "bbva-recorte"} ${
                compacto ? "px-3 py-2" : "px-[1.3rem] pb-[1rem] pt-[0.9rem]"
              } ${!compacto && !vacio ? "bbva-cae" : ""}`}
              style={!compacto && !vacio ? { ...varRot(rot(k) * 0.3), animationDelay: `${k * 0.08}s` } : undefined}
            >
              <header className="flex items-baseline justify-between gap-3">
                <h4 className={`bbva-titular ${compacto ? "text-sm" : "text-[1.5rem]"}`}>{a.corto}</h4>
                <span className={`font-mono text-grafito ${compacto ? "text-[0.6rem]" : "text-[0.85rem]"}`}>
                  {suma(c)} marcas
                </span>
              </header>
              <ol className={compacto ? "mt-1 grid gap-1" : "mt-[0.6rem] grid gap-[0.55rem]"}>
                {top3.length === 0 && <li className={`bbva-mano text-gris ${compacto ? "text-sm" : "text-[1.3rem]"}`}>sin marcas todavía</li>}
                {top3.map((id) => {
                  const v = c[id] ?? 0;
                  const top = tops.has(id);
                  return (
                    <li key={id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`bbva-titular truncate ${top ? "text-naranja" : "text-tinta"} ${
                            compacto ? (top ? "text-base" : "text-sm") : top ? "text-[1.9rem]" : "text-[1.35rem]"
                          }`}
                        >
                          {lab.get(id)}
                        </span>
                        <span className={`font-mono tabular-nums text-grafito ${compacto ? "text-[0.65rem]" : "text-[0.95rem]"}`}>{v}</span>
                      </div>
                      <div className={`mt-[0.2rem] bg-papel-2 ${compacto ? "h-1" : "h-[0.3rem]"}`}>
                        <div
                          className="h-full transition-[width] duration-700 ease-out"
                          style={{ width: `${(v / max) * 100}%`, background: top ? NARANJA : GRAFITO }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
            </section>
          );
        })}
      </div>
      {vacio && <AvisoEspera compacto={compacto} />}
    </div>
  );
}

// ============================================================
// Actividades 2 y 4 · Barras apiladas por caso
// ============================================================

interface Serie {
  id: string;
  label: string;
  fondo: string;
  texto: string;
  trama?: boolean;
}

const SERIES_A2: Serie[] = [
  { id: "si", label: "Sí", fondo: TINTA, texto: BLANCO },
  { id: "depende", label: "Depende", fondo: NARANJA, texto: BLANCO },
  { id: "no", label: "No", fondo: "#dfe1e4", texto: TINTA, trama: true },
];

const SERIES_A4: Serie[] = [
  { id: "chatbot", label: "Chatbot", fondo: PIZARRA, texto: BLANCO },
  { id: "automatizacion", label: "Automatización", fondo: PIZARRA_2, texto: BLANCO },
  { id: "agente", label: "Agente", fondo: TINTA, texto: BLANCO },
  { id: "falta_info", label: "No alcanza la información", fondo: NARANJA, texto: BLANCO },
];

interface Fila {
  item: Item;
  c: Conteo;
  total: number;
}

interface Nota {
  item: string;
  serie: string;
  texto: string;
}

/** A2: la fila donde más creció el "Depende". */
function notaA2(filas: Fila[]): Nota | null {
  let mejor: Fila | null = null;
  let share = 0;
  for (const f of filas) {
    const d = f.c.depende ?? 0;
    if (!f.total || !d) continue;
    const s = d / f.total;
    if (s > share) {
      share = s;
      mejor = f;
    }
  }
  return mejor ? { item: mejor.item.id, serie: "depende", texto: "¿de qué depende?" } : null;
}

/** A4: el caso 4 es ambiguo a propósito; "No alcanza la información" es la respuesta interesante. */
function notaA4(filas: Fila[]): Nota | null {
  // Solo si alguien la eligió: sin el aro rojo sobre el segmento, la nota señalaría la barra equivocada.
  const f = filas.find((x) => x.item.id === "c4");
  return f && (f.c.falta_info ?? 0) > 0 ? { item: "c4", serie: "falta_info", texto: "la respuesta más interesante" } : null;
}

function Leyenda({ series, compacto }: { series: Serie[]; compacto: boolean }) {
  return (
    <ul className={`flex flex-wrap items-center ${compacto ? "gap-x-3 gap-y-1" : "gap-x-[1.7rem] gap-y-[0.4rem]"}`}>
      {series.map((se) => (
        <li key={se.id} className="flex items-center gap-[0.45em]">
          <span
            aria-hidden
            className={compacto ? "size-2.5" : "size-[1.15rem]"}
            style={{ background: se.trama ? TRAMA_NO : se.fondo, boxShadow: se.trama ? `inset 0 0 0 1px ${NIEBLA}` : undefined }}
          />
          <span className={`bbva-titular ${compacto ? "text-[0.72rem]" : "text-[1.35rem]"}`}>{se.label}</span>
        </li>
      ))}
    </ul>
  );
}

function Barra({
  series,
  c,
  total,
  alto,
  umbral,
  tamPct,
  marcar,
  compacto,
}: {
  series: Serie[];
  c: Conteo;
  total: number;
  alto: string;
  umbral: number;
  tamPct: string;
  marcar?: string;
  compacto: boolean;
}) {
  // Índice del primer segmento con datos: los siguientes llevan un filete de papel a la izquierda.
  const primero = series.findIndex((se) => (c[se.id] ?? 0) > 0);
  return (
    <div className="relative flex w-full" style={{ height: alto, boxShadow: total ? SOMBRA_RECORTE : undefined }}>
      {total === 0 && <div className="absolute inset-0 border-2 border-dashed border-niebla bg-papel-2/50" />}
      {series.map((se, k) => {
        const v = c[se.id] ?? 0;
        const ancho = total ? (v / total) * 100 : 0;
        const pct = porc(v, total);
        const separador = v > 0 && primero >= 0 && k > primero;
        return (
          <div
            key={se.id}
            className="relative h-full min-w-0 transition-[width] duration-700 ease-out"
            style={{
              width: `${ancho}%`,
              background: se.trama ? TRAMA_NO : se.fondo,
              color: se.texto,
              boxShadow: separador ? `inset ${compacto ? "2px" : "0.16rem"} 0 0 ${PAPEL}` : undefined,
            }}
          >
            {v > 0 && pct >= umbral && (
              <span
                className="bbva-titular absolute inset-0 flex items-center justify-center tabular-nums"
                style={{ fontSize: pct < umbral * 1.8 ? `calc(${tamPct} * 0.78)` : tamPct }}
              >
                {pct}%
              </span>
            )}
            {marcar === se.id && v > 0 && (
              <Aro
                ancho={`calc(100% + ${compacto ? 0.8 : 1.5}rem)`}
                alto={`calc(100% + ${compacto ? 0.7 : 1.3}rem)`}
                minAncho={compacto ? "1.8rem" : "3.2rem"}
                grosor={compacto ? 1.8 : 2.8}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Apiladas({
  act,
  data,
  compacto,
  series,
  colTexto,
  anotar,
}: {
  act: ActividadBbva;
  data: ResultadosBbva | null;
  compacto: boolean;
  series: Serie[];
  colTexto: string;
  anotar: (filas: Fila[]) => Nota | null;
}) {
  const ids = series.map((s) => s.id);
  const filas: Fila[] = act.items.map((item) => {
    const c = conteo(data, item.id);
    return { item, c, total: totalItem(c, ids) };
  });
  const hay = filas.some((f) => f.total > 0);
  const nota = hay ? anotar(filas) : null;

  return (
    <div className="relative flex h-full w-full flex-col">
      <Cabecera compacto={compacto} n={data?.respondieron ?? 0} izq={<Leyenda series={series} compacto={compacto} />} />
      <div className={`flex flex-1 flex-col justify-center ${compacto ? "gap-3" : "gap-[1.3rem]"}`}>
        {filas.map(({ item, c, total }) => {
          const marcada = nota?.item === item.id ? nota : null;
          if (compacto) {
            return (
              <div key={item.id}>
                <p className="line-clamp-2 text-[0.8rem] leading-snug text-tinta">
                  <span className={`mr-1.5 font-mono text-[0.62rem] uppercase tracking-wider ${marcada ? "text-naranja" : "text-grafito"}`}>
                    {item.rotulo}
                  </span>
                  <span className="bbva-serif text-[0.95rem]">{item.texto}</span>
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Barra series={series} c={c} total={total} alto="1.45rem" umbral={13} tamPct="0.8rem" marcar={marcada?.serie} compacto />
                  <span className="w-7 shrink-0 text-right font-mono text-[0.65rem] tabular-nums text-grafito">{total || "—"}</span>
                </div>
                {marcada && <p className="bbva-mano mt-1 text-base leading-none text-rojo">↑ {marcada.texto}</p>}
              </div>
            );
          }
          return (
            <div key={item.id} className="grid items-center gap-x-[1.2rem]" style={{ gridTemplateColumns: `${colTexto} minmax(0,1fr) 3.6rem 10.5rem` }}>
              <div className="min-w-0">
                <p className={`font-mono text-[0.9rem] uppercase tracking-[0.16em] ${marcada ? "text-naranja" : "text-grafito"}`}>{item.rotulo}</p>
                <p className="bbva-serif mt-[0.1rem] text-[1.3rem] leading-[1.14] text-tinta">{item.texto}</p>
              </div>
              <Barra series={series} c={c} total={total} alto="3.3rem" umbral={9} tamPct="1.6rem" marcar={marcada?.serie} compacto={false} />
              <p className="text-right font-mono text-[1rem] tabular-nums text-grafito">{total ? `n ${total}` : "—"}</p>
              <div>
                {marcada && (
                  <p className="bbva-mano bbva-cae text-[1.75rem] leading-[0.95] text-rojo" style={varRot(-2)}>
                    ← {marcada.texto}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!hay && <AvisoEspera compacto={compacto} />}
    </div>
  );
}

// ============================================================
// Actividad 3 · Termómetro de autonomía
// ============================================================

/** De la zona baja (pizarra) a la alta (naranja). */
const NIVEL_COLOR = ["#3c4d61", "#5d7087", "#9a7c6c", "#cf6a40", "#e2582b"];
const NIVEL_CORTO = ["Encontrar", "Analizar", "Preparar", "Enviar", "Resolver solo"];

function Termometro({ act, data, porArea, compacto }: VizProps) {
  const item = act.items[0];
  if (porArea) return <TermometroPorArea item={item} data={data} compacto={compacto} />;
  const ids = item.opciones.map((o) => o.id);
  const c = conteo(data, item.id);
  const total = totalItem(c, ids);
  const max = maximo(c, ids);
  const med = mediana(c, ids);
  const labelMed = med !== null ? item.opciones[med].label : null;

  if (compacto) {
    return (
      <div className="relative w-full">
        <Cabecera
          compacto
          n={total}
          izq={
            <p className="text-[0.75rem] leading-tight text-grafito">
              Mediana: <span className="bbva-titular text-sm text-tinta">{labelMed ?? "—"}</span>
            </p>
          }
        />
        <ul className="grid gap-2">
          {item.opciones.map((o, k) => {
            const v = c[o.id] ?? 0;
            return (
              <li key={o.id} className="grid items-center gap-2" style={{ gridTemplateColumns: "0.9rem minmax(0,1fr) 3.6rem" }}>
                <span className="bbva-titular text-base" style={{ color: NIVEL_COLOR[k] }}>
                  {k + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[0.75rem] leading-tight text-tinta">
                    {o.label}
                    {k === med && <span className="bbva-mano ml-1 text-[0.95rem] text-rojo">← mediana</span>}
                  </p>
                  <div className="mt-0.5 h-2 bg-papel-2">
                    <div
                      className="h-full transition-[width] duration-700 ease-out"
                      style={{ width: `${max ? (v / max) * 100 : 0}%`, background: NIVEL_COLOR[k] }}
                    />
                  </div>
                </div>
                <span className="text-right font-mono text-[0.65rem] tabular-nums text-grafito">
                  {v} · {porc(v, total)}%
                </span>
              </li>
            );
          })}
        </ul>
        {total === 0 && <AvisoEspera compacto />}
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="mb-[0.8rem] flex items-end justify-between gap-[2rem]">
        <p className="bbva-serif text-[1.6rem] italic leading-tight text-grafito">
          El grupo deja avanzar al sistema hasta:{" "}
          {labelMed ? (
            <span className="bbva-titular bbva-subrayado whitespace-nowrap text-[2.3rem] not-italic text-tinta">{labelMed}</span>
          ) : (
            <span className="bbva-mano not-italic">…</span>
          )}
        </p>
        <Contador n={total} />
      </div>

      {/* Columnas: cuántos eligieron cada nivel como su límite */}
      <div className="grid h-[14.8rem] grid-cols-5">
        {item.opciones.map((o, k) => {
          const v = c[o.id] ?? 0;
          const alto = max ? (v / max) * 10 : 0;
          return (
            <div key={o.id} className="relative flex flex-col items-center justify-end">
              {k === med && <span aria-hidden className="absolute inset-x-[14%] bottom-0 top-0 bg-ambar/25" />}
              <p className={`bbva-titular relative text-[2.7rem] tabular-nums ${v ? "text-tinta" : "text-niebla"}`}>{v}</p>
              <p className="relative font-mono text-[0.95rem] tabular-nums text-grafito">{porc(v, total)}%</p>
              <div
                className="relative mt-[0.45rem] w-[54%] transition-[height] duration-700 ease-out"
                style={{ height: `${Math.max(alto, 0.3)}rem`, background: v ? NIVEL_COLOR[k] : NIEBLA, boxShadow: v ? SOMBRA_RECORTE : undefined }}
              />
            </div>
          );
        })}
      </div>

      {/* El tubo del termómetro */}
      <div className="grid h-[1.5rem] grid-cols-5 overflow-hidden rounded-full border-[0.16rem] border-tinta">
        {NIVEL_COLOR.map((col, k) => (
          <span key={col} className={k ? "border-l-[0.14rem] border-papel" : ""} style={{ background: col }} />
        ))}
      </div>

      {/* Mediana + nombres de los niveles */}
      <div className="mt-[0.35rem] grid grid-cols-5">
        {item.opciones.map((o, k) => (
          <div key={o.id} className="flex flex-col items-center text-center">
            <div className={`relative h-[1.9rem] w-full ${k === med ? "" : "invisible"}`}>
              <svg aria-hidden viewBox="0 0 16 12" className="absolute left-1/2 top-0 h-[1rem] w-[1.3rem] -translate-x-1/2">
                <path d="M8 1 L15 11 L1 11 Z" fill={TINTA} />
              </svg>
              <span className="bbva-mano absolute left-[calc(50%+1rem)] top-[-0.05rem] whitespace-nowrap text-[1.6rem] leading-none text-rojo">
                mediana
              </span>
            </div>
            <p className="bbva-titular text-[1.5rem]" style={{ color: NIVEL_COLOR[k] }}>
              {k + 1}
            </p>
            <p className="bbva-serif mt-[0.15rem] px-[0.5rem] text-[1.18rem] leading-[1.08] text-tinta">{o.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-[0.7rem] flex items-center gap-[0.9rem] font-mono text-[0.85rem] uppercase tracking-[0.14em] text-gris">
        <span>← Más control humano</span>
        <span aria-hidden className="h-px flex-1 bg-niebla" />
        <span>Más autonomía del sistema →</span>
      </div>
      {total === 0 && <AvisoEspera />}
    </div>
  );
}

/** Una fila por área (solo las que respondieron) sobre los mismos 5 niveles, con su mediana. */
function TermometroPorArea({ item, data, compacto }: { item: Item; data: ResultadosBbva | null; compacto: boolean }) {
  const ids = item.opciones.map((o) => o.id);
  const general = conteo(data, item.id);
  const totalGeneral = totalItem(general, ids);
  const todas = BBVA_AREAS.map((a) => ({ id: a.id as string, label: a.corto, c: conteoArea(data, a.id, item.id), grupo: false }));
  const conDatos = todas.filter((f) => totalItem(f.c, ids) > 0);
  // Sin respuestas todavía: se ve la grilla completa en gris (nunca una lámina vacía).
  const filas = [{ id: "grupo", label: compacto ? "Grupo" : "Todo el grupo", c: general, grupo: true }, ...(conDatos.length ? conDatos : todas)];
  const cols = compacto ? "5.2rem repeat(5,minmax(0,1fr)) 1.5rem" : "12.5rem repeat(5,minmax(0,1fr)) 3.6rem";
  const altoFila = compacto ? "2.3rem" : filas.length > 5 ? "3.05rem" : "3.4rem";
  const altoBarra = compacto ? 1.5 : filas.length > 5 ? 2.2 : 2.5;

  return (
    <div className="relative flex h-full w-full flex-col">
      <Cabecera
        compacto={compacto}
        n={totalGeneral}
        izq={<Rotulo compacto={compacto}>Por área · el aro rojo marca la mediana de cada una</Rotulo>}
      />
      {/* Encabezado de niveles */}
      <div className="grid items-end" style={{ gridTemplateColumns: cols }}>
        <span />
        {item.opciones.map((o, k) => (
          <div key={o.id} className="flex flex-col items-center px-[0.2rem] text-center">
            <span className={`bbva-titular ${compacto ? "text-sm" : "text-[1.5rem]"}`} style={{ color: NIVEL_COLOR[k] }}>
              {k + 1}
            </span>
            {!compacto && <span className="bbva-serif text-[1.12rem] leading-tight text-tinta">{NIVEL_CORTO[k]}</span>}
            <span className={`mt-[0.3rem] w-full ${compacto ? "h-1" : "h-[0.45rem]"}`} style={{ background: NIVEL_COLOR[k] }} />
          </div>
        ))}
        <span className={`self-end text-right font-mono text-grafito ${compacto ? "text-[0.55rem]" : "text-[0.85rem]"}`}>n</span>
      </div>

      <div className="flex flex-1 flex-col justify-center">
        {filas.map((f) => {
          const tot = totalItem(f.c, ids);
          const mx = maximo(f.c, ids);
          const med = mediana(f.c, ids);
          return (
            <div
              key={f.id}
              className={`grid items-stretch ${f.grupo ? "border-b-2 border-tinta bg-papel-2/70" : "border-b border-dashed border-niebla"}`}
              style={{ gridTemplateColumns: cols, height: altoFila }}
            >
              <span
                className={`bbva-titular self-center truncate ${f.grupo ? "text-tinta" : "text-grafito"} ${
                  compacto ? "px-1 text-[0.74rem]" : "px-[0.6rem] text-[1.45rem]"
                }`}
              >
                {f.label}
              </span>
              {ids.map((id, k) => {
                const v = f.c[id] ?? 0;
                return (
                  <div key={id} className={`relative flex items-end justify-center ${compacto ? "gap-0.5 pb-1" : "gap-[0.35rem] pb-[0.3rem]"}`}>
                    {k === med && <Aro ancho="84%" alto="104%" grosor={compacto ? 1.6 : 2.4} z={false} />}
                    <span
                      className="w-[20%] transition-[height] duration-700 ease-out"
                      style={{ height: v && mx ? `${Math.max(0.3, (v / mx) * altoBarra)}rem` : "0.18rem", background: v ? NIVEL_COLOR[k] : NIEBLA }}
                    />
                    <span
                      className={`relative font-mono leading-none tabular-nums ${v ? "text-tinta" : "text-niebla"} ${
                        compacto ? "text-[0.58rem]" : "text-[0.95rem]"
                      }`}
                    >
                      {v}
                    </span>
                  </div>
                );
              })}
              <span className={`self-center text-right font-mono tabular-nums text-grafito ${compacto ? "text-[0.6rem]" : "text-[0.95rem]"}`}>
                {tot}
              </span>
            </div>
          );
        })}
      </div>
      {totalGeneral === 0 && <AvisoEspera compacto={compacto} />}
    </div>
  );
}

// ============================================================
// Actividad 5 · El mapa del grupo
// ============================================================

const MAPA: { item: string; titulo: string; cortos?: Record<string, string>; flecha?: boolean }[] = [
  {
    item: "q1",
    titulo: "Lo que más molesta",
    cortos: {
      tiempo: "Consume tiempo",
      repetitivo: "Es repetitivo",
      buscar: "Buscar mucha información",
      pasos: "Demasiados pasos",
      parecidas: "Siempre cosas parecidas",
      revisar: "Revisar mucho",
      casos: "Muchos casos para analizar",
    },
  },
  { item: "q2", titulo: "Lo que hacen" },
  {
    item: "q3",
    titulo: "Cuánta autonomía quieren",
    flecha: true,
    cortos: {
      ayude: "Que me ayude",
      prepare: "Que prepare y yo reviso",
      recomiende: "Que me recomiende",
      ejecute: "Que ejecute pasos",
      casi_todo: "Que haga casi todo",
    },
  },
  { item: "q4", titulo: "Con qué frecuencia" },
];

function FlechaAutonomia({ compacto }: { compacto: boolean }) {
  return (
    <div aria-hidden className="flex shrink-0 items-stretch gap-[0.2rem]">
      <span className={`bbva-mano leading-none text-naranja [writing-mode:vertical-rl] ${compacto ? "text-[0.85rem]" : "text-[1.2rem]"}`}>
        más autonomía
      </span>
      <div className="flex flex-col items-center py-[0.3rem]">
        <span className="w-0 flex-1 border-l-2 border-grafito" />
        <svg viewBox="0 0 12 10" className={compacto ? "h-2 w-2.5" : "h-[0.7rem] w-[0.9rem]"}>
          <path d="M1 1 L6 9 L11 1" fill="none" stroke={GRAFITO} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

function PanelMapa({ act, data, k, compacto }: { act: ActividadBbva; data: ResultadosBbva | null; k: number; compacto: boolean }) {
  const spec = MAPA[k];
  const item = act.items.find((i) => i.id === spec.item);
  if (!item) return null;
  const ids = item.opciones.map((o) => o.id);
  const c = conteo(data, item.id);
  const total = totalItem(c, ids);
  const max = maximo(c, ids);
  const tops = destacadas(c, ids);

  return (
    <section
      className={`bbva-recorte relative ${compacto ? "px-3 pb-3 pt-2.5" : "bbva-cae px-[1.3rem] pb-[0.85rem] pt-[0.8rem]"}`}
      style={compacto ? undefined : { animationDelay: `${k * 0.1}s` }}
    >
      {!compacto && (
        <span
          aria-hidden
          className="bbva-cinta absolute -top-[0.55rem] h-[1.1rem] w-[4rem]"
          style={k % 2 ? { right: "1.8rem", rotate: "5deg" } : { left: "1.8rem", rotate: "-5deg" }}
        />
      )}
      <header className={`flex items-baseline justify-between gap-3 ${compacto ? "mb-1.5" : "mb-[0.5rem]"}`}>
        <h3 className={`bbva-titular ${compacto ? "text-[0.95rem]" : "text-[1.55rem]"}`}>
          <span className={`mr-[0.5em] font-mono tracking-[0.12em] text-naranja ${compacto ? "text-[0.6rem]" : "text-[0.85rem]"}`}>
            0{k + 1}
          </span>
          {spec.titulo}
        </h3>
        <span className={`font-mono tabular-nums text-grafito ${compacto ? "text-[0.6rem]" : "text-[0.9rem]"}`}>n {total}</span>
      </header>
      <div className={`flex ${compacto ? "gap-1.5" : "gap-[0.6rem]"}`}>
        {spec.flecha && <FlechaAutonomia compacto={compacto} />}
        <ul className={`grid min-w-0 flex-1 ${compacto ? "gap-y-1" : "gap-y-[0.18rem]"}`}>
          {item.opciones.map((o) => {
            const v = c[o.id] ?? 0;
            const top = tops.has(o.id);
            return (
              <li
                key={o.id}
                className={`grid items-center ${compacto ? "gap-x-2" : "gap-x-[0.8rem]"}`}
                style={{ gridTemplateColumns: compacto ? "9.6rem minmax(0,1fr) 2.1rem" : "14.5rem minmax(0,1fr) 3.3rem" }}
              >
                <span
                  title={o.label}
                  className={`truncate ${top ? "font-semibold text-tinta" : v ? "text-grafito" : "text-gris"} ${
                    compacto ? "text-[0.74rem] leading-tight" : "text-[1.1rem] leading-[1.28]"
                  }`}
                >
                  {spec.cortos?.[o.id] ?? o.label}
                </span>
                <span className={`relative bg-papel-2 ${compacto ? "h-1.5" : "h-[0.55rem]"}`}>
                  <span
                    className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                    style={{ width: `${max ? (v / max) * 100 : 0}%`, background: top ? NARANJA : GRAFITO }}
                  />
                </span>
                <span
                  className={`bbva-titular text-right tabular-nums ${top ? "text-naranja" : v ? "text-tinta" : "text-niebla"} ${
                    compacto ? "text-[0.8rem]" : "text-[1.3rem]"
                  }`}
                >
                  {porc(v, total)}%
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function Mapa({ act, data, compacto }: VizProps) {
  const n = data?.respondieron ?? 0;
  return (
    <div className="relative w-full">
      {compacto && <Cabecera compacto n={n} izq={<Rotulo compacto>Lo más elegido, en naranja</Rotulo>} />}
      <div className={compacto ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-2 gap-x-[2rem] gap-y-[1.2rem]"}>
        {MAPA.map((_, k) => (
          <PanelMapa key={k} act={act} data={data} k={k} compacto={compacto} />
        ))}
      </div>
      {n === 0 && <AvisoEspera compacto={compacto} />}
    </div>
  );
}

// ============================================================
// API pública
// ============================================================

/** Visualización colectiva de una actividad (proyector o, con `compacto`, el celular del docente). */
export function ResultadoActividad({
  activity,
  data,
  porArea = false,
  compacto = false,
}: {
  activity: BbvaActivityKey;
  data: ResultadosBbva | null;
  porArea?: boolean;
  compacto?: boolean;
}) {
  const act = getActividadBbva(activity);
  if (!act) return null;
  const props: VizProps = { act, data, porArea, compacto };
  let viz: ReactNode;
  switch (activity) {
    case "bbva_a1":
      viz = <Nube {...props} />;
      break;
    case "bbva_a2":
      viz = <Apiladas act={act} data={data} compacto={compacto} series={SERIES_A2} colTexto="23rem" anotar={notaA2} />;
      break;
    case "bbva_a3":
      viz = <Termometro {...props} />;
      break;
    case "bbva_a4":
      viz = <Apiladas act={act} data={data} compacto={compacto} series={SERIES_A4} colTexto="26rem" anotar={notaA4} />;
      break;
    case "bbva_a5":
      viz = <Mapa {...props} />;
      break;
  }
  return (
    <figure aria-label={`${act.resultado}${porArea ? " · por área" : ""}`} className={`relative m-0 w-full text-tinta ${compacto ? "" : "h-full"}`}>
      {viz}
    </figure>
  );
}

/** Personas conectadas por área (lo que no es un área conocida suma a "Otro"). */
function contarAreas(data: ResultadosBbva | null): Record<AreaId, number> {
  const out = Object.fromEntries(BBVA_AREAS.map((a) => [a.id, 0])) as Record<AreaId, number>;
  for (const [k, v] of Object.entries(data?.porArea ?? {})) {
    const id = (IDS_AREA.has(k) ? k : "otro") as AreaId;
    out[id] += v;
  }
  return out;
}

/**
 * Fichas: una credencial por persona (cae al entrar). Cuando son muchas se
 * afinan hasta volverse palotes de tinta, sin salirse de la fila.
 */
function Fichas({ n }: { n: number }) {
  const palotes = n > 30;
  const gap = n > 45 ? "1px" : palotes ? "0.1rem" : n > 18 ? "0.16rem" : "0.28rem";
  const credencial: CSSProperties = {
    background: `linear-gradient(to bottom, ${PIZARRA_2} 0 30%, ${BLANCO} 30%)`,
    boxShadow: `inset 0 0 0 1px rgba(23,24,27,0.28), 0 6px 10px -8px rgba(40,30,10,0.7)`,
  };
  return (
    <div className="flex h-[2.1rem] min-w-0 items-stretch" style={{ gap }}>
      {n === 0 && <span className="w-full self-end border-b-2 border-dashed border-niebla" />}
      {Array.from({ length: n }, (_, i) => (
        <span
          key={i}
          className="bbva-cae min-w-[2px] rounded-[2px]"
          style={{
            flex: "0 1 1.45rem",
            transformOrigin: "50% 100%",
            animationDelay: `${Math.min(i, 12) * 0.03}s`,
            ...(palotes ? { background: TINTA } : credencial),
            ...varRot(rot(i) * 0.9),
          }}
        />
      ))}
    </div>
  );
}

/** Placa de ingreso: cuántos entraron y de qué áreas (total grande + una fila por área). */
export function AreasConectadas({ data, compacto = false }: { data: ResultadosBbva | null; compacto?: boolean }) {
  const cuenta = contarAreas(data);
  const total = data?.participantes ?? BBVA_AREAS.reduce((s, a) => s + cuenta[a.id], 0);
  const max = Math.max(0, ...BBVA_AREAS.map((a) => cuenta[a.id]));
  const distintas = BBVA_AREAS.filter((a) => cuenta[a.id] > 0).length;

  if (compacto) {
    return (
      <div className="w-full text-tinta" aria-label={`${total} personas conectadas`}>
        <p className="flex items-baseline gap-2">
          <span className="bbva-titular text-3xl tabular-nums">{total}</span>
          <span className="text-[0.8rem] text-grafito">
            {total === 1 ? "conectada" : "conectadas"} · {distintas} {distintas === 1 ? "área" : "áreas"}
          </span>
        </p>
        <ul className="mt-2 grid gap-1">
          {BBVA_AREAS.map((a) => {
            const v = cuenta[a.id];
            return (
              <li key={a.id} className="grid items-center gap-2" style={{ gridTemplateColumns: "6rem minmax(0,1fr) 1.6rem" }}>
                <span className={`truncate text-[0.75rem] ${v ? "text-tinta" : "text-gris"}`}>{a.corto}</span>
                <span className="h-2 bg-papel-2">
                  <span
                    className="block h-full bg-tinta transition-[width] duration-700 ease-out"
                    style={{ width: `${max ? (v / max) * 100 : 0}%` }}
                  />
                </span>
                <span className="text-right font-mono text-[0.7rem] tabular-nums">{v}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="relative w-full text-tinta" aria-label={`${total} personas conectadas de ${distintas} áreas`}>
      <div className="mb-[1.3rem] flex items-end gap-[1.2rem]">
        <span className="bbva-titular text-[6.5rem] leading-[0.8] tabular-nums">{total}</span>
        <div className="pb-[0.2rem]">
          <p className="bbva-serif text-[1.7rem] italic leading-none">{total === 1 ? "persona conectada" : "personas conectadas"}</p>
          <p className="mt-[0.35rem] font-mono text-[0.9rem] uppercase tracking-[0.16em] text-grafito">
            {total === 0 ? "esperando que entren…" : `${distintas} ${distintas === 1 ? "área" : "áreas distintas"}`}
          </p>
        </div>
      </div>
      <ul className="grid gap-y-[0.75rem]">
        {BBVA_AREAS.map((a) => {
          const v = cuenta[a.id];
          return (
            <li key={a.id} className="grid items-center gap-x-[1rem]" style={{ gridTemplateColumns: "9.5rem minmax(0,1fr) 2.8rem" }}>
              <span className={`bbva-titular truncate text-[1.35rem] ${v ? "text-tinta" : "text-gris"}`}>{a.corto}</span>
              <Fichas n={v} />
              <span className={`bbva-titular text-right text-[1.7rem] tabular-nums ${v ? "text-tinta" : "text-niebla"}`}>{v}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
