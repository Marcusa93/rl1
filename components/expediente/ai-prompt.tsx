"use client";

import { useState } from "react";
import { OpenInAi } from "@/components/open-in-ai";

/**
 * Prompt listo para usar (híbrido): el alumno lo abre de un click en su chat,
 * y opcionalmente lo ve/edita para practicar el método COTIO.
 */
export function AiPrompt({
  base,
  titulo,
  bajada,
  onOpen,
}: {
  base: string;
  titulo: string;
  bajada: string;
  onOpen?: () => void;
}) {
  const [text, setText] = useState(base);
  const [edit, setEdit] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-2xl border border-teal/40 bg-teal/5 p-4">
      <p className="text-sm font-semibold text-teal">{titulo}</p>
      <p className="mt-1 text-xs text-muted">{bajada}</p>

      <div className="mt-3">
        <OpenInAi prompt={text} onOpen={onOpen} />
      </div>

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={() => setEdit((v) => !v)}
          className="text-xs text-faint underline-offset-2 hover:text-teal hover:underline"
        >
          {edit ? "Ocultar el prompt" : "Ver / editar el prompt"}
        </button>
        {edit && (
          <button
            onClick={copy}
            className="text-xs text-faint underline-offset-2 hover:text-teal hover:underline"
          >
            {copied ? "✓ Copiado" : "Copiar"}
          </button>
        )}
      </div>

      {edit && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-ink-2/70 p-2.5 font-mono text-xs leading-relaxed outline-none focus:border-teal/60"
        />
      )}
    </div>
  );
}
