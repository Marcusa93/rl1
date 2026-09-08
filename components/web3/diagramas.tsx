"use client";

// Diagramas animados de la clase "Web3, descentralización y gobernanza"
// (/web3 — Diplomatura en Derecho 5.0, UMSA). SVG con animación SMIL,
// misma estética que los de /empresas/clase.

const TEAL = "#2dd4bf";
const CYAN = "#22d3ee";
const VIOLET = "#8b5cf6";
const AMBER = "#fbbf24";
const ROSA = "#f472b6";
const LINE = "#3b3f6e";
const TEXT = "#c7c9e8";
const FAINT = "#7e81ab";
const PANEL = "#171a37";

export type DiagramaW3Id =
  | "palabra" | "aldea" | "escala" | "certificar" | "derecho"
  | "internet" | "manos" | "sincentro" | "bloques" | "enquien"
  | "sosvos" | "rastros" | "verescuchar" | "deepfake" | "autenticidad"
  | "phishing" | "imagenajena" | "proteger" | "credencial" | "procedencia"
  | "reglascodigo" | "nopodes" | "smart" | "justicia" | "distribuidas"
  | "dao" | "ballena" | "responde" | "arquitectura" | "traductor"
  | "evolucion" | "voz" | "maquina" | "genera" | "agente" | "grados"
  | "vrar" | "avatar";

export function DiagramaW3({ id }: { id: DiagramaW3Id }) {
  const D: Record<DiagramaW3Id, () => React.ReactNode> = {
    palabra: Palabra, aldea: Aldea, escala: Escala, certificar: Certificar, derecho: Derecho,
    internet: Internet, manos: Manos, sincentro: SinCentro, bloques: Bloques, enquien: EnQuien,
    sosvos: SosVos, rastros: Rastros, verescuchar: VerEscuchar, deepfake: Deepfake, autenticidad: Autenticidad,
    phishing: Phishing, imagenajena: ImagenAjena, proteger: Proteger, credencial: Credencial, procedencia: Procedencia,
    reglascodigo: ReglasCodigo, nopodes: NoPodes, smart: Smart, justicia: Justicia, distribuidas: Distribuidas,
    dao: Dao, ballena: Ballena, responde: Responde, arquitectura: Arquitectura, traductor: Traductor,
    evolucion: Evolucion, voz: Voz, maquina: Maquina, genera: Genera, agente: Agente, grados: Grados,
    vrar: VrAr, avatar: Avatar,
  };
  return <>{D[id]()}</>;
}

