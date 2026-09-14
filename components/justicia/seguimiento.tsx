"use client";

// El celular del participante sigue la presentación: muestra la placa que se
// proyecta (en letra grande y sin diagramas) y permite volver a las anteriores,
// nunca adelantarse. Cuando se proyecta una actividad, la actividad va primero.

import { Component, useState, type ReactNode } from "react";
import { GuiaFinal } from "@/components/justicia/guia-card";
import type { Explorable } from "@/lib/clase-vivo";
import { GUIA_URL } from "@/lib/justicia-guia";
import { getJusActividad, JUS_AUTOR, JUS_EVENTO, JUS_KIT, JUS_SLIDES, JUS_TITLE, type JusSlide } from "@/lib/justicia-clase";
import type { PlacaVivo } from "@/lib/remoto";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Si algo de este panel falla, el celular sigue mostrando la actividad. */
class Blindaje extends Component<{ fallback: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? this.props.fallback : this.props.children;
  }
}

export function SeguimientoJusticia({
  session,
  placa,
  actividad,
}: {
  session: SessionRow;
  placa: PlacaVivo | null;
  actividad: ReactNode;
}) {
  return (
    <>
      <Blindaje fallback={actividad}>
        <Seguimiento placa={placa} actividad={actividad} />
      </Blindaje>
      <GuiaFinal session={session} />
    </>
  );
}

const esActividad = (s: JusSlide) => s.t === "actividad" || s.t === "simulador";

function Seguimiento({ placa, actividad }: { placa: PlacaVivo | null; actividad: ReactNode }) {
  const [viendo, setViendo] = useState<number | null>(null);
  const total = JUS_SLIDES.length;
  const vivo = placa && placa.idx >= 0 && placa.idx < total ? placa.idx : null;
  const i = vivo === null ? null : viendo !== null && viendo < vivo ? viendo : vivo;
  const slide = i === null ? null : JUS_SLIDES[i];
  const enVivo = i !== null && i === vivo;
  // Actividad en pantalla: primero la actividad; si no, primero la placa.
  const placaArriba = slide !== null && !(enVivo && esActividad(slide));
  const ir = (n: number) => setViendo(vivo !== null && n >= vivo ? null : Math.max(0, n));

  const nav =
    i !== null && vivo !== null ? <Navegacion i={i} total={total} vivo={vivo} enVivo={enVivo} onIr={ir} /> : null;

  // Misma estructura siempre (tres lugares fijos) para que la actividad no se
  // vuelva a montar al cambiar de placa y no pierda lo que se escribió.
  return (
    <>
      {placaArriba && slide && i !== null ? (
        <div className="rise">
          {nav}
          <VistaPlaca key={i} slide={slide} abiertas={enVivo && placa ? placa.abiertas : []} />
          <div className="mt-6">{nav}</div>
        </div>
      ) : null}
      <div className={cn(placaArriba && "mt-8 border-t border-line/60 pt-6")}>{actividad}</div>
      {!placaArriba && slide ? (
        <div className="mt-6">
          {nav}
          {slide.t === "simulador" && <CasoSimulador />}
        </div>
      ) : null}
    </>
  );
}

function Navegacion({
  i,
  total,
  vivo,
  enVivo,
  onIr,
}: {
  i: number;
  total: number;
  vivo: number;
  enVivo: boolean;
  onIr: (n: number) => void;
}) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onIr(i - 1)}
          disabled={i === 0}
          className="rounded-xl border border-line bg-panel/60 px-3 py-2 text-base font-semibold disabled:opacity-30"
        >
          ‹ Anterior
        </button>
        <p className="min-w-0 flex-1 text-center text-sm">
          {enVivo ? (
            <span className="font-semibold text-teal">● En pantalla · {i + 1} de {total}</span>
          ) : (
            <span className="text-muted">
              Placa {i + 1} de {total}
            </span>
          )}
        </p>
        <button
          onClick={() => onIr(i + 1)}
          disabled={enVivo}
          className="rounded-xl border border-line bg-panel/60 px-3 py-2 text-base font-semibold disabled:opacity-30"
        >
          Siguiente ›
        </button>
      </div>
      {!enVivo && (
        <button
          onClick={() => onIr(vivo)}
          className="rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2.5 text-base font-bold text-ink"
        >
          Volver a lo que se proyecta ({vivo + 1})
        </button>
      )}
    </div>
  );
}

