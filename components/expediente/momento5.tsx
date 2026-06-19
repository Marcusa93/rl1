"use client";

import { useState } from "react";
import { INSTRUMENTOS, getInstrumento, type InstrumentoId } from "@/lib/instancia2";
import type { ExpedienteState } from "@/lib/expediente";
import { Button, Spinner } from "@/components/ui";
import { AI_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const NOTEBOOKLM = "https://notebooklm.google.com/";

export function Momento5({
  state,
  update,
}: {
  state: ExpedienteState;
  update: (p: Partial<ExpedienteState> | ((s: ExpedienteState) => ExpedienteState)) => void;
}) {
  const i2 = state.instancia2;
  const instrumento = getInstrumento(i2.instrumento);

  const setI2 = (patch: Partial<typeof i2>) =>
    update((s) => ({ ...s, instancia2: { ...s.instancia2, ...patch } }));

  // Candado: la Instancia 2 requiere la clave secreta (la del docente).
  if (!i2.desbloqueado) {
    return <Gate onUnlock={() => setI2({ desbloqueado: true })} />;
  }

  // Elección de instrumento
  if (!instrumento) {
    return (
      <div className="rise">
        <Head />
        <p className="mb-2 text-sm font-semibold text-muted">Elegí qué vas a redactar</p>
        <div className="grid gap-3">
          {INSTRUMENTOS.map((ins) => (
            <button
              key={ins.id}
              onClick={() => setI2({ instrumento: ins.id as InstrumentoId })}
              className="rounded-2xl border border-line bg-panel/40 p-4 text-left transition hover:border-teal/60"
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{ins.emoji}</span>
                <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
                  {ins.tipo}
                </span>
              </div>
              <h3 className="mt-2 font-semibold">{ins.titulo}</h3>
              <p className="mt-1 text-xs text-muted">{ins.resumen}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rise">
      <Head />

      <button
        onClick={() => setI2({ instrumento: null })}
        className="mb-3 inline-flex items-center gap-1.5 rounded-xl border border-line bg-panel/40 px-3 py-2 text-sm font-medium text-muted transition hover:border-teal/60 hover:text-teal"
      >
        ← Elegir otro instrumento
      </button>

      <div className="rounded-2xl border border-line bg-panel/40 p-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{instrumento.emoji}</span>
          <span className="rounded-full bg-violet/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet">
            {instrumento.tipo}
          </span>
        </div>
        <h3 className="mt-2 font-semibold">{instrumento.titulo}</h3>
        <p className="mt-1 text-sm text-muted">{instrumento.resumen}</p>
      </div>

      {/* Consigna */}
      <div className="mt-4 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">Tu consigna</p>
        <p className="mt-1 text-sm text-foreground">{instrumento.consigna}</p>
      </div>

      {/* Piezas descargables */}
      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <p className="text-sm font-semibold text-foreground">Descargá las piezas del expediente</p>
        <p className="text-xs text-faint">
          Bajá los 4 documentos y subilos a NotebookLM o a tu IA como fuentes.
        </p>
        <ul className="mt-3 space-y-2">
          {instrumento.piezas.map((p) => (
            <li
              key={p.n}
              className="flex items-start justify-between gap-3 rounded-xl border border-line bg-ink-2/40 p-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  <span className="font-mono text-xs text-faint">P{p.n}</span> {p.titulo}
                </p>
                <p className="mt-0.5 text-xs text-muted">{p.blurb}</p>
              </div>
              <a
                href={p.file}
                download
                className="shrink-0 rounded-lg border border-line px-3 py-2 text-xs font-medium text-muted transition hover:border-teal/60 hover:text-teal"
              >
                ⬇ Descargar
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Pasos */}
      <div className="mt-4 rounded-2xl border border-teal/40 bg-teal/5 p-4">
        <p className="text-sm font-semibold text-teal">Cómo resolverlo con IA</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs text-muted">
          <li>Descargá las 4 piezas de arriba.</li>
          <li>Abrí NotebookLM (o tu IA) y subilas como fuentes.</li>
          <li>Pedile que te ayude a redactar el instrumento, citando las piezas.</li>
          <li>Revisá y corregí: la decisión jurídica final es tuya.</li>
        </ol>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={NOTEBOOKLM}
            target="_blank"
            rel="noopener"
            className="rounded-xl bg-gradient-to-r from-teal via-cyan to-violet px-3 py-2 text-center text-sm font-semibold text-ink"
          >
            NotebookLM ↗
          </a>
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

      {/* Entrega */}
      <div className="mt-4 rounded-2xl border border-line bg-panel/40 p-4">
        <label className="text-sm font-medium text-foreground">
          Link o nota de tu instrumento <span className="text-faint">(opcional)</span>
        </label>
        <p className="text-xs text-faint">
          Pegá el link a tu documento (Drive/Docs) o una nota corta de lo que produjiste.
        </p>
        <textarea
          value={i2.nota}
          onChange={(e) => setI2({ nota: e.target.value })}
          rows={2}
          className="mt-1.5 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 text-sm outline-none focus:border-teal/60"
        />
        <div className="mt-3">
          {i2.entregado ? (
            <div className="rounded-xl border border-teal/50 bg-teal/10 p-3 text-center text-sm text-teal">
              ✅ Marcado como entregado. ¡Gracias!
              <button
                onClick={() => setI2({ entregado: false })}
                className="ml-2 text-xs text-faint underline-offset-2 hover:underline"
              >
                deshacer
              </button>
            </div>
          ) : (
            <Button onClick={() => setI2({ entregado: true })} className="w-full sm:w-auto">
              Marcar como entregado
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Head() {
  return (
    <div className="mb-4">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-teal">
        Instancia 2 · Momento 5
      </p>
      <h2 className="mt-0.5 text-2xl font-semibold">Producí tu instrumento jurídico</h2>
      <p className="mt-1 text-sm text-muted">
        Ahora te toca crear. Elegí un instrumento, descargá las piezas del caso y resolvelo con IA.
      </p>
    </div>
  );
}

function Gate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onUnlock();
      else setErr("Clave incorrecta");
    } catch {
      setErr("Error de red");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <Head />
      <form onSubmit={submit} className="glass glow-teal rounded-2xl p-6">
        <div className="mb-3 flex items-center gap-2 text-teal">
          <span className="text-xl">🔒</span>
          <p className="text-sm font-semibold">Esta instancia está bloqueada</p>
        </div>
        <p className="text-sm text-muted">
          La parte de instrumentos se habilita con una clave que da el docente en clase. Ingresala
          para continuar.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Clave de la clase"
          autoFocus
          className="mt-4 w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 outline-none placeholder:text-faint focus:border-teal/60"
        />
        {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
        <Button type="submit" disabled={busy || password.trim().length < 1} className="mt-4 w-full">
          {busy ? <Spinner /> : "Desbloquear instrumentos"}
        </Button>
      </form>
    </div>
  );
}
