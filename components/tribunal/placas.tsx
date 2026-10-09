"use client";

// Placas del ciclo del Tribunal Fiscal: el texto literal del Dr. Leal con
// una composición editorial (una por forma de placa), la portada, el ingreso,
// las pantallas de actividad y la síntesis. Todo en rem: el deck escala.

import { useState } from "react";
import { useLive } from "@/components/use-live";
import { FranjaRecuerdo, ResultadosTf } from "@/components/tribunal/resultados";
import { Unidad } from "@/components/tribunal/revelado";
import type { Moderacion } from "@/lib/moderacion";
import { rem } from "@/lib/remoto";
import {
  getActividadTf,
  pasosPlaca,
  TF_EQUIPO,
  TF_INSTITUCION,
  TF_LINK,
  TF_MATERIAL,
  TF_QR,
  TF_RESPUESTA_IA,
  type TfClase,
  type TfCuerpo,
  type TfPlaca,
  type TfRespuestaIa,
  type TfSlide,
} from "@/lib/tribunal";
import { cn } from "@/lib/utils";

export type Proyectar = (activity: string, proyectar: boolean) => void;

const retraso = (s: number) => ({ animationDelay: `${s}s` });

// --- Placa de contenido ---------------------------------------------------------------------------

export function PlacaTf({ clase, placa, intervalo }: { clase: TfClase; placa: TfPlaca; intervalo: number }) {
  const recuerdo = placa.recuerda ? getActividadTf(clase, placa.recuerda) : undefined;
  // Los banners aparecen junto con la última parte de la placa (revelado paso a paso).
  const ultimo = Math.max(0, pasosPlaca(placa) - 1);
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-10">
        <div className="min-w-0">
          <p className="tf-rotulo flex items-center gap-3 text-tf-petroleo">
            <span className="h-px w-8 bg-tf-petroleo" />
            {clase.etiqueta}
          </p>
          <h1 className="tf-titular tf-sube mt-4 max-w-[60rem] text-[3.35rem] text-tf-tinta">{placa.titulo}</h1>
        </div>
        <span className="tf-serif shrink-0 text-[5.5rem] font-light leading-[0.8] text-tf-celeste tabular-nums">{placa.num}</span>
      </header>
      <div className="mt-8 flex flex-1 flex-col justify-center">
        <Cuerpo c={placa.cuerpo} clase={clase} tramoActual={placa.tramo} />
      </div>
      {(recuerdo || placa.banner || placa.material) && (
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          {recuerdo ? <FranjaRecuerdo slug={clase.slug} act={recuerdo} intervalo={intervalo} /> : <span />}
          {placa.banner && (
            <Unidad i={ultimo}>
              <Banner texto={placa.banner} />
            </Unidad>
          )}
          {placa.material && (
            <Unidad i={ultimo}>
              <Banner rotulo="Material del encuentro" texto={`En su celular · ${TF_LINK.split("/")[0]}${TF_MATERIAL}`} />
            </Unidad>
          )}
        </div>
      )}
    </article>
  );
}

/** Banner complementario: anuncia la actividad que sigue (o el material), sin competir con la placa. */
function Banner({ texto, rotulo = "Actividad en vivo" }: { texto: string; rotulo?: string }) {
  return (
    <div className="tf-sube flex items-center gap-3 rounded-full border border-tf-ocre/50 bg-tf-ocre-claro px-5 py-2.5" style={retraso(0.6)}>
      <span className="size-2 animate-pulse rounded-full bg-tf-ocre" />
      <span className="tf-rotulo text-[0.65rem] text-tf-ocre">{rotulo}</span>
      <span className="text-base font-medium text-tf-tinta">{texto}</span>
    </div>
  );
}

function Cuerpo({ c, clase, tramoActual }: { c: TfCuerpo; clase: TfClase; tramoActual: number }) {
  switch (c.forma) {
    case "lema":
      return <Lema lema={c.lema} items={c.items} kickers={c.kickers} />;
    case "recorrido":
      return <Recorrido clase={clase} actual={tramoActual} grande />;
    case "preguntas":
      return <Preguntas preguntas={c.preguntas} cierre={c.cierre} />;
    case "verbos":
      return <Verbos definicion={c.definicion} verbos={c.verbos} items={c.items} />;
    case "generativa":
      return <Generativa definicion={c.definicion} imita={c.imita} cierre={c.cierre} />;
    case "flujo":
      return <Flujo pares={c.pares} cierre={c.cierre} />;
    case "columnas":
      return c.cita ? <Pedidos c={c} /> : <BuscarGenerar c={c} />;
    case "documento":
      return <Documento items={c.items} />;
    case "expediente":
      return <Expediente items={c.items} cierre={c.cierre} />;
    case "planilla":
      return <Planilla items={c.items} cierre={c.cierre} />;
    case "perfiles":
      return <Perfiles pares={c.pares} cierre={c.cierre} />;
    case "matriz":
      return <Matriz pares={c.pares} />;
    case "reserva":
      return <Reserva encabezado={c.encabezado} items={c.items} cierre={c.cierre} />;
    case "caso":
      return <Caso c={c} />;
    case "instruccion":
      return <Instruccion encabezado={c.encabezado} items={c.items} respuesta={c.respuesta} />;
    case "acn":
      return <Acn pares={c.pares} cierre={c.cierre} />;
    case "ideas":
      return <Ideas items={c.items} proxima={c.proxima} />;
  }
}

/** Conclusión de una placa: separada de los componentes, con una regla a la izquierda. Aparece en su paso. */
function Conclusion({ texto, paso, grande }: { texto: string; paso: number; grande?: boolean }) {
  return (
    <Unidad
      as="p"
      i={paso}
      label={texto}
      className={cn("tf-serif mt-12 border-l-[0.35rem] border-tf-petroleo pl-6 leading-snug text-tf-azul", grande ? "text-[2.3rem]" : "text-[1.9rem]")}
    >
      {texto}
    </Unidad>
  );
}

