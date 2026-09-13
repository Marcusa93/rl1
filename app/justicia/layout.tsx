import type { Metadata } from "next";
import { JUS_EVENTO, JUS_SUBTITLE, JUS_TITLE } from "@/lib/justicia-clase";

// La miniatura sale de ./opengraph-image.tsx (logo UEES + 🤖).
export const metadata: Metadata = {
  metadataBase: new URL("https://justicia.rossi-ia.com"),
  title: JUS_TITLE,
  description: `${JUS_SUBTITLE} · ${JUS_EVENTO}`,
  openGraph: {
    title: JUS_TITLE,
    description: `${JUS_SUBTITLE} · ${JUS_EVENTO}`,
    locale: "es_SV",
    type: "website",
  },
};

export default function JusticiaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
