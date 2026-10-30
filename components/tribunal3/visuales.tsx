"use client";

// Composiciones de la tercera charla (collage editorial jurídico, gramática
// DYNTEC). Una idea visible por placa; los pasos del revelado (`i`) suman
// piezas. Los textos del expediente son de la transcripción anonimizada.
//
// Caja del visual (px del escenario 1920×1080):
//   "lado"  → a la derecha del título, 880 × 820
//   "ancho" → debajo del título y la idea clave, 1680 × 520
//   "curva" → placas de giro (07 y 13): texto circular + objeto central
// Las placas de actividad, el recupero (01) y la revelación (14) las arma el deck.

import type { ReactNode } from "react";
import { Carpeta, Cinta, Etiqueta, Ficha, Hoja, Lomo, Lupa, Mano, Paso, Pieza, Renglon, Sello, Traza } from "@/components/tribunal2/collage";
import { TF3_COTIO, TF3_DOCS, type Tf3Visual } from "@/lib/tribunal-clase3";
import { cn } from "@/lib/utils";

export type Tf3Layout = "lado" | "ancho" | "curva" | "actividad" | "propio";

export const LAYOUT3: Record<Tf3Visual, Tf3Layout> = {
  recupero: "propio",
  ventana: "lado",
  skills: "ancho",
  apelacion: "lado",
  comoPiensa: "lado",
  cotio: "ancho",
  contexto: "lado",
  a1: "actividad",
  input: "curva",
  seisDias: "lado",
  a2: "actividad",
  dosRelatos: "ancho",
  a3: "actividad",
  sabemos: "lado",
  a4: "actividad",
  mejorProveer: "propio",
  metodo: "ancho",
};

const Rot = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("tf2-rotulo text-[14px] text-tf2-gris", className)}>{children}</p>
);

/** IA 1: qué lee el modelo en cada respuesta (lo estable arriba, lo del caso abajo). */
function Ventana() {
  const capas = [
    { t: "Instrucciones del sistema", d: "las pone la aplicación", cuando: "siempre", paso: 0 },
    { t: "Memoria persistente", d: "«Trabajo en el Tribunal Fiscal de Apelación de Tucumán»", cuando: "siempre", paso: 0 },
    { t: "Skill", d: "«Análisis inicial de un recurso de clausura»", cuando: "si la tarea coincide", paso: 0 },
    { t: "Documentos", d: "D1–D5 anonimizados", cuando: "este caso", paso: 1 },
    { t: "Conversación", d: "lo que ya se dijo en este chat", cuando: "este chat", paso: 1 },
    { t: "Tu pedido · prompt", d: "«Compará agravios y respuestas; citá la página»", cuando: "cada vez", paso: 1 },
  ];
  return (
    <>
      <Pieza x={0} y={0} w={800} r={-0.6} d={60}>
        <Hoja className="p-7">
          <div className="flex items-baseline justify-between gap-4">
            <Rot className="text-tf2-rojo">Ventana de contexto</Rot>
            <span className="tf2-mono text-[15px] text-tf2-gris">lo que el modelo lee en cada respuesta</span>
          </div>
          <div className="mt-4 grid gap-[10px]">
            {capas.map((c) => (
              <Paso key={c.t} i={c.paso}>
                <div className={cn("flex items-center gap-4 rounded-[3px] border px-5 py-3", c.paso ? "border-tf2-azul/40 bg-tf2-azul-claro" : "border-tf2-linea bg-tf2-crema")}>
                  <div className="min-w-0 flex-1">
                    <p className="text-[23px] font-semibold leading-tight">{c.t}</p>
                    <p className="tf2-mono mt-1 text-[16px] leading-snug text-tf2-grafito">{c.d}</p>
                  </div>
                  <span className="tf2-rotulo shrink-0 text-[13px] text-tf2-rojo">{c.cuando}</span>
                </div>
              </Paso>
            ))}
          </div>
        </Hoja>
      </Pieza>
      <Pieza i={2} label="Lo que no está, no existe" x={20} y={680} r={-1.5} z={6}>
        <Mano tam={40} tono="azul" flecha="arriba">
          lo que no está en la ventana, no existe para el modelo
        </Mano>
      </Pieza>
      <Pieza i={2} x={560} y={600} r={-7} z={7}>
        <Sello tam={19}>no aprende entre chats</Sello>
      </Pieza>
    </>
  );
}

