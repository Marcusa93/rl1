// Control remoto del deck desde el celular del docente.
//
// El deck publica su estado (placa actual y los botones que hay en pantalla)
// y consulta los comandos que manda el celular: avanzar, retroceder, ir a una
// placa o "tocar" uno de los botones. Cualquier botón del deck se vuelve
// controlable marcándolo con rem("Etiqueta", activo).
//
// Se guarda en dos filas de `sessions` (una por sentido), así cada una tiene
// un solo escritor y no hay carreras: `<slug>~remoto-estado` y `<slug>~remoto-cmd`.

export interface BotonRemoto {
  label: string;
  activo: boolean;
}

export interface EstadoRemoto {
  idx: number;
  total: number;
  titulo: string;
  parte?: string;
  /** Ayuda memoria para el docente (ej.: el guion que tiene que decir). Solo se ve en el celular. */
  nota?: string;
  botones: BotonRemoto[];
  /** Marca de tiempo del último latido del deck (ms). */
  vivo: number;
}

export type CmdRemoto =
  | { tipo: "sig" }
  | { tipo: "ant" }
  | { tipo: "ir"; idx: number }
  | { tipo: "click"; i: number; label: string }
  | { tipo: "zoom"; delta: number };

export type CmdConSeq = CmdRemoto & { seq: number };

/** Atributos que vuelven controlable un botón del deck desde el celular. */
export function rem(label: string, activo?: boolean) {
  return { "data-remoto": label, "data-activo": activo ? "1" : undefined };
}

export const filaEstado = (slug: string) => `${slug}~remoto-estado`;
export const filaCmd = (slug: string) => `${slug}~remoto-cmd`;
