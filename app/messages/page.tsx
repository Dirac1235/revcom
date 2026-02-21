"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  AlertCircle,
  RotateCcw,
  Search,
  PenSquare,
  ChevronLeft,
  MoreVertical,
  Filter,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessagesSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { ConversationView } from "@/components/ConversationView";
import { LoadingState } from "@/components/features/LoadingState";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile, Conversation, Message } from "@/lib/types";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface MessageWithRead extends Message {
  read?: boolean;
}

interface ConversationDetails {
  otherProfile: Profile | null;
  lastMessage: MessageWithRead | null;
  unreadCount: number;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isThisYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (isThisYear) {
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  }
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "2-digit",
  });
}

function getInitials(first?: string | null, last?: string | null): string {
  return `${(first || "U")[0]}${last ? last[0] : ""}`.toUpperCase();
}

/* ─────────────────────────────────────────────
    Supabase helpers
───────────────────────────────────────────── */
const supabase = createClient();

async function getUserWithProfile(
  sb: typeof supabase
): Promise<{ user: User | null; profile: Profile | null }> {
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) return { user: null, profile: null };
  const { data: profile } = await sb
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  return { user, profile };
}

async function getUserConversations(
  sb: typeof supabase,
  userId: string
): Promise<Conversation[]> {
  const { data, error } = await sb
    .from("conversations")
    .select("*")
    .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

async function getConversationListDetails(
  sb: typeof supabase,
  userId: string,
  conversations: Conversation[]
): Promise<Map<string, ConversationDetails>> {
  const details = new Map<string, ConversationDetails>();
  await Promise.all(
    conversations.map(async (conv) => {
      const otherId =
        conv.participant_1_id === userId
          ? conv.participant_2_id
          : conv.participant_1_id;
      const [{ data: otherProfile }, { data: lastMessage }, { count }] =
        await Promise.all([
          sb.from("profiles").select("*").eq("id", otherId).single(),
          sb
            .from("messages")
            .select("*")
            .eq("conversation_id", conv.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single(),
          sb
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conv.id)
            .eq("read", false)
            .neq("sender_id", userId),
        ]);
      details.set(conv.id, {
        otherProfile,
        lastMessage,
        unreadCount: count || 0,
      });
    })
  );
  return details;
}

/* ─────────────────────────────────────────────
   Skeleton item with shimmer effect
───────────────────────────────────────────── */
function ConversationSkeleton() {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      <div className="w-12 h-12 rounded-full bg-foreground/5 shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between items-center">
          <div className="h-3.5 w-32 rounded-md bg-foreground/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
          </div>
          <div className="h-3 w-12 rounded-md bg-foreground/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
          </div>
        </div>
        <div className="h-3 w-48 rounded-md bg-foreground/5 relative overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-foreground/5 to-transparent animate-shimmer" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Enhanced Conversation row
───────────────────────────────────────────── */
interface ConversationRowProps {
  conversation: Conversation;
  details: ConversationDetails | undefined;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ConversationRow({
  conversation,
  details,
  isSelected,
  onSelect,
}: ConversationRowProps) {
  const other = details?.otherProfile;
  const lastMessage = details?.lastMessage;
  const unreadCount = details?.unreadCount || 0;
  const hasUnread = unreadCount > 0;

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`
        w-full text-left flex items-center gap-4 px-5 py-4 
        transition-all duration-200 ease-out group
        relative focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30
        ${isSelected
          ? "bg-primary/10 text-foreground border-l-2 border-l-primary"
          : "hover:bg-foreground/3 text-foreground border-l-2 border-l-transparent"
        }
      `}
    >
      {/* Active indicator bar - uses primary green */}
      <span 
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 w-0.75 rounded-r-full
          transition-all duration-300
          ${isSelected 
            ? "h-8 bg-primary" 
            : "h-0 group-hover:h-5 bg-primary/40"
          }
        `} 
      />

      {/* Avatar with online status indicator */}
      <div className="relative shrink-0">
        <Avatar 
          className={`
            w-12 h-12 transition-transform duration-200
            ${isSelected ? "scale-105" : "group-hover:scale-105"}
            ${isSelected ? "border-2 border-primary/30 ring-2 ring-primary/10" : "border-2 border-transparent"}
          `}
        >
          {other?.avatar_url ? (
            <AvatarImage 
              src={other.avatar_url} 
              alt={other.first_name || "User"}
              className="object-cover"
            />
          ) : (
            <AvatarFallback
              className={`
                text-sm font-semibold tracking-tight
                ${isSelected 
                  ? "bg-primary/20 text-primary" 
                  : "bg-linear-to-br from-foreground/10 to-foreground/5 text-foreground"
                }
              `}
            >
              {getInitials(other?.first_name, other?.last_name)}
            </AvatarFallback>
          )}
        </Avatar>
        
        {/* Unread badge */}
        {hasUnread && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 border-2 border-card animate-in zoom-in duration-200">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span 
            className={`
              text-sm truncate transition-all duration-200
              ${hasUnread && !isSelected ? "font-semibold" : "font-medium"}
            `}
          >
            {other?.first_name || "User"} {other?.last_name || ""}
          </span>
          {lastMessage && (
            <span 
              className={`
                text-[11px] shrink-0 tabular-nums transition-colors duration-200
                ${isSelected ? "text-primary/60" : "text-foreground/35"}
              `}
            >
              {formatTimestamp(lastMessage.created_at)}
            </span>
          )}
        </div>
        <p 
          className={`
            text-sm truncate transition-all duration-200 leading-relaxed
            ${hasUnread && !isSelected
              ? "text-foreground font-medium"
              : isSelected
              ? "text-foreground/70"
              : "text-foreground/45"
            }
          `}
        >
          {lastMessage?.content || (
            <span className="italic opacity-50">No messages yet</span>
          )}
        </p>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────
   Empty state with illustration
───────────────────────────────────────────── */
function EmptyConversations() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-linear-to-br from-foreground/5 to-foreground/2 border border-foreground/8 flex items-center justify-center mb-5 shadow-sm">
        <MessageSquare className="w-8 h-8 text-foreground/20" strokeWidth={1.5} />
      </div>
      <h3 className="text-base font-semibold text-foreground/80 mb-1.5">No conversations yet</h3>
      <p className="text-sm text-foreground/40 max-w-55 leading-relaxed">
        Start chatting with sellers or buyers from product listings and requests
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Error state
───────────────────────────────────────────── */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/5 border border-red-500/10 flex items-center justify-center mb-5">
        <AlertCircle className="w-6 h-6 text-red-500/60" />
      </div>
      <h3 className="text-sm font-medium text-foreground/70 mb-2">Something went wrong</h3>
      <p className="text-xs text-foreground/40 mb-6 leading-relaxed max-w-60">{message}</p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="gap-2 text-xs"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        Try Again
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Select chat placeholder
───────────────────────────────────────────── */
function SelectChatPlaceholder() {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center px-8">
        <div className="w-24 h-24 rounded-4xl bg-linear-to-br from-foreground/5 to-foreground/2 border border-foreground/8 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <MessageSquare className="w-10 h-10 text-foreground/15" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground/80 mb-2 tracking-tight">
          Your Messages
        </h3>
        <p className="text-sm text-foreground/40 max-w-60 leading-relaxed">
          Select a conversation from the list to view messages and continue chatting
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main content
───────────────────────────────────────────── */
function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isInitialized = useRef(false);
  const userIdRef = useRef<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationDetails, setConversationDetails] = useState<Map<string, ConversationDetails>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get("conversation")
  );

  const fetchConversations = useCallback(async (uid: string, force = false) => {
    if (!force && userIdRef.current === uid) return;
    setLoading(true);
    setError(null);
    try {
      const convs = await getUserConversations(supabase, uid);
      setConversations(convs);
      const details = await getConversationListDetails(supabase, uid, convs);
      setConversationDetails(details);
      userIdRef.current = uid;
    } catch {
      setError("Failed to load conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedRefresh = useCallback((uid: string) => {
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    refreshTimeoutRef.current = setTimeout(() => fetchConversations(uid, true), 500);
  }, [fetchConversations]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    let active = true;
    (async () => {
      try {
        const { user: u } = await getUserWithProfile(supabase);
        if (!active) return;
        if (!u) { router.push("/auth/login"); return; }
        setUser(u);
        await fetchConversations(u.id);
      } catch {
        if (active) setError("Failed to initialize.");
      }
    })();
    return () => {
      active = false;
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current);
    };
  }, [router, fetchConversations]);

  useEffect(() => {
    if (!user?.id) return;
    const uid = user.id;
    const msgSub = supabase
      .channel(`msgs-${uid}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => debouncedRefresh(uid))
      .subscribe();
    const convSub = supabase
      .channel(`convs-${uid}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversations" }, () => debouncedRefresh(uid))
      .subscribe();
    return () => { msgSub.unsubscribe(); convSub.unsubscribe(); };
  }, [user?.id, debouncedRefresh]);

  useEffect(() => {
    const param = searchParams.get("conversation");
    if (param === selectedConversationId) return;
    const params = new URLSearchParams(searchParams.toString());
    if (selectedConversationId) params.set("conversation", selectedConversationId);
    else params.delete("conversation");
    router.replace(`/messages${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }, [selectedConversationId, router, searchParams]);

  const handleRetry = useCallback(() => {
    if (user?.id) fetchConversations(user.id, true);
  }, [user?.id, fetchConversations]);

  // Filtered conversations
  const filteredConversations = conversations.filter((conv) => {
    if (!search.trim()) return true;
    const details = conversationDetails.get(conv.id);
    const other = details?.otherProfile;
    const name = `${other?.first_name || ""} ${other?.last_name || ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, conv) => {
    return sum + (conversationDetails.get(conv.id)?.unreadCount || 0);
  }, 0);

  if (!user && !loading && !error) return null;

  return (
    <div className="min-h-screen bg-background py-4">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-8">

        {/* ── Page header ── */}
        <div className="flex items-center justify-between mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <div className="lg:hidden">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Messages</h1>
            </div>
            <div className="hidden lg:flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-foreground/10 to-foreground/5 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-foreground/70" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Messages</h1>
                {totalUnread > 0 && (
                  <p className="text-xs text-foreground/50">
                    {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/messages/new">
              <Button 
                size="sm" 
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10"
              >
                <PenSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New chat</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-0 lg:gap-6">

          {/* ── LEFT: conversation list ── */}
          <div
            className={`
              ${selectedConversationId ? "hidden lg:flex" : "flex"}
              flex-col w-full lg:w-95 xl:w-105 shrink-0
            `}
          >
            {/* Panel with glass effect */}
            <div className="flex flex-col rounded-2xl border border-foreground/10 bg-card/80 backdrop-blur-xl overflow-hidden h-[calc(100vh-8rem)] lg:h-[calc(100vh-11rem)] shadow-xl shadow-foreground/5">

              {/* Panel header */}
              <div className="px-5 pt-5 pb-4 border-b border-foreground/5 bg-linear-to-b from-foreground/2 to-transparent">
                {/* Search */}
                <div className="relative group">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/30 group-focus-within:text-foreground/50 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search conversations…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="
                      w-full pl-10 pr-10 py-2.5 text-sm rounded-xl
                      bg-foreground/3 border border-foreground/8
                      text-foreground placeholder:text-foreground/30
                      focus:outline-none focus:ring-2 focus:ring-foreground/15
                      focus:bg-foreground/5 focus:border-foreground/15
                      transition-all duration-200
                    "
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/40 hover:bg-foreground/20 hover:text-foreground/60 transition-all"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Filter tabs */}
                <div className="flex items-center gap-1 mt-3">
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary text-primary-foreground transition-colors">
                    All
                  </button>
                  <button className="px-3 py-1.5 text-xs font-medium rounded-lg text-foreground/60 hover:bg-foreground/5 hover:text-foreground transition-colors">
                    Unread {totalUnread > 0 && `(${totalUnread})`}
                  </button>
                </div>
              </div>

              {/* Conversation list */}
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="divide-y divide-foreground/5">
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                    <ConversationSkeleton />
                  </div>
                ) : error ? (
                  <ErrorState message={error} onRetry={handleRetry} />
                ) : filteredConversations.length > 0 ? (
                  <div className="divide-y divide-foreground/6">
                    {filteredConversations.map((conv) => (
                      <ConversationRow
                        key={conv.id}
                        conversation={conv}
                        details={conversationDetails.get(conv.id)}
                        isSelected={selectedConversationId === conv.id}
                        onSelect={setSelectedConversationId}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyConversations />
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: conversation view ── */}
          <div
            className={`
              ${selectedConversationId ? "flex" : "hidden lg:flex"}
              flex-col flex-1 min-w-0
            `}
          >
            <div className="flex flex-col rounded-2xl border border-foreground/10 bg-card/80 backdrop-blur-xl overflow-hidden h-[calc(100vh-8rem)] lg:h-[calc(100vh-11rem)] shadow-xl shadow-foreground/5">
              {selectedConversationId ? (
                <>
                  {/* Mobile back header */}
                  <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-foreground/5 bg-linear-to-b from-foreground/2 to-transparent">
                    <button
                      onClick={() => setSelectedConversationId(null)}
                      className="flex items-center gap-1.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors px-2 py-1.5 -ml-2 rounded-lg hover:bg-foreground/5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  </div>
                  <ConversationView
                    conversationId={selectedConversationId}
                    user={user}
                    onBack={() => setSelectedConversationId(null)}
                  />
                </>
              ) : (
                <SelectChatPlaceholder />
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Page export
───────────────────────────────────────────── */
export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <LoadingState count={1} type="card" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
