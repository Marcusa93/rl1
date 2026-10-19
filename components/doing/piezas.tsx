"use client";

// Piezas gráficas de la clase de Doing Global (/doing): la máquina de
// escribir y la interfaz de IA (dos momentos de una misma actividad), el
// comprobante bancario ficticio, hojas mecanografiadas, el texto circular de
// las placas de giro y glifos de trazo simple. Todo en rem: el deck escala.

import type { CSSProperties, ReactNode } from "react";
import { COMPROBANTES, CUENTA_DESTINO, CUENTA_ORIGEN, CASO, pesos, type Comprobante } from "@/lib/doing-caso";
import { cn } from "@/lib/utils";

export const retraso = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

// Colores en hexadecimal para los SVG (los mismos tokens de globals.css).
export const C = {
  tinta: "#22272a",
  pizarra: "#545c5f",
  niebla: "#8d938f",
  linea: "#dad0bd",
  verde: "#3e5d51",
  salvia: "#94a99b",
  salviaClaro: "#e3eadf",
  azul: "#48667f",
  azulClaro: "#e1e8ee",
  lacre: "#ad4630",
  lacreClaro: "#f4ded5",
  ocre: "#a9761f",
  ocreClaro: "#f3e4c4",
  papel: "#f2ebdf",
  hoja: "#fffcf4",
};

/** Rótulo de sección con regla a la izquierda. */
export function Rotulo({ children, className, color = "text-dg-verde" }: { children: ReactNode; className?: string; color?: string }) {
  return (
    <p className={cn("dg-rotulo flex items-center gap-3", color, className)}>
      <span className="h-px w-8 bg-current opacity-70" />
      {children}
    </p>
  );
}

/** Texto circular de las placas de giro: la señal para sintetizar y cambiar de dirección. */
export function TextoCircular({ texto, centro, className }: { texto: string; centro?: ReactNode; className?: string }) {
  const repetido = texto.repeat(Math.max(1, Math.ceil(56 / texto.length)));
  return (
    <div className={cn("relative aspect-square", className)}>
      <svg viewBox="0 0 200 200" className="dg-giro absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="dg-circulo" d="M100,100 m-82,0 a82,82 0 1,1 164,0 a82,82 0 1,1 -164,0" />
        </defs>
        <text fontSize="11.6" letterSpacing="2.2" fill={C.lacre} fontFamily="var(--font-courier), 'Courier New', monospace" fontWeight="700">
          <textPath href="#dg-circulo" textLength="510">
            {repetido}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[22%] flex items-center justify-center rounded-full border border-dg-lacre/30 bg-dg-hoja shadow-[0_18px_40px_-24px_rgba(34,39,42,0.6)]">
        {centro}
      </div>
    </div>
  );
}

/** Máquina de escribir clásica: la escritura como oficio. */
export function Maquina({ className, style, hoja }: { className?: string; style?: CSSProperties; hoja?: ReactNode }) {
  const filas = [
    { y: 128, n: 10, x0: 47 },
    { y: 143, n: 9, x0: 55 },
    { y: 158, n: 8, x0: 63 },
  ];
  return (
    <div className={cn("relative", className)} style={style}>
      <svg viewBox="0 0 240 200" className="w-full" aria-hidden>
        {/* hoja */}
        <rect x="68" y="6" width="104" height="86" rx="2" fill={C.hoja} stroke={C.linea} />
        {[22, 32, 42, 52, 62].map((y, i) => (
          <rect key={y} x="80" y={y} width={[72, 80, 64, 78, 40][i]} height="3" rx="1.5" fill={i === 4 ? C.lacre : C.tinta} opacity={i === 4 ? 0.8 : 0.35} />
        ))}
        {/* rodillo */}
        <rect x="34" y="78" width="172" height="18" rx="9" fill="#2f3538" />
        <circle cx="30" cy="87" r="9" fill="#3d4447" />
        <circle cx="210" cy="87" r="9" fill="#3d4447" />
        <rect x="206" y="70" width="20" height="5" rx="2.5" fill="#3d4447" transform="rotate(-18 216 72)" />
        {/* cuerpo */}
        <path d="M40 96 H200 L222 178 Q224 186 216 186 H24 Q16 186 18 178 Z" fill="#2f3538" />
        <path d="M58 100 H182 L190 118 H50 Z" fill="#454d50" />
        {/* cinta bicolor */}
        <circle cx="74" cy="108" r="6" fill={C.tinta} stroke="#5a6366" />
        <circle cx="166" cy="108" r="6" fill={C.lacre} stroke="#5a6366" />
        <path d="M108 104 L120 92 L132 104" fill="none" stroke="#7c8487" strokeWidth="2" />
        {/* teclas */}
        {filas.map((f) =>
          Array.from({ length: f.n }, (_, i) => (
            <g key={`${f.y}-${i}`}>
              <circle cx={f.x0 + i * 16.2} cy={f.y} r="5.6" fill={C.hoja} stroke="#5a6366" strokeWidth="1.2" />
              <circle cx={f.x0 + i * 16.2} cy={f.y} r="3.2" fill="none" stroke={C.linea} strokeWidth="0.8" />
            </g>
          )),
        )}
        <rect x="74" y="168" width="92" height="9" rx="4.5" fill={C.hoja} stroke="#5a6366" strokeWidth="1.2" />
      </svg>
      {hoja}
    </div>
  );
}

