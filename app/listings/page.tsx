"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { RequestCard } from "@/components/features/RequestCard";
import { LoadingState } from "@/components/features/LoadingState";
import { EmptyState } from "@/components/features/EmptyState";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRequests } from "@/lib/hooks/useRequests";

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

function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isSeller } = useAuth();

  const searchParam = searchParams?.get("search") ?? "";
  const categoryParam = searchParams?.get("category") ?? "all";

  const [query, setQuery] = useState<string>(searchParam);
  const [category, setCategory] = useState<string>(categoryParam === "" ? "all" : categoryParam);

  const { requests: listings, loading, error } = useRequests({
    category: category && category !== "all" ? category : undefined,
    search: query?.trim() || undefined,
  });

  useEffect(() => {
    setQuery(searchParam);
    setCategory(categoryParam === "" ? "all" : categoryParam);
  }, [searchParam, categoryParam]);

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
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Browse Buyer Requests
          </h1>
          <p className="text-muted-foreground text-lg">
            Search and filter through buyer needs and requests
          </p>
        </div>

        {/* Search and Filter Section */}
        <Card className="mb-12 border-border bg-card shadow-none rounded-lg">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
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
                      className="pl-10 border-border focus-visible:ring-0 focus-visible:border-foreground h-11"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">
                    Category
                  </label>
                  <Select value={category || "all"} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="border-border focus:ring-0 focus:border-foreground h-11">
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
              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-primary text-background hover:bg-foreground/90 shadow-none"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                {(query || (category && category !== "all")) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearFilters}
                    className="border-foreground/20 hover:bg-foreground hover:text-background"
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
            <LoadingState count={8} type="card" />
          ) : error ? (
            <EmptyState
              icon={Filter}
              title="Error loading requests"
              description="Please try again later."
            />
          ) : listings.length > 0 ? (
            <>
              <div className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
                Found {listings.length} request{listings.length !== 1 ? "s" : ""}
                {query && ` matching "${query}"`}
                {category && category !== "all" && ` in ${category}`}
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {listings.map((l) => (
                  <RequestCard
                    key={l.id}
                    request={l}
                    userId={user?.id ?? null}
                    userType={isSeller ? 'seller' : null}
                  />
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={Filter}
              title="No requests found"
              description={query || (category && category !== "all")
                ? "Try adjusting your search or filters."
                : "No buyer requests available at the moment."}
              actionLabel={query || (category && category !== "all") ? "Clear Filters" : undefined}
              onAction={query || (category && category !== "all") ? clearFilters : undefined}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingState count={1} type="card" /></div>}>
      <ListingsContent />
    </Suspense>
  );
}
