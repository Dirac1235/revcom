import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface LoadingStateProps {
  count?: number;
  type?: 'card' | 'list' | 'table';
}

export function LoadingState({ count = 3, type = 'card' }: LoadingStateProps) {
  if (type === 'card') {
    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden rounded-lg border-border/50 bg-card/60 p-0 shadow-none [backdrop-filter:blur(20px)_saturate(150%)]">

            {/* Image area */}
            <Skeleton className="aspect-4/3 w-full rounded-none bg-muted/40" />

            <CardHeader className="gap-2 px-4 pt-4 pb-0">
              {/* Title + inventory badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-muted/60" />
                  <Skeleton className="h-4 w-1/2 bg-muted/60" />
                </div>
                <Skeleton className="mt-0.5 h-5 w-10 rounded-md bg-muted/60" />
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">
              {/* Description lines */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full bg-muted/40" />
                <Skeleton className="h-3 w-4/5 bg-muted/40" />
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50" />

              {/* Price + CTA */}
              <div className="mt-auto flex items-center justify-between gap-3">
                <Skeleton className="h-7 w-20 bg-muted/60" />
                <Skeleton className="h-8 w-16 rounded-xl bg-muted/40" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <Card key={i} className="flex flex-col overflow-hidden rounded-lg border-border/50 bg-card/60 shadow-none [backdrop-filter:blur(20px)_saturate(150%)]">
            <CardHeader className="gap-3 px-5 pt-5 pb-4">
              {/* Status + owner badges */}
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-16 rounded-full bg-muted/60" />
                <Skeleton className="h-5 w-12 rounded-md bg-muted/40" />
              </div>
              {/* Title */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4 bg-muted/60" />
                <Skeleton className="h-4 w-1/2 bg-muted/60" />
              </div>
              {/* Category · date */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-16 bg-muted/40" />
                <Skeleton className="h-1 w-1 rounded-full bg-muted/40" />
                <Skeleton className="h-3 w-20 bg-muted/40" />
              </div>
            </CardHeader>

            <div className="h-px bg-border/40 mx-5" />

            <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5">
              {/* Description */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full bg-muted/40" />
                <Skeleton className="h-3 w-5/6 bg-muted/40" />
                <Skeleton className="h-3 w-4/6 bg-muted/40" />
              </div>
              {/* Budget */}
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-7 w-7 rounded-lg bg-muted/60" />
                <Skeleton className="h-6 w-32 bg-muted/60" />
              </div>
              {/* CTA */}
              <Skeleton className="mt-auto h-9 w-full rounded-xl bg-muted/40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Table type
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border/50 bg-card/60 [backdrop-filter:blur(20px)_saturate(150%)]">
          <Skeleton className="h-12 w-12 rounded-full bg-muted/60 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3 bg-muted/60" />
            <Skeleton className="h-3 w-1/2 bg-muted/40" />
          </div>
          <Skeleton className="h-8 w-20 rounded-xl bg-muted/40" />
        </div>
      ))}
    </div>
  );
}