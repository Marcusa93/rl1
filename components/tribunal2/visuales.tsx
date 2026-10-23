"use client";

// Las composiciones de la segunda charla: una por placa. Cada una vuelve
// visible una idea (no repite la bajada) con objetos del collage. Los pasos
// del revelado (`i`) suman piezas; el título y la bajada nunca cambian.
//
// Caja del visual (px del escenario 1920×1080):
//   "lado"  → a la derecha del título, 880 × 820
//   "ancho" → debajo del título, 1680 × 520
//   "curva" → placas de giro (11, 16, 22, 27): texto circular + un objeto
// Los ejemplos son ficticios y genéricos (sin datos del Tribunal).

import type { ReactNode } from "react";
import {
  Botella,
  Burbuja,
  Carpeta,
  Cinta,
  Circulo,
  Clip,
  Etiqueta,
  Ficha,
  Hoja,
  Lomo,
  Lupa,
  Maquina,
  Mano,
  Monitor,
  Paso,
  Perforada,
  Pieza,
  Renglon,
  Sello,
  Tipeo,
  Traza,
  Vaso,
} from "@/components/tribunal2/collage";
import type { Tf2Visual } from "@/lib/tribunal-clase2";
import { cn } from "@/lib/utils";

export type Tf2Layout = "lado" | "ancho" | "curva" | "actividad" | "propio";

export const LAYOUT: Record<Tf2Visual, Tf2Layout> = {
  robot: "lado",
  supuestos: "actividad",
  noRobot: "ancho",
  contexto: "lado",
  instruir: "lado",
  anatomia: "lado",
  misma: "actividad",
  iteracion: "lado",
  dividir: "ancho",
  discutir: "lado",
  decidir: "curva",
  reusar: "lado",
  memoria: "ancho",
  ecosistemas: "ancho",
  disenar: "actividad",
  biblioteca: "curva",
  fueraExpediente: "lado",
  minimizar: "lado",
  fuente: "lado",
  verificar: "ancho",
  historia: "lado",
  autorrevision: "curva",
  formato: "ancho",
  plantilla: "ancho",
  estilo: "lado",
  humano: "actividad",
  parecido: "curva",
  proceso: "ancho",
  asistente: "actividad",
  huellas: "propio",
  futuro: "lado",
};

const Rot = ({ children, className }: { children: ReactNode; className?: string }) => (
  <p className={cn("tf2-rotulo text-[14px] text-tf2-gris", className)}>{children}</p>
);

// --- Bloque 1 --------------------------------------------------------------------------------------

function Robot() {
  return (
    <>
      <Pieza x={30} y={40} w={540} r={-3} d={100}>
        <Cinta x="40%" y={-14} />
        <Ficha rotulo="Instrucción" tam={38}>
          Serví un vaso de agua.
        </Ficha>
      </Pieza>
      <Pieza x={110} y={330} d={300}>
        <Vaso w={250} agua={0} />
      </Pieza>
      <Pieza x={430} y={240} d={420}>
        <Botella w={160} />
      </Pieza>
      <Pieza i={0} label="¿Qué vaso?" x={600} y={70} r={4}>
        <Mano flecha="izq">¿qué vaso?</Mano>
      </Pieza>
      <Pieza i={1} label="¿Cuánta agua?" x={0} y={240} r={-5}>
        <Mano flecha="abajo">¿cuánta agua?</Mano>
      </Pieza>
      <Pieza i={2} label="¿De dónde?" x={610} y={330} r={5}>
        <Mano flecha="izq">¿de la canilla o de la botella?</Mano>
      </Pieza>
      <Pieza i={3} label="¿Para quién?" x={10} y={775} r={-2}>
        <Mano tono="azul">¿para quién? ¿dónde lo dejo? ¿y si no hay vaso?</Mano>
      </Pieza>
    </>
  );
}

function NoRobot() {
  return (
    <>
      <Pieza i={0} label="Programa determinista" x={0} y={20} w={700}>
        <Perforada texto="SERVIR AGUA EN VASO" w={660} className="rotate-[-2deg]" />
        <div className="mt-6 flex items-center gap-5">
          <Etiqueta>Programa: hace exactamente lo escrito, paso por paso.</Etiqueta>
        </div>
      </Pieza>
      <Pieza i={0} x={736} y={150}>
        <span className="tf2-titular text-[150px] text-tf2-gris/70">≠</span>
      </Pieza>
      <Pieza i={1} label="Modelo de lenguaje" x={900} y={0} w={760} r={1.5}>
        <Monitor rotulo="modelo de lenguaje">
          <div className="grid gap-3">
            <Burbuja de="persona">Serví un vaso de agua.</Burbuja>
            <Burbuja de="ia">Le sirvo agua natural, hasta la mitad, en el vaso de la mesa. ¿La prefiere fría?</Burbuja>
          </div>
        </Monitor>
        <div className="absolute -bottom-[44px] right-[40px] rotate-[-5deg]">
          <Sello tam={26}>Plausible ≠ correcta</Sello>
        </div>
      </Pieza>
    </>
  );
}

