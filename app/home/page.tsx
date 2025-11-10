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
  price?: number;
  category?: string;
  seller_id?: string;
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
        let builder = supabase.from("listings").select("*");
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
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Listings</h1>
            <p className="text-muted-foreground">
              Browse available listings or search for something specific.
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
                placeholder="Search listings..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit">Search</Button>
            </form>

            {userId ? (
              <Link href="/seller/listings/create">
                <Button variant="secondary">Create Listing</Button>
              </Link>
            ) : (
              <Link href="/auth/login">
                <Button variant="ghost">Sign in to create</Button>
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
                <Card key={l.id}>
                  <CardHeader>
                    <CardTitle>{l.title}</CardTitle>
                    <CardDescription>{l.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-primary">
                      {l.price ? `$${l.price}` : "—"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Status: {l.status ?? "active"}
                    </p>
                    {l.seller_id === userId && (
                      <p className="mt-2 text-sm text-foreground font-medium">
                        Your listing
                      </p>
                    )}
                    <div className="mt-4">
                      <Link href={`/listings/${l.id}`}>
                        <Button>View</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12">
              <p className="text-muted-foreground">No listings found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
