"use client";

// Diagramas animados de la masterclass "Justicia aumentada" (/justicia).
// SVG con animación SMIL, misma paleta que los de /web3 y /empresas.

const TEAL = "#2dd4bf";
const CYAN = "#22d3ee";
const VIOLET = "#8b5cf6";
const AMBER = "#fbbf24";
const ROSA = "#f472b6";
const LINE = "#3b3f6e";
const TEXT = "#c7c9e8";
const FAINT = "#7e81ab";
const PANEL = "#171a37";

export type DiagramaJusId =
  | "bio" | "tiempo" | "conflicto" | "formas" | "juicio" | "caminos"
  | "papel" | "pdfs" | "flujo" | "verbos" | "contexto" | "combina"
  | "seguridad" | "agrego" | "hitl" | "delegacion" | "metodo"
  | "antecedente" | "rag";

export function DiagramaJus({ id }: { id: DiagramaJusId }) {
  const D: Record<DiagramaJusId, () => React.ReactNode> = {
    bio: Bio, tiempo: Tiempo, conflicto: Conflicto, formas: Formas, juicio: Juicio, caminos: Caminos,
    papel: Papel, pdfs: Pdfs, flujo: Flujo, verbos: Verbos, contexto: Contexto, combina: Combina,
    seguridad: Seguridad, agrego: Agrego, hitl: Hitl, delegacion: Delegacion, metodo: Metodo,
    antecedente: Antecedente, rag: Rag,
  };
  return <>{D[id]()}</>;
}

const VB = "0 0 480 260";

function Muneco({ x, y, color = TEXT, escala = 1 }: { x: number; y: number; color?: string; escala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <circle cx="0" cy="-10" r="7" fill="none" stroke={color} strokeWidth="2" />
      <path d="M-11,12 C-11,0 11,0 11,12" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function Pie({ children, y = 248 }: { children: React.ReactNode; y?: number }) {
  return (
    <text x="240" y={y} textAnchor="middle" fill={FAINT} fontSize="12">
      {children}
    </text>
  );
}

function Paso({ x, y, w, label, color = TEAL, i, total, dur = 6 }: { x: number; y: number; w: number; label: string; color?: string; i: number; total: number; dur?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="46" rx="11" fill={PANEL} stroke={color} strokeWidth="2">
        <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur={`${dur}s`} begin={`${(i * dur) / total}s`} repeatCount="indefinite" />
      </rect>
      <text x={x + w / 2} y={y + 28} textAnchor="middle" fill={TEXT} fontSize="12.5" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

// "Estuve de ese lado": del despacho al desarrollo, y de vuelta.
function Bio() {
  const vaivén = "M170,120 C220,80 260,80 310,120";
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Del trabajo judicial al desarrollo de tecnología">
      <rect x="30" y="55" width="140" height="130" rx="14" fill="none" stroke={TEAL} strokeWidth="2" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={55 + i * 4} y={80 + i * 16} width="86" height="28" rx="4" fill={PANEL} stroke={LINE} strokeWidth="1.4" />
      ))}
      <text x="100" y="205" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">el despacho</text>
      <text x="100" y="221" textAnchor="middle" fill={FAINT} fontSize="10">reconstruir · buscar · repetir</text>
      <rect x="310" y="55" width="140" height="130" rx="14" fill={PANEL} stroke={VIOLET} strokeWidth="2" />
      {["function ordenar(exp) {", "  fechas.sort()", "  fuentes.link()", "}"].map((l, i) => (
        <text key={l} x="324" y={88 + i * 20} fill={VIOLET} fontSize="10.5" fontFamily="monospace" opacity="0.85">
          {l}
        </text>
      ))}
      <text x="380" y="205" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">el desarrollo</text>
      <text x="380" y="221" textAnchor="middle" fill={FAINT} fontSize="10">herramientas para esas tareas</text>
      <path d={vaivén} fill="none" stroke={LINE} strokeWidth="1.6" strokeDasharray="4 5" />
      <path d="M310,150 C260,190 220,190 170,150" fill="none" stroke={LINE} strokeWidth="1.6" strokeDasharray="4 5" />
      <circle r="5" fill={AMBER}>
        <animateMotion dur="3s" repeatCount="indefinite" path={vaivén} />
      </circle>
      <circle r="5" fill={TEAL}>
        <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" path="M310,150 C260,190 220,190 170,150" />
      </circle>
    </svg>
  );
}

