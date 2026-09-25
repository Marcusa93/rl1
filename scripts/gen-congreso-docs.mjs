// Genera los PDF ficticios para probar el anonimizador de la ponencia del Congreso.
//   node scripts/gen-congreso-docs.mjs
// Salen en public/congreso/docs/ (se sirven en /congreso/docs/…). Son documentos
// inventados, llenos de datos personales a propósito: nombres escritos de varias
// formas, DNI, CUIL/CUIT, domicilios, teléfonos, correos, salud, montos y fechas.

import React from "react";
import { Document, Page, StyleSheet, Text, View, renderToFile } from "@react-pdf/renderer";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const h = React.createElement;
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const SALIDA = join(RAIZ, "public", "congreso", "docs");

const st = StyleSheet.create({
  page: { paddingTop: 56, paddingBottom: 56, paddingHorizontal: 64, fontFamily: "Times-Roman", fontSize: 11.5, lineHeight: 1.55 },
  aviso: { fontFamily: "Helvetica", fontSize: 7.5, color: "#9c2512", textAlign: "center", marginBottom: 18, letterSpacing: 0.6 },
  caratula: { fontFamily: "Times-Bold", fontSize: 12, textAlign: "center", marginBottom: 4 },
  sub: { fontSize: 10, textAlign: "center", color: "#333", marginBottom: 18 },
  titulo: { fontFamily: "Times-Bold", fontSize: 11.5, marginTop: 12, marginBottom: 4 },
  p: { textAlign: "justify", marginBottom: 7 },
  firma: { marginTop: 28, textAlign: "right", fontSize: 10.5 },
  pie: { position: "absolute", bottom: 26, left: 64, right: 64, fontFamily: "Helvetica", fontSize: 7, color: "#777", textAlign: "center" },
});

const AVISO = "DOCUMENTO FICTICIO · CREADO PARA UNA DEMOSTRACIÓN · PERSONAS, DATOS Y HECHOS INVENTADOS";

function doc(bloques) {
  return h(
    Document,
    null,
    h(
      Page,
      { size: "A4", style: st.page },
      h(Text, { style: st.aviso }, AVISO),
      ...bloques,
      h(Text, { style: st.pie, fixed: true, render: ({ pageNumber, totalPages }) => `${AVISO} — ${pageNumber}/${totalPages}` }),
    ),
  );
}
const C = (t) => h(Text, { style: st.caratula }, t);
const S = (t) => h(Text, { style: st.sub }, t);
const T = (t) => h(Text, { style: st.titulo }, t);
const P = (t) => h(Text, { style: st.p }, t);
const F = (t) => h(View, { style: st.firma }, ...t.split("\n").map((l) => h(Text, null, l)));

const DEMANDA = doc([
  C("LEDESMA, JORGE c/ DISTRIBUIDORA DEL VALLE S.R.L. s/ COBRO DE PESOS"),
  S("Expte. N.º 2211/2025 — Juzgado del Trabajo de la IIIa Nominación — Centro Judicial Capital, Tucumán"),
  T("PROMUEVE DEMANDA LABORAL"),
  P("Señor Juez:"),
  P("JORGE ALBERTO LEDESMA, argentino, DNI 24.567.890, CUIL 20-24567890-3, nacido el 03/05/1978, con domicilio real en calle San Martín 1450, Banda del Río Salí, Tucumán, teléfono 381-555-0192, correo electrónico jledesma.demo@correo.com, por derecho propio y con el patrocinio letrado de la Dra. Carolina Frías (M.P. 5.123), constituyendo domicilio procesal en calle 24 de Septiembre 612, 2.º piso, oficina B, San Miguel de Tucumán, y domicilio digital 20245678903, ante V.S. me presento y digo:"),
  T("I. OBJETO"),
  P("Que vengo a promover demanda por cobro de pesos contra DISTRIBUIDORA DEL VALLE S.R.L., CUIT 30-71234567-9, con domicilio en Ruta 9 km 1.302, Banda del Río Salí, por la suma de $ 18.432.000 (pesos dieciocho millones cuatrocientos treinta y dos mil) o lo que en más o en menos resulte de la prueba, con más intereses y costas."),
  T("II. HECHOS"),
  P("El Sr. Ledesma ingresó a trabajar para la demandada el 01/03/2016 como auxiliar de depósito, categoría Maestranza B del CCT 130/75, cumpliendo una jornada de lunes a sábado de 7 a 16 horas. Percibía una remuneración mensual de $ 1.100.000, de la cual $ 300.000 le eran abonados sin registrar."),
  P("El 15/09/2025 el encargado del depósito, Sr. Walter Ruiz, le impidió el ingreso al establecimiento. El 22/09/2025 mi mandante recibió la carta documento N.º CD 912345678 por la que se lo despedía invocando supuestas inasistencias injustificadas. Las inasistencias del 11/08/2025 y 12/08/2025 fueron justificadas con certificado médico de la Dra. Silvia Aráoz por una lumbalgia aguda con indicación de reposo de 48 horas."),
  P("LEDESMA, JORGE A. rechazó el despido por telegrama laboral del 25/09/2025. Ledesma tiene a su cargo a su cónyuge, María Eugenia Sosa (DNI 26.112.334), y a sus dos hijos menores de edad."),
  T("III. PRUEBA"),
  P("Documental: recibos de haberes, certificado médico, carta documento y telegrama. Testimonial: Sres. Pablo Medina (DNI 30.221.456, domiciliado en Pje. Lavalle 88, Banda del Río Salí) y Ramón Acosta. Informativa: al Correo Argentino y a la AFIP."),
  T("IV. PETITORIO"),
  P("Por lo expuesto, a V.S. pido: se me tenga por presentado, por parte y con domicilio constituido; se corra traslado de la demanda; oportunamente se haga lugar a la misma, con costas."),
  F("Dra. Carolina Frías — Abogada — M.P. 5.123\nJorge A. Ledesma — DNI 24.567.890"),
]);

