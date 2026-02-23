"use client";

import { useEffect, useState } from "react";
import { getReviewsByProductId } from "@/lib/data/reviews";
import { ReviewCard } from "./ReviewCard";
import { SellerResponseModal } from "./SellerResponseModal";
import type { ReviewWithDetails } from "@/lib/types";

export function SellerReviewsTab({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] =
    useState<ReviewWithDetails | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await getReviewsByProductId(productId);
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading reviews...
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/20">
        You don't have any reviews for this product yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews
        .sort((a, b) => (a.seller_response ? 1 : 0) - (b.seller_response ? 1 : 0))
        .map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            isSellerView
            onRespond={() => setSelectedReview(review)}
          />
        ))}

      {selectedReview && (
        <SellerResponseModal
          isOpen={!!selectedReview}
          onClose={() => setSelectedReview(null)}
          review={selectedReview}
          onSuccess={fetchReviews}
        />
      )}
    </div>
  );
}
