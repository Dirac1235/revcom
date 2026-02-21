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

export async function getConversationsByUserId(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      *,
      participant1:profiles!participant_1_id(id, first_name, last_name, avatar_url, rating),
      participant2:profiles!participant_2_id(id, first_name, last_name, avatar_url, rating)
    `,
    )
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getConversationById(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) throw error;
  return data;
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getConversationWithMessages(
  conversationId: string,
  userId: string,
) {
  const supabase = await createClient();

  // Get conversation
  const { data: conversation, error: convError } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (convError || !conversation) return null;

  // Determine other participant
  const otherId =
    conversation.participant_1_id === userId
      ? conversation.participant_2_id
      : conversation.participant_1_id;

  // Get other profile
  const { data: otherProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherId)
    .single();

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return {
    conversation,
    otherProfile,
    messages: messages || [],
  };
}

export async function sendMessageServer(payload: {
  conversation_id: string;
  sender_id: string;
  content: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("messages").insert(payload);
  if (error) throw error;
}

export async function markMessagesAsReadServer(
  conversationId: string,
  userId: string,
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);
  if (error) throw error;
}
