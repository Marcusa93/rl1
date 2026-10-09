"use client";

// Laboratorios en vivo de /unca, con criptografía real del navegador
// (lib/unca-cripto.ts): cifrado César, huella SHA-256, firma y verificación
// (ECDSA), cadena de bloques, vigencia de un certificado y la anatomía de una
// certificación de página web. Cada uno tiene versión grande (la placa) y,
// cuando corresponde, versión compacta (el dispositivo del participante).

import { useEffect, useMemo, useRef, useState } from "react";
import { ABC, bitsDistintos, cesar, cripto, firmar, generarClaves, huellaClave, sha256, verificar } from "@/lib/unca-cripto";
import { cn } from "@/lib/utils";
import {
  C,
  GlifoCandado,
  GlifoCheck,
  GlifoCruz,
  GlifoDocumento,
  GlifoHuella,
  GlifoInstitucion,
  GlifoLlave,
  GlifoPregunta,
  GlifoReloj,
  Hex,
  retraso,
} from "@/components/unca/piezas";

/** Huella SHA-256 de un texto, recalculada cuando cambia. */
function useHuella(texto: string) {
  const [h, setH] = useState("");
  useEffect(() => {
    let vivo = true;
    if (!cripto()) return;
    sha256(texto).then((x) => vivo && setH(x));
    return () => {
      vivo = false;
    };
  }, [texto]);
  return h;
}

const Boton = ({ children, onClick, activo, className }: { children: React.ReactNode; onClick: () => void; activo?: boolean; className?: string }) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-xl border px-4 py-2 text-[1rem] font-semibold transition active:scale-[0.98]",
      activo ? "border-uc-cian bg-uc-cian text-white" : "border-uc-linea bg-uc-hoja text-uc-tinta hover:border-uc-cian hover:text-uc-cian",
      className,
    )}
  >
    {children}
  </button>
);

// --- Cifrado César ----------------------------------------------------------------------------------

export function Cesar({ compacto }: { compacto?: boolean }) {
  const [texto, setTexto] = useState("FE PUBLICA");
  const [k, setK] = useState(3);
  const cifrado = cesar(texto, k);
  const paso = 360 / 26;
  const rueda = (
    <svg viewBox="0 0 200 200" className={compacto ? "size-44" : "size-[22rem]"} aria-label={`Rueda de César con desplazamiento ${k}`}>
      <circle cx="100" cy="100" r="96" fill={C.hoja} stroke={C.linea} />
      <circle cx="100" cy="100" r="72" fill="#eef4f6" stroke={C.linea} />
      <circle cx="100" cy="100" r="50" fill={C.hoja} stroke={C.linea} />
      {[...ABC].map((l, i) => {
        const a = ((i * paso - 90) * Math.PI) / 180;
        return (
          <text key={l} x={100 + Math.cos(a) * 84} y={100 + Math.sin(a) * 84 + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill={i === 0 ? C.verde : C.tinta} fontFamily="var(--font-geist-mono)">
            {l}
          </text>
        );
      })}
      <g style={{ transform: `rotate(${-k * paso}deg)`, transformOrigin: "100px 100px", transition: "transform 0.7s cubic-bezier(.2,.8,.2,1)" }}>
        {[...ABC].map((l, i) => {
          const a = ((i * paso - 90) * Math.PI) / 180;
          return (
            <text key={l} x={100 + Math.cos(a) * 61} y={100 + Math.sin(a) * 61 + 4} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={C.cian} fontFamily="var(--font-geist-mono)">
              {l}
            </text>
          );
        })}
      </g>
      <path d="M100 6 v58" stroke={C.ocre} strokeWidth="2" strokeDasharray="3 3" />
      <text x="100" y="98" textAnchor="middle" fontSize="11" fill={C.pizarra} fontFamily="var(--font-geist-sans)">
        desplazamiento
      </text>
      <text x="100" y="122" textAnchor="middle" fontSize="26" fontWeight="600" fill={C.tinta} fontFamily="var(--font-fraunces), Georgia">
        {k}
      </text>
    </svg>
  );
  const controles = (
    <div className="grid gap-4">
      <label className="grid gap-1.5">
        <span className={cn("uc-rotulo text-uc-pizarra", compacto && "text-[0.6rem]")}>Mensaje</span>
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value.slice(0, 28))}
          className={cn("uc-mono rounded-xl border border-uc-linea bg-uc-hoja px-4 py-2 uppercase text-uc-tinta outline-none focus:border-uc-cian", compacto ? "text-lg" : "text-[1.8rem]")}
        />
      </label>
      <label className="grid gap-1.5">
        <span className={cn("uc-rotulo text-uc-pizarra", compacto && "text-[0.6rem]")}>Desplazamiento: {k}</span>
        <input type="range" min={0} max={25} value={k} onChange={(e) => setK(Number(e.target.value))} className="accent-[#1f7891]" />
      </label>
      <div>
        <span className={cn("uc-rotulo text-uc-cian", compacto && "text-[0.6rem]")}>Mensaje cifrado</span>
        <p className={cn("uc-mono mt-1 break-all font-semibold text-uc-cian", compacto ? "text-2xl" : "text-[2.8rem] leading-tight")}>
          {[...cifrado].map((ch, i) => (
            <span key={`${i}-${ch}-${k}`} className="uc-cambio" style={{ animationDelay: `${i * 0.03}s` }}>
              {ch}
            </span>
          ))}
        </p>
      </div>
      <p className={cn("text-uc-pizarra", compacto ? "text-sm" : "text-[1.1rem]")}>
        Solo hay 25 claves posibles: probándolas todas, se descifra en segundos. El secreto dependía de que nadie conociera el método.
      </p>
    </div>
  );
  if (compacto)
    return (
      <div className="grid gap-4">
        <div className="flex justify-center">{rueda}</div>
        {controles}
      </div>
    );
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-14">
      <div className="tf-sube">{rueda}</div>
      <div className="tf-sube" style={retraso(0.2)}>
        {controles}
      </div>
    </div>
  );
}

// --- Huella SHA-256 ----------------------------------------------------------------------------------

const CONTRATO_A =
  "CONTRATO DE LOCACIÓN (ficticio). Las partes acuerdan un canon mensual de $ 850.000, pagadero del 1 al 10 de cada mes, por el plazo de 36 meses.";
const CONTRATO_B = CONTRATO_A.replace("850.000", "860.000");

