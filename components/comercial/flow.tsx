"use client";

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Markdown } from "@/components/markdown";
import { Button, Spinner } from "@/components/ui";
import { DescargarGlosario } from "@/components/comercial/descargar-glosario";
import {
  COM_BLOQUES,
  COM_CIERRE_BAJADA,
  COM_CIERRE_NOTA,
  COM_CIERRE_TITULO,
  COM_ENCUESTA,
  COM_PALABRA_MAX,
  COM_SLUG,
  COM_USOS,
  COM_USOS_EXCLUSIVA,
  getBloque,
  type ComQuestion,
} from "@/lib/comercial";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Vista del alumno. Pensada para un aula de ~200 celulares: acá NO se
 * consultan resultados agregados (eso vive en el proyector, /empresas/pantalla),
 * así cada teléfono consulta un solo endpoint mientras dura la clase.
 */
export function ComercialActivity({
  session,
  me,
}: {
  session: SessionRow;
  me: ParticipantRow;
}) {
  const activity = session.current_activity;
  const bloque = getBloque(activity);
  if (bloque) return <Bloque bloque={bloque} />;
  switch (activity) {
    case "emp_encuesta":
      return <Encuesta />;
    case "emp_usos":
      return <Usos />;
    case "emp_cierre":
      return <Cierre />;
    default:
      return <Espera name={me.name} />;
  }
}

