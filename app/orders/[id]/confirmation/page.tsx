import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, Clock, Check } from "lucide-react";

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: orderId } = await params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (!order || order.buyer_id !== user.id) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
          <Link href="/buyer/orders">
            <Button>View Your Orders</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { data: seller } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", order.seller_id)
    .single();

  const total = order.agreed_price * order.quantity;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Order placed successfully!
          </h1>
          <p className="text-muted-foreground mt-2">
            Order ID: <span className="font-mono font-semibold">#ORD-{orderId.slice(0, 8).toUpperCase()}</span>
          </p>
          {seller && (
            <p className="text-muted-foreground mt-1">
              We&apos;ve notified {seller.first_name || "the seller"} about your order
            </p>
          )}
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{order.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{order.description}</p>
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
            </div>

            <div className="border-t pt-4 flex justify-between font-bold text-lg">
              <span>Total Amount</span>
              <span className="text-primary">{total.toLocaleString()} ETB</span>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What happens next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-emerald-200"></div>
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-foreground">Order placed</p>
                  <p className="text-sm text-muted-foreground">Your order has been confirmed</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="w-0.5 h-12 bg-border"></div>
                </div>
                <div className="pb-4">
                  <p className="font-semibold text-foreground">Waiting for seller acceptance</p>
                  <p className="text-sm text-muted-foreground">The seller will review and accept</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-muted-foreground">Delivered</p>
                  <p className="text-sm text-muted-foreground">Expected within 3-5 business days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Link href={`/buyer/orders/${order.id}`} className="block">
            <Button className="w-full h-11">
              Track Order
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            <Link href="/buyer/orders" className="block">
              <Button variant="outline" className="w-full h-11">
                View Orders
              </Button>
            </Link>

            <Link href="/products" className="block">
              <Button variant="outline" className="w-full h-11">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
