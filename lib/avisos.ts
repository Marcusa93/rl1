// Avisos que el docente abre para todos los celulares de una clase, sin
// depender de la placa que se proyecta (ej.: el box de expectativas del
// Tribunal). Se guardan en una fila auxiliar de `sessions`: `<slug>~avisos`,
// y los celulares los reciben en su consulta habitual (/api/session/<slug>).

export const filaAvisos = (slug: string) => `${slug}~avisos`;
