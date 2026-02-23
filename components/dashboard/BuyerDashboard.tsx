import Link from "next/link";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Bell, Clock, Edit2, Eye, FileText, MessageSquare, Plus, Search, ShoppingBag, Truck } from "lucide-react";
import { StatCard } from "./StatCard";
import { StatusBadge, timeAgo } from "./StatusBadge";
import { SectionHeader } from "./SectionHeader";
import { EmptyState } from "./EmptyState";

export function BuyerDashboard({ data }: { data: any;}) {
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
          <Card className="border-border shadow-none rounded-xl">
            <CardContent className="p-6">
              <SectionHeader
                title="Your Recent Requests"
                href="/buyer/requests"
              />
              {requests.length > 0 ? (
                <div className="space-y-1">
                  {requests.map((req: any) => (
                    <div
                      key={req.id}
                      className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-medium text-sm truncate">
                            {req.title}
                          </p>
                          <StatusBadge status={req.status} />
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          {req.offers?.[0]?.count > 0 && (
                            <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                              {req.offers[0].count} offer
                              {req.offers[0].count !== 1 ? "s" : ""}
                            </span>
                          )}
                          {req.budget_min && (
                            <span>
                              {req.budget_min.toLocaleString()} –{" "}
                              {req.budget_max?.toLocaleString()} ETB
                            </span>
                          )}
                          <span>{timeAgo(req.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/buyer/requests/${req.id}`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/buyer/requests/${req.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2"
                          >
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
                      <Button size="sm" variant="outline">
                        Create Your First
                      </Button>
                    </Link>
                  }
                />
              )}
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="border-border shadow-none rounded-xl">
            <CardContent className="p-6">
              <SectionHeader title="Recent Orders" href="/buyer/orders" />
              {orders.length > 0 ? (
                <div className="space-y-1">
                  {orders.map((order: any) => (
                    <div
                      key={order.id}
                      className="group flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-secondary/40 transition-colors border-b border-foreground/5 last:border-0"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {order.title || `Order #${order.id.slice(0, 8)}`}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <StatusBadge status={order.status} />
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(order.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold">
                          {order.agreed_price?.toLocaleString()} ETB
                        </p>
                        <div className="flex gap-1 mt-1 justify-end">
                          <Link href={`/buyer/orders/${order.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                            >
                              Track
                            </Button>
                          </Link>
                          <Link href={`/messages?order=${order.id}`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2 text-xs"
                            >
                              Message
                            </Button>
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
          <Card className="border-border shadow-none rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">
                Your Requests Overview
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl bg-green-50 dark:bg-green-900/10">
                  <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {stats.open}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-500 mt-0.5">
                    Open
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/10">
                  <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {stats.negotiating}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-0.5">
                    Negotiating
                  </p>
                </div>
                <div className="text-center p-3 rounded-xl bg-secondary">
                  <p className="text-2xl font-bold">{stats.closed}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Closed</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="flex rounded-full overflow-hidden h-2 gap-0.5">
                {stats.total > 0 && (
                  <>
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${(stats.open / stats.total) * 100}%` }}
                    />
                    <div
                      className="bg-yellow-400 transition-all"
                      style={{
                        width: `${(stats.negotiating / stats.total) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-gray-300 dark:bg-gray-600 transition-all"
                      style={{
                        width: `${(stats.closed / stats.total) * 100}%`,
                      }}
                    />
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stats.total} total requests
              </p>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-border shadow-none rounded-xl">
            <CardContent className="p-6">
              <h2 className="text-base font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    href: "/buyer/requests/create",
                    icon: <Plus className="w-5 h-5" />,
                    label: "Create Request",
                    primary: true,
                  },
                  {
                    href: "/products",
                    icon: <Search className="w-5 h-5" />,
                    label: "Browse Products",
                  },
                  {
                    href: "/buyer/orders",
                    icon: <ShoppingBag className="w-5 h-5" />,
                    label: "View Orders",
                  },
                  {
                    href: "/messages",
                    icon: <MessageSquare className="w-5 h-5" />,
                    label: "Messages",
                    badge: unreadMessages > 0 ? unreadMessages : undefined,
                  },
                ].map((action) => (
                  <Link key={action.href} href={action.href}>
                    <div
                      className={`relative flex flex-col items-center gap-2 p-4 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                        action.primary
                          ? "bg-primary text-primary-foreground hover:bg-foreground/90"
                          : "hover:bg-secondary border border-border"
                      }`}
                    >
                      {action.icon}
                      <span className="text-xs font-medium leading-tight">
                        {action.label}
                      </span>
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
          <Card className="border-border shadow-none rounded-xl">
            <CardContent className="p-6">
              <SectionHeader
                title="Recent Activity"
                href="/notifications"
                label="View all"
              />
              <div className="space-y-3">
                {requests.slice(0, 4).length > 0 ? (
                  requests.slice(0, 4).map((req: any) => (
                    <div
                      key={req.id}
                      className="flex items-start gap-3 text-sm"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Bell className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">
                          <span className="font-medium">New activity</span> on{" "}
                          <span className="text-foreground/70 truncate inline-block max-w-[120px] align-bottom">
                            {req.title}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {timeAgo(req.created_at)}
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