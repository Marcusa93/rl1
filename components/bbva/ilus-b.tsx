"use client";

// Ilustraciones de las placas 08–13 del Laboratorio BBVA.
// Collage editorial sobre papel ("arqueología contemporánea del trabajo"):
// el protagonista es el trabajo (borradores, formularios, tickets, fichas) y
// la IA aparece apenas como una etiqueta más del sistema.
//
// Cada componente llena su contenedor (el deck le da el tamaño) y escala con la
// placa gracias al viewBox. La 13 es interactiva: se controla con rem() desde el
// celular del docente o con el mouse.

import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { IlusId } from "@/lib/bbva-clase";
import { rem } from "@/lib/remoto";

// --- Paleta y tipografías ---------------------------------------------------------

const C = {
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

const FUENTE = {
  tit: { fontFamily: "var(--font-archivo), 'Arial Narrow', system-ui, sans-serif", fontStretch: "68%", fontWeight: 800 },
  mono: { fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontWeight: 400 },
  serif: { fontFamily: "var(--font-instrument), Georgia, serif", fontStyle: "italic", fontWeight: 400 },
  mano: { fontFamily: "var(--font-caveat), cursive", fontWeight: 600 },
  sans: { fontFamily: "var(--font-geist-sans), system-ui, sans-serif", fontWeight: 400 },
} satisfies Record<string, CSSProperties>;

type Fuente = keyof typeof FUENTE;

// --- Piezas comunes ------------------------------------------------------------------

/** Ids únicos por instancia (filtros, patrones, recortes). */
function useIds(base: string) {
  const crudo = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (n: string) => `${base}${crudo}-${n}`;
}

function Tx({
  x,
  y,
  s,
  f = "mono",
  c = C.tinta,
  a,
  ls,
  w,
  o,
  children,
}: {
  x: number;
  y: number;
  s: number;
  f?: Fuente;
  c?: string;
  a?: "start" | "middle" | "end";
  ls?: number;
  w?: number;
  o?: number;
  children: ReactNode;
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={s}
      fill={c}
      textAnchor={a}
      opacity={o}
      style={{ ...FUENTE[f], ...(w ? { fontWeight: w } : null), ...(ls ? { letterSpacing: `${ls}em` } : null) }}
    >
      {children}
    </text>
  );
}

/** Entrada del collage: la pieza cae y se apoya (sin mover su posición final). */
function Aparece({ d = 0, children }: { d?: number; children: ReactNode }) {
  return (
    <g className="bbva-cae" style={{ animationDelay: `${d}s`, transformBox: "fill-box", transformOrigin: "center" }}>
      {children}
    </g>
  );
}

/** Pieza ubicada (x, y, giro en grados alrededor de su esquina) que cae al entrar. */
function Cae({ x = 0, y = 0, r = 0, d = 0, children }: { x?: number; y?: number; r?: number; d?: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y})${r ? ` rotate(${r})` : ""}`}>
      <Aparece d={d}>{children}</Aparece>
    </g>
  );
}

/** Trazo a mano que se dibuja al entrar. */
function Traza({
  d,
  largo,
  delay = 0,
  c = C.grafito,
  ancho = 2,
  fill = "none",
}: {
  d: string;
  largo: number;
  delay?: number;
  c?: string;
  ancho?: number;
  fill?: string;
}) {
  return (
    <path
      d={d}
      fill={fill}
      stroke={c}
      strokeWidth={ancho}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="bbva-traza"
      style={{ "--largo": largo, animationDelay: `${delay}s` } as CSSProperties}
    />
  );
}

/** Flecha manuscrita: el cuerpo se dibuja y después aparece la punta. */
function Flecha({ d, punta, largo, delay = 0, c = C.naranja, ancho = 2.4 }: { d: string; punta: string; largo: number; delay?: number; c?: string; ancho?: number }) {
  return (
    <g>
      <Traza d={d} largo={largo} delay={delay} c={c} ancho={ancho} />
      <Traza d={punta} largo={60} delay={delay + 0.9} c={c} ancho={ancho} />
    </g>
  );
}

/** Sombra de recorte apoyado sobre la mesa. */
function Sombra({ id }: { id: string }) {
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="140%" colorInterpolationFilters="sRGB">
      <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#2a1e0a" floodOpacity="0.22" />
    </filter>
  );
}

/** Tinta de sello: bordes gastados y huecos de tinta. */
function TintaSello({ id, seed = 4 }: { id: string; seed?: number }) {
  return (
    <filter id={id} x="-8%" y="-8%" width="116%" height="116%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} result="ruido" />
      <feDisplacementMap in="SourceGraphic" in2="ruido" scale="3" xChannelSelector="R" yChannelSelector="G" result="movido" />
      <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.7 1.65" result="huecos" />
      <feComposite in="movido" in2="huecos" operator="in" />
    </filter>
  );
}

/** Cinta adhesiva con los bordes cortados a mano. */
function Cinta({ x, y, w = 52, h = 15, r = 0 }: { x: number; y: number; w?: number; h?: number; r?: number }) {
  const q = h / 4;
  const d = `M0,0 L${w},0 l-3,${q} l3,${q} l-3,${q} l3,${q} L0,${h} l3,${-q} l-3,${-q} l3,${-q} Z`;
  return <path d={d} transform={`translate(${x} ${y}) rotate(${r})`} fill="rgba(236,226,196,0.8)" stroke="rgba(0,0,0,0.05)" />;
}

/** Etiqueta discreta "IA": una pieza más del sistema. */
function ChipIA({ x, y, texto = "IA" }: { x: number; y: number; texto?: string }) {
  const w = texto.length * 6.2 + 12;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={w} height={15} rx={2} fill={C.blanco} stroke={C.pizarra} strokeWidth={1} />
      <Tx x={w / 2} y={10.8} s={9} c={C.pizarra2} a="middle" ls={0.08}>
        {texto}
      </Tx>
    </g>
  );
}

/** Persona en dibujo de línea (busto). (x, y) es el centro de la cabeza. */
function Persona({ x, y, s = 1, c = C.naranja, ancho = 2.4 }: { x: number; y: number; s?: number; c?: string; ancho?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill="none" stroke={c} strokeWidth={ancho / s} strokeLinecap="round" strokeLinejoin="round">
      <circle cx={0} cy={0} r={11} />
      <path d="M-21,40 C-21,21 -12,16 0,16 C12,16 21,21 21,40" />
    </g>
  );
}

const svgBase = { className: "h-full w-full", preserveAspectRatio: "xMidYMid meet", role: "img" } as const;

// =====================================================================================
// PLACA 08 · ¿Qué pasa si se equivoca? — dos errores, dos costos.
// =====================================================================================

function P08Errores() {
  const id = useIds("ib08");
  const sombra = `url(#${id("sombra")})`;
  const onda = "M56,242 q6,4 12,0" + " t12,0".repeat(17);
  return (
    <svg
      viewBox="0 0 800 560"
      {...svgBase}
      aria-label="Dos errores lado a lado. Un borrador de respuesta a un cliente corregido en lápiz rojo: error reversible, se corrige en un minuto. Una transferencia de 4.800.000 pesos aprobada y ejecutada: error con consecuencia, no se puede deshacer. Abajo, el costo del error crece de bajo a alto."
    >
      <defs>
        <Sombra id={id("sombra")} />
        <TintaSello id={id("tinta")} seed={7} />
        <pattern id={id("rayado")} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={C.grafito} strokeWidth="1.3" opacity="0.5" />
        </pattern>
      </defs>

      {/* ── Izquierda: el borrador, con lápiz rojo ─────────────────────────────── */}
      <Cae x={40} y={46} r={-3} d={0.05}>
        <rect width={300} height={344} fill={C.blanco} filter={sombra} />
        <rect width={300} height={30} fill={C.papel2} />
        <Tx x={14} y={19.5} s={10.5} c={C.grafito} ls={0.14}>
          BORRADOR · RESPUESTA
        </Tx>
        <ChipIA x={232} y={7.5} texto="IA · v1" />
        <Tx x={14} y={50} s={9} c={C.gris} ls={0.1}>
          PARA
        </Tx>
        <Tx x={62} y={50} s={12} f="sans" c={C.grafito}>
          Cliente · cuenta ****4410
        </Tx>
        <line x1={14} x2={286} y1={60} y2={60} stroke={C.niebla} />
        <Tx x={14} y={78} s={9} c={C.gris} ls={0.1}>
          ASUNTO
        </Tx>
        <Tx x={62} y={78} s={12} f="sans" w={600}>
          RE: Reclamo #48213 · débito doble
        </Tx>
        <line x1={14} x2={286} y1={88} y2={88} stroke={C.niebla} />

        <Tx x={14} y={118} s={13} f="sans" c={C.grafito}>
          Estimado cliente:
        </Tx>
        <Tx x={14} y={147} s={13} f="sans" c={C.grafito}>
          Lamentamos informarle que su reclamo
        </Tx>
        <Tx x={14} y={176} s={13} f="sans" c={C.grafito}>
          fue recibido y será analizado en un
        </Tx>
        <Tx x={14} y={205} s={13} f="sans" c={C.grafito}>
          plazo de
        </Tx>
        <Tx x={82} y={205} s={13} f="sans" c={C.grafito}>
          48
        </Tx>
        <Tx x={108} y={205} s={13} f="sans" c={C.grafito}>
          hs hábiles. Ante cualquier
        </Tx>
        <Tx x={14} y={234} s={13} f="sans" c={C.grafito}>
          duda,
        </Tx>
        <Tx x={56} y={234} s={13} f="sans" c={C.grafito}>
          remítase a la normativa vigente.
        </Tx>
        <Tx x={14} y={263} s={13} f="sans" c={C.grafito}>
          Saludos cordiales,
        </Tx>
        <rect x={14} y={276} width={92} height={5} fill={C.niebla} />
        <rect x={14} y={286} width={60} height={5} fill={C.niebla} />
        <Tx x={14} y={332} s={9} c={C.gris} ls={0.06}>
          Guardado hace 1 min · sin enviar
        </Tx>

        {/* Correcciones en lápiz rojo */}
        <Traza d="M11,114 L128,111" largo={130} delay={1.0} c={C.rojo} ancho={2} />
        <Aparece d={1.25}>
          <Tx x={136} y={121} s={24} f="mano" c={C.rojo}>
            Hola,
          </Tx>
        </Aparece>
        <Traza d="M75,201 a14,12 0 1,0 28,0 a14,12 0 1,0 -28,0" largo={90} delay={1.5} c={C.rojo} ancho={1.8} />
        <Aparece d={1.8}>
          <Tx x={100} y={188} s={20} f="mano" c={C.rojo}>
            24
          </Tx>
        </Aparece>
        <Traza d={onda} largo={240} delay={2.0} c={C.rojo} ancho={1.6} />
        <Flecha d="M150,300 C128,294 118,276 124,252" punta="M116,262 L124,251 L132,261" largo={70} delay={2.4} c={C.rojo} ancho={1.8} />
        <Aparece d={2.5}>
          <Tx x={140} y={314} s={21} f="mano" c={C.rojo}>
            ok, corregir tono
          </Tx>
        </Aparece>
      </Cae>

      {/* Lápiz bicolor, apoyado */}
      <Cae x={372} y={112} r={7} d={0.4}>
        <path d="M0,24 L7,0 L14,24 Z" fill={C.carton} />
        <path d="M4.6,8 L7,0 L9.4,8 Z" fill={C.pizarra2} />
        <rect x={0} y={24} width={14} height={98} fill={C.pizarra} />
        <rect x={4.7} y={24} width={1} height={98} fill={C.pizarra2} opacity={0.6} />
        <rect x={9.3} y={24} width={1} height={98} fill={C.pizarra2} opacity={0.6} />
        <rect x={0} y={122} width={14} height={98} fill={C.rojo} />
        <rect x={4.7} y={122} width={1} height={98} fill="#8f2a1f" opacity={0.6} />
        <rect x={9.3} y={122} width={1} height={98} fill="#8f2a1f" opacity={0.6} />
        <path d="M0,220 L7,244 L14,220 Z" fill={C.carton} />
        <path d="M4.6,236 L7,244 L9.4,236 Z" fill={C.rojo} />
      </Cae>

      {/* Goma de borrar + migas */}
      <Cae x={298} y={384} r={-9} d={0.5}>
        <rect width={76} height={26} rx={4} fill={C.blanco} stroke="#d6d0c4" filter={sombra} />
        <rect x={28} width={48} height={26} fill={C.pizarra} />
        <Tx x={52} y={16.5} s={7.5} c={C.blanco} a="middle" ls={0.12}>
          GOMA 20
        </Tx>
      </Cae>
      <g fill="#cfc8bb">
        <ellipse cx={288} cy={402} rx={2.4} ry={1.4} />
        <ellipse cx={281} cy={396} rx={1.6} ry={1} />
        <ellipse cx={292} cy={409} rx={1.8} ry={1.1} />
      </g>

      {/* ── Derecha: la operación aprobada ─────────────────────────────────────── */}
      <Cae x={446} y={36} r={2} d={0.25}>
        <rect width={318} height={334} fill={C.blanco} filter={sombra} />
        <rect width={318} height={38} fill={C.pizarra2} />
        <Tx x={14} y={24} s={11} c={C.blanco} ls={0.16}>
          SOLICITUD DE OPERACIÓN
        </Tx>
        <Tx x={304} y={24} s={10} c={C.cielo} a="end">
          OP-2231
        </Tx>
        <Tx x={14} y={57} s={9} c={C.gris}>
          Transferencia a terceros · back office
        </Tx>
        {[
          { y: 68, k: "CUENTA ORIGEN", v: "CC $ 0017-••••-4410" },
          { y: 110, k: "CUENTA DESTINO", v: "CBU 0720 •••• •••• 3319" },
          { y: 194, k: "APROBÓ", v: "Sistema · automático" },
        ].map((f) => (
          <g key={f.k}>
            <rect x={12} y={f.y} width={294} height={36} fill="none" stroke={C.niebla} />
            <Tx x={20} y={f.y + 12} s={8.5} c={C.gris} ls={0.1}>
              {f.k}
            </Tx>
            <Tx x={20} y={f.y + 29} s={13.5} f="sans" c={C.tinta}>
              {f.v}
            </Tx>
          </g>
        ))}
        <ChipIA x={274} y={204} />
        <rect x={12} y={152} width={294} height={36} fill="none" stroke={C.niebla} />
        <Tx x={20} y={164} s={8.5} c={C.gris} ls={0.1}>
          IMPORTE
        </Tx>
        <Tx x={20} y={183} s={17} f="sans" w={700}>
          $ 4.800.000,00
        </Tx>
        <rect x={14} y={242} width={11} height={11} fill="none" stroke={C.grafito} />
        <path d="M16,247 l3,3.5 l5,-7" fill="none" stroke={C.grafito} strokeWidth={1.6} />
        <Tx x={32} y={252} s={12} f="sans" c={C.grafito}>
          Firma validada
        </Tx>
        <rect x={14} y={264} width={11} height={11} fill="none" stroke={C.grafito} />
        <Tx x={32} y={274} s={12} f="sans" c={C.grafito}>
          Doble control
        </Tx>
        <line x1={14} x2={140} y1={316} y2={316} stroke={C.niebla} />
        <Tx x={14} y={328} s={8} c={C.gris} ls={0.1}>
          FIRMA Y SELLO
        </Tx>

        {/* Sello APROBADA */}
        <g transform="translate(218 114) rotate(-13)">
          <Aparece d={0.95}>
            <g filter={`url(#${id("tinta")})`} opacity={0.9} style={{ mixBlendMode: "multiply" }}>
              <rect x={-96} y={-38} width={192} height={76} rx={6} fill="none" stroke={C.rojo} strokeWidth={4} />
              <rect x={-89} y={-31} width={178} height={62} rx={3} fill="none" stroke={C.rojo} strokeWidth={1.5} />
              <Tx x={0} y={8} s={42} f="tit" c={C.rojo} a="middle" ls={0.05}>
                APROBADA
              </Tx>
              <Tx x={0} y={23} s={8} c={C.rojo} a="middle" ls={0.2}>
                25 SEP 2026 · 15:02
              </Tx>
            </g>
          </Aparece>
        </g>
      </Cae>

      {/* Comprobante: la consecuencia real */}
      <Cae x={604} y={298} r={-4} d={1.25}>
        <rect width={184} height={100} fill={C.blanco} filter={sombra} />
        <rect width={5} height={100} fill={C.rojo} />
        <rect x={82} y={-5} width={26} height={4} rx={1} fill={C.niebla} stroke={C.gris} strokeWidth={0.6} />
        <Tx x={16} y={18} s={8.5} c={C.gris} ls={0.1}>
          COMPROBANTE · 000918342
        </Tx>
        <Tx x={16} y={39} s={18} f="tit">
          TRANSFERENCIA
        </Tx>
        <Tx x={16} y={57} s={18} f="tit">
          EJECUTADA
        </Tx>
        <Tx x={16} y={77} s={12.5} w={700}>
          $ 4.800.000,00
        </Tx>
        <Tx x={16} y={92} s={8.5} c={C.gris}>
          15:02:41 · acreditada
        </Tx>
      </Cae>

      {/* ── Etiquetas ───────────────────────────────────────────────────────────── */}
      <Cae x={52} y={414} r={-1.2} d={0.6}>
        <rect width={262} height={48} fill={C.blanco} filter={sombra} />
        <rect width={5} height={48} fill={C.pizarra} />
        <Tx x={18} y={20} s={11} w={700} ls={0.16}>
          ERROR REVERSIBLE
        </Tx>
        <Tx x={18} y={40} s={17} f="serif" c={C.grafito}>
          se corrige en 1 minuto
        </Tx>
      </Cae>
      <Cae x={452} y={414} r={1} d={1.45}>
        <rect width={262} height={48} fill={C.blanco} filter={sombra} />
        <rect width={5} height={48} fill={C.rojo} />
        <Tx x={18} y={20} s={11} w={700} c={C.rojo} ls={0.16}>
          ERROR CON CONSECUENCIA
        </Tx>
        <Tx x={18} y={40} s={17} f="serif" c={C.grafito}>
          no se puede deshacer
        </Tx>
      </Cae>

      {/* ── Costo del error: de bajo a alto ─────────────────────────────────────── */}
      <Aparece d={1.7}>
        <path d="M60,506 L740,487 L740,479 L776,508 L740,537 L740,529 L60,510 Z" fill={`url(#${id("rayado")})`} />
      </Aparece>
      <Traza d="M60,506 L740,487 L740,479 L776,508 L740,537 L740,529 L60,510 Z" largo={1500} delay={1.6} c={C.grafito} ancho={1.4} />
      <Aparece d={1.9}>
        <Tx x={400} y={480} s={11} c={C.grafito} a="middle" ls={0.3}>
          COSTO DEL ERROR
        </Tx>
        <Tx x={54} y={540} s={22} f="mano" c={C.grafito}>
          bajo
        </Tx>
        <Tx x={744} y={470} s={22} f="mano" c={C.rojo}>
          alto
        </Tx>
        <line x1={183} x2={183} y1={466} y2={500} stroke={C.pizarra} strokeWidth={1.2} strokeDasharray="2 3" />
        <circle cx={183} cy={508} r={5} fill={C.pizarra} />
        <line x1={583} x2={583} y1={466} y2={488} stroke={C.rojo} strokeWidth={1.2} strokeDasharray="2 3" />
        <circle cx={583} cy={508} r={8} fill={C.rojo} />
      </Aparece>
    </svg>
  );
}

// =====================================================================================
// PLACA 09 · ¿Podés revisar el resultado? — la lupa y la caja negra.
// =====================================================================================

const TIRA_FILAS: { y: number; k: string; v: string }[] = [
  { y: 120, k: "Tipo", v: "Reclamo" },
  { y: 142, k: "Motivo", v: "Débito duplicado" },
  { y: 164, k: "Cliente", v: "Segmento A" },
  { y: 186, k: "Monto", v: "$ 12.450,00" },
  { y: 208, k: "Fecha", v: "22/09/2026" },
  { y: 230, k: "Canal", v: "App móvil" },
];

const TIRA_BARRAS = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 4, 2, 1, 1, 3, 1, 2, 2, 1, 3].reduce<{ x: number; w: number }[]>(
  (acc, w) => [...acc, { x: acc.length ? acc[acc.length - 1].x + acc[acc.length - 1].w + 2 : 16, w }],
  [],
);

