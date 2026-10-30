"use client";

// App del participante de la tercera charla (celular vertical). Sigue la placa
// que se proyecta, muestra la actividad abierta (tocar y ENVIAR/VOTAR), el
// expediente D1–D5 a medida que se libera (lector con letra ampliable) y las
// devoluciones cuando el docente las muestra. Sin nombre. Quien quiera
// profundizar lee las piezas o consulta al asistente; quien no, toca y mira.

import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { FiltrosCollage, Sello } from "@/components/tribunal2/collage";
import { RespuestaIA } from "@/components/tribunal3/respuesta";
import type { PlacaVivo } from "@/lib/remoto";
import {
  armarPedidoCotio,
  avisoDoc,
  getTf3Actividad,
  marcaTf3,
  skillMd,
  TF3_A1_CIERRE,
  TF3_A1_DEVOLUCION,
  TF3_A2_ACLARACION,
  TF3_A2_QUE_FALTA,
  TF3_A3_CIERRE,
  TF3_A3_OPCIONES,
  TF3_A4_DEVOLUCION,
  TF3_A4_OPCIONES,
  TF3_ASISTENTE,
  TF3_COTIO,
  TF3_DEVOLUCION,
  TF3_DOCS,
  TF3_MATRIZ_A3,
  TF3_PEDIDO_DEMO,
  TF3_PROMPT_DEMO,
  TF3_SKILL,
  TF3_SLIDES,
  TF3_SLUG,
  TF3_TARJETAS,
  TF3_VARIABLES,
  TF3_VER_MATRIZ,
  TF3_VER_PROMPT,
  type Tf3ActKey,
  type Tf3DocId,
} from "@/lib/tribunal-clase3";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

class Blindaje extends Component<{ fallback?: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (this.props.fallback ?? null) : this.props.children;
  }
}

export function MarcaTf3() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="tf2-titular flex size-9 items-center justify-center rounded-[6px] bg-tf2-tinta text-[17px] text-tf2-papel">TF</span>
      <span className="leading-tight">
        <span className="block text-[12px] font-semibold text-tf2-tinta">Tribunal Fiscal · IA 2026</span>
        <span className="tf2-mono block text-[11px] text-tf2-gris">tercera charla</span>
      </span>
    </span>
  );
}

// --- Datos -----------------------------------------------------------------------------------

type Mias = Partial<Record<Tf3ActKey, Record<string, unknown>>>;

function useMias(slug: string) {
  const [mias, setMias] = useState<Mias>({});
  useEffect(() => {
    let activo = true;
    const cargar = () =>
      fetch(`/api/session/${slug}/my-responses`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { responses: { activity: string; payload: Record<string, unknown> }[] } | null) => {
          if (activo && d) setMias(Object.fromEntries(d.responses.map((x) => [x.activity, x.payload])) as Mias);
        })
        .catch(() => {});
    cargar();
    const id = setInterval(cargar, 15000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [slug]);
  return { mias, guardarLocal: (k: Tf3ActKey, p: Record<string, unknown>) => setMias((m) => ({ ...m, [k]: p })) };
}

async function responder(slug: string, activity: Tf3ActKey, payload: unknown) {
  const res = await fetch(`/api/session/${slug}/respond`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activity, item_key: "", payload }),
  }).catch(() => null);
  if (!res?.ok) {
    const d = res ? await res.json().catch(() => ({})) : {};
    throw new Error(d.error || "No se pudo enviar. Revisá la señal y probá de nuevo.");
  }
}

type Pieza = { id: Tf3DocId; titulo: string; paginas: { n: number; folio: string; texto: string }[]; nota: string; revelacion?: Revelacion };
type Revelacion = { texto: string; pregunta: string; ficha: { variable: string; evidencia: string; estado: string; fuente: string; efecto: string } };

function usePieza(id: Tf3DocId | null) {
  const [p, setP] = useState<{ id: Tf3DocId; data: Pieza | null; error?: string } | null>(null);
  useEffect(() => {
    if (!id) return;
    let vivo = true;
    fetch(`/api/tribunal/doc/${id}`, { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        if (vivo) setP(r.ok ? { id, data: d } : { id, data: null, error: d.error || "No se pudo abrir" });
      })
      .catch(() => vivo && setP({ id, data: null, error: "Sin conexión" }));
    return () => {
      vivo = false;
    };
  }, [id]);
  return p && p.id === id ? p : null;
}

// --- Piezas de interfaz ---------------------------------------------------------------------------

function Boton({ children, onClick, disabled, tono = "tinta", className }: { children: ReactNode; onClick?: () => void; disabled?: boolean; tono?: "tinta" | "linea" | "rojo"; className?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[56px] w-full items-center justify-center rounded-[12px] px-4 text-[17px] font-semibold transition active:scale-[0.99] disabled:opacity-40",
        tono === "tinta" && "bg-tf2-tinta text-white",
        tono === "rojo" && "bg-tf2-rojo text-white",
        tono === "linea" && "border border-tf2-linea bg-tf2-hoja text-tf2-tinta",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Rotulo({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("tf2-rotulo text-[11px] text-tf2-rojo", className)}>{children}</p>;
}

function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("tf2-objeto rounded-[8px] bg-tf2-hoja p-5", className)}>{children}</div>;
}