/** Cambia un carácter al azar (letra o dígito) del texto. */
function cambiarUno(t: string): string {
  const idx = [...t].map((c, i) => (/[a-z0-9]/i.test(c) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return t + ".";
  const i = idx[Math.floor(Math.random() * idx.length)];
  const c = t[i];
  const nuevo = /\d/.test(c) ? String((Number(c) + 1) % 10) : c === c.toUpperCase() ? (c === "Z" ? "A" : String.fromCharCode(c.charCodeAt(0) + 1)) : c === "z" ? "a" : String.fromCharCode(c.charCodeAt(0) + 1);
  return t.slice(0, i) + nuevo + t.slice(i + 1);
}

function Columna({ rotulo, valor, set, huella, contra }: { rotulo: string; valor: string; set: (v: string) => void; huella: string; contra: string }) {
  return (
  <div className="uc-hoja flex flex-col rounded-2xl border border-uc-linea p-5">
    <p className="uc-rotulo flex items-center gap-2 text-uc-azul">
      <GlifoDocumento className="size-5" /> {rotulo}
    </p>
    <textarea
      value={valor}
      onChange={(e) => set(e.target.value)}
      rows={3}
      className="mt-3 w-full resize-none rounded-xl border border-uc-linea bg-uc-papel/40 px-4 py-3 text-[1.12rem] leading-snug text-uc-tinta outline-none focus:border-uc-cian"
    />
    <div className="mt-4 flex items-center gap-2 text-uc-cian">
      <span className="uc-rotulo text-[0.62rem]">SHA-256</span>
      <span className="h-px flex-1 bg-uc-cian/30" />
    </div>
    <Hex valor={huella} contra={contra} grande className="mt-2 text-uc-tinta" />
  </div>
);
}

export function LabHash() {
  const [a, setA] = useState(CONTRATO_A);
  const [b, setB] = useState(CONTRATO_B);
  const ha = useHuella(a);
  const hb = useHuella(b);
  const bits = ha && hb ? bitsDistintos(ha, hb) : 0;
  const iguales = ha && hb ? [...ha].filter((c, i) => hb[i] === c).length : 0;
  const difTexto = useMemo(() => {
    let n = Math.abs(a.length - b.length);
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) n++;
    return n;
  }, [a, b]);
  const identicas = ha && ha === hb;

  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-6">
        <Columna rotulo="Versión A" valor={a} set={setA} huella={ha} contra={hb} />
        <Columna rotulo="Versión B" valor={b} set={setB} huella={hb} contra={ha} />
      </div>
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-6">
        <div className={cn("rounded-2xl border p-5", identicas ? "border-uc-verde/40 bg-uc-salvia-claro" : "border-uc-lacre/30 bg-uc-lacre-claro/60")}>
          <div className="flex items-baseline justify-between gap-4">
            <p className="uc-titular text-[2rem] text-uc-tinta">
              {identicas ? "Huellas idénticas" : `${difTexto} ${difTexto === 1 ? "carácter distinto" : "caracteres distintos"} en el texto`}
            </p>
            {!identicas && (
              <p className="text-[1.05rem] text-uc-pizarra">
                <b className="uc-serif text-[2rem] text-uc-lacre tabular-nums">{bits}</b> de 256 bits cambiaron
              </p>
            )}
          </div>
          <div className="mt-3 h-4 overflow-hidden rounded-full bg-uc-hoja">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(bits / 256) * 100}%`, background: identicas ? C.verde : C.lacre }} />
          </div>
          <p className="mt-2 text-[1rem] text-uc-pizarra">
            {identicas
              ? "Mismos datos, mismo algoritmo: siempre la misma huella."
              : `Solo ${iguales} de 64 caracteres coinciden por azar en su lugar. Un cambio mínimo, una huella completamente distinta.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Boton onClick={() => setB(cambiarUno(b))}>
              ✎ Cambiar un carácter de B
            </Boton>
            <Boton onClick={() => setB(a)}>
              ＝ Igualar B a A
            </Boton>
            <Boton
              onClick={() => {
                setA(CONTRATO_A);
                setB(CONTRATO_B);
              }}
            >
              ↺ Restaurar
            </Boton>
          </div>
        </div>
        <ArchivoPropio />
      </div>
    </div>
  );
}

/** Soltar un archivo: su huella se calcula en esta computadora y se compara con una huella informada. */
function ArchivoPropio() {
  const [archivo, setArchivo] = useState<{ nombre: string; bytes: number; huella: string } | null>(null);
  const [esperada, setEsperada] = useState("");
  const [sobre, setSobre] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function leer(f: File | undefined) {
    if (!f) return;
    const huella = await sha256(await f.arrayBuffer());
    setArchivo({ nombre: f.name, bytes: f.size, huella });
  }
  const limpia = esperada.replace(/[^0-9a-f]/gi, "").toLowerCase();
  const compara = archivo && limpia.length === 64 ? limpia === archivo.huella : null;

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setSobre(true);
      }}
      onDragLeave={() => setSobre(false)}
      onDrop={(e) => {
        e.preventDefault();
        setSobre(false);
        leer(e.dataTransfer.files[0]);
      }}
      className={cn("flex flex-col rounded-2xl border-2 border-dashed p-5 transition", sobre ? "border-uc-cian bg-uc-hielo" : "border-uc-linea bg-uc-hoja/70")}
    >
      <p className="uc-rotulo text-uc-azul">Un archivo propio</p>
      {!archivo ? (
        <button onClick={() => input.current?.click()} className="mt-3 flex flex-1 flex-col items-center justify-center gap-2 text-center text-uc-pizarra">
          <GlifoHuella className="size-12 text-uc-cian" />
          <span className="text-[1.05rem]">Soltá un archivo acá (o tocá para elegirlo)</span>
          <span className="text-[0.85rem] text-uc-niebla">La huella se calcula en esta computadora: el archivo no se sube a ningún lado.</span>
        </button>
      ) : (
        <div className="mt-3 grid gap-2">
          <p className="truncate text-[1.05rem] font-semibold text-uc-tinta">
            {archivo.nombre} <span className="font-normal text-uc-niebla">· {(archivo.bytes / 1024).toFixed(1)} KB</span>
          </p>
          <Hex valor={archivo.huella} className="text-uc-tinta" />
          <input
            value={esperada}
            onChange={(e) => setEsperada(e.target.value)}
            placeholder="Pegá la huella informada (p. ej., en un certificado)"
            className="uc-mono mt-1 rounded-lg border border-uc-linea bg-uc-hoja px-3 py-2 text-[0.85rem] outline-none focus:border-uc-cian"
          />
          {compara !== null && (
            <p className={cn("flex items-center gap-2 text-[1.05rem] font-semibold", compara ? "text-uc-verde" : "text-uc-lacre")}>
              {compara ? <GlifoCheck className="size-6" /> : <GlifoCruz className="size-6" />}
              {compara ? "Coincide: es el mismo archivo" : "No coincide: no es el mismo archivo"}
            </p>
          )}
          <button onClick={() => setArchivo(null)} className="justify-self-start text-[0.85rem] text-uc-niebla underline-offset-2 hover:underline">
            otro archivo
          </button>
        </div>
      )}
      <input ref={input} type="file" className="hidden" onChange={(e) => leer(e.target.files?.[0])} />
    </div>
  );
}

