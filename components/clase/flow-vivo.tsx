"use client";

// Vista del participante para cualquier clase en vivo (motor genérico).
// El celular no pide resultados agregados: esos se ven en la pantalla
// compartida del deck. Cada actividad confirma y remite a la pantalla.

import { useEffect, useState } from "react";
import { LogoRL1 } from "@/components/brand/logo-rl1";
import { Button, Spinner } from "@/components/ui";
import type { ActividadVivo, ClaseVivoConfig } from "@/lib/clase-vivo";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ActividadParticipante({
  config,
  session,
  me,
}: {
  config: ClaseVivoConfig;
  session: SessionRow;
  me: ParticipantRow;
}) {
  const act = config.getActividad(session.current_activity);
  if (!act) return <Espera name={me.name} />;
  const responder = (payload: unknown) => enviar(config.slug, act.key, payload);
  switch (act.kind) {
    case "encuesta":
      return <Encuesta act={act} responder={responder} />;
    case "opciones":
      return <Opciones act={act} responder={responder} />;
    case "chips":
      return <Chips act={act} responder={responder} />;
    case "texto":
      return <Texto act={act} responder={responder} />;
    case "palabra":
      return <Palabra act={act} responder={responder} />;
  }
}

type Responder = (payload: unknown) => Promise<void>;

