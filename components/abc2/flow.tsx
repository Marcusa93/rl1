"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ParticipantRow } from "@/lib/types";
import {
  ABC2_ACTIVITY,
  ABC2_ITEM,
  FLUJOS,
  HERRAMIENTAS,
  GEMINI_CANVAS_URL,
  LOVABLE_URL,
  MODULOS,
  PC_SYSTEM,
  PROJECT_LINKS,
  TOOL_LINKS,
  WHATSAPP_GRUPO,
  buildPcUser,
  emptyAbc2State,
  getFlujo,
  kitPara,
  materialPara,
  reconocer,
  seedPrompt,
  vibePara,
  type Abc2State,
  type Perfil,
} from "@/lib/abc2";
import { streamGenerate } from "@/components/use-stream";
import { Button, Spinner } from "@/components/ui";
import { CopyBox } from "@/components/expediente/copy-box";
import { Copiloto } from "./copiloto";
import { cn } from "@/lib/utils";

const MODELO_PC = "anthropic/claude-sonnet-4.6";
type UpdateFn = (p: Partial<Abc2State> | ((s: Abc2State) => Abc2State)) => void;

export function Abc2Flow({ slug, me }: { slug: string; me: ParticipantRow }) {
  const [state, setState] = useState<Abc2State | null>(null);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [view, setView] = useState(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/api/session/${slug}/my-responses`).then((r) => r.json()),
      fetch(`/api/abc2/clase1`).then((r) => r.json()).catch(() => ({ profiles: [] })),
    ]).then(([mine, c1]) => {
      if (!active) return;
      setPerfiles(c1.profiles ?? []);
      const row = (mine.responses ?? []).find(
        (r: { activity: string; item_key: string }) => r.activity === ABC2_ACTIVITY && r.item_key === ABC2_ITEM,
      );
      const loaded = row?.payload ? ({ ...emptyAbc2State(), ...row.payload } as Abc2State) : emptyAbc2State();
      setState(loaded);
      setView(loaded.modulo || 0);
    });
    return () => {
      active = false;
    };
  }, [slug]);

  const persist = useCallback(
    (nextState: Abc2State) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        fetch(`/api/session/${slug}/respond`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity: ABC2_ACTIVITY, item_key: ABC2_ITEM, payload: nextState }),
        }).catch(() => {});
      }, 600);
    },
    [slug],
  );

  const update = useCallback<UpdateFn>(
    (patch) => {
      setState((prev) => {
        if (!prev) return prev;
        const nextState = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        persist(nextState);
        return nextState;
      });
    },
    [persist],
  );

  if (!state) return <Spinner />;

  function goTo(n: number) {
    setView(n);
    update((s) => ({ ...s, modulo: Math.max(s.modulo, Math.min(n, MODULOS.length - 1)) }));
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const next = (n: number) => () => goTo(n + 1);

  const steps = [
    (n: number) => <M1Ingreso state={state} update={update} n={n} goNext={next(n)} perfiles={perfiles} nombre={me.name} />,
    (n: number) => <M2Prompt state={state} update={update} n={n} goNext={next(n)} slug={slug} />,
    (n: number) => <M3Flujo state={state} update={update} n={n} goNext={next(n)} />,
    (n: number) => <M4Practica state={state} update={update} n={n} goNext={next(n)} goTo={goTo} />,
    (n: number) => <M5Cierre state={state} update={update} n={n} />,
  ];

  return (
    <div>
      <Stepper view={view} onPick={goTo} tienePerfil={!!state.perfil || state.esNuevo} />
      {view > 0 && (
        <button
          onClick={() => goTo(view - 1)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel/40 px-3 py-1.5 text-xs font-medium text-muted transition hover:border-teal/60 hover:text-teal"
        >
          ← Atrás
        </button>
      )}
      <div className="mt-4">{view < steps.length ? steps[view](view) : null}</div>
      <Copiloto
        slug={slug}
        ctx={{ modulo: view, perfil: state.perfil }}
        onUse={() => update((s) => ({ ...s, copilotoUsos: (s.copilotoUsos ?? 0) + 1 }))}
      />
    </div>
  );
}

// ---------- helpers ----------
function Stepper({ view, onPick, tienePerfil }: { view: number; onPick: (n: number) => void; tienePerfil: boolean }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-1">
      <div className="flex min-w-max gap-2">
        {MODULOS.map((m) => {
          const unlocked = tienePerfil || m.n === 0;
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
              <span className="flex size-5 items-center justify-center rounded-full bg-ink-2/70 font-mono text-[11px]">{m.n + 1}</span>
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
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">Módulo {n + 1} de {MODULOS.length}</p>
      <h2 className="mt-0.5 text-2xl font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-muted">{bajada}</p>
    </div>
  );
}

function Campo({ label, help, value, onChange, rows = 2 }: { label: string; help: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={help}
        className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
      />
    </div>
  );
}

// ---------- Módulo 1 · Ingreso y reconocimiento ----------
function M1Ingreso({
  state,
  update,
  n,
  goNext,
  perfiles,
  nombre,
}: {
  state: Abc2State;
  update: UpdateFn;
  n: number;
  goNext: () => void;
  perfiles: Perfil[];
  nombre: string;
}) {
  const match = useMemo(() => reconocer(nombre, perfiles), [nombre, perfiles]);

  function elegir(p: Perfil) {
    const seed = seedPrompt(p);
    update((s) => ({
      ...s,
      perfil: p,
      esNuevo: false,
      pcQueHaces: s.pcQueHaces || seed.queHaces,
      pcParaQuien: s.pcParaQuien || seed.paraQuien,
      pcComoSuena: s.pcComoSuena || seed.comoSuena,
      pcObjetivo: s.pcObjetivo || seed.objetivo,
    }));
  }
  function comoNuevo() {
    update({ perfil: null, esNuevo: true, pcComoSuena: state.pcComoSuena || "cercano, claro y directo" });
  }

  // Ya identificado (perfil elegido o nuevo)
  if (state.perfil || state.esNuevo) {
    const p = state.perfil;
    return (
      <div className="rise">
        <Head n={n} titulo="Sos vos" bajada="Ya te tenemos. Esto viaja con vos por toda la clase." />
        {p ? (
          <div className="rounded-2xl border border-teal/50 bg-teal/5 p-4">
            <p className="text-sm font-semibold text-teal">👋 Hola de nuevo, {p.nombre.split(/\s+/)[0]}</p>
            <div className="mt-2 space-y-1 text-sm">
              {p.rubro && <p className="text-muted"><span className="text-faint">Rubro:</span> {p.rubro}</p>}
              {p.leCostaba && <p className="text-muted"><span className="text-faint">Te costaba:</span> {p.leCostaba}</p>}
              {p.seLlevo && <p className="text-muted"><span className="text-faint">Te llevaste:</span> «{p.seLlevo}»</p>}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-line bg-panel/40 p-4 text-sm text-muted">
            Entrás como participante nuevo. No pasa nada: vas a armar todo desde cero, la app te guía igual.
          </div>
        )}
        <button
          onClick={() => update({ perfil: null, esNuevo: false })}
          className="mt-3 text-xs text-faint underline-offset-2 hover:text-magenta hover:underline"
        >
          No soy yo / cambiar
        </button>
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button onClick={goNext} className="w-full sm:w-auto">Empezar →</Button>
        </div>
      </div>
    );
  }

  // Reconocimiento
  return (
    <div className="rise">
      <Head n={n} titulo="¿Sos vos?" bajada="Te buscamos en la lista de la Clase 1." />
      {match.tipo === "exacto" && (
        <div className="rounded-2xl border border-teal/50 bg-teal/5 p-4">
          <p className="text-sm font-semibold text-teal">Te encontramos 🎯</p>
          <p className="mt-1 text-sm text-foreground">{match.perfil.nombre} — {match.perfil.contexto}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => elegir(match.perfil)} className="px-3 py-1.5 text-sm">Sí, soy yo →</Button>
            <Button variant="outline" onClick={comoNuevo} className="px-3 py-1.5 text-sm">No, soy nuevo</Button>
          </div>
        </div>
      )}
      {match.tipo === "candidatos" && (
        <div>
          <p className="mb-2 text-sm text-muted">¿Cuál sos?</p>
          <div className="space-y-2">
            {match.candidatos.map((c) => (
              <button
                key={c.nombre}
                onClick={() => elegir(c)}
                className="w-full rounded-2xl border border-line bg-panel/40 p-3 text-left transition hover:border-teal/60"
              >
                <p className="font-semibold">{c.nombre}</p>
                <p className="text-xs text-muted">{c.contexto}</p>
              </button>
            ))}
          </div>
          <button onClick={comoNuevo} className="mt-3 text-sm text-faint underline-offset-2 hover:text-teal hover:underline">
            No estoy en la lista → entrar como nuevo
          </button>
        </div>
      )}
      {match.tipo === "nuevo" && (
        <div className="rounded-2xl border border-line bg-panel/40 p-4">
          <p className="text-sm text-foreground">No te encontramos en la Clase 1.</p>
          <p className="mt-1 text-xs text-muted">Puede ser por cómo está escrito el nombre. Buscate en la lista de acá abajo, o entrá como nuevo.</p>
          <Button onClick={comoNuevo} className="mt-3 px-3 py-1.5 text-sm">Entrar como nuevo →</Button>
        </div>
      )}

      {/* Lista completa de la Clase 1: por si el nombre no matcheó, se elige a mano */}
      {perfiles.length > 0 && (
        <details className="mt-4 rounded-2xl border border-line bg-panel/40 p-4" open={match.tipo === "nuevo"}>
          <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">
            📋 ¿No aparecés? Buscá tu nombre en la lista de la Clase 1
          </summary>
          <p className="mt-1 text-xs text-faint">Tocá tu nombre (así te escribiste la vez pasada).</p>
          <div className="mt-2 max-h-72 space-y-1.5 overflow-auto">
            {perfiles.map((p) => (
              <button
                key={p.nombre}
                onClick={() => elegir(p)}
                className="w-full rounded-xl border border-line bg-ink-2/40 p-2.5 text-left transition hover:border-teal/60"
              >
                <span className="text-sm font-medium text-foreground">{p.nombre}</span>
                <span className="ml-2 text-xs text-muted">{p.contexto}</span>
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ---------- Módulo 2 · Generador de prompt contextual ----------
function M2Prompt({
  state,
  update,
  n,
  goNext,
  slug,
}: {
  state: Abc2State;
  update: UpdateFn;
  n: number;
  goNext: () => void;
  slug: string;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function generar() {
    if (busy) return;
    setBusy(true);
    setErr("");
    update({ promptContextual: "" });
    try {
      await streamGenerate(
        slug,
        [{ role: "user", content: buildPcUser(state) }],
        (chunk) => update((s) => ({ ...s, promptContextual: s.promptContextual + chunk })),
        { system: PC_SYSTEM, model: MODELO_PC, temperature: 0.5, maxTokens: 900 },
      );
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <Head n={n} titulo="Tu prompt contextual" bajada="Es la memoria de tu negocio. La IA te la arma; vos solo ajustás cuatro cosas." />

      <div className="space-y-3">
        <Campo label="¿Qué hacés o cuál es tu proyecto?" help="Ej: tengo una tienda de bebidas con tres locales…" value={state.pcQueHaces} onChange={(v) => update({ pcQueHaces: v })} />
        <Campo label="¿Para quién trabajás o a quién le vendés?" help="Ej: a clientes de barrio, restaurantes, mayoristas…" value={state.pcParaQuien} onChange={(v) => update({ pcParaQuien: v })} />
        <Campo label="¿Cómo querés que suene el asistente?" help="Ej: cercano y simple / formal / directo al grano…" value={state.pcComoSuena} onChange={(v) => update({ pcComoSuena: v })} rows={1} />
        <Campo label="¿Cuál es tu objetivo principal?" help="Ej: ahorrar tiempo respondiendo, vender más, ordenarme…" value={state.pcObjetivo} onChange={(v) => update({ pcObjetivo: v })} />
      </div>

      <div className="mt-4">
        <Button onClick={generar} disabled={busy} className="w-full sm:w-auto">
          {busy ? <Spinner /> : state.promptContextual ? "Generar de nuevo" : "Generar mi prompt contextual →"}
        </Button>
        {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
      </div>

      {state.promptContextual && (
        <div className="mt-4 rounded-2xl border border-teal/50 bg-teal/5 p-4">
          <p className="mb-2 text-sm font-semibold text-teal">Tu prompt contextual — copialo y guardalo</p>
          <CopyBox text={state.promptContextual} label="Copiar mi prompt" />
          <p className="mt-3 text-sm font-semibold text-foreground">Ahora pegalo en tu Proyecto:</p>
          <ol className="mt-1.5 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>
              Creá un Proyecto nuevo — abrilo directo:{" "}
              {PROJECT_LINKS.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && " o "}
                  <a href={l.url} target="_blank" rel="noopener" className="font-semibold text-teal underline underline-offset-2 hover:text-cyan">
                    {l.id === "claude" ? "Claude" : "ChatGPT"} ↗
                  </a>
                </span>
              ))}
              .
            </li>
            <li>Pegá este texto en las <strong className="text-foreground">instrucciones del sistema</strong> del Proyecto.</li>
          </ol>
        </div>
      )}

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button variant={state.promptContextual ? "primary" : "outline"} onClick={goNext} className="w-full sm:w-auto">
          Elegir mi problema →
        </Button>
      </div>
    </div>
  );
}

// Mapea el nombre de una herramienta del flujo a su link directo.
function toolUrl(h: string): string | null {
  const s = h.toLowerCase();
  if (s.includes("claude") && s.includes("project")) return "https://claude.ai/projects";
  if (s.includes("claude")) return "https://claude.ai/new";
  if (s.includes("gemini")) return "https://gemini.google.com/app";
  if (s.includes("notebook")) return "https://notebooklm.google.com/";
  if (s.includes("gpt") || s.includes("chatgpt")) return "https://chatgpt.com/";
  return null;
}

// ---------- Módulo 3 · Problema y flujo ----------
function M3Flujo({ state, update, n, goNext }: { state: Abc2State; update: UpdateFn; n: number; goNext: () => void }) {
  const kit = kitPara(state.perfil);
  const flujo = getFlujo(state.flujoId);
  const propioSel = state.problema === "__propio__";

  return (
    <div className="rise">
      <Head n={n} titulo="Tu problema y tu flujo" bajada="Elegí qué querés resolver. Te armamos el equipo de herramientas, en orden." />

      <p className="mb-2 text-sm font-semibold text-muted">1 · ¿Qué querés resolver hoy?</p>
      <div className="grid gap-2">
        {kit.problemas.map((p) => (
          <button
            key={p.titulo}
            onClick={() => update({ problema: p.titulo, flujoId: p.flujoId })}
            className={cn(
              "rounded-2xl border p-3 text-left text-sm transition",
              state.problema === p.titulo ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-panel/40 text-muted hover:border-teal/50",
            )}
          >
            {p.titulo}
          </button>
        ))}
        <button
          onClick={() => update({ problema: "__propio__" })}
          className={cn(
            "rounded-2xl border p-3 text-left text-sm transition",
            propioSel ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-ink-2/40 text-muted hover:border-teal/50",
          )}
        >
          ✏️ Propongo el mío
        </button>
      </div>

      {propioSel && (
        <div className="mt-3 space-y-3 rounded-2xl border border-line bg-panel/40 p-4">
          <Campo label="Contá tu problema" help="Ej: quiero organizar los turnos de la semana…" value={state.problemaPropio} onChange={(v) => update({ problemaPropio: v })} />
          <div>
            <label className="text-sm font-medium text-foreground">Elegí un flujo base para arrancar</label>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {FLUJOS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => update({ flujoId: f.id })}
                  className={cn(
                    "rounded-xl border p-2.5 text-left text-xs transition",
                    state.flujoId === f.id ? "border-teal/70 bg-teal/10 text-foreground" : "border-line bg-ink-2/40 text-muted hover:border-teal/50",
                  )}
                >
                  {f.titulo}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {flujo && (
        <div className="mt-5 rounded-2xl border-gradient p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-teal">Tu flujo · {flujo.titulo}</p>
          <div className="mt-3 space-y-2">
            {flujo.pasos.map((paso, i) => (
              <div key={i}>
                <div className="flex items-start gap-3 rounded-xl border border-line bg-ink-2/40 p-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-teal/20 font-mono text-xs font-bold text-teal">{i + 1}</span>
                  <div className="min-w-0">
                    {toolUrl(paso.herramienta) ? (
                      <a href={toolUrl(paso.herramienta)!} target="_blank" rel="noopener" className="text-sm font-semibold text-teal underline underline-offset-2 hover:text-cyan">
                        {paso.herramienta} ↗
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-foreground">{paso.herramienta}</p>
                    )}
                    <p className="text-xs text-muted">{paso.que}</p>
                  </div>
                </div>
                {i < flujo.pasos.length - 1 && <p className="py-0.5 text-center text-lg text-faint">↓</p>}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-faint">Acordate: lo que sale de una herramienta es lo que pegás en la siguiente.</p>
        </div>
      )}

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={goNext} disabled={!flujo} className="w-full sm:w-auto">Manos a la obra →</Button>
        {!flujo && <p className="mt-2 text-xs text-faint">Elegí un problema para ver tu flujo.</p>}
      </div>
    </div>
  );
}

// ---------- Módulo 4 · Práctica libre con registro ----------
function M4Practica({
  state,
  update,
  n,
  goNext,
  goTo,
}: {
  state: Abc2State;
  update: UpdateFn;
  n: number;
  goNext: () => void;
  goTo: (n: number) => void;
}) {
  const flujo = getFlujo(state.flujoId);
  const material = materialPara(state.perfil);
  const vibe = vibePara(state.perfil);
  const listo = state.registro.trim().length >= 30;
  return (
    <div className="rise">
      <Head n={n} titulo="Manos a la obra" bajada="Ejecutá tu flujo con tu caso real. Tenés todo a mano acá." />

      {/* Material de ejemplo del rubro (para procesar con el flujo) */}
      <div className="mb-3 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">📎 Material de ejemplo de tu rubro <span className="text-faint">({material.label})</span></p>
        <p className="text-xs text-faint">¿No tenés tus datos a mano? Usá esto: bajalo y procesalo con tu flujo (subilo a NotebookLM o pegalo en tu Project).</p>
        <ul className="mt-2 space-y-2">
          {material.archivos.map((a) => (
            <li key={a.file} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm text-foreground">
                  {a.nombre}
                  <span className="ml-2 rounded-full bg-violet/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-violet">{a.formato}</span>
                </p>
                <p className="mt-0.5 text-xs text-muted">{a.blurb}</p>
              </div>
              <a href={a.file} download className="shrink-0 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-teal/60 hover:text-teal">⬇ Bajar</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Deep-links a las herramientas */}
      <div className="mb-3 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">🔗 Abrí las herramientas</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOOL_LINKS.map((l) => (
            <a key={l.id} href={l.url} target="_blank" rel="noopener" className="rounded-xl border border-line px-3 py-2 text-center text-sm font-medium text-foreground transition hover:border-teal/60 hover:text-teal">{l.label} ↗</a>
          ))}
        </div>
      </div>

      {/* Vibe coding: mini web-app sin programar */}
      <div className="mb-3 rounded-2xl border-gradient p-4">
        <p className="text-sm font-semibold text-teal">✨ Bonus · Armá una mini web-app (sin programar)</p>
        <p className="mt-1 text-xs text-muted">
          Se puede construir una appcita que resuelva algo chico de tu día. Para vos:{" "}
          <strong className="text-foreground">{vibe.app}</strong> — {vibe.que}
        </p>
        <p className="mt-2 text-xs text-faint">Copiá este prompt y pegalo en una de estas dos; te la construye sola:</p>
        <div className="mt-2">
          <CopyBox text={vibe.prompt} label="Copiar el prompt" />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <a href={LOVABLE_URL} target="_blank" rel="noopener" className="rounded-xl border border-line px-3 py-2 text-center text-sm font-medium text-foreground transition hover:border-teal/60 hover:text-teal">Abrir Lovable ↗</a>
          <a href={GEMINI_CANVAS_URL} target="_blank" rel="noopener" className="rounded-xl border border-line px-3 py-2 text-center text-sm font-medium text-foreground transition hover:border-teal/60 hover:text-teal">Abrir Gemini (Canvas) ↗</a>
        </div>
        <p className="mt-2 text-[11px] text-faint">En Gemini, activá el modo «Canvas» antes de pegar el prompt.</p>
      </div>

      <details className="rounded-2xl border border-line bg-panel/40 p-4">
        <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">🧭 Tu flujo (tocá para ver)</summary>
        {flujo && (
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted">
            {flujo.pasos.map((p, i) => (
              <li key={i}><strong className="text-foreground">{p.herramienta}:</strong> {p.que}</li>
            ))}
          </ol>
        )}
      </details>

      {state.promptContextual && (
        <details className="mt-3 rounded-2xl border border-line bg-panel/40 p-4">
          <summary className="cursor-pointer list-none text-sm font-semibold text-foreground">🧠 Tu prompt contextual (tocá para ver)</summary>
          <div className="mt-2">
            <CopyBox text={state.promptContextual} label="Copiar" />
          </div>
        </details>
      )}

      <div className="mt-4 rounded-2xl border-gradient p-4">
        <label className="block text-sm font-medium text-foreground">Contanos qué hiciste, qué salió y qué te llamó la atención</label>
        <textarea
          value={state.registro}
          onChange={(e) => update({ registro: e.target.value })}
          rows={5}
          placeholder="No hace falta que sea largo. Un par de líneas alcanza."
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none placeholder:text-faint focus:border-teal/60"
        />
        <div className="mt-1 text-right text-[11px] text-faint">{state.registro.trim().length}/30</div>
      </div>

      <button
        onClick={() => goTo(1)}
        className="mt-3 text-sm text-faint underline-offset-2 hover:text-teal hover:underline"
      >
        ← Quiero ajustar mi prompt (no perdés lo que escribiste)
      </button>

      <div className="mt-6 border-t border-line/60 pt-4">
        <Button onClick={goNext} disabled={!listo} className="w-full sm:w-auto">Ir al cierre →</Button>
        {!listo && <p className="mt-2 text-xs text-faint">Escribí al menos una línea (30 caracteres) para seguir.</p>}
      </div>
    </div>
  );
}

// ---------- Módulo 5 · Cierre y compromiso ----------
function M5Cierre({ state, update, n }: { state: Abc2State; update: UpdateFn; n: number }) {
  const kit = kitPara(state.perfil);
  // seed del mini-reto una vez
  useEffect(() => {
    if (!state.miniReto) update({ miniReto: kit.miniReto });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rise">
      <Head n={n} titulo="Tu reto de la semana" bajada="Algo concreto para hacer antes de la próxima. Editalo si querés." />

      <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">🎯 Tu compromiso</p>
        <textarea
          value={state.miniReto}
          onChange={(e) => update({ miniReto: e.target.value })}
          rows={3}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none focus:border-teal/60"
        />
      </div>

      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">📱 El mes de consultas prácticas</p>
        <p className="mt-1 text-xs text-muted">Cualquier duda de la semana, va al grupo de WhatsApp. Para que te podamos responder bien, contá:</p>
        <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-xs text-muted">
          <li>Qué quisiste hacer.</li>
          <li>Qué le pediste a la herramienta.</li>
          <li>Qué salió (pegá el resultado si podés).</li>
        </ol>
        {WHATSAPP_GRUPO ? (
          <a
            href={WHATSAPP_GRUPO}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal to-cyan px-4 py-2.5 text-sm font-semibold text-ink"
          >
            Abrir el grupo de WhatsApp ↗
          </a>
        ) : (
          <p className="mt-3 text-xs text-faint">(El link del grupo se agrega antes de la clase.)</p>
        )}
      </div>

      {state.completado ? (
        <div className="mt-6 rounded-2xl border-gradient p-5 text-center">
          <p className="text-2xl">🚀</p>
          <p className="mt-1 text-base font-semibold text-foreground">
            La semana pasada preguntaste qué era esto. Hoy te vas con un equipo invisible que ya sabe quién sos.
          </p>
          <button onClick={() => update({ completado: false })} className="mt-3 text-xs text-faint underline-offset-2 hover:underline">
            seguir editando
          </button>
        </div>
      ) : (
        <div className="mt-6 border-t border-line/60 pt-4">
          <Button onClick={() => { update({ completado: true }); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); }} className="w-full sm:w-auto">
            Guardar y terminar
          </Button>
        </div>
      )}
    </div>
  );
}
