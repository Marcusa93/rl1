"use client";

// Ficha de escucha del mediador, digital: se completa en la misma app mientras
// suenan las entrevistas (nadie imprime nada). Es UNA sola en todo el taller:
// vive acá, se abre desde el encabezado con «Mi ficha», se copia para el cotejo
// con la IA (etapa 2) y se descarga para llevársela.

import { useEffect, useState } from "react";
import { BotonCopiar } from "@/components/taller/piezas";
import { cn } from "@/lib/utils";

const LS_FICHA = "tal-ficha-escucha";

const FILAS: {
  id: string;
  label: string;
  hint: string;
  confidencial?: boolean;
}[] = [
  { id: "pos", label: "Posiciones", hint: "Qué pide, con sus palabras" },
  { id: "int", label: "Intereses", hint: "Qué necesita de verdad" },
  { id: "emo", label: "Emociones", hint: "Qué siente y cómo lo dice" },
  {
    id: "dat",
    label: "Datos a confirmar",
    hint: "Fechas, montos, hechos a chequear",
  },
  {
    id: "conf",
    label: "CONFIDENCIAL",
    hint: "Lo que pidió mantener en reserva",
    confidencial: true,
  },
  { id: "pre", label: "Preguntas", hint: "Qué le preguntaría después" },
];
const COLS = [
  { id: "l", label: "☕ Lucía" },
  { id: "d", label: "🔧 Diego" },
];

type Datos = Record<string, string>;

function leer(): Datos {
  try {
    return JSON.parse(localStorage.getItem(LS_FICHA) ?? "{}");
  } catch {
    return {};
  }
}

export function fichaComoTexto(d: Datos): string {
  const bloque = (c: (typeof COLS)[number]) =>
    `— ${c.label.replace(/^\S+\s/, "").toUpperCase()} —\n${FILAS.map((f) => `${f.label}: ${(d[`${f.id}-${c.id}`] ?? "").trim() || "—"}`).join("\n")}`;
  return `MI FICHA DE ESCUCHA (completada a mano durante las entrevistas)\n\n${COLS.map(bloque).join("\n\n")}\n\nHipótesis de acuerdo (solo del mediador): ${(d["hipotesis"] ?? "").trim() || "—"}`;
}

