"use client";

import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ToolCall } from "@/types/chat";

interface ToolInvocationCardProps {
  call: ToolCall;
}

const statusVariants: Record<ToolCall["status"], string> = {
  queued: "outline",
  running: "secondary",
  done: "default",
  error: "secondary"
};

export function ToolInvocationCard({ call }: ToolInvocationCardProps) {
  const [open, setOpen] = useState(true);

  return (
    <Card className="border-border/60 bg-background/50">
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-primary/10 p-2 text-primary">
            <Terminal className="h-4 w-4" />
          </span>
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">{call.name}</CardTitle>
            <p className="text-xs text-muted">{call.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusVariants[call.status] ?? "outline"}>{call.status}</Badge>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-md border border-border/60 p-1 text-muted transition hover:text-foreground"
          >
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </CardHeader>
      {open ? (
        <CardContent className="space-y-3 text-xs text-muted">
          <div>
            <p className="font-semibold uppercase tracking-wide text-foreground">Arguments</p>
            <pre className="mt-1 overflow-x-auto rounded-md bg-background/70 p-3 text-[11px]">
              {JSON.stringify(call.args, null, 2)}
            </pre>
          </div>
          {call.output ? (
            <div>
              <p className="font-semibold uppercase tracking-wide text-foreground">Output</p>
              <pre className="mt-1 overflow-x-auto rounded-md bg-background/70 p-3 text-[11px] whitespace-pre-wrap">
                {call.output}
              </pre>
            </div>
          ) : null}
        </CardContent>
      ) : null}
    </Card>
  );
}
