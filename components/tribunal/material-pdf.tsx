"use client";

// Material del encuentro en PDF — ciclo del Tribunal Fiscal de Tucumán.
// Se arma en el propio dispositivo (como la guía de BBVA). Dos partes bien
// separadas: el contenido académico del Dr. Leal (el texto literal de sus
// placas) y lo que respondió la sala (aportes de los participantes, que no
// son conclusiones jurídicas ni criterios institucionales).
// Titulares en Newsreader (la serif de las placas, OFL, en public/tribunal/fuentes);
// el cuerpo en Helvetica built-in. Todo el texto pasa por t() (sin emojis).

import { Document, Font, Image, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import {
  bloquesMaterial,
  getActividadTf,
  lineasPlaca,
  TF_CICLO,
  TF_EQUIPO,
  TF_INSTITUCION,
  type TfBloque,
  type TfClase,
  type TfMaterial,
  type TfPlaca,
} from "@/lib/tribunal";

const C = {
  papel: "#f6f8f9",
  blanco: "#ffffff",
  tinta: "#17212b",
  azul: "#173b63",
  petroleo: "#007a87",
  celeste: "#ddeaf2",
  pizarra: "#5e6974",
  niebla: "#9aa5af",
  linea: "#d6dfe6",
  ocre: "#b7791f",
  ocreClaro: "#f7ecd7",
  lacre: "#b4372f",
};
const SERIF = "Newsreader";

const ACN: [keyof Pick<FilaAcn, "a" | "c" | "n">, string, string][] = [
  ["a", "A · Uso admisible", C.petroleo],
  ["c", "C · Uso condicionado", C.ocre],
  ["n", "N · No delegar", C.lacre],
];
type FilaAcn = Extract<TfBloque, { tipo: "acn" }>["filas"][number];

/** Lleva el texto a lo que Helvetica (WinAnsi) y Newsreader pueden dibujar: sin emojis. */
const t = (x: string) => x.replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF–—‘’“”…•‹›]/g, "").replace(/\s{2,}/g, " ").trim();

const s = StyleSheet.create({
  page: { backgroundColor: C.blanco, paddingTop: 50, paddingBottom: 64, paddingHorizontal: 52, fontFamily: "Helvetica", fontSize: 10, color: C.tinta, lineHeight: 1.45 },
  rotulo: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.6, textTransform: "uppercase" },
  h1: { fontFamily: SERIF, fontWeight: 600, fontSize: 24, lineHeight: 1.15, color: C.tinta, marginTop: 6 },
  h2: { fontFamily: SERIF, fontWeight: 600, fontSize: 14.5, lineHeight: 1.2, color: C.tinta },
  bajada: { fontSize: 10, color: C.pizarra, marginTop: 6, lineHeight: 1.5 },
  regla: { height: 2, width: 40, marginTop: 12, marginBottom: 18 },
  footer: { position: "absolute", bottom: 26, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 0.6, borderTopColor: C.linea, paddingTop: 6 },
  footerTxt: { fontSize: 7, color: C.niebla },
});

function Pie({ clase }: { clase: TfClase }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerTxt}>{t(`${TF_INSTITUCION} · ${clase.bajada[0]} · Material del encuentro`)}</Text>
      <Text style={s.footerTxt} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Cabeza({ rotulo, color, titulo, bajada }: { rotulo: string; color: string; titulo: string; bajada?: string }) {
  return (
    <View>
      <Text style={[s.rotulo, { color }]}>{t(rotulo)}</Text>
      <Text style={s.h1}>{t(titulo)}</Text>
      {bajada && <Text style={s.bajada}>{t(bajada)}</Text>}
      <View style={[s.regla, { backgroundColor: color }]} />
    </View>
  );
}

// --- Portada ---------------------------------------------------------------------------------

