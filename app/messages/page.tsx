"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  getSupabaseBrowser,
  getUserWithProfile,
  getUserConversations,
  getConversationListDetails,
} from "@/lib/data/conversations";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessagesSkeleton } from "@/components/skeletons/MessagesSkeleton";
import { ConversationView } from "@/components/ConversationView";
import { LoadingState } from "@/components/features/LoadingState";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationDetails, setConversationDetails] = useState<
    Map<string, any>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(searchParams.get("conversation"));

  const fetchConversations = useCallback(
    async (userId: string) => {
      const supabase = getSupabaseBrowser();
      setLoading(true);
      try {
        const convs = await getUserConversations(supabase, userId);
        setConversations(convs);
        const details = await getConversationListDetails(
          supabase,
          userId,
          convs
        );
        setConversationDetails(details);
      } catch (error) {
        console.error("[v0] Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = getSupabaseBrowser();
      const { user: u, profile: p } = await getUserWithProfile(supabase);
      if (!u) {
        router.push("/auth/login");
        return;
      }
      if (!active) return;
      setUser(u);
      setProfile(p);
      fetchConversations(u.id);
    })();
    return () => {
      active = false;
    };
  }, [router, fetchConversations]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedConversationId) {
      params.set("conversation", selectedConversationId);
    } else {
      params.delete("conversation");
    }
    const newUrl = `/messages${
      params.toString() ? `?${params.toString()}` : ""
    }`;
    router.replace(newUrl, { scroll: false });
  }, [selectedConversationId, router]);

  const handleConversationSelect = useCallback((conversationId: string) => {
    setSelectedConversationId(conversationId);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedConversationId(null);
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-start gap-6">
          <div
            className={`${
              selectedConversationId ? "hidden lg:block" : ""
            } w-full lg:w-1/3`}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-foreground" />
                <h2 className="text-xl font-serif font-bold text-foreground">Chats</h2>
              </div>
              <Link href="/messages/new">
                <Button size="sm" variant="outline" className="border-foreground/20 hover:bg-foreground hover:text-background">New</Button>
              </Link>
            </div>

            {loading ? (
              <MessagesSkeleton />
            ) : (
              <div className="bg-card border border-border rounded-lg divide-y divide-border overflow-hidden">
                {conversations.length > 0 ? (
                  conversations.map((conversation: any) => {
                    const details = conversationDetails.get(conversation.id);
                    const other = details?.otherProfile;
                    const lastMessage = details?.lastMessage;
                    const isSelected =
                      selectedConversationId === conversation.id;
                    return (
                      <div
                        key={conversation.id}
                        onClick={() =>
                          handleConversationSelect(conversation.id)
                        }
                        className={`block hover:bg-secondary/50 cursor-pointer transition-colors ${
                          isSelected ? "bg-secondary/50" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <div className="shrink-0">
                            <Avatar className="w-10 h-10 border border-border">
                              {other?.avatar_url ? (
                                <AvatarImage
                                  src={other.avatar_url}
                                  alt={other.first_name}
                                />
                              ) : (
                                <AvatarFallback className="bg-secondary text-secondary-foreground">
                                  {(other?.first_name || "U").slice(0, 1)}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium truncate text-sm text-foreground">
                                  {other?.first_name || "User"}{" "}
                                  {other?.last_name || ""}
                                </div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                  {lastMessage
                                    ? new Date(
                                        lastMessage.created_at
                                      ).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : ""}
                                </div>
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {lastMessage?.content || "No messages yet"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No conversations yet. Start a chat from a listing or
                    request.
                  </div>
                )}
              </div>
            )}
          </div>

          <div
            className={`${
              selectedConversationId ? "block" : "hidden lg:block"
            } lg:flex-1 h-[calc(100vh-12rem)]`}
          >
            {selectedConversationId ? (
              <ConversationView
                conversationId={selectedConversationId}
                user={user}
                onBack={handleBackToList}
              />
            ) : (
              <div className="h-full rounded-lg border border-dashed border-border bg-card/50 flex items-center justify-center">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-foreground">Select a chat</h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    Choose a conversation from the left to view messages.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingState count={1} type="card" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}
