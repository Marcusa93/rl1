// Ilustraciones del Congreso · placas 06, 07, 10 y 11.
// La frase que se vuelve interfaz, pedir ≠ construir, el ciclo con el error y
// el expediente en primer plano con el código fuera de foco.

import {
  CG,
  Cinta,
  cm,
  DISPLAY,
  Flecha,
  Hoja,
  Lienzo,
  MANO,
  MANO_B,
  MONO,
  MONO_B,
  onda,
  Pieza,
  punta,
  Resaltado,
  retraso,
  SANS,
  SANS_B,
  Sube,
  suave,
  Traza,
  url,
  usePrefijo,
  vars,
  Barras,
} from "@/components/congreso/ilus-piezas";
import type { PropsIlus } from "@/components/congreso/ilus-1";

// ============================================================================
// PLACA 06 · Ahora podés empezar hablando — una frase cotidiana cuyas partes
// se desprenden y se vuelven componentes: tarjetas, orden, fecha, aviso, botón.
// ============================================================================

const FS6 = 26;
const CW6 = cm(FS6);
const X6 = 70;
const Y6 = [96, 140, 184];
const FRASE = ["Necesito ver los vencimientos", "de mis causas, ordenados por fecha,", "y que me avise tres días antes."];
const col6 = (c: number) => X6 + c * CW6;
/** La tira de papel está apenas torcida. */
const GIRO6 = "rotate(-1.2 400 127)";

interface Fragmento {
  linea: number;
  a: number;
  b: number;
  color: string;
  /** Centro del componente en el que se convierte. */
  hacia: [number, number];
  t: number;
}

const FRAGMENTOS: Record<"causas" | "orden" | "fecha" | "aviso" | "boton", Fragmento> = {
  causas: { linea: 1, a: 3, b: 13, color: CG.azul2, hacia: [300, 418], t: 1.2 },
  orden: { linea: 1, a: 15, b: 34, color: CG.musgo, hacia: [606, 288], t: 1.9 },
  fecha: { linea: 0, a: 17, b: 29, color: CG.lacre, hacia: [654, 347], t: 2.6 },
  aviso: { linea: 2, a: 2, b: 30, color: CG.ocre, hacia: [230, 537], t: 3.3 },
  boton: { linea: 0, a: 0, b: 12, color: CG.tinta, hacia: [641, 537], t: 4.0 },
};

function Desprende({ f }: { f: Fragmento }) {
  const texto = FRASE[f.linea].slice(f.a, f.b);
  const x1 = col6(f.a);
  const x2 = col6(f.b);
  const cx = (x1 + x2) / 2;
  const cy = Y6[f.linea] - 9;
  return (
    <g>
      <Traza d={onda(x1, x2, Y6[f.linea] + 9, 1.4)} color={f.color} ancho={3.4} delay={f.t} dur={0.55} />
      <text
        x={x1}
        y={Y6[f.linea]}
        style={{ ...MONO, ...vars({ "--dx": `${f.hacia[0] - cx}px`, "--dy": `${f.hacia[1] - cy}px` }), ...retraso(f.t + 0.3) }}
        fontSize={FS6}
        fill={f.color}
        className="ilx-vuela"
      >
        {texto}
      </text>
    </g>
  );
}

const CAUSAS_06 = [
  { t: "Pérez c/ Gómez", s: "contestar demanda", f: "14/10/2026" },
  { t: "López s/ sucesión", s: "presentar inventario", f: "17/10/2026" },
  { t: "Ríos c/ Banco Sur", s: "alegar", f: "21/10/2026" },
];

