import { z } from "zod";

export const toolCallSchema = z.object({
  id: z.string(),
  name: z.string(),
  args: z.record(z.unknown()),
  status: z.enum(["queued", "running", "done", "error"]),
  output: z.string().optional()
});

export type ToolCall = z.infer<typeof toolCallSchema>;

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string(),
  createdAt: z.string(),
  toolCalls: z.array(toolCallSchema).optional()
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;

export const streamChunkSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("token"), data: z.object({ id: z.string(), text: z.string() }) }),
  z.object({ type: z.literal("message"), data: chatMessageSchema }),
  z.object({
    type: z.literal("tool-status"),
    data: z.object({ id: z.string(), name: z.string(), status: toolCallSchema.shape.status })
  }),
  z.object({ type: z.literal("error"), data: z.object({ code: z.string(), message: z.string() }) }),
  z.object({ type: z.literal("done"), data: z.object({ id: z.string().optional() }) })
]);

export type StreamChunk = z.infer<typeof streamChunkSchema>;
