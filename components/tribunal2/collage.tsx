"use client";

// Piezas del collage de la segunda charla (referencia DYNTEC): objetos
// analógicos y digitales recortados que se apoyan sobre el papel de la placa.
// Fichas de cartulina, hojas tipeadas, sellos de goma, cinta, etiquetas,
// tarjetas perforadas, monitores de época, lupa, carpeta, vaso y botella.
//
// Las medidas son en px del escenario de 1920×1080 (el deck lo escala entero).
// <Pieza> ubica un objeto y decide en qué paso del revelado aparece; si lleva
// `label`, también se puede destacar (desde el proyector o el celular de control).

import { useEffect, useId, useState, type CSSProperties, type ReactNode } from "react";
import { useRevelado } from "@/components/tribunal/revelado";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

type Estilo = CSSProperties & Record<`--${string}`, string | number>;

/** Filtros SVG del collage (tinta de sello). Una vez por página. */
export function FiltrosCollage() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <filter id="tf2-tinta" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.15" numOctaves="2" seed="7" result="ruido" />
          <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="mascara" />
          <feComposite in="SourceGraphic" in2="mascara" operator="in" result="tinta" />
          <feDisplacementMap in="tinta" in2="ruido" scale="2.2" />
        </filter>
      </defs>
    </svg>
  );
}

/**
 * Un objeto del collage. `i`: paso del revelado en que aparece (sin `i`, está
 * desde el principio). `d`: demora de la caída al entrar a la placa (ms).
 */
export function Pieza({
  i,
  label,
  x,
  y,
  w,
  h,
  r = 0,
  z,
  d = 0,
  className,
  style,
  children,
}: {
  i?: number;
  label?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  z?: number;
  d?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const { visibles, foco, alternarFoco } = useRevelado();
  const visible = i === undefined || i < visibles;
  const destacable = visible && i !== undefined && Boolean(label);
  return (
    <div
      className={cn("tf2-pieza absolute", destacable && "cursor-pointer", className)}
      style={{ left: x, top: y, width: w, height: h, rotate: r ? `${r}deg` : undefined, zIndex: z, ...style }}
      data-oculta={visible ? undefined : ""}
      data-foco={destacable && foco === i ? "" : undefined}
      data-atenuada={visible && foco !== null && foco !== i ? "" : undefined}
      onClick={destacable ? () => alternarFoco(i) : undefined}
      {...(destacable ? rem(`🔦 ${label}`, foco === i) : {})}
    >
      <div className="tf2-cae h-full" style={{ "--d": `${d}ms` } as Estilo}>
        {children}
      </div>
    </div>
  );
}

/** Lo mismo que <Pieza>, pero dentro del flujo (filas de una lista, burbujas de un chat). */
export function Paso({ i, label, className, children }: { i?: number; label?: string; className?: string; children: ReactNode }) {
  const { visibles, foco, alternarFoco } = useRevelado();
  const visible = i === undefined || i < visibles;
  const destacable = visible && i !== undefined && Boolean(label);
  return (
    <div
      className={cn("tf2-pieza relative", destacable && "cursor-pointer", className)}
      data-oculta={visible ? undefined : ""}
      data-foco={destacable && foco === i ? "" : undefined}
      data-atenuada={visible && foco !== null && foco !== i ? "" : undefined}
      onClick={destacable ? () => alternarFoco(i) : undefined}
      {...(destacable ? rem(`🔦 ${label}`, foco === i) : {})}
    >
      {children}
    </div>
  );
}

/** Marca de birome roja sobre unas palabras (subrayado ondulado): aparece en su paso, aunque el texto corte de línea. */
export function Circulo({ i, children }: { i: number; children: ReactNode }) {
  const { visibles } = useRevelado();
  return (
    <span className="tf2-subraya" data-on={i < visibles ? "" : undefined}>
      {children}
    </span>
  );
}

/** Texto que se tipea al aparecer (una vez, rápido), con cursor mientras escribe. */
export function Tipeo({ texto, i, ms = 900, className }: { texto: string; i?: number; ms?: number; className?: string }) {
  const { visibles } = useRevelado();
  const visible = i === undefined || i < visibles;
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!visible) return;
    const paso = Math.max(8, ms / Math.max(1, texto.length));
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setN(k);
      if (k >= texto.length) clearInterval(id);
    }, paso);
    return () => {
      clearInterval(id);
      setN(0);
    };
  }, [visible, texto, ms]);
  const hecho = visible ? n : 0;
  return (
    <span className={className}>
      <span className={cn(hecho < texto.length && visible && "tf2-cursor")}>{texto.slice(0, hecho)}</span>
      <span className="invisible">{texto.slice(hecho)}</span>
    </span>
  );
}