// El tiempo también importa: cuánto del día es preparación y cuánto criterio.
function Tiempo() {
  const tramos = [
    { l: "buscar", w: 118, c: VIOLET },
    { l: "copiar y ordenar", w: 96, c: VIOLET },
    { l: "revisar", w: 84, c: VIOLET },
    { l: "comprender y decidir", w: 102, c: TEAL },
  ];
  let x = 40;
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Distribución del tiempo de trabajo">
      <text x="240" y="50" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
        una jornada de trabajo
      </text>
      {tramos.map((t, i) => {
        const x0 = x;
        x += t.w;
        return (
          <g key={t.l}>
            <rect x={x0} y="80" width={t.w - 4} height="54" rx="8" fill={t.c} opacity={t.c === TEAL ? 0.28 : 0.14} stroke={t.c} strokeWidth="1.8">
              <animate attributeName="width" values={`0;${t.w - 4}`} dur="0.7s" begin={`${i * 0.35}s`} fill="freeze" />
            </rect>
            <text x={x0 + (t.w - 4) / 2} y="113" textAnchor="middle" fill={TEXT} fontSize="11">
              {t.l}
            </text>
          </g>
        );
      })}
      <path d="M40,150 L334,150" stroke={VIOLET} strokeWidth="1.4" />
      <text x="187" y="170" textAnchor="middle" fill={VIOLET} fontSize="11.5">preparar la información</text>
      <path d="M338,150 L436,150" stroke={TEAL} strokeWidth="1.4" />
      <text x="387" y="170" textAnchor="middle" fill={TEAL} fontSize="11.5" fontWeight="700">
        criterio
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
      </text>
      <text x="444" y="220" textAnchor="end" fill={FAINT} fontSize="9.5" fontStyle="italic">
        distribución ilustrativa
      </text>
      <Pie>¿qué parte del día necesita realmente nuestro criterio?</Pie>
    </svg>
  );
}

// Antes del expediente, el conflicto.
function Conflicto() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Dos personas y un recurso en disputa">
      <Muneco x={110} y={130} color={CYAN} escala={1.7} />
      <Muneco x={370} y={130} color={TEAL} escala={1.7} />
      <circle cx="240" cy="125" r="26" fill={AMBER} opacity="0.18" stroke={AMBER} strokeWidth="2">
        <animate attributeName="r" values="24;28;24" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="240" y="132" textAnchor="middle" fontSize="20">💧</text>
      <line x1="140" y1="125" x2="210" y2="125" stroke={CYAN} strokeWidth="2.2" strokeDasharray="5 5">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.2s" repeatCount="indefinite" />
      </line>
      <line x1="340" y1="125" x2="270" y2="125" stroke={TEAL} strokeWidth="2.2" strokeDasharray="5 5">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.2s" repeatCount="indefinite" />
      </line>
      <text x="240" y="75" textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="600">
        queremos cosas distintas
      </text>
      <Pie>recursos · límites · responsabilidades · compromisos</Pie>
    </svg>
  );
}

// Inventamos formas de resolver: conviven, no se reemplazan.
function Formas() {
  const bandas = [
    { l: "negociación directa", x: 30, w: 420, c: TEAL },
    { l: "sabios, ancianos, autoridades de la comunidad", x: 50, w: 360, c: CYAN },
    { l: "acuerdos apoyados en costumbres", x: 80, w: 370, c: VIOLET },
    { l: "procedimientos ante autoridades", x: 170, w: 280, c: AMBER },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Formas de resolver conflictos que conviven en el tiempo">
      {bandas.map((b, i) => (
        <g key={b.l}>
          <rect x={b.x} y={50 + i * 38} width={b.w} height="28" rx="14" fill={b.c} opacity="0.13" stroke={b.c} strokeWidth="1.6">
            <animate attributeName="opacity" values="0.08;0.24;0.08" dur="5s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
          </rect>
          <text x={b.x + 14} y={68 + i * 38} fill={TEXT} fontSize="11.5">
            {b.l}
          </text>
        </g>
      ))}
      <line x1="30" y1="212" x2="450" y2="212" stroke={LINE} strokeWidth="1.6" />
      <text x="30" y="228" fill={FAINT} fontSize="10">antes</text>
      <text x="450" y="228" textAnchor="end" fill={FAINT} fontSize="10">hoy</text>
      <line x1="0" y1="45" x2="0" y2="205" stroke={AMBER} strokeWidth="1.6" strokeDasharray="3 4">
        <animate attributeName="x1" values="40;440;40" dur="9s" repeatCount="indefinite" />
        <animate attributeName="x2" values="40;440;40" dur="9s" repeatCount="indefinite" />
      </line>
      <Pie y={250}>en cualquier momento, varias formas a la vez</Pie>
    </svg>
  );
}