function Contexto() {
  return (
    <>
      <Pieza x={170} y={20} w={560} r={-2} d={80}>
        <Cinta x={-30} y={18} r={-40} w={110} />
        <Ficha rotulo="La misma consigna" tam={36}>
          Resumí este expediente.
        </Ficha>
      </Pieza>
      <Pieza i={0} label="Situación 1" x={0} y={300} w={430} r={-4}>
        <Ficha rotulo="Situación 1" tono="salvia" tam={24}>
          para la vocalía · antes del acuerdo · agravios, prueba y estado
        </Ficha>
        <Mano className="mt-4 block pl-4" tam={40}>
          «Expte. 101/26: tres agravios; falta el informe de Rentas»
        </Mano>
      </Pieza>
      <Pieza i={1} label="Situación 2" x={450} y={380} w={430} r={3}>
        <Ficha rotulo="Situación 2" tono="azul" tam={24}>
          para el contribuyente en mesa de entradas · lenguaje claro · sin anticipar la decisión
        </Ficha>
        <Mano className="mt-4 block pl-4" tono="azul" tam={40}>
          «Su recurso está en trámite; le informaremos…»
        </Mano>
      </Pieza>
    </>
  );
}

// --- Bloque 2 --------------------------------------------------------------------------------------

function Instruir() {
  return (
    <>
      <Pieza i={0} label="Un pedido vago" x={0} y={40} w={430} r={-4}>
        <Hoja className="pb-10">
          <p className="tf2-serif text-[42px] leading-tight">¿Me hacés un resumen del expediente?</p>
        </Hoja>
        <div className="mt-6 grid gap-2 pl-6">
          <Mano tam={36}>¿para la vocalía o para el contribuyente?</Mano>
          <Mano tam={36}>¿de qué extensión?</Mano>
          <Mano tam={36}>¿con qué piezas?</Mano>
        </div>
        <div className="absolute -right-[60px] -top-[34px] rotate-[8deg]">
          <Sello tam={22}>Decide la IA</Sello>
        </div>
      </Pieza>
      <Pieza i={1} label="Una instrucción" x={400} y={300} w={480} r={2}>
        <Cinta x="30%" y={-14} />
        <Ficha rotulo="Instrucción" tono="hoja" tam={22}>
          <b className="text-tf2-rojo">Qué hacer:</b> resumí el estado del Expte. 101/2026 (ficticio).
          <br />
          <b className="text-tf2-rojo">Condiciones:</b> para la vocalía · una página · solo con las piezas adjuntas · marcá plazos y lo que falte.
        </Ficha>
      </Pieza>
    </>
  );
}

const CAPAS = [
  { k: "Rol funcional", t: "Actuá como asistente de la mesa de entradas del Tribunal.", c: "bg-tf2-salvia" },
  { k: "Tarea", t: "Respondé a un contribuyente que pregunta por su recurso.", c: "bg-tf2-azul" },
  { k: "Contexto", t: "No tiene formación jurídica ni contable.", c: "bg-tf2-ocre" },
  { k: "Fuentes", t: "Usá solo los datos del expediente que te pego.", c: "bg-tf2-musgo" },
  { k: "Límites", t: "No anticipes la decisión ni inventes plazos.", c: "bg-tf2-rojo" },
  { k: "Formato", t: "Trato de usted, tres párrafos breves.", c: "bg-tf2-cobre" },
  { k: "Criterios de control", t: "Al final, listá qué datos hay que verificar.", c: "bg-tf2-tinta" },
];

function Anatomia() {
  return (
    <>
    <Pieza i={0} x={-820} y={560} r={-3}>
      <Mano tam={40} flecha="der">
        el rol es una función, no una autoridad
      </Mano>
    </Pieza>
    <Pieza x={20} y={0} w={850} r={-1} d={60}>
      <Hoja className="px-0 pb-4 pt-5">
        <Rot className="px-8 pb-3">prompt · se arma por capas</Rot>
        <div className="grid gap-[10px]">
          {CAPAS.map((c, i) => (
            <Paso key={c.k} i={i} label={c.k}>
              <div className="flex items-stretch">
                <span className={cn("tf2-mono flex w-[230px] shrink-0 items-center px-5 py-[18px] text-[18px] font-semibold uppercase tracking-[0.12em] text-white", c.c)}>
                  {c.k}
                </span>
                <span className="tf2-mono flex flex-1 items-center border-b border-dashed border-tf2-linea px-5 text-[25px] leading-snug text-tf2-tinta">
                  <Tipeo texto={c.t} i={i} />
                </span>
              </div>
            </Paso>
          ))}
        </div>
      </Hoja>
    </Pieza>
    </>
  );
}

