"use client";

import { useState } from "react";

/** Caja con texto monoespaciado y botón de copiar — para prompts. */
export function CopyBox({
  text,
  label = "Copiar",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-ink-2/70">
      <div className="flex items-center justify-between border-b border-line/60 bg-panel/40 px-3 py-2">
        <span className="text-xs text-faint">Prompt</span>
        <button
          onClick={copy}
          className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition hover:border-teal/60 hover:text-teal"
        >
          {copied ? "✓ Copiado" : `⧉ ${label}`}
        </button>
      </div>
      <pre className="max-h-72 overflow-auto whitespace-pre-wrap px-3 py-3 font-mono text-xs leading-relaxed text-muted">
        {text}
      </pre>
    </div>
  );
}
