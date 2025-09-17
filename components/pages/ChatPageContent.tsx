"use client";

import { useEffect, useMemo, useState } from "react";

import { ChatComposer } from "@/components/ChatComposer";
import { ChatMessage } from "@/components/ChatMessage";
import { Skeleton } from "@/components/Skeleton";
import { StreamContainer } from "@/components/StreamContainer";
import { ToolInvocationCard } from "@/components/ToolInvocationCard";
import { useStream } from "@/hooks/useStream";
import { useChatStore } from "@/stores/chat.store";
import type { RealtimeRequest } from "@/types/api";
import { chatMessageSchema, type StreamChunk } from "@/types/chat";

export function ChatPageContent() {
  const messages = useChatStore((state) => state.messages);
  const appendMessage = useChatStore((state) => state.appendMessage);
  const updateFromStream = useChatStore((state) => state.updateFromStream);
  const isStreaming = useChatStore((state) => state.isStreaming);
  const toolCalls = useChatStore((state) => Object.values(state.pendingToolCalls));
  const [initializing, setInitializing] = useState(true);
  const [request, setRequest] = useState<RealtimeRequest | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      try {
        const response = await fetch("/api/messages");
        if (!response.ok) throw new Error("Failed to load messages");
        const data = await response.json();
        if (!isMounted) return;
        data.items?.forEach((message: unknown) => {
          const parsed = chatMessageSchema.parse(message);
          appendMessage(parsed);
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setInitializing(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [appendMessage]);

  useStream({
    url: "/api/realtime",
    body: request,
    enabled: Boolean(request),
    onChunk: (chunk: StreamChunk) => {
      updateFromStream(chunk);
      if (chunk.type === "done" || chunk.type === "error") {
        setRequest(null);
      }
    },
    onError: () => {
      setRequest(null);
    }
  });

  const handleSubmit = async (value: string) => {
    const userMessage = {
      id: crypto.randomUUID(),
      role: "user" as const,
      content: value,
      createdAt: new Date().toISOString()
    };
    appendMessage(userMessage);
    setRequest({ prompt: value });
  };

  const content = useMemo(() => {
    if (initializing) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      );
    }

    if (!messages.length) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-sm text-muted">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Start a conversation</span>
          <p className="max-w-sm text-muted">
            Ask the assistant about the system, run tools, or request live metrics.
          </p>
        </div>
      );
    }

    return (
      <StreamContainer>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </StreamContainer>
    );
  }, [initializing, messages]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-6">
        {content}
        <ChatComposer onSubmit={handleSubmit} isStreaming={isStreaming || Boolean(request)} />
      </div>
      <aside className="hidden flex-col gap-4 lg:flex">
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Tool activity</h2>
          <p className="text-xs text-muted">
            Monitor tool invocations and review arguments while the assistant streams.
          </p>
        </div>
        {toolCalls.length === 0 ? (
          <div className="rounded-lg border border-border/60 bg-background/50 p-4 text-xs text-muted">
            Tools will appear here as they are triggered.
          </div>
        ) : (
          <div className="space-y-3">
            {toolCalls.map((call) => (
              <ToolInvocationCard key={call.id} call={call} />
            ))}
          </div>
        )}
      </aside>
    </div>
  );
}
