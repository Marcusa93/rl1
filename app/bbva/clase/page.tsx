"use client";

// Presentación del Laboratorio de IA · BBVA (clase inicial, 25/09/2026).
// La proyecta Marco; los participantes responden desde /bbva con un único QR.
//
// La placa manda: al llegar a una placa de actividad, la abre sola en los
// celulares (POST /api/session/bbva-lab/activity, con reintentos). Portada e
// ingreso ponen "lobby". Las placas de contenido no cambian nada: los que
// vienen atrasados pueden terminar mientras Marco sigue.
//
// Teclado (también clickers: mandan PageDown/PageUp):
//   → Espacio PageDown Enter  siguiente      ← PageUp Backspace  anterior
//   Home portada · End última · R mostrar/ocultar resultados · A por área
//   F pantalla completa · B o . pantalla en blanco · + − tamaño
//   Shift+R reiniciar la sesión (borra participantes y respuestas: después de ensayar)
// Control remoto: /bbva/control (celular de Marco, con su ayuda memoria).

import { useCallback, useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { useRemotoDeck } from "@/components/clase/remoto";
import { useZoomDeck } from "@/components/clase/zoom";
import { CON_POR_AREA, Placa } from "@/components/bbva/deck-placas";
import { olvidarVivo, vars } from "@/components/bbva/deck-piezas";
import {
  actividadDeSlide,
  BBVA_AUTOR,
  BBVA_LOGO,
  BBVA_QR,
  BBVA_SLIDES,
  BBVA_SLUG,
  BBVA_TITLE,
  getActividadBbva,
  resultadosDeSlide,
  tituloSlide,
  type SlideBbva,
} from "@/lib/bbva-clase";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "bbva-clase-slide";
const TOTAL = BBVA_SLIDES.length;

// --- Acceso docente ---------------------------------------------------------------------

export default function BbvaClasePage() {
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
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gris">Cargando…</p>
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
      <form
        onSubmit={entrar}
        className="bbva-recorte bbva-cae relative w-full max-w-[26rem] px-8 pb-8 pt-10"
        style={vars({ "--rot": "-0.8deg" })}
      >
        <span className="bbva-cinta absolute -top-3 left-1/2 h-7 w-32 -translate-x-1/2 -rotate-3" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BBVA_LOGO} alt="BBVA" className="h-7 w-auto mix-blend-multiply" />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.28em] text-gris">Presentación · {BBVA_TITLE}</p>
        <h1 className="bbva-titular mt-2 text-5xl text-tinta">Clave docente</h1>
        <p className="bbva-serif mt-3 text-lg italic leading-snug text-grafito">
          La presentación abre las actividades en los celulares por su cuenta; por eso pide la clave.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="clave"
          autoFocus
          autoComplete="current-password"
          className="mt-6 w-full border-b-2 border-tinta bg-transparent py-2 font-mono text-lg text-tinta outline-none placeholder:text-gris focus:border-naranja"
        />
        {err && <p className="bbva-mano mt-2 text-2xl leading-none text-rojo">{err}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-6 w-full bg-tinta py-3 font-mono text-sm uppercase tracking-[0.22em] text-papel transition hover:bg-grafito disabled:opacity-50"
        >
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </main>
  );
}

// --- La presentación -------------------------------------------------------------------------

type EstadoActivacion = { key: string; status: "enviando" | "reintento" | "ok" | "clave" | "error" | "espera" };

/** Qué actividad pone la placa al llegar (portada/ingreso → lobby; el resto, la suya o ninguna). */
function actividadAlLlegar(s: SlideBbva): string | undefined {
  if (s.t === "portada" || s.t === "ingreso") return "lobby";
  return actividadDeSlide(s);
}

function nombreActividad(key: string) {
  if (key === "lobby") return "ingreso";
  const a = getActividadBbva(key);
  return a ? `Actividad ${a.numero}` : key;
}

const CANDADO = "bbva-clase-deck";

/**
 * Si el deck queda abierto en dos pestañas (un ensayo olvidado, otra ventana), manda una sola:
 * la última que se abrió o que se tocó. Las demás siguen la placa (localStorage) pero no abren
 * actividades ni obedecen al control remoto: si no, una pestaña atrasada podía ejecutar los
 * comandos del celular a destiempo y reabrir una actividad vieja en todos los celulares.
 */
