// Moderación de respuestas abiertas (nubes y textos) antes de proyectarlas.
// El equipo oculta lo que no corresponde (contenido inapropiado o datos
// reales) y decide cuándo se ven en la pantalla. Se guarda en una fila
// auxiliar de `sessions`: `<slug>~moderacion`.

export interface ModeracionActividad {
  /** Palabras o respuestas ocultas (tal como llegan, en minúscula para las palabras). */
  ocultas?: string[];
  /** true: la pantalla muestra las respuestas (ya revisadas). */
  proyectar?: boolean;
  /** Se proyectaron alguna vez: quedan revisadas para el material descargable. */
  revisada?: boolean;
  /** Palabras que el docente eligió para analizar (nube de la clase 2: hasta tres). */
  destacadas?: string[];
  /** Respuesta de un participante elegida para proyectar, sin su nombre (id del participante). */
  elegida?: string | null;
}

/** Cuántas palabras de la nube puede destacar el docente. */
export const MAX_DESTACADAS = 3;

export type Moderacion = Record<string, ModeracionActividad>;

export const filaModeracion = (slug: string) => `${slug}~moderacion`;
