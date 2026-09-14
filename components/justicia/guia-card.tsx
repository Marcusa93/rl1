"use client";

// Al final de la masterclass (desde la nube de palabras), el celular de cada
// participante ofrece la guía de la clase: verla, descargarla o compartirla.

import { GUIA_PDF, GUIA_WHATSAPP } from "@/lib/justicia-guia";
import type { SessionRow } from "@/lib/types";

export function GuiaFinal({ session }: { session: SessionRow }) {
  if (session.current_activity !== "jus_nube") return null;
  return (
    <section className="rise mt-8 rounded-3xl border-gradient p-5">
      <p className="text-xs font-bold uppercase tracking-widest text-teal">📘 La guía de la clase</p>
      <p className="mt-2 text-xl font-bold leading-snug">Todo lo que vimos hoy, con los conceptos, las herramientas y los enlaces.</p>
      <div className="mt-4 grid gap-2">
        <a href="/justicia/guia" className="rounded-2xl bg-gradient-to-r from-teal to-cyan px-4 py-3 text-center text-lg font-bold text-ink">
          Ver la guía
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href={GUIA_PDF} download className="rounded-2xl border border-teal/60 bg-teal/10 px-3 py-3 text-center text-base font-semibold text-teal">
            ⬇️ PDF
          </a>
          <a
            href={GUIA_WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-emerald-400/60 bg-emerald-500/15 px-3 py-3 text-center text-base font-semibold text-emerald-200"
          >
            💬 WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
