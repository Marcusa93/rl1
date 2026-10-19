"use client";

// Cuerpos de las placas 13 a 24 de /doing (bloques III a V). Cada parte que
// aparece de a una con → va envuelta en <Unidad i={n}>; la cantidad de partes
// está en lib/doing-clase.ts (campo `pasos`).

import { Unidad } from "@/components/tribunal/revelado";
import { C, Flecha, GlifoAlto, GlifoEngranaje, GlifoPersona, GlifoPluma, retraso, Sello } from "@/components/doing/piezas";
import { useDatos, Visualizacion } from "@/components/doing/resultados";
import { CASO } from "@/lib/doing-caso";
import { DG_ACTIVIDADES, DG_FRASE_FINAL, type DgActividad, type DgPlaca } from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

type P = { placa: DgPlaca };

// 13 · Un argumento necesita puentes
function Puentes(_: P) {
  const plataforma = "flex min-h-[10rem] flex-col justify-center rounded-2xl border-2 bg-dg-hoja px-5 py-4 text-center";
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <div className="grid grid-cols-[1fr_9rem_1fr_9rem_1fr] items-center">
        <div className={cn(plataforma, "border-dg-azul/50")}>
          <p className="dg-rotulo text-[0.62rem] text-dg-azul">Apoyo</p>
          <p className="dg-serif mt-2 text-[1.5rem] leading-snug text-dg-tinta">Boreal recibió tres transferencias</p>
          <p className="dg-maquina mt-1 text-[0.85rem] text-dg-pizarra">comprobantes + reconocimiento</p>
        </div>
        <Unidad i={0} label="Primer puente: completo" className="relative h-24">
          <Puente />
          <span className="dg-maquina absolute inset-x-0 -bottom-3 text-center text-[0.8rem] text-dg-verde">suman $ 1.500.000</span>
        </Unidad>
        <div className={cn(plataforma, "border-dg-verde/50")}>
          <p className="dg-rotulo text-[0.62rem] text-dg-verde">Afirmación</p>
          <p className="dg-serif mt-2 text-[1.5rem] leading-snug text-dg-tinta">El total coincide con la factura 418</p>
          <p className="dg-maquina mt-1 text-[0.85rem] text-dg-pizarra">un indicio</p>
        </div>
        <Unidad i={1} label="Segundo puente: incompleto" className="relative h-24">
          <Puente roto />
          <span className="dg-maquina absolute inset-x-0 -bottom-3 text-center text-[0.8rem] font-bold text-dg-lacre">¿imputación?</span>
        </Unidad>
        <div className={cn(plataforma, "border-dg-tinta/60")}>
          <p className="dg-rotulo text-[0.62rem] text-dg-tinta">Conclusión</p>
          <p className="dg-serif mt-2 text-[1.5rem] leading-snug text-dg-tinta">La factura 418 está cancelada</p>
        </div>
      </div>
      <Unidad i={1} className="mx-auto max-w-[60rem] rounded-xl border-l-4 border-dg-lacre bg-dg-hoja px-6 py-3 text-[1.2rem] leading-snug text-dg-tinta">
        Falta explicar la relación: <b>a qué obligación se aplicó cada pago</b>. Mencionar la prueba no alcanza; hay que mostrar el puente.
      </Unidad>
    </div>
  );
}

function Puente({ roto }: { roto?: boolean }) {
  const tablas = Array.from({ length: 9 }, (_, i) => i);
  return (
    <svg viewBox="0 0 140 60" className="absolute inset-0 h-full w-full" aria-hidden>
      <path d="M0 22 Q70 44 140 22" fill="none" stroke={roto ? C.lacre : C.tinta} strokeWidth="2" />
      {tablas.map((i) => {
        if (roto && i >= 3 && i <= 6) return null;
        const x = 6 + i * 16;
        const y = 22 + Math.sin((x / 140) * Math.PI) * 11;
        return <rect key={i} x={x - 6} y={y} width="12" height="5" rx="1" fill={roto ? C.lacre : C.verde} opacity={roto ? 0.7 : 0.85} />;
      })}
      <path d="M0 40 Q70 62 140 40" fill="none" stroke={roto ? C.lacre : C.tinta} strokeWidth="1.2" strokeDasharray={roto ? "3 4" : undefined} opacity="0.5" />
    </svg>
  );
}

