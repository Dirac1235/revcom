import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/lib/types';
import { ROUTES } from '@/lib/constants/routes';
import { DollarSign, Calendar } from 'lucide-react';

interface RequestCardProps {
  request: Request;
  userId?: string | null;
  showActions?: boolean;
}

export function RequestCard({ request, userId, showActions = true }: RequestCardProps) {
  const isOwner = userId && request.buyer_id === userId;
  
  const statusColors = {
    open: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    closed: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
    completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  };

  return (
    <Card className="group hover:border-foreground/20 transition-colors duration-300 border-border bg-card overflow-hidden rounded-lg">
      <CardHeader className="pb-3 pt-6 px-6">
        <div className="flex justify-between items-start gap-3">
          <CardTitle className="text-base font-medium text-foreground line-clamp-2 flex-1 leading-snug">
            {request.title}
          </CardTitle>
          <div className="flex flex-col gap-1 items-end shrink-0">
            {isOwner && (
              <Badge variant="outline" className="border-foreground text-foreground text-[10px] uppercase tracking-wider">Yours</Badge>
            )}
            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-medium">
              {request.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs uppercase tracking-wider font-medium text-muted-foreground pt-1 flex items-center gap-2">
          <span>{request.category}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1">
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 px-6 pb-6">
        {request.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
            {request.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-6">
          <p className="text-lg font-serif font-bold text-foreground">
            {request.budget_min && request.budget_max
              ? `$${request.budget_min.toLocaleString()} - $${request.budget_max.toLocaleString()}`
              : request.budget_min
              ? `From $${request.budget_min.toLocaleString()}`
              : request.budget_max
              ? `Up to $${request.budget_max.toLocaleString()}`
              : 'Budget not specified'}
          </p>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Link href={ROUTES.LISTING_DETAIL(request.id)} className="flex-1">
              <Button variant="outline" className="w-full hover:bg-foreground hover:text-background transition-colors">
                View Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
