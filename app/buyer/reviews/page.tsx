"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getReviewsByBuyerId, deleteReview } from "@/lib/data/reviews";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewModal } from "@/components/reviews/ReviewModal";
import { Star, MessageSquare } from "lucide-react";
import type { ReviewWithDetails } from "@/lib/types";

export default function BuyerReviewsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<ReviewWithDetails | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  const loadReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getReviewsByBuyerId(user.id);
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch buyer reviews", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReviews();
    }
  }, [user]);

  const handleDelete = async (reviewId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this review?")) return;

    const success = await deleteReview(reviewId, user.id);
    if (success) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    }
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center">Loading your reviews...</div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Reviews</h1>
          <p className="text-muted-foreground">
            Manage the reviews you've written
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-4">
              <CardDescription>Total Reviews Written</CardDescription>
              <CardTitle className="text-3xl font-serif">
                {reviews.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-4">
              <CardDescription>Average Rating Given</CardDescription>
              <CardTitle className="text-3xl font-serif flex items-center gap-2">
                {reviews.length > 0
                  ? (
                      reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviews.length
                    ).toFixed(1)
                  : "0"}
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-16 bg-muted/20 border border-dashed rounded-lg">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-xl">No reviews yet</h3>
              <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-6">
                You haven't written any reviews yet. Reviewing products helps
                sellers build reputation and guides other buyers.
              </p>
              <Link href="/buyer/orders">
                <Button>Go to My Orders</Button>
              </Link>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="relative">
                {review.product && (
                  <div className="mb-2">
                    <Link
                      href={`/products/${review.product_id}`}
                      className="text-sm font-semibold hover:underline text-primary"
                    >
                      Product: {review.product.title}
                    </Link>
                  </div>
                )}
                <ReviewCard
                  review={review}
                  currentUserId={user.id}
                  onEdit={() => setEditingReview(review)}
                  onDelete={() => handleDelete(review.id)}
                />
              </div>
            ))
          )}
        </div>

        {editingReview && (
          <ReviewModal
            isOpen={!!editingReview}
            onClose={() => setEditingReview(null)}
            productId={editingReview.product_id}
            orderId={editingReview.order_id}
            buyerId={user.id}
            existingReview={editingReview}
            onSuccess={loadReviews}
          />
        )}
      </main>
    </div>
  );
}
