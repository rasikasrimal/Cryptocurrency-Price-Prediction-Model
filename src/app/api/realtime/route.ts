import { NextResponse } from "next/server";

import { realtimeRequestSchema } from "@/types/api";
import type { StreamChunk } from "@/types/chat";

const encoder = new TextEncoder();

function formatEvent(event: StreamChunk["type"], data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = realtimeRequestSchema.parse(body);

  const stream = new ReadableStream({
    start(controller) {
      const send = (type: StreamChunk["type"], data: unknown) => {
        controller.enqueue(formatEvent(type, data));
      };

      send("token", { id: crypto.randomUUID(), text: "Thinking... " });

      const toolId = crypto.randomUUID();
      setTimeout(() => {
        send("tool-status", { id: toolId, name: "web-search", status: "running" });
      }, 400);

      setTimeout(() => {
        send("token", { id: crypto.randomUUID(), text: `Analyzing "${parsed.prompt}" ` });
      }, 800);

      setTimeout(() => {
        const toolResult = {
          id: toolId,
          name: "web-search",
          args: { query: parsed.prompt },
          status: "done",
          output: `Synthetic search results for "${parsed.prompt}"`
        };
        send("message", {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Here is a streamed response summarizing "${parsed.prompt}". Tools selected: ${(parsed.tools ?? []).join(", ") || "none"}.`,
          createdAt: new Date().toISOString(),
          toolCalls: [toolResult]
        });
        send("tool-status", { id: toolId, name: "web-search", status: "done" });
        send("done", { id: toolId, output: toolResult.output });
        controller.close();
      }, 1400);

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(`: ping\n\n`));
      }, 15_000);

      controller.enqueue(encoder.encode(`: stream-start\n\n`));

      return () => {
        clearInterval(heartbeat);
      };
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive"
    }
  });
}
