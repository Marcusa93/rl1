"use client";

// Panel del celular del equipo en /tribunal/control (segunda charla), debajo
// de los botones de la pantalla:
//   placa 02 → revisar la nube (ocultar) y marcar hasta tres palabras para analizar
//   placa 07 → elegir el par de un participante para proyectar (sin nombre)
//   placas 29 y 30 → elegir la ficha de trazabilidad que se proyecta en la 30
//   siempre → exportar las respuestas (CSV) y reiniciar después de ensayar

import { useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useModeracion2, useRespuestas, type FilaRespuesta } from "@/components/tribunal2/tableros";
import { MAX_DESTACADAS } from "@/lib/moderacion";
import { getTf2Actividad, TF2_ACTIVIDADES, TF2_SLIDES, TF2_SLUG, type Tf2A2, type Tf2A5 } from "@/lib/tribunal-clase2";
import { cn } from "@/lib/utils";

export function PanelTf2({ idx, total, slug = TF2_SLUG }: { idx: number; total?: number; slug?: string }) {
  const slide = TF2_SLIDES[idx];
  const act = slide?.t === "placa" ? slide.actividad : undefined;
  const num = slide?.t === "placa" ? slide.num : "";
  const { moderacion, cambiar } = useModeracion2(slug, 2000);

  if (total && total !== TF2_SLIDES.length)
    return (
      <div className="rounded-2xl border-2 border-magenta bg-magenta/10 p-4">
        <p className="text-base font-bold text-magenta">⚠ La presentación del proyector es de otra versión</p>
        <p className="mt-1 text-sm">Recargala en la compu (F5) y recargá también este control: hasta entonces, «ir a…» no coincide con lo que se proyecta.</p>
      </div>
    );

  return (
    <div className="grid gap-3">
      {act === "tf2_a1" && (
        <ModerarNube
          slug={slug}
          ocultas={moderacion.tf2_a1?.ocultas ?? []}
          destacadas={moderacion.tf2_a1?.destacadas ?? []}
          proyectada={Boolean(moderacion.tf2_a1?.proyectar)}
          onCambiar={cambiar}
        />
      )}
      {act === "tf2_a2" && <ElegirPar slug={slug} elegida={moderacion.tf2_a2?.elegida ?? null} onElegir={(id) => cambiar({ activity: "tf2_a2", elegida: id })} />}
      {(act === "tf2_a5" || num === "30") && (
        <ElegirFicha slug={slug} elegida={moderacion.tf2_a5?.elegida ?? null} onElegir={(id) => cambiar({ activity: "tf2_a5", elegida: id })} />
      )}
      <Exportar slug={slug} />
      <Reiniciar slug={slug} idx={idx} onModeracion={() => cambiar({ reiniciar: true })} />
    </div>
  );
}