function Portada({ clase, datos, imagen }: { clase: TfClase; datos: TfMaterial; imagen: string | null }) {
  const fecha = new Date(datos.generado).toLocaleString("es-AR", { dateStyle: "long", timeStyle: "short" });
  return (
    <Page size="A4" style={[s.page, { backgroundColor: C.papel, paddingTop: 0 }]}>
      <View style={{ height: 8, backgroundColor: C.azul, marginHorizontal: -52 }} />
      <View style={{ marginTop: 46 }}>
        <Text style={[s.rotulo, { color: C.azul, fontSize: 8.5, lineHeight: 1.6 }]}>{t("Tribunal Fiscal de la\nProvincia de Tucumán")}</Text>
        <Text style={{ fontSize: 9, color: C.pizarra, marginTop: 4 }}>{t(TF_CICLO)}</Text>
        <Text style={{ fontFamily: SERIF, fontWeight: 500, fontSize: 38, lineHeight: 1.08, marginTop: 34, color: C.tinta }}>{t(clase.titulo)}</Text>
        <Text style={{ fontSize: 11, color: C.pizarra, marginTop: 12 }}>{t(clase.bajada.join(" · "))}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18 }}>
          <View style={{ width: 26, height: 1, backgroundColor: C.petroleo, marginRight: 10 }} />
          <Text style={{ fontFamily: SERIF, fontSize: 16, color: C.azul }}>{t(clase.expositor)}</Text>
        </View>
        <Text style={[s.rotulo, { color: C.petroleo, marginTop: 30, fontSize: 9 }]}>Material del encuentro</Text>
      </View>

      {imagen && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={imagen} style={{ marginTop: 22, height: 150, objectFit: "cover", borderRadius: 6 }} />
      )}

      <View style={{ marginTop: 22, backgroundColor: C.blanco, borderWidth: 0.8, borderColor: C.linea, borderRadius: 6, padding: 16 }}>
        <Text style={[s.rotulo, { color: C.pizarra }]}>Cómo leer este material</Text>
        <View style={{ flexDirection: "row", marginTop: 10 }}>
          <View style={{ width: 8, height: 8, backgroundColor: C.azul, marginTop: 2.5, marginRight: 8 }} />
          <Text style={{ flex: 1, fontSize: 9.5 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Parte 1 · Contenido de la charla. </Text>
            {t(`El texto de las placas del ${clase.expositor}, tal como se presentó.`)}
          </Text>
        </View>
        <View style={{ flexDirection: "row", marginTop: 6 }}>
          <View style={{ width: 8, height: 8, backgroundColor: C.ocre, marginTop: 2.5, marginRight: 8 }} />
          <Text style={{ flex: 1, fontSize: 9.5 }}>
            <Text style={{ fontFamily: "Helvetica-Bold" }}>Parte 2 · Lo que respondió la sala. </Text>
            Los resultados de las actividades en vivo, agregados y anónimos. Reflejan la opinión de quienes participaron: no son
            conclusiones jurídicas ni criterios institucionales aprobados.
          </Text>
        </View>
      </View>

      <View style={{ position: "absolute", bottom: 34, left: 52, right: 52 }}>
        <Text style={{ fontSize: 8, color: C.pizarra }}>{t(`Participaron ${datos.participantes} personas desde su celular · Generado el ${fecha}`)}</Text>
        <Text style={{ fontSize: 8, color: C.niebla, marginTop: 2 }}>{t(`Contenido académico: ${clase.expositor} · Actividades y plataforma: ${TF_EQUIPO}`)}</Text>
      </View>
    </Page>
  );
}

// --- Parte 1: las placas ------------------------------------------------------------------------

