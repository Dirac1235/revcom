"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/lib/hooks/useProducts';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants/routes';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/lib/hooks/use-toast';
import {
  Package,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  Eye,
  ShoppingCart,
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const productId = params.id as string;

  const { product, loading, error } = useProduct(productId);

  // Increment view count
  useEffect(() => {
    if (product) {
      const incrementViews = async () => {
        const supabase = createClient();
        await supabase
          .from('listings')
          .update({ views: (product.views || 0) + 1 })
          .eq('id', productId);
      };
      incrementViews();
    }
  }, [product, productId]);

  const handleContactSeller = async () => {
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!product) return;

    try {
      const supabase = createClient();
      
      // Check if conversation already exists
      const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('participant_1_id', user.id)
        .eq('participant_2_id', product.seller_id)
        .eq('listing_id', product.id)
        .single();

      if (existing) {
        router.push(ROUTES.MESSAGE_CONVERSATION(existing.id));
        return;
      }

      // Create new conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1_id: user.id,
          participant_2_id: product.seller_id,
          listing_id: product.id,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(ROUTES.MESSAGE_CONVERSATION(newConversation.id));
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Product not found</h2>
            <Link href={ROUTES.PRODUCTS}>
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const imageUrl = product.images?.[0] || product.image_url || '/placeholder-product.png';
  const isOwnProduct = user?.id === product.seller_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xl">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {product.title}
                </h1>
                <Badge
                  variant="secondary"
                  className={
                    product.status === 'active'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                      : 'bg-gray-100 text-gray-700 dark:bg-gray-900/50 dark:text-gray-300'
                  }
                >
                  {product.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
                {product.price.toLocaleString()}
              </span>
              <span className="text-muted-foreground">ETB</span>
            </div>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {product.description}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              {product.inventory_quantity !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">In Stock</p>
                        <p className="text-2xl font-bold">{product.inventory_quantity}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              {product.views !== undefined && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Views</p>
                        <p className="text-2xl font-bold">{product.views}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {!isOwnProduct && product.status === 'active' && (
                <>
                  <Button
                    onClick={handleContactSeller}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-lg py-6"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full text-lg py-6">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Make Offer
                  </Button>
                </>
              )}
              {isOwnProduct && (
                <Link href={ROUTES.SELLER_PRODUCT_EDIT(product.id)}>
                  <Button variant="outline" className="w-full">
                    Edit Product
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
