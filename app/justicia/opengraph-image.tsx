import { imagenUees, OG_SIZE } from "@/lib/og-uees";
import { JUS_LINK, JUS_SUBTITLE, JUS_TITLE } from "@/lib/justicia-clase";

export const alt = `${JUS_TITLE} — Universidad Evangélica de El Salvador`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return imagenUees({ titulo: JUS_TITLE, bajada: JUS_SUBTITLE, link: JUS_LINK });
}