function VistaPlaca({ slide, abiertas }: { slide: JusSlide; abiertas: string[] }) {
  if (slide.t === "portada")
    return (
      <Marco>
        <h2 className="text-gradient text-4xl font-bold leading-tight">{JUS_TITLE}</h2>
        <p className="mt-3 text-lg text-muted">{JUS_EVENTO}</p>
        <p className="mt-4 text-lg font-semibold">{JUS_AUTOR}</p>
      </Marco>
    );
  if (slide.t === "ingreso")
    return (
      <Marco>
        <h2 className="text-3xl font-bold leading-tight">¡Ya está adentro!</h2>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Aquí va a ver cada placa de la presentación. Puede volver a las anteriores cuando quiera.
        </p>
      </Marco>
    );
  if (slide.t === "final")
    return (
      <Marco>
        <h2 className="text-gradient text-4xl font-bold">Gracias</h2>
        <p className="mt-3 text-lg text-muted">Mande su aplauso con el 👏 de abajo.</p>
        <a href={GUIA_URL} className="mt-4 inline-block text-lg font-semibold text-teal underline">
          📘 La guía de la clase
        </a>
      </Marco>
    );
  if (slide.t === "simulador")
    return (
      <Marco>
        <h2 className="text-3xl font-bold leading-tight">Un conflicto. Un clic.</h2>
        <p className="mt-2 text-lg text-muted">Dos formas de resolverlo.</p>
        <CasoSimulador />
      </Marco>
    );
  if (slide.t === "actividad") {
    const act = getJusActividad(slide.activa);
    return (
      <Marco>
        <p className="text-xs font-bold uppercase tracking-widest text-teal">🗳️ {slide.escena}</p>
        <h2 className="mt-2 text-3xl font-bold leading-tight">{act?.titulo ?? "Actividad"}</h2>
        {act?.bajada && <p className="mt-2 text-lg text-muted">{act.bajada}</p>}
        <p className="mt-4 text-sm text-faint">Se responde cuando está en pantalla.</p>
      </Marco>
    );
  }

  // placa de contenido
  const herramientas = slide.herramientas ? JUS_KIT.filter((h) => slide.herramientas?.includes(h.id)) : [];
  return (
    <Marco>
      {slide.parte && <p className="text-xs font-bold uppercase tracking-widest text-teal">{slide.parte}</p>}
      <h2 className="mt-2 text-3xl font-bold leading-tight">{slide.titulo}</h2>
      <p className="mt-2 text-xl leading-snug text-muted">{slide.bajada}</p>
      {slide.lede && <p className="mt-3 text-lg leading-relaxed">{slide.lede}</p>}
      {slide.pills && (
        <div className="mt-3 flex flex-wrap gap-2">
          {slide.pills.map((p) => (
            <span key={p} className="rounded-full border border-teal/50 bg-teal/10 px-3 py-1 text-sm text-teal">
              {p}
            </span>
          ))}
        </div>
      )}
      {slide.interactivo === "cotio" && <Cotio />}
      {slide.interactivo === "pdfs" && <EnPantalla texto="Demostración en la pantalla." />}
      {slide.interactivo === "dictado" && (
        <EnPantalla texto="Demostración en la pantalla: un relato dictado y desordenado se convierte en una cronología, con el nombre anonimizado y preguntas para precisar." />
      )}
      {herramientas.length > 0 && (
        <div className="mt-5 grid gap-2">
          {herramientas.map((h) => (
            <a
              key={h.id}
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-line bg-panel/60 px-4 py-3 text-lg font-semibold"
            >
              <span className="text-2xl">{h.emoji}</span>
              {h.label}
              <span className="ml-auto text-faint">↗</span>
            </a>
          ))}
        </div>
      )}
      {slide.explora && <Tarjetas items={slide.explora} abiertas={abiertas} />}
      {!slide.explora && !slide.interactivo && !herramientas.length && slide.diagrama && (
        <p className="mt-4 text-sm text-faint">El esquema está en la pantalla.</p>
      )}
    </Marco>
  );
}

