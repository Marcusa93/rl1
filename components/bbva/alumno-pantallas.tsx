"use client";

// Pantallas fijas de la app del participante (Laboratorio de IA · BBVA):
// ingreso con el área, espera ("Mirá la pantalla"), encabezado y aviso de guardado.

import Image from "next/image";
import { BBVA_ACTIVIDADES, BBVA_AREAS, BBVA_AUTOR, BBVA_LOGO, BBVA_TITLE, type Area } from "@/lib/bbva-clase";
import { Girando, cx } from "./alumno-ui";

export type EstadoGuardado = "nada" | "guardando" | "guardado" | "error";

function Logo({ alto }: { alto: number }) {
  return (
    <Image
      src={BBVA_LOGO}
      alt="BBVA"
      width={Math.round((alto * 800) / 277)}
      height={alto}
      unoptimized
      loading="eager"
      className="w-auto mix-blend-multiply"
      style={{ height: alto }}
    />
  );
}

// --- Ingreso ----------------------------------------------------------------------------

export function Ingreso({
  onElegir,
  entrando,
  error,
  aviso,
  reconectando,
}: {
  onElegir: (a: Area) => void;
  entrando: string | null;
  error: string | null;
  aviso: string | null;
  reconectando: boolean;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-[calc(env(safe-area-inset-top)+1.5rem)]">
      <div className="bbva-cae flex items-center justify-between">
        <Logo alto={28} />
        {reconectando && <Reconectando />}
      </div>

      <div className="bbva-cae mt-5" style={{ animationDelay: "0.08s" }}>
        <h1 className="bbva-titular text-[3.25rem] leading-[0.84] text-tinta">
          Laboratorio
          <br />
          de IA
        </h1>
        <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.2em] text-grafito">Clase inicial · {BBVA_AUTOR}</p>
      </div>

      <section className="mt-7" aria-labelledby="pregunta-area">
        <h2 id="pregunta-area" className="bbva-titular text-[2.2rem] text-tinta">
          ¿En qué área trabajás?
        </h2>
        <p className="bbva-serif mt-1.5 text-[1.18rem] italic leading-snug text-grafito">Elegí la más cercana. No te pedimos el nombre.</p>
        {aviso && (
          <p role="status" className="bbva-mano mt-3 text-[1.3rem] leading-tight text-rojo">
            {aviso}
          </p>
        )}

        <ul className="mt-5 flex flex-col gap-2">
          {BBVA_AREAS.map((a, i) => {
            const esta = entrando === a.id;
            return (
              <li key={a.id} className="bbva-cae" style={{ animationDelay: `${0.16 + i * 0.06}s` }}>
                <button
                  type="button"
                  onClick={() => onElegir(a)}
                  disabled={!!entrando}
                  aria-busy={esta}
                  className={cx(
                    "alu-boton flex min-h-14 w-full items-center gap-3 rounded-[4px] border-[1.5px] px-3 py-1.5 text-left",
                    esta ? "alu-hundido border-tinta bg-tinta text-papel" : "alu-sombra border-tinta bg-blanco text-tinta",
                    entrando && !esta && "opacity-50",
                  )}
                >
                  <span
                    className={cx("grid size-9 shrink-0 place-items-center rounded-[3px] text-[1.2rem]", esta ? "bg-papel/15" : "bg-papel-2")}
                    aria-hidden="true"
                  >
                    {a.emoji}
                  </span>
                  <span className="bbva-titular min-w-0 flex-1 text-[1.5rem] leading-[0.95]">{a.label}</span>
                  {esta ? (
                    <Girando chico />
                  ) : (
                    <span aria-hidden="true" className="font-mono text-[1.1rem] text-gris">
                      →
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        {error && (
          <p role="alert" className="mt-3 font-mono text-[12px] leading-snug text-rojo">
            {error}
          </p>
        )}
      </section>

      <p className="bbva-mano mt-auto pt-7 text-[1.35rem] leading-tight text-naranja" style={{ transform: "rotate(-1.5deg)" }}>
        Entrás una sola vez: esta pantalla te acompaña toda la clase.
      </p>
    </main>
  );
}

// --- Encabezado fijo ---------------------------------------------------------------------

export function Encabezado({ centro, area, reconectando }: { centro: string; area?: Area; reconectando: boolean }) {
  return (
    <header className="sticky top-0 z-30 border-b border-tinta/10 bg-papel/90 pt-[env(safe-area-inset-top)] backdrop-blur-sm">
      <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between gap-3 px-4">
        <Logo alto={17} />
        <p className="min-w-0 flex-1 truncate text-center font-mono text-[10.5px] uppercase tracking-[0.16em] text-grafito">
          {reconectando ? <Reconectando /> : centro}
        </p>
        {area ? (
          <span className="flex max-w-[8.5rem] shrink-0 items-center gap-1.5 rounded-full border border-tinta/15 bg-blanco/70 px-2.5 py-1 text-[12px] leading-none text-grafito">
            <span aria-hidden="true">{area.emoji}</span>
            <span className="truncate">{area.corto}</span>
          </span>
        ) : (
          <span className="w-10" />
        )}
      </div>
    </header>
  );
}

function Reconectando() {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.16em] text-naranja" role="status">
      <span className="alu-latido size-1.5 rounded-full bg-naranja" aria-hidden="true" />
      reconectando…
    </span>
  );
}

// --- Aviso de guardado (sutil) ---------------------------------------------------------------

export function AvisoGuardado({ estado, onReintentar }: { estado: EstadoGuardado; onReintentar: () => void }) {
  if (estado === "nada") return null;
  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 flex justify-end px-3"
      style={{ top: "calc(env(safe-area-inset-top) + 3.4rem)" }}
      aria-live="polite"
    >
      {estado === "error" ? (
        <button
          type="button"
          onClick={onReintentar}
          className="alu-aparece alu-boton pointer-events-auto rounded-full border border-naranja/50 bg-blanco px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-naranja shadow-sm"
        >
          sin conexión · reintentando
        </button>
      ) : (
        <span
          key={estado}
          className="alu-aparece rounded-full bg-papel-2/95 px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-grafito shadow-sm"
        >
          {estado === "guardando" ? "guardando…" : "guardado ✓"}
        </span>
      )}
    </div>
  );
}

// --- Espera: "Mirá la pantalla" ---------------------------------------------------------------

export function Espera({
  area,
  enPantalla,
  conectados,
  hechas,
  onVerTarjeta,
}: {
  area?: Area;
  enPantalla: string | null;
  conectados: number;
  /** Actividades respondidas completas (por clave). */
  hechas: Set<string>;
  onVerTarjeta?: () => void;
}) {
  return (
    <section className="flex flex-col items-center pt-4 text-center">
      <IlusMira />
      <h1 className="bbva-titular mt-5 text-[3.3rem] text-tinta">Mirá la pantalla</h1>
      <p className="bbva-serif mt-2 max-w-[19rem] text-[1.2rem] italic leading-snug text-grafito">
        Cuando se abra una actividad, esta pantalla cambia sola. No tenés que tocar nada.
      </p>

      {enPantalla && (
        <div
          key={enPantalla}
          className="bbva-recorte bbva-cae relative mt-8 w-full rounded-[3px] px-4 pb-3.5 pt-4 text-left"
          style={{ "--rot": "-0.8deg" } as React.CSSProperties}
        >
          <span className="bbva-cinta absolute -top-2.5 left-6 h-5 w-16 -rotate-6" aria-hidden="true" />
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris">Ahora en pantalla</p>
          <p className="bbva-titular mt-1.5 text-[1.65rem] leading-[0.95] text-tinta">{enPantalla}</p>
        </div>
      )}

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2 text-[13px] text-grafito">
        {area && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-tinta/20 bg-blanco px-3 py-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-gris">Tu área</span>
            <span aria-hidden="true">{area.emoji}</span>
            <span>{area.label}</span>
          </span>
        )}
        {conectados > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-gris">
            <span className="size-1.5 rounded-full bg-pizarra" aria-hidden="true" />
            {conectados} {conectados === 1 ? "persona conectada" : "personas conectadas"}
          </span>
        )}
      </div>

      {onVerTarjeta && (
        <button
          type="button"
          onClick={onVerTarjeta}
          className="alu-boton alu-sombra mt-8 flex min-h-14 w-full items-center justify-between gap-3 rounded-[4px] border-[1.5px] border-tinta bg-blanco px-4 py-3 text-left"
        >
          <span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-gris">Actividad 5</span>
            <span className="bbva-titular block text-[1.45rem] leading-none text-tinta">Mi tarjeta y mi hipótesis</span>
          </span>
          <span aria-hidden="true" className="font-mono text-[1.1rem] text-naranja">
            →
          </span>
        </button>
      )}

      {hechas.size > 0 && (
        <div className="mt-8 w-full">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gris">Tus actividades</p>
          <ol className="mt-2.5 flex justify-center gap-2">
            {BBVA_ACTIVIDADES.map((a) => {
              const lista = hechas.has(a.key);
              return (
                <li
                  key={a.key}
                  aria-label={`Actividad ${a.numero}${lista ? ": respondida" : ""}`}
                  className={cx(
                    "grid size-9 place-items-center rounded-[3px] border-[1.5px] font-mono text-[12px] font-semibold",
                    lista ? "border-tinta bg-tinta text-papel" : "border-dashed border-gris text-gris",
                  )}
                >
                  {lista ? "✓" : a.numero}
                </li>
              );
            })}
          </ol>
        </div>
      )}


      <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.2em] text-niebla">{BBVA_TITLE} · BBVA</p>
    </section>
  );
}

