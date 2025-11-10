"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createBrowserClient } from "@supabase/ssr"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import DashboardNav from "@/components/dashboard-nav"

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Services",
  "Other",
]

export default function EditRequestPage() {
  const router = useRouter()
  const params = useParams()
  const requestId = params.id as string

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    description: "",
    budget_min: "",
    budget_max: "",
    quantity: "1",
  })

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

      const { data: requestData } = await supabase.from("requests").select("*").eq("id", requestId).single()

      if (requestData) {
        setFormData({
          title: requestData.title,
          category: requestData.category,
          description: requestData.description,
          budget_min: requestData.budget_min,
          budget_max: requestData.budget_max,
          quantity: "1",
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [requestId, supabase, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from("requests")
        .update({
          title: formData.title,
          category: formData.category,
          description: formData.description,
          budget_min: Number.parseFloat(formData.budget_min),
          budget_max: Number.parseFloat(formData.budget_max),
        })
        .eq("id", requestId)

      if (error) throw error

      router.push("/buyer/requests")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating request:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen bg-background">

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Edit Request</h1>
          <p className="text-muted-foreground">Update your buyer request details</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>Update what you're looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">What are you looking for?</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., iPhone 13 Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe what you need"
                  rows={5}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="budget_min">Minimum Budget</Label>
                  <Input
                    id="budget_min"
                    name="budget_min"
                    type="number"
                    step="0.01"
                    value={formData.budget_min}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="budget_max">Maximum Budget</Label>
                  <Input
                    id="budget_max"
                    name="budget_max"
                    type="number"
                    step="0.01"
                    value={formData.budget_max}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Link href="/buyer/requests">
                  <Button variant="outline">Cancel</Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
