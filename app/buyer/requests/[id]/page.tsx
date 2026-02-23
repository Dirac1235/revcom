import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { 
  ChevronLeft, 
  MapPin, 
  Calendar, 
  Layers, 
  Banknote, 
  MessageSquare, 
  Star, 
  Clock,
  ExternalLink
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { getProfileById } from "@/lib/data/profiles-server";
import { getRequestById } from "@/lib/data/requests-server";
import { getOffersByRequestWithSellers } from "@/lib/data/offers-server";
import { OfferActions } from "@/components/offer-actions";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const [profile, request, offers] = await Promise.all([
    getProfileById(user.id),
    getRequestById(id),
    getOffersByRequestWithSellers(id),
  ]);

  if (!request) notFound();
  
  const isOwner = request.buyer_id === user.id;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background">
      <main className="max-w-6xl mx-auto px-4 py-6 lg:py-10">
        
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-4">
            <Link 
              href="/buyer/requests" 
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to My Requests
            </Link>
            <h1 className="text-3xl font-bold tracking-tight pl-1">{request.title}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-medium">
                {request.category}
              </Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                Posted {new Date(request.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Badge className={`px-3 py-1 text-sm capitalize ${
                request.status === "open" ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" :
                "bg-slate-100 text-slate-600 border-slate-200"
              }`} variant="outline">
                {request.status}
              </Badge>
              {isOwner && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/buyer/requests/${id}/edit`}>Edit Request</Link>
                </Button>
              )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Offers */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold">
              Sellers' Offers 
              <span className="ml-2 text-sm font-normal text-muted-foreground">({offers.length})</span>
            </h2>

            {offers.length > 0 ? (
              <div className="grid gap-4">
                {offers.map((offer: any) => (
                  <OfferCard 
                    key={offer.id} 
                    offer={offer} 
                    isOwner={isOwner} 
                    requestId={id} 
                    requestStatus={request.status}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed shadow-none bg-transparent">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                  <h3 className="font-medium text-lg">No offers yet</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">
                    Once sellers review your request, their proposals will appear here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar: Request Summary */}
          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <SummaryItem icon={<Banknote className="w-4 h-4" />} label="Budget">
                    {request.budget_min?.toLocaleString()} - {request.budget_max?.toLocaleString()} ETB
                  </SummaryItem>
                  <SummaryItem icon={<Layers className="w-4 h-4" />} label="Quantity">
                    {request.quantity ?? "Not specified"}
                  </SummaryItem>
                  <SummaryItem icon={<Calendar className="w-4 h-4" />} label="Deadline">
                    {request.deadline ? new Date(request.deadline).toLocaleDateString() : "Flexible"}
                  </SummaryItem>
                  <SummaryItem icon={<MapPin className="w-4 h-4" />} label="Location">
                    {request.delivery_location || "Remote/Digital"}
                  </SummaryItem>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">Description</p>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryItem({ icon, label, children }: { icon: React.ReactNode, label: string, children: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-muted-foreground flex items-center gap-2 shrink-0">
        {icon} {label}
      </span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

function OfferCard({ offer, isOwner, requestId, requestStatus }: any) {
  const isAccepted = offer.status === "accepted";

  return (
    <Card className={`transition-all overflow-hidden ${isAccepted ? "border-emerald-500 ring-1 ring-emerald-500/20 shadow-md" : "hover:border-slate-300 shadow-sm"}`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row items-stretch">
          
          {/* Left Side: Seller Info & Proposal */}
          <div className="flex-1 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={offer.seller?.avatar_url} />
                <AvatarFallback className="bg-primary/5 text-primary font-bold">
                  {offer.seller?.first_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-base leading-none">
                    {offer.seller?.first_name} {offer.seller?.last_name}
                  </h4>
                  {isAccepted && (
                    <Badge className="bg-emerald-500 text-white border-none h-5 px-1.5 text-[10px] uppercase">
                      Selected
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <div className="flex items-center text-amber-500 font-medium">
                    <Star className="w-3 h-3 fill-current mr-0.5" />
                    {offer.seller?.rating || "New"}
                  </div>
                  <span>•</span>
                  <span>{offer.seller?.total_reviews || 0} reviews</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
              <p className="text-sm leading-relaxed whitespace-pre-wrap italic text-slate-700 dark:text-slate-300">
                "{offer.description}"
              </p>
            </div>

            <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Delivery: <span className="text-foreground font-medium">{offer.delivery_timeline}</span></span>
              </div>
              {offer.payment_terms && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span className="capitalize">{offer.payment_terms.replace(/_/g, " ")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Pricing & Actions */}
          <div className="md:w-72 flex flex-col justify-between items-stretch p-6 bg-slate-50/50 dark:bg-slate-900/20 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800">
            <div className="text-right mb-6 md:mb-0">
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Total Offer</p>
              <p className="text-3xl font-black text-primary tracking-tight">
                {offer.price?.toLocaleString()} 
                <span className="text-sm font-normal text-muted-foreground ml-1 font-sans">ETB</span>
              </p>
              {offer.delivery_cost > 0 && (
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  + {offer.delivery_cost} ETB delivery
                </p>
              )}
            </div>

            <div className="space-y-2">
              {requestStatus === "open" && isOwner && (
                <div className="flex flex-col gap-2">
                  {/* OfferActions now has space to render Accept/Reject stacked or side-by-side */}
                  <OfferActions 
                    offer={offer} 
                    requestId={requestId}
                    requestStatus={requestStatus}
                  />
                  <Button variant="outline" size="sm" className="w-full shadow-sm" asChild>
                    <Link href={`/messages?conversation=&request_id=${requestId}&to=${offer.seller_id}`}>
                      <MessageSquare className="w-3.5 h-3.5 mr-2" />
                      Chat with Seller
                    </Link>
                  </Button>
                </div>
              )}
              
              <Button variant="ghost" size="sm" className="w-full text-xs hover:bg-slate-200/50" asChild>
                 <Link href={`/sellers/${offer.seller_id}`}>
                    Seller Profile <ExternalLink className="w-3 h-3 ml-1" />
                 </Link>
              </Button>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}