const SENTENCIA = doc([
  C("PÉREZ, LUCÍA c/ TRANSPORTES DEL NORTE S.A. s/ DAÑOS Y PERJUICIOS"),
  S("Expte. N.º 1234/2024 — Juzgado Civil y Comercial Común de la IIIa Nominación — San Miguel de Tucumán, 14 de octubre de 2025"),
  T("SENTENCIA N.º 482"),
  P("Y VISTOS: los autos del epígrafe, en los que la Sra. Lucía Beatriz Pérez, DNI 31.456.789, con domicilio en Av. Mate de Luna 2330, departamento 4, San Miguel de Tucumán, demanda a Transportes del Norte S.A., CUIT 30-70999888-1, por los daños sufridos el 12/08/2023, y"),
  T("CONSIDERANDO:"),
  P("1. Que la actora sostiene que cruzaba por la senda peatonal de Av. Mate de Luna y Av. Mitre cuando fue embestida por el colectivo de la línea 102, dominio AB 123 CD, conducido por el Sr. Ramón Esteban Acosta, DNI 22.987.654, dependiente de la demandada."),
  P("2. Que la testigo Marta Juárez, DNI 28.334.901, declaró haber visto que el semáforo peatonal estaba habilitado. El perito mecánico, Ing. Hugo Villagra, estimó una velocidad de 52 km/h en una zona de 40 km/h."),
  P("3. Que el perito médico, Dr. Fernando Salas, dictaminó que la Sra. Pérez sufrió una fractura expuesta de tibia y peroné izquierdos, con una incapacidad parcial y permanente del 18%, y que presenta un trastorno de ansiedad postraumático que requiere tratamiento psicológico. La historia clínica del Hospital Padilla registra dos intervenciones quirúrgicas."),
  P("4. Que corresponde fijar la indemnización por incapacidad sobreviniente en $ 14.200.000, por daño moral en $ 5.000.000 y por gastos médicos en $ 1.200.000, sumas que devengarán intereses desde el 12/08/2023."),
  T("RESUELVO:"),
  P("I. HACER LUGAR a la demanda promovida por PÉREZ, LUCÍA BEATRIZ y condenar a Transportes del Norte S.A. y a La Previsora Seguros S.A. a pagarle la suma de $ 20.400.000 con más intereses, dentro de los diez días de quedar firme la presente. II. COSTAS a la demandada vencida. III. HONORARIOS: diferir su regulación. HÁGASE SABER."),
  F("Dra. Graciela Beatriz Nieva — Jueza\nAnte mí: Dr. Esteban Lobo — Secretario"),
]);

const ACTA = doc([
  C("ACTA DE MEDIACIÓN FAMILIAR N.º 3318/2025"),
  S("Centro de Mediación del Poder Judicial de Tucumán — San Miguel de Tucumán, 5 de septiembre de 2025"),
  P("En San Miguel de Tucumán, a los cinco días del mes de septiembre de 2025, ante la mediadora Dra. Paula Andrea Terán (Mat. 812), comparecen: por una parte, la Sra. Valeria Soledad Gómez, DNI 33.876.120, domiciliada en calle Laprida 1540, San Miguel de Tucumán, teléfono 381-444-7788, correo vgomez.demo@correo.com; y por la otra, el Sr. Martín Ríos, DNI 32.004.515, domiciliado en Barrio Oeste II, manzana F, casa 12, Yerba Buena, teléfono 381-433-2211."),
  P("Las partes son progenitoras de Tomás Ríos Gómez, de 9 años de edad, y de Lucía Ríos Gómez, de 6 años de edad, quienes conviven con la madre."),
  T("ACUERDO:"),
  P("PRIMERO: El Sr. Ríos abonará en concepto de cuota alimentaria la suma de $ 650.000 mensuales, del 1 al 10 de cada mes, mediante transferencia a la cuenta CBU 0110599520000012345678 de titularidad de la Sra. Gómez."),
  P("SEGUNDO: El régimen de comunicación será los fines de semana alternados, desde el sábado a las 10 hasta el domingo a las 20 horas. Tomás continuará su tratamiento fonoaudiológico en el Centro Crecer, cuyo costo será afrontado en partes iguales. Lucía presenta asma bronquial y la madre informará al padre cualquier internación."),
  P("TERCERO: Las partes se comprometen a mantener informado al otro progenitor sobre la escolaridad de los niños en la Escuela Nicolás Avellaneda."),
  P("Leída que les fue, las partes ratifican el acuerdo y firman de conformidad. Gómez y Ríos solicitan su homologación judicial."),
  F("Valeria S. Gómez — Martín Ríos\nDra. Paula A. Terán — Mediadora"),
]);

await renderToFile(DEMANDA, join(SALIDA, "demanda-ledesma.pdf"));
await renderToFile(SENTENCIA, join(SALIDA, "sentencia-perez.pdf"));
await renderToFile(ACTA, join(SALIDA, "acta-mediacion.pdf"));
console.log("Listo: public/congreso/docs/{demanda-ledesma,sentencia-perez,acta-mediacion}.pdf");
