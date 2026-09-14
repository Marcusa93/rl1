"use client";

// Mini demostraciones de "Lo que la justicia puede construir": al tocar cada
// tarjeta se ve, en chiquito, cómo funcionaría ese sistema. Todo es un
// ejemplo ilustrativo con datos ficticios y animación local (sin red).

import { useEffect, useState } from "react";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

export type DemoId = "jurisprudencia" | "redaccion" | "agentes" | "jurimetria" | "lenguaje";

export function DemoSistema({ id }: { id: DemoId }) {
  const D: Record<DemoId, () => React.ReactNode> = {
    jurisprudencia: DemoJurisprudencia,
    redaccion: DemoRedaccion,
    agentes: DemoAgentes,
    jurimetria: DemoJurimetria,
    lenguaje: DemoLenguaje,
  };
  return (
    <div className="mt-3 rounded-2xl border border-line bg-ink-2/70 p-4">
      {D[id]()}
      <p className="mt-3 text-right text-[11px] text-faint">Ejemplo ilustrativo · datos ficticios</p>
    </div>
  );
}

/** Revela pasos de a uno: devuelve cuántos ya se mostraron. */
function usePasos(total: number, ms: number, clave: unknown = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((x) => (x >= total ? x : x + 1)), ms);
    return () => clearInterval(id);
  }, [total, ms, clave]);
  return n;
}

/** Escribe un texto letra por letra. */
function useTipeo(texto: string, ms = 22, clave: unknown = 0) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((x) => (x >= texto.length ? x : x + 2)), ms);
    return () => clearInterval(id);
  }, [texto, ms, clave]);
  return texto.slice(0, n);
}

function Repetir({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} {...rem("↺ Repetir la demostración")} className="text-xs text-faint hover:text-teal">
      ↺ repetir
    </button>
  );
}

// --- Búsqueda de jurisprudencia ------------------------------------------------------

const FALLOS = [
  {
    ref: "Cámara de Familia · Ref. 214-CF-2024",
    extracto: "…aun sin constancia de salario, la capacidad económica del alimentante puede acreditarse con indicios: su actividad, sus gastos y su nivel de vida…",
    rel: 94,
    tags: ["cuota alimenticia", "ingresos informales"],
  },
  {
    ref: "Juzgado de Familia · Ref. 1187-JF-2023",
    extracto: "…fijó la cuota a partir de los gastos acreditados del niño y de los ingresos presumibles del padre, que trabaja por cuenta propia…",
    rel: 88,
    tags: ["prueba indiciaria"],
  },
  {
    ref: "Sala de lo Civil · Ref. 36-SC-2022",
    extracto: "…la falta de un empleo formal no exime de la obligación alimentaria ni impide estimar razonablemente la capacidad de pago…",
    rel: 81,
    tags: ["obligación alimentaria"],
  },
];

function DemoJurisprudencia() {
  const [vuelta, setVuelta] = useState(0);
  const consulta = useTipeo("padre sin salario fijo que no paga la cuota alimenticia", 28, vuelta);
  const listo = consulta.length > 50;
  const n = usePasos(listo ? FALLOS.length : 0, 450, `${vuelta}-${listo}`);
  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl border border-teal/50 bg-panel px-3 py-2">
        <span>🔎</span>
        <span className="min-w-0 flex-1 truncate font-mono text-sm sm:text-base">
          {consulta}
          <span className="animate-pulse text-teal">▍</span>
        </span>
        <Repetir onClick={() => setVuelta((v) => v + 1)} />
      </div>
      <p className="mt-2 text-xs text-faint">
        {listo ? "Búsqueda por significado · 3 resultados más relevantes de 1.284 resoluciones" : "Escribiendo la consulta en lenguaje natural…"}
      </p>
      <div className="mt-2 space-y-2">
        {FALLOS.slice(0, n).map((f) => (
          <div key={f.ref} className="rise rounded-xl border border-line bg-panel/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-teal">{f.ref}</p>
              <span className="shrink-0 rounded-full bg-teal/15 px-2 py-0.5 font-mono text-xs text-teal">{f.rel}%</span>
            </div>
            <p className="mt-1 text-sm leading-snug text-muted">{f.extracto}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {f.tags.map((t) => (
                <span key={t} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-faint">
                  {t}
                </span>
              ))}
              <span className="ml-auto text-xs text-violet-200">Ver fallo completo ↗</span>
            </div>
          </div>
        ))}
      </div>
      {n === FALLOS.length && (
        <p className="rise mt-2 text-sm text-muted">Encuentra por el contenido, aunque el fallo no use las mismas palabras que la consulta.</p>
      )}
    </div>
  );
}

// --- Asistencia en redacción -------------------------------------------------------------

