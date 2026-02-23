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
  FileText,
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
}: {
  id: string
  label: string
  children: React.ReactNode
  hint?: string
  error?: string
}) {
  return (
    <div className="space-y-2">
      <div className="relative group">
        <label
          htmlFor={id}
          className="absolute -top-2.5 left-3.5 z-10 bg-background px-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/80 transition-colors group-focus-within:text-foreground pointer-events-none"
        >
          {label}
        </label>
        {children}
      </div>
      {error && <p className="text-sm text-destructive pl-1">{error}</p>}
      {!error && hint && (
        <p className="text-xs text-muted-foreground/70 pl-1">{hint}</p>
      )}
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType
  title: string
}) {
  return (
    <div className="flex items-center gap-3 mb-7">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-background" />
      </div>
      <h2 className="text-base font-semibold text-foreground leading-none">
        {title}
      </h2>
    </div>
  )
}

// ─── Shared input className ───────────────────────────────────────────────────

const inputCls =
  "h-12 text-base rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35"

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

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Page header ── */}
        <div className="mb-10">
          <Link href="/buyer/requests">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent text-sm mb-5 -ml-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
            New Request
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Tell sellers exactly what you need and receive tailored offers.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-10 items-start">

            {/* ══════════════════════════════════════
                LEFT — form sections
            ══════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-12">

              {/* ── Basic Information ── */}
              <section>
                <SectionHeading icon={FileText} title="Basic Information" />
                <div className="space-y-6">

                  <FloatingField
                    id="title"
                    label="What are you looking for? *"
                    hint="Be specific — this is what sellers will see first"
                  >
                    <div className="relative">
                      <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g., 200 units of industrial cotton fabric"
                        maxLength={100}
                        required
                        minLength={10}
                        className={`${inputCls} pr-16`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/40 tabular-nums pointer-events-none">
                        {formData.title.length}/100
                      </span>
                    </div>
                  </FloatingField>

                  <FloatingField
                    id="category"
                    label="Category *"
                    hint="Select the category that best matches your need"
                  >
                    <Select value={formData.category} onValueChange={handleSelect("category")} required>
                      <SelectTrigger id="category" className={`${inputCls} w-full`}>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-base py-2.5">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FloatingField>

                  <FloatingField
                    id="description"
                    label="Detailed Requirements *"
                    hint="The more detail you provide, the better offers you'll receive"
                  >
                    <div className="relative">
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder={`Describe exactly what you need:\n• Specifications and quality standards\n• Any special requirements\n• Intended use (helps sellers understand your needs)`}
                        rows={6}
                        maxLength={2000}
                        required
                        minLength={20}
                        className="text-base rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35 resize-none pb-8 pt-5"
                      />
                      <span className="absolute bottom-3 right-4 text-xs text-muted-foreground/40 tabular-nums pointer-events-none">
                        {charCount}/2000
                      </span>
                    </div>
                  </FloatingField>
                </div>
              </section>

              {/* ── Quantity & Budget ── */}
              <section>
                <SectionHeading icon={Wallet} title="Quantity & Budget" />
                <div className="space-y-6">

                  <div className="grid grid-cols-2 gap-5">
                    <FloatingField id="quantity" label="Quantity" hint="How many units?">
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g., 200"
                        className={inputCls}
                      />
                    </FloatingField>
                    <FloatingField id="unit" label="Unit" hint="pieces, kg, meters…">
                      <Input
                        id="unit"
                        name="unit"
                        value={formData.unit}
                        onChange={handleChange}
                        placeholder="e.g., kg"
                        className={inputCls}
                      />
                    </FloatingField>
                  </div>

                  {/* Budget range */}
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 pl-1">
                      Budget Range (ETB) *
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50 font-medium pointer-events-none">
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
                          placeholder="50,000"
                          required
                          className={`${inputCls} pl-14`}
                        />
                      </div>
                      <span className="text-base text-muted-foreground/50 font-medium shrink-0">to</span>
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50 font-medium pointer-events-none">
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
                          placeholder="80,000"
                          required
                          className={`${inputCls} pl-14`}
                        />
                      </div>
                    </div>
                    {budgetError ? (
                      <p className="text-sm text-destructive font-medium pl-1">{budgetError}</p>
                    ) : (
                      <p className="text-xs text-muted-foreground/70 pl-1">
                        Provide a realistic range — you can still negotiate within it
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ── Delivery & Timeline ── */}
              <section>
                <SectionHeading icon={MapPin} title="Delivery & Timeline" />
                <div className="space-y-6">

                  <FloatingField
                    id="location"
                    label="Delivery Location *"
                    hint="Where should the product or service be delivered?"
                  >
                    <Select value={formData.location} onValueChange={handleSelect("location")} required>
                      <SelectTrigger id="location" className={`${inputCls} w-full`}>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {locations.map((loc) => (
                          <SelectItem key={loc} value={loc} className="text-base py-2.5">
                            {loc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FloatingField>

                  {showCustomLocation && (
                    <FloatingField id="custom_location" label="Specify Location">
                      <Input
                        id="custom_location"
                        value={customLocation}
                        onChange={(e) => setCustomLocation(e.target.value)}
                        placeholder="e.g., Hawassa, SNNPR"
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
                          <SelectItem key={opt.value} value={opt.value} className="text-base py-2.5">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FloatingField>
                </div>
              </section>

              {/* ── Submit ── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto h-10 px-6 text-sm font-semibold bg-primary text-background hover:bg-primary/80 rounded-xl shadow-none"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                  ) : (
                    <>Post Request <ChevronRight className="w-4 h-4 ml-1.5" /></>
                  )}
                </Button>
                <Link href="/buyer/requests" className="w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-10 px-6 text-sm rounded-xl text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>

            {/* ══════════════════════════════════════
                RIGHT — preview + tips
            ══════════════════════════════════════ */}
            <div className="space-y-4 lg:sticky lg:top-8 lg:h-fit">

              {/* Request preview card */}
              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Preview
                  </p>
                </div>
                <div className="p-4">
                  <div className="rounded-xl border border-border/30 overflow-hidden bg-card/60">
                    {/* Icon banner in place of image */}
                    {/* <div className="aspect-video bg-muted/30 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-muted-foreground/20" />
                    </div> */}
                    <div className="p-3.5 space-y-2.5">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/40 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/60"
                      >
                        {formData.category || "Category"}
                      </Badge>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {formData.title || "Request Title"}
                      </h4>
                      <div className="h-px bg-border/50" />
                      <div className="space-y-1">
                        {(formData.budget_min || formData.budget_max) ? (
                          <p className="text-base font-bold text-foreground">
                            {formData.budget_min && formData.budget_max
                              ? `${Number(formData.budget_min).toLocaleString()} – ${Number(formData.budget_max).toLocaleString()} ETB`
                              : `${Number(formData.budget_min || formData.budget_max).toLocaleString()} ETB`}
                          </p>
                        ) : (
                          <p className="text-base font-bold text-foreground">Budget TBD</p>
                        )}
                        {locationLabel && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
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
                  </div>
                </div>
              </div>

              {/* Tips card */}
              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Tips
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  {[
                    "Be specific in your title — sellers find you faster.",
                    "Describe specs, quality standards, and intended use clearly.",
                    "Set a realistic budget range to receive serious offers.",
                    "Adding a deadline helps sellers prioritize your request.",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-foreground/8 border border-border/50 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[10px] font-bold text-foreground/60">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </form>
      </main>
    </div>
  )
}