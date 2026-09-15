"use client";

// Presentación del taller "IA aplicada a la resolución de conflictos"
// (El Salvador, 16 y 17/09/2026). Misma lógica que /justicia/clase: la placa
// manda (activa las actividades sola) y, además, libera documentos y prompts
// a la app de cada grupo y le pasa la etapa de los dos recorridos.
//
// Teclado: ← → avanzar · Home inicio · 1–9 tarjetas · V revelar respuesta ·
// Shift+R reiniciar (entre el grupo del miércoles y el del jueves).
// Control remoto: taller.rossi-ia.com/control.

import { useCallback, useEffect, useRef, useState } from "react";
import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ChipResponda, Constelacion, PlacaIngreso, ResultadosVivo, useResultados } from "@/components/clase/vivo";
import { DiagramaCaucus, DiagramaGem, DiagramaResearch, DiagramaVs, MapaTaller } from "@/components/taller/diagramas";
import { TarjetaAudio } from "@/components/taller/guiado";
import { PREGUNTAS_ENTREVISTA, TAL_AUDIOS, TAL_ETAPAS } from "@/lib/taller-guiado";
import { Explorables } from "@/components/clase/explorables";
import { LluviaReacciones } from "@/components/clase/reacciones";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import {
  BarraRecorridos,
  DocumentoCaso,
  MatrizTrabajo,
  PromptCaja,
  RecorridoFinal,
  RecorridosGrande,
  RolesGrupo,
  Saltos,
} from "@/components/taller/piezas";
import { COM_INSTAGRAM_URL, COM_QR_SRC } from "@/lib/comercial";
import type { ActividadVivo } from "@/lib/clase-vivo";
import { rem } from "@/lib/remoto";
import { TAL_DOCS, TAL_PROMPTS, type ConfigTaller, type LiberadoId } from "@/lib/taller-caso";
import {
  getTalActividad,
  TAL_AUTOR,
  TAL_CARGO,
  TAL_CONFIG,
  TAL_EVENTO,
  TAL_FECHA,
  TAL_KIT,
  TAL_LINK,
  TAL_LOGOS,
  TAL_QR_PLATAFORMA,
  TAL_SLIDES,
  TAL_SLUG,
  TAL_SUBTITLE,
  TAL_TITLE,
  tituloPlacaTaller,
  type TalAudioSlide,
  type TalDocumento,
  type TalPlaca,
  type TalPrompt,
  type TalSlide,
} from "@/lib/taller-clase";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "taller-clase-slide";
const STORAGE_VISTAS = "taller-clase-vistas";

export default function TallerClasePage() {
  return (
    <AccesoDocente titulo={`Presentación · ${TAL_TITLE}`}>
      <Deck />
    </AccesoDocente>
  );
}

