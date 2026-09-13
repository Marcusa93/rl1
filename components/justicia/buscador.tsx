"use client";

// Placa "¿Y cuánto cambió el trabajo?": un expediente digital de 12 PDF.
// Primero se busca a mano (abrir archivo por archivo); después, con un clic,
// se busca en todo el expediente. El dato está en un archivo inesperado y
// la cédula es un escaneo sin texto: tener el PDF no alcanza para usarlo.

import { useState } from "react";
import { cn } from "@/lib/utils";

interface Archivo {
  nombre: string;
  paginas: number;
  /** Texto de la página que se muestra al abrirlo; null = imagen escaneada sin texto. */
  texto: string[] | null;
  /** Fragmento donde aparece el dato buscado. */
  hallazgo?: string;
}

const PREGUNTA = "¿Cuándo se notificó la demanda?";
const TERMINO = "notific";

const ARCHIVOS: Archivo[] = [
  { nombre: "demanda.pdf", paginas: 14, texto: ["Promueve demanda por cobro de saldo contractual…", "Ofrece prueba documental y testimonial."] },
  { nombre: "poder-general.pdf", paginas: 3, texto: ["Escritura de poder general judicial otorgada ante notario."] },
  { nombre: "cedula-notificacion.pdf", paginas: 1, texto: null },
  { nombre: "contestacion.pdf", paginas: 11, texto: ["Contesta demanda. Niega la entrega completa de los equipos.", "Opone excepción de contrato no cumplido."] },
  { nombre: "prueba-documental.pdf", paginas: 27, texto: ["Anexo 1: contrato. Anexo 2: factura. Anexo 3: correos."] },
  { nombre: "resolucion-03.pdf", paginas: 2, texto: ["Téngase por presentada la demanda. Córrase traslado."] },
  {
    nombre: "acta-audiencia.pdf",
    paginas: 6,
    texto: [
      "Acta de audiencia preliminar. Comparecen ambas partes.",
      "La parte demandada fue notificada el 14/02/2026, según constancia agregada, y contestó en término.",
    ],
    hallazgo: "La parte demandada fue notificada el 14/02/2026",
  },
  { nombre: "pericia-tecnica.pdf", paginas: 9, texto: ["Informe pericial sobre el funcionamiento de los equipos instalados."] },
  { nombre: "oficio-banco.pdf", paginas: 2, texto: ["Se informan movimientos de la cuenta del demandado."] },
  { nombre: "resolucion-07.pdf", paginas: 3, texto: ["Se abre a prueba por el plazo de ley."] },
  { nombre: "alegatos-actora.pdf", paginas: 8, texto: ["Alega sobre el mérito de la prueba producida."] },
  { nombre: "alegatos-demandada.pdf", paginas: 7, texto: ["Alega la falta de acta de conformidad."] },
];

function resaltar(linea: string, termino: string) {
  const i = linea.toLowerCase().indexOf(termino);
  if (i < 0) return linea;
  const fin = linea.indexOf(",", i);
  const hasta = fin > 0 ? fin : linea.length;
  return (
    <>
      {linea.slice(0, i)}
      <mark className="rounded bg-yellow-400/30 px-0.5 text-foreground">{linea.slice(i, hasta)}</mark>
      {linea.slice(hasta)}
    </>
  );
}

