"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useSearchParams } from 'next/navigation'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardNav from "@/components/dashboard-nav"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const requestId = searchParams.get("request_id")
  const sellerId = searchParams.get("seller_id")

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [request, setRequest] = useState<any>(null)
  const [seller, setSeller] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    quantity: "1",
    agreed_price: "",
    delivery_location: "",
  })

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

      if (requestId) {
        const { data: reqData } = await supabase
          .from("requests")
          .select("*")
          .eq("id", requestId)
          .single()
        setRequest(reqData)
        if (reqData) {
          setFormData((prev) => ({
            ...prev,
            title: reqData.title,
            description: reqData.description,
          }))
        }
      }

      if (sellerId) {
        const { data: sellerData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", sellerId)
          .single()
        setSeller(sellerData)
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router, requestId, sellerId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          request_id: requestId,
          title: formData.title,
          description: formData.description,
          quantity: parseInt(formData.quantity),
          agreed_price: parseFloat(formData.agreed_price),
          delivery_location: formData.delivery_location,
          status: "pending",
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/buyer/orders/${order.id}`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating order:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || loading) return null

  const total = parseFloat(formData.agreed_price || "0") * (parseInt(formData.quantity) || 1)

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Review & Checkout</h1>
          <p className="text-muted-foreground">Finalize your order with the seller</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>Review and confirm your order</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Item Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="agreed_price">Price per Unit</Label>
                      <Input
                        id="agreed_price"
                        name="agreed_price"
                        type="number"
                        step="0.01"
                        value={formData.agreed_price}
                        onChange={handleChange}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="delivery_location">Delivery Location</Label>
                    <Input
                      id="delivery_location"
                      name="delivery_location"
                      value={formData.delivery_location}
                      onChange={handleChange}
                      placeholder="Your delivery address"
                      required
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" disabled={submitting} className="flex-1">
                      {submitting ? "Creating Order..." : "Confirm & Create Order"}
                    </Button>
                    <Link href="/seller/explore">
                      <Button variant="outline">Cancel</Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item</span>
                    <span>{formData.title || "N/A"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{formData.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span>${formData.agreed_price || "0.00"}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {seller && (
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Selling To</p>
                    <p className="font-semibold">{seller.first_name || "Seller"}</p>
                    <p className="text-xs text-muted-foreground">
                      Rating: ⭐ {seller.rating || "N/A"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
