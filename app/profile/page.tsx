"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { updateProfile } from "@/lib/data/profiles";
import { getBuyerOrders, getSellerOrders } from "@/lib/data/orders";
import { getReviewsByBuyerId } from "@/lib/data/reviews";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import {
  Star,
  Loader2,
  CheckCircle2,
  Calendar,
  MessageSquare,
  Package,
  ShoppingCart,
  Truck,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import type { Order, ReviewWithDetails } from "@/lib/types";

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [orders, setOrders] = useState<Order[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);

  const isSeller =
    authProfile?.user_type === "seller" || authProfile?.user_type === "both";

  const { products, loading: productsLoading } = useProducts(
    isSeller && user ? { sellerId: user.id, status: "active" } : {},
  );

  useEffect(() => {
    if (authProfile) {
      setFirstName(authProfile.first_name || "");
      setLastName(authProfile.last_name || "");
      setBio(authProfile.bio || "");
    }
  }, [authProfile]);

  useEffect(() => {
    if (!user) return;
    setActivityLoading(true);

    const fetches: Promise<void>[] = [
      getBuyerOrders(user.id)
        .then(setOrders)
        .catch(() => setOrders([])),
      getReviewsByBuyerId(user.id)
        .then(setReviews)
        .catch(() => setReviews([])),
    ];

    if (isSeller) {
      fetches.push(
        getSellerOrders(user.id)
          .then(setSellerOrders)
          .catch(() => setSellerOrders([])),
      );
    }

    Promise.all(fetches).finally(() => setActivityLoading(false));
  }, [user, isSeller]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSaved(false);

    try {
      await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        bio: bio,
      });

      await refreshProfile();
      setSaved(true);
    } catch (updateError: any) {
      setError(updateError.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
      const timer = setTimeout(() => setSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  };

  if (!user) {
    return null;
  }

  const displayName =
    authProfile?.first_name && authProfile?.last_name
      ? `${authProfile.first_name} ${authProfile.last_name}`
      : null;

  const initials = displayName
    ? `${authProfile!.first_name![0]}${authProfile!.last_name![0]}`.toUpperCase()
    : (user.email?.[0] || "U").toUpperCase();

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const activeOrders = orders.filter(
    (o) => o.status === "accepted" || o.status === "shipped",
  ).length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.agreed_price * o.quantity, 0);

  const sellerPending = sellerOrders.filter(
    (o) => o.status === "pending",
  ).length;
  const sellerDelivered = sellerOrders.filter(
    (o) => o.status === "delivered",
  ).length;
  const totalEarned = sellerOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.agreed_price * o.quantity, 0);
  const totalViews = productsLoading
    ? 0
    : products.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-8 border-b border-border">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {authProfile?.avatar_url ? (
              <img
                src={authProfile.avatar_url}
                alt={displayName || "Profile"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {initials}
              </span>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold text-foreground">
                {displayName || "Your Profile"}
              </h1>
              <Badge variant="secondary" className="capitalize">
                {authProfile?.user_type === "both"
                  ? "Buyer & Seller"
                  : authProfile?.user_type || "User"}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {authProfile?.email || user.email}
            </p>
            {authProfile?.created_at && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Member for{" "}
                {formatDistanceToNow(new Date(authProfile.created_at))}
              </p>
            )}
            <div className="mt-3">
              <Link href={ROUTES.PUBLIC_PROFILE(user.id)}>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-border hover:bg-secondary/20"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View Public Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-border shadow-none rounded-lg">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="text-xl font-medium">
                  Personal Information
                </CardTitle>
                <CardDescription>Update your profile details</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <form onSubmit={handleSave} className="grid gap-6">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={authProfile?.email || user.email || ""}
                      disabled
                      className="bg-secondary/20 border-transparent cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label
                        htmlFor="first-name"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        First Name
                      </Label>
                      <Input
                        id="first-name"
                        placeholder="Your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        disabled={saving}
                        className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label
                        htmlFor="last-name"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Last Name
                      </Label>
                      <Input
                        id="last-name"
                        placeholder="Your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        disabled={saving}
                        className="border-border focus-visible:ring-0 focus-visible:border-foreground"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label
                      htmlFor="bio"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      placeholder="Tell us about yourself"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      disabled={saving}
                      className="min-h-32 border-border focus-visible:ring-0 focus-visible:border-foreground resize-none"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-500 font-medium">{error}</p>
                  )}

                  <Button
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto bg-foreground text-background hover:bg-foreground/90 shadow-none"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : saved ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Saved!
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {activityLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Buying Activity
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Orders
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {orders.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {pendingOrders}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Active
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {activeOrders}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                      <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                        Delivered
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {deliveredOrders}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Total spent:{" "}
                      <span className="font-semibold text-foreground">
                        {totalSpent.toLocaleString()} ETB
                      </span>
                    </p>
                    <Link href={ROUTES.BUYER_ORDERS}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-primary hover:text-primary h-auto p-0"
                      >
                        View Orders
                        <ArrowUpRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">
                    Reviews Written
                  </h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.slice(0, 3).map((review) => (
                        <div
                          key={review.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-secondary/20 border border-border/30"
                        >
                          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 fill-transparent"}`}
                              />
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            {review.product && (
                              <Link
                                href={ROUTES.PRODUCT_DETAIL(
                                  review.product_id,
                                )}
                                className="text-sm font-semibold text-foreground hover:underline line-clamp-1"
                              >
                                {review.product.title}
                              </Link>
                            )}
                            {review.comment && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                {review.comment}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            {formatDistanceToNow(
                              new Date(review.created_at),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <Link href={ROUTES.BUYER_REVIEWS}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary h-auto p-0"
                          >
                            View all {reviews.length} reviews
                            <ArrowUpRight className="w-3 h-3 ml-1" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-3 rounded-lg bg-secondary/20 border border-border/30">
                      You haven&apos;t written any reviews yet.
                    </p>
                  )}
                </div>

                {isSeller && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">
                      Selling Activity
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Products
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {productsLoading ? "–" : products.length}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          To Fulfill
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {sellerPending}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Completed
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {sellerDelivered}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-secondary/20 border border-border/30">
                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
                          Views
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                          {totalViews}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Total earned:{" "}
                        <span className="font-semibold text-foreground">
                          {totalEarned.toLocaleString()} ETB
                        </span>
                      </p>
                      <Link href={ROUTES.SELLER_PRODUCTS}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-primary hover:text-primary h-auto p-0"
                        >
                          Manage Products
                          <ArrowUpRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-border shadow-none rounded-lg">
              <CardContent className="pt-6 px-6 pb-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {Number(authProfile?.rating || 0).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    Overall Rating
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none rounded-lg">
              <CardContent className="pt-6 px-6 pb-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-4xl font-bold text-foreground">
                    {authProfile?.total_reviews || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">
                    Total Reviews
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-none rounded-lg">
              <CardHeader className="pb-3 pt-5 px-5">
                <CardTitle className="text-sm font-semibold">
                  Quick Links
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 space-y-1.5">
                <Link
                  href={ROUTES.BUYER_ORDERS}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors text-sm text-foreground"
                >
                  <ShoppingCart className="w-4 h-4 text-muted-foreground" />
                  My Orders
                  <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                </Link>
                <Link
                  href={ROUTES.BUYER_REVIEWS}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors text-sm text-foreground"
                >
                  <Star className="w-4 h-4 text-muted-foreground" />
                  My Reviews
                  <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                </Link>
                <Link
                  href={ROUTES.MESSAGES}
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors text-sm text-foreground"
                >
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Messages
                  <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                </Link>
                {isSeller && (
                  <>
                    <div className="h-px bg-border/50 my-1" />
                    <Link
                      href={ROUTES.SELLER_PRODUCTS}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors text-sm text-foreground"
                    >
                      <Package className="w-4 h-4 text-muted-foreground" />
                      My Products
                      <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </Link>
                    <Link
                      href={ROUTES.SELLER_ORDERS}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/30 transition-colors text-sm text-foreground"
                    >
                      <Truck className="w-4 h-4 text-muted-foreground" />
                      Seller Orders
                      <ArrowUpRight className="w-3 h-3 ml-auto text-muted-foreground" />
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
