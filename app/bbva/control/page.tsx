"use client";

// Control remoto del Laboratorio BBVA desde el celular de Marco
// (bbva.rossi-ia.com/control o /bbva/control): pasa placas, toca "Mostrar
// resultados" / "Por área" y lee su ayuda memoria. Abajo, los resultados en
// vivo de la placa actual — solo los ve él, antes de proyectarlos. En el mapa
// del grupo (actividad 5) también lista las hipótesis escritas, para copiarlas.

import { useState } from "react";
import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { AreasConectadas, ResultadoActividad } from "@/components/bbva/resultados";
import { useResultadosBbva } from "@/components/bbva/use-resultados";
import {
  actividadDeSlide,
  BBVA_SLIDES,
  BBVA_SLUG,
  getActividadBbva,
  getArea,
  resultadosDeSlide,
  tituloSlide,
  type ResultadosBbva,
} from "@/lib/bbva-clase";

const TITULOS = BBVA_SLIDES.map(tituloSlide);

export default function BbvaControlPage() {
  return (
    // ControlRemoto y AccesoDocente son oscuros: se les devuelve su tema dentro del papel de /bbva.
    <div className="flex min-h-dvh flex-1 flex-col bg-ink" style={{ color: "#f1ecff", colorScheme: "dark" }}>
      <AccesoDocente titulo="Control remoto · Laboratorio BBVA">
        <ControlRemoto
          slug={BBVA_SLUG}
          titulos={TITULOS}
          nombre="Laboratorio BBVA"
          vistaTitulo="📊 Resultados en vivo (solo vos)"
          vista={(estado) => <VistaDocente key={estado.idx} idx={estado.idx} />}
        />
      </AccesoDocente>
    </div>
  );
}

function nombreActividad(key: string) {
  if (key === "lobby") return "el ingreso (esperando)";
  const a = getActividadBbva(key);
  return a ? `Actividad ${a.numero} · ${a.nombre}` : key;
}

/** Lo que Marco espía en el celular: cuántos respondieron y el resultado, sin proyectarlo. */
function VistaDocente({ idx }: { idx: number }) {
  const slide = BBVA_SLIDES[idx];
  const key = slide ? (resultadosDeSlide(slide) ?? actividadDeSlide(slide)) : undefined;
  const pedida = key ?? "lobby";
  const { data: crudo } = useResultadosBbva(pedida, 2500);
  const data = crudo && crudo.activity === pedida ? crudo : null;

  return (
    <div className="bbva mt-3 space-y-4 rounded-2xl p-4 text-tinta">
      {!data ? (
        <p className="py-6 text-center font-mono text-xs uppercase tracking-[0.2em] text-gris">Leyendo respuestas…</p>
      ) : key ? (
        <>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-naranja">{nombreActividad(key)}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="bbva-titular text-5xl">{key === "bbva_a5" ? (data.respondieronItem?.q4 ?? 0) : data.respondieron}</span>
              <span className="bbva-serif text-xl italic text-grafito">
                de {data.participantes} {key === "bbva_a5" ? "tienen su tarjeta" : "respondieron"}
              </span>
            </p>
            {data.actual !== key && (
              <p className="mt-2 rounded-lg border border-rojo/30 bg-blanco px-3 py-2 text-sm text-rojo">
                Ojo: en los celulares está abierta {nombreActividad(data.actual)}.
              </p>
            )}
          </div>
          <div className="overflow-hidden rounded-xl bg-blanco/60 p-2">
            <ResultadoActividad activity={key} data={data} compacto />
          </div>
          {key === "bbva_a5" && <Hipotesis data={data} />}
        </>
      ) : (
        <>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gris">Esta placa no pide respuestas</p>
            <p className="mt-1 text-sm text-grafito">
              En los celulares: <b className="text-tinta">{nombreActividad(data.actual)}</b>
            </p>
          </div>
          <AreasConectadas data={data} compacto />
        </>
      )}
    </div>
  );
}

/** Las hipótesis escritas en la actividad 5 (solo llegan con la cookie docente). */
function Hipotesis({ data }: { data: ResultadosBbva }) {
  const lista = data.hipotesis ?? [];
  const [copiado, setCopiado] = useState<"ok" | "error" | null>(null);

  async function copiar() {
    const texto = lista.map((h) => `[${getArea(h.area)?.label ?? h.area}] ${h.texto}`).join("\n\n");
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado("ok");
    } catch {
      // Sin permiso de portapapeles: el método viejo.
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      setCopiado(ok ? "ok" : "error");
    }
    setTimeout(() => setCopiado(null), 2200);
  }

  return (
    // El panel del control no recibe toques: esta sección sí (copiar, seleccionar).
    <section className="pointer-events-auto space-y-3 border-t border-tinta/10 pt-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-grafito">
          Hipótesis escritas · {lista.length}
        </p>
        {lista.length > 0 && (
          <button
            type="button"
            onClick={copiar}
            className="rounded-full bg-tinta px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-papel active:scale-95"
          >
            {copiado === "ok" ? "¡Copiadas!" : copiado === "error" ? "No se pudo" : "Copiar todas"}
          </button>
        )}
      </div>
      {lista.length === 0 ? (
        <p className="bbva-serif text-lg italic text-gris">Todavía nadie escribió su hipótesis.</p>
      ) : (
        <ul className="space-y-2">
          {lista.map((h, i) => (
            <li key={i} className="bbva-recorte select-text rounded-md px-3 py-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-naranja">{getArea(h.area)?.label ?? h.area}</p>
              <p className="mt-1 text-[15px] leading-snug text-tinta">{h.texto}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