// --- Papeles -----------------------------------------------------------------------------------------

/** Ficha de cartulina rayada (renglón rojo arriba), texto a máquina. */
export function Ficha({
  rotulo,
  children,
  tono = "crema",
  tam = 28,
  className,
  style,
}: {
  rotulo?: ReactNode;
  children?: ReactNode;
  tono?: "crema" | "hoja" | "salvia" | "azul";
  tam?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const fondo = { crema: "bg-tf2-crema", hoja: "bg-tf2-hoja", salvia: "bg-tf2-salvia-claro", azul: "bg-tf2-azul-claro" }[tono];
  const paso = Math.round(tam * 1.6);
  return (
    <div
      className={cn("tf2-objeto tf2-renglones relative rounded-[3px] px-7 pb-5", fondo, className)}
      style={{ "--cab": "58px", "--paso": `${paso}px`, ...style } as Estilo}
    >
      <p className={cn("tf2-rotulo flex h-[58px] items-center text-[15px] text-tf2-rojo", fondo)}>{rotulo}</p>
      <div className="tf2-mono pt-[6px] text-tf2-tinta" style={{ fontSize: tam, lineHeight: `${paso}px` }}>
        {children}
      </div>
    </div>
  );
}

/** Hoja de papel (documento, borrador, salida impresa). */
export function Hoja({ children, className, style, doblez }: { children?: ReactNode; className?: string; style?: CSSProperties; doblez?: boolean }) {
  return (
    <div
      className={cn("tf2-objeto tf2-hoja-papel relative rounded-[2px] p-8 text-tf2-tinta", className)}
      style={{ ...(doblez ? { clipPath: "polygon(0 0, calc(100% - 44px) 0, 100% 44px, 100% 100%, 0 100%)" } : {}), ...style }}
    >
      {doblez && <span className="absolute right-0 top-0 size-[44px] bg-tf2-linea" style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }} />}
      {children}
    </div>
  );
}

/** Renglón de texto simulado (documentos sin contenido inventado). */
export function Renglon({ w = "100%", tono = "gris", className }: { w?: number | string; tono?: "gris" | "rojo" | "ocre"; className?: string }) {
  const c = { gris: "bg-tf2-tinta/15", rojo: "bg-tf2-rojo/35", ocre: "bg-tf2-ocre/40" }[tono];
  return <span className={cn("block h-[12px] rounded-full", c, className)} style={{ width: w }} />;
}

/** Tira de cinta adhesiva que "sostiene" un objeto. */
export function Cinta({ x, y, w = 130, r = -6 }: { x: number | string; y: number | string; w?: number; r?: number }) {
  return <span className="tf2-cinta pointer-events-none absolute z-10 block h-[34px]" style={{ left: x, top: y, width: w, rotate: `${r}deg` }} />;
}

/** Sello de goma (tinta irregular). */
export function Sello({
  children,
  tono = "rojo",
  tam = 24,
  redondo,
  className,
  style,
  d = 0,
}: {
  children: ReactNode;
  tono?: "rojo" | "azul" | "musgo" | "tinta";
  tam?: number;
  redondo?: boolean;
  className?: string;
  style?: CSSProperties;
  d?: number;
}) {
  const color = { rojo: "text-tf2-rojo", azul: "text-tf2-azul", musgo: "text-tf2-musgo", tinta: "text-tf2-tinta" }[tono];
  return (
    <span
      className={cn("tf2-sello tf2-estampa inline-block whitespace-nowrap px-4 py-1.5 leading-none", color, redondo ? "rounded-full" : "rounded-[4px]", className)}
      style={{ fontSize: tam, "--d": `${d}ms`, ...style } as Estilo}
    >
      {children}
    </span>
  );
}

