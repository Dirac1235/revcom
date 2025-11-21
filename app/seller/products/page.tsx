"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/hooks/useAuth';
import { useProducts } from '@/lib/hooks/useProducts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/features/EmptyState';
import { LoadingState } from '@/components/features/LoadingState';
import { ROUTES } from '@/lib/constants/routes';
import { Package, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/lib/hooks/use-toast';

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
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from('listings').delete().eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Product deleted successfully',
      });
      
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingState count={4} type="list" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  const statusColors = {
    active: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    inactive: 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300',
    sold: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              My Products
            </h1>
            <p className="text-muted-foreground">
              Manage your product listings
            </p>
          </div>
          <Link href={ROUTES.SELLER_PRODUCT_CREATE}>
            <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Add New Product
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Products</CardDescription>
              <CardTitle className="text-3xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Active</CardDescription>
              <CardTitle className="text-3xl text-green-600">
                {products.filter(p => p.status === 'active').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Sold</CardDescription>
              <CardTitle className="text-3xl text-blue-600">
                {products.filter(p => p.status === 'sold').length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Views</CardDescription>
              <CardTitle className="text-3xl">
                {products.reduce((sum, p) => sum + (p.views || 0), 0)}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Products List */}
        {products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4 flex-1">
                      {/* Product Image */}
                      <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 flex-shrink-0">
                        <img
                          src={product.images?.[0] || product.image_url || '/placeholder-product.png'}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-xl line-clamp-1">{product.title}</CardTitle>
                          <Badge className={statusColors[product.status]} variant="secondary">
                            {product.status}
                          </Badge>
                        </div>
                        <CardDescription className="line-clamp-2 mb-2">
                          {product.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            ${product.price.toLocaleString()}
                          </span>
                          <span>Category: {product.category}</span>
                          {product.inventory_quantity !== undefined && (
                            <span>Stock: {product.inventory_quantity}</span>
                          )}
                          {product.views !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {product.views} views
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Link href={ROUTES.PRODUCT_DETAIL(product.id)}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={ROUTES.SELLER_PRODUCT_EDIT(product.id)}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No products yet"
            description="Start selling by adding your first product listing"
            actionLabel="Add Product"
            actionHref={ROUTES.SELLER_PRODUCT_CREATE}
          />
        )}
      </main>
    </div>
  );
}
