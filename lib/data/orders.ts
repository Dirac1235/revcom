export async function getBuyerOrders(supabase: any, buyerId: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getSellerOrders(supabase: any, sellerId: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getOrderById(supabase: any, id: string) {
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function updateOrderStatus(
  supabase: any,
  id: string,
  newStatus: string
) {
  const { error } = await supabase
    .from("orders")
    .update({ status: newStatus })
    .eq("id", id);
  if (error) throw error;
}