/** Interfaz contemporánea de IA (genérica, sin marcas). */
export function InterfazIA({ className, pedido, respuesta, style }: { className?: string; pedido?: string; respuesta?: ReactNode; style?: CSSProperties }) {
  return (
    <div className={cn("dg-pantalla flex flex-col overflow-hidden rounded-2xl", className)} style={style}>
      <div className="flex items-center gap-1.5 border-b border-dg-linea/70 bg-white/70 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-dg-lacre/60" />
        <span className="size-2.5 rounded-full bg-dg-ocre/60" />
        <span className="size-2.5 rounded-full bg-dg-verde/60" />
        <span className="ml-3 text-[0.75rem] text-dg-niebla">Asistente de IA</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        {pedido && <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-dg-azul-claro px-4 py-2.5 text-[0.95rem] leading-snug text-dg-tinta">{pedido}</p>}
        <div className="max-w-[92%] text-[0.92rem] leading-relaxed text-dg-tinta">
          {respuesta ?? (
            <div className="grid gap-2">
              {["96%", "88%", "92%", "60%"].map((w) => (
                <span key={w} className="dg-renglon" style={{ width: w }} />
              ))}
            </div>
          )}
        </div>
        <div className="mt-auto flex items-center gap-2 rounded-full border border-dg-linea bg-white px-4 py-2 text-[0.85rem] text-dg-niebla">
          <span className="flex-1">Escribí tu pedido…</span>
          <span className="flex size-6 items-center justify-center rounded-full bg-dg-tinta text-[0.7rem] text-white">↑</span>
        </div>
      </div>
    </div>
  );
}

/** Comprobante bancario ficticio (lo que el documento permite observar). */
export function ComprobanteVisual({
  c,
  marcarReferencia,
  compacto,
  className,
  style,
}: {
  c: Comprobante;
  marcarReferencia?: boolean;
  compacto?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const filas: [string, string][] = compacto
    ? [
        ["Fecha", c.fecha],
        ["Importe", `${pesos(c.importe)},00`],
        ["Referencia", c.referencia || "(sin referencia)"],
      ]
    : [
        ["Operación", c.operacion],
        ["Fecha y hora", `${c.fecha} ${c.hora}`],
        ["Importe", `${pesos(c.importe)},00`],
        ["Origen", CUENTA_ORIGEN],
        ["Destino", CUENTA_DESTINO],
        ["Concepto", c.concepto],
        ["Referencia", c.referencia || "(sin referencia)"],
      ];
  return (
    <div className={cn("dg-hoja relative overflow-hidden rounded-xl border border-dg-linea", compacto ? "p-3" : "p-4", className)} style={style}>
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-dg-linea pb-2">
        <span className={cn("font-semibold text-dg-azul", compacto ? "text-[0.72rem]" : "text-[0.8rem]")}>{CASO.banco}</span>
        <span className={cn("dg-maquina rounded bg-dg-azul-claro px-1.5 text-dg-azul", compacto ? "text-[0.65rem]" : "text-[0.72rem]")}>Comprobante {c.n}</span>
      </div>
      <dl className={cn("mt-2 grid grid-cols-[auto_1fr] gap-x-3", compacto ? "gap-y-0.5 text-[0.75rem]" : "gap-y-1 text-[0.82rem]")}>
        {filas.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-dg-niebla">{k}</dt>
            <dd
              className={cn(
                "dg-maquina min-w-0 truncate text-dg-tinta",
                k === "Referencia" && marcarReferencia && c.referencia.includes("397") && "dg-marca font-bold text-dg-lacre",
              )}
            >
              {v}
            </dd>
          </div>
        ))}
      </dl>
      <span className="pointer-events-none absolute -right-3 bottom-2 rotate-[-12deg] rounded border-2 border-dg-verde/40 px-2 text-[0.62rem] font-bold uppercase tracking-widest text-dg-verde/50">
        Acreditada
      </span>
    </div>
  );
}