/** Etiqueta colgante de cartón, con ojal e hilo. */
export function Etiqueta({ children, className, tono = "kraft" }: { children: ReactNode; className?: string; tono?: "kraft" | "crema" }) {
  return (
    <div
      className={cn("tf2-objeto relative py-4 pl-14 pr-6", tono === "kraft" ? "bg-tf2-kraft" : "bg-tf2-crema", className)}
      style={{ clipPath: "polygon(28px 0, 100% 0, 100% 100%, 28px 100%, 0 50%)" }}
    >
      <span className="absolute left-[22px] top-1/2 size-[14px] -translate-y-1/2 rounded-full bg-tf2-papel shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]" />
      <div className="tf2-mono text-[22px] leading-snug text-tf2-tinta">{children}</div>
    </div>
  );
}

/** Anotación a mano (birome roja o azul), con flecha opcional. */
export function Mano({
  children,
  tono = "rojo",
  tam = 46,
  flecha,
  className,
  style,
}: {
  children: ReactNode;
  tono?: "rojo" | "azul" | "tinta";
  tam?: number;
  flecha?: "izq" | "der" | "abajo" | "arriba";
  className?: string;
  style?: CSSProperties;
}) {
  const color = { rojo: "text-tf2-rojo", azul: "text-tf2-azul", tinta: "text-tf2-tinta" }[tono];
  const rot = { izq: 180, der: 0, abajo: 90, arriba: -90 }[flecha ?? "der"];
  return (
    <span className={cn("tf2-mano inline-flex items-center gap-2 leading-[0.95]", color, className)} style={{ fontSize: tam, ...style }}>
      {flecha === "izq" && <FlechaMano rot={rot} />}
      <span>{children}</span>
      {flecha && flecha !== "izq" && <FlechaMano rot={rot} />}
    </span>
  );
}

