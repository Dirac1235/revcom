import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  Package,
  ArrowRight,
  Search,
} from "lucide-react";

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ReactNode }
> = {
  pending: {
    label: "Pending",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-400",
    icon: <Clock className="w-3 h-3" />,
  },
  accepted: {
    label: "Accepted",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-800 dark:text-blue-400",
    icon: <Package className="w-3 h-3" />,
  },
  shipped: {
    label: "Shipped",
    bg: "bg-indigo-100 dark:bg-indigo-900/30",
    text: "text-indigo-800 dark:text-indigo-400",
    icon: <Truck className="w-3 h-3" />,
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-400",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  cancelled: {
    label: "Cancelled",
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-400",
    icon: <XCircle className="w-3 h-3" />,
  },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

export default async function BuyerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusParam } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) redirect("/auth/login");

  let query = supabase
    .from("orders")
    .select("*")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const filterStatus = statusParam || "all";
  if (filterStatus !== "all") {
    query = query.eq("status", filterStatus);
  }

  const { data: orders } = await query;

  const { data: allOrders } = await supabase
    .from("orders")
    .select("status")
    .eq("buyer_id", user.id);

  const allList = allOrders || [];
  const orderList = orders || [];

  const stats = {
    total: allList.length,
    pending: allList.filter((o) => o.status === "pending").length,
    active: allList.filter((o) =>
      ["accepted", "shipped"].includes(o.status),
    ).length,
    delivered: allList.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Orders</h1>
              <p className="text-muted-foreground mt-1 text-base">
                Track and manage all your purchases
              </p>
            </div>
            <Link href="/products">
              <Button size="sm" className="gap-1">
                <Search className="w-4 h-4" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {allList.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {[
              {
                label: "Total Orders",
                value: stats.total,
                icon: <ShoppingBag className="w-4 h-4 text-blue-600" />,
                bg: "bg-blue-50 dark:bg-blue-950/50",
              },
              {
                label: "Pending",
                value: stats.pending,
                icon: <Clock className="w-4 h-4 text-yellow-600" />,
                bg: "bg-yellow-50 dark:bg-yellow-950/50",
              },
              {
                label: "In Progress",
                value: stats.active,
                icon: <Truck className="w-4 h-4 text-indigo-600" />,
                bg: "bg-indigo-50 dark:bg-indigo-950/50",
              },
              {
                label: "Delivered",
                value: stats.delivered,
                icon: <CheckCircle className="w-4 h-4 text-green-600" />,
                bg: "bg-green-50 dark:bg-green-950/50",
              },
            ].map((stat) => (
              <Card key={stat.label} className="border border-border/50 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${stat.bg}`}>{stat.icon}</div>
                  <div>
                    <h4 className="text-xl font-semibold text-foreground">
                      {stat.value}
                    </h4>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {allList.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {[
              { id: "all", label: "All Orders" },
              { id: "pending", label: "Pending" },
              { id: "accepted", label: "Accepted" },
              { id: "shipped", label: "Shipped" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <Link
                key={tab.id}
                href={`/buyer/orders${tab.id === "all" ? "" : `?status=${tab.id}`}`}
              >
                <Badge
                  variant={filterStatus === tab.id ? "default" : "secondary"}
                  className={`px-3 py-1 text-sm rounded-md cursor-pointer transition-colors whitespace-nowrap ${
                    filterStatus === tab.id
                      ? "shadow-sm"
                      : "hover:bg-secondary/80"
                  }`}
                >
                  {tab.label}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        <div className="space-y-3">
          {orderList.length > 0 ? (
            orderList.map((order: any) => (
              <Card
                key={order.id}
                className="border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">
                            {order.title}
                          </h3>
                          <StatusBadge status={order.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Qty: {order.quantity}</span>
                          <span>ID: {order.id.slice(0, 8)}</span>
                          <span>{timeAgo(order.created_at)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                      <p className="text-sm font-bold">
                        {((order.agreed_price || 0) * (order.quantity || 1)).toLocaleString()}{" "}
                        ETB
                      </p>
                      <Link href={`/buyer/orders/${order.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Track
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : allList.length > 0 ? (
            <div className="text-center py-8 bg-card rounded-lg border border-border/50">
              <p className="text-muted-foreground">
                No orders found for this filter.
              </p>
              <Link
                href="/buyer/orders"
                className="text-primary font-medium hover:underline mt-1 inline-block text-sm"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-lg border border-dashed border-border/50">
              <div className="flex justify-center mb-4">
                <div className="p-4 rounded-lg bg-background border shadow-sm">
                  <ShoppingBag className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Browse products and place your first order to get started.
              </p>
              <Link href="/products">
                <Button size="sm">Browse Products</Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