function Muneco({ x, y, color = TEXT, escala = 1 }: { x: number; y: number; color?: string; escala?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${escala})`}>
      <circle cx="0" cy="-10" r="7" fill="none" stroke={color} strokeWidth="2" />
      <path d="M-11,12 C-11,0 11,0 11,12" fill="none" stroke={color} strokeWidth="2" />
    </g>
  );
}

function Pie({ children }: { children: React.ReactNode }) {
  return (
    <text x="240" y="248" textAnchor="middle" fill={FAINT} fontSize="12">
      {children}
    </text>
  );
}

const VB = "0 0 480 260";

// 1 · Antes de la tecnología, estaba la confianza
function Palabra() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Dos personas y la pregunta de la confianza">
      <Muneco x={120} y={130} color={CYAN} escala={1.6} />
      <Muneco x={360} y={130} color={TEAL} escala={1.6} />
      <line x1="150" y1="125" x2="330" y2="125" stroke={LINE} strokeWidth="2" strokeDasharray="6 7" />
      <circle r="5" fill={AMBER}>
        <animateMotion dur="2.6s" repeatCount="indefinite" path="M150,125 L330,125" />
      </circle>
      <text x="240" y="80" textAnchor="middle" fill={TEXT} fontSize="15" fontWeight="600">
        ¿me puedo fiar?
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
      </text>
      <Pie>¿dice la verdad? ¿es suyo? ¿va a cumplir? ¿ocurrió?</Pie>
    </svg>
  );
}

// 2 · Cuando todos se conocían
function Aldea() {
  const p = [
    [240, 60], [330, 95], [355, 165], [285, 210], [195, 210], [125, 165], [150, 95],
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Aldea: todos se conocen">
      {p.map(([x1, y1], i) =>
        p.slice(i + 1).map(([x2, y2], j) => (
          <line key={`${i}-${j}`} x1={x1} y1={y1 - 8} x2={x2} y2={y2 - 8} stroke={TEAL} strokeWidth="1" opacity="0.25">
            <animate attributeName="opacity" values="0.1;0.45;0.1" dur={`${3 + ((i + j) % 4)}s`} repeatCount="indefinite" />
          </line>
        )),
      )}
      {p.map(([x, y], i) => (
        <Muneco key={i} x={x} y={y} color={i % 2 ? CYAN : TEAL} />
      ))}
      <Pie>escala chica: reputación, parentesco, conocimiento directo</Pie>
    </svg>
  );
}

// 3 · La sociedad creció
function Escala() {
  const puntos: Array<[number, number]> = [];
  for (let i = 0; i < 40; i++) puntos.push([40 + (i % 10) * 45 + (i % 3) * 6, 50 + Math.floor(i / 10) * 42]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Muchos desconocidos">
      {puntos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="6" fill="none" stroke={i === 17 ? TEAL : LINE} strokeWidth={i === 17 ? 2.4 : 1.4} />
      ))}
      {[[130, 92], [310, 134], [220, 176]].map(([x, y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" fill={AMBER} fontSize="16" fontWeight="700">
          ?
          <animate attributeName="opacity" values="0.2;1;0.2" dur="3s" begin={`${i}s`} repeatCount="indefinite" />
        </text>
      ))}
      <Pie>comercio, ciudades, desconocidos: conocerse ya no alcanza</Pie>
    </svg>
  );
}

// 4 · Inventamos intermediarios
function Certificar() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="El intermediario certifica entre desconocidos">
      <Muneco x={90} y={130} color={CYAN} escala={1.4} />
      <Muneco x={390} y={130} color={TEAL} escala={1.4} />
      <rect x="185" y="80" width="110" height="90" rx="12" fill={PANEL} stroke={VIOLET} strokeWidth="2.4" />
      <text x="240" y="115" textAnchor="middle" fontSize="26">🖋️</text>
      <text x="240" y="145" textAnchor="middle" fill={VIOLET} fontSize="10.5" fontWeight="700" fontFamily="monospace">
        DA FE
      </text>
      <line x1="120" y1="125" x2="183" y2="125" stroke={LINE} strokeWidth="1.8" />
      <line x1="297" y1="125" x2="360" y2="125" stroke={LINE} strokeWidth="1.8" />
      <g opacity="0">
        <text x="240" y="60" textAnchor="middle" fill={TEAL} fontSize="14" fontWeight="700">✓ certificado</text>
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.3;0.4;0.85;1" dur="4s" repeatCount="indefinite" />
      </g>
      <Pie>escribanos · registros · monedas · jueces · bancos — tecnologías sociales</Pie>
    </svg>
  );
}

// 5 · El Derecho también fabrica confianza
function Derecho() {
  const funciones = ["registra", "certifica", "reconoce", "resuelve"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Funciones de confianza del Derecho">
      <text x="240" y="86" textAnchor="middle" fontSize="42">⚖️</text>
      {funciones.map((f, i) => (
        <g key={f}>
          <rect x={40 + i * 105} y="140" width="93" height="40" rx="10" fill="none" stroke={TEAL} strokeWidth="1.8">
            <animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="5s" begin={`${i * 1.25}s`} repeatCount="indefinite" />
          </rect>
          <text x={86 + i * 105} y="165" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
            {f}
            <animate attributeName="opacity" values="0.5;1;0.5" dur="5s" begin={`${i * 1.25}s`} repeatCount="indefinite" />
          </text>
          <line x1={86 + i * 105} y1="138" x2="240" y2="100" stroke={LINE} strokeWidth="1.2" strokeDasharray="3 4" />
        </g>
      ))}
      <Pie>identifica personas, reconoce derechos, registra titularidades, zanja conflictos</Pie>
    </svg>
  );
}

// 6 · Después llegó Internet
function Internet() {
  const plat = [
    { x: 120, y: 80, l: "buscador" }, { x: 360, y: 80, l: "red social" },
    { x: 120, y: 180, l: "banco digital" }, { x: 360, y: 180, l: "marketplace" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Internet creó nuevos intermediarios">
      <circle cx="240" cy="130" r="34" fill="none" stroke={CYAN} strokeWidth="2" strokeDasharray="4 5">
        <animateTransform attributeName="transform" type="rotate" from="0 240 130" to="360 240 130" dur="16s" repeatCount="indefinite" />
      </circle>
      <text x="240" y="137" textAnchor="middle" fontSize="20">🌐</text>
      {plat.map((p, i) => (
        <g key={p.l}>
          <line x1={p.x} y1={p.y} x2="240" y2="130" stroke={LINE} strokeWidth="1.4" />
          <rect x={p.x - 52} y={p.y - 16} width="104" height="32" rx="9" fill={PANEL} stroke={VIOLET} strokeWidth="1.8">
            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="4.5s" begin={`${i * 1.1}s`} repeatCount="indefinite" />
          </rect>
          <text x={p.x} y={p.y + 5} textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
            {p.l}
          </text>
        </g>
      ))}
      <Pie>parecía descentralizar información — creó intermediarios enormes</Pie>
    </svg>
  );
}

// 7 · La confianza cambió de manos
function Manos() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="La confianza pasó de instituciones a plataformas">
      <line x1="240" y1="50" x2="240" y2="110" stroke={TEXT} strokeWidth="3" />
      <line x1="120" y1="110" x2="360" y2="110" stroke={TEXT} strokeWidth="3">
        <animateTransform attributeName="transform" type="rotate" values="0 240 110;-7 240 110;0 240 110" dur="5s" repeatCount="indefinite" />
      </line>
      <g>
        <line x1="120" y1="110" x2="120" y2="140" stroke={LINE} strokeWidth="1.6" />
        <rect x="75" y="140" width="90" height="52" rx="10" fill="none" stroke={TEAL} strokeWidth="2" />
        <text x="120" y="162" textAnchor="middle" fontSize="16">🏛️</text>
        <text x="120" y="182" textAnchor="middle" fill={TEXT} fontSize="10.5">instituciones</text>
      </g>
      <g>
        <line x1="360" y1="110" x2="360" y2="140" stroke={LINE} strokeWidth="1.6" />
        <rect x="315" y="140" width="90" height="52" rx="10" fill={VIOLET} opacity="0.12" stroke={VIOLET} strokeWidth="2" />
        <text x="360" y="162" textAnchor="middle" fontSize="16">📱</text>
        <text x="360" y="182" textAnchor="middle" fill={TEXT} fontSize="10.5">plataformas</text>
      </g>
      <Pie>¿quién certifica hoy tu identidad, tus pagos, tu reputación?</Pie>
    </svg>
  );
}

// 8 · ¿Y si la confianza no tuviera un centro?
function SinCentro() {
  const cx = 120, cy = 125, r = 62;
  const sat = [0, 60, 120, 180, 240, 300].map((a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)]);
  const mx = 360, my = 125;
  const mesh = [0, 60, 120, 180, 240, 300].map((a) => [mx + r * Math.cos((a * Math.PI) / 180), my + r * Math.sin((a * Math.PI) / 180)]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Red con centro versus red distribuida">
      {sat.map(([x, y], i) => (
        <g key={i}>
          <line x1={cx} y1={cy} x2={x} y2={y} stroke={LINE} strokeWidth="1.4" />
          <circle cx={x} cy={y} r="7" fill="none" stroke={CYAN} strokeWidth="1.8" />
        </g>
      ))}
      <circle cx={cx} cy={cy} r="13" fill={CYAN} opacity="0.9">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <text x={cx} y="215" textAnchor="middle" fill={FAINT} fontSize="11.5">un solo validador</text>
      {mesh.map(([x1, y1], i) =>
        mesh.map(([x2, y2], j) =>
          j > i ? <line key={`${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TEAL} strokeWidth="0.9" opacity="0.35" /> : null,
        ),
      )}
      {mesh.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="8" fill={PANEL} stroke={TEAL} strokeWidth="2">
          <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="3s" begin={`${i * 0.5}s`} repeatCount="indefinite" />
        </circle>
      ))}
      <text x={mx} y="215" textAnchor="middle" fill={FAINT} fontSize="11.5">validación distribuida</text>
      <Pie>la promesa de Web3: repartir lo que hacía uno solo</Pie>
    </svg>
  );
}

// 9 · No es magia. Es arquitectura
function Bloques() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Cadena de bloques verificada en red">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={50 + i * 100} y="90" width="72" height="56" rx="9" fill={PANEL} stroke={TEAL} strokeWidth="2" />
          <text x={86 + i * 100} y="113" textAnchor="middle" fill={TEAL} fontSize="10" fontFamily="monospace">
            bloque {i + 1}
          </text>
          <text x={86 + i * 100} y="131" textAnchor="middle" fill={FAINT} fontSize="8.5" fontFamily="monospace">
            #a{(7 + i * 3).toString(16)}f…{(i + 2).toString(16)}c
          </text>
          {i < 3 && <line x1={122 + i * 100} y1="118" x2={150 + i * 100} y2="118" stroke={LINE} strokeWidth="2.4" />}
        </g>
      ))}
      <g opacity="0">
        <text x="386" y="70" textAnchor="middle" fill={ROSA} fontSize="13" fontWeight="700">✕ alterado</text>
        <rect x="350" y="90" width="72" height="56" rx="9" fill="none" stroke={ROSA} strokeWidth="2.4" />
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.45;0.55;0.85;1" dur="5s" repeatCount="indefinite" />
      </g>
      {[80, 240, 400].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="195" r="9" fill="none" stroke={CYAN} strokeWidth="1.8" />
          <text x={x} y="199" textAnchor="middle" fill={CYAN} fontSize="9">✓</text>
          <line x1={x} y1="185" x2={x + (240 - x) * 0.2 + 0} y2="150" stroke={LINE} strokeWidth="1" strokeDasharray="3 4" />
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin={`${i * 0.6}s`} repeatCount="indefinite" />
        </g>
      ))}
      <Pie>un registro compartido, verificable y difícil de alterar unilateralmente</Pie>
    </svg>
  );
}

