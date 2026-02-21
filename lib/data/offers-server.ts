"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOffersByRequest(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("request_id", requestId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getOffersBySeller(sellerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getOfferById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getOfferBySellerAndRequest(sellerId: string, requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", sellerId)
    .eq("request_id", requestId)
    .single();
  
  if (error) return null;
  return data;
}

export async function createOffer(payload: {
  seller_id: string;
  request_id: string;
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost?: number;
  payment_terms?: string;
  attachments?: string[];
  status?: string;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("offers")
    .insert({
      seller_id: payload.seller_id,
      request_id: payload.request_id,
      price: payload.price,
      description: payload.description,
      delivery_timeline: payload.delivery_timeline,
      delivery_cost: payload.delivery_cost || 0,
      payment_terms: payload.payment_terms || null,
      attachments: payload.attachments || null,
      status: payload.status || "pending",
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateOffer(id: string, updates: Partial<{
  price: number;
  description: string;
  delivery_timeline: string;
  delivery_cost: number;
  payment_terms: string;
  attachments: string[];
  status: string;
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update(updates)
    .eq("id", id);
  
  if (error) throw error;
}

export async function updateOfferStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .update({ status })
    .eq("id", id);
  
  if (error) throw error;
}

export async function deleteOffer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("offers")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}
