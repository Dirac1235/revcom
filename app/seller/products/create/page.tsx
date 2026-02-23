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
} from "lucide-react";
import type React from "react";

// ─── Floating-label wrapper ───────────────────────────────────────────────────

function FloatingField({
  id,
  label,
  children,
  hint,
  error,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  hint?: string;
  error?: string;
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
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-7">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
        <Icon className="w-4.5 h-4.5 text-background" />
      </div>
      <h2 className="text-base font-semibold text-foreground leading-none">
        {title}
      </h2>
    </div>
  );
}

// ─── Shared input className ───────────────────────────────────────────────────

const inputCls =
  "h-12 text-base rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35";

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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

        {/* ── Page header ── */}
        <div className="mb-10">
          <Link href={ROUTES.SELLER_PRODUCTS}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent text-sm mb-5 -ml-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground font-serif tracking-tight">
            Add New Product
          </h1>
          <p className="text-base text-muted-foreground mt-2">
            Create a new listing for buyers to discover
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
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
                    label="Product Title *"
                    error={errors.title?.message}
                  >
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="e.g., MacBook Pro M4 16-inch"
                      className={inputCls}
                    />
                  </FloatingField>

                  <FloatingField
                    id="description"
                    label="Description *"
                    error={errors.description?.message}
                  >
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe your product — condition, features, what's included…"
                      rows={5}
                      className="text-base rounded-xl border-border/60 bg-transparent focus-visible:ring-0 focus-visible:border-foreground placeholder:text-muted-foreground/35 resize-none pt-5"
                    />
                  </FloatingField>

                  <FloatingField
                    id="category"
                    label="Category *"
                    error={errors.category?.message}
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
                          <SelectItem key={cat} value={cat} className="text-base py-2.5">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FloatingField>
                </div>
              </section>

              {/* ── Pricing & Inventory ── */}
              <section>
                <SectionHeading icon={DollarSign} title="Pricing & Inventory" />
                <div className="grid grid-cols-2 gap-5">
                  <FloatingField
                    id="price"
                    label="Price (ETB) *"
                    error={errors.price?.message}
                  >
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50 font-medium pointer-events-none">
                        ETB
                      </span>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        placeholder="0.00"
                        className={`${inputCls} pl-14`}
                      />
                    </div>
                  </FloatingField>

                  <FloatingField
                    id="inventory_quantity"
                    label="Qty Available"
                    error={errors.inventory_quantity?.message}
                  >
                    <Input
                      id="inventory_quantity"
                      type="number"
                      {...register("inventory_quantity", { valueAsNumber: true })}
                      placeholder="0"
                      className={inputCls}
                    />
                  </FloatingField>
                </div>
              </section>

              {/* ── Product Image ── */}
              <section>
                <SectionHeading icon={ImagePlus} title="Product Image" />
                <div className="space-y-5">
                  <FloatingField
                    id="image_url"
                    label="Image URL"
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
                    <div className="rounded-xl overflow-hidden border border-border/30 bg-muted/20 aspect-video max-w-sm">
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

                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-secondary/30 border border-border/50">
                    <Info className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Provide a direct link to your product image. Use a high-quality
                      photo with good lighting for best results.
                    </p>
                  </div>
                </div>
              </section>

              {/* ── Submit ── */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/40">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-foreground text-background hover:bg-foreground/80 rounded-xl shadow-none"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating…</>
                  ) : (
                    <>Create Product <ChevronRight className="w-4 h-4 ml-1.5" /></>
                  )}
                </Button>
                <Link href={ROUTES.SELLER_PRODUCTS} className="w-full sm:w-auto">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full h-12 px-6 text-base rounded-xl text-muted-foreground hover:text-foreground"
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

              {/* Preview card */}
              <div className="rounded-2xl border border-border/60 overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border/40">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Preview
                  </p>
                </div>
                <div className="p-4">
                  <div className="rounded-xl border border-border/30 overflow-hidden bg-card/60">
                    <div className="aspect-video bg-muted/30 overflow-hidden">
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
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-3.5 space-y-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/40 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-foreground/60"
                      >
                        {category || "Category"}
                      </Badge>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {title || "Product Title"}
                      </h4>
                      <div className="h-px bg-border/50" />
                      <p className="text-base font-bold text-foreground">
                        {price ? `${Number(price).toLocaleString()} ETB` : "0 ETB"}
                      </p>
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
                    "Use a clear, specific title that describes your product well.",
                    "Write a detailed description including condition and features.",
                    "Set a competitive price by checking similar listings.",
                    "Add a high-quality image — listings with photos get 3× more views.",
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
  );
}