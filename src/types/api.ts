import { z } from "zod";

import { chatMessageSchema, streamChunkSchema } from "@/types/chat";

export const pagedSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    nextCursor: z.string().optional()
  });

export const getMessagesResponseSchema = pagedSchema(chatMessageSchema);

export const createMessageSchema = z.object({
  role: z.enum(["user", "assistant", "tool", "system"]),
  content: z.string().min(1),
  toolCalls: z.array(chatMessageSchema.shape.toolCalls.element).optional()
});

export const realtimeRequestSchema = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(),
  tools: z.array(z.string()).optional()
});

export const streamChunkListSchema = z.array(streamChunkSchema);

export type RealtimeRequest = z.infer<typeof realtimeRequestSchema>;
export type CreateMessageBody = z.infer<typeof createMessageSchema>;
export type MessagesResponse = z.infer<typeof getMessagesResponseSchema>;
