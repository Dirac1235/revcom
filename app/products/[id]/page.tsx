"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useProduct } from "@/lib/hooks/useProducts";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { updateListing } from "@/lib/data/listings";
import { createConversation } from "@/lib/data/conversations";
import { getProfileById } from "@/lib/data/profiles";
import { useToast } from "@/lib/hooks/use-toast";
import { ProductReviews } from "@/components/reviews/ProductReviews";
import { ProductQA } from "@/components/comments/ProductQA";
import type { Profile } from "@/lib/types";
import {
  Package,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  Eye,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Lock,
  Shield,
  MapPin,
  Star,
  CheckCircle,
  Clock,
  Heart,
  Share2,
  Truck,
  Phone,
} from "lucide-react";

interface InventoryStatus {
  status: "in_stock" | "low_stock" | "out_of_stock";
  quantity: number;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const productId = params.id as string;

  const { product, loading, error } = useProduct(productId);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Fetch seller profile
  useEffect(() => {
    if (product?.seller_id) {
      getProfileById(product.seller_id).then(setSeller).catch(console.error);
    }
  }, [product?.seller_id]);

  // Increment view count
  useEffect(() => {
    if (product) {
      const incrementViews = async () => {
        await updateListing(productId, { views: (product.views || 0) + 1 });
      };
      incrementViews();
    }
  }, [product, productId]);

  // Determine inventory status
  const getInventoryStatus = (): InventoryStatus => {
    const qty = product?.inventory_quantity || 0;

    if (qty === 0) {
      return { status: "out_of_stock", quantity: 0 };
    }
    if (qty <= 5) {
      return { status: "low_stock", quantity: qty };
    }
    return { status: "in_stock", quantity: qty };
  };

  const inventoryStatus = product
    ? getInventoryStatus()
    : { status: "in_stock", quantity: 0 };

  const getStatusBadge = () => {
    const badgeConfig: Record<string, { color: string; label: string }> = {
      in_stock: {
        color: "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm",
        label: `${inventoryStatus.quantity} units available`,
      },
      low_stock: {
        color: "bg-amber-50 text-amber-700 border-amber-200 shadow-sm",
        label: `Low stock (${inventoryStatus.quantity} left)`,
      },
      out_of_stock: {
        color: "bg-red-50 text-red-700 border-red-200 shadow-sm",
        label: "Out of stock",
      },
    };
    return badgeConfig[inventoryStatus.status];
  };

  const handleContactSeller = async () => {
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!product) return;

    setIsCreatingConversation(true);
    try {
      const newConversation = await createConversation(
        user.id,
        product.seller_id,
        product.id,
      );
      router.push(ROUTES.MESSAGE_CONVERSATION(newConversation.id));
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handlePlaceOrder = () => {
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }
    router.push(`/checkout?product_id=${productId}&quantity=${quantity}`);
  };