// El juicio es una tecnología: roles, reglas y un recorrido.
function Juicio() {
  const pasos = ["pretensión", "respuesta", "prueba y debate", "decisión"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="El juicio como procedimiento organizado">
      <Muneco x={80} y={62} color={CYAN} />
      <text x="80" y="92" textAnchor="middle" fill={FAINT} fontSize="10">parte actora</text>
      <Muneco x={240} y={62} color={TEAL} />
      <text x="240" y="92" textAnchor="middle" fill={FAINT} fontSize="10">parte demandada</text>
      <text x="400" y="66" textAnchor="middle" fontSize="22">⚖️</text>
      <text x="400" y="92" textAnchor="middle" fill={FAINT} fontSize="10">autoridad</text>
      {pasos.map((p, i) => (
        <Paso key={p} x={22 + i * 114} y={118} w={100} label={p} i={i} total={4} color={i === 3 ? AMBER : TEAL} />
      ))}
      <circle r="5" fill={AMBER}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M72,176 L414,176" />
      </circle>
      <line x1="72" y1="176" x2="414" y2="176" stroke={LINE} strokeWidth="1.4" strokeDasharray="4 5" />
      <Pie y={215}>quién interviene · cómo se presenta la información · quién resuelve</Pie>
    </svg>
  );
}

