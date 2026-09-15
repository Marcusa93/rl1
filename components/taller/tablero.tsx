"use client";

// El tablero de sala en el celular del docente (dentro del control remoto):
// los pasos de la etapa en curso con cuántas compus terminaron, las últimas
// preguntas a MessIAs y las actas entregadas. Para caminar entre las mesas.

import { useResultados } from "@/components/clase/vivo";
import { TAL_SLIDES, TAL_SLUG } from "@/lib/taller-clase";
import { TAL_ETAPAS } from "@/lib/taller-guiado";

/** Etapa abierta hasta esta placa: la más alta de las placas anteriores. */
function etapaHasta(idx: number): number {
  let e = 0;
  for (const s of TAL_SLIDES.slice(0, idx + 1)) if (s.etapa !== undefined && s.etapa > e) e = s.etapa;
  return e;
}

export function TableroControl({ idx }: { idx: number }) {
  const etapa = TAL_ETAPAS[etapaHasta(idx)] ?? TAL_ETAPAS[0];
  const { data: pasos } = useResultados(TAL_SLUG, "tal_paso", 5000);
  const { data: messias } = useResultados(TAL_SLUG, "tal_messias", 8000);
  const { data: actas } = useResultados(TAL_SLUG, "tal_acta", 10000);
  const counts = (pasos?.summary?.counts as Record<string, number>) ?? {};
  const total = pasos?.participants ?? 0;
  const preguntas = ((messias?.summary?.preguntas as string[]) ?? []).slice(0, 3);
  const nActas = (actas?.summary?.total as number) ?? 0;

  return (
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
          const pct = total ? Math.min(100, Math.round((c / total) * 100)) : 0;
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
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {preguntas.length > 0 && (
        <div className="border-t border-line/60 pt-2.5">
          <p className="text-[11px] font-bold uppercase tracking-widest text-violet">🗨️ Le preguntan a MessIAs</p>
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
  );
}
