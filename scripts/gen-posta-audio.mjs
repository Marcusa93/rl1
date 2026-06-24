// ============================================================
// Genera los testimonios en audio (MP3) de La Posta.
// NotebookLM transcribe el audio → otra fuente para el caso (ejercita el
// speech-to-text, como las imágenes ejercitan el OCR).
//
// Voz: macOS `say -v Paulina` (es_MX). Pedido del docente: mexicana, por
// apuro; para tonada rioplatense habría que usar un TTS cloud (Azure es-AR).
//
// Uso:  node scripts/gen-posta-audio.mjs
// Salida: public/posta/audio/*.mp3   (requiere `say` y `lame`, macOS)
// ============================================================

import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "posta", "audio");
mkdirSync(OUT, { recursive: true });

const VOICE = "Paulina"; // es_MX, la de mejor calidad
const RATE = "180";

const TESTIMONIOS = [
  {
    name: "laboral-testimonio",
    text:
      "Mire, doctora, le voy a contar bien cómo fue todo. Yo entré a trabajar de vendedora en abril del dos mil diecisiete, en Distribuidora del Sur. Siempre cumplí, nunca falté. De lunes a viernes hacía mi horario de nueve de la mañana a seis de la tarde, pero además, casi todos los sábados, yo iba a abrir el local de nueve a una, y eso jamás me lo registraron ni me lo pagaron aparte. Durante un tiempo sí me pagaban comisiones por las ventas, pero en los últimos meses, de a poquito, dejaron de pagármelas completas. Yo les mandé una carta documento pidiendo que arreglaran lo de mi jornada y las comisiones que me debían, y nunca me contestaron nada. Una semana después, el doce de febrero, me llegó un telegrama diciendo que estaba despedida, sin causa, así, de un día para el otro. Me quedé sin trabajo y sin la liquidación que corresponde. Por eso vengo a verla, quiero saber qué es lo que puedo reclamar.",
  },
  {
    name: "familia-testimonio",
    text:
      "Doctora, le explico mi situación. Yo estoy separada del papá de mi hija desde hace casi dos años. Al principio él pasaba algo de dinero, pero muy irregular, y en los últimos seis meses prácticamente dejó de aportar. Mi hija tiene tres años, va a un jardín privado que pago yo, la tengo en mi obra social, y todos los gastos de ella los cubro sola. El papá trabaja como programador, le va bien, cobra de clientes del exterior, pero en los papeles figura que gana poquito porque factura como monotributista de la categoría más baja. Yo le escribo, le pido que se haga cargo, y me dice que no puede, y después ni me contesta los mensajes. Tengo capturas de cuando antes sí me transfería, con el concepto alimentos, así que él sabe perfectamente que tiene que hacerlo y cómo hacerlo. Necesito iniciar un reclamo de alimentos que cubra la cuota mensual del jardín, la obra social y los gastos de crianza de la nena.",
  },
  {
    name: "consumo-testimonio",
    text:
      "Buenas, le hablo en nombre de la concesionaria, Automotores del Centro. Nos llegó una demanda de un cliente, el señor Sánchez, por una supuesta falla del vehículo cero kilómetro que nos compró. Le aclaro cuál es nuestra posición. La garantía de fábrica la otorga y la administra la terminal automotriz, es decir el fabricante, no nosotros, y eso está expresamente firmado en el contrato de compraventa. Además, el cliente no cumplió con el plan de mantenimiento: el primer service nunca lo hizo, no pidió turno, no trajo el vehículo, y justamente la validez de la garantía depende de que esos services se hagan en tiempo y forma. Nosotros incluso le ofrecimos un turno de diagnóstico por correo y no obtuvimos respuesta. Por eso entendemos que el reclamo está mal dirigido y que fue el propio cliente quien incumplió. Queremos contestar la demanda con estos argumentos: nuestra falta de legitimación, el contrato de adhesión que él firmó y aceptó, y la propia conducta del actor.",
  },
  {
    name: "tribunales-testimonio",
    text:
      "Sí, voy a declarar lo que me consta. Yo trabajé con Marcela varios años en el mismo local, éramos compañeras de trabajo. Le puedo decir que los sábados a la mañana ella venía a abrir el local, eso lo vi muchísimas veces, llegaba como a las nueve y se quedaba hasta el mediodía o la una de la tarde. Eso era algo habitual, no era una vez cada tanto, era casi todas las semanas. Y sobre las comisiones, me consta que había un sistema de comisiones por las ventas, a todas nos las pagaban, pero en los últimos meses se las fueron recortando, y a Marcela varias veces no se las liquidaron completas. Lo sé porque lo hablábamos entre nosotras y ella se quejaba de que le faltaba esa plata en el recibo. Eso es lo que puedo declarar, lo que vi con mis propios ojos y lo que sé de primera mano.",
  },
];

for (const t of TESTIMONIOS) {
  const aiff = join(OUT, t.name + ".aiff");
  const mp3 = join(OUT, t.name + ".mp3");
  execFileSync("say", ["-v", VOICE, "-r", RATE, "-o", aiff, t.text]);
  execFileSync("lame", ["--quiet", "-m", "m", "-b", "96", aiff, mp3]);
  rmSync(aiff);
  console.log("✓", t.name + ".mp3");
}

console.log("\nListo. Audios en public/posta/audio/");
