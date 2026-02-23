"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User } from "@supabase/supabase-js";
import { getOrderById, updateOrderStatus } from "@/lib/data/orders";
import { getProfileById } from "@/lib/data/profiles";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, MessageSquare, Loader2, Save } from "lucide-react";
import type { Profile, Order } from "@/lib/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  accepted: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function SellerOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [buyer, setBuyer] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      const { createClient } = await import("@/lib/supabase/client");
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
          router.push("/seller/orders");
          return;
        }

        setOrder(orderData);
        setNewStatus(orderData.status);

        const buyerData = await getProfileById(orderData.buyer_id);
        setBuyer(buyerData);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId, router]);

  const handleUpdateStatus = async () => {
    if (!newStatus || newStatus === order?.status) return;

    setUpdating(true);
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrder((prev) =>
        prev ? { ...prev, status: newStatus as Order["status"] } : null,
      );
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleMessageBuyer = async () => {
    if (!user || !buyer || !order) return;
    try {
      const conversation = await createConversation(
        user.id,
        buyer.id,
        order.listing_id || undefined,
      );
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      console.error("Error starting chat:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const totalPrice = (order.agreed_price || 0) * (order.quantity || 0);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/seller/orders" className="mb-6 inline-block">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sales
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{order.title}</CardTitle>
                    <CardDescription className="font-mono text-xs uppercase">
                      ID: {order.id.split("-")[0]}...
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${statusColors[order.status]} capitalize px-3 py-1`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Requirement Details
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {order.description || "No specific instructions provided."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-muted/20 border">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Quantity Ordered
                    </p>
                    <p className="text-lg font-bold">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-medium">
                      Delivery To
                    </p>
                    <p className="text-lg font-bold truncate">
                      {order.delivery_location || "Pickup"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Fulfillment Action</CardTitle>
                <CardDescription>
                  Update the status as you progress with the order.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
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
                <Button
                  onClick={handleUpdateStatus}
                  disabled={updating || newStatus === order.status}
                  className="min-w-[140px]"
                >
                  {updating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {updating ? "Saving..." : "Update Status"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 border-b pb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unit Price</span>
                    <span>{order.agreed_price.toLocaleString()} ETB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>× {order.quantity}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-lg">Your Earnings</span>
                  <span className="text-2xl font-black text-primary">
                    {totalPrice.toLocaleString()} ETB
                  </span>
                </div>
              </CardContent>
            </Card>

            {buyer && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Customer Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                      {buyer.first_name?.[0] || "B"}
                    </div>
                    <div>
                      <p className="font-semibold leading-none">
                        {buyer.first_name} {buyer.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {buyer.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
                    <span className="text-sm font-medium">Buyer Rating</span>
                    <span className="font-bold text-yellow-600">
                      ⭐ {buyer.rating || "New"}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleMessageBuyer}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Buyer
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
