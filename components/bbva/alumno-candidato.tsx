"use client";

// Actividad 5 · Encontrá tu candidato (Laboratorio de IA · BBVA).
// Cuatro preguntas con botones → la tarjeta individual (armarTarjeta, sin IA)
// → la hipótesis de proyecto con la fórmula de la clase (opcional).
// El borrador de la hipótesis se guarda en el celular para no perderlo.

import { useEffect, useRef, useState } from "react";
import {
  BBVA_FORMULA,
  HIPOTESIS_ITEM,
  armarTarjeta,
  type ActividadBbva,
  type Area,
  type TarjetaCandidato,
} from "@/lib/bbva-clase";
import {
  BotonOpcion,
  EnPantalla,
  IconoPersona,
  Puntos,
  comoTexto,
  cx,
  resaltar,
  type PropsActividad,
} from "./alumno-ui";

type Timer = ReturnType<typeof setTimeout> | undefined;
type IdCampo = (typeof BBVA_FORMULA)[number]["id"];
type Campos = Record<IdCampo, string>;

// Borrador de la fórmula en primera persona ("actualmente tengo que …").
const TENGO: Record<string, string> = {
  buscar: "buscar información en distintas fuentes",
  clasificar: "clasificar casos",
  comparar: "comparar información",
  analizar: "analizar datos",
  redactar: "redactar textos",
  controlar: "controlar y verificar información",
  decidir: "preparar o tomar decisiones",
  responder: "responder consultas",
};
const REQUIERE: Record<string, string> = {
  tiempo: "mucho tiempo",
  repetitivo: "repetir los mismos pasos una y otra vez",
  buscar: "buscar mucha información",
  pasos: "demasiados pasos",
  parecidas: "producir siempre cosas parecidas",
  revisar: "revisar mucho",
  casos: "analizar muchos casos",
};
const AYUDAR: Record<string, string> = {
  ayude: "hacerlo más rápido mientras trabajo",
  prepare: "preparar un borrador o análisis para mi revisión",
  recomiende: "recomendarme qué hacer, con sus razones",
  ejecute: "ejecutar algunos pasos del proceso",
  casi_todo: "hacer casi todo y detenerse en las excepciones",
};

function precarga(r: Record<string, string>, t: TarjetaCandidato): Campos {
  return {
    cuando: t.formula.cuando,
    tengo: TENGO[r.q2] ?? t.formula.tengo,
    requiere: REQUIERE[r.q1] ?? t.formula.requiere,
    ayudar: AYUDAR[r.q3] ?? t.formula.ayudar,
    humano: t.formula.humano,
  };
}

/** "Cuando ocurre X, actualmente tengo que Y. Esto requiere Z. Me gustaría explorar si…" */
export function armarTexto(c: Campos): string {
  const v = (k: IdCampo) => c[k].trim().replace(/[\s.,;]+$/, "") || "___";
  return (
    `Cuando ocurre ${v("cuando")}, actualmente tengo que ${v("tengo")}. ` +
    `Esto requiere ${v("requiere")}. ` +
    `Me gustaría explorar si un sistema de IA puede ayudarme a ${v("ayudar")}, ` +
    `manteniendo bajo intervención humana ${v("humano")}.`
  );
}

function leerBorrador(clave: string): Campos | null {
  try {
    const raw = localStorage.getItem(clave);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Campos>;
    if (!d || typeof d !== "object") return null;
    const c = {} as Campos;
    for (const f of BBVA_FORMULA) c[f.id] = typeof d[f.id] === "string" ? (d[f.id] as string) : "";
    return c;
  } catch {
    return null;
  }
}

function escribirBorrador(clave: string, c: Campos | null) {
  try {
    if (c) localStorage.setItem(clave, JSON.stringify(c));
    else localStorage.removeItem(clave);
  } catch {
    /* modo privado o sin almacenamiento: seguimos igual */
  }
}

