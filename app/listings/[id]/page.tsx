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
import { MessageSquare, ChevronLeft } from "lucide-react";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*, profiles(full_name, email)")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            RevCom
          </Link>
          <div className="flex gap-4 items-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline" size="sm">
                    Messages
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/listings"
          className="flex items-center gap-2 text-primary hover:underline mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Listings
        </Link>

        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl mb-2">{listing.title}</CardTitle>
                <CardDescription className="text-base">
                  {listing.category}
                </CardDescription>
              </div>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {listing.status}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground">Budget Range</p>
                <p className="text-2xl font-bold">
                  ${listing.budget_min} - ${listing.budget_max}
                </p>
              </div>
              <div className="border-l-4 border-primary pl-4">
                <p className="text-sm text-muted-foreground">Quantity Needed</p>
                <p className="text-2xl font-bold">{listing.quantity || 1}</p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Seller Information</h3>
              <p className="text-muted-foreground mb-1">
                <span className="font-medium">Name:</span>{" "}
                {listing.profiles?.full_name || "Anonymous"}
              </p>
              <p className="text-sm text-muted-foreground">
                Posted{" "}
                {new Date(listing.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {listing.profiles?.email && (
                <p className="text-sm text-muted-foreground mt-2">
                  <span className="font-medium">Contact:</span>{" "}
                  {listing.profiles.email}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Link href="/listings">
                <Button variant="outline">Back to Listings</Button>
              </Link>
              {user ? (
                listing.seller_id !== user.id ? (
                  <Link
                    href={`/messages?listing_id=${listing.id}&to=${listing.seller_id}`}
                  >
                    <Button className="gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Message Seller
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/seller/listings/${listing.id}`}>
                    <Button variant="outline">Edit Listing</Button>
                  </Link>
                )
              ) : (
                <Link href="/auth/sign-up">
                  <Button>Sign Up to Message Seller</Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
