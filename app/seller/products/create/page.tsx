"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/components/providers/AuthProvider";
import { createListing } from "@/lib/data/listings";
import {
  productSchema,
  type ProductFormData,
} from "@/lib/validations/schemas";
import { CATEGORIES } from "@/lib/constants/categories";
import { ROUTES } from "@/lib/constants/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  ImagePlus,
  Package,
  DollarSign,
  Tag,
  FileText,
  Info,
  ChevronRight,
  Lightbulb,
  Star,
  TrendingUp,
} from "lucide-react";
import type React from "react";

// ─── Floating-label wrapper ───────────────────────────────────────────────────

function FloatingField({
  id,
  label,
  children,
  hint,
  error,
  required,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-foreground  items-center gap-1"
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
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="border-border/40 bg-linear-to-br from-card/80 to-card/40 shadow-sm hover:shadow-md transition-all">
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
  );
}

// ─── Shared input className ───────────────────────────────────────────────────

const inputCls =
  "h-11 text-sm rounded-lg border border-border/60 bg-card/50 hover:border-border/80 focus-visible:ring-0 focus-visible:border-primary transition-colors placeholder:text-muted-foreground/40";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CreateProductPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      category: "Electronics",
      status: "active",
      inventory_quantity: 0,
    },
  });

  const category = watch("category");
  const imageUrl = watch("image_url");
  const price = watch("price");
  const title = watch("title");
  const description = watch("description");

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.LOGIN);
  }, [user, authLoading, router]);

  const onSubmit = async (data: ProductFormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      await createListing({
        seller_id: user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        image_url: data.image_url || undefined,
        inventory_quantity: data.inventory_quantity,
        status: data.status,
      });
      toast({
        title: "Product Created",
        description: "Your product is now live and visible to buyers.",
      });
      router.push(ROUTES.SELLER_PRODUCTS);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = title && category && description && price;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-primary/5">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ── Page header ── */}
        <div className="mb-12">
          <Link href={ROUTES.SELLER_PRODUCTS}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent text-sm mb-6 -ml-3 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              Back to Products
            </Button>
          </Link>
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground font-serif tracking-tight mb-3">
              List New Product
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              Create a compelling product listing to attract buyers. Clear descriptions and quality photos lead to more sales.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">

            {/* ══════════════════════════════════════
                LEFT — form sections
            ══════════════════════════════════════ */}
            <div className="lg:col-span-2 space-y-6">

              {/* ── Basic Information ── */}
              <SectionCard
                title="Product Details"
                description="Make your listing stand out with clear information"
              >
                <FloatingField
                  id="title"
                  label="Product title"
                  hint="Be specific and clear — this is the first thing buyers see"
                  error={errors.title?.message}
                  required
                >
                  <div className="relative">
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="E.g., Samsung Galaxy S24 Ultra - 256GB Black"
                      maxLength={100}
                      className={`${inputCls} pr-12`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-muted-foreground/50 tabular-nums">
                      {title?.length || 0}/100
                    </span>
                  </div>
                </FloatingField>

                <FloatingField
                  id="category"
                  label="Category"
                  hint="Choose the category that best fits your product"
                  error={errors.category?.message}
                  required
                >
                  <Select
                    value={category}
                    onValueChange={(value) => setValue("category", value as any)}
                  >
                    <SelectTrigger className={`${inputCls} w-full`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FloatingField>

                <FloatingField
                  id="description"
                  label="Description"
                  hint="Include condition, features, specs, what's included, and why buyers should choose this"
                  error={errors.description?.message}
                  required
                >
                  <div className="relative">
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder={`Describe your product in detail:\n• Condition (new, used, refurbished)\n• Key features and specifications\n• What's included in the package\n• Any defects or issues\n• Why this is a good deal`}
                      rows={6}
                      maxLength={2000}
                      className={`${inputCls} resize-none pb-10 pt-3`}
                    />
                    <span className="absolute bottom-3 right-4 text-xs text-muted-foreground/50 tabular-nums">
                      {description?.length || 0}/2000
                    </span>
                  </div>
                </FloatingField>
              </SectionCard>

              {/* ── Pricing & Inventory ── */}
              <SectionCard
                title="Pricing & Inventory"
                description="Set competitive prices and manage stock"
              >
                <div className="grid grid-cols-2 gap-5">
                  <FloatingField
                    id="price"
                    label="Price"
                    hint="Set a competitive price"
                    error={errors.price?.message}
                    required
                  >
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground/60 pointer-events-none">
                        ETB
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        {...register("price", { valueAsNumber: true })}
                        placeholder="0.00"
                        className={`${inputCls} pl-12`}
                      />
                    </div>
                  </FloatingField>

                  <FloatingField
                    id="inventory_quantity"
                    label="Quantity available"
                    hint="How many units in stock?"
                    error={errors.inventory_quantity?.message}
                  >
                    <Input
                      id="inventory_quantity"
                      type="number"
                      min="0"
                      {...register("inventory_quantity", { valueAsNumber: true })}
                      placeholder="0"
                      className={inputCls}
                    />
                  </FloatingField>
                </div>
              </SectionCard>

              {/* ── Product Image ── */}
              <SectionCard
                title="Product Image"
                description="High-quality images get 3x more views and sales"
              >
                <FloatingField
                  id="image_url"
                  label="Image URL"
                  hint="Direct link to a clear, well-lit product photo"
                  error={errors.image_url?.message}
                >
                  <Input
                    id="image_url"
                    {...register("image_url")}
                    placeholder="https://example.com/image.jpg"
                    className={inputCls}
                  />
                </FloatingField>

                {imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-border/40 bg-muted/10 aspect-video max-w-sm hover:border-border/60 transition-colors">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-900 dark:text-blue-300 leading-relaxed">
                    Use a clear photo with good lighting. Product images should show the item clearly against a plain background for best results.
                  </p>
                </div>
              </SectionCard>

              {/* ── Submit ── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="flex-1 h-11 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/25 hover:shadow-primary/35 transition-all disabled:opacity-50 disabled:cursor-not-allowed gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating product…
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4" />
                      List Product
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                <Link href={ROUTES.SELLER_PRODUCTS} className="flex-1 sm:flex-none">
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

              {/* Preview card */}
              <Card className="border-border/40 bg-linear-to-br from-card/80 to-card/40 shadow-sm overflow-hidden pt-0">
                <CardHeader className="p-3 bg-primary/5 ">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    Live Preview
                  </p>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    {/* Image preview */}
                    <div className="rounded-lg overflow-hidden bg-muted/20 aspect-video flex items-center justify-center border border-border/40">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      ) : (
                        <Package className="w-10 h-10 text-muted-foreground/30" />
                      )}
                    </div>

                    {/* Product info */}
                    <div className="space-y-2">
                      {category && (
                        <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-semibold">
                          {category}
                        </Badge>
                      )}
                      <h4 className="text-base font-bold text-foreground leading-snug line-clamp-2">
                        {title || "Your product title"}
                      </h4>
                      <div className="h-px bg-border/40" />
                      <p className="text-lg font-bold text-primary">
                        {price ? `${Number(price).toLocaleString()} ETB` : "Price"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips card */}
              <Card className="border-border/40 bg-linear-to-br from-emerald-50/40 to-emerald-50/10 dark:from-emerald-950/20 dark:to-emerald-950/5 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                    Boost Your Sales
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    {
                      title: "Clear title",
                      desc: "Include key details like brand, model, color.",
                    },
                    {
                      title: "Detailed description",
                      desc: "The more info, the fewer questions from buyers.",
                    },
                    {
                      title: "Competitive price",
                      desc: "Check similar items to price accurately.",
                    },
                    {
                      title: "Great photo",
                      desc: "Good images dramatically increase views.",
                    },
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-600/30 flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-xs font-bold text-emerald-600">
                          {i + 1}
                        </span>
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

              {/* Pro tip card */}
              <Card className="border-border/40 bg-linear-to-br from-amber-50/40 to-amber-50/10 dark:from-amber-950/20 dark:to-amber-950/5 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 dark:text-amber-100 mb-1">
                        Pro Tip
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        Products with detailed descriptions, good photos, and fair prices sell 5x faster. Take time to get it right!
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}