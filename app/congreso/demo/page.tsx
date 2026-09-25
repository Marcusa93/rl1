import type { Metadata } from "next";
import Link from "next/link";
import { Fragment } from "react";
import {
  ANON_DOCUMENTOS,
  ANON_FALLA,
  ANON_FRASE,
  ANON_PASOS,
  ANON_PLAN_B,
  CONG_CASOS,
  CONG_TITLE,
  type CasoDemo,
  type CasoId,
} from "@/lib/congreso";
import { BotonCopiarPrompt } from "@/components/congreso/demos";

// Tablero de la demo (laptop de Marco y celular). Arriba, la demo de la charla:
// el anonimizador de escritos (instrucciones a un click, el HTML ensayado para
// abrir o descargar y los PDF ficticios para probarlo). Abajo, otros tres
// caminos ensayados, versión por versión.

export const metadata: Metadata = {
  title: "La demo · anonimizador de escritos",
};

/** Dónde tocar en cada versión ensayada para que se vea lo que hay que ver. */
const ENSAYO: Record<CasoId, string[]> = {
  cronologia: [
    "V1: el 14/03/2025 muestra sólo el ofrecimiento de prueba. La contestación de demanda (cargada antes, el mismo día) no aparece.",
    "Para hacerlo en vivo: cargá cualquier actuación con fecha 14/03/2025 y reemplaza a la que estaba.",
    "V3: tocá la estrella de «Apertura a prueba». V4: dos plazos pendientes calculados desde hoy; cargá una actuación que abra un plazo y aparece arriba.",
  ],
  prueba: [
    "V1: en la tarjeta «Pericia mecánica», cambiá «Acredita el hecho…» de Hecho 2 a Hecho 3: en la tabla, el Hecho 2 se queda sin la pericia.",
    "V2 ya trae la pericia en los hechos 2 y 3 (se puede destildar y volver a tildar).",
    "V3: el Hecho 5 (la incapacidad) aparece en rojo. V4: el resumen «Falta producir» separa lo del actor y lo del demandado.",
  ],
  entrevista: [
    "El cliente de ejemplo (Jorge Ledesma, un despido) viene precargado: alcanza con tocar «Siguiente».",
    "V1: pregunta «¿Hubo lesionados?» y «¿El vehículo tenía seguro?», y no hay opción «No sé».",
    "V3: elegí Laboral y en «¿Recibió un telegrama o una carta documento?» tocá Sí: la ficha abre con la alerta. V4: la ficha termina con la documentación y «Copiar ficha».",
  ],
};

export default function DemoPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
      <p className="cg-mono text-[12px] uppercase tracking-[0.2em] text-cg-sepia">{CONG_TITLE} · plan B</p>
      <h1 className="cg-titular mt-3 text-[40px] text-cg-tinta sm:text-[60px]">La demo · anonimizador de escritos</h1>
      <p className="cg-bajada mt-4 text-lg text-cg-sepia sm:text-xl">
        Si la generación en vivo falla: «Perfecto. Bienvenidos al desarrollo de software.» Y se abre la versión ensayada.
      </p>

      <Anonimizador />

      <h2 className="cg-titular mt-16 text-[30px] text-cg-tinta sm:text-[40px]">Otros caminos ensayados</h2>
      <p className="cg-bajada mt-2 text-lg text-cg-sepia">Por si querés construir otra cosa: tres apps, cuatro versiones cada una.</p>

      <nav className="mt-6 flex flex-wrap gap-2" aria-label="Casos">
        {CONG_CASOS.map((c) => (
          <a
            key={c.id}
            href={`#${c.id}`}
            className="rounded-full border border-cg-niebla bg-cg-blanco px-4 py-2 text-[15px] font-medium text-cg-tinta transition hover:border-cg-tinta"
          >
            <span className="cg-serif font-bold text-cg-lacre">{c.letra}</span> · {c.app}
          </a>
        ))}
      </nav>

      <p className="mt-4 text-[14px] text-cg-gris">
        En la versión ensayada, la tecla <kbd className="cg-mono rounded border border-cg-niebla bg-cg-blanco px-1.5">H</kbd> oculta y
        muestra la barra de arriba.
      </p>

      <div className="mt-10 space-y-8">
        {CONG_CASOS.map((c) => (
          <Caso key={c.id} c={c} />
        ))}
      </div>
    </main>
  );
}

