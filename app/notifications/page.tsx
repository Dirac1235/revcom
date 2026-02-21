"use server";

import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, MessageSquare, ShoppingBag, Send, CheckCircle, XCircle, DollarSign, FileText } from "lucide-react";

async function getNotifications(userId: string) {
  const supabase = await createClient();
  
  // Get orders where user is buyer or seller
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(20);

  // Get offers where user is the request buyer
  const { data: requests } = await supabase
    .from("requests")
    .select("id, buyer_id, title")
    .eq("buyer_id", userId);

  const requestIds = requests?.map(r => r.id) || [];
  
  let offers: any[] = [];
  if (requestIds.length > 0) {
    const { data: offersData } = await supabase
      .from("offers")
      .select("*")
      .in("request_id", requestIds)
      .order("created_at", { ascending: false })
      .limit(20);
    offers = offersData || [];
  }

  const notifications: Array<{
    id: string;
    type: 'order' | 'offer' | 'message';
    title: string;
    description: string;
    link: string;
    created_at: string;
    read: boolean;
  }> = [];

  // Add order notifications
  if (orders) {
    for (const order of orders) {
      const isBuyer = order.buyer_id === userId;
      notifications.push({
        id: `order-${order.id}`,
        type: 'order',
        title: isBuyer ? 'New Order' : 'Order Received',
        description: `${order.quantity}x ${order.title} - ${order.agreed_price.toLocaleString()} ETB`,
        link: isBuyer ? `/buyer/orders/${order.id}` : `/seller/orders/${order.id}`,
        created_at: order.created_at,
        read: false,
      });
    }
  }

  // Add offer notifications
  for (const offer of offers) {
    const request = requests?.find(r => r.id === offer.request_id);
    notifications.push({
      id: `offer-${offer.id}`,
      type: 'offer',
      title: offer.status === 'pending' ? 'New Offer Received' : `Offer ${offer.status}`,
      description: `${offer.price.toLocaleString()} ETB - ${request?.title || 'Your request'}`,
      link: `/buyer/requests/${offer.request_id}`,
      created_at: offer.created_at,
      read: false,
    });
  }

  // Sort by created_at descending
  notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return notifications.slice(0, 20);
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'order':
      return <ShoppingBag className="w-5 h-5" />;
    case 'offer':
      return <Send className="w-5 h-5" />;
    case 'message':
      return <MessageSquare className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    redirect("/auth/login");
  }

  const notifications = await getNotifications(user.id);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
            <p className="text-muted-foreground mt-1">Stay updated on your orders and offers</p>
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Link key={notification.id} href={notification.link}>
                <Card className={`hover:bg-secondary/50 transition-colors cursor-pointer ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground">{notification.title}</p>
                        <p className="text-sm text-muted-foreground truncate">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">You'll see updates on your orders and offers here</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
