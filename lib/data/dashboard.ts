import { createClient } from "@/lib/supabase/client";
import { getBuyerRequests } from "./requests";
import { getBuyerOrders, getSellerOrders } from "./orders";
import { getListings } from "./listings";
import { getProfileById } from "./profiles";

export async function getBuyerDashboardData(userId: string) {
  const supabase = createClient();
  
  const [listingsRes, ordersRes] = await Promise.all([
    getBuyerRequests(userId),
    getBuyerOrders(userId),
  ]);

  const listings = listingsRes || [];
  const orders = ordersRes || [];

  return {
    listings,
    orders,
    stats: {
      total: listings.length,
      open: listings.filter((l: any) => l.status === 'open').length,
      negotiating: listings.filter((l: any) => l.status === 'negotiating').length,
      closed: listings.filter((l: any) => l.status === 'closed').length,
      offers: 0
    }
  };
}

export async function getSellerDashboardData(userId: string) {
  const supabase = createClient();
  
  const [requestsRes, ordersRes] = await Promise.all([
    supabase.from("requests").select("*").eq("status", "open").order("created_at", { ascending: false }).limit(6),
    getSellerOrders(userId),
  ]);

  let offers: any[] = [];
  try {
    const { data } = await supabase
      .from("offers")
      .select("*")
      .eq("seller_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);
    offers = data || [];
  } catch (e) {
    console.log('Offers table not available');
  }

  const orders = ordersRes || [];
  const requests = requestsRes.data || [];

  return {
    requests,
    offers,
    orders,
    stats: {
      totalOffers: offers.length,
      pending: offers.filter((o: any) => o.status === 'pending').length,
      accepted: offers.filter((o: any) => o.status === 'accepted').length,
      rejected: offers.filter((o: any) => o.status === 'rejected').length,
      completed: orders.filter((o: any) => o.status === 'delivered').length
    }
  };
}

export async function getHomePageStats() {
  const supabase = createClient();
  
  const [usersRes, productsRes, requestsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
  ]);

  return {
    users: usersRes.count || 0,
    products: productsRes.count || 0,
    requests: requestsRes.count || 0,
  };
}
