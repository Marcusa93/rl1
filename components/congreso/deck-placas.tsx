"use client";

// Las placas de la sala de control del Congreso. Cada tipo de placa de
// lib/congreso.ts tiene su composición: tipografía grande, mucho espacio
// negativo, ilustraciones que argumentan y, en las interacciones, el grupo
// apareciendo en vivo.

import { useState } from "react";
import {
  CONG_AUTOR,
  ANON_CATEGORIAS,
  ANON_UMBRAL,
  CONG_EVENTO,
  CONG_INSTRUCCION_EN_VIVO,
  CONG_LINK,
  CONG_ORIGEN,
  CONG_QR,
  CONG_SEDE,
  CONG_TITLE,
  CONG_VITRINA,
  getActividadCong,
  type CongKey,
  type ResultadosCong,
  type SlideActividad,
  type SlideCong,
  type SlideCurva,
  type SlideDemo,
  type SlidePlaca,
} from "@/lib/congreso";
import { cn } from "@/lib/utils";
import { Ilus } from "./ilus";
import { MesaAnonimizador, urlAnonimizador } from "./deck-demo";
import {
  Anillo,
  BloqueQR,
  BotonCopiar,
  BotonPlaca,
  ContadorVivo,
  Fichas,
  Folio,
  Hoja,
  Latido,
  Nube,
  Tipeo,
  dos,
  porc,
  suma,
  tamTitulo,
  useVivo,
  vars,
} from "./deck-piezas";
import { CG, FUENTE } from "./paleta";

/** Lo que la placa necesita del deck. */
export interface Ctx {
  /** Cuántos pasos lleva revelados la placa (pasos, resultados, preguntas). */
  etapa: number;
  setEtapa: (n: number) => void;
  /** Frases visibles en la nube (tecla V). */
  frases: boolean;
  toggleFrases: () => void;
  /** Qué oculta el anonimizador: lo que eligió la sala (o lo mínimo, si nadie votó). */
  ocultar: string[];
  /** La instrucción de la V1, armada con lo que eligió la sala. */
  promptV1: string;
  /** Versión publicada: la del comienzo y la actual (cambia con el experimento). */
  version: { inicial: string | null; actual: string | null; cambio?: string; cuando?: number };
  planB: boolean;
  togglePlanB: () => void;
  /** Abrir una herramienta real en la ventana superpuesta. */
  abrir: (ruta: string | null) => void;
}

/** Etapas que tiene cada placa antes de pasar a la siguiente (flecha → las recorre). */
export function etapasDe(s: SlideCong): number {
  if (s.t === "placa") return s.pasos?.length ?? 0;
  if (s.t === "actividad") {
    const a = getActividadCong(s.activa);
    if (!a || a.tipo === "texto") return 0;
    return 1 + (s.preguntas?.length ?? 0);
  }
  if (s.t === "revelacion") return 2;
  return 0;
}

export function Placa({ slide, ctx }: { slide: SlideCong; ctx: Ctx }) {
  switch (slide.t) {
    case "portada":
      return <Portada />;
    case "ingreso":
      return <Ingreso />;
    case "placa":
      return slide.layout === "tipo" ? <PlacaTipo s={slide} /> : slide.layout === "lado" ? <PlacaLado s={slide} ctx={ctx} /> : <PlacaCentro s={slide} ctx={ctx} />;
    case "curva":
      return slide.principal ? <CurvaFunciona s={slide} /> : <CurvaBarrera s={slide} />;
    case "actividad":
      return <PlacaActividad s={slide} ctx={ctx} />;
    case "demo":
      return <PlacaDemo s={slide} ctx={ctx} />;
    case "vitrina":
      return <PlacaVitrina numero={slide.numero} titulo={slide.titulo} bajada={slide.bajada} ctx={ctx} />;
    case "revelacion":
      return <Revelacion ctx={ctx} />;
    case "experimento":
      return <Experimento ctx={ctx} />;
    case "final":
      return <Final />;
  }
}

// --- Portada ---------------------------------------------------------------------------------

function Portada() {
  return (
    <div className="relative flex h-full flex-col px-[5rem] pb-[3.2rem] pt-[3rem]">
      <p className="cg-mono text-[0.78rem] uppercase tracking-[0.24em] text-cg-sepia">
        {CONG_EVENTO} · {CONG_SEDE}
      </p>
      <div className="relative flex min-h-0 flex-1 items-center">
        <div className="relative z-10 max-w-[52rem]">
          <h1 className="cg-titular cg-sube text-[9rem] text-cg-tinta">Vibe coding</h1>
          <p className="cg-bajada cg-sube mt-[0.6rem] text-[4.4rem] leading-none text-cg-sepia" style={{ animationDelay: "0.15s" }}>
            para abogados
          </p>
          <p className="cg-bajada cg-sube mt-[2.6rem] max-w-[40rem] text-[1.7rem] leading-snug text-cg-tinta/80" style={{ animationDelay: "0.35s" }}>
            ¿Qué pasa cuando para crear software ya no hace falta empezar escribiendo código, sino explicando un problema?
          </p>
        </div>
        {/* Una hoja de expediente en la que alguien empieza a escribir un pedido. */}
        <div
          className="cg-hoja cg-renglones cg-cae absolute right-[1rem] top-1/2 w-[27rem] -translate-y-1/2 rounded-[0.2rem] px-[2.2rem] pb-[3rem] pt-[2.6rem]"
          style={vars({ "--rot": "2.2deg", animationDelay: "0.5s" })}
        >
          <span className="cg-cinta absolute -top-[0.8rem] left-[2rem] h-[1.6rem] w-[6rem] -rotate-6" />
          <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">fs. 1</p>
          <p className="mt-[1rem] cg-mono text-[1.05rem] leading-[1.6em] text-cg-tinta">
            <Tipeo texto="Necesito una aplicación que me ordene los vencimientos de mis causas." cps={22} />
          </p>
          <p className="mt-[1.4rem] text-[1.6rem] leading-none text-cg-lacre" style={{ fontFamily: FUENTE.mano }}>
            ¿y si con esto alcanzara?
          </p>
        </div>
      </div>
      <div className="flex items-end justify-between border-t border-cg-tinta/15 pt-[1rem]">
        <p className="cg-serif text-[1.6rem] text-cg-tinta">{CONG_AUTOR}</p>
        <p className="cg-mono text-[0.78rem] uppercase tracking-[0.2em] text-cg-sepia">Abogado · experimenta con tecnología</p>
      </div>
    </div>
  );
}

