"use client";

// Diagramas animados de la clase "Empresas e IA" (/empresas/clase).
// SVG con animación SMIL: no dependen de CSS externo y corren solos,
// pensados para explicar visualmente mientras se comparte pantalla.

const TEAL = "#2dd4bf";
const CYAN = "#22d3ee";
const VIOLET = "#8b5cf6";
const AMBER = "#fbbf24";
const LINE = "#3b3f6e";
const TEXT = "#c7c9e8";
const FAINT = "#7e81ab";

export type DiagramaId =
  | "io"
  | "surge"
  | "reparto"
  | "scoring"
  | "decisiones"
  | "ruta"
  | "reglas"
  | "engranajes"
  | "hub"
  | "tareas"
  | "boomerang"
  | "escritorio"
  | "escenas"
  | "contrato"
  | "fuga"
  | "anillos"
  | "cadena"
  | "sellos"
  | "empresa"
  | "datos";

export function Diagrama({ id }: { id: DiagramaId }) {
  switch (id) {
    case "io":
      return <DiagramaIO />;
    case "surge":
      return <DiagramaSurge />;
    case "reparto":
      return <DiagramaReparto />;
    case "scoring":
      return <DiagramaScoring />;
    case "decisiones":
      return <DiagramaDecisiones />;
    case "ruta":
      return <DiagramaRuta />;
    case "reglas":
      return <DiagramaReglas />;
    case "engranajes":
      return <DiagramaEngranajes />;
    case "hub":
      return <DiagramaHub />;
    case "tareas":
      return <DiagramaTareas />;
    case "boomerang":
      return <DiagramaBoomerang />;
    case "escritorio":
      return <DiagramaEscritorio />;
    case "escenas":
      return <DiagramaEscenas />;
    case "contrato":
      return <DiagramaContrato />;
    case "fuga":
      return <DiagramaFuga />;
    case "anillos":
      return <DiagramaAnillos />;
    case "cadena":
      return <DiagramaCadena />;
    case "sellos":
      return <DiagramaSellos />;
    case "empresa":
      return <DiagramaEmpresa />;
    case "datos":
      return <DiagramaDatos />;
  }
}

function Caja({ x, y, w, h, titulo, sub, color }: { x: number; y: number; w: number; h: number; titulo: string; sub: string; color: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="14" fill="none" stroke={color} strokeWidth="2" />
      <text x={x + w / 2} y={y + h / 2 - 6} textAnchor="middle" fill={color} fontSize="17" fontWeight="700" fontFamily="monospace">
        {titulo}
      </text>
      <text x={x + w / 2} y={y + h / 2 + 16} textAnchor="middle" fill={FAINT} fontSize="11">
        {sub}
      </text>
    </g>
  );
}

