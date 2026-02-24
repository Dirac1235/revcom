"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Filter,
  LayoutGrid,
  List,
  Search,
  X,
  ClipboardList,
  SlidersHorizontal,
  Monitor,
  Sofa,
  Shirt,
  BookOpen,
  Home,
  Dumbbell,
  Gift,
  Briefcase,
  HelpCircle,
  Plus,
} from "lucide-react";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Slider } from "../ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { LoadingState } from "../features/LoadingState";
import { RequestCard } from "../features/RequestCard";
import { EmptyState } from "../features/EmptyState";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRequests } from "@/lib/hooks/useRequests";
import Link from "next/link";

const PER_PAGE = 12;
const MAX_BUDGET = 500000;

const CATEGORIES = [
  { value: "Electronics", label: "Electronics", icon: Monitor },
  { value: "Furniture", label: "Furniture", icon: Sofa },
  { value: "Clothing", label: "Clothing", icon: Shirt },
  { value: "Books", label: "Books", icon: BookOpen },
  { value: "Home & Garden", label: "Home & Garden", icon: Home },
  { value: "Sports & Outdoors", label: "Sports & Outdoors", icon: Dumbbell },
  { value: "Toys & Games", label: "Toys & Games", icon: Gift },
  { value: "Services", label: "Services", icon: Briefcase },
  { value: "Other", label: "Other", icon: HelpCircle },
];

