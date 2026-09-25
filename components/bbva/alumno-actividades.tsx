"use client";

// Actividades 1 a 4 en el celular del participante (Laboratorio de IA · BBVA).
//   A1 — nube de operaciones: hasta tres botones.
//   A2 — ¿se lo darías a una IA?: un caso por pantalla, Sí / No / Depende.
//   A3 — ¿hasta dónde la dejarías llegar?: escalera de autonomía.
//   A4 — ¿qué tecnología necesitás?: un caso por pantalla, cuatro opciones.
// Cada toque se guarda al instante; al terminar, "Listo. Mirá la pantalla."

import { Fragment, useRef, useState, type ComponentType } from "react";
import type { ActividadBbva } from "@/lib/bbva-clase";
import {
  BotonOpcion,
  EnPantalla,
  FichaIA,
  IconoChat,
  IconoFalta,
  IconoFlujo,
  IconoObjetivo,
  IconoPersona,
  IconoSobre,
  ListoCartel,
  Puntos,
  comoLista,
  comoTexto,
  cx,
  respondido,
  type PropsActividad,
} from "./alumno-ui";

type Props = PropsActividad<ActividadBbva>;
type Timer = ReturnType<typeof setTimeout> | undefined;

// =====================================================================================
// ACTIVIDAD 1 · Nube de operaciones
// =====================================================================================

