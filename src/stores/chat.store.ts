import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ChatMessage, StreamChunk, ToolCall } from "@/types/chat";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasStringId = (value: unknown): value is { id: string } =>
  isRecord(value) && typeof value.id === "string";

const getStringOutput = (value: unknown): string | undefined => {
  if (!isRecord(value) || !("output" in value)) {
    return undefined;
  }
  return typeof value.output === "string" ? value.output : undefined;
};

export interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  pendingToolCalls: Record<string, ToolCall>;
  composerValue: string;
  appendMessage: (message: ChatMessage) => void;
  updateFromStream: (chunk: StreamChunk) => void;
  setComposerValue: (value: string) => void;
  reset: () => void;
}

const initialState = {
  messages: [] as ChatMessage[],
  isStreaming: false,
  pendingToolCalls: {} as Record<string, ToolCall>,
  composerValue: ""
};

export const useChatStore = create<ChatState>()(
  devtools((set) => ({
    ...initialState,
    appendMessage: (message) =>
      set(
        (state) => {
          if (state.messages.some((existing) => existing.id === message.id)) {
            return state;
          }
          return { messages: [...state.messages, message] };
        },
        false,
        "append-message"
      ),
    updateFromStream: (chunk) =>
      set((state) => {
        switch (chunk.type) {
          case "token": {
            const last = state.messages[state.messages.length - 1];
            if (!last || last.role !== "assistant") {
              const newMessage: ChatMessage = {
                id: chunk.data.id,
                role: "assistant",
                content: chunk.data.text,
                createdAt: new Date().toISOString()
              };
              return { messages: [...state.messages, newMessage], isStreaming: true };
            }
            return {
              messages: [
                ...state.messages.slice(0, -1),
                { ...last, content: last.content + chunk.data.text }
              ],
              isStreaming: true
            };
          }
          case "message": {
            const updates = chunk.data.toolCalls?.reduce<Record<string, ToolCall>>((acc, call) => {
              acc[call.id] = call;
              return acc;
            }, {}) ?? {};
            return {
              messages: [...state.messages, chunk.data],
              isStreaming: false,
              pendingToolCalls: {
                ...state.pendingToolCalls,
                ...updates
              }
            };
          }
          case "tool-status": {
            const existing = state.pendingToolCalls[chunk.data.id];
            const toolCall: ToolCall = {
              id: chunk.data.id,
              name: chunk.data.name,
              args: existing?.args ?? {},
              status: chunk.data.status,
              output: existing?.output
            };
            return {
              pendingToolCalls: {
                ...state.pendingToolCalls,
                [toolCall.id]: toolCall
              }
            };
          }
          case "done": {
            const data = chunk.data as unknown;
            if (hasStringId(data)) {
              const existing = state.pendingToolCalls[data.id];
              if (existing) {
                const output = getStringOutput(data);
                return {
                  isStreaming: false,
                  pendingToolCalls: {
                    ...state.pendingToolCalls,
                    [data.id]: {
                      ...existing,
                      status: "done",
                      output: output ?? existing.output
                    }
                  }
                };
              }

            }
            return { isStreaming: false };
          }
          case "error":
            return { isStreaming: false };
          default:
            return state;
        }
      }, false, `stream-${chunk.type}`),
    setComposerValue: (value) => set({ composerValue: value }, false, "set-composer"),
    reset: () => set(initialState, false, "reset-chat")
  }))
);
