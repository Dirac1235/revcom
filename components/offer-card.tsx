"use client"
import {
  CheckCircle,
  MessageSquare,
  Star,
  ThumbsDown,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Info,
  ChevronRight,
  ArrowDownUp,
  FilterX,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useMemo, useState } from "react";

// --- Types ---
interface UserProfile {
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  rating?: number | string;
  total_reviews?: number;
}

interface Offer {
  id: string;
  seller_id: string;
  status: "pending" | "accepted" | "rejected";
  price: number;
  message?: string;
  profiles?: UserProfile;
}

interface RequestDetail {
  budget_min: number;
  budget_max: number;
}

interface OfferCardProps {
  offersCount: number;
  averageOfferPrice: number | null;
  offersWithProfiles: Offer[];
  user: { id: string } | null;
  isBuyer: boolean;
  id: string;
  request: RequestDetail;
}

export default function OfferCard({
  offersCount,
  averageOfferPrice,
  offersWithProfiles,
  user,
  isBuyer,
  id,
  request,
}: any) {
  const [filter, setFilter] = useState<"all" | "pending" | "budget">("all");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rating">("price_asc");

  // --- Filtering & Sorting Logic ---
  const filteredOffers = useMemo(() => {
    let result = [...offersWithProfiles];

    // Apply Filters
    if (filter === "pending") result = result.filter(o => o.status === "pending");
    if (filter === "budget") result = result.filter(o => o.price <= request.budget_max);

    // Apply Sorting
    result.sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      if (sortBy === "rating") return (b.profiles?.rating || 0) - (a.profiles?.rating || 0);
      return 0;
    });

    return result;
  }, [offersWithProfiles, filter, sortBy, request.budget_max]);

  if (!offersCount || offersCount === 0) return null;

  return (
    <div className="mt-10 animate-fadeIn">
      {/* 1. Header & Avg Info */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-lg font-bold tracking-tight">
            {isBuyer ? "Offers Received" : "Active Offers"}
          </h2>
          <p className="text-xs text-muted-foreground">{offersCount} total submissions</p>
        </div>
        {averageOfferPrice && (
          <div className="text-right pb-1">
            <span className="text-[10px] uppercase text-muted-foreground font-bold mr-2">Avg.</span>
            <span className="text-sm font-bold">{averageOfferPrice } ETB</span>
          </div>
        )}
      </div>

      {/* 2. Compact Filter Ribbon */}
      <div className="flex items-center justify-between mb-4 py-2 border-y border-border/40">
        <div className="flex items-center gap-1">
          <Button 
            variant={filter === "all" ? "default" : "ghost"} 
            size="sm" className="h-7 text-[11px] px-2.5 rounded-full"
            onClick={() => setFilter("all")}
          >
            All
          </Button>
          <Button 
            variant={filter === "pending" ? "default" : "ghost"} 
            size="sm" className="h-7 text-[11px] px-2.5 rounded-full"
            onClick={() => setFilter("pending")}
          >
            Pending
          </Button>
          <Button 
            variant={filter === "budget" ? "default" : "ghost"} 
            size="sm" className="h-7 text-[11px] px-2.5 rounded-full"
            onClick={() => setFilter("budget")}
          >
            Within Budget
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1.5 font-medium">
              <ArrowDownUp className="w-3 h-3" />
              Sort
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={() => setSortBy("price_asc")}>Price: Low to High</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("price_desc")}>Price: High to Low</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortBy("rating")}>Top Rated Sellers</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3. Offer List */}
      <div className="grid gap-2">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer: Offer) => (
            <SingleOfferCard 
              key={offer.id}
              offer={offer} 
              averageOfferPrice={averageOfferPrice}
              user={user} 
              isBuyer={isBuyer} 
              requestId={id} 
              request={request} 
            />
          ))
        ) : (
          <div className="py-10 text-center border-2 border-dashed rounded-xl">
            <FilterX className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No offers match your filters.</p>
            <Button variant="link" size="sm" onClick={() => setFilter("all")}>Clear filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SingleOfferCard({
  offer,
  averageOfferPrice,
  user,
  isBuyer,
  requestId,
  request,
}: {
  offer: Offer;
  averageOfferPrice: number | null;
  user: { id: string } | null;
  isBuyer: boolean;
  requestId: string;
  request: RequestDetail;
}) {
  const userHasSubmittedOffer = user?.id === offer.seller_id;
  const isAccepted = offer.status === "accepted";
  const isRejected = offer.status === "rejected";
  const isPending = offer.status === "pending";

  const variance = averageOfferPrice
    ? Math.round(((offer.price - averageOfferPrice) / averageOfferPrice) * 100)
    : null;

  const withinBudget =
    offer.price >= request.budget_min && offer.price <= request.budget_max;
  const sellerName =
    `${offer.profiles?.first_name ?? ""} ${offer.profiles?.last_name ?? ""}`.trim() ||
    "Anonymous";

  return (
    <Card
      className={`group relative overflow-hidden border-border/50 transition-all duration-300 hover:border-primary/30 hover:shadow-md ${isRejected ? "opacity-60 grayscale-[0.3]" : ""}`}
    >
      {/* Visual Status Indicator (Left Edge) */}
      {isAccepted && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
      )}
      {userHasSubmittedOffer && !isAccepted && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/40" />
      )}

      <CardContent className="p-0">
        <div className="flex flex-col">
          {/* TOP SECTION: User and Price */}
          <div className="flex items-start justify-between p-4 pb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10 border border-border/40 shadow-sm transition-transform group-hover:scale-105">
                  <AvatarImage src={offer.profiles?.avatar_url} />
                  <AvatarFallback className="text-[10px] bg-secondary font-bold">
                    {offer.profiles?.first_name?.[0]}
                    {offer.profiles?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                {isAccepted && (
                  <div className="absolute -right-1 -top-1 bg-primary rounded-full p-0.5 border-2 border-background shadow-sm">
                    <CheckCircle className="w-2.5 h-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground leading-none">
                    {sellerName}
                  </h4>
                  {userHasSubmittedOffer && (
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                      My Offer
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[11px] font-bold ml-0.5 text-foreground">
                      {offer.profiles?.rating ?? "—"}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground/60">
                    • {offer.profiles?.total_reviews ?? 0} reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-baseline gap-1 bg-secondary/40 px-2.5 py-1 rounded-lg border border-border/10 ">
                <span className="text-lg font-black text-foreground tracking-tight">
                  {offer.price}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {" "}
                  ETB
                </span>
              </div>
              {variance !== null && (
                <div
                  className={`flex items-center justify-end gap-0.5 mt-1 text-[10px] font-bold ${variance <= 0 ? "text-emerald-600" : "text-amber-600"}`}
                >
                  {variance <= 0 ? (
                    <TrendingDown className="w-3 h-3" />
                  ) : (
                    <TrendingUp className="w-3 h-3" />
                  )}
                  {Math.abs(variance)}% {variance <= 0 ? "below" : "above"} avg
                </div>
              )}
            </div>
          </div>

          {/* MIDDLE SECTION: The Note (If exists) */}
          {offer.message && (
            <div className="px-4 pb-4">
              <div className="bg-secondary/20 rounded-lg p-3 border border-border/5 relative">
                <p className="text-[13px] text-foreground/80 leading-relaxed italic line-clamp-2 group-hover:line-clamp-none transition-all">
                  "{offer.message}"
                </p>
              </div>
            </div>
          )}

          {/* BOTTOM SECTION: Budget Status & Actions */}
          <div className="flex items-center justify-between px-4 py-3 bg-secondary/5 border-t border-border/40">
            <div className="flex flex-wrap gap-2">
              {withinBudget ? (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  Budget Match
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 uppercase tracking-tighter bg-red-50 px-2 py-1 rounded-md border border-red-100">
                  <Info className="w-3 h-3" />
                  Out of Budget
                </div>
              )}

              {!isPending && (
                <div
                  className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md border ${
                    isAccepted
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-red-50 text-red-700 border-red-100"
                  }`}
                >
                  {isAccepted ? "Accepted" : "Declined"}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isBuyer && isPending ? (
                <div className="flex items-center gap-1.5">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 text-[11px] font-bold"
                  >
                    <Link
                      href={`/requests/${requestId}/offers/${offer.id}/reject`}
                    >
                      Decline
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="h-8 bg-primary hover:bg-primary/90 text-white px-4 text-[11px] font-bold rounded-lg shadow-sm"
                  >
                    <Link
                      href={`/buyer/requests/${requestId}/`}
                    >
                      Accept <ChevronRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-[11px] font-bold rounded-lg border-border/60 hover:bg-secondary"
                >
                  <Link
                    href={`/buyer/requests/${requestId}/`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    {isAccepted ? "Message Seller" : "Contact"}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
