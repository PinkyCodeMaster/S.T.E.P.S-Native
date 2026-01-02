import { pinoLogger as logger } from "hono-pino";
import pretty from "pino-pretty";
import pino from "pino";

import env from "@/env";

// Shared pino instance for both HTTP middleware and Better Auth logging
export const appLogger = pino(
  {
    level: env.LOG_LEVEL || "info",
  },
  env.NODE_ENV === "production" ? undefined : pretty(),
);

export function pinoLogger() {
  return logger({
    pino: appLogger,
  });
}
