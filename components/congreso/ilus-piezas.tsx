// Piezas comunes de las ilustraciones del Congreso ("arqueología tecnológica
// aplicada al Derecho"): papel, tinta de máquina, lápiz, resaltador, sellos,
// cinta y trazos a mano. Todo en SVG con viewBox, para que escale con la placa.
//
// Ojo con las animaciones en SVG: la clase .cg-cae/.cg-sube anima `transform`,
// y un transform de CSS pisa el atributo `transform`. Por eso la posición y la
// rotación van siempre en un <g> de afuera y la animación en uno de adentro.

import { useId, type CSSProperties, type ReactNode } from "react";
import { CG, FUENTE } from "@/components/congreso/paleta";
import { cn } from "@/lib/utils";

export { CG };

// --- Tipografías --------------------------------------------------------------------

/** Máquina de escribir / terminal / impresora (IBM Plex Mono: 0,6 em por carácter). */
export const MONO: CSSProperties = { fontFamily: FUENTE.mono, fontWeight: 400 };
export const MONO_B: CSSProperties = { fontFamily: FUENTE.mono, fontWeight: 600 };
/** Títulos de documento (Fraunces). */
export const DISPLAY: CSSProperties = {
  fontFamily: FUENTE.display,
  fontWeight: 650,
  fontVariationSettings: '"SOFT" 50, "WONK" 0, "opsz" 60',
};
export const DISPLAY_IT: CSSProperties = {
  fontFamily: FUENTE.display,
  fontStyle: "italic",
  fontWeight: 380,
  fontVariationSettings: '"SOFT" 100, "opsz" 36',
};
/** Anotaciones a mano (Caveat). */
export const MANO: CSSProperties = { fontFamily: FUENTE.mano, fontWeight: 600 };
export const MANO_B: CSSProperties = { fontFamily: FUENTE.mano, fontWeight: 700 };
/** Interfaces contemporáneas. */
export const SANS: CSSProperties = { fontFamily: FUENTE.sans, fontWeight: 450 };
export const SANS_B: CSSProperties = { fontFamily: FUENTE.sans, fontWeight: 650 };

/** Ancho de un carácter de la mono, para ubicar resaltados y círculos sobre el texto. */
export const cm = (fs: number) => fs * 0.6;

// --- Utilidades ------------------------------------------------------------------------

/** Prefijo único para los ids de <defs> (la placa puede montar dos copias). */
export function usePrefijo(base: string): string {
  return `${base}${useId().replace(/[^\w-]/g, "")}`;
}

export const url = (p: string, n: string) => `url(#${p}-${n})`;

/** Estilos en línea con variables CSS (--largo, --dx…). */
export const vars = (o: Record<string, string | number>): CSSProperties => o as CSSProperties;

export const retraso = (s: number): CSSProperties => ({ animationDelay: `${s}s` });

/** La entrada .cg-cae escala y rota: en SVG, alrededor del centro de la pieza. */
export const CAE: CSSProperties = { transformBox: "fill-box", transformOrigin: "center" };

const r1 = (n: number) => Math.round(n * 10) / 10;

type Pt = [number, number];

/** Curva suave que pasa por los puntos (Catmull-Rom → Bézier). */
export function suave(pts: Pt[]): string {
  if (pts.length < 2) return "";
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** Óvalo a mano alrededor de una palabra: no cierra justo, se pasa un poco. */
export function ovalo(cx: number, cy: number, rx: number, ry: number, inicio = -2.7, vueltas = 1.1): string {
  const n = 26;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = inicio + (i / n) * vueltas * Math.PI * 2;
    const k = 1 + 0.03 * Math.sin(3 * t + 1) + 0.07 * (i / n);
    pts.push([cx + rx * k * Math.cos(t), cy + ry * k * Math.sin(t)]);
  }
  return suave(pts);
}

/** Subrayado a mano, apenas ondulado. */
export function onda(x1: number, x2: number, y: number, amp = 2.2, paso = 26): string {
  const n = Math.max(2, Math.round((x2 - x1) / paso));
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x1 + ((x2 - x1) * i) / n;
    const s = i === 0 || i === n ? 0 : i % 2 ? amp : -amp;
    pts.push([x, y + s + (i / n) * 1.5]);
  }
  return suave(pts);
}

/** Rectángulo a mano: cuatro trazos que se pasan en las esquinas. */
export function rectMano(x: number, y: number, w: number, h: number, j = 4): string {
  return [
    `M${r1(x - j)} ${r1(y + 1.2)} L${r1(x + w + j * 0.6)} ${r1(y - 0.8)}`,
    `M${r1(x + w - 0.6)} ${r1(y - j * 0.7)} L${r1(x + w + 1)} ${r1(y + h + j * 0.5)}`,
    `M${r1(x + w + j * 0.7)} ${r1(y + h + 0.4)} L${r1(x - j * 0.4)} ${r1(y + h - 1)}`,
    `M${r1(x + 0.8)} ${r1(y + h + j * 0.6)} L${r1(x - 0.8)} ${r1(y - j)}`,
  ].join(" ");
}

