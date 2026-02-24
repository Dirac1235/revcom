"use client";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  Grid,
  List,
  Search,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoadingState } from "../features/LoadingState";
import { RequestCard } from "../features/RequestCard";
import { EmptyState } from "../features/EmptyState";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRequests } from "@/lib/hooks/useRequests";

const PER_PAGE = 12;

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

export function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isSeller } = useAuth();

  const searchParam = searchParams?.get("search") ?? "";
  const categoryParam = searchParams?.get("category") ?? "all";

  const [query, setQuery] = useState<string>(searchParam);
  const [category, setCategory] = useState<string>(
    categoryParam === "" ? "all" : categoryParam,
  );
  const [page, setPage] = useState(1);

  const {
    requests: listings,
    loading,
    error,
  } = useRequests({
    category: category && category !== "all" ? category : undefined,
    search: query?.trim() || undefined,
  });

  useEffect(() => {
    setQuery(searchParam);
    setCategory(categoryParam === "" ? "all" : categoryParam);
    setPage(1);
  }, [searchParam, categoryParam]);

  const totalPages = Math.max(1, Math.ceil(listings.length / PER_PAGE));
  const paginatedListings = useMemo(
    () => listings.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [listings, page],
  );

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (category && category !== "all") params.set("category", category);
    router.push(`/requests?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(1);
    const params = new URLSearchParams();
    if (query.trim()) params.set("search", query.trim());
    if (value && value !== "all") params.set("category", value);
    router.push(`/requests?${params.toString()}`);
  };

  const clearFilters = () => {
    setQuery("");
    setCategory("all");
    setPage(1);
    router.push("/requests");
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

        <form onSubmit={handleSearch} className="mb-12 flex items-center gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-10 bg-background border border-border rounded-xl focus-visible:ring-1 focus-visible:border-primary text-base shadow-sm"
            />
          </div>

          {/* Green Search Button */}
          <Button
            type="submit"
            className="bg-primary hover:bg-primary/90 text-white px-8 h-10 rounded-lg font-medium shadow-sm"
          >
            Search
          </Button>

          {/* All Categories Dropdown with Filter Icon */}
          <Select
            value={category || "all"}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="h-12 w-[190px] border border-border bg-background rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Filter className="w-4 h-4" />
                <SelectValue placeholder="All Categories" />
              </div>
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

          {/* View Toggle Buttons (Grid / List) */}
          <div className="flex border border-border rounded-lg overflow-hidden bg-background">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none border-r border-border"
              // onClick={() => setView("grid")} ← add your view state handler here
            >
              <Grid className="w-5 h-5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-none"
              // onClick={() => setView("list")} ← add your view state handler here
            >
              <List className="w-5 h-5" />
            </Button>
          </div>
        </form>

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
                Found {listings.length} request
                {listings.length !== 1 ? "s" : ""}
                {query && ` matching "${query}"`}
                {category && category !== "all" && ` in ${category}`}
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {paginatedListings.map((l) => (
                  <RequestCard
                    key={l.id}
                    request={l}
                    userId={user?.id ?? null}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-1.5">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border/50"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {pageNumbers.map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`dots-${i}`}
                        className="px-2 text-sm text-muted-foreground"
                      >
                        ...
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="icon"
                        className={`h-9 w-9 text-sm ${page === p ? "shadow-none" : "border-border/50"}`}
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-border/50"
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              icon={Filter}
              title="No requests found"
              description={
                query || (category && category !== "all")
                  ? "Try adjusting your search or filters."
                  : "No buyer requests available at the moment."
              }
              actionLabel={
                query || (category && category !== "all")
                  ? "Clear Filters"
                  : undefined
              }
              onAction={
                query || (category && category !== "all")
                  ? clearFilters
                  : undefined
              }
            />
          )}
        </section>
      </main>
    </div>
  );
}
