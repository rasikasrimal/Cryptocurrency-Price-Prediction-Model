"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/chat", label: "Chat" },
  { href: "/tools", label: "Tools" },
  { href: "/dashboard", label: "Dashboard" }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background via-background/95 to-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold uppercase tracking-[0.4em] text-muted">
            Realstream
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Button
                key={item.href}
                asChild
                variant={pathname === item.href ? "subtle" : "ghost"}
                className={cn("text-sm", pathname === item.href && "text-foreground")}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">{children}</main>
    </div>
  );
}
