"use client";

// Cuerpos de las placas 1 a 13 de /unca (bloques I y II). Cada parte que
// aparece de a una con → va envuelta en <Unidad i={n}> (revelado paso a paso);
// la cantidad de partes está en lib/unca-clase.ts (campo `pasos`).

import { useEffect, useState } from "react";
import { Unidad, useRevelado } from "@/components/tribunal/revelado";
import { CertificadoLinea, Cesar } from "@/components/unca/labs";
import { BloqueActividad, EnlaceChip } from "@/components/unca/marco";
import {
  C,
  DocumentoSimulado,
  Garabato,
  GlifoCandado,
  GlifoCheck,
  GlifoDocumento,
  GlifoHuella,
  GlifoInstitucion,
  GlifoLlave,
  GlifoPersona,
  GlifoPregunta,
  Hex,
  QrDecorativo,
  retraso,
  SelloLacre,
} from "@/components/unca/piezas";
import { Barras, Clasificacion, Nube, useDatos, useVivo } from "@/components/unca/resultados";
import { sha256 } from "@/lib/unca-cripto";
import { getUcActividad, type UcPlaca } from "@/lib/unca-clase";
import { cn } from "@/lib/utils";

type P = { placa: UcPlaca };

// 01 · ¿En quién confiamos? — la nube de la sala
function Confianza({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  return (
    <div className="grid flex-1 grid-cols-[0.62fr_1.38fr] gap-8">
      <div className="flex flex-col justify-between gap-6">
        <div className="tf-sube" style={retraso(0.15)}>
          <SelloLacre className="size-24" letra="?" />
          <p className="uc-serif mt-6 text-[1.95rem] leading-snug text-uc-tinta">
            Cuando recibís un documento jurídico, <span className="text-uc-verde">¿qué elemento te genera más confianza?</span>
          </p>
          <p className="mt-3 text-[1.15rem] text-uc-pizarra">Hasta tres palabras, desde tu dispositivo.</p>
        </div>
        <EnlaceChip />
      </div>
      <div className="uc-hoja flex flex-col rounded-[1.5rem] border border-uc-linea p-6">
        <BloqueActividad act={act}>{(d) => <Nube act={act} datos={d} alto={19} />}</BloqueActividad>
      </div>
    </div>
  );
}

// 02 · La confianza también tiene historia
const HITOS = [
  { anio: "c. 3500 a. C.", t: "Sellos cilíndricos", v: "Identificar al autor y cerrar el envío", g: "sello" },
  { anio: "1503", t: "Protocolo notarial", v: "La Pragmática de Alcalá obliga a conservar las matrices", g: "libro" },
  { anio: "1976–77", t: "Clave pública", v: "Diffie, Hellman y RSA: firmar sin compartir el secreto", g: "llave" },
  { anio: "2001", t: "Ley 25.506", v: "Firma digital en la Argentina", g: "ley" },
  { anio: "2015", t: "CCyCN, art. 288", v: "La firma digital satisface el requisito de firma", g: "ley" },
  { anio: "Hoy", t: "IA generativa", v: "Imágenes, voces y documentos verosímiles", g: "ia" },
];

function IconoHito({ g }: { g: string }) {
  if (g === "sello") return <SelloLacre className="size-14" letra="S" />;
  if (g === "llave") return <GlifoLlave className="size-12 text-uc-cian" />;
  if (g === "ia") return <GlifoPregunta className="size-12 text-uc-lacre" />;
  if (g === "libro")
    return (
      <svg viewBox="0 0 48 48" className="size-12 text-uc-verde">
        <path d="M6 10 c8 -3 14 -1 18 3 c4 -4 10 -6 18 -3 v28 c-8 -3 -14 -1 -18 3 c-4 -4 -10 -6 -18 -3z M24 13 v28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    );
  return <GlifoInstitucion className="size-12 text-uc-azul" />;
}

function Historia() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="relative">
        <span className="absolute left-0 right-0 top-[4.2rem] h-[3px] rounded-full bg-gradient-to-r from-[#a3392a] via-[#2c5a4b] to-[#1f7891] opacity-60" />
        <div className="relative grid grid-cols-6 gap-4">
          {HITOS.map((h, i) => (
            <Unidad key={h.anio} i={i} label={`${h.anio} · ${h.t}`} className="flex flex-col items-center text-center">
              <div className="flex h-[5.5rem] items-end justify-center pb-3">
                <IconoHito g={h.g} />
              </div>
              <span className={cn("relative z-10 size-4 rounded-full border-[3px] border-uc-papel", i < 2 ? "bg-uc-lacre" : i < 5 ? "bg-uc-verde" : "bg-uc-cian")} />
              <p className="uc-serif mt-4 text-[1.7rem] leading-none text-uc-tinta">{h.anio}</p>
              <p className="mt-2 text-[1.12rem] font-semibold leading-tight text-uc-azul">{h.t}</p>
              <p className="mt-1.5 text-[1rem] leading-snug text-uc-pizarra">{h.v}</p>
            </Unidad>
          ))}
        </div>
      </div>
      <p className="uc-serif mt-14 text-center text-[1.6rem] italic text-uc-verde">Identificar autores · detectar alteraciones · preservar evidencias</p>
    </div>
  );
}

