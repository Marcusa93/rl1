// Moderación de respuestas abiertas (nubes y textos) antes de proyectarlas.
// El equipo oculta lo que no corresponde (contenido inapropiado o datos
// reales) y decide cuándo se ven en la pantalla. Se guarda en una fila
// auxiliar de `sessions`: `<slug>~moderacion`.

export interface ModeracionActividad {
  /** Palabras o respuestas ocultas (tal como llegan, en minúscula para las palabras). */
  ocultas?: string[];
  /** true: la pantalla muestra las respuestas (ya revisadas). */
  proyectar?: boolean;
}

export type Moderacion = Record<string, ModeracionActividad>;

export const filaModeracion = (slug: string) => `${slug}~moderacion`;
