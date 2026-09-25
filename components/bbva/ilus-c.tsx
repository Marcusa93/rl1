"use client";

// Ilustraciones de las placas 14–20 del Laboratorio BBVA.
// Collage editorial sobre papel ("arqueología contemporánea del trabajo"):
// el protagonista es el trabajo; la IA aparece apenas como una ficha o un sello
// más del sistema, nunca como robot.
//
// Cada componente llena su contenedor (el deck le da el tamaño) y escala con la
// placa gracias al viewBox. Las interactivas (15, 16 y 17) usan botones HTML
// reales marcados con rem(...) —Marco los toca desde el celular o con el mouse—
// superpuestos a una "lámina" que conserva la proporción del dibujo, así cada
// botón cae exactamente sobre lo que controla.
//
// Continuidad visual: la 15 repite las fichas de la 13 (ilus-b) y la 20 vuelve
// a la mesa de la 01 (ilus-a) con los mismos objetos, que se ordenan en un flujo.

import { useId, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import type { IlusId } from "@/lib/bbva-clase";
import { rem } from "@/lib/remoto";

// --- Paleta y tipografías (idénticas al sistema de diseño) -------------------------

const K = {
  papel: "#f2eee6",
  papel2: "#e8e2d6",
  carton: "#d8cfbd",
  blanco: "#fbfaf7",
  tinta: "#17181b",
  grafito: "#45484f",
  gris: "#8a8d94",
  niebla: "#c9ccd1",
  pizarra: "#5d7087",
  pizarra2: "#3c4d61",
  cielo: "#b3c1d1",
  naranja: "#e2582b",
  rojo: "#c0392b",
  ambar: "#f3c54b",
} as const;

const TIT: CSSProperties = { fontFamily: "var(--font-archivo), 'Arial Narrow', system-ui, sans-serif", fontStretch: "68%", fontWeight: 800 };
const SERIF: CSSProperties = { fontFamily: "var(--font-instrument), Georgia, serif", fontStyle: "italic" };
const SERIF_R: CSSProperties = { fontFamily: "var(--font-instrument), Georgia, serif" };
const MANO: CSSProperties = { fontFamily: "var(--font-caveat), cursive", fontWeight: 600 };
const MONO: CSSProperties = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" };
const SANS: CSSProperties = { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" };

/** Estilo con variables CSS (--rot, --largo, --dur…). */
type Estilo = CSSProperties & { [k: `--${string}`]: string | number };

// --- Ids únicos por instancia (filtros, patrones, trayectos de texto) ----------------

type Id = (n: string) => string;

function useIds(): Id {
  const crudo = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (n: string) => `ic${crudo}-${n}`;
}

const url = (id: Id, n: string) => `url(#${id(n)})`;

function Defs({ id }: { id: Id }) {
  return (
    <defs>
      <filter id={id("sombra")} x="-15%" y="-15%" width="130%" height="140%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2a1e0a" floodOpacity="0.22" />
      </filter>
      <filter id={id("sombra-chica")} x="-20%" y="-20%" width="140%" height="150%" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#2a1e0a" floodOpacity="0.26" />
      </filter>
      {/* Tinta de sello: bordes gastados y huecos de tinta. */}
      <filter id={id("tinta")} x="-8%" y="-8%" width="116%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="5" result="ruido" />
        <feDisplacementMap in="SourceGraphic" in2="ruido" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="movido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.65" result="huecos" />
        <feComposite in="movido" in2="huecos" operator="in" />
      </filter>
      {/* Trama de grabado (láminas técnicas). */}
      <pattern id={id("trama")} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="5" stroke={K.grafito} strokeWidth="0.7" />
      </pattern>
      <linearGradient id={id("postit")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7d465" />
        <stop offset="1" stopColor={K.ambar} />
      </linearGradient>
      {/* Trayecto circular para el texto de los sellos redondos. */}
      <path id={id("arco")} d="M -25 0 A 25 25 0 1 1 25 0 A 25 25 0 1 1 -25 0" fill="none" />
    </defs>
  );
}

// --- Piezas comunes del collage -----------------------------------------------------

/** Entrada del collage: la pieza cae y se apoya (sin mover su posición final). */
function Aparece({ d = 0, children }: { d?: number; children: ReactNode }) {
  return (
    <g className="bbva-cae" style={{ animationDelay: `${d}s`, transformBox: "fill-box", transformOrigin: "center" }}>
      {children}
    </g>
  );
}

/** Pieza ubicada en (x, y), girada r grados alrededor de ese punto, que cae al entrar. */
function Pieza({ x = 0, y = 0, r = 0, d = 0, children }: { x?: number; y?: number; r?: number; d?: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})${r ? ` rotate(${r})` : ""}`}>
      <Aparece d={d}>{children}</Aparece>
    </g>
  );
}

/** Trazo a mano que se dibuja solo (pathLength normalizado: no hace falta medirlo). */
function Traza({ d, delay = 0, c = K.grafito, ancho = 2 }: { d: string; delay?: number; c?: string; ancho?: number }) {
  const s: Estilo = { "--largo": 1.02, animationDelay: `${delay}s` };
  return (
    <path
      d={d}
      pathLength={1}
      fill="none"
      stroke={c}
      strokeWidth={ancho}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="bbva-traza"
      style={s}
    />
  );
}

/** Punta de flecha en (x, y) apuntando hacia `ang` grados (0 = derecha, 90 = abajo). */
function punta(x: number, y: number, ang: number, t = 10) {
  const a = (ang * Math.PI) / 180 + Math.PI;
  const p = (da: number) => `${(x + t * Math.cos(a + da)).toFixed(1)},${(y + t * Math.sin(a + da)).toFixed(1)}`;
  return `M${p(-0.5)} L${x},${y} L${p(0.5)}`;
}

/** Flecha manuscrita: el cuerpo se dibuja y después aparece la punta. */
function Flecha({
  d,
  x,
  y,
  ang,
  delay = 0,
  c = K.naranja,
  ancho = 2.4,
  t = 10,
}: {
  d: string;
  x: number;
  y: number;
  ang: number;
  delay?: number;
  c?: string;
  ancho?: number;
  t?: number;
}) {
  return (
    <g>
      <Traza d={d} delay={delay} c={c} ancho={ancho} />
      <Traza d={punta(x, y, ang, t)} delay={delay + 0.85} c={c} ancho={ancho} />
    </g>
  );
}

/** Cinta adhesiva con los bordes cortados a mano. */
function Cinta({ x, y, w = 52, h = 15, r = 0 }: { x: number; y: number; w?: number; h?: number; r?: number }) {
  const q = h / 4;
  const d = `M0,0 L${w},0 l-3,${q} l3,${q} l-3,${q} l3,${q} L0,${h} l3,${-q} l-3,${-q} l3,${-q} Z`;
  return <path d={d} transform={`translate(${x} ${y}) rotate(${r})`} fill="rgba(236,226,196,0.8)" stroke="rgba(0,0,0,0.05)" />;
}

/** Persona en dibujo de línea (busto), como en las placas 08–13. (x, y) = centro de la cabeza. */
function Persona({ x, y, s = 1, c = K.naranja, ancho = 2.4 }: { x: number; y: number; s?: number; c?: string; ancho?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={ancho / s} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={0} cy={0} r={11} />
      <path d="M-21,40 C-21,21 -12,16 0,16 C12,16 21,21 21,40" />
    </g>
  );
}

/** Ficha "IA" discreta (como la de la placa 10): una pieza más del sistema. (x, y) = esquina sup. izq. */
function FichaIA({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M7,0 H44 V24 H7 L0,17 V7 Z" fill={K.blanco} stroke={K.pizarra2} strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx={6.5} cy={12} r={2.3} fill={K.papel} stroke={K.pizarra2} strokeWidth={1.1} />
      <text x={27} y={18} textAnchor="middle" fontSize={16} fill={K.pizarra2} style={TIT}>
        IA
      </text>
    </g>
  );
}

/** Contorno de un engranaje centrado en (0,0). */
function engranaje(r: number, dientes: number, alto = r * 0.2) {
  const paso = (Math.PI * 2) / dientes;
  const pt = (rr: number, a: number) => `${(rr * Math.cos(a)).toFixed(1)} ${(rr * Math.sin(a)).toFixed(1)}`;
  let d = "";
  for (let i = 0; i < dientes; i++) {
    const a = i * paso;
    d += `${i === 0 ? "M" : "L"}${pt(r, a)} L${pt(r + alto, a + paso * 0.14)} L${pt(r + alto, a + paso * 0.44)} L${pt(r, a + paso * 0.58)} `;
    d += `A${r} ${r} 0 0 1 ${pt(r, a + paso)} `;
  }
  return `${d}Z`;
}

/** Engranaje de grabado que gira muy despacio (el sentido alterna para que "engranen"). */
function Engranaje({ cx, cy, r, dientes, dur, rev = false }: { cx: number; cy: number; r: number; dientes: number; dur: number; rev?: boolean }) {
  const s: Estilo = { "--dur": `${dur}s`, animationDirection: rev ? "reverse" : "normal" };
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <g className="bbva-gira" style={s}>
        {/* círculo invisible: centra la caja del giro */}
        <circle r={r * 1.22} fill="none" />
        <path d={engranaje(r, dientes)} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} strokeLinejoin="round" />
        <circle r={r * 0.64} fill="none" stroke={K.grafito} strokeWidth={0.7} />
        {[0, 1, 2, 3].map((k) => {
          const a = (k * Math.PI) / 2 + 0.4;
          return (
            <line
              key={k}
              x1={(r * 0.24 * Math.cos(a)).toFixed(1)}
              y1={(r * 0.24 * Math.sin(a)).toFixed(1)}
              x2={(r * 0.64 * Math.cos(a)).toFixed(1)}
              y2={(r * 0.64 * Math.sin(a)).toFixed(1)}
              stroke={K.grafito}
              strokeWidth={1.2}
            />
          );
        })}
        <circle r={r * 0.24} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
      </g>
    </g>
  );
}

/** Porcentaje (para ubicar los botones HTML sobre la lámina). */
const pc = (v: number, total: number) => `${((v / total) * 100).toFixed(3)}%`;

/**
 * Lámina interactiva: un recuadro con la proporción exacta del viewBox, centrado
 * en el contenedor. El SVG lo llena y los botones HTML (capa) se ubican en %, así
 * coinciden con el dibujo a cualquier tamaño de pantalla.
 */
function Lamina({ w, h, label, children, capa }: { w: number; h: number; label: string; children: ReactNode; capa?: ReactNode }) {
  return (
    <div className="grid h-full min-h-[12rem] w-full place-items-center" style={{ containerType: "size" }}>
      <div
        className="relative"
        style={{ width: `min(100cqw, calc(100cqh * ${(w / h).toFixed(4)}))`, aspectRatio: `${w} / ${h}`, containerType: "inline-size" }}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="absolute inset-0 h-full w-full overflow-visible" role="img" aria-label={label}>
          {children}
        </svg>
        {capa}
      </div>
    </div>
  );
}

/** Zona tocable invisible sobre una parte del dibujo (cartas, posiciones del control). */
function Zona({
  x,
  y,
  w,
  h,
  vb,
  on,
  label,
  aria,
  onClick,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  vb: [number, number];
  on: boolean;
  label: string;
  aria: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      aria-label={aria}
      {...rem(label, on)}
      className="bbva-boton absolute cursor-pointer rounded-[0.6cqw] outline-none transition-colors hover:bg-tinta/[0.035] focus-visible:ring-2 focus-visible:ring-naranja/70"
      style={{ left: pc(x, vb[0]), top: pc(y, vb[1]), width: pc(w, vb[0]), height: pc(h, vb[1]) }}
    />
  );
}

// =====================================================================================
// PLACA 14 · Todo proceso tiene una anatomía — lámina técnica de enciclopedia.
// =====================================================================================

const LEYENDA_14 = [
  { n: "1", t: "ENTRADA", q: "¿qué recibo?" },
  { n: "2", t: "OPERACIONES", q: "¿qué hago?" },
  { n: "3", t: "DECISIONES", q: "¿dónde necesito criterio?" },
  { n: "4", t: "SALIDA", q: "¿qué produzco?" },
];

const LLAMADAS_14: { n: string; x: number; y: number; a: [number, number] }[] = [
  { n: "1", x: 232, y: 108, a: [196, 168] },
  { n: "2", x: 367, y: 108, a: [367, 176] },
  { n: "3", x: 548, y: 108, a: [572, 210] },
  { n: "4", x: 745, y: 108, a: [746, 211] },
  { n: "5", x: 822, y: 108, a: [822, 304] },
];

/** Número de referencia con su línea guía hasta la parte señalada. */
function Llamada({ n, x, y, a, d }: { n: string; x: number; y: number; a: [number, number]; d: number }) {
  const [ax, ay] = a;
  const L = Math.hypot(ax - x, ay - y);
  const sx = x + ((ax - x) / L) * 14;
  const sy = y + ((ay - y) / L) * 14;
  return (
    <g>
      <Traza d={`M${sx.toFixed(1)},${sy.toFixed(1)} L${ax},${ay}`} delay={d} c={K.tinta} ancho={0.9} />
      <Aparece d={d + 0.7}>
        <circle cx={ax} cy={ay} r={2.4} fill={K.tinta} />
      </Aparece>
      <Aparece d={d}>
        <circle cx={x} cy={y} r={14} fill={K.blanco} stroke={K.tinta} strokeWidth={1.3} />
        <text x={x} y={y + 6} textAnchor="middle" fontSize={18} fill={K.tinta} style={SERIF_R}>
          {n}
        </text>
      </Aparece>
    </g>
  );
}

/** Pequeña flecha de sentido dentro de un caño. */
const sentido = (x: number, y = 261) => `M${x - 3},${y - 6} L${x + 3},${y} L${x - 3},${y + 6}`;

function P14Anatomia() {
  const id = useIds();
  const trama = url(id, "trama");
  return (
    <svg
      viewBox="0 0 1200 460"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Lámina técnica, figura 1, anatomía de un proceso: 1 entrada (qué recibo), una tolva donde caen un correo, un documento y un mensaje; 2 operaciones (qué hago), una máquina con engranajes que leen, buscan y comparan; 3 decisiones (dónde necesito criterio), una válvula con una balanza y una salida lateral para las excepciones; 4 salida (qué produzco), un documento terminado; y 5, pequeña, quién usa el resultado."
    >
      <Defs id={id} />

      {/* La lámina: hoja, doble filete, encabezado y columna de leyenda */}
      <Aparece d={0}>
        <rect x={14} y={8} width={1172} height={444} fill={K.blanco} filter={url(id, "sombra")} />
        <rect x={30} y={24} width={1140} height={412} fill="none" stroke={K.tinta} strokeWidth={1.4} />
        <rect x={36} y={30} width={1128} height={400} fill="none" stroke={K.tinta} strokeWidth={0.6} />
        <text x={54} y={52} fontSize={11} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          LÁM. XIV
        </text>
        <text x={600} y={53} textAnchor="middle" fontSize={16} fill={K.grafito} style={SERIF}>
          Estudio del trabajo — de la tarea al proceso
        </text>
        <text x={1146} y={52} textAnchor="end" fontSize={11} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          TAB. 14
        </text>
        <line x1={54} y1={64} x2={1146} y2={64} stroke={K.tinta} strokeWidth={0.6} />
        <line x1={852} y1={80} x2={852} y2={414} stroke={K.tinta} strokeWidth={0.6} />
      </Aparece>

      {/* 1 · ENTRADA: la tolva y el caño */}
      <Aparece d={0.2}>
        <path d="M72,172 L122,238 L150,238 L200,172 Z" fill={trama} opacity={0.5} />
        <path d="M72,172 L122,238 M200,172 L150,238" fill="none" stroke={K.tinta} strokeWidth={2} strokeLinecap="round" />
        <ellipse cx={136} cy={172} rx={64} ry={11} fill={K.blanco} stroke={K.tinta} strokeWidth={2} />
        <ellipse cx={136} cy={173} rx={52} ry={6.5} fill="none" stroke={K.grafito} strokeWidth={0.6} />
        <path d="M122,238 V258 Q122,272 136,272 H262 V250 H156 Q150,250 150,244 V238 Z" fill={trama} opacity={0.3} />
        <path d="M122,238 V258 Q122,272 136,272 H262" fill="none" stroke={K.tinta} strokeWidth={2} />
        <path d="M150,238 V244 Q150,250 156,250 H262" fill="none" stroke={K.tinta} strokeWidth={2} />
        <path d={sentido(206)} fill="none" stroke={K.grafito} strokeWidth={1.4} strokeLinecap="round" />
        <rect x={256} y={244} width={8} height={34} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        {/* líneas de caída */}
        <path d="M100,70 v9 M112,62 v11 M168,58 v10 M178,66 v8" stroke={K.grafito} strokeWidth={1} strokeLinecap="round" />
      </Aparece>
      <Pieza x={86} y={96} r={-14} d={0.35}>
        <rect width={48} height={30} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        <path d="M0.5,1 L24,18 L47.5,1" fill="none" stroke={K.tinta} strokeWidth={1.2} strokeLinejoin="round" />
      </Pieza>
      <Pieza x={150} y={84} r={9} d={0.45}>
        <rect width={32} height={42} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        <path d="M6,10 H26 M6,17 H24 M6,24 H26 M6,31 H18" stroke={K.grafito} strokeWidth={0.9} />
      </Pieza>
      <Pieza x={114} y={136} r={-5} d={0.55}>
        <path d="M5,0 H29 Q34,0 34,5 V13 Q34,18 29,18 H12 L6,23 L7,18 H5 Q0,18 0,13 V5 Q0,0 5,0 Z" fill={K.blanco} stroke={K.tinta} strokeWidth={1.2} />
        <circle cx={11} cy={9} r={1.5} fill={K.tinta} />
        <circle cx={17} cy={9} r={1.5} fill={K.tinta} />
        <circle cx={23} cy={9} r={1.5} fill={K.tinta} />
      </Pieza>

      {/* 2 · OPERACIONES: la máquina con engranajes a la vista */}
      <Aparece d={0.4}>
        <rect x={262} y={178} width={210} height={166} rx={10} fill={K.blanco} stroke={K.tinta} strokeWidth={2} />
        <rect x={276} y={192} width={182} height={138} rx={6} fill={trama} opacity={0.16} />
        <rect x={276} y={192} width={182} height={138} rx={6} fill="none" stroke={K.grafito} strokeWidth={0.8} />
        {[
          [270, 186],
          [464, 186],
          [270, 336],
          [464, 336],
        ].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={2.4} fill={K.grafito} />
        ))}
        <Engranaje cx={322} cy={238} r={30} dientes={11} dur={70} />
        <Engranaje cx={370} cy={278} r={23} dientes={9} dur={54} rev />
        <Engranaje cx={404} cy={241} r={19} dientes={8} dur={44} />
        <text x={367} y={322} textAnchor="middle" fontSize={10.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.06em" }}>
          leer · buscar · comparar
        </text>
      </Aparece>

      {/* 3 · DECISIONES: la válvula con la balanza del criterio */}
      <Aparece d={0.55}>
        <rect x={472} y={250} width={68} height={22} fill={trama} opacity={0.3} />
        <path d="M472,250 H540 M472,272 H540" stroke={K.tinta} strokeWidth={2} />
        <rect x={468} y={244} width={8} height={34} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        <path d={sentido(506)} fill="none" stroke={K.grafito} strokeWidth={1.4} strokeLinecap="round" />
        {/* rama de la excepción, hacia abajo */}
        <rect x={576} y={300} width={18} height={56} fill={trama} opacity={0.3} />
        <path d="M576,300 V356 M594,300 V356" stroke={K.tinta} strokeWidth={2} />
        <rect x={566} y={342} width={30} height={24} fill={K.blanco} stroke={K.grafito} strokeWidth={1} transform="rotate(-8 581 354)" />
        <path d="M548,354 L556,384 H614 L622,354" fill={K.blanco} stroke={K.tinta} strokeWidth={1.8} strokeLinejoin="round" />
        {/* salida hacia la derecha */}
        <rect x={630} y={250} width={60} height={22} fill={trama} opacity={0.3} />
        <path d="M630,250 H690 M630,272 H690" stroke={K.tinta} strokeWidth={2} />
        <path d={sentido(664)} fill="none" stroke={K.grafito} strokeWidth={1.4} strokeLinecap="round" />
        {/* la válvula */}
        <path d="M523,261 L585,199 L647,261 L585,323 Z" fill={K.blanco} stroke={K.tinta} strokeWidth={2} strokeLinejoin="round" />
        <path d="M585,199 L647,261 L585,323 Z" fill={trama} opacity={0.22} />
        <path d="M585,199 L604,176" stroke={K.tinta} strokeWidth={2.2} strokeLinecap="round" />
        <circle cx={607} cy={172} r={5.5} fill={K.tinta} />
        <g fill="none" stroke={K.tinta} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
          <path d="M585,241 V290 M571,291 H599" />
          <path d="M560,245 L610,238" />
          <path d="M562,245 L555,264 M562,245 L569,264 M608,238 L601,257 M608,238 L615,257" strokeWidth={1} />
        </g>
        <path d="M551,264 Q562,275 573,264 Z" fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} strokeLinejoin="round" />
        <path d="M597,257 Q608,268 619,257 Z" fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} strokeLinejoin="round" />
        <circle cx={585} cy={241.5} r={2.6} fill={K.tinta} />
      </Aparece>
      <Aparece d={1.5}>
        <text x={632} y={380} fontSize={24} fill={K.rojo} style={MANO}>
          excepción
        </text>
      </Aparece>

      {/* 4 · SALIDA: la boca y el documento terminado */}
      <Aparece d={0.7}>
        <rect x={688} y={230} width={28} height={62} rx={3} fill={K.blanco} stroke={K.tinta} strokeWidth={2} />
        <path d="M712,240 V282" stroke={K.tinta} strokeWidth={3} strokeLinecap="round" />
      </Aparece>
      <Pieza x={716} y={214} r={-5} d={0.8}>
        <rect width={64} height={86} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        <path d="M8,12 H40" stroke={K.tinta} strokeWidth={2} />
        <path d="M8,24 H56 M8,32 H54 M8,40 H56 M8,48 H50 M8,56 H38" stroke={K.grafito} strokeWidth={0.8} />
        <path d="M30,74 c4,-8 8,6 12,-2 s6,-6 10,2" fill="none" stroke={K.tinta} strokeWidth={1.1} strokeLinecap="round" />
      </Pieza>

      {/* 5 · Quién usa el resultado (referencia chica) */}
      <Aparece d={0.9}>
        <path d="M786,290 Q800,298 806,318" fill="none" stroke={K.grafito} strokeWidth={1.2} strokeDasharray="3 3" />
        <Persona x={822} y={318} s={0.85} c={K.tinta} ancho={1.8} />
      </Aparece>

      {/* Referencias numeradas */}
      {LLAMADAS_14.map((l, i) => (
        <Llamada key={l.n} n={l.n} x={l.x} y={l.y} a={l.a} d={0.95 + i * 0.12} />
      ))}

      {/* Anotación a mano */}
      <Aparece d={1.7}>
        <text x={500} y={404} textAnchor="end" fontSize={25} fill={K.naranja} style={MANO}>
          acá hace falta criterio
        </text>
      </Aparece>
      <Flecha d="M506,396 C530,388 544,340 547,298" x={547} y={298} ang={-86} delay={1.8} ancho={2} t={9} />

      {/* Escala */}
      <Aparece d={1.2}>
        <text x={60} y={396} fontSize={9} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          ESCALA
        </text>
        {[0, 1, 2, 3, 4].map((k) => (
          <rect key={k} x={60 + k * 24} y={402} width={24} height={5} fill={k % 2 ? K.blanco : K.tinta} stroke={K.tinta} strokeWidth={0.8} />
        ))}
        <text x={60} y={420} fontSize={9} fill={K.grafito} style={MONO}>
          0
        </text>
        <text x={180} y={420} textAnchor="end" fontSize={9} fill={K.grafito} style={MONO}>
          1 jornada
        </text>
      </Aparece>

      {/* Leyenda: Fig. 1 */}
      <Aparece d={1.0}>
        <text x={872} y={96} fontSize={11} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          FIG. 1
        </text>
        <text x={872} y={124} fontSize={26} fill={K.tinta} style={SERIF}>
          Anatomía de un proceso
        </text>
        <line x1={872} y1={140} x2={1146} y2={140} stroke={K.tinta} strokeWidth={0.6} />
      </Aparece>
      {LEYENDA_14.map((e, i) => {
        const y = 180 + i * 54;
        return (
          <Aparece key={e.n} d={1.15 + i * 0.12}>
            <circle cx={884} cy={y - 9} r={11} fill={K.blanco} stroke={K.tinta} strokeWidth={1.2} />
            <text x={884} y={y - 4} textAnchor="middle" fontSize={15} fill={K.tinta} style={SERIF_R}>
              {e.n}
            </text>
            <text x={906} y={y} fontSize={27} fill={K.tinta} style={TIT}>
              {e.t}
            </text>
            <text x={906} y={y + 22} fontSize={20} fill={K.grafito} style={SERIF}>
              {e.q}
            </text>
          </Aparece>
        );
      })}
      <Aparece d={1.65}>
        <line x1={872} y1={372} x2={1000} y2={372} stroke={K.niebla} strokeWidth={0.8} strokeDasharray="2 3" />
        <circle cx={884} cy={390} r={9} fill={K.blanco} stroke={K.tinta} strokeWidth={1} />
        <text x={884} y={394} textAnchor="middle" fontSize={12} fill={K.tinta} style={SERIF_R}>
          5
        </text>
        <text x={906} y={395} fontSize={17} fill={K.tinta} style={TIT}>
          DESTINO
        </text>
        <text x={978} y={395} fontSize={17} fill={K.grafito} style={SERIF}>
          ¿quién usa el resultado?
        </text>
      </Aparece>
    </svg>
  );
}

// =====================================================================================
// PLACA 15 · ¿Dónde entra la IA? — las mismas fichas de la 13, ahora selladas (interactiva).
// =====================================================================================

// Dibujos de las fichas: los mismos de la placa 13 (ilus-b), para que se reconozca el flujo.

function ObjRecibir() {
  return (
    <g>
      <g transform="rotate(8 89 64)">
        <rect x={72} y={34} width={34} height={60} rx={6} fill={K.papel2} stroke={K.grafito} strokeWidth={1.5} />
        <rect x={76} y={42} width={26} height={40} rx={1} fill={K.blanco} />
        <rect x={80} y={48} width={18} height={4} fill={K.niebla} />
        <rect x={80} y={56} width={14} height={4} fill={K.niebla} />
      </g>
      <rect x={20} y={60} width={84} height={54} rx={2} fill={K.blanco} stroke={K.grafito} strokeWidth={1.6} />
      <path d="M20,62 L62,92 L104,62" fill="none" stroke={K.grafito} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M20,114 L50,88 M104,114 L74,88" stroke={K.niebla} strokeWidth={1.2} />
      <circle cx={102} cy={60} r={10} fill={K.naranja} />
      <text x={102} y={64} textAnchor="middle" fontSize={11} fontWeight={700} fill={K.blanco} style={MONO}>
        1
      </text>
    </g>
  );
}

function ObjIdentificar() {
  return (
    <g>
      <rect x={58} y={38} width={16} height={11} rx={2} fill={K.niebla} stroke={K.grafito} strokeWidth={1.2} />
      <rect x={18} y={46} width={96} height={66} rx={7} fill={K.blanco} stroke={K.grafito} strokeWidth={1.6} />
      <path d="M18,60 V53 a7,7 0 0 1 7,-7 H107 a7,7 0 0 1 7,7 V60 Z" fill={K.pizarra} />
      <circle cx={40} cy={78} r={9} fill={K.papel2} stroke={K.grafito} strokeWidth={1.4} />
      <path d="M27,100 C27,91 53,91 53,100" fill={K.papel2} stroke={K.grafito} strokeWidth={1.4} />
      <rect x={62} y={70} width={42} height={5} fill={K.grafito} />
      <rect x={62} y={81} width={30} height={4} fill={K.niebla} />
      <rect x={62} y={90} width={38} height={4} fill={K.niebla} />
      <text x={62} y={106} fontSize={7.5} fill={K.gris} style={MONO}>
        ID ••4410
      </text>
    </g>
  );
}

function ObjBuscar() {
  return (
    <g>
      <rect x={30} y={44} width={64} height={40} fill={K.blanco} stroke={K.niebla} transform="rotate(-6 62 64)" />
      <rect x={38} y={52} width={40} height={3} fill={K.niebla} transform="rotate(-6 62 64)" />
      <path d="M18,60 H48 L54,66 H112 V112 H18 Z" fill={K.carton} stroke={K.grafito} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M18,72 H112" stroke="#c2b79d" strokeWidth={1} />
      <circle cx={84} cy={90} r={15} fill="rgba(251,250,247,0.75)" stroke={K.tinta} strokeWidth={3.5} />
      <path d="M95,101 L110,116" stroke={K.tinta} strokeWidth={5.5} strokeLinecap="round" />
    </g>
  );
}

function ObjComparar() {
  const lineas = [30, 24, 32, 20, 28, 22];
  const hoja = (x: number, giro: number) => (
    <g transform={`rotate(${giro} ${x + 23} 80)`}>
      <rect x={x} y={48} width={46} height={64} fill={K.blanco} stroke={K.grafito} strokeWidth={1.4} />
      <rect x={x + 4} y={71} width={38} height={9} fill={K.naranja} opacity={0.28} />
      {lineas.map((w, i) => (
        <rect key={i} x={x + 6} y={58 + i * 8.5} width={w} height={3} fill={i === 2 ? K.grafito : K.niebla} />
      ))}
    </g>
  );
  return (
    <g>
      {hoja(16, -4)}
      {hoja(70, 4)}
      <path d="M54,38 H78 M58,34 L54,38 L58,42 M74,34 L78,38 L74,42" fill="none" stroke={K.naranja} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function ObjDecidir() {
  return (
    <g>
      <g fill="none" stroke={K.grafito} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M66,52 V110" />
        <path d="M48,112 H84" />
        <path d="M28,63 L104,55" />
        <path d="M28,63 L20,86 M28,63 L36,86" />
        <path d="M102,55 L94,78 M102,55 L110,78" />
      </g>
      <path d="M16,86 Q28,98 40,86 Z" fill={K.blanco} stroke={K.grafito} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M90,78 Q102,90 114,78 Z" fill={K.blanco} stroke={K.grafito} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={66} cy={52} r={3.5} fill={K.grafito} />
      <text x={86} y={46} fontSize={22} fill={K.naranja} style={MANO}>
        ?
      </text>
    </g>
  );
}

function ObjResponder() {
  return (
    <g>
      <path
        d="M24,50 H102 Q110,50 110,58 V92 Q110,100 102,100 H46 L30,114 L33,100 H24 Q16,100 16,92 V58 Q16,50 24,50 Z"
        fill={K.blanco}
        stroke={K.grafito}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <rect x={26} y={62} width={58} height={4} fill={K.grafito} />
      <rect x={26} y={72} width={72} height={4} fill={K.niebla} />
      <rect x={26} y={82} width={48} height={4} fill={K.niebla} />
      <path d="M90,44 L122,30 L110,56 L103,47 Z" fill={K.naranja} />
      <path d="M103,47 L122,30" stroke={K.blanco} strokeWidth={1} />
    </g>
  );
}

function ObjRegistrar() {
  return (
    <g>
      <path d="M66,54 Q44,46 16,52 V112 Q44,106 66,114 Z" fill={K.blanco} stroke={K.grafito} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M66,54 Q88,46 116,52 V112 Q88,106 66,114 Z" fill={K.blanco} stroke={K.grafito} strokeWidth={1.5} strokeLinejoin="round" />
      {[64, 73, 82, 91, 100].map((y) => (
        <g key={y} stroke={K.niebla} strokeWidth={1}>
          <path d={`M22,${y} L60,${y + 2}`} />
          <path d={`M72,${y + 2} L110,${y}`} />
        </g>
      ))}
      <path d="M96,58 V106" stroke={K.niebla} strokeWidth={1} />
      <path d="M76,95 l4,5 l9,-11" fill="none" stroke={K.naranja} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66,54 V114" stroke={K.grafito} strokeWidth={1.5} />
    </g>
  );
}

type Rol = "ia" | "persona" | "coop";

const PASOS_15: { t: string; n: [string, string]; Obj: ComponentType; r: number; rol: Rol; nota: [string, string]; giro: number }[] = [
  { t: "RECIBIR", n: ["ingresa por", "mail o app"], Obj: ObjRecibir, r: -1.5, rol: "ia", nota: ["entra y", "se ordena"], giro: -7 },
  { t: "IDENTIFICAR", n: ["¿quién es", "el cliente?"], Obj: ObjIdentificar, r: 1, rol: "ia", nota: ["reconoce", "y clasifica"], giro: 5 },
  { t: "BUSCAR", n: ["antecedentes", "y datos"], Obj: ObjBuscar, r: -0.8, rol: "ia", nota: ["trae el", "historial"], giro: -4 },
  { t: "COMPARAR", n: ["contra criterios", "y políticas"], Obj: ObjComparar, r: 1.4, rol: "coop", nota: ["IA cruza,", "persona valida"], giro: 0 },
  { t: "DECIDIR", n: ["¿aplica?", "¿excepción?"], Obj: ObjDecidir, r: -1.2, rol: "persona", nota: ["criterio", "humano"], giro: 8 },
  { t: "RESPONDER", n: ["borrador", "y envío"], Obj: ObjResponder, r: 0.8, rol: "coop", nota: ["IA prepara,", "persona revisa"], giro: 0 },
  { t: "REGISTRAR", n: ["queda", "asentado"], Obj: ObjRegistrar, r: -1, rol: "ia", nota: ["deja", "constancia"], giro: -6 },
];

const X15 = (i: number) => 42 + i * 164;
const Y15 = 100;

/** Sello rectangular "IA · candidata" (centrado en 0,0). */
function SelloIA({ id }: { id: Id }) {
  return (
    <g filter={url(id, "tinta")}>
      <rect x={-46} y={-27} width={92} height={54} rx={5} fill="none" stroke={K.pizarra} strokeWidth={3} />
      <rect x={-41} y={-22} width={82} height={44} rx={3} fill="none" stroke={K.pizarra} strokeWidth={1} />
      <text x={0} y={8} textAnchor="middle" fontSize={31} fill={K.pizarra} style={TIT}>
        IA
      </text>
      <path d="M-26,12 H26" stroke={K.pizarra} strokeWidth={1} />
      <text x={0} y={20.5} textAnchor="middle" fontSize={8.4} fill={K.pizarra} style={{ ...MONO, letterSpacing: "0.1em" }}>
        CANDIDATA
      </text>
    </g>
  );
}

/** Sello redondo "decide una persona" (centrado en 0,0). */
function SelloPersona({ id }: { id: Id }) {
  return (
    <g filter={url(id, "tinta")}>
      <circle r={36} fill="none" stroke={K.naranja} strokeWidth={3} />
      <circle r={22} fill="none" stroke={K.naranja} strokeWidth={1.2} />
      <text fontSize={8.4} fill={K.naranja} style={{ ...MONO, letterSpacing: "0.17em" }}>
        <textPath href={`#${id("arco")}`}>· DECIDE UNA PERSONA ·</textPath>
      </text>
      <Persona x={0} y={-8} s={0.5} c={K.naranja} ancho={2} />
    </g>
  );
}

/** Sello doble: la IA prepara, una persona valida. */
function SelloCoop({ id }: { id: Id }) {
  return (
    <g>
      <g transform="translate(-16 -6) rotate(-6) scale(0.74)">
        <SelloIA id={id} />
      </g>
      <g transform="translate(30 14) rotate(8) scale(0.62)">
        <SelloPersona id={id} />
      </g>
    </g>
  );
}

function Sello({ rol, id }: { rol: Rol; id: Id }) {
  if (rol === "ia") return <SelloIA id={id} />;
  if (rol === "persona") return <SelloPersona id={id} />;
  return <SelloCoop id={id} />;
}

/** Golpe de sello: baja grande y se asienta (transición; se deshace al desmarcar). */
function Estampa({ on, delay, giro, children }: { on: boolean; delay: number; giro: number; children: ReactNode }) {
  const s: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "center",
    transform: `rotate(${giro}deg) scale(${on ? 1 : 1.7})`,
    opacity: on ? 1 : 0,
    transition: on
      ? `transform 0.34s cubic-bezier(0.3, 1.6, 0.55, 1) ${delay}s, opacity 0.12s linear ${delay}s`
      : "transform 0.25s ease, opacity 0.2s ease",
  };
  return <g style={s}>{children}</g>;
}