// 03 · El papel nos daba pistas
function Papel() {
  const papel = ["Soporte y tinta", "Firma manuscrita", "Sellos y membretes", "Protocolo y matriz"];
  const digital = ["Datos y metadatos", "Huella criptográfica", "Firma digital y certificado", "Sello de tiempo y registros"];
  return (
    <div className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-2 gap-8">
        <Unidad i={0} label="El papel" className="uc-hoja relative overflow-hidden rounded-[1.5rem] border border-uc-linea p-7">
          <p className="uc-rotulo text-uc-lacre">El papel</p>
          <ul className="mt-5 grid gap-4">
            {papel.map((x) => (
              <li key={x} className="flex items-center gap-4 text-[1.5rem] text-uc-tinta">
                <span className="size-2.5 rounded-full bg-uc-lacre" />
                {x}
              </li>
            ))}
          </ul>
          <Garabato className="absolute bottom-6 right-6 w-48 opacity-80" />
          <SelloLacre className="absolute bottom-16 right-48 size-16 opacity-90" letra="E" />
        </Unidad>
        <Unidad i={1} label="Lo digital" className="uc-frio relative overflow-hidden rounded-[1.5rem] border border-uc-cian/25 p-7">
          <p className="uc-rotulo text-uc-cian">Lo digital</p>
          <ul className="mt-5 grid gap-4">
            {digital.map((x) => (
              <li key={x} className="flex items-center gap-4 text-[1.5rem] text-uc-tinta">
                <span className="size-2.5 rounded-sm bg-uc-cian" />
                {x}
              </li>
            ))}
          </ul>
          <p className="uc-mono absolute bottom-5 right-6 text-right text-[0.85rem] leading-tight text-uc-cian/70">
            9f2c41ab7e0d38c5
            <br />
            1b6a94f2e07d5c13
          </p>
        </Unidad>
      </div>
      <Unidad as="p" i={2} label="Ninguno es infalible" className="uc-serif mt-7 border-l-[0.35rem] border-uc-verde pl-6 text-[1.9rem] leading-snug text-uc-azul">
        Ninguno es infalible: cambian las pistas, no el problema.
      </Unidad>
    </div>
  );
}

// 04 · Tres documentos, una decisión
function DocMini({ tipo }: { tipo: "a" | "b" | "c" }) {
  return (
    <DocumentoSimulado filas={7} className="h-full px-5 py-5">
      <div className="mt-4 flex items-end justify-between">
        {tipo === "a" && <Garabato className="w-32" />}
        {tipo === "b" && (
          <div className="flex items-center gap-2 rounded-lg border border-uc-verde/40 bg-uc-salvia-claro px-2.5 py-1.5">
            <GlifoCheck className="size-6 shrink-0 text-uc-verde" />
            <span className="text-[0.72rem] leading-tight text-uc-verde">
              Firmado digitalmente
              <br />
              certificado verificable
            </span>
          </div>
        )}
        {tipo === "c" && <QrDecorativo className="size-16" semilla={11} />}
        <span className="uc-renglon h-2 w-16 bg-uc-azul/30" />
      </div>
    </DocumentoSimulado>
  );
}