// 14 · Que la IA cuestione lo que acaba de escribir — observaciones al margen
function Adversarial(_: P) {
  const notas = [
    { t: "Premisa más débil", d: "¿Estaban pagas las facturas 397 y 405? Solo lo dice el cliente." },
    { t: "Objeción previsible", d: "El comprobante 3 dice «FC 0003-00000397»: Posada designó otra factura al pagar." },
    { t: "Excede el respaldo", d: "«Cancelaron» es una inferencia: reformular y justificar." },
  ];
  return (
    <div className="grid flex-1 grid-cols-[1.15fr_0.85fr] items-center gap-0">
      <div className="dg-hoja relative rounded-l-xl border border-dg-linea px-8 py-7">
        <p className="dg-maquina text-[0.95rem] font-bold text-dg-tinta">II. LOS COMPROBANTES</p>
        <p className="dg-maquina mt-3 text-[1.05rem] leading-[1.9] text-dg-tinta">
          Las tres transferencias, que suman exactamente el importe de la factura 418 y que la actora reconoce haber recibido,{" "}
          <span className="dg-marca">cancelaron esa factura</span>. Las facturas 397 y 405 <span className="dg-marca">ya se encontraban pagas</span>, por lo que{" "}
          <span className="dg-marca">la referencia del comprobante 3 obedece a un error</span> de carga.
        </p>
      </div>
      <div className="relative flex h-full flex-col justify-center gap-4 rounded-r-xl border-y border-r border-dashed border-dg-lacre/40 bg-dg-lacre-claro/40 py-5 pl-6 pr-4">
        {notas.map((n, i) => (
          <Unidad key={n.t} i={i} label={n.t} className="relative">
            <span className="absolute -left-9 top-2 h-px w-7 bg-dg-lacre" />
            <p className="dg-serif text-[1.35rem] italic leading-tight text-dg-lacre">{n.t}</p>
            <p className="mt-0.5 text-[1.02rem] leading-snug text-dg-tinta">{n.d}</p>
          </Unidad>
        ))}
        <p className="dg-maquina mt-1 text-[0.85rem] text-dg-pizarra">Las observaciones de la IA también se examinan.</p>
      </div>
    </div>
  );
}

// 15 · Una palabra puede cambiar el caso
function Palabra(_: P) {
  const pares = [
    { a: ["El documento ", "no acredita", " el pago."], b: ["El pago ", "no existió", "."], ea: "Insuficiencia de respaldo", eb: "Afirmación sobre el hecho" },
    { a: ["La parte ", "sostiene", " que pagó."], b: ["Se encuentra ", "acreditado", " que pagó."], ea: "Atribución a una parte", eb: "Certeza del tribunal" },
  ];
  return (
    <div className="flex flex-1 flex-col justify-center gap-7">
      {pares.map((p, i) => (
        <Unidad key={i} i={i} label={`${p.a.join("")} ≠ ${p.b.join("")}`} className="grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <div className="dg-hoja rounded-2xl border border-dg-linea px-7 py-5">
            <p className="dg-serif text-[2.4rem] leading-tight text-dg-tinta">
              «{p.a[0]}
              <span className="dg-marca text-dg-verde">{p.a[1]}</span>
              {p.a[2]}»
            </p>
            <p className="dg-maquina mt-2 text-[0.95rem] text-dg-verde">{p.ea}</p>
          </div>
          <span className="dg-serif text-[3.4rem] text-dg-lacre">≠</span>
          <div className="dg-hoja rounded-2xl border border-dg-linea px-7 py-5">
            <p className="dg-serif text-[2.4rem] leading-tight text-dg-tinta">
              «{p.b[0]}
              <span className="dg-marca text-dg-lacre">{p.b[1]}</span>
              {p.b[2]}»
            </p>
            <p className="dg-maquina mt-2 text-[0.95rem] text-dg-lacre">{p.eb}</p>
          </div>
        </Unidad>
      ))}
      <p className="tf-sube text-center text-[1.2rem] text-dg-pizarra" style={retraso(0.3)}>
        Mejorar la redacción no autoriza a cambiar la certeza, las atribuciones ni el contenido sustantivo.
      </p>
    </div>
  );
}

