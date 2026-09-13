"use client";

// Demostración del expediente sintético de la masterclass "Justicia
// aumentada" (placas 6.2 a 6.5 del guion). Prototipo guiado: el caso y el
// análisis están preparados de antemano; lo que se muestra en vivo es el
// método — cada afirmación enlazada a su fuente, la información nueva que
// obliga a revisar y la decisión humana que da forma al resultado.

import { useEffect, useRef } from "react";
import {
  AFIRMACIONES,
  CASO,
  COINCIDEN,
  CRONOLOGIA,
  DIFERENCIAS,
  DOCUMENTOS,
  FALTANTES,
  getDoc,
  MEDIACION,
  OBSERVACIONES,
  POSICIONES,
  SINTESIS_FIJA_FIN,
  SINTESIS_FIJA_INICIO,
  type Decision,
  type EstadoAfirmacion,
  type Fuente,
} from "@/lib/justicia-caso";
import type { ModoDemo } from "@/lib/justicia-clase";
import { cn } from "@/lib/utils";

export type Vista = "hechos" | "posiciones" | "diferencias";

export interface DemoEstado {
  vista?: Vista;
  incorporado: boolean;
  sel?: Fuente;
  decisiones: Record<string, Decision>;
  registro: { obs: string; decision: Decision; hora: string }[];
  salida: "judicial" | "mediacion";
}

export const DEMO_INICIAL: DemoEstado = {
  incorporado: false,
  decisiones: {},
  registro: [],
  salida: "judicial",
};

type SetEstado = (fn: (e: DemoEstado) => DemoEstado) => void;

export function DemoExpediente({
  modo,
  estado,
  setEstado,
  ganador,
}: {
  modo: ModoDemo;
  estado: DemoEstado;
  setEstado: SetEstado;
  ganador?: string;
}) {
  const ver = (f: Fuente) => setEstado((e) => ({ ...e, sel: f }));

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_1fr]">
      <div className="glass flex max-h-[58vh] flex-col overflow-auto rounded-2xl p-5">
        {modo === "documentos" && <VistaDocumentos estado={estado} ver={ver} />}
        {modo === "recorrido" && <VistaRecorrido estado={estado} setEstado={setEstado} ver={ver} ganador={ganador} />}
        {modo === "fuentes" && <VistaFuentes estado={estado} ver={ver} />}
        {modo === "nuevo" && <VistaNuevo estado={estado} setEstado={setEstado} ver={ver} />}
        {modo === "revision" && <VistaRevision estado={estado} setEstado={setEstado} />}
      </div>
      <div className="glass flex max-h-[58vh] flex-col overflow-auto rounded-2xl p-5">
        {modo === "revision" ? (
          <Salida estado={estado} setEstado={setEstado} />
        ) : modo === "nuevo" ? (
          <Comparacion incorporado={estado.incorporado} />
        ) : (
          <Visor sel={estado.sel} placeholder={modo === "fuentes" ? "Elija una afirmación para abrir el documento que la sostiene." : undefined} />
        )}
      </div>
    </div>
  );
}

/** Etiqueta honesta que acompaña a toda la demo. */
export function EtiquetaDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-xs font-semibold text-yellow-400">
        Caso ficticio · material sintético
      </span>
      <span className="rounded-full border border-line bg-panel/60 px-3 py-1 text-xs text-muted">Prototipo de demostración</span>
    </div>
  );
}

// --- Piezas comunes ----------------------------------------------------------

function ChipFuente({ f, ver, activa }: { f: Fuente; ver: (f: Fuente) => void; activa?: boolean }) {
  return (
    <button
      onClick={(ev) => {
        ev.stopPropagation();
        ver(f);
      }}
      className={cn(
        "shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs transition",
        activa ? "border-teal bg-teal/20 text-teal" : "border-line bg-panel/60 text-muted hover:border-teal/60 hover:text-teal",
      )}
      title="Abrir la fuente"
    >
      {f.doc}
    </button>
  );
}

const ESTADO_ETIQUETA: Record<EstadoAfirmacion, { label: string; cls: string }> = {
  documentado: { label: "surge del documento", cls: "border-teal/50 bg-teal/10 text-teal" },
  "de-parte": { label: "afirmación de una parte", cls: "border-yellow-400/50 bg-yellow-400/10 text-yellow-400" },
  inferencia: { label: "inferencia — revisar", cls: "border-magenta/50 bg-magenta/10 text-magenta" },
};

