// Descarga del SKILL.md de la tercera charla («Lo que te llevás», en el celular).
// Es texto genérico, sin datos del expediente: se sirve a cualquiera.

import { skillMd } from "@/lib/tribunal-clase3";

export function GET() {
  return new Response(skillMd(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'attachment; filename="SKILL.md"',
      "Cache-Control": "no-store",
    },
  });
}
