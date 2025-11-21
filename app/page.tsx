"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/features/ProductCard";
import { RequestCard } from "@/components/features/RequestCard";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { SearchBar } from "@/components/features/SearchBar";
import { useAuth } from "@/lib/hooks/useAuth";
import { useProducts } from "@/lib/hooks/useProducts";
import { useRequests } from "@/lib/hooks/useRequests";
import { ROUTES } from "@/lib/constants/routes";
import { Sparkles, Package, FileText, ArrowRight, TrendingUp, Users, ShoppingBag } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const { products, loading: productsLoading } = useProducts({ limit: 8 });
  const { requests, loading: requestsLoading } = useRequests({ limit: 8 });

  const handleSearch = (query: string) => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:20px_20px]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Ethiopia's Premier B2B Marketplace</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Connect Buyers & Sellers
              <br />
              <span className="text-blue-200">Across Ethiopia</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Post your needs, discover products, and get instant quotes from verified sellers
            </p>

            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="Search products or post a request..."
                onSearch={handleSearch}
                className="bg-white/10 backdrop-blur-md"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link href={ROUTES.SIGNUP}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl">
                      Get Started Free
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                      Browse Products
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-xl">
                      <Package className="w-5 h-5 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                    <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                      <FileText className="w-5 h-5 mr-2" />
                      Post Request
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,000+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <ShoppingBag className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{products.length}</p>
                <p className="text-sm text-muted-foreground">Products Listed</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Active Requests</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground">
                Discover quality products from verified sellers
              </p>
            </div>
            <Link href={ROUTES.PRODUCTS}>
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <LoadingState count={4} type="card" />
          ) : products.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Be the first seller to list a product!"
            />
          )}
        </section>

        {/* Recent Buyer Requests */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                Recent Buyer Requests
              </h2>
              <p className="text-muted-foreground">
                Browse open requests and submit your offers
              </p>
            </div>
            <Link href={ROUTES.LISTINGS}>
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {requestsLoading ? (
            <LoadingState count={4} type="card" />
          ) : requests.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {requests.slice(0, 4).map((request) => (
                <RequestCard key={request.id} request={request} userId={user?.id} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No requests yet"
              description="Be the first buyer to post a request!"
              actionLabel={user ? "Post Request" : "Sign Up to Post"}
              actionHref={user ? ROUTES.BUYER_REQUEST_CREATE : ROUTES.SIGNUP}
            />
          )}
        </section>

        {/* How It Works */}
        <section className="mt-20 bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 border border-blue-100 dark:border-blue-900/50 shadow-xl">
          <h2 className="text-3xl font-bold text-center text-blue-600 dark:text-blue-400 mb-12">
            How RevCom Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Post Your Need</h3>
              <p className="text-muted-foreground">
                Describe what you're looking for and set your budget
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Receive Offers</h3>
              <p className="text-muted-foreground">
                Get competitive quotes from verified sellers
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Complete Deal</h3>
              <p className="text-muted-foreground">
                Choose the best offer and finalize your transaction
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