const CAMPOS = [
  { k: "Expediente", v: "PGR-FAM-0457-2026" },
  { k: "Destinatario", v: "Registro de la Propiedad Raíz e Hipotecas" },
  { k: "Inmueble", v: "matrícula 60012345-00000" },
  { k: "Pedido", v: "informe de titularidad" },
];

const BORRADOR: { t: string; campo?: boolean }[] = [
  { t: "San Salvador, 14 de septiembre de 2026.\n\nSeñor Registrador:\n\nEn el expediente " },
  { t: "PGR-FAM-0457-2026", campo: true },
  { t: ", solicito que informe quién figura como titular del inmueble inscrito bajo la " },
  { t: "matrícula 60012345-00000", campo: true },
  { t: " y si registra embargos o gravámenes.\n\nLa información se requiere para determinar la capacidad económica del alimentante." },
];

function DemoRedaccion() {
  const [vuelta, setVuelta] = useState(0);
  const campos = usePasos(CAMPOS.length, 350, vuelta);
  const partes = usePasos(campos >= CAMPOS.length ? BORRADOR.length : 0, 500, `${vuelta}-${campos >= CAMPOS.length}`);
  return (
    <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan">Plantilla · Oficio al Registro</p>
          <Repetir onClick={() => setVuelta((v) => v + 1)} />
        </div>
        <div className="mt-2 space-y-1.5">
          {CAMPOS.map((c, i) => (
            <div key={c.k} className={cn("rounded-lg border px-2.5 py-1.5 text-sm transition", i < campos ? "border-cyan/50 bg-cyan/10" : "border-line")}>
              <span className="text-xs text-faint">{c.k}: </span>
              {i < campos ? c.v : "…"}
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">Los datos salen del expediente, no de la memoria del modelo.</p>
      </div>
      <div className="rounded-xl bg-white p-4 font-serif text-sm leading-relaxed text-zinc-800 sm:text-base">
        <p className="mb-2 font-sans text-[11px] font-bold uppercase tracking-wider text-amber-600">Borrador · requiere revisión y firma</p>
        <p className="whitespace-pre-wrap">
          {BORRADOR.slice(0, partes).map((p, i) =>
            p.campo ? (
              <mark key={i} className="bg-amber-200 px-0.5">
                {p.t}
              </mark>
            ) : (
              <span key={i}>{p.t}</span>
            ),
          )}
          {partes < BORRADOR.length && <span className="animate-pulse">▍</span>}
        </p>
      </div>
    </div>
  );
}

// --- Agentes por temática ------------------------------------------------------------------

const AGENTES = {
  familia: {
    emoji: "👨‍👩‍👧",
    nombre: "Familia",
    pregunta: "¿Qué necesito para pedir una cuota alimenticia para mi hijo?",
    respuesta: "Según la guía de trámites de la institución: la partida de nacimiento, su documento de identidad y los comprobantes de gastos del niño. Puede iniciar el trámite sin abogado.",
    fuente: "Guía de trámites de familia (cargada por la institución)",
  },
  laboral: {
    emoji: "💼",
    nombre: "Laboral",
    pregunta: "Me despidieron sin darme una razón. ¿Qué puedo reclamar?",
    respuesta: "Según los criterios cargados: indemnización, salarios pendientes y la parte proporcional de vacaciones y aguinaldo. Una persona de la defensoría revisará su caso.",
    fuente: "Criterios de la unidad laboral (cargados por la institución)",
  },
  consumo: {
    emoji: "🛒",
    nombre: "Consumo",
    pregunta: "Compré una refrigeradora y no enfría. ¿Qué hago?",
    respuesta: "Puede pedir la reparación, el cambio o la devolución. Guarde la factura y la garantía, y reclame primero por escrito al comercio.",
    fuente: "Guía de reclamos de consumo (cargada por la institución)",
  },
};
type Agente = keyof typeof AGENTES;

function DemoAgentes() {
  const [agente, setAgente] = useState<Agente>("familia");
  const a = AGENTES[agente];
  const respuesta = useTipeo(a.respuesta, 18, agente);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {(Object.keys(AGENTES) as Agente[]).map((k) => (
          <button
            key={k}
            onClick={() => setAgente(k)}
            {...rem(`${AGENTES[k].emoji} Agente de ${AGENTES[k].nombre.toLowerCase()}`, agente === k)}
            className={cn(
              "rounded-full border px-3 py-1 text-sm transition",
              agente === k ? "border-teal bg-teal/15 text-teal" : "border-line text-muted hover:border-teal/50",
            )}
          >
            {AGENTES[k].emoji} {AGENTES[k].nombre}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-col gap-2">
        <p className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-panel-2 px-3.5 py-2 text-sm sm:text-base">{a.pregunta}</p>
        <div className="max-w-[92%] rounded-2xl rounded-tl-sm border border-teal/40 bg-teal/10 px-3.5 py-2">
          <p className="text-xs font-semibold text-teal">
            {a.emoji} Agente de {a.nombre.toLowerCase()}
          </p>
          <p className="text-sm leading-snug sm:text-base">
            {respuesta}
            {respuesta.length < a.respuesta.length && <span className="animate-pulse">▍</span>}
          </p>
          {respuesta.length >= a.respuesta.length && <p className="rise mt-1.5 text-xs text-faint">📌 Fuente: {a.fuente}</p>}
        </div>
      </div>
      <p className="mt-2 text-xs text-faint">Responde solo desde normas y criterios de la institución, y deriva a una persona cuando hace falta.</p>
    </div>
  );
}

// --- Jurimetría ------------------------------------------------------------------------------

const RESULTADOS = [
  { label: "Acuerdo en mediación", pct: 68, meses: "3,1 meses", color: "bg-teal" },
  { label: "Sentencia", pct: 24, meses: "9,4 meses", color: "bg-violet" },
  { label: "Desistimiento", pct: 8, meses: "2,0 meses", color: "bg-faint" },
];

function DemoJurimetria() {
  const [vuelta, setVuelta] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    setPct(0);
    const id = setInterval(() => setPct((p) => (p >= 68 ? 68 : p + 2)), 30);
    return () => clearInterval(id);
  }, [vuelta]);
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5">
        {["Familia", "Cuota alimenticia", "Primera solicitud", "San Salvador", "2023–2025"].map((f) => (
          <span key={f} className="rounded-full border border-cyan/40 bg-cyan/10 px-2.5 py-0.5 text-xs text-cyan">
            {f}
          </span>
        ))}
        <span className="ml-auto">
          <Repetir onClick={() => setVuelta((v) => v + 1)} />
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-x-4 gap-y-1">
        <p className="font-mono text-5xl font-bold text-teal sm:text-6xl">{pct}%</p>
        <p className="pb-1 text-base leading-snug sm:text-lg">
          de los <b>412 casos similares</b> se resolvió con <b className="text-teal">acuerdo en mediación</b>.
        </p>
      </div>
      <div className="mt-3 space-y-1.5">
        {RESULTADOS.map((r) => (
          <div key={r.label} className="flex items-center gap-2 text-sm">
            <span className="w-40 shrink-0 truncate">{r.label}</span>
            <div className="h-5 flex-1 overflow-hidden rounded bg-panel">
              <div className={cn("h-full rounded transition-all duration-1000", r.color)} style={{ width: `${pct ? r.pct : 0}%` }} />
            </div>
            <span className="w-10 text-right font-mono text-xs">{r.pct}%</span>
            <span className="hidden w-20 text-right text-xs text-faint sm:block">{r.meses}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-faint">
        Sirve para gestionar y rendir cuentas (tiempos, cargas, resultados). No predice cómo se resolverá un caso concreto.
      </p>
    </div>
  );
}

// --- Lenguaje claro ------------------------------------------------------------------------------

function DemoLenguaje() {
  const [claro, setClaro] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  useEffect(() => {
    setClaro(false);
    const t = setTimeout(() => setClaro(true), 1400);
    return () => clearTimeout(t);
  }, [vuelta]);
  return (
    <div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-white p-3.5 font-serif text-sm leading-relaxed text-zinc-700 sm:text-base">
          <p className="mb-1 font-sans text-[11px] font-bold uppercase tracking-wider text-zinc-500">Notificación original</p>
          Por este medio se le notifica que, habiéndose admitido la demanda incoada en su contra, se le emplaza para que dentro del plazo de{" "}
          <mark className="bg-amber-200 px-0.5">diez días hábiles</mark> contados a partir del siguiente al de la notificación, conteste la misma, bajo
          apercibimiento de ley.
        </div>
        <div
          className={cn(
            "rounded-xl border p-3.5 text-sm leading-relaxed transition-all duration-700 sm:text-base",
            claro ? "border-teal/60 bg-teal/10 opacity-100" : "border-line opacity-40",
          )}
        >
          <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-teal">✨ En lenguaje claro</p>
          {claro ? (
            <span className="rise block">
              Le presentaron una demanda. Tiene <mark className="bg-amber-200 px-0.5 text-zinc-900">10 días hábiles</mark> para responderla, contados desde el día
              siguiente a esta notificación. Si no responde, el proceso sigue sin su versión.
            </span>
          ) : (
            <span className="text-faint">Reescribiendo…</span>
          )}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-faint">
          {claro ? "✓ Revisión humana: el plazo, desde cuándo corre y la consecuencia coinciden con el original." : "La IA propone; la persona revisa que diga lo mismo."}
        </p>
        <button
          onClick={() => setVuelta((v) => v + 1)}
          {...rem("↺ Repetir la demostración")}
          className="text-xs text-faint hover:text-teal"
        >
          ↺ repetir
        </button>
      </div>
    </div>
  );
}
