"use server";

import { createClient } from "@/lib/supabase/server";

export async function getOpenRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getBuyerRequests(buyerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getRequestById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createRequest(payload: {
  buyer_id: string;
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  status?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .insert(payload);
  
  if (error) throw error;
}

export async function updateRequest(id: string, update: Partial<{
  title: string;
  description: string;
  category: string;
  budget_min: number;
  budget_max: number;
  status: string;
}>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .update(update)
    .eq("id", id);
  
  if (error) throw error;
}

export async function deleteRequest(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("requests")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
}

export async function getRequestsCount(filters?: { status?: string }) {
  const supabase = await createClient();
  let query = supabase.from("requests").select("id", { count: "exact", head: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}
