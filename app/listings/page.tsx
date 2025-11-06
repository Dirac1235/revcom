"use client"

import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare } from "lucide-react"

export default async function PublicListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; category?: string; budget_min?: string; budget_max?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

  // Build query with filters
  let query = supabase
    .from("requests")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`)
  }

  if (params.category) {
    query = query.eq("category", params.category)
  }

  if (params.budget_min) {
    query = query.gte("budget_max", Number.parseFloat(params.budget_min))
  }

  if (params.budget_max) {
    query = query.lte("budget_min", Number.parseFloat(params.budget_max))
  }

  const { data: listings } = await query

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const categories = [
    "Electronics",
    "Furniture",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports & Outdoors",
    "Toys & Games",
    "Services",
    "Other",
  ]

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
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Link href="/messages">
                  <Button variant="outline">Messages</Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline">Profile</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Login</Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse All Listings</h1>
          <p className="text-muted-foreground">Discover what buyers are looking for and send offers</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <form action="/listings" method="GET" className="flex gap-2">
                <Input
                  type="text"
                  name="search"
                  placeholder="Search listings..."
                  defaultValue={params.search || ""}
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                name="category"
                defaultValue={params.category || ""}
                onChange={(e) => {
                  const url = new URL(window.location.href)
                  if (e.target.value) {
                    url.searchParams.set("category", e.target.value)
                  } else {
                    url.searchParams.delete("category")
                  }
                  window.location.href = url.toString()
                }}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Min Budget</label>
              <Input
                type="number"
                name="budget_min"
                placeholder="Min budget"
                defaultValue={params.budget_min || ""}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Max Budget</label>
              <Input
                type="number"
                name="budget_max"
                placeholder="Max budget"
                defaultValue={params.budget_max || ""}
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="grid gap-4">
          {listings && listings.length > 0 ? (
            listings.map((listing: any) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{listing.title}</CardTitle>
                      <CardDescription>{listing.category}</CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {listing.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">{listing.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Budget Range</p>
                      <p className="font-semibold">
                        ${listing.budget_min} - ${listing.budget_max}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quantity Needed</p>
                      <p className="font-semibold">{listing.quantity || 1}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Posted</p>
                      <p className="font-semibold">{new Date(listing.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Buyer</p>
                      <p className="font-semibold truncate">{listing.profiles?.full_name || "Anonymous"}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/listings/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    {user ? (
                      <Link href={`/messages?listing_id=${listing.id}`}>
                        <Button size="sm" className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Send Offer
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/auth/sign-up">
                        <Button size="sm">Sign Up to Offer</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">No listings found. Try adjusting your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
