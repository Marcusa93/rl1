"use client";

// Presentación de la tercera charla del Tribunal Fiscal (proyector 16:9).
//
// La placa manda: al llegar a una placa con actividad la abre en los
// celulares; al llegar a la 08, 10 y 12 libera D1, D2–D3 y D4. D5 queda
// oculta hasta que el docente revela la actuación real (después de la
// votación de la Actividad 4): recién ahí se libera y se pasa a la 14.
//
// Cada actividad: paso 0 aviso (ABRIR) · ▶ resultados (VER RESULTADOS) ·
// ▶ devolución (MOSTRAR DEVOLUCIÓN). «⏹ Cerrar» la cierra en los celulares.
// La devolución funciona aunque no haya respondido nadie.
//
// Todo se maneja desde /tribunal/control (◀ ▶, ir a…, interruptores).
// Teclado: → ← · G grilla · Q QR · P revelado · C contraste · + − tamaño.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { RevelaCtx } from "@/components/tribunal/revelado";
import { FiltrosCollage, Sello, TarjetaQr, TextoCircular } from "@/components/tribunal2/collage";
import {
  AvisoActividad3,
  CabeceraTablero3,
  EstadoSesion3,
  MatrizFinal,
  MejorProveer,
  PREGUNTA_A1,
  PREGUNTA_A2,
  PREGUNTA_A3,
  PREGUNTA_A4,
  Recupero,
  TableroA1,
  TableroA2,
  TableroA3,
  TableroA4,
  useRevelacion,
} from "@/components/tribunal3/tableros";
import { SkillProyectada } from "@/components/tribunal3/skill";
import { CentroCurva3, LAYOUT3, Visual3 } from "@/components/tribunal3/visuales";
import { useLive } from "@/components/use-live";
import { rem } from "@/lib/remoto";
import { TF_INSTITUCION, TF_LINK, TF_QR } from "@/lib/tribunal";
import {
  avisoDoc,
  getTf3Actividad,
  marcaTf3,
  notaTf3,
  TF3_APRENDEN,
  TF3_COTIO,
  TF3_AVISO_RECUPERO,
  TF3_DEVOLUCION,
  TF3_PROYECTAR_RECUPERO,
  TF3_REVELAR_D5,
  TF3_SLIDES,
  TF3_SLUG,
  TF3_TITULO,
  TF3_TRAMOS,
  TF3_VER_MATRIZ,
  TF3_VER_PROMPT,
  tituloTf3,
  type Tf3ActKey,
  type Tf3DocId,
  type Tf3Placa,
  type Tf3Slide,
} from "@/lib/tribunal-clase3";
import { cn } from "@/lib/utils";

const ANCHO = 1920;
const ALTO = 1080;
const INTERVALO = 2500;

type Estilo = CSSProperties & Record<`--${string}`, string | number>;
type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;
type Vivo = { estado: "" | "corriendo" | "listo" | "error"; texto: string };

function leer(clave: string): string | null {
  try {
    return localStorage.getItem(clave);
  } catch {
    return null;
  }
}
function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {}
}

/** Pasos del revelado: los de la placa; la skill del cierre se arma en cuatro. */
const pasosDe = (s: Tf3Slide | undefined) => (s?.t === "placa" ? s.pasos : s?.t === "skill" ? 4 : 0);
const IDX_01 = TF3_SLIDES.findIndex((s) => s.t === "placa" && s.visual === "recupero");
const IDX_14 = TF3_SLIDES.findIndex((s) => s.t === "placa" && s.num === "14");


