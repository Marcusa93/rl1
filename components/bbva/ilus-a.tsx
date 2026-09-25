"use client";

// Ilustraciones de las placas 01–06 del Laboratorio BBVA.
// Collage editorial sobre papel ("arqueología contemporánea del trabajo"):
// el protagonista es el trabajo — correos, planillas, agendas, post-its —,
// nunca la IA. Cada componente llena su contenedor (SVG con viewBox) y escala
// con la placa. La 03 lee resultados en vivo; la 06 es interactiva (rem).

import { useId, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { BBVA_ACTIVIDADES, BBVA_AREAS, type AreaId, type IlusId, type ResultadosBbva } from "@/lib/bbva-clase";
import { porc, suma, useResultadosBbva } from "@/components/bbva/use-resultados";
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

const TIT: CSSProperties = { fontFamily: "var(--font-archivo), system-ui, sans-serif", fontStretch: "68%", fontWeight: 800 };
const SERIF: CSSProperties = { fontFamily: "var(--font-instrument), Georgia, serif", fontStyle: "italic" };
const SERIF_R: CSSProperties = { fontFamily: "var(--font-instrument), Georgia, serif" };
const MANO: CSSProperties = { fontFamily: "var(--font-caveat), cursive", fontWeight: 600 };
const MONO: CSSProperties = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" };
const SANS: CSSProperties = { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" };

/** Ancho aproximado (en em) de un texto en la titular condensada en mayúsculas. */
const anchoTit = (s: string) => s.length * 0.5;

// --- Piezas comunes del collage -----------------------------------------------------

/** Filtros y degradés compartidos (prefijo único por ilustración).
 *  `grano`: frecuencia de la textura del sello (más bajo = manchas más grandes). */
function Defs({ p, grano = 0.5 }: { p: string; grano?: number }) {
  return (
    <defs>
      <filter id={`${p}-sombra`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="7" stdDeviation="7" floodColor="#2a200c" floodOpacity="0.26" />
      </filter>
      <filter id={`${p}-sombra-chica`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#2a200c" floodOpacity="0.28" />
      </filter>
      {/* Tinta de sello: la textura come algunos puntos de la tinta. */}
      <filter id={`${p}-tinta`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency={grano} numOctaves={grano < 0.3 ? 3 : 2} seed="7" result="ruido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -7 5.45" result="mascara" />
        <feComposite in="SourceGraphic" in2="mascara" operator="in" />
      </filter>
      <linearGradient id={`${p}-postit`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7d465" />
        <stop offset="1" stopColor={K.ambar} />
      </linearGradient>
    </defs>
  );
}

const url = (p: string, n: string) => `url(#${p}-${n})`;

/** La entrada .bbva-cae rota y escala: en SVG, alrededor del centro de la pieza. */
const CAE: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

/** Prefijo único para los ids de <defs>: si la misma ilustración aparece dos veces
 *  (o una copia queda oculta), cada una usa sus propios filtros. */
function usePrefijo(base: string) {
  return `${base}${useId().replace(/[^\w-]/g, "")}`;
}

/** Pieza del collage: se apoya en (x, y), rotada `rot` grados, y cae con retraso `d` (s). */
function Pieza({ x, y, rot = 0, d = 0, children }: { x: number; y: number; rot?: number; d?: number; children: ReactNode }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="bbva-cae" style={{ animationDelay: `${d}s`, ...CAE }}>
        {children}
      </g>
    </g>
  );
}

/** Trazo a mano que se dibuja solo (flechas, subrayados, tachaduras). */
function Traza({
  d,
  largo,
  delay = 0,
  color = K.naranja,
  ancho = 3,
  opacidad = 1,
}: {
  d: string;
  largo: number;
  delay?: number;
  color?: string;
  ancho?: number;
  opacidad?: number;
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={ancho}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={opacidad}
      className="bbva-traza"
      style={{ ["--largo" as string]: largo, animationDelay: `${delay}s` } as CSSProperties}
    />
  );
}

/** Cinta adhesiva semitransparente. */
function Cinta({ x, y, w = 58, h = 17, rot = 0 }: { x: number; y: number; w?: number; h?: number; rot?: number }) {
  return (
    <rect
      x={-w / 2}
      y={-h / 2}
      width={w}
      height={h}
      transform={`translate(${x} ${y}) rotate(${rot})`}
      fill="rgba(236, 226, 196, 0.8)"
      stroke="rgba(120, 100, 60, 0.12)"
      strokeWidth={0.8}
    />
  );
}

/** Post-it con la esquina levemente doblada (centrado en 0,0). */
function Postit({ p, w, h, children }: { p: string; w: number; h: number; children?: ReactNode }) {
  const x = -w / 2;
  const y = -h / 2;
  return (
    <g>
      <path d={`M${x} ${y} H${-x} V${-y - 13} L${-x - 13} ${-y} H${x} Z`} fill={url(p, "postit")} filter={url(p, "sombra-chica")} />
      <path d={`M${-x} ${-y - 13} L${-x - 13} ${-y} L${-x - 11} ${-y - 11} Z`} fill="#d9a92f" />
      <rect x={x} y={y} width={w} height={9} fill="#000" opacity={0.035} />
      {children}
    </g>
  );
}

/** Flecha del mouse con la punta en (0,0). */
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

/** Clip de metal (vertical, centrado arriba en 0,0). */
function Clip() {
  return (
    <path
      d="M3 30 V-1 a6 6 0 0 1 12 0 V35 a9 9 0 0 1 -18 0 V3"
      fill="none"
      stroke="#8f959d"
      strokeWidth={2.4}
      strokeLinecap="round"
    />
  );
}

/** Parte un texto en renglones de hasta `max` caracteres. */
function partir(texto: string, max: number): string[] {
  const out: string[] = [];
  let linea = "";
  for (const w of texto.split(" ")) {
    const prueba = linea ? `${linea} ${w}` : w;
    if (prueba.length > max && linea) {
      out.push(linea);
      linea = w;
    } else linea = prueba;
  }
  if (linea) out.push(linea);
  return out;
}

// ============================================================================
// PLACA 01 · ¿Qué hiciste ayer? — la mesa de trabajo, desordenada.
// (La placa 20 vuelve a esta misma mesa, ordenada en un flujo.)
// ============================================================================

const MAILS = [
  { de: "Atención al Cliente", hora: "09:12", asunto: "RE: Reclamo cliente #48213", nuevo: true, hilo: 3 },
  { de: "Mesa de Ayuda IT", hora: "08:47", asunto: "Informe semanal de incidentes", nuevo: true, adjunto: true },
  { de: "Operaciones · Altas", hora: "08:15", asunto: "Solicitud de alta — falta documentación", nuevo: false },
  { de: "Riesgos · Comité", hora: "Ayer", asunto: "Minuta reunión riesgos", nuevo: false },
  { de: "Canales Digitales", hora: "Ayer", asunto: "RV: Consulta derivada desde sucursal", nuevo: false },
];

function Notebook({ p }: { p: string }) {
  // Pantalla: 352 × 203 con origen en (-176, -167).
  const ox = -176;
  const oy = -167;
  const filas = 5;
  const cols = 13;
  return (
    <g>
      {/* base con teclado (abierta a 180°, vista desde arriba) */}
      <rect x={-192} y={48} width={384} height={176} rx={13} fill="#d7dade" stroke="#bfc3c9" strokeWidth={1} filter={url(p, "sombra")} />
      <rect x={-170} y={62} width={340} height={98} rx={6} fill="#c4c8ce" />
      {Array.from({ length: filas }, (_, f) =>
        Array.from({ length: cols }, (_, c) => {
          if (f === 4 && c > 4 && c < 9) return null;
          const ancho = f === 4 && c === 4 ? 23.6 * 5 + 3 * 4 : 23.6;
          return <rect key={`${f}-${c}`} x={-167 + c * 26.2} y={65 + f * 19} width={ancho} height={16} rx={2.6} fill="#2d2f34" />;
        }),
      )}
      <rect x={-64} y={168} width={128} height={48} rx={7} fill="#cfd3d8" stroke="#b8bcc2" strokeWidth={1} />
      {/* bisagra y pantalla */}
      <rect x={-186} y={40} width={372} height={10} rx={3} fill="#3a3d43" />
      <rect x={-186} y={-176} width={372} height={222} rx={12} fill="#24262b" filter={url(p, "sombra")} />
      <circle cx={0} cy={-171.5} r={1.6} fill="#55585f" />
      <g transform={`translate(${ox} ${oy})`}>
        <rect width={352} height={205} fill={K.blanco} />
        {/* barra de título */}
        <rect width={352} height={16} fill="#ebe8e1" />
        {[8, 16, 24].map((cx) => (
          <circle key={cx} cx={cx} cy={8} r={2.6} fill={K.niebla} />
        ))}
        <text x={176} y={11} textAnchor="middle" style={SANS} fontSize={7.5} fill={K.grafito}>
          Correo — Recibidos
        </text>
        {/* barra lateral */}
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
        {/* lista de correos */}
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
                <path
                  d={`M${333} ${y + 25} v-7 a2.6 2.6 0 0 1 5.2 0 v8 a3.8 3.8 0 0 1 -7.6 0 v-6`}
                  fill="none"
                  stroke={K.gris}
                  strokeWidth={1}
                  strokeLinecap="round"
                />
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

function Documento({ p }: { p: string }) {
  // 204 × 286, centrado. Renglones: barras grises de ancho variable.
  const renglones = [168, 150, 162, 120, 0, 166, 158, 140, 164, 90, 0, 160, 152, 132];
  return (
    <g>
      <rect x={-102} y={-143} width={204} height={286} fill={K.blanco} filter={url(p, "sombra")} />
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
      {renglones.map((w, i) =>
        w ? <rect key={i} x={-84} y={-62 + i * 9} width={w} height={3.2} rx={1} fill="#cfd1d4" /> : null,
      )}
      {/* resaltado a mano */}
      <rect x={-86} y={-19} width={170} height={8} fill={K.naranja} opacity={0.28} transform="rotate(-0.6)" />
      <rect x={-86} y={-10} width={146} height={8} fill={K.naranja} opacity={0.28} transform="rotate(0.4)" />
      {/* sección con casillas */}
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
      {/* nota al margen en lápiz rojo */}
      <path d="M-90 78 C-94 84, -94 92, -90 96" fill="none" stroke={K.rojo} strokeWidth={1.6} strokeLinecap="round" />
      <text x={30} y={92} style={MANO} fontSize={15} fill={K.rojo} transform="rotate(-8 30 92)">
        ¿y el DNI?
      </text>
      {/* aro de café */}
      <g opacity={0.3}>
        <circle cx={46} cy={-40} r={27} fill="none" stroke="#7a4a24" strokeWidth={3.2} strokeDasharray="70 6 40 4 50 3" />
        <circle cx={47.5} cy={-39} r={24.5} fill="none" stroke="#7a4a24" strokeWidth={1} strokeDasharray="30 10 60 8" />
      </g>
      {/* clip */}
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

function Planilla({ p }: { p: string }) {
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
      <rect x={-136} y={-81} width={272} height={162} fill={K.blanco} filter={url(p, "sombra")} />
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
      {/* círculo a mano sobre el pendiente */}
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

function Agenda({ p }: { p: string }) {
  const y9 = -46;
  const paso = 19;
  return (
    <g>
      <rect x={-88} y={-124} width={176} height={248} fill={K.blanco} filter={url(p, "sombra")} />
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

/** Burbujas del chat, ya ubicadas (y) y medidas (ancho, alto). */
const BURBUJAS = CHAT.reduce<{ yo: boolean; lineas: string[]; y: number; ancho: number; alto: number }[]>((acc, m) => {
  const previa = acc[acc.length - 1];
  const y = previa ? previa.y + previa.alto + 6 : -62;
  const alto = 7 + m.lineas.length * 9.2;
  const ancho = Math.max(...m.lineas.map((l) => l.length)) * 3.55 + 12;
  return [...acc, { ...m, y, ancho, alto }];
}, []);

function Celular({ p }: { p: string }) {
  return (
    <g>
      <rect x={-58} y={-118} width={116} height={236} rx={17} fill="#1d1f23" filter={url(p, "sombra")} />
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

function Taza({ p }: { p: string }) {
  return (
    <g>
      <path d="M29 12 C50 12, 56 32, 38 36" fill="none" stroke="#e3ded3" strokeWidth={9} strokeLinecap="round" />
      <path d="M29 12 C50 12, 56 32, 38 36" fill="none" stroke={K.blanco} strokeWidth={5.6} strokeLinecap="round" />
      <circle r={37} fill={K.blanco} stroke="#e3ded3" strokeWidth={1.6} filter={url(p, "sombra")} />
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

function P01Escritorio() {
  const p = usePrefijo("a01");
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Una mesa de trabajo vista desde arriba: la notebook con la bandeja de correo, un procedimiento subrayado, una planilla, la agenda de ayer llena de reuniones, el celular con mensajes, una taza de café y post-its."
    >
      <Defs p={p} />
      <Pieza x={668} y={162} rot={6} d={0.15}>
        <Documento p={p} />
      </Pieza>
      <Pieza x={112} y={170} rot={-6} d={0.05}>
        <Agenda p={p} />
      </Pieza>
      <Pieza x={176} y={470} rot={-4} d={0.25}>
        <Planilla p={p} />
      </Pieza>
      <Pieza x={384} y={298} rot={-3} d={0.35}>
        <Notebook p={p} />
      </Pieza>
      <Pieza x={662} y={428} rot={12} d={0.5}>
        <Celular p={p} />
      </Pieza>
      <Pieza x={748} y={300} d={0.6}>
        <Taza p={p} />
      </Pieza>
      <Pieza x={330} y={62} rot={15} d={0.7}>
        <Lapicera />
      </Pieza>
      <Pieza x={214} y={140} rot={-9} d={0.9}>
        <Postit p={p} w={104} h={92}>
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
      </Pieza>
      <Pieza x={60} y={372} rot={7} d={1.05}>
        <Postit p={p} w={96} h={88}>
          <text x={-36} y={-10} style={MANO} fontSize={20} fill={K.tinta}>
            revisar
          </text>
          <text x={-36} y={14} style={MANO} fontSize={20} fill={K.tinta}>
            lote 14 !!
          </text>
          <path d="M-36 21 C-14 24, 10 19, 30 22" fill="none" stroke={K.rojo} strokeWidth={1.6} strokeLinecap="round" />
        </Postit>
      </Pieza>
    </svg>
  );
}

// ============================================================================
// PLACA 02 · Tu cargo no me sirve — la credencial y los verbos alrededor.
// ============================================================================

function P02Credencial() {
  const p = usePrefijo("a02");
  const v0 = 1.25; // los verbos entran después de la tachadura
  const paso = 0.24;
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Una credencial corporativa con el cargo tachado en rojo. Alrededor, los verbos del trabajo: leer, buscar, comparar, responder, revisar, decidir, clasificar."
    >
      <Defs p={p} />
      {/* cinta de la credencial */}
      <g className="bbva-cae" style={{ animationDelay: "0.05s", ...CAE }}>
        <path d="M318 -4 L340 -4 L401 108 L391 112 Z" fill={K.pizarra2} />
        <path d="M482 -4 L460 -4 L399 108 L409 112 Z" fill="#33424f" />
        <path d="M329 -4 L396 110" stroke={K.cielo} strokeWidth={1} strokeOpacity={0.45} strokeDasharray="3 4" />
        <path d="M471 -4 L404 110" stroke={K.cielo} strokeWidth={1} strokeOpacity={0.35} strokeDasharray="3 4" />
        <circle cx={400} cy={116} r={8} fill="none" stroke="#9aa0a8" strokeWidth={3.2} />
        <rect x={389} y={122} width={22} height={20} rx={3} fill="#b9bdc3" stroke="#9aa0a8" strokeWidth={1} />
      </g>
      <Pieza x={400} y={302} rot={-3} d={0.1}>
        <rect x={-108} y={-170} width={216} height={340} rx={12} fill={K.blanco} stroke="#e2ddd3" strokeWidth={1} filter={url(p, "sombra")} />
        <rect x={-18} y={-160} width={36} height={8} rx={4} fill={K.papel2} stroke="#d6d0c4" strokeWidth={0.8} />
        <path d="M-108 -140 H108 V-102 H-108 Z" fill={K.pizarra2} />
        <text x={-92} y={-117} style={MONO} fontSize={8} letterSpacing={1.2} fill={K.blanco}>
          CREDENCIAL DE ACCESO
        </text>
        <text x={92} y={-117} textAnchor="end" style={MONO} fontSize={7} fill={K.cielo}>
          N.º 04821
        </text>
        {/* foto genérica */}
        <rect x={-46} y={-88} width={92} height={106} fill="#dfe2e6" />
        <circle cx={0} cy={-48} r={20} fill="#aab1bb" />
        <path d="M-40 18 C-38 -12, -18 -18, 0 -18 C18 -18, 38 -12, 40 18 Z" fill="#aab1bb" />
        {/* campos */}
        <text x={-86} y={38} style={MONO} fontSize={7} letterSpacing={1} fill={K.gris}>
          NOMBRE
        </text>
        <rect x={-86} y={44} width={118} height={8} rx={2} fill="#d9dbdf" />
        <rect x={36} y={44} width={40} height={8} rx={2} fill="#d9dbdf" />
        <text x={-86} y={74} style={MONO} fontSize={7} letterSpacing={1} fill={K.gris}>
          CARGO
        </text>
        <text x={-86} y={94} style={TIT} fontSize={17} fill={K.tinta}>
          ANALISTA SR. DE
        </text>
        <text x={-86} y={113} style={TIT} fontSize={17} fill={K.tinta}>
          OPERACIONES Y CONTROL
        </text>
        <Traza d="M-94 90 C-50 84, 10 92, 40 86 C60 83, 80 84, 94 80" largo={220} delay={0.75} color={K.rojo} ancho={4.2} opacidad={0.92} />
        <Traza d="M-94 110 C-40 104, 20 112, 96 103" largo={220} delay={0.95} color={K.rojo} ancho={4.2} opacidad={0.92} />
        <g className="bbva-cae" style={{ animationDelay: "1.1s", ...CAE }}>
          <text x={-88} y={150} style={MANO} fontSize={19} fill={K.rojo} transform="rotate(-4 -88 150)">
            ¿y qué hacés?
          </text>
        </g>
        {/* código de barras */}
        {[0, 3, 5, 9, 11, 12, 16, 19, 21, 24, 27, 28, 31, 35, 37, 40, 42, 45].map((x, i) => (
          <rect key={x} x={34 + x} y={138} width={i % 3 === 0 ? 2.4 : 1.3} height={20} fill={K.tinta} />
        ))}
      </Pieza>

      {/* LEER — recorte blanco con cinta */}
      <Pieza x={136} y={104} rot={-6} d={v0}>
        <rect x={-68} y={-34} width={136} height={68} fill={K.blanco} filter={url(p, "sombra-chica")} />
        <text x={0} y={16} textAnchor="middle" style={TIT} fontSize={46} fill={K.tinta}>
          LEER
        </text>
        <Cinta x={-50} y={-32} rot={-28} w={48} />
      </Pieza>
      {/* BUSCAR — cinta rotuladora */}
      <Pieza x={654} y={96} rot={4} d={v0 + paso}>
        <rect x={-80} y={-22} width={160} height={44} rx={5} fill={K.tinta} filter={url(p, "sombra-chica")} />
        <rect x={-80} y={-22} width={160} height={3} fill="#fff" opacity={0.12} />
        <text x={0} y={9} textAnchor="middle" style={MONO} fontSize={25} fontWeight={700} letterSpacing={5} fill={K.blanco}>
          BUSCAR
        </text>
      </Pieza>
      {/* COMPARAR — a mano, en naranja */}
      <Pieza x={138} y={282} rot={-4} d={v0 + paso * 2}>
        <text x={0} y={10} textAnchor="middle" style={MANO} fontSize={54} fill={K.naranja}>
          comparar
        </text>
        <Traza d="M-78 24 C-30 30, 30 20, 80 25" largo={180} delay={v0 + paso * 2 + 0.3} ancho={3} />
        <Traza d="M-70 33 C-20 38, 30 30, 70 34" largo={160} delay={v0 + paso * 2 + 0.45} ancho={2} />
      </Pieza>
      {/* RESPONDER — sello */}
      <Pieza x={662} y={258} rot={-8} d={v0 + paso * 3}>
        <g filter={url(p, "tinta")} opacity={0.94}>
          <rect x={-104} y={-32} width={208} height={64} rx={5} fill="none" stroke={K.rojo} strokeWidth={4} />
          <rect x={-96} y={-24} width={192} height={48} rx={3} fill="none" stroke={K.rojo} strokeWidth={1.4} />
          <text x={0} y={12.5} textAnchor="middle" style={TIT} fontSize={35} letterSpacing={3} fill={K.rojo}>
            RESPONDER
          </text>
        </g>
      </Pieza>
      {/* REVISAR — post-it */}
      <Pieza x={666} y={402} rot={5} d={v0 + paso * 4}>
        <Postit p={p} w={138} h={112}>
          <text x={-50} y={6} style={MANO} fontSize={38} fill={K.tinta}>
            revisar
          </text>
          <Traza d="M-44 24 L-34 36 L-10 14" largo={60} delay={v0 + paso * 4 + 0.4} color={K.rojo} ancho={3.4} />
        </Postit>
      </Pieza>
      {/* DECIDIR — recorte de cartón */}
      <Pieza x={140} y={448} rot={3} d={v0 + paso * 5}>
        <rect x={-96} y={-36} width={192} height={72} fill={K.carton} filter={url(p, "sombra-chica")} />
        <text x={0} y={16} textAnchor="middle" style={TIT} fontSize={46} fill={K.tinta}>
          DECIDIR
        </text>
        <Cinta x={80} y={-30} rot={32} w={46} />
      </Pieza>
      {/* CLASIFICAR — carpeta */}
      <Pieza x={636} y={508} rot={-2} d={v0 + paso * 6}>
        <rect x={-92} y={-38} width={176} height={60} fill={K.blanco} transform="rotate(-3)" filter={url(p, "sombra-chica")} />
        <path d="M-104 -22 V-36 Q-104 -40 -100 -40 H-44 Q-40 -40 -37 -36 L-30 -24 H104 V34 H-104 Z" fill={K.pizarra} filter={url(p, "sombra-chica")} />
        <text x={0} y={16} textAnchor="middle" style={TIT} fontSize={31} fill={K.blanco}>
          CLASIFICAR
        </text>
      </Pieza>
    </svg>
  );
}

// ============================================================================
// PLACA 03 · Trabajos distintos. Operaciones parecidas. — datos en vivo (act. 1).
// Áreas alrededor, operaciones más elegidas en el centro, y líneas que muestran
// qué operaciones eligió cada área.
// ============================================================================

const ACT1 = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a1")!;
const OPCIONES_A1 = ACT1.items[0].opciones;
const OPS_DEFECTO = ["leer", "buscar", "comparar", "clasificar", "decidir", "redactar"];
const CONEX_DEFECTO: Record<AreaId, string[]> = {
  comercial: ["leer", "redactar"],
  operaciones: ["clasificar", "comparar"],
  riesgos: ["comparar", "decidir"],
  it: ["buscar", "clasificar"],
  ia: ["decidir", "buscar"],
  otro: ["leer", "redactar"],
};

const NUBE = { cx: 600, cy: 232, rx: 468, ry: 184 };
const ANGULO: Record<AreaId, number> = { comercial: -125, operaciones: -55, riesgos: 0, it: 55, ia: 125, otro: 180 };
/** Lugares del centro, del más elegido al sexto. */
const LUGARES = [
  { x: 0, y: -4, maxW: 290, maxF: 70 },
  { x: -236, y: -62, maxW: 210, maxF: 50 },
  { x: 238, y: -58, maxW: 210, maxF: 50 },
  { x: -228, y: 74, maxW: 210, maxF: 48 },
  { x: 232, y: 76, maxW: 210, maxF: 48 },
  { x: 0, y: 96, maxW: 220, maxF: 40 },
];

function posArea(id: AreaId) {
  const a = (ANGULO[id] * Math.PI) / 180;
  return { x: NUBE.cx + NUBE.rx * Math.cos(a), y: NUBE.cy + NUBE.ry * Math.sin(a) };
}

interface Palabra {
  id: string;
  label: string;
  n: number;
  x: number;
  y: number;
  f: number;
  areas: number;
}

function armarNube(data: ResultadosBbva | null) {
  const conteo = data?.items?.ops ?? {};
  const elegidas = OPCIONES_A1.map((o, i) => ({ o, i, n: conteo[o.id] ?? 0 }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, 6);
  const vivo = elegidas.length > 0;
  const max = vivo ? elegidas[0].n : 1;
  const porArea = data?.itemsPorArea ?? {};

  const base = vivo
    ? elegidas.map((e) => ({ id: e.o.id, label: e.o.label, n: e.n }))
    : OPS_DEFECTO.map((id) => ({ id, label: OPCIONES_A1.find((o) => o.id === id)?.label ?? id, n: 0 }));

  const palabras: Palabra[] = base.map((b, i) => {
    const l = LUGARES[i];
    const porCantidad = vivo ? l.maxF * (0.5 + 0.5 * Math.sqrt(b.n / max)) : 42;
    const f = Math.min(porCantidad, l.maxW / anchoTit(b.label));
    const areas = vivo ? BBVA_AREAS.filter((a) => (porArea[a.id]?.ops?.[b.id] ?? 0) > 0).length : 0;
    return { ...b, x: NUBE.cx + l.x, y: NUBE.cy + l.y, f, areas };
  });

  // La operación compartida por más áreas (si la comparten al menos dos).
  const compartida = vivo
    ? [...palabras].sort((a, b) => b.areas - a.areas || b.n - a.n).find((p) => p.areas >= 2)?.id
    : undefined;

  // Conexiones: cada área → sus dos operaciones más elegidas entre las que se ven.
  const visibles = new Set(palabras.map((p) => p.id));
  const conexiones: { area: AreaId; op: string; n: number }[] = [];
  for (const a of BBVA_AREAS) {
    if (vivo) {
      const suyas = porArea[a.id]?.ops ?? {};
      Object.entries(suyas)
        .filter(([op, n]) => visibles.has(op) && n > 0)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 2)
        .forEach(([op, n]) => conexiones.push({ area: a.id, op, n }));
    } else {
      CONEX_DEFECTO[a.id].forEach((op) => conexiones.push({ area: a.id, op, n: 1 }));
    }
  }
  const maxConex = Math.max(1, ...conexiones.map((c) => c.n));
  const respuestas = data?.respondieron ?? 0;
  return { vivo, palabras, compartida, conexiones, maxConex, respuestas };
}

function NubeOperaciones({ data }: { data: ResultadosBbva | null }) {
  const p = usePrefijo("a03");
  const { vivo, palabras, compartida, conexiones, maxConex, respuestas } = armarNube(data);
  const donde = new Map(palabras.map((w) => [w.id, w]));
  return (
    <svg
      viewBox="0 0 1200 460"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={`Las áreas del grupo alrededor y, en el centro, las operaciones más elegidas: ${palabras.map((w) => w.label).join(", ")}.`}
    >
      <Defs p={p} />
      <g className="bbva-cae" style={{ animationDelay: "0.05s", ...CAE }}>
        <ellipse cx={NUBE.cx} cy={NUBE.cy} rx={NUBE.rx} ry={NUBE.ry} fill="none" stroke={K.gris} strokeOpacity={0.4} strokeWidth={1.2} strokeDasharray="2 7" strokeLinecap="round" />
      </g>

      {/* conexiones área → operación */}
      <g>
        {conexiones.map((c) => {
          const a = posArea(c.area);
          const w = donde.get(c.op);
          if (!w) return null;
          const mx = (a.x + w.x) / 2;
          const my = (a.y + w.y) / 2;
          const qx = mx + (NUBE.cx - mx) * 0.3;
          const qy = my + (NUBE.cy - my) * 0.3;
          const destacada = c.op === compartida;
          return (
            <path
              key={`${c.area}-${c.op}`}
              d={`M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${qx.toFixed(1)} ${qy.toFixed(1)} ${w.x.toFixed(1)} ${w.y.toFixed(1)}`}
              fill="none"
              stroke={destacada ? K.naranja : K.grafito}
              strokeOpacity={vivo ? (destacada ? 0.75 : 0.42) : 0.2}
              strokeWidth={vivo ? 1.1 + 2.6 * (c.n / maxConex) : 1.2}
              strokeDasharray={vivo ? undefined : "4 6"}
              strokeLinecap="round"
              style={{ transition: "stroke-width 0.8s, stroke-opacity 0.8s" }}
            />
          );
        })}
      </g>

      {/* operaciones en el centro */}
      {palabras.map((w, i) => {
        const destacada = w.id === compartida;
        return (
          <g key={w.id} style={{ transform: `translate(${w.x}px, ${w.y}px)`, transition: "transform 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
            <g className="bbva-cae" style={{ animationDelay: `${0.5 + i * 0.1}s` }}>
              <text
                y={w.f * 0.36}
                textAnchor="middle"
                style={{ ...TIT, fontSize: w.f, transition: "font-size 0.9s cubic-bezier(0.2, 0.8, 0.2, 1)" }}
                fill={destacada ? K.naranja : vivo ? K.tinta : K.grafito}
                stroke={K.papel}
                strokeWidth={9}
                strokeLinejoin="round"
                paintOrder="stroke"
              >
                {w.label.toUpperCase()}
              </text>
              {vivo &&
                (destacada ? (
                  <text y={w.f * 0.36 + 24} textAnchor="middle" style={MANO} fontSize={21} fill={K.naranja} stroke={K.papel} strokeWidth={6} paintOrder="stroke">
                    {w.n} · la eligieron {w.areas} áreas
                  </text>
                ) : (
                  <text y={w.f * 0.36 + 17} textAnchor="middle" style={MONO} fontSize={12} fill={K.gris} stroke={K.papel} strokeWidth={5} paintOrder="stroke">
                    {w.n}
                  </text>
                ))}
            </g>
          </g>
        );
      })}

      {/* áreas alrededor */}
      {BBVA_AREAS.map((a, i) => {
        const { x, y } = posArea(a.id);
        const label = a.label.toUpperCase();
        const w = Math.max(150, anchoTit(label) * 19 + 40);
        const n = data?.porArea?.[a.id] ?? 0;
        const rot = [-2, 1.5, -1, 2, -1.5, 1][i];
        return (
          <Pieza key={a.id} x={x} y={y} rot={rot} d={0.1 + i * 0.07}>
            <g opacity={data && n === 0 ? 0.5 : 1} style={{ transition: "opacity 0.8s" }}>
              <rect x={-w / 2} y={-29} width={w} height={58} fill={K.blanco} filter={url(p, "sombra-chica")} />
              <rect x={-w / 2} y={-29} width={5} height={58} fill={K.pizarra} />
              <text x={-w / 2 + 18} y={data ? -3 : 6.5} style={TIT} fontSize={19} fill={K.tinta}>
                {label}
              </text>
              {data && (
                <text x={-w / 2 + 18} y={17} style={MONO} fontSize={11} fill={K.gris}>
                  {n} {n === 1 ? "conectado" : "conectados"}
                </text>
              )}
            </g>
          </Pieza>
        );
      })}

      <text x={1188} y={452} textAnchor="end" style={MONO} fontSize={11} letterSpacing={1.2} fill={K.gris}>
        {vivo ? `ACTIVIDAD 1 · ${respuestas} ${respuestas === 1 ? "RESPUESTA" : "RESPUESTAS"}` : "EJEMPLO · TODAVÍA NO HAY RESPUESTAS"}
      </text>
    </svg>
  );
}

function P03Operaciones() {
  const { data } = useResultadosBbva("bbva_a1", 4000);
  return <NubeOperaciones data={data} />;
}

// ============================================================================
// PLACA 04 · ¿Dónde perdés tiempo? — la misma ventana, una y otra vez.
// ============================================================================

function Ventana({ p, n, frente }: { p: string; n: number; frente: boolean }) {
  return (
    <g>
      <rect x={-186} y={-118} width={372} height={236} rx={7} fill={K.blanco} stroke="#d6d1c6" strokeWidth={1} filter={url(p, "sombra-chica")} />
      <path d="M-186 -111 Q-186 -118 -179 -118 H179 Q186 -118 186 -111 V-96 H-186 Z" fill="#ece8e0" />
      {[-172, -162, -152].map((cx) => (
        <circle key={cx} cx={cx} cy={-107} r={3} fill={K.niebla} />
      ))}
      <text x={-138} y={-103.5} style={SANS} fontSize={9.5} fill={K.grafito}>
        Su solicitud N.º {n} — Mensaje nuevo
      </text>
      {frente && (
        <g>
          <text x={-170} y={-78} style={SANS} fontSize={9} fill={K.gris}>
            Para:
          </text>
          <text x={-128} y={-78} style={SANS} fontSize={9} fill={K.tinta}>
            Cliente N.º {n}
          </text>
          <line x1={-170} x2={170} y1={-70} y2={-70} stroke={K.niebla} strokeWidth={0.8} />
          <text x={-170} y={-56} style={SANS} fontSize={9} fill={K.gris}>
            Asunto:
          </text>
          <text x={-128} y={-56} style={SANS} fontSize={9} fontWeight={600} fill={K.tinta}>
            Su solicitud N.º {n}
          </text>
          <line x1={-170} x2={170} y1={-48} y2={-48} stroke={K.niebla} strokeWidth={0.8} />
          <g style={SANS} fontSize={11} fill={K.tinta}>
            <text x={-170} y={-26}>
              Estimado cliente:
            </text>
            <text x={-170} y={-8}>
              Le informamos que su solicitud N.º{" "}
              <tspan fill={K.naranja} fontWeight={700}>
                {n}
              </tspan>{" "}
              se
            </text>
            <text x={-170} y={8}>
              encuentra en análisis. Le responderemos dentro
            </text>
            <text x={-170} y={24}>
              de las próximas 48 h hábiles.
            </text>
            <text x={-170} y={46}>
              Saludos cordiales,
            </text>
            <text x={-170} y={62} fill={K.grafito}>
              Equipo de Atención al Cliente
            </text>
          </g>
          <rect x={-170} y={80} width={60} height={22} rx={11} fill={K.pizarra2} />
          <text x={-140} y={94.5} textAnchor="middle" style={SANS} fontSize={9.5} fontWeight={600} fill={K.blanco}>
            Enviar
          </text>
          <rect x={-100} y={80} width={98} height={22} rx={4} fill="none" stroke={K.niebla} strokeWidth={1} />
          <text x={-92} y={94.5} style={SANS} fontSize={8.6} fill={K.grafito}>
            Plantilla 03
          </text>
          <path d="M-18 89 L-14 93 L-10 89" fill="none" stroke={K.grafito} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
          <g transform="translate(-121 95)">
            <Cursor escala={1.1} />
          </g>
        </g>
      )}
    </g>
  );
}

function Tecla({ w, children }: { w: number; children: ReactNode }) {
  return (
    <g>
      <rect x={0} y={0} width={w} height={56} rx={9} fill="#dcd6ca" stroke="#b9b2a4" strokeWidth={1} />
      <rect x={4} y={3} width={w - 8} height={44} rx={7} fill={K.blanco} stroke="#e4dfd5" strokeWidth={1} />
      {children}
    </g>
  );
}

/** Palotes: grupos de cinco (cuatro verticales y una cruzada). */
const PALOTES = (() => {
  const trazos: string[] = [];
  const total = 17;
  for (let i = 0; i < total; i++) {
    const g = Math.floor(i / 5);
    const k = i % 5;
    const x0 = g * 54;
    if (k < 4) {
      const x = x0 + k * 10 + (i % 3) * 0.8;
      trazos.push(`M${x} ${2 + (i % 2) * 2} L${x + 1.5 - (i % 2)} ${46 - (i % 3)}`);
    } else {
      trazos.push(`M${x0 - 6} ${34} L${x0 + 38} ${12}`);
    }
  }
  return trazos;
})();

function P04Repeticion() {
  const p = usePrefijo("a04");
  const ventanas = 7;
  const base = 48213;
  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="La misma ventana de correo repetida siete veces, un mail casi idéntico para cada solicitud, las teclas Ctrl C y Ctrl V, palotes contando repeticiones y la anotación: esto es un patrón."
    >
      <Defs p={p} />
      {Array.from({ length: ventanas }, (_, i) => (
        <Pieza key={i} x={36 + i * 24 + 186} y={26 + i * 21 + 118} d={0.05 + i * 0.09}>
          <Ventana p={p} n={base + i} frente={i === ventanas - 1} />
        </Pieza>
      ))}

      {/* enviados: correos casi idénticos */}
      <Pieza x={248} y={484} rot={-1.5} d={0.85}>
        <rect x={-214} y={-60} width={428} height={120} fill={K.blanco} filter={url(p, "sombra")} />
        <text x={-198} y={-40} style={MONO} fontSize={8} letterSpacing={1.2} fill={K.gris}>
          ENVIADOS · HOY
        </text>
        <text x={198} y={-40} textAnchor="end" style={MONO} fontSize={8} fill={K.gris}>
          23 mensajes
        </text>
        {[0, 1, 2, 3].map((k) => {
          const y = -22 + k * 22;
          return (
            <g key={k}>
              <line x1={-198} x2={198} y1={y - 12} y2={y - 12} stroke={K.niebla} strokeWidth={0.7} />
              <text x={-198} y={y + 2} style={SANS} fontSize={9} fill={K.gris}>
                <tspan fontWeight={700} fill={K.tinta}>
                  Su solicitud N.º {base + 3 + k}
                </tspan>
                {"  —  Estimado cliente: le informamos que su solicitud…"}
              </text>
              <text x={198} y={y + 2} textAnchor="end" style={MONO} fontSize={7.6} fill={K.gris}>
                11:{String(2 + k * 6).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </Pieza>

      {/* palotes y "¿otra vez?" */}
      <g transform="translate(600 46)">
        {PALOTES.map((d, i) => (
          <Traza key={i} d={d} largo={60} delay={0.9 + i * 0.07} color={K.grafito} ancho={3} />
        ))}
      </g>
      <Pieza x={668} y={130} rot={-5} d={2.1}>
        <text x={0} y={0} textAnchor="middle" style={MANO} fontSize={28} fill={K.grafito}>
          ¿otra vez?
        </text>
      </Pieza>

      {/* anotación: esto es un patrón */}
      <Traza d="M606 236 C590 204, 586 174, 566 150" largo={110} delay={2.4} ancho={3} />
      <Traza d="M566 150 L563 166 M566 150 L579 158" largo={40} delay={2.9} ancho={3} />
      <Pieza x={604} y={250} rot={-5} d={2.5}>
        <text x={0} y={16} style={MANO} fontSize={38} fill={K.naranja}>
          esto es
        </text>
        <text x={14} y={52} style={MANO} fontSize={38} fill={K.naranja}>
          un patrón
        </text>
      </Pieza>

      {/* Ctrl + C / Ctrl + V */}
      <Pieza x={588} y={350} rot={-4} d={1.2}>
        <Tecla w={70}>
          <text x={35} y={30} textAnchor="middle" style={MONO} fontSize={15} fill={K.tinta}>
            Ctrl
          </text>
        </Tecla>
        <text x={84} y={34} textAnchor="middle" style={MONO} fontSize={18} fill={K.grafito}>
          +
        </text>
        <g transform="translate(98 0)">
          <Tecla w={56}>
            <text x={28} y={33} textAnchor="middle" style={TIT} fontSize={26} fill={K.tinta}>
              C
            </text>
          </Tecla>
        </g>
      </Pieza>
      <Pieza x={596} y={432} rot={3} d={1.4}>
        <Tecla w={70}>
          <text x={35} y={30} textAnchor="middle" style={MONO} fontSize={15} fill={K.tinta}>
            Ctrl
          </text>
        </Tecla>
        <text x={84} y={34} textAnchor="middle" style={MONO} fontSize={18} fill={K.grafito}>
          +
        </text>
        <g transform="translate(98 0)">
          <Tecla w={56}>
            <text x={28} y={33} textAnchor="middle" style={TIT} fontSize={26} fill={K.tinta}>
              V
            </text>
          </Tecla>
        </g>
        <text x={162} y={38} style={MANO} fontSize={26} fill={K.naranja}>
          ×37
        </text>
      </Pieza>
    </svg>
  );
}

// ============================================================================
// PLACA 05 · ¿Esto se lo darías a una IA? — SÍ · NO · DEPENDE, gigantes.
// ============================================================================

function P05SiNo() {
  const p = usePrefijo("a05");
  return (
    <svg
      viewBox="0 0 1200 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Tres respuestas posibles, en grande: Sí, No, Depende."
    >
      <Defs p={p} grano={0.16} />
      {/* SÍ — recorte de papel, en tinta */}
      <Pieza x={336} y={150} rot={-4} d={0.1}>
        <rect x={-150} y={-122} width={300} height={244} fill={K.blanco} filter={url(p, "sombra")} />
        <text x={0} y={80} textAnchor="middle" style={TIT} fontSize={232} fill={K.tinta}>
          SÍ
        </text>
        <Cinta x={-120} y={-114} rot={-34} w={70} h={20} />
      </Pieza>
      {/* NO — sello en tinta */}
      <Pieza x={820} y={152} rot={5} d={0.35}>
        <g filter={url(p, "tinta")}>
          <rect x={-160} y={-112} width={320} height={224} rx={10} fill="none" stroke={K.tinta} strokeWidth={9} />
          <rect x={-144} y={-96} width={288} height={192} rx={5} fill="none" stroke={K.tinta} strokeWidth={2.5} />
          <text x={0} y={72} textAnchor="middle" style={TIT} fontSize={206} fill={K.tinta}>
            NO
          </text>
        </g>
      </Pieza>
      {/* DEPENDE — naranja, más grande, subrayado a mano con signo de pregunta */}
      <Pieza x={566} y={414} rot={-1.5} d={0.6}>
        <text x={0} y={96} textAnchor="middle" style={TIT} fontSize={262} fill={K.naranja}>
          DEPENDE
        </text>
      </Pieza>
      <Traza d="M112 536 C300 526, 520 544, 720 530 C860 521, 960 534, 1040 526" largo={980} delay={1.1} color={K.tinta} ancho={5} />
      <g className="bbva-cae" style={{ animationDelay: "1.7s", ...CAE }}>
        <text x={1112} y={512} textAnchor="middle" style={MANO} fontSize={190} fill={K.tinta} transform="rotate(8 1112 512)">
          ?
        </text>
      </g>
    </svg>
  );
}

// ============================================================================
// PLACA 06 · "Depende" es la respuesta interesante — seis criterios que Marco
// revela cuando el grupo los nombra (desde el celular: rem).
// ============================================================================

const CRITERIOS = [
  { id: "riesgo", label: "Riesgo", pregunta: "¿qué está en juego?", x: 130, y: 94, rot: -3 },
  { id: "error", label: "Error", pregunta: "¿qué pasa si se equivoca?", x: 670, y: 94, rot: 2.5 },
  { id: "control", label: "Control", pregunta: "¿quién lo controla?", x: 112, y: 282, rot: 1.5 },
  { id: "sensibilidad", label: "Sensibilidad", pregunta: "¿hay datos sensibles?", x: 688, y: 282, rot: -2 },
  { id: "responsabilidad", label: "Responsabilidad", pregunta: "¿quién responde?", x: 136, y: 470, rot: 2 },
  { id: "revision", label: "Revisión", pregunta: "¿se puede verificar?", x: 670, y: 470, rot: -3 },
] as const;

/** Desde dónde sale cada línea (borde de la palabra DEPENDE) y adónde llega (borde de la tarjeta). */
const LINEAS: Record<string, string> = {
  riesgo: "M292 218 C270 190, 250 172, 226 152",
  error: "M508 218 C530 190, 552 172, 574 152",
  control: "M228 268 C222 270, 218 274, 214 278",
  sensibilidad: "M572 268 C578 270, 582 274, 586 278",
  responsabilidad: "M292 322 C272 352, 262 380, 246 410",
  revision: "M508 322 C530 352, 548 380, 566 410",
};

const ALTO_TARJETA = 118;
const tamTarjeta = (label: string) => Math.max(196, anchoTit(label.toUpperCase()) * 28 * 0.98 + 34);

function Tarjeta({ p, i, label, pregunta, visible }: { p: string; i: number; label: string; pregunta: string; visible: boolean }) {
  const w = tamTarjeta(label);
  const h = ALTO_TARJETA;
  const num = String(i + 1).padStart(2, "0");
  if (!visible) {
    // Dada vuelta: un post-it en blanco, todos del mismo tamaño (no delata la palabra).
    const pw = 168;
    const ph = h - 12;
    return (
      <g>
        <Postit p={p} w={pw} h={ph}>
          <text x={0} y={22} textAnchor="middle" style={MANO} fontSize={70} fill={K.grafito} opacity={0.75}>
            ?
          </text>
          <text x={-pw / 2 + 10} y={-ph / 2 + 18} style={MONO} fontSize={9} fill={K.grafito} opacity={0.6}>
            {num}
          </text>
        </Postit>
      </g>
    );
  }
  return (
    <g className="a06-voltea">
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={K.blanco} filter={url(p, "sombra-chica")} />
      <Cinta x={0} y={-h / 2 - 2} rot={-4} w={60} />
      <text x={-w / 2 + 16} y={-h / 2 + 24} style={MONO} fontSize={9} letterSpacing={1} fill={K.gris}>
        {num}
      </text>
      <text x={-w / 2 + 16} y={8} style={TIT} fontSize={28} fill={K.tinta}>
        {label.toUpperCase()}
      </text>
      <Traza d={`M${-w / 2 + 16} 18 C${-w / 2 + 50} 21, ${-w / 2 + 80} 16, ${-w / 2 + 112} 19`} largo={120} delay={0.35} ancho={3} />
      <text x={-w / 2 + 16} y={44} style={SERIF} fontSize={17} fill={K.grafito}>
        {pregunta}
      </text>
    </g>
  );
}

/** Dato en vivo de la actividad 2: el caso donde más creció el "depende". */
function useMasDepende() {
  const { data } = useResultadosBbva("bbva_a2", 4000);
  if (!data || !data.respondieron) return null;
  const act = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a2")!;
  let mejor: { rotulo: string; texto: string; pct: number; n: number } | null = null;
  for (const it of act.items) {
    const c = data.items[it.id];
    const total = suma(c);
    const n = c?.depende ?? 0;
    if (!total || !n) continue;
    const pct = porc(n, total);
    if (!mejor || pct > mejor.pct || (pct === mejor.pct && n > mejor.n)) mejor = { rotulo: it.rotulo ?? it.id, texto: it.texto, pct, n };
  }
  return mejor;
}

function P06Depende() {
  const p = usePrefijo("a06");
  const [visibles, setVisibles] = useState<Record<string, boolean>>({});
  const mas = useMasDepende();
  const todos = CRITERIOS.every((c) => visibles[c.id]);
  const alternar = (id: string) => setVisibles((v) => ({ ...v, [id]: !v[id] }));
  const alternarTodos = () => setVisibles(todos ? {} : Object.fromEntries(CRITERIOS.map((c) => [c.id, true])));
  const lineasCaso = mas ? partir(mas.texto, 40) : [];

  return (
    <svg
      viewBox="0 0 800 560"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      role="group"
      aria-label="La palabra DEPENDE en el centro y seis criterios alrededor que se revelan de a uno: riesgo, error, control, sensibilidad, responsabilidad y revisión."
    >
      <Defs p={p} />
      <style>{`
        @keyframes a06-voltea { from { transform: scaleX(0.04); opacity: 0.3; } 60% { opacity: 1; } to { transform: scaleX(1); opacity: 1; } }
        .a06-voltea { animation: a06-voltea 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) both; transform-box: fill-box; transform-origin: center; }
        @media (prefers-reduced-motion: reduce) { .a06-voltea { animation: none; } }
      `}</style>

      {/* líneas de la palabra a cada criterio revelado */}
      {CRITERIOS.map((c) =>
        visibles[c.id] ? <Traza key={c.id} d={LINEAS[c.id]} largo={140} delay={0.15} color={K.grafito} ancho={1.8} opacidad={0.7} /> : null,
      )}

      {/* DEPENDE */}
      <Pieza x={400} y={270} d={0.1}>
        <text x={0} y={32} textAnchor="middle" style={TIT} fontSize={92} fill={K.naranja}>
          DEPENDE
        </text>
      </Pieza>
      <Traza d="M244 318 C320 312, 420 322, 556 312" largo={340} delay={0.6} color={K.rojo} ancho={3.2} opacidad={0.85} />

      {/* los seis criterios */}
      {CRITERIOS.map((c, i) => (
        <Pieza key={c.id} x={c.x} y={c.y} rot={c.rot} d={0.25 + i * 0.08}>
          <g onClick={() => alternar(c.id)} style={{ cursor: "pointer" }}>
            <Tarjeta key={visibles[c.id] ? "v" : "o"} p={p} i={i} label={c.label} pregunta={c.pregunta} visible={!!visibles[c.id]} />
          </g>
        </Pieza>
      ))}

      {/* dato en vivo de la actividad 2 */}
      {mas && (
        <Pieza x={400} y={410} rot={1.2} d={0.2}>
          <rect x={-128} y={-44} width={256} height={88} fill={K.blanco} filter={url(p, "sombra-chica")} />
          <text x={-114} y={-24} style={MONO} fontSize={8.4} letterSpacing={1} fill={K.gris}>
            DONDE MÁS CRECIÓ EL «DEPENDE»
          </text>
          <text x={-114} y={4} style={TIT} fontSize={25} fill={K.tinta}>
            {mas.rotulo.toUpperCase()} ·{" "}
            <tspan fill={K.naranja}>{mas.pct}%</tspan>
          </text>
          {lineasCaso.slice(0, 2).map((l, j) => (
            <text key={j} x={-114} y={22 + j * 14} style={SERIF} fontSize={13} fill={K.grafito}>
              {j === 1 && lineasCaso.length > 2 ? `${l}…` : l}
            </text>
          ))}
        </Pieza>
      )}

      {/* control: todos */}
      <text x={400} y={548} textAnchor="middle" style={MONO} fontSize={10} letterSpacing={1.2} fill={K.gris} opacity={0.8}>
        {todos ? "↺ OCULTAR LOS SEIS" : "MOSTRAR LOS SEIS"}
      </text>

      {/* botones reales (mouse, teclado y control remoto) sobre cada tarjeta */}
      {CRITERIOS.map((c) => {
        const w = tamTarjeta(c.label);
        const visible = !!visibles[c.id];
        return (
          <foreignObject key={c.id} x={c.x - w / 2 - 4} y={c.y - ALTO_TARJETA / 2 - 6} width={w + 8} height={ALTO_TARJETA + 12}>
            <button
              type="button"
              {...rem(c.label, visible)}
              aria-pressed={visible}
              aria-label={`Criterio: ${c.label}`}
              onClick={() => alternar(c.id)}
              className="block h-full w-full cursor-pointer rounded-md bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-naranja"
            />
          </foreignObject>
        );
      })}
      <foreignObject x={300} y={532} width={200} height={24}>
        <button
          type="button"
          {...rem("Todos", todos)}
          aria-pressed={todos}
          aria-label="Todos los criterios"
          onClick={alternarTodos}
          className="block h-full w-full cursor-pointer rounded-md bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-naranja"
        />
      </foreignObject>
    </svg>
  );
}

// --- Registro --------------------------------------------------------------------------

export const ILUS_A: Partial<Record<IlusId, ComponentType>> = {
  "p01-escritorio": P01Escritorio,
  "p02-credencial": P02Credencial,
  "p03-operaciones": P03Operaciones,
  "p04-repeticion": P04Repeticion,
  "p05-sino": P05SiNo,
  "p06-depende": P06Depende,
};