function PlacaPdf({ clase, placa }: { clase: TfClase; placa: TfPlaca }) {
  return (
    <View wrap={false} style={{ flexDirection: "row", marginBottom: 16, paddingBottom: 14, borderBottomWidth: 0.6, borderBottomColor: C.linea }}>
      <Text style={{ width: 34, fontFamily: SERIF, fontSize: 18, color: C.petroleo, lineHeight: 1 }}>{placa.num}</Text>
      <View style={{ flex: 1 }}>
        <Text style={s.h2}>{t(placa.titulo)}</Text>
        <View style={{ marginTop: 6 }}>
          {lineasPlaca(placa, clase).map((l, i) =>
            l.tipo === "lema" ? (
              <Text key={i} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: C.azul, marginTop: 3, lineHeight: 1.35 }}>
                {t(l.texto)}
              </Text>
            ) : l.tipo === "cierre" ? (
              <View key={i} style={{ borderLeftWidth: 2.2, borderLeftColor: C.petroleo, paddingLeft: 8, marginTop: 6 }}>
                <Text style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 11, color: C.azul }}>{t(l.texto)}</Text>
              </View>
            ) : l.tipo === "par" ? (
              <Text key={i} style={{ marginTop: 3 }}>
                <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8, color: C.petroleo, letterSpacing: 0.8 }}>{t(l.k ?? "").toUpperCase()}  </Text>
                {t(l.texto)}
              </Text>
            ) : l.tipo === "dato" ? (
              <Text key={i} style={{ color: C.pizarra, marginTop: 2 }}>
                {t(l.texto)}
              </Text>
            ) : (
              <View key={i} style={{ flexDirection: "row", marginTop: 3 }}>
                <Text style={{ width: 10, color: C.petroleo }}>•</Text>
                <Text style={{ flex: 1 }}>{t(l.texto)}</Text>
              </View>
            ),
          )}
        </View>
      </View>
    </View>
  );
}

// --- Parte 2: resultados ------------------------------------------------------------------------

function Barras({ bloque }: { bloque: Extract<TfBloque, { tipo: "barras" }> }) {
  const max = Math.max(1, ...bloque.filas.map((f) => f.n));
  return (
    <View style={{ marginTop: 6 }}>
      {bloque.pregunta && <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: C.azul, marginBottom: 4 }}>{t(bloque.pregunta)}</Text>}
      {bloque.filas.map((f) => (
        <View key={f.label} style={{ flexDirection: "row", alignItems: "center", marginBottom: 3.5 }}>
          <Text style={{ width: 200, marginRight: 10, fontSize: 8.8, color: f.n === max && f.n > 0 ? C.tinta : C.pizarra, fontFamily: f.n === max && f.n > 0 ? "Helvetica-Bold" : "Helvetica" }}>
            {t(f.label)}
          </Text>
          <View style={{ flex: 1, height: 7, backgroundColor: C.celeste, borderRadius: 3.5 }}>
            <View style={{ width: `${(f.n / max) * 100}%`, height: 7, backgroundColor: f.n === max && f.n > 0 ? C.azul : C.petroleo, borderRadius: 3.5 }} />
          </View>
          <Text style={{ width: 54, textAlign: "right", fontSize: 8.5 }}>
            {f.n} · {f.pct}%
          </Text>
        </View>
      ))}
    </View>
  );
}