/** Inputs → modelo → outputs, con datos fluyendo. */
export function DiagramaIO() {
  return (
    <svg viewBox="0 0 640 220" role="img" aria-label="Esquema: inputs, modelo, outputs" className="w-full max-w-2xl">
      <Caja x={20} y={70} w={160} h={80} titulo="INPUTS" sub="información + instrucciones" color={CYAN} />
      <Caja x={240} y={70} w={160} h={80} titulo="MODELO" sub="procesa patrones" color={VIOLET} />
      <Caja x={460} y={70} w={160} h={80} titulo="OUTPUTS" sub="texto · imagen · video · código" color={TEAL} />
      <line x1="180" y1="110" x2="240" y2="110" stroke={LINE} strokeWidth="2" />
      <line x1="400" y1="110" x2="460" y2="110" stroke={LINE} strokeWidth="2" />
      {[0, 0.8, 1.6].map((d) => (
        <circle key={`a${d}`} r="4" fill={CYAN}>
          <animateMotion dur="2.4s" begin={`${d}s`} repeatCount="indefinite" path="M180,110 L240,110" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${d}s`} repeatCount="indefinite" />
        </circle>
      ))}
      {[0.4, 1.2, 2].map((d) => (
        <circle key={`b${d}`} r="4" fill={TEAL}>
          <animateMotion dur="2.4s" begin={`${d}s`} repeatCount="indefinite" path="M400,110 L460,110" />
          <animate attributeName="opacity" values="0;1;1;0" dur="2.4s" begin={`${d}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <rect x={240} y={70} width={160} height={80} rx="14" fill={VIOLET} opacity="0.08">
        <animate attributeName="opacity" values="0.04;0.16;0.04" dur="2.4s" repeatCount="indefinite" />
      </rect>
      <text x="320" y="35" textAnchor="middle" fill={TEXT} fontSize="13">
        No “entiende”: procesa y devuelve un resultado
      </text>
    </svg>
  );
}

/** Precio dinámico: la demanda sube, el multiplicador también. */
export function DiagramaSurge() {
  const barras = [42, 58, 50, 74, 96, 128];
  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="Precio dinámico según demanda" className="w-full max-w-2xl">
      {barras.map((h, i) => (
        <rect key={i} x={40 + i * 62} y={200 - h} width="38" rx="6" fill={CYAN} opacity="0.75" height={h}>
          <animate attributeName="height" values={`0;${h}`} dur="1.2s" begin={`${i * 0.18}s`} fill="freeze" />
          <animate attributeName="y" values={`200;${200 - h}`} dur="1.2s" begin={`${i * 0.18}s`} fill="freeze" />
        </rect>
      ))}
      <text x="220" y="228" textAnchor="middle" fill={FAINT} fontSize="12">
        demanda (viernes, 21 hs, llueve)
      </text>
      <path d="M60,180 C180,170 300,140 420,84" fill="none" stroke={AMBER} strokeWidth="3" strokeDasharray="420" strokeDashoffset="420">
        <animate attributeName="stroke-dashoffset" values="420;0" dur="1.8s" begin="0.6s" fill="freeze" />
      </path>
      <g>
        <rect x="440" y="52" width="150" height="56" rx="14" fill={AMBER} opacity="0.14" stroke={AMBER} strokeWidth="2" />
        <text x="515" y="76" textAnchor="middle" fill={AMBER} fontSize="20" fontWeight="700" fontFamily="monospace">
          × 2,4
        </text>
        <text x="515" y="96" textAnchor="middle" fill={FAINT} fontSize="11">
          el precio lo puso el sistema
        </text>
        <animate attributeName="opacity" values="0;1" dur="0.6s" begin="2.2s" fill="freeze" />
      </g>
    </svg>
  );
}

/** El ciclo del reparto: el algoritmo asigna, mide y rankea. */
export function DiagramaReparto() {
  const nodos = [
    { x: 320, y: 40, label: "Pedido" },
    { x: 540, y: 120, label: "Asignación" },
    { x: 320, y: 200, label: "Métricas" },
    { x: 100, y: 120, label: "Ranking" },
  ];
  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="Ciclo de gestión algorítmica del reparto" className="w-full max-w-2xl">
      <ellipse cx="320" cy="120" rx="220" ry="80" fill="none" stroke={LINE} strokeWidth="2" strokeDasharray="6 7" />
      {nodos.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="34" fill="#171a37" stroke={TEAL} strokeWidth="2" />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
            {n.label}
          </text>
        </g>
      ))}
      <circle r="6" fill={AMBER}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M320,40 A220,80 0 0 1 540,120 A220,80 0 0 1 320,200 A220,80 0 0 1 100,120 A220,80 0 0 1 320,40" />
      </circle>
      <text x="320" y="114" textAnchor="middle" fill={VIOLET} fontSize="14" fontWeight="700" fontFamily="monospace">
        EL ALGORITMO
      </text>
      <text x="320" y="134" textAnchor="middle" fill={FAINT} fontSize="12">
        decide quién trabaja, cuándo y cuánto
      </text>
    </svg>
  );
}

/** Scoring: variables que entran, puntaje que sale, decisión automática. */
export function DiagramaScoring() {
  const inputs = ["historial de pagos", "movimientos", "comportamiento en la app"];
  return (
    <svg viewBox="0 0 640 240" role="img" aria-label="Scoring crediticio automático" className="w-full max-w-2xl">
      {inputs.map((t, i) => (
        <g key={t}>
          <rect x="20" y={30 + i * 62} width="200" height="42" rx="10" fill="none" stroke={CYAN} strokeWidth="1.6" />
          <text x="120" y={56 + i * 62} textAnchor="middle" fill={TEXT} fontSize="12">
            {t}
          </text>
          <line x1="220" y1={51 + i * 62} x2="300" y2="120" stroke={LINE} strokeWidth="1.6" />
          <circle r="3.5" fill={CYAN}>
            <animateMotion dur="1.8s" begin={`${i * 0.5}s`} repeatCount="indefinite" path={`M220,${51 + i * 62} L300,120`} />
          </circle>
        </g>
      ))}
      <circle cx="360" cy="120" r="58" fill="none" stroke={VIOLET} strokeWidth="2.4" />
      <text x="360" y="112" textAnchor="middle" fill={VIOLET} fontSize="15" fontWeight="700" fontFamily="monospace">
        SCORE
      </text>
      <text x="360" y="136" textAnchor="middle" fill={TEXT} fontSize="19" fontWeight="700" fontFamily="monospace">
        712
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
      </text>
      <line x1="418" y1="120" x2="470" y2="120" stroke={LINE} strokeWidth="2" />
      <g>
        <rect x="470" y="66" width="150" height="44" rx="10" fill={TEAL} opacity="0.12" stroke={TEAL} strokeWidth="1.6" />
        <text x="545" y="93" textAnchor="middle" fill={TEAL} fontSize="13" fontWeight="600">
          crédito aprobado
        </text>
      </g>
      <g>
        <rect x="470" y="130" width="150" height="44" rx="10" fill="none" stroke={FAINT} strokeWidth="1.6" strokeDasharray="4 5" />
        <text x="545" y="157" textAnchor="middle" fill={FAINT} fontSize="13">
          crédito denegado
        </text>
      </g>
      <text x="320" y="225" textAnchor="middle" fill={FAINT} fontSize="12">
        Nadie lo atendió: decidió un sistema. ¿Ante quién reclama?
      </text>
    </svg>
  );
}

