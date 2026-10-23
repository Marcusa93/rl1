// Chatbot de la segunda charla del Tribunal Fiscal (actividades 2 y 5).
//
// Mismo modelo y misma temperatura para todos: en el laboratorio solo cambia el
// pedido del participante (simple o estructurado) y en la comparación de la
// actividad 3, el perfil de sistema (A generalista o B con contexto de trabajo).
// Así una diferencia en la salida no se confunde con un cambio de modelo.
//
// Solo para quien está en la clase (cookie de participante), con un límite de
// pedidos por persona. Rechaza datos que no deben entrar a un chatbot de
// práctica (CUIT/CUIL, correos, DNI). No devuelve el texto de sistema.

import { fail, getSession, ok } from "@/lib/api";
import { chat, isOpenRouterConfigured } from "@/lib/openrouter";
import { getParticipantId } from "@/lib/participant";
import { getAdmin } from "@/lib/supabase/server";
import { TF2_PERFILES, TF2_SLUG, type Tf2Perfil } from "@/lib/tribunal-clase2";

export const dynamic = "force-dynamic";

const modelo = () => process.env.TF2_MODEL || "anthropic/claude-haiku-4.5";
const TEMPERATURA = 0.3;
const MAX_PEDIDO = 5000;
const LIMITE = 20;
const VENTANA_MS = 30 * 60 * 1000;

// Un solo proceso en el servidor: alcanza con llevar la cuenta en memoria.
const usos = new Map<string, number[]>();

const SENSIBLES: [RegExp, string][] = [
  [/\b\d{2}-?\d{8}-?\d\b/, "un CUIT o CUIL"],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/, "un correo electrónico"],
  [/\b\d{1,2}\.\d{3}\.\d{3}\b/, "un número de documento"],
];

export async function POST(req: Request) {
  const pid = await getParticipantId();
  if (!pid) return fail("Entrá a la clase desde el QR", 401);

  const body = await req.json().catch(() => ({}));
  const perfil = (body.perfil === "B" ? "B" : "A") as Tf2Perfil;
  const pedido = String(body.pedido ?? "").trim();
  if (pedido.length < 4) return fail("Escribí un pedido");
  if (pedido.length > MAX_PEDIDO) return fail("El pedido es demasiado largo");

  const sensible = SENSIBLES.find(([re]) => re.test(pedido));
  if (sensible)
    return fail(`El pedido parece incluir ${sensible[1]}. En esta práctica usá solo datos ficticios.`, 422);

  const session = await getSession(TF2_SLUG);
  if (!session) return fail("Sesión no disponible", 503);
  const { data: p, error } = await getAdmin()
    .from("participants")
    .select("id")
    .eq("id", pid)
    .eq("session_id", session.id)
    .maybeSingle();
  if (error) return fail("Sin conexión con la base: probá de nuevo", 503);
  if (!p) return fail("Volvé a entrar a la clase desde el QR", 401);

  const ahora = Date.now();
  const recientes = (usos.get(pid) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= LIMITE) return fail("Llegaste al límite de pruebas de esta clase. Seguí con lo que ya tenés.", 429);
  usos.set(pid, [...recientes, ahora]);

  if (!isOpenRouterConfigured()) return ok({ error: "El chatbot no está configurado", planB: true }, 503);

  try {
    const texto = await chat({
      model: modelo(),
      temperature: TEMPERATURA,
      maxTokens: 900,
      messages: [
        { role: "system", content: TF2_PERFILES[perfil].sistema },
        { role: "user", content: pedido },
      ],
    });
    return ok({ texto: texto.trim(), modelo: modelo(), perfil: TF2_PERFILES[perfil].nombre });
  } catch (e) {
    // Sin crédito, sin red o modelo caído: el celular ofrece el ejemplo preparado.
    usos.set(pid, recientes);
    console.error("[tribunal/ia]", (e as Error).message);
    return ok({ error: "El chatbot no responde en este momento", planB: true }, 503);
  }
}
