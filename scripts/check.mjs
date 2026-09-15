import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false}});
for (const t of ["sessions","participants","responses"]) {
  const head = await db.from(t).select("*", { count:"exact", head:true });
  const real = await db.from(t).select("id").limit(1);
  console.log(t, "| head:", head.error?.message ?? `ok(${head.count})`, "| select:", real.error?.message ?? `ok(${real.data?.length} rows)`);
}
