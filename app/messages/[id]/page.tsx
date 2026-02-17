"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { getConversationById, getMessages, sendMessage } from "@/lib/data/conversations";
import { getProfileById } from "@/lib/data/profiles";

export default function ConversationPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }
      setUser(user);

      // Redirect to main messages page with conversation selected
      router.replace(`/messages?conversation=${conversationId}`);
    };

    fetchData();
  }, [router, conversationId]);

  const fetchConversation = async (userId: string) => {
    setLoading(true);
    try {
      const conv = await getConversationById(conversationId);

      if (!conv) return;

      setConversation(conv);

      const otherParticipantId =
        conv.participant_1_id === userId
          ? conv.participant_2_id
          : conv.participant_1_id;

      const otherProfile = await getProfileById(otherParticipantId);
      setOtherParticipant(otherProfile);

      const msgs = await getMessages(conversationId);
      setMessages(msgs || []);
    } catch (error) {
      console.error("[v0] Error fetching conversation:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    try {
      await sendMessage({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText,
      });

      setMessageText("");
      fetchConversation(user.id);
    } catch (error) {
      console.error("[v0] Error sending message:", error);
    }
  };

  if (!user) return null;

  // This page redirects to the main messages page
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Redirecting to messages...</p>
      </div>
    </div>
  );
}
