import pino from "pino";
import type { LoggerOptions } from "pino";
import { env } from "../config/env";

export interface AppLogger {
  info: pino.Logger["info"];
  warn: pino.Logger["warn"];
  error: pino.Logger["error"];
  debug: pino.Logger["debug"];
  child: pino.Logger["child"];
}

const options: LoggerOptions = {
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
};

export const logger: AppLogger = pino(options);
