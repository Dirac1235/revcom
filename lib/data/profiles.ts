import { createClient } from "@/lib/supabase/client";

export async function getProfileById(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar_url?: string;
  phone_number?: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  
  if (error) throw error;
}

export async function getProfileByEmail(email: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getCurrentUserProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  return getProfileById(user.id);
}