const COLOR_ROL: Record<Rol, string> = { ia: K.pizarra, persona: K.naranja, coop: K.naranja };

function P15DondeIA() {
  const id = useIds();
  const sombra = url(id, "sombra");
  const [marcado, setMarcado] = useState(false);
  const retraso = (i: number) => 0.15 + i * 0.2;
  const fade = (on: boolean, d: number): CSSProperties => ({
    opacity: on ? 1 : 0,
    transition: `opacity 0.35s ease ${on ? d : 0}s`,
  });

  return (
    <Lamina
      w={1200}
      h={460}
      label="El mismo flujo de siete pasos del reclamo. Al marcarlo: recibir, identificar, buscar y registrar llevan el sello IA candidata; comparar y responder llevan el sello doble IA más persona (la IA prepara, una persona valida o revisa); decidir lleva el sello de una persona."
      capa={
        <button
          type="button"
          onClick={() => setMarcado((m) => !m)}
          aria-pressed={marcado}
          {...rem("Marcar dónde entra la IA", marcado)}
          className={
            "bbva-boton absolute flex items-center justify-center gap-[0.6em] whitespace-nowrap rounded-[0.3em] border-[0.12em] font-mono uppercase tracking-[0.06em] shadow-[0_0.5em_1em_-0.6em_rgba(40,30,10,0.5)] transition-colors " +
            (marcado ? "border-tinta bg-tinta text-blanco hover:bg-grafito" : "border-tinta bg-blanco text-tinta hover:border-naranja hover:text-naranja")
          }
          style={{ left: pc(896, 1200), top: pc(404, 460), width: pc(272, 1200), height: pc(44, 460), fontSize: "1.1cqw" }}
        >
          <svg viewBox="0 0 20 20" className="h-[1.4em] w-[1.4em] shrink-0" aria-hidden>
            <path d="M7 2 H13 V8 Q13 10 15 10 H17 V13 H3 V10 H5 Q7 10 7 8 Z" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinejoin="round" />
            <path d="M3 16 H17" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
          </svg>
          {marcado ? "Quitar las marcas" : "Marcar dónde entra la IA"}
        </button>
      }
    >
      <Defs id={id} />

      {/* Una sola tarea que abarca todo el proceso (igual que en la 13) */}
      <Aparece d={0.05}>
        <path
          d="M42,88 C42,76 50,74 70,74 L570,74 C590,74 596,68 600,60 C604,68 610,74 630,74 L1130,74 C1150,74 1158,76 1158,88"
          fill="none"
          stroke={K.grafito}
          strokeWidth={1.4}
        />
        <text x={600} y={46} textAnchor="middle" fontSize={12} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.3em" }}>
          “RESPONDER UN RECLAMO”
        </text>
      </Aparece>

      {PASOS_15.map((p, i) => {
        const x = X15(i);
        const d = retraso(i);
        const numero = String(i + 1).padStart(2, "0");
        return (
          <g key={p.t}>
            <Pieza x={x} y={Y15} r={p.r} d={0.08 + i * 0.07}>
              <rect width={132} height={196} fill={K.blanco} filter={sombra} />
              {/* contorno según el rol (como en la 11: IA punteado, persona pleno) */}
              <rect
                width={132}
                height={196}
                fill="none"
                stroke={COLOR_ROL[p.rol]}
                strokeWidth={p.rol === "ia" ? 1.6 : 2.6}
                strokeDasharray={p.rol === "persona" ? undefined : "6 4"}
                style={fade(marcado, d)}
              />
              <Cinta x={42} y={-8} w={48} r={i % 2 ? 3 : -3} />
              <text x={12} y={22} fontSize={10.5} fill={K.gris} style={{ ...MONO, letterSpacing: "0.1em" }}>
                {numero}
              </text>
              <g style={{ opacity: marcado ? 0.26 : 1, transition: `opacity 0.4s ease ${marcado ? d : 0}s` }}>
                <p.Obj />
              </g>
              <line x1={20} x2={112} y1={140} y2={140} stroke={K.niebla} />
              <text x={66} y={172} textAnchor="middle" fontSize={21} fill={K.tinta} style={TIT}>
                {p.t}
              </text>
              <g transform="translate(66 82)">
                <Estampa on={marcado} delay={d} giro={p.giro}>
                  <Sello rol={p.rol} id={id} />
                </Estampa>
              </g>
            </Pieza>

            {/* Debajo: la descripción de la 13… o, marcado, el rol */}
            <g style={fade(!marcado, 0)}>
              {p.n.map((linea, j) => (
                <text key={linea} x={x + 66} y={330 + j * 22} textAnchor="middle" fontSize={18} fill={K.grafito} style={SERIF}>
                  {linea}
                </text>
              ))}
            </g>
            <g style={fade(marcado, d + 0.25)}>
              {p.nota.map((linea, j) => {
                const color = p.rol === "ia" ? K.pizarra2 : p.rol === "persona" ? K.naranja : j === 0 ? K.pizarra2 : K.naranja;
                return (
                  <text key={linea} x={x + 66} y={334 + j * 24} textAnchor="middle" fontSize={23} fill={color} style={MANO}>
                    {linea}
                  </text>
                );
              })}
            </g>

            {i > 0 && (
              <Aparece d={0.3 + i * 0.07}>
                <path d={`M${x - 30},${Y15 + 92} q14,-7 28,0`} fill="none" stroke={K.naranja} strokeWidth={2.2} strokeLinecap="round" />
                <path d={`M${x - 9},${Y15 + 86} L${x - 2},${Y15 + 92} L${x - 10},${Y15 + 97}`} fill="none" stroke={K.naranja} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Aparece>
            )}
          </g>
        );
      })}

      {/* Antes de marcar: la pregunta al grupo */}
      <g style={fade(!marcado, 0.3)}>
        <text x={42} y={436} fontSize={30} fill={K.naranja} style={MANO}>
          Antes de marcar: ¿dónde la pondrían ustedes?
        </text>
      </g>

      {/* Marcado: la leyenda de los tres sellos */}
      <g style={fade(marcado, 1.6)}>
        <g transform="translate(62 424) scale(0.42)">
          <SelloIA id={id} />
        </g>
        <text x={92} y={424} fontSize={19} fill={K.tinta} style={TIT}>
          IA CANDIDATA
        </text>
        <text x={92} y={443} fontSize={15.5} fill={K.grafito} style={SERIF}>
          hay patrón y se puede verificar
        </text>
        <g transform="translate(360 424) scale(0.42)">
          <SelloCoop id={id} />
        </g>
        <text x={394} y={424} fontSize={19} fill={K.tinta} style={TIT}>
          IA + PERSONA
        </text>
        <text x={394} y={443} fontSize={15.5} fill={K.grafito} style={SERIF}>
          una prepara, la otra valida
        </text>
        <g transform="translate(648 424) scale(0.45)">
          <SelloPersona id={id} />
        </g>
        <text x={678} y={424} fontSize={19} fill={K.tinta} style={TIT}>
          PERSONA
        </text>
        <text x={678} y={443} fontSize={15.5} fill={K.grafito} style={SERIF}>
          criterio y responsabilidad
        </text>
      </g>
    </Lamina>
  );
}