function leer<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function guardar(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

/** Lo que ya se liberó: documentos y prompts de las placas visitadas, en orden de visita. */
function calcularConfig(vistas: number[], idx: number): ConfigTaller {
  const liberados: LiberadoId[] = [];
  for (const v of vistas) for (const id of TAL_SLIDES[v]?.libera ?? []) if (!liberados.includes(id)) liberados.push(id);
  const previas = TAL_SLIDES.slice(0, idx + 1).reverse();
  const caso = previas.find((s) => s.caso !== undefined)?.caso;
  const trabajo = previas.find((s) => s.trabajo !== undefined)?.trabajo;
  // La etapa abierta nunca retrocede: el máximo entre las placas ya visitadas.
  let etapa = 0;
  for (const v of [...vistas, idx]) {
    const e = TAL_SLIDES[v]?.etapa;
    if (e !== undefined && e > etapa) etapa = e;
  }
  return { liberados, caso, trabajo, etapa };
}

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

function Deck() {
  const [idx, setIdx] = useState(() => Math.min(Math.max(leer<number>(STORAGE_KEY, 0), 0), TAL_SLIDES.length - 1));
  const [vistas, setVistas] = useState<number[]>(() => leer<number[]>(STORAGE_VISTAS, []));
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const [kitManual, setKitManual] = useState<boolean | null>(null);
  const [revelada, setRevelada] = useState(false);
  const enviado = useRef<{ activa: string | null; cfg: string }>({ activa: null, cfg: "" });

  const go = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 0), TAL_SLIDES.length - 1);
    setIdx(next);
    setKitManual(null);
    setRevelada(false);
    guardar(STORAGE_KEY, next);
  }, []);
  const irA = useCallback(
    (id: string) => {
      const n = TAL_SLIDES.findIndex((s) => s.id === id);
      if (n >= 0) go(n);
    },
    [go],
  );

  const slide = TAL_SLIDES[idx];

  // Registrar la placa como vista (libera sus documentos y prompts).
  useEffect(() => {
    setVistas((v) => {
      if (v.includes(idx)) return v;
      const nv = [...v, idx];
      guardar(STORAGE_VISTAS, nv);
      return nv;
    });
  }, [idx]);

  // La placa manda: activa su actividad y le pasa a los grupos lo liberado y la etapa.
  useEffect(() => {
    const cfg = calcularConfig(vistas.includes(idx) ? vistas : [...vistas, idx], idx);
    const cfgStr = JSON.stringify(cfg);
    const key = "activa" in slide ? slide.activa : undefined;
    let body: Record<string, unknown> | null = null;
    if (key && key !== enviado.current.activa) body = { current_activity: key, activity_config: cfg };
    else if (cfgStr !== enviado.current.cfg) body = { activity_config: cfg };
    if (!body) return;
    if (key) enviado.current.activa = key;
    enviado.current.cfg = cfgStr;
    const nombre = key ?? enviado.current.activa ?? "lobby";
    if (key) setEstado({ key: nombre, status: "enviando" });
    fetch(`/api/session/${TAL_SLUG}/activity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) enviado.current = { activa: null, cfg: "" };
        if (key || !r.ok) setEstado({ key: nombre, status: r.ok ? "ok" : "error" });
      })
      .catch(() => {
        enviado.current = { activa: null, cfg: "" };
        setEstado({ key: nombre, status: "error" });
      });
  }, [slide, idx, vistas]);

  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar el taller? Se borran los grupos, sus respuestas y los documentos liberados.")) return;
      await fetch(`/api/session/${TAL_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      enviado.current = { activa: null, cfg: "" };
      const nv = [idx];
      guardar(STORAGE_VISTAS, nv);
      setVistas(nv);
    }
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "v" || e.key === "V") setRevelada((r) => !r);
      else if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(idx + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "R" && e.shiftKey) reiniciar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx]);

  const parteActual = TAL_SLIDES.slice(0, idx + 1)
    .reverse()
    .find((s) => s.parte)?.parte;
  const etapa = calcularConfig([], idx);
  const conBarra = slide.t !== "portada" && slide.t !== "ingreso" && slide.t !== "final" && (etapa.caso !== undefined || etapa.trabajo !== undefined);

  useRemotoDeck({ slug: TAL_SLUG, idx, total: TAL_SLIDES.length, titulo: tituloPlacaTaller(slide), parte: parteActual, go });

  const estadoNombre = estado ? (getTalActividad(estado.key)?.titulo ?? "Ingreso") : "";
  const kitVisible = kitManual ?? Boolean(slide.kit);
  const { zoom, aviso: avisoZoom } = useZoomDeck();

  return (
    <div className="deck-escala bg-grid relative flex min-h-dvh flex-col overflow-hidden">
      <AvisoZoom zoom={zoom} visible={avisoZoom} />
      <div className="fixed inset-x-0 top-0 z-40 h-1 bg-ink-2/60">
        <div
          className="h-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-300"
          style={{ width: `${((idx + 1) / TAL_SLIDES.length) * 100}%` }}
        />
      </div>

      {estado && (
        <div
          className={cn(
            "fixed right-4 top-3 z-40 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium",
            estado.status === "error" ? "bg-magenta/15 text-magenta" : "bg-teal/15 text-teal",
          )}
        >
          <span className={cn("size-1.5 rounded-full", estado.status === "error" ? "bg-magenta" : "animate-pulse bg-teal")} />
          {estado.status === "enviando" && "activando…"}
          {estado.status === "ok" && <>en vivo: {estadoNombre}</>}
          {estado.status === "error" && "no se pudo activar — vuelva a ingresar la clave"}
        </div>
      )}

      <main
        key={idx}
        className="rise mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 pb-20 pt-10 sm:px-10 sm:pt-14"
      >
        {conBarra && (
          <div className="mb-5">
            <BarraRecorridos caso={etapa.caso} trabajo={etapa.trabajo} />
          </div>
        )}
        <Slide slide={slide} revelada={revelada} onRevelar={() => setRevelada((r) => !r)} onSalto={irA} />
      </main>

      <LluviaReacciones slug={TAL_SLUG} contador={slide.t === "final"} />

      {/* El kit vive en el pie: nunca tapa el contenido de la placa. */}
      <footer className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 bg-gradient-to-t from-ink via-ink/90 to-transparent px-5 pb-3 pt-6 text-xs text-faint">
        <div className="flex min-w-0 items-center gap-2">
          <button
            onClick={() => setKitManual(!kitVisible)}
            className={cn(
              "shrink-0 rounded-lg border px-3 py-1.5 transition",
              kitVisible ? "border-teal/60 bg-teal/15 text-teal" : "border-line bg-panel/60 text-muted hover:text-teal",
            )}
            aria-expanded={kitVisible}
          >
            🧰 {kitVisible ? "Kit" : "Herramientas"}
          </button>
          {kitVisible ? (
            <div className="rise flex min-w-0 items-center gap-1.5 overflow-x-auto">
              {TAL_KIT.map((h) => (
                <a
                  key={h.id}
                  href={h.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg border border-line bg-panel/70 px-2.5 py-1.5 text-xs text-foreground transition hover:border-teal/60 hover:text-teal"
                >
                  <span>{h.emoji}</span>
                  {h.label}
                </a>
              ))}
            </div>
          ) : (
            <span className="hidden min-w-0 truncate lg:block">{TAL_AUTOR} · Laboratorio de IA · Facultad de Derecho y Ciencias Sociales, UNT</span>
          )}
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {parteActual && (
            <span
              className={cn(
                "hidden rounded-full border border-line bg-panel/60 px-2.5 py-1 font-mono text-[11px] text-muted",
                kitVisible ? "2xl:block" : "md:block",
              )}
            >
              {parteActual}
            </span>
          )}
          <button onClick={() => go(idx - 1)} className="rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-muted transition hover:text-teal" aria-label="Anterior">
            ◀
          </button>
          <span className="font-mono">
            {idx + 1} / {TAL_SLIDES.length}
          </span>
          <button onClick={() => go(idx + 1)} className="rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-muted transition hover:text-teal" aria-label="Siguiente">
            ▶
          </button>
        </div>
      </footer>
    </div>
  );
}

