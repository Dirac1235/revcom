"use client";

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { ArrowUpRight, Calendar, Layers, DollarSign } from 'lucide-react';

interface RequestCardProps {
  request: Request;
  userId?: string | null;
  showActions?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  open: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400',
  closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  completed: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
};

const STATUS_DOT: Record<string, string> = {
  open: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)] animate-pulse',
  closed: 'bg-slate-400',
  completed: 'bg-blue-500',
};

function BudgetDisplay({ min, max }: { min?: number | null; max?: number | null }) {
  if (min && max) {
    return (
      <span className="flex items-baseline gap-1">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-tighter">ETB</span>
        {min.toLocaleString()} <span className="text-muted-foreground/50 text-sm font-light">–</span> {max.toLocaleString()}
      </span>
    );
  }
  if (min) return <><span className="text-xs text-muted-foreground mr-1 uppercase">From</span>{min.toLocaleString()}</>;
  if (max) return <><span className="text-xs text-muted-foreground mr-1 uppercase">Up to</span>{max.toLocaleString()}</>;
  return <span className="text-muted-foreground text-sm font-normal">Budget Negotiable</span>;
}

export function RequestCard({ request, userId, showActions = true }: RequestCardProps) {
  const isOwner = userId && request.buyer_id === userId;
  const statusStyle = STATUS_STYLES[request.status] ?? STATUS_STYLES.closed;
  const dotStyle = STATUS_DOT[request.status] ?? STATUS_DOT.closed;

  return (
    <Card className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-linear-to-b from-card to-card/95 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 py-0">
      
      {/* Decorative Gradient Glow */}
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/5 blur-3xl transition-opacity opacity-0 group-hover:opacity-100" />

      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        {/* Top Row: Status & Badges */}
        <div className="mb-4 flex items-center justify-between">
          <Badge
            variant="outline"
            className={`flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${statusStyle}`}
          >
            <span className={`h-2 w-2 rounded-full ${dotStyle}`} />
            {request.status}
          </Badge>

          {isOwner && (
            <Badge className="bg-primary/10 text-primary border-none text-[10px] uppercase font-bold tracking-tight">
              My Request
            </Badge>
          )}
        </div>

        {/* Title & Category */}
        <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                <Layers className="h-3 w-3" />
                {request.category}
            </div>
            <h3 className="text-lg font-bold leading-tight text-foreground transition-colors group-hover:text-primary line-clamp-2">
                {request.title}
            </h3>
        </div>

        {/* Description */}
        {request.description && (
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground/80 line-clamp-2 italic font-light">
            &ldquo;{request.description}&rdquo;
          </p>
        )}

        {/* Info Grid */}
        <div className="mt-auto flex flex-col sm:flex-row justify-between gap-4 border-t border-border/40 pt-5">
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                   <DollarSign className="h-3 w-3" /> Budget
                </span>
                <div className="text-sm font-bold text-foreground">
                    <BudgetDisplay min={request.budget_min} max={request.budget_max} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1">
                   <Calendar className="h-3 w-3" /> Posted
                </span>
                <span className="text-xs font-medium text-foreground/80">
                    {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
            </div>
        </div>

        {/* Action Button */}
        {showActions && (
          <div className="mt-6">
            <Button
              className="w-full h-11 group/btn relative overflow-hidden rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              asChild
            >
              <Link href={ROUTES.LISTING_DETAIL(request.id)}>
                <span className="relative z-10 flex items-center gap-2 font-semibold">
                    Send Proposal
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1" />
                </span>
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}