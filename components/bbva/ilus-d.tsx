"use client";

// Ilustraciones de la Clase 2 del Laboratorio BBVA: "Del proceso al asistente".
// Continúa el collage editorial sobre papel de ilus-a/b/c, pero ahora en clave
// de taller de construcción: planos, fichas técnicas, piezas que encajan,
// cotas, cajas de instrucciones. La IA es un sistema que se diseña, nunca un
// personaje (nada de robots, cerebros ni hologramas).
//
// Cada componente llena su contenedor y escala con la placa gracias al viewBox
// (0 0 800 500). Las claves son strings planos para no acoplar tipos con
// lib/bbva-clase.

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
  rojo: "#c0392b",
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
  return (n: string) => `id${crudo}-${n}`;
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
      {/* Cuadrícula de plano (fina cada 20, gruesa cada 100). */}
      <pattern id={id("grilla")} width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M20 0 H0 V20" fill="none" stroke={K.cielo} strokeWidth="0.5" strokeOpacity="0.35" />
      </pattern>
      <pattern id={id("grilla2")} width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M100 0 H0 V100" fill="none" stroke={K.cielo} strokeWidth="1" strokeOpacity="0.45" />
      </pattern>
      <linearGradient id={id("postit")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f7d465" />
        <stop offset="1" stopColor={K.ambar} />
      </linearGradient>
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

/** Trazo a mano que se dibuja solo. */
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

/** Sello rectangular de tinta, centrado en (x, y). */
function Sello({ id, x, y, r = -8, texto, c = K.naranja, fs = 30, d = 0 }: { id: Id; x: number; y: number; r?: number; texto: string; c?: string; fs?: number; d?: number }) {
  const w = texto.length * fs * 0.52 + 34;
  const h = fs + 24;
  return (
    <Pieza x={x} y={y} r={r} d={d}>
      <g filter={url(id, "tinta")}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={4} fill="none" stroke={c} strokeWidth={3.4} />
        <rect x={-w / 2 + 5} y={-h / 2 + 5} width={w - 10} height={h - 10} rx={2} fill="none" stroke={c} strokeWidth={1.2} />
        <text x={0} y={fs * 0.36} textAnchor="middle" fontSize={fs} fill={c} style={{ ...TIT, letterSpacing: "0.08em" }}>
          {texto}
        </text>
      </g>
    </Pieza>
  );
}

/** Renglones grises de "texto genérico" (anchos relativos 0–1). */
function Renglones({ x, y, w, anchos, paso = 16, alto = 6, c = K.niebla }: { x: number; y: number; w: number; anchos: number[]; paso?: number; alto?: number; c?: string }) {
  return (
    <g>
      {anchos.map((a, i) => (
        <rect key={i} x={x} y={y + i * paso} width={w * a} height={alto} rx={alto / 2} fill={c} />
      ))}
    </g>
  );
}

/** Fondo de plano: lámina azul pizarra con cuadrícula y margen. */
function Plano({ id }: { id: Id }) {
  return (
    <g>
      <rect x={10} y={10} width={780} height={480} fill={K.pizarra2} filter={url(id, "sombra")} />
      <rect x={10} y={10} width={780} height={480} fill={url(id, "grilla")} />
      <rect x={10} y={10} width={780} height={480} fill={url(id, "grilla2")} />
      <rect x={22} y={22} width={756} height={456} fill="none" stroke={K.cielo} strokeOpacity={0.6} strokeWidth={1} />
    </g>
  );
}

/** Tornillo visto de arriba. */
function Tornillo({ x, y, r = 14, giro = 20 }: { x: number; y: number; r?: number; giro?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <circle r={r} fill={K.niebla} stroke={K.tinta} strokeWidth={1.6} />
      <circle r={r * 0.72} fill="none" stroke={K.gris} strokeWidth={0.8} />
      <line x1={-r * 0.6} y1={0} x2={r * 0.6} y2={0} stroke={K.tinta} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
}

// --- c2-nodo-vacio ------------------------------------------------------------------

const PASOS_NODO = ["Recibir", "Identificar", "", "Responder", "Registrar"];

function NodoVacio() {
  const id = useIds();
  const X = (i: number) => 20 + i * 156;
  const Y = 200;
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Flujo de trabajo de cinco pasos: recibir, identificar, un paso vacío marcado con un círculo y la nota 'acá', responder y registrar.">
      <Defs id={id} />
      <text x={20} y={150} fontSize={13} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
        PROCESO DE TRABAJO
      </text>
      {PASOS_NODO.map((t, i) => (
        <g key={i}>
          <Pieza x={X(i)} y={Y} r={t ? [-1.5, 1, 0, -1, 1.5][i] : 0} d={0.1 + i * 0.12}>
            {t ? (
              <>
                <rect width={124} height={110} fill={K.blanco} filter={url(id, "sombra-chica")} />
                <text x={12} y={26} fontSize={13} fill={K.gris} style={MONO}>
                  0{i + 1}
                </text>
                <text x={62} y={74} textAnchor="middle" fontSize={25} fill={K.tinta} style={TIT}>
                  {t}
                </text>
              </>
            ) : (
              <>
                <rect width={124} height={110} fill={K.papel2} fillOpacity={0.5} stroke={K.grafito} strokeWidth={2} strokeDasharray="7 6" />
                <text x={12} y={26} fontSize={13} fill={K.gris} style={MONO}>
                  03
                </text>
                <text x={62} y={78} textAnchor="middle" fontSize={40} fill={K.gris} style={SERIF}>
                  ?
                </text>
              </>
            )}
          </Pieza>
          {i < 4 && <Flecha d={`M${X(i) + 128},${Y + 55} H${X(i + 1) - 6}`} x={X(i + 1) - 6} y={Y + 55} ang={0} delay={0.6 + i * 0.12} c={K.tinta} ancho={1.8} t={8} />}
        </g>
      ))}
      <Cinta x={40} y={192} w={46} h={14} r={-6} />
      <Cinta x={680} y={302} w={46} h={14} r={8} />
      {/* El círculo naranja y la nota */}
      <Traza d="M330,196 C380,168 470,176 480,240 C490,310 400,336 340,320 C290,306 292,226 340,200" delay={1.3} c={K.naranja} ancho={3.4} />
      <text x={470} y={110} fontSize={60} fill={K.naranja} style={MANO}>
        acá
      </text>
      <Flecha d="M462,104 C430,110 418,140 414,176" x={414} y={176} ang={95} delay={1.8} c={K.naranja} ancho={2.6} t={11} />
    </svg>
  );
}

// --- c2-prototipo -------------------------------------------------------------------

function Prototipo() {
  const id = useIds();
  const filas = [
    { k: "PROPÓSITO", v: "clasificar reclamos" },
    { k: "ENTRADAS", v: "texto del reclamo" },
    { k: "MÉTODO", v: "" },
    { k: "SALIDA", v: "" },
  ];
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ficha técnica del Asistente v0.1 sobre un plano, con tornillos sueltos, una regla y la nota 'en ajuste'.">
      <Defs id={id} />
      <Plano id={id} />
      <Pieza x={120} y={50} r={-2} d={0.15}>
        <rect width={400} height={370} fill={K.blanco} filter={url(id, "sombra")} />
        <text x={26} y={38} fontSize={14} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          FICHA TÉCNICA
        </text>
        <text x={26} y={86} fontSize={44} fill={K.tinta} style={TIT}>
          Asistente v0.1
        </text>
        <line x1={26} y1={104} x2={374} y2={104} stroke={K.tinta} strokeWidth={1.4} />
        {filas.map((f, i) => (
          <g key={f.k} transform={`translate(26 ${140 + i * 58})`}>
            <text x={0} y={0} fontSize={13} fill={K.gris} style={{ ...MONO, letterSpacing: "0.14em" }}>
              {f.k}
            </text>
            <line x1={0} y1={30} x2={348} y2={30} stroke={K.niebla} strokeWidth={1.3} strokeDasharray={f.v ? undefined : "5 5"} />
            {f.v && (
              <text x={4} y={25} fontSize={25} fill={K.pizarra2} style={MANO}>
                {f.v}
              </text>
            )}
          </g>
        ))}
      </Pieza>
      <Cinta x={140} y={36} w={56} h={16} r={-10} />
      <Cinta x={470} y={40} w={56} h={16} r={12} />
      {/* Regla */}
      <Pieza x={420} y={410} r={-8} d={0.6}>
        <rect width={330} height={36} fill={K.carton} stroke={K.grafito} strokeWidth={1.2} filter={url(id, "sombra-chica")} />
        {Array.from({ length: 32 }, (_, i) => (
          <line key={i} x1={10 + i * 10} y1={0} x2={10 + i * 10} y2={i % 5 === 0 ? 16 : 8} stroke={K.grafito} strokeWidth={1} />
        ))}
      </Pieza>
      {/* Piezas sueltas */}
      <Aparece d={0.8}>
        <Tornillo x={600} y={140} giro={30} />
        <Tornillo x={650} y={180} r={11} giro={-20} />
        <g transform="translate(590 230) rotate(18)">
          <rect width={60} height={18} rx={3} fill={K.niebla} stroke={K.tinta} strokeWidth={1.4} />
          <circle cx={12} cy={9} r={4} fill={K.pizarra2} />
          <circle cx={48} cy={9} r={4} fill={K.pizarra2} />
        </g>
      </Aparece>
      <text x={590} y={330} fontSize={46} fill={K.naranja} style={MANO} transform="rotate(-6 590 330)">
        en ajuste
      </text>
      <Flecha d="M590,318 C560,300 540,300 512,310" x={512} y={310} ang={170} delay={1.4} c={K.naranja} ancho={2.6} />
    </svg>
  );
}

