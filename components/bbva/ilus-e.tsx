"use client";

// Ilustraciones de la Clase 2 del Laboratorio BBVA · "Del proceso al asistente".
// Mesa de taller / manual de armado: diagramas, fichas técnicas, piezas que
// encajan, flechas y anotaciones a mano. La IA es un sistema que se diseña,
// nunca un personaje (sin robots, cerebros ni hologramas).
//
// Mismo sistema visual que ilus-c: papel, cinta, sellos con tinta gastada,
// tinta/grafito/pizarra y un solo acento cálido (naranja). Sin interactividad.
// Cada componente llena su contenedor (viewBox 800 × 500).

import { useId, type ComponentType, type CSSProperties, type ReactNode } from "react";

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
  ambar: "#f3c54b",
} as const;

const TIT: CSSProperties = { fontFamily: "var(--font-archivo), 'Arial Narrow', system-ui, sans-serif", fontStretch: "68%", fontWeight: 800 };
const SERIF: CSSProperties = { fontFamily: "var(--font-instrument), Georgia, serif", fontStyle: "italic" };
const MANO: CSSProperties = { fontFamily: "var(--font-caveat), cursive", fontWeight: 600 };
const MONO: CSSProperties = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" };
const SANS: CSSProperties = { fontFamily: "var(--font-geist-sans), system-ui, sans-serif" };

/** Estilo con variables CSS (--largo…). */
type Estilo = CSSProperties & { [k: `--${string}`]: string | number };

// --- Ids únicos por instancia --------------------------------------------------------

type Id = (n: string) => string;

function useIds(): Id {
  const crudo = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (n: string) => `ie${crudo}-${n}`;
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
      {/* Cuadrícula de mesa técnica. */}
      <pattern id={id("cuadro")} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20,0 H0 V20" fill="none" stroke={K.niebla} strokeWidth="0.5" />
      </pattern>
    </defs>
  );
}

// --- Piezas comunes ------------------------------------------------------------------

function Aparece({ d = 0, children }: { d?: number; children: ReactNode }) {
  return (
    <g className="bbva-cae" style={{ animationDelay: `${d}s`, transformBox: "fill-box", transformOrigin: "center" }}>
      {children}
    </g>
  );
}

function Traza({ d, delay = 0, c = K.grafito, ancho = 2, dash }: { d: string; delay?: number; c?: string; ancho?: number; dash?: string }) {
  const s: Estilo = { "--largo": 1.02, animationDelay: `${delay}s` };
  if (dash) return <path d={d} fill="none" stroke={c} strokeWidth={ancho} strokeLinecap="round" strokeDasharray={dash} />;
  return (
    <path d={d} pathLength={1} fill="none" stroke={c} strokeWidth={ancho} strokeLinecap="round" strokeLinejoin="round" className="bbva-traza" style={s} />
  );
}

/** Punta de flecha en (x, y) apuntando hacia `ang` grados (0 = derecha, 90 = abajo). */
function punta(x: number, y: number, ang: number, t = 10) {
  const a = (ang * Math.PI) / 180 + Math.PI;
  const p = (da: number) => `${(x + t * Math.cos(a + da)).toFixed(1)},${(y + t * Math.sin(a + da)).toFixed(1)}`;
  return `M${p(-0.5)} L${x},${y} L${p(0.5)}`;
}