async function avisar(slug: string, id: string, abierto: boolean) {
  await fetch(`/api/session/${slug}/avisos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, abierto }),
  }).catch(() => {});
}

export function DeckTribunal3({ slug = TF3_SLUG }: { slug?: string }) {
  const total = TF3_SLIDES.length;
  const storageKey = `${slug}-placa`;

  const [idx, setIdx] = useState(() => {
    const v = parseInt(leer(storageKey) ?? "0", 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), total - 1) : 0;
  });
  const [paso, setPaso] = useState(() => pasosDe(TF3_SLIDES[idx]));
  const [foco, setFoco] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(() => leer("tf3-revelado") !== "0");
  const [contraste, setContraste] = useState(() => leer("tf3-contraste") === "1");
  const [grilla, setGrilla] = useState(false);
  const [qr, setQr] = useState(false);
  const [matriz, setMatriz] = useState(false);
  const [prompt, setPrompt] = useState(false);
  const [vivo, setVivo] = useState<Vivo>({ estado: "", texto: "" });
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const [cerrada, setCerrada] = useState<string | null>(null);
  const [abiertaEn, setAbiertaEn] = useState<Partial<Record<Tf3ActKey, number>>>({});
  const lastActivada = useRef<string | null>(null);

  // Avisos abiertos para todos (piezas liberadas y recupero proyectado).
  const { data: sesion, refresh: refrescarSesion } = useLive<{ avisos?: string[]; participants: number }>(`/api/session/${slug}`, 4000);
  const avisos = sesion?.avisos ?? [];
  const recuperoVisible = avisos.includes(TF3_AVISO_RECUPERO);
  const d5Liberada = avisos.includes(avisoDoc("D5"));

  const slide = TF3_SLIDES[idx];
  const enRecupero = slide.t === "placa" && slide.visual === "recupero";
  // Con el recupero oculto, la placa 01 no tiene pasos (▶ no se queda en piezas invisibles).
  const pasosActual = enRecupero && !recuperoVisible ? 0 : pasosDe(slide);
  const esActividad = slide.t === "placa" && Boolean(slide.actividad);
  const conPasos = (revelado || esActividad) && pasosActual > 0;

  const liberar = useCallback(
    async (ids: Tf3DocId[]) => {
      // De a una: la fila de avisos se reescribe entera y dos escrituras simultáneas se pisan.
      for (const id of ids) await avisar(slug, avisoDoc(id), true);
      refrescarSesion();
    },
    [slug, refrescarSesion],
  );

  const irA = useCallback(
    (n: number, entera = false) => {
      const next = Math.min(Math.max(n, 0), total - 1);
      setIdx(next);
      setPaso(entera ? pasosDe(TF3_SLIDES[next]) : 0);
      setFoco(null);
      setMatriz(false);
      setPrompt(false);
      setVivo({ estado: "", texto: "" });
      guardar(storageKey, String(next));
    },
    [total, storageKey],
  );

  const activar = useCallback(
    (key: Tf3ActKey | "lobby") => {
      if (key !== "lobby") {
        lastActivada.current = key;
        setAbiertaEn((m) => (m[key] ? m : { ...m, [key]: Date.now() }));
      }
      setCerrada(key === "lobby" ? lastActivada.current : null);
      setEstado(key === "lobby" ? null : { key, status: "enviando" });
      fetch(`/api/session/${slug}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: key }),
      })
        .then((r) => key !== "lobby" && setEstado({ key, status: r.ok ? "ok" : "error" }))
        .catch(() => key !== "lobby" && setEstado({ key, status: "error" }));
    },
    [slug],
  );

  /** Revelar la actuación real (Actividad 4): cierra la votación, libera D5 y pasa a la placa 14. */
  const revelarD5 = useCallback(async () => {
    activar("lobby");
    await liberar(["D5"]);
    irA(IDX_14);
  }, [activar, liberar, irA]);

  /** Recupero de la clase 2: desde el ingreso va a la 01 y lo muestra entero; en la 01, lo muestra u oculta. */
  const alternarRecupero = useCallback(async () => {
    const mostrar = !enRecupero || !recuperoVisible;
    if (!enRecupero) irA(IDX_01, true);
    else if (mostrar) setPaso(pasosDe(slide));
    await avisar(slug, TF3_AVISO_RECUPERO, mostrar);
    await refrescarSesion();
  }, [enRecupero, recuperoVisible, irA, slide, slug, refrescarSesion]);

  const avanzar = useCallback(() => {
    if (conPasos && paso < pasosActual) {
      setPaso(paso + 1);
      setFoco(null);
    } else if (slide.t === "placa" && slide.actividad === "tf3_a4") revelarD5();
    else irA(idx + 1);
  }, [conPasos, paso, pasosActual, idx, irA, slide, revelarD5]);

  const retroceder = useCallback(() => {
    if (conPasos && paso > 0) {
      setPaso(paso - 1);
      setFoco(null);
    } else irA(idx - 1, true);
  }, [conPasos, paso, idx, irA]);

  // La placa manda: abre su actividad y libera sus piezas (D5 solo al revelar o al llegar a la 14).
  useEffect(() => {
    if (slide.t !== "placa") return;
    if (slide.actividad && lastActivada.current !== slide.actividad) activar(slide.actividad);
    const ids: Tf3DocId[] = [...(slide.libera ?? []), ...(slide.num === "14" ? (["D5"] as Tf3DocId[]) : [])];
    if (ids.length) liberar(ids);
  }, [slide, activar, liberar]);

  const correrVivo = useCallback(async () => {
    setVivo({ estado: "corriendo", texto: "" });
    try {
      const r = await fetch("/api/tribunal/ia3", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modo: "demo" }) });
      const d = await r.json();
      setVivo(d.texto ? { estado: "listo", texto: d.texto } : { estado: "error", texto: "" });
    } catch {
      setVivo({ estado: "error", texto: "" });
    }
  }, []);

  /** Matriz, prompt y chatbot se ven en el tablero: si la placa sigue en el aviso (paso 0), pasa a él. */
  const verTablero = () => setPaso((p) => Math.max(p, 1));

  const alternarRevelado = useCallback(() => {
    setRevelado((r) => {
      guardar("tf3-revelado", r ? "0" : "1");
      return !r;
    });
    setPaso(pasosDe(TF3_SLIDES[idx]));
  }, [idx]);

  const alternarContraste = useCallback(() => {
    setContraste((c) => {
      guardar("tf3-contraste", c ? "0" : "1");
      return !c;
    });
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      if (grilla) {
        if (e.key === "Escape" || e.key === "g" || e.key === "G") setGrilla(false);
        return;
      }
      if (["ArrowRight", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        avanzar();
      } else if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        retroceder();
      } else if (e.key === "Home") irA(0);
      else if (e.key === "End") irA(total - 1, true);
      else if (e.key === "Escape") setFoco(null);
      else if (e.key === "g" || e.key === "G") setGrilla(true);
      else if (e.key === "q" || e.key === "Q") setQr((v) => !v);
      else if (e.key === "p" || e.key === "P") alternarRevelado();
      else if (e.key === "c" || e.key === "C") alternarContraste();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grilla, avanzar, retroceder, irA, total, alternarRevelado, alternarContraste]);

  const tramo = TF3_TRAMOS[slide.tramo];
  const nota = notaTf3(slide);
  useRemotoDeck({
    slug,
    idx,
    total,
    titulo: `${tituloTf3(slide)}${conPasos ? ` · paso ${paso}/${pasosActual}` : ""}`,
    parte: tramo ? `${tramo.nombre} · ${tramo.minutos} min` : undefined,
    nota,
    go: (n) => (n === idx + 1 ? avanzar() : n === idx - 1 ? retroceder() : irA(n)),
    irDirecto: (n) => irA(n),
  });

  const { zoom, aviso: avisoZoom } = useZoomDeck();
  const pasoVisto = conPasos ? paso : pasosActual;
  const revela = { visibles: conPasos ? paso : Infinity, foco, alternarFoco: (i: number) => setFoco((f) => (f === i ? null : i)) };
  const act = slide.t === "placa" ? slide.actividad : undefined;
  const devolucion = Boolean(act && act !== "tf3_a4" && pasoVisto >= 2);
  const cerradaAqui = Boolean(act && cerrada === act);

  return (
    <div className={cn("tf2 tf2-papel relative h-dvh overflow-hidden text-tf2-tinta", contraste && "tf2-contraste")}>
      <FiltrosCollage />
      <AvisoZoom zoom={zoom} visible={avisoZoom} />
      <Escenario>
        <RevelaCtx.Provider value={revela}>
          <main key={idx} className="absolute inset-0">
            {/* Interruptores para el celular de control (no se ven en el proyector). */}
            <div className="sr-only">
              {(slide.t === "ingreso" || enRecupero) && (
                <button onClick={alternarRecupero} {...rem(TF3_PROYECTAR_RECUPERO, enRecupero && recuperoVisible)}>
                  Proyectar recupero
                </button>
              )}
              {act && act !== "tf3_a4" && (
                <button onClick={() => setPaso(pasoVisto >= 2 ? 1 : 2)} {...rem(TF3_DEVOLUCION, devolucion)}>
                  Mostrar devolución
                </button>
              )}
              {act === "tf3_a3" && (
                <>
                  <button
                    onClick={() => {
                      setMatriz((v) => !v);
                      setPrompt(false);
                      verTablero();
                    }}
                    {...rem(TF3_VER_MATRIZ, matriz)}
                  >
                    Ver matriz
                  </button>
                  <button
                    onClick={() => {
                      setPrompt((v) => !v);
                      setMatriz(false);
                      verTablero();
                    }}
                    {...rem(TF3_VER_PROMPT, prompt)}
                  >
                    Ver el prompt COTIO
                  </button>
                  <button
                    onClick={() => {
                      if (vivo.estado) setVivo({ estado: "", texto: "" });
                      else {
                        correrVivo();
                        verTablero();
                      }
                    }}
                    {...rem(vivo.estado ? "✕ Cerrar el chatbot en vivo" : "🤖 Ejecutar en vivo (chatbot)", Boolean(vivo.estado))}
                  >
                    Chatbot en vivo
                  </button>
                </>
              )}
              {act === "tf3_a4" && (
                <button onClick={revelarD5} {...rem(TF3_REVELAR_D5)}>
                  Revelar actuación real
                </button>
              )}
              {act && (
                <button onClick={() => (cerradaAqui ? activar(act) : activar("lobby"))} {...rem(cerradaAqui ? "▶ Reabrir la votación" : "⏹ Cerrar la votación", cerradaAqui)}>
                  Cerrar o reabrir
                </button>
              )}
              <button onClick={() => setQr((v) => !v)} {...rem("🔳 QR para ingresar", qr)}>
                QR
              </button>
              {foco !== null && (
                <button onClick={() => setFoco(null)} {...rem("✕ Quitar el foco")}>
                  Quitar el foco
                </button>
              )}
              <button onClick={alternarRevelado} {...rem("▶ Revelado paso a paso", revelado)}>
                Revelado
              </button>
              <button onClick={alternarContraste} {...rem("◐ Alto contraste", contraste)}>
                Contraste
              </button>
            </div>

            <Membrete slide={slide} idx={idx} total={total} />
            <Pantalla
              slide={slide}
              slug={slug}
              paso={pasoVisto}
              devolucion={devolucion}
              matriz={matriz}
              prompt={prompt}
              vivo={vivo}
              recuperoVisible={recuperoVisible}
              estado={act ? <EstadoSesion3 slug={slug} act={act} desde={abiertaEn[act] ?? null} cerrada={cerradaAqui} intervalo={INTERVALO} /> : null}
            />
          </main>
        </RevelaCtx.Provider>
        <Pie slide={slide} idx={idx} total={total} paso={paso} pasos={conPasos ? pasosActual : 0} estado={estado} qr={qr} contraste={contraste} onQr={() => setQr((v) => !v)} onGrilla={() => setGrilla(true)} onContraste={alternarContraste} onAnt={retroceder} onSig={avanzar} />
        {qr && <QrFlotante participantes={sesion?.participants ?? 0} onCerrar={() => setQr(false)} />}
      </Escenario>
      {grilla && (
        <Grilla
          actual={idx}
          d5Liberada={d5Liberada}
          onIr={(i) => {
            irA(i);
            setGrilla(false);
          }}
          onCerrar={() => setGrilla(false)}
        />
      )}
    </div>
  );
}

