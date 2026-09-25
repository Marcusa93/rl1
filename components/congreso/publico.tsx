"use client";

// App del público — Congreso · "Vibe coding para abogados" (Marco Rossi).
//
// Un QR, sin registro, sin nombre: al abrirla ya está adentro (una cookie
// identifica al celular). Sigue sola la interacción que abre la pantalla
// grande; cada toque se envía al instante y, si la red falla, reintenta.
//
// Si se publica una versión nueva de la app mientras la charla está en curso
// (el experimento de modificarla en vivo), el celular se actualiza solo y avisa.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CONG_ACTIVIDADES,
  CONG_SLIDES,
  CONG_SLUG,
  getActividadCong,
  itemSeguimiento,
  seguimientoDe,
  tituloSlide,
  type EstadoCong,
} from "@/lib/congreso";
import {
  AvisoGuardado,
  Encabezado,
  EstilosPublico,
  Espera,
  Girando,
  PreguntaCasos,
  PreguntaTexto,
  PreguntaUnica,
  Toast,
  vibrar,
  type EstadoGuardado,
  type Resp,
} from "./publico-ui";
import { BotoneraCongreso } from "./reacciones";

const POLL_MS = 2800;
const TOTAL = CONG_ACTIVIDADES.length;
const IDX_REVELACION = CONG_SLIDES.findIndex((s) => s.t === "revelacion");
const MARCA_ACTUALIZADA = "cong-actualizada";

type Respuestas = Record<string, Resp>;
type Pendiente = { a: string; i: string; v: string };

