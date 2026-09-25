"use client";

// Piezas de la presentación del Laboratorio BBVA (/bbva/clase): el marco de
// cada placa, los títulos con su anotación a mano, el anillo de texto de las
// curvas, el contador en vivo y los botones de resultados.
// Estética: collage editorial sobre papel. Todo en rem (la raíz escala con la
// pantalla, ver .deck-escala) o en SVG con viewBox.

import { Fragment, useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useResultadosBbva } from "@/components/bbva/use-resultados";
import { BBVA_LINK, BBVA_QR, type ResultadosBbva } from "@/lib/bbva-clase";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

/** style con variables CSS (--rot, --largo, --dur). */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;

export const dos = (n: number) => String(n).padStart(2, "0");

// --- Datos en vivo ----------------------------------------------------------------
// Al cambiar de placa el componente se vuelve a montar: se recuerda el último
// dato de cada actividad para que el contador y el gráfico no arranquen vacíos.

const MEMORIA = new Map<string, ResultadosBbva>();

export function useVivo(activity: string, intervalo = 1500): ResultadosBbva | null {
  const { data } = useResultadosBbva(activity, intervalo);
  const fresco = data && data.activity === activity ? data : null;
  useEffect(() => {
    if (fresco) MEMORIA.set(activity, fresco);
  }, [activity, fresco]);
  return fresco ?? MEMORIA.get(activity) ?? null;
}

/** Después de reiniciar la sesión: que no quede nada del ensayo. */
export function olvidarVivo() {
  MEMORIA.clear();
}

// --- Marco de placa ---------------------------------------------------------------

/** Hoja: márgenes de la placa, folio arriba y el contenido ocupando el resto. */
export function Hoja({ folio, children, className }: { folio?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className="flex h-full flex-col px-[4.5rem] pb-[0.8rem] pt-[2rem]">
      {/* A la derecha queda lugar para el indicador "en vivo". */}
      <div className="flex h-[2.6rem] shrink-0 items-start pr-[17rem]">{folio}</div>
      <div className={cn("relative min-h-0 flex-1", className)}>{children}</div>
    </div>
  );
}

/** Folio: "PLACA 04 —— BLOQUE" en mono; en naranja para actividades y curvas. */
export function Folio({
  rotulo,
  numero,
  extra,
  bloque,
  acento,
}: {
  rotulo: string;
  numero?: string;
  extra?: string;
  bloque?: string;
  acento?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-baseline gap-[0.9rem] font-mono">
      <span className={cn("text-[0.78rem] uppercase tracking-[0.32em]", acento ? "text-naranja" : "text-gris")}>{rotulo}</span>
      {numero && (
        <span className={cn("text-[2rem] leading-none tracking-tight", acento ? "text-naranja" : "text-tinta")}>{numero}</span>
      )}
      {extra && <span className="truncate text-[0.82rem] uppercase tracking-[0.2em] text-grafito">{extra}</span>}
      {bloque && (
        <>
          <span className="h-px w-[3rem] shrink-0 self-center bg-grafito/25" />
          <span className="truncate text-[0.78rem] uppercase tracking-[0.22em] text-gris">{bloque}</span>
        </>
      )}
    </div>
  );
}

// --- Títulos y anotaciones --------------------------------------------------------

export type TipoMarca = "subraya" | "tacha" | "circula";
export interface MarcaTitulo {
  texto: string;
  tipo: TipoMarca;
}

/**
 * Tamaño (rem) de un título en la titular condensada para que entre en
 * `ancho` rem sin cortar palabras y en no más de `renglones` renglones.
 * Archivo condensada en mayúsculas ≈ 0,52 em por letra.
 */
export function tamTitulo(texto: string, ancho: number, max: number, min = 2.6, renglones = 3) {
  const larga = Math.max(...texto.split(/\s+/).map((p) => p.length));
  const porPalabra = ancho / (larga * 0.52);
  const porLargo = (ancho * renglones) / (texto.length * 0.52);
  return Math.round(Math.max(min, Math.min(max, porPalabra, porLargo)) * 100) / 100;
}

