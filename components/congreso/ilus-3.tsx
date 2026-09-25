// Ilustraciones del Congreso · placas 13, 14 y 15.
// La app atravesada por capas de papel vegetal, el mismo objeto en dos grados
// de madurez y, al final, una persona frente a un espacio que empieza a ser interfaz.

import {
  CG,
  Cinta,
  Flecha,
  Lienzo,
  MANO,
  MANO_B,
  MONO,
  onda,
  Pieza,
  rectMano,
  retraso,
  SANS,
  SANS_B,
  Sello,
  Sube,
  Traza,
  url,
  usePrefijo,
} from "@/components/congreso/ilus-piezas";
import { BASIC_P01, MonitorCRT, type PropsIlus } from "@/components/congreso/ilus-1";

// ============================================================================
// PLACA 13 · Puedo ≠ debo — la app construida en la demo, atravesada por hojas
// de papel vegetal: datos, privacidad, seguridad, control, responsabilidad,
// decisión humana. Sin candados ni escudos: capas que se apoyan encima.
// ============================================================================

const ACTUACIONES = [
  { f: "03/03/2025", t: "Demanda", q: "actor", c: CG.azul2 },
  { f: "14/03/2025", t: "Contestación", q: "demandado", c: CG.lacre },
  { f: "14/03/2025", t: "Ofrecimiento de prueba", q: "demandado", c: CG.lacre },
  { f: "02/05/2025", t: "Apertura a prueba ★", q: "tribunal", c: CG.musgo },
  { f: "20/06/2025", t: "Pericia contable", q: "perito", c: CG.sepia },
  { f: "11/08/2025", t: "Alegato", q: "actor", c: CG.azul2 },
];

const CAPAS = ["datos", "privacidad", "seguridad", "control", "responsabilidad", "decisión humana"];

function AppLineaDeTiempo({ p }: { p: string }) {
  return (
    <g>
      <rect x={190} y={36} width={420} height={548} rx={14} fill={CG.blanco} filter={url(p, "sombra")} />
      <path d="M190 82 V50 Q190 36 204 36 H596 Q610 36 610 50 V82 Z" fill={CG.papel2} />
      <text x={210} y={66} style={SANS_B} fontSize={17} fill={CG.tinta}>
        Línea de tiempo del expediente
      </text>
      <text x={592} y={65} textAnchor="end" style={MONO} fontSize={13} fill={CG.gris}>
        v4
      </text>
      <rect x={206} y={96} width={388} height={38} rx={8} fill={CG.ocre} opacity={0.2} />
      <text x={220} y={120} style={SANS} fontSize={15} fill={CG.tinta}>
        2 plazos pendientes · vence 14/10
      </text>
      <line x1={236} x2={236} y1={160} y2={560} stroke={CG.niebla} strokeWidth={2} />
      {ACTUACIONES.map((a, i) => {
        const y = 178 + i * 66;
        return (
          <g key={`${a.f}-${a.t}`}>
            <circle cx={236} cy={y} r={7} fill={a.c} stroke={CG.blanco} strokeWidth={2} />
            <text x={256} y={y - 4} style={MONO} fontSize={13.5} fill={CG.sepia}>
              {a.f}
            </text>
            <text x={256} y={y + 17} style={SANS_B} fontSize={16} fill={CG.tinta}>
              {a.t}
            </text>
            <text x={594} y={y + 17} textAnchor="end" style={SANS} fontSize={13.5} fill={a.c}>
              {a.q}
            </text>
          </g>
        );
      })}
    </g>
  );
}

