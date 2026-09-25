"use client";

// Piezas de la sala de control del Congreso (/congreso/clase): datos en vivo,
// folio, anillo de texto de las curvas, QR, contador, nube, barras y fichas.
// Todo en rem (la raíz escala con la pantalla, ver .deck-escala) o SVG con viewBox.

import { Fragment, useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CONG_LINK, CONG_NUBE_EJEMPLO, CONG_QR, type ResultadosCong } from "@/lib/congreso";
import { cn } from "@/lib/utils";
import { CG, FUENTE } from "./paleta";

/** style con variables CSS (--rot, --largo, --dur) y demoras. */
export const vars = (o: Record<string, string | number>) => o as CSSProperties;
export const dos = (n: number) => String(n).padStart(2, "0");
export const porc = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
export const suma = (c: Record<string, number> | undefined) => Object.values(c ?? {}).reduce((a, b) => a + b, 0);

// --- Datos en vivo -----------------------------------------------------------------------
// Al cambiar de placa el componente se vuelve a montar: se recuerda el último dato
// de cada interacción para que nada arranque vacío (y si la red falla, se conserva).

const MEMORIA = new Map<string, ResultadosCong>();

export function useVivo(activity: string | undefined, intervalo = 1500): ResultadosCong | null {
  const [data, setData] = useState<ResultadosCong | null>(() => (activity ? (MEMORIA.get(activity) ?? null) : null));
  useEffect(() => {
    if (!activity) return;
    let vivo = true;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      try {
        const r = await fetch(`/api/congreso/resultados?activity=${activity}`, { cache: "no-store", signal: ctrl.signal });
        if (r.ok && vivo) {
          const d = (await r.json()) as ResultadosCong;
          MEMORIA.set(activity!, d);
          setData(d);
        }
      } catch {
        /* se mantiene el último dato */
      } finally {
        clearTimeout(t);
      }
      if (vivo) timer = setTimeout(tick, intervalo);
    }
    tick();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [activity, intervalo]);
  return activity ? (data?.activity === activity ? data : (MEMORIA.get(activity) ?? null)) : null;
}

/** Después de reiniciar la sesión: que no quede nada del ensayo. */
export function olvidarVivo() {
  MEMORIA.clear();
}

// --- Marco de placa ----------------------------------------------------------------------

/** Márgenes de la placa, folio arriba y el contenido ocupando el resto. */
export function Hoja({ folio, children, className }: { folio?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className="flex h-full flex-col px-[4.5rem] pb-[0.6rem] pt-[1.9rem]">
      <div className="flex h-[2.4rem] shrink-0 items-start pr-[18rem]">{folio}</div>
      <div className={cn("relative min-h-0 flex-1", className)}>{children}</div>
    </div>
  );
}

/** "FOJA 04 —— MOVIMIENTO": número de placa como folio de expediente. */
export function Folio({ numero, rotulo, extra, acento }: { numero?: number; rotulo: string; extra?: string; acento?: boolean }) {
  return (
    <div className="flex items-center gap-[0.9rem] cg-mono text-[0.74rem] uppercase tracking-[0.2em] text-cg-sepia">
      {numero != null && (
        <span className={cn("rounded-[0.2rem] border px-[0.45rem] py-[0.1rem] tabular-nums", acento ? "border-cg-lacre text-cg-lacre" : "border-cg-sepia/40")}>
          fs. {dos(numero)}
        </span>
      )}
      <span className={cn(acento && "text-cg-lacre")}>{rotulo}</span>
      {extra && (
        <>
          <span className="h-px w-[2rem] bg-cg-sepia/30" />
          <span className="text-cg-gris">{extra}</span>
        </>
      )}
    </div>
  );
}

/** Tamaño de título (rem) según el largo, para que entre en `renglones` líneas del ancho dado. */
export function tamTitulo(texto: string, anchoRem: number, max: number, min = 3, renglones = 3) {
  const largo = Math.max(...texto.split(/\s+/).map((w) => w.length), texto.length / renglones);
  return Math.max(min, Math.min(max, anchoRem / (largo * 0.54)));
}

// --- Anillo de texto (curvas) -------------------------------------------------------------

/**
 * Texto circular que gira lento: la señal de curva (frenar, sintetizar, cambiar
 * de dirección). El centro queda vacío a propósito, o con `centro` si se pasa.
 */
