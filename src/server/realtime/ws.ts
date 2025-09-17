export interface WsSession {
  id: string;
  send: (data: unknown) => void;
}

export type WsHandler = (session: WsSession, message: unknown) => void;

export function createWsHandler(handler: WsHandler) {
  return handler;
}
