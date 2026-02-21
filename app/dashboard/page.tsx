import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight, FileText, ShoppingBag, TrendingUp, Clock, CheckCircle,
  XCircle, Send, Search, User, Store, Bell, Plus, Package, Truck,
  MessageSquare, AlertCircle, BarChart2, Eye, Edit2, Trash2,
  ArrowUpRight, ArrowDownRight, Minus, DollarSign, Star
} from "lucide-react";

// ─── Data Fetchers ─────────────────────────────────────────────────────────────

async function getBuyerData(userId: string) {
  const supabase = await createClient();

  const [requestsRes, ordersRes, messagesRes] = await Promise.all([
    supabase.from("requests").select("*, offers(count)").eq("buyer_id", userId).order("created_at", { ascending: false }),
    supabase.from("orders").select("*").eq("buyer_id", userId).order("created_at", { ascending: false }),
    supabase.from("messages").select("id").eq("receiver_id", userId).eq("is_read", false),
  ]);

  const requests = requestsRes.data || [];
  const orders = ordersRes.data || [];
  const unreadMessages = messagesRes.data?.length || 0;

  const activeRequests = requests.filter((r: any) => r.status === "open").length;
  const pendingOrders = orders.filter((o: any) => o.status === "pending").length;
  const activeOrders = orders.filter((o: any) => ["accepted", "shipped"].includes(o.status)).length;

  return {
    requests: requests.slice(0, 5),
    orders: orders.slice(0, 5),
    unreadMessages,
    stats: {
      activeRequests,
      pendingOrders,
      activeOrders,
      unreadMessages,
      total: requests.length,
      open: requests.filter((r: any) => r.status === "open").length,
      negotiating: requests.filter((r: any) => r.status === "negotiating").length,
      closed: requests.filter((r: any) => r.status === "closed").length,
    },
  };
}

