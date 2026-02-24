"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { acceptOffer, rejectOffer } from "@/lib/data/offers-server";
import { AcceptOfferModal } from "@/components/accept-offer-modal";
import { RejectOfferModal } from "@/components/reject-offer-modal";
import { Check, X, Loader2, ExternalLink } from "lucide-react";

interface Offer {
  id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost?: number;
  payment_terms?: string;
  status: string;
  seller_id: string;
  seller?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

interface OfferActionsProps {
  offer: Offer;
  requestId: string;
  requestStatus: string;
}

export function OfferActions({ offer, requestId, requestStatus }: OfferActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isPending = offer.status === "pending" && requestStatus === "open";


  // Already accepted offer - show View Order button
  if (offer.status === "accepted") {
    return (
      <Button 
        variant="outline" 
        className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        onClick={() => router.push(`/buyer/orders`)}
      >
        <ExternalLink className="w-4 h-4 mr-2" />
        View Order
      </Button>
    );
  }

  // Rejected offer - no actions
  if (offer.status === "rejected") {
    return null;
  }

  // Only show accept/reject buttons for pending offers on open requests
  if (!isPending) {
    return null;
  }

  return (
    <>
      <div className="flex gap-3 pt-2">
        <Button 
          onClick={() => setAcceptModalOpen(true)}
          disabled={loading}
          className="flex-1 bg-primary hover:bg-primary/90"
        >
          <Check className="w-4 h-4 mr-2" />
          Accept
        </Button>
        <Button 
          variant="outline"
          onClick={() => setRejectModalOpen(true)}
          disabled={loading}
          className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          <X className="w-4 h-4 mr-2" />
          Reject
        </Button>
      </div>

      <AcceptOfferModal
        offer={offer}
        requestId={requestId}
        isOpen={acceptModalOpen}
        onOpenChange={setAcceptModalOpen}
      />

      <RejectOfferModal
        offer={offer}
        requestId={requestId}
        isOpen={rejectModalOpen}
        onOpenChange={setRejectModalOpen}
      />
    </>
  );
}