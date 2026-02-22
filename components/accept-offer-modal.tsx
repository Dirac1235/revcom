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
import { acceptOffer } from "@/lib/data/offers-server";
import { Check, Loader2, AlertTriangle, DollarSign, Clock, User } from "lucide-react";

interface Offer {
  id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost?: number;
  payment_terms?: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface AcceptOfferModalProps {
  offer: Offer;
  requestId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcceptOfferModal({
  offer,
  requestId,
  isOpen,
  onOpenChange,
}: AcceptOfferModalProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await acceptOffer(offer.id, "");
      toast({
        title: "Order Created!",
        description: "Seller has been notified. Redirecting to your order...",
      });
      onOpenChange(false);
      router.refresh();
      router.push(`/buyer/orders`);
    } catch (error) {
      console.error("Error accepting offer:", error);
      const errorMessage = (error as Error).message || "Failed to accept offer";
      
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
          description: errorMessage || "Failed to accept offer. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Accept This Offer?
          </DialogTitle>
          <DialogDescription>
            This will create an order and close your request. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">
                  {offer.seller?.first_name} {offer.seller?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">Seller</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-semibold">{offer.price?.toLocaleString()} ETB</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-semibold">{offer.delivery_timeline}</p>
                </div>
              </div>
            </div>

            {offer.description && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Proposal</p>
                <p className="text-sm line-clamp-3">{offer.description}</p>
              </div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium">Warning</p>
            <p className="text-amber-700">
              Accepting this offer will reject all other pending offers for this request.
            </p>
          </div>
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
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Order...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Confirm Accept
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}