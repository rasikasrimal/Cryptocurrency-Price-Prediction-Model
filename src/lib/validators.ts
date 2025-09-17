import { z } from "zod";

export const envSchema = z.object({
  NEXT_PUBLIC_API_BASE: z.string().url().optional(),
  NEXT_PUBLIC_WS_BASE: z.string().url().optional(),
  NEXT_PUBLIC_LOG_LEVEL: z.enum(["silent", "error", "warn", "info", "debug", "trace"]).optional()
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(env: NodeJS.ProcessEnv): Env {
  return envSchema.parse(env);
}
