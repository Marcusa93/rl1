import type { Metadata, Viewport } from "next";
import { Courier_Prime, Instrument_Serif } from "next/font/google";
import { DG_INSTITUCION, DG_TITULO } from "@/lib/doing-clase";

// Serif editorial para los titulares y una tipografía de máquina de escribir
// para documentos, prompts y expedientes (arqueología tecnológica).
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const courier = Courier_Prime({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-courier" });

export const metadata: Metadata = {
  title: `${DG_TITULO} · ${DG_INSTITUCION}`,
  description: `${DG_INSTITUCION} · clase sincrónica de Marco Rossi`,
  robots: { index: false, follow: false },
  openGraph: { title: DG_TITULO, description: `${DG_INSTITUCION} · Marco Rossi`, locale: "es_AR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f2ebdf",
};

export default function DoingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${instrument.variable} ${courier.variable} flex min-h-dvh flex-1 flex-col`}>{children}</div>;
}
