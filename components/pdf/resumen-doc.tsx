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
  DIAGNOSTICO_CARDS,
  ENCUESTA_QUESTIONS,
  VF_ITEMS,
  COTIO_VARS,
  WORKSHOP_TITLE,
} from "@/lib/constants";

export interface ResumenResponse {
  activity: string;
  item_key: string;
  payload: Record<string, unknown>;
}
export interface ResumenData {
  name: string;
  date: string;
  responses: ResumenResponse[];
}

const C = {
  ink: "#140d39",
  teal: "#0d9488",
  tealLight: "#5eead4",
  violet: "#7c3aed",
  text: "#1f2937",
  muted: "#6b7280",
  line: "#e5e7eb",
};

const s = StyleSheet.create({
  page: { backgroundColor: "#ffffff", paddingBottom: 48, fontSize: 11, color: C.text },
  band: { backgroundColor: C.ink, paddingHorizontal: 28, paddingVertical: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  brand: { flexDirection: "row", alignItems: "center" },
  brandName: { color: C.tealLight, fontSize: 22, fontWeight: 700, marginLeft: 8 },
  brandSub: { color: "#b9aee8", fontSize: 9, marginLeft: 8 },
  meta: { textAlign: "right" },
  metaName: { color: "#ffffff", fontSize: 13, fontWeight: 700 },
  metaDate: { color: "#b9aee8", fontSize: 9 },
  body: { paddingHorizontal: 28, paddingTop: 18 },
  title: { fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 2 },
  subtitle: { fontSize: 10, color: C.muted, marginBottom: 14 },
  section: { marginBottom: 14 },
  h2: { fontSize: 12, fontWeight: 700, color: C.teal, marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  card: { borderWidth: 1, borderColor: C.line, borderRadius: 8, padding: 10, marginBottom: 8 },
  label: { fontSize: 9, color: C.violet, fontWeight: 700, marginBottom: 2, textTransform: "uppercase" },
  p: { fontSize: 10.5, color: C.text, lineHeight: 1.5 },
  muted: { fontSize: 10, color: C.muted, lineHeight: 1.5 },
  bullet: { flexDirection: "row", marginBottom: 4 },
  dot: { color: C.teal, marginRight: 6 },
  mono: { fontFamily: "Courier", fontSize: 9.5, color: C.text, lineHeight: 1.45 },
  footer: { position: "absolute", bottom: 18, left: 28, right: 28, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.line, paddingTop: 6 },
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

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.bullet}>
      <Text style={s.dot}>•</Text>
      <Text style={s.muted}>{children}</Text>
    </View>
  );
}

const TEMAS = [
  "Cómo funciona la IA generativa: tokens (por qué importa el prompt) y alucinación (por qué se verifica todo).",
  "Método COTIO: Contexto · Objeto · Tarea · Input · Output.",
  "Memorias y Proyectos: que la IA no arranque de cero (Claude, ChatGPT, Gemini).",
  "El dato/Input pesa tanto como la forma de pedir.",
];

const CONSEJOS = [
  "Aplicá COTIO siempre: si cubrís las 5 variables, el resultado es predecible y reutilizable.",
  "El Input manda: buen material de entrada = mejor salida.",
  "Verificá todo lo que va a un expediente: la IA puede sonar segura y estar equivocada.",
  "Usá Memoria y Proyectos para no repetir tu rol y tus formatos cada vez.",
  "Llevá un caso real propio a la Clase 2: el prompt y el output, salga bien o mal.",
];

export function ResumenDoc({ data }: { data: ResumenData }) {
  const by = (act: string) => data.responses.filter((r) => r.activity === act);

  // Encuesta
  const enc = by("encuesta")[0]?.payload?.answers as Record<string, string | string[]> | undefined;
  // Diagnóstico
  const diag = (by("diagnostico")[0]?.payload?.selected as string[]) ?? [];
  // V/F
  const vf = by("verdadero_falso");
  const vfCorrect = vf.filter((r) => {
    const idx = Number(r.payload?.index ?? r.item_key);
    return VF_ITEMS[idx]?.answer === r.payload?.answer;
  }).length;
  // COTIO
  const cotio = by("cotio")[0]?.payload as { prompt?: string; analysis?: { improved_prompt?: string } } | undefined;
  // Caso
  const caso = by("caso")[0]?.payload as { objeto?: string } | undefined;
  // Tarea
  const tarea = by("tarea")[0]?.payload as { caso?: string; herramienta?: string; compromiso?: boolean } | undefined;

  const label = (qid: string, optId: string) => {
    const q = ENCUESTA_QUESTIONS.find((x) => x.id === qid);
    return q?.options.find((o) => o.id === optId)?.label ?? optId;
  };

  return (
    <Document>
      <Page size="A4" style={s.page}>
        <View style={s.band} fixed>
          <View style={s.brand}>
            <Cube />
            <Text style={s.brandName}>RL1</Text>
            <Text style={s.brandSub}>{WORKSHOP_TITLE}</Text>
          </View>
          <View style={s.meta}>
            <Text style={s.metaName}>{data.name}</Text>
            <Text style={s.metaDate}>{data.date}</Text>
          </View>
        </View>

        <View style={s.body}>
          <Text style={s.title}>Tu resumen del taller</Text>
          <Text style={s.subtitle}>Lo que vimos, tus respuestas y consejos para llevarte.</Text>

          <View style={s.section}>
            <Text style={s.h2}>Temas que vimos</Text>
            {TEMAS.map((t, i) => (
              <Bullet key={i}>{t}</Bullet>
            ))}
          </View>

          <View style={s.section}>
            <Text style={s.h2}>Tus respuestas</Text>

            {enc && (
              <View style={s.card}>
                <Text style={s.label}>Encuesta</Text>
                {Object.entries(enc).map(([qid, val]) => {
                  const q = ENCUESTA_QUESTIONS.find((x) => x.id === qid);
                  const vals = Array.isArray(val) ? val : [val];
                  return (
                    <Text key={qid} style={s.p}>
                      {q?.q ?? qid}: {vals.map((v) => label(qid, v)).join(", ")}
                    </Text>
                  );
                })}
              </View>
            )}

            {diag.length > 0 && (
              <View style={s.card}>
                <Text style={s.label}>Tareas que ya hiciste con IA</Text>
                <Text style={s.p}>
                  {diag.map((id) => DIAGNOSTICO_CARDS.find((c) => c.id === id)?.label ?? id).join(" · ")}
                </Text>
              </View>
            )}

            {vf.length > 0 && (
              <View style={s.card}>
                <Text style={s.label}>Verdadero / Falso</Text>
                <Text style={s.p}>
                  Acertaste {vfCorrect} de {vf.length} respuestas.
                </Text>
              </View>
            )}

            {cotio?.prompt && (
              <View style={s.card}>
                <Text style={s.label}>Optimizador COTIO — tu prompt</Text>
                <Text style={s.mono}>{cotio.prompt}</Text>
                {cotio.analysis?.improved_prompt && (
                  <>
                    <Text style={[s.label, { marginTop: 6, color: C.teal }]}>Prompt mejorado</Text>
                    <Text style={s.mono}>{cotio.analysis.improved_prompt}</Text>
                  </>
                )}
              </View>
            )}

            {caso?.objeto && (
              <View style={s.card}>
                <Text style={s.label}>Caso Fernández — tu objetivo</Text>
                <Text style={s.p}>{caso.objeto}</Text>
              </View>
            )}

            {tarea?.compromiso && (
              <View style={s.card}>
                <Text style={s.label}>Tarea bisagra</Text>
                <Text style={s.p}>Caso elegido: {tarea.caso || "—"}</Text>
                {tarea.herramienta ? <Text style={s.p}>Herramienta: {tarea.herramienta}</Text> : null}
              </View>
            )}

            {!enc && !diag.length && !vf.length && !cotio?.prompt && !caso?.objeto && !tarea?.compromiso && (
              <Text style={s.muted}>Todavía no registramos respuestas tuyas en esta sesión.</Text>
            )}
          </View>

          <View style={s.section}>
            <Text style={s.h2}>Consejos para llevarte</Text>
            {CONSEJOS.map((t, i) => (
              <Bullet key={i}>{t}</Bullet>
            ))}
          </View>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>RL1 · {WORKSHOP_TITLE}</Text>
          <Text style={s.footerText}>{data.date}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function buildResumenBlob(data: ResumenData): Promise<Blob> {
  return pdf(<ResumenDoc data={data} />).toBlob();
}
