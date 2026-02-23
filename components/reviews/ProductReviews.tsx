"use client";

import { useState, useEffect } from "react";
import { Star, MessageSquare } from "lucide-react";
import {
  getReviewsByProductId,
  getProductRatingBreakdown,
  markReviewHelpful,
  RatingBreakdown as RatingBreakdownType,
} from "@/lib/data/reviews";
import { ReviewCard } from "./ReviewCard";
import { RatingBreakdown } from "./RatingBreakdown";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { ReviewWithDetails } from "@/lib/types";

interface ProductReviewsProps {
  productId: string;
  currentUserId?: string;
  averageRating: number;
  totalReviews: number;
}

export function ProductReviews({
  productId,
  currentUserId,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [breakdown, setBreakdown] = useState<RatingBreakdownType>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("recent");
  const [filterVerified, setFilterVerified] = useState(false);
  const [filterRating, setFilterRating] = useState<string>("all");

  useEffect(() => {
    const fetchReviewsData = async () => {
      setLoading(true);
      try {
        const [fetchedReviews, fetchedBreakdown] = await Promise.all([
          getReviewsByProductId(productId),
          getProductRatingBreakdown(productId),
        ]);
        setReviews(fetchedReviews);
        setBreakdown(fetchedBreakdown);
      } catch (error) {
        console.error("Error fetching reviews data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewsData();
  }, [productId]);

  const [votedReviews, setVotedReviews] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("revcom_helpful_votes");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleHelpful = async (reviewId: string) => {
    if (votedReviews.has(reviewId)) return;

    const success = await markReviewHelpful(reviewId);
    if (success) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
            : r,
        ),
      );
      const updated = new Set(votedReviews);
      updated.add(reviewId);
      setVotedReviews(updated);
      try {
        localStorage.setItem(
          "revcom_helpful_votes",
          JSON.stringify([...updated]),
        );
      } catch {}
    }
  };

  const filteredReviews = reviews
    .filter((r) => (filterVerified ? r.verified_purchase : true))
    .filter((r) =>
      filterRating !== "all" ? r.rating === parseInt(filterRating) : true,
    )
    .sort((a, b) => {
      if (sortBy === "recent")
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      if (sortBy === "helpful")
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      return 0;
    });

  if (loading) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Loading reviews...
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold">Customer Reviews</h2>

      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div className="col-span-1 space-y-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold">
              {Number(averageRating).toFixed(1)}
            </div>
            <div className="space-y-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(averageRating) ? "fill-current" : "fill-transparent text-muted-foreground"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {totalReviews} reviews
              </p>
            </div>
          </div>
          <RatingBreakdown breakdown={breakdown} totalReviews={totalReviews} />
        </div>

      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-[180px]">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="highest">Highest Rating</SelectItem>
              <SelectItem value="lowest">Lowest Rating</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stars" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stars</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
              <SelectItem value="4">4 Stars Only</SelectItem>
              <SelectItem value="3">3 Stars Only</SelectItem>
              <SelectItem value="2">2 Stars Only</SelectItem>
              <SelectItem value="1">1 Star Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 sm:ml-auto">
          <Checkbox
            id="verified"
            checked={filterVerified}
            onCheckedChange={(c: boolean | "indeterminate") =>
              setFilterVerified(!!c)
            }
          />
          <label htmlFor="verified" className="text-sm font-medium">
            Verified Purchases
          </label>
        </div>
      </div>

      <div className="space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-10 bg-muted/20 border border-dashed rounded-lg">
            <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-semibold text-lg">No reviews yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
              {reviews.length > 0
                ? "No reviews match your selected filters."
                : "Be the first to review this product after purchasing!"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              currentUserId={currentUserId}
              onHelpful={handleHelpful}
              helpfulVoted={votedReviews.has(review.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