function FlechaMano({ rot }: { rot: number }) {
  return (
    <svg viewBox="0 0 60 30" className="h-[0.7em] w-[1.4em] shrink-0" style={{ rotate: `${rot}deg` }} aria-hidden>
      <path d="M3 17 C 18 9, 34 21, 52 14" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M42 6 L 54 14 L 43 23" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Objetos de época ------------------------------------------------------------------------------------

/** Monitor de época con pantalla de fósforo claro (sin fondo oscuro). */
export function Monitor({ children, className, pie = true, rotulo }: { children: ReactNode; className?: string; pie?: boolean; rotulo?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="tf2-objeto w-full rounded-[22px] border border-[#cfc4ad] bg-[#e7dfcd] p-[22px] pb-[30px]">
        <div className="tf2-pantalla tf2-mono relative min-h-[120px] rounded-[12px] p-6 text-[24px] leading-[1.45] text-tf2-musgo">{children}</div>
        <div className="mt-3 flex items-center justify-between px-2">
          <span className="tf2-rotulo text-[12px] text-tf2-gris">{rotulo ?? "terminal · 1984"}</span>
          <span className="flex gap-2">
            <span className="size-[10px] rounded-full bg-tf2-salvia" />
            <span className="size-[10px] rounded-full bg-[#cfc4ad]" />
          </span>
        </div>
      </div>
      {pie && (
        <>
          <div className="h-[34px] w-[26%] bg-[#d9cfba]" style={{ clipPath: "polygon(18% 0, 82% 0, 100% 100%, 0 100%)" }} />
          <div className="tf2-objeto h-[16px] w-[44%] rounded-[6px] bg-[#e1d8c4]" />
        </>
      )}
    </div>
  );
}

/** Burbuja de chat dentro de una pantalla. */
export function Burbuja({ de, children, className }: { de: "persona" | "ia"; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex", de === "persona" ? "justify-end" : "justify-start", className)}>
      <div
        className={cn(
          "max-w-[88%] rounded-[16px] px-4 py-2.5 text-[21px] leading-snug",
          de === "persona" ? "rounded-br-[4px] bg-tf2-azul text-white" : "rounded-bl-[4px] border border-tf2-musgo/25 bg-white/70 text-tf2-tinta",
        )}
      >
        {children}
      </div>
    </div>
  );
}

/** Tarjeta perforada (IBM, 80 columnas): las perforaciones codifican el texto, como en el programa literal. */
export function Perforada({ texto, className, w = 620 }: { texto: string; className?: string; w?: number }) {
  const cols = 44;
  const h = Math.round(w / 2.2);
  const letras = texto.toUpperCase().padEnd(cols, " ").slice(0, cols);
  // Código Hollerith simplificado: zona (12/11/0) + dígito.
  const agujeros = (c: string): number[] => {
    if (c === " ") return [];
    if (/[0-9]/.test(c)) return [Number(c) + 2];
    const k = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(c);
    if (k < 0) return [0, 9];
    if (k < 9) return [0, k + 3];
    if (k < 18) return [1, k - 9 + 3];
    return [2, k - 18 + 4];
  };
  const fila = (h - 46) / 12;
  const col = (w - 40) / cols;
  return (
    <div className={cn("tf2-objeto relative bg-[#ece0c3]", className)} style={{ width: w, height: h, clipPath: "polygon(22px 0, 100% 0, 100% 100%, 0 100%, 0 22px)" }}>
      <p className="tf2-mono absolute left-[34px] top-[6px] text-[13px] tracking-[0.42em] text-tf2-grafito">{letras.trimEnd()}</p>
      {Array.from({ length: 10 }, (_, f) => (
        <p key={f} className="tf2-mono absolute left-[20px] flex text-[9px] text-tf2-azul/60" style={{ top: 30 + (f + 2) * fila }}>
          {Array.from({ length: cols }, (_, k) => (
            <span key={k} className="text-center" style={{ width: col }}>
              {f}
            </span>
          ))}
        </p>
      ))}
      {[...letras].map((c, k) =>
        agujeros(c).map((f) => (
          <span key={`${k}-${f}`} className="absolute rounded-[1px] bg-tf2-tinta/85" style={{ left: 20 + k * col + col * 0.28, top: 30 + f * fila, width: col * 0.44, height: fila * 0.72 }} />
        )),
      )}
    </div>
  );
}

/** Teléfono estilizado (avisos de actividad). */
export function Telefono({ children, className, w = 330 }: { children: ReactNode; className?: string; w?: number }) {
  return (
    <div className={cn("tf2-objeto relative rounded-[52px] bg-tf2-tinta p-[13px]", className)} style={{ width: w, height: w * 2.02 }}>
      <div className="tf2-papel relative h-full overflow-hidden rounded-[40px]">
        <span className="absolute left-1/2 top-[12px] z-10 h-[24px] w-[92px] -translate-x-1/2 rounded-full bg-tf2-tinta" />
        <div className="h-full px-6 pb-6 pt-[52px]">{children}</div>
      </div>
    </div>
  );
}

/** Texto circular: SOLO en las placas de curva (11, 16, 22 y 27). Marca al expositor que sintetiza y gira. */
export function TextoCircular({ texto, radio = 230, tam = 25, className }: { texto: string; radio?: number; tam?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const m = tam + 8;
  const lado = (radio + m) * 2;
  const c = radio + m;
  return (
    <svg viewBox={`0 0 ${lado} ${lado}`} width={lado} height={lado} className={cn("tf2-giro-entra overflow-visible", className)} aria-label={texto}>
      <defs>
        <path id={id} d={`M ${c - radio},${c} a ${radio},${radio} 0 1,1 ${radio * 2},0 a ${radio},${radio} 0 1,1 -${radio * 2},0`} />
      </defs>
      <circle cx={c} cy={c} r={radio - tam * 0.9} fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1.5" strokeDasharray="2 7" />
      <text className="tf2-mono" fill="currentColor" fontSize={tam} fontWeight={500} letterSpacing="0.06em">
        <textPath href={`#${id}`} textLength={Math.PI * 2 * radio * 0.985} lengthAdjust="spacing">
          {`${texto.toUpperCase()} · `}
        </textPath>
      </text>
    </svg>
  );
}

/** Traza de cobre de circuito (conecta objetos: el argumento, no la decoración). */
export function Traza({ d, w, h, demora = 0, className }: { d: string; w: number; h: number; demora?: number; className?: string }) {
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={cn("pointer-events-none absolute left-0 top-0 overflow-visible", className)} aria-hidden>
      <path d={d} pathLength={600} fill="none" stroke="var(--color-tf2-cobre)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="tf2-traza" style={{ "--d": `${demora}ms` } as Estilo} />
    </svg>
  );
}

// --- Objetos cotidianos (SVG recortados) -------------------------------------------------------------

export function Vaso({ w = 200, agua = 0.55, className }: { w?: number; agua?: number; className?: string }) {
  const nivel = 40 + (1 - agua) * 200;
  return (
    <svg viewBox="0 0 200 280" width={w} className={cn("tf2-recorte", className)} aria-hidden>
      <defs>
        <clipPath id="tf2-vaso">
          <path d="M22 20 L178 20 L160 262 Q158 272 148 272 L52 272 Q42 272 40 262 Z" />
        </clipPath>
      </defs>
      <path d="M22 20 L178 20 L160 262 Q158 272 148 272 L52 272 Q42 272 40 262 Z" fill="rgba(213,222,226,0.55)" />
      <g clipPath="url(#tf2-vaso)">
        <rect x="0" y={nivel} width="200" height="280" fill="rgba(74,99,120,0.32)" />
        <path d={`M0 ${nivel} Q 50 ${nivel - 6} 100 ${nivel} T 200 ${nivel}`} fill="none" stroke="rgba(74,99,120,0.6)" strokeWidth="3" />
      </g>
      <path d="M22 20 L178 20 L160 262 Q158 272 148 272 L52 272 Q42 272 40 262 Z" fill="none" stroke="#4a463e" strokeWidth="3.5" />
      <path d="M46 40 L60 240" stroke="#fff" strokeOpacity="0.8" strokeWidth="7" strokeLinecap="round" />
      <ellipse cx="100" cy="20" rx="78" ry="7" fill="none" stroke="#4a463e" strokeWidth="3" />
    </svg>
  );
}

export function Botella({ w = 130, className }: { w?: number; className?: string }) {
  return (
    <svg viewBox="0 0 130 420" width={w} className={cn("tf2-recorte", className)} aria-hidden>
      <rect x="44" y="4" width="42" height="34" rx="6" fill="#4f5e4b" />
      <path d="M48 38 L82 38 L84 92 Q118 118 118 160 L118 392 Q118 414 96 414 L34 414 Q12 414 12 392 L12 160 Q12 118 46 92 Z" fill="rgba(213,222,226,0.6)" stroke="#4a463e" strokeWidth="3.5" />
      <path d="M14 230 L116 230 L116 392 Q116 412 96 412 L34 412 Q14 412 14 392 Z" fill="rgba(74,99,120,0.3)" />
      <rect x="12" y="200" width="106" height="92" fill="#f5efe2" stroke="#4a463e" strokeWidth="2" />
      <text x="65" y="252" textAnchor="middle" className="tf2-mono" fontSize="19" fill="#ad422c" letterSpacing="3">AGUA</text>
      <path d="M30 130 L30 380" stroke="#fff" strokeOpacity="0.7" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}

export function Lupa({ w = 220, className }: { w?: number; className?: string }) {
  return (
    <svg viewBox="0 0 220 220" width={w} className={cn("tf2-recorte", className)} aria-hidden>
      <circle cx="88" cy="88" r="70" fill="rgba(213,222,226,0.45)" stroke="#4a463e" strokeWidth="12" />
      <circle cx="88" cy="88" r="70" fill="none" stroke="#857f72" strokeWidth="3" />
      <path d="M50 62 Q 62 44 84 40" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <path d="M140 140 L200 200" stroke="#ae6c3c" strokeWidth="24" strokeLinecap="round" />
      <path d="M140 140 L156 156" stroke="#4a463e" strokeWidth="26" strokeLinecap="round" />
    </svg>
  );
}

export function Clip({ w = 46, className, style }: { w?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 46 120" width={w} className={cn("pointer-events-none absolute z-10", className)} style={style} aria-hidden>
      <path d="M30 32 L30 96 Q30 112 18 112 Q6 112 6 96 L6 20 Q6 6 20 6 Q34 6 34 20 L34 88 Q34 96 26 96 Q18 96 18 88 L18 34" fill="none" stroke="#857f72" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** Carpeta de expediente (cartón con solapa y cinta). */
export function Carpeta({ w = 420, rotulo, children, className }: { w?: number; rotulo?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("relative", className)} style={{ width: w }}>
      <div className="h-[40px] w-[42%] rounded-t-[10px] bg-[#c3a77b]" />
      <div className="tf2-objeto relative rounded-b-[6px] rounded-tr-[6px] bg-tf2-kraft p-7" style={{ minHeight: w * 0.72 }}>
        {rotulo && <p className="tf2-rotulo text-[15px] text-tf2-grafito">{rotulo}</p>}
        <span className="absolute inset-y-0 left-1/2 w-[18px] -translate-x-1/2 bg-tf2-rojo/70" />
        {children}
      </div>
    </div>
  );
}

/** Lomo de libro (biblioteca: normas, doctrina, jurisprudencia, precedentes). */
export function Lomo({ titulo, tono, alto = 380, ancho = 92 }: { titulo: string; tono: string; alto?: number; ancho?: number }) {
  return (
    <div className="tf2-objeto relative flex items-center justify-center rounded-[4px]" style={{ background: tono, height: alto, width: ancho }}>
      <span className="absolute inset-x-[10px] top-[20px] h-[3px] bg-white/45" />
      <span className="absolute inset-x-[10px] bottom-[20px] h-[3px] bg-white/45" />
      <span className="tf2-mono whitespace-nowrap text-[22px] font-medium uppercase tracking-[0.2em] text-white/95" style={{ writingMode: "vertical-rl", rotate: "180deg" }}>
        {titulo}
      </span>
    </div>
  );
}

/** Máquina de escribir (de frente, línea simple): la escritura humana del collage. */
export function Maquina({ w = 420, className, hoja }: { w?: number; className?: string; hoja?: ReactNode }) {
  return (
    <div className={cn("relative", className)} style={{ width: w }}>
      {hoja && (
        <div className="tf2-objeto tf2-hoja-papel relative mx-auto -mb-[60px] w-[70%] px-5 pb-[70px] pt-5" style={{ minHeight: w * 0.42 }}>
          {hoja}
        </div>
      )}
      <svg viewBox="0 0 420 230" width={w} className="tf2-recorte relative" aria-hidden>
        <rect x="40" y="10" width="340" height="34" rx="16" fill="#4f5e4b" />
        <circle cx="30" cy="27" r="16" fill="#4a463e" />
        <circle cx="390" cy="27" r="16" fill="#4a463e" />
        <path d="M30 70 Q 30 50 60 50 L360 50 Q 390 50 390 70 L410 196 Q 412 220 388 220 L32 220 Q 8 220 10 196 Z" fill="#7c8b76" stroke="#4a463e" strokeWidth="3" />
        <path d="M110 64 L310 64 L300 100 L120 100 Z" fill="#4a463e" opacity="0.85" />
        {[0, 1, 2].map((f) =>
          Array.from({ length: 10 - f }, (_, k) => <circle key={`${f}-${k}`} cx={92 + f * 14 + k * 26} cy={126 + f * 28} r="10" fill="#f5efe2" stroke="#4a463e" strokeWidth="2.5" />),
        )}
        <rect x="140" y="190" width="140" height="16" rx="8" fill="#f5efe2" stroke="#4a463e" strokeWidth="2.5" />
      </svg>
    </div>
  );
}

/** Tarjeta con el QR para entrar (cinta arriba). */
export function TarjetaQr({ qr, link, w = 300, className }: { qr: string; link: string; w?: number; className?: string }) {
  return (
    <div className={cn("relative", className)} style={{ width: w }}>
      <Cinta x="34%" y={-16} w={110} r={-4} />
      <div className="tf2-objeto rounded-[6px] bg-white p-5">
        <img src={qr} alt="Código QR para entrar a la clase" className="w-full" />
        <p className="tf2-mono mt-3 break-all text-center text-[17px] leading-tight text-tf2-tinta">{link}</p>
      </div>
    </div>
  );
}