// 10 · Web3 cambia una pregunta
function EnQuien() {
  const etapas = [
    { e: "🤝", l: "persona" }, { e: "🏛️", l: "institución" }, { e: "📱", l: "plataforma" }, { e: "🕸️", l: "red" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="En quién depositamos la confianza, por etapas">
      <line x1="60" y1="120" x2="420" y2="120" stroke={LINE} strokeWidth="2" />
      <circle r="6" fill={AMBER}>
        <animateMotion dur="6s" repeatCount="indefinite" path="M60,120 L420,120" />
      </circle>
      {etapas.map((et, i) => (
        <g key={et.l}>
          <circle cx={80 + i * 107} cy="120" r="26" fill={PANEL} stroke={i === 3 ? TEAL : LINE} strokeWidth={i === 3 ? 2.6 : 1.8} />
          <text x={80 + i * 107} y="128" textAnchor="middle" fontSize="18">{et.e}</text>
          <text x={80 + i * 107} y="170" textAnchor="middle" fill={i === 3 ? TEAL : TEXT} fontSize="12" fontWeight={i === 3 ? 700 : 400}>
            {et.l}
          </text>
        </g>
      ))}
      <Pie>la pregunta ya no es solo qué confiamos — es en quién</Pie>
    </svg>
  );
}

// 11 · Ahora el problema sos vos
function SosVos() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Verificar personas">
      <Muneco x={240} y={120} color={TEAL} escala={2.2} />
      <circle cx="240" cy="105" r="58" fill="none" stroke={CYAN} strokeWidth="1.6" strokeDasharray="6 8">
        <animateTransform attributeName="transform" type="rotate" from="0 240 105" to="360 240 105" dur="10s" repeatCount="indefinite" />
      </circle>
      <text x="330" y="70" fill={AMBER} fontSize="26" fontWeight="700">
        ?
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" repeatCount="indefinite" />
      </text>
      <text x="140" y="160" fill={AMBER} fontSize="20" fontWeight="700">
        ?
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
      </text>
      <Pie>de verificar transacciones… a verificar personas</Pie>
    </svg>
  );
}

// 12 · Tu identidad ya no entra en un DNI
function Rastros() {
  const orbit = [
    { a: 0, l: "cuentas" }, { a: 60, l: "voz" }, { a: 120, l: "rostro" },
    { a: 180, l: "historial" }, { a: 240, l: "biometría" }, { a: 300, l: "dispositivos" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="La identidad excede al documento">
      <rect x="200" y="95" width="80" height="54" rx="8" fill={PANEL} stroke={TEAL} strokeWidth="2" />
      <text x="240" y="118" textAnchor="middle" fill={TEAL} fontSize="11" fontWeight="700" fontFamily="monospace">DNI</text>
      <text x="240" y="136" textAnchor="middle" fill={FAINT} fontSize="8.5">ya no alcanza</text>
      {orbit.map((o, i) => {
        const x = 240 + 140 * Math.cos((o.a * Math.PI) / 180) * 0.9;
        const y = 122 + 78 * Math.sin((o.a * Math.PI) / 180);
        return (
          <g key={o.l}>
            <line x1="240" y1="122" x2={x} y2={y} stroke={LINE} strokeWidth="1" strokeDasharray="3 4" />
            <rect x={x - 42} y={y - 13} width="84" height="26" rx="13" fill="none" stroke={VIOLET} strokeWidth="1.6">
              <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="4.8s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
            </rect>
            <text x={x} y={y + 4} textAnchor="middle" fill={TEXT} fontSize="11">{o.l}</text>
          </g>
        );
      })}
    </svg>
  );
}

// 13 · Durante años confiamos en ver y escuchar
function VerEscuchar() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Ver u oír como prueba">
      <text x="140" y="115" textAnchor="middle" fontSize="44">👁️</text>
      <text x="240" y="115" textAnchor="middle" fontSize="44">👂</text>
      <text x="330" y="112" textAnchor="middle" fill={TEAL} fontSize="34" fontWeight="700">
        = ✓
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.8s" repeatCount="indefinite" />
      </text>
      <text x="240" y="170" textAnchor="middle" fill={TEXT} fontSize="15" fontStyle="italic">
        “si lo veo o lo escucho, probablemente ocurrió”
      </text>
      <Pie>una presunción cultural que funcionó durante décadas</Pie>
    </svg>
  );
}

// 14 · Eso se terminó
function Deepfake() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Rostro real y rostro sintético indistinguibles">
      <g>
        <Muneco x={150} y={110} color={TEAL} escala={2} />
        <text x="150" y="175" textAnchor="middle" fill={TEXT} fontSize="12">real</text>
      </g>
      <g>
        <Muneco x={330} y={110} color={ROSA} escala={2} />
        <text x="330" y="175" textAnchor="middle" fill={ROSA} fontSize="12">sintética</text>
        <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" repeatCount="indefinite" />
      </g>
      <path d="M120,205 q10,-12 20,0 q10,12 20,0 q10,-12 20,0" fill="none" stroke={TEAL} strokeWidth="2" />
      <path d="M300,205 q10,-12 20,0 q10,12 20,0 q10,-12 20,0" fill="none" stroke={ROSA} strokeWidth="2">
        <animate attributeName="opacity" values="0.35;1;0.35" dur="3s" repeatCount="indefinite" />
      </path>
      <text x="240" y="120" textAnchor="middle" fill={AMBER} fontSize="22" fontWeight="700">
        ¿cuál?
        <animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" />
      </text>
      <Pie>deepfakes, voces clonadas, imágenes y videos que nunca ocurrieron</Pie>
    </svg>
  );
}

// 15 · ¿Sos vos o parece que sos vos?
function Autenticidad() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Identificación versus autenticidad">
      <rect x="40" y="60" width="185" height="130" rx="14" fill="none" stroke={CYAN} strokeWidth="1.8" />
      <text x="132" y="92" textAnchor="middle" fill={CYAN} fontSize="13" fontWeight="700" fontFamily="monospace">IDENTIFICACIÓN</text>
      <text x="132" y="125" textAnchor="middle" fill={TEXT} fontSize="14">¿quién sos?</text>
      <text x="132" y="160" textAnchor="middle" fill={FAINT} fontSize="11">reconocer una cara, una voz</text>
      <rect x="255" y="60" width="185" height="130" rx="14" fill={VIOLET} opacity="0.08" stroke={VIOLET} strokeWidth="2.2">
        <animate attributeName="opacity" values="0.05;0.16;0.05" dur="3s" repeatCount="indefinite" />
      </rect>
      <text x="347" y="92" textAnchor="middle" fill={VIOLET} fontSize="13" fontWeight="700" fontFamily="monospace">AUTENTICIDAD</text>
      <text x="347" y="125" textAnchor="middle" fill={TEXT} fontSize="14">¿lo hiciste vos?</text>
      <text x="347" y="160" textAnchor="middle" fill={FAINT} fontSize="11">probar procedencia</text>
      <Pie>ya no alcanza con reconocer: hay que poder probar</Pie>
    </svg>
  );
}

