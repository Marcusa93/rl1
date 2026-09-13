import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Subdominios propios que sirven una clase desde la raíz.
// En justicia.rossi-ia.com: "/" es la app del participante y "/clase" la
// presentación. Las rutas largas (/justicia, /justicia/clase) siguen
// funcionando en todos los dominios.
const REWRITES: Record<string, Record<string, string>> = {
  "justicia.rossi-ia.com": {
    "/": "/justicia",
    "/clase": "/justicia/clase",
  },
};

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").split(":")[0].toLowerCase();
  const destino = REWRITES[host]?.[request.nextUrl.pathname];
  if (!destino) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = destino;
  return NextResponse.rewrite(url);
}

export const config = {
  // fuera: API, internos de Next, favicon y cualquier archivo con extensión (public/)
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
