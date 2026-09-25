"use client";

// Sala de control del Congreso · "Vibe coding para abogados" (la proyecta Marco).
// No es PowerPoint + app: es la misma app. La placa manda: al llegar a una
// interacción, la abre sola en los celulares (con reintentos); la portada pone
// "lobby"; las placas de contenido no cambian nada.
//
// Teclado (los clickers mandan PageDown/PageUp):
//   → Espacio PageDown Enter  avanzar (primero revela pasos/resultados de la placa)
//   ← PageUp Backspace  placa anterior · Home portada · End última
//   R mostrar/ocultar resultados · V ver frases · F pantalla completa
//   B o . pantalla en blanco · + − tamaño · Esc cerrar ventana/blanco
//   Los emojis que manda el público desde la botonera del celular suben por la pantalla.
//   Q QR fijo en el margen (sí/no) · C alto contraste para salas iluminadas (sí/no)
//   Shift+R reiniciar la sesión (borra participantes y respuestas: después de ensayar)
// Control remoto: /congreso/control (celular de Marco, con el guion de cada placa).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import { LluviaReacciones } from "@/components/clase/reacciones";
import { useRemotoDeck } from "@/components/clase/remoto";
import { useZoomDeck } from "@/components/clase/zoom";
import { etapasDe, Placa, type Ctx } from "@/components/congreso/deck-placas";
import { BotonPlaca, olvidarVivo, useVivo } from "@/components/congreso/deck-piezas";
import {
  actividadDeSlide,
  CONG_AUTOR,
  categoriasElegidas,
  promptAnonimizador,
  CONG_LINK,
  CONG_PLAN_B,
  CONG_QR,
  CONG_SLIDES,
  CONG_SLUG,
  CONG_TITLE,
  getActividadCong,
  tituloSlide,
  type EstadoCong,
} from "@/lib/congreso";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "congreso-clase-slide";
const TOTAL = CONG_SLIDES.length;

// --- Acceso docente ---------------------------------------------------------------------------

export default function CongresoClasePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/teacher/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setAuthed(Boolean(d.teacher)))
      .catch(() => setAuthed(false));
  }, []);
  if (authed === null)
    return (
      <main className="flex min-h-dvh flex-1 items-center justify-center">
        <p className="cg-mono text-xs uppercase tracking-[0.3em] text-cg-gris">Cargando…</p>
      </main>
    );
  if (!authed) return <Clave onOk={() => setAuthed(true)} />;
  return <Deck />;
}