export function P06FraseInterfaz({ className }: PropsIlus) {
  const p = usePrefijo("c06");
  const F = FRAGMENTOS;
  const aparece = (f: Fragmento) => f.t + 0.95;
  return (
    <Lienzo
      w={800}
      h={620}
      p={p}
      className={className}
      label="La frase «Necesito ver los vencimientos de mis causas, ordenados por fecha, y que me avise tres días antes» se desarma: sus partes bajan y se vuelven una lista de causas, un control para ordenar por fecha, campos de fecha, un interruptor para avisar tres días antes y un botón."
    >
      {/* La frase, tal como la diría cualquiera: a máquina, en una tira de papel. */}
      <g transform={GIRO6}>
        <Pieza x={0} y={0} d={0.05} anim="cg-sube">
          <rect x={40} y={38} width={720} height={178} fill={CG.blanco} filter={url(p, "sombra")} />
          <Cinta x={66} y={44} w={70} h={22} rot={-24} />
          <Cinta x={736} y={44} w={70} h={22} rot={22} />
        </Pieza>
        <Sube d={0.3}>
          {FRASE.map((l, i) => (
            <text key={i} x={X6} y={Y6[i]} style={MONO} fontSize={FS6} fill={CG.tinta}>
              {l}
            </text>
          ))}
          <rect x={col6(31) + 4} y={Y6[2] - 22} width={3} height={29} fill={CG.tinta} className="cg-cursor" />
        </Sube>
      </g>

      {/* El panel donde se arma la interfaz. */}
      <Pieza x={0} y={0} d={0.75} anim="cg-sube">
        <rect x={40} y={246} width={720} height={352} rx={18} fill={CG.blanco} filter={url(p, "sombra")} />
      </Pieza>

      {/* Tarjetas de causas ← "mis causas" */}
      <Sube d={aparece(F.causas)} className="cg-cae">
        <text x={68} y={296} style={SANS_B} fontSize={25} fill={CG.tinta}>
          Mis causas
        </text>
        {CAUSAS_06.map((c, i) => {
          const y = 322 + i * 60;
          return (
            <g key={c.t}>
              <rect x={66} y={y} width={668} height={50} rx={10} fill={CG.papel} />
              <rect x={66} y={y} width={6} height={50} rx={3} fill={CG.azul2} />
              <text x={90} y={y + 22} style={SANS_B} fontSize={18} fill={CG.tinta}>
                {c.t}
              </text>
              <text x={90} y={y + 41} style={SANS} fontSize={14.5} fill={CG.sepia}>
                {c.s}
              </text>
            </g>
          );
        })}
      </Sube>
      {/* Campos de fecha ← "vencimientos" */}
      <Sube d={aparece(F.fecha)} className="cg-cae">
        {CAUSAS_06.map((c, i) => {
          const y = 322 + i * 60;
          return (
            <g key={c.f}>
              <rect x={588} y={y + 10} width={132} height={30} rx={7} fill={CG.blanco} stroke={CG.lacre} strokeWidth={1.6} />
              <text x={654} y={y + 31} textAnchor="middle" style={MONO} fontSize={16} fill={CG.lacre}>
                {c.f}
              </text>
            </g>
          );
        })}
      </Sube>
      {/* Orden ← "ordenados por fecha" */}
      <Sube d={aparece(F.orden)} className="cg-cae">
        <rect x={488} y={268} width={246} height={38} rx={19} fill={CG.blanco} stroke={CG.musgo} strokeWidth={2} />
        <text x={611} y={293} textAnchor="middle" style={SANS_B} fontSize={17} fill={CG.musgo}>
          ordenar por fecha ↓
        </text>
      </Sube>
      {/* Aviso ← "que me avise tres días antes" */}
      <Sube d={aparece(F.aviso)} className="cg-cae">
        <rect x={68} y={521} width={56} height={32} rx={16} fill={CG.ocre} />
        <circle cx={108} cy={537} r={12} fill={CG.blanco} />
        <text x={138} y={544} style={SANS} fontSize={19} fill={CG.tinta}>
          avisarme 3 días antes
        </text>
      </Sube>
      {/* Botón ← "Necesito ver" */}
      <Sube d={aparece(F.boton)} className="cg-cae">
        <rect x={548} y={514} width={186} height={46} rx={12} fill={CG.tinta} />
        <text x={641} y={543} textAnchor="middle" style={SANS_B} fontSize={18} fill={CG.blanco}>
          Ver vencimientos
        </text>
      </Sube>

      {/* Cada parte de la frase se marca y baja. */}
      <g transform={GIRO6}>
        {Object.values(F).map((f) => (
          <Desprende key={`${f.linea}-${f.a}`} f={f} />
        ))}
      </g>
    </Lienzo>
  );
}

