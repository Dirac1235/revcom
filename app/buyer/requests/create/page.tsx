"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { useAuth } from "@/components/providers/AuthProvider"
import { createRequest } from "@/lib/data/requests"
import { getProfileById } from "@/lib/data/profiles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Loader2,
  Wallet,
  MapPin,
  ChevronRight,
  ArrowLeft,
  Zap,
  CheckCircle,
} from "lucide-react"

// ─── Data ────────────────────────────────────────────────────────────────────

const categories = [
  "Construction Materials",
  "Textiles & Fabrics",
  "Electronics & Tech",
  "Agriculture & Food",
  "Industrial Equipment",
  "Logistics & Services",
  "Packaging & Supplies",
  "Office Supplies",
  "Other",
]

const locations = [
  "Addis Ababa",
  "Dire Dawa",
  "Mekelle",
  "Gondar",
  "Bahir Dar",
  "Other",
]

const deadlineOptions = [
  { value: "1_week", label: "Within 1 week" },
  { value: "2_weeks", label: "1–2 weeks" },
  { value: "4_weeks", label: "2–4 weeks" },
  { value: "2_months", label: "1–2 months" },
  { value: "flexible", label: "Flexible (no rush)" },
]

// ─── Floating-label wrapper ───────────────────────────────────────────────────

