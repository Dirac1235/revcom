"use server";

import { createClient } from "@/lib/supabase/server";

export async function getBuyerOrders(buyerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getSellerOrders(sellerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, newStatus: string) {
  const supabase = await createClient();
  const { error, data: order } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id)
    .select("buyer_id, title")
    .single();

  if (error) throw error;

  // Notify buyer about the status update
  if (order) {
    let message = `Your order for "${order.title}" has been updated to ${newStatus}`;
    if (newStatus === "shipped") {
      message = `Great news! Your order "${order.title}" has been shipped.`;
    } else if (newStatus === "delivered") {
      message = `Your order "${order.title}" has been delivered!`;
    }

    await supabase.from("notifications").insert({
      user_id: order.buyer_id,
      type: "order_status_updated",
      title: "Order Update",
      message: message,
      link: `/buyer/orders/${id}`,
    });
  }
}

export async function createOrder(payload: {
  buyer_id: string;
  seller_id: string;
  request_id?: string;
  title: string;
  description?: string;
  quantity: number;
  agreed_price: number;
  delivery_location?: string;
  status?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").insert(payload);

  if (error) throw error;
}