function Titulo({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-bold uppercase tracking-wider text-teal">{children}</p>;
}

// --- Visor de documentos -----------------------------------------------------

function Visor({ sel, placeholder }: { sel?: Fuente; placeholder?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [sel]);

  if (!sel)
    return (
      <div className="flex h-full flex-col items-center justify-center py-10 text-center">
        <span className="text-4xl">📂</span>
        <p className="mt-3 max-w-xs text-sm text-faint">{placeholder ?? "Elija un documento para abrirlo."}</p>
      </div>
    );

  const doc = getDoc(sel.doc);
  return (
    <div className="rise" key={`${sel.doc}-${sel.frag}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-faint">{doc.id}</p>
          <p className="text-lg font-semibold">
            {doc.emoji} {doc.tipo}
          </p>
          <p className="text-sm text-muted">{doc.fecha}</p>
        </div>
        <span className="rounded-full border border-yellow-400/50 px-2 py-0.5 text-[10px] font-semibold uppercase text-yellow-400">ficticio</span>
      </div>
      <div className="space-y-2.5">
        {doc.fragmentos.map((fr) => {
          const on = fr.id === sel.frag;
          return (
            <div
              key={fr.id}
              ref={on ? ref : undefined}
              className={cn(
                "rounded-lg border p-3 text-sm leading-relaxed transition-all duration-500",
                on ? "border-teal bg-teal/15 text-foreground glow-teal" : "border-line/60 text-muted",
              )}
            >
              {fr.texto}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Comparacion({ incorporado }: { incorporado: boolean }) {
  const d5 = getDoc("D5");
  const d6 = getDoc("D6");
  return (
    <div>
      <Titulo>La captura del expediente</Titulo>
      <div className="rounded-xl border border-line bg-ink-2/60 p-4">
        <p className="font-mono text-xs text-faint">
          {d5.id} · {d5.fecha}
        </p>
        <p className="mt-2 inline-block rounded-2xl rounded-tl-sm bg-teal/15 px-4 py-2 text-lg">{d5.fragmentos[0].texto.replace("Encargado (Colegio): ", "")}</p>
      </div>
      {incorporado ? (
        <div className="rise mt-5">
          <Titulo>La conversación completa · {d6.id}</Titulo>
          <div className="space-y-2">
            {d6.fragmentos.map((m) => {
              const clave = m.id === "m2" || m.id === "m3";
              return (
                <p
                  key={m.id}
                  className={cn(
                    "rounded-lg border p-2.5 text-sm transition-all duration-500",
                    m.id === "m3" ? "border-yellow-400 bg-yellow-400/15 text-foreground" : clave ? "border-teal/60 bg-teal/10" : "border-line/60 text-muted",
                  )}
                >
                  {m.texto}
                </p>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-faint">Todavía no se incorporó la conversación completa.</p>
      )}
    </div>
  );
}

// --- Vista: los documentos del caso -------------------------------------------

function VistaDocumentos({ estado, ver }: { estado: DemoEstado; ver: (f: Fuente) => void }) {
  const docs = DOCUMENTOS.filter((d) => !d.nuevo || estado.incorporado);
  return (
    <div>
      <p className="font-mono text-xs text-faint">Expediente</p>
      <p className="text-lg font-semibold">{CASO.caratula}</p>
      <p className="mt-1 text-sm text-muted">{CASO.resumen}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-cyan/40 bg-cyan/5 p-3">
          <p className="text-sm font-semibold">🏭 {CASO.proveedor}</p>
          <p className="mt-1 text-sm text-muted">Reclama el saldo de US$ 3.000 de la instalación.</p>
        </div>
        <div className="rounded-xl border border-teal/40 bg-teal/5 p-3">
          <p className="text-sm font-semibold">🏫 {CASO.cliente}</p>
          <p className="mt-1 text-sm text-muted">Sostiene que la entrega fue incompleta y que un equipo no funciona.</p>
        </div>
      </div>
      <p className="mb-2 mt-5 text-xs font-bold uppercase tracking-wider text-teal">Documentos ({docs.length})</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {docs.map((d, i) => {
          const on = estado.sel?.doc === d.id;
          return (
            <button
              key={d.id}
              onClick={() => ver({ doc: d.id, frag: d.fragmentos[0].id })}
              className={cn(
                "rise flex items-center gap-3 rounded-xl border p-3 text-left transition",
                on ? "border-teal bg-teal/10 glow-teal" : "border-line bg-panel/40 hover:border-teal/50",
              )}
              style={{ animationDelay: `${0.08 * i}s` }}
            >
              <span className="text-2xl">{d.emoji}</span>
              <span>
                <span className="block font-mono text-xs text-faint">{d.id}</span>
                <span className="block text-sm font-medium leading-tight">{d.tipo}</span>
                <span className="block text-xs text-faint">{d.fecha}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Vista: el recorrido que eligió el público ---------------------------------

const VISTAS: { id: Vista; label: string; emoji: string }[] = [
  { id: "hechos", label: "Qué ocurrió", emoji: "🕐" },
  { id: "posiciones", label: "Qué reclama cada parte", emoji: "🧭" },
  { id: "diferencias", label: "Dónde difieren", emoji: "🔀" },
];

function VistaRecorrido({
  estado,
  setEstado,
  ver,
  ganador,
}: {
  estado: DemoEstado;
  setEstado: SetEstado;
  ver: (f: Fuente) => void;
  ganador?: string;
}) {
  const activa: Vista = estado.vista ?? ((VISTAS.find((v) => v.id === ganador)?.id) as Vista | undefined) ?? "hechos";
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {VISTAS.map((v) => (
          <button
            key={v.id}
            onClick={() => setEstado((e) => ({ ...e, vista: v.id }))}
            className={cn(
              "relative rounded-xl border px-3 py-2 text-sm font-medium transition",
              activa === v.id ? "border-teal bg-teal/15 text-teal" : "border-line bg-panel/40 text-muted hover:border-faint",
            )}
          >
            {v.emoji} {v.label}
            {ganador === v.id && (
              <span className="absolute -right-2 -top-2 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-bold uppercase text-ink">
                votada
              </span>
            )}
          </button>
        ))}
      </div>
      {activa === "hechos" && <Cronologia estado={estado} ver={ver} />}
      {activa === "posiciones" && <Posiciones estado={estado} ver={ver} />}
      {activa === "diferencias" && <Diferencias estado={estado} ver={ver} />}
    </div>
  );
}

function Cronologia({ estado, ver }: { estado: DemoEstado; ver: (f: Fuente) => void }) {
  const eventos = CRONOLOGIA.filter((e) => !e.soloTrasIncorporar || estado.incorporado);
  return (
    <div className="space-y-2">
      {eventos.map((e, i) => {
        const on = estado.sel?.doc === e.fuente.doc && estado.sel?.frag === e.fuente.frag;
        return (
          <div
            key={`${e.fecha}-${i}`}
            onClick={() => ver(e.fuente)}
            className={cn(
              "rise flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition",
              on ? "border-teal bg-teal/10" : "border-line/60 hover:border-teal/40",
              e.soloTrasIncorporar && "border-yellow-400/60",
            )}
            style={{ animationDelay: `${0.06 * i}s` }}
          >
            <span className="w-12 shrink-0 font-mono text-sm font-bold text-teal">{e.fecha}</span>
            <span className="flex-1 text-sm">{e.texto}</span>
            <span
              className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[10px]",
                e.tipo === "documentada" ? "border-teal/40 text-teal" : "border-yellow-400/50 text-yellow-400",
              )}
            >
              {e.tipo === "documentada" ? "documentada" : "mencionada"}
            </span>
            <ChipFuente f={e.fuente} ver={ver} activa={on} />
          </div>
        );
      })}
      <div className="flex items-center gap-3 rounded-xl border border-dashed border-magenta/50 p-2.5 text-sm text-magenta">
        <span className="w-12 shrink-0 font-mono font-bold">¿?</span>
        No consta el acta de conformidad (cláusula 4)
      </div>
    </div>
  );
}

function Posiciones({ estado, ver }: { estado: DemoEstado; ver: (f: Fuente) => void }) {
  return (
    <div className="space-y-3">
      {POSICIONES.map((p) => (
        <div key={p.parte} className="rounded-xl border border-line p-3">
          <p className="mb-2 text-sm font-semibold">
            {p.emoji} {p.parte}
          </p>
          <ul className="space-y-1.5">
            {p.posturas.map((po) => (
              <li key={po.texto} className="flex items-center gap-2 text-sm text-muted">
                <span className="flex-1">— {po.texto}</span>
                <ChipFuente f={po.fuente} ver={ver} activa={estado.sel?.frag === po.fuente.frag && estado.sel?.doc === po.fuente.doc} />
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="rounded-xl border border-teal/40 bg-teal/5 p-3">
        <p className="mb-2 text-sm font-semibold text-teal">En qué coinciden</p>
        <ul className="space-y-1.5">
          {COINCIDEN.map((c) => (
            <li key={c.texto} className="flex items-center gap-2 text-sm text-muted">
              <span className="flex-1">— {c.texto}</span>
              <ChipFuente f={c.fuente} ver={ver} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Diferencias({ estado, ver }: { estado: DemoEstado; ver: (f: Fuente) => void }) {
  const items = DIFERENCIAS.filter((d) => !d.soloTrasIncorporar || estado.incorporado);
  return (
    <div className="space-y-2">
      {items.map((d, i) => (
        <div
          key={d.texto}
          className={cn(
            "rise rounded-xl border p-3",
            d.falta ? "border-dashed border-magenta/50" : d.soloTrasIncorporar ? "border-yellow-400/60" : "border-line",
          )}
          style={{ animationDelay: `${0.06 * i}s` }}
        >
          <p className={cn("text-sm", d.falta && "text-magenta")}>
            {d.falta ? "Falta: " : ""}
            {d.texto}
          </p>
          <div className="mt-2 flex gap-1.5">
            {d.fuentes.map((f) => (
              <ChipFuente key={`${f.doc}${f.frag}`} f={f} ver={ver} activa={estado.sel?.doc === f.doc && estado.sel?.frag === f.frag} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- Vista: cada afirmación con su fuente ---------------------------------------

function VistaFuentes({ estado, ver }: { estado: DemoEstado; ver: (f: Fuente) => void }) {
  return (
    <div>
      <Titulo>Resumen generado · afirmaciones</Titulo>
      <div className="space-y-2">
        {AFIRMACIONES.map((a, i) => {
          const on = estado.sel?.doc === a.fuente.doc && estado.sel?.frag === a.fuente.frag;
          const enRevision = estado.incorporado && a.revision;
          const et = ESTADO_ETIQUETA[a.estado];
          return (
            <div
              key={a.id}
              onClick={() => ver(a.fuente)}
              className={cn(
                "rise cursor-pointer rounded-xl border p-3 transition",
                on ? "border-teal bg-teal/10 glow-teal" : "border-line/70 hover:border-teal/40",
              )}
              style={{ animationDelay: `${0.06 * i}s` }}
            >
              <div className="flex items-start gap-3">
                <p className={cn("flex-1 text-sm", enRevision && "line-through decoration-magenta/70")}>{a.texto}</p>
                <ChipFuente f={a.fuente} ver={ver} activa={on} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", et.cls)}>{et.label}</span>
                {enRevision && (
                  <span className="rounded-full border border-yellow-400/60 bg-yellow-400/10 px-2 py-0.5 text-[10px] text-yellow-400">
                    en revisión: {a.revision}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-xl border border-dashed border-magenta/50 p-3">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-magenta">Información que falta</p>
        <ul className="space-y-0.5 text-sm text-muted">
          {FALTANTES.map((f) => (
            <li key={f}>— {f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// --- Vista: aparece un mensaje más ---------------------------------------------

function VistaNuevo({ estado, setEstado, ver }: { estado: DemoEstado; setEstado: SetEstado; ver: (f: Fuente) => void }) {
  const a4 = AFIRMACIONES.find((a) => a.id === "a4")!;
  return (
    <div>
      <Titulo>Lo que concluía el resumen</Titulo>
      <div className={cn("rounded-xl border p-3 transition-all duration-500", estado.incorporado ? "border-yellow-400 bg-yellow-400/10" : "border-line")}>
        <p className={cn("text-base", estado.incorporado && "line-through decoration-magenta/70")}>{a4.texto}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px]", ESTADO_ETIQUETA.inferencia.cls)}>
            {ESTADO_ETIQUETA.inferencia.label}
          </span>
          <ChipFuente f={a4.fuente} ver={ver} />
        </div>
      </div>

      {!estado.incorporado ? (
        <button
          onClick={() => setEstado((e) => ({ ...e, incorporado: true, sel: { doc: "D6", frag: "m3" } }))}
          className="pulse-ring mt-5 w-full rounded-xl border-gradient px-5 py-4 text-left transition hover:brightness-110"
        >
          <span className="block text-xs uppercase tracking-widest text-faint">Nuevo documento</span>
          <span className="text-gradient block text-lg font-bold">💬 Incorporar la conversación completa (D6)</span>
        </button>
      ) : (
        <div className="rise mt-5 space-y-3">
          <Titulo>Qué cambió</Titulo>
          <p className="rounded-xl border border-yellow-400/60 bg-yellow-400/10 p-3 text-sm">
            <b className="text-yellow-400">En revisión:</b> {a4.revision}
          </p>
          <p className="rounded-xl border border-line p-3 text-sm text-muted">
            <b className="text-teal">Nuevo hecho documentado:</b> el 29/03 el Colegio informa dos unidades faltantes y un equipo que no enfría{" "}
            <ChipFuente f={{ doc: "D6", frag: "m4" }} ver={ver} />
          </p>
          <p className="rounded-xl border border-line p-3 text-sm text-muted">
            La cronología y las diferencias se actualizaron con el documento nuevo.
          </p>
          <p className="rounded-xl border border-dashed border-cyan/50 p-3 text-xs leading-relaxed text-muted">
            La comparación muestra el <b>contexto</b> del mensaje. No acredita por sí sola su autenticidad, su autoría ni su valor
            probatorio: esas cuestiones requieren la revisión correspondiente.
          </p>
          <button
            onClick={() => setEstado((e) => ({ ...e, incorporado: false, sel: undefined }))}
            className="text-xs text-faint underline-offset-2 hover:text-teal hover:underline"
          >
            deshacer (para ensayar)
          </button>
        </div>
      )}
    </div>
  );
}

// --- Vista: revisión humana y productos ------------------------------------------

const BOTONES: { d: Decision; label: string; on: string }[] = [
  { d: "acepta", label: "✓ Acepto", on: "border-teal bg-teal/20 text-teal" },
  { d: "corrige", label: "✎ Corrijo", on: "border-yellow-400 bg-yellow-400/20 text-yellow-400" },
  { d: "descarta", label: "✕ Descarto", on: "border-magenta bg-magenta/20 text-magenta" },
];

const VERBO: Record<Decision, string> = { acepta: "aceptó", corrige: "corrigió", descarta: "descartó" };

function VistaRevision({ estado, setEstado }: { estado: DemoEstado; setEstado: SetEstado }) {
  function decidir(obs: string, d: Decision) {
    const hora = new Date().toLocaleTimeString("es-SV", { hour: "2-digit", minute: "2-digit" });
    setEstado((e) => ({
      ...e,
      decisiones: { ...e.decisiones, [obs]: d },
      registro: [...e.registro, { obs, decision: d, hora }],
    }));
  }

  return (
    <div>
      <Titulo>Propuestas de la herramienta · decide el profesional</Titulo>
      <div className="space-y-2.5">
        {OBSERVACIONES.map((o, i) => (
          <div key={o.id} className="rounded-xl border border-line p-3">
            <p className="text-sm">
              <span className="mr-1.5 font-mono text-xs text-faint">O{i + 1}</span>
              {o.propuesta}
            </p>
            <div className="mt-2 flex gap-2">
              {BOTONES.map((b) => (
                <button
                  key={b.d}
                  onClick={() => decidir(o.id, b.d)}
                  className={cn(
                    "rounded-lg border px-2.5 py-1 text-xs font-semibold transition",
                    estado.decisiones[o.id] === b.d ? b.on : "border-line text-muted hover:border-faint",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {estado.registro.length > 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-line p-3">
          <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-faint">Registro de decisiones · trazabilidad</p>
          <ul className="space-y-0.5 font-mono text-xs text-muted">
            {estado.registro.map((r, i) => {
              const n = OBSERVACIONES.findIndex((o) => o.id === r.obs) + 1;
              return (
                <li key={i}>
                  {r.hora} · el profesional {VERBO[r.decision]} O{n}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function Salida({ estado, setEstado }: { estado: DemoEstado; setEstado: SetEstado }) {
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(
          [
            { id: "judicial", label: "⚖️ Síntesis de antecedentes" },
            { id: "mediacion", label: "🗣️ Preparación de mediación" },
          ] as const
        ).map((s) => (
          <button
            key={s.id}
            onClick={() => setEstado((e) => ({ ...e, salida: s.id }))}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm font-medium transition",
              estado.salida === s.id ? "border-teal bg-teal/15 text-teal" : "border-line text-muted hover:border-faint",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
      {estado.salida === "judicial" ? <SalidaJudicial estado={estado} /> : <SalidaMediacion estado={estado} />}
    </div>
  );
}

function LineaDecidida({ obsId, estado }: { obsId: string; estado: DemoEstado }) {
  const o = OBSERVACIONES.find((x) => x.id === obsId)!;
  const n = OBSERVACIONES.indexOf(o) + 1;
  const d = estado.decisiones[obsId];
  if (!d) return <li className="text-xs italic text-faint">O{n} · pendiente de revisión</li>;
  const linea = o.lineas[d];
  if (!linea) return null;
  const riesgo = d === "acepta" && o.riesgoSiAcepta;
  return (
    <li className={cn("rise text-sm", riesgo ? "text-magenta" : "text-foreground")}>
      {linea}
      {riesgo && <span className="mt-0.5 block text-xs">⚠ {o.riesgoSiAcepta}</span>}
    </li>
  );
}

function SalidaJudicial({ estado }: { estado: DemoEstado }) {
  return (
    <div>
      <p className="mb-2 text-xs text-faint">Borrador construido con las decisiones del profesional</p>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-muted marker:text-faint">
        {SINTESIS_FIJA_INICIO.map((l) => (
          <li key={l}>{l}</li>
        ))}
        <LineaDecidida obsId="o1" estado={estado} />
        {SINTESIS_FIJA_FIN.map((l) => (
          <li key={l}>{l}</li>
        ))}
        <LineaDecidida obsId="o2" estado={estado} />
        <LineaDecidida obsId="o3" estado={estado} />
        <LineaDecidida obsId="o4" estado={estado} />
      </ol>
      <p className="mt-4 rounded-lg border border-line p-2.5 text-xs text-faint">
        Síntesis de antecedentes para uso interno. No es una decisión: el razonamiento y la resolución corresponden al profesional.
      </p>
    </div>
  );
}

function SalidaMediacion({ estado }: { estado: DemoEstado }) {
  const d = estado.decisiones;
  const temas: { t: string; alerta?: string }[] = [];
  if (d.o2 === "corrige") temas.push({ t: "Estado de las unidades faltantes y del equipo del aula 3 (versión del Colegio, a verificar)" });
  if (d.o2 === "acepta") temas.push({ t: "Unidades faltantes y equipo sin funcionar", alerta: "presentado como hecho sin verificar" });
  if (d.o3 === "acepta" || d.o3 === "corrige") temas.push({ t: "Acta de conformidad pendiente: qué la haría posible" });
  if (d.o1 === "acepta") temas.push({ t: "Punto de partida: el Colegio recibió todo", alerta: "contradicho por la conversación completa" });
  if (d.o4 === "acepta") temas.push({ t: "Las partes coinciden en la deuda", alerta: "el correo no expresa ese acuerdo" });

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-teal">Posiciones expresadas</p>
        {MEDIACION.posiciones.map((p) => (
          <p key={p.parte} className="text-sm text-muted">
            <b className="text-foreground">{p.parte}:</b> {p.texto} <span className="font-mono text-xs text-faint">[{p.fuente}]</span>
          </p>
        ))}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-yellow-400">Intereses a explorar · hipótesis a confirmar con las partes</p>
        {MEDIACION.intereses.map((p) => (
          <p key={p.parte} className="text-sm text-muted">
            <b className="text-foreground">{p.parte}:</b> {p.texto}
          </p>
        ))}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-teal">Temas para la sesión</p>
        {temas.length === 0 ? (
          <p className="text-xs italic text-faint">Se completan con las decisiones de revisión.</p>
        ) : (
          <ul className="space-y-1">
            {temas.map((t) => (
              <li key={t.t} className={cn("rise text-sm", t.alerta ? "text-magenta" : "text-muted")}>
                — {t.t}
                {t.alerta && <span className="block pl-3 text-xs">⚠ {t.alerta}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wider text-teal">Preguntas para la sesión</p>
        <ul className="space-y-1">
          {MEDIACION.preguntas.map((q) => (
            <li key={q} className="text-sm text-muted">
              — {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

