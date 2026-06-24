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

// --- Captura de chat de WhatsApp ----------------------------------------
function chatWhatsApp({ name, contacto, fecha, mensajes }) {
  const headerH = 72;
  const padX = 26;
  const fz = 19;
  const lh = 26;
  const charW = fz * 0.56;
  const bubbleMaxW = Math.floor(W * 0.68);
  const maxChars = Math.floor((bubbleMaxW - 44) / charW);

  let y = headerH + 56;
  const items = [];
  for (const m of mensajes) {
    const lines = wrap(m.text, maxChars);
    const longest = Math.max(...lines.map((l) => l.length), 8);
    const bw = Math.min(bubbleMaxW, 44 + longest * charW);
    const bh = 16 + lines.length * lh + 20;
    items.push({ m, lines, bw, bh, y });
    y += bh + 14;
  }
  const H = y + 24;

  const parts = [];
  parts.push(`<rect width="${W}" height="${H}" fill="#e5ddd5"/>`);
  // barra superior
  parts.push(`<rect width="${W}" height="${headerH}" fill="#075e54"/>`);
  parts.push(`<circle cx="46" cy="${headerH / 2}" r="22" fill="#cfd8dc"/>`);
  parts.push(`<text x="84" y="${headerH / 2 - 1}" font-family="${SANS}" font-size="20" font-weight="bold" fill="white">${esc(contacto)}</text>`);
  parts.push(`<text x="84" y="${headerH / 2 + 21}" font-family="${SANS}" font-size="13" fill="#b2dfdb">en línea</text>`);
  // chip de fecha
  parts.push(`<rect x="${W / 2 - 70}" y="${headerH + 12}" width="140" height="28" rx="14" fill="#d7e3df"/>`);
  parts.push(`<text x="${W / 2}" y="${headerH + 31}" text-anchor="middle" font-family="${SANS}" font-size="13" fill="#555">${esc(fecha)}</text>`);

  for (const it of items) {
    const mine = it.m.from === "yo";
    const x = mine ? W - padX - it.bw : padX;
    const fill = mine ? "#dcf8c6" : "#ffffff";
    parts.push(`<rect x="${x}" y="${it.y}" width="${it.bw}" height="${it.bh}" rx="12" fill="${fill}" stroke="#0001" stroke-width="1"/>`);
    let ty = it.y + 30;
    for (const ln of it.lines) {
      parts.push(`<text x="${x + 18}" y="${ty}" font-family="${SANS}" font-size="${fz}" fill="#111">${esc(ln)}</text>`);
      ty += lh;
    }
    parts.push(`<text x="${x + it.bw - 14}" y="${it.y + it.bh - 10}" text-anchor="end" font-family="${SANS}" font-size="12" fill="#888">${esc(it.m.hora)}</text>`);
  }
  render(name, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">\n  ${parts.join("\n  ")}\n</svg>`);
}

// --- Comprobante / transferencia / factura (tarjeta) --------------------
function comprobante({ name, banner, accent = "#1565c0", titulo, monto, montoLabel, filas, pie }) {
  const M = 56;
  const parts = [];
  let y = 0;
  parts.push(`<rect x="0" y="0" width="${W}" height="96" fill="${accent}"/>`);
  parts.push(`<text x="${M}" y="60" font-family="${SANS}" font-size="26" font-weight="bold" fill="white">${esc(banner)}</text>`);
  y = 150;
  if (titulo) {
    parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="19" font-weight="bold" fill="#111">${esc(titulo)}</text>`);
    y += 18;
  }
  if (monto) {
    y += 26;
    parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="14" fill="#888">${esc(montoLabel || "Importe")}</text>`);
    y += 46;
    parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="42" font-weight="bold" fill="#111">${esc(monto)}</text>`);
    y += 22;
  }
  parts.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="#e3e3e3" stroke-width="1"/>`);
  y += 36;
  for (const f of filas) {
    parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="15" fill="#888">${esc(f.k)}</text>`);
    parts.push(`<text x="${W - M}" y="${y}" text-anchor="end" font-family="${SANS}" font-size="15" font-weight="bold" fill="#111">${esc(f.v)}</text>`);
    y += 32;
  }
  if (pie) {
    y += 10;
    for (const ln of wrap(pie, 92)) {
      parts.push(`<text x="${M}" y="${y}" font-family="${SANS}" font-size="13" fill="#888">${esc(ln)}</text>`);
      y += 20;
    }
  }
  const H = y + M;
  render(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#eef2f6"/>
  <rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="white" stroke="#ccd6dd" stroke-width="2"/>
  ${parts.join("\n  ")}
</svg>`,
  );
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

// ===================== CASO FAMILIA =====================

chatWhatsApp({
  name: "familia-whatsapp",
  contacto: "Diego (papá de Lola)",
  fecha: "Septiembre 2023",
  mensajes: [
    { from: "yo", text: "Hola Diego, necesito que pases la cuota de este mes. Lola tiene el jardín y la obra social.", hora: "10:02" },
    { from: "otro", text: "Este mes no puedo, ando complicado con la guita.", hora: "13:47" },
    { from: "yo", text: "Es la tercera vez seguida. Yo sola no llego con el jardín ($95.000) más la obra social.", hora: "13:50" },
    { from: "yo", text: "Vi que te compraste la notebook nueva y posteaste el viaje. Necesito que te hagas cargo de tu hija.", hora: "13:52" },
    { from: "otro", text: "Después hablamos.", hora: "18:20" },
    { from: "yo", text: "Diego? Necesito una respuesta.", hora: "21:15" },
  ],
});

comprobante({
  name: "familia-transferencia",
  banner: "Transferencia realizada ✓",
  accent: "#2e7d32",
  titulo: "Comprobante de transferencia",
  monto: "$ 180.000,00",
  montoLabel: "Monto transferido",
  filas: [
    { k: "De", v: "Diego G." },
    { k: "Para", v: "L. P. (CBU ****4821)" },
    { k: "Concepto / Referencia", v: "alimentos" },
    { k: "Fecha", v: "05/03/2022" },
    { k: "N° de operación", v: "AR-2203-558410" },
  ],
  pie:
    "Comprobante de una época en que el progenitor sí aportaba (2022). Útil para mostrar que conocía el deber y la vía de pago.",
});

comprobante({
  name: "familia-comprobante-jardin",
  banner: "Jardín de Infantes “Los Girasoles”",
  accent: "#ef6c00",
  titulo: "Comprobante de cuota mensual",
  monto: "$ 95.000,00",
  montoLabel: "Cuota septiembre 2023",
  filas: [
    { k: "Alumna", v: "Lola G. P. (Sala de 3)" },
    { k: "Responsable de pago", v: "L. P. (la progenitora)" },
    { k: "Concepto", v: "Arancel mensual" },
    { k: "Estado", v: "PAGADO" },
  ],
  pie: "Acredita un gasto fijo de la niña a cargo exclusivo de la progenitora.",
});

// ===================== CASO CONSUMO =====================

docTexto({
  name: "consumo-contrato",
  tituloChico: "AUTOMOTORES DEL CENTRO S.A. — Concesionario Oficial",
  tituloGrande: "CONTRATO DE COMPRAVENTA 0 KM",
  meta: [
    { k: "COMPRADOR", v: "SÁNCHEZ, JULIÁN — DNI 30.222.111" },
    { k: "VENDEDOR", v: "AUTOMOTORES DEL CENTRO S.A." },
    { k: "FECHA", v: "14 de marzo de 2023" },
  ],
  cuerpo:
    "CLÁUSULA 3 (GARANTÍA). El comprador declara conocer y aceptar que la garantía del vehículo 0 km es otorgada y gestionada por la TERMINAL AUTOMOTRIZ (fabricante), conforme su red oficial.\n\n" +
    "CLÁUSULA 7 (MANTENIMIENTO). La validez de la garantía está condicionada a la realización de los services oficiales en los kilometrajes y plazos previstos en el Plan de Mantenimiento entregado con la unidad.\n\n" +
    "CLÁUSULA 9 (RECLAMOS). Canal de reclamos: mesa de atención de la concesionaria y/o de la terminal, por escrito.\n\n" +
    "FIRMA DEL COMPRADOR: Julián Sánchez — Aclaración: J. Sánchez — DNI 30.222.111",
  sello: { l1: "ACEPTADO", l2: "14/03/2023" },
});

recibo({
  name: "consumo-plan-mantenimiento",
  titulo: "PLAN DE MANTENIMIENTO — Vehículo 0 km",
  encabezado: [
    { k: "Unidad", v: "Modelo Sedán 1.6 — Dominio AB123CD" },
    { k: "Titular", v: "Sánchez, Julián" },
    { k: "Entregado con la unidad", v: "14/03/2023" },
  ],
  items: [
    { c: "Service 1 — control general", m: "10.000 km / 12 meses" },
    { c: "Service 2 — control general", m: "20.000 km / 24 meses" },
    { c: "Service 3 — control general", m: "30.000 km / 36 meses" },
  ],
  totales: [],
  nota:
    "ADVERTENCIA: la omisión de los services en los plazos previstos puede hacer caer la cobertura de garantía. Registro interno: Service 1 NO realizado (sin turno ni ingreso de la unidad).",
});

// ===================== CASO TRIBUNALES =====================

docTexto({
  name: "tribunales-sentencia",
  tituloChico: "PODER JUDICIAL DE TUCUMÁN · Juzgado del Trabajo N° 3",
  tituloGrande: "SENTENCIA N° 45/2024",
  meta: [
    { k: "AUTOS", v: "“Ríos, Marcela c/ Distribuidora del Sur S.A. s/ despido”" },
    { k: "EXPTE.", v: "N° 1234/24" },
    { k: "FECHA", v: "San Miguel de Tucumán, 3 de junio de 2024" },
  ],
  cuerpo:
    "VISTOS: Para resolver estos autos en los que Marcela Ríos demanda el pago de indemnización por despido sin causa, diferencias por comisiones y un adicional por trabajo en día sábado no registrado.\n\n" +
    "RESULTANDO: La actora ingresó el 03/04/2017 como vendedora (CCT 130/75) y fue despedida sin causa el 12/02/2024, hecho reconocido por la demandada. Reclamó: (a) antigüedad y preaviso; (b) comisiones adeudadas; (c) adicional por sábados trabajados. La demandada negó los sábados y las comisiones impagas.\n\n" +
    "CONSIDERANDO: I. El despido sin causa está reconocido; proceden la indemnización por antigüedad y el preaviso (art. 245 LCT). II. Sobre las comisiones: las dos testigos declararon de manera coincidente que existía un esquema de comisiones que en los últimos meses no se liquidaba completo; se les otorga pleno valor probatorio. III. La pericia contable del art. 52 LCT no se consideró necesaria.\n\n" +
    "RESUELVO: 1) Hacer lugar parcialmente a la demanda. 2) Condenar a la demandada a pagar antigüedad, preaviso y diferencias por comisiones, con más intereses y costas. 3) Rechazar el reclamo por trabajo en día sábado. REGÍSTRESE Y NOTIFÍQUESE. Fdo. Dr. J. M. Juez.",
});

console.log("\nListo. Imágenes en public/posta/img/");