// =====================================================================================
// PLACA 16 · Una necesidad. Tres formas. — el mismo reclamo, tres arquitecturas.
// =====================================================================================

type FormaId = "chatbot" | "automatizacion" | "agente";

const FORMAS: { id: FormaId; rem: string; n: string; t: string; f: string; mano: string; auto: string; r: number }[] = [
  {
    id: "chatbot",
    rem: "Chatbot",
    n: "FORMA 1",
    t: "CHATBOT",
    f: "PERSONA → PREGUNTA → IA → RESPUESTA",
    mano: "la persona inicia",
    auto: "responde cuando le piden",
    r: -0.6,
  },
  {
    id: "automatizacion",
    rem: "Automatización",
    n: "FORMA 2",
    t: "AUTOMATIZACIÓN",
    f: "EVENTO → REGLAS → ACCIONES",
    mano: "si pasa X, hacer Y",
    auto: "ejecuta lo previsto",
    r: 0.4,
  },
  {
    id: "agente",
    rem: "Agente",
    n: "FORMA 3",
    t: "AGENTE",
    f: "OBJETIVO → ACCIONES/HERRAMIENTAS → RESULTADO",
    mano: "decide qué pasos dar",
    auto: "elige cómo llegar",
    r: -0.3,
  },
];

const X16 = (i: number) => 20 + i * 395;
const Y16 = 14;
const W16 = 370;
const H16 = 342;

