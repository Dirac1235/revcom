"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageSquare } from 'lucide-react'
import DashboardNav from "@/components/dashboard-nav"

export default function MessagesPage() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [conversationDetails, setConversationDetails] = useState<Map<string, any>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      setProfile(profileData)

      fetchConversations(user.id)
    }

    fetchData()
  }, [supabase, router])

  const fetchConversations = async (userId: string) => {
    setLoading(true)
    try {
      const { data: convs } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
        .order("updated_at", { ascending: false })

      setConversations(convs || [])

      const details = new Map()
      for (const conv of convs || []) {
        const otherParticipantId =
          conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id

        const { data: otherProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", otherParticipantId)
          .single()

        const { data: lastMessage } = await supabase
          .from("messages")
          .select("*")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1)

        details.set(conv.id, {
          otherProfile,
          lastMessage: lastMessage?.[0],
        })
      }
      setConversationDetails(details)
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <MessageSquare className="w-8 h-8" />
            Messages
          </h1>
          <p className="text-muted-foreground">Your conversations with buyers and sellers</p>
        </div>

        <div className="grid gap-4 max-w-3xl">
          {conversations.length > 0 ? (
            conversations.map((conversation: any) => {
              const details = conversationDetails.get(conversation.id)
              return (
                <Link key={conversation.id} href={`/messages/${conversation.id}`}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>
                            {details?.otherProfile?.first_name || "User"}
                          </CardTitle>
                          <CardDescription>
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {details?.lastMessage?.content || "No messages yet"}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground">No conversations yet. Start by browsing listings or requests!</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