// 16 · El phishing también evolucionó
function Phishing() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Del mail mal escrito al ataque perfecto">
      <g opacity="0.55">
        <rect x="40" y="70" width="180" height="110" rx="10" fill="none" stroke={LINE} strokeWidth="1.8" />
        <text x="130" y="98" textAnchor="middle" fill={FAINT} fontSize="11" fontFamily="monospace">de: banco@ganaste.xyz</text>
        <text x="130" y="120" textAnchor="middle" fill={FAINT} fontSize="11">“Estimado clyente…”</text>
        <line x1="55" y1="140" x2="205" y2="140" stroke={ROSA} strokeWidth="2" />
        <text x="130" y="165" textAnchor="middle" fill={ROSA} fontSize="11">se notaba</text>
      </g>
      <text x="240" y="130" textAnchor="middle" fill={FAINT} fontSize="20">→</text>
      <g>
        <rect x="260" y="70" width="180" height="110" rx="10" fill={PANEL} stroke={AMBER} strokeWidth="2.2">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite" />
        </rect>
        <text x="350" y="98" textAnchor="middle" fill={TEXT} fontSize="11" fontFamily="monospace">🎙️ “Hola má, soy yo…”</text>
        <text x="350" y="122" textAnchor="middle" fill={TEXT} fontSize="11">tu voz. tu tono. tus datos.</text>
        <text x="350" y="165" textAnchor="middle" fill={AMBER} fontSize="11" fontWeight="700">no se nota</text>
      </g>
      <Pie>ingeniería social personalizada con IA: creíble por diseño</Pie>
    </svg>
  );
}

// 17 · Tu imagen puede actuar sin vos
function ImagenAjena() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="La imagen propia usada por terceros">
      <g>
        <Muneco x={110} y={120} color={TEAL} escala={2} />
        <text x="110" y="180" textAnchor="middle" fill={TEXT} fontSize="12">vos, quieto</text>
      </g>
      {[
        { x: 290, y: 75, l: "publicidad" },
        { x: 380, y: 125, l: "video falso" },
        { x: 290, y: 180, l: "cuenta trucha" },
      ].map((c, i) => (
        <g key={c.l}>
          <Muneco x={c.x} y={c.y} color={ROSA} />
          <text x={c.x} y={c.y + 38} textAnchor="middle" fill={ROSA} fontSize="10.5">{c.l}</text>
          <line x1="140" y1="115" x2={c.x - 20} y2={c.y} stroke={LINE} strokeWidth="1.2" strokeDasharray="4 5" />
          <animate attributeName="opacity" values="0.25;1;0.25" dur="4.2s" begin={`${i * 1.4}s`} repeatCount="indefinite" />
        </g>
      ))}
      <Pie>identidad sin presencia ni consentimiento</Pie>
    </svg>
  );
}

// 18 · Entonces, ¿qué protegemos?
function Proteger() {
  const c = [
    { x: 200, y: 105, l: "identidad", col: TEAL },
    { x: 280, y: 105, l: "imagen", col: CYAN },
    { x: 200, y: 165, l: "datos", col: VIOLET },
    { x: 280, y: 165, l: "autenticidad", col: AMBER },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Bienes jurídicos que se mezclan">
      {c.map((k, i) => (
        <g key={k.l}>
          <circle cx={k.x} cy={k.y} r="58" fill={k.col} opacity="0.1" stroke={k.col} strokeWidth="1.8">
            <animate attributeName="opacity" values="0.06;0.18;0.06" dur="4.4s" begin={`${i * 1.1}s`} repeatCount="indefinite" />
          </circle>
          <text x={k.x + (k.x < 240 ? -30 : 30)} y={k.y + (k.y < 140 ? -34 : 44)} textAnchor="middle" fill={k.col} fontSize="12.5" fontWeight="700">
            {k.l}
          </text>
        </g>
      ))}
      <Pie>derechos personalísimos · consentimiento · fraude · prueba</Pie>
    </svg>
  );
}

// 19 · Demostrar menos puede ser mejor
function Credencial() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Revelar solo lo necesario">
      <rect x="60" y="65" width="170" height="120" rx="12" fill={PANEL} stroke={LINE} strokeWidth="1.8" />
      <text x="145" y="90" textAnchor="middle" fill={FAINT} fontSize="10" fontFamily="monospace">DNI COMPLETO</text>
      {["nombre", "domicilio", "fecha nac.", "nro. doc."].map((l, i) => (
        <g key={l}>
          <line x1="80" y1={106 + i * 18} x2="210" y2={106 + i * 18} stroke={LINE} strokeWidth="6" opacity="0.5" />
          <text x="82" y={110 + i * 18} fill={FAINT} fontSize="8">{l}</text>
        </g>
      ))}
      <text x="240" y="130" textAnchor="middle" fill={FAINT} fontSize="20">→</text>
      <g>
        <rect x="270" y="90" width="150" height="70" rx="12" fill={TEAL} opacity="0.1" stroke={TEAL} strokeWidth="2.2">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.8s" repeatCount="indefinite" />
        </rect>
        <text x="345" y="120" textAnchor="middle" fill={TEAL} fontSize="16" fontWeight="700">+18 ✓</text>
        <text x="345" y="142" textAnchor="middle" fill={FAINT} fontSize="10">nada más</text>
      </g>
      <Pie>credenciales verificables: probar sin entregarlo todo</Pie>
    </svg>
  );
}

// 20 · La pregunta ya no es "quién sos"
function Procedencia() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Cadena de procedencia firmada">
      {[
        { x: 90, l: "creado" }, { x: 240, l: "firmado" }, { x: 390, l: "verificado" },
      ].map((p, i) => (
        <g key={p.l}>
          <rect x={p.x - 55} y="90" width="110" height="60" rx="10" fill={PANEL} stroke={i === 1 ? VIOLET : TEAL} strokeWidth="2" />
          <text x={p.x} y="115" textAnchor="middle" fontSize="17">{["📄", "🔏", "✅"][i]}</text>
          <text x={p.x} y="138" textAnchor="middle" fill={TEXT} fontSize="11" fontWeight="600">{p.l}</text>
          {i < 2 && (
            <circle r="4" fill={AMBER}>
              <animateMotion dur="2.4s" begin={`${i * 1.2}s`} repeatCount="indefinite" path={`M${p.x + 55},120 L${p.x + 95},120`} />
            </circle>
          )}
        </g>
      ))}
      <Pie>firma digital · trazabilidad · prueba de procedencia: “esto es auténticamente tuyo”</Pie>
    </svg>
  );
}

