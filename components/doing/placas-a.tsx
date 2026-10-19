"use client";

// Cuerpos de las placas 1 a 12 de /doing (bloques I a III). Cada parte que
// aparece de a una con → va envuelta en <Unidad i={n}> (revelado paso a paso);
// la cantidad de partes está en lib/doing-clase.ts (campo `pasos`).

import { Unidad, useRevelado } from "@/components/tribunal/revelado";
import { EnlaceChip } from "@/components/doing/marco";
import {
  C,
  ComprobanteVisual,
  Flecha,
  GlifoBalanza,
  GlifoPersona,
  HojaSimulada,
  InterfazIA,
  Maquina,
  retraso,
  Sello,
  TresComprobantes,
} from "@/components/doing/piezas";
import { COMPROBANTES, pesos } from "@/lib/doing-caso";
import type { DgPlaca } from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

type P = { placa: DgPlaca };

// 01 · La IA escribe. ¿Quién decide? — la máquina y la interfaz, dos momentos de un mismo oficio
function Decide(_: P) {
  const antes = ["Seleccionar la información", "Interpretar la situación", "Decidir una posición", "Definir qué se pide"];
  return (
    <div className="grid flex-1 grid-cols-[1fr_auto_1fr_0.95fr] items-center gap-6">
      <figure className="tf-sube" style={retraso(0.1)}>
        <Maquina className="mx-auto w-[88%]" />
        <figcaption className="dg-maquina mt-3 text-center text-[1rem] text-dg-pizarra">Ayer · la máquina de escribir</figcaption>
      </figure>
      <Flecha className="w-16" color={C.lacre} animada />
      <figure className="tf-sube" style={retraso(0.25)}>
        <InterfazIA
          className="h-[17rem]"
          pedido="Redactá un escrito que conteste el planteo."
          respuesta={
            <span className="dg-maquina text-[0.85rem]">
              SEÑOR JUEZ: … vengo a contestar el traslado conferido y solicito se tenga por acreditado…
            </span>
          }
        />
        <figcaption className="dg-maquina mt-3 text-center text-[1rem] text-dg-pizarra">Hoy · la interfaz de IA</figcaption>
      </figure>
      <div className="tf-sube flex h-full flex-col justify-between gap-5" style={retraso(0.4)}>
        <div className="rounded-2xl border border-dg-linea bg-dg-hoja p-5">
          <p className="dg-rotulo text-[0.62rem] text-dg-lacre">Lo que pasa antes del texto</p>
          <ul className="mt-3 grid gap-2.5">
            {antes.map((a, i) => (
              <li key={a} className="flex items-center gap-3 text-[1.1rem] text-dg-tinta">
                <span className="dg-maquina flex size-7 shrink-0 items-center justify-center rounded-full border border-dg-tinta/30 text-[0.85rem]">{i + 1}</span>
                {a}
              </li>
            ))}
          </ul>
          <p className="dg-serif mt-4 text-[1.35rem] italic leading-snug text-dg-verde">¿Quién toma estas decisiones cuando el texto sale solo?</p>
        </div>
        <EnlaceChip />
      </div>
    </div>
  );
}

