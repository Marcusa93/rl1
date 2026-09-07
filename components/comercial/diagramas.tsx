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

export type DiagramaId = "io" | "surge" | "reparto" | "scoring";

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
