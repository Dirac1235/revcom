import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Star, MessageSquare, Clock } from "lucide-react";
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
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const profile = await getProfileById(user.id);
  const request = await getRequestById(id);
  const offers = await getOffersByRequestWithSellers(id);

  if (!request) {
    redirect("/buyer/requests");
  }

  const isOwner = request.buyer_id === user.id;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/buyer/requests" className="mb-4 inline-block">
          <Button variant="outline" size="sm">
            Back
          </Button>
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl">{request.title}</CardTitle>
                <CardDescription>{request.category}</CardDescription>
              </div>
              <Badge className={
                request.status === "open" ? "bg-emerald-100 text-emerald-700" :
                request.status === "closed" ? "bg-red-100 text-red-700" :
                "bg-blue-100 text-blue-700"
              }>
                {request.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{request.description}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="text-lg font-semibold flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {request.budget_min?.toLocaleString() || "0"} - {request.budget_max?.toLocaleString() || "0"} ETB
                </p>
              </div>
              {request.quantity && (
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="text-lg font-semibold">{request.quantity} units</p>
                </div>
              )}
              {request.deadline && (
                <div>
                  <p className="text-sm text-muted-foreground">Deadline</p>
                  <p className="text-lg font-semibold">
                    {new Date(request.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              )}
              {request.delivery_location && (
                <div>
                  <p className="text-sm text-muted-foreground">Delivery Location</p>
                  <p className="text-lg font-semibold">{request.delivery_location}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Posted</p>
                <p className="text-lg font-semibold">
                  {new Date(request.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">
            Offers ({offers.length})
          </h2>
        </div>

        {offers.length > 0 ? (
          <div className="grid gap-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className={offer.status === "accepted" ? "border-emerald-500 border-2" : ""}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      {offer.seller?.avatar_url ? (
                        <img src={offer.seller.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold">{offer.seller?.first_name?.charAt(0) || "S"}</span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-base">
                          {offer.seller?.first_name} {offer.seller?.last_name}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{offer.seller?.rating || "N/A"}</span>
                          <span>· {offer.seller?.total_reviews || 0} reviews</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        {offer.price?.toLocaleString()} ETB
                      </p>
                      {offer.status === "accepted" && (
                        <Badge className="bg-emerald-100 text-emerald-700">Accepted</Badge>
                      )}
                      {offer.status === "rejected" && (
                        <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                      )}
                      {offer.status === "pending" && (
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proposal</p>
                    <p className="whitespace-pre-wrap">{offer.description}</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Delivery:</span>
                      <span className="font-medium">{offer.delivery_timeline}</span>
                    </div>
                    {offer.delivery_cost !== undefined && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Delivery:</span>
                        <span className="font-medium">{offer.delivery_cost === 0 ? "Free" : `${offer.delivery_cost} ETB`}</span>
                      </div>
                    )}
                  </div>

                  {offer.payment_terms && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Payment Terms: </span>
                      <span className="font-medium">{offer.payment_terms.replace(/_/g, " ")}</span>
                    </div>
                  )}

                  {request.status === "open" && offer.status === "pending" && isOwner && (
                    <div className="flex gap-3 pt-2">
                      <OfferActions 
                        offer={offer} 
                        requestId={id}
                        requestStatus={request.status}
                      />
                      <Link href={`/messages?conversation=&request_id=${id}&to=${offer.seller_id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Message Seller
                        </Button>
                      </Link>
                    </div>
                  )}

                  {request.status === "open" && offer.status === "accepted" && isOwner && (
                    <div className="pt-2">
                      <OfferActions 
                        offer={offer} 
                        requestId={id}
                        requestStatus={request.status}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No offers yet. Sellers will see your request and can submit offers.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