function esperar(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

/** fetch con tiempo máximo: en un auditorio la red se cae y nada puede quedar colgado. */
async function pedir(url: string, init?: RequestInit, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { cache: "no-store", ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

async function entrar(): Promise<boolean> {
  try {
    const r = await pedir("/api/congreso/entrar", { method: "POST" }, 9000);
    return r.ok;
  } catch {
    return false;
  }
}

/** "ok" | "401" (hay que volver a entrar) | "error" (reintentar más tarde) | "descartar". */
async function postear(p: Pendiente): Promise<"ok" | "401" | "error" | "descartar"> {
  try {
    const r = await pedir(
      `/api/session/${CONG_SLUG}/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity: p.a, item_key: p.i, payload: { v: p.v } }),
        keepalive: true,
      },
      8000,
    );
    if (r.ok) return "ok";
    if (r.status === 401) return "401";
    if (r.status >= 400 && r.status < 500 && r.status !== 408 && r.status !== 429) return "descartar";
  } catch {
    /* red */
  }
  return "error";
}

export function PublicoCongreso() {
  const [adentro, setAdentro] = useState(false);
  const [estado, setEstado] = useState<EstadoCong | null>(null);
  const [fallos, setFallos] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [restaurado, setRestaurado] = useState(false);
  const [guardado, setGuardado] = useState<EstadoGuardado>("nada");
  // ¿Venimos de una actualización en vivo? Avisar (una vez). Solo se ve ya adentro, después de hidratar.
  const [toast, setToast] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return sessionStorage.getItem(MARCA_ACTUALIZADA) ? "Esta app acaba de cambiar mientras la usabas." : null;
    } catch {
      return null;
    }
  });
  useEffect(() => {
    try {
      sessionStorage.removeItem(MARCA_ACTUALIZADA);
    } catch {
      /* sin storage */
    }
  }, []);

  const pendientes = useRef(new Map<string, Pendiente>());
  const enVuelo = useRef(false);
  const escrituras = useRef(0);
  const guardadoT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const version = useRef<string | null>(null);

  /** Mis respuestas guardadas (al entrar, al cambiar de pregunta y cada tanto). */
  const sincronizar = useCallback(async () => {
    const seq = escrituras.current;
    try {
      const r = await pedir(`/api/session/${CONG_SLUG}/my-responses`);
      if (!r.ok) return;
      const d = (await r.json()) as { name: string | null; responses?: { activity: string; item_key: string; payload: { v?: unknown } | null }[] };
      if (seq !== escrituras.current) return;
      if (!d.name) {
        // La sesión se reinició (después de un ensayo): volver a entrar en silencio.
        if (await entrar()) setRespuestas({});
        return;
      }
      const nuevo: Respuestas = {};
      for (const x of d.responses ?? []) {
        const v = x.payload?.v;
        if (typeof v === "string") (nuevo[x.activity] ??= {})[x.item_key] = v;
      }
      for (const p of pendientes.current.values()) (nuevo[p.a] ??= {})[p.i] = p.v;
      setRespuestas(nuevo);
    } catch {
      /* se queda lo local */
    } finally {
      setRestaurado(true);
    }
  }, []);

  /** Envía todo lo pendiente, de a uno. */
  const enviarPendientes = useCallback(async () => {
    if (enVuelo.current || !pendientes.current.size) return;
    enVuelo.current = true;
    clearTimeout(guardadoT.current);
    setGuardado("guardando");
    let error = false;
    try {
      // Vueltas hasta vaciar la cola (si llega algo nuevo mientras se envía, sale en la próxima).
      for (let vuelta = 0; vuelta < 4 && pendientes.current.size && !error; vuelta++) {
        for (const [k, p] of [...pendientes.current]) {
          let res = await postear(p);
          if (res === "401" && (await entrar())) res = await postear(p);
          if (res === "error") {
            await esperar(800);
            res = await postear(p);
          }
          if (res === "ok" || res === "descartar") {
            if (pendientes.current.get(k) === p) pendientes.current.delete(k);
          } else error = true;
        }
      }
    } finally {
      enVuelo.current = false;
    }
    if (error) {
      setGuardado("error");
      return;
    }
    setGuardado("guardado");
    guardadoT.current = setTimeout(() => setGuardado((g) => (g === "guardado" ? "nada" : g)), 1600);
  }, []);

  const guardar = useCallback(
    (a: string, i: string, v: string) => {
      escrituras.current++;
      pendientes.current.set(`${a}|${i}`, { a, i, v });
      setRespuestas((prev) => ({ ...prev, [a]: { ...prev[a], [i]: v } }));
      void enviarPendientes();
    },
    [enviarPendientes],
  );

  // Entrar (sin nombre) y traer lo que ya había respondido.
  useEffect(() => {
    let vivo = true;
    (async () => {
      for (let intento = 0; vivo; intento++) {
        if (await entrar()) {
          if (!vivo) return;
          setAdentro(true);
          await sincronizar();
          return;
        }
        if (!vivo) return;
        setFallos((f) => f + 1);
        await esperar(Math.min(1000 * 2 ** intento, 8000));
      }
    })();
    return () => {
      vivo = false;
    };
  }, [sincronizar]);

  // Estado de la charla: qué pregunta está abierta, qué placa se ve, qué versión está publicada.
  useEffect(() => {
    let vivo = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let ultima: string | null = null;
    let ciclos = 0;

    const programar = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(tick, ms);
    };

    async function tick() {
      if (!vivo) return;
      const oculta = document.visibilityState === "hidden";
      try {
        const r = await pedir("/api/congreso/estado", undefined, 6000);
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as EstadoCong;
        if (!vivo) return;

        // Versión nueva publicada: mandar lo pendiente y recargar con la app nueva.
        if (version.current === null) version.current = d.version;
        else if (d.version !== version.current) {
          if (pendientes.current.size) await enviarPendientes();
          try {
            sessionStorage.setItem(MARCA_ACTUALIZADA, d.version);
          } catch {
            /* sin storage */
          }
          window.location.reload();
          return;
        }

        setEstado((s) =>
          s &&
          s.actividad === d.actividad &&
          s.placa === d.placa &&
          s.conectados === d.conectados &&
          JSON.stringify(s.config) === JSON.stringify(d.config)
            ? s
            : d,
        );
        setFallos(0);
        ciclos++;
        if (ultima !== null && ultima !== d.actividad) {
          if (getActividadCong(d.actividad)) vibrar(30);
          void sincronizar();
        } else if (ciclos % 12 === 0) void sincronizar();
        ultima = d.actividad;
        if (pendientes.current.size) void enviarPendientes();
      } catch {
        if (vivo) setFallos((f) => f + 1);
      }
      if (vivo) programar(oculta ? POLL_MS * 4 : POLL_MS);
    }

    const alCambiarVisibilidad = () => {
      if (document.visibilityState === "visible") programar(0);
    };
    const alVolverRed = () => programar(0);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    window.addEventListener("online", alVolverRed);
    programar(0);
    return () => {
      vivo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      window.removeEventListener("online", alVolverRed);
    };
  }, [sincronizar, enviarPendientes]);

  const cerrarToast = useCallback(() => setToast(null), []);
  const reconectando = fallos >= 2;

  if (!adentro || !estado || !restaurado) {
    return (
      <>
        <EstilosPublico />
        <main className="grid min-h-dvh place-items-center px-6">
          <div className="text-center">
            <p className="cg-titular text-4xl text-cg-tinta">Vibe coding</p>
            <p className="cg-bajada mt-1 text-xl text-cg-sepia">para abogados</p>
            <div className="mt-10">
              <Girando texto={reconectando ? "buscando señal…" : "entrando…"} />
            </div>
          </div>
        </main>
      </>
    );
  }

  const act = getActividadCong(estado.actividad);
  const slide = estado.placa != null ? CONG_SLIDES[estado.placa] : undefined;
  const enPantalla = slide ? tituloSlide(slide) : null;
  const revelado = estado.placa != null && IDX_REVELACION >= 0 && estado.placa >= IDX_REVELACION;
  const hechas = CONG_ACTIVIDADES.filter((a) => {
    const r = respuestas[a.key] ?? {};
    return a.tipo === "texto" ? Boolean(r.texto) : a.items.every((it) => r[it.id]);
  }).length;
  const planB = estado.config?.seguimiento === true;

  let contenido: React.ReactNode;
  if (!act) {
    contenido = <Espera enPantalla={enPantalla} conectados={estado.conectados} hechas={hechas} total={TOTAL} revelado={revelado} />;
  } else if (act.tipo === "texto") {
    contenido = (
      <PreguntaTexto
        key={act.key}
        act={act}
        total={TOTAL}
        valor={respuestas[act.key]?.texto ?? ""}
        onEnviar={(t) => guardar(act.key, "texto", t)}
      />
    );
  } else if (act.items.length > 1) {
    contenido = <PreguntaCasos key={act.key} act={act} total={TOTAL} resp={respuestas[act.key] ?? {}} onElegir={(i, o) => guardar(act.key, i, o)} />;
  } else {
    contenido = (
      <PreguntaUnica
        key={act.key}
        act={act}
        total={TOTAL}
        item={act.items[0]}
        resp={respuestas[act.key] ?? {}}
        seguimiento={(itemId, opcionId) => {
          const it = act.items.find((x) => x.id === itemId);
          const op = it?.opciones.find((o) => o.id === opcionId);
          return op ? seguimientoDe(act, itemId, op, planB) : undefined;
        }}
        onElegir={(i, o) => {
          vibrar(12);
          // En la selección múltiple, cambios rápidos: se envía el último estado (sin vacíos).
          guardar(act.key, i, o);
        }}
        onSeguimiento={(i, t) => guardar(act.key, itemSeguimiento(i), t)}
      />
    );
  }

  return (
    <>
      <EstilosPublico />
      <Encabezado centro={act ? `Pregunta ${act.numero} de ${TOTAL}` : "Mirá la pantalla"} reconectando={reconectando} />
      {toast && <Toast texto={toast} onCerrar={cerrarToast} />}
      <AvisoGuardado estado={guardado} onReintentar={() => void enviarPendientes()} />
      <main className="mx-auto w-full max-w-md flex-1 overflow-x-clip px-5 pb-[calc(env(safe-area-inset-bottom)+8rem)] pt-6">
        {contenido}
      </main>
      <BotoneraCongreso />
    </>
  );
}