// Un conflicto, distintos caminos: ¿quién decide?
function Caminos() {
  const c = [
    { x: 70, e: "🤝", l: "Negociar", d: "las partes" },
    { x: 180, e: "🗣️", l: "Mediar", d: "las partes, con un facilitador" },
    { x: 300, e: "📜", l: "Arbitrar", d: "árbitros elegidos" },
    { x: 410, e: "⚖️", l: "Juzgar", d: "la autoridad judicial" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Negociar, mediar, arbitrar y juzgar según quién decide">
      <defs>
        <linearGradient id="jusDecide" x1="0" x2="1">
          <stop offset="0" stopColor={TEAL} />
          <stop offset="1" stopColor={AMBER} />
        </linearGradient>
      </defs>
      <rect x="40" y="150" width="400" height="6" rx="3" fill="url(#jusDecide)" opacity="0.7" />
      <text x="40" y="180" fill={TEAL} fontSize="11" fontWeight="700">deciden las partes</text>
      <text x="440" y="180" textAnchor="end" fill={AMBER} fontSize="11" fontWeight="700">decide un tercero</text>
      {c.map((k, i) => (
        <g key={k.l}>
          <circle cx={k.x} cy="95" r="30" fill={PANEL} stroke={i < 2 ? TEAL : AMBER} strokeWidth="2">
            <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          </circle>
          <text x={k.x} y="103" textAnchor="middle" fontSize="20">{k.e}</text>
          <text x={k.x} y="48" textAnchor="middle" fill={TEXT} fontSize="12.5" fontWeight="700">{k.l}</text>
          <line x1={k.x} y1="125" x2={k.x} y2="150" stroke={LINE} strokeWidth="1.4" />
          <text x={k.x} y="205" textAnchor="middle" fill={FAINT} fontSize="9.5">{k.d}</text>
        </g>
      ))}
      <Pie y={240}>cada herramienta organiza distinto a las mismas personas</Pie>
    </svg>
  );
}

// Del papel a la pantalla.
function Papel() {
  const chips = ["documentos digitales", "presentaciones electrónicas", "notificaciones", "audiencias remotas"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="El expediente pasa del papel a la pantalla">
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={46 + i * 3} y={70 + i * 12} width="96" height="72" rx="6" fill={PANEL} stroke={LINE} strokeWidth="1.4" />
      ))}
      <text x="100" y="200" textAnchor="middle" fill={FAINT} fontSize="11">papel</text>
      <line x1="160" y1="118" x2="222" y2="118" stroke={LINE} strokeWidth="2" strokeDasharray="4 5" />
      <circle r="4.5" fill={AMBER}>
        <animateMotion dur="2s" repeatCount="indefinite" path="M160,118 L222,118" />
      </circle>
      <rect x="228" y="48" width="220" height="140" rx="12" fill="none" stroke={CYAN} strokeWidth="2.2" />
      <rect x="310" y="188" width="56" height="12" rx="3" fill={LINE} />
      {chips.map((c, i) => (
        <g key={c} opacity="0">
          <rect x="244" y={62 + i * 30} width="188" height="22" rx="11" fill={CYAN} opacity="0.13" stroke={CYAN} strokeWidth="1.2" />
          <text x="338" y={77 + i * 30} textAnchor="middle" fill={TEXT} fontSize="10.5">{c}</text>
          <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${0.1 + i * 0.18};${0.18 + i * 0.18};1`} dur="6s" repeatCount="indefinite" />
        </g>
      ))}
      <Pie y={240}>cambió el soporte — y con él, el acceso y la circulación</Pie>
    </svg>
  );
}

// ¿Y cuánto cambió el trabajo? Muchos PDF, la misma búsqueda a mano.
function Pdfs() {
  const celdas: Array<[number, number]> = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) celdas.push([46 + c * 50, 50 + r * 52]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Búsqueda manual entre muchos PDF">
      {celdas.map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="34" height="42" rx="4" fill={PANEL} stroke={i === 13 ? AMBER : LINE} strokeWidth={i === 13 ? 2 : 1.3} />
          <text x={x + 17} y={y + 26} textAnchor="middle" fill={i === 13 ? AMBER : FAINT} fontSize="8.5" fontWeight="700">PDF</text>
        </g>
      ))}
      <g>
        <circle cx="0" cy="0" r="18" fill="none" stroke={TEAL} strokeWidth="3" />
        <line x1="13" y1="13" x2="26" y2="26" stroke={TEAL} strokeWidth="4" strokeLinecap="round" />
        <animateMotion dur="7s" repeatCount="indefinite" path="M63,70 L413,70 L413,122 L63,122 L63,174 L263,174 L313,122" />
      </g>
      <Pie y={228}>el documento es digital; la búsqueda sigue siendo a mano</Pie>
    </svg>
  );
}

// Diseñar cómo trabajamos: una tarea descompuesta en pasos.
function Flujo() {
  const pasos = [
    { l: "ingreso", s: "reunir documentos" },
    { l: "organización", s: "personas y fechas" },
    { l: "consulta", s: "ordenar hechos" },
    { l: "revisión", s: "comprobar referencias" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Una tarea descompuesta en cuatro pasos">
      {pasos.map((p, i) => (
        <g key={p.l}>
          <Paso x={24 + i * 114} y={80} w={100} label={p.l} i={i} total={4} />
          <text x={74 + i * 114} y="150" textAnchor="middle" fill={FAINT} fontSize="10">{p.s}</text>
          <text x={74 + i * 114} y="182" textAnchor="middle" fontSize="15">
            🔧
            <animate attributeName="opacity" values="0.15;1;0.15" dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          </text>
          {i < 3 && <line x1={124 + i * 114} y1="103" x2={138 + i * 114} y2="103" stroke={LINE} strokeWidth="2" />}
        </g>
      ))}
      <Pie y={228}>cada paso admite una intervención tecnológica concreta</Pie>
    </svg>
  );
}

// IA: trabajar con lenguaje.
function Verbos() {
  const v = [
    { x: 110, y: 70, l: "preguntar", e: "¿qué plazos vencen?" },
    { x: 370, y: 70, l: "resumir", e: "un expediente en 10 líneas" },
    { x: 110, y: 185, l: "comparar", e: "dos versiones de un contrato" },
    { x: 370, y: 185, l: "generar", e: "un borrador a revisar" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Tareas de lenguaje que asiste la IA">
      <circle cx="240" cy="128" r="36" fill={PANEL} stroke={VIOLET} strokeWidth="2.4">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="240" y="134" textAnchor="middle" fill={VIOLET} fontSize="15" fontWeight="700" fontFamily="monospace">IA</text>
      {v.map((k, i) => (
        <g key={k.l}>
          <line x1="240" y1="128" x2={k.x} y2={k.y} stroke={LINE} strokeWidth="1.2" strokeDasharray="3 4" />
          <rect x={k.x - 82} y={k.y - 24} width="164" height="48" rx="12" fill={PANEL} stroke={TEAL} strokeWidth="1.8">
            <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          </rect>
          <text x={k.x} y={k.y - 3} textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="700">{k.l}</text>
          <text x={k.x} y={k.y + 14} textAnchor="middle" fill={FAINT} fontSize="9.5">{k.e}</text>
        </g>
      ))}
    </svg>
  );
}

// Responder bien requiere contexto.
function Contexto() {
  const campos = [
    { k: "Fuentes", v: "solo los documentos D1 a D5" },
    { k: "Tarea", v: "cronología de hechos" },
    { k: "Formato", v: "tabla con fecha y fuente" },
    { k: "Además", v: "señalar los datos faltantes" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Encargo vago versus encargo delimitado">
      <g opacity="0.7">
        <rect x="30" y="80" width="150" height="54" rx="16" fill="none" stroke={LINE} strokeWidth="1.8" />
        <text x="105" y="112" textAnchor="middle" fill={FAINT} fontSize="12.5">“Analice este caso.”</text>
        <text x="105" y="160" textAnchor="middle" fill={ROSA} fontSize="18" fontWeight="700">
          ? ? ?
          <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" />
        </text>
      </g>
      <text x="206" y="113" textAnchor="middle" fill={FAINT} fontSize="18">→</text>
      <rect x="232" y="40" width="220" height="172" rx="14" fill={PANEL} stroke={TEAL} strokeWidth="2.2" />
      {campos.map((c, i) => (
        <g key={c.k} opacity="0">
          <text x="248" y={72 + i * 38} fill={TEAL} fontSize="10" fontWeight="700" fontFamily="monospace">{c.k.toUpperCase()}</text>
          <text x="248" y={88 + i * 38} fill={TEXT} fontSize="11.5">{c.v}</text>
          <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${0.08 + i * 0.16};${0.16 + i * 0.16};1`} dur="6s" repeatCount="indefinite" />
        </g>
      ))}
      <Pie y={240}>la calidad del encargo condiciona la respuesta</Pie>
    </svg>
  );
}