// --- c2-tarea -----------------------------------------------------------------------

function Tarea() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Arriba una tarjeta tachada: 'ayudarme con los reclamos' (intención). Abajo: 'clasificar el motivo de cada reclamo que entra', con el sello TAREA.">
      <Defs id={id} />
      <Pieza x={180} y={40} r={-2} d={0.1}>
        <rect width={440} height={140} fill={K.papel2} filter={url(id, "sombra-chica")} />
        <text x={24} y={34} fontSize={13} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
          INTENCIÓN
        </text>
        <text x={220} y={96} textAnchor="middle" fontSize={40} fill={K.grafito} style={SERIF}>
          “ayudarme con los reclamos”
        </text>
      </Pieza>
      <Traza d="M210,126 C330,118 480,124 600,112" delay={0.6} c={K.tinta} ancho={3.2} />
      <Flecha d="M150,140 C110,200 110,260 140,300" x={140} y={300} ang={60} delay={0.9} c={K.grafito} ancho={2} />
      <Pieza x={130} y={250} r={1} d={0.5}>
        <rect width={560} height={200} fill={K.blanco} filter={url(id, "sombra")} />
        <rect width={8} height={200} fill={K.naranja} />
        <text x={32} y={40} fontSize={13} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          TAREA CONCRETA
        </text>
        <text x={32} y={100} fontSize={40} fill={K.tinta} style={TIT}>
          clasificar el motivo de cada
        </text>
        <text x={32} y={148} fontSize={40} fill={K.tinta} style={TIT}>
          reclamo que entra
        </text>
      </Pieza>
      <Cinta x={380} y={240} w={60} h={16} r={-3} />
      <Sello id={id} x={600} y={420} r={-10} texto="TAREA" fs={34} d={1.2} />
    </svg>
  );
}

