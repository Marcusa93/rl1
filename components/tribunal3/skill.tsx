"use client";

// Lo tangible de la tercera charla, en el proyector:
//   · el prompt COTIO de la demo (placa 11), marcado letra por letra
//   · la skill del cierre como anatomía: carpeta → encabezado → cuerpo COTIO → lo que no va
// Las dos usan la misma insignia por letra, para que se vea que la skill es el prompt reutilizable.

import type { CSSProperties } from "react";
import { Hoja, Paso, Sello } from "@/components/tribunal2/collage";
import { TF3_PROMPT_DEMO, TF3_SKILL } from "@/lib/tribunal-clase3";
import { cn } from "@/lib/utils";

type Estilo = CSSProperties & Record<`--${string}`, string | number>;

/** Insignia de una letra de COTIO («!» para los límites). */
export function Letra({ letra, tam = 52 }: { letra: string; tam?: number }) {
  return (
    <span
      className={cn("tf2-titular flex shrink-0 items-center justify-center rounded-[6px] leading-none text-white", letra === "!" ? "bg-tf2-tinta" : "bg-tf2-rojo")}
      style={{ width: tam, height: tam, fontSize: tam * 0.6 }}
    >
      {letra}
    </span>
  );
}

/** Placa 11 · «🧩 Ver el prompt COTIO»: el pedido que recibe el chatbot, bloque por bloque. */
export function PromptCotioProyectado() {
  return (
    <div className="absolute inset-x-[120px] bottom-[96px] top-[290px]">
      <div className="mb-4 flex items-center gap-5">
        <Sello tono="azul" tam={16}>
          El prompt COTIO que recibe el chatbot
        </Sello>
        <span className="tf2-mono text-[17px] text-tf2-gris">es el mismo pedido que se ejecuta con «🤖 Ejecutar en vivo»</span>
      </div>
      <Hoja className="px-0 py-2">
        {TF3_PROMPT_DEMO.map((b, k) => (
          <div key={k} className="tf2-sube grid grid-cols-[56px_150px_1fr] items-start gap-5 border-b border-tf2-linea px-7 py-4 last:border-0" style={{ "--d": `${k * 140}ms` } as Estilo}>
            <Letra letra={b.letra} />
            <span className="tf2-rotulo pt-4 text-[15px] text-tf2-rojo">{b.nombre}</span>
            <span className="tf2-mono pt-1 text-[21px] leading-[1.45]">{b.texto}</span>
          </div>
        ))}
      </Hoja>
    </div>
  );
}

const ANATOMIA = [
  { paso: 0, titulo: "Una carpeta con un archivo:", texto: "SKILL.md. Así se guarda una skill." },
  { paso: 0, titulo: "El encabezado", texto: "(nombre y descripción) es lo único que la IA ve siempre: con eso decide cuándo usarla." },
  { paso: 1, titulo: "El cuerpo", texto: "son las instrucciones, ordenadas con COTIO. Se cargan solo cuando el pedido coincide." },
  { paso: 3, titulo: "Lo que no va:", texto: "los datos del expediente. Llegan en cada pedido; la skill dice qué buscar." },
];

/** Número de la anatomía (círculo oscuro), en la columna y sobre el archivo. */
function Numero({ n, chico }: { n: number; chico?: boolean }) {
  return (
    <span className={cn("tf2-titular flex shrink-0 items-center justify-center rounded-full bg-tf2-tinta leading-none text-white", chico ? "size-[30px] text-[17px]" : "size-[44px] text-[24px]")}>
      {n}
    </span>
  );
}

