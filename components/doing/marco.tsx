"use client";

// Marco común de las pantallas de /doing: encabezado de placa (con el texto
// circular en las placas de giro), pantalla de cada experiencia participativa
// (la «pantalla de la aplicación»: usa todo el espacio para el resultado
// colectivo), portada e ingreso de la sala.

import type { ReactNode } from "react";
import { InterfazIA, Maquina, retraso, Rotulo, TextoCircular } from "@/components/doing/piezas";
import { CintaActividad, Ocultos, Revelacion, useDatos, useVivo, Visualizacion } from "@/components/doing/resultados";
import { useLive } from "@/components/use-live";
import { rem } from "@/lib/remoto";
import {
  DG_BLOQUES,
  DG_DOCENTE,
  DG_INSTITUCION,
  DG_LINK,
  DG_MINUTOS,
  DG_PREGUNTA,
  DG_QR,
  type DgActividad,
  type DgPlaca,
} from "@/lib/doing-clase";
import { cn } from "@/lib/utils";

export const rotuloBloque = (b: number) => `Bloque ${DG_BLOQUES[b]?.num} · ${DG_BLOQUES[b]?.nombre}`;

/** Marca tipográfica de la institución (sin logo). */
export function MarcaDoing({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-baseline gap-1.5 whitespace-nowrap", className)}>
      <span className="dg-serif text-[1.35em] leading-none text-dg-tinta">Doing</span>
      <span className="dg-maquina text-[0.8em] font-bold uppercase tracking-[0.25em] text-dg-lacre">Global</span>
    </span>
  );
}

export function PlacaMarco({ placa, children }: { placa: DgPlaca; children: ReactNode }) {
  const numero = String(placa.num).padStart(2, "0");
  if (placa.giro)
    return (
      <article className="flex flex-1 flex-col">
        <header className="grid grid-cols-[1fr_auto] items-center gap-10">
          <div className="min-w-0">
            <Rotulo>{rotuloBloque(placa.bloque)}</Rotulo>
            <h1 className="dg-titular tf-sube mt-4 text-[4.4rem] text-dg-tinta">{placa.titulo}</h1>
            <p className="tf-sube mt-3 text-[1.5rem] leading-snug text-dg-pizarra" style={retraso(0.1)}>
              {placa.bajada}
            </p>
          </div>
          <TextoCircular
            texto={placa.giro}
            className="w-[13.5rem]"
            centro={<span className="dg-serif text-[3.4rem] leading-none text-dg-lacre tabular-nums">{numero}</span>}
          />
        </header>
        <div className="mt-6 flex flex-1 flex-col">{children}</div>
      </article>
    );
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-10">
        <div className="min-w-0">
          <Rotulo>{rotuloBloque(placa.bloque)}</Rotulo>
          <h1 className="dg-titular tf-sube mt-4 max-w-[66rem] text-[3.9rem] text-dg-tinta">{placa.titulo}</h1>
          <p className="tf-sube mt-2.5 max-w-[60rem] text-[1.45rem] leading-snug text-dg-pizarra" style={retraso(0.1)}>
            {placa.bajada}
          </p>
        </div>
        <span className="dg-maquina shrink-0 text-[4.6rem] font-bold leading-[0.8] text-dg-salvia tabular-nums">{numero}</span>
      </header>
      <div className="mt-7 flex flex-1 flex-col">{children}</div>
    </article>
  );
}

/** Enlace para participar (se pega en el chat de Zoom). */
export function EnlaceChip({ className }: { className?: string }) {
  return (
    <div className={cn("flex shrink-0 items-center gap-3 rounded-2xl border border-dg-linea bg-dg-hoja px-4 py-3 shadow-sm", className)}>
      <span className="flex size-10 items-center justify-center rounded-xl bg-dg-azul-claro text-[1.3rem]">💬</span>
      <div>
        <p className="dg-rotulo text-[0.56rem] text-dg-pizarra">Participá · enlace en el chat de Zoom</p>
        <p className="dg-maquina mt-0.5 text-[1.15rem] font-bold text-dg-verde">{DG_LINK}</p>
      </div>
    </div>
  );
}

