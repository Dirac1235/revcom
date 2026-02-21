"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { createRequest } from "@/lib/data/requests"
import { getProfileById } from "@/lib/data/profiles"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

export default function CreateRequestPage() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    category: "Electronics",
    description: "",
    budget_min: "",
    budget_max: "",
    quantity: "1",
  })

  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)

      try {
        const profileData = await getProfileById(user.id)
        setProfile(profileData)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Shadcn Select doesn't use standard native events, so we handle it directly
  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createRequest({
        buyer_id: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        budget_min: Number.parseFloat(formData.budget_min),
        budget_max: Number.parseFloat(formData.budget_max),
        status: "open",
      })

      router.push("/buyer/requests")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating request:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    // Flexbox handles the vertical & horizontal centering perfectly
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2 pb-6 text-center sm:text-left">
          <CardTitle className="text-3xl font-bold text-foreground font-serif">
            Create a New Request
          </CardTitle>
          <CardDescription className="text-base">
            Tell sellers what you're looking for, set your budget, and get offers.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
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

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger id="category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe what you need, preferred specs, condition, etc."
                rows={5}
                className="resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="budget_min">Minimum Budget</Label>
                <Input
                  id="budget_min"
                  name="budget_min"
                  type="number"
                  step="0.01"
                  value={formData.budget_min}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget_max">Maximum Budget</Label>
                <Input
                  id="budget_max"
                  name="budget_max"
                  type="number"
                  step="0.01"
                  value={formData.budget_max}
                  onChange={handleChange}
                  placeholder="1000.00"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                required
                className="sm:w-1/2"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? "Creating..." : "Create Request"}
              </Button>
              <Link href="/buyer/requests" className="w-full sm:w-auto">
                <Button variant="outline" type="button" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}