/** Tres decisiones que hoy ya toma un sistema, selladas en secuencia. */
export function DiagramaDecisiones() {
  const filas = [
    { y: 40, doc: "solicitud de crédito", sello: "APROBADO", color: TEAL },
    { y: 120, doc: "precio del viaje", sello: "× 2,4", color: AMBER },
    { y: 200, doc: "currículum", sello: "DESCARTADO", color: "#f472b6" },
  ];
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label="Decisiones automáticas" className="w-full">
      {filas.map((f, i) => (
        <g key={f.doc}>
          <rect x="24" y={f.y} width="200" height="56" rx="10" fill="none" stroke={LINE} strokeWidth="1.6" />
          <line x1="40" y1={f.y + 18} x2="190" y2={f.y + 18} stroke={LINE} strokeWidth="2" />
          <line x1="40" y1={f.y + 30} x2="160" y2={f.y + 30} stroke={LINE} strokeWidth="2" />
          <text x="40" y={f.y + 48} fill={FAINT} fontSize="10">
            {f.doc}
          </text>
          <line x1="224" y1={f.y + 28} x2="290" y2={f.y + 28} stroke={LINE} strokeWidth="1.6" strokeDasharray="4 5" />
          <g opacity="0">
            <rect x="296" y={f.y + 6} width="150" height="44" rx="8" fill={f.color} opacity="0.14" stroke={f.color} strokeWidth="2" transform={`rotate(-4 371 ${f.y + 28})`} />
            <text x="371" y={f.y + 33} textAnchor="middle" fill={f.color} fontSize="14" fontWeight="700" fontFamily="monospace">
              {f.sello}
            </text>
            <animate attributeName="opacity" values="0;0;1;1;0" keyTimes={`0;${0.15 + i * 0.22};${0.2 + i * 0.22};0.92;1`} dur="7s" repeatCount="indefinite" />
          </g>
        </g>
      ))}
      <text x="240" y="290" textAnchor="middle" fill={FAINT} fontSize="12">
        Nadie lo escribió a mano. El sistema sella.
      </text>
    </svg>
  );
}

/** El hilo de la clase: empresa → abogado → caso. */
export function DiagramaRuta() {
  const nodos = [
    { x: 90, y: 70, n: "I", label: "la empresa" },
    { x: 240, y: 160, n: "II", label: "su abogado/a" },
    { x: 390, y: 70, n: "III", label: "el caso" },
  ];
  const path = "M90,70 C150,140 180,160 240,160 C300,160 330,140 390,70";
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="Las tres partes de la clase" className="w-full">
      <path d={path} fill="none" stroke={LINE} strokeWidth="2" strokeDasharray="5 6" />
      <circle r="6" fill={AMBER}>
        <animateMotion dur="5s" repeatCount="indefinite" path={path} />
      </circle>
      {nodos.map((p) => (
        <g key={p.n}>
          <circle cx={p.x} cy={p.y} r="30" fill="#171a37" stroke={VIOLET} strokeWidth="2" />
          <text x={p.x} y={p.y + 6} textAnchor="middle" fill={VIOLET} fontSize="17" fontWeight="700" fontFamily="monospace">
            {p.n}
          </text>
          <text x={p.x} y={p.y + 52} textAnchor="middle" fill={TEXT} fontSize="12">
            {p.label}
          </text>
        </g>
      ))}
      <text x="240" y="240" textAnchor="middle" fill={FAINT} fontSize="12">
        un solo hilo, de la góndola al expediente
      </text>
    </svg>
  );
}

