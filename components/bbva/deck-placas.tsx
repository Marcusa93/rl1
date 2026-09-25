"use client";

// Placas de la presentación del Laboratorio BBVA (/bbva/clase).
// "Arqueología contemporánea del trabajo": el protagonista es el trabajo
// (agendas, tickets, planillas, post-its, anotaciones); la IA aparece de a
// poco, como una pieza más. Poco texto, mucho aire.

import { ResultadoActividad, AreasConectadas } from "@/components/bbva/resultados";
import { Ilustracion } from "@/components/bbva/ilustraciones";
import {
  AnilloTexto,
  Bajada,
  BotonesResultados,
  Casillas,
  ChipCelular,
  ContadorVivo,
  dos,
  FlechaMano,
  Folio,
  Hoja,
  Latido,
  Marca,
  MiniQR,
  tamTitulo,
  Titulo,
  useVivo,
  vars,
  type MarcaTitulo,
} from "@/components/bbva/deck-piezas";
import {
  BBVA_LINK,
  BBVA_LOGO,
  BBVA_QR,
  BBVA_RECORRIDO,
  BBVA_SLIDES,
  BBVA_URL,
  getActividadBbva,
  type ActividadBbva,
  type BbvaActivityKey,
  type ResultadosBbva,
  type SlideActividad,
  type SlideBbva,
  type SlideCurva,
  type SlidePlaca,
  type SlideResultado,
} from "@/lib/bbva-clase";
import { cn } from "@/lib/utils";

/** Actividades donde tiene sentido abrir el resultado por área. */
export const CON_POR_AREA: BbvaActivityKey[] = ["bbva_a1", "bbva_a3"];

/** La anotación a mano de cada título (una por placa, nunca más). */
const MARCAS: Partial<Record<number, MarcaTitulo>> = {
  1: { texto: "ayer", tipo: "subraya" },
  2: { texto: "cargo", tipo: "tacha" },
  3: { texto: "Operaciones parecidas.", tipo: "subraya" },
  4: { texto: "tiempo", tipo: "circula" },
  6: { texto: "“Depende”", tipo: "subraya" },
  8: { texto: "equivoca", tipo: "subraya" },
  9: { texto: "revisar", tipo: "circula" },
  11: { texto: "vos", tipo: "circula" },
  13: { texto: "no es una tarea", tipo: "subraya" },
  14: { texto: "anatomía", tipo: "subraya" },
  15: { texto: "IA", tipo: "circula" },
  16: { texto: "Tres formas.", tipo: "subraya" },
  17: { texto: "autonomía", tipo: "subraya" },
  19: { texto: "tu trabajo", tipo: "subraya" },
  20: { texto: "proceso", tipo: "subraya" },
};

const CURVAS = BBVA_SLIDES.filter((s): s is SlideCurva => s.t === "curva");

export interface PropsPlaca {
  slide: SlideBbva;
  revelado: boolean;
  porArea: boolean;
  onRevelar: () => void;
  onPorArea: () => void;
}

export function Placa(p: PropsPlaca) {
  const s = p.slide;
  switch (s.t) {
    case "portada":
      return <Portada />;
    case "ingreso":
      return <Ingreso />;
    case "placa":
      return <PlacaContenido s={s} />;
    case "curva":
      return <PlacaCurva s={s} />;
    case "actividad":
      return <PlacaActividad s={s} {...p} />;
    case "resultado":
      return <PlacaResultado s={s} {...p} />;
    case "cierre":
      return <Cierre />;
  }
}

// --- Portada ------------------------------------------------------------------------

