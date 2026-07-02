import { ok } from "@/lib/api";
import { clearParticipantCookie } from "@/lib/participant";

// "Salir": borra la cookie del participante para poder ingresar con otro nombre.
export async function POST() {
  await clearParticipantCookie();
  return ok({ ok: true });
}
