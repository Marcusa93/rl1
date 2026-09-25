"use client";

// Piezas chicas de la app del participante (Laboratorio de IA · BBVA):
// botones-recorte, puntos de progreso, sellos, íconos de trazo y el resaltado
// de las palabras en MAYÚSCULAS de la tarjeta. Todo sobre papel, nada de neón.

import { Fragment, type ReactNode } from "react";

export type Valor = string | string[];
/** Respuestas de una actividad: item_key → valor. */
export type RespAct = Record<string, Valor>;

export interface PropsActividad<A> {
  act: A;
  resp: RespAct;
  /** Guarda al toque (demora = debounce en ms). */
  guardar: (item: string, v: Valor, demora?: number) => void;
  /** Título de la placa que se proyecta ahora (o null). */
  enPantalla: string | null;
}

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function comoTexto(v: Valor | undefined): string {
  return typeof v === "string" ? v : "";
}

export function comoLista(v: Valor | undefined): string[] {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string") : typeof v === "string" && v ? [v] : [];
}

export function respondido(v: Valor | undefined): boolean {
  return Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.length > 0;
}

export function esperar(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** Estilos propios de la app del celular (animaciones y fondo de papel en toda la página). */
export function EstilosAlumno() {
  return <style>{CSS}</style>;
}

const CSS = `
html, body { background: #f2eee6 !important; color-scheme: light; }
@keyframes alu-entra { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.alu-entra { animation: alu-entra .45s cubic-bezier(.2,.8,.2,1) both; }
@keyframes alu-desliza { from { opacity: 0; transform: translateX(32px) rotate(.8deg); } to { opacity: 1; transform: none; } }
.alu-desliza { animation: alu-desliza .38s cubic-bezier(.2,.8,.2,1) both; }
@keyframes alu-sacude { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(6px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(2px); } }
.alu-sacude { animation: alu-sacude .42s ease-in-out; }
@keyframes alu-sello { 0% { opacity: 0; transform: scale(1.5) rotate(-12deg); } 60% { opacity: 1; transform: scale(.94) rotate(-3deg); } 100% { opacity: 1; transform: scale(1) rotate(-5deg); } }
.alu-sello { animation: alu-sello .5s cubic-bezier(.2,.8,.2,1) both; }
@keyframes alu-latido { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
.alu-latido { animation: alu-latido 1.4s ease-in-out infinite; }
@keyframes alu-aparece { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; } }
.alu-aparece { animation: alu-aparece .25s ease-out both; }
.alu-boton { -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none;
  transition: transform .12s ease, background-color .18s ease, color .18s ease, border-color .18s ease, box-shadow .18s ease; }
.alu-boton:active:not(:disabled) { transform: translateY(1px) scale(.985); }
.alu-boton:focus-visible { outline: 2px solid #e2582b; outline-offset: 2px; }
.alu-sombra { box-shadow: 0 1px 0 rgba(0,0,0,.05), 0 10px 18px -14px rgba(40,30,10,.6); }
.alu-hundido { box-shadow: inset 0 2px 0 rgba(0,0,0,.18); }
.alu-renglon { background-image: linear-gradient(transparent calc(100% - 1.5px), rgba(69,72,79,.42) calc(100% - 1.5px)); background-size: 100% 1.85rem; line-height: 1.85rem; }
@media (prefers-reduced-motion: reduce) {
  .alu-entra, .alu-desliza, .alu-sacude, .alu-sello, .alu-latido, .alu-aparece { animation: none; }
}
`;

/** Botón-recorte: papel blanco con borde de tinta. Elegido = tinta (o naranja). */
export function BotonOpcion({
  activa,
  onClick,
  tono = "tinta",
  punteado = false,
  className,
  children,
  ariaLabel,
  disabled,
}: {
  activa: boolean;
  onClick: () => void;
  tono?: "tinta" | "naranja";
  punteado?: boolean;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      aria-label={ariaLabel}
      disabled={disabled}
      className={cx(
        "alu-boton relative flex min-h-14 w-full items-center rounded-[4px] border-[1.5px] px-4 py-3 text-left",
        activa
          ? tono === "naranja"
            ? "alu-hundido border-naranja bg-naranja text-blanco"
            : "alu-hundido border-tinta bg-tinta text-papel"
          : cx(
              "alu-sombra bg-blanco",
              tono === "naranja" ? "border-naranja text-naranja" : "text-tinta",
              punteado ? "border-dashed border-grafito" : tono === "naranja" ? "" : "border-tinta",
            ),
        className,
      )}
    >
      {children}
    </button>
  );
}

/** Puntos de progreso tocables (volver a un caso anterior). */
export function Puntos({
  total,
  actual,
  hechos,
  onIr,
  rotulo,
  nombre = "caso",
}: {
  total: number;
  actual: number | null;
  hechos: boolean[];
  onIr: (i: number) => void;
  rotulo: string;
  nombre?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <nav aria-label="Progreso" className="-ml-2.5 flex items-center">
        {Array.from({ length: total }, (_, i) => {
          const esActual = actual === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onIr(i)}
              aria-label={`Ir al ${nombre} ${i + 1}${hechos[i] ? " (respondido)" : ""}`}
              aria-current={esActual ? "step" : undefined}
              className="alu-boton grid size-10 place-items-center"
            >
              <span
                className={cx(
                  "block rounded-full transition-all duration-300",
                  esActual
                    ? "size-3.5 border-2 border-naranja bg-blanco"
                    : hechos[i]
                      ? "size-2.5 bg-tinta"
                      : "size-2.5 border-[1.5px] border-gris bg-transparent",
                )}
              />
            </button>
          );
        })}
      </nav>
      <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-grafito">{rotulo}</p>
    </div>
  );
}

