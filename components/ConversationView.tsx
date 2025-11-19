import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  getSupabaseBrowser,
  getConversationFull,
  sendMessage,
} from "@/lib/data/conversations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConversationSkeleton } from "@/components/skeletons/ConversationSkeleton";

interface ConversationViewProps {
  conversationId: string;
  user: any;
  onBack?: () => void;
}

export function ConversationView({
  conversationId,
  user,
  onBack,
}: ConversationViewProps) {
  const supabase = useMemo(() => getSupabaseBrowser(), []);

  const [messages, setMessages] = useState<any[]>([]);
  const [conversation, setConversation] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const [otherParticipant, setOtherParticipant] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(
    async (userId: string) => {
      setLoading(true);
      try {
        const full = await getConversationFull(
          supabase,
          conversationId,
          userId
        );
        if (!full) return;
        setConversation(full.conversation);
        setOtherParticipant(full.otherProfile);
        setMessages(full.messages);
      } catch (error) {
        console.error("[v0] Error fetching conversation:", error);
      } finally {
        setLoading(false);
      }
    },
    [supabase, conversationId]
  );

  useEffect(() => {
    if (conversationId && user) {
      fetchConversation(user.id);
    }
  }, [conversationId, user, fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!messageText.trim()) return;
      try {
        await sendMessage(supabase, conversationId, user.id, messageText);
        setMessageText("");
        fetchConversation(user.id);
      } catch (error) {
        console.error("[v0] Error sending message:", error);
      }
    },
    [supabase, conversationId, messageText, user, fetchConversation]
  );

  return (
    <div className="h-[640px] flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            {otherParticipant?.avatar_url ? (
              <AvatarImage
                src={otherParticipant.avatar_url}
                alt={otherParticipant.first_name}
              />
            ) : (
              <AvatarFallback>
                {(otherParticipant?.first_name || "U").slice(0, 1)}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">
              {otherParticipant?.first_name || "User"}{" "}
              {otherParticipant?.last_name || ""}
            </h1>
            {conversation?.request_id && (
              <p className="text-sm text-muted-foreground">
                Discussing a buyer request
              </p>
            )}
          </div>
        </div>

        {onBack && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
          </div>
        )}
      </div>

      <Card className="flex-1 flex flex-col">
        <CardHeader className="sticky top-0 bg-background z-10 border-b">
          <CardTitle className="text-sm text-muted-foreground">
            Conversation
          </CardTitle>
        </CardHeader>

        <CardContent
          className="flex-1 overflow-y-auto p-4"
          id="messages-container"
        >
          {loading ? (
            <ConversationSkeleton />
          ) : messages.length > 0 ? (
            messages.map((message: any) => {
              const isMe = message.sender_id === user.id;
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-3 mb-3 ${
                    isMe ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* avatar for other participant */}
                  {!isMe && (
                    <div className="shrink-0">
                      <Avatar className="w-9 h-9">
                        {otherParticipant?.avatar_url ? (
                          <AvatarImage
                            src={otherParticipant.avatar_url}
                            alt={otherParticipant.first_name}
                          />
                        ) : (
                          <AvatarFallback>
                            {(otherParticipant?.first_name || "U").slice(0, 1)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] px-4 py-2 text-sm ${
                      isMe
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-br-none"
                        : "bg-muted text-muted-foreground rounded-2xl rounded-bl-none"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{message.content}</div>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>

                  {/* placeholder to keep spacing for my avatar if needed */}
                  {isMe && <div className="w-9" />}
                </div>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground py-10">
              No messages yet. Say hello!
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div className="border-t p-4 sticky bottom-0 bg-background">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Message"
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