export function Anillo({ texto, centro, dur = 90, tinta = CG.tinta }: { texto: string; centro?: ReactNode; dur?: number; tinta?: string }) {
  const id = `anillo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const R = 440;
  const C = 2 * Math.PI * R;
  const FS = 46;
  const partes = texto
    .toUpperCase()
    .split("·")
    .map((p) => p.trim())
    .filter(Boolean);
  const unidad = partes.join(" · ").length + 3;
  const reps = Math.max(1, Math.round(C / (unidad * FS * 0.62)));
  const trozos = Array.from({ length: reps }, () => partes).flat();
  return (
    <div className="relative h-full w-full">
      <svg viewBox="0 0 1000 1000" className="h-full w-full overflow-visible" aria-hidden>
        <defs>
          <path id={id} d={`M ${500 - R},500 a ${R},${R} 0 1,1 ${2 * R},0 a ${R},${R} 0 1,1 ${-2 * R},0`} />
        </defs>
        <circle cx={500} cy={500} r={392} fill="none" stroke={CG.niebla} strokeWidth={1.5} />
        <circle cx={500} cy={500} r={494} fill="none" stroke={CG.niebla} strokeWidth={1} strokeDasharray="2 10" />
        <g className="cg-gira" style={vars({ "--dur": `${dur}s`, transformOrigin: "500px 500px", transformBox: "view-box" })}>
          <text fill={tinta} fontSize={FS} fontWeight={600} letterSpacing={5} style={{ fontFamily: FUENTE.mono, whiteSpace: "pre" }}>
            <textPath href={`#${id}`} textLength={C - 6} lengthAdjust="spacing">
              {trozos.map((t, i) => (
                <Fragment key={i}>
                  {t}
                  <tspan fill={CG.lacre}> · </tspan>
                </Fragment>
              ))}
            </textPath>
          </text>
          <circle cx={500} cy={500 - 392} r={8} fill={CG.lacre} />
        </g>
      </svg>
      {centro && <div className="absolute inset-[16%] grid place-items-center text-center">{centro}</div>}
    </div>
  );
}

// --- En vivo -----------------------------------------------------------------------------

export function Latido({ className }: { className?: string }) {
  return (
    <span className={cn("relative inline-flex size-[0.6rem] shrink-0", className)} aria-hidden>
      <span className="absolute inset-0 animate-ping rounded-full bg-cg-lacre/50" />
      <span className="relative size-full rounded-full bg-cg-lacre" />
    </span>
  );
}