// ============================================================================
// PLACA 07 · Pedir ≠ construir — a la izquierda una conversación que termina;
// a la derecha la misma necesidad convertida en una herramienta que queda.
// ============================================================================

const RESPUESTA = ["14/10  Pérez c/ Gómez — contestar", "17/10  López s/ sucesión — inventario", "21/10  Ríos c/ Banco Sur — alegar"];

const FILAS_07 = [
  { c: "Pérez c/ Gómez", t: "contestar demanda", v: "14/10" },
  { c: "López s/ sucesión", t: "presentar inventario", v: "17/10" },
  { c: "Ríos c/ Banco Sur", t: "alegar", v: "21/10" },
  { c: "Díaz c/ Mutual", t: "expresar agravios", v: "28/10" },
];

export function P07PedirConstruir({ className }: PropsIlus) {
  const p = usePrefijo("c07");
  const az = CG.azul2;
  const fila = (i: number) => 150 + i * 36;
  return (
    <Lienzo
      w={1200}
      h={390}
      p={p}
      className={className}
      label="Pantalla dividida. A la izquierda, una conversación: una pregunta, una respuesta con tres vencimientos y el fin de la respuesta; anotado: «y mañana… ¿otra vez?». A la derecha, la misma necesidad hecha herramienta: una ventana de vencimientos con campos, varias filas y anotaciones a mano: otro usuario, mañana sigue ahí, otro caso."
    >
      {/* --- Pedir: la conversación --- */}
      <Pieza x={0} y={0} d={0.05} anim="cg-sube">
        <rect x={20} y={16} width={536} height={358} rx={16} fill={CG.blanco} filter={url(p, "sombra-chica")} />
        <text x={44} y={46} style={SANS} fontSize={14} letterSpacing={0.5} fill={CG.gris}>
          Conversación
        </text>
        <line x1={20} x2={556} y1={60} y2={60} stroke={CG.niebla} />
      </Pieza>
      <Sube d={0.35}>
        <rect x={204} y={74} width={334} height={42} rx={20} fill={CG.papel2} />
        <text x={222} y={101} style={SANS} fontSize={17} fill={CG.tinta}>
          ¿Qué vencimientos tengo esta semana?
        </text>
      </Sube>
      <Sube d={0.75}>
        <text x={44} y={150} style={SANS} fontSize={16.5} fill={CG.tinta}>
          Según lo que me pasaste:
        </text>
        {RESPUESTA.map((l, i) => (
          <text key={l} x={44} y={180 + i * 26} style={MONO} fontSize={15} fill={CG.tinta} xmlSpace="preserve">
            {l}
          </text>
        ))}
      </Sube>
      <Sube d={1.15}>
        <line x1={44} x2={532} y1={262} y2={262} stroke={CG.niebla} strokeWidth={1.2} />
        <rect x={196} y={250} width={184} height={24} fill={CG.blanco} />
        <text x={288} y={267} textAnchor="middle" style={MONO} fontSize={13} letterSpacing={1.2} fill={CG.gris}>
          fin de la respuesta
        </text>
        <rect x={44} y={318} width={488} height={38} rx={19} fill={CG.papel} fillOpacity={0.5} stroke={CG.niebla} />
        <text x={66} y={342} style={SANS} fontSize={15} fill={CG.gris}>
          Escribí un mensaje…
        </text>
      </Sube>
      <Sube d={2.3}>
        <g transform="translate(262 304) rotate(-2)">
          <text x={0} y={0} style={MANO_B} fontSize={26} fill={CG.lacre}>
            y mañana… ¿otra vez?
          </text>
        </g>
      </Sube>

      {/* --- ≠ --- */}
      <Sube d={0.9}>
        <line x1={596} x2={596} y1={24} y2={366} stroke={CG.sepia} strokeOpacity={0.45} strokeWidth={1.4} strokeDasharray="5 7" />
        <circle cx={596} cy={195} r={32} fill={CG.papel} stroke={CG.sepia} strokeWidth={2} />
        <text x={596} y={210} textAnchor="middle" style={DISPLAY} fontSize={44} fill={CG.tinta}>
          ≠
        </text>
      </Sube>

      {/* --- Construir: la herramienta --- */}
      <Pieza x={0} y={0} d={0.3} anim="cg-sube">
        <rect x={636} y={16} width={424} height={358} rx={14} fill={CG.blanco} filter={url(p, "sombra")} />
        <path d="M636 60 V30 Q636 16 650 16 H1046 Q1060 16 1060 30 V60 Z" fill={CG.papel2} />
        <text x={656} y={45} style={SANS_B} fontSize={18} fill={CG.tinta}>
          Vencimientos
        </text>
        <circle cx={1004} cy={38} r={14} fill={az} />
        <text x={1004} y={42.5} textAnchor="middle" style={SANS_B} fontSize={11.5} fill={CG.blanco}>
          MR
        </text>
        <circle cx={1034} cy={38} r={14} fill={CG.musgo} stroke={CG.papel2} strokeWidth={2} />
        <text x={1034} y={42.5} textAnchor="middle" style={SANS_B} fontSize={11.5} fill={CG.blanco}>
          LG
        </text>
        {/* formulario */}
        <rect x={656} y={74} width={188} height={36} rx={8} fill={CG.blanco} stroke={CG.niebla} strokeWidth={1.4} />
        <text x={668} y={97} style={SANS} fontSize={14} fill={CG.gris}>
          Causa
        </text>
        <rect x={852} y={74} width={104} height={36} rx={8} fill={CG.blanco} stroke={CG.niebla} strokeWidth={1.4} />
        <text x={864} y={97} style={MONO} fontSize={13} fill={CG.gris}>
          dd/mm
        </text>
        <rect x={964} y={74} width={80} height={36} rx={8} fill={az} />
        <text x={1004} y={97} textAnchor="middle" style={SANS_B} fontSize={14} fill={CG.blanco}>
          Agregar
        </text>
        {/* tabla */}
        {["CAUSA", "TRÁMITE"].map((t, i) => (
          <text key={t} x={i ? 806 : 656} y={138} style={MONO} fontSize={11.5} letterSpacing={1.4} fill={CG.gris}>
            {t}
          </text>
        ))}
        <text x={1044} y={138} textAnchor="end" style={MONO} fontSize={11.5} letterSpacing={1.4} fill={CG.gris}>
          VENCE
        </text>
        <line x1={652} x2={1044} y1={146} y2={146} stroke={CG.niebla} strokeWidth={1.2} />
      </Pieza>
      {FILAS_07.map((f, i) => (
        <Sube key={f.c} d={i < 3 ? 0.7 + i * 0.12 : 1.6}>
          {i === 3 && <rect x={646} y={fila(i) + 2} width={404} height={34} rx={6} fill={CG.ocre} opacity={0.2} />}
          <text x={656} y={fila(i) + 24} style={SANS_B} fontSize={15} fill={CG.tinta}>
            {f.c}
          </text>
          <text x={806} y={fila(i) + 24} style={SANS} fontSize={14} fill={CG.sepia}>
            {f.t}
          </text>
          <text x={1044} y={fila(i) + 24} textAnchor="end" style={MONO} fontSize={14} fill={CG.tinta}>
            {f.v}
          </text>
          <line x1={652} x2={1044} y1={fila(i) + 36} y2={fila(i) + 36} stroke={CG.niebla} />
        </Sube>
      ))}
      <Sube d={1.1}>
        <text x={656} y={352} style={MONO} fontSize={12.5} fill={CG.gris}>
          4 causas · guardado
        </text>
        <text x={1044} y={352} textAnchor="end" style={MONO} fontSize={12.5} fill={CG.gris}>
          abierta hoy 09:12
        </text>
      </Sube>

      {/* Anotaciones: la herramienta queda. */}
      <Sube d={2.0}>
        <text x={1080} y={40} style={MANO_B} fontSize={24} fill={az}>
          otro
        </text>
        <text x={1080} y={63} style={MANO_B} fontSize={24} fill={az}>
          usuario
        </text>
      </Sube>
      <Flecha x1={1076} y1={36} x2={1052} y2={40} curva={-4} color={az} ancho={2.2} delay={2.1} cab={8} />
      <Traza d="M1050 154 q 10 0 10 22 q 0 22 8 26 q -8 4 -8 26 q 0 22 -10 22" color={az} ancho={2.2} delay={2.35} dur={0.6} />
      <Sube d={2.5}>
        <text x={1074} y={210} style={MANO_B} fontSize={26} fill={az}>
          mañana
        </text>
        <text x={1074} y={234} style={MANO} fontSize={20} fill={az}>
          sigue ahí
        </text>
      </Sube>
      <Sube d={2.8}>
        <text x={1076} y={290} style={MANO_B} fontSize={24} fill={az}>
          otro caso
        </text>
      </Sube>
      <Flecha x1={1074} y1={280} x2={1052} y2={272} curva={4} color={az} ancho={2.2} delay={2.9} cab={8} />
    </Lienzo>
  );
}

