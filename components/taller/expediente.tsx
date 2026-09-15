"use client";

// La ficha visual del expediente en la app del participante: las partes, lo
// que está en juego, la línea de tiempo del caso y todos los documentos como
// fichas (los liberados con su PDF; los que faltan, con candado).

import { esDoc, TAL_DOCS, urlPdf, type ConfigTaller, type DocTaller } from "@/lib/taller-caso";
import { AUDIOS_URL, TAL_AUDIOS } from "@/lib/taller-guiado";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const FECHAS: { fecha: string; que: string }[] = [
  { fecha: "25/08", que: "Presupuesto (CN-05)" },
  { fecha: "01/09", que: "Contrato (CN-03)" },
  { fecha: "08/09", que: "Entrega y pago de USD 2.000 (CN-06/07)" },
  { fecha: "09/09", que: "Reclamo y pedido de mediación (CN-08/11)" },
  { fecha: "10/09", que: "Informe técnico (CN-10)" },
  { fecha: "11/09 · 18:00", que: "⚠️ Abre Café Nube" },
];

/** Orden de exhibición: los CN por número, con los audios al principio. */
const ORDEN_DOCS = ["D0", "D1", "D2", "D3", "D4", "D11", "D12", "D13", "D5", "D6", "D7", "D8", "D9", "D10"] as const;

