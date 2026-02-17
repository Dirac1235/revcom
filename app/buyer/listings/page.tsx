import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";
import { getProfileById } from "@/lib/data/profiles-server";
import { getBuyerRequests } from "@/lib/data/requests-server";

export default async function BuyerListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const profile = await getProfileById(user.id);
  const listings = await getBuyerRequests(user.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
              My Listings
            </h1>
            <p className="text-muted-foreground text-lg">
              Create and manage your buyer listings
            </p>
          </div>
          <Link href="/buyer/listings/create">
            <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              Create Listing
            </Button>
          </Link>
        </div>

        <div className="grid gap-6">
          {listings && listings.length > 0 ? (
            listings.map((listing: any) => (
              <Card
                key={listing.id}
                className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors"
              >
                <CardHeader className="pb-2 pt-6 px-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-medium text-foreground">{listing.title}</CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider border border-border bg-secondary text-secondary-foreground">
                      {listing.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <p className="text-muted-foreground mb-6 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-lg font-bold text-foreground">
                      Budget: ${listing.budget_min} - ${listing.budget_max}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      Posted {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Link href={`/buyer/listings/${listing.id}/edit`}>
                      <Button variant="outline" size="sm" className="border-border hover:bg-secondary hover:text-secondary-foreground">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Link href={`/buyer/listings/${listing.id}`}>
                      <Button variant="outline" size="sm" className="border-border hover:bg-secondary hover:text-secondary-foreground">
                        View Responses
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-border shadow-none rounded-lg bg-transparent">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  You haven't posted any listings yet.
                </p>
                <Link href="/buyer/listings/create">
                  <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none">Create Your First Listing</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