// ============================================================================
// PLACA 10 · Probar también es programar — el ciclo, a mano: idea, prototipo,
// error, corrección, prueba… y el "FIN" tachado: siempre hay otra vuelta.
// ============================================================================

const CX10 = 400;
const CY10 = 312;
const RX10 = 262;
const RY10 = 212;
const rad = (g: number) => (g * Math.PI) / 180;
const enElipse = (g: number): [number, number] => [CX10 + RX10 * Math.cos(rad(g)), CY10 + RY10 * Math.sin(rad(g))];

/** Arco a mano sobre la elipse (en grados, sentido horario) con su punta. */
function arco(ga: number, gb: number, tiembla = 3) {
  const n = 7;
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const g = ga + ((gb - ga) * i) / n;
    const [x, y] = enElipse(g);
    const k = i === 0 || i === n ? 0 : Math.sin(i * 1.7) * tiembla;
    pts.push([x + k, y - k * 0.6]);
  }
  const t = rad(gb);
  const ang = Math.atan2(RY10 * Math.cos(t), -RX10 * Math.sin(t));
  const [ex, ey] = pts[n];
  return { d: suave(pts), cabeza: punta(ex, ey, ang, 15) };
}

const NODOS_10: { t: string; g: number; color: string; d: number }[] = [
  { t: "IDEA", g: -90, color: CG.tinta, d: 0.05 },
  { t: "PROTOTIPO", g: -18, color: CG.tinta, d: 0.55 },
  { t: "ERROR", g: 54, color: CG.lacre, d: 1.05 },
  { t: "CORRECCIÓN", g: 126, color: CG.tinta, d: 1.55 },
  { t: "PRUEBA", g: 198, color: CG.tinta, d: 2.05 },
];