export function ListingsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [query, setQuery] = useState(searchParams?.get("search") ?? "");
  const [category, setCategory] = useState(searchParams?.get("category") ?? "all");
  const [minBudget, setMinBudget] = useState(0);
  const [maxBudget, setMaxBudget] = useState(MAX_BUDGET);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Sync URL params → state
  useEffect(() => {
    const urlQuery = searchParams?.get("search") ?? "";
    const urlCategory = searchParams?.get("category") ?? "all";

    setQuery(urlQuery);
    setCategory(urlCategory);
    setPage(1);
  }, [searchParams]);

  const { requests: listings, loading } = useRequests({
    category: category !== "all" ? category : undefined,
    search: query?.trim() || undefined,
  });

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      const budget = l.budget_max || 0;
      return budget >= minBudget && budget <= maxBudget;
    });
  }, [listings, minBudget, maxBudget]);

  const totalPages = Math.max(1, Math.ceil(filteredListings.length / PER_PAGE));
  const paginatedListings = useMemo(
    () => filteredListings.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filteredListings, page]
  );

  // Keep current page valid after live filtering
  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [totalPages]);

  const updateURL = useCallback((newQuery: string, newCategory: string) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set("search", newQuery.trim());
    if (newCategory && newCategory !== "all") params.set("category", newCategory);
    router.push(`/requests?${params.toString()}`, { scroll: false });
  }, [router]);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    updateURL(query, category);
    setPage(1);
  };

  const resetAllFilters = useCallback(() => {
    setQuery("");
    setCategory("all");
    setMinBudget(0);
    setMaxBudget(MAX_BUDGET);
    setPage(1);
    router.push("/requests", { scroll: false });
  }, [router]);

  const handleCategoryChange = useCallback((newCategory: string) => {
    setCategory(newCategory);
    updateURL(query, newCategory);
    setPage(1);
  }, [query, updateURL]);

  const handleBudgetRangeChange = useCallback((values: number[]) => {
    setMinBudget(values[0]);
    setMaxBudget(values[1]);
    setPage(1);
  }, []);

  const handleMinBudgetInput = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(maxBudget, value));
    setMinBudget(clamped);
    setPage(1);
  }, [maxBudget]);

  const handleMaxBudgetInput = useCallback((value: number) => {
    const clamped = Math.max(minBudget, Math.min(MAX_BUDGET, value));
    setMaxBudget(clamped);
    setPage(1);
  }, [minBudget]);

  const activeFilters = useMemo(() => {
    const filters: Array<{ type: string; value: string; onRemove: () => void }> = [];

    if (query.trim()) {
      filters.push({
        type: "search",
        value: query,
        onRemove: () => { setQuery(""); updateURL("", category); setPage(1); },
      });
    }
    if (category !== "all") {
      filters.push({
        type: "category",
        value: category,
        onRemove: () => { setCategory("all"); updateURL(query, "all"); setPage(1); },
      });
    }
    if (minBudget > 0 || maxBudget < MAX_BUDGET) {
      const rangeStr =
        minBudget === 0
          ? `Up to ${maxBudget.toLocaleString()} ETB`
          : `${minBudget.toLocaleString()} – ${maxBudget.toLocaleString()} ETB`;

      filters.push({
        type: "budget",
        value: rangeStr,
        onRemove: () => {
          setMinBudget(0);
          setMaxBudget(MAX_BUDGET);
          setPage(1);
        },
      });
    }
    return filters;
  }, [query, category, minBudget, maxBudget, updateURL]);

  // Reusable sidebar filters (budget now at bottom)
  const SidebarFilters = () => (
    <div className="space-y-6">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm tracking-tight text-foreground">Active Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="text-xs h-7 px-3 text-muted-foreground hover:text-destructive"
            >
              Clear all
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((f, i) => (
              <Badge
                key={i}
                variant="default"
                className="pl-3 pr-1.5 py-1 rounded-full font-medium"
              >
                {f.value}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 ml-1.5 hover:bg-primary-foreground/20 text-primary-foreground"
                  onClick={f.onRemove}
                  aria-label={`Remove ${f.type} filter`}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div>
        <h3 className="font-semibold text-lg mb-5 flex items-center gap-2">
          <Filter className="w-5 h-5 text-emerald-600" />
          Categories
        </h3>
        <div className="grid grid-cols-1 gap-1">
          <Button
            variant={category === "all" ? "default" : "outline"}
            className="justify-start h-10 font-medium rounded-xl"
            onClick={() => handleCategoryChange("all")}
          >
            All Requests
          </Button>
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = category === cat.value;
            return (
              <Button
                key={cat.value}
                variant={isActive ? "default" : "outline"}
                className={`justify-start h-10 rounded-xl transition-all ${
                  isActive ? "bg-primary text-primary-foreground hover:bg-primary" : ""
                }`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                <Icon className={`mr-3 w-5 h-5 ${isActive ? "text-white" : "text-muted-foreground"}`} />
                {cat.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Budget Range – moved to bottom */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center">
            <span className="text-2xl text-emerald-600">₿</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg tracking-tight">Budget Range</h3>
            <p className="text-xs text-muted-foreground">Set minimum & maximum</p>
          </div>
        </div>

        <div className="mb-6">
          <Slider
            value={[minBudget, maxBudget]}
            max={MAX_BUDGET}
            step={5000}
            onValueChange={handleBudgetRangeChange}
            className="accent-emerald-600"
          />
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Min Budget</div>
            <Input
              type="number"
              value={minBudget}
              onChange={(e) => handleMinBudgetInput(Number(e.target.value) || 0)}
              className="h-10 text-center font-mono font-medium border-emerald-200 focus:border-emerald-600"
              min={0}
              max={maxBudget}
              aria-label="Minimum budget"
            />
          </div>
          <div className="flex-1">
            <div className="text-xs text-muted-foreground mb-1">Max Budget</div>
            <Input
              type="number"
              value={maxBudget}
              onChange={(e) => handleMaxBudgetInput(Number(e.target.value) || MAX_BUDGET)}
              className="h-10 text-center font-mono font-medium border-emerald-200 focus:border-emerald-600"
              min={minBudget}
              max={MAX_BUDGET}
              aria-label="Maximum budget"
            />
          </div>
        </div>

        <div className="flex justify-between text-xs font-medium text-muted-foreground">
          <span>0 ETB</span>
          <span className="font-semibold text-emerald-700">
            {MAX_BUDGET.toLocaleString()} ETB
          </span>
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        className="w-full h-12 rounded-xl border-dashed text-muted-foreground hover:text-destructive hover:border-destructive transition-all"
        onClick={resetAllFilters}
      >
        <X className="w-4 h-4 mr-2" />
        Reset All Filters
      </Button>
    </div>
  );

  // TopSearchBar, header, main layout, etc. remain unchanged from previous polished version
  const TopSearchBar = () => (
    <div className="flex items-center gap-3 mb-8">
      <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-10 bg-white border border-border rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600/30 focus-visible:border-emerald-600 text-base shadow-sm"
            aria-label="Search buyer requests"
          />
        </div>

        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-white px-9 h-10 rounded-lg font-medium shadow-sm whitespace-nowrap transition-all active:scale-[0.985]"
        >
          Search
        </Button>

        <Select value={category} onValueChange={handleCategoryChange}>
          <SelectTrigger className="h-10 w-[200px] border border-border bg-white rounded-xl">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <SelectValue placeholder="All Categories" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </form>

      <div className="flex border border-border rounded-xl overflow-hidden bg-white shadow-sm">
        <Button
          type="button"
          variant={viewMode === "grid" ? "secondary" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-none border-r"
          onClick={() => setViewMode("grid")}
          aria-label="Grid view"
        >
          <LayoutGrid className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="icon"
          className="h-10 w-10 rounded-none"
          onClick={() => setViewMode("list")}
          aria-label="List view"
        >
          <List className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Page Header (unchanged) */}
      <div className="bg-white dark:bg-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-serif font-bold text-foreground">Buyer Request Feed</h1>
              <p className="text-muted-foreground text-sm">Review what buyers are looking for and make an offer.</p>
            </div>
            <Link href="/buyer/requests/create" className="flex justify-around items-center rounded-xl px-6 text-primary-foreground p-2  bg-primary hover:bg-primary/90 transition-all gap-2">
              <Plus className="w-4 h-4" />
              Post a Request
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <Card className="bg-background border-0 sticky top-24">
              <CardContent className="p-4 bg-background m-0">
                <SidebarFilters />
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <TopSearchBar />

            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Showing Results</h2>
                <Badge variant="secondary" className="rounded-full px-3 py-1 bg-emerald-50 text-emerald-700 border-none">
                  {filteredListings.length}
                </Badge>
              </div>

              <Sheet open={isMobileFiltersOpen} onOpenChange={setIsMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden rounded-xl">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-96">
                  <SheetHeader className="mb-8">
                    <SheetTitle className="flex items-center gap-3">
                      <Filter className="w-6 h-6" /> Filters
                    </SheetTitle>
                  </SheetHeader>
                  <SidebarFilters />
                </SheetContent>
              </Sheet>
            </div>

            {/* Listings & Pagination (unchanged) */}
            {loading ? (
              <LoadingState count={6} type="card" />
            ) : filteredListings.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {paginatedListings.map((l) => (
                  <RequestCard
                    key={l.id}
                    request={l}
                    userId={user?.id ?? null}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Search}
                title="No matching requests"
                description="We couldn't find any buyer requests matching your current filters."
                actionLabel="Clear all filters"
                onAction={resetAllFilters}
              />
            )}

            {totalPages > 1 && (
              <div className="mt-16 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-11 w-11"
                  disabled={page === 1}
                  onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>

                <div className="flex p-1 bg-white border border-border/60 rounded-xl shadow-sm">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <Button
                      key={p}
                      variant={page === p ? "default" : "ghost"}
                      className={`h-9 min-w-[36px] px-3 rounded-xl transition-all ${
                        page === p ? "shadow-md shadow-emerald-600/20" : ""
                      }`}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    >
                      {p}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl h-11 w-11"
                  disabled={page === totalPages}
                  onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  aria-label="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}