import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({ className, shimmer = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "h-4 w-full rounded-md bg-foreground/10",
        shimmer && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}