// 02 · Un escrito impecable. Un problema invisible.
function Impecable(_: P) {
  const { visibles } = useRevelado();
  const conectar = visibles > 1;
  return (
    <div className="grid flex-1 grid-cols-[1.2fr_auto_0.8fr] items-center gap-6">
      <div className="dg-hoja rounded-xl border border-dg-linea px-8 py-6">
        <p className="dg-maquina text-[0.95rem] font-bold text-dg-tinta">CONTESTA TRASLADO. ACREDITA PAGO TOTAL.</p>
        <p className="dg-maquina mt-3 text-[0.95rem] leading-relaxed text-dg-pizarra">
          Señor Juez: Posada Los Alerces S.R.L., por intermedio de su letrada patrocinante, contesta el traslado conferido y dice:
        </p>
        <Unidad i={0} label="La afirmación que suena impecable" className="mt-3">
          <p className="dg-maquina text-[1.05rem] leading-relaxed text-dg-tinta">
            I. Las tres transferencias acompañadas <span className={cn(visibles > 0 && "dg-marca font-bold")}>acreditan de manera fehaciente e indubitable la cancelación total de la obligación</span>, que{" "}
            <span className={cn(visibles > 0 && "dg-marca")}>asciende exactamente a $ 1.500.000</span>.
          </p>
        </Unidad>
        <div className="mt-4 grid gap-2 opacity-60">
          <span className="dg-renglon w-full" />
          <span className="dg-renglon w-[88%]" />
          <span className="dg-renglon w-[70%]" />
        </div>
      </div>
      <Unidad i={1} label="Lo que dice el comprobante" className="flex flex-col items-center gap-2">
        <Flecha className="w-20" color={C.lacre} animada />
        <span className="dg-maquina max-w-[9rem] text-center text-[0.9rem] text-dg-lacre">¿de dónde sale?</span>
      </Unidad>
      <div className="grid gap-3">
        {COMPROBANTES.map((c) => (
          <ComprobanteVisual key={c.n} c={c} compacto marcarReferencia={conectar} className={cn(conectar && c.n === 3 && "ring-2 ring-dg-lacre/50")} />
        ))}
        <Unidad i={1}>
          <p className="text-[1.05rem] leading-snug text-dg-tinta">
            El comprobante 3 menciona <b className="text-dg-lacre">otra factura</b>. Y Boreal reclama {pesos(1_000_000)}, no {pesos(1_500_000)}.
          </p>
        </Unidad>
      </div>
    </div>
  );
}

// 03 · No todo se automatiza igual — cuatro estaciones de una progresión
function Estaciones(_: P) {
  const est = [
    { n: "Asistencia puntual", q: "Corregir o mejorar un fragmento", ej: "Pulir el párrafo sobre los comprobantes", aut: 1 },
    { n: "Redacción por secciones", q: "Desarrollar apartados determinados", ej: "Escribir solo «lo que acreditan los comprobantes»", aut: 2 },
    { n: "Borrador completo", q: "Documento integral desde instrucciones y antecedentes", ej: "La respuesta entera a Boreal, con la ficha y los documentos", aut: 3 },
    { n: "Automatización documental", q: "Procedimientos configurados para escritos repetitivos", ej: "El acompañamiento documental desde una plantilla y datos", aut: 4 },
  ];
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="relative grid grid-cols-4 gap-5">
        <div className="absolute left-[6%] right-[6%] top-[1.6rem] border-t-[3px] border-dashed border-dg-linea" />
        {est.map((e, i) => (
          <Unidad key={e.n} i={i} label={e.n} className="relative flex flex-col">
            <span className="dg-maquina relative z-10 mx-auto flex size-[3.2rem] items-center justify-center rounded-full border-2 border-dg-verde bg-dg-hoja text-[1.3rem] font-bold text-dg-verde">
              {i + 1}
            </span>
            <div className="mt-4 flex flex-1 flex-col rounded-2xl border border-dg-linea bg-dg-hoja p-5">
              <p className="dg-serif text-[1.75rem] leading-tight text-dg-tinta">{e.n}</p>
              <p className="mt-1.5 text-[1rem] leading-snug text-dg-pizarra">{e.q}</p>
              <p className="dg-maquina mt-3 border-l-2 border-dg-ocre pl-3 text-[0.92rem] leading-snug text-dg-tinta">{e.ej}</p>
              <div className="mt-auto flex items-center gap-1.5 pt-4" aria-label={`Autonomía ${e.aut} de 4`}>
                <span className="mr-1 text-[0.75rem] text-dg-niebla">autonomía</span>
                {[1, 2, 3, 4].map((k) => (
                  <span key={k} className={cn("h-2 flex-1 rounded-full", k <= e.aut ? "bg-dg-lacre" : "bg-dg-linea")} />
                ))}
              </div>
            </div>
          </Unidad>
        ))}
      </div>
      <Unidad i={3} className="grid grid-cols-2 gap-5">
        <p className="rounded-xl bg-dg-azul-claro px-5 py-3 text-[1.1rem] leading-snug text-dg-tinta">
          ⚙️ Una plantilla tradicional puede funcionar <b>sin IA generativa</b>: sustitución de campos.
        </p>
        <p className="rounded-xl bg-dg-salvia-claro px-5 py-3 text-[1.1rem] leading-snug text-dg-tinta">
          🧩 Un mismo escrito puede <b>combinar grados</b>: carátula por plantilla, descripción con IA, argumento asistido.
        </p>
      </Unidad>
    </div>
  );
}

