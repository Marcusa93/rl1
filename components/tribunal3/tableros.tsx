"use client";

// Tableros de la tercera charla (proyector): resultados agregados y anónimos de
// las cuatro actividades, su devolución (que funciona aunque nadie responda),
// la matriz de agravios, el prompt COTIO de la demo, la revelación de D5 y la
// matriz COTIO final.

import { useEffect, useState, type ReactNode } from "react";
import { useResultados } from "@/components/clase/vivo";
import { Cinta, Etiqueta, Ficha, Hoja, Mano, Pieza, Sello, Telefono, TarjetaQr } from "@/components/tribunal2/collage";
import { PromptCotioProyectado } from "@/components/tribunal3/skill";
import { TF_LINK, TF_QR } from "@/lib/tribunal";
import {
  getTf3Actividad,
  TF3_A1_CIERRE,
  TF3_A1_DEVOLUCION,
  TF3_A1_PROYECTADA,
  TF3_A2_ACLARACION,
  TF3_A2_PROYECTADA,
  TF3_A3_CIERRE,
  TF3_A3_OPCIONES,
  TF3_A3_PROYECTADA,
  TF3_A4_DEVOLUCION,
  TF3_A4_OPCIONES,
  TF3_A4_PROYECTADA,
  TF3_COTIO,
  TF3_MATRIZ_A3,
  TF3_RECUPERO,
  TF3_TARJETAS,
  TF3_VARIABLES,
  type Tf3ActKey,
  type Tf3Placa,
} from "@/lib/tribunal-clase3";
import { cn } from "@/lib/utils";

const pct = (n: number, t: number) => (t ? Math.round((n / t) * 100) : 0);

// --- Estado de la sesión ----------------------------------------------------------------------

