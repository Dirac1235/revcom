"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProduct } from "@/lib/hooks/useProducts";
import { productSchema, type ProductFormData } from "@/lib/validations/schemas";
import { CATEGORIES } from "@/lib/constants/categories";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { LoadingState } from "@/components/features/LoadingState";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { product, loading: productLoading } = useProduct(productId);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  });

  const category = watch("category");
  const status = watch("status");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (product) {
      // Pre-fill form with existing product data
      reset({
        title: product.title,
        description: product.description,
        category: product.category as any,
        price: product.price,
        inventory_quantity: product.inventory_quantity || 0,
        image_url: product.image_url || "",
        status: product.status as any,
      });
    }
  }, [product, reset]);

  const onSubmit = async (data: ProductFormData) => {
    if (!user || !product) return;

    // Check if user owns this product
    if (product.seller_id !== user.id) {
      toast({
        title: "Error",
        description: "You don't have permission to edit this product",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("listings")
        .update({
          title: data.title,
          description: data.description,
          category: data.category,
          price: data.price,
          inventory_quantity: data.inventory_quantity,
          image_url: data.image_url,
          status: data.status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product updated successfully",
      });

      router.push(ROUTES.SELLER_PRODUCTS);
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || productLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState count={1} type="card" />
        </main>
      </div>
    );
  }

  if (!user || !product) return null;

  if (product.seller_id !== user.id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-600">You don't have permission to edit this product.</p>
              <Link href={ROUTES.SELLER_PRODUCTS}>
                <Button className="mt-4">Back to My Products</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Edit Product
          </h1>
          <p className="text-muted-foreground">
            Update your product information
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>
              Make changes to your product listing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <div>
                <Label htmlFor="title">Product Title *</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., MacBook Pro M4 16-inch"
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe your product in detail..."
                  rows={5}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setValue("category", value as any)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Price, Inventory, and Status */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price (ETB) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600 mt-1">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="inventory_quantity">Inventory</Label>
                  <Input
                    id="inventory_quantity"
                    type="number"
                    {...register("inventory_quantity", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  {errors.inventory_quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.inventory_quantity.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    value={status}
                    onValueChange={(value) => setValue("status", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600 mt-1">{errors.status.message}</p>
                  )}
                </div>
              </div>

              {/* Image URL */}
              <div>
                <Label htmlFor="image_url">Image URL (optional)</Label>
                <Input
                  id="image_url"
                  {...register("image_url")}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.image_url && (
                  <p className="text-sm text-red-600 mt-1">{errors.image_url.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Provide a direct link to your product image
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </Button>
                <Link href={ROUTES.SELLER_PRODUCTS}>
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
