"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { StarRating } from "./StarRating";
import {
  createReview,
  updateReview,
  type CreateReviewPayload,
} from "@/lib/data/reviews";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Review } from "@/lib/types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  orderId: string;
  buyerId: string;
  existingReview?: Review | null;
  onSuccess?: () => void;
}

export function ReviewModal({
  isOpen,
  onClose,
  productId,
  orderId,
  buyerId,
  existingReview,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || "");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingReview) {
        const { error } = await updateReview(existingReview.id, {
          rating,
          comment: comment.trim() || undefined,
        });

        if (error) throw error;
        toast.success("Review updated successfully");
      } else {
        const payload: CreateReviewPayload = {
          product_id: productId,
          order_id: orderId,
          buyer_id: buyerId,
          rating,
          comment: comment.trim() || undefined,
          // If anonymous is handled differently, maybe pass user_type or just handle in DB.
          // For now, verified_purchase is true by default.
        };

        const { error } = await createReview(payload);
        if (error) throw error;
        toast.success("Review posted! Thank you for your feedback.");
      }

      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("An error occurred while saving your review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingReview ? "Edit Your Review" : "Leave a Review"}
          </DialogTitle>
          <DialogDescription>
            Share your experience with this product to help others.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-medium">How would you rate it?</span>
            <StarRating
              rating={rating}
              interactive
              size="lg"
              onRatingChange={setRating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              placeholder="What did you like or dislike? What was the quality like?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="resize-none h-24"
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {comment.length}/1000
            </div>
          </div>

          {!existingReview && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(c: boolean | "indeterminate") =>
                  setIsAnonymous(!!c)
                }
              />
              <label
                htmlFor="anonymous"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Post anonymously
              </label>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingReview ? "Update Review" : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