/** Sello de goma: "LISTO". */
export function Sello({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "alu-sello inline-flex items-center gap-1.5 rounded-[3px] border-2 border-naranja px-2.5 py-1 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-naranja",
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Cartel de terminado: sello + "Mirá la pantalla." */
export function ListoCartel({ bajada, chico = false }: { bajada?: ReactNode; chico?: boolean }) {
  return (
    <div>
      <Sello>
        <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
          <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Listo
      </Sello>
      <h2 className={cx("bbva-titular text-tinta", chico ? "mt-3 text-[2.1rem]" : "mt-4 text-[2.9rem]")}>Mirá la pantalla.</h2>
      {bajada && <p className="bbva-serif mt-2 text-[1.15rem] italic leading-snug text-grafito">{bajada}</p>}
    </div>
  );
}

/** "Ahora en pantalla: …" (la placa que se proyecta). */
export function EnPantalla({ titulo, className }: { titulo: string | null; className?: string }) {
  if (!titulo) return null;
  return (
    <div className={cx("flex items-start gap-2.5 border-t border-dashed border-niebla pt-3", className)}>
      <IconoProyector className="mt-0.5 size-4 shrink-0 text-gris" />
      <p className="min-w-0 text-[0.95rem] leading-snug text-grafito">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-gris">Ahora en pantalla · </span>
        <span className="bbva-serif text-[1.05rem] italic">{titulo}</span>
      </p>
    </div>
  );
}

/** Spinner sobrio. */
export function Girando({ texto, chico = false }: { texto?: string; chico?: boolean }) {
  return (
    <span className="inline-flex flex-col items-center gap-3 text-grafito" role="status" aria-live="polite">
      <svg viewBox="0 0 24 24" className={cx("animate-spin", chico ? "size-5" : "size-7")} aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="#c9ccd1" strokeWidth="2" />
        <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      {texto && <span className="font-mono text-[11px] uppercase tracking-[0.18em]">{texto}</span>}
      {!texto && <span className="sr-only">Cargando</span>}
    </span>
  );
}

// --- Resaltado de la tarjeta -------------------------------------------------------

const MAYUS = /([A-ZÁÉÍÓÚÑÜ]{2,}(?:[ ,]+[A-ZÁÉÍÓÚÑÜ]+)*)/g;

/** Las palabras en MAYÚSCULAS de la tarjeta van resaltadas a mano (menos "IA" suelta). */
export function resaltar(texto: string): ReactNode[] {
  return texto.split(MAYUS).map((p, i) =>
    i % 2 === 1 && p !== "IA" ? (
      <span
        key={i}
        className="bbva-subrayado px-0.5 text-[0.86em] font-bold tracking-[0.01em] text-tinta"
        style={{ fontFamily: "var(--font-archivo), system-ui, sans-serif", fontStretch: "78%" }}
      >
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    ),
  );
}

// --- Íconos de trazo (sin robots ni cerebros) ----------------------------------------

type PropsIcono = { className?: string };

export function IconoPersona({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="img" aria-label="Persona">
      <circle cx="12" cy="7.5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 20.5c.8-4.2 3.8-6.6 7.5-6.6s6.7 2.4 7.5 6.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/** Ficha "IA": la IA como una pieza más del sistema. */
export function FichaIA({ className, clara = false }: { className?: string; clara?: boolean }) {
  return (
    <span
      className={cx(
        "inline-flex h-6 shrink-0 items-center rounded-[3px] border px-1.5 font-mono text-[10.5px] font-semibold tracking-[0.12em]",
        clara ? "border-cielo/80 text-cielo" : "border-pizarra text-pizarra",
        className,
      )}
      aria-label="Sistema con IA"
    >
      IA
    </span>
  );
}

export function IconoProyector({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 16v4M8.5 20.5h7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconoSobre({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 32 24" className={className} aria-hidden="true">
      <rect x="1.5" y="2" width="29" height="20" rx="1.5" fill="#fbfaf7" stroke="#17181b" strokeWidth="1.5" />
      <path d="M2.5 3.5L16 13.5 29.5 3.5" fill="none" stroke="#17181b" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="27" cy="4.5" r="4" fill="#e2582b" />
    </svg>
  );
}

export function IconoChat({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M4 4.5h16v11H10l-4.5 4v-4H4z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M8 9h8M8 12h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconoFlujo({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect x="1.5" y="9" width="5" height="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="9.5" y="9" width="5" height="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <rect x="17.5" y="9" width="5" height="6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M6.5 12h3M14.5 12h3" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 4.5l1.6 2.2L4 9" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconoObjetivo({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle cx="4.5" cy="19" r="2" fill="currentColor" />
      <path d="M6 17.5c2.5-2 2-5.5 5-6.5M11 11c2.2-.7 3-3 5.5-3.6M11 11c1.6 1.4 3.8 1.2 5.2 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2.2 2.2" />
      <path d="M18 3v8M18 3.5h4l-1.2 1.7L22 7h-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx="17.3" cy="15" r="1.3" fill="none" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function IconoFalta({ className }: PropsIcono) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M5 2.5h9.5L19 7v14.5H5z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9.6 10.2a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17.6" r="1.05" fill="currentColor" />
    </svg>
  );
}
