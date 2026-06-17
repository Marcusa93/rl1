import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Faltan SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const tables = ["sessions", "participants", "responses"];
let allOk = true;
for (const t of tables) {
  // un select real valida que la tabla exista (head:count da falsos positivos)
  const { error } = await db.from(t).select("id").limit(1);
  if (error) {
    allOk = false;
    console.log(`✗ ${t}: ${error.message}`);
  } else {
    console.log(`✓ ${t} OK`);
  }
}
console.log(
  allOk
    ? "\nESQUEMA OK ✅"
    : "\nFALTA APLICAR EL ESQUEMA ❌  → correr supabase/schema.sql en el SQL Editor",
);
process.exit(allOk ? 0 : 2);