/** Calculadora de huella para el dispositivo del participante. */
export function MiniHash() {
  const [a, setA] = useState("Fe pública");
  const [b, setB] = useState("Fe publica");
  const ha = useHuella(a);
  const hb = useHuella(b);
  const bits = ha && hb ? bitsDistintos(ha, hb) : 0;
  return (
    <div className="grid gap-3">
      {[
        { v: a, set: setA, h: ha, c: hb, r: "Texto 1" },
        { v: b, set: setB, h: hb, c: ha, r: "Texto 2" },
      ].map((x) => (
        <div key={x.r} className="rounded-xl border border-line bg-ink-2 p-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-faint">{x.r}</p>
          <input value={x.v} onChange={(e) => x.set(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-ink px-3 py-2 text-base outline-none focus:border-teal" />
          <Hex valor={x.h} contra={x.c} className="mt-2 text-[0.8rem]" />
        </div>
      ))}
      <p className="text-sm text-muted">
        {ha && ha === hb ? "Textos iguales: huellas idénticas." : `Cambiaron ${bits} de 256 bits. Probá con una tilde, un espacio o una mayúscula.`}
      </p>
    </div>
  );
}

// --- Firma y verificación (ECDSA P-256) ------------------------------------------------------------------

const PROVIDENCIA =
  "JUZGADO CIVIL N.º 9 DE VILLA ESPERANZA (ficticio). Expte. VE-2026-0417. Téngase presente lo manifestado. Agréguese la documental acompañada. Notifíquese.";

type Paso = "inicio" | "claves" | "firmado" | "verificado";

export function LabFirma() {
  const [claves, setClaves] = useState<CryptoKeyPair | null>(null);
  const [huellaPub, setHuellaPub] = useState("");
  const [impostor, setImpostor] = useState<{ par: CryptoKeyPair; huella: string } | null>(null);
  const [usarImpostor, setUsarImpostor] = useState(false);
  const [texto, setTexto] = useState(PROVIDENCIA);
  const [recibido, setRecibido] = useState(PROVIDENCIA);
  const [firma, setFirma] = useState("");
  const [resultado, setResultado] = useState<boolean | null>(null);
  const [paso, setPaso] = useState<Paso>("inicio");
  const [ocupado, setOcupado] = useState(false);
  const disponible = cripto();

  async function generar() {
    setOcupado(true);
    const par = await generarClaves();
    setClaves(par);
    setHuellaPub(await huellaClave(par.publicKey));
    setFirma("");
    setResultado(null);
    setUsarImpostor(false);
    setPaso("claves");
    setOcupado(false);
  }
  async function firmarDoc() {
    if (!claves) return;
    setOcupado(true);
    setFirma(await firmar(claves.privateKey, texto));
    setRecibido(texto);
    setResultado(null);
    setPaso("firmado");
    setOcupado(false);
  }
  async function verificarDoc(conImpostor = usarImpostor) {
    if (!claves || !firma) return;
    let pub = claves.publicKey;
    if (conImpostor) {
      let imp = impostor;
      if (!imp) {
        const par = await generarClaves();
        imp = { par, huella: await huellaClave(par.publicKey) };
        setImpostor(imp);
      }
      pub = imp.par.publicKey;
    }
    setResultado(await verificar(pub, recibido, firma));
    setPaso("verificado");
  }
  // Al cambiar lo recibido o la clave, el resultado anterior deja de valer.
  useEffect(() => setResultado(null), [recibido, usarImpostor]);

  if (!disponible) return <p className="text-uc-lacre">Este navegador no permite la demostración (hace falta https o localhost).</p>;

  const alterado = recibido !== texto;
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-5">
      {/* Firmante */}
      <div className="uc-hoja flex flex-col rounded-2xl border border-uc-linea p-5">
        <p className="uc-rotulo flex items-center gap-2 text-uc-verde">
          <GlifoInstitucion className="size-5" /> Quien firma
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className={cn("rounded-xl border p-3 transition", claves ? "border-uc-lacre/40 bg-uc-lacre-claro/60" : "border-dashed border-uc-linea")}>
            <p className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-uc-lacre">
              <GlifoLlave className="size-5" /> Clave privada
            </p>
            <p className="uc-mono mt-1 text-[0.95rem] text-uc-tinta">{claves ? "•••• •••• ••••" : "—"}</p>
            <p className="mt-1 text-[0.72rem] leading-tight text-uc-pizarra">Nunca sale de este dispositivo</p>
          </div>
          <div className={cn("rounded-xl border p-3 transition", claves ? "border-uc-cian/40 bg-uc-hielo" : "border-dashed border-uc-linea")}>
            <p className="flex items-center gap-1.5 text-[0.85rem] font-semibold text-uc-cian">
              <GlifoCandado className="size-5" abierto /> Clave pública
            </p>
            <p className="uc-mono mt-1 text-[0.95rem] text-uc-tinta">{huellaPub || "—"}</p>
            <p className="mt-1 text-[0.72rem] leading-tight text-uc-pizarra">Se comparte: viaja en el certificado</p>
          </div>
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={4}
          className="mt-3 w-full resize-none rounded-xl border border-uc-linea bg-uc-papel/40 px-4 py-3 text-[1rem] leading-snug outline-none focus:border-uc-cian"
        />
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Boton onClick={generar} activo={paso === "inicio"}>
            {ocupado && paso === "inicio" ? "…" : claves ? "↺ Nuevas claves" : "1 · Generar las claves"}
          </Boton>
          <Boton onClick={firmarDoc} activo={paso === "claves"} className={cn(!claves && "pointer-events-none opacity-40")}>
            2 · Firmar
          </Boton>
        </div>
      </div>

      {/* Canal */}
      <div className="relative flex w-[13rem] flex-col items-center justify-center gap-3 text-center">
        <div className="relative h-1 w-full rounded-full bg-uc-linea">
          {firma && <span className="uc-viaja -top-3 size-7 rounded-md border border-uc-cian bg-uc-hoja shadow" />}
        </div>
        <div className={cn("w-full rounded-xl border px-3 py-3 transition", firma ? "border-uc-cian/50 bg-uc-hielo" : "border-dashed border-uc-linea")}>
          <p className="uc-rotulo text-[0.6rem] text-uc-cian">Viaja</p>
          <p className="mt-1 text-[0.9rem] text-uc-tinta">documento + firma + clave pública</p>
          <p className="uc-mono mt-2 break-all text-[0.72rem] leading-tight text-uc-pizarra">{firma ? `firma: ${firma.slice(0, 40)}…` : "todavía no hay firma"}</p>
        </div>
        <p className="text-[0.8rem] text-uc-niebla">ECDSA P-256 · SHA-256 · criptografía real del navegador</p>
      </div>

      {/* Receptor */}
      <div className="uc-hoja flex flex-col rounded-2xl border border-uc-linea p-5">
        <p className="uc-rotulo flex items-center gap-2 text-uc-azul">
          <GlifoDocumento className="size-5" /> Quien recibe y verifica
        </p>
        <textarea
          value={recibido}
          onChange={(e) => setRecibido(e.target.value)}
          rows={4}
          disabled={!firma}
          className={cn(
            "mt-3 w-full resize-none rounded-xl border px-4 py-3 text-[1rem] leading-snug outline-none focus:border-uc-cian disabled:opacity-40",
            alterado ? "border-uc-lacre/50 bg-uc-lacre-claro/40" : "border-uc-linea bg-uc-papel/40",
          )}
        />
        <div className={cn("mt-3 flex min-h-[5.5rem] items-center gap-4 rounded-xl border px-4 py-3 transition", resultado === null ? "border-dashed border-uc-linea" : resultado ? "border-uc-verde/40 bg-uc-salvia-claro" : "border-uc-lacre/40 bg-uc-lacre-claro")}>
          {resultado === null ? (
            <p className="text-[1rem] text-uc-pizarra">{firma ? "Listo para verificar con la clave pública." : "Esperando un documento firmado."}</p>
          ) : resultado ? (
            <>
              <GlifoCheck className="size-12 shrink-0 text-uc-verde" />
              <p className="text-[1.05rem] leading-snug text-uc-tinta">
                <b className="uc-serif text-[1.5rem] text-uc-verde">Firma válida.</b> El contenido no cambió y se firmó con la clave privada que corresponde a esta clave pública.
              </p>
            </>
          ) : (
            <>
              <GlifoCruz className="size-12 shrink-0 text-uc-lacre" />
              <p className="text-[1.05rem] leading-snug text-uc-tinta">
                <b className="uc-serif text-[1.5rem] text-uc-lacre">Firma inválida.</b> {usarImpostor ? "Esa clave pública no corresponde a la clave que firmó." : "El documento cambió después de firmarse."}
              </p>
            </>
          )}
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <Boton onClick={() => verificarDoc()} activo={paso === "firmado"} className={cn(!firma && "pointer-events-none opacity-40")}>
            3 · Verificar
          </Boton>
          <Boton onClick={() => setRecibido(alterado ? texto : texto.replace("Notifíquese", "Notifíquese y archívese"))} className={cn(!firma && "pointer-events-none opacity-40")}>
            {alterado ? "↺ Restaurar el documento" : "✎ Alterar el documento"}
          </Boton>
          <Boton onClick={() => setUsarImpostor((v) => !v)} activo={usarImpostor} className={cn(!firma && "pointer-events-none opacity-40")}>
            {usarImpostor ? "Clave de un impostor ✓" : "Usar la clave de un impostor"}
          </Boton>
        </div>
        {usarImpostor && impostor && <p className="uc-mono mt-2 text-[0.75rem] text-uc-lacre">clave pública usada: {impostor.huella}</p>}
      </div>
    </div>
  );
}

// --- Cadena de bloques -------------------------------------------------------------------------------------

const BLOQUES_INICIALES = [
  "12/06/2026 · Testimonio VE-0417",
  "13/06/2026 · Acta de constatación 112",
  "15/06/2026 · Escritura 384",
  "16/06/2026 · Oficio al Registro 77",
];

type Bloque = { datos: string; previo: string; huella: string };

async function sellar(datos: string[], desde = 0, base: Bloque[] = []): Promise<Bloque[]> {
  const out = base.slice(0, desde);
  let previo = desde > 0 ? out[desde - 1].huella : "0".repeat(64);
  for (let i = desde; i < datos.length; i++) {
    const huella = await sha256(`${i + 1}|${previo}|${datos[i]}`);
    out.push({ datos: datos[i], previo, huella });
    previo = huella;
  }
  return out;
}

export function Cadena({ compacto }: { compacto?: boolean }) {
  const [datos, setDatos] = useState(BLOQUES_INICIALES);
  const [sellada, setSellada] = useState<Bloque[]>([]);
  const [actual, setActual] = useState<string[]>([]);
  const [original, setOriginal] = useState("");

  useEffect(() => {
    sellar(BLOQUES_INICIALES).then((b) => {
      setSellada(b);
      setOriginal(b[b.length - 1].huella);
    });
  }, []);
  // Huella actual de cada bloque, con su contenido actual y el "previo" que tiene guardado.
  useEffect(() => {
    if (!sellada.length) return;
    let vivo = true;
    Promise.all(datos.map((d, i) => sha256(`${i + 1}|${sellada[i].previo}|${d}`))).then((h) => vivo && setActual(h));
    return () => {
      vivo = false;
    };
  }, [datos, sellada]);

  if (!sellada.length || !actual.length) return <p className="text-uc-pizarra">Armando la cadena…</p>;

  const roto = datos.map((_, i) => actual[i] !== sellada[i].huella);
  const primeroRoto = roto.findIndex(Boolean);
  const eslabonRoto = (i: number) => i > 0 && actual[i - 1] !== sellada[i].previo;
  const miCopia = actual[actual.length - 1];
  const otrosNodos = 4;
  // Mi copia es íntegra si cada bloque conserva su huella y cada eslabón cierra;
  // y coincide con la red si, además, termina en la misma huella que las demás copias.
  const integra = primeroRoto < 0 && datos.every((_, i) => !eslabonRoto(i));
  const coincide = integra && miCopia === original;

  async function recalcular() {
    const b = await sellar(datos);
    setSellada(b);
  }
  function restaurar() {
    setDatos(BLOQUES_INICIALES);
    sellar(BLOQUES_INICIALES).then(setSellada);
  }

  return (
    <div className={cn("grid", compacto ? "gap-3" : "gap-7")}>
      <div className={cn("grid items-stretch", compacto ? "grid-cols-1 gap-2" : "grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] gap-2")}>
        {datos.map((d, i) => {
          const malo = roto[i] || eslabonRoto(i);
          return [
            i > 0 && !compacto && (
              <div key={`e${i}`} className="flex items-center">
                <svg viewBox="0 0 40 20" className="w-10" aria-hidden>
                  <path d="M2 10 H38" stroke={eslabonRoto(i) ? C.lacre : C.verde} strokeWidth="3" strokeDasharray={eslabonRoto(i) ? "4 5" : "0"} />
                  {eslabonRoto(i) && <path d="M15 3 L25 17 M25 3 L15 17" stroke={C.lacre} strokeWidth="2.5" />}
                </svg>
              </div>
            ),
            <div
              key={`b${i}`}
              className={cn(
                "flex flex-col rounded-2xl border-2 p-4 transition",
                malo ? "border-uc-lacre/60 bg-uc-lacre-claro/60" : "border-uc-verde/30 bg-uc-hoja",
                compacto && "p-3",
              )}
            >
              <p className={cn("uc-rotulo", compacto ? "text-[0.58rem]" : "text-[0.66rem]", malo ? "text-uc-lacre" : "text-uc-verde")}>Bloque {i + 1}</p>
              <input
                value={d}
                onChange={(e) => setDatos((xs) => xs.map((x, j) => (j === i ? e.target.value : x)))}
                className={cn("mt-2 w-full rounded-lg border border-uc-linea bg-white/70 px-2 py-1.5 text-uc-tinta outline-none focus:border-uc-cian", compacto ? "text-sm" : "text-[1rem]")}
              />
              <p className={cn("uc-mono mt-2 text-uc-niebla", compacto ? "text-[0.65rem]" : "text-[0.78rem]")}>
                anterior: <span className={cn(eslabonRoto(i) && "font-semibold text-uc-lacre")}>{sellada[i].previo.slice(0, 12)}…</span>
              </p>
              <p className={cn("uc-mono text-uc-tinta", compacto ? "text-[0.7rem]" : "text-[0.85rem]")}>
                propia: <span className={cn(roto[i] && "font-semibold text-uc-lacre")}>{actual[i].slice(0, 12)}…</span>
              </p>
            </div>,
          ];
        })}
      </div>

      <div className={cn("grid items-center", compacto ? "gap-3" : "grid-cols-[1fr_auto] gap-8")}>
        <div className="flex flex-wrap items-center gap-3">
          <p className={cn("uc-rotulo text-uc-pizarra", compacto && "text-[0.6rem]")}>Copias en la red</p>
          {[...Array(otrosNodos + 1)].map((_, n) => {
            const mia = n === 0;
            const ok = mia ? coincide : true;
            return (
              <span
                key={n}
                className={cn(
                  "flex flex-col items-center rounded-xl border px-3 py-2 text-center transition",
                  ok ? "border-uc-verde/40 bg-uc-salvia-claro" : "border-uc-lacre/50 bg-uc-lacre-claro",
                  compacto && "px-2 py-1",
                )}
              >
                <span className={cn("font-semibold", compacto ? "text-[0.7rem]" : "text-[0.85rem]", ok ? "text-uc-verde" : "text-uc-lacre")}>{mia ? "Tu copia" : `Nodo ${n + 1}`}</span>
                <span className={cn("uc-mono text-uc-pizarra", compacto ? "text-[0.6rem]" : "text-[0.7rem]")}>{(mia ? miCopia : original).slice(0, 8)}</span>
              </span>
            );
          })}
        </div>
        <div className="flex flex-wrap gap-2">
          {!integra && (
            <Boton onClick={recalcular}>
              Recalcular mi copia
            </Boton>
          )}
          <Boton onClick={restaurar}>↺ Restaurar</Boton>
        </div>
      </div>

      <p className={cn("rounded-xl px-4 py-3 leading-snug", compacto ? "text-sm" : "text-[1.15rem]", coincide ? "bg-uc-salvia-claro text-uc-verde" : "bg-uc-lacre-claro text-uc-lacre")}>
        {coincide
          ? "Probá editar un bloque: se rompe su eslabón con el siguiente."
          : !integra
            ? `El bloque ${primeroRoto + 1} cambió: su huella ya no es ${primeroRoto + 1 < datos.length ? "la que guarda el bloque siguiente" : "la que se selló"}.`
            : "Recalculaste tu copia y la cadena vuelve a cerrar… pero no coincide con las copias de los demás nodos: la alteración se detecta igual."}
      </p>
    </div>
  );
}

// --- Certificado: vigencia, revocación y sello de tiempo -----------------------------------------------------

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const INICIO = { a: 2024, m: 0 }; // enero 2024
const TOTAL_MESES = 34; // hasta octubre 2026
const mesTexto = (n: number) => `${MESES[(INICIO.m + n) % 12]} ${INICIO.a + Math.floor((INICIO.m + n) / 12)}`;
const HITOS = { emision: 2, revocacion: 20, vencimiento: 26, hoy: 33 }; // mar-24, sep-25, mar-26, oct-26

export function CertificadoLinea({ verLinea }: { verLinea: boolean }) {
  const [firma, setFirma] = useState(17); // jun 2025
  const [sello, setSello] = useState(true);

  let estado: { tono: "ok" | "duda" | "mal"; titulo: string; texto: string };
  if (firma < HITOS.emision) estado = { tono: "mal", titulo: "El certificado no existía", texto: "Ninguna firma puede atribuirse a un certificado antes de su emisión." };
  else if (firma < HITOS.revocacion)
    estado = sello
      ? { tono: "ok", titulo: "Válida al momento de firmar", texto: "El sello de tiempo acredita que se firmó con el certificado vigente. Que hoy esté revocado y vencido no cambia ese momento." }
      : { tono: "duda", titulo: "¿Antes o después de la revocación?", texto: "Solo tenemos la fecha que declara el documento o el reloj del equipo. Sin una evidencia temporal de un tercero, el momento de la firma queda discutido." };
  else if (firma < HITOS.vencimiento)
    estado = sello
      ? { tono: "mal", titulo: "Firmada con un certificado revocado", texto: "El sello acredita que se firmó después de la revocación: la firma no es válida." }
      : { tono: "mal", titulo: "Certificado revocado", texto: "Si se firmó después de la revocación, no es válida; sin sello de tiempo ni siquiera podemos ubicarla con certeza." };
  else estado = { tono: "mal", titulo: "Certificado vencido al firmar", texto: "La firma se generó fuera del período de vigencia del certificado." };

  const x = (n: number) => `${(n / TOTAL_MESES) * 100}%`;
  const tonos = { ok: "border-uc-verde/40 bg-uc-salvia-claro text-uc-verde", duda: "border-uc-ocre/50 bg-uc-ocre-claro text-uc-ocre", mal: "border-uc-lacre/40 bg-uc-lacre-claro text-uc-lacre" };

  return (
    <div className="grid grid-cols-[0.8fr_1.2fr] items-start gap-8">
      {/* El certificado y su cadena de confianza */}
      <div className="tf-sube grid gap-3">
        {[
          { k: "Autoridad certificante raíz", v: "Habilita a los certificadores", c: "border-uc-verde/40" },
          { k: "Certificador licenciado", v: "Emite y revoca certificados", c: "border-uc-verde/40" },
        ].map((n, i) => (
          <div key={n.k} className="relative">
            <div className={cn("flex items-center gap-3 rounded-xl border bg-uc-hoja px-4 py-2.5", n.c)} style={{ marginLeft: `${i * 1.2}rem` }}>
              <GlifoInstitucion className="size-6 shrink-0 text-uc-verde" />
              <p className="text-[1rem] leading-tight text-uc-tinta">
                <b>{n.k}</b> <span className="text-uc-pizarra">· {n.v}</span>
              </p>
            </div>
          </div>
        ))}
        <div className="uc-hoja ml-[2.4rem] rounded-2xl border-2 border-uc-cian/40 p-5">
          <p className="uc-rotulo text-[0.65rem] text-uc-cian">Certificado de firma digital (ficticio)</p>
          <dl className="mt-3 grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-1.5 text-[1rem]">
            <dt className="text-uc-niebla">Titular</dt>
            <dd className="text-uc-tinta">María Ejemplo</dd>
            <dt className="text-uc-niebla">Emisor</dt>
            <dd className="text-uc-tinta">Certificador licenciado</dd>
            <dt className="text-uc-niebla">Vigencia</dt>
            <dd className="text-uc-tinta">mar 2024 → mar 2026</dd>
            <dt className="text-uc-niebla">Clave pública</dt>
            <dd className="uc-mono text-[0.9rem] text-uc-tinta">3F2A 9C1E 77B0 D415</dd>
            <dt className="text-uc-niebla">Estado hoy</dt>
            <dd className="font-semibold text-uc-lacre">revocado (sep 2025) · vencido</dd>
          </dl>
        </div>
      </div>

      {/* Línea de tiempo interactiva */}
      <div className={cn("tf-unidad grid gap-5", !verLinea && "pointer-events-none")} data-oculta={verLinea ? undefined : ""}>
        <div className="uc-hoja rounded-2xl border border-uc-linea px-6 pb-6 pt-14">
          <div className="relative h-3 rounded-full bg-uc-linea">
            <div className="absolute inset-y-0 rounded-full bg-uc-verde/70" style={{ left: x(HITOS.emision), width: `calc(${x(HITOS.revocacion)} - ${x(HITOS.emision)})` }} />
            <div className="absolute inset-y-0 rounded-full bg-uc-lacre/45" style={{ left: x(HITOS.revocacion), width: `calc(${x(HITOS.vencimiento)} - ${x(HITOS.revocacion)})` }} />
            {[
              { n: HITOS.emision, t: "Emisión", c: C.verde },
              { n: HITOS.revocacion, t: "Revocación", c: C.lacre },
              { n: HITOS.vencimiento, t: "Vencimiento", c: C.pizarra },
              { n: HITOS.hoy, t: "Hoy", c: C.tinta },
            ].map((h) => (
              <div key={h.t} className="absolute -top-11 -translate-x-1/2 text-center" style={{ left: x(h.n) }}>
                <p className="whitespace-nowrap text-[0.85rem] font-semibold" style={{ color: h.c }}>
                  {h.t}
                </p>
                <p className="whitespace-nowrap text-[0.72rem] text-uc-niebla">{mesTexto(h.n)}</p>
                <span className="mx-auto mt-1 block h-5 w-0.5" style={{ background: h.c }} />
              </div>
            ))}
            {/* La firma */}
            <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300" style={{ left: x(firma) }}>
              <span className={cn("flex size-9 items-center justify-center rounded-full border-2 border-white text-sm font-bold text-white shadow-md", sello ? "bg-uc-cian" : "bg-uc-ocre")}>✍</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={TOTAL_MESES}
            value={firma}
            onChange={(e) => setFirma(Number(e.target.value))}
            className="mt-6 w-full accent-[#1f7891]"
            aria-label="Momento de la firma"
          />
          <div className="mt-2 flex items-center justify-between gap-4">
            <p className="text-[1.05rem] text-uc-pizarra">
              Firma: <b className="text-uc-tinta">{mesTexto(firma)}</b>
            </p>
            <button
              onClick={() => setSello((s) => !s)}
              className={cn("flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.95rem] font-semibold transition", sello ? "border-uc-cian bg-uc-cian text-white" : "border-uc-linea bg-uc-hoja text-uc-pizarra")}
            >
              <GlifoReloj className="size-5" /> {sello ? "Con sello de tiempo" : "Sin sello de tiempo"}
            </button>
          </div>
        </div>
        <div className={cn("flex items-start gap-4 rounded-2xl border px-5 py-4 transition", tonos[estado.tono])}>
          {estado.tono === "ok" ? <GlifoCheck className="size-11 shrink-0" /> : estado.tono === "duda" ? <GlifoPregunta className="size-11 shrink-0" /> : <GlifoCruz className="size-11 shrink-0" />}
          <div>
            <p className="uc-titular text-[1.7rem]">{estado.titulo}</p>
            <p className="mt-1 text-[1.08rem] leading-snug text-uc-tinta">{estado.texto}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-uc-hielo px-4 py-3 text-[1rem] text-uc-azul">
          <GlifoHuella className="size-7 shrink-0 text-uc-cian" />
          <span>
            <b>Sello de tiempo:</b> la autoridad recibe solo la <b>huella</b> del documento, le agrega fecha y hora y firma el conjunto. Nunca ve el documento.
          </span>
        </div>
      </div>
    </div>
  );
}

// --- Anatomía de una certificación de página web ------------------------------------------------------------

type Captura = {
  id: number;
  fecha: string;
  utc: string;
  http: number;
  hashes: { pdf: string; har: string; png: string };
};

const URL_CASO = "https://tienda-aurora.example/productos/campera-brisa";
const CAPTURAS: Captura[] = [
  {
    id: 700128,
    fecha: "05/07/2026",
    utc: "2026-07-05T16:31:30Z",
    http: 200,
    hashes: {
      pdf: "5e024df7ad770d1da4c843293593bfc14c7ca4d00c88dd208d8d8802ff7c99da",
      har: "737ee5da9240a778e0ad166e2b1b2e089c9eeb85393ce1fd4a2652d965424e5d",
      png: "4f1205924a4ccdcdd42818e6bb257c474df627f50ce547358e83b936e0cc4c58",
    },
  },
  {
    id: 700204,
    fecha: "10/07/2026",
    utc: "2026-07-10T17:42:46Z",
    http: 404,
    hashes: {
      pdf: "eace35f636f245c048bcd3e729ef306ce825d017eb1c47712d5f6288f2d0a2c7",
      har: "ef2b42c133c3446f93d1e760af35ed1050c6dde8ff0449c786d1e47203ed9629",
      png: "e1c82dbff6edcdca0af8fdfd17ff884e9ba1e816c21943948d663e928ffa8082",
    },
  },
];

function metadatos(c: Captura, alterar: boolean) {
  const utc = alterar ? c.utc.replace(/:(\d\d)Z$/, (_, s) => `:${String(Number(s) + 1).padStart(2, "0")}Z`) : c.utc;
  return JSON.stringify(
    {
      certificado: c.id,
      tipo: "website",
      url: URL_CASO,
      captura_utc: utc,
      respuesta_http: c.http,
      archivos: {
        "certificado.pdf": `sha256:${c.hashes.pdf}`,
        "navegacion.har": `sha256:${c.hashes.har}`,
        "captura.png": `sha256:${c.hashes.png}`,
      },
      sello_de_tiempo: "sello-tiempo.tsr",
      firma: "firma.p7s",
    },
    null,
    2,
  );
}

type Solicitud = { metodo: string; url: string; estado: number; tipo: string; desde: number; hasta: number; peso: string };

function har(c: Captura): Solicitud[] {
  if (c.http === 404)
    return [
      { metodo: "GET", url: URL_CASO, estado: 404, tipo: "text/html", desde: 0, hasta: 230, peso: "3 KB" },
      { metodo: "GET", url: "https://tienda-aurora.example/assets/tienda.css", estado: 200, tipo: "text/css", desde: 250, hasta: 330, peso: "21 KB" },
      { metodo: "GET", url: "https://tienda-aurora.example/img/no-encontrado.svg", estado: 200, tipo: "image/svg+xml", desde: 260, hasta: 340, peso: "4 KB" },
    ];
  return [
    { metodo: "GET", url: URL_CASO, estado: 200, tipo: "text/html", desde: 0, hasta: 410, peso: "48 KB" },
    { metodo: "GET", url: "https://tienda-aurora.example/assets/tienda.css", estado: 200, tipo: "text/css", desde: 430, hasta: 520, peso: "21 KB" },
    { metodo: "GET", url: "https://cdn.fotos-aurora.example/campera-brisa-frente.jpg", estado: 200, tipo: "image/jpeg", desde: 450, hasta: 980, peso: "312 KB" },
    { metodo: "GET", url: "https://cdn.fotos-aurora.example/campera-brisa-espalda.jpg", estado: 200, tipo: "image/jpeg", desde: 460, hasta: 1010, peso: "298 KB" },
    { metodo: "GET", url: "https://fuentes.example/tipografia.woff2", estado: 200, tipo: "font/woff2", desde: 470, hasta: 600, peso: "36 KB" },
    { metodo: "POST", url: "https://estadisticas.example/registrar", estado: 204, tipo: "—", desde: 1030, hasta: 1090, peso: "0 KB" },
  ];
}

const ARCHIVOS = [
  { id: "pdf", nombre: "certificado.pdf", que: "Lo que se veía: la representación de la página, con número y fecha" },
  { id: "meta", nombre: "metadatos.json", que: "URL, fecha UTC, respuesta del servidor y huella SHA-256 de cada archivo. Firmado y sellado" },
  { id: "har", nombre: "navegacion.har", que: "El comprobante técnico de la navegación: cada pedido y cada respuesta" },
  { id: "tsr", nombre: "sello-tiempo.tsr", que: "La evidencia temporal de un tercero sobre la huella de los metadatos" },
  { id: "p7s", nombre: "firma.p7s", que: "La firma del servicio sobre los metadatos" },
] as const;
type IdArchivo = (typeof ARCHIVOS)[number]["id"];

export function LabCertWeb() {
  const [cap, setCap] = useState(0);
  const [archivo, setArchivo] = useState<IdArchivo>("meta");
  const [alterar, setAlterar] = useState(false);
  const [verificado, setVerificado] = useState(false);
  const [informe, setInforme] = useState(false);
  const c = CAPTURAS[cap];
  const original = metadatos(c, false);
  const actual = metadatos(c, alterar);
  const consignada = useHuella(original);
  const recalculada = useHuella(actual);
  useEffect(() => setVerificado(false), [cap, alterar, archivo]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="uc-rotulo text-uc-pizarra">Captura</span>
        {CAPTURAS.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setCap(i)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-1.5 text-[0.95rem] transition",
              cap === i ? "border-uc-tinta bg-uc-tinta text-white" : "border-uc-linea bg-uc-hoja text-uc-tinta hover:border-uc-tinta",
            )}
          >
            N.º {x.id} · {x.fecha}
            <span className={cn("rounded-md px-1.5 text-[0.8rem] font-bold", x.http === 200 ? "bg-uc-verde text-white" : "bg-uc-lacre text-white")}>HTTP {x.http}</span>
          </button>
        ))}
        <span className="ml-auto text-[0.8rem] text-uc-niebla">Caso y datos ficticios · estructura ilustrativa</span>
      </div>

      <div className="grid grid-cols-[19rem_1fr] gap-5">
        {/* El paquete */}
        <div className="uc-hoja rounded-2xl border border-uc-linea p-4">
          <p className="uc-mono flex items-center gap-2 text-[0.95rem] font-semibold text-uc-tinta">🗜 certificado-{c.id}.zip</p>
          <div className="mt-3 grid gap-1.5 border-l border-uc-linea pl-3">
            {ARCHIVOS.map((a) => (
              <button
                key={a.id}
                onClick={() => setArchivo(a.id)}
                className={cn("rounded-xl px-3 py-2 text-left transition", archivo === a.id ? "bg-uc-hielo ring-1 ring-uc-cian/50" : "hover:bg-uc-papel")}
              >
                <p className="uc-mono text-[0.92rem] font-semibold text-uc-tinta">{a.nombre}</p>
                <p className="text-[0.8rem] leading-snug text-uc-pizarra">{a.que}</p>
              </button>
            ))}
          </div>
        </div>

        {/* El archivo elegido */}
        <div className="uc-hoja min-h-[25rem] rounded-2xl border border-uc-linea p-5">
          {archivo === "pdf" && <VistaPdf c={c} />}
          {archivo === "meta" && (
            <div className="grid grid-cols-[1.05fr_0.95fr] gap-5">
              <pre className={cn("uc-mono max-h-[22rem] overflow-auto rounded-xl border p-4 text-[0.8rem] leading-relaxed", alterar ? "border-uc-lacre/40 bg-uc-lacre-claro/40" : "border-uc-linea bg-uc-papel/50")}>
                {actual.split("\n").map((l, i) => (
                  <span key={i} className={cn("block", alterar && l.includes("captura_utc") && "bg-uc-lacre/15 font-semibold text-uc-lacre")}>
                    {l}
                  </span>
                ))}
              </pre>
              <div className="grid content-start gap-3">
                <div>
                  <p className="uc-rotulo text-[0.62rem] text-uc-pizarra">Huella consignada en el certificado</p>
                  <Hex valor={consignada} className="mt-1 text-uc-tinta" />
                </div>
                <div className={cn("tf-unidad", !verificado && "opacity-30")}>
                  <p className="uc-rotulo text-[0.62rem] text-uc-pizarra">Huella recalculada ahora</p>
                  <Hex valor={recalculada} contra={consignada} className="mt-1 text-uc-tinta" />
                </div>
                {verificado && (
                  <p className={cn("tf-sube flex items-center gap-3 rounded-xl px-4 py-3 text-[1.1rem] font-semibold", consignada === recalculada ? "bg-uc-salvia-claro text-uc-verde" : "bg-uc-lacre-claro text-uc-lacre")}>
                    {consignada === recalculada ? <GlifoCheck className="size-8 shrink-0" /> : <GlifoCruz className="size-8 shrink-0" />}
                    {consignada === recalculada ? "Coinciden: los metadatos no se alteraron." : "No coinciden: alcanzó un segundo para cambiar la huella."}
                  </p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Boton onClick={() => setVerificado(true)} activo={!verificado}>
                    ✓ Verificar la huella
                  </Boton>
                  <Boton onClick={() => setAlterar((v) => !v)} activo={alterar}>
                    {alterar ? "↺ Restaurar la hora" : "✎ Alterar un segundo"}
                  </Boton>
                </div>
              </div>
            </div>
          )}
          {archivo === "har" && <VistaHar c={c} />}
          {(archivo === "tsr" || archivo === "p7s") && <VistaSello tipo={archivo} huella={consignada} c={c} />}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <button
          onClick={() => setInforme((v) => !v)}
          className={cn("shrink-0 rounded-xl border px-4 py-2 text-[0.95rem] font-semibold transition", informe ? "border-uc-verde bg-uc-verde text-white" : "border-uc-linea bg-uc-hoja text-uc-verde")}
        >
          📝 Cómo lo consigno en el informe
        </button>
        {informe && (
          <p className="tf-sube uc-serif border-l-4 border-uc-verde pl-4 text-[1.08rem] italic leading-snug text-uc-tinta">
            «Las páginas fueron preservadas mediante certificados Website de SaveTheProof. Cada certificado identifica la URL, asigna un número único,
            incorpora la representación obtenida y entrega un conjunto de metadatos firmado y sellado temporalmente. De ese modo, la página visible
            queda vinculada con una fecha de captura y con huellas digitales SHA-256 que permiten comprobar que los archivos no fueron alterados.»
          </p>
        )}
      </div>
    </div>
  );
}