/** IA 2: dónde vive cada instrucción. */
function Skills() {
  const tarjetas = [
    { rotulo: "Prompt · cada vez", label: "Prompt", tono: "hoja" as const, def: "Lo que pido ahora y los datos de este expediente.", ej: "«Compará los agravios de D2 con las respuestas de D3 y citá la página.»" },
    { rotulo: "Memoria · siempre", label: "Memoria", tono: "salvia" as const, def: "Lo estable: dónde trabajo, cómo escribo, qué no hacer nunca.", ej: "«Trabajo en el Tribunal Fiscal de Apelación de Tucumán. No inventes normas: citá documento y página.»" },
    {
      rotulo: "Skill · cuando la tarea lo pide",
      label: "Skill",
      tono: "azul" as const,
      def: "Un paquete para un tipo de tarea: instrucciones, plantilla y ejemplos. La IA ve su descripción y lo carga entero cuando el pedido coincide.",
      ej: "«Análisis inicial de un recurso de clausura»",
    },
  ];
  return (
    <>
      {tarjetas.map((t, k) => (
        <Pieza key={t.label} i={k} label={t.label} x={k * 570} y={k === 1 ? 24 : 0} w={540} r={[-1.2, 0.8, -0.6][k]}>
          <Ficha rotulo={t.rotulo} tono={t.tono} tam={19}>
            {t.def}
            <br />
            <span className="text-tf2-azul">{t.ej}</span>
          </Ficha>
        </Pieza>
      ))}
      <Pieza i={3} label="Hacia COTIO" x={420} y={400} r={-1.5} z={6}>
        <Mano tam={38} tono="rojo" flecha="der">
          para escribir una buena skill hay que saber describir el trabajo: COTIO
        </Mano>
      </Pieza>
    </>
  );
}

function Apelacion() {
  return (
    <>
      <Pieza x={0} y={40} w={400} r={-2} d={60}>
        <Carpeta w={400} rotulo="Dirección General de Rentas">
          <div className="relative z-10 mt-6 grid gap-2 bg-tf2-crema p-4">
            <p className="tf2-mono text-[20px]">Resolución · clausura de seis días</p>
            <Renglon w="80%" />
            <Renglon w="60%" />
          </div>
        </Carpeta>
      </Pieza>
      <Pieza i={0} x={0} y={0} z={0}>
        <Traza w={880} h={820} d="M300 360 C 380 470, 470 470, 520 540" />
      </Pieza>
      <Pieza i={0} label="La apelación" x={430} y={330} r={-6} z={5}>
        <Sello tam={20}>Apelación · art. 146 CTP</Sello>
      </Pieza>
      <Pieza i={0} label="Revisión del Tribunal" x={470} y={470} w={400} r={2}>
        <Carpeta w={400} rotulo="Tribunal Fiscal de Apelación">
          <div className="relative z-10 mt-6 grid gap-2 bg-tf2-crema p-4">
            <p className="tf2-mono text-[20px]">Recurso · revisar lo decidido</p>
            <Renglon w="70%" />
          </div>
        </Carpeta>
      </Pieza>
      <Pieza i={1} label="Decidir y revisar" x={0} y={640} w={460}>
        <Etiqueta>la DGR ya decidió</Etiqueta>
        <div className="mt-4 pl-6">
          <Etiqueta tono="crema">el Tribunal revisa la decisión cuestionada</Etiqueta>
        </div>
      </Pieza>
    </>
  );
}