// --- Placas -----------------------------------------------------------------------------

function Logos({ alto = 64 }: { alto?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
      {TAL_LOGOS.map((l) => (
        <img
          key={l.src}
          src={l.src}
          alt={l.alt}
          style={{ height: alto, maxHeight: "9vw" }}
          className={cn("w-auto", l.fondo && "rounded-xl bg-white p-1.5")}
        />
      ))}
    </div>
  );
}

function Parte({ texto }: { texto: string }) {
  return (
    <p className="mb-3 flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-violet">
      <span className="size-1.5 rounded-full bg-current" />
      {texto}
    </p>
  );
}

function Titulo({ titulo, bajada }: { titulo: string; bajada: string }) {
  return (
    <>
      <h1 className="max-w-5xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">{titulo}</h1>
      <p className="rise mt-3 max-w-4xl text-lg leading-snug text-muted sm:text-2xl" style={{ animationDelay: "0.12s" }}>
        {bajada}
      </p>
    </>
  );
}

function Slide({
  slide,
  revelada,
  onRevelar,
  onSalto,
}: {
  slide: TalSlide;
  revelada: boolean;
  onRevelar: () => void;
  onSalto: (a: string) => void;
}) {
  const saltos = slide.saltos ? <Saltos saltos={slide.saltos} onSalto={onSalto} /> : null;
  switch (slide.t) {
    case "portada":
      return (
        <div className="relative flex flex-col items-center text-center">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/4 opacity-40 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 30% 40%, rgba(94,234,212,0.5), transparent 60%), radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.5), transparent 60%)",
            }}
          />
          <Constelacion />
          <Logos alto={62} />
          <p className="mt-8 font-mono text-sm uppercase tracking-[0.3em] text-violet">Taller práctico</p>
          <h1 className="text-gradient mt-3 max-w-5xl break-words font-mono text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{TAL_TITLE}</h1>
          <p className="rise mt-4 max-w-3xl text-lg text-muted sm:text-2xl" style={{ animationDelay: "0.2s" }}>
            {TAL_SUBTITLE}
          </p>
          <p className="rise mt-2 text-sm text-faint" style={{ animationDelay: "0.3s" }}>
            {TAL_EVENTO} · {TAL_FECHA}
          </p>
          <p className="rise mt-5 text-lg font-medium" style={{ animationDelay: "0.4s" }}>
            {TAL_AUTOR}
          </p>
          <p className="rise text-sm text-muted" style={{ animationDelay: "0.45s" }}>
            {TAL_CARGO}
          </p>
          <div className="rise mt-8 flex flex-wrap items-center justify-center gap-5" style={{ animationDelay: "0.6s" }}>
            <img src={TAL_QR_PLATAFORMA} alt="Código QR para ingresar" width={150} height={150} className="rounded-xl border border-line bg-white p-2" />
            <div className="pulse-ring rounded-2xl border-gradient px-5 py-4 text-left sm:px-7 sm:py-5">
              <p className="text-xs uppercase tracking-widest text-faint">Una computadora por persona o por dupla</p>
              <p className="text-gradient mt-1 break-all font-mono text-xl font-bold sm:text-2xl">{TAL_LINK}</p>
              <p className="mt-1 text-xs text-faint">escaneen el código o escriban la dirección</p>
            </div>
          </div>
        </div>
      );

    case "ingreso":
      return (
        <div>
          <PlacaIngreso slug={TAL_SLUG} qr={TAL_QR_PLATAFORMA} link={TAL_LINK} />
          <p className="mt-4 text-center text-lg text-muted">Ingresen con su nombre: en su computadora los espera el itinerario del taller, con MessIAs de asistente.</p>
        </div>
      );

    case "placa":
      return <PlacaVista slide={slide} saltos={saltos} />;

    case "actividad": {
      const act = getTalActividad(slide.activa);
      if (!act) return null;
      return (
        <div>
          {slide.parte && <Parte texto={slide.parte} />}
          <SlideActividad act={act} escena={slide.escena} revelada={revelada} onRevelar={onRevelar} />
          {saltos}
        </div>
      );
    }

    case "documento":
      return <DocumentoVista slide={slide} saltos={saltos} />;

    case "prompt":
      return <PromptVista slide={slide} saltos={saltos} />;

    case "audio":
      return <AudioVista slide={slide} />;

    case "tablero":
      return <TableroVista n={slide.n} />;

    case "final":
      return (
        <div className="flex flex-col items-center text-center">
          <Logos alto={54} />
          <h1 className="text-gradient mt-8 font-mono text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">Gracias</h1>
          <p className="rise mt-5 rounded-full border border-teal/40 bg-teal/10 px-5 py-2 text-lg text-foreground sm:text-xl" style={{ animationDelay: "0.2s" }}>
            👏 Manden su aplauso desde su compu o celular
          </p>
          <p className="rise mt-3 text-lg text-muted sm:text-xl" style={{ animationDelay: "0.3s" }}>
            📘 La guía del taller ya está en su pantalla: <span className="font-mono text-teal">taller.rossi-ia.com/guia</span>
          </p>
          <p className="mt-4 text-lg text-muted">{TAL_EVENTO}</p>
          <p className="mt-5 text-lg font-medium">{TAL_AUTOR}</p>
          <p className="text-sm text-muted">{TAL_CARGO}</p>
          <a href={COM_INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-8 flex flex-col items-center gap-3">
            <img src={COM_QR_SRC} alt="Código QR a Instagram" width={190} height={190} className="rounded-2xl border border-line bg-white p-3" />
            <span className="font-mono text-lg text-teal">@marquitorossi</span>
          </a>
        </div>
      );
  }
}