function Iteracion() {
  return (
    <>
      <Pieza i={0} label="Probar" x={0} y={30} w={500} r={-3}>
        <Hoja>
          <Sello tono="azul" tam={20}>
            v1 · probar
          </Sello>
          <p className="tf2-mono mt-5 text-[23px] leading-[1.6]">
            Se informa que a partir del lunes cambia el horario de mesa de entradas: <Circulo i={1}>de 7:30 a 14 h</Circulo>. Los escritos fuera de hora <Circulo i={1}>podrán presentarse en las dos primeras horas del día siguiente</Circulo>.
          </p>
        </Hoja>
      </Pieza>
      <Pieza i={1} label="Revisar" x={330} y={-10} r={-4} z={5}>
        <Mano tam={42}>¡inventó el horario!</Mano>
      </Pieza>
      <Pieza i={1} x={0} y={440} r={-2} z={5}>
        <Mano tam={38}>¿qué lunes? ¿y ese plazo de gracia de dónde sale?</Mano>
      </Pieza>
      <Pieza i={2} label="Ajustar" x={360} y={520} w={500} r={2}>
        <Hoja>
          <Sello tono="musgo" tam={20}>
            v2 · ajustar
          </Sello>
          <p className="tf2-mono mt-5 text-[23px] leading-[1.6]">Desde el lunes 3 de noviembre, mesa de entradas del Tribunal recibe escritos de 8 a 13.</p>
        </Hoja>
        <Mano className="mt-3 block pl-6" tono="azul" tam={36}>
          ajuste: «usá solo estos datos»
        </Mano>
      </Pieza>
      <Pieza i={2} x={0} y={0} z={1}>
        <Traza w={880} h={820} d="M220 500 C 230 580, 280 630, 350 640" demora={200} />
      </Pieza>
    </>
  );
}

const ETAPAS = [
  { n: "1", k: "Inventario", t: "qué piezas hay: recurso, resolución, descargo" },
  { n: "2", k: "Preguntas", t: "¿se contestó el traslado? ¿falta prueba?" },
  { n: "3", k: "Opciones", t: "pedir informe a Rentas o pasar a la vocalía" },
  { n: "4", k: "Comprobaciones", t: "fechas de notificación, plazos y montos" },
];

function Dividir() {
  return (
    <>
      <Pieza x={560} y={0} w={560} r={-1} d={60}>
        <Ficha rotulo="Objetivo" tam={28}>
          Preparar el informe de un expediente para el acuerdo
        </Ficha>
      </Pieza>
      <Pieza x={0} y={0} z={0}>
        <Traza w={1680} h={520} d="M840 150 L840 200 M190 200 L1490 200 M190 200 L190 240 M623 200 L623 240 M1057 200 L1057 240 M1490 200 L1490 240" demora={300} />
      </Pieza>
      {ETAPAS.map((e, i) => (
        <Pieza key={e.k} i={i} label={e.k} x={i * 433} y={250} w={380} r={i % 2 ? 1.5 : -1.5}>
          <Ficha rotulo={`Etapa ${e.n}`} tono={i % 2 ? "salvia" : "crema"} tam={24}>
            <span className="tf2-titular block text-[40px] leading-tight">{e.k}</span>
            {e.t}
          </Ficha>
        </Pieza>
      ))}
      <Pieza i={3} x={1180} y={-30} r={6}>
        <Sello tam={20}>No pedir el informe final</Sello>
      </Pieza>
    </>
  );
}

function Discutir() {
  const pasos = [
    { k: "Objeción", t: "No dice qué expediente consultaste ni cómo seguir el trámite." },
    { k: "Contraargumento", t: "Quizá no convenga dar una fecha estimada de resolución." },
    { k: "Pregunta pendiente", t: "¿Quien consulta es el contribuyente, su apoderado o un tercero?" },
  ];
  return (
    <>
      <Pieza x={20} y={0} w={840} d={60}>
        <Monitor rotulo="microdemo · adversarial">
          <div className="grid gap-3">
            <Burbuja de="persona">Este es mi borrador de respuesta al contribuyente. Objetalo.</Burbuja>
            {pasos.map((p, i) => (
              <Paso key={p.k} i={i} label={p.k}>
                <Burbuja de="ia">
                  <b className="tf2-rotulo mb-1 block text-[13px] text-tf2-rojo">{p.k}</b>
                  {p.t}
                </Burbuja>
              </Paso>
            ))}
          </div>
        </Monitor>
      </Pieza>
      <Pieza i={2} x={420} y={700} r={-5} z={5}>
        <Sello tam={26}>La IA no es el árbitro</Sello>
      </Pieza>
    </>
  );
}

// --- Bloque 3 --------------------------------------------------------------------------------------