// --- Pantalla de una experiencia ----------------------------------------------------------------------

export function PantallaActividad({ act, cerrada, onRecepcion }: { act: DgActividad; cerrada: boolean; onRecepcion: () => void }) {
  const datos = useDatos(act);
  const { vista, alternarMostrar, alternarRevelar } = useVivo();
  const { mostrar, revelada } = vista(act);
  const puedeRevelar = Boolean(act.revela || act.correcta || act.clasificacion);
  return (
    <article className="flex flex-1 flex-col">
      <header className="flex items-start justify-between gap-8">
        <div className="min-w-0">
          <p className="dg-rotulo flex items-center gap-3 text-dg-ocre">
            <span className="flex size-7 items-center justify-center rounded-full bg-dg-ocre text-[0.8rem] text-white">{act.numero}</span>
            Experiencia {act.numero} · {rotuloBloque(blocDe(act))}
          </p>
          <h1 className="dg-titular tf-sube mt-2 text-[3.1rem] text-dg-tinta">{act.titulo}</h1>
          <p className="tf-sube mt-1 max-w-[58rem] text-[1.25rem] leading-snug text-dg-pizarra" style={retraso(0.1)}>
            {act.bajada}
          </p>
        </div>
        <EnlaceChip className="mt-1" />
      </header>

      <div className="mt-5 flex flex-1 flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CintaActividad act={act} datos={datos} cerrada={cerrada} />
          <div className="flex gap-2">
            <BotonAct activo={mostrar} onClick={() => alternarMostrar(act)} label="Resultados" tecla="R" />
            {puedeRevelar && <BotonAct activo={revelada} onClick={() => alternarRevelar(act)} label="Revelar orientación" tecla="E" />}
            <BotonAct activo={!cerrada} onClick={onRecepcion} label={cerrada ? "Reabrir recepción" : "Cerrar recepción"} tecla="X" />
          </div>
        </div>
        <div className="dg-hoja flex flex-1 flex-col rounded-[1.5rem] border border-dg-linea p-6">
          {mostrar ? (
            <div className="tf-sube flex flex-1 flex-col">
              <Visualizacion act={act} datos={datos} alto={21} />
            </div>
          ) : (
            <Ocultos act={act} datos={datos} />
          )}
        </div>
        {revelada && <Revelacion texto={act.revela} />}
      </div>
    </article>
  );
}

const blocDe = (act: DgActividad) => (act.placa <= 4 ? 0 : act.placa <= 9 ? 1 : act.placa <= 16 ? 2 : act.placa <= 21 ? 3 : 4);

function BotonAct({ activo, onClick, label, tecla }: { activo: boolean; onClick: () => void; label: string; tecla: string }) {
  return (
    <button
      onClick={onClick}
      {...rem(label, activo)}
      className={cn(
        "rounded-xl border px-3 py-1.5 text-[0.85rem] font-semibold transition",
        activo ? "border-dg-verde bg-dg-verde text-white" : "border-dg-linea bg-dg-hoja text-dg-tinta hover:border-dg-verde",
      )}
    >
      {label} <span className="ml-1 text-[0.7rem] font-normal opacity-70">{tecla}</span>
    </button>
  );
}

// --- Portada ---------------------------------------------------------------------------------------------

