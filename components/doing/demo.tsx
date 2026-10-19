"use client";

// Demostraciones de IA del deck de /doing (1, 2, 3 y su cierre de estilo).
// Cada demostración tiene pasos: el prompt se puede editar antes de enviarlo,
// se ejecuta en vivo (con los materiales del caso adjuntos del lado del
// servidor) y, si la herramienta falla, hay una respuesta preparada rotulada
// como ilustrativa. Lo que sale se guarda en este navegador: se puede volver
// a la pantalla sin perderlo. El apartado que redacta la demostración 2 es el
// que corrige la demostración de estilo.

import { useEffect, useRef, useState } from "react";
import { VisorMaterial } from "@/components/doing/documentos";
import { abrirEn, pedidoParaCopiar, pedirIA, type Mensaje } from "@/components/doing/ia";
import { Md } from "@/components/doing/md";
import { rotuloBloque } from "@/components/doing/marco";
import { APARTADO_APROBADO, HERRAMIENTAS, MATERIALES, SUBRAYAR, type Demo, type Material } from "@/lib/doing-caso";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

type Resp = { texto: string; fuente: "vivo" | "respaldo"; estado: "cargando" | "listo" | "error"; error?: string; prompt: string };

const CLAVE = (id: string) => `doing-demo-${id}`;
export const CLAVE_APARTADO = "doing-apartado";

function leer<T>(clave: string, defecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : defecto;
  } catch {
    return defecto;
  }
}
function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {}
}

/** Apartado aprobado para la corrección de estilo: el de la demostración 2 (si salió en vivo) o el preparado. */
function useApartado() {
  const [propio] = useState<string | null>(() => leer<string | null>(CLAVE_APARTADO, null));
  return propio;
}