const ARCOS_10: { a: number; b: number; d: number; nota?: { t: string; x: number; y: number; color?: string } }[] = [
  { a: -70, b: -34, d: 0.3, nota: { t: "lo describo", x: 520, y: 196 } },
  { a: -2, b: 38, d: 0.8, nota: { t: "lo uso", x: 590, y: 372 } },
  { a: 76, b: 104, d: 1.3, nota: { t: "“no era eso”", x: 400, y: 562, color: CG.lacre } },
  { a: 142, b: 182, d: 1.8, nota: { t: "se lo explico", x: 262, y: 390 } },
  { a: 214, b: 252, d: 2.75 },
];

export function P10Ciclo({ className }: PropsIlus) {
  const p = usePrefijo("c10");
  const versiones = "v1  v2  v3  v4";
  const vx = CX10 - (versiones.length * cm(20)) / 2;
  return (
    <Lienzo
      w={800}
      h={620}
      p={p}
      className={className}
      label="Un ciclo dibujado a mano: idea, prototipo, error, corrección, prueba, y de nuevo idea. Anotado: lo describo, lo uso, «no era eso», se lo explico. Después de prueba alguien escribió FIN y lo tachó: otra vuelta. En el centro, versiones v1, v2 y v3 tachadas y v4."
    >
      {NODOS_10.map((n) => {
        const [x, y] = enElipse(n.g);
        return (
          <Sube key={n.t} d={n.d}>
            <text x={x} y={y + 16} textAnchor="middle" style={MANO_B} fontSize={48} fill={n.color}>
              {n.t}
            </text>
          </Sube>
        );
      })}
      {ARCOS_10.map((a, i) => {
        const r = arco(a.a, a.b);
        return (
          <g key={i}>
            <Traza d={r.d} color={CG.sepia} ancho={2.8} delay={a.d} dur={0.6} />
            <Traza d={r.cabeza} color={CG.sepia} ancho={2.8} delay={a.d + 0.5} dur={0.25} />
            {a.nota && (
              <Sube d={a.d + 0.45}>
                <text x={a.nota.x} y={a.nota.y} textAnchor="middle" style={MANO} fontSize={24} fill={a.nota.color ?? CG.azul2}>
                  {a.nota.t}
                </text>
              </Sube>
            )}
          </g>
        );
      })}
      {/* ERROR, subrayado en rojo */}
      <Traza d={onda(500, 610, 510, 2)} color={CG.lacre} ancho={2.6} delay={1.35} dur={0.5} />

      {/* "FIN", escrito y tachado: la prueba no termina el ciclo. */}
      <Sube d={2.35}>
        <text x={104} y={186} textAnchor="middle" style={MANO_B} fontSize={38} fill={CG.tinta}>
          FIN
        </text>
      </Sube>
      <Traza d="M72 174 C 90 170, 118 168, 138 164" color={CG.lacre} ancho={3.2} delay={2.6} dur={0.3} />
      <Traza d="M74 182 C 94 179, 118 176, 140 173" color={CG.lacre} ancho={3.2} delay={2.72} dur={0.3} />
      <Sube d={3.0}>
        <g transform="translate(206 104) rotate(-14)">
          <text x={0} y={0} textAnchor="middle" style={MANO_B} fontSize={27} fill={CG.lacre}>
            otra vuelta
          </text>
        </g>
      </Sube>

      {/* En el centro, las versiones. */}
      <Sube d={1.4}>
        <text x={CX10} y={CY10 - 26} textAnchor="middle" style={MANO} fontSize={22} fill={CG.gris}>
          versiones
        </text>
        <Resaltado x={vx + 12 * cm(20) - 4} y={CY10 + 4} w={2 * cm(20) + 8} h={24} delay={2.9} />
        <text x={vx} y={CY10 + 22} style={MONO} fontSize={20} fill={CG.tinta} xmlSpace="preserve">
          {versiones}
        </text>
      </Sube>
      {[0, 4, 8].map((c, i) => (
        <Traza
          key={c}
          d={`M${vx + c * cm(20) - 3} ${CY10 + 16} L${vx + (c + 2) * cm(20) + 3} ${CY10 + 13}`}
          color={CG.gris}
          ancho={2.2}
          delay={1.9 + i * 0.3}
          dur={0.25}
        />
      ))}
    </Lienzo>
  );
}

