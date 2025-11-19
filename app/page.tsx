"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Filter, MessageCircle, Sparkles } from "lucide-react";
import SkeletonCard from "@/components/card-skeleton";
import ListingCard from "@/components/listing-card";

type Listing = {
  id: string;
  title: string;
  budget_min?: number;
  budget_max?: number;
  category?: string;
  buyer_id?: string;
  status?: string;
};

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const qParam = searchParams?.get("q") ?? "";

  const [query, setQuery] = useState<string>(qParam);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // === ORIGINAL LOGIC: Sync query with URL ===
  useEffect(() => {
    setQuery(qParam);
  }, [qParam]);

  // === ORIGINAL LOGIC: Fetch user + requests from Supabase ===
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        // Fetch current user
        const userRes = await supabase.auth.getUser();
        const uid = userRes?.data?.user?.id ?? null;
        if (!mounted) return;
        setUserId(uid);

        // Fetch open requests
        let builder = supabase
          .from("requests")
          .select("*")
          .eq("status", "open");

        if (query && query.trim() !== "") {
          const q = `%${query.trim()}%`;
          builder = builder.ilike("title", q);
        }

        const { data: listingsData, error } = await builder
          .order("created_at", { ascending: false })
          .limit(50);

        if (error) throw error;
        if (!mounted) return;
        setListings(listingsData ?? []);
      } catch (e) {
        setListings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* === WELCOME HERO: For NEW USERS (not signed in) === */}
        {!userId && (
          <div className="mb-10 p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-white shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                  <Sparkles className="w-8 h-8" />
                  Welcome to RevCom – Ethiopia’s B2B Marketplace
                </h2>
                <p className="mt-2 text-blue-50">
                  Post your needs, get instant quotes from verified sellers
                  across ET.
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Start Buying
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-blue-700 text-white hover:bg-blue-800"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* === PERSONALIZED GREETING: For LOGGED-IN USERS === */}
        {userId && (
          <div className="mb-8 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between">
            <p className="text-blue-700 dark:text-blue-300 font-medium">
              Welcome back! You have{" "}
              <span className="font-bold text-blue-600">
                {listings?.filter((l) => l.buyer_id === userId).length || 0}{" "}
                active request(s)
              </span>{" "}
              and{" "}
              <span className="font-bold text-green-600">3 new messages</span>.
            </p>
            <Link href="/messages">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <MessageCircle className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
          </div>
        )}

        {/* === HEADER === */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Buyer Requests
            </h1>
            <p className="text-muted-foreground mt-1">
              {userId
                ? "Browse open requests or post your own to attract sellers."
                : "Sign in to post a request and start receiving quotes."}
            </p>
          </div>

          {/* Search + CTA */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                router.push(`/home${q ? `?q=${encodeURIComponent(q)}` : ""}`);
              }}
              className="relative flex gap-2"
            >
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
                <Input
                  className="pl-10 pr-3 py-2 bg-card border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search buyer requests..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
              >
                <Search className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Search</span>
              </Button>
            </form>

            {userId ? (
              <Link href="/buyer/requests/create">
                <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md shadow-blue-500/30">
                  <Plus className="w-4 h-4 mr-1" />
                  Post Request
                </Button>
              </Link>
            ) : (
              <Link href="/auth/signup">
                <Button
                  variant="outline"
                  className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  Sign Up to Post
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Filter by:</span>
          </div>
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
          >
            All Categories
          </Badge>
          <Badge
            variant="secondary"
            className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300"
          >
            Open
          </Badge>
        </div>

        {/* === LISTINGS FROM DATABASE === */}
        <section>
          {loading ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : listings && listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((l: any) => (
                <ListingCard key={l.id} l={l} userId={userId} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="w-12 h-12 text-blue-500 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-2">
                No buyer requests found
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Be the first to post a request and connect with sellers in
                Ethiopia.
              </p>
              {userId ? (
                <Link href="/buyer/requests/create">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Request
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Sign Up & Post Request
                  </Button>
                </Link>
              )}
            </div>
          )}
        </section>

        {/* === MESSAGES PREVIEW (Floating) – Only for logged-in === */}
        {userId && (
          <div className="fixed bottom-24 right-6 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-blue-200 dark:border-blue-700 p-4 z-40">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
              </h4>
              <Badge className="bg-red-500 text-white">3</Badge>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                  A
                </div>
                <div>
                  <p className="font-medium">Addis Chemical Co.</p>
                  <p className="text-muted-foreground text-xs">
                    We can supply Caustic Soda at $5,200/ton...
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 text-white flex items-center justify-center text-xs font-bold">
                  T
                </div>
                <div>
                  <p className="font-medium">TechZone ET</p>
                  <p className="text-muted-foreground text-xs">
                    MacBook Pro M4 available — $178,000
                  </p>
                </div>
              </div>
            </div>
            <Link href="/messages" className="block mt-3">
              <Button
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                View All Messages
              </Button>
            </Link>
          </div>
        )}
      </main>

      {/* === FAB: Create Request === */}
      {userId && (
        <Link href="/buyer/requests/create">
          <Button
            size="lg"
            className="fixed bottom-6 right-6 rounded-full shadow-2xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-blue-500/50 hover:shadow-blue-500/70 transition-all z-50"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </Link>
      )}
    </div>
  );
}
