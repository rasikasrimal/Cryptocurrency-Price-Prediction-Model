"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/Skeleton";
import { useToolsStore } from "@/stores/tools.store";

export function ToolsClient() {
  const tools = useToolsStore((state) => state.tools);
  const toggleTool = useToolsStore((state) => state.toggleTool);
  const [testingTool, setTestingTool] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleTest = async (toolId: string) => {
    setTestingTool(toolId);
    setResult(null);
    try {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ args: { example: true } })
      });
      const data = await response.json();
      setResult(`Job ${data.jobId} created with args ${JSON.stringify(data.args)}`);
    } catch (error) {
      setResult((error as Error).message);
    } finally {
      setTestingTool(null);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Tool Registry</h1>
        <p className="text-sm text-muted">
          Enable integrations and run quick tests. Toggle tools to control assistant access.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Card key={tool.id} className="border-border/60 bg-background/50">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">{tool.name}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="rounded-full bg-foreground/10 px-3 py-1 text-xs uppercase tracking-wide text-muted">
                {tool.enabled ? "Enabled" : "Disabled"}
              </span>
              <Button variant="ghost" onClick={() => toggleTool(tool.id)}>
                {tool.enabled ? "Disable" : "Enable"}
              </Button>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button size="sm" onClick={() => handleTest(tool.id)} disabled={testingTool === tool.id}>
                {testingTool === tool.id ? "Testing..." : "Run test"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {testingTool ? <Skeleton className="h-12" /> : null}
      {result ? (
        <div className="rounded-lg border border-border/60 bg-background/50 p-4 text-sm text-muted">
          {result}
        </div>
      ) : null}
    </section>
  );
}
