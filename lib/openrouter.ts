// Cliente mínimo de OpenRouter (chat completions).
// La "actividad" del taller es usar la herramienta: estas llamadas son el motor de IA.

const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

export function defaultModel(): string {
  return process.env.OPENROUTER_MODEL || "anthropic/claude-sonnet-4.6";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
  /** pide salida JSON estricta */
  json?: boolean;
}

export function isOpenRouterConfigured(): boolean {
  return Boolean(process.env.OPENROUTER_API_KEY);
}

export async function chat(opts: ChatOptions): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Falta OPENROUTER_API_KEY. Completá .env.local para habilitar el optimizador y el comparador.",
    );
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://rl1.local",
      "X-Title": "RL1 Taller IA Abogacía",
    },
    body: JSON.stringify({
      model: opts.model || defaultModel(),
      temperature: opts.temperature ?? 0.4,
      max_tokens: opts.maxTokens ?? 1200,
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      messages: opts.messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = await res.json();
  const content: string = data?.choices?.[0]?.message?.content ?? "";
  return content;
}

/** Llama al modelo y parsea JSON, tolerando bloques ```json ... ```. */
export async function chatJSON<T>(opts: ChatOptions): Promise<T> {
  const raw = await chat({ ...opts, json: true });
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end >= 0 ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(slice) as T;
}