function Escenario({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(1);
  useLayoutEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const medir = () => setEscala(Math.min(el.clientWidth / ANCHO, el.clientHeight / ALTO));
    medir();
    const ro = new ResizeObserver(medir);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={ref} className="absolute left-1/2 top-1/2 overflow-hidden" style={{ width: ANCHO, height: ALTO, transform: `translate(-50%, -50%) scale(${escala})`, transformOrigin: "50% 50%" }}>
      {children}
    </div>
  );
}

function Membrete({ slide, idx, total }: { slide: Tf3Slide; idx: number; total: number }) {
  const tramo = TF3_TRAMOS[slide.tramo];
  const cotio = slide.t === "placa" ? (slide.cotio ?? []) : slide.t === "matriz" || slide.t === "skill" ? [0, 1, 2, 3, 4] : [];
  return (
    <div className="tf2-rotulo absolute inset-x-[120px] top-[44px] flex items-center justify-between text-[15px] text-tf2-gris">
      <span>Tribunal Fiscal · IA 2026 · Tercera charla</span>
      {cotio.length > 0 && <MarcaCotio activas={cotio} />}
      <span className="flex items-center gap-6">
        {slide.t !== "ingreso" && tramo && <span>{tramo.nombre}</span>}
        <span className="tabular-nums text-tf2-tinta">{slide.t === "placa" ? marcaTf3(slide) : slide.t === "skill" ? "Lo que se llevan" : `${idx + 1} / ${total}`}</span>
      </span>
    </div>
  );
}