// 04 · La tarea define la herramienta (GIRO) — la balanza: pesa la decisión, no la extensión
function GiroTarea(_: P) {
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.1fr] items-center gap-12">
      <div className="tf-sube relative mx-auto h-[24rem] w-full max-w-[34rem]" style={retraso(0.15)}>
        <svg viewBox="0 0 400 280" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M200 40 V250 M150 260 H250" stroke={C.tinta} strokeWidth="5" strokeLinecap="round" />
          <circle cx="200" cy="36" r="8" fill={C.tinta} />
          <g transform="rotate(-12 200 60)">
            <path d="M60 60 H340" stroke={C.tinta} strokeWidth="5" strokeLinecap="round" />
            <path d="M80 60 L40 140 M80 60 L120 140 M320 60 L280 140 M320 60 L360 140" stroke={C.niebla} strokeWidth="1.5" />
            <path d="M30 140 H130 Q80 160 30 140z M270 140 H370 Q320 160 270 140z" fill={C.pizarra} />
          </g>
        </svg>
        {/* platillo izquierdo (más bajo): una página, una decisión */}
        <div className="absolute left-[4%] top-[39%] w-[25%]">
          <HojaSimulada filas={4} titulo={false} className="!px-2.5 !py-2.5">
            <span className="dg-marca mt-2 block text-[0.62rem] font-bold leading-tight text-dg-lacre">¿Se canceló la factura 418?</span>
          </HojaSimulada>
        </div>
        {/* platillo derecho (más alto): muchas páginas repetitivas */}
        <div className="absolute right-[5%] top-[1%] w-[24%]">
          {[0, 1, 2, 3, 4].map((k) => (
            <div key={k} className="dg-hoja absolute h-[5.6rem] w-full rounded border border-dg-linea" style={{ top: `${k * 0.55}rem`, left: `${k * 0.3}rem` }} />
          ))}
        </div>
      </div>
      <div className="grid gap-5">
        <div className="tf-sube rounded-2xl border-l-4 border-dg-lacre bg-dg-hoja px-6 py-4" style={retraso(0.25)}>
          <p className="dg-maquina text-[0.85rem] text-dg-lacre">1 página</p>
          <p className="dg-serif text-[1.9rem] leading-tight text-dg-tinta">Un escrito breve puede contener una decisión decisiva.</p>
        </div>
        <div className="tf-sube rounded-2xl border-l-4 border-dg-azul bg-dg-hoja px-6 py-4" style={retraso(0.35)}>
          <p className="dg-maquina text-[0.85rem] text-dg-azul">40 páginas</p>
          <p className="dg-serif text-[1.9rem] leading-tight text-dg-tinta">Un documento extenso puede ser repetitivo y estable.</p>
        </div>
        <p className="tf-sube flex items-center gap-3 text-[1.2rem] text-dg-pizarra" style={retraso(0.45)}>
          <GlifoBalanza className="size-9 shrink-0 text-dg-verde" />
          Acompañar tres documentos no es lo mismo que sostener una interpretación sobre ellos.
        </p>
      </div>
    </div>
  );
}

// 05 · Human in the loop no es firmar al final
const ETAPAS = ["Encargo", "Antecedentes", "Esquema", "Borrador", "Aprobación"];

