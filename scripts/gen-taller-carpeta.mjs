// ============================================================
// Genera la carpeta del caso del taller (Café Nube / TecnoFrío) como PDFs
// con diseño, a partir de lib/taller-caso.ts (la misma fuente que usa la app).
//
// Uso:    node scripts/gen-taller-carpeta.mjs      (Node 22.18+ o 23.6+: importa .ts)
// Salida: public/taller-ia/carpeta/*.pdf  (se commitean; Vercel no corre esto)
//
// CN-01 (la captura de WhatsApp) sale como PDF de IMAGEN: el texto del chat no
// es seleccionable, para probar si la herramienta de IA lee imágenes.
// Fuentes estándar de PDF (Helvetica, Times, Courier): nada de caracteres fuera
// de WinAnsi (sin flechas ni tildes de verificación en el texto).
// ============================================================

import React from "react";
import { Document, Font, Image, Line, Page, Path, Circle, Rect, Svg, Text, View, renderToFile } from "@react-pdf/renderer";
import { Resvg } from "@resvg/resvg-js";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { TAL_DOCS, TAL_PLANTILLAS } from "../lib/taller-caso.ts";

const h = React.createElement;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "taller-ia", "carpeta");
mkdirSync(OUT, { recursive: true });

// Sin cortes de palabra con guiones (en español quedan raros).
Font.registerHyphenationCallback((w) => [w]);

const C = {
  texto: "#1f2937",
  suave: "#6b7280",
  linea: "#d1d5db",
  fondo: "#f8fafc",
  tinta: "#140d39",
};

const PIE = "Documento ficticio · Taller «IA aplicada a la resolución de conflictos» · PGR–UEES 2026";

// --- Membretes -------------------------------------------------------------------------

function CopoNieve({ color = "#ffffff", size = 30 }) {
  const brazos = [0, 60, 120].map((a) => {
    const r = (a * Math.PI) / 180;
    const dx = Math.cos(r) * 13;
    const dy = Math.sin(r) * 13;
    return h(Line, { key: a, x1: 15 - dx, y1: 15 - dy, x2: 15 + dx, y2: 15 + dy, stroke: color, strokeWidth: 2 });
  });
  return h(Svg, { width: size, height: size, viewBox: "0 0 30 30" }, ...brazos, h(Circle, { cx: 15, cy: 15, r: 3, fill: color }));
}

function NubeTaza({ size = 34 }) {
  const cafe = "#5b3a1e";
  return h(
    Svg,
    { width: size, height: size, viewBox: "0 0 34 34" },
    h(Circle, { cx: 11, cy: 10, r: 5, fill: "#ffffff", stroke: cafe, strokeWidth: 1.2 }),
    h(Circle, { cx: 17, cy: 7, r: 6, fill: "#ffffff", stroke: cafe, strokeWidth: 1.2 }),
    h(Circle, { cx: 23, cy: 10, r: 5, fill: "#ffffff", stroke: cafe, strokeWidth: 1.2 }),
    h(Rect, { x: 8, y: 17, width: 16, height: 12, rx: 2, fill: cafe }),
    h(Path, { d: "M24 20 C 30 20, 30 27, 24 27", stroke: cafe, strokeWidth: 2, fill: "none" }),
  );
}

function Rayo({ size = 28 }) {
  return h(Svg, { width: size, height: size, viewBox: "0 0 28 28" }, h(Path, { d: "M16 2 L6 16 L13 16 L11 26 L22 11 L15 11 Z", fill: "#fde68a" }));
}

function Engranaje({ size = 28 }) {
  return h(
    Svg,
    { width: size, height: size, viewBox: "0 0 28 28" },
    h(Circle, { cx: 14, cy: 14, r: 9, stroke: "#e2e8f0", strokeWidth: 3, fill: "none" }),
    h(Circle, { cx: 14, cy: 14, r: 3, fill: "#e2e8f0" }),
  );
}

function Personas({ size = 30 }) {
  return h(
    Svg,
    { width: size, height: size, viewBox: "0 0 30 30" },
    h(Circle, { cx: 10, cy: 9, r: 4, fill: "#ccfbf1" }),
    h(Circle, { cx: 20, cy: 9, r: 4, fill: "#ccfbf1" }),
    h(Path, { d: "M3 24 C 3 16, 17 16, 17 24 Z", fill: "#ccfbf1" }),
    h(Path, { d: "M13 24 C 13 16, 27 16, 27 24 Z", fill: "#99f6e4" }),
  );
}