// Una herramienta combina capacidades.
function Combina() {
  const partes = [
    { y: 50, e: "🔎", l: "buscador" },
    { y: 95, e: "🧮", l: "cálculo de importes" },
    { y: 140, e: "📏", l: "reglas y plazos" },
    { y: 185, e: "✨", l: "modelo de lenguaje" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Componentes que se combinan en una herramienta">
      {partes.map((p, i) => (
        <g key={p.l}>
          <rect x="30" y={p.y - 17} width="150" height="34" rx="10" fill={PANEL} stroke={CYAN} strokeWidth="1.6" />
          <text x="52" y={p.y + 5} fontSize="14">{p.e}</text>
          <text x="72" y={p.y + 5} fill={TEXT} fontSize="11">{p.l}</text>
          <line x1="180" y1={p.y} x2="250" y2="118" stroke={LINE} strokeWidth="1.3" />
          <circle r="3.5" fill={AMBER}>
            <animateMotion dur="2.4s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={`M180,${p.y} L250,118`} />
          </circle>
        </g>
      ))}
      <rect x="250" y="82" width="110" height="72" rx="14" fill={VIOLET} opacity="0.14" stroke={VIOLET} strokeWidth="2.4" />
      <text x="305" y="114" textAnchor="middle" fill={VIOLET} fontSize="11.5" fontWeight="700" fontFamily="monospace">HERRAMIENTA</text>
      <text x="305" y="132" textAnchor="middle" fill={FAINT} fontSize="9.5">diseñada para una tarea</text>
      <line x1="360" y1="118" x2="400" y2="118" stroke={LINE} strokeWidth="2" />
      <Muneco x={430} y={120} color={TEAL} escala={1.3} />
      <text x="430" y="160" textAnchor="middle" fill={TEXT} fontSize="10">necesidad</text>
      <text x="430" y="173" textAnchor="middle" fill={TEXT} fontSize="10">profesional</text>
      <Pie y={240}>desarrollar es combinar capacidades alrededor de una necesidad</Pie>
    </svg>
  );
}

// Hablar con seguridad no alcanza.
function Seguridad() {
  const errores = [
    { x: 90, y: 180, l: "atribuye a la parte equivocada" },
    { x: 240, y: 208, l: "completa un dato ausente" },
    { x: 390, y: 180, l: "convierte una posibilidad en certeza" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Una respuesta segura puede contener errores">
      <rect x="90" y="40" width="300" height="80" rx="18" fill={PANEL} stroke={TEAL} strokeWidth="2" />
      <path d="M150,120 L140,142 L175,120" fill={PANEL} stroke={TEAL} strokeWidth="2" />
      <text x="240" y="74" textAnchor="middle" fill={TEXT} fontSize="13.5" fontWeight="600">
        “Sin duda, las partes coinciden
      </text>
      <text x="240" y="96" textAnchor="middle" fill={TEXT} fontSize="13.5" fontWeight="600">
        en la deuda.”
      </text>
      {errores.map((e, i) => (
        <text key={e.l} x={e.x} y={e.y} textAnchor="middle" fill={ROSA} fontSize="11" fontWeight="600">
          ⚠ {e.l}
          <animate attributeName="opacity" values="0.15;1;0.15" dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" />
        </text>
      ))}
      <Pie y={248}>el tono seguro no prueba que el contenido sea correcto</Pie>
    </svg>
  );
}

// Lo que el resumen agregó.
function Agrego() {
  return (
    <svg viewBox="0 0 480 280" className="w-full" role="img" aria-label="El resumen agregó un acuerdo que el correo no expresa">
      <rect x="20" y="30" width="215" height="190" rx="14" fill={PANEL} stroke={CYAN} strokeWidth="1.8" />
      <text x="36" y="54" fill={CYAN} fontSize="10" fontWeight="700" fontFamily="monospace">EL CORREO (08/04)</text>
      {[
        "“Podemos transferir US$ 1.000",
        "esta semana, pero necesitamos",
        "aclarar qué pasó con los dos",
        "equipos que no están instalados",
        "y con el del aula 3, que no enfría.”",
      ].map((l, i) => (
        <text key={l} x="36" y={84 + i * 22} fill={i >= 1 ? TEXT : FAINT} fontSize="11.5">
          {l}
        </text>
      ))}
      <rect x="30" y="96" width="198" height="94" rx="6" fill={AMBER} opacity="0.1">
        <animate attributeName="opacity" values="0.04;0.2;0.04" dur="3s" repeatCount="indefinite" />
      </rect>
      <rect x="245" y="30" width="215" height="190" rx="14" fill={PANEL} stroke={ROSA} strokeWidth="1.8" />
      <text x="261" y="54" fill={ROSA} fontSize="10" fontWeight="700" fontFamily="monospace">EL RESUMEN</text>
      <text x="261" y="90" fill={TEXT} fontSize="12">“Las partes coinciden</text>
      <text x="261" y="112" fill={TEXT} fontSize="12">en la deuda; solo discuten</text>
      <text x="261" y="134" fill={TEXT} fontSize="12">el plazo de pago.”</text>
      <line x1="261" y1="94" x2="400" y2="94" stroke={ROSA} strokeWidth="2">
        <animate attributeName="x2" values="261;400;400" keyTimes="0;0.4;1" dur="3s" repeatCount="indefinite" />
      </line>
      <text x="352" y="180" textAnchor="middle" fill={ROSA} fontSize="11.5" fontWeight="700">
        ⚠ agregó un acuerdo
      </text>
      <text x="352" y="198" textAnchor="middle" fill={FAINT} fontSize="10">que el correo no expresa</text>
      <text x="240" y="258" textAnchor="middle" fill={FAINT} fontSize="12">
        lo que dijeron las partes ≠ lo que interpretó la herramienta
      </text>
    </svg>
  );
}

// Human in the loop.
function Hitl() {
  const nodos = [
    { a: -90, l: "definir el problema" },
    { a: 0, l: "encargar tareas" },
    { a: 90, l: "contrastar resultados" },
    { a: 180, l: "decidir y justificar" },
  ];
  const cx = 240, cy = 124, rx = 150, ry = 82;
  const loop = `M${cx},${cy - ry} A${rx},${ry} 0 1,1 ${cx - 0.1},${cy - ry}`;
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Intervención humana en cada paso del trabajo">
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={LINE} strokeWidth="1.8" strokeDasharray="5 6" />
      <circle r="5.5" fill={AMBER}>
        <animateMotion dur="8s" repeatCount="indefinite" path={loop} />
      </circle>
      {nodos.map((n, i) => {
        const x = cx + rx * Math.cos((n.a * Math.PI) / 180);
        const y = cy + ry * Math.sin((n.a * Math.PI) / 180);
        return (
          <g key={n.l}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={TEAL} strokeWidth="1.2" opacity="0.5" />
            <rect x={x - 66} y={y - 15} width="132" height="30" rx="15" fill={PANEL} stroke={TEAL} strokeWidth="1.8">
              <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="8s" begin={`${i * 2}s`} repeatCount="indefinite" />
            </rect>
            <text x={x} y={y + 4} textAnchor="middle" fill={TEXT} fontSize="11">{n.l}</text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r="26" fill={PANEL} stroke={TEAL} strokeWidth="2.4" />
      <Muneco x={cx} y={cy + 4} color={TEAL} />
      <Pie y={250}>la persona interviene en todo el recorrido, no solo al final</Pie>
    </svg>
  );
}

// Delegar tareas, conservar el criterio.
function Delegacion() {
  const col = (x: number, titulo: string, color: string, filas: { quien: string; que: string; ia?: boolean }[], alerta?: boolean) => (
    <g>
      <rect x={x} y="36" width="200" height="180" rx="14" fill={alerta ? ROSA : TEAL} opacity="0.06" stroke={alerta ? ROSA : TEAL} strokeWidth="2">
        {alerta && <animate attributeName="opacity" values="0.04;0.14;0.04" dur="2.8s" repeatCount="indefinite" />}
      </rect>
      <text x={x + 100} y="62" textAnchor="middle" fill={color} fontSize="12.5" fontWeight="700" fontFamily="monospace">
        {titulo}
      </text>
      {filas.map((f, i) => (
        <g key={f.que}>
          <text x={x + 16} y={96 + i * 30} fontSize="13">{f.ia ? "✨" : "🧑‍⚖️"}</text>
          <text x={x + 38} y={96 + i * 30} fill={TEXT} fontSize="11">{f.que}</text>
        </g>
      ))}
    </g>
  );
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Asistencia versus delegación cognitiva total">
      {col(30, "ASISTENCIA", TEAL, [
        { quien: "h", que: "define el problema" },
        { quien: "ia", que: "organiza la información", ia: true },
        { quien: "h", que: "contrasta con las fuentes" },
        { quien: "h", que: "decide y justifica" },
      ])}
      {col(250, "DELEGACIÓN TOTAL", ROSA, [
        { quien: "ia", que: "elige qué importa", ia: true },
        { quien: "ia", que: "formula las hipótesis", ia: true },
        { quien: "ia", que: "redacta la conclusión", ia: true },
        { quien: "h", que: "solo aprueba" },
      ], true)}
      <Pie y={246}>aun la lectura final queda condicionada si todo el encuadre vino de la IA</Pie>
    </svg>
  );
}

// Pedir. Verificar. Corregir. Aprobar.
function Metodo() {
  const pasos = ["Pedir", "Verificar", "Corregir", "Aprobar"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Método de trabajo en cuatro pasos">
      {pasos.map((p, i) => (
        <g key={p}>
          <circle cx={75 + i * 110} cy="110" r="38" fill="none" stroke={TEAL} strokeWidth="2" opacity="0.35" />
          <g opacity="0">
            <circle cx={75 + i * 110} cy="110" r="38" fill={TEAL} opacity="0.14" stroke={TEAL} strokeWidth="2.6" />
            <text x={75 + i * 110} y="120" textAnchor="middle" fill={TEAL} fontSize="26" fontWeight="700">✓</text>
            <animate attributeName="opacity" values="0;0;1;1" keyTimes={`0;${0.1 + i * 0.18};${0.16 + i * 0.18};1`} dur="7s" repeatCount="indefinite" />
          </g>
          <text x={75 + i * 110} y="176" textAnchor="middle" fill={TEXT} fontSize="14" fontWeight="700">{p}</text>
          {i < 3 && <line x1={113 + i * 110} y1="110" x2={147 + i * 110} y2="110" stroke={LINE} strokeWidth="2" />}
        </g>
      ))}
      <Pie y={228}>resultado definido · referencias verificables · revisión · versión final</Pie>
    </svg>
  );
}

// En Argentina ya hay experiencias: automatización documental con revisión.
function Antecedente() {
  const pasos = [
    { l: "plantilla", e: "📄" },
    { l: "datos del caso", e: "🗂️" },
    { l: "borrador", e: "📝" },
    { l: "revisión humana", e: "🧑‍⚖️" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Automatización documental con revisión humana">
      {pasos.map((p, i) => (
        <g key={p.l}>
          <circle cx={70 + i * 113} cy="112" r="34" fill={PANEL} stroke={i === 3 ? AMBER : TEAL} strokeWidth="2">
            <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" />
          </circle>
          <text x={70 + i * 113} y="120" textAnchor="middle" fontSize="20">{p.e}</text>
          <text x={70 + i * 113} y="168" textAnchor="middle" fill={TEXT} fontSize="11.5" fontWeight="600">{p.l}</text>
          {i < 3 && (
            <circle r="4" fill={AMBER}>
              <animateMotion dur="6s" begin={`${i * 1.5}s`} repeatCount="indefinite" path={`M${104 + i * 113},112 L${149 + i * 113},112`} keyPoints="0;1;1" keyTimes="0;0.25;1" calcMode="linear" />
            </circle>
          )}
        </g>
      ))}
      <text x="240" y="60" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700" fontFamily="monospace">
        TAREAS REPETITIVAS · DOCUMENTOS ESTANDARIZABLES
      </text>
      <Pie y={218}>una herramienta adaptada a una tarea específica</Pie>
    </svg>
  );
}

// ¿Cómo "aprende" del expediente? Consulta documental.
function Rag() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Incorporar, organizar y recuperar contexto del expediente">
      {["D1", "D2", "D3", "D4", "D5"].map((d, i) => (
        <g key={d}>
          <rect x={24} y={42 + i * 34} width="46" height="26" rx="5" fill={PANEL} stroke={CYAN} strokeWidth="1.5" />
          <text x="47" y={59 + i * 34} textAnchor="middle" fill={CYAN} fontSize="10" fontFamily="monospace">{d}</text>
        </g>
      ))}
      <text x="47" y="228" textAnchor="middle" fill={FAINT} fontSize="10">incorporar</text>
      <line x1="76" y1="120" x2="116" y2="120" stroke={LINE} strokeWidth="2" />
      <rect x="120" y="42" width="130" height="160" rx="12" fill="none" stroke={VIOLET} strokeWidth="2" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect
          key={i}
          x={134 + (i % 3) * 38}
          y={56 + Math.floor(i / 3) * 36}
          width="30"
          height="24"
          rx="4"
          fill={i === 4 || i === 9 ? AMBER : VIOLET}
          opacity={i === 4 || i === 9 ? 0.5 : 0.15}
        >
          {(i === 4 || i === 9) && <animate attributeName="opacity" values="0.2;0.8;0.2" dur="2.6s" repeatCount="indefinite" />}
        </rect>
      ))}
      <text x="185" y="228" textAnchor="middle" fill={FAINT} fontSize="10">organizar en fragmentos</text>
      <text x="300" y="60" textAnchor="middle" fill={TEXT} fontSize="11">“¿cuándo vence el saldo?”</text>
      <line x1="256" y1="110" x2="300" y2="110" stroke={AMBER} strokeWidth="2" strokeDasharray="4 4">
        <animate attributeName="stroke-dashoffset" values="0;-16" dur="1s" repeatCount="indefinite" />
      </line>
      <text x="278" y="228" textAnchor="middle" fill={FAINT} fontSize="10">recuperar</text>
      <rect x="305" y="80" width="155" height="92" rx="12" fill={PANEL} stroke={TEAL} strokeWidth="2.2" />
      <text x="318" y="104" fill={TEXT} fontSize="11">A los 10 días de la</text>
      <text x="318" y="122" fill={TEXT} fontSize="11">instalación conforme,</text>
      <text x="318" y="140" fill={TEXT} fontSize="11">con acta firmada.</text>
      <text x="318" y="160" fill={TEAL} fontSize="10" fontWeight="700" fontFamily="monospace">[D1 · cl. 4]</text>
      <text x="382" y="228" textAnchor="middle" fill={FAINT} fontSize="10">responder con fuente</text>
      <Pie y={252}>le damos contexto al modelo; no lo reentrenamos</Pie>
    </svg>
  );
}
