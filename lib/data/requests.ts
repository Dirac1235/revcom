export async function getOpenRequests(supabase: any) {
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBuyerRequests(supabase: any, buyerId: string) {
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("buyer_id", buyerId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getRequestById(supabase: any, id: string) {
  const { data } = await supabase
    .from("requests")
    .select("*")
    .eq("id", id)
    .single();
  return data;
}

export async function createRequest(supabase: any, payload: any) {
  const { error } = await supabase.from("requests").insert(payload);
  if (error) throw error; 
}

export async function updateRequest(supabase: any, id: string, update: any) {
  const { error } = await supabase.from("requests").update(update).eq("id", id);
  if (error) throw error;
}
