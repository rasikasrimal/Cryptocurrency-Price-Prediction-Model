import { AppShell } from "@/components/layout/AppShell";
import { ChatClient } from "./ChatClient";

export default function ChatPage() {
  return (
    <AppShell>
      <ChatClient />
    </AppShell>
  );
}