/** Los tres comprobantes en abanico. */
export function TresComprobantes({ marcar, compacto = true, className }: { marcar?: boolean; compacto?: boolean; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      {COMPROBANTES.map((c, i) => (
        <ComprobanteVisual
          key={c.n}
          c={c}
          compacto={compacto}
          marcarReferencia={marcar}
          className="absolute w-[78%]"
          style={{ left: `${i * 11}%`, top: `${i * 24}%`, transform: `rotate(${[-3, 1.5, -1][i]}deg)`, zIndex: i }}
        />
      ))}
    </div>
  );
}

/** Hoja mecanografiada con renglones simulados (sin contenido inventado). */
export function HojaSimulada({ filas = 8, className, children, titulo }: { filas?: number; className?: string; children?: ReactNode; titulo?: boolean }) {
  const anchos = ["100%", "93%", "97%", "72%", "100%", "86%", "95%", "58%", "100%", "90%", "82%", "97%"];
  return (
    <div className={cn("dg-hoja relative rounded-lg border border-dg-linea px-5 py-5", className)}>
      {titulo !== false && <span className="dg-renglon mb-4 block h-2.5 w-2/5 bg-dg-tinta/40" />}
      <div className="grid gap-2.5">
        {Array.from({ length: filas }, (_, i) => (
          <span key={i} className="dg-renglon" style={{ width: anchos[i % anchos.length] }} />
        ))}
      </div>
      {children}
    </div>
  );
}

/** Sello de goma (aprobado, detenido, borrador). */
export function Sello({ texto, color = C.verde, className, style }: { texto: string; color?: string; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={cn("dg-maquina inline-block rounded-md border-[3px] px-3 py-1 text-center font-bold uppercase tracking-widest", className)}
      style={{ borderColor: color, color, ...style }}
    >
      {texto}
    </span>
  );
}

type G = { className?: string; style?: CSSProperties };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function GlifoPersona({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <circle cx="24" cy="16" r="7" {...trazo} strokeWidth={2.2} />
      <path d="M10 41 c0 -9 6 -14 14 -14 s14 5 14 14" {...trazo} strokeWidth={2.2} />
    </svg>
  );
}

export function GlifoEngranaje({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <circle cx="24" cy="24" r="7" {...trazo} strokeWidth={2.2} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return <path key={i} d={`M${24 + Math.cos(a) * 12} ${24 + Math.sin(a) * 12} L${24 + Math.cos(a) * 17} ${24 + Math.sin(a) * 17}`} {...trazo} strokeWidth={3.4} />;
      })}
      <circle cx="24" cy="24" r="12" {...trazo} strokeWidth={2.2} />
    </svg>
  );
}

export function GlifoPluma({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <path d="M38 6 C24 10 14 22 12 36 L18 30 C26 30 34 22 38 6z" {...trazo} strokeWidth={2.2} />
      <path d="M12 36 L8 42 M18 30 L28 18" {...trazo} strokeWidth={2.2} />
    </svg>
  );
}

export function GlifoBalanza({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <path d="M24 7 v34 M14 41 h20 M8 13 h32" {...trazo} strokeWidth={2.2} />
      <path d="M8 13 l-5 12 h10z M40 13 l-5 12 h10z" {...trazo} strokeWidth={2} />
    </svg>
  );
}

export function GlifoAlto({ className, style }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className} style={style} aria-hidden>
      <path d="M17 4 h14 l10 10 v14 l-10 10 h-14 l-10 -10 v-14z" fill="currentColor" />
      <path d="M17 18 h14 M24 18 v14" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
    </svg>
  );
}

/** Flecha horizontal con trazo animado. */
export function Flecha({ className, color = C.niebla, animada }: { className?: string; color?: string; animada?: boolean }) {
  return (
    <svg viewBox="0 0 60 16" className={className} aria-hidden>
      <path d="M2 8 H52" stroke={color} strokeWidth="2" className={animada ? "dg-flujo" : undefined} />
      <path d="M48 3 L56 8 L48 13" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
