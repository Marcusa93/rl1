"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParticipantRow } from "@/lib/types";
import {
  CASOS,
  ETAPAS,
  FICHA_CAMPOS,
  ROLES,
  SYSTEM_PROMPT,
  EXP_ACTIVITY,
  EXP_ITEM,
  emptyState,
  getCaso,
  type CasoId,
  type ExpedienteState,
  type FichaData,
} from "@/lib/expediente";
import { Button, Spinner } from "@/components/ui";
import { OpenInAi } from "@/components/open-in-ai";
import { CopyBox } from "./copy-box";
import { DownloadFicha } from "./download-ficha";
import { cn } from "@/lib/utils";

export function ExpedienteFlow({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [state, setState] = useState<ExpedienteState | null>(null);
  const [view, setView] = useState(1); // etapa que se está mirando
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // cargar estado guardado
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
        const loaded = row?.payload ? ({ ...emptyState(), ...row.payload } as ExpedienteState) : emptyState();
        setState(loaded);
        setView(loaded.etapa);
      })
      .catch(() => {
        setState(emptyState());
      });
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

  // actualizar estado + guardar
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
    if (n <= state!.etapa) setView(n);
  }

  // avanza: sube la etapa máxima si corresponde y mueve la vista
  function advance(to: number) {
    update((s) => ({ ...s, etapa: Math.max(s.etapa, to) }));
    setView(to);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      {/* Stepper */}
      <Stepper etapaMax={state.etapa} view={view} onPick={goTo} caso={state.caso} />

      <div className="mt-5">
        {view === 1 && <Etapa1 state={state} update={update} advance={advance} />}
        {view >= 2 && caso && (
          <>
            {view === 2 && <Etapa2 caso={caso} advance={advance} />}
            {view === 3 && <Etapa3 caso={caso} state={state} update={update} advance={advance} />}
            {view === 4 && <Etapa4 caso={caso} advance={advance} />}
            {view === 5 && <Etapa5 caso={caso} state={state} update={update} advance={advance} />}
            {view === 6 && <Etapa6 caso={caso} state={state} update={update} advance={advance} />}
            {view === 7 && <Etapa7 caso={caso} state={state} update={update} advance={advance} />}
            {view === 8 && <Etapa8 state={state} update={update} advance={advance} />}
            {view === 9 && (
              <Etapa9 caso={caso} state={state} update={update} advance={advance} slug={slug} me={me} />
            )}
            {view === 10 && <Etapa10 state={state} update={update} slug={slug} me={me} caso={caso} />}
          </>
        )}
      </div>
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({
  etapaMax,
  view,
  onPick,
  caso,
}: {
  etapaMax: number;
  view: number;
  onPick: (n: number) => void;
  caso: CasoId | null;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex min-w-max gap-1.5">
        {ETAPAS.map((e) => {
          const unlocked = e.n <= etapaMax;
          const active = e.n === view;
          return (
            <button
              key={e.n}
              onClick={() => onPick(e.n)}
              disabled={!unlocked}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                active
                  ? "border-teal/70 bg-teal/15 text-teal"
                  : unlocked
                    ? "border-line bg-panel/40 text-muted hover:border-teal/50"
                    : "border-line/40 bg-panel/20 text-faint opacity-50",
              )}
            >
              <span className="font-mono">{e.n}</span>
              <span className="hidden sm:inline">{e.short}</span>
              {!unlocked && <span>🔒</span>}
            </button>
          );
        })}
      </div>
      {!caso && (
        <p className="mt-2 text-xs text-faint">Elegí un caso para desbloquear las etapas.</p>
      )}
    </div>
  );
}

