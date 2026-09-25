// Paleta del Congreso en hex, para SVG y estilos en línea (espejo de los
// tokens --color-cg-* de app/globals.css).

export const CG = {
  papel: "#efe9dc",
  papel2: "#e5dccb",
  carton: "#d3c6ab",
  blanco: "#faf7f0",
  tinta: "#1f1c18",
  sepia: "#574d41",
  gris: "#938a7c",
  niebla: "#cfc7b8",
  salvia: "#87957f",
  musgo: "#4d5c4a",
  azul: "#7b93a8",
  azul2: "#3e5870",
  lacre: "#b3432b",
  ocre: "#cf9f3f",
} as const;

/** Familias tipográficas (variables que define app/congreso/layout.tsx). */
export const FUENTE = {
  display: "var(--font-cg-display), Georgia, serif",
  sans: "var(--font-cg-sans), system-ui, sans-serif",
  mono: "var(--font-cg-mono), ui-monospace, monospace",
  mano: "var(--font-cg-mano), cursive",
} as const;
