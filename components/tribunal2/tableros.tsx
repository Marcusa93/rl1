"use client";

// Tableros en vivo de la segunda charla (proyector): lo que llega de los
// celulares, siempre agregado o revisado y sin nombres.
//
//   A1 nube (moderada: no se ve hasta que el equipo la proyecta; el docente
//      marca hasta tres palabras para analizar)
//   A2 laboratorio (avance y reflexión; el equipo puede proyectar un par
//      de un participante, sin nombre, o el ejemplo preparado)
//   A3 dos salidas y el voto (después se revela qué cambió en el contexto)
//   A4 tres textos y el voto (después se revela la autoría)
//   A5 avance del desafío final; placa 30: una ficha de trazabilidad
//
// Cada uno tiene su Plan B (sin conexión): versión proyectada y respuesta
// a mano alzada.

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useLive } from "@/components/use-live";
import { Cinta, Etiqueta, Ficha, Hoja, Mano, Pieza, Sello, Telefono, TarjetaQr, Traza } from "@/components/tribunal2/collage";
import type { Moderacion } from "@/lib/moderacion";
import { rem } from "@/lib/remoto";
import { TF_LINK, TF_QR } from "@/lib/tribunal";
import {
  armarFicha,
  getTf2Actividad,
  TF2_A2_CAMBIOS,
  TF2_A2_EJEMPLO,
  TF2_A2_EJEMPLO_MARCAS,
  TF2_A3,
  TF2_A4,
  TF2_BLOQUES,
  TF2_CAMPOS,
  TF2_DIFERENCIAS_B,
  TF2_PERFILES,
  TF2_RECAP,
  TF2_TEXTO_HUMANO_PENDIENTE,
  TF2_PROXIMA,
  type Tf2A2,
  type Tf2A5,
  type Tf2ActKey,
  type Tf2Placa,
} from "@/lib/tribunal-clase2";
import { cn } from "@/lib/utils";

// --- Moderación (deck y control, con la cookie docente) ------------------------------------------

export type CambioModeracion =
  | { activity: string; valor: string; oculta: boolean }
  | { activity: string; proyectar: boolean }
  | { activity: string; destacar: string; destacada: boolean }
  | { activity: string; elegida: string | null }
  | { reiniciar: true };