function Marco({ children }: { children: ReactNode }) {
  return <section className="mt-4 rounded-3xl border border-line bg-panel/40 p-5">{children}</section>;
}

function EnPantalla({ texto }: { texto: string }) {
  return <p className="mt-4 rounded-2xl border border-teal/40 bg-teal/10 px-4 py-3 text-base text-teal">▶ {texto}</p>;
}

function Tarjetas({ items, abiertas }: { items: Explorable[]; abiertas: string[] }) {
  const [tocadas, setTocadas] = useState<Record<string, boolean>>({});
  return (
    <div className="mt-5 grid gap-3">
      {items.map((e) => {
        const id = `${e.emoji} ${e.label}`;
        const enPantalla = abiertas.includes(id);
        const abierta = tocadas[id] ?? enPantalla;
        return (
          <div key={id} className={cn("rounded-2xl border bg-ink-2/60", enPantalla ? "border-teal/70" : "border-line")}>
            <button
              onClick={() => setTocadas((t) => ({ ...t, [id]: !abierta }))}
              className="flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span className="text-2xl">{e.emoji}</span>
              <span className="min-w-0 flex-1 text-lg font-semibold leading-snug">{e.label}</span>
              {enPantalla && <span className="shrink-0 text-xs text-teal">en pantalla</span>}
              <span className="shrink-0 text-xl text-faint">{abierta ? "−" : "+"}</span>
            </button>
            {abierta && (
              <div className="px-4 pb-4 text-lg leading-relaxed text-muted">
                <p>{e.texto}</p>
                {e.ejemplo && (
                  <div className="mt-3 grid gap-2 text-base">
                    <p className="rounded-xl border border-line bg-panel/60 px-3 py-2">
                      <b className="text-foreground">Pedido:</b> {e.ejemplo.pedido}
                    </p>
                    <p className="rounded-xl border border-teal/40 bg-teal/10 px-3 py-2">
                      <b className="text-teal">Respuesta:</b> {e.ejemplo.respuesta}
                    </p>
                  </div>
                )}
                {e.demo && <p className="mt-2 text-sm text-teal">▶ La demostración está en la pantalla.</p>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const COTIO: [string, string, string][] = [
  ["C", "Contexto", "Quién pide, en qué situación y para qué ámbito."],
  ["O", "Objetivo", "Qué se quiere lograr con la respuesta."],
  ["T", "Tarea o tareas", "Qué tiene que hacer, paso por paso."],
  ["I", "Input", "Con qué información trabaja y con cuál no."],
  ["O", "Output", "Cómo tiene que entregar el resultado."],
];

function Cotio() {
  return (
    <div className="mt-5 grid gap-2">
      {COTIO.map(([letra, nombre, que]) => (
        <div key={nombre} className="flex gap-3 rounded-2xl border border-line bg-ink-2/60 px-4 py-3">
          <span className="font-mono text-2xl font-bold text-teal">{letra}</span>
          <div>
            <p className="text-lg font-semibold">{nombre}</p>
            <p className="text-base text-muted">{que}</p>
          </div>
        </div>
      ))}
      <p className="text-sm text-faint">En la pantalla se arma un prompt de usuario y uno de sistema, pieza por pieza.</p>
    </div>
  );
}

function CasoSimulador() {
  return (
    <div className="mt-5 grid gap-3">
      <div className="rounded-2xl border border-line bg-ink-2/60 p-4">
        <p className="text-lg font-bold">☕ Lucía</p>
        <p className="mt-1 text-base leading-relaxed text-muted">
          Abre su cafetería el viernes. Contrató la entrega e instalación de los equipos por US$ 3.000.
        </p>
        <p className="mt-2 text-base italic">«Recibí las cajas, pero todavía no funciona.»</p>
      </div>
      <div className="rounded-2xl border border-line bg-ink-2/60 p-4">
        <p className="text-lg font-bold">🔧 Diego</p>
        <p className="mt-1 text-base leading-relaxed text-muted">
          Entregó los equipos. Falta un módulo para que la máquina de hielo funcione. Necesita cobrar para conseguirlo.
        </p>
        <p className="mt-2 text-base italic">«Cumplí con la entrega. Corresponde el saldo.»</p>
      </div>
    </div>
  );
}
