import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  ShoppingBag,
  Send,
  CheckCircle,
  ArrowRight,
  XCircle,
} from "lucide-react";

async function getNotifications(userId: string, filter: string = "all") {
  const supabase = await createClient();

  // Fetch ALL notifications for the user
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }

  let filteredNotifications = notifications || [];

  // Apply filter
  if (filter === "orders") {
    filteredNotifications = filteredNotifications.filter(
      (n) => n.type === "order_status_updated" || n.type === "order_placed",
    );
  } else if (filter === "offers") {
    filteredNotifications = filteredNotifications.filter(
      (n) =>
        n.type === "offer_accepted" ||
        n.type === "offer_rejected" ||
        n.type === "new_offer",
    );
  } else if (filter === "unread") {
    filteredNotifications = filteredNotifications.filter((n) => !n.read);
  }

  return filteredNotifications;
}

async function getAllUnreadCount(userId: string) {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("read", false);

  if (error) return 0;
  return count || 0;
}

async function markAllRead(userId: string) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", userId)
    .eq("read", false);
  revalidatePath("/notifications");
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationConfig(type: string) {
  if (type === "order_status_updated" || type === "order_placed") {
    return {
      icon: <ShoppingBag className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/50",
      badge: "Order",
      badgeColor:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400",
    };
  }
  if (type === "offer_accepted") {
    return {
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50",
      badge: "Offer",
      badgeColor:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400",
    };
  }
  if (type === "offer_rejected") {
    return {
      icon: <XCircle className="w-5 h-5" />,
      color: "text-red-600 bg-red-50 dark:bg-red-950/50",
      badge: "Offer",
      badgeColor:
        "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400",
    };
  }
  if (type === "new_offer") {
    return {
      icon: <Send className="w-5 h-5" />,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/50",
      badge: "New Offer",
      badgeColor:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400",
    };
  }
  return {
    icon: <Bell className="w-5 h-5" />,
    color: "text-primary bg-primary/10",
    badge: "Notification",
    badgeColor: "bg-muted text-muted-foreground",
  };
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { filter } = await searchParams;
  const activeFilter = filter || "all";
  const notifications = await getNotifications(user.id, activeFilter);
  // Get total unread count across all notifications (not just filtered)
  const totalUnreadCount = await getAllUnreadCount(user.id);

  const markAllReadAction = markAllRead.bind(null, user.id);

  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread", count: totalUnreadCount },
    { id: "orders", label: "Orders" },
    { id: "offers", label: "Offers" },
  ];

  return (
    <div className="min-h-screen bg-secondary/10 pb-16">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Notifications
              </h1>
              <p className="text-sm text-muted-foreground">
                Stay updated with your activity
              </p>
            </div>
          </div>

          {totalUnreadCount > 0 && (
            <form action={markAllReadAction}>
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark all read
              </Button>
            </form>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 mb-6 border-b pb-4 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/notifications${tab.id === "all" ? "" : `?filter=${tab.id}`}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1.5
                ${
                  activeFilter === tab.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-1 px-1.5 min-w-[18px] h-4 text-[10px] font-mono"
                >
                  {tab.count}
                </Badge>
              )}
            </Link>
          ))}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => {
              const config = getNotificationConfig(notification.type);
              const isUnread = !notification.read;

              return (
                <Link
                  key={notification.id}
                  href={notification.link || "/dashboard"}
                >
                  <Card
                    className={`group hover:shadow-md transition-all duration-200 border-border/60 overflow-hidden cursor-pointer p-2 mb-2
                      ${isUnread ? "border-l-4 border-l-primary bg-primary/5" : ""}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className={`p-3 rounded-2xl shrink-0 ${config.color}`}
                        >
                          {config.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pt-0.5">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-semibold text-foreground leading-tight">
                              {notification.title}
                            </p>
                            <Badge
                              className={`text-xs px-2 py-px font-medium ${config.badgeColor}`}
                            >
                              {config.badge}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {notification.message}
                          </p>
                        </div>

                        {/* Time + Unread indicator */}
                        <div className="flex flex-col items-end justify-between h-[68px] py-0.5">
                          <p className="text-xs text-muted-foreground whitespace-nowrap">
                            {timeAgo(notification.created_at)}
                          </p>
                          {isUnread && (
                            <div className="w-2 h-2 rounded-full bg-primary ring-2 ring-background" />
                          )}
                          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="border border-border/60 shadow-sm">
            <CardContent className="py-20 text-center">
              <div className="mx-auto w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6">
                <Bell className="w-9 h-9 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                No {activeFilter === "all" ? "" : activeFilter + " "}
                notifications right now.
                <br />
                New offers and order updates will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
