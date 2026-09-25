import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import { CONG_EVENTO, CONG_PREGUNTA, CONG_TITLE } from "@/lib/congreso";

// Tipografías del Congreso: una serif expresiva y humana para titulares y
// bajadas (Fraunces, con sus ejes blandos), una sans legible para el celular,
// una mono de máquina de escribir/terminal y letra manuscrita para las correcciones.
const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
  variable: "--font-cg-display",
});
const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-cg-sans" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cg-mono" });
const mano = Caveat({ subsets: ["latin"], variable: "--font-cg-mano", preload: false });

export const metadata: Metadata = {
  title: `${CONG_TITLE} · Marco Rossi`,
  description: `${CONG_PREGUNTA} · ${CONG_EVENTO}`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#efe9dc",
};

export default function CongresoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fraunces.variable} ${sans.variable} ${mono.variable} ${mano.variable} cong cg-papel flex min-h-dvh flex-1 flex-col`}>
      {children}
    </div>
  );
}
