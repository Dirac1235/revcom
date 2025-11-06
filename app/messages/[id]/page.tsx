"use client"

import { useState, useEffect, useRef } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { useRouter, useParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'
import DashboardNav from "@/components/dashboard-nav"
import Link from "next/link"

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const conversationId = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [conversation, setConversation] = useState<any>(null)
  const [messageText, setMessageText] = useState("")
  const [loading, setLoading] = useState(true)
  const [otherParticipant, setOtherParticipant] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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

      fetchConversation(user.id)
    }

    fetchData()
  }, [supabase, router])

  const fetchConversation = async (userId: string) => {
    setLoading(true)
    try {
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .single()

      if (!conv) return

      setConversation(conv)

      const otherParticipantId =
        conv.participant_1_id === userId ? conv.participant_2_id : conv.participant_1_id

      const { data: otherProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", otherParticipantId)
        .single()

      setOtherParticipant(otherProfile)

      const { data: msgs } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true })

      setMessages(msgs || [])
    } catch (error) {
      console.error("[v0] Error fetching conversation:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim()) return

    try {
      const { error } = await supabase.from("messages").insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText,
      })

      if (error) throw error

      setMessageText("")
      if (user) {
        fetchConversation(user.id)
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    }
  }

  if (!user || loading) return null

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} profile={profile} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Chat with {otherParticipant?.first_name || "User"}
            </h1>
            {conversation?.request_id && (
              <p className="text-sm text-muted-foreground">
                Discussing a buyer request
              </p>
            )}
          </div>
          <Link href="/messages">
            <Button variant="outline">Back to Messages</Button>
          </Link>
        </div>

        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto mb-4 space-y-4">
            {messages.length > 0 ? (
              messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</p>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </Card>
      </main>
    </div>
  )
}