function tiraBorde() {
  let d = "M0,0 H232 V480";
  for (let k = 1; k <= 12; k++) d += ` L${(232 - (k * 232) / 12).toFixed(2)},${k % 2 ? 490 : 480}`;
  return d + " Z";
}
const TIRA_BORDE = tiraBorde();

/** La tira impresa del resumen (coordenadas propias: 232 × 490). */
function TiraCuerpo({ sombra }: { sombra: string }) {
  return (
    <g>
      <path d={TIRA_BORDE} fill={C.blanco} filter={sombra} />
      <Tx x={16} y={38} s={22} f="tit">
        RESUMEN DEL CASO
      </Tx>
      <Tx x={16} y={56} s={9.5} c={C.gris}>
        INC-0921 · 25/09/2026 · 14:58
      </Tx>
      <ChipIA x={16} y={67} texto="generado por IA" />
      <line x1={14} x2={218} y1={98} y2={98} stroke={C.gris} strokeDasharray="3 3" />
      {TIRA_FILAS.map((f) => (
        <g key={f.k}>
          <Tx x={16} y={f.y} s={11} c={C.gris}>
            {f.k}
          </Tx>
          <Tx x={96} y={f.y} s={11}>
            {f.v}
          </Tx>
        </g>
      ))}
      <line x1={14} x2={218} y1={248} y2={248} stroke={C.gris} strokeDasharray="3 3" />
      <Tx x={16} y={270} s={11} c={C.gris}>
        Causa probable
      </Tx>
      <Tx x={16} y={290} s={11}>
        Doble procesamiento
      </Tx>
      <Tx x={16} y={308} s={11}>
        del débito automático.
      </Tx>
      <line x1={14} x2={218} y1={326} y2={326} stroke={C.gris} strokeDasharray="3 3" />
      <Tx x={16} y={348} s={11} c={C.gris}>
        Acción sugerida
      </Tx>
      <Tx x={16} y={368} s={11}>
        Reintegro total +
      </Tx>
      <Tx x={16} y={386} s={11}>
        aviso al cliente.
      </Tx>
      <line x1={14} x2={218} y1={404} y2={404} stroke={C.gris} strokeDasharray="3 3" />
      <Tx x={16} y={426} s={11} c={C.gris}>
        Confianza
      </Tx>
      <Tx x={96} y={426} s={11}>
        media
      </Tx>
      <g fill={C.tinta}>
        {TIRA_BARRAS.map((b) => (
          <rect key={b.x} x={b.x} y={442} width={b.w} height={22} />
        ))}
      </g>

      {/* Marcas de la revisión humana (lápiz) */}
      <Traza d="M205,138 l5,6 l11,-13" largo={30} delay={1.5} c={C.naranja} ancho={2.2} />
      <Traza d="M205,160 l5,6 l11,-13" largo={30} delay={1.75} c={C.naranja} ancho={2.2} />
      <Traza d="M90,182 a44,12 0 1,0 88,0 a44,12 0 1,0 -88,0" largo={200} delay={1.95} c={C.naranja} ancho={1.8} />
      <Traza d="M205,182 l5,6 l11,-13" largo={30} delay={2.25} c={C.naranja} ancho={2.2} />
      <Traza d="M96,212 q18,3 36,0 t36,0" largo={80} delay={2.45} c={C.rojo} ancho={1.6} />
      <Aparece d={2.6}>
        <Tx x={176} y={212} s={17} f="mano" c={C.rojo}>
          ¿?
        </Tx>
      </Aparece>
      <Traza d="M205,226 l5,6 l11,-13" largo={30} delay={2.8} c={C.naranja} ancho={2.2} />
    </g>
  );
}

