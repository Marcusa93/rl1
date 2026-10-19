"use client";

// Demostración 4 de /doing: generador de escritos de acompañamiento
// documental. Arquitectura combinada y visible: las reglas validan los datos
// y completan la plantilla (texto fijo intacto); la IA solo redacta el
// fragmento variable (III. Descripción); el resultado es un borrador para
// revisión profesional. Tres interruptores provocan los casos en que el
// procedimiento tiene que detenerse.

import { useRef, useState } from "react";
import { pedirIA } from "@/components/doing/ia";
import { rotuloBloque } from "@/components/doing/marco";
import { C, GlifoAlto, Sello } from "@/components/doing/piezas";
import { CASO, COMPROBANTES, comprobanteTexto, getDemo, PLANTILLA_TEXTO, pesos } from "@/lib/doing-caso";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

type Etapa = "datos" | "validacion" | "plantilla" | "ia" | "borrador" | "revision";
type EstadoEtapa = "pendiente" | "ok" | "cargando" | "detenido";

const ETAPAS: { id: Etapa; t: string; d: string }[] = [
  { id: "datos", t: "Datos", d: "formulario" },
  { id: "validacion", t: "Validación", d: "reglas" },
  { id: "plantilla", t: "Plantilla", d: "reglas" },
  { id: "ia", t: "Descripción", d: "IA" },
  { id: "borrador", t: "Borrador", d: "resultado" },
  { id: "revision", t: "Revisión", d: "profesional" },
];

const NUMEROS = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis"];

const descripcionPreparada = (docs: number[]) =>
  COMPROBANTES.filter((c) => docs.includes(c.n))
    .map(
      (c) =>
        `Comprobante ${c.n}: transferencia inmediata N.º ${c.operacion} del ${c.fecha}, a las ${c.hora}, por ${pesos(c.importe)},00, desde la cuenta de ${CASO.demandada} a la cuenta de ${CASO.actora}, con la referencia «${c.referencia || "sin referencia"}».`,
    )
    .join("\n");

interface Campos {
  organo: string;
  expediente: string;
  caratula: string;
  parte: string;
  letrado: string;
  domicilio: string;
  cantidad: string;
}

const INICIALES: Campos = {
  organo: CASO.organo,
  expediente: CASO.expediente,
  caratula: CASO.caratula,
  parte: CASO.demandada,
  letrado: CASO.letrada,
  domicilio: CASO.domicilio,
  cantidad: "3",
};

const ETIQUETAS: Record<keyof Campos, string> = {
  organo: "Órgano",
  expediente: "Expediente",
  caratula: "Carátula",
  parte: "Parte que presenta",
  letrado: "Letrado/a",
  domicilio: "Domicilio constituido",
  cantidad: "Cantidad declarada",
};