// 21 · Las reglas también se digitalizaron
function ReglasCodigo() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Del texto jurídico al código">
      <rect x="55" y="65" width="160" height="120" rx="10" fill="none" stroke={TEAL} strokeWidth="1.8" />
      <text x="135" y="92" textAnchor="middle" fill={TEAL} fontSize="12" fontWeight="700" fontFamily="monospace">ART. 1º</text>
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1="75" y1={108 + i * 17} x2={195 - (i % 2) * 25} y2={108 + i * 17} stroke={LINE} strokeWidth="2" />
      ))}
      <text x="240" y="132" textAnchor="middle" fill={FAINT} fontSize="20">→</text>
      <rect x="265" y="65" width="160" height="120" rx="10" fill={PANEL} stroke={VIOLET} strokeWidth="2" />
      <text x="285" y="98" fill={VIOLET} fontSize="12" fontFamily="monospace">if (condición) {"{"}</text>
      <text x="300" y="120" fill={TEXT} fontSize="12" fontFamily="monospace">
        ejecutar()
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2.4s" repeatCount="indefinite" />
      </text>
      <text x="285" y="142" fill={VIOLET} fontSize="12" fontFamily="monospace">{"}"}</text>
      <Pie>la regla deja de estar solo escrita: empieza a estar programada</Pie>
    </svg>
  );
}

// 22 · Antes la norma decía "no podés"
function NoPodes() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Prohibir versus impedir">
      <g>
        <circle cx="140" cy="110" r="44" fill="none" stroke={ROSA} strokeWidth="3" />
        <line x1="110" y1="80" x2="170" y2="140" stroke={ROSA} strokeWidth="3" />
        <text x="140" y="185" textAnchor="middle" fill={TEXT} fontSize="12">la norma ordena</text>
        <text x="140" y="203" textAnchor="middle" fill={FAINT} fontSize="10.5">…y puede incumplirse</text>
      </g>
      <g>
        <rect x="290" y="70" width="110" height="85" rx="10" fill={PANEL} stroke={LINE} strokeWidth="2" />
        <rect x="315" y="102" width="60" height="24" rx="6" fill={LINE} opacity="0.5" />
        <text x="345" y="118" textAnchor="middle" fill={FAINT} fontSize="9" fontFamily="monospace">ENVIAR</text>
        <text x="345" y="90" textAnchor="middle" fill={AMBER} fontSize="10.5">
          botón deshabilitado
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2.6s" repeatCount="indefinite" />
        </text>
        <text x="345" y="185" textAnchor="middle" fill={TEXT} fontSize="12">la arquitectura impide</text>
        <text x="345" y="203" textAnchor="middle" fill={FAINT} fontSize="10.5">…no hay conducta posible</text>
      </g>
      <Pie>de la conducta ordenada a la conducta condicionada</Pie>
    </svg>
  );
}

// 23 · Cuando el código ejecuta la regla
function Smart() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Smart contract: decisión y cumplimiento sin distancia">
      {[
        { x: 90, l: "condición", e: "📋" }, { x: 240, l: "verificación", e: "⚙️" }, { x: 390, l: "cumplimiento", e: "✅" },
      ].map((p, i) => (
        <g key={p.l}>
          <circle cx={p.x} cy="115" r="36" fill={PANEL} stroke={TEAL} strokeWidth="2" />
          <text x={p.x} y="112" textAnchor="middle" fontSize="17">{p.e}</text>
          <text x={p.x} y="135" textAnchor="middle" fill={TEXT} fontSize="9.5" fontWeight="600">{p.l}</text>
          {i < 2 && (
            <circle r="4.5" fill={AMBER}>
              <animateMotion dur="1.8s" begin={`${i * 0.9}s`} repeatCount="indefinite" path={`M${p.x + 36},115 L${p.x + 114},115`} />
            </circle>
          )}
        </g>
      ))}
      <text x="240" y="190" textAnchor="middle" fill={AMBER} fontSize="12.5" fontWeight="600">
        sin demanda, sin mora, sin ejecución forzada: pasa solo
      </text>
      <Pie>se reduce el espacio entre la decisión y el cumplimiento</Pie>
    </svg>
  );
}

// 24 · ¿Puede programarse la justicia?
function Justicia() {
  const fuera = ["buena fe", "abuso del derecho", "error", "capacidad", "fuerza mayor", "proporcionalidad"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Lo que el código no comprende">
      <rect x="165" y="80" width="150" height="90" rx="12" fill={PANEL} stroke={VIOLET} strokeWidth="2.2" />
      <text x="240" y="115" textAnchor="middle" fill={VIOLET} fontSize="13" fontFamily="monospace">if / then</text>
      <text x="240" y="140" textAnchor="middle" fill={TEXT} fontSize="10.5">ejecuta condiciones</text>
      {fuera.map((f, i) => {
        const izq = i % 2 === 0;
        const y = 55 + Math.floor(i / 2) * 62;
        const x = izq ? 78 : 402;
        return (
          <g key={f}>
            <text x={x} y={y} textAnchor="middle" fill={AMBER} fontSize="12" fontStyle="italic">
              {f}
              <animate attributeName="opacity" values="0.3;1;0.3" dur="5s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
            </text>
            <line x1={izq ? x + 46 : x - 46} y1={y - 4} x2={izq ? 163 : 317} y2={115} stroke={LINE} strokeWidth="1" strokeDasharray="2 4" />
          </g>
        );
      })}
      <Pie>el límite de “code is law”: hay Derecho que no entra en un if</Pie>
    </svg>
  );
}

