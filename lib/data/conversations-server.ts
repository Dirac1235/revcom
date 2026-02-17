"use server";

import { createClient } from "@/lib/supabase/server";

export async function getConversationsByRequestId(requestId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("request_id", requestId);
  
  if (error) throw error;
  return data || [];
}
