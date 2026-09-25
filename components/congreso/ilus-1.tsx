// Ilustraciones del Congreso · placas 01, 02, 03 y 05.
// Arqueología tecnológica aplicada al Derecho: papel continuo, pantallas de
// fósforo, cláusulas intervenidas a mano, carátulas y cadenas de traducción.

import type { ReactNode } from "react";
import {
  Barras,
  CAE,
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
  ovalo,
  Perforaciones,
  Pieza,
  punta,
  rectMano,
  Resaltado,
  retraso,
  romboMano,
  Sello,
  Sube,
  Traza,
  url,
  usePrefijo,
} from "@/components/congreso/ilus-piezas";

export interface PropsIlus {
  paso: number;
  className?: string;
}

// ============================================================================
// PLACA 01 · ¿Sabés programar? — vestigios de la informática de antes, detrás
// de la pregunta: papel continuo que cae desde arriba y un monitor de fósforo
// cortado en la esquina, con el mismo plazo escrito en BASIC.
// ============================================================================

export const BASIC_P01 = [
  "10 IF PLAZO > 0 THEN GOTO 40",
  '20 PRINT "VENCIDO"',
  "30 END",
  '40 PRINT "EN TERMINO"',
  "RUN",
  "EN TERMINO",
];

const COBOL = [
  "000100 IDENTIFICATION DIVISION.",
  "000200 PROGRAM-ID. PLAZOS.",
  "000300 DATA DIVISION.",
  "000400 01 DIAS-PLAZO PIC 9(3).",
  "000500 PROCEDURE DIVISION.",
  "000600     IF DIAS-PLAZO > 0",
  '000700        DISPLAY "EN TERMINO"',
  "000800     ELSE",
  '000900        DISPLAY "VENCIDO".',
  "001000     STOP RUN.",
];

/** Monitor de tubo (esquina superior izquierda del cuerpo en 0,0; 690 × 580). */
export function MonitorCRT({
  p,
  lineas,
  fs = 25,
  d0 = 0.8,
  cursor = true,
}: {
  p: string;
  lineas: string[];
  fs?: number;
  d0?: number;
  cursor?: boolean;
}) {
  const alto = fs * 1.76;
  return (
    <g>
      <rect x={0} y={0} width={690} height={580} rx={42} fill={CG.papel2} stroke={CG.sepia} strokeWidth={3} />
      <rect x={50} y={48} width={530} height={412} rx={30} fill={CG.carton} fillOpacity={0.55} stroke={CG.sepia} strokeWidth={1.6} />
      <rect x={76} y={72} width={478} height={362} rx={46} fill={url(p, "crt")} stroke={CG.sepia} strokeWidth={1.4} />
      <rect x={76} y={72} width={478} height={362} rx={46} fill={url(p, "barrido")} />
      <path d="M108 118 C 130 92, 190 86, 250 86" fill="none" stroke={CG.blanco} strokeWidth={5} strokeLinecap="round" opacity={0.55} />
      {lineas.map((l, i) => (
        <Sube key={i} d={d0 + i * 0.32}>
          <text x={112} y={128 + i * alto} style={MONO} fontSize={fs} fill={CG.sepia}>
            {l}
          </text>
        </Sube>
      ))}
      {cursor && (
        <Sube d={d0 + lineas.length * 0.32}>
          <rect x={112} y={128 + lineas.length * alto - fs * 0.82} width={fs * 0.6} height={fs * 0.95} fill={CG.sepia} className="cg-cursor" />
        </Sube>
      )}
      {/* ranuras de ventilación y la perilla */}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={430 + i * 22} y={500} width={12} height={46} rx={5} fill={CG.sepia} opacity={0.18} />
      ))}
    </g>
  );
}

export function P01PantallaVieja({ className }: PropsIlus) {
  const p = usePrefijo("c01");
  const W = 400;
  const fs = 15.5;
  const FIN = 372;
  return (
    <Lienzo
      w={1600}
      h={1000}
      p={p}
      slice
      recorta
      className={className}
      label="Detrás de la pregunta, vestigios de la informática de antes: una tira de papel continuo con un listado en COBOL y un viejo monitor de tubo con un programa en BASIC que calcula si un plazo está vencido."
    >
      {/* Papel continuo: baja desde el borde superior, como si saliera de la impresora. */}
      <g transform="translate(64 -36) rotate(-6)" opacity={0.36}>
        <g className="ilx-baja" style={retraso(0.1)}>
          <rect x={0} y={-600} width={W} height={FIN + 600} fill={CG.blanco} filter={url(p, "sombra")} />
          {/* bandas de color (el "green bar", en sepia) */}
          {Array.from({ length: 10 }, (_, i) => (
            <rect key={i} x={36} y={-590 + i * 104} width={W - 72} height={Math.min(52, FIN - (-590 + i * 104))} fill={CG.carton} opacity={0.5} />
          ))}
          <line x1={36} x2={36} y1={-600} y2={FIN} stroke={CG.niebla} strokeDasharray="3 5" />
          <line x1={W - 36} x2={W - 36} y1={-600} y2={FIN} stroke={CG.niebla} strokeDasharray="3 5" />
          <line x1={0} x2={W} y1={246} y2={246} stroke={CG.gris} strokeDasharray="4 6" opacity={0.6} />
          <Perforaciones x={18} y0={-590} y1={FIN - 8} sep={26} r={6.5} />
          <Perforaciones x={W - 18} y0={-590} y1={FIN - 8} sep={26} r={6.5} />
          <text x={48} y={22} style={MONO} fontSize={fs} fill={CG.gris}>
            PLAZOS.CBL
          </text>
          <text x={W - 48} y={22} textAnchor="end" style={MONO} fontSize={fs} fill={CG.gris}>
            PAG. 001
          </text>
          {COBOL.map((l, i) => (
            <text key={i} x={48} y={62 + i * 26} style={MONO} fontSize={fs} fill={CG.sepia} xmlSpace="preserve">
              {l}
            </text>
          ))}
          <text x={48} y={62 + 11 * 26} style={MONO} fontSize={fs} fill={CG.gris}>
            *** FIN DEL LISTADO ***
          </text>
          {/* borde de abajo: cortado por la perforación */}
          <path d={`M0 ${FIN} L${W} ${FIN}`} stroke={CG.niebla} strokeWidth={1.2} strokeDasharray="2 3" />
        </g>
      </g>

      {/* Monitor de fósforo cálido, cortado por la esquina inferior derecha. */}
      <g transform="translate(1020 528)" opacity={0.28}>
        <g className="cg-sube" style={retraso(0.35)}>
          <MonitorCRT p={p} lineas={BASIC_P01} d0={1} />
        </g>
      </g>
    </Lienzo>
  );
}

