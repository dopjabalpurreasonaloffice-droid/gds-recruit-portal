import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("skeleton rounded-md", className)} aria-hidden="true" />
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <output
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-3",
        className,
      )}
      aria-busy="true"
      aria-label="Loading..."
    >
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </output>
  );
}

export function SkeletonTable({
  rows = 5,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `row-${i}`);
  const colKeys = Array.from({ length: cols }, (_, i) => `col-${i}`);

  return (
    <output
      className={cn(
        "rounded-lg border border-border bg-card overflow-hidden",
        className,
      )}
      aria-busy="true"
      aria-label="Loading table..."
    >
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 bg-muted/40 border-b border-border">
        {colKeys.map((k) => (
          <Skeleton key={k} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {rowKeys.map((rk) => (
        <div
          key={rk}
          className="flex gap-4 px-4 py-3 border-b border-border last:border-b-0"
        >
          {colKeys.map((ck, colIdx) => (
            <Skeleton
              key={ck}
              className={cn("h-3 flex-1", colIdx === 0 ? "w-1/4" : "w-full")}
            />
          ))}
        </div>
      ))}
    </output>
  );
}

export function SkeletonForm({
  fields = 4,
  className,
}: { fields?: number; className?: string }) {
  const fieldKeys = Array.from({ length: fields }, (_, i) => `field-${i}`);

  return (
    <output
      className={cn("space-y-4", className)}
      aria-busy="true"
      aria-label="Loading form..."
    >
      {fieldKeys.map((k) => (
        <div key={k} className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </output>
  );
}

export function SkeletonStatCard({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card p-4 space-y-2",
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-2.5 w-16" />
    </div>
  );
}
