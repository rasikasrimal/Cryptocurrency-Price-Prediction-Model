import { useEffect } from "react";

import { createEventStream } from "@/lib/sse";
import type { StreamChunk } from "@/types/chat";

interface UseStreamProps {
  url: string;
  body: unknown;
  enabled?: boolean;
  onChunk: (chunk: StreamChunk) => void;
  onError?: (error: Error) => void;
}

export function useStream({ url, body, enabled = true, onChunk, onError }: UseStreamProps) {
  useEffect(() => {
    if (!enabled) return;
    const stream = createEventStream(url, body, { onChunk, onError });
    return () => stream.close();
  }, [url, body, enabled, onChunk, onError]);
}