function P09Lupa() {
  const id = useIds("ib09");
  const sombra = `url(#${id("sombra")})`;
  return (
    <svg
      viewBox="0 0 800 560"
      {...svgBase}
      aria-label="Un resumen de caso generado por IA pasa por una lupa: alguien lo revisa, marca con lápiz y lo sella como revisado. Al costado, una caja negra cerrada con un signo de pregunta y la anotación: ¿y si nadie puede controlarlo?"
    >
      <defs>
        <Sombra id={id("sombra")} />
        <TintaSello id={id("tinta")} seed={11} />
        <clipPath id={id("lente")}>
          <circle cx={240} cy={214} r={100} />
        </clipPath>
      </defs>

      {/* La tira impresa */}
      <Cae x={70} y={24} r={-4} d={0.05}>
        <TiraCuerpo sombra={sombra} />
      </Cae>

      {/* Sello REVISADO */}
      <g transform="translate(70 24) rotate(-4)">
        <g transform="translate(118 434) rotate(-8)">
          <Aparece d={3.1}>
            <g filter={`url(#${id("tinta")})`} opacity={0.92} style={{ mixBlendMode: "multiply" }}>
              <rect x={-86} y={-25} width={172} height={50} rx={5} fill="none" stroke={C.pizarra2} strokeWidth={3.5} />
              <rect x={-80} y={-19} width={160} height={38} rx={3} fill="none" stroke={C.pizarra2} strokeWidth={1.2} />
              <Tx x={-14} y={10} s={28} f="tit" c={C.pizarra2} a="middle" ls={0.04}>
                REVISADO
              </Tx>
              <path d="M42,-1 l8,9 l17,-19" fill="none" stroke={C.pizarra2} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </Aparece>
        </g>
      </g>

      {/* La lupa: la instancia de revisión humana */}
      <Cae d={0.75}>
        <g clipPath={`url(#${id("lente")})`}>
          <circle cx={240} cy={214} r={100} fill={C.papel} />
          <g transform="translate(240 214) scale(1.45) translate(-240 -214)">
            <g transform="translate(70 24) rotate(-4)">
              <TiraCuerpo sombra={sombra} />
            </g>
          </g>
          <path d="M171,178 A74,74 0 0 1 221,142" fill="none" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.6} />
        </g>
        <circle cx={240} cy={214} r={104} fill="none" stroke={C.grafito} strokeWidth={9} />
        <circle cx={240} cy={214} r={99} fill="none" stroke={C.niebla} strokeWidth={1.2} />
        <g transform="translate(315 289) rotate(45)">
          <rect x={-4} y={-9} width={30} height={18} rx={2} fill={C.grafito} />
          <rect x={26} y={-11.5} width={118} height={23} rx={11.5} fill={C.tinta} />
        </g>
      </Cae>
      <Aparece d={1.3}>
        <Tx x={392} y={432} s={10.5} c={C.naranja} ls={0.22}>
          REVISIÓN HUMANA
        </Tx>
      </Aparece>

      {/* La caja negra */}
      <Cae d={0.4}>
        <path d="M540,236 L592,196 L752,196 L752,346 L700,386 L540,386 Z" fill={C.blanco} stroke={C.blanco} strokeWidth={12} strokeLinejoin="round" filter={sombra} />
        <path d="M540,236 L700,236 L752,196 L592,196 Z" fill="#303238" />
        <path d="M700,236 L752,196 L752,346 L700,386 Z" fill="#101114" />
        <rect x={540} y={236} width={160} height={150} fill="#1c1d21" />
        <Tx x={620} y={352} s={124} f="tit" c={C.papel} a="middle">
          ?
        </Tx>
        <rect x={588} y={369} width={64} height={5} rx={2} fill="#000000" />
      </Cae>
      <Cae d={1.0}>
        <path d="M594,373 H646 V432 l-6.5,6 l-6.5,-6 l-6.5,6 l-6.5,-6 l-6.5,6 l-6.5,-6 l-6.5,6 l-6.5,-6 Z" fill={C.blanco} stroke={C.niebla} />
        {[388, 398, 408, 418].map((y, i) => (
          <rect key={y} x={602} y={y} width={i % 2 ? 26 : 36} height={3} fill={C.niebla} />
        ))}
      </Cae>
      <Aparece d={1.2}>
        <Tx x={646} y={476} s={10.5} c={C.grafito} a="middle" ls={0.3}>
          CAJA NEGRA
        </Tx>
      </Aparece>
      <Aparece d={1.6}>
        <Tx x={556} y={104} s={29} f="mano" c={C.rojo}>
          ¿y si nadie
        </Tx>
        <Tx x={556} y={136} s={29} f="mano" c={C.rojo}>
          puede controlarlo?
        </Tx>
      </Aparece>
      <Flecha d="M640,148 C654,162 652,178 642,190" punta="M633,181 L642,191 L650,180" largo={60} delay={1.9} c={C.rojo} ancho={2} />
    </svg>
  );
}

