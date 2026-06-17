// Genera un código/slug corto y legible para la sesión (sin caracteres ambiguos).
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function makeSlug(len = 5): string {
  let s = "";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < len; i++) s += ALPHABET[bytes[i] % ALPHABET.length];
  return s;
}

export function normalizeSlug(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}
