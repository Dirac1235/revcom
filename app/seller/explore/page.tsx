"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRequests } from "@/lib/hooks/useRequests";
import { RequestCard } from "@/components/features/RequestCard";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { SearchBar } from "@/components/features/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES } from "@/lib/constants/categories";
import { ROUTES } from "@/lib/constants/routes";
import { FileText, Filter, TrendingUp, DollarSign, Package } from "lucide-react";

export default function SellerExplorePage() {
  const router = useRouter();
  const { user, loading: authLoading, isSeller } = useAuth();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    category: "",
    search: "",
    minBudget: "",
    maxBudget: "",
  });

  const { requests, loading, refetch } = useRequests({
    status: "open",
    category: appliedFilters.category || undefined,
    search: appliedFilters.search || undefined,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.LOGIN);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !isSeller) {
      router.push(ROUTES.HOME);
    }
  }, [user, authLoading, isSeller, router]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      category: selectedCategory,
      search: searchTerm,
      minBudget,
      maxBudget,
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setSearchTerm("");
    setMinBudget("");
    setMaxBudget("");
    setAppliedFilters({
      category: "",
      search: "",
      minBudget: "",
      maxBudget: "",
    });
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    setAppliedFilters(prev => ({ ...prev, search: query }));
  };

  // Filter requests by budget if specified
  const filteredRequests = requests.filter((request) => {
    if (appliedFilters.minBudget && request.budget_max) {
      if (request.budget_max < parseFloat(appliedFilters.minBudget)) {
        return false;
      }
    }
    if (appliedFilters.maxBudget && request.budget_min) {
      if (request.budget_min > parseFloat(appliedFilters.maxBudget)) {
        return false;
      }
    }
    return true;
  });

  const hasActiveFilters = appliedFilters.category || appliedFilters.search || appliedFilters.minBudget || appliedFilters.maxBudget;

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <LoadingState count={6} type="card" />
        </main>
      </div>
    );
  }

  if (!user || !isSeller) return null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
              Explore Requests
            </h1>
            <p className="text-muted-foreground text-lg">
              Browse and respond to buyer requests
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Open Requests</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredRequests.length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Today</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {requests.filter(r => {
                      const today = new Date();
                      const createdAt = new Date(r.created_at);
                      return createdAt.toDateString() === today.toDateString();
                    }).length}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Budget</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    ${Math.round(
                      requests.reduce((sum, r) => {
                        const avg = ((r.budget_min || 0) + (r.budget_max || 0)) / 2;
                        return sum + avg;
                      }, 0) / (requests.length || 1)
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <SearchBar
                  placeholder="Search by title or description..."
                  defaultValue={searchTerm}
                  onSearch={handleSearch}
                />
              </div>

              {/* Filter Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Min Budget (ETB)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Max Budget (ETB)</label>
                  <input
                    type="number"
                    placeholder="100000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex gap-3">
                <Button onClick={handleApplyFilters} className="bg-blue-600 hover:bg-blue-700">
                  Apply Filters
                </Button>
                {hasActiveFilters && (
                  <Button onClick={handleClearFilters} variant="outline">
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {appliedFilters.category && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                setSelectedCategory("");
                setAppliedFilters(prev => ({ ...prev, category: "" }));
              }}>
                {appliedFilters.category} ✕
              </Badge>
            )}
            {appliedFilters.search && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                setSearchTerm("");
                setAppliedFilters(prev => ({ ...prev, search: "" }));
              }}>
                "{appliedFilters.search}" ✕
              </Badge>
            )}
            {appliedFilters.minBudget && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                setMinBudget("");
                setAppliedFilters(prev => ({ ...prev, minBudget: "" }));
              }}>
                Min: ${appliedFilters.minBudget} ✕
              </Badge>
            )}
            {appliedFilters.maxBudget && (
              <Badge variant="secondary" className="cursor-pointer" onClick={() => {
                setMaxBudget("");
                setAppliedFilters(prev => ({ ...prev, maxBudget: "" }));
              }}>
                Max: ${appliedFilters.maxBudget} ✕
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'} found
        </div>

        {/* Requests Grid */}
        {loading ? (
          <LoadingState count={6} type="card" />
        ) : filteredRequests.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} userId={user.id} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="No requests found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to see more results."
                : "No open buyer requests at the moment. Check back later!"
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={hasActiveFilters ? handleClearFilters : undefined}
          />
        )}
      </main>
    </div>
  );
}
