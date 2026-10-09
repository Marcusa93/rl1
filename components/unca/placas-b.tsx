"use client";

// Cuerpos de las placas 14 a 30 de /unca (bloques III, IV y V). Mismo
// criterio que placas-a.tsx: cada parte del revelado va en <Unidad i={n}>.

import { useState } from "react";
import { Unidad, useRevelado } from "@/components/tribunal/revelado";
import { Cadena } from "@/components/unca/labs";
import { BloqueActividad } from "@/components/unca/marco";
import {
  C,
  DocumentoSimulado,
  Garabato,
  GlifoBalanza,
  GlifoCheck,
  GlifoDocumento,
  GlifoEngranaje,
  GlifoHuella,
  GlifoImpresora,
  GlifoInstitucion,
  GlifoLlave,
  GlifoOjo,
  GlifoPersona,
  GlifoPregunta,
  GlifoReloj,
  QrDecorativo,
  retraso,
  SelloLacre,
} from "@/components/unca/piezas";
import { Barras, Escala, Nube, useDatos, useVivo } from "@/components/unca/resultados";
import { getUcActividad, UC_FRASE_FINAL, UC_MATERIAL_IA, type UcPlaca } from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

type P = { placa: UcPlaca };

// 14 · El expediente ya no vive en papel
const ETAPAS = [
  { t: "Escrito firmado", v: "El abogado firma y presenta", p: "firma digital", g: "doc" },
  { t: "Cargo digital", v: "Fecha y hora de presentación", p: "evidencia temporal", g: "reloj" },
  { t: "Providencia o sentencia", v: "Firmada digitalmente por el juez", p: "firma + certificado", g: "balanza" },
  { t: "Notificación electrónica", v: "Al domicilio constituido", p: "registro de envío", g: "inst" },
  { t: "Testimonio o certificación", v: "Sale hacia escribanías y registros", p: "verificable en origen", g: "sello" },
];

function Expediente() {
  const icono = (g: string) =>
    g === "doc" ? (
      <GlifoDocumento className="size-11 text-uc-azul" />
    ) : g === "reloj" ? (
      <GlifoReloj className="size-11 text-uc-cian" />
    ) : g === "balanza" ? (
      <GlifoBalanza className="size-11 text-uc-verde" />
    ) : g === "inst" ? (
      <GlifoInstitucion className="size-11 text-uc-azul" />
    ) : (
      <SelloLacre className="size-11" letra="T" />
    );
  const paso = (i: number) => [0, 0, 1, 2, 3][i];
  return (
    <div className="flex flex-1 flex-col justify-center gap-10">
      <div className="relative grid grid-cols-5 gap-4">
        <span className="absolute left-[10%] right-[10%] top-[2.6rem] h-0.5 bg-uc-linea" />
        {ETAPAS.map((e, i) => (
          <Unidad key={e.t} i={paso(i)} label={e.t} className="relative flex flex-col items-center text-center">
            <span className="relative z-10 flex size-[5.2rem] items-center justify-center rounded-full border border-uc-linea bg-uc-hoja shadow-sm">{icono(e.g)}</span>
            <p className="mt-4 text-[1.3rem] font-semibold leading-tight text-uc-tinta">{e.t}</p>
            <p className="mt-1 text-[1.02rem] leading-snug text-uc-pizarra">{e.v}</p>
            <span className="uc-mono mt-3 rounded-full bg-uc-hielo px-3 py-1 text-[0.8rem] text-uc-cian">{e.p}</span>
          </Unidad>
        ))}
      </div>
      <Unidad i={3} label="Lo que no se imprime" className="mx-auto flex items-center gap-4 rounded-2xl border border-uc-ocre/40 bg-uc-ocre-claro px-6 py-4">
        <GlifoImpresora className="size-10 shrink-0 text-uc-ocre" />
        <p className="uc-serif text-[1.5rem] leading-snug text-uc-tinta">Cada etapa tiene propiedades verificables que viven en el sistema, no en una impresión.</p>
      </Unidad>
    </div>
  );
}

// 15 · Un QR no es una firma digital — dos códigos, dos destinos
function DocQr({ letra, qr, url, visibles }: { letra: string; qr: string; url: string; visibles: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="uc-hoja relative w-full rounded-2xl border border-uc-linea p-5">
        <span className="uc-serif absolute -left-3 -top-3 flex size-11 items-center justify-center rounded-full bg-uc-tinta text-[1.4rem] text-white">{letra}</span>
        <p className="text-center text-[0.95rem] text-uc-pizarra">Testimonio VE-2026-0417 · Juzgado Civil N.º 9 de Villa Esperanza (ficticio)</p>
        <p className="text-center text-[0.85rem] font-semibold text-uc-verde">Escaneá para validar este documento</p>
        <div className="mt-3 flex items-center justify-center gap-6">
          <img src={qr} alt={`Código QR ${letra} de la demostración`} className="size-[11.5rem] rounded-lg border border-uc-linea" />
          <div className="grid w-28 gap-2">
            {[100, 80, 92, 60, 85].map((w, i) => (
              <span key={i} className="uc-renglon" style={{ width: `${w}%` }} />
            ))}
            <Garabato className="mt-2 w-24" />
          </div>
        </div>
      </div>
      {visibles > 0 && (
        <div className="tf-sube w-full rounded-xl border border-uc-lacre/40 bg-uc-lacre-claro px-4 py-3 text-center">
          <p className="uc-rotulo text-[0.6rem] text-uc-pizarra">Lo que realmente dice el código</p>
          <p className="uc-mono mt-1 text-[1.05rem] text-uc-tinta">{url}</p>
          <p className="mt-1 text-[0.9rem] font-semibold text-uc-lacre">No lleva a ningún validador</p>
        </div>
      )}
    </div>
  );
}