function Caja({ titulo, ayuda, children }: { titulo: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-400/50 bg-amber-400/5 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{titulo}</p>
      {ayuda && <p className="mt-1 text-xs text-faint">{ayuda}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

function ModerarNube({
  slug,
  ocultas,
  destacadas,
  proyectada,
  onCambiar,
}: {
  slug: string;
  ocultas: string[];
  destacadas: string[];
  proyectada: boolean;
  onCambiar: ReturnType<typeof useModeracion2>["cambiar"];
}) {
  const { data } = useResultados(slug, "tf2_a1", 2000);
  const palabras = (data?.summary?.palabras as { palabra: string; n: number }[]) ?? [];
  return (
    <Caja
      titulo="🛡️ Nube · revisar antes de proyectar"
      ayuda={
        proyectada
          ? "● En pantalla. Lo que oculte desaparece al instante. ★ marca hasta tres palabras para analizar."
          : "Todavía no se ve. Oculte lo que no corresponda (nombres, datos reales) y proyecte."
      }
    >
      <button
        onClick={() => onCambiar({ activity: "tf2_a1", proyectar: !proyectada })}
        className={cn("mb-3 w-full rounded-xl px-4 py-3 text-sm font-semibold", proyectada ? "border border-line bg-panel/60" : "bg-teal text-ink")}
      >
        {proyectada ? "Ocultar la nube de la pantalla" : "👁 Proyectar la nube"}
      </button>
      {!palabras.length ? (
        <p className="text-sm text-faint">Sin palabras todavía.</p>
      ) : (
        <div className="grid gap-1.5">
          {palabras.map(({ palabra, n }) => {
            const oculta = ocultas.includes(palabra);
            const destacada = destacadas.includes(palabra);
            return (
              <div key={palabra} className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-sm", oculta ? "border-magenta/40 bg-magenta/10 text-faint" : "border-line bg-panel/60")}>
                <span className={cn("min-w-0 flex-1", oculta && "line-through")}>{palabra}</span>
                <span className="shrink-0 font-mono text-xs text-faint">×{n}</span>
                {!oculta && (
                  <button
                    onClick={() => onCambiar({ activity: "tf2_a1", destacar: palabra, destacada: !destacada })}
                    disabled={!destacada && destacadas.length >= MAX_DESTACADAS}
                    className={cn("shrink-0 rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-30", destacada ? "bg-amber-400 text-ink" : "border border-line")}
                  >
                    ★
                  </button>
                )}
                <button onClick={() => onCambiar({ activity: "tf2_a1", valor: palabra, oculta: !oculta })} className={cn("shrink-0 text-xs font-semibold", oculta ? "text-magenta" : "text-teal")}>
                  {oculta ? "mostrar" : "ocultar"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </Caja>
  );
}

function ElegirPar({ slug, elegida, onElegir }: { slug: string; elegida: string | null; onElegir: (id: string | null) => void }) {
  const filas = useRespuestas(slug, "tf2_a2", true, 3000).filter((f) => (f.payload as unknown as Tf2A2).salidaB && !(f.payload as unknown as Tf2A2).ejemplo);
  return (
    <Caja titulo="🧪 Proyectar un par (sin nombre)" ayuda="Los que ya compararon pedido simple y estructurado. Revise que no tenga datos reales antes de proyectar.">
      {!filas.length ? (
        <p className="text-sm text-faint">Nadie terminó el segundo pedido todavía. Mientras, puede proyectar el ejemplo preparado (botón de arriba).</p>
      ) : (
        <Lista filas={filas} elegida={elegida} onElegir={onElegir} resumen={(p) => `${(p as unknown as Tf2A2).tarea} · «${String((p as unknown as Tf2A2).pedidoB ?? "").slice(0, 90)}…»`} />
      )}
    </Caja>
  );
}

function ElegirFicha({ slug, elegida, onElegir }: { slug: string; elegida: string | null; onElegir: (id: string | null) => void }) {
  const filas = useRespuestas(slug, "tf2_a5", true, 3000).filter((f) => (f.payload as unknown as Tf2A5).prueba?.salida);
  return (
    <Caja titulo="🧾 Ficha para la placa 30 (sin nombre)" ayuda="Las que ya probaron su instrucción. Si no elige ninguna, se proyecta la ficha de ejemplo.">
      {!filas.length ? (
        <p className="text-sm text-faint">Todavía nadie probó su instrucción.</p>
      ) : (
        <Lista filas={filas} elegida={elegida} onElegir={onElegir} resumen={(p) => `${String((p as unknown as Tf2A5).campos?.tarea ?? "—").slice(0, 80)} · etapa: ${(p as unknown as Tf2A5).etapa ?? "—"}`} />
      )}
    </Caja>
  );
}

function Lista({
  filas,
  elegida,
  onElegir,
  resumen,
}: {
  filas: FilaRespuesta[];
  elegida: string | null;
  onElegir: (id: string | null) => void;
  resumen: (p: Record<string, unknown>) => string;
}) {
  return (
    <div className="grid gap-1.5">
      {filas.map((f) => {
        const activa = f.participant_id === elegida;
        return (
          <button
            key={f.participant_id}
            onClick={() => onElegir(activa ? null : f.participant_id)}
            className={cn("rounded-xl border px-3 py-2.5 text-left text-sm transition active:scale-[0.99]", activa ? "border-teal bg-teal/15 text-teal" : "border-line bg-panel/60")}
          >
            <span className="block text-xs text-faint">{f.name}</span>
            <span className="mt-0.5 block">{resumen(f.payload)}</span>
            <span className="mt-1 block text-xs font-semibold">{activa ? "● en pantalla · tocar para quitar" : "proyectar"}</span>
          </button>
        );
      })}
    </div>
  );
}

// --- Exportar y reiniciar ---------------------------------------------------------------------------

function legible(activity: string, p: Record<string, unknown>): string {
  if (activity === "tf2_a1") return String(p.palabra ?? "");
  if (activity === "tf2_a2") {
    const a = p as unknown as Tf2A2;
    return [`Tarea: ${a.tarea}`, `Pedido simple: ${a.pedidoA ?? ""}`, `Pedido estructurado: ${a.pedidoB ?? ""}`, `Cambios: ${(a.selected ?? []).join(", ")}`].join(" | ");
  }
  if (activity === "tf2_a3") {
    const ans = (p.answers as Record<string, string>) ?? {};
    return `Ayuda más: ${ans.ayuda ?? "—"} | Cambió: ${ans.cambio ?? "—"}`;
  }
  if (activity === "tf2_a4") return `Votó: texto ${String(p.opcion ?? "—").toUpperCase()}`;
  const a = p as unknown as Tf2A5;
  return [`Etapa: ${a.etapa ?? "—"}`, `Instrucción: ${a.instruccion ?? ""}`, `Controles: ${Object.entries(a.controles ?? {}).map(([k, v]) => `${k} ${v}`).join(", ")}`].join(" | ");
}

function Exportar({ slug }: { slug: string }) {
  const [estado, setEstado] = useState<"" | "bajando" | "error">("");
  async function bajar() {
    setEstado("bajando");
    try {
      const res = await fetch(`/api/session/${slug}/all-responses`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      const { rows } = (await res.json()) as { rows: (FilaRespuesta & { created_at: string })[] };
      const orden = TF2_ACTIVIDADES.map((a) => a.key as string);
      const filas = rows
        .filter((r) => orden.includes(r.activity))
        .sort((a, b) => orden.indexOf(a.activity) - orden.indexOf(b.activity) || a.created_at.localeCompare(b.created_at))
        .map((r) => [getTf2Actividad(r.activity)?.nombre ?? r.activity, r.name, legible(r.activity, r.payload ?? {}), new Date(r.created_at).toLocaleString("es-AR")]);
      const celda = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const csv = [["Actividad", "Participante (alias)", "Respuesta", "Fecha"], ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "tribunal-clase2-respuestas.csv";
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

function Reiniciar({ slug, idx, onModeracion }: { slug: string; idx: number; onModeracion: () => Promise<void> }) {
  const [estado, setEstado] = useState<"" | "reiniciando" | "ok" | "error">("");
  async function reiniciar() {
    if (!confirm("¿Reiniciar la sesión? Se borran los participantes, sus respuestas y la moderación. Solo después de ensayar: nunca después de la clase real.")) return;
    setEstado("reiniciando");
    try {
      const r = await fetch(`/api/session/${slug}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await onModeracion();
      const s = TF2_SLIDES[idx];
      if (s?.t === "placa" && s.actividad)
        await fetch(`/api/session/${slug}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_activity: s.actividad }),
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
