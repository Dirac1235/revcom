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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";

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
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link href={ROUTES.SELLER_PRODUCTS}>
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground pl-0 hover:bg-transparent text-sm mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-2">
            Add New Product
          </h1>
          <p className="text-muted-foreground">
            Create a new listing for buyers to discover
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-none rounded-lg">
                <CardHeader className="pb-4 pt-6 px-6">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  <div className="space-y-2">
                    <Label
                      htmlFor="title"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Product Title *
                    </Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="e.g., MacBook Pro M4 16-inch"
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground h-11"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Description *
                    </Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe your product in detail — condition, features, what's included..."
                      rows={5}
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground resize-none"
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Category *
                    </Label>
                    <Select
                      value={category}
                      onValueChange={(value) =>
                        setValue("category", value as any)
                      }
                    >
                      <SelectTrigger className="border-border focus:ring-0 focus:border-foreground h-11">
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
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none rounded-lg">
                <CardHeader className="pb-4 pt-6 px-6">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Pricing & Inventory
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Price (ETB) *
                      </Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price", { valueAsNumber: true })}
                        placeholder="0.00"
                        className="border-border focus-visible:ring-0 focus-visible:border-foreground h-11"
                      />
                      {errors.price && (
                        <p className="text-sm text-destructive">
                          {errors.price.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="inventory_quantity"
                        className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Quantity Available
                      </Label>
                      <Input
                        id="inventory_quantity"
                        type="number"
                        {...register("inventory_quantity", {
                          valueAsNumber: true,
                        })}
                        placeholder="0"
                        className="border-border focus-visible:ring-0 focus-visible:border-foreground h-11"
                      />
                      {errors.inventory_quantity && (
                        <p className="text-sm text-destructive">
                          {errors.inventory_quantity.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none rounded-lg">
                <CardHeader className="pb-4 pt-6 px-6">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    Product Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="image_url"
                      className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
                    >
                      Image URL
                    </Label>
                    <Input
                      id="image_url"
                      {...register("image_url")}
                      placeholder="https://example.com/image.jpg"
                      className="border-border focus-visible:ring-0 focus-visible:border-foreground h-11"
                    />
                    {errors.image_url && (
                      <p className="text-sm text-destructive">
                        {errors.image_url.message}
                      </p>
                    )}
                  </div>

                  {imageUrl && (
                    <div className="rounded-lg overflow-hidden border border-border/30 bg-muted/20 aspect-video max-w-sm">
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

                  <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/20 border border-border/30">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Provide a direct link to your product image. Use a
                      high-quality photo with good lighting for best results.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-primary-foreground hover:bg-foreground/90 shadow-none h-11 px-8"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Product"
                  )}
                </Button>
                <Link href={ROUTES.SELLER_PRODUCTS}>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border hover:bg-secondary/20 h-11 px-8"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-5 lg:sticky lg:top-6 lg:h-fit">
              <Card className="border-border shadow-none rounded-lg overflow-hidden">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-sm font-semibold">
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="rounded-lg border border-border/30 overflow-hidden bg-card/60">
                    <div className="aspect-4/3 bg-muted/30 overflow-hidden">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-10 h-10 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-3 space-y-2">
                      <Badge
                        variant="outline"
                        className="rounded-full border-border/40 bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground/60"
                      >
                        {category || "Category"}
                      </Badge>
                      <h4 className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                        {title || "Product Title"}
                      </h4>
                      <div className="h-px bg-border/50" />
                      <p className="text-base font-bold text-foreground">
                        {price
                          ? `${Number(price).toLocaleString()} ETB`
                          : "0 ETB"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border shadow-none rounded-lg">
                <CardHeader className="pb-3 pt-5 px-5">
                  <CardTitle className="text-sm font-semibold">Tips</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        1
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Use a clear, specific title that describes your product
                      well.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        2
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Write a detailed description including condition and
                      features.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        3
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Set a competitive price by checking similar listings.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-primary">
                        4
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Add a high-quality image — listings with photos get 3x
                      more views.
                    </p>
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