// ---------- bloques reutilizables ----------
function EtapaHead({ n, titulo, sub }: { n: number; titulo: string; sub?: string }) {
  return (
    <div className="mb-4">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">Etapa {n}</p>
      <h2 className="mt-0.5 text-xl font-semibold">{titulo}</h2>
      {sub && <p className="mt-1 text-sm text-muted">{sub}</p>}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="mb-3">
      <label className="text-sm font-medium text-foreground">{label}</label>
      {hint && <p className="text-xs text-faint">{hint}</p>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
      />
    </div>
  );
}

function NextBar({ ok, hint, onNext, label = "Continuar →" }: { ok: boolean; hint: string; onNext: () => void; label?: string }) {
  return (
    <div className="mt-5 border-t border-line/60 pt-4">
      <Button onClick={onNext} disabled={!ok} className="w-full sm:w-auto">
        {label}
      </Button>
      {!ok && <p className="mt-2 text-xs text-faint">{hint}</p>}
    </div>
  );
}

type StageProps = {
  caso: NonNullable<ReturnType<typeof getCaso>>;
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
  advance: (to: number) => void;
};

// ---------- Etapa 1 · Selección de caso ----------
function Etapa1({
  state,
  update,
  advance,
}: {
  state: ExpedienteState;
  update: StageProps["update"];
  advance: (to: number) => void;
}) {
  function elegir(id: CasoId) {
    update((s) => ({ ...s, caso: id, etapa: Math.max(s.etapa, 2) }));
    advance(2);
  }
  return (
    <div className="rise">
      <EtapaHead
        n={1}
        titulo="Elegí tu caso"
        sub="Vas a trabajar este caso durante todo el laboratorio. No se puede cambiar después: elegí con criterio."
      />
      <div className="grid gap-3">
        {CASOS.map((c) => {
          const sel = state.caso === c.id;
          return (
            <button
              key={c.id}
              onClick={() => elegir(c.id)}
              className={cn(
                "rounded-2xl border p-4 text-left transition",
                sel ? "border-teal/70 bg-teal/10" : "border-line bg-panel/40 hover:border-teal/50",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.emoji}</span>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {c.area}
                </span>
              </div>
              <h3 className="mt-2 font-semibold">{c.titulo}</h3>
              <p className="text-sm text-muted">{c.caratula}</p>
              <p className="mt-2 text-xs text-faint">{c.objetivo}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Etapa 2 · Relato inicial ----------
function Etapa2({ caso, advance }: { caso: StageProps["caso"]; advance: (n: number) => void }) {
  return (
    <div className="rise">
      <EtapaHead
        n={2}
        titulo="El cliente te cuenta su caso"
        sub="Así llega un caso real: emocional, desordenado e incompleto. Leelo entero antes de avanzar."
      />
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-violet">
          {caso.emoji} {caso.caratula}
        </p>
        <p className="mt-3 text-[15px] italic leading-relaxed text-foreground">«{caso.relato}»</p>
      </div>

      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">Antes de empezar: prepará tu IA</p>
        <p className="mt-1 text-xs text-muted">
          Abrí tu chat (Claude, ChatGPT o Gemini) y pegá esto como <b>primera instrucción</b>. Es lo
          que convierte a la IA en un consultor que te interroga, no en un oráculo que resuelve.
        </p>
        <div className="mt-3">
          <CopyBox text={SYSTEM_PROMPT} label="Copiar system prompt" />
        </div>
      </div>

      <NextBar ok hint="" onNext={() => advance(3)} label="Ya leí el relato → Diagnóstico" />
    </div>
  );
}

// ---------- Etapa 3 · Diagnóstico con IA ----------
function Etapa3({ caso, state, update, advance }: StageProps) {
  const d = state.diagnostico;
  const set = (k: keyof typeof d, v: string) =>
    update((s) => ({ ...s, diagnostico: { ...s.diagnostico, [k]: v } }));
  const ok = d.hechos.trim() && d.faltantes.trim() && d.riesgos.trim();

  const promptConRelato = `${caso.cotioPrompt.replace("(pegá acá el relato inicial del cliente)", caso.relato)}`;

  return (
    <div className="rise">
      <EtapaHead
        n={3}
        titulo="Diagnóstico estratégico con IA"
        sub="Usá el prompt COTIO en tu chat para ordenar el caso. Después volcá tu propio análisis acá: lo que decidís es tuyo, no de la IA."
      />

      <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">Prompt COTIO de esta etapa</p>
        <p className="mt-1 text-xs text-muted">
          Ya incluye el relato del cliente como Input. Copialo o abrilo directo en tu IA.
        </p>
        <div className="mt-3">
          <CopyBox text={promptConRelato} label="Copiar prompt COTIO" />
        </div>
        <div className="mt-3">
          <OpenInAi prompt={promptConRelato} />
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold text-muted">Tu diagnóstico (obligatorio para avanzar)</p>
        <Field
          label="Clasificación de hechos"
          hint="Hechos que demuestran subordinación / antijuridicidad / tipicidad vs. hechos en contra."
          value={d.hechos}
          onChange={(v) => set("hechos", v)}
        />
        <Field
          label="Datos faltantes"
          hint="¿Qué información clave NO te dio el cliente y tenés que preguntar?"
          value={d.faltantes}
          onChange={(v) => set("faltantes", v)}
        />
        <Field
          label="Riesgos detectados"
          hint="Riesgos jurídicos del caso y alertas de alucinación que viste en la IA."
          value={d.riesgos}
          onChange={(v) => set("riesgos", v)}
        />
      </div>

      <details className="mt-2 rounded-xl border border-line bg-panel/40 p-3">
        <summary className="cursor-pointer text-xs font-semibold text-muted">
          Pista: alucinaciones típicas de este caso
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-xs text-faint">
          {caso.riesgosIA.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </details>

      <NextBar
        ok={Boolean(ok)}
        hint="Completá los tres campos del diagnóstico."
        onNext={() => advance(4)}
      />
    </div>
  );
}

// ---------- Etapa 4 · Ampliación por entrevista ----------
function Etapa4({ caso, advance }: { caso: StageProps["caso"]; advance: (n: number) => void }) {
  return (
    <div className="rise">
      <EtapaHead
        n={4}
        titulo="Ampliación por entrevista"
        sub="Esto es lo que el cliente NO contó al principio y que aparece cuando se lo interroga bien. Releé tu diagnóstico a la luz de esto."
      />
      <div className="space-y-2">
        {caso.ampliacion.map((a, i) => (
          <div key={i} className="rounded-xl border border-line bg-panel/40 p-3">
            <p className="text-sm text-foreground">{a}</p>
          </div>
        ))}
      </div>
      <NextBar ok hint="" onNext={() => advance(5)} label="Sigo con los documentos →" />
    </div>
  );
}

// ---------- Etapa 5 · Análisis de documentos ----------
function Etapa5({ caso, state, update, advance }: StageProps) {
  const obs = state.documentos.observaciones;
  const revisados = state.documentos.revisados;
  const toggle = (id: string) =>
    update((s) => {
      const has = s.documentos.revisados.includes(id);
      return {
        ...s,
        documentos: {
          ...s.documentos,
          revisados: has
            ? s.documentos.revisados.filter((x) => x !== id)
            : [...s.documentos.revisados, id],
        },
      };
    });
  const setObs = (v: string) =>
    update((s) => ({ ...s, documentos: { ...s.documentos, observaciones: v } }));
  const ok = obs.trim().length > 0;

  return (
    <div className="rise">
      <EtapaHead
        n={5}
        titulo="Análisis de documentos"
        sub="Cada documento parece prueba sólida, pero esconde un problema probatorio. Marcá los que revisaste y anotá las contradicciones que detectaste."
      />
      <div className="space-y-2">
        {caso.documentos.map((doc) => {
          const rev = revisados.includes(doc.id);
          return (
            <div key={doc.id} className="rounded-xl border border-line bg-panel/40 p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  <span className="mr-1 font-mono text-xs text-faint">{doc.id.toUpperCase()}</span>
                  {doc.titulo}
                </p>
                <label className="flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted">
                  <input type="checkbox" checked={rev} onChange={() => toggle(doc.id)} />
                  revisado
                </label>
              </div>
              <p className="mt-1.5 text-xs text-muted">{doc.contenido}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs font-semibold text-amber-300/80">
                  ⚠ Problema probatorio
                </summary>
                <p className="mt-1 text-xs text-faint">{doc.problema}</p>
              </details>
            </div>
          );
        })}
      </div>
      <div className="mt-4">
        <Field
          label="Contradicciones y problemas probatorios que detectaste"
          hint="¿Qué pruebas son frágiles, impugnables o se contradicen entre sí?"
          value={obs}
          onChange={setObs}
          rows={4}
        />
      </div>
      <NextBar ok={ok} hint="Anotá al menos una observación probatoria." onNext={() => advance(6)} />
    </div>
  );
}

// ---------- Etapa 6 · Elección de estrategia ----------
function Etapa6({ caso, state, update, advance }: StageProps) {
  function elegir(id: string) {
    const hip = caso.hipotesis.find((h) => h.id === id);
    update((s) => ({
      ...s,
      estrategia: id,
      ficha: { ...s.ficha, hipotesis: s.ficha.hipotesis || (hip ? hip.titulo : "") },
    }));
  }
  const ok = Boolean(state.estrategia);
  return (
    <div className="rise">
      <EtapaHead
        n={6}
        titulo="Elegí tu estrategia"
        sub="Hay más de una forma de leer los hechos. Elegí una vía. Esta decisión es tuya, no de la IA."
      />
      <div className="space-y-2">
        {caso.hipotesis.map((h) => {
          const sel = state.estrategia === h.id;
          return (
            <button
              key={h.id}
              onClick={() => elegir(h.id)}
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
      <NextBar ok={ok} hint="Elegí una hipótesis para avanzar." onNext={() => advance(7)} />
    </div>
  );
}

// ---------- Etapa 7 · Dato sorpresa ----------
function Etapa7({ caso, state, update, advance }: StageProps) {
  const ok = state.revisionSorpresa.trim().length > 0;
  return (
    <div className="rise">
      <EtapaHead n={7} titulo="Dato sorpresa" sub="Un caso no se resuelve con la primera versión del cliente. Esto cambia el tablero." />
      <div className="rounded-2xl border border-amber-400/40 bg-amber-400/5 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-300">Nuevo dato en el expediente</p>
        <p className="mt-2 text-sm leading-relaxed text-foreground">{caso.datoSorpresa}</p>
      </div>
      <div className="mt-4">
        <Field
          label="¿Cómo cambia tu posición?"
          hint="¿Mantenés tu estrategia, la ajustás o la cambiás? Justificá."
          value={state.revisionSorpresa}
          onChange={(v) => update({ revisionSorpresa: v })}
          rows={4}
        />
      </div>
      <NextBar ok={ok} hint="Escribí cómo revisás tu posición." onNext={() => advance(8)} />
    </div>
  );
}

// ---------- Etapa 8 · Deliberación por roles ----------
function Etapa8({
  state,
  update,
  advance,
}: {
  state: ExpedienteState;
  update: StageProps["update"];
  advance: (n: number) => void;
}) {
  const ok = Boolean(state.rol) && state.rolArgumento.trim().length > 0;
  return (
    <div className="rise">
      <EtapaHead
        n={8}
        titulo="Deliberación por roles"
        sub="Elegí un rol y argumentá el caso desde esa mirada. La fuerza de una estrategia se mide contra su mejor crítica."
      />
      <div className="grid gap-2 sm:grid-cols-2">
        {ROLES.map((r) => {
          const sel = state.rol === r.id;
          return (
            <button
              key={r.id}
              onClick={() => update({ rol: r.id })}
              className={cn(
                "rounded-xl border p-3 text-left transition",
                sel ? "border-teal/70 bg-teal/10" : "border-line bg-panel/40 hover:border-teal/50",
              )}
            >
              <h3 className="text-sm font-semibold">{r.nombre}</h3>
              <p className="mt-1 text-xs text-muted">{r.mision}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <Field
          label="Tu argumento desde el rol elegido"
          hint="Construí el mejor argumento posible desde esa posición."
          value={state.rolArgumento}
          onChange={(v) => update({ rolArgumento: v })}
          rows={4}
        />
      </div>
      <NextBar ok={ok} hint="Elegí un rol y escribí tu argumento." onNext={() => advance(9)} />
    </div>
  );
}

// ---------- Etapa 9 · Ficha de decisión ----------
function Etapa9({
  caso,
  state,
  update,
  advance,
  slug,
  me,
}: StageProps & { slug: string; me: ParticipantRow }) {
  const f = state.ficha;
  const set = (k: keyof FichaData, v: string) =>
    update((s) => ({ ...s, ficha: { ...s.ficha, [k]: v } }));
  const ok = FICHA_CAMPOS.every((c) => f[c.key].trim().length > 0);

  return (
    <div className="rise">
      <EtapaHead
        n={9}
        titulo="Ficha de decisión jurídica asistida"
        sub="El entregable del laboratorio. No es una demanda: es tu razonamiento profesional documentado."
      />
      <div className="mb-3 rounded-xl border border-line bg-panel/40 p-3">
        <p className="text-xs text-faint">Caso elegido y área del derecho</p>
        <p className="text-sm font-semibold text-foreground">
          {caso.emoji} {caso.titulo} · {caso.area} — {caso.caratula}
        </p>
      </div>
      {FICHA_CAMPOS.map((c) => (
        <Field
          key={c.key}
          label={c.label}
          hint={c.hint}
          value={f[c.key]}
          onChange={(v) => set(c.key, v)}
        />
      ))}
      {ok && (
        <div className="mt-3">
          <DownloadFicha slug={slug} me={me} />
        </div>
      )}
      <NextBar ok={ok} hint="Completá los nueve campos de la ficha." onNext={() => advance(10)} label="Guardar ficha → Cierre" />
    </div>
  );
}

// ---------- Etapa 10 · Uso responsable ----------
function Etapa10({
  state,
  update,
  slug,
  me,
  caso,
}: {
  state: ExpedienteState;
  update: StageProps["update"];
  slug: string;
  me: ParticipantRow;
  caso: StageProps["caso"];
}) {
  const setRegla = (i: number, v: string) =>
    update((s) => {
      const reglas = [...s.reglas];
      reglas[i] = v;
      return { ...s, reglas };
    });
  const ok = state.reglas.every((r) => r.trim().length > 0);

  function cerrar() {
    update({ completado: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="rise">
      <EtapaHead
        n={10}
        titulo="Cinco reglas de uso responsable"
        sub={`Escribí cinco reglas propias para usar IA en casos de tipo ${caso.area.toLowerCase()}. Son tuyas, las redactás vos.`}
      />
      <div className="space-y-2">
        {state.reglas.map((r, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="mt-2 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal/15 font-mono text-xs text-teal">
              {i + 1}
            </span>
            <input
              value={r}
              onChange={(e) => setRegla(i, e.target.value)}
              placeholder={`Regla ${i + 1}`}
              className="w-full rounded-lg border border-line bg-ink-2/70 px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-teal/60"
            />
          </div>
        ))}
      </div>

      {state.completado ? (
        <div className="mt-5 rounded-2xl border border-teal/50 bg-teal/10 p-4 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-1 font-semibold text-teal">¡Laboratorio completado!</p>
          <p className="mt-1 text-sm text-muted">
            Tu ficha y tus reglas quedaron registradas para la puesta en común.
          </p>
          <div className="mx-auto mt-4 max-w-xs">
            <DownloadFicha slug={slug} me={me} />
          </div>
        </div>
      ) : (
        <div className="mt-5 border-t border-line/60 pt-4">
          <Button onClick={cerrar} disabled={!ok} className="w-full sm:w-auto">
            Cerrar mi laboratorio
          </Button>
          {!ok && <p className="mt-2 text-xs text-faint">Escribí las cinco reglas.</p>}
        </div>
      )}
    </div>
  );
}
