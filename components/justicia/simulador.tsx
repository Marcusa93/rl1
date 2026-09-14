"use client";

// Actividad final de la masterclass: "Un conflicto. Un clic. Dos formas de
// resolverlo" (≈5 minutos). Simulador de decisiones con un caso ficticio
// precargado: el público vota qué mirar primero (celular o mano alzada), el
// docente elige con un clic, activa funciones de IA con respuestas preparadas
// y cierra comparando los dos caminos. No hay que escribir prompts en vivo.

import { useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { DocumentoCaso } from "@/components/taller/piezas";
import { rem } from "@/lib/remoto";
import { TAL_DOCS } from "@/lib/taller-caso";
import { cn } from "@/lib/utils";

type Camino = "mensajes" | "contrato";
type Uso = "juicio" | "acuerdo";
type Paso = "inicio" | "voto" | "doc" | "uso" | "comparacion";
type FuncionIA = "contextualizar" | "clausula" | "expediente" | "alternativas";

const PASOS: { id: Paso; label: string }[] = [
  { id: "inicio", label: "Caso" },
  { id: "voto", label: "Votación" },
  { id: "doc", label: "Documento e IA" },
  { id: "uso", label: "Uso" },
  { id: "comparacion", label: "Comparación" },
];

/** Instrucción preparada que "va" a la IA y respuesta de respaldo de cada botón. */
const IA: Record<FuncionIA, { boton: string; instruccion: string; aviso: string }> = {
  contextualizar: {
    boton: "IA: contextualizar la comunicación",
    instruccion:
      "Con base solo en la conversación completa, separe en tres columnas: lo que el mensaje dice expresamente, lo que puede inferirse y lo que falta verificar. No decida quién tiene razón.",
    aviso: "La IA no decide quién tiene razón: evita que una frase aislada se trate como una conclusión definitiva.",
  },
  clausula: {
    boton: "IA: examinar la cláusula",
    instruccion:
      "Identifique en la cláusula las obligaciones, las condiciones para el pago y las cuestiones abiertas. Señale posibles lecturas; no interprete en forma definitiva.",
    aviso: "No interpreta el contrato de manera definitiva: señala lecturas y preguntas que el profesional debe seguir analizando.",
  },
  expediente: {
    boton: "IA: organizar el expediente",
    instruccion:
      "Ordene qué afirma cada parte, qué documentos respaldan cada afirmación, cuáles son los hechos controvertidos, qué prueba falta y qué debería resolver un juez.",
    aviso: "Es una estructura inicial del expediente: no es una sentencia ni una conclusión automática.",
  },
  alternativas: {
    boton: "IA: explorar alternativas de acuerdo",
    instruccion: "Convierta las necesidades de cada parte en opciones concretas de negociación. No proponga quién cede: ofrezca alternativas para conversar.",
    aviso: "Es una base de conversación: no es un acuerdo impuesto por la IA.",
  },
};

const COMPARACION: Record<Camino, { info: string; ia: string; juicio: string; acuerdo: string }> = {
  mensajes: {
    info: "Mensaje aislado y conversación completa",
    ia: "Contextualizar la comunicación",
    juicio: "Probar qué fue realmente aceptado y qué sigue controvertido",
    acuerdo: "Aclarar el malentendido sin buscar culpables",
  },
  contrato: {
    info: "Cláusula contractual y condiciones técnicas",
    ia: "Examinar la obligación",
    juicio: "Determinar si el saldo ya es exigible",
    acuerdo: "Proponer el pago del saldo contra la instalación",
  },
};

const OTRO: Record<Camino, Camino> = { mensajes: "contrato", contrato: "mensajes" };
const NOMBRE: Record<Camino, string> = { mensajes: "los mensajes", contrato: "el contrato" };

export function SimuladorConflicto({ slug, activity, intervalo }: { slug: string; activity: string; intervalo: number }) {
  const [paso, setPaso] = useState<Paso>("inicio");
  const [eligio, setEligio] = useState<Camino | null>(null);
  const [camino, setCamino] = useState<Camino>("mensajes");
  const [contexto, setContexto] = useState(false);
  const [iaUsada, setIaUsada] = useState<FuncionIA[]>([]);
  const [uso, setUso] = useState<Uso | null>(null);

  const alternativa = eligio !== null && camino !== eligio;

  function elegir(c: Camino) {
    setEligio(c);
    setCamino(c);
    setContexto(false);
    setPaso("doc");
  }
  function verAlternativa() {
    if (!eligio) return;
    setCamino(OTRO[eligio]);
    setContexto(false);
    setPaso("doc");
  }
  const activarIA = (f: FuncionIA) => setIaUsada((u) => (u.includes(f) ? u : [...u, f]));

  return (
    <div className="flex flex-col gap-4">
      <Encabezado paso={paso} onPaso={(p) => (p === "inicio" || p === "voto" || eligio) && setPaso(p)} />

      {paso === "inicio" && <Inicio onComenzar={() => setPaso("voto")} />}

      {paso === "voto" && <Votacion slug={slug} activity={activity} intervalo={intervalo} onElegir={elegir} />}

      {paso === "doc" && (
        <div className="rise flex flex-col gap-4">
          {alternativa && (
            <p className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-base text-amber-200">
              ↺ Lo que habría pasado si miraban primero {NOMBRE[camino]}
            </p>
          )}
          {camino === "mensajes" ? (
            <DocMensajes
              contexto={contexto}
              onContexto={() => setContexto(true)}
              ia={iaUsada.includes("contextualizar")}
              onIA={() => activarIA("contextualizar")}
            />
          ) : (
            <DocContrato ia={iaUsada.includes("clausula")} onIA={() => activarIA("clausula")} />
          )}
          <div className="flex flex-wrap justify-between gap-3">
            <Boton variante="suave" onClick={() => setPaso("voto")}>
              ← Volver a la decisión
            </Boton>
            {alternativa ? (
              <Boton onClick={() => setPaso("comparacion")}>Volver a la comparación →</Boton>
            ) : (
              <Boton onClick={() => setPaso("uso")}>¿Para qué usamos esta información? →</Boton>
            )}
          </div>
        </div>
      )}

      {paso === "uso" && (
        <div className="rise flex flex-col gap-4">
          <Usos
            uso={uso}
            onUso={(u) => {
              setUso(u);
              activarIA(u === "juicio" ? "expediente" : "alternativas");
            }}
          />
          <div className="flex flex-wrap justify-between gap-3">
            <Boton variante="suave" onClick={() => setPaso("doc")}>
              ← Volver al documento
            </Boton>
            <Boton onClick={() => setPaso("comparacion")}>Ver la comparación →</Boton>
          </div>
        </div>
      )}

      {paso === "comparacion" && eligio && (
        <div className="rise flex flex-col gap-4">
          <Comparacion eligio={eligio} />
          <div className="flex flex-wrap justify-between gap-3">
            <Boton variante="suave" onClick={() => setPaso("uso")}>
              ← Volver al uso
            </Boton>
            <Boton variante="alterna" onClick={verAlternativa} remoto={`↺ Ver qué habría pasado con ${NOMBRE[OTRO[eligio]]}`}>
              ↺ Ver qué habría pasado con {NOMBRE[OTRO[eligio]]}
            </Boton>
          </div>
        </div>
      )}

      {eligio && (
        <p className="text-sm text-faint">
          Eligieron: <b className="text-muted">{NOMBRE[eligio]}</b>
          {iaUsada.length > 0 && (
            <>
              {" "}
              · IA: <span className="text-muted">{iaUsada.map((f) => IA[f].boton.replace("IA: ", "")).join(", ")}</span>
            </>
          )}
          {uso && (
            <>
              {" "}
              · Camino: <span className="text-muted">{uso === "juicio" ? "que decida un tercero" : "solución negociada"}</span>
            </>
          )}
        </p>
      )}
    </div>
  );
}

// --- Piezas ------------------------------------------------------------------

function Encabezado({ paso, onPaso }: { paso: Paso; onPaso: (p: Paso) => void }) {
  const i = PASOS.findIndex((p) => p.id === paso);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {PASOS.map((p, j) => (
          <button
            key={p.id}
            onClick={() => onPaso(p.id)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition sm:text-sm",
              j === i ? "border-teal/60 bg-teal/15 text-teal" : j < i ? "border-line text-muted" : "border-line/60 text-faint",
            )}
          >
            {j + 1}. {p.label}
          </button>
        ))}
      </div>
      <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-200">
        Simulación · hechos ficticios
      </span>
    </div>
  );
}

