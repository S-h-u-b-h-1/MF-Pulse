export function Skeleton({ className = "" }) {
  return <div className={`skeleton ${className}`} />;
}

export function MetricSkeleton() {
  return (
    <div className="glass p-6">
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-36 mt-4" />
    </div>
  );
}

export function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-3.5 flex-1" />
      <Skeleton className="h-3.5 w-10" />
    </div>
  );
}
