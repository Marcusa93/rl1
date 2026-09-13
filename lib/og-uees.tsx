// Miniatura para compartir (WhatsApp, redes) de las clases de El Salvador:
// logo de la UEES a la izquierda, 🤖 al medio y el título a la derecha.
// El robot queda centrado para que sobreviva al recorte cuadrado de WhatsApp.

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ROBOT_DATA_URL } from "./robot-svg";

export const OG_SIZE = { width: 1200, height: 630 };

export async function imagenUees({ titulo, bajada, link }: { titulo: string; bajada: string; link: string }) {
  const logo = await readFile(join(process.cwd(), "public/justicia/logo-uees.png"), "base64");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 64px",
          background: "radial-gradient(circle at 50% 50%, #1e2358 0%, #0b0d24 70%)",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 330,
            height: 330,
            borderRadius: 40,
            background: "#ffffff",
            boxShadow: "0 0 0 6px rgba(94, 234, 212, 0.35)",
          }}
        >
          <img src={`data:image/png;base64,${logo}`} width={280} height={224} alt="" />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 250,
            height: 250,
            borderRadius: 999,
            background: "rgba(94, 234, 212, 0.12)",
            border: "4px solid rgba(94, 234, 212, 0.5)",
          }}
        >
          <img src={ROBOT_DATA_URL} width={170} height={170} alt="" />
        </div>

        <div style={{ display: "flex", flexDirection: "column", width: 380 }}>
          <div style={{ fontSize: 58, fontWeight: 700, lineHeight: 1.05, color: "#5eead4" }}>{titulo}</div>
          <div style={{ marginTop: 18, fontSize: 26, lineHeight: 1.3, color: "#c7c9e8" }}>{bajada}</div>
          <div style={{ marginTop: 26, fontSize: 24, color: "#a78bfa" }}>{link}</div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
