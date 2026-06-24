// ============================================================
// Genera los testimonios en audio (MP3) de La Posta con ElevenLabs.
// NotebookLM transcribe el audio → otra fuente del caso (speech-to-text,
// como las imágenes ejercitan el OCR).
//
// Voces premade de ElevenLabs (naturales, funcionan en plan free), modelo
// eleven_multilingual_v2, texto en español rioplatense (voseo).
// La voz clonada argentina requiere plan pago; estas premade son neutras
// pero mucho menos robóticas que `say`.
//
// Uso:  ELEVENLABS_API_KEY=sk_... node scripts/gen-posta-audio.mjs
// Salida: public/posta/audio/*.mp3
// La key NUNCA se commitea: se pasa por variable de entorno.
// ============================================================

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Falta ELEVENLABS_API_KEY (pasala por env, no la escribas en el archivo).");
  process.exit(1);
}

const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "posta", "audio");
mkdirSync(OUT, { recursive: true });

const MODEL = "eleven_multilingual_v2";

// Voces premade (disponibles en plan free). Distintas por personaje.
const SARAH = "EXAVITQu4vr4xnSDxMaL";
const RACHEL = "21m00Tcm4TlvDq8ikWAM";
const ADAM = "pNInz6obpgDQGcFmaJgB";
const MATILDA = "XrExE9yKIg1WjnnlVkGX";

const TESTIMONIOS = [
  {
    name: "laboral-testimonio",
    voice: SARAH,
    text:
      "Mirá, doctora, te cuento bien cómo fue todo. Entré a laburar de vendedora en abril de 2017, en Distribuidora del Sur. Siempre cumplí, nunca falté. De lunes a viernes hacía de nueve a seis, pero además, casi todos los sábados, iba a abrir el local de nueve a una, y eso nunca me lo registraron ni me lo pagaron aparte. Un tiempo me pagaban comisiones por las ventas, pero en los últimos meses, de a poco, dejaron de pagármelas completas. Les mandé una carta documento pidiendo que arreglaran lo de la jornada y las comisiones que me debían, y nunca me contestaron nada. Una semana después, el doce de febrero, me llegó un telegrama: despedida, sin causa, de un día para el otro. Me quedé sin laburo y sin la liquidación que corresponde. Por eso vengo a verte, quiero saber qué puedo reclamar.",
  },
  {
    name: "familia-testimonio",
    voice: RACHEL,
    text:
      "Doctora, te explico mi situación. Estoy separada del papá de mi hija desde hace casi dos años. Al principio pasaba algo de plata, pero re irregular, y en los últimos seis meses prácticamente dejó de aportar. Mi hija tiene tres años, va a un jardín privado que pago yo, la tengo en mi obra social, y todos los gastos los cubro sola. El papá es programador, le va bien, factura para clientes del exterior, pero en los papeles figura que gana poquito porque está en el monotributo más bajo. Le escribo, le pido que se haga cargo, me dice que no puede, y después ni me contesta. Tengo capturas de cuando antes sí me transfería, con el concepto alimentos, así que sabe perfectamente que tiene que hacerlo. Necesito iniciar un reclamo de alimentos que cubra la cuota del jardín, la obra social y la crianza de la nena.",
  },
  {
    name: "consumo-testimonio",
    voice: ADAM,
    text:
      "Buenas, te hablo en nombre de la concesionaria, Automotores del Centro. Nos llegó una demanda de un cliente, el señor Sánchez, por una supuesta falla del cero kilómetro que nos compró. Te aclaro nuestra posición: la garantía de fábrica la da y la maneja la terminal automotriz, el fabricante, no nosotros, y eso está firmado en el contrato. Además, el cliente no cumplió el plan de mantenimiento: el primer service nunca lo hizo, no pidió turno, no trajo el auto, y la garantía depende de que esos services se hagan en tiempo. Encima le ofrecimos un turno de diagnóstico por mail y no nos contestó. Para nosotros el reclamo está mal dirigido y fue el propio cliente el que incumplió. Queremos contestar la demanda con eso: nuestra falta de legitimación, el contrato de adhesión que firmó, y la conducta del actor.",
  },
  {
    name: "tribunales-testimonio",
    voice: MATILDA,
    text:
      "Sí, voy a declarar lo que me consta. Trabajé con Marcela varios años en el mismo local, éramos compañeras. Te puedo decir que los sábados a la mañana ella venía a abrir, eso lo vi un montón de veces, llegaba tipo nueve y se quedaba hasta el mediodía o la una. Era algo habitual, no una vez cada tanto, casi todas las semanas. Y sobre las comisiones, había un sistema de comisiones por las ventas, a todas nos las pagaban, pero en los últimos meses se las fueron recortando, y a Marcela varias veces no se las liquidaron completas. Lo sé porque lo hablábamos entre nosotras y se quejaba de que le faltaba esa plata en el recibo. Eso es lo que puedo declarar, lo que vi y lo que sé de primera mano.",
  },
];

const settings = { stability: 0.45, similarity_boost: 0.8, style: 0.1, use_speaker_boost: true };

for (const t of TESTIMONIOS) {
  const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${t.voice}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text: t.text, model_id: MODEL, voice_settings: settings }),
  });
  if (!r.ok) {
    console.error("✗", t.name, r.status, (await r.text()).slice(0, 160));
    continue;
  }
  const buf = Buffer.from(await r.arrayBuffer());
  writeFileSync(join(OUT, t.name + ".mp3"), buf);
  console.log("✓", t.name + ".mp3", buf.length, "bytes");
}

console.log("\nListo. Audios en public/posta/audio/");
