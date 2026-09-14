"use client";

// Tamaño del deck. Todo el deck está en rem y la raíz escala con la pantalla
// (ver .deck-escala en globals.css): se ve como una diapositiva, grande en un
// proyector grande y sin desbordar en uno chico. Además, el docente ajusta
// en la sala con + y − (también desde el control remoto).

import { useEffect, useState } from "react";

const CLAVE = "deck-zoom";
const MIN = 0.7;
const MAX = 1.6;

export function useZoomDeck() {
  const [zoom, setZoom] = useState(() => {
    try {
      const v = parseFloat(localStorage.getItem(CLAVE) ?? "1");
      return Number.isFinite(v) ? Math.min(MAX, Math.max(MIN, v)) : 1;
    } catch {
      return 1;
    }
  });
  const [aviso, setAviso] = useState(false);

  useEffect(() => {
    document.documentElement.style.setProperty("--zoom-deck", String(zoom));
    try {
      localStorage.setItem(CLAVE, String(zoom));
    } catch {}
  }, [zoom]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      let d = 0;
      if (e.key === "+" || e.key === "=") d = 0.1;
      else if (e.key === "-" || e.key === "_") d = -0.1;
      if (!d) return;
      setZoom((z) => Math.round(Math.min(MAX, Math.max(MIN, z + d)) * 10) / 10);
      setAviso(true);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(false), 1400);
    return () => clearTimeout(t);
  }, [aviso, zoom]);

  return { zoom, aviso };
}

/** Cartelito que aparece un momento al cambiar el tamaño. */
export function AvisoZoom({ zoom, visible }: { zoom: number; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 rounded-full border border-teal/50 bg-ink/90 px-4 py-1.5 font-mono text-sm text-teal">
      Tamaño {Math.round(zoom * 100)} %
    </div>
  );
}
