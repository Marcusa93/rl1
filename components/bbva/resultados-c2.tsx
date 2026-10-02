"use client";

// Clase 2 · visualizaciones colectivas simples: distribuciones por pregunta y
// las cadenas de operaciones más repetidas. Nada individual ni identificable.
// Proyector (~70rem × 30rem) o, con `compacto`, el celular del docente.

import type { ActividadBbva, ResultadosBbva } from "@/lib/bbva-clase";
import { porc } from "./use-resultados";

const NARANJA = "#e2582b";
const TINTA = "#17181b";
const PIZARRA = "#5d7087";

interface Props {
  act: ActividadBbva;
  data: ResultadosBbva | null;
  compacto?: boolean;
}

/** Una columna por pregunta; barras horizontales ordenadas como en el celular. */
export function Distribuciones({ act, data, compacto = false }: Props) {
  const items = act.items.filter((it) => !it.id.startsWith("txt_") && it.opciones.length > 1);
  const hay = items.some((it) => Object.keys(data?.items?.[it.id] ?? {}).length > 0);
  return (
    <div className={`relative flex h-full w-full ${compacto ? "flex-col gap-5" : "gap-[2.6rem]"}`}>
      {items.map((it) => {
        const c = data?.items?.[it.id] ?? {};
        const base = data?.respondieronItem?.[it.id] ?? 0;
        const max = Math.max(0, ...it.opciones.map((o) => c[o.id] ?? 0));
        const filas = it.opciones;
        const apretado = filas.length > 7;
        return (
          <section key={it.id} className="flex min-w-0 flex-1 flex-col">
            <p className={`font-mono uppercase text-naranja ${compacto ? "text-[0.62rem] tracking-[0.12em]" : "text-[0.9rem] tracking-[0.18em]"}`}>
              {it.rotulo} {base ? <span className="text-gris">· n {base}</span> : null}
            </p>
            <p className={`bbva-serif text-tinta ${compacto ? "text-[0.95rem] leading-snug" : "mt-[0.2rem] text-[1.45rem] leading-[1.12]"}`}>{it.texto}</p>
            <ul className={`flex flex-1 flex-col justify-center ${compacto ? "mt-2 gap-1.5" : apretado ? "mt-[0.9rem] gap-[0.45rem]" : "mt-[1rem] gap-[0.7rem]"}`}>
              {filas.map((o) => {
                const v = c[o.id] ?? 0;
                const top = v > 0 && v === max;
                return (
                  <li key={o.id} className="flex items-center gap-[0.7em]">
                    <span
                      className={`bbva-titular shrink-0 truncate ${compacto ? "w-[7.5rem] text-[0.8rem]" : apretado ? "w-[11rem] text-[1.2rem]" : "w-[12rem] text-[1.45rem]"} leading-none ${
                        top ? "text-tinta" : "text-grafito"
                      }`}
                    >
                      {o.label}
                    </span>
                    <span className={`relative min-w-0 flex-1 bg-papel-2 ${compacto ? "h-3" : apretado ? "h-[1.35rem]" : "h-[1.8rem]"}`}>
                      <span
                        className="absolute inset-y-0 left-0 transition-[width] duration-700 ease-out"
                        style={{ width: `${max ? (v / max) * 100 : 0}%`, background: top ? NARANJA : v ? TINTA : "transparent" }}
                      />
                    </span>
                    <span className={`shrink-0 text-right font-mono tabular-nums text-grafito ${compacto ? "w-8 text-[0.65rem]" : "w-[3.6rem] text-[1rem]"}`}>
                      {base ? `${porc(v, base)}%` : "—"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {act.tipo === "metodo" && <Cadenas data={data} act={act} compacto={compacto} />}
      {!hay && (
        <p className={`bbva-mano absolute text-naranja ${compacto ? "bottom-0 right-0 text-lg" : "bottom-[1rem] right-[1rem] text-[2rem]"}`}>
          esperando respuestas…
        </p>
      )}
    </div>
  );
}

/** Las cadenas completas que más se repiten (RECIBIR → … ). */
function Cadenas({ data, act, compacto }: { data: ResultadosBbva | null; act: ActividadBbva; compacto: boolean }) {
  const metodo = act.items.find((i) => i.id === "metodo");
  const label = (id: string) => (metodo?.opciones.find((o) => o.id === id)?.label ?? id).toUpperCase();
  const top = Object.entries(data?.items?.cadena ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, compacto ? 3 : 4);
  return (
    <section className={`flex min-w-0 flex-col ${compacto ? "" : "w-[34%] shrink-0"}`}>
      <p className={`font-mono uppercase text-naranja ${compacto ? "text-[0.62rem] tracking-[0.12em]" : "text-[0.9rem] tracking-[0.18em]"}`}>Las cadenas</p>
      <p className={`bbva-serif text-tinta ${compacto ? "text-[0.95rem]" : "mt-[0.2rem] text-[1.45rem] leading-[1.12]"}`}>Las que más se repiten</p>
      <ol className={`flex flex-1 flex-col justify-center ${compacto ? "mt-2 gap-2" : "mt-[1rem] gap-[1rem]"}`}>
        {top.length === 0 && <li className="font-mono text-[0.9rem] text-gris">—</li>}
        {top.map(([cadena, n], i) => (
          <li
            key={cadena}
            className={`bbva-recorte ${compacto ? "px-2 py-1.5" : "px-[1rem] py-[0.7rem]"}`}
            style={{ rotate: `${[-1, 0.8, -0.5, 1.2][i % 4]}deg` }}
          >
            <p className={`bbva-titular leading-[1.1] text-tinta ${compacto ? "text-[0.78rem]" : "text-[1.25rem]"}`}>
              RECIBIR
              {cadena.split(">").map((p, k) => (
                <span key={k}>
                  <span style={{ color: PIZARRA }}> → </span>
                  {label(p)}
                </span>
              ))}
            </p>
            <p className={`font-mono text-gris ${compacto ? "text-[0.6rem]" : "mt-[0.2rem] text-[0.85rem]"}`}>
              {n} {n === 1 ? "persona" : "personas"}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