/** Qué parte de COTIO se trabaja en la placa (arriba, al centro). */
function MarcaCotio({ activas }: { activas: number[] }) {
  const nombres = activas.length === 5 ? "COTIO completo" : activas.map((i) => TF3_COTIO[i].nombre).join(" + ");
  return (
    <span className="flex items-center gap-3 normal-case tracking-normal">
      <span className="flex gap-[5px]">
        {TF3_COTIO.map((c, i) => (
          <span
            key={i}
            className={cn(
              "tf2-titular flex size-[34px] items-center justify-center rounded-[4px] text-[22px] leading-none",
              activas.includes(i) ? "bg-tf2-rojo text-white" : "border border-tf2-linea text-tf2-gris/60",
            )}
          >
            {c.letra}
          </span>
        ))}
      </span>
      <span className="tf2-mono text-[17px] text-tf2-tinta">{nombres}</span>
    </span>
  );
}

/** Idea clave proyectada: lo que la sala tiene que llevarse de la placa. */
function Clave({ texto, lugar }: { texto: string; lugar: "abajo" | "arriba" | "ancho" }) {
  const pos = {
    abajo: "bottom-[104px] left-[120px] w-[760px]",
    arriba: "left-[120px] top-[120px] w-[820px]",
    ancho: "left-[120px] top-[388px] w-[1680px]",
  }[lugar];
  return (
    <div className={cn("tf2-sube absolute z-20", pos)} style={{ "--d": "320ms" } as Estilo}>
      <div className={cn("tf2-objeto border-l-[7px] border-tf2-rojo bg-tf2-hoja px-7", lugar === "ancho" ? "flex items-baseline gap-6 py-3" : "py-4")}>
        <p className="tf2-rotulo shrink-0 text-[15px] text-tf2-rojo">Idea clave</p>
        <p className={cn("leading-snug text-tf2-tinta", lugar === "ancho" ? "text-[26px]" : "mt-2 text-[29px]")}>{texto}</p>
      </div>
    </div>
  );
}

