"use client";

// Control remoto del Congreso desde el celular de Marco (taller.rossi-ia.com/congreso/control):
// pasa placas (▶ revela antes de pasar, igual que el clicker),
// toca los botones de la placa, lee el guion y espía los resultados antes de
// proyectarlos. En la placa del experimento tiene el plan B a un toque.

import { AccesoDocente } from "@/components/clase/acceso-docente";
import { ControlRemoto } from "@/components/clase/remoto";
import { useVivo } from "@/components/congreso/deck-piezas";
import { ResumenControl } from "@/components/congreso/deck-placas";
import { CONG_SLIDES, CONG_SLUG, getActividadCong, resultadosDeSlide, tituloSlide } from "@/lib/congreso";

const TITULOS = CONG_SLIDES.map(tituloSlide);

export default function CongresoControlPage() {
  return (
    // ControlRemoto y AccesoDocente son oscuros: se les devuelve su tema dentro del papel de /congreso.
    <div className="flex min-h-dvh flex-1 flex-col bg-ink" style={{ color: "#f1ecff", colorScheme: "dark" }}>
      <AccesoDocente titulo="Control remoto · Vibe coding para abogados">
        <ControlRemoto
          slug={CONG_SLUG}
          titulos={TITULOS}
          nombre="Congreso · Vibe coding"
          vistaTitulo="📊 Resultados en vivo (solo vos)"
          vista={(estado) => <VistaDocente key={estado.idx} idx={estado.idx} />}
        />
      </AccesoDocente>
    </div>
  );
}

/** Lo que Marco espía en el celular: cuántos respondieron y qué, antes de mostrarlo. */
function VistaDocente({ idx }: { idx: number }) {
  const slide = CONG_SLIDES[idx];
  const key = slide ? resultadosDeSlide(slide) : undefined;
  const data = useVivo(key ?? "cong_molestia", 2500);
  const act = getActividadCong(key);

  if (!key || !act)
    return (
      <div className="cong mt-3 rounded-2xl p-4 text-cg-tinta">
        <p className="cg-mono text-[11px] uppercase tracking-[0.2em] text-cg-gris">Esta placa no pide respuestas</p>
        <p className="mt-1 flex items-baseline gap-2">
          <span className="cg-titular text-5xl">{data?.participantes ?? "…"}</span>
          <span className="cg-bajada text-xl text-cg-sepia">celulares conectados</span>
        </p>
      </div>
    );

  return (
    <div className="cong mt-3 space-y-4 rounded-2xl p-4 text-cg-tinta">
      {!data ? (
        <p className="py-6 text-center cg-mono text-xs uppercase tracking-[0.2em] text-cg-gris">Leyendo respuestas…</p>
      ) : (
        <>
          <div>
            <p className="cg-mono text-[11px] uppercase tracking-[0.2em] text-cg-lacre">
              Interacción {act.numero} · {act.nombre}
            </p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="cg-titular text-5xl">{data.respondieron}</span>
              <span className="cg-bajada text-xl text-cg-sepia">de {data.participantes} respondieron</span>
            </p>
            {data.actual !== key && (
              <p className="mt-2 rounded-lg border border-cg-lacre/30 bg-cg-blanco px-3 py-2 text-sm text-cg-lacre">
                Ojo: en los celulares está abierta otra cosa ({data.actual}).
              </p>
            )}
          </div>
          <div className="rounded-xl bg-cg-blanco/70 p-3">
            <ResumenControl activity={key} data={data} />
          </div>
        </>
      )}
    </div>
  );
}
