import OpenAI from "openai";
import { env } from "../config/env";
import { AppError } from "../errors/app-error";

export type AiProviderName = "GROQ" | "OPENROUTER";

export interface AiTarget {
  provider: AiProviderName;
  model: string;
}

const providerConfig = {
  GROQ: () => ({ apiKey: env.GROQ_API_KEY, baseURL: env.GROQ_BASE_URL }),
  OPENROUTER: () => ({
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: env.OPENROUTER_BASE_URL,
    defaultHeaders: { "X-Title": "AI Mentor" },
  }),
};

const clients = new Map<AiProviderName, OpenAI>();

export const getAiClient = (provider: AiProviderName): OpenAI => {
  const cached = clients.get(provider);
  if (cached) return cached;

  const config = providerConfig[provider]();
  if (!config.apiKey) {
    throw new AppError(
      `${provider} API key is missing.`,
      500,
      "AI_PROVIDER_NOT_CONFIGURED",
    );
  }

  const client = new OpenAI({ ...config, timeout: env.AI_TIMEOUT_MS });
  clients.set(provider, client);
  return client;
};

// Until plans pick a provider (next issue), everything uses Groq.
export const defaultAiTarget = (): AiTarget => ({
  provider: "GROQ",
  model: env.GROQ_MODEL,
});
