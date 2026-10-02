"use client";

// Las placas de la clase para imprimir o guardar como PDF (Cmd/Ctrl + P → Guardar como PDF).
// Cada placa es una página 16:9 con el pie del deck: logo del banco, la clase y el docente.

import { Placa } from "@/components/bbva/deck-placas";
import { BBVA_AUTOR, BBVA_LOGO, BBVA_SLIDES, BBVA_TITLE } from "@/lib/bbva-clase";

const nada = () => {};

export default function PlacasImprimibles() {
  return (
    <div className="placas-pdf bbva bbva-papel">
      <style>{`
        html:has(.placas-pdf) { font-size: 16px; }
        .placas-pdf *, .placas-pdf *::before, .placas-pdf *::after { animation: none !important; transition: none !important; }
        @page { size: 1440px 900px; margin: 0; }
        @media print { html, body { background: #f2eee6; } .placas-pdf, .placas-pdf * { visibility: visible !important; } .placas-pdf .no-print { display: none; } }
        .placas-pdf .hoja-pdf { width: 90rem; height: 56.25rem; break-after: page; page-break-after: always; overflow: hidden; }
        @media screen { .placas-pdf .hoja-pdf { margin: 0 auto 2rem; box-shadow: 0 10px 30px -18px rgba(0,0,0,.5); } }
      `}</style>
      <p className="no-print py-4 text-center font-mono text-sm uppercase tracking-[0.2em] text-grafito">
        {BBVA_TITLE} · Clase 2 · Para guardar como PDF: Cmd/Ctrl + P → Guardar como PDF (sin márgenes, con gráficos de fondo)
      </p>
      {BBVA_SLIDES.map((slide, i) => (
        <section key={i} className="hoja-pdf bbva-papel relative flex flex-col">
          <div className="relative min-h-0 flex-1">
            <Placa slide={slide} revelado={false} porArea={false} onRevelar={nada} onPorArea={nada} onReiniciar={nada} />
          </div>
          <footer className="relative z-10 mx-[4.5rem] flex h-[3rem] shrink-0 items-center justify-between border-t border-tinta/10 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-gris">
            <div className="flex items-center gap-[0.8rem]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={BBVA_LOGO} alt="BBVA" className="h-[0.95rem] w-auto mix-blend-multiply" />
              <span className="h-[0.9rem] w-px bg-grafito/25" />
              <span>
                {BBVA_TITLE} · Clase 2 · Del proceso al asistente · Docente: {BBVA_AUTOR}
              </span>
            </div>
            <span className="tabular-nums">
              {String(i + 1).padStart(2, "0")} / {BBVA_SLIDES.length}
            </span>
          </footer>
        </section>
      ))}
    </div>
  );
}
