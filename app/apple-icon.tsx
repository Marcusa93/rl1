import { ImageResponse } from "next/og";
import { ROBOT_DATA_URL } from "@/lib/robot-svg";

// Ícono al guardar el sitio en la pantalla de inicio del celular.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d24",
        }}
      >
        <img src={ROBOT_DATA_URL} width={140} height={140} alt="" />
      </div>
    ),
    size,
  );
}
