"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageSquare, Filter } from "lucide-react"
import DashboardNav from "@/components/dashboard-nav"

const categories = [
  "All",
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

export default function SellerExplorePage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchTerm, setSearchTerm] = useState("")
  const [minBudget, setMinBudget] = useState("")
  const [maxBudget, setMaxBudget] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      fetchRequests(user.id)
    }

    fetchData()
  }, [supabase, router])

  const fetchRequests = async (userId: string) => {
    setLoading(true)
    try {
      let query = supabase.from("requests").select("*").eq("status", "open")

      if (selectedCategory !== "All") {
        query = query.eq("category", selectedCategory)
      }

      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      }

      if (minBudget) {
        query = query.gte("budget_max", Number.parseFloat(minBudget))
      }

      if (maxBudget) {
        query = query.lte("budget_min", Number.parseFloat(maxBudget))
      }

      const { data } = await query.order("created_at", { ascending: false })

      setRequests(data || [])
    } catch (error) {
      console.error("[v0] Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilter = () => {
    if (user) {
      fetchRequests(user.id)
    }
  }

  const handleMessaging = async (requestId: string, buyerId: string) => {
    try {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("participant_1_id", user.id)
        .eq("participant_2_id", buyerId)
        .eq("request_id", requestId)
        .single()

      if (existing) {
        router.push(`/messages?conversation=${existing.id}`)
        return
      }

      const { data: newConversation, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: user.id,
          participant_2_id: buyerId,
          request_id: requestId,
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/messages?conversation=${newConversation.id}`)
    } catch (error) {
      console.error("[v0] Error creating conversation:", error)
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Buyer Requests</h1>
          <p className="text-muted-foreground">Find what buyers are looking for and respond with offers</p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by title or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Min Budget</label>
                <Input type="number" placeholder="0" value={minBudget} onChange={(e) => setMinBudget(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium">Max Budget</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(e.target.value)}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleFilter}>
              Apply Filters
            </Button>
          </CardContent>
        </Card>

        {/* Requests Grid */}
        <div className="grid gap-4">
          {loading ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">Loading requests...</p>
              </CardContent>
            </Card>
          ) : requests.length > 0 ? (
            requests.map((request: any) => (
              <Card key={request.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{request.title}</CardTitle>
                      <CardDescription>{request.category}</CardDescription>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Open</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <p className="font-semibold text-primary">
                      Budget: ${request.budget_min} - ${request.budget_max}
                    </p>
                    <p className="text-xs text-muted-foreground">{new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <Button onClick={() => handleMessaging(request.id, request.buyer_id)} className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Send Offer
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No requests found matching your criteria.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
