import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default("/api/v1"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("30d"),
  GROQ_API_KEY: z.string().optional(),
  GROQ_BASE_URL: z.string().url().default("https://api.groq.com/openai/v1"),
  GROQ_MODEL: z.string().default("openai/gpt-oss-120b"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),
  AI_TIMEOUT_MS: z.coerce.number().default(45000),
  AI_REVIEW_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.2),
  AI_PARAPHRASE_TEMPERATURE: z.coerce.number().min(0).max(1).default(0.4),
  APP_REVIEW_CREDIT_COST: z.coerce.number().int().positive().default(25),
  APP_PARAPHRASE_CREDIT_COST: z.coerce.number().int().positive().default(10),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(120),
  SWAGGER_ENABLED: z.coerce.boolean().default(true),
  DEFAULT_ADMIN_EMAIL: z.string().email().default("admin@aimentor.local"),
  DEFAULT_ADMIN_PASSWORD: z.string().min(8).default("ChangeMe123!"),
});

export const env = envSchema.parse(process.env);