function ComoPiensa() {
  const qs = ["¿qué pasó?", "¿qué norma se aplica?", "¿qué está probado?", "¿qué falta?"];
  const pos = [
    { x: 520, y: 20, r: 4 },
    { x: 0, y: 330, r: -3 },
    { x: 520, y: 470, r: 3 },
    { x: 60, y: 700, r: -2 },
  ];
  return (
    <>
      {[0, 1, 2].map((k) => (
        <Pieza key={k} x={60 + k * 150} y={90 + (k % 2) * 140} w={340} r={-6 + k * 5} d={k * 120}>
          <Hoja className="grid gap-3 p-6">
            <Rot>{["resolución", "recurso", "contestación"][k]}</Rot>
            <Renglon />
            <Renglon w="85%" />
            <Renglon w="70%" />
            <Renglon w="90%" />
          </Hoja>
        </Pieza>
      ))}
      <Pieza x={0} y={0} z={0}>
        <Traza w={880} h={820} d="M230 470 C 330 520, 420 430, 520 470" demora={400} />
      </Pieza>
      {qs.map((q, i) => (
        <Pieza key={q} i={i} label={q} x={pos[i].x} y={pos[i].y} r={pos[i].r} z={6}>
          <Mano tam={50}>{q}</Mano>
        </Pieza>
      ))}
    </>
  );
}

function Cotio() {
  const tonos = ["crema", "salvia", "hoja", "azul", "crema"] as const;
  return (
    <>
      <Pieza x={0} y={0} z={0}>
        <Traza w={1680} h={520} d="M160 260 L 1520 260" />
      </Pieza>
      {TF3_COTIO.map((c, i) => (
        <Pieza key={i} i={i} label={c.nombre} x={i * 340} y={i % 2 ? 150 : 40} w={310} r={i % 2 ? 1.5 : -1.5}>
          <Ficha rotulo={c.nombre} tono={tonos[i]} tam={21}>
            <span className="tf2-titular block text-[86px] leading-none text-tf2-rojo">{c.letra}</span>
            {c.def}
          </Ficha>
        </Pieza>
      ))}
    </>
  );
}

function Contexto() {
  return (
    <>
      <Pieza x={40} y={360} d={60}>
        <div className="flex items-end gap-3">
          <Lomo titulo="Código Tributario" tono="#4a6378" alto={380} />
          <Lomo titulo="Procedimiento" tono="#4f5e4b" alto={350} />
          <Lomo titulo="Ley 4537" tono="#857f72" alto={330} />
          <Lomo titulo="R.P.T.F.A." tono="#ad422c" alto={360} />
          <Lomo titulo="Jurisprudencia" tono="#b5832f" alto={370} ancho={98} />
        </div>
      </Pieza>
      <Pieza x={560} y={520} r={2} d={200}>
        <Etiqueta>Tribunal Fiscal · competencia · función revisora</Etiqueta>
      </Pieza>
      <Pieza i={0} label="Una carpeta individual" x={150} y={80} w={460} r={-3} z={5}>
        <Carpeta w={460} rotulo="Expediente · datos del caso">
          <div className="relative z-10 mt-6 flex justify-center">
            <Sello tono="azul" tam={24}>
              Input
            </Sello>
          </div>
        </Carpeta>
      </Pieza>
      <Pieza i={1} x={600} y={40} r={5} z={6}>
        <Mano tam={40} tono="azul" flecha="abajo">
          la carpeta cambia; la biblioteca queda
        </Mano>
      </Pieza>
    </>
  );
}

