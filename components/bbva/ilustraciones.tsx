"use client";

// Ilustraciones de las placas del Laboratorio BBVA (collage editorial sobre papel).
// Clase 1: ilus-a (01–06), ilus-b (08–13), ilus-c (14–20).
// Clase 2 (taller de construcción): ilus-d (01–14), ilus-e (15–30), claves "c2-…".
// Todas llenan su contenedor (w-full h-full) y escalan con la placa.

import type { IlusId } from "@/lib/bbva-clase";
import { ILUS_A } from "./ilus-a";
import { ILUS_B } from "./ilus-b";
import { ILUS_C } from "./ilus-c";
import { ILUS_D } from "./ilus-d";
import { ILUS_E } from "./ilus-e";

const TODAS: Partial<Record<string, React.ComponentType>> = { ...ILUS_A, ...ILUS_B, ...ILUS_C, ...ILUS_D, ...ILUS_E };

export function Ilustracion({ id }: { id: IlusId }) {
  const C = TODAS[id];
  return C ? <C /> : null;
}