function Registrada({ onCambiar, doc, onDoc }: { onCambiar: () => void; doc?: Tf3DocId; onDoc: (id: Tf3DocId) => void }) {
  return (
    <div className="grid gap-3">
      <div className="rounded-[10px] border border-tf2-musgo/40 bg-tf2-salvia-claro p-4 text-center">
        <p className="text-[18px] font-semibold text-tf2-musgo">✓ Respuesta registrada</p>
        <p className="mt-1 text-[14px] text-tf2-grafito">Mirá la pantalla: ahí se ven los resultados de la sala.</p>
        <button onClick={onCambiar} className="mt-2 text-[13px] text-tf2-gris underline underline-offset-2">
          cambiar mi respuesta
        </button>
      </div>
      {doc && (
        <Boton tono="linea" onClick={() => onDoc(doc)}>
          📄 VER DOCUMENTO · {doc}
        </Boton>
      )}
    </div>
  );
}

function Devolucion({ children }: { children: ReactNode }) {
  return (
    <div className="tf2-sube rounded-[10px] border-l-4 border-tf2-azul bg-tf2-azul-claro/70 p-4 text-[15px] leading-snug">
      <Rotulo className="mb-2 text-tf2-azul">Devolución</Rotulo>
      {children}
    </div>
  );
}

// --- Seguimiento ------------------------------------------------------------------------------------

export function SeguimientoTf3({
  session,
  placa,
  participantes,
  avisos = [],
  slug = TF3_SLUG,
}: {
  session: SessionRow;
  placa: PlacaVivo | null;
  me?: ParticipantRow;
  participantes?: number;
  avisos?: string[];
  slug?: string;
}) {
  const { mias, guardarLocal } = useMias(slug);
  const [leyendo, setLeyendo] = useState<{ id: Tf3DocId; pagina?: number } | null>(null);
  const misma = !placa?.total || placa.total === TF3_SLIDES.length;
  const slide = placa && misma ? TF3_SLIDES[placa.idx] : undefined;
  const abiertas = misma ? (placa?.abiertas ?? []) : [];
  const actual = getTf3Actividad(session.current_activity);
  const liberadas = TF3_DOCS.filter((d) => avisos.includes(avisoDoc(d.id))).map((d) => d.id);
  const actPlaca = slide?.t === "placa" ? slide.actividad : undefined;
  const d5 = liberadas.includes("D5");
  const alFinal = slide?.t === "matriz" || slide?.t === "skill" || (slide?.t === "placa" && slide.num === "15");
  const cierre = slide?.t === "skill" || slide?.t === "matriz";
  const abrirDoc = (id: Tf3DocId) => setLeyendo({ id });

  return (
    <div className="tf2 -mx-4 -my-6 min-h-dvh px-4 pb-16 pt-0">
      <FiltrosCollage />
      <header className="sticky top-0 z-10 -mx-4 mb-5 flex items-center justify-between border-b border-tf2-linea/80 bg-tf2-papel/95 px-4 py-3 backdrop-blur">
        <MarcaTf3 />
        <span className="tf2-mono flex items-center gap-1.5 text-[12px] text-tf2-musgo">
          <span className="tf2-latido size-2 rounded-full bg-tf2-musgo" />
          {participantes ?? 0} conectados
        </span>
      </header>

      {actual && (
        <Blindaje fallback={<Tarjeta>No se pudo mostrar la actividad. Recargá la página.</Tarjeta>}>
          <div className="mb-6">
            <Actividad key={actual.key} act={actual.key} slug={slug} previa={mias[actual.key]} abiertas={abiertas} liberadas={liberadas} onGuardado={guardarLocal} onDoc={abrirDoc} />
          </div>
        </Blindaje>
      )}
      {!actual && actPlaca && actPlaca !== "tf3_a4" && (
        <Tarjeta className="mb-6">
          <p className="text-[16px]">La votación está cerrada. Mirá la pantalla.</p>
        </Tarjeta>
      )}

      {d5 && (slide?.t !== "placa" || Number(slide.num) >= 13) && (
        <Blindaje>
          <RevelacionD5 onDoc={abrirDoc} voto={String(mias.tf3_a4?.opcion ?? "")} />
        </Blindaje>
      )}

      {slide && slide.t !== "ingreso" && (
        <div className="tf2-sube mb-6">
          {slide.t === "placa" ? (
            <>
              <span className="tf2-mono text-[13px] text-tf2-gris">{marcaTf3(slide)}</span>
              <p className="tf2-titular mt-1.5 text-[30px] leading-[1.02]">{slide.titulo}</p>
              <p className="mt-2 text-[17px] leading-snug text-tf2-grafito">{slide.bajada}</p>
            </>
          ) : (
            <p className="tf2-titular text-[28px]">{slide.t === "skill" ? "La skill que se llevan" : "Matriz COTIO del expediente"}</p>
          )}
        </div>
      )}
      {!slide && (
        <Tarjeta className="mb-5">
          <p className="tf2-serif text-[20px]">Ya estás en la clase.</p>
          <p className="mt-1 text-[15px] text-tf2-grafito">Cuando empiece la presentación, acá vas a ver la placa que se proyecta.</p>
        </Tarjeta>
      )}

      {abiertas.includes(TF3_VER_PROMPT) && <PromptDemo />}
      {cierre && (
        <>
          <LlevateSkill />
          <PromptDemo />
        </>
      )}
      {alFinal && <MatrizCotio />}

      <Expediente liberadas={liberadas} onDoc={abrirDoc} />
      {liberadas.length > 0 && <Asistente liberadas={liberadas} abiertoInicial={slide?.t === "placa" && slide.num === "11"} />}

      <p className="tf2-mono mt-8 text-center text-[11.5px] leading-relaxed text-tf2-gris">
        Participación anónima. Expediente transcripto y anonimizado para uso docente. El asistente no decide ni redacta resoluciones.
      </p>

      {leyendo && <Lector id={leyendo.id} onCerrar={() => setLeyendo(null)} />}
    </div>
  );
}

