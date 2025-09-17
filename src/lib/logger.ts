import pino from "pino";

export const logger = pino({
  name: "realtime-app",
  level: process.env.NEXT_PUBLIC_LOG_LEVEL ?? "info",
  browser: {
    asObject: true
  }
});
