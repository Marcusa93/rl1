// ============================================================
// Genera material ficticio por rubro para la Clase 2 (/abc2), en varios
// formatos (Excel .xlsx largo, texto .txt largo, imagen .jpg con OCR).
// Uso:  node scripts/gen-abc2-material.mjs
// Salida: public/abc2/material/*.{xlsx,txt,jpg}
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
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const pad2 = (n) => String(n).padStart(2, "0");
const money = (n) => "$" + n.toLocaleString("es-AR");

function xlsx(name, aoa) {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, "Hoja1");
  XLSX.writeFile(wb, join(OUT, name + ".xlsx"));
  console.log("✓", name + ".xlsx", "(" + (aoa.length - 1) + " filas)");
}
function txt(name, content) {
  writeFileSync(join(OUT, name + ".txt"), content, "utf8");
  console.log("✓", name + ".txt", "(" + content.length + " car.)");
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
function imgDoc({ name, titulo, meta = [], cuerpo, mono = true }) {
  const M = 56, fz = 21, lh = 31, font = mono ? MONO : SANS;
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

// ===================== COMERCIO =====================
{
  const prod = [["Gaseosa 2.25L", "Bebidas sin alcohol", 1800], ["Agua 2L", "Bebidas sin alcohol", 900], ["Jugo 1L", "Bebidas sin alcohol", 1100], ["Cerveza rubia 1L", "Cervezas", 2200], ["Cerveza negra 1L", "Cervezas", 2600], ["Vino tinto", "Vinos", 3500], ["Vino blanco", "Vinos", 3200], ["Fernet 750ml", "Aperitivos", 9500], ["Gin 750ml", "Destilados", 12000], ["Whisky 750ml", "Destilados", 18000], ["Energizante", "Bebidas sin alcohol", 2500], ["Soda sifón", "Bebidas sin alcohol", 1200]];
  const pago = ["Efectivo", "Transferencia", "Débito", "Cuenta corriente"];
  const rows = [["Fecha", "Producto", "Categoría", "Cantidad", "Precio unit.", "Total", "Pago"]];
  for (let d = 1; d <= 28; d++) for (let k = 0; k < 2 + (d % 3); k++) {
    const p = prod[(d * 3 + k) % prod.length], cant = 6 + ((d + k) % 8) * 6;
    rows.push([pad2(d) + "/07/2026", p[0], p[1], cant, p[2], cant * p[2], pago[(d + k) % pago.length]]);
  }
  xlsx("comercio-ventas", rows);
  let precios = "LISTA DE PRECIOS (ficticia) — Tienda de bebidas 'LAND'\nVigente desde el 01/07/2026. Precios finales por unidad. Sujetos a cambio sin previo aviso.\n\n";
  const cats = {};
  for (const p of prod) (cats[p[1]] = cats[p[1]] || []).push(p);
  for (const [cat, items] of Object.entries(cats)) {
    precios += "== " + cat.toUpperCase() + " ==\n";
    for (const it of items) precios += "- " + it[0].padEnd(22, ".") + " " + money(it[2]) + "\n";
    precios += "\n";
  }
  precios += "CONDICIONES DE VENTA\n- Pedido mínimo para envío: " + money(15000) + ".\n- Zona centro y alrededores. Consultar otras zonas.\n- Cuenta corriente para clientes habituales (bares y kioscos), a 30 días.\n- Descuento del 10% por compra mayor a " + money(80000) + ".\n\nPROMOS DEL MES\n- 12 cervezas rubias: " + money(24000) + " (10% off).\n- Combo previa: 1 fernet + 2 gaseosas 2.25L = " + money(12000) + ".\n- 6 vinos surtidos: " + money(19000) + ".\n\nHORARIOS\nLunes a sábados de 9 a 13 y de 17 a 21. Domingos de 10 a 13.\nEntregas: de 10 a 12 y de 17 a 20.\n\nCONTACTO\nWhatsApp de pedidos: (0381) 15-xxx-xxxx. Instagram: @land.bebidas";
  txt("comercio-precios", precios);
  imgChat({ name: "comercio-pedido", contacto: "Cliente (bar La Esquina)", mensajes: [
    { yo: false, t: "Hola! Necesito para mañana temprano" },
    { yo: false, t: "2 cajas de cerveza rubia, 3 fernet y 6 gaseosas 2.25" },
    { yo: false, t: "Me pasás cuánto es y a qué hora llega?" },
    { yo: true, t: "Buenas! Te confirmo precio y horario en un rato" },
  ]});
}

// ===================== FINANZAS =====================
{
  const bancos = ["Nación", "Galicia", "Macro", "BBVA", "Santander", "Provincia", "Credicoop", "Comafi"];
  const emis = ["Distribuidora Sur SA", "Kiosco El Rápido", "Ferretería Pérez", "Almacén Doña Rosa", "Taller Gómez", "Panadería La Espiga", "Corralón San Juan", "Farmacia del Centro", "Verdulería Norte", "Librería Pizarrón"];
  const rows = [["N° Cheque", "Banco", "Emisor", "Monto", "Emisión", "Vencimiento", "Estado"]];
  for (let i = 0; i < 30; i++) {
    const monto = 90000 + ((i * 37) % 40) * 21000;
    const venc = 1 + ((i * 7) % 28);
    const estado = venc < 3 ? "VENCIDO" : venc < 10 ? "Próximo" : "A cobrar";
    rows.push(["00" + (41000 + i * 137), bancos[i % bancos.length], emis[i % emis.length], monto, pad2(1 + (i % 25)) + "/06/2026", pad2(venc) + "/07/2026", estado]);
  }
  xlsx("finanzas-cheques", rows);
  txt("finanzas-movimientos", `RESUMEN DE MOVIMIENTOS (ficticio) — Mes: Junio 2026\n\n=== INGRESOS ===\nCobros en efectivo ................ ${money(1250000)}\nCheques cobrados .................. ${money(2100000)}\nTransferencias recibidas .......... ${money(980000)}\nVentas con tarjeta (neto) ......... ${money(640000)}\nTOTAL INGRESOS .................... ${money(4970000)}\n\n=== EGRESOS ===\nPago a proveedores ................ ${money(2400000)}\nSueldos y cargas .................. ${money(900000)}\nAlquiler .......................... ${money(350000)}\nServicios (luz, gas, internet) .... ${money(180000)}\nImpuestos (IIBB, monotributo) ..... ${money(220000)}\nCombustible / fletes .............. ${money(140000)}\nGastos varios ..................... ${money(160000)}\nTOTAL EGRESOS ..................... ${money(4350000)}\n\n=== RESULTADO ===\nResultado del mes ................. ${money(620000)}\n\n=== CHEQUES EN CARTERA ===\nSe mantienen 30 cheques por un total aproximado de ${money(9800000)}.\nDe esos, 4 están vencidos (${money(1350000)}) y 6 vencen en los próximos 10 días.\nAcción sugerida: priorizar la gestión de cobro de los vencidos y avisar a los emisores de los próximos.\n\n=== OBSERVACIONES ===\n- Los cobros en efectivo cayeron 8% respecto de mayo.\n- Subió el uso de transferencias (buena señal para la conciliación).\n- Un proveedor aumentó 12% y conviene renegociar o buscar alternativa.\n- Revisar la cuenta corriente de 3 clientes que se atrasaron más de 30 días.`);
  imgDoc({ name: "finanzas-cheque", titulo: "CHEQUE", meta: [
    { k: "Banco", v: "Banco de la Nación Argentina" }, { k: "N°", v: "0041231" }, { k: "Fecha de pago", v: "05/07/2026" },
  ], cuerpo: "Páguese a la orden de: PORTADOR\nLa suma de pesos: OCHOCIENTOS CINCUENTA MIL ($850.000)\nEmisor: Distribuidora Sur S.A. — CUIT 30-71234567-9\nFirma: __________________" });
}

// ===================== LEGAL =====================
{
  const car = ["Ríos c/ Distribuidora s/ despido", "Pérez s/ alimentos", "Sánchez c/ Automotores s/ daños", "López s/ sucesión", "Gómez c/ Obra Social s/ amparo", "Díaz c/ Consorcio s/ daños", "Ruiz s/ divorcio", "Torres c/ Banco s/ nulidad", "Vega c/ Empresa s/ despido", "Núñez s/ tenencia"];
  const fueros = ["Laboral", "Familia", "Civil", "Civil", "Contencioso", "Civil", "Familia", "Comercial", "Laboral", "Familia"];
  const est = ["Inicio", "En prueba", "Audiencia", "A sentencia", "Apelación", "En trámite"];
  const rows = [["Expte.", "Carátula", "Fuero", "Estado", "Última actuación", "Próxima fecha"]];
  for (let i = 0; i < 20; i++) {
    const venc = i % 3 === 0 ? "—" : pad2(1 + ((i * 5) % 27)) + "/07/2026";
    rows.push([(1000 + i * 47) + "/2" + (4 + (i % 2)), car[i % car.length], fueros[i % fueros.length], est[i % est.length], pad2(1 + (i % 25)) + "/06/2026", venc]);
  }
  xlsx("legal-causas", rows);
  txt("legal-expediente", `RESUMEN DE EXPEDIENTE (ficticio)\nCarátula: "Pérez, Laura c/ Gómez, Juan s/ alimentos"\nFuero: Familia — Juzgado N° 2\n\n1. PARTES\n- Actora: Laura Pérez, en representación de su hija menor (4 años).\n- Demandado: Juan Gómez, progenitor.\n\n2. OBJETO\nSe reclama la fijación de una cuota alimentaria a favor de la hija. La actora manifiesta que el demandado aporta de manera irregular e insuficiente desde hace ocho meses.\n\n3. HECHOS\n- Las partes se separaron hace dos años. Al inicio el demandado aportaba una suma mensual, que fue reduciéndose.\n- En los últimos seis meses los aportes fueron esporádicos, por debajo de las necesidades de la niña.\n- La niña asiste a un jardín privado y tiene cobertura de obra social a cargo de la actora.\n- El demandado trabaja de manera independiente; se presume una capacidad económica mayor a la declarada.\n\n4. PRUEBA OFRECIDA\n- Documental: comprobantes de gastos (jardín, obra social, salud), capturas de mensajes.\n- Testimonial: dos testigos del entorno familiar.\n- Informativa: oficios a entidades bancarias y a la AFIP para acreditar ingresos.\n- Pericial: contable, sobre movimientos del demandado.\n\n5. NORMATIVA APLICABLE\n- Código Civil y Comercial: deber alimentario de los progenitores; contenido de la cuota; proporcionalidad según necesidades e ingresos.\n\n6. ESTADO PROCESAL\n- Se corrió traslado de la demanda; el demandado contestó negando la insuficiencia.\n- Se fijó audiencia preliminar para el 08/07/2026.\n- Pendiente: acompañar la última liquidación de gastos y diligenciar los oficios.\n\n7. ESTRATEGIA / PENDIENTES\n- Actualizar el detalle de gastos mensuales de la niña.\n- Insistir con el oficio a la AFIP para acreditar ingresos reales.\n- Evaluar pedido de cuota alimentaria provisoria mientras tramita el principal.`);
  imgDoc({ name: "legal-carta-documento", titulo: "CARTA DOCUMENTO", meta: [
    { k: "Remitente", v: "Estudio Jurídico (por la actora)" }, { k: "Destinatario", v: "Sr. J. Gómez" }, { k: "Fecha", v: "28/06/2026" },
  ], cuerpo: "Intimo a Ud. plazo cinco (5) días a abonar la cuota alimentaria adeudada correspondiente a los últimos tres meses, bajo apercibimiento de iniciar la ejecución correspondiente y reclamar intereses. Quedando Ud. debidamente notificado." });
}

// ===================== GASTRO =====================
{
  const items = ["1 muzzarella", "1 napolitana", "1 fugazzeta", "1 especial", "2 comunes", "6 empanadas", "12 empanadas", "1 docena empanadas + gaseosa", "papas fritas", "2 muzzarellas + gaseosa"];
  const tipo = ["Mesa 1", "Mesa 2", "Mesa 3", "Mesa 4", "Mesa 5", "Delivery - Juan", "Delivery - Ana", "Delivery - Pedro", "Mostrador", "Take away"];
  const estados = ["Pedido", "En horno", "Listo", "Entregado", "En camino"];
  const rows = [["Hora", "Cliente/Mesa", "Pedido", "Estado", "Monto"]];
  for (let i = 0; i < 40; i++) {
    const h = 20 + Math.floor(i / 12), m = (i * 7) % 60;
    rows.push([pad2(h) + ":" + pad2(m), tipo[i % tipo.length], items[i % items.length], estados[i % estados.length], 8000 + ((i * 13) % 20) * 900]);
  }
  xlsx("gastro-pedidos", rows);
  txt("gastro-menu", `MENÚ (ficticio) — Pizzería / Cantina\n\n== PIZZAS (grande, 8 porciones) ==\n- Muzzarella .................... ${money(7500)}\n- Napolitana ................... ${money(8500)}\n- Fugazzeta .................... ${money(8000)}\n- Fugazzeta rellena ............ ${money(10500)}\n- Especial (jamón y morrón) .... ${money(9500)}\n- Calabresa ................... ${money(9000)}\n- Roquefort .................... ${money(9800)}\n- Cuatro quesos ................ ${money(10500)}\n\n== EMPANADAS (unidad) ==\n- Carne / Pollo / J&Q / Verdura . ${money(900)}\n- Docena surtida .............. ${money(9600)}\n\n== PARA PICAR ==\n- Papas fritas ................. ${money(4500)}\n- Papas con cheddar ........... ${money(6500)}\n- Provoleta ................... ${money(5500)}\n\n== BEBIDAS ==\n- Gaseosa 1.5L ................. ${money(2500)}\n- Cerveza 1L ................... ${money(3000)}\n- Agua / saborizada ........... ${money(1500)}\n- Vino de la casa ............. ${money(4000)}\n\n== PROMOS ==\n- Lunes/martes: 2 muzzarellas = ${money(13000)}\n- Combo partido: 1 grande + 6 empanadas + gaseosa = ${money(16000)}\n- Happy hour (18 a 20): cerveza 1L a ${money(2200)}\n\nDelivery: pedido mínimo ${money(7000)}. Zona: centro y barrios cercanos.\nReservas y pedidos por WhatsApp. Atendemos de 19 a 00:30, jueves a domingo.`);
  imgChat({ name: "gastro-reserva", contacto: "Cliente", mensajes: [
    { yo: false, t: "Hola! Tenés mesa para 6 esta noche a las 21?" },
    { yo: false, t: "Queremos ver el partido y comer unas pizzas" },
    { yo: true, t: "Hola! Sí, te reservo la mesa del fondo para las 21" },
    { yo: false, t: "Genial, gracias! Vamos llegando" },
  ]});
}

// ===================== GESTIÓN =====================
{
  const areas = ["Ventas", "Atención", "Administración", "RRHH", "Marketing", "Logística"];
  const resp = ["M. López", "J. Díaz", "S. Ruiz", "P. Gómez", "C. Torres", "A. Vega"];
  const tareas = ["Cerrar objetivo mensual", "Reducir tiempos de respuesta", "Conciliar caja", "Planificar capacitación", "Campaña de redes", "Optimizar rutas de entrega", "Actualizar base de clientes", "Revisar proveedores", "Encuesta de satisfacción", "Informe de resultados"];
  const est = ["Pendiente", "En curso", "Listo", "Demorado"];
  const rows = [["Área", "Responsable", "Tarea", "Prioridad", "Estado", "Vence"]];
  for (let i = 0; i < 24; i++) {
    rows.push([areas[i % areas.length], resp[i % resp.length], tareas[i % tareas.length], ["Alta", "Media", "Baja"][i % 3], est[i % est.length], pad2(1 + ((i * 3) % 28)) + "/07"]);
  }
  xlsx("gestion-reporte", rows);
  txt("gestion-informe", `INFORME SEMANAL (ficticio) — Semana del 23 al 29 de junio\n\nEQUIPO: 12 personas distribuidas en 6 áreas.\n\n1. RESUMEN EJECUTIVO\nLa semana cerró con un cumplimiento del 82% de los objetivos previstos. Se destacan mejoras en atención al cliente y una demora en dos iniciativas de marketing por falta de definiciones.\n\n2. LOGROS\n- Ventas: se alcanzó el 82% del objetivo mensual, con buen ritmo para cerrar el mes.\n- Atención: el tiempo de respuesta bajó de 2 días a 1, tras reorganizar la bandeja de mensajes.\n- Administración: se concilió la caja de mayo y se pusieron al día dos cuentas corrientes.\n- Logística: se probó una nueva ruta de entrega que ahorró combustible.\n\n3. PENDIENTES Y TRABAS\n- Marketing: la campaña de redes está frenada esperando aprobación de contenidos.\n- RRHH: falta definir fecha y temario de la capacitación del equipo.\n- Dos tareas administrativas atrasadas por falta de datos de otras áreas.\n\n4. INDICADORES\n- Objetivo de ventas: 82%.\n- Tiempo de respuesta: 1 día (antes 2).\n- Tareas cerradas en la semana: 14 de 24.\n\n5. PRÓXIMOS PASOS\n- Reunión el lunes para priorizar las tareas demoradas.\n- Aprobar los contenidos de la campaña.\n- Cerrar el temario de capacitación antes del viernes.`);
  imgDoc({ name: "gestion-mail", titulo: "Correo", mono: false, meta: [
    { k: "De", v: "gerencia@empresa.com" }, { k: "Para", v: "equipo@empresa.com" }, { k: "Asunto", v: "Objetivos de la semana" },
  ], cuerpo: "Hola equipo, necesito que cerremos el objetivo de ventas antes del viernes y que atención mantenga los tiempos de respuesta en un día. Marketing, por favor destrabemos la campaña esta semana. Cualquier cosa que los frene, avísenme cuanto antes. El lunes nos juntamos a priorizar. Gracias por el laburo." });
}

// ===================== EDUCACIÓN =====================
{
  const apellidos = ["Pérez", "Gómez", "Díaz", "Ruiz", "Torres", "Vega", "Núñez", "López", "Sosa", "Molina", "Ríos", "Castro", "Ortiz", "Silva", "Romero", "Herrera", "Medina", "Flores", "Acosta", "Benítez"];
  const rows = [["Alumno", "Trabajo 1", "Prueba escrita", "Oral", "Trabajo 2", "Promedio"]];
  for (let i = 0; i < 20; i++) {
    const n = [4 + (i % 7), 3 + ((i * 3) % 8), 5 + ((i * 2) % 6), 4 + ((i * 5) % 7)];
    const prom = Math.round((n.reduce((a, b) => a + b, 0) / 4) * 10) / 10;
    rows.push([apellidos[i] + ", " + "ABCDEFGHIJKLMNOPQRST"[i] + ".", n[0], n[1], n[2], n[3], prom]);
  }
  xlsx("educacion-notas", rows);
  txt("educacion-apunte", `APUNTE (ficticio) — Historia, Unidad 3: La Revolución de Mayo\n\n1. CONTEXTO EUROPEO\nEn 1808 Napoleón invadió España y tomó prisionero al rey Fernando VII. Su hermano José fue puesto en el trono. Esto generó una crisis de legitimidad: muchos americanos se preguntaban a quién debían obedecer si el rey estaba cautivo.\n\n2. SITUACIÓN EN EL RÍO DE LA PLATA\n- El Virreinato del Río de la Plata dependía de España.\n- Las ideas de libertad e igualdad (Revolución Francesa, independencia de EE.UU.) circulaban entre criollos educados.\n- Había descontento con el monopolio comercial y con el poder de los españoles peninsulares.\n\n3. LA SEMANA DE MAYO (18 al 25 de mayo de 1810)\n- Llega la noticia de la caída de la Junta de Sevilla.\n- Los criollos piden un Cabildo Abierto para decidir el futuro del gobierno.\n- El 22 de mayo se debate: ¿sigue el virrey o se forma un nuevo gobierno?\n- El 25 de mayo se forma la Primera Junta, presidida por Cornelio Saavedra.\n\n4. LA PRIMERA JUNTA\nPresidente: Cornelio Saavedra. Secretarios: Mariano Moreno y Juan José Paso. Vocales: Manuel Belgrano, Juan José Castelli, Miguel de Azcuénaga, Manuel Alberti, Domingo Matheu y Juan Larrea.\n\n5. CAUSAS (repaso para la prueba)\n- Externas: invasión napoleónica, crisis de la monarquía española, ideas revolucionarias.\n- Internas: descontento criollo, monopolio comercial, deseo de autogobierno.\n\n6. CONSECUENCIAS\n- Primer gobierno patrio.\n- Inicio del proceso que llevó a la Declaración de la Independencia (9 de julio de 1816).\n\nPARA ESTUDIAR: repasar la diferencia entre causas internas y externas, la fecha clave (25/05/1810) y los integrantes de la Primera Junta.`);
  imgDoc({ name: "educacion-consigna", titulo: "Trabajo Práctico N° 3", mono: false, meta: [
    { k: "Materia", v: "Historia" }, { k: "Entrega", v: "15/07/2026" },
  ], cuerpo: "Consigna: Elaborar un texto de una carilla explicando las causas internas y externas de la Revolución de Mayo. Incluir una línea de tiempo con los hechos principales de la Semana de Mayo. Nombrar a los integrantes de la Primera Junta. Trabajo individual, a mano o en computadora." });
}

console.log("\nListo. Material en public/abc2/material/");