// ============================================================================
// PLACA 11 · El código no era el problema — en primer plano el trabajo jurídico
// (expediente, resolución, fechas, personas, hechos); al fondo, desenfocado, código.
// El centro queda quieto: ahí se apoyan las tarjetas de la vitrina.
// ============================================================================

const CODIGO_11 = [
  'import { ordenarPorFecha, diasHabiles } from "./plazos";',
  "",
  "export function LineaDeTiempo({ expediente, plazos, hechos }) {",
  "  const actuaciones = expediente.fojas",
  "    .filter((a) => a.fecha <= hoy)",
  "    .sort((a, b) => a.fecha - b.fecha);",
  "  const pendientes = plazos.filter((p) => !p.cumplido);",
  "  for (const hecho of hechos) {",
  '    if (hecho.pruebas.length === 0) marcar(hecho, "sin prueba");',
  "  }",
  "  return <Linea items={actuaciones} alertas={pendientes} />;",
];

function Expediente({ p }: { p: string }) {
  return (
    <g>
      {[18, 13, 9, 5].map((o, i) => (
        <rect key={o} x={-150 + o} y={-190 + o * 0.9} width={300} height={380} fill={i % 2 ? CG.blanco : CG.papel2} stroke={CG.niebla} strokeWidth={0.8} />
      ))}
      <rect x={-150} y={-190} width={300} height={380} fill={CG.carton} filter={url(p, "sombra")} />
      <rect x={-140} y={-180} width={280} height={360} fill="none" stroke={CG.sepia} strokeOpacity={0.3} />
      <circle cx={-128} cy={-70} r={4.5} fill="#b5a787" />
      <circle cx={-128} cy={70} r={4.5} fill="#b5a787" />
      <path d="M-128 -70 C -170 -60, -172 60, -128 70 M-128 -70 C -110 -40, -112 40, -128 70" fill="none" stroke="#9c8a66" strokeWidth={2.4} />
      <text x={0} y={-140} textAnchor="middle" style={MONO_B} fontSize={13} letterSpacing={2.4} fill={CG.sepia}>
        PODER JUDICIAL DE TUCUMÁN
      </text>
      <line x1={-110} x2={110} y1={-126} y2={-126} stroke={CG.sepia} strokeOpacity={0.5} />
      <text x={0} y={-80} textAnchor="middle" style={DISPLAY} fontSize={40} fill={CG.tinta}>
        1234/25
      </text>
      <text x={-104} y={-34} style={MONO_B} fontSize={17} fill={CG.tinta}>
        PÉREZ, Juan
      </text>
      <text x={-104} y={-10} style={MONO_B} fontSize={17} fill={CG.tinta}>
        c/ GÓMEZ, Ana
      </text>
      <text x={-104} y={14} style={MONO} fontSize={15} fill={CG.tinta}>
        s/ daños y perjuicios
      </text>
      <text x={-104} y={62} style={MONO} fontSize={13} fill={CG.sepia}>
        CUERPO I · fs. 1 a 200
      </text>
    </g>
  );
}