export function EstadoSesion3({ slug, act, desde, cerrada, intervalo }: { slug: string; act: Tf3ActKey; desde: number | null; cerrada: boolean; intervalo: number }) {
  const { data } = useResultados(slug, act, intervalo);
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
        <span className={cn("size-[12px] rounded-full", cerrada ? "bg-tf2-gris" : "tf2-latido bg-tf2-rojo")} />
        <span className={cn("tf2-rotulo text-[14px]", cerrada ? "text-tf2-gris" : "text-tf2-rojo")}>{cerrada ? "Votación cerrada" : "En vivo"}</span>
      </span>
      <span className="tf2-mono text-[22px]">
        <b>{data?.responded ?? 0}</b> respuestas
      </span>
      {desde && !cerrada && (
        <span className="tf2-mono text-[18px] tabular-nums text-tf2-gris">
          ⏱ {String(Math.floor(seg / 60)).padStart(2, "0")}:{String(seg % 60).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}

// --- Aviso de actividad (paso 0) ----------------------------------------------------------------

export function AvisoActividad3({ placa, estado, lado }: { placa: Tf3Placa; estado: ReactNode; lado?: ReactNode }) {
  const act = getTf3Actividad(placa.actividad!)!;
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
        <div className="tf2-sube tf2-objeto mt-12 inline-flex items-center gap-6 rounded-[10px] bg-tf2-rojo py-5 pl-7 pr-10 text-white" style={{ "--d": "260ms" } as React.CSSProperties}>
          <span className="text-[56px] leading-none">📱</span>
          <span>
            <span className="tf2-mono block text-[32px] font-semibold uppercase tracking-[0.08em]">Participá en la app · {act.enviar === "VOTAR" ? "Votá" : "Actividad " + act.numero}</span>
            <span className="mt-1 block text-[25px] text-white/90">{act.instruccion}</span>
          </span>
        </div>
        <div className="mt-10">{estado}</div>
      </div>
      {lado ?? (
        <>
          <Pieza x={1170} y={130} r={4} d={300}>
            <Telefono w={340}>
              <PreviaCelular3 act={act.key} />
            </Telefono>
          </Pieza>
          <Pieza x={1540} y={540} r={-4} d={480}>
            <TarjetaQr qr={TF_QR} link={TF_LINK} w={270} />
          </Pieza>
        </>
      )}
    </>
  );
}

function B({ children, on }: { children: ReactNode; on?: boolean }) {
  return <span className={cn("block rounded-[8px] px-2 py-1.5 text-center text-[12px] font-semibold", on ? "bg-tf2-tinta text-white" : "border border-tf2-linea bg-white")}>{children}</span>;
}

function PreviaCelular3({ act }: { act: Tf3ActKey }) {
  const a = getTf3Actividad(act)!;
  return (
    <div className="flex h-full flex-col">
      <p className="tf2-rotulo text-[11px] text-tf2-rojo">Actividad {a.numero}</p>
      <p className="tf2-serif mt-2 text-[19px] font-medium leading-tight">{a.instruccion}</p>
      <div className="mt-4 grid gap-2">
        {act === "tf3_a1" &&
          TF3_TARJETAS.slice(0, 3).map((t, k) => (
            <div key={t.id} className="rounded-[8px] border border-tf2-linea bg-white p-2">
              <p className="text-[12px] leading-tight">{t.texto}</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1">
                <B on={k !== 1}>Contexto</B>
                <B on={k === 1}>Input</B>
              </div>
            </div>
          ))}
        {act === "tf3_a2" &&
          TF3_VARIABLES.slice(0, 5).map((v, k) => (
            <span key={v.id} className={cn("block rounded-[8px] border px-2 py-1.5 text-[12px]", k < 3 ? "border-tf2-tinta bg-tf2-crema" : "border-tf2-linea bg-white")}>
              {k < 3 ? "☑" : "☐"} {v.label}
            </span>
          ))}
        {(act === "tf3_a3" || act === "tf3_a4") &&
          (act === "tf3_a3" ? TF3_A3_OPCIONES : TF3_A4_OPCIONES).map((o) => (
            <span key={o.id} className="block rounded-[8px] border border-tf2-linea bg-white px-2 py-1.5 text-[12px] leading-tight">
              <b>{o.letra}.</b> {o.label}
            </span>
          ))}
      </div>
      <span className="mt-auto block rounded-[10px] bg-tf2-tinta py-2.5 text-center text-[15px] font-semibold text-white">{a.enviar}</span>
    </div>
  );
}

// --- Encabezado de los tableros ---------------------------------------------------------------------

export function CabeceraTablero3({ placa, pregunta, estado }: { placa: Tf3Placa; pregunta: string; estado: ReactNode }) {
  const act = getTf3Actividad(placa.actividad!)!;
  return (
    <div className="absolute inset-x-[120px] top-[96px] flex items-start justify-between gap-10">
      <div className="min-w-0">
        <div className="flex items-center gap-5">
          <Sello tam={20}>Actividad {act.numero}</Sello>
          <span className="tf2-rotulo text-[15px] text-tf2-gris">{act.nombre}</span>
        </div>
        <h2 className={cn("tf2-titular tf2-sube mt-4 max-w-[1250px] leading-[1.04] text-tf2-tinta", pregunta.length > 100 ? "text-[40px]" : pregunta.length > 70 ? "text-[46px]" : "text-[54px]")}>{pregunta}</h2>
      </div>
      <div className="shrink-0 pt-1">{estado}</div>
    </div>
  );
}

function Barra({ label, n, p, marca, className }: { label: ReactNode; n: number; p: number; marca?: "ok" | "no" | null; className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="min-w-0 text-[24px] leading-snug text-tf2-tinta">{label}</span>
        <span className="tf2-mono shrink-0 text-[20px] tabular-nums text-tf2-gris">
          {n} · {p}%
        </span>
      </div>
      <div className="mt-1.5 h-[16px] overflow-hidden rounded-[2px] bg-tf2-linea/60">
        <div className={cn("h-full transition-[width] duration-700", marca === "ok" ? "bg-tf2-musgo" : marca === "no" ? "bg-tf2-gris" : "bg-tf2-azul")} style={{ width: `${p}%` }} />
      </div>
    </div>
  );
}

// --- A1 · ¿Contexto o input? ----------------------------------------------------------------------------

export function TableroA1({ slug, intervalo, devolucion }: { slug: string; intervalo: number; devolucion: boolean }) {
  const { data } = useResultados(slug, "tf3_a1", intervalo);
  const byQ = (data?.summary?.byQuestion as Record<string, Record<string, number>>) ?? {};
  return (
    <div className="absolute inset-x-[120px] bottom-[100px] top-[290px] flex flex-col">
      <div className={cn("grid grid-cols-2 gap-10", !devolucion && "h-full")}>
        {(["contexto", "input"] as const).map((col) => (
          <div key={col} className={cn("tf2-objeto rounded-[6px] p-7", devolucion && "py-5", col === "contexto" ? "bg-tf2-azul-claro" : "bg-tf2-crema")}>
            <p className={cn("tf2-titular uppercase tracking-wide text-tf2-tinta", devolucion ? "text-[40px]" : "text-[52px]")}>{col === "contexto" ? "Contexto" : "Input"}</p>
            <div className={cn("grid", devolucion ? "mt-3 gap-3" : "mt-5 gap-5")}>
              {TF3_TARJETAS.map((t) => {
                const c = byQ[t.id] ?? {};
                const tot = (c.contexto ?? 0) + (c.input ?? 0);
                const n = c[col] ?? 0;
                const correcta = devolucion ? t.respuesta === col : false;
                if (devolucion && !correcta) return null;
                return (
                  <div key={t.id} className={cn("tf2-sube rounded-[4px] bg-tf2-hoja p-4", devolucion && "border-2 border-tf2-musgo")}>
                    <Barra label={<><b className="tf2-mono mr-2 text-tf2-rojo">{t.letra}</b>{t.texto}</>} n={n} p={pct(n, tot)} marca={devolucion ? "ok" : null} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      {devolucion && (
        <div className="tf2-sube relative mx-auto mt-7 w-[1500px] rotate-[-0.6deg]">
          <Cinta x="8%" y={-14} r={-8} />
          <Ficha rotulo="Devolución · sin puntos ni penalidades" tono="hoja" tam={21}>
            {TF3_A1_DEVOLUCION.map((d) => (
              <span key={d} className="block">
                ▸ {d}
              </span>
            ))}
            <span className="tf2-mano mt-2 block text-[34px] text-tf2-azul">«{TF3_A1_CIERRE}»</span>
          </Ficha>
        </div>
      )}
    </div>
  );
}

export const PREGUNTA_A1 = TF3_A1_PROYECTADA;

// --- A2 · ¿Qué necesita saber el Tribunal? --------------------------------------------------------------

export function TableroA2({ slug, intervalo, devolucion }: { slug: string; intervalo: number; devolucion: boolean }) {
  const { data } = useResultados(slug, "tf3_a2", intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Number(data?.summary?.total ?? 0);
  if (devolucion)
    return (
      <div className="absolute inset-x-[120px] bottom-[96px] top-[290px]">
        <Hoja className="px-0 py-4">
          <div className="tf2-rotulo grid grid-cols-[1fr_1.25fr_120px] gap-6 px-8 pb-2 text-[14px] text-tf2-gris">
            <span>Variable necesaria</span>
            <span>¿Qué sabemos hoy?</span>
            <span className="text-right">Sala</span>
          </div>
          {TF3_VARIABLES.map((v, k) => (
            <div key={v.id} className={cn("tf2-sube grid grid-cols-[1fr_1.25fr_120px] items-center gap-6 border-t border-tf2-linea px-8 py-[10px]", !v.necesaria && "opacity-60")} style={{ "--d": `${k * 90}ms` } as React.CSSProperties}>
              <span className="text-[22px] leading-snug">
                <b className="tf2-mono mr-2 text-tf2-rojo">{v.letra}</b>
                {v.label}
                {!v.necesaria && <span className="tf2-rotulo ml-3 text-[12px] text-tf2-gris">accesorio</span>}
              </span>
              <span className="tf2-mono text-[17px] leading-snug text-tf2-grafito">{v.hoy}</span>
              <span className="tf2-mono text-right text-[19px] tabular-nums text-tf2-gris">{pct(counts[v.id] ?? 0, total)}%</span>
            </div>
          ))}
        </Hoja>
        <div className="mt-5 flex justify-center rotate-[-0.5deg]">
          <Mano tam={36} tono="azul">
            «{TF3_A2_ACLARACION}»
          </Mano>
        </div>
      </div>
    );
  return (
    <div className="absolute inset-x-[120px] bottom-[110px] top-[300px] grid grid-cols-2 content-start gap-x-14 gap-y-7">
      {TF3_VARIABLES.map((v) => {
        const n = counts[v.id] ?? 0;
        return <Barra key={v.id} label={<><b className="tf2-mono mr-2 text-tf2-rojo">{v.letra}</b>{v.label}</>} n={n} p={pct(n, total)} />;
      })}
    </div>
  );
}

export const PREGUNTA_A2 = TF3_A2_PROYECTADA;

// --- A3 · ¿Qué hacemos con los agravios? -----------------------------------------------------------------

export function TableroA3({
  slug,
  intervalo,
  devolucion,
  matriz,
  prompt,
  vivo,
}: {
  slug: string;
  intervalo: number;
  devolucion: boolean;
  matriz: boolean;
  prompt: boolean;
  vivo: { estado: "" | "corriendo" | "listo" | "error"; texto: string };
}) {
  const { data } = useResultados(slug, "tf3_a3", intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (vivo.estado) return <ChatbotEnVivo vivo={vivo} />;
  if (prompt) return <PromptCotioProyectado />;
  if (matriz) return <MatrizA3 />;
  return (
    <div className="absolute inset-x-[120px] bottom-[100px] top-[300px] grid grid-cols-[1.1fr_0.9fr] gap-14">
      <div className="grid content-start gap-7">
        {TF3_A3_OPCIONES.map((o) => {
          const n = counts[o.id] ?? 0;
          const marca = devolucion ? (o.id === "b" ? "ok" : "no") : null;
          return (
            <div key={o.id}>
              <Barra label={<><b className="tf2-mono mr-2 text-tf2-rojo">{o.letra}</b>{o.label}</>} n={n} p={pct(n, total)} marca={marca} />
              {devolucion && <p className={cn("tf2-sube tf2-mono mt-1.5 text-[17px]", o.id === "b" ? "text-tf2-musgo" : "text-tf2-grafito")}>{o.veredicto}</p>}
            </div>
          );
        })}
      </div>
      <div className="relative">
        <div className="rotate-[1deg]">
          <Ficha rotulo="Agravio · competencia" tono="crema" tam={20}>
            Rentas no tendría competencia en materia de inspección laboral. <span className="text-tf2-gris">· D2 p.4</span>
          </Ficha>
        </div>
        <div className="mt-6 rotate-[-1deg]">
          <Ficha rotulo="Agravio · prueba" tono="salvia" tam={20}>
            No se produjo la prueba testimonial ofrecida. <span className="text-tf2-gris">· D2 p.1–2</span>
          </Ficha>
        </div>
        {devolucion && (
          <div className="tf2-sube mt-8">
            <Mano tam={34} tono="azul">
              «{TF3_A3_CIERRE}»
            </Mano>
          </div>
        )}
      </div>
    </div>
  );
}

export const PREGUNTA_A3 = TF3_A3_PROYECTADA;

/** Matriz demostrativa (dos filas, sin citas literales): «VER MATRIZ», independiente del voto. */
export function MatrizA3() {
  const cols = "grid grid-cols-[230px_1fr_1fr_1fr_170px] gap-5";
  return (
    <div className="absolute inset-x-[120px] bottom-[100px] top-[290px]">
      <Hoja className="px-0 py-4">
        <div className={cn(cols, "tf2-rotulo px-7 pb-2 text-[13px] text-tf2-gris")}>
          <span>Cuestión</span>
          <span>Agravio del recurrente</span>
          <span>Respuesta DGR</span>
          <span>Pregunta jurídica</span>
          <span>Fuente</span>
        </div>
        {TF3_MATRIZ_A3.map((f, k) => (
          <div key={f.fila} className={cn(cols, "tf2-sube border-t border-tf2-linea px-7 py-4")} style={{ "--d": `${k * 200}ms` } as React.CSSProperties}>
            <span className="tf2-titular text-[28px] leading-tight">{f.fila}</span>
            <span className="text-[20px] leading-snug">{f.agravio}</span>
            <span className="text-[20px] leading-snug">{f.dgr}</span>
            <span className="text-[20px] font-semibold leading-snug text-tf2-azul">{f.pregunta}</span>
            <span className="tf2-mono text-[17px] text-tf2-grafito">{f.fuente}</span>
          </div>
        ))}
      </Hoja>
      <div className="mt-5 flex items-center justify-between gap-6 px-2">
        <Sello tono="tinta" tam={16}>
          Preparada y revisada · páginas cotejadas con el expediente
        </Sello>
        <span className="tf2-mono text-[18px] text-tf2-gris">sin flecha a «sentencia»: agravio → respuesta → cuestión → verificación</span>
      </div>
    </div>
  );
}

/** Tabla en markdown (la respuesta del chatbot) → filas. */
function tablaMarkdown(texto: string): { encabezado: string[]; filas: string[][]; resto: string } | null {
  const lineas = texto.split("\n");
  const ini = lineas.findIndex((l) => l.trim().startsWith("|"));
  if (ini < 0) return null;
  let fin = ini;
  while (fin < lineas.length && lineas[fin].trim().startsWith("|")) fin++;
  const celdas = (l: string) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.replace(/\*\*/g, "").trim());
  const filas = lineas.slice(ini, fin).filter((l) => !/^\s*\|?\s*:?-{2,}/.test(l)).map(celdas);
  if (filas.length < 2) return null;
  return { encabezado: filas[0], filas: filas.slice(1), resto: [...lineas.slice(0, ini), ...lineas.slice(fin)].join("\n").replace(/[#*]/g, "").trim() };
}

function ChatbotEnVivo({ vivo }: { vivo: { estado: string; texto: string } }) {
  const t = vivo.estado === "listo" ? tablaMarkdown(vivo.texto) : null;
  return (
    <div className="absolute inset-x-[120px] bottom-[96px] top-[290px] overflow-hidden">
      <div className="mb-3 flex items-center gap-4">
        <Sello tono="azul" tam={16}>
          🤖 Chatbot en vivo · solo piezas anonimizadas D1–D3
        </Sello>
        <span className="tf2-mono text-[17px] text-tf2-gris">Verificar cada página antes de usarla.</span>
      </div>
      {vivo.estado === "corriendo" && <p className="tf2-mono tf2-cursor text-[26px] text-tf2-grafito">El asistente está leyendo D1, D2 y D3</p>}
      {vivo.estado === "error" && <p className="tf2-mono text-[24px] text-tf2-rojo">El chatbot no respondió. Mostrá la matriz preparada (🧾 Ver matriz).</p>}
      {vivo.estado === "listo" &&
        (t ? (
          <Hoja className="max-h-[620px] overflow-y-auto px-0 py-3">
            <div className="grid gap-4 px-6 pb-2 text-[13px] text-tf2-gris" style={{ gridTemplateColumns: `repeat(${t.encabezado.length}, minmax(0,1fr))` }}>
              {t.encabezado.map((h, k) => (
                <span key={k} className="tf2-rotulo">
                  {h}
                </span>
              ))}
            </div>
            {t.filas.map((f, k) => (
              <div key={k} className="grid gap-4 border-t border-tf2-linea px-6 py-3 text-[20px] leading-snug" style={{ gridTemplateColumns: `repeat(${t.encabezado.length}, minmax(0,1fr))` }}>
                {f.map((c, j) => (
                  <span key={j}>{c}</span>
                ))}
              </div>
            ))}
          </Hoja>
        ) : (
          <Hoja className="max-h-[600px] overflow-hidden p-7">
            <p className="whitespace-pre-line text-[19px] leading-[1.45]">{vivo.texto.replace(/[#*]/g, "")}</p>
          </Hoja>
        ))}
    </div>
  );
}

// --- A4 · ¿Qué falta antes de resolver? --------------------------------------------------------------------

export function TableroA4({ slug, intervalo }: { slug: string; intervalo: number }) {
  const { data } = useResultados(slug, "tf3_a4", intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return (
    <div className="absolute inset-x-[120px] bottom-[110px] top-[300px] grid grid-cols-[1.2fr_0.8fr] gap-14">
      <div className="grid content-start gap-8">
        {TF3_A4_OPCIONES.map((o) => {
          const n = counts[o.id] ?? 0;
          return <Barra key={o.id} label={<><b className="tf2-mono mr-2 text-tf2-rojo">{o.letra}</b>{o.label}</>} n={n} p={pct(n, total)} />;
        })}
        <p className="tf2-mono text-[20px] text-tf2-gris">{total} votos · {TF3_A4_DEVOLUCION[0]}</p>
      </div>
      <div className="relative flex flex-col items-center justify-center">
        <div className="tf2-objeto rotate-[2deg] rounded-[4px] bg-tf2-kraft p-8 text-center">
          <p className="tf2-rotulo text-[14px] text-tf2-grafito">Expediente · D1 a D4</p>
          <p className="tf2-titular mt-4 text-[44px] leading-tight">¿Falta una pieza?</p>
          <span className="mt-5 block border-2 border-dashed border-tf2-grafito px-6 py-4 text-[22px] text-tf2-grafito">D5 · todavía oculta</span>
        </div>
      </div>
    </div>
  );
}

export const PREGUNTA_A4 = TF3_A4_PROYECTADA;

// --- Placa 14 · revelación de D5 (llega del servidor) -------------------------------------------------------

export type Revelacion = {
  texto: string;
  extracto: string[];
  fuenteExtracto: string;
  pregunta: string;
  ficha: { variable: string; evidencia: string; estado: string; fuente: string; efecto: string };
  meses: number;
  desde: string;
};

export function useRevelacion(activo: boolean) {
  const [r, setR] = useState<Revelacion | null>(null);
  useEffect(() => {
    if (!activo || r) return;
    let vivo = true;
    fetch("/api/tribunal/doc/D5", { cache: "no-store" })
      .then((x) => (x.ok ? x.json() : null))
      .then((d) => vivo && d?.revelacion && setR(d.revelacion))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [activo, r]);
  return r;
}

export function MejorProveer({ revelacion, slug, intervalo }: { revelacion: Revelacion | null; slug: string; intervalo: number }) {
  const { data } = useResultados(slug, "tf3_a4", intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (!revelacion) return <p className="tf2-mono absolute left-[1000px] top-[400px] text-[24px] text-tf2-gris">Cargando D5…</p>;
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return (
    <>
      <Pieza i={0} label="Extracto de D5" x={980} y={110} w={840} r={1}>
        <Cinta x="40%" y={-14} />
        <Hoja className="p-8">
          <div className="flex items-baseline justify-between">
            <p className="tf2-rotulo text-[14px] text-tf2-gris">Tribunal Fiscal de Apelación · D5</p>
            <span className="tf2-mono text-[15px] text-tf2-gris">{revelacion.fuenteExtracto}</span>
          </div>
          <div className="tf2-mono mt-4 grid gap-3 text-[18.5px] leading-[1.5]">
            {revelacion.extracto.map((e, k) => (
              <p key={k} className={k === 0 ? "" : "tf2-resalta"}>
                {e}
              </p>
            ))}
          </div>
        </Hoja>
      </Pieza>
      <Pieza i={1} label="Dieciséis meses" x={120} y={640} w={840}>
        <p className="tf2-rotulo text-[14px] text-tf2-gris">Dieciséis meses continuos · desde {revelacion.desde} (mes de la constatación)</p>
        <div className="mt-3 flex gap-[6px]">
          {Array.from({ length: revelacion.meses }, (_, k) => (
            <span key={k} className="flex h-[64px] flex-1 flex-col items-center justify-center rounded-[2px] border-2 border-dashed border-tf2-grafito/50 bg-tf2-hoja/70">
              <span className="tf2-mono text-[12px] text-tf2-grafito">{meses[k % 12]}</span>
              <span className="tf2-mono text-[10px] text-tf2-gris">F.931</span>
            </span>
          ))}
        </div>
        <p className="tf2-mono mt-2 text-[15px] text-tf2-gris">casilleros vacíos: constancias pedidas, todavía no agregadas</p>
      </Pieza>
      <Pieza i={2} label="Ficha de control" x={980} y={560} w={840} r={-1} z={5}>
        <Ficha rotulo="Ficha de control · Actividad 4" tono="hoja" tam={18}>
          <b className="text-tf2-rojo">Variable:</b> {revelacion.ficha.variable}
          <br />
          <b className="text-tf2-rojo">Evidencia solicitada:</b> {revelacion.ficha.evidencia}
          <br />
          <b className="text-tf2-rojo">Estado:</b> {revelacion.ficha.estado} · <b className="text-tf2-rojo">Fuente:</b> {revelacion.ficha.fuente}
          <br />
          <b className="text-tf2-rojo">Efecto:</b> {revelacion.ficha.efecto}
        </Ficha>
      </Pieza>
      <Pieza x={120} y={520} w={840}>
        <p className="tf2-mono text-[18px] text-tf2-grafito">
          La sala votó ({total}): {TF3_A4_OPCIONES.map((o) => `${o.letra} ${pct(counts[o.id] ?? 0, total)}%`).join(" · ")}
        </p>
      </Pieza>
    </>
  );
}

// --- Placa 01 · recupero de la clase 2 ------------------------------------------------------------------------

export function Recupero({ visible }: { visible: boolean }) {
  const r = TF3_RECUPERO;
  if (!visible)
    return (
      <div className="absolute left-[1000px] top-[180px] w-[800px]">
        {[0, 1, 2].map((k) => (
          <div key={k} className="tf2-objeto absolute h-[190px] w-[420px] rounded-[3px] bg-tf2-crema" style={{ left: k * 150, top: k * 150, rotate: `${-5 + k * 5}deg` }} />
        ))}
        <p className="tf2-mano absolute left-[60px] top-[560px] text-[44px] text-tf2-azul">lo que hicimos en la clase 2…</p>
      </div>
    );
  const c = r.desafio.campos;
  return (
    <>
      <Pieza i={0} label="Laboratorio" x={980} y={110} w={420} r={-2}>
        <Ficha rotulo={`Laboratorio · ${r.laboratorio.hicieron} participantes`} tam={20}>
          Al pedido estructurado, lo que más cambió:
          {r.laboratorio.cambios.slice(0, 2).map((x) => (
            <span key={x.label} className="block">
              ▸ {x.label} ({x.n})
            </span>
          ))}
        </Ficha>
      </Pieza>
      <Pieza i={1} label="Contexto" x={1430} y={150} w={380} r={2}>
        <Ficha rotulo="Contexto en comparación" tono="salvia" tam={20}>
          <span className="tf2-titular block text-[64px] leading-none">{pct(r.contexto.conContexto, r.contexto.votaron)}%</span>
          eligió la salida con contexto ({r.contexto.conContexto} de {r.contexto.votaron})
        </Ficha>
      </Pieza>
      <Pieza i={2} label="Fuentes y verificaciones" x={980} y={470} w={830} r={-1}>
        <Hoja className="p-6">
          <p className="tf2-rotulo text-[13px] text-tf2-gris">Desafío final · campos completados (de {r.desafio.empezaron})</p>
          <div className="mt-3 grid grid-cols-4 gap-x-6 gap-y-2">
            {c.map((x) => (
              <span key={x.label} className={cn("tf2-mono text-[17px]", (x.label === "Fuentes" || x.label === "Verificaciones") && "tf2-resalta font-semibold")}>
                {x.label} {x.n}
              </span>
            ))}
          </div>
        </Hoja>
        <Mano className="mt-2 block pl-6" tam={34}>
          completamos el qué; menos el con qué fuentes y cómo verificar
        </Mano>
      </Pieza>
      <Pieza i={3} label="Pedían una sentencia" x={1000} y={760} w={810} r={1}>
        <Etiqueta tono="crema">
          {r.desafio.pedianSentencia} de {r.desafio.tareas} tareas le pedían a la IA redactar o dictar una sentencia
        </Etiqueta>
        <p className="tf2-titular mt-5 text-[34px] leading-tight text-tf2-azul">{r.puente}</p>
      </Pieza>
    </>
  );
}

// --- Matriz COTIO final ---------------------------------------------------------------------------------------

export function MatrizFinal() {
  return (
    <>
      <div className="absolute left-[120px] top-[110px]">
        <p className="tf2-rotulo text-[16px] text-tf2-rojo">Resultado del método · no es una sentencia</p>
        <h1 className="tf2-titular tf2-sube mt-4 text-[80px]">Matriz COTIO del expediente</h1>
      </div>
      <div className="absolute inset-x-[120px] top-[310px]">
        <Hoja className="px-0 py-3">
          {TF3_COTIO.map((c, k) => (
            <div key={k} className="tf2-sube grid grid-cols-[110px_220px_1fr] items-center gap-6 border-b border-tf2-linea px-8 py-4 last:border-0" style={{ "--d": `${k * 120}ms` } as React.CSSProperties}>
              <span className="tf2-titular text-[70px] leading-none text-tf2-rojo">{c.letra}</span>
              <span className="tf2-titular text-[32px]">{c.nombre}</span>
              <span className="text-[26px] leading-snug">{c.caso}</span>
            </div>
          ))}
        </Hoja>
      </div>
      <div className="absolute bottom-[110px] left-[120px] flex items-center gap-5">
        <span className="tf2-rotulo text-[14px] text-tf2-gris">Próximas charlas</span>
        <Etiqueta>4 · análisis contable y probatorio</Etiqueta>
        <Etiqueta tono="crema">5 · redacción y revisión de decisiones</Etiqueta>
      </div>
    </>
  );
}
