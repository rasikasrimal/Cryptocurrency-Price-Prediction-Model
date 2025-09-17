import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.3em] text-muted">
          Realtime Demo Platform
        </p>
        <h1 className="text-4xl font-semibold text-foreground">
          Streaming conversations, live tools, and instant insights
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Explore the chat experience, manage tools, and monitor system health.
          Built with Next.js App Router, Tailwind, and production-ready patterns.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button asChild size="lg">
          <Link href="/chat">Open Chat</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">View Dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