export function DemoIA({ demo, bloque }: { demo: Demo; bloque: number }) {
  const [resps, setResps] = useState<(Resp | null)[]>(() => leer<(Resp | null)[]>(CLAVE(demo.id), []).map((r) => (r?.estado === "cargando" ? null : r)));
  const [subrayar, setSubrayar] = useState(Boolean(demo.subrayar));
  const [visor, setVisor] = useState<Material | null>(null);
  const [copiado, setCopiado] = useState("");
  const apartadoPropio = useApartado();
  const [usarPropio, setUsarPropio] = useState(true);
  const apartado = apartadoPropio && usarPropio ? apartadoPropio : APARTADO_APROBADO;
  const promptDe = (i: number) => (demo.id === "d3b" ? `${demo.pasos[i].prompt}\n\nApartado aprobado:\n"""\n${apartado.trim()}\n"""` : demo.pasos[i].prompt);
  const actual = Math.min(
    demo.pasos.length - 1,
    resps.filter((r) => r?.estado === "listo").length,
  );
  const [edicion, setEdicion] = useState(() => promptDe(actual));
  const control = useRef<AbortController | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const cargando = resps.some((r) => r?.estado === "cargando");
  const terminado = resps.filter((r) => r?.estado === "listo").length >= demo.pasos.length;

  // Al cambiar de paso (o de apartado), el prompt editable vuelve al preparado.
  useEffect(() => {
    setEdicion(promptDe(actual));
  }, [actual, apartado]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!cargando) guardar(CLAVE(demo.id), resps);
  }, [resps, cargando, demo.id]);

  useEffect(() => {
    panel.current?.scrollTo({ top: panel.current.scrollHeight, behavior: "smooth" });
  }, [resps]);

  function poner(i: number, r: Resp | null) {
    setResps((xs) => {
      const n = [...xs];
      n[i] = r;
      return n.slice(0, i + 1);
    });
  }

  async function ejecutar() {
    if (cargando) return;
    const i = actual;
    const prompt = edicion.trim();
    if (!prompt) return;
    const historia: Mensaje[] = [];
    for (let k = 0; k < i; k++) {
      const r = resps[k];
      if (!r) continue;
      historia.push({ role: "user", content: r.prompt }, { role: "assistant", content: r.texto });
    }
    historia.push({ role: "user", content: prompt });
    const ctrl = new AbortController();
    control.current = ctrl;
    poner(i, { texto: "", fuente: "vivo", estado: "cargando", prompt });
    try {
      const texto = await pedirIA({
        mensajes: historia,
        materiales: demo.materiales,
        signal: ctrl.signal,
        onTexto: (t) => setResps((xs) => xs.map((r, k) => (k === i && r ? { ...r, texto: t } : r))),
      });
      setResps((xs) => xs.map((r, k) => (k === i && r ? { ...r, texto, estado: "listo" } : r)));
      if (demo.id === "d2" && i === 1) guardar(CLAVE_APARTADO, texto);
    } catch (e) {
      const abortado = (e as Error).name === "AbortError";
      setResps((xs) =>
        xs.map((r, k) =>
          k === i && r ? (abortado && r.texto ? { ...r, estado: "listo" } : { ...r, estado: "error", error: abortado ? "Detenido." : (e as Error).message }) : r,
        ),
      );
    } finally {
      control.current = null;
    }
  }

  function respaldo() {
    const i = actual;
    const r = demo.pasos[i].respaldo;
    if (!r) return;
    control.current?.abort();
    poner(i, { texto: r, fuente: "respaldo", estado: "listo", prompt: edicion.trim() || promptDe(i) });
  }

  function reiniciar() {
    control.current?.abort();
    setResps([]);
    guardar(CLAVE(demo.id), []);
  }

  function abrir(id: string) {
    const h = HERRAMIENTAS.find((x) => x.id === id);
    if (!h) return;
    abrirEn(h, pedidoParaCopiar(edicion, actual === 0 ? demo.materiales : []));
    setCopiado(h.nombre);
    setTimeout(() => setCopiado(""), 4000);
  }

  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="dg-rotulo flex items-center gap-3 text-dg-lacre">
            <span className="flex size-7 items-center justify-center rounded-full bg-dg-lacre text-[0.75rem] text-white">▶</span>
            Demostración {demo.numero} en vivo · {rotuloBloque(bloque)}
          </p>
          <h1 className="dg-titular tf-sube mt-2 text-[2.9rem] text-dg-tinta">{demo.titulo}</h1>
          <p className="mt-1 text-[1.2rem] text-dg-pizarra">{demo.objetivo}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="dg-rotulo text-[0.6rem] text-dg-pizarra">Materiales que recibe la IA</p>
          <div className="flex flex-wrap justify-end gap-2">
            {demo.materiales.length ? (
              demo.materiales.map((m) => (
                <button
                  key={m}
                  onClick={() => setVisor(m)}
                  className="rounded-full border border-dg-linea bg-dg-hoja px-3 py-1.5 text-[0.9rem] text-dg-tinta transition hover:border-dg-verde"
                  {...rem(`Ver: ${MATERIALES[m].corto}`)}
                >
                  {MATERIALES[m].emoji} {MATERIALES[m].corto}
                </button>
              ))
            ) : (
              <span className="text-[0.9rem] text-dg-niebla">Solo el apartado aprobado</span>
            )}
          </div>
        </div>
      </header>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-[0.92fr_1.08fr] gap-6">
        {/* Pasos y pedido */}
        <div className="flex min-h-0 flex-col gap-3">
          {demo.id === "d3b" && (
            <div className="rounded-xl border border-dg-linea bg-dg-hoja px-4 py-3">
              <p className="flex items-center justify-between gap-3 text-[0.85rem] text-dg-pizarra">
                <span className="dg-rotulo text-[0.6rem]">Apartado aprobado</span>
                {apartadoPropio ? (
                  <button onClick={() => setUsarPropio((v) => !v)} className="text-[0.8rem] text-dg-azul underline-offset-2 hover:underline">
                    {usarPropio ? "usando el de la demostración 2 · usar el preparado" : "usando el preparado · usar el de la demostración 2"}
                  </button>
                ) : (
                  <span className="text-[0.8rem]">preparado (la demostración 2 no dejó uno en vivo)</span>
                )}
              </p>
              <p className="dg-maquina mt-2 line-clamp-4 text-[0.88rem] leading-snug text-dg-tinta">{apartado}</p>
            </div>
          )}
          {demo.pasos.map((p, i) => {
            const hecho = resps[i]?.estado === "listo";
            const esActual = i === actual && !terminado;
            return (
              <div
                key={p.etiqueta}
                className={cn(
                  "rounded-2xl border px-4 py-3 transition",
                  esActual ? "flex min-h-0 flex-1 flex-col border-dg-verde bg-dg-hoja shadow-sm" : hecho ? "border-dg-linea bg-dg-salvia-claro/50" : "border-dashed border-dg-linea bg-dg-hoja/50",
                )}
              >
                <p className="flex items-center gap-2 text-[0.95rem] font-semibold text-dg-tinta">
                  <span className={cn("dg-maquina flex size-6 items-center justify-center rounded-full text-[0.8rem]", hecho ? "bg-dg-verde text-white" : "border border-dg-tinta/30")}>
                    {hecho ? "✓" : i + 1}
                  </span>
                  {p.etiqueta}
                </p>
                {esActual ? (
                  <textarea
                    value={edicion}
                    onChange={(e) => setEdicion(e.target.value)}
                    className="dg-maquina mt-2 min-h-[9rem] w-full flex-1 resize-none rounded-xl border border-dg-linea bg-white px-3 py-2.5 text-[1rem] leading-snug text-dg-tinta outline-none focus:border-dg-verde"
                  />
                ) : (
                  <p className="dg-maquina mt-1 line-clamp-2 text-[0.85rem] text-dg-pizarra">{resps[i]?.prompt ?? p.prompt}</p>
                )}
              </div>
            );
          })}
          <div className="flex flex-wrap items-center gap-2">
            {cargando ? (
              <BotonDemo onClick={() => control.current?.abort()} label="■ Detener" primario />
            ) : (
              <BotonDemo onClick={ejecutar} label={terminado ? "Demostración completa" : `▶ Ejecutar paso ${actual + 1} en vivo`} primario disabled={terminado} />
            )}
            {!terminado && demo.pasos[actual].respaldo && <BotonDemo onClick={respaldo} label="Respuesta preparada" />}
            {demo.subrayar && <BotonDemo onClick={() => setSubrayar((v) => !v)} label="Subrayar certezas" activo={subrayar} />}
            <span className="ml-auto flex items-center gap-1.5">
              {HERRAMIENTAS.slice(0, 3).map((h) => (
                <button key={h.id} onClick={() => abrir(h.id)} className="rounded-lg border border-dg-linea bg-dg-hoja px-2.5 py-1.5 text-[0.82rem] text-dg-tinta hover:border-dg-azul">
                  {h.nombre} ↗
                </button>
              ))}
            </span>
          </div>
          {copiado && <p className="text-[0.85rem] text-dg-verde">✓ Pedido y materiales copiados. Si {copiado} no lo muestra cargado, pegalo con Ctrl/Cmd + V.</p>}
        </div>

        {/* Respuestas */}
        <div ref={panel} className="dg-pantalla min-h-0 max-h-[33rem] overflow-auto rounded-2xl px-6 py-5">
          {!resps.some(Boolean) && (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-dg-niebla">
              <p className="dg-serif text-[2rem]">La respuesta aparece acá</p>
              <p className="text-[1rem]">Ejecutá el paso en vivo. Si la herramienta falla, usá la respuesta preparada.</p>
            </div>
          )}
          {resps.map((r, i) =>
            r ? (
              <div key={i} className={cn("pb-5", i > 0 && "border-t border-dg-linea pt-5")}>
                <p className="mb-2 flex items-center gap-2 text-[0.78rem]">
                  <span className="dg-maquina font-bold text-dg-pizarra">Paso {i + 1}</span>
                  {r.fuente === "vivo" ? (
                    <span className="rounded bg-dg-salvia-claro px-2 py-0.5 font-semibold text-dg-verde">{r.estado === "cargando" ? "● escribiendo en vivo…" : "En vivo"}</span>
                  ) : (
                    <span className="rounded bg-dg-tinta px-2 py-0.5 font-semibold tracking-wide text-white">RESPUESTA PREPARADA · ILUSTRATIVA</span>
                  )}
                </p>
                {r.estado === "error" ? (
                  <p className="rounded-xl bg-dg-lacre-claro px-4 py-3 text-[1rem] text-dg-lacre">
                    {r.error} {demo.pasos[i].respaldo && "Podés usar la respuesta preparada."}
                  </p>
                ) : (
                  <Md texto={r.texto} subrayar={subrayar && demo.subrayar ? SUBRAYAR : undefined} className={cn("text-[1.08rem] text-dg-tinta", r.estado === "cargando" && "dg-cursor")} />
                )}
              </div>
            ) : null,
          )}
          {resps.some(Boolean) && !cargando && (
            <button onClick={reiniciar} className="mt-2 text-[0.8rem] text-dg-niebla underline-offset-2 hover:underline">
              Reiniciar esta demostración
            </button>
          )}
        </div>
      </div>
      {visor && <VisorMaterial m={visor} onCerrar={() => setVisor(null)} />}
    </article>
  );
}

function BotonDemo({ onClick, label, primario, activo, disabled }: { onClick: () => void; label: string; primario?: boolean; activo?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      {...rem(label, activo)}
      className={cn(
        "rounded-xl px-4 py-2.5 text-[0.95rem] font-semibold transition disabled:opacity-40",
        primario ? "bg-dg-verde text-white hover:brightness-110" : activo ? "border border-dg-lacre bg-dg-lacre text-white" : "border border-dg-linea bg-dg-hoja text-dg-tinta hover:border-dg-verde",
      )}
    >
      {label}
    </button>
  );
}