/** Reglas fijas vs. patrones aprendidos. */
export function DiagramaReglas() {
  const puntos = [
    [332, 96], [356, 70], [384, 108], [402, 62], [420, 92], [366, 128], [412, 132], [344, 140], [430, 70], [396, 150],
  ];
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="Automatización tradicional versus IA" className="w-full">
      <rect x="24" y="36" width="200" height="150" rx="12" fill="none" stroke={CYAN} strokeWidth="1.6" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="44" y1={66 + i * 30} x2="204" y2={66 + i * 30} stroke={CYAN} strokeWidth="2" opacity="0.6" />
      ))}
      <text x="124" y="212" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        reglas fijas, escritas a mano
      </text>
      <rect x="312" y="36" width="144" height="150" rx="12" fill="none" stroke={VIOLET} strokeWidth="1.6" />
      {puntos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3.5" fill={VIOLET}>
          <animate attributeName="opacity" values="0.25;1;0.25" dur="2.8s" begin={`${(i % 5) * 0.4}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <path d="M330,150 C360,90 400,130 440,64" fill="none" stroke={VIOLET} strokeWidth="2" strokeDasharray="160" strokeDashoffset="160" opacity="0.8">
        <animate attributeName="stroke-dashoffset" values="160;0;0;160" keyTimes="0;0.35;0.8;1" dur="5s" repeatCount="indefinite" />
      </path>
      <text x="384" y="212" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        patrones aprendidos de datos
      </text>
      <text x="268" y="116" textAnchor="middle" fill={FAINT} fontSize="20">
        →
      </text>
      <text x="240" y="245" textAnchor="middle" fill={FAINT} fontSize="12">
        clasificar · predecir · recomendar · generar
      </text>
    </svg>
  );
}

function Engranaje({ cx, cy, r, color, dur, sentido = 1 }: { cx: number; cy: number; r: number; color: string; dur: string; sentido?: 1 | -1 }) {
  return (
    <g>
      <g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="2.4" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x={cx - 3} y={cy - r - 7} width="6" height="9" rx="2" fill={color} transform={`rotate(${a} ${cx} ${cy})`} />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.35} fill="none" stroke={color} strokeWidth="1.6" />
        <animateTransform attributeName="transform" type="rotate" from={`0 ${cx} ${cy}`} to={`${360 * sentido} ${cx} ${cy}`} dur={dur} repeatCount="indefinite" />
      </g>
    </g>
  );
}

/** Comprar software vs. rediseñar el proceso. */
export function DiagramaEngranajes() {
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="Software solo versus proceso rediseñado" className="w-full">
      <Engranaje cx={110} cy={100} r={34} color={FAINT} dur="9s" />
      <rect x="60" y="150" width="100" height="34" rx="8" fill="none" stroke={LINE} strokeWidth="1.6" strokeDasharray="4 5" />
      <text x="110" y="171" textAnchor="middle" fill={FAINT} fontSize="10">
        el proceso de siempre
      </text>
      <text x="110" y="212" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        software nuevo, gasto viejo
      </text>
      <Engranaje cx={330} cy={90} r={30} color={TEAL} dur="6s" />
      <Engranaje cx={392} cy={124} r={24} color={CYAN} dur="4.8s" sentido={-1} />
      <Engranaje cx={330} cy={158} r={24} color={VIOLET} dur="4.8s" />
      <text x="360" y="212" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        proceso rediseñado
      </text>
      <text x="240" y="245" textAnchor="middle" fill={FAINT} fontSize="12">
        la tecnología sola no transforma nada
      </text>
    </svg>
  );
}

/** Las apps de todos los días, conectadas al mismo centro. */
export function DiagramaHub() {
  const sat = [
    { x: 110, y: 60, e: "🚗", l: "viajes" },
    { x: 110, y: 190, e: "🛵", l: "pedidos" },
    { x: 380, y: 60, e: "📦", l: "compras" },
    { x: 380, y: 190, e: "💳", l: "crédito" },
  ];
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="Apps conectadas al algoritmo" className="w-full">
      {sat.map((s, i) => (
        <g key={s.l}>
          <line x1={s.x} y1={s.y} x2="245" y2="125" stroke={LINE} strokeWidth="1.6" />
          <circle r="3.5" fill={CYAN}>
            <animateMotion dur="2.6s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={`M${s.x},${s.y} L245,125`} />
          </circle>
          <circle cx={s.x} cy={s.y} r="26" fill="#171a37" stroke={LINE} strokeWidth="1.6" />
          <text x={s.x} y={s.y + 7} textAnchor="middle" fontSize="20">
            {s.e}
          </text>
          <text x={s.x} y={s.y + 44} textAnchor="middle" fill={FAINT} fontSize="11">
            {s.l}
          </text>
        </g>
      ))}
      <circle cx="245" cy="125" r="44" fill="#171a37" stroke={VIOLET} strokeWidth="2.4">
        <animate attributeName="r" values="44;47;44" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <text x="245" y="121" textAnchor="middle" fill={VIOLET} fontSize="12" fontWeight="700" fontFamily="monospace">
        EL
      </text>
      <text x="245" y="137" textAnchor="middle" fill={VIOLET} fontSize="12" fontWeight="700" fontFamily="monospace">
        ALGORITMO
      </text>
      <text x="240" y="248" textAnchor="middle" fill={FAINT} fontSize="12">
        las usás todas las semanas
      </text>
    </svg>
  );
}

/** El puesto como pila de tareas: algunas se automatizan, aparecen nuevas. */
export function DiagramaTareas() {
  const tareas = [
    { y: 44, label: "cargar planillas", auto: true },
    { y: 84, label: "responder consultas repetidas", auto: true },
    { y: 124, label: "negociar con clientes", auto: false },
    { y: 164, label: "decidir casos difíciles", auto: false },
  ];
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="Tareas del puesto, automatizadas y humanas" className="w-full">
      <text x="150" y="28" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
        EL PUESTO
      </text>
      {tareas.map((t) => (
        <g key={t.label}>
          <rect x="40" y={t.y} width="220" height="30" rx="8" fill={t.auto ? VIOLET : "none"} opacity={t.auto ? 0.12 : 1} stroke={t.auto ? VIOLET : TEAL} strokeWidth="1.8">
            {t.auto && <animate attributeName="opacity" values="0.03;0.2;0.03" dur="3s" repeatCount="indefinite" />}
          </rect>
          <text x="56" y={t.y + 20} fill={TEXT} fontSize="12">
            {t.label}
          </text>
          {t.auto && (
            <text x="238" y={t.y + 20} textAnchor="end" fill={VIOLET} fontSize="13">
              🤖
            </text>
          )}
        </g>
      ))}
      <g opacity="0">
        <rect x="40" y="204" width="220" height="30" rx="8" fill={AMBER} opacity="0.12" stroke={AMBER} strokeWidth="1.8" />
        <text x="56" y="224" fill={TEXT} fontSize="12">
          supervisar y corregir a la IA
        </text>
        <text x="238" y="224" textAnchor="end" fill={AMBER} fontSize="12">
          nueva
        </text>
        <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.45;0.6;1" dur="6s" repeatCount="indefinite" />
      </g>
      <text x="360" y="110" textAnchor="middle" fill={VIOLET} fontSize="12" fontWeight="600">
        se automatiza
      </text>
      <text x="360" y="128" textAnchor="middle" fill={FAINT} fontSize="11">
        la tarea, no la persona
      </text>
      <text x="360" y="224" textAnchor="middle" fill={AMBER} fontSize="12" fontWeight="600">
        y aparece trabajo nuevo
      </text>
    </svg>
  );
}

/** La decisión sale del directorio; la responsabilidad vuelve. */
export function DiagramaBoomerang() {
  const vuelta = "M420,140 C420,220 60,220 60,150";
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="La responsabilidad vuelve a quien decide" className="w-full">
      <rect x="20" y="80" width="120" height="50" rx="10" fill="none" stroke={TEAL} strokeWidth="2" />
      <text x="80" y="102" textAnchor="middle" fill={TEAL} fontSize="12" fontWeight="700" fontFamily="monospace">
        DIRECTORIO
      </text>
      <text x="80" y="119" textAnchor="middle" fill={FAINT} fontSize="10">
        decide incorporar
      </text>
      <rect x="190" y="80" width="100" height="50" rx="10" fill="none" stroke={VIOLET} strokeWidth="2" />
      <text x="240" y="102" textAnchor="middle" fill={VIOLET} fontSize="12" fontWeight="700" fontFamily="monospace">
        SISTEMA
      </text>
      <text x="240" y="119" textAnchor="middle" fill={FAINT} fontSize="10">
        ejecuta
      </text>
      <rect x="340" y="80" width="120" height="50" rx="10" fill="none" stroke={AMBER} strokeWidth="2" />
      <text x="400" y="102" textAnchor="middle" fill={AMBER} fontSize="12" fontWeight="700" fontFamily="monospace">
        CLIENTE
      </text>
      <text x="400" y="119" textAnchor="middle" fill={FAINT} fontSize="10">
        sufre el daño ⚡
      </text>
      <line x1="140" y1="105" x2="190" y2="105" stroke={LINE} strokeWidth="2" />
      <line x1="290" y1="105" x2="340" y2="105" stroke={LINE} strokeWidth="2" />
      <path d={vuelta} fill="none" stroke={AMBER} strokeWidth="2.4" strokeDasharray="480" strokeDashoffset="480">
        <animate attributeName="stroke-dashoffset" values="480;0;0" keyTimes="0;0.6;1" dur="4.5s" repeatCount="indefinite" />
      </path>
      <circle r="5" fill={AMBER}>
        <animateMotion dur="4.5s" keyPoints="0;1;1" keyTimes="0;0.6;1" calcMode="linear" repeatCount="indefinite" path={vuelta} />
      </circle>
      <text x="240" y="245" textAnchor="middle" fill={AMBER} fontSize="13" fontWeight="600">
        la responsabilidad no se queda en el sistema: vuelve
      </text>
    </svg>
  );
}

/** Cambio de silla: de la empresa al abogado que la asesora. */
export function DiagramaEscritorio() {
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="La empresa consulta, el abogado pregunta" className="w-full">
      <line x1="240" y1="60" x2="240" y2="200" stroke={LINE} strokeWidth="2" strokeDasharray="5 6" />
      <circle cx="120" cy="110" r="30" fill="#171a37" stroke={CYAN} strokeWidth="2" />
      <text x="120" y="118" textAnchor="middle" fontSize="22">
        🏢
      </text>
      <text x="120" y="164" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        la empresa
      </text>
      <circle cx="360" cy="110" r="30" fill="#171a37" stroke={TEAL} strokeWidth="2" />
      <text x="360" y="118" textAnchor="middle" fontSize="22">
        ⚖️
      </text>
      <text x="360" y="164" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        vos, su abogado/a
      </text>
      <g>
        <rect x="60" y="30" width="150" height="34" rx="12" fill={CYAN} opacity="0.12" stroke={CYAN} strokeWidth="1.4" />
        <text x="135" y="51" textAnchor="middle" fill={TEXT} fontSize="12">
          “quiero usar IA”
        </text>
        <animate attributeName="opacity" values="1;1;0.25;0.25;1" keyTimes="0;0.4;0.5;0.9;1" dur="6s" repeatCount="indefinite" />
      </g>
      <g opacity="0.25">
        <rect x="272" y="30" width="176" height="34" rx="12" fill={TEAL} opacity="0.12" stroke={TEAL} strokeWidth="1.4" />
        <text x="360" y="51" textAnchor="middle" fill={TEXT} fontSize="12">
          “¿para qué, exactamente?”
        </text>
        <animate attributeName="opacity" values="0.25;0.25;1;1;0.25" keyTimes="0;0.4;0.5;0.9;1" dur="6s" repeatCount="indefinite" />
      </g>
      <text x="240" y="235" textAnchor="middle" fill={FAINT} fontSize="12">
        cinco escenas, el mismo cliente
      </text>
    </svg>
  );
}

/** Las cinco escenas como recorrido. */
export function DiagramaEscenas() {
  const xs = [60, 150, 240, 330, 420];
  const labels = ["incorporar", "contratar", "uso interno", "vender", "conflicto"];
  return (
    <svg viewBox="0 0 480 200" role="img" aria-label="Cinco escenas del recorrido" className="w-full">
      <line x1="60" y1="90" x2="420" y2="90" stroke={LINE} strokeWidth="2" />
      <circle r="6" fill={AMBER}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M60,90 L420,90" />
      </circle>
      {xs.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="90" r="22" fill="#171a37" stroke={i === 4 ? AMBER : VIOLET} strokeWidth="2" />
          <text x={x} y="96" textAnchor="middle" fill={i === 4 ? AMBER : VIOLET} fontSize="14" fontWeight="700" fontFamily="monospace">
            {i + 1}
          </text>
          <text x={x} y={i % 2 === 0 ? 140 : 50} textAnchor="middle" fill={TEXT} fontSize="11">
            {labels[i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** El contrato: qué mirar cláusula por cláusula. */
export function DiagramaContrato() {
  const clausulas = ["precio y duración", "tus datos", "confidencialidad", "de quién son los resultados", "salida del servicio"];
  return (
    <svg viewBox="0 0 480 280" role="img" aria-label="Cláusulas a revisar en el contrato" className="w-full">
      <rect x="60" y="24" width="240" height="232" rx="12" fill="#171a37" stroke={LINE} strokeWidth="1.6" />
      <text x="180" y="52" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="700" fontFamily="monospace">
        TÉRMINOS DE USO
      </text>
      {clausulas.map((c, i) => (
        <g key={c}>
          <rect x="76" y={68 + i * 36} width="208" height="26" rx="6" fill={TEAL} opacity="0">
            <animate attributeName="opacity" values="0;0;0.16;0.16;0" keyTimes={`0;${0.1 + i * 0.16};${0.14 + i * 0.16};${0.24 + i * 0.16};1`} dur="9s" repeatCount="indefinite" />
          </rect>
          <line x1="88" y1={81 + i * 36} x2="272" y2={81 + i * 36} stroke={LINE} strokeWidth="2" />
          <text x="330" y={85 + i * 36} fill={TEXT} fontSize="12" opacity="0">
            ← {c}
            <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${0.1 + i * 0.16};${0.14 + i * 0.16};1`} dur="9s" repeatCount="indefinite" />
          </text>
        </g>
      ))}
      <text x="240" y="272" textAnchor="middle" fill={FAINT} fontSize="12">
        lo que no preguntes ahora, lo vas a litigar después
      </text>
    </svg>
  );
}