// ============================================================================
// PLACA 02 · Si A → B, salvo que ocurra C — una cláusula de un contrato de
// locación, intervenida a mano: resaltador, subrayados, letras al margen y un
// diagrama de flujo en lápiz que se entinta a medida que Marco lo explica.
// ============================================================================

const FS2 = 21;
const CW2 = cm(FS2);
const X2 = 64;
const Y2 = [152, 194, 236, 278];
const col2 = (c: number) => X2 + c * CW2;
const CLAUSULA = [
  "Si el LOCATARIO no abonare dos (2) meses",
  "consecutivos de alquiler, el LOCADOR podrá",
  "resolver el contrato, salvo que el LOCATARIO",
  "pague lo adeudado antes de la intimación.",
];

function LetraMargen({ letra, x, y, color, d }: { letra: string; x: number; y: number; color: string; d: number }) {
  return (
    <g>
      <Traza d={ovalo(x, y - 8, 17, 16, -2.2, 1.08)} color={color} ancho={2.2} delay={d} dur={0.7} />
      <Sube d={d + 0.2}>
        <text x={x} y={y} textAnchor="middle" style={MANO_B} fontSize={27} fill={color}>
          {letra}
        </text>
      </Sube>
    </g>
  );
}

export function P02Clausula({ paso, className }: PropsIlus) {
  const p = usePrefijo("c02");
  const W = 748;
  const H = 588;
  // Diagrama (coordenadas de la hoja).
  const D = { cx: 390, cy: 422, hw: 104, hh: 58 };
  const B = { x: 576, y: 394, w: 146, h: 56 };
  const tinta = CG.azul2;
  const EXC = "M548 428 C 548 470, 556 504, 584 514";
  return (
    <Lienzo
      w={800}
      h={620}
      p={p}
      className={className}
      label="Una cláusula de un contrato de locación intervenida a mano: la condición resaltada, la consecuencia subrayada, la excepción marcada en rojo y, abajo, un diagrama de flujo: entradas, ¿dos meses impagos?, sí: resolver el contrato, salvo que haya pagado antes de la intimación."
    >
      <g transform={`translate(400 310) rotate(-1.1) translate(${-W / 2} ${-H / 2})`}>
        <g className="cg-cae" style={{ ...retraso(0.05) }}>
          <Hoja p={p} w={W} h={H} />
          {/* margen de la foja */}
          <line x1={44} x2={44} y1={0} y2={H} stroke={CG.lacre} strokeOpacity={0.28} strokeWidth={1.2} />
          <text x={X2} y={50} style={MONO} fontSize={14} letterSpacing={1.4} fill={CG.gris}>
            CONTRATO DE LOCACIÓN · CLÁUSULAS PARTICULARES
          </text>
          {/* foliado a mano */}
          <text x={W - 44} y={56} textAnchor="end" style={MANO_B} fontSize={30} fill={CG.sepia}>
            4
          </text>
          <path d={`M${W - 70} 64 q 14 4 30 -2`} fill="none" stroke={CG.sepia} strokeWidth={1.6} strokeLinecap="round" />
          <text x={X2} y={104} style={DISPLAY} fontSize={25} fill={CG.tinta}>
            CLÁUSULA DÉCIMA — RESOLUCIÓN.
          </text>
          {/* rúbrica al margen */}
          <path
            d="M70 566 c 10 -26 22 -30 20 -8 c -2 14 14 -18 26 -14 c 10 4 -2 18 10 12 c 10 -6 18 -10 30 -8"
            fill="none"
            stroke={CG.azul2}
            strokeWidth={1.8}
            strokeLinecap="round"
            opacity={0.65}
          />
        </g>

        {/* Marcas detrás del texto (resaltador). */}
        {paso >= 1 && (
          <g>
            <Resaltado x={col2(0) - 3} y={Y2[0] - 18} w={40 * CW2 + 6} h={24} delay={0.05} />
            <Resaltado x={col2(0) - 3} y={Y2[1] - 18} w={24 * CW2 + 4} h={24} delay={0.55} rot={0.4} />
          </g>
        )}

        {/* La cláusula, a máquina. */}
        <g className="cg-sube" style={retraso(0.35)}>
          {CLAUSULA.map((l, i) => (
            <text key={i} x={X2} y={Y2[i]} style={MONO} fontSize={FS2} fill={CG.tinta}>
              {l}
            </text>
          ))}
        </g>

        {/* Diagrama en lápiz: siempre está, apenas insinuado. */}
        <g filter={url(p, "lapiz")} opacity={0.5} className="ilx-aparece" style={retraso(1.1)}>
          <g fill="none" stroke={CG.gris} strokeWidth={1.6} strokeLinecap="round">
            <path d="M244 386 q 10 2 10 18 q 0 14 8 18 q -8 4 -8 18 q 0 16 -10 18" />
            <path d={flechaD(262, 422, 282, 422)} />
            <path d={romboMano(D.cx, D.cy, D.hw, D.hh)} />
            <path d={flechaD(496, 422, 568, 422)} />
            <path d={rectMano(B.x, B.y, B.w, B.h)} />
            <path d={flechaD(D.cx, 482, D.cx, 526)} />
            <path d={EXC} />
            {paso < 4 && <path d="M70 398 h 110 M70 425 h 70 M70 452 h 130" strokeDasharray="2 7" />}
          </g>
          {paso < 1 && (
            <text x={D.cx} y={D.cy + 11} textAnchor="middle" style={MANO} fontSize={34} fill={CG.gris}>
              ?
            </text>
          )}
        </g>

        {/* 1 · CONDICIÓN */}
        {paso >= 1 && (
          <g>
            <LetraMargen letra="A" x={694} y={Y2[0] - 2} color={tinta} d={0.5} />
            <Traza d={romboMano(D.cx, D.cy, D.hw, D.hh)} color={tinta} ancho={2.6} delay={0.4} />
            <Sube d={0.9}>
              <text x={D.cx} y={D.cy - 5} textAnchor="middle" style={MANO_B} fontSize={25} fill={CG.tinta}>
                ¿2 meses
              </text>
              <text x={D.cx} y={D.cy + 21} textAnchor="middle" style={MANO_B} fontSize={25} fill={CG.tinta}>
                impagos?
              </text>
              <text x={D.cx} y={346} textAnchor="middle" style={MANO_B} fontSize={22} letterSpacing={0.6} fill={tinta}>
                A · CONDICIÓN
              </text>
            </Sube>
            <Flecha x1={D.cx} y1={484} x2={D.cx} y2={526} color={tinta} ancho={2.2} delay={1.1} cab={10} />
            <Sube d={1.4}>
              <text x={D.cx + 10} y={509} style={MANO} fontSize={20} fill={tinta}>
                no
              </text>
              <text x={D.cx} y={553} textAnchor="middle" style={MANO} fontSize={21} fill={CG.gris}>
                sigue vigente
              </text>
            </Sube>
          </g>
        )}

        {/* 2 · CONSECUENCIA */}
        {paso >= 2 && (
          <g>
            <Traza d={onda(col2(26), col2(42), Y2[1] + 8, 1.2)} color={tinta} ancho={2.6} delay={0.05} dur={0.6} />
            <Traza d={onda(col2(0), col2(20), Y2[2] + 8, 1.2)} color={tinta} ancho={2.6} delay={0.5} dur={0.6} />
            <LetraMargen letra="B" x={694} y={Y2[1] + 20} color={tinta} d={0.7} />
            <Flecha x1={498} y1={422} x2={568} y2={422} color={tinta} ancho={2.4} delay={0.6} cab={11} />
            <Traza d={rectMano(B.x, B.y, B.w, B.h)} color={tinta} ancho={2.4} delay={0.9} />
            <Sube d={1.2}>
              <text x={516} y={410} textAnchor="middle" style={MANO} fontSize={20} fill={tinta}>
                sí
              </text>
              <text x={B.x + B.w / 2} y={B.y + 25} textAnchor="middle" style={MANO_B} fontSize={23} fill={CG.tinta}>
                resolver
              </text>
              <text x={B.x + B.w / 2} y={B.y + 47} textAnchor="middle" style={MANO_B} fontSize={23} fill={CG.tinta}>
                el contrato
              </text>
              <text x={B.x + B.w / 2} y={378} textAnchor="middle" style={MANO_B} fontSize={21} letterSpacing={0.4} fill={tinta}>
                B · CONSECUENCIA
              </text>
            </Sube>
          </g>
        )}

        {/* 3 · EXCEPCIÓN */}
        {paso >= 3 && (
          <g>
            <Traza d={onda(col2(22), col2(44), Y2[2] + 9, 2.6, 18)} color={CG.lacre} ancho={2.6} delay={0.05} dur={0.6} />
            <Traza d={onda(col2(0), col2(41), Y2[3] + 9, 2.6, 18)} color={CG.lacre} ancho={2.6} delay={0.5} dur={0.7} />
            <LetraMargen letra="C" x={694} y={Y2[2] + 22} color={CG.lacre} d={0.8} />
            <Traza d={EXC} color={CG.lacre} ancho={2.8} delay={0.8} dur={0.7} />
            <Traza d={punta(584, 514, Math.atan2(10, 28), 12)} color={CG.lacre} ancho={2.8} delay={1.4} dur={0.3} />
            {/* la bifurcación corta la flecha del "sí" */}
            <Traza d="M540 410 L556 434" color={CG.lacre} ancho={2.8} delay={0.7} dur={0.3} />
            <Sube d={1.3}>
              <text x={536} y={490} textAnchor="end" style={MANO_B} fontSize={27} fill={CG.lacre}>
                salvo C
              </text>
              <text x={594} y={522} style={MANO_B} fontSize={23} fill={CG.lacre}>
                no resuelve
              </text>
              <text x={594} y={552} style={MANO_B} fontSize={19} letterSpacing={0.4} fill={CG.lacre}>
                C · EXCEPCIÓN
              </text>
            </Sube>
          </g>
        )}

        {/* 4 · ENTRADAS */}
        {paso >= 4 && (
          <g>
            <Traza d={ovalo(col2(22.5), Y2[0] - 7, 3.5 * CW2 + 11, 17)} color={tinta} ancho={2.3} delay={0.05} dur={0.6} />
            <Traza d={ovalo(col2(20), Y2[1] - 7, 4 * CW2 + 11, 17, -2.4)} color={tinta} ancho={2.3} delay={0.35} dur={0.6} />
            <Traza d={ovalo(col2(35), Y2[3] - 7, 5 * CW2 + 11, 17, -2.9)} color={tinta} ancho={2.3} delay={0.65} dur={0.6} />
            <Traza d="M244 386 q 10 2 10 18 q 0 14 8 18 q -8 4 -8 18 q 0 16 -10 18" color={tinta} ancho={2.3} delay={1.2} dur={0.6} />
            <Flecha x1={262} y1={422} x2={282} y2={422} color={tinta} ancho={2.3} delay={1.5} cab={9} />
            <Sube d={0.9}>
              <text x={X2} y={374} style={MANO_B} fontSize={24} letterSpacing={0.6} fill={tinta}>
                ENTRADAS
              </text>
              <text x={X2} y={405} style={MANO} fontSize={22} fill={CG.tinta}>
                fechas de pago
              </text>
              <text x={X2} y={432} style={MANO} fontSize={22} fill={CG.tinta}>
                montos
              </text>
              <text x={X2} y={459} style={MANO} fontSize={22} fill={CG.tinta}>
                fecha de intimación
              </text>
            </Sube>
          </g>
        )}
      </g>
    </Lienzo>
  );
}

