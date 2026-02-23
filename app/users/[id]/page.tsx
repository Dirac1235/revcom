"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { getProfileById } from "@/lib/data/profiles";
import { useProducts } from "@/lib/hooks/useProducts";
import { getReviewsBySellerId } from "@/lib/data/reviews";
import { createConversation } from "@/lib/data/conversations";
import { ProductCard } from "@/components/features/ProductCard";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/lib/constants/routes";
import { useToast } from "@/lib/hooks/use-toast";
import type { Profile, ReviewWithDetails } from "@/lib/types";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Calendar,
  Package,
  ShieldCheck,
  Share2,
  Phone,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const userId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<ReviewWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  const isSeller =
    profile?.user_type === "seller" || profile?.user_type === "both";
  const isOwnProfile = user?.id === userId;

  const { products, loading: productsLoading } = useProducts({
    sellerId: userId,
    status: "active",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfileById(userId);
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    if (!profile) {
      setReviewsLoading(false);
      return;
    }
    if (isSeller) {
      setReviewsLoading(true);
      getReviewsBySellerId(userId)
        .then(setReviews)
        .catch(console.error)
        .finally(() => setReviewsLoading(false));
    } else {
      setReviewsLoading(false);
    }
  }, [profile, userId, isSeller]);

  const handleMessage = async () => {
    if (!user) {
      router.push(ROUTES.LOGIN);
      return;
    }
    setIsCreatingConversation(true);
    try {
      const conversation = await createConversation(user.id, userId);
      router.push(ROUTES.MESSAGE_CONVERSATION(conversation.id));
    } catch {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    } finally {
      setIsCreatingConversation(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center py-16">
            <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
              User not found
            </h2>
            <p className="text-muted-foreground mb-6">
              This user profile doesn&apos;t exist or has been removed.
            </p>
            <Link href={ROUTES.PRODUCTS}>
              <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none">
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const displayName =
    profile.first_name && profile.last_name
      ? `${profile.first_name} ${profile.last_name}`
      : "User";

  const initials =
    profile.first_name && profile.last_name
      ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
      : "U";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <button className="p-2 rounded-lg border border-border hover:bg-secondary/20 transition-all duration-300">
            <Share2 className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-2 space-y-6 lg:space-y-8">
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-6 sm:p-8 shadow-sm animate-fadeIn"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="flex items-start gap-5 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-linear-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-primary">
                      {initials}
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                      {displayName}
                    </h1>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/40 bg-background/70 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground/80"
                    >
                      {profile.user_type === "both"
                        ? "Buyer & Seller"
                        : profile.user_type}
                    </Badge>
                    {isSeller && (
                      <Badge
                        variant="outline"
                        className="rounded-full border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-emerald-700"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>

                  {profile.bio && (
                    <p className="text-foreground/80 text-sm leading-relaxed mb-4 max-w-xl">
                      {profile.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        Member for{" "}
                        {formatDistanceToNow(new Date(profile.created_at))}
                      </span>
                    </div>
                    {user && profile.phone_number && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{profile.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {profile.bio && (
              <div
                className="border-l-4 border-primary pl-4 py-4 animate-fadeIn"
                style={{ animationDelay: "0.15s" }}
              >
                <h3 className="text-base font-semibold text-foreground mb-2">
                  About
                </h3>
                <p className="text-foreground/80 leading-relaxed text-sm whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            )}

            {isSeller && (
              <div
                className="space-y-6 animate-fadeIn"
                style={{ animationDelay: "0.2s" }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4 font-sans">
                    Products
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                    {displayName}&apos;s Shop
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {productsLoading
                      ? "Loading products..."
                      : `${products.length} ${products.length === 1 ? "product" : "products"} listed`}
                  </p>
                </div>

                {productsLoading ? (
                  <LoadingState count={4} type="card" />
                ) : products.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Package}
                    title="No products yet"
                    description={`${displayName} hasn't listed any products yet.`}
                  />
                )}
              </div>
            )}

            {isSeller && (
              <div
                className="space-y-6 animate-fadeIn"
                style={{ animationDelay: "0.25s" }}
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-4 font-sans">
                    Feedback
                  </p>
                  <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                    Buyer Reviews
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {reviewsLoading
                      ? "Loading reviews..."
                      : `${profile.total_reviews || 0} ${(profile.total_reviews || 0) === 1 ? "review" : "reviews"} received`}
                  </p>
                </div>

                {reviewsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full rounded-lg" />
                    ))}
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id}>
                        {review.product && (
                          <Link
                            href={ROUTES.PRODUCT_DETAIL(review.product_id)}
                            className="inline-block mb-2 text-xs font-semibold text-primary hover:underline uppercase tracking-wider"
                          >
                            {review.product.title}
                          </Link>
                        )}
                        <ReviewCard
                          review={review}
                          currentUserId={user?.id}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={MessageSquare}
                    title="No reviews yet"
                    description={`${displayName} hasn't received any reviews yet.`}
                  />
                )}
              </div>
            )}

            {!isSeller && (
              <div
                className="animate-fadeIn"
                style={{ animationDelay: "0.2s" }}
              >
                <EmptyState
                  icon={Package}
                  title="Buyer Account"
                  description={`${displayName} is a buyer on RevCom and doesn't have any listed products.`}
                />
              </div>
            )}
          </div>

          <div className="space-y-5 lg:space-y-6 md:sticky md:top-6 md:h-fit">
            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: "0.15s" }}
            >
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Seller Stats
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-yellow-50 border border-yellow-200 flex items-center justify-center shrink-0">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground leading-none">
                      {Number(profile.rating || 0).toFixed(1)}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      Overall Rating
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 backdrop-blur-sm">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-lg font-bold text-foreground leading-none">
                      {profile.total_reviews || 0}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                      Total Reviews
                    </p>
                  </div>
                </div>

                {isSeller && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20 backdrop-blur-sm">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Package className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-foreground leading-none">
                        {productsLoading ? "–" : products.length}
                      </p>
                      <p className="text-[11px] text-muted-foreground font-medium mt-0.5">
                        Active Products
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-2 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
              style={{ animationDelay: "0.2s" }}
            >
              {isOwnProfile ? (
                <Link href={ROUTES.PROFILE} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full border-2 border-border/30 hover:border-primary/30 hover:bg-secondary/20 text-foreground h-10 text-sm font-semibold rounded-lg transition-all duration-300"
                  >
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    onClick={handleMessage}
                    disabled={isCreatingConversation}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg h-10 text-sm font-semibold rounded-lg transition-all duration-300 disabled:opacity-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-1.5" />
                    {isCreatingConversation ? "Opening..." : "Send Message"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-2 border-border/30 hover:border-primary/30 hover:bg-secondary/20 text-foreground h-10 text-sm font-semibold rounded-lg transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share Profile
                  </Button>
                </>
              )}
            </div>

            {isSeller && (
              <div
                className="rounded-xl border border-border/30 bg-linear-to-br from-background to-secondary/5 backdrop-blur-sm p-4 space-y-2.5 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn"
                style={{ animationDelay: "0.25s" }}
              >
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Why Buy Here
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                    <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground">
                      Verified seller
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                    <Star className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground">
                      {Number(profile.rating || 0).toFixed(1)} seller rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-secondary/10">
                    <MessageSquare className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-xs text-foreground">
                      Secure messaging
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
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
      `}</style>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-xl border border-border/30 p-6 sm:p-8">
              <div className="flex items-start gap-5">
                <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full shrink-0" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-8 w-48" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-full max-w-sm" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </div>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-7 w-56" />
            <LoadingState count={3} type="card" />
          </div>
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
