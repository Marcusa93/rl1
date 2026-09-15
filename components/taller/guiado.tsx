"use client";

// El itinerario guiado del taller en cada computadora: 8 etapas con pasos tipo
// receta. La placa del deck abre etapas (activity_config.etapa); acá cada
// participante avanza a su ritmo, marca "Listo" (alimenta el tablero del deck)
// y tiene todo a un toque: audios, PDFs, prompts, misiones y herramientas.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { ActaAcuerdo } from "@/components/taller/acta";
import { ExpedienteVisual } from "@/components/taller/expediente";
import { FichaEscucha } from "@/components/taller/ficha";
import { MessIAs } from "@/components/taller/messias";
import { BotonCopiar, DocumentoCaso, PromptCaja } from "@/components/taller/piezas";
import { TutorTaller } from "@/components/taller/tutor";
import { docComoTexto, TAL_DOCS, TAL_PLANTILLAS, TAL_PROMPTS, urlPdf, type ConfigTaller } from "@/lib/taller-caso";
import {
  AUDIOS_URL,
  PREGUNTAS_ENTREVISTA,
  TAL_AUDIOS,
  TAL_ETAPAS,
  TAL_MISIONES,
  type AudioCaso,
  type EtapaTaller,
  type PasoTaller,
} from "@/lib/taller-guiado";
import { getTalActividad, TAL_SLUG } from "@/lib/taller-clase";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

const LS_HECHOS = "tal-pasos-hechos";

function leerHechos(): Record<string, boolean> {
  try {
    return JSON.parse(localStorage.getItem(LS_HECHOS) ?? "{}");
  } catch {
    return {};
  }
}

