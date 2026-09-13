import type { Metadata } from "next";
import { TAL_EVENTO, TAL_SUBTITLE, TAL_TITLE } from "@/lib/taller-clase";

// La miniatura sale de ./opengraph-image.tsx (logo UEES + 🤖).
export const metadata: Metadata = {
  metadataBase: new URL("https://taller.rossi-ia.com"),
  title: TAL_TITLE,
  description: `${TAL_SUBTITLE} · ${TAL_EVENTO}`,
  openGraph: {
    title: TAL_TITLE,
    description: `${TAL_SUBTITLE} · ${TAL_EVENTO}`,
    locale: "es_SV",
    type: "website",
  },
};

export default function TallerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
