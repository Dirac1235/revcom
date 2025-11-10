"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Plus,
  Settings,
  ShoppingBag,
} from "lucide-react";

export default function DashboardNav({ user, profile }: any) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Always initialize as null - we'll fetch from client immediately
  // This ensures we get the latest auth state, not stale server props
  const [clientUser, setClientUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [search, setSearch] = useState(searchParams?.get("q") ?? "");

  const supabase = createClient();

  useEffect(() => {
    // Initial fetch - check current auth state
    // This always runs on mount and gets the latest state from client
    const fetchUser = async () => {
      try {
        const {
          data: { user: u },
          error,
        } = await supabase.auth.getUser();

        if (!error && u) {
          setClientUser(u);
          // Fetch profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", u.id)
            .single();
          setClientProfile(profileData);
        } else {
          setClientUser(null);
          setClientProfile(null);
        }
      } catch (err) {
        setClientUser(null);
        setClientProfile(null);
      } finally {
        setIsInitialized(true);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      const u = session?.user ?? null;
      // Update user state immediately
      setClientUser(u);

      if (u) {
        // Fetch and update profile state
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", u.id)
          .single();
        setClientProfile(profileData);
      } else {
        setClientProfile(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Always use client state once initialized
  // Only fall back to server props during initial load (before client state is fetched)
  const displayUser = isInitialized ? clientUser : clientUser ?? user;
  const displayProfile = isInitialized
    ? clientProfile
    : clientProfile ?? profile;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setClientUser(null);
    setClientProfile(null);
    router.push("/");
  };

  if (!displayUser) {
    return (
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-blue-100 dark:border-blue-900/50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-blue-600 dark:text-blue-400"
          >
            RevCom
          </Link>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              asChild
              className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button
              asChild
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
            >
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <nav className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-blue-100 dark:border-blue-900/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/dashboard"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          RevCom
        </Link>

        <div className="flex items-center gap-3">
          {/* Home */}
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/home">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>

          {/* Listings */}
          <Button asChild variant="ghost" size="sm" className="gap-2">
            <Link href="/listings">
              <ShoppingBag className="w-4 h-4" />
              Browse
            </Link>
          </Button>

          {/* Buyer Tools */}
          {(displayProfile?.user_type === "buyer" ||
            displayProfile?.user_type === "both") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Buyer
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Buyer Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/buyer/listings">
                    <Plus className="w-4 h-4 mr-2" />
                    My Listings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/buyer/orders">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Seller Tools */}
          {(displayProfile?.user_type === "seller" ||
            displayProfile?.user_type === "both") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Seller
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Seller Tools</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link href="/seller/explore">Explore Requests</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/seller/orders">
                    <Package className="w-4 h-4 mr-2" />
                    Incoming Orders
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Messages */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/messages">Messages</Link>
          </Button>

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link href="/messages">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Messages
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
