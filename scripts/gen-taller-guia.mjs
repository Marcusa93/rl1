// ============================================================
// Genera la guía del taller "El mediador aumentado" en PDF, con la estética
// de las placas (fondo oscuro, teal y violeta) y enlaces clicables, a partir
// de lib/taller-guia.ts.
//
// Uso:    node scripts/gen-taller-guia.mjs     (Node 22.18+ o 23.6+: importa .ts)
// Salida: public/taller-ia/guia-mediador-aumentado.pdf  (se commitea)
// Fuentes estándar de PDF: sin emojis ni flechas en el texto.
// ============================================================

import React from "react";
import { Document, Font, Image, Link, Page, Text, View, renderToFile } from "@react-pdf/renderer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  GUIA_AUTOR,
  GUIA_BAJADA,
  GUIA_CARGO,
  GUIA_CASO,
  GUIA_EVENTO,
  GUIA_FECHA,
  GUIA_GRACIAS,
  GUIA_LOGOS,
  GUIA_METODO,
  GUIA_PDF,
  GUIA_RECURSERO,
  GUIA_REDES,
  GUIA_SECCIONES,
  GUIA_TITULO,
  GUIA_URL,
} from "../lib/taller-guia.ts";

const h = React.createElement;
const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
Font.registerHyphenationCallback((w) => [w]);

const C = {
  fondo: "#0b0d24",
  panel: "#171a37",
  linea: "#2e3264",
  texto: "#e8ebf7",
  suave: "#a9b1d6",
  teal: "#5eead4",
  cyan: "#22d3ee",
  violeta: "#a78bfa",
  ambar: "#fcd34d",
  rosa: "#fda4af",
};

const pagina = { backgroundColor: C.fondo, color: C.texto, fontFamily: "Helvetica", paddingTop: 42, paddingBottom: 64, paddingHorizontal: 44 };

function Pie() {
  return h(Text, {
    fixed: true,
    style: { position: "absolute", bottom: 24, left: 44, right: 44, fontSize: 8.5, color: C.suave, textAlign: "center", borderTopWidth: 0.5, borderTopColor: C.linea, paddingTop: 8 },
    render: ({ pageNumber, totalPages }) => `${GUIA_TITULO} · ${GUIA_AUTOR} · ${GUIA_FECHA} · taller.rossi-ia.com/guia · pág. ${pageNumber}/${totalPages}`,
  });
}

function Logos({ alto = 46 }) {
  return h(
    View,
    { style: { flexDirection: "row", alignItems: "center" } },
    ...GUIA_LOGOS.map((l, i) =>
      l.fondo
        ? h(View, { key: i, style: { backgroundColor: "#ffffff", borderRadius: 8, padding: 4, marginRight: 14 } }, h(Image, { src: join(PUBLIC, l.src), style: { height: alto - 8 } }))
        : h(Image, { key: i, src: join(PUBLIC, l.src), style: { height: alto, marginRight: 14 } }),
    ),
  );
}

function Rotulo({ children, color = C.violeta }) {
  return h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 10, letterSpacing: 2, color, marginBottom: 6 } }, children);
}

function Enlaces({ titulo, items }) {
  return h(
    View,
    { style: { marginTop: 14 }, wrap: false },
    h(Rotulo, null, titulo.toUpperCase()),
    h(
      View,
      { style: { flexDirection: "row", flexWrap: "wrap" } },
      ...items.map((e, i) =>
        h(
          Link,
          { key: i, src: e.url, style: { textDecoration: "none", width: "48.5%", marginRight: i % 2 === 0 ? "3%" : 0, marginBottom: 7 } },
          h(
            View,
            { style: { backgroundColor: C.panel, borderRadius: 10, borderWidth: 0.8, borderColor: C.linea, paddingVertical: 8, paddingHorizontal: 11 } },
            h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 13, color: C.teal } }, `${e.label}  >`),
            h(Text, { style: { fontSize: 10, color: C.suave, marginTop: 2 } }, e.detalle),
          ),
        ),
      ),
    ),
  );
}