/** Rombo a mano (decisión de un diagrama de flujo), centrado en (cx, cy). */
export function romboMano(cx: number, cy: number, hw: number, hh: number): string {
  return [
    `M${r1(cx - hw - 3)} ${r1(cy + 2)} L${r1(cx + 1)} ${r1(cy - hh - 1)}`,
    `L${r1(cx + hw + 2)} ${r1(cy + 1)}`,
    `L${r1(cx - 1)} ${r1(cy + hh + 2)}`,
    `L${r1(cx - hw + 2)} ${r1(cy - 3)}`,
  ].join(" ");
}

/** Flecha a mano de (x1,y1) a (x2,y2); `curva` desplaza el control hacia la normal. */
export function flecha(x1: number, y1: number, x2: number, y2: number, curva = 0, cab = 13) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const cx = mx + (-dy / len) * curva;
  const cy = my + (dx / len) * curva;
  const a = Math.atan2(y2 - cy, x2 - cx);
  const h1: Pt = [x2 + cab * Math.cos(a + Math.PI - 0.46), y2 + cab * Math.sin(a + Math.PI - 0.46)];
  const h2: Pt = [x2 + cab * Math.cos(a + Math.PI + 0.42), y2 + cab * Math.sin(a + Math.PI + 0.42)];
  return {
    cuerpo: `M${r1(x1)} ${r1(y1)} Q${r1(cx)} ${r1(cy)} ${r1(x2)} ${r1(y2)}`,
    cabeza: `M${r1(h1[0])} ${r1(h1[1])} L${r1(x2)} ${r1(y2)} L${r1(h2[0])} ${r1(h2[1])}`,
  };
}

/** Punta de flecha en (x, y) apuntando con ángulo `a` (radianes). */
export function punta(x: number, y: number, a: number, cab = 13): string {
  const h1: Pt = [x + cab * Math.cos(a + Math.PI - 0.46), y + cab * Math.sin(a + Math.PI - 0.46)];
  const h2: Pt = [x + cab * Math.cos(a + Math.PI + 0.42), y + cab * Math.sin(a + Math.PI + 0.42)];
  return `M${r1(h1[0])} ${r1(h1[1])} L${r1(x)} ${r1(y)} L${r1(h2[0])} ${r1(h2[1])}`;
}