/** Entrevista privada por los parlantes: reproductor grande y las cuatro preguntas. */
function AudioVista({ slide }: { slide: TalAudioSlide & { parte?: string } }) {
  const a = TAL_AUDIOS[slide.audio];
  return (
    <div>
      {slide.parte && <Parte texto={slide.parte} />}
      <Titulo titulo={`${a.emoji} ${a.titulo}`} bajada={`Sesión privada con el equipo de mediación · ${a.dur} · escuchen con la ficha PL-D a mano`} />
      <div className="mx-auto mt-8 w-full max-w-3xl" {...rem(`▶ Audio ${a.codigo}`)}>
        <TarjetaAudio audio={a} />
      </div>
      <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-2">
        {PREGUNTAS_ENTREVISTA.map((q) => (
          <span key={q} className="rounded-full border border-line bg-panel/60 px-3.5 py-1.5 text-sm text-muted">
            «{q}»
          </span>
        ))}
      </div>
      <p className="mt-6 text-center text-base text-faint">El audio también está en cada computadora (etapa 1), con su transcripción.</p>
    </div>
  );
}

/** Tablero de sala: cuántas computadoras marcaron "Listo" en cada paso de la etapa. */
function TableroVista({ n }: { n: number }) {
  const etapa = TAL_ETAPAS.find((e) => e.n === n) ?? TAL_ETAPAS[0];
  const { data } = useResultados(TAL_SLUG, "tal_paso", TAL_CONFIG.poll.deck);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Math.max(1, data?.participants ?? 0);
  return (
    <div>
      <Parte texto={`Tablero de sala · etapa ${etapa.n}`} />
      <Titulo titulo={`${etapa.emoji} ¿Cómo vamos con «${etapa.titulo}»?`} bajada={`${data?.participants ?? 0} computadoras conectadas · cada barra es un paso marcado como listo`} />
      <div className="mx-auto mt-8 w-full max-w-4xl space-y-3">
        {etapa.pasos.map((p, i) => {
          const c = counts[p.id] ?? 0;
          const pct = Math.min(100, Math.round((c / total) * 100));
          return (
            <div key={p.id} className={cn("rounded-2xl border p-4", p.extra ? "border-dashed border-line/60" : "glass border-line")}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 truncate text-lg font-semibold sm:text-xl">
                  <span className="mr-2 font-mono text-teal">{i + 1}.</span>
                  {p.titulo}
                  {p.extra && <span className="ml-2 text-xs font-normal text-faint">extra</span>}
                </p>
                <p className="shrink-0 font-mono text-lg text-teal sm:text-xl">
                  {c}
                  <span className="text-faint"> / {data?.participants ?? 0}</span>
                </p>
              </div>
              <div className="mt-2 h-3 overflow-hidden rounded-full bg-ink-2">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-cyan transition-all duration-700" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      <PreguntasMessias />
    </div>
  );
}

/** Las últimas preguntas a MessIAs, anónimas: dónde se está trabando la sala. */
function PreguntasMessias() {
  const { data } = useResultados(TAL_SLUG, "tal_messias", 4000);
  const preguntas = (data?.summary?.preguntas as string[]) ?? [];
  const total = (data?.summary?.total as number) ?? 0;
  if (!total) {
    return <p className="mt-6 text-center text-base text-faint">Si un paso viene lento, es ahí donde hay que dar una mano (o mandar a MessIAs).</p>;
  }
  return (
    <div className="mx-auto mt-6 w-full max-w-4xl rounded-2xl border border-violet/40 bg-violet/5 p-4">
      <p className="text-xs font-bold uppercase tracking-widest text-violet">
        🗨️ Lo que le están preguntando a MessIAs <span className="ml-2 font-mono normal-case text-faint">{total} preguntas</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {preguntas.map((q, i) => (
          <span key={`${i}-${q.slice(0, 12)}`} className={cn("rounded-xl border border-line bg-ink-2/60 px-3 py-1.5 text-sm text-muted", i === 0 && "border-violet/50 text-foreground")}>
            «{q}»
          </span>
        ))}
      </div>
    </div>
  );
}

function PlacaVista({ slide, saltos }: { slide: TalPlaca & { parte?: string }; saltos: React.ReactNode }) {
  return (
    <div>
      {slide.parte && <Parte texto={slide.parte} />}
      <Titulo titulo={slide.titulo} bajada={slide.bajada} />
      {slide.visual === "recorridos" && <RecorridosGrande />}
      {slide.visual === "matriz" && <MatrizTrabajo />}
      {slide.visual === "recorrido-final" && <RecorridoFinal />}
      {slide.visual === "roles" && <RolesGrupo />}
      {slide.visual === "gem" && <DiagramaGem />}
      {slide.visual === "caucus" && <DiagramaCaucus />}
      {slide.visual === "vs" && <DiagramaVs />}
      {slide.visual === "research" && <DiagramaResearch />}
      {slide.visual === "mapa" && <MapaTaller hechas />}
      {slide.explora && (
        <div className="mt-6">
          <Explorables items={slide.explora} />
        </div>
      )}
      {slide.lede && (
        <p className="rise mx-auto mt-5 max-w-4xl text-center text-xl italic leading-relaxed text-muted" style={{ animationDelay: "0.4s" }}>
          {slide.lede}
        </p>
      )}
      {saltos}
    </div>
  );
}

function DocumentoVista({ slide, saltos }: { slide: TalDocumento & { parte?: string }; saltos: React.ReactNode }) {
  const lateral = Boolean(slide.pregunta || slide.puntos || slide.explora);
  const docs = slide.docs.map((d) => TAL_DOCS[d]);
  return (
    <div>
      {slide.parte && <Parte texto={slide.parte} />}
      <Titulo titulo={slide.titulo} bajada={slide.bajada} />
      <div className={cn("mt-6 grid items-start gap-5", lateral ? "lg:grid-cols-[1.25fr_1fr]" : docs.length === 3 ? "lg:grid-cols-3" : docs.length > 1 && "lg:grid-cols-2")}>
        {lateral ? (
          <div className="rise flex flex-col gap-4" style={{ animationDelay: "0.2s" }}>
            {docs.map((d) => (
              <DocumentoCaso key={d.id} doc={d} grande />
            ))}
          </div>
        ) : (
          docs.map((d, i) => (
            <div key={d.id} className="rise" style={{ animationDelay: `${0.2 + i * 0.12}s` }}>
              <DocumentoCaso doc={d} grande />
            </div>
          ))
        )}
        {lateral && (
          <div className="flex flex-col gap-4">
            {slide.pregunta && (
              <p className="rise rounded-2xl border border-yellow-400/50 bg-yellow-400/10 p-5 text-xl font-semibold leading-snug sm:text-2xl" style={{ animationDelay: "0.3s" }}>
                {slide.pregunta}
              </p>
            )}
            {slide.puntos && (
              <div className="rise glass rounded-2xl p-5" style={{ animationDelay: "0.35s" }}>
                <p className="text-xs font-bold uppercase tracking-wider text-teal">Estado del caso</p>
                <ul className="mt-2 space-y-1.5 text-base leading-snug sm:text-lg">
                  {slide.puntos.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
            {slide.explora && <Explorables items={slide.explora} columnas={1} />}
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-faint">📲 Ya está en el dispositivo de cada grupo: el PDF para descargar y subir a su herramienta, o el texto para copiar.</p>
      {saltos}
    </div>
  );
}

function PromptVista({ slide, saltos }: { slide: TalPrompt & { parte?: string }; saltos: React.ReactNode }) {
  const prompt = TAL_PROMPTS[slide.prompt];
  const conDocs = slide.con.length
    ? slide.con.map((d) => TAL_DOCS[d].codigo).join(" y ")
    : "todos los documentos que tienen";
  const pasos = [
    { e: "🧰", t: "Abran su herramienta: ChatGPT, Claude, Gemini o Notebook Gemini." },
    { e: "📂", t: `Peguen ${conDocs} (botón «Copiar» en su dispositivo).` },
    { e: "✍️", t: "Peguen la instrucción." },
    { e: "🔍", t: slide.despues },
  ];
  return (
    <div>
      {slide.parte && <Parte texto={slide.parte} />}
      <Titulo titulo={slide.titulo} bajada={slide.bajada} />
      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="rise" style={{ animationDelay: "0.2s" }}>
          <PromptCaja prompt={prompt} grande />
        </div>
        <ol className="flex flex-col gap-2.5">
          {pasos.map((p, i) => (
            <li key={i} className="rise glass flex items-start gap-3 rounded-2xl p-4 text-base leading-snug sm:text-lg" style={{ animationDelay: `${0.3 + i * 0.1}s` }}>
              <span className="text-2xl">{p.e}</span>
              <span>
                <b className="mr-1 font-mono text-teal">{i + 1}.</b>
                {p.t}
              </span>
            </li>
          ))}
        </ol>
      </div>
      {saltos}
    </div>
  );
}

// --- Placa de actividad ------------------------------------------------------------------

function SlideActividad({
  act,
  escena,
  revelada,
  onRevelar,
}: {
  act: ActividadVivo;
  escena: string;
  revelada: boolean;
  onRevelar: () => void;
}) {
  const nube = act.kind === "palabra";
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col-reverse items-start gap-5 md:flex-row md:justify-between md:gap-6">
        <div className="min-w-0">
          <p className="mb-3 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-yellow-400 sm:text-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-current" />
            {escena} · en vivo
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{act.titulo}</h1>
          <p className="mt-3 max-w-3xl text-base italic leading-snug text-muted sm:text-xl">{act.bajada}</p>
        </div>
        <ChipResponda qr={TAL_QR_PLATAFORMA} link={TAL_LINK} />
      </div>

      <div className={cn("rise mt-5 flex flex-1 flex-col", nube && "[&>div]:min-h-[48vh]")} style={{ animationDelay: "0.25s" }}>
        <ResultadosVivo slug={TAL_SLUG} act={act} intervalo={TAL_CONFIG.poll.deck} revelada={revelada} />
      </div>

      {act.correcta && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onRevelar}
            {...rem("✓ Ver respuesta", revelada)}
            className={cn(
              "rounded-xl border px-4 py-2 text-sm font-medium transition",
              revelada
                ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
                : "border-line bg-panel/60 text-muted hover:border-teal/60 hover:text-teal",
            )}
          >
            {revelada ? "Ocultar respuesta" : "Ver respuesta"} <span className="ml-1 font-mono text-xs text-faint">V</span>
          </button>
        </div>
      )}
    </div>
  );
}