function TresDocs({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  const datos = useDatos(act);
  const { vista } = useVivo();
  const counts = (datos?.summary.counts as Record<string, number>) ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const max = Math.max(1, ...Object.values(counts));
  return (
    <BloqueActividad act={act}>
      {() => (
        <div className="grid flex-1 grid-cols-4 gap-5">
          {(act.opciones ?? []).map((o, i) => {
            const n = counts[o.id] ?? 0;
            const p = total ? Math.round((n / total) * 100) : 0;
            return (
              <div key={o.id} className="tf-sube flex flex-col gap-3" style={retraso(0.1 + i * 0.1)}>
                <div className="relative h-[14.5rem]">
                  {o.id === "d" ? (
                    <div className="flex h-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-uc-linea bg-uc-hoja/50">
                      <GlifoPregunta className="size-16 text-uc-ocre" />
                      <span className="text-center text-[1rem] text-uc-pizarra">Otras verificaciones</span>
                    </div>
                  ) : (
                    <DocMini tipo={o.id as "a" | "b" | "c"} />
                  )}
                  <span className="uc-serif absolute -left-3 -top-3 flex size-11 items-center justify-center rounded-full bg-uc-tinta text-[1.4rem] text-white">{o.id.toUpperCase()}</span>
                </div>
                <p className="min-h-[3rem] text-[1.02rem] leading-snug text-uc-tinta">{o.label.replace(/^[A-D] · /, "")}</p>
                {vista(act).mostrar && (
                  <div>
                    <div className="h-4 overflow-hidden rounded-full bg-uc-linea/60">
                      <div className="h-full rounded-full bg-uc-cian transition-all duration-700" style={{ width: `${(n / max) * 100}%` }} />
                    </div>
                    <p className="mt-1.5 tabular-nums">
                      <b className="uc-serif text-[1.8rem] text-uc-tinta">{p}%</b> <span className="text-[0.95rem] text-uc-niebla">· {n}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </BloqueActividad>
  );
}

// 05 · Un documento es mucho más que lo que vemos: la radiografía del archivo
const RAYOS = [
  { l: "%PDF-1.7", nota: "" },
  { l: "/Producer (Sistema de gestión judicial)", nota: "" },
  { l: "/CreationDate (D:20260612103512-03'00')", nota: "metadatos" },
  { l: "/Im1 << /Subtype /Image /Width 420 /Height 130 >>", nota: "el garabato: una imagen" },
  { l: "/Sig << /Filter /Adobe.PPKLite /SubFilter /ETSI.CAdES.detached", nota: "" },
  { l: "   /ByteRange [0 81942 101944 6402]", nota: "qué bytes cubre la firma" },
  { l: "   /Contents <30820b4f06092a864886f70d0107…>", nota: "la firma criptográfica" },
  { l: "   /Cert  CN=Juez Ejemplo · Certificador licenciado", nota: "el certificado" },
  { l: "%%EOF", nota: "" },
];

function RayosX() {
  const { visibles } = useRevelado();
  const radiografia = visibles > 0;
  return (
    <div className="grid flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-12">
      <div className="tf-sube relative" style={retraso(0.1)}>
        <DocumentoSimulado filas={11} className="px-7 py-7">
          <p className="uc-serif absolute left-7 top-5 text-[1.05rem] text-uc-azul">SENTENCIA N.º 1234/2026 (ficticia)</p>
          <div className="mt-5 flex justify-end">
            <Garabato className={cn("w-40 transition", radiografia && "rounded-md outline outline-2 outline-offset-4 outline-uc-ocre")} />
          </div>
        </DocumentoSimulado>
        {radiografia && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            <span className="uc-escaneo absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-[#1f7891]/25 to-transparent" />
          </div>
        )}
        <p className="mt-4 text-center text-[1.05rem] text-uc-pizarra">Lo que muestra la pantalla</p>
      </div>
      <Unidad i={0} label="Por dentro del archivo" className="rounded-[1.5rem] bg-uc-tinta p-6 text-[#cfe3e8] shadow-xl">
        <p className="uc-rotulo text-[0.65rem] text-[#8fd3d8]">Por dentro del archivo (simplificado)</p>
        <div className="mt-3 grid gap-1">
          {RAYOS.map((r, i) => {
            const marcada = visibles > 1 && (r.l.includes("/Im1") || r.l.includes("/Contents"));
            return (
              <div key={i} className="grid grid-cols-[1fr_auto] items-center gap-4">
                <span
                  className={cn(
                    "uc-mono tf-sube truncate rounded px-1.5 text-[0.95rem] leading-relaxed",
                    marcada && r.l.includes("/Im1") && "bg-[#b07a1f]/30 text-[#f3e5c6]",
                    marcada && r.l.includes("/Contents") && "bg-[#2c5a4b]/60 text-white",
                  )}
                  style={retraso(i * 0.08)}
                >
                  {r.l}
                </span>
                {visibles > 1 && r.nota && <span className="tf-sube text-[0.85rem] italic text-[#8fd3d8]">← {r.nota}</span>}
              </div>
            );
          })}
        </div>
      </Unidad>
      <Unidad as="p" i={1} label="La firma que se ve no es la que se verifica" className="uc-serif col-span-2 -mt-4 text-center text-[1.6rem] text-uc-azul">
        La firma que se ve es una imagen. La que se verifica está en otra parte del archivo.
      </Unidad>
    </div>
  );
}

// 06 · ¿Y si pudiéramos detectar cualquier cambio? (giro)
function GiroHuella() {
  const [h, setH] = useState("");
  useEffect(() => {
    sha256("¿Y si pudiéramos detectar cualquier cambio?").then(setH);
  }, []);
  return (
    <div className="grid flex-1 grid-cols-[auto_1fr] items-center gap-14">
      <div className="tf-sube relative flex size-[17rem] items-center justify-center rounded-full bg-uc-hielo" style={retraso(0.2)}>
        <GlifoHuella className="size-40 text-uc-cian" />
      </div>
      <div className="tf-sube" style={retraso(0.35)}>
        <p className="uc-rotulo text-uc-cian">Una huella de los datos</p>
        <Hex valor={h} grande className="mt-3 text-[1.7rem] text-uc-tinta" />
        <p className="uc-serif mt-8 text-[2rem] leading-snug text-uc-azul">Mirar no alcanza. ¿Podemos calcular una identificación matemática que delate cualquier modificación?</p>
      </div>
    </div>
  );
}

// 07 · Cifrado César
function PlacaCesar() {
  return (
    <div className="flex flex-1 flex-col justify-center">
      <Cesar />
      <p className="mt-8 text-center text-[1.2rem] text-uc-pizarra">
        Clásica: <b className="text-uc-tinta">secreto</b>. Moderna: también <b className="text-uc-verde">integridad</b>, <b className="text-uc-verde">autenticación</b> y{" "}
        <b className="text-uc-verde">firma</b>.
      </p>
    </div>
  );
}

// 08 · Una llave que todos conocen: firmar y cifrar
function DosLlaves() {
  const [modo, setModo] = useState<"firmar" | "cifrar">("firmar");
  const firmar = modo === "firmar";
  const Persona = ({ nombre, lado }: { nombre: string; lado: "izq" | "der" }) => {
    const usaPrivada = firmar ? lado === "izq" : lado === "der";
    return (
      <div className="uc-hoja flex flex-col items-center gap-3 rounded-[1.5rem] border border-uc-linea px-6 py-6">
        <GlifoPersona className="size-14 text-uc-azul" />
        <p className="uc-serif text-[1.6rem] text-uc-tinta">{nombre}</p>
        <div className="grid w-full gap-2">
          <span className={cn("flex items-center gap-2 rounded-xl border px-3 py-2 text-[1rem] transition", usaPrivada ? "border-uc-lacre bg-uc-lacre-claro font-semibold text-uc-lacre" : "border-uc-linea text-uc-niebla")}>
            <GlifoLlave className="size-6" /> Su clave privada
          </span>
          <span className="flex items-center gap-2 rounded-xl border border-uc-linea px-3 py-2 text-[1rem] text-uc-niebla">
            <GlifoCandado className="size-6" abierto /> Su clave pública
          </span>
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex justify-center gap-2">
        {(["firmar", "cifrar"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setModo(m)}
            className={cn("rounded-full border px-6 py-2 text-[1.15rem] font-semibold transition", modo === m ? "border-uc-tinta bg-uc-tinta text-white" : "border-uc-linea bg-uc-hoja text-uc-pizarra")}
          >
            {m === "firmar" ? "Firmar · autenticidad" : "Cifrar · secreto"}
          </button>
        ))}
      </div>
      <div className="grid flex-1 grid-cols-[1fr_1.5fr_1fr] items-center gap-6">
        <Persona nombre="Quien envía" lado="izq" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="relative h-24 w-full">
            <span className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-uc-linea" />
            <span key={modo} className="uc-viaja top-1/2 -translate-y-1/2">
              <span className="relative block">
                <GlifoDocumento className="size-16 text-uc-tinta" />
                {firmar ? (
                  <SelloLacre className="absolute -bottom-2 -right-3 size-9" letra="F" />
                ) : (
                  <GlifoCandado className="absolute -bottom-2 -right-3 size-9 rounded-md bg-uc-hielo text-uc-cian" />
                )}
              </span>
            </span>
          </div>
          <div key={`t${modo}`} className="tf-sube rounded-2xl border border-uc-linea bg-uc-hoja px-6 py-5 text-center">
            {firmar ? (
              <p className="text-[1.3rem] leading-snug text-uc-tinta">
                Se firma con la <b className="text-uc-lacre">clave privada de quien envía</b>.<br />
                Cualquiera verifica con <b className="text-uc-cian">su clave pública</b>.
              </p>
            ) : (
              <p className="text-[1.3rem] leading-snug text-uc-tinta">
                Se cierra con la <b className="text-uc-cian">clave pública de quien recibe</b>.<br />
                Solo abre <b className="text-uc-lacre">su clave privada</b>.
              </p>
            )}
          </div>
        </div>
        <Persona nombre="Quien recibe" lado="der" />
      </div>
      <p className="uc-serif text-center text-[1.45rem] text-uc-azul">
        Como el lacre: solo el titular tiene el sello; todos pueden comparar la impronta. Las dos claves no cumplen la misma función.
      </p>
    </div>
  );
}

// 09 · La clave privada no se comparte
function ClavePrivada() {
  const riesgos = [
    { t: "Pérdida", v: "El token se rompe o se extravía", c: "text-uc-ocre" },
    { t: "Divulgación", v: "El PIN anotado, compartido o filtrado", c: "text-uc-lacre" },
    { t: "Uso indebido", v: "Otra persona firma «por» el titular", c: "text-uc-lacre" },
  ];
  return (
    <div className="grid flex-1 grid-cols-[0.8fr_1.2fr] items-center gap-12">
      <div className="tf-sube relative flex flex-col items-center" style={retraso(0.1)}>
        {/* Token criptográfico con su PIN */}
        <div className="relative h-[13rem] w-[22rem] rounded-[1.75rem] bg-gradient-to-br from-[#34536b] to-[#1d2629] p-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <span className="uc-rotulo text-[0.6rem] text-[#8fd3d8]">Dispositivo criptográfico</span>
            <span className="h-8 w-11 rounded-md bg-gradient-to-br from-[#e3c27a] to-[#b07a1f]" />
          </div>
          <GlifoLlave className="mt-6 size-16 text-white/90" />
          <p className="uc-mono absolute bottom-5 right-6 text-[1.4rem] tracking-[0.4em] text-white/80">••••</p>
        </div>
        <p className="mt-5 text-center text-[1.1rem] text-uc-pizarra">Token, tarjeta o firma remota con PIN: la clave privada no se copia ni se presta.</p>
      </div>
      <div className="grid gap-5">
        {riesgos.map((r, i) => (
          <Unidad key={r.t} i={i} label={r.t} className="flex items-baseline gap-5 border-b border-uc-linea pb-4">
            <span className={cn("uc-titular w-[13rem] shrink-0 text-[2.2rem]", r.c)}>{r.t}</span>
            <span className="text-[1.4rem] text-uc-tinta">{r.v}</span>
          </Unidad>
        ))}
        <Unidad i={3} label="Clave y persona" className="mt-2 flex items-center gap-5 rounded-2xl border border-uc-ocre/40 bg-uc-ocre-claro px-6 py-5">
          <GlifoLlave className="size-11 shrink-0 text-uc-tinta" />
          <svg viewBox="0 0 80 12" className="w-20 shrink-0" aria-hidden>
            <path d="M2 6 H78" stroke={C.ocre} strokeWidth="2.5" strokeDasharray="5 5" />
          </svg>
          <GlifoPersona className="size-11 shrink-0 text-uc-tinta" />
          <p className="uc-serif text-[1.45rem] leading-snug text-uc-tinta">La firma prueba que se usó la clave. ¿Quién la usó realmente? Esa es otra pregunta.</p>
        </Unidad>
      </div>
    </div>
  );
}

// 10 · La huella que revela las modificaciones (+ intervención 3)
function Huella({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  const [h1, setH1] = useState("");
  const [h2, setH2] = useState("");
  useEffect(() => {
    sha256("Canon mensual: $ 850.000").then(setH1);
    sha256("Canon mensual: $ 860.000").then(setH2);
  }, []);
  return (
    <div className="grid flex-1 grid-cols-[0.85fr_1.15fr] gap-8">
      <div className="uc-frio flex flex-col justify-center gap-4 rounded-[1.5rem] border border-uc-cian/25 p-6">
        {[
          { t: "Canon mensual: $ 850.000", h: h1 },
          { t: "Canon mensual: $ 860.000", h: h2 },
        ].map((x, i) => (
          <div key={i} className="tf-sube grid grid-cols-[auto_auto_1fr] items-center gap-3" style={retraso(0.2 + i * 0.25)}>
            <span className="rounded-lg border border-uc-linea bg-uc-hoja px-3 py-2 text-[1rem] text-uc-tinta">
              {x.t.split(/(\d{3}\.000)/).map((p, j) => (
                <span key={j} className={cn(/\d{3}\.000/.test(p) && "font-semibold text-uc-lacre")}>
                  {p}
                </span>
              ))}
            </span>
            <span className="uc-rotulo text-[0.55rem] text-uc-cian">SHA-256 →</span>
            <Hex valor={x.h.slice(0, 32)} contra={(i ? h1 : h2).slice(0, 32)} className="text-[0.95rem] text-uc-tinta" />
          </div>
        ))}
        <p className="mt-2 text-[1.08rem] leading-snug text-uc-azul">
          Longitud fija, siempre igual para los mismos datos. <b>No impide modificar</b>: permite <b>detectar</b> cambios contra una referencia confiable.
        </p>
        <p className="text-[0.85rem] text-uc-niebla">(huellas parciales: 32 de 64 caracteres)</p>
      </div>
      <BloqueActividad act={act}>{(d) => <Barras act={act} datos={d} />}</BloqueActividad>
    </div>
  );
}

// 11 · Firmar sin lapicera: el procedimiento en dos carriles
const TONO_NODO = { azul: "border-uc-azul/30", lacre: "border-uc-lacre/40 bg-uc-lacre-claro/50", cian: "border-uc-cian/40 bg-uc-hielo", verde: "border-uc-verde/40 bg-uc-salvia-claro" };

function Nodo({ i, g, t, v, tono = "azul" }: { i: number; g: React.ReactNode; t: string; v: string; tono?: keyof typeof TONO_NODO }) {
  return (
    <Unidad i={i} label={t} className={cn("flex items-center gap-3 rounded-2xl border bg-uc-hoja px-4 py-3", TONO_NODO[tono])}>
      <span className="shrink-0">{g}</span>
      <span>
        <span className="block text-[1.12rem] font-semibold leading-tight text-uc-tinta">{t}</span>
        <span className="block text-[0.92rem] leading-snug text-uc-pizarra">{v}</span>
      </span>
    </Unidad>
  );
}

function Flecha({ i }: { i: number }) {
  return (
    <Unidad as="span" i={i} className="self-center text-center text-[1.8rem] text-uc-niebla">
      →
    </Unidad>
  );
}

function FirmaFlujo() {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6">
      <p className="uc-rotulo text-uc-lacre">Quien firma</p>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
        <Nodo i={0} g={<GlifoDocumento className="size-10 text-uc-azul" />} t="1 · Documento" v="Se calcula su huella (SHA-256)" />
        <Flecha i={1} />
        <Nodo i={1} g={<GlifoLlave className="size-10 text-uc-lacre" />} t="2 · Clave privada" v="Firma esa huella" tono="lacre" />
        <Flecha i={2} />
        <Nodo i={2} g={<SelloLacre className="size-10" letra="F" />} t="3 · Viajan juntos" v="Documento + firma + certificado" />
      </div>
      <Unidad as="div" i={3} className="h-px bg-gradient-to-r from-transparent via-[#949c9c] to-transparent" />
      <p className="uc-rotulo text-uc-cian">Quien recibe</p>
      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-3">
        <Nodo i={3} g={<GlifoHuella className="size-10 text-uc-cian" />} t="4 · Recalcula la huella" v="Del documento que recibió" tono="cian" />
        <Flecha i={3} />
        <Nodo i={3} g={<GlifoCandado className="size-10 text-uc-cian" abierto />} t="Verifica la firma" v="Con la clave pública del certificado" tono="cian" />
        <Flecha i={4} />
        <Nodo i={4} g={<GlifoCheck className="size-10 text-uc-verde" />} t="5 · ¿Coinciden?" v="Sí: no cambió y la firmó esa clave" tono="verde" />
      </div>
      <Unidad as="p" i={4} label="Arts. 7 y 8" className="uc-serif mt-2 border-l-[0.35rem] border-uc-verde pl-6 text-[1.5rem] leading-snug text-uc-azul">
        Ley 25.506: se presume, salvo prueba en contrario, que la firma pertenece al titular del certificado (art. 7) y que el documento no fue modificado desde la firma (art. 8).
      </Unidad>
    </div>
  );
}

// 12 · Una firma también tiene una historia
function Certificado() {
  const { visibles } = useRevelado();
  return (
    <div className="flex flex-1 flex-col justify-center">
      <CertificadoLinea verLinea={visibles > 0} />
    </div>
  );
}

// 13 · ¿Qué acaba de demostrar la matemática? (giro + intervención 4)
function GiroFirma({ placa }: P) {
  const act = getUcActividad(placa.activa ?? "")!;
  return <BloqueActividad act={act}>{(d) => <Clasificacion act={act} datos={d} />}</BloqueActividad>;
}

export const CUERPOS_A = {
  confianza: Confianza,
  historia: Historia,
  papel: Papel,
  "tres-docs": TresDocs,
  "rayos-x": RayosX,
  "giro-huella": GiroHuella,
  cesar: PlacaCesar,
  "dos-llaves": DosLlaves,
  "clave-privada": ClavePrivada,
  huella: Huella,
  "firma-flujo": FirmaFlujo,
  certificado: Certificado,
  "giro-firma": GiroFirma,
} as const;