export function P13Capas({ className }: PropsIlus) {
  const p = usePrefijo("c13");
  const ys = [104, 190, 276, 362, 448, 534];
  const rots = [-1.4, 1, -0.8, 1.3, -1.1, 0.9];
  // Cada hoja de papel vegetal es un poco distinta: dónde empieza, dónde termina, cuánto mide.
  const x0s = [18, 34, 10, 28, 16, 30];
  const x1s = [778, 790, 770, 786, 774, 792];
  const hs = [52, 48, 56, 50, 54, 52];
  return (
    <Lienzo
      w={800}
      h={620}
      p={p}
      className={className}
      label="La aplicación construida en la demo, una línea de tiempo del expediente, atravesada por seis hojas de papel vegetal escritas a mano: datos, privacidad, seguridad, control, responsabilidad y decisión humana."
    >
      <Pieza x={0} y={0} d={0.05} anim="cg-sube">
        <AppLineaDeTiempo p={p} />
      </Pieza>
      {CAPAS.map((c, i) => {
        const izq = i % 2 === 0;
        const ultima = i === CAPAS.length - 1;
        const d = 0.7 + i * 0.26;
        return (
          <g key={c} transform={`rotate(${rots[i]} 400 ${ys[i]})`}>
            <g className={izq ? "ilx-izq" : "ilx-der"} style={retraso(d)}>
              <rect x={x0s[i]} y={ys[i] - hs[i] / 2} width={x1s[i] - x0s[i]} height={hs[i]} fill={CG.blanco} fillOpacity={0.66} filter={url(p, "sombra-chica")} />
              <line x1={x0s[i]} x2={x1s[i]} y1={ys[i] - hs[i] / 2} y2={ys[i] - hs[i] / 2} stroke={CG.niebla} strokeWidth={1} />
              <line x1={x0s[i]} x2={x1s[i]} y1={ys[i] + hs[i] / 2} y2={ys[i] + hs[i] / 2} stroke={CG.niebla} strokeWidth={1} />
              {/* cruz de registro, del lado opuesto al rótulo */}
              <path
                d={`M${izq ? x1s[i] - 22 : x0s[i] + 22} ${ys[i] - 8} v16 M${izq ? x1s[i] - 30 : x0s[i] + 14} ${ys[i]} h16`}
                stroke={CG.gris}
                strokeWidth={1.2}
                opacity={0.7}
              />
            </g>
            <g className="cg-sube" style={retraso(d + 0.35)}>
              <text
                x={izq ? x0s[i] + 16 : x1s[i] - 16}
                y={ys[i] + 10}
                textAnchor={izq ? "start" : "end"}
                style={MANO_B}
                fontSize={ultima ? 30 : 28}
                fill={ultima ? CG.lacre : CG.sepia}
              >
                {c}
              </text>
            </g>
          </g>
        );
      })}
    </Lienzo>
  );
}

// ============================================================================
// PLACA 14 · Prototipar no es implementar — el mismo objeto en dos grados de
// madurez: a la izquierda un boceto en lápiz sobre papel cuadriculado; a la
// derecha el sistema consolidado. Entre los dos, "madurez" y una escalera que
// se va entintando con los pasos (los contextos de uso que Marco revela).
// ============================================================================

const FILAS_14 = [
  { c: "Pérez c/ Gómez", t: "contestar demanda", v: "14/10/26" },
  { c: "López s/ sucesión", t: "inventario", v: "17/10/26" },
  { c: "Ríos c/ Banco Sur", t: "alegar", v: "21/10/26" },
];

function Boceto({ p, paso }: { p: string; paso: number }) {
  const gris = "#8d8577";
  return (
    <g>
      <rect x={-235} y={-165} width={470} height={330} fill={CG.blanco} filter={url(p, "sombra")} />
      <rect x={-235} y={-165} width={470} height={330} fill={url(p, "cuadricula")} />
      <g filter={url(p, "lapiz")} fill="none" stroke={gris} strokeWidth={2.2} strokeLinecap="round">
        <path d={rectMano(-200, -128, 400, 258, 6)} />
        <path d="M-204 -92 L 198 -94" />
        {[-78, -24, 30].map((y) => (
          <g key={y}>
            <path d={rectMano(-184, y, 368, 44, 4)} />
            <path d={onda(-168, -30, y + 17, 2.4, 14)} strokeWidth={1.8} />
            <path d={onda(-168, -92, y + 32, 2, 12)} strokeWidth={1.6} />
            <path d={rectMano(76, y + 10, 92, 24, 3)} strokeWidth={1.8} />
          </g>
        ))}
        <path d={rectMano(64, 88, 120, 32, 4)} />
      </g>
      <text x={-184} y={-102} style={MANO_B} fontSize={27} fill={gris}>
        Vencimientos
      </text>
      <text x={124} y={111} textAnchor="middle" style={MANO_B} fontSize={21} fill={gris}>
        agregar
      </text>
      <text x={-184} y={116} style={MANO_B} fontSize={31} fill={CG.sepia}>
        ¿y si…?
      </text>
      <Flecha x1={-80} y1={104} x2={52} y2={104} curva={-10} color={CG.sepia} ancho={2.2} delay={1.2} cab={10} />
      <Cinta x={-196} y={-160} w={74} h={24} rot={-32} />
      <Cinta x={198} y={-160} w={74} h={24} rot={30} />
      {paso >= 1 && (
        <g transform="translate(-60 -162)">
          <g className="cg-cae" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <Cinta x={0} y={0} w={190} h={32} rot={-3} texto="datos inventados" color={CG.azul2} fs={24} />
          </g>
        </g>
      )}
      {paso >= 2 && (
        <g transform="translate(150 158)">
          <g className="cg-cae" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
            <Cinta x={0} y={0} w={166} h={32} rot={3} texto="para discutir" color={CG.azul2} fs={24} />
          </g>
        </g>
      )}
    </g>
  );
}

