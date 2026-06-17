// Aplica supabase/schema.sql usando una cadena de conexión Postgres.
// Uso:  DATABASE_URL="postgresql://...":  node scripts/apply-schema.mjs "$DATABASE_URL"
//   o:  node --env-file=.env.local scripts/apply-schema.mjs   (lee DATABASE_URL del env)
import { readFileSync } from "node:fs";
import pg from "pg";

const conn = process.argv[2] || process.env.DATABASE_URL;
if (!conn) {
  console.error(
    "Falta la cadena de conexión.\n" +
      "Supabase → Project Settings → Database → Connection string (URI), incluye la contraseña.\n" +
      'Ej: node scripts/apply-schema.mjs "postgresql://postgres:PASS@db.xxx.supabase.co:5432/postgres"',
  );
  process.exit(1);
}

const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
const client = new pg.Client({ connectionString: conn, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  // forzar recarga del cache de PostgREST
  await client.query("notify pgrst, 'reload schema';").catch(() => {});
  console.log("✅ Esquema aplicado correctamente.");
} catch (e) {
  console.error("❌ Error aplicando el esquema:", e.message);
  process.exit(2);
} finally {
  await client.end();
}
