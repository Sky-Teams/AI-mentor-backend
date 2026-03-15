import { createApp } from "./app";
import { env } from "./shared/config/env";
import { logger } from "./shared/logging/logger";

const app = createApp();

app.listen(env.PORT, () => {
  logger.info(
    {
      port: env.PORT,
      prefix: env.API_PREFIX,
      env: env.NODE_ENV,
    },
    "AI Mentor backend is running.",
  );
});
