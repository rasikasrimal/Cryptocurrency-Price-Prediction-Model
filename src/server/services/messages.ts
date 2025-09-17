import type { ChatMessage } from "@/types/chat";

const messages: ChatMessage[] = [];

export function addMessage(message: ChatMessage) {
  messages.push(message);
}

export function getMessages() {
  return messages.slice();
}
