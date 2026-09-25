"use client";

// Piezas de la app del público (Congreso · Vibe coding para abogados):
// encabezado, espera, pregunta de texto, botones y la frase de seguimiento.
// Papel, tinta y lacre; botones grandes; nada que haya que explicar.

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ActividadOpciones, ActividadTexto, Item, Seguimiento } from "@/lib/congreso";

export type Resp = Record<string, string>;

export function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

/** Estilos propios del celular (animaciones y fondo en toda la página). */
export function EstilosPublico() {
  return <style>{CSS}</style>;
}

const CSS = `
html, body { background: #efe9dc !important; color-scheme: light; }
@keyframes pub-entra { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
.pub-entra { animation: pub-entra .42s cubic-bezier(.2,.8,.2,1) both; }
@keyframes pub-desliza { from { opacity: 0; transform: translateX(28px); } to { opacity: 1; transform: none; } }
.pub-desliza { animation: pub-desliza .36s cubic-bezier(.2,.8,.2,1) both; }
@keyframes pub-sello { 0% { opacity: 0; transform: scale(1.5) rotate(-12deg); } 60% { opacity: 1; transform: scale(.95) rotate(-3deg); } 100% { opacity: 1; transform: scale(1) rotate(-6deg); } }
.pub-sello { animation: pub-sello .5s cubic-bezier(.2,.8,.2,1) both; }
@keyframes pub-latido { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
.pub-latido { animation: pub-latido 1.4s ease-in-out infinite; }
.pub-boton { -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none; -webkit-user-select: none;
  transition: transform .12s ease, background-color .18s ease, color .18s ease, border-color .18s ease; }
.pub-boton:active:not(:disabled) { transform: translateY(1px) scale(.985); }
.pub-boton:focus-visible { outline: 2px solid #b3432b; outline-offset: 2px; }
.pub-sombra { box-shadow: 0 1px 0 rgba(0,0,0,.05), 0 10px 18px -14px rgba(60,40,12,.6); }
@media (prefers-reduced-motion: reduce) { .pub-entra, .pub-desliza, .pub-sello, .pub-latido { animation: none; } }
`;

export function vibrar(patron: number | number[]) {
  try {
    navigator.vibrate?.(patron);
  } catch {
    /* no todos vibran */
  }
}

// --- Encabezado y estados ---------------------------------------------------------

export function Encabezado({ centro, reconectando }: { centro: string; reconectando: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-cg-tinta/10 bg-cg-papel/92 backdrop-blur">
      <div className="mx-auto flex h-12 w-full max-w-md items-center justify-between gap-3 px-4">
        <span className="shrink-0 whitespace-nowrap cg-mono text-[10px] uppercase tracking-[0.18em] text-cg-sepia">Vibe coding</span>
        <span className="min-w-0 truncate cg-mono text-[10px] uppercase tracking-[0.16em] text-cg-tinta">{centro}</span>
        <span className={cx("flex shrink-0 items-center gap-1.5 whitespace-nowrap cg-mono text-[10px] uppercase tracking-[0.14em]", reconectando ? "text-cg-lacre" : "text-cg-musgo")}>
          <span className={cx("size-2 rounded-full", reconectando ? "pub-latido bg-cg-lacre" : "bg-cg-salvia")} />
          {reconectando ? "sin red" : "en vivo"}
        </span>
      </div>
    </header>
  );
}

export function Girando({ texto }: { texto: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-cg-sepia">
      <span className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="pub-latido size-2.5 rounded-full bg-cg-tinta" style={{ animationDelay: `${i * 0.18}s` }} />
        ))}
      </span>
      <span className="cg-mono text-xs uppercase tracking-[0.2em]">{texto}</span>
    </div>
  );
}

export type EstadoGuardado = "nada" | "guardando" | "guardado" | "error";

