"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // e.g., 4.5
  maxRating?: number; // default 5
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = {
  sm: "w-3 h-3",
  md: "w-5 h-5",
  lg: "w-8 h-8",
};

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onRatingChange,
  className,
}: StarRatingProps) {
  const iconClass = sizeClasses[size];
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const renderStar = (index: number) => {
    const starValue = index + 1;
    const isHalf =
      !interactive && displayRating - index > 0 && displayRating - index < 1;
    const isFilled = displayRating >= starValue;

    return (
      <div
        key={index}
        className={cn(
          "relative",
          interactive && "cursor-pointer transition-transform hover:scale-110",
        )}
        onClick={() => {
          if (interactive && onRatingChange) {
            onRatingChange(starValue);
          }
        }}
        onMouseEnter={() => interactive && setHoverRating(starValue)}
        onMouseLeave={() => interactive && setHoverRating(null)}
      >
        {isHalf ? (
          <div className="relative">
            <Star className={cn(iconClass, "text-muted-foreground stroke-1")} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star
                className={cn(
                  iconClass,
                  "fill-yellow-400 text-yellow-400 stroke-1",
                )}
              />
            </div>
          </div>
        ) : (
          <Star
            className={cn(
              iconClass,
              "stroke-1",
              isFilled
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground fill-transparent",
            )}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: maxRating }).map((_, i) => renderStar(i))}
    </div>
  );
}
