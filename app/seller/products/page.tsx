"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProducts } from "@/lib/hooks/useProducts";
import { deleteListing } from "@/lib/data/listings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { ROUTES } from "@/lib/constants/routes";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  ArrowUpRight,
  Search,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/lib/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { products, loading, refetch } = useProducts({
    sellerId: user?.id,
    status: undefined,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      await deleteListing(id);
      toast({ title: "Success", description: "Product deleted successfully" });
      refetch();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <LoadingState count={4} type="list" />
        </main>
      </div>
    );
  }

  if (!user) return null;

  const activeCount = products.filter((p) => p.status === "active").length;
  const soldCount = products.filter((p) => p.status === "sold").length;
  const inactiveCount = products.filter((p) => p.status === "inactive").length;
  const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalRevenue = products.reduce(
    (sum, p) => sum + p.price * (p.review_count || 0),
    0,
  );

  const filtered = products
    .filter((p) => statusFilter === "all" || p.status === statusFilter)
    .filter(
      (p) =>
        !search ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()),
    );

  const statusConfig: Record<string, { color: string; label: string }> = {
    active: {
      color:
        "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
      label: "Active",
    },
    inactive: {
      color:
        "bg-secondary text-muted-foreground border-border dark:bg-secondary dark:text-muted-foreground",
      label: "Inactive",
    },
    sold: {
      color:
        "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
      label: "Sold",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
              My Products
            </h1>
            <p className="text-muted-foreground">
              Manage your product listings
            </p>
          </div>
          <Link href={ROUTES.SELLER_PRODUCT_CREATE}>
            <Button className="bg-foreground text-background hover:bg-foreground/90 shadow-none">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <button
            onClick={() => setStatusFilter("all")}
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${statusFilter === "all" ? "border-primary bg-primary/5" : "border-border/30 bg-secondary/20 hover:border-border"}`}
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              Total
            </p>
            <p className="text-3xl font-bold text-foreground">
              {products.length}
            </p>
          </button>
          <button
            onClick={() =>
              setStatusFilter(statusFilter === "active" ? "all" : "active")
            }
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${statusFilter === "active" ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" : "border-border/30 bg-secondary/20 hover:border-border"}`}
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              Active
            </p>
            <p className="text-3xl font-bold text-foreground">{activeCount}</p>
          </button>
          <button
            onClick={() =>
              setStatusFilter(statusFilter === "sold" ? "all" : "sold")
            }
            className={`p-4 rounded-lg border text-left transition-all duration-200 ${statusFilter === "sold" ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20" : "border-border/30 bg-secondary/20 hover:border-border"}`}
          >
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              Sold
            </p>
            <p className="text-3xl font-bold text-foreground">{soldCount}</p>
          </button>
          <div className="p-4 rounded-lg border border-border/30 bg-secondary/20">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-1">
              Total Views
            </p>
            <p className="text-3xl font-bold text-foreground">{totalViews}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 border-border focus-visible:ring-0 focus-visible:border-foreground"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] border-border focus:ring-0 focus:border-foreground">
              <Filter className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {!loading && filtered.length > 0 && (
          <p className="text-sm text-muted-foreground mb-4 uppercase tracking-wider font-medium">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
            {statusFilter !== "all" ? ` (${statusFilter})` : ""}
          </p>
        )}

        <div className="space-y-4">
          {filtered.length > 0 ? (
            filtered.map((product) => {
              const status = statusConfig[product.status] || statusConfig.inactive;
              const imageUrl =
                product.images?.[0] || product.image_url || null;

              return (
                <div
                  key={product.id}
                  className="group flex gap-4 sm:gap-5 p-4 rounded-xl border border-border/50 bg-card/60 [backdrop-filter:blur(20px)_saturate(150%)] hover:border-border hover:shadow-md transition-all duration-300"
                >
                  <Link
                    href={ROUTES.PRODUCT_DETAIL(product.id)}
                    className="shrink-0"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-muted/30 border border-border/30">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <Link
                        href={ROUTES.PRODUCT_DETAIL(product.id)}
                        className="hover:underline"
                      >
                        <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>
                      <Badge
                        variant="outline"
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] border ${status.color}`}
                      >
                        {status.label}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{product.category}</span>
                      <span>·</span>
                      <span>
                        {formatDistanceToNow(new Date(product.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                      {(product.average_rating ?? 0) > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {Number(product.average_rating).toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-bold text-foreground">
                          {product.price.toLocaleString()} ETB
                        </p>
                        <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            {product.inventory_quantity ?? 0} in stock
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {product.views || 0}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={ROUTES.SELLER_PRODUCT_EDIT(product.id)}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 rounded-lg border-border/50 hover:bg-secondary/30"
                          >
                            <Edit className="w-3 h-3" />
                            Edit
                          </Button>
                        </Link>
                        <Link href={ROUTES.PRODUCT_DETAIL(product.id)}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5 rounded-lg border-border/50 hover:bg-secondary/30"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            View
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-lg border-border/50 hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={Package}
              title={search || statusFilter !== "all" ? "No matching products" : "No products yet"}
              description={
                search || statusFilter !== "all"
                  ? "Try adjusting your search or filters."
                  : "Start selling by adding your first product listing."
              }
              actionLabel={search || statusFilter !== "all" ? "Clear Filters" : "Add Product"}
              onAction={
                search || statusFilter !== "all"
                  ? () => { setSearch(""); setStatusFilter("all"); }
                  : undefined
              }
              actionHref={search || statusFilter !== "all" ? undefined : ROUTES.SELLER_PRODUCT_CREATE}
            />
          )}
        </div>
      </main>
    </div>
  );
}
