"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  getSupabaseBrowser,
  getConversationFull,
  sendMessageLegacy,
} from "@/lib/data/conversations";
import { Send, ChevronLeft, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@supabase/supabase-js";
import type { Profile, Message, Conversation } from "@/lib/types";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ConversationFull {
  conversation: Conversation;
  otherProfile: Profile | null;
  messages: Message[];
}

interface ConversationViewProps {
  conversationId: string;
  user: User | null;
  onBack?: () => void;
}

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const isYesterday =
    new Date(now.setDate(now.getDate() - 1)).toDateString() ===
    date.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/** Group messages by calendar day */
function groupMessagesByDay(messages: Message[]): Array<{
  label: string;
  messages: Message[];
}> {
  const groups: Array<{ label: string; messages: Message[] }> = [];
  let currentDay = "";

  for (const msg of messages) {
    const day = new Date(msg.created_at).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      groups.push({ label: formatDateDivider(msg.created_at), messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  }

  return groups;
}

function getInitials(first?: string | null, last?: string | null): string {
  return `${(first || "U")[0]}${last ? last[0] : ""}`.toUpperCase();
}

/* ─────────────────────────────────────────────
   Skeleton
───────────────────────────────────────────── */
function MessageSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-5 py-4 animate-pulse">
      {/* Theirs */}
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-foreground/8 shrink-0" />
        <div className="flex flex-col gap-1.5">
          <div className="h-10 w-48 rounded-2xl rounded-bl-sm bg-foreground/8" />
        </div>
      </div>
      {/* Mine */}
      <div className="flex items-end justify-end">
        <div className="h-10 w-36 rounded-2xl rounded-br-sm bg-foreground/8" />
      </div>
      {/* Theirs */}
      <div className="flex items-end gap-2">
        <div className="w-8 h-8 rounded-full bg-foreground/8 shrink-0" />
        <div className="h-14 w-56 rounded-2xl rounded-bl-sm bg-foreground/8" />
      </div>
      {/* Mine */}
      <div className="flex items-end justify-end">
        <div className="h-10 w-44 rounded-2xl rounded-br-sm bg-foreground/8" />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Date divider
───────────────────────────────────────────── */
function DateDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-2 px-5">
      <div className="flex-1 h-px bg-foreground/8" />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-foreground/30">
        {label}
      </span>
      <div className="flex-1 h-px bg-foreground/8" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Message bubble
───────────────────────────────────────────── */
interface BubbleProps {
  message: Message;
  isMe: boolean;
  otherParticipant: Profile | null;
  showAvatar: boolean; // only show on last message in a run
}

function MessageBubble({ message, isMe, otherParticipant, showAvatar }: BubbleProps) {
  return (
    <div
      className={`flex items-end gap-2 px-5 ${isMe ? "justify-end" : "justify-start"}`}
    >
      {/* Avatar — theirs, placeholder to preserve alignment */}
      {!isMe && (
        <div className="w-7 h-7 shrink-0 mb-0.5">
          {showAvatar ? (
            <Avatar className="w-7 h-7 border border-foreground/10">
              {otherParticipant?.avatar_url ? (
                <AvatarImage
                  src={otherParticipant.avatar_url}
                  alt={otherParticipant.first_name || "User"}
                />
              ) : (
                <AvatarFallback className="text-[10px] font-bold bg-foreground/8 text-foreground">
                  {getInitials(otherParticipant?.first_name, otherParticipant?.last_name)}
                </AvatarFallback>
              )}
            </Avatar>
          ) : null}
        </div>
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-0.5 max-w-[68%] ${isMe ? "items-end" : "items-start"}`}>
        <div
          className={`
            px-3.5 py-2.5 text-[13.5px] leading-relaxed whitespace-pre-wrap wrap-break-word shadow-sm
            ${isMe
              ? "bg-primary text-primary-foreground rounded-2xl rounded-br-[5px]"
              : "bg-secondary text-secondary-foreground rounded-2xl rounded-bl-[5px] border border-foreground/5"
            }
          `}
        >
          {message.content}
        </div>
        <span className={`text-[10px] px-1 tabular-nums ${isMe ? "text-primary/50" : "text-foreground/30"}`}>
          {formatTime(message.created_at)}
        </span>
      </div>

      {/* Spacer — mine side */}
      {isMe && <div className="w-0" />}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Empty state
───────────────────────────────────────────── */
function EmptyMessages({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 text-center px-6">
      <div className="w-12 h-12 rounded-2xl bg-foreground/5 border border-foreground/8 flex items-center justify-center text-lg font-bold text-foreground/25">
        {name[0]}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground/70">
          Start the conversation
        </p>
        <p className="text-xs text-foreground/35 mt-1">
          Send a message to {name}
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export function ConversationView({
  conversationId,
  user,
  onBack,
}: ConversationViewProps) {
  const supabase = useMemo(() => getSupabaseBrowser(), []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [otherParticipant, setOtherParticipant] = useState<Profile | null>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ── Fetch ── */
  const fetchConversation = useCallback(
    async (userId: string) => {
      try {
        const full: ConversationFull | null = await getConversationFull(
          supabase,
          conversationId,
          userId
        );
        if (!full) return;
        setConversation(full.conversation);
        setOtherParticipant(full.otherProfile);
        setMessages(full.messages);
      } catch (err) {
        console.error("[ConversationView] Fetch error:", err);
      } finally {
        setLoading(false);
      }
    },
    [supabase, conversationId]
  );

  useEffect(() => {
    if (conversationId && user) {
      setLoading(true);
      fetchConversation(user.id);
    }
  }, [conversationId, user, fetchConversation]);

  /* ── Real-time subscription ── */
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`conv-view-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          // Optimistically append the new message
          setMessages((prev) => {
            const exists = prev.some((m) => m.id === payload.new.id);
            if (exists) return prev;
            return [...prev, payload.new as Message];
          });
        }
      )
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [supabase, conversationId, user?.id]);

  /* ── Auto-scroll ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Auto-resize textarea ── */
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  /* ── Send ── */
  const handleSend = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!messageText.trim() || !user || sending) return;

      const text = messageText.trim();
      setSending(true);
      setMessageText("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      try {
        await sendMessageLegacy(supabase, conversationId, user.id, text);
        // Real-time subscription will append — no manual refetch needed
      } catch (err) {
        console.error("[ConversationView] Send error:", err);
        setMessageText(text); // restore on failure
      } finally {
        setSending(false);
        textareaRef.current?.focus();
      }
    },
    [supabase, conversationId, messageText, user, sending]
  );

  /* ── Send on Enter (Shift+Enter = newline) ── */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Grouped messages ── */
  const messageGroups = useMemo(() => groupMessagesByDay(messages), [messages]);

  const otherName = otherParticipant
    ? `${otherParticipant.first_name || "User"} ${otherParticipant.last_name || ""}`.trim()
    : "User";

  /* ─────────────────────────────────────────────
     Render
  ───────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-foreground/8 shrink-0">
        {/* Back button (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="
              lg:hidden w-8 h-8 -ml-1 rounded-xl flex items-center justify-center
              text-foreground/50 hover:text-foreground hover:bg-foreground/5
              transition-colors shrink-0
            "
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Avatar */}
        <Avatar className="w-9 h-9 border border-foreground/10 shrink-0">
          {otherParticipant?.avatar_url ? (
            <AvatarImage
              src={otherParticipant.avatar_url}
              alt={otherName}
            />
          ) : (
            <AvatarFallback className="text-xs font-bold bg-foreground/8 text-foreground">
              {getInitials(otherParticipant?.first_name, otherParticipant?.last_name)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Name + context */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate leading-tight">
            {otherName}
          </p>
          {conversation?.request_id && (
            <p className="text-[11px] text-foreground/40 leading-tight mt-0.5">
              Re: buyer request
            </p>
          )}
        </div>

        {/* Actions */}
        <button
          className="
            w-8 h-8 rounded-xl flex items-center justify-center
            text-foreground/35 hover:text-foreground hover:bg-foreground/5
            transition-colors shrink-0
          "
          aria-label="More options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* ── Message area ── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,.1) transparent" }}
      >
        {loading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <EmptyMessages name={otherName} />
        ) : (
          messageGroups.map((group, gi) => (
            <div key={gi} className="flex flex-col gap-1">
              <DateDivider label={group.label} />
              {group.messages.map((msg, mi) => {
                const isMe = msg.sender_id === user?.id;
                // Show avatar only on the last message in a consecutive run from same sender
                const nextMsg = group.messages[mi + 1];
                const isLastInRun =
                  !nextMsg || nextMsg.sender_id !== msg.sender_id;
                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isMe={isMe}
                    otherParticipant={otherParticipant}
                    showAvatar={!isMe && isLastInRun}
                  />
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 px-4 py-3 border-t border-foreground/8">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={messageText}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Message…"
            rows={1}
            className="
              flex-1 resize-none px-3.5 py-2.5 rounded-2xl
              bg-foreground/5 border border-foreground/10
              text-sm text-foreground placeholder:text-foreground/30
              focus:outline-none focus:ring-2 focus:ring-foreground/15
              transition-all leading-relaxed
              min-h-10.5 max-h-30
            "
            style={{ height: "42px" }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!messageText.trim() || sending}
            className="
              w-10 h-10 rounded-2xl shrink-0
              bg-primary text-primary-foreground
              flex items-center justify-center
              disabled:opacity-30 disabled:cursor-not-allowed
              hover:bg-primary/90 active:scale-95
              transition-all duration-100 shadow-md shadow-primary/20
            "
            aria-label="Send message"
          >
            {sending ? (
              <span className="w-3.5 h-3.5 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-foreground/25 mt-1.5 pl-1">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}