/** El QR con la dirección para escribir a mano. */
export function BloqueQR({ tam = 13, className }: { tam?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-[1.2rem]", className)}>
      <div className="cg-hoja relative shrink-0 rounded-[0.4rem] p-[0.6rem]" style={{ width: `${tam}rem`, height: `${tam}rem` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CONG_QR} alt={`Código QR: ${CONG_LINK}`} className="h-full w-full" />
        <span className="cg-cinta absolute -top-[0.6rem] left-1/2 h-[1.3rem] w-[5rem] -translate-x-1/2 -rotate-2" />
      </div>
      <div className="min-w-0">
        <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-sepia">Sin registro · sin nombre</p>
        <p className="mt-[0.3rem] cg-mono text-[1.25rem] font-medium tracking-[0.02em] text-cg-tinta">{CONG_LINK}</p>
      </div>
    </div>
  );
}

/** "37 respondieron · de 52 conectados" + casillas que se van llenando. */
export function ContadorVivo({ data, className }: { data: ResultadosCong | null; className?: string }) {
  const n = data?.respondieron ?? 0;
  const total = Math.max(data?.participantes ?? 0, n);
  const casillas = Math.min(total, 80);
  const llenas = total > 80 ? Math.round((n / total) * 80) : n;
  return (
    <div className={cn("flex flex-col gap-[0.6rem]", className)}>
      <div className="flex items-baseline gap-[0.8rem]">
        <Latido className="self-center" />
        <span className="cg-titular text-[3.4rem] leading-none tabular-nums text-cg-tinta">{n}</span>
        <span className="cg-bajada text-[1.35rem] text-cg-sepia">
          {n === 1 ? "respondió" : "respondieron"}
          {total > 0 && <> · de {total} conectados</>}
        </span>
      </div>
      {casillas > 0 && (
        <div className="flex max-w-[28rem] flex-wrap gap-[0.22rem]" aria-hidden>
          {Array.from({ length: casillas }, (_, i) => (
            <span key={i} className={cn("size-[0.62rem] rounded-[0.1rem] transition-colors duration-500", i < llenas ? "bg-cg-tinta" : "border border-cg-sepia/35")} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Botón de la placa que también se toca desde el control remoto. */
export function BotonPlaca({
  children,
  onClick,
  activo,
  remoto,
  className,
}: {
  children: ReactNode;
  onClick: () => void;
  activo?: boolean;
  /** Etiqueta en el control remoto (si falta, no se publica). */
  remoto?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      {...(remoto ? { "data-remoto": remoto, "data-activo": activo ? "1" : undefined } : {})}
      className={cn(
        "inline-flex items-center gap-[0.5rem] rounded-full border px-[1rem] py-[0.45rem] cg-mono text-[0.74rem] uppercase tracking-[0.16em] transition",
        activo ? "border-cg-tinta bg-cg-tinta text-cg-blanco" : "border-cg-tinta/25 bg-cg-blanco/70 text-cg-sepia hover:border-cg-tinta/60 hover:text-cg-tinta",
        className,
      )}
    >
      {children}
    </button>
  );
}

// --- Nube de palabras ------------------------------------------------------------------------

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TONOS = [CG.tinta, CG.azul2, CG.musgo, CG.lacre, CG.sepia];

/**
 * Nube: los términos más mencionados, más grandes y al centro. Sin respuestas
 * muestra una nube de ejemplo apagada (la pantalla nunca queda vacía).
 */
export function Nube({
  nube,
  maxRem = 5.2,
  minRem = 1.3,
  apagada,
  className,
}: {
  nube: { termino: string; n: number }[] | undefined;
  maxRem?: number;
  minRem?: number;
  apagada?: boolean;
  className?: string;
}) {
  const lista = nube?.length ? nube : null;
  const ejemplo = !lista;
  const datos = lista ?? CONG_NUBE_EJEMPLO.map((t, i) => ({ termino: t, n: CONG_NUBE_EJEMPLO.length - i }));
  const max = Math.max(1, ...datos.map((p) => p.n));
  // Las más votadas al centro: se alternan a izquierda y derecha.
  const orden = [...datos].sort((a, b) => b.n - a.n || a.termino.localeCompare(b.termino));
  const centro: typeof orden = [];
  orden.forEach((p, i) => (i % 2 ? centro.push(p) : centro.unshift(p)));
  const k = datos.length > 22 ? 0.72 : datos.length > 14 ? 0.85 : 1;
  return (
    <Ajustar className={className} firma={centro.map((p) => `${p.termino}:${p.n}`).join("|")}>
      {centro.map((p) => {
        const h = hash(p.termino);
        const tam = (minRem + (maxRem - minRem) * Math.sqrt(p.n / max)) * k;
        const color = ejemplo || apagada ? CG.gris : TONOS[h % TONOS.length];
        return (
          <span
            key={p.termino}
            className="cg-sube inline-block leading-[0.95] transition-all duration-700"
            style={{
              fontSize: `${tam}rem`,
              color,
              opacity: ejemplo ? 0.28 : apagada ? 0.5 : 1,
              fontFamily: FUENTE.display,
              fontWeight: p.n === max && !ejemplo ? 800 : 600,
              fontStyle: h % 5 === 0 ? "italic" : "normal",
              transform: `rotate(${((h % 5) - 2) * 0.7}deg)`,
            }}
            title={`${p.n}`}
          >
            {p.termino}
          </span>
        );
      })}
      {ejemplo && !apagada && (
        <span className="w-full pt-[1rem] text-center cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">
          Así se va a ver · esperando las primeras respuestas
        </span>
      )}
    </Ajustar>
  );
}

/**
 * Caja que achica su contenido (sin cortarlo) si no entra: la nube crece con
 * el público y nunca tiene que tapar el resto de la placa.
 */
function Ajustar({ children, className, firma }: { children: ReactNode; className?: string; firma: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const dentro = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  useLayoutEffect(() => {
    // Busca la escala en la que entra todo: de alto (las filas) y de ancho (la palabra más larga).
    // Al achicar, la caja interna se ensancha (100/escala %), así que se prueba de a pasos.
    const medir = () => {
      const c = caja.current;
      const d = dentro.current;
      if (!c || !d || !c.clientHeight) return;
      let e = 1;
      for (let i = 0; i < 12; i++) {
        d.style.width = `${100 / e}%`;
        const anchoMax = Math.max(0, ...[...d.children].map((x) => (x as HTMLElement).offsetWidth));
        const altoOk = d.scrollHeight * e <= c.clientHeight;
        const anchoOk = anchoMax <= d.clientWidth + 1;
        if (altoOk && anchoOk) break;
        const porAlto = altoOk ? 1 : c.clientHeight / (d.scrollHeight * e);
        e = Math.max(0.3, e * Math.min(0.94, porAlto));
        if (e === 0.3) break;
      }
      d.style.width = `${100 / e}%`;
      setEscala(e);
    };
    medir();
    const ro = new ResizeObserver(medir);
    if (caja.current) ro.observe(caja.current);
    return () => ro.disconnect();
  }, [firma]);
  return (
    <div ref={caja} className={cn("relative flex h-full w-full items-center justify-center overflow-hidden", className)}>
      <div
        ref={dentro}
        className="flex w-full flex-wrap content-center items-center justify-center gap-x-[1.5rem] gap-y-[0.35rem] transition-transform duration-500"
        style={{ transform: `scale(${escala})`, width: `${100 / escala}%` }}
      >
        {children}
      </div>
    </div>
  );
}

// --- Fichas (frases) ------------------------------------------------------------------------

/** Frases como fichas de papel que van cayendo (la más nueva primero). */
export function Fichas({ frases, max = 9, className, tono = "tinta" }: { frases: string[]; max?: number; className?: string; tono?: "tinta" | "lacre" }) {
  const vistas = frases.slice(0, max);
  return (
    <div className={cn("grid auto-rows-min grid-cols-2 gap-[0.8rem]", className)}>
      {vistas.map((f, i) => (
        <div
          key={`${f}-${i}`}
          className={cn("cg-hoja cg-cae relative rounded-[0.25rem] px-[1rem] py-[0.7rem]", tono === "lacre" && "border-l-[0.25rem] border-cg-lacre")}
          style={vars({ "--rot": `${((hash(f) % 5) - 2) * 0.5}deg`, animationDelay: `${Math.min(i, 6) * 0.05}s` })}
        >
          <p className="cg-bajada text-[1.2rem] leading-snug text-cg-tinta">“{f}”</p>
        </div>
      ))}
    </div>
  );
}

// --- Máquina de escribir -----------------------------------------------------------------------

/** Texto que se escribe solo (al montar, o cuando `activo` pasa a true). */
export function Tipeo({ texto, activo = true, cps = 38, className }: { texto: string; activo?: boolean; cps?: number; className?: string }) {
  const [n, setN] = useState(activo ? 0 : texto.length);
  const previo = useRef(activo);
  useEffect(() => {
    if (activo && !previo.current) setN(0);
    previo.current = activo;
  }, [activo]);
  useEffect(() => {
    if (!activo || n >= texto.length) return;
    const t = setTimeout(() => setN((x) => Math.min(texto.length, x + 1 + (texto[x] === " " ? 1 : 0))), 1000 / cps);
    return () => clearTimeout(t);
  }, [activo, n, texto, cps]);
  const listo = n >= texto.length;
  return (
    <span className={className}>
      {texto.slice(0, n)}
      <span className={cn("ml-[0.05em] inline-block w-[0.5em] translate-y-[0.1em] bg-cg-lacre", listo ? "cg-cursor" : "")} style={{ height: "1em" }} aria-hidden />
    </span>
  );
}

/** Copiar al portapapeles (con el método viejo si no hay permiso). */
export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function BotonCopiar({ texto, etiqueta = "Copiar instrucción", remoto }: { texto: string; etiqueta?: string; remoto?: string }) {
  const [estado, setEstado] = useState<"nada" | "ok" | "error">("nada");
  return (
    <BotonPlaca
      remoto={remoto}
      onClick={async () => {
        setEstado((await copiar(texto)) ? "ok" : "error");
        setTimeout(() => setEstado("nada"), 1800);
      }}
    >
      {estado === "ok" ? "¡Copiada!" : estado === "error" ? "No se pudo" : etiqueta}
    </BotonPlaca>
  );
}