// 25 · Y si las reglas están distribuidas…
function Distribuidas() {
  const n = [0, 72, 144, 216, 288].map((a) => [240 + 100 * Math.cos(((a - 90) * Math.PI) / 180), 125 + 78 * Math.sin(((a - 90) * Math.PI) / 180)]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="La misma regla replicada en todos los nodos">
      {n.map(([x1, y1], i) =>
        n.map(([x2, y2], j) =>
          j > i ? <line key={`${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE} strokeWidth="1" opacity="0.5" /> : null,
        ),
      )}
      {n.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 26} y={y - 18} width="52" height="36" rx="8" fill={PANEL} stroke={TEAL} strokeWidth="1.8" />
          <text x={x} y={y + 4} textAnchor="middle" fill={TEAL} fontSize="10" fontFamily="monospace">
            regla
            <animate attributeName="opacity" values="0.45;1;0.45" dur="3.5s" begin={`${i * 0.7}s`} repeatCount="indefinite" />
          </text>
        </g>
      ))}
      <Pie>si la regla vive en todos lados… la organización también puede</Pie>
    </svg>
  );
}

// 26 · ¿Quién manda si nadie manda?
function Dao() {
  const n = [0, 60, 120, 180, 240, 300].map((a) => [150 + 80 * Math.cos(((a - 90) * Math.PI) / 180), 120 + 68 * Math.sin(((a - 90) * Math.PI) / 180)]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="DAO: votación con tokens y ejecución automática">
      {n.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill={PANEL} stroke={CYAN} strokeWidth="1.8" />
          <text x={x} y={y + 4} textAnchor="middle" fontSize="10">🪙</text>
          <line x1={x} y1={y} x2="150" y2="120" stroke={LINE} strokeWidth="0.9" opacity="0.5" />
          <circle r="3" fill={AMBER}>
            <animateMotion dur="2.8s" begin={`${i * 0.45}s`} repeatCount="indefinite" path={`M${x},${y} L150,120`} />
          </circle>
        </g>
      ))}
      <text x="150" y="126" textAnchor="middle" fill={TEXT} fontSize="11" fontWeight="700" fontFamily="monospace">VOTACIÓN</text>
      <line x1="230" y1="120" x2="300" y2="120" stroke={LINE} strokeWidth="2" />
      <rect x="300" y="88" width="130" height="64" rx="10" fill={PANEL} stroke={VIOLET} strokeWidth="2" />
      <text x="365" y="114" textAnchor="middle" fill={VIOLET} fontSize="10.5" fontWeight="700" fontFamily="monospace">SMART CONTRACT</text>
      <text x="365" y="134" textAnchor="middle" fill={TEXT} fontSize="10">ejecuta y administra</text>
      <Pie>decisiones y activos sin una autoridad central identificable</Pie>
    </svg>
  );
}

// 27 · Descentralizado no significa democrático
function Ballena() {
  const chicos = [
    [110, 80], [180, 66], [250, 80], [110, 180], [180, 194], [250, 180],
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Concentración de tokens dentro de la red">
      {chicos.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="12" fill={PANEL} stroke={CYAN} strokeWidth="1.6" />
          <text x={x} y={y + 3.5} textAnchor="middle" fontSize="8">🪙</text>
          <text x={x} y={y + 27} textAnchor="middle" fill={FAINT} fontSize="9">1 voto</text>
        </g>
      ))}
      <circle cx="370" cy="128" r="52" fill={VIOLET} opacity="0.14" stroke={VIOLET} strokeWidth="2.6">
        <animate attributeName="opacity" values="0.08;0.25;0.08" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="370" y="122" textAnchor="middle" fontSize="22">🐋</text>
      <text x="370" y="146" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700">10.000 votos</text>
      <Pie>red distribuida, poder concentrado: técnica ≠ política</Pie>
    </svg>
  );
}

// 28 · Si nadie manda, ¿quién responde?
function Responde() {
  const cats = ["¿representante?", "¿domicilio?", "¿tribunal?", "¿patrimonio?", "¿responsable?"];
  const n = [0, 72, 144, 216, 288].map((a) => [240 + 92 * Math.cos(((a - 90) * Math.PI) / 180), 128 + 66 * Math.sin(((a - 90) * Math.PI) / 180)]);
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Categorías jurídicas sin destinatario claro">
      {n.map(([x1, y1], i) =>
        n.map(([x2, y2], j) =>
          j > i ? <line key={`${i}${j}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={LINE} strokeWidth="0.9" opacity="0.4" /> : null,
        ),
      )}
      {n.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="9" fill={PANEL} stroke={TEAL} strokeWidth="1.6" />
      ))}
      {cats.map((c, i) => {
        const [x, y] = n[i];
        const dy = y < 128 ? -22 : 32;
        return (
          <text key={c} x={x} y={y + dy} textAnchor="middle" fill={AMBER} fontSize="12" fontWeight="600">
            {c}
            <animate attributeName="opacity" values="0.3;1;0.3" dur="5s" begin={`${i}s`} repeatCount="indefinite" />
          </text>
        );
      })}
      <Pie>la descentralización incomoda al Derecho — no lo apaga</Pie>
    </svg>
  );
}

// 29 · El abogado no necesita convertirse en programador
function Arquitectura() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Entender la arquitectura para preguntar bien">
      <rect x="60" y="70" width="150" height="110" rx="12" fill={PANEL} stroke={VIOLET} strokeWidth="2" />
      {[0, 1, 2].map((i) => (
        <text key={i} x="80" y={100 + i * 24} fill={VIOLET} fontSize="11" fontFamily="monospace" opacity="0.8">
          {["fn validar() {", "  registro.push(tx)", "}"][i]}
        </text>
      ))}
      <Muneco x={330} y={120} color={TEAL} escala={1.8} />
      <text x="330" y="180" textAnchor="middle" fill={TEXT} fontSize="12">no lo escribe — lo entiende</text>
      <g>
        <path d="M215,110 C250,90 270,90 300,105" fill="none" stroke={TEAL} strokeWidth="2" strokeDasharray="4 5" />
        <text x="258" y="80" textAnchor="middle" fill={TEAL} fontSize="12" fontWeight="600">
          ¿qué hace, exactamente?
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
        </text>
      </g>
      <Pie>comprender lo suficiente para formular la pregunta jurídica correcta</Pie>
    </svg>
  );
}

// Evolución de la confianza en objetos: del sello al bloque.
function Evolucion() {
  const hitos = [
    { e: "🪧", l: "sello" }, { e: "✍️", l: "firma" }, { e: "🪪", l: "DNI" },
    { e: "🏦", l: "home banking" }, { e: "🔳", l: "QR" }, { e: "⛓️", l: "blockchain" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Los objetos de la confianza a través del tiempo">
      <line x1="40" y1="130" x2="440" y2="130" stroke={LINE} strokeWidth="2" />
      <circle r="6" fill={AMBER}>
        <animateMotion dur="7s" repeatCount="indefinite" path="M40,130 L440,130" />
      </circle>
      {hitos.map((h, i) => (
        <g key={h.l}>
          <circle cx={65 + i * 70} cy="130" r="26" fill={PANEL} stroke={i >= 4 ? TEAL : LINE} strokeWidth={i >= 4 ? 2.4 : 1.8}>
            <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="7s" begin={`${i * 1.15}s`} repeatCount="indefinite" />
          </circle>
          <text x={65 + i * 70} y="138" textAnchor="middle" fontSize="17">{h.e}</text>
          <text x={65 + i * 70} y={i % 2 === 0 ? 180 : 90} textAnchor="middle" fill={TEXT} fontSize="10.5">{h.l}</text>
        </g>
      ))}
      <Pie>los objetos cambian; la función es la misma: producir confianza</Pie>
    </svg>
  );
}

// También puedo fabricar una voz.
function Voz() {
  const onda = (y: number) => `M70,${y} q12,-18 24,0 q12,18 24,0 q12,-22 24,0 q12,22 24,0 q12,-14 24,0 q12,14 24,0`;
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Voz real y voz clonada">
      <text x="40" y="95" textAnchor="middle" fontSize="22">🎙️</text>
      <path d={onda(90)} fill="none" stroke={TEAL} strokeWidth="2.4" />
      <text x="300" y="95" fill={TEXT} fontSize="12">tu voz</text>
      <g>
        <text x="40" y="175" textAnchor="middle" fontSize="22">🤖</text>
        <path d={onda(170)} fill="none" stroke={ROSA} strokeWidth="2.4" strokeDasharray="230" strokeDashoffset="230">
          <animate attributeName="stroke-dashoffset" values="230;0;0" keyTimes="0;0.5;1" dur="4s" repeatCount="indefinite" />
        </path>
        <text x="300" y="175" fill={ROSA} fontSize="12">
          la copia
          <animate attributeName="opacity" values="0;0;1;1" keyTimes="0;0.45;0.55;1" dur="4s" repeatCount="indefinite" />
        </text>
      </g>
      <text x="395" y="135" textAnchor="middle" fill={AMBER} fontSize="15" fontWeight="700">
        ¿cuál?
        <animate attributeName="opacity" values="0.3;1;0.3" dur="2.4s" repeatCount="indefinite" />
      </text>
      <Pie>unos segundos de audio alcanzan para clonar un timbre de voz</Pie>
    </svg>
  );
}

