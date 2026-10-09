"use client";

// Panel del celular del equipo (Marco o Franco) en /tribunal/control:
// revisar las respuestas abiertas de la placa actual antes de proyectarlas
// (ocultar palabras inapropiadas o datos reales), enviar a todos el box de
// expectativas y leer sus respuestas con nombre, y exportar todas las
// respuestas de la clase en CSV para el material pedagógico.

import { useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useLive } from "@/components/use-live";
import { useModeracion } from "@/components/tribunal/resultados";
import { actividadesDeSlide, getActividadTf, type TfActividad, type TfBox, type TfClase } from "@/lib/tribunal";
import { cn } from "@/lib/utils";

export function PanelTribunal({ clase, idx }: { clase: TfClase; idx: number }) {
  const slide = clase.slides[idx];
  const abiertas = (slide ? actividadesDeSlide(slide) : [])
    .map((k) => getActividadTf(clase, k))
    .filter((a): a is TfActividad => Boolean(a?.moderada));
  const { moderacion, cambiar } = useModeracion(clase.slug, 2000);

  return (
    <div className="grid gap-3">
      {abiertas.map((act) => (
        <ModerarActividad
          key={act.key}
          slug={clase.slug}
          act={act}
          ocultas={moderacion[act.key]?.ocultas ?? []}
          proyectada={Boolean(moderacion[act.key]?.proyectar)}
          onOcultar={(valor, oculta) => cambiar({ activity: act.key, valor, oculta })}
        />
      ))}
      {clase.box && <BoxEquipo slug={clase.slug} box={clase.box} />}
      <Exportar clase={clase} />
      <Reiniciar clase={clase} idx={idx} onModeracion={() => cambiar({ reiniciar: true })} />
    </div>
  );
}

// --- Box de expectativas y devolución ---------------------------------------------------

type FilaBox = { name: string; activity: string; payload: Record<string, string>; created_at: string; updated_at?: string };

