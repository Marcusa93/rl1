"use client";

// Laboratorio de skills de /doing: el procedimiento de acompañamiento
// documental empaquetado como skill (carpeta con SKILL.md, plantilla y
// checklist). Se ve su anatomía, se prueba en vivo con tres casos (normal,
// incompleto y que excede: los dos últimos tienen que detenerse) y se
// descarga como .zip lista para subir a Claude, o se copia como
// instrucciones para un proyecto, GPT o Gem.

import { useRef, useState } from "react";
import { copiar, pedirIA } from "@/components/doing/ia";
import { Md } from "@/components/doing/md";
import { rotuloBloque } from "@/components/doing/marco";
import { crearZip, descargar } from "@/components/doing/zip";
import { SKILL_ARCHIVOS, SKILL_MD, SKILL_NOMBRE, SKILL_PRUEBAS } from "@/lib/doing-caso";
import type { DgPantallaSkill } from "@/lib/doing-clase";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

const DONDE = [
  { h: "Claude", d: "Configuración → Capacidades → Skills: subir el .zip. Claude la usa cuando el pedido coincide con su descripción." },
  { h: "ChatGPT", d: "Pegar el SKILL.md como instrucciones de un proyecto o GPT y adjuntar la plantilla y el checklist." },
  { h: "Gemini", d: "Crear una Gem con el SKILL.md como instrucciones y la plantilla como archivo." },
];

export function descargarSkill() {
  descargar(crearZip(SKILL_ARCHIVOS), `${SKILL_NOMBRE}.zip`);
}

/** El SKILL.md con el encabezado (nombre y descripción) destacado. */
function SkillMd({ className }: { className?: string }) {
  const [, front, cuerpo] = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(SKILL_MD) ?? ["", "", SKILL_MD];
  return (
    <div className={cn("dg-hoja overflow-auto rounded-xl border border-dg-linea", className)}>
      <div className="border-b border-dashed border-dg-linea bg-dg-ocre-claro/60 px-4 py-3">
        <p className="dg-rotulo mb-1 text-[0.55rem] text-dg-ocre">Encabezado · cuándo usarla</p>
        {front.split("\n").map((l) => {
          const [k, ...v] = l.split(":");
          return (
            <p key={k} className="dg-maquina text-[0.82rem] leading-snug text-dg-tinta">
              <b className="text-dg-ocre">{k}:</b>
              {v.join(":")}
            </p>
          );
        })}
      </div>
      <div className="px-4 py-3">
        <p className="dg-rotulo mb-1 text-[0.55rem] text-dg-verde">Instrucciones · cómo trabajar y cuándo detenerse</p>
        <Md texto={cuerpo} className="text-[0.82rem] text-dg-tinta" />
      </div>
    </div>
  );
}

function Arbol() {
  const archivos = [
    { n: "SKILL.md", d: "nombre, descripción e instrucciones", c: "text-dg-ocre" },
    { n: "plantilla.md", d: "el texto fijo y sus campos", c: "text-dg-azul" },
    { n: "checklist.md", d: "lo que controla el profesional", c: "text-dg-verde" },
  ];
  return (
    <div className="dg-maquina rounded-xl border border-dg-linea bg-dg-hoja px-4 py-3 text-[0.95rem] text-dg-tinta">
      <p className="font-bold">📁 {SKILL_NOMBRE}/</p>
      {archivos.map((a, i) => (
        <p key={a.n} className="mt-1 pl-4">
          <span className="text-dg-niebla">{i === archivos.length - 1 ? "└─" : "├─"}</span> <b className={a.c}>{a.n}</b>{" "}
          <span className="font-sans text-[0.82rem] text-dg-pizarra">· {a.d}</span>
        </p>
      ))}
    </div>
  );
}

type Prueba = { id: string; texto: string; estado: "cargando" | "listo" | "error" };

/** Las tres pruebas de la skill, en vivo. */
function Pruebas({ grande }: { grande?: boolean }) {
  const [prueba, setPrueba] = useState<Prueba | null>(null);
  const control = useRef<AbortController | null>(null);
  async function correr(id: string) {
    const p = SKILL_PRUEBAS.find((x) => x.id === id);
    if (!p) return;
    control.current?.abort();
    const ctrl = new AbortController();
    control.current = ctrl;
    setPrueba({ id, texto: "", estado: "cargando" });
    try {
      const texto = await pedirIA({
        mensajes: [{ role: "user", content: p.pedido }],
        materiales: ["comprobantes"],
        skill: true,
        signal: ctrl.signal,
        onTexto: (t) => setPrueba((x) => (x?.id === id ? { ...x, texto: t } : x)),
      });
      setPrueba((x) => (x?.id === id ? { ...x, texto, estado: "listo" } : x));
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setPrueba({ id, texto: (e as Error).message, estado: "error" });
    }
  }
  const actual = SKILL_PRUEBAS.find((x) => x.id === prueba?.id);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="grid grid-cols-3 gap-2">
        {SKILL_PRUEBAS.map((p) => (
          <button
            key={p.id}
            onClick={() => correr(p.id)}
            {...(grande ? rem(`🧪 ${p.etiqueta}`, prueba?.id === p.id) : {})}
            className={cn(
              "rounded-xl border px-2 py-2 text-left transition",
              prueba?.id === p.id ? "border-dg-verde bg-dg-salvia-claro" : "border-dg-linea bg-dg-hoja hover:border-dg-verde",
            )}
          >
            <span className={cn("block font-semibold text-dg-tinta", grande ? "text-[0.95rem]" : "text-sm")}>▶ {p.etiqueta}</span>
            <span className={cn("block leading-snug text-dg-pizarra", grande ? "text-[0.78rem]" : "text-xs")}>Se espera: {p.espera}</span>
          </button>
        ))}
      </div>
      {prueba && (
        <div className={cn("dg-pantalla min-h-0 flex-1 overflow-auto rounded-xl px-4 py-3", grande ? "max-h-[17rem]" : "max-h-[24rem]")}>
          <p className="mb-1 text-[0.75rem] font-semibold text-dg-verde">
            {actual?.etiqueta} · {prueba.estado === "cargando" ? "● la IA está aplicando la skill…" : prueba.estado === "error" ? "no respondió" : "respuesta en vivo"}
          </p>
          {prueba.estado === "error" ? (
            <p className="text-sm text-dg-lacre">{prueba.texto}</p>
          ) : (
            <Md texto={prueba.texto} className={cn("text-dg-tinta", grande ? "text-[0.92rem]" : "text-sm", prueba.estado === "cargando" && "dg-cursor")} />
          )}
        </div>
      )}
    </div>
  );
}

