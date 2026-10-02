"use client";

// Clase 2 en el celular: el constructor progresivo del asistente.
//   TAREA → MÉTODO → INFORMACIÓN → LÍMITES → BORRADOR → PRUEBA
// Cada etapa se abre cuando Marco llega a su placa; cada decisión se guarda al
// toque y al final se combinan en el system prompt BORRADOR V0.1 (lib/bbva-clase2.ts).

import { useMemo, useState } from "react";
import { armarTarjeta, BBVA_ACTIVIDADES_C1, getActividadBbva, HIPOTESIS_ITEM, labelOpcion, type ActividadBbva, type Item } from "@/lib/bbva-clase";
import { armarBorrador, armarKit, C2_ETAPAS, C2_GEM_URL } from "@/lib/bbva-clase2";
import { BotonOpcion, EnPantalla, ListoCartel, comoLista, comoTexto, cx, respondido, type PropsActividad, type Valor } from "./alumno-ui";

type Props = PropsActividad<ActividadBbva>;
type Respuestas = Record<string, Record<string, Valor>>;

const libre = (it: Item) => it.id.startsWith("txt_");

/** ¿Terminó la actividad? (todos los ítems que no son texto libre). */
export function actividadCompleta(act: ActividadBbva, resp: Record<string, Valor> | undefined): boolean {
  return act.items.filter((it) => !libre(it) && it.id !== "copiado").every((it) => respondido(resp?.[it.id])) &&
    (act.tipo !== "borrador" || respondido(resp?.copiado));
}

