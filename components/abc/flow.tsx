"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParticipantRow } from "@/lib/types";
import {
  ABC_ACTIVITY,
  ABC_ITEM,
  ANALOGIAS,
  FRASE_ANCLA,
  PASOS,
  PERFIL_PREGUNTAS,
  SITUACIONES,
  TARJETAS,
  casoSystem,
  casoUserMsg,
  emptyAbcState,
  getTarjeta,
  promptMemoria,
  resumenMemoria,
  type AbcState,
} from "@/lib/abc";
import { streamGenerate } from "@/components/use-stream";
import { Button, Spinner } from "@/components/ui";
import { CopyBox } from "@/components/expediente/copy-box";
import { Copiloto } from "./copiloto";
import { cn } from "@/lib/utils";

type UpdateFn = (p: Partial<AbcState> | ((s: AbcState) => AbcState)) => void;

export function AbcFlow({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [state, setState] = useState<AbcState | null>(null);
  const [view, setView] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/session/${slug}/my-responses`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const row = (d.responses ?? []).find(
          (r: { activity: string; item_key: string }) => r.activity === ABC_ACTIVITY && r.item_key === ABC_ITEM,
        );
        const loaded = row?.payload ? ({ ...emptyAbcState(), ...row.payload } as AbcState) : emptyAbcState();
        setState(loaded);
        setView(loaded.paso || 0);
      })
      .catch(() => setState(emptyAbcState()));
    return () => {
      active = false;
    };
  }, [slug]);

  const persist = useCallback(
    (next: AbcState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/session/${slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity: ABC_ACTIVITY, item_key: ABC_ITEM, payload: next }),
        }).catch(() => {});
      }, 600);
    },
    [slug],
  );

  const update = useCallback<UpdateFn>(
    (patch) => {
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

  function goTo(n: number) {
    setView(n);
    update((s) => ({ ...s, paso: Math.max(s.paso, n) }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <Stepper view={view} onPick={goTo} />
      <div className="mt-5">
        {view === 0 && <Paso0 state={state} update={update} goTo={goTo} nombre={me.name} />}
        {view === 1 && <Paso1 goTo={goTo} />}
        {view === 2 && <Paso2 state={state} update={update} goTo={goTo} nombre={me.name} />}
        {view === 3 && <Paso3 state={state} update={update} goTo={goTo} slug={slug} nombre={me.name} />}
        {view === 4 && <Paso4 state={state} update={update} />}
      </div>
      <Copiloto
        slug={slug}
        ctx={{ paso: view, tarjeta: state.tarjeta }}
        onUse={() => update((s) => ({ ...s, copilotoUsos: (s.copilotoUsos ?? 0) + 1 }))}
      />
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({ view, onPick }: { view: number; onPick: (n: number) => void }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex min-w-max gap-2">
        {PASOS.map((m) => {
          const active = m.n === view;
          return (
            <button
              key={m.n}
              onClick={() => onPick(m.n)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-medium transition",
                active ? "border-teal/70 bg-teal/15 text-teal" : "border-line bg-panel/40 text-muted hover:border-teal/50",
              )}
            >
              <span className="flex size-5 items-center justify-center rounded-full bg-ink-2/70 font-mono text-[11px]">
                {m.n + 1}
              </span>
              {m.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Head({ n, titulo, bajada }: { n: number; titulo: string; bajada: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">Paso {n + 1} de {PASOS.length}</p>
      <h2 className="mt-0.5 text-2xl font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{bajada}</p>
    </div>
  );
}

function Chip({ sel, onClick, children }: { sel: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border p-3 text-left text-sm transition",
        sel ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-ink-2/40 text-muted hover:border-teal/50",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
          sel ? "border-teal bg-teal text-ink" : "border-line",
        )}
      >
        {sel && "✓"}
      </span>
      <span>{children}</span>
    </button>
  );
}

// ---------- Paso 0 · Vos (onboarding) ----------
function Paso0({
  state,
  update,
  goTo,
  nombre,
}: {
  state: AbcState;
  update: UpdateFn;
  goTo: (n: number) => void;
  nombre: string;
}) {
  const toggleSit = (id: string) =>
    update((s) => {
      const has = s.situaciones.includes(id);
      if (has) return { ...s, situaciones: s.situaciones.filter((x) => x !== id) };
      if (s.situaciones.length >= 2) return s; // máx 2
      return { ...s, situaciones: [...s.situaciones, id] };
    });

  const listo = state.ocupacion.trim().length >= 2 && state.situaciones.length >= 1;

  return (
    <div className="rise">
      <Head n={0} titulo={`Hola ${nombre.split(/\s+/)[0]} 👋`} bajada="Contanos un poco de vos. No hace falta saber nada de IA todavía." />

      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">¿Qué hacés en el día a día?</label>
        <p className="text-xs text-faint">En una frase, como se lo contarías a alguien.</p>
        <input
          value={state.ocupacion}
          onChange={(e) => update({ ocupacion: e.target.value })}
          placeholder="Ej: tengo una rotisería · soy maestra · atiendo un kiosco · trabajo en una oficina"
          className="mt-2 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-muted">¿Cuál de estas te suena? <span className="text-faint">(elegí una o dos)</span></p>
        <div className="mt-2 space-y-2">
          {SITUACIONES.map((s) => (
            <Chip key={s.id} sel={state.situaciones.includes(s.id)} onClick={() => toggleSit(s.id)}>
              {s.emoji} {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={() => goTo(1)} disabled={!listo} className="w-full sm:w-auto">
          Continuar →
        </Button>
        {!listo && <p className="mt-2 text-xs text-faint">Escribí qué hacés y elegí al menos una situación.</p>}
      </div>
    </div>
  );
}

// ---------- Paso 1 · Qué es la IA (analogías) ----------
function Paso1({ goTo }: { goTo: (n: number) => void }) {
  return (
    <div className="rise">
      <Head n={1} titulo="Qué es, en criollo" bajada="No es un buscador. Es como tener a alguien que te ayuda a hacer las cosas." />
      <div className="grid gap-3 sm:grid-cols-2">
        {ANALOGIAS.map((a) => (
          <div key={a.titulo} className="rounded-2xl border border-line bg-panel/40 p-4">
            <p className="text-3xl">{a.emoji}</p>
            <h3 className="mt-2 font-semibold">{a.titulo}</h3>
            <p className="mt-1 text-sm text-muted">{a.texto}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border-gradient p-4 text-sm text-foreground">
        La idea clave: <strong>cuanto mejor le explicás qué querés, mejor te responde.</strong> Eso es todo lo que
        necesitás saber para empezar.
      </div>
      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={() => goTo(2)} className="w-full sm:w-auto">Continuar →</Button>
      </div>
    </div>
  );
}

// ---------- Paso 2 · Tu memoria ----------
function Paso2({
  state,
  update,
  goTo,
  nombre,
}: {
  state: AbcState;
  update: UpdateFn;
  goTo: (n: number) => void;
  nombre: string;
}) {
  const setUni = (key: "negocio" | "equipo" | "estilo", v: string) => update({ [key]: v } as Partial<AbcState>);
  const toggleEscribe = (id: string) =>
    update((s) => ({
      ...s,
      escribe: s.escribe.includes(id) ? s.escribe.filter((x) => x !== id) : [...s.escribe, id],
    }));

  const listo = !!state.negocio && !!state.equipo && !!state.estilo;

  return (
    <div className="rise">
      <Head n={2} titulo="Tu memoria" bajada="Esto hace que la IA te conozca y te responda como a vos te sirve." />

      <div className="rounded-2xl border border-violet/40 bg-violet/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet">Lo que tu asistente sabe de vos</p>
        <p className="mt-1.5 text-sm italic text-foreground">«{resumenMemoria(state, nombre)}»</p>
        <p className="mt-2 text-xs text-faint">¿Alcanza con eso? Sumá un par de datos más y vas a ver la diferencia.</p>
      </div>

      <div className="mt-4 space-y-4">
        {PERFIL_PREGUNTAS.map((p) => (
          <div key={p.id}>
            <p className="mb-1.5 text-sm font-medium text-foreground">{p.q}</p>
            <div className={cn("grid gap-2", p.multi ? "sm:grid-cols-2" : "grid-cols-2")}>
              {p.opciones.map((o) => {
                const sel = p.multi
                  ? state.escribe.includes(o.id)
                  : (state[p.id as "negocio" | "equipo" | "estilo"] as string | null) === o.id;
                return (
                  <Chip
                    key={o.id}
                    sel={sel}
                    onClick={() => (p.multi ? toggleEscribe(o.id) : setUni(p.id as "negocio" | "equipo" | "estilo", o.id))}
                  >
                    {o.label}
                  </Chip>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {listo && (
        <div className="mt-5 rounded-2xl border border-teal/40 bg-teal/5 p-4">
          <p className="text-sm font-semibold text-teal">Tu prompt de memoria</p>
          <p className="mt-1 text-xs text-muted">
            Copialo y pegalo al empezar a hablar con cualquier IA (Claude, ChatGPT, Gemini). Le decís quién sos de una.
          </p>
          <div className="mt-3">
            <CopyBox text={promptMemoria(state, nombre)} label="Copiar mi memoria" />
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={() => goTo(3)} disabled={!listo} className="w-full sm:w-auto">
          Ir a mi primer caso →
        </Button>
        {!listo && <p className="mt-2 text-xs text-faint">Respondé las preguntas de arriba para armar tu memoria.</p>}
      </div>
    </div>
  );
}

// ---------- Paso 3 · Tu primer caso real ----------
function Paso3({
  state,
  update,
  goTo,
  slug,
  nombre,
}: {
  state: AbcState;
  update: UpdateFn;
  goTo: (n: number) => void;
  slug: string;
  nombre: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const t = getTarjeta(state.tarjeta);

  async function generar() {
    if (busy || !state.subtarea) return;
    setBusy(true);
    setErr("");
    update({ resultado: "" });
    try {
      await streamGenerate(
        slug,
        [{ role: "user", content: casoUserMsg(state) }],
        (chunk) => update((s) => ({ ...s, resultado: s.resultado + chunk })),
        { system: casoSystem(state, nombre), temperature: 0.6, maxTokens: 900 },
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Elegir tarjeta
  if (!t) {
    return (
      <div className="rise">
        <Head n={3} titulo="Tu primer caso real" bajada="Elegí lo que más se parezca a algo tuyo. Vas a usar la IA de verdad, ahora." />
        <div className="grid gap-3">
          {TARJETAS.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ tarjeta: c.id, subtarea: null, resultado: "" })}
              className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-teal/60"
            >
              <p className="text-2xl">{c.emoji}</p>
              <h3 className="mt-1 font-semibold">{c.titulo}</h3>
              <p className="mt-0.5 text-sm text-muted">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rise">
      <Head n={3} titulo={`${t.emoji} ${t.titulo}`} bajada="Decile qué necesitás y contale lo mínimo. La IA te va a responder acá abajo." />

      <button
        onClick={() => update({ tarjeta: null, subtarea: null, resultado: "" })}
        className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel/40 px-3 py-2 text-sm font-medium text-muted transition hover:border-teal/60 hover:text-teal"
      >
        ← Elegir otra tarjeta
      </button>

      <p className="mb-2 text-sm font-semibold text-muted">1 · ¿Qué querés que te ayude a hacer?</p>
      <div className="space-y-2">
        {t.subtareas.map((s) => (
          <Chip key={s.id} sel={state.subtarea === s.id} onClick={() => update({ subtarea: s.id })}>
            {s.label}
          </Chip>
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">2 · Contanos lo mínimo</label>
        <p className="text-xs text-faint">{t.detalleHint}</p>
        <textarea
          value={state.detalle}
          onChange={(e) => update({ detalle: e.target.value })}
          rows={4}
          placeholder="Escribilo en tus palabras, no hace falta que quede bien."
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      <div className="mt-4">
        <Button onClick={generar} disabled={busy || !state.subtarea} className="w-full sm:w-auto">
          {busy ? <Spinner /> : state.resultado ? "Probar de nuevo" : "3 · Pedírselo a la IA →"}
        </Button>
        {!state.subtarea && <p className="mt-2 text-xs text-faint">Elegí qué querés hacer (paso 1).</p>}
      </div>

      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}

      {state.resultado && (
        <div className="mt-4 rounded-2xl border border-teal/50 bg-teal/5 p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-teal">Lo que te armó la IA</p>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
            {state.resultado}
            {busy && <Spinner className="ml-1 inline-block" />}
          </div>
          {!busy && (
            <p className="mt-3 text-xs text-faint">
              ¿No te convenció? Tocá el 💬 copiloto (abajo a la derecha) y pedile cómo ajustarlo, o cambiá el detalle y
              probá de nuevo.
            </p>
          )}
        </div>
      )}

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button variant="outline" onClick={() => goTo(4)} className="w-full sm:w-auto">
          Terminar →
        </Button>
      </div>
    </div>
  );
}

// ---------- Paso 4 · Cierre ----------
function Paso4({ state, update }: { state: AbcState; update: UpdateFn }) {
  return (
    <div className="rise">
      <Head n={4} titulo="Para llevarte" bajada="Una sola idea, en tus palabras." />

      <div className="rounded-2xl border-gradient p-5 text-center">
        <p className="text-lg font-semibold text-foreground">{FRASE_ANCLA}</p>
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">¿Qué te llevás de hoy? Una cosa.</label>
        <textarea
          value={state.aprendi}
          onChange={(e) => update({ aprendi: e.target.value })}
          rows={3}
          placeholder="Ej: que si le explico bien qué quiero, me ahorra un montón de tiempo."
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      {state.completado ? (
        <div className="mt-6 rounded-2xl border border-teal/50 bg-teal/10 p-4 text-center">
          <p className="text-2xl">🎉</p>
          <p className="mt-1 font-semibold text-teal">¡Listo! Diste tu primer paso con IA.</p>
          <p className="mt-1 text-sm text-muted">Nos vemos en la próxima clase. Tu copiloto se va a acordar de esto.</p>
          <button onClick={() => update({ completado: false })} className="mt-3 text-xs text-faint underline-offset-2 hover:underline">
            seguir editando
          </button>
        </div>
      ) : (
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button
            onClick={() => {
              update({ completado: true });
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            disabled={state.aprendi.trim().length < 3}
            className="w-full sm:w-auto"
          >
            Guardar y terminar
          </Button>
          {state.aprendi.trim().length < 3 && <p className="mt-2 text-xs text-faint">Escribí una cosa que aprendiste para cerrar.</p>}
        </div>
      )}
    </div>
  );
}
