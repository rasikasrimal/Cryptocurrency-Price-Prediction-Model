import { useEffect, useRef } from "react";

import { createManagedWebSocket } from "@/lib/ws";

interface UseWebSocketProps<TMessage extends { type: string }> {
  url: string;
  onMessage: (message: TMessage) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  enabled?: boolean;
}

export function useWebSocket<TMessage extends { type: string }>({
  url,
  onMessage,
  onOpen,
  onClose,
  enabled = true
}: UseWebSocketProps<TMessage>) {
  const socketRef = useRef<ReturnType<typeof createManagedWebSocket<TMessage>> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const instance = createManagedWebSocket<TMessage>(url, {
      onMessage,
      onOpen,
      onClose,
      heartbeatInterval: 25_000
    });
    socketRef.current = instance;
    return () => instance.close();
  }, [url, enabled, onMessage, onOpen, onClose]);

  return {
    send: (payload: unknown) => socketRef.current?.send(payload)
  };
}