function SeisDias() {
  return (
    <>
      <Pieza x={20} y={10} w={800} r={-1.2} d={60}>
        <Cinta x="44%" y={-14} />
        <Hoja className="p-9">
          <div className="flex items-baseline justify-between">
            <Rot>Dirección General de Rentas · D1</Rot>
            <span className="tf2-mono text-[16px] text-tf2-gris">San Miguel de Tucumán, 08/10/2025</span>
          </div>
          <p className="tf2-mono mt-5 text-[19px] font-semibold">RESOLUCIÓN N.º [reservado] · CONTRIBUYENTE A</p>
          <p className="tf2-mono mt-5 text-[19px] leading-[1.6]">
            … del relevamiento de personal efectuado en fecha 17/01/2025 surge que tres personas se encontraban <span className="tf2-resalta">desarrollando tareas inherentes al giro comercial, sin haber acreditado que se encuentren registradas</span> …
          </p>
          <p className="tf2-mono mt-4 text-[19px] leading-[1.6]">
            ARTÍCULO 2º.- Aplicar … la sanción de <span className="tf2-resalta">CLAUSURA por el término de SEIS (06) días</span> en el establecimiento sito en [domicilio reservado].
          </p>
          <div className="mt-5 grid gap-3">
            <Renglon w="80%" />
            <Renglon w="55%" />
          </div>
        </Hoja>
      </Pieza>
      <Pieza x={600} y={-20} r={8} z={5} d={500}>
        <Sello tono="tinta" tam={18}>
          Expte. [reservado]
        </Sello>
      </Pieza>
      <Pieza i={0} label="Motivo" x={30} y={600} r={-2}>
        <Etiqueta>motivo: trabajadoras no registradas · art. 79 CTP (hoy art. 80)</Etiqueta>
      </Pieza>
      <Pieza i={1} label="Sanción" x={600} y={455} r={-7} z={6}>
        <Sello tam={42}>6 días</Sello>
      </Pieza>
    </>
  );
}

function DosRelatos() {
  const col = (titulo: string, items: [string, string][], tono: string) => (
    <Hoja className={cn("p-7", tono)}>
      <Rot>{titulo}</Rot>
      <ul className="mt-4 grid gap-4">
        {items.map(([t, f]) => (
          <li key={t} className="flex items-baseline justify-between gap-4 border-b border-dashed border-tf2-linea pb-3">
            <span className="text-[25px] leading-snug">{t}</span>
            <span className="tf2-mono shrink-0 text-[17px] text-tf2-gris">{f}</span>
          </li>
        ))}
      </ul>
    </Hoja>
  );
  return (
    <>
      <Pieza i={0} label="Lo que dice el contribuyente" x={0} y={0} w={800} r={-0.8}>
        {col(
          "Apelación · D2 · lo que afirma el contribuyente",
          [
            ["No se produjo la prueba que ofreció", "p.1–2"],
            ["Rentas no tiene competencia laboral", "p.4"],
            ["La clausura es desproporcionada", "p.5"],
          ],
          "",
        )}
        <div className="absolute -right-[18px] -top-[20px] rotate-[8deg]">
          <Sello tono="azul" tam={18}>
            Alegado
          </Sello>
        </div>
      </Pieza>
      <Pieza i={1} label="Lo que responde la DGR" x={880} y={30} w={800} r={0.8}>
        {col(
          "Contestación · D3 · lo que responde Rentas",
          [
            ["El descargo se trató; el acta es instrumento público", "p.4–6"],
            ["La competencia surge del art. 80 y del art. 9 del CTP", "p.7–8"],
            ["Es una sanción tarifada: dos días por trabajador", "p.9"],
          ],
          "bg-tf2-salvia-claro",
        )}
        <div className="absolute -right-[18px] -top-[20px] rotate-[8deg]">
          <Sello tono="musgo" tam={18}>
            Alegado
          </Sello>
        </div>
      </Pieza>
    </>
  );
}

function Sabemos() {
  const fichas = [
    { t: "Relevamiento del 17/01/2025: tres personas trabajando", s: "Consta en pieza", tono: "tinta" as const, f: "D1 p.1 · D3 p.3" },
    { t: "Dos de ellas serían una familiar y una amiga del titular", s: "Alegado", tono: "azul" as const, f: "D1 p.1 · D3 p.7" },
    { t: "El acta tiene defectos en la constatación", s: "Controvertido", tono: "musgo" as const, f: "D2 p.3 · D3 p.5–6" },
    { t: "¿Qué pasó después con esa relación laboral?", s: "Pendiente", tono: "tinta" as const, f: "no consta en D1–D4" },
  ];
  return (
    <>
      {fichas.map((x, i) => (
        <Pieza key={x.t} i={i} label={x.s} x={(i % 2) * 440} y={Math.floor(i / 2) * 330 + (i % 2) * 40} w={420} r={[-2, 1.5, 1, -1.5][i]}>
          <Ficha rotulo={x.f} tono={i === 3 ? "hoja" : "crema"} tam={22}>
            {x.t}
          </Ficha>
          <div className="mt-3 flex justify-end pr-4 rotate-[-4deg]">
            <Sello tono={x.tono} tam={20}>
              {x.s}
            </Sello>
          </div>
        </Pieza>
      ))}
      <Pieza x={30} y={700} r={-1}>
        <Etiqueta tono="crema">D4 · el Tribunal declaró la cuestión de puro derecho (p.1–2)</Etiqueta>
      </Pieza>
    </>
  );
}