export function useModeracion2(slug: string, intervalo = 2500) {
  const { data, refresh } = useLive<{ moderacion: Moderacion }>(`/api/session/${slug}/moderacion`, intervalo);
  const cambiar = useCallback(
    async (cambio: CambioModeracion) => {
      await fetch(`/api/session/${slug}/moderacion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambio),
      }).catch(() => {});
      await refresh();
    },
    [slug, refresh],
  );
  return { moderacion: data?.moderacion ?? {}, cambiar };
}

/** Respuestas de una actividad con su participante (solo docente: para elegir qué proyectar, sin nombre). */
export type FilaRespuesta = { participant_id: string; name: string; activity: string; payload: Record<string, unknown>; updated_at: string };
export function useRespuestas(slug: string, activity: string, activo: boolean, intervalo = 4000) {
  const { data } = useLive<{ rows: FilaRespuesta[] }>(activo ? `/api/session/${slug}/all-responses` : null, intervalo);
  return (data?.rows ?? []).filter((r) => r.activity === activity);
}

const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);

function hash(s: string) {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

// --- Estado de la sesión (en las placas de actividad) --------------------------------------------

export function EstadoSesion({ slug, act, desde, intervalo }: { slug: string; act: Tf2ActKey; desde: number | null; intervalo: number }) {
  const { data } = useResultados(slug, act, intervalo);
  // Temporizador discreto: segundos desde que se abrió la actividad.
  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (!desde) return;
    const id = setInterval(() => setAhora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [desde]);
  const seg = desde ? Math.max(0, Math.floor((ahora - desde) / 1000)) : 0;
  return (
    <div className="tf2-objeto flex items-center gap-5 rounded-full bg-tf2-hoja px-6 py-3">
      <span className="flex items-center gap-2">
        <span className="tf2-latido size-[12px] rounded-full bg-tf2-rojo" />
        <span className="tf2-rotulo text-[14px] text-tf2-rojo">En vivo</span>
      </span>
      <span className="tf2-mono text-[22px]">
        <b>{data?.participants ?? 0}</b> conectados
      </span>
      <span className="tf2-mono text-[22px]">
        <b>{data?.responded ?? 0}</b> respondieron
      </span>
      {desde && (
        <span className="tf2-mono text-[18px] tabular-nums text-tf2-gris">
          ⏱ {String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

// --- Aviso de actividad (paso 0 de las placas 02, 07, 15, 26 y 29) -------------------------------

export function AvisoActividad({ placa, estado }: { placa: Tf2Placa; estado: ReactNode }) {
  const act = getTf2Actividad(placa.actividad!)!;
  return (
    <>
      <div className="absolute left-[120px] top-[150px] w-[960px]">
        <Sello tam={26} d={200}>
          Actividad {act.numero}
        </Sello>
        <h1 className="tf2-titular tf2-sube mt-8 text-[100px] text-tf2-tinta">{placa.titulo}</h1>
        <p className="tf2-sube mt-7 max-w-[860px] text-[36px] leading-snug text-tf2-grafito" style={{ "--d": "120ms" } as React.CSSProperties}>
          {placa.bajada}
        </p>
        <div className="tf2-sube tf2-objeto mt-12 inline-flex items-center gap-6 rounded-[10px] bg-tf2-rojo py-6 pl-7 pr-10 text-white" style={{ "--d": "260ms" } as React.CSSProperties}>
          <span className="text-[64px] leading-none">📱</span>
          <span>
            <span className="tf2-mono block text-[34px] font-semibold uppercase tracking-[0.08em]">Participá en la app · Actividad {act.numero}</span>
            <span className="mt-1 block text-[26px] text-white/90">Abrí la pantalla de participación desde tu celular.</span>
          </span>
        </div>
        <div className="mt-10">{estado}</div>
      </div>
      <Pieza x={1150} y={120} r={4} d={300}>
        <Telefono w={350}>
          <PreviaCelular act={placa.actividad!} />
        </Telefono>
      </Pieza>
      <Pieza x={1530} y={520} r={-4} d={480}>
        <TarjetaQr qr={TF_QR} link={TF_LINK} w={290} />
      </Pieza>
    </>
  );
}

const BotonPrevia = ({ children, tono = "tinta" }: { children: ReactNode; tono?: "tinta" | "linea" }) => (
  <span className={cn("block rounded-[10px] px-3 py-2.5 text-center text-[15px] font-semibold", tono === "tinta" ? "bg-tf2-tinta text-white" : "border border-tf2-linea bg-white")}>{children}</span>
);

/** Lo que muestra el celular en cada actividad (maqueta estática en el aviso). */
function PreviaCelular({ act }: { act: Tf2ActKey }) {
  const a = getTf2Actividad(act)!;
  return (
    <div className="flex h-full flex-col">
      <p className="tf2-rotulo text-[11px] text-tf2-rojo">Actividad {a.numero}</p>
      <p className="tf2-serif mt-2 text-[22px] font-medium leading-tight">{a.pregunta}</p>
      <div className="mt-5 grid gap-3">
        {act === "tf2_a1" && (
          <>
            <span className="tf2-mono block rounded-[10px] border border-tf2-linea bg-white px-3 py-3 text-[15px] text-tf2-gris">una o dos palabras…</span>
            <BotonPrevia>Enviar</BotonPrevia>
          </>
        )}
        {act === "tf2_a2" && (
          <>
            <span className="block rounded-[12px] rounded-br-[3px] bg-tf2-azul px-3 py-2 text-[14px] text-white">Escribí un aviso…</span>
            <span className="block rounded-[12px] rounded-bl-[3px] border border-tf2-linea bg-white px-3 py-2 text-[14px]">Respuesta del chatbot</span>
            <div className="flex flex-wrap gap-1.5">
              {["Rol", "Tarea", "Contexto", "Fuentes", "Límites", "Formato"].map((c) => (
                <span key={c} className="rounded-full bg-tf2-salvia-claro px-2 py-0.5 text-[12px]">
                  + {c}
                </span>
              ))}
            </div>
          </>
        )}
        {act === "tf2_a3" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <span className="rounded-[10px] border border-tf2-linea bg-white p-2 text-center text-[14px]">Salida A</span>
              <span className="rounded-[10px] border border-tf2-linea bg-white p-2 text-center text-[14px]">Salida B</span>
            </div>
            <BotonPrevia tono="linea">🅰️ Ayuda más la A</BotonPrevia>
            <BotonPrevia tono="linea">🅱️ Ayuda más la B</BotonPrevia>
          </>
        )}
        {act === "tf2_a4" && (
          <>
            {["A", "B", "C"].map((k) => (
              <BotonPrevia key={k} tono="linea">
                Texto {k}
              </BotonPrevia>
            ))}
          </>
        )}
        {act === "tf2_a5" && (
          <>
            <div className="flex gap-1.5">
              {Array.from({ length: 7 }, (_, k) => (
                <span key={k} className={cn("h-1.5 flex-1 rounded-full", k < 2 ? "bg-tf2-rojo" : "bg-tf2-linea")} />
              ))}
            </div>
            <span className="tf2-rotulo text-[10px] text-tf2-gris">1 · Tarea concreta</span>
            <span className="tf2-mono block rounded-[10px] border border-tf2-linea bg-white px-3 py-3 text-[14px] text-tf2-gris">preparar una lista de…</span>
            <BotonPrevia>Siguiente</BotonPrevia>
          </>
        )}
      </div>
      <p className="mt-auto text-center text-[12px] text-tf2-gris">sin nombre · sin datos reales</p>
    </div>
  );
}

// --- Encabezado de los tableros (paso ≥ 1) ---------------------------------------------------------

export function CabeceraTablero({ placa, estado, children }: { placa: Tf2Placa; estado: ReactNode; children?: ReactNode }) {
  const act = getTf2Actividad(placa.actividad!)!;
  return (
    <div className="absolute inset-x-[120px] top-[96px] flex items-start justify-between gap-10">
      <div className="min-w-0">
        <div className="flex items-center gap-5">
          <Sello tam={20}>Actividad {act.numero}</Sello>
          <span className="tf2-rotulo text-[15px] text-tf2-gris">{act.nombre}</span>
        </div>
        <h2 className="tf2-titular tf2-sube mt-4 text-[62px] text-tf2-tinta">{act.pregunta}</h2>
        {children}
      </div>
      <div className="shrink-0 pt-1">{estado}</div>
    </div>
  );
}

// --- A1 · Nube de palabras ---------------------------------------------------------------------------

type Palabra = { palabra: string; n: number };

/** Palabras que suelen surgir (respaldo sin conexión: el equipo las recoge en voz alta). */
const A1_RESPALDO = ["supuestos", "ambigüedad", "falta de contexto", "cantidad", "orden", "precisión", "para quién"];

export function TableroA1({
  slug,
  intervalo,
  moderacion,
  onCambiar,
  planB,
}: {
  slug: string;
  intervalo: number;
  moderacion: Moderacion;
  onCambiar: (c: CambioModeracion) => void;
  planB: boolean;
}) {
  const { data } = useResultados(slug, "tf2_a1", intervalo);
  const mod = moderacion.tf2_a1 ?? {};
  const ocultas = new Set(mod.ocultas ?? []);
  const destacadas = mod.destacadas ?? [];
  const palabras = ((data?.summary?.palabras as Palabra[]) ?? []).filter((p) => !ocultas.has(p.palabra));
  const max = Math.max(1, ...palabras.map((p) => p.n));
  const proyectada = Boolean(mod.proyectar);

  if (planB)
    return (
      <div className="absolute inset-x-[120px] top-[330px]">
        <PlanBAviso />
        <div className="mt-10 flex flex-wrap gap-5">
          {A1_RESPALDO.map((w, k) => (
            <Tira key={w} texto={w} tam={40} r={(hash(w) % 7) - 3} d={k * 90} />
          ))}
        </div>
        <p className="tf2-mono mt-8 text-[20px] text-tf2-gris">Palabras que suelen surgir: sumar las de la sala en voz alta.</p>
      </div>
    );

  return (
    <div className="absolute inset-x-[120px] bottom-[110px] top-[330px]">
      <div className="sr-only">
        <button onClick={() => onCambiar({ activity: "tf2_a1", proyectar: !proyectada })} {...rem("👁 Proyectar la nube (revisada)", proyectada)}>
          Proyectar la nube
        </button>
      </div>
      {!proyectada ? (
        <div className="flex h-full flex-col items-center justify-center text-center">
          <div className="relative h-[180px] w-[520px]">
            {[0, 1, 2, 3, 4].map((k) => (
              <span key={k} className="tf2-objeto absolute h-[54px] rounded-[2px] bg-tf2-hoja" style={{ left: 40 + k * 70, top: 30 + (k % 2) * 50, width: 180 + (k % 3) * 40, rotate: `${-6 + k * 3}deg` }} />
            ))}
          </div>
          <p className="tf2-titular mt-6 text-[80px] tabular-nums">{data?.responded ?? 0}</p>
          <p className="tf2-mono text-[26px] text-tf2-grafito">respuestas recibidas · el equipo las revisa antes de mostrarlas</p>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          {destacadas.length > 0 && (
            <div className="mb-6 flex items-center gap-6">
              <span className="tf2-rotulo text-[15px] text-tf2-rojo">Para analizar</span>
              {destacadas.map((w, k) => (
                <span key={w} className="tf2-sube relative" style={{ "--d": `${k * 120}ms` } as React.CSSProperties}>
                  <Tira texto={w} tam={46} r={k % 2 ? 2 : -2} />
                  <span className="pointer-events-none absolute -inset-x-4 -inset-y-3 rounded-[50%] border-[3px] border-tf2-rojo" style={{ rotate: "-3deg" }} />
                </span>
              ))}
            </div>
          )}
          <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-x-6 gap-y-5">
            {palabras
              .filter((p) => !destacadas.includes(p.palabra))
              .slice(0, 40)
              .map((p) => (
                <Tira key={p.palabra} texto={p.palabra} n={p.n} tam={24 + 46 * Math.sqrt(p.n / max)} r={(hash(p.palabra) % 9) - 4} fuerte={p.n === max} />
              ))}
            {!palabras.length && <p className="tf2-mono text-[26px] text-tf2-gris">Todavía no llegaron palabras.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

/** Tira de papel con una palabra tipeada (la nube del collage). */
function Tira({ texto, n, tam, r = 0, fuerte, d = 0 }: { texto: string; n?: number; tam: number; r?: number; fuerte?: boolean; d?: number }) {
  return (
    <span className="tf2-cae tf2-objeto inline-flex items-baseline gap-3 bg-tf2-hoja px-[0.5em] py-[0.18em]" style={{ rotate: `${r}deg`, "--d": `${d}ms` } as React.CSSProperties}>
      <span className={cn("tf2-mono leading-none", fuerte ? "font-semibold text-tf2-tinta" : "text-tf2-grafito")} style={{ fontSize: tam }}>
        {texto}
      </span>
      {n !== undefined && n > 1 && <span className="tf2-mono text-[16px] text-tf2-rojo">×{n}</span>}
    </span>
  );
}

// --- A2 · Laboratorio de prompts ------------------------------------------------------------------------

export function TableroA2({
  slug,
  intervalo,
  moderacion,
  onCambiar,
  ejemplo,
  onEjemplo,
  planB,
}: {
  slug: string;
  intervalo: number;
  moderacion: Moderacion;
  onCambiar: (c: CambioModeracion) => void;
  ejemplo: boolean;
  onEjemplo: () => void;
  planB: boolean;
}) {
  const { data } = useResultados(slug, "tf2_a2", intervalo);
  const s = (data?.summary ?? {}) as { conA?: number; conB?: number; reflexionaron?: number; cambios?: Record<string, number> };
  const elegida = moderacion.tf2_a2?.elegida ?? null;
  const filas = useRespuestas(slug, "tf2_a2", Boolean(elegida));
  const par = elegida ? (filas.find((f) => f.participant_id === elegida)?.payload as Tf2A2 | undefined) : undefined;
  const mostrarPar = planB || ejemplo || Boolean(par);
  const totalCambios = Math.max(1, s.reflexionaron ?? 0);

  return (
    <div className="absolute inset-x-[120px] bottom-[110px] top-[330px]">
      <div className="sr-only">
        <button onClick={onEjemplo} {...rem("🧪 Proyectar el ejemplo preparado", ejemplo)}>
          Ejemplo preparado
        </button>
        {elegida && (
          <button onClick={() => onCambiar({ activity: "tf2_a2", elegida: null })} {...rem("✕ Dejar de proyectar el par elegido", true)}>
            Dejar de proyectar
          </button>
        )}
      </div>
      {mostrarPar ? (
        <ParA2 par={par && !ejemplo && !planB ? par : TF2_A2_EJEMPLO} ejemplo={!par || ejemplo || planB} planB={planB} />
      ) : (
        <div className="grid h-full grid-cols-[1fr_1.1fr] gap-14">
          <div className="relative">
            {[
              { k: "pedidos simples", n: s.conA ?? 0, r: -3 },
              { k: "pedidos estructurados", n: s.conB ?? 0, r: 2 },
              { k: "compararon las dos", n: s.reflexionaron ?? 0, r: -1 },
            ].map((c, i) => (
              <div key={c.k} className="absolute w-[400px]" style={{ left: i * 120, top: i * 150, rotate: `${c.r}deg` }}>
                <Ficha rotulo={c.k} tono={i === 1 ? "salvia" : "crema"} tam={22}>
                  <span className="tf2-titular block text-[86px] leading-none tabular-nums">{c.n}</span>
                </Ficha>
              </div>
            ))}
          </div>
          <div>
            <p className="tf2-rotulo text-[15px] text-tf2-gris">¿Qué cambió con el pedido estructurado?</p>
            <div className="mt-5 grid gap-4">
              {TF2_A2_CAMBIOS.map((c) => {
                const n = s.cambios?.[c.id] ?? 0;
                return <BarraTinta key={c.id} label={c.label} n={n} p={pct(n, totalCambios)} />;
              })}
            </div>
            <p className="tf2-mono mt-6 text-[19px] text-tf2-gris">Una instrucción puede mejorar la verificabilidad, pero no asegura la verdad.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function ColumnaPar({ k, pedido, salida, tono, r }: { k: string; pedido?: string; salida?: string; tono: "crema" | "salvia"; r: number }) {
  return (
    <div className="flex min-h-0 flex-col" style={{ rotate: `${r}deg` }}>
      <Ficha rotulo={k} tono={tono} tam={17}>
        <span className="line-clamp-6 whitespace-pre-line">{pedido || "—"}</span>
      </Ficha>
      <Hoja className="relative -mt-2 ml-8 max-h-[340px] overflow-hidden p-6">
        <p className="whitespace-pre-line text-[19px] leading-[1.45]">{salida || "(sin salida)"}</p>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-tf2-hoja to-transparent" />
      </Hoja>
    </div>
  );
}

function ParA2({ par, ejemplo, planB }: { par: Tf2A2; ejemplo: boolean; planB: boolean }) {
  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex items-center gap-4">
        {planB && <PlanBAviso chico />}
        <Sello tono={ejemplo ? "azul" : "musgo"} tam={17}>
          {ejemplo ? "Ejemplo preparado antes de la clase" : "Par de un participante · sin nombre"}
        </Sello>
        <span className="tf2-mono text-[19px] text-tf2-gris">Tarea: {par.tarea}</span>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-2 gap-12">
        <ColumnaPar k="Pedido simple" pedido={par.pedidoA} salida={par.salidaA} tono="crema" r={-0.8} />
        <ColumnaPar k="Pedido estructurado" pedido={par.pedidoB} salida={par.salidaB} tono="salvia" r={0.8} />
      </div>
      {ejemplo && (
        <div className="mt-3 flex gap-4">
          {TF2_A2_EJEMPLO_MARCAS.map((m, k) => (
            <Mano key={k} tam={31} tono={k === 2 ? "azul" : "rojo"} className="flex-1">
              {m}
            </Mano>
          ))}
        </div>
      )}
    </div>
  );
}

function BarraTinta({ label, n, p, destacada }: { label: string; n: number; p: number; destacada?: boolean }) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className={cn("min-w-0 truncate text-[24px]", destacada ? "font-semibold" : "text-tf2-grafito")}>{label}</span>
        <span className="tf2-mono shrink-0 whitespace-nowrap text-[20px] tabular-nums text-tf2-gris">
          {n} · {p}%
        </span>
      </div>
      <div className="mt-1.5 h-[16px] overflow-hidden rounded-[2px] bg-tf2-linea/60">
        <div className={cn("h-full transition-[width] duration-700", destacada ? "bg-tf2-rojo" : "bg-tf2-musgo")} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

// --- A3 · Contexto en comparación -----------------------------------------------------------------------

function SalidaA3({ k, texto, r, votos, total, planB }: { k: "A" | "B"; texto: string; r: number; votos: number; total: number; planB: boolean }) {
  return (
    <div className="relative min-h-0" style={{ rotate: `${r}deg` }}>
      <Hoja className="h-full overflow-hidden p-7 pt-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="tf2-titular text-[44px]">Salida {k}</span>
          {planB ? (
            <span className="tf2-mono text-[18px] text-tf2-gris">mano alzada</span>
          ) : (
            <Sello tono={k === "A" ? "azul" : "musgo"} tam={19}>
              {votos} votos · {pct(votos, total)}%
            </Sello>
          )}
        </div>
        <p className="whitespace-pre-line text-[18px] leading-[1.42] text-tf2-tinta">{texto.replace(/\*\*/g, "")}</p>
        <span className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-tf2-hoja to-transparent" />
      </Hoja>
    </div>
  );
}

export function TableroA3({ slug, intervalo, revelado, planB }: { slug: string; intervalo: number; revelado: boolean; planB: boolean }) {
  const { data } = useResultados(slug, "tf2_a3", intervalo);
  const byQ = (data?.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  const votos = byQ.ayuda ?? {};
  const total = (votos.A ?? 0) + (votos.B ?? 0);
  const cambio = byQ.cambio ?? {};
  const totalCambio = Object.values(cambio).reduce((a, b) => a + b, 0);
  const preguntaCambio = getTf2Actividad("tf2_a3")!.vivo!.preguntas![1];

  return (
    <div className="absolute inset-x-[120px] bottom-[96px] top-[300px]">
      <div className="mb-4 flex items-center gap-5">
        {planB && <PlanBAviso chico />}
        <span className="tf2-rotulo shrink-0 whitespace-nowrap text-[14px] text-tf2-gris">Misma tarea · mismo modelo</span>
        <span className="tf2-mono line-clamp-2 text-[18px] leading-snug text-tf2-grafito">{TF2_A3.tarea}</span>
      </div>
      <div className="grid h-[calc(100%-150px)] grid-cols-2 gap-12">
        <SalidaA3 k="A" texto={TF2_A3.A} r={-0.6} votos={votos.A ?? 0} total={total} planB={planB} />
        <SalidaA3 k="B" texto={TF2_A3.B} r={0.6} votos={votos.B ?? 0} total={total} planB={planB} />
      </div>
      {!planB && (
        <div className="mt-5 flex items-center gap-6">
          <span className="tf2-rotulo shrink-0 text-[13px] text-tf2-gris">{preguntaCambio.q}</span>
          {preguntaCambio.opciones.map((o) => (
            <span key={o.id} className="tf2-mono flex items-baseline gap-2 text-[19px]">
              {o.label} <b className="text-tf2-rojo">{pct(cambio[o.id] ?? 0, totalCambio)}%</b>
            </span>
          ))}
        </div>
      )}
      {revelado && (
        <div className="tf2-sube absolute left-1/2 top-[70px] w-[1080px] -translate-x-1/2 rotate-[-1deg]">
          <Cinta x="12%" y={-14} r={-8} />
          <Cinta x="78%" y={-12} r={6} />
          <Ficha rotulo="Qué cambió: el contexto del sistema (salida B)" tono="hoja" tam={22}>
            {TF2_DIFERENCIAS_B.map((d) => (
              <span key={d} className="block">
                ▸ {d}
              </span>
            ))}
          </Ficha>
          <div className="tf2-objeto mx-10 -mt-1 flex items-center justify-between gap-6 rounded-b-[4px] bg-tf2-papel px-6 py-4">
            <Sello tono="tinta" tam={17}>
              Mismo modelo · misma tarea · misma temperatura
            </Sello>
            <Mano tam={30} className="whitespace-nowrap">
              más contexto no garantiza exactitud
            </Mano>
          </div>
        </div>
      )}
    </div>
  );
}

// --- A4 · Humano o IA -----------------------------------------------------------------------------------

export function TableroA4({ slug, intervalo, revelado, planB }: { slug: string; intervalo: number; revelado: boolean; planB: boolean }) {
  const { data } = useResultados(slug, "tf2_a4", intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="absolute inset-x-[120px] bottom-[96px] top-[300px]">
      <div className="mb-4 flex items-center gap-5">
        {planB && <PlanBAviso chico />}
        <span className="tf2-rotulo text-[14px] text-tf2-gris">Misma consigna, extensión y tipografía</span>
        {TF2_TEXTO_HUMANO_PENDIENTE && <span className="tf2-mono text-[17px] text-tf2-rojo">⚠ falta el texto humano (B): reemplazarlo antes de la clase</span>}
        {revelado && (
          <span className="ml-auto rotate-[-1deg]">
            <Sello tam={17}>No hay detector fiable de autoría</Sello>
          </span>
        )}
      </div>
      <div className="grid h-[calc(100%-60px)] grid-cols-3 gap-9">
        {TF2_A4.map((t, k) => {
          const n = counts[t.id] ?? 0;
          return (
            <div key={t.id} className="relative flex min-h-0 flex-col" style={{ rotate: `${[-0.8, 0.5, -0.4][k]}deg` }}>
              <Hoja className="relative min-h-0 flex-1 overflow-hidden p-7">
                <span className="tf2-titular text-[54px] leading-none">{t.id.toUpperCase()}</span>
                <p className="tf2-serif mt-4 text-[23px] leading-[1.48]">{t.texto}</p>
                {revelado && (
                  <div className="absolute right-[24px] top-[22px] rotate-[-9deg]">
                    <Sello tono={t.autoria === "humano" ? "musgo" : "rojo"} tam={30} d={k * 220}>
                      {t.autoria === "humano" ? "Persona" : "IA"}
                    </Sello>
                  </div>
                )}
              </Hoja>
              <div className="mt-4">
                {revelado ? (
                  <p className="tf2-sube tf2-mono text-[16.5px] leading-snug text-tf2-grafito">{t.rasgos}</p>
                ) : planB ? (
                  <p className="tf2-mono text-[19px] text-tf2-gris">Mano alzada: ¿la escribió una persona?</p>
                ) : (
                  <BarraTinta label={`Texto ${t.id.toUpperCase()}`} n={n} p={pct(n, total)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- A5 · Desafío final ---------------------------------------------------------------------------------

export function TableroA5({ slug, intervalo, planB }: { slug: string; intervalo: number; planB: boolean }) {
  const { data } = useResultados(slug, "tf2_a5", intervalo);
  const s = (data?.summary ?? {}) as { total?: number; armadas?: number; probadas?: number; fichas?: number; campos?: Record<string, number> };
  const total = s.total ?? 0;
  if (planB)
    return (
      <div className="absolute inset-x-[120px] bottom-[110px] top-[320px]">
        <PlanBAviso />
        <div className="mt-6 w-[1300px] rotate-[-0.6deg]">
          <Ficha rotulo="Plantilla común · copiala en tu cuaderno o bajala como texto" tono="hoja" tam={24}>
            Actuá como asistente de <span className="tf2-hueco">rol funcional</span> para ayudarme a <span className="tf2-hueco">tarea concreta</span> con el objetivo <span className="tf2-hueco">propósito</span>. El contexto necesario es <span className="tf2-hueco">información no sensible y relevante</span>. Trabajá exclusivamente con <span className="tf2-hueco">fuentes autorizadas</span>. Dividí la tarea en <span className="tf2-hueco">pasos</span>. No supongas datos ausentes ni sustituyas decisiones humanas. Señalá dudas e inferencias. Respondé en <span className="tf2-hueco">formato</span>. Incluí una sección final con elementos a verificar y fuentes a cotejar.
          </Ficha>
        </div>
      </div>
    );
  const etapas = [
    { k: "Empezaron", n: total },
    { k: "Armaron la instrucción", n: s.armadas ?? 0 },
    { k: "La probaron", n: s.probadas ?? 0 },
    { k: "Completaron la ficha", n: s.fichas ?? 0 },
  ];
  return (
    <div className="absolute inset-x-[120px] bottom-[110px] top-[330px]">
      <div className="relative h-[250px]">
        <Traza w={1680} h={250} d="M150 120 L 1530 120" />
        {etapas.map((e, i) => (
          <div key={e.k} className="absolute w-[330px]" style={{ left: i * 450, top: i % 2 ? 26 : 0, rotate: `${i % 2 ? 1.5 : -1.5}deg` }}>
            <Ficha rotulo={`0${i + 1} · ${e.k}`} tono={i === 3 ? "salvia" : "crema"} tam={20}>
              <span className="tf2-titular block text-[78px] leading-none tabular-nums">{e.n}</span>
            </Ficha>
          </div>
        ))}
      </div>
      <p className="tf2-rotulo mt-10 text-[15px] text-tf2-gris">Campos completados · se puede enviar con campos vacíos: quedan marcados</p>
      <div className="mt-5 grid grid-cols-4 gap-x-12 gap-y-5">
        {TF2_CAMPOS.map((c) => {
          const n = s.campos?.[c.id] ?? 0;
          return <BarraTinta key={c.id} label={c.etiqueta} n={n} p={pct(n, Math.max(1, total))} />;
        })}
      </div>
    </div>
  );
}

// --- Placa 30 · una ficha de trazabilidad --------------------------------------------------------

const FICHA_EJEMPLO: Tf2A5 = {
  campos: Object.fromEntries(TF2_CAMPOS.map((c) => [c.id, c.ejemplo])),
  version: 2,
  prueba: { material: "listado ficticio", salida: "Tabla con 6 pendientes agrupados por tema; dos marcados como «dato faltante»; al final, lista de fechas y áreas a verificar.", t: Date.UTC(2026, 9, 23, 13, 40), perfil: "A" },
  controles: { Nombres: "verificado", Fechas: "verificado", Montos: "no aplica", Normas: "no aplica", Citas: "pendiente", Cálculos: "no aplica" },
  correcciones: "se quitó un pendiente que no estaba en el listado",
  responsable: "jefatura de mesa de entradas",
};

export function Huellas({ slug, moderacion, onCambiar }: { slug: string; moderacion: Moderacion; onCambiar: (c: CambioModeracion) => void }) {
  const elegida = moderacion.tf2_a5?.elegida ?? null;
  const filas = useRespuestas(slug, "tf2_a5", Boolean(elegida));
  const real = elegida ? (filas.find((f) => f.participant_id === elegida)?.payload as Tf2A5 | undefined) : undefined;
  const a = real ?? FICHA_EJEMPLO;
  const lineas = armarFicha(a, TF2_PERFILES.A.nombre).split("\n");
  return (
    <div className="absolute left-[1010px] top-[110px] w-[820px]">
      <div className="sr-only">
        {elegida && (
          <button onClick={() => onCambiar({ activity: "tf2_a5", elegida: null })} {...rem("✕ Volver a la ficha de ejemplo", true)}>
            Volver al ejemplo
          </button>
        )}
      </div>
      <div className="tf2-cae rotate-[1.2deg]">
        <Cinta x="40%" y={-14} />
        <div className="tf2-objeto rounded-[3px] bg-tf2-crema p-8">
          <div className="flex items-center justify-between border-b-2 border-tf2-rojo/60 pb-3">
            <p className="tf2-titular text-[36px]">Ficha de trazabilidad</p>
            <Sello tono={real ? "musgo" : "azul"} tam={15}>
              {real ? "de la sala · sin nombre" : "ejemplo"}
            </Sello>
          </div>
          <div className="tf2-mono mt-4 grid gap-1.5 text-[19px] leading-snug">
            {lineas.slice(1).map((l, k) => (
              <p key={k} className={cn(l.startsWith("  ·") && "pl-6", /: pendiente$/.test(l) && "text-tf2-rojo", /: verificado$/.test(l) && "text-tf2-musgo")}>
                {l}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Recapitulación --------------------------------------------------------------------------------

export function Recapitulacion({ slug, intervalo, moderacion }: { slug: string; intervalo: number; moderacion: Moderacion }) {
  const a1 = useResultados(slug, "tf2_a1", intervalo * 2).data;
  const a3 = useResultados(slug, "tf2_a3", intervalo * 2).data;
  const a4 = useResultados(slug, "tf2_a4", intervalo * 2).data;
  const a5 = useResultados(slug, "tf2_a5", intervalo * 2).data;
  const ocultas = new Set(moderacion.tf2_a1?.ocultas ?? []);
  const destacadas = moderacion.tf2_a1?.destacadas ?? [];
  const palabras = moderacion.tf2_a1?.proyectar
    ? destacadas.length
      ? destacadas
      : ((a1?.summary?.palabras as Palabra[]) ?? []).filter((p) => !ocultas.has(p.palabra)).slice(0, 3).map((p) => p.palabra)
    : [];
  const votos = ((a3?.summary?.byQuestion as Record<string, Record<string, number>>) ?? {}).ayuda ?? {};
  const totalA3 = (votos.A ?? 0) + (votos.B ?? 0);
  const counts4 = (a4?.summary?.counts as Record<string, number>) ?? {};
  const humano = TF2_A4.find((t) => t.autoria === "humano")!.id;
  const totalA4 = Object.values(counts4).reduce((a, b) => a + b, 0);
  const fichas = Number((a5?.summary as { fichas?: number } | undefined)?.fichas ?? 0);

  const datos = [
    palabras.length ? `La sala dijo: ${palabras.join(" · ")}` : null,
    totalA3 ? `${pct(votos.B ?? 0, totalA3)}% eligió la salida con contexto` : null,
    totalA4 ? `${pct(counts4[humano] ?? 0, totalA4)}% reconoció el texto humano` : null,
    fichas ? `${fichas} instrucciones con su ficha de trazabilidad` : null,
  ].filter(Boolean) as string[];

  return (
    <>
      <div className="absolute left-[120px] top-[110px]">
        <p className="tf2-rotulo text-[16px] text-tf2-rojo">Recapitulación</p>
        <h1 className="tf2-titular tf2-sube mt-4 text-[84px]">Pedir, revisar y documentar</h1>
      </div>
      <div className="absolute inset-x-[120px] top-[330px] grid grid-cols-3 gap-x-10 gap-y-12">
        {TF2_BLOQUES.map((b, k) => (
          <div key={b.nombre} className="tf2-cae" style={{ rotate: `${[-1.5, 1, -0.5, 1.5, -1, 0.8][k]}deg`, "--d": `${k * 110}ms` } as React.CSSProperties}>
            <Ficha rotulo={`Bloque ${k + 1} · ${b.nombre}`} tono={k % 2 ? "salvia" : "crema"} tam={24}>
              {TF2_RECAP[k]}
            </Ficha>
          </div>
        ))}
      </div>
      {datos.length > 0 && (
        <div className="absolute inset-x-[120px] bottom-[110px] flex flex-wrap items-center gap-5">
          <span className="tf2-rotulo text-[14px] text-tf2-gris">En esta sala</span>
          {datos.map((d) => (
            <Etiqueta key={d} tono="crema">
              {d}
            </Etiqueta>
          ))}
        </div>
      )}
      <div className="absolute right-[120px] top-[170px] rotate-[3deg]">
        <Mano tono="azul" tam={40}>
          próxima: {TF2_PROXIMA.toLowerCase()} →
        </Mano>
      </div>
    </>
  );
}

// --- Plan B ------------------------------------------------------------------------------------------

function PlanBAviso({ chico }: { chico?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3 rounded-[6px] bg-tf2-tinta text-white", chico ? "px-3 py-1.5 text-[16px]" : "px-5 py-3 text-[24px]")}>
      <span className="tf2-mono font-semibold uppercase tracking-[0.1em]">Plan B</span>
      <span>{chico ? "mano alzada" : "Respondemos en voz alta o a mano alzada: no hace falta el celular."}</span>
    </span>
  );
}
