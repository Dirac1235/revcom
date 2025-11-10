import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardNav from "@/components/dashboard-nav"

export default async function ExplorePage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  const { data: requests } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Explore Marketplace</h1>
          <p className="text-muted-foreground">Browse listings and requests from the community</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Listings */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Active Listings</h2>
            <div className="grid gap-4">
              {listings && listings.length > 0 ? (
                listings.map((listing: any) => (
                  <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{listing.title}</CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{listing.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-2xl font-bold text-primary">${listing.price}</p>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">No active listings yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Requests */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Open Requests</h2>
            <div className="grid gap-4">
              {requests && requests.length > 0 ? (
                requests.map((request: any) => (
                  <Card key={request.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{request.description}</p>
                      <div className="flex justify-between items-center">
                        <p className="text-sm">
                          Budget: ${request.budget_min} - ${request.budget_max}
                        </p>
                        <Button size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">No open requests yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