// 16 · No todo escrito empieza de cero (GIRO) — la pila de escritos con campos variables
function GiroRepite(_: P) {
  const campos = ["Expte. N.º ____", "«______ c/ ______»", "Documento 1: ______", "Fecha: __/__/____"];
  return (
    <div className="grid flex-1 grid-cols-[0.9fr_1.1fr] items-center gap-12">
      <div className="tf-sube relative mx-auto h-[24rem] w-[20rem]" style={retraso(0.15)}>
        {[4, 3, 2, 1, 0].map((k) => (
          <div
            key={k}
            className="dg-hoja absolute inset-x-0 h-[21rem] rounded-lg border border-dg-linea px-5 py-5"
            style={{ top: `${k * 0.7}rem`, left: `${k * 0.6}rem`, transform: `rotate(${(k - 2) * 1.4}deg)`, opacity: k === 0 ? 1 : 0.9 }}
          >
            {k === 0 && (
              <div className="grid gap-3">
                <span className="dg-renglon h-2.5 w-3/5 bg-dg-tinta/40" />
                {campos.map((c, i) => (
                  <div key={c} className="grid gap-1.5">
                    <span className="dg-campo dg-maquina w-fit text-[0.85rem] text-dg-tinta">{c}</span>
                    <span className="dg-renglon" style={{ width: ["94%", "80%", "90%", "70%"][i] }} />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid gap-4">
        {["¿Qué partes se repiten?", "¿Qué datos cambian?", "¿Qué situaciones exceden el supuesto?"].map((t, i) => (
          <p key={t} className="tf-sube dg-serif border-b border-dg-linea pb-3 text-[2.2rem] leading-tight text-dg-tinta" style={retraso(0.2 + i * 0.12)}>
            <span className="dg-maquina mr-3 text-[1.2rem] text-dg-lacre">{i + 1}</span>
            {t}
          </p>
        ))}
      </div>
    </div>
  );
}

// 17 · Automatizar no es pedir «hacelo solo» — el caso de uso y la anatomía de la plantilla
function CasoUso(_: P) {
  return (
    <div className="grid flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-10">
      <div className="grid gap-4">
        <p className="dg-serif rounded-2xl border border-dg-linea bg-dg-hoja/60 px-6 py-4 text-[1.6rem] leading-snug text-dg-niebla line-through decoration-dg-lacre decoration-[3px]">
          «Automatizar todos los escritos del estudio»
        </p>
        <Flecha className="mx-auto w-16 rotate-90" color={C.verde} />
        <div className="rounded-2xl border-2 border-dg-verde/60 bg-dg-hoja px-6 py-4">
          <p className="dg-rotulo text-[0.62rem] text-dg-verde">Caso de uso</p>
          <p className="dg-serif mt-1 text-[1.9rem] leading-tight text-dg-tinta">Escrito de acompañamiento documental</p>
          <p className="mt-1 text-[1rem] text-dg-pizarra">Específico, conocido y relativamente estable.</p>
        </div>
      </div>
      <div className="dg-hoja relative rounded-xl border border-dg-linea px-8 py-6">
        <div className="dg-maquina grid gap-2.5 text-[0.98rem] leading-snug text-dg-tinta">
          <p>
            <Var>{CASO.organo}</Var>
          </p>
          <p>
            Expte. N.º <Var>{CASO.expediente}</Var> — «<Var>Boreal c/ Posada</Var>»
          </p>
          <p className="font-bold">ACOMPAÑA DOCUMENTAL</p>
          <p>
            <Var>{CASO.letrada}</Var>, por la representación de <Var>{CASO.demandada}</Var>, <Fijo>respetuosamente digo:</Fijo>
          </p>
          <p>
            <Fijo>I. OBJETO. Que vengo a acompañar la documental que se detalla…</Fijo>
          </p>
          <p>
            II. DOCUMENTAL: <Var>Comprobantes 1, 2 y 3</Var> · <Fijo>Se acompañan</Fijo> <Var>3 (tres)</Var> <Fijo>documentos.</Fijo>
          </p>
          <p>
            <Fijo>IV. PETITORIO. Se tenga por acompañada la documental…</Fijo>
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Unidad i={0} label="Partes fijas">
            <span className="rounded-full bg-dg-linea/70 px-4 py-1.5 text-[0.95rem] text-dg-pizarra">▬ Texto fijo: no cambia</span>
          </Unidad>
          <Unidad i={1} label="Campos variables">
            <span className="dg-campo rounded-full px-4 py-1.5 text-[0.95rem] text-dg-tinta">Campos: cambian en cada expediente</span>
          </Unidad>
          <Unidad i={2} label="Excepciones">
            <span className="rounded-full border-2 border-dg-lacre px-4 py-1 text-[0.95rem] font-semibold text-dg-lacre">⛔ Excepciones: piden intervención</span>
          </Unidad>
        </div>
      </div>
    </div>
  );
}

const Var = ({ children }: { children: React.ReactNode }) => <span className="dg-campo">{children}</span>;
const Fijo = ({ children }: { children: React.ReactNode }) => <span className="text-dg-pizarra">{children}</span>;

// 18 · Un dato tiene que tener domicilio — campos, posiciones y validaciones
function Domicilio(_: P) {
  const campos = [
    { k: "Órgano", v: "Juzgado Civil y Comercial N.º 7", val: "obligatorio" },
    { k: "Expediente", v: CASO.expediente, val: "formato 1234/2026" },
    { k: "Carátula", v: "Boreal c/ Posada s/ cobro", val: "obligatorio" },
    { k: "Parte", v: CASO.demandada, val: "obligatorio" },
    { k: "Documentos", v: "3 archivos", val: "3 declarados = 3 adjuntos" },
  ];
  const lugares = ["{{organo}}", "Expte. N.º {{expediente}}", "«{{caratula}}»", "por la representación de {{parte}}", "Se acompañan {{cantidad}} documentos"];
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="grid grid-cols-[1fr_9rem_1fr] items-stretch">
        <div className="grid gap-2.5 rounded-2xl border border-dg-linea bg-dg-hoja p-4">
          {campos.map((c) => (
            <div key={c.k} className="flex items-center gap-3 rounded-lg border border-dg-linea bg-white px-3 py-2">
              <span className="w-28 shrink-0 text-[0.85rem] font-semibold uppercase tracking-wide text-dg-niebla">{c.k}</span>
              <span className="dg-maquina min-w-0 flex-1 truncate text-[1rem] text-dg-tinta">{c.v}</span>
              <Unidad i={0} as="span" className="shrink-0">
                <span className="rounded-full bg-dg-salvia-claro px-2.5 py-0.5 text-[0.78rem] font-semibold text-dg-verde">✓ {c.val}</span>
              </Unidad>
            </div>
          ))}
        </div>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-full w-full" aria-hidden>
          {campos.map((_c, i) => {
            const y = 10 + i * 20;
            return <path key={i} d={`M0 ${y} C 50 ${y}, 50 ${y}, 100 ${y}`} stroke={C.ocre} strokeWidth="1.2" vectorEffect="non-scaling-stroke" className="dg-flujo" fill="none" />;
          })}
        </svg>
        <div className="dg-hoja grid gap-2.5 rounded-xl border border-dg-linea p-4">
          {lugares.map((l) => (
            <p key={l} className="dg-maquina flex items-center rounded-lg px-3 py-2 text-[1rem] text-dg-tinta">
              {l.split(/(\{\{[a-z]+\}\})/).map((t, i) => (t.startsWith("{{") ? <span key={i} className="dg-campo mx-1">{t}</span> : <span key={i}>{t}</span>))}
            </p>
          ))}
        </div>
      </div>
      <Unidad i={1} label="El límite de las validaciones" className="mx-auto max-w-[62rem] rounded-xl border-l-4 border-dg-lacre bg-dg-hoja px-6 py-3 text-[1.2rem] leading-snug text-dg-tinta">
        Las validaciones detectan errores formales. <b>No sustituyen el control jurídico del contenido</b>: una regla no sabe si conviene presentar.
      </Unidad>
    </div>
  );
}

// 19 · La plantilla sabe repetir. La IA sabe reformular.
function PlantillaIa(_: P) {
  return (
    <div className="grid flex-1 grid-cols-[1fr_1.1fr_1fr] items-center gap-6">
      <Unidad i={0} label="Sustitución de campos" className="rounded-2xl border-2 border-dg-azul/50 bg-dg-hoja p-6">
        <GlifoEngranaje className="size-14 text-dg-azul" />
        <p className="dg-serif mt-3 text-[2rem] leading-tight text-dg-tinta">Sustitución de campos</p>
        <p className="dg-maquina mt-3 rounded-lg bg-dg-azul-claro px-3 py-2 text-[0.95rem] text-dg-tinta">
          {"{{expediente}}"} → {CASO.expediente}
        </p>
        <ul className="mt-4 grid gap-1.5 text-[1.05rem] text-dg-pizarra">
          <li>✓ estable y predecible</li>
          <li>✓ auditable</li>
          <li>✗ no reformula</li>
        </ul>
      </Unidad>
      <Unidad i={1} label="El documento combinado" className="flex flex-col items-center">
        <div className="flex w-full items-center justify-between px-2">
          <Flecha className="w-14 rotate-[25deg]" color={C.azul} />
          <Flecha className="w-14 rotate-[155deg]" color={C.verde} />
        </div>
        <div className="dg-hoja mt-2 w-full rounded-xl border border-dg-linea px-6 py-5">
          <div className="grid gap-2">
            <span className="dg-renglon w-3/5" />
            <span className="dg-campo dg-maquina w-fit text-[0.82rem]">Expte. 4418/2026 · Boreal c/ Posada</span>
            <span className="dg-renglon w-full" />
            <span className="dg-renglon w-[85%]" />
            <span className="dg-maquina mt-1 rounded border-l-4 border-dg-verde bg-dg-salvia-claro px-2 py-1.5 text-[0.82rem] leading-snug text-dg-tinta">
              III. Comprobante de transferencia del 22/04/2026 por $ 500.000, referencia «PAGO A CUENTA»…
            </span>
            <span className="dg-renglon w-full" />
            <span className="dg-renglon w-[70%]" />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap justify-center gap-2 text-[0.85rem]">
          <span className="rounded-full bg-dg-linea/70 px-3 py-1 text-dg-pizarra">texto fijo</span>
          <span className="dg-campo rounded-full px-3 py-1">campos</span>
          <span className="rounded-full bg-dg-salvia-claro px-3 py-1 text-dg-verde">fragmento generado</span>
        </div>
      </Unidad>
      <Unidad i={1} label="Generación de lenguaje" className="rounded-2xl border-2 border-dg-verde/50 bg-dg-hoja p-6">
        <GlifoPluma className="size-14 text-dg-verde" />
        <p className="dg-serif mt-3 text-[2rem] leading-tight text-dg-tinta">Generación de lenguaje</p>
        <p className="dg-maquina mt-3 rounded-lg bg-dg-salvia-claro px-3 py-2 text-[0.95rem] text-dg-tinta">Describir documentos heterogéneos, sintetizar antecedentes</p>
        <ul className="mt-4 grid gap-1.5 text-[1.05rem] text-dg-pizarra">
          <li>✓ flexible</li>
          <li>✓ útil para fragmentos variables</li>
          <li>✗ hay que revisarla</li>
        </ul>
      </Unidad>
    </div>
  );
}

// 20 · Del formulario al borrador — el procedimiento completo
function Formulario(_: P) {
  const pasos = [
    { t: "Datos", d: "formulario", c: C.pizarra },
    { t: "Validación", d: "reglas", c: C.azul },
    { t: "Plantilla", d: "reglas", c: C.azul },
    { t: "Descripción", d: "IA", c: C.verde },
    { t: "Borrador", d: "resultado", c: C.ocre },
    { t: "Revisión", d: "profesional", c: C.tinta },
  ];
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="flex items-center gap-2">
        {pasos.map((p, i) => (
          <div key={p.t} className="contents">
            {i > 0 && <Flecha className="w-10 shrink-0" color={C.niebla} animada />}
            <div className="tf-sube flex-1 rounded-2xl border-2 bg-dg-hoja px-4 py-5 text-center" style={{ borderColor: `${p.c}66`, ...retraso(i * 0.1) }}>
              <p className="dg-serif text-[1.8rem] leading-tight text-dg-tinta">{p.t}</p>
              <p className="dg-maquina mt-1 text-[0.9rem]" style={{ color: p.c }}>
                {p.d}
              </p>
              {i === 5 && <GlifoPersona className="mx-auto mt-2 size-7 text-dg-tinta" />}
            </div>
          </div>
        ))}
      </div>
      <div className="tf-sube flex items-center justify-center gap-6" style={retraso(0.7)}>
        <Sello texto="Borrador para revisión profesional" color={C.ocre} className="rotate-[-3deg] text-[1rem]" />
        <p className="dg-serif text-[2rem] italic text-dg-tinta">Generar no significa presentar.</p>
      </div>
    </div>
  );
}

// 21 · Un sistema confiable también sabe detenerse (GIRO)
function GiroDetenerse(_: P) {
  const altos = ["Campo incompleto", "Información contradictoria", "Pedido que excede la finalidad"];
  return (
    <div className="grid flex-1 grid-cols-[1fr_1fr] items-center gap-12">
      <div className="tf-sube grid gap-3" style={retraso(0.15)}>
        <div className="flex items-center gap-3">
          <span className="rounded-xl border-2 border-dg-azul/50 bg-dg-hoja px-5 py-3 text-[1.3rem] text-dg-tinta">Generación</span>
          <Flecha className="w-16" color={C.verde} animada />
          <span className="rounded-xl border-2 border-dg-ocre/60 bg-dg-hoja px-5 py-3 text-[1.3rem] text-dg-tinta">Borrador para revisión</span>
        </div>
        <div className="ml-12 grid gap-3 border-l-[3px] border-dashed border-dg-lacre/50 pl-6 pt-2">
          {altos.map((a) => (
            <p key={a} className="flex items-center gap-3 text-[1.35rem] text-dg-tinta">
              <GlifoAlto className="size-9 shrink-0 text-dg-lacre" />
              {a} <span className="dg-maquina text-[0.95rem] text-dg-lacre">→ derivar</span>
            </p>
          ))}
        </div>
      </div>
      <p className="tf-sube dg-serif text-[2.4rem] leading-tight text-dg-tinta" style={retraso(0.35)}>
        Presentar ante un tribunal es otra actuación, con <span className="text-dg-lacre">controles adicionales</span>.
      </p>
    </div>
  );
}

// 22 · Que suene jurídico no alcanza — primer borrador y versión corregida
function Calidad(_: P) {
  const controles = ["Antecedentes", "Consistencia", "Fuentes", "Atribuciones", "Importes", "Fechas", "Fundamentos ↔ petición"];
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <div className="grid grid-cols-2 gap-6">
        <div className="dg-hoja relative rounded-xl border border-dg-linea px-7 py-5">
          <p className="dg-rotulo text-[0.62rem] text-dg-lacre">Primer borrador · demostración 1</p>
          <p className="dg-maquina mt-3 text-[1rem] leading-[1.85] text-dg-tinta">
            Las transferencias <span className="dg-marca">acreditan de manera indubitable la cancelación total</span> de la obligación, que asciende a{" "}
            <span className="dg-marca">$ 1.500.000</span>. La actora actúa <span className="dg-marca">de mala fe</span>.
          </p>
          <Unidad i={0} className="mt-3 grid gap-1.5 border-t border-dashed border-dg-lacre/40 pt-3 text-[0.98rem] text-dg-lacre">
            <p>✗ Inferencia presentada como hecho</p>
            <p>✗ Importe inventado: Boreal reclama $ 1.000.000</p>
            <p>✗ Calificación sin respaldo</p>
          </Unidad>
        </div>
        <Unidad i={1} label="Versión corregida" className="dg-hoja rounded-xl border-2 border-dg-verde/50 px-7 py-5">
          <p className="dg-rotulo text-[0.62rem] text-dg-verde">Versión corregida</p>
          <p className="dg-maquina mt-3 text-[1rem] leading-[1.85] text-dg-tinta">
            Los comprobantes documentan tres transferencias de $ 500.000 que la actora reconoce haber recibido. <b>Lo controvertido es su imputación</b>; mi mandante sostiene
            que las facturas 397 y 405 estaban canceladas [ofrecer prueba].
          </p>
        </Unidad>
      </div>
      <div className="tf-sube flex flex-wrap justify-center gap-2.5" style={retraso(0.3)}>
        {controles.map((c) => (
          <span key={c} className="rounded-full border border-dg-verde/40 bg-dg-salvia-claro px-4 py-1.5 text-[1rem] text-dg-tinta">
            ✓ {c}
          </span>
        ))}
      </div>
    </div>
  );
}

// 23 · El costo oculto de un borrador rápido
function Costo(_: P) {
  const rapida = [
    { t: "Pedido", m: 1, c: C.pizarra },
    { t: "Generación", m: 1, c: C.azul },
    { t: "Revisar, detectar y corregir", m: 40, c: C.lacre },
  ];
  const etapas = [
    { t: "Preparar el encargo", m: 8, c: C.verde },
    { t: "Esquema", m: 3, c: C.azul },
    { t: "Aprobar", m: 3, c: C.tinta },
    { t: "Redactar", m: 2, c: C.azul },
    { t: "Revisar", m: 8, c: C.verde },
  ];
  const total = 46;
  const barra = (xs: { t: string; m: number; c: string }[]) => (
    <div className="flex h-14 overflow-hidden rounded-xl">
      {xs.map((x) => (
        <div
          key={x.t}
          className="flex items-center justify-center overflow-hidden border-r-2 border-dg-hoja px-2 text-[0.9rem] font-semibold text-white"
          style={{ width: `${(x.m / total) * 100}%`, background: x.c }}
          title={`${x.t}: ${x.m} min`}
        >
          {x.m >= 3 && <span className="truncate">{x.t}</span>}
        </div>
      ))}
    </div>
  );
  return (
    <div className="grid flex-1 grid-cols-[0.75fr_1.25fr] items-center gap-10">
      <div className="grid gap-3">
        {[
          ["Sesgos", "Le da la razón a quien pregunta: pedile «contestá fuerte» y lo hará."],
          ["Una sola posición", "Refuerza una tesis sin examinar alternativas."],
          ["Afirmaciones sin respaldo", "Importes, fechas o hechos que no están en los documentos."],
          ["Confidencialidad", "Qué datos personales usamos, con qué herramienta y para qué."],
        ].map(([t, d], i) => (
          <div key={t} className="tf-sube rounded-xl border border-dg-linea bg-dg-hoja px-4 py-3" style={retraso(i * 0.08)}>
            <p className="font-semibold text-dg-lacre">{t}</p>
            <p className="text-[0.98rem] leading-snug text-dg-tinta">{d}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6">
        <Unidad i={0} label="La generación rápida">
          <p className="mb-2 flex items-baseline justify-between text-[1.1rem] text-dg-tinta">
            <span className="dg-serif text-[1.6rem]">Generación rápida</span>
            <span className="dg-maquina text-dg-lacre">≈ 42 min en total</span>
          </p>
          {barra(rapida)}
        </Unidad>
        <Unidad i={1} label="La producción por etapas">
          <p className="mb-2 flex items-baseline justify-between text-[1.1rem] text-dg-tinta">
            <span className="dg-serif text-[1.6rem]">Producción por etapas, con control</span>
            <span className="dg-maquina text-dg-verde">≈ 24 min en total</span>
          </p>
          {barra(etapas)}
          <p className="mt-4 text-[1.15rem] leading-snug text-dg-pizarra">
            La eficiencia se mide por el <b className="text-dg-tinta">esfuerzo total</b>: preparar, revisar y corregir. <span className="text-[0.9rem] text-dg-niebla">(tiempos ilustrativos)</span>
          </p>
        </Unidad>
      </div>
    </div>
  );
}

// 24 · No delegamos la decisión. Rediseñamos el trabajo. — el recorrido y las seis visualizaciones de la sala
function Cierre(_: P) {
  const circuito = ["Encargo", "Antecedentes", "Esquema", "Argumento", "Revisión", "Automatización"];
  return (
    <div className="grid flex-1 grid-cols-[0.9fr_1.1fr] gap-8">
      <div className="flex flex-col justify-center gap-5">
        <p className="dg-serif text-[1.4rem] italic text-dg-niebla">
          Al inicio: <span className="line-through decoration-dg-lacre">«Redactá un escrito que sostenga que acreditan el pago total.»</span>
        </p>
        <Unidad i={0} label="El circuito organizado" className="grid grid-cols-3 gap-2">
          {circuito.map((c, i) => (
            <span key={c} className="flex items-center gap-2 rounded-xl border border-dg-verde/40 bg-dg-salvia-claro px-3 py-2 text-[1.05rem] text-dg-tinta">
              <span className="dg-maquina text-[0.8rem] text-dg-verde">{i + 1}</span>
              {c}
              {i !== 5 && <GlifoPersona className="ml-auto size-5 text-dg-verde" />}
            </span>
          ))}
        </Unidad>
        <Unidad i={1} label="La frase final">
          <p className="dg-titular border-l-4 border-dg-lacre pl-5 text-[2.3rem] text-dg-tinta">{DG_FRASE_FINAL}</p>
        </Unidad>
      </div>
      <div className="grid grid-cols-2 grid-rows-3 gap-3">
        {DG_ACTIVIDADES.map((a) => (
          <Mini key={a.key} act={a} />
        ))}
      </div>
    </div>
  );
}

function Mini({ act }: { act: DgActividad }) {
  const datos = useDatos(act, 8000);
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-dg-linea bg-dg-hoja px-3 py-2">
      <p className="flex items-baseline justify-between gap-2 text-[0.72rem]">
        <span className="font-semibold text-dg-ocre">
          {act.numero} · {act.titulo}
        </span>
        <span className="shrink-0 text-dg-niebla tabular-nums">{datos?.responded ?? 0} resp.</span>
      </p>
      <div className="mt-1 flex min-h-0 flex-1 flex-col justify-center">
        <Visualizacion act={act} datos={datos} compacto alto={5} />
      </div>
    </div>
  );
}

export const CUERPOS_B = {
  puentes: Puentes,
  adversarial: Adversarial,
  palabra: Palabra,
  "giro-repite": GiroRepite,
  "caso-uso": CasoUso,
  domicilio: Domicilio,
  "plantilla-ia": PlantillaIa,
  formulario: Formulario,
  "giro-detenerse": GiroDetenerse,
  calidad: Calidad,
  costo: Costo,
  cierre: Cierre,
} as const;

