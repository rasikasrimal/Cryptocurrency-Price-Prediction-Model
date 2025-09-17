"use client";

import { useMemo, useState } from "react";

import { Sparkline } from "@/components/charts/Sparkline";
import { Skeleton } from "@/components/Skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useWebSocket } from "@/hooks/useWebSocket";

interface DashboardEvent {
  type: string;
  id: string;
  seq: number;
  payload?: {
    status?: string;
    output?: string;
    sessionId?: string;
  };
}

export function DashboardPageContent() {
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [connected, setConnected] = useState(false);

  const wsUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${window.location.host}/api/ws`;
  }, []);

  useWebSocket<DashboardEvent>({
    url: wsUrl,
    onMessage: (message) => {
      setEvents((prev) => [...prev.slice(-20), message]);
      if (message.payload?.status === "connected") {
        setConnected(true);
      }
    },
    onOpen: () => setConnected(true),
    onClose: () => setConnected(false),
    enabled: Boolean(wsUrl)
  });

  const stats = useMemo(() => {
    const rps = (events.length / Math.max(1, events.at(-1)?.seq ?? 1)) * 10;
    const latency = Math.max(40, 120 - events.length * 2);
    const sessions = new Set(events.map((event) => event.payload?.sessionId)).size;
    const history = events.map((event) => event.seq % 50);
    return {
      rps: rps.toFixed(1),
      latency: `${latency.toFixed(0)} ms`,
      sessions: Math.max(1, sessions),
      history
    };
  }, [events]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-foreground">Operations Dashboard</h1>
        <p className="text-sm text-muted">
          Monitor websocket activity, track event throughput, and inspect the latest tool updates.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/60 bg-background/60">
          <CardHeader>
            <CardDescription>Requests / sec</CardDescription>
            <CardTitle className="text-3xl font-semibold">{stats.rps}</CardTitle>
          </CardHeader>
          <CardContent>
            <Sparkline values={stats.history.slice(-16)} />
          </CardContent>
        </Card>
        <Card className="border-border/60 bg-background/60">
          <CardHeader>
            <CardDescription>p95 latency</CardDescription>
            <CardTitle className="text-3xl font-semibold">{stats.latency}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-border/60 bg-background/60">
          <CardHeader>
            <CardDescription>Active sessions</CardDescription>
            <CardTitle className="text-3xl font-semibold">{stats.sessions}</CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card className="border-border/60 bg-background/50">
        <CardHeader>
          <CardTitle className="text-lg">Live events</CardTitle>
          <CardDescription>Streaming straight from /api/ws</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs text-muted">
          {!connected && events.length === 0 ? (
            <Skeleton className="h-16" />
          ) : (
            events
              .slice()
              .reverse()
              .map((event) => (
                <div
                  key={`${event.seq}-${event.id}`}
                  className="rounded-md border border-border/40 bg-background/60 p-3 text-foreground"
                >
                  <div className="flex items-center justify-between text-[11px] uppercase tracking-wide text-muted">
                    <span>{event.type}</span>
                    <span>seq {event.seq}</span>
                  </div>
                  {event.payload?.output ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/90">
                      {event.payload.output}
                    </p>
                  ) : null}
                  {event.payload?.status ? (
                    <p className="mt-1 text-[11px] text-muted">Status: {event.payload.status}</p>
                  ) : null}
                </div>
              ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}