export function Actividad5({
  act,
  resp,
  guardar,
  enPantalla,
  meId,
  area,
  soloTarjeta = false,
  onVolver,
}: PropsActividad<ActividadBbva> & {
  meId: string;
  area?: Area;
  /** Se abrió desde la espera: solo la tarjeta, con "Volver". */
  soloTarjeta?: boolean;
  onVolver?: () => void;
}) {
  const qs = act.items;
  const n = qs.length;
  const r: Record<string, string> = {};
  for (const q of qs) r[q.id] = comoTexto(resp[q.id]);
  const hechos = qs.map((q) => !!r[q.id]);
  const completo = hechos.every(Boolean);
  const primero = Math.max(0, hechos.indexOf(false));

  const [paso, setPaso] = useState<number | "tarjeta">(() => (soloTarjeta || completo ? "tarjeta" : primero));
  const [rehaciendo, setRehaciendo] = useState(false);
  const avanzarT = useRef<Timer>(undefined);

  const actual = paso === "tarjeta" ? (completo ? "tarjeta" : primero) : Math.min(paso, n - 1);

  function ir(p: number | "tarjeta") {
    clearTimeout(avanzarT.current);
    setPaso(p);
    if (p === "tarjeta") setRehaciendo(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function responder(i: number, opcion: string) {
    guardar(qs[i].id, opcion);
    const nuevos = hechos.map((h, j) => (j === i ? true : h));
    let sig: number | "tarjeta" = "tarjeta";
    if (rehaciendo && i + 1 < n) sig = i + 1;
    else {
      for (let k = 1; k < n; k++) {
        const j = (i + k) % n;
        if (!nuevos[j]) {
          sig = j;
          break;
        }
      }
    }
    clearTimeout(avanzarT.current);
    avanzarT.current = setTimeout(() => ir(sig), 320);
  }

  if (actual === "tarjeta") {
    const t = armarTarjeta(r);
    return (
      <div className="alu-entra">
        {soloTarjeta && onVolver && (
          <button
            type="button"
            onClick={onVolver}
            className="alu-boton -ml-1 mb-3 flex min-h-11 items-center gap-2 px-1 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito"
          >
            <span aria-hidden="true">←</span> Volver
          </button>
        )}
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-gris">Actividad 5 · Tu devolución</p>
        <Tarjeta t={t} area={area} />
        <EnPantalla titulo={enPantalla} className="mt-7" />
        <Hipotesis key={meId} meId={meId} r={r} t={t} guardado={comoTexto(resp[HIPOTESIS_ITEM])} guardar={guardar} />
        {!soloTarjeta && (
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => {
                setRehaciendo(true);
                ir(0);
              }}
              className="alu-boton min-h-11 px-2 font-mono text-[11.5px] uppercase tracking-[0.16em] text-gris underline decoration-niebla underline-offset-4"
            >
              Volver a empezar la actividad
            </button>
          </div>
        )}
      </div>
    );
  }

  const q = qs[actual];
  const v = r[q.id];
  const dosColumnas = q.opciones.every((o) => o.label.length <= 12);

  return (
    <div>
      <div className="bbva-postit relative rounded-[2px] px-4 pb-3 pt-2.5" style={{ transform: "rotate(-1.2deg)" }}>
        <p className="bbva-mano text-[1.5rem] leading-[1.05] text-tinta">{act.pregunta}</p>
      </div>

      <div className="mt-4">
        <Puntos
          total={n}
          actual={actual}
          hechos={hechos}
          onIr={(i) => ir(i)}
          rotulo={`Pregunta ${actual + 1} de ${n}`}
          nombre="pregunta"
        />
      </div>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-naranja">{q.rotulo}</p>
      <h1 className="bbva-titular mt-1 text-[1.85rem] text-tinta">{q.texto}</h1>

      <div key={q.id} className={cx("alu-desliza mt-4 grid gap-2", dosColumnas ? "grid-cols-2" : "grid-cols-1")}>
        {q.opciones.map((o) => (
          <BotonOpcion key={o.id} activa={v === o.id} onClick={() => responder(actual, o.id)} className="justify-between gap-3">
            <span className={cx("bbva-titular leading-[0.98]", dosColumnas ? "text-[1.4rem]" : "text-[1.3rem]")}>{o.label}</span>
            {v === o.id && (
              <svg viewBox="0 0 16 16" className="alu-aparece size-4 shrink-0 text-naranja" aria-hidden="true">
                <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </BotonOpcion>
        ))}
      </div>

      {completo && (
        <button
          type="button"
          onClick={() => ir("tarjeta")}
          className="alu-boton mt-5 min-h-11 font-mono text-[12px] uppercase tracking-[0.16em] text-grafito underline decoration-niebla underline-offset-4"
        >
          Ver mi tarjeta
        </button>
      )}
    </div>
  );
}

// --- La tarjeta ----------------------------------------------------------------------

function Tarjeta({ t, area }: { t: TarjetaCandidato; area?: Area }) {
  return (
    <article
      className="bbva-recorte bbva-cae relative mt-6 rounded-[3px] px-5 pb-6 pt-7"
      style={{ "--rot": "-0.7deg" } as React.CSSProperties}
      aria-label={`${t.titulo}. ${t.busca} ${t.hipotesis} ${t.humano} Próximo paso: ${t.siguiente}`}
    >
      <span className="bbva-cinta absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3" aria-hidden="true" />
      <header className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-gris">
        <span>Ficha · Laboratorio de IA</span>
        {area && (
          <span className="shrink-0 truncate">
            {area.emoji} {area.corto}
          </span>
        )}
      </header>

      <h2 className="bbva-titular mt-3 text-[3rem] text-tinta">{t.titulo}</h2>
      <div className="mt-2 h-[3px] w-14 bg-naranja" aria-hidden="true" />

      <p className="bbva-serif mt-4 text-[1.24rem] leading-[1.3] text-tinta">{resaltar(t.busca)}</p>
      <p className="bbva-serif mt-3 text-[1.24rem] leading-[1.3] text-tinta">{resaltar(t.hipotesis)}</p>

      <div className="mt-4 flex items-start gap-2.5 rounded-[3px] border border-dashed border-naranja/70 px-3 py-2.5">
        <IconoPersona className="mt-0.5 size-5 shrink-0 text-naranja" />
        <p className="bbva-serif text-[1.08rem] leading-snug text-grafito">{t.humano}</p>
      </div>

      {t.aviso && (
        <div className="bbva-postit mt-4 rounded-[2px] px-3.5 py-2.5" style={{ transform: "rotate(0.8deg)" }}>
          <p className="bbva-mano text-[1.3rem] leading-[1.08] text-tinta">
            <span className="text-rojo">Ojo: </span>
            {t.aviso}
          </p>
        </div>
      )}

      <div className="mt-5 border-t border-dashed border-niebla pt-3.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gris">Para el próximo paso</p>
        <p className="bbva-mano mt-1 text-[1.95rem] leading-[1.02] text-naranja">{t.siguiente}</p>
      </div>

      <p className="bbva-serif mt-4 text-[0.98rem] italic text-gris">Es una dirección para explorar, no un veredicto.</p>
    </article>
  );
}

// --- La hipótesis (opcional) -----------------------------------------------------------

function Hipotesis({
  meId,
  r,
  t,
  guardado,
  guardar,
}: {
  meId: string;
  r: Record<string, string>;
  t: TarjetaCandidato;
  /** Texto que ya está guardado en el servidor ("" si no hay). */
  guardado: string;
  guardar: (item: string, v: string, demora?: number) => void;
}) {
  const clave = `bbva-hipotesis:${meId}`;
  const base = precarga(r, t);
  const [borrador, setBorrador] = useState<Campos | null>(() => leerBorrador(clave));
  const [copiado, setCopiado] = useState<"" | "ok" | "error">("");
  const copiadoT = useRef<Timer>(undefined);

  const campos = borrador ?? base;
  const texto = armarTexto(campos);
  const puedeGuardar = campos.cuando.trim().length > 1;
  const estaGuardada = !!guardado && guardado === texto;
  const distintoDeTarjeta = !!borrador && BBVA_FORMULA.some((f) => f.id !== "cuando" && borrador[f.id] !== base[f.id]);

  function cambiar(id: IdCampo, valor: string) {
    const nuevo = { ...campos, [id]: valor };
    setBorrador(nuevo);
    escribirBorrador(clave, nuevo);
  }

  function rellenar() {
    const nuevo = { ...base, cuando: campos.cuando };
    setBorrador(nuevo);
    escribirBorrador(clave, nuevo);
  }

  const compartir =
    `Mi hipótesis de proyecto · Laboratorio de IA (BBVA)\n\n${texto}\n\n` +
    `${t.titulo.toUpperCase()}\n${t.busca}\n${t.hipotesis}\n${t.humano}\nPróximo paso: ${t.siguiente}`;

  async function copiar() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(compartir);
      ok = true;
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = compartir;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    setCopiado(ok ? "ok" : "error");
    clearTimeout(copiadoT.current);
    copiadoT.current = setTimeout(() => setCopiado(""), 2200);
  }

  const asunto = "Mi hipótesis de proyecto · Laboratorio de IA";

  return (
    <section className="mt-10" aria-labelledby="hipotesis-titulo">
      <h2 id="hipotesis-titulo" className="bbva-titular text-[2.1rem] text-tinta">
        Tu hipótesis
      </h2>
      <p className="bbva-serif mt-1 text-[1.1rem] italic leading-snug text-grafito">
        Opcional, para el proyecto. Completá los espacios; ya te dejamos un borrador con tu tarjeta.
      </p>

      <div className="bbva-recorte relative mt-4 rounded-[3px] px-4 pb-5 pt-4">
        {BBVA_FORMULA.map((f, i) => (
          <label key={f.id} className={cx("block", i > 0 && "mt-3.5")}>
            <span className="bbva-serif block text-[1.08rem] leading-snug text-grafito">
              {f.antes}
              {f.id === "cuando" && <span className="text-naranja"> *</span>}
            </span>
            <span className="flex items-end gap-1">
              <CampoAuto
                valor={campos[f.id]}
                placeholder={f.placeholder}
                onCambio={(v) => cambiar(f.id, v)}
                etiqueta={f.antes}
              />
              <span className="bbva-mano pb-1 text-[1.4rem] leading-none text-grafito" aria-hidden="true">
                {f.id === "cuando" || f.id === "ayudar" ? "," : "."}
              </span>
            </span>
          </label>
        ))}
        {distintoDeTarjeta && (
          <button
            type="button"
            onClick={rellenar}
            className="alu-boton mt-4 min-h-10 font-mono text-[10.5px] uppercase tracking-[0.16em] text-pizarra underline decoration-cielo underline-offset-4"
          >
            Volver a rellenar con mi tarjeta
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={!puedeGuardar}
        onClick={() => guardar(HIPOTESIS_ITEM, texto, 0)}
        className={cx(
          "alu-boton mt-4 flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[4px] border-[1.5px] font-mono text-[13px] font-semibold uppercase tracking-[0.18em]",
          !puedeGuardar
            ? "border-dashed border-gris text-gris"
            : estaGuardada
              ? "border-tinta bg-blanco text-tinta"
              : "alu-sombra border-tinta bg-tinta text-papel",
        )}
      >
        {estaGuardada ? (
          <>
            <svg viewBox="0 0 16 16" className="size-4 text-naranja" aria-hidden="true">
              <path d="M2.5 8.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Hipótesis guardada
          </>
        ) : guardado ? (
          "Guardar los cambios"
        ) : (
          "Guardar mi hipótesis"
        )}
      </button>
      {!puedeGuardar && (
        <p className="bbva-serif mt-2 text-[1rem] italic leading-snug text-grafito">Completá «Cuando ocurre…» para poder guardarla.</p>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={copiar}
          aria-label="Copiar la hipótesis y la tarjeta"
          className="alu-boton alu-sombra flex min-h-14 flex-col items-center justify-center gap-1 rounded-[4px] border-[1.5px] border-tinta bg-blanco px-1 text-tinta"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <rect x="8" y="8" width="12" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16 8V4H4v13h4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">
            {copiado === "ok" ? "Copiado ✓" : copiado === "error" ? "No se pudo" : "Copiar"}
          </span>
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(compartir)}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enviar por WhatsApp"
          className="alu-boton alu-sombra flex min-h-14 flex-col items-center justify-center gap-1 rounded-[4px] border-[1.5px] border-tinta bg-blanco px-1 text-tinta"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path
              d="M4.5 19.5l1.2-3.6A8 8 0 1 1 8.4 18.6z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path d="M9.2 8.6c.2 2.9 2.6 5.6 5.9 6.2l1-1.4-1.9-1-.9.8c-1-.5-1.8-1.3-2.3-2.3l.8-.9-1-1.9z" fill="currentColor" />
          </svg>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">WhatsApp</span>
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(compartir)}`}
          aria-label="Enviarme por mail"
          className="alu-boton alu-sombra flex min-h-14 flex-col items-center justify-center gap-1 rounded-[4px] border-[1.5px] border-tinta bg-blanco px-1 text-tinta"
        >
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <rect x="3" y="5.5" width="18" height="13" rx="1" fill="none" stroke="currentColor" strokeWidth="1.7" />
            <path d="M3.8 6.5L12 13l8.2-6.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.12em]">Por mail</span>
        </a>
      </div>
      <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-gris">
        El borrador queda guardado en este celular
      </p>
    </section>
  );
}

/** Espacio para completar a mano: crece con el texto. */
function CampoAuto({
  valor,
  placeholder,
  onCambio,
  etiqueta,
}: {
  valor: string;
  placeholder: string;
  onCambio: (v: string) => void;
  etiqueta: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [valor]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={valor}
      maxLength={220}
      placeholder={placeholder}
      aria-label={etiqueta}
      onChange={(e) => onCambio(e.target.value.replace(/\n/g, " "))}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      enterKeyHint="done"
      className="bbva-mano alu-renglon min-h-[1.85rem] w-full flex-1 resize-none overflow-hidden bg-transparent px-0.5 py-0 text-[1.5rem] text-tinta outline-none placeholder:text-gris/70 focus:bg-ambar/15"
    />
  );
}
