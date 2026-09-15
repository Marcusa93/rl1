"use client";

// Entrega del acta: el texto viaja al docente (queda como producto del taller)
// y MessIAs devuelve una mini devolución de mediador senior. Si la devolución
// falla, la entrega vale igual (paracaídas: pedirla al Gem con P11).

import { useEffect, useState } from "react";
import { actaComoTexto, leerActa } from "@/components/taller/acta";
import { TAL_SLUG } from "@/lib/taller-clase";
import { Spinner } from "@/components/ui";

const LS_DEVOLUCION = "tal-devolucion";

export function EntregaActa() {
  const [estado, setEstado] = useState<"listo" | "entregando" | "entregada" | "error">("listo");
  const [devolucion, setDevolucion] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    try {
      const d = localStorage.getItem(LS_DEVOLUCION);
      if (d) {
        setDevolucion(d);
        setEstado("entregada");
      }
    } catch {}
  }, []);

  async function entregar() {
    const texto = actaComoTexto(leerActa());
    setEstado("entregando");
    setAviso("");
    // 1) La entrega en sí: lo único imprescindible.
    const res = await fetch(`/api/session/${TAL_SLUG}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activity: "tal_acta", item_key: "", payload: { texto } }),
    }).catch(() => null);
    if (!res?.ok) {
      setEstado("error");
      setAviso("No se pudo entregar. Revise la conexión y pruebe de nuevo.");
      return;
    }
    setEstado("entregada");
    // 2) La devolución: si falla, la entrega ya está hecha.
    try {
      const dev = await fetch("/api/devolucion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto }),
      });
      const d = await dev.json().catch(() => ({}));
      if (dev.ok && d.texto) {
        setDevolucion(d.texto);
        try {
          localStorage.setItem(LS_DEVOLUCION, d.texto);
        } catch {}
      } else {
        setAviso("Acta entregada ✓. La devolución no salió esta vez: pídansela a su Gem pegando el acta con el prompt P11.");
      }
    } catch {
      setAviso("Acta entregada ✓. La devolución no salió esta vez: pídansela a su Gem pegando el acta con el prompt P11.");
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={entregar}
        disabled={estado === "entregando"}
        className="w-full rounded-2xl bg-gradient-to-r from-violet to-cyan px-4 py-3.5 text-lg font-bold text-ink transition active:scale-[0.99] disabled:opacity-60"
      >
        {estado === "entregando" ? (
          <span className="inline-flex items-center gap-2">
            <Spinner /> Entregando y leyendo su acta…
          </span>
        ) : estado === "entregada" ? (
          "✓ Entregada — entregar de nuevo (vale la última)"
        ) : (
          "📤 Entregar mi acta al docente"
        )}
      </button>

      {aviso && <p className="rounded-xl border border-amber-300/50 bg-amber-400/10 px-3 py-2 text-sm text-amber-200">{aviso}</p>}

      {devolucion && (
        <div className="rounded-2xl border border-violet/50 bg-violet/10 p-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/taller-ia/messias.png" alt="" className="size-8 rounded-full border border-violet/40 object-cover" />
            <p className="text-sm font-bold text-violet">La devolución de MessIAs · solo para usted</p>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed">{devolucion}</p>
        </div>
      )}
    </div>
  );
}
