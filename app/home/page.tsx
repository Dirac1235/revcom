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

  useEffect(() => {
    // Keep query in sync with URL
    setQuery(qParam);
  }, [qParam]);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function load() {
      setLoading(true);
      try {
        // fetch current user (if any)
        const userRes = await supabase.auth.getUser();
        const uid = userRes?.data?.user?.id ?? null;
        if (!mounted) return;
        setUserId(uid);

        // fetch listings, filter by query if provided
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
        // swallow — show empty state
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
    <div className="min-h-screen bg-linear-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              Buyer Requests
            </h1>
            <p className="text-muted-foreground">
              Browse buyer needs and requests or search for something specific.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                router.push(`/home${q ? `?q=${encodeURIComponent(q)}` : ""}`);
              }}
              className="flex gap-2"
            >
              <input
                className="input bg-card border-border px-3 py-2 rounded-md w-56"
                placeholder="Search buyer requests..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
              >
                Search
              </Button>
            </form>

            {userId ? (
              <Link href="/buyer/requests/create">
                <Button
                  variant="secondary"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-md shadow-blue-500/30"
                >
                  Create Request
                </Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
                >
                  Sign in to create
                </Button>
              </Link>
            )}
          </div>
        </div>

        <section>
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : listings && listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {listings.map((l: any) => (
                <Card
                  key={l.id}
                  className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                >
                  <CardHeader>
                    <CardTitle className="text-blue-600 dark:text-blue-400">
                      {l.title}
                    </CardTitle>
                    <CardDescription>{l.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {l.budget_min && l.budget_max
                        ? `$${l.budget_min} - $${l.budget_max}`
                        : "Budget not specified"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Status: {l.status ?? "open"}
                    </p>
                    {l.buyer_id === userId && (
                      <p className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Your request
                      </p>
                    )}
                    <div className="mt-4">
                      <Link href={`/listings/${l.id}`}>
                        <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30 w-full">
                          View
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <p className="text-muted-foreground">No buyer requests found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