// --- c2-achicalo --------------------------------------------------------------------

function Achicalo() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Zoom en tres cuadros anidados: el proceso, dentro una tarea y dentro una pequeña operación resaltada bajo una lupa.">
      <Defs id={id} />
      <Pieza d={0}>
        <rect x={30} y={30} width={740} height={440} fill={K.papel} stroke={K.grafito} strokeWidth={1.6} filter={url(id, "sombra")} />
        <text x={52} y={78} fontSize={40} fill={K.grafito} style={TIT}>
          PROCESO
        </text>
      </Pieza>
      {/* Líneas de zoom */}
      <g stroke={K.gris} strokeWidth={1} strokeDasharray="4 5">
        <line x1={30} y1={30} x2={220} y2={140} />
        <line x1={770} y1={30} x2={620} y2={140} />
        <line x1={30} y1={470} x2={220} y2={420} />
        <line x1={220} y1={140} x2={410} y2={290} />
        <line x1={620} y1={140} x2={560} y2={290} />
        <line x1={220} y1={420} x2={410} y2={360} />
      </g>
      <Pieza d={0.35}>
        <rect x={220} y={140} width={400} height={280} fill={K.blanco} stroke={K.tinta} strokeWidth={1.8} filter={url(id, "sombra-chica")} />
        <text x={238} y={178} fontSize={32} fill={K.tinta} style={TIT}>
          TAREA
        </text>
      </Pieza>
      <Pieza d={0.7}>
        <rect x={410} y={290} width={150} height={70} fill={K.naranja} fillOpacity={0.16} stroke={K.naranja} strokeWidth={3} />
        <text x={485} y={333} textAnchor="middle" fontSize={22} fill={K.naranja} style={TIT}>
          OPERACIÓN
        </text>
      </Pieza>
      {/* Lupa */}
      <Aparece d={1.1}>
        <circle cx={485} cy={325} r={98} fill={K.cielo} fillOpacity={0.12} stroke={K.tinta} strokeWidth={7} />
        <circle cx={485} cy={325} r={90} fill="none" stroke={K.blanco} strokeWidth={1.5} strokeOpacity={0.8} />
        <line x1={555} y1={395} x2={625} y2={462} stroke={K.tinta} strokeWidth={16} strokeLinecap="round" />
      </Aparece>
      <text x={660} y={110} fontSize={44} fill={K.naranja} style={MANO} transform="rotate(-6 660 110)">
        achicalo
      </text>
    </svg>
  );
}

