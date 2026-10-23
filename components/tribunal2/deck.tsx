"use client";

// Presentación de la segunda charla del Tribunal Fiscal (proyector 16:9).
//
// Escenario fijo de 1920×1080 que se escala entero a la pantalla: el collage
// se compone una sola vez y se ve igual en cualquier proyector. La placa
// manda: al llegar a una placa con actividad, la abre sola en los celulares.
//
// Revelado paso a paso: ▶ suma piezas a la placa (las de lista se pueden
// destacar); en las actividades, el paso 0 es el aviso con el celular y el
// QR, y ▶ pasa al tablero en vivo (en la 3 y la 4, otro ▶ revela qué cambió o
// quién escribió cada texto, también en los celulares).
//
// Todo se maneja desde el celular de control (/tribunal/control): ◀ ▶, ir a
// cualquier placa y los interruptores de la pantalla (QR, Plan B, proyectar
// la nube, ejemplo preparado, revelar).
//
// Teclado (y clickers: PageDown/PageUp):
//   → Espacio PageDown  siguiente · ← PageUp  anterior · Home / End
//   G grilla · Esc quitar foco · Q QR · P revelado sí/no · C contraste
//   B Plan B sin conexión · R proyectar la nube (revisada) · + − tamaño
//   Shift+R reiniciar la sesión (después de ensayar)

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useRemotoDeck } from "@/components/clase/remoto";
import { AvisoZoom, useZoomDeck } from "@/components/clase/zoom";
import { RevelaCtx } from "@/components/tribunal/revelado";
import { FiltrosCollage, Sello, TarjetaQr, TextoCircular } from "@/components/tribunal2/collage";
import {
  AvisoActividad,
  CabeceraTablero,
  EstadoSesion,
  Huellas,
  Recapitulacion,
  TableroA1,
  TableroA2,
  TableroA3,
  TableroA4,
  TableroA5,
  useModeracion2,
} from "@/components/tribunal2/tableros";
import { CentroCurva, LAYOUT, Visual } from "@/components/tribunal2/visuales";
import { useLive } from "@/components/use-live";
import { rem } from "@/lib/remoto";
import { TF_INSTITUCION, TF_LINK, TF_QR } from "@/lib/tribunal";
import {
  getTf2Actividad,
  TF2_BLOQUES,
  TF2_PLAN_B,
  TF2_REVELA_A3,
  TF2_REVELA_A4,
  TF2_SLIDES,
  TF2_SLUG,
  TF2_TITULO,
  tituloTf2,
  type Tf2ActKey,
  type Tf2Placa,
  type Tf2Slide,
} from "@/lib/tribunal-clase2";
import { cn } from "@/lib/utils";

const ANCHO = 1920;
const ALTO = 1080;
const INTERVALO = 2500;

type Estilo = CSSProperties & Record<`--${string}`, string | number>;
type EstadoActivacion = { key: string; status: "enviando" | "ok" | "error" } | null;

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

const pasosDe = (s: Tf2Slide | undefined) => (s?.t === "placa" ? s.pasos : 0);

const NOTA_INGRESO =
  "Ingreso con QR: pedir que escaneen y dejen el celular a mano. No hace falta nombre ni cuenta. Cuando estén adentro, ▶ a la placa 01 (el experimento del robot).";
const NOTA_RECAP =
  "Recapitulación visual: una idea por bloque y lo que dijo la sala. En los celulares, cada participante tiene su instrucción y su ficha para copiar o bajar en texto.";

