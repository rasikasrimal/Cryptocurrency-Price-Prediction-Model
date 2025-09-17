import type { StreamChunk } from "@/types/chat";

export type StreamEmitter = (chunk: StreamChunk) => void;

export function createSseStream(emitter: (emit: StreamEmitter) => void) {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const emit: StreamEmitter = (chunk) => {
        controller.enqueue(encoder.encode(`event: ${chunk.type}\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk.data)}\n\n`));
      };

      emitter(emit);
    }
  });

  return stream;
}