/** El mismo problema en las tres columnas: un ticket idéntico. */
function TicketReclamo() {
  return (
    <g>
      <path d="M18,80 H352 V90 a5,5 0 0 0 0,10 V110 H18 V100 a5,5 0 0 0 0,-10 Z" fill={K.papel2} stroke={K.grafito} strokeWidth={0.9} />
      <rect x={28} y={88} width={20} height={14} fill={K.blanco} stroke={K.grafito} strokeWidth={1} />
      <path d="M28.5,88.5 L38,96 L47.5,88.5" fill="none" stroke={K.grafito} strokeWidth={1} strokeLinejoin="round" />
      <text x={58} y={99.5} fontSize={11.5} fill={K.tinta} style={{ ...MONO, letterSpacing: "0.12em" }}>
        INGRESA UN RECLAMO
      </text>
      <path d="M300,83 V107" stroke={K.niebla} strokeWidth={1} strokeDasharray="2 3" />
      <text x={342} y={99.5} textAnchor="end" fontSize={11} fill={K.grafito} style={MONO}>
        #48213
      </text>
    </g>
  );
}

function DibujoChatbot() {
  return (
    <g>
      <rect x={18} y={124} width={334} height={158} rx={7} fill={K.blanco} stroke={K.niebla} strokeWidth={1.2} />
      <path d="M18,131 a7,7 0 0 1 7,-7 H345 a7,7 0 0 1 7,7 V146 H18 Z" fill="#ebe8e1" />
      {[30, 40, 50].map((cx) => (
        <circle key={cx} cx={cx} cy={135} r={2.8} fill={K.niebla} />
      ))}
      <text x={185} y={139} textAnchor="middle" fontSize={9} fill={K.grafito} style={SANS}>
        Asistente — chat
      </text>
      {/* la persona pregunta */}
      <Persona x={36} y={163} s={0.42} c={K.naranja} ancho={1.8} />
      <rect x={56} y={156} width={252} height={30} rx={12} fill="#ecebe6" />
      <text x={68} y={176} fontSize={12.5} fill={K.tinta} style={SANS}>
        ¿Cómo le respondo a este reclamo?
      </text>
      {/* la IA responde */}
      <rect x={92} y={198} width={248} height={74} rx={12} fill={K.cielo} opacity={0.5} />
      <text x={110} y={222} fontSize={12} fontWeight={600} fill={K.tinta} style={SANS}>
        Te propongo un borrador:
      </text>
      <text x={110} y={242} fontSize={14} fill={K.grafito} style={SERIF}>
        “Lamentamos lo ocurrido: ya
      </text>
      <text x={110} y={260} fontSize={14} fill={K.grafito} style={SERIF}>
        revisamos su caso y…”
      </text>
      <FichaIA x={292} y={186} s={0.72} r={6} />
    </g>
  );
}

