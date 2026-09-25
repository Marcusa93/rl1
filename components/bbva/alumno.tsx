"use client";

// App del participante — Laboratorio de IA · BBVA (clase inicial, Marco Rossi).
//
// Un único QR para toda la hora: se entra UNA vez eligiendo el área (sin nombre)
// y el celular sigue solo lo que Marco activa desde la presentación. Cada toque
// se guarda al instante; si la red falla, reintenta en silencio y avisa chiquito.
//
//   ingreso → espera ("Mirá la pantalla") ⇄ actividades 1–5 → tarjeta + hipótesis
//
// Estado de la sesión: polling a /api/session/bbva-lab (actividad activa + placa).
// Respuestas: /respond { activity, item_key, payload: { v } }, restauradas con /my-responses.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BBVA_ACTIVIDADES,
  BBVA_SLIDES,
  BBVA_SLUG,
  getActividadBbva,
  getArea,
  tituloSlide,
  type ActividadBbva,
  type Area,
} from "@/lib/bbva-clase";
import { Actividad1, Actividad3, ActividadCasos } from "./alumno-actividades";
import { Actividad5 } from "./alumno-candidato";
import { AvisoGuardado, Cargando, Encabezado, Espera, Ingreso, type EstadoGuardado } from "./alumno-pantallas";
import { EstilosAlumno, Girando, esperar, respondido, type Valor } from "./alumno-ui";

const BASE = `/api/session/${BBVA_SLUG}`;
const POLL_MS = 2500;
/** Cada cuántos ciclos (~30 s) se verifica que la sesión siga y se refrescan las respuestas propias. */
const VERIFICAR_CADA = 12;

type Participante = { id: string; name: string };
type Sesion = { actividad: string; placaIdx: number | null; conectados: number };
type Respuestas = Record<string, Record<string, Valor>>;
type Pendiente = { a: string; i: string; v: Valor };
type Resultado = "ok" | "401" | "descartar" | "error";

