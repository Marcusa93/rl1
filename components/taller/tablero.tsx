"use client";

// El tablero de sala en el celular del docente (dentro del control remoto):
// los pasos de la etapa en curso con cuántas compus terminaron, las últimas
// preguntas a MessIAs y las actas entregadas. Para caminar entre las mesas.

import { useEffect, useRef, useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { TAL_SLIDES, TAL_SLUG } from "@/lib/taller-clase";
import { TAL_ETAPAS } from "@/lib/taller-guiado";

interface PedidoAyuda {
  participant_id: string;
  name: string;
  etapa: number;
  paso: string;
  desde: number;
}

/** Un pip corto: suena cuando una mesa nueva levanta la mano. */
function pip() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1175, ctx.currentTime + 0.12);
    vol.gain.setValueAtTime(0.0001, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    vol.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.connect(vol).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.36);
    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {}
}

/** Del id del paso al título que el docente reconoce. */
function tituloPaso(id: string): string {
  for (const e of TAL_ETAPAS) {
    const p = e.pasos.find((x) => x.id === id);
    if (p) return p.titulo;
  }
  return "";
}

function haceCuanto(ms: number): string {
  const min = Math.floor((Date.now() - ms) / 60000);
  if (min < 1) return "recién";
  return `hace ${min}′`;
}

/** Manos levantadas en la sala: quién pide ayuda, desde cuándo y en qué paso. */
function ManosLevantadas() {
  const { data } = useResultados(TAL_SLUG, "tal_ayuda", 4000);
  const [atendidos, setAtendidos] = useState<string[]>([]);
  const pedidos = (
    ((data?.summary?.pedidos as PedidoAyuda[]) ?? []) as PedidoAyuda[]
  ).filter((p) => !atendidos.includes(p.participant_id));
  const vistos = useRef<Set<string> | null>(null);

  // Pip y vibración cuando se levanta una mano nueva (no en la primera lectura).
  useEffect(() => {
    const ids = new Set(pedidos.map((p) => p.participant_id));
    const previos = vistos.current;
    vistos.current = ids;
    if (previos === null) return;
    if (pedidos.some((p) => !previos.has(p.participant_id))) {
      pip();
      if ("vibrate" in navigator) navigator.vibrate?.([120, 60, 120]);
    }
  }, [pedidos]);

  function atender(p: PedidoAyuda) {
    setAtendidos((prev) => [...prev, p.participant_id]);
    fetch(`/api/session/${TAL_SLUG}/ayuda`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ participant_id: p.participant_id }),
    }).catch(() => {});
  }

  if (pedidos.length === 0) return null;

  return (
    <div className="pulse-ring mt-2 space-y-2 rounded-2xl border-2 border-amber-400/70 bg-amber-400/10 p-3.5">
      <p className="text-base font-bold text-amber-300">
        <span className="campana mr-1 inline-block">🔔</span>
        {pedidos.length === 1
          ? "Una mesa pide ayuda"
          : `${pedidos.length} mesas piden ayuda`}
      </p>
      <ul className="space-y-1.5">
        {pedidos.map((p) => (
          <li key={p.participant_id} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold">{p.name}</p>
              <p className="truncate text-[11px] text-faint">
                etapa {p.etapa}
                {tituloPaso(p.paso) && ` · ${tituloPaso(p.paso)}`} ·{" "}
                {haceCuanto(p.desde)}
              </p>
            </div>
            <button
              onClick={() => atender(p)}
              className="shrink-0 rounded-full border border-teal/60 bg-teal/15 px-3 py-1.5 text-xs font-semibold text-teal active:scale-95"
            >
              Voy ✓
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Etapa abierta hasta esta placa: la más alta de las placas anteriores. */
function etapaHasta(idx: number): number {
  let e = 0;
  for (const s of TAL_SLIDES.slice(0, idx + 1))
    if (s.etapa !== undefined && s.etapa > e) e = s.etapa;
  return e;
}

export function TableroControl({ idx }: { idx: number }) {
  const etapa = TAL_ETAPAS[etapaHasta(idx)] ?? TAL_ETAPAS[0];
  const { data: pasos } = useResultados(TAL_SLUG, "tal_paso", 5000);
  const { data: messias } = useResultados(TAL_SLUG, "tal_messias", 8000);
  const { data: actas } = useResultados(TAL_SLUG, "tal_acta", 10000);
  const counts = (pasos?.summary?.counts as Record<string, number>) ?? {};
  const total = pasos?.participants ?? 0;
  const preguntas = ((messias?.summary?.preguntas as string[]) ?? []).slice(
    0,
    3,
  );
  const nActas = (actas?.summary?.total as number) ?? 0;

  return (
    <>
      <ManosLevantadas />
      <div className="mt-2 space-y-3 rounded-2xl border border-line bg-panel/50 p-3.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-sm font-bold">
            {etapa.emoji} Etapa {etapa.n} · {etapa.titulo}
          </p>
          <p className="font-mono text-xs text-faint">{total} compus</p>
        </div>
        <div className="space-y-2">
          {etapa.pasos.map((p) => {
            const c = counts[p.id] ?? 0;
            const pct = total
              ? Math.min(100, Math.round((c / total) * 100))
              : 0;
            return (
              <div key={p.id}>
                <div className="flex items-baseline justify-between gap-2 text-xs">
                  <span className="min-w-0 truncate text-muted">
                    {p.titulo}
                    {p.extra && " (extra)"}
                  </span>
                  <span className="shrink-0 font-mono text-teal">
                    {c}/{total}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {preguntas.length > 0 && (
          <div className="border-t border-line/60 pt-2.5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-violet">
              🗨️ Le preguntan a MessIAs
            </p>
            <ul className="mt-1.5 space-y-1">
              {preguntas.map((q, i) => (
                <li key={i} className="text-xs leading-snug text-muted">
                  «{q}»
                </li>
              ))}
            </ul>
          </div>
        )}
        {nActas > 0 && (
          <p className="border-t border-line/60 pt-2.5 text-xs text-muted">
            📤 <b className="text-teal">{nActas}</b> actas entregadas
          </p>
        )}
      </div>
    </>
  );
}