/** Cada frase terminada en punto arranca renglón ("Trabajos distintos. / Operaciones parecidas."). */
export function frases(t: string): string[] {
  return t.split(/(?<=\.)\s+/).filter(Boolean);
}

/** Anotación a mano sobre una palabra: resaltador, tachado en lápiz rojo o círculo. */
export function Marca({ tipo, children, demora = 0.55 }: { tipo: TipoMarca; children: ReactNode; demora?: number }) {
  if (tipo === "subraya")
    return <span className="bbva-subrayado [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">{children}</span>;
  if (tipo === "tacha")
    return (
      <span className="relative inline-block">
        {children}
        <svg
          aria-hidden
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          className="pointer-events-none absolute -left-[0.06em] -right-[0.06em] top-[0.3em] h-[0.3em] w-[calc(100%+0.12em)] overflow-visible"
        >
          <path
            d="M1 7 C 22 4, 48 8, 70 4 S 92 3, 99 2"
            pathLength={100}
            fill="none"
            stroke="#c0392b"
            strokeWidth={2.4}
            strokeLinecap="round"
            className="bbva-traza"
            style={vars({ "--largo": 100, animationDelay: `${demora}s` })}
          />
        </svg>
      </span>
    );
  return (
    <span className="relative inline-block">
      {children}
      <span
        aria-hidden
        className="bbva-cae pointer-events-none absolute -inset-x-[0.2em] -inset-y-[0.1em] rounded-[50%] border-[0.055em] border-naranja"
        style={vars({ "--rot": "-3deg", animationDelay: `${demora}s` })}
      />
      <span
        aria-hidden
        className="bbva-cae pointer-events-none absolute -inset-x-[0.15em] -inset-y-[0.15em] rounded-[50%] border-[0.03em] border-naranja/70"
        style={vars({ "--rot": "2deg", animationDelay: `${demora + 0.08}s` })}
      />
    </span>
  );
}

/** Texto con la marca aplicada a la primera aparición de `marca.texto`. */
export function ConMarca({ texto, marca }: { texto: string; marca?: MarcaTitulo }) {
  const i = marca ? texto.indexOf(marca.texto) : -1;
  if (!marca || i < 0) return <>{texto}</>;
  return (
    <>
      {texto.slice(0, i)}
      <Marca tipo={marca.tipo}>{marca.texto}</Marca>
      {texto.slice(i + marca.texto.length)}
    </>
  );
}

export function Titulo({
  texto,
  marca,
  tam,
  className,
}: {
  texto: string;
  marca?: MarcaTitulo;
  tam: number;
  className?: string;
}) {
  return (
    <h1 className={cn("bbva-titular text-balance text-tinta", className)} style={{ fontSize: `${tam}rem` }}>
      {frases(texto).map((f, i) => (
        <span key={i} className="block">
          <ConMarca texto={f} marca={marca} />
        </span>
      ))}
    </h1>
  );
}

