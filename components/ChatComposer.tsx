"use client";

import { SendHorizontal, Sparkles } from "lucide-react";
import { useCallback, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useChatStore } from "@/stores/chat.store";

interface ChatComposerProps {
  onSubmit: (value: string) => void;
  isStreaming?: boolean;
}

export function ChatComposer({ onSubmit, isStreaming = false }: ChatComposerProps) {
  const value = useChatStore((state) => state.composerValue);
  const setValue = useChatStore((state) => state.setComposerValue);

  const handleSubmit = useCallback(() => {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue("");
  }, [value, onSubmit, setValue]);

  const shortcuts = useMemo(
    () => [
      {
        combo: "cmd+enter",
        handler: handleSubmit
      },
      {
        combo: "ctrl+enter",
        handler: handleSubmit
      }
    ],
    [handleSubmit]
  );

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="relative rounded-xl border border-border bg-card/80 p-4 shadow-xl">
      <Textarea
        placeholder="Ask anything..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={isStreaming}
        className="resize-none bg-transparent text-base"
      />
      <div className="mt-3 flex items-center justify-between text-xs text-muted">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span>Cmd/Ctrl + Enter to send</span>
        </div>
        <Button onClick={handleSubmit} size="sm" disabled={isStreaming || !value.trim()}>
          <SendHorizontal className="mr-2 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
