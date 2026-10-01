import type { Metadata } from "next";
import { DIP_EVENTO, DIP_SUBTITLE, DIP_TITLE } from "@/lib/diplo-clase";

export const metadata: Metadata = {
  title: DIP_TITLE,
  description: `${DIP_SUBTITLE} · ${DIP_EVENTO}`,
  openGraph: { title: DIP_TITLE, description: `${DIP_SUBTITLE} · ${DIP_EVENTO}`, locale: "es_AR", type: "website" },
};

export default function DiplomaturaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
