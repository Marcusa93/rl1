"use client";

// Kit del asistente en PDF — Laboratorio de IA · BBVA · Clase 2 (Marco Rossi).
// Portada con el logo del banco, el system prompt BORRADOR V0.1 del participante,
// qué subir como conocimiento, los casos de prueba, el control y las placas de la clase.
// Solo fuentes built-in (Helvetica / Courier): todo pasa por t() para quedar en WinAnsi.

import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { getArea } from "@/lib/bbva-clase";
import { armarBorrador, C2_TESIS, SLIDES_C2 } from "@/lib/bbva-clase2";

export interface DatosKit {
  nombre: string;
  area?: string; // AreaId o etiqueta del área
  respuestas: Record<string, Record<string, string | string[]>>;
  /** El borrador editado por el participante (si no, se genera). */
  borrador?: string;
}

const C = {
  papel: "#f2eee6",
  blanco: "#fbfaf7",
  tinta: "#17181b",
  grafito: "#45484f",
  gris: "#8a8d94",
  pizarra: "#5d7087",
  naranja: "#e2582b",
  linea: "#d6d0c4",
};

/** Lleva el texto a lo que Helvetica/Courier pueden dibujar. */
const t = (x: string) =>
  x
    .replace(/≠/g, "no es")
    .replace(/→/g, "›")
    .replace(/[⟳↻↗↓✓✗═]/g, "")
    .replace(/[^\x09\x0A\x0D\x20-\x7E -ÿ–—‘’“”…•›]/g, "");

const s = StyleSheet.create({
  page: { backgroundColor: C.blanco, paddingTop: 54, paddingBottom: 72, paddingHorizontal: 54, fontFamily: "Helvetica", fontSize: 10.5, color: C.tinta, lineHeight: 1.5 },
  papel: { backgroundColor: C.papel },
  kicker: { fontFamily: "Courier", fontSize: 8, color: C.naranja, letterSpacing: 1.2, textTransform: "uppercase" },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 22, lineHeight: 1.2, marginTop: 6 },
  regla: { height: 2, width: 44, backgroundColor: C.naranja, marginTop: 12, marginBottom: 18 },
  p: { fontSize: 10.5, lineHeight: 1.55, color: C.grafito },
  mono: { fontFamily: "Courier", fontSize: 8.6, lineHeight: 1.45, color: C.tinta },
  caja: { borderWidth: 1, borderColor: C.tinta, backgroundColor: C.papel, padding: 16 },
  check: { flexDirection: "row", marginBottom: 6 },
  cuadro: { width: 9, height: 9, borderWidth: 1, borderColor: C.tinta, marginTop: 2.5, marginRight: 9 },
  renglon: { borderBottomWidth: 0.7, borderBottomColor: C.linea, height: 20 },
  footer: { position: "absolute", bottom: 30, left: 54, right: 54, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.6, borderTopColor: C.linea, paddingTop: 6 },
  footerTxt: { fontFamily: "Courier", fontSize: 7.5, color: C.gris },
});

function Pie({ logo }: { logo: string | null }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerTxt}>{t("Laboratorio de IA · BBVA · Clase 2 · Docente: Marco Rossi")}</Text>
      {logo ? (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={logo} style={{ width: 38, height: 13 }} />
      ) : (
        <Text style={s.footerTxt} render={({ pageNumber }) => String(pageNumber)} />
      )}
    </View>
  );
}

function Cabeza({ kicker, titulo }: { kicker: string; titulo: string }) {
  return (
    <View>
      <Text style={s.kicker}>{t(kicker)}</Text>
      <Text style={s.h1}>{t(titulo)}</Text>
      <View style={s.regla} />
    </View>
  );
}

const FUENTE: Record<string, string> = {
  procedimientos: "Procedimientos",
  manuales: "Manuales",
  politicas: "Políticas",
  faqs: "Preguntas frecuentes",
  ejemplos: "Ejemplos resueltos",
  plantillas: "Plantillas",
  tecnica: "Documentación técnica",
  criterios: "Criterios de referencia",
  otros: "Otros documentos",
};