function VistaPdf({ c }: { c: Captura }) {
  return (
    <div className="grid grid-cols-[1fr_0.75fr] gap-6">
      <div className="overflow-hidden rounded-xl border border-uc-linea shadow-sm">
        <div className="flex items-center justify-between bg-uc-tinta px-4 py-2 text-white">
          <span className="text-[0.85rem] font-semibold">Certificado Website · N.º {c.id}</span>
          <span className="uc-mono text-[0.75rem] opacity-80">{c.utc.replace("T", " ").replace("Z", " UTC")}</span>
        </div>
        <div className="uc-mono border-b border-uc-linea bg-uc-papel px-4 py-1.5 text-[0.75rem] text-uc-pizarra">{URL_CASO}</div>
        {c.http === 200 ? (
          <div className="grid grid-cols-[0.9fr_1.1fr] gap-4 bg-white p-4">
            <svg viewBox="0 0 120 120" className="w-full rounded-lg bg-[#efe9df]" aria-label="Fotografía del producto (simulada)">
              <path d="M38 22 L52 16 Q60 24 68 16 L82 22 L96 44 L84 52 L80 44 L80 104 L40 104 L40 44 L36 52 L24 44 Z" fill={C.azul} opacity="0.85" />
              <path d="M60 24 V104" stroke="#fff" strokeWidth="1.5" opacity="0.6" />
            </svg>
            <div className="grid content-start gap-2">
              <p className="uc-serif text-[1.25rem] text-uc-tinta">Campera Modelo Brisa</p>
              <p className="text-[0.9rem] text-uc-pizarra">Talles S a XL · Azul petróleo</p>
              <p className="uc-serif text-[1.4rem] text-uc-verde">$ 129.900</p>
              <span className="mt-1 w-fit rounded-md bg-uc-tinta px-3 py-1 text-[0.8rem] text-white">Agregar al carrito</span>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center gap-2 bg-white p-10 text-center">
            <p className="uc-serif text-[3rem] text-uc-lacre">404</p>
            <p className="text-[1rem] text-uc-pizarra">La página que buscás no existe.</p>
          </div>
        )}
      </div>
      <div className="grid content-start gap-3 text-[1.02rem] leading-snug text-uc-tinta">
        <p>
          <b>Representación visible</b> de lo que devolvió el servidor el {c.fecha}.
        </p>
        <p className="text-uc-pizarra">Es una reproducción: lo que permite verificarla son los metadatos firmados y sellados, no la imagen.</p>
        <p className={cn("rounded-xl px-4 py-3 font-semibold", c.http === 200 ? "bg-uc-salvia-claro text-uc-verde" : "bg-uc-lacre-claro text-uc-lacre")}>
          {c.http === 200 ? "HTTP 200: la publicación existía y se mostraba." : "HTTP 404: el servidor informa que la publicación ya no existe."}
        </p>
      </div>
    </div>
  );
}