/** fetch con timeout (en el aula la red se cae; nunca dejamos una promesa colgada). */
async function pedir(url: string, init?: RequestInit, ms = 7000): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { cache: "no-store", ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

/** Manda una respuesta; si falla la red, reintenta una vez. */
async function postear(p: Pendiente): Promise<Resultado> {
  for (let intento = 0; intento < 2; intento++) {
    try {
      const r = await pedir(
        `${BASE}/respond`,
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
      /* red caída o timeout */
    }
    if (intento === 0) await esperar(900);
  }
  return "error";
}

function vibrar(patron: number | number[]) {
  try {
    navigator.vibrate?.(patron);
  } catch {
    /* no todos los celulares vibran */
  }
}

export function AlumnoBbva() {
  const [me, setMe] = useState<Participante | null | undefined>(undefined);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [fallos, setFallos] = useState(0);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [restaurado, setRestaurado] = useState(false);
  const [guardado, setGuardado] = useState<EstadoGuardado>("nada");
  const [aviso, setAviso] = useState<string | null>(null);
  const [entrando, setEntrando] = useState<string | null>(null);
  const [errorIngreso, setErrorIngreso] = useState<string | null>(null);
  const [verTarjeta, setVerTarjeta] = useState(false);

  const meRef = useRef<Participante | null | undefined>(undefined);
  /** Respuestas todavía no confirmadas por el servidor (activity|item → valor). */
  const pendientes = useRef(new Map<string, Pendiente>());
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());
  const enVuelo = useRef(new Set<string>());
  /** Cuenta los toques: si cambia mientras se restaura, gana lo local. */
  const escrituras = useRef(0);
  const guardadoT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const ponerMe = useCallback((p: Participante | null) => {
    meRef.current = p;
    setMe(p);
  }, []);

  /** La sesión se reinició (el participante ya no existe): volver al ingreso. */
  const expulsar = useCallback(() => {
    for (const t of timers.current.values()) clearTimeout(t);
    timers.current.clear();
    pendientes.current.clear();
    ponerMe(null);
    setRespuestas({});
    setVerTarjeta(false);
    setGuardado("nada");
    setAviso("La clase se reinició. Elegí tu área de nuevo.");
  }, [ponerMe]);

  /** Trae mis respuestas del servidor (al cargar, al cambiar de actividad y cada tanto). */
  const sincronizar = useCallback(async () => {
    const seq = escrituras.current;
    const leer = async () => {
      const r = await pedir(`${BASE}/my-responses`);
      if (!r.ok) throw new Error(String(r.status));
      return (await r.json()) as {
        name: string | null;
        responses?: { activity: string; item_key: string; payload: { v?: unknown } | null }[];
      };
    };
    try {
      let d = await leer();
      if (!meRef.current) return;
      if (!d.name) {
        // confirmar antes de mandar a alguien al ingreso
        await esperar(1500);
        d = await leer();
        if (!meRef.current) return;
        if (!d.name) {
          expulsar();
          return;
        }
      }
      if (seq !== escrituras.current) return;
      const nuevo: Respuestas = {};
      for (const x of d.responses ?? []) {
        const v = x.payload?.v;
        const valido = typeof v === "string" || (Array.isArray(v) && v.every((y) => typeof y === "string"));
        if (valido) (nuevo[x.activity] ??= {})[x.item_key] = v as Valor;
      }
      for (const p of pendientes.current.values()) (nuevo[p.a] ??= {})[p.i] = p.v;
      setRespuestas(nuevo);
    } catch {
      /* sin red: se queda lo local */
    } finally {
      setRestaurado(true);
    }
  }, [expulsar]);

  /** Envía lo pendiente de un ítem (si cambia mientras viaja, manda el último valor). */
  const enviar = useCallback(
    async (k: string) => {
      if (enVuelo.current.has(k) || !pendientes.current.has(k)) return;
      enVuelo.current.add(k);
      clearTimeout(guardadoT.current);
      setGuardado("guardando");
      let res: Resultado = "ok";
      try {
        for (let vuelta = 0; vuelta < 6; vuelta++) {
          const p = pendientes.current.get(k);
          if (!p) break;
          res = await postear(p);
          if (res === "descartar") {
            pendientes.current.delete(k);
            break;
          }
          if (res !== "ok") break;
          if (pendientes.current.get(k) === p) {
            pendientes.current.delete(k);
            break;
          }
        }
      } finally {
        enVuelo.current.delete(k);
      }
      if (res === "401") {
        expulsar();
        return;
      }
      if (res === "error" || res === "descartar") {
        setGuardado("error");
        if (res === "descartar") guardadoT.current = setTimeout(() => setGuardado("nada"), 3000);
        return;
      }
      setGuardado("guardado");
      guardadoT.current = setTimeout(() => setGuardado((g) => (g === "guardado" ? "nada" : g)), 1800);
    },
    [expulsar],
  );

  /** Guarda al toque (optimista) con debounce opcional. */
  const guardar = useCallback(
    (a: string, i: string, v: Valor, demora = 0) => {
      const k = `${a}|${i}`;
      escrituras.current++;
      pendientes.current.set(k, { a, i, v });
      setRespuestas((prev) => ({ ...prev, [a]: { ...prev[a], [i]: v } }));
      const t = timers.current.get(k);
      if (t) clearTimeout(t);
      timers.current.set(
        k,
        setTimeout(() => {
          timers.current.delete(k);
          void enviar(k);
        }, demora),
      );
    },
    [enviar],
  );

  /** Reintenta lo que quedó sin guardar (cuando vuelve la red). */
  const reintentar = useCallback(() => {
    for (const k of pendientes.current.keys()) {
      if (!timers.current.has(k) && !enVuelo.current.has(k)) void enviar(k);
    }
  }, [enviar]);

  /** Al esconder la app (bloqueo de pantalla), manda ya lo que esperaba el debounce. */
  const volcar = useCallback(() => {
    for (const [k, t] of timers.current) {
      clearTimeout(t);
      timers.current.delete(k);
      void enviar(k);
    }
  }, [enviar]);

  // ¿Ya entré antes? (cookie) → directo adentro, con mis respuestas restauradas.
  useEffect(() => {
    let vivo = true;
    (async () => {
      for (let intento = 0; vivo; intento++) {
        try {
          const r = await pedir(`${BASE}/me`);
          if (r.ok) {
            const d = (await r.json()) as { participant: Participante | null };
            if (!vivo) return;
            ponerMe(d.participant ?? null);
            if (d.participant) await sincronizar();
            else setRestaurado(true);
            return;
          }
        } catch {
          /* reintenta */
        }
        if (!vivo) return;
        setFallos((f) => f + 1);
        await esperar(Math.min(1000 * 2 ** intento, 8000));
      }
    })();
    return () => {
      vivo = false;
    };
  }, [ponerMe, sincronizar]);

  // Estado de la sesión: qué actividad está abierta y qué placa se proyecta.
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
      // Con la pantalla bloqueada se consulta más espaciado; al volver, al instante.
      const oculta = document.visibilityState === "hidden";
      try {
        const r = await pedir(BASE, undefined, 6000);
        if (!r.ok) throw new Error(String(r.status));
        const d = (await r.json()) as {
          session?: { current_activity?: string };
          participants?: number;
          placa?: { idx?: number } | null;
        };
        if (!vivo) return;
        const actividad = d.session?.current_activity ?? "lobby";
        const idx = typeof d.placa?.idx === "number" ? d.placa.idx : null;
        const conectados = d.participants ?? 0;
        setSesion((s) =>
          s && s.actividad === actividad && s.placaIdx === idx && s.conectados === conectados
            ? s
            : { actividad, placaIdx: idx, conectados },
        );
        setFallos(0);
        ciclos++;
        if (ultima !== null && ultima !== actividad) {
          if (meRef.current) {
            if (getActividadBbva(actividad)) vibrar(30);
            void sincronizar();
          }
          setVerTarjeta(false);
        } else if (ciclos % VERIFICAR_CADA === 0 && meRef.current) {
          void sincronizar();
        }
        ultima = actividad;
        if (pendientes.current.size) reintentar();
      } catch {
        if (vivo) setFallos((f) => f + 1);
      }
      if (vivo) programar(oculta ? POLL_MS * 4 : POLL_MS);
    }

    function alCambiarVisibilidad() {
      if (document.visibilityState === "visible") programar(0);
      else volcar();
    }
    const alVolverRed = () => programar(0);

    document.addEventListener("visibilitychange", alCambiarVisibilidad);
    window.addEventListener("pagehide", volcar);
    window.addEventListener("online", alVolverRed);
    programar(0);
    return () => {
      vivo = false;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
      window.removeEventListener("pagehide", volcar);
      window.removeEventListener("online", alVolverRed);
    };
  }, [sincronizar, reintentar, volcar]);

  const entrar = useCallback(
    async (area: Area) => {
      setEntrando(area.id);
      setErrorIngreso(null);
      try {
        const r = await pedir(
          `${BASE}/join`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: area.id }) },
          10000,
        );
        const d = (await r.json().catch(() => ({}))) as { participant?: Participante; error?: string };
        if (r.ok && d.participant) {
          pendientes.current.clear();
          setRespuestas({});
          setAviso(null);
          ponerMe(d.participant);
          vibrar(20);
          window.scrollTo(0, 0);
          void sincronizar();
        } else {
          setErrorIngreso("No pudimos conectarte. Probá de nuevo.");
        }
      } catch {
        setErrorIngreso("Sin conexión. Probá de nuevo en un momento.");
      } finally {
        setEntrando(null);
      }
    },
    [ponerMe, sincronizar],
  );

  const reconectando = fallos >= 2;

  if (me === undefined) {
    return (
      <>
        <EstilosAlumno />
        <Cargando texto={reconectando ? "reconectando…" : "conectando…"} />
      </>
    );
  }

  if (me === null) {
    return (
      <>
        <EstilosAlumno />
        <Ingreso onElegir={entrar} entrando={entrando} error={errorIngreso} aviso={aviso} reconectando={reconectando} />
      </>
    );
  }

  const area = getArea(me.name);
  const act = sesion ? getActividadBbva(sesion.actividad) : undefined;
  const slide = sesion?.placaIdx != null ? BBVA_SLIDES[sesion.placaIdx] : undefined;
  const enPantalla = slide ? tituloSlide(slide) : null;
  const hechas = new Set(
    BBVA_ACTIVIDADES.filter((a) => a.items.every((it) => respondido(respuestas[a.key]?.[it.id]))).map((a) => a.key),
  );
  const a5 = BBVA_ACTIVIDADES.find((a) => a.key === "bbva_a5");
  const tarjetaLista = hechas.has("bbva_a5");
  const mostrarTarjeta = verTarjeta && tarjetaLista && act?.key !== "bbva_a5";
  const vista = !sesion || !restaurado ? "carga" : mostrarTarjeta ? "tarjeta" : act ? act.key : "espera";
  const centro = mostrarTarjeta
    ? "Tu tarjeta"
    : act
      ? `Actividad ${act.numero} de ${BBVA_ACTIVIDADES.length}`
      : "Laboratorio de IA";

  const guardarEn = (a: string) => (item: string, v: Valor, demora?: number) => guardar(a, item, v, demora);

  function actividad(a: ActividadBbva, participante: Participante) {
    const props = { act: a, resp: respuestas[a.key] ?? {}, guardar: guardarEn(a.key), enPantalla };
    switch (a.key) {
      case "bbva_a1":
        return <Actividad1 {...props} />;
      case "bbva_a2":
        return <ActividadCasos {...props} variante="snd" />;
      case "bbva_a3":
        return <Actividad3 {...props} />;
      case "bbva_a4":
        return <ActividadCasos {...props} variante="tecno" />;
      case "bbva_a5":
        return <Actividad5 {...props} meId={participante.id} area={area} />;
    }
  }

  return (
    <>
      <EstilosAlumno />
      <Encabezado centro={centro} area={area} reconectando={reconectando} />
      <AvisoGuardado estado={guardado} onReintentar={reintentar} />
      <main
        key={vista}
        className="alu-entra mx-auto w-full max-w-md flex-1 overflow-x-clip px-4 pb-[calc(env(safe-area-inset-bottom)+2.5rem)] pt-5"
      >
        {vista === "carga" ? (
          <div className="grid min-h-[60dvh] place-items-center">
            <Girando texto={reconectando ? "reconectando…" : "conectando…"} />
          </div>
        ) : vista === "espera" ? (
          <Espera
            area={area}
            enPantalla={enPantalla}
            conectados={sesion?.conectados ?? 0}
            hechas={hechas}
            onVerTarjeta={tarjetaLista ? () => setVerTarjeta(true) : undefined}
          />
        ) : vista === "tarjeta" && a5 ? (
          <Actividad5
            act={a5}
            resp={respuestas[a5.key] ?? {}}
            guardar={guardarEn(a5.key)}
            enPantalla={enPantalla}
            meId={me.id}
            area={area}
            soloTarjeta
            onVolver={() => setVerTarjeta(false)}
          />
        ) : act ? (
          actividad(act, me)
        ) : null}
      </main>
    </>
  );
}