// =====================================================================================
// PLACA 10 · No es humano o máquina — lo que hay en el medio.
// =====================================================================================

// Micro-escenas (100 × 72) que muestran quién hace qué en cada grado:
// la persona (naranja) va soltando el lápiz y el sistema (IA) va tomando pasos.

/** Asiste: vos escribís; el sistema sugiere al costado. */
function IcoAsiste() {
  const lineas = [
    { y: 18, w: 36, c: C.grafito },
    { y: 27, w: 30, c: C.niebla },
    { y: 36, w: 34, c: C.niebla },
    { y: 45, w: 16, c: C.niebla },
  ];
  return (
    <g>
      <rect x={10} y={6} width={52} height={62} fill={C.blanco} stroke={C.grafito} strokeWidth={1.3} />
      {lineas.map((l) => (
        <rect key={l.y} x={17} y={l.y} width={l.w} height={3.5} fill={l.c} />
      ))}
      <g transform="translate(35 50) rotate(-45)">
        <path d="M0,0 L9,-3.6 L9,3.6 Z" fill={C.carton} />
        <path d="M0,0 L3.4,-1.4 L3.4,1.4 Z" fill={C.tinta} />
        <rect x={9} y={-3.6} width={34} height={7.2} fill={C.naranja} />
        <rect x={43} y={-3.6} width={6} height={7.2} fill={C.niebla} />
      </g>
      <rect x={70} y={24} width={26} height={15} rx={7} fill={C.blanco} stroke={C.pizarra} strokeWidth={1} />
      <Tx x={83} y={34.5} s={11} c={C.pizarra2} a="middle" w={700}>
        …
      </Tx>
      <path d="M76,39 L73,45" stroke={C.pizarra} strokeWidth={1} />
      <ChipIA x={70} y={48} />
    </g>
  );
}

