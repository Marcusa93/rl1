// Canal entre la presentación de /unca y la ventana de notas del orador
// (misma computadora, mismo navegador): BroadcastChannel.

export const CANAL_UC = "unca-deck";

export type MensajeDeck =
  | { tipo: "estado"; idx: number; paso: number; pasos: number; demo: boolean; cerrada: boolean; act?: string; mostrar?: boolean; revelada?: boolean }
  | { tipo: "cmd"; accion: "sig" | "ant" | "mostrar" | "revelar" | "recepcion" | "demo" | "pedir" }
  | { tipo: "cmd"; accion: "ir"; idx: number };
