"use client";

// Laboratorio de la vista del participante (/doing): la botonera de
// herramientas (ChatGPT, Claude, Gemini, NotebookLM, Pinpoint), los prompts
// armados con el caso para probar acá con IA o abrir en otra herramienta, y
// los materiales del caso para llevarse.

import { useRef, useState } from "react";
import { DescargasCaso, VistaMaterial } from "@/components/doing/documentos";
import { abrirEn, copiar, pedidoParaCopiar, pedirIA } from "@/components/doing/ia";
import { Md } from "@/components/doing/md";
import { HERRAMIENTAS, MATERIALES, PROMPTS_LAB, type Material, type PromptLab } from "@/lib/doing-caso";
import { cn } from "@/lib/utils";

/** Un prompt para probar: editable, con IA acá o en otra herramienta. */
export function TarjetaPrompt({ p, abierta = false, destacada }: { p: PromptLab; abierta?: boolean; destacada?: boolean }) {
  const [ver, setVer] = useState(abierta);
  const [texto, setTexto] = useState(p.texto);
  const [salida, setSalida] = useState<{ texto: string; estado: "cargando" | "listo" | "error" } | null>(null);
  const [aviso, setAviso] = useState("");
  const control = useRef<AbortController | null>(null);

  async function probar() {
    control.current?.abort();
    const ctrl = new AbortController();
    control.current = ctrl;
    setSalida({ texto: "", estado: "cargando" });
    try {
      const t = await pedirIA({
        mensajes: [{ role: "user", content: texto }],
        materiales: p.materiales,
        signal: ctrl.signal,
        onTexto: (x) => setSalida({ texto: x, estado: "cargando" }),
      });
      setSalida({ texto: t, estado: "listo" });
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setSalida({ texto: (e as Error).message, estado: "error" });
    }
  }

  function avisar(m: string) {
    setAviso(m);
    setTimeout(() => setAviso(""), 4500);
  }

  return (
    <div className={cn("rounded-2xl border bg-dg-hoja", destacada ? "border-dg-lacre/50 shadow-sm" : "border-dg-linea")}>
      <button onClick={() => setVer((v) => !v)} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <span className="dg-maquina mt-0.5 shrink-0 rounded bg-dg-azul-claro px-1.5 text-xs text-dg-azul">placa {p.placa}</span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-dg-tinta">{p.titulo}</span>
          <span className="block text-sm leading-snug text-dg-pizarra">{p.para}</span>
        </span>
        <span className="text-sm text-dg-niebla">{ver ? "▲" : "▼"}</span>
      </button>
      {ver && (
        <div className="grid gap-2.5 border-t border-dg-linea px-4 pb-4 pt-3">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            rows={Math.min(10, Math.max(4, Math.ceil(texto.length / 70)))}
            className="dg-maquina w-full rounded-xl border border-dg-linea bg-white px-3 py-2 text-[0.85rem] leading-snug text-dg-tinta outline-none focus:border-dg-verde"
          />
          {p.materiales.length > 0 && (
            <p className="text-xs text-dg-pizarra">
              La IA recibe también: {p.materiales.map((m) => `${MATERIALES[m].emoji} ${MATERIALES[m].corto}`).join(" · ")}
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {salida?.estado === "cargando" ? (
              <button onClick={() => control.current?.abort()} className="rounded-xl bg-dg-tinta px-4 py-2 text-sm font-semibold text-white">
                ■ Detener
              </button>
            ) : (
              <button onClick={probar} disabled={!texto.trim()} className="rounded-xl bg-dg-verde px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">
                ▶ Probar acá con IA
              </button>
            )}
            <button
              onClick={async () => avisar((await copiar(pedidoParaCopiar(texto, p.materiales))) ? "✓ Pedido copiado con el caso." : "No se pudo copiar.")}
              className="rounded-xl border border-dg-linea bg-white px-3 py-2 text-sm font-semibold text-dg-tinta"
            >
              Copiar
            </button>
            {HERRAMIENTAS.slice(0, 3).map((h) => (
              <button
                key={h.id}
                onClick={() => {
                  abrirEn(h, pedidoParaCopiar(texto, p.materiales));
                  avisar(`✓ Copiado. Si ${h.nombre} no lo muestra cargado, pegalo con Ctrl/Cmd + V.`);
                }}
                className="rounded-xl border border-dg-linea bg-white px-3 py-2 text-sm text-dg-tinta hover:border-dg-azul"
              >
                {h.nombre} ↗
              </button>
            ))}
          </div>
          {aviso && <p className="text-xs text-dg-verde">{aviso}</p>}
          {salida && (
            <div className="max-h-[26rem] overflow-auto rounded-xl border border-dg-linea bg-white px-4 py-3">
              {salida.estado === "error" ? (
                <p className="text-sm text-dg-lacre">{salida.texto}</p>
              ) : (
                <Md texto={salida.texto} className={cn("text-sm text-dg-tinta", salida.estado === "cargando" && "dg-cursor")} />
              )}
              {salida.estado === "listo" && (
                <p className="mt-3 border-t border-dashed border-dg-linea pt-2 text-xs text-dg-pizarra">
                  Revisalo como revisarías el trabajo de otro: ¿qué afirma con respaldo y qué supone?
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/** Botonera de herramientas. */
export function Botonera() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {HERRAMIENTAS.map((h) => (
        <a
          key={h.id}
          href={h.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-2xl border border-dg-linea bg-dg-hoja px-4 py-3 transition hover:border-dg-verde"
        >
          <span className="flex items-center justify-between">
            <span className="dg-serif text-xl text-dg-tinta">{h.nombre}</span>
            <span className="text-sm text-dg-niebla group-hover:text-dg-verde">abrir ↗</span>
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-dg-tinta">{h.para}</span>
          <span className="mt-1 block text-xs leading-snug text-dg-pizarra">{h.como}</span>
        </a>
      ))}
    </div>
  );
}

export function Laboratorio() {
  return (
    <div className="grid gap-5">
      <section>
        <h3 className="dg-rotulo mb-2 text-[0.65rem] text-dg-verde">Herramientas</h3>
        <Botonera />
      </section>
      <section>
        <h3 className="dg-rotulo mb-1 text-[0.65rem] text-dg-verde">Prompts armados con el caso</h3>
        <p className="mb-2 text-sm text-dg-pizarra">Probalos acá (la IA recibe los documentos del caso) o abrilos en tu herramienta. Podés editarlos antes.</p>
        <div className="grid gap-2">
          {PROMPTS_LAB.map((p) => (
            <TarjetaPrompt key={p.id} p={p} />
          ))}
        </div>
      </section>
    </div>
  );
}

const ORDEN_CASO: Material[] = ["ficha", "comprobantes", "contraparte", "relato", "plantilla"];

export function CasoParticipante() {
  const [abierto, setAbierto] = useState<Material | null>("ficha");
  return (
    <div className="grid gap-3">
      <p className="text-sm leading-relaxed text-dg-tinta">
        <b>«Los tres comprobantes»</b> · caso ficticio. Boreal Climatización reclama un saldo; Posada Los Alerces (nuestro cliente) dice que pagó con tres transferencias.
        Los comprobantes muestran operaciones bancarias; lo discutido es a qué factura se aplicó cada pago.
      </p>
      <DescargasCaso />
      {ORDEN_CASO.map((m) => (
        <div key={m} className="rounded-2xl border border-dg-linea bg-dg-hoja">
          <button onClick={() => setAbierto((x) => (x === m ? null : m))} className="flex w-full items-center justify-between px-4 py-3 text-left">
            <span className="font-semibold text-dg-tinta">
              {MATERIALES[m].emoji} {MATERIALES[m].nombre}
            </span>
            <span className="text-sm text-dg-niebla">{abierto === m ? "▲" : "▼"}</span>
          </button>
          {abierto === m && (
            <div className="border-t border-dg-linea p-3">
              <VistaMaterial m={m} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
