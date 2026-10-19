"use client";

// Render liviano de markdown para las respuestas de la IA: títulos, negritas,
// cursivas, listas, tablas simples y citas. Con `subrayar`, marca las
// expresiones que afirman certezas (las que necesitan respaldo).

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Md({ texto, subrayar, className }: { texto: string; subrayar?: RegExp; className?: string }) {
  const lineas = texto.replace(/\r/g, "").split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  const inl = (s: string, k: string | number) => inline(s, subrayar, k);

  while (i < lineas.length) {
    const l = lineas[i].trimEnd();
    const t = l.trim();
    if (!t) {
      i++;
      continue;
    }
    // Tabla: líneas que empiezan con |
    if (t.startsWith("|")) {
      const filas: string[][] = [];
      while (i < lineas.length && lineas[i].trim().startsWith("|")) {
        const celdas = lineas[i]
          .trim()
          .replace(/^\||\|$/g, "")
          .split("|")
          .map((c) => c.trim());
        if (!celdas.every((c) => /^:?-{2,}:?$/.test(c) || c === "")) filas.push(celdas);
        i++;
      }
      out.push(
        <div key={`t${i}`} className="my-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <tbody>
              {filas.map((f, fi) => (
                <tr key={fi} className={cn(fi === 0 && "bg-black/[0.035] font-semibold")}>
                  {f.map((c, ci) => (
                    <td key={ci} className="border border-dg-linea px-3 py-1.5 align-top">
                      {inl(c, `${fi}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    // Lista
    if (/^([-*•]|\d+[.)])\s+/.test(t)) {
      const items: string[] = [];
      const ordenada = /^\d+[.)]/.test(t);
      while (i < lineas.length && /^\s*([-*•]|\d+[.)])\s+/.test(lineas[i])) {
        items.push(lineas[i].trim().replace(/^([-*•]|\d+[.)])\s+/, ""));
        i++;
      }
      const Tag = ordenada ? "ol" : "ul";
      out.push(
        <Tag key={`l${i}`} className={cn("my-2 grid gap-1 pl-6", ordenada ? "list-decimal" : "list-disc")}>
          {items.map((it, k) => (
            <li key={k}>{inl(it, k)}</li>
          ))}
        </Tag>,
      );
      continue;
    }
    const h = /^(#{1,4})\s+(.*)$/.exec(t);
    if (h) {
      out.push(
        <p key={`h${i}`} className={cn("mt-3 font-bold", h[1].length <= 2 ? "text-[1.15em]" : "text-[1.02em]")}>
          {inl(h[2], i)}
        </p>,
      );
    } else if (t.startsWith(">")) {
      out.push(
        <blockquote key={`q${i}`} className="my-2 border-l-4 border-dg-linea pl-3 italic">
          {inl(t.replace(/^>\s?/, ""), i)}
        </blockquote>,
      );
    } else if (/^-{3,}$/.test(t)) {
      out.push(<hr key={`r${i}`} className="my-3 border-dg-linea" />);
    } else {
      out.push(
        <p key={`p${i}`} className="my-1.5">
          {inl(t, i)}
        </p>,
      );
    }
    i++;
  }
  return <div className={cn("leading-relaxed", className)}>{out}</div>;
}

function inline(s: string, subrayar: RegExp | undefined, k: string | number): ReactNode {
  const partes = s.split(/(\*\*[^*]+\*\*|(?<![\w])_[^_]+_(?![\w])|`[^`]+`)/g);
  return (
    <Fragment key={k}>
      {partes.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{marcar(p.slice(2, -2), subrayar)}</strong>;
        if (p.length > 2 && p.startsWith("_") && p.endsWith("_")) return <em key={i} className="opacity-80">{marcar(p.slice(1, -1), subrayar)}</em>;
        if (p.startsWith("`") && p.endsWith("`")) return <code key={i} className="rounded bg-black/5 px-1 text-[0.92em]">{p.slice(1, -1)}</code>;
        return <Fragment key={i}>{marcar(p, subrayar)}</Fragment>;
      })}
    </Fragment>
  );
}

function marcar(s: string, re: RegExp | undefined): ReactNode {
  if (!re || !s) return s;
  const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
  const g = new RegExp(re.source, flags);
  const out: ReactNode[] = [];
  let ultimo = 0;
  for (const m of s.matchAll(g)) {
    const desde = m.index ?? 0;
    if (desde > ultimo) out.push(s.slice(ultimo, desde));
    out.push(
      <mark key={desde} className="dg-marca bg-transparent font-semibold text-dg-lacre">
        {m[0]}
      </mark>,
    );
    ultimo = desde + m[0].length;
  }
  if (ultimo < s.length) out.push(s.slice(ultimo));
  return out.length ? out : s;
}