async function responder(activity: string, payload: unknown, item_key = "") {
  const res = await fetch(`/api/session/${COM_SLUG}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, item_key, payload }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "No se pudo enviar");
  }
}

// --- Sala de espera ------------------------------------------------------

function Espera({ name }: { name: string }) {
  return (
    <div className="rise flex flex-col items-center justify-center py-16 text-center">
      <div className="pulse-ring mb-6 rounded-full p-1">
        <LogoRL1 size={48} wordmark={false} />
      </div>
      <h2 className="text-xl font-semibold">¡Listo, {name.split(" ")[0]}! 🎉</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Estás en la clase. Cuando el docente active una actividad, aparece acá sola. Los resultados
        del curso se ven en el proyector.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-faint">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        Conectado
      </div>
    </div>
  );
}

/** Confirmación uniforme: en esta clase los resultados se miran en el proyector. */
function Enviado({ children, onEdit }: { children?: React.ReactNode; onEdit?: () => void }) {
  return (
    <div className="mt-5 rounded-xl border border-teal/40 bg-teal/10 p-4 text-center text-sm text-teal">
      {children ?? "✓ Respuesta enviada. Mirá el proyector."}
      {onEdit && (
        <button
          onClick={onEdit}
          className="mt-1 block w-full text-xs text-faint underline-offset-2 hover:underline"
        >
          Editar
        </button>
      )}
    </div>
  );
}

// --- 1 · Encuesta relámpago ---------------------------------------------

type Answers = Record<string, string | string[]>;

function Encuesta() {
  const [answers, setAnswers] = useState<Answers>({});
  const [err, setErr] = useState("");

  function save(next: Answers) {
    setAnswers(next);
    responder("emp_encuesta", { answers: next }).catch((e) => setErr((e as Error).message));
  }

  function pick(q: ComQuestion, optId: string) {
    if (q.multi) {
      const cur = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [];
      save({ ...answers, [q.id]: cur.includes(optId) ? cur.filter((x) => x !== optId) : [...cur, optId] });
    } else {
      save({ ...answers, [q.id]: optId });
    }
  }

  function isOn(q: ComQuestion, optId: string) {
    const v = answers[q.id];
    return Array.isArray(v) ? v.includes(optId) : v === optId;
  }

  const completas = COM_ENCUESTA.filter((q) => {
    const v = answers[q.id];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  }).length;

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">Encuesta relámpago</h2>
      <p className="mt-1 text-sm text-muted">Cuatro preguntas rápidas para leer al curso.</p>

      <div className="mt-5 space-y-5">
        {COM_ENCUESTA.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium">
              <span className="mr-1 text-faint">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.options.map((o) => {
                const on = isOn(q, o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => pick(q, o.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition active:scale-[0.98]",
                      on
                        ? "border-teal/70 bg-teal/15 text-teal glow-teal"
                        : "border-line bg-panel/40 hover:border-faint",
                    )}
                  >
                    <span className="text-base">{o.emoji}</span>
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {err && <p className="mt-3 text-center text-sm text-magenta">{err}</p>}
      {completas === COM_ENCUESTA.length && <Enviado>✓ ¡Listo! Mirá el proyector.</Enviado>}
    </div>
  );
}

// --- 2 · Usos de la IA en la empresa ------------------------------------

function Usos() {
  const [sel, setSel] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function toggle(id: string) {
    setSel((prev) => {
      if (id === COM_USOS_EXCLUSIVA) return prev.includes(id) ? [] : [id];
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return next.filter((x) => x !== COM_USOS_EXCLUSIVA);
    });
  }

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder("emp_usos", { selected: sel });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">¿Dónde ya viste IA en una empresa?</h2>
      <p className="mt-1 text-sm text-muted">
        Marcá todo lo que viste, te contaron o te imaginás funcionando hoy. Es anónimo en el proyector.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {COM_USOS.map((c) => {
          const on = sel.includes(c.id);
          return (
            <button
              key={c.id}
              onClick={() => !sent && toggle(c.id)}
              disabled={sent}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
                on ? "border-teal/70 bg-teal/10 glow-teal" : "border-line bg-panel/40 hover:border-faint",
                sent && "opacity-70",
              )}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-sm font-medium leading-tight">{c.label}</span>
            </button>
          );
        })}
      </div>

      {err && <p className="mt-3 text-center text-sm text-magenta">{err}</p>}
      {!sent ? (
        <Button onClick={send} disabled={busy || sel.length === 0} className="mt-3 w-full">
          {busy ? <Spinner /> : "Enviar"}
        </Button>
      ) : (
        <Enviado onEdit={() => setSent(false)} />
      )}
    </div>
  );
}

// --- 3-7 · Bloques del recorrido del cliente -----------------------------

function Bloque({ bloque }: { bloque: (typeof COM_BLOQUES)[number] }) {
  const [respuesta, setRespuesta] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  // el celular puede reusarse entre bloques: reiniciar al cambiar de bloque
  useEffect(() => {
    setRespuesta("");
    setSent(false);
    setErr("");
  }, [bloque.key]);

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder(bloque.key, { respuesta: respuesta.trim() });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <p className="font-mono text-xs uppercase tracking-widest text-faint">Bloque {bloque.n}</p>
      <h2 className="mt-1 text-xl font-semibold">{bloque.titulo}</h2>
      <p className="mt-1 text-sm text-muted">{bloque.bajada}</p>

      <div className="glass mt-4 rounded-2xl p-5">
        <Markdown text={bloque.cuerpoMd} />
      </div>

      <div className="mt-4 rounded-2xl border-gradient p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">La pregunta del abogado</p>
        <p className="mt-1 text-sm text-muted">{bloque.pregunta}</p>
      </div>

      {!sent ? (
        <div className="mt-4">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value.slice(0, bloque.maxChars))}
            rows={3}
            placeholder={bloque.placeholder}
            className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-sm outline-none placeholder:text-faint focus:border-teal/60"
          />
          <p className="mt-1 text-right text-xs text-faint">
            {respuesta.length}/{bloque.maxChars}
          </p>
          {err && <p className="text-center text-sm text-magenta">{err}</p>}
          <Button onClick={send} disabled={busy || respuesta.trim().length < 3} className="mt-1 w-full">
            {busy ? <Spinner /> : "Enviar mi respuesta"}
          </Button>
        </div>
      ) : (
        <Enviado onEdit={() => setSent(false)}>✓ Respuesta enviada. Mirá el proyector.</Enviado>
      )}
    </div>
  );
}

// --- 5 · Cierre ----------------------------------------------------------

function Cierre() {
  const [palabra, setPalabra] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder("emp_cierre", { palabra: palabra.trim() });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <h2 className="text-xl font-semibold">{COM_CIERRE_TITULO}</h2>
      <p className="mt-1 text-sm text-muted">{COM_CIERRE_BAJADA}</p>

      {!sent ? (
        <div className="mt-4">
          <input
            value={palabra}
            onChange={(e) => setPalabra(e.target.value.slice(0, COM_PALABRA_MAX))}
            placeholder="una palabra"
            className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-center text-lg outline-none placeholder:text-faint focus:border-teal/60"
          />
          {err && <p className="mt-2 text-center text-sm text-magenta">{err}</p>}
          <Button onClick={send} disabled={busy || palabra.trim().length < 2} className="mt-3 w-full">
            {busy ? <Spinner /> : "Enviar"}
          </Button>
        </div>
      ) : (
        <Enviado onEdit={() => setSent(false)}>✓ Enviada. Mirá el proyector.</Enviado>
      )}

      <div className="mt-6 rounded-2xl border-gradient p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-teal">Para llevarte</p>
        <p className="mt-1 mb-4 text-sm text-muted">{COM_CIERRE_NOTA}</p>
        <DescargarGlosario />
      </div>
    </div>
  );
}