function TablaAcn({ bloque }: { bloque: Extract<TfBloque, { tipo: "acn" }> }) {
  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 6 }}>
        {ACN.map(([, label, color]) => (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", marginLeft: 12 }}>
            <View style={{ width: 7, height: 7, backgroundColor: color, marginRight: 4 }} />
            <Text style={{ fontSize: 7.5, color: C.pizarra }}>{label}</Text>
          </View>
        ))}
      </View>
      {bloque.filas.map((f, i) => (
        <View key={f.tarea} wrap={false} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
          <Text style={{ width: 14, fontSize: 8, color: C.niebla }}>{i + 1}</Text>
          <Text style={{ width: 200, marginRight: 8, fontSize: 8.6 }}>{t(f.tarea)}</Text>
          <View style={{ flex: 1, height: 10, flexDirection: "row", backgroundColor: C.celeste, borderRadius: 2 }}>
            {f.total > 0 &&
              ACN.map(([k, label, color]) =>
                f[k] > 0 ? <View key={label} style={{ width: `${(f[k] / f.total) * 100}%`, height: 10, backgroundColor: color }} /> : null,
              )}
          </View>
          <Text style={{ width: 92, textAlign: "right", fontSize: 7.6, color: C.pizarra }}>
            {f.total ? ACN.map(([k]) => `${k.toUpperCase()} ${Math.round((f[k] / f.total) * 100)}%`).join("  ") : "sin respuestas"}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Palabras({ bloque }: { bloque: Extract<TfBloque, { tipo: "palabras" }> }) {
  if (!bloque.palabras.length) return <Text style={{ color: C.niebla, marginTop: 4 }}>Sin respuestas registradas.</Text>;
  const max = Math.max(1, ...bloque.palabras.map((p) => p.n));
  // Si nadie repitió una respuesta, ninguna se destaca.
  const destaca = (n: number) => max > 1 && n === max;
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 6 }}>
      {bloque.palabras.slice(0, 40).map((p) => (
        <View key={p.palabra} style={{ flexDirection: "row", alignItems: "baseline", borderWidth: 0.6, borderColor: C.linea, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2.5, marginRight: 5, marginBottom: 5, backgroundColor: destaca(p.n) ? C.celeste : C.blanco }}>
          <Text style={{ fontFamily: SERIF, fontWeight: destaca(p.n) ? 600 : 400, fontSize: max > 1 ? 10.5 + 4 * (p.n / max) : 11, color: C.azul }}>{t(p.palabra)}</Text>
          {p.n > 1 && <Text style={{ fontSize: 7.5, color: C.pizarra, marginLeft: 3 }}>×{p.n}</Text>}
        </View>
      ))}
    </View>
  );
}

function Textos({ bloque }: { bloque: Extract<TfBloque, { tipo: "textos" }> }) {
  if (!bloque.textos.length) return <Text style={{ color: C.niebla, marginTop: 4 }}>Sin respuestas registradas.</Text>;
  return (
    <View style={{ marginTop: 6 }}>
      {bloque.textos.map((x, i) => (
        <View key={i} wrap={false} style={{ backgroundColor: C.papel, borderLeftWidth: 2, borderLeftColor: C.ocre, paddingVertical: 5, paddingHorizontal: 8, marginBottom: 5 }}>
          <Text style={{ fontSize: 9 }}>{t(x)}</Text>
        </View>
      ))}
    </View>
  );
}

