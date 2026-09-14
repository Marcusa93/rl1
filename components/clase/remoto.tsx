"use client";

// Control remoto del deck (ver lib/remoto.ts).
// - useRemotoDeck: el deck publica qué botones [data-remoto] hay en pantalla y
//   ejecuta los comandos que llegan del celular.
// - ControlRemoto: la pantalla del celular del docente.

import { useEffect, useRef, useState } from "react";
import type { BotonRemoto, CmdConSeq, CmdRemoto, EstadoRemoto } from "@/lib/remoto";
import { cn } from "@/lib/utils";

const POLL_DECK = 450;
const POLL_CEL = 800;
const LATIDO = 8000;

function botonesEnPantalla(): { el: HTMLElement; boton: BotonRemoto }[] {
  return [...document.querySelectorAll<HTMLElement>("main [data-remoto]")].map((el) => ({
    el,
    boton: { label: el.dataset.remoto ?? "", activo: el.dataset.activo === "1" },
  }));
}

/** Deck: publica su estado y obedece al celular. */
export function useRemotoDeck({
  slug,
  idx,
  total,
  titulo,
  parte,
  nota,
  go,
}: {
  slug: string;
  idx: number;
  total: number;
  titulo: string;
  parte?: string;
  nota?: string;
  go: (n: number) => void;
}) {
  const ref = useRef({ idx, total, titulo, parte, nota, go });
  ref.current = { idx, total, titulo, parte, nota, go };

  // Publicar el estado cuando cambia (y un latido cada tanto).
  useEffect(() => {
    let ultimo = "";
    let ultimoEnvio = 0;
    let enviando = false;
    const id = setInterval(() => {
      if (enviando) return;
      const { idx, total, titulo, parte, nota } = ref.current;
      const botones = botonesEnPantalla().map((b) => b.boton);
      const firma = JSON.stringify({ idx, total, titulo, parte, nota, botones });
      if (firma === ultimo && Date.now() - ultimoEnvio < LATIDO) return;
      const estado: EstadoRemoto = { idx, total, titulo, parte, nota, botones, vivo: Date.now() };
      enviando = true;
      fetch(`/api/remoto/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
        .then((r) => {
          if (r.ok) {
            ultimo = firma;
            ultimoEnvio = Date.now();
          }
        })
        .catch(() => {})
        .finally(() => (enviando = false));
    }, 300);
    return () => clearInterval(id);
  }, [slug]);

  // Consultar y ejecutar los comandos del celular.
  useEffect(() => {
    let vivo = true;
    let seq: number | null = null;
    let timer: ReturnType<typeof setTimeout>;

    function ejecutar(c: CmdConSeq) {
      const { idx, go } = ref.current;
      if (c.tipo === "sig") go(idx + 1);
      else if (c.tipo === "ant") go(idx - 1);
      else if (c.tipo === "ir") go(c.idx);
      else if (c.tipo === "click") {
        const lista = botonesEnPantalla();
        const blanco = lista[c.i]?.boton.label === c.label ? lista[c.i] : lista.find((b) => b.boton.label === c.label);
        blanco?.el.click();
      }
    }

    async function tick() {
      try {
        const q = seq === null ? "" : `&desde=${seq}`;
        const res = await fetch(`/api/remoto/${slug}?que=cmd${q}`, { cache: "no-store" });
        if (res.ok) {
          const d = (await res.json()) as { seq: number; cmds: CmdConSeq[] };
          if (vivo) {
            // Los "ir" y "sig/ant" cambian de placa: se ejecutan de a uno por tick
            // para que los clicks posteriores encuentren la placa nueva en pantalla.
            for (const c of d.cmds) {
              ejecutar(c);
              seq = c.seq;
              if (c.tipo !== "click") break;
            }
            if (seq === null) seq = d.seq;
          }
        }
      } catch {}
      if (vivo) timer = setTimeout(tick, POLL_DECK);
    }
    tick();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [slug]);
}

/** Celular del docente: pasar placas y tocar las tarjetas de la pantalla. */
export function ControlRemoto({ slug, titulos, nombre }: { slug: string; titulos: string[]; nombre: string }) {
  const [estado, setEstado] = useState<EstadoRemoto | null>(null);
  const [tocado, setTocado] = useState<string | null>(null);
  const [indice, setIndice] = useState(false);
  const cola = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    let vivo = true;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      try {
        const res = await fetch(`/api/remoto/${slug}?que=estado`, { cache: "no-store" });
        if (res.ok && vivo) setEstado(((await res.json()) as { estado: EstadoRemoto | null }).estado);
      } catch {}
      if (vivo) timer = setTimeout(tick, POLL_CEL);
    }
    tick();
    return () => {
      vivo = false;
      clearTimeout(timer);
    };
  }, [slug]);

  // Que la pantalla del celular no se apague mientras presenta.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const pedir = () => {
      const wl = (navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock;
      wl?.request("screen").then((l) => (lock = l)).catch(() => {});
    };
    pedir();
    const onVis = () => document.visibilityState === "visible" && pedir();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, []);

  function enviar(cmd: CmdRemoto, marca?: string) {
    if (marca) setTocado(marca);
    if ("vibrate" in navigator) navigator.vibrate?.(10);
    // En orden: un comando no sale hasta que el anterior quedó guardado.
    cola.current = cola.current.then(() =>
      fetch(`/api/remoto/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cmd }),
      }).catch(() => {}),
    );
    if (marca) setTimeout(() => setTocado((t) => (t === marca ? null : t)), 1200);
  }

  const conectado = estado && Date.now() - estado.vivo < LATIDO * 2.5;

  return (
    <div className="bg-grid flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line/60 bg-ink/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="truncate text-xs text-faint">📱 Control · {nombre}</p>
          <span className={cn("flex shrink-0 items-center gap-1.5 text-xs", conectado ? "text-teal" : "text-magenta")}>
            <span className={cn("size-2 rounded-full", conectado ? "animate-pulse bg-teal" : "bg-magenta")} />
            {conectado ? "presentación conectada" : "abra la presentación en la compu"}
          </span>
        </div>
        {estado && (
          <button onClick={() => setIndice((v) => !v)} className="mt-2 w-full text-left">
            <p className="font-mono text-[11px] uppercase tracking-widest text-violet">
              {estado.idx + 1} / {estado.total}
              {estado.parte ? ` · ${estado.parte}` : ""}
            </p>
            <p className="text-lg font-bold leading-snug">
              {estado.titulo} <span className="text-xs font-normal text-faint">{indice ? "▲" : "▼ ir a…"}</span>
            </p>
          </button>
        )}
      </header>

      {indice && (
        <div className="max-h-[50dvh] overflow-auto border-b border-line/60 bg-ink-2/90 px-3 py-2">
          {titulos.map((t, i) => (
            <button
              key={i}
              onClick={() => {
                enviar({ tipo: "ir", idx: i });
                setIndice(false);
              }}
              className={cn(
                "flex w-full items-baseline gap-3 rounded-lg px-2 py-2 text-left text-sm",
                estado?.idx === i ? "bg-teal/15 text-teal" : "text-muted active:bg-panel",
              )}
            >
              <span className="w-6 shrink-0 text-right font-mono text-xs text-faint">{i + 1}</span>
              <span className="min-w-0 truncate">{t}</span>
            </button>
          ))}
        </div>
      )}

      <main className="flex-1 space-y-2 px-3 py-3 pb-36">
        {estado?.nota && (
          <div className="mb-3 rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">📝 Ayuda memoria · solo en su celular</p>
            <p className="mt-2 whitespace-pre-line text-lg leading-relaxed">{estado.nota}</p>
          </div>
        )}
        {estado?.botones.length ? (
          <>
            <p className="px-1 text-[11px] uppercase tracking-widest text-faint">En pantalla · toque para mostrar u ocultar</p>
            {estado.botones.map((b, i) => {
              const marca = `${i}:${b.label}`;
              return (
                <button
                  key={marca}
                  onClick={() => enviar({ tipo: "click", i, label: b.label }, marca)}
                  className={cn(
                    "flex min-h-14 w-full items-center rounded-2xl border px-4 py-3 text-left text-base font-medium transition active:scale-[0.98]",
                    b.activo ? "border-teal bg-teal/15 text-teal" : "border-line bg-panel/60",
                    tocado === marca && "ring-2 ring-violet/70",
                  )}
                >
                  <span className="min-w-0 flex-1">{b.label}</span>
                  {b.activo && <span className="ml-2 text-xs">● visible</span>}
                </button>
              );
            })}
          </>
        ) : (
          <p className="px-1 pt-6 text-center text-sm text-faint">
            {estado ? "Esta placa no tiene botones: explíquela y avance." : "Esperando la presentación…"}
          </p>
        )}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-2 gap-2 border-t border-line/60 bg-ink/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <button
          onClick={() => enviar({ tipo: "ant" }, "ant")}
          className={cn("h-20 rounded-2xl border border-line bg-panel/70 text-2xl font-bold active:scale-[0.97]", tocado === "ant" && "ring-2 ring-violet/70")}
        >
          ◀
        </button>
        <button
          onClick={() => enviar({ tipo: "sig" }, "sig")}
          className={cn(
            "h-20 rounded-2xl bg-gradient-to-r from-teal to-cyan text-2xl font-bold text-ink active:scale-[0.97]",
            tocado === "sig" && "ring-2 ring-violet/70",
          )}
        >
          ▶
        </button>
      </nav>
    </div>
  );
}