function VistaHar({ c }: { c: Captura }) {
  const filas = har(c);
  const total = Math.max(...filas.map((f) => f.hasta)) * 1.08;
  const dominio = (u: string) => new URL(u).hostname;
  const ruta = (u: string) => new URL(u).pathname;
  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[3.2rem_3.2rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3 border-b border-uc-linea pb-2 text-[0.75rem] font-semibold uppercase tracking-wider text-uc-niebla">
        <span>Pedido</span>
        <span>Resp.</span>
        <span>Dirección</span>
        <span>Cuándo (milisegundos desde el inicio)</span>
      </div>
      {filas.map((f, i) => (
        <div key={i} className="tf-sube grid grid-cols-[3.2rem_3.2rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-3" style={retraso(i * 0.12)}>
          <span className="uc-mono text-[0.8rem] text-uc-pizarra">{f.metodo}</span>
          <span className={cn("uc-mono w-fit rounded px-1.5 text-[0.8rem] font-bold text-white", f.estado >= 400 ? "bg-uc-lacre" : "bg-uc-verde")}>{f.estado}</span>
          <span className="min-w-0">
            <span className={cn("block truncate text-[0.82rem] font-semibold", dominio(f.url) === dominio(URL_CASO) ? "text-uc-tinta" : "text-uc-cian")}>{dominio(f.url)}</span>
            <span className="uc-mono block truncate text-[0.72rem] text-uc-pizarra">
              {ruta(f.url)} · {f.tipo} · {f.peso}
            </span>
          </span>
          <span className="relative h-5 rounded bg-uc-papel">
            <span
              className="absolute inset-y-0 rounded transition-all duration-700"
              style={{ left: `${(f.desde / total) * 100}%`, width: `${((f.hasta - f.desde) / total) * 100}%`, background: f.estado >= 400 ? C.lacre : f.tipo.startsWith("image") ? C.cian : C.verde }}
            />
            <span className="uc-mono absolute right-1 top-0 text-[0.65rem] leading-5 text-uc-pizarra">{f.hasta - f.desde} ms</span>
          </span>
        </div>
      ))}
      <p className="mt-2 rounded-xl bg-uc-hielo px-4 py-3 text-[0.98rem] leading-snug text-uc-azul">
        El HAR responde: <b>qué dirección se consultó</b>, <b>qué respondió el servidor</b>, <b>qué imágenes se pidieron</b>, <b>desde qué dominios</b> se sirvieron
        (en celeste, las de otro dominio) y <b>en qué momento</b> ocurrió cada operación.
      </p>
    </div>
  );
}

