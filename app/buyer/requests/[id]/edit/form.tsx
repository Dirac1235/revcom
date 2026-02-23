"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Banknote, 
  Package, 
  Tag, 
  TextQuote, 
  Loader2, 
  ChevronRight 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Field, 
  FieldDescription, 
  FieldGroup, 
  FieldLabel, 
  FieldLegend, 
  FieldSeparator, 
  FieldSet 
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import { updateRequest } from "@/lib/data/requests";

const categories = [
  "Electronics", "Furniture", "Clothing", "Books", 
  "Home & Garden", "Sports & Outdoors", "Toys & Games", 
  "Services", "Other"
];

export function EditRequestForm({ request }: { request: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Since this pattern is more manual than FormField, 
  // we manage local state for the submission.
  const [formData, setFormData] = useState({
    title: request.title ?? "",
    category: request.category ?? "",
    description: request.description ?? "",
    budget_min: request.budget_min ?? 0,
    budget_max: request.budget_max ?? 0,
    quantity: request.quantity ?? 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await updateRequest(request.id, formData);
      toast({ title: "Success", description: "Request updated successfully." });
      router.push(`/buyer/requests/${request.id}`);
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update request.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <FieldGroup>
        <FieldSet>
          <FieldLegend>Request Details</FieldLegend>
          <FieldDescription>
            Provide the specific details of the item or service you need.
          </FieldDescription>
          
          <FieldGroup>
            {/* Title Field */}
            <Field>
              <FieldLabel htmlFor="request-title">What do you need?</FieldLabel>
              <div className="relative">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="request-title"
                  className="pl-9"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Headphones"
                  required
                />
              </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category Field */}
              <Field>
                <FieldLabel htmlFor="request-category">Category</FieldLabel>
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({ ...formData, category: val })}
                >
                  <SelectTrigger id="request-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              {/* Quantity Field */}
              <Field>
                <FieldLabel htmlFor="request-quantity">Quantity</FieldLabel>
                <div className="relative">
                  <Package className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="request-quantity"
                    type="number"
                    className="pl-9"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    required
                  />
                </div>
              </Field>
            </div>

            {/* Description Field */}
            <Field>
              <FieldLabel htmlFor="request-description">Full Description</FieldLabel>
              <div className="relative">
                <TextQuote className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="request-description"
                  className="pl-9 min-h-[120px] pt-3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Be specific about condition, color, and delivery..."
                  required
                />
              </div>
              <FieldDescription>
                Detailed descriptions help sellers provide accurate offers.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        <FieldSet>
          <FieldLegend>Budget Range</FieldLegend>
          <FieldDescription>
            Set your expected price range in ETB.
          </FieldDescription>
          
          <FieldGroup>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="budget-min">Min Budget</FieldLabel>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="budget-min"
                    type="number"
                    className="pl-9"
                    value={formData.budget_min}
                    onChange={(e) => setFormData({ ...formData, budget_min: Number(e.target.value) })}
                    required
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="budget-max">Max Budget</FieldLabel>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3 h-4 w-4 text-emerald-600" />
                  <Input
                    id="budget-max"
                    type="number"
                    className="pl-9"
                    value={formData.budget_max}
                    onChange={(e) => setFormData({ ...formData, budget_max: Number(e.target.value) })}
                    required
                  />
                </div>
              </Field>
            </div>
          </FieldGroup>
        </FieldSet>

        <FieldSeparator />

        {/* Action Buttons */}
        <Field orientation="horizontal" className="justify-end py-4">
          <Button 
            variant="outline" 
            type="button" 
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save Changes
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}