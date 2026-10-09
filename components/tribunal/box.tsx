"use client";

// Box de expectativas y devolución en el celular del participante: aparece
// arriba de todo cuando el equipo lo envía (aviso abierto desde el control).
// Se puede responder ahora o minimizar; la respuesta llega al equipo con el
// nombre del participante y se puede modificar.

import { useEffect, useState } from "react";
import type { TfBox } from "@/lib/tribunal";
import { cn } from "@/lib/utils";

type Respuestas = Record<string, string>;

export function BoxTribunal({ slug, box }: { slug: string; box: TfBox }) {
  const [valores, setValores] = useState<Respuestas>({});
  const [estado, setEstado] = useState<"cargando" | "abierto" | "minimizado" | "enviando" | "enviado">("cargando");
  const [err, setErr] = useState("");

  // Si ya respondió (por ejemplo, desde otra pestaña), se muestra como enviado.
  useEffect(() => {
    fetch(`/api/session/${slug}/my-responses`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { responses?: { activity: string; payload: Respuestas }[] }) => {
        const previa = d.responses?.find((r) => r.activity === box.key);
        if (previa) {
          setValores(previa.payload ?? {});
          setEstado("enviado");
        } else setEstado("abierto");
      })
      .catch(() => setEstado("abierto"));
  }, [slug, box.key]);

  const completo = box.preguntas.every((p) => !p.obligatoria || (valores[p.id] ?? "").trim().length >= 3);

  async function enviar() {
    setEstado("enviando");
    setErr("");
    try {
      const payload = Object.fromEntries(box.preguntas.map((p) => [p.id, (valores[p.id] ?? "").trim().slice(0, 600)]));
      const res = await fetch(`/api/session/${slug}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: box.key, item_key: "", payload }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || "No se pudo enviar");
      setEstado("enviado");
    } catch (e) {
      setErr((e as Error).message);
      setEstado("abierto");
    }
  }

  if (estado === "cargando") return null;

  if (estado === "minimizado" || estado === "enviado")
    return (
      <button
        onClick={() => setEstado("abierto")}
        className={cn(
          "mb-5 flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm",
          estado === "enviado" ? "border-teal/40 bg-teal/10 text-teal" : "border-tf-ocre/50 bg-tf-ocre-claro text-tf-tinta",
        )}
      >
        <span className="text-lg">{estado === "enviado" ? "✓" : "📨"}</span>
        <span className="min-w-0 flex-1">{estado === "enviado" ? "Gracias: recibimos sus respuestas." : `${box.titulo}: responder`}</span>
        <span className="text-xs text-faint">{estado === "enviado" ? "Modificar" : "Abrir"}</span>
      </button>
    );

  return (
    <section className="rise mb-6 rounded-3xl border border-tf-ocre/50 bg-tf-ocre-claro/60 p-5">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-tf-ocre">📨 Para el equipo</p>
      <h2 className="tf-serif mt-1 text-2xl leading-tight">{box.titulo}</h2>
      <div className="mt-4 grid gap-4">
        {box.preguntas.map((p) => (
          <label key={p.id} className="grid gap-1.5">
            <span className="text-base font-medium">
              {p.q}
              {!p.obligatoria && <span className="ml-1 text-sm font-normal text-faint">(opcional)</span>}
            </span>
            <textarea
              value={valores[p.id] ?? ""}
              onChange={(e) => setValores((v) => ({ ...v, [p.id]: e.target.value.slice(0, 600) }))}
              rows={3}
              placeholder={p.placeholder}
              className="w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-base outline-none placeholder:text-faint focus:border-teal/60"
            />
          </label>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-faint">{box.aviso}</p>
      {err && <p className="mt-2 text-sm text-magenta">{err}</p>}
      <div className="mt-4 flex gap-2">
        <button
          onClick={enviar}
          disabled={!completo || estado === "enviando"}
          className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-tf-azul px-4 font-semibold text-white disabled:opacity-40"
        >
          {estado === "enviando" ? "Enviando…" : "Enviar"}
        </button>
        <button onClick={() => setEstado("minimizado")} className="rounded-xl border border-line px-4 text-sm text-muted">
          Después
        </button>
      </div>
    </section>
  );
}
