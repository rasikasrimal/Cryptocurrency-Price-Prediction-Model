import { describe, expect, it } from "vitest";

import { useChatStore } from "@/stores/chat.store";

describe("chat store", () => {
  it("appends messages uniquely", () => {
    useChatStore.getState().reset();
    const message = {
      id: "1",
      role: "assistant" as const,
      content: "hello",
      createdAt: new Date().toISOString()
    };
    useChatStore.getState().appendMessage(message);
    useChatStore.getState().appendMessage(message);
    expect(useChatStore.getState().messages).toHaveLength(1);
  });
});
