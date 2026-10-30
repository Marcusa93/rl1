"use client";

// Panel del celular del equipo en /tribunal/control (tercera charla), debajo de
// los botones de la pantalla:
//   · aviso si hay dos presentaciones abiertas o una de otra versión
//   · recupero de la clase 2: ayuda memoria con los datos (se proyectan con el botón «📊» de arriba)
//   · expediente: liberar u ocultar D1–D5 en los celulares
//   · en cada actividad: respuestas y «⟲ reiniciar esta actividad» (ensayo)
//   · exportar respuestas (CSV) y reiniciar la sesión (no toca los documentos)

import { useEffect, useRef, useState } from "react";
import { useResultados } from "@/components/clase/vivo";
import { useLive } from "@/components/use-live";
import type { EstadoRemoto } from "@/lib/remoto";
import {
  avisoDoc,
  getTf3Actividad,
  guionTf3,
  notaTf3,
  TF3_ACTIVIDADES,
  TF3_APRENDEN,
  TF3_AVISO_RECUPERO,
  TF3_COTIO,
  TF3_DOCS,
  TF3_MAPA,
  TF3_RECUPERO,
  TF3_SLIDES,
  TF3_SLUG,
  TF3_TRAMOS,
  type Tf3ActKey,
} from "@/lib/tribunal-clase3";
import { cn } from "@/lib/utils";

async function avisar(slug: string, id: string, abierto: boolean) {
  await fetch(`/api/session/${slug}/avisos`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, abierto }) }).catch(() => {});
}

export function PanelTf3({ estado, slug = TF3_SLUG }: { estado: EstadoRemoto; slug?: string }) {
  const slide = TF3_SLIDES[estado.idx];
  const act = slide?.t === "placa" ? slide.actividad : undefined;
  const { data, refresh } = useLive<{ avisos?: string[] }>(`/api/session/${slug}`, 3000);
  const avisos = data?.avisos ?? [];

  // Dos pestañas de la presentación se turnan para publicar (A, B, A…). Una recarga solo cambia de A a B.
  const vistas = useRef<{ id: string; t: number }[]>([]);
  const [dos, setDos] = useState(false);
  useEffect(() => {
    if (!estado.instancia) return;
    const ahora = Date.now();
    const previas = vistas.current.filter((v) => ahora - v.t < 20000);
    if (previas[previas.length - 1]?.id !== estado.instancia) previas.push({ id: estado.instancia, t: ahora });
    vistas.current = previas;
    const ids = previas.map((v) => v.id);
    const hay = ids.some((id, k) => ids.indexOf(id) < k - 1);
    const timer = setTimeout(() => setDos(hay), 0);
    return () => clearTimeout(timer);
  }, [estado.instancia, estado.vivo]);

  if (estado.total !== TF3_SLIDES.length)
    return <Alerta>La presentación del proyector es de otra versión. Recargala en la compu (F5) y recargá este control.</Alerta>;

  return (
    <div className="grid gap-3">
      {dos && <Alerta>Hay DOS presentaciones abiertas y se pisan. Cerrá la que no está en el proyector.</Alerta>}
      {(slide?.t === "ingreso" || (slide?.t === "placa" && slide.visual === "recupero")) && <Recupero proyectado={avisos.includes(TF3_AVISO_RECUPERO)} />}
      {act && <Actividad slug={slug} act={act} />}
      <Expediente slug={slug} avisos={avisos} onCambio={refresh} />
      <Exportar slug={slug} />
      <Reiniciar slug={slug} idx={estado.idx} onCambio={refresh} />
    </div>
  );
}

/**
 * Guion de la placa actual (arriba de los botones): qué aprenden, qué decir, qué preguntar,
 * qué hace la app y cómo pasar a la siguiente. Con el mapa de la clase plegable.
 */