function Sistema({ p, paso }: { p: string; paso: number }) {
  const fuerte = (k: number) => (paso === 0 || paso >= k ? 1 : 0.14);
  return (
    <g>
      <rect x={-200} y={-128} width={400} height={258} rx={10} fill={CG.blanco} filter={url(p, "sombra")} />
      <path d="M-200 -92 V-118 Q-200 -128 -190 -128 H190 Q200 -128 200 -118 V-92 Z" fill={CG.papel2} />
      <text x={-184} y={-103} style={SANS_B} fontSize={18} fill={CG.tinta}>
        Vencimientos
      </text>
      <rect x={134} y={-121} width={54} height={22} rx={11} fill="none" stroke={CG.musgo} strokeWidth={1.6} />
      <text x={161} y={-105.5} textAnchor="middle" style={MONO} fontSize={13} fill={CG.musgo}>
        v2.3
      </text>
      {/* 4 · la usa el equipo */}
      <g opacity={fuerte(4)} className="ilx-suave">
        {[
          ["MR", CG.azul2],
          ["LG", CG.musgo],
          ["+2", CG.gris],
        ].map(([t, c], i) => (
          <g key={t}>
            <circle cx={58 + i * 22} cy={-110} r={11} fill={c} stroke={CG.papel2} strokeWidth={2} />
            <text x={58 + i * 22} y={-106} textAnchor="middle" style={SANS_B} fontSize={9.5} fill={CG.blanco}>
              {t}
            </text>
          </g>
        ))}
      </g>
      {FILAS_14.map((f, i) => {
        const y = -78 + i * 54;
        return (
          <g key={f.c}>
            <rect x={-184} y={y} width={368} height={44} rx={8} fill={CG.papel} fillOpacity={0.55} stroke={CG.niebla} />
            <text x={-168} y={y + 19} style={SANS_B} fontSize={15} fill={CG.tinta}>
              {f.c}
            </text>
            <text x={-168} y={y + 36} style={SANS} fontSize={12.5} fill={CG.sepia}>
              {f.t}
            </text>
            <rect x={76} y={y + 10} width={92} height={24} rx={6} fill={CG.blanco} stroke={CG.niebla} />
            <text x={122} y={y + 27} textAnchor="middle" style={MONO} fontSize={13} fill={CG.tinta}>
              {f.v}
            </text>
          </g>
        );
      })}
      <rect x={64} y={88} width={120} height={32} rx={8} fill={CG.azul2} />
      <text x={124} y={109} textAnchor="middle" style={SANS_B} fontSize={14} fill={CG.blanco}>
        Agregar
      </text>
      {/* 3 · pruebas */}
      <g opacity={fuerte(3)} className="ilx-suave">
        {["42/42 pruebas", "copia diaria"].map((t, i) => (
          <g key={t}>
            <path d={`M-184 ${99 + i * 20} l 4 5 l 9 -11`} fill="none" stroke={CG.musgo} strokeWidth={2.2} strokeLinecap="round" />
            <text x={-166} y={104 + i * 20} style={MONO} fontSize={13} fill={CG.musgo}>
              {t}
            </text>
          </g>
        ))}
      </g>
      {/* 5 · registro de auditoría y responsable */}
      <g opacity={fuerte(5)} className="ilx-suave">
        <text x={-200} y={150} style={MONO} fontSize={10.5} letterSpacing={2} fill={CG.gris}>
          REGISTRO
        </text>
        <text x={-200} y={166} style={MONO} fontSize={12} fill={CG.sepia}>
          09:14 MR editó 1234/25
        </text>
        <text x={-200} y={182} style={MONO} fontSize={12} fill={CG.sepia}>
          09:20 LG agregó 2210/24
        </text>
        <text x={200} y={172} textAnchor="end" style={MANO_B} fontSize={22} fill={CG.azul2}>
          responsable: M. Rossi
        </text>
      </g>
      {/* 6 · datos sensibles */}
      {paso >= 6 && (
        <g transform="translate(96 16)">
          <Sello p={p} lineas={["DATOS SENSIBLES", "PROTOCOLO"]} w={214} h={58} fs={14} rot={-9} delay={0.1} opacidad={0.88} />
        </g>
      )}
    </g>
  );
}

