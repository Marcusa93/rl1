// Simula participantes del Laboratorio BBVA para ensayar la clase.
//   node scripts/bbva-simular.mjs [base] [cantidad]
//   node scripts/bbva-simular.mjs http://localhost:3000 30
// Cada participante elige un área y responde las 5 actividades al azar
// (con sesgos verosímiles). Después de ensayar: Shift+R en la presentación
// reinicia la sesión (borra participantes y respuestas).

const BASE = process.argv[2] ?? "http://localhost:3000";
const N = Number(process.argv[3] ?? 30);
const SLUG = "bbva-lab";

const AREAS = ["comercial", "operaciones", "riesgos", "it", "ia", "otro"];
const OPS = ["leer", "buscar", "comparar", "responder", "clasificar", "revisar", "decidir", "redactar", "resolver", "atender", "programar", "controlar", "derivar", "analizar"];

const azar = (arr, pesos) => {
  if (!pesos) return arr[Math.floor(Math.random() * arr.length)];
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) if ((r -= pesos[i]) < 0) return arr[i];
  return arr[arr.length - 1];
};

async function participante(i) {
  let cookie = "";
  const req = async (path, body) => {
    const res = await fetch(`${BASE}${path}`, {
      method: body ? "POST" : "GET",
      headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    const set = res.headers.get("set-cookie");
    if (set) cookie = set.split(";")[0];
    return res.json().catch(() => ({}));
  };
  const area = azar(AREAS, [4, 5, 4, 5, 2, 1]);
  await req(`/api/session/${SLUG}/join`, { name: area });
  const r = (activity, item_key, v) => req(`/api/session/${SLUG}/respond`, { activity, item_key, payload: { v } });

  const ops = new Set();
  while (ops.size < 3) ops.add(azar(OPS, [6, 7, 6, 5, 4, 6, 3, 4, 3, area === "comercial" ? 7 : 2, area === "it" ? 7 : 1, 3, 2, area === "riesgos" ? 7 : 3]));
  await r("bbva_a1", "ops", [...ops]);

  const snd = (p) => azar(["si", "no", "depende"], p);
  await r("bbva_a2", "c1", snd([7, 1, 2]));
  await r("bbva_a2", "c2", snd([6, 1, 3]));
  await r("bbva_a2", "c3", snd([2, 2, 6]));
  await r("bbva_a2", "c4", snd([4, 2, 4]));
  await r("bbva_a2", "c5", snd([1, 7, 2]));

  await r("bbva_a3", "nivel", azar(["1", "2", "3", "4", "5"], area === "ia" || area === "it" ? [1, 2, 4, 3, 1] : [2, 4, 5, 1, 0.3]));

  const tec = (p) => azar(["chatbot", "automatizacion", "agente", "falta_info"], p);
  await r("bbva_a4", "c1", tec([8, 0.5, 0.5, 1]));
  await r("bbva_a4", "c2", tec([0.5, 8, 1.5, 0.5]));
  await r("bbva_a4", "c3", tec([0.5, 1.5, 8, 0.5]));
  await r("bbva_a4", "c4", tec([4, 2, 2, 3]));

  await r("bbva_a5", "q1", azar(["tiempo", "repetitivo", "buscar", "pasos", "parecidas", "revisar", "casos"], [5, 4, 5, 2, 3, 3, 2]));
  await r("bbva_a5", "q2", azar(["buscar", "clasificar", "comparar", "analizar", "redactar", "controlar", "decidir", "responder"], [4, 2, 3, 4, 3, 3, 1, 3]));
  await r("bbva_a5", "q3", azar(["ayude", "prepare", "recomiende", "ejecute", "casi_todo"], [2, 6, 3, 2, 1]));
  await r("bbva_a5", "q4", azar(["diario", "varias", "semanal", "ocasional"], [5, 4, 3, 1]));
  if (i % 3 === 0)
    await r(
      "bbva_a5",
      "hipotesis",
      `Cuando ocurre una solicitud de ${area}, actualmente tengo que revisar varias fuentes. Esto requiere buscar y comparar. Me gustaría explorar si un sistema de IA puede ayudarme a preparar el caso para mi revisión, manteniendo bajo intervención humana la decisión final.`,
    );
}

const lotes = [];
for (let i = 0; i < N; i++) lotes.push(participante(i).catch((e) => console.error(i, e.message)));
await Promise.all(lotes);
console.log(`Listo: ${N} participantes simulados en ${BASE}`);