const MEMBRETES = {
  tecnofrio: { fondo: "#0b3c64", color: "#ffffff", sub: "#bfdbfe", nombre: "TecnoFrío Servicios", linea: "Refrigeración comercial · Instalación y mantenimiento · San Salvador", icono: () => h(CopoNieve) },
  cafenube: { fondo: "#f3e9dc", color: "#5b3a1e", sub: "#8a6a4d", nombre: "Café Nube", linea: "Cafetería · San Salvador", icono: () => h(NubeTaza) },
  banco: { fondo: "#0f5132", color: "#ffffff", sub: "#bbf7d0", nombre: "Banco del Valle", linea: "Banco ficticio · Comprobante electrónico", icono: () => null },
  tecnico: { fondo: "#334155", color: "#ffffff", sub: "#cbd5e1", nombre: "Servicio Técnico Independiente", linea: "Inspección de equipos de frío", icono: () => h(Engranaje) },
  mediacion: { fondo: "#115e59", color: "#ffffff", sub: "#99f6e4", nombre: "Centro de Mediación", linea: "Formulario de solicitud · modelo de ejemplo", icono: () => h(Personas) },
  electricista: { fondo: "#92400e", color: "#ffffff", sub: "#fde68a", nombre: "Ing. Roberto Pineda", linea: "Instalaciones eléctricas · San Salvador", icono: () => h(Rayo) },
  caso: { fondo: C.tinta, color: "#5eead4", sub: "#c4b5fd", nombre: "Caso Café Nube / TecnoFrío", linea: "Carpeta del caso · Taller PGR–UEES 2026", icono: () => null },
  correo: { fondo: "#e2e8f0", color: "#0f172a", sub: "#475569", nombre: "Correo electrónico", linea: "Impresión del mensaje", icono: () => null },
  chat: { fondo: "#075e54", color: "#ffffff", sub: "#d1fae5", nombre: "WhatsApp", linea: "Conversación exportada", icono: () => null },
};

function Membrete({ emisor, codigo, linea }) {
  const base = MEMBRETES[emisor];
  if (!base) return null;
  const m = linea ? { ...base, linea } : base;
  return h(
    View,
    { style: { backgroundColor: m.fondo, paddingHorizontal: 36, paddingVertical: 16, flexDirection: "row", alignItems: "center" } },
    m.icono(),
    h(
      View,
      { style: { marginLeft: m.icono() ? 10 : 0, flexGrow: 1 } },
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 16, color: m.color } }, m.nombre),
      h(Text, { style: { fontSize: 8.5, color: m.sub, marginTop: 2 } }, m.linea),
    ),
    h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 11, color: m.color } }, codigo),
  );
}

// --- Piezas del cuerpo ------------------------------------------------------------------------

function Pie({ codigo }) {
  return h(Text, {
    fixed: true,
    style: { position: "absolute", bottom: 20, left: 36, right: 36, fontSize: 7.5, color: C.suave, textAlign: "center", borderTopWidth: 0.5, borderTopColor: C.linea, paddingTop: 6 },
    render: ({ pageNumber, totalPages }) => `${PIE} · ${codigo} · pág. ${pageNumber}/${totalPages}`,
  });
}

function Titulo({ doc }) {
  return h(
    View,
    { style: { marginBottom: 12 } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 15, color: C.texto } }, doc.titulo),
    h(Text, { style: { fontSize: 9, color: C.suave, marginTop: 3 } }, `${doc.codigo} · ${doc.origen}`),
  );
}

function Campos({ campos }) {
  return h(
    View,
    { style: { marginBottom: 12, borderTopWidth: 0.5, borderTopColor: C.linea } },
    ...campos.map(([k, v], i) =>
      h(
        View,
        { key: i, style: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.linea, paddingVertical: 5 } },
        h(Text, { style: { width: 130, fontFamily: "Helvetica-Bold", fontSize: 9.5, color: C.suave } }, k),
        h(Text, { style: { flex: 1, fontSize: 10.5 } }, v),
      ),
    ),
  );
}

