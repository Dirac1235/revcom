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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

type Listing = {
  id: string;
  title: string;
  description?: string;
  budget_min?: number;
  budget_max?: number;
  category?: string;
  buyer_id?: string;
  status?: string;
  created_at?: string;
};

const categories = [
  "Electronics",
  "Furniture",
  "Clothing",
  "Books",
  "Home & Garden",
  "Sports & Outdoors",
  "Toys & Games",
  "Services",
  "Other",
];

export default function ListingsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchParam = searchParams?.get("search") ?? "";
  const categoryParam = searchParams?.get("category") ?? "all";

  const [query, setQuery] = useState<string>(searchParam);
  const [category, setCategory] = useState<string>(categoryParam === "" ? "all" : categoryParam);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Keep query and category in sync with URL
    setQuery(searchParam);
    setCategory(categoryParam === "" ? "all" : categoryParam);
  }, [searchParam, categoryParam]);

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

        // fetch buyer requests with filters
        let builder = supabase
          .from("requests")
          .select("*")
          .eq("status", "open");

        // Apply search filter
        if (query && query.trim() !== "") {
          const q = query.trim();
          builder = builder.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
        }

        // Apply category filter
        if (category && category.trim() !== "" && category !== "all") {
          builder = builder.eq("category", category);
        }

        const { data: listingsData, error } = await builder
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;
        if (!mounted) return;
        setListings(listingsData ?? []);
      } catch (e) {
        console.error("Error loading listings:", e);
        setListings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [query, category]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category && category !== "all") params.set("category", category);
    router.push(`/listings?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (value && value !== "all") params.set("category", value);
    router.push(`/listings?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    router.push("/listings");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Browse Buyer Requests
          </h1>
          <p className="text-muted-foreground">
            Search and filter through buyer needs and requests
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-8 border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Search Input */}
                <div className="md:col-span-2">
                  <label className="text-sm font-medium mb-2 block text-foreground">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search by title or description..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      className="pl-10 border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">
                    Category
                  </label>
                  <Select value={category || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                {(query || (category && category !== "all")) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearFilters}
                    className="hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results Section */}
        <section>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Loading buyer requests...</p>
            </div>
          ) : listings && listings.length > 0 ? (
            <>
              <div className="mb-4 text-sm text-muted-foreground">
                Found {listings.length} request{listings.length !== 1 ? "s" : ""}
                {query && ` matching "${query}"`}
                {category && category !== "all" && ` in ${category}`}
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {listings.map((l: any) => (
                  <Card
                    key={l.id}
                    className="hover:shadow-xl transition-all duration-300 hover:scale-105 border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm"
                  >
                    <CardHeader>
                      <CardTitle className="text-blue-600 dark:text-blue-400 line-clamp-2">
                        {l.title}
                      </CardTitle>
                      <CardDescription>
                        {l.category || "Uncategorized"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {l.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {l.description}
                        </p>
                      )}
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        {l.budget_min && l.budget_max
                          ? `$${l.budget_min} - $${l.budget_max}`
                          : "Budget not specified"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        {l.created_at &&
                          new Date(l.created_at).toLocaleDateString()}
                      </p>
                      {l.buyer_id === userId && (
                        <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-2">
                          Your request
                        </p>
                      )}
                      <div className="mt-4">
                        <Link href={`/listings/${l.id}`}>
                          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-md shadow-blue-500/30 w-full">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card className="border-blue-100 dark:border-blue-900/50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm">
              <CardContent className="py-12 text-center">
                <Filter className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-2">
                  No buyer requests found.
                </p>
                <p className="text-sm text-muted-foreground">
                  {query || (category && category !== "all")
                    ? "Try adjusting your search or filters."
                    : "No buyer requests available at the moment."}
                </p>
                {(query || (category && category !== "all")) && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="mt-4 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  );
}
