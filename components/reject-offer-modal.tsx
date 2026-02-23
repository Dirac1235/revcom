"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/lib/hooks/use-toast";
import { rejectOffer } from "@/lib/data/offers-server";
import { X, Loader2, AlertTriangle, User } from "lucide-react";

interface Offer {
  id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface RejectOfferModalProps {
  offer: Offer;
  requestId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RejectOfferModal({
  offer,
  requestId,
  isOpen,
  onOpenChange,
}: RejectOfferModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await rejectOffer(offer.id, "");
      toast({
        title: "Offer Rejected",
        description: "The seller has been notified.",
      });
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("Error rejecting offer:", error);
      const errorMessage = (error as Error).message || "Failed to reject offer";
      
      if (errorMessage.includes("no longer pending")) {
        toast({
          title: "Offer No Longer Available",
          description: "This offer has already been processed.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("no longer open")) {
        toast({
          title: "Request Already Closed",
          description: "This request already has an accepted offer.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to reject offer. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Reject This Offer?
          </DialogTitle>
          <DialogDescription>
            The seller will be notified that their offer has been rejected.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {offer.seller?.first_name} {offer.seller?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {offer.price?.toLocaleString()} ETB - {offer.delivery_timeline}
                </p>
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            You can still accept other pending offers for this request.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            variant="destructive"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Rejecting...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Confirm Reject
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}