/** Flecha en una sola ruta (para el lápiz). */
function flechaD(x1: number, y1: number, x2: number, y2: number): string {
  return `M${x1} ${y1} L${x2} ${y2} ${punta(x2, y2, Math.atan2(y2 - y1, x2 - x1), 10)}`;
}

// ============================================================================
// PLACA 03 · Ya diseñamos sistemas — collage de papeles del trabajo jurídico.
// Cada uno, pegado con cinta, lleva escrito el sistema que tiene adentro.
// ============================================================================

function Caratula({ p }: { p: string }) {
  return (
    <g>
      <rect x={-118} y={-150} width={236} height={300} fill={CG.carton} filter={url(p, "sombra")} />
      <rect x={-108} y={-140} width={216} height={280} fill="none" stroke={CG.sepia} strokeOpacity={0.35} strokeWidth={1.2} />
      <circle cx={-98} cy={-56} r={4} fill="#b9ab8c" />
      <circle cx={-98} cy={56} r={4} fill="#b9ab8c" />
      <text x={0} y={-116} textAnchor="middle" style={MONO_B} fontSize={11} letterSpacing={2} fill={CG.sepia}>
        PODER JUDICIAL
      </text>
      <text x={0} y={-101} textAnchor="middle" style={MONO_B} fontSize={11} letterSpacing={2} fill={CG.sepia}>
        DE TUCUMÁN
      </text>
      <line x1={-86} x2={86} y1={-90} y2={-90} stroke={CG.sepia} strokeOpacity={0.5} />
      <text x={0} y={-70} textAnchor="middle" style={MONO} fontSize={11} letterSpacing={1.5} fill={CG.sepia}>
        EXPEDIENTE N°
      </text>
      <text x={0} y={-36} textAnchor="middle" style={DISPLAY} fontSize={34} fill={CG.tinta}>
        1234/25
      </text>
      <text x={-86} y={-4} style={MONO} fontSize={14} fill={CG.tinta}>
        PÉREZ, Juan
      </text>
      <text x={-86} y={16} style={MONO} fontSize={14} fill={CG.tinta}>
        c/ GÓMEZ, Ana
      </text>
      <text x={-86} y={36} style={MONO} fontSize={14} fill={CG.tinta}>
        s/ daños y perjuicios
      </text>
      <line x1={-86} x2={86} y1={52} y2={52} stroke={CG.sepia} strokeOpacity={0.5} />
      {["Juzg. Civil y Com. II", "Inicio 03/03/2025", "Fojas 1 a 312"].map((t, i) => (
        <text key={t} x={-86} y={74 + i * 18} style={MONO} fontSize={11.5} fill={CG.sepia}>
          {t}
        </text>
      ))}
      <g transform="translate(52 116)">
        <Sello p={p} lineas={["RECIBIDO", "03 MAR 2025", "MESA ENTRADAS"]} w={116} h={52} fs={9.5} rot={-10} delay={0.9} />
      </g>
    </g>
  );
}

