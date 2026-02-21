import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessagesClient } from "./MessagesClient";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const { conversation: selectedConversationId } = await searchParams;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch conversations on server
  const { data: conversations } = await supabase
    .from("conversations")
    .select(`
      *,
      participant1:profiles!participant_1_id(id, first_name, last_name, avatar_url, rating),
      participant2:profiles!participant_2_id(id, first_name, last_name, avatar_url, rating)
    `)
    .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="min-h-screen bg-background py-4">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-8">
        <MessagesClient 
          userId={user.id}
          initialConversations={conversations || []}
          selectedConversationId={selectedConversationId}
        />
      </main>
    </div>
  );
}