function Reusar() {
  return (
    <>
      <Pieza i={0} label="Conversación aislada" x={0} y={30} w={430}>
        {[0, 1, 2].map((k) => (
          <div key={k} className="absolute w-[400px]" style={{ left: k * 18, top: k * 120, rotate: `${-4 + k * 3}deg` }}>
            <Hoja className="p-5">
              <p className="tf2-mono text-[20px] leading-snug text-tf2-grafito">Te explico de nuevo: trabajo en el Tribunal Fiscal, le escribo a contribuyentes, sin tecnicismos…</p>
            </Hoja>
          </div>
        ))}
        <Mano className="absolute left-[60px] top-[440px] rotate-[-3deg]" tam={44}>
          …otra vez, desde cero
        </Mano>
      </Pieza>
      <Pieza i={1} label="Plantilla reutilizable" x={430} y={170} w={450} r={2}>
        <Carpeta w={450} rotulo="Plantilla reutilizable">
          <div className="relative z-10 mt-4 grid gap-2 bg-tf2-crema p-5">
            {["Quién la usa y para qué", "A quién se le escribe", "Reglas que siempre valen", "Formato de salida"].map((t) => (
              <p key={t} className="tf2-mono text-[20px]">
                ▸ {t}
              </p>
            ))}
          </div>
        </Carpeta>
        <div className="absolute -bottom-[30px] right-[20px] rotate-[-6deg]">
          <Sello tono="musgo" tam={22}>
            Marco definido
          </Sello>
        </div>
      </Pieza>
    </>
  );
}

function Memoria() {
  const items = [
    {
      k: "Instrucciones",
      t: "reglas que se aplican siempre",
      o: (
        <div className="relative">
          <Clip style={{ left: 30, top: -26 }} />
          <Ficha rotulo="Instrucciones" tam={20}>
            trato de usted · lenguaje claro · marcar lo que falte
          </Ficha>
        </div>
      ),
    },
    {
      k: "Memorias",
      t: "lo que la herramienta guarda de conversaciones",
      o: (
        <div className="relative h-[230px]">
          {["cita «Expte. N.º/año»", "trabaja en la secretaría", "explicar las siglas (DGR)"].map((n, k) => (
            <span key={n} className="tf2-objeto tf2-mano absolute w-[250px] bg-[#efe0b5] px-4 py-2.5 text-[27px] leading-tight text-tf2-tinta" style={{ left: k * 40, top: k * 92, rotate: `${-4 + k * 4}deg` }}>
              {n}
            </span>
          ))}
        </div>
      ),
    },
    { k: "Proyectos", t: "un espacio con su propio contexto", o: <Carpeta w={330} rotulo="Proyecto · mesa de entradas" /> },
    {
      k: "Archivos",
      t: "documentos que consulta",
      o: (
        <div className="relative h-[230px]">
          {[0, 1, 2].map((k) => (
            <div key={k} className="absolute w-[260px]" style={{ left: k * 22, top: k * 16, rotate: `${-3 + k * 3}deg` }}>
              <Hoja className="grid gap-2.5 p-5">
                <Renglon w="70%" tono="ocre" />
                <Renglon />
                <Renglon w="85%" />
                <Renglon w="60%" />
              </Hoja>
            </div>
          ))}
        </div>
      ),
    },
  ];
  return (
    <>
      {items.map((it, i) => (
        <Pieza key={it.k} i={i} label={it.k} x={i * 425} y={0} w={380}>
          <div className="flex h-[300px] items-start">{it.o}</div>
          <p className="tf2-titular mt-4 text-[38px]">{it.k}</p>
          <p className="tf2-mono mt-1 text-[19px] text-tf2-grafito">{it.t}</p>
        </Pieza>
      ))}
      <Pieza i={3} x={1180} y={-40} r={4}>
        <Mano tam={36}>no prometen recordar todo</Mano>
      </Pieza>
    </>
  );
}

function Ecosistemas() {
  const cols = [
    { k: "ChatGPT", l: ["instrucciones personalizadas", "GPTs a medida", "proyectos con archivos"] },
    { k: "Claude", l: ["preferencias y estilos", "proyectos con instrucciones", "archivos de referencia"] },
    { k: "Gemini", l: ["instrucciones guardadas", "Gems a medida", "NotebookLM para reunir fuentes"] },
  ];
  return (
    <>
      {cols.map((c, i) => (
        <Pieza key={c.k} i={i} label={c.k} x={i * 560} y={0} w={520} r={i === 1 ? 1 : -1}>
          <Monitor pie={false} rotulo="ecosistema">
            <p className="tf2-titular text-[48px] text-tf2-tinta">{c.k}</p>
            <ul className="mt-3 grid gap-1.5 text-[22px]">
              {c.l.map((x) => (
                <li key={x}>▸ {x}</li>
              ))}
            </ul>
          </Monitor>
        </Pieza>
      ))}
      <Pieza i={2} x={430} y={400} r={-2}>
        <Sello tono="azul" tam={22}>
          Varía según plan y configuración · comprobar el día de uso
        </Sello>
      </Pieza>
    </>
  );
}

// --- Bloque 4 --------------------------------------------------------------------------------------

