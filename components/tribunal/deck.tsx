"use client";

// Presentación del ciclo del Tribunal Fiscal (motor de /diplomatura con las
// placas del Dr. Leal). La placa manda: al llegar a una placa con actividad,
// la abre sola en los celulares (POST /api/session/<slug>/activity, cookie
// docente). Las placas de contenido no cambian nada: quien llegó tarde puede
// terminar de responder mientras el Dr. Leal sigue.
//
// Teclado (también clickers, que mandan PageDown/PageUp):
//   → Espacio PageDown  siguiente · ← PageUp  anterior · Home / End
//   R  proyectar u ocultar las respuestas abiertas (ya revisadas)
//   + −  tamaño · Shift+R reiniciar la sesión (borra participantes,
//   respuestas y moderación: usar después de ensayar)
// Control remoto y moderación: /tribunal/control (celular de Marco o Franco).

import { useCallback, useEffect, useRef, useState } from "react";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { ActividadTf, IngresoTf, PlacaTf, PortadaTf, Recorrido, SintesisTf } from "@/components/tribunal/placas";
import { useModeracion } from "@/components/tribunal/resultados";
import { getActividadTf, TF_INSTITUCION, tituloPlacaTf, type TfClase, type TfSlide } from "@/lib/tribunal";
import { cn } from "@/lib/utils";

type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

