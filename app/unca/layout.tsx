import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import { UC_DIPLOMATURA, UC_INSTITUCION, UC_TITULO } from "@/lib/unca-clase";

// Serif editorial con aire documental para los titulares (placas y app del participante).
const fraunces = Fraunces({ subsets: ["latin"], style: ["normal", "italic"], variable: "--font-fraunces" });

export const metadata: Metadata = {
  title: `${UC_TITULO} · Módulo III`,
  description: `${UC_DIPLOMATURA} · ${UC_INSTITUCION}`,
  robots: { index: false, follow: false },
  openGraph: { title: UC_TITULO, description: `${UC_DIPLOMATURA} · ${UC_INSTITUCION}`, locale: "es_AR", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#f4efe4",
};

export default function UncaLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${fraunces.variable} flex min-h-dvh flex-1 flex-col`}>{children}</div>;
}