/** Prepara: el sistema arma el borrador; vos lo revisás. */
function IcoPrepara() {
  const anchos = [40, 42, 36, 42, 26];
  return (
    <g>
      <rect x={16} y={6} width={54} height={64} fill={C.blanco} stroke={C.grafito} strokeWidth={1.3} />
      <Tx x={22} y={17} s={6.5} c={C.gris} ls={0.12}>
        BORRADOR
      </Tx>
      {anchos.map((w, i) => (
        <rect key={i} x={22} y={24 + i * 8} width={w} height={3.5} fill={i === 0 ? C.grafito : C.niebla} />
      ))}
      <ChipIA x={56} y={-2} />
      <path d="M78,46 l5,6 l11,-13" fill="none" stroke={C.naranja} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

/** Propone: el sistema sugiere una opción; vos elegís. */
function IcoPropone() {
  return (
    <g>
      <rect x={8} y={18} width={36} height={46} fill={C.blanco} stroke={C.niebla} strokeWidth={1.3} />
      <Tx x={26} y={50} s={24} f="tit" c={C.gris} a="middle">
        A
      </Tx>
      <rect x={52} y={12} width={36} height={46} fill={C.blanco} stroke={C.pizarra2} strokeWidth={1.8} />
      <Tx x={70} y={44} s={24} f="tit" a="middle">
        B
      </Tx>
      <ChipIA x={74} y={4} />
      <path d="M46,40 C44,18 60,4 78,8 C96,12 100,40 90,58 C82,70 58,70 50,56" fill="none" stroke={C.naranja} strokeWidth={2} strokeLinecap="round" />
    </g>
  );
}

/** Ejecuta: el sistema hace el paso solo. */
function IcoEjecuta() {
  const anchos = [26, 22, 28, 16];
  return (
    <g>
      <rect x={8} y={20} width={40} height={48} fill={C.blanco} stroke={C.grafito} strokeWidth={1.3} />
      {anchos.map((w, i) => (
        <rect key={i} x={14} y={30 + i * 8} width={w} height={3} fill={C.niebla} />
      ))}
      <path d="M48,42 C62,42 66,28 76,24" fill="none" stroke={C.pizarra} strokeWidth={1.3} strokeDasharray="3 3" />
      <path d="M70,24 L99,9 L89,35 L82,28 Z" fill={C.pizarra2} />
      <path d="M82,28 L99,9" stroke={C.blanco} strokeWidth={1} />
      <ChipIA x={60} y={50} />
    </g>
  );
}

const ESPECTRO = [
  { t: "ASISTE", n: ["te ayuda", "mientras hacés"], x: 320, r: -2, Ico: IcoAsiste },
  { t: "PREPARA", n: ["arma el", "borrador"], x: 500, r: 1.5, Ico: IcoPrepara },
  { t: "PROPONE", n: ["sugiere", "qué hacer"], x: 680, r: -1, Ico: IcoPropone },
  { t: "EJECUTA", n: ["hace pasos", "solo"], x: 860, r: 2, Ico: IcoEjecuta },
];

// Marcas de la cinta (siguen el borde superior, que baja apenas hacia la derecha).
const MARCAS_10 = Array.from({ length: 61 }, (_, k) => {
  const x = 212 + k * 13;
  return { x, y: 206 - (x - 196) * 0.004, l: k % 5 === 0 ? 12 : 6 };
});

function P10Espectro() {
  const id = useIds("ib10");
  const sombra = `url(#${id("sombra")})`;
  return (
    <svg
      viewBox="0 0 1200 460"
      {...svgBase}
      aria-label="Una cinta de papel entre HUMANO, a la izquierda, e IA, a la derecha. En el medio, cuatro recortes: asiste (te ayuda mientras hacés), prepara (arma el borrador), propone (sugiere qué hacer) y ejecuta (hace pasos solo)."
    >
      <defs>
        <Sombra id={id("sombra")} />
      </defs>

      {/* La persona */}
      <Aparece d={0.05}>
        <Persona x={104} y={168} s={1.9} c={C.grafito} ancho={3} />
        <Tx x={104} y={292} s={30} f="tit" a="middle">
          HUMANO
        </Tx>
      </Aparece>

      {/* La cinta de papel */}
      <Aparece d={0.15}>
        <path
          d="M196,206 C420,200 780,210 1004,202 l-4,9 l4,9 l-4,9 l4,9 l-4,9 l4,7 C780,262 420,252 196,258 l4,-9 l-4,-9 l4,-9 l-4,-9 l4,-9 Z"
          fill={C.carton}
          filter={sombra}
        />
        <g stroke={C.grafito} strokeWidth={1} opacity={0.55}>
          {MARCAS_10.map((m) => (
            <line key={m.x} x1={m.x} x2={m.x} y1={m.y + 1} y2={m.y + 1 + m.l} />
          ))}
        </g>
      </Aparece>

      {/* La ficha IA */}
      <Cae x={1052} y={160} r={5} d={0.95}>
        <path d="M22,0 H112 V88 H22 L0,66 V22 Z" fill={C.blanco} stroke={C.pizarra2} strokeWidth={1.8} filter={sombra} />
        <circle cx={15} cy={44} r={5} fill={C.papel} stroke={C.pizarra2} strokeWidth={1.4} />
        <Tx x={66} y={62} s={52} f="tit" c={C.pizarra2} a="middle">
          IA
        </Tx>
        <Tx x={66} y={79} s={9} c={C.gris} a="middle" ls={0.25}>
          SISTEMA
        </Tx>
      </Cae>
      <Traza d="M1004,228 C1026,238 1042,214 1066,205" largo={80} delay={1.2} c={C.grafito} ancho={1.2} />

      {/* Las cuatro paradas */}
      {ESPECTRO.map((p, i) => (
        <g key={p.t}>
          <g transform={`translate(${p.x - 62} 84) scale(1.24)`}>
            <Aparece d={0.7 + i * 0.18}>
              <p.Ico />
            </Aparece>
          </g>
          <Cae x={p.x - 78} y={178} r={p.r} d={0.4 + i * 0.15}>
            <rect width={156} height={56} fill={C.blanco} filter={sombra} />
            <Cinta x={54} y={-8} w={48} r={-4} />
            <Tx x={78} y={42} s={36} f="tit" a="middle">
              {p.t}
            </Tx>
          </Cae>
          <Traza d={`M${p.x},266 c4,6 -4,12 0,20`} largo={30} delay={1.0 + i * 0.15} c={C.grafito} ancho={1.4} />
          <Aparece d={1.1 + i * 0.15}>
            {p.n.map((linea, j) => (
              <Tx key={linea} x={p.x} y={318 + j * 28} s={27} f="mano" c={C.grafito} a="middle">
                {linea}
              </Tx>
            ))}
          </Aparece>
        </g>
      ))}

      {/* Flecha manuscrita: hacia cada extremo, quién hace más */}
      <Traza d="M226,404 C430,396 770,410 974,400" largo={760} delay={1.7} c={C.naranja} ancho={2.2} />
      <Traza d="M242,394 L224,404 L243,413" largo={50} delay={2.5} c={C.naranja} ancho={2.2} />
      <Traza d="M958,391 L976,400 L958,410" largo={50} delay={2.5} c={C.naranja} ancho={2.2} />
      <Aparece d={2.3}>
        <Tx x={226} y={440} s={24} f="mano" c={C.naranja}>
          más hace la persona
        </Tx>
        <Tx x={974} y={440} s={24} f="mano" c={C.naranja} a="end">
          más hace el sistema
        </Tx>
      </Aparece>
    </svg>
  );
}

// =====================================================================================
// PLACA 11 · ¿Dónde querés seguir estando vos? — la persona cambia de lugar.
// =====================================================================================

const FLUJO_11: { l: string[]; ia: boolean; verbo?: string }[] = [
  { l: ["INGRESA", "CASO"], ia: true },
  { l: ["RECOPILA", "DATOS"], ia: true },
  { l: ["ANALIZA"], ia: true, verbo: "DECIDIR" },
  { l: ["PROPONE", "RESPUESTA"], ia: true, verbo: "REVISAR" },
  { l: ["AUTORIZA"], ia: false, verbo: "AUTORIZAR" },
  { l: ["ENVÍA"], ia: true },
  { l: ["REGISTRA"], ia: true },
];

function P11Humano() {
  const id = useIds("ib11");
  const sombra = `url(#${id("sombra")})`;
  const cx = (i: number) => 95 + i * 168;
  return (
    <svg
      viewBox="0 0 1200 460"
      {...svgBase}
      aria-label="Un flujo de siete pasos: ingresa caso, recopila datos, analiza, propone respuesta, autoriza, envía y registra. El sistema hace varios pasos; una persona decide, revisa y autoriza, y resuelve las excepciones que salen del flujo. La persona no desaparece: cambia de lugar."
    >
      <defs>
        <Sombra id={id("sombra")} />
      </defs>

      {/* Referencias */}
      <Aparece d={0.05}>
        <rect x={30} y={26} width={24} height={14} fill={C.blanco} stroke={C.pizarra} strokeWidth={1.4} strokeDasharray="4 3" />
        <Tx x={64} y={37} s={10.5} c={C.grafito} ls={0.06}>
          lo hace el sistema
        </Tx>
        <Persona x={42} y={52} s={0.5} ancho={1.8} />
        <Tx x={64} y={66} s={10.5} c={C.grafito} ls={0.06}>
          interviene una persona
        </Tx>
      </Aparece>

      {/* Nodos del flujo */}
      {FLUJO_11.map((n, i) => {
        const x = cx(i);
        return (
          <g key={n.l.join(" ")}>
            <Cae x={x - 68} y={170} r={[-1, 0.8, -0.6, 1, -0.8, 0.6, -1][i]} d={0.15 + i * 0.09}>
              <rect
                width={136}
                height={62}
                fill={C.blanco}
                stroke={n.ia ? C.pizarra : C.naranja}
                strokeWidth={n.ia ? 1.5 : 2.6}
                strokeDasharray={n.ia ? "6 4" : undefined}
                filter={sombra}
              />
              {n.l.length === 1 ? (
                <Tx x={68} y={38} s={20} f="tit" a="middle">
                  {n.l[0]}
                </Tx>
              ) : (
                n.l.map((l, j) => (
                  <Tx key={l} x={68} y={28 + j * 21} s={19} f="tit" a="middle">
                    {l}
                  </Tx>
                ))
              )}
              {n.ia && <ChipIA x={106} y={-8} />}
            </Cae>
            {i < FLUJO_11.length - 1 && (
              <Aparece d={0.3 + i * 0.09}>
                <path d={`M${x + 72},201 H${x + 96}`} stroke={C.grafito} strokeWidth={1.6} />
                <path d={`M${x + 90},196 L${x + 97},201 L${x + 90},206`} fill="none" stroke={C.grafito} strokeWidth={1.6} strokeLinejoin="round" />
              </Aparece>
            )}
            {n.verbo && (
              <g>
                <Aparece d={1.0 + i * 0.12}>
                  <Persona x={x} y={112} s={1.2} />
                  <line x1={x} x2={x} y1={156} y2={168} stroke={C.naranja} strokeWidth={1.6} strokeDasharray="2 3" />
                </Aparece>
                <Aparece d={1.2 + i * 0.12}>
                  <Tx x={x} y={84} s={30} f="mano" c={C.naranja} a="middle" w={700}>
                    {n.verbo}
                  </Tx>
                </Aparece>
              </g>
            )}
          </g>
        );
      })}

      {/* La rama de la excepción */}
      <Flecha d="M431,234 C431,300 462,350 506,350" punta="M495,342 L507,350 L495,358" largo={170} delay={1.9} c={C.naranja} ancho={2} />
      <Aparece d={2.1}>
        <Tx x={452} y={294} s={24} f="mano" c={C.naranja}>
          excepción →
        </Tx>
      </Aparece>
      <Cae x={512} y={322} r={-1} d={2.2}>
        <rect width={176} height={58} fill={C.blanco} stroke={C.naranja} strokeWidth={2.6} filter={sombra} />
        <Tx x={88} y={25} s={17} f="tit" a="middle">
          CASO FUERA
        </Tx>
        <Tx x={88} y={45} s={17} f="tit" a="middle">
          DE REGLA
        </Tx>
      </Cae>
      <Flecha d="M672,320 C692,290 714,266 728,238" punta="M718,244 L729,236 L732,249" largo={110} delay={2.6} c={C.naranja} ancho={1.8} />
      <Aparece d={2.5}>
        <Persona x={748} y={322} s={1.2} />
        <Tx x={780} y={352} s={28} f="mano" c={C.naranja} w={700}>
          RESOLVER EXCEPCIONES
        </Tx>
      </Aparece>

      {/* La idea */}
      <Aparece d={2.9}>
        <Tx x={40} y={372} s={32} f="mano" c={C.grafito}>
          la persona no desaparece:
        </Tx>
        <Tx x={40} y={410} s={32} f="mano" c={C.grafito}>
          cambia de lugar
        </Tx>
      </Aparece>
      <Traza d="M40,420 C100,416 170,422 236,416" largo={210} delay={3.2} c={C.naranja} ancho={3} />
    </svg>
  );
}

// =====================================================================================
// PLACA 12 · Primero, rompé la tarea — vista explotada.
// =====================================================================================

const PIEZAS_12 = ["RECIBIR", "IDENTIFICAR", "BUSCAR", "COMPARAR", "DECIDIR", "RESPONDER", "REGISTRAR"];
// Geometría de cada lámina (proyección axonométrica): T es el vértice de atrás.
const TX12 = 186;
const TOP12 = (i: number) => 62 + i * 56;
const LAM = { p1: [115, 30.7], p2: [36, 51.8], p3: [-79, 21.1], h: 15 } as const;

function Lamina({ y }: { y: number }) {
  const x = TX12;
  const [a1, b1] = LAM.p1;
  const [a2, b2] = LAM.p2;
  const [a3, b3] = LAM.p3;
  const h = LAM.h;
  const P = (dx: number, dy: number) => `${x + dx},${y + dy}`;
  return (
    <g stroke={C.grafito} strokeWidth={1.2} strokeLinejoin="round">
      <path d={`M${P(a3, b3)} L${P(a2, b2)} L${P(a2, b2 + h)} L${P(a3, b3 + h)} Z`} fill={C.papel2} />
      <path d={`M${P(a2, b2)} L${P(a1, b1)} L${P(a1, b1 + h)} L${P(a2, b2 + h)} Z`} fill={C.carton} />
      <path d={`M${P(0, 0)} L${P(a1, b1)} L${P(a2, b2)} L${P(a3, b3)} Z`} fill={C.blanco} />
      <path d={`M${P(a3 + 14, b3 + 4)} L${P(a2 + 14, b2 - 3.5)}`} stroke={C.niebla} strokeWidth={1} />
    </g>
  );
}

function P12Desarme() {
  const id = useIds("ib12");
  const sep = id("sep");
  // Distancia desde la posición final hasta el bloque armado (láminas pegadas).
  const dy = (i: number) => (i - 3) * (LAM.h + 1) - (i - 3) * 56;
  return (
    <svg
      viewBox="0 0 500 500"
      {...svgBase}
      aria-label="Vista explotada de la tarea responder un reclamo: el bloque se separa en siete láminas, recibir, identificar, buscar, comparar, decidir, responder y registrar."
    >
      <style>{`
        .${sep}{animation:${sep} 1.3s cubic-bezier(.3,.7,.2,1) .5s both}
        @keyframes ${sep}{from{transform:translateY(var(--dy))}to{transform:translateY(0)}}
        @media (prefers-reduced-motion:reduce){.${sep}{animation:none}}
      `}</style>

      {/* Eje de la lámina técnica */}
      <line x1={204} x2={204} y1={50} y2={488} stroke={C.gris} strokeWidth={0.9} strokeDasharray="8 4 2 4" />

      {/* El título de la tarea, como rótulo de lámina */}
      <Cae x={94} y={8} d={0.05}>
        <rect width={220} height={36} fill={C.blanco} stroke={C.tinta} strokeWidth={1.4} />
        <Tx x={110} y={25.5} s={21} f="tit" a="middle">
          RESPONDER UN RECLAMO
        </Tx>
      </Cae>
      <Aparece d={0.3}>
        <Tx x={6} y={33} s={23} f="mano" c={C.naranja}>
          1 tarea
        </Tx>
        <path d="M76,27 H90 M85,22.5 L91,27 L85,31.5" fill="none" stroke={C.naranja} strokeWidth={1.8} strokeLinecap="round" />
      </Aparece>

      {/* Láminas (de abajo hacia arriba, para que se tapen bien) */}
      {PIEZAS_12.map((_, i) => PIEZAS_12.length - 1 - i).map((i) => (
        <g key={i} className={sep} style={{ "--dy": `${dy(i)}px` } as CSSProperties}>
          <Lamina y={TOP12(i)} />
        </g>
      ))}

      {/* Líneas guía y rótulos */}
      {PIEZAS_12.map((p, i) => {
        const yl = TOP12(i) + 49;
        return (
          <Aparece key={p} d={1.55 + i * 0.08}>
            <circle cx={TX12 + 76} cy={yl} r={2.4} fill={C.tinta} />
            <line x1={TX12 + 78} x2={330} y1={yl} y2={yl} stroke={C.grafito} strokeWidth={0.8} />
            <circle cx={341} cy={yl} r={9.5} fill={C.blanco} stroke={C.grafito} strokeWidth={1} />
            <Tx x={341} y={yl + 3.5} s={10} a="middle" w={600}>
              {i + 1}
            </Tx>
            <Tx x={358} y={yl + 7.5} s={21} f="tit">
              {p}
            </Tx>
          </Aparece>
        );
      })}

      {/* Llave: muchas tareas chicas */}
      <Traza
        d="M98,74 C84,74 90,106 90,164 C90,234 88,256 76,263 C88,270 90,294 90,362 C90,422 84,452 98,452"
        largo={420}
        delay={2.0}
        c={C.naranja}
        ancho={2}
      />
      <Aparece d={2.3}>
        <Tx x={40} y={250} s={40} f="mano" c={C.naranja} a="middle">
          7
        </Tx>
        <Tx x={40} y={276} s={24} f="mano" c={C.naranja} a="middle">
          tareas
        </Tx>
        <Tx x={40} y={298} s={24} f="mano" c={C.naranja} a="middle">
          chicas
        </Tx>
      </Aparece>

      <Tx x={494} y={494} s={8.5} c={C.gris} a="end" ls={0.2}>
        LÁM. 12 · VISTA EXPLOTADA
      </Tx>
    </svg>
  );
}

// =====================================================================================
// PLACA 13 · "Responder un reclamo" no es una tarea — es un proceso (interactiva).
// =====================================================================================

function ObjRecibir() {
  return (
    <g>
      <g transform="rotate(8 89 64)">
        <rect x={72} y={34} width={34} height={60} rx={6} fill={C.papel2} stroke={C.grafito} strokeWidth={1.5} />
        <rect x={76} y={42} width={26} height={40} rx={1} fill={C.blanco} />
        <rect x={80} y={48} width={18} height={4} fill={C.niebla} />
        <rect x={80} y={56} width={14} height={4} fill={C.niebla} />
      </g>
      <rect x={20} y={60} width={84} height={54} rx={2} fill={C.blanco} stroke={C.grafito} strokeWidth={1.6} />
      <path d="M20,62 L62,92 L104,62" fill="none" stroke={C.grafito} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M20,114 L50,88 M104,114 L74,88" stroke={C.niebla} strokeWidth={1.2} />
      <circle cx={102} cy={60} r={10} fill={C.naranja} />
      <Tx x={102} y={64} s={11} c={C.blanco} a="middle" w={700}>
        1
      </Tx>
    </g>
  );
}

function ObjIdentificar() {
  return (
    <g>
      <rect x={58} y={38} width={16} height={11} rx={2} fill={C.niebla} stroke={C.grafito} strokeWidth={1.2} />
      <rect x={18} y={46} width={96} height={66} rx={7} fill={C.blanco} stroke={C.grafito} strokeWidth={1.6} />
      <path d="M18,60 V53 a7,7 0 0 1 7,-7 H107 a7,7 0 0 1 7,7 V60 Z" fill={C.pizarra} />
      <circle cx={40} cy={78} r={9} fill={C.papel2} stroke={C.grafito} strokeWidth={1.4} />
      <path d="M27,100 C27,91 53,91 53,100" fill={C.papel2} stroke={C.grafito} strokeWidth={1.4} />
      <rect x={62} y={70} width={42} height={5} fill={C.grafito} />
      <rect x={62} y={81} width={30} height={4} fill={C.niebla} />
      <rect x={62} y={90} width={38} height={4} fill={C.niebla} />
      <Tx x={62} y={106} s={7.5} c={C.gris}>
        ID ••4410
      </Tx>
    </g>
  );
}

function ObjBuscar() {
  return (
    <g>
      <rect x={30} y={44} width={64} height={40} fill={C.blanco} stroke={C.niebla} transform="rotate(-6 62 64)" />
      <rect x={38} y={52} width={40} height={3} fill={C.niebla} transform="rotate(-6 62 64)" />
      <path d="M18,60 H48 L54,66 H112 V112 H18 Z" fill={C.carton} stroke={C.grafito} strokeWidth={1.6} strokeLinejoin="round" />
      <path d="M18,72 H112" stroke="#c2b79d" strokeWidth={1} />
      <circle cx={84} cy={90} r={15} fill="rgba(251,250,247,0.75)" stroke={C.tinta} strokeWidth={3.5} />
      <path d="M95,101 L110,116" stroke={C.tinta} strokeWidth={5.5} strokeLinecap="round" />
    </g>
  );
}

function ObjComparar() {
  const lineas = [30, 24, 32, 20, 28, 22];
  const hoja = (x: number, giro: number) => (
    <g transform={`rotate(${giro} ${x + 23} 80)`}>
      <rect x={x} y={48} width={46} height={64} fill={C.blanco} stroke={C.grafito} strokeWidth={1.4} />
      <rect x={x + 4} y={71} width={38} height={9} fill={C.naranja} opacity={0.28} />
      {lineas.map((w, i) => (
        <rect key={i} x={x + 6} y={58 + i * 8.5} width={w} height={3} fill={i === 2 ? C.grafito : C.niebla} />
      ))}
    </g>
  );
  return (
    <g>
      {hoja(16, -4)}
      {hoja(70, 4)}
      <path d="M54,38 H78 M58,34 L54,38 L58,42 M74,34 L78,38 L74,42" fill="none" stroke={C.naranja} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

function ObjDecidir() {
  return (
    <g>
      <g fill="none" stroke={C.grafito} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M66,52 V110" />
        <path d="M48,112 H84" />
        <path d="M28,63 L104,55" />
        <path d="M28,63 L20,86 M28,63 L36,86" />
        <path d="M102,55 L94,78 M102,55 L110,78" />
      </g>
      <path d="M16,86 Q28,98 40,86 Z" fill={C.blanco} stroke={C.grafito} strokeWidth={1.8} strokeLinejoin="round" />
      <path d="M90,78 Q102,90 114,78 Z" fill={C.blanco} stroke={C.grafito} strokeWidth={1.8} strokeLinejoin="round" />
      <circle cx={66} cy={52} r={3.5} fill={C.grafito} />
      <Tx x={86} y={46} s={22} f="mano" c={C.naranja}>
        ?
      </Tx>
    </g>
  );
}

function ObjResponder() {
  return (
    <g>
      <path
        d="M24,50 H102 Q110,50 110,58 V92 Q110,100 102,100 H46 L30,114 L33,100 H24 Q16,100 16,92 V58 Q16,50 24,50 Z"
        fill={C.blanco}
        stroke={C.grafito}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <rect x={26} y={62} width={58} height={4} fill={C.grafito} />
      <rect x={26} y={72} width={72} height={4} fill={C.niebla} />
      <rect x={26} y={82} width={48} height={4} fill={C.niebla} />
      <path d="M90,44 L122,30 L110,56 L103,47 Z" fill={C.naranja} />
      <path d="M103,47 L122,30" stroke={C.blanco} strokeWidth={1} />
    </g>
  );
}

function ObjRegistrar() {
  return (
    <g>
      <path d="M66,54 Q44,46 16,52 V112 Q44,106 66,114 Z" fill={C.blanco} stroke={C.grafito} strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M66,54 Q88,46 116,52 V112 Q88,106 66,114 Z" fill={C.blanco} stroke={C.grafito} strokeWidth={1.5} strokeLinejoin="round" />
      {[64, 73, 82, 91, 100].map((y) => (
        <g key={y} stroke={C.niebla} strokeWidth={1}>
          <path d={`M22,${y} L60,${y + 2}`} />
          <path d={`M72,${y + 2} L110,${y}`} />
        </g>
      ))}
      <path d="M96,58 V106" stroke={C.niebla} strokeWidth={1} />
      <path d="M76,95 l4,5 l9,-11" fill="none" stroke={C.naranja} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M66,54 V114" stroke={C.grafito} strokeWidth={1.5} />
    </g>
  );
}

const PASOS_13: { t: string; n: [string, string]; Obj: () => React.JSX.Element; r: number }[] = [
  { t: "RECIBIR", n: ["ingresa por", "mail o app"], Obj: ObjRecibir, r: -1.5 },
  { t: "IDENTIFICAR", n: ["¿quién es", "el cliente?"], Obj: ObjIdentificar, r: 1 },
  { t: "BUSCAR", n: ["antecedentes", "y datos"], Obj: ObjBuscar, r: -0.8 },
  { t: "COMPARAR", n: ["contra criterios", "y políticas"], Obj: ObjComparar, r: 1.4 },
  { t: "DECIDIR", n: ["¿aplica?", "¿excepción?"], Obj: ObjDecidir, r: -1.2 },
  { t: "RESPONDER", n: ["borrador", "y envío"], Obj: ObjResponder, r: 0.8 },
  { t: "REGISTRAR", n: ["queda", "asentado"], Obj: ObjRegistrar, r: -1 },
];

const X13 = (i: number) => 42 + i * 164;
const Y13 = 100;

function P13Reclamo() {
  const id = useIds("ib13");
  const sombra = `url(#${id("sombra")})`;
  const total = PASOS_13.length;
  const [pasoAPaso, setPasoAPaso] = useState(false);
  const [n, setN] = useState(total);
  const visibles = pasoAPaso ? n : total;

  const alternar = () => {
    if (pasoAPaso) {
      setPasoAPaso(false);
      setN(total);
    } else {
      setPasoAPaso(true);
      setN(1);
    }
  };
  const siguiente = () => setN((v) => Math.min(total, v + 1));

  return (
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 1200 460"
        {...svgBase}
        className="absolute inset-0 h-full w-full"
        aria-label="Responder un reclamo, desarmado en siete pasos: recibir (ingresa por mail o app), identificar (quién es el cliente), buscar (antecedentes y datos), comparar (contra criterios y políticas), decidir (aplica o es una excepción), responder (borrador y envío) y registrar (queda asentado)."
      >
        <defs>
          <Sombra id={id("sombra")} />
        </defs>

        {/* Una sola tarea que abarca todo el proceso */}
        <Aparece d={0.05}>
          <path
            d="M42,88 C42,76 50,74 70,74 L570,74 C590,74 596,68 600,60 C604,68 610,74 630,74 L1130,74 C1150,74 1158,76 1158,88"
            fill="none"
            stroke={C.grafito}
            strokeWidth={1.4}
          />
          <Tx x={600} y={46} s={12} c={C.grafito} a="middle" ls={0.3}>
            “RESPONDER UN RECLAMO”
          </Tx>
        </Aparece>

        {PASOS_13.map((p, i) => {
          const x = X13(i);
          const numero = String(i + 1).padStart(2, "0");
          if (i >= visibles) {
            return (
              <g key={`hueco-${p.t}`} transform={`translate(${x} ${Y13})`}>
                <rect width={132} height={196} rx={2} fill="none" stroke={C.niebla} strokeWidth={1.5} strokeDasharray="6 6" />
                <Tx x={66} y={104} s={16} c={C.niebla} a="middle" ls={0.1}>
                  {numero}
                </Tx>
              </g>
            );
          }
          const d = pasoAPaso ? 0 : 0.1 + i * 0.11;
          return (
            <g key={p.t}>
              <Cae x={x} y={Y13} r={p.r} d={d}>
                <rect width={132} height={196} fill={C.blanco} filter={sombra} />
                <Cinta x={42} y={-8} w={48} r={i % 2 ? 3 : -3} />
                <Tx x={12} y={22} s={10.5} c={C.gris} ls={0.1}>
                  {numero}
                </Tx>
                <p.Obj />
                <line x1={20} x2={112} y1={140} y2={140} stroke={C.niebla} />
                <Tx x={66} y={172} s={21} f="tit" a="middle">
                  {p.t}
                </Tx>
              </Cae>
              <Aparece d={d + 0.25}>
                {p.n.map((linea, j) => (
                  <Tx key={linea} x={x + 66} y={332 + j * 24} s={20} f="serif" c={C.grafito} a="middle">
                    {linea}
                  </Tx>
                ))}
              </Aparece>
              {i > 0 && (
                <Flecha
                  d={`M${x - 30},${Y13 + 92} q14,-7 28,0`}
                  punta={`M${x - 9},${Y13 + 86} L${x - 2},${Y13 + 92} L${x - 10},${Y13 + 97}`}
                  largo={40}
                  delay={pasoAPaso ? 0.05 : 0.35 + i * 0.11}
                  ancho={2.2}
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="absolute bottom-0 right-0 flex items-center gap-2">
        {pasoAPaso && (
          <span className="font-mono text-[0.72rem] tracking-[0.2em] text-gris">
            {n} / {total}
          </span>
        )}
        {pasoAPaso && n < total && (
          <button
            type="button"
            onClick={siguiente}
            {...rem("Siguiente paso", false)}
            className="bbva-boton rounded-sm border border-naranja bg-naranja px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-blanco transition hover:bg-rojo"
          >
            Siguiente paso →
          </button>
        )}
        <button
          type="button"
          onClick={alternar}
          aria-pressed={pasoAPaso}
          {...rem("Paso a paso", pasoAPaso)}
          className={
            "bbva-boton rounded-sm border px-3 py-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] transition " +
            (pasoAPaso ? "border-tinta bg-tinta text-blanco" : "border-grafito/30 bg-blanco/70 text-grafito hover:border-naranja hover:text-naranja")
          }
        >
          Paso a paso
        </button>
      </div>
    </div>
  );
}

// --- Registro ------------------------------------------------------------------------

export const ILUS_B: Partial<Record<IlusId, React.ComponentType>> = {
  "p08-errores": P08Errores,
  "p09-lupa": P09Lupa,
  "p10-espectro": P10Espectro,
  "p11-humano": P11Humano,
  "p12-desarme": P12Desarme,
  "p13-reclamo": P13Reclamo,
};