function Portada() {
  return h(
    Page,
    { size: "A4", style: pagina },
    h(Logos, { alto: 54 }),
    h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 12, letterSpacing: 3, color: C.violeta, marginTop: 34 } }, "GUÍA DEL TALLER"),
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 44, color: C.teal, marginTop: 6 } }, GUIA_TITULO),
    h(Text, { style: { fontSize: 16, lineHeight: 1.4, color: C.suave, marginTop: 10 } }, `${GUIA_BAJADA}.`),
    h(
      View,
      { style: { marginTop: 20, backgroundColor: C.panel, borderRadius: 14, borderWidth: 1, borderColor: C.linea, padding: 16 } },
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 20 } }, GUIA_AUTOR),
      h(Text, { style: { fontSize: 11.5, color: C.suave, marginTop: 4 } }, GUIA_CARGO),
      h(Text, { style: { fontSize: 11.5, color: C.violeta, marginTop: 8 } }, `${GUIA_EVENTO} · ${GUIA_FECHA}`),
    ),
    h(
      View,
      { style: { marginTop: 14, borderLeftWidth: 4, borderLeftColor: C.teal, paddingLeft: 12 } },
      h(Text, { style: { fontSize: 12.5, lineHeight: 1.5 } }, GUIA_GRACIAS),
    ),
    h(Enlaces, { titulo: "Recursero · las herramientas a un clic", items: GUIA_RECURSERO }),
    h(Enlaces, { titulo: "Mis redes", items: GUIA_REDES }),
    h(Pie),
  );
}

function Concepto({ c, n }) {
  return h(
    View,
    { wrap: false, style: { flexDirection: "row", backgroundColor: C.panel, borderRadius: 12, borderWidth: 0.8, borderColor: C.linea, padding: 13, marginBottom: 9 } },
    h(
      View,
      { style: { width: 26, height: 26, borderRadius: 7, borderWidth: 1.5, borderColor: C.teal, alignItems: "center", justifyContent: "center", marginRight: 12 } },
      h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 11, color: C.teal } }, String(n)),
    ),
    h(
      View,
      { style: { flex: 1 } },
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 15.5, color: C.teal } }, c.termino),
      h(Text, { style: { fontSize: 12.5, lineHeight: 1.45, marginTop: 4 } }, c.definicion),
      c.clave ? h(Text, { style: { fontFamily: "Helvetica-Oblique", fontSize: 11, lineHeight: 1.4, color: C.violeta, marginTop: 6 } }, c.clave) : null,
    ),
  );
}

function TituloSeccion({ titulo, bajada }) {
  return h(
    View,
    { wrap: false, style: { marginTop: 8, marginBottom: 12 } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 24 } }, titulo),
    bajada ? h(Text, { style: { fontSize: 12.5, color: C.suave, marginTop: 4 } }, bajada) : null,
  );
}

