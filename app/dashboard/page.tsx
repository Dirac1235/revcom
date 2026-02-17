"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RoleSwitcher, DashboardHeader } from "@/components/dashboard/RoleSwitcher";
import { Loader2, Plus, ArrowRight, FileText, ShoppingBag, TrendingUp, Clock, CheckCircle, XCircle, Send, Search, User, Store, Bell } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [activeRole, setActiveRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const [buyerData, setBuyerData] = useState<{
    listings: any[];
    orders: any[];
    stats: { total: number; open: number; negotiating: number; closed: number; offers: number }
  }>({
    listings: [],
    orders: [],
    stats: { total: 0, open: 0, negotiating: 0, closed: 0, offers: 0 }
  });
  
  const [sellerData, setSellerData] = useState<{
    requests: any[];
    offers: any[];
    orders: any[];
    stats: { totalOffers: number; pending: number; accepted: number; rejected: number; completed: number }
  }>({
    requests: [],
    offers: [],
    orders: [],
    stats: { totalOffers: 0, pending: 0, accepted: 0, rejected: 0, completed: 0 }
  });

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    setMounted(true);
    initAuth();
  }, []);

  useEffect(() => {
    if (mounted && profile) {
      if (profile.user_type === 'seller') {
        setActiveRole('seller');
      } else if (profile.user_type === 'both') {
        setActiveRole('buyer');
      }
    }
  }, [mounted, profile]);

  useEffect(() => {
    if (mounted && user && profile) {
      fetchDashboardData();
    }
  }, [mounted, user, profile, activeRole]);

  const fetchDashboardData = async () => {
    if (!user || !profile) return;

    try {
      if (activeRole === 'buyer') {
        const [listingsRes, ordersRes] = await Promise.all([
          supabase.from('requests').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('*').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(5)
        ]);

        const listings = listingsRes.data || [];
        const orders = ordersRes.data || [];
        
        setBuyerData({
          listings,
          orders,
          stats: {
            total: listingsRes.count || 0,
            open: listings.filter((l: any) => l.status === 'open').length,
            negotiating: listings.filter((l: any) => l.status === 'negotiating').length,
            closed: listings.filter((l: any) => l.status === 'closed').length,
            offers: 0
          }
        });
      } else {
        const [requestsRes, ordersRes] = await Promise.all([
          supabase.from('requests').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(6),
          supabase.from('orders').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5)
        ]);

        let offers: any[] = [];
        try {
          const offersRes = await supabase.from('offers').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5);
          offers = offersRes.data || [];
        } catch (e) {
          console.log('Offers table not available');
        }

        const orders = ordersRes.data || [];
        const requests = requestsRes.data || [];

        setSellerData({
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
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center flex-col gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  const isBuyer = profile.user_type === 'buyer' || profile.user_type === 'both';
  const isSeller = profile.user_type === 'seller' || profile.user_type === 'both';

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {profile?.first_name || 'there'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            
            <Link href="/profile">
              <div className="flex items-center gap-2 hover:bg-secondary px-3 py-2 rounded-full transition-colors cursor-pointer">
                <div className="w-8 h-8 bg-foreground text-background rounded-full flex items-center justify-center text-sm font-medium">
                  {profile?.first_name?.[0] || profile?.email?.[0] || 'U'}
                </div>
              </div>
            </Link>
          </div>
        </div>

        {profile.user_type === 'both' && (
          <div className="mb-8">
            <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg w-fit">
              <button
                onClick={() => setActiveRole('buyer')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeRole === 'buyer'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <User className="w-4 h-4" />
                Buyer
              </button>
              <button
                onClick={() => setActiveRole('seller')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeRole === 'seller'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Store className="w-4 h-4" />
                Seller
              </button>
            </div>
          </div>
        )}

        {activeRole === 'buyer' && isBuyer && (
          <BuyerDashboard 
            data={buyerData} 
            loading={loading} 
            userId={user?.id}
          />
        )}

        {activeRole === 'seller' && isSeller && (
          <SellerDashboard 
            data={sellerData} 
            loading={loading}
            userId={user?.id}
          />
        )}
      </main>
    </div>
  );
}

function BuyerDashboard({ data, loading, userId }: { data: any, loading: boolean, userId?: string }) {
  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    negotiating: 'bg-yellow-100 text-yellow-800',
    closed: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      {/* Primary Action */}
      <Card className="border-border shadow-none bg-foreground text-background">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Ready to find what you need?</h2>
              <p className="text-foreground/80">Post your requirement and let sellers come to you.</p>
            </div>
            <Link href="/buyer/requests/create">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2">
                <Plus className="w-5 h-5" />
                Post Your Need
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.open}</p>
                <p className="text-xs text-muted-foreground">Open</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.negotiating}</p>
                <p className="text-xs text-muted-foreground">Negotiating</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.orders.length}</p>
                <p className="text-xs text-muted-foreground">Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">My Listings</CardTitle>
              <Link href="/buyer/requests">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.listings.length > 0 ? (
              <div className="space-y-3">
                {data.listings.map((listing: any) => (
                  <Link key={listing.id} href={`/buyer/requests/${listing.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{listing.title}</p>
                        <p className="text-sm text-muted-foreground">{listing.category}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[listing.status] || 'bg-gray-100'}`}>
                        {listing.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No listings yet</p>
                <Link href="/buyer/requests/create">
                  <Button variant="outline" size="sm" className="mt-3">Create Your First</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Orders */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Orders</CardTitle>
              <Link href="/buyer/orders">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {data.orders.length > 0 ? (
              <div className="space-y-3">
                {data.orders.map((order: any) => (
                  <Link key={order.id} href={`/buyer/orders/${order.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{order.title}</p>
                        <p className="text-sm text-muted-foreground">${order.agreed_price?.toLocaleString()}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status] || 'bg-gray-100'}`}>
                        {order.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground">No orders yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SellerDashboard({ data, loading, userId }: { data: any, loading: boolean, userId?: string }) {
  const statusColors: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="space-y-8">
      {/* Primary Action */}
      <Card className="border-border shadow-none bg-foreground text-background">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Find your next opportunity</h2>
              <p className="text-foreground/80">Browse buyer requests and send competitive offers.</p>
            </div>
            <Link href="/seller/explore">
              <Button size="lg" className="bg-background text-foreground hover:bg-background/90 gap-2">
                <Search className="w-5 h-5" />
                Explore Needs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Send className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.totalOffers}</p>
                <p className="text-xs text-muted-foreground">Total Offers</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.accepted}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.rejected}</p>
                <p className="text-xs text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Offers */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Offers</CardTitle>
            <Link href="/seller/orders">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.offers.length > 0 ? (
            <div className="space-y-3">
              {data.offers.map((offer: any) => (
                <div key={offer.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Offer for {offer.request_id?.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">${offer.price?.toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[offer.status] || 'bg-gray-100'}`}>
                    {offer.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Send className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No offers sent yet</p>
              <Link href="/seller/explore">
                <Button variant="outline" size="sm" className="mt-3">Explore Requests</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recommended Needs */}
      <Card className="border-border shadow-none">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recommended Needs</CardTitle>
            <Link href="/seller/explore">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {data.requests.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.requests.slice(0, 6).map((request: any) => (
                <div key={request.id} className="p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium line-clamp-1">{request.title}</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Open</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{request.category}</p>
                  <p className="text-sm font-semibold">${request.budget_min?.toLocaleString()} - ${request.budget_max?.toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">No requests available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
