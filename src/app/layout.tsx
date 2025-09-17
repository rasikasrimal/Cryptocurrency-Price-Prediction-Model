import "@/styles/globals.css";
import "@/styles/tailwind.css";
import "@/styles/theme.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Realtime Demo Platform",
  description: "Streaming chat and tool integrations built with Next.js"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn(inter.variable, "bg-background text-foreground")}> 
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
