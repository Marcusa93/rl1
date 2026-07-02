// ============================================================
// Genera material ficticio por rubro para la Clase 2 (/abc2), en varios
// formatos (Excel .xlsx, texto .txt, imagen .jpg con OCR), para que cada
// participante lo descargue y lo procese con su flujo de herramientas.
//
// Uso:  node scripts/gen-abc2-material.mjs
// Salida: public/abc2/material/*.{xlsx,txt,jpg}   (requiere xlsx, resvg, ffmpeg)
// ============================================================

import { Resvg } from "@resvg/resvg-js";
import * as XLSX from "xlsx";
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "abc2", "material");
mkdirSync(OUT, { recursive: true });

const W = 1000;
const SANS = "Helvetica, Arial, sans-serif";
const MONO = "Courier New, Courier, monospace";
const esc = (s) =>
  String(s)
    .replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{FE0F}\u{2B00}-\u{2BFF}]/gu, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function xlsx(name, aoa) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Hoja1");
  XLSX.writeFile(wb, join(OUT, name + ".xlsx"));
  console.log("✓", name + ".xlsx");
}
function txt(name, content) {
  writeFileSync(join(OUT, name + ".txt"), content, "utf8");
  console.log("✓", name + ".txt");
}
function jpg(name, svg) {
  const png = new Resvg(svg, { font: { loadSystemFonts: true }, background: "white" }).render().asPng();
  const tmp = join(OUT, name + ".png");
  writeFileSync(tmp, png);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, "-q:v", "3", join(OUT, name + ".jpg")]);
  rmSync(tmp);
  console.log("✓", name + ".jpg");
}
function wrap(text, max) {
  const out = [];
  for (const para of String(text).split("\n")) {
    if (!para.trim()) { out.push(""); continue; }
    let line = "";
    for (const w of para.split(/\s+/)) {
      if ((line + " " + w).trim().length > max) { if (line) out.push(line); line = w; }
      else line = line ? line + " " + w : w;
    }
    if (line) out.push(line);
  }
  return out;
}
// documento simple (cheque, carta, mail, consigna)
function imgDoc({ name, titulo, meta = [], cuerpo, mono = true }) {
  const M = 56, fz = 21, lh = 31;
  const font = mono ? MONO : SANS;
  const lines = wrap(cuerpo, Math.floor((W - 2 * M) / (fz * 0.6)));
  let y = M + 10;
  const parts = [`<text x="${M}" y="${y}" font-family="${font}" font-size="30" font-weight="bold" fill="#111">${esc(titulo)}</text>`];
  y += 16; parts.push(`<line x1="${M}" y1="${y}" x2="${W - M}" y2="${y}" stroke="#222" stroke-width="2"/>`); y += 34;
  for (const m of meta) { parts.push(`<text x="${M}" y="${y}" font-family="${font}" font-size="17" fill="#111"><tspan font-weight="bold">${esc(m.k)}:</tspan> ${esc(m.v)}</text>`); y += 27; }
  y += 14;
  for (const ln of lines) { parts.push(`<text x="${M}" y="${y}" font-family="${font}" font-size="${fz}" fill="#111">${esc(ln)}</text>`); y += lh; }
  const H = y + M;
  jpg(name, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#fbfbf7"/><rect x="18" y="18" width="${W - 36}" height="${H - 36}" fill="white" stroke="#999" stroke-width="2"/>${parts.join("")}</svg>`);
}
// captura de chat de WhatsApp
function imgChat({ name, contacto, mensajes }) {
  const headerH = 70, padX = 24, fz = 19, lh = 26, charW = fz * 0.56, bmax = Math.floor(W * 0.68);
  const maxCh = Math.floor((bmax - 44) / charW);
  let y = headerH + 40;
  const items = [];
  for (const m of mensajes) {
    const lines = wrap(m.t, maxCh);
    const bw = Math.min(bmax, 44 + Math.max(...lines.map((l) => l.length), 6) * charW);
    const bh = 16 + lines.length * lh + 16;
    items.push({ m, lines, bw, bh, y }); y += bh + 12;
  }
  const H = y + 20, parts = [`<rect width="${W}" height="${H}" fill="#e5ddd5"/>`, `<rect width="${W}" height="${headerH}" fill="#075e54"/>`, `<circle cx="42" cy="${headerH / 2}" r="20" fill="#cfd8dc"/>`, `<text x="76" y="${headerH / 2 + 5}" font-family="${SANS}" font-size="19" font-weight="bold" fill="white">${esc(contacto)}</text>`];
  for (const it of items) {
    const mine = it.m.yo, x = mine ? W - padX - it.bw : padX, fill = mine ? "#dcf8c6" : "#ffffff";
    parts.push(`<rect x="${x}" y="${it.y}" width="${it.bw}" height="${it.bh}" rx="12" fill="${fill}"/>`);
    let ty = it.y + 28;
    for (const ln of it.lines) { parts.push(`<text x="${x + 16}" y="${ty}" font-family="${SANS}" font-size="${fz}" fill="#111">${esc(ln)}</text>`); ty += lh; }
  }
  jpg(name, `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${parts.join("")}</svg>`);
}

// ===================== COMERCIO (bebidas / distribuidora) =====================
xlsx("comercio-ventas", [
  ["Fecha", "Producto", "Cantidad", "Precio unit.", "Total"],
  ["01/07", "Gaseosa 2.25L", 48, 1800, 86400],
  ["01/07", "Agua 2L", 60, 900, 54000],
  ["02/07", "Cerveza rubia 1L", 36, 2200, 79200],
  ["02/07", "Vino tinto", 24, 3500, 84000],
  ["03/07", "Fernet 750ml", 18, 9500, 171000],
  ["03/07", "Jugo 1L", 40, 1100, 44000],
  ["04/07", "Energizante", 30, 2500, 75000],
]);
txt("comercio-precios", `LISTA DE PRECIOS (ficticia) — Tienda de bebidas\n\nGaseosa 2.25L .......... $1.800\nAgua 2L ................ $900\nCerveza rubia 1L ....... $2.200\nVino tinto ............. $3.500\nFernet 750ml ........... $9.500\nJugo 1L ................ $1.100\nEnergizante ............ $2.500\n\nEnvíos: pedido mínimo $15.000. Zona centro y alrededores.`);
imgChat({ name: "comercio-pedido", contacto: "Cliente (bar La Esquina)", mensajes: [
  { yo: false, t: "Hola! Necesito para mañana temprano" },
  { yo: false, t: "2 cajas de cerveza rubia, 3 fernet y 6 gaseosas 2.25" },
  { yo: false, t: "Me pasás cuánto es y a qué hora llega?" },
  { yo: true, t: "Buenas! Te confirmo precio y horario en un rato" },
]});

// ===================== FINANZAS (financiera / contador) =====================
xlsx("finanzas-cheques", [
  ["N° Cheque", "Banco", "Emisor", "Monto", "Vencimiento", "Estado"],
  ["0041231", "Nación", "Distribuidora Sur SA", 850000, "05/07/2026", "A cobrar"],
  ["0087554", "Galicia", "Kiosco El Rápido", 120000, "08/07/2026", "A cobrar"],
  ["0012090", "Macro", "Ferretería Pérez", 340000, "03/07/2026", "VENCIDO"],
  ["0099821", "BBVA", "Almacén Doña Rosa", 210000, "12/07/2026", "A cobrar"],
  ["0055012", "Santander", "Taller Gómez", 480000, "06/07/2026", "A cobrar"],
]);
txt("finanzas-movimientos", `RESUMEN DE MOVIMIENTOS DEL MES (ficticio)\n\nINGRESOS\n- Cobros en efectivo: $1.250.000\n- Cheques cobrados: $2.100.000\n- Transferencias: $980.000\n\nEGRESOS\n- Pago a proveedores: $2.400.000\n- Sueldos: $900.000\n- Servicios e impuestos: $320.000\n- Gastos varios: $180.000\n\nPendiente: 5 cheques en cartera por $2.000.000 (uno vencido).`);
imgDoc({ name: "finanzas-cheque", titulo: "CHEQUE", meta: [
  { k: "Banco", v: "Banco de la Nación Argentina" },
  { k: "N°", v: "0041231" },
  { k: "Fecha de pago", v: "05/07/2026" },
], cuerpo: "Páguese a la orden de: PORTADOR\nLa suma de pesos: OCHOCIENTOS CINCUENTA MIL ($850.000)\nEmisor: Distribuidora Sur S.A. — CUIT 30-71234567-9\nFirma: __________________" });

// ===================== LEGAL (expedientes / abogacía) =====================
xlsx("legal-causas", [
  ["Expte.", "Carátula", "Fuero", "Estado", "Próxima fecha"],
  ["1234/24", "Ríos c/ Distribuidora s/ despido", "Laboral", "En prueba", "10/07/2026"],
  ["0876/25", "Pérez s/ alimentos", "Familia", "Audiencia", "08/07/2026"],
  ["2201/24", "Sánchez c/ Automotores s/ daños", "Civil", "A sentencia", "—"],
  ["0455/25", "López s/ sucesión", "Civil", "Inicio", "—"],
]);
txt("legal-expediente", `RESUMEN DE EXPEDIENTE (ficticio)\n\n"Pérez, Laura s/ alimentos" — Fuero de Familia\n\nHECHOS: La actora reclama cuota alimentaria para su hija de 4 años. El progenitor aporta de manera irregular. Se acompañan comprobantes de gastos (jardín, obra social) y capturas de mensajes.\n\nPRUEBA: recibos, testimonial de dos testigos, pedido de informe a la AFIP sobre ingresos del demandado.\n\nESTADO: audiencia fijada para el 08/07. Falta acompañar la última liquidación de gastos.`);
imgDoc({ name: "legal-carta-documento", titulo: "CARTA DOCUMENTO", meta: [
  { k: "Remitente", v: "Estudio Jurídico (por la actora)" },
  { k: "Destinatario", v: "Sr. J. Pérez" },
  { k: "Fecha", v: "28/06/2026" },
], cuerpo: "Intimo a Ud. plazo cinco (5) días a abonar la cuota alimentaria adeudada correspondiente a los últimos tres meses, bajo apercibimiento de iniciar la ejecución correspondiente. Quedando Ud. debidamente notificado." });

// ===================== GASTRO (pizzería / club-cantina / delivery) =====================
xlsx("gastro-pedidos", [
  ["Hora", "Cliente", "Pedido", "Estado", "Monto"],
  ["20:15", "Mesa 4", "2 muzzarella, 1 napolitana", "En horno", 18500],
  ["20:22", "Delivery - Juan", "1 especial, 6 empanadas", "En camino", 14200],
  ["20:30", "Mostrador", "1 fugazzeta, gaseosa", "Listo", 9800],
  ["20:41", "Mesa 7", "3 comunes, 2 cervezas", "Tomando", 22000],
]);
txt("gastro-menu", `MENÚ (ficticio)\n\nPIZZAS\n- Muzzarella ......... $7.500\n- Napolitana ......... $8.500\n- Fugazzeta .......... $8.000\n- Especial ........... $9.500\n\nPARA PICAR\n- Empanadas (docena) . $9.000\n- Papas fritas ....... $4.500\n\nBEBIDAS\n- Gaseosa 1.5L ....... $2.500\n- Cerveza 1L ......... $3.000\n\nPromo: 2 muzzarellas + gaseosa = $16.000`);
imgChat({ name: "gastro-reserva", contacto: "Cliente", mensajes: [
  { yo: false, t: "Hola! Tenés mesa para 6 esta noche a las 21?" },
  { yo: false, t: "Queremos ver el partido y comer unas pizzas" },
  { yo: true, t: "Hola! Sí, te reservo la mesa del fondo para las 21" },
  { yo: false, t: "Genial, gracias! Vamos llegando" },
]});

// ===================== GESTIÓN (banco / oficina / empresa) =====================
xlsx("gestion-reporte", [
  ["Área", "Responsable", "Tarea", "Estado", "Vence"],
  ["Ventas", "M. López", "Cerrar objetivo mensual", "En curso", "05/07"],
  ["Atención", "J. Díaz", "Reducir tiempos de respuesta", "Pendiente", "10/07"],
  ["Admin", "S. Ruiz", "Conciliar caja", "Listo", "01/07"],
  ["RRHH", "P. Gómez", "Planificar capacitación", "En curso", "15/07"],
]);
txt("gestion-informe", `INFORME SEMANAL (ficticio)\n\nEQUIPO: 8 personas, 3 áreas.\n\nLOGROS DE LA SEMANA\n- Se cerró el 80% del objetivo de ventas.\n- Bajó el tiempo de respuesta a clientes de 2 días a 1.\n\nPENDIENTES / TRABAS\n- Falta definir la capacitación del equipo.\n- Dos tareas administrativas atrasadas por falta de datos.\n\nPRÓXIMOS PASOS: reunión el lunes para priorizar.`);
imgDoc({ name: "gestion-mail", titulo: "Correo", mono: false, meta: [
  { k: "De", v: "gerencia@empresa.com" },
  { k: "Para", v: "equipo@empresa.com" },
  { k: "Asunto", v: "Objetivos de la semana" },
], cuerpo: "Hola equipo, necesito que cerremos el objetivo de ventas antes del viernes y que atención mejore los tiempos de respuesta. Cualquier traba, avísenme. El lunes nos juntamos a revisar. Gracias." });

// ===================== EDUCACIÓN (estudiante / docente) =====================
xlsx("educacion-notas", [
  ["Alumno", "Trabajo 1", "Prueba", "Oral", "Promedio"],
  ["Pérez, A.", 8, 7, 9, 8],
  ["Gómez, L.", 6, 5, 7, 6],
  ["Díaz, M.", 9, 10, 8, 9],
  ["Ruiz, S.", 4, 6, 5, 5],
]);
txt("educacion-apunte", `APUNTE (ficticio) — Historia, unidad 3\n\nLa Revolución de Mayo (1810)\n\n- Contexto: crisis de la monarquía española tras la invasión napoleónica.\n- 25 de mayo de 1810: se forma la Primera Junta de gobierno.\n- Causas internas: descontento con el virreinato, ideas de libertad.\n- Consecuencias: primer gobierno patrio, camino hacia la independencia (1816).\n\nPara la prueba: repasar causas internas y externas, y los nombres de la Primera Junta.`);
imgDoc({ name: "educacion-consigna", titulo: "Trabajo Práctico N° 3", mono: false, meta: [
  { k: "Materia", v: "Historia" },
  { k: "Entrega", v: "15/07/2026" },
], cuerpo: "Consigna: Elaborar un texto de una carilla explicando las causas internas y externas de la Revolución de Mayo. Incluir una línea de tiempo con los hechos principales. Trabajo individual, escrito a mano o en computadora." });

console.log("\nListo. Material en public/abc2/material/");
