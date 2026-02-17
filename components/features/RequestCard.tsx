import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowUpRight } from 'lucide-react';

interface RequestCardProps {
  request: Request;
  userId?: string | null;
  showActions?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400',
  closed: 'bg-muted/60 text-muted-foreground border-border/50',
  completed: 'bg-primary/10 text-primary border-primary/20',
};

const STATUS_DOT: Record<string, string> = {
  open: 'bg-green-500',
  closed: 'bg-muted-foreground',
  completed: 'bg-primary',
};

function BudgetDisplay({ min, max }: { min?: number | null; max?: number | null }) {
  if (min && max) {
    return (
      <>
        ${min.toLocaleString()}
        <span className="text-muted-foreground mx-1.5 font-normal">–</span>
        ${max.toLocaleString()}
      </>
    );
  }
  if (min) return <><span className="text-muted-foreground text-sm font-normal mr-1">From</span>${min.toLocaleString()}</>;
  if (max) return <><span className="text-muted-foreground text-sm font-normal mr-1">Up to</span>${max.toLocaleString()}</>;
  return <span className="text-muted-foreground text-sm font-normal">Budget not specified</span>;
}

export function RequestCard({ request, userId, showActions = true }: RequestCardProps) {
  const isOwner = userId && request.buyer_id === userId;
  const statusStyle = STATUS_STYLES[request.status] ?? STATUS_STYLES.closed;
  const dotStyle = STATUS_DOT[request.status] ?? STATUS_DOT.closed;

  return (
    <Card className="group flex flex-col overflow-hidden rounded-lg p-1 border-border/50 bg-card/60 shadow-md [backdrop-filter:blur(20px)_saturate(150%)] transition-all duration-500 hover:border-border hover:shadow-xl">
      <CardHeader className="px-5 pt-5 pb-4 gap-3">
        {/* Status + owner */}
        <div className="flex items-center justify-between gap-2">
          <Badge
            variant="outline"
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${statusStyle}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
            {request.status}
          </Badge>

          {isOwner && (
            <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-border/60 text-muted-foreground">
              Yours
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold leading-snug tracking-tight text-foreground line-clamp-2">
          {request.title}
        </h3>

        {/* Category · date */}
        <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>{request.category}</span>
          <span className="h-1 w-1 shrink-0 rounded-full bg-border/80" />
          <span>{new Date(request.created_at).toLocaleDateString()}</span>
        </div>
      </CardHeader>

      <div className="h-px bg-border/40 mx-5" />

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pt-4 pb-5">
        {/* Description */}
        {request.description && (
          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-3">
            {request.description}
          </p>
        )}

        {/* Budget */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border/50 bg-muted/50">
            <span className="text-xs font-bold text-muted-foreground">$</span>
          </div>
          <p className="text-lg font-bold leading-none tracking-tight text-foreground">
            <BudgetDisplay min={request.budget_min} max={request.budget_max} />
          </p>
        </div>

        {/* CTA */}
        {showActions && (
          <div className="mt-auto pt-1">
            <Button
              variant="outline"
              className="w-full gap-1.5 rounded-xl border-primary/20 bg-primary/10 text-primary hover:bg-primary/20 hover:border-primary/40 hover:-translate-y-px hover:shadow-md transition-all duration-300"
              asChild
            >
              <Link href={ROUTES.LISTING_DETAIL(request.id)}>
                View Details
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}