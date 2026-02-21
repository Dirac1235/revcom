"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/lib/hooks/use-toast";
import { updateRequest } from "@/lib/data/requests";

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Services",
  "Other",
];

interface Request {
  id: string;
  title: string;
  category: string;
  description: string;
  budget_min: number | null;
  budget_max: number | null;
  quantity: number | null;
}

export default function EditRequestForm({ request, requestId }: { request: Request; requestId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: request.title,
    category: request.category,
    description: request.description,
    budget_min: String(request.budget_min || ""),
    budget_max: String(request.budget_max || ""),
    quantity: String(request.quantity || "1"),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateRequest(requestId, {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        budget_min: Number.parseFloat(formData.budget_min) || 0,
        budget_max: Number.parseFloat(formData.budget_max) || 0,
      });

      toast({
        title: "Request Updated",
        description: "Your request has been updated successfully.",
      });

      router.push(`/buyer/requests/${requestId}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "Failed to update request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Details</CardTitle>
        <CardDescription>Update what you're looking for</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">What are you looking for?</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., iPhone 13 Pro"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you need"
              rows={5}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget_min">Minimum Budget</Label>
              <Input
                id="budget_min"
                name="budget_min"
                type="number"
                step="0.01"
                value={formData.budget_min}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="budget_max">Maximum Budget</Label>
              <Input
                id="budget_max"
                name="budget_max"
                type="number"
                step="0.01"
                value={formData.budget_max}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Link href={`/buyer/requests/${requestId}`}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
