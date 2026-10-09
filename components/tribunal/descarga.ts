"use client";

// Descarga del material del encuentro en PDF con un toque: lee los resultados
// (ya moderados y anónimos) y arma el PDF en el propio dispositivo.

import type { TfClase, TfMaterial } from "@/lib/tribunal";

export async function descargarMaterial(clase: TfClase, datos?: TfMaterial | null): Promise<void> {
  let material = datos;
  if (!material) {
    const res = await fetch(`/api/session/${clase.slug}/material`, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudieron leer los resultados");
    material = (await res.json()) as TfMaterial;
  }
  const { buildMaterialBlob } = await import("./material-pdf");
  const blob = await buildMaterialBlob(clase, material);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Tribunal-Fiscal-IA-charla-${clase.numero}-material.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