function VistaSello({ tipo, huella, c }: { tipo: "tsr" | "p7s"; huella: string; c: Captura }) {
  const pasos =
    tipo === "tsr"
      ? [
          { g: GlifoHuella, t: "Huella de los metadatos", v: `${huella.slice(0, 16)}…` },
          { g: GlifoInstitucion, t: "Autoridad de sello de tiempo", v: "agrega fecha y hora confiables" },
          { g: GlifoReloj, t: "Token firmado", v: `huella + ${c.utc.replace("T", " ").replace("Z", " UTC")}` },
        ]
      : [
          { g: GlifoDocumento, t: "Metadatos", v: "URL, fecha, huellas de cada archivo" },
          { g: GlifoLlave, t: "Clave privada del servicio", v: "firma el conjunto" },
          { g: GlifoCheck, t: "Verificable", v: "con el servicio indicado en el certificado" },
        ];
  return (
    <div className="grid h-full content-center gap-6">
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-3">
        {pasos.map((p, i) => [
          i > 0 && (
            <svg key={`f${i}`} viewBox="0 0 40 12" className="w-12" aria-hidden>
              <path d="M2 6 H36 M30 1 L37 6 L30 11" fill="none" stroke={C.cian} strokeWidth="1.8" className="uc-flujo" />
            </svg>
          ),
          <div key={p.t} className="tf-sube rounded-2xl border border-uc-linea bg-uc-hielo/60 p-4 text-center" style={retraso(i * 0.25)}>
            <p.g className="mx-auto size-10 text-uc-cian" />
            <p className="mt-2 text-[1.05rem] font-semibold text-uc-tinta">{p.t}</p>
            <p className="uc-mono mt-1 break-all text-[0.78rem] text-uc-pizarra">{p.v}</p>
          </div>,
        ])}
      </div>
      <p className="uc-serif text-center text-[1.35rem] leading-snug text-uc-azul">
        {tipo === "tsr"
          ? "La autoridad nunca recibió la página: solo su huella. Y sin embargo, puede acreditar que esos datos existían en ese momento."
          : "La firma se puede verificar con el servicio indicado en el propio certificado, sin volver a navegar la página."}
      </p>
    </div>
  );
}