function useLider(): boolean | null {
  // null: todavía no se sabe (dura milisegundos, hasta que el navegador entrega el candado).
  const [lider, setLider] = useState<boolean | null>(() =>
    typeof navigator === "undefined" || !(navigator as Navigator & { locks?: LockManager }).locks?.request ? true : null,
  );

  useEffect(() => {
    const locks = (navigator as Navigator & { locks?: LockManager }).locks;
    if (!locks?.request) return; // sin Web Locks: como antes, esta pestaña manda (estado inicial)
    let vivo = true;
    let tengo = false;
    let gen = 0;
    let soltar: (() => void) | null = null;
    let enFila: AbortController | null = null;

    const pedir = (robar: boolean) => {
      const mio = ++gen;
      enFila?.abort();
      enFila = robar ? null : new AbortController();
      locks
        .request(CANDADO, enFila ? { signal: enFila.signal } : { steal: true }, () => {
          if (!vivo) return;
          tengo = true;
          setLider(true);
          return new Promise<void>((res) => (soltar = res));
        })
        .catch(() => {
          // Otra pestaña tomó la presentación (o este pedido quedó reemplazado por uno nuevo).
          if (!vivo || mio !== gen) return;
          tengo = false;
          soltar = null;
          setLider(false);
          pedir(false); // queda en la fila: si la otra pestaña se cierra, esta vuelve a mandar
        });
    };

    pedir(true);
    const tomar = () => {
      if (!tengo) pedir(true);
    };
    window.addEventListener("focus", tomar);
    window.addEventListener("pointerdown", tomar, true);
    window.addEventListener("keydown", tomar, true);
    return () => {
      vivo = false;
      window.removeEventListener("focus", tomar);
      window.removeEventListener("pointerdown", tomar, true);
      window.removeEventListener("keydown", tomar, true);
      enFila?.abort();
      soltar?.();
    };
  }, []);

  return lider;
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
  const [revelado, setRevelado] = useState<Record<number, boolean>>({});
  const [porArea, setPorArea] = useState<Record<number, boolean>>({});
  const [activacion, setActivacion] = useState<EstadoActivacion | null>(null);
  const [blanco, setBlanco] = useState(false);
  const [cursor, setCursor] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const { zoom, aviso: avisoZoom } = useZoomDeck();

  const slide = BBVA_SLIDES[idx];
  const claveResultados = resultadosDeSlide(slide);
  const conArea = claveResultados ? CON_POR_AREA.includes(claveResultados) : false;

  // Las imágenes que se usan en varias placas, listas desde el principio.
  preload(BBVA_QR, { as: "image" });
  preload(BBVA_LOGO, { as: "image" });

  const go = useCallback((n: number) => {
    const next = Math.min(Math.max(n, 0), TOTAL - 1);
    setIdx(next);
    setBlanco(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {}
  }, []);

  const esLider = useLider();
  const lider = esLider === true;

  // --- Activación automática ---
  // Un pedido por vez y en orden: al pasar rápido por dos placas que activan (ej. ← desde la
  // actividad 1 hasta el ingreso) los dos POST viajaban juntos y podían llegar al revés.
  // Y sin rendirse: si la red del aula se cae, sigue reintentando mientras la placa lo pida.
  const pedida = useRef<string | null>(null);
  const sinConfirmar = useRef<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const cola = useRef<Promise<unknown>>(Promise.resolve());

  const activar = useCallback((key: string) => {
    pedida.current = key;
    sinConfirmar.current = key;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActivacion({ key, status: "enviando" });
    let intento = 0;
    const probar = async () => {
      if (pedida.current !== key) return;
      intento++;
      if (intento > 1 && intento <= 5) setActivacion({ key, status: "reintento" });
      const ctrl = new AbortController();
      const corte = setTimeout(() => ctrl.abort(), 7000);
      try {
        const r = await fetch(`/api/session/${BBVA_SLUG}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ current_activity: key }),
          signal: ctrl.signal,
        });
        if (pedida.current !== key) return;
        if (r.ok) {
          sinConfirmar.current = null;
          setActivacion({ key, status: "ok" });
          return;
        }
        if (r.status === 401) {
          // La cookie docente venció: reintentar no sirve.
          pedida.current = null;
          sinConfirmar.current = null;
          setActivacion({ key, status: "clave" });
          return;
        }
      } catch {
        /* red caída o sin respuesta */
      } finally {
        clearTimeout(corte);
      }
      if (pedida.current !== key) return;
      if (intento >= 5) setActivacion({ key, status: "error" });
      timers.current.push(setTimeout(encolar, Math.min(8000, 700 * 2 ** (intento - 1))));
    };
    const encolar = () => {
      cola.current = cola.current.then(probar);
    };
    encolar();
  }, []);

  useEffect(() => {
    const t = timers;
    return () => {
      pedida.current = null;
      t.current.forEach(clearTimeout);
    };
  }, []);

  // Esta pestaña dejó de mandar: corta sus reintentos (los hace la pestaña que manda).
  useEffect(() => {
    if (lider) return;
    pedida.current = null;
    sinConfirmar.current = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, [lider]);

  // Volvió la red: reintentar ya lo que no se pudo abrir.
  useEffect(() => {
    const alVolver = () => {
      const k = sinConfirmar.current;
      if (lider && k && pedida.current === k) activar(k);
    };
    window.addEventListener("online", alVolver);
    return () => window.removeEventListener("online", alVolver);
  }, [lider, activar]);

  // Otra pestaña del deck cambió de placa: esta la sigue (nunca quedan dos placas distintas).
  useEffect(() => {
    const alCambiar = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY || e.newValue === null) return;
      const v = parseInt(e.newValue, 10);
      if (Number.isFinite(v)) setIdx(Math.min(Math.max(v, 0), TOTAL - 1));
    };
    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  // Al abrir (o recargar) la presentación en una placa sin actividad: mostrar qué hay abierto en los celulares.
  useEffect(() => {
    fetch(`/api/session/${BBVA_SLUG}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { session?: { current_activity?: string } } | null) => {
        const key = d?.session?.current_activity;
        if (!key || pedida.current) return;
        pedida.current = key;
        setActivacion({ key, status: "ok" });
      })
      .catch(() => {});
  }, []);

  // La placa manda: si trae actividad (o es portada/ingreso), se abre sola, una vez.
  // Con una pausa corta: si Marco pasa de largo (varias flechas seguidas, ej. volviendo de la
  // actividad 3 a la placa 04), la actividad 2 del camino no se reabre en los celulares.
  useEffect(() => {
    if (!lider) return;
    const key = actividadAlLlegar(slide);
    if (!key || pedida.current === key) return;
    const t = setTimeout(() => {
      if (pedida.current !== key) activar(key);
    }, 600);
    return () => clearTimeout(t);
  }, [slide, activar, lider]);

  // --- Resultados ---
  const toggleRevelar = useCallback(() => {
    if (!resultadosDeSlide(BBVA_SLIDES[idx])) return;
    setRevelado((r) => ({ ...r, [idx]: !r[idx] }));
  }, [idx]);

  const togglePorArea = useCallback(() => {
    const k = resultadosDeSlide(BBVA_SLIDES[idx]);
    if (!k || !CON_POR_AREA.includes(k)) return;
    const nuevo = !porArea[idx];
    setPorArea((p) => ({ ...p, [idx]: nuevo }));
    // Pedir el corte por área también muestra el resultado.
    if (nuevo) setRevelado((r) => ({ ...r, [idx]: true }));
  }, [idx, porArea]);

  // --- Reinicio (después de ensayar) ---
  const reiniciar = useCallback(async () => {
    if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes y sus respuestas.")) return;
    // Que ninguna activación vieja quede en viaje y llegue después del reinicio.
    pedida.current = null;
    sinConfirmar.current = null;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    await cola.current;
    try {
      const r = await fetch(`/api/session/${BBVA_SLUG}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (!r.ok) throw new Error();
      olvidarVivo();
      setRevelado({});
      setPorArea({});
      pedida.current = "lobby";
      setActivacion({ key: "lobby", status: "ok" });
      const k = actividadDeSlide(BBVA_SLIDES[idx]);
      if (k) activar(k);
      setAviso("Sesión reiniciada: sin participantes ni respuestas");
    } catch {
      setAviso("No se pudo reiniciar la sesión");
      const k = actividadAlLlegar(BBVA_SLIDES[idx]);
      if (k) activar(k);
    }
  }, [idx, activar]);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3200);
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
        go(idx + 1);
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
      } else if (k === "r" || k === "R") toggleRevelar();
      else if (k === "a" || k === "A") togglePorArea();
      else if (k === "f" || k === "F") pantallaCompleta();
      else if (k === "b" || k === "B" || k === ".") setBlanco((v) => !v);
      else if (k === "Escape") setBlanco(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx, reiniciar, toggleRevelar, togglePorArea]);

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

  // --- Control remoto desde el celular de Marco ---
  useRemotoDeck({
    slug: BBVA_SLUG,
    idx,
    total: TOTAL,
    titulo: tituloSlide(slide),
    parte: slide.bloque,
    nota: slide.nota,
    go,
    activo: lider,
  });

  const esPortada = slide.t === "portada";

  return (
    <div className={cn("deck-escala bbva bbva-papel relative flex h-dvh flex-col overflow-hidden select-none", !cursor && "cursor-none")}>
      {/* Progreso: una línea fina arriba. */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 h-[3px] bg-tinta/5">
        <div className="h-full bg-naranja transition-[width] duration-500 ease-out" style={{ width: `${((idx + 1) / TOTAL) * 100}%` }} />
      </div>

      <IndicadorVivo estado={esLider === false ? { key: "", status: "espera" } : activacion} onReintentar={activar} />

      {(avisoZoom || aviso) && (
        <div className="pointer-events-none fixed left-1/2 top-[1rem] z-50 -translate-x-1/2 rounded-full border border-tinta/15 bg-blanco/95 px-[1rem] py-[0.35rem] font-mono text-[0.75rem] uppercase tracking-[0.16em] text-tinta shadow-sm">
          {aviso ?? `Tamaño ${Math.round(zoom * 100)} %`}
        </div>
      )}

      <main key={idx} className="rise relative min-h-0 flex-1">
        <Placa
          slide={slide}
          revelado={Boolean(revelado[idx])}
          porArea={conArea && Boolean(porArea[idx])}
          onRevelar={toggleRevelar}
          onPorArea={togglePorArea}
        />
      </main>

      {!esPortada && (
        <footer className="relative z-10 mx-[4.5rem] flex h-[3rem] shrink-0 items-center justify-between gap-[2rem] border-t border-tinta/10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-gris">
          <div className="flex min-w-0 items-center gap-[0.8rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={BBVA_LOGO} alt="BBVA" className="h-[0.95rem] w-auto opacity-80 mix-blend-multiply" />
            <span className="h-[0.9rem] w-px bg-grafito/25" />
            <span className="truncate">
              {BBVA_TITLE} · {BBVA_AUTOR}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-[1.2rem]">
            <span className="hidden truncate md:block">{slide.bloque}</span>
            <nav className="flex items-center gap-[0.2rem]" aria-label="Placas">
              <button type="button" onClick={() => go(idx - 1)} className="rounded px-[0.5rem] py-[0.2rem] transition hover:text-tinta" aria-label="Anterior">
                ◀
              </button>
              <span className="tabular-nums text-grafito">
                {String(idx + 1).padStart(2, "0")} / {TOTAL}
              </span>
              <button type="button" onClick={() => go(idx + 1)} className="rounded px-[0.5rem] py-[0.2rem] transition hover:text-tinta" aria-label="Siguiente">
                ▶
              </button>
            </nav>
          </div>
        </footer>
      )}

      {/* Pantalla en blanco (B): la atención vuelve a Marco. */}
      {blanco && <div className="bbva-papel fixed inset-0 z-[60]" onClick={() => setBlanco(false)} />}
    </div>
  );
}

/** Arriba a la derecha: qué está abierto en los celulares. */
function IndicadorVivo({ estado, onReintentar }: { estado: EstadoActivacion | null; onReintentar: (key: string) => void }) {
  if (!estado) return null;
  const mal = estado.status === "error" || estado.status === "clave";
  const texto =
    estado.status === "ok"
      ? `En vivo: ${nombreActividad(estado.key)}`
      : estado.status === "enviando"
        ? `Abriendo ${nombreActividad(estado.key)}…`
        : estado.status === "reintento"
          ? `Reintentando ${nombreActividad(estado.key)}…`
          : estado.status === "clave"
            ? "No se pudo activar · la clave venció, recargá"
            : estado.status === "espera"
              ? "Otra pestaña maneja la clase · tocá para usar esta"
              : `No abre ${nombreActividad(estado.key)} · sigo intentando (tocá)`;
  return (
    <button
      type="button"
      onClick={() => estado.status === "error" && onReintentar(estado.key)}
      className={cn(
        "fixed right-[1.2rem] top-[0.9rem] z-40 flex items-center gap-[0.5rem] rounded-full border px-[0.8rem] py-[0.3rem] font-mono text-[0.68rem] uppercase tracking-[0.16em] transition",
        mal ? "border-rojo/40 bg-blanco text-rojo" : "border-tinta/10 bg-blanco/70 text-grafito",
        estado.status !== "error" && "cursor-default",
      )}
    >
      <span
        className={cn(
          "size-[0.45rem] rounded-full",
          mal ? "bg-rojo" : estado.status === "ok" ? "animate-pulse bg-naranja" : "animate-ping bg-gris",
        )}
      />
      {texto}
    </button>
  );
}
