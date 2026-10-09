// Criptografía real para las demostraciones de /unca, con la Web Crypto API
// del navegador: nada sale de la computadora. Solo para uso en el cliente.

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

/** Huella SHA-256 (64 caracteres hexadecimales) de un texto o de los bytes de un archivo. */
export async function sha256(datos: string | ArrayBuffer): Promise<string> {
  const bytes = typeof datos === "string" ? new TextEncoder().encode(datos) : datos;
  return hex(await crypto.subtle.digest("SHA-256", bytes));
}

/** Cuántos bits difieren entre dos huellas hexadecimales del mismo largo. */
export function bitsDistintos(a: string, b: string): number {
  let n = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i += 2) {
    let x = parseInt(a.slice(i, i + 2), 16) ^ parseInt(b.slice(i, i + 2), 16);
    while (x) {
      n += x & 1;
      x >>= 1;
    }
  }
  return n;
}

export const cripto = () => typeof crypto !== "undefined" && Boolean(crypto.subtle);

// --- Firma digital (ECDSA P-256) ---------------------------------------------------------------

const ALGO = { name: "ECDSA", namedCurve: "P-256" } as const;
const FIRMA = { name: "ECDSA", hash: "SHA-256" } as const;

export async function generarClaves(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(ALGO, true, ["sign", "verify"]);
}

/** Huella corta de la clave pública, para reconocerla a simple vista. */
export async function huellaClave(clave: CryptoKey): Promise<string> {
  const raw = await crypto.subtle.exportKey("raw", clave);
  return (await sha256(raw)).slice(0, 16).toUpperCase().replace(/(.{4})(?!$)/g, "$1 ");
}

export async function firmar(privada: CryptoKey, texto: string): Promise<string> {
  const sig = await crypto.subtle.sign(FIRMA, privada, new TextEncoder().encode(texto));
  return hex(sig);
}

export async function verificar(publica: CryptoKey, texto: string, firmaHex: string): Promise<boolean> {
  const bytes = new Uint8Array(firmaHex.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? []);
  return crypto.subtle.verify(FIRMA, publica, bytes, new TextEncoder().encode(texto));
}

// --- Cifrado César -------------------------------------------------------------------------------

export const ABC = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function cesar(texto: string, k: number): string {
  const sinTildes = texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  return [...sinTildes]
    .map((c) => {
      const i = ABC.indexOf(c);
      return i < 0 ? c : ABC[(((i + k) % 26) + 26) % 26];
    })
    .join("");
}