/** Información de la empresa yéndose a una IA de terceros; la política filtra. */
export function DiagramaFuga() {
  return (
    <svg viewBox="0 0 480 260" role="img" aria-label="La política interna filtra qué se carga" className="w-full">
      <rect x="24" y="70" width="110" height="120" rx="10" fill="none" stroke={CYAN} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={40 + i * 28} y="150" width="18" height="26" rx="3" fill="none" stroke={LINE} strokeWidth="1.4" />
      ))}
      <text x="79" y="98" textAnchor="middle" fontSize="20">
        🏢
      </text>
      <text x="79" y="212" textAnchor="middle" fill={FAINT} fontSize="11">
        la empresa
      </text>
      <ellipse cx="410" cy="110" rx="56" ry="34" fill="none" stroke={VIOLET} strokeWidth="2" />
      <text x="410" y="106" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700" fontFamily="monospace">
        IA DE
      </text>
      <text x="410" y="121" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700" fontFamily="monospace">
        TERCEROS
      </text>
      <line x1="240" y1="60" x2="240" y2="180" stroke={AMBER} strokeWidth="3" />
      <text x="240" y="205" textAnchor="middle" fill={AMBER} fontSize="12" fontWeight="600">
        política interna
      </text>
      <g>
        <text fontSize="15">
          📄
          <animateMotion dur="3s" repeatCount="indefinite" path="M140,100 L392,100" />
        </text>
        <animate attributeName="opacity" values="1;1;1;0" keyTimes="0;0.85;0.95;1" dur="3s" repeatCount="indefinite" />
      </g>
      <g>
        <text fontSize="15">
          🔑
          <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="M140,140 L232,140" />
        </text>
        <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.9;1" dur="3s" begin="1.5s" repeatCount="indefinite" />
      </g>
      <text x="258" y="145" fill={AMBER} fontSize="14" fontWeight="700">
        ✕
      </text>
      <text x="240" y="243" textAnchor="middle" fill={FAINT} fontSize="12">
        qué puede salir, qué no sale nunca
      </text>
    </svg>
  );
}

