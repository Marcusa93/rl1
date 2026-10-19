"use client";

// El caso «Los tres comprobantes» en PDF, armado en el propio dispositivo.
// Sirve para subirlo a NotebookLM, Pinpoint, Claude o ChatGPT. Fuentes
// built-in (Helvetica y Courier): todo el texto pasa por t() (sin emojis).

import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import {
  CASO,
  COMPROBANTES,
  CONTRAPARTE_TEXTO,
  CUENTA_DESTINO,
  CUENTA_ORIGEN,
  DG_CASO_TITULO,
  FICHA_TEXTO,
  PLANTILLA_TEXTO,
  RELATO_TEXTO,
  pesos,
} from "@/lib/doing-caso";
import { DG_DOCENTE, DG_INSTITUCION, DG_TITULO } from "@/lib/doing-clase";

const C = { tinta: "#22272a", pizarra: "#545c5f", linea: "#dad0bd", verde: "#3e5d51", azul: "#48667f", lacre: "#ad4630", hoja: "#fffcf4" };

/** Solo caracteres que las fuentes built-in pueden dibujar; respeta los saltos de línea. */
const t = (x: string) =>
  x
    .split("\n")
    .map((l) => l.replace(/[^\x09\x20-\x7E\xA0-\xFF–—‘’“”…•]/g, "").replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .trim();

const s = StyleSheet.create({
  page: { paddingTop: 48, paddingBottom: 60, paddingHorizontal: 52, fontFamily: "Helvetica", fontSize: 10, color: C.tinta, lineHeight: 1.45 },
  rotulo: { fontFamily: "Helvetica-Bold", fontSize: 7.5, letterSpacing: 1.5, textTransform: "uppercase", color: C.lacre },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 20, marginTop: 6, lineHeight: 1.2 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 13, marginBottom: 8 },
  aviso: { fontSize: 9, color: C.pizarra, marginTop: 8 },
  maquina: { fontFamily: "Courier", fontSize: 9.5, lineHeight: 1.5 },
  caja: { borderWidth: 1, borderColor: C.linea, borderRadius: 4, padding: 12, marginBottom: 12, backgroundColor: C.hoja },
  fila: { flexDirection: "row", marginBottom: 2 },
  clave: { width: 92, color: C.pizarra, fontSize: 9 },
  valor: { flex: 1, fontFamily: "Courier", fontSize: 9.5 },
  pie: { position: "absolute", bottom: 26, left: 52, right: 52, fontSize: 7.5, color: C.pizarra, flexDirection: "row", justifyContent: "space-between" },
});

function Pie() {
  return (
    <View style={s.pie} fixed>
      <Text>{t(`${DG_INSTITUCION} · ${DG_TITULO} · ${DG_DOCENTE}`)}</Text>
      <Text render={({ pageNumber, totalPages }) => `Caso ficticio · ${pageNumber}/${totalPages}`} />
    </View>
  );
}

function Seccion({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Page size="A4" style={s.page}>
      <Text style={s.h2}>{t(titulo)}</Text>
      <View style={s.caja}>
        <Text style={s.maquina}>{t(texto)}</Text>
      </View>
      <Pie />
    </Page>
  );
}

function CasoDoc() {
  return (
    <Document title={`Caso ${DG_CASO_TITULO} (ficticio)`} author={DG_DOCENTE}>
      <Page size="A4" style={s.page}>
        <Text style={s.rotulo}>{t(`${DG_INSTITUCION} · material de la clase`)}</Text>
        <Text style={s.h1}>{t(`Caso «${DG_CASO_TITULO}»`)}</Text>
        <Text style={s.aviso}>
          {t("Caso ficticio preparado para la clase: las personas, empresas, banco y expediente no existen. Escenario procesal genérico.")}
        </Text>
        <View style={[s.caja, { marginTop: 16 }]}>
          <Text style={s.maquina}>{t(FICHA_TEXTO)}</Text>
        </View>
        <Pie />
      </Page>
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>{t("Comprobantes de transferencia (1, 2 y 3)")}</Text>
        {COMPROBANTES.map((c) => (
          <View key={c.n} style={s.caja} wrap={false}>
            <Text style={[s.rotulo, { color: C.azul, marginBottom: 6 }]}>{t(`${CASO.banco} (ficticio) · Comprobante ${c.n}`)}</Text>
            {(
              [
                ["Operación", c.operacion],
                ["Fecha y hora", `${c.fecha} ${c.hora}`],
                ["Importe", `${pesos(c.importe)},00`],
                ["Origen", CUENTA_ORIGEN],
                ["Destino", CUENTA_DESTINO],
                ["Concepto", c.concepto],
                ["Referencia", c.referencia || "(sin referencia)"],
                ["Estado", "Acreditada"],
              ] as const
            ).map(([k, v]) => (
              <View key={k} style={s.fila}>
                <Text style={s.clave}>{t(k)}</Text>
                <Text style={s.valor}>{t(v)}</Text>
              </View>
            ))}
          </View>
        ))}
        <Pie />
      </Page>
      <Seccion titulo="Escrito de la actora" texto={CONTRAPARTE_TEXTO} />
      <Seccion titulo="Mensaje del cliente" texto={RELATO_TEXTO} />
      <Seccion titulo="Plantilla de acompañamiento documental" texto={PLANTILLA_TEXTO} />
    </Document>
  );
}

export async function descargarCasoPdf(): Promise<void> {
  const blob = await pdf(<CasoDoc />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Caso-los-tres-comprobantes-ficticio.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
