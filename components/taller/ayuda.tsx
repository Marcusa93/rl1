"use client";

// La campana de ayuda: cada computadora avisa al docente sin levantar la mano
// ni interrumpir a la sala. El docente lo ve en su celular con el nombre y el
// paso en el que se trabó, y al acercarse marca "atendido": la mano baja sola.

import { useCallback, useEffect, useRef, useState } from "react";
import { TAL_SLUG } from "@/lib/taller-clase";
import { cn } from "@/lib/utils";

type Estado = "libre" | "pidiendo" | "atendido";

export function BotonAyuda({
  etapa,
  paso,
  compacto,
}: {
  etapa: number;
  paso?: string;
  compacto?: boolean;
}) {
  const [estado, setEstado] = useState<Estado>("libre");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const avisar = useCallback(
    (pidiendo: boolean) =>
      fetch(`/api/session/${TAL_SLUG}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: "tal_ayuda",
          item_key: "",
          payload: { pidiendo, etapa, paso: paso ?? "" },
        }),
      }).catch(() => {}),
    [etapa, paso],
  );

  // Mientras la mano está levantada, mira si el docente ya la bajó (cada 8 s).
  useEffect(() => {
    if (estado !== "pidiendo") return;
    const id = setInterval(async () => {
      try {
        const r = await fetch(`/api/session/${TAL_SLUG}/my-responses`);
        const j = await r.json();
        const mia = (j.responses ?? []).find(
          (x: { activity: string }) => x.activity === "tal_ayuda",
        );
        if (mia && !mia.payload?.pidiendo) {
          setEstado("atendido");
          timer.current = setTimeout(() => setEstado("libre"), 6000);
        }
      } catch {}
    }, 8000);
    return () => clearInterval(id);
  }, [estado]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function tocar() {
    if (estado === "pidiendo") {
      setEstado("libre");
      avisar(false);
      return;
    }
    setEstado("pidiendo");
    avisar(true);
    if ("vibrate" in navigator) navigator.vibrate?.(40);
  }

  const titulo =
    estado === "pidiendo"
      ? "Mano levantada: ya avisamos. Toque otra vez si se resolvió."
      : estado === "atendido"
        ? "El docente va en camino"
        : "Pedir ayuda al docente";

  return (
    <button
      onClick={tocar}
      title={titulo}
      aria-label={titulo}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-semibold transition active:scale-95",
        estado === "pidiendo"
          ? "border-amber-400/70 bg-amber-400/15 text-amber-300 pulse-ring"
          : estado === "atendido"
            ? "border-teal/60 bg-teal/15 text-teal"
            : "border-line bg-panel/60 text-muted hover:border-amber-400/60 hover:text-amber-300",
      )}
    >
      <span
        className={cn(
          "text-base leading-none",
          estado === "pidiendo" && "campana",
        )}
      >
        {estado === "atendido" ? "🙌" : "🔔"}
      </span>
      <span className={cn(compacto && "hidden sm:inline")}>
        {estado === "pidiendo"
          ? "Avisado"
          : estado === "atendido"
            ? "Ya va"
            : "Ayuda"}
      </span>
    </button>
  );
}
