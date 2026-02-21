"use server";

import { createClient } from "@/lib/supabase/server";

export async function getListings(filters?: {
  sellerId?: string;
  category?: string;
  status?: string;
  search?: string;
  limit?: number;
}) {
  const supabase = await createClient();
  let query = supabase.from("listings").select("*");

  if (filters?.sellerId) {
    query = query.eq("seller_id", filters.sellerId);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  query = query.order("created_at", { ascending: false });

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  return data || [];
}

export async function getListingById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createListing(payload: {
  seller_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  inventory_quantity?: number;
  status?: string;
  image_url?: string;
  images?: string[];
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .insert(payload);
  
  if (error) throw error;
}

export async function updateListing(id: string, updates: Partial<{
  title: string;
  description: string;
  category: string;
  price: number;
  inventory_quantity: number;
  status: string;
  image_url: string;
  images: string[];
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .update(updates)
    .eq("id", id);
  
  if (error) throw error;
}

export async function deleteListing(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function getListingsCount(filters?: { status?: string }) {
  const supabase = await createClient();
  let query = supabase.from("listings").select("id", { count: "exact", head: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}