/** Flecha chica para las bajadas ("Entrada → operaciones → …"). */
export function FlechaLinea({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 26 12" className={cn("mx-[0.2em] inline-block h-[0.42em] w-[0.95em] align-middle text-naranja", className)}>
      <path d="M1 6h22M18 1.5l4.5 4.5L18 10.5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Bajada({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split("→");
  return (
    <p className={cn("bbva-serif italic leading-[1.12] text-grafito", className)}>
      {partes.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <FlechaLinea />}
          {p.trim()}
          {i < partes.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </p>
  );
}

/** Flecha dibujada a mano (curva), en naranja. `hacia` = hacia dónde apunta la punta. */
export function FlechaMano({ className, demora = 0.6, hacia = "derecha" }: { className?: string; demora?: number; hacia?: "derecha" | "abajo" | "arriba" }) {
  const d =
    hacia === "abajo"
      ? { cuerpo: "M10 6 C 4 30, 16 52, 44 60", punta: "M31 50 L 45 60 L 30 67" }
      : hacia === "arriba"
        ? { cuerpo: "M8 62 C 12 38, 22 18, 44 8", punta: "M30 8 L 45 7 L 40 21" }
        : { cuerpo: "M4 40 C 20 12, 52 6, 88 22", punta: "M75 12 L 89 22 L 74 30" };
  return (
    <svg aria-hidden viewBox={hacia === "derecha" ? "0 0 96 48" : "0 0 52 72"} className={cn("overflow-visible text-naranja", className)}>
      <path
        d={d.cuerpo}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        className="bbva-traza"
        style={vars({ "--largo": 100, animationDelay: `${demora}s` })}
      />
      <path
        d={d.punta}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="bbva-traza"
        style={vars({ "--largo": 100, animationDelay: `${demora + 0.9}s` })}
      />
    </svg>
  );
}

// --- Anillo de texto (placas de curva) --------------------------------------------

/** Parte la palabra del centro en renglones ("PODER / ≠ / CONVENIR", "ROMPÉ / LA TAREA"). */
export function lineasCentro(c: string): string[] {
  if (c.includes("≠"))
    return c
      .split("≠")
      .map((s) => s.trim())
      .flatMap((s, i) => (i ? ["≠", s] : [s]));
  const w = c.split(/\s+/);
  if (w.length >= 3) return [w[0], w.slice(1).join(" ")];
  return w.length === 2 && c.length > 10 ? w : [c];
}

/**
 * Anillo de texto circular que gira muy lento alrededor de una palabra fija.
 * Es la señal de "curva": frenar, sintetizar, cambiar de dirección.
 * Todo en un SVG (viewBox 1000): escala con su contenedor sin desarmarse.
 */
export function AnilloTexto({ anillo, centro, dur = 80 }: { anillo: string; centro: string; dur?: number }) {
  const id = `anillo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const R = 452;
  const C = 2 * Math.PI * R;
  const FS = 44;
  const partes = anillo
    .toUpperCase()
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);
  const unidad = partes.join(" · ").length + 3;
  const reps = Math.max(1, Math.round(C / (unidad * FS * 0.6)));
  const trozos = Array.from({ length: reps }, () => partes).flat();

  const lineas = lineasCentro(centro.toUpperCase());
  const larga = Math.max(...lineas.filter((l) => l !== "≠").map((l) => l.length));
  const fs = Math.min(200, 640 / (larga * 0.52), 600 / ((lineas.length - 1) * 0.95 + 0.74));
  const alto = (lineas.length - 1) * fs * 0.95 + fs * 0.72;
  const base0 = 500 - alto / 2 + fs * 0.72;

  return (
    <svg viewBox="0 0 1000 1000" className="h-full w-full overflow-visible" role="img" aria-label={`${centro}. ${partes.join(". ")}.`}>
      <defs>
        <path id={id} d={`M ${500 - R},500 a ${R},${R} 0 1,1 ${2 * R},0 a ${R},${R} 0 1,1 ${-2 * R},0`} />
      </defs>
      {/* Guías finas: parece un dial o un sello. */}
      <circle cx={500} cy={500} r={410} fill="none" stroke="#c9ccd1" strokeWidth={1.5} />
      <circle cx={500} cy={500} r={498} fill="none" stroke="#c9ccd1" strokeWidth={1} strokeDasharray="2 10" />
      <g className="bbva-gira" style={vars({ "--dur": `${dur}s`, transformOrigin: "500px 500px", transformBox: "view-box" })}>
        <text
          fill="#17181b"
          fontSize={FS}
          fontWeight={700}
          letterSpacing={4}
          style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontStretch: "68%", whiteSpace: "pre" }}
        >
          <textPath href={`#${id}`} textLength={C - 6} lengthAdjust="spacing">
            {trozos.map((t, i) => (
              <Fragment key={i}>
                {t}
                <tspan fill="#e2582b"> · </tspan>
              </Fragment>
            ))}
          </textPath>
        </text>
        {/* Una marca que viaja con el anillo: se nota que gira. */}
        <circle cx={500} cy={500 - 410} r={7} fill="#e2582b" />
      </g>
      {/* La palabra del centro no gira. */}
      <g className="bbva-cae" style={vars({ animationDelay: "0.25s" })}>
        {lineas.map((l, i) => {
          const y = base0 + i * fs * 0.95;
          if (l === "≠") {
            const w = fs * 0.62;
            const cy = y - fs * 0.36;
            return (
              <g key={i} stroke="#e2582b" strokeWidth={fs * 0.1} strokeLinecap="round">
                <line x1={500 - w / 2} x2={500 + w / 2} y1={cy - fs * 0.13} y2={cy - fs * 0.13} />
                <line x1={500 - w / 2} x2={500 + w / 2} y1={cy + fs * 0.13} y2={cy + fs * 0.13} />
                <line x1={500 + w * 0.2} x2={500 - w * 0.2} y1={cy - fs * 0.4} y2={cy + fs * 0.4} />
              </g>
            );
          }
          return (
            <text
              key={i}
              x={500}
              y={y}
              textAnchor="middle"
              fill="#17181b"
              fontSize={fs}
              fontWeight={800}
              style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontStretch: "68%" }}
            >
              {l}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

// --- En vivo ------------------------------------------------------------------------

/** Punto que late: la placa está escuchando al grupo. */
export function Latido({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-[0.6rem] shrink-0", className)} aria-hidden>
      <span className="absolute inset-0 animate-ping rounded-full bg-naranja/50" />
      <span className="relative size-full rounded-full bg-naranja" />
    </span>
  );
}

function IconoCelular({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 24" className={className}>
      <rect x={1.5} y={1} width={13} height={22} rx={2.4} fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d="M6 4h4" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx={8} cy={19.5} r={1.1} fill="currentColor" />
    </svg>
  );
}

/** "Respondé en tu celular" (con el punto que late). */
export function ChipCelular({ texto = "Respondé en tu celular o compu", className }: { texto?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-[0.6rem] rounded-full border border-tinta/70 bg-blanco px-[1rem] py-[0.45rem] font-mono text-[0.8rem] uppercase tracking-[0.16em] text-tinta shadow-[0_8px_16px_-12px_rgba(40,30,10,0.5)]",
        className,
      )}
    >
      <Latido />
      <IconoCelular className="h-[1.15rem] w-auto" />
      {texto}
    </span>
  );
}

/** Casillas de formulario que se van tildando a medida que responden. */
export function Casillas({ n, total, max = 64, className }: { n: number; total: number; max?: number; className?: string }) {
  if (!total) return null;
  const t = Math.min(total, max);
  return (
    <div className={cn("flex flex-wrap gap-[0.32rem]", className)} aria-hidden>
      {Array.from({ length: t }, (_, i) => (
        <span
          key={i}
          className={cn(
            "size-[0.82rem] rounded-[0.12rem] border-[1.5px] transition-colors duration-500",
            i < n ? "border-naranja bg-naranja" : "border-grafito/25 bg-blanco/60",
          )}
        />
      ))}
      {total > max && <span className="self-center font-mono text-[0.75rem] text-gris">+{total - max}</span>}
    </div>
  );
}

/** Contador grande: "18 de 24 respondieron" + casillas + una nota a mano. */
export function ContadorVivo({
  n,
  total,
  texto = "respondieron",
  className,
}: {
  n: number;
  total: number;
  texto?: string;
  className?: string;
}) {
  const faltan = Math.max(0, total - n);
  return (
    <div className={className}>
      <div className="flex items-end gap-[0.9rem]">
        <span key={n} className="pop bbva-titular text-[8.5rem] leading-[0.78] tabular-nums text-tinta">
          {n}
        </span>
        <span className="bbva-serif pb-[0.2rem] text-[1.75rem] italic leading-[1.05] text-grafito">
          de {total}
          <br />
          {texto}
        </span>
      </div>
      <Casillas n={n} total={total} className="mt-[1.2rem]" />
      {total > 0 && (
        <p className="bbva-mano mt-[0.6rem] text-[1.65rem] leading-none text-naranja">
          {faltan === 0 ? "¡están todos!" : faltan === 1 ? "falta 1…" : faltan <= 3 ? `faltan ${faltan}…` : " "}
        </p>
      )}
    </div>
  );
}

/** QR chico para los que llegan tarde. */
export function MiniQR({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[0.9rem]", className)}>
      <div className="bbva-recorte shrink-0 p-[0.45rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BBVA_QR} alt="" className="block size-[5.6rem]" />
      </div>
      <div className="min-w-0">
        <p className="bbva-serif text-[1.2rem] italic leading-tight text-tinta">¿Todavía no entraste?</p>
        <p className="mt-[0.2rem] font-mono text-[0.78rem] tracking-tight text-grafito">{BBVA_LINK}</p>
      </div>
    </div>
  );
}

/**
 * "Reiniciar actividad" en dos toques (sin confirm(): un diálogo taparía el proyector y no
 * se puede aceptar desde el control remoto). El primer toque lo arma 5 s; el segundo borra.
 */
export function BotonReiniciar({ onReiniciar, className }: { onReiniciar: () => void; className?: string }) {
  const [armado, setArmado] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(t.current), []);
  function tocar() {
    clearTimeout(t.current);
    if (armado) {
      setArmado(false);
      onReiniciar();
      return;
    }
    setArmado(true);
    t.current = setTimeout(() => setArmado(false), 5000);
  }
  return (
    <button
      type="button"
      {...rem(armado ? "Confirmar: borrar respuestas" : "Reiniciar actividad", armado)}
      onClick={tocar}
      className={cn(
        "inline-flex items-center gap-[0.5rem] whitespace-nowrap rounded-full px-[1rem] py-[0.5rem] font-mono text-[0.72rem] uppercase tracking-[0.16em] transition active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-naranja",
        armado ? "bg-rojo text-blanco" : "border border-tinta/20 text-gris hover:border-rojo/50 hover:text-rojo",
        className,
      )}
    >
      <span aria-hidden>↺</span>
      {armado ? "¿Borrar respuestas? Tocá de nuevo" : "Reiniciar actividad"}
    </button>
  );
}

/** Botones de la placa (también se tocan desde el celular de Marco). */
export function BotonesResultados({
  revelado,
  porArea,
  conArea,
  onRevelar,
  onPorArea,
  onReiniciar,
}: {
  revelado: boolean;
  porArea: boolean;
  conArea: boolean;
  onRevelar: () => void;
  onPorArea: () => void;
  /** Borra las respuestas de la actividad de esta placa (dos toques). */
  onReiniciar?: () => void;
}) {
  const base =
    "inline-flex items-center gap-[0.6rem] whitespace-nowrap rounded-full px-[1.1rem] py-[0.55rem] font-mono text-[0.78rem] uppercase tracking-[0.16em] transition active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-naranja";
  const tecla = "rounded-[0.2rem] border border-current/30 px-[0.35rem] py-[0.05rem] text-[0.65rem] opacity-60";
  return (
    <div className="flex flex-wrap items-center justify-end gap-[0.6rem]">
      <button
        type="button"
        {...rem("Mostrar resultados", revelado)}
        onClick={onRevelar}
        className={cn(base, revelado ? "border border-tinta/25 bg-transparent text-grafito hover:border-tinta/50" : "bg-tinta text-papel hover:bg-grafito")}
      >
        {revelado ? "Ocultar" : "Mostrar resultados"}
        <span className={tecla}>R</span>
      </button>
      {conArea && (
        <button
          type="button"
          {...rem("Por área", porArea)}
          onClick={onPorArea}
          className={cn(base, porArea ? "bg-pizarra text-blanco" : "border border-tinta/25 text-grafito hover:border-tinta/50")}
        >
          Por área
          <span className={tecla}>A</span>
        </button>
      )}
      {onReiniciar && <BotonReiniciar onReiniciar={onReiniciar} />}
    </div>
  );
}