/** Se la lleva puesta: un .txt con la ficha completa. */
function descargar(datos: Datos) {
  const url = URL.createObjectURL(
    new Blob([fichaComoTexto(datos)], { type: "text/plain;charset=utf-8" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "mi-ficha-de-escucha.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function FichaEscucha({ compacta }: { compacta?: boolean }) {
  const [datos, setDatos] = useState<Datos>({});
  const [lista, setLista] = useState(false);

  useEffect(() => {
    setDatos(leer());
    setLista(true);
    // Si la abren desde otro lugar de la app, toma lo último escrito.
    const sync = () => setDatos(leer());
    window.addEventListener("focus", sync);
    return () => window.removeEventListener("focus", sync);
  }, []);

  function set(k: string, v: string) {
    setDatos((prev) => {
      const next = { ...prev, [k]: v };
      try {
        localStorage.setItem(LS_FICHA, JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  if (!lista) return null;
  const llenas = Object.values(datos).filter((v) => v.trim()).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-teal/40 bg-ink-2/40">
      <div className="flex items-center gap-2 border-b border-line/60 bg-teal/10 px-4 py-3">
        <span className="text-xl">📝</span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-teal">
            Ficha de escucha del mediador
          </p>
          <p className="text-[11px] text-faint">
            Se guarda sola en esta compu ·{" "}
            {llenas ? `${llenas} campos escritos` : "escriba mientras escucha"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <BotonCopiar texto={fichaComoTexto(datos)} label="Copiar mi ficha" />
          <button
            onClick={() => descargar(datos)}
            className="shrink-0 rounded-lg border border-line bg-panel/70 px-3 py-1.5 text-sm font-medium text-muted transition hover:text-teal active:scale-95"
          >
            ⬇️ Descargar
          </button>
        </div>
      </div>

      <div className={cn("grid gap-3 p-4", compacta ? "" : "")}>
        {FILAS.map((f) => (
          <div
            key={f.id}
            className={cn(
              "rounded-xl border p-3",
              f.confidencial
                ? "border-amber-300/50 bg-amber-400/10"
                : "border-line bg-ink/40",
            )}
          >
            <p
              className={cn(
                "text-xs font-bold uppercase tracking-wider",
                f.confidencial ? "text-amber-300" : "text-teal",
              )}
            >
              {f.confidencial && "🔒 "}
              {f.label}
            </p>
            <p className="text-[11px] text-faint">
              {f.hint}
              {f.confidencial && " · no sale de acá sin su autorización"}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {COLS.map((c) => (
                <div key={c.id}>
                  <p className="mb-1 text-[11px] font-semibold text-muted">
                    {c.label}
                  </p>
                  <textarea
                    value={datos[`${f.id}-${c.id}`] ?? ""}
                    onChange={(e) => set(`${f.id}-${c.id}`, e.target.value)}
                    rows={compacta ? 2 : 3}
                    className="w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-teal/60"
                    placeholder="…"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-xl border border-violet/40 bg-violet/10 p-3">
          <p className="text-xs font-bold uppercase tracking-wider text-violet">
            💡 Mi hipótesis de acuerdo
          </p>
          <p className="text-[11px] text-faint">
            Con lo que cada uno dijo en privado: ¿hay un acuerdo posible que las
            partes todavía no ven?
          </p>
          <textarea
            value={datos["hipotesis"] ?? ""}
            onChange={(e) => set("hipotesis", e.target.value)}
            rows={2}
            className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2 text-sm leading-relaxed outline-none placeholder:text-faint focus:border-violet/60"
            placeholder="…"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * La ficha es UNA sola en todo el taller: este botón vive en el encabezado y la
 * abre encima de lo que esté haciendo, así se escribe mientras suena el audio
 * sin perder el paso en el que va.
 */
export function FichaBoton({
  grande,
}: {
  /** Versión ancha, para el paso que trabaja con la ficha. */ grande?: boolean;
}) {
  const [abierta, setAbierta] = useState(false);
  const [llenas, setLlenas] = useState(0);

  useEffect(() => {
    const contar = () =>
      setLlenas(Object.values(leer()).filter((v) => String(v).trim()).length);
    contar();
    const id = setInterval(contar, 4000);
    return () => clearInterval(id);
  }, [abierta]);

  return (
    <>
      {grande ? (
        <button
          onClick={() => setAbierta(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-teal/50 bg-teal/10 px-4 py-3 text-left transition hover:bg-teal/20 active:scale-[0.99]"
        >
          <span className="text-2xl">📝</span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-teal">
              Abrir mi ficha de escucha
            </span>
            <span className="block text-[11px] text-faint">
              Es la misma de todo el taller ·{" "}
              {llenas > 0 ? `${llenas} campos escritos` : "todavía vacía"} ·
              también está arriba, en 📝 Mi ficha
            </span>
          </span>
          <span className="shrink-0 text-teal">→</span>
        </button>
      ) : (
        <button
          onClick={() => setAbierta(true)}
          title="Su ficha de escucha"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-teal/50 bg-teal/10 px-2.5 py-1.5 text-xs font-semibold text-teal transition hover:bg-teal/20 active:scale-95"
        >
          <span className="text-base leading-none">📝</span>
          <span className="hidden sm:inline">Mi ficha</span>
          {llenas > 0 && (
            <span className="rounded-full bg-teal/25 px-1.5 font-mono text-[10px]">
              {llenas}
            </span>
          )}
        </button>
      )}

      {abierta && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-ink/80 p-3 backdrop-blur-sm sm:p-6"
          onClick={() => setAbierta(false)}
        >
          <div
            className="rise max-h-full w-full max-w-4xl overflow-y-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm text-muted">
                Escriba mientras escucha · se guarda sola
              </p>
              <button
                onClick={() => setAbierta(false)}
                className="rounded-full border border-line bg-panel px-3 py-1.5 text-sm font-semibold"
              >
                Cerrar ✕
              </button>
            </div>
            <FichaEscucha />
          </div>
        </div>
      )}
    </>
  );
}
