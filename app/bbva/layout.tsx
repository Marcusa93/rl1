import type { Metadata, Viewport } from "next";
import { Archivo, Caveat, Instrument_Serif } from "next/font/google";
import { BBVA_EVENTO, BBVA_SUBTITLE, BBVA_TITLE } from "@/lib/bbva-clase";

// Tipografías del Laboratorio BBVA: titular condensada (Archivo, eje wdth),
// serif editorial para las bajadas y letra manuscrita para las anotaciones.
const archivo = Archivo({ subsets: ["latin"], axes: ["wdth"], variable: "--font-archivo" });
const instrument = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], variable: "--font-instrument" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

export const metadata: Metadata = {
  title: `${BBVA_TITLE} · BBVA`,
  description: `${BBVA_SUBTITLE} · ${BBVA_EVENTO}`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#f2eee6",
};

export default function BbvaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivo.variable} ${instrument.variable} ${caveat.variable} bbva bbva-papel flex min-h-dvh flex-1 flex-col`}>
      {children}
    </div>
  );
}