// 02 · Propósito
function Lema({ lema, items, kickers }: { lema: string; items: string[]; kickers: string[] }) {
  return (
    <div className="flex flex-col">
      <p className="tf-titular tf-sube max-w-[60rem] text-[3.2rem] text-tf-azul" style={retraso(0.15)}>
        {lema}
      </p>
      <div className="relative mt-14 grid grid-cols-3 gap-6 pt-10">
        <span aria-hidden className="tf-marca absolute left-[16%] right-[16%] top-[2.5rem] h-px bg-tf-petroleo/40" style={retraso(0.5)} />
        {items.map((it, i) => (
          <Unidad key={it} i={i} label={it} className="relative rounded-2xl border border-tf-linea bg-white p-6">
            <span className="absolute -top-3 left-6 flex size-6 items-center justify-center rounded-full bg-tf-petroleo text-xs font-semibold text-white">
              {i + 1}
            </span>
            <p className="tf-rotulo text-[0.65rem] text-tf-petroleo">{kickers[i]}</p>
            <p className="mt-3 text-[1.45rem] leading-snug text-tf-tinta">{it}</p>
          </Unidad>
        ))}
      </div>
    </div>
  );
}

// 03 · Recorrido (también es la línea de tiempo del pie de cada placa)
export function Recorrido({ clase, actual, grande }: { clase: TfClase; actual: number; grande?: boolean }) {
  if (!grande)
    return (
      <div className="flex w-56 items-center gap-1" aria-label="Avance de la clase">
        {clase.tramos.map((t, i) => (
          <span
            key={t.rango}
            title={`${t.rango} · ${t.nombre}`}
            className={cn("h-1.5 rounded-full", t.pausa ? "tf-trama bg-tf-celeste" : i <= actual ? "bg-tf-petroleo" : "bg-tf-celeste", i === actual && "h-2.5")}
            style={{ flexGrow: t.minutos, flexBasis: 0 }}
          />
        ))}
      </div>
    );
  return (
    <div className="flex flex-col justify-center">
      <div className="flex w-full items-start gap-2">
        {clase.tramos.map((t, i) => (
          <div key={t.rango} className="tf-sube min-w-[8.5rem]" style={{ flexGrow: t.minutos, flexBasis: 0, ...retraso(0.2 + i * 0.12) }}>
            <div className={cn("h-4 rounded-full", t.pausa ? "tf-trama bg-tf-celeste" : "bg-tf-petroleo")} style={{ opacity: t.pausa ? 1 : 0.55 + i * 0.1 }} />
            <p className="tf-serif mt-5 text-[2.2rem] leading-none text-tf-tinta tabular-nums">{t.rango}</p>
            <p className={cn("mt-2 text-[1.3rem] leading-snug", t.pausa ? "text-tf-niebla" : "text-tf-pizarra")}>{t.nombre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 04 · Diagnóstico inicial
function Preguntas({ preguntas, cierre }: { preguntas: string[]; cierre: string }) {
  return (
    <div className="flex flex-col">
      <ol className="relative ml-4 grid gap-7 border-l border-tf-petroleo/30 pl-10">
        {preguntas.map((p, i) => (
          <Unidad as="li" key={p} i={i} label={p} className="relative">
            <span className="absolute -left-[3.2rem] top-1 flex size-8 items-center justify-center rounded-full border border-tf-petroleo bg-white text-sm font-semibold text-tf-petroleo">
              {i + 1}
            </span>
            <p className="tf-titular text-[2.8rem] text-tf-tinta">{p}</p>
          </Unidad>
        ))}
      </ol>
      <Unidad as="p" i={preguntas.length} label={cierre} className="mt-12 flex items-center gap-3 text-[1.35rem] italic text-tf-pizarra">
        <span className="h-px w-10 bg-tf-pizarra/50" />
        {cierre}
      </Unidad>
    </div>
  );
}

// 05 · Inteligencia artificial
function Verbos({ definicion, verbos, items }: { definicion: string; verbos: string[]; items: string[] }) {
  // Resalta los cuatro verbos dentro de la definición, sin tocar el texto.
  const partes: { texto: string; verbo: boolean }[] = [];
  let resto = definicion;
  for (const v of verbos) {
    const i = resto.indexOf(v);
    if (i < 0) continue;
    if (i > 0) partes.push({ texto: resto.slice(0, i), verbo: false });
    partes.push({ texto: v, verbo: true });
    resto = resto.slice(i + v.length);
  }
  if (resto) partes.push({ texto: resto, verbo: false });
  const glifos = [GlifoPatrones, GlifoClasificar, GlifoPredecir, GlifoGenerar];
  return (
    <div className="flex flex-col">
      <p className="tf-titular tf-sube max-w-[62rem] text-[2.55rem] text-tf-tinta" style={retraso(0.1)}>
        {partes.map((p, i) =>
          p.verbo ? (
            <span key={i} className="relative whitespace-nowrap text-tf-petroleo">
              {p.texto}
              <span aria-hidden className="tf-marca absolute inset-x-0 -bottom-1 h-[0.2rem] rounded-full bg-tf-agua" style={retraso(0.45 + i * 0.08)} />
            </span>
          ) : (
            <span key={i}>{p.texto}</span>
          ),
        )}
      </p>
      <div className="mt-10 grid grid-cols-4 gap-4">
        {verbos.map((v, i) => {
          const G = glifos[i];
          return (
            <div key={v} className="tf-sube flex items-center gap-4 rounded-2xl border border-tf-linea bg-white px-5 py-4" style={retraso(0.4 + i * 0.1)}>
              <G className="size-12 shrink-0 text-tf-azul" />
              <span className="text-[1.3rem] font-medium leading-tight text-tf-tinta first-letter:uppercase">{v}</span>
            </div>
          );
        })}
      </div>
      <ul className="mt-12 grid grid-cols-3 gap-6">
        {items.map((it, i) => (
          <Unidad as="li" key={it} i={i} label={it} className="border-t-2 border-tf-azul pt-4 text-[1.5rem] leading-snug text-tf-tinta">
            {it}
          </Unidad>
        ))}
      </ul>
    </div>
  );
}

// 06 · IA generativa
function Generativa({ definicion, imita, cierre }: { definicion: string; imita: string; cierre: string }) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-[1.15fr_1fr] items-center gap-12">
        <p className="tf-titular tf-sube text-[2.45rem] text-tf-tinta" style={retraso(0.1)}>
          {definicion}
        </p>
        <Unidad i={0} label={imita} className="relative">
          <DocumentoSimulado filas={9} className="rotate-[1.2deg]" />
          {/* Lupa: el contenido hay que examinarlo */}
          <div className="absolute -bottom-5 -left-6 flex items-center gap-3 rounded-xl border border-tf-ocre/50 bg-tf-ocre-claro px-4 py-3 shadow-sm">
            <GlifoLupa className="size-7 shrink-0 text-tf-ocre" />
            <span className="text-[1.15rem] font-medium text-tf-tinta">{imita}</span>
          </div>
        </Unidad>
      </div>
      <Conclusion texto={cierre} paso={1} grande />
    </div>
  );
}

// 07 · Cuatro elementos básicos
function Flujo({ pares, cierre }: { pares: { k: string; v: string }[]; cierre: string }) {
  const glifos = [GlifoModelo, GlifoDatos, GlifoInstruccion, GlifoRespuesta];
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <div className="grid w-full grid-cols-[1fr_auto_1fr_auto_1fr_auto_1.15fr] items-stretch gap-3">
          {pares.map((p, i) => {
            const G = glifos[i];
            const ultimo = i === pares.length - 1;
            return [
              i > 0 && (
                <Unidad as="span" key={`s${i}`} i={i} className="self-center text-center text-[2rem] font-light text-tf-niebla">
                  {ultimo ? "→" : "+"}
                </Unidad>
              ),
              <Unidad
                key={p.k}
                i={i}
                label={`${p.k} · ${p.v}`}
                className={cn("flex flex-col gap-4 rounded-2xl px-6 py-7", ultimo ? "border-2 border-dashed border-tf-petroleo bg-white" : "border border-tf-linea bg-white")}
              >
                <G className={cn("size-11", ultimo ? "text-tf-petroleo" : "text-tf-azul")} />
                <p className={cn("tf-rotulo text-[0.8rem]", ultimo ? "text-tf-petroleo" : "text-tf-azul")}>{p.k}</p>
                <p className="tf-serif text-[1.6rem] leading-tight text-tf-tinta">{p.v}</p>
              </Unidad>,
            ];
          })}
        </div>
      </div>
      <Conclusion texto={cierre} paso={pares.length} />
    </div>
  );
}

// 08 · Buscar / generar
function BuscarGenerar({ c }: { c: Extract<TfCuerpo, { forma: "columnas" }> }) {
  const glifos = [GlifoBuscar, GlifoGenerar];
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-8">
        {c.columnas.map((col, i) => {
          const G = glifos[i];
          return (
            <Unidad key={col.k} i={i} label={col.k} className="rounded-2xl border border-tf-linea bg-white p-8">
              <div className="flex items-center gap-4">
                <G className="size-12 text-tf-azul" />
                <p className="tf-titular text-[2.4rem] tracking-[0.04em] text-tf-azul">{col.k}</p>
              </div>
              <div className="mt-6 grid gap-3">
                {col.lineas.map((l, j) => (
                  <p key={l} className={cn("text-[1.7rem] leading-snug", j === 0 ? "text-tf-tinta" : "text-tf-pizarra")}>
                    {l}
                  </p>
                ))}
              </div>
            </Unidad>
          );
        })}
      </div>
      {/* Las dos columnas desembocan en la misma advertencia. */}
      <Unidad i={c.columnas.length} label={c.cierre} className="flex flex-col">
        <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="h-14 w-full text-tf-petroleo/60">
          <path d="M25 0 V5 H75 V0 M50 5 V10" fill="none" stroke="currentColor" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="tf-serif mx-auto rounded-2xl bg-tf-azul px-10 py-6 text-center text-[2.1rem] leading-snug text-white">{c.cierre}</p>
      </Unidad>
    </div>
  );
}

// 10 · Dos formas de pedir ayuda
function Pedidos({ c }: { c: Extract<TfCuerpo, { forma: "columnas" }> }) {
  const [abierto, controlable] = c.columnas;
  return (
    <div className="flex flex-col">
      <div className="grid min-h-[20rem] grid-cols-2 items-stretch gap-8">
        <Unidad i={0} label={abierto.k} className="flex flex-col rounded-2xl border-2 border-dashed border-tf-niebla bg-white/60 p-8">
          <p className="tf-rotulo text-tf-pizarra">{abierto.k}</p>
          <p className="tf-titular mt-auto pb-4 pt-6 text-[2.6rem] italic text-tf-tinta">{abierto.lineas[0]}</p>
        </Unidad>
        <Unidad i={1} label={controlable.k} className="relative flex flex-col rounded-2xl border border-tf-petroleo bg-white p-8">
          {/* esquinas: un pedido delimitado */}
          {["left-3 top-3 border-l-2 border-t-2", "right-3 top-3 border-r-2 border-t-2", "left-3 bottom-3 border-b-2 border-l-2", "right-3 bottom-3 border-b-2 border-r-2"].map((p) => (
            <span key={p} aria-hidden className={cn("absolute size-5 border-tf-petroleo", p)} />
          ))}
          <p className="tf-rotulo text-tf-petroleo">{controlable.k}</p>
          <p className="mt-auto pb-4 pt-6 text-[2rem] leading-snug text-tf-tinta">{controlable.lineas[0]}</p>
        </Unidad>
      </div>
      <Conclusion texto={c.cierre} paso={2} />
    </div>
  );
}

// 09 · La fluidez puede ocultar errores
function Documento({ items }: { items: string[] }) {
  // Zonas del documento simulado que se marcan para revisión (en porcentaje de alto).
  const zonas = [16, 37, 58, 82];
  return (
    <div className="grid grid-cols-[0.9fr_1.1fr] items-center gap-14">
      <div className="tf-sube relative" style={retraso(0.1)}>
        <DocumentoSimulado filas={13} />
        {zonas.map((top, i) => (
          <Unidad
            as="span"
            key={top}
            i={i}
            className="absolute -right-4 flex size-9 items-center justify-center rounded-full border-2 border-white bg-tf-ocre text-sm font-bold text-white shadow"
            style={{ top: `${top}%` }}
          >
            {i + 1}
          </Unidad>
        ))}
        {zonas.map((top, i) => (
          <Unidad as="span" key={`z${top}`} i={i} className="absolute left-6 right-10 h-[1.4rem] rounded-md bg-tf-ocre/15" style={{ top: `calc(${top}% - 0.2rem)` }} />
        ))}
      </div>
      <ol className="grid gap-6">
        {items.map((it, i) => (
          <Unidad as="li" key={it} i={i} label={it} className="flex items-baseline gap-5">
            <span className="tf-serif text-[1.6rem] text-tf-ocre tabular-nums">{i + 1}</span>
            <span className="tf-titular text-[2.2rem] text-tf-tinta">{it}</span>
          </Unidad>
        ))}
      </ol>
    </div>
  );
}

// 11 · Usos jurídicos: operaciones sobre un expediente
function Expediente({ items, cierre }: { items: string[]; cierre: string }) {
  return (
    <div className="flex flex-col">
      <div className="tf-hoja tf-sube relative rounded-2xl border border-tf-linea px-8 py-3" style={retraso(0.1)}>
        <span aria-hidden className="absolute -top-4 left-10 h-4 w-40 rounded-t-lg border border-b-0 border-tf-linea bg-white" />
        {items.map((it, i) => (
          <Unidad key={it} i={i} label={it} className="flex items-center gap-6 border-b border-tf-linea/70 py-4 last:border-b-0">
            <span className="w-14 shrink-0 text-right font-medium text-tf-niebla tabular-nums">{["I", "II", "III", "IV", "V", "VI"][i]}</span>
            <span className="h-8 w-1 shrink-0 rounded-full bg-tf-petroleo/70" />
            <span className="text-[1.6rem] leading-snug text-tf-tinta">{it}</span>
          </Unidad>
        ))}
      </div>
      <Sello texto={cierre} paso={items.length} />
    </div>
  );
}

// 12 · Usos contables: una planilla con su columna de revisión profesional
function Planilla({ items, cierre }: { items: string[]; cierre: string }) {
  return (
    <div className="flex flex-col">
      <div className="tf-hoja tf-sube overflow-hidden rounded-xl border border-tf-linea" style={retraso(0.1)}>
        <div className="grid grid-cols-[3.5rem_1fr_7rem] bg-tf-celeste/60 text-sm font-semibold text-tf-pizarra">
          <span className="border-r border-tf-linea py-2" />
          <span className="border-r border-tf-linea px-5 py-2">A</span>
          <span className="px-5 py-2 text-center">B</span>
        </div>
        {items.map((it, i) => (
          <Unidad key={it} i={i} label={it} className="grid grid-cols-[3.5rem_1fr_7rem] border-t border-tf-linea">
            <span className="flex items-center justify-center border-r border-tf-linea bg-tf-celeste/30 text-sm text-tf-pizarra tabular-nums">{i + 1}</span>
            <span className="border-r border-tf-linea px-5 py-4 text-[1.55rem] leading-snug text-tf-tinta">{it}</span>
            <span className="flex items-center justify-center">
              <span className="size-6 rounded border-2 border-tf-petroleo/60" />
            </span>
          </Unidad>
        ))}
      </div>
      <Sello texto={cierre} paso={items.length} />
    </div>
  );
}

/** Regla de control al pie de una lista de usos. Aparece en su paso. */
function Sello({ texto, paso }: { texto: string; paso: number }) {
  return (
    <Unidad i={paso} label={texto} className="mt-10 flex items-center gap-5 rounded-2xl border border-tf-azul/20 bg-tf-celeste/50 px-7 py-5">
      <GlifoSello className="size-10 shrink-0 text-tf-azul" />
      <p className="tf-serif text-[1.75rem] leading-snug text-tf-azul">{texto}</p>
    </Unidad>
  );
}

// 13 · Tres miradas sobre un mismo documento
function Perfiles({ pares, cierre }: { pares: { k: string; v: string }[]; cierre: string }) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-3 gap-6">
        {pares.map((p, i) => (
          <Unidad key={p.k} i={i} label={`${p.k} · ${p.v}`} className="rounded-2xl border border-tf-linea bg-white px-6 py-5 text-center">
            <p className="tf-rotulo text-[0.8rem] text-tf-petroleo">{p.k}</p>
            <p className="tf-serif mt-2 text-[1.6rem] leading-snug text-tf-tinta">{p.v}</p>
          </Unidad>
        ))}
      </div>
      {/* Las tres miradas convergen en el mismo documento (aparece con la conclusión). */}
      <Unidad i={pares.length} className="flex flex-col">
        <div className="relative h-20">
          <svg aria-hidden viewBox="0 0 300 40" preserveAspectRatio="none" className="absolute inset-0 h-full w-full text-tf-petroleo/45">
            {[50, 150, 250].map((x) => (
              <path key={x} d={`M${x} 0 C ${x} 22, 150 18, 150 40`} fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
        </div>
        <div className="mx-auto flex items-center gap-4 rounded-xl border border-tf-linea bg-white px-6 py-3 shadow-sm">
          <GlifoDocumento className="size-9 text-tf-azul" />
          <div className="grid w-40 gap-1.5">
            <span className="tf-renglon w-full" />
            <span className="tf-renglon w-4/5" />
            <span className="tf-renglon w-3/5" />
          </div>
        </div>
      </Unidad>
      <Conclusion texto={cierre} paso={pares.length} />
    </div>
  );
}

// 14 · Riesgos principales
function Matriz({ pares }: { pares: { k: string; v: string }[] }) {
  return (
    <div className="grid grid-cols-3 grid-rows-2 gap-5">
      {pares.map((p, i) => (
        <Unidad key={p.k} i={i} label={`${p.k} · ${p.v}`} className="flex min-h-[13rem] flex-col rounded-2xl border border-tf-linea bg-white p-6">
          <span className="tf-serif text-[1.1rem] text-tf-niebla tabular-nums">0{i + 1}</span>
          <p className="tf-rotulo mt-auto text-[0.95rem] text-tf-azul">{p.k}</p>
          <p className="tf-serif mt-2 text-[1.8rem] leading-tight text-tf-tinta">{p.v}</p>
        </Unidad>
      ))}
    </div>
  );
}

// 15 · Confidencialidad y secreto fiscal
function Reserva({ encabezado, items, cierre }: { encabezado: string; items: string[]; cierre: string }) {
  return (
    <div className="grid grid-cols-[1.15fr_0.85fr] items-center gap-14">
      <div>
        <p className="tf-titular tf-sube flex items-center gap-4 text-[2.3rem] text-tf-lacre" style={retraso(0.1)}>
          <GlifoProhibido className="size-10 shrink-0" />
          {encabezado}
        </p>
        <ul className="mt-7 grid gap-4">
          {items.map((it, i) => (
            <Unidad as="li" key={it} i={i} label={it} className="flex items-center gap-4 border-b border-tf-linea pb-4 text-[1.6rem] text-tf-tinta">
              <GlifoCandado className="size-7 shrink-0 text-tf-azul" />
              {it}
            </Unidad>
          ))}
        </ul>
      </div>
      <Unidad i={items.length} label={cierre}>
        {/* Ficha: el nombre está tachado, pero los demás datos juntos siguen identificando. */}
        <div className="tf-hoja rounded-2xl border border-tf-linea p-6">
          {["Nombre", "Domicilio", "Actividad", "Período"].map((campo, i) => (
            <div key={campo} className="grid grid-cols-[6.5rem_1fr] items-center gap-4 border-b border-tf-linea/70 py-3 last:border-b-0">
              <span className="text-sm text-tf-niebla">{campo}</span>
              {i === 0 ? (
                <span className="h-5 rounded-sm bg-tf-tinta" />
              ) : (
                <span className="flex items-center gap-2">
                  <span className="tf-renglon flex-1 bg-tf-ocre/35" />
                  <span className="size-2 rounded-full bg-tf-ocre" />
                </span>
              )}
            </div>
          ))}
        </div>
        <p className="tf-serif mt-6 border-l-[0.35rem] border-tf-ocre pl-5 text-[1.75rem] leading-snug text-tf-azul">{cierre}</p>
      </Unidad>
    </div>
  );
}

// 16 · Caso ficticio Norte Azul SA
function Caso({ c }: { c: Extract<TfCuerpo, { forma: "caso" }> }) {
  return (
    <div className="tf-hoja tf-sube relative grid min-h-[30rem] grid-cols-[1.1fr_0.9fr] gap-10 rounded-2xl border border-tf-linea p-9" style={retraso(0.1)}>
      <span aria-hidden className="absolute -top-4 left-10 h-4 w-44 rounded-t-lg border border-b-0 border-tf-linea bg-white" />
      <div className="flex flex-col">
        <p className="tf-titular text-[3.6rem] text-tf-azul">{c.nombre}</p>
        <div className="mt-3 grid gap-1">
          {c.asunto.map((a, i) => (
            <p key={a} className={cn("text-[1.5rem]", i === 0 ? "text-tf-tinta" : "text-tf-pizarra")}>
              {a}
            </p>
          ))}
        </div>
        <div className="mt-auto rounded-xl bg-tf-celeste/50 p-6">
          <p className="tf-rotulo text-tf-pizarra">{c.montosTitulo}</p>
          <div className="mt-3 flex flex-wrap gap-x-10 gap-y-2">
            {c.montos.map((m) => (
              <p key={m} className="tf-serif text-[2.6rem] leading-none text-tf-tinta tabular-nums">
                {m}
              </p>
            ))}
          </div>
        </div>
      </div>
      <ul className="grid content-center gap-5 border-l border-tf-linea pl-10">
        {c.items.map((it, i) => (
          <Unidad as="li" key={it} i={i} label={it} className="flex gap-4 text-[1.55rem] leading-snug text-tf-tinta">
            <span className="mt-3 size-2 shrink-0 rounded-full bg-tf-petroleo" />
            {it}
          </Unidad>
        ))}
      </ul>
    </div>
  );
}

// 17 · La instrucción, como una consulta dirigida a la herramienta
function Instruccion({ encabezado, items, respuesta }: { encabezado: string; items: string[]; respuesta?: TfRespuestaIa }) {
  // La respuesta preparada aparece con un botón (también desde el celular de control).
  const [ver, setVer] = useState(false);
  const lado = ver && respuesta;
  return (
    <div className={cn("grid items-start gap-8", lado ? "grid-cols-[0.8fr_1.2fr]" : "grid-cols-1")}>
      <div className="tf-hoja tf-sube w-full rounded-[1.5rem] border border-tf-linea p-9" style={retraso(0.1)}>
        <div className="flex items-center gap-3 text-tf-niebla">
          <GlifoInstruccion className="size-7" />
          <span className="h-px flex-1 bg-tf-linea" />
        </div>
        <p className={cn("tf-titular mt-5 text-tf-azul", lado ? "text-[1.8rem]" : "text-[2.3rem]")}>{encabezado}</p>
        <ul className="mt-5 grid gap-3">
          {items.map((it, i) => (
            <li
              key={it}
              className={cn(
                "tf-sube flex items-baseline gap-4 leading-snug",
                lado ? "text-[1.3rem]" : "text-[1.65rem]",
                i === items.length - 1 ? "font-medium text-tf-lacre" : "text-tf-tinta",
              )}
              style={retraso(0.3 + i * 0.1)}
            >
              <span className="text-tf-niebla">•</span>
              {it}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex items-center justify-end gap-4">
          {respuesta && (
            <button
              onClick={() => setVer((v) => !v)}
              {...rem(TF_RESPUESTA_IA, ver)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-semibold transition",
                ver ? "border-tf-linea bg-white text-tf-pizarra" : "border-tf-petroleo bg-tf-petroleo/10 text-tf-petroleo hover:bg-tf-petroleo/15",
              )}
            >
              {ver ? "Ocultar la respuesta" : "Ver la respuesta de la IA"}
            </button>
          )}
          <span className="flex size-12 items-center justify-center rounded-full bg-tf-azul text-xl text-white">↑</span>
        </div>
      </div>
      {lado && <RespuestaIa r={respuesta} />}
    </div>
  );
}

/** La respuesta preparada de la IA: aparece por partes, como si se estuviera generando. */
function RespuestaIa({ r }: { r: TfRespuestaIa }) {
  return (
    <div className="tf-hoja rounded-[1.5rem] border border-tf-linea border-l-[0.35rem] border-l-tf-petroleo px-7 py-6">
      <p className="tf-rotulo flex items-center gap-2 text-tf-petroleo">
        <span className="size-2 animate-pulse rounded-full bg-tf-petroleo" />
        Respuesta de la IA
      </p>
      <div className="mt-4 grid grid-cols-2 gap-x-8 gap-y-4">
        {r.secciones.map((sec, i) => (
          <div key={sec.k} className="tf-sube" style={retraso(0.25 + i * 0.45)}>
            <p className="text-[0.85rem] font-semibold uppercase tracking-[0.12em] text-tf-azul">{sec.k}</p>
            <ul className="mt-1.5 grid gap-1">
              {sec.lineas.map((l) => (
                <li key={l} className="flex gap-2.5 text-[1.12rem] leading-snug text-tf-tinta">
                  <span className="text-tf-petroleo">–</span>
                  {l}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <p className="tf-sube tf-serif col-span-2 border-t border-tf-linea pt-3 text-[1.2rem] italic text-tf-azul" style={retraso(0.25 + r.secciones.length * 0.45)}>
          {r.cierre}
        </p>
      </div>
      <p className="mt-3 text-xs text-tf-niebla">{r.nota}</p>
    </div>
  );
}

// 18 · Clasificación de tareas
const ACN_PLACA: Record<string, string> = { A: "#007a87", C: "#b7791f", N: "#b4372f" };

function Acn({ pares, cierre }: { pares: { k: string; v: string }[]; cierre: string }) {
  return (
    <div className="flex flex-col">
      <div className="grid min-h-[22rem] grid-cols-3 gap-6">
        {pares.map((p, i) => (
          <Unidad
            key={p.k}
            i={i}
            label={`${p.k} · ${p.v}`}
            className="flex flex-col items-center justify-center rounded-2xl border-t-[0.5rem] bg-white px-6 py-8 text-center shadow-sm"
            style={{ borderTopColor: ACN_PLACA[p.k] }}
          >
            <span className="tf-serif text-[8rem] font-medium leading-[0.9]" style={{ color: ACN_PLACA[p.k] }}>
              {p.k}
            </span>
            <span className="mt-3 text-[1.8rem] text-tf-tinta">{p.v}</span>
          </Unidad>
        ))}
      </div>
      <Conclusion texto={cierre} paso={pares.length} />
    </div>
  );
}

// 19 · Cinco ideas de cierre
function Ideas({ items, proxima }: { items: string[]; proxima: { k: string; v: string } }) {
  return (
    <div className="flex flex-col">
      <ol className="grid gap-3.5">
        {items.map((it, i) => (
          <Unidad as="li" key={it} i={i} label={it} className="flex items-baseline gap-6 border-b border-tf-linea pb-3.5">
            <span className="tf-serif w-8 text-[1.7rem] text-tf-petroleo tabular-nums">{i + 1}</span>
            <span className="tf-titular text-[2.15rem] text-tf-tinta">{it}</span>
          </Unidad>
        ))}
      </ol>
      <Unidad as="p" i={items.length - 1} className="mt-8 self-end text-right text-[1.2rem] text-tf-pizarra">
        <span className="tf-rotulo mr-3 text-tf-petroleo">{proxima.k}</span>
        {proxima.v}
      </Unidad>
    </div>
  );
}

/** Documento con renglones simulados: muestra la forma, sin inventar contenido. */
function DocumentoSimulado({ filas, className }: { filas: number; className?: string }) {
  const anchos = ["100%", "92%", "97%", "74%", "100%", "88%", "95%", "60%", "100%", "90%", "83%", "97%", "70%"];
  return (
    <div className={cn("tf-hoja rounded-xl border border-tf-linea px-7 py-7", className)}>
      <div className="mb-5 flex items-center justify-between">
        <span className="tf-renglon h-3 w-2/5 bg-tf-azul/70" />
        <span className="tf-renglon h-3 w-16 bg-tf-celeste" />
      </div>
      <div className="grid gap-3.5">
        {Array.from({ length: filas }, (_, i) => (
          <span key={i} className="tf-renglon" style={{ width: anchos[i % anchos.length] }} />
        ))}
      </div>
      <div className="mt-6 flex justify-end">
        <span className="tf-renglon h-2.5 w-28 bg-tf-azul/40" />
      </div>
    </div>
  );
}

// --- Portada --------------------------------------------------------------------------------------

export function PortadaTf({ clase }: { clase: TfClase }) {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-10">
        <div>
          <p className="tf-rotulo tf-sube text-[0.95rem] leading-relaxed text-tf-azul">
            Tribunal Fiscal de la
            <br />
            Provincia de Tucumán
          </p>
          <h1 className="tf-titular tf-sube mt-8 max-w-[52rem] text-[5.4rem] leading-[0.98] text-tf-tinta" style={retraso(0.15)}>
            {clase.titulo}
          </h1>
          <div className="tf-sube mt-6 grid gap-0.5 text-[1.35rem] text-tf-pizarra" style={retraso(0.3)}>
            {clase.bajada.map((b) => (
              <p key={b}>{b}</p>
            ))}
          </div>
          <p className="tf-serif tf-sube mt-7 flex items-center gap-4 text-[2rem] text-tf-azul" style={retraso(0.45)}>
            <span className="h-px w-12 bg-tf-petroleo" />
            {clase.expositor}
          </p>
        </div>
        {/* QR discreto: el primer contacto con la aplicación */}
        <div className="tf-sube mt-2 flex shrink-0 flex-col items-center gap-2 opacity-90" style={retraso(0.7)}>
          <img src={TF_QR} alt="Código QR para participar desde el celular" className="size-[6.5rem] rounded-lg border border-tf-linea bg-white p-1" />
          <span className="text-center text-[0.7rem] leading-tight text-tf-pizarra">
            Participe desde
            <br />
            su celular
          </span>
        </div>
      </div>
      <div className="tf-sube relative mt-auto overflow-hidden rounded-[1.5rem]" style={retraso(0.25)}>
        <img src="/tribunal/portada.jpg" alt="" className="h-[34vh] w-full object-cover" style={{ objectPosition: "50% 38%" }} />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-tf-tinta/25 to-transparent" />
      </div>
    </div>
  );
}

// --- Ingreso --------------------------------------------------------------------------------------

export function IngresoTf({ clase }: { clase: TfClase }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${clase.slug}`, 3000);
  return (
    <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-16">
      <div className="tf-sube rounded-[1.75rem] border border-tf-linea bg-white p-5 shadow-sm">
        <img src={TF_QR} alt="Código QR para ingresar" style={{ width: "min(52vh, 28rem)", height: "min(52vh, 28rem)" }} />
      </div>
      <div>
        <p className="tf-rotulo flex items-center gap-3 text-tf-ocre">
          <span className="size-2 animate-pulse rounded-full bg-tf-ocre" />
          Participación en vivo
        </p>
        <h1 className="tf-titular tf-sube mt-5 text-[3.6rem] text-tf-tinta" style={retraso(0.1)}>
          Ingrese desde su celular
        </h1>
        <p className="tf-sube mt-4 text-[1.4rem] leading-snug text-tf-pizarra" style={retraso(0.2)}>
          Escanee el código o escriba la dirección. No hace falta crear una cuenta: puede participar con un apodo.
        </p>
        <p className="tf-serif tf-sube mt-6 text-[2.3rem] font-medium text-tf-petroleo" style={retraso(0.3)}>
          {TF_LINK}
        </p>
        <p className="tf-sube mt-6 rounded-xl border border-tf-ocre/40 bg-tf-ocre-claro px-5 py-3 text-[1.2rem] text-tf-tinta" style={retraso(0.4)}>
          Al ingresar, indique su perfil: abogado/a, contador/a o personal administrativo.
        </p>
        <div className="tf-sube mt-8 flex items-baseline gap-4" style={retraso(0.5)}>
          <span className="tf-serif text-[4.5rem] leading-none text-tf-azul tabular-nums">{data?.participants ?? 0}</span>
          <span className="text-[1.3rem] text-tf-pizarra">personas conectadas</span>
        </div>
        <p className="mt-10 text-sm text-tf-niebla">
          {TF_INSTITUCION} · Recursos participativos: {TF_EQUIPO}
        </p>
      </div>
    </div>
  );
}

// --- Actividad en vivo ----------------------------------------------------------------------------

function ChipQR() {
  return (
    <div className="flex shrink-0 items-center gap-4 rounded-2xl border border-tf-linea bg-white p-3 pr-5 shadow-sm">
      <img src={TF_QR} alt="Código QR para responder" className="size-[5.5rem]" />
      <div>
        <p className="tf-rotulo text-[0.6rem] text-tf-pizarra">Responda desde su celular</p>
        <p className="tf-serif mt-1 text-[1.15rem] font-medium text-tf-petroleo">{TF_LINK}</p>
      </div>
    </div>
  );
}

export function ActividadTf({
  clase,
  slide,
  moderacion,
  onProyectar,
  intervalo,
}: {
  clase: TfClase;
  slide: Extract<TfSlide, { t: "actividad" }>;
  moderacion: Moderacion;
  onProyectar: Proyectar;
  intervalo: number;
}) {
  const act = getActividadTf(clase, slide.activa);
  if (!act) return null;
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-start justify-between gap-10">
        <div className="min-w-0">
          <p className="tf-rotulo flex items-center gap-3 text-tf-ocre">
            <span className="size-2 animate-pulse rounded-full bg-tf-ocre" />
            Actividad en vivo · {slide.escena}
          </p>
          <h1 className="tf-titular tf-sube mt-4 text-[3.1rem] text-tf-tinta">{act.titulo}</h1>
          <p className="tf-sube mt-3 max-w-[54rem] text-[1.35rem] leading-snug text-tf-pizarra" style={retraso(0.1)}>
            {act.bajada}
          </p>
        </div>
        <ChipQR />
      </div>
      <div className="tf-sube mt-7 flex flex-1 flex-col" style={retraso(0.2)}>
        <ResultadosTf
          slug={clase.slug}
          act={act}
          mod={moderacion[act.key]}
          onProyectar={(p) => onProyectar(act.key, p)}
          intervalo={intervalo}
        />
      </div>
    </div>
  );
}

// --- Síntesis: dos actividades lado a lado ----------------------------------------------------------

export function SintesisTf({
  clase,
  slide,
  moderacion,
  onProyectar,
  intervalo,
}: {
  clase: TfClase;
  slide: Extract<TfSlide, { t: "sintesis" }>;
  moderacion: Moderacion;
  onProyectar: Proyectar;
  intervalo: number;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <p className="tf-rotulo flex items-center gap-3 text-tf-ocre">
        <span className="size-2 rounded-full bg-tf-ocre" />
        Lo que respondió la sala
      </p>
      <h1 className="tf-titular tf-sube mt-4 text-[3.1rem] text-tf-tinta">{slide.titulo}</h1>
      <div className="mt-7 grid flex-1 grid-cols-2 gap-6">
        {slide.actividades.map((key, i) => {
          const act = getActividadTf(clase, key);
          if (!act) return null;
          return (
            <div key={key} className="tf-sube flex flex-col" style={retraso(0.15 + i * 0.15)}>
              <p className="tf-serif mb-3 text-[1.6rem] text-tf-azul">{act.titulo}</p>
              <ResultadosTf
                slug={clase.slug}
                act={act}
                mod={moderacion[key]}
                onProyectar={(p) => onProyectar(key, p)}
                intervalo={intervalo}
                compacto
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Glifos (trazo simple, sin robots ni cerebros) ---------------------------------------------------

type G = { className?: string };
const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;

function GlifoPatrones({ className }: G) {
  const puntos = [0, 1, 2].flatMap((f) => [0, 1, 2].map((c) => [8 + c * 16, 8 + f * 16]));
  return (
    <svg viewBox="0 0 48 48" className={className}>
      {puntos.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 4 : 2.2} fill={i % 4 === 0 ? "#007a87" : "currentColor"} opacity={i % 4 === 0 ? 1 : 0.35} />
      ))}
      <path d="M8 8 L24 24 L40 40" {...trazo} stroke="#007a87" strokeDasharray="2 3" />
    </svg>
  );
}
function GlifoClasificar({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M6 30 h14 v12 h-14z M28 30 h14 v12 h-14z" {...trazo} />
      <circle cx="13" cy="8" r="3" fill="#007a87" />
      <rect x="32" y="5" width="6" height="6" fill="currentColor" opacity="0.6" />
      <path d="M13 12 v13 M35 12 v13" {...trazo} strokeDasharray="2 3" />
    </svg>
  );
}
function GlifoPredecir({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M5 42 h38 M5 42 V6" {...trazo} opacity="0.5" />
      <path d="M8 34 L16 28 L22 31 L29 20" {...trazo} />
      <path d="M29 20 L42 10" {...trazo} stroke="#007a87" strokeDasharray="2 3" />
      <circle cx="42" cy="10" r="2.6" fill="#007a87" />
    </svg>
  );
}
function GlifoGenerar({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M10 5 h20 l8 8 v30 h-28z" {...trazo} />
      <path d="M15 18 h16 M15 24 h16 M15 30 h9" {...trazo} opacity="0.55" />
      <path d="M27 36 l10 -10 l3 3 l-10 10 l-4 1z" {...trazo} stroke="#007a87" />
    </svg>
  );
}
function GlifoLupa({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <circle cx="20" cy="20" r="12" {...trazo} strokeWidth={2.4} />
      <path d="M29 29 L41 41" {...trazo} strokeWidth={3} />
    </svg>
  );
}
function GlifoModelo({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <rect x="8" y="8" width="32" height="32" rx="5" {...trazo} />
      <path d="M8 19 h32 M8 29 h32 M19 8 v32 M29 8 v32" {...trazo} opacity="0.4" />
      <circle cx="24" cy="24" r="3" fill="#007a87" />
    </svg>
  );
}
function GlifoDatos({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <ellipse cx="24" cy="11" rx="14" ry="5" {...trazo} />
      <path d="M10 11 v24 c0 3 6 5 14 5 s14 -2 14 -5 v-24 M10 23 c0 3 6 5 14 5 s14 -2 14 -5" {...trazo} />
    </svg>
  );
}
function GlifoInstruccion({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M6 10 h36 v22 h-20 l-9 8 v-8 h-7z" {...trazo} />
      <path d="M13 18 h22 M13 24 h14" {...trazo} opacity="0.55" />
    </svg>
  );
}
function GlifoRespuesta({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M10 5 h20 l8 8 v30 h-28z" {...trazo} strokeDasharray="3 3" />
      <path d="M15 18 h16 M15 24 h16 M15 30 h10" {...trazo} opacity="0.55" />
      <circle cx="33" cy="35" r="7" {...trazo} fill="white" />
      <path d="M31 33 c0 -2 4 -2 4 0 c0 1.5 -2 1.5 -2 3.2 M33 38.6 v0.2" {...trazo} strokeWidth={1.4} />
    </svg>
  );
}
function GlifoBuscar({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M6 9 h18 l5 5 v24 h-23z" {...trazo} opacity="0.55" />
      <path d="M10 18 h12 M10 23 h14 M10 28 h8" {...trazo} opacity="0.4" />
      <circle cx="30" cy="27" r="8" {...trazo} strokeWidth={2.2} stroke="#007a87" />
      <path d="M36 33 L43 40" {...trazo} strokeWidth={2.6} stroke="#007a87" />
    </svg>
  );
}
function GlifoSello({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="17" {...trazo} />
      <circle cx="24" cy="24" r="12" {...trazo} opacity="0.45" />
      <path d="M18 24 l4 4 l8 -9" {...trazo} strokeWidth={2.2} stroke="#007a87" />
    </svg>
  );
}
function GlifoDocumento({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path d="M10 5 h20 l8 8 v30 h-28z M30 5 v8 h8" {...trazo} />
    </svg>
  );
}
function GlifoProhibido({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <circle cx="24" cy="24" r="17" {...trazo} strokeWidth={2.4} />
      <path d="M12 12 L36 36" {...trazo} strokeWidth={2.4} />
    </svg>
  );
}
function GlifoCandado({ className }: G) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <rect x="11" y="21" width="26" height="20" rx="3" {...trazo} />
      <path d="M16 21 v-6 a8 8 0 0 1 16 0 v6" {...trazo} />
      <circle cx="24" cy="31" r="2.4" fill="currentColor" />
    </svg>
  );
}
