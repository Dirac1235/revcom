"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/lib/hooks/use-toast";
import { updateOfferStatus } from "@/lib/data/offers";
import { Check } from "lucide-react";

interface AcceptOfferButtonProps {
  offerId: string;
  requestId: string;
}

export default function AcceptOfferButton({ offerId, requestId }: AcceptOfferButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await updateOfferStatus(offerId, "accepted");
      toast({
        title: "Offer Accepted!",
        description: "You can now proceed with the order.",
      });
      router.refresh();
    } catch (error) {
      console.error("Error accepting offer:", error);
      toast({
        title: "Error",
        description: "Failed to accept offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleAccept} 
      disabled={loading}
      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
    >
      <Check className="w-4 h-4 mr-2" />
      {loading ? "Accepting..." : "Accept Offer"}
    </Button>
  );
}
