import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCaso } from "@/lib/congreso";
import { DemoPantalla, type VersionDemo } from "@/components/congreso/demos";

// Una app ensayada a pantalla completa: /congreso/demo/cronologia?v=2
// Barra fina arriba (versiones, vuelta al tablero); la tecla H la oculta.

type Props = {
  params: Promise<{ caso: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function leerVersion(valor: string | string[] | undefined): VersionDemo {
  const n = Number(Array.isArray(valor) ? valor[0] : valor);
  return n === 2 || n === 3 || n === 4 ? n : 1;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const caso = getCaso((await params).caso);
  if (!caso) return {};
  const v = leerVersion((await searchParams).v);
  return { title: `V${v} · ${caso.app}` };
}

export default async function DemoCasoPage({ params, searchParams }: Props) {
  const caso = getCaso((await params).caso);
  if (!caso) notFound();
  const v = leerVersion((await searchParams).v);
  const paso = caso.pasos.find((p) => p.v === v) ?? caso.pasos[0];

  return <DemoPantalla caso={caso.id} v={v} letra={caso.letra} prompt={paso.prompt} />;
}
