"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationView } from "@/components/ConversationView";
import { Search, PenSquare, ChevronLeft } from "lucide-react";

interface Conversation {
  id: string;
  participant_1_id: string;
  participant_2_id: string;
  listing_id: string | null;
  request_id: string | null;
  created_at: string;
  updated_at: string;
  participant1?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    rating: number;
  };
  participant2?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
    rating: number;
  };
}

function getInitials(first?: string | null, last?: string | null): string {
  return `${(first || "U")[0]}${last ? last[0] : ""}`.toUpperCase();
}

function ConversationRow({
  conversation,
  userId,
  isSelected,
  onSelect,
}: {
  conversation: Conversation;
  userId: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const other =
    conversation.participant_1_id === userId
      ? conversation.participant2
      : conversation.participant1;

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`
        w-full text-left flex items-center gap-4 px-5 py-4 
        transition-all duration-200 ease-out group
        ${
          isSelected
            ? "bg-primary/10 text-foreground border-l-2 border-l-primary"
            : "hover:bg-foreground/3 text-foreground border-l-2 border-l-transparent"
        }
      `}
    >
      <Avatar className="w-12 h-12">
        {other?.avatar_url ? (
          <AvatarImage
            src={other.avatar_url}
            alt={other.first_name || "User"}
            className="object-cover"
          />
        ) : (
          <AvatarFallback>
            {getInitials(other?.first_name, other?.last_name)}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">
          {other?.first_name || "User"} {other?.last_name || ""}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {conversation.request_id ? "Re: buyer request" : "Conversation"}
        </p>
      </div>
    </button>
  );
}

function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-foreground/5 to-foreground/2 border border-foreground/8 flex items-center justify-center mb-5 shadow-sm">
        <Search className="w-8 h-8 text-foreground/20" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground/80 mb-1.5">
        No conversations yet
      </h3>
      <p className="text-sm text-foreground/40 max-w-55 leading-relaxed">
        Start chatting with sellers or buyers from product listings and requests
      </p>
    </div>
  );
}

function SelectChatPlaceholder() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center px-8">
        <div className="w-24 h-24 rounded-4xl bg-linear-to-br from-foreground/5 to-foreground/2 border border-foreground/8 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Search className="w-10 h-10 text-foreground/15" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-2 tracking-tight">
          Your Messages
        </h3>
        <p className="text-sm text-foreground/40 max-w-60 leading-relaxed">
          Select a conversation from the list to view messages
        </p>
      </div>
    </div>
  );
}

export function MessagesClient({
  userId,
  initialConversations,
  selectedConversationId,
}: {
  userId: string;
  initialConversations: Conversation[];
  selectedConversationId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [search, setSearch] = useState("");
  // We already have all conversations from the server — no loading state needed.
  const loading = false;

  const selectedId =
    searchParams.get("conversation") || selectedConversationId || null;

  // Real-time subscription for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`messages-list-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        () => {
          supabase
            .from("conversations")
            .select(
              `
            *,
            participant1:profiles!participant_1_id(id, first_name, last_name, avatar_url, rating),
            participant2:profiles!participant_2_id(id, first_name, last_name, avatar_url, rating)
          `,
            )
            .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
            .order("updated_at", { ascending: false })
            .then(({ data }) => {
              if (data) setConversations(data);
            });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const other =
      conv.participant_1_id === userId ? conv.participant2 : conv.participant1;
    const name =
      `${other?.first_name || ""} ${other?.last_name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleSelect = (id: string) => {
    router.push(`/messages?conversation=${id}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        </div>
        <Link href="/messages/new">
          <Button size="sm" className="gap-2">
            <PenSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New chat</span>
          </Button>
        </Link>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-0 lg:gap-6">
        {/* LEFT: conversation list */}
        <div
          className={`
            ${selectedId ? "hidden lg:flex" : "flex"}
            flex-col w-full lg:w-96 shrink-0
          `}
        >
          <div className="flex flex-col rounded-xl border border-foreground/10 bg-card/80 overflow-hidden h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)]">
            {/* Search */}
            <div className="p-4 border-b border-foreground/5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30" />
                <input
                  type="text"
                  placeholder="Search conversations…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl bg-foreground/5 border border-foreground/10"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                <div className="divide-y divide-foreground/5">
                  {filteredConversations.map((conv) => (
                    <ConversationRow
                      key={conv.id}
                      conversation={conv}
                      userId={userId}
                      isSelected={selectedId === conv.id}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ) : (
                <EmptyConversations />
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: conversation view */}
        <div
          className={`
            ${selectedId ? "flex" : "hidden lg:flex"}
            flex-col flex-1 min-w-0
          `}
        >
          <div className="flex flex-col rounded-xl border border-foreground/10 bg-card/80 overflow-hidden h-[calc(100vh-12rem)] lg:h-[calc(100vh-14rem)]">
            {selectedId ? (
              <>
                {/* Mobile back header */}
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-foreground/5">
                  <button
                    onClick={() => router.push("/messages")}
                    className="flex items-center gap-1.5 text-sm font-medium text-foreground/60"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>
                </div>
                <ConversationView
                  conversationId={selectedId}
                  userId={userId}
                  onBack={() => router.push("/messages")}
                />
              </>
            ) : (
              <SelectChatPlaceholder />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
