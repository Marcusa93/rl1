"use client";

// Revelado paso a paso y foco en las placas del Tribunal Fiscal.
// El deck (deck.tsx) decide cuántas partes de la placa están a la vista; cada
// parte se envuelve en <Unidad i={n}>. Tocar una parte visible la destaca y
// atenúa las demás (también desde el celular de control: rem("🔦 …")).
// El texto nunca cambia: solo cuándo aparece y qué se destaca.

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { rem } from "@/lib/remoto";
import { cn } from "@/lib/utils";

export interface Revelado {
  /** Cuántas partes de la placa están a la vista (Infinity: todas). */
  visibles: number;
  /** Parte destacada; las demás se atenúan. null: ninguna. */
  foco: number | null;
  alternarFoco: (i: number) => void;
}

export const RevelaCtx = createContext<Revelado>({ visibles: Infinity, foco: null, alternarFoco: () => {} });

export const useRevelado = () => useContext(RevelaCtx);

const corto = (x: string) => (x.length > 46 ? `${x.slice(0, 44).trimEnd()}…` : x);

/**
 * Una parte de la placa que aparece en su paso. Con `label` se puede destacar
 * desde el celular de control; sin `label` acompaña a otra parte del mismo paso.
 * No llevar tf-sube en el mismo elemento: la animación pisaría la transición.
 */
export function Unidad({
  i,
  label,
  as: Tag = "div",
  className,
  style,
  children,
}: {
  i: number;
  label?: string;
  as?: "div" | "li" | "p" | "span";
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const { visibles, foco, alternarFoco } = useContext(RevelaCtx);
  const visible = i < visibles;
  const destacable = visible && Boolean(label);
  return (
    <Tag
      className={cn("tf-unidad", destacable && "cursor-pointer", className)}
      data-oculta={visible ? undefined : ""}
      data-foco={foco === i ? "" : undefined}
      data-atenuada={visible && foco !== null && foco !== i ? "" : undefined}
      onClick={destacable ? () => alternarFoco(i) : undefined}
      style={style}
      {...(destacable ? rem(`🔦 ${corto(label ?? "")}`, foco === i) : {})}
    >
      {children}
    </Tag>
  );
}
