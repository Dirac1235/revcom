"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { updateProfile } from "@/lib/data/profiles";
import { getBuyerOrders, getSellerOrders } from "@/lib/data/orders";
import { getReviewsByBuyerId } from "@/lib/data/reviews";
import { useProducts } from "@/lib/hooks/useProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Phone,
  User,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import type { Order, ReviewWithDetails } from "@/lib/types";

// ─── Floating-label field wrapper ───────────────────────────────────────────
function FloatingField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group">
      <label
        htmlFor={id}
        className="absolute -top-2 left-3 z-10 bg-background px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 transition-colors group-focus-within:text-foreground pointer-events-none"
      >
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, profile: authProfile, refreshProfile } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
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
      setPhoneNumber(authProfile.phone_number || "");
    }
  }, [authProfile]);

  useEffect(() => {
    if (!user) return;
    setActivityLoading(true);
    const fetches: Promise<void>[] = [
      getBuyerOrders(user.id).then(setOrders).catch(() => setOrders([])),
      getReviewsByBuyerId(user.id).then(setReviews).catch(() => setReviews([])),
    ];
    if (isSeller) {
      fetches.push(
        getSellerOrders(user.id).then(setSellerOrders).catch(() => setSellerOrders([])),
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
        bio,
        phone_number: phoneNumber.trim() || undefined,
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

  if (!user) return null;

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

  const sellerPending = sellerOrders.filter((o) => o.status === "pending").length;
  const sellerDelivered = sellerOrders.filter((o) => o.status === "delivered").length;
  const totalEarned = sellerOrders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + o.agreed_price * o.quantity, 0);
  const totalViews = productsLoading
    ? 0
    : products.reduce((sum, p) => sum + (p.views || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Profile Header ─────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-7 mb-12 pb-10 border-b border-border">
          <div className="w-[72px] h-[72px] sm:w-20 sm:h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {authProfile?.avatar_url ? (
              <img src={authProfile.avatar_url} alt={displayName || "Profile"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl sm:text-2xl font-bold text-primary">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {displayName || "Your Profile"}
              </h1>
              <Badge variant="secondary" className="capitalize text-xs px-2 py-0.5">
                {authProfile?.user_type === "both" ? "Buyer & Seller" : authProfile?.user_type || "User"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{authProfile?.email || user.email}</p>
            {authProfile?.created_at && (
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                Member for {formatDistanceToNow(new Date(authProfile.created_at))}
              </p>
            )}
            <div className="mt-3.5">
              <Link href={ROUTES.PUBLIC_PROFILE(user.id)}>
                <Button variant="outline" size="sm" className="text-xs h-8 px-3 border-border hover:bg-secondary/20">
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  View Public Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* ── Main Grid ──────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-10 items-start">

          {/* ════════════════════════════════════════
              LEFT COLUMN
          ════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-12">

            {/* ── Personal Information ── */}
            <section>
              {/* Section label */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-foreground leading-none">
                    Personal Information
                  </h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Update your profile details
                  </p>
                </div>
              </div>

              <form onSubmit={handleSave} className="space-y-5">

                {/* Email read-only banner */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">
                    Email
                  </span>
                  <span className="text-sm text-foreground/50 font-medium truncate flex-1">
                    {authProfile?.email || user.email || ""}
                  </span>
                  <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium shrink-0">
                    read-only
                  </span>
                </div>

                {/* Name row */}
                <div className="grid grid-cols-2 gap-4">
                  <FloatingField id="first-name" label="First Name">
                    <Input
                      id="first-name"
                      placeholder="Jane"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={saving}
                      className="h-11 text-sm rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35"
                    />
                  </FloatingField>
                  <FloatingField id="last-name" label="Last Name">
                    <Input
                      id="last-name"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={saving}
                      className="h-11 text-sm rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35"
                    />
                  </FloatingField>
                </div>

                {/* Phone */}
                <FloatingField id="phone" label="Phone Number">
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 pointer-events-none" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+251 912 345 678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={saving}
                      className="h-11 text-sm rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35 pl-10"
                    />
                  </div>
                </FloatingField>

                {/* Bio */}
                <FloatingField id="bio" label="Bio">
                  <Textarea
                    id="bio"
                    placeholder="A few words about yourself…"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={saving}
                    className="min-h-[110px] text-sm rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35 resize-none pt-4"
                  />
                </FloatingField>

                {error && (
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                )}

                {/* Submit row */}
                <div className="flex items-center gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="h-10 px-6 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/80 rounded-xl shadow-none"
                  >
                    {saving ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Saving…</>
                    ) : saved ? (
                      <><CheckCircle2 className="w-3.5 h-3.5 mr-2" />Saved!</>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                  {saved && (
                    <span className="text-xs text-emerald-600 font-medium">
                      Profile updated successfully
                    </span>
                  )}
                </div>
              </form>
            </section>

            {/* ── Activity Sections ── */}
            {activityLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[72px] rounded-xl" />
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-12">

                {/* Buying Activity */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Buying Activity</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Orders", value: orders.length },
                      { label: "Pending", value: pendingOrders },
                      { label: "Active", value: activeOrders },
                      { label: "Delivered", value: deliveredOrders },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                        <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Total spent:{" "}
                      <span className="font-semibold text-foreground">{totalSpent.toLocaleString()} ETB</span>
                    </p>
                    <Link href={ROUTES.BUYER_ORDERS}>
                      <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary h-auto p-0 gap-1">
                        View Orders <ArrowUpRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                </section>

                {/* Reviews Written */}
                <section>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Reviews Written</h3>
                  {reviews.length > 0 ? (
                    <div className="space-y-2.5">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="flex items-start gap-3 p-3.5 rounded-xl bg-secondary/20 border border-border/40">
                          <div className="flex items-center gap-0.5 shrink-0 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 fill-transparent"}`} />
                            ))}
                          </div>
                          <div className="flex-1 min-w-0">
                            {review.product && (
                              <Link href={ROUTES.PRODUCT_DETAIL(review.product_id)} className="text-sm font-semibold text-foreground hover:underline line-clamp-1">
                                {review.product.title}
                              </Link>
                            )}
                            {review.comment && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{review.comment}</p>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <div className="pt-0.5">
                          <Link href={ROUTES.BUYER_REVIEWS}>
                            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary h-auto p-0 gap-1">
                              View all {reviews.length} reviews <ArrowUpRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground px-4 py-3.5 rounded-xl bg-secondary/20 border border-border/40">
                      You haven&apos;t written any reviews yet.
                    </p>
                  )}
                </section>

                {/* Selling Activity */}
                {isSeller && (
                  <section>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Selling Activity</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Products", value: productsLoading ? "–" : products.length },
                        { label: "To Fulfill", value: sellerPending },
                        { label: "Completed", value: sellerDelivered },
                        { label: "Views", value: totalViews },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-4 rounded-xl bg-secondary/20 border border-border/40">
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">{label}</p>
                          <p className="text-2xl font-bold text-foreground leading-none">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Total earned:{" "}
                        <span className="font-semibold text-foreground">{totalEarned.toLocaleString()} ETB</span>
                      </p>
                      <Link href={ROUTES.SELLER_PRODUCTS}>
                        <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary h-auto p-0 gap-1">
                          Manage Products <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════
              RIGHT SIDEBAR — redesigned
          ════════════════════════════════════════ */}
          <div className="space-y-3">

            {/* Rating + Reviews — single unified card */}
            <div className="rounded-2xl border border-border/60 overflow-hidden divide-y divide-border/40">

              {/* Rating row */}
              <div className="px-5 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200/80 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-foreground leading-none tracking-tight">
                      {Number(authProfile?.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-sm text-muted-foreground font-medium">/ 5</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest font-semibold">
                    Overall Rating
                  </p>
                  {/* Star visual */}
                  <div className="flex items-center gap-0.5 mt-1.5">
                    {[...Array(5)].map((_, i) => {
                      const r = Number(authProfile?.rating || 0);
                      return (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.round(r) ? "fill-amber-400 text-amber-400" : "fill-transparent text-muted-foreground/20"}`}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Review count row */}
              <div className="px-5 py-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5 text-primary/70" />
                </div>
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-foreground leading-none tracking-tight">
                      {authProfile?.total_reviews || 0}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-widest font-semibold">
                    Reviews Received
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-2xl border border-border/60 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border/40">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Quick Links
                </p>
              </div>
              <div className="p-2">
                {[
                  { href: ROUTES.BUYER_ORDERS, icon: ShoppingCart, label: "My Orders" },
                  { href: ROUTES.BUYER_REVIEWS, icon: Star, label: "My Reviews" },
                  { href: ROUTES.MESSAGES, icon: MessageSquare, label: "Messages" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={label}
                    href={href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors group"
                  >
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                  </Link>
                ))}

                {isSeller && (
                  <>
                    <div className="h-px bg-border/40 mx-3 my-1" />
                    {[
                      { href: ROUTES.SELLER_PRODUCTS, icon: Package, label: "My Products" },
                      { href: ROUTES.SELLER_ORDERS, icon: Truck, label: "Seller Orders" },
                    ].map(({ href, icon: Icon, label }) => (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-secondary/30 transition-colors group"
                      >
                        <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="flex-1 text-sm font-medium text-foreground">{label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />
                      </Link>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}