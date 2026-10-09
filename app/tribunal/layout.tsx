import type { Metadata, Viewport } from "next";
import { Newsreader } from "next/font/google";
import { TF_CICLO, TF_INSTITUCION } from "@/lib/tribunal";
import { TF1_TITULO } from "@/lib/tribunal-clase1";

// Serif editorial para los titulares de las placas y la app del participante.
const newsreader = Newsreader({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-newsreader" });

export const metadata: Metadata = {
  title: `${TF1_TITULO} · Tribunal Fiscal`,
  description: `${TF_INSTITUCION} · ${TF_CICLO}`,
  robots: { index: false, follow: false },
  openGraph: { title: TF1_TITULO, description: `${TF_INSTITUCION} · ${TF_CICLO}`, locale: "es_AR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f6f8f9",
};

export default function TribunalLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${newsreader.variable} flex min-h-dvh flex-1 flex-col`}>{children}</div>;
}
