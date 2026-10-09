"use client";

// Destinos de los dos QR de la placa 15 (demostración de clase, institución y
// documento ficticios). /unca/validar es el "legítimo"; /unca/va1idar (con un
// uno) es el señuelo: se ve igual y también dice "válido", y a los pocos
// segundos se delata. Ninguno pide datos.

import { useEffect, useState } from "react";

const HUELLA = "4b9e0c7a51f2d83e6a0c19b7f45d2e8a3c71b06f9d28e5a4c3b7106e2f8d9a51";

export function Validador({ senuelo }: { senuelo?: boolean }) {
  const [revelar, setRevelar] = useState(false);
  const [codigo, setCodigo] = useState("VE-2026-0417");
  useEffect(() => {
    const c = new URLSearchParams(window.location.search).get("c");
    if (c) setCodigo(c.slice(0, 24));
    if (!senuelo) return;
    const t = setTimeout(() => setRevelar(true), 5000);
    return () => clearTimeout(t);
  }, [senuelo]);
  const ruta = senuelo ? "/unca/va1idar" : "/unca/validar";

  return (
    <div className="uc uc-papel min-h-dvh text-uc-tinta">
      <p className="bg-uc-tinta px-4 py-1.5 text-center text-xs text-white">Demostración de clase · institución y documento ficticios</p>
      <div className="mx-auto max-w-lg px-5 py-8">
        <div className="flex items-center gap-3">
          <span className="uc-serif flex size-11 items-center justify-center rounded-lg bg-uc-verde text-lg text-white">J9</span>
          <div>
            <p className="text-sm font-semibold">Juzgado Civil N.º 9 de Villa Esperanza</p>
            <p className="text-xs text-uc-pizarra">Validador de documentos</p>
          </div>
        </div>
        <p className="uc-mono mt-5 rounded-lg border border-uc-linea bg-uc-hoja px-3 py-2 text-xs text-uc-pizarra">
          taller.rossi-ia.com
          <b className={senuelo && revelar ? "rounded bg-uc-lacre px-0.5 text-white" : "text-uc-tinta"}>{ruta}</b>?c={codigo}
        </p>
        <div className="uc-hoja mt-5 rounded-2xl border border-uc-linea p-5">
          <div className="flex items-center gap-3 rounded-xl bg-uc-salvia-claro px-4 py-3 text-uc-verde">
            <span className="text-2xl">✓</span>
            <p className="font-semibold">Documento válido</p>
          </div>
          <dl className="mt-4 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="text-uc-niebla">Código</dt>
            <dd>{codigo}</dd>
            <dt className="text-uc-niebla">Documento</dt>
            <dd>Testimonio judicial</dd>
            <dt className="text-uc-niebla">Firmado por</dt>
            <dd>Juez Ejemplo</dd>
            <dt className="text-uc-niebla">Fecha</dt>
            <dd>12/06/2026 10:35</dd>
            <dt className="text-uc-niebla">Huella</dt>
            <dd className="uc-mono break-all text-xs">{HUELLA}</dd>
          </dl>
        </div>
        {senuelo && revelar && (
          <div className="rise mt-6 rounded-2xl border-2 border-uc-lacre bg-uc-lacre-claro p-5">
            <p className="uc-serif text-2xl text-uc-lacre">Este era el señuelo</p>
            <p className="mt-2 leading-snug">
              Mirá la dirección: dice <b>va1idar</b>, con un <b>uno</b> en lugar de la ele. Un sitio falso puede decir «válido» sobre cualquier cosa.
            </p>
            <p className="mt-2 leading-snug text-uc-pizarra">
              El QR solo lleva a una dirección. Lo que verifica es el sitio oficial correcto y el mecanismo que comprueba el documento.
            </p>
          </div>
        )}
        {!senuelo && (
          <p className="mt-6 text-sm leading-snug text-uc-pizarra">
            Este era el destino esperado. Ahora escaneá el otro código y compará: ¿en qué se diferencian las dos páginas?
          </p>
        )}
      </div>
    </div>
  );
}