function Pantalla({
  slide,
  slug,
  paso,
  devolucion,
  matriz,
  prompt,
  vivo,
  recuperoVisible,
  estado,
}: {
  slide: Tf3Slide;
  slug: string;
  paso: number;
  devolucion: boolean;
  matriz: boolean;
  prompt: boolean;
  vivo: Vivo;
  recuperoVisible: boolean;
  estado: ReactNode;
}) {
  const revelacion = useRevelacion(slide.t === "placa" && slide.num === "14");
  if (slide.t === "ingreso") return <Ingreso slug={slug} />;
  if (slide.t === "matriz") return <MatrizFinal />;
  if (slide.t === "skill") return <SkillProyectada />;
  const p = slide;
  const layout = LAYOUT3[p.visual];

  if (p.actividad) {
    if (paso === 0)
      return (
        <AvisoActividad3
          placa={p}
          estado={estado}
          lado={
            p.curva ? (
              <div className="absolute right-[110px] top-1/2 -translate-y-1/2">
                <div className="relative flex items-center justify-center text-tf2-rojo">
                  <TextoCircular texto={p.curva} radio={300} tam={25} />
                  <div className="tf2-cae absolute inset-0 flex items-center justify-center text-tf2-tinta" style={{ "--d": "500ms" } as Estilo}>
                    <CentroCurva3 visual={p.visual} />
                  </div>
                </div>
              </div>
            ) : undefined
          }
        />
      );
    const preguntas: Record<string, string> = { tf3_a1: PREGUNTA_A1, tf3_a2: PREGUNTA_A2, tf3_a3: PREGUNTA_A3, tf3_a4: PREGUNTA_A4 };
    return (
      <>
        <CabeceraTablero3 placa={p} pregunta={preguntas[p.actividad]} estado={estado} />
        {p.actividad === "tf3_a1" && <TableroA1 slug={slug} intervalo={INTERVALO} devolucion={devolucion} />}
        {p.actividad === "tf3_a2" && <TableroA2 slug={slug} intervalo={INTERVALO} devolucion={devolucion} />}
        {p.actividad === "tf3_a3" && <TableroA3 slug={slug} intervalo={INTERVALO} devolucion={devolucion} matriz={matriz} prompt={prompt} vivo={vivo} />}
        {p.actividad === "tf3_a4" && <TableroA4 slug={slug} intervalo={INTERVALO} />}
      </>
    );
  }

  if (layout === "curva")
    return (
      <>
        <Curva placa={p} />
        {p.clave && <Clave texto={p.clave} lugar="arriba" />}
      </>
    );
  const ancho = layout === "ancho";
  return (
    <>
      <Titulo placa={p} ancho={ancho ? 1500 : 760} />
      {p.clave && <Clave texto={p.clave} lugar={ancho ? "ancho" : "abajo"} />}
      {p.visual === "recupero" && <Recupero visible={recuperoVisible} />}
      {p.visual === "mejorProveer" && <MejorProveer revelacion={revelacion} slug={slug} intervalo={INTERVALO} />}
      {layout === "lado" && (
        <div className="absolute left-[960px] top-[130px] h-[820px] w-[880px]">
          <Visual3 visual={p.visual} />
        </div>
      )}
      {ancho && (
        <div className="absolute left-[120px] top-[470px] h-[520px] w-[1680px]">
          <Visual3 visual={p.visual} />
        </div>
      )}
    </>
  );
}