// --- c2-chat-vacio ------------------------------------------------------------------

function ChatVacio() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Ventana de chat en blanco: el pedido 'Armame el informe mensual' y una respuesta genérica en renglones grises. Nota: 'responde… ¿pero así trabajamos?'.">
      <Defs id={id} />
      <Pieza x={120} y={20} d={0}>
        <rect width={560} height={380} rx={10} fill={K.blanco} filter={url(id, "sombra")} />
        <path d="M0,10 a10,10 0 0 1 10,-10 H550 a10,10 0 0 1 10,10 V34 H0 Z" fill={K.papel2} />
        {[20, 38, 56].map((cx) => (
          <circle key={cx} cx={cx} cy={17} r={5} fill={K.niebla} />
        ))}
        <rect x={20} y={336} width={520} height={30} rx={15} fill="none" stroke={K.niebla} strokeWidth={1.5} />
      </Pieza>
      <Pieza x={370} y={76} d={0.3}>
        <rect width={290} height={50} rx={14} fill={K.pizarra2} />
        <text x={145} y={32} textAnchor="middle" fontSize={21} fill={K.blanco} style={SANS}>
          Armame el informe mensual
        </text>
      </Pieza>
      <Pieza x={142} y={148} d={0.7}>
        <rect width={400} height={190} rx={14} fill={K.papel} />
        <Renglones x={22} y={22} w={300} anchos={[0.6]} alto={9} c={K.gris} />
        <Renglones x={22} y={50} w={356} anchos={[1, 0.94, 0.98, 0.7]} paso={18} alto={7} />
        <Renglones x={22} y={132} w={356} anchos={[0.96, 0.88, 0.5]} paso={18} alto={7} />
      </Pieza>
      <text x={400} y={462} textAnchor="middle" fontSize={44} fill={K.naranja} style={MANO}>
        responde… ¿pero así trabajamos?
      </text>
      <Flecha d="M560,428 C590,400 590,340 556,300" x={556} y={300} ang={240} delay={1.4} c={K.naranja} ancho={2.4} />
    </svg>
  );
}

// --- c2-plausible -------------------------------------------------------------------

