"use client";

// Piezas gráficas comunes de la clase /unca: glifos de trazo simple
// (documentos, claves, sellos, cadenas), el texto circular de las placas de
// giro, el sello de lacre y el documento simulado. Todo en rem: el deck escala.

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const retraso = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

// Colores en hexadecimal para los SVG (los mismos tokens de globals.css).
export const C = {
  tinta: "#1d2629",
  pizarra: "#545f63",
  niebla: "#949c9c",
  linea: "#ddd4c2",
  verde: "#2c5a4b",
  salvia: "#8fa999",
  azul: "#34536b",
  cian: "#1f7891",
  hielo: "#e1ebef",
  lacre: "#a3392a",
  ocre: "#b07a1f",
  papel: "#f4efe4",
  hoja: "#fffdf8",
};

type G = { className?: string; style?: CSSProperties };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function GlifoDocumento({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <path d="M11 5 h18 l8 8 v30 h-26z M29 5 v8 h8" {...trazo} />
      <path d="M16 20 h16 M16 26 h16 M16 32 h10" {...trazo} opacity="0.5" />
    </svg>
  );
}

export function GlifoHuella({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      {[6, 10, 14, 18].map((r, i) => (
        <path key={r} d={`M${24 - r} ${30 - i} a${r} ${r + 2} 0 0 1 ${r * 2} 0 v${4 + i * 2}`} {...trazo} opacity={1 - i * 0.12} />
      ))}
      <path d="M24 28 v12" {...trazo} />
    </svg>
  );
}

export function GlifoLlave({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="15" cy="24" r="8" {...trazo} strokeWidth={2.2} />
      <circle cx="15" cy="24" r="2.6" fill="currentColor" />
      <path d="M23 24 h20 M37 24 v6 M42 24 v5" {...trazo} strokeWidth={2.2} />
    </svg>
  );
}