function Titulo({ placa, ancho }: { placa: Tf3Placa; ancho: number }) {
  return (
    <div className="absolute left-[120px] top-[150px]" style={{ width: ancho }}>
      <h1 className={cn("tf2-titular tf2-sube text-tf2-tinta", ancho > 1000 ? "text-[92px]" : placa.titulo.length > 30 ? "text-[84px]" : "text-[100px]")}>{placa.titulo}</h1>
      <p className="tf2-sube mt-8 text-[36px] leading-snug text-tf2-grafito" style={{ "--d": "140ms", maxWidth: Math.min(ancho, 1200) } as Estilo}>
        {placa.bajada}
      </p>
    </div>
  );
}

function Curva({ placa }: { placa: Tf3Placa }) {
  return (
    <>
      <div className="absolute bottom-[200px] left-[120px] w-[820px]">
        <span className="tf2-rotulo text-[15px] text-tf2-rojo">↻ Giro · síntesis</span>
        <h1 className="tf2-titular tf2-sube mt-6 text-[92px] text-tf2-tinta">{placa.titulo}</h1>
        <p className="tf2-sube mt-8 text-[36px] leading-snug text-tf2-grafito" style={{ "--d": "140ms" } as Estilo}>
          {placa.bajada}
        </p>
      </div>
      <div className="absolute right-[150px] top-1/2 -translate-y-1/2">
        <div className="relative flex items-center justify-center text-tf2-rojo">
          <TextoCircular texto={placa.curva ?? ""} radio={330} tam={26} />
          <div className="tf2-cae absolute inset-0 flex items-center justify-center text-tf2-tinta" style={{ "--d": "500ms" } as Estilo}>
            <CentroCurva3 visual={placa.visual} />
          </div>
        </div>
      </div>
    </>
  );
}

