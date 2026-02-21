"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getProfileById } from "@/lib/data/profiles";
import { getOrderById } from "@/lib/data/orders";
import { createConversation } from "@/lib/data/conversations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare } from "lucide-react";
import type { Profile, Order } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push("/auth/login");
        return;
      }
      setUser(authUser);

      try {
        const orderData = await getOrderById(orderId);
        if (!orderData) {
          router.push("/buyer/orders");
          return;
        }
        setOrder(orderData);

        const sellerData = await getProfileById(orderData.seller_id);
        setSeller(sellerData);
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/buyer/orders");
      }

      setLoading(false);
    };

    fetchData();
  }, [orderId, router]);

  const handleMessageSeller = async () => {
    if (!user || !seller || !order) return;

    try {
      const conversation = await createConversation(
        user.id,
        seller.id,
        order.listing_id || undefined
      );
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
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
                    <p className="text-lg font-semibold">{order.delivery_location || "Not specified"}</p>
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
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        order.status !== "pending" ? "bg-primary" : "bg-border"
                      }`}
                    ></div>
                    {(order.status === "shipped" || order.status === "delivered") && (
                      <div className="w-0.5 h-12 bg-border"></div>
                    )}
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
                    <span>{order.agreed_price} ETB</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      {(order.agreed_price * order.quantity).toLocaleString()} ETB
                    </span>
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
                  <Button 
                    variant="outline" 
                    className="w-full mt-2"
                    onClick={handleMessageSeller}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Seller
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