function Clave({ onOk }: { onOk: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) onOk();
      else setErr("Clave incorrecta");
    } catch {
      setErr("Sin conexión. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="flex min-h-dvh flex-1 items-center justify-center px-6">
      <form onSubmit={entrar} className="cg-hoja cg-cae relative w-full max-w-[26rem] rounded-[0.2rem] px-8 pb-8 pt-10">
        <span className="cg-cinta absolute -top-3 left-1/2 h-7 w-32 -translate-x-1/2 -rotate-3" />
        <p className="cg-mono text-[11px] uppercase tracking-[0.26em] text-cg-sepia">Sala de control · {CONG_TITLE}</p>
        <h1 className="cg-titular mt-3 text-5xl text-cg-tinta">Clave</h1>
        <p className="cg-bajada mt-3 text-lg leading-snug text-cg-sepia">La presentación abre las preguntas en los celulares; por eso pide la clave.</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="clave"
          autoFocus
          autoComplete="current-password"
          className="mt-6 w-full border-b-2 border-cg-tinta bg-transparent py-2 cg-mono text-lg text-cg-tinta outline-none placeholder:text-cg-gris focus:border-cg-lacre"
        />
        {err && <p className="cg-mano mt-2 text-2xl leading-none text-cg-lacre">{err}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-6 w-full bg-cg-tinta py-3 cg-mono text-sm uppercase tracking-[0.22em] text-cg-blanco transition hover:bg-cg-sepia disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

// --- La sala de control --------------------------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "reintento" | "ok" | "clave" | "error" };

function nombreActividad(key: string) {
  if (key === "lobby") return "espera";
  const a = getActividadCong(key);
  return a ? `pregunta ${a.numero}` : key;
}

function Deck() {
  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), TOTAL - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [etapas, setEtapas] = useState<Record<number, number>>({});
  const [frases, setFrases] = useState(false);
  const [activacion, setActivacion] = useState<EstadoActivacion | null>(null);
  const [blanco, setBlanco] = useState(false);
  const [cursor, setCursor] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const [ventana, setVentana] = useState<string | null>(null);
  const [version, setVersion] = useState<Ctx["version"]>({ inicial: null, actual: null });
  const [planB, setPlanB] = useState(false);
  const [conectados, setConectados] = useState(0);
  // Sala iluminada: QR fijo en el margen y alto contraste, prendidos por defecto (teclas Q y C).
  const [margen, setMargen] = useState(() => leerPreferencia("congreso-margen", true));
  const [contraste, setContraste] = useState(() => leerPreferencia("congreso-contraste", true));
  const { zoom, aviso: avisoZoom } = useZoomDeck();

  const slide = CONG_SLIDES[idx];
  const etapa = etapas[idx] ?? 0;
  const maxEtapa = etapasDe(slide);

  preload(CONG_QR, { as: "image" });

  // La demo: lo que la sala eligió ocultar arma la instrucción del anonimizador.
  const elegir = useVivo("cong_elegir", 4000);
  const ocultar = useMemo(() => categoriasElegidas(elegir?.items.datos, elegir?.respondieronItem.datos ?? 0), [elegir]);
  const promptV1 = useMemo(() => promptAnonimizador(ocultar), [ocultar]);

  const go = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 0), TOTAL - 1);
    setIdx(next);
    setBlanco(false);
    setVentana(null);
    setFrases(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }, []);

  const setEtapa = useCallback((n: number) => setEtapas((e) => ({ ...e, [idx]: Math.max(0, Math.min(n, etapasDe(CONG_SLIDES[idx]))) })), [idx]);

  /** Avanzar: primero lo que la placa tiene para revelar; después, la placa siguiente. */
  const avanzar = useCallback(() => {
    if (etapa < maxEtapa) setEtapa(etapa + 1);
    else go(idx + 1);
  }, [etapa, maxEtapa, setEtapa, go, idx]);

  // --- Activación automática (con reintentos) ---
  const pedida = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const activar = useCallback((key: string, config?: Record<string, unknown>) => {
    pedida.current = key;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    let intento = 0;
    const probar = () => {
      if (pedida.current !== key) return;
      intento++;
      setActivacion({ key, status: intento === 1 ? "enviando" : "reintento" });
      const ctrl = new AbortController();
      const corte = setTimeout(() => ctrl.abort(), 7000);
      fetch(`/api/session/${CONG_SLUG}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: key, activity_config: config ?? {} }),
        signal: ctrl.signal,
      })
        .then((r) => {
          if (pedida.current !== key) return;
          if (r.ok) setActivacion({ key, status: "ok" });
          else if (r.status === 401) {
            pedida.current = null;
            setActivacion({ key, status: "clave" });
          } else throw new Error(String(r.status));
        })
        .catch(() => {
          if (pedida.current !== key) return;
          if (intento < 5) timers.current.push(setTimeout(probar, Math.min(8000, 700 * 2 ** (intento - 1))));
          else {
            pedida.current = null;
            setActivacion({ key, status: "error" });
          }
        })
        .finally(() => clearTimeout(corte));
    };
    probar();
  }, []);

  useEffect(() => {
    const t = timers;
    return () => {
      pedida.current = null;
      t.current.forEach(clearTimeout);
    };
  }, []);

  // Estado publicado: versión (para el experimento), plan B y qué hay abierto al recargar.
  useEffect(() => {
    let vivo = true;
    let primera = true;
    let inicial: string | null = null;
    let actual: string | null = null;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const r = await fetch("/api/congreso/estado", { cache: "no-store" });
        if (r.ok && vivo) {
          const d = (await r.json()) as EstadoCong;
          if (inicial === null) {
            inicial = actual = d.version;
            setVersion({ inicial, actual, cambio: d.cambio });
          } else if (actual !== d.version) {
            setAviso(`Nueva versión publicada · ${actual} → ${d.version}`);
            actual = d.version;
            setVersion({ inicial, actual, cambio: d.cambio, cuando: Date.now() });
          }
          setPlanB(d.actividad === CONG_PLAN_B.activity && d.config?.seguimiento === true);
          setConectados(d.conectados);
          if (primera && !pedida.current) {
            pedida.current = d.actividad;
            setActivacion({ key: d.actividad, status: "ok" });
          }
          primera = false;
        }
      } catch {
        /* reintenta */
      }
      if (vivo) timer = setTimeout(tick, 4000);
    }
    tick();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, []);

  // La placa manda: si trae una pregunta (o es la portada), se abre sola, una vez.
  useEffect(() => {
    const key = actividadDeSlide(slide);
    if (!key || pedida.current === key) return;
    activar(key);
  }, [slide, activar]);

  const togglePlanB = useCallback(() => {
    const nuevo = !planB;
    setPlanB(nuevo);
    activar(CONG_PLAN_B.activity, nuevo ? { seguimiento: true } : {});
    setAviso(nuevo ? "Plan B: los celulares ya piden “¿de qué depende?”" : "Plan B desactivado");
  }, [planB, activar]);

  // --- Reinicio (después de ensayar) ---
  const reiniciar = useCallback(async () => {
    if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes y sus respuestas.")) return;
    try {
      const r = await fetch(`/api/session/${CONG_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!r.ok) throw new Error();
      olvidarVivo();
      setEtapas({});
      setPlanB(false);
      pedida.current = "lobby";
      setActivacion({ key: "lobby", status: "ok" });
      const k = actividadDeSlide(CONG_SLIDES[idx]);
      if (k && k !== "lobby") activar(k);
      setAviso("Sesión reiniciada: sin participantes ni respuestas");
    } catch {
      setAviso("No se pudo reiniciar la sesión");
    }
  }, [idx, activar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 6000);
    return () => clearTimeout(t);
  }, [aviso]);

  // --- Teclado ---
  useEffect(() => {
    function pantallaCompleta() {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      else document.documentElement.requestFullscreen?.().catch(() => {});
    }
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const k = e.key;
      if (["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"].includes(k)) {
        e.preventDefault();
        avanzar();
      } else if (["ArrowLeft", "ArrowUp", "PageUp", "Backspace"].includes(k)) {
        e.preventDefault();
        go(idx - 1);
      } else if (k === "Home") {
        e.preventDefault();
        go(0);
      } else if (k === "End") {
        e.preventDefault();
        go(TOTAL - 1);
      } else if (k === "R" && e.shiftKey) {
        e.preventDefault();
        reiniciar();
      } else if (k === "r" || k === "R") {
        if (slide.t === "actividad" && maxEtapa > 0) setEtapa(etapa >= 1 ? 0 : 1);
      } else if (k === "v" || k === "V") setFrases((f) => !f);
      else if (k === "f" || k === "F") pantallaCompleta();
      else if (k === "q" || k === "Q")
        setMargen((m) => {
          guardarPreferencia("congreso-margen", !m);
          return !m;
        });
      else if (k === "c" || k === "C")
        setContraste((c) => {
          guardarPreferencia("congreso-contraste", !c);
          return !c;
        });
      else if (k === "b" || k === "B" || k === ".") setBlanco((v) => !v);
      else if (k === "Escape") {
        setBlanco(false);
        setVentana(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [avanzar, go, idx, reiniciar, slide, maxEtapa, etapa, setEtapa]);

  // --- Detalles de sala: el cursor se esconde solo y la pantalla no se apaga ---
  useEffect(() => {
    let t = setTimeout(() => setCursor(false), 2500);
    const mover = () => {
      setCursor(true);
      clearTimeout(t);
      t = setTimeout(() => setCursor(false), 2500);
    };
    window.addEventListener("mousemove", mover);
    return () => {
      window.removeEventListener("mousemove", mover);
      clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    type Lock = { release: () => Promise<void> };
    let lock: Lock | null = null;
    const pedir = () => {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<Lock> } }).wakeLock;
      wl?.request("screen")
        .then((l) => (lock = l))
        .catch(() => {});
    };
    pedir();
    const onVis = () => document.visibilityState === "visible" && pedir();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  // --- Control remoto: ▶ en el celular hace lo mismo que la flecha (revela antes de pasar) ---
  const irRemoto = useCallback((n: number) => (n === idx + 1 ? avanzar() : go(n)), [idx, avanzar, go]);
  useRemotoDeck({
    slug: CONG_SLUG,
    idx,
    total: TOTAL,
    titulo: tituloSlide(slide),
    parte: slide.movimiento,
    nota: slide.nota,
    go: irRemoto,
  });

  const ctx: Ctx = {
    etapa,
    setEtapa,
    frases,
    toggleFrases: () => setFrases((f) => !f),
    ocultar,
    promptV1,
    version,
    planB,
    togglePlanB,
    abrir: setVentana,
  };

  const sinPie = slide.t === "portada" || slide.t === "final";

  return (
    <div className={cn("deck-escala cong cg-papel relative flex h-dvh flex-col overflow-hidden select-none", contraste && "cg-contraste", !cursor && "cursor-none")}>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-cg-tinta/5">
        <div className="h-full bg-cg-lacre transition-[width] duration-500 ease-out" style={{ width: `${((idx + 1) / TOTAL) * 100}%` }} />
      </div>

      <IndicadorVivo estado={activacion} onReintentar={(k) => activar(k)} />

      {(avisoZoom || aviso) && (
        <div className="pointer-events-none fixed left-1/2 top-[1rem] z-50 -translate-x-1/2 rounded-full border border-cg-tinta/15 bg-cg-blanco/95 px-[1rem] py-[0.35rem] cg-mono text-[0.75rem] uppercase tracking-[0.16em] text-cg-tinta shadow-sm">
          {aviso ?? `Tamaño ${Math.round(zoom * 100)} %`}
        </div>
      )}

      <div className="flex min-h-0 flex-1">
      <main key={idx} className="rise relative min-h-0 min-w-0 flex-1">
        <Placa slide={slide} ctx={ctx} />
        {ventana && (
          <div className="absolute inset-x-[1.2rem] bottom-[0.6rem] top-[2.6rem] z-30 flex flex-col overflow-hidden rounded-[0.6rem] border border-cg-tinta/20 bg-cg-blanco shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)]">
            <div className="flex h-[2.6rem] shrink-0 items-center justify-between gap-[1rem] border-b border-cg-tinta/10 bg-cg-papel-2 px-[1rem]">
              <span className="cg-mono text-[0.75rem] text-cg-sepia">Herramienta real, en vivo · {ventana}</span>
              <BotonPlaca onClick={() => setVentana(null)} remoto="Cerrar la herramienta">
                Cerrar ✕
              </BotonPlaca>
            </div>
            <iframe
              src={ventana}
              title="Herramienta"
              className="min-h-0 flex-1 border-0 bg-white"
              onLoad={(e) => {
                // Con el foco adentro de la herramienta, el clicker y Esc siguen manejando la sala.
                try {
                  e.currentTarget.contentWindow?.addEventListener("keydown", (ev) => {
                    if (["Escape", "PageDown", "PageUp"].includes(ev.key)) {
                      ev.preventDefault();
                      window.dispatchEvent(new KeyboardEvent("keydown", { key: ev.key }));
                    }
                  });
                } catch {
                  /* otra origen: no se puede escuchar */
                }
              }}
            />
          </div>
        )}
      </main>
      {/* En las interacciones la placa ya trae su QR grande: el margen se guarda para darles el ancho a los resultados. */}
      {margen && slide.t !== "actividad" && <MargenQR conectados={conectados} conQR />}
      </div>

      {!sinPie && (
        <footer className="relative z-10 mx-[4.5rem] flex h-[2.8rem] shrink-0 items-center justify-between gap-[2rem] border-t border-cg-tinta/10 cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-gris">
          <span className="truncate">
            {CONG_TITLE} · {CONG_AUTOR} · {CONG_LINK}
          </span>
          <div className="flex shrink-0 items-center gap-[1.2rem]">
            <span className="hidden truncate md:block">{slide.movimiento}</span>
            <nav className="flex items-center gap-[0.2rem]" aria-label="Placas">
              <button type="button" onClick={() => go(idx - 1)} className="rounded px-[0.5rem] py-[0.2rem] transition hover:text-cg-tinta" aria-label="Anterior">
                ◀
              </button>
              <span className="tabular-nums text-cg-sepia">
                {String(idx + 1).padStart(2, "0")} / {TOTAL}
              </span>
              <button type="button" onClick={avanzar} className="rounded px-[0.5rem] py-[0.2rem] transition hover:text-cg-tinta" aria-label="Siguiente">
                ▶
              </button>
            </nav>
          </div>
        </footer>
      )}

      {/* Los emojis del público suben por la pantalla (quedan debajo del blanco). */}
      <LluviaReacciones slug={CONG_SLUG} />

      {blanco && <div className="cg-papel fixed inset-0 z-[60]" onClick={() => setBlanco(false)} />}
    </div>
  );
}

function leerPreferencia(clave: string, porDefecto: boolean): boolean {
  try {
    const v = localStorage.getItem(clave);
    return v === null ? porDefecto : v === "1";
  } catch {
    return porDefecto;
  }
}

function guardarPreferencia(clave: string, valor: boolean) {
  try {
    localStorage.setItem(clave, valor ? "1" : "0");
  } catch {}
}

/**
 * Margen de la foja: el QR para sumarse queda en todas las placas, negro puro
 * sobre blanco y grande, para que se escanee aunque el proyector esté lavado.
 * En las interacciones la placa ya trae su QR grande: acá queda solo el contador.
 */
function MargenQR({ conectados, conQR }: { conectados: number; conQR: boolean }) {
  return (
    <aside className="relative flex w-[12rem] shrink-0 flex-col justify-end border-l-[0.15rem] border-dashed border-cg-lacre/50 px-[1.2rem] pb-[1.2rem]">
      {conQR && (
        <>
          <p className="cg-titular text-[1.9rem] leading-none text-cg-tinta">Sumate</p>
          <p className="mt-[0.3rem] cg-mono text-[0.68rem] uppercase leading-snug tracking-[0.14em] text-cg-sepia">Sin registro · sin nombre</p>
          <div className="mt-[0.8rem] aspect-square w-full border-[0.2rem] border-black bg-white p-[0.45rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={CONG_QR} alt={`Código QR: ${CONG_LINK}`} className="h-full w-full [image-rendering:pixelated]" />
          </div>
          <p className="mt-[0.6rem] break-all cg-mono text-[0.86rem] font-semibold leading-tight text-cg-tinta">{CONG_LINK}</p>
        </>
      )}
      <p className="mt-[0.8rem] flex items-baseline gap-[0.4rem] cg-mono text-[0.72rem] uppercase tracking-[0.14em] text-cg-sepia">
        <span className="cg-titular text-[1.6rem] normal-case tracking-normal text-cg-tinta tabular-nums">{conectados}</span>
        conectados
      </p>
    </aside>
  );
}

/** Arriba a la derecha: qué está abierto en los celulares. */
function IndicadorVivo({ estado, onReintentar }: { estado: EstadoActivacion | null; onReintentar: (key: string) => void }) {
  if (!estado) return null;
  const mal = estado.status === "error" || estado.status === "clave";
  const texto =
    estado.status === "ok"
      ? `Celulares: ${nombreActividad(estado.key)}`
      : estado.status === "enviando"
        ? `Abriendo ${nombreActividad(estado.key)}…`
        : estado.status === "reintento"
          ? `Reintentando ${nombreActividad(estado.key)}…`
          : estado.status === "clave"
            ? "No se pudo abrir · la clave venció, recargá"
            : "No se pudo abrir · tocá para reintentar";
  return (
    <button
      type="button"
      onClick={() => estado.status === "error" && onReintentar(estado.key)}
      className={cn(
        "fixed right-[1.2rem] top-[0.9rem] z-40 flex items-center gap-[0.5rem] rounded-full border px-[0.8rem] py-[0.3rem] cg-mono text-[0.66rem] uppercase tracking-[0.16em] transition",
        mal ? "border-cg-lacre/40 bg-cg-blanco text-cg-lacre" : "border-cg-tinta/10 bg-cg-blanco/70 text-cg-sepia",
      )}
    >
      <span className={cn("size-[0.45rem] rounded-full", mal ? "bg-cg-lacre" : estado.status === "ok" ? "bg-cg-salvia" : "cg-pulso bg-cg-ocre")} />
      {texto}
    </button>
  );
}
