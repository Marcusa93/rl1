import { imagenUees, OG_SIZE } from "@/lib/og-uees";
import { TAL_LINK, TAL_SUBTITLE, TAL_TITLE } from "@/lib/taller-clase";

export const alt = `${TAL_TITLE} — Universidad Evangélica de El Salvador`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return imagenUees({ titulo: TAL_TITLE, bajada: TAL_SUBTITLE, link: TAL_LINK });
}