export function Portada() {
  return (
    <div className="grid flex-1 grid-cols-[1.2fr_0.8fr] items-center gap-14">
      <div>
        <MarcaDoing className="tf-sube text-[2rem]" />
        <p className="dg-rotulo tf-sube mt-10 text-dg-verde" style={retraso(0.1)}>
          Clase sincrónica · {DG_MINUTOS} minutos · taller práctico
        </p>
        <h1 className="dg-titular tf-sube mt-5 text-[5.6rem] leading-[0.96] text-dg-tinta" style={retraso(0.18)}>
          Redacción de escritos jurídicos <span className="italic text-dg-lacre">con inteligencia artificial</span>
        </h1>
        <p className="dg-maquina tf-sube mt-7 max-w-[46rem] text-[1.35rem] leading-snug text-dg-pizarra" style={retraso(0.3)}>
          {DG_PREGUNTA}
        </p>
        <p className="dg-serif tf-sube mt-8 flex items-center gap-4 text-[2.2rem] text-dg-azul" style={retraso(0.45)}>
          <span className="h-px w-12 bg-dg-lacre" />
          {DG_DOCENTE}
        </p>
      </div>
      <div className="tf-sube relative mx-auto w-full max-w-[28rem]" style={retraso(0.3)}>
        <Maquina className="w-[86%] -rotate-[3deg]" />
        <InterfazIA
          className="absolute -bottom-10 right-0 w-[64%] rotate-[3deg]"
          pedido="Redactá la respuesta a la actora."
          respuesta={<span className="dg-maquina text-[0.8rem] text-dg-pizarra">¿Qué posición querés sostener? Antes de redactar necesito saber…</span>}
        />
      </div>
    </div>
  );
}

// --- Ingreso de la sala ------------------------------------------------------------------------------------

export function Ingreso({ slug }: { slug: string }) {
  const { demo } = useVivo();
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 3000);
  return (
    <div className="grid flex-1 grid-cols-[1.15fr_0.85fr] items-center gap-14">
      <div>
        <p className="dg-rotulo flex items-center gap-3 text-dg-ocre">
          <span className="size-2 animate-pulse rounded-full bg-dg-ocre" />
          Participación en vivo · {DG_INSTITUCION}
        </p>
        <h1 className="dg-titular tf-sube mt-5 text-[4rem] text-dg-tinta" style={retraso(0.1)}>
          Abrí el enlace del chat de Zoom
        </h1>
        <div className="tf-sube mt-6 w-fit rounded-[1.5rem] rounded-bl-md border border-dg-linea bg-dg-hoja px-7 py-5 shadow-sm" style={retraso(0.2)}>
          <p className="text-[0.9rem] text-dg-niebla">Marco Rossi · para todos</p>
          <p className="dg-maquina mt-1 text-[2.6rem] font-bold text-dg-verde">{DG_LINK}</p>
        </div>
        <p className="tf-sube mt-5 max-w-[46rem] text-[1.35rem] leading-snug text-dg-pizarra" style={retraso(0.3)}>
          Abrilo en otra pestaña o ventana, al lado de Zoom. Es anónimo: no pide nombre ni datos. Ahí vas a responder las experiencias y a tener el caso, los
          prompts, la skill y las herramientas para probar con IA.
        </p>
        <p className="dg-serif tf-sube mt-8 max-w-[46rem] border-l-4 border-dg-lacre pl-5 text-[1.8rem] italic leading-snug text-dg-tinta" style={retraso(0.5)}>
          {DG_PREGUNTA}
        </p>
      </div>
      <div className="tf-sube flex flex-col items-center gap-6" style={retraso(0.4)}>
        <div className="flex items-baseline gap-4">
          <span className="dg-serif text-[6rem] leading-none text-dg-azul tabular-nums">{demo ? 37 : (data?.participants ?? 0)}</span>
          <span className="text-[1.4rem] text-dg-pizarra">conectados</span>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-dg-linea bg-dg-hoja p-3 pr-5">
          <img src={DG_QR} alt="Código QR para entrar desde el celular" className="size-[7.5rem]" />
          <p className="max-w-[11rem] text-[1rem] leading-snug text-dg-pizarra">¿Preferís el celular? Escaneá el código desde la pantalla.</p>
        </div>
      </div>
    </div>
  );
}