export function DeckTribunal2({ slug = TF2_SLUG }: { slug?: string }) {
  const total = TF2_SLIDES.length;
  const storageKey = `${slug}-placa`;

  const [idx, setIdx] = useState(() => {
    const v = parseInt(leer(storageKey) ?? "0", 10);
    return Number.isFinite(v) ? Math.min(Math.max(v, 0), total - 1) : 0;
  });
  const [paso, setPaso] = useState(() => pasosDe(TF2_SLIDES[idx]));
  const [foco, setFoco] = useState<number | null>(null);
  const [revelado, setRevelado] = useState(() => leer("tf2-revelado") !== "0");
  const [contraste, setContraste] = useState(() => leer("tf2-contraste") === "1");
  const [grilla, setGrilla] = useState(false);
  const [qr, setQr] = useState(false);
  const [planB, setPlanB] = useState(false);
  const [ejemploA2, setEjemploA2] = useState(false);
  const [estado, setEstado] = useState<EstadoActivacion>(null);
  const [abiertaEn, setAbiertaEn] = useState<Partial<Record<Tf2ActKey, number>>>({});
  // Actividad cerrada a mano en los celulares (vuelven a la espera); se reabre con el mismo botón.
  const [cerrada, setCerrada] = useState<string | null>(null);
  const lastActivada = useRef<string | null>(null);
  const { moderacion, cambiar } = useModeracion2(slug, INTERVALO);

  const slide = TF2_SLIDES[idx];
  const pasosActual = pasosDe(slide);
  // Las actividades siempre van por pasos (aviso → tablero → revelación), aunque el revelado esté apagado.
  const esActividad = slide.t === "placa" && Boolean(slide.actividad);
  const conPasos = (revelado || esActividad) && pasosActual > 0;

  const irA = useCallback(
    (n: number, entera = false) => {
      const next = Math.min(Math.max(n, 0), total - 1);
      setIdx(next);
      setPaso(entera ? pasosDe(TF2_SLIDES[next]) : 0);
      setFoco(null);
      setEjemploA2(false);
      guardar(storageKey, String(next));
    },
    [total, storageKey],
  );

  const avanzar = useCallback(() => {
    if (conPasos && paso < pasosActual) {
      setPaso(paso + 1);
      setFoco(null);
    } else irA(idx + 1);
  }, [conPasos, paso, pasosActual, idx, irA]);

  const retroceder = useCallback(() => {
    if (conPasos && paso > 0) {
      setPaso(paso - 1);
      setFoco(null);
    } else irA(idx - 1, true);
  }, [conPasos, paso, idx, irA]);

  const activar = useCallback(
    (key: Tf2ActKey) => {
      lastActivada.current = key;
      setCerrada(null);
      setEstado({ key, status: "enviando" });
      setAbiertaEn((m) => (m[key] ? m : { ...m, [key]: Date.now() }));
      fetch(`/api/session/${slug}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: key }),
      })
        .then((r) => setEstado({ key, status: r.ok ? "ok" : "error" }))
        .catch(() => setEstado({ key, status: "error" }));
    },
    [slug],
  );

  const cerrar = useCallback(
    (key: Tf2ActKey) => {
      setCerrada(key);
      setEstado(null);
      fetch(`/api/session/${slug}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_activity: "lobby" }),
      }).catch(() => {});
    },
    [slug],
  );

  // La placa manda: si tiene actividad, se abre sola en los celulares.
  useEffect(() => {
    const key = slide.t === "placa" ? slide.actividad : undefined;
    if (!key || lastActivada.current === key) return;
    activar(key);
  }, [slide, activar]);

  const alternarRevelado = useCallback(() => {
    setRevelado((r) => {
      guardar("tf2-revelado", r ? "0" : "1");
      return !r;
    });
    setPaso(pasosDe(TF2_SLIDES[idx]));
  }, [idx]);

  const alternarContraste = useCallback(() => {
    setContraste((c) => {
      guardar("tf2-contraste", c ? "0" : "1");
      return !c;
    });
  }, []);

  useEffect(() => {
    async function reiniciar() {
      if (!confirm("¿Reiniciar la sesión? Se borran todos los participantes, sus respuestas y la moderación.")) return;
      await fetch(`/api/session/${slug}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      await cambiar({ reiniciar: true });
      setAbiertaEn({});
      if (slide.t === "placa" && slide.actividad) activar(slide.actividad);
    }
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
      else if (e.key === "b" || e.key === "B") setPlanB((v) => !v);
      else if (e.key === "R" && e.shiftKey) reiniciar();
      else if (e.key === "r" && slide.t === "placa" && slide.actividad === "tf2_a1")
        cambiar({ activity: "tf2_a1", proyectar: !moderacion.tf2_a1?.proyectar });
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grilla, avanzar, retroceder, irA, total, slide, activar, cambiar, moderacion, alternarRevelado, alternarContraste, slug]);

  const bloque = TF2_BLOQUES[slide.bloque];
  const nota = slide.t === "placa" ? slide.nota : slide.t === "ingreso" ? NOTA_INGRESO : NOTA_RECAP;

  useRemotoDeck({
    slug,
    idx,
    total,
    titulo: `${tituloTf2(slide)}${conPasos ? ` · paso ${paso}/${pasosActual}` : ""}`,
    parte: bloque ? `Bloque ${slide.bloque + 1} · ${bloque.nombre} · ${bloque.minutos} min` : undefined,
    nota,
    go: (n) => (n === idx + 1 ? avanzar() : n === idx - 1 ? retroceder() : irA(n)),
  });

  const { zoom, aviso: avisoZoom } = useZoomDeck();
  const revela = {
    visibles: conPasos ? paso : Infinity,
    foco,
    alternarFoco: (i: number) => setFoco((f) => (f === i ? null : i)),
  };

  return (
    <div className={cn("tf2 tf2-papel relative h-dvh overflow-hidden text-tf2-tinta", contraste && "tf2-contraste")}>
      <FiltrosCollage />
      <AvisoZoom zoom={zoom} visible={avisoZoom} />
      <Escenario>
        <RevelaCtx.Provider value={revela}>
          <main key={idx} className="absolute inset-0">
            {/* Interruptores para el celular de control (no se ven en el proyector). */}
            <div className="sr-only">
              {slide.t === "placa" && slide.actividad === "tf2_a3" && (
                <button onClick={() => setPaso(paso >= 2 ? 1 : 2)} {...rem(TF2_REVELA_A3, paso >= 2)}>
                  Revelar qué cambió
                </button>
              )}
              {slide.t === "placa" && slide.actividad === "tf2_a4" && (
                <button onClick={() => setPaso(paso >= 2 ? 1 : 2)} {...rem(TF2_REVELA_A4, paso >= 2)}>
                  Revelar la autoría
                </button>
              )}
              {esActividad && (
                <button onClick={() => setPlanB((v) => !v)} {...rem(TF2_PLAN_B, planB)}>
                  Plan B
                </button>
              )}
              {slide.t === "placa" && slide.actividad && (
                <button
                  onClick={() => (cerrada === slide.actividad ? activar(slide.actividad!) : cerrar(slide.actividad!))}
                  {...rem(cerrada === slide.actividad ? "▶ Reabrir la actividad en los celulares" : "⏹ Cerrar la actividad en los celulares", cerrada === slide.actividad)}
                >
                  Cerrar o reabrir la actividad
                </button>
              )}
              <button onClick={() => setQr((v) => !v)} {...rem("🔳 QR para ingresar", qr)}>
                QR para ingresar
              </button>
              {foco !== null && (
                <button onClick={() => setFoco(null)} {...rem("✕ Quitar el foco")}>
                  Quitar el foco
                </button>
              )}
              <button onClick={alternarRevelado} {...rem("▶ Revelado paso a paso", revelado)}>
                Revelado paso a paso
              </button>
              <button onClick={alternarContraste} {...rem("◐ Alto contraste", contraste)}>
                Alto contraste
              </button>
            </div>

            <Membrete slide={slide} idx={idx} total={total} />
            <Pantalla
              slide={slide}
              slug={slug}
              paso={conPasos ? paso : pasosActual}
              planB={planB}
              ejemploA2={ejemploA2}
              onEjemploA2={() => setEjemploA2((v) => !v)}
              moderacion={moderacion}
              onCambiar={cambiar}
              estado={slide.t === "placa" && slide.actividad ? <EstadoSesion slug={slug} act={slide.actividad} desde={abiertaEn[slide.actividad] ?? null} intervalo={INTERVALO} /> : null}
            />
          </main>
        </RevelaCtx.Provider>

        <Pie
          slide={slide}
          idx={idx}
          total={total}
          paso={paso}
          pasos={conPasos ? pasosActual : 0}
          estado={estado}
          qr={qr}
          contraste={contraste}
          onQr={() => setQr((v) => !v)}
          onGrilla={() => setGrilla(true)}
          onContraste={alternarContraste}
          onAnt={retroceder}
          onSig={avanzar}
        />
        {qr && <QrFlotante slug={slug} onCerrar={() => setQr(false)} />}
      </Escenario>

      {grilla && (
        <Grilla
          actual={idx}
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

/** Escenario de 1920×1080 escalado a la ventana (sin deformar; el sobrante queda en papel). */
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
    <div
      ref={ref}
      className="absolute left-1/2 top-1/2 overflow-hidden"
      style={{ width: ANCHO, height: ALTO, transform: `translate(-50%, -50%) scale(${escala})`, transformOrigin: "50% 50%" }}
    >
      {children}
    </div>
  );
}

/** Franja superior: ciclo, bloque y número de placa (tipografía de máquina, discreta). */
function Membrete({ slide, idx, total }: { slide: Tf2Slide; idx: number; total: number }) {
  const bloque = TF2_BLOQUES[slide.bloque];
  return (
    <div className="tf2-rotulo absolute inset-x-[120px] top-[44px] flex items-center justify-between text-[15px] text-tf2-gris">
      <span>Tribunal Fiscal · IA 2026 · Segunda charla</span>
      <span className="flex items-center gap-6">
        {slide.t !== "ingreso" && bloque && (
          <span>
            Bloque {slide.bloque + 1} · {bloque.nombre}
          </span>
        )}
        <span className="tabular-nums text-tf2-tinta">{slide.t === "placa" ? `${slide.num} / 31` : `${idx + 1} / ${total}`}</span>
      </span>
    </div>
  );
}

function Pantalla({
  slide,
  slug,
  paso,
  planB,
  ejemploA2,
  onEjemploA2,
  moderacion,
  onCambiar,
  estado,
}: {
  slide: Tf2Slide;
  slug: string;
  paso: number;
  planB: boolean;
  ejemploA2: boolean;
  onEjemploA2: () => void;
  moderacion: ReturnType<typeof useModeracion2>["moderacion"];
  onCambiar: ReturnType<typeof useModeracion2>["cambiar"];
  estado: ReactNode;
}) {
  if (slide.t === "ingreso") return <Ingreso slug={slug} />;
  if (slide.t === "recapitulacion") return <Recapitulacion slug={slug} intervalo={INTERVALO} moderacion={moderacion} />;

  const p = slide;
  const layout = LAYOUT[p.visual];

  if (p.actividad) {
    if (paso === 0) return <AvisoActividad placa={p} estado={estado} />;
    return (
      <>
        <CabeceraTablero placa={p} estado={estado} />
        {p.actividad === "tf2_a1" && <TableroA1 slug={slug} intervalo={INTERVALO} moderacion={moderacion} onCambiar={onCambiar} planB={planB} />}
        {p.actividad === "tf2_a2" && (
          <TableroA2 slug={slug} intervalo={INTERVALO} moderacion={moderacion} onCambiar={onCambiar} ejemplo={ejemploA2} onEjemplo={onEjemploA2} planB={planB} />
        )}
        {p.actividad === "tf2_a3" && <TableroA3 slug={slug} intervalo={INTERVALO} revelado={paso >= 2} planB={planB} />}
        {p.actividad === "tf2_a4" && <TableroA4 slug={slug} intervalo={INTERVALO} revelado={paso >= 2} planB={planB} />}
        {p.actividad === "tf2_a5" && <TableroA5 slug={slug} intervalo={INTERVALO} planB={planB} />}
      </>
    );
  }

  if (layout === "curva") return <Curva placa={p} />;

  return (
    <>
      <Titulo placa={p} ancho={layout === "ancho" ? 1500 : 760} />
      {layout === "propio" && p.visual === "huellas" && <Huellas slug={slug} moderacion={moderacion} onCambiar={onCambiar} />}
      {layout === "lado" && (
        <div className="absolute left-[960px] top-[130px] h-[820px] w-[880px]">
          <Visual visual={p.visual} />
        </div>
      )}
      {layout === "ancho" && (
        <div className="absolute left-[120px] top-[450px] h-[520px] w-[1680px]">
          <Visual visual={p.visual} />
        </div>
      )}
    </>
  );
}

/** Título (1 o 2 líneas) y bajada (una frase): el texto literal del guion. */
function Titulo({ placa, ancho }: { placa: Tf2Placa; ancho: number }) {
  const largo = placa.titulo.length > 30;
  return (
    <div className="absolute left-[120px] top-[150px]" style={{ width: ancho }}>
      <h1 className={cn("tf2-titular tf2-sube text-tf2-tinta", ancho > 1000 ? "text-[96px]" : largo ? "text-[88px]" : "text-[104px]")}>{placa.titulo}</h1>
      <p className="tf2-sube mt-8 text-[36px] leading-snug text-tf2-grafito" style={{ "--d": "140ms", maxWidth: Math.min(ancho, 1180) } as Estilo}>
        {placa.bajada}
      </p>
    </div>
  );
}

/** Placa de curva (11, 16, 22, 27): el giro. Espacio negativo, texto circular y un objeto de transición. */
function Curva({ placa }: { placa: Tf2Placa }) {
  return (
    <>
      <div className="absolute bottom-[200px] left-[120px] w-[820px]">
        <span className="tf2-rotulo text-[15px] text-tf2-rojo">↻ Giro · síntesis</span>
        <h1 className="tf2-titular tf2-sube mt-6 text-[96px] text-tf2-tinta">{placa.titulo}</h1>
        <p className="tf2-sube mt-8 text-[36px] leading-snug text-tf2-grafito" style={{ "--d": "140ms" } as Estilo}>
          {placa.bajada}
        </p>
      </div>
      <div className="absolute right-[150px] top-1/2 -translate-y-1/2">
        <div className="relative flex items-center justify-center text-tf2-rojo">
          <TextoCircular texto={placa.curva ?? ""} radio={330} tam={27} />
          <div className="tf2-cae absolute inset-0 flex items-center justify-center text-tf2-tinta" style={{ "--d": "500ms" } as Estilo}>
            <CentroCurva visual={placa.visual} />
          </div>
        </div>
      </div>
    </>
  );
}

/** Ingreso: QR grande, dirección para escribir a mano y cuántos entraron. */
function Ingreso({ slug }: { slug: string }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 4000);
  return (
    <>
      <div className="absolute left-[120px] top-[170px] w-[1000px]">
        <p className="tf2-rotulo text-[17px] text-tf2-rojo">{TF_INSTITUCION} · Ciclo de inteligencia artificial</p>
        <h1 className="tf2-titular tf2-sube mt-8 text-[118px]">{TF2_TITULO}</h1>
        <p className="tf2-sube mt-10 text-[34px] text-tf2-grafito" style={{ "--d": "140ms" } as Estilo}>
          Segunda charla · Mario Rodolfo Leal · Marco Rossi · Franco Orellana
        </p>
        <div className="tf2-sube mt-14 flex items-center gap-8" style={{ "--d": "280ms" } as Estilo}>
          <span className="tf2-objeto inline-flex items-center gap-4 rounded-[10px] bg-tf2-rojo px-7 py-5 text-white">
            <span className="text-[50px] leading-none">📱</span>
            <span className="tf2-mono text-[28px] font-semibold uppercase tracking-[0.06em]">Escaneá el QR para participar</span>
          </span>
          <span className="tf2-mono text-[26px]">
            <b className="tf2-titular text-[64px] tabular-nums">{data?.participants ?? 0}</b> conectados
          </span>
        </div>
        <p className="tf2-mono mt-8 text-[22px] text-tf2-gris">Sin nombre ni cuenta. En la pantalla solo se ven resultados agrupados o revisados.</p>
      </div>
      <div className="tf2-cae absolute right-[150px] top-[200px] rotate-[3deg]" style={{ "--d": "300ms" } as Estilo}>
        <TarjetaQr qr={TF_QR} link={TF_LINK} w={520} />
      </div>
      <div className="absolute left-[1190px] top-[780px] z-10 rotate-[-6deg]">
        <Sello tam={22} d={900}>
          Clase 2 de 6
        </Sello>
      </div>
    </>
  );
}

/** Pie: recorrido de los seis bloques (por minutos), estado de la actividad y controles. */
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
  slide: Tf2Slide;
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
  const minutos = TF2_BLOQUES.reduce((a, b) => a + b.minutos, 0);
  const actNombre = estado ? getTf2Actividad(estado.key)?.nombre : undefined;
  const boton = "tf2-mono rounded-[6px] border border-tf2-linea bg-tf2-hoja px-3 py-1.5 text-[15px] text-tf2-grafito transition hover:border-tf2-tinta";
  return (
    <footer className="absolute inset-x-[120px] bottom-[34px] z-30 flex items-center gap-8">
      <div className="flex h-[10px] flex-1 gap-[6px]" aria-label="Recorrido de la clase">
        {TF2_BLOQUES.map((b, k) => (
          <span
            key={b.nombre}
            title={`${b.nombre} · ${b.minutos} min`}
            className={cn("h-full rounded-full", k < slide.bloque ? "bg-tf2-musgo" : k === slide.bloque && slide.t !== "ingreso" ? "bg-tf2-rojo" : "bg-tf2-linea")}
            style={{ width: `${(b.minutos / minutos) * 100}%` }}
          />
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
        <span className="flex items-center gap-[5px]" aria-label={`Paso ${paso} de ${pasos}`}>
          {Array.from({ length: pasos }, (_, k) => (
            <span key={k} className={cn("size-[8px] rounded-full", k < paso ? "bg-tf2-tinta" : "bg-tf2-linea")} />
          ))}
        </span>
      )}
      <span className="flex items-center gap-2">
        <button onClick={onQr} className={cn(boton, qr && "border-tf2-tinta bg-tf2-tinta text-white")} title="QR para ingresar (Q)">
          QR
        </button>
        <button onClick={onGrilla} className={boton} title="Todas las pantallas (G)">
          ▦
        </button>
        <button onClick={onContraste} className={cn(boton, contraste && "border-tf2-tinta bg-tf2-tinta text-white")} title="Alto contraste (C)">
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

/** QR sobre cualquier pantalla: para los que llegan tarde o se desconectaron. */
function QrFlotante({ slug, onCerrar }: { slug: string; onCerrar: () => void }) {
  const { data } = useLive<{ participants: number }>(`/api/session/${slug}`, 4000);
  return (
    <div className="tf2-sube absolute bottom-[100px] right-[120px] z-40 flex items-end gap-7">
      <div className="tf2-objeto rounded-[8px] bg-tf2-hoja px-7 py-5">
        <p className="tf2-rotulo text-[14px] text-tf2-rojo">Participá desde tu celular</p>
        <p className="tf2-mono mt-2 text-[22px]">
          <b className="tf2-titular text-[48px] tabular-nums">{data?.participants ?? 0}</b> conectados
        </p>
        <button onClick={onCerrar} className="tf2-mono mt-2 text-[14px] text-tf2-gris underline-offset-2 hover:underline">
          ocultar · Q
        </button>
      </div>
      <div className="rotate-[2deg]">
        <TarjetaQr qr={TF_QR} link={TF_LINK} w={330} />
      </div>
    </div>
  );
}

/** Todas las pantallas de un vistazo (G): saltar a cualquiera con un clic. */
function Grilla({ actual, onIr, onCerrar }: { actual: number; onIr: (i: number) => void; onCerrar: () => void }) {
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
          {TF2_SLIDES.map((s, i) => {
            const vivo = s.t === "placa" && Boolean(s.actividad);
            const curva = s.t === "placa" && Boolean(s.curva);
            return (
              <button
                key={i}
                onClick={() => onIr(i)}
                className={cn(
                  "tf2-objeto flex min-h-[8rem] flex-col rounded-[4px] p-3 text-left transition hover:-translate-y-0.5",
                  i === actual ? "bg-tf2-tinta text-white" : vivo ? "bg-tf2-rojo-claro" : curva ? "bg-tf2-salvia-claro" : "bg-tf2-hoja",
                )}
              >
                <span className="tf2-mono flex items-center justify-between text-xs opacity-70">
                  <span>{s.t === "placa" ? s.num : i + 1}</span>
                  {vivo && <span>📱 APP</span>}
                  {curva && <span>↻ giro</span>}
                </span>
                <span className="tf2-serif mt-2 line-clamp-3 text-[1.05rem] leading-snug">{tituloTf2(s).replace(/^\d+ · (📱 \d · )?/, "")}</span>
                <span className="tf2-mono mt-auto pt-2 text-[0.65rem] opacity-60">{TF2_BLOQUES[s.bloque]?.nombre}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
