import { fail, ok } from "@/lib/api";
import { getAdmin } from "@/lib/supabase/server";
import { isTeacher } from "@/lib/teacher";
import { filaCmd, filaEstado, type CmdConSeq, type CmdRemoto, type EstadoRemoto } from "@/lib/remoto";

// Control remoto del deck (ver lib/remoto.ts). Solo con la cookie docente:
//   GET ?que=estado        → estado publicado por el deck (lo lee el celular)
//   GET ?que=cmd&desde=N   → comandos con seq > N (los lee el deck; sin desde, solo el seq actual)
//   POST { estado }        → el deck publica su estado
//   POST { cmd }           → el celular manda un comando

const MAX_CMDS = 30;

async function leerFila(slug: string) {
  const db = getAdmin();
  const { data } = await db.from("sessions").select("id, activity_config").eq("slug", slug).maybeSingle();
  if (data) return data as { id: string; activity_config: Record<string, unknown> };
  const { data: creada } = await db
    .from("sessions")
    .insert({ slug, title: "control remoto", current_activity: "lobby", status: "lobby" })
    .select("id, activity_config")
    .single();
  if (creada) return creada as { id: string; activity_config: Record<string, unknown> };
  // carrera: la creó otro request
  const { data: otra } = await db.from("sessions").select("id, activity_config").eq("slug", slug).single();
  return otra as { id: string; activity_config: Record<string, unknown> };
}

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const url = new URL(req.url);

  if (url.searchParams.get("que") === "cmd") {
    const fila = await leerFila(filaCmd(slug));
    const cmds = (fila.activity_config?.cmds as CmdConSeq[] | undefined) ?? [];
    const seq = cmds.length ? cmds[cmds.length - 1].seq : 0;
    const desde = url.searchParams.get("desde");
    const nuevos = desde === null ? [] : cmds.filter((c) => c.seq > Number(desde));
    return ok({ seq, cmds: nuevos });
  }

  const fila = await leerFila(filaEstado(slug));
  return ok({ estado: (fila.activity_config?.estado as EstadoRemoto | undefined) ?? null });
}

export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isTeacher())) return fail("No autorizado", 401);
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const db = getAdmin();

  if (body.estado) {
    const fila = await leerFila(filaEstado(slug));
    const { error } = await db.from("sessions").update({ activity_config: { estado: body.estado } }).eq("id", fila.id);
    if (error) return fail(error.message, 500);
    return ok({ ok: true });
  }

  if (body.cmd) {
    const cmd = body.cmd as CmdRemoto;
    if (!["sig", "ant", "ir", "click"].includes(cmd.tipo)) return fail("Comando inválido");
    const fila = await leerFila(filaCmd(slug));
    const cmds = (fila.activity_config?.cmds as CmdConSeq[] | undefined) ?? [];
    const seq = (cmds.length ? cmds[cmds.length - 1].seq : 0) + 1;
    const lista = [...cmds, { ...cmd, seq }].slice(-MAX_CMDS);
    const { error } = await db.from("sessions").update({ activity_config: { cmds: lista } }).eq("id", fila.id);
    if (error) return fail(error.message, 500);
    return ok({ seq });
  }

  return fail("Falta estado o cmd");
}