function Resolucion({ p }: { p: string }) {
  return (
    <g>
      <Hoja p={p} w={214} h={292} />
      <g transform="translate(18 0)">
        <text x={0} y={30} style={MONO} fontSize={11.5} fill={CG.sepia}>
          Tucumán, 14 de marzo de 2025.
        </text>
        <text x={0} y={56} style={MONO_B} fontSize={12.5} fill={CG.tinta}>
          Y VISTOS:
        </text>
        <Barras x={0} y={66} anchos={[176, 160, 170, 96]} alto={3.5} sep={11} />
        <text x={0} y={132} style={DISPLAY} fontSize={22} fill={CG.tinta}>
          RESUELVO:
        </text>
        <text x={0} y={158} style={MONO} fontSize={13.5} fill={CG.tinta}>
          I) Hacer lugar a la
        </text>
        <text x={0} y={177} style={MONO} fontSize={13.5} fill={CG.tinta}>
          demanda…
        </text>
        <text x={0} y={200} style={MONO} fontSize={13.5} fill={CG.tinta}>
          II) Costas al vencido.
        </text>
        <text x={0} y={223} style={MONO} fontSize={13.5} fill={CG.tinta}>
          III) Hágase saber.
        </text>
        <path d="M84 262 c 10 -20 18 -20 16 -4 c 8 -14 18 -12 20 -2 c 6 -8 14 -8 30 -6" fill="none" stroke={CG.azul2} strokeWidth={1.8} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Hoja14Marzo({ p }: { p: string }) {
  return (
    <g>
      <Hoja p={p} w={140} h={156} />
      <rect width={140} height={38} fill={CG.lacre} />
      <text x={70} y={26} textAnchor="middle" style={DISPLAY} fontSize={19} letterSpacing={1.5} fill={CG.blanco}>
        MARZO
      </text>
      <text x={70} y={112} textAnchor="middle" style={DISPLAY} fontSize={70} fill={CG.tinta}>
        14
      </text>
      <text x={70} y={140} textAnchor="middle" style={MONO} fontSize={13} fill={CG.gris}>
        viernes
      </text>
    </g>
  );
}

