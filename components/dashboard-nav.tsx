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

  const [clientUser, setClientUser] = useState(user ?? null);
  const [clientProfile, setClientProfile] = useState(profile ?? null);
  const [search, setSearch] = useState(searchParams?.get("q") ?? "");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then((res: any) => {
      setClientUser(res?.data?.user ?? null);
    });

    const { data } = supabase.auth.onAuthStateChange(
      (_event: any, session: any) => {
        const u = session?.user ?? null;
        setClientUser(u);

        if (u) {
          supabase
            .from("profiles")
            .select("*")
            .eq("id", u.id)
            .single()
            .then((r: any) => setClientProfile(r.data));
        } else {
          setClientProfile(null);
        }
      }
    );

    return () => data?.subscription?.unsubscribe();
  }, []);

  const displayUser = clientUser ?? user;
  const displayProfile = clientProfile ?? profile;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setClientUser(null);
    setClientProfile(null);
    router.push("/");
  };

  /* --------------------------------------------
    Public Navigation
  --------------------------------------------- */

  if (!displayUser) {
    return (
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            RevCom
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }

  /* --------------------------------------------
    Authenticated Navigation
  --------------------------------------------- */

  return (
    <nav className="border-b bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Brand */}
        <Link href="/dashboard" className="text-2xl font-bold text-primary">
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

          {/* Search */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = search.trim();
              router.push(`/home${q ? `?q=${encodeURIComponent(q)}` : ""}`);
            }}
            className="hidden md:flex items-center"
          >
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="w-48"
            />
            <Button type="submit" variant="ghost" size="sm" className="ml-2">
              Search
            </Button>
          </form>

          {/* Buyer Tools */}
          {(displayProfile?.user_type === "buyer" ||
            displayProfile?.user_type === "both") && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">Buyer</Button>
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
                <Button variant="ghost" size="sm">Seller</Button>
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