function Portada() {
  return (
    <div className="relative flex h-full flex-col px-[4.5rem] pb-[1.6rem] pt-[2.6rem]">
      <header className="bbva-cae flex items-center gap-[1.2rem]" style={vars({ animationDelay: "0.05s" })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={BBVA_LOGO} alt="BBVA" className="h-[2.3rem] w-auto mix-blend-multiply" />
        <span className="h-[1.9rem] w-px bg-grafito/30" />
        <p className="font-mono text-[0.85rem] uppercase tracking-[0.3em] text-grafito">Laboratorio de IA · Clase inicial</p>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center">
        <div className="relative z-10 max-w-[58rem]">
          <h1 className="bbva-titular text-[7rem] text-tinta">
            <span className="block">¿En qué parte</span>
            <span className="block">
              de mi <Marca tipo="subraya">trabajo</Marca>
            </span>
            <span className="block">tiene sentido</span>
            <span className="block">
              la{" "}
              <span
                className="bbva-cae relative inline-block border-[0.05em] border-pizarra px-[0.12em] align-[0.06em] text-[0.78em] text-pizarra"
                style={vars({ "--rot": "-4deg", animationDelay: "1.1s" })}
              >
                IA
              </span>
              ?
            </span>
          </h1>

          <dl className="mt-[2.4rem] grid grid-cols-[auto_1fr] items-baseline gap-x-[1.4rem] gap-y-[0.5rem]">
            <dt className="font-mono text-[0.75rem] uppercase tracking-[0.28em] text-gris">Chumbita</dt>
            <dd className="bbva-serif text-[1.85rem] italic leading-tight text-gris">¿Cómo trabajar con la IA?</dd>
            <dt className="font-mono text-[0.75rem] uppercase tracking-[0.28em] text-naranja">Ahora</dt>
            <dd className="bbva-serif text-[1.85rem] italic leading-tight text-tinta">
              ¿<span className="bbva-subrayado">Dónde</span> tiene sentido usarla?
            </dd>
          </dl>
        </div>

        <CollageAgenda />
      </div>

      <div className="flex items-end justify-between font-mono text-[0.85rem] uppercase tracking-[0.26em] text-grafito">
        <p>Marco Rossi · 25.09.2026</p>
        <p className="text-[0.7rem] tracking-[0.2em] text-gris">→ avanzar · F pantalla completa</p>
      </div>
    </div>
  );
}

/** Una página de agenda y un post-it: rastros de una jornada. Sin IA. */
function CollageAgenda() {
  const filas: { h: string; t: string; hecho?: boolean; hoy?: boolean }[] = [
    { h: "09:00", t: "mails pendientes (43)", hecho: true },
    { h: "10:30", t: "revisar solicitudes", hecho: true },
    { h: "12:00", t: "planilla de reclamos" },
    { h: "15:00", t: "Laboratorio de IA", hoy: true },
    { h: "17:30", t: "cerrar incidente" },
  ];
  return (
    <div aria-hidden className="absolute right-0 top-1/2 h-[33rem] w-[22rem] -translate-y-1/2">
      <div
        className="bbva-recorte bbva-cae absolute right-[0.5rem] top-[1rem] w-[19rem] px-[1.4rem] pb-[1.6rem] pt-[1.3rem]"
        style={vars({ "--rot": "2.5deg", animationDelay: "0.35s" })}
      >
        <span className="bbva-cinta absolute -top-[0.8rem] left-1/2 h-[1.7rem] w-[6.5rem] -translate-x-1/2 -rotate-2" />
        <div className="flex items-baseline justify-between border-b-2 border-tinta pb-[0.5rem] font-mono uppercase">
          <span className="text-[1.05rem] tracking-[0.14em] text-tinta">Vie 25</span>
          <span className="text-[0.7rem] tracking-[0.24em] text-gris">Septiembre</span>
        </div>
        <ul className="mt-[0.3rem]">
          {filas.map((f) => (
            <li key={f.h} className="flex items-baseline gap-[0.8rem] border-b border-cielo/70 py-[0.45rem]">
              <span className="w-[2.7rem] shrink-0 font-mono text-[0.72rem] text-gris">{f.h}</span>
              <span
                className={cn(
                  "bbva-mano relative text-[1.45rem] leading-none",
                  f.hecho ? "text-gris line-through decoration-grafito/40" : "text-grafito",
                  f.hoy && "text-tinta",
                )}
              >
                {f.hoy ? <Marca tipo="circula" demora={1.4}>{f.t}</Marca> : f.t}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className="bbva-postit bbva-cae absolute bottom-[1.5rem] left-[-1rem] w-[12rem] px-[1.2rem] pb-[1.3rem] pt-[1rem]"
        style={vars({ "--rot": "-5deg", animationDelay: "0.7s" })}
      >
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.2em] text-tinta/60">Reclamo #4127</p>
        <p className="bbva-mano mt-[0.3rem] text-[1.6rem] leading-[1.05] text-tinta">responder hoy, antes de las 18</p>
      </div>

      {/* Un cursor: también trabajamos con ventanas. */}
      <svg
        viewBox="0 0 20 28"
        className="bbva-cae absolute bottom-[9.5rem] right-[1.5rem] h-[2.2rem] w-auto drop-shadow-[0_3px_3px_rgba(0,0,0,0.18)]"
        style={vars({ animationDelay: "0.95s" })}
      >
        <path d="M2 2 L2 22 L7.5 17 L11 25.5 L14.5 24 L11 15.8 L18 15.8 Z" fill="#fbfaf7" stroke="#17181b" strokeWidth={1.6} strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// --- Ingreso --------------------------------------------------------------------------

function Ingreso() {
  const data = useVivo("lobby", 2000);
  return (
    <div className="flex h-full items-center gap-[4.5rem] px-[4.5rem] pb-[1rem] pt-[2rem]">
      <div className="relative shrink-0">
        <div className="bbva-recorte bbva-cae relative p-[1.5rem]" style={vars({ "--rot": "-1.5deg" })}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={BBVA_QR} alt={`Código QR: ${BBVA_URL}`} className="block size-[26rem]" />
          <span className="bbva-cinta absolute -top-[0.9rem] left-[2rem] h-[1.9rem] w-[7rem] -rotate-6" />
          <span className="bbva-cinta absolute -top-[0.9rem] right-[2rem] h-[1.9rem] w-[7rem] rotate-3" />
        </div>
        <div className="absolute -bottom-[3.4rem] left-[1rem] flex items-end gap-[0.4rem]">
          <FlechaMano hacia="arriba" className="h-[3rem] w-auto" demora={0.8} />
          <p className="bbva-mano text-[1.75rem] leading-none text-naranja">con la cámara del celular</p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <Folio rotulo="Ingreso" extra="Un código · toda la clase" />
        <h1 className="bbva-titular mt-[1rem] text-[5.2rem] text-tinta">
          <span className="block">Escaneá y</span>
          <span className="block">
            elegí tu <Marca tipo="subraya">área</Marca>
          </span>
        </h1>

        {/* La dirección, como una barra de navegador. */}
        <div className="bbva-recorte mt-[1.6rem] inline-flex max-w-full items-center gap-[0.8rem] rounded-full px-[1.3rem] py-[0.6rem]">
          <svg aria-hidden viewBox="0 0 16 20" className="h-[1.3rem] w-auto shrink-0 text-grafito">
            <rect x={2} y={8.5} width={12} height={10} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.6} />
            <path d="M5 8.5V6a3 3 0 0 1 6 0v2.5" fill="none" stroke="currentColor" strokeWidth={1.6} />
          </svg>
          <span className="truncate font-mono text-[1.9rem] tracking-tight text-tinta">{BBVA_LINK}</span>
        </div>

        {/* Cuántos entraron y cómo se arma la mezcla de áreas (con su propio contador grande). */}
        <div className="relative mt-[1.8rem] max-w-[46rem]">
          <Latido className="absolute -left-[1.4rem] top-[0.6rem]" />
          <AreasConectadas data={data} />
        </div>

        <p className="bbva-serif mt-[1.2rem] text-[1.6rem] italic text-grafito">Un solo código para toda la clase.</p>
      </div>
    </div>
  );
}

// --- Placas numeradas -------------------------------------------------------------------

function PlacaContenido({ s }: { s: SlidePlaca }) {
  const marca = MARCAS[s.numero];
  const folio = <Folio rotulo="Placa" numero={dos(s.numero)} bloque={s.bloque} />;
  const ilus = s.ilus ? (
    <div className="bbva-cae absolute inset-0" style={vars({ animationDelay: "0.15s" })}>
      <Ilustracion id={s.ilus} />
    </div>
  ) : null;

  if (s.layout === "tipo")
    return (
      <Hoja folio={folio}>
        <div className="flex h-full flex-col">
          <Titulo texto={s.titulo} marca={marca} tam={tamTitulo(s.titulo, 76, 4.2, 3, 1)} className="shrink-0 text-center" />
          <div className="relative mt-[1.5rem] min-h-0 flex-1">{ilus}</div>
        </div>
      </Hoja>
    );

  if (s.layout === "centro")
    return (
      <Hoja folio={folio}>
        <div className="flex h-full flex-col">
          <div className="flex shrink-0 items-end justify-between gap-[3rem]">
            <Titulo texto={s.titulo} marca={marca} tam={tamTitulo(s.titulo, 52, 4.8, 3, 2)} className="min-w-0 max-w-[56rem]" />
            <Bajada texto={s.bajada} className="max-w-[25rem] shrink-0 pb-[0.4rem] text-right text-[1.9rem]" />
          </div>
          <div className="relative mx-auto mt-[1.6rem] min-h-0 w-full max-w-[80rem] flex-1">{ilus}</div>
        </div>
      </Hoja>
    );

  // "lado": título a la izquierda, ilustración a la derecha.
  const cierre = s.numero === 20;
  return (
    <Hoja folio={folio}>
      <div className="flex h-full items-center gap-[3.5%]">
        <div className="flex w-[38%] max-w-[36rem] shrink-0 flex-col justify-center">
          <Titulo texto={s.titulo} marca={marca} tam={tamTitulo(s.titulo, 30, cierre ? 6 : 6.5)} />
          <span className="mt-[1.8rem] block h-[3px] w-[3.5rem] bg-naranja" />
          <Bajada texto={s.bajada} className="mt-[1.1rem] text-[2.15rem]" />
          {s.activa && <TarjetasEnVivo activa={s.activa} />}
        </div>
        <div className="relative h-full max-h-[38rem] min-w-0 flex-1">{ilus}</div>
      </div>
    </Hoja>
  );
}

/** Placa 19: la actividad 5 está abierta mientras la placa queda proyectada. */
function TarjetasEnVivo({ activa }: { activa: BbvaActivityKey }) {
  const data = useVivo(activa, 2000);
  const n = contados(activa, data);
  const total = data?.participantes ?? 0;
  return (
    <div className="mt-[2.2rem]">
      <ChipCelular />
      <div className="mt-[1.1rem] flex items-end gap-[0.8rem]">
        <span key={n} className="pop bbva-titular text-[4.4rem] leading-[0.8] tabular-nums text-tinta">
          {n}
        </span>
        <span className="bbva-serif pb-[0.1rem] text-[1.5rem] italic leading-[1.05] text-grafito">
          de {total}
          <br />
          {activa === "bbva_a5" ? "ya tienen su tarjeta" : "respondieron"}
        </span>
      </div>
      <Casillas n={n} total={total} className="mt-[0.9rem]" />
    </div>
  );
}

/** Cuántas personas "completaron": en la actividad 5, las que llegaron a la tarjeta. */
function contados(activity: BbvaActivityKey, data: ResultadosBbva | null) {
  if (!data) return 0;
  return activity === "bbva_a5" ? (data.respondieronItem?.q4 ?? 0) : data.respondieron;
}

// --- Curvas ------------------------------------------------------------------------------

function PlacaCurva({ s }: { s: SlideCurva }) {
  const n = CURVAS.indexOf(s) + 1;
  const tituloAparte = !s.titulo.toUpperCase().includes(s.centro.toUpperCase());
  return (
    <Hoja folio={<Folio rotulo="Curva" numero={String(n)} acento extra={`Placa ${dos(s.numero)}`} />}>
      <div className="flex h-full items-center gap-[4rem]">
        <div className="relative aspect-square h-full max-h-[45rem] shrink-0">
          <AnilloTexto anillo={s.anillo} centro={s.centro} />
        </div>

        <div className="flex min-w-0 max-w-[36rem] flex-1 flex-col justify-center">
          {s.ilus && (
            <div className="bbva-cae relative mb-[1.6rem] h-[21rem] w-full" style={vars({ animationDelay: "0.3s" })}>
              <Ilustracion id={s.ilus} />
            </div>
          )}
          {tituloAparte && <h2 className="bbva-titular mb-[1.6rem] text-[3.6rem] text-tinta">{s.titulo}</h2>}
          <Giro de={s.de} a={s.a} />
          <Bajada texto={s.bajada} className="mt-[1.6rem] text-[1.8rem]" />
        </div>
      </div>
    </Hoja>
  );
}

/** El giro de la clase: "de …" (tachado suave) → "a …". */
function Giro({ de, a }: { de: string; a: string }) {
  return (
    <div>
      <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-gris">La pregunta cambia</p>
      <p className="mt-[0.7rem] flex items-baseline gap-[0.8rem]">
        <span className="w-[1.6rem] shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-gris">de</span>
        <span className="bbva-serif relative text-[1.85rem] italic leading-tight text-gris">
          {de}
          <svg aria-hidden viewBox="0 0 100 10" preserveAspectRatio="none" className="pointer-events-none absolute -left-[2%] top-[52%] h-[0.25em] w-[104%] overflow-visible">
            <path
              d="M1 6 C 30 3, 60 8, 99 4"
              pathLength={100}
              fill="none"
              stroke="#45484f"
              strokeOpacity={0.55}
              strokeWidth={2}
              strokeLinecap="round"
              className="bbva-traza"
              style={vars({ "--largo": 100, animationDelay: "0.9s" })}
            />
          </svg>
        </span>
      </p>
      <p className="bbva-cae mt-[0.5rem] flex items-baseline gap-[0.8rem]" style={vars({ animationDelay: "1.5s" })}>
        <span className="w-[1.6rem] shrink-0 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-naranja">a</span>
        <span className="bbva-titular text-[3.1rem] text-tinta">{a}</span>
      </p>
    </div>
  );
}

// --- Actividades --------------------------------------------------------------------------

/** "Llega un reclamo. ¿Hasta dónde…?" → contexto (serif) + pregunta (titular). */
function partirPregunta(p: string): [string | null, string] {
  const i = p.indexOf(". ");
  return i > 0 ? [p.slice(0, i + 1), p.slice(i + 2)] : [null, p];
}

function PlacaActividad({ s, revelado, porArea, onRevelar, onPorArea }: PropsPlaca & { s: SlideActividad }) {
  const act = getActividadBbva(s.activa);
  const data = useVivo(s.activa, 1500);
  if (!act) return null;
  const n = contados(s.activa, data);
  const total = data?.participantes ?? 0;
  const conArea = CON_POR_AREA.includes(s.activa);
  const [contexto, pregunta] = partirPregunta(act.pregunta);
  const folio = <Folio rotulo="Actividad" numero={String(act.numero)} acento extra={act.nombre} />;
  const botones = (
    <BotonesResultados revelado={revelado} porArea={porArea} conArea={conArea} onRevelar={onRevelar} onPorArea={onPorArea} />
  );

  if (revelado)
    return (
      <Revelado folio={folio} titulo={pregunta} total={total} botones={botones}>
        <ResultadoActividad activity={s.activa} data={data} porArea={conArea && porArea} />
      </Revelado>
    );

  return (
    <Hoja folio={folio}>
      <div className="flex h-full gap-[4rem]">
        <div className="flex min-w-0 flex-1 flex-col">
          {contexto && <p className="bbva-serif mb-[0.8rem] text-[2rem] italic leading-tight text-grafito">{contexto}</p>}
          <h1 className="bbva-titular text-balance text-tinta" style={{ fontSize: `${tamTitulo(pregunta, 54, 6.4, 3.6, 2)}rem` }}>
            {pregunta}
          </h1>
          <p className="bbva-serif mt-[1rem] text-[2rem] italic text-grafito">{act.consigna}</p>
          <div className="relative flex min-h-0 flex-1 flex-col justify-center pb-[1rem] pt-[1.6rem]">
            <Anticipo act={act} />
          </div>
        </div>
        <Lateral n={n} total={total} texto="respondieron" botones={botones} />
      </div>
    </Hoja>
  );
}

function PlacaResultado({ s, revelado, porArea, onRevelar, onPorArea }: PropsPlaca & { s: SlideResultado }) {
  const act = getActividadBbva(s.de);
  const data = useVivo(s.de, 1500);
  if (!act) return null;
  const n = contados(s.de, data);
  const total = data?.participantes ?? 0;
  const conArea = CON_POR_AREA.includes(s.de);
  const folio = <Folio rotulo="Resultado" numero={String(act.numero)} acento extra={act.nombre} />;
  const texto = s.de === "bbva_a5" ? "tienen su tarjeta" : "respondieron";
  const botones = (
    <BotonesResultados revelado={revelado} porArea={porArea} conArea={conArea} onRevelar={onRevelar} onPorArea={onPorArea} />
  );

  if (revelado)
    return (
      <Revelado folio={folio} titulo={s.titulo} total={total} botones={botones}>
        <ResultadoActividad activity={s.de} data={data} porArea={conArea && porArea} />
      </Revelado>
    );

  return (
    <Hoja folio={folio}>
      <div className="flex h-full gap-[4rem]">
        <div className="flex min-w-0 flex-1 flex-col">
          <Titulo texto={s.titulo} tam={6.4} />
          <Bajada texto={s.bajada} className="mt-[1rem] max-w-[44rem] text-[1.95rem]" />
          {/* Cuatro fichas en blanco: el mapa se va a llenar con sus respuestas. */}
          <div className="flex min-h-0 flex-1 items-center pb-[1rem] pt-[2rem]">
            <div className="grid w-full grid-cols-4 gap-[1.6rem]">
              {act.items.map((it, i) => (
                <div
                  key={it.id}
                  className="bbva-recorte bbva-cae relative flex min-h-[19rem] flex-col px-[1.3rem] pb-[1.5rem] pt-[1.2rem]"
                  style={vars({ "--rot": `${[-1.5, 1, -0.5, 1.8][i % 4]}deg`, animationDelay: `${0.15 + i * 0.1}s` })}
                >
                  <span className="bbva-cinta absolute -top-[0.7rem] left-1/2 h-[1.4rem] w-[5rem] -translate-x-1/2" />
                  <p className="font-mono text-[0.8rem] uppercase tracking-[0.22em] text-naranja">{dos(i + 1)}</p>
                  <p className="bbva-titular mt-[0.4rem] text-[2.3rem] text-tinta">{it.rotulo}</p>
                  <p className="bbva-serif mt-[0.6rem] text-[1.2rem] italic leading-snug text-gris">{it.texto}</p>
                  <div className="mt-auto space-y-[0.75rem] pt-[1.2rem]">
                    {[88, 64, 76].map((w, j) => (
                      <span key={j} className="block h-[0.6rem] rounded-full bg-papel-2" style={{ width: `${w}%` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Lateral n={n} total={total} texto={texto} botones={botones} />
      </div>
    </Hoja>
  );
}

/** Columna derecha mientras el resultado está oculto: celular, contador, QR y botones. */
function Lateral({ n, total, texto, botones }: { n: number; total: number; texto: string; botones: React.ReactNode }) {
  return (
    <aside className="flex w-[24rem] shrink-0 flex-col">
      <ChipCelular className="self-start" />
      <ContadorVivo n={n} total={total} texto={texto} className="mt-[2rem]" />
      <div className="mt-auto">
        <MiniQR />
        <div className="mt-[1.4rem]">{botones}</div>
      </div>
    </aside>
  );
}

/** Resultado a la vista: la pregunta queda chica arriba y la visualización ocupa la placa. */
function Revelado({
  folio,
  titulo,
  total,
  botones,
  children,
}: {
  folio: React.ReactNode;
  titulo: string;
  total: number;
  botones: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Hoja folio={folio}>
      <div className="flex h-full flex-col">
        <div className="flex shrink-0 items-end justify-between gap-[2rem] border-b border-tinta/15 pb-[0.9rem]">
          <h2 className="bbva-titular min-w-0 text-[2.5rem] text-tinta">{titulo}</h2>
          <p className="flex shrink-0 items-center gap-[0.55rem] pb-[0.3rem] font-mono text-[0.75rem] uppercase tracking-[0.16em] text-gris">
            <Latido />
            en vivo · {total} {total === 1 ? "conectada" : "conectadas"}
          </p>
        </div>
        <div className="bbva-cae relative mt-[1.4rem] min-h-0 flex-1" style={vars({ "--rot": "0deg", animationDelay: "0.05s" })}>
          {children}
        </div>
        <div className="flex shrink-0 justify-end pt-[0.6rem]">{botones}</div>
      </div>
    </Hoja>
  );
}

/** Lo que se ve de la actividad mientras el grupo responde (sin anticipar resultados). */
function Anticipo({ act }: { act: ActividadBbva }) {
  const item = act.items[0];
  if (act.key === "bbva_a1") {
    // Nube en blanco: las operaciones, todas del mismo peso, esperando votos.
    const tam = [3.6, 2.5, 3.1, 2.2, 3.4, 2.6, 2.3, 3.2, 2.2, 2.9, 2.3, 3.5, 2.5, 2.8];
    return (
      <div className="flex flex-col">
        <div className="flex max-w-[56rem] flex-wrap items-baseline gap-x-[1.8rem] gap-y-[0.9rem]">
          {item.opciones.map((o, i) => (
            <span
              key={o.id}
              className={cn("bbva-titular leading-none", i % 3 === 0 ? "text-cielo" : "text-niebla")}
              style={{ fontSize: `${tam[i % tam.length]}rem` }}
            >
              {o.label}
            </span>
          ))}
        </div>
        <p className="bbva-mano mt-[1.6rem] flex items-end gap-[0.5rem] text-[1.9rem] leading-none text-naranja">
          <FlechaMano hacia="arriba" className="h-[2.4rem] w-auto" demora={0.5} />
          la nube se arma con lo que elijan
        </p>
      </div>
    );
  }

  if (act.key === "bbva_a3") {
    // El recorrido del reclamo: cinco pasos, ¿hasta dónde solo?
    return (
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="bbva-recorte mr-[1.4rem] mt-[0.2rem] shrink-0 px-[1rem] py-[0.7rem]" style={{ rotate: "-3deg" }}>
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-gris">Ticket</p>
            <p className="bbva-mano text-[1.7rem] leading-none text-tinta">reclamo</p>
          </div>
          <ol className="relative grid flex-1 grid-cols-5 gap-[0.8rem]">
            <span aria-hidden className="absolute left-[1.5rem] right-[1.5rem] top-[1.5rem] h-px bg-grafito/30" />
            {item.opciones.map((o, i) => (
              <li key={o.id} className="relative flex flex-col items-start">
                <span className="relative z-10 grid size-[3rem] place-items-center rounded-full border-[1.5px] border-grafito/50 bg-papel font-mono text-[1.15rem] text-grafito">
                  {i + 1}
                </span>
                <span className="bbva-titular mt-[0.8rem] pr-[0.4rem] text-[1.75rem] leading-[0.95] text-grafito">{o.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <p className="bbva-mano mt-[2rem] text-[2rem] leading-none text-naranja">¿en qué paso necesitás a una persona?</p>
      </div>
    );
  }

  // Actividades 2 y 4: los casos que el grupo está respondiendo.
  return (
    <div className="flex flex-col">
      <ol className={cn("max-w-[56rem]", act.items.length > 4 ? "space-y-[0.8rem]" : "space-y-[0.9rem]")}>
        {act.items.map((it, i) => (
          <li key={it.id} className="flex items-baseline gap-[1.1rem]">
            <span className="w-[2rem] shrink-0 font-mono text-[1rem] text-naranja">{dos(i + 1)}</span>
            <span className={cn("bbva-serif leading-[1.18] text-tinta", act.key === "bbva_a4" ? "text-[1.7rem]" : "text-[1.95rem]")}>{it.texto}</span>
          </li>
        ))}
      </ol>
      <div className="mt-[1.6rem] flex flex-wrap gap-[0.6rem] pl-[3.1rem]">
        {item.opciones.map((o) => (
          <span key={o.id} className="rounded-full border border-grafito/35 px-[1rem] py-[0.35rem] font-mono text-[0.85rem] uppercase tracking-[0.14em] text-grafito">
            {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// --- Cierre ------------------------------------------------------------------------------

function Cierre() {
  return (
    <Hoja folio={<Folio rotulo="Cierre" extra="Laboratorio de IA · el recorrido" />}>
      <div className="flex h-full flex-col">
        <h1 className="bbva-titular text-[6rem] text-tinta">Lo que sigue</h1>

        {/* El recorrido del programa: cuatro estaciones, hoy es la primera. */}
        <div className="flex min-h-0 flex-1 items-center">
        <ol className="relative grid w-full grid-cols-4 gap-[2.4rem]">
          <span aria-hidden className="absolute left-[0.9rem] right-[8%] top-[0.9rem] border-t-2 border-dashed border-grafito/30" />
          <span aria-hidden className="absolute left-[0.9rem] top-[0.9rem] w-[calc(25%-0.6rem)] border-t-2 border-naranja" />
          {BBVA_RECORRIDO.map((r, i) => (
            <li key={r.etapa} className="bbva-cae relative" style={vars({ animationDelay: `${0.2 + i * 0.15}s` })}>
              <span
                className={cn(
                  "relative z-10 block size-[1.8rem] rounded-full border-2",
                  r.hoy ? "border-naranja bg-naranja ring-[0.35rem] ring-naranja/20" : "border-grafito/40 bg-papel",
                )}
              />
              <p className={cn("mt-[1.3rem] font-mono text-[0.85rem] uppercase tracking-[0.26em]", r.hoy ? "text-naranja" : "text-gris")}>
                {dos(i + 1)} {r.hoy && <span className="ml-[0.4rem] inline-block -rotate-3 border-[1.5px] border-naranja px-[0.4rem] py-[0.05rem] text-naranja">Hoy</span>}
              </p>
              <p className={cn("bbva-titular mt-[0.6rem] text-[2.7rem]", r.hoy ? "text-tinta" : "text-grafito")}>{r.etapa}</p>
              <p className={cn("bbva-serif mt-[0.7rem] text-[1.75rem] italic leading-[1.12]", r.hoy ? "text-tinta" : "text-gris")}>{r.pregunta}</p>
            </li>
          ))}
        </ol>
        </div>

        <div className="flex shrink-0 items-end justify-between gap-[3rem] pb-[0.6rem]">
          <p className="bbva-serif text-[2.7rem] italic leading-[1.15] text-grafito">
            Hoy sabés <span className="bbva-titular not-italic text-[1.15em] text-tinta">qué</span> querés intervenir.
            <br />
            Todavía no <span className="bbva-titular not-italic text-[1.15em] text-tinta">cómo</span>.{" "}
            <span className="bbva-subrayado text-tinta">Eso es correcto.</span>
          </p>

          <div className="bbva-postit bbva-cae relative w-[27rem] shrink-0 px-[1.8rem] pb-[1.8rem] pt-[1.4rem]" style={vars({ "--rot": "2deg", animationDelay: "0.9s" })}>
            <span className="bbva-cinta absolute -top-[0.8rem] left-1/2 h-[1.6rem] w-[6rem] -translate-x-1/2 rotate-2" />
            <p className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-tinta/70">Para el próximo encuentro</p>
            <p className="bbva-mano mt-[0.5rem] text-[2.6rem] leading-[1] text-tinta">Traé un caso real de tu candidato.</p>
          </div>
        </div>
      </div>
    </Hoja>
  );
}
