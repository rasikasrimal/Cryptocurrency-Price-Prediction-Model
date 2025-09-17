"use client";

import { Clipboard, ClipboardCheck } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import type { ChatMessage as ChatMessageType } from "@/types/chat";

interface ChatMessageProps {
  message: ChatMessageType;
}

const roleLabels: Record<ChatMessageType["role"], string> = {
  user: "You",
  assistant: "Assistant",
  tool: "Tool",
  system: "System"
};

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative rounded-lg border border-border/60 bg-background/40 p-4 transition hover:border-primary/60">
      <div className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide text-muted">
        <Badge variant={message.role === "assistant" ? "secondary" : "outline"}>{roleLabels[message.role]}</Badge>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-muted transition hover:text-foreground"
        >
          {copied ? <ClipboardCheck className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <div className="space-y-3 text-sm leading-relaxed text-foreground">
        {message.content.split("\n").map((line, index) => (
          <p key={index} className="whitespace-pre-wrap">
            {line}
          </p>
        ))}
      </div>
      {message.toolCalls?.length ? (
        <div className="mt-4 space-y-2">
          {message.toolCalls.map((tool) => (
            <div key={tool.id} className="rounded-md border border-border/40 bg-background/60 p-3 text-xs text-muted">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{tool.name}</span>
                <span className="uppercase tracking-wide text-muted">{tool.status}</span>
              </div>
              {tool.output ? <p className="mt-2 whitespace-pre-wrap text-foreground">{tool.output}</p> : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
