"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProducts } from "@/lib/hooks/useProducts";
import { deleteListing } from "@/lib/data/listings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { ROUTES } from "@/lib/constants/routes";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToast } from "@/lib/hooks/use-toast";

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const { products, loading, refetch } = useProducts({
    sellerId: user?.id,
    status: undefined, // Show all statuses for seller
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteListing(id);

      toast({
        title: "Success",
        description: "Product deleted successfully",
      });

      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState count={4} type="list" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  const statusColors = {
    active:
      "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300",
    inactive:
      "bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300",
    sold: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
              My Products
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your product listings
            </p>
          </div>
          <Link href={ROUTES.SELLER_PRODUCT_CREATE}>
            <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-3xl font-serif">
                {products.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl font-serif">
                {products.filter((p) => p.status === "active").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardDescription>Sold</CardDescription>
              <CardTitle className="text-3xl font-serif">
                {products.filter((p) => p.status === "sold").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="border-border shadow-none rounded-lg">
            <CardHeader className="pb-3 pt-6 px-6">
              <CardDescription>Total Views</CardDescription>
              <CardTitle className="text-3xl font-serif">
                {products.reduce((sum, p) => sum + (p.views || 0), 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid gap-6">
          {products && products.length > 0 ? (
            products.map((product: any) => (
              <Card
                key={product.id}
                className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {product.image_url && (
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary/20 shrink-0 border border-border">
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-medium text-foreground mb-1">
                            {product.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {product.category}
                          </p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border border-border bg-secondary text-secondary-foreground">
                          {product.status}
                        </span>
                      </div>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-foreground">
                          {product.price?.toLocaleString()} ETB
                        </p>
                        <div className="flex gap-3">
                          <Link href={`/seller/products/${product.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border hover:bg-secondary hover:text-secondary-foreground"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </Link>
                          <Link href={`/products/${product.id}`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-border hover:bg-secondary hover:text-secondary-foreground"
                            >
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-border hover:bg-secondary hover:text-secondary-foreground"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Start selling by adding your first product listing"
              actionLabel="Add Product"
              actionHref={ROUTES.SELLER_PRODUCT_CREATE}
            />
          )}
        </div>
      </main>
    </div>
  );
}
