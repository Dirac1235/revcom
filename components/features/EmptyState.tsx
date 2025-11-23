import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-lg bg-card/50">
      <div className="bg-secondary w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {(actionLabel && (actionHref || onAction)) && (
        <>
          {actionHref ? (
            <Link href={actionHref}>
              <Button variant="outline" className="border-foreground/20 hover:bg-foreground hover:text-background">
                {actionLabel}
              </Button>
            </Link>
          ) : (
            <Button
              onClick={onAction}
              variant="outline"
              className="border-foreground/20 hover:bg-foreground hover:text-background"
            >
              {actionLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