// La máquina antes respondía; ahora también hace.
function Maquina() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="De responder a hacer">
      <g>
        <rect x="55" y="75" width="160" height="44" rx="14" fill="none" stroke={CYAN} strokeWidth="1.8" />
        <text x="135" y="102" textAnchor="middle" fill={TEXT} fontSize="12">“¿qué dice la ley?”</text>
        <rect x="85" y="135" width="160" height="44" rx="14" fill={CYAN} opacity="0.1" stroke={CYAN} strokeWidth="1.8" />
        <text x="165" y="162" textAnchor="middle" fill={TEXT} fontSize="12">respuesta 💬</text>
        <text x="150" y="215" textAnchor="middle" fill={FAINT} fontSize="11.5">antes: conversaba</text>
      </g>
      <line x1="255" y1="130" x2="295" y2="130" stroke={LINE} strokeWidth="2" strokeDasharray="4 5" />
      <g>
        <rect x="305" y="95" width="130" height="70" rx="14" fill={PANEL} stroke={VIOLET} strokeWidth="2.2">
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.6s" repeatCount="indefinite" />
        </rect>
        <text x="370" y="125" textAnchor="middle" fontSize="19">🦾</text>
        <text x="370" y="148" textAnchor="middle" fill={VIOLET} fontSize="11" fontWeight="700">hace cosas</text>
        <text x="370" y="215" textAnchor="middle" fill={FAINT} fontSize="11.5">ahora: también actúa</text>
      </g>
      <Pie>el salto de esta clase: de la respuesta a la acción</Pie>
    </svg>
  );
}

// Primero generó: texto, imagen, análisis.
function Genera() {
  const outs = [
    { e: "📄", l: "texto" }, { e: "🖼️", l: "imagen" }, { e: "📊", l: "análisis" },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="La IA generativa produce contenido">
      <circle cx="120" cy="128" r="46" fill={PANEL} stroke={VIOLET} strokeWidth="2.4">
        <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <text x="120" y="122" textAnchor="middle" fontSize="20">✨</text>
      <text x="120" y="146" textAnchor="middle" fill={VIOLET} fontSize="10" fontWeight="700" fontFamily="monospace">GENERA</text>
      {outs.map((o, i) => (
        <g key={o.l}>
          <line x1="166" y1="128" x2="270" y2={62 + i * 66} stroke={LINE} strokeWidth="1.4" />
          <circle r="4" fill={AMBER}>
            <animateMotion dur="2.2s" begin={`${i * 0.7}s`} repeatCount="indefinite" path={`M166,128 L270,${62 + i * 66}`} />
          </circle>
          <rect x="272" y={40 + i * 66} width="150" height="46" rx="10" fill="none" stroke={TEAL} strokeWidth="1.8" />
          <text x="305" y={69 + i * 66} textAnchor="middle" fontSize="16">{o.e}</text>
          <text x="360" y={69 + i * 66} textAnchor="middle" fill={TEXT} fontSize="12">{o.l}</text>
        </g>
      ))}
      <Pie>esto ya lo vieron: la diplomatura empezó acá</Pie>
    </svg>
  );
}

// Después empezó a actuar: el agente encadena tareas.
function Agente() {
  const pasos = ["leer", "buscar", "redactar", "enviar"];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Un agente encadena tareas">
      {pasos.map((p, i) => (
        <g key={p}>
          <rect x={45 + i * 105} y="100" width="85" height="52" rx="12" fill={PANEL} stroke={TEAL} strokeWidth="2">
            <animate attributeName="stroke-opacity" values="0.35;1;0.35" dur="4.8s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
          </rect>
          <text x={87 + i * 105} y="131" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
            {p}
          </text>
          {i < 3 && (
            <circle r="4.5" fill={AMBER}>
              <animateMotion dur="4.8s" begin={`${i * 1.2}s`} repeatCount="indefinite" path={`M${130 + i * 105},126 L${150 + i * 105},126`} keyPoints="0;1;1" keyTimes="0;0.25;1" calcMode="linear" />
            </circle>
          )}
        </g>
      ))}
      <text x="240" y="70" textAnchor="middle" fill={VIOLET} fontSize="13" fontWeight="700" fontFamily="monospace">
        UN SOLO PEDIDO → CUATRO PASOS
      </text>
      <Pie>nadie apretó un botón entre paso y paso</Pie>
    </svg>
  );
}

// Generar no es decidir; decidir no es ejecutar.
function Grados() {
  const niveles = [
    { l: "genera", d: "propone un borrador", h: 60, col: TEAL },
    { l: "decide", d: "elige entre opciones", h: 105, col: AMBER },
    { l: "ejecuta", d: "produce efectos reales", h: 150, col: ROSA },
  ];
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Grados de automatización">
      {niveles.map((n, i) => (
        <g key={n.l}>
          <rect x={80 + i * 120} y={200 - n.h} width="86" rx="10" height={n.h} fill={n.col} opacity="0.16" stroke={n.col} strokeWidth="2">
            <animate attributeName="height" values={`0;${n.h}`} dur="1s" begin={`${i * 0.4}s`} fill="freeze" />
            <animate attributeName="y" values={`200;${200 - n.h}`} dur="1s" begin={`${i * 0.4}s`} fill="freeze" />
          </rect>
          <text x={123 + i * 120} y="220" textAnchor="middle" fill={n.col} fontSize="13" fontWeight="700">{n.l}</text>
          <text x={123 + i * 120} y="236" textAnchor="middle" fill={FAINT} fontSize="9.5">{n.d}</text>
        </g>
      ))}
      <text x="240" y="40" textAnchor="middle" fill={TEXT} fontSize="13" fontWeight="600">
        cada escalón delega más — y compromete más
      </text>
    </svg>
  );
}

