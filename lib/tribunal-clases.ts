// Las clases del ciclo del Tribunal Fiscal que ya están armadas (por slug).
// Al sumar la clase N: importarla y agregarla a la lista.

import type { TfClase } from "./tribunal";
import { TF1 } from "./tribunal-clase1";

export const TF_CLASES: TfClase[] = [TF1];

export function claseTf(slug: string): TfClase | undefined {
  return TF_CLASES.find((c) => c.slug === slug);
}
