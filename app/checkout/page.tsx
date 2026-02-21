"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/hooks/use-toast";
import { ROUTES } from "@/lib/constants/routes";
import { getProfileById } from "@/lib/data/profiles";
import { getListingById } from "@/lib/data/listings";
import { createConversation } from "@/lib/data/conversations";
import type { Profile, Product } from "@/lib/types";
import {
  ArrowLeft,
  Star,
  MessageSquare,
  Truck,
  Shield,
  Lock,
  ChevronDown,
  ChevronUp,
  Check,
} from "lucide-react";

const DELIVERY_COST_THRESHOLD = 5000;
const DELIVERY_FEE = 500;

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const productId = searchParams.get("product_id");
  const sellerId = searchParams.get("seller_id");
  const quantityParam = searchParams.get("quantity");

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showOrderNotes, setShowOrderNotes] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [formData, setFormData] = useState({
    delivery_address: "",
    phone: "",
    delivery_notes: "",
    order_notes: "",
    payment_method: "pay_on_delivery",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

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
        const profileData = await getProfileById(authUser.id);
        setProfile(profileData);

        if (profileData && profileData.user_type === "seller") {
          toast({
            title: "Access Denied",
            description: "Buyers can only access checkout. Please switch to buyer mode.",
            variant: "destructive",
          });
          router.push(ROUTES.DASHBOARD);
          return;
        }

        if (profileData?.first_name) {
          setFormData((prev) => ({
            ...prev,
            delivery_address: `${profileData.first_name || ""} ${profileData.last_name || ""}`.trim(),
          }));
        }

        if (productId) {
          const productData = await getListingById(productId);
          if (productData) {
            setProduct(productData);
            
            if (productData.inventory_quantity === 0) {
              setIsOutOfStock(true);
            }

            const qty = parseInt(quantityParam || "1");
            const maxQty = productData.inventory_quantity || 1;
            setQuantity(Math.min(Math.max(1, qty), maxQty));

            const sellerData = await getProfileById(productData.seller_id);
            setSeller(sellerData);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive",
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [router, productId, sellerId, quantityParam]);

  const unitPrice = product?.price || 0;
  const subtotal = unitPrice * quantity;
  const deliveryFee = subtotal >= DELIVERY_COST_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + deliveryFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleQuantityChange = (newQty: number) => {
    if (!product) return;
    const maxQty = product.inventory_quantity || 1;
    const clampedQty = Math.min(Math.max(1, newQty), maxQty);
    setQuantity(clampedQty);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.delivery_address.trim()) {
      newErrors.delivery_address = "Delivery address is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+251[0-9]{9}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Please enter a valid Ethiopian phone number (+251...)";
    }

    if (quantity > (product?.inventory_quantity || 0)) {
      newErrors.quantity = "Requested quantity exceeds available stock";
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || !user || !product) return;

    setSubmitting(true);

    try {
      const supabase = createClient();

      const { data: inventoryCheck, error: inventoryError } = await supabase
        .from("listings")
        .select("inventory_quantity, status")
        .eq("id", product.id)
        .single();

      if (inventoryError || !inventoryCheck) {
        throw new Error("Failed to check inventory");
      }

      if (inventoryCheck.inventory_quantity < quantity || inventoryCheck.status !== "active") {
        toast({
          title: "Out of Stock",
          description: "The product is no longer available in the requested quantity",
          variant: "destructive",
        });
        setIsOutOfStock(true);
        setSubmitting(false);
        return;
      }

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          seller_id: product.seller_id,
          listing_id: product.id,
          title: product.title,
          description: `Order for ${quantity}x ${product.title}`,
          quantity: quantity,
          agreed_price: unitPrice,
          delivery_location: formData.delivery_address,
          delivery_phone: formData.phone,
          delivery_notes: formData.delivery_notes,
          order_notes: formData.order_notes,
          payment_method: formData.payment_method,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const { error: decrementError } = await supabase
        .from("listings")
        .update({
          inventory_quantity: inventoryCheck.inventory_quantity - quantity,
        })
        .eq("id", product.id);

      if (decrementError) {
        console.error("Failed to decrement inventory:", decrementError);
      }

      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed",
      });

      router.push(`/orders/${order.id}/confirmation`);
      router.refresh();
    } catch (error: any) {
      console.error("[Checkout] Error creating order:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessageSeller = async () => {
    if (!user || !seller) return;

    try {
      const conversation = await createConversation(
        user.id,
        seller.id,
        productId || undefined
      );
      router.push(ROUTES.MESSAGE_CONVERSATION(conversation.id));
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              No Product Selected
            </h2>
            <p className="text-muted-foreground mb-6">
              Please select a product to proceed to checkout.
            </p>
            <Link href={ROUTES.PRODUCTS}>
              <Button>Browse Products</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link href={productId ? `/products/${productId}` : ROUTES.PRODUCTS}>
            <Button variant="ghost" className="pl-0 hover:bg-transparent text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to {product?.title || "product"}
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mt-4">
            Complete your order
          </h1>
          <p className="text-muted-foreground mt-1">Step 1 of 2</p>
        </div>

        {isOutOfStock && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-medium">
              This product is currently out of stock or unavailable.
            </p>
          </div>
        )}

        <div className="grid lg:grid-cols-5 gap-6">
          {/* LEFT COLUMN (60%) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">
                    {product?.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {product?.title}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {unitPrice.toLocaleString()} ETB per unit
                    </p>

                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center border-2 border-border/30 rounded-lg bg-secondary/20">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          disabled={quantity <= 1}
                          className="px-3 py-1.5 hover:bg-secondary rounded-l-lg transition-colors disabled:opacity-40"
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-semibold text-sm">
                          {quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          disabled={quantity >= (product?.inventory_quantity || 1)}
                          className="px-3 py-1.5 hover:bg-secondary rounded-r-lg transition-colors disabled:opacity-40"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Max: {product?.inventory_quantity || 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-foreground">
                      {subtotal.toLocaleString()} ETB
                    </p>
                  </div>
                </div>

                {errors.quantity && (
                  <p className="text-sm text-red-500">{errors.quantity}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <Link href={productId ? `/products/${productId}` : "#"}>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery_address">
                    Delivery address <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="delivery_address"
                    name="delivery_address"
                    value={formData.delivery_address}
                    onChange={handleChange}
                    placeholder="Street address, city, region"
                    rows={3}
                    className={errors.delivery_address ? "border-red-500" : ""}
                  />
                  {errors.delivery_address && (
                    <p className="text-sm text-red-500 mt-1">{errors.delivery_address}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">
                    Phone number <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+251 912 345 678"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="delivery_notes">Delivery notes (optional)</Label>
                  <Textarea
                    id="delivery_notes"
                    name="delivery_notes"
                    value={formData.delivery_notes}
                    onChange={handleChange}
                    placeholder="Special instructions for delivery"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 bg-secondary/20 rounded-lg">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Estimated delivery: 3-5 business days
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  {subtotal >= DELIVERY_COST_THRESHOLD ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Free delivery
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">
                      Delivery: {DELIVERY_FEE} ETB
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Order Notes (Collapsible) */}
            <Card>
              <CardHeader>
                <button
                  onClick={() => setShowOrderNotes(!showOrderNotes)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <CardTitle className="text-base">Add a message to seller</CardTitle>
                  {showOrderNotes ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </button>
              </CardHeader>
              {showOrderNotes && (
                <CardContent>
                  <Textarea
                    name="order_notes"
                    value={formData.order_notes}
                    onChange={handleChange}
                    placeholder="Any specific requirements or questions?"
                    rows={3}
                  />
                </CardContent>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN (40%) - Sticky Sidebar */}
          <div className="lg:col-span-2 space-y-6 lg:sticky lg:top-6 lg:h-fit">
            {/* Seller Information */}
            {seller && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Seller</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    {seller.avatar_url ? (
                      <img
                        src={seller.avatar_url}
                        alt={`${seller.first_name} ${seller.last_name}`}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {seller.first_name?.charAt(0) || "S"}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground">
                        {seller.first_name} {seller.last_name}
                      </p>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{seller.rating || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  {seller.first_name && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="bg-secondary px-2 py-1 rounded">
                        {seller.first_name}&apos;s Shop
                      </span>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleMessageSeller}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message seller
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Price Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Price Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Subtotal ({quantity}x)
                  </span>
                  <span>{subtotal.toLocaleString()} ETB</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      `${deliveryFee} ETB`
                    )}
                  </span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{total.toLocaleString()} ETB</span>
                </div>
                {subtotal >= DELIVERY_COST_THRESHOLD && (
                  <p className="text-xs text-emerald-600">
                    You saved {DELIVERY_FEE} ETB on delivery!
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Inclusive of VAT
                </p>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors">
                  <input
                    type="radio"
                    name="payment_method"
                    value="pay_on_delivery"
                    checked={formData.payment_method === "pay_on_delivery"}
                    onChange={handleChange}
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Pay on Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay when you receive your order
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                    Recommended
                  </Badge>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors opacity-60">
                  <input
                    type="radio"
                    name="payment_method"
                    value="bank_transfer"
                    checked={formData.payment_method === "bank_transfer"}
                    onChange={handleChange}
                    disabled
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Bank Transfer</p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-secondary/10 transition-colors opacity-60">
                  <input
                    type="radio"
                    name="payment_method"
                    value="mobile_money"
                    checked={formData.payment_method === "mobile_money"}
                    onChange={handleChange}
                    disabled
                    className="w-4 h-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">Mobile Money</p>
                    <p className="text-xs text-muted-foreground">
                      Coming soon
                    </p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Secure checkout</span>
            </div>

            {/* Action Buttons */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Button
                type="submit"
                disabled={submitting || isOutOfStock}
                className="w-full h-12 text-base font-semibold"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : isOutOfStock ? (
                  "Out of Stock"
                ) : (
                  "Place Order"
                )}
              </Button>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5"
                />
                <Label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    terms and conditions
                  </Link>
                </Label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-500">{errors.terms}</p>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
