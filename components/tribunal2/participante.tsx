"use client";

// App del participante de la segunda charla (celular vertical). Sigue la
// placa que se proyecta (título y bajada) y, cuando la presentación abre una
// actividad, la muestra con su consigna completa (la placa solo tiene el
// aviso). Sin nombre: se entra con un alias.
//
//   1 · nube: una o dos palabras
//   2 · laboratorio: pedido simple → pedido estructurado (chatbot real)
//   3 · dos salidas de la misma tarea: votar y ver qué cambió
//   4 · tres textos: ¿cuál escribió una persona?
//   5 · desafío final: siete campos → instrucción → prueba con datos
//       ficticios → verificación → ficha de trazabilidad (copiar / bajar .txt)
//
// "Mi recorrido" muestra el propio avance. Al final, la recapitulación y el
// producto individual, que se puede bajar en texto aunque se corte la red.

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { FiltrosCollage, Sello } from "@/components/tribunal2/collage";
import type { PlacaVivo } from "@/lib/remoto";
import {
  armarFicha,
  armarInstruccion,
  armarPedidoB,
  camposVacios,
  getTf2Actividad,
  productoFinal,
  textoPlano,
  TF2_A2_CAMBIOS,
  TF2_A2_CAMPOS,
  TF2_A2_EJEMPLO,
  TF2_A2_TAREAS,
  TF2_A3,
  TF2_A4,
  TF2_ACTIVIDADES,
  TF2_CAMPOS,
  TF2_CONTROLES,
  TF2_DIFERENCIAS_B,
  TF2_PERFIL_LAB,
  TF2_PERFILES,
  TF2_RECAP,
  TF2_REVELA_A3,
  TF2_REVELA_A4,
  TF2_SLIDES,
  TF2_SLUG,
  TF2_TOTAL_PLACAS,
  numPlaca,
  TF2_TEXTO_HUMANO_PENDIENTE,
  tf2Habilitada,
  type Tf2A2,
  type Tf2A5,
  type Tf2ActKey,
  type Tf2CampoA2Id,
  type Tf2EstadoControl,
  type Tf2Perfil,
} from "@/lib/tribunal-clase2";
import type { ParticipantRow, SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

type Mias = Partial<Record<Tf2ActKey, Record<string, unknown>>>;

/** Si una parte falla, el resto del celular sigue andando. */
class Blindaje extends Component<{ fallback?: ReactNode; children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (this.props.fallback ?? null) : this.props.children;
  }
}

/** Marca del ciclo en el encabezado del celular. */
export function MarcaTf2() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="tf2-titular flex size-9 items-center justify-center rounded-[6px] bg-tf2-tinta text-[17px] text-tf2-papel">TF</span>
      <span className="leading-tight">
        <span className="block text-[12px] font-semibold text-tf2-tinta">Tribunal Fiscal · IA 2026</span>
        <span className="tf2-mono block text-[11px] text-tf2-gris">segunda charla</span>
      </span>
    </span>
  );
}

// --- Datos propios y envío ----------------------------------------------------------------------