// --- Actividades ------------------------------------------------------------------------------------------

type PropsAct = {
  slug: string;
  previa?: Record<string, unknown>;
  abiertas: string[];
  liberadas: Tf3DocId[];
  onGuardado: (k: Tf3ActKey, p: Record<string, unknown>) => void;
  onDoc: (id: Tf3DocId) => void;
};

function Actividad(p: PropsAct & { act: Tf3ActKey }) {
  const a = getTf3Actividad(p.act)!;
  return (
    <div className="tf2-sube tf2-objeto rounded-[8px] bg-tf2-hoja p-5">
      <div className="flex items-center justify-between">
        <Sello tam={13}>Actividad {a.numero}</Sello>
        <span className="tf2-mono text-[11px] text-tf2-gris">{a.nombre}</span>
      </div>
      <p className="tf2-titular mt-4 text-[24px] leading-[1.1]">{a.instruccion}</p>
      <div className="mt-5">
        {p.act === "tf3_a1" && <A1 {...p} />}
        {p.act === "tf3_a2" && <A2 {...p} />}
        {p.act === "tf3_a3" && <A3 {...p} />}
        {p.act === "tf3_a4" && <A4 {...p} />}
      </div>
    </div>
  );
}

function useEnvio(p: PropsAct, key: Tf3ActKey) {
  const [enviada, setEnviada] = useState(Boolean(p.previa));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function enviar(payload: Record<string, unknown>) {
    setBusy(true);
    setErr("");
    try {
      await responder(p.slug, key, payload);
      p.onGuardado(key, payload);
      setEnviada(true);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }
  return { enviada, setEnviada, busy, err, enviar };
}

function MsjError({ children }: { children: ReactNode }) {
  return <p className="rounded-[8px] bg-tf2-rojo-claro px-3 py-2 text-[14px] text-tf2-rojo">{children}</p>;
}

function A1(p: PropsAct) {
  const [sel, setSel] = useState<Record<string, string>>(() => (p.previa?.answers as Record<string, string>) ?? {});
  const e = useEnvio(p, "tf3_a1");
  const devolucion = p.abiertas.includes(TF3_DEVOLUCION);
  return (
    <div className="grid gap-4">
      {!e.enviada &&
        TF3_TARJETAS.map((t) => (
          <div key={t.id} className="rounded-[10px] border border-tf2-linea bg-white p-3">
            <p className="text-[16px] leading-snug">
              <b className="tf2-mono mr-1.5 text-tf2-rojo">{t.letra}</b>
              {t.texto}
            </p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              {(["contexto", "input"] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setSel((s) => ({ ...s, [t.id]: o }))}
                  className={cn("min-h-[48px] rounded-[10px] border text-[16px] font-semibold transition", sel[t.id] === o ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-tf2-crema")}
                >
                  {o === "contexto" ? "CONTEXTO" : "INPUT"}
                </button>
              ))}
            </div>
          </div>
        ))}
      {e.err && <MsjError>{e.err}</MsjError>}
      {e.enviada ? (
        <Registrada onCambiar={() => e.setEnviada(false)} onDoc={p.onDoc} />
      ) : (
        <Boton onClick={() => e.enviar({ answers: sel })} disabled={e.busy || !Object.keys(sel).length}>
          {e.busy ? "Enviando…" : "ENVIAR"}
        </Boton>
      )}
      {devolucion && (
        <Devolucion>
          {TF3_A1_DEVOLUCION.map((d) => (
            <p key={d} className="mb-1.5">
              ▸ {d}
            </p>
          ))}
          <p className="mt-2 italic">«{TF3_A1_CIERRE}»</p>
        </Devolucion>
      )}
    </div>
  );
}

function A2(p: PropsAct) {
  const [sel, setSel] = useState<string[]>(() => (p.previa?.selected as string[]) ?? []);
  const [verFalta, setVerFalta] = useState(false);
  const e = useEnvio(p, "tf3_a2");
  const devolucion = p.abiertas.includes(TF3_DEVOLUCION);
  const d1 = p.liberadas.includes("D1");
  return (
    <div className="grid gap-3">
      {d1 && !e.enviada && (
        <Boton tono="linea" onClick={() => p.onDoc("D1")}>
          📄 VER RESOLUCIÓN DGR (D1)
        </Boton>
      )}
      {!e.enviada &&
        TF3_VARIABLES.map((v) => {
          const on = sel.includes(v.id);
          return (
            <button
              key={v.id}
              onClick={() => setSel((s) => (on ? s.filter((x) => x !== v.id) : [...s, v.id]))}
              className={cn("flex min-h-[56px] items-center gap-3 rounded-[10px] border px-3 py-2 text-left text-[16px] leading-snug transition", on ? "border-tf2-tinta bg-tf2-crema" : "border-tf2-linea bg-white")}
            >
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-[6px] border-2 text-[16px]", on ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea")}>{on ? "✓" : ""}</span>
              <span>
                <b className="tf2-mono mr-1 text-tf2-rojo">{v.letra}</b> {v.label}
              </span>
            </button>
          );
        })}
      {e.err && <MsjError>{e.err}</MsjError>}
      {e.enviada ? (
        <Registrada onCambiar={() => e.setEnviada(false)} doc={d1 ? "D1" : undefined} onDoc={p.onDoc} />
      ) : (
        <Boton onClick={() => e.enviar({ selected: sel })} disabled={e.busy || !sel.length}>
          {e.busy ? "Enviando…" : "ENVIAR"}
        </Boton>
      )}
      <button onClick={() => setVerFalta((v) => !v)} className="justify-self-start text-[14px] text-tf2-azul underline underline-offset-2">
        ¿qué falta? (opcional)
      </button>
      {verFalta && <p className="rounded-[8px] bg-tf2-crema p-3 text-[14.5px] leading-snug">{TF3_A2_QUE_FALTA}</p>}
      {devolucion && (
        <Devolucion>
          {TF3_VARIABLES.map((v) => (
            <p key={v.id} className={cn("mb-2", !v.necesaria && "opacity-70")}>
              <b>
                {v.letra} · {v.necesaria ? "necesaria" : "accesoria"}:
              </b>{" "}
              {v.hoy}
            </p>
          ))}
          <p className="mt-2 italic">«{TF3_A2_ACLARACION}»</p>
        </Devolucion>
      )}
    </div>
  );
}