function Ficha({ rol, nombre }: { rol: string; nombre: string }) {
  return (
    <g>
      <rect width={250} height={46} fill={CG.blanco} stroke={CG.niebla} strokeWidth={0.8} />
      <line x1={0} x2={250} y1={12} y2={12} stroke={CG.lacre} strokeOpacity={0.4} />
      <text x={12} y={32} style={MONO_B} fontSize={11.5} letterSpacing={1.2} fill={CG.gris}>
        {rol}
      </text>
      <text x={238} y={34} textAnchor="end" style={DISPLAY} fontSize={19} fill={CG.tinta}>
        {nombre}
      </text>
    </g>
  );
}

function Hechos({ p }: { p: string }) {
  const hechos = ["1. El 14/03 no pagó.", "2. Intimación: 20/03.", "3. Pagó el 22/03."];
  return (
    <g>
      <Hoja p={p} w={236} h={300} />
      <text x={18} y={34} style={MONO_B} fontSize={12} letterSpacing={1.2} fill={CG.tinta}>
        HECHOS CONTROVERTIDOS
      </text>
      <line x1={18} x2={218} y1={44} y2={44} stroke={CG.tinta} strokeWidth={0.8} />
      <Resaltado x={16} y={92} w={196} h={22} delay={1.7} />
      {hechos.map((h, i) => (
        <text key={h} x={18} y={76 + i * 32} style={MONO} fontSize={15} fill={CG.tinta}>
          {h}
        </text>
      ))}
      <text x={196} y={146} style={MANO_B} fontSize={26} fill={CG.lacre}>
        ?
      </text>
      <Barras x={18} y={172} anchos={[196, 180, 150, 0, 190, 120]} alto={3.5} sep={12} />
    </g>
  );
}

export function P11ExpedienteCodigo({ className }: PropsIlus) {
  const p = usePrefijo("c11");
  const rotulo = (t: string, x: number, y: number, rot: number, d: number) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <g className="cg-sube" style={retraso(d)}>
        <text x={0} y={0} textAnchor="middle" style={MANO_B} fontSize={30} fill={CG.lacre}>
          {t}
        </text>
      </g>
    </g>
  );
  return (
    <Lienzo
      w={1800}
      h={400}
      p={p}
      recorta
      className={className}
      label="En primer plano, el trabajo jurídico: un expediente, una resolución, una fecha, las personas del caso y los hechos controvertidos. Al fondo, fuera de foco, líneas de código."
    >
      {/* Al fondo: código desenfocado. */}
      <g filter={url(p, "desenfoque")} opacity={0.24} className="ilx-aparece" style={retraso(0.05)}>
        {CODIGO_11.map((l, i) => (
          <text key={i} x={430} y={40 + i * 34} style={MONO} fontSize={24} fill={CG.sepia} xmlSpace="preserve">
            {l}
          </text>
        ))}
      </g>

      {/* Izquierda: expediente y resolución. */}
      <Pieza x={150} y={215} rot={-7} d={0.25}>
        <Expediente p={p} />
      </Pieza>
      <Pieza x={278} y={96} rot={5} d={0.5}>
        <Resolucion p={p} />
      </Pieza>

      {/* Derecha: hechos, fechas, personas. */}
      <Pieza x={1628} y={4} rot={7} d={0.35}>
        <Hechos p={p} />
      </Pieza>
      <Pieza x={1376} y={44} rot={-6} d={0.55}>
        <Hoja14Marzo p={p} />
      </Pieza>
      {[
        ["ACTOR", "Juan Pérez"],
        ["DEMANDADA", "Ana Gómez"],
        ["TESTIGO", "Marta Sosa"],
      ].map(([rol, nombre], i) => (
        <Pieza key={rol} x={1450 + i * 8} y={232 + i * 52} rot={2 - i * 1.5} d={0.75 + i * 0.12}>
          <Ficha rol={rol} nombre={nombre} />
        </Pieza>
      ))}

      {rotulo("decisiones", 420, 58, -4, 1.4)}
      {rotulo("fechas", 1340, 236, -3, 1.55)}
      {rotulo("personas", 1392, 388, -2, 1.7)}
      {rotulo("hechos", 1566, 40, 3, 1.85)}
    </Lienzo>
  );
}