function Actividad({ clase, datos, keyAct }: { clase: TfClase; datos: TfMaterial; keyAct: string }) {
  const act = getActividadTf(clase, keyAct);
  const res = datos.actividades.find((a) => a.key === keyAct);
  if (!act || !res) return null;
  const bloques = res.summary ? bloquesMaterial(act, res.summary) : [];
  return (
    <View style={{ marginBottom: 18 }} wrap={act.acn ? true : false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" }}>
        <Text style={[s.h2, { flex: 1, fontSize: 13 }]}>{t(act.titulo)}</Text>
        <Text style={{ fontSize: 8, color: C.pizarra, marginLeft: 10 }}>{res.respondieron === 1 ? "1 respondió" : `${res.respondieron} respondieron`}</Text>
      </View>
      {res.pendiente ? (
        <Text style={{ color: C.niebla, marginTop: 4, fontSize: 9 }}>Respuestas abiertas no incluidas: el equipo no llegó a revisarlas durante la clase.</Text>
      ) : res.respondieron === 0 ? (
        <Text style={{ color: C.niebla, marginTop: 4, fontSize: 9 }}>Sin respuestas registradas.</Text>
      ) : (
        bloques.map((b, i) =>
          b.tipo === "barras" ? <Barras key={i} bloque={b} /> : b.tipo === "acn" ? <TablaAcn key={i} bloque={b} /> : b.tipo === "palabras" ? <Palabras key={i} bloque={b} /> : <Textos key={i} bloque={b} />,
        )
      )}
    </View>
  );
}

// --- Documento ------------------------------------------------------------------------------------

function MaterialDoc({ clase, datos, imagen }: { clase: TfClase; datos: TfMaterial; imagen: string | null }) {
  const placas = clase.slides.filter((x): x is TfPlaca => x.t === "placa");
  const ultima = placas[placas.length - 1];
  const proxima = ultima?.cuerpo.forma === "ideas" ? ultima.cuerpo.proxima : undefined;
  return (
    <Document title={`${clase.titulo} · Material del encuentro`} author={clase.expositor} subject={TF_INSTITUCION} language="es">
      <Portada clase={clase} datos={datos} imagen={imagen} />

      <Page size="A4" style={s.page}>
        <Cabeza rotulo="Parte 1 · Contenido de la charla" color={C.azul} titulo="Las placas del encuentro" bajada={`Texto de la presentación del ${clase.expositor}.`} />
        {placas.map((p) => (
          <PlacaPdf key={p.num} clase={clase} placa={p} />
        ))}
        {(clase.encargo || proxima) && (
          <View wrap={false} style={{ marginTop: 6, backgroundColor: C.celeste, borderRadius: 6, padding: 14 }}>
            <Text style={[s.rotulo, { color: C.azul }]}>Para la próxima charla</Text>
            {clase.encargo && <Text style={{ fontFamily: SERIF, fontSize: 12.5, color: C.tinta, marginTop: 6, lineHeight: 1.35 }}>{t(clase.encargo)}</Text>}
          </View>
        )}
        <Pie clase={clase} />
      </Page>

      <Page size="A4" style={s.page}>
        <Cabeza
          rotulo="Parte 2 · Lo que respondió la sala"
          color={C.ocre}
          titulo="Las actividades en vivo"
          bajada={`${datos.participantes} personas participaron desde su celular. Los porcentajes se calculan sobre quienes respondieron cada pregunta. Las respuestas abiertas se revisaron antes de proyectarse y se publican sin nombres.`}
        />
        <View style={{ backgroundColor: C.ocreClaro, borderRadius: 6, padding: 10, marginBottom: 18 }}>
          <Text style={{ fontSize: 8.6, color: C.tinta }}>
            Estos resultados reflejan la opinión de quienes participaron. No constituyen conclusiones jurídicas ni criterios institucionales formalmente aprobados.
          </Text>
        </View>
        {clase.actividades.map((a) => (
          <Actividad key={a.key} clase={clase} datos={datos} keyAct={a.key} />
        ))}
        <Pie clase={clase} />
      </Page>
    </Document>
  );
}

/** Lee la imagen de portada como data URL (si falla, el PDF sale sin imagen). */
async function imagenPortada(): Promise<string | null> {
  try {
    const blob = await (await fetch("/tribunal/portada.jpg")).blob();
    return await new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => ok(String(r.result));
      r.onerror = () => ok(null);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Newsreader desde public/tribunal/fuentes (la misma serif de las placas). */
function registrarFuentes() {
  const base = `${window.location.origin}/tribunal/fuentes`;
  Font.register({
    family: SERIF,
    fonts: [
      { src: `${base}/newsreader-regular.ttf`, fontWeight: 400 },
      { src: `${base}/newsreader-italic.ttf`, fontWeight: 400, fontStyle: "italic" },
      { src: `${base}/newsreader-medium.ttf`, fontWeight: 500 },
      { src: `${base}/newsreader-semibold.ttf`, fontWeight: 600 },
    ],
  });
}

export async function buildMaterialBlob(clase: TfClase, datos: TfMaterial): Promise<Blob> {
  Font.registerHyphenationCallback((palabra) => [palabra]);
  registrarFuentes();
  const imagen = await imagenPortada();
  return pdf(<MaterialDoc clase={clase} datos={datos} imagen={imagen} />).toBlob();
}
