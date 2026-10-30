import type { Metadata } from "next";
import { TF_CICLO, TF_INSTITUCION } from "@/lib/tribunal";
import { TF2_TITULO } from "@/lib/tribunal-clase2";

// Segunda charla del ciclo, archivada: /tribunal/2, /tribunal/2/clase y /tribunal/2/control.
export const metadata: Metadata = {
  title: `${TF2_TITULO} · Tribunal Fiscal`,
  description: `${TF_INSTITUCION} · ${TF_CICLO}`,
  robots: { index: false, follow: false },
};

export default function TribunalClase2Layout({ children }: { children: React.ReactNode }) {
  return children;
}
