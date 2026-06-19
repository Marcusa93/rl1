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
  CASOS,
  FICHA_CAMPOS,
  ROLES,
  getCaso,
  type ExpedienteState,
} from "@/lib/expediente";

const C = {
  ink: "#140d39",
  teal: "#0d9488",
  tealLight: "#5eead4",
  violet: "#7c3aed",
  amber: "#b45309",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingBottom: 48, fontSize: 11, color: C.text },
  band: {
    backgroundColor: C.ink,
    paddingHorizontal: 28,
    paddingVertical: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandName: { color: C.tealLight, fontSize: 20, fontWeight: 700, marginLeft: 8 },
  brandSub: { color: "#b9aee8", fontSize: 8.5, marginLeft: 8 },
  meta: { textAlign: "right" },
  metaName: { color: "#ffffff", fontSize: 13, fontWeight: 700 },
  metaDate: { color: "#b9aee8", fontSize: 9 },
  body: { paddingHorizontal: 28, paddingTop: 18 },
  title: { fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 2 },
  subtitle: { fontSize: 10, color: C.muted, marginBottom: 14 },
  caseCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderLeftWidth: 3,
    borderLeftColor: C.violet,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  caseArea: { fontSize: 9, color: C.violet, fontWeight: 700, textTransform: "uppercase" },
  caseTitle: { fontSize: 13, fontWeight: 700, color: C.ink, marginTop: 2 },
  caseSub: { fontSize: 10, color: C.muted },
  section: { marginBottom: 12 },
  h2: { fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  item: { marginBottom: 9 },
  label: { fontSize: 9, color: C.violet, fontWeight: 700, marginBottom: 2, textTransform: "uppercase" },
  p: { fontSize: 10.5, color: C.text, lineHeight: 1.5 },
  bullet: { flexDirection: "row", marginBottom: 4 },
  dot: { color: C.teal, marginRight: 6, fontSize: 10.5 },
  footer: {
    position: "absolute",
    bottom: 18,
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
    <Svg width={26} height={26} viewBox="0 0 64 64">
      <Path d="M32 8 L54 20 L54 44 L32 56 L10 44 L10 20 Z" stroke={C.tealLight} strokeWidth={2.4} />
      <Path d="M32 8 L32 32 M10 20 L32 32 L54 20" stroke={C.tealLight} strokeWidth={1.6} />
      <Circle cx={32} cy={26} r={4} fill={C.tealLight} />
      <Path d="M32 31 L32 47 M24 36 L32 33 L40 36" stroke={C.tealLight} strokeWidth={2.2} />
    </Svg>
  );
}

export interface FichaPdfData {
  name: string;
  date: string;
  state: ExpedienteState;
}

export function FichaDoc({ data }: { data: FichaPdfData }) {
  const { state } = data;
  const caso = getCaso(state.caso) ?? CASOS[0];
  const hip = caso.hipotesis.find((h) => h.id === state.estrategia);
  const rol = ROLES.find((r) => r.id === state.rol);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed>
          <View style={s.brand}>
            <Cube />
            <Text style={s.brandName}>Expediente Vivo</Text>
            <Text style={s.brandSub}>Diplomatura en IA y Derecho · UNT</Text>
          </View>
          <View style={s.meta}>
            <Text style={s.metaName}>{data.name}</Text>
            <Text style={s.metaDate}>{data.date}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.title}>Ficha de decisión jurídica asistida por IA</Text>
          <Text style={s.subtitle}>Razonamiento profesional documentado — entregable del laboratorio.</Text>

          <View style={s.caseCard}>
            <Text style={s.caseArea}>Caso · {caso.area}</Text>
            <Text style={s.caseTitle}>{caso.titulo}</Text>
            <Text style={s.caseSub}>{caso.caratula}</Text>
            {hip && <Text style={[s.caseSub, { marginTop: 4 }]}>Vía elegida: {hip.titulo}</Text>}
          </View>

          <View style={s.section}>
            <Text style={s.h2}>La ficha</Text>
            {FICHA_CAMPOS.map((c) => (
              <View key={c.key} style={s.item} wrap={false}>
                <Text style={s.label}>{c.label}</Text>
                <Text style={s.p}>{state.ficha[c.key] || "—"}</Text>
              </View>
            ))}
          </View>

          {rol && (
            <View style={s.section} wrap={false}>
              <Text style={s.h2}>Deliberación por roles</Text>
              <Text style={s.label}>{rol.nombre}</Text>
              <Text style={s.p}>{state.rolArgumento || "—"}</Text>
            </View>
          )}

          <View style={s.section} wrap={false}>
            <Text style={s.h2}>Cinco reglas de uso responsable</Text>
            {state.reglas.filter((r) => r.trim()).map((r, i) => (
              <View key={i} style={s.bullet}>
                <Text style={s.dot}>{i + 1}.</Text>
                <Text style={s.p}>{r}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Expediente Vivo — Diplomatura en IA y Derecho · UNT</Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}

export async function buildFichaBlob(data: FichaPdfData): Promise<Blob> {
  return pdf(<FichaDoc data={data} />).toBlob();
}
