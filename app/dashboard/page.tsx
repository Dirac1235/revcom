import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Search,
  User,
  Store,
  Bell,
  Plus,
  Package,
  Truck,
  MessageSquare,
  AlertCircle,
  BarChart2,
  Eye,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  DollarSign,
  Star,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { getBuyerData, getSellerData } from "@/lib/data/dash-data";
import { BuyerDashboard } from "@/components/dashboard/BuyerDashboard";
import { SellerDashboard } from "@/components/dashboard/SellerDashboard";


export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role: urlRole } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
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
  const isSeller =
    profile.user_type === "seller" || profile.user_type === "both";
  const isDual = profile.user_type === "both";

  let activeRole: "buyer" | "seller" = "buyer";
  if (urlRole === "seller" && isSeller) activeRole = "seller";
  else if (urlRole === "buyer" && isBuyer) activeRole = "buyer";
  else if (isSeller && !isBuyer) activeRole = "seller";

  const data =
    activeRole === "seller" && isSeller
      ? await getSellerData(user.id)
      : await getBuyerData(user.id);

  const firstName = profile.first_name || "there";

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold font-serif tracking-tight">
              Welcome back, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/notifications">
              <button className="relative p-2 hover:bg-secondary rounded-full transition-colors">
                <Bell className="w-5 h-5 text-muted-foreground" />
                {data.unreadNotifications > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
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
              <p className="text-xs text-muted-foreground">
                Switch to manage your seller activity
              </p>
            )}
          </div>
        )}

        {/* ── Dashboard Content ── */}
        {activeRole === "buyer" && isBuyer && <BuyerDashboard data={data} />}
        {activeRole === "seller" && isSeller && <SellerDashboard data={data} />}
      </main>
    </div>
  );
}
