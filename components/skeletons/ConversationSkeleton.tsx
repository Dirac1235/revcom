export function ConversationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-xs px-4 py-2 rounded-lg ${
              i % 2 === 0 ? "bg-muted" : "bg-primary"
            }`}
          >
            <div className="h-4 bg-current opacity-50 animate-pulse rounded mb-2" />
            <div className="h-3 bg-current opacity-30 animate-pulse rounded w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}
