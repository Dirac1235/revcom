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
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id);
  
  if (error) throw error;
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