/** Descarga un texto como archivo (sin servidor). */
export function bajarTexto(texto: string, archivo: string) {
  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = archivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Descarga el kit del asistente: PDF con el logo del banco (y el mismo contenido en .txt). */
export function BotonesKit({ respuestas, area, borrador }: { respuestas: Respuestas; area?: string; borrador?: string }) {
  const [estado, setEstado] = useState<"listo" | "armando" | "error">("listo");
  const resp = respuestas as Record<string, Record<string, string | string[]>>;
  const nombre = comoTexto(respuestas.perfil?.nombre);
  async function pdf() {
    setEstado("armando");
    try {
      const { buildKitBlob } = await import("./kit-pdf");
      const blob = await buildKitBlob({ nombre, area, respuestas: resp, borrador });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Kit-asistente-BBVA-clase-2${nombre ? `-${nombre.replace(/\s+/g, "_")}` : ""}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }
  return (
    <div className="mt-2 flex flex-col gap-1">
      <button
        type="button"
        onClick={pdf}
        disabled={estado === "armando"}
        className="alu-boton flex min-h-12 w-full items-center justify-center rounded-[4px] border-[1.5px] border-tinta bg-blanco font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-tinta disabled:opacity-60"
      >
        {estado === "armando" ? "Armando el PDF…" : "↓ Kit del asistente (PDF)"}
      </button>
      {estado === "error" && <p className="font-mono text-[11px] text-rojo">No se pudo armar. Probá de nuevo.</p>}
      <button
        type="button"
        onClick={() => bajarTexto(armarKit({ resp, area, borrador, nombrePersona: nombre }), "kit-asistente-v0.1.txt")}
        className="alu-boton min-h-10 w-full font-mono text-[11px] uppercase tracking-[0.14em] text-grafito underline decoration-niebla underline-offset-4"
      >
        ↓ También en .txt
      </button>
    </div>
  );
}

// =====================================================================================
// Indicador: Tarea → Método → Información → Límites → Borrador → Prueba
// =====================================================================================

export function Recorrido2({ respuestas, actual, acts }: { respuestas: Respuestas; actual?: string; acts: ActividadBbva[] }) {
  return (
    <nav aria-label="Tu asistente, etapa por etapa" className="mb-5">
      <ol className="flex items-center gap-1">
        {C2_ETAPAS.map((e, i) => {
          const lista = e.acts.every((k) => {
            const a = acts.find((x) => x.key === k);
            return a ? actividadCompleta(a, respuestas[k]) : false;
          });
          const ahora = !!actual && (e.acts as readonly string[]).includes(actual);
          return (
            <li key={e.id} className="flex min-w-0 flex-1 items-center gap-1">
              <span
                className={cx(
                  "min-w-0 flex-1 truncate rounded-[2px] border px-1 py-1 text-center font-mono text-[8.5px] font-semibold uppercase tracking-[0.06em]",
                  ahora ? "border-naranja bg-naranja text-blanco" : lista ? "border-tinta bg-tinta text-papel" : "border-dashed border-gris text-gris",
                )}
              >
                {lista && !ahora ? "✓ " : ""}
                {e.label}
              </span>
              {i < C2_ETAPAS.length - 1 && <span aria-hidden className="font-mono text-[9px] text-gris">→</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// =====================================================================================
// Elegir (actividades 1, 4, 5 y 7): varias preguntas en una misma pantalla
// =====================================================================================

export function ActividadEleccion({ act, resp, guardar, enPantalla }: Props) {
  const completa = actividadCompleta(act, resp);
  const [listo, setListo] = useState(() => completa);

  if (listo && completa) {
    return (
      <div className="alu-entra">
        <ListoCartel bajada="Quedó guardado en tu asistente." />
        <ul className="mt-6 flex flex-col gap-2.5">
          {act.items.map((it) => {
            const v = resp[it.id];
            if (!respondido(v)) return null;
            const txt = libre(it)
              ? comoTexto(v)
              : comoLista(v)
                  .map((id) => it.opciones.find((o) => o.id === id)?.label ?? id)
                  .join(" · ");
            return (
              <li key={it.id} className="bbva-recorte rounded-[3px] px-3.5 py-2.5">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">{it.rotulo ?? it.texto}</p>
                <p className="bbva-titular mt-0.5 text-[1.3rem] leading-tight text-tinta">{txt}</p>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={() => setListo(false)}
          className="alu-boton mt-5 min-h-11 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Cambiar
        </button>
        <EnPantalla titulo={enPantalla} className="mt-7" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="bbva-titular text-[2.2rem] text-tinta">{act.pregunta}</h1>
      <p className="bbva-serif mt-1 text-[1.15rem] italic text-grafito">{act.consigna}</p>
      <div className="mt-5 flex flex-col gap-6">
        {act.items.map((it, n) => (
          <section key={it.id}>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-naranja">
              {String(n + 1).padStart(2, "0")} · {it.rotulo}
            </p>
            <h2 className="bbva-serif mt-1 text-[1.3rem] leading-snug text-tinta">{it.texto}</h2>
            {libre(it) ? (
              <CampoLibre valor={comoTexto(resp[it.id])} placeholder={it.libre} onCambiar={(t) => guardar(it.id, t, 800)} />
            ) : (
              <Opciones item={it} valor={resp[it.id]} onCambiar={(v) => guardar(it.id, v, it.max > 1 ? 400 : 0)} />
            )}
          </section>
        ))}
      </div>
      <BotonListo habilitado={completa} onClick={() => (setListo(true), window.scrollTo({ top: 0, behavior: "smooth" }))} />
    </div>
  );
}

function Opciones({ item, valor, onCambiar }: { item: Item; valor: Valor | undefined; onCambiar: (v: Valor) => void }) {
  const multi = item.max > 1;
  const sel = comoLista(valor);
  function tocar(id: string) {
    if (!multi) return onCambiar(id);
    if (sel.includes(id)) return onCambiar(sel.filter((x) => x !== id));
    if (sel.length >= item.max) return;
    onCambiar([...sel, id]);
  }
  return (
    <div className="mt-2.5 grid grid-cols-2 gap-2">
      {multi && <p className="col-span-2 -mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-gris">Podés elegir varias</p>}
      {item.opciones.map((o) => {
        const activa = sel.includes(o.id);
        return (
          <BotonOpcion key={o.id} activa={activa} onClick={() => tocar(o.id)} className="min-h-12 gap-2 px-3 py-2">
            <span className="bbva-titular text-[1.12rem] leading-[0.98]">{o.label}</span>
          </BotonOpcion>
        );
      })}
    </div>
  );
}

function CampoLibre({ valor, placeholder, onCambiar }: { valor: string; placeholder?: string; onCambiar: (t: string) => void }) {
  const [t, setT] = useState(valor);
  return (
    <textarea
      value={t}
      onChange={(e) => {
        setT(e.target.value);
        onCambiar(e.target.value.slice(0, 600));
      }}
      rows={2}
      maxLength={600}
      placeholder={placeholder}
      className="bbva-serif mt-2.5 w-full resize-none rounded-[4px] border-[1.5px] border-tinta/70 bg-blanco px-3 py-2.5 text-[1.12rem] leading-snug text-tinta placeholder:italic placeholder:text-gris focus:border-naranja focus:outline-none"
    />
  );
}

function BotonListo({ habilitado, onClick, texto = "Listo" }: { habilitado: boolean; onClick: () => void; texto?: string }) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 bg-gradient-to-t from-papel/85 from-40% to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-5">
      <button
        type="button"
        onClick={onClick}
        disabled={!habilitado}
        className={cx(
          "alu-boton flex min-h-14 w-full items-center justify-center gap-3 rounded-[4px] border-[1.5px] font-mono text-[13px] font-semibold uppercase tracking-[0.2em]",
          habilitado ? "alu-sombra border-tinta bg-tinta text-papel" : "border-dashed border-gris bg-papel/95 text-gris",
        )}
      >
        {habilitado ? (
          <>
            {texto} <span aria-hidden="true">→</span>
          </>
        ) : (
          "Completá cada pregunta"
        )}
      </button>
    </div>
  );
}

// =====================================================================================
// Actividad 2 · Armá el método: la entrada y la cadena de pasos en orden
// =====================================================================================

export function ActividadMetodo({ act, resp, guardar, enPantalla }: Props) {
  const [entradaIt, metodoIt] = act.items;
  const pasos = comoLista(resp[metodoIt.id]);
  const completa = actividadCompleta(act, resp);
  const [listo, setListo] = useState(() => completa);
  const label = (id: string) => metodoIt.opciones.find((o) => o.id === id)?.label ?? id;

  function tocar(id: string) {
    if (pasos.includes(id)) return guardar(metodoIt.id, pasos.filter((x) => x !== id), 400);
    if (pasos.length >= metodoIt.max) return;
    guardar(metodoIt.id, [...pasos, id], 400);
  }

  const cadena = (
    <div className="bbva-recorte mt-3 rounded-[3px] px-3 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">Tu cadena</p>
      <p className="bbva-titular mt-1 text-[1.25rem] leading-snug text-tinta">
        RECIBIR
        {pasos.map((p) => (
          <span key={p}>
            <span className="text-naranja"> → </span>
            {label(p).toUpperCase()}
          </span>
        ))}
        {!pasos.length && <span className="text-gris"> → …</span>}
      </p>
    </div>
  );

  if (listo && completa) {
    return (
      <div className="alu-entra">
        <ListoCartel bajada="Tu método quedó guardado." />
        {cadena}
        <button
          type="button"
          onClick={() => setListo(false)}
          className="alu-boton mt-5 min-h-11 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Cambiar
        </button>
        <EnPantalla titulo={enPantalla} className="mt-7" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="bbva-titular text-[2.2rem] text-tinta">{act.pregunta}</h1>
      <p className="bbva-serif mt-1 text-[1.15rem] italic text-grafito">{act.consigna}</p>

      <section className="mt-5">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-naranja">01 · {entradaIt.rotulo}</p>
        <h2 className="bbva-serif mt-1 text-[1.3rem] leading-snug text-tinta">{entradaIt.texto}</h2>
        <Opciones item={entradaIt} valor={resp[entradaIt.id]} onCambiar={(v) => guardar(entradaIt.id, v, 400)} />
      </section>

      <section className="mt-6">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-naranja">02 · {metodoIt.rotulo}</p>
        <h2 className="bbva-serif mt-1 text-[1.3rem] leading-snug text-tinta">{metodoIt.texto}</h2>
        {cadena}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {metodoIt.opciones.map((o) => {
            const idx = pasos.indexOf(o.id);
            return (
              <BotonOpcion key={o.id} activa={idx >= 0} onClick={() => tocar(o.id)} className="min-h-12 justify-between gap-2 px-3 py-2">
                <span className="bbva-titular text-[1.12rem] leading-[0.98]">{o.label}</span>
                {idx >= 0 && (
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-naranja font-mono text-[11px] font-semibold text-blanco">
                    {idx + 1}
                  </span>
                )}
              </BotonOpcion>
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-gris">Tocá un paso elegido para sacarlo</p>
      </section>

      <BotonListo habilitado={completa} onClick={() => (setListo(true), window.scrollTo({ top: 0, behavior: "smooth" }))} />
    </div>
  );
}

// =====================================================================================
// Actividad 6 · BORRADOR V0.1: el system prompt con todo lo decidido
// =====================================================================================

export function ActividadBorrador({
  act,
  resp,
  guardar,
  enPantalla,
  respuestas,
  area,
}: Props & { respuestas: Respuestas; area?: string }) {
  const generado = useMemo(
    () => armarBorrador({ resp: respuestas as Record<string, Record<string, string | string[]>>, area }),
    [respuestas, area],
  );
  const guardado = comoTexto(resp.txt_borrador);
  const [texto, setTexto] = useState(() => guardado || generado);
  const [copiado, setCopiado] = useState(false);
  const faltan = C2_ETAPAS.slice(0, 4).filter((e) =>
    e.acts.some((k) => {
      const a = getActividadBbva(k);
      return a ? !actividadCompleta(a, respuestas[k]) : false;
    }),
  );

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      // Sin permiso de portapapeles: seleccionar el texto para copiarlo a mano.
      const ta = document.getElementById("borrador-v01") as HTMLTextAreaElement | null;
      ta?.select();
      document.execCommand?.("copy");
    }
    setCopiado(true);
    guardar("copiado", "si");
    guardar("txt_borrador", texto.slice(0, 8000));
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div>
      <p className="inline-block -rotate-2 border-[1.5px] border-naranja px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-naranja">
        Borrador V0.1
      </p>
      <h1 className="bbva-titular mt-2 text-[2.2rem] text-tinta">{act.pregunta}</h1>
      <p className="bbva-serif mt-1 text-[1.12rem] italic leading-snug text-grafito">
        Lo armamos con todo lo que decidiste. No es el prompt perfecto: es una primera hipótesis para probar.
      </p>
      {faltan.length > 0 && (
        <p className="bbva-mano mt-2 text-[1.2rem] leading-tight text-naranja">
          Te falta completar: {faltan.map((f) => f.label).join(", ")}. Los [corchetes] son para que los completes vos.
        </p>
      )}

      <textarea
        id="borrador-v01"
        value={texto}
        onChange={(e) => {
          setTexto(e.target.value);
          guardar("txt_borrador", e.target.value.slice(0, 8000), 1500);
        }}
        rows={16}
        className="mt-4 w-full rounded-[4px] border-[1.5px] border-tinta/70 bg-blanco px-3 py-3 font-mono text-[12px] leading-[1.5] text-tinta focus:border-naranja focus:outline-none"
      />
      {guardado && guardado !== generado && (
        <button
          type="button"
          onClick={() => setTexto(generado)}
          className="alu-boton mt-1 min-h-10 font-mono text-[11px] uppercase tracking-[0.14em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Volver a generarlo con mis decisiones
        </button>
      )}

      <div className="mt-4 flex flex-col gap-2">
        <button
          type="button"
          onClick={copiar}
          className="alu-boton alu-sombra flex min-h-14 w-full items-center justify-center rounded-[4px] bg-naranja font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-blanco"
        >
          {copiado ? "✓ Copiado" : "Copiar borrador"}
        </button>
        <a
          href={C2_GEM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="alu-boton flex min-h-12 w-full items-center justify-center rounded-[4px] border-[1.5px] border-tinta bg-blanco font-mono text-[12px] font-semibold uppercase tracking-[0.16em] text-tinta"
        >
          Abrir Gemini · nueva Gem ↗
        </a>
        <BotonesKit respuestas={respuestas} area={area} borrador={texto} />
      </div>

      <ol className="bbva-recorte mt-6 list-none rounded-[3px] px-4 py-3.5">
        <li className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">En Gemini</li>
        {[
          "Gems → Nueva Gem.",
          "Pegá el borrador en Instrucciones.",
          "Subí tus documentos en Conocimiento.",
          "Probalo en la vista previa y guardalo.",
        ].map((p, i) => (
          <li key={p} className="bbva-serif mt-1.5 text-[1.05rem] leading-snug text-tinta">
            <span className="font-mono text-[11px] text-naranja">{i + 1}.</span> {p}
          </li>
        ))}
      </ol>
      <EnPantalla titulo={enPantalla} className="mt-7" />
    </div>
  );
}

/** El borrador para volver a copiarlo cuando la etapa ya pasó (pantalla de espera). */
export function BorradorGuardado({ respuestas, area, enConstruccion = false }: { respuestas: Respuestas; area?: string; enConstruccion?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const texto =
    comoTexto(respuestas.bbva2_a6?.txt_borrador) ||
    armarBorrador({ resp: respuestas as Record<string, Record<string, string | string[]>>, area });
  return (
    <div className="bbva-recorte mb-6 w-full rounded-[3px] px-4 pb-4 pt-4 text-left">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-naranja">
        {enConstruccion ? "Tu system prompt, hasta ahora" : "Tu asistente · borrador V0.1"}
      </p>
      {enConstruccion && (
        <p className="bbva-serif mt-1 text-[1rem] italic leading-snug text-grafito">
          Cada decisión que tomás lo completa. Lo que está entre [corchetes] todavía falta.
        </p>
      )}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(texto);
              setCopiado(true);
              setTimeout(() => setCopiado(false), 2500);
            } catch {
              setAbierto(true);
            }
          }}
          className="alu-boton min-h-12 flex-1 rounded-[4px] bg-tinta font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-papel"
        >
          {copiado ? "✓ Copiado" : "Copiar"}
        </button>
        <button
          type="button"
          onClick={() => setAbierto((a) => !a)}
          className="alu-boton min-h-12 flex-1 rounded-[4px] border-[1.5px] border-tinta font-mono text-[12px] font-semibold uppercase tracking-[0.14em] text-tinta"
        >
          {abierto ? "Ocultar" : "Ver"}
        </button>
      </div>
      <BotonesKit respuestas={respuestas} area={area} borrador={comoTexto(respuestas.bbva2_a6?.txt_borrador) || undefined} />
      {abierto && (
        <pre className="mt-3 max-h-[50dvh] overflow-auto whitespace-pre-wrap font-mono text-[11.5px] leading-[1.5] text-tinta">{texto}</pre>
      )}
    </div>
  );
}

// =====================================================================================
// Actividad 3 · ¿Dónde va esto? — guiada con dos preguntas y devolución al instante
//   ¿Cambia de un caso a otro? → sí: CONTEXTO
//   no → ¿Le dice CÓMO trabajar o es MATERIAL para consultar? → INSTRUCCIÓN / CONOCIMIENTO
// =====================================================================================

const DONDE_LABEL: Record<string, string> = { instruccion: "Instrucción", contexto: "Contexto", conocimiento: "Conocimiento" };
const DONDE_POR_QUE: Record<string, string> = {
  instruccion: "Es una regla que vale siempre: va en las instrucciones (el system prompt de la Gem).",
  contexto: "Cambia en cada caso: se lo das en el mensaje de ese momento, no en las instrucciones.",
  conocimiento: "Es material para consultar: se sube como archivo de conocimiento (la Gem o NotebookLM).",
};

export function ActividadDonde({ act, resp, guardar, enPantalla }: Props) {
  const items = act.items;
  const primero = items.findIndex((it) => !respondido(resp[it.id]));
  const [i, setI] = useState(() => (primero < 0 ? items.length : primero));
  const [paso, setPaso] = useState<1 | 2>(1);

  if (i >= items.length) {
    const bien = items.filter((it) => comoTexto(resp[it.id]) === it.correcta).length;
    return (
      <div className="alu-entra">
        <ListoCartel bajada={`Acertaste ${bien} de ${items.length}. Mirá dónde se confundió el grupo.`} />
        <ul className="mt-6 flex flex-col gap-2">
          {items.map((it) => {
            const v = comoTexto(resp[it.id]);
            const ok = v === it.correcta;
            return (
              <li key={it.id} className="bbva-recorte rounded-[3px] px-3.5 py-2.5">
                <p className="bbva-serif text-[1rem] leading-snug text-grafito">{it.texto}</p>
                <p className={cx("mt-1 font-mono text-[11px] font-semibold uppercase tracking-[0.12em]", ok ? "text-tinta" : "text-naranja")}>
                  {ok ? "✓" : "✗"} {DONDE_LABEL[it.correcta ?? ""]}
                </p>
              </li>
            );
          })}
        </ul>
        <EnPantalla titulo={enPantalla} className="mt-7" />
      </div>
    );
  }

  const it = items[i];
  const v = comoTexto(resp[it.id]);
  const responder = (x: string) => guardar(it.id, x);
  const siguiente = () => {
    setPaso(1);
    setI((n) => n + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">
        Pieza {i + 1} de {items.length}
      </p>
      <h1 className="bbva-titular mt-1 text-[1.9rem] text-tinta">{act.pregunta}</h1>
      <article key={it.id} className="alu-desliza bbva-recorte mt-3 rounded-[3px] px-4 pb-4 pt-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">La pieza</p>
        <p className="bbva-serif mt-1.5 text-[1.5rem] leading-[1.15] text-tinta">{it.texto}</p>
      </article>

      {v ? (
        <div className="alu-entra mt-5">
          <p className={cx("bbva-titular text-[2rem] leading-none", v === it.correcta ? "text-tinta" : "text-naranja")}>
            {v === it.correcta ? "✓ " : "Ojo: "}
            {DONDE_LABEL[it.correcta ?? ""]}
          </p>
          <p className="bbva-serif mt-2 text-[1.15rem] italic leading-snug text-grafito">{DONDE_POR_QUE[it.correcta ?? ""]}</p>
          <button
            type="button"
            onClick={siguiente}
            className="alu-boton alu-sombra mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-[4px] bg-tinta font-mono text-[13px] font-semibold uppercase tracking-[0.18em] text-papel"
          >
            {i + 1 < items.length ? "Siguiente pieza →" : "Ver mi resumen →"}
          </button>
        </div>
      ) : paso === 1 ? (
        <div className="mt-5">
          <p className="bbva-titular text-[1.45rem] leading-tight text-tinta">¿Cambia de un caso a otro?</p>
          <div className="mt-3 flex flex-col gap-2">
            <BotonOpcion activa={false} onClick={() => responder("contexto")} className="min-h-14 flex-col items-start gap-0.5">
              <span className="bbva-titular text-[1.25rem] leading-none">Sí, es de este caso</span>
              <span className="bbva-serif text-[0.98rem] italic text-grafito">el reclamo de hoy, los datos de esta solicitud</span>
            </BotonOpcion>
            <BotonOpcion activa={false} onClick={() => setPaso(2)} className="min-h-14 flex-col items-start gap-0.5">
              <span className="bbva-titular text-[1.25rem] leading-none">No, vale para todos los casos</span>
              <span className="bbva-serif text-[0.98rem] italic text-grafito">es igual siempre</span>
            </BotonOpcion>
          </div>
        </div>
      ) : (
        <div className="alu-entra mt-5">
          <p className="bbva-titular text-[1.45rem] leading-tight text-tinta">Vale siempre. ¿Qué es?</p>
          <div className="mt-3 flex flex-col gap-2">
            <BotonOpcion activa={false} onClick={() => responder("instruccion")} className="min-h-14 flex-col items-start gap-0.5">
              <span className="bbva-titular text-[1.25rem] leading-none">Una regla de cómo trabajar</span>
              <span className="bbva-serif text-[0.98rem] italic text-grafito">“hacé…”, “siempre…”, “si pasa X, …”</span>
            </BotonOpcion>
            <BotonOpcion activa={false} onClick={() => responder("conocimiento")} className="min-h-14 flex-col items-start gap-0.5">
              <span className="bbva-titular text-[1.25rem] leading-none">Material para consultar</span>
              <span className="bbva-serif text-[0.98rem] italic text-grafito">un manual, una política, un documento</span>
            </BotonOpcion>
          </div>
          <button
            type="button"
            onClick={() => setPaso(1)}
            className="alu-boton mt-3 min-h-10 font-mono text-[11px] uppercase tracking-[0.14em] text-grafito underline decoration-niebla underline-offset-4"
          >
            ← Volver
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================================================
// Lo que respondiste en la clase 1 (solo lectura: no se vuelve a la clase 1)
// =====================================================================================

export function RespuestasClase1({ respuestas }: { respuestas: Respuestas }) {
  const [abierto, setAbierto] = useState(false);
  const a5 = respuestas.bbva_a5 ?? {};
  const q = { q1: comoTexto(a5.q1), q2: comoTexto(a5.q2), q3: comoTexto(a5.q3), q4: comoTexto(a5.q4) };
  const tarjeta = q.q1 && q.q2 && q.q3 && q.q4 ? armarTarjeta(q) : null;
  const hipotesis = comoTexto(a5[HIPOTESIS_ITEM]);
  const act1 = BBVA_ACTIVIDADES_C1.find((a) => a.key === "bbva_a1");
  const act3 = BBVA_ACTIVIDADES_C1.find((a) => a.key === "bbva_a3");
  const ops = act1 ? comoLista(respuestas.bbva_a1?.ops).map((o) => labelOpcion(act1, "ops", o)) : [];
  const nivel = act3 && comoTexto(respuestas.bbva_a3?.nivel) ? labelOpcion(act3, "nivel", comoTexto(respuestas.bbva_a3?.nivel)) : "";
  if (!tarjeta && !hipotesis && !ops.length && !nivel) return null;

  return (
    <div className="bbva-recorte mb-6 w-full rounded-[3px] px-4 pb-4 pt-4 text-left">
      <button type="button" onClick={() => setAbierto((a) => !a)} className="alu-boton flex w-full items-center justify-between gap-3 text-left">
        <span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-gris">De la clase pasada</span>
          <span className="bbva-titular block text-[1.4rem] leading-none text-tinta">Tu candidato y tu hipótesis</span>
        </span>
        <span aria-hidden="true" className="font-mono text-[12px] uppercase tracking-[0.14em] text-naranja">
          {abierto ? "Ocultar" : "Ver"}
        </span>
      </button>
      {abierto && (
        <div className="alu-entra mt-3 flex flex-col gap-3">
          {tarjeta && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-naranja">{tarjeta.titulo}</p>
              <p className="bbva-serif mt-1 text-[1.05rem] leading-snug text-tinta">{tarjeta.busca}</p>
              <p className="bbva-serif mt-1 text-[1.05rem] leading-snug text-tinta">{tarjeta.hipotesis}</p>
              <p className="bbva-serif mt-1 text-[1.05rem] italic leading-snug text-grafito">{tarjeta.humano}</p>
            </div>
          )}
          {hipotesis && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-naranja">Tu hipótesis escrita</p>
              <p className="bbva-serif mt-1 whitespace-pre-wrap text-[1.05rem] leading-snug text-tinta">{hipotesis}</p>
            </div>
          )}
          {ops.length > 0 && (
            <p className="text-[0.95rem] text-grafito">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">Lo que más hacés · </span>
              {ops.join(" · ")}
            </p>
          )}
          {nivel && (
            <p className="text-[0.95rem] text-grafito">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">Hasta dónde la dejarías llegar · </span>
              {nivel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