function Contenido() {
  let n = 0;
  const cotio = [
    ["C", "Contexto", "Quién pide y en qué situación", C.teal],
    ["O", "Objetivo", "Qué se quiere lograr", C.cyan],
    ["T", "Tareas", "Qué hacer, paso por paso", C.violeta],
    ["I", "Input", "Con qué información trabajar", C.ambar],
    ["O", "Output", "Cómo entregar el resultado", C.rosa],
  ];
  return h(
    Page,
    { size: "A4", style: pagina, wrap: true },
    // El método: las 8 etapas, en dos filas de cuatro.
    h(
      View,
      { wrap: false },
      h(TituloSeccion, { titulo: "El método: 8 etapas", bajada: "El recorrido del taller sirve como método para cualquier conflicto." }),
      h(
        View,
        { style: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" } },
        ...GUIA_METODO.map((m, i) =>
          h(
            View,
            { key: i, style: { width: "24%", backgroundColor: C.panel, borderRadius: 10, borderWidth: 0.8, borderColor: C.linea, padding: 9, marginBottom: 7 } },
            h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 18, color: C.teal } }, String(i)),
            h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 11.5, marginTop: 2 } }, m.paso),
            h(Text, { style: { fontSize: 8.5, lineHeight: 1.35, color: C.suave, marginTop: 3 } }, m.texto),
          ),
        ),
      ),
    ),
    // Conceptos: el título de cada sección viaja pegado a su primera tarjeta.
    ...GUIA_SECCIONES.flatMap((s, i) => [
      h(
        View,
        { key: `t${i}`, wrap: false, style: { marginTop: i === 0 ? 10 : 0 } },
        h(TituloSeccion, { titulo: s.titulo, bajada: s.bajada }),
        h(Concepto, { c: s.conceptos[0], n: ++n }),
      ),
      ...s.conceptos.slice(1).map((c) => h(Concepto, { key: c.termino, c, n: ++n })),
    ]),
    // COTIO
    h(
      View,
      { wrap: false, style: { marginTop: 10 } },
      h(TituloSeccion, { titulo: "Un buen prompt: COTIO", bajada: "Como prompt de sistema (el P0 del taller), se escribe una vez y ordena todo el caso." }),
      h(
        View,
        { style: { flexDirection: "row", justifyContent: "space-between" } },
        ...cotio.map(([l, nombre, que, color], i) =>
          h(
            View,
            { key: i, style: { width: "19%", backgroundColor: C.panel, borderRadius: 10, borderWidth: 0.8, borderColor: C.linea, padding: 8, alignItems: "center" } },
            h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 22, color } }, l),
            h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 11.5, marginTop: 3 } }, nombre),
            h(Text, { style: { fontSize: 9, color: C.suave, textAlign: "center", marginTop: 2 } }, que),
          ),
        ),
      ),
    ),
    // El caso
    h(
      View,
      { wrap: false, style: { marginTop: 18, backgroundColor: C.panel, borderRadius: 14, borderWidth: 1, borderColor: C.linea, padding: 16 } },
      h(Rotulo, null, GUIA_CASO.referencia.toUpperCase()),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 20 } }, GUIA_CASO.titulo),
      ...GUIA_CASO.puntos.map((p, i) => h(Text, { key: i, style: { fontSize: 12.5, lineHeight: 1.45, marginTop: 6 } }, `•  ${p}`)),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 12, color: C.teal, marginTop: 12 } }, "Lo que cada participante se lleva"),
      h(
        View,
        { style: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 } },
        ...GUIA_CASO.productos.map((p, i) =>
          h(Text, { key: i, style: { fontSize: 11, borderWidth: 0.8, borderColor: C.teal, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 9, marginRight: 6, marginBottom: 6 } }, p),
        ),
      ),
    ),
    // Cierre
    h(
      View,
      { wrap: false, style: { marginTop: 20 } },
      h(Enlaces, { titulo: "Recursero", items: GUIA_RECURSERO }),
      h(Enlaces, { titulo: "Mis redes", items: GUIA_REDES }),
    ),
    h(
      View,
      { wrap: false, style: { marginTop: 16, borderTopWidth: 0.8, borderTopColor: C.linea, paddingTop: 16 } },
      h(Text, { style: { fontSize: 12.5, lineHeight: 1.5, color: C.suave } }, GUIA_GRACIAS),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 16, marginTop: 12 } }, GUIA_AUTOR),
      h(Text, { style: { fontSize: 10.5, color: C.suave, marginTop: 2 } }, GUIA_CARGO),
      h(Link, { src: GUIA_URL, style: { fontSize: 11, color: C.teal, marginTop: 6, textDecoration: "none" } }, "taller.rossi-ia.com/guia"),
      h(View, { style: { marginTop: 14 } }, h(Logos, { alto: 40 })),
    ),
    h(Pie),
  );
}

const salida = join(PUBLIC, GUIA_PDF.replace(/^\//, ""));
await renderToFile(h(Document, { title: `Guía · ${GUIA_TITULO}`, author: GUIA_AUTOR, subject: GUIA_EVENTO, language: "es" }, h(Portada), h(Contenido)), salida);
console.log("✓", salida);