async function responder(slug: string, activity: Tf2ActKey, payload: unknown) {
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

/** Mis respuestas (para el recorrido y para retomar donde quedé). */
function useMias(slug: string) {
  const [mias, setMias] = useState<Mias>({});
  const [cargadas, setCargadas] = useState(false);
  useEffect(() => {
    let activo = true;
    const cargar = () =>
      fetch(`/api/session/${slug}/my-responses`, { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { responses: { activity: string; payload: Record<string, unknown> }[] } | null) => {
          if (!activo || !d) return;
          setMias(Object.fromEntries(d.responses.map((x) => [x.activity, x.payload])) as Mias);
          setCargadas(true);
        })
        .catch(() => {});
    cargar();
    const id = setInterval(cargar, 15000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, [slug]);
  const guardarLocal = useCallback((k: Tf2ActKey, p: Record<string, unknown>) => setMias((m) => ({ ...m, [k]: p })), []);
  return { mias, cargadas, guardarLocal };
}

async function preguntarIa(pedido: string, perfil: Tf2Perfil = TF2_PERFIL_LAB): Promise<{ texto?: string; error?: string; planB?: boolean }> {
  const res = await fetch("/api/tribunal/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ perfil, pedido }),
  }).catch(() => null);
  if (!res) return { error: "Sin conexión. Revisá la señal.", planB: true };
  const d = await res.json().catch(() => ({}));
  if (!res.ok) return { error: d.error || "El chatbot no respondió", planB: Boolean(d.planB) };
  return { texto: d.texto };
}

async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = texto;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

function bajarTexto(texto: string, nombre: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: "text/plain;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// --- Piezas de interfaz ---------------------------------------------------------------------------

function Boton({
  children,
  onClick,
  disabled,
  tono = "tinta",
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  tono?: "tinta" | "rojo" | "linea";
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex min-h-[52px] w-full items-center justify-center rounded-[10px] px-4 text-[16px] font-semibold transition active:scale-[0.99] disabled:opacity-45",
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

function BotonCopiar({ texto, etiqueta }: { texto: string; etiqueta: string }) {
  const [ok, setOk] = useState(false);
  return (
    <Boton
      tono="linea"
      onClick={async () => {
        if (await copiar(texto)) {
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        }
      }}
    >
      {ok ? "✓ Copiado" : etiqueta}
    </Boton>
  );
}

function Tarjeta({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("tf2-objeto rounded-[6px] bg-tf2-hoja p-5", className)}>{children}</div>;
}

function Rotulo({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("tf2-rotulo text-[11px] text-tf2-rojo", className)}>{children}</p>;
}

function Campo({
  valor,
  onCambio,
  placeholder,
  filas = 3,
  max = 600,
}: {
  valor: string;
  onCambio: (v: string) => void;
  placeholder?: string;
  filas?: number;
  max?: number;
}) {
  return (
    <textarea
      value={valor}
      onChange={(e) => onCambio(e.target.value.slice(0, max))}
      placeholder={placeholder}
      rows={filas}
      className="tf2-mono w-full resize-none rounded-[8px] border border-tf2-linea bg-white px-3.5 py-3 text-[15.5px] leading-relaxed text-tf2-tinta outline-none placeholder:text-tf2-gris/70 focus:border-tf2-tinta"
    />
  );
}

function Chip({ children, activo, onClick }: { children: ReactNode; activo?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-left text-[14px] transition active:scale-[0.98]",
        activo ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-tf2-crema text-tf2-grafito",
      )}
    >
      {children}
    </button>
  );
}

function Salida({ texto, de = "ia", className }: { texto: string; de?: "ia" | "persona"; className?: string }) {
  return (
    <div
      className={cn(
        "whitespace-pre-line rounded-[14px] px-4 py-3 text-[15.5px] leading-relaxed",
        de === "persona" ? "ml-8 rounded-br-[4px] bg-tf2-azul text-white" : "mr-4 rounded-bl-[4px] border border-tf2-linea bg-white text-tf2-tinta",
        className,
      )}
    >
      {de === "ia" ? textoPlano(texto) : texto}
    </div>
  );
}

function MsjError({ children }: { children: ReactNode }) {
  return <p className="rounded-[8px] bg-tf2-rojo-claro px-3 py-2 text-[14px] text-tf2-rojo">{children}</p>;
}

/** Aviso de datos: en estas prácticas, solo ficticios. */
function SoloFicticios() {
  return <p className="tf2-mono text-[12px] leading-snug text-tf2-gris">Solo datos ficticios o públicos: nada de expedientes reales, CUIT, DNI ni correos.</p>;
}

// --- Seguimiento ----------------------------------------------------------------------------------

export function SeguimientoTf2({
  session,
  placa,
  participantes,
  slug = TF2_SLUG,
}: {
  session: SessionRow;
  placa: PlacaVivo | null;
  me?: ParticipantRow;
  participantes?: number;
  slug?: string;
}) {
  const { mias, cargadas, guardarLocal } = useMias(slug);
  const abiertas = placa?.abiertas ?? [];
  // Si en el proyector quedó abierta otra versión de la presentación, su número de placa no sirve acá.
  const misma = !placa?.total || placa.total === TF2_SLIDES.length;
  const slide = placa && misma ? TF2_SLIDES[placa.idx] : undefined;
  const actual = getTf2Actividad(session.current_activity);
  const alFinal = slide?.t === "recapitulacion" || (slide?.t === "placa" && Number(slide.num) >= 30);
  const proyectaActividad = slide?.t === "placa" && slide.actividad === actual?.key;

  const panel = actual ? (
    <Blindaje fallback={<Tarjeta>No se pudo mostrar la actividad. Recargá la página.</Tarjeta>}>
      <Actividad key={actual.key} act={actual.key} slug={slug} mias={mias} cargadas={cargadas} abiertas={abiertas} onGuardado={guardarLocal} />
    </Blindaje>
  ) : null;

  return (
    <div className="tf2 -mx-4 -my-6 min-h-dvh px-4 pb-16 pt-0">
      <FiltrosCollage />
      <header className="sticky top-0 z-10 -mx-4 mb-5 flex items-center justify-between border-b border-tf2-linea/80 bg-tf2-papel/95 px-4 py-3 backdrop-blur">
        <MarcaTf2 />
        <span className="tf2-mono flex items-center gap-1.5 text-[12px] text-tf2-musgo">
          <span className="tf2-latido size-2 rounded-full bg-tf2-musgo" />
          {participantes ?? 0} conectados
        </span>
      </header>

      {alFinal && (
        <Blindaje>
          <Final slug={slug} mias={mias} onGuardado={guardarLocal} desafioAbierto={tf2Habilitada("tf2_a5", session.current_activity)} />
        </Blindaje>
      )}

      {/* La actividad abierta va siempre arriba y en el mismo lugar: cambiar de placa no la mueve
          ni la reinicia (antes saltaba de posición y el celular "subía" solo). */}
      {!alFinal && panel && (
        <div className="mb-6">
          <Rotulo className="mb-2 text-tf2-gris">{proyectaActividad ? "En pantalla ahora" : "Sigue abierta"}</Rotulo>
          {panel}
        </div>
      )}

      {slide && (
        <Blindaje>
          <PlacaActual slide={slide} />
        </Blindaje>
      )}
      {!slide && (
        <Tarjeta className="mb-5">
          <p className="tf2-serif text-[20px]">Ya estás en la clase.</p>
          <p className="mt-1 text-[15px] text-tf2-grafito">Cuando empiece la presentación, acá vas a ver la placa que se proyecta.</p>
        </Tarjeta>
      )}


      <Recorrido mias={mias} actual={actual?.key} />

      <p className="tf2-mono mt-8 text-center text-[11.5px] leading-relaxed text-tf2-gris">
        Participación anónima. En la pantalla solo se ven resultados agrupados o revisados. Ninguna salida está validada institucionalmente.
      </p>
    </div>
  );
}

function PlacaActual({ slide }: { slide: (typeof TF2_SLIDES)[number] }) {
  if (slide.t === "ingreso")
    return (
      <Tarjeta className="mb-5">
        <Rotulo>Bienvenida</Rotulo>
        <p className="tf2-titular mt-2 text-[28px]">Cómo formular instrucciones y verificar resultados</p>
        <p className="mt-2 text-[15px] text-tf2-grafito">Ya estás adentro. Dejá el celular a mano: las actividades aparecen solas.</p>
      </Tarjeta>
    );
  if (slide.t === "recapitulacion") return null;
  return (
    <div className="tf2-sube mb-5">
      <div className="flex items-center gap-3">
        <span className="tf2-mono text-[13px] text-tf2-gris">
          {numPlaca(slide)} / {TF2_TOTAL_PLACAS}
        </span>
        {slide.curva && <span className="tf2-rotulo text-[10px] text-tf2-rojo">↻ giro</span>}
      </div>
      <p className="tf2-titular mt-1.5 text-[30px] leading-[1.02]">{slide.titulo}</p>
      <p className="mt-2 text-[16.5px] leading-snug text-tf2-grafito">{slide.bajada}</p>
      {slide.curva && <p className="tf2-mono mt-3 border-l-2 border-tf2-rojo pl-3 text-[13.5px] uppercase leading-snug tracking-wide text-tf2-rojo">{slide.curva}</p>}
    </div>
  );
}

/** Mi recorrido: las cinco actividades, con lo que ya hice. */
function Recorrido({ mias, actual }: { mias: Mias; actual?: string }) {
  const hecho = (k: Tf2ActKey) => {
    const p = mias[k];
    if (!p) return false;
    if (k === "tf2_a2") return Boolean((p as unknown as Tf2A2).salidaB);
    if (k === "tf2_a5") return (p as unknown as Tf2A5).etapa === "ficha";
    return true;
  };
  return (
    <div className="mt-8">
      <Rotulo className="mb-3 text-tf2-gris">Mi recorrido</Rotulo>
      <div className="grid grid-cols-5 gap-2">
        {TF2_ACTIVIDADES.map((a) => {
          const ok = hecho(a.key);
          const empezada = Boolean(mias[a.key]);
          return (
            <div key={a.key} className={cn("flex flex-col items-center rounded-[8px] border px-1 py-2.5 text-center", a.key === actual ? "border-tf2-tinta bg-tf2-hoja" : "border-tf2-linea bg-tf2-crema/60")}>
              <span className={cn("tf2-titular text-[24px] leading-none", ok ? "text-tf2-musgo" : empezada ? "text-tf2-ocre" : "text-tf2-gris/60")}>{ok ? "✓" : a.numero}</span>
              <span className="mt-1 text-[10.5px] leading-tight text-tf2-grafito">{a.nombre}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Actividades ------------------------------------------------------------------------------------

function Actividad({
  act,
  slug,
  mias,
  cargadas,
  abiertas,
  onGuardado,
}: {
  act: Tf2ActKey;
  slug: string;
  mias: Mias;
  cargadas: boolean;
  abiertas: string[];
  onGuardado: (k: Tf2ActKey, p: Record<string, unknown>) => void;
}) {
  const a = getTf2Actividad(act)!;
  return (
    <div className="tf2-sube relative">
      <div className="tf2-objeto rounded-[6px] bg-tf2-hoja p-5">
        <div className="flex items-center justify-between">
          <Sello tam={13}>Actividad {a.numero}</Sello>
          <span className="tf2-mono text-[11px] text-tf2-gris">{a.nombre}</span>
        </div>
        <p className="tf2-titular mt-4 text-[25px] leading-[1.08]">{a.pregunta}</p>
        <div className="mt-5">
          {act === "tf2_a1" && <NubeA1 slug={slug} previa={mias.tf2_a1} onGuardado={onGuardado} />}
          {act === "tf2_a2" && (cargadas ? <LaboratorioA2 slug={slug} previa={mias.tf2_a2 as unknown as Tf2A2 | undefined} onGuardado={onGuardado} /> : <Cargando />)}
          {act === "tf2_a3" && <ComparaA3 slug={slug} previa={mias.tf2_a3} revelado={abiertas.includes(TF2_REVELA_A3)} onGuardado={onGuardado} />}
          {act === "tf2_a4" && <HumanoA4 slug={slug} previa={mias.tf2_a4} revelado={abiertas.includes(TF2_REVELA_A4)} onGuardado={onGuardado} />}
          {act === "tf2_a5" && (cargadas ? <DesafioA5 slug={slug} previa={mias.tf2_a5 as unknown as Tf2A5 | undefined} onGuardado={onGuardado} /> : <Cargando />)}
        </div>
      </div>
    </div>
  );
}

function Cargando() {
  return <p className="tf2-mono text-[14px] text-tf2-gris">Cargando…</p>;
}

type PropsAct = { slug: string; onGuardado: (k: Tf2ActKey, p: Record<string, unknown>) => void };

// 1 · Nube de palabras ---------------------------------------------------------------------------

function NubeA1({ slug, previa, onGuardado }: PropsAct & { previa?: Record<string, unknown> }) {
  const enviada = typeof previa?.palabra === "string" ? (previa.palabra as string) : "";
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState(!enviada);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const palabras = texto.trim().split(/\s+/).filter(Boolean);
  const valido = palabras.length >= 1 && palabras.length <= 2 && texto.trim().length <= 28;

  async function enviar() {
    setBusy(true);
    setErr("");
    try {
      const palabra = palabras.join(" ");
      await responder(slug, "tf2_a1", { palabra });
      onGuardado("tf2_a1", { palabra });
      setEditando(false);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  }

  if (!editando)
    return (
      <div className="rounded-[8px] border border-tf2-musgo/40 bg-tf2-salvia-claro p-4 text-center">
        <p className="text-[15px] text-tf2-musgo">✓ Enviaste</p>
        <p className="tf2-mono mt-1 text-[22px]">«{enviada}»</p>
        <p className="mt-2 text-[14px] text-tf2-grafito">Mirá la pantalla: el equipo revisa las palabras antes de mostrarlas.</p>
        <button
          onClick={() => {
            setTexto(enviada);
            setEditando(true);
          }}
          className="mt-2 text-[13px] text-tf2-gris underline underline-offset-2"
        >
          cambiarla
        </button>
      </div>
    );

  return (
    <div className="grid gap-3">
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value.slice(0, 32))}
        onKeyDown={(e) => e.key === "Enter" && valido && enviar()}
        placeholder="una o dos palabras"
        autoFocus
        className="tf2-mono w-full rounded-[8px] border border-tf2-linea bg-white px-4 py-3.5 text-[19px] outline-none focus:border-tf2-tinta"
      />
      <p className={cn("tf2-mono text-[12px]", palabras.length > 2 ? "text-tf2-rojo" : "text-tf2-gris")}>{palabras.length > 2 ? "Máximo dos palabras." : "Sin nombres de personas."}</p>
      {err && <MsjError>{err}</MsjError>}
      <Boton onClick={enviar} disabled={!valido || busy}>
        {busy ? "Enviando…" : "Enviar"}
      </Boton>
    </div>
  );
}

// 2 · Laboratorio de prompts ----------------------------------------------------------------------

function LaboratorioA2({ slug, previa, onGuardado }: PropsAct & { previa?: Tf2A2 }) {
  const [d, setD] = useState<Tf2A2>(() => previa ?? { tarea: "" });
  const [tareaId, setTareaId] = useState<string | null>(() => TF2_A2_TAREAS.find((t) => t.label === previa?.tarea)?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [planB, setPlanB] = useState(false);
  const [ver, setVer] = useState<"A" | "B">("B");
  const tarea = TF2_A2_TAREAS.find((t) => t.id === tareaId);
  const etapa = !d.salidaA ? 1 : !d.salidaB ? 2 : 3;

  const guardar = useCallback(
    async (nuevo: Tf2A2) => {
      setD(nuevo);
      onGuardado("tf2_a2", nuevo as unknown as Record<string, unknown>);
      try {
        await responder(slug, "tf2_a2", nuevo);
      } catch (e) {
        setErr((e as Error).message);
      }
    },
    [slug, onGuardado],
  );

  async function enviar(cual: "A" | "B") {
    // La tarea del pedido estructurado arranca siendo el pedido simple.
    const camposB = { ...(d.campos ?? {}), tarea: d.campos?.tarea ?? d.pedidoA ?? "" };
    const pedido = cual === "A" ? (d.pedidoA ?? "") : armarPedidoB(camposB);
    setBusy(true);
    setErr("");
    const r = await preguntarIa(pedido);
    setBusy(false);
    if (!r.texto) {
      setErr(r.error ?? "El chatbot no respondió");
      setPlanB(Boolean(r.planB));
      return;
    }
    await guardar(cual === "A" ? { ...d, pedidoA: pedido, salidaA: r.texto } : { ...d, campos: camposB, pedidoB: pedido, salidaB: r.texto });
  }

  /** Sin chatbot (red o crédito): seguimos con el ejemplo preparado. */
  function usarEjemplo() {
    const e = TF2_A2_EJEMPLO;
    setPlanB(false);
    setErr("");
    guardar({ ...d, tarea: e.tarea, pedidoA: e.pedidoA, salidaA: e.salidaA, pedidoB: e.pedidoB, salidaB: e.salidaB, ejemplo: true });
  }

  const campos = d.campos ?? {};
  const setCampo = (id: Tf2CampoA2Id, v: string) => setD((x) => ({ ...x, campos: { ...(x.campos ?? {}), [id]: v } }));
  const sumarChip = (id: Tf2CampoA2Id, chip: string) => {
    const actual = (campos[id] ?? "").trim();
    if (actual.includes(chip)) return;
    setCampo(id, actual ? `${actual}; ${chip}` : chip);
  };

  return (
    <div className="grid gap-5">
      <Pasos actual={etapa} etiquetas={["Pedido simple", "Pedido estructurado", "Comparar"]} />

      {etapa === 1 && (
        <>
          <div>
            <Rotulo className="mb-2 text-tf2-gris">Elegí una tarea ficticia (o escribí la tuya)</Rotulo>
            <div className="flex flex-wrap gap-2">
              {TF2_A2_TAREAS.map((t) => (
                <Chip
                  key={t.id}
                  activo={tareaId === t.id}
                  onClick={() => {
                    setTareaId(t.id);
                    setD((x) => ({ ...x, tarea: t.label, pedidoA: t.simple }));
                  }}
                >
                  {t.label}
                </Chip>
              ))}
            </div>
          </div>
          <div className="grid gap-2">
            <Rotulo className="text-tf2-gris">Tu primer pedido: abierto, sin indicaciones</Rotulo>
            <Campo valor={d.pedidoA ?? ""} onCambio={(v) => setD((x) => ({ ...x, pedidoA: v, tarea: x.tarea || "Tarea propia" }))} placeholder="Escribí un aviso sobre…" filas={3} />
            <SoloFicticios />
          </div>
          {err && <MsjError>{err}</MsjError>}
          {planB && (
            <Boton tono="linea" onClick={usarEjemplo}>
              Seguir con el ejemplo preparado
            </Boton>
          )}
          <Boton onClick={() => enviar("A")} disabled={busy || (d.pedidoA ?? "").trim().length < 8}>
            {busy ? "El chatbot está escribiendo…" : "Enviar al chatbot"}
          </Boton>
        </>
      )}

      {etapa === 2 && (
        <>
          <details className="rounded-[8px] border border-tf2-linea bg-tf2-crema/50 p-3">
            <summary className="text-[14px] font-semibold">Primera respuesta (pedido simple)</summary>
            <Salida texto={d.salidaA ?? ""} className="mt-3" />
          </details>
          <div>
            <p className="text-[15px] text-tf2-grafito">Ahora el mismo pedido, con sus partes. Tocá las sugerencias o escribí.</p>
          </div>
          {TF2_A2_CAMPOS.map((c) => {
            const chips = c.id === "fuentes" && tarea ? [`usá solo estos datos: ${tarea.datos}`, ...c.chips] : c.chips;
            const valor = campos[c.id] ?? (c.id === "tarea" ? (d.pedidoA ?? "") : "");
            return (
              <div key={c.id} className="grid gap-2">
                <div className="flex items-baseline justify-between">
                  <Rotulo>{c.etiqueta}</Rotulo>
                  <span className="text-[12px] text-tf2-gris">{c.ayuda}</span>
                </div>
                <Campo valor={valor} onCambio={(v) => setCampo(c.id, v)} filas={2} max={400} />
                {chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <Chip key={chip} activo={valor.includes(chip)} onClick={() => sumarChip(c.id, chip)}>
                        + {chip}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="rounded-[8px] bg-tf2-pantalla p-4">
            <Rotulo className="mb-2 text-tf2-musgo">Así queda tu pedido</Rotulo>
            <pre className="tf2-mono whitespace-pre-wrap text-[13.5px] leading-relaxed text-tf2-musgo">{armarPedidoB({ ...campos, tarea: campos.tarea ?? d.pedidoA }) || "…"}</pre>
          </div>
          {err && <MsjError>{err}</MsjError>}
          {planB && (
            <Boton tono="linea" onClick={usarEjemplo}>
              Seguir con el ejemplo preparado
            </Boton>
          )}
          <Boton onClick={() => enviar("B")} disabled={busy}>
            {busy ? "El chatbot está escribiendo…" : "Enviar el pedido estructurado"}
          </Boton>
        </>
      )}

      {etapa === 3 && (
        <>
          {d.ejemplo && <p className="tf2-mono text-[12px] text-tf2-azul">Ejemplo preparado antes de la clase (el chatbot no estaba disponible).</p>}
          <div className="grid grid-cols-2 gap-2">
            {(["A", "B"] as const).map((k) => (
              <button key={k} onClick={() => setVer(k)} className={cn("rounded-[8px] border py-2.5 text-[14px] font-semibold", ver === k ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-tf2-crema")}>
                {k === "A" ? "1 · Pedido simple" : "2 · Estructurado"}
              </button>
            ))}
          </div>
          <Salida texto={(ver === "A" ? d.pedidoA : d.pedidoB) ?? ""} de="persona" />
          <Salida texto={(ver === "A" ? d.salidaA : d.salidaB) ?? ""} />
          <div>
            <Rotulo className="mb-2">¿Qué cambió en la segunda? (podés marcar varias)</Rotulo>
            <div className="flex flex-wrap gap-2">
              {TF2_A2_CAMBIOS.map((c) => {
                const sel = d.selected ?? [];
                const activo = sel.includes(c.id);
                return (
                  <Chip
                    key={c.id}
                    activo={activo}
                    onClick={() => {
                      const otros = sel.filter((x) => x !== c.id && (c.id === "nada" ? false : x !== "nada"));
                      guardar({ ...d, selected: activo ? otros : [...otros, c.id] });
                    }}
                  >
                    {c.emoji} {c.label}
                  </Chip>
                );
              })}
            </div>
          </div>
          <p className="rounded-[8px] border-l-4 border-tf2-rojo bg-tf2-rojo-claro/50 px-3 py-2 text-[14px] leading-snug">
            Una instrucción puede mejorar la verificabilidad, pero no asegura la verdad: los datos de la respuesta igual se controlan.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <BotonCopiar texto={d.pedidoB ?? ""} etiqueta="Copiar el pedido" />
            <BotonCopiar texto={d.salidaB ?? ""} etiqueta="Copiar la respuesta" />
          </div>
          {err && <MsjError>{err}</MsjError>}
          <button onClick={() => guardar({ tarea: d.tarea, pedidoA: d.pedidoA, salidaA: d.salidaA, campos: d.campos })} className="text-[13px] text-tf2-gris underline underline-offset-2">
            volver a probar el pedido estructurado
          </button>
        </>
      )}
    </div>
  );
}

function Pasos({ actual, etiquetas }: { actual: number; etiquetas: string[] }) {
  return (
    <div className="flex gap-1.5">
      {etiquetas.map((e, k) => (
        <div key={e} className="flex-1">
          <span className={cn("block h-1.5 rounded-full", k + 1 < actual ? "bg-tf2-musgo" : k + 1 === actual ? "bg-tf2-rojo" : "bg-tf2-linea")} />
          <span className={cn("mt-1 block text-[11px]", k + 1 === actual ? "font-semibold text-tf2-tinta" : "text-tf2-gris")}>{e}</span>
        </div>
      ))}
    </div>
  );
}

// 3 · Contexto en comparación -------------------------------------------------------------------

function ComparaA3({ slug, previa, revelado, onGuardado }: PropsAct & { previa?: Record<string, unknown>; revelado: boolean }) {
  const preguntas = getTf2Actividad("tf2_a3")!.vivo!.preguntas!;
  const [answers, setAnswers] = useState<Record<string, string>>(() => (previa?.answers as Record<string, string>) ?? {});
  const [ver, setVer] = useState<"A" | "B">("A");
  const [err, setErr] = useState("");

  async function elegir(q: string, o: string) {
    const next = { ...answers, [q]: o };
    setAnswers(next);
    setErr("");
    try {
      await responder(slug, "tf2_a3", { answers: next });
      onGuardado("tf2_a3", { answers: next });
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  return (
    <div className="grid gap-4">
      <p className="text-[14.5px] text-tf2-grafito">
        <b>Misma tarea, mismo modelo.</b> {TF2_A3.tarea}
      </p>
      <div className="grid grid-cols-2 gap-2">
        {(["A", "B"] as const).map((k) => (
          <button key={k} onClick={() => setVer(k)} className={cn("rounded-[8px] border py-2.5 text-[15px] font-semibold", ver === k ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-tf2-crema")}>
            Salida {k}
          </button>
        ))}
      </div>
      <Salida texto={ver === "A" ? TF2_A3.A : TF2_A3.B} className="max-h-[22rem] overflow-auto" />
      {preguntas.map((q) => (
        <div key={q.id}>
          <Rotulo className="mb-2">{q.q}</Rotulo>
          <div className={cn("grid gap-2", q.opciones.length === 2 ? "grid-cols-2" : "")}>
            {q.opciones.map((o) => (
              <button
                key={o.id}
                onClick={() => elegir(q.id, o.id)}
                className={cn(
                  "flex min-h-[48px] items-center gap-2 rounded-[10px] border px-3 text-left text-[15px] transition active:scale-[0.99]",
                  answers[q.id] === o.id ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-white",
                )}
              >
                <span>{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      {err && <MsjError>{err}</MsjError>}
      {Object.keys(answers).length === preguntas.length && !revelado && <p className="text-center text-[14px] text-tf2-musgo">✓ Votaste. Mirá la pantalla.</p>}
      {revelado && <ProbaPerfiles />}
      {revelado && (
        <div className="tf2-sube rounded-[8px] border border-tf2-linea bg-tf2-crema p-4">
          <Rotulo>Qué cambió: el contexto del sistema (salida B)</Rotulo>
          <ul className="mt-2 grid gap-1 text-[14.5px]">
            {TF2_DIFERENCIAS_B.map((x) => (
              <li key={x}>▸ {x}</li>
            ))}
          </ul>
          <p className="mt-3 text-[13.5px] text-tf2-grafito">Mismo modelo, misma tarea, misma temperatura. Más contexto no garantiza exactitud: el contexto también se actualiza y se revisa.</p>
        </div>
      )}
    </div>
  );
}

/** Después de la revelación: la misma consulta propia (ficticia) a los dos perfiles, lado a lado. */
function ProbaPerfiles() {
  const [abierto, setAbierto] = useState(false);
  const [pedido, setPedido] = useState("");
  const [salidas, setSalidas] = useState<Partial<Record<Tf2Perfil, string>>>({});
  const [ver, setVer] = useState<Tf2Perfil>("A");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function probar() {
    setBusy(true);
    setErr("");
    const [a, b] = await Promise.all([preguntarIa(pedido, "A"), preguntarIa(pedido, "B")]);
    setBusy(false);
    if (!a.texto || !b.texto) {
      setErr(a.error ?? b.error ?? "El chatbot no respondió");
      return;
    }
    setSalidas({ A: a.texto, B: b.texto });
  }

  if (!abierto)
    return (
      <Boton tono="linea" onClick={() => setAbierto(true)}>
        Probá vos: tu consulta a los dos perfiles
      </Boton>
    );
  return (
    <div className="grid gap-3 rounded-[8px] border border-tf2-linea bg-white p-4">
      <Rotulo>Misma consulta, perfil A y perfil B</Rotulo>
      <Campo valor={pedido} onCambio={setPedido} placeholder="ej.: Redactá una respuesta a alguien que pregunta cómo presentar un escrito" filas={3} max={800} />
      <SoloFicticios />
      {err && <MsjError>{err}</MsjError>}
      <Boton onClick={probar} disabled={busy || pedido.trim().length < 8}>
        {busy ? "Preguntando a los dos perfiles…" : "Enviar a los dos"}
      </Boton>
      {salidas.A && salidas.B && (
        <>
          <div className="grid grid-cols-2 gap-2">
            {(["A", "B"] as const).map((k) => (
              <button key={k} onClick={() => setVer(k)} className={cn("rounded-[8px] border py-2.5 text-[14px] font-semibold", ver === k ? "border-tf2-tinta bg-tf2-tinta text-white" : "border-tf2-linea bg-tf2-crema")}>
                {TF2_PERFILES[k].nombre}
              </button>
            ))}
          </div>
          <Salida texto={salidas[ver] ?? ""} className="max-h-[22rem] overflow-auto" />
        </>
      )}
    </div>
  );
}

// 4 · Humano o IA -------------------------------------------------------------------------------------

function HumanoA4({ slug, previa, revelado, onGuardado }: PropsAct & { previa?: Record<string, unknown>; revelado: boolean }) {
  const [voto, setVoto] = useState<string>(() => String(previa?.opcion ?? ""));
  const [err, setErr] = useState("");
  async function votar(id: string) {
    setVoto(id);
    setErr("");
    try {
      await responder(slug, "tf2_a4", { opcion: id });
      onGuardado("tf2_a4", { opcion: id });
    } catch (e) {
      setErr((e as Error).message);
    }
  }
  return (
    <div className="grid gap-4">
      <p className="text-[14.5px] text-tf2-grafito">Leé los tres. Un solo voto: tocá el texto que creas que escribió una persona.</p>
      {TF2_A4.map((t) => (
        <button
          key={t.id}
          onClick={() => !revelado && votar(t.id)}
          className={cn("relative rounded-[8px] border p-4 text-left transition", voto === t.id ? "border-tf2-tinta bg-white ring-2 ring-tf2-tinta" : "border-tf2-linea bg-white")}
        >
          <span className="tf2-titular text-[26px]">{t.id.toUpperCase()}</span>
          {voto === t.id && <span className="tf2-mono absolute right-3 top-3 text-[12px] text-tf2-tinta">tu voto</span>}
          <p className="tf2-serif mt-1 text-[15.5px] leading-relaxed">{t.id === "b" && TF2_TEXTO_HUMANO_PENDIENTE ? "(texto en preparación)" : t.texto}</p>
          {revelado && (
            <div className="mt-3 border-t border-tf2-linea pt-3">
              <Sello tono={t.autoria === "humano" ? "musgo" : "rojo"} tam={13}>
                {t.autoria === "humano" ? "Persona" : "IA"}
              </Sello>
              <p className="mt-2 text-[13.5px] text-tf2-grafito">{t.rasgos}</p>
            </div>
          )}
        </button>
      ))}
      {err && <MsjError>{err}</MsjError>}
      {voto && !revelado && <p className="text-center text-[14px] text-tf2-musgo">✓ Votaste. Mirá la pantalla.</p>}
      {revelado && <p className="rounded-[8px] bg-tf2-rojo-claro/60 px-3 py-2 text-[14px]">No hay un detector fiable de autoría: la apariencia de naturalidad no prueba quién escribió ni si el texto es verdadero.</p>}
    </div>
  );
}

// 5 · Desafío final -------------------------------------------------------------------------------------

/** Pantallas del asistente: la tarea va con su propósito; después, la instrucción, la prueba y la ficha. */
const PANTALLAS_CAMPOS = TF2_CAMPOS.filter((c) => !c.junto);
const MATERIAL_EJEMPLO =
  "Listado ficticio de expedientes: Expte. 101/2026, recurso contra una multa, notificado el 2/10; Expte. 115/2026, ingresos brutos, falta el informe de Rentas; Expte. 120/2026, sellos, venció el traslado; Expte. 131/2026, pedido de copias del contribuyente; Expte. 140/2026, recurso presentado sin firma del apoderado.";

function DesafioA5({ slug, previa, onGuardado }: PropsAct & { previa?: Tf2A5 }) {
  const clave = `${slug}-a5`;
  const [d, setD] = useState<Tf2A5>(() => {
    if (previa?.campos) return previa;
    try {
      const l = localStorage.getItem(clave);
      if (l) return JSON.parse(l) as Tf2A5;
    } catch {}
    return { campos: {}, etapa: "campos" };
  });
  const [pantalla, setPantalla] = useState(() => (d.etapa === "ficha" ? 10 : d.etapa === "prueba" ? 9 : d.etapa === "instruccion" ? 7 : 0));
  const [material, setMaterial] = useState(d.prueba?.material ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [sinChatbot, setSinChatbot] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Se guarda solo (y en el celular, por si se corta la red).
  const cambiar = useCallback(
    (f: (x: Tf2A5) => Tf2A5) => {
      setD((x) => {
        const n = f(x);
        try {
          localStorage.setItem(clave, JSON.stringify(n));
        } catch {}
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => {
          responder(slug, "tf2_a5", n).then(
            () => onGuardado("tf2_a5", n as unknown as Record<string, unknown>),
            () => {},
          );
        }, 700);
        return n;
      });
    },
    [slug, clave, onGuardado],
  );

  const vacios = camposVacios(d.campos);
  const instruccion = d.instruccion ?? armarInstruccion(d.campos);
  const total = PANTALLAS_CAMPOS.length; // 7

  async function probar() {
    setBusy(true);
    setErr("");
    const pedido = `${instruccion}\n\nMaterial de prueba (ficticio):\n${material.trim() || "No hay material: armá un ejemplo breve con datos claramente ficticios, marcados como [FICTICIO]."}`;
    const r = await preguntarIa(pedido);
    setBusy(false);
    if (!r.texto) {
      setErr(r.error ?? "El chatbot no respondió");
      setSinChatbot(Boolean(r.planB));
      return;
    }
    setSinChatbot(false);
    cambiar((x) => ({
      ...x,
      instruccion,
      // Cada prueba con una instrucción distinta de la anterior es una versión nueva del prompt.
      version: x.prueba ? (x.prueba.instruccion !== instruccion ? (x.version ?? 1) + 1 : (x.version ?? 1)) : 1,
      prueba: { material, salida: r.texto!, t: Date.now(), perfil: TF2_PERFIL_LAB, instruccion },
      etapa: x.etapa === "ficha" ? "ficha" : "prueba",
    }));
    setPantalla(9);
  }

  const etapaVisible = pantalla < total ? 1 : pantalla === total ? 2 : pantalla === total + 1 ? 3 : pantalla === total + 2 ? 4 : 5;

  return (
    <div className="grid gap-5">
      <Pasos actual={etapaVisible} etiquetas={["Campos", "Instrucción", "Prueba", "Verificar", "Ficha"]} />

      {pantalla < total && (
        <PantallaCampo
          k={pantalla}
          total={total}
          valores={d.campos}
          onCambio={(id, v) => cambiar((x) => ({ ...x, campos: { ...x.campos, [id]: v }, instruccion: undefined }))}
          onAnt={() => setPantalla((p) => Math.max(0, p - 1))}
          onSig={() => {
            if (pantalla === total - 1) cambiar((x) => ({ ...x, etapa: x.etapa === "campos" ? "instruccion" : x.etapa }));
            setPantalla((p) => p + 1);
          }}
        />
      )}

      {pantalla === total && (
        <>
          <Rotulo>Tu instrucción reutilizable (podés editarla)</Rotulo>
          <Campo
            valor={instruccion}
            onCambio={(v) => cambiar((x) => ({ ...x, instruccion: v }))}
            filas={10}
            max={3000}
          />
          {vacios.length > 0 && (
            <p className="rounded-[8px] bg-tf2-ocre/15 px-3 py-2 text-[13.5px] leading-snug">
              Conviene completar: <b>{vacios.map((c) => c.etiqueta.toLowerCase()).join(", ")}</b>. Quedaron entre corchetes.
            </p>
          )}
          <div className="grid grid-cols-2 gap-2">
            <BotonCopiar texto={instruccion} etiqueta="Copiar instrucción" />
            <Boton tono="linea" onClick={() => setPantalla(0)}>
              Volver a los campos
            </Boton>
          </div>
          <Boton onClick={() => setPantalla(total + 1)}>Probar con datos ficticios →</Boton>
        </>
      )}

      {pantalla === total + 1 && (
        <>
          <Rotulo>Material de prueba (solo ficticio)</Rotulo>
          <Campo valor={material} onCambio={setMaterial} placeholder="Pegá o escribí un ejemplo inventado…" filas={5} max={1500} />
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => setMaterial(MATERIAL_EJEMPLO)}>+ usar un listado ficticio de expedientes</Chip>
            <Chip onClick={() => setMaterial("")}>sin material: que invente uno marcado</Chip>
          </div>
          <SoloFicticios />
          {err && <MsjError>{err}</MsjError>}
          <Boton onClick={probar} disabled={busy}>
            {busy ? "El chatbot está probando tu instrucción…" : "Probar la instrucción"}
          </Boton>
          {(d.prueba?.salida || sinChatbot) && (
            <Boton tono="linea" onClick={() => setPantalla(total + 2)}>
              {d.prueba?.salida ? "Ver la prueba anterior" : "Seguir sin la prueba (queda pendiente en la ficha)"}
            </Boton>
          )}
          <button onClick={() => setPantalla(total)} className="text-[13px] text-tf2-gris underline underline-offset-2">
            ← volver a la instrucción
          </button>
        </>
      )}

      {pantalla === total + 2 && (
        <>
          <Rotulo>Salida de prueba · sin verificar</Rotulo>
          <Salida texto={d.prueba?.salida ?? "(sin prueba todavía: probala cuando el chatbot esté disponible; mientras, la ficha la marca como pendiente)"} className="max-h-[22rem] overflow-auto" />
          <Rotulo className="mt-1">Verificá cada tipo de dato</Rotulo>
          <div className="grid gap-2">
            {TF2_CONTROLES.map((c) => {
              const v = d.controles?.[c] ?? "pendiente";
              return (
                <div key={c} className="flex items-center gap-2">
                  <span className="w-[86px] shrink-0 text-[14.5px] font-semibold">{c}</span>
                  {(["verificado", "pendiente", "no aplica"] as Tf2EstadoControl[]).map((e) => (
                    <button
                      key={e}
                      onClick={() => cambiar((x) => ({ ...x, controles: { ...x.controles, [c]: e } }))}
                      className={cn(
                        "flex-1 rounded-[8px] border py-2 text-[12.5px]",
                        v === e ? (e === "verificado" ? "border-tf2-musgo bg-tf2-musgo text-white" : e === "pendiente" ? "border-tf2-rojo bg-tf2-rojo text-white" : "border-tf2-gris bg-tf2-gris text-white") : "border-tf2-linea bg-white",
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
          <div className="grid gap-2">
            <Rotulo className="text-tf2-gris">Correcciones que hiciste</Rotulo>
            <Campo valor={d.correcciones ?? ""} onCambio={(v) => cambiar((x) => ({ ...x, correcciones: v }))} filas={2} max={400} placeholder="ej.: quité un dato que no estaba en el material" />
            <Rotulo className="text-tf2-gris">Responsable del control (tu función, no tu nombre)</Rotulo>
            <input
              value={d.responsable ?? ""}
              onChange={(e) => cambiar((x) => ({ ...x, responsable: e.target.value.slice(0, 80) }))}
              placeholder="ej.: mesa de entradas"
              className="tf2-mono w-full rounded-[8px] border border-tf2-linea bg-white px-3.5 py-3 text-[15.5px] outline-none focus:border-tf2-tinta"
            />
          </div>
          <Boton
            onClick={() => {
              cambiar((x) => ({ ...x, instruccion, etapa: "ficha" }));
              setPantalla(total + 3);
            }}
          >
            Armar la ficha de trazabilidad →
          </Boton>
          <button onClick={() => setPantalla(total + 1)} className="text-[13px] text-tf2-gris underline underline-offset-2">
            ← probar de nuevo
          </button>
        </>
      )}

      {pantalla >= total + 3 && <Producto d={{ ...d, instruccion }} onEditar={() => setPantalla(total)} />}
    </div>
  );
}

function PantallaCampo({
  k,
  total,
  valores,
  onCambio,
  onAnt,
  onSig,
}: {
  k: number;
  total: number;
  valores: Tf2A5["campos"];
  onCambio: (id: (typeof TF2_CAMPOS)[number]["id"], v: string) => void;
  onAnt: () => void;
  onSig: () => void;
}) {
  const campo = PANTALLAS_CAMPOS[k];
  const junto = TF2_CAMPOS.filter((c) => c.junto && TF2_CAMPOS.indexOf(c) === TF2_CAMPOS.indexOf(campo) + 1);
  return (
    <div className="grid gap-3">
      <p className="tf2-mono text-[12px] text-tf2-gris">
        Campo {k + 1} de {total}
      </p>
      {[campo, ...junto].map((c) => (
        <div key={c.id} className="grid gap-2">
          <p className="tf2-titular text-[22px]">{c.etiqueta}</p>
          <p className="text-[14px] text-tf2-grafito">{c.ayuda}</p>
          <Campo valor={valores[c.id] ?? ""} onCambio={(v) => onCambio(c.id, v)} filas={3} max={400} placeholder={`ej.: ${c.ejemplo}`} />
          {!(valores[c.id] ?? "").trim() && (
            <button onClick={() => onCambio(c.id, c.ejemplo)} className="justify-self-start text-[13px] text-tf2-azul underline underline-offset-2">
              usar el ejemplo
            </button>
          )}
        </div>
      ))}
      {k === 0 && <SoloFicticios />}
      <div className="grid grid-cols-[auto_1fr] gap-2">
        <Boton tono="linea" onClick={onAnt} disabled={k === 0} className="w-[90px]">
          ←
        </Boton>
        <Boton onClick={onSig}>{k === total - 1 ? "Generar la instrucción" : "Siguiente"}</Boton>
      </div>
      <p className="text-center text-[12px] text-tf2-gris">Podés dejar campos vacíos: la instrucción los marca para completar.</p>
    </div>
  );
}

/** El producto final: instrucción + ficha de trazabilidad, para copiar o bajar en texto. */
function Producto({ d, onEditar }: { d: Tf2A5; onEditar?: () => void }) {
  const perfil = TF2_PERFILES[TF2_PERFIL_LAB].nombre;
  const ficha = armarFicha(d, perfil);
  const todo = productoFinal(d, perfil);
  return (
    <div className="grid gap-4">
      <div className="rounded-[6px] bg-tf2-crema p-4">
        <Rotulo>Instrucción reutilizable</Rotulo>
        <p className="tf2-mono mt-2 whitespace-pre-line text-[13.5px] leading-relaxed">{d.instruccion?.trim() || armarInstruccion(d.campos)}</p>
      </div>
      <div className="rounded-[6px] border border-tf2-linea bg-white p-4">
        <pre className="tf2-mono whitespace-pre-wrap text-[12.5px] leading-relaxed">{ficha}</pre>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <BotonCopiar texto={d.instruccion?.trim() || armarInstruccion(d.campos)} etiqueta="Copiar instrucción" />
        <BotonCopiar texto={ficha} etiqueta="Copiar ficha" />
      </div>
      <Boton tono="rojo" onClick={() => bajarTexto(todo, "tribunal-clase2-mi-instruccion.txt")}>
        ↓ Bajar todo en texto (.txt)
      </Boton>
      {onEditar && (
        <button onClick={onEditar} className="text-[13px] text-tf2-gris underline underline-offset-2">
          editar la instrucción
        </button>
      )}
    </div>
  );
}

// --- Final: recapitulación y producto -------------------------------------------------------------

function Final({ slug, mias, onGuardado, desafioAbierto }: { slug: string; mias: Mias; onGuardado: PropsAct["onGuardado"]; desafioAbierto: boolean }) {
  const a5 = mias.tf2_a5 as unknown as Tf2A5 | undefined;
  const [armar, setArmar] = useState(false);
  return (
    <div className="tf2-sube mb-6 grid gap-4">
      <div className="tf2-objeto rounded-[6px] bg-tf2-tinta p-5 text-white">
        <p className="tf2-rotulo text-[11px] text-tf2-kraft">Tu producto de esta charla</p>
        <p className="tf2-titular mt-2 text-[27px] leading-tight">Una instrucción reutilizable con su verificación y su registro</p>
      </div>
      {a5?.campos && Object.keys(a5.campos).length ? (
        <Tarjeta>
          <Producto d={{ ...a5, instruccion: a5.instruccion ?? armarInstruccion(a5.campos) }} />
        </Tarjeta>
      ) : armar ? (
        <Tarjeta>
          <DesafioA5 slug={slug} onGuardado={onGuardado} />
        </Tarjeta>
      ) : desafioAbierto ? (
        <Boton onClick={() => setArmar(true)}>Armar mi instrucción ahora</Boton>
      ) : (
        <Tarjeta>
          <p className="text-[15px] text-tf2-grafito">El desafío final se habilita desde la presentación.</p>
        </Tarjeta>
      )}
      <Tarjeta>
        <Rotulo>Recapitulación</Rotulo>
        <ol className="mt-3 grid gap-2.5">
          {TF2_RECAP.map((r, k) => (
            <li key={r} className="flex gap-3 text-[15px] leading-snug">
              <span className="tf2-titular w-5 shrink-0 text-[19px] text-tf2-rojo">{k + 1}</span>
              {r}
            </li>
          ))}
        </ol>
        <p className="tf2-mono mt-4 text-[12.5px] text-tf2-gris">Próxima charla: análisis jurídico tributario.</p>
      </Tarjeta>
    </div>
  );
}

// --- Para el control del equipo: qué ve el celular en la placa actual --------------------------------

export function VistaParticipante2({ idx, abiertas = [] }: { idx: number; abiertas?: string[] }) {
  const slide = TF2_SLIDES[idx];
  if (!slide) return null;
  return (
    <div className="rounded-[10px] bg-tf2-papel p-4 text-tf2-tinta">
      <Blindaje>
        <PlacaActual slide={slide} />
        {slide.t === "placa" && slide.actividad && (
          <p className="tf2-mono text-[13px] text-tf2-rojo">
            📱 Abierta en los celulares: Actividad {getTf2Actividad(slide.actividad)?.numero}
            {abiertas.length ? ` · ${abiertas.join(" · ")}` : ""}
          </p>
        )}
      </Blindaje>
    </div>
  );
}
