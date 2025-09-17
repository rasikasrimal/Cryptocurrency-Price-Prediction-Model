import { NextResponse } from "next/server";
import { z } from "zod";

import { createMessageSchema, getMessagesResponseSchema } from "@/types/api";
import { chatMessageSchema, type ChatMessage } from "@/types/chat";

const cursorSchema = z.object({ cursor: z.string().optional() });

const store: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content: "Hi there! I'm ready to stream responses and run tools.",
    createdAt: new Date().toISOString()
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { cursor } = cursorSchema.parse({ cursor: searchParams.get("cursor") ?? undefined });
  const pageSize = 20;
  const startIndex = cursor ? store.findIndex((item) => item.id === cursor) + 1 : 0;
  const items = store.slice(startIndex, startIndex + pageSize);
  const nextCursor = items.length === pageSize ? items[items.length - 1]?.id : undefined;
  const response = getMessagesResponseSchema.parse({ items, nextCursor });
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createMessageSchema.parse(body);
  const message = chatMessageSchema.parse({
    ...parsed,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString()
  });
  store.push(message);
  return NextResponse.json(message, { status: 201 });
}