function Qr() {
  const { visibles } = useRevelado();
  return (
    <div className="grid flex-1 grid-cols-[1fr_1fr_0.8fr] items-start gap-7">
      <DocQr letra="A" qr="/unca/qr-a.svg" url="instagram.com/marquitorossi" visibles={visibles} />
      <DocQr letra="B" qr="/unca/qr-b.svg" url="instagram.com/laviejaescuelatuc" visibles={visibles} />
      <div className="grid gap-4 self-center">
        <p className="tf-sube flex items-center gap-3 rounded-2xl border border-uc-ocre/50 bg-uc-ocre-claro px-5 py-4 text-[1.2rem] text-uc-tinta">
          <span className="text-[1.8rem]">📱</span> Escaneá los dos desde la pantalla
        </p>
        <Unidad as="p" i={0} className="text-[1.25rem] leading-snug text-uc-tinta">
          Un QR es solo <b>texto</b> (casi siempre una dirección) dibujado en cuadraditos. Cualquiera puede generar uno, copiarlo o pegar otro encima.
        </Unidad>
        <Unidad as="p" i={1} label="Lo que verifica" className="uc-serif border-l-[0.35rem] border-uc-verde pl-5 text-[1.5rem] leading-snug text-uc-azul">
          Lo que verifica no es el código: es el sitio oficial al que conduce y el mecanismo que efectivamente comprueba el documento.
        </Unidad>
      </div>
    </div>
  );
}

