// Simula la sala de "La arquitectura de la confianza digital" (/unca) para ensayar.
//   node scripts/unca-simular.mjs [base] [cantidad]
//   node scripts/unca-simular.mjs http://localhost:3000 40
//   node scripts/unca-simular.mjs https://taller.rossi-ia.com 30
// Cada participante entra anónimo y responde las ocho intervenciones con
// sesgos verosímiles. Después de ensayar: Shift+R en la presentación reinicia
// la sesión (borra todo).

const BASE = process.argv[2] ?? "http://localhost:3000";
const N = Number(process.argv[3] ?? 40);
const SLUG = "unca-confianza";

const PALABRAS = [
  "firma", "firma", "firma", "sello", "sello", "escribano", "escribano", "certificado", "juez", "membrete",
  "registro", "fe pública", "fe publica", "autenticidad", "protocolo", "original", "institución", "legalidad",
  "seguridad", "papel", "firma digital", "Firma Digital", "código QR", "número de expediente", "matrícula",
];

const azar = (arr, pesos) => {
  if (!pesos) return arr[Math.floor(Math.random() * arr.length)];
  const total = pesos.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) if ((r -= pesos[i]) < 0) return arr[i];
  return arr[arr.length - 1];
};
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

async function participante(i) {
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
  await req(`/api/session/${SLUG}/join`, { name: `Participante ${Math.random().toString(36).slice(2, 6).toUpperCase()}` });
  const r = (activity, payload) => req(`/api/session/${SLUG}/respond`, { activity, item_key: "", payload });

  const cuantas = azar([1, 2, 3], [2, 3, 5]);
  await r("uc_confianza", { palabras: Array.from({ length: cuantas }, () => azar(PALABRAS)) });
  await r("uc_tres_docs", { opcion: azar(["a", "b", "c", "d"], [2, 9, 3, 6]) });
  await r("uc_huella", { opcion: azar(["a", "b", "c", "d"], [5, 10, 3, 2]) });
  const cat = (pesos) => azar(["si", "no", "dep"], pesos);
  await r("uc_firma_prueba", { answers: { integro: cat([7, 1, 2]), verdad: cat([1, 7, 2]), titular: cat([5, 1, 4]), libre: cat([1, 6, 3]) } });
  const marcas = ["origen", "firma", "qr", "original", "plataforma", "apariencia"].filter((_, k) => Math.random() < [0.8, 0.85, 0.5, 0.4, 0.75, 0.05][k]);
  await r("uc_testimonio", { selected: marcas.length ? marcas : ["firma"] });
  await r("uc_blockchain", { opcion: azar(["1", "2", "3", "4", "5"], [6, 4, 3, 2, 1]) });
  await r("uc_real_ia", { opcion: azar(["real", "ia", "nose"], [4, 3, 3]) });
  await r("uc_decision", { opcion: azar(["a", "b", "c", "d"], [1, 1, 12, 1]) });
  process.stdout.write(i % 10 === 9 ? `${i + 1}\n` : ".");
}

console.log(`Simulando ${N} participantes contra ${BASE} …`);
const lotes = 8;
for (let i = 0; i < N; i += lotes) {
  await Promise.all(Array.from({ length: Math.min(lotes, N - i) }, (_, k) => participante(i + k).catch((e) => console.error("\n", e.message))));
}
console.log("\nListo.");
