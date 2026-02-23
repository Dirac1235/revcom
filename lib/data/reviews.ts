import { createClient } from "@/lib/supabase/client";
import type { Review, ReviewWithDetails } from "@/lib/types";
import { PostgrestError } from "@supabase/supabase-js";

// Types for creating and updating reviews
export interface CreateReviewPayload {
  product_id: string;
  buyer_id: string;
  order_id: string;
  rating: number;
  comment?: string;
  verified_purchase?: boolean;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

export async function getReviewsByProductId(
  productId: string,
): Promise<ReviewWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      buyer:profiles!buyer_id(*)
    `,
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching reviews for product:", error);
    return [];
  }

  return data as ReviewWithDetails[];
}

export async function getReviewsByBuyerId(
  buyerId: string,
): Promise<ReviewWithDetails[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      *,
      product:listings!product_id(*)
    `,
    )
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buyer reviews:", error);
    return [];
  }

  return data as ReviewWithDetails[];
}

export async function getReviewByOrderId(
  orderId: string,
): Promise<Review | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("order_id", orderId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching order review:", error);
    return null;
  }

  return data;
}

export async function createReview(
  payload: CreateReviewPayload,
): Promise<{ data: Review | null; error: PostgrestError | null }> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("reviews")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error creating review:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateReview(
  reviewId: string,
  updates: UpdateReviewPayload,
): Promise<{ data: Review | null; error: PostgrestError | null }> {
  const supabase = createClient();

  // ensure updated_at is refreshed
  const dataToUpdate = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("reviews")
    .update(dataToUpdate)
    .eq("id", reviewId)
    .select()
    .single();

  if (error) {
    console.error("Error updating review:", error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function deleteReview(
  reviewId: string,
  userId: string,
): Promise<boolean> {
  const supabase = createClient();

  // RLS will ensure the user can only delete their own review
  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)
    .eq("buyer_id", userId);

  if (error) {
    console.error("Error deleting review:", error);
    return false;
  }

  return true;
}

export async function addSellerResponse(
  reviewId: string,
  response: string,
): Promise<{ data: Review | null; error: PostgrestError | null }> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("update_seller_response", {
    p_review_id: reviewId,
    p_response: response,
  });

  if (error) {
    console.error("Error adding seller response to review:", error);
    return { data: null, error };
  }

  return { data: data as Review, error: null };
}

export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  const supabase = createClient();

  const { error } = await supabase.rpc("increment_helpful_count", {
    p_review_id: reviewId,
  });

  return !error;
}

export type RatingBreakdown = {
  1: number;
  2: number;
  3: number;
  4: number;
  5: number;
};

export async function getProductRatingBreakdown(
  productId: string,
): Promise<RatingBreakdown> {
  const supabase = createClient();

  const breakdown: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // We can group by rating
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId);

  if (error || !data) return breakdown;

  for (const review of data) {
    if (review.rating >= 1 && review.rating <= 5) {
      breakdown[review.rating as keyof RatingBreakdown]++;
    }
  }

  return breakdown;
}
