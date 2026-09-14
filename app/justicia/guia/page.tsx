// Guía de la masterclass (justicia.rossi-ia.com/guia): lo que se vio en
// clase, para leer en el celular, descargar en PDF y compartir por WhatsApp.
// Contenido en lib/justicia-guia.ts (la misma fuente que el PDF).

import type { Metadata } from "next";
import {
  GUIA_AUTOR,
  GUIA_BAJADA,
  GUIA_CARGO,
  GUIA_EVENTO,
  GUIA_FECHA,
  GUIA_GRACIAS,
  GUIA_LOGOS,
  GUIA_METODO,
  GUIA_PDF,
  GUIA_RECURSERO,
  GUIA_REDES,
  GUIA_SALA,
  GUIA_SECCIONES,
  GUIA_TITULO,
  GUIA_WHATSAPP,
  type Enlace,
} from "@/lib/justicia-guia";

export const metadata: Metadata = {
  title: `Guía · ${GUIA_TITULO}`,
  description: `${GUIA_BAJADA}. ${GUIA_AUTOR} · ${GUIA_EVENTO}.`,
};

function Acciones() {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={GUIA_PDF}
        download
        className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal to-cyan px-5 py-3 text-lg font-bold text-ink transition hover:brightness-110"
      >
        ⬇️ Descargar la guía (PDF)
      </a>
      <a
        href={GUIA_WHATSAPP}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 rounded-2xl border border-emerald-400/60 bg-emerald-500/15 px-5 py-3 text-lg font-bold text-emerald-200 transition hover:bg-emerald-500/25"
      >
        💬 Compartir por WhatsApp
      </a>
    </div>
  );
}

function Enlaces({ titulo, items }: { titulo: string; items: Enlace[] }) {
  return (
    <div>
      <p className="mb-3 font-mono text-sm uppercase tracking-[0.2em] text-violet">{titulo}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map((e) => (
          <a
            key={e.url}
            href={e.url}
            target="_blank"
            rel="noreferrer"
            className="glass flex items-center gap-3 rounded-2xl p-4 transition hover:brightness-125"
          >
            <span className="text-3xl">{e.emoji}</span>
            <span className="min-w-0">
              <span className="block text-lg font-semibold">{e.label} ↗</span>
              <span className="block text-base text-muted">{e.detalle}</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function Logos() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {GUIA_LOGOS.map((l) => (
        <img key={l.src} src={l.src} alt={l.alt} className={l.fondo ? "h-16 w-auto rounded-xl bg-white p-1.5" : "h-16 w-auto"} />
      ))}
    </div>
  );
}

export default function GuiaPage() {
  return (
    <main className="bg-grid min-h-dvh">
      <div className="mx-auto max-w-4xl space-y-14 px-5 py-10 sm:px-8 sm:py-14">
        {/* Portada */}
        <header className="space-y-6">
          <Logos />
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-violet">Guía de la masterclass</p>
            <h1 className="text-gradient mt-2 font-mono text-5xl font-bold tracking-tight sm:text-6xl">{GUIA_TITULO}</h1>
            <p className="mt-4 text-xl leading-snug text-muted sm:text-2xl">{GUIA_BAJADA}.</p>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-2xl font-bold">{GUIA_AUTOR}</p>
            <p className="mt-1 text-base text-muted">{GUIA_CARGO}</p>
            <p className="mt-3 text-base text-faint">
              {GUIA_EVENTO} · {GUIA_FECHA}
            </p>
          </div>
          <Acciones />
          <p className="rounded-2xl border border-teal/40 bg-teal/10 p-5 text-lg leading-relaxed">🙏 {GUIA_GRACIAS}</p>
        </header>

        <Enlaces titulo="Recursero · las herramientas a un clic" items={GUIA_RECURSERO} />
        <Enlaces titulo="Mis redes" items={GUIA_REDES} />

        {/* Conceptos */}
        {GUIA_SECCIONES.map((s) => (
          <section key={s.titulo}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{s.titulo}</h2>
            <p className="mt-2 text-lg text-muted">{s.bajada}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {s.conceptos.map((c) => (
                <article key={c.termino} className="glass rounded-2xl p-5">
                  <p className="flex items-center gap-2 text-xl font-bold text-teal">
                    <span className="text-2xl">{c.emoji}</span>
                    {c.termino}
                  </p>
                  <p className="mt-2 text-lg leading-relaxed">{c.definicion}</p>
                  {c.clave && <p className="mt-3 border-l-4 border-violet/60 pl-3 text-base italic leading-snug text-muted">{c.clave}</p>}
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* COTIO */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Un buen prompt: COTIO</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-5">
            {[
              ["C", "Contexto", "Quién pide y en qué situación", "text-teal border-teal"],
              ["O", "Objetivo", "Qué se quiere lograr", "text-cyan border-cyan"],
              ["T", "Tareas", "Qué hacer, paso por paso", "text-violet border-violet"],
              ["I", "Input", "Con qué información trabajar", "text-amber-300 border-amber-300"],
              ["O", "Output", "Cómo entregar el resultado", "text-rose-300 border-rose-300"],
            ].map(([l, n, t, c]) => (
              <div key={n} className="glass rounded-2xl p-4 text-center">
                <p className={`mx-auto flex size-12 items-center justify-center rounded-xl border-2 font-mono text-2xl font-bold ${c}`}>{l}</p>
                <p className="mt-2 text-lg font-bold">{n}</p>
                <p className="text-sm text-muted">{t}</p>
              </div>
            ))}
          </div>
        </section>

        {/* La Sala */}
        <section className="glass rounded-3xl p-6 sm:p-8">
          <p className="font-mono text-sm uppercase tracking-[0.2em] text-violet">{GUIA_SALA.referencia}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{GUIA_SALA.titulo}</h2>
          <ul className="mt-5 space-y-2 text-lg leading-relaxed">
            {GUIA_SALA.puntos.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
          <p className="mt-6 text-base font-semibold text-teal">Los diez principios</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {GUIA_SALA.principios.map((p) => (
              <span key={p} className="rounded-full border border-teal/40 bg-teal/10 px-4 py-1.5 text-base">
                {p}
              </span>
            ))}
          </div>
        </section>

        {/* Método */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Una forma de trabajar</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {GUIA_METODO.map((m, i) => (
              <div key={m.paso} className="glass rounded-2xl p-5">
                <p className="font-mono text-3xl font-bold text-teal">{i + 1}</p>
                <p className="mt-1 text-xl font-bold">{m.paso}</p>
                <p className="mt-1 text-base leading-snug text-muted">{m.texto}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Cierre */}
        <footer className="space-y-8 border-t border-line/60 pt-10">
          <Enlaces titulo="Recursero" items={GUIA_RECURSERO} />
          <Enlaces titulo="Mis redes" items={GUIA_REDES} />
          <p className="text-lg leading-relaxed text-muted">🙏 {GUIA_GRACIAS}</p>
          <Acciones />
          <div>
            <p className="text-xl font-bold">{GUIA_AUTOR}</p>
            <p className="text-base text-muted">{GUIA_CARGO}</p>
            <p className="mt-1 text-base text-faint">
              {GUIA_TITULO} · {GUIA_EVENTO} · {GUIA_FECHA}
            </p>
          </div>
          <Logos />
        </footer>
      </div>
    </main>
  );
}
