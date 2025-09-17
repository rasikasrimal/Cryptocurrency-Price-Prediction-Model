import type { StreamChunk } from "@/types/chat";

export interface StreamOptions {
  onChunk?: (chunk: StreamChunk) => void;
  onError?: (err: Error) => void;
  onOpen?: () => void;
  signal?: AbortSignal;
}

export function createEventStream(url: string, body: unknown, options: StreamOptions = {}) {
  const controller = new AbortController();
  const signal = options.signal ?? controller.signal;

  async function start() {
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json"
        },
        signal
      });

      if (!response.body) {
        throw new Error("Missing response body for stream");
      }

      options.onOpen?.();

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          const eventLine = lines.find((line) => line.startsWith("event:"));
          const dataLine = lines.find((line) => line.startsWith("data:"));
          if (!eventLine || !dataLine) continue;
          const type = eventLine.replace("event:", "").trim();
          try {
            const payload = JSON.parse(dataLine.replace("data:", "").trim());
            options.onChunk?.({ type, data: payload } as StreamChunk);
          } catch (error) {
            options.onError?.(error as Error);
          }
        }
      }
    } catch (error) {
      if (signal.aborted) return;
      options.onError?.(error as Error);
    }
  }

  start();

  return {
    close: () => controller.abort()
  };
}
