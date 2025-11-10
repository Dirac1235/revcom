import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import DashboardNav from "@/components/dashboard-nav"
import { ArrowLeft } from "lucide-react"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single()

  const { data: seller } = order
    ? await supabase.from("profiles").select("*").eq("id", order.seller_id).single()
    : { data: null }

  if (!order) {
    redirect("/buyer/orders")
  }

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/buyer/orders" className="mb-4 inline-block">
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
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="w-0.5 h-12 bg-border"></div>
                  </div>
                  <div>
                    <p className="font-semibold">Order Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${order.status !== "pending" ? "bg-primary" : "bg-border"}`}
                    ></div>
                    {order.status === "shipped" ||
                      (order.status === "delivered" && <div className="w-0.5 h-12 bg-border"></div>)}
                  </div>
                  <div>
                    <p className="font-semibold">Accepted by Seller</p>
                    <p className="text-sm text-muted-foreground">
                      {order.status === "pending" ? "Awaiting response" : "Accepted"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
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

            {seller && (
              <Card>
                <CardHeader>
                  <CardTitle>Seller</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="font-semibold">{seller.first_name || "Seller"}</p>
                    <p className="text-sm text-muted-foreground">{seller.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Rating</p>
                    <p className="text-lg font-semibold">⭐ {seller.rating || "N/A"}</p>
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