function Plausible() {
  const id = useIds();
  const X = [50, 295, 540];
  const R = [-3, 1, 3];
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="El mismo pedido respondido tres veces en tres hojas con formatos distintos: viñetas, tabla y párrafo. Nota: 'tres respuestas, tres formatos'.">
      <Defs id={id} />
      <Pieza x={260} y={18} d={0}>
        <rect width={280} height={46} rx={12} fill={K.pizarra2} />
        <text x={140} y={30} textAnchor="middle" fontSize={20} fill={K.blanco} style={SANS}>
          Armame el informe mensual
        </text>
      </Pieza>
      {X.map((x, i) => (
        <Flecha key={x} d={`M400,70 C400,90 ${x + 105},84 ${x + 105},112`} x={x + 105} y={112} ang={90} delay={0.3 + i * 0.1} c={K.gris} ancho={1.5} t={7} />
      ))}
      {X.map((x, i) => (
        <Pieza key={x} x={x} y={122} r={R[i]} d={0.5 + i * 0.2}>
          <rect width={210} height={270} fill={K.blanco} filter={url(id, "sombra")} />
          <text x={16} y={28} fontSize={12} fill={K.gris} style={MONO}>
            RESPUESTA {i + 1}
          </text>
          <Renglones x={16} y={42} w={150} anchos={[0.9]} alto={9} c={K.grafito} />
          {i === 0 &&
            [0, 1, 2, 3, 4].map((k) => (
              <g key={k}>
                <circle cx={22} cy={80 + k * 36} r={4} fill={K.grafito} />
                <Renglones x={34} y={77 + k * 36} w={156} anchos={[[0.9, 0.7, 0.85, 0.6, 0.75][k]]} alto={7} />
              </g>
            ))}
          {i === 1 && (
            <g>
              <rect x={16} y={70} width={178} height={170} fill="none" stroke={K.grafito} strokeWidth={1.2} />
              <rect x={16} y={70} width={178} height={28} fill={K.papel2} stroke={K.grafito} strokeWidth={1.2} />
              {[98, 126, 154, 182, 210].map((y) => (
                <line key={y} x1={16} y1={y} x2={194} y2={y} stroke={K.niebla} strokeWidth={1} />
              ))}
              {[75, 135].map((xx) => (
                <line key={xx} x1={xx} y1={70} x2={xx} y2={240} stroke={K.niebla} strokeWidth={1} />
              ))}
            </g>
          )}
          {i === 2 && (
            <g>
              <Renglones x={16} y={74} w={178} anchos={[1, 0.95, 1, 0.9, 0.6]} paso={16} alto={6} />
              <Renglones x={16} y={164} w={178} anchos={[0.97, 1, 0.92, 0.45]} paso={16} alto={6} />
            </g>
          )}
        </Pieza>
      ))}
      <text x={400} y={470} textAnchor="middle" fontSize={46} fill={K.naranja} style={MANO}>
        tres respuestas, tres formatos
      </text>
    </svg>
  );
}

// --- c2-faltan ----------------------------------------------------------------------

const PIEZAS_FALTAN = ["MÉTODO", "CONTEXTO", "CONOCIMIENTO", "LÍMITES"];

function Faltan() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Un marco con un pequeño 'prompt' ya colocado y cuatro huecos vacíos: método, contexto, conocimiento y límites.">
      <Defs id={id} />
      <Pieza d={0}>
        <rect x={50} y={30} width={700} height={440} fill={K.papel} stroke={K.grafito} strokeWidth={1.6} filter={url(id, "sombra")} />
        <text x={76} y={66} fontSize={13} fill={K.grafito} style={{ ...MONO, letterSpacing: "0.2em" }}>
          ARMADO DEL ASISTENTE
        </text>
      </Pieza>
      <Pieza x={340} y={96} r={-2} d={0.4}>
        <rect width={120} height={52} fill={K.blanco} filter={url(id, "sombra-chica")} />
        <text x={60} y={33} textAnchor="middle" fontSize={22} fill={K.tinta} style={MONO}>
          prompt
        </text>
      </Pieza>
      <Cinta x={378} y={88} w={44} h={13} r={-4} />
      {PIEZAS_FALTAN.map((t, i) => {
        const x = 82 + i * 162;
        return (
          <Aparece key={t} d={0.7 + i * 0.12}>
            <rect x={x} y={200} width={148} height={200} rx={4} fill="none" stroke={K.grafito} strokeWidth={2} strokeDasharray="8 6" />
            <text x={x + 74} y={300} textAnchor="middle" fontSize={22} fill={K.grafito} style={TIT}>
              {t}
            </text>
            <text x={x + 74} y={384} textAnchor="middle" fontSize={12} fill={K.gris} style={MONO}>
              vacío
            </text>
          </Aparece>
        );
      })}
      <text x={520} y={150} fontSize={40} fill={K.naranja} style={MANO} transform="rotate(-4 520 150)">
        ¿y lo demás?
      </text>
    </svg>
  );
}

// --- c2-plano (cuatro variantes) ----------------------------------------------------

type Bloque = "proposito" | "entradas" | "metodo" | "salida";

