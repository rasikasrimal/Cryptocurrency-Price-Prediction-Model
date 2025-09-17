import type { ChatMessage } from "@/types/chat";

const memoryStore: ChatMessage[] = [];

export const messageRepository = {
  async list(): Promise<ChatMessage[]> {
    return memoryStore.slice(-100);
  },
  async add(message: ChatMessage) {
    memoryStore.push(message);
  }
};
