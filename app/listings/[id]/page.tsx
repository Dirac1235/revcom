import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  ChevronLeft,
  DollarSign,
  Package,
  User,
  Calendar,
  Tag,
} from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("requests")
    .select("*, profiles(first_name, last_name, email)")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = profileData;
  }

  const buyerName = listing.profiles
    ? `${listing.profiles.first_name || ""} ${
        listing.profiles.last_name || ""
      }`.trim() || "Anonymous"
    : "Anonymous";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        {/* Main Card */}
        <Card className="mb-6 border-border shadow-none rounded-lg">
          <CardHeader className="pb-4 pt-8 px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <Tag className="w-5 h-5 text-muted-foreground" />
                  <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border border-border bg-secondary text-secondary-foreground">
                    {listing.category}
                  </span>
                </div>
                <CardTitle className="text-4xl font-serif font-bold text-foreground mb-3">
                  {listing.title}
                </CardTitle>
                <CardDescription className="text-base mt-2 text-muted-foreground">
                  Posted{" "}
                  {new Date(listing.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <span className="px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider border border-border bg-secondary text-secondary-foreground">
                {listing.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8 px-8 pb-8">
            {/* Description */}
            <div className="bg-secondary/20 rounded-lg p-6 border border-border">
              <h3 className="font-serif font-bold text-lg mb-3 text-foreground">
                Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Budget and Quantity Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-border shadow-none rounded-lg bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <DollarSign className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Budget Range
                    </p>
                  </div>
                  <p className="text-3xl font-serif font-bold text-foreground">
                    {listing.budget_min && listing.budget_max
                      ? `$${listing.budget_min} - $${listing.budget_max}`
                      : "Not specified"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none rounded-lg bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Package className="w-5 h-5 text-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Quantity Needed
                    </p>
                  </div>
                  <p className="text-3xl font-serif font-bold text-foreground">
                    {listing.quantity || 1}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Buyer Information */}
            <Card className="border-border shadow-none rounded-lg bg-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-secondary">
                    <User className="w-5 h-5 text-foreground" />
                  </div>
                  <CardTitle className="text-xl font-serif font-bold text-foreground">
                    Buyer Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Posted on{" "}
                    {new Date(listing.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                    Name
                  </p>
                  <p className="text-lg font-medium text-foreground">
                    {buyerName}
                  </p>
                </div>
                {listing.profiles?.email && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                      Contact Email
                    </p>
                    <p className="text-base text-foreground">
                      {listing.profiles.email}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border">
              <Link href="/listings" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-border hover:bg-secondary hover:text-secondary-foreground"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Requests
                </Button>
              </Link>
              {user ? (
                listing.buyer_id !== user.id ? (
                  <Link
                    href={`/messages?request_id=${listing.id}&to=${listing.buyer_id}`}
                    className="flex-1"
                  >
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Message Buyer
                    </Button>
                  </Link>
                ) : (
                  <Link
                    href={`/buyer/requests/${listing.id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      className="w-full border-border hover:bg-secondary hover:text-secondary-foreground"
                    >
                      Edit Request
                    </Button>
                  </Link>
                )
              ) : (
                <Link href="/auth/sign-up" className="flex-1">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                    Sign Up to Message Buyer
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
