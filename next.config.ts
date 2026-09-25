import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // NEXT_DIST_DIR permite un segundo servidor de desarrollo (ensayos) con su
  // propia carpeta, sin chocar con el que ya está corriendo. En Vercel no se usa.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