export function AvisoGuardado({ estado, onReintentar }: { estado: EstadoGuardado; onReintentar: () => void }) {
  if (estado === "nada") return null;
  return (
    // Encima de la botonera de emojis.
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+6.2rem)] z-30 flex justify-center px-4">
      <button
        type="button"
        onClick={estado === "error" ? onReintentar : undefined}
        className={cx(
          "pub-entra pointer-events-auto rounded-full border px-4 py-2 cg-mono text-[11px] uppercase tracking-[0.16em] shadow-sm",
          estado === "error" ? "border-cg-lacre/40 bg-cg-blanco text-cg-lacre" : "border-cg-tinta/10 bg-cg-blanco/95 text-cg-sepia",
        )}
      >
        {estado === "guardando" ? "Enviando…" : estado === "guardado" ? "✓ Recibido" : "No se envió · tocá para reintentar"}
      </button>
    </div>
  );
}

export function Toast({ texto, onCerrar }: { texto: string; onCerrar: () => void }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 6000);
    return () => clearTimeout(t);
  }, [onCerrar]);
  return (
    <div className="fixed inset-x-0 top-14 z-30 flex justify-center px-4">
      <button type="button" onClick={onCerrar} className="pub-entra cg-hoja max-w-sm rounded-xl border-l-4 border-cg-lacre px-4 py-3 text-left">
        <span className="block cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-lacre">Versión nueva</span>
        <span className="mt-1 block text-[15px] leading-snug text-cg-tinta">{texto}</span>
      </button>
    </div>
  );
}

/** Mientras no hay nada abierto: "Mirá la pantalla". */
export function Espera({
  enPantalla,
  conectados,
  hechas,
  total,
  revelado,
}: {
  enPantalla: string | null;
  conectados: number;
  hechas: number;
  total: number;
  revelado: boolean;
}) {
  return (
    <div className="flex min-h-[72dvh] flex-col">
      <div className="flex-1">
        <p className="cg-mono text-[11px] uppercase tracking-[0.22em] text-cg-sepia">Estás adentro</p>
        <h1 className="cg-titular mt-3 text-[3.4rem] text-cg-tinta">
          Mirá la
          <br />
          pantalla.
        </h1>
        <p className="cg-bajada mt-4 text-[1.35rem] leading-snug text-cg-sepia">
          Cuando haya algo para responder, aparece acá solo. No hace falta recargar.
        </p>
        {enPantalla && (
          <div className="cg-hoja mt-8 rounded-lg px-4 py-3">
            <p className="cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-gris">Ahora en pantalla</p>
            <p className="mt-1 cg-serif text-lg leading-snug text-cg-tinta">{enPantalla}</p>
          </div>
        )}
      </div>
      <div className="mt-10 space-y-2 border-t border-cg-tinta/10 pt-4">
        <div className="flex items-center justify-between cg-mono text-[11px] uppercase tracking-[0.16em] text-cg-sepia">
          <span>{conectados > 1 ? `${conectados} personas conectadas` : "Conectado"}</span>
          <span className="flex gap-1" aria-label={`${hechas} de ${total} respondidas`}>
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={cx("size-2 rounded-full", i < hechas ? "bg-cg-tinta" : "border border-cg-tinta/30")} />
            ))}
          </span>
        </div>
        {revelado && (
          <p className="pub-entra cg-bajada text-[1.05rem] leading-snug text-cg-musgo">
            Esta app la hizo un abogado, conversando con una IA.
          </p>
        )}
      </div>
    </div>
  );
}

// --- Encabezado de una pregunta ----------------------------------------------------------

function Kicker({ numero, total, children }: { numero: number; total: number; children?: ReactNode }) {
  return (
    <p className="flex items-center gap-2 cg-mono text-[11px] uppercase tracking-[0.2em] text-cg-lacre">
      <span>
        Pregunta {numero} de {total}
      </span>
      {children}
    </p>
  );
}

// --- Texto breve (nube) --------------------------------------------------------------