const BLOQUES: { k: Bloque; t: string; s: string }[] = [
  { k: "proposito", t: "PROPÓSITO", s: "para qué" },
  { k: "entradas", t: "ENTRADAS", s: "qué recibe" },
  { k: "metodo", t: "MÉTODO", s: "cómo trabaja" },
  { k: "salida", t: "SALIDA", s: "qué entrega" },
];

const XB = (i: number) => 44 + i * 188;
const YB = 170;
const WB = 150;

function PlanoAsistente({ activo }: { activo: Bloque }) {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label={`Plano del asistente en cuatro bloques: propósito, entradas, método y salida. Resaltado: ${BLOQUES.find((b) => b.k === activo)?.t.toLowerCase()}.`}>
      <Defs id={id} />
      <Plano id={id} />
      <text x={44} y={70} fontSize={14} fill={K.cielo} style={{ ...MONO, letterSpacing: "0.22em" }}>
        PLANO · ASISTENTE v0.1
      </text>
      {BLOQUES.map((b, i) => {
        const on = b.k === activo;
        const x = XB(i);
        return (
          <g key={b.k}>
            <Aparece d={0.15 + i * 0.12}>
              <rect x={x} y={YB} width={WB} height={WB} fill={on ? K.naranja : "none"} stroke={on ? K.naranja : K.blanco} strokeWidth={on ? 3 : 2} filter={on ? url(id, "sombra") : undefined} />
              <text x={x + 12} y={YB + 24} fontSize={13} fill={on ? K.blanco : K.cielo} style={MONO}>
                0{i + 1}
              </text>
              <text x={x + WB / 2} y={YB + 86} textAnchor="middle" fontSize={26} fill={K.blanco} style={TIT}>
                {b.t}
              </text>
              <text x={x + WB / 2} y={YB + WB + 32} textAnchor="middle" fontSize={24} fill={on ? K.naranja : K.cielo} style={MANO}>
                {b.s}
              </text>
            </Aparece>
            {i < 3 && <Flecha d={`M${x + WB + 6},${YB + WB / 2} H${XB(i + 1) - 6}`} x={XB(i + 1) - 6} y={YB + WB / 2} ang={0} delay={0.5 + i * 0.1} c={K.blanco} ancho={2} t={8} />}
          </g>
        );
      })}
      {/* Cota */}
      <g stroke={K.cielo} strokeWidth={1} strokeOpacity={0.8}>
        <line x1={44} y1={410} x2={756} y2={410} />
        <line x1={44} y1={402} x2={44} y2={418} />
        <line x1={756} y1={402} x2={756} y2={418} />
      </g>
      <text x={400} y={438} textAnchor="middle" fontSize={12} fill={K.cielo} style={{ ...MONO, letterSpacing: "0.2em" }}>
        DEL PEDIDO A LA ENTREGA
      </text>
    </svg>
  );
}

const PlanoProposito = () => <PlanoAsistente activo="proposito" />;
const PlanoEntradas = () => <PlanoAsistente activo="entradas" />;
const PlanoMetodo = () => <PlanoAsistente activo="metodo" />;
const PlanoSalida = () => <PlanoAsistente activo="salida" />;

// --- c2-ayude -----------------------------------------------------------------------

const CHECKS = ["clasificó el motivo", "citó la norma", "marcó lo que falta"];