/** Enviar el box a todos los celulares y leer las respuestas, con nombre, a medida que llegan. */
function BoxEquipo({ slug, box }: { slug: string; box: TfBox }) {
  const { data: ses, refresh } = useLive<{ participants: number; avisos?: string[] }>(`/api/session/${slug}`, 4000);
  const { data: todas } = useLive<{ rows: FilaBox[] }>(`/api/session/${slug}/all-responses`, 8000);
  const [abierto, setAbierto] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const enviado = Boolean(ses?.avisos?.includes(box.key));
  const respuestas = (todas?.rows ?? [])
    .filter((r) => r.activity === box.key)
    .sort((a, b) => String(b.updated_at ?? b.created_at).localeCompare(String(a.updated_at ?? a.created_at)));

  async function alternar() {
    if (enviado && !confirm("¿Retirar el box de los celulares? Las respuestas ya enviadas se conservan.")) return;
    setEnviando(true);
    await fetch(`/api/session/${slug}/avisos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: box.key, abierto: !enviado }),
    }).catch(() => {});
    await refresh();
    setEnviando(false);
  }

  return (
    <div className="rounded-2xl border border-violet/50 bg-violet/10 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-violet">📨 Box de expectativas y devolución</p>
      <button
        onClick={alternar}
        disabled={enviando || !ses}
        className={cn(
          "mt-3 flex min-h-12 w-full items-center justify-center rounded-xl px-4 text-base font-semibold transition active:scale-[0.99]",
          enviado ? "border border-line bg-panel/60 text-muted" : "bg-gradient-to-r from-teal to-cyan text-ink",
        )}
      >
        {enviando ? "…" : enviado ? "● Enviado a todos · tocar para retirarlo" : "Enviar el box a todos los celulares"}
      </button>
      <button onClick={() => setAbierto((v) => !v)} className="mt-3 flex w-full items-center text-left text-sm">
        <span className="flex-1">
          <b className="text-teal">{respuestas.length}</b> {respuestas.length === 1 ? "respuesta" : "respuestas"}
          {ses ? <span className="text-faint"> · {ses.participants} conectados</span> : null}
        </span>
        <span className="text-faint">{abierto ? "▲ ocultar" : "▼ ver quién y qué"}</span>
      </button>
      {abierto && (
        <div className="mt-3 grid gap-2">
          {!respuestas.length && <p className="text-sm text-faint">Todavía no llegó ninguna.</p>}
          {respuestas.map((r, i) => (
            <div key={`${r.name}-${i}`} className="rounded-xl border border-line bg-panel/60 p-3">
              <p className="text-sm font-semibold text-teal">{r.name}</p>
              {box.preguntas.map((p) =>
                r.payload?.[p.id] ? (
                  <p key={p.id} className="mt-1.5 text-sm leading-snug">
                    <span className="block text-[11px] uppercase tracking-wide text-faint">{p.q}</span>
                    {r.payload[p.id]}
                  </p>
                ) : null,
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Reiniciar la sesión desde el celular (después de ensayar; nunca después de la clase real). */
function Reiniciar({ clase, idx, onModeracion }: { clase: TfClase; idx: number; onModeracion: () => Promise<void> }) {
  const [estado, setEstado] = useState<"" | "reiniciando" | "ok" | "error">("");

  async function reiniciar() {
    if (!confirm("¿Reiniciar la sesión? Se borran los participantes, sus respuestas y la moderación. Solo después de ensayar: nunca después de la clase real.")) return;
    setEstado("reiniciando");
    try {
      const r = await fetch(`/api/session/${clase.slug}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await onModeracion();
      // La pantalla que se proyecta vuelve a abrir su actividad en los celulares.
      const s = clase.slides[idx];
      if (s && "activa" in s)
        await fetch(`/api/session/${clase.slug}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_activity: s.activa }),
        });
      setEstado(r.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  return (
    <button onClick={reiniciar} disabled={estado === "reiniciando"} className="rounded-2xl border border-magenta/40 bg-magenta/5 px-4 py-3 text-left text-sm text-magenta">
      ⟲ {estado === "reiniciando" ? "Reiniciando…" : "Reiniciar la sesión (después de ensayar)"}
      {estado === "ok" && <span className="ml-2 text-faint">listo: sesión vacía</span>}
      {estado === "error" && <span className="ml-2">no se pudo: reintente</span>}
    </button>
  );
}

function ModerarActividad({
  slug,
  act,
  ocultas,
  proyectada,
  onOcultar,
}: {
  slug: string;
  act: TfActividad;
  ocultas: string[];
  proyectada: boolean;
  onOcultar: (valor: string, oculta: boolean) => void;
}) {
  const { data } = useResultados(slug, act.key, 2000);
  const s = data?.summary ?? {};
  const items: { valor: string; n?: number }[] =
    act.kind === "palabra"
      ? ((s.palabras as { palabra: string; n: number }[]) ?? []).map((p) => ({ valor: p.palabra, n: p.n }))
      : ((s.respuestas as { respuesta: string }[]) ?? []).map((r) => ({ valor: r.respuesta })).reverse();

  return (
    <div className="rounded-2xl border border-amber-400/50 bg-amber-400/5 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">🛡️ Revisar antes de proyectar</p>
      <p className="mt-1 text-base font-semibold">{act.titulo}</p>
      <p className="mt-1 text-xs text-faint">
        {proyectada
          ? "● En pantalla. Lo que oculte desaparece al instante (y no va al material)."
          : "Todavía no se ve en la pantalla. Revise y toque «👁 Proyectar» arriba: así también queda revisada para el material descargable."}
      </p>
      {!items.length ? (
        <p className="mt-3 text-sm text-faint">Sin respuestas todavía.</p>
      ) : (
        <div className="mt-3 grid gap-1.5">
          {items.map(({ valor, n }) => {
            const oculta = ocultas.includes(valor);
            return (
              <button
                key={valor}
                onClick={() => onOcultar(valor, !oculta)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition active:scale-[0.99]",
                  oculta ? "border-magenta/40 bg-magenta/10 text-faint line-through" : "border-line bg-panel/60",
                )}
              >
                <span className="min-w-0 flex-1">{valor}</span>
                {n !== undefined && <span className="shrink-0 font-mono text-xs text-faint">×{n}</span>}
                <span className={cn("shrink-0 text-xs font-semibold", oculta ? "text-magenta" : "text-teal")}>{oculta ? "oculta" : "ocultar"}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Exportar ---------------------------------------------------------------------------------------

type Fila = { name: string; activity: string; item_key: string; payload: Record<string, unknown>; created_at: string };

/** Texto legible de una respuesta (las opciones con su etiqueta, no con su id). */
function respuestaLegible(act: TfActividad | undefined, p: Record<string, unknown>, box?: TfBox): string {
  if (box) return box.preguntas.map((q) => `${q.q} ${String(p[q.id] ?? "").trim() || "—"}`).join(" | ");
  const etiqueta = (id: string, opciones = act?.opciones ?? []) => opciones.find((o) => o.id === id)?.label ?? id;
  if (typeof p.opcion === "string") return etiqueta(p.opcion);
  if (Array.isArray(p.selected)) return (p.selected as string[]).map((id) => etiqueta(id)).join(" | ");
  if (p.answers && typeof p.answers === "object")
    return Object.entries(p.answers as Record<string, string>)
      .map(([q, id]) => {
        const preg = act?.preguntas?.find((x) => x.id === q);
        return `${preg?.q ?? q}: ${etiqueta(id, preg?.opciones)}`;
      })
      .join(" | ");
  return String(p.palabra ?? p.respuesta ?? JSON.stringify(p));
}

function Exportar({ clase }: { clase: TfClase }) {
  const [estado, setEstado] = useState<"" | "bajando" | "error">("");

  async function bajar() {
    setEstado("bajando");
    try {
      const res = await fetch(`/api/session/${clase.slug}/all-responses`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const { rows } = (await res.json()) as { rows: Fila[] };
      const orden = [...clase.actividades.map((a) => a.key as string), ...(clase.box ? [clase.box.key] : [])];
      const filas = rows
        .filter((r) => orden.includes(r.activity))
        .sort((a, b) => orden.indexOf(a.activity) - orden.indexOf(b.activity) || a.created_at.localeCompare(b.created_at))
        .map((r) => {
          const act = getActividadTf(clase, r.activity);
          const box = clase.box?.key === r.activity ? clase.box : undefined;
          return [
            box ? "Expectativas y devolución" : (act?.titulo ?? r.activity),
            r.name,
            respuestaLegible(act, r.payload ?? {}, box),
            new Date(r.created_at).toLocaleString("es-AR"),
          ];
        });
      const celda = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const csv = [["Actividad", "Participante", "Respuesta", "Fecha"], ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
      // BOM: que Excel abra bien los acentos.
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `tribunal-clase${clase.numero}-respuestas.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setEstado("");
    } catch {
      setEstado("error");
    }
  }

  return (
    <button onClick={bajar} disabled={estado === "bajando"} className="mt-2 rounded-2xl border border-line bg-panel/60 px-4 py-3 text-left text-sm text-muted">
      ⬇ {estado === "bajando" ? "Preparando…" : "Exportar todas las respuestas (CSV)"}
      {estado === "error" && <span className="ml-2 text-magenta">no se pudo: reintente</span>}
    </button>
  );
}