export function BuscadorExpediente() {
  const [abiertos, setAbiertos] = useState<string[]>([]);
  const [sel, setSel] = useState<string | null>(null);
  const [buscado, setBuscado] = useState(false);

  function abrir(nombre: string) {
    setSel(nombre);
    setAbiertos((a) => (a.includes(nombre) ? a : [...a, nombre]));
  }

  const archivo = ARCHIVOS.find((a) => a.nombre === sel);
  const encontrado = ARCHIVOS.find((a) => a.hallazgo);
  const escaneados = ARCHIVOS.filter((a) => a.texto === null);

  return (
    <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.15fr_1fr]">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-lg font-semibold">
            <span className="text-faint">Busque: </span>“{PREGUNTA}”
          </p>
          <span className="rounded-full border border-line bg-panel/60 px-3 py-1 font-mono text-xs text-muted">
            abiertos: <b className="text-teal">{abiertos.length}</b> / {ARCHIVOS.length}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {ARCHIVOS.map((a, i) => {
            const on = sel === a.nombre;
            const visto = abiertos.includes(a.nombre);
            const acierto = buscado && a.hallazgo;
            const imagen = buscado && a.texto === null;
            return (
              <button
                key={a.nombre}
                onClick={() => abrir(a.nombre)}
                className={cn(
                  "rise flex flex-col items-center gap-1 rounded-xl border p-2.5 text-center transition active:scale-[0.97]",
                  acierto
                    ? "border-yellow-400 bg-yellow-400/15"
                    : imagen
                      ? "border-magenta/60 bg-magenta/10"
                      : on
                        ? "border-teal bg-teal/15"
                        : visto
                          ? "border-line bg-panel/30 opacity-60"
                          : "border-line bg-panel/50 hover:border-teal/50",
                )}
                style={{ animationDelay: `${0.2 + i * 0.03}s` }}
              >
                <span className="flex h-9 w-7 items-center justify-center rounded border border-line bg-ink-2 text-[8px] font-bold text-faint">
                  PDF
                </span>
                <span className="w-full truncate text-[11px] leading-tight">{a.nombre}</span>
                <span className="text-[10px] text-faint">{a.paginas} pág.</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={() => {
            setBuscado(true);
            if (encontrado) abrir(encontrado.nombre);
          }}
          className="pulse-ring mt-4 w-full rounded-xl border-gradient px-5 py-3 text-left transition hover:brightness-110"
        >
          <span className="text-gradient text-base font-bold">🔎 Buscar “{TERMINO}…” en todo el expediente</span>
        </button>
      </div>

      <div className="glass min-h-[22rem] rounded-2xl p-5">
        {buscado && (
          <div className="rise mb-4 space-y-2 rounded-xl border border-yellow-400/50 bg-yellow-400/10 p-3 text-sm">
            <p>
              <b className="text-yellow-400">1 coincidencia</b> en <span className="font-mono">{encontrado?.nombre}</span> — no en la cédula.
            </p>
            <p className="text-muted">
              ⚠ <span className="font-mono">{escaneados[0]?.nombre}</span> es una imagen escaneada: la búsqueda no puede leerla sin OCR
              (reconocimiento de texto).
            </p>
          </div>
        )}
        {!archivo ? (
          <div className="flex h-full min-h-[16rem] flex-col items-center justify-center text-center">
            <span className="text-4xl">📂</span>
            <p className="mt-3 max-w-xs text-sm text-faint">Abra los archivos uno por uno para encontrar el dato… o busque en todo el expediente.</p>
          </div>
        ) : (
          <div key={archivo.nombre} className="rise">
            <p className="font-mono text-sm text-teal">{archivo.nombre}</p>
            <p className="mb-3 text-xs text-faint">
              página {archivo.hallazgo ? 2 : 1} de {archivo.paginas} · expediente ficticio
            </p>
            {archivo.texto === null ? (
              <div className="rounded-xl border border-dashed border-magenta/50 bg-ink-2/80 p-5 text-center">
                <div className="mx-auto mb-3 h-24 w-full max-w-[14rem] rounded bg-gradient-to-b from-panel via-ink-2 to-panel opacity-70 blur-[1.5px]" />
                <p className="text-sm text-magenta">📷 Documento escaneado: es una imagen.</p>
                <p className="mt-1 text-xs text-muted">Se puede mirar, pero no buscar ni copiar su texto.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {archivo.texto.map((l) => (
                  <p key={l} className="rounded-lg border border-line/60 p-3 text-sm leading-relaxed">
                    {archivo.hallazgo && buscado ? resaltar(l, TERMINO) : l}
                  </p>
                ))}
                {!archivo.hallazgo && <p className="pt-1 text-center text-xs text-faint">Nada sobre la notificación en esta página.</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
