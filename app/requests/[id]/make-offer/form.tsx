"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createOffer } from "@/lib/data/offers-server";
import { createConversation } from "@/lib/data/conversations-server";
import { createNotification } from "@/lib/data/notifications-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import { ROUTES } from "@/lib/constants/routes";
import type { Profile, Request } from "@/lib/types";
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Check,
  Lightbulb,
} from "lucide-react";

const DELIVERY_TIMELINES = [
  { value: "within_1_week", label: "Within 1 week" },
  { value: "1_2_weeks", label: "1-2 weeks" },
  { value: "2_4_weeks", label: "2-4 weeks" },
  { value: "1_2_months", label: "1-2 months" },
  { value: "custom", label: "Custom" },
];

const PAYMENT_TERMS = [
  { value: "50_upfront_50_delivery", label: "50% upfront, 50% on delivery" },
  { value: "full_on_delivery", label: "Full payment on delivery" },
  { value: "net_30", label: "Net 30 days" },
  { value: "custom", label: "Custom" },
];

interface MakeOfferFormProps {
  request: Request;
  buyer: Profile | null;
  existingOffer: any;
  userId: string;
  requestId: string;
}

export default function MakeOfferForm({
  request,
  buyer,
  existingOffer,
  userId,
  requestId,
}: MakeOfferFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showAdditionalTerms, setShowAdditionalTerms] = useState(false);
  const [freeDelivery, setFreeDelivery] = useState(false);

  const [formData, setFormData] = useState({
    price: existingOffer?.price?.toString() || "",
    description: existingOffer?.description || "",
    delivery_timeline: existingOffer?.delivery_timeline || "",
    delivery_cost: existingOffer?.delivery_cost?.toString() || "",
    payment_terms: existingOffer?.payment_terms || "",
    custom_timeline: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const getPricePerUnit = () => {
    if (!formData.price || !request?.quantity) return 0;
    return parseFloat(formData.price) / (request.quantity || 1);
  };

  const isPriceOutsideBudget = () => {
    if (!formData.price || !request) return false;
    const price = parseFloat(formData.price);
    const budgetMin = request.budget_min || 0;
    const budgetMax = request.budget_max || budgetMin * 2;
    return price < budgetMin * 0.8 || price > budgetMax * 1.2;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Offer price is required and must be greater than 0";
    }

    if (!formData.description || formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }

    if (formData.description.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    if (!formData.delivery_timeline) {
      newErrors.delivery_timeline = "Please select a delivery timeline";
    }

    if (formData.delivery_timeline === "custom" && !formData.custom_timeline) {
      newErrors.custom_timeline = "Please specify your delivery timeline";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const timeline =
        formData.delivery_timeline === "custom"
          ? formData.custom_timeline
          : formData.delivery_timeline;

      await createOffer({
        seller_id: userId,
        request_id: requestId,
        price: parseFloat(formData.price),
        description: formData.description,
        delivery_timeline: timeline,
        delivery_cost: freeDelivery
          ? 0
          : parseFloat(formData.delivery_cost || "0"),
        payment_terms: formData.payment_terms || undefined,
        status: "pending",
      });

      await createConversation(userId, request.buyer_id, undefined, requestId);

      await createNotification({
        user_id: request.buyer_id,
        type: "new_offer",
        title: "New Offer Received",
        message: `You have a new offer for "${request.title}"`,
        link: `/buyer/requests/${requestId}`,
      });

      toast({
        title: existingOffer ? "Offer Updated!" : "Offer Submitted!",
        description: "The buyer has been notified of your offer.",
      });

      router.push(ROUTES.SELLER_OFFERS);
    } catch (error: any) {
      console.error("[MakeOffer] Error:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to submit offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`offer_draft_${requestId}`, JSON.stringify(formData));
    toast({
      title: "Draft Saved",
      description: "You can continue editing your offer later.",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your Offer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Pricing */}
          <div className="space-y-2">
            <Label htmlFor="price">
              Offer Price <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                ETB
              </span>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="Enter your price"
                value={formData.price}
                onChange={handleChange}
                className={`pl-14 text-lg font-semibold ${errors.price ? "border-red-500" : ""}`}
              />
            </div>
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price}</p>
            )}
            {formData.price && request.quantity && request.quantity > 1 && (
              <p className="text-sm text-muted-foreground">
                Price per unit:{" "}
                <span className="font-semibold">
                  {getPricePerUnit().toLocaleString()} ETB
                </span>
              </p>
            )}
            {formData.price && isPriceOutsideBudget() && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                <Check className="w-4 h-4" />
                <span>Your price is outside the buyer's budget range</span>
              </div>
            )}
          </div>

          {/* Proposal Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Proposal Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe what you're offering, delivery timeline, specifications..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className={errors.description ? "border-red-500" : ""}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              {errors.description ? (
                <span className="text-red-500">{errors.description}</span>
              ) : (
                <span>Be specific about product specs</span>
              )}
              <span>{formData.description.length}/1000</span>
            </div>
          </div>

          {/* Delivery Timeline */}
          <div className="space-y-2">
            <Label htmlFor="delivery_timeline">
              Delivery Timeline <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.delivery_timeline}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, delivery_timeline: value }))
              }
            >
              <SelectTrigger
                className={errors.delivery_timeline ? "border-red-500" : ""}
              >
                <SelectValue placeholder="Select delivery timeline" />
              </SelectTrigger>
              <SelectContent>
                {DELIVERY_TIMELINES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.delivery_timeline && (
              <p className="text-sm text-red-500">{errors.delivery_timeline}</p>
            )}
            {formData.delivery_timeline === "custom" && (
              <Input
                name="custom_timeline"
                placeholder="Specify delivery date"
                value={formData.custom_timeline}
                onChange={handleChange}
                className="mt-2"
              />
            )}
          </div>

          {/* Delivery Cost */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="free_delivery"
                checked={freeDelivery}
                onChange={(e) => setFreeDelivery(e.target.checked)}
                className="w-4 h-4"
              />
              <Label
                htmlFor="free_delivery"
                className="font-normal cursor-pointer"
              >
                Free delivery
              </Label>
            </div>
            {!freeDelivery && (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ETB
                </span>
                <Input
                  name="delivery_cost"
                  type="number"
                  placeholder="Delivery cost"
                  value={formData.delivery_cost}
                  onChange={handleChange}
                  className="pl-14"
                />
              </div>
            )}
          </div>

          {/* Additional Terms */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdditionalTerms(!showAdditionalTerms)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium">Additional Terms</span>
              {showAdditionalTerms ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {showAdditionalTerms && (
              <div className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select
                    value={formData.payment_terms}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, payment_terms: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="text-sm font-medium">Preview your offer</span>
              {showPreview ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            {showPreview && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg space-y-2">
                <p>
                  <span className="font-semibold">Price:</span>{" "}
                  {formData.price
                    ? `${parseFloat(formData.price).toLocaleString()} ETB`
                    : "-"}
                </p>
                <p>
                  <span className="font-semibold">Delivery:</span>{" "}
                  {formData.delivery_timeline || "-"}
                </p>
                <p>
                  <span className="font-semibold">Description:</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formData.description || "-"}
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div>
            <button
              type="button"
              onClick={() => setShowTips(!showTips)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Tips for better offers</span>
              {showTips ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
            {showTips && (
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground bg-secondary/10 p-4 rounded-lg">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Be competitive but realistic
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Highlight your unique value
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Respond quickly
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  Include delivery details
                </li>
              </ul>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              type="submit"
              disabled={submitting || request.status !== "open"}
              className="w-full h-12 text-base font-semibold"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : existingOffer ? (
                "Update Offer"
              ) : (
                "Submit Offer"
              )}
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                className="w-full"
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