function Ingreso({ slug }: { slug: string }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 4000);
  return (
    <>
      <div className="absolute left-[120px] top-[120px] w-[1060px]">
        <p className="tf2-rotulo text-[17px] text-tf2-rojo">{TF_INSTITUCION} · Ciclo de inteligencia artificial</p>
        <h1 className="tf2-titular tf2-sube mt-6 text-[76px] leading-[1.02]">{TF3_TITULO}</h1>
        <p className="tf2-sube mt-5 text-[26px] text-tf2-grafito" style={{ "--d": "140ms" } as Estilo}>
          Tercera charla · Mario Rodolfo Leal · Marco Rossi · Franco Orellana
        </p>
        <div className="tf2-sube tf2-objeto mt-7 border-l-[7px] border-tf2-rojo bg-tf2-hoja px-7 py-5" style={{ "--d": "220ms" } as Estilo}>
          <p className="tf2-rotulo text-[15px] text-tf2-rojo">Hoy aprendemos a</p>
          <ol className="mt-3 grid gap-2">
            {TF3_APRENDEN.map((a, k) => (
              <li key={k} className="flex gap-4 text-[25px] leading-snug">
                <span className="tf2-titular w-[26px] shrink-0 text-[30px] leading-none text-tf2-rojo">{k + 1}</span>
                <span>{a}</span>
              </li>
            ))}
          </ol>
          <p className="tf2-mono mt-3 text-[18px] text-tf2-gris">Con un método: COTIO · Contexto, Objetivo, Tarea, Input y Output</p>
        </div>
        <div className="tf2-sube mt-7 flex items-center gap-8" style={{ "--d": "280ms" } as Estilo}>
          <span className="tf2-objeto inline-flex items-center gap-4 rounded-[10px] bg-tf2-rojo px-7 py-5 text-white">
            <span className="text-[50px] leading-none">📱</span>
            <span className="tf2-mono text-[28px] font-semibold uppercase tracking-[0.06em]">Escaneá el QR para participar</span>
          </span>
          <span className="tf2-mono text-[26px]">
            <b className="tf2-titular text-[64px] tabular-nums">{data?.participants ?? 0}</b> conectados
          </span>
        </div>
        <p className="tf2-mono mt-4 text-[19px] text-tf2-gris">Sin nombre ni cuenta. Solo se proyectan resultados agrupados.</p>
      </div>
      <div className="tf2-cae absolute right-[110px] top-[150px] rotate-[2deg]" style={{ "--d": "300ms" } as Estilo}>
        <TarjetaQr qr={TF_QR} link={TF_LINK} w={590} />
      </div>
      <div className="absolute left-[1290px] top-[830px] z-10 rotate-[-6deg]">
        <Sello tam={22} d={900}>
          Clase 3 de 6
        </Sello>
      </div>
    </>
  );
}

function Pie({
  slide,
  idx,
  total,
  paso,
  pasos,
  estado,
  qr,
  contraste,
  onQr,
  onGrilla,
  onContraste,
  onAnt,
  onSig,
}: {
  slide: Tf3Slide;
  idx: number;
  total: number;
  paso: number;
  pasos: number;
  estado: EstadoActivacion;
  qr: boolean;
  contraste: boolean;
  onQr: () => void;
  onGrilla: () => void;
  onContraste: () => void;
  onAnt: () => void;
  onSig: () => void;
}) {
  const minutos = TF3_TRAMOS.reduce((a, b) => a + b.minutos, 0);
  const actNombre = estado ? getTf3Actividad(estado.key)?.nombre : undefined;
  const boton = "tf2-mono rounded-[6px] border border-tf2-linea bg-tf2-hoja px-3 py-1.5 text-[15px] text-tf2-grafito transition hover:border-tf2-tinta";
  return (
    <footer className="absolute inset-x-[120px] bottom-[34px] z-30 flex items-center gap-8">
      <div className="flex h-[10px] flex-1 gap-[6px]">
        {TF3_TRAMOS.map((b, k) => (
          <span key={b.nombre} title={b.nombre} className={cn("h-full rounded-full", k < slide.tramo ? "bg-tf2-musgo" : k === slide.tramo && slide.t !== "ingreso" ? "bg-tf2-rojo" : "bg-tf2-linea")} style={{ width: `${(b.minutos / minutos) * 100}%` }} />
        ))}
      </div>
      {estado && (
        <span className={cn("tf2-mono flex items-center gap-2 text-[15px]", estado.status === "error" ? "text-tf2-rojo" : "text-tf2-gris")}>
          <span className={cn("size-[8px] rounded-full", estado.status === "error" ? "bg-tf2-rojo" : "tf2-latido bg-tf2-musgo")} />
          {estado.status === "enviando" && "abriendo…"}
          {estado.status === "ok" && <>en los celulares: {actNombre}</>}
          {estado.status === "error" && "no se pudo abrir: vuelva a ingresar la clave"}
        </span>
      )}
      {pasos > 0 && (
        <span className="flex items-center gap-[5px]">
          {Array.from({ length: pasos }, (_, k) => (
            <span key={k} className={cn("size-[8px] rounded-full", k < paso ? "bg-tf2-tinta" : "bg-tf2-linea")} />
          ))}
        </span>
      )}
      <span className="flex items-center gap-2">
        <button onClick={onQr} className={cn(boton, qr && "border-tf2-tinta bg-tf2-tinta text-white")}>
          QR
        </button>
        <button onClick={onGrilla} className={boton}>
          ▦
        </button>
        <button onClick={onContraste} className={cn(boton, contraste && "border-tf2-tinta bg-tf2-tinta text-white")}>
          ◐
        </button>
        <button onClick={onAnt} className={boton} aria-label="Anterior">
          ◀
        </button>
        <span className="tf2-mono w-[70px] text-center text-[15px] tabular-nums text-tf2-gris">
          {idx + 1}/{total}
        </span>
        <button onClick={onSig} className={boton} aria-label="Siguiente">
          ▶
        </button>
      </span>
    </footer>
  );
}