async function enviar(slug: string, activity: string, payload: unknown) {
  const res = await fetch(`/api/session/${slug}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, item_key: "", payload }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error(d.error || "No se pudo enviar");
  }
}

function Espera({ name }: { name: string }) {
  return (
    <div className="rise flex flex-col items-center justify-center py-16 text-center">
      <div className="pulse-ring mb-6 rounded-full p-1">
        <LogoRL1 size={48} wordmark={false} />
      </div>
      <h2 className="text-xl font-semibold">¡Bienvenido/a, {name.split(" ")[0]}!</h2>
      <p className="mt-2 max-w-sm text-sm text-muted">
        Ya está en la sesión. Cuando comience una actividad, aparecerá aquí automáticamente. Los
        resultados se ven en la pantalla principal.
      </p>
      <div className="mt-6 flex items-center gap-2 text-xs text-faint">
        <span className="size-2 animate-pulse rounded-full bg-teal" />
        Conectado
      </div>
    </div>
  );
}

function Cabecera({ act }: { act: ActividadVivo }) {
  return (
    <>
      <h2 className="text-xl font-semibold">{act.titulo}</h2>
      <p className="mt-1 text-sm text-muted">{act.bajada}</p>
    </>
  );
}

function Enviado({ onEdit, children }: { onEdit?: () => void; children?: React.ReactNode }) {
  return (
    <div className="mt-5 rounded-xl border border-teal/40 bg-teal/10 p-4 text-center text-sm text-teal">
      {children ?? "✓ Respuesta enviada. Observe la pantalla principal."}
      {onEdit && (
        <button onClick={onEdit} className="mt-1 block w-full text-xs text-faint underline-offset-2 hover:underline">
          Modificar
        </button>
      )}
    </div>
  );
}

function useReinicio(key: string, reset: () => void) {
  // el celular sigue abierto entre actividades: limpiar al cambiar
  useEffect(reset, [key]); // eslint-disable-line react-hooks/exhaustive-deps
}

function Encuesta({ act, responder }: { act: ActividadVivo; responder: Responder }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const preguntas = act.preguntas ?? [];
  useReinicio(act.key, () => {
    setAnswers({});
    setErr("");
  });

  function pick(qid: string, oid: string) {
    const next = { ...answers, [qid]: oid };
    setAnswers(next);
    responder({ answers: next }).catch((e) => setErr((e as Error).message));
  }

  const completas = preguntas.filter((q) => answers[q.id]).length;

  return (
    <div className="rise">
      <Cabecera act={act} />
      <div className="mt-5 space-y-5">
        {preguntas.map((q, qi) => (
          <div key={q.id}>
            <p className="mb-2 text-sm font-medium">
              <span className="mr-1 text-faint">{qi + 1}.</span>
              {q.q}
            </p>
            <div className="flex flex-wrap gap-2">
              {q.opciones.map((o) => (
                <button
                  key={o.id}
                  onClick={() => pick(q.id, o.id)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition active:scale-[0.98]",
                    answers[q.id] === o.id
                      ? "border-teal/70 bg-teal/15 text-teal glow-teal"
                      : "border-line bg-panel/40 hover:border-faint",
                  )}
                >
                  <span className="text-base">{o.emoji}</span>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {err && <p className="mt-3 text-center text-sm text-magenta">{err}</p>}
      {completas === preguntas.length && preguntas.length > 0 && <Enviado>✓ ¡Listo! Observe la pantalla.</Enviado>}
    </div>
  );
}

function Opciones({ act, responder }: { act: ActividadVivo; responder: Responder }) {
  const [opcion, setOpcion] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useReinicio(act.key, () => {
    setOpcion("");
    setSent(false);
    setErr("");
  });

  async function send(op: string) {
    setOpcion(op);
    setBusy(true);
    setErr("");
    try {
      await responder({ opcion: op });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const opciones = act.opciones ?? [];
  const dos = opciones.length === 2;

  return (
    <div className="rise">
      <Cabecera act={act} />
      <div className={cn("mt-5 grid gap-3", dos ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
        {opciones.map((o) => {
          const on = opcion === o.id;
          return (
            <button
              key={o.id}
              onClick={() => !sent && !busy && send(o.id)}
              disabled={sent || busy}
              className={cn(
                "flex flex-col items-center gap-2 rounded-2xl border px-3 py-6 text-center transition active:scale-[0.98]",
                on ? "border-teal bg-teal/15 text-teal glow-teal" : "border-line bg-panel/40 hover:border-faint",
                sent && !on && "opacity-50",
              )}
            >
              <span className={cn(dos ? "text-4xl" : "text-2xl")}>{o.emoji}</span>
              <span className="text-sm font-semibold">{o.label}</span>
            </button>
          );
        })}
      </div>
      {err && <p className="mt-3 text-center text-sm text-magenta">{err}</p>}
      {sent && <Enviado onEdit={() => setSent(false)}>✓ Voto enviado. Observe la pantalla.</Enviado>}
    </div>
  );
}

function Chips({ act, responder }: { act: ActividadVivo; responder: Responder }) {
  const [sel, setSel] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  useReinicio(act.key, () => {
    setSel([]);
    setSent(false);
    setErr("");
  });

  function toggle(id: string) {
    setSel((prev) => {
      if (act.exclusiva && id === act.exclusiva) return prev.includes(id) ? [] : [id];
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return act.exclusiva ? next.filter((x) => x !== act.exclusiva) : next;
    });
  }

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder({ selected: sel });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <Cabecera act={act} />
      <div className="mt-5 grid grid-cols-2 gap-3">
        {(act.opciones ?? []).map((o) => {
          const on = sel.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => !sent && toggle(o.id)}
              disabled={sent}
              className={cn(
                "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition",
                on ? "border-teal/70 bg-teal/10 glow-teal" : "border-line bg-panel/40 hover:border-faint",
                sent && "opacity-70",
              )}
            >
              <span className="text-2xl">{o.emoji}</span>
              <span className="text-sm font-medium leading-tight">{o.label}</span>
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

function Texto({ act, responder }: { act: ActividadVivo; responder: Responder }) {
  const [respuesta, setRespuesta] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const max = act.maxChars ?? 200;
  useReinicio(act.key, () => {
    setRespuesta("");
    setSent(false);
    setErr("");
  });

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder({ respuesta: respuesta.trim() });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <Cabecera act={act} />
      {!sent ? (
        <div className="mt-4">
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value.slice(0, max))}
            rows={3}
            placeholder={act.placeholder}
            className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-sm outline-none placeholder:text-faint focus:border-teal/60"
          />
          <p className="mt-1 text-right text-xs text-faint">
            {respuesta.length}/{max}
          </p>
          {err && <p className="text-center text-sm text-magenta">{err}</p>}
          <Button onClick={send} disabled={busy || respuesta.trim().length < 3} className="mt-1 w-full">
            {busy ? <Spinner /> : "Enviar respuesta"}
          </Button>
        </div>
      ) : (
        <Enviado onEdit={() => setSent(false)} />
      )}
    </div>
  );
}

function Palabra({ act, responder }: { act: ActividadVivo; responder: Responder }) {
  const [palabra, setPalabra] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const max = act.maxChars ?? 22;
  useReinicio(act.key, () => {
    setPalabra("");
    setSent(false);
    setErr("");
  });

  async function send() {
    setBusy(true);
    setErr("");
    try {
      await responder({ palabra: palabra.trim() });
      setSent(true);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rise">
      <Cabecera act={act} />
      {!sent ? (
        <div className="mt-4">
          <input
            value={palabra}
            onChange={(e) => setPalabra(e.target.value.slice(0, max))}
            placeholder="una palabra"
            className="w-full rounded-xl border border-line bg-ink-2/70 px-4 py-3 text-center text-lg outline-none placeholder:text-faint focus:border-teal/60"
          />
          {err && <p className="mt-2 text-center text-sm text-magenta">{err}</p>}
          <Button onClick={send} disabled={busy || palabra.trim().length < 2} className="mt-3 w-full">
            {busy ? <Spinner /> : "Enviar"}
          </Button>
        </div>
      ) : (
        <Enviado onEdit={() => setSent(false)}>✓ Enviada. Observe la pantalla.</Enviado>
      )}
    </div>
  );
}
