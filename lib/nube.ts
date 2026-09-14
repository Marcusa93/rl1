// Nube de palabras del deck: cuántas palabras mostrar y de qué tamaño, para que
// entre en la placa aunque lleguen muchas palabras distintas (aula de 100+).

/** Hasta cuántas palabras muestra la nube (las más repetidas). */
export const NUBE_MAX = 50;

/**
 * Tamaño en rem de cada palabra (en el orden recibido): la más votada grande y
 * el resto en proporción. Si no entran en `altoRem`, se achican todas por igual.
 * Simula el armado en filas del flex-wrap (gap-x-7, gap-y-2; ~0,6 em por letra en negrita).
 */
export function tamanosNube(nube: Array<{ palabra: string; n: number }>, altoRem: number): number[] {
  const ANCHO = 60;
  const GAP_X = 1.75;
  const GAP_Y = 0.5;
  const LETRA = 0.6;
  const max = Math.max(1, ...nube.map((p) => p.n));
  const base = nube.map((p) => 1 + 3.1 * (p.n / max));
  const alto = (k: number) => {
    let fila = 0;
    let altoFila = 0;
    let total = 0;
    nube.forEach((p, i) => {
      const s = base[i] * k;
      const w = p.palabra.length * LETRA * s;
      if (fila > 0 && fila + GAP_X + w > ANCHO) {
        total += altoFila + GAP_Y;
        fila = 0;
        altoFila = 0;
      }
      fila += (fila > 0 ? GAP_X : 0) + w;
      altoFila = Math.max(altoFila, s);
    });
    return total + altoFila;
  };
  let k = 1;
  while (k > 0.3 && alto(k) > altoRem) k -= 0.05;
  return base.map((b) => b * k);
}

/** Alto (rem) que le queda a la nube en la placa: la pantalla menos título, tarjeta y pie. */
export function altoNubeRem(): number {
  if (typeof window === "undefined") return 22;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return Math.min(30, Math.max(12, window.innerHeight / rem - 29));
}