function Ayude() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="A la izquierda un post-it tachado: 'que me ayude'. A la derecha una tarjeta: 'Terminó bien si…' con tres tildes: clasificó el motivo, citó la norma, marcó lo que falta.">
      <Defs id={id} />
      <Pieza x={60} y={140} r={-6} d={0}>
        <rect width={220} height={200} fill={url(id, "postit")} filter={url(id, "sombra-chica")} />
        <text x={110} y={112} textAnchor="middle" fontSize={44} fill={K.tinta} style={MANO}>
          que me ayude
        </text>
      </Pieza>
      <Traza d="M70,236 C130,226 210,220 286,206" delay={0.5} c={K.tinta} ancho={3.4} />
      <Flecha d="M290,320 C320,340 340,330 356,310" x={356} y={310} ang={-50} delay={0.8} c={K.naranja} ancho={2.6} />
      <Pieza x={370} y={60} r={1.5} d={0.4}>
        <rect width={380} height={370} fill={K.blanco} filter={url(id, "sombra")} />
        <text x={30} y={40} fontSize={13} fill={K.gris} style={{ ...MONO, letterSpacing: "0.2em" }}>
          CRITERIO DE ÉXITO
        </text>
        <text x={30} y={92} fontSize={38} fill={K.tinta} style={SERIF}>
          Terminó bien si…
        </text>
        <line x1={30} y1={112} x2={350} y2={112} stroke={K.tinta} strokeWidth={1.2} />
        {CHECKS.map((c, i) => (
          <g key={c} transform={`translate(30 ${160 + i * 70})`}>
            <rect x={0} y={-22} width={30} height={30} fill="none" stroke={K.tinta} strokeWidth={2} />
            <text x={48} y={2} fontSize={25} fill={K.tinta} style={SANS}>
              {c}
            </text>
          </g>
        ))}
      </Pieza>
      <Cinta x={530} y={48} w={60} h={16} r={4} />
      {CHECKS.map((c, i) => {
        const y = 218 + i * 70;
        return <Traza key={c} d={`M404,${y - 4} L414,${y + 8} L436,${y - 22}`} delay={1.1 + i * 0.3} c={K.naranja} ancho={4} />;
      })}
    </svg>
  );
}

// --- c2-esqueleto -------------------------------------------------------------------

function Esqueleto() {
  const id = useIds();
  return (
    <svg viewBox="0 0 800 500" className="h-full w-full" preserveAspectRatio="xMidYMid meet" role="img" aria-label="El plano completo del asistente: propósito, entradas, método y salida, los cuatro bloques llenos y unidos, con el sello ESQUELETO.">
      <Defs id={id} />
      <Plano id={id} />
      <text x={44} y={70} fontSize={14} fill={K.cielo} style={{ ...MONO, letterSpacing: "0.22em" }}>
        PLANO · ASISTENTE v0.1 · COMPLETO
      </text>
      {/* Unión: una barra continua detrás de los bloques */}
      <rect x={XB(0) + WB / 2} y={YB + WB / 2 - 5} width={XB(3) - XB(0)} height={10} fill={K.cielo} fillOpacity={0.7} />
      {BLOQUES.map((b, i) => {
        const x = XB(i);
        return (
          <g key={b.k}>
            <Pieza x={x} y={YB} r={[-1.5, 1, -1, 1.5][i]} d={0.15 + i * 0.15}>
              <rect width={WB} height={WB} fill={i === 2 ? K.naranja : K.blanco} filter={url(id, "sombra")} />
              <text x={12} y={24} fontSize={13} fill={i === 2 ? K.blanco : K.gris} style={MONO}>
                0{i + 1}
              </text>
              <text x={WB / 2} y={84} textAnchor="middle" fontSize={26} fill={i === 2 ? K.blanco : K.tinta} style={TIT}>
                {b.t}
              </text>
              <Renglones x={30} y={104} w={90} anchos={[1, 0.7]} paso={12} alto={5} c={i === 2 ? K.blanco : K.niebla} />
            </Pieza>
            <Cinta x={x + 48} y={YB - 8} w={54} h={15} r={[-5, 4, -3, 6][i]} />
            <text x={x + WB / 2} y={YB + WB + 32} textAnchor="middle" fontSize={24} fill={K.cielo} style={MANO}>
              {b.s}
            </text>
          </g>
        );
      })}
      <Sello id={id} x={590} y={420} r={-7} texto="ESQUELETO" fs={32} c={K.naranja} d={1.1} />
    </svg>
  );
}

// --- Registro ------------------------------------------------------------------------

export const ILUS_D: Record<string, ComponentType> = {
  "c2-nodo-vacio": NodoVacio,
  "c2-prototipo": Prototipo,
  "c2-tarea": Tarea,
  "c2-achicalo": Achicalo,
  "c2-chat-vacio": ChatVacio,
  "c2-plausible": Plausible,
  "c2-faltan": Faltan,
  "c2-plano-proposito": PlanoProposito,
  "c2-plano-entradas": PlanoEntradas,
  "c2-plano-metodo": PlanoMetodo,
  "c2-plano-salida": PlanoSalida,
  "c2-ayude": Ayude,
  "c2-esqueleto": Esqueleto,
};