/** Pantalla del deck. */
export function PantallaSkill({ slide }: { slide: DgPantallaSkill }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="dg-rotulo flex items-center gap-3 text-dg-azul">
            <span className="flex size-7 items-center justify-center rounded-full bg-dg-azul text-[0.8rem] text-white">🧰</span>
            Laboratorio · {rotuloBloque(slide.bloque)}
          </p>
          <h1 className="dg-titular tf-sube mt-3 text-[3.3rem] text-dg-tinta">{slide.titulo}</h1>
          <p className="mt-1 max-w-[60rem] text-[1.25rem] text-dg-pizarra">{slide.bajada}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button onClick={descargarSkill} {...rem("⬇ Descargar la skill (.zip)")} className="rounded-xl bg-dg-verde px-4 py-2.5 text-[0.95rem] font-semibold text-white">
            ⬇ Skill (.zip)
          </button>
          <button
            onClick={async () => {
              setCopiado(await copiar(SKILL_MD));
              setTimeout(() => setCopiado(false), 3000);
            }}
            className="rounded-xl border border-dg-linea bg-dg-hoja px-4 py-2.5 text-[0.95rem] font-semibold text-dg-tinta"
          >
            {copiado ? "✓ Copiado" : "Copiar SKILL.md"}
          </button>
        </div>
      </header>

      <div className="mt-5 grid min-h-0 flex-1 grid-cols-[0.85fr_1.15fr_1.1fr] gap-5">
        <div className="flex flex-col gap-3">
          <Arbol />
          <div className="rounded-xl border border-dg-linea bg-dg-hoja px-4 py-3">
            <div className="grid grid-cols-2 gap-3 text-[0.95rem]">
              <div>
                <p className="dg-rotulo text-[0.56rem] text-dg-lacre">Un prompt</p>
                <p className="mt-1 leading-snug text-dg-tinta">Se escribe cada vez. Depende de acordarse de todo.</p>
              </div>
              <div>
                <p className="dg-rotulo text-[0.56rem] text-dg-verde">Una skill</p>
                <p className="mt-1 leading-snug text-dg-tinta">Se diseña una vez, se prueba y se mejora. Incluye cuándo detenerse.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            {DONDE.map((d) => (
              <p key={d.h} className="rounded-xl bg-dg-azul-claro/70 px-3 py-2 text-[0.88rem] leading-snug text-dg-tinta">
                <b>{d.h}:</b> {d.d}
              </p>
            ))}
          </div>
        </div>
        <SkillMd className="max-h-[31rem]" />
        <div className="flex min-h-0 flex-col gap-2">
          <p className="dg-rotulo text-[0.6rem] text-dg-verde">Probala en vivo · tres casos</p>
          <Pruebas grande />
        </div>
      </div>
    </article>
  );
}

/** Versión para la vista del participante (laboratorio). */
export function SkillParticipante() {
  const [copiado, setCopiado] = useState(false);
  const [ver, setVer] = useState(false);
  return (
    <div className="grid gap-3">
      <p className="text-sm leading-relaxed text-dg-tinta">
        Una <b>skill</b> es un procedimiento empaquetado: una carpeta con instrucciones (<span className="dg-maquina">SKILL.md</span>), una plantilla y un checklist. Su
        descripción le dice a la IA cuándo usarla; el cuerpo, cómo trabajar y <b>cuándo detenerse</b>.
      </p>
      <Arbol />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={descargarSkill} className="rounded-xl bg-dg-verde px-3 py-2.5 text-sm font-semibold text-white">
          ⬇ Descargar (.zip)
        </button>
        <button
          onClick={async () => {
            setCopiado(await copiar(SKILL_MD));
            setTimeout(() => setCopiado(false), 3000);
          }}
          className="rounded-xl border border-dg-verde/50 bg-dg-hoja px-3 py-2.5 text-sm font-semibold text-dg-verde"
        >
          {copiado ? "✓ Copiado" : "Copiar SKILL.md"}
        </button>
      </div>
      <button onClick={() => setVer((v) => !v)} className="text-left text-sm font-semibold text-dg-azul">
        {ver ? "▲ Ocultar el SKILL.md" : "▼ Ver el SKILL.md"}
      </button>
      {ver && <SkillMd className="max-h-[28rem]" />}
      <p className="dg-rotulo text-[0.6rem] text-dg-verde">Probala: los dos últimos casos tienen que detenerse</p>
      <Pruebas />
      <div className="grid gap-1.5">
        {DONDE.map((d) => (
          <p key={d.h} className="rounded-xl bg-dg-azul-claro/70 px-3 py-2 text-xs leading-snug text-dg-tinta">
            <b>{d.h}:</b> {d.d}
          </p>
        ))}
      </div>
    </div>
  );
}
