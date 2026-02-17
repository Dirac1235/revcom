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
import { Plus, MessageSquare, Eye, Package, FileText, ShoppingBag } from "lucide-react";
import DashboardNav from "@/components/dashboard-nav";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("buyer_id", user.id)
    .limit(5)
    .order("created_at", { ascending: false });

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .limit(5)
    .order("created_at", { ascending: false });

  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .limit(5)
    .order("created_at", { ascending: false });

  const { count: totalListings } = await supabase
    .from("listings")
    .select("*", { count: "exact", head: true })
    .eq("seller_id", user.id);

  const { count: totalRequests } = await supabase
    .from("requests")
    .select("*", { count: "exact", head: true })
    .eq("buyer_id", user.id);

  const { count: totalOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {profile?.first_name || user?.email}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {(profile?.user_type === "seller" || profile?.user_type === "both") && (
            <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                  <Package className="w-5 h-5 text-foreground" />
                  My Listings
                </CardTitle>
                <CardDescription>Your product listings</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-4xl font-serif font-bold mb-6 text-foreground">
                  {totalListings || 0}
                </p>
                <Link href="/seller/products">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                    Manage Listings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {(profile?.user_type === "buyer" ||
            profile?.user_type === "both") && (
            <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
              <CardHeader className="pb-4 pt-6 px-6">
                <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                  <FileText className="w-5 h-5 text-foreground" />
                  My Requests
                </CardTitle>
                <CardDescription>Track your buyer requests</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <p className="text-4xl font-serif font-bold mb-6 text-foreground">
                  {totalRequests || 0}
                </p>
                <Link href="/buyer/requests">
                  <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                    View Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                <ShoppingBag className="w-5 h-5 text-foreground" />
                Orders
              </CardTitle>
              <CardDescription>Track all orders</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <p className="text-4xl font-serif font-bold mb-6 text-foreground">
                {totalOrders || 0}
              </p>
              <Link href={profile?.user_type === "seller" ? "/seller/orders" : "/buyer/orders"}>
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                  View Orders
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="flex items-center gap-2 text-xl font-medium text-foreground">
                <MessageSquare className="w-5 h-5 text-foreground" />
                Messages
              </CardTitle>
              <CardDescription>View your conversations</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="h-[60px] flex items-center text-muted-foreground text-sm mb-2">
                Check your latest messages
              </div>
              <Link href="/messages">
                <Button className="w-full bg-foreground text-background hover:bg-foreground/90 shadow-none">
                  Go to Messages
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(profile?.user_type === "buyer" || profile?.user_type === "both") && (
          <>
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Recent Requests
            </h2>
            <div className="grid gap-6 mb-8">
              {requests && requests.length > 0 ? (
                requests.map((request: any) => (
                  <Card
                    key={request.id}
                    className="border-border shadow-none rounded-lg hover:bg-secondary/20 transition-colors"
                  >
                    <CardHeader className="pb-2 pt-6 px-6">
                      <CardTitle className="text-lg font-medium text-foreground">
                        {request.title}
                      </CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <p className="text-xl font-bold text-foreground">
                        ${request.budget_min.toLocaleString()} - ${request.budget_max.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider font-medium">
                        Status: {request.status}
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border shadow-none rounded-lg bg-transparent">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No requests yet.
                    </p>
                    <Link
                      href="/buyer/requests/create"
                    >
                      <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                        Create one now
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}

        {(profile?.user_type === "seller" || profile?.user_type === "both") && (
          <>
            <h2 className="text-2xl font-serif font-bold mb-6 text-foreground">
              Recent Listings
            </h2>
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
                          <CardTitle className="text-lg font-medium text-foreground">
                            {listing.title}
                          </CardTitle>
                          <CardDescription>{listing.category}</CardDescription>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {listing.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="px-6 pb-6">
                      <p className="text-xl font-bold text-foreground">
                        ${listing.price.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {listing.inventory_quantity} in stock
                      </p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="border-dashed border-border shadow-none rounded-lg bg-transparent">
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">
                      No listings yet.
                    </p>
                    <Link
                      href="/seller/products/create"
                    >
                      <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                        Create your first listing
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