async function getSellerData(userId: string) {
  const supabase = await createClient();

  const [requestsRes, ordersRes, offersRes, productsRes, messagesRes] = await Promise.all([
    supabase.from("requests").select("*").eq("status", "open").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").eq("seller_id", userId).order("created_at", { ascending: false }),
    supabase.from("offers").select("*, requests(title)").eq("seller_id", userId).order("created_at", { ascending: false }),
    supabase.from("products").select("*").eq("seller_id", userId),
    supabase.from("messages").select("id").eq("receiver_id", userId).eq("is_read", false),
  ]);

  const requests = requestsRes.data || [];
  const orders = ordersRes.data || [];
  const offers = offersRes.data || [];
  const products = productsRes.data || [];
  const unreadMessages = messagesRes.data?.length || 0;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = orders
    .filter((o: any) => o.status === "delivered" && new Date(o.updated_at) >= startOfMonth)
    .reduce((sum: number, o: any) => sum + (o.agreed_price || 0), 0);

  return {
    requests: requests.slice(0, 6),
    orders: orders.slice(0, 5),
    offers: offers.slice(0, 5),
    products: products.slice(0, 3),
    unreadMessages,
    stats: {
      totalProducts: products.filter((p: any) => p.status === "active").length,
      pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      activeOrders: orders.filter((o: any) => ["accepted", "shipped"].includes(o.status)).length,
      monthlyRevenue,
      totalOffers: offers.length,
      pendingOffers: offers.filter((o: any) => o.status === "pending").length,
      acceptedOffers: offers.filter((o: any) => o.status === "accepted").length,
      rejectedOffers: offers.filter((o: any) => o.status === "rejected").length,
      deliveredOrders: orders.filter((o: any) => o.status === "delivered").length,
      cancelledOrders: orders.filter((o: any) => o.status === "cancelled").length,
      totalOrders: orders.length,
    },
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STATUS_STYLES: Record<string, string> = {
  open:        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  negotiating: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  closed:      "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  pending:     "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  accepted:    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  shipped:     "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  delivered:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:   "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  rejected:    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
  trend,
  trendLabel,
  href,
  urgent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: number | string;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  href?: string;
  urgent?: boolean;
}) {
  const content = (
    <Card className={`border-border shadow-none hover:shadow-md transition-all hover:-translate-y-0.5 ${urgent && Number(value) > 0 ? "border-red-200 dark:border-red-800" : ""}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
          {urgent && Number(value) > 0 && (
            <span className="flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
          )}
        </div>
        <div className="mt-3">
          <p className="text-4xl font-bold tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
          {trendLabel && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
              trend === "up" ? "text-green-600" : trend === "down" ? "text-red-600" : "text-muted-foreground"
            }`}>
              {trend === "up" && <ArrowUpRight className="w-3 h-3" />}
              {trend === "down" && <ArrowDownRight className="w-3 h-3" />}
              {trend === "neutral" && <Minus className="w-3 h-3" />}
              {trendLabel}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function SectionHeader({ title, href, label = "View all" }: { title: string; href?: string; label?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {href && (
        <Link href={href}>
          <Button variant="ghost" size="sm" className="text-muted-foreground h-8 px-2 text-xs">
            {label} <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

function EmptyState({ icon, message, action }: { icon: React.ReactNode; message: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="text-muted-foreground/25 mb-3">{icon}</div>
      <p className="text-sm text-muted-foreground">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

// ─── Buyer Dashboard ────────────────────────────────────────────────────────────

function BuyerDashboard({ data, firstName }: { data: any; firstName: string }) {
  const { stats, requests, orders, unreadMessages } = data;

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<FileText className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={stats.activeRequests}
          label="Active requests"
          trend="neutral"
          trendLabel="No change"
          href="/buyer/requests"
        />
        <StatCard
          icon={<Clock className="w-5 h-5 text-yellow-600" />}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          value={stats.pendingOrders}
          label="Pending orders"
          href="/buyer/orders"
          urgent
        />
        <StatCard
          icon={<Truck className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          value={stats.activeOrders}
          label="In progress"
          href="/buyer/orders"
        />
        <StatCard
          icon={<MessageSquare className="w-5 h-5 text-purple-600" />}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          value={stats.unreadMessages}
          label="New messages"
          href="/messages"
          urgent
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Recent Requests */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Your Recent Requests" href="/buyer/requests" />
              {requests.length > 0 ? (
                <div className="space-y-1">
                  {requests.map((req: any) => (
                    <div key={req.id} className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm truncate">{req.title}</p>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {req.offers?.[0]?.count > 0 && (
                            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                              {req.offers[0].count} offer{req.offers[0].count !== 1 ? "s" : ""}
                            </span>
                          )}
                          {req.budget_min && (
                            <span>${req.budget_min.toLocaleString()} – ${req.budget_max?.toLocaleString()}</span>
                          )}
                          <span>{timeAgo(req.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/buyer/requests/${req.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/buyer/requests/${req.id}/edit`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="w-14 h-14" />}
                  message="No requests yet. Create your first request"
                  action={
                    <Link href="/buyer/requests/create">
                      <Button size="sm" variant="outline">Create Your First</Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Recent Orders" href="/buyer/orders" />
              {orders.length > 0 ? (
                <div className="space-y-1">
                  {orders.map((order: any) => (
                    <div key={order.id} className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{order.title || `Order #${order.id.slice(0, 8)}`}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-muted-foreground">{timeAgo(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold">${order.agreed_price?.toLocaleString()}</p>
                        <div className="flex gap-1 mt-1 justify-end">
                          <Link href={`/buyer/orders/${order.id}`}>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Track</Button>
                          </Link>
                          <Link href={`/messages?order=${order.id}`}>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">Message</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ShoppingBag className="w-14 h-14" />}
                  message="No orders yet. Browse products to get started"
                />
              )}
            </CardContent>
          </Card>

          {/* Requests Performance Summary */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">Your Requests Overview</h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.open}</p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">Open</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{stats.negotiating}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">Negotiating</p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold">{stats.closed}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Closed</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
                {stats.total > 0 && <>
                  <div className="bg-green-500 transition-all" style={{ width: `${(stats.open / stats.total) * 100}%` }} />
                  <div className="bg-yellow-400 transition-all" style={{ width: `${(stats.negotiating / stats.total) * 100}%` }} />
                  <div className="bg-gray-300 dark:bg-gray-600 transition-all" style={{ width: `${(stats.closed / stats.total) * 100}%` }} />
                </>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{stats.total} total requests</p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/buyer/requests/create", icon: <Plus className="w-5 h-5" />, label: "Create Request", primary: true },
                  { href: "/listings", icon: <Search className="w-5 h-5" />, label: "Browse Products" },
                  { href: "/buyer/orders", icon: <ShoppingBag className="w-5 h-5" />, label: "View Orders" },
                  { href: "/messages", icon: <MessageSquare className="w-5 h-5" />, label: "Messages", badge: unreadMessages > 0 ? unreadMessages : undefined },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                      action.primary
                        ? "bg-primary text-primary-foreground hover:bg-foreground/90"
                        : "hover:bg-secondary border border-border"
                    }`}>
                      {action.icon}
                      <span className="text-xs font-medium leading-tight">{action.label}</span>
                      {action.badge && (
                        <span className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                          {action.badge}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Recent Activity" href="/notifications" label="View all" />
              <div className="space-y-3">
                {requests.slice(0, 4).length > 0 ? requests.slice(0, 4).map((req: any) => (
                  <div key={req.id} className="flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">New activity</span> on{" "}
                        <span className="text-foreground/70 truncate inline-block max-w-[120px] align-bottom">{req.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(req.created_at)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Seller Dashboard ───────────────────────────────────────────────────────────

function SellerDashboard({ data }: { data: any }) {
  const { stats, requests, orders, offers, products } = data;
  const pendingOrders = orders.filter((o: any) => o.status === "pending");

  return (
    <div className="space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Package className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          value={stats.totalProducts}
          label="Active products"
          trend="neutral"
          href="/seller/products"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5 text-red-600" />}
          iconBg="bg-red-100 dark:bg-red-900/30"
          value={stats.pendingOrders}
          label="Require action"
          href="/seller/orders"
          urgent
        />
        <StatCard
          icon={<Truck className="w-5 h-5 text-indigo-600" />}
          iconBg="bg-indigo-100 dark:bg-indigo-900/30"
          value={stats.activeOrders}
          label="In progress"
          href="/seller/orders"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5 text-green-600" />}
          iconBg="bg-green-100 dark:bg-green-900/30"
          value={`${stats.monthlyRevenue.toLocaleString()} ETB`}
          label={`${new Date().toLocaleString("default", { month: "long" })} revenue`}
          trend="up"
          trendLabel="+12% vs last month"
        />
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Pending Actions Alert */}
          {pendingOrders.length > 0 && (
            <Card className="border-red-200 dark:border-red-800 shadow-none bg-red-50 dark:bg-red-900/10">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                    You have {pendingOrders.length} order{pendingOrders.length !== 1 ? "s" : ""} requiring action
                  </p>
                </div>
                <div className="space-y-2">
                  {pendingOrders.slice(0, 3).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between bg-white dark:bg-background/60 rounded-lg px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{order.title || `Order #${order.id.slice(0, 8)}`}</p>
                        <p className="text-xs text-muted-foreground">${order.agreed_price?.toLocaleString()} · {timeAgo(order.created_at)}</p>
                      </div>
                      <div className="flex gap-2 ml-3 flex-shrink-0">
                        <Button size="sm" className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-3">Accept</Button>
                        <Button size="sm" variant="outline" className="h-7 border-red-300 text-red-600 hover:bg-red-50 text-xs px-3">Reject</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Orders */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Recent Orders" href="/seller/orders" />
              {orders.length > 0 ? (
                <div className="space-y-1">
                  {orders.map((order: any) => (
                    <div key={order.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-xs font-bold text-muted-foreground">
                        {order.buyer_id?.slice(0, 2).toUpperCase() || "B"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{order.title || `Order #${order.id.slice(0, 8)}`}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-muted-foreground">{timeAgo(order.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p className="text-sm font-semibold">${order.agreed_price?.toLocaleString()}</p>
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button size="sm" variant="outline" className="h-7 px-2 text-xs">
                            {order.status === "pending" ? "Accept" : order.status === "accepted" ? "Mark Shipped" : order.status === "shipped" ? "Delivered" : "View"}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<ShoppingBag className="w-14 h-14" />}
                  message="No orders yet. Your products will appear to buyers soon"
                />
              )}
            </CardContent>
          </Card>

          {/* My Offers */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Your Offers" href="/seller/offers" />
              {offers.length > 0 ? (
                <div className="space-y-1">
                  {offers.map((offer: any) => (
                    <div key={offer.id} className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{offer.requests?.title || `Offer for request`}</p>
                        <p className="text-xs text-muted-foreground">${offer.price?.toLocaleString()} · {timeAgo(offer.created_at)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={offer.status} />
                        <Link href={`/requests/${offer.request_id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Send className="w-14 h-14" />}
                  message="No offers submitted. Browse buyer requests"
                  action={
                    <Link href="/listings">
                      <Button size="sm" variant="outline">Explore Requests</Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">This Month's Performance</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {[
                  { label: "Total Orders", value: stats.totalOrders, color: "text-foreground" },
                  { label: "Delivered", value: stats.deliveredOrders, color: "text-green-600" },
                  { label: "In Progress", value: stats.activeOrders, color: "text-blue-600" },
                  { label: "Cancelled", value: stats.cancelledOrders, color: "text-red-600" },
                  { label: "Offers Sent", value: stats.totalOffers, color: "text-indigo-600" },
                  { label: "Accepted", value: stats.acceptedOffers, color: "text-green-600" },
                ].map((item) => (
                  <div key={item.label} className="p-3 rounded-xl bg-secondary/50 text-center">
                    <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-foreground/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">{stats.monthlyRevenue.toLocaleString()} ETB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: "/seller/products/create", icon: <Plus className="w-5 h-5" />, label: "Add Product", primary: true },
                  { href: "/listings", icon: <Search className="w-5 h-5" />, label: "Browse Requests" },
                  { href: "/seller/orders", icon: <ShoppingBag className="w-5 h-5" />, label: "View Orders" },
                  { href: "/messages", icon: <MessageSquare className="w-5 h-5" />, label: "Messages" },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                      action.primary
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "hover:bg-secondary border border-border"
                    }`}>
                      {action.icon}
                      <span className="text-xs font-medium leading-tight">{action.label}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Buyer Requests */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="New Buyer Requests" href="/listings" label="Browse all" />
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((req: any) => (
                    <div key={req.id} className="p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium line-clamp-1 flex-1">{req.title}</p>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(req.created_at)}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-semibold">${req.budget_min?.toLocaleString()} – ${req.budget_max?.toLocaleString()}</p>
                        <Link href={`/requests/${req.id}/make-offer`}>
                          <Button size="sm" className="h-7 px-3 text-xs">Make Offer</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FileText className="w-12 h-12" />}
                  message="No open requests available"
                />
              )}
            </CardContent>
          </Card>

          {/* Top Products */}
          {products.length > 0 && (
            <Card className="border-border shadow-none">
              <CardContent className="p-6">
                <SectionHeader title="Top Products" href="/seller/products" label="View analytics" />
                <div className="space-y-3">
                  {products.map((product: any) => (
                    <div key={product.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name || product.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" /> {product.views || 0}</span>
                          <span className="flex items-center gap-0.5"><ShoppingBag className="w-3 h-3" /> {product.orders_count || 0}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{product.stock || 0} left</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader title="Recent Activity" href="/notifications" label="View all" />
              <div className="space-y-3">
                {orders.slice(0, 4).length > 0 ? orders.slice(0, 4).map((order: any) => (
                  <div key={order.id} className="flex items-start gap-3 text-sm">
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <ShoppingBag className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm leading-snug">New order received</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{timeAgo(order.created_at)}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role: urlRole } = await searchParams;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const isBuyer = profile.user_type === "buyer" || profile.user_type === "both";
  const isSeller = profile.user_type === "seller" || profile.user_type === "both";
  const isDual = profile.user_type === "both";

  let activeRole: "buyer" | "seller" = "buyer";
  if (urlRole === "seller" && isSeller) activeRole = "seller";
  else if (urlRole === "buyer" && isBuyer) activeRole = "buyer";
  else if (isSeller && !isBuyer) activeRole = "seller";

  const data = activeRole === "seller" && isSeller
    ? await getSellerData(user.id)
    : await getBuyerData(user.id);

  const firstName = profile.first_name || "there";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </Link>
            <Link href="/profile">
              <div className="w-9 h-9 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                {profile.first_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || "U"}
              </div>
            </Link>
          </div>
        </div>

        {/* ── Role Switcher ── */}
        {isDual && (
          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl w-fit">
              <Link
                href="/dashboard?role=buyer"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRole === "buyer"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" />
                Buyer
              </Link>
              <Link
                href="/dashboard?role=seller"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRole === "seller"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Store className="w-4 h-4" />
                Seller
              </Link>
            </div>
            {activeRole === "buyer" && isSeller && (
              <p className="text-xs text-muted-foreground">Switch to manage your seller activity</p>
            )}
          </div>
        )}

        {/* ── Dashboard Content ── */}
        {activeRole === "buyer" && isBuyer && <BuyerDashboard data={data} firstName={firstName} />}
        {activeRole === "seller" && isSeller && <SellerDashboard data={data} />}
      </main>
    </div>
  );
}