function A3(p: PropsAct) {
  const [sel, setSel] = useState(String(p.previa?.opcion ?? ""));
  const e = useEnvio(p, "tf3_a3");
  const devolucion = p.abiertas.includes(TF3_DEVOLUCION);
  const matriz = p.abiertas.includes(TF3_VER_MATRIZ);
  return (
    <div className="grid gap-3">
      {!e.enviada && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Boton tono="linea" onClick={() => p.onDoc("D2")} disabled={!p.liberadas.includes("D2")} className="min-h-[48px] text-[14px]">
              📄 D2 · Apelación
            </Boton>
            <Boton tono="linea" onClick={() => p.onDoc("D3")} disabled={!p.liberadas.includes("D3")} className="min-h-[48px] text-[14px]">
              📄 D3 · Contestación
            </Boton>
          </div>
          {TF3_A3_OPCIONES.map((o) => (
            <button
              key={o.id}
              onClick={() => setSel(o.id)}
              className={cn("min-h-[56px] rounded-[10px] border px-3 py-2 text-left text-[16px] leading-snug transition", sel === o.id ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-white")}
            >
              <b className="tf2-mono mr-1.5">{o.letra}</b> {o.label}
            </button>
          ))}
        </>
      )}
      {e.err && <MsjError>{e.err}</MsjError>}
      {e.enviada ? (
        <Registrada onCambiar={() => e.setEnviada(false)} doc={p.liberadas.includes("D2") ? "D2" : undefined} onDoc={p.onDoc} />
      ) : (
        <Boton onClick={() => e.enviar({ opcion: sel })} disabled={e.busy || !sel}>
          {e.busy ? "Enviando…" : "ENVIAR"}
        </Boton>
      )}
      {devolucion && (
        <Devolucion>
          {TF3_A3_OPCIONES.map((o) => (
            <p key={o.id} className="mb-1.5">
              <b>{o.letra}:</b> {o.veredicto}
            </p>
          ))}
          <p className="mt-2 italic">«{TF3_A3_CIERRE}»</p>
        </Devolucion>
      )}
      {matriz && (
        <div className="tf2-sube grid gap-3">
          <Rotulo>Matriz demostrativa</Rotulo>
          {TF3_MATRIZ_A3.map((f) => (
            <div key={f.fila} className="rounded-[10px] border border-tf2-linea bg-white p-4 text-[14.5px] leading-snug">
              <p className="tf2-titular text-[19px]">{f.fila}</p>
              <p className="mt-2">
                <b>Agravio:</b> {f.agravio}
              </p>
              <p className="mt-1">
                <b>DGR:</b> {f.dgr}
              </p>
              <p className="mt-1 text-tf2-azul">
                <b>Pregunta jurídica:</b> {f.pregunta}
              </p>
              <p className="tf2-mono mt-1 text-[12.5px] text-tf2-gris">Fuente: {f.fuente}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function A4(p: PropsAct) {
  const [sel, setSel] = useState(String(p.previa?.opcion ?? ""));
  const e = useEnvio(p, "tf3_a4");
  return (
    <div className="grid gap-3">
      {!e.enviada &&
        TF3_A4_OPCIONES.map((o) => (
          <button
            key={o.id}
            onClick={() => setSel(o.id)}
            className={cn("min-h-[56px] rounded-[10px] border px-3 py-2 text-left text-[16px] leading-snug transition", sel === o.id ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-white")}
          >
            <b className="tf2-mono mr-1.5">{o.letra}</b> {o.label}
          </button>
        ))}
      {e.err && <MsjError>{e.err}</MsjError>}
      {e.enviada ? (
        <Registrada onCambiar={() => e.setEnviada(false)} doc={p.liberadas.includes("D4") ? "D4" : undefined} onDoc={p.onDoc} />
      ) : (
        <Boton onClick={() => e.enviar({ opcion: sel })} disabled={e.busy || !sel}>
          {e.busy ? "Enviando…" : "VOTAR"}
        </Boton>
      )}
      <p className="text-[13px] text-tf2-gris">{TF3_A4_DEVOLUCION[0]}</p>
    </div>
  );
}

/** Lo que hizo el Tribunal (D5): llega del servidor recién cuando se libera. */
function RevelacionD5({ onDoc, voto }: { onDoc: (id: Tf3DocId) => void; voto: string }) {
  const p = usePieza("D5");
  const r = p?.data?.revelacion;
  if (!r) return null;
  const tuyo = TF3_A4_OPCIONES.find((o) => o.id === voto);
  return (
    <div className="tf2-sube mb-6 grid gap-3">
      <div className="tf2-objeto rounded-[8px] bg-tf2-tinta p-5 text-white">
        <p className="tf2-rotulo text-[11px] text-tf2-kraft">Actuación real · D5</p>
        <p className="tf2-titular mt-2 text-[22px] leading-snug">{r.texto}</p>
        {tuyo && <p className="mt-3 text-[14px] text-white/80">Tu voto: {tuyo.label}. No había una única respuesta.</p>}
      </div>
      <Tarjeta>
        <Rotulo>Ficha de control</Rotulo>
        <div className="mt-2 grid gap-2 text-[15px] leading-snug">
          <p>
            <b>Variable:</b> {r.ficha.variable}
          </p>
          <p>
            <b>Evidencia solicitada:</b> {r.ficha.evidencia}
          </p>
          <p>
            <b>Estado:</b> {r.ficha.estado} · <b>Fuente:</b> {r.ficha.fuente}
          </p>
          <p>
            <b>Efecto:</b> {r.ficha.efecto}
          </p>
        </div>
        <p className="mt-3 italic text-tf2-azul">«{r.pregunta}»</p>
      </Tarjeta>
      <Boton tono="linea" onClick={() => onDoc("D5")}>
        📄 VER DOCUMENTO · D5
      </Boton>
    </div>
  );
}

// --- Lo que se llevan: la skill y el prompt COTIO ------------------------------------------------------------

/** Copia al portapapeles; en http (sin contexto seguro) usa el método viejo con una selección. */
async function copiar(texto: string): Promise<boolean> {
  try {
    if (window.isSecureContext && navigator.clipboard) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, texto.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function BotonCopiar({ texto, children, className }: { texto: string; children: ReactNode; className?: string }) {
  const [estado, setEstado] = useState("");
  return (
    <div className={className}>
      <Boton tono="linea" onClick={async () => setEstado((await copiar(texto)) ? "✓ Copiado" : "No se pudo copiar: mantené apretado el texto y copialo a mano")}>
        {children}
      </Boton>
      {estado && <p className="mt-1.5 text-center text-[13px] text-tf2-musgo">{estado}</p>}
    </div>
  );
}

function LetraChica({ letra }: { letra: string }) {
  return (
    <span className={cn("tf2-titular flex size-[26px] shrink-0 items-center justify-center rounded-[4px] text-[15px] leading-none text-white", letra === "!" ? "bg-tf2-tinta" : "bg-tf2-rojo")}>
      {letra}
    </span>
  );
}

/** La skill del cierre, con la misma anatomía que la pantalla: carpeta → encabezado → cuerpo → lo que no va. */
function LlevateSkill() {
  const s = TF3_SKILL;
  const md = skillMd();
  return (
    <div className="tf2-objeto mb-6 grid gap-4 rounded-[10px] bg-tf2-hoja p-4">
      <div>
        <Rotulo>🎒 Lo que te llevás</Rotulo>
        <p className="tf2-titular mt-1 text-[24px] leading-tight">Una skill para recursos contra clausuras</p>
      </div>
      <div className="rounded-[8px] border border-tf2-linea bg-white/60 p-3">
        <p className="tf2-mono text-[12.5px] text-tf2-grafito">
          ① 📁 {s.carpeta}/ › <b>SKILL.md</b>
        </p>
        <div className="mt-2 rounded-[6px] border border-dashed border-tf2-azul/50 bg-tf2-azul-claro/60 p-2.5">
          <p className="tf2-rotulo text-[10px] text-tf2-azul">② encabezado · la IA lo ve siempre</p>
          <p className="tf2-mono mt-1 text-[12px] leading-snug">
            <b>name:</b> {s.nombre}
            <br />
            <b>description:</b> {s.descripcion}
          </p>
        </div>
        <p className="tf2-rotulo mt-3 text-[10px] text-tf2-rojo">③ cuerpo · se carga cuando el pedido coincide</p>
        <div className="mt-2 grid gap-2.5">
          {s.secciones.map((sec) => (
            <div key={sec.nombre} className="flex gap-2.5">
              <LetraChica letra={sec.letra} />
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold">
                  {sec.nombre}
                  {sec.aclaracion && <span className="font-normal text-tf2-gris"> · {sec.aclaracion}</span>}
                </p>
                <p className="text-[13px] leading-snug text-tf2-grafito">{sec.fichas.join(sec.tabla ? " | " : " · ")}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 rounded-[6px] bg-tf2-rojo-claro/60 px-2.5 py-2 text-[12.5px] leading-snug">④ Los datos del expediente no van en la skill: se adjuntan en cada pedido.</p>
      </div>
      <div className="grid grid-cols-2 items-start gap-2">
        <BotonCopiar texto={md}>📋 Copiar</BotonCopiar>
        <a
          href="/api/tribunal/skill"
          download="SKILL.md"
          className="flex min-h-[56px] w-full items-center justify-center rounded-[12px] bg-tf2-tinta px-4 text-[17px] font-semibold text-white active:scale-[0.99]"
        >
          ⬇ Descargar
        </a>
      </div>
      <details className="rounded-[8px] bg-tf2-crema p-3">
        <summary className="text-[14px] font-semibold">Cómo usarla en Claude, ChatGPT o Gemini</summary>
        <ul className="mt-2 grid gap-1.5 text-[13.5px] leading-snug">
          {s.uso.map((u) => (
            <li key={u}>• {u}</li>
          ))}
        </ul>
      </details>
      <details className="rounded-[8px] bg-tf2-crema p-3">
        <summary className="text-[14px] font-semibold">Ver el texto completo (SKILL.md)</summary>
        <pre className="tf2-mono mt-2 max-h-[60dvh] overflow-auto whitespace-pre-wrap text-[11.5px] leading-relaxed">{md}</pre>
      </details>
    </div>
  );
}

/** El prompt COTIO de la demo (placa 11), bloque por bloque, para copiar. */
function PromptDemo() {
  return (
    <Tarjeta className="mb-6">
      <Rotulo>🧩 El prompt COTIO de la demo</Rotulo>
      <div className="mt-3 grid gap-2.5">
        {TF3_PROMPT_DEMO.map((b, k) => (
          <div key={k} className="flex gap-2.5">
            <LetraChica letra={b.letra} />
            <p className="text-[13.5px] leading-snug">
              <b>{b.nombre}.</b> {b.texto}
            </p>
          </div>
        ))}
      </div>
      <BotonCopiar texto={TF3_PEDIDO_DEMO} className="mt-3">
        📋 Copiar el prompt
      </BotonCopiar>
    </Tarjeta>
  );
}

function MatrizCotio() {
  return (
    <Tarjeta className="mb-6">
      <Rotulo>Matriz COTIO del expediente · no es una sentencia</Rotulo>
      <div className="mt-3 grid gap-3">
        {TF3_COTIO.map((c, k) => (
          <div key={k} className="flex gap-3">
            <span className="tf2-titular w-7 shrink-0 text-[26px] leading-none text-tf2-rojo">{c.letra}</span>
            <p className="text-[15px] leading-snug">
              <b>{c.nombre}.</b> {c.caso}
            </p>
          </div>
        ))}
      </div>
      <p className="tf2-mono mt-4 text-[12.5px] text-tf2-gris">Próximas charlas: 4 · análisis contable y probatorio · 5 · redacción y revisión.</p>
    </Tarjeta>
  );
}

// --- Expediente --------------------------------------------------------------------------------------------

function Expediente({ liberadas, onDoc }: { liberadas: Tf3DocId[]; onDoc: (id: Tf3DocId) => void }) {
  return (
    <div className="mt-2">
      <Rotulo className="mb-3 text-tf2-gris">Expediente · {liberadas.length} de 5 piezas liberadas</Rotulo>
      <div className="grid gap-2">
        {TF3_DOCS.map((d) => {
          const ok = liberadas.includes(d.id);
          return (
            <button
              key={d.id}
              onClick={() => ok && onDoc(d.id)}
              disabled={!ok}
              className={cn("flex items-center gap-3 rounded-[10px] border p-3 text-left transition", ok ? "border-tf2-linea bg-tf2-hoja active:scale-[0.99]" : "border-dashed border-tf2-linea bg-transparent opacity-60")}
            >
              <span className={cn("tf2-titular flex size-11 shrink-0 items-center justify-center rounded-[6px] text-[18px]", ok ? "bg-tf2-azul text-white" : "bg-tf2-linea text-tf2-gris")}>{d.id}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15.5px] font-semibold leading-tight">
                  {d.titulo} <span className="font-normal text-tf2-gris">· {d.paginas} p.</span>
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-tf2-grafito">{ok ? d.funcion : "Se libera más adelante en la clase."}</span>
              </span>
              <span className="shrink-0 text-[18px]">{ok ? "›" : "🔒"}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Lector({ id, onCerrar }: { id: Tf3DocId; onCerrar: () => void }) {
  const p = usePieza(id);
  const [pag, setPag] = useState(0);
  const [tam, setTam] = useState(17);
  const hoja = useRef<HTMLDivElement>(null);
  // Al cambiar de página, se vuelve al principio.
  useEffect(() => {
    hoja.current?.scrollTo({ top: 0 });
  }, [pag]);
  const meta = TF3_DOCS.find((d) => d.id === id)!;
  const paginas = p?.data?.paginas ?? [];
  const actual = paginas[pag];
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  return (
    <div className="tf2 tf2-papel fixed inset-0 z-50 flex flex-col">
      <div className="flex items-center gap-2 border-b border-tf2-linea bg-tf2-papel px-3 py-2.5">
        <button onClick={onCerrar} className="rounded-[8px] border border-tf2-linea bg-tf2-hoja px-3 py-2 text-[15px] font-semibold">
          ← Volver
        </button>
        <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">
          {id} · {meta.titulo}
        </p>
        <button onClick={() => setTam((t) => Math.max(14, t - 2))} className="rounded-[8px] border border-tf2-linea bg-tf2-hoja px-2.5 py-2 text-[13px] font-bold" aria-label="Letra más chica">
          A−
        </button>
        <button onClick={() => setTam((t) => Math.min(26, t + 2))} className="rounded-[8px] border border-tf2-linea bg-tf2-hoja px-2.5 py-2 text-[16px] font-bold" aria-label="Letra más grande">
          A+
        </button>
      </div>
      {paginas.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto border-b border-tf2-linea px-3 py-2">
          {paginas.map((x, k) => (
            <button key={k} onClick={() => setPag(k)} className={cn("shrink-0 rounded-[8px] px-3 py-1.5 text-[14px]", k === pag ? "bg-tf2-tinta text-white" : "border border-tf2-linea bg-tf2-hoja")}>
              p.{x.n}
            </button>
          ))}
        </div>
      )}
      <div ref={hoja} className="flex-1 overflow-y-auto px-4 py-4">
        {!p && <p className="tf2-mono text-[14px] text-tf2-gris">Abriendo…</p>}
        {p?.error && <MsjError>{p.error}</MsjError>}
        {actual && (
          <div className="tf2-hoja-papel tf2-objeto rounded-[4px] p-5">
            <p className="tf2-mono mb-3 text-[12px] text-tf2-gris">
              {id} · página {actual.n} de {paginas.length}
              {actual.folio ? ` · ${actual.folio}` : ""}
            </p>
            <div className="whitespace-pre-line leading-[1.6] text-tf2-tinta" style={{ fontSize: tam }}>
              {actual.texto}
            </div>
          </div>
        )}
        {p?.data && <p className="tf2-mono mt-4 text-[11.5px] leading-snug text-tf2-gris">{p.data.nota}</p>}
      </div>
      {paginas.length > 1 && (
        <div className="grid grid-cols-2 gap-2 border-t border-tf2-linea p-3">
          <Boton tono="linea" onClick={() => setPag((x) => Math.max(0, x - 1))} disabled={pag === 0}>
            ← p.{paginas[Math.max(0, pag - 1)]?.n}
          </Boton>
          <Boton tono="linea" onClick={() => setPag((x) => Math.min(paginas.length - 1, x + 1))} disabled={pag >= paginas.length - 1}>
            p.{paginas[Math.min(paginas.length - 1, pag + 1)]?.n} →
          </Boton>
        </div>
      )}
    </div>
  );
}

// --- Asistente COTIO (uso de IA del participante) ------------------------------------------------------------
// Se arma el pedido tocando: la Tarea (operación), el Input (piezas ya liberadas) y el Output (formato).
// Contexto y Objetivo vienen fijos. Opcional: una pregunta escrita.

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className={cn("rounded-[10px] border px-3 py-2 text-left text-[14.5px] leading-snug transition", on ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-white")}>
      {children}
    </button>
  );
}

function Asistente({ liberadas, abiertoInicial }: { liberadas: Tf3DocId[]; abiertoInicial: boolean }) {
  // null: se abre solo en la placa de la Actividad 3; después manda lo que toque la persona.
  const [abiertoManual, setAbierto] = useState<boolean | null>(null);
  const abierto = abiertoManual ?? abiertoInicial;
  const [tarea, setTarea] = useState("");
  const [salida, setSalida] = useState("tabla");
  // Se guardan las piezas que la persona sacó: las que se liberan después entran solas al input.
  const [excluidas, setExcluidas] = useState<Tf3DocId[]>([]);
  const [libre, setLibre] = useState(false);
  const [q, setQ] = useState("");
  const [r, setR] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const disponibles = liberadas.filter((x) => !excluidas.includes(x));
  const pedido = armarPedidoCotio(tarea, salida, disponibles);

  async function enviar() {
    setBusy(true);
    setErr("");
    setR("");
    const body = libre ? { modo: "pregunta", pregunta: q } : { modo: "cotio", tarea, salida, piezas: disponibles };
    const res = await fetch("/api/tribunal/ia3", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const d = res ? await res.json().catch(() => ({})) : { error: "Sin conexión" };
    setBusy(false);
    if (d.texto) setR(d.texto);
    else setErr(d.error || "El asistente no respondió");
  }

  if (!abierto)
    return (
      <button onClick={() => setAbierto(true)} className="tf2-objeto mt-5 flex w-full items-center gap-3 rounded-[10px] bg-tf2-azul px-4 py-4 text-left text-white">
        <span className="text-[26px]">🤖</span>
        <span>
          <span className="block text-[16px] font-semibold">Asistente COTIO</span>
          <span className="block text-[13px] text-white/85">Armá un pedido a la IA sobre el expediente, sin escribir.</span>
        </span>
      </button>
    );

  return (
    <div className="tf2-objeto mt-5 grid gap-4 rounded-[10px] bg-tf2-hoja p-4">
      <div className="flex items-center justify-between">
        <Rotulo className="text-tf2-azul">🤖 Asistente COTIO · solo piezas liberadas</Rotulo>
        <button onClick={() => setAbierto(false)} className="text-[13px] text-tf2-gris">
          cerrar
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[13px] leading-snug">
        <p className="rounded-[8px] bg-tf2-crema p-2.5">
          <b className="tf2-mono text-tf2-rojo">C</b> Tribunal Fiscal · apelación de una clausura
        </p>
        <p className="rounded-[8px] bg-tf2-crema p-2.5">
          <b className="tf2-mono text-tf2-rojo">O</b> Análisis inicial organizado, no fallar
        </p>
      </div>
      {!libre && (
        <>
          <div className="grid gap-2">
            <p className="text-[14px] font-semibold">
              <b className="tf2-mono text-tf2-rojo">T</b> ¿Qué operación?
            </p>
            {TF3_ASISTENTE.tareas.map((t) => (
              <Chip key={t.id} on={tarea === t.id} onClick={() => setTarea(t.id)}>
                {t.label}
              </Chip>
            ))}
          </div>
          <div className="grid gap-2">
            <p className="text-[14px] font-semibold">
              <b className="tf2-mono text-tf2-rojo">I</b> ¿Con qué piezas?
            </p>
            <div className="flex flex-wrap gap-2">
              {TF3_DOCS.filter((d) => liberadas.includes(d.id)).map((d) => (
                <Chip key={d.id} on={disponibles.includes(d.id)} onClick={() => setExcluidas((p) => (p.includes(d.id) ? p.filter((x) => x !== d.id) : [...p, d.id]))}>
                  {d.id} · {d.titulo}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <p className="text-[14px] font-semibold">
              <b className="tf2-mono text-tf2-rojo">O</b> ¿Cómo lo querés?
            </p>
            <div className="flex flex-wrap gap-2">
              {TF3_ASISTENTE.salidas.map((o) => (
                <Chip key={o.id} on={salida === o.id} onClick={() => setSalida(o.id)}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </div>
          {pedido && (
            <details className="rounded-[8px] bg-tf2-pantalla p-3">
              <summary className="tf2-mono text-[12.5px] text-tf2-musgo">Así queda tu pedido (COTIO)</summary>
              <pre className="tf2-mono mt-2 whitespace-pre-wrap text-[12.5px] leading-relaxed text-tf2-musgo">{pedido}</pre>
              <BotonCopiar texto={pedido} className="mt-2">
                📋 Copiar mi pedido
              </BotonCopiar>
            </details>
          )}
        </>
      )}
      {libre && (
        <textarea
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 600))}
          rows={3}
          placeholder="ej.: ¿Qué dice la DGR sobre la prueba testimonial? Indicá documento y página."
          className="w-full resize-none rounded-[8px] border border-tf2-linea bg-white px-3 py-2.5 text-[16px] outline-none focus:border-tf2-tinta"
        />
      )}
      <Boton onClick={enviar} disabled={busy || (libre ? q.trim().length < 6 : !pedido)}>
        {busy ? "Leyendo las piezas…" : "Enviar al asistente"}
      </Boton>
      <button onClick={() => setLibre((v) => !v)} className="justify-self-start text-[13.5px] text-tf2-azul underline underline-offset-2">
        {libre ? "← volver a armar el pedido tocando" : "o escribí tu propia pregunta"}
      </button>
      {err && <MsjError>{err}</MsjError>}
      {r && (
        <div className="grid gap-2">
          <RespuestaIA texto={r} />
          <p className="rounded-[8px] bg-tf2-rojo-claro/60 px-3 py-2 text-[13px] leading-snug">Verificá cada página citada en el documento. El asistente no decide ni redacta resoluciones.</p>
        </div>
      )}
    </div>
  );
}

// --- Para el control: qué ve el celular en la placa actual -----------------------------------------------------

export function VistaParticipante3({ idx }: { idx: number }) {
  const s = TF3_SLIDES[idx];
  if (!s || s.t !== "placa") return null;
  return (
    <div className="rounded-[10px] bg-tf2-papel p-4 text-tf2-tinta">
      <p className="tf2-mono text-[12px] text-tf2-gris">{marcaTf3(s)}</p>
      <p className="tf2-titular mt-1 text-[22px] leading-tight">{s.titulo}</p>
      <p className="mt-1 text-[15px] text-tf2-grafito">{s.bajada}</p>
      {s.actividad && <p className="tf2-mono mt-2 text-[13px] text-tf2-rojo">📱 Actividad {getTf3Actividad(s.actividad)?.numero} abierta en los celulares</p>}
    </div>
  );
}
