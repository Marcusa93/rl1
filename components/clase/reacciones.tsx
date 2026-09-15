"use client";

// Reacciones en vivo: el participante toca un emoji en el celular y aparece
// flotando en la pantalla grande. Sirven en cualquier momento de la clase,
// no dependen de la actividad activa.

import { useEffect, useRef, useState } from "react";
import { REACCIONES } from "@/lib/clase-vivo";
import { cn } from "@/lib/utils";

type Flotante = { id: string; emoji: string; x: number; dur: number; size: number; dx: number };

const MAX_EN_PANTALLA = 70;

function flotante(id: string, emoji: string, grande: boolean): Flotante {
  return {
    id,
    emoji,
    x: 4 + Math.random() * 92,
    dur: grande ? 3.8 + Math.random() * 2.2 : 1.4 + Math.random() * 0.5,
    size: grande ? 2.4 + Math.random() * 1.8 : 1.8,
    dx: (Math.random() - 0.5) * (grande ? 16 : 6),
  };
}

function Capa({ items, corto }: { items: Flotante[]; corto?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {items.map((f) => (
        <span
          key={f.id}
          className={cn("absolute bottom-0 select-none", corto ? "flotar-corto" : "flotar")}
          style={
            {
              left: `${f.x}%`,
              fontSize: `${f.size}rem`,
              "--dur": `${f.dur}s`,
              "--dx": `${f.dx}vw`,
            } as React.CSSProperties
          }
        >
          {f.emoji}
        </span>
      ))}
    </div>
  );
}

/** Deck: consulta las reacciones nuevas y las hace subir por la pantalla. */
export function LluviaReacciones({
  slug,
  intervalo = 1500,
  contador,
}: {
  slug: string;
  intervalo?: number;
  /** Muestra cuántos 👏 llegaron desde que se activó (placa final). */
  contador?: boolean;
}) {
  const [items, setItems] = useState<Flotante[]>([]);
  const [aplausos, setAplausos] = useState(0);
  const cursor = useRef<string | null>(null);
  const enPantalla = useRef(0);

  useEffect(() => {
    if (contador) setAplausos(0);
  }, [contador]);

  useEffect(() => {
    let vivo = true;
    let timer: ReturnType<typeof setTimeout>;

    function lanzar(nuevas: { id: string; emoji: string }[]) {
      // Repartidas a lo largo del intervalo, para que no salgan todas juntas.
      nuevas.forEach((n, i) => {
        setTimeout(() => {
          if (!vivo || enPantalla.current >= MAX_EN_PANTALLA) return;
          const f = flotante(n.id, n.emoji, true);
          enPantalla.current++;
          setItems((prev) => [...prev, f]);
          setTimeout(() => {
            enPantalla.current--;
            setItems((prev) => prev.filter((p) => p.id !== f.id));
          }, f.dur * 1000 + 200);
        }, (i * intervalo) / Math.max(1, nuevas.length));
      });
      const claps = nuevas.filter((n) => n.emoji === "👏").length;
      if (claps) setAplausos((a) => a + claps);
    }

    async function tick() {
      try {
        const q = cursor.current ? `?desde=${encodeURIComponent(cursor.current)}` : "";
        const res = await fetch(`/api/session/${slug}/reaccion${q}`, { cache: "no-store" });
        const d = (await res.json()) as { cursor?: string; items?: { id: string; emoji: string }[] };
        if (vivo && res.ok) {
          if (d.cursor) cursor.current = d.cursor;
          if (d.items?.length) lanzar(d.items);
        }
      } catch {}
      if (vivo) timer = setTimeout(tick, intervalo);
    }
    tick();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [slug, intervalo]);

  return (
    <>
      <Capa items={items} />
      {contador && (
        <div className="pointer-events-none fixed bottom-16 right-5 z-40 flex items-center gap-2 rounded-2xl border border-teal/40 bg-ink/80 px-4 py-2 backdrop-blur">
          <span className="text-3xl">👏</span>
          <span className="font-mono text-3xl font-bold text-teal">{aplausos}</span>
        </div>
      )}
    </>
  );
}

/** Celular: barra fija con los emojis; cada toque viaja a la pantalla. */
export function BarraReacciones({ slug, flotanteEnEscritorio }: { slug: string; flotanteEnEscritorio?: boolean }) {
  const [items, setItems] = useState<Flotante[]>([]);
  const [aviso, setAviso] = useState("");
  const ultimo = useRef(0);

  function enviar(emoji: string) {
    const ahora = Date.now();
    if (ahora - ultimo.current < 350) return;
    ultimo.current = ahora;

    const f = flotante(`${ahora}`, emoji, false);
    setItems((prev) => [...prev.slice(-12), f]);
    setTimeout(() => setItems((prev) => prev.filter((p) => p.id !== f.id)), f.dur * 1000 + 100);
    if ("vibrate" in navigator) navigator.vibrate?.(12);

    fetch(`/api/session/${slug}/reaccion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emoji }),
    })
      .then((r) => setAviso(r.ok ? "" : "No se pudo enviar. Recargue la página."))
      .catch(() => setAviso("Sin conexión"));
  }

  return (
    <>
      <Capa items={items} corto />
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line/60 bg-ink/85 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur",
          flotanteEnEscritorio &&
            "xl:inset-x-auto xl:bottom-4 xl:left-1/2 xl:-translate-x-1/2 xl:rounded-2xl xl:border xl:px-2 xl:py-2 xl:shadow-2xl",
        )}
      >
        <p className={cn("mb-1.5 text-center text-[11px] uppercase tracking-widest text-faint", flotanteEnEscritorio && "xl:hidden")}>
          {aviso || "Envíe una reacción a la pantalla"}
        </p>
        <div className="mx-auto flex max-w-md items-center justify-between gap-1.5">
          {REACCIONES.map((e) => (
            <button
              key={e}
              onClick={() => enviar(e)}
              className={cn(
                "flex h-12 flex-1 items-center justify-center rounded-xl border border-line bg-panel/60 text-2xl transition active:scale-90 active:border-teal/60",
                flotanteEnEscritorio && "xl:h-10 xl:w-11 xl:flex-none xl:text-xl",
              )}
              aria-label={`Enviar ${e}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
