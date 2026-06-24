"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ParticipantRow } from "@/lib/types";
import {
  CASOS_EJEMPLO,
  CHECKLIST_PROPIO,
  ESTACIONES,
  NOTEBOOKLM_URL,
  POSTA_ACTIVITY,
  POSTA_ITEM,
  SYSTEM_PROMPT_PARTES,
  SYSTEM_PROMPT_POSTA,
  TAREAS,
  VERIFICAR_CITA_PASOS,
  VERIFICAR_CITA_PROMPT,
  emptyPostaState,
  getEjemplo,
  getTarea,
  recomendarPara,
  type HerramientaProyecto,
  type PostaState,
  type Reco,
  type TareaDef,
} from "@/lib/posta";
import { AI_LINKS } from "@/lib/constants";
import { Button, Spinner } from "@/components/ui";
import { CopyBox } from "@/components/expediente/copy-box";
import { Marquito } from "./marquito";
import { cn } from "@/lib/utils";

// Links a crear un Proyecto nuevo en cada herramienta (estación 2).
const PROYECTO_LINKS: Record<HerramientaProyecto, { label: string; url: string; donde: string }> = {
  claude: {
    label: "Claude",
    url: "https://claude.ai/projects",
    donde: "Tocá «Proyectos» → «Nuevo proyecto». Las instrucciones van en «Set project instructions».",
  },
  gpt: {
    label: "ChatGPT",
    url: "https://chatgpt.com/projects",
    donde: "Tocá «Proyectos» → «Nuevo proyecto». Las instrucciones van en «Instrucciones».",
  },
};

type UpdateFn = (p: Partial<PostaState> | ((s: PostaState) => PostaState)) => void;

