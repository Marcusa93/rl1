"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
  Circle,
  pdf,
} from "@react-pdf/renderer";
import {
  COM_MATERIA,
  COM_SUBTITLE,
  COM_TITLE,
  GLOSARIO,
  GLOSARIO_CIERRE,
} from "@/lib/comercial";

const C = {
  ink: "#140d39",
  teal: "#0d9488",
  tealLight: "#5eead4",
  violet: "#7c3aed",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
  soft: "#f8fafc",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingBottom: 46, fontSize: 11, color: C.text },
  band: {
    backgroundColor: C.ink,
    paddingHorizontal: 28,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandName: { color: C.tealLight, fontSize: 20, fontWeight: 700, marginLeft: 8 },
  brandSub: { color: "#b9aee8", fontSize: 8.5, marginLeft: 8 },
  meta: { textAlign: "right" },
  metaTitle: { color: "#ffffff", fontSize: 12, fontWeight: 700 },
  metaDate: { color: "#b9aee8", fontSize: 8.5 },
  body: { paddingHorizontal: 28, paddingTop: 16 },
  title: { fontSize: 19, fontWeight: 700, color: C.ink, marginBottom: 2 },
  subtitle: { fontSize: 10, color: C.muted, marginBottom: 4, lineHeight: 1.45 },
  intro: { fontSize: 9.5, color: C.muted, lineHeight: 1.5, marginBottom: 14 },
  blockHead: {
    borderLeftWidth: 3,
    borderLeftColor: C.violet,
    paddingLeft: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  h2: { fontSize: 12.5, fontWeight: 700, color: C.ink },
  h2sub: { fontSize: 9, color: C.muted, marginTop: 1 },
  item: { marginBottom: 9 },
  term: { fontSize: 10.5, fontWeight: 700, color: C.teal, marginBottom: 1.5 },
  def: { fontSize: 9.8, color: C.text, lineHeight: 1.5 },
  ex: { fontSize: 9, color: C.muted, lineHeight: 1.45, marginTop: 1.5, fontStyle: "italic" },
  closing: {
    backgroundColor: C.soft,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 8,
    padding: 11,
    marginTop: 8,
  },
  closingTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: C.violet,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  bullet: { flexDirection: "row", marginBottom: 3.5 },
  dot: { color: C.teal, marginRight: 6, fontSize: 9.5 },
  bulletText: { fontSize: 9.5, color: C.text, lineHeight: 1.45, flex: 1 },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 6,
  },
  footerText: { fontSize: 8, color: C.muted },
});

function Cube() {
  return (
    <Svg width={24} height={24} viewBox="0 0 64 64">
      <Path d="M32 8 L54 20 L54 44 L32 56 L10 44 L10 20 Z" stroke={C.tealLight} strokeWidth={2.4} />
      <Path d="M32 8 L32 32 M10 20 L32 32 L54 20" stroke={C.tealLight} strokeWidth={1.6} />
      <Circle cx={32} cy={26} r={4} fill={C.tealLight} />
      <Path d="M32 31 L32 47 M24 36 L32 33 L40 36" stroke={C.tealLight} strokeWidth={2.2} />
    </Svg>
  );
}

export function GlosarioDoc({ date }: { date: string }) {
  return (
    <Document title={`Glosario · ${COM_TITLE}`}>
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed>
          <View style={s.brand}>
            <Cube />
            <Text style={s.brandName}>RL1</Text>
            <Text style={s.brandSub}>{COM_TITLE}</Text>
          </View>
          <View style={s.meta}>
            <Text style={s.metaTitle}>Glosario</Text>
            <Text style={s.metaDate}>{date}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.title}>Glosario: {COM_TITLE}</Text>
          <Text style={s.subtitle}>{COM_SUBTITLE}</Text>
          <Text style={s.intro}>
            {COM_MATERIA}. Los conceptos que trabajamos en clase, definidos en criollo, para tenerlos a
            mano cuando aparezcan en la materia. Las definiciones son descriptivas: buscan que entiendas
            de qué se habla, no reemplazan la bibliografía ni el texto normativo.
          </Text>

          {GLOSARIO.map((bloque) => (
            <View key={bloque.titulo}>
              <View style={s.blockHead} wrap={false}>
                <Text style={s.h2}>{bloque.titulo}</Text>
                <Text style={s.h2sub}>{bloque.bajada}</Text>
              </View>
              {bloque.terminos.map((t) => (
                <View key={t.termino} style={s.item} wrap={false}>
                  <Text style={s.term}>{t.termino}</Text>
                  <Text style={s.def}>{t.definicion}</Text>
                  {t.enLaEmpresa ? <Text style={s.ex}>En la empresa: {t.enLaEmpresa}</Text> : null}
                </View>
              ))}
            </View>
          ))}

          <View style={s.closing} wrap={false}>
            <Text style={s.closingTitle}>Para llevarse</Text>
            {GLOSARIO_CIERRE.map((t, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.dot}>•</Text>
                <Text style={s.bulletText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>RL1 · {COM_TITLE}</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `${pageNumber}/${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export async function buildGlosarioBlob(date: string): Promise<Blob> {
  return pdf(<GlosarioDoc date={date} />).toBlob();
}