function Tabla({ tabla }) {
  const n = tabla.cols.length;
  // La descripción (segunda columna en tablas de 3) se lleva el ancho; en tablas de 2,
  // si la primera columna es corta (cantidades), se angosta.
  const corta = Math.max(...tabla.filas.map((f) => f[0].length)) <= 6;
  const ancho = (j) => (n === 3 ? (j === 1 ? "60%" : "20%") : corta ? (j === 0 ? "14%" : "86%") : j === 0 ? "42%" : "58%");
  const celda = (txt, j, extra = {}) => h(Text, { key: j, style: { width: ancho(j), paddingVertical: 6, paddingHorizontal: 6, fontSize: 10, ...extra } }, txt);
  return h(
    View,
    { style: { marginBottom: 12, borderWidth: 0.5, borderColor: C.linea } },
    h(View, { style: { flexDirection: "row", backgroundColor: "#eef2f7" } }, ...tabla.cols.map((c, j) => celda(c, j, { fontFamily: "Helvetica-Bold", fontSize: 9 }))),
    ...tabla.filas.map((f, i) =>
      h(View, { key: i, style: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: C.linea } }, ...f.map((c, j) => celda(c, j))),
    ),
    tabla.total
      ? h(
          View,
          { style: { flexDirection: "row", borderTopWidth: 1, borderTopColor: C.texto, backgroundColor: "#f8fafc" } },
          h(Text, { style: { width: "80%", padding: 6, fontFamily: "Helvetica-Bold", fontSize: 10.5, textAlign: "right" } }, tabla.total[0]),
          h(Text, { style: { width: "20%", padding: 6, fontFamily: "Helvetica-Bold", fontSize: 10.5 } }, tabla.total[1]),
        )
      : null,
  );
}

function Parrafos({ parrafos, serif }) {
  const base = { fontFamily: serif ? "Times-Roman" : "Helvetica", fontSize: serif ? 11.5 : 10.5, lineHeight: 1.5, marginBottom: 8, textAlign: "justify" };
  return h(
    View,
    null,
    ...parrafos.map((p, i) => {
      // Cláusulas de contrato: "PRIMERA. Objeto." en negrita.
      const m = serif ? p.match(/^([A-ZÁÉÍÓÚ]+\. [^.]+\.)\s(.*)$/) : null;
      if (m)
        return h(Text, { key: i, style: base }, h(Text, { style: { fontFamily: "Times-Bold" } }, `${m[1]} `), m[2]);
      return h(Text, { key: i, style: base }, p);
    }),
  );
}

function Checklist({ items }) {
  return h(
    View,
    { style: { marginTop: 4, marginBottom: 12, padding: 10, borderWidth: 0.5, borderColor: C.linea, backgroundColor: C.fondo } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10, marginBottom: 6 } }, "Acta de instalación"),
    ...items.map((c, i) =>
      h(
        View,
        { key: i, style: { flexDirection: "row", alignItems: "center", marginBottom: 5 } },
        h(
          Svg,
          { width: 11, height: 11, viewBox: "0 0 11 11" },
          h(Rect, { x: 0.5, y: 0.5, width: 10, height: 10, stroke: C.texto, strokeWidth: 0.8, fill: "#ffffff" }),
          c.hecho ? h(Path, { d: "M2 5.5 L4.5 8 L9 2.5", stroke: "#15803d", strokeWidth: 1.4, fill: "none" }) : null,
        ),
        h(Text, { style: { marginLeft: 7, fontSize: 10 } }, c.item),
      ),
    ),
  );
}

function Garabato({ semilla }) {
  // Un trazo de "firma" distinto para cada nombre.
  const a = 8 + (semilla % 7);
  const b = 18 - (semilla % 5);
  const d = `M4 ${b} C 18 ${a}, 26 ${b + 6}, 40 ${a + 2} S 70 ${b}, 84 ${a + 4} S 110 ${b - 2}, 128 ${a}`;
  return h(Svg, { width: 132, height: 28, viewBox: "0 0 132 28" }, h(Path, { d, stroke: "#1e3a8a", strokeWidth: 1.3, fill: "none" }));
}

