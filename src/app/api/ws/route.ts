export const runtime = "edge";

interface ClientMessage {
  type: "invoke_tool" | "cancel_tool" | "ack" | "resume";
  seq: number;
  id: string;
  tool?: string;
  args?: Record<string, unknown>;
}

interface ServerMessage {
  type: "tool_update" | "partial_result" | "error" | "complete";
  seq: number;
  id: string;
  payload?: unknown;
}

export async function GET(request: Request) {
  if (request.headers.get("upgrade") !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  const sessionId = crypto.randomUUID();
  let seq = 0;

  const send = (message: ServerMessage) => {
    server.send(JSON.stringify(message));
  };

  server.accept();

  server.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data as string) as ClientMessage;
      if (data.type === "invoke_tool" && data.tool) {
        const invocationId = data.id ?? crypto.randomUUID();
        send({ type: "tool_update", seq: ++seq, id: invocationId, payload: { status: "queued", sessionId } });
        setTimeout(() => {
          send({
            type: "partial_result",
            seq: ++seq,
            id: invocationId,
            payload: { output: `Running ${data.tool} with args ${JSON.stringify(data.args ?? {})}` }
          });
        }, 300);
        setTimeout(() => {
          send({
            type: "complete",
            seq: ++seq,
            id: invocationId,
            payload: { output: `Tool ${data.tool} finished`, sessionId }
          });
        }, 900);
      }
      if (data.type === "resume") {
        send({ type: "tool_update", seq: ++seq, id: data.id, payload: { status: "resumed", sessionId } });
      }
    } catch (error) {
      send({ type: "error", seq: ++seq, id: sessionId, payload: { message: (error as Error).message } });
    }
  });

  server.addEventListener("close", () => {
    server.close();
  });

  send({ type: "tool_update", seq: ++seq, id: sessionId, payload: { status: "connected" } });

  return new Response(null, { status: 101, webSocket: client });
}
