"use client";

// Material del encuentro (/tribunal/material): se lee en el celular y se baja
// en PDF. Separa el contenido académico del Dr. Leal (sus placas) de lo que
// respondió la sala (resultados agregados, anónimos y moderados).

import { useState } from "react";
import { useLive } from "@/components/use-live";
import { MarcaTribunal } from "@/components/tribunal/seguimiento";
import {
  bloquesMaterial,
  getActividadTf,
  lineasPlaca,
  TF_CICLO,
  TF_EQUIPO,
  TF_INSTITUCION,
  type TfBloque,
  type TfClase,
  type TfMaterial,
  type TfPlaca,
} from "@/lib/tribunal";
import { cn } from "@/lib/utils";

export function MaterialTribunal({ clase }: { clase: TfClase }) {
  const { data, error } = useLive<TfMaterial>(`/api/session/${clase.slug}/material`, 30000);
  const placas = clase.slides.filter((x): x is TfPlaca => x.t === "placa");

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-6">
      <MarcaTribunal />
      <p className="tf-rotulo mt-8 text-tf-petroleo">Material del encuentro</p>
      <h1 className="tf-titular mt-3 text-[2.6rem] text-tf-tinta">{clase.titulo}</h1>
      <p className="mt-3 text-tf-pizarra">
        {TF_INSTITUCION} · {TF_CICLO} · {clase.bajada[0]}
      </p>
      <p className="tf-serif mt-2 text-xl text-tf-azul">{clase.expositor}</p>

      <Descargar clase={clase} datos={data} />
      {error && <p className="mt-2 text-sm text-tf-lacre">No se pudieron leer los resultados. Reintente en unos segundos.</p>}

      <section className="mt-12">
        <p className="tf-rotulo flex items-center gap-2 text-tf-ocre">
          <span className="size-2 rounded-sm bg-tf-ocre" />
          Lo que respondió la sala
        </p>
        <p className="mt-3 text-sm leading-relaxed text-tf-pizarra">
          {data ? `${data.participantes} personas participaron desde su celular. ` : ""}
          Resultados agregados y anónimos. Reflejan la opinión de quienes participaron: no son conclusiones jurídicas ni criterios
          institucionales aprobados.
        </p>
        <div className="mt-6 grid gap-5">
          {!data ? (
            <p className="text-tf-niebla">Cargando resultados…</p>
          ) : (
            clase.actividades.map((act) => {
              const res = data.actividades.find((a) => a.key === act.key);
              if (!res) return null;
              return (
                <article key={act.key} className="rounded-2xl border border-tf-linea bg-white p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="tf-serif text-xl leading-snug text-tf-tinta">{act.titulo}</h3>
                    <span className="shrink-0 text-xs text-tf-pizarra">{res.respondieron} resp.</span>
                  </div>
                  {res.pendiente ? (
                    <p className="mt-2 text-sm text-tf-niebla">Respuestas abiertas no incluidas: el equipo no llegó a revisarlas.</p>
                  ) : res.respondieron === 0 || !res.summary ? (
                    <p className="mt-2 text-sm text-tf-niebla">Sin respuestas registradas.</p>
                  ) : (
                    bloquesMaterial(act, res.summary).map((b, i) => <Bloque key={i} b={b} />)
                  )}
                </article>
              );
            })
          )}
        </div>
      </section>

      <section className="mt-14">
        <p className="tf-rotulo flex items-center gap-2 text-tf-azul">
          <span className="size-2 rounded-sm bg-tf-azul" />
          Contenido de la charla
        </p>
        <p className="mt-3 text-sm text-tf-pizarra">Texto de las placas del {clase.expositor}.</p>
        <div className="mt-6 grid gap-4">
          {placas.map((p) => (
            <article key={p.num} className="rounded-2xl border border-tf-linea bg-white p-5">
              <p className="text-xs font-semibold tracking-widest text-tf-petroleo">{p.num}</p>
              <h3 className="tf-serif mt-1 text-xl text-tf-tinta">{p.titulo}</h3>
              <div className="mt-3 grid gap-2 text-[0.97rem] leading-snug">
                {lineasPlaca(p, clase).map((l, i) =>
                  l.tipo === "lema" ? (
                    <p key={i} className="tf-serif text-lg italic text-tf-azul">
                      {l.texto}
                    </p>
                  ) : l.tipo === "cierre" ? (
                    <p key={i} className="border-l-4 border-tf-petroleo pl-3 font-medium text-tf-azul">
                      {l.texto}
                    </p>
                  ) : l.tipo === "par" ? (
                    <p key={i}>
                      <span className="mr-2 text-xs font-semibold tracking-wider text-tf-petroleo">{l.k}</span>
                      {l.texto}
                    </p>
                  ) : l.tipo === "dato" ? (
                    <p key={i} className="text-tf-pizarra">
                      {l.texto}
                    </p>
                  ) : (
                    <p key={i} className="flex gap-2">
                      <span className="text-tf-petroleo">•</span>
                      {l.texto}
                    </p>
                  ),
                )}
              </div>
            </article>
          ))}
          {clase.encargo && (
            <article className="rounded-2xl bg-tf-celeste/70 p-5">
              <p className="tf-rotulo text-tf-azul">Para la próxima charla</p>
              <p className="tf-serif mt-2 text-lg text-tf-tinta">{clase.encargo}</p>
            </article>
          )}
        </div>
      </section>

      <p className="mt-12 text-center text-xs text-tf-niebla">
        Contenido académico: {clase.expositor} · Actividades y plataforma: {TF_EQUIPO}
      </p>
    </main>
  );
}

