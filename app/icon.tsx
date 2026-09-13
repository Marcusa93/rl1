import { ImageResponse } from "next/og";
import { ROBOT_DATA_URL } from "@/lib/robot-svg";

// Ícono de pestaña de todo el sitio: robot sobre el fondo de la marca
// (reemplaza el favicon por defecto de Vercel).
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "#0b0d24",
        }}
      >
        <img src={ROBOT_DATA_URL} width={52} height={52} alt="" />
      </div>
    ),
    size,
  );
}