/** «🔳 QR para ingresar»: el QR a pantalla casi completa, para escanear desde el fondo de la sala. */
function QrFlotante({ participantes, onCerrar }: { participantes: number; onCerrar: () => void }) {
  return (
    <div className="tf2-papel absolute inset-0 z-40 flex items-center justify-center gap-20 px-[100px]">
      <div className="min-w-0 flex-1">
        <p className="tf2-rotulo text-[20px] text-tf2-rojo">Participá desde tu celular</p>
        <h2 className="tf2-titular mt-6 text-[104px] leading-[1.02]">Escaneá el QR</h2>
        <p className="tf2-mono mt-8 break-all text-[30px] leading-snug">{TF_LINK}</p>
        <p className="tf2-mono mt-10 text-[28px]">
          <b className="tf2-titular text-[76px] tabular-nums">{participantes}</b> conectados
        </p>
        <p className="tf2-mono mt-4 text-[20px] text-tf2-gris">Sin nombre ni cuenta.</p>
        <button onClick={onCerrar} className="tf2-mono mt-8 text-[16px] text-tf2-gris underline-offset-2 hover:underline">
          ocultar · Q
        </button>
      </div>
      <div className="tf2-objeto shrink-0 rounded-[8px] bg-white p-5">
        <img src={TF_QR} alt="Código QR para entrar a la clase" className="block size-[920px]" />
      </div>
    </div>
  );
}

function Grilla({ actual, d5Liberada, onIr, onCerrar }: { actual: number; d5Liberada: boolean; onIr: (i: number) => void; onCerrar: () => void }) {
  return (
    <div className="tf2-papel fixed inset-0 z-50 overflow-auto px-12 py-10" onClick={onCerrar}>
      <div className="mx-auto max-w-[110rem]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-baseline justify-between">
          <h2 className="tf2-titular text-[2.6rem]">Todas las pantallas</h2>
          <button onClick={onCerrar} className="tf2-mono rounded-[6px] border border-tf2-linea bg-tf2-hoja px-3 py-1.5 text-sm">
            Cerrar · Esc
          </button>
        </div>
        <div className="mt-8 grid grid-cols-4 gap-3 xl:grid-cols-6">
          {TF3_SLIDES.map((s, i) => {
            const vivo = s.t === "placa" && Boolean(s.actividad);
            const curva = s.t === "placa" && Boolean(s.curva);
            const oculta = s.t === "placa" && s.num === "14" && !d5Liberada;
            return (
              <button
                key={i}
                onClick={() => onIr(i)}
                className={cn("tf2-objeto flex min-h-[8rem] flex-col rounded-[4px] p-3 text-left transition hover:-translate-y-0.5", i === actual ? "bg-tf2-tinta text-white" : vivo ? "bg-tf2-rojo-claro" : curva ? "bg-tf2-salvia-claro" : "bg-tf2-hoja")}
              >
                <span className="tf2-mono flex items-center justify-between text-xs opacity-70">
                  <span>{s.t === "placa" ? s.num : i + 1}</span>
                  {vivo && <span>📱 APP</span>}
                  {curva && <span>↻ giro</span>}
                </span>
                <span className="tf2-serif mt-2 line-clamp-3 text-[1.05rem] leading-snug">{oculta ? "Se revela después de votar" : tituloTf3(s).replace(/^\d+ · (📱 \d · )?/, "")}</span>
                <span className="tf2-mono mt-auto pt-2 text-[0.65rem] opacity-60">{TF3_TRAMOS[s.tramo]?.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