export function DeckTribunal({ clase }: { clase: TfClase }) {
  const total = clase.slides.length;
  const storageKey = `${clase.slug}-placa`;
  const intervalo = clase.config.poll.deck;

  const [idx, setIdx] = useState(() => {
    try {
      const v = parseInt(localStorage.getItem(storageKey) ?? "0", 10);
      return Number.isFinite(v) ? Math.min(Math.max(v, 0), total - 1) : 0;
    } catch {
      return 0;
    }
  });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const lastActivada = useRef<string | null>(null);
  const { moderacion, cambiar } = useModeracion(clase.slug, intervalo);

  const go = useCallback(
    (n: number) => {
      const next = Math.min(Math.max(n, 0), total - 1);
      setIdx(next);
      try {
        localStorage.setItem(storageKey, String(next));
      } catch {}
    },
    [total, storageKey],
  );

  const slide = clase.slides[idx];

  const activar = useCallback(
    (key: string) => {
      lastActivada.current = key;
      setEstado({ key, status: "enviando" });
      fetch(`/api/session/${clase.slug}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: key }),
      })
        .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
        .catch(() => setEstado({ key, status: "error" }));
    },
    [clase.slug],
  );

  // La placa manda: si tiene actividad asociada, se activa sola.
  useEffect(() => {
    const key = "activa" in slide ? slide.activa : undefined;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [slide, activar]);

  const proyectar = useCallback((activity: string, valor: boolean) => cambiar({ activity, proyectar: valor }), [cambiar]);

  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes, sus respuestas y la moderación.")) return;
      await fetch(`/api/session/${clase.slug}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await cambiar({ reiniciar: true });
      const actual = clase.slides[idx];
      if ("activa" in actual) activar(actual.activa);
    }
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        go(idx + 1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        go(idx - 1);
      } else if (e.key === "Home") go(0);
      else if (e.key === "End") go(total - 1);
      else if (e.key === "R" && e.shiftKey) reiniciar();
      else if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        // Proyectar u ocultar las respuestas abiertas de la placa actual.
        const keys = slide.t === "actividad" ? [slide.activa] : slide.t === "sintesis" ? slide.actividades : [];
        const abiertas = keys.filter((k) => getActividadTf(clase, k)?.moderada);
        if (!abiertas.length) return;
        const mostrar = !abiertas.every((k) => moderacion[k]?.proyectar);
        abiertas.forEach((k) => proyectar(k, mostrar));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, idx, total, activar, cambiar, clase, slide, moderacion, proyectar]);

  const tramo = clase.tramos[slide.tramo];

  // Control desde el celular del equipo (/tribunal/control).
  useRemotoDeck({
    slug: clase.slug,
    idx,
    total,
    titulo: tituloPlacaTf(clase, slide),
    parte: tramo ? `${tramo.rango} · ${tramo.nombre}` : undefined,
    nota: "nota" in slide ? slide.nota : undefined,
    go,
  });

  const { zoom, aviso: avisoZoom } = useZoomDeck();
  const estadoNombre = estado ? (getActividadTf(clase, estado.key)?.titulo ?? "En espera") : "";

  return (
    <div className="deck-escala relative flex min-h-dvh flex-col overflow-hidden bg-tf-papel text-tf-tinta">
      <AvisoZoom zoom={zoom} visible={avisoZoom} />

      <main key={idx} className="mx-auto flex w-full max-w-[84rem] flex-1 flex-col px-16 pb-24 pt-14">
        <Slide clase={clase} slide={slide} moderacion={moderacion} onProyectar={proyectar} intervalo={intervalo} />
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-6 bg-gradient-to-t from-tf-papel via-tf-papel/95 to-transparent px-16 pb-4 pt-6 text-sm text-tf-pizarra">
        <span className="min-w-0 flex-1 truncate">{slide.t !== "portada" && TF_INSTITUCION}</span>
        {tramo && (
          <span className="hidden items-center gap-3 md:flex">
            <Recorrido clase={clase} actual={slide.tramo} />
            <span className="text-xs text-tf-niebla">{tramo.rango} · {tramo.nombre}</span>
          </span>
        )}
        <span className="flex flex-1 items-center justify-end gap-3 whitespace-nowrap">
          {estado && (
            <span
              className={cn(
                "hidden max-w-[22rem] items-center gap-2 truncate rounded-full px-3 py-1 text-xs font-medium lg:flex",
                estado.status === "error" ? "bg-tf-lacre/10 text-tf-lacre" : "bg-tf-ocre-claro text-tf-ocre",
              )}
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", estado.status === "error" ? "bg-tf-lacre" : "animate-pulse bg-tf-ocre")} />
              <span className="truncate">
                {estado.status === "enviando" && "abriendo…"}
                {estado.status === "ok" && <>en los celulares: {estadoNombre}</>}
                {estado.status === "error" && "no se pudo abrir la actividad: vuelva a ingresar la clave"}
              </span>
            </span>
          )}
          <button onClick={() => go(idx - 1)} className="rounded-lg border border-tf-linea bg-white px-3 py-1.5 transition hover:text-tf-petroleo" aria-label="Anterior">
            ◀
          </button>
          <span className="tabular-nums">
            {idx + 1} / {total}
          </span>
          <button onClick={() => go(idx + 1)} className="rounded-lg border border-tf-linea bg-white px-3 py-1.5 transition hover:text-tf-petroleo" aria-label="Siguiente">
            ▶
          </button>
        </span>
      </footer>
    </div>
  );
}

function Slide({
  clase,
  slide,
  moderacion,
  onProyectar,
  intervalo,
}: {
  clase: TfClase;
  slide: TfSlide;
  moderacion: ReturnType<typeof useModeracion>["moderacion"];
  onProyectar: (activity: string, valor: boolean) => void;
  intervalo: number;
}) {
  switch (slide.t) {
    case "portada":
      return <PortadaTf clase={clase} />;
    case "ingreso":
      return <IngresoTf clase={clase} />;
    case "placa":
      return <PlacaTf clase={clase} placa={slide} intervalo={intervalo} />;
    case "actividad":
      return <ActividadTf clase={clase} slide={slide} moderacion={moderacion} onProyectar={onProyectar} intervalo={intervalo} />;
    case "sintesis":
      return <SintesisTf clase={clase} slide={slide} moderacion={moderacion} onProyectar={onProyectar} intervalo={intervalo} />;
  }
}
