"use client";

// Ilustraciones de las placas del Laboratorio BBVA (collage editorial sobre papel).
// Cada archivo aporta un grupo: ilus-a (01–06), ilus-b (08–13), ilus-c (14–20).
// Todas llenan su contenedor (w-full h-full) y escalan con la placa.

import type { IlusId } from "@/lib/bbva-clase";
import { ILUS_A } from "./ilus-a";
import { ILUS_B } from "./ilus-b";
import { ILUS_C } from "./ilus-c";

const TODAS: Partial<Record<IlusId, React.ComponentType>> = { ...ILUS_A, ...ILUS_B, ...ILUS_C };

export function Ilustracion({ id }: { id: IlusId }) {
  const C = TODAS[id];
  return C ? <C /> : null;
}
