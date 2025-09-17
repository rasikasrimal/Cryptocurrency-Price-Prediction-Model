"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StreamContainerProps {
  children: React.ReactNode;
}

export function StreamContainer({ children }: StreamContainerProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const handleScroll = () => {
      const threshold = 32;
      const atBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < threshold;
      setIsScrolled(!atBottom);
    };

    viewport.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => viewport.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isScrolled) {
      viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [children, isScrolled]);

  return (
    <div className="relative">
      <ScrollArea
        viewportRef={viewportRef}
        className="h-[480px] w-full rounded-xl border border-border/60 bg-background/50"
      >
        <div className="p-6">
          <AnimatePresence initial={false}>
            <motion.div layout className="flex flex-col gap-4">
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </ScrollArea>
      <AnimatePresence>
        {isScrolled ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <Button
              size="sm"
              variant="subtle"
              onClick={() =>
                viewportRef.current?.scrollTo({
                  top: viewportRef.current.scrollHeight,
                  behavior: "smooth"
                })
              }
            >
              Jump to latest
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