  const isOwnProduct = user?.id === product?.seller_id;
  const canOrder =
    !isOwnProduct &&
    product?.status === "active" &&
    inventoryStatus.status !== "out_of_stock";

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Product not found
            </h2>
            <p className="text-muted-foreground mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link href={ROUTES.PRODUCTS}>
              <Button className="bg-primary hover:bg-primary/90">
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image_url || "/placeholder-product.png"];

  const selectedImage = images[selectedImageIndex];
  const statusBadge = getStatusBadge();
  const totalPrice = product.price * quantity;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation */}
        <div
          className="mb-8 flex items-center justify-between animate-fadeIn"
          style={{ animationDelay: "0.05s" }}
        >
          <Link href={ROUTES.PRODUCTS}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent transition-colors duration-300 text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 rounded-lg border border-border hover:bg-secondary/20 transition-all duration-300"
            >
              <Heart
                className={`w-4 h-4 transition-colors ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
              />
            </button>
            <button className="p-2 rounded-lg border border-border hover:bg-secondary/20 transition-all duration-300">
              <Share2 className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* LEFT COLUMN (60%) - Product Details */}
          <div className="md:col-span-2 space-y-6 lg:space-y-8">
            {/* Image Gallery */}
            <div
              className="space-y-3 animate-fadeIn"
              style={{ animationDelay: "0.1s" }}
            >
              {/* Main Image */}
              <div className="aspect-square rounded-xl overflow-hidden bg-linear-to-br from-secondary/20 to-secondary/5 border border-border relative group shadow-md hover:shadow-lg transition-shadow duration-500">
                <img
                  src={selectedImage}
                  alt={product.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Image Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          (i) => (i - 1 + images.length) % images.length,
                        )
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background border border-border/50 text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex((i) => (i + 1) % images.length)
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/70 backdrop-blur-sm hover:bg-background border border-border/50 text-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 left-3 bg-background/70 backdrop-blur-sm border border-border/50 px-2.5 py-1 rounded-full text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 snap-center ${
                        idx === selectedImageIndex
                          ? "border-primary ring-2 ring-primary/20 shadow-sm"
                          : "border-border hover:border-primary/50 hover:shadow-sm"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.title} thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Information */}
            <div
              className="space-y-5 animate-fadeIn"
              style={{ animationDelay: "0.15s" }}
            >
              <div>
                <div className="inline-block mb-3 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">
                    {product.category}
                  </p>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-foreground mb-3 leading-tight">
                  {product.title}
                </h1>
              </div>

              {/* Price & Inventory */}
              <div className="space-y-3 py-4 border-y border-border/30">
                <div className="flex items-end gap-2">
                  <span className="text-4xl sm:text-5xl font-bold text-foreground">
                    {product.price.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-lg text-muted-foreground font-medium pb-1">
                    ETB
                  </span>
                </div>
                <Badge
                  className={`${statusBadge.color} border px-3 py-1.5 text-xs font-semibold rounded-full w-fit`}
                >
                  {statusBadge.label}
                </Badge>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                    In Stock
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {product.inventory_quantity}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-secondary/20 border border-border/30 backdrop-blur-sm">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1.5">
                    Views
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {product.views || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div
              className="space-y-4 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="border-l-4 border-primary pl-4 py-4">
                <h3 className="text-base font-semibold text-foreground mb-3">
                  About this product
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Specifications */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div
                  className="space-y-4 animate-fadeIn"
                  style={{ animationDelay: "0.25s" }}
                >
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-4">
                      Specifications
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {Object.entries(product.specifications).map(
                        ([key, value], idx) => (
                          <div
                            key={key}
                            className="p-3.5 rounded-lg bg-secondary/20 border border-border/30 backdrop-blur-sm hover:border-border/50 transition-all duration-300"
                            style={{ animationDelay: `${0.3 + idx * 0.05}s` }}
                          >
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                              {key.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                              {String(value)}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* RIGHT COLUMN (40%) - Sticky Sidebar */}
          <div className="space-y-5 lg:space-y-6 md:sticky md:top-6 md:h-fit">
            {/* Seller Card */}
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 hover:border-border/50 transition-all duration-300 shadow-sm hover:shadow-md animate-fadeIn"
              style={{ animationDelay: "0.15s" }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                Seller Info
              </h3>

              <div className="flex items-start gap-3 mb-4">
                {seller?.avatar_url ? (
                  <img
                    src={seller.avatar_url}
                    alt={`${seller.first_name} ${seller.last_name}`}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/20 shadow-sm"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shadow-sm">
                    <span className="text-sm font-bold text-primary">
                      {seller?.first_name?.charAt(0) || "S"}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm truncate">
                    <Link href={`/users/${product.seller_id}`} className="hover:underline">
                      {seller
                        ? `${seller.first_name} ${seller.last_name}`
                        : "Seller"}
                    </Link>
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="font-semibold text-foreground text-xs">
                        {seller?.rating || "N/A"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({seller?.total_reviews || 0})
                    </span>
                  </div>
                  {seller?.user_type && (
                    <div className="flex items-center gap-1 mt-2 text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold capitalize">
                        {seller.user_type.replace("_", " ")}
                      </span>
                    </div>
                  )}
                  {user && seller?.phone_number && (
                    <div className="flex items-center gap-1 mt-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{seller.phone_number}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Panel */}
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">
                  Quantity
                </label>
                {canOrder && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border-2 border-border/30 rounded-lg p-1.5 bg-secondary/20 backdrop-blur-sm">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-1.5 hover:bg-secondary rounded transition-colors duration-200 text-foreground font-bold text-sm"
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-10 text-center font-bold text-sm text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            Math.min(inventoryStatus.quantity, quantity + 1),
                          )
                        }
                        disabled={quantity >= inventoryStatus.quantity}
                        className="p-1.5 hover:bg-secondary rounded transition-colors duration-200 text-foreground font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      Max: {inventoryStatus.quantity}
                    </span>
                  </div>
                )}
              </div>

              {/* Total Price */}
              <div className="py-3.5 border-t border-b border-border/30">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">
                  Total
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-foreground">
                    {totalPrice.toLocaleString("en-US", {
                      minimumFractionDigits: 0,
                    })}
                  </span>
                  <span className="text-sm text-muted-foreground font-medium">
                    ETB
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {!isOwnProduct && product.status === "active" ? (
                  <>
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={
                        inventoryStatus.status === "out_of_stock" ||
                        isCreatingConversation
                      }
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg h-10 text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                    >
                      <ShoppingCart className="w-4 h-4 mr-1.5" />
                      {inventoryStatus.status === "out_of_stock"
                        ? "Out of Stock"
                        : "Place Order"}
                    </Button>
                    <Button
                      onClick={handleContactSeller}
                      disabled={isCreatingConversation}
                      variant="outline"
                      className="w-full border-2 border-border/30 hover:border-primary/30 hover:bg-secondary/20 text-foreground h-10 text-sm font-semibold rounded-lg transition-all duration-300"
                    >
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      {isCreatingConversation ? "Opening..." : "Message"}
                    </Button>
                  </>
                ) : isOwnProduct ? (
                  <Link
                    href={ROUTES.SELLER_PRODUCT_EDIT(product.id)}
                    className="w-full"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-2 border-border/30 hover:border-primary/30 hover:bg-secondary/20 text-foreground h-10 text-sm font-semibold rounded-lg transition-all duration-300"
                    >
                      Edit Product
                    </Button>
                  </Link>
                ) : (
                  <Button
                    disabled
                    className="w-full h-10 rounded-lg opacity-50"
                  >
                    Not Available
                  </Button>
                )}
              </div>
            </div>

            {/* Delivery Info */}
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-3 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: "0.25s" }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Shipping
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/20 backdrop-blur-sm">
                  <Truck className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                      Delivery
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      3-5 business days
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-secondary/20 backdrop-blur-sm">
                  <DollarSign className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">
                      Cost
                    </p>
                    <p className="text-xs font-semibold text-foreground">
                      Free over 5,000 ETB
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-2.5 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: "0.3s" }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Why Buy Here
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                  <Lock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">
                    Secure messaging
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                  <Shield className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">
                    Buyer protection
                  </span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs text-foreground">
                    Verified seller
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ProductReviews
          productId={productId}
          currentUserId={user?.id}
          averageRating={product.average_rating || 0}
          totalReviews={product.review_count || 0}
        />

        {/* Product Q&A Section */}
        <ProductQA
          productId={productId}
          currentUserId={user?.id}
          sellerId={product.seller_id}
        />
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }

        /* Responsive typography sizes */
        @media (max-width: 640px) {
          h1 {
            font-size: clamp(1.75rem, 5vw, 2.25rem);
          }
        }
      `}</style>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-32 mb-8 rounded-lg" />
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {/* Left column skeleton */}
          <div className="md:col-span-2 space-y-6">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-lg" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3 rounded-lg" />
              <Skeleton className="h-10 w-1/2 rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
          {/* Right column skeleton */}
          <div className="space-y-5">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
