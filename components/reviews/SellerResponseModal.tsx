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
import { Label } from "@/components/ui/label";
import { addSellerResponse } from "@/lib/data/reviews";
import { toast } from "sonner";
import { Loader2, Medal } from "lucide-react";
import type { ReviewWithDetails } from "@/lib/types";

interface SellerResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: ReviewWithDetails | null;
  onSuccess?: () => void;
}

export function SellerResponseModal({
  isOpen,
  onClose,
  review,
  onSuccess,
}: SellerResponseModalProps) {
  const [response, setResponse] = useState(review?.seller_response || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update response state when review changes
  useState(() => {
    if (review?.seller_response) setResponse(review.seller_response);
  });

  const handleSubmit = async () => {
    if (!review) return;

    setIsSubmitting(true);
    try {
      const { error } = await addSellerResponse(review.id, response.trim());
      if (error) throw error;

      toast.success("Response posted successfully.");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error("Failed to post response. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!review) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Respond to Review</DialogTitle>
          <DialogDescription>
            Your response will be visible publicly below the buyer's review.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="bg-muted/50 p-3 rounded-md text-sm text-muted-foreground italic border-l-2 border-primary/20">
            "{review.comment || review.rating + " Stars Rating"}"
          </div>

          <div className="space-y-2">
            <Label htmlFor="response" className="flex items-center gap-2">
              <Medal className="w-4 h-4 text-primary" /> Your Response
            </Label>
            <Textarea
              id="response"
              placeholder="Thank the buyer or address their concerns..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="resize-none h-24"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {response.length}/500
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              response.trim().length === 0 ||
              response === review.seller_response
            }
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Response
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