function FueraExpediente() {
  const fuentes = [
    { k: "Código Tributario provincial", x: 0, y: 0, r: -5 },
    { k: "Resoluciones generales de Rentas", x: 560, y: 20, r: 4 },
    { k: "Glosario tributario", x: 10, y: 560, r: 3 },
    { k: "Sentencias publicadas", x: 540, y: 600, r: -4 },
  ];
  return (
    <>
      <Pieza x={230} y={210} w={420} d={60}>
        <Carpeta w={420} rotulo="Expediente">
          <div className="relative z-10 mt-10 flex justify-center">
            <Sello tam={28}>Reservado</Sello>
          </div>
        </Carpeta>
      </Pieza>
      {fuentes.map((f, i) => (
        <Pieza key={f.k} i={i} label={f.k} x={f.x} y={f.y} w={320} r={f.r}>
          <Ficha rotulo="Fuente pública" tono={i % 2 ? "salvia" : "hoja"} tam={26}>
            {f.k}
          </Ficha>
        </Pieza>
      ))}
    </>
  );
}

/** Dato tachado con barra negra (identificador directo). */
const BarraNegra = ({ w }: { w: number }) => <span className="inline-block h-[0.9em] translate-y-[0.12em] bg-tf2-tinta" style={{ width: w }} />;

function Minimizar() {
  return (
    <>
      <Pieza x={0} y={40} w={800} r={-1} d={60}>
        <Hoja doblez className="pr-14">
          <Rot>escrito · ejemplo ficticio</Rot>
          <p className="tf2-mono mt-5 text-[25px] leading-[1.75]">
            El contribuyente <BarraNegra w={190} />, CUIT <BarraNegra w={170} />, con domicilio en <BarraNegra w={210} />, titular de <Circulo i={1}>la única distribuidora de gas de la villa</Circulo>, socio de <Circulo i={1}>quien fue concejal en 2019</Circulo>, recurre <Circulo i={1}>la clausura que salió en el diario en mayo</Circulo>.
          </p>
        </Hoja>
      </Pieza>
      <Pieza i={0} label="Datos directos" x={40} y={560} r={-3}>
        <Etiqueta>directos: nombre, CUIT, domicilio · tachados</Etiqueta>
      </Pieza>
      <Pieza i={1} label="Datos indirectos" x={420} y={650} r={3}>
        <Mano tam={44}>esto también identifica</Mano>
      </Pieza>
      <Pieza i={1} x={640} y={420} r={-8} z={5}>
        <Sello tam={26}>¿Anónimo?</Sello>
      </Pieza>
    </>
  );
}

function Fuente() {
  return (
    <>
      <Pieza x={0} y={20} w={600} r={-1.5} d={60}>
        <Monitor rotulo="respuesta del chatbot">
          <Burbuja de="ia">Según el art. 87 del Código Tributario, el plazo para apelar ante el Tribunal es de 15 días hábiles.</Burbuja>
        </Monitor>
        <span className="tf2-rotulo absolute -bottom-[34px] left-[20px] text-[12px] text-tf2-gris">ejemplo ficticio</span>
      </Pieza>
      <Pieza i={0} label="Respuesta creíble" x={420} y={60} r={-8} z={5}>
        <Sello tam={24}>Sin cotejar</Sello>
      </Pieza>
      <Pieza i={1} label="Fuente original" x={420} y={380} w={460} r={2}>
        <Hoja>
          <Rot>fuente original · boletín oficial</Rot>
          <div className="mt-4 grid gap-3">
            <Renglon w="40%" tono="ocre" />
            <Renglon />
            <Renglon w="92%" />
            <Renglon w="76%" />
            <Renglon w="88%" />
          </div>
          <p className="tf2-mono mt-5 text-[18px] text-tf2-grafito">origen exacto · fecha · vigencia</p>
        </Hoja>
        <div className="absolute -bottom-[30px] left-[30px] rotate-[-4deg]">
          <Sello tono="musgo" tam={22}>
            Cotejado en la fuente
          </Sello>
        </div>
      </Pieza>
      <Pieza i={1} x={200} y={360} z={6}>
        <Lupa w={240} />
      </Pieza>
    </>
  );
}

const CONTROLES = [
  { k: "Fechas", dato: "notificado el 3/11/2026", origen: "cédula", ubic: "expte. ficticio, fs. 12", ok: true },
  { k: "Montos", dato: "ajuste de $ 1.250.000", origen: "resolución de Rentas", ubic: "fs. 40", ok: false },
  { k: "Nombres", dato: "Vocalía N.º 2", origen: "organigrama", ubic: "sitio oficial", ok: true },
  { k: "Normas", dato: "art. [N] del Código", origen: "respuesta de la IA", ubic: "sin ubicar", ok: false },
  { k: "Citas", dato: "«…» de una sentencia", origen: "respuesta de la IA", ubic: "sin ubicar", ok: false },
  { k: "Cálculos", dato: "intereses $ 84.300", origen: "cálculo de la IA", ubic: "rehacer en planilla", ok: false },
];