// --- Ingreso: el QR enorme -----------------------------------------------------------------------

function Ingreso() {
  const data = useVivo("cong_molestia", 2500);
  const n = data?.participantes ?? 0;
  return (
    <div className="flex h-full items-center justify-between gap-[3rem] px-[5rem] pb-[2rem] pt-[3.4rem]">
      <div className="flex w-[32rem] shrink-0 flex-col justify-center">
        <p className="cg-mono text-[0.9rem] uppercase tracking-[0.24em] text-cg-lacre">Saquen el teléfono</p>
        <h1 className="cg-titular cg-sube mt-[1rem] text-[7.5rem] text-cg-tinta">Sumate.</h1>
        <p className="cg-bajada cg-sube mt-[1.2rem] text-[2.2rem] leading-snug text-cg-sepia" style={{ animationDelay: "0.2s" }}>
          Sin registro. Sin nombre.
          <br />
          Sin descargar nada.
        </p>
        <p className="mt-[2.4rem] cg-mono text-[0.8rem] uppercase tracking-[0.2em] text-cg-gris">O escribí en el navegador</p>
        <p className="mt-[0.4rem] whitespace-nowrap cg-mono text-[2.05rem] font-semibold leading-none tracking-[-0.02em] text-cg-tinta">{CONG_LINK}</p>
        <p className="mt-[2.6rem] flex items-baseline gap-[0.8rem]">
          <Latido className="self-center" />
          <span className="cg-titular text-[4.2rem] leading-none tabular-nums text-cg-tinta">{n}</span>
          <span className="cg-bajada text-[1.8rem] text-cg-sepia">{n === 1 ? "persona conectada" : "personas conectadas"}</span>
        </p>
      </div>
      {/* El QR lo más grande posible: negro puro sobre blanco, con margen blanco para que se escanee de lejos. */}
      <div className="cg-cae relative aspect-square h-full max-h-[50rem] min-w-0 shrink border-[0.35rem] border-black bg-white p-[1.4rem]" style={vars({ "--rot": "0deg" })}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={CONG_QR} alt={`Código QR: ${CONG_LINK}`} className="h-full w-full [image-rendering:pixelated]" />
      </div>
    </div>
  );
}

// --- Placas de contenido -----------------------------------------------------------------------

function PlacaTipo({ s }: { s: SlidePlaca }) {
  return (
    <div className="relative h-full overflow-hidden">
      {s.ilus && (
        // Debajo del folio y un poco más tenue: un vestigio, no un protagonista.
        <div className="absolute inset-x-0 bottom-0 top-[3.6rem] opacity-80">
          <Ilus id={s.ilus} />
        </div>
      )}
      <Hoja folio={<Folio numero={s.numero} rotulo={s.movimiento} />}>
        <div className="flex h-full flex-col justify-center">
          <h1 className="cg-titular cg-sube relative z-10 text-[11rem] leading-[0.86] text-cg-tinta">{s.titulo}</h1>
          <p className="cg-bajada cg-sube relative z-10 mt-[2.4rem] max-w-[48rem] text-[2.3rem] leading-snug text-cg-sepia" style={{ animationDelay: "0.6s" }}>
            {s.bajada}
          </p>
        </div>
      </Hoja>
    </div>
  );
}

