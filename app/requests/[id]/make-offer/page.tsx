import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getRequestById } from "@/lib/data/requests-server";
import { getProfileById } from "@/lib/data/profiles-server";
import { getOfferBySellerAndRequest } from "@/lib/data/offers-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, MessageSquare, Calendar, MapPin, DollarSign, ChevronDown, ChevronUp, Check, AlertTriangle, Lightbulb } from "lucide-react";
import MakeOfferForm from "./form";

const DELIVERY_TIMELINES = [
  { value: "within_1_week", label: "Within 1 week" },
  { value: "1_2_weeks", label: "1-2 weeks" },
  { value: "2_4_weeks", label: "2-4 weeks" },
  { value: "1_2_months", label: "1-2 months" },
  { value: "custom", label: "Custom" },
];

const PAYMENT_TERMS = [
  { value: "50_upfront_50_delivery", label: "50% upfront, 50% on delivery" },
  { value: "full_on_delivery", label: "Full payment on delivery" },
  { value: "net_30", label: "Net 30 days" },
  { value: "custom", label: "Custom" },
];

export default async function MakeOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: requestId } = await params;
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type === "buyer") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">Only sellers can submit offers.</p>
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const request = await getRequestById(requestId);
  
  if (!request) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Request Not Found</h2>
            <Link href="/seller/explore">
              <Button>Browse Requests</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const buyer = await getProfileById(request.buyer_id);
  const existingOffer = await getOfferBySellerAndRequest(user.id, requestId);

  const budgetMin = request.budget_min || 0;
  const budgetMax = request.budget_max || 0;
  const hasBudgetRange = budgetMin > 0 && budgetMax > 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <Link href={`/buyer/requests/${requestId}`}>
            <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to request
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-4">
            {existingOffer ? "Edit Your Offer" : "Make an Offer"}
          </h1>
          <p className="text-muted-foreground mt-1">Submit your competitive offer for this request</p>
        </div>

        {request.status !== "open" && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-700 font-medium">
              This request is currently {request.status}. Offers may not be accepted.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN (60%) */}
          <div className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{request.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{request.category}</Badge>
                    <Badge className={
                      request.status === "open" ? "bg-emerald-100 text-emerald-700" :
                      request.status === "closed" ? "bg-red-100 text-red-700" :
                      "bg-blue-100 text-blue-700"
                    }>
                      {request.status}
                    </Badge>
                  </div>
                </div>

                {hasBudgetRange && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Budget:</span>
                    <span className="font-semibold">{budgetMin.toLocaleString()} - {budgetMax.toLocaleString()} ETB</span>
                  </div>
                )}

                {request.quantity && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Quantity:</span>
                    <span className="font-semibold">{request.quantity} units</span>
                  </div>
                )}

                {request.deadline && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Needed by:</span>
                    <span className="font-semibold">
                      {new Date(request.deadline).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}

                {request.delivery_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Delivery:</span>
                    <span className="font-semibold">{request.delivery_location}</span>
                  </div>
                )}

                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Description</p>
                  <p className="text-foreground whitespace-pre-wrap">{request.description}</p>
                </div>
              </CardContent>
            </Card>

            {buyer && (
              <Card>
                <CardHeader>
                  <CardTitle>Buyer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    {buyer.avatar_url ? (
                      <img src={buyer.avatar_url} alt={`${buyer.first_name} ${buyer.last_name}`} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">{buyer.first_name?.charAt(0) || "B"}</span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{buyer.first_name} {buyer.last_name}</p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{buyer.rating || "N/A"}</span>
                        <span>· {buyer.total_reviews || 0} reviews</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Member since {new Date(buyer.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RIGHT COLUMN (40%) */}
          <div className="lg:col-span-2 lg:sticky lg:top-6 lg:h-fit">
            <MakeOfferForm 
              request={request}
              buyer={buyer}
              existingOffer={existingOffer}
              userId={user.id}
              requestId={requestId}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