function Verificar() {
  const grid = "grid grid-cols-[200px_1fr_1fr_1fr_250px] items-center gap-6 px-8";
  return (
    <Pieza x={0} y={0} w={1680} d={60}>
      <Hoja className="px-0 py-4">
        <div className={cn(grid, "tf2-rotulo pb-2 text-[13px] text-tf2-gris")}>
          <span>Control</span>
          <span>Dato informado</span>
          <span>Origen</span>
          <span>Ubicación</span>
          <span>Estado</span>
        </div>
        {CONTROLES.map((c, i) => (
          <Paso key={c.k} i={i} label={c.k}>
            <div className={cn(grid, "border-t border-tf2-linea py-[11px] text-[22px]")}>
              <span className="tf2-titular text-[30px]">{c.k}</span>
              <span className="tf2-mono">{c.dato}</span>
              <span className="tf2-mono text-tf2-grafito">{c.origen}</span>
              <span className="tf2-mono text-tf2-grafito">{c.ubic}</span>
              <span>
                <Sello tono={c.ok ? "musgo" : "rojo"} tam={17} d={150}>
                  {c.ok ? "Verificado" : "Pendiente"}
                </Sello>
              </span>
            </div>
          </Paso>
        ))}
      </Hoja>
    </Pieza>
  );
}

function Historia() {
  const filas = [
    { k: "Prompt", v: "«Actuá como asistente de la secretaría del Tribunal…»", s: "23 OCT" },
    { k: "Versión", v: "v3 (antes: v1 y v2)", s: "23 OCT" },
    { k: "Fecha", v: "23/10/2026 · 10:42", s: "23 OCT" },
    { k: "Fuentes", v: "listado ficticio de expedientes · sitio oficial", s: "24 OCT" },
    { k: "Correcciones", v: "se quitó un plazo inventado", s: "24 OCT" },
  ];
  return (
    <Pieza x={20} y={10} w={840} r={-1.5} d={60}>
      <Cinta x="44%" y={-14} />
      <div className="tf2-objeto rounded-[3px] bg-tf2-crema p-7">
        <div className="flex items-baseline justify-between border-b-2 border-tf2-rojo/60 pb-3">
          <p className="tf2-titular text-[38px]">Registro de la interacción</p>
          <Rot>ficha n.º 0042 · ficticia</Rot>
        </div>
        {filas.map((f, i) => (
          <Paso key={f.k} i={i} label={f.k}>
            <div className="grid grid-cols-[190px_1fr_120px] items-center gap-4 border-b border-tf2-azul/20 py-3">
              <span className="tf2-rotulo text-[14px] text-tf2-rojo">{f.k}</span>
              <span className="tf2-mono text-[22px]">{f.v}</span>
              <span className="text-right">
                <Sello tono="azul" tam={16} d={120}>
                  {f.s}
                </Sello>
              </span>
            </div>
          </Paso>
        ))}
        <div className="tf2-mono mt-4 grid grid-cols-2 gap-4 text-[18px] text-tf2-grafito">
          <span>Usuario revisor: [función]</span>
          <span>Herramienta: chatbot · perfil A</span>
        </div>
      </div>
    </Pieza>
  );
}

// --- Bloque 5 --------------------------------------------------------------------------------------

function Formato() {
  return (
    <>
      <Pieza x={0} y={0} w={760} r={-1.5} d={60}>
        <Hoja className="grid gap-[14px]">
          <Rot>párrafo</Rot>
          {[100, 96, 99, 92, 98, 95, 88, 97, 60].map((w, k) => (
            <Renglon key={k} w={`${w}%`} />
          ))}
        </Hoja>
        <Mano className="mt-4 block pl-6" tam={38}>
          ¿dónde está la duda? ¿de dónde sale cada dato?
        </Mano>
      </Pieza>
      <Pieza i={0} label="Tabla con fuentes y dudas" x={830} y={0} w={850} r={1}>
        <Hoja className="px-0">
          <div className="tf2-rotulo grid grid-cols-[1.3fr_1fr_1fr] gap-4 px-7 pb-2 text-[13px] text-tf2-gris">
            <span>Dato</span>
            <span>Fuente</span>
            <span>Duda</span>
          </div>
          {[
            ["Traslado a Rentas", "providencia de fs. 20", "¿se notificó?"],
            ["Vencimiento del plazo", "cálculo propio", "¿hay días inhábiles?"],
            ["Monto recurrido", "resolución (ficticia)", "¿incluye intereses?"],
          ].map(([a, b, c]) => (
            <div key={a} className="tf2-mono grid grid-cols-[1.3fr_1fr_1fr] gap-4 border-t border-tf2-linea px-7 py-3 text-[21px]">
              <span>{a}</span>
              <span className="text-tf2-grafito">{b}</span>
              <span className="text-tf2-rojo">{c}</span>
            </div>
          ))}
        </Hoja>
        <div className="absolute -bottom-[36px] right-[30px] rotate-[-5deg]">
          <Sello tono="musgo" tam={22}>
            Revisable
          </Sello>
        </div>
      </Pieza>
    </>
  );
}

