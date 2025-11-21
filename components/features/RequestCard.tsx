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
    <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-blue-100 dark:border-blue-900/50 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg text-blue-600 dark:text-blue-400 line-clamp-2 flex-1">
            {request.title}
          </CardTitle>
          <div className="flex flex-col gap-1 items-end">
            {isOwner && (
              <Badge className="bg-blue-600 text-white text-xs">Yours</Badge>
            )}
            <Badge variant="secondary" className={`${statusColors[request.status]} text-xs capitalize`}>
              {request.status}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm flex items-center gap-2">
          <span>{request.category}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(request.created_at).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {request.description && (
          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
            {request.description}
          </p>
        )}

        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
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
              <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30 transition-all group-hover:shadow-lg">
                View Details
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