function Firmas({ firmas }) {
  return h(
    View,
    { style: { flexDirection: "row", justifyContent: "space-around", marginTop: 26 } },
    ...firmas.map((f, i) =>
      h(
        View,
        { key: i, style: { alignItems: "center", width: 200 } },
        h(Garabato, { semilla: f.length + i * 3 }),
        h(View, { style: { borderTopWidth: 0.8, borderTopColor: C.texto, width: 180, marginTop: 2 } }),
        h(Text, { style: { fontSize: 9, marginTop: 4, textAlign: "center" } }, f),
      ),
    ),
  );
}

/** Sello de goma, al lado de la firma. */
function Sello({ texto }) {
  return h(
    View,
    { style: { alignSelf: "flex-end", marginTop: -46, marginRight: 24, transform: "rotate(-12deg)", borderWidth: 2, borderColor: "#b91c1c", borderRadius: 4, paddingVertical: 5, paddingHorizontal: 10 } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 12, color: "#b91c1c" } }, texto),
  );
}

function Encabezado({ lineas }) {
  return h(
    View,
    { style: { marginBottom: 14 } },
    h(Text, { style: { fontSize: 10.5, textAlign: "right", marginBottom: 10 } }, lineas[0]),
    ...lineas.slice(1).map((l, i) => h(Text, { key: i, style: { fontFamily: "Helvetica-Bold", fontSize: 10.5 } }, l)),
  );
}

// --- Documentos ------------------------------------------------------------------------------------

function DocGeneral(doc) {
  const esContrato = doc.emisor === "contrato";
  return h(
    Page,
    { size: "A4", style: { paddingBottom: 60, color: C.texto, fontFamily: "Helvetica" } },
    esContrato ? null : h(Membrete, { emisor: doc.emisor, codigo: doc.codigo }),
    h(
      View,
      { style: { paddingHorizontal: 44, paddingTop: esContrato ? 44 : 22 } },
      esContrato
        ? h(
            View,
            { style: { marginBottom: 16, alignItems: "center" } },
            h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 10, alignSelf: "flex-end", color: C.suave } }, doc.codigo),
            h(Text, { style: { fontFamily: "Times-Bold", fontSize: 15, textAlign: "center", marginTop: 6 } }, doc.titulo.toUpperCase()),
          )
        : h(Titulo, { doc }),
      doc.encabezado ? h(Encabezado, { lineas: doc.encabezado }) : null,
      doc.campos ? h(Campos, { campos: doc.campos }) : null,
      doc.tabla ? h(Tabla, { tabla: doc.tabla }) : null,
      doc.parrafos ? h(Parrafos, { parrafos: doc.parrafos, serif: esContrato || doc.emisor === "cafenube" || doc.emisor === "tecnofrio" && Boolean(doc.encabezado) }) : null,
      doc.checklist ? h(Checklist, { items: doc.checklist }) : null,
      doc.firmas ? h(Firmas, { firmas: doc.firmas }) : null,
      doc.sello ? h(Sello, { texto: doc.sello }) : null,
    ),
    h(Pie, { codigo: doc.codigo }),
  );
}

const FECHA_CHAT = "08/09/26";
const NOMBRE_CHAT = { "LUCÍA": "Lucía Herrera", DIEGO: "Diego TecnoFrío" };

function DocChatExportado(doc) {
  return h(
    Page,
    { size: "A4", style: { paddingBottom: 60, color: C.texto, fontFamily: "Helvetica" } },
    h(Membrete, { emisor: "chat", codigo: doc.codigo }),
    h(
      View,
      { style: { paddingHorizontal: 44, paddingTop: 22 } },
      h(Titulo, { doc }),
      h(Text, { style: { fontFamily: "Courier", fontSize: 9, color: C.suave, marginBottom: 12 } }, "Chat de WhatsApp con Diego TecnoFrío.txt · exportado el 10/09/26"),
      ...doc.mensajes.map((m, i) =>
        h(
          Text,
          { key: i, style: { fontFamily: "Courier", fontSize: 10.5, lineHeight: 1.45, marginBottom: 7 } },
          `[${FECHA_CHAT}, ${m.hora.split(", ")[1]}] ${NOMBRE_CHAT[m.quien]}: ${m.texto}`,
        ),
      ),
    ),
    h(Pie, { codigo: doc.codigo }),
  );
}

