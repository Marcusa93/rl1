"use client";

// Respuesta del asistente de la clase 3 (markdown simple): títulos, listas,
// negritas y tablas. En el celular cada fila de una tabla se muestra como
// tarjeta (las columnas no entran a lo ancho).

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TablaMd = { encabezado: string[]; filas: string[][] };

const celdas = (l: string) =>
  l
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => c.trim());
const esSeparador = (l: string) => /^\s*\|?\s*:?-{2,}/.test(l);

type Bloque = { tipo: "tabla"; tabla: TablaMd } | { tipo: "titulo"; texto: string } | { tipo: "item"; texto: string } | { tipo: "parrafo"; texto: string };

export function bloquesMd(texto: string): Bloque[] {
  const out: Bloque[] = [];
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const l = lineas[i].trim();
    if (!l || /^(-{3,}|\*{3,}|_{3,})$/.test(l)) continue;
    if (l.startsWith("|")) {
      const grupo: string[] = [];
      while (i < lineas.length && lineas[i].trim().startsWith("|")) grupo.push(lineas[i++]);
      i--;
      const filas = grupo.filter((g) => !esSeparador(g)).map(celdas);
      if (filas.length >= 2) out.push({ tipo: "tabla", tabla: { encabezado: filas[0].map((h) => h.replace(/\*/g, "")), filas: filas.slice(1) } });
      continue;
    }
    if (/^#{1,6}\s/.test(l)) out.push({ tipo: "titulo", texto: l.replace(/^#+\s*/, "") });
    else if (/^([-*•]|\d+[.)])\s/.test(l)) out.push({ tipo: "item", texto: l.replace(/^([-*•]|\d+[.)])\s+/, "") });
    else out.push({ tipo: "parrafo", texto: l });
  }
  return out;
}

/** **negrita** → <b>. */
function inline(t: string): ReactNode {
  const partes = t.split(/(\*\*[^*]+\*\*)/g);
  return partes.map((p, k) => (p.startsWith("**") && p.endsWith("**") ? <b key={k}>{p.slice(2, -2)}</b> : <span key={k}>{p.replace(/\*/g, "")}</span>));
}

export function RespuestaIA({ texto, className }: { texto: string; className?: string }) {
  return (
    <div className={cn("grid gap-2 text-[15px] leading-relaxed text-tf2-tinta", className)}>
      {bloquesMd(texto).map((b, k) => {
        if (b.tipo === "titulo") return <p key={k} className="tf2-titular mt-1 text-[18px] leading-tight">{inline(b.texto)}</p>;
        if (b.tipo === "item")
          return (
            <p key={k} className="flex gap-2">
              <span className="text-tf2-rojo">▸</span>
              <span>{inline(b.texto)}</span>
            </p>
          );
        if (b.tipo === "parrafo") return <p key={k}>{inline(b.texto)}</p>;
        return (
          <div key={k} className="grid gap-2">
            {b.tabla.filas.map((f, j) => (
              <div key={j} className="rounded-[8px] border border-tf2-linea bg-white p-3">
                {f.map((c, m) => (
                  <p key={m} className={cn("text-[14.5px] leading-snug", m === 0 ? "tf2-titular text-[17px]" : "mt-1.5")}>
                    {m > 0 && <span className="tf2-rotulo mr-1.5 text-[10px] text-tf2-gris">{b.tabla.encabezado[m]}</span>}
                    {inline(c)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
