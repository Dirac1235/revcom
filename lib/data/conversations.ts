import { createClient } from "@/lib/supabase/client";

// Re-export createClient for components that need the supabase instance
export { createClient as getSupabaseBrowser };

export async function getUserWithProfile(supabase?: any) {
  const client = supabase || createClient();
  const { data: { user } } = await client.auth.getUser();
  if (!user) return { user: null, profile: null };
  
  const { data: profile } = await client
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
    
  return { user, profile };
}

export async function getConversations(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  
  if (error) throw error;
  return data || [];
}

export async function getConversationById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function createConversation(
  participant1Id: string, 
  participant2Id: string,
  listingId?: string,
  requestId?: string
) {
  const supabase = createClient();
  
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .or(`and(participant_1_id.eq.${participant1Id},participant_2_id.eq.${participant2Id}),and(participant_1_id.eq.${participant2Id},participant_2_id.eq.${participant1Id})`)
    .single();

  if (existing) {
    if (listingId && !existing.listing_id) {
      await supabase
        .from("conversations")
        .update({ listing_id: listingId })
        .eq("id", existing.id);
    }
    return existing;
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      participant_1_id: participant1Id,
      participant_2_id: participant2Id,
      listing_id: listingId || null,
      request_id: requestId || null,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  
  if (error) throw error;
  return data || [];
}

export async function sendMessage(payload: {
  conversation_id: string;
  sender_id: string;
  content: string;
}) {
  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .insert(payload);
  
  if (error) throw error;
}

export async function markMessagesAsRead(conversationId: string, userId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("conversation_id", conversationId)
    .neq("sender_id", userId);
  
  if (error) throw error;
}

// Legacy exports for backwards compatibility - these accept supabase as parameter
export async function getUserConversations(supabase: any, userId: string) {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  return data || [];
}

export async function getConversationOtherProfile(supabase: any, conversation: any, userId: string) {
  const otherParticipantId =
    conversation.participant_1_id === userId
      ? conversation.participant_2_id
      : conversation.participant_1_id;
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherParticipantId)
    .single();
  return data;
}

export async function getLastMessage(supabase: any, conversationId: string) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0];
}

export async function getConversationMessages(supabase: any, conversationId: string) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function getConversationFull(supabase: any, conversationId: string, userId: string) {
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (!conversation) return null;
  
  const otherParticipantId =
    conversation.participant_1_id === userId
      ? conversation.participant_2_id
      : conversation.participant_1_id;
      
  const [{ data: otherProfile }, { data: messages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", otherParticipantId).single(),
    supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true }),
  ]);
  
  return { conversation, otherProfile, messages };
}

export async function getConversationListDetails(
  supabase: any,
  userId: string,
  conversations: any[]
) {
  const details = new Map();
  
  await Promise.all(
    conversations.map(async (conv) => {
      const otherParticipantId =
        conv.participant_1_id === userId
          ? conv.participant_2_id
          : conv.participant_1_id;
      
      const [{ data: otherProfile }, { data: lastMessage }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", otherParticipantId).single(),
        supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single(),
      ]);
      
      details.set(conv.id, { otherProfile, lastMessage });
    })
  );
  
  return details;
}

// Legacy sendMessage that accepts individual parameters
export async function sendMessageLegacy(
  supabase: any,
  conversationId: string,
  senderId: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content: content,
  });
  
  if (error) throw error;
}