function Flecha({ d, x, y, ang, delay = 0, c = K.naranja, ancho = 2.4, t = 10 }: { d: string; x: number; y: number; ang: number; delay?: number; c?: string; ancho?: number; t?: number }) {
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

/** Renglones grises de "texto" (largos variados). */
function Renglones({ x, y, w, n, paso = 12, c = K.niebla, ancho = 3 }: { x: number; y: number; w: number; n: number; paso?: number; c?: string; ancho?: number }) {
  const largos = [1, 0.86, 0.94, 0.7, 0.9, 0.62, 0.82];
  return (
    <g stroke={c} strokeWidth={ancho} strokeLinecap="round">
      {Array.from({ length: n }, (_, i) => (
        <line key={i} x1={x} y1={y + i * paso} x2={x + w * largos[i % largos.length]} y2={y + i * paso} />
      ))}
    </g>
  );
}

/** Sello rectangular con tinta gastada, centrado en (x, y). */
function Sello({ id, x, y, r = -8, w, texto, c = K.naranja, s = 18 }: { id: Id; x: number; y: number; r?: number; w: number; texto: string; c?: string; s?: number }) {
  const h = s * 2.1;
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`} filter={url(id, "tinta")}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="none" stroke={c} strokeWidth={3} />
      <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={2} fill="none" stroke={c} strokeWidth={1} />
      <text x={0} y={s * 0.36} textAnchor="middle" fontSize={s} fill={c} style={{ ...TIT, letterSpacing: "0.06em" }}>
        {texto}
      </text>
    </g>
  );
}

/** Tilde manuscrita. */
const tilde = (x: number, y: number, s = 1) => `M${x},${y} l${7 * s},${8 * s} l${15 * s},${-18 * s}`;

/** Mesa técnica: cuadrícula tenue de fondo. */
function Mesa({ id }: { id: Id }) {
  return <rect x={0} y={0} width={800} height={500} fill={url(id, "cuadro")} opacity={0.55} />;
}

function Lienzo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

// =====================================================================================
// Las tres cajas: instrucciones · contexto · conocimiento
// =====================================================================================

type Caja = "instrucciones" | "contexto" | "conocimiento";

const CAJAS: { k: Caja; t: string; n: string; sub: string }[] = [
  { k: "instrucciones", t: "INSTRUCCIONES", n: "01", sub: "cómo trabaja siempre" },
  { k: "contexto", t: "CONTEXTO", n: "02", sub: "este caso" },
  { k: "conocimiento", t: "CONOCIMIENTO", n: "03", sub: "con qué fuentes" },
];

function PistaCaja({ k, cx, c }: { k: Caja; cx: number; c: string }) {
  if (k === "instrucciones") {
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <text x={cx - 70} y={214 + i * 30} fontSize={14} fill={c} style={MONO}>
              {i + 1}.
            </text>
            <line x1={cx - 46} y1={209 + i * 30} x2={cx + 66 - (i % 2) * 22} y2={209 + i * 30} stroke={K.niebla} strokeWidth={4} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
  }
  if (k === "contexto") {
    return (
      <g>
        <path
          d={`M${cx - 62},192 H${cx + 62} V236 a8,8 0 0 0 0,16 V312 H${cx - 62} V252 a8,8 0 0 0 0,-16 Z`}
          fill={K.papel}
          stroke={c}
          strokeWidth={1.6}
        />
        <line x1={cx - 54} y1={244} x2={cx + 54} y2={244} stroke={c} strokeWidth={1} strokeDasharray="3 4" />
        <text x={cx} y={222} textAnchor="middle" fontSize={15} fill={c} style={{ ...MONO, letterSpacing: "0.12em" }}>
          HOY · #418
        </text>
        <Renglones x={cx - 46} y={266} w={92} n={3} paso={14} />
      </g>
    );
  }
  return (
    <g>
      {[
        { w: 128, y: 284, r: 0 },
        { w: 116, y: 256, r: -2 },
        { w: 136, y: 228, r: 1.5 },
        { w: 108, y: 200, r: -1 },
      ].map((l, i) => (
        <g key={i} transform={`rotate(${l.r} ${cx} ${l.y + 13})`}>
          <rect x={cx - l.w / 2} y={l.y} width={l.w} height={26} fill={i % 2 ? K.papel : K.blanco} stroke={c} strokeWidth={1.5} />
          <line x1={cx - l.w / 2 + 10} y1={l.y} x2={cx - l.w / 2 + 10} y2={l.y + 26} stroke={c} strokeWidth={1} />
          <line x1={cx - 26} y1={l.y + 13} x2={cx + 30} y2={l.y + 13} stroke={K.niebla} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
}

function Cajas({ foco }: { foco?: Caja }) {
  const id = useIds();
  return (
    <Lienzo label="Tres cajas: instrucciones, cómo trabaja siempre; contexto, este caso; conocimiento, con qué fuentes.">
      <Defs id={id} />
      <Mesa id={id} />
      <text x={40} y={62} fontSize={13} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
        FIG. 1 — DÓNDE VA CADA COSA
      </text>
      {CAJAS.map((b, i) => {
        const x0 = 40 + i * 250;
        const cx = x0 + 110;
        const on = foco === b.k;
        const apagada = foco !== undefined && !on;
        const c = on ? K.naranja : K.tinta;
        return (
          <g key={b.k} opacity={apagada ? 0.3 : 1}>
            <Aparece d={0.1 + i * 0.15}>
              <rect x={x0} y={110} width={220} height={260} rx={4} fill={K.blanco} stroke={c} strokeWidth={on ? 3.5 : 1.8} filter={url(id, "sombra")} />
              <rect x={x0 + 10} y={120} width={200} height={240} rx={2} fill="none" stroke={on ? K.naranja : K.niebla} strokeWidth={0.8} />
              <text x={x0 + 18} y={142} fontSize={13} fill={on ? K.naranja : K.gris} style={MONO}>
                {b.n}
              </text>
              <rect x={cx - 85} y={148} width={170} height={34} fill={on ? K.naranja : K.papel} stroke={c} strokeWidth={1.4} />
              <text x={cx} y={173} textAnchor="middle" fontSize={23} fill={on ? K.blanco : K.tinta} style={{ ...TIT, letterSpacing: "0.04em" }}>
                {b.t}
              </text>
              <PistaCaja k={b.k} cx={cx} c={on ? K.naranja : K.grafito} />
              <rect x={cx - 28} y={334} width={56} height={12} rx={6} fill={K.papel2} stroke={c} strokeWidth={1.4} />
              <Cinta x={cx - 26} y={102} r={i === 1 ? 3 : -3} />
            </Aparece>
            <text x={cx} y={416} textAnchor="middle" fontSize={30} fill={on ? K.naranja : K.grafito} style={MANO}>
              {b.sub}
            </text>
          </g>
        );
      })}
    </Lienzo>
  );
}

function C2Cajas() {
  return <Cajas />;
}
function C2CajasInstrucciones() {
  return <Cajas foco="instrucciones" />;
}
function C2CajasContexto() {
  return <Cajas foco="contexto" />;
}
function C2CajasConocimiento() {
  return <Cajas foco="conocimiento" />;
}

// =====================================================================================
// ¿De dónde sale lo que responde?
// =====================================================================================

const NUBE: [string, number, number, number, number][] = [
  ["normas", 70, 170, 22, 0.75],
  ["foros", 210, 150, 18, 0.5],
  ["2019", 260, 215, 20, 0.6],
  ["¿vigente?", 90, 250, 24, 0.85],
  ["blogs", 200, 290, 17, 0.45],
  ["versiones", 60, 320, 18, 0.55],
  ["algo leído", 150, 360, 20, 0.65],
  ["otro país", 250, 340, 16, 0.4],
];

function C2DeDonde() {
  const id = useIds();
  return (
    <Lienzo label="A la izquierda, una nube difusa de palabras sueltas: lo que el modelo sabe, con un signo de pregunta. A la derecha, una bandeja ordenada con cuatro documentos: fuentes delimitadas. Una flecha va de la nube a la bandeja.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0.1}>
        <path
          d="M60,210 C40,150 110,110 170,128 C220,96 300,118 310,170 C350,200 340,290 312,320 C320,380 230,410 170,392 C110,412 40,380 48,320 C20,290 28,240 60,210 Z"
          fill={K.papel2}
          stroke={K.gris}
          strokeWidth={1.4}
          strokeDasharray="4 6"
        />
        {NUBE.map(([t, x, y, s, o]) => (
          <text key={t} x={x} y={y} fontSize={s} fill={K.grafito} opacity={o} style={SERIF}>
            {t}
          </text>
        ))}
        <text x={290} y={128} fontSize={78} fill={K.naranja} style={MANO}>
          ?
        </text>
      </Aparece>
      <text x={180} y={455} textAnchor="middle" fontSize={30} fill={K.grafito} style={MANO}>
        {"lo que el modelo “sabe”"}
      </text>

      <Flecha d="M340,250 C370,236 400,236 432,248" x={432} y={248} ang={20} delay={0.6} t={14} ancho={3} />

      <Aparece d={0.4}>
        <rect x={460} y={130} width={300} height={270} rx={8} fill={K.carton} filter={url(id, "sombra")} />
        <rect x={472} y={142} width={276} height={246} rx={4} fill={K.papel} stroke={K.tinta} strokeWidth={1.4} />
        {[0, 1, 2, 3].map((i) => {
          const x = 492 + (i % 2) * 130;
          const y = 160 + Math.floor(i / 2) * 112;
          return (
            <g key={i} filter={url(id, "sombra-chica")}>
              <rect x={x} y={y} width={106} height={96} fill={K.blanco} stroke={K.tinta} strokeWidth={1.3} />
              <text x={x + 10} y={y + 22} fontSize={13} fill={K.pizarra2} style={{ ...MONO, letterSpacing: "0.1em" }}>
                DOC {i + 1}
              </text>
              <Renglones x={x + 10} y={y + 40} w={84} n={4} paso={13} />
            </g>
          );
        })}
      </Aparece>
      <text x={610} y={455} textAnchor="middle" fontSize={30} fill={K.naranja} style={MANO}>
        fuentes delimitadas
      </text>
    </Lienzo>
  );
}

// =====================================================================================
// Curar la base: menos es más preciso
// =====================================================================================

const FICHAS_BASE = ["Procedimiento vigente", "Criterios 2026", "FAQ"];

function C2Base() {
  const id = useIds();
  return (
    <Lienzo label="Un manual grueso de 300 páginas tachado; al lado, tres fichas elegidas con tilde: procedimiento vigente, criterios 2026 y preguntas frecuentes. Anotación: acotar también es diseñar.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0.1}>
        {[16, 12, 8, 4].map((o) => (
          <rect key={o} x={70 + o} y={110 + o} width={220} height={270} fill={K.blanco} stroke={K.gris} strokeWidth={1} />
        ))}
        <rect x={70} y={110} width={220} height={270} fill={K.papel} stroke={K.tinta} strokeWidth={1.8} filter={url(id, "sombra")} />
        <rect x={70} y={110} width={18} height={270} fill={url(id, "trama")} opacity={0.5} />
        <text x={190} y={200} textAnchor="middle" fontSize={44} fill={K.tinta} style={TIT}>
          Manual
        </text>
        <text x={190} y={232} textAnchor="middle" fontSize={17} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.08em" }}>
          300 págs.
        </text>
        <Renglones x={112} y={280} w={150} n={5} paso={16} />
      </Aparece>
      <Traza d="M60,120 L320,380" c={K.naranja} ancho={6} delay={0.7} />
      <Traza d="M320,120 L60,380" c={K.naranja} ancho={6} delay={0.95} />

      <Flecha d="M340,250 L400,250" x={400} y={250} ang={0} delay={1.2} c={K.grafito} />

      {FICHAS_BASE.map((t, i) => (
        <Aparece key={t} d={1.3 + i * 0.2}>
          <g transform={`rotate(${[-1.5, 1, -0.5][i]} 580 ${140 + i * 100})`}>
            <rect x={430} y={100 + i * 100} width={310} height={78} fill={K.blanco} stroke={K.tinta} strokeWidth={1.5} filter={url(id, "sombra-chica")} />
            <text x={450} y={134 + i * 100} fontSize={24} fill={K.tinta} style={TIT}>
              {t}
            </text>
            <Renglones x={450} y={156 + i * 100} w={170} n={1} />
            <circle cx={705} cy={139 + i * 100} r={20} fill="none" stroke={K.naranja} strokeWidth={2} />
            <path d={tilde(695, 141 + i * 100)} fill="none" stroke={K.naranja} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </Aparece>
      ))}
      <Cinta x={560} y={92} r={-4} />
      <text x={585} y={460} textAnchor="middle" fontSize={34} fill={K.naranja} style={MANO}>
        acotar también es diseñar
      </text>
    </Lienzo>
  );
}

// =====================================================================================
// Cuaderno de fuentes: la respuesta cita
// =====================================================================================

function C2Notebook() {
  const id = useIds();
  const fuenteY = (n: number) => 112 + (n - 1) * 112;
  const citas: { n: number; y: number; x: number }[] = [
    { n: 1, y: 190, x: 612 },
    { n: 3, y: 316, x: 560 },
  ];
  return (
    <Lienzo label="Un espacio de trabajo abierto: a la izquierda tres fichas de fuentes numeradas 1, 2 y 3; a la derecha una respuesta con marcas de cita [1] y [3] unidas por líneas finas a sus fuentes.">
      <Defs id={id} />
      <Aparece d={0}>
        <rect x={30} y={36} width={740} height={430} rx={10} fill={K.papel2} filter={url(id, "sombra")} />
        <rect x={30} y={36} width={740} height={40} rx={10} fill={K.carton} />
        <rect x={30} y={60} width={740} height={16} fill={K.carton} />
        <text x={52} y={62} fontSize={14} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.18em" }}>
          ESPACIO DE TRABAJO
        </text>
        <text x={322} y={62} fontSize={14} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.18em" }}>
          FUENTES · 3
        </text>
      </Aparece>

      {[1, 2, 3].map((n) => (
        <Aparece key={n} d={0.15 * n}>
          <rect x={60} y={fuenteY(n) - 16} width={230} height={92} fill={K.blanco} stroke={K.tinta} strokeWidth={1.3} filter={url(id, "sombra-chica")} />
          <circle cx={88} cy={fuenteY(n) + 10} r={15} fill={K.tinta} />
          <text x={88} y={fuenteY(n) + 16} textAnchor="middle" fontSize={17} fill={K.blanco} style={MONO}>
            {n}
          </text>
          <Renglones x={116} y={fuenteY(n) + 4} w={150} n={3} paso={14} />
        </Aparece>
      ))}

      <Aparece d={0.6}>
        <rect x={360} y={96} width={380} height={340} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} filter={url(id, "sombra")} />
        <text x={384} y={130} fontSize={15} fill={K.pizarra2} style={{ ...MONO, letterSpacing: "0.16em" }}>
          RESPUESTA
        </text>
        <line x1={384} y1={142} x2={716} y2={142} stroke={K.tinta} strokeWidth={0.8} />
        <Renglones x={384} y={168} w={330} n={9} paso={21} ancho={4} />
      </Aparece>

      {citas.map((c, i) => (
        <g key={c.n}>
          <Traza
            d={`M${c.x},${c.y} C${c.x - 120},${c.y + (i ? -30 : 40)} 360,${fuenteY(c.n) + 40} 290,${fuenteY(c.n) + 30}`}
            c={K.naranja}
            ancho={1.4}
            delay={1.2 + i * 0.3}
          />
          <Aparece d={1 + i * 0.3}>
            <rect x={c.x} y={c.y - 14} width={34} height={22} rx={3} fill={K.naranja} />
            <text x={c.x + 17} y={c.y + 3} textAnchor="middle" fontSize={15} fill={K.blanco} style={MONO}>
              [{c.n}]
            </text>
          </Aparece>
          <circle cx={290} cy={fuenteY(c.n) + 30} r={4} fill={K.naranja} />
        </g>
      ))}
    </Lienzo>
  );
}

// =====================================================================================
// La mochila: lo que el asistente lleva consigo
// =====================================================================================

const MOCHILA = [
  { t: "PROCEDIMIENTOS", x: 238, r: -9 },
  { t: "PLANTILLAS", x: 345, r: -3 },
  { t: "CRITERIOS", x: 455, r: 3 },
  { t: "EJEMPLOS", x: 562, r: 9 },
];

function C2Mochila() {
  const id = useIds();
  return (
    <Lienzo label="Una caja de herramientas de papel con cuatro carpetas asomando: procedimientos, plantillas, criterios y ejemplos.">
      <Defs id={id} />
      <Mesa id={id} />
      {MOCHILA.map((m, i) => (
        <Aparece key={m.t} d={0.4 + i * 0.15}>
          <g transform={`rotate(${m.r} ${m.x} 330)`}>
            <rect x={m.x - 52} y={110} width={104} height={220} fill={i % 2 ? K.papel : K.blanco} stroke={K.tinta} strokeWidth={1.5} filter={url(id, "sombra-chica")} />
            <rect x={m.x - 46} y={90} width={92} height={28} fill={i === 1 ? K.naranja : K.cielo} stroke={K.tinta} strokeWidth={1.3} />
            <text x={m.x} y={110} textAnchor="middle" fontSize={m.t.length > 11 ? 14.5 : 17} fill={i === 1 ? K.blanco : K.pizarra2} style={{ ...TIT, letterSpacing: "0.03em" }}>
              {m.t}
            </text>
            <Renglones x={m.x - 38} y={142} w={76} n={5} paso={13} />
          </g>
        </Aparece>
      ))}
      <Aparece d={0.1}>
        <path d="M150,250 H650 L630,440 H170 Z" fill={K.carton} stroke={K.tinta} strokeWidth={2} strokeLinejoin="round" filter={url(id, "sombra")} />
        <path d="M150,250 H650 L646,286 H154 Z" fill={K.papel2} stroke={K.tinta} strokeWidth={1.6} strokeLinejoin="round" />
        <rect x={160} y={296} width={480} height={136} fill={url(id, "trama")} opacity={0.12} />
        {[210, 590].map((x) => (
          <rect key={x} x={x - 14} y={276} width={28} height={22} rx={3} fill={K.blanco} stroke={K.tinta} strokeWidth={1.5} />
        ))}
        <rect x={300} y={340} width={200} height={50} fill={K.blanco} stroke={K.tinta} strokeWidth={1.4} />
        <text x={400} y={372} textAnchor="middle" fontSize={20} fill={K.tinta} style={{ ...MONO, letterSpacing: "0.16em" }}>
          KIT DE TRABAJO
        </text>
      </Aparece>
      <Cinta x={274} y={330} r={-6} />
      <Cinta x={476} y={330} r={5} />
    </Lienzo>
  );
}

// =====================================================================================
// Cuando no sabe: diagrama de decisión
// =====================================================================================

const RAMAS_NO = [
  { t: "pide", n: "qué le falta", y: 176 },
  { t: "advierte", n: "que no está", y: 248 },
  { t: "deriva", n: "a quién sabe", y: 320 },
];

function Caja2({ x, y, w = 150, h = 48, t, c = K.tinta, fill = K.blanco, id }: { x: number; y: number; w?: number; h?: number; t: string; c?: string; fill?: string; id: Id }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4} fill={fill} stroke={c} strokeWidth={1.8} filter={url(id, "sombra-chica")} />
      <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" fontSize={26} fill={fill === K.blanco ? c : K.blanco} style={TIT}>
        {t}
      </text>
    </g>
  );
}

function C2NoSabe() {
  const id = useIds();
  return (
    <Lienzo label="Diagrama de decisión: ¿tiene la información? Si sí, trabaja. Si no, tres ramas: pide, advierte o deriva. Una cuarta rama, inventa, está tachada.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0}>
        <path d="M40,260 L170,170 L300,260 L170,350 Z" fill={K.blanco} stroke={K.tinta} strokeWidth={2.2} strokeLinejoin="round" filter={url(id, "sombra")} />
        <text x={170} y={254} textAnchor="middle" fontSize={20} fill={K.tinta} style={SANS}>
          ¿tiene la
        </text>
        <text x={170} y={280} textAnchor="middle" fontSize={20} fill={K.tinta} style={SANS}>
          información?
        </text>
      </Aparece>

      {/* sí */}
      <Flecha d="M170,170 V82 H330" x={330} y={82} ang={0} delay={0.4} c={K.grafito} />
      <text x={182} y={130} fontSize={28} fill={K.grafito} style={MANO}>
        sí
      </text>
      <Aparece d={0.6}>
        <Caja2 id={id} x={340} y={58} t="trabaja" fill={K.tinta} />
      </Aparece>

      {/* no */}
      <Traza d="M300,260 H390" c={K.naranja} ancho={2.4} delay={0.8} />
      <text x={318} y={248} fontSize={28} fill={K.naranja} style={MANO}>
        no
      </text>
      {RAMAS_NO.map((r, i) => (
        <g key={r.t}>
          <Flecha d={`M390,260 C420,260 420,${r.y + 24} 470,${r.y + 24}`} x={470} y={r.y + 24} ang={0} delay={1 + i * 0.15} t={9} />
          <Aparece d={1.3 + i * 0.15}>
            <Caja2 id={id} x={480} y={r.y} t={r.t} c={K.naranja} />
            <text x={644} y={r.y + 32} fontSize={24} fill={K.grafito} style={MANO}>
              {r.n}
            </text>
          </Aparece>
        </g>
      ))}
      <g opacity={0.55}>
        <Traza d="M390,260 C420,260 420,416 470,416" c={K.gris} ancho={1.6} dash="4 6" />
        <rect x={480} y={392} width={150} height={48} rx={4} fill="none" stroke={K.gris} strokeWidth={1.6} strokeDasharray="5 5" />
        <text x={555} y={425} textAnchor="middle" fontSize={26} fill={K.gris} style={TIT}>
          inventa
        </text>
      </g>
      <Traza d="M470,400 L640,434" c={K.naranja} ancho={5} delay={1.9} />
      <Traza d="M470,434 L640,400" c={K.naranja} ancho={5} delay={2.1} />
    </Lienzo>
  );
}

// =====================================================================================
// Hasta dónde llega el asistente
// =====================================================================================

function Paso({ x, w, t, c, id }: { x: number; w: number; t: string; c: string; id: Id }) {
  return (
    <g>
      <rect x={x} y={200} width={w} height={64} rx={4} fill={K.blanco} stroke={c} strokeWidth={1.8} filter={url(id, "sombra-chica")} />
      <text x={x + w / 2} y={241} textAnchor="middle" fontSize={26} fill={c} style={TIT}>
        {t}
      </text>
    </g>
  );
}

function C2Detenerse() {
  const id = useIds();
  const asis = [
    { t: "Leer", x: 50 },
    { t: "Comparar", x: 192 },
    { t: "Proponer", x: 334 },
  ];
  const pers = [
    { t: "Decidir", x: 532 },
    { t: "Enviar", x: 664 },
  ];
  return (
    <Lienzo label="Flujo: el asistente lee, compara y propone, y se detiene en una línea marcada hasta acá. Del otro lado, una persona decide y envía, con una ficha de firma y un lápiz.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0}>
        <rect x={30} y={130} width={440} height={170} rx={8} fill={K.cielo} opacity={0.35} stroke={K.pizarra} strokeWidth={1.2} strokeDasharray="6 5" />
        <text x={46} y={156} fontSize={14} fill={K.pizarra2} style={{ ...MONO, letterSpacing: "0.2em" }}>
          ASISTENTE
        </text>
        <rect x={512} y={130} width={270} height={170} rx={8} fill={K.papel2} stroke={K.grafito} strokeWidth={1.2} />
        <text x={528} y={156} fontSize={14} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          PERSONA
        </text>
      </Aparece>
      {asis.map((p, i) => (
        <Aparece key={p.t} d={0.2 + i * 0.15}>
          <Paso id={id} x={p.x} w={120} t={p.t} c={K.pizarra2} />
        </Aparece>
      ))}
      <Flecha d="M172,232 H190" x={190} y={232} ang={0} c={K.pizarra2} t={8} ancho={2} delay={0.5} />
      <Flecha d="M314,232 H332" x={332} y={232} ang={0} c={K.pizarra2} t={8} ancho={2} delay={0.6} />

      <Traza d="M491,96 V430" c={K.naranja} ancho={4} delay={0.9} />
      <text x={491} y={84} textAnchor="middle" fontSize={34} fill={K.naranja} style={MANO}>
        hasta acá
      </text>
      <Flecha d="M456,232 H528" x={528} y={232} ang={0} c={K.grafito} t={8} ancho={2} delay={1.1} />

      {pers.map((p, i) => (
        <Aparece key={p.t} d={1.2 + i * 0.15}>
          <Paso id={id} x={p.x} w={106} t={p.t} c={K.tinta} />
        </Aparece>
      ))}
      <Flecha d="M640,232 H660" x={660} y={232} ang={0} c={K.tinta} t={8} ancho={2} delay={1.4} />

      {/* ficha de firma con lápiz */}
      <Aparece d={1.6}>
        <g transform="rotate(-3 650 380)">
          <rect x={556} y={336} width={200} height={92} fill={K.blanco} stroke={K.tinta} strokeWidth={1.5} filter={url(id, "sombra")} />
          <line x1={576} y1={404} x2={736} y2={404} stroke={K.gris} strokeWidth={1} />
          <text x={576} y={420} fontSize={11} fill={K.gris} style={{ ...MONO, letterSpacing: "0.14em" }}>
            FIRMA
          </text>
          <path d="M584,396 C596,368 606,402 616,384 C624,370 630,398 642,386 C654,374 660,394 690,382" fill="none" stroke={K.naranja} strokeWidth={2.4} strokeLinecap="round" />
        </g>
        <g transform="translate(696 356) rotate(-38)">
          <rect x={0} y={-6} width={92} height={12} fill={K.ambar} stroke={K.tinta} strokeWidth={1.3} />
          <rect x={92} y={-6} width={12} height={12} fill={K.niebla} stroke={K.tinta} strokeWidth={1.3} />
          <path d="M0,-6 L-16,0 L0,6 Z" fill={K.papel} stroke={K.tinta} strokeWidth={1.3} strokeLinejoin="round" />
          <path d="M-11,-2 L-16,0 L-11,2 Z" fill={K.tinta} />
        </g>
      </Aparece>
      <Cinta x={636} y={326} r={-4} />
    </Lienzo>
  );
}

// =====================================================================================
// La revisión humana como pieza del circuito
// =====================================================================================

function C2Humano() {
  const id = useIds();
  const nodo = (x: number, t: string) => (
    <g>
      <rect x={x} y={150} width={120} height={64} rx={4} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} filter={url(id, "sombra-chica")} />
      <text x={x + 60} y={190} textAnchor="middle" fontSize={22} fill={K.tinta} style={TIT}>
        {t}
      </text>
    </g>
  );
  return (
    <Lienzo label="Diagrama de arquitectura: entrada, asistente, un bloque sólido de revisión humana con un sello que dice diseñado, y salida. Abajo, un pequeño parche tachado.">
      <Defs id={id} />
      <Mesa id={id} />
      {/* cableado */}
      <g stroke={K.grafito} strokeWidth={2} fill="none">
        <path d="M140,182 H190" />
        <path d="M310,182 H352" />
        <path d="M576,182 H630" />
      </g>
      {[140, 190, 310, 352, 576, 630].map((x) => (
        <circle key={x} cx={x} cy={182} r={4} fill={K.grafito} />
      ))}
      <Aparece d={0}>{nodo(20, "entrada")}</Aparece>
      <Aparece d={0.15}>{nodo(190, "asistente")}</Aparece>
      <Aparece d={0.3}>{nodo(630, "salida")}</Aparece>
      <Aparece d={0.5}>
        <rect x={352} y={120} width={224} height={124} rx={6} fill={K.tinta} filter={url(id, "sombra")} />
        <rect x={352} y={120} width={224} height={16} rx={6} fill={K.naranja} />
        <rect x={352} y={128} width={224} height={8} fill={K.naranja} />
        <text x={464} y={186} textAnchor="middle" fontSize={27} fill={K.blanco} style={{ ...TIT, letterSpacing: "0.04em" }}>
          REVISIÓN
        </text>
        <text x={464} y={218} textAnchor="middle" fontSize={27} fill={K.blanco} style={{ ...TIT, letterSpacing: "0.04em" }}>
          HUMANA
        </text>
        {[364, 564].map((x) => (
          <circle key={x} cx={x} cy={232} r={3} fill={K.gris} />
        ))}
      </Aparece>
      <Cinta x={440} y={112} r={-3} />
      <Aparece d={0.9}>
        <Sello id={id} x={548} y={268} r={-9} w={130} texto="DISEÑADO" s={20} />
      </Aparece>
      <text x={464} y={76} textAnchor="middle" fontSize={28} fill={K.grafito} style={MANO}>
        una pieza del circuito
      </text>

      {/* el parche, tachado */}
      <g opacity={0.8}>
        <line x1={150} y1={410} x2={330} y2={410} stroke={K.gris} strokeWidth={2} />
        <g transform="rotate(-14 240 410)">
          <rect x={196} y={396} width={88} height={28} rx={14} fill={K.papel2} stroke={K.grafito} strokeWidth={1.4} />
          <rect x={226} y={399} width={28} height={22} rx={3} fill={K.carton} />
          {[232, 240, 248].map((x) => (
            <circle key={x} cx={x} cy={410} r={1.4} fill={K.grafito} />
          ))}
        </g>
        <text x={240} y={460} textAnchor="middle" fontSize={26} fill={K.grafito} style={MANO}>
          parche
        </text>
      </g>
      <Traza d="M180,370 L300,450" c={K.naranja} ancho={4.5} delay={1.2} />
      <Traza d="M300,370 L180,450" c={K.naranja} ancho={4.5} delay={1.4} />
    </Lienzo>
  );
}

// =====================================================================================
// El system prompt: una ficha técnica de 9 secciones
// =====================================================================================

const SECCIONES = ["PROPÓSITO", "CONTEXTO DE TRABAJO", "ENTRADAS", "MÉTODO", "CONOCIMIENTO", "REGLAS", "LÍMITES", "SALIDA", "CONTROL FINAL"];

function C2SystemPrompt() {
  const id = useIds();
  return (
    <Lienzo label="Un documento alto de instrucciones con nueve secciones: propósito, contexto de trabajo, entradas, método, conocimiento, reglas, límites, salida y control final. Sello: borrador v0.1.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0}>
        <rect x={190} y={14} width={420} height={474} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} filter={url(id, "sombra")} />
        <text x={212} y={44} fontSize={14} fill={K.pizarra2} style={{ ...MONO, letterSpacing: "0.18em" }}>
          INSTRUCCIONES DEL ASISTENTE
        </text>
        <line x1={212} y1={56} x2={588} y2={56} stroke={K.tinta} strokeWidth={1.2} />
      </Aparece>
      <Cinta x={372} y={6} r={-2} />
      {SECCIONES.map((s, i) => {
        const y = 66 + i * 46;
        return (
          <Aparece key={s} d={0.1 + i * 0.08}>
            <text x={212} y={y + 22} fontSize={12} fill={K.naranja} style={MONO}>
              {String(i + 1).padStart(2, "0")}
            </text>
            <text x={238} y={y + 22} fontSize={14.5} fill={K.tinta} style={{ ...MONO, fontWeight: 600, letterSpacing: "0.04em" }}>
              {s}
            </text>
            <Renglones x={430} y={y + 13} w={150} n={2} paso={12} />
            {i < SECCIONES.length - 1 && <line x1={212} y1={y + 40} x2={588} y2={y + 40} stroke={K.niebla} strokeWidth={0.8} strokeDasharray="3 4" />}
          </Aparece>
        );
      })}
      <Aparece d={1.1}>
        <Sello id={id} x={640} y={110} r={10} w={190} texto="BORRADOR V0.1" s={21} />
      </Aparece>
    </Lienzo>
  );
}

// =====================================================================================
// Contenedores: la misma hoja entra en cualquier casa
// =====================================================================================

function MiniDoc({ x, y, s = 1, c = K.tinta }: { x: number; y: number; s?: number; c?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0,0 H44 L58,14 V76 H0 Z" fill={K.blanco} stroke={c} strokeWidth={1.6 / s} strokeLinejoin="round" />
      <path d="M44,0 V14 H58" fill="none" stroke={c} strokeWidth={1.2 / s} />
      <rect x={8} y={8} width={26} height={6} fill={K.naranja} />
      <Renglones x={8} y={26} w={42} n={5} paso={9} ancho={2.6} />
    </g>
  );
}

const CASAS = [
  { t: "Gem", cx: 140 },
  { t: "GPT / equivalente", cx: 400 },
  { t: "Otras plataformas", cx: 660 },
];

function C2Contenedores() {
  const id = useIds();
  return (
    <Lienzo label="La misma hoja de instrucciones entra en tres contenedores distintos: Gem, GPT o equivalente, y otras plataformas. Anotación: la herramienta se elige después.">
      <Defs id={id} />
      <Mesa id={id} />
      <Aparece d={0}>
        <g filter={url(id, "sombra")}>
          <MiniDoc x={371} y={18} s={1} />
        </g>
      </Aparece>
      {CASAS.map((c, i) => (
        <g key={c.t}>
          <Flecha
            d={`M400,${102} C400,140 ${c.cx},130 ${c.cx},${186}`}
            x={c.cx}
            y={186}
            ang={90}
            delay={0.4 + i * 0.15}
            c={K.grafito}
            ancho={1.8}
            t={9}
          />
          <Aparece d={0.6 + i * 0.15}>
            <path
              d={`M${c.cx - 105},270 L${c.cx},200 L${c.cx + 105},270 V410 H${c.cx - 105} Z`}
              fill={[K.papel2, K.carton, K.papel][i]}
              stroke={K.tinta}
              strokeWidth={2}
              strokeLinejoin="round"
              filter={url(id, "sombra")}
            />
            <rect x={c.cx - 56} y={276} width={112} height={110} fill={K.blanco} stroke={K.grafito} strokeWidth={1} strokeDasharray="4 4" />
            <MiniDoc x={c.cx - 26} y={292} s={0.9} />
            <text x={c.cx} y={444} textAnchor="middle" fontSize={c.t.length > 4 ? 24 : 30} fill={K.tinta} style={TIT}>
              {c.t}
            </text>
          </Aparece>
        </g>
      ))}
      <text x={400} y={488} textAnchor="middle" fontSize={30} fill={K.naranja} style={MANO}>
        la herramienta se elige después
      </text>
      <text x={448} y={60} fontSize={22} fill={K.grafito} style={MANO}>
        la misma hoja
      </text>
    </Lienzo>
  );
}

// =====================================================================================
// Rompelo: tres casos de prueba
// =====================================================================================

function C2Rompelo() {
  const id = useIds();
  return (
    <Lienzo label="Tres fichas de prueba: caso normal, caso incompleto con una esquina arrancada y caso difícil con una advertencia y una grieta; arriba, un martillo. Anotación: buscá dónde falla.">
      <Defs id={id} />
      <Mesa id={id} />
      {/* normal */}
      <Aparece d={0.1}>
        <g transform="rotate(-2 150 250)">
          <rect x={50} y={120} width={200} height={250} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} filter={url(id, "sombra")} />
          <text x={70} y={156} fontSize={22} fill={K.tinta} style={TIT}>
            CASO NORMAL
          </text>
          <Renglones x={70} y={190} w={160} n={7} paso={20} />
          <path d={tilde(196, 346, 1.1)} fill="none" stroke={K.grafito} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </Aparece>
      {/* incompleto */}
      <Aparece d={0.3}>
        <g transform="rotate(1.5 400 250)">
          <path
            d="M300,120 H500 V300 L486,310 L494,322 L470,330 L476,348 L452,352 L448,370 H300 Z"
            fill={K.blanco}
            stroke={K.tinta}
            strokeWidth={1.6}
            strokeLinejoin="round"
            filter={url(id, "sombra")}
          />
          <text x={320} y={156} fontSize={22} fill={K.tinta} style={TIT}>
            CASO INCOMPLETO
          </text>
          <Renglones x={320} y={190} w={160} n={3} paso={20} />
          <g stroke={K.niebla} strokeWidth={3} strokeLinecap="round" strokeDasharray="2 8">
            <line x1={320} y1={250} x2={470} y2={250} />
            <line x1={320} y1={270} x2={440} y2={270} />
          </g>
          <circle cx={360} cy={320} r={18} fill={K.papel2} stroke={K.grafito} strokeWidth={1.2} strokeDasharray="3 3" />
          <text x={360} y={327} textAnchor="middle" fontSize={20} fill={K.grafito} style={MANO}>
            ?
          </text>
        </g>
      </Aparece>
      {/* difícil */}
      <Aparece d={0.5}>
        <g transform="rotate(2.5 650 250)">
          <rect x={550} y={120} width={200} height={250} fill={K.blanco} stroke={K.tinta} strokeWidth={1.6} filter={url(id, "sombra")} />
          <text x={570} y={156} fontSize={22} fill={K.tinta} style={TIT}>
            CASO DIFÍCIL
          </text>
          <Renglones x={570} y={190} w={160} n={4} paso={20} />
          <path d="M650,268 L684,328 H616 Z" fill={K.naranja} stroke={K.naranja} strokeWidth={3} strokeLinejoin="round" />
          <text x={650} y={322} textAnchor="middle" fontSize={34} fill={K.blanco} style={TIT}>
            !
          </text>
        </g>
      </Aparece>
      <Traza d="M600,120 L618,170 L602,206 L630,250 L612,290 L640,370" c={K.tinta} ancho={2} delay={1.1} />
      {/* martillo */}
      <Aparece d={0.9}>
        <g transform="translate(640 66) rotate(28)">
          <rect x={-6} y={0} width={12} height={110} rx={4} fill={K.carton} stroke={K.tinta} strokeWidth={1.6} />
          <rect x={-36} y={-20} width={72} height={26} rx={3} fill={K.grafito} stroke={K.tinta} strokeWidth={1.6} />
          <rect x={-42} y={-16} width={8} height={18} fill={K.tinta} />
        </g>
      </Aparece>
      <text x={400} y={450} textAnchor="middle" fontSize={38} fill={K.naranja} style={MANO}>
        buscá dónde falla
      </text>
    </Lienzo>
  );
}

// =====================================================================================
// El nodo lleno: el proceso de la apertura, ahora con la pieza construida
// =====================================================================================

/** Punto sobre la elipse del ciclo. */
const elip = (a: number, cx = 400, cy = 380, rx = 160, ry = 62) => {
  const r = (a * Math.PI) / 180;
  return [cx + rx * Math.cos(r), cy + ry * Math.sin(r)] as const;
};

function arco(a0: number, a1: number) {
  let d = "";
  for (let k = 0; k <= 24; k++) {
    const [x, y] = elip(a0 + ((a1 - a0) * k) / 24);
    d += `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  const [x1, y1] = elip(a1);
  const [x0, y0] = elip(a1 - 2);
  const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
  return { d, x: +x1.toFixed(1), y: +y1.toFixed(1), ang };
}

const NODOS = [
  { t: "Recibir", x: 22 },
  { t: "Identificar", x: 172 },
  { t: "Responder", x: 503 },
  { t: "Registrar", x: 653 },
];

function C2NodoLleno() {
  const id = useIds();
  const tramos = [arco(200, 300), arco(320, 420), arco(80, 180)];
  return (
    <Lienzo label="El proceso de cinco pasos: recibir, identificar, una pieza construida llamada asistente v0.1 con sello de prototipo, responder y registrar. Debajo, un ciclo: construir, probar, corregir.">
      <Defs id={id} />
      <Mesa id={id} />
      {NODOS.map((n, i) => (
        <Aparece key={n.t} d={0.1 + i * 0.1}>
          <rect x={n.x} y={140} width={125} height={66} rx={4} fill={K.blanco} stroke={K.grafito} strokeWidth={1.5} filter={url(id, "sombra-chica")} />
          <text x={n.x + 62.5} y={180} textAnchor="middle" fontSize={22} fill={K.grafito} style={TIT}>
            {n.t}
          </text>
        </Aparece>
      ))}
      {[
        [147, 170],
        [297, 318],
        [482, 501],
        [628, 651],
      ].map(([a, b]) => (
        <Flecha key={a} d={`M${a},173 H${b}`} x={b} y={173} ang={0} c={K.grafito} t={7} ancho={1.8} delay={0.6} />
      ))}

      <Aparece d={0.7}>
        <path
          d="M322,112 H480 V156 a12,12 0 0 0 0,34 V236 H322 V190 a12,12 0 0 1 0,-34 Z"
          fill={K.blanco}
          stroke={K.naranja}
          strokeWidth={3.4}
          strokeLinejoin="round"
          filter={url(id, "sombra")}
        />
        <rect x={334} y={124} width={134} height={100} fill={url(id, "trama")} opacity={0.12} />
        <text x={401} y={172} textAnchor="middle" fontSize={28} fill={K.tinta} style={TIT}>
          asistente
        </text>
        <text x={401} y={200} textAnchor="middle" fontSize={18} fill={K.naranja} style={{ ...MONO, letterSpacing: "0.1em" }}>
          v0.1
        </text>
      </Aparece>
      <Cinta x={306} y={104} r={-28} w={44} />
      <Cinta x={456} y={96} r={24} w={44} />
      <Aparece d={1.1}>
        <Sello id={id} x={452} y={240} r={-8} w={130} texto="PROTOTIPO" s={18} />
      </Aparece>

      {tramos.map((t, i) => (
        <Flecha key={i} d={t.d} x={t.x} y={t.y} ang={t.ang} delay={1.3 + i * 0.3} c={K.naranja} ancho={2.6} t={11} />
      ))}
      <text x={400} y={308} textAnchor="middle" fontSize={30} fill={K.tinta} style={MANO}>
        construir
      </text>
      <text x={606} y={410} textAnchor="start" fontSize={30} fill={K.tinta} style={MANO}>
        probar
      </text>
      <text x={194} y={410} textAnchor="end" fontSize={30} fill={K.tinta} style={MANO}>
        corregir
      </text>
    </Lienzo>
  );
}

// --- Registro ------------------------------------------------------------------------

export const ILUS_E: Record<string, ComponentType> = {
  "c2-cajas": C2Cajas,
  "c2-cajas-instrucciones": C2CajasInstrucciones,
  "c2-cajas-contexto": C2CajasContexto,
  "c2-cajas-conocimiento": C2CajasConocimiento,
  "c2-de-donde": C2DeDonde,
  "c2-base": C2Base,
  "c2-notebook": C2Notebook,
  "c2-mochila": C2Mochila,
  "c2-no-sabe": C2NoSabe,
  "c2-detenerse": C2Detenerse,
  "c2-humano": C2Humano,
  "c2-system-prompt": C2SystemPrompt,
  "c2-contenedores": C2Contenedores,
  "c2-rompelo": C2Rompelo,
  "c2-nodo-lleno": C2NodoLleno,
};
