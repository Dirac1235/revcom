import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOffersBySeller } from "@/lib/data/offers-server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, CheckCircle, XCircle, Clock, ArrowRight } from "lucide-react";

const STATUS_STYLES: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    icon: <Clock className="w-4 h-4 mr-1" />,
  },
  accepted: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    icon: <CheckCircle className="w-4 h-4 mr-1" />,
  },
  rejected: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    icon: <XCircle className="w-4 h-4 mr-1" />,
  },
};

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
}

export default async function SellerOffersPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.user_type === "buyer") {
    redirect("/dashboard");
  }

  const offers = await getOffersBySeller(user.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Offers</h1>
          <p className="text-muted-foreground mt-2">
            Manage all the offers you've submitted for buyer requests.
          </p>
        </div>

        {offers.length > 0 ? (
          <div className="grid gap-4">
            {offers.map((offer: any) => {
              const statusStyle =
                STATUS_STYLES[offer.status] || STATUS_STYLES.pending;

              return (
                <Card
                  key={offer.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0 sm:flex sm:items-center">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <Link
                            href={`/buyer/requests/${offer.request_id}`}
                            className="hover:underline"
                          >
                            <h3 className="text-lg font-semibold line-clamp-1">
                              {offer.requests?.title || "Unknown Request"}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">
                            Submitted {timeAgo(offer.created_at)}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className={`${statusStyle.bg} ${statusStyle.text} capitalize flex items-center`}
                        >
                          {statusStyle.icon}
                          {offer.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Price</p>
                          <p className="font-medium">
                            {offer.price?.toLocaleString()} ETB
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">
                            Delivery Time
                          </p>
                          <p className="font-medium capitalize">
                            {offer.delivery_timeline?.replace(/_/g, " ")}
                          </p>
                        </div>
                        {offer.delivery_cost !== undefined && (
                          <div className="hidden md:block">
                            <p className="text-muted-foreground mb-1">
                              Delivery Cost
                            </p>
                            <p className="font-medium">
                              {offer.delivery_cost > 0
                                ? `${offer.delivery_cost.toLocaleString()} ETB`
                                : "Free"}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t text-sm">
                        <p className="line-clamp-2 text-foreground/80">
                          {offer.description}
                        </p>
                      </div>
                    </div>

                    <div className="bg-secondary/30 p-4 sm:p-6 sm:w-48 flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l sm:min-h-[220px]">
                      <div className="text-center w-full">
                        {offer.status === "pending" && (
                          <Link
                            href={`/requests/${offer.request_id}/make-offer`}
                            className="w-full"
                          >
                            <Button className="w-full" variant="outline">
                              Edit Offer
                            </Button>
                          </Link>
                        )}
                        {offer.status === "accepted" && (
                          <Link href={`/seller/orders`} className="w-full">
                            <Button className="w-full">View Order</Button>
                          </Link>
                        )}
                        <Link
                          href={`/buyer/requests/${offer.request_id}`}
                          className="mt-2 text-sm text-blue-600 hover:underline flex items-center justify-center"
                        >
                          View Request <ArrowRight className="ml-1 w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed">
            <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
              <Send className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Offers Yet</h2>
            <p className="text-muted-foreground max-w-sm mx-auto mb-6">
              You haven't submitted any offers to buyer requests yet. Start
              exploring and send your first offer!
            </p>
            <Link href="/listings">
              <Button>Browse Requests</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