/** Campo editable de una plantilla. */
const Hueco = ({ children }: { children: ReactNode }) => <span className="tf2-hueco">{children}</span>;

function Plantilla() {
  return (
    <>
      <Pieza i={0} label="Plantilla de prompt" x={0} y={0} w={800} r={-1.5}>
        <Ficha rotulo="Plantilla de prompt · campos editables" tono="hoja" tam={23}>
          Actuá como asistente de <Hueco>rol</Hueco> para ayudarme a <Hueco>tarea</Hueco> con el objetivo <Hueco>propósito</Hueco>. Trabajá solo con <Hueco>fuentes</Hueco>. Respondé en <Hueco>formato</Hueco>.
        </Ficha>
      </Pieza>
      <Pieza i={1} label="Plantilla de salida" x={880} y={0} w={800} r={1.5}>
        <Hoja>
          <Rot>plantilla de salida · documento</Rot>
          <div className="mt-4 grid gap-3">
            <p className="tf2-mono text-[22px]">Título</p>
            <Renglon w="45%" tono="ocre" />
            <p className="tf2-mono pt-2 text-[22px]">Resumen en tres líneas</p>
            <Renglon />
            <Renglon w="80%" />
            <p className="tf2-mono pt-2 text-[22px]">Dato · fuente · duda</p>
            <p className="tf2-mono pt-2 text-[22px] text-tf2-rojo">A verificar antes de usar</p>
          </div>
        </Hoja>
      </Pieza>
    </>
  );
}

function Estilo() {
  return (
    <>
      <Pieza i={0} label="Ejemplos propios" x={0} y={40} w={360}>
        {[0, 1, 2].map((k) => (
          <div key={k} className="absolute w-[320px]" style={{ left: k * 20, top: k * 70, rotate: `${-5 + k * 4}deg` }}>
            <Hoja className="grid gap-2.5 p-5">
              <Rot>nota propia {k + 1}</Rot>
              <Renglon />
              <Renglon w="88%" />
              <Renglon w="70%" />
            </Hoja>
          </div>
        ))}
        <Mano className="absolute left-[40px] top-[350px]" tam={40}>
          tus notas como ejemplo
        </Mano>
      </Pieza>
      <Pieza i={1} label="Borrador con tu tono" x={470} y={150} w={400} r={2}>
        <Maquina
          w={400}
          hoja={
            <div className="grid gap-2.5">
              <Rot>borrador · tono propio</Rot>
              <Renglon />
              <Renglon w="90%" />
              <Renglon w="64%" />
            </div>
          }
        />
      </Pieza>
      <Pieza i={1} x={0} y={0} z={0}>
        <Traza w={880} h={820} d="M330 300 C 400 260, 440 260, 500 300" demora={200} />
      </Pieza>
      <Pieza i={2} label="Consentimiento y autoría" x={20} y={560} w={840}>
        <div className="flex flex-wrap gap-4">
          <Etiqueta>con consentimiento</Etiqueta>
          <Etiqueta>revisado por vos</Etiqueta>
          <Etiqueta>la autoría es tuya</Etiqueta>
        </div>
        <div className="mt-6 rotate-[-2deg]">
          <Sello tam={20}>No hacerse pasar por otra persona</Sello>
        </div>
      </Pieza>
    </>
  );
}

// --- Bloque 6 --------------------------------------------------------------------------------------

const ESTACIONES = [
  { k: "Objetivos", t: "qué y para qué" },
  { k: "Etapas", t: "en qué pasos" },
  { k: "Contexto", t: "qué necesita saber" },
  { k: "Fuentes", t: "con qué trabaja" },
  { k: "Formatos", t: "cómo lo entrega" },
  { k: "Controles", t: "cómo se comprueba" },
];

function Proceso() {
  return (
    <>
      <Pieza x={0} y={0} z={0}>
        <Traza w={1680} h={520} d="M120 250 L 1560 250" demora={200} />
      </Pieza>
      {ESTACIONES.map((e, i) => (
        <Pieza key={e.k} i={i} label={e.k} x={i * 284} y={i % 2 ? 230 : 40} w={250} r={i % 2 ? 2 : -2}>
          <Ficha rotulo={`0${i + 1}`} tono={["crema", "salvia", "hoja", "azul", "crema", "salvia"][i] as "crema"} tam={20}>
            <span className="tf2-titular block text-[34px] leading-tight">{e.k}</span>
            {e.t}
          </Ficha>
        </Pieza>
      ))}
    </>
  );
}