function KitDoc({ d, logo }: { d: DatosKit; logo: string | null }) {
  const nombre = d.nombre?.trim() || "Participante";
  const area = getArea(d.area)?.label ?? d.area;
  const sp = d.borrador?.trim() || armarBorrador({ resp: d.respuestas, area });
  const a4 = d.respuestas.bbva2_a4 ?? {};
  const fuentes = (Array.isArray(a4.fuentes) ? a4.fuentes : []).map((f) => FUENTE[f] ?? f);
  const fuentesTxt = typeof a4.txt_fuentes === "string" ? a4.txt_fuentes.trim() : "";
  const placas = SLIDES_C2.flatMap((x) => (x.t === "placa" || x.t === "curva" ? [{ n: x.numero, titulo: x.titulo, bajada: x.bajada }] : []));

  return (
    <Document title={t(`Kit del asistente · ${nombre}`)} author="Marco Rossi" subject="Laboratorio de IA · BBVA · Clase 2">
      {/* Portada */}
      <Page size="A4" style={[s.page, s.papel, { paddingTop: 60 }]}>
        {logo ? (
          <View style={{ backgroundColor: "#ffffff", alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 12 }}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={logo} style={{ width: 84, height: 29 }} />
          </View>
        ) : null}
        <View style={{ marginTop: 120 }}>
          <Text style={s.kicker}>{t("Laboratorio de IA · Clase 2")}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 36, lineHeight: 1.1, marginTop: 10 }}>{t("Del proceso al asistente")}</Text>
          <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 15, color: C.grafito, marginTop: 12 }}>{t(`${C2_TESIS}.`)}</Text>
          <View style={[s.regla, { marginTop: 24 }]} />
          <Text style={{ fontSize: 12, color: C.grafito }}>{t("Docente: Marco Rossi")}</Text>
          <Text style={{ fontSize: 12, color: C.grafito }}>{t("Viernes 2 de octubre de 2026")}</Text>
        </View>
        <View style={[s.caja, { marginTop: 70, backgroundColor: C.blanco }]}>
          <Text style={s.kicker}>{t("Kit del asistente de")}</Text>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 18, marginTop: 4 }}>{t(nombre)}</Text>
          {area ? <Text style={[s.p, { marginTop: 2 }]}>{t(area)}</Text> : null}
          <Text style={[s.p, { marginTop: 10, fontSize: 9.5 }]}>
            {t("Adentro: tu system prompt BORRADOR V0.1, los documentos para subir, tres casos de prueba, el control y las placas de la clase.")}
          </Text>
        </View>
        <Pie logo={logo} />
      </Page>

      {/* System prompt */}
      <Page size="A4" style={s.page}>
        <Cabeza kicker="1 · Tu system prompt" titulo="Borrador V0.1" />
        <Text style={[s.p, { marginBottom: 12 }]}>
          {t("Pegalo en Gemini › Gems › Nueva Gem › Instrucciones. No es el prompt perfecto: es una primera hipótesis para probar y corregir.")}
        </Text>
        <View style={s.caja}>
          <Text style={s.mono}>{t(sp)}</Text>
        </View>
        <Pie logo={logo} />
      </Page>

      {/* Conocimiento, pruebas y control */}
      <Page size="A4" style={s.page}>
        <Cabeza kicker="2 · Conocimiento" titulo="Los documentos para subir" />
        {(fuentes.length ? fuentes : ["[qué documentos necesita]"]).map((f) => (
          <View key={f} style={s.check}>
            <View style={s.cuadro} />
            <Text style={s.p}>{t(f)}</Text>
          </View>
        ))}
        {fuentesTxt ? <Text style={[s.p, { marginTop: 4 }]}>{t(`Concretamente: ${fuentesTxt}`)}</Text> : null}
        <Text style={[s.p, { marginTop: 8, fontSize: 9.5, color: C.gris }]}>
          {t("Antes de subir: versión vigente, nombre claro, una cosa por archivo. Acotar fuentes también es diseñar.")}
        </Text>

        <View style={{ marginTop: 26 }}>
          <Cabeza kicker="3 · Rompelo" titulo="No pruebes si funciona. Buscá dónde falla." />
          {[
            ["Caso normal", "un ejemplo típico"],
            ["Caso incompleto", "le falta información necesaria"],
            ["Caso difícil", "una excepción o ambigüedad donde debería detenerse"],
          ].map(([k, v]) => (
            <View key={k} style={{ marginBottom: 12 }} wrap={false}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>
                {t(k)} <Text style={{ fontFamily: "Helvetica-Oblique", color: C.gris }}>{t(`(${v})`)}</Text>
              </Text>
              <View style={s.renglon} />
              <View style={s.renglon} />
            </View>
          ))}
        </View>

        <View style={{ marginTop: 14 }} wrap={false}>
          <Cabeza kicker="4 · Control" titulo="Después de cada prueba" />
          {[
            "¿Siguió el método?",
            "¿Usó la información correcta?",
            "¿Inventó algo?",
            "¿Respetó los límites?",
            "¿Pidió datos cuando correspondía?",
            "¿Produjo la salida esperada?",
          ].map((q) => (
            <View key={q} style={s.check}>
              <View style={s.cuadro} />
              <Text style={s.p}>{t(q)}</Text>
            </View>
          ))}
          <Text style={[s.p, { marginTop: 8 }]}>
            {t("Cada falla es una instrucción que falta: volvé a la decisión de diseño (método, conocimiento, límites o salida), corregí y volvé a probar.")}
          </Text>
        </View>
        <Pie logo={logo} />
      </Page>

      {/* Las placas */}
      <Page size="A4" style={s.page}>
        <Cabeza kicker="5 · La clase" titulo="Las 30 placas" />
        {placas.map((p) => (
          <View key={p.n} style={{ flexDirection: "row", marginBottom: 7 }} wrap={false}>
            <Text style={{ width: 26, fontFamily: "Courier", fontSize: 9, color: C.naranja, paddingTop: 1 }}>{String(p.n).padStart(2, "0")}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5 }}>{t(p.titulo)}</Text>
              <Text style={[s.p, { fontSize: 9.5 }]}>{t(p.bajada)}</Text>
            </View>
          </View>
        ))}
        <View style={[s.caja, { marginTop: 14 }]} wrap={false}>
          <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 12 }}>{t("Un asistente no se encuentra. Se diseña, se prueba y se corrige.")}</Text>
          <Text style={[s.p, { marginTop: 4 }]}>
            {t("Proceso › tarea › método › instrucciones › contexto › conocimiento › límites › salida › prueba › corrección › asistente V0.1")}
          </Text>
        </View>
        <Pie logo={logo} />
      </Page>
    </Document>
  );
}

async function cargarLogo(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch(`${window.location.origin}/bbva/logo-bbva.png`);
    if (!res.ok) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return `data:image/png;base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

let silabeo = false;

export async function buildKitBlob(d: DatosKit): Promise<Blob> {
  if (!silabeo) {
    Font.registerHyphenationCallback((w) => [w]);
    silabeo = true;
  }
  const logo = await cargarLogo();
  return pdf(<KitDoc d={d} logo={logo} />).toBlob();
}