export function P14Madurez({ paso, className }: PropsIlus) {
  const p = usePrefijo("c14");
  const x0 = 532;
  const base = 300;
  const w = 22;
  const h = 19;
  return (
    <Lienzo
      w={1200}
      h={390}
      p={p}
      className={className}
      label="El mismo objeto en dos grados de madurez. A la izquierda, un boceto en lápiz sobre papel cuadriculado, pegado con cinta, con la nota «¿y si…?». A la derecha, el mismo diseño como sistema consolidado: versión 2.3, pruebas, registro de cambios y responsable. Entre los dos, una flecha: madurez."
    >
      <Pieza x={272} y={196} rot={-2} d={0.05}>
        <Boceto p={p} paso={paso} />
      </Pieza>
      <Pieza x={930} y={186} d={0.45} anim="cg-sube">
        <Sistema p={p} paso={paso} />
      </Pieza>

      {/* madurez */}
      <Sube d={0.9}>
        <text x={601} y={124} textAnchor="middle" style={MANO_B} fontSize={30} fill={CG.sepia}>
          madurez
        </text>
      </Sube>
      <Flecha x1={522} y1={146} x2={684} y2={146} curva={-10} color={CG.sepia} ancho={2.6} delay={0.8} cab={13} />
      {/* escalera de contextos de uso: un escalón por paso */}
      <g filter={url(p, "lapiz")}>
        <path
          d={`M${x0} ${base} ${Array.from({ length: 6 }, (_, i) => `V${base - (i + 1) * h} H${x0 + (i + 1) * w}`).join(" ")} V${base} Z`}
          fill="none"
          stroke={CG.gris}
          strokeWidth={1.6}
          opacity={0.6}
        />
      </g>
      {Array.from({ length: 6 }, (_, i) =>
        paso >= i + 1 ? (
          <g key={i} className="cg-sube">
            <rect x={x0 + i * w + 1.5} y={base - (i + 1) * h + 1.5} width={w - 3} height={(i + 1) * h - 3} fill={i === 5 ? CG.lacre : CG.ocre} opacity={i === 5 ? 0.7 : 0.55} />
          </g>
        ) : null,
      )}
      {paso >= 1 && (
        <g key={paso} className="cg-cae" style={{ transformBox: "fill-box", transformOrigin: "center" }}>
          <circle cx={x0 + (paso - 0.5) * w} cy={base - paso * h - 14} r={5} fill={CG.lacre} />
        </g>
      )}
      <Sube d={1.1}>
        <text x={x0 + 3 * w} y={base + 26} textAnchor="middle" style={MANO} fontSize={19} fill={CG.gris}>
          según el uso
        </text>
      </Sube>
    </Lienzo>
  );
}

// ============================================================================
// PLACA 15 · El código dejó de ser la primera barrera — una persona, de
// espaldas, frente a una hoja en blanco que empieza a ser interfaz. En la
// esquina, chiquito y vacío, el monitor de la placa 1.
// ============================================================================

