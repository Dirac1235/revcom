import { AlertCircle, DollarSign, Eye, FileText, Link, MessageSquare, Package, Plus, Search, Send, ShoppingBag, Star, Truck } from "lucide-react";
import { StatusBadge, timeAgo } from "./StatusBadge";
import { Card, CardContent } from "../ui/card";
import { SectionHeader } from "./SectionHeader";
import { Button } from "../ui/button";
import { StatCard } from "./StatCard";
import { EmptyState } from "./EmptyState";

export function SellerDashboard({ data }: { data: any }) {
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
          trend={stats.monthlyRevenue > 0 ? "up" : "neutral"}
          trendLabel={stats.monthlyRevenue > 0 ? "From delivered orders" : "No deliveries yet"}
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
                    You have {pendingOrders.length} order
                    {pendingOrders.length !== 1 ? "s" : ""} requiring action
                  </p>
                </div>
                <div className="space-y-2">
                  {pendingOrders.slice(0, 3).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between bg-white dark:bg-background/60 rounded-lg px-4 py-2.5"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {order.title || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.agreed_price?.toLocaleString()} ETB ·{" "}
                          {timeAgo(order.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2 ml-3 shrink-0">
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button
                            size="sm"
                            className="h-7 bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                          >
                            Review
                          </Button>
                        </Link>
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
                    <div
                      key={order.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0"
                    >
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 text-xs font-bold text-muted-foreground">
                        {order.buyer_id?.slice(0, 2).toUpperCase() || "B"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {order.title || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(order.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-semibold">
                          {order.agreed_price?.toLocaleString()} ETB
                        </p>
                        <Link href={`/seller/orders/${order.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs"
                          >
                            {order.status === "pending"
                              ? "Accept"
                              : order.status === "accepted"
                                ? "Mark Shipped"
                                : order.status === "shipped"
                                  ? "Delivered"
                                  : "View"}
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
                    <div
                      key={offer.id}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {offer.requests?.title || `Offer for request`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {offer.price?.toLocaleString()} ETB ·{" "}
                          {timeAgo(offer.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={offer.status} />
                        <Link href={`/buyer/requests/${offer.request_id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs"
                          >
                            View
                          </Button>
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
                    <Link href="/seller/explore">
                      <Button size="sm" variant="outline">
                        Explore Requests
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">
                This Month's Performance
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {[
                  {
                    label: "Total Orders",
                    value: stats.totalOrders,
                    color: "text-foreground",
                  },
                  {
                    label: "Delivered",
                    value: stats.deliveredOrders,
                    color: "text-green-600",
                  },
                  {
                    label: "In Progress",
                    value: stats.activeOrders,
                    color: "text-blue-600",
                  },
                  {
                    label: "Cancelled",
                    value: stats.cancelledOrders,
                    color: "text-red-600",
                  },
                  {
                    label: "Offers Sent",
                    value: stats.totalOffers,
                    color: "text-indigo-600",
                  },
                  {
                    label: "Accepted",
                    value: stats.acceptedOffers,
                    color: "text-green-600",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="p-3 rounded-xl bg-secondary/50 text-center"
                  >
                    <p className={`text-xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-foreground/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-bold">
                    {stats.monthlyRevenue.toLocaleString()} ETB
                  </span>
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
                  {
                    href: "/seller/products/create",
                    icon: <Plus className="w-5 h-5" />,
                    label: "Add Product",
                    primary: true,
                  },
                  {
                    href: "/seller/explore",
                    icon: <Search className="w-5 h-5" />,
                    label: "Browse Requests",
                  },
                  {
                    href: "/seller/orders",
                    icon: <ShoppingBag className="w-5 h-5" />,
                    label: "View Orders",
                  },
                  {
                    href: "/messages",
                    icon: <MessageSquare className="w-5 h-5" />,
                    label: "Messages",
                  },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                        action.primary
                          ? "bg-foreground text-background hover:bg-foreground/90"
                          : "hover:bg-secondary border border-border"
                      }`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium leading-tight">
                        {action.label}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New Buyer Requests */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader
                title="New Buyer Requests"
                href="/seller/explore"
                label="Browse all"
              />
              {requests.length > 0 ? (
                <div className="space-y-3">
                  {requests.slice(0, 5).map((req: any) => (
                    <div
                      key={req.id}
                      className="p-3 rounded-xl border border-border hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium line-clamp-1 flex-1">
                          {req.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {timeAgo(req.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-semibold">
                          {req.budget_min?.toLocaleString()} –{" "}
                          {req.budget_max?.toLocaleString()} ETB
                        </p>
                        <Link href={`/requests/${req.id}/make-offer`}>
                          <Button size="sm" className="h-7 px-3 text-xs">
                            Make Offer
                          </Button>
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
                <SectionHeader
                  title="Top Products"
                  href="/seller/products"
                  label="View analytics"
                />
                <div className="space-y-3">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {product.title}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" /> {product.views || 0}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Star className="w-3 h-3" />{" "}
                            {product.average_rating ? Number(product.average_rating).toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {product.inventory_quantity ?? 0} left
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="border-border shadow-none">
            <CardContent className="p-6">
              <SectionHeader
                title="Recent Activity"
                href="/notifications"
                label="View all"
              />
              <div className="space-y-3">
                {orders.slice(0, 4).length > 0 ? (
                  orders.slice(0, 4).map((order: any) => (
                    <div
                      key={order.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm leading-snug">
                          New order received
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {timeAgo(order.created_at)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}