/** Usar ⊂ tener derechos ⊂ impedir a otros. */
export function DiagramaAnillos() {
  const anillos = [
    { r: 42, color: TEAL, label: "usar", y: 118 },
    { r: 74, color: CYAN, label: "tener derechos", y: 66 },
    { r: 106, color: VIOLET, label: "impedir a otros", y: 22 },
  ];
  return (
    <svg viewBox="0 0 480 280" role="img" aria-label="Usar, tener derechos e impedir no es lo mismo" className="w-full">
      {[...anillos].reverse().map((a, i) => (
        <g key={a.label}>
          <circle cx="240" cy="150" r={a.r} fill="none" stroke={a.color} strokeWidth="2.4" opacity="0.35">
            <animate attributeName="opacity" values="0.25;1;0.25" dur="6s" begin={`${(2 - i) * 2}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}
      {anillos.map((a, i) => (
        <text key={a.label} x="240" y={a.y + 14} textAnchor="middle" fill={a.color} fontSize="13" fontWeight="600">
          {a.label}
          <animate attributeName="opacity" values="0.45;1;0.45" dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" />
        </text>
      ))}
      <text x="240" y="272" textAnchor="middle" fill={FAINT} fontSize="12">
        cada anillo pide más: intervención humana, contrato, registro
      </text>
    </svg>
  );
}

/** Responsabilidad en cadena: empresa — agencia — proveedor. */
export function DiagramaCadena() {
  const nodos = [
    { x: 100, label: "EMPRESA", sub: "usó el sistema" },
    { x: 240, label: "AGENCIA", sub: "gestionó el contrato" },
    { x: 380, label: "PROVEEDOR", sub: "puso la IA" },
  ];
  return (
    <svg viewBox="0 0 480 240" role="img" aria-label="Responsabilidad en cadena" className="w-full">
      <line x1="100" y1="120" x2="380" y2="120" stroke={LINE} strokeWidth="2.4" />
      {nodos.map((n, i) => (
        <g key={n.label}>
          <text x={n.x} y="52" textAnchor="middle" fill={AMBER} fontSize="20" fontWeight="700" opacity="0.2">
            ?
            <animate attributeName="opacity" values="0.15;1;0.15" dur="4.5s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          </text>
          <circle cx={n.x} cy="120" r="34" fill="#171a37" stroke={VIOLET} strokeWidth="2" />
          <text x={n.x} y="118" textAnchor="middle" fill={VIOLET} fontSize="10.5" fontWeight="700" fontFamily="monospace">
            {n.label}
          </text>
          <text x={n.x} y="133" textAnchor="middle" fill={FAINT} fontSize="9">
            {n.sub}
          </text>
        </g>
      ))}
      <text x="240" y="205" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
        ¿quién responde? — hay que reconstruir el rol de cada uno
      </text>
      <text x="240" y="226" textAnchor="middle" fill={FAINT} fontSize="11">
        y la autorización limitada no se extiende sola
      </text>
    </svg>
  );
}

/** La empresa: medios materiales e inmateriales ordenados a un fin. */
export function DiagramaEmpresa() {
  const materiales = ["planta", "máquinas", "stock"];
  const inmateriales = ["marca", "know-how", "software", "IA"];
  return (
    <svg viewBox="0 0 480 300" role="img" aria-label="La empresa como organización de medios" className="w-full">
      <text x="88" y="26" textAnchor="middle" fill={CYAN} fontSize="11" fontWeight="700" fontFamily="monospace">
        MEDIOS MATERIALES
      </text>
      {materiales.map((m, i) => (
        <g key={m}>
          <rect x="30" y={38 + i * 40} width="116" height="28" rx="8" fill="none" stroke={CYAN} strokeWidth="1.6" />
          <text x="88" y={57 + i * 40} textAnchor="middle" fill={TEXT} fontSize="11">
            {m}
          </text>
          <line x1="146" y1={52 + i * 40} x2="204" y2="150" stroke={LINE} strokeWidth="1.4" />
        </g>
      ))}
      <text x="88" y="184" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700" fontFamily="monospace">
        MEDIOS INMATERIALES
      </text>
      {inmateriales.map((m, i) => {
        const esIA = m === "IA";
        return (
          <g key={m}>
            <rect x="30" y={196 + i * 24} width="116" height="19" rx="6" fill={esIA ? VIOLET : "none"} opacity={esIA ? 0.16 : 1} stroke={VIOLET} strokeWidth={esIA ? 2.2 : 1.4}>
              {esIA && <animate attributeName="opacity" values="0.08;0.3;0.08" dur="2.4s" repeatCount="indefinite" />}
            </rect>
            <text x="88" y={210 + i * 24} textAnchor="middle" fill={esIA ? VIOLET : TEXT} fontSize="10.5" fontWeight={esIA ? 700 : 400}>
              {m}
            </text>
            <line x1="146" y1={205 + i * 24} x2="204" y2="160" stroke={LINE} strokeWidth="1.4" />
          </g>
        );
      })}
      <rect x="204" y="120" width="120" height="70" rx="14" fill="#171a37" stroke={TEAL} strokeWidth="2.4" />
      <text x="264" y="151" textAnchor="middle" fill={TEAL} fontSize="13" fontWeight="700" fontFamily="monospace">
        LA
      </text>
      <text x="264" y="168" textAnchor="middle" fill={TEAL} fontSize="13" fontWeight="700" fontFamily="monospace">
        EMPRESA
      </text>
      {["servicios", "obras", "productos"].map((f, i) => (
        <g key={f}>
          <line x1="324" y1="155" x2="376" y2={70 + i * 80} stroke={LINE} strokeWidth="1.6" />
          <circle r="3.5" fill={TEAL}>
            <animateMotion dur="2.2s" begin={`${i * 0.7}s`} repeatCount="indefinite" path={`M324,155 L376,${70 + i * 80}`} />
          </circle>
          <rect x="376" y={54 + i * 80} width="90" height="32" rx="8" fill={TEAL} opacity="0.1" stroke={TEAL} strokeWidth="1.6" />
          <text x="421" y={74 + i * 80} textAnchor="middle" fill={TEXT} fontSize="11" fontWeight="600">
            {f}
          </text>
        </g>
      ))}
      <text x="240" y="290" textAnchor="middle" fill={FAINT} fontSize="11">
        la IA ya es uno de esos medios — y de los que más valen
      </text>
    </svg>
  );
}

/** Datos personales: base inscripta, segura y con derechos del titular. */
export function DiagramaDatos() {
  return (
    <svg viewBox="0 0 480 280" role="img" aria-label="Obligaciones sobre datos personales" className="w-full">
      <ellipse cx="120" cy="80" rx="58" ry="16" fill="none" stroke={CYAN} strokeWidth="2" />
      <path d="M62,80 L62,150 A58,16 0 0 0 178,150 L178,80" fill="none" stroke={CYAN} strokeWidth="2" />
      <ellipse cx="120" cy="115" rx="58" ry="16" fill="none" stroke={CYAN} strokeWidth="1" opacity="0.5" />
      <text x="120" y="200" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
        base de datos de la empresa
      </text>
      <text x="120" y="218" textAnchor="middle" fill={FAINT} fontSize="10.5">
        clientes · empleados · proveedores
      </text>
      <g>
        <rect x="270" y="40" width="180" height="44" rx="10" fill={TEAL} opacity="0.1" stroke={TEAL} strokeWidth="1.8" />
        <text x="360" y="59" textAnchor="middle" fill={TEAL} fontSize="11.5" fontWeight="700">
          inscripta en la AAIP ✓
        </text>
        <text x="360" y="75" textAnchor="middle" fill={FAINT} fontSize="9.5">
          Registro Nacional de Bases de Datos
        </text>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" repeatCount="indefinite" />
      </g>
      <g>
        <rect x="270" y="100" width="180" height="44" rx="10" fill="none" stroke={VIOLET} strokeWidth="1.8" />
        <text x="360" y="119" textAnchor="middle" fill={VIOLET} fontSize="11.5" fontWeight="700">
          🔒 deber de seguridad
        </text>
        <text x="360" y="135" textAnchor="middle" fill={FAINT} fontSize="9.5">
          y de confidencialidad
        </text>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" begin="1.5s" repeatCount="indefinite" />
      </g>
      <g>
        <rect x="270" y="160" width="180" height="44" rx="10" fill="none" stroke={AMBER} strokeWidth="1.8" />
        <text x="360" y="179" textAnchor="middle" fill={AMBER} fontSize="11.5" fontWeight="700">
          derechos del titular
        </text>
        <text x="360" y="195" textAnchor="middle" fill={FAINT} fontSize="9.5">
          acceso · rectificación · supresión
        </text>
        <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" begin="3s" repeatCount="indefinite" />
      </g>
      {[0, 1, 2].map((i) => (
        <line key={i} x1="180" y1={110 + i * 8} x2="268" y2={62 + i * 60} stroke={LINE} strokeWidth="1.4" strokeDasharray="4 5" />
      ))}
      <text x="240" y="262" textAnchor="middle" fill={FAINT} fontSize="12">
        Ley 25.326 — no es prudencia: es ley, con sanciones
      </text>
    </svg>
  );
}

/** Cinco sellos que se van marcando. */
export function DiagramaSellos() {
  const xs = [70, 155, 240, 325, 410];
  return (
    <svg viewBox="0 0 480 140" role="img" aria-label="Cinco ideas selladas" className="w-full">
      {xs.map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="60" r="30" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.3" />
          <g opacity="0">
            <circle cx={x} cy="60" r="30" fill={TEAL} opacity="0.14" stroke={TEAL} strokeWidth="2.4" />
            <text x={x} y="70" textAnchor="middle" fill={TEAL} fontSize="26" fontWeight="700">
              ✓
            </text>
            <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${0.12 + i * 0.15};${0.18 + i * 0.15};1`} dur="7s" repeatCount="indefinite" />
          </g>
          <text x={x} y="115" textAnchor="middle" fill={FAINT} fontSize="11" fontFamily="monospace">
            {i + 1}
          </text>
        </g>
      ))}
    </svg>
  );
}