// 16 · Recibimos un documento. ¿Ahora qué? (+ intervención 5)
function Testimonio({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  return (
    <div className="grid flex-1 grid-cols-[0.72fr_1.28fr] gap-8">
      <div className="uc-hoja tf-sube flex flex-col overflow-hidden rounded-[1.5rem] border border-uc-linea" style={retraso(0.1)}>
        <div className="border-b border-uc-linea bg-uc-papel px-5 py-3 text-[0.95rem] leading-relaxed">
          <p>
            <span className="text-uc-niebla">De:</span> <span className="text-uc-tinta">notificaciones@juzgado9-villaesperanza.example</span>
          </p>
          <p>
            <span className="text-uc-niebla">Asunto:</span> <b className="text-uc-tinta">Testimonio judicial digital · Expte. VE-2026-0417</b>
          </p>
        </div>
        <div className="flex flex-1 flex-col gap-4 p-5">
          <p className="text-[1.05rem] text-uc-tinta">Adjunto el testimonio para su presentación ante el Registro. Saludos.</p>
          <div className="flex items-center gap-4 rounded-xl border border-uc-linea bg-uc-papel/50 p-3">
            <div className="relative h-[8.5rem] w-[6.5rem] shrink-0">
              <DocumentoSimulado filas={5} className="h-full px-2.5 py-2.5" />
              <QrDecorativo className="absolute bottom-2 right-2 size-8" semilla={4} />
              <Garabato className="absolute bottom-3 left-2 w-12" />
            </div>
            <div>
              <p className="uc-mono text-[0.95rem] font-semibold text-uc-tinta">testimonio-VE-0417.pdf</p>
              <p className="text-[0.85rem] text-uc-pizarra">PDF · 214 KB · firma visible y código QR</p>
            </div>
          </div>
          <p className="mt-auto text-[0.85rem] text-uc-niebla">Caso ficticio. Llega a una escribanía para usarse en una operación.</p>
        </div>
      </div>
      <BloqueActividad act={act}>
        {(d) => (
          <div className="flex flex-1 flex-col justify-center">
            <Barras act={act} datos={d} />
          </div>
        )}
      </BloqueActividad>
    </div>
  );
}

// 17 · Imprimir no siempre es conservar
const PROPIEDADES = ["Firma digital", "Certificado", "Huella", "Metadatos", "Sello de tiempo"];

function Imprimir() {
  const { visibles } = useRevelado();
  const impreso = visibles > 0;
  return (
    <div className="flex flex-1 flex-col justify-center gap-8">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-10">
        <div className="tf-sube" style={retraso(0.1)}>
          <p className="uc-rotulo mb-3 text-uc-cian">El archivo firmado</p>
          <div className="uc-frio rounded-2xl border border-uc-cian/30 p-5">
            <DocumentoSimulado filas={5} className="px-5 py-4">
              <Garabato className="ml-auto mt-3 w-28" />
            </DocumentoSimulado>
            <div className="mt-4 flex flex-wrap gap-2">
              {PROPIEDADES.map((p) => (
                <span key={p} className="flex items-center gap-1.5 rounded-full bg-uc-cian px-3 py-1 text-[0.95rem] font-semibold text-white">
                  <GlifoCheck className="size-4" /> {p}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <GlifoImpresora className={cn("size-20 text-uc-tinta transition", impreso && "text-uc-ocre")} />
          <svg viewBox="0 0 80 12" className="w-24" aria-hidden>
            <path d="M2 6 H70 M64 1 L72 6 L64 11" fill="none" stroke={C.ocre} strokeWidth="2" className={cn(impreso && "uc-flujo")} />
          </svg>
        </div>
        <Unidad i={0} label="La copia en papel">
          <p className="uc-rotulo mb-3 text-uc-ocre">La copia en papel</p>
          <div className="rounded-2xl border border-uc-linea bg-[#efe8da] p-5">
            <DocumentoSimulado filas={5} className="rotate-[0.6deg] px-5 py-4">
              <Garabato className="ml-auto mt-3 w-28" />
            </DocumentoSimulado>
            <div className="mt-4 flex flex-wrap gap-2">
              {PROPIEDADES.map((p, i) => (
                <span
                  key={p}
                  className="tf-sube flex items-center gap-1.5 rounded-full border border-dashed border-uc-niebla px-3 py-1 text-[0.95rem] text-uc-niebla line-through"
                  style={retraso(0.2 + i * 0.12)}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        </Unidad>
      </div>
      <Unidad i={0} className="text-center text-[1.35rem] text-uc-tinta">
        Se ve igual. Pero en el papel <b className="text-uc-lacre">no hay nada que verificar matemáticamente</b>.
      </Unidad>
      <Unidad as="p" i={1} label="Copias y testimonios" className="uc-serif mx-auto max-w-[62rem] border-l-[0.35rem] border-uc-verde pl-6 text-[1.45rem] leading-snug text-uc-azul">
        No es que la impresión no valga: su valor depende de las normas y del procedimiento. Copias, testimonios y certificaciones tienen sus propias reglas.
      </Unidad>
    </div>
  );
}

// 18 · El tiempo también importa — una página que existía y dejó de existir
const LINEA = [
  { fecha: "06/12/2025", t: "Archivo histórico", v: "Wayback: la publicación ya existía", http: 200, fuente: "wayback" },
  { fecha: "12/03/2026", t: "Archivo histórico", v: "Wayback: seguía publicada", http: 200, fuente: "wayback" },
  { fecha: "05/07/2026 · 16:31 UTC", t: "Certificado N.º 700128", v: "Página con fotografía", http: 200, fuente: "cert" },
  { fecha: "10/07/2026 · 17:42 UTC", t: "Certificado N.º 700204", v: "La página ya no existe", http: 404, fuente: "cert" },
];

function Tiempo() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-7">
      <div className="uc-hoja rounded-[1.5rem] border border-uc-linea px-8 pb-6 pt-6">
        <p className="uc-mono text-[0.95rem] text-uc-pizarra">tienda-aurora.example/productos/campera-brisa · caso ficticio</p>
        <div className="relative mt-5 grid grid-cols-4 gap-5">
          <span className="absolute left-[12.5%] right-[12.5%] top-[7.1rem] h-2 rounded-full bg-uc-linea" />
          {LINEA.map((e) => (
            <Unidad key={e.fecha} i={e.fuente === "cert" ? 0 : 1} label={e.t} className="relative flex flex-col items-center text-center">
              <div className="flex h-[6.2rem] flex-col items-center justify-end">
                <span className={cn("rounded-md px-2 py-0.5 text-[0.85rem] font-bold text-white", e.http === 200 ? "bg-uc-verde" : "bg-uc-lacre")}>HTTP {e.http}</span>
                <p className="mt-1.5 text-[1.05rem] font-semibold leading-tight text-uc-tinta">{e.t}</p>
                <p className="text-[0.92rem] leading-snug text-uc-pizarra">{e.v}</p>
              </div>
              <span
                className={cn(
                  "relative z-10 mt-2 block size-[1.35rem] rounded-full border-[3px] border-uc-hoja shadow",
                  e.http === 200 ? (e.fuente === "cert" ? "bg-uc-verde" : "bg-uc-salvia") : "bg-uc-lacre",
                )}
              />
              <p className="uc-mono mt-2 text-[0.8rem] text-uc-niebla">{e.fecha}</p>
            </Unidad>
          ))}
        </div>
      </div>
      <Unidad i={2} label="Tres relojes" className="grid grid-cols-3 gap-5">
        {[
          { g: <GlifoDocumento className="size-9" />, t: "La fecha del documento", v: "La declara quien lo redacta", tono: "text-uc-niebla" },
          { g: <GlifoReloj className="size-9" />, t: "El reloj del dispositivo", v: "Se cambia en configuración", tono: "text-uc-ocre" },
          { g: <SelloLacre className="size-9" letra="T" />, t: "El sello de un tercero", v: "Verificable desde afuera", tono: "text-uc-verde" },
        ].map((r) => (
          <div key={r.t} className="flex items-center gap-4 rounded-2xl border border-uc-linea bg-uc-hoja px-5 py-4">
            <span className={r.tono}>{r.g}</span>
            <span>
              <span className={cn("block text-[1.2rem] font-semibold", r.tono)}>{r.t}</span>
              <span className="block text-[1rem] text-uc-pizarra">{r.v}</span>
            </span>
          </div>
        ))}
      </Unidad>
    </div>
  );
}

// 19 · ¿Quién abrirá este archivo dentro de treinta años?
const FORMATOS = [
  { n: "Disquete 5¼″", desde: 1976, hasta: 1998, v: "Hoy casi no hay lectoras" },
  { n: "WordPerfect 5.1", desde: 1989, hasta: 2002, v: "Requiere conversores" },
  { n: "Flash (.swf)", desde: 1996, hasta: 2020, v: "Dejó de funcionar en 2020" },
  { n: "CD-R", desde: 1990, hasta: 2015, v: "El soporte se degrada" },
  { n: "PDF/A (ISO 19005)", desde: 2005, hasta: 2026, v: "Pensado para archivo", vivo: true },
];

function Obsolescencia() {
  const min = 1975;
  const max = 2056;
  const x = (a: number) => ((a - min) / (max - min)) * 100;
  return (
    <div className="grid flex-1 grid-cols-[1.25fr_0.75fr] items-center gap-10">
      <Unidad i={0} label="Formatos que envejecen" className="uc-hoja rounded-[1.5rem] border border-uc-linea p-6">
        <div className="relative grid gap-4">
          <span className="absolute bottom-0 top-0 w-0.5 bg-uc-tinta/70" style={{ left: `calc(11rem + (100% - 11rem) * ${x(2026) / 100})` }} />
          <span className="absolute bottom-0 top-0 w-0.5 border-l-2 border-dashed border-uc-lacre/60" style={{ left: `calc(11rem + (100% - 11rem) * ${x(2056) / 100} - 2px)` }} />
          {FORMATOS.map((f) => (
            <div key={f.n} className="grid grid-cols-[11rem_1fr] items-center">
              <span className="text-[1.08rem] font-semibold text-uc-tinta">{f.n}</span>
              <div className="relative h-8">
                <span
                  className="absolute inset-y-1 rounded-full"
                  style={{
                    left: `${x(f.desde)}%`,
                    width: `${x(f.hasta) - x(f.desde)}%`,
                    background: f.vivo ? `linear-gradient(90deg, ${C.verde}, ${C.verde}88)` : `linear-gradient(90deg, ${C.azul}, ${C.azul}22)`,
                  }}
                />
                {f.vivo && (
                  <span className="absolute inset-y-1 rounded-r-full border-2 border-dashed border-uc-verde/60" style={{ left: `${x(2026)}%`, width: `${x(2056) - x(2026)}%` }} />
                )}
                <span className="absolute top-1/2 -translate-y-1/2 whitespace-nowrap pl-2 text-[0.85rem] text-uc-pizarra" style={{ left: `${x(f.hasta)}%` }}>
                  {f.vivo ? "" : f.v}
                </span>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-[11rem_1fr] text-[0.85rem] text-uc-niebla">
            <span />
            <div className="relative h-5">
              {[1980, 2000, 2026, 2056].map((a) => (
                <span key={a} className={cn("absolute -translate-x-1/2", a === 2026 && "font-semibold text-uc-tinta", a === 2056 && "font-semibold text-uc-lacre")} style={{ left: `${x(a)}%` }}>
                  {a === 2026 ? "hoy" : a === 2056 ? "2056 ?" : a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Unidad>
      <Unidad i={1} label="Qué hay que conservar" className="grid gap-3">
        <p className="uc-rotulo text-uc-verde">Conservar es conservar…</p>
        {["El archivo original", "Un formato estable (PDF/A)", "Las evidencias de validación de la firma", "Los metadatos", "Respaldos en lugares distintos", "Un procedimiento institucional"].map((t, i) => (
          <p key={t} className="tf-sube flex items-center gap-3 text-[1.3rem] text-uc-tinta" style={retraso(i * 0.08)}>
            <GlifoCheck className="size-6 shrink-0 text-uc-verde" />
            {t}
          </p>
        ))}
      </Unidad>
    </div>
  );
}

// 20 · Blockchain
function PlacaCadena() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-5">
      <Cadena />
      <p className="uc-serif text-center text-[1.45rem] text-uc-azul">
        Si el dato registrado era falso, la cadena conserva con fidelidad… <span className="text-uc-lacre">un dato falso</span>.
      </p>
    </div>
  );
}

// 21 · ¿Quién verifica los hechos? (giro + intervención 6)
function GiroHechos({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  return (
    <div className="grid flex-1 grid-cols-[0.62fr_1.38fr] gap-8">
      <div className="flex flex-col justify-center gap-4">
        <div className="tf-sube flex items-center gap-3 rounded-2xl border border-uc-cian/30 bg-uc-hielo px-5 py-4" style={retraso(0.1)}>
          <GlifoHuella className="size-10 shrink-0 text-uc-cian" />
          <p className="text-[1.12rem] leading-snug text-uc-tinta">
            La huella de un documento se registró en una <b>blockchain pública</b>. Años después, <b>coincide</b> con la del archivo presentado.
          </p>
        </div>
        <p className="tf-sube uc-serif text-[1.65rem] leading-snug text-uc-azul" style={retraso(0.25)}>
          ¿Cuánto demuestra eso sobre la <span className="text-uc-lacre">veracidad del contenido</span>?
        </p>
      </div>
      <BloqueActividad act={act}>{(d) => <Escala act={act} datos={d} />}</BloqueActividad>
    </div>
  );
}

// 22 · Ver ya no es creer
const SINTETICOS = [
  { t: "Imágenes", v: "Fotos de hechos que nunca ocurrieron", g: <GlifoOjo className="size-12" /> },
  { t: "Voces", v: "Unos segundos de audio alcanzan para imitar una voz", g: <OndaVoz /> },
  { t: "Videos", v: "Rostros y gestos de personas reales o inexistentes", g: <GlifoPersona className="size-12" /> },
  { t: "Documentos", v: "Membretes, sellos y firmas verosímiles", g: <GlifoDocumento className="size-12" /> },
];

function OndaVoz() {
  return (
    <svg viewBox="0 0 48 48" className="size-12" aria-hidden>
      {[6, 12, 18, 24, 30, 36, 42].map((x, i) => (
        <path key={x} d={`M${x} ${24 - [5, 11, 16, 9, 14, 7, 4][i]} V${24 + [5, 11, 16, 9, 14, 7, 4][i]}`} stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      ))}
    </svg>
  );
}

function Sinteticos() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-9">
      <div className="grid grid-cols-4 gap-5">
        {SINTETICOS.map((s, i) => (
          <Unidad key={s.t} i={i} label={s.t} className="uc-hoja relative overflow-hidden rounded-[1.5rem] border border-uc-linea p-6">
            <span className="absolute right-4 top-4 rounded-md bg-uc-lacre px-2 py-0.5 text-[0.7rem] font-bold tracking-wider text-white">SINTÉTICO</span>
            <span className="uc-glitch inline-block text-uc-azul">{s.g}</span>
            <p className="uc-titular mt-5 text-[2rem] text-uc-tinta">{s.t}</p>
            <p className="mt-2 text-[1.12rem] leading-snug text-uc-pizarra">{s.v}</p>
          </Unidad>
        ))}
      </div>
      <Unidad i={3} className="flex items-center justify-center gap-10">
        {["Más fácil", "Más barato", "A escala"].map((t) => (
          <span key={t} className="uc-serif text-[2.2rem] text-uc-lacre">
            {t}
          </span>
        ))}
      </Unidad>
    </div>
  );
}

// 23 · La persona de la pantalla podría no estar ahí
function Videollamada() {
  const tiles = [
    { n: "Escribano/a", c: C.verde },
    { n: "Compareciente · vendedor", c: C.lacre, sospecha: true },
    { n: "Compareciente · comprador", c: C.azul },
    { n: "Testigo", c: C.salvia },
  ];
  return (
    <div className="grid flex-1 grid-cols-[1.05fr_0.95fr] items-center gap-10">
      <div className="tf-sube rounded-[1.5rem] bg-uc-tinta p-4 shadow-2xl" style={retraso(0.1)}>
        <div className="grid grid-cols-2 gap-3">
          {tiles.map((t) => (
            <div key={t.n} className="relative aspect-video overflow-hidden rounded-xl bg-[#2b3a3f]">
              <svg viewBox="0 0 160 90" className={cn("absolute inset-0 h-full w-full", t.sospecha && "uc-glitch")} aria-hidden>
                <circle cx="80" cy="38" r="17" fill={t.c} opacity="0.85" />
                <path d="M46 90 c0 -22 15 -32 34 -32 s34 10 34 32z" fill={t.c} opacity="0.7" />
              </svg>
              {t.sospecha && <span className="absolute inset-x-0 top-1/2 h-px bg-[#8fd3d8]/60 uc-latido" />}
              <span className="absolute bottom-2 left-2 rounded bg-black/55 px-2 py-0.5 text-[0.75rem] text-white">{t.n}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-3 text-white/70">
          <span className="size-3 rounded-full bg-uc-lacre" />
          <span className="text-[0.8rem]">Videoconferencia ficticia · acto a distancia</span>
        </div>
      </div>
      <div className="grid gap-5">
        <Unidad i={0} label="Imagen e identidad" className="flex items-center gap-4">
          <GlifoOjo className="size-11 shrink-0 text-uc-azul" />
          <p className="text-[1.45rem] leading-snug text-uc-tinta">
            Ver la imagen de una persona <b className="text-uc-lacre">no es acreditar</b> su identidad.
          </p>
        </Unidad>
        <Unidad i={1} label="Presencia y voluntad" className="flex items-center gap-4">
          <GlifoPersona className="size-11 shrink-0 text-uc-azul" />
          <p className="text-[1.45rem] leading-snug text-uc-tinta">Tampoco su presencia ni su voluntad.</p>
        </Unidad>
        <Unidad i={2} label="Hong Kong, 2024" className="grid gap-4">
          <div className="rounded-2xl border border-uc-lacre/40 bg-uc-lacre-claro px-5 py-4">
            <p className="uc-rotulo text-[0.62rem] text-uc-lacre">Caso público · Hong Kong, 2024</p>
            <p className="mt-1.5 text-[1.12rem] leading-snug text-uc-tinta">
              Un empleado transfirió unos <b>US$ 25 millones</b> después de una videollamada en la que el director financiero y otros colegas eran recreaciones con IA.
            </p>
          </div>
          <p className="uc-serif border-l-[0.35rem] border-uc-verde pl-5 text-[1.35rem] leading-snug text-uc-azul">
            Que la videoconferencia sea técnicamente posible no la habilita jurídicamente para cualquier acto.
          </p>
        </Unidad>
      </div>
    </div>
  );
}

// 24 · ¿Podés distinguir lo real de lo artificial? (+ intervención 7)
function RealIa({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  const [falta, setFalta] = useState(false);
  const { vista } = useVivo();
  const revelada = vista(act).revelada;
  return (
    <div className="grid flex-1 grid-cols-[1.05fr_0.95fr] gap-8">
      <div className="relative flex items-center justify-center overflow-hidden rounded-[1.5rem] bg-uc-tinta">
        {!falta ? (
          UC_MATERIAL_IA.tipo === "video" ? (
            <video src={UC_MATERIAL_IA.src} controls playsInline className="max-h-[30rem] w-full" onError={() => setFalta(true)} />
          ) : (
            <img src={UC_MATERIAL_IA.src} alt="Material para la votación" className="max-h-[30rem] w-full object-contain" onError={() => setFalta(true)} />
          )
        ) : (
          <div className="grid max-w-md gap-3 p-8 text-center text-white/85">
            <GlifoPregunta className="mx-auto size-16 text-uc-ocre" />
            <p className="uc-serif text-[1.6rem]">Material pendiente</p>
            <p className="text-[1rem] leading-snug text-white/70">
              Guardá el video o la imagen sintética en <span className="uc-mono">public{UC_MATERIAL_IA.src}</span> (o cambiá la ruta en lib/unca-clase.ts).
            </p>
          </div>
        )}
        {revelada && (
          <span className="tf-sube absolute left-4 top-4 rounded-lg bg-uc-lacre px-3 py-1.5 text-[1rem] font-bold text-white shadow">
            {UC_MATERIAL_IA.origen === "ia" ? "🤖 GENERADO CON IA" : "🎥 GRABACIÓN REAL"}
          </span>
        )}
      </div>
      <BloqueActividad act={act}>{(d) => <Barras act={act} datos={d} />}</BloqueActividad>
    </div>
  );
}

// 25 · Una identidad no es solamente una cara
const CAPAS = [
  { t: "Algo que sabés", ej: "PIN, clave", aporta: "Fácil de usar", limite: "Se filtra, se comparte, se adivina" },
  { t: "Algo que tenés", ej: "Token, celular", aporta: "Hay que poseerlo", limite: "Se presta o se roba" },
  { t: "Algo que sos", ej: "Huella, rostro, voz", aporta: "Ligado al cuerpo", limite: "Se imita; hay errores; son datos sensibles" },
  { t: "Prueba de vida", ej: "Gestos, profundidad", aporta: "Detecta fotos y grabaciones", limite: "Los ataques también evolucionan" },
  { t: "Intervención institucional", ej: "Escribano, juzgado", aporta: "Responsabilidad y procedimiento", limite: "Tampoco es infalible" },
  { t: "Contexto del acto", ej: "Coherencia, riesgo", aporta: "¿Tiene sentido lo que pasa?", limite: "Exige criterio profesional" },
];

function Identidad() {
  const [sel, setSel] = useState<number | null>(null);
  const colores = [C.cian, C.azul, "#5c7d6c", C.verde, C.ocre, C.lacre];
  return (
    <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-12">
      <div className="tf-sube relative size-[26rem]" style={retraso(0.1)}>
        {CAPAS.map((c, i) => {
          const r = 100 - i * 14;
          return (
            <button
              key={c.t}
              onClick={() => setSel(sel === i ? null : i)}
              className={cn("absolute rounded-full border-2 transition", sel === i ? "z-10 shadow-xl" : "hover:brightness-105")}
              style={{
                inset: `${(100 - r) / 2}%`,
                borderColor: colores[i],
                background: sel === i ? `${colores[i]}33` : `${colores[i]}${i % 2 ? "14" : "0d"}`,
              }}
              aria-label={c.t}
            >
              <span className="absolute left-1/2 top-[0.35rem] -translate-x-1/2 whitespace-nowrap text-[0.8rem] font-semibold" style={{ color: colores[i] }}>
                {c.t}
              </span>
            </button>
          );
        })}
        <GlifoPersona className="pointer-events-none absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-uc-tinta" />
      </div>
      <div className="grid gap-2.5">
        {CAPAS.map((c, i) => (
          <button
            key={c.t}
            onClick={() => setSel(sel === i ? null : i)}
            className={cn("grid grid-cols-[1.2rem_1fr] items-start gap-4 rounded-2xl border px-5 py-3 text-left transition", sel === i ? "border-uc-tinta bg-uc-hoja shadow-md" : "border-transparent", sel !== null && sel !== i && "opacity-45")}
          >
            <span className="mt-1.5 size-3.5 rounded-full" style={{ background: colores[i] }} />
            <span>
              <span className="text-[1.3rem] font-semibold text-uc-tinta">{c.t}</span> <span className="text-[1rem] text-uc-niebla">· {c.ej}</span>
              {sel === i && (
                <span className="tf-sube mt-1.5 grid grid-cols-2 gap-4 text-[1.05rem] leading-snug">
                  <span className="text-uc-verde">✓ {c.aporta}</span>
                  <span className="text-uc-lacre">✗ {c.limite}</span>
                </span>
              )}
            </span>
          </button>
        ))}
        <p className="uc-serif mt-2 text-[1.35rem] leading-snug text-uc-azul">Las garantías se combinan según el riesgo y los requisitos del acto.</p>
      </div>
    </div>
  );
}

// 26 · Una firma válida. Una voluntad inexistente. (giro)
function GiroVoluntad() {
  return (
    <div className="grid flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-12">
      <div className="tf-sube relative" style={retraso(0.1)}>
        <DocumentoSimulado filas={9} className="px-7 py-7">
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-uc-verde/40 bg-uc-salvia-claro px-4 py-3">
            <GlifoCheck className="size-9 shrink-0 text-uc-verde" />
            <span className="text-[1.05rem] font-semibold leading-tight text-uc-verde">
              Firma verificada
              <br />
              <span className="font-normal">certificado vigente al firmar</span>
            </span>
          </div>
        </DocumentoSimulado>
        <span className="uc-serif absolute -right-6 -top-6 flex size-24 items-center justify-center rounded-full border-4 border-uc-hoja bg-uc-lacre text-[3rem] text-white shadow-xl">?</span>
      </div>
      <div className="grid gap-5">
        <Unidad i={0} label="La clave en otras manos" className="flex items-start gap-4 rounded-2xl border border-uc-linea bg-uc-hoja px-5 py-4">
          <GlifoLlave className="size-10 shrink-0 text-uc-lacre" />
          <p className="text-[1.3rem] leading-snug text-uc-tinta">El token del titular estaba en manos de un colaborador, que conocía el PIN.</p>
        </Unidad>
        <Unidad i={1} label="El consentimiento con engaño" className="flex items-start gap-4 rounded-2xl border border-uc-linea bg-uc-hoja px-5 py-4">
          <GlifoPersona className="size-10 shrink-0 text-uc-lacre" />
          <p className="text-[1.3rem] leading-snug text-uc-tinta">La firma se obtuvo durante una videollamada con un supuesto banco.</p>
        </Unidad>
        <Unidad as="p" i={2} label="La verificación no lo resuelve" className="uc-serif border-l-[0.35rem] border-uc-verde pl-6 text-[1.7rem] leading-snug text-uc-azul">
          La matemática verifica. La voluntad, la identidad real y los vicios del acto se siguen discutiendo en el derecho.
        </Unidad>
      </div>
    </div>
  );
}

// 27 · ¿Una máquina puede dar fe?
const COLUMNAS = [
  { t: "Automatizable", g: <GlifoEngranaje className="size-11" />, c: "text-uc-cian", borde: "border-uc-cian/40", items: ["Comparar huellas", "Verificar firmas y certificados", "Consultar revocaciones", "Controlar formatos"] },
  { t: "Interpretación jurídica", g: <GlifoBalanza className="size-11" />, c: "text-uc-verde", borde: "border-uc-verde/40", items: ["Calificar el acto", "Valorar la prueba", "Capacidad y competencia", "Consecuencias jurídicas"] },
  { t: "Procedimiento institucional", g: <GlifoInstitucion className="size-11" />, c: "text-uc-lacre", borde: "border-uc-lacre/40", items: ["Fe pública", "Protocolo y matricidad", "Identificar comparecientes", "Conservación oficial"] },
];

function Maquina() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-7">
      <div className="grid grid-cols-3 gap-6">
        {COLUMNAS.map((col, i) => (
          <Unidad key={col.t} i={i} label={col.t} className={cn("uc-hoja rounded-[1.5rem] border-t-[0.4rem] p-6", col.borde)}>
            <span className={col.c}>{col.g}</span>
            <p className={cn("uc-titular mt-3 text-[1.9rem]", col.c)}>{col.t}</p>
            <ul className="mt-4 grid gap-2.5">
              {col.items.map((x) => (
                <li key={x} className="flex items-center gap-3 text-[1.25rem] text-uc-tinta">
                  <span className="size-2 rounded-full bg-current opacity-60" />
                  {x}
                </li>
              ))}
            </ul>
          </Unidad>
        ))}
      </div>
      <Unidad as="p" i={2} className="uc-serif text-center text-[1.6rem] text-uc-azul">
        No son adversarias: hay que saber qué le toca a cada una.
      </Unidad>
    </div>
  );
}

// 28 · El problema no es la tecnología. Es confiar sin verificar.
const CRITERIOS = [
  { t: "Origen", q: "¿De dónde viene y por qué canal llegó?", g: <GlifoInstitucion className="size-9" /> },
  { t: "Integridad", q: "¿Cambió desde que se firmó?", g: <GlifoHuella className="size-9" /> },
  { t: "Firma y certificado", q: "¿De quién es, quién lo emitió, estaba vigente?", g: <GlifoLlave className="size-9" /> },
  { t: "Tiempo", q: "¿Hay evidencia temporal de un tercero?", g: <GlifoReloj className="size-9" /> },
  { t: "Identidad", q: "¿Quién intervino realmente?", g: <GlifoPersona className="size-9" /> },
  { t: "Contexto del acto", q: "¿Qué se quiso y con qué requisitos?", g: <GlifoBalanza className="size-9" /> },
];

function Criterios() {
  return (
    <div className="grid flex-1 grid-cols-2 content-center gap-x-8 gap-y-4">
      {CRITERIOS.map((c, i) => (
        <Unidad key={c.t} i={i} label={c.t} className="flex items-center gap-5 rounded-2xl border border-uc-linea bg-uc-hoja px-6 py-4">
          <span className="relative flex size-14 shrink-0 items-center justify-center rounded-full bg-uc-salvia-claro text-uc-verde">
            {c.g}
            <span className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-uc-verde text-[0.8rem] font-bold text-white">✓</span>
          </span>
          <span>
            <span className="uc-titular block text-[1.8rem] text-uc-tinta">{c.t}</span>
            <span className="block text-[1.15rem] text-uc-pizarra">{c.q}</span>
          </span>
        </Unidad>
      ))}
      <div className="col-span-2 mt-3 grid grid-cols-2 gap-8 text-center">
        <p className="rounded-xl bg-uc-lacre-claro px-4 py-2.5 text-[1.15rem] text-uc-lacre">Adoptar sin entender</p>
        <p className="rounded-xl bg-uc-lacre-claro px-4 py-2.5 text-[1.15rem] text-uc-lacre">Rechazar sin conocer</p>
      </div>
    </div>
  );
}

// 29 · ¿Qué harías ahora? (+ intervención 8)
function Decision({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  const hechos = [
    { g: <GlifoCheck className="size-8 text-uc-verde" />, t: "Documento firmado digitalmente: la verificación técnica es satisfactoria" },
    { g: <GlifoPersona className="size-8 text-uc-azul" />, t: "El acto estuvo precedido por una videoconferencia" },
    { g: <GlifoPregunta className="size-8 text-uc-lacre" />, t: "Hay indicios de que uno de los intervinientes fue suplantado con IA" },
  ];
  return (
    <div className="grid flex-1 grid-cols-[0.7fr_1.3fr] gap-8">
      <div className="uc-hoja flex flex-col justify-center gap-4 rounded-[1.5rem] border border-uc-linea p-6">
        <p className="uc-rotulo text-uc-pizarra">Caso final</p>
        {hechos.map((h, i) => (
          <div key={i} className="tf-sube flex items-start gap-3" style={retraso(0.15 + i * 0.15)}>
            <span className="shrink-0">{h.g}</span>
            <p className="text-[1.2rem] leading-snug text-uc-tinta">{h.t}</p>
          </div>
        ))}
      </div>
      <BloqueActividad act={act}>{(d) => <Barras act={act} datos={d} />}</BloqueActividad>
    </div>
  );
}

// 30 · La confianza cambia de arquitectura
const CAPAS_FINALES = ["Personas e instituciones", "Huella e integridad", "Firma y certificado", "Sello de tiempo", "Conservación", "Identidad", "Criterio profesional"];

function Arquitectura() {
  const primera = getUcActividad("uc_confianza")!;
  const datos = useDatos(primera);
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-6">
        <div className="uc-hoja flex h-full flex-col rounded-[1.5rem] border border-uc-linea p-5">
          <p className="uc-rotulo text-uc-ocre">Al empezar, la sala confiaba en…</p>
          <div className="flex flex-1 items-center">
            <Nube act={primera} datos={datos} alto={12} />
          </div>
        </div>
        <svg viewBox="0 0 60 20" className="w-16" aria-hidden>
          <path d="M2 10 H54 M46 3 L56 10 L46 17" fill="none" stroke={C.verde} strokeWidth="2.5" className="uc-flujo" />
        </svg>
        <Unidad i={0} label="La nueva arquitectura" className="flex h-full flex-col justify-end gap-1.5">
          <p className="uc-rotulo mb-2 text-uc-verde">…ahora, una arquitectura</p>
          {[...CAPAS_FINALES].reverse().map((c, i) => {
            const base = CAPAS_FINALES.length - 1 - i;
            return (
              <div
                key={c}
                className="tf-sube flex items-center justify-center rounded-lg py-2 text-[1.15rem] font-semibold text-white"
                style={{
                  ...retraso(0.15 * base),
                  marginLeft: `${i * 0.6}rem`,
                  marginRight: `${i * 0.6}rem`,
                  background: base === 0 ? C.lacre : base === CAPAS_FINALES.length - 1 ? C.verde : [C.cian, C.azul, "#5c7d6c", C.cian, C.azul][(base - 1) % 5],
                }}
              >
                {c}
              </div>
            );
          })}
        </Unidad>
      </div>
      <Unidad as="p" i={1} label="Frase final" className="uc-serif text-center text-[2.05rem] leading-snug text-uc-tinta">
        «{UC_FRASE_FINAL}»
      </Unidad>
    </div>
  );
}

export const CUERPOS_B = {
  expediente: Expediente,
  qr: Qr,
  testimonio: Testimonio,
  imprimir: Imprimir,
  tiempo: Tiempo,
  obsolescencia: Obsolescencia,
  cadena: PlacaCadena,
  "giro-hechos": GiroHechos,
  sinteticos: Sinteticos,
  videollamada: Videollamada,
  "real-ia": RealIa,
  identidad: Identidad,
  "giro-voluntad": GiroVoluntad,
  maquina: Maquina,
  criterios: Criterios,
  decision: Decision,
  arquitectura: Arquitectura,
} as const;