function FloatingField({
  id,
  label,
  children,
  hint,
  error,
  required,
}: {
  id: string
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground flex items-center gap-1"
      >
        {label}
        {required && <span className="text-destructive">*</span>}
      </label>
      <div className="relative">{children}</div>
      {error && <p className="text-xs text-destructive font-medium">{error}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

// ─── Shared input className ───────────────────────────────────────────────────

const inputCls =
  "h-11 text-sm rounded-lg border border-border/60 bg-card/50 hover:border-border/80 focus-visible:ring-0 focus-visible:border-primary transition-colors placeholder:text-muted-foreground/40"

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border/40 bg-gradient-to-br from-card/80 to-card/40 shadow-sm hover:shadow-md transition-all">
      <CardHeader className="pb-4">
        <div>
          <CardTitle className="text-lg font-bold text-foreground">
            {title}
          </CardTitle>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreateRequestPage() {
  const router = useRouter()
  const { user, loading: authLoading, isReady } = useAuth()

  const [loading, setLoading] = useState(false)
  const [customLocation, setCustomLocation] = useState("")
  const [showCustomLocation, setShowCustomLocation] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    quantity: "",
    unit: "",
    budget_min: "",
    budget_max: "",
    location: "",
    deadline: "",
  })

  const [charCount, setCharCount] = useState(0)
  const [budgetError, setBudgetError] = useState("")

  useEffect(() => {
    if (!isReady) return
    if (!user) {
      router.push("/auth/login")
      return
    }
    getProfileById(user.id).catch(() => {})
  }, [isReady, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "description") setCharCount(value.length)
    if (name === "budget_min" || name === "budget_max") setBudgetError("")
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelect = (field: string) => (value: string) => {
    if (field === "location") {
      setShowCustomLocation(value === "Other")
      if (value !== "Other") setCustomLocation("")
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    const min = parseFloat(formData.budget_min)
    const max = parseFloat(formData.budget_max)
    if (min >= max) {
      setBudgetError("Minimum budget must be less than maximum budget.")
      return
    }
    setLoading(true)
    try {
      await createRequest({
        buyer_id: user.id,
        title: formData.title,
        category: formData.category,
        description: formData.description,
        budget_min: min,
        budget_max: max,
        status: "open",
      })
      router.push("/buyer/requests")
      router.refresh()
    } catch (error) {
      console.error("Error creating request:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!isReady || authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Derived preview values
  const deadlineLabel = deadlineOptions.find((d) => d.value === formData.deadline)?.label
  const locationLabel = formData.location === "Other" ? customLocation : formData.location

  const isFormValid =
    formData.title &&
    formData.category &&
    formData.description &&
    formData.budget_min &&
    formData.budget_max &&
    formData.location &&
    !budgetError

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Page header ── */}
        <div className="mb-12">
          <Link href="/buyer/requests">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent text-sm mb-6 -ml-3 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Requests
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-serif tracking-tight mb-3">
              Post a Request
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Describe exactly what you're looking for. Get multiple offers from verified sellers and choose the best one.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ══════════════════════════════════════
                LEFT — form sections
            ══════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── Basic Information ── */}
              <SectionCard
                title="What do you need?"
                description="Be clear and specific so sellers understand your requirements"
              >
                <FloatingField
                  id="title"
                  label="Request title"
                  hint="E.g., 200 units of industrial cotton fabric"
                  required
                >
                  <div className="relative">
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Be specific — this is what sellers see first"
                      maxLength={100}
                      required
                      minLength={10}
                      className={`${inputCls} pr-12`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 tabular-nums">
                      {formData.title.length}/100
                    </span>
                  </div>
                </FloatingField>

                <FloatingField
                  id="category"
                  label="Category"
                  hint="Select the category that best matches"
                  required
                >
                  <Select value={formData.category} onValueChange={handleSelect("category")} required>
                    <SelectTrigger id="category" className={`${inputCls} w-full`}>
                      <SelectValue placeholder="Choose a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FloatingField>

                <FloatingField
                  id="description"
                  label="Detailed description"
                  hint="Include specifications, quality standards, and any special requirements"
                  required
                >
                  <div className="relative">
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder={`Describe what you need in detail:\n• Size, weight, material specifications\n• Quality standards and certifications required\n• Intended use or application\n• Any special requirements or preferences`}
                      rows={6}
                      maxLength={2000}
                      required
                      minLength={20}
                      className={`${inputCls} resize-none pb-10`}
                    />
                    <span className="absolute bottom-3 right-4 text-xs text-muted-foreground/50 tabular-nums">
                      {charCount}/2000
                    </span>
                  </div>
                </FloatingField>
              </SectionCard>

              {/* ── Quantity & Budget ── */}
              <SectionCard
                title="Quantity & Budget"
                description="Help sellers understand your volume and price expectations"
              >
                <div className="grid grid-cols-2 gap-5">
                  <FloatingField id="quantity" label="Quantity" hint="How many units?">
                    <Input
                      id="quantity"
                      name="quantity"
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="E.g., 200"
                      className={inputCls}
                    />
                  </FloatingField>
                  <FloatingField id="unit" label="Unit" hint="kg, pieces, meters, etc.">
                    <Input
                      id="unit"
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      placeholder="E.g., kg"
                      className={inputCls}
                    />
                  </FloatingField>
                </div>

                {/* Budget range */}
                <FloatingField
                  id="budget_min"
                  label="Budget range (ETB)"
                  hint="Set a realistic range for serious offers"
                  error={budgetError}
                  required
                >
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 pointer-events-none">
                        ETB
                      </span>
                      <Input
                        id="budget_min"
                        name="budget_min"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget_min}
                        onChange={handleChange}
                        placeholder="Min"
                        required
                        className={`${inputCls} pl-12`}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground/60 font-medium shrink-0">to</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 pointer-events-none">
                        ETB
                      </span>
                      <Input
                        id="budget_max"
                        name="budget_max"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget_max}
                        onChange={handleChange}
                        placeholder="Max"
                        required
                        className={`${inputCls} pl-12`}
                      />
                    </div>
                  </div>
                </FloatingField>
              </SectionCard>

              {/* ── Delivery & Timeline ── */}
              <SectionCard
                title="Delivery & Timeline"
                description="Tell sellers where and when you need this"
              >
                <FloatingField
                  id="location"
                  label="Delivery location"
                  hint="Where should it be delivered?"
                  required
                >
                  <Select value={formData.location} onValueChange={handleSelect("location")} required>
                    <SelectTrigger id="location" className={`${inputCls} w-full`}>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FloatingField>

                {showCustomLocation && (
                  <FloatingField id="custom_location" label="Specify location">
                    <Input
                      id="custom_location"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="E.g., Hawassa, SNNPR"
                      className={inputCls}
                    />
                  </FloatingField>
                )}

                <FloatingField
                  id="deadline"
                  label="When do you need this?"
                  hint="Helps sellers prioritize your request"
                >
                  <Select value={formData.deadline} onValueChange={handleSelect("deadline")}>
                    <SelectTrigger id="deadline" className={`${inputCls} w-full`}>
                      <SelectValue placeholder="Select timeline (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {deadlineOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FloatingField>
              </SectionCard>

              {/* ── Submit ── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="flex-1 h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating request…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Post Request
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Link href="/buyer/requests" className="flex-1 sm:flex-none">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-11 text-sm font-semibold rounded-lg border-border/60 hover:border-border hover:bg-secondary/30 transition-colors"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>

            {/* ══════════════════════════════════════
                RIGHT — preview + tips
            ══════════════════════════════════════ */}
            <div className="space-y-6 lg:sticky lg:top-20 lg:h-fit">

              {/* Request preview card */}
              <Card className="border-border/40 bg-linear-to-br from-card/80 to-card/40 shadow-sm overflow-hidden pt-0">
                <CardHeader className="p-4 bg-primary/5 m-0">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                     Preview
                  </p>
                </CardHeader>
                <CardContent className="">
                  <div className="space-y-3">
                    {formData.category && (
                      <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
                        {formData.category}
                      </Badge>
                    )}
                    <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                      {formData.title || "Your request title appears here"}
                    </h4>
                    <div className="h-px bg-border/40" />
                    <div className="space-y-2">
                      {formData.budget_min && formData.budget_max ? (
                        <p className="text-lg font-bold text-primary">
                          {Number(formData.budget_min).toLocaleString()} – {Number(formData.budget_max).toLocaleString()} ETB
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground/60">Budget range</p>
                      )}
                      {locationLabel && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          {locationLabel}
                        </p>
                      )}
                      {deadlineLabel && (
                        <p className="text-xs text-muted-foreground">
                          ⏱ {deadlineLabel}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips card */}
              <Card className="border-border/40 bg-gradient-to-br from-emerald-50/40 to-emerald-50/10 dark:from-emerald-950/20 dark:to-emerald-950/5 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Tips for Great Offers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      title: "Be specific",
                      desc: "Clear titles help sellers find you faster.",
                    },
                    {
                      title: "Detail matters",
                      desc: "Specs and quality standards get better offers.",
                    },
                    {
                      title: "Realistic budget",
                      desc: "A fair range attracts serious sellers.",
                    },
                    {
                      title: "Set timeline",
                      desc: "Deadlines help sellers prioritize your request.",
                    },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {tip.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {tip.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Info card */}
              <Card className="border-border/40 bg-gradient-to-br from-blue-50/40 to-blue-50/10 dark:from-blue-950/20 dark:to-blue-950/5 shadow-sm">
                <CardContent className="pt-5">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-semibold text-foreground block mb-2">💡 Pro tip</span>
                    Requests with detailed descriptions and clear budgets get 3x more quality offers. Take time to explain what you need!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}