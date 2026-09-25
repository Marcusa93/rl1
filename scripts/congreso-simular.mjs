// Simula público del Congreso ("Vibe coding para abogados") para ensayar.
//   node scripts/congreso-simular.mjs [base] [cantidad]
//   node scripts/congreso-simular.mjs http://localhost:3000 60
//   node scripts/congreso-simular.mjs https://congreso.rossi-ia.com 40
// Cada celular entra sin nombre y responde las cinco preguntas (con sesgos
// verosímiles); un tercio de los DEPENDE escribe de qué depende.
// Después de ensayar: Shift+R en la sala de control reinicia la sesión.

const BASE = process.argv[2] ?? "http://localhost:3000";
const N = Number(process.argv[3] ?? 40);
const SLUG = "congreso-vibe";

const MOLESTIAS = [
  "Que me avise los vencimientos de mis causas",
  "Que ordene cronológicamente un expediente",
  "Un buscador de jurisprudencia de la Corte local",
  "Que calcule intereses de una liquidación laboral",
  "Que arme el escrito de inicio a partir de un modelo",
  "Recordatorio de audiencias",
  "Que lea las notificaciones de la casilla y me diga qué hacer",
  "Que me resuma las sentencias largas",
  "Controlar el estado de los expedientes todos los días",
  "Una planilla de honorarios que se actualice sola",
  "Que me ayude a preparar la entrevista con el cliente",
  "Ordenar la prueba ofrecida",
  "Revisar cláusulas de contratos de alquiler",
  "Llevar la agenda del estudio",
  "Buscar normativa actualizada",
];
const INTENTOS = [
  "Un tablero con los plazos de todas mis causas",
  "Una guía de preguntas para la primera entrevista",
  "Una matriz de hechos y prueba para mis juicios",
  "Un calculador de intereses",
  "La cronología de un expediente a partir de las actuaciones",
  "Un buscador de mis propios escritos",
  "Un formulario para que los clientes carguen sus datos antes de venir",
  "Nada todavía: primero quiero entender mejor el problema",
  "Una herramienta para controlar vencimientos de contratos",
  "Una app para la clínica jurídica de la facultad",
];
const DEPENDE = [
  "De dónde se guardan los datos",
  "De quién puede acceder a la información",
  "De si la probé lo suficiente",
  "Del secreto profesional",
  "De si los datos salen del país",
  "De si está anonimizado",
  "De quién responde si falla",
  "De que el cliente lo consienta",
];

const azar = (arr, pesos) => {
  if (!pesos) return arr[Math.floor(Math.random() * arr.length)];
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) if ((r -= pesos[i]) < 0) return arr[i];
  return arr[arr.length - 1];
};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function celular(i) {
  let cookie = "";
  const req = async (path, body) => {
    const res = await fetch(`${BASE}${path}`, {
      method: body !== undefined ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return res.json().catch(() => ({}));
  };
  await dormir(Math.random() * 1500);
  await req("/api/congreso/entrar", {});
  const r = (activity, item_key, v) => req(`/api/session/${SLUG}/respond`, { activity, item_key, payload: { v } });

  await r("cong_molestia", "texto", azar(MOLESTIAS));
  // Situaciones 1 y 3 son "usar"; 2 y 4, "construir" (con ruido).
  await r("cong_usar", "c1", azar(["usar", "construir"], [8, 2]));
  await r("cong_usar", "c2", azar(["usar", "construir"], [3, 7]));
  await r("cong_usar", "c3", azar(["usar", "construir"], [6, 4]));
  await r("cong_usar", "c4", azar(["usar", "construir"], [2, 8]));
  await r("cong_elegir", "caso", azar(["cronologia", "prueba", "entrevista"], [5, 3, 3]));
  const datos = azar(["si", "no", "depende"], [1, 4, 6]);
  await r("cong_datos", "q", datos);
  if (datos === "depende" && Math.random() < 0.4) await r("cong_datos", "q~porque", azar(DEPENDE));
  await r("cong_intentar", "texto", azar(INTENTOS));
  process.stdout.write(i % 10 === 9 ? `${i + 1}\n` : ".");
}

console.log(`Simulando ${N} celulares contra ${BASE} …`);
const lotes = 8;
for (let i = 0; i < N; i += lotes) {
  await Promise.all(Array.from({ length: Math.min(lotes, N - i) }, (_, k) => celular(i + k).catch((e) => console.error("\n", e.message))));
}
console.log("\nListo.");