export function Actividad1({ act, resp, guardar, enPantalla }: Props) {
  const item = act.items[0];
  const sel = comoLista(resp[item.id]);
  // Si ya había respondido (vuelve a la actividad o recargó), arranca en "Listo".
  const [listo, setListo] = useState(() => sel.length > 0);
  const [sacude, setSacude] = useState<{ id: string; n: number } | null>(null);
  const [tope, setTope] = useState(false);
  const topeT = useRef<Timer>(undefined);

  function tocar(id: string) {
    if (sel.includes(id)) {
      guardar(item.id, sel.filter((x) => x !== id), 400);
      setTope(false);
      return;
    }
    if (sel.length >= item.max) {
      setSacude((s) => ({ id, n: (s?.n ?? 0) + 1 }));
      setTope(true);
      clearTimeout(topeT.current);
      topeT.current = setTimeout(() => setTope(false), 2200);
      navigator.vibrate?.([10, 40, 10]);
      return;
    }
    guardar(item.id, [...sel, id], 400);
  }

  function terminar() {
    if (!sel.length) return;
    guardar(item.id, sel, 0); // sin esperar el debounce
    setListo(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (listo && sel.length > 0) {
    return (
      <div className="alu-entra">
        <ListoCartel bajada="Tus operaciones ya están en la nube del grupo." />
        <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">Elegiste</p>
        <ul className="mt-3 flex flex-wrap gap-2.5">
          {sel.map((id, i) => (
            <li
              key={id}
              className="bbva-recorte bbva-cae bbva-titular rounded-[3px] px-3.5 py-2.5 text-[1.55rem] text-tinta"
              style={{ "--rot": `${[-2, 1.5, -0.8][i % 3]}deg`, animationDelay: `${0.12 + i * 0.1}s` } as React.CSSProperties}
            >
              {item.opciones.find((o) => o.id === id)?.label ?? id}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setListo(false)}
          className="alu-boton mt-6 min-h-11 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Cambiar
        </button>
        <EnPantalla titulo={enPantalla} className="mt-8" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="bbva-titular text-[2.35rem] text-tinta">{act.pregunta}</h1>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="bbva-serif text-[1.2rem] italic text-grafito">{act.consigna}</p>
        <Contador n={sel.length} max={item.max} sacude={sacude?.n ?? 0} />
      </div>
      <p aria-live="polite" className={cx("bbva-mano h-6 text-[1.25rem] leading-6 text-naranja", !tope && "invisible")}>
        Ya elegiste tres. Tocá una para sacarla.
      </p>

      <div className="mt-2 grid grid-cols-2 gap-2">
        {item.opciones.map((o) => {
          const idx = sel.indexOf(o.id);
          const activa = idx >= 0;
          const temblando = sacude?.id === o.id;
          return (
            <BotonOpcion
              key={temblando ? `${o.id}-${sacude.n}` : o.id}
              activa={activa}
              onClick={() => tocar(o.id)}
              className={cx("justify-between gap-2 px-3", temblando && "alu-sacude")}
            >
              <span className="bbva-titular text-[1.3rem] leading-[0.95]">{o.label}</span>
              {activa && (
                <span className="alu-aparece grid size-6 shrink-0 place-items-center rounded-full bg-naranja font-mono text-[11px] font-semibold text-blanco">
                  {idx + 1}
                </span>
              )}
            </BotonOpcion>
          );
        })}
      </div>

      {/* Botón "Listo" siempre a mano, pegado abajo */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-4 bg-gradient-to-t from-papel from-70% to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-5">
        <button
          type="button"
          onClick={terminar}
          disabled={!sel.length}
          className={cx(
            "alu-boton flex min-h-14 w-full items-center justify-center gap-3 rounded-[4px] border-[1.5px] font-mono text-[13px] font-semibold uppercase tracking-[0.2em]",
            sel.length ? "alu-sombra border-tinta bg-tinta text-papel" : "border-dashed border-gris bg-transparent text-gris",
          )}
        >
          {sel.length ? (
            <>
              Listo <span aria-hidden="true">→</span>
            </>
          ) : (
            "Elegí al menos una"
          )}
        </button>
      </div>
    </div>
  );
}

function Contador({ n, max, sacude }: { n: number; max: number; sacude: number }) {
  return (
    <div key={sacude} className={cx("flex shrink-0 items-center gap-2", sacude > 0 && "alu-sacude")} aria-live="polite">
      <span className="flex gap-1" aria-hidden="true">
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={cx("size-3 rounded-[2px] border-[1.5px] transition-colors", i < n ? "border-naranja bg-naranja" : "border-grafito")}
          />
        ))}
      </span>
      <span className="font-mono text-[12px] tracking-[0.1em] text-grafito">
        {n} de {max}
      </span>
    </div>
  );
}

// =====================================================================================
// ACTIVIDADES 2 y 4 · Un caso por pantalla
// =====================================================================================

const DETALLE_TECNO: Record<string, string> = {
  chatbot: "la persona pregunta, la IA responde",
  automatizacion: "pasa algo y se ejecutan pasos fijos",
  agente: "recibe un objetivo y decide los pasos",
  falta_info: "falta saber cómo es el proceso",
};

const ICONO_TECNO: Record<string, ComponentType<{ className?: string }>> = {
  chatbot: IconoChat,
  automatizacion: IconoFlujo,
  agente: IconoObjetivo,
  falta_info: IconoFalta,
};

export function ActividadCasos({ act, resp, guardar, enPantalla, variante }: Props & { variante: "snd" | "tecno" }) {
  const items = act.items;
  const n = items.length;
  const hechos = items.map((it) => respondido(resp[it.id]));
  const completo = hechos.every(Boolean);
  const primeroPendiente = Math.max(0, hechos.indexOf(false));
  const [paso, setPaso] = useState<number | "resumen">(() => (completo ? "resumen" : primeroPendiente));
  const avanzarT = useRef<Timer>(undefined);

  // Si el resumen queda incompleto (ej.: se reiniciaron las respuestas), vuelve al primer pendiente.
  const actual = paso === "resumen" ? (completo ? "resumen" : primeroPendiente) : Math.min(paso, n - 1);

  function ir(p: number | "resumen") {
    clearTimeout(avanzarT.current);
    setPaso(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function responder(i: number, opcion: string) {
    guardar(items[i].id, opcion);
    const nuevos = hechos.map((h, j) => (j === i ? true : h));
    // siguiente sin responder (dando la vuelta); si no queda ninguno, el resumen
    let sig: number | "resumen" = "resumen";
    for (let k = 1; k < n; k++) {
      const j = (i + k) % n;
      if (!nuevos[j]) {
        sig = j;
        break;
      }
    }
    clearTimeout(avanzarT.current);
    avanzarT.current = setTimeout(() => ir(sig), 320);
  }

  if (actual === "resumen") {
    return (
      <div className="alu-entra">
        <ListoCartel bajada={variante === "snd" ? "Tus cinco respuestas ya cuentan." : "Tus cuatro respuestas ya cuentan."} />
        <p className="mt-7 font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">Tus respuestas · tocá una para cambiarla</p>
        <ol className="mt-3 flex flex-col gap-2">
          {items.map((it, i) => {
            const v = comoTexto(resp[it.id]);
            const op = it.opciones.find((o) => o.id === v);
            return (
              <li key={it.id}>
                <button
                  type="button"
                  onClick={() => ir(i)}
                  className="alu-boton alu-sombra flex min-h-14 w-full items-center gap-3 rounded-[4px] border border-niebla bg-blanco px-3.5 py-2.5 text-left"
                >
                  <span className="shrink-0 self-start pt-1 font-mono text-[11px] text-gris">{String(i + 1).padStart(2, "0")}</span>
                  <span className={cx("min-w-0 flex-1", variante === "snd" && "flex items-center gap-3")}>
                    <span className="bbva-serif block min-w-0 flex-1 text-[1.02rem] leading-snug text-grafito">{it.texto}</span>
                    {op && (
                      <span className={cx("flex shrink-0 items-center gap-1.5", variante === "tecno" && "mt-1.5")}>
                        <EtiquetaRespuesta id={op.id} label={op.label} variante={variante} />
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <EnPantalla titulo={enPantalla} className="mt-7" />
      </div>
    );
  }

  const it = items[actual];
  const v = comoTexto(resp[it.id]);

  return (
    <div>
      <Puntos
        total={n}
        actual={actual}
        hechos={hechos}
        onIr={(i) => ir(i)}
        rotulo={`Caso ${actual + 1} de ${n}`}
      />
      <h1 className="bbva-titular mt-3 text-[1.65rem] text-tinta">{act.pregunta}</h1>

      {/* El caso: una ficha/ticket de trabajo que entra desde el costado */}
      <article key={it.id} className="alu-desliza bbva-recorte relative mt-4 rounded-[3px] px-4 pb-5 pt-3.5">
        <header className="flex items-center justify-between border-b border-dashed border-niebla pb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">
          <span>{variante === "snd" ? "La situación" : "El pedido"}</span>
          <span>
            {String(actual + 1).padStart(2, "0")}/{String(n).padStart(2, "0")}
          </span>
        </header>
        <p className={cx("bbva-serif mt-3 leading-[1.14] text-tinta", it.texto.length > 110 ? "text-[1.42rem]" : "text-[1.7rem]")}>
          {it.texto}
        </p>
      </article>

      {variante === "snd" ? (
        <div className="mt-5 flex flex-col gap-2">
          {it.opciones.map((o) => (
            <BotonOpcion
              key={o.id}
              activa={v === o.id}
              tono={o.id === "depende" ? "naranja" : "tinta"}
              onClick={() => responder(actual, o.id)}
              className="min-h-16 justify-between gap-3 px-5"
            >
              <span className="bbva-titular text-[2rem] leading-none">{o.label}</span>
              {v === o.id && (
                <svg viewBox="0 0 16 16" className="alu-aparece size-5 shrink-0" aria-hidden="true">
                  <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </BotonOpcion>
          ))}
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {it.opciones.map((o) => {
            const Icono = ICONO_TECNO[o.id] ?? IconoChat;
            const activa = v === o.id;
            return (
              <BotonOpcion
                key={o.id}
                activa={activa}
                punteado={o.id === "falta_info"}
                onClick={() => responder(actual, o.id)}
                className="min-h-[7.25rem] flex-col items-start justify-between gap-2 px-3 py-3"
              >
                <Icono className={cx("size-7", activa ? "text-cielo" : "text-pizarra")} />
                <span className="block">
                  <span className="bbva-titular block text-[1.2rem] leading-[0.95]">{o.label}</span>
                  <span className={cx("bbva-serif mt-1 block text-[0.98rem] italic leading-tight", activa ? "text-niebla" : "text-grafito")}>
                    {DETALLE_TECNO[o.id]}
                  </span>
                </span>
              </BotonOpcion>
            );
          })}
        </div>
      )}

      {completo && (
        <button
          type="button"
          onClick={() => ir("resumen")}
          className="alu-boton mt-5 min-h-11 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Ver mis respuestas
        </button>
      )}
    </div>
  );
}

function EtiquetaRespuesta({ id, label, variante }: { id: string; label: string; variante: "snd" | "tecno" }) {
  if (variante === "tecno") {
    const Icono = ICONO_TECNO[id] ?? IconoChat;
    return (
      <>
        <Icono className="size-4 text-pizarra" />
        <span className="bbva-titular text-[1.05rem] text-tinta">{label}</span>
      </>
    );
  }
  return (
    <span
      className={cx(
        "bbva-titular rounded-[3px] px-2 py-1 text-[1.05rem] leading-none",
        id === "depende" ? "bg-naranja text-blanco" : "bg-tinta text-papel",
      )}
    >
      {label}
    </span>
  );
}

// =====================================================================================
// ACTIVIDAD 3 · Escalera de autonomía
// =====================================================================================

export function Actividad3({ act, resp, guardar, enPantalla }: Props) {
  const item = act.items[0];
  const nivel = Number(comoTexto(resp[item.id])) || 0;
  const elegido = item.opciones.find((o) => Number(o.id) === nivel);
  const escalones = [...item.opciones].sort((a, b) => Number(b.id) - Number(a.id)); // 5 arriba, 1 abajo
  const confRef = useRef<HTMLDivElement>(null);

  function elegir(id: string) {
    guardar(item.id, id);
    setTimeout(() => confRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
  }

  return (
    <div>
      <div className="bbva-recorte relative rounded-[3px] px-4 pb-3.5 pt-3" style={{ transform: "rotate(-0.6deg)" }}>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">La situación</p>
        <p className="bbva-serif mt-1 pr-12 text-[1.45rem] leading-[1.1] text-tinta">Llega una consulta o reclamo de un cliente.</p>
        <IconoSobre className="absolute right-3.5 top-3.5 h-7 w-9" />
      </div>

      <h1 className="bbva-titular mt-5 text-[1.85rem] text-tinta">¿Hasta dónde dejarías actuar solo al sistema?</h1>
      <p className="bbva-serif mt-1.5 text-[1.1rem] italic leading-snug text-grafito">
        Tocá el último paso que dejarías hacer al sistema sin intervención humana.
      </p>

      <div className="mt-4 flex gap-2">
        {/* Eje: más autonomía hacia arriba */}
        <div className="flex w-5 shrink-0 flex-col items-center" aria-hidden="true">
          <svg viewBox="0 0 12 12" className="size-3 text-grafito">
            <path d="M6 1L1.5 8h9z" fill="currentColor" />
          </svg>
          <div className="w-px flex-1 bg-grafito/50" />
          <span
            className="my-2 font-mono text-[9.5px] uppercase tracking-[0.22em] text-gris"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            Autonomía
          </span>
          <div className="w-px flex-1 bg-grafito/50" />
        </div>

        <ol className="flex min-w-0 flex-1 flex-col gap-1.5">
          {escalones.map((o) => {
            const n = Number(o.id);
            const estado = !nivel ? "libre" : n === nivel ? "tope" : n < nivel ? "sistema" : "persona";
            return (
              <Fragment key={o.id}>
                <li style={{ paddingLeft: `${(n - 1) * 0.5}rem` }}>
                  <button
                    type="button"
                    onClick={() => elegir(o.id)}
                    aria-pressed={n === nivel}
                    aria-label={`${n}. ${o.label}${estado === "persona" ? " — interviene una persona" : estado === "libre" ? "" : " — lo hace el sistema"}`}
                    className={cx(
                      "alu-boton flex min-h-14 w-full items-center gap-2.5 rounded-[4px] border-[1.5px] px-2.5 py-2 text-left",
                      estado === "libre" && "alu-sombra border-tinta bg-blanco text-tinta",
                      estado === "sistema" && "border-pizarra bg-pizarra text-blanco",
                      estado === "tope" && "alu-hundido border-tinta bg-pizarra-2 text-blanco",
                      estado === "persona" && "border-dashed border-naranja bg-blanco/70 text-grafito",
                    )}
                  >
                    <span
                      className={cx(
                        "grid size-7 shrink-0 place-items-center rounded-[3px] font-mono text-[12px] font-semibold",
                        estado === "libre" && "border border-tinta",
                        (estado === "sistema" || estado === "tope") && "bg-blanco/15",
                        estado === "persona" && "border border-naranja text-naranja",
                      )}
                    >
                      {n}
                    </span>
                    <span className="bbva-titular min-w-0 flex-1 text-[1.2rem] leading-[0.95]">{o.label}</span>
                    {(estado === "sistema" || estado === "tope") && <FichaIA clara />}
                    {estado === "persona" && <IconoPersona className="size-6 shrink-0 text-naranja" />}
                  </button>
                </li>
                {nivel > 0 && nivel < 5 && n === nivel + 1 && (
                  <li aria-hidden="true" className="alu-aparece flex items-center gap-2 py-0.5 pl-1">
                    <span className="h-0 flex-1 border-t-2 border-dashed border-naranja" />
                    <span className="bbva-mano text-[1.25rem] leading-none text-naranja">acá entra una persona ↑</span>
                  </li>
                )}
              </Fragment>
            );
          })}
        </ol>
      </div>

      {elegido && (
        <div ref={confRef} key={nivel} className="alu-entra bbva-recorte mt-6 rounded-[3px] px-4 pb-4 pt-4">
          <ListoCartel chico />
          <p className="bbva-serif mt-3 text-[1.22rem] leading-snug text-tinta">
            El sistema avanza solo hasta: <span className="bbva-subrayado">{elegido.label}</span>.{" "}
            {nivel < 5 ? "Desde ahí, interviene una persona." : "Ninguna persona revisa el caso en el camino."}
          </p>
          <p className="mt-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-gris">Podés cambiarlo tocando otro paso</p>
          <EnPantalla titulo={enPantalla} className="mt-4" />
        </div>
      )}
    </div>
  );
}
