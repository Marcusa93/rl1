"use client";

import type { ChatMessage } from "@/lib/openrouter";

/** Llama al endpoint de generación y va entregando el texto a medida que llega. */
export async function streamGenerate(
  slug: string,
  messages: ChatMessage[],
  onChunk: (text: string) => void,
  opts?: { system?: string; temperature?: number; maxTokens?: number },
): Promise<void> {
  const res = await fetch(`/api/session/${slug}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, ...opts }),
  });

  if (!res.ok || !res.body) {
    let msg = "Error de generación";
    try {
      msg = (await res.json()).error || msg;
    } catch {
      /* respuesta sin JSON */
    }
    throw new Error(msg);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value, { stream: true }));
  }
}