function Boton({
  children,
  onClick,
  variante = "principal",
  className,
  remoto,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variante?: "principal" | "suave" | "ia" | "alterna";
  className?: string;
  /** Etiqueta para el control remoto (por defecto, el texto del botón). */
  remoto?: string;
}) {
  return (
    <button
      onClick={onClick}
      {...rem(remoto ?? (typeof children === "string" ? children : "Botón"))}
      className={cn(
        "rounded-2xl px-5 py-3 text-base font-semibold transition active:scale-[0.98] sm:text-lg",
        variante === "principal" && "bg-gradient-to-r from-teal to-cyan text-ink hover:brightness-110",
        variante === "suave" && "border border-line bg-panel/60 text-muted hover:text-teal",
        variante === "ia" && "border border-violet/60 bg-violet/15 text-violet-200 hover:bg-violet/25",
        variante === "alterna" && "border border-amber-400/60 bg-amber-400/10 text-amber-200 hover:bg-amber-400/20",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Inicio({ onComenzar }: { onComenzar: () => void }) {
  return (
    <div className="rise flex flex-col gap-5">
      <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
        Un conflicto. Un clic. <span className="text-gradient">Dos formas de resolverlo.</span>
      </h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <p className="text-4xl">☕</p>
          <p className="mt-2 text-2xl font-bold">Lucía</p>
          <p className="mt-1 text-lg leading-snug text-muted">
            Abre su cafetería <b className="text-foreground">el viernes</b>. Contrató la entrega e instalación de los equipos por{" "}
            <b className="text-foreground">US$ 3.000</b>.
          </p>
          <p className="mt-3 rounded-xl border border-line bg-ink-2/60 px-4 py-2 text-lg italic">«Recibí las cajas, pero todavía no funciona.»</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <p className="text-4xl">🔧</p>
          <p className="mt-2 text-2xl font-bold">Diego</p>
          <p className="mt-1 text-lg leading-snug text-muted">
            Entregó los equipos. Falta <b className="text-foreground">un módulo</b> para que la máquina de hielo funcione. Necesita cobrar para conseguirlo.
          </p>
          <p className="mt-3 rounded-xl border border-line bg-ink-2/60 px-4 py-2 text-lg italic">«Cumplí con la entrega. Corresponde el saldo.»</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Boton onClick={onComenzar}>Comenzar →</Boton>
      </div>
    </div>
  );
}

function Votacion({
  slug,
  activity,
  intervalo,
  onElegir,
}: {
  slug: string;
  activity: string;
  intervalo: number;
  onElegir: (c: Camino) => void;
}) {
  const { data } = useResultados(slug, activity, intervalo);
  const counts = (data?.summary?.counts as Record<string, number>) ?? {};
  const opciones: { id: Camino; emoji: string; label: string }[] = [
    { id: "mensajes", emoji: "💬", label: "Ver los mensajes" },
    { id: "contrato", emoji: "📄", label: "Ver el contrato" },
  ];
  return (
    <div className="rise flex flex-col gap-5">
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">Si tuvieran que empezar a trabajar este caso, ¿qué mirarían primero?</h2>
      <p className="text-lg text-muted">Voten en el celular o a mano alzada. Después elijo con un clic.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {opciones.map((o) => (
          <button
            key={o.id}
            onClick={() => onElegir(o.id)}
            {...rem(`${o.emoji} ${o.label}`)}
            className="glass group flex flex-col items-center gap-3 rounded-3xl border-2 border-line p-8 transition hover:border-teal/70 hover:brightness-125"
          >
            <span className="text-6xl">{o.emoji}</span>
            <span className="text-2xl font-bold uppercase tracking-wide group-hover:text-teal sm:text-3xl">{o.label}</span>
            <span className="font-mono text-lg text-faint">
              <b className="text-2xl text-teal">{counts[o.id] ?? 0}</b> votos
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/** Botón de IA con "procesando…" y la respuesta preparada debajo. */
function BloqueIA({ funcion, activa, onActivar, children }: { funcion: FuncionIA; activa: boolean; onActivar: () => void; children: React.ReactNode }) {
  const [cargando, setCargando] = useState(false);
  const [verInstruccion, setVerInstruccion] = useState(false);

  function activar() {
    if (cargando) return;
    setCargando(true);
    // Pausa breve de "procesando": la respuesta es la preparada.
    setTimeout(() => {
      setCargando(false);
      onActivar();
    }, 1100);
  }

  if (!activa)
    return (
      <div className="flex flex-wrap items-center gap-3">
        <Boton variante="ia" onClick={activar} remoto={`✨ ${IA[funcion].boton}`}>
          {cargando ? "✨ Analizando…" : `✨ ${IA[funcion].boton}`}
        </Boton>
        <button
          onClick={() => setVerInstruccion((v) => !v)}
          className="text-sm text-faint underline-offset-4 hover:text-muted hover:underline"
          {...rem("📝 Instrucción preparada", verInstruccion)}
        >
          {verInstruccion ? "ocultar instrucción" : "ver la instrucción preparada"}
        </button>
        {verInstruccion && <p className="w-full rounded-xl border border-line bg-ink-2/60 p-3 font-mono text-sm text-muted">{IA[funcion].instruccion}</p>}
      </div>
    );

  return (
    <div className="rise flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-full bg-violet/20 px-3 py-1 font-semibold text-violet-200">✨ {IA[funcion].boton}</span>
        <span className="text-faint">Ejemplo preparado para la demostración</span>
      </div>
      {children}
      <p className="text-base italic text-muted">{IA[funcion].aviso}</p>
    </div>
  );
}

function Tarjeta({ titulo, color, children }: { titulo: string; color: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4">
      <p className={cn("text-xs font-bold uppercase tracking-wider", color)}>{titulo}</p>
      <div className="mt-2 text-lg leading-snug">{children}</div>
    </div>
  );
}

function DocMensajes({ contexto, onContexto, ia, onIA }: { contexto: boolean; onContexto: () => void; ia: boolean; onIA: () => void }) {
  return (
    <>
      {!contexto ? (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          {/* La misma captura que usa el taller (Documento 1). */}
          <DocumentoCaso doc={TAL_DOCS.D1} grande marcas={{ 0: "clave" }} />
          <div className="flex flex-col justify-center gap-3">
            <p className="rounded-xl border border-rose-400/40 bg-rose-400/10 p-4 text-lg">
              <b className="text-rose-300">Diego interpreta:</b> «La cliente confirmó que recibió la prestación. Corresponde pagar el saldo.»
            </p>
            <p className="text-xl font-semibold leading-snug">¿Alcanza esta captura para afirmar que Lucía aceptó definitivamente el cumplimiento?</p>
            <div>
              <Boton onClick={onContexto}>Mostrar contexto</Boton>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* La misma conversación completa que usa el taller (Documento 2). */}
          <DocumentoCaso doc={TAL_DOCS.D2} grande marcas={{ 1: "clave", 2: "contexto", 4: "contexto" }} />
          <div className="flex flex-col gap-3">
            <p className="text-lg leading-snug text-muted">
              Lucía hablaba de <b className="text-foreground">las cajas</b>. Faltaban la revisión, la instalación y la prueba de funcionamiento.
            </p>
            <BloqueIA funcion="contextualizar" activa={ia} onActivar={onIA}>
              <div className="grid gap-3">
                <Tarjeta titulo="Lo que el mensaje dice" color="text-cyan">
                  Se recibieron los elementos entregados.
                </Tarjeta>
                <Tarjeta titulo="Lo que puede inferirse" color="text-violet">
                  Lucía pudo haber aceptado solamente la recepción física.
                </Tarjeta>
                <Tarjeta titulo="Lo que falta verificar" color="text-amber-300">
                  Si la instalación estaba completa y si los equipos funcionaban.
                </Tarjeta>
              </div>
            </BloqueIA>
          </div>
        </div>
      )}
    </>
  );
}

function DocContrato({ ia, onIA }: { ia: boolean; onIA: () => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-3">
        <div className="rounded-2xl border border-line bg-white p-5 text-zinc-800">
          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Contrato de provisión e instalación · Cláusula 3</p>
          <p className="mt-2 font-serif text-xl leading-relaxed sm:text-2xl">
            «El proveedor deberá <mark className="bg-amber-200 px-1">entregar e instalar</mark> los equipos{" "}
            <mark className="bg-amber-200 px-1">en condiciones de funcionamiento</mark>. El saldo se abonará una vez realizada la instalación y{" "}
            <mark className="bg-amber-200 px-1">comprobado el funcionamiento</mark>.»
          </p>
        </div>
        <p className="text-xl font-semibold leading-snug">¿La entrega de las cajas equivale al cumplimiento total de la obligación?</p>
      </div>
      <BloqueIA funcion="clausula" activa={ia} onActivar={onIA}>
        <ul className="glass space-y-2 rounded-2xl p-4 text-lg leading-snug">
          <li>• La obligación comprende entrega, instalación y funcionamiento.</li>
          <li>• El contrato vincula el pago final con una verificación.</li>
          <li>• Hay que determinar quién debía conseguir el módulo faltante.</li>
          <li>• Revisar si la conexión eléctrica del local estaba incluida o correspondía a Lucía.</li>
        </ul>
      </BloqueIA>
    </div>
  );
}

function Usos({ uso, onUso }: { uso: Uso | null; onUso: (u: Uso) => void }) {
  return (
    <>
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">La misma información, dos usos posibles</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn("glass flex flex-col gap-3 rounded-2xl p-5", uso === "juicio" && "ring-2 ring-teal/60")}>
          <p className="text-2xl font-bold">⚖️ Si se busca que un tercero decida</p>
          <BloqueIA funcion="expediente" activa={uso === "juicio"} onActivar={() => onUso("juicio")}>
            <ul className="space-y-1.5 text-lg leading-snug">
              <li>
                <b className="text-cyan">Posiciones:</b> Diego reclama el saldo por la entrega; Lucía sostiene que falta instalar y probar.
              </li>
              <li>
                <b className="text-cyan">Documentos:</b> contrato (cláusula 3), conversación de lunes y martes, remito de entrega.
              </li>
              <li>
                <b className="text-cyan">Controvertido:</b> si «recibimos todo» fue aceptación; quién debía el módulo.
              </li>
              <li>
                <b className="text-cyan">Prueba pendiente:</b> constatación del funcionamiento y detalle del pedido.
              </li>
              <li>
                <b className="text-cyan">Para el juez:</b> si el saldo es exigible antes de la instalación.
              </li>
            </ul>
          </BloqueIA>
        </div>
        <div className={cn("glass flex flex-col gap-3 rounded-2xl p-5", uso === "acuerdo" && "ring-2 ring-teal/60")}>
          <p className="text-2xl font-bold">🤝 Si se busca una solución negociada</p>
          <BloqueIA funcion="alternativas" activa={uso === "acuerdo"} onActivar={() => onUso("acuerdo")}>
            <ul className="space-y-1.5 text-lg leading-snug">
              <li>
                <b className="text-emerald-300">Lucía necesita:</b> abrir el viernes.
              </li>
              <li>
                <b className="text-emerald-300">Diego necesita:</b> cobrar para conseguir el módulo.
              </li>
              <li>
                <b className="text-emerald-300">Opción 1:</b> pago parcial ahora, contra instalación del módulo antes del viernes.
              </li>
              <li>
                <b className="text-emerald-300">Opción 2:</b> un equipo provisorio para la apertura.
              </li>
              <li>
                <b className="text-emerald-300">Opción 3:</b> el saldo, después de comprobar el funcionamiento.
              </li>
            </ul>
          </BloqueIA>
        </div>
      </div>
    </>
  );
}

function Comparacion({ eligio }: { eligio: Camino }) {
  const filas: Camino[] = ["mensajes", "contrato"];
  return (
    <>
      <h2 className="text-2xl font-bold leading-tight sm:text-3xl">El mismo conflicto, dos recorridos</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-separate border-spacing-y-2 text-left text-base sm:text-lg">
          <thead>
            <tr className="text-xs uppercase tracking-wider text-faint">
              <th className="px-3">Información examinada</th>
              <th className="px-3">Uso de IA</th>
              <th className="px-3">⚖️ Uso judicial</th>
              <th className="px-3">🤝 En mediación</th>
            </tr>
          </thead>
          <tbody>
            {filas.map((c) => (
              <tr key={c} className={cn("glass", c === eligio ? "outline outline-2 outline-teal/60" : "opacity-80")}>
                <td className="rounded-l-xl px-3 py-3 font-semibold">
                  {c === eligio && <span className="mr-1.5 text-teal">●</span>}
                  {COMPARACION[c].info}
                </td>
                <td className="px-3 py-3 text-violet-200">{COMPARACION[c].ia}</td>
                <td className="px-3 py-3">{COMPARACION[c].juicio}</td>
                <td className="rounded-r-xl px-3 py-3">{COMPARACION[c].acuerdo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mx-auto max-w-4xl text-center text-xl italic leading-relaxed text-muted sm:text-2xl">
        «El conflicto era el mismo. Lo que cambió fue la información que decidimos mirar y la finalidad con la que usamos la herramienta.»
      </p>
    </>
  );
}