function Metodo() {
  return (
    <>
      <div className="absolute left-0 top-0 flex gap-4">
        {TF3_COTIO.map((c, i) => (
          <Paso key={i} i={i} label={c.nombre} className="w-[300px]">
            <Ficha rotulo={c.nombre} tono={i % 2 ? "salvia" : "crema"} tam={19}>
              <span className="tf2-titular block text-[64px] leading-none text-tf2-rojo">{c.letra}</span>
              {c.caso}
            </Ficha>
          </Paso>
        ))}
      </div>
      <Pieza x={0} y={420} w={1100}>
        <div className="flex gap-3">
          {TF3_DOCS.map((d) => (
            <span key={d.id} className="tf2-objeto tf2-mono rounded-[3px] bg-tf2-hoja px-4 py-2 text-[17px]">
              {d.id} · {d.titulo}
            </span>
          ))}
        </div>
      </Pieza>
      <Pieza x={1350} y={300} w={300} r={3} z={4}>
        <Hoja className="grid h-[200px] content-start gap-3 p-5">
          <Rot>resolución</Rot>
          <span className="tf2-mano text-[30px] text-tf2-gris">todavía sin escribir</span>
        </Hoja>
      </Pieza>
    </>
  );
}

/** Objeto del centro de cada curva (el texto circular lo dibuja el deck). */
export function CentroCurva3({ visual }: { visual: Tf3Visual }) {
  if (visual === "input")
    return (
      <div className="relative flex w-[440px] flex-col items-center">
        <div className="flex gap-4">
          <div className="w-[210px] rotate-[-3deg]">
            <Ficha rotulo="Clausura" tam={17}>
              trabajador relevado · acta · días
            </Ficha>
          </div>
          <div className="w-[210px] rotate-[3deg]">
            <Ficha rotulo="Ingresos brutos" tono="salvia" tam={17}>
              base imponible · alícuota · período
            </Ficha>
          </div>
        </div>
        <div className="tf2-objeto tf2-mono mt-4 w-[400px] rounded-[3px] bg-tf2-azul px-4 py-2 text-center text-[16px] uppercase tracking-[0.12em] text-white">
          mismo marco: Código Tributario
        </div>
      </div>
    );
  return (
    <div className="relative w-[400px]">
      <Carpeta w={400} rotulo="Expediente">
        <div className="relative z-10 mt-5 grid gap-3">
          {["D1", "D2", "D3", "D4"].map((d) => (
            <span key={d} className="tf2-mono block bg-tf2-crema px-3 py-1.5 text-[17px]">
              {d}
            </span>
          ))}
          <span className="tf2-mono block border-2 border-dashed border-tf2-gris px-3 py-1.5 text-center text-[20px] text-tf2-gris">?</span>
        </div>
      </Carpeta>
      <div className="absolute -right-[40px] top-[60px]">
        <Lupa w={110} />
      </div>
    </div>
  );
}

export function Visual3({ visual }: { visual: Tf3Visual }) {
  switch (visual) {
    case "ventana":
      return <Ventana />;
    case "skills":
      return <Skills />;
    case "apelacion":
      return <Apelacion />;
    case "comoPiensa":
      return <ComoPiensa />;
    case "cotio":
      return <Cotio />;
    case "contexto":
      return <Contexto />;
    case "seisDias":
      return <SeisDias />;
    case "dosRelatos":
      return <DosRelatos />;
    case "sabemos":
      return <Sabemos />;
    case "metodo":
      return <Metodo />;
    default:
      return null;
  }
}