function Formulario({ p }: { p: string }) {
  const celdas = (y: number, n: number, letras: string) => (
    <g>
      {Array.from({ length: n }, (_, i) => (
        <rect key={i} x={-90 + i * 20} y={y} width={18} height={22} fill="none" stroke={CG.gris} strokeWidth={0.9} />
      ))}
      {letras.split("").map((c, i) => (
        <text key={i} x={-81 + i * 20} y={y + 17} textAnchor="middle" style={MANO_B} fontSize={19} fill={CG.azul2}>
          {c}
        </text>
      ))}
    </g>
  );
  const caja = (x: number, y: number, t: string, marcada: boolean) => (
    <g>
      <rect x={x} y={y - 10} width={11} height={11} fill="none" stroke={CG.sepia} strokeWidth={1} />
      {marcada && <path d={`M${x + 1} ${y - 5} l 4 5 l 9 -12`} fill="none" stroke={CG.azul2} strokeWidth={2} strokeLinecap="round" />}
      <text x={x + 17} y={y} style={MONO} fontSize={11.5} fill={CG.tinta}>
        {t}
      </text>
    </g>
  );
  return (
    <g>
      <Hoja p={p} w={214} h={272} />
      <g transform="translate(107 136)">
        <text x={-90} y={-110} style={MONO_B} fontSize={10.5} letterSpacing={1.5} fill={CG.gris}>
          FORMULARIO 01
        </text>
        <text x={-90} y={-88} style={DISPLAY} fontSize={17} fill={CG.tinta}>
          Ingreso de consulta
        </text>
        <line x1={-90} x2={90} y1={-78} y2={-78} stroke={CG.tinta} strokeWidth={0.8} />
        <text x={-90} y={-60} style={MONO} fontSize={9.5} letterSpacing={0.8} fill={CG.gris}>
          APELLIDO
        </text>
        {celdas(-54, 9, "PÉREZ")}
        <text x={-90} y={-14} style={MONO} fontSize={9.5} letterSpacing={0.8} fill={CG.gris}>
          MATERIA
        </text>
        {caja(-90, 6, "Civil", false)}
        {caja(-14, 6, "Laboral", true)}
        {caja(-90, 28, "Familia", false)}
        {caja(-14, 28, "Otra", false)}
        <text x={-90} y={56} style={MONO} fontSize={9.5} letterSpacing={0.8} fill={CG.gris}>
          FECHA
        </text>
        {celdas(62, 6, "120326")}
        <line x1={20} x2={90} y1={118} y2={118} stroke={CG.gris} strokeWidth={0.8} />
        <text x={20} y={130} style={MONO} fontSize={9} fill={CG.gris}>
          FIRMA
        </text>
        <path d="M26 114 c 8 -16 14 -14 12 -2 c 6 -12 14 -10 16 -2 c 4 -6 10 -8 20 -6" fill="none" stroke={CG.azul2} strokeWidth={1.5} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Contrato({ p }: { p: string }) {
  const lineas = ["Si el pago se demora", "más de diez (10) días,", "se aplicará un interés", "del 3% mensual, salvo", "caso fortuito."];
  return (
    <g>
      <Hoja p={p} w={220} h={296} />
      <g transform="translate(110 148)">
        <text x={-4} y={-116} textAnchor="middle" style={DISPLAY} fontSize={14} fill={CG.tinta}>
          CONTRATO DE LOCACIÓN
        </text>
        <line x1={-80} x2={80} y1={-106} y2={-106} stroke={CG.tinta} strokeWidth={0.8} />
        <text x={-92} y={-86} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
          PRIMERA — OBJETO.
        </text>
        <Barras x={-92} y={-78} anchos={[184, 170, 184, 110]} alto={3.5} sep={11} />
        <text x={-92} y={-24} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
          SEGUNDA — PAGO.
        </text>
        <rect x={-94} y={-17} width={19} height={17} rx={2} fill={CG.ocre} opacity={0.45} />
        {lineas.map((l, i) => (
          <text key={i} x={-92} y={-4 + i * 18} style={MONO} fontSize={12.5} fill={CG.tinta}>
            {l}
          </text>
        ))}
        <path d="M31 55 q 18 3 38 0" fill="none" stroke={CG.lacre} strokeWidth={2} strokeLinecap="round" />
        <text x={-92} y={100} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
          TERCERA — PLAZO.
        </text>
        <Barras x={-92} y={108} anchos={[184, 140]} alto={3.5} sep={11} />
        <path d="M-84 140 c 8 -14 14 -12 12 -2 c 6 -10 14 -10 18 0 c 4 -6 10 -6 16 -2" fill="none" stroke={CG.azul2} strokeWidth={1.4} strokeLinecap="round" />
        <path d="M30 140 c 6 -12 16 -14 14 -2 c 10 -12 16 -4 24 -6" fill="none" stroke={CG.azul2} strokeWidth={1.4} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Procedimiento({ p }: { p: string }) {
  const pasos = ["1. Registrar la fecha.", "2. Computar el plazo.", "3. Agendar vencimiento.", "4. Preparar el escrito.", "5. Presentar y avisar.", "6. Archivar la copia."];
  return (
    <g>
      <Hoja p={p} w={214} h={280} />
      <g transform="translate(107 140)">
        <text x={-90} y={-110} style={MONO_B} fontSize={10.5} letterSpacing={1.2} fill={CG.gris}>
          PROCEDIMIENTO N° 3
        </text>
        <text x={-90} y={-86} style={DISPLAY} fontSize={18} fill={CG.tinta}>
          Cédula recibida
        </text>
        <line x1={-90} x2={90} y1={-76} y2={-76} stroke={CG.tinta} strokeWidth={0.8} />
        {pasos.map((t, i) => (
          <text key={t} x={-90} y={-48 + i * 30} style={MONO} fontSize={12.5} fill={CG.tinta}>
            {t}
          </text>
        ))}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M${86} ${-54 + i * 30} l 4 5 l 9 -12`} fill="none" stroke={CG.azul2} strokeWidth={2} strokeLinecap="round" />
        ))}
        {/* clip */}
        <path d="M-60 -150 V-128 a5 5 0 0 0 10 0 V-156 a7 7 0 0 0 -14 0 V-132" fill="none" stroke={CG.gris} strokeWidth={2} strokeLinecap="round" />
      </g>
    </g>
  );
}

function Calendario({ p }: { p: string }) {
  const X = (c: number) => -78 + c * 26;
  const Y = (r: number) => -40 + r * 28;
  return (
    <g>
      <Hoja p={p} w={212} h={250} />
      <rect width={212} height={40} fill={CG.lacre} />
      <g transform="translate(106 125)">
        <text x={0} y={-97} textAnchor="middle" style={DISPLAY} fontSize={20} letterSpacing={1} fill={CG.blanco}>
          MARZO 2026
        </text>
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <text key={i} x={X(i)} y={-66} textAnchor="middle" style={MONO_B} fontSize={11} fill={CG.gris}>
            {d}
          </text>
        ))}
        {Array.from({ length: 31 }, (_, k) => {
          const d = k + 1;
          const i = d + 5;
          const c = i % 7;
          const r = Math.floor(i / 7);
          return (
            <text key={d} x={X(c)} y={Y(r)} textAnchor="middle" style={MONO} fontSize={14} fill={c >= 5 ? CG.gris : CG.tinta}>
              {d}
            </text>
          );
        })}
        {/* 24 de marzo: feriado → el plazo vence el 25 */}
        <path d={`M${X(1) - 11} ${Y(4) - 15} L${X(1) + 11} ${Y(4) + 4} M${X(1) + 11} ${Y(4) - 15} L${X(1) - 11} ${Y(4) + 4}`} stroke={CG.lacre} strokeWidth={2} strokeLinecap="round" />
        <path d={ovalo(X(2), Y(4) - 5, 15, 13)} fill="none" stroke={CG.lacre} strokeWidth={2} strokeLinecap="round" />
        <text x={-34} y={Y(5) + 2} style={MANO_B} fontSize={17} fill={CG.lacre}>
          feriado ⇒ 25
        </text>
      </g>
    </g>
  );
}

function Flujo({ p }: { p: string }) {
  const az = CG.azul2;
  return (
    <g>
      <Hoja p={p} w={236} h={270} />
      <rect width={236} height={270} fill={url(p, "cuadricula")} />
      <g transform="translate(118 135)">
        <g fill="none" stroke={az} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d={rectMano(-50, -110, 100, 34, 3)} />
          <path d={`M0 -74 L0 -46 ${punta(0, -46, Math.PI / 2, 8)}`} />
          <path d={romboMano(0, -12, 66, 32)} />
          <path d={`M-66 -12 Q -70 20 -66 50 ${punta(-66, 50, Math.PI / 2, 8)}`} />
          <path d={`M66 -12 Q 70 20 68 50 ${punta(68, 50, Math.PI / 2, 8)}`} />
          <path d={rectMano(-110, 56, 88, 32, 3)} />
          <path d={rectMano(22, 56, 94, 32, 3)} />
          <path d={`M-66 90 Q -50 100 -26 104 ${punta(-26, 104, 0.2, 8)}`} />
          <path d={`M68 90 Q 52 100 28 104 ${punta(28, 104, Math.PI - 0.2, 8)}`} />
          <path d={rectMano(-52, 100, 104, 28, 3)} />
        </g>
        <text x={0} y={-86} textAnchor="middle" style={MANO_B} fontSize={20} fill={CG.tinta}>
          demanda
        </text>
        <text x={0} y={-6} textAnchor="middle" style={MANO_B} fontSize={19} fill={CG.tinta}>
          ¿contesta?
        </text>
        <text x={-80} y={24} textAnchor="end" style={MANO} fontSize={17} fill={az}>
          sí
        </text>
        <text x={80} y={24} style={MANO} fontSize={17} fill={az}>
          no
        </text>
        <text x={-66} y={78} textAnchor="middle" style={MANO_B} fontSize={19} fill={CG.tinta}>
          prueba
        </text>
        <text x={69} y={78} textAnchor="middle" style={MANO_B} fontSize={19} fill={CG.tinta}>
          rebeldía
        </text>
        <text x={0} y={120} textAnchor="middle" style={MANO_B} fontSize={19} fill={CG.tinta}>
          sentencia
        </text>
      </g>
    </g>
  );
}

const COLLAGE: { x: number; y: number; rot: number; w: number; h: number; rotulo: string; ancho: number; rc: number; centrada?: boolean; abajo?: boolean; pieza: (p: string) => ReactNode }[] = [
  { x: 135, y: 204, rot: -4, w: 236, h: 300, rotulo: "base de datos", ancho: 170, rc: -3, centrada: true, pieza: (p) => <Caratula p={p} /> },
  { x: 322, y: 190, rot: 3, w: 214, h: 272, rotulo: "interfaz", ancho: 118, rc: 4, pieza: (p) => <Formulario p={p} /> },
  { x: 512, y: 208, rot: -2, w: 220, h: 296, rotulo: "reglas", ancho: 104, rc: -5, pieza: (p) => <Contrato p={p} /> },
  { x: 708, y: 192, rot: 2.5, w: 214, h: 280, rotulo: "algoritmo", ancho: 132, rc: 3, pieza: (p) => <Procedimiento p={p} /> },
  { x: 892, y: 196, rot: -3.5, w: 212, h: 250, rotulo: "plazos", ancho: 104, rc: -4, abajo: true, pieza: (p) => <Calendario p={p} /> },
  { x: 1072, y: 194, rot: 3, w: 236, h: 270, rotulo: "flujo", ancho: 92, rc: 3, pieza: (p) => <Flujo p={p} /> },
];

export function P03Collage({ className }: PropsIlus) {
  const p = usePrefijo("c03");
  return (
    <Lienzo
      w={1200}
      h={390}
      p={p}
      className={className}
      label="Collage de papeles del trabajo jurídico, cada uno con una cinta que nombra el sistema que tiene adentro: la carátula de un expediente (base de datos), un formulario (interfaz), un contrato (reglas), un procedimiento numerado (algoritmo), un almanaque con un plazo (plazos) y un diagrama de flujo dibujado a mano (flujo)."
    >
      {COLLAGE.map((c, i) => (
        <Pieza key={c.rotulo} x={c.x} y={c.y} rot={c.rot} d={0.05 + i * 0.16}>
          {c.centrada ? c.pieza(p) : <g transform={`translate(${-c.w / 2} ${-c.h / 2})`}>{c.pieza(p)}</g>}
        </Pieza>
      ))}
      {/* Las cintas con el nombre del sistema llegan después: primero son papeles. */}
      {COLLAGE.map((c, i) => (
        <g key={c.rotulo} transform={`translate(${c.x} ${c.y}) rotate(${c.rot}) translate(0 ${c.abajo ? c.h / 2 - 2 : -c.h / 2 + 2})`}>
          <g className="cg-cae" style={{ ...retraso(1.35 + i * 0.2), ...CAE }}>
            <Cinta x={0} y={0} w={c.ancho} h={32} rot={c.rc} texto={c.rotulo} fs={25} />
          </g>
        </g>
      ))}
    </Lienzo>
  );
}


// ============================================================================
// PLACA 05 · Antes había que traducir — la cadena: el abogado con su problema,
// la especificación, el plan de desarrollo, el código impreso y la interfaz
// que llega meses después… ordenada por número de expediente.
// ============================================================================

const BURBUJA = ["Necesito un sistema", "que me ordene los", "vencimientos de", "mis causas."];

/** Un abogado de perfil, a línea (mirando hacia la derecha, hacia la cadena). */
function Perfil() {
  return (
    <g fill="none" stroke={CG.sepia} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      {/* hombros */}
      <path d="M50 310 C 44 320, 26 326, 16 336 C 8 346, 4 360, 3 376" />
      <path d="M86 314 C 100 320, 118 324, 128 336 C 136 346, 139 360, 140 376" />
      <path d="M88 320 L 100 346" strokeWidth={1.8} />
      {/* cara */}
      <path
        d="M86 314 L 85 302 C 92 302, 99 300, 100 296 C 101 293, 102 291, 103 289 L 100 286 L 104 282 L 102 278 L 109 273 L 101 262 C 101 256, 99 250, 97 246 C 93 234, 82 228, 68 228 C 48 228, 33 242, 32 262 C 31 280, 38 292, 46 298 L 50 310"
        fill={CG.papel}
      />
      {/* pelo */}
      <path
        d="M95 243 C 90 232, 80 226, 66 226 C 46 226, 30 240, 30 262 C 30 278, 36 290, 44 297 C 46 284, 48 272, 56 264 C 64 256, 72 250, 80 248 C 86 246, 91 247, 95 243 Z"
        fill={CG.sepia}
        fillOpacity={0.78}
        strokeWidth={1.6}
      />
      {/* oreja y anteojos */}
      <path d="M62 258 C 54 257, 53 274, 62 275" fill={CG.papel} strokeWidth={2} />
      <circle cx={92} cy={260} r={6.5} strokeWidth={1.6} fill={CG.papel} />
      <path d="M85.5 259 L 64 262" strokeWidth={1.6} />
    </g>
  );
}

function Especificacion({ p }: { p: string }) {
  const rf = ["RF-01 Registrar causas", "RF-02 Cargar plazos", "RF-03 Ordenar listado", "RF-04 Emitir alertas"];
  return (
    <g>
      <Hoja p={p} w={176} h={252} />
      <text x={14} y={28} style={MONO_B} fontSize={12} letterSpacing={1} fill={CG.tinta}>
        ESPECIFICACIÓN
      </text>
      <text x={14} y={45} style={MONO} fontSize={10.5} fill={CG.gris}>
        de requerimientos · v1.0
      </text>
      <line x1={14} x2={162} y1={55} y2={55} stroke={CG.tinta} strokeWidth={0.8} />
      {rf.map((t, i) => (
        <text key={t} x={14} y={78 + i * 24} style={MONO} fontSize={11.5} fill={CG.tinta}>
          {t}
        </text>
      ))}
      <Barras x={14} y={176} anchos={[148, 120, 140, 90]} alto={3.5} sep={11} />
      <g transform="translate(112 226)">
        <Sello p={p} lineas={["APROBADO"]} w={112} h={36} fs={14} rot={-11} delay={0.55} />
      </g>
    </g>
  );
}

function Plan({ p }: { p: string }) {
  const tareas: [string, number, number, string][] = [
    ["análisis", 0, 1.6, CG.salvia],
    ["diseño", 1.2, 2.6, CG.azul],
    ["código", 2.2, 5, CG.azul2],
    ["pruebas", 4.4, 6, CG.ocre],
  ];
  const mx = (m: number) => 74 + m * 15.4;
  return (
    <g>
      <Hoja p={p} w={176} h={252} />
      <rect width={176} height={252} fill={url(p, "cuadricula")} />
      <text x={12} y={28} style={MONO_B} fontSize={12} letterSpacing={1} fill={CG.tinta}>
        PLAN DE TRABAJO
      </text>
      {["A", "M", "J", "J", "A", "S"].map((m, i) => (
        <text key={i} x={mx(i) + 7.7} y={52} textAnchor="middle" style={MONO_B} fontSize={10.5} fill={CG.gris}>
          {m}
        </text>
      ))}
      {tareas.map(([t, a, b, c], i) => (
        <g key={t}>
          <text x={12} y={82 + i * 28} style={MONO} fontSize={11} fill={CG.tinta}>
            {t}
          </text>
          <rect x={mx(a)} y={71 + i * 28} width={mx(b) - mx(a)} height={13} rx={3} fill={c} opacity={0.85} />
        </g>
      ))}
      <text x={12} y={216} style={DISPLAY} fontSize={22} fill={CG.tinta}>
        6 meses
      </text>
      <text x={12} y={237} style={MONO} fontSize={11.5} fill={CG.sepia}>
        presupuesto: $ 4.800.000
      </text>
    </g>
  );
}

const CODIGO_05 = [
  "PROCEDURE DIVISION.",
  " ORDENAR.",
  "  SORT CAUSAS",
  "   ON ASCENDING",
  "   KEY NRO-EXPTE.",
  "  PERFORM LISTAR.",
  " AVISAR.",
  "  IF DIAS < 3",
  '   DISPLAY "VENCE".',
  "  STOP RUN.",
];

function Impreso({ p }: { p: string }) {
  const W = 164;
  const H = 262;
  return (
    <g>
      <Hoja p={p} w={W} h={H} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={22} y={12 + i * 50} width={W - 44} height={25} fill={CG.carton} opacity={0.45} />
      ))}
      <line x1={20} x2={20} y1={0} y2={H} stroke={CG.niebla} strokeDasharray="2 4" />
      <line x1={W - 20} x2={W - 20} y1={0} y2={H} stroke={CG.niebla} strokeDasharray="2 4" />
      <Perforaciones x={10} y0={12} y1={H - 8} sep={21} r={4} />
      <Perforaciones x={W - 10} y0={12} y1={H - 8} sep={21} r={4} />
      {CODIGO_05.map((l, i) => (
        <text key={i} x={25} y={30 + i * 22} style={MONO} fontSize={10.5} fill={CG.tinta} xmlSpace="preserve">
          {l}
        </text>
      ))}
    </g>
  );
}

function TarjetaPerforada() {
  return (
    <g>
      <path d="M12 0 H150 V70 H0 V12 Z" fill="#e6d6b2" stroke={CG.sepia} strokeOpacity={0.3} />
      {Array.from({ length: 22 }, (_, c) =>
        [0, 1, 2, 3, 4, 5].map((r) =>
          (c * 7 + r * 3) % 5 === 0 ? <rect key={`${c}-${r}`} x={10 + c * 6.2} y={10 + r * 9.5} width={2.6} height={5.5} fill={CG.sepia} opacity={0.55} /> : null,
        ),
      )}
    </g>
  );
}

function Ventana95({ marca }: { marca: boolean }) {
  const W = 212;
  const filas = [
    ["0412/19", "Díaz", "28/10"],
    ["1234/25", "Pérez", "14/10"],
    ["2210/24", "López", "21/10"],
  ];
  const bisel = (x: number, y: number, w: number, t: string) => (
    <g>
      <rect x={x} y={y} width={w} height={22} fill={CG.niebla} stroke={CG.tinta} strokeWidth={1} />
      <path d={`M${x + 1} ${y + 21} V${y + 1} H${x + w - 1}`} fill="none" stroke={CG.blanco} strokeWidth={1.5} />
      <text x={x + w / 2} y={y + 15} textAnchor="middle" style={MONO} fontSize={11} fill={CG.tinta}>
        {t}
      </text>
    </g>
  );
  return (
    <g>
      <rect width={W} height={218} fill={CG.blanco} stroke={CG.tinta} strokeWidth={2} />
      <rect x={1} y={1} width={W - 2} height={24} fill={CG.azul2} />
      <rect x={4} y={4} width={18} height={18} fill={CG.niebla} stroke={CG.tinta} strokeWidth={1} />
      <rect x={8} y={12} width={10} height={2.5} fill={CG.tinta} />
      <text x={W / 2 + 6} y={18} textAnchor="middle" style={MONO_B} fontSize={12} fill={CG.blanco}>
        VENCIM.EXE
      </text>
      <line x1={0} x2={W} y1={46} y2={46} stroke={CG.tinta} strokeWidth={1} />
      <text x={8} y={40} style={MONO} fontSize={11} fill={CG.tinta}>
        Archivo  Causas  Ayuda
      </text>
      <rect x={8} y={54} width={W - 16} height={20} fill={CG.papel2} />
      <text x={12} y={68} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
        N° EXPTE ▲
      </text>
      <text x={98} y={68} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
        CAUSA
      </text>
      <text x={156} y={68} style={MONO_B} fontSize={10.5} fill={CG.tinta}>
        VENCE
      </text>
      {filas.map((f, i) => (
        <g key={f[0]}>
          <text x={12} y={96 + i * 24} style={MONO} fontSize={11} fill={CG.tinta}>
            {f[0]}
          </text>
          <text x={98} y={96 + i * 24} style={MONO} fontSize={11} fill={CG.tinta}>
            {f[1]}
          </text>
          <text x={156} y={96 + i * 24} style={MONO} fontSize={11} fill={CG.tinta}>
            {f[2]}
          </text>
          <line x1={8} x2={W - 8} y1={102 + i * 24} y2={102 + i * 24} stroke={CG.niebla} />
        </g>
      ))}
      {bisel(30, 178, 70, "Aceptar")}
      {bisel(112, 178, 76, "Cancelar")}
      {marca && (
        <g>
          <Traza d={ovalo(46, 63, 44, 15, -2.6)} color={CG.lacre} ancho={2.4} delay={1.6} dur={0.6} />
        </g>
      )}
    </g>
  );
}

export function P05Cadena({ paso, className }: PropsIlus) {
  const p = usePrefijo("c05");
  const E = [
    { x: 310, y: 70, w: 176, h: 252, cx: 398, label: "2 · ESPECIFICACIÓN" },
    { x: 536, y: 70, w: 176, h: 252, cx: 624, label: "3 · DESARROLLO" },
    { x: 762, y: 64, w: 164, h: 262, cx: 844, label: "4 · CÓDIGO" },
    { x: 978, y: 100, w: 212, h: 218, cx: 1084, label: "5 · INTERFAZ" },
  ];
  const visible = (i: number) => (i < 2 ? paso >= i + 2 : paso >= 4);
  const flechas = [
    { x1: 268, y1: 120, x2: 304, y2: 168, c: -8, desde: 2 },
    { x1: 492, y1: 196, x2: 530, y2: 196, c: -6, desde: 3 },
    { x1: 718, y1: 196, x2: 756, y2: 196, c: -6, desde: 4 },
    { x1: 932, y1: 200, x2: 972, y2: 206, c: -6, desde: 4 },
  ];
  return (
    <Lienzo
      w={1200}
      h={390}
      p={p}
      className={className}
      label="La cadena de traducción de antes: un abogado dice «Necesito un sistema que me ordene los vencimientos de mis causas»; eso pasa a una especificación aprobada, a un plan de desarrollo de seis meses, a un listado de código y, al final, a una ventana de computadora vieja que ordena las causas por número de expediente. Anotado a mano: no era exactamente eso."
    >
      {/* Contornos tenues de la cadena (lo que todavía no llegó). */}
      <g opacity={0.5}>
        {E.map((e, i) => (
          visible(i) ? null : <rect key={e.label} x={e.x} y={e.y} width={e.w} height={e.h} fill="none" stroke={CG.gris} strokeWidth={1.4} strokeDasharray="6 7" />
        ))}
        {flechas.map((f, i) => {
          return paso >= f.desde ? null : (
            <path
              key={i}
              d={`M${f.x1} ${f.y1} L${f.x2} ${f.y2}`}
              stroke={CG.gris}
              strokeWidth={1.6}
              strokeDasharray="3 6"
              fill="none"
            />
          );
        })}
      </g>
      <g className="cg-sube" style={retraso(0.5)}>
        <text x={208} y={372} textAnchor="middle" style={MONO} fontSize={13} letterSpacing={2} fill={CG.sepia}>
          1 · PROBLEMA
        </text>
        {E.map((e, i) => (
          <text
            key={e.label}
            x={e.cx}
            y={372}
            textAnchor="middle"
            style={MONO}
            fontSize={13}
            letterSpacing={2}
            fill={visible(i) ? CG.sepia : CG.gris}
            opacity={visible(i) ? 1 : 0.6}
            className="ilx-suave"
          >
            {e.label}
          </text>
        ))}
      </g>

      {/* 1 · El abogado y su problema (siempre). */}
      <Pieza x={0} y={0} d={0.05} anim="cg-sube">
        <Perfil />
      </Pieza>
      <Pieza x={0} y={0} d={0.25}>
        <path
          d="M40 22 H240 Q262 22 262 44 V174 Q262 196 240 196 H124 L112 226 L94 196 H40 Q18 196 18 174 V44 Q18 22 40 22 Z"
          fill={CG.blanco}
          stroke={CG.sepia}
          strokeWidth={2.2}
          strokeLinejoin="round"
          filter={url(p, "sombra-chica")}
        />
      </Pieza>
      {paso >= 1 && (
        <g>
          <Resaltado x={36} y={113} w={160} h={24} delay={0.05} />
          <Resaltado x={36} y={145} w={112} h={24} delay={0.45} rot={0.6} />
        </g>
      )}
      <Sube d={0.55}>
        {BURBUJA.map((l, i) => (
          <text key={l} x={40} y={66 + i * 32} style={MANO_B} fontSize={26} fill={CG.tinta}>
            {l}
          </text>
        ))}
      </Sube>

      {/* 2 · Especificación */}
      {paso >= 2 && (
        <g>
          <Pieza x={E[0].x} y={E[0].y} rot={-1.5} d={0.15}>
            <Especificacion p={p} />
          </Pieza>
        </g>
      )}
      {/* 3 · Desarrollo */}
      {paso >= 3 && (
        <Pieza x={E[1].x} y={E[1].y} rot={1.5} d={0.15}>
          <Plan p={p} />
        </Pieza>
      )}
      {/* 4 · El software: código e interfaz */}
      {paso >= 4 && (
        <g>
          <Pieza x={E[2].x + 40} y={E[2].y - 36} rot={8} d={0.05}>
            <TarjetaPerforada />
          </Pieza>
          <Pieza x={E[2].x} y={E[2].y} rot={-1} d={0.2}>
            <Impreso p={p} />
          </Pieza>
          <Pieza x={E[3].x} y={E[3].y} rot={0.8} d={0.75}>
            <Ventana95 marca />
          </Pieza>
          <Sube d={1.9}>
            <g transform="translate(1086 58) rotate(-3)">
              <text x={0} y={0} textAnchor="middle" style={MANO_B} fontSize={26} fill={CG.lacre}>
                no era exactamente eso
              </text>
            </g>
          </Sube>
          <Flecha x1={1008} y1={70} x2={1016} y2={148} curva={14} color={CG.lacre} ancho={2.4} delay={2.2} cab={10} />
        </g>
      )}

      {/* Flechas de cada traducción, con su malentendido posible. */}
      {flechas.map((f, i) =>
        paso >= f.desde ? (
          <g key={i}>
            <Flecha x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} curva={f.c} color={CG.sepia} ancho={2.6} delay={i === 3 ? 0.55 : 0.05} cab={11} />
            <Sube d={i === 3 ? 1.2 : 0.7}>
              <text x={(f.x1 + f.x2) / 2 + 2} y={Math.min(f.y1, f.y2) - 16} textAnchor="middle" style={MANO_B} fontSize={24} fill={CG.lacre} opacity={0.75}>
                ?
              </text>
            </Sube>
          </g>
        ) : null,
      )}
    </Lienzo>
  );
}
