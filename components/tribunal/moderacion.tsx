"use client";

// Panel del celular del equipo (Marco o Franco) en /tribunal/control:
// revisar las respuestas abiertas de la placa actual antes de proyectarlas
// (ocultar palabras inapropiadas o datos reales) y exportar todas las
// respuestas de la clase en CSV para el material pedagógico.

import { useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useModeracion } from "@/components/tribunal/resultados";
import { actividadesDeSlide, getActividadTf, type TfActividad, type TfClase } from "@/lib/tribunal";
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
      <Exportar clase={clase} />
      <Reiniciar clase={clase} idx={idx} onModeracion={() => cambiar({ reiniciar: true })} />
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
function respuestaLegible(act: TfActividad | undefined, p: Record<string, unknown>): string {
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
      const orden = clase.actividades.map((a) => a.key as string);
      const filas = rows
        .filter((r) => orden.includes(r.activity))
        .sort((a, b) => orden.indexOf(a.activity) - orden.indexOf(b.activity) || a.created_at.localeCompare(b.created_at))
        .map((r) => {
          const act = getActividadTf(clase, r.activity);
          return [act?.titulo ?? r.activity, r.name, respuestaLegible(act, r.payload ?? {}), new Date(r.created_at).toLocaleString("es-AR")];
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