/** Parte un texto en renglones de hasta `max` caracteres. */
export function partir(texto: string, max: number): string[] {
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

// --- Animaciones propias (prefijo ilx-) ------------------------------------------------

const ESTILO = `
.ilx-pinta{transform-box:fill-box;transform-origin:0 50%;animation:ilx-pinta .8s cubic-bezier(.3,.7,.2,1) both}
@keyframes ilx-pinta{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.ilx-sella{transform-box:fill-box;transform-origin:center;animation:ilx-sella .45s cubic-bezier(.2,.9,.3,1.25) both}
@keyframes ilx-sella{from{opacity:0;transform:scale(1.45)}to{opacity:1;transform:scale(1)}}
.ilx-baja{animation:ilx-baja 2.6s cubic-bezier(.25,.8,.25,1) both}
@keyframes ilx-baja{from{opacity:0;transform:translateY(-160px)}25%{opacity:1}to{opacity:1;transform:translateY(0)}}
.ilx-izq{animation:ilx-izq .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes ilx-izq{from{opacity:0;transform:translateX(-60px)}to{opacity:1;transform:translateX(0)}}
.ilx-der{animation:ilx-der .9s cubic-bezier(.2,.8,.2,1) both}
@keyframes ilx-der{from{opacity:0;transform:translateX(60px)}to{opacity:1;transform:translateX(0)}}
.ilx-vuela{transform-box:fill-box;transform-origin:center;animation:ilx-vuela 1.05s cubic-bezier(.55,0,.3,1) both}
@keyframes ilx-vuela{0%{opacity:0;transform:translate(0,0) scale(1)}16%{opacity:.9}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.72)}}
.ilx-aparece{animation:ilx-aparece 1.4s ease both}
@keyframes ilx-aparece{from{opacity:0}to{opacity:1}}
.ilx-suave{transition:opacity .7s ease}
@media (prefers-reduced-motion: reduce){.ilx-pinta,.ilx-sella,.ilx-baja,.ilx-izq,.ilx-der,.ilx-aparece{animation:none}.ilx-vuela{display:none}.ilx-suave{transition:none}}
`;

// --- Lienzo y <defs> ---------------------------------------------------------------------

function Defs({ p }: { p: string }) {
  return (
    <defs>
      <filter id={`${p}-sombra`} x="-20%" y="-20%" width="140%" height="150%">
        <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="#3a2a12" floodOpacity="0.2" />
      </filter>
      <filter id={`${p}-sombra-chica`} x="-20%" y="-20%" width="140%" height="160%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.4" floodColor="#3a2a12" floodOpacity="0.22" />
      </filter>
      {/* Tinta de sello: la textura se come algunos puntos. */}
      <filter id={`${p}-tinta`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="11" result="ruido" />
        <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -6.5 5.1" result="mascara" />
        <feComposite in="SourceGraphic" in2="mascara" operator="in" />
      </filter>
      {/* Lápiz: el trazo tiembla apenas (aplicar a grupos, no a líneas sueltas). */}
      <filter id={`${p}-lapiz`} x="-4%" y="-4%" width="108%" height="108%">
        <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="r" />
        <feDisplacementMap in="SourceGraphic" in2="r" scale="3.2" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${p}-desenfoque`} x="-5%" y="-20%" width="110%" height="140%">
        <feGaussianBlur stdDeviation="3.2" />
      </filter>
      <pattern id={`${p}-cuadricula`} width="18" height="18" patternUnits="userSpaceOnUse">
        <path d="M18 0 H0 V18" fill="none" stroke={CG.azul} strokeOpacity="0.3" strokeWidth="0.8" />
      </pattern>
      {/* Líneas de barrido de un tubo de rayos catódicos. */}
      <pattern id={`${p}-barrido`} width="8" height="5" patternUnits="userSpaceOnUse">
        <rect width="8" height="1.4" fill={CG.sepia} opacity="0.07" />
      </pattern>
      <radialGradient id={`${p}-crt`} cx="50%" cy="46%" r="62%">
        <stop offset="0" stopColor="#e9e0cd" />
        <stop offset="0.75" stopColor="#ddd2bb" />
        <stop offset="1" stopColor="#cbbd9f" />
      </radialGradient>
    </defs>
  );
}

export function Lienzo({
  w,
  h,
  p,
  label,
  className,
  slice = false,
  recorta = false,
  children,
}: {
  w: number;
  h: number;
  p: string;
  label: string;
  className?: string;
  slice?: boolean;
  recorta?: boolean;
  children: ReactNode;
}) {
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio={slice ? "xMidYMid slice" : "xMidYMid meet"}
      className={cn("h-full w-full", recorta ? "overflow-hidden" : "overflow-visible", className)}
      role="img"
      aria-label={label}
    >
      <Defs p={p} />
      <style>{ESTILO}</style>
      {children}
    </svg>
  );
}

// --- Piezas ---------------------------------------------------------------------------------

/** Pieza apoyada en (x, y), rotada `rot` grados, que cae con retraso `d` (s). */
export function Pieza({
  x,
  y,
  rot = 0,
  d = 0,
  anim = "cg-cae",
  children,
}: {
  x: number;
  y: number;
  rot?: number;
  d?: number;
  anim?: string;
  children: ReactNode;
}) {
  return (
    <g transform={`translate(${x} ${y})${rot ? ` rotate(${rot})` : ""}`}>
      <g className={anim} style={{ ...retraso(d), ...CAE }}>
        {children}
      </g>
    </g>
  );
}

/** Aparece (sube y se hace visible) con retraso. Sin transform propio: no ponerle `transform` a sus hijos directos si se anima con .cg-cae. */
export function Sube({ d = 0, className = "cg-sube", children }: { d?: number; className?: string; children: ReactNode }) {
  return (
    <g className={className} style={{ ...retraso(d), ...CAE }}>
      {children}
    </g>
  );
}

/** Trazo que se dibuja solo (usa pathLength, así no hace falta medir). */
export function Traza({
  d,
  color = CG.lacre,
  ancho = 3,
  delay = 0,
  opacidad = 1,
  dur,
}: {
  d: string;
  color?: string;
  ancho?: number;
  delay?: number;
  opacidad?: number;
  dur?: number;
}) {
  return (
    <path
      d={d}
      pathLength={100}
      fill="none"
      stroke={color}
      strokeWidth={ancho}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity={opacidad}
      className="cg-traza"
      style={vars({ "--largo": 102, animationDelay: `${delay}s`, ...(dur ? { animationDuration: `${dur}s` } : {}) })}
    />
  );
}

/** Flecha a mano que se dibuja: primero el cuerpo, después la punta. */
export function Flecha({
  x1,
  y1,
  x2,
  y2,
  curva = 0,
  color = CG.sepia,
  ancho = 2.6,
  delay = 0,
  cab = 13,
  opacidad = 1,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  curva?: number;
  color?: string;
  ancho?: number;
  delay?: number;
  cab?: number;
  opacidad?: number;
}) {
  const f = flecha(x1, y1, x2, y2, curva, cab);
  return (
    <g>
      <Traza d={f.cuerpo} color={color} ancho={ancho} delay={delay} opacidad={opacidad} dur={0.9} />
      <Traza d={f.cabeza} color={color} ancho={ancho} delay={delay + 0.75} opacidad={opacidad} dur={0.4} />
    </g>
  );
}

/** Marca de resaltador ocre (se pinta de izquierda a derecha). Va antes del texto. */
export function Resaltado({
  x,
  y,
  w,
  h = 20,
  delay = 0,
  color = CG.ocre,
  opacidad = 0.42,
  rot = -0.5,
}: {
  x: number;
  y: number;
  w: number;
  h?: number;
  delay?: number;
  color?: string;
  opacidad?: number;
  rot?: number;
}) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <rect x={x} y={y} width={w} height={h} rx={3} fill={color} opacity={opacidad} className="ilx-pinta" style={retraso(delay)} />
    </g>
  );
}

/** Cinta adhesiva (centrada en x, y). Si trae `texto`, está escrita a mano. */
export function Cinta({
  x,
  y,
  w = 70,
  h = 22,
  rot = 0,
  texto,
  color = CG.lacre,
  fs = 23,
}: {
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  texto?: string;
  color?: string;
  fs?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path
        d={`M${-w / 2} ${-h / 2} L${w / 2} ${-h / 2 + 1} L${w / 2 - 2} ${-h / 6} L${w / 2 + 1} ${h / 6} L${w / 2} ${h / 2} L${-w / 2 + 1} ${h / 2 - 1} L${-w / 2 - 2} ${h / 5} L${-w / 2 + 1} ${-h / 6} Z`}
        fill="rgba(234, 222, 190, 0.84)"
        stroke="rgba(120, 100, 60, 0.16)"
        strokeWidth={0.8}
      />
      {texto && (
        <text x={0} y={fs * 0.33} textAnchor="middle" style={MANO_B} fontSize={fs} fill={color}>
          {texto}
        </text>
      )}
    </g>
  );
}

/** Sello rectangular de goma (fechador de mesa de entradas, "APROBADO"…), centrado. */
export function Sello({
  p,
  lineas,
  w,
  h,
  rot = -8,
  color = CG.lacre,
  delay = 0,
  fs = 13,
  opacidad = 0.82,
}: {
  p: string;
  lineas: string[];
  w: number;
  h: number;
  rot?: number;
  color?: string;
  delay?: number;
  fs?: number;
  opacidad?: number;
}) {
  const alto = fs * 1.25;
  const y0 = -((lineas.length - 1) * alto) / 2 + fs * 0.36;
  return (
    <g transform={`rotate(${rot})`}>
      <g className="ilx-sella" style={retraso(delay)}>
        <g filter={url(p, "tinta")} opacity={opacidad}>
          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="none" stroke={color} strokeWidth={2.6} />
          <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={2} fill="none" stroke={color} strokeWidth={1.1} />
          {lineas.map((l, i) => (
            <text
              key={i}
              x={0}
              y={y0 + i * alto}
              textAnchor="middle"
              style={MONO_B}
              fontSize={i === 0 ? fs * 1.05 : fs}
              letterSpacing={1.2}
              fill={color}
            >
              {l}
            </text>
          ))}
        </g>
      </g>
    </g>
  );
}

/** Hoja de papel (rectángulo con sombra), con origen arriba a la izquierda. */
export function Hoja({
  p,
  w,
  h,
  fill = CG.blanco,
  chica = false,
}: {
  p: string;
  w: number;
  h: number;
  fill?: string;
  chica?: boolean;
}) {
  return <rect width={w} height={h} fill={fill} filter={url(p, chica ? "sombra-chica" : "sombra")} />;
}

/** Renglones grises que simulan texto (anchos en unidades). */
export function Barras({
  x,
  y,
  anchos,
  alto = 4,
  sep = 13,
  color = CG.niebla,
}: {
  x: number;
  y: number;
  anchos: number[];
  alto?: number;
  sep?: number;
  color?: string;
}) {
  return (
    <g>
      {anchos.map((w, i) =>
        w ? <rect key={i} x={x} y={y + i * sep} width={w} height={alto} rx={1.5} fill={color} /> : null,
      )}
    </g>
  );
}

/** Perforaciones de papel continuo (una columna de agujeros). */
export function Perforaciones({ x, y0, y1, sep = 27, r = 6.5 }: { x: number; y0: number; y1: number; sep?: number; r?: number }) {
  const n = Math.floor((y1 - y0) / sep);
  return (
    <g>
      {Array.from({ length: n + 1 }, (_, i) => (
        <circle key={i} cx={x} cy={y0 + i * sep} r={r} fill={CG.papel} stroke={CG.niebla} strokeWidth={1} />
      ))}
    </g>
  );
}
