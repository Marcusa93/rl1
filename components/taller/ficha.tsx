"use client";

// Ficha de escucha del mediador, digital: se completa en la misma app mientras
// suenan las entrevistas (nadie imprime nada). Queda guardada en la compu y en
// la etapa 2 se copia con un botón para el cotejo mediador vs. IA.

import { useEffect, useState } from "react";
import { BotonCopiar } from "@/components/taller/piezas";
import { cn } from "@/lib/utils";

const LS_FICHA = "tal-ficha-escucha";

const FILAS: { id: string; label: string; hint: string; confidencial?: boolean }[] = [
  { id: "pos", label: "Posiciones", hint: "Qué pide, con sus palabras" },
  { id: "int", label: "Intereses", hint: "Qué necesita de verdad" },
  { id: "emo", label: "Emociones", hint: "Qué siente y cómo lo dice" },
  { id: "dat", label: "Datos a confirmar", hint: "Fechas, montos, hechos a chequear" },
  { id: "conf", label: "CONFIDENCIAL", hint: "Lo que pidió mantener en reserva", confidencial: true },
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

export function FichaEscucha({ compacta }: { compacta?: boolean }) {
  const [datos, setDatos] = useState<Datos>({});
  const [lista, setLista] = useState(false);

  useEffect(() => {
    setDatos(leer());
    setLista(true);
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
          <p className="text-sm font-bold text-teal">Ficha de escucha del mediador</p>
          <p className="text-[11px] text-faint">Se guarda sola en esta compu · {llenas ? `${llenas} campos escritos` : "escriba mientras escucha"}</p>
        </div>
        <BotonCopiar texto={fichaComoTexto(datos)} label="Copiar mi ficha" />
      </div>

      <div className={cn("grid gap-3 p-4", compacta ? "" : "")}>
        {FILAS.map((f) => (
          <div key={f.id} className={cn("rounded-xl border p-3", f.confidencial ? "border-amber-300/50 bg-amber-400/10" : "border-line bg-ink/40")}>
            <p className={cn("text-xs font-bold uppercase tracking-wider", f.confidencial ? "text-amber-300" : "text-teal")}>
              {f.confidencial && "🔒 "}
              {f.label}
            </p>
            <p className="text-[11px] text-faint">{f.hint}{f.confidencial && " · no sale de acá sin su autorización"}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {COLS.map((c) => (
                <div key={c.id}>
                  <p className="mb-1 text-[11px] font-semibold text-muted">{c.label}</p>
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
          <p className="text-xs font-bold uppercase tracking-wider text-violet">💡 Mi hipótesis de acuerdo</p>
          <p className="text-[11px] text-faint">Con lo que cada uno dijo en privado: ¿hay un acuerdo posible que las partes todavía no ven?</p>
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