export function TallerGuiado({ session, actividad }: { session: SessionRow; actividad: ReactNode }) {
  const cfg = (session.activity_config ?? {}) as ConfigTaller;
  const abierta = Math.max(0, Math.min(cfg.etapa ?? 0, TAL_ETAPAS.length - 1));
  const [vista, setVista] = useState<number | null>(null);
  const [hechos, setHechos] = useState<Record<string, boolean>>({});
  const enVivo = getTalActividad(session.current_activity);
  const vivoRef = useRef<HTMLElement>(null);
  const [vivoVisible, setVivoVisible] = useState(true);

  useEffect(() => setHechos(leerHechos()), []);

  // Aviso cuando el deck activa una actividad y la sección no está a la vista.
  useEffect(() => {
    if (enVivo && "vibrate" in navigator) navigator.vibrate?.(80);
  }, [session.current_activity, enVivo]);
  useEffect(() => {
    const el = vivoRef.current;
    if (!el || !enVivo) return;
    const obs = new IntersectionObserver(([e]) => setVivoVisible(e.isIntersecting), { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [enVivo]);

  const n = vista ?? abierta;
  const etapa = TAL_ETAPAS[Math.min(n, abierta)];

  // Avance personal: pasos obligatorios hechos, en total y en la etapa a la vista.
  const obligatorios = TAL_ETAPAS.flatMap((e) => e.pasos.filter((p) => !p.extra));
  const hechosTotal = obligatorios.filter((p) => hechos[p.id]).length;
  const pct = Math.round((hechosTotal / obligatorios.length) * 100);
  const deEtapa = etapa.pasos.filter((p) => !p.extra);
  const hechosEtapa = deEtapa.filter((p) => hechos[p.id]).length;

  function marcar(paso: PasoTaller, valor: boolean) {
    const next = { ...hechos, [paso.id]: valor };
    setHechos(next);
    try {
      localStorage.setItem(LS_HECHOS, JSON.stringify(next));
    } catch {}
    // alimenta el tablero del deck; si falla, el checklist local igual sirve
    fetch(`/api/session/${TAL_SLUG}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "tal_paso", item_key: paso.id, payload: { done: valor, etapa: etapa.n } }),
    }).catch(() => {});
  }

  return (
    <div className="space-y-5">
      {enVivo && (
        <section ref={vivoRef} className="rise rounded-3xl border-gradient p-4">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal">🗳️ Actividad en vivo · responda ahora</p>
          {actividad}
        </section>
      )}

      {/* Si la actividad quedó fuera de la vista, una burbuja la trae de vuelta */}
      {enVivo && !vivoVisible && (
        <button
          onClick={() => vivoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          className="pulse-ring fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gradient-to-r from-teal to-cyan px-5 py-3 text-base font-bold text-ink shadow-xl"
        >
          🗳️ Actividad en vivo — responder
        </button>
      )}

      {/* Al cierre (nube de palabras): la guía del taller para llevarse */}
      {session.current_activity === "tal_nube" && <GuiaTallerCard />}

      {/* Aviso de etapa nueva */}
      {vista !== null && vista < abierta && (
        <button
          onClick={() => setVista(null)}
          className="w-full rounded-2xl bg-gradient-to-r from-teal to-cyan px-4 py-3 text-base font-bold text-ink"
        >
          🔓 Se abrió la etapa {abierta}: {TAL_ETAPAS[abierta].titulo} — ir ahora
        </button>
      )}

      {/* Avance personal */}
      <div className="rounded-2xl border border-line bg-panel/40 px-4 py-3">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">Su avance</p>
          <p className="font-mono text-sm">
            <b className="text-teal">{hechosTotal}</b>
            <span className="text-faint"> de {obligatorios.length} pasos</span>
            {pct === 100 && <span className="ml-2">🏆</span>}
          </p>
        </div>
        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-ink-2">
          <div className="h-full rounded-full bg-gradient-to-r from-teal via-cyan to-violet transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Chips de etapas */}
      <nav className="flex gap-1.5 overflow-x-auto pb-1">
        {TAL_ETAPAS.map((e) => {
          const bloqueada = e.n > abierta;
          const activa = e.n === etapa.n;
          const completos = e.pasos.filter((p) => !p.extra).every((p) => hechos[p.id]);
          return (
            <button
              key={e.n}
              disabled={bloqueada}
              onClick={() => setVista(e.n === abierta ? null : e.n)}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold transition",
                activa
                  ? "border-teal bg-teal/15 text-teal"
                  : bloqueada
                    ? "border-line/60 text-faint opacity-50"
                    : completos
                      ? "border-teal/40 text-teal/80"
                      : "border-line bg-panel/60 text-muted",
              )}
            >
              <span>{bloqueada ? "🔒" : completos && !activa ? "✓" : e.emoji}</span>
              <span>
                {e.n} · {e.titulo}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Etapa actual */}
      <section key={etapa.n} className="rise">
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">
            Etapa {etapa.n} de {TAL_ETAPAS.length - 1}
            {etapa.n === abierta ? " · en curso" : " · repaso"}
            <span className="ml-2 font-mono normal-case tracking-normal text-faint">
              {hechosEtapa}/{deEtapa.length} ✓
            </span>
          </p>
          <h2 className="mt-1 text-2xl font-bold leading-tight">
            {etapa.emoji} {etapa.titulo}
          </h2>
          <p className="mt-1 text-base text-muted">{etapa.bajada}</p>
        </div>
        <div className="space-y-3">
          {etapa.pasos.map((paso, i) => (
            <Paso key={paso.id} paso={paso} i={i} hecho={!!hechos[paso.id]} onMarcar={(v) => marcar(paso, v)} />
          ))}
        </div>
        <NavEtapas n={etapa.n} abierta={abierta} onIr={(x) => setVista(x === abierta ? null : x)} />
      </section>

      {/* La ficha del expediente, siempre a la vista */}
      <ExpedienteVisual session={session} />

      {/* Archivo completo, por si algo del itinerario no alcanza */}
      <details className="rounded-2xl border border-line/60 bg-panel/30 p-4">
        <summary className="cursor-pointer text-sm font-semibold text-muted">✍️ Todos los prompts, plantillas y herramientas liberados</summary>
        <TutorTaller session={session} />
      </details>

      <MessIAs etapa={etapa.n} />
      <Festejo activo={pct === 100} />
    </div>
  );
}

/** Al cierre: la guía del taller para ver, descargar y compartir. */
function GuiaTallerCard() {
  return (
    <section className="rise rounded-3xl border-gradient p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-teal">📘 La guía del taller</p>
      <p className="mt-2 text-xl font-bold leading-snug">El mediador aumentado: el método, los conceptos y las herramientas, para llevarse.</p>
      <div className="mt-4 grid gap-2">
        <a href="/taller-ia/guia" className="rounded-2xl bg-gradient-to-r from-teal to-cyan px-4 py-3 text-center text-lg font-bold text-ink">
          Ver la guía
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a
            href="/taller-ia/guia-mediador-aumentado.pdf"
            download
            className="rounded-2xl border border-teal/60 bg-teal/10 px-3 py-3 text-center text-base font-semibold text-teal"
          >
            ⬇️ PDF
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Guía del taller «El mediador aumentado» (Dr. Marco Rossi, Semana de la Mediación, El Salvador): https://taller.rossi-ia.com/guia")}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-emerald-400/60 bg-emerald-500/15 px-3 py-3 text-center text-base font-semibold text-emerald-200"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

/** Al marcar el último paso: papelitos y trofeo, una sola vez por compu. */
function Festejo({ activo }: { activo: boolean }) {
  const [mostrar, setMostrar] = useState(false);
  const previo = useRef(false);
  useEffect(() => {
    if (activo && !previo.current) {
      let visto = false;
      try {
        visto = localStorage.getItem("tal-festejo") === "1";
        localStorage.setItem("tal-festejo", "1");
      } catch {}
      if (!visto) {
        setMostrar(true);
        if ("vibrate" in navigator) navigator.vibrate?.([60, 40, 60]);
        setTimeout(() => setMostrar(false), 4200);
      }
    }
    previo.current = activo;
  }, [activo]);
  if (!mostrar) return null;
  const colores = ["#5eead4", "#22d3ee", "#a78bfa", "#f0abfc", "#fbbf24"];
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {Array.from({ length: 48 }, (_, i) => (
        <span
          key={i}
          className="confeti absolute top-0 rounded-sm"
          style={{
            left: `${(i * dispersion(i)) % 100}%`,
            width: i % 3 ? 8 : 12,
            height: i % 2 ? 14 : 8,
            backgroundColor: colores[i % colores.length],
            animationDelay: `${(i % 12) * 0.12}s`,
            ["--dur" as string]: `${2.4 + (i % 5) * 0.35}s`,
            ["--giro" as string]: `${360 + ((i * 97) % 540)}deg`,
          }}
        />
      ))}
      <div className="rise absolute left-1/2 top-1/3 -translate-x-1/2 rounded-3xl border-gradient bg-ink/95 px-8 py-6 text-center shadow-2xl">
        <p className="text-5xl">🏆</p>
        <p className="mt-2 text-2xl font-bold text-gradient">¡Taller completo!</p>
        <p className="mt-1 text-sm text-muted">Todos los pasos del mediador aumentado.</p>
      </div>
    </div>
  );
}

/** Pseudoazar estable para repartir el confeti. */
function dispersion(i: number) {
  return ((i * 37 + 11) % 89) + 7;
}

function NavEtapas({ n, abierta, onIr }: { n: number; abierta: number; onIr: (x: number) => void }) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3">
      <button
        onClick={() => onIr(n - 1)}
        disabled={n === 0}
        className="rounded-xl border border-line bg-panel/60 px-4 py-2.5 text-base font-semibold disabled:opacity-30"
      >
        ‹ Etapa {Math.max(0, n - 1)}
      </button>
      {n < abierta ? (
        <button onClick={() => onIr(n + 1)} className="rounded-xl border border-teal/60 bg-teal/10 px-4 py-2.5 text-base font-semibold text-teal">
          Etapa {n + 1} ›
        </button>
      ) : (
        <p className="text-sm text-faint">La etapa {Math.min(n + 1, TAL_ETAPAS.length - 1)} se abre desde la pantalla</p>
      )}
    </div>
  );
}

function Paso({ paso, i, hecho, onMarcar }: { paso: PasoTaller; i: number; hecho: boolean; onMarcar: (v: boolean) => void }) {
  const [abierto, setAbierto] = useState(!hecho);
  const docs = paso.docs?.map((id) => TAL_DOCS[id]) ?? [];
  return (
    <div
      className={cn(
        "rounded-2xl border transition",
        hecho ? "border-teal/50 bg-teal/5" : paso.extra ? "border-dashed border-line bg-panel/30" : "glass border-line",
      )}
    >
      <button onClick={() => setAbierto((v) => !v)} className="flex w-full items-center gap-3 p-4 text-left">
        <span
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            hecho ? "bg-teal text-ink" : "border border-line bg-ink-2 text-muted",
          )}
        >
          {hecho ? "✓" : i + 1}
        </span>
        <span className="min-w-0 flex-1">
          <span className={cn("block text-lg font-semibold leading-snug", hecho && "text-teal")}>
            {paso.titulo}
            {paso.extra && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[10px] font-normal text-faint">extra · si va rápido</span>}
          </span>
        </span>
        <span className="shrink-0 text-xl text-faint">{abierto ? "−" : "+"}</span>
      </button>

      {abierto && (
        <div className="space-y-4 px-4 pb-4">
          <ol className="space-y-2">
            {paso.hacer.map((linea, j) => (
              <li key={j} className="flex gap-2.5 text-base leading-relaxed">
                <span className="shrink-0 font-mono text-sm font-bold text-teal">{j + 1}.</span>
                <span>{linea}</span>
              </li>
            ))}
          </ol>

          {paso.audio && <TarjetaAudio audio={TAL_AUDIOS[paso.audio]} />}

          {paso.ficha && <FichaEscucha compacta={paso.id !== "e1-ficha"} />}

          {paso.acta && <ActaAcuerdo />}

          {docs.length > 0 && (
            <div className="space-y-2">
              {docs.map((d) => (
                <DocPaso key={d.id} id={d.id} />
              ))}
            </div>
          )}

          {paso.plantilla && (
            <a
              href={urlPdf(TAL_PLANTILLAS[paso.plantilla].archivo)}
              download
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-amber-300/50 bg-amber-400/10 px-4 py-3"
            >
              <span className="text-2xl">📋</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold text-amber-200">
                  {TAL_PLANTILLAS[paso.plantilla].codigo} · {TAL_PLANTILLAS[paso.plantilla].titulo}
                </span>
                <span className="block text-sm text-faint">{TAL_PLANTILLAS[paso.plantilla].para}</span>
              </span>
              <span className="shrink-0 rounded-lg border border-amber-300/60 px-3 py-1.5 text-sm font-semibold text-amber-200">⬇️ PDF</span>
            </a>
          )}

          {paso.prompt && <PromptCaja prompt={TAL_PROMPTS[paso.prompt]} />}

          {paso.herramienta && (
            <a
              href={paso.herramienta.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal to-cyan px-4 py-3 text-lg font-bold text-ink"
            >
              🔵 Abrir {paso.herramienta.label} ↗
            </a>
          )}

          {paso.misiones && <Misiones />}

          {paso.nota && <p className="rounded-xl border border-line bg-ink-2/60 px-3 py-2 text-sm text-muted">💡 {paso.nota}</p>}

          <button
            onClick={() => onMarcar(!hecho)}
            className={cn(
              "w-full rounded-2xl px-4 py-3 text-base font-bold transition active:scale-[0.99]",
              hecho ? "border border-teal/50 bg-teal/10 text-teal" : "bg-gradient-to-r from-teal to-cyan text-ink",
            )}
          >
            {hecho ? "✓ Listo (tocar para desmarcar)" : "Marcar como listo ✓"}
          </button>
        </div>
      )}
    </div>
  );
}

function DocPaso({ id }: { id: keyof typeof TAL_DOCS }) {
  const d = TAL_DOCS[id];
  const [ver, setVer] = useState(false);
  return (
    <div className="rounded-2xl border border-line bg-ink-2/50 p-3">
      <div className="flex items-center gap-2">
        <button onClick={() => setVer((v) => !v)} className="min-w-0 flex-1 text-left">
          <p className="truncate text-base font-semibold">
            <span className="mr-1.5 font-mono text-teal">{d.codigo}</span>
            {d.titulo}
          </p>
          <p className="text-xs text-faint">
            {d.origen}
            {d.imagen && " · 📷 es una imagen"} · {ver ? "ocultar ▲" : "ver ▼"}
          </p>
        </button>
        <a
          href={urlPdf(d.archivo)}
          download
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg border border-teal/60 bg-teal/10 px-3 py-1.5 text-sm font-semibold text-teal"
        >
          ⬇️ PDF
        </a>
        <BotonCopiar texto={docComoTexto(d)} />
      </div>
      {ver && (
        <div className="mt-3">
          <DocumentoCaso doc={d} sinPdf />
        </div>
      )}
    </div>
  );
}

/** Reproductor propio: onda, play/pausa, progreso y descarga. Lo usa también el deck. */
export function TarjetaAudio({ audio }: { audio: AudioCaso }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [sonando, setSonando] = useState(false);
  const [prog, setProg] = useState(0); // 0..1
  const src = `${AUDIOS_URL}/${audio.archivo}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = () => setProg(el.duration ? el.currentTime / el.duration : 0);
    const fin = () => setSonando(false);
    el.addEventListener("timeupdate", t);
    el.addEventListener("ended", fin);
    return () => {
      el.removeEventListener("timeupdate", t);
      el.removeEventListener("ended", fin);
    };
  }, []);

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (sonando) el.pause();
    else void el.play();
    setSonando(!sonando);
  }

  function saltar(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !el.duration) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - r.left) / r.width) * el.duration;
  }

  // Onda decorativa estable por audio
  const barras = Array.from({ length: 36 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * (audio.id === "EA1" ? 0.7 : 1.1) + 1)));

  return (
    <div className="overflow-hidden rounded-2xl border border-violet/40 bg-gradient-to-br from-violet/10 to-teal/5">
      <div className="flex items-center gap-3 p-4">
        <span className="text-3xl">{audio.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-violet">🎙️ {audio.codigo} · Entrevista privada (caucus)</p>
          <p className="truncate text-base font-semibold">{audio.quien}</p>
        </div>
        <a
          href={src}
          download
          className="shrink-0 rounded-lg border border-violet/50 bg-violet/10 px-3 py-1.5 text-sm font-semibold text-violet"
        >
          ⬇️ mp3
        </a>
      </div>
      <div className="flex items-center gap-3 px-4 pb-4">
        <button
          onClick={toggle}
          aria-label={sonando ? "Pausar" : "Reproducir"}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-teal to-cyan text-xl text-ink"
        >
          {sonando ? "❚❚" : "▶"}
        </button>
        <div onClick={saltar} className="flex h-12 flex-1 cursor-pointer items-center gap-[3px]">
          {barras.map((v, i) => {
            const activa = i / barras.length <= prog;
            return (
              <span
                key={i}
                className={cn("w-1.5 rounded-full transition-colors", activa ? "bg-teal" : "bg-line", sonando && activa && "onda")}
                style={{ height: `${8 + v * 34}px`, animationDelay: `${(i % 6) * 0.12}s` }}
              />
            );
          })}
        </div>
        <span className="shrink-0 font-mono text-sm text-faint">{audio.dur}</span>
      </div>
      <audio ref={ref} src={src} preload="metadata" />
      <details className="border-t border-line/50 px-4 py-3">
        <summary className="cursor-pointer text-sm font-semibold text-muted">📄 Transcripción oficial (si el audio no se escucha bien)</summary>
        <div className="mt-3 space-y-3">
          {audio.transcripcion.map((p, i) => (
            <div key={i}>
              <p className="text-xs font-bold uppercase tracking-wider text-violet">— {PREGUNTAS_ENTREVISTA[i]}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{p}</p>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

function Misiones() {
  const [elegida, setElegida] = useState<string | null>(null);
  return (
    <div className="space-y-2">
      {TAL_MISIONES.map((m) => {
        const on = elegida === m.id;
        return (
          <div key={m.id} className={cn("rounded-2xl border transition", on ? "border-teal bg-teal/10" : "border-line bg-ink-2/50")}>
            <button onClick={() => setElegida(on ? null : m.id)} className="flex w-full items-center gap-3 p-3.5 text-left">
              <span className="text-2xl">{m.emoji}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">
                  Misión {m.id} · {m.titulo}
                </span>
                <span className="block text-sm text-muted">{m.pregunta}</span>
              </span>
              <span className="shrink-0 text-xl text-faint">{on ? "−" : "+"}</span>
            </button>
            {on && (
              <div className="px-3.5 pb-3.5">
                <div className="mb-2 flex justify-end">
                  <BotonCopiar texto={m.texto} label="Copiar la misión" />
                </div>
                <pre className="whitespace-pre-wrap rounded-xl border border-line bg-ink/60 p-3 font-mono text-[12.5px] leading-relaxed">{m.texto}</pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
