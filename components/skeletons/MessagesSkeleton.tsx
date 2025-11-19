export function MessagesSkeleton() {
  return (
    <div className="bg-card border rounded-xl divide-y">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <div className="w-12 h-12 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