function Descargar({ clase, datos }: { clase: TfClase; datos: TfMaterial | null }) {
  const [estado, setEstado] = useState<"listo" | "armando" | "error">("listo");

  async function bajar() {
    if (!datos) return;
    setEstado("armando");
    try {
      const { buildMaterialBlob } = await import("./material-pdf");
      const blob = await buildMaterialBlob(clase, datos);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Tribunal-Fiscal-IA-charla-${clase.numero}-material.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }

  return (
    <div className="mt-8 rounded-2xl border border-tf-azul/15 bg-white p-5 shadow-sm">
      <p className="text-sm leading-relaxed text-tf-pizarra">
        El PDF reúne el contenido de la charla y los resultados de las actividades, para releerlo y compartirlo.
      </p>
      <button
        onClick={bajar}
        disabled={!datos || estado === "armando"}
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-xl bg-tf-azul px-5 text-base font-semibold text-white transition active:scale-[0.99] disabled:opacity-50"
      >
        {estado === "armando" ? "Armando el PDF…" : !datos ? "Cargando…" : "↓ Descargar el material (PDF)"}
      </button>
      {estado === "error" && <p className="mt-2 text-sm text-tf-lacre">No se pudo armar el PDF. Pruebe de nuevo.</p>}
    </div>
  );
}

function Bloque({ b }: { b: TfBloque }) {
  if (b.tipo === "barras") {
    const max = Math.max(1, ...b.filas.map((f) => f.n));
    return (
      <div className="mt-4 grid gap-2">
        {b.pregunta && <p className="text-sm font-semibold text-tf-azul">{b.pregunta}</p>}
        {b.filas.map((f) => (
          <div key={f.label}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className={cn(f.n === max && f.n > 0 ? "font-semibold text-tf-tinta" : "text-tf-pizarra")}>{f.label}</span>
              <span className="shrink-0 tabular-nums text-tf-pizarra">
                {f.n} · {f.pct}%
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-tf-celeste/70">
              <div className="h-full rounded-full bg-tf-petroleo" style={{ width: `${(f.n / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (b.tipo === "acn")
    return (
      <div className="mt-4 grid gap-3">
        {b.filas.map((f, i) => (
          <div key={f.tarea}>
            <p className="text-sm text-tf-tinta">
              <span className="mr-1.5 text-tf-niebla">{i + 1}.</span>
              {f.tarea}
            </p>
            <div className="mt-1 flex h-3 overflow-hidden rounded bg-tf-celeste/60">
              {f.total > 0 &&
                ([
                  ["a", "#007a87"],
                  ["c", "#b7791f"],
                  ["n", "#b4372f"],
                ] as const).map(([k, color]) => <div key={k} style={{ width: `${(f[k] / f.total) * 100}%`, background: color }} />)}
            </div>
            <p className="mt-0.5 text-xs text-tf-pizarra">
              {f.total ? `A ${Math.round((f.a / f.total) * 100)}% · C ${Math.round((f.c / f.total) * 100)}% · N ${Math.round((f.n / f.total) * 100)}%` : "sin respuestas"}
            </p>
          </div>
        ))}
      </div>
    );
  if (b.tipo === "palabras")
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {b.palabras.map((p) => (
          <span key={p.palabra} className="tf-serif rounded-full border border-tf-linea bg-tf-papel px-3 py-1 text-tf-azul">
            {p.palabra}
            {p.n > 1 && <span className="ml-1 text-xs text-tf-pizarra">×{p.n}</span>}
          </span>
        ))}
      </div>
    );
  return (
    <div className="mt-4 grid gap-2">
      {b.textos.map((x, i) => (
        <p key={i} className="rounded-lg border-l-2 border-tf-ocre bg-tf-papel px-3 py-2 text-sm text-tf-tinta">
          {x}
        </p>
      ))}
    </div>
  );
}
