import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth:{persistSession:false}});
const { data, error } = await db.from("sessions").insert({ slug: "smoke" + Date.now().toString(36), title:"smoke" }).select("*").single();
console.log("insert:", error ? ("ERR "+error.message) : ("OK "+data.slug));
if(data){ await db.from("sessions").delete().eq("id", data.id); console.log("cleanup ok"); }