export function P15Espacio({ className }: PropsIlus) {
  const p = usePrefijo("c15");
  const az = CG.azul;
  return (
    <Lienzo
      w={800}
      h={620}
      p={p}
      className={className}
      label="Una persona de espaldas frente a una hoja en blanco que empieza a convertirse en interfaz: un campo con el cursor esperando, tarjetas y un botón apenas punteados. En la esquina, pequeño y vacío, el viejo monitor del comienzo."
    >
      {/* Recuerdo de la placa 1: el monitor, chiquito y apagado. */}
      <g transform="translate(40 34) scale(0.16)" opacity={0.42}>
        <g className="ilx-aparece" style={retraso(0.1)}>
          <MonitorCRT p={p} lineas={[]} cursor={false} />
        </g>
      </g>
      <Sube d={0.3}>
        <text x={40} y={150} style={MONO} fontSize={13} fill={CG.gris} opacity={0.6}>
          {BASIC_P01[0]}
        </text>
      </Sube>

      {/* La hoja: el espacio vacío. */}
      <g transform="translate(300 56) rotate(0.8 228 242)">
        <g className="cg-sube" style={retraso(0.15)}>
          <rect width={456} height={484} fill={CG.blanco} filter={url(p, "sombra")} />
          <text x={40} y={92} style={MANO} fontSize={23} fill={CG.gris} className="ilx-aparece" opacity={0.85}>
            ¿qué querés construir?
          </text>
        </g>
        {/* lo primero que aparece: un campo, con el cursor esperando */}
        <Traza d="M50 108 H406 Q416 108 416 118 V150 Q416 160 406 160 H50 Q40 160 40 150 V118 Q40 108 50 108 Z" color={CG.azul2} ancho={1.8} delay={0.9} dur={1.2} />
        <Sube d={2}>
          <rect x={58} y={120} width={3} height={28} fill={CG.tinta} className="cg-cursor" />
        </Sube>
        {/* lo que todavía no es: apenas punteado */}
        <g fill="none" stroke={az} strokeWidth={1.8} strokeDasharray="6 7" strokeLinecap="round">
          <g className="ilx-aparece" style={retraso(1.4)}>
            <rect x={40} y={40} width={210} height={26} rx={6} opacity={0.7} />
          </g>
          <g className="ilx-aparece" style={retraso(2.1)}>
            <rect x={40} y={192} width={180} height={140} rx={12} opacity={0.6} />
            <path d="M60 222 H170 M60 246 H140" opacity={0.5} />
          </g>
          <g className="ilx-aparece" style={retraso(2.5)}>
            <rect x={236} y={192} width={180} height={140} rx={12} opacity={0.5} />
            <path d="M256 222 H366 M256 246 H326" opacity={0.4} />
          </g>
          <g className="ilx-aparece" style={retraso(2.9)}>
            <rect x={276} y={372} width={140} height={46} rx={12} opacity={0.45} />
          </g>
        </g>
      </g>

      {/* Una persona, de espaldas, mirando la hoja (la cabeza gira apenas hacia ella). */}
      <g className="cg-sube" style={retraso(0.45)}>
        <g stroke={CG.sepia} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          {/* cuello */}
          <path d="M172 440 C 172 456, 170 468, 168 482 L 212 482 C 210 468, 208 456, 208 440 Z" fill={CG.papel} stroke="none" />
          <path d="M172 444 C 172 458, 170 470, 168 480 M208 444 C 208 458, 210 470, 212 478" fill="none" strokeWidth={2} />
          {/* espalda y hombros */}
          <path
            d="M162 476 C 140 478, 106 484, 86 496 C 66 506, 58 526, 56 552 L 52 640 L 324 640 L 320 552 C 318 526, 310 506, 292 496 C 270 484, 236 478, 214 474 Z"
            fill={CG.papel2}
          />
          {/* cuello de la camisa */}
          <path d="M158 482 C 172 470, 208 468, 222 480 L 212 490 C 200 482, 178 482, 168 492 Z" fill={CG.blanco} strokeWidth={2} />
          {/* costura de la espalda */}
          <path d="M190 494 C 189 560, 189 600, 189 640" fill="none" strokeWidth={1.4} opacity={0.35} />
          {/* oreja y patilla de los anteojos */}
          <path d="M228 404 C 238 402, 240 424, 228 430" fill={CG.papel} strokeWidth={2} />
          <path d="M227 405 L 236 402" fill="none" strokeWidth={1.6} />
          {/* cabeza: de atrás, casi todo es pelo */}
          <path
            d="M150 410 C 148 376, 166 352, 190 352 C 216 352, 232 376, 230 408 C 229 428, 222 444, 210 452 C 200 458, 180 458, 170 452 C 158 444, 151 428, 150 410 Z"
            fill={CG.sepia}
            fillOpacity={0.82}
          />
          <g fill="none" stroke={CG.papel} strokeWidth={1.4} opacity={0.3}>
            <path d="M188 358 C 180 382, 174 412, 174 444" />
            <path d="M204 360 C 210 390, 208 420, 200 448" />
            <path d="M172 366 C 162 388, 158 412, 162 436" />
            <path d="M218 372 C 224 394, 224 414, 218 434" />
          </g>
        </g>
      </g>
    </Lienzo>
  );
}