export function GlifoCandado({ className, style, abierto }: G & { abierto?: boolean }) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <rect x="11" y="21" width="26" height="20" rx="3" {...trazo} strokeWidth={2} />
      <path d={abierto ? "M16 21 v-6 a8 8 0 0 1 15.5 -2.5" : "M16 21 v-6 a8 8 0 0 1 16 0 v6"} {...trazo} strokeWidth={2} />
      <circle cx="24" cy="31" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function GlifoReloj({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="24" r="17" {...trazo} strokeWidth={2} />
      <path d="M24 13 v11 l7 5" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoEslabon({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <rect x="4" y="16" width="24" height="16" rx="8" {...trazo} strokeWidth={2.2} />
      <rect x="20" y="16" width="24" height="16" rx="8" {...trazo} strokeWidth={2.2} />
    </svg>
  );
}

export function GlifoCheck({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="24" r="18" {...trazo} strokeWidth={2.2} />
      <path d="M15 24.5 l6 6 l12 -13" {...trazo} strokeWidth={3} />
    </svg>
  );
}

export function GlifoCruz({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="24" r="18" {...trazo} strokeWidth={2.2} />
      <path d="M17 17 L31 31 M31 17 L17 31" {...trazo} strokeWidth={3} />
    </svg>
  );
}

export function GlifoPregunta({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="24" r="18" {...trazo} strokeWidth={2.2} strokeDasharray="4 3" />
      <path d="M19 19 c0 -6 10 -6 10 0 c0 4 -5 4 -5 9 M24 34 v0.5" {...trazo} strokeWidth={2.6} />
    </svg>
  );
}

export function GlifoPersona({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="17" r="7" {...trazo} strokeWidth={2} />
      <path d="M10 41 c0 -9 6 -14 14 -14 s14 5 14 14" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoBalanza({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <path d="M24 7 v34 M14 41 h20 M9 13 h30" {...trazo} strokeWidth={2} />
      <path d="M9 13 l-5 12 h10z M39 13 l-5 12 h10z" {...trazo} strokeWidth={1.8} />
    </svg>
  );
}

export function GlifoEngranaje({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <circle cx="24" cy="24" r="7" {...trazo} strokeWidth={2} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${24 + Math.cos(a) * 12} ${24 + Math.sin(a) * 12} L${24 + Math.cos(a) * 17} ${24 + Math.sin(a) * 17}`} {...trazo} strokeWidth={3.2} />;
      })}
      <circle cx="24" cy="24" r="12" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoInstitucion({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <path d="M6 18 L24 7 L42 18 Z M9 41 h30 M12 21 v16 M20 21 v16 M28 21 v16 M36 21 v16" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoImpresora({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <path d="M14 18 V6 h20 v12 M8 18 h32 v16 h-6 M14 34 H8 V18" {...trazo} strokeWidth={2} />
      <path d="M14 28 h20 v14 h-20z" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoOjo({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style}>
      <path d="M4 24 C10 13 17 9 24 9 S38 13 44 24 C38 35 31 39 24 39 S10 35 4 24z" {...trazo} strokeWidth={2} />
      <circle cx="24" cy="24" r="6" {...trazo} strokeWidth={2} />
    </svg>
  );
}

/** Sello de lacre: la imagen que une la historia de la confianza con la firma digital. */
export function SelloLacre({ className, letra = "F", style }: { className?: string; letra?: string; style?: CSSProperties }) {
  const ondas = Array.from({ length: 18 }, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    const r = i % 2 ? 43 : 47;
    return `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" className={className} style={style} aria-hidden>
      <polygon points={ondas} fill={C.lacre} />
      <circle cx="50" cy="50" r="33" fill="#8e2f22" />
      <circle cx="50" cy="50" r="27" fill="none" stroke="#c9604c" strokeWidth="1.5" opacity="0.8" />
      <text x="50" y="62" textAnchor="middle" fontSize="34" fontFamily="Georgia, serif" fontStyle="italic" fill="#e7a08f">
        {letra}
      </text>
    </svg>
  );
}

/** Texto circular de las placas de giro: una marca de cambio de dirección para el docente. */
export function TextoCircular({ texto, centro, className }: { texto: string; centro?: ReactNode; className?: string }) {
  const repetido = texto.repeat(Math.max(1, Math.ceil(64 / texto.length)));
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" className="uc-giro absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="uc-circulo" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text fontSize="11.2" letterSpacing="2.4" fill={C.verde} fontFamily="var(--font-geist-sans), system-ui" fontWeight="600">
          <textPath href="#uc-circulo" textLength="510">
            {repetido}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22%] flex items-center justify-center rounded-full border border-uc-verde/30 bg-uc-hoja shadow-[0_18px_40px_-24px_rgba(29,38,41,0.6)]">
        {centro}
      </div>
    </div>
  );
}

/** Documento con renglones simulados (sin contenido inventado). */
export function DocumentoSimulado({ filas = 9, className, children }: { filas?: number; className?: string; children?: ReactNode }) {
  const anchos = ["100%", "92%", "97%", "74%", "100%", "88%", "95%", "60%", "100%", "90%", "83%", "97%", "70%"];
  return (
    <div className={cn("uc-hoja relative rounded-xl border border-uc-linea px-6 py-6", className)}>
      <div className="mb-4 flex items-center justify-between">
        <span className="uc-renglon h-3 w-2/5 bg-uc-azul/60" />
        <span className="uc-renglon h-3 w-14 bg-uc-salvia/50" />
      </div>
      <div className="grid gap-3">
        {Array.from({ length: filas }, (_, i) => (
          <span key={i} className="uc-renglon" style={{ width: anchos[i % anchos.length] }} />
        ))}
      </div>
      {children}
    </div>
  );
}

/** Garabato de firma manuscrita (un trazo cualquiera: una imagen, nada que verificar). */
export function Garabato({ className, color = C.azul }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 160 50" className={className} aria-hidden>
      <path
        d="M6 34 C 16 8, 26 8, 24 30 S 40 46, 48 22 S 60 6, 64 28 S 78 44, 86 20 C 90 10, 98 12, 96 26 S 110 40, 122 18 C 128 8, 136 14, 132 26 C 128 38, 146 30, 154 22"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path d="M30 42 C 70 38, 110 40, 150 36" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

/** QR decorativo (no codifica nada): para documentos simulados. Los QR reales están en public/unca. */
export function QrDecorativo({ className, semilla = 7 }: { className?: string; semilla?: number }) {
  const n = 21;
  const celdas: [number, number][] = [];
  let x = semilla;
  for (let f = 0; f < n; f++)
    for (let c = 0; c < n; c++) {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      const ojo = (f < 7 && c < 7) || (f < 7 && c >= n - 7) || (f >= n - 7 && c < 7);
      if (!ojo && x % 7 < 3) celdas.push([f, c]);
    }
  const ojo = (f: number, c: number) => (
    <g key={`${f}-${c}`}>
      <rect x={c} y={f} width="7" height="7" fill={C.tinta} />
      <rect x={c + 1} y={f + 1} width="5" height="5" fill="#fff" />
      <rect x={c + 2} y={f + 2} width="3" height="3" fill={C.tinta} />
    </g>
  );
  return (
    <svg viewBox={`-1 -1 ${n + 2} ${n + 2}`} className={className} shapeRendering="crispEdges" aria-hidden>
      <rect x="-1" y="-1" width={n + 2} height={n + 2} fill="#fff" />
      {celdas.map(([f, c]) => (
        <rect key={`${f}-${c}`} x={c} y={f} width="1" height="1" fill={C.tinta} />
      ))}
      {ojo(0, 0)}
      {ojo(0, n - 7)}
      {ojo(n - 7, 0)}
    </svg>
  );
}

/** Huella hexadecimal partida en bloques, con los caracteres distintos marcados. */
export function Hex({ valor, contra, grande, className }: { valor: string; contra?: string; grande?: boolean; className?: string }) {
  const grupos = valor.match(/.{1,16}/g) ?? [];
  return (
    <div className={cn("uc-mono grid gap-0.5 break-all", grande ? "text-[1.35rem] leading-snug" : "text-[0.95rem] leading-snug", className)}>
      {grupos.map((g, gi) => (
        <span key={gi} className="whitespace-nowrap">
          {[...g].map((ch, ci) => {
            const i = gi * 16 + ci;
            const distinto = contra !== undefined && contra[i] !== ch;
            return (
              <span key={`${i}-${ch}`} className={cn("uc-cambio rounded-[0.15em]", distinto && "bg-uc-lacre/15 text-uc-lacre")} style={{ animationDelay: `${(i % 16) * 0.012}s` }}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
}

/** Rótulo de sección con regla a la izquierda. */
export function Rotulo({ children, className, color = "text-uc-verde" }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <p className={cn("uc-rotulo flex items-center gap-3", color, className)}>
      <span className="h-px w-8 bg-current opacity-70" />
      {children}
    </p>
  );
}
