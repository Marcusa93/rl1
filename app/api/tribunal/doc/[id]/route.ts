// Una pieza del expediente de la clase 3 (D1–D5), transcripta y anonimizada.
// Los celulares la reciben solo cuando la presentación la liberó (aviso
// `doc:Dn` en la fila `~avisos`); el equipo docente la ve siempre.

import { fail, ok } from "@/lib/api";
import { filaAvisos } from "@/lib/avisos";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { avisoDoc, TF3_DOCS, TF3_NOTA_ANONIMIZACION, TF3_SLUG, type Tf3DocId } from "@/lib/tribunal-clase3";
import { TF3_REVELACION_D5, TF3_TEXTOS } from "@/lib/tribunal-clase3-docs";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = TF3_DOCS.find((d) => d.id === id);
  if (!doc) return fail("Pieza inexistente", 404);

  if (!(await isTeacher())) {
    const { data, error } = await getAdmin().from("sessions").select("activity_config").eq("slug", filaAvisos(TF3_SLUG)).maybeSingle();
    if (error) return fail("Sin conexión con la base: probá de nuevo", 503);
    const abiertos = (data?.activity_config?.abiertos as string[] | undefined) ?? [];
    if (!abiertos.includes(avisoDoc(doc.id as Tf3DocId))) return fail("Esta pieza todavía no se liberó", 403);
  }
  return ok({ ...doc, nota: TF3_NOTA_ANONIMIZACION, paginas: TF3_TEXTOS[doc.id], ...(doc.id === "D5" ? { revelacion: TF3_REVELACION_D5 } : {}) });
}