function Futuro() {
  return (
    <>
      <Pieza x={20} y={20} w={600} r={-2} d={60}>
        <Cinta x="38%" y={-14} />
        <Ficha rotulo="Instrucción · versión final" tam={25}>
          Serví agua natural, hasta la mitad, en el vaso de la mesa, para quien está hablando. Si falta algo, preguntá antes.
        </Ficha>
      </Pieza>
      <Pieza x={640} y={60} d={300}>
        <Vaso w={190} agua={0.5} />
      </Pieza>
      <Pieza i={0} label="Instrucciones" x={40} y={350} r={-4}>
        <Sello tam={24}>Instrucción completa</Sello>
      </Pieza>
      <Pieza i={1} label="Controles" x={340} y={410} w={480} r={2}>
        <Etiqueta tono="crema">controles: ¿era ese vaso? ¿la cantidad? ¿se derramó?</Etiqueta>
      </Pieza>
      <Pieza i={2} label="Criterio humano" x={60} y={560} r={-3}>
        <Sello tono="musgo" tam={28}>
          Criterio humano
        </Sello>
      </Pieza>
      <Pieza i={2} x={420} y={620} w={440} r={1.5}>
        <Ficha rotulo="Próxima charla" tono="azul" tam={24}>
          Análisis jurídico tributario
        </Ficha>
      </Pieza>
    </>
  );
}

// --- Curvas (texto circular) ----------------------------------------------------------------------

/** Objeto del centro de cada curva (el texto circular lo dibuja el deck). */
export function CentroCurva({ visual }: { visual: Tf2Visual }) {
  switch (visual) {
    case "decidir":
      return (
        <div className="relative flex size-[360px] items-center justify-center">
          <svg viewBox="0 0 360 360" className="absolute inset-0" aria-hidden>
            {[-50, -25, 0, 25, 50].map((a) => (
              <path key={a} d={`M180 330 L ${180 + Math.sin((a * Math.PI) / 180) * 160} ${330 - Math.cos((a * Math.PI) / 180) * 260}`} stroke="var(--color-tf2-gris)" strokeWidth="2" strokeDasharray="4 8" />
            ))}
          </svg>
          <Mano className="absolute top-[18px]" tam={34} tono="azul">
            alternativas
          </Mano>
          <Sello tono="tinta" tam={26} redondo className="relative bg-tf2-papel px-7 py-6 text-center leading-snug">
            Elige y
            <br />
            comprueba
            <br />
            una persona
          </Sello>
        </div>
      );
    case "biblioteca":
      return (
        <div className="flex items-end gap-3">
          <Lomo titulo="Normas" tono="#4a6378" alto={330} />
          <Lomo titulo="Doctrina" tono="#4f5e4b" alto={360} />
          <Lomo titulo="Jurisprudencia" tono="#ad422c" alto={380} ancho={98} />
          <div className="rotate-[9deg]">
            <Lomo titulo="Precedentes" tono="#b5832f" alto={340} />
          </div>
        </div>
      );
    case "autorrevision":
      return (
        <div className="relative flex w-[400px] flex-col items-center">
          <div className="w-[330px]">
            <Monitor pie={false} rotulo="autocorrección">
              <div className="grid gap-2 text-[18px]">
                <Burbuja de="persona">¿Está bien?</Burbuja>
                <Burbuja de="ia">Sí, está bien.</Burbuja>
              </div>
            </Monitor>
          </div>
          <div className="mt-3 flex items-center gap-4">
            <Lupa w={110} />
            <Mano tam={34}>cotejo independiente</Mano>
          </div>
        </div>
      );
    case "parecido":
      return (
        <div className="flex w-[420px] flex-col items-center">
          <div className="flex items-end gap-4">
            <Maquina w={190} />
            <div className="w-[190px]">
              <Monitor pie={false} rotulo="1950">
                <span className="text-[18px]">¿máquina o persona?</span>
              </Monitor>
            </div>
          </div>
          <p className="tf2-mono mt-5 text-center text-[17px] text-tf2-grafito">A. M. Turing (1950): «¿Pueden pensar las máquinas?» · un disparador, no una prueba</p>
        </div>
      );
    default:
      return null;
  }
}

/** La composición de una placa (salvo actividades y curvas, que arma el deck). */
export function Visual({ visual }: { visual: Tf2Visual }) {
  switch (visual) {
    case "robot":
      return <Robot />;
    case "noRobot":
      return <NoRobot />;
    case "contexto":
      return <Contexto />;
    case "instruir":
      return <Instruir />;
    case "anatomia":
      return <Anatomia />;
    case "iteracion":
      return <Iteracion />;
    case "dividir":
      return <Dividir />;
    case "discutir":
      return <Discutir />;
    case "reusar":
      return <Reusar />;
    case "memoria":
      return <Memoria />;
    case "ecosistemas":
      return <Ecosistemas />;
    case "fueraExpediente":
      return <FueraExpediente />;
    case "minimizar":
      return <Minimizar />;
    case "fuente":
      return <Fuente />;
    case "verificar":
      return <Verificar />;
    case "historia":
      return <Historia />;
    case "formato":
      return <Formato />;
    case "plantilla":
      return <Plantilla />;
    case "estilo":
      return <Estilo />;
    case "proceso":
      return <Proceso />;
    case "futuro":
      return <Futuro />;
    default:
      return null;
  }
}
