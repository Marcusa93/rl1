"use client";

// Cliente de la IA de la clase (/api/doing/ia) y apertura de un pedido en
// otra herramienta (ChatGPT, Claude, Gemini…) con el texto ya copiado.

import { textoMateriales, type Herramienta, type Material } from "@/lib/doing-caso";

export type Mensaje = { role: "user" | "assistant"; content: string };

/** Pide a la IA y va entregando el texto a medida que llega. Devuelve el texto completo. */
export async function pedirIA({
  mensajes,
  materiales = [],
  skill,
  onTexto,
  signal,
}: {
  mensajes: Mensaje[];
  materiales?: Material[];
  skill?: boolean;
  onTexto: (acumulado: string) => void;
  signal?: AbortSignal;
}): Promise<string> {
  const res = await fetch("/api/doing/ia", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensajes, materiales, skill }),
    signal,
  });
  if (!res.ok || !res.body) {
    let msg = "La IA no respondió";
    try {
      msg = (await res.json()).error || msg;
    } catch {
      /* sin JSON */
    }
    throw new Error(msg);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let texto = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    texto += decoder.decode(value, { stream: true });
    onTexto(texto);
  }
  if (!texto.trim()) throw new Error("La IA devolvió una respuesta vacía. Probá de nuevo.");
  return texto;
}

/** Pedido completo para pegar en otra herramienta: el texto más los materiales del caso. */
export function pedidoParaCopiar(texto: string, materiales: Material[] = []): string {
  return `${texto.trim()}${textoMateriales(materiales)}`;
}

export async function copiar(texto: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    // Navegadores sin permiso de portapapeles: textarea temporal.
    try {
      const t = document.createElement("textarea");
      t.value = texto;
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      const ok = document.execCommand("copy");
      t.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

/** Copia el pedido y abre la herramienta (precargado por URL si lo admite y es corto). */
export function abrirEn(h: Herramienta, texto: string): void {
  void copiar(texto);
  const url = h.q && texto.length < 1800 ? h.q + encodeURIComponent(texto) : h.url;
  window.open(url, "_blank", "noopener");
}
