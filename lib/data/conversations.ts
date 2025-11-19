import { createBrowserClient } from "@supabase/ssr";

// Factory so callers can reuse a single browser client.
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function getCurrentUser(
  supabase: ReturnType<typeof getSupabaseBrowser>
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  userId: string
) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function getUserWithProfile(
  supabase: ReturnType<typeof getSupabaseBrowser>
) {
  const user = await getCurrentUser(supabase);
  if (!user) return { user: null, profile: null };
  const profile = await getProfile(supabase, user.id);
  return { user, profile };
}

export async function getUserConversations(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  userId: string
) {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  return data || [];
}

export async function getConversationOtherProfile(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversation: any,
  userId: string
) {
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

export async function getLastMessage(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversationId: string
) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(1);
  return data?.[0];
}

export async function getConversationListDetails(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  userId: string,
  conversations: any[]
) {
  // Parallel fetch for performance & fewer render cycles.
  const entries = await Promise.all(
    conversations.map(async (conv) => {
      const [otherProfile, lastMessage] = await Promise.all([
        getConversationOtherProfile(supabase, conv, userId),
        getLastMessage(supabase, conv.id),
      ]);
      return [conv.id, { otherProfile, lastMessage }] as const;
    })
  );
  return new Map(entries);
}

export async function getConversationsByRequestId(
  supabase: any,
  requestId: string
) {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("request_id", requestId);
  return data || [];
}

export async function getConversation(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversationId: string
) {
  const { data } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  return data;
}

export async function getConversationMessages(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversationId: string
) {
  const { data } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function getConversationFull(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversationId: string,
  userId: string
) {
  const conversation = await getConversation(supabase, conversationId);
  if (!conversation) return null;
  const [otherProfile, messages] = await Promise.all([
    getConversationOtherProfile(supabase, conversation, userId),
    getConversationMessages(supabase, conversationId),
  ]);
  return { conversation, otherProfile, messages };
}

export async function sendMessage(
  supabase: ReturnType<typeof getSupabaseBrowser>,
  conversationId: string,
  senderId: string,
  content: string
) {
  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: senderId,
    content,
  });
  if (error) throw error;
}