// Realidad virtual vs. realidad aumentada.
function VrAr() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Realidad virtual y realidad aumentada">
      {/* VR: el visor te mete en otro mundo */}
      <g>
        <rect x="55" y="52" width="150" height="110" rx="14" fill={VIOLET} opacity="0.1" stroke={VIOLET} strokeWidth="2" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={95 + i * 35} cy={95 + (i % 2) * 22} r="9" fill="none" stroke={VIOLET} strokeWidth="1.6">
            <animate attributeName="r" values="7;11;7" dur="3.5s" begin={`${i * 0.8}s`} repeatCount="indefinite" />
          </circle>
        ))}
        <text x="130" y="150" textAnchor="middle" fill={VIOLET} fontSize="10.5" fontWeight="700" fontFamily="monospace">
          OTRO MUNDO
        </text>
        <rect x="96" y="176" width="68" height="34" rx="12" fill={PANEL} stroke={TEXT} strokeWidth="2.2" />
        <rect x="106" y="186" width="20" height="14" rx="4" fill={VIOLET} opacity="0.7" />
        <rect x="134" y="186" width="20" height="14" rx="4" fill={VIOLET} opacity="0.7" />
        <text x="130" y="232" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
          VR: entrás vos
        </text>
      </g>
      {/* AR: capas de datos sobre el mundo real */}
      <g>
        <rect x="275" y="52" width="150" height="110" rx="14" fill="none" stroke={CYAN} strokeWidth="2" />
        <path d="M290,150 L330,105 L360,130 L395,88 L410,150 Z" fill="none" stroke={FAINT} strokeWidth="1.6" />
        {[
          { x: 330, y: 84, l: "$ 120.000" },
          { x: 392, y: 66, l: "3,2 km" },
        ].map((e, i) => (
          <g key={e.l}>
            <rect x={e.x - 34} y={e.y - 13} width="68" height="20" rx="6" fill={CYAN} opacity="0.15" stroke={CYAN} strokeWidth="1.4" />
            <text x={e.x} y={e.y + 1} textAnchor="middle" fill={CYAN} fontSize="9.5" fontFamily="monospace">
              {e.l}
            </text>
            <animate attributeName="opacity" values="0.3;1;0.3" dur="3.5s" begin={`${i * 1.2}s`} repeatCount="indefinite" />
          </g>
        ))}
        <text x="350" y="150" textAnchor="middle" fill={CYAN} fontSize="10.5" fontWeight="700" fontFamily="monospace">
          MUNDO REAL + CAPAS
        </text>
        <text x="350" y="232" textAnchor="middle" fill={TEXT} fontSize="12" fontWeight="600">
          AR: entra la información
        </text>
        <text x="350" y="196" textAnchor="middle" fontSize="19">🥽</text>
      </g>
      <Pie>ya no sólo miramos pantallas: entramos en ellas — o ellas salen al mundo</Pie>
    </svg>
  );
}

// El avatar: la identidad también habita mundos persistentes.
function Avatar() {
  return (
    <svg viewBox={VB} className="w-full" role="img" aria-label="Persona y avatar en un mundo virtual">
      <Muneco x={110} y={120} color={TEAL} escala={1.8} />
      <text x="110" y="180" textAnchor="middle" fill={TEXT} fontSize="12">vos</text>
      <line x1="150" y1="115" x2="240" y2="115" stroke={LINE} strokeWidth="2" strokeDasharray="5 6" />
      <circle r="4.5" fill={AMBER}>
        <animateMotion dur="2.4s" repeatCount="indefinite" path="M150,115 L240,115" />
      </circle>
      <g>
        <rect x="250" y="42" width="180" height="160" rx="16" fill={VIOLET} opacity="0.08" stroke={VIOLET} strokeWidth="2" />
        <Muneco x={310} y={110} color={VIOLET} escala={1.6} />
        <text x="310" y="162" textAnchor="middle" fill={VIOLET} fontSize="11.5" fontWeight="600">tu avatar</text>
        {[
          { x: 388, y: 78, e: "🏠" },
          { x: 396, y: 122, e: "🖼️" },
          { x: 388, y: 166, e: "🪙" },
        ].map((b, i) => (
          <g key={b.e}>
            <circle cx={b.x} cy={b.y} r="16" fill={PANEL} stroke={CYAN} strokeWidth="1.6">
              <animate attributeName="stroke-opacity" values="0.4;1;0.4" dur="4s" begin={`${i * 1.3}s`} repeatCount="indefinite" />
            </circle>
            <text x={b.x} y={b.y + 5} textAnchor="middle" fontSize="12">{b.e}</text>
          </g>
        ))}
        <text x="340" y="192" textAnchor="middle" fill={FAINT} fontSize="9.5">mundo persistente · bienes · conductas</text>
      </g>
      <Pie>¿de quién es el avatar? ¿y lo que compra? ¿y lo que hace?</Pie>
    </svg>
  );
}

// 30 · El abogado como traductor (tesis de cierre)
function Traductor() {
  const flujos = [
    { y: 60, izq: "arquitectura tecnológica", der: "consecuencias jurídicas" },
    { y: 105, izq: "regla jurídica", der: "requisitos de diseño" },
    { y: 150, izq: "riesgo técnico", der: "decisión institucional" },
    { y: 195, izq: "derechos humanos", der: "condiciones del sistema" },
  ];
  return (
    <svg viewBox="0 0 480 280" className="w-full" role="img" aria-label="El abogado traduce entre normas y sistemas">
      <circle cx="240" cy="128" r="46" fill={PANEL} stroke={TEAL} strokeWidth="2.6">
        <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <text x="240" y="122" textAnchor="middle" fontSize="20">⚖️</text>
      <text x="240" y="146" textAnchor="middle" fill={TEAL} fontSize="9.5" fontWeight="700" fontFamily="monospace">
        TRADUCTOR/A
      </text>
      {flujos.map((f, i) => (
        <g key={f.izq}>
          <text x="100" y={f.y + 4} textAnchor="middle" fill={TEXT} fontSize="11">{f.izq}</text>
          <text x="384" y={f.y + 4} textAnchor="middle" fill={TEXT} fontSize="11">{f.der}</text>
          <line x1="178" y1={f.y} x2="205" y2={110 + i * 12} stroke={LINE} strokeWidth="1.2" strokeDasharray="3 4" />
          <line x1="275" y1={110 + i * 12} x2="302" y2={f.y} stroke={LINE} strokeWidth="1.2" strokeDasharray="3 4" />
          <circle r="3.5" fill={AMBER}>
            <animateMotion
              dur="3.6s"
              begin={`${i * 0.9}s`}
              repeatCount="indefinite"
              path={`M178,${f.y} L205,${110 + i * 12} L275,${110 + i * 12} L302,${f.y}`}
            />
          </circle>
        </g>
      ))}
      <text x="240" y="262" textAnchor="middle" fill={FAINT} fontSize="12">
        el Derecho siempre organizó confianza — cambió la infraestructura
      </text>
    </svg>
  );
}
