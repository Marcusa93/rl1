import type { Metadata } from "next";
import { TF_CICLO, TF_INSTITUCION } from "@/lib/tribunal";
import { TF1_TITULO } from "@/lib/tribunal-clase1";

// Primera charla del ciclo, archivada: /tribunal/1 (participantes), /tribunal/1/clase
// (presentación) y /tribunal/1/control. Su material sigue en /tribunal/material.
export const metadata: Metadata = {
  title: `${TF1_TITULO} · Tribunal Fiscal`,
  description: `${TF_INSTITUCION} · ${TF_CICLO}`,
  robots: { index: false, follow: false },
};

export default function TribunalClase1Layout({ children }: { children: React.ReactNode }) {
  return children;
}