export function PreguntaTexto({
  act,
  total,
  valor,
  onEnviar,
}: {
  act: ActividadTexto;
  total: number;
  valor: string;
  onEnviar: (texto: string) => void;
}) {
  const [editando, setEditando] = useState(!valor);
  const [texto, setTexto] = useState(valor);
  const campo = useRef<HTMLTextAreaElement>(null);
  const limpio = texto.trim();

  function enviar() {
    if (limpio.length < 2) return;
    onEnviar(limpio.slice(0, act.max));
    setEditando(false);
    vibrar(20);
    campo.current?.blur();
  }

  if (!editando && valor) {
    return (
      <div className="pub-entra">
        <Kicker numero={act.numero} total={total} />
        <p className="mt-3 cg-serif text-[1.3rem] leading-snug text-cg-sepia">{act.pregunta}</p>
        <div className="relative mt-8">
          <div className="cg-hoja rounded-lg px-5 pb-6 pt-7">
            <p className="cg-bajada text-[1.6rem] leading-snug text-cg-tinta">“{valor}”</p>
          </div>
          <span className="pub-sello absolute -right-2 -top-4 rounded border-2 border-cg-lacre px-2 py-0.5 cg-mono text-xs font-semibold uppercase tracking-[0.2em] text-cg-lacre">
            Enviado
          </span>
        </div>
        <p className="mt-6 text-[17px] leading-snug text-cg-tinta">Mirá la pantalla: tu respuesta ya forma parte de la nube.</p>
        <button
          type="button"
          onClick={() => {
            setTexto(valor);
            setEditando(true);
          }}
          className="pub-boton mt-5 cg-mono text-xs uppercase tracking-[0.18em] text-cg-sepia underline underline-offset-4"
        >
          Cambiar mi respuesta
        </button>
      </div>
    );
  }

  return (
    <div className="pub-entra">
      <Kicker numero={act.numero} total={total} />
      <h1 className="cg-titular mt-3 text-[2rem] leading-[1.1] text-cg-tinta">{act.pregunta}</h1>
      <p className="mt-3 text-[15px] text-cg-sepia">{act.consigna}</p>
      <div className="cg-hoja mt-5 rounded-lg p-1">
        <textarea
          ref={campo}
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, act.max))}
          placeholder={act.placeholder}
          rows={3}
          enterKeyHint="send"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              enviar();
            }
          }}
          className="block w-full resize-none bg-transparent px-3 py-2 text-[19px] leading-snug text-cg-tinta outline-none placeholder:text-cg-gris"
        />
        <div className="flex items-center justify-between px-3 pb-2 cg-mono text-[10px] uppercase tracking-[0.16em] text-cg-gris">
          <span>Sin nombre · anónimo</span>
          <span>
            {texto.length}/{act.max}
          </span>
        </div>
      </div>
      <p className="mt-5 cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-sepia">¿Sin ideas? Tocá una</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {act.sugerencias.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setTexto(s);
              vibrar(8);
            }}
            className={cx(
              "pub-boton rounded-full border px-3 py-1.5 text-left text-[14px] leading-tight",
              texto === s ? "border-cg-tinta bg-cg-tinta text-cg-blanco" : "border-cg-tinta/25 bg-cg-blanco/70 text-cg-tinta",
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={enviar}
        disabled={limpio.length < 2}
        className="pub-boton pub-sombra mt-7 h-14 w-full rounded-xl bg-cg-tinta cg-mono text-sm uppercase tracking-[0.22em] text-cg-blanco disabled:opacity-35"
      >
        Enviar a la pantalla
      </button>
    </div>
  );
}

// --- Botones ------------------------------------------------------------------------------

