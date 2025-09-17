export interface WebSocketOptions<TMessage> {
  onMessage?: (message: TMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  heartbeatInterval?: number;
  backoff?: {
    initial: number;
    max: number;
  };
}

export function createManagedWebSocket<TMessage extends { type: string }>(
  url: string,
  options: WebSocketOptions<TMessage> = {}
) {
  let socket: WebSocket | null = null;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let attempts = 0;

  const connect = () => {
    socket = new WebSocket(url);

    socket.addEventListener("open", () => {
      attempts = 0;
      options.onOpen?.();
      if (options.heartbeatInterval) {
        clearInterval(heartbeat);
        heartbeat = setInterval(() => socket?.send(JSON.stringify({ type: "ping" })), options.heartbeatInterval);
      }
    });

    socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data) as TMessage;
        options.onMessage?.(data);
      } catch (error) {
        console.error("Failed to parse WS message", error);
      }
    });

    socket.addEventListener("close", (event) => {
      clearInterval(heartbeat);
      options.onClose?.(event);
      const backoff = options.backoff ?? { initial: 500, max: 4000 };
      const timeout = Math.min(backoff.initial * 2 ** attempts, backoff.max);
      attempts += 1;
      setTimeout(connect, timeout);
    });

    socket.addEventListener("error", (event) => {
      options.onError?.(event);
    });
  };

  connect();

  const send = (payload: unknown) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }
    socket.send(JSON.stringify(payload));
  };

  const close = () => {
    clearInterval(heartbeat);
    socket?.close();
  };

  return { send, close };
}
