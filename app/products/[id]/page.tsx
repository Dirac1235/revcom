"use client";

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/lib/hooks/useProducts';
import { useAuth } from '@/components/providers/AuthProvider';
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
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="space-y-8">
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
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif font-bold text-destructive mb-4">Product not found</h2>
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
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link href={ROUTES.PRODUCTS}>
          <Button variant="ghost" className="mb-8 text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-8">
          {/* Product Image */}
          <div className="aspect-square rounded-lg overflow-hidden bg-secondary/20 border border-border">
            <img
              src={imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-4xl font-serif font-bold text-foreground">
                  {product.title}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border border-border ${
                  product.status === 'active'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {product.status}
                </span>
              </div>
              <p className="text-lg text-muted-foreground">{product.category}</p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-serif font-bold text-foreground">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xl text-muted-foreground font-medium">ETB</span>
            </div>

            <div className="border-t border-b border-border py-8">
              <h3 className="font-serif font-bold text-lg mb-4 text-foreground">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {product.inventory_quantity !== undefined && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">In Stock</p>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">{product.inventory_quantity}</p>
                </div>
              )}
              {product.views !== undefined && (
                <div className="p-4 rounded-lg border border-border bg-card">
                  <div className="flex items-center gap-3 mb-2">
                    <Eye className="w-5 h-5 text-muted-foreground" />
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Views</p>
                  </div>
                  <p className="text-2xl font-serif font-bold text-foreground">{product.views}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-4 pt-4">
              {!isOwnProduct && product.status === 'active' && (
                <>
                  <Button
                    onClick={handleContactSeller}
                    className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none h-12 text-lg"
                  >
                    <MessageSquare className="w-5 h-5 mr-2" />
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full h-12 text-lg border-border hover:bg-secondary hover:text-secondary-foreground">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Make Offer
                  </Button>
                </>
              )}
              {isOwnProduct && (
                <Link href={ROUTES.SELLER_PRODUCT_EDIT(product.id)}>
                  <Button variant="outline" className="w-full h-12 border-border hover:bg-secondary hover:text-secondary-foreground">
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
