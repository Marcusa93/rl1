import type { Metadata, Viewport } from "next";
import { Caveat, Fraunces, IBM_Plex_Mono, Newsreader } from "next/font/google";
import { TF_CICLO, TF_INSTITUCION } from "@/lib/tribunal";
import { TF2_TITULO } from "@/lib/tribunal-clase2";

// Clase 1: serif editorial (Newsreader). Clase 2: titular expresivo (Fraunces),
// máquina de escribir (IBM Plex Mono) y anotaciones a mano (Caveat).
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });
const fraunces = Fraunces({ subsets: ["latin"], axes: ["SOFT", "WONK", "opsz"], variable: "--font-fraunces" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-caveat" });

// /tribunal es siempre la clase en curso (hoy, la segunda); las anteriores viven en /tribunal/<n>.
export const metadata: Metadata = {
  title: `${TF2_TITULO} · Tribunal Fiscal`,
  description: `${TF_INSTITUCION} · ${TF_CICLO}`,
  robots: { index: false, follow: false },
  openGraph: { title: TF2_TITULO, description: `${TF_INSTITUCION} · ${TF_CICLO}`, locale: "es_AR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#eee6d6",
};

export default function TribunalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${newsreader.variable} ${fraunces.variable} ${plexMono.variable} ${caveat.variable} flex min-h-dvh flex-1 flex-col`}>
      {children}
    </div>
  );
}
