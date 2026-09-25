"use client";

import { useEffect, useRef, useState } from "react";
import type { ResultadosBbva } from "@/lib/bbva-clase";

/**
 * Resultados en vivo del Laboratorio BBVA. `activity` null → la actividad activa
 * (o "lobby"). Hace polling cada `intervalo` ms y conserva el último dato bueno
 * si la red falla (en el aula no se tiene que "vaciar" un gráfico).
 */
export function useResultadosBbva(activity: string | null, intervalo = 1500) {
  const [data, setData] = useState<ResultadosBbva | null>(null);
  const vivo = useRef(true);

  useEffect(() => {
    vivo.current = true;
    let timer: ReturnType<typeof setTimeout>;
    const url = `/api/bbva/resultados${activity ? `?activity=${activity}` : ""}`;
    async function tick() {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      try {
        const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
        if (res.ok && vivo.current) setData((await res.json()) as ResultadosBbva);
      } catch {
        /* se mantiene el último dato */
      } finally {
        clearTimeout(t);
      }
      if (vivo.current) timer = setTimeout(tick, intervalo);
    }
    tick();
    return () => {
      vivo.current = false;
      clearTimeout(timer);
    };
  }, [activity, intervalo]);

  return { data };
}

/** Porcentaje entero (0 si no hay total). */
export function porc(n: number, total: number) {
  return total ? Math.round((n / total) * 100) : 0;
}

/** Suma de un conteo. */
export function suma(c: Record<string, number> | undefined) {
  return Object.values(c ?? {}).reduce((a, b) => a + b, 0);
}
