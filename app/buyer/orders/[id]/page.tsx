"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js"; // Added proper type import
import { createClient } from "@/lib/supabase/client";
import { getProfileById } from "@/lib/data/profiles";
import { getOrderById } from "@/lib/data/orders";
import { createConversation } from "@/lib/data/conversations";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Loader2 } from "lucide-react";
import type { Profile, Order } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

// Helper for formatting currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [user, setUser] = useState<User | null>(null); // Replaced <any>
  const [order, setOrder] = useState<Order | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMessaging, setIsMessaging] = useState(false); // Added messaging loading state

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

        if (orderData.seller_id) {
          const sellerData = await getProfileById(orderData.seller_id);
          setSeller(sellerData);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        router.push("/buyer/orders");
      } finally {
        setLoading(false); // Moved to finally block
      }
    };

    fetchData();
  }, [orderId, router]);

  const handleMessageSeller = async () => {
    if (!user || !seller || !order) return;

    setIsMessaging(true);
    try {
      const conversation = await createConversation(
        user.id,
        seller.id,
        order.listing_id || undefined,
      );
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      setIsMessaging(false); // Reset on error
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="animate-spin text-primary w-8 h-8" />
      </div>
    );
  }

  if (!order) return null; // Fallback if order is missing after loading

  // Timeline helper logic
  const isStatusReached = (targetStatus: string[]) =>
    targetStatus.includes(order.status);
  const isCancelled = order.status === "cancelled";

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
                    <CardDescription className="uppercase tracking-wider">
                      Order ID: {order.id.slice(0, 12)}
                    </CardDescription>
                  </div>
                  <Badge
                    className={
                      statusColors[order.status] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed">
                    {order.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Quantity
                    </p>
                    <p className="text-lg font-semibold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Delivery Location
                    </p>
                    <p
                      className="text-lg font-semibold truncate"
                      title={order.delivery_location || undefined}
                    >
                      {order.delivery_location || "Not specified"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {/* Step 1: Created */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full ring-4 ring-primary/20"></div>
                    <div className="w-0.5 h-10 bg-primary"></div>
                  </div>
                  <div className="pb-6">
                    <p className="font-medium">Order Created</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {isCancelled ? (
                  /* Cancelled State */
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full ring-4 ring-red-500/20"></div>
                    </div>
                    <div>
                      <p className="font-medium text-red-600">
                        Order Cancelled
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This order will not be fulfilled.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Step 2: Accepted */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isStatusReached([
                              "accepted",
                              "shipped",
                              "delivered",
                            ])
                              ? "bg-primary ring-4 ring-primary/20"
                              : "bg-border"
                          }`}
                        ></div>
                        <div
                          className={`w-0.5 h-10 ${
                            isStatusReached([
                              "accepted",
                              "shipped",
                              "delivered",
                            ])
                              ? "bg-primary"
                              : "bg-border"
                          }`}
                        ></div>
                      </div>
                      <div className="pb-6">
                        <p
                          className={`font-medium ${!isStatusReached(["accepted", "shipped", "delivered"]) && "text-muted-foreground"}`}
                        >
                          Accepted by Seller
                        </p>
                      </div>
                    </div>

                    {/* Step 3: Shipped */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isStatusReached(["shipped", "delivered"])
                              ? "bg-primary ring-4 ring-primary/20"
                              : "bg-border"
                          }`}
                        ></div>
                        <div
                          className={`w-0.5 h-10 ${
                            isStatusReached(["shipped", "delivered"])
                              ? "bg-primary"
                              : "bg-border"
                          }`}
                        ></div>
                      </div>
                      <div className="pb-6">
                        <p
                          className={`font-medium ${!isStatusReached(["shipped", "delivered"]) && "text-muted-foreground"}`}
                        >
                          Shipped
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Delivered */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isStatusReached(["delivered"])
                              ? "bg-green-500 ring-4 ring-green-500/20"
                              : "bg-border"
                          }`}
                        ></div>
                      </div>
                      <div>
                        <p
                          className={`font-medium ${!isStatusReached(["delivered"]) && "text-muted-foreground"}`}
                        >
                          Delivered
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Item</span>
                    <span className="font-medium text-right max-w-[150px] truncate">
                      {order.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className="font-medium">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span className="font-medium">
                      {formatCurrency(order.agreed_price || 0)}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">
                      {formatCurrency(
                        (order.agreed_price || 0) * (order.quantity || 1),
                      )}
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
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-semibold text-lg">
                      {seller.first_name || "Seller"} {seller.last_name || ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {seller.email}
                    </p>
                  </div>

                  {seller.rating && (
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{seller.rating}</span>
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    onClick={handleMessageSeller}
                    disabled={isMessaging}
                  >
                    {isMessaging ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    {isMessaging ? "Starting Chat..." : "Message Seller"}
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
