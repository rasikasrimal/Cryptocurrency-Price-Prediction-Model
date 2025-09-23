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

  let closeStreamRef: (() => void) | undefined;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let heartbeat: ReturnType<typeof setInterval> | undefined;
      const timeouts = new Set<ReturnType<typeof setTimeout>>();

      const clearTimers = () => {
        heartbeat && clearInterval(heartbeat);
        heartbeat = undefined;
        timeouts.forEach(clearTimeout);
        timeouts.clear();
      };

      const closeStream = () => {
        if (closed) {
          return;
        }
        closed = true;
        request.signal.removeEventListener("abort", closeStream);
        clearTimers();
        try {
          controller.close();
        } catch (error) {
          if (!(error instanceof TypeError && "message" in error && typeof error.message === "string" && error.message.includes("Invalid state"))) {
            throw error;
          }
        }
      };

      closeStreamRef = closeStream;

      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) {
          return;
        }
        try {
          controller.enqueue(chunk);
        } catch (error) {
          if (error instanceof TypeError && "message" in error && typeof error.message === "string" && error.message.includes("Invalid state")) {
            closed = true;
            clearTimers();
            request.signal.removeEventListener("abort", closeStream);
            return;
          }
          throw error;
        }
      };

      const schedule = (fn: () => void, ms: number) => {
        if (closed) {
          return;
        }
        const timeout = setTimeout(() => {
          timeouts.delete(timeout);
          if (!closed) {
            fn();
          }
        }, ms);
        timeouts.add(timeout);
      };

      const send = (type: StreamChunk["type"], data: unknown) => {
        safeEnqueue(formatEvent(type, data));
      };

      request.signal.addEventListener("abort", closeStream);

      send("token", { id: crypto.randomUUID(), text: "Thinking... " });

      const toolId = crypto.randomUUID();
      schedule(() => {
        send("tool-status", { id: toolId, name: "web-search", status: "running" });
      }, 400);

      schedule(() => {
        send("token", { id: crypto.randomUUID(), text: `Analyzing "${parsed.prompt}" ` });
      }, 800);

      schedule(() => {
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
        closeStream();
      }, 1_400);

      heartbeat = setInterval(() => {
        safeEnqueue(encoder.encode(`: ping\n\n`));
      }, 15_000);

      safeEnqueue(encoder.encode(`: stream-start\n\n`));

      return closeStream;
    },
    cancel() {
      closeStreamRef?.();
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
