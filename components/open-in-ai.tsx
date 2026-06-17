"use client";

import { useState } from "react";
import { AI_LINKS } from "@/lib/constants";
import { Button } from "@/components/ui";

/** Copia el prompt y abre la IA elegida (ChatGPT / Claude / Gemini). */
export function OpenInAi({
  prompt,
  onOpen,
  disabled,
}: {
  prompt: string;
  onOpen?: () => void;
  disabled?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function go(link: (typeof AI_LINKS)[number]) {
    const text = prompt.trim();
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    // prefill por URL solo si el prompt es corto y la IA lo soporta
    const url = link.q && text.length < 1500 ? link.q + encodeURIComponent(text) : link.base;
    window.open(url, "_blank", "noopener");
    onOpen?.();
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {AI_LINKS.map((l) => (
          <Button key={l.id} onClick={() => go(l)} disabled={disabled || !prompt.trim()} className="text-sm">
            {l.label} ↗
          </Button>
        ))}
      </div>
      {copied && (
        <p className="mt-2 text-xs text-teal">
          ✓ Prompt copiado. Si no aparece cargado, pegalo con Ctrl/Cmd + V.
        </p>
      )}
    </div>
  );
}
