import { cn } from "@/lib/utils";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/8 before:to-transparent",
        className,
      )}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton className="size-8 rounded-full shrink-0" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="size-8 rounded-full shrink-0" />
        </div>
      </div>
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

export function PlayerSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-black">
      <Skeleton className="aspect-video rounded-none bg-slate-900" />
    </div>
  );
}

export function AuthorSkeleton() {
  return (
    <div className="grid gap-6 py-8 md:grid-cols-[220px_1fr] md:items-start border-t border-border/70">
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="size-48 sm:size-34 rounded-full" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/5" />
        <div className="flex gap-3 mt-4">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 10 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <Skeleton className={`h-4 ${i === 1 ? "w-28" : "w-10 mx-auto"}`} />
        </td>
      ))}
    </tr>
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
      <Skeleton className="size-12 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-6 w-10 rounded-md" />
    </div>
  );
}

export function TeamListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-md">
          <Skeleton className="size-4 rounded-sm shrink-0" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-3 w-10" />
        </div>
      ))}
    </div>
  );
}