function Caso({ c }: { c: CasoDemo }) {
  return (
    <details id={c.id} open className="group scroll-mt-6 rounded-2xl border border-cg-niebla bg-cg-papel-2/50">
      <summary className="flex cursor-pointer list-none items-start gap-4 p-4 sm:p-6 [&::-webkit-details-marker]:hidden">
        <span className="cg-titular shrink-0 text-[56px] text-cg-lacre sm:text-[72px]">{c.letra}</span>
        <div className="min-w-0 flex-1 pt-1">
          <h2 className="cg-titular text-[26px] leading-[1.05] text-cg-tinta sm:text-[32px]">{c.titulo}</h2>
          <p className="cg-mono mt-2 text-[12px] uppercase tracking-[0.14em] text-cg-sepia">La app: {c.app}</p>
          <p className="cg-bajada mt-2 text-lg text-cg-sepia">“{c.problema}”</p>
        </div>
        <span className="mt-2 shrink-0 text-xl text-cg-sepia transition group-open:rotate-180" aria-hidden>
          ▾
        </span>
      </summary>

      <div className="px-4 pb-6 sm:px-6">
        <div className="mb-4 rounded-xl border border-cg-niebla bg-cg-blanco/60 px-4 py-3">
          <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-musgo">Para el ensayo</p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] leading-snug text-cg-sepia">
            {ENSAYO[c.id].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <ol className="space-y-4">
          {c.pasos.map((p) => (
            <Fragment key={p.v}>
              <li className="cg-hoja rounded-xl p-4 sm:p-5">
                <div className="flex items-baseline gap-3">
                  <span className="cg-mono shrink-0 rounded bg-cg-tinta px-2 py-0.5 text-[14px] font-semibold text-cg-blanco">V{p.v}</span>
                  <h3 className="cg-serif text-xl font-semibold leading-tight text-cg-tinta">{p.titulo}</h3>
                </div>

                <div className="mt-3 rounded-lg border border-cg-niebla bg-cg-papel/60 p-3">
                  <p className="cg-mono whitespace-pre-wrap break-words text-[14px] leading-relaxed text-cg-tinta">{p.prompt}</p>
                  <div className="mt-2 flex justify-end">
                    <BotonCopiarPrompt texto={p.prompt} />
                  </div>
                </div>

                <p className="mt-3 text-[14px] leading-snug text-cg-sepia">
                  <span className="font-semibold text-cg-tinta">Probar:</span> {p.probar}
                </p>

                <Link
                  href={`/congreso/demo/${c.id}?v=${p.v}`}
                  className="mt-4 inline-flex items-center rounded-lg bg-cg-tinta px-4 py-2.5 text-[15px] font-semibold text-cg-blanco transition hover:bg-cg-azul-2"
                >
                  Abrir V{p.v} ensayada →
                </Link>
              </li>

              {p.v === 1 && (
                <li className="rounded-xl border-2 border-dashed border-cg-lacre/50 px-4 py-4 sm:px-5">
                  <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-lacre">La falla que hay que encontrar</p>
                  <p className="mt-1 text-[17px] font-medium leading-snug text-cg-tinta">{c.falla}</p>
                  <p className="cg-mono mt-4 text-[11px] uppercase tracking-[0.18em] text-cg-musgo">La frase del abogado</p>
                  <p className="cg-bajada mt-1 text-xl leading-snug text-cg-tinta">“{c.frase}”</p>
                </li>
              )}
            </Fragment>
          ))}
          <Documento c={c} />
        </ol>
      </div>
    </details>
  );
}

/** Recurso dinámico: un documento ficticio para cargar en la app ya construida. */
function Documento({ c }: { c: CasoDemo }) {
  const d = c.documento;
  return (
    <li className="rounded-xl border-2 border-cg-azul-2/40 bg-cg-blanco/70 p-4 sm:p-5">
      <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-azul-2">Recurso dinámico · cargar un documento</p>
      <h3 className="cg-serif mt-1 text-xl font-semibold leading-tight text-cg-tinta">{d.titulo}</h3>
      <p className="mt-1 text-[14px] leading-snug text-cg-sepia">
        Ficticio, redactado para la demo. Abrilo, copiá todo el texto y pegalo en la app cuando tenga el botón para importarlo.
      </p>
      <a
        href={d.archivo}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-flex items-center rounded-lg border border-cg-tinta/30 bg-cg-blanco px-4 py-2.5 text-[15px] font-semibold text-cg-tinta transition hover:bg-cg-tinta hover:text-cg-blanco"
      >
        Abrir el documento ↗
      </a>
      <div className="mt-3 rounded-lg border border-cg-niebla bg-cg-papel/60 p-3">
        <p className="cg-mono whitespace-pre-wrap break-words text-[14px] leading-relaxed text-cg-tinta">{d.prompt}</p>
        <div className="mt-2 flex justify-end">
          <BotonCopiarPrompt texto={d.prompt} />
        </div>
      </div>
      <p className="mt-3 text-[14px] leading-snug text-cg-sepia">
        <span className="font-semibold text-cg-tinta">Probar:</span> {d.probar}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-cg-gris">
        Para leer texto libre la app necesita IA adentro (en Claude, los artefactos pueden usarla). Sin eso, pedí que lea las líneas con el
        formato “fs. | fecha | tipo | parte”.
      </p>
    </li>
  );
}

/** La demo de la charla: el anonimizador. */
function Anonimizador() {
  return (
    <section className="mt-8 space-y-4">
      <div className="rounded-xl border border-cg-niebla bg-cg-blanco/60 px-4 py-3 text-[14px] leading-snug text-cg-sepia">
        <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-musgo">Cómo se hace</p>
        <p className="mt-1">
          En la charla, la placa <b className="text-cg-tinta">Hagamos una app</b> muestra la instrucción armada con lo que votó la sala. Acá está la
          versión estándar. Pegala en <b className="text-cg-tinta">Claude</b> (claude.ai): genera la herramienta como artefacto, se prueba al lado del
          chat y se descarga como un solo archivo HTML. No hace falta base de datos: el PDF se procesa en el navegador.
        </p>
      </div>

      <ol className="space-y-4">
        {ANON_PASOS.map((p) => (
          <Fragment key={p.v}>
            <li className="cg-hoja rounded-xl p-4 sm:p-5">
              <div className="flex items-baseline gap-3">
                <span className="cg-mono shrink-0 rounded bg-cg-tinta px-2 py-0.5 text-[14px] font-semibold text-cg-blanco">V{p.v}</span>
                <h3 className="cg-serif text-xl font-semibold leading-tight text-cg-tinta">{p.titulo}</h3>
              </div>
              <div className="mt-3 rounded-lg border border-cg-niebla bg-cg-papel/60 p-3">
                <p className="cg-mono whitespace-pre-wrap break-words text-[14px] leading-relaxed text-cg-tinta">{p.prompt}</p>
                <div className="mt-2 flex justify-end">
                  <BotonCopiarPrompt texto={p.prompt} />
                </div>
              </div>
              <p className="mt-3 text-[14px] leading-snug text-cg-sepia">
                <span className="font-semibold text-cg-tinta">Probar:</span> {p.probar}
              </p>
              <a
                href={`${ANON_PLAN_B}?v=${p.v}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center rounded-lg bg-cg-tinta px-4 py-2.5 text-[15px] font-semibold text-cg-blanco transition hover:bg-cg-azul-2"
              >
                Abrir V{p.v} ensayada ↗
              </a>
            </li>
            {p.v === 1 && (
              <li className="rounded-xl border-2 border-dashed border-cg-lacre/50 px-4 py-4 sm:px-5">
                <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-lacre">La falla que hay que encontrar</p>
                <p className="mt-1 text-[17px] font-medium leading-snug text-cg-tinta">{ANON_FALLA}</p>
                <p className="cg-mono mt-4 text-[11px] uppercase tracking-[0.18em] text-cg-musgo">La frase del abogado</p>
                <p className="cg-bajada mt-1 text-xl leading-snug text-cg-tinta">“{ANON_FRASE}”</p>
              </li>
            )}
          </Fragment>
        ))}
      </ol>

      <div className="cg-hoja rounded-xl p-4 sm:p-5">
        <p className="cg-mono text-[11px] uppercase tracking-[0.18em] text-cg-azul-2">Documentos para probarlo</p>
        <p className="mt-1 text-[14px] leading-snug text-cg-sepia">
          Ficticios, llenos de datos personales a propósito (nombres escritos de varias formas, DNI, CUIL, domicilios, teléfonos, salud, montos).
        </p>
        <ul className="mt-3 space-y-2">
          {ANON_DOCUMENTOS.map((d) => (
            <li key={d.archivo} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cg-niebla bg-cg-blanco px-3 py-2">
              <span className="text-[15px] text-cg-tinta">{d.titulo}</span>
              <span className="flex gap-2">
                <a href={d.archivo} target="_blank" rel="noreferrer" className="cg-mono rounded-md border border-cg-tinta/25 px-3 py-1.5 text-[13px] text-cg-tinta hover:bg-cg-tinta hover:text-cg-blanco">
                  Abrir
                </a>
                <a href={d.archivo} download className="cg-mono rounded-md bg-cg-tinta px-3 py-1.5 text-[13px] text-cg-blanco hover:bg-cg-azul-2">
                  Descargar PDF
                </a>
              </span>
            </li>
          ))}
        </ul>
        <a
          href={ANON_PLAN_B}
          download="anonimizador.html"
          className="mt-4 inline-flex items-center rounded-lg border border-cg-tinta/30 bg-cg-blanco px-4 py-2.5 text-[15px] font-semibold text-cg-tinta hover:bg-cg-tinta hover:text-cg-blanco"
        >
          Descargar el anonimizador ensayado (.html)
        </a>
      </div>
    </section>
  );
}