export function Generador({ bloque }: { bloque: number }) {
  const [campos, setCampos] = useState<Campos>(INICIALES);
  const [docs, setDocs] = useState<number[]>([1, 2, 3]);
  const [argumentar, setArgumentar] = useState(false);
  const [estados, setEstados] = useState<Record<Etapa, EstadoEtapa>>(() => Object.fromEntries(ETAPAS.map((e) => [e.id, "pendiente"])) as Record<Etapa, EstadoEtapa>);
  const [problemas, setProblemas] = useState<string[]>([]);
  const [descripcion, setDescripcion] = useState("");
  const [fuente, setFuente] = useState<"vivo" | "respaldo" | null>(null);
  const [detenidoIA, setDetenidoIA] = useState("");
  const control = useRef<AbortController | null>(null);

  const set = (k: keyof Campos, v: string) => setCampos((c) => ({ ...c, [k]: v }));
  const etapa = (id: Etapa, e: EstadoEtapa) => setEstados((s) => ({ ...s, [id]: e }));

  function reglas(): string[] {
    const p: string[] = [];
    (Object.keys(ETIQUETAS) as (keyof Campos)[]).forEach((k) => {
      if (!campos[k].trim()) p.push(`Falta un dato obligatorio: ${ETIQUETAS[k]}.`);
    });
    if (campos.expediente.trim() && !/^\d{1,6}\/\d{4}$/.test(campos.expediente.trim())) p.push("El expediente no tiene el formato número/año (ej.: 4418/2026).");
    if (!docs.length) p.push("No hay documentos seleccionados.");
    if (campos.cantidad.trim() && Number(campos.cantidad) !== docs.length)
      p.push(`La cantidad declarada (${campos.cantidad}) no coincide con los documentos adjuntos (${docs.length}).`);
    if (argumentar) p.push("El pedido excede el modelo: sostener que la factura 418 está cancelada es una decisión profesional, no un acompañamiento.");
    return p;
  }

  async function generar() {
    control.current?.abort();
    setDescripcion("");
    setFuente(null);
    setDetenidoIA("");
    setEstados({ datos: "ok", validacion: "cargando", plantilla: "pendiente", ia: "pendiente", borrador: "pendiente", revision: "pendiente" });
    await new Promise((r) => setTimeout(r, 450));
    const p = reglas();
    setProblemas(p);
    if (p.length) {
      etapa("validacion", "detenido");
      return;
    }
    etapa("validacion", "ok");
    await new Promise((r) => setTimeout(r, 300));
    etapa("plantilla", "ok");
    etapa("ia", "cargando");

    const demo = getDemo("d4")!;
    const prompt = `${demo.pasos[0].prompt}

Devolvé únicamente el texto del apartado III. DESCRIPCIÓN (una oración por documento, con los datos tal como figuran), sin título. Si corresponde detenerte, devolvé la palabra DETENIDO seguida de los motivos.

Campos validados:
${(Object.keys(ETIQUETAS) as (keyof Campos)[]).map((k) => `- ${ETIQUETAS[k]}: ${campos[k]}`).join("\n")}

Documentos que se acompañan:
${COMPROBANTES.filter((c) => docs.includes(c.n))
  .map((c) => comprobanteTexto(c))
  .join("\n\n")}`;
    const ctrl = new AbortController();
    control.current = ctrl;
    try {
      const texto = await pedirIA({ mensajes: [{ role: "user", content: prompt }], materiales: ["plantilla"], signal: ctrl.signal, onTexto: setDescripcion });
      if (/^\s*\**DETENIDO/i.test(texto)) {
        setDetenidoIA(texto.replace(/^\s*\**DETENIDO\**:?\s*/i, ""));
        setDescripcion("");
        etapa("ia", "detenido");
        return;
      }
      setFuente("vivo");
      terminar();
    } catch {
      if (ctrl.signal.aborted) return;
      etapa("ia", "detenido");
      setDetenidoIA("La IA no respondió. Podés usar la descripción preparada.");
    }
  }

  function terminar() {
    etapa("ia", "ok");
    etapa("borrador", "ok");
    etapa("revision", "cargando");
  }

  function usarPreparada() {
    control.current?.abort();
    setDetenidoIA("");
    setDescripcion(descripcionPreparada(docs));
    setFuente("respaldo");
    terminar();
  }

  const borradorListo = estados.borrador === "ok";
  const valores: Record<string, string> = {
    organo: campos.organo,
    expediente: campos.expediente,
    caratula: campos.caratula,
    letrado: campos.letrado,
    parte: campos.parte,
    domicilio: campos.domicilio,
    lista_documentos: COMPROBANTES.filter((c) => docs.includes(c.n))
      .map((c, i) => `${i + 1}) Comprobante de transferencia del ${c.fecha} por ${pesos(c.importe)} (operación N.º ${c.operacion}).`)
      .join("\n"),
    cantidad: String(docs.length),
    cantidad_letras: NUMEROS[docs.length] ?? String(docs.length),
  };

  return (
    <article className="flex flex-1 flex-col">
      <header className="flex flex-col gap-3">
        <div className="min-w-0">
          <p className="dg-rotulo flex items-center gap-3 text-dg-lacre">
            <span className="flex size-7 items-center justify-center rounded-full bg-dg-lacre text-[0.75rem] text-white">▶</span>
            Demostración 4 en vivo · {rotuloBloque(bloque)}
          </p>
          <h1 className="dg-titular mt-2 text-[2.8rem] text-dg-tinta">Del formulario al borrador</h1>
        </div>
        <div className="flex items-center gap-1.5">
          {ETAPAS.map((e, i) => (
            <div key={e.id} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-dg-niebla">→</span>}
              <span
                className={cn(
                  "min-w-[7.5rem] rounded-xl border-2 px-3 py-1 text-center leading-tight transition",
                  estados[e.id] === "ok" && "border-dg-verde bg-dg-salvia-claro",
                  estados[e.id] === "cargando" && "dg-latido border-dg-ocre bg-dg-ocre-claro",
                  estados[e.id] === "detenido" && "border-dg-lacre bg-dg-lacre-claro",
                  estados[e.id] === "pendiente" && "border-dg-linea bg-dg-hoja",
                )}
              >
                <span className="block text-[0.95rem] font-semibold text-dg-tinta">{e.t}</span>
                <span className="dg-maquina block text-[0.7rem] text-dg-pizarra">{estados[e.id] === "detenido" ? "detenido" : e.d}</span>
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="mt-4 grid min-h-0 flex-1 grid-cols-[0.8fr_1.2fr] gap-6">
        <div className="flex min-h-0 flex-col gap-3">
          <div className="grid gap-2 rounded-2xl border border-dg-linea bg-dg-hoja p-4">
            {(Object.keys(ETIQUETAS) as (keyof Campos)[]).map((k) => (
              <label key={k} className="grid grid-cols-[9.5rem_1fr] items-center gap-3">
                <span className="text-[0.82rem] font-semibold uppercase tracking-wide text-dg-niebla">{ETIQUETAS[k]}</span>
                <input
                  value={campos[k]}
                  onChange={(e) => set(k, e.target.value)}
                  className={cn("dg-maquina w-full rounded-lg border bg-white px-2.5 py-1.5 text-[0.95rem] outline-none focus:border-dg-verde", !campos[k].trim() ? "border-dg-lacre" : "border-dg-linea")}
                />
              </label>
            ))}
            <div className="grid grid-cols-[9.5rem_1fr] items-center gap-3">
              <span className="text-[0.82rem] font-semibold uppercase tracking-wide text-dg-niebla">Documentos</span>
              <div className="flex gap-2">
                {COMPROBANTES.map((c) => (
                  <button
                    key={c.n}
                    onClick={() => setDocs((d) => (d.includes(c.n) ? d.filter((x) => x !== c.n) : [...d, c.n].sort()))}
                    className={cn("rounded-lg border px-2.5 py-1.5 text-[0.9rem]", docs.includes(c.n) ? "border-dg-verde bg-dg-salvia-claro text-dg-tinta" : "border-dg-linea text-dg-niebla")}
                  >
                    {docs.includes(c.n) ? "☑" : "☐"} Comp. {c.n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-dg-lacre/50 bg-dg-lacre-claro/30 p-3">
            <p className="dg-rotulo text-[0.6rem] text-dg-lacre">Provocar un error</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Interruptor activo={!campos.expediente.trim()} onClick={() => set("expediente", campos.expediente.trim() ? "" : CASO.expediente)} label="Vaciar el expediente" />
              <Interruptor activo={campos.cantidad === "4"} onClick={() => set("cantidad", campos.cantidad === "4" ? "3" : "4")} label="Declarar 4 documentos" />
              <Interruptor activo={argumentar} onClick={() => setArgumentar((v) => !v)} label="Pedir que argumente la cancelación" />
            </div>
          </div>
          <button onClick={generar} {...rem("⚙️ Generar borrador")} className="rounded-xl bg-dg-verde px-4 py-3 text-[1.05rem] font-semibold text-white hover:brightness-110">
            ⚙️ Generar borrador
          </button>
        </div>

        <div className="dg-pantalla min-h-0 max-h-[30rem] overflow-auto rounded-2xl px-6 py-5">
          {estados.validacion === "pendiente" && (
            <div className="flex h-full flex-col items-center justify-center text-center text-dg-niebla">
              <p className="dg-serif text-[2rem]">El borrador aparece acá</p>
              <p className="text-[1rem]">Reglas para lo estable, IA solo para la descripción, revisión profesional al final.</p>
            </div>
          )}
          {estados.validacion === "detenido" && (
            <Detenido titulo="Las reglas detuvieron el procedimiento" items={problemas} pie="No se llamó a la IA: el profesional tiene que resolver esto antes de seguir." />
          )}
          {estados.ia === "detenido" && detenidoIA && (
            <>
              <Detenido titulo="La IA se detuvo" items={[detenidoIA]} pie="Lo resuelve el profesional." />
              <button onClick={usarPreparada} {...rem("Usar descripción preparada")} className="mt-3 rounded-lg border border-dg-linea bg-dg-hoja px-3 py-1.5 text-[0.9rem]">
                Usar descripción preparada
              </button>
            </>
          )}
          {(estados.plantilla === "ok" && estados.validacion === "ok") && (
            <div className={cn(estados.ia === "detenido" && "mt-5 opacity-50")}>
              <div className="mb-3 flex items-center justify-between gap-3">
                {borradorListo ? <Sello texto="Borrador para revisión profesional" color={C.ocre} className="text-[0.8rem]" /> : <span />}
                {estados.ia === "cargando" && (
                  <button onClick={usarPreparada} {...rem("Usar descripción preparada")} className="rounded-lg border border-dg-linea bg-dg-hoja px-3 py-1 text-[0.82rem]">
                    Usar descripción preparada
                  </button>
                )}
              </div>
              <Borrador valores={valores} descripcion={descripcion} cargando={estados.ia === "cargando"} fuente={fuente} />
              {borradorListo && (
                <div className="mt-4 rounded-xl border border-dg-tinta/20 bg-dg-papel px-4 py-3">
                  <p className="dg-rotulo text-[0.6rem] text-dg-tinta">Revisión profesional · antes de usarlo</p>
                  <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[0.92rem] text-dg-tinta">
                    <li>☐ Datos del expediente</li>
                    <li>☐ Documentos adjuntos y completos</li>
                    <li>☐ Fechas, importes, referencias</li>
                    <li>☐ La descripción no interpreta</li>
                    <li className="col-span-2 text-dg-lacre">☐ ¿Corresponde presentarlo? Esa decisión no la toma el sistema.</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Interruptor({ activo, onClick, label }: { activo: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      {...rem(`⚠ ${label}`, activo)}
      className={cn("rounded-full border px-3 py-1.5 text-[0.88rem] transition", activo ? "border-dg-lacre bg-dg-lacre text-white" : "border-dg-lacre/40 bg-dg-hoja text-dg-lacre")}
    >
      {activo ? "● " : "○ "}
      {label}
    </button>
  );
}

function Detenido({ titulo, items, pie }: { titulo: string; items: string[]; pie: string }) {
  return (
    <div className="tf-sube rounded-2xl border-2 border-dg-lacre bg-dg-lacre-claro/60 px-5 py-4">
      <p className="flex items-center gap-3 text-[1.3rem] font-semibold text-dg-lacre">
        <GlifoAlto className="size-8 shrink-0" />
        {titulo}
      </p>
      <ul className="mt-3 grid gap-1.5 text-[1.05rem] text-dg-tinta">
        {items.map((x) => (
          <li key={x} className="whitespace-pre-line">
            ✗ {x}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.95rem] text-dg-pizarra">{pie}</p>
    </div>
  );
}

/** La plantilla con sus tres capas a la vista: texto fijo, campos (reglas) y fragmento generado (IA). */
function Borrador({ valores, descripcion, cargando, fuente }: { valores: Record<string, string>; descripcion: string; cargando: boolean; fuente: "vivo" | "respaldo" | null }) {
  const partes = PLANTILLA_TEXTO.split(/(\{\{[a-z_]+\}\})/);
  return (
    <div className="dg-hoja rounded-xl border border-dg-linea px-6 py-5">
      <p className="dg-maquina whitespace-pre-wrap text-[0.95rem] leading-relaxed text-dg-pizarra">
        {partes.map((p, i) => {
          const m = /^\{\{([a-z_]+)\}\}$/.exec(p);
          if (!m) return <span key={i}>{p}</span>;
          if (m[1] === "descripcion")
            return (
              <span key={i} className={cn("block rounded border-l-4 border-dg-verde bg-dg-salvia-claro px-2 py-1 text-dg-tinta", cargando && "dg-cursor")}>
                {descripcion || (cargando ? "" : "—")}
                {fuente === "respaldo" && <span className="mt-1 block text-[0.75rem] font-semibold text-dg-pizarra">(descripción preparada, no generada en vivo)</span>}
              </span>
            );
          return (
            <span key={i} className="dg-campo text-dg-tinta">
              {valores[m[1]] ?? p}
            </span>
          );
        })}
      </p>
    </div>
  );
}