function BotonOpcion({ activa, onClick, children, grande }: { activa: boolean; onClick: () => void; children: ReactNode; grande?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cx(
        "pub-boton pub-sombra flex w-full items-center gap-3 rounded-xl border-2 px-4 text-left",
        grande ? "min-h-[4.5rem] py-3 text-[1.45rem]" : "min-h-16 py-3 text-[1.08rem] leading-snug",
        activa ? "border-cg-tinta bg-cg-tinta text-cg-blanco" : "border-cg-tinta/80 bg-cg-blanco text-cg-tinta",
      )}
    >
      <span
        className={cx(
          "grid size-6 shrink-0 place-items-center rounded-full border-2",
          activa ? "border-cg-blanco bg-cg-lacre" : "border-cg-tinta/40",
        )}
        aria-hidden
      >
        {activa && (
          <svg viewBox="0 0 12 12" className="size-3">
            <path d="M2.5 6.2 5 8.6l4.6-5" fill="none" stroke="#faf7f0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      <span className={cx("min-w-0 flex-1", grande && "cg-titular leading-none")}>{children}</span>
    </button>
  );
}

/** Frase de seguimiento de una opción (ej.: "¿De qué depende?"). */
function CampoSeguimiento({ seg, valor, onEnviar }: { seg: Seguimiento; valor: string; onEnviar: (t: string) => void }) {
  const [texto, setTexto] = useState(valor);
  const [editando, setEditando] = useState(!valor);
  const limpio = texto.trim();

  if (!editando && valor)
    return (
      <div className="pub-entra mt-4 rounded-xl border-2 border-dashed border-cg-lacre/60 bg-cg-blanco/70 px-4 py-3">
        <p className="cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-lacre">{seg.pregunta} · enviado</p>
        <p className="mt-1 cg-bajada text-[1.25rem] leading-snug text-cg-tinta">“{valor}”</p>
        <button type="button" onClick={() => setEditando(true)} className="pub-boton mt-2 cg-mono text-[10px] uppercase tracking-[0.18em] text-cg-sepia underline underline-offset-4">
          Cambiar
        </button>
      </div>
    );

  return (
    <div className="pub-entra mt-4 rounded-xl border-2 border-cg-lacre bg-cg-blanco px-4 pb-4 pt-3">
      <p className="cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-lacre">Nuevo</p>
      <p className="mt-1 cg-titular text-[1.6rem] leading-none text-cg-tinta">{seg.pregunta}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, seg.max))}
        placeholder={seg.placeholder}
        rows={2}
        enterKeyHint="send"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && limpio.length >= 2) {
            e.preventDefault();
            onEnviar(limpio);
            setEditando(false);
          }
        }}
        className="mt-3 block w-full resize-none rounded-lg border border-cg-tinta/15 bg-cg-papel/40 px-3 py-2 text-[18px] leading-snug text-cg-tinta outline-none placeholder:text-cg-gris focus:border-cg-tinta/50"
      />
      <button
        type="button"
        disabled={limpio.length < 2}
        onClick={() => {
          onEnviar(limpio);
          setEditando(false);
          vibrar(20);
        }}
        className="pub-boton mt-3 h-12 w-full rounded-lg bg-cg-lacre cg-mono text-xs uppercase tracking-[0.2em] text-cg-blanco disabled:opacity-35"
      >
        Enviar
      </button>
    </div>
  );
}

/** Una pregunta con una sola respuesta (y su seguimiento, si la opción lo tiene). */
export function PreguntaUnica({
  act,
  total,
  item,
  resp,
  seguimiento,
  onElegir,
  onSeguimiento,
}: {
  act: ActividadOpciones;
  total: number;
  item: Item;
  resp: Resp;
  seguimiento: (itemId: string, opcionId: string) => Seguimiento | undefined;
  onElegir: (itemId: string, opcionId: string) => void;
  onSeguimiento: (itemId: string, texto: string) => void;
}) {
  const elegida = resp[item.id];
  const seg = elegida ? seguimiento(item.id, elegida) : undefined;
  const cortas = item.opciones.every((o) => o.label.length <= 8);
  return (
    <div className="pub-entra">
      <Kicker numero={act.numero} total={total} />
      <h1 className="cg-titular mt-3 text-[2rem] leading-[1.1] text-cg-tinta">{item.texto}</h1>
      <p className="mt-3 text-[15px] text-cg-sepia">{act.consigna}</p>
      <div className="mt-6 space-y-3">
        {item.opciones.map((o) => (
          <BotonOpcion key={o.id} activa={elegida === o.id} grande={cortas} onClick={() => onElegir(item.id, o.id)}>
            {o.label}
            {o.detalle && <span className="mt-0.5 block text-sm opacity-70">{o.detalle}</span>}
          </BotonOpcion>
        ))}
      </div>
      {seg && elegida && (
        <CampoSeguimiento key={elegida} seg={seg} valor={resp[`${item.id}~porque`] ?? ""} onEnviar={(t) => onSeguimiento(item.id, t)} />
      )}
      {elegida && !seg && (
        <p className="pub-entra mt-6 text-[16px] leading-snug text-cg-sepia">
          <span className="text-cg-tinta">Listo.</span> Mirá la pantalla. Podés cambiar tu respuesta mientras la pregunta siga abierta.
        </p>
      )}
    </div>
  );
}

