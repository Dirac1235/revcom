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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-2 pt-5">
        {/* Back Button */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        {/* Main Card */}
        <Card className="mb-6 border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {listing.category}
                  </span>
                </div>
                <CardTitle className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {listing.title}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Posted{" "}
                  {new Date(listing.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 capitalize">
                {listing.status}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Description */}
            <div className="bg-blue-50/50 dark:bg-blue-950/20 rounded-lg p-6 border border-blue-100 dark:border-blue-900/50">
              <h3 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">
                Description
              </h3>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>
            </div>

            {/* Budget and Quantity Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-blue-100 dark:border-blue-900/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Budget Range
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {listing.budget_min && listing.budget_max
                      ? `$${listing.budget_min} - $${listing.budget_max}`
                      : "Not specified"}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-indigo-100 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Quantity Needed
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                    {listing.quantity || 1}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Buyer Information */}
            <Card className="border-purple-100 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 to-cyan-50/50 dark:from-purple-950/20 dark:to-cyan-950/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-xl text-purple-600 dark:text-purple-400">
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
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {buyerName}
                  </p>
                </div>
                {listing.profiles?.email && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
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
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-blue-100 dark:border-blue-900/50">
              <Link href="/listings" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
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
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30">
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
                      className="w-full border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      Edit Request
                    </Button>
                  </Link>
                )
              ) : (
                <Link href="/auth/sign-up" className="flex-1">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30">
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
