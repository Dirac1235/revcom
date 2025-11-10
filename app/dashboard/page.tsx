import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, MessageSquare, Eye } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  const { data: listings } = await supabase.from("listings").select("*").eq("seller_id", user?.id).limit(5)

  const { data: requests } = await supabase.from("requests").select("*").eq("buyer_id", user?.id).limit(5)
  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {profile?.first_name || user?.email}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {(profile?.user_type === "seller" || profile?.user_type === "both") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  My Listings
                </CardTitle>
                <CardDescription>Manage your products or services</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">{listings?.length || 0}</p>
                <Link href="/seller/listings">
                  <Button className="w-full">View Listings</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {(profile?.user_type === "buyer" || profile?.user_type === "both") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  My Requests
                </CardTitle>
                <CardDescription>Track your buyer requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">{requests?.length || 0}</p>
                <Link href="/buyer/requests">
                  <Button className="w-full">View Requests</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </CardTitle>
              <CardDescription>View your conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/messages">
                <Button className="w-full">Go to Messages</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(profile?.user_type === "seller" || profile?.user_type === "both") && (
          <>
            <h2 className="text-2xl font-bold mb-4">Recent Listings</h2>
            <div className="grid gap-4 mb-8">
              {listings && listings.length > 0 ? (
                listings.map((listing: any) => (
                  <Card key={listing.id}>
                    <CardHeader>
                      <CardTitle>{listing.title}</CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold text-primary">${listing.price}</p>
                      <p className="text-sm text-muted-foreground mt-2">Status: {listing.status}</p>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      No listings yet.{" "}
                      <Link href="/seller/listings/create" className="text-primary hover:underline">
                        Create one now
                      </Link>
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
