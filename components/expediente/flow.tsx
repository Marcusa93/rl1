"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParticipantRow } from "@/lib/types";
import {
  CASOS,
  MOMENTOS,
  FICHA_CAMPOS,
  EXP_ACTIVITY,
  EXP_ITEM,
  buildAuditoriaPrompt,
  buildDiagnosticoPrompt,
  emptyState,
  getCaso,
  type ExpedienteState,
  type FichaData,
} from "@/lib/expediente";
import { Button, Spinner } from "@/components/ui";
import { AiPrompt } from "./ai-prompt";
import { DownloadFicha } from "./download-ficha";
import { cn } from "@/lib/utils";

export function ExpedienteFlow({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [state, setState] = useState<ExpedienteState | null>(null);
  const [view, setView] = useState(1);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/session/${slug}/my-responses`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const row = (d.responses ?? []).find(
          (r: { activity: string; item_key: string }) =>
            r.activity === EXP_ACTIVITY && r.item_key === EXP_ITEM,
        );
        const loaded = row?.payload
          ? ({ ...emptyState(), ...row.payload } as ExpedienteState)
          : emptyState();
        setState(loaded);
        setView(loaded.momento || 1);
      })
      .catch(() => setState(emptyState()));
    return () => {
      active = false;
    };
  }, [slug]);

  const persist = useCallback(
    (next: ExpedienteState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/session/${slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity: EXP_ACTIVITY, item_key: EXP_ITEM, payload: next }),
        }).catch(() => {});
      }, 600);
    },
    [slug],
  );

  const update = useCallback(
    (patch: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => {
      setState((prev) => {
        if (!prev) return prev;
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        persist(next);
        return next;
      });
    },
    [persist],
  );

  if (!state) return <Spinner />;
  const caso = getCaso(state.caso);

  function goTo(n: number) {
    if (!state!.caso && n > 1) return; // hasta elegir caso, solo momento 1
    setView(n);
    update((s) => ({ ...s, momento: Math.max(s.momento, n) }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <Stepper view={view} onPick={goTo} hasCaso={!!state.caso} />
      <div className="mt-5">
        {view === 1 && <Momento1 state={state} update={update} goTo={goTo} />}
        {view === 2 && caso && <Momento2 caso={caso} state={state} update={update} goTo={goTo} />}
        {view === 3 && caso && <Momento3 caso={caso} state={state} update={update} goTo={goTo} />}
        {view === 4 && caso && (
          <Momento4 caso={caso} state={state} update={update} slug={slug} me={me} />
        )}
      </div>
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({
  view,
  onPick,
  hasCaso,
}: {
  view: number;
  onPick: (n: number) => void;
  hasCaso: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex min-w-max gap-2">
        {MOMENTOS.map((m) => {
          const unlocked = hasCaso || m.n === 1;
          const active = m.n === view;
          return (
            <button
              key={m.n}
              onClick={() => onPick(m.n)}
              disabled={!unlocked}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition",
                active
                  ? "border-teal/70 bg-teal/15 text-teal"
                  : unlocked
                    ? "border-line bg-panel/40 text-muted hover:border-teal/50"
                    : "border-line/40 bg-panel/20 text-faint opacity-50",
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-ink-2/70 font-mono text-[11px]">
                {m.n}
              </span>
              {m.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- helpers UI ----------
function Head({ n, titulo, bajada }: { n: number; titulo: string; bajada: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">Momento {n} de 4</p>
      <h2 className="mt-0.5 text-2xl font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{bajada}</p>
    </div>
  );
}

function Next({ onNext, label = "Continuar →" }: { onNext: () => void; label?: string }) {
  return (
    <div className="mt-6 border-t border-line/60 pt-4">
      <Button onClick={onNext} className="w-full sm:w-auto">
        {label}
      </Button>
    </div>
  );
}

// ---------- Momento 1 · El caso ----------
function Momento1({
  state,
  update,
  goTo,
}: {
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
  goTo: (n: number) => void;
}) {
  const caso = getCaso(state.caso);

  if (!caso) {
    return (
      <div className="rise">
        <Head n={1} titulo="Elegí tu caso" bajada="Trabajás este caso todo el laboratorio. Tocá uno." />
        <div className="grid gap-3">
          {CASOS.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                update((s) => ({ ...s, caso: c.id, momento: Math.max(s.momento, 1) }));
              }}
              className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-teal/60"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.emoji}</span>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {c.area}
                </span>
              </div>
              <h3 className="mt-2 font-semibold">{c.titulo}</h3>
              <p className="text-sm text-muted">{c.caratula}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rise">
      <Head n={1} titulo="El caso" bajada="Esto es lo que sabés del caso. Solo leé: no hay que escribir nada." />
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet">
          {caso.emoji} {caso.area} · {caso.caratula}
        </p>
        <p className="mt-3 text-[15px] italic leading-relaxed text-foreground">«{caso.relato}»</p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-teal">Lo que aparece cuando lo interrogás bien</p>
        <ul className="mt-2 space-y-1.5">
          {caso.ampliacion.map((a, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted">
              <span className="text-teal">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={() => {
          update({ caso: null });
        }}
        className="mt-3 text-xs text-faint underline-offset-2 hover:text-magenta hover:underline"
      >
        Cambiar de caso
      </button>

      <Next onNext={() => goTo(2)} label="Diagnosticar con IA →" />
    </div>
  );
}

// ---------- Momento 2 · Diagnosticá con IA ----------
function Momento2({
  caso,
  state,
  update,
  goTo,
}: {
  caso: NonNullable<ReturnType<typeof getCaso>>;
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
  goTo: (n: number) => void;
}) {
  return (
    <div className="rise">
      <Head
        n={2}
        titulo="Diagnosticá con IA"
        bajada="Tocá un botón: la IA te ordena el caso (hechos, qué falta, riesgos). El prompt ya está hecho."
      />

      <AiPrompt
        base={buildDiagnosticoPrompt(caso)}
        titulo="Abrí el diagnóstico en tu IA"
        bajada="Copia el prompt y abre tu chat. ¿Querés ver cómo está armado con el método COTIO? Tocá «Ver / editar»."
      />

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">
          En una línea: ¿qué te ayudó a ver la IA? <span className="text-faint">(opcional)</span>
        </label>
        <textarea
          value={state.diagnosticoNota}
          onChange={(e) => update({ diagnosticoNota: e.target.value })}
          rows={2}
          placeholder="Ej: me ordenó los indicios de subordinación que no había visto."
          className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      <Next onNext={() => goTo(3)} label="Buscar la trampa →" />
    </div>
  );
}

// ---------- Momento 3 · La trampa ----------
function Momento3({
  caso,
  state,
  update,
  goTo,
}: {
  caso: NonNullable<ReturnType<typeof getCaso>>;
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
  goTo: (n: number) => void;
}) {
  const toggle = (idx: string) =>
    update((s) => {
      const has = s.alucinaciones.includes(idx);
      return {
        ...s,
        alucinaciones: has ? s.alucinaciones.filter((x) => x !== idx) : [...s.alucinaciones, idx],
      };
    });

  return (
    <div className="rise">
      <Head
        n={3}
        titulo="La trampa"
        bajada="Acá está la prueba del caso y un dato nuevo. Pedile a la IA que la audite… y fijate dónde se equivoca."
      />

      {/* Prueba */}
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">La prueba que aporta el cliente</p>
        <ul className="mt-2 space-y-1.5">
          {caso.documentos.map((d) => (
            <li key={d.id} className="text-sm text-muted">
              <span className="font-mono text-xs text-faint">{d.id.toUpperCase()}</span> · {d.titulo}
            </li>
          ))}
        </ul>
      </div>

      {/* Dato sorpresa */}
      <div className="mt-3 rounded-2xl border border-amber-400/40 bg-amber-400/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Dato nuevo</p>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground">{caso.datoSorpresa}</p>
      </div>

      {/* Prompt auditoría */}
      <div className="mt-4">
        <AiPrompt
          base={buildAuditoriaPrompt(caso)}
          titulo="Pedile a la IA que audite la prueba"
          bajada="El prompt ya incluye la prueba y el dato nuevo. Abrilo en tu chat y leé qué responde."
        />
      </div>

      {/* Detección de alucinación (tap) */}
      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">
          ¿Cuál de estos errores cometió (o casi comete) la IA?
        </p>
        <p className="text-xs text-faint">Tocá los que detectaste. Este es el corazón del laboratorio.</p>
        <div className="mt-3 space-y-2">
          {caso.riesgosIA.map((r, i) => {
            const idx = String(i);
            const sel = state.alucinaciones.includes(idx);
            return (
              <button
                key={i}
                onClick={() => toggle(idx)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-xl border p-3 text-left text-sm transition",
                  sel ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-ink-2/40 text-muted hover:border-teal/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
                    sel ? "border-teal bg-teal text-ink" : "border-line",
                  )}
                >
                  {sel && "✓"}
                </span>
                <span>{r}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3">
          <label className="text-sm font-medium text-foreground">
            ¿Por qué no le harías caso? <span className="text-faint">(opcional, una línea)</span>
          </label>
          <textarea
            value={state.alucinacionPorque}
            onChange={(e) => update({ alucinacionPorque: e.target.value })}
            rows={2}
            className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none focus:border-teal/60"
          />
        </div>
      </div>

      <Next onNext={() => goTo(4)} label="Tomar la decisión →" />
    </div>
  );
}

// ---------- Momento 4 · Tu decisión ----------
function Momento4({
  caso,
  state,
  update,
  slug,
  me,
}: {
  caso: NonNullable<ReturnType<typeof getCaso>>;
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
  slug: string;
  me: ParticipantRow;
}) {
  const setFicha = (k: keyof FichaData, v: string) =>
    update((s) => ({ ...s, ficha: { ...s.ficha, [k]: v } }));

  function finalizar() {
    update({ completado: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="rise">
      <Head n={4} titulo="Tu decisión" bajada="Elegí tu estrategia y cerrá con tu criterio. Esto es lo que la IA no puede hacer por vos." />

      {/* Estrategia (tap) */}
      <p className="mb-2 text-sm font-semibold text-muted">Elegí una vía</p>
      <div className="space-y-2">
        {caso.hipotesis.map((h) => {
          const sel = state.estrategia === h.id;
          return (
            <button
              key={h.id}
              onClick={() => update({ estrategia: h.id })}
              className={cn(
                "w-full rounded-2xl border p-4 text-left transition",
                sel ? "border-teal/70 bg-teal/10" : "border-line bg-panel/40 hover:border-teal/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full border",
                    sel ? "border-teal bg-teal" : "border-line",
                  )}
                >
                  {sel && <span className="size-1.5 rounded-full bg-ink" />}
                </span>
                <h3 className="text-sm font-semibold">{h.titulo}</h3>
              </div>
              <p className="mt-1.5 text-xs text-muted">{h.texto}</p>
            </button>
          );
        })}
      </div>

      {/* Ficha corta */}
      <div className="mt-5 space-y-3">
        {FICHA_CAMPOS.map((c, i) => (
          <div key={c.key}>
            <label className="text-sm font-medium text-foreground">
              {c.label}
              {i > 0 && <span className="text-faint"> (opcional)</span>}
            </label>
            <p className="text-xs text-faint">{c.hint}</p>
            <textarea
              value={state.ficha[c.key]}
              onChange={(e) => setFicha(c.key, e.target.value)}
              rows={2}
              className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none focus:border-teal/60"
            />
          </div>
        ))}
      </div>

      {state.completado ? (
        <div className="mt-6 rounded-2xl border border-teal/50 bg-teal/10 p-4 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-1 font-semibold text-teal">¡Laboratorio completado!</p>
          <p className="mt-1 text-sm text-muted">Tu decisión quedó registrada para la puesta en común.</p>
          <div className="mx-auto mt-4 max-w-xs">
            <DownloadFicha slug={slug} me={me} />
          </div>
        </div>
      ) : (
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button onClick={finalizar} className="w-full sm:w-auto">
            Finalizar y guardar
          </Button>
          <p className="mt-2 text-xs text-faint">Con tu decisión final alcanza. Lo demás es opcional.</p>
        </div>
      )}
    </div>
  );
}