// Captura de pantalla de un celular (SVG → PNG), sin texto seleccionable.
function capturaPng(doc) {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const W = 780;
  const H = 1380;
  const wrap = (t, max) => {
    const out = [];
    let l = "";
    for (const w of t.split(" ")) {
      if ((l + " " + w).trim().length > max) {
        out.push(l);
        l = w;
      } else l = l ? `${l} ${w}` : w;
    }
    if (l) out.push(l);
    return out;
  };
  let y = 330;
  const burbujas = doc.mensajes
    .map((m) => {
      const propio = m.quien === "DIEGO"; // la captura es del teléfono de Diego
      const lineas = wrap(m.texto, 30);
      const bh = 46 + lineas.length * 40 + 20;
      const bw = Math.min(600, Math.max(...lineas.map((l) => l.length)) * 19 + 150);
      const x = propio ? W - 30 - bw : 30;
      const hora = m.hora.split(", ")[1];
      const g = `
        <rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="18" fill="${propio ? "#dcf8c6" : "#ffffff"}"/>
        ${lineas.map((l, i) => `<text x="${x + 24}" y="${y + 50 + i * 40}" font-size="32" fill="#111827" font-family="Helvetica, Arial">${esc(l)}</text>`).join("")}
        <text x="${x + bw - (propio ? 128 : 96)}" y="${y + bh - 18}" font-size="22" fill="#6b7280" font-family="Helvetica, Arial">${hora}</text>
        ${propio ? `<path d="M${x + bw - 44} ${y + bh - 27} l6 6 l12 -13 M${x + bw - 34} ${y + bh - 21} l12 -13" stroke="#34b7f1" stroke-width="3" fill="none"/>` : ""}`;
      y += bh + 26;
      return g;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#efe7dd"/>
    <rect width="${W}" height="70" fill="#054c44"/>
    <text x="40" y="48" font-size="28" fill="#ffffff" font-family="Helvetica, Arial" font-weight="bold">16:45</text>
    <rect x="${W - 90}" y="26" width="50" height="24" rx="5" fill="none" stroke="#ffffff" stroke-width="3"/>
    <rect x="${W - 86}" y="30" width="34" height="16" rx="2" fill="#ffffff"/>
    <rect width="${W}" height="130" y="70" fill="#075e54"/>
    <path d="M40 135 l-16 -16 l16 -16" stroke="#ffffff" stroke-width="5" fill="none"/>
    <circle cx="100" cy="135" r="36" fill="#cbd5e1"/>
    <text x="100" y="148" font-size="34" fill="#475569" text-anchor="middle" font-family="Helvetica, Arial" font-weight="bold">L</text>
    <text x="156" y="128" font-size="32" fill="#ffffff" font-family="Helvetica, Arial" font-weight="bold">Lucía Café Nube</text>
    <text x="156" y="164" font-size="24" fill="#d1fae5" font-family="Helvetica, Arial">en línea</text>
    <rect x="${W / 2 - 80}" y="240" width="160" height="46" rx="12" fill="#e1f2fb"/>
    <text x="${W / 2}" y="272" font-size="24" fill="#475569" text-anchor="middle" font-family="Helvetica, Arial">MARTES</text>
    ${burbujas}
    <rect x="20" y="${H - 110}" width="${W - 140}" height="80" rx="40" fill="#ffffff"/>
    <text x="70" y="${H - 58}" font-size="30" fill="#9ca3af" font-family="Helvetica, Arial">Mensaje</text>
    <circle cx="${W - 65}" cy="${H - 70}" r="40" fill="#128c7e"/>
  </svg>`;
  return new Resvg(svg, { font: { loadSystemFonts: true }, fitTo: { mode: "width", value: 1170 }, background: "#efe7dd" }).render().asPng();
}

function DocCaptura(doc) {
  const png = capturaPng(doc);
  return h(
    Page,
    { size: "A4", style: { paddingBottom: 60, color: C.texto, fontFamily: "Helvetica" } },
    h(Membrete, { emisor: "chat", codigo: doc.codigo, linea: "Captura de pantalla" }),
    h(
      View,
      { style: { paddingHorizontal: 44, paddingTop: 22, alignItems: "center" } },
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 13, alignSelf: "flex-start" } }, `${doc.codigo} · Captura de pantalla`),
      h(Text, { style: { fontSize: 9, color: C.suave, alignSelf: "flex-start", marginTop: 3, marginBottom: 14 } }, `${doc.origen} · imagen`),
      h(Image, { src: { data: png, format: "png" }, style: { width: 300, borderWidth: 1, borderColor: C.linea } }),
    ),
    h(Pie, { codigo: doc.codigo }),
  );
}

// --- Plantillas del grupo ---------------------------------------------------------------------------

function Banda({ codigo, titulo, sub }) {
  return h(
    View,
    { style: { backgroundColor: C.tinta, paddingHorizontal: 32, paddingVertical: 14, flexDirection: "row", alignItems: "center" } },
    h(
      View,
      { style: { flexGrow: 1 } },
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 15, color: "#5eead4" } }, titulo),
      h(Text, { style: { fontSize: 8.5, color: "#c4b5fd", marginTop: 2 } }, sub),
    ),
    h(Text, { style: { fontFamily: "Courier-Bold", fontSize: 11, color: "#ffffff" } }, codigo),
  );
}

function Linea({ label, ancho = 220 }) {
  return h(
    View,
    { style: { flexDirection: "row", alignItems: "flex-end", marginRight: 18 } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10 } }, `${label}: `),
    h(View, { style: { width: ancho, borderBottomWidth: 0.8, borderBottomColor: C.texto, marginBottom: 2 } }),
  );
}

function PlantillaMatriz(p) {
  const cols = [
    ["Hecho", "Qué ocurrió o qué se afirma", "20%"],
    ["Fuente", "Documento y página (CN-xx)", "14%"],
    ["Parte que lo sostiene", "Lucía, Diego o ambas", "13%"],
    ["Estado", "Confirmado, discutido o pendiente", "14%"],
    ["Relevancia", "Por qué importa", "19%"],
    ["Próxima pregunta", "Qué necesitamos investigar", "20%"],
  ];
  const ejemplo = ["Lucía recibió las cajas el martes.", "CN-02, 16:44", "Ambas", "Confirmado", "Separa la recepción de la instalación.", "¿Quién debía conseguir el módulo?"];
  const celda = (t, j, extra = {}) => h(Text, { key: j, style: { width: cols[j][2], padding: 5, fontSize: 8.5, borderRightWidth: j < 5 ? 0.5 : 0, borderRightColor: C.linea, ...extra } }, t);
  return h(
    Page,
    { size: "A4", orientation: "landscape", style: { paddingBottom: 50, color: C.texto, fontFamily: "Helvetica" } },
    h(Banda, { codigo: p.codigo, titulo: p.titulo, sub: "Taller PGR–UEES 2026 · Caso Café Nube / TecnoFrío" }),
    h(
      View,
      { style: { paddingHorizontal: 32, paddingTop: 14 } },
      h(View, { style: { flexDirection: "row", marginBottom: 12 } }, h(Linea, { label: "Grupo", ancho: 220 }), h(Linea, { label: "Camino", ancho: 200 })),
      h(
        View,
        { style: { borderWidth: 0.5, borderColor: C.linea } },
        h(
          View,
          { style: { flexDirection: "row", backgroundColor: "#eef2f7" } },
          ...cols.map((c, j) =>
            h(
              View,
              { key: j, style: { width: c[2], padding: 5, borderRightWidth: j < 5 ? 0.5 : 0, borderRightColor: C.linea } },
              h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 9 } }, c[0]),
              h(Text, { style: { fontSize: 7.5, color: C.suave, marginTop: 2 } }, c[1]),
            ),
          ),
        ),
        h(View, { style: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: C.linea } }, ...ejemplo.map((t, j) => celda(t, j, { color: C.suave, fontFamily: "Helvetica-Oblique" }))),
        ...Array.from({ length: 7 }, (_, i) =>
          h(View, { key: i, style: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: C.linea, height: 38 } }, ...cols.map((_, j) => celda("", j))),
        ),
      ),
      h(
        Text,
        { style: { fontSize: 8.5, color: C.suave, marginTop: 8 } },
        "La primera fila es un ejemplo. Pueden subir esta plantilla a la IA junto con los documentos y pedirle que la complete: después revisen fila por fila y marquen las inferencias como hipótesis.",
      ),
    ),
    h(Pie, { codigo: p.codigo }),
  );
}

function Caja({ label, alto = 60, nota }) {
  return h(
    View,
    { style: { marginBottom: 10 } },
    h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10.5 } }, label),
    nota ? h(Text, { style: { fontSize: 8.5, color: C.suave, marginTop: 1 } }, nota) : null,
    h(View, { style: { height: alto, borderWidth: 0.6, borderColor: C.linea, borderRadius: 4, marginTop: 4, backgroundColor: "#ffffff" } }),
  );
}

function Opcion({ label }) {
  return h(
    View,
    { style: { flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 5 } },
    h(Svg, { width: 10, height: 10, viewBox: "0 0 10 10" }, h(Rect, { x: 0.5, y: 0.5, width: 9, height: 9, stroke: C.texto, strokeWidth: 0.8, fill: "#ffffff" })),
    h(Text, { style: { marginLeft: 5, fontSize: 9.5 } }, label),
  );
}

function PlantillaHojaRuta(p) {
  const codigos = Object.values(TAL_DOCS)
    .map((d) => d.codigo)
    .sort();
  return h(
    Page,
    { size: "A4", style: { paddingBottom: 50, color: C.texto, fontFamily: "Helvetica" } },
    h(Banda, { codigo: p.codigo, titulo: p.titulo, sub: "Para la puesta en común · dos minutos por grupo" }),
    h(
      View,
      { style: { paddingHorizontal: 36, paddingTop: 16 } },
      h(View, { style: { flexDirection: "row", marginBottom: 14 } }, h(Linea, { label: "Grupo", ancho: 160 }), h(Linea, { label: "Integrantes", ancho: 200 })),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10.5, marginBottom: 5 } }, "1. El camino elegido"),
      h(
        View,
        { style: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 } },
        h(Opcion, { label: "Empezamos por los mensajes" }),
        h(Opcion, { label: "Empezamos por el contrato" }),
        h(Opcion, { label: "Que decida un tercero" }),
        h(Opcion, { label: "Mediación" }),
      ),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10.5, marginBottom: 5 } }, "2. Los documentos que consultamos"),
      h(View, { style: { flexDirection: "row", flexWrap: "wrap", marginBottom: 10 } }, ...codigos.map((c) => h(Opcion, { key: c, label: c }))),
      h(Caja, { label: "3. El prompt más útil", alto: 70, nota: "Cópienlo tal cual o resúmanlo." }),
      h(Caja, { label: "4. Un resultado de la IA que sirvió", alto: 50 }),
      h(Caja, { label: "5. Una corrección que hicimos", alto: 50, nota: "Qué dijo la IA, qué cambiamos y por qué." }),
      h(Caja, { label: "6. La cuestión que quedó pendiente", alto: 40 }),
      h(Text, { style: { fontFamily: "Helvetica-Bold", fontSize: 10.5, marginBottom: 5 } }, "7. Nuestro producto"),
      h(
        View,
        { style: { flexDirection: "row", flexWrap: "wrap" } },
        h(Opcion, { label: "Matriz de hechos y prueba" }),
        h(Opcion, { label: "Teoría del caso" }),
        h(Opcion, { label: "Agenda de mediación" }),
        h(Opcion, { label: "Propuesta de acuerdo" }),
      ),
    ),
    h(Pie, { codigo: p.codigo }),
  );
}

// --- Salida ---------------------------------------------------------------------------------------------

async function guardar(archivo, titulo, pagina) {
  const ruta = join(OUT, archivo);
  await renderToFile(h(Document, { title: titulo, author: "Taller PGR–UEES 2026 (documento ficticio)", language: "es" }, pagina), ruta);
  console.log("✓", archivo);
}

for (const doc of Object.values(TAL_DOCS)) {
  const pagina = doc.imagen ? DocCaptura(doc) : doc.tipo === "chat" ? DocChatExportado(doc) : DocGeneral(doc);
  await guardar(doc.archivo, `${doc.codigo} · ${doc.titulo}`, pagina);
}
await guardar(TAL_PLANTILLAS.PLB.archivo, `${TAL_PLANTILLAS.PLB.codigo} · ${TAL_PLANTILLAS.PLB.titulo}`, PlantillaMatriz(TAL_PLANTILLAS.PLB));
await guardar(TAL_PLANTILLAS.PLC.archivo, `${TAL_PLANTILLAS.PLC.codigo} · ${TAL_PLANTILLAS.PLC.titulo}`, PlantillaHojaRuta(TAL_PLANTILLAS.PLC));