function Loop(_: P) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-7">
      <Unidad i={0} label="Solo una aprobación final" className="rounded-2xl border border-dg-linea bg-dg-hoja/70 p-5">
        <p className="dg-rotulo text-[0.66rem] text-dg-lacre">Firmar al final</p>
        <div className="mt-3 flex items-center gap-2">
          {ETAPAS.map((e, i) => (
            <div key={e} className="contents">
              {i > 0 && <Flecha className="w-8 shrink-0" />}
              <div className={cn("flex-1 rounded-xl px-3 py-3 text-center text-[1.05rem]", i === 4 ? "border-2 border-dg-lacre bg-dg-lacre-claro text-dg-tinta" : "bg-dg-linea/50 text-dg-niebla")}>
                {i === 4 && <GlifoPersona className="mx-auto mb-1 size-7 text-dg-lacre" />}
                {e}
                {i < 4 && <span className="dg-maquina mt-1 block text-[0.75rem]">automático</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[1.05rem] text-dg-pizarra">Cuando llega la firma, todo ya está decidido. Revisar 40 páginas generadas en un minuto no es controlar.</p>
      </Unidad>
      <Unidad i={1} label="Controles intermedios" className="rounded-2xl border-2 border-dg-verde/50 bg-dg-hoja p-5">
        <p className="dg-rotulo text-[0.66rem] text-dg-verde">Intervenir mientras se construye</p>
        <div className="mt-3 flex items-center gap-2">
          {ETAPAS.map((e, i) => (
            <div key={e} className="contents">
              {i > 0 && <Flecha className="w-8 shrink-0" color={C.verde} />}
              <div className="flex-1 rounded-xl border border-dg-verde/40 bg-dg-salvia-claro px-3 py-3 text-center text-[1.05rem] text-dg-tinta">
                <GlifoPersona className="mx-auto mb-1 size-7 text-dg-verde" />
                {e}
                <span className="dg-maquina mt-1 block text-[0.75rem] text-dg-verde">{["define", "selecciona", "aprueba", "corrige", "decide"][i]}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-[1.05rem] text-dg-pizarra">Un control efectivo exige entender qué se revisa y poder modificarlo de verdad.</p>
      </Unidad>
    </div>
  );
}

// 06 · Antes de redactar, hay que decidir — dos caminos desde los mismos comprobantes
function Decidir(_: P) {
  return (
    <div className="grid flex-1 grid-cols-[0.75fr_auto_1.25fr] items-center gap-6">
      <div>
        <TresComprobantes className="h-[17rem]" />
        <p className="dg-maquina mt-3 text-center text-[0.95rem] text-dg-pizarra">Los mismos tres comprobantes</p>
      </div>
      <div className="flex flex-col gap-24">
        <Flecha className="w-20 -rotate-12" color={C.verde} />
        <Flecha className="w-20 rotate-12" color={C.lacre} />
      </div>
      <div className="grid gap-5">
        <Unidad i={0} label="Camino A: lo que los documentos permiten sostener" className="rounded-2xl border-2 border-dg-verde/60 bg-dg-hoja px-6 py-4">
          <p className="dg-rotulo text-[0.62rem] text-dg-verde">Camino A · alcance prudente</p>
          <p className="dg-serif mt-2 text-[1.6rem] leading-snug text-dg-tinta">
            «Las transferencias, por {pesos(1_500_000)}, fueron recibidas por Boreal; su imputación está controvertida.»
          </p>
          <p className="mt-2 text-[0.98rem] text-dg-verde">Respaldo: comprobantes + reconocimiento de la actora.</p>
        </Unidad>
        <Unidad i={1} label="Camino B: una afirmación de mayor alcance" className="rounded-2xl border-2 border-dg-lacre/60 bg-dg-hoja px-6 py-4">
          <p className="dg-rotulo text-[0.62rem] text-dg-lacre">Camino B · mayor alcance</p>
          <p className="dg-serif mt-2 text-[1.6rem] leading-snug text-dg-tinta">«La factura 418 está totalmente cancelada.»</p>
          <p className="mt-2 text-[0.98rem] text-dg-lacre">Respaldo: ¿? Hay que justificar a qué se aplicó cada pago.</p>
        </Unidad>
        <div className="flex flex-wrap gap-2.5">
          {["Objeto: ¿qué contestamos?", "Posición: ¿qué sostenemos?", "Límites: ¿qué no afirmamos?"].map((t) => (
            <span key={t} className="dg-maquina rounded-full border border-dg-tinta/25 bg-dg-hoja px-4 py-1.5 text-[0.95rem] text-dg-tinta">
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// 07 · Un dato no es una conclusión — tres capas
function Capas(_: P) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4">
      <Unidad i={0} label="Alegación" className="grid grid-cols-[13rem_1fr] items-center gap-6 rounded-2xl border border-dg-verde/40 bg-dg-salvia-claro/70 px-6 py-4">
        <div>
          <p className="dg-rotulo text-[0.66rem] text-dg-verde">Capa 1 · Alegación</p>
          <p className="mt-1 text-[0.95rem] text-dg-pizarra">Lo que una parte sostiene</p>
        </div>
        <p className="w-fit rounded-2xl rounded-bl-md bg-white px-5 py-3 text-[1.4rem] text-dg-tinta shadow-sm">«Les pagamos TODO: son tres transferencias de 500.» 💬</p>
      </Unidad>
      <Unidad i={1} label="Documento" className="grid grid-cols-[13rem_1fr] items-center gap-6 rounded-2xl border border-dg-azul/40 bg-dg-azul-claro/70 px-6 py-4">
        <div>
          <p className="dg-rotulo text-[0.66rem] text-dg-azul">Capa 2 · Documento</p>
          <p className="mt-1 text-[0.95rem] text-dg-pizarra">Lo que el documento permite observar</p>
        </div>
        <div className="flex items-center gap-5">
          <ComprobanteVisual c={COMPROBANTES[0]} compacto className="w-[19rem]" />
          <p className="text-[1.25rem] leading-snug text-dg-tinta">
            Acredita <b>una transferencia</b> de {pesos(500_000)} el 22/04/2026 a la cuenta de Boreal. Referencia: «PAGO A CUENTA».
          </p>
        </div>
      </Unidad>
      <Unidad i={2} label="Inferencia" className="grid grid-cols-[13rem_1fr] items-center gap-6 rounded-2xl border-2 border-dashed border-dg-lacre/60 bg-dg-hoja px-6 py-4">
        <div>
          <p className="dg-rotulo text-[0.66rem] text-dg-lacre">Capa 3 · Inferencia</p>
          <p className="mt-1 text-[0.95rem] text-dg-pizarra">Lo que hay que justificar</p>
        </div>
        <p className="dg-serif text-[1.7rem] leading-snug text-dg-tinta">
          «…entonces esa transferencia <span className="dg-marca">extinguió la factura 418</span>.» <span className="dg-maquina text-dg-lacre">¿por qué?</span>
        </p>
      </Unidad>
    </div>
  );
}

// 08 · Primero el mapa. Después el texto.
const ESQUEMA = ["I. Objeto", "II. Los comprobantes acreditan el pago", "III. La imputación de los pagos", "IV. Las facturas 397 y 405", "V. Petitorio"];

function Mapa(_: P) {
  return (
    <div className="grid flex-1 grid-cols-3 gap-6">
      <Unidad i={0} label="1 · Propuesta de la IA" className="flex flex-col rounded-2xl border border-dg-linea bg-dg-hoja p-5">
        <p className="dg-rotulo text-[0.66rem] text-dg-azul">1 · Propuesta</p>
        <p className="mt-1 text-[1rem] text-dg-pizarra">La IA ordena: hechos, faltantes, esquema. Sin redactar.</p>
        <ol className="dg-maquina mt-4 grid gap-2.5 text-[1rem] text-dg-tinta">
          {ESQUEMA.map((e) => (
            <li key={e} className="rounded-lg bg-dg-azul-claro/70 px-3 py-2">
              {e}
            </li>
          ))}
        </ol>
        <p className="mt-auto pt-3 text-[0.9rem] italic text-dg-niebla">«Espero tu aprobación antes de desarrollar.»</p>
      </Unidad>
      <Unidad i={1} label="2 · Intervención profesional" className="relative flex flex-col rounded-2xl border-2 border-dg-lacre/50 bg-dg-hoja p-5">
        <p className="dg-rotulo text-[0.66rem] text-dg-lacre">2 · Intervención profesional</p>
        <p className="mt-1 text-[1rem] text-dg-pizarra">Se corrige lo que excede los documentos.</p>
        <ol className="dg-maquina mt-4 grid gap-2.5 text-[1rem] text-dg-tinta">
          {ESQUEMA.map((e, i) => (
            <li key={e} className="rounded-lg bg-dg-papel px-3 py-2">
              {i === 1 ? (
                <>
                  <span className="text-dg-niebla line-through decoration-dg-lacre decoration-2">{e}</span>
                  <span className="dg-serif mt-1 block text-[1.15rem] italic text-dg-lacre">II. Lo que acreditan los comprobantes</span>
                </>
              ) : (
                e
              )}
            </li>
          ))}
        </ol>
        <Sello texto="Aprobado con correcciones" color={C.lacre} className="absolute -right-3 bottom-4 rotate-[-8deg] bg-dg-hoja/90 text-[0.7rem]" />
      </Unidad>
      <Unidad i={2} label="3 · Desarrollo autorizado" className="flex flex-col rounded-2xl border-2 border-dg-verde/50 bg-dg-hoja p-5">
        <p className="dg-rotulo text-[0.66rem] text-dg-verde">3 · Desarrollo</p>
        <p className="mt-1 text-[1rem] text-dg-pizarra">Se autoriza un apartado. El resto espera.</p>
        <div className="mt-4 grid gap-2">
          {["I. Objeto", "II. Lo que acreditan los comprobantes", "III. La imputación", "IV. Facturas 397 y 405"].map((e, i) =>
            i === 1 ? (
              <div key={e} className="rounded-lg border border-dg-verde/40 bg-dg-salvia-claro p-3">
                <p className="dg-maquina text-[0.95rem] font-bold text-dg-verde">{e}</p>
                <div className="mt-2 grid gap-1.5">
                  {["100%", "94%", "98%", "62%"].map((w) => (
                    <span key={w} className="dg-renglon" style={{ width: w, background: "#c9d6cb" }} />
                  ))}
                </div>
              </div>
            ) : (
              <p key={e} className="dg-maquina rounded-lg border border-dashed border-dg-linea px-3 py-1.5 text-[0.9rem] text-dg-niebla">
                {e} · pendiente
              </p>
            ),
          )}
        </div>
      </Unidad>
    </div>
  );
}

// 09 · Delegar texto no es delegar criterio (GIRO) — circuito con puntos de decisión
function GiroCriterio(_: P) {
  const puntos = [
    { e: "Definir el encargo", k: 3 },
    { e: "Revisar antecedentes", k: 2 },
    { e: "Aprobar el esquema", k: 3 },
    { e: "Controlar el borrador", k: 2 },
  ];
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="relative grid grid-cols-4 gap-6">
        <div className="absolute left-[8%] right-[8%] top-[2.4rem] border-t-[3px] border-dg-tinta/20" />
        {puntos.map((p, i) => (
          <div key={p.e} className="tf-sube relative flex flex-col items-center text-center" style={retraso(0.1 + i * 0.1)}>
            <span className="relative z-10 flex size-[4.8rem] rotate-45 items-center justify-center rounded-xl border-2 border-dg-lacre bg-dg-hoja">
              <GlifoPersona className="size-9 -rotate-45 text-dg-lacre" />
            </span>
            <p className="dg-serif mt-5 text-[1.7rem] leading-tight text-dg-tinta">{p.e}</p>
          </div>
        ))}
      </div>
      <p className="tf-sube dg-maquina mx-auto max-w-[58rem] text-center text-[1.25rem] leading-snug text-dg-pizarra" style={retraso(0.5)}>
        Operaciones distintas. No todas con la misma intensidad en cualquier documento: los controles se organizan según la tarea.
      </p>
    </div>
  );
}

// 10 · El cliente trae un relato. No un prompt.
function Relato(_: P) {
  const { visibles } = useRevelado();
  const marcar = visibles > 0;
  const m = (t: string) => <span className={cn(marcar && "dg-marca")}>{t}</span>;
  return (
    <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-6">
      <div className="rounded-[1.75rem] bg-[#e7efe3] p-5 shadow-inner">
        <p className="text-[0.85rem] font-semibold text-dg-verde">Martín · Posada Los Alerces</p>
        <p className="mt-2 rounded-2xl rounded-tl-md bg-white px-5 py-4 text-[1.18rem] leading-relaxed text-dg-tinta shadow-sm">
          Hola Dra., te reenvío lo de Boreal 🙄. {m("Les pagamos TODO")}: son 3 transferencias de 500 que suman justo el 1.500 de la factura del mantenimiento. Las otras dos facturas se
          las pagamos {m("en efectivo al técnico")}, {m("no sé si hay recibo")}. Lo de la tercera que dice 397 {m("fue un error de Carla")}. {m("Quiero contestarles fuerte, esto es mala fe")}.
          ¿Me mandás algo para presentar esta semana?
        </p>
        <p className="mt-1.5 text-right text-[0.75rem] text-dg-niebla">18:42 ✓✓</p>
      </div>
      <Unidad i={0} className="flex flex-col items-center gap-2">
        <Flecha className="w-20" color={C.verde} animada />
        <span className="dg-maquina text-[0.85rem] text-dg-verde">interpretar</span>
      </Unidad>
      <Unidad i={1} label="La ficha profesional" className="dg-hoja rounded-xl border border-dg-linea px-6 py-5">
        <p className="dg-maquina text-[1rem] font-bold tracking-wide text-dg-tinta">FICHA · Boreal c/ Posada</p>
        <dl className="mt-3 grid gap-2.5 text-[1.02rem]">
          {[
            ["Objeto", "Responder el cuestionamiento de Boreal sobre los comprobantes"],
            ["Afirma", "Pagó la factura 418 con tres transferencias"],
            ["Documentos", "Comprobantes 1–3 · sin recibos de 397 y 405"],
            ["Contradicción", "Comprobante 3 dice «FC 397»; el cliente dice «error»"],
            ["Falta", "Prueba del pago en efectivo · versión de Carla"],
          ].map(([k, v]) => (
            <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-3">
              <dt className="dg-maquina text-[0.9rem] uppercase text-dg-niebla">{k}</dt>
              <dd className={cn("leading-snug text-dg-tinta", (k === "Contradicción" || k === "Falta") && "text-dg-lacre")}>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-dashed border-dg-linea pt-3 text-[0.98rem] text-dg-pizarra">
          «Contestar fuerte» y «mala fe» son pedidos del cliente, no hechos del caso.
        </p>
      </Unidad>
    </div>
  );
}

// 11 · Un pedido tiene cinco piezas — COTIO con el caso
function Cotio(_: P) {
  const piezas = [
    { l: "C", n: "Contexto", t: "Respuesta en un litigio contractual ficticio; representamos a la demandada." },
    { l: "O", n: "Objeto", t: "El apartado sobre la relevancia de los tres comprobantes frente a la objeción." },
    { l: "T", n: "Tarea", t: "Primero una línea argumental; después, solo el apartado autorizado." },
    { l: "I", n: "Input", t: "Ficha, comprobantes y escrito contrario. Solo esos materiales para los hechos." },
    { l: "O", n: "Output", t: "Esquema breve: afirmación, respaldo, inferencia y dato faltante." },
  ];
  const colores = [C.azul, C.verde, C.lacre, C.ocre, C.tinta];
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="grid grid-cols-5 gap-3">
        {piezas.map((p, i) => (
          <Unidad key={p.n} i={i} label={p.n} className="flex flex-col rounded-2xl border-2 bg-dg-hoja p-5" style={{ borderColor: `${colores[i]}55` }}>
            <span className="dg-serif text-[4.6rem] leading-[0.85]" style={{ color: colores[i] }}>
              {p.l}
            </span>
            <p className="dg-rotulo mt-2 text-[0.7rem]" style={{ color: colores[i] }}>
              {p.n}
            </p>
            <p className="dg-maquina mt-3 text-[0.98rem] leading-snug text-dg-tinta">{p.t}</p>
          </Unidad>
        ))}
      </div>
      <p className="tf-sube text-center text-[1.15rem] text-dg-pizarra" style={retraso(0.3)}>
        No es una fórmula que garantice respuestas correctas: es una estructura para pensar qué necesita el sistema y qué operación esperamos.{" "}
        <span className="dg-maquina text-dg-pizarra">+ «No inventes hechos, normativa ni jurisprudencia».</span>
      </p>
    </div>
  );
}

// 12 · El contexto no es una bolsa de archivos — la mesa de trabajo
function Contexto(_: P) {
  const bandejas = [
    { n: "Prueba documental", f: "Hechos del caso", ej: ["Comprobante 1", "Comprobante 2", "Comprobante 3"], c: C.azul },
    { n: "Alegaciones", f: "Posiciones de las partes", ej: ["Escrito de Boreal", "Mensaje del cliente"], c: C.verde },
    { n: "Fuentes jurídicas", f: "Derecho aplicable", ej: ["[normativa a verificar]"], c: C.ocre },
    { n: "Modelo de estructura", f: "Solo la forma", ej: ["Escrito de otro expediente"], c: C.lacre, alerta: true },
    { n: "Referencias de estilo", f: "Solo el tono", ej: ["Escritos del estudio"], c: C.pizarra },
  ];
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="grid grid-cols-5 gap-4">
        {bandejas.map((b, i) => (
          <div key={b.n} className="tf-sube flex flex-col" style={retraso(0.08 * i)}>
            <div className="relative flex min-h-[13rem] flex-col gap-2 rounded-t-xl border-x-2 border-t-2 bg-dg-hoja/80 px-3 pb-3 pt-4" style={{ borderColor: `${b.c}66` }}>
              {b.ej.map((e, k) => (
                <span key={e} className="dg-hoja dg-maquina rounded border border-dg-linea px-2.5 py-2 text-[0.88rem] text-dg-tinta" style={{ transform: `rotate(${[-1.5, 1, -0.5][k % 3]}deg)` }}>
                  {e}
                </span>
              ))}
              {b.alerta && <Sello texto="No trasladar hechos" color={C.lacre} className="mt-auto self-center text-[0.62rem]" />}
            </div>
            <div className="rounded-b-xl px-3 py-3 text-white" style={{ background: b.c }}>
              <p className="text-[1.05rem] font-semibold leading-tight">{b.n}</p>
              <p className="dg-maquina mt-1 text-[0.82rem] opacity-90">Función: {b.f}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="tf-sube dg-serif text-center text-[1.6rem] italic text-dg-tinta" style={retraso(0.5)}>
        Decile a la IA qué función cumple cada archivo. Una plantilla anterior no debe traer nombres, hechos ni argumentos de otro expediente.
      </p>
    </div>
  );
}

export const CUERPOS_A = {
  decide: Decide,
  impecable: Impecable,
  estaciones: Estaciones,
  "giro-tarea": GiroTarea,
  loop: Loop,
  decidir: Decidir,
  capas: Capas,
  mapa: Mapa,
  "giro-criterio": GiroCriterio,
  relato: Relato,
  cotio: Cotio,
  contexto: Contexto,
} as const;
