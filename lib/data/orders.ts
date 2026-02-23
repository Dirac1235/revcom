import { createClient } from "@/lib/supabase/client";

export async function getBuyerOrders(buyerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getSellerOrders(sellerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getOrderById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateOrderStatus(id: string, newStatus: string) {
  const supabase = createClient();
  
  // First get the order to know who to notify
  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  
  if (fetchError) throw fetchError;
  if (!order) throw new Error("Order not found");

  // Update the order status
  const { error: updateError } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id);
  
  if (updateError) throw updateError;

  // Create notification for the buyer
  if (order.buyer_id) {
    const statusMessages: Record<string, { title: string; message: string }> = {
      accepted: {
        title: "Order Accepted",
        message: `Your order "${order.title}" has been accepted by the seller.`,
      },
      shipped: {
        title: "Order Shipped",
        message: `Your order "${order.title}" has been shipped.`,
      },
      delivered: {
        title: "Order Delivered",
        message: `Your order "${order.title}" has been delivered.`,
      },
      cancelled: {
        title: "Order Cancelled",
        message: `Your order "${order.title}" has been cancelled.`,
      },
      pending: {
        title: "Order Status Updated",
        message: `Your order "${order.title}" status has been updated to pending.`,
      },
    };

    const notification = statusMessages[newStatus] || {
      title: "Order Status Updated",
      message: `Your order "${order.title}" status has been updated to ${newStatus}.`,
    };

    await supabase.from("notifications").insert({
      user_id: order.buyer_id,
      type: "order_status_updated",
      title: notification.title,
      message: notification.message,
      link: `/buyer/orders/${id}`,
    });
  }

  return order;
}

export async function createOrder(payload: {
  buyer_id: string;
  seller_id: string;
  request_id?: string;
  listing_id?: string;
  title: string;
  description?: string;
  quantity: number;
  agreed_price: number;
  delivery_location?: string;
  delivery_phone?: string;
  delivery_notes?: string;
  order_notes?: string;
  payment_method?: string;
  status?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .insert(payload);
  
  if (error) throw error;
}