/** Pasos que se revelan de a uno (lista numerada con rótulo). */
function Pasos({ s, ctx, className }: { s: SlidePlaca; ctx: Ctx; className?: string }) {
  if (!s.pasos?.length) return null;
  return (
    <div className={className}>
      <ol className="space-y-[0.7rem]">
        {s.pasos.map((p, i) => {
          const visto = i < ctx.etapa;
          return (
            <li key={p.label} className={cn("flex gap-[1rem] transition-opacity duration-500", visto ? "opacity-100" : "opacity-0")}>
              <span className="mt-[0.3rem] w-[1.8rem] shrink-0 cg-mono text-[0.8rem] tabular-nums text-cg-lacre">{dos(i + 1)}</span>
              <div className="min-w-0">
                <p className="cg-mono text-[0.78rem] uppercase tracking-[0.18em] text-cg-tinta">{p.label}</p>
                <p className="cg-bajada text-[1.3rem] leading-snug text-cg-sepia">{p.texto}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-[1.2rem] flex flex-wrap gap-[0.4rem]">
        {ctx.etapa < s.pasos.length && (
          <BotonPlaca onClick={() => ctx.setEtapa(ctx.etapa + 1)} remoto={`Revelar: ${s.pasos[ctx.etapa].label}`}>
            → {s.pasos[ctx.etapa].label}
          </BotonPlaca>
        )}
        {ctx.etapa > 0 && (
          <BotonPlaca onClick={() => ctx.setEtapa(0)} remoto="Ocultar los pasos">
            Ocultar
          </BotonPlaca>
        )}
      </div>
    </div>
  );
}

function PlacaLado({ s, ctx }: { s: SlidePlaca; ctx: Ctx }) {
  const tam = tamTitulo(s.titulo, 34, 8.4, 3.6);
  return (
    <Hoja folio={<Folio numero={s.numero} rotulo={s.movimiento} />}>
      <div className="grid h-full grid-cols-[36rem_1fr] gap-[3rem]">
        <div className="flex min-h-0 flex-col justify-center">
          <h1 className="cg-titular cg-sube text-cg-tinta" style={{ fontSize: `${tam}rem` }}>
            {s.titulo}
          </h1>
          <p className="cg-bajada cg-sube mt-[1.6rem] text-[2rem] leading-snug text-cg-sepia" style={{ animationDelay: "0.3s" }}>
            {s.bajada}
          </p>
          <Pasos s={s} ctx={ctx} className="mt-[2rem]" />
        </div>
        <div className="relative min-h-0">{s.ilus && <Ilus id={s.ilus} paso={ctx.etapa} />}</div>
      </div>
    </Hoja>
  );
}

function PlacaCentro({ s, ctx }: { s: SlidePlaca; ctx: Ctx }) {
  const escalera = s.ilus === "p14-madurez" && s.pasos;
  return (
    <Hoja folio={<Folio numero={s.numero} rotulo={s.movimiento} />}>
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-end justify-between gap-[3rem]">
          <div>
            <h1 className="cg-titular cg-sube text-[5.4rem] text-cg-tinta">{s.titulo}</h1>
            <p className="cg-bajada cg-sube mt-[0.9rem] text-[1.9rem] leading-snug text-cg-sepia" style={{ animationDelay: "0.3s" }}>
              {s.bajada}
            </p>
          </div>
          {s.pasos && ctx.etapa < s.pasos.length && (
            <BotonPlaca onClick={() => ctx.setEtapa(ctx.etapa + 1)} remoto={`Revelar: ${s.pasos[ctx.etapa].label}`} className="shrink-0">
              → {s.pasos[ctx.etapa].label}
            </BotonPlaca>
          )}
        </div>
        <div className="relative mt-[1.4rem] min-h-0 flex-1">{s.ilus && <Ilus id={s.ilus} paso={ctx.etapa} />}</div>
        {escalera ? (
          <Escalera s={s} etapa={ctx.etapa} />
        ) : s.pasos ? (
          <div className="mt-[1rem] grid grid-cols-4 gap-[1.6rem] border-t border-cg-tinta/10 pt-[0.9rem]">
            {s.pasos.map((p, i) => (
              <div key={p.label} className={cn("transition-opacity duration-500", i < ctx.etapa ? "opacity-100" : "opacity-0")}>
                <p className="cg-mono text-[0.74rem] uppercase tracking-[0.18em] text-cg-lacre">
                  {dos(i + 1)} · {p.label}
                </p>
                <p className="cg-bajada mt-[0.2rem] text-[1.15rem] leading-snug text-cg-tinta">{p.texto}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </Hoja>
  );
}

/** Placa 14: seis contextos de uso, cada uno un escalón más de exigencia. */
function Escalera({ s, etapa }: { s: SlidePlaca; etapa: number }) {
  const pasos = s.pasos ?? [];
  return (
    <div className="relative mt-[0.6rem] grid h-[13rem] shrink-0 grid-cols-6 items-end gap-[0.5rem]">
      {pasos.map((p, i) => {
        const visto = i < etapa;
        return (
          <div
            key={p.label}
            className={cn("flex flex-col justify-start rounded-t-[0.3rem] border-t-[0.25rem] px-[0.7rem] pt-[0.6rem] transition-all duration-700", visto ? "opacity-100" : "opacity-10")}
            style={{
              height: `${34 + i * 13}%`,
              borderColor: i >= 4 ? CG.lacre : CG.tinta,
              background: `rgba(31, 28, 24, ${0.03 + i * 0.022})`,
            }}
          >
            <p className="cg-mono text-[0.64rem] uppercase leading-tight tracking-[0.12em] text-cg-tinta">{p.label}</p>
            <p className="mt-[0.2rem] text-[0.86rem] leading-snug text-cg-sepia">{p.texto}</p>
          </div>
        );
      })}
      <span className="pointer-events-none absolute -top-[1.6rem] right-0 text-[1.5rem] text-cg-lacre" style={{ fontFamily: FUENTE.mano }}>
        exigencia ↑
      </span>
    </div>
  );
}

// --- Curvas -------------------------------------------------------------------------------------

/** Placa 4: de un lado lenguaje natural, del otro una interfaz; en el medio, vacío (y el anillo). */
function CurvaBarrera({ s }: { s: SlideCurva }) {
  return (
    <Hoja folio={<Folio numero={s.numero} rotulo="Curva · frenar, sintetizar, cambiar de dirección" acento />}>
      <div className="relative h-full">
        <div className="relative z-10 max-w-[44rem]">
          <h1 className="cg-titular cg-sube text-[5.6rem] text-cg-tinta">{s.titulo}</h1>
          <p className="cg-bajada cg-sube mt-[1rem] text-[2rem] text-cg-sepia" style={{ animationDelay: "0.3s" }}>
            {s.bajada}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-[1rem] top-[11rem] grid grid-cols-[1fr_27rem_1fr] items-center gap-[2rem]">
          <div className="cg-sube self-end pb-[2rem]" style={{ animationDelay: "0.8s" }}>
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">Lenguaje natural</p>
            <p className="cg-bajada mt-[0.6rem] text-[1.7rem] leading-snug text-cg-tinta">
              “Necesito ver los vencimientos de mis causas, ordenados, y que me avise antes.”
            </p>
          </div>
          <div className="h-[27rem]">
            <Anillo texto={s.anillo} />
          </div>
          <div className="cg-sube self-end space-y-[0.6rem] pb-[2rem]" style={{ animationDelay: "1.1s" }}>
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">Interfaz</p>
            <div className="rounded-[0.35rem] border-[0.12rem] border-cg-tinta/70 bg-cg-blanco px-[0.9rem] py-[0.5rem] cg-mono text-[0.9rem] text-cg-sepia">Causa ▾</div>
            <div className="rounded-[0.35rem] border-[0.12rem] border-cg-tinta/70 bg-cg-blanco px-[0.9rem] py-[0.5rem] cg-mono text-[0.9rem] text-cg-sepia">Vence el ___ / ___ / ___</div>
            <div className="flex gap-[0.6rem]">
              <div className="rounded-full border-[0.12rem] border-cg-tinta/70 px-[0.9rem] py-[0.35rem] cg-mono text-[0.85rem] text-cg-sepia">Ordenar ↓</div>
              <div className="rounded-full bg-cg-tinta px-[0.9rem] py-[0.35rem] cg-mono text-[0.85rem] text-cg-blanco">Avisarme</div>
            </div>
          </div>
        </div>
      </div>
    </Hoja>
  );
}

/** Placa 12: "FUNCIONA." enorme; "¿Entonces está bien?" chico. Silencio. */
function CurvaFunciona({ s }: { s: SlideCurva }) {
  return (
    <Hoja folio={<Folio numero={s.numero} rotulo="Curva principal · hacer silencio" acento />}>
      <div className="relative h-full">
        <div className="absolute bottom-[-3.5rem] right-[-3rem] h-[25rem] w-[25rem] opacity-90">
          <Anillo texto={s.anillo} dur={120} />
        </div>
        <div className="relative z-10 flex h-full flex-col justify-center">
          <h1 className="cg-titular cg-sube text-[12rem] leading-[0.8] text-cg-tinta">{s.titulo}</h1>
          <p className="cg-bajada cg-sube mt-[2.4rem] text-[2.2rem] text-cg-sepia" style={{ animationDelay: "2.2s" }}>
            {s.bajada}
          </p>
        </div>
      </div>
    </Hoja>
  );
}

// --- Interacciones -------------------------------------------------------------------------------

function PlacaActividad({ s, ctx }: { s: SlideActividad; ctx: Ctx }) {
  const act = getActividadCong(s.activa);
  const data = useVivo(s.activa);
  if (!act) return null;
  const primera = act.numero === 1;
  const oculto = act.tipo === "opciones" && ctx.etapa < 1;

  return (
    <Hoja folio={<Folio rotulo={`Interacción ${act.numero} · ${act.nombre}`} extra={s.movimiento} acento />}>
      <div className={cn("grid h-full grid-rows-[minmax(0,1fr)] gap-[3rem]", primera ? "grid-cols-[33rem_1fr]" : "grid-cols-[28rem_1fr]")}>
        <div className="flex min-h-0 flex-col justify-between gap-[1.2rem]">
          <div>
            <p className="cg-mono text-[0.76rem] uppercase tracking-[0.22em] text-cg-lacre">En tu celular</p>
            <h1 className={cn("cg-titular mt-[0.7rem] text-cg-tinta", primera ? "text-[2.75rem] leading-[1.05]" : "text-[2.6rem] leading-[1.05]")}>{act.pregunta}</h1>
          </div>
          <BloqueQR tam={primera ? 13 : 8.5} />
          <ContadorVivo data={data} />
        </div>
        <div className="relative min-h-0">
          {act.key === "cong_molestia" && <ResultadoNube data={data} ctx={ctx} />}
          {act.key === "cong_intentar" && <AntesAhora data={data} ctx={ctx} />}
          {act.key === "cong_elegir" && <QueOcultar data={data} oculto={oculto} ctx={ctx} />}
          {act.key === "cong_datos" && <Datos s={s} data={data} ctx={ctx} />}
        </div>
      </div>
    </Hoja>
  );
}

function BotonesResultado({ ctx, max }: { ctx: Ctx; max: number }) {
  return (
    <div className="flex flex-wrap items-center gap-[0.4rem]">
      <BotonPlaca activo={ctx.etapa >= 1} onClick={() => ctx.setEtapa(ctx.etapa >= 1 ? 0 : 1)} remoto="Mostrar resultados">
        {ctx.etapa >= 1 ? "Ocultar resultados" : "Mostrar resultados (R)"}
      </BotonPlaca>
      {max > 1 && ctx.etapa >= 1 && ctx.etapa < max && (
        <BotonPlaca onClick={() => ctx.setEtapa(ctx.etapa + 1)} remoto="Siguiente pregunta">
          → Pregunta {ctx.etapa}/{max - 1}
        </BotonPlaca>
      )}
    </div>
  );
}

/** Interacción 1: la nube se arma sola, en vivo. */
function ResultadoNube({ data, ctx }: { data: ResultadosCong | null; ctx: Ctx }) {
  const frases = data?.frases ?? [];
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <p className="cg-mono text-[0.74rem] uppercase tracking-[0.2em] text-cg-sepia">Lo que construiríamos · en vivo</p>
        <BotonPlaca activo={ctx.frases} onClick={ctx.toggleFrases} remoto="Ver frases">
          {ctx.frases ? "Ocultar frases" : "Ver frases (V)"}
        </BotonPlaca>
      </div>
      <div className={cn("min-h-0", ctx.frases && frases.length ? "flex-[1.2]" : "flex-1")}>
        <Nube nube={data?.nube} />
      </div>
      {ctx.frases && frases.length > 0 && (
        <div className="min-h-0 flex-1 overflow-hidden border-t border-cg-tinta/10 pt-[0.9rem]">
          <Fichas frases={frases} max={6} />
        </div>
      )}
    </div>
  );
}

/** Interacción 5: antes y ahora, lado a lado (no es una medición: es un recurso narrativo). */
function AntesAhora({ data, ctx }: { data: ResultadosCong | null; ctx: Ctx }) {
  const antes = useVivo("cong_molestia", 6000);
  const frases = data?.frases ?? [];
  return (
    <div className="flex h-full flex-col">
      <div className="grid min-h-0 flex-1 grid-cols-[2fr_3fr] grid-rows-[minmax(0,1fr)] gap-[2rem]">
        <div className="flex min-h-0 flex-col border-r border-dashed border-cg-tinta/20 pr-[2rem]">
          <p className="cg-mono text-[0.74rem] uppercase tracking-[0.2em] text-cg-gris">Antes · ¿qué molestia resolverías?</p>
          <div className="min-h-0 flex-1">
            <Nube nube={antes?.nube} maxRem={3.4} minRem={1} apagada />
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <p className="cg-mono text-[0.74rem] uppercase tracking-[0.2em] text-cg-lacre">Ahora · ¿qué intentarías construir?</p>
          <div className="min-h-0 flex-1">
            <Nube nube={data?.nube} maxRem={4.6} minRem={1.2} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between pt-[0.6rem]">
        <span className="cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-gris">{frases.length ? `${frases.length} frases` : ""}</span>
        <BotonPlaca activo={ctx.frases} onClick={ctx.toggleFrases} remoto="Ver frases">
          {ctx.frases ? "Ocultar frases" : "Ver frases (V)"}
        </BotonPlaca>
      </div>
      {ctx.frases && frases.length > 0 && (
        <div className="max-h-[14rem] overflow-hidden border-t border-cg-tinta/10 pt-[0.8rem]">
          <Fichas frases={frases} max={4} tono="lacre" />
        </div>
      )}
    </div>
  );
}

/** Interacción 2: ¿qué tiene que ocultar el anonimizador? Lo que pasa el umbral entra en la instrucción. */
function QueOcultar({ data, oculto, ctx }: { data: ResultadosCong | null; oculto: boolean; ctx: Ctx }) {
  const c = data?.items.datos ?? {};
  const n = data?.respondieronItem.datos ?? 0;
  const orden = [...ANON_CATEGORIAS].sort((a, b) => (oculto ? 0 : (c[b.id] ?? 0) - (c[a.id] ?? 0)));
  return (
    <div className="flex h-full flex-col">
      <div className="mb-[0.8rem] flex items-center justify-between gap-[1rem]">
        <p className="cg-mono text-[0.74rem] uppercase tracking-[0.18em] text-cg-sepia">
          Entra en la instrucción lo que elige {ANON_UMBRAL}% o más
        </p>
        <BotonesResultado ctx={ctx} max={1} />
      </div>
      <div className="flex min-h-0 flex-1 flex-col justify-around">
        {orden.map((cat, i) => {
          const p = porc(c[cat.id] ?? 0, n);
          const entra = !oculto && ctx.ocultar.includes(cat.id);
          return (
            <div key={cat.id} className="cg-sube grid grid-cols-[17rem_1fr_4.5rem] items-center gap-[1rem]" style={{ animationDelay: `${i * 0.05}s` }}>
              <span className={cn("cg-titular text-[1.6rem] leading-none", entra ? "text-cg-tinta" : "text-cg-sepia")}>
                {entra && <span className="mr-[0.4rem] text-cg-lacre">✓</span>}
                {cat.label}
              </span>
              <div className="relative h-[1.9rem] overflow-hidden rounded-[0.25rem] bg-cg-tinta/8">
                <div className={cn("h-full transition-[width] duration-700", entra ? "bg-cg-lacre" : "bg-cg-sepia/45")} style={{ width: oculto ? 0 : `${p}%` }} />
                <span className="absolute inset-y-0 border-l-[0.15rem] border-dashed border-cg-tinta/50" style={{ left: `${ANON_UMBRAL}%` }} aria-hidden />
              </div>
              <span className="cg-titular text-right text-[1.7rem] leading-none tabular-nums text-cg-tinta">{oculto ? "?" : `${p}%`}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Interacción 4: Sí · No · Depende. Y después, las preguntas que aparecen solas. */
function Datos({ s, data, ctx }: { s: SlideActividad; data: ResultadosCong | null; ctx: Ctx }) {
  const c = data?.items.q ?? {};
  const total = suma(c);
  const oculto = ctx.etapa < 1;
  const preguntas = s.preguntas ?? [];
  const vistas = Math.max(0, ctx.etapa - 1);
  const ops = [
    { id: "si", label: "Sí" },
    { id: "no", label: "No" },
    { id: "depende", label: "Depende" },
  ];
  return (
    <div className="flex h-full flex-col">
      <div className="flex justify-end">
        <BotonesResultado ctx={ctx} max={1 + preguntas.length} />
      </div>
      <div className="mt-[1rem] grid grid-cols-3 gap-[1.4rem]">
        {ops.map((o) => {
          const p = porc(c[o.id] ?? 0, total);
          const dep = o.id === "depende";
          return (
            <div key={o.id} className={cn("border-t-[0.3rem] pt-[0.8rem]", dep ? "border-cg-lacre" : "border-cg-tinta")}>
              <p className={cn("cg-mono text-[0.9rem] uppercase tracking-[0.2em]", dep ? "text-cg-lacre" : "text-cg-tinta")}>{o.label}</p>
              <p className={cn("cg-titular text-[6.4rem] leading-none tabular-nums", dep ? "text-cg-lacre" : "text-cg-tinta")}>{oculto ? "?" : `${p}%`}</p>
            </div>
          );
        })}
      </div>
      <div className="relative mt-[1.6rem] min-h-0 flex-1 border-t border-dashed border-cg-tinta/20 pt-[1.2rem]">
        {vistas === 0 ? (
          <p className="cg-bajada text-[2rem] text-cg-gris">{oculto ? "" : "Los que pusieron DEPENDE: ¿de qué depende?"}</p>
        ) : (
          <ul className="space-y-[0.35rem]">
            {preguntas.slice(0, vistas).map((q, i) => (
              <li key={q} className="cg-cae text-[2.3rem] leading-[1.05] text-cg-tinta" style={vars({ fontFamily: FUENTE.mano, "--rot": `${(i % 3) - 1}deg` })}>
                <span className="mr-[0.5rem] text-cg-lacre">{dos(i + 1)}</span>
                {q}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// --- La demo: el anonimizador -----------------------------------------------------------------------

function PlacaDemo({ s, ctx }: { s: SlideDemo; ctx: Ctx }) {
  const folio = <Folio numero={s.numero} rotulo={s.movimiento} extra="Anonimizador de escritos" />;
  if (s.fase === "construir") return <Construir s={s} ctx={ctx} folio={folio} />;
  return (
    <Hoja folio={folio}>
      <div className="grid h-full grid-cols-[25rem_1fr] gap-[2.4rem]">
        <div className="flex min-h-0 flex-col">
          <h1 className="cg-titular cg-sube text-[6.2rem] text-cg-tinta">{s.titulo}</h1>
          <p className="cg-bajada cg-sube mt-[1rem] text-[1.8rem] leading-snug text-cg-sepia" style={{ animationDelay: "0.3s" }}>
            {s.bajada}
          </p>
          <div className="mt-auto space-y-[0.8rem] pb-[0.4rem]">
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">Lo que detecta el abogado</p>
            <p className="text-[2rem] leading-[1.05] text-cg-lacre" style={{ fontFamily: FUENTE.mano }}>
              “{ANON_FRASE_CORTA}”
            </p>
            <p className="cg-bajada text-[1.2rem] leading-snug text-cg-tinta">“La IA escribió el código. Pero yo tuve que explicarle qué estaba mal.”</p>
          </div>
        </div>
        <div className="min-h-0">
          <MesaAnonimizador ocultar={ctx.ocultar} promptV1={ctx.promptV1} />
        </div>
      </div>
    </Hoja>
  );
}

const ANON_FRASE_CORTA = "Si una persona se escapa una vez, el escrito no está anonimizado.";

/** Placa "Hagamos una app": casi vacía, un cursor que espera; la instrucción (armada con lo que votó la sala) se escribe a pedido. */
function Construir({ s, ctx, folio }: { s: SlideDemo; ctx: Ctx; folio: React.ReactNode }) {
  const [escribir, setEscribir] = useState(false);
  const etiquetas = ANON_CATEGORIAS.filter((c) => ctx.ocultar.includes(c.id)).map((c) => c.label);
  return (
    <Hoja folio={folio}>
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-[2rem]">
          <div>
            <h1 className="cg-titular cg-sube text-[6.4rem] text-cg-tinta">{s.titulo}</h1>
            <p className="cg-bajada cg-sube mt-[0.6rem] text-[2.2rem] text-cg-sepia" style={{ animationDelay: "0.3s" }}>
              {s.bajada}
            </p>
          </div>
          <div className="max-w-[24rem] pt-[1rem] text-right">
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">La sala eligió ocultar</p>
            <p className="cg-serif mt-[0.3rem] text-[1.25rem] leading-snug text-cg-tinta">{etiquetas.join(" · ")}</p>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 items-center">
          <div className="w-full rounded-[0.8rem] border-[0.15rem] border-cg-tinta/80 bg-cg-blanco px-[2.2rem] py-[1.6rem] shadow-[0_24px_40px_-30px_rgba(60,40,12,0.8)]">
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">Describí lo que necesitás</p>
            <p className="mt-[0.9rem] min-h-[10rem] cg-mono text-[1.3rem] leading-[1.45] text-cg-tinta">
              {escribir ? <Tipeo texto={ctx.promptV1} cps={55} /> : <span className="cg-cursor inline-block h-[1.3rem] w-[0.65rem] translate-y-[0.2rem] bg-cg-lacre" />}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-[0.5rem]">
          <BotonPlaca activo={escribir} onClick={() => setEscribir((e) => !e)} remoto="Escribir la instrucción">
            {escribir ? "Borrar" : "Escribir la instrucción"}
          </BotonPlaca>
          <BotonCopiar texto={ctx.promptV1} remoto="Copiar la instrucción" />
          <a
            href={urlAnonimizador(1, ctx.ocultar)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-[0.5rem] rounded-full border border-cg-tinta/25 bg-cg-blanco/70 px-[1rem] py-[0.45rem] cg-mono text-[0.74rem] uppercase tracking-[0.16em] text-cg-sepia hover:text-cg-tinta"
          >
            Plan B · abrir la V1 ensayada ↗
          </a>
          <span className="ml-auto cg-mono text-[0.7rem] uppercase tracking-[0.18em] text-cg-gris">Si falla: “Bienvenidos al desarrollo de software.”</span>
        </div>
      </div>
    </Hoja>
  );
}

// --- Placa 11: herramientas reales -------------------------------------------------------------

function PlacaVitrina({ numero, titulo, bajada, ctx }: { numero: number; titulo: string; bajada: string; ctx: Ctx }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div className="absolute inset-x-0 bottom-[3.4rem] top-[15rem]">
        <Ilus id="p11-expediente-codigo" />
      </div>
      <Hoja folio={<Folio numero={numero} rotulo="3 · Construyamos algo" />}>
        <div className="relative flex h-full flex-col">
          <h1 className="cg-titular cg-sube text-[6rem] text-cg-tinta">{titulo}</h1>
          <p className="cg-bajada cg-sube mt-[0.8rem] text-[2rem] text-cg-sepia" style={{ animationDelay: "0.3s" }}>
            {bajada}
          </p>
          <div className="my-auto grid grid-cols-5 gap-[1rem] px-[1rem]">
            {CONG_VITRINA.map((h, i) => (
              <button
                key={h.ruta}
                type="button"
                data-remoto={`Abrir ${h.nombre}`}
                onClick={() => ctx.abrir(h.ruta)}
                className="cg-hoja cg-cae group flex flex-col rounded-[0.3rem] px-[1.1rem] pb-[1rem] pt-[0.9rem] text-left transition hover:-translate-y-[0.2rem]"
                style={vars({ "--rot": `${((i % 3) - 1) * 0.9}deg`, animationDelay: `${0.4 + i * 0.1}s` })}
              >
                <span className="cg-mono text-[0.64rem] uppercase tracking-[0.18em] text-cg-lacre">{h.tipo}</span>
                <span className="cg-titular mt-[0.4rem] text-[1.5rem] leading-[1] text-cg-tinta">{h.nombre}</span>
                <span className="mt-[0.5rem] text-[0.92rem] leading-snug text-cg-sepia">{h.hace}</span>
                <span className="mt-auto pt-[0.7rem] cg-mono text-[0.62rem] uppercase tracking-[0.14em] text-cg-gris">{h.donde}</span>
                <span className="mt-[0.4rem] cg-mono text-[0.68rem] uppercase tracking-[0.16em] text-cg-tinta opacity-60 group-hover:opacity-100">Abrir en vivo →</span>
              </button>
            ))}
          </div>
        </div>
      </Hoja>
    </div>
  );
}

// --- La revelación --------------------------------------------------------------------------------

function Revelacion({ ctx }: { ctx: Ctx }) {
  const e = ctx.etapa;
  return (
    <Hoja folio={<Folio rotulo="Antes del cierre" acento />}>
      <div className="relative flex h-full flex-col">
        {e === 0 ? (
          <div className="flex flex-1 flex-col justify-center">
            <h1 className="cg-titular cg-sube max-w-[64rem] text-[7.6rem] text-cg-tinta">Hay algo que todavía no les conté.</h1>
            <div className="mt-[3rem]">
              <BotonPlaca onClick={() => ctx.setEtapa(1)} remoto="Revelar">
                Revelar →
              </BotonPlaca>
            </div>
          </div>
        ) : (
          <div className="grid min-h-0 flex-1 grid-cols-[1fr_34rem] gap-[3.4rem]">
            <div className="flex min-h-0 flex-col justify-center">
              <p className="cg-mono cg-sube text-[0.8rem] uppercase tracking-[0.22em] text-cg-lacre">La app que tienen en la mano</p>
              <h1 className="cg-titular cg-sube mt-[0.8rem] text-[5.2rem] leading-[0.95] text-cg-tinta">también la hice con vibe coding.</h1>
              {e >= 2 ? (
                <p className="cg-bajada cg-sube mt-[2rem] text-[2.4rem] leading-snug text-cg-sepia">
                  No estuvieron viendo ejemplos de vibe coding.
                  <br />
                  <span className="text-cg-tinta">Estuvieron adentro de uno.</span>
                </p>
              ) : (
                <div className="mt-[2.4rem]">
                  <BotonPlaca onClick={() => ctx.setEtapa(2)} remoto="Estuvieron adentro de uno">
                    → Estuvieron adentro de uno
                  </BotonPlaca>
                </div>
              )}
            </div>
            <div className="flex min-h-0 flex-col justify-center gap-[1rem]">
              <p className="cg-mono text-[0.72rem] uppercase tracking-[0.2em] text-cg-gris">Así empezó · el pedido real, sin corregir</p>
              <div className="cg-cae self-end rounded-[1.1rem] rounded-br-[0.2rem] bg-cg-tinta px-[1.4rem] py-[1rem] text-cg-blanco" style={vars({ animationDelay: "0.4s" })}>
                <p className="text-[1.25rem] leading-snug">{CONG_ORIGEN.pedido}</p>
              </div>
              <div className="cg-cae self-end rounded-[1.1rem] rounded-br-[0.2rem] bg-cg-tinta px-[1.4rem] py-[0.7rem] text-cg-blanco" style={vars({ animationDelay: "0.9s" })}>
                <p className="text-[1.25rem] leading-snug">{CONG_ORIGEN.segundo}</p>
              </div>
              <div className="cg-hoja cg-cae mt-[0.6rem] rounded-[0.25rem] px-[1.3rem] py-[1rem]" style={vars({ "--rot": "-1deg", animationDelay: "1.4s" })}>
                <p className="cg-mono text-[0.68rem] uppercase tracking-[0.18em] text-cg-lacre">+ el documento de diseño</p>
                <p className="cg-serif mt-[0.3rem] text-[1.15rem] leading-snug text-cg-tinta">{CONG_ORIGEN.diseno}</p>
                <ul className="mt-[0.5rem] space-y-[0.3rem]">
                  {CONG_ORIGEN.fragmentos.map((f) => (
                    <li key={f} className="cg-bajada text-[1rem] leading-snug text-cg-sepia">
                      “{f}”
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Hoja>
  );
}

// --- El experimento: cambiar la app del público en vivo -----------------------------------------------

function Experimento({ ctx }: { ctx: Ctx }) {
  const data = useVivo("cong_datos");
  const frases = data?.seguimientos?.q ?? [];
  const c = data?.items.q ?? {};
  const total = suma(c);
  const publicada = ctx.version.inicial !== null && ctx.version.actual !== null && ctx.version.actual !== ctx.version.inicial;
  const cambiada = publicada || ctx.planB;
  const etapas = ["Necesidad", "Descripción", "Modificación", "Uso real"];
  const actual = frases.length ? 3 : cambiada ? 2 : 1;

  return (
    <Hoja folio={<Folio rotulo="Experimento · la app que están usando" acento />}>
      <div className="grid h-full grid-cols-[1fr_36rem] gap-[3rem]">
        <div className="flex min-h-0 flex-col">
          <h1 className="cg-titular cg-sube text-[6.2rem] text-cg-tinta">Cambiémosla ahora.</h1>
          <div className="mt-[1.6rem] rounded-[0.6rem] border-[0.15rem] border-cg-tinta/80 bg-cg-blanco px-[1.6rem] py-[1.2rem]">
            <p className="cg-mono text-[0.7rem] uppercase tracking-[0.2em] text-cg-gris">La instrucción · en lenguaje natural</p>
            <p className="mt-[0.6rem] cg-mono text-[1.18rem] leading-[1.45] text-cg-tinta">{CONG_INSTRUCCION_EN_VIVO}</p>
          </div>
          <div className="mt-[1.2rem] flex flex-wrap items-center gap-[0.8rem]">
            {publicada ? (
              <span className="cg-cae inline-flex items-center gap-[0.6rem] rounded-[0.3rem] border-[0.15rem] border-cg-lacre px-[0.9rem] py-[0.35rem] cg-mono text-[0.9rem] font-semibold uppercase tracking-[0.18em] text-cg-lacre" style={vars({ "--rot": "-2deg" })}>
                Publicada · {ctx.version.inicial} → {ctx.version.actual}
              </span>
            ) : (
              <span className="inline-flex items-center gap-[0.6rem] cg-mono text-[0.85rem] uppercase tracking-[0.16em] text-cg-sepia">
                <span className="cg-pulso size-[0.6rem] rounded-full bg-cg-ocre" />
                Versión en sus teléfonos: {ctx.version.actual ?? "…"}
              </span>
            )}
            <BotonPlaca activo={ctx.planB} onClick={ctx.togglePlanB} remoto="Plan B · habilitar sin deploy">
              {ctx.planB ? "✓ Plan B activo" : "Plan B · habilitar sin deploy"}
            </BotonPlaca>
          </div>
          {publicada && ctx.version.cambio && <p className="mt-[0.6rem] cg-mono text-[0.8rem] text-cg-sepia">«{ctx.version.cambio}»</p>}
          <div className="mt-auto grid grid-cols-4 gap-[0.8rem] pb-[0.4rem]">
            {etapas.map((e, i) => (
              <div key={e} className={cn("border-t-[0.3rem] pt-[0.5rem] transition-all duration-700", i <= actual ? "border-cg-lacre opacity-100" : "border-cg-tinta/20 opacity-40")}>
                <p className="cg-mono text-[0.68rem] tabular-nums text-cg-gris">{dos(i + 1)}</p>
                <p className="cg-titular text-[1.6rem] leading-none text-cg-tinta">{e}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex min-h-0 flex-col">
          <div className="flex items-baseline justify-between border-b border-cg-tinta/15 pb-[0.6rem]">
            <p className="cg-titular text-[2.4rem] text-cg-lacre">¿De qué depende?</p>
            <p className="cg-mono text-[0.72rem] uppercase tracking-[0.16em] text-cg-sepia">
              {porc(c.depende ?? 0, total)}% eligió depende
            </p>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden pt-[1rem]">
            {frases.length ? (
              <Fichas frases={frases} max={8} tono="lacre" />
            ) : (
              <p className="cg-bajada pt-[2rem] text-[1.6rem] leading-snug text-cg-gris">
                {cambiada ? "Los que eligieron DEPENDE ya pueden escribir de qué. Las frases aparecen acá." : "Todavía nadie puede escribirlo: la app no lo permite… por ahora."}
              </p>
            )}
          </div>
        </div>
      </div>
    </Hoja>
  );
}

// --- Final -----------------------------------------------------------------------------------------

function Final() {
  return (
    <div className="relative flex h-full flex-col px-[5rem] pb-[3rem] pt-[3rem]">
      <div className="flex flex-1 items-center">
        <h1 className="cg-bajada cg-sube max-w-[74rem] text-[4.6rem] leading-[1.06] text-cg-tinta" style={{ animationDuration: "2.4s" }}>
          ¿Qué construirían los abogados si construir software dejara de ser un territorio reservado exclusivamente a quienes saben escribir código?
          <span className="cg-cursor ml-[0.2em] inline-block h-[0.8em] w-[0.08em] translate-y-[0.08em] bg-cg-lacre" aria-hidden />
        </h1>
      </div>
      <div className="flex items-end justify-between border-t border-cg-tinta/15 pt-[1rem] cg-mono text-[0.8rem] uppercase tracking-[0.2em] text-cg-sepia">
        <span>
          {CONG_AUTOR} · {CONG_TITLE}
        </span>
        <span>{CONG_LINK}</span>
      </div>
    </div>
  );
}

/** Lo que muestra el control remoto como resumen de un resultado (compacto). */
export function ResumenControl({ activity, data }: { activity: CongKey; data: ResultadosCong }) {
  const act = getActividadCong(activity);
  if (!act) return null;
  if (act.tipo === "texto") {
    return (
      <div className="space-y-3">
        <p className="flex flex-wrap gap-x-3 gap-y-1">
          {(data.nube ?? []).slice(0, 12).map((t) => (
            <span key={t.termino} className="cg-serif text-lg text-cg-tinta">
              {t.termino} <span className="cg-mono text-xs text-cg-lacre">{t.n}</span>
            </span>
          ))}
        </p>
        <ul className="space-y-1.5">
          {(data.frases ?? []).slice(0, 12).map((f, i) => (
            <li key={i} className="cg-bajada text-[15px] leading-snug text-cg-sepia">
              “{f}”
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {act.items.map((it) => {
        const c = data.items[it.id] ?? {};
        const total = it.multiple ? (data.respondieronItem[it.id] ?? 0) : suma(c);
        return (
          <div key={it.id}>
            {act.items.length > 1 && <p className="text-[13px] leading-snug text-cg-sepia">{it.texto}</p>}
            <div className="mt-1 flex flex-wrap gap-x-4">
              {it.opciones.map((o) => (
                <span key={o.id} className="cg-mono text-sm text-cg-tinta">
                  {o.label.replace(/^[ABC] · /, "")}: <b>{porc(c[o.id] ?? 0, total)}%</b>
                </span>
              ))}
            </div>
            {(data.seguimientos?.[it.id] ?? []).length > 0 && (
              <ul className="mt-2 space-y-1">
                {(data.seguimientos?.[it.id] ?? []).slice(0, 10).map((f, i) => (
                  <li key={i} className="cg-bajada text-[15px] text-cg-lacre">
                    “{f}”
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
