import { createClient } from "../supabase/server";

export async function getBuyerData(userId: string) {
  const supabase = await createClient();

  const [requestsRes, ordersRes, conversationsRes, notificationsRes] =
    await Promise.all([
      supabase
        .from("requests")
        .select("*, offers(count)")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("orders")
        .select("*")
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id")
        .or(
          `participant_1_id.eq.${userId},participant_2_id.eq.${userId}`,
        ),
      supabase
        .from("notifications")
        .select("id")
        .eq("user_id", userId)
        .eq("read", false),
    ]);

  let unreadMessages = 0;
  const convIds = (conversationsRes.data || []).map((c: any) => c.id);
  if (convIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", convIds)
      .neq("sender_id", userId)
      .eq("read", false);
    unreadMessages = count || 0;
  }

  const requests = requestsRes.data || [];
  const orders = ordersRes.data || [];
  const unreadNotifications = notificationsRes.data?.length || 0;

  const activeRequests = requests.filter(
    (r: any) => r.status === "open",
  ).length;
  const pendingOrders = orders.filter(
    (o: any) => o.status === "pending",
  ).length;
  const activeOrders = orders.filter((o: any) =>
    ["accepted", "shipped"].includes(o.status),
  ).length;

  return {
    requests: requests.slice(0, 5),
    orders: orders.slice(0, 5),
    unreadMessages,
    unreadNotifications,
    stats: {
      activeRequests,
      pendingOrders,
      activeOrders,
      unreadMessages,
      total: requests.length,
      open: requests.filter((r: any) => r.status === "open").length,
      negotiating: requests.filter((r: any) => r.status === "negotiating")
        .length,
      closed: requests.filter((r: any) => r.status === "closed").length,
    },
  };
}

export async function getSellerData(userId: string) {
  const supabase = await createClient();

  const [
    requestsRes,
    ordersRes,
    offersRes,
    productsRes,
    conversationsRes,
    notificationsRes,
  ] = await Promise.all([
    supabase
      .from("requests")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false }),
    supabase
      .from("orders")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    supabase
      .from("offers")
      .select("*, requests(title)")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false }),
    supabase.from("listings").select("*").eq("seller_id", userId),
    supabase
      .from("conversations")
      .select("id")
      .or(
        `participant_1_id.eq.${userId},participant_2_id.eq.${userId}`,
      ),
    supabase
      .from("notifications")
      .select("id")
      .eq("user_id", userId)
      .eq("read", false),
  ]);

  const requests = requestsRes.data || [];
  const orders = ordersRes.data || [];
  const offers = offersRes.data || [];
  const products = productsRes.data || [];
  const unreadNotifications = notificationsRes.data?.length || 0;

  let unreadMessages = 0;
  const sellerConvIds = (conversationsRes.data || []).map((c: any) => c.id);
  if (sellerConvIds.length > 0) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .in("conversation_id", sellerConvIds)
      .neq("sender_id", userId)
      .eq("read", false);
    unreadMessages = count || 0;
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlyRevenue = orders
    .filter(
      (o: any) =>
        o.status === "delivered" && new Date(o.updated_at) >= startOfMonth,
    )
    .reduce((sum: number, o: any) => sum + (o.agreed_price || 0), 0);

  return {
    requests: requests.slice(0, 6),
    orders: orders.slice(0, 5),
    offers: offers.slice(0, 5),
    products: products.slice(0, 3),
    unreadMessages,
    unreadNotifications,
    stats: {
      totalProducts: products.filter((p: any) => p.status === "active").length,
      pendingOrders: orders.filter((o: any) => o.status === "pending").length,
      activeOrders: orders.filter((o: any) =>
        ["accepted", "shipped"].includes(o.status),
      ).length,
      monthlyRevenue,
      totalOffers: offers.length,
      pendingOffers: offers.filter((o: any) => o.status === "pending").length,
      acceptedOffers: offers.filter((o: any) => o.status === "accepted").length,
      rejectedOffers: offers.filter((o: any) => o.status === "rejected").length,
      deliveredOrders: orders.filter((o: any) => o.status === "delivered")
        .length,
      cancelledOrders: orders.filter((o: any) => o.status === "cancelled")
        .length,
      totalOrders: orders.length,
    },
  };
}