export function GuionTf3({ estado }: { estado: EstadoRemoto }) {
  const slide = TF3_SLIDES[estado.idx];
  const [mapa, setMapa] = useState(false);
  if (!slide) return null;
  const g = guionTf3(slide);
  const tramo = TF3_TRAMOS[slide.tramo];
  const cotio = slide.t === "placa" ? (slide.cotio ?? []) : slide.t === "matriz" || slide.t === "skill" ? [0, 1, 2, 3, 4] : [];
  return (
    <div className="grid gap-2">
      <button
        onClick={() => setMapa((v) => !v)}
        className="flex w-full items-center rounded-2xl border border-violet/50 bg-violet/10 px-4 py-2.5 text-left text-sm font-semibold text-violet"
      >
        <span className="flex-1">🗺 Mapa de la clase: qué enseñamos hoy</span>
        <span>{mapa ? "▲" : "▼"}</span>
      </button>
      {(mapa || slide.t === "ingreso") && <Mapa actual={slide.tramo} />}
      <div className="rounded-2xl border border-amber-400/50 bg-amber-400/10 p-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">
          📝 Guion · solo en su celular{tramo ? ` · ${tramo.nombre} (${tramo.minutos} min)` : ""}
        </p>
        {cotio.length > 0 && (
          <p className="mt-2 text-xs text-faint">
            COTIO en esta placa: <b className="text-teal">{cotio.length === 5 ? "las cinco letras" : cotio.map((i) => `${TF3_COTIO[i].letra} · ${TF3_COTIO[i].nombre}`).join(" + ")}</b>
          </p>
        )}
        <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-teal">🎯 Qué aprenden</p>
        <p className="mt-1 text-lg font-semibold leading-snug">{g.aprenden}</p>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-amber-300">🗣 Decí</p>
        <ul className="mt-1 grid gap-1.5">
          {g.decir.map((d, k) => (
            <li key={k} className="flex gap-2 text-base leading-snug">
              <span className="text-amber-300">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
        {g.preguntar && (
          <>
            <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-amber-300">❓ Preguntá a la sala</p>
            <p className="mt-1 text-base leading-snug">{g.preguntar}</p>
          </>
        )}
        <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-amber-300">👉 En la app</p>
        <p className="mt-1 text-sm leading-snug text-muted">{notaTf3(slide)}</p>
        <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-teal">➡️ Para pasar</p>
        <p className="mt-1 text-base leading-snug">{g.puente}</p>
      </div>
    </div>
  );
}

function Mapa({ actual }: { actual: number }) {
  return (
    <div className="grid gap-3 rounded-2xl border border-violet/40 bg-panel/80 p-4 text-sm leading-snug">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">La idea de hoy</p>
        <p className="mt-1 text-base">{TF3_MAPA.tesis}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">Pregunta que guía la clase</p>
        <p className="mt-1 text-base italic">{TF3_MAPA.pregunta}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">Al terminar, saben</p>
        <ol className="mt-1 grid gap-1">
          {TF3_APRENDEN.map((a, k) => (
            <li key={k} className="flex gap-2">
              <b className="text-teal">{k + 1}</b>
              <span>{a}</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">COTIO aplicado al caso</p>
        <ul className="mt-1 grid gap-1">
          {TF3_COTIO.map((c, k) => (
            <li key={k}>
              <b className="text-teal">
                {c.letra} · {c.nombre}:
              </b>{" "}
              {c.caso}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">El caso en tres líneas</p>
        <p className="mt-1">{TF3_MAPA.caso}</p>
      </div>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-violet">Recorrido</p>
        <ol className="mt-1 grid gap-1">
          {TF3_MAPA.recorrido.map((r) => (
            <li key={r.tramo} className={cn("rounded-lg px-2 py-1", r.tramo === actual ? "bg-teal/15 text-teal" : "text-muted")}>
              <b>{TF3_TRAMOS[r.tramo].nombre}</b> · {TF3_TRAMOS[r.tramo].minutos} min · placas {r.placas} · {r.detalle}
            </li>
          ))}
        </ol>
      </div>
      <p className="text-magenta">{TF3_MAPA.noHoy}</p>
    </div>
  );
}

function Alerta({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border-2 border-magenta bg-magenta/10 p-4 text-sm font-semibold text-magenta">⚠ {children}</div>;
}

function Caja({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-amber-400/50 bg-amber-400/5 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{titulo}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Recupero({ proyectado }: { proyectado: boolean }) {
  const r = TF3_RECUPERO;
  return (
    <Caja titulo="Recupero · datos validados de la clase 2">
      <ul className="grid gap-1 text-sm text-muted">
        <li>{r.ingresos} ingresos · laboratorio: {r.laboratorio.hicieron} (reflexionaron {r.laboratorio.reflexionaron})</li>
        <li>Contexto: {r.contexto.conContexto} de {r.contexto.votaron} eligieron la salida con contexto</li>
        <li>Humano o IA: {r.humanoIa.acertaron} de {r.humanoIa.votaron} reconocieron el texto humano</li>
        <li>Desafío: {r.desafio.empezaron} empezaron · fuentes {r.desafio.campos.find((c) => c.label === "Fuentes")?.n} · verificaciones {r.desafio.campos.find((c) => c.label === "Verificaciones")?.n}</li>
        <li>{r.desafio.pedianSentencia} de {r.desafio.tareas} tareas pedían redactar o dictar una sentencia</li>
        <li className="text-faint">La nube de palabras no registró respuestas en la app: no se muestra.</li>
      </ul>
      <p className={cn("mt-3 text-sm font-semibold", proyectado ? "text-teal" : "text-faint")}>
        {proyectado ? "● En pantalla. Para ocultarlo, tocá «📊 Proyectar recupero» arriba." : "Se proyecta con «📊 Proyectar recupero de la clase 2», arriba."}
      </p>
    </Caja>
  );
}

function Actividad({ slug, act }: { slug: string; act: Tf3ActKey }) {
  const { data } = useResultados(slug, act, 2000);
  const [estado, setEstado] = useState("");
  const a = getTf3Actividad(act)!;
  return (
    <Caja titulo={`Actividad ${a.numero} · ${a.nombre}`}>
      <p className="text-sm text-muted">
        <b className="text-lg text-teal">{data?.responded ?? 0}</b> respuestas. Se puede avanzar y mostrar la devolución aunque no responda nadie.
      </p>
      <button
        onClick={async () => {
          if (!confirm(`¿Borrar las respuestas de la actividad ${a.numero}? Solo para ensayar.`)) return;
          const r = await fetch(`/api/session/${slug}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ activity: act }) }).catch(() => null);
          setEstado(r?.ok ? "listo" : "no se pudo");
        }}
        className="mt-3 w-full rounded-xl border border-magenta/40 bg-magenta/5 px-4 py-2.5 text-left text-sm text-magenta"
      >
        ⟲ Reiniciar esta actividad (ensayo) {estado && <span className="ml-2 text-faint">{estado}</span>}
      </button>
    </Caja>
  );
}

function Expediente({ slug, avisos, onCambio }: { slug: string; avisos: string[]; onCambio: () => void }) {
  return (
    <Caja titulo="Expediente en los celulares">
      <div className="grid gap-1.5">
        {TF3_DOCS.map((d) => {
          const on = avisos.includes(avisoDoc(d.id));
          return (
            <button
              key={d.id}
              onClick={async () => {
                if (d.id === "D5" && !on && !confirm("¿Liberar D5 ahora? Hacelo después de la votación de la Actividad 4.")) return;
                await avisar(slug, avisoDoc(d.id), !on);
                onCambio();
              }}
              className={cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm", on ? "border-teal bg-teal/15 text-teal" : "border-line bg-panel/60")}
            >
              <b className="w-8">{d.id}</b>
              <span className="min-w-0 flex-1">{d.titulo}</span>
              <span className="text-xs font-semibold">{on ? "● liberada" : `se libera en la ${d.libera}`}</span>
            </button>
          );
        })}
      </div>
    </Caja>
  );
}

type Fila = { name: string; activity: string; payload: Record<string, unknown>; created_at: string };

function Exportar({ slug }: { slug: string }) {
  const [estado, setEstado] = useState("");
  async function bajar() {
    setEstado("preparando…");
    try {
      const res = await fetch(`/api/session/${slug}/all-responses`, { cache: "no-store" });
      const { rows } = (await res.json()) as { rows: Fila[] };
      const orden = TF3_ACTIVIDADES.map((a) => a.key as string);
      const filas = rows
        .filter((r) => orden.includes(r.activity))
        .map((r) => [getTf3Actividad(r.activity)?.nombre ?? r.activity, r.name, JSON.stringify(r.payload), new Date(r.created_at).toLocaleString("es-AR")]);
      const celda = (v: string) => `"${v.replace(/"/g, '""')}"`;
      const csv = [["Actividad", "Participante (alias)", "Respuesta", "Fecha"], ...filas].map((f) => f.map(celda).join(";")).join("\r\n");
      const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "tribunal-clase3-respuestas.csv";
      a.click();
      URL.revokeObjectURL(url);
      setEstado("");
    } catch {
      setEstado("no se pudo");
    }
  }
  return (
    <button onClick={bajar} className="mt-2 rounded-2xl border border-line bg-panel/60 px-4 py-3 text-left text-sm text-muted">
      ⬇ Exportar respuestas (CSV) {estado && <span className="ml-2">{estado}</span>}
    </button>
  );
}

function Reiniciar({ slug, idx, onCambio }: { slug: string; idx: number; onCambio: () => void }) {
  const [estado, setEstado] = useState("");
  async function reiniciar() {
    if (!confirm("¿Reiniciar la sesión? Se borran participantes y respuestas y se vuelven a ocultar D1–D5. Solo después de ensayar.")) return;
    setEstado("reiniciando…");
    const r = await fetch(`/api/session/${slug}/reset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }).catch(() => null);
    for (const d of TF3_DOCS) await avisar(slug, avisoDoc(d.id), false);
    const s = TF3_SLIDES[idx];
    if (s?.t === "placa" && s.actividad)
      await fetch(`/api/session/${slug}/activity`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current_activity: s.actividad }) });
    onCambio();
    setEstado(r?.ok ? "listo: sesión vacía" : "no se pudo");
  }
  return (
    <button onClick={reiniciar} className="rounded-2xl border border-magenta/40 bg-magenta/5 px-4 py-3 text-left text-sm text-magenta">
      ⟲ Reiniciar la sesión (después de ensayar) {estado && <span className="ml-2 text-faint">{estado}</span>}
    </button>
  );
}
