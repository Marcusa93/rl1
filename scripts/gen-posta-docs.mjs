// ============================================================
// Genera los "instrumentos" diseñados de La Posta como PNG (imágenes),
// para que NotebookLM los ingiera vía OCR (es lo realista: el abogado
// sube la foto/escaneo del telegrama, la carta documento, el recibo…).
//
// Uso:  node scripts/gen-posta-docs.mjs
// Salida: public/posta/img/*.png
//
// resvg (@resvg/resvg-js) es devDependency: solo se usa acá, al generar.
// Las imágenes quedan commiteadas como estáticos; Vercel no corre esto.
// ============================================================

import { Resvg } from "@resvg/resvg-js";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "posta", "img");
mkdirSync(OUT, { recursive: true });

const W = 1000;
const MONO = "Courier New, Courier, monospace";
const SANS = "Helvetica, Arial, sans-serif";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Envuelve texto a `max` caracteres por línea (respeta saltos de párrafo).
function wrap(text, max) {
  const out = [];
  for (const para of String(text).split("\n")) {
    if (!para.trim()) {
      out.push("");
      continue;
    }
    let line = "";
    for (const w of para.split(/\s+/)) {
      if ((line + " " + w).trim().length > max) {
        if (line) out.push(line);
        line = w;
      } else {
        line = line ? line + " " + w : w;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

function render(name, svg) {
  const png = new Resvg(svg, { font: { loadSystemFonts: true }, background: "white" })
    .render()
    .asPng();
  writeFileSync(join(OUT, name + ".png"), png);
  console.log("✓", name + ".png", png.length, "bytes");
}

// --- Documento de texto (telegrama / carta documento) -------------------
function docTexto({ name, tituloChico, tituloGrande, meta, cuerpo, sello }) {
  const M = 56; // margen
  const fz = 22; // tamaño del cuerpo (monospace)
  const lh = 32; // alto de línea
  const maxChars = Math.floor((W - 2 * M) / (fz * 0.6));
  const lines = wrap(cuerpo, maxChars);

  let y = 0;
  const parts = [];
  // marco
  y = M + 8;
  parts.push(
    `<text x="${M}" y="${y}" font-family="${MONO}" font-size="16" fill="#444">${esc(tituloChico)}</text>`,
  );
  y += 44;
  parts.push(
    `<text x="${M}" y="${y}" font-family="${MONO}" font-size="34" font-weight="bold" fill="#111">${esc(tituloGrande)}</text>`,
  );
  y += 14;
  parts.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="#222" stroke-width="2"/>`);
  y += 36;
  for (const m of meta) {
    parts.push(
      `<text x="${M}" y="${y}" font-family="${MONO}" font-size="18" fill="#111"><tspan font-weight="bold">${esc(m.k)}:</tspan> ${esc(m.v)}</text>`,
    );
    y += 28;
  }
  y += 18;
  parts.push(`<line x1="${M}" y1="${y - 22}" x2="${W - M}" y2="${y - 22}" stroke="#bbb" stroke-width="1"/>`);
  for (const ln of lines) {
    parts.push(
      `<text x="${M}" y="${y}" font-family="${MONO}" font-size="${fz}" fill="#111">${esc(ln)}</text>`,
    );
    y += lh;
  }
  // sello
  y += 30;
  if (sello) {
    parts.push(
      `<g transform="translate(${W - M - 250}, ${y}) rotate(-6)"><rect x="0" y="0" width="250" height="78" rx="8" fill="none" stroke="#1a5" stroke-width="3"/><text x="125" y="32" text-anchor="middle" font-family="${SANS}" font-size="16" font-weight="bold" fill="#1a5">${esc(sello.l1)}</text><text x="125" y="56" text-anchor="middle" font-family="${SANS}" font-size="13" fill="#1a5">${esc(sello.l2)}</text></g>`,
    );
    y += 110;
  }
  const H = y + M;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#fbfbf7"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="white" stroke="#999" stroke-width="2"/>
  ${parts.join("\n  ")}
</svg>`;
  render(name, svg);
}

// --- Recibo de haberes (tabla) ------------------------------------------
function recibo({ name, titulo, encabezado, items, totales, nota }) {
  const M = 56;
  const parts = [];
  let y = M + 6;
  parts.push(
    `<text x="${M}" y="${y}" font-family="${SANS}" font-size="30" font-weight="bold" fill="#111">${esc(titulo)}</text>`,
  );
  y += 12;
  parts.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="#222" stroke-width="2"/>`);
  y += 34;
  for (const e of encabezado) {
    parts.push(
      `<text x="${M}" y="${y}" font-family="${SANS}" font-size="17" fill="#111"><tspan font-weight="bold">${esc(e.k)}:</tspan> ${esc(e.v)}</text>`,
    );
    y += 26;
  }
  y += 16;
  // cabecera de tabla
  const cR = W - M; // borde derecho (montos)
  parts.push(`<rect x="${M}" y="${y - 22}" width="${W - 2 * M}" height="30" fill="#eee"/>`);
  parts.push(`<text x="${M + 10}" y="${y}" font-family="${SANS}" font-size="16" font-weight="bold" fill="#111">Concepto</text>`);
  parts.push(`<text x="${cR - 10}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="16" font-weight="bold" fill="#111">Importe</text>`);
  y += 30;
  for (const it of items) {
    parts.push(`<text x="${M + 10}" y="${y}" font-family="${SANS}" font-size="16" fill="#111">${esc(it.c)}</text>`);
    parts.push(`<text x="${cR - 10}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="16" fill="#111">${esc(it.m)}</text>`);
    parts.push(`<line x1="${M}" y1="${y + 8}" x2="${cR}" y2="${y + 8}" stroke="#eee" stroke-width="1"/>`);
    y += 30;
  }
  y += 6;
  for (const t of totales) {
    parts.push(`<text x="${M + 10}" y="${y}" font-family="${SANS}" font-size="17" font-weight="bold" fill="#111">${esc(t.c)}</text>`);
    parts.push(`<text x="${cR - 10}" y="${y}" text-anchor="end" font-family="${MONO}" font-size="17" font-weight="bold" fill="#111">${esc(t.m)}</text>`);
    y += 28;
  }
  if (nota) {
    y += 14;
    for (const ln of wrap(nota, 92)) {
      parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="13" fill="#555">${esc(ln)}</text>`);
      y += 20;
    }
  }
  const H = y + M;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#f6f8fb"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="white" stroke="#999" stroke-width="2"/>
  ${parts.join("\n  ")}
</svg>`;
  render(name, svg);
}

// ===================== CASO LABORAL (piloto) =====================

docTexto({
  name: "laboral-telegrama",
  tituloChico: "CORREO ARGENTINO — Servicio de Telegrama Laboral",
  tituloGrande: "TELEGRAMA — LEY N° 23.789",
  meta: [
    { k: "REMITENTE", v: "DISTRIBUIDORA DEL SUR S.A." },
    { k: "DESTINATARIA", v: "RÍOS, MARCELA — DNI 28.444.555" },
    { k: "FECHA", v: "12 de febrero de 2024" },
  ],
  cuerpo:
    "Comunicamos a Ud. la extinción del vínculo laboral sin expresión de causa a partir de la fecha. Liquidación final y certificados de trabajo a su disposición en nuestras oficinas. Queda Ud. debidamente notificada.",
  sello: { l1: "DESPACHADO", l2: "12/02/2024 · 09:14" },
});

docTexto({
  name: "laboral-carta-documento",
  tituloChico: "CARTA DOCUMENTO — Pieza N° 7841/24",
  tituloGrande: "CARTA DOCUMENTO",
  meta: [
    { k: "REMITENTE", v: "RÍOS, MARCELA — DNI 28.444.555" },
    { k: "DESTINATARIO", v: "DISTRIBUIDORA DEL SUR S.A." },
    { k: "FECHA", v: "5 de febrero de 2024" },
  ],
  cuerpo:
    "Intimo a Ud. plazo 48 horas para que registren correctamente mi jornada laboral, incluyendo los días sábado trabajados de 9 a 13 hs desde mi ingreso el 03/04/2017, y abonen las comisiones por ventas adeudadas de los últimos seis meses. Todo ello bajo apercibimiento de considerarme injuriada y despedida por su exclusiva culpa, e iniciar las acciones legales correspondientes. Ratifico relación laboral, categoría Vendedora (CCT 130/75). Quedan Uds. notificados.",
  sello: { l1: "RECIBIDA", l2: "06/02/2024" },
});

recibo({
  name: "laboral-recibo",
  titulo: "RECIBO DE HABERES",
  encabezado: [
    { k: "Empleador", v: "Distribuidora del Sur S.A. — CUIT 30-71234567-9" },
    { k: "Empleada", v: "Ríos, Marcela — Legajo 084" },
    { k: "Categoría", v: "Vendedora — CCT 130/75 (Empleados de Comercio)" },
    { k: "Período", v: "Enero 2024 — Jornada registrada: Lunes a Viernes" },
  ],
  items: [
    { c: "Sueldo básico", m: "$ 432.000,00" },
    { c: "Antigüedad", m: "$ 48.000,00" },
    { c: "Comisiones por ventas", m: "$ 0,00" },
    { c: "Aportes jubilatorios (11%)", m: "-$ 52.800,00" },
    { c: "Obra social (3%)", m: "-$ 14.400,00" },
  ],
  totales: [
    { c: "Remuneración bruta", m: "$ 480.000,00" },
    { c: "Neto a cobrar", m: "$ 412.800,00" },
  ],
  nota:
    "Observación (no parte del recibo): la jornada figura de lunes a viernes; no se registran los sábados. El rubro comisiones figura en $0,00 (en recibos de oct/nov 2023 sí se liquidaban).",
});

console.log("\nListo. Imágenes en public/posta/img/");