export function ExpedienteVisual({ session }: { session: SessionRow }) {
  const cfg = (session.activity_config ?? {}) as ConfigTaller;
  const liberados = new Set((cfg.liberados ?? []).filter(esDoc));
  const etapa = cfg.etapa ?? 0;
  const nLiberados = liberados.size + (etapa >= 1 ? 2 : 0);

  return (
    <section id="expediente" className="scroll-mt-24 overflow-hidden rounded-3xl border border-line bg-panel/30">
      {/* Carátula */}
      <div className="border-b border-line/60 bg-gradient-to-r from-teal/10 via-transparent to-violet/10 px-5 py-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="font-mono text-xs uppercase tracking-widest text-teal">📁 Expediente del caso</p>
          <p className="ml-auto rounded-full border border-line bg-ink-2/70 px-2.5 py-1 font-mono text-[11px] text-muted">
            {nLiberados} de {ORDEN_DOCS.length + 2} piezas
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-ink-2/60 px-3.5 py-2">
            <span className="text-2xl">☕</span>
            <div>
              <p className="text-sm font-bold leading-tight">Lucía Herrera</p>
              <p className="text-[11px] text-faint">Café Nube · solicitante</p>
            </div>
          </div>
          <span className="font-mono text-sm text-faint">c/</span>
          <div className="flex items-center gap-2 rounded-2xl border border-line bg-ink-2/60 px-3.5 py-2">
            <span className="text-2xl">🔧</span>
            <div>
              <p className="text-sm font-bold leading-tight">Diego Molina</p>
              <p className="text-[11px] text-faint">TecnoFrío Servicios</p>
            </div>
          </div>
          <div className="ml-auto grid grid-cols-3 gap-2 text-center">
            {[
              ["USD 3.000", "el contrato"],
              ["USD 2.000", "ya pagados"],
              ["USD 1.000", "en discusión"],
            ].map(([n, t]) => (
              <div key={t} className="rounded-xl border border-line bg-ink-2/60 px-2.5 py-1.5">
                <p className="font-mono text-sm font-bold text-teal">{n}</p>
                <p className="text-[10px] text-faint">{t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Línea de tiempo */}
      <div className="overflow-x-auto border-b border-line/60 px-5 py-3">
        <div className="flex min-w-max items-start">
          {FECHAS.map((f, i) => (
            <div key={f.fecha} className="flex items-start">
              <div className="w-32">
                <div className="flex items-center">
                  <span className={cn("size-2.5 shrink-0 rounded-full", i === FECHAS.length - 1 ? "animate-pulse bg-amber-300" : "bg-teal")} />
                  {i < FECHAS.length - 1 && <span className="h-px flex-1 bg-line" />}
                </div>
                <p className="mt-1.5 font-mono text-[11px] font-bold text-foreground">{f.fecha}</p>
                <p className="pr-3 text-[11px] leading-snug text-muted">{f.que}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Piezas del expediente */}
      <div className="grid gap-2 p-4 sm:grid-cols-2">
        {(["EA1", "EA2"] as const).map((id) => {
          const a = TAL_AUDIOS[id];
          const abierto = etapa >= 1;
          return (
            <Pieza
              key={id}
              codigo={a.codigo}
              titulo={a.titulo}
              sub={`Audio · ${a.dur}`}
              emoji="🎙️"
              abierta={abierto}
              href={abierto ? `${AUDIOS_URL}/${a.archivo}` : undefined}
            />
          );
        })}
        {ORDEN_DOCS.map((id) => {
          const d: DocTaller = TAL_DOCS[id];
          const abierta = liberados.has(id);
          return (
            <Pieza
              key={id}
              codigo={d.codigo}
              titulo={d.titulo}
              sub={d.origen}
              emoji={d.tipo === "chat" ? "💬" : "📄"}
              abierta={abierta}
              href={abierta ? urlPdf(d.archivo) : undefined}
            />
          );
        })}
      </div>
    </section>
  );
}

function Pieza({
  codigo,
  titulo,
  sub,
  emoji,
  abierta,
  href,
}: {
  codigo: string;
  titulo: string;
  sub: string;
  emoji: string;
  abierta: boolean;
  href?: string;
}) {
  const cuerpo = (
    <>
      <span className={cn("text-xl", !abierta && "opacity-40 grayscale")}>{abierta ? emoji : "🔒"}</span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-semibold leading-tight", !abierta && "text-faint")}>
          <span className={cn("mr-1.5 font-mono", abierta ? "text-teal" : "text-faint")}>{codigo}</span>
          {abierta ? titulo : "Todavía no incorporado"}
        </span>
        <span className="block truncate text-[11px] text-faint">{abierta ? sub : "aparece cuando avance el caso"}</span>
      </span>
      {abierta && href && <span className="shrink-0 rounded-lg border border-teal/50 bg-teal/10 px-2 py-1 text-[11px] font-semibold text-teal">⬇️</span>}
    </>
  );
  const clases = cn(
    "flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 transition",
    abierta ? "border-line bg-ink-2/60 hover:border-teal/50" : "border-dashed border-line/60 bg-transparent",
  );
  return href ? (
    <a href={href} download target="_blank" rel="noreferrer" className={clases}>
      {cuerpo}
    </a>
  ) : (
    <div className={clases}>{cuerpo}</div>
  );
}

/** Versión de bolsillo para la columna lateral: partes, montos y piezas incorporadas. */
export function ExpedienteMini({ session }: { session: SessionRow }) {
  const cfg = (session.activity_config ?? {}) as ConfigTaller;
  const liberados = new Set((cfg.liberados ?? []).filter(esDoc));
  const etapa = cfg.etapa ?? 0;
  const piezas = [
    ...(["EA1", "EA2"] as const).map((id) => ({ codigo: TAL_AUDIOS[id].codigo, abierta: etapa >= 1 })),
    ...ORDEN_DOCS.map((id) => ({ codigo: TAL_DOCS[id].codigo, abierta: liberados.has(id) })),
  ];
  const n = piezas.filter((p) => p.abierta).length;
  return (
    <a
      href="#expediente"
      className="block rounded-2xl border border-line bg-panel/40 p-3.5 transition hover:border-teal/50"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-teal">📁 Expediente</p>
        <p className="font-mono text-[11px] text-faint">
          {n}/{piezas.length}
        </p>
      </div>
      <p className="mt-1.5 text-sm font-semibold leading-snug">☕ Lucía c/ 🔧 Diego</p>
      <p className="font-mono text-[11px] text-muted">USD 3.000 · 2.000 pagos · 1.000 en juego</p>
      <div className="mt-2.5 grid grid-cols-4 gap-1">
        {piezas.map((p) => (
          <span
            key={p.codigo}
            className={cn(
              "rounded-md py-0.5 text-center font-mono text-[9.5px]",
              p.abierta ? "bg-teal/15 text-teal" : "border border-dashed border-line/60 text-faint/60",
            )}
          >
            {p.codigo}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-faint">Ver el expediente completo ↓</p>
    </a>
  );
}
