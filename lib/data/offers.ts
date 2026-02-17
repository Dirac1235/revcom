import { createClient } from "@/lib/supabase/client";

export async function getSellerOffers(sellerId: string, limit: number = 5) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

export async function getOfferById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createOffer(payload: {
  seller_id: string;
  request_id: string;
  price: number;
  description?: string;
  status?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("offers")
    .insert(payload);
  
  if (error) throw error;
}

export async function updateOfferStatus(id: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status })
    .eq("id", id);
  
  if (error) throw error;
}
