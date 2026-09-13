"use client";

// Tutor de trabajo en el dispositivo del grupo: los documentos y prompts que
// el deck ya liberó (session.activity_config.liberados), con botones para
// copiarlos, y las herramientas externas para abrirlos.

import { useState } from "react";
import { BarraRecorridos, BotonCopiar, DocumentoCaso, PromptCaja } from "@/components/taller/piezas";
import { docComoTexto, esDoc, esPrompt, TAL_DOCS, TAL_PROMPTS, type ConfigTaller } from "@/lib/taller-caso";
import { TAL_KIT } from "@/lib/taller-clase";
import type { SessionRow } from "@/lib/types";
import { cn } from "@/lib/utils";

export function TutorTaller({ session }: { session: SessionRow }) {
  const cfg = (session.activity_config ?? {}) as ConfigTaller;
  const liberados = cfg.liberados ?? [];
  const docs = liberados.filter(esDoc).map((id) => TAL_DOCS[id]);
  const prompts = liberados.filter(esPrompt).map((id) => TAL_PROMPTS[id]);
  const [abierto, setAbierto] = useState<string | null>(null);

  const ultimoPrompt = prompts[prompts.length - 1];
  const todos = docs.map(docComoTexto).join("\n\n---\n\n");

  return (
    <section className="mt-8 space-y-5">
      {(cfg.caso !== undefined || cfg.trabajo !== undefined) && <BarraRecorridos caso={cfg.caso} trabajo={cfg.trabajo} />}

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal">🧰 Herramientas</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TAL_KIT.map((h) => (
            <a
              key={h.id}
              href={h.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl border border-line bg-panel/60 px-3 py-2.5 text-sm font-medium transition hover:border-teal/60 hover:text-teal"
            >
              {h.emoji} {h.label} ↗
            </a>
          ))}
        </div>
        <p className="mt-2 text-xs text-faint">Copien el documento y el prompt, péguenlos en la herramienta y controlen la respuesta.</p>
      </div>

      {ultimoPrompt && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet">✍️ Prompt de este paso</p>
          <PromptCaja prompt={ultimoPrompt} />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-teal">📂 Documentos del caso ({docs.length})</p>
          {docs.length > 1 && <BotonCopiar texto={todos} label="Copiar todos" />}
        </div>
        {docs.length === 0 ? (
          <p className="text-sm text-faint">Todavía no hay documentos. Aparecen a medida que avanza el caso.</p>
        ) : (
          <div className="space-y-2">
            {[...docs].reverse().map((d, i) => {
              const on = abierto === d.id || (abierto === null && i === 0);
              return (
                <div key={d.id} className="glass rounded-2xl p-3">
                  <div className="flex items-center justify-between gap-2">
                    <button onClick={() => setAbierto(on ? "" : d.id)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold">
                        {d.numero ? `${d.numero}. ` : ""}
                        {d.titulo}
                        {i === 0 && <span className="ml-2 rounded-full bg-teal/15 px-2 py-0.5 text-[10px] text-teal">nuevo</span>}
                      </p>
                      <p className="text-xs text-faint">
                        {d.origen} · {on ? "ocultar ▲" : "ver ▼"}
                      </p>
                    </button>
                    <BotonCopiar texto={docComoTexto(d)} />
                  </div>
                  {on && (
                    <div className="mt-3">
                      <DocumentoCaso doc={d} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {prompts.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-violet">Prompts anteriores</p>
          <div className="space-y-2">
            {prompts
              .slice(0, -1)
              .reverse()
              .map((p) => (
                <details key={p.id} className="glass rounded-2xl p-3">
                  <summary className={cn("cursor-pointer text-sm font-semibold")}>{p.titulo}</summary>
                  <div className="mt-3">
                    <PromptCaja prompt={p} />
                  </div>
                </details>
              ))}
          </div>
        </div>
      )}
    </section>
  );
}
