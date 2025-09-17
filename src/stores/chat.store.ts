import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { ChatMessage, StreamChunk, ToolCall } from "@/types/chat";

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
            const toolId = typeof chunk.data === "object" && chunk.data ? (chunk.data as { id?: string }).id : undefined;
            if (toolId && state.pendingToolCalls[toolId]) {
              const output =
                typeof chunk.data === "object" && chunk.data
                  ? (chunk.data as { output?: string }).output
                  : undefined;
              return {
                isStreaming: false,
                pendingToolCalls: {
                  ...state.pendingToolCalls,
                  [toolId]: {
                    ...state.pendingToolCalls[toolId],
                    status: "done",
                    output: output ?? state.pendingToolCalls[toolId].output
                  }
                }
              };
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
