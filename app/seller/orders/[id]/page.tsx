"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DashboardNav from "@/components/dashboard-nav"
import { ArrowLeft } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function SellerOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [order, setOrder] = useState<any>(null)
  const [buyer, setBuyer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [newStatus, setNewStatus] = useState("")

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

      fetchOrder()
    }

    fetchData()
  }, [supabase, router])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data: orderData } = await supabase.from("orders").select("*").eq("id", orderId).single()

      if (!orderData) {
        router.push("/seller/orders")
        return
      }

      setOrder(orderData)
      setNewStatus(orderData.status)

      const { data: buyerData } = await supabase.from("profiles").select("*").eq("id", orderData.buyer_id).single()

      setBuyer(buyerData)
    } catch (error) {
      console.error("[v0] Error fetching order:", error)
      router.push("/seller/orders")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order.status) return

    setUpdating(true)
    try {
      const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId)

      if (error) throw error

      setOrder({ ...order, status: newStatus })
    } catch (error) {
      console.error("[v0] Error updating order:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/seller/orders" className="mb-4 inline-block">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{order.title}</CardTitle>
                    <CardDescription>Order ID: {order.id.slice(0, 12)}</CardDescription>
                  </div>
                  <Badge className={statusColors[order.status]}>{order.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{order.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="text-lg font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Delivery Location</p>
                    <p className="text-lg font-semibold">{order.delivery_location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Update Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">New Status</label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleUpdateStatus} disabled={updating || newStatus === order.status}>
                  {updating ? "Updating..." : "Update Status"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item</span>
                    <span>{order.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Qty</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span>${order.agreed_price}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${(order.agreed_price * order.quantity).toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {buyer && (
              <Card>
                <CardHeader>
                  <CardTitle>Buyer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{buyer.first_name || "Buyer"}</p>
                    <p className="text-sm text-muted-foreground">{buyer.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-lg font-semibold">⭐ {buyer.rating || "N/A"}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
