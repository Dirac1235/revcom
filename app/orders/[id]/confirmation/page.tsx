"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getProfileById } from "@/lib/data/profiles";
import { getOrderById } from "@/lib/data/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants/routes";
import type { Profile, Order } from "@/lib/types";
import {
  Check,
  Truck,
  Package,
  Clock,
  Star,
  MessageSquare,
  ShoppingBag,
  ArrowRight,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [buyer, setBuyer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        router.push(ROUTES.LOGIN);
        return;
      }
      setUser(authUser);

      try {
        const orderData = await getOrderById(orderId);
        
        if (!orderData) {
          setError("Order not found");
          setLoading(false);
          return;
        }

        if (orderData.buyer_id !== authUser.id) {
          setError("You don't have permission to view this order");
          setLoading(false);
          return;
        }

        setOrder(orderData);

        const [sellerData, buyerData] = await Promise.all([
          getProfileById(orderData.seller_id),
          getProfileById(orderData.buyer_id),
        ]);

        setSeller(sellerData);
        setBuyer(buyerData);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Failed to load order details");
      }

      setLoading(false);
    };

    fetchData();
  }, [orderId, router]);

  const handleMessageSeller = async () => {
    if (!user || !seller) return;

    try {
      const supabase = createClient();
      const { data: conversation, error } = await supabase
        .from("conversations")
        .insert({
          participant_1_id: user.id,
          participant_2_id: seller.id,
        })
        .select()
        .single();

      if (error) throw error;

      router.push(ROUTES.MESSAGE_CONVERSATION(conversation.id));
    } catch (error) {
      console.error("Error creating conversation:", error);
    }
  };

  const getEstimatedDeliveryDate = () => {
    const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const shortOrderId = orderId ? `#ORD-${orderId.slice(0, 8).toUpperCase()}` : "";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              {error || "Something went wrong"}
            </h2>
            <Link href={ROUTES.BUYER_ORDERS}>
              <Button>View Your Orders</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const total = order.agreed_price * order.quantity;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Order placed successfully!
          </h1>
          <p className="text-muted-foreground mt-2">
            Order ID: <span className="font-mono font-semibold">{shortOrderId}</span>
          </p>
          {seller && (
            <p className="text-muted-foreground mt-1">
              We&apos;ve notified {seller.first_name || "the seller"} about your order
            </p>
          )}
        </div>

        {/* Order Summary Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              Placed on {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-secondary shrink-0">
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Package className="w-6 h-6" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">
                  {order.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {order.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-semibold">{order.quantity}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="font-semibold">{order.agreed_price.toLocaleString()} ETB</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Delivery Address</p>
                <p className="font-semibold">{order.delivery_location || "Not specified"}</p>
              </div>
              {order.delivery_phone && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-semibold">{order.delivery_phone}</p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">{total.toLocaleString()} ETB</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps / Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Step 1: Order Placed */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-emerald-200"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-foreground">Order placed</p>
                  <p className="text-sm text-muted-foreground">
                    Your order has been confirmed
                  </p>
                </div>
              </div>

              {/* Step 2: Waiting for Seller */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-border"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-foreground">
                    Waiting for seller acceptance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The seller will review and accept your order
                  </p>
                </div>
              </div>

              {/* Step 3: Shipping */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="w-0.5 h-12 bg-border"></div>
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-semibold text-muted-foreground">Shipping</p>
                  <p className="text-sm text-muted-foreground">
                    Your order will be shipped soon
                  </p>
                </div>
              </div>

              {/* Step 4: Delivered */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-muted-foreground">Delivered</p>
                  <p className="text-sm text-muted-foreground">
                    Expected by {getEstimatedDeliveryDate()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href={`/buyer/orders/${order.id}`} className="block">
            <Button className="w-full h-11">
              Track Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-11"
              onClick={handleMessageSeller}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Seller
            </Button>

            <Link href={ROUTES.PRODUCTS} className="block">
              <Button variant="outline" className="w-full h-11">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Email Confirmation Note */}
        {buyer?.email && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Order confirmation sent to{" "}
            <span className="font-medium">{buyer.email}</span>
          </p>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out forwards;
          animation-delay: 0.1s;
        }
      `}</style>
    </div>
  );
}