export function PostaFlow({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [state, setState] = useState<PostaState | null>(null);
  const [view, setView] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    fetch(`/api/session/${slug}/my-responses`)
      .then((r) => r.json())
      .then((d) => {
        if (!active) return;
        const row = (d.responses ?? []).find(
          (r: { activity: string; item_key: string }) =>
            r.activity === POSTA_ACTIVITY && r.item_key === POSTA_ITEM,
        );
        const loaded = row?.payload
          ? ({ ...emptyPostaState(), ...row.payload } as PostaState)
          : emptyPostaState();
        setState(loaded);
        setView(loaded.estacion || 0);
      })
      .catch(() => setState(emptyPostaState()));
    return () => {
      active = false;
    };
  }, [slug]);

  const persist = useCallback(
    (next: PostaState) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/session/${slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity: POSTA_ACTIVITY, item_key: POSTA_ITEM, payload: next }),
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
  const enPosta = state.modo === "propio" || state.modo === "ejemplo";
  const reco = recomendarPara(me.name);

  function goTo(n: number) {
    if (!enPosta && n > 0) return; // hasta elegir caso/tarea, solo la estación 0
    setView(n);
    update((s) => ({ ...s, estacion: Math.max(s.estacion, n) }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const marquito = (
    <Marquito
      slug={slug}
      ctx={{ estacion: view, modo: state.modo, ejemplo: state.ejemploId, tarea: state.tareaId }}
      onUse={() => update((s) => ({ ...s, marquitoUsos: (s.marquitoUsos ?? 0) + 1 }))}
    />
  );

  // Ejercicio aparte: verificar una cita (flujo distinto, sin estaciones).
  if (state.modo === "cita") {
    return (
      <div>
        <VerificarCita state={state} update={update} />
        {marquito}
      </div>
    );
  }

  return (
    <div>
      <Stepper view={view} onPick={goTo} enPosta={enPosta} />
      <div className="mt-5">
        {view === 0 && <Estacion0 state={state} update={update} goTo={goTo} reco={reco} nombre={me.name} />}
        {view === 1 && <Estacion1 state={state} update={update} goTo={goTo} />}
        {view === 2 && <Estacion2 state={state} update={update} goTo={goTo} />}
        {view === 3 && <Estacion3 state={state} update={update} goTo={goTo} />}
      </div>
      {marquito}
    </div>
  );
}

// ---------- Stepper ----------
function Stepper({
  view,
  onPick,
  enPosta,
}: {
  view: number;
  onPick: (n: number) => void;
  enPosta: boolean;
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex min-w-max gap-2">
        {ESTACIONES.map((m) => {
          const unlocked = enPosta || m.n === 0;
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
                {m.n === 0 ? "•" : m.n}
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
  const total = ESTACIONES.length - 1; // estaciones 1..3
  return (
    <div className="mb-4">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">
        {n === 0 ? "Antes de empezar" : `Estación ${n} de ${total}`}
      </p>
      <h2 className="mt-0.5 text-2xl font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{bajada}</p>
    </div>
  );
}

/** Caja que muestra el "testigo" que viene de la estación anterior. */
function Testigo({ titulo, texto }: { titulo: string; texto: string }) {
  if (!texto.trim()) return null;
  return (
    <div className="mb-4 rounded-2xl border border-violet/40 bg-violet/5 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-violet">🪢 {titulo}</p>
      <p className="mt-1.5 max-h-32 overflow-auto whitespace-pre-wrap text-xs leading-relaxed text-muted">
        {texto}
      </p>
    </div>
  );
}

/** Cierre de estación: microconfirmación de una línea que habilita continuar. */
function CierreEstacion({
  valor,
  onChange,
  onNext,
  label,
  pregunta = "En una línea: ¿qué te quedó de este paso?",
}: {
  valor: string;
  onChange: (v: string) => void;
  onNext: () => void;
  label: string;
  pregunta?: string;
}) {
  const listo = valor.trim().length >= 3;
  return (
    <div className="mt-6 rounded-2xl border border-line bg-panel/40 p-4">
      <label className="text-sm font-medium text-foreground">{pregunta}</label>
      <input
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Escribí una frase para seguir (así no avanzás en piloto automático)."
        className="mt-2 w-full rounded-lg border border-line bg-ink-2/70 px-3 py-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
      />
      <div className="mt-4 border-t border-line/60 pt-4">
        <Button onClick={onNext} disabled={!listo} className="w-full sm:w-auto">
          {label}
        </Button>
        {!listo && (
          <p className="mt-2 text-xs text-faint">
            Completá la frase de arriba para habilitar el siguiente paso.
          </p>
        )}
      </div>
    </div>
  );
}

/** Selector de qué va a producir el alumno (la TAREA). */
function TareaPicker({
  opciones,
  value,
  onPick,
}: {
  opciones: TareaDef[];
  value: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {opciones.map((t) => {
        const sel = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            className={cn(
              "rounded-xl border p-3 text-left transition",
              sel ? "border-teal/70 bg-teal/10" : "border-line bg-ink-2/40 hover:border-teal/50",
            )}
          >
            <p className="text-sm font-semibold text-foreground">
              {t.emoji} {t.label}
            </p>
            <p className="mt-0.5 text-xs text-muted">{t.hint}</p>
          </button>
        );
      })}
    </div>
  );
}

// ---------- Estación 0 · Tu caso ----------
function Estacion0({
  state,
  update,
  goTo,
  reco,
  nombre,
}: {
  state: PostaState;
  update: UpdateFn;
  goTo: (n: number) => void;
  reco: Reco | null;
  nombre: string;
}) {
  // Aún no eligió modo
  if (!state.modo) {
    const primerNombre = nombre.trim().split(/\s+/)[0];
    return (
      <div className="rise">
        <Head
          n={0}
          titulo="Elegí con qué vas a trabajar"
          bajada="Hoy hacemos la posta con un caso real. Si trajiste uno, usalo. Si no, te damos uno listo."
        />

        {reco && (
          <div className="mb-4 rounded-2xl border-gradient p-4">
            <p className="text-sm font-semibold text-foreground">
              Hola {primerNombre} 👋 una sugerencia para vos
            </p>
            <p className="mt-1 text-sm text-muted">{reco.nota}</p>
            <p className="mt-2 text-sm">
              <span className="text-faint">Te sugerimos: </span>
              <span className="font-semibold text-teal">{reco.etiqueta}</span>
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                onClick={() =>
                  update({ modo: reco.modo, ejemploId: reco.ejemploId ?? null, tareaId: reco.tareaId })
                }
                className="px-3 py-1.5 text-sm"
              >
                Usar esta sugerencia →
              </Button>
              <span className="text-xs text-faint">o elegí abajo lo que quieras.</span>
            </div>
          </div>
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => update({ modo: "propio", ejemploId: null })}
            className="rounded-2xl border border-teal/50 bg-teal/5 p-4 text-left transition hover:border-teal"
          >
            <p className="text-xl">🗂️</p>
            <h3 className="mt-2 font-semibold">Traigo mi propio caso</h3>
            <p className="mt-1 text-sm text-muted">Trabajás con tu material real. La app te dice qué subir.</p>
          </button>
          <button
            onClick={() => update({ modo: "ejemplo" })}
            className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-teal/60"
          >
            <p className="text-xl">📁</p>
            <h3 className="mt-2 font-semibold">Usar un caso de ejemplo</h3>
            <p className="mt-1 text-sm text-muted">¿No trajiste caso? Elegí uno ficticio listo para descargar.</p>
          </button>
          <button
            onClick={() => update({ modo: "cita" })}
            className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-amber-400/60"
          >
            <p className="text-xl">🔍</p>
            <h3 className="mt-2 font-semibold">Verificar una cita</h3>
            <p className="mt-1 text-sm text-muted">
              Ejercicio corto: chequear si un fallo o artículo que dio una IA es real.
            </p>
          </button>
        </div>
      </div>
    );
  }

  // Caso propio: checklist + elegir tarea
  if (state.modo === "propio") {
    return (
      <div className="rise">
        <Head n={0} titulo="Tu caso propio" bajada="Decí qué vas a producir y tené el material a mano para la próxima estación." />

        <p className="mb-2 text-sm font-semibold text-muted">1 · ¿Qué vas a producir?</p>
        <TareaPicker opciones={TAREAS} value={state.tareaId} onPick={(id) => update({ tareaId: id })} />

        <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
          <p className="text-sm font-semibold text-foreground">2 · Lo que conviene tener listo</p>
          <ul className="mt-2 space-y-2">
            {CHECKLIST_PROPIO.map((c, i) => (
              <li key={i} className="flex gap-2 text-sm text-muted">
                <span className="text-teal">✓</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-xs text-amber-200">
            Si tu material tiene datos sensibles reales, anonimizalos (nombres, DNI) antes de subirlos.
          </p>
        </div>
        <CambiarCaso update={update} />
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button onClick={() => goTo(1)} disabled={!state.tareaId} className="w-full sm:w-auto">
            Tengo mi material listo →
          </Button>
          {!state.tareaId && <p className="mt-2 text-xs text-faint">Elegí qué vas a producir para seguir.</p>}
        </div>
      </div>
    );
  }

  // Caso de ejemplo: elegir uno
  const elegido = getEjemplo(state.ejemploId);
  if (!elegido) {
    return (
      <div className="rise">
        <Head n={0} titulo="Elegí un caso de ejemplo" bajada="Cualquiera sirve para practicar la posta. Tocá uno." />
        <div className="grid gap-3">
          {CASOS_EJEMPLO.map((c) => (
            <button
              key={c.id}
              onClick={() => update({ ejemploId: c.id, tareaId: c.tareas[0] })}
              className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-teal/60"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{c.emoji}</span>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {c.area}
                </span>
              </div>
              <h3 className="mt-2 font-semibold">{c.titulo}</h3>
              <p className="mt-1 text-sm text-muted">{c.resumen}</p>
            </button>
          ))}
        </div>
        <CambiarCaso update={update} label="← Mejor traigo mi propio caso" />
      </div>
    );
  }

  const opcionesTarea = elegido.tareas.map((id) => getTarea(id)).filter(Boolean) as TareaDef[];

  return (
    <div className="rise">
      <Head n={0} titulo="Tu caso de ejemplo" bajada="Elegí qué vas a producir. El material lo descargás en la próxima estación." />
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{elegido.emoji}</span>
          <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
            {elegido.area}
          </span>
        </div>
        <h3 className="mt-2 font-semibold">{elegido.titulo}</h3>
        <p className="mt-1 text-sm text-muted">{elegido.resumen}</p>
        <p className="mt-2 text-xs text-faint">📎 {elegido.piezas.length} piezas para subir a NotebookLM (las bajás en la Estación 1).</p>
      </div>

      {opcionesTarea.length > 1 ? (
        <>
          <p className="mb-2 mt-4 text-sm font-semibold text-muted">¿Qué vas a producir con este caso?</p>
          <TareaPicker opciones={opcionesTarea} value={state.tareaId} onPick={(id) => update({ tareaId: id })} />
        </>
      ) : (
        <p className="mt-3 text-xs text-teal">📝 Vas a producir: {opcionesTarea[0]?.label}</p>
      )}

      <button
        onClick={() => update({ ejemploId: null })}
        className="mt-3 block text-xs text-faint underline-offset-2 hover:text-teal hover:underline"
      >
        Elegir otro caso de ejemplo
      </button>
      <CambiarCaso update={update} />
      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={() => goTo(1)} disabled={!state.tareaId} className="w-full sm:w-auto">
          Empezar la posta →
        </Button>
      </div>
    </div>
  );
}

function CambiarCaso({ update, label = "← Cambiar tipo de caso" }: { update: UpdateFn; label?: string }) {
  return (
    <button
      onClick={() => update({ modo: null, ejemploId: null, tareaId: null })}
      className="mt-3 block text-xs text-faint underline-offset-2 hover:text-magenta hover:underline"
    >
      {label}
    </button>
  );
}

// ---------- Estación 1 · Anclar las fuentes (NotebookLM) ----------
function Estacion1({ state, update, goTo }: { state: PostaState; update: UpdateFn; goTo: (n: number) => void }) {
  const elegido = getEjemplo(state.ejemploId);
  const tarea = getTarea(state.tareaId) ?? TAREAS[0];
  return (
    <div className="rise">
      <Head
        n={1}
        titulo="Anclar las fuentes"
        bajada="NotebookLM lee tu material y responde sin inventar. Acá nace la base de la posta."
      />

      {/* Paso 1: abrir y subir */}
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">1 · Abrí NotebookLM y subí tu material</p>
        <p className="mt-1 text-xs text-muted">
          Se abre en otra pestaña. Cuando termines, <strong className="text-foreground">volvé a esta pestaña</strong>.
          {!elegido && " Creá un cuaderno nuevo y subí tu material (PDF, texto o lo que tengas) como fuentes."}
        </p>

        {elegido && (
          <div className="mt-3 rounded-xl border border-line bg-ink-2/40 p-3">
            <p className="text-xs font-semibold text-foreground">Descargá las {elegido.piezas.length} piezas y subilas como fuentes:</p>
            {(elegido.piezas.some((p) => p.img) || elegido.piezas.some((p) => p.audio)) && (
              <p className="mt-1 text-xs text-faint">
                🖼️ Las imágenes se leen con OCR y 🔊 los audios se transcriben — NotebookLM ingiere ambos, como un escaneo o una grabación real.
              </p>
            )}
            <ul className="mt-2 space-y-2">
              {elegido.piezas.map((p) => (
                <li key={p.n} className="rounded-lg border border-transparent">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-mono text-xs text-faint">P{p.n}</span> {p.titulo}
                        {p.img && (
                          <span className="ml-2 rounded-full bg-violet/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet">
                            imagen · OCR
                          </span>
                        )}
                        {p.audio && (
                          <span className="ml-2 rounded-full bg-cyan/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-cyan">
                            audio · transcripción
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{p.blurb}</p>
                    </div>
                    <a
                      href={p.file}
                      download
                      className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-teal/60 hover:text-teal"
                    >
                      ⬇ Bajar
                    </a>
                  </div>
                  {p.audio && (
                    <audio controls preload="none" src={p.file} className="mt-2 h-9 w-full">
                      Tu navegador no puede reproducir el audio.
                    </audio>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        <a
          href={NOTEBOOKLM_URL}
          target="_blank"
          rel="noopener"
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal via-cyan to-violet px-4 py-2.5 text-sm font-semibold text-ink"
        >
          Abrir NotebookLM en otra pestaña ↗
        </a>
      </div>

      {/* Paso 2: destilar (dentro de NotebookLM, no en otra IA) */}
      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">2 · Pedile que destile tu caso</p>
        <p className="mt-1 text-xs text-muted">
          Copiá este prompt y pegalo <strong className="text-foreground">dentro de NotebookLM</strong> (el que
          ya abriste arriba). Te devuelve un resumen ordenado, anclado a tus fuentes.
        </p>
        <div className="mt-3">
          <CopyBox text={tarea.destilado} label="Copiar prompt" />
        </div>
      </div>

      {/* Paso 3: el PASE */}
      <div className="mt-4 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">🪢 El pase de la posta</p>
        <label className="mt-1 block text-sm font-medium text-foreground">
          3 · Copiá lo que te devolvió NotebookLM y pegalo acá
        </label>
        <p className="text-xs text-faint">
          Esto es el testigo: lo que sacás de una herramienta y entra en la siguiente. No lo sueltes.
        </p>
        <textarea
          value={state.destilado}
          onChange={(e) => update({ destilado: e.target.value })}
          rows={6}
          placeholder="Pegá acá el resumen estructurado que generó NotebookLM…"
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      <CierreEstacion
        valor={state.conf1}
        onChange={(v) => update({ conf1: v })}
        onNext={() => goTo(2)}
        label="Armar mi asistente →"
        pregunta="En una línea: ¿qué ordenó NotebookLM que no tenías claro?"
      />
    </div>
  );
}

// ---------- Estación 2 · Armar tu asistente (Proyecto) ----------
function Estacion2({ state, update, goTo }: { state: PostaState; update: UpdateFn; goTo: (n: number) => void }) {
  const tool = state.herramienta;
  return (
    <div className="rise">
      <Head
        n={2}
        titulo="Armar tu asistente"
        bajada="Un Proyecto es un espacio con instrucciones y fuentes propias. Lo dejás listo para tu caso."
      />

      <Testigo titulo="Esto trajiste de NotebookLM" texto={state.destilado} />

      {/* Paso 1: elegir herramienta + abrir Proyecto */}
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">1 · Creá un Proyecto nuevo</p>
        <p className="mt-1 text-xs text-muted">Elegí dónde lo armás:</p>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {(Object.keys(PROYECTO_LINKS) as HerramientaProyecto[]).map((k) => {
            const sel = tool === k;
            return (
              <button
                key={k}
                onClick={() => update({ herramienta: k })}
                className={cn(
                  "rounded-xl border p-3 text-left text-sm transition",
                  sel ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-ink-2/40 text-muted hover:border-teal/50",
                )}
              >
                <span className="font-semibold">{PROYECTO_LINKS[k].label}</span>
              </button>
            );
          })}
        </div>
        {tool && (
          <div className="mt-3">
            <p className="text-xs text-muted">{PROYECTO_LINKS[tool].donde}</p>
            <a
              href={PROYECTO_LINKS[tool].url}
              target="_blank"
              rel="noopener"
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal via-cyan to-violet px-4 py-2.5 text-sm font-semibold text-ink"
            >
              Crear Proyecto en {PROYECTO_LINKS[tool].label} ↗
            </a>
          </div>
        )}
      </div>

      {/* Paso 2: pegar system prompt + explicación */}
      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">2 · Pegá estas instrucciones en el Proyecto</p>
        <p className="mt-1 text-xs text-muted">
          Va en el campo de instrucciones del Proyecto. Define cómo se comporta tu asistente.
        </p>
        <div className="mt-3">
          <CopyBox text={SYSTEM_PROMPT_POSTA} label="Copiar instrucciones" />
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SYSTEM_PROMPT_PARTES.map((p) => (
            <div key={p.titulo} className="rounded-xl border border-line bg-ink-2/40 p-3">
              <p className="text-xs font-semibold text-foreground">{p.titulo}</p>
              <p className="mt-1 text-xs text-muted">{p.texto}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Paso 3: cargar fuentes */}
      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">3 · Cargá tus fuentes al Proyecto</p>
        <p className="mt-1 text-xs text-muted">
          Subí al Proyecto el mismo material que usaste en NotebookLM (o pegá el destilado de arriba como
          una nota). Así el asistente responde con tu caso, no en abstracto.
        </p>
      </div>

      <CierreEstacion
        valor={state.conf2}
        onChange={(v) => update({ conf2: v })}
        onNext={() => goTo(3)}
        label="Probar mi asistente →"
        pregunta="En una línea: ¿qué hace distinto tu asistente ahora que está configurado?"
      />
    </div>
  );
}

// ---------- Estación 3 · Producir ----------
function Estacion3({ state, update, goTo }: { state: PostaState; update: UpdateFn; goTo: (n: number) => void }) {
  const tarea = getTarea(state.tareaId) ?? TAREAS[0];

  function finalizar() {
    update({ completado: true });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="rise">
      <Head
        n={3}
        titulo="Probá tu asistente"
        bajada="Hacele la primera consulta a tu asistente y mirá cómo responde con todo el contexto cargado."
      />

      <Testigo titulo="Tu asistente ya tiene esto cargado" texto={state.destilado} />

      <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">1 · Hacele la primera consulta ({tarea.label})</p>
        <p className="mt-1 text-xs text-muted">
          Copiá esta consulta y pegala <strong className="text-foreground">en tu Proyecto</strong> (el que
          armaste recién). Te responde usando tu caso cargado.
        </p>
        <div className="mt-3">
          <CopyBox text={tarea.consulta} label="Copiar consulta" />
        </div>
      </div>

      <div className="mt-4 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">🪢 El pase final</p>
        <label className="mt-1 block text-sm font-medium text-foreground">
          2 · Pegá acá lo que te devolvió (o un link a tu documento)
        </label>
        <p className="text-xs text-faint">
          Para la puesta en común vemos algunos recorridos. Esto queda guardado en tu ficha.
        </p>
        <textarea
          value={state.borrador}
          onChange={(e) => update({ borrador: e.target.value })}
          rows={6}
          placeholder="Pegá el resultado, o el link a tu Google Doc / Drive…"
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      {state.completado ? (
        <div className="mt-6 rounded-2xl border border-teal/50 bg-teal/10 p-4 text-center">
          <p className="text-2xl">🏁</p>
          <p className="mt-1 font-semibold text-teal">¡Completaste la posta!</p>
          <p className="mt-1 text-sm text-muted">
            Hiciste el recorrido NotebookLM → Proyecto → producción. El mismo flujo lo repetís el lunes con
            cualquier caso real.
          </p>
          <button
            onClick={() => update({ completado: false })}
            className="mt-3 text-xs text-faint underline-offset-2 hover:underline"
          >
            seguir editando
          </button>
        </div>
      ) : (
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button onClick={finalizar} className="w-full sm:w-auto">
            Finalizar y guardar
          </Button>
          <p className="mt-2 text-xs text-faint">
            Con que hayas hecho el recorrido alcanza. Pegar el resultado es opcional.
          </p>
        </div>
      )}
    </div>
  );
}

// ---------- Ejercicio aparte · Verificar una cita ----------
function VerificarCita({ state, update }: { state: PostaState; update: UpdateFn }) {
  return (
    <div className="rise">
      <div className="mb-4">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-amber-300">Ejercicio · anti-alucinación</p>
        <h2 className="mt-0.5 text-2xl font-semibold">Verificar una cita</h2>
        <p className="mt-1 text-sm text-muted">
          La IA puede inventar fallos y artículos con tono seguro. Acá practicás el reflejo: nunca llevar una
          cita al expediente sin confirmarla en una fuente oficial.
        </p>
      </div>

      <button
        onClick={() => update({ modo: null })}
        className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel/40 px-3 py-2 text-sm font-medium text-muted transition hover:border-teal/60 hover:text-teal"
      >
        ← Volver a elegir
      </button>

      {/* Pasos */}
      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">Cómo se hace</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted">
          {VERIFICAR_CITA_PASOS.map((p, i) => (
            <li key={i}>{p}</li>
          ))}
        </ol>
        <p className="mt-3 rounded-lg border border-amber-400/40 bg-amber-400/5 p-3 text-xs text-amber-200">
          Ojo: NotebookLM NO sirve para esto, porque no busca en internet. Usá una IA con búsqueda web.
        </p>
      </div>

      {/* La cita a verificar */}
      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">La cita que vas a chequear</label>
        <p className="text-xs text-faint">Pegá el fallo o artículo tal como te lo dieron (o que viste en un escrito).</p>
        <textarea
          value={state.citaTexto}
          onChange={(e) => update({ citaTexto: e.target.value })}
          rows={3}
          placeholder="Ej: «CSJN, ‘Pérez c/ Estado Nacional’, Fallos 345:678, sobre…»"
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      {/* Prompt + abrir IA con búsqueda */}
      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">Prompt de verificación</p>
        <p className="mt-1 text-xs text-muted">
          Copialo, pegá tu cita donde dice [pegá acá…], y abrí una IA con la búsqueda web activada.
        </p>
        <div className="mt-3">
          <CopyBox text={VERIFICAR_CITA_PROMPT} label="Copiar prompt" />
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {AI_LINKS.map((l) => (
            <a
              key={l.id}
              href={l.base}
              target="_blank"
              rel="noopener"
              className="rounded-xl border border-line px-3 py-2 text-center text-sm font-medium text-foreground transition hover:border-teal/60 hover:text-teal"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>

      {/* Veredicto */}
      <div className="mt-4 rounded-2xl border-gradient p-4">
        <label className="block text-sm font-medium text-foreground">Tu veredicto</label>
        <p className="text-xs text-faint">¿La cita existe y dice lo que se afirmaba? ¿Mal citada? ¿No verificada?</p>
        <textarea
          value={state.citaResultado}
          onChange={(e) => update({ citaResultado: e.target.value })}
          rows={3}
          placeholder="Ej: el fallo existe pero no dice lo que se le atribuye / no encontré fuente: no verificada…"
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
      </div>

      {state.completado ? (
        <div className="mt-6 rounded-2xl border border-teal/50 bg-teal/10 p-4 text-center">
          <p className="text-2xl">✅</p>
          <p className="mt-1 font-semibold text-teal">¡Listo!</p>
          <p className="mt-1 text-sm text-muted">Ese es el reflejo: ninguna cita entra al expediente sin verificar.</p>
          <button
            onClick={() => update({ completado: false })}
            className="mt-3 text-xs text-faint underline-offset-2 hover:underline"
          >
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
            disabled={state.citaResultado.trim().length < 3}
            className="w-full sm:w-auto"
          >
            Guardar veredicto
          </Button>
        </div>
      )}
    </div>
  );
}