/** Varias situaciones con los mismos botones: de a una, avanza sola. */
export function PreguntaCasos({
  act,
  total,
  resp,
  onElegir,
}: {
  act: ActividadOpciones;
  total: number;
  resp: Resp;
  onElegir: (itemId: string, opcionId: string) => void;
}) {
  const primeraSin = act.items.findIndex((it) => !resp[it.id]);
  const [i, setI] = useState(primeraSin === -1 ? act.items.length : primeraSin);
  const avance = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(avance.current), []);

  function elegir(itemId: string, opcionId: string) {
    onElegir(itemId, opcionId);
    clearTimeout(avance.current);
    avance.current = setTimeout(() => setI((x) => x + 1), 380);
  }

  if (i >= act.items.length) {
    return (
      <div className="pub-entra">
        <Kicker numero={act.numero} total={total} />
        <h1 className="cg-titular mt-3 text-[2.4rem] text-cg-tinta">Listo.</h1>
        <p className="cg-bajada mt-2 text-[1.3rem] text-cg-sepia">Mirá la pantalla. Tocá una situación para cambiarla.</p>
        <ul className="mt-6 space-y-2">
          {act.items.map((it, k) => {
            const op = it.opciones.find((o) => o.id === resp[it.id]);
            return (
              <li key={it.id}>
                <button type="button" onClick={() => setI(k)} className="pub-boton cg-hoja flex w-full items-start gap-3 rounded-lg px-4 py-3 text-left">
                  <span className="mt-0.5 cg-mono text-xs text-cg-gris">{k + 1}</span>
                  <span className="min-w-0 flex-1 text-[15px] leading-snug text-cg-tinta">{it.texto}</span>
                  <span className={cx("shrink-0 cg-mono text-[10px] uppercase tracking-[0.14em]", op ? "text-cg-lacre" : "text-cg-gris")}>
                    {op?.label ?? "—"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const it = act.items[i];
  return (
    <div>
      <Kicker numero={act.numero} total={total}>
        <span className="text-cg-gris">·</span>
        <span className="text-cg-sepia">
          {i + 1} de {act.items.length}
        </span>
      </Kicker>
      <h1 className="cg-titular mt-3 text-[1.9rem] leading-[1.1] text-cg-tinta">{act.pregunta}</h1>
      <div key={it.id} className="pub-desliza">
        <div className="cg-hoja relative mt-6 rounded-lg px-5 pb-6 pt-8">
          <span className="absolute left-5 top-3 cg-mono text-[10px] uppercase tracking-[0.2em] text-cg-gris">{it.rotulo}</span>
          <p className="cg-bajada text-[1.5rem] leading-snug text-cg-tinta">“{it.texto}”</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {it.opciones.map((o) => {
            const activa = resp[it.id] === o.id;
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={activa}
                onClick={() => elegir(it.id, o.id)}
                className={cx(
                  "pub-boton pub-sombra min-h-24 rounded-xl border-2 px-3 py-3 cg-titular text-[1.35rem] leading-[1.02]",
                  activa ? "border-cg-tinta bg-cg-tinta text-cg-blanco" : "border-cg-tinta/80 bg-cg-blanco text-cg-tinta",
                )}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setI((x) => Math.max(0, x - 1))}
          disabled={i === 0}
          className="pub-boton cg-mono text-xs uppercase tracking-[0.18em] text-cg-sepia disabled:opacity-0"
        >
          ← Anterior
        </button>
        <span className="flex gap-1.5">
          {act.items.map((x, k) => (
            <span key={x.id} className={cx("size-2 rounded-full", k === i ? "bg-cg-lacre" : resp[x.id] ? "bg-cg-tinta" : "border border-cg-tinta/30")} />
          ))}
        </span>
        <button
          type="button"
          onClick={() => setI((x) => x + 1)}
          disabled={!resp[it.id]}
          className="pub-boton cg-mono text-xs uppercase tracking-[0.18em] text-cg-sepia disabled:opacity-0"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}
