import { Progress } from "@/components/ui/progress";
import { Star } from "lucide-react";

interface RatingBreakdownProps {
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  totalReviews: number;
}

export function RatingBreakdown({
  breakdown,
  totalReviews,
}: RatingBreakdownProps) {
  // If no reviews, we still show 0%
  const safeTotal = totalReviews || 1;

  const getPercentage = (count: number) => {
    return Math.round((count / safeTotal) * 100);
  };

  return (
    <div className="space-y-2 w-full max-w-sm">
      {[5, 4, 3, 2, 1].map((star) => {
        const count = breakdown[star as keyof typeof breakdown] || 0;
        const percentage = getPercentage(count);
        return (
          <div key={star} className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 w-12 text-muted-foreground">
              <span>{star}</span>
              <Star className="w-3 h-3 fill-current" />
            </div>
            <Progress value={percentage} className="h-2 flex-1" />
            <div className="w-10 text-right text-xs text-muted-foreground">
              {percentage}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
