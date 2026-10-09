"use client";

// Marco común de las pantallas de /unca: encabezado de placa (con el texto
// circular en las placas de giro), bloque de intervención en vivo, portada,
// ingreso de la sala y laboratorios.

import type { ReactNode } from "react";
import { useLive } from "@/components/use-live";
import { Rotulo, retraso, SelloLacre, TextoCircular } from "@/components/unca/piezas";
import { CintaIntervencion, Ocultos, Revelacion, useDatos, useVivo } from "@/components/unca/resultados";
import {
  UC_BLOQUES,
  UC_DIPLOMATURA,
  UC_DOCENTE,
  UC_INSTITUCION,
  UC_LINK,
  UC_LOGO,
  UC_MODULO,
  UC_PREGUNTA,
  UC_QR,
  UC_SUBTITULO,
  UC_TITULO,
  type UcActividad,
  type UcLab,
  type UcPlaca,
} from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

const rotuloBloque = (b: number) => `Bloque ${UC_BLOQUES[b]?.num} · ${UC_BLOQUES[b]?.nombre}`;

export function PlacaMarco({ placa, children }: { placa: UcPlaca; children: ReactNode }) {
  if (placa.giro)
    return (
      <article className="flex flex-1 flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-10">
          <div className="min-w-0">
            <Rotulo>{rotuloBloque(placa.bloque)}</Rotulo>
            <h1 className="uc-titular tf-sube mt-4 text-[3.3rem] text-uc-tinta">{placa.titulo}</h1>
            <p className="tf-sube mt-3 text-[1.4rem] leading-snug text-uc-pizarra" style={retraso(0.1)}>
              {placa.bajada}
            </p>
          </div>
          <TextoCircular
            texto={placa.giro}
            className="w-[12.5rem]"
            centro={<span className="uc-serif text-[3.2rem] font-light text-uc-verde tabular-nums">{String(placa.num).padStart(2, "0")}</span>}
          />
        </header>
        <div className="mt-5 flex flex-1 flex-col">{children}</div>
      </article>
    );
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-10">
        <div className="min-w-0">
          <Rotulo>{rotuloBloque(placa.bloque)}</Rotulo>
          <h1 className="uc-titular tf-sube mt-4 max-w-[64rem] text-[3.2rem] text-uc-tinta">{placa.titulo}</h1>
          <p className="tf-sube mt-3 max-w-[60rem] text-[1.4rem] leading-snug text-uc-pizarra" style={retraso(0.1)}>
            {placa.bajada}
          </p>
        </div>
        <span className="uc-serif shrink-0 text-[5.2rem] font-light leading-[0.8] text-uc-salvia tabular-nums">{String(placa.num).padStart(2, "0")}</span>
      </header>
      <div className="mt-7 flex flex-1 flex-col">{children}</div>
    </article>
  );
}

/** Una intervención dentro de su placa: cinta, resultados (o la cuenta, si están ocultos) y la revelación. */
export function BloqueActividad({
  act,
  children,
  className,
  revelacion = true,
}: {
  act: UcActividad;
  children: (datos: ReturnType<typeof useDatos>) => ReactNode;
  className?: string;
  revelacion?: boolean;
}) {
  const datos = useDatos(act);
  const { vista } = useVivo();
  const { mostrar, revelada } = vista(act);
  return (
    <div className={cn("flex flex-1 flex-col gap-4", className)}>
      <CintaIntervencion act={act} datos={datos} />
      {mostrar ? <div className="tf-sube flex flex-1 flex-col">{children(datos)}</div> : <Ocultos act={act} datos={datos} />}
      {revelacion && revelada && <Revelacion texto={act.revela} />}
    </div>
  );
}

/** Enlace para participar, con un QR chico (en la videollamada, se escanea desde la pantalla). */
export function EnlaceChip({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3 rounded-2xl border border-uc-linea bg-uc-hoja p-2 pr-4 shadow-sm", className)}>
      <img src={UC_QR} alt="Código QR para participar" className="size-[4.6rem]" />
      <div>
        <p className="uc-rotulo text-[0.58rem] text-uc-pizarra">Participá desde tu dispositivo</p>
        <p className="uc-serif mt-0.5 text-[1.1rem] font-medium text-uc-verde">{UC_LINK}</p>
      </div>
    </div>
  );
}

// --- Portada ---------------------------------------------------------------------------------------------

export function Portada() {
  return (
    <div className="grid flex-1 grid-cols-[1.25fr_0.75fr] items-center gap-12">
      <div>
        <img src={UC_LOGO} alt={UC_INSTITUCION} className="tf-sube h-[3.6rem] w-auto" />
        <p className="uc-rotulo tf-sube mt-10 text-uc-verde" style={retraso(0.1)}>
          {UC_DIPLOMATURA} · {UC_MODULO}
        </p>
        <h1 className="uc-titular tf-sube mt-5 text-[5rem] leading-[0.98] text-uc-tinta" style={retraso(0.18)}>
          {UC_TITULO}
        </h1>
        <p className="tf-sube mt-6 max-w-[50rem] text-[1.45rem] leading-snug text-uc-pizarra" style={retraso(0.3)}>
          {UC_SUBTITULO}
        </p>
        <p className="uc-serif tf-sube mt-8 flex items-center gap-4 text-[2rem] text-uc-azul" style={retraso(0.45)}>
          <span className="h-px w-12 bg-uc-verde" />
          {UC_DOCENTE}
        </p>
      </div>
      <PortadaGrafico />
    </div>
  );
}