function DibujoAutomatizacion() {
  return (
    <g>
      {["EVENTO", "REGLAS", "ACCIONES"].map((t, i) => (
        <text key={t} x={[58, 179, 305][i]} y={142} textAnchor="middle" fontSize={9.5} fill={K.gris} style={{ ...MONO, letterSpacing: "0.15em" }}>
          {t}
        </text>
      ))}
      {/* evento */}
      <rect x={18} y={152} width={80} height={108} rx={8} fill={K.papel2} stroke={K.tinta} strokeWidth={1.5} />
      <rect x={36} y={176} width={40} height={28} fill={K.blanco} stroke={K.tinta} strokeWidth={1.3} />
      <path d="M36.5,177 L56,191 L75.5,177" fill="none" stroke={K.tinta} strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M78,158 L68,178 H75 L70,194 L86,172 H79 L84,158 Z" fill={K.naranja} />
      <text x={58} y={228} textAnchor="middle" fontSize={11.5} fill={K.tinta} style={SANS}>
        ingresa
      </text>
      <text x={58} y={243} textAnchor="middle" fontSize={11.5} fill={K.tinta} style={SANS}>
        un reclamo
      </text>
      {/* riel rígido */}
      <path d="M98,206 H112" stroke={K.tinta} strokeWidth={2} />
      <path d="M112,201 L119,206 L112,211 Z" fill={K.tinta} />
      {/* reglas */}
      <rect x={120} y={152} width={118} height={110} fill={K.blanco} stroke={K.tinta} strokeWidth={1.5} />
      <rect x={120} y={152} width={118} height={18} fill={K.tinta} />
      <text x={128} y={165} fontSize={8.6} fill={K.blanco} style={{ ...MONO, letterSpacing: "0.1em" }}>
        REGLA 07
      </text>
      <g transform="translate(226 161)">
        <path d={engranaje(4.2, 8, 1.6)} fill={K.blanco} />
        <circle r={1.6} fill={K.tinta} />
      </g>
      {[
        ["SI tipo = tarjeta", K.tinta, 190],
        ["→ Mesa Tarjetas", K.grafito, 205],
        ["SI monto > límite", K.tinta, 228],
        ["→ Riesgos", K.grafito, 243],
      ].map(([t, c, y]) => (
        <text key={t as string} x={128} y={y as number} fontSize={10} fill={c as string} style={MONO}>
          {t as string}
        </text>
      ))}
      <path d="M238,206 H250" stroke={K.tinta} strokeWidth={2} />
      <path d="M250,201 L257,206 L250,211 Z" fill={K.tinta} />
      {/* acciones */}
      <path d="M269,180 V246" stroke={K.niebla} strokeWidth={1.2} strokeDasharray="2 3" />
      {["clasifica", "registra", "deriva"].map((t, i) => {
        const y = 170 + i * 34;
        return (
          <g key={t}>
            <rect x={262} y={y} width={14} height={14} fill={K.blanco} stroke={K.tinta} strokeWidth={1.3} />
            <path d={`M265,${y + 7} l3.5,4 l7,-9`} fill="none" stroke={K.naranja} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            <text x={284} y={y + 11.5} fontSize={12.5} fill={K.tinta} style={SANS}>
              {t}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const CHIPS_AGENTE: { t: string; x: number; y: number; w: number; alerta?: boolean }[] = [
  { t: "analiza", x: 18, y: 171, w: 68 },
  { t: "¿qué necesita?", x: 106, y: 171, w: 100 },
  { t: "historial", x: 232, y: 150, w: 74 },
  { t: "normativa", x: 232, y: 186, w: 84 },
  { t: "compara", x: 272, y: 232, w: 72 },
  { t: "falta un dato", x: 150, y: 232, w: 100, alerta: true },
  { t: "prepara propuesta", x: 18, y: 232, w: 112 },
];

const CAMINO_AGENTE: { d: string; x: number; y: number; ang: number }[] = [
  { d: "M86,182 H102", x: 102, y: 182, ang: 0 },
  { d: "M206,178 C216,176 220,164 228,162", x: 228, y: 162, ang: -12 },
  { d: "M206,186 C216,188 220,196 228,197", x: 228, y: 197, ang: 6 },
  { d: "M306,161 C334,164 344,200 330,228", x: 330, y: 228, ang: 112 },
  { d: "M316,208 C320,214 318,222 314,228", x: 314, y: 228, ang: 120 },
  { d: "M272,243 H254", x: 254, y: 243, ang: 180 },
  { d: "M150,243 H134", x: 134, y: 243, ang: 180 },
];

function DibujoAgente() {
  return (
    <g>
      {/* objetivo */}
      <circle cx={30} cy={140} r={11} fill="none" stroke={K.tinta} strokeWidth={1.3} />
      <circle cx={30} cy={140} r={6.5} fill="none" stroke={K.tinta} strokeWidth={1.3} />
      <circle cx={30} cy={140} r={2.6} fill={K.naranja} />
      <text x={48} y={135} fontSize={9.5} fill={K.gris} style={{ ...MONO, letterSpacing: "0.15em" }}>
        OBJETIVO
      </text>
      <text x={48} y={152} fontSize={15.5} fill={K.tinta} style={SERIF}>
        resolver el reclamo #48213
      </text>
      {/* el camino que el sistema elige */}
      {CAMINO_AGENTE.map((c) => (
        <g key={c.d} fill="none" stroke={K.grafito} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
          <path d={c.d} />
          <path d={punta(c.x, c.y, c.ang, 6)} />
        </g>
      ))}
      {CHIPS_AGENTE.map((c) => (
        <g key={c.t}>
          <rect x={c.x} y={c.y} width={c.w} height={22} rx={11} fill={c.alerta ? K.blanco : K.papel} stroke={c.alerta ? K.rojo : K.grafito} strokeWidth={c.alerta ? 1.5 : 1} />
          <text x={c.x + c.w / 2} y={c.y + 15} textAnchor="middle" fontSize={11.5} fill={c.alerta ? K.rojo : K.tinta} style={SANS}>
            {c.t}
          </text>
        </g>
      ))}
      <text x={242} y={145} fontSize={8.5} fill={K.gris} style={{ ...MONO, letterSpacing: "0.08em" }}>
        fuentes autorizadas
      </text>
      <FichaIA x={300} y={34} s={0.9} r={-6} />
      {/* y al final, una persona */}
      <path d="M52,255 C50,262 48,266 44,268" fill="none" stroke={K.naranja} strokeWidth={1.6} strokeLinecap="round" strokeDasharray="3 3" />
      <Persona x={30} y={266} s={0.36} c={K.naranja} ancho={1.8} />
      <text x={52} y={282} fontSize={12.5} fontWeight={700} fill={K.naranja} style={SANS}>
        solicita revisión humana
      </text>
    </g>
  );
}

const DIBUJOS_16: Record<FormaId, ComponentType> = {
  chatbot: DibujoChatbot,
  automatizacion: DibujoAutomatizacion,
  agente: DibujoAgente,
};

function P16TresFormas() {
  const id = useIds();
  const sombra = url(id, "sombra");
  const [foco, setFoco] = useState<FormaId | null>(null);
  const visible = (f: FormaId) => foco === null || foco === f;
  const cx = (i: number) => X16(i) + W16 / 2;

  return (
    <Lamina
      w={1200}
      h={460}
      label="El mismo reclamo resuelto de tres formas. Chatbot: la persona pregunta y la IA responde. Automatización: ocurre un evento, se aplican reglas y se ejecutan acciones fijas (clasifica, registra, deriva). Agente: recibe un objetivo, elige qué pasos dar y qué fuentes consultar, detecta un faltante, prepara una propuesta y pide revisión humana. Debajo, una barra de autonomía que crece de izquierda a derecha."
      capa={FORMAS.map((f, i) => (
        <Zona
          key={f.id}
          x={X16(i)}
          y={Y16}
          w={W16}
          h={H16}
          vb={[1200, 460]}
          on={foco === f.id}
          label={f.rem}
          aria={`Mirar solo: ${f.rem}`}
          onClick={() => setFoco((v) => (v === f.id ? null : f.id))}
        />
      ))}
    >
      <Defs id={id} />

      {FORMAS.map((f, i) => {
        const Dibujo = DIBUJOS_16[f.id];
        return (
          <g key={f.id} style={{ opacity: visible(f.id) ? 1 : 0.2, transition: "opacity 0.45s ease" }}>
            <Pieza x={X16(i)} y={Y16} r={f.r} d={0.1 + i * 0.18}>
              <rect width={W16} height={H16} fill={K.blanco} filter={sombra} />
              <rect
                x={-5}
                y={-5}
                width={W16 + 10}
                height={H16 + 10}
                fill="none"
                stroke={K.naranja}
                strokeWidth={2.4}
                style={{ opacity: foco === f.id ? 1 : 0, transition: "opacity 0.35s ease" }}
              />
              <Cinta x={160} y={-8} w={52} r={i % 2 ? 3 : -3} />
              <text x={18} y={30} fontSize={10.5} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
                {f.n}
              </text>
              <text x={18} y={68} fontSize={40} fill={K.tinta} style={TIT}>
                {f.t}
              </text>
              <TicketReclamo />
              <Dibujo />
              <text x={18} y={307} fontSize={23} fill={K.naranja} style={MANO}>
                {f.mano}
              </text>
              <text x={18} y={331} fontSize={11.6} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.02em" }}>
                {f.f}
              </text>
            </Pieza>
          </g>
        );
      })}

      {/* El mismo reclamo en las tres: un hilo de lápiz rojo une los tickets */}
      <Traza d="M372,109 C382,114 400,114 415,109 M767,109 C777,114 795,114 810,109" delay={1.0} c={K.rojo} ancho={1.4} />

      {/* Autonomía: crece de izquierda a derecha */}
      <Aparece d={0.8}>
        <text x={20} y={407} fontSize={24} fill={K.tinta} style={TIT}>
          AUTONOMÍA
        </text>
        <text x={170} y={391} fontSize={10} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
          BAJA
        </text>
        <text x={1180} y={377} textAnchor="end" fontSize={10} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
          ALTA
        </text>
        <path d="M170,399 L1180,384 L1180,414 L170,401 Z" fill={K.tinta} />
      </Aparece>
      {FORMAS.map((f, i) => {
        const x = cx(i);
        const on = visible(f.id);
        return (
          <g key={f.id} style={{ opacity: on ? 1 : 0.25, transition: "opacity 0.45s ease" }}>
            <Aparece d={1.0 + i * 0.15}>
              <path d={`M${x},${Y16 + H16 + 6} V390`} stroke={K.grafito} strokeWidth={1} strokeDasharray="2 3" />
              <circle cx={x} cy={400} r={7} fill={K.blanco} stroke={foco === f.id ? K.naranja : K.tinta} strokeWidth={2.4} />
              <text x={x} y={439} textAnchor="middle" fontSize={11.5} fill={K.grafito} style={MONO}>
                {f.auto}
              </text>
            </Aparece>
          </g>
        );
      })}
    </Lamina>
  );
}

// =====================================================================================
// PLACA 17 · ¿Cuánta autonomía le das? — un fader de consola (interactiva).
// =====================================================================================

type Cadena = ("ia" | "p")[];

const NIVELES_17: { t: string; rem: string; hace: [string, string]; humano: string[]; cadena: Cadena; pin: number }[] = [
  {
    t: "ASISTE",
    rem: "Asiste",
    hace: ["Te sugiere cómo responder", "mientras escribís."],
    humano: ["HACE Y DECIDE"],
    cadena: ["p", "p", "p", "p", "p"],
    pin: 930,
  },
  {
    t: "PREPARA",
    rem: "Prepara",
    hace: ["Deja listo un borrador", "para que lo revises."],
    humano: ["REVISA"],
    cadena: ["ia", "ia", "p", "p", "p"],
    pin: 887,
  },
  {
    t: "PROPONE",
    rem: "Propone",
    hace: ["Recomienda aprobar o", "rechazar, con razones."],
    humano: ["DECIDE"],
    cadena: ["ia", "ia", "p", "ia", "ia"],
    pin: 930,
  },
  {
    t: "ACTÚA",
    rem: "Actúa",
    hace: ["Responde y cierra el caso", "dentro de ciertos límites."],
    humano: ["AUDITA EXCEPCIONES", "Y LÍMITES"],
    cadena: ["ia", "ia", "ia", "ia", "ia"],
    pin: 1140,
  },
];

const X17 = [225, 475, 725, 975];
const PASOS_17 = ["analiza", "redacta", "decide", "envía", "cierra"];
const XC17 = (k: number) => 760 + k * 85;
const SUAVE = "0.7s cubic-bezier(0.3, 1.25, 0.5, 1)";

/** Lo que hace el sistema con el mismo reclamo, en cada posición. */
function MiniAsiste() {
  return (
    <g>
      <rect x={60} y={268} width={270} height={160} rx={6} fill={K.blanco} stroke={K.niebla} strokeWidth={1.4} />
      <path d="M60,274 a6,6 0 0 1 6,-6 H324 a6,6 0 0 1 6,6 V288 H60 Z" fill="#ebe8e1" />
      <text x={72} y={282} fontSize={9.5} fill={K.grafito} style={MONO}>
        Respuesta · Reclamo #48213
      </text>
      <text x={74} y={314} fontSize={13} fill={K.tinta} style={SANS}>
        Estimado cliente:
      </text>
      <text x={74} y={336} fontSize={13} fill={K.tinta} style={SANS}>
        revisamos su caso y
      </text>
      <path d="M74,346 V362" stroke={K.tinta} strokeWidth={1.6} />
      <text x={79} y={358} fontSize={15} fill={K.gris} style={SERIF}>
        le confirmamos que el débito
      </text>
      <text x={79} y={378} fontSize={15} fill={K.gris} style={SERIF}>
        será revertido en 48 h.
      </text>
      <rect x={74} y={394} width={100} height={22} rx={4} fill="none" stroke={K.gris} strokeWidth={1} />
      <text x={124} y={409} textAnchor="middle" fontSize={9.5} fill={K.grafito} style={MONO}>
        TAB ↹ aceptar
      </text>
      <FichaIA x={276} y={392} s={0.8} r={-4} />
    </g>
  );
}

function MiniPrepara({ id }: { id: Id }) {
  const renglones = [170, 176, 150, 168, 120, 90];
  return (
    <g>
      <g transform="rotate(-2 190 350)">
        <rect x={84} y={270} width={210} height={160} fill={K.blanco} stroke={K.niebla} strokeWidth={1.2} filter={url(id, "sombra-chica")} />
        <text x={100} y={294} fontSize={12} fontWeight={700} fill={K.tinta} style={SANS}>
          Borrador de respuesta
        </text>
        <text x={100} y={309} fontSize={9} fill={K.gris} style={MONO}>
          Reclamo #48213 · v1
        </text>
        {renglones.map((w, k) => (
          <rect key={k} x={100} y={322 + k * 14} width={w} height={3.4} rx={1} fill="#cfd1d4" />
        ))}
      </g>
      <g transform="translate(186 372) rotate(-12)" filter={url(id, "tinta")}>
        <rect x={-72} y={-19} width={144} height={38} rx={3} fill="none" stroke={K.pizarra} strokeWidth={2.8} />
        <text x={0} y={9} textAnchor="middle" fontSize={25} fill={K.pizarra} style={{ ...TIT, letterSpacing: "0.12em" }}>
          BORRADOR
        </text>
      </g>
      <g transform="translate(262 276) rotate(7)">
        <rect width={60} height={34} fill={K.ambar} filter={url(id, "sombra-chica")} />
        <text x={8} y={23} fontSize={18} fill={K.tinta} style={MANO}>
          revisar
        </text>
      </g>
    </g>
  );
}

function MiniPropone() {
  return (
    <g>
      <rect x={70} y={272} width={252} height={156} rx={6} fill={K.blanco} stroke={K.tinta} strokeWidth={1.2} />
      <text x={86} y={295} fontSize={9.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.12em" }}>
        RECOMENDACIÓN
      </text>
      <FichaIA x={270} y={280} s={0.72} r={4} />
      <text x={86} y={334} fontSize={34} fill={K.pizarra2} style={TIT}>
        APROBAR
      </text>
      <text x={200} y={333} fontSize={16} fill={K.grafito} style={SERIF}>
        la devolución
      </text>
      <text x={86} y={356} fontSize={11.5} fill={K.grafito} style={SANS}>
        · cliente sin reclamos previos
      </text>
      <text x={86} y={373} fontSize={11.5} fill={K.grafito} style={SANS}>
        · monto dentro de la política
      </text>
      <rect x={86} y={388} width={100} height={28} rx={4} fill={K.tinta} />
      <text x={136} y={406} textAnchor="middle" fontSize={12} fontWeight={700} fill={K.blanco} style={SANS}>
        Aprobar
      </text>
      <rect x={196} y={388} width={100} height={28} rx={4} fill="none" stroke={K.tinta} strokeWidth={1.3} />
      <text x={246} y={406} textAnchor="middle" fontSize={12} fontWeight={700} fill={K.tinta} style={SANS}>
        Rechazar
      </text>
      <path
        d="M168,402 L168,419 L172.4,415 L175.4,421.6 L178.1,420.4 L175.2,414 L180.6,414 Z"
        fill={K.tinta}
        stroke={K.blanco}
        strokeWidth={1.3}
        strokeLinejoin="round"
      />
    </g>
  );
}

function MiniActua({ id }: { id: Id }) {
  return (
    <g>
      <rect x={70} y={272} width={252} height={70} rx={6} fill={K.blanco} stroke={K.niebla} strokeWidth={1.2} />
      <text x={84} y={290} fontSize={9.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.12em" }}>
        BANDEJA DE SALIDA
      </text>
      <text x={84} y={311} fontSize={12.5} fontWeight={700} fill={K.tinta} style={SANS}>
        RE: Reclamo cliente #48213
      </text>
      <text x={84} y={329} fontSize={11} fill={K.grafito} style={SANS}>
        enviado 15:42 · sin intervención
      </text>
      <circle cx={300} cy={306} r={10} fill={K.pizarra} />
      <path d="M295,306 l3.5,4 l7,-8" fill="none" stroke={K.blanco} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <rect x={70} y={352} width={252} height={76} rx={6} fill={K.blanco} stroke={K.niebla} strokeWidth={1.2} />
      <text x={84} y={372} fontSize={9.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.12em" }}>
        CASO #48213
      </text>
      <g transform="translate(262 376) rotate(-8)" filter={url(id, "tinta")}>
        <rect x={-46} y={-14} width={92} height={28} rx={2} fill="none" stroke={K.tinta} strokeWidth={2.4} />
        <text x={0} y={7} textAnchor="middle" fontSize={19} fill={K.tinta} style={{ ...TIT, letterSpacing: "0.1em" }}>
          CERRADO
        </text>
      </g>
      <text x={84} y={400} fontSize={9} fill={K.gris} style={MONO}>
        monto
      </text>
      <rect x={84} y={406} width={170} height={7} rx={3.5} fill={K.papel2} />
      <rect x={84} y={406} width={104} height={7} rx={3.5} fill={K.pizarra} />
      <path d="M226,399 V420" stroke={K.naranja} strokeWidth={2} />
      <text x={231} y={423} fontSize={9} fill={K.naranja} style={MONO}>
        límite
      </text>
    </g>
  );
}

function P17Autonomia() {
  const id = useIds();
  const sombra = url(id, "sombra");
  const [pos, setPos] = useState(1);
  const nivel = NIVELES_17[pos];
  const X = X17[pos];

  return (
    <Lamina
      w={1200}
      h={460}
      label={`Un control deslizante de consola con cuatro posiciones: asiste, prepara, propone y actúa. Ahora está en ${nivel.t.toLowerCase()}: el sistema ${nivel.hace.join(" ").toLowerCase()} Punto de control humano: la persona ${nivel.humano.join(" ").toLowerCase()}.`}
      capa={NIVELES_17.map((n, i) => (
        <Zona
          key={n.t}
          x={X17[i] - 125}
          y={22}
          w={250}
          h={176}
          vb={[1200, 460]}
          on={pos === i}
          label={n.rem}
          aria={`Autonomía: ${n.rem}`}
          onClick={() => setPos(i)}
        />
      ))}
    >
      <Defs id={id} />

      {/* Rótulos de las cuatro posiciones */}
      <Aparece d={0.05}>
        {NIVELES_17.map((n, i) => (
          <text
            key={n.t}
            x={X17[i]}
            y={66}
            textAnchor="middle"
            fontSize={38}
            style={{ ...TIT, fill: pos === i ? K.tinta : K.gris, transition: "fill 0.4s ease" }}
          >
            {n.t}
          </text>
        ))}
        <path
          d="M-62,0 C-30,-3 20,3 62,-1"
          fill="none"
          stroke={K.naranja}
          strokeWidth={4}
          strokeLinecap="round"
          style={{ transform: `translate(${X}px, 80px)`, transition: `transform ${SUAVE}` }}
        />
      </Aparece>

      {/* La placa del fader */}
      <Aparece d={0.15}>
        <rect x={120} y={88} width={960} height={104} rx={12} fill={K.papel2} stroke={K.carton} strokeWidth={1.5} filter={sombra} />
        {[
          [138, 104],
          [1062, 104],
          [138, 176],
          [1062, 176],
        ].map(([cx, cy]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx} cy={cy} r={5} fill={K.niebla} stroke={K.grafito} strokeWidth={0.8} />
            <path d={`M${cx - 3},${cy + 2} L${cx + 3},${cy - 2}`} stroke={K.grafito} strokeWidth={1} />
          </g>
        ))}
        <rect x={175} y={128} width={850} height={16} rx={8} fill={K.grafito} />
        <rect x={181} y={134.5} width={838} height={3} rx={1.5} fill={K.tinta} />
        {Array.from({ length: 35 }, (_, k) => {
          const x = 175 + k * 25;
          return <line key={x} x1={x} x2={x} y1={153} y2={159} stroke={K.grafito} strokeWidth={0.8} />;
        })}
        {X17.map((x, i) => (
          <g key={x}>
            <line x1={x} x2={x} y1={150} y2={164} stroke={K.tinta} strokeWidth={1.6} />
            <text x={x} y={182} textAnchor="middle" fontSize={11} fill={K.grafito} style={MONO}>
              {i + 1}
            </text>
          </g>
        ))}
      </Aparece>
      {/* lo recorrido, en naranja */}
      <rect
        x={183}
        y={134}
        width={834}
        height={4}
        rx={2}
        fill={K.naranja}
        style={{
          transformBox: "fill-box",
          transformOrigin: "left center",
          transform: `scaleX(${((X - 183) / 834).toFixed(3)})`,
          transition: `transform ${SUAVE}`,
        }}
      />
      {/* La perilla */}
      <g style={{ transform: `translate(${X}px, 136px)`, transition: `transform ${SUAVE}` }}>
        <rect x={-33} y={-36} width={70} height={82} rx={7} fill="rgba(40,30,10,0.18)" />
        <rect x={-35} y={-40} width={70} height={80} rx={7} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} />
        {[-30, -22, -14, 14, 22, 30].map((y) => (
          <line key={y} x1={-24} x2={24} y1={y} y2={y} stroke={K.niebla} strokeWidth={1.4} />
        ))}
        <rect x={-35} y={-3} width={70} height={6} fill={K.naranja} />
      </g>

      {/* Debajo de la placa: cuánto decide el sistema */}
      <Aparece d={0.3}>
        <text x={345} y={213} textAnchor="end" fontSize={10.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.12em" }}>
          EL SISTEMA DECIDE MENOS
        </text>
        <path d="M360,209 L880,203 L880,215 L360,210 Z" fill={K.grafito} />
        <text x={895} y={213} fontSize={10.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.12em" }}>
          DECIDE MÁS
        </text>
      </Aparece>

      {/* Panel izquierdo: qué hace el sistema con el mismo reclamo */}
      <Aparece d={0.4}>
        <text x={40} y={241} fontSize={11.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.16em" }}>
          EL SISTEMA, CON EL MISMO RECLAMO
        </text>
        <rect x={40} y={250} width={650} height={200} fill={K.blanco} filter={sombra} />
      </Aparece>
      <g key={`hace-${pos}`}>
        <Aparece d={0.05}>
          {pos === 0 && <MiniAsiste />}
          {pos === 1 && <MiniPrepara id={id} />}
          {pos === 2 && <MiniPropone />}
          {pos === 3 && <MiniActua id={id} />}
        </Aparece>
        <Aparece d={0.12}>
          <text x={362} y={292} fontSize={11} fill={K.naranja} style={{ ...MONO, letterSpacing: "0.16em" }}>
            {`0${pos + 1} · ${nivel.t}`}
          </text>
          {nivel.hace.map((l, j) => (
            <text key={l} x={362} y={336 + j * 38} fontSize={29} fill={K.tinta} style={SERIF}>
              {l}
            </text>
          ))}
        </Aparece>
      </g>

      {/* Panel derecho: dónde queda el punto de control humano */}
      <Aparece d={0.5}>
        <text x={720} y={241} fontSize={11.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.16em" }}>
          PUNTO DE CONTROL HUMANO
        </text>
        <rect x={720} y={250} width={440} height={200} fill={K.blanco} filter={sombra} />
        <rect x={720} y={250} width={6} height={200} fill={K.naranja} />
        <Persona x={768} y={290} s={1.25} c={K.naranja} ancho={2.6} />
        <text x={806} y={296} fontSize={24} fill={K.grafito} style={SERIF}>
          la persona
        </text>
        <circle cx={1034} cy={268} r={4.5} fill={K.pizarra} />
        <text x={1043} y={271.5} fontSize={9.5} fill={K.grafito} style={MONO}>
          sistema
        </text>
        <circle cx={1096} cy={268} r={4.5} fill={K.naranja} />
        <text x={1105} y={271.5} fontSize={9.5} fill={K.grafito} style={MONO}>
          persona
        </text>
        <line x1={XC17(0)} x2={XC17(4)} y1={412} y2={412} stroke={K.niebla} strokeWidth={1.4} />
        {PASOS_17.map((t, k) => (
          <text key={t} x={XC17(k)} y={438} textAnchor="middle" fontSize={10} fill={K.grafito} style={MONO}>
            {t}
          </text>
        ))}
      </Aparece>
      <g key={`humano-${pos}`}>
        <Aparece d={0.08}>
          {nivel.humano.map((l, j) => (
            <text key={l} x={806} y={336 + j * 36} fontSize={nivel.humano.length > 1 ? 32 : 38} fill={K.naranja} style={TIT}>
              {l}
            </text>
          ))}
        </Aparece>
      </g>
      {/* la cadena: dónde está la persona (naranja) y dónde el sistema (pizarra) */}
      {PASOS_17.map((t, k) => (
        <circle
          key={t}
          cx={XC17(k)}
          cy={412}
          r={7}
          style={{ fill: nivel.cadena[k] === "p" ? K.naranja : K.pizarra, transition: "fill 0.4s ease" }}
          stroke={K.blanco}
          strokeWidth={2}
        />
      ))}
      <path
        d={`M${XC17(0) - 8},404 V399 H${XC17(4) + 8} V404`}
        fill="none"
        stroke={K.naranja}
        strokeWidth={1.6}
        style={{ opacity: pos === 0 ? 1 : 0, transition: "opacity 0.35s ease" }}
      />
      <g style={{ transform: `translateX(${nivel.pin}px)`, transition: `transform ${SUAVE}` }}>
        <Persona x={0} y={374} s={0.42} c={K.naranja} ancho={2} />
        <path d="M0,393 V400" stroke={K.naranja} strokeWidth={1.8} strokeLinecap="round" />
      </g>
    </Lamina>
  );
}

// =====================================================================================
// PLACA 19 · Ahora desarmá tu trabajo — hoja de trabajo para completar (se proyecta
// mientras el grupo responde la actividad 5 en el celular).
// =====================================================================================

const PREGUNTAS_19 = [
  { q: "¿QUÉ LO DISPARA?", h: "llega un mail, un pedido, una fecha…" },
  { q: "¿QUÉ INFORMACIÓN ENTRA?", h: "documentos, datos, sistemas, mensajes…" },
  { q: "¿QUÉ HACÉS?", h: "leo, busco, comparo, verifico…" },
  { q: "¿DÓNDE DECIDÍS?", h: "¿rutina o criterio? ¿excepciones?" },
  { q: "¿QUÉ SALE?", h: "respuesta, informe, alerta… ¿para quién?" },
];

function P19Desarma() {
  const id = useIds();
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Hoja de trabajo para desarmar tu proceso: 1 qué lo dispara, 2 qué información entra, 3 qué hacés, 4 dónde decidís, 5 qué sale. Al costado, dos preguntas finales: dónde podría intervenir IA y dónde necesitás seguir vos."
    >
      <Defs id={id} />

      {/* La hoja */}
      <Pieza x={0} y={0} r={-0.5} d={0}>
        <rect x={14} y={10} width={772} height={540} fill={K.blanco} filter={url(id, "sombra")} />
        <text x={72} y={44} fontSize={11.5} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          HOJA DE TRABAJO · ACTIVIDAD 5
        </text>
        <text x={436} y={45} fontSize={20} fill={K.grafito} style={SERIF}>
          Proceso:
        </text>
        <line x1={508} y1={48} x2={762} y2={48} stroke={K.grafito} strokeWidth={1} />
        <text x={514} y={42} fontSize={19} fill={K.gris} style={MANO}>
          algo que hagas todas las semanas
        </text>
        <line x1={40} y1={62} x2={762} y2={62} stroke={K.tinta} strokeWidth={0.8} />
      </Pieza>
      <g transform="translate(40 -6) rotate(-6)">
        <path d="M3 30 V-1 a6 6 0 0 1 12 0 V35 a9 9 0 0 1 -18 0 V3" fill="none" stroke="#8f959d" strokeWidth={2.4} strokeLinecap="round" />
      </g>
      <Cinta x={22} y={520} w={60} h={16} r={-38} />

      {/* Las cinco preguntas, en columna */}
      {PREGUNTAS_19.map((p, i) => {
        const y0 = 80 + i * 92;
        return (
          <g key={p.q}>
            <Aparece d={0.2 + i * 0.14}>
              <circle cx={60} cy={y0 + 24} r={16} fill={K.blanco} stroke={K.tinta} strokeWidth={1.7} />
              <text x={60} y={y0 + 30.5} textAnchor="middle" fontSize={19} fill={K.tinta} style={SERIF_R}>
                {i + 1}
              </text>
              <text x={90} y={y0 + 35} fontSize={31} fill={K.tinta} style={TIT}>
                {p.q}
              </text>
              <line x1={90} y1={y0 + 68} x2={472} y2={y0 + 68} stroke={K.niebla} strokeWidth={1.3} />
              <text x={94} y={y0 + 62} fontSize={21} fill={K.gris} style={MANO}>
                {p.h}
              </text>
            </Aparece>
            {i < PREGUNTAS_19.length - 1 && (
              <Flecha d={`M60,${y0 + 43} V${y0 + 97}`} x={60} y={y0 + 97} ang={90} delay={0.35 + i * 0.14} c={K.tinta} ancho={1.8} t={8} />
            )}
          </g>
        );
      })}

      {/* Las dos preguntas finales */}
      <Pieza x={505} y={96} r={0.6} d={1.0}>
        <rect width={263} height={190} fill={K.cielo} fillOpacity={0.26} stroke={K.pizarra} strokeWidth={2.4} />
        <rect x={5} y={5} width={253} height={180} fill="none" stroke={K.pizarra} strokeWidth={0.8} strokeDasharray="4 3" />
        <FichaIA x={20} y={20} s={1.3} r={-4} />
        <text x={20} y={90} fontSize={30} fill={K.pizarra2} style={TIT}>
          ¿DÓNDE PODRÍA
        </text>
        <text x={20} y={124} fontSize={30} fill={K.pizarra2} style={TIT}>
          INTERVENIR IA?
        </text>
        <line x1={20} y1={152} x2={243} y2={152} stroke={K.pizarra} strokeWidth={0.9} strokeOpacity={0.6} />
        <line x1={20} y1={176} x2={243} y2={176} stroke={K.pizarra} strokeWidth={0.9} strokeOpacity={0.6} />
      </Pieza>
      <Pieza x={505} y={306} r={-0.6} d={1.2}>
        <rect width={263} height={190} fill={K.naranja} fillOpacity={0.08} stroke={K.naranja} strokeWidth={2.4} />
        <Persona x={38} y={30} s={0.82} c={K.naranja} ancho={2.4} />
        <text x={20} y={100} fontSize={30} fill={K.tinta} style={TIT}>
          ¿DÓNDE NECESITÁS
        </text>
        <text x={20} y={134} fontSize={30} fill={K.naranja} style={TIT}>
          SEGUIR VOS?
        </text>
        <line x1={20} y1={160} x2={243} y2={160} stroke={K.naranja} strokeWidth={0.9} strokeOpacity={0.5} />
        <line x1={20} y1={182} x2={243} y2={182} stroke={K.naranja} strokeWidth={0.9} strokeOpacity={0.5} />
      </Pieza>
      {/* Marcalo sobre tu flujo: de las operaciones a la IA, de las decisiones a vos */}
      <Flecha d="M476,322 C496,300 482,226 498,206" x={498} y={206} ang={-52} delay={1.5} c={K.pizarra} ancho={2} t={8} />
      <Flecha d="M476,406 C486,404 490,400 498,400" x={498} y={400} ang={-10} delay={1.65} c={K.naranja} ancho={2} t={8} />

      {/* El vínculo con el celular */}
      <Aparece d={1.8}>
        <g transform="translate(516 510) rotate(-6)">
          <rect x={0} y={0} width={18} height={30} rx={3.5} fill={K.tinta} />
          <rect x={2} y={3} width={14} height={23} rx={1.5} fill={K.blanco} />
          <rect x={4} y={7} width={10} height={4} fill={K.naranja} />
          <rect x={4} y={14} width={8} height={2} fill={K.niebla} />
          <rect x={4} y={18} width={10} height={2} fill={K.niebla} />
        </g>
        <text x={546} y={532} fontSize={22} fill={K.grafito} style={MANO}>
          respondé en el celular
        </text>
      </Aparece>
    </svg>
  );
}

// =====================================================================================
// PLACA 20 · Antes del prompt está el proceso — la misma mesa de la 01, ordenada.
// Los objetos (idénticos a los de ilus-a) arrancan donde estaban en la placa 01 y
// se acomodan en un flujo; después aparecen las flechas y los rótulos a mano.
// =====================================================================================

function Postit({ id, w, h, children }: { id: Id; w: number; h: number; children?: ReactNode }) {
  const x = -w / 2;
  const y = -h / 2;
  return (
    <g>
      <path d={`M${x} ${y} H${-x} V${-y - 13} L${-x - 13} ${-y} H${x} Z`} fill={url(id, "postit")} filter={url(id, "sombra-chica")} />
      <path d={`M${-x} ${-y - 13} L${-x - 13} ${-y} L${-x - 11} ${-y - 11} Z`} fill="#d9a92f" />
      <rect x={x} y={y} width={w} height={9} fill="#000" opacity={0.035} />
      {children}
    </g>
  );
}

function Cursor({ escala = 1 }: { escala?: number }) {
  return (
    <path
      d="M0 0 L0 17 L4.4 13 L7.4 19.6 L10.1 18.4 L7.2 12 L12.6 12 Z"
      transform={`scale(${escala})`}
      fill={K.tinta}
      stroke={K.blanco}
      strokeWidth={1.3}
      strokeLinejoin="round"
    />
  );
}

function Clip() {
  return <path d="M3 30 V-1 a6 6 0 0 1 12 0 V35 a9 9 0 0 1 -18 0 V3" fill="none" stroke="#8f959d" strokeWidth={2.4} strokeLinecap="round" />;
}

const MAILS = [
  { de: "Atención al Cliente", hora: "09:12", asunto: "RE: Reclamo cliente #48213", nuevo: true, hilo: 3 },
  { de: "Mesa de Ayuda IT", hora: "08:47", asunto: "Informe semanal de incidentes", nuevo: true, adjunto: true },
  { de: "Operaciones · Altas", hora: "08:15", asunto: "Solicitud de alta — falta documentación", nuevo: false },
  { de: "Riesgos · Comité", hora: "Ayer", asunto: "Minuta reunión riesgos", nuevo: false },
  { de: "Canales Digitales", hora: "Ayer", asunto: "RV: Consulta derivada desde sucursal", nuevo: false },
];

function Notebook({ id }: { id: Id }) {
  const filas = 5;
  const cols = 13;
  return (
    <g>
      <rect x={-192} y={48} width={384} height={176} rx={13} fill="#d7dade" stroke="#bfc3c9" strokeWidth={1} filter={url(id, "sombra")} />
      <rect x={-170} y={62} width={340} height={98} rx={6} fill="#c4c8ce" />
      {Array.from({ length: filas }, (_, f) =>
        Array.from({ length: cols }, (_, c) => {
          if (f === 4 && c > 4 && c < 9) return null;
          const ancho = f === 4 && c === 4 ? 23.6 * 5 + 3 * 4 : 23.6;
          return <rect key={`${f}-${c}`} x={-167 + c * 26.2} y={65 + f * 19} width={ancho} height={16} rx={2.6} fill="#2d2f34" />;
        }),
      )}
      <rect x={-64} y={168} width={128} height={48} rx={7} fill="#cfd3d8" stroke="#b8bcc2" strokeWidth={1} />
      <rect x={-186} y={40} width={372} height={10} rx={3} fill="#3a3d43" />
      <rect x={-186} y={-176} width={372} height={222} rx={12} fill="#24262b" filter={url(id, "sombra")} />
      <circle cx={0} cy={-171.5} r={1.6} fill="#55585f" />
      <g transform="translate(-176 -167)">
        <rect width={352} height={205} fill={K.blanco} />
        <rect width={352} height={16} fill="#ebe8e1" />
        {[8, 16, 24].map((cx) => (
          <circle key={cx} cx={cx} cy={8} r={2.6} fill={K.niebla} />
        ))}
        <text x={176} y={11} textAnchor="middle" style={SANS} fontSize={7.5} fill={K.grafito}>
          Correo — Recibidos
        </text>
        <rect y={16} width={76} height={189} fill="#f3f1ec" />
        <rect x={8} y={24} width={60} height={15} rx={7.5} fill={K.pizarra2} />
        <text x={38} y={34.2} textAnchor="middle" style={SANS} fontSize={7.5} fontWeight={600} fill={K.blanco}>
          Redactar
        </text>
        <rect x={4} y={47} width={68} height={13} rx={3} fill={K.cielo} opacity={0.55} />
        {[
          ["Recibidos", "12"],
          ["Destacados", ""],
          ["Enviados", ""],
          ["Borradores", "3"],
          ["Archivo", ""],
        ].map(([t, n], i) => (
          <g key={t}>
            <text x={10} y={56.5 + i * 15} style={SANS} fontSize={7.3} fontWeight={i === 0 ? 700 : 400} fill={K.tinta}>
              {t}
            </text>
            {n && (
              <text x={68} y={56.5 + i * 15} textAnchor="end" style={MONO} fontSize={6.5} fill={K.grafito}>
                {n}
              </text>
            )}
          </g>
        ))}
        <text x={86} y={30} style={SANS} fontSize={9.5} fontWeight={700} fill={K.tinta}>
          Recibidos
        </text>
        <rect x={236} y={21} width={108} height={12} rx={6} fill="#efece6" />
        <text x={246} y={29.6} style={SANS} fontSize={6.4} fill={K.gris}>
          Buscar en el correo
        </text>
        {MAILS.map((m, i) => {
          const y = 38 + i * 33;
          return (
            <g key={m.asunto} opacity={i === 4 ? 0.55 : 1}>
              {i === 0 && <rect x={76} y={y} width={276} height={33} fill="#fcefe8" />}
              <line x1={80} x2={348} y1={y + 33} y2={y + 33} stroke={K.niebla} strokeWidth={0.7} />
              {m.nuevo && <circle cx={84} cy={y + 9.5} r={2.6} fill={K.naranja} />}
              <text x={91} y={y + 12} style={SANS} fontSize={7.4} fontWeight={m.nuevo ? 700 : 400} fill={K.grafito}>
                {m.de}
              </text>
              <text x={346} y={y + 12} textAnchor="end" style={MONO} fontSize={6.6} fill={K.gris}>
                {m.hora}
              </text>
              <text x={91} y={y + 25.5} style={SANS} fontSize={10} fontWeight={m.nuevo ? 650 : 400} fill={K.tinta}>
                {m.asunto}
                {m.hilo ? (
                  <tspan fill={K.gris} fontWeight={400} fontSize={8.5}>
                    {"  "}({m.hilo})
                  </tspan>
                ) : null}
              </text>
              {m.adjunto && (
                <path d={`M333 ${y + 25} v-7 a2.6 2.6 0 0 1 5.2 0 v8 a3.8 3.8 0 0 1 -7.6 0 v-6`} fill="none" stroke={K.gris} strokeWidth={1} strokeLinecap="round" />
              )}
            </g>
          );
        })}
        <g transform="translate(262 52)">
          <Cursor escala={0.95} />
        </g>
      </g>
    </g>
  );
}

function Documento({ id }: { id: Id }) {
  const renglones = [168, 150, 162, 120, 0, 166, 158, 140, 164, 90, 0, 160, 152, 132];
  return (
    <g>
      <rect x={-102} y={-143} width={204} height={286} fill={K.blanco} filter={url(id, "sombra")} />
      <text x={-84} y={-121} style={MONO} fontSize={6.4} fill={K.gris} letterSpacing={0.6}>
        USO INTERNO · VERSIÓN 3
      </text>
      <text x={-84} y={-100} style={SERIF_R} fontSize={17} fill={K.tinta}>
        Procedimiento de alta
      </text>
      <text x={-84} y={-83} style={SERIF_R} fontSize={17} fill={K.tinta}>
        de clientes
      </text>
      <line x1={-84} x2={84} y1={-73} y2={-73} stroke={K.tinta} strokeWidth={0.8} />
      {renglones.map((w, i) => (w ? <rect key={i} x={-84} y={-62 + i * 9} width={w} height={3.2} rx={1} fill="#cfd1d4" /> : null))}
      <rect x={-86} y={-19} width={170} height={8} fill={K.naranja} opacity={0.28} transform="rotate(-0.6)" />
      <rect x={-86} y={-10} width={146} height={8} fill={K.naranja} opacity={0.28} transform="rotate(0.4)" />
      <text x={-84} y={70} style={MONO} fontSize={6.6} fontWeight={700} fill={K.tinta}>
        3. DOCUMENTACIÓN REQUERIDA
      </text>
      {["DNI del titular", "Constancia de CUIT", "Comprobante de domicilio"].map((t, i) => (
        <g key={t} transform={`translate(-84 ${80 + i * 13})`}>
          <rect width={7} height={7} fill="none" stroke={K.grafito} strokeWidth={0.8} />
          {i > 0 && <path d="M1.2 3.6 L3 5.8 L7.8 -0.6" fill="none" stroke={K.rojo} strokeWidth={1.4} strokeLinecap="round" />}
          <text x={12} y={6.4} style={SANS} fontSize={7.2} fill={K.grafito}>
            {t}
          </text>
        </g>
      ))}
      <path d="M-90 78 C-94 84, -94 92, -90 96" fill="none" stroke={K.rojo} strokeWidth={1.6} strokeLinecap="round" />
      <text x={30} y={92} style={MANO} fontSize={15} fill={K.rojo} transform="rotate(-8 30 92)">
        ¿y el DNI?
      </text>
      <g opacity={0.3}>
        <circle cx={46} cy={-40} r={27} fill="none" stroke="#7a4a24" strokeWidth={3.2} strokeDasharray="70 6 40 4 50 3" />
        <circle cx={47.5} cy={-39} r={24.5} fill="none" stroke="#7a4a24" strokeWidth={1} strokeDasharray="30 10 60 8" />
      </g>
      <g transform="translate(62 -152) rotate(-4)">
        <Clip />
      </g>
    </g>
  );
}

const PLANILLA = [
  ["Lote", "Estado", "Fecha", "Cuenta", "Importe"],
  ["12", "OK", "22/09", "004-118", "12.450,00"],
  ["13", "OK", "22/09", "004-203", "8.120,50"],
  ["14", "PEND.", "23/09", "004-377", "31.900,00"],
  ["15", "OK", "23/09", "004-412", "5.600,00"],
  ["16", "OK", "24/09", "004-509", "17.230,00"],
  ["17", "REV.", "24/09", "004-611", "2.980,75"],
];
const PLANILLA_COLS = [30, 44, 42, 50, 62];

function Planilla({ id }: { id: Id }) {
  const x0 = -122;
  const y0 = -54;
  const alto = 15;
  const xs: number[] = [];
  let total = 0;
  for (const w of PLANILLA_COLS) {
    xs.push(x0 + total);
    total += w;
  }
  return (
    <g>
      <rect x={-136} y={-81} width={272} height={162} fill={K.blanco} filter={url(id, "sombra")} />
      <text x={x0} y={-64} style={MONO} fontSize={7} fontWeight={700} fill={K.tinta}>
        CONCILIACIÓN · SEMANA 39
      </text>
      <text x={x0 + total} y={-64} textAnchor="end" style={MONO} fontSize={6.4} fill={K.gris}>
        hoja 1/3
      </text>
      <rect x={x0} y={y0} width={total} height={alto} fill={K.papel2} />
      {PLANILLA.map((fila, f) =>
        fila.map((celda, c) => {
          const numero = c === 4 && f > 0;
          const x = numero ? xs[c] + PLANILLA_COLS[c] - 4 : xs[c] + 4;
          return (
            <text
              key={`${f}-${c}`}
              x={x}
              y={y0 + f * alto + 10.4}
              textAnchor={numero ? "end" : "start"}
              style={MONO}
              fontSize={6.8}
              fontWeight={f === 0 ? 700 : 400}
              fill={f === 3 && c === 1 ? K.rojo : K.tinta}
            >
              {celda}
            </text>
          );
        }),
      )}
      {PLANILLA.map((_, f) => (
        <line key={f} x1={x0} x2={x0 + total} y1={y0 + (f + 1) * alto} y2={y0 + (f + 1) * alto} stroke={K.niebla} strokeWidth={0.7} />
      ))}
      {[...xs, x0 + total].map((x, i) => (
        <line key={i} x1={x} x2={x} y1={y0} y2={y0 + PLANILLA.length * alto} stroke={K.niebla} strokeWidth={0.7} />
      ))}
      <line x1={x0} x2={x0 + total} y1={y0} y2={y0} stroke={K.niebla} strokeWidth={0.7} />
      <path
        d={`M${xs[1] + 26} ${y0 + 3 * alto + 1} C${xs[1] + 46} ${y0 + 3 * alto + 2}, ${xs[1] + 46} ${y0 + 4 * alto + 1}, ${xs[1] + 20} ${y0 + 4 * alto + 2} C${xs[1] - 4} ${y0 + 4 * alto + 2}, ${xs[1] - 6} ${y0 + 3 * alto}, ${xs[1] + 18} ${y0 + 3 * alto - 1}`}
        fill="none"
        stroke={K.rojo}
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </g>
  );
}

const AGENDA = [
  { h: 9, dur: 0.75, t: "Daily · Operaciones", c: K.cielo },
  { h: 10.5, dur: 1, t: "Comité de riesgos", c: K.carton },
  { h: 12, dur: 0.5, t: "Revisión reclamos", c: K.cielo },
  { h: 14, dur: 1, t: "Cliente · seguimiento alta", c: K.cielo },
  { h: 15.5, dur: 0.5, t: "Informe incidentes", c: K.carton },
  { h: 16.5, dur: 0.6, t: "1:1", c: K.niebla },
];

function Agenda({ id }: { id: Id }) {
  const y9 = -46;
  const paso = 19;
  return (
    <g>
      <rect x={-88} y={-124} width={176} height={248} fill={K.blanco} filter={url(id, "sombra")} />
      <text x={-74} y={-103} style={MONO} fontSize={7.2} letterSpacing={1} fill={K.pizarra2}>
        JUEVES
      </text>
      <text x={-75} y={-66} style={TIT} fontSize={40} fill={K.tinta}>
        24
      </text>
      <text x={-34} y={-78} style={MONO} fontSize={6.6} fill={K.gris}>
        SEPTIEMBRE
      </text>
      <text x={-34} y={-68} style={MONO} fontSize={6.6} fill={K.gris}>
        2026
      </text>
      <path d="M-78 -78 C-84 -98, -52 -102, -45 -86 C-38 -68, -70 -56, -80 -70" fill="none" stroke={K.naranja} strokeWidth={1.8} strokeLinecap="round" />
      <text x={32} y={-86} style={MANO} fontSize={17} fill={K.naranja} transform="rotate(-6 32 -86)">
        ayer
      </text>
      {Array.from({ length: 9 }, (_, i) => (
        <g key={i}>
          <text x={-80} y={y9 + i * paso + 2.4} style={MONO} fontSize={6.2} fill={K.gris}>
            {String(9 + i).padStart(2, "0")}
          </text>
          <line x1={-62} x2={80} y1={y9 + i * paso} y2={y9 + i * paso} stroke={K.niebla} strokeWidth={0.6} />
        </g>
      ))}
      {AGENDA.map((e) => {
        const y = y9 + (e.h - 9) * paso + 1;
        const alto = Math.max(e.dur * paso - 2, 10);
        return (
          <g key={e.t}>
            <rect x={-58} y={y} width={136} height={alto} rx={2} fill={e.c} opacity={0.75} />
            <rect x={-58} y={y} width={2.6} height={alto} fill={K.pizarra2} />
            <text x={-51} y={y + 8} style={SANS} fontSize={7} fontWeight={600} fill={K.tinta}>
              {e.t}
            </text>
          </g>
        );
      })}
    </g>
  );
}

const CHAT: { yo: boolean; lineas: string[] }[] = [
  { yo: false, lineas: ["¿Pudiste ver lo", "del lote 14?"] },
  { yo: true, lineas: ["Ahora lo miro"] },
  { yo: false, lineas: ["Te reenvié el mail", "del cliente"] },
  { yo: false, lineas: ["Mañana 9 h comité,", "¿llegás?"] },
  { yo: true, lineas: ["Sí, llego"] },
];

const BURBUJAS = CHAT.reduce<{ yo: boolean; lineas: string[]; y: number; ancho: number; alto: number }[]>((acc, m) => {
  const previa = acc[acc.length - 1];
  const y = previa ? previa.y + previa.alto + 6 : -62;
  const alto = 7 + m.lineas.length * 9.2;
  const ancho = Math.max(...m.lineas.map((l) => l.length)) * 3.55 + 12;
  return [...acc, { ...m, y, ancho, alto }];
}, []);

function Celular({ id }: { id: Id }) {
  return (
    <g>
      <rect x={-58} y={-118} width={116} height={236} rx={17} fill="#1d1f23" filter={url(id, "sombra")} />
      <rect x={-52} y={-111} width={104} height={222} rx={12} fill={K.blanco} />
      <rect x={-14} y={-106} width={28} height={7} rx={3.5} fill="#1d1f23" />
      <text x={-42} y={-100} style={MONO} fontSize={6} fill={K.tinta}>
        17:48
      </text>
      <circle cx={-34} cy={-80} r={8} fill={K.pizarra} />
      <text x={-34} y={-77.6} textAnchor="middle" style={SANS} fontSize={6.4} fontWeight={700} fill={K.blanco}>
        EO
      </text>
      <text x={-22} y={-81} style={SANS} fontSize={8} fontWeight={700} fill={K.tinta}>
        Equipo Ops
      </text>
      <text x={-22} y={-73} style={SANS} fontSize={5.8} fill={K.gris}>
        4 participantes
      </text>
      <line x1={-52} x2={52} y1={-67} y2={-67} stroke={K.niebla} strokeWidth={0.7} />
      {BURBUJAS.map((m, i) => {
        const x = m.yo ? 46 - m.ancho : -46;
        return (
          <g key={i}>
            <rect x={x} y={m.y} width={m.ancho} height={m.alto} rx={7} fill={m.yo ? K.cielo : "#ecebe6"} />
            {m.lineas.map((l, j) => (
              <text key={j} x={x + 6} y={m.y + 11 + j * 9.2} style={SANS} fontSize={7.4} fill={K.tinta}>
                {l}
              </text>
            ))}
          </g>
        );
      })}
      <rect x={-46} y={90} width={92} height={13} rx={6.5} fill="#f0eee9" stroke={K.niebla} strokeWidth={0.6} />
      <text x={-40} y={98.8} style={SANS} fontSize={6} fill={K.gris}>
        Mensaje
      </text>
    </g>
  );
}

function Taza({ id }: { id: Id }) {
  return (
    <g>
      <path d="M29 12 C50 12, 56 32, 38 36" fill="none" stroke="#e3ded3" strokeWidth={9} strokeLinecap="round" />
      <path d="M29 12 C50 12, 56 32, 38 36" fill="none" stroke={K.blanco} strokeWidth={5.6} strokeLinecap="round" />
      <circle r={37} fill={K.blanco} stroke="#e3ded3" strokeWidth={1.6} filter={url(id, "sombra")} />
      <circle r={30} fill="#5e3a22" />
      <circle r={30} fill="none" stroke="#8a5a36" strokeWidth={3} />
      <ellipse cx={-9} cy={-10} rx={10} ry={5} fill="#fff" opacity={0.16} transform="rotate(-30 -9 -10)" />
    </g>
  );
}

function Lapicera() {
  return (
    <g>
      <rect x={-96} y={-5.5} width={17} height={11} rx={4} fill={K.grafito} />
      <rect x={-80} y={-5.5} width={150} height={11} rx={3} fill={K.tinta} />
      <rect x={-74} y={-8} width={58} height={3.4} rx={1.5} fill="#9aa0a8" />
      <rect x={58} y={-5.5} width={5} height={11} fill="#b8bcc2" />
      <path d="M70 -5.5 L90 -1.4 L96 0 L90 1.4 L70 5.5 Z" fill="#b8bcc2" />
      <path d="M90 -1.4 L96 0 L90 1.4 Z" fill={K.tinta} />
    </g>
  );
}

function PostitLlamar({ id }: { id: Id }) {
  return (
    <Postit id={id} w={104} h={92}>
      <text x={-40} y={-12} style={MANO} fontSize={19} fill={K.tinta}>
        llamar a
      </text>
      <text x={-40} y={10} style={MANO} fontSize={19} fill={K.tinta}>
        Operaciones
      </text>
      <text x={-40} y={30} style={MANO} fontSize={13} fill={K.grafito}>
        (antes de las 12)
      </text>
    </Postit>
  );
}

function PostitRevisar({ id }: { id: Id }) {
  return (
    <Postit id={id} w={96} h={88}>
      <text x={-36} y={-10} style={MANO} fontSize={20} fill={K.tinta}>
        revisar
      </text>
      <text x={-36} y={14} style={MANO} fontSize={20} fill={K.tinta}>
        lote 14 !!
      </text>
      <path d="M-36 21 C-14 24, 10 19, 30 22" fill="none" stroke={K.rojo} strokeWidth={1.6} strokeLinecap="round" />
    </Postit>
  );
}

/** Cada objeto: dónde estaba en la placa 01 (x, y, giro) y dónde queda en el flujo (x, y, escala). */
const MESA_20: { k: string; Obj: ComponentType<{ id: Id }>; de: [number, number, number]; a: [number, number, number]; d: number }[] = [
  { k: "documento", Obj: Documento, de: [668, 162, 6], a: [397, 150, 0.5], d: 0.1 },
  { k: "agenda", Obj: Agenda, de: [112, 170, -6], a: [740, 150, 0.5], d: 0.2 },
  { k: "planilla", Obj: Planilla, de: [176, 470, -4], a: [572, 150, 0.56], d: 0.05 },
  { k: "notebook", Obj: Notebook, de: [384, 298, -3], a: [192, 140, 0.52], d: 0 },
  { k: "celular", Obj: Celular, de: [662, 428, 12], a: [46, 150, 0.52], d: 0.15 },
  { k: "taza", Obj: Taza, de: [748, 300, 0], a: [74, 474, 0.9], d: 0.3 },
  { k: "lapicera", Obj: () => <Lapicera />, de: [330, 62, 15], a: [560, 476, 0.62], d: 0.25 },
  { k: "llamar", Obj: PostitLlamar, de: [214, 140, -9], a: [728, 470, 0.95], d: 0.2 },
  { k: "revisar", Obj: PostitRevisar, de: [60, 372, 7], a: [572, 392, 1.05], d: 0.1 },
];

// La mesa se ordena: de la pose de la placa 01 a su lugar en el flujo (queda quieta al final).
const CSS_ORDENA =
  "@keyframes ilusc-ordena{0%,30%{transform:translate(var(--x0),var(--y0)) rotate(var(--r0)) scale(1)}" +
  "100%{transform:translate(var(--x1),var(--y1)) rotate(0deg) scale(var(--s1))}}" +
  ".ilusc-ordena{animation:ilusc-ordena 2.6s cubic-bezier(0.55,0,0.25,1) both}" +
  "@media (prefers-reduced-motion: reduce){.ilusc-ordena{animation:none}}";

/** Después de que la mesa se ordena (≈ 2.6 s), aparece la lectura del proceso. */
const T20 = 2.6;

function Rotulo({ x, y, d, c = K.naranja, a = "middle", s = 24, children }: { x: number; y: number; d: number; c?: string; a?: "start" | "middle" | "end"; s?: number; children: ReactNode }) {
  return (
    <Aparece d={d}>
      <text x={x} y={y} textAnchor={a} fontSize={s} fill={c} style={MANO}>
        {children}
      </text>
    </Aparece>
  );
}

function Etapa({ x, y, d, a = "start", children }: { x: number; y: number; d: number; a?: "start" | "end"; children: ReactNode }) {
  return (
    <Aparece d={d}>
      <text x={x} y={y} textAnchor={a} fontSize={10.5} fill={K.tinta} style={{ ...MONO, fontWeight: 700, letterSpacing: "0.18em" }}>
        {children}
      </text>
    </Aparece>
  );
}

function P20EscritorioOrdenado() {
  const id = useIds();
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="La misma mesa de trabajo de la primera placa, ahora ordenada en un flujo: entradas (la notebook con el correo y el celular), operaciones (el procedimiento y la planilla), una regla (la agenda), la decisión (el post-it revisar lote 14, con una persona), una excepción (llamar a Operaciones) y la salida, con un control antes de salir. La IA aparece como una ficha discreta en dos pasos: clasificar y comparar."
    >
      <style>{CSS_ORDENA}</style>
      <Defs id={id} />

      {/* Los objetos de la placa 01, que se acomodan */}
      {MESA_20.map(({ k, Obj, de, a, d }) => {
        const s: Estilo = {
          "--x0": `${de[0]}px`,
          "--y0": `${de[1]}px`,
          "--r0": `${de[2]}deg`,
          "--x1": `${a[0]}px`,
          "--y1": `${a[1]}px`,
          "--s1": a[2],
          transform: `translate(${a[0]}px, ${a[1]}px) scale(${a[2]})`,
          transformBox: "view-box",
          transformOrigin: "0 0",
          animationDelay: `${d}s`,
        };
        return (
          <g key={k} className="ilusc-ordena" style={s}>
            <Obj id={id} />
          </g>
        );
      })}

      {/* 01 · Entradas: correo y celular */}
      <Etapa x={16} y={32} d={T20}>
        01 · ENTRADAS
      </Etapa>
      <Traza d="M16,266 C16,272 20,274 28,274 H280 C288,274 292,272 292,266" delay={T20} c={K.grafito} ancho={1.4} />
      <Rotulo x={154} y={300} d={T20 + 0.4}>
        entrada
      </Rotulo>
      <Flecha d="M298,150 C312,146 326,146 340,150" x={340} y={150} ang={8} delay={T20 + 0.2} />

      {/* 02 · Operaciones: procedimiento y planilla */}
      <Etapa x={404} y={62} d={T20 + 0.1}>
        02 · OPERACIONES
      </Etapa>
      <Flecha d="M452,150 C466,146 478,146 490,150" x={490} y={150} ang={8} delay={T20 + 0.45} />
      <Rotulo x={471} y={242} d={T20 + 0.8}>
        operación
      </Rotulo>

      {/* La agenda marca una regla (plazos) sobre la decisión */}
      <Aparece d={T20 + 0.9}>
        <path d="M740,214 V352 Q740,392 700,392 H632" fill="none" stroke={K.grafito} strokeWidth={1.4} strokeDasharray="5 5" strokeLinecap="round" />
        <path d={punta(630, 392, 180, 8)} fill="none" stroke={K.grafito} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      </Aparece>
      <Rotulo x={752} y={300} a="start" d={T20 + 1.1}>
        regla
      </Rotulo>

      {/* 03 · Decisión: la persona */}
      <Flecha d="M560,200 C566,250 552,300 556,336" x={556} y={336} ang={84} delay={T20 + 0.7} />
      <Etapa x={540} y={336} a="end" d={T20 + 0.9}>
        03 · DECISIÓN
      </Etapa>
      <Aparece d={T20 + 1.2}>
        <Persona x={606} y={360} s={0.42} c={K.naranja} ancho={2} />
      </Aparece>
      <Rotulo x={560} y={506} d={T20 + 1.3}>
        decisión
      </Rotulo>

      {/* La excepción se va por otro lado */}
      <Flecha d="M620,432 C640,440 656,448 674,458" x={674} y={458} ang={29} delay={T20 + 1.4} c={K.rojo} ancho={2.2} t={9} />
      <Rotulo x={728} y={540} c={K.rojo} d={T20 + 1.7}>
        excepción
      </Rotulo>

      {/* 04 · Salida, con un control antes */}
      <Flecha d="M516,394 C470,398 380,390 240,394" x={240} y={394} ang={180} delay={T20 + 1.5} />
      <Aparece d={T20 + 2.1}>
        <circle cx={440} cy={395} r={11} fill={K.blanco} stroke={K.naranja} strokeWidth={2} />
        <path d="M434.5,395 l4,4.5 l7.5,-9" fill="none" stroke={K.naranja} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      </Aparece>
      <Rotulo x={440} y={374} d={T20 + 2.2}>
        control
      </Rotulo>
      <Rotulo x={300} y={424} d={T20 + 2.3}>
        salida
      </Rotulo>
      <Etapa x={226} y={389} a="end" d={T20 + 2.2}>
        04 · SALIDA
      </Etapa>
      <Aparece d={T20 + 2.3}>
        <text x={226} y={405} textAnchor="end" fontSize={9} fill={K.gris} style={MONO}>
          al cliente · a otro equipo
        </text>
      </Aparece>

      {/* La IA, apenas una ficha en dos nodos */}
      <Aparece d={T20 + 2.6}>
        <path d="M303,52 C298,54 296,52 292,56" fill="none" stroke={K.grafito} strokeWidth={0.9} />
        <FichaIA x={300} y={36} s={0.8} r={-8} />
        <text x={340} y={48} fontSize={9} fill={K.grafito} style={MONO}>
          clasifica
        </text>
      </Aparece>
      <Aparece d={T20 + 2.8}>
        <path d="M620,100 C624,104 628,104 632,106" fill="none" stroke={K.grafito} strokeWidth={0.9} />
        <FichaIA x={612} y={80} s={0.8} r={6} />
        <text x={606} y={96} textAnchor="end" fontSize={9} fill={K.grafito} style={MONO}>
          compara
        </text>
      </Aparece>

      <Aparece d={T20 + 3}>
        <text x={16} y={548} fontSize={10} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
          MISMA MESA · OTRA MIRADA
        </text>
      </Aparece>
    </svg>
  );
}

// --- Registro ------------------------------------------------------------------------

export const ILUS_C: Partial<Record<IlusId, ComponentType>> = {
  "p14-anatomia": P14Anatomia,
  "p15-donde-ia": P15DondeIA,
  "p16-tres-formas": P16TresFormas,
  "p17-autonomia": P17Autonomia,
  "p19-desarma": P19Desarma,
  "p20-escritorio-ordenado": P20EscritorioOrdenado,
};
