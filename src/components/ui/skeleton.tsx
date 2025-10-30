import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Table row skeleton with multiple cells
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === 0 ? "25%" : i === columns - 1 ? "15%" : "20%" }}
        />
      ))}
    </div>
  );
}

// Card skeleton for project/client cards
function CardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-6 space-y-4 bg-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    </div>
  );
}

// Stat card skeleton for dashboard
function StatCardSkeleton() {
  return (
    <div className="rounded-lg border border-border/60 p-6 space-y-4 bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

// User row skeleton with avatar
function UserRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 p-4 border-b border-border last:border-0">
      <div className="sm:col-span-4 flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48 max-w-full" />
        </div>
      </div>
      <div className="sm:col-span-2">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="sm:col-span-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="sm:col-span-2">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
      <div className="sm:col-span-2 flex justify-start sm:justify-end gap-2">
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-9 w-24 rounded-md" />
      </div>
    </div>
  );
}

// Kanban ticket card skeleton
function TicketCardSkeleton() {
  return (
    <div className="rounded-lg border border-border p-3 space-y-3 bg-card">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="h-6 w-6 rounded-full" />
      </div>
    </div>
  );
}

// Tag item skeleton
function TagItemSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-card">
      <div className="flex items-center gap-3">
        <Skeleton className="h-5 w-5 rounded" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  TableRowSkeleton,
  CardSkeleton,
  StatCardSkeleton,
  UserRowSkeleton,
  TicketCardSkeleton,
  TagItemSkeleton,
};