/** De lo material a lo matemático: un sello de lacre sobre un documento y, detrás, su huella. */
function PortadaGrafico() {
  return (
    <div className="tf-sube relative mx-auto aspect-[4/5] w-full max-w-[24rem]" style={retraso(0.35)}>
      <div className="uc-frio absolute right-0 top-0 h-[78%] w-[78%] rotate-[4deg] rounded-2xl border border-uc-cian/25 p-5">
        <p className="uc-mono break-all text-[0.85rem] leading-relaxed text-uc-cian/80">
          9f2c41ab7e0d38c5 1b6a94f2e07d5c13 a8e4b26f90c1d37e 5f0b8a2d46e1c97b 3d7a10e5c84f2b69 e6c2f9a01b7d4835
        </p>
      </div>
      <div className="uc-hoja absolute bottom-0 left-0 h-[82%] w-[80%] -rotate-[3deg] rounded-2xl border border-uc-linea p-7">
        <div className="grid gap-3">
          <span className="uc-renglon h-3 w-1/2 bg-uc-azul/50" />
          {["100%", "92%", "96%", "70%", "100%", "88%", "60%"].map((w, i) => (
            <span key={i} className="uc-renglon" style={{ width: w }} />
          ))}
        </div>
        <SelloLacre className="absolute -bottom-6 right-6 size-[7.5rem] drop-shadow-lg" letra="F" />
      </div>
    </div>
  );
}

// --- Ingreso de la sala ------------------------------------------------------------------------------------

export function Ingreso({ slug }: { slug: string }) {
  const { demo } = useVivo();
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 3000);
  return (
    <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-16">
      <div className="tf-sube rounded-[1.75rem] border border-uc-linea bg-uc-hoja p-5 shadow-sm">
        <img src={UC_QR} alt="Código QR para ingresar" style={{ width: "min(48vh, 25rem)", height: "min(48vh, 25rem)" }} />
      </div>
      <div>
        <p className="uc-rotulo flex items-center gap-3 text-uc-ocre">
          <span className="size-2 animate-pulse rounded-full bg-uc-ocre" />
          Participación en vivo
        </p>
        <h1 className="uc-titular tf-sube mt-5 text-[3.6rem] text-uc-tinta" style={retraso(0.1)}>
          Entrá desde tu celular o tu computadora
        </h1>
        <p className="uc-serif tf-sube mt-5 text-[2.6rem] font-medium text-uc-verde" style={retraso(0.2)}>
          {UC_LINK}
        </p>
        <p className="tf-sube mt-4 text-[1.35rem] leading-snug text-uc-pizarra" style={retraso(0.3)}>
          Escaneá el código desde la pantalla o abrí el enlace del chat. Es anónimo: no pide nombre ni datos.
        </p>
        <div className="tf-sube mt-7 flex items-baseline gap-4" style={retraso(0.4)}>
          <span className="uc-serif text-[4.5rem] leading-none text-uc-azul tabular-nums">{demo ? 41 : (data?.participants ?? 0)}</span>
          <span className="text-[1.3rem] text-uc-pizarra">conectados</span>
        </div>
        <p className="uc-serif tf-sube mt-9 max-w-[46rem] border-l-4 border-uc-ocre pl-5 text-[1.5rem] italic leading-snug text-uc-tinta" style={retraso(0.5)}>
          {UC_PREGUNTA}
        </p>
      </div>
    </div>
  );
}

// --- Laboratorio ------------------------------------------------------------------------------------------

export function LabMarco({ lab, children }: { lab: UcLab; children: ReactNode }) {
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="uc-rotulo flex items-center gap-3 text-uc-cian">
            <span className="flex size-6 items-center justify-center rounded-full bg-uc-cian text-[0.75rem] text-white">⚗</span>
            Laboratorio en vivo · {rotuloBloque(lab.bloque)}
          </p>
          <h1 className="uc-titular tf-sube mt-3 text-[2.7rem] text-uc-tinta">{lab.titulo.replace(/^Laboratorio · /, "")}</h1>
          <p className="tf-sube mt-1.5 text-[1.25rem] text-uc-pizarra" style={retraso(0.1)}>
            {lab.bajada}
          </p>
        </div>
        {lab.probar && (
          <span className="mt-1 shrink-0 rounded-full border border-uc-ocre/50 bg-uc-ocre-claro px-4 py-2 text-[0.95rem] text-uc-tinta">
            📱 Probalo en tu dispositivo
          </span>
        )}
      </header>
      <div className="tf-sube mt-5 flex flex-1 flex-col" style={retraso(0.2)}>
        {children}
      </div>
    </article>
  );
}