/** El celular señala la pantalla grande (trazo a mano que se dibuja). */
function IlusMira() {
  return (
    <svg viewBox="0 0 280 160" className="w-[15.5rem] max-w-full" role="img" aria-label="Un celular y una flecha a mano que señala la pantalla grande">
      {/* pantalla del aula */}
      <rect x="110" y="12" width="156" height="96" fill="#fbfaf7" stroke="#17181b" strokeWidth="1.5" />
      <rect x="124" y="28" width="80" height="10" fill="#17181b" />
      <rect x="124" y="43" width="54" height="10" fill="#17181b" />
      <rect x="124" y="63" width="70" height="2.5" fill="#8a8d94" />
      <rect x="124" y="70" width="52" height="2.5" fill="#8a8d94" />
      <rect x="214" y="78" width="9" height="18" fill="#5d7087" />
      <rect x="227" y="66" width="9" height="30" fill="#e2582b" />
      <rect x="240" y="84" width="9" height="12" fill="#5d7087" />
      <path d="M188 108v20M168 136l20-8 20 8" fill="none" stroke="#17181b" strokeWidth="1.5" strokeLinecap="round" />
      {/* celular */}
      <rect x="24" y="78" width="46" height="76" rx="7" fill="#fbfaf7" stroke="#17181b" strokeWidth="1.5" />
      <rect x="30" y="88" width="34" height="52" fill="#e8e2d6" />
      <rect x="34" y="93" width="26" height="8" fill="#17181b" />
      <rect x="34" y="105" width="26" height="8" fill="none" stroke="#17181b" strokeWidth="1.2" />
      <rect x="34" y="117" width="26" height="8" fill="none" stroke="#17181b" strokeWidth="1.2" />
      <path d="M40 147h14" stroke="#17181b" strokeWidth="1.5" strokeLinecap="round" />
      {/* flecha a mano */}
      <path
        className="bbva-traza"
        style={{ "--largo": 150 } as React.CSSProperties}
        d="M52 72c-2-24 14-40 50-34"
        fill="none"
        stroke="#e2582b"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <path
        className="bbva-traza"
        style={{ "--largo": 40, animationDelay: "1.1s" } as React.CSSProperties}
        d="M92 30l11 8-10 8"
        fill="none"
        stroke="#e2582b"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <text x="18" y="46" fontFamily="var(--font-caveat)" fontSize="22" fill="#e2582b" transform="rotate(-8 18 46)">
        mirá
      </text>
    </svg>
  );
}

export function Cargando({ texto }: { texto: string }) {
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-6">
      <Girando texto={texto} />
    </main>
  );
}

