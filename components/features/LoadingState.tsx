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
          <Card key={i} className="overflow-hidden border-border shadow-none rounded-lg">
            <Skeleton className="aspect-square w-full bg-secondary/30" />
            <CardHeader className="pb-3 pt-4 px-4">
              <Skeleton className="h-5 w-3/4 mb-2 bg-secondary/30" />
              <Skeleton className="h-3 w-1/3 bg-secondary/30" />
            </CardHeader>
            <CardContent className="pt-0 px-4 pb-4">
              <Skeleton className="h-7 w-1/3 mb-3 bg-secondary/30" />
              <Skeleton className="h-3 w-full mb-2 bg-secondary/30" />
              <Skeleton className="h-3 w-2/3 mb-4 bg-secondary/30" />
              <Skeleton className="h-9 w-full bg-secondary/30" />
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
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mb-4" />
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-24" />
              </div>
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
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
}