/** Pantalla de cierre: la skill que se llevan, como anatomía de un archivo real. */
export function SkillProyectada() {
  const s = TF3_SKILL;
  return (
    <>
      <div className="absolute left-[120px] top-[110px] w-[600px]">
        <p className="tf2-rotulo text-[16px] text-tf2-rojo">Lo que se llevan · escrita con COTIO</p>
        <h1 className="tf2-titular tf2-sube mt-5 text-[66px] leading-[1.02]">Una skill para recursos contra clausuras</h1>
        <ol className="mt-10 grid gap-6">
          {ANATOMIA.map((a, k) => (
            <Paso key={k} i={a.paso}>
              <li className="flex gap-4">
                <Numero n={k + 1} />
                <p className="text-[23px] leading-snug">
                  <b>{a.titulo}</b> {a.texto}
                </p>
              </li>
            </Paso>
          ))}
        </ol>
        <Paso i={3}>
          <p className="tf2-mono mt-8 text-[19px] text-tf2-azul">→ Copiala o descargala desde tu celular.</p>
        </Paso>
      </div>

      {/* El archivo entero aparece en el primer paso (antes, solo el título). */}
      <div className="absolute left-[780px] top-[96px] w-[1020px]">
        <Paso i={0}>
          <div className="flex items-center gap-3">
            <Numero n={1} chico />
            <span className="tf2-objeto tf2-mono inline-flex items-center gap-2 rounded-t-[6px] bg-tf2-kraft px-5 py-2 text-[17px]">
              <span className="inline-block h-[14px] w-[18px] rounded-[2px] border-2 border-tf2-tinta/70" aria-hidden />
              {s.carpeta}/ <span className="text-tf2-gris">›</span> <b>SKILL.md</b>
            </span>
          </div>
          <Hoja className="px-6 py-5">
            <Paso i={0}>
              <div className="rounded-[4px] border-2 border-dashed border-tf2-azul/50 bg-tf2-azul-claro/60 px-5 py-3">
                <div className="mb-1 flex items-center gap-3">
                  <Numero n={2} chico />
                  <span className="tf2-rotulo text-[13px] text-tf2-azul">encabezado · la IA lo ve siempre</span>
                </div>
                <pre className="tf2-mono whitespace-pre-wrap text-[14px] leading-[1.4] text-tf2-tinta">
                  {"---\nname: "}
                  <b>{s.nombre}</b>
                  {"\ndescription: "}
                  {s.descripcion}
                  {"\n---"}
                </pre>
              </div>
            </Paso>
            <Paso i={1}>
              <div className="mt-3 flex items-center gap-3">
                <Numero n={3} chico />
                <span className="tf2-rotulo text-[13px] text-tf2-rojo">cuerpo · se carga cuando el pedido coincide</span>
                <span className="tf2-mono text-[15px] text-tf2-grafito"># {s.titulo}</span>
              </div>
            </Paso>
            <div className="mt-2.5 grid grid-cols-2 gap-x-6 gap-y-2.5">
              {s.secciones.map((sec) => (
                <Paso key={sec.nombre} i={sec.paso} className={sec.tabla || sec.letra === "!" ? "col-span-1" : "col-span-2"}>
                  <div className="relative grid grid-cols-[44px_1fr] items-start gap-4">
                    {sec.letra === "I" && (
                      <div className="absolute -top-3 right-0 z-10 rotate-[-4deg]">
                        <Paso i={3}>
                          <span className="flex items-center gap-4">
                            <Numero n={4} chico />
                            <Sello tam={16}>los datos del caso no van acá</Sello>
                          </span>
                        </Paso>
                      </div>
                    )}
                    <Letra letra={sec.letra} tam={40} />
                    <div className="min-w-0">
                      <p className="tf2-rotulo text-[12px] text-tf2-rojo">
                        {sec.nombre}
                        {sec.aclaracion && <span className="normal-case tracking-normal text-tf2-gris"> · {sec.aclaracion}</span>}
                      </p>
                      {sec.tabla ? (
                        <div className="mt-1.5 inline-grid grid-flow-col overflow-hidden rounded-[3px] border border-tf2-grafito/40">
                          {sec.fichas.map((f) => (
                            <span key={f} className="tf2-mono border-r border-tf2-grafito/30 bg-tf2-crema px-2 py-0.5 text-[14px] last:border-0">
                              {f}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {sec.fichas.map((f) => (
                            <span key={f} className={cn("tf2-mono rounded-[3px] border px-2 py-0.5 text-[14px]", sec.letra === "!" ? "border-tf2-tinta/30 bg-tf2-rojo-claro/60" : "border-tf2-linea bg-tf2-crema")}>
                              {f}
                            </span>
                          ))}
                        </div>
                      )}
                      {sec.nota && <p className="tf2-mono mt-1 text-[13px] text-tf2-grafito">{sec.nota}</p>}
                    </div>
                  </div>
                </Paso>
              ))}
            </div>
          </Hoja>
        </Paso>
      </div>
    </>
  );
}
