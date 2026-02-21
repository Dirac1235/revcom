"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/features/ProductCard";
import { RequestCard } from "@/components/features/RequestCard";
import { EmptyState } from "@/components/features/EmptyState";
import { LoadingState } from "@/components/features/LoadingState";
import { SearchBar } from "@/components/features/SearchBar";
import { useAuth } from "@/components/providers/AuthProvider";
import { useProducts } from "@/lib/hooks/useProducts";
import { useRequests } from "@/lib/hooks/useRequests";
import { getListingsCount } from "@/lib/data/listings-server";
import { getRequestsCount } from "@/lib/data/requests-server";
import { ROUTES } from "@/lib/constants/routes";
import { Package, FileText, ArrowRight, TrendingUp, Users, ShoppingBag } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  
  const { products, loading: productsLoading } = useProducts({ limit: 8 });
  const { requests, loading: requestsLoading } = useRequests({ limit: 8 });
  const [stats, setStats] = useState({ users: 0, products: 0, requests: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      const [productsCount, requestsCount] = await Promise.all([
        getListingsCount({ status: 'active' }),
        getRequestsCount({ status: 'open' }),
      ]);
      setStats({
        users: 0, // Will be populated from profiles count separately if needed
        products: productsCount,
        requests: requestsCount,
      });
    };
    fetchStats();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-secondary/20 pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-8 leading-tight text-foreground tracking-tight">
              Discover elegant & <br />
              <span className="italic text-muted-foreground">affordable sourcing</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-light">
              Transform your business procurement with sophisticated tools and verified sellers across Ethiopia.
            </p>

            <div className="max-w-xl mx-auto mb-10">
              <SearchBar
                placeholder="Search products or post a request..."
                onSearch={handleSearch}
                className="shadow-lg shadow-black/5"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link href={ROUTES.SIGNUP}>
                    <Button size="lg" className="bg-primary text-background hover:bg-foreground/90 rounded-full px-8">
                      Get Started Free
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button size="lg" variant="outline" className="rounded-full px-8 border-foreground/20 bg-background hover:bg-foreground hover:text-background">
                      Browse Products
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button size="lg" className="bg-primary text-background hover:bg-foreground/90 rounded-full px-8">
                      <Package className="w-4 h-4 mr-2" />
                      Browse Products
                    </Button>
                  </Link>
                  <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                    <Button size="lg" variant="outline" className="rounded-full px-8  border-foreground/20 hover:bg-foreground hover:text-background">
                      <FileText className="w-4 h-4 mr-2" />
                      Post Request
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>


      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 space-y-24">
        {/* Featured Products */}
        <section>
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Collection</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                Featured Products
              </h2>
            </div>
            <Link href={ROUTES.PRODUCTS}>
              <Button variant="link" className="text-foreground p-0 h-auto font-medium hover:no-underline group">
                View All Collection
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <LoadingState count={4} type="card" />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
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
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">Opportunities</p>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
                Recent Requests
              </h2>
            </div>
            <Link href={ROUTES.LISTINGS}>
              <Button variant="link" className="text-foreground p-0 h-auto font-medium hover:no-underline group">
                View All Requests
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          {requestsLoading ? (
            <LoadingState count={4} type="card" />
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8">
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
        <section className="bg-secondary/20 rounded-2xl p-12 md:p-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
              How RevCom Works
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A simple, transparent process designed to connect you with the right partners efficiently.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-px bg-border z-0" />
            
            <div className="text-center relative z-10">
              <div className="bg-background border border-border w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-xl font-serif font-bold text-foreground">1</span>
              </div>
              <h3 className="text-lg font-medium mb-3">Post Your Need</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Describe what you're looking for and set your budget parameters clearly.
              </p>
            </div>
            <div className="text-center relative z-10">
              <div className="bg-background border border-border w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-xl font-serif font-bold text-foreground">2</span>
              </div>
              <h3 className="text-lg font-medium mb-3">Receive Offers</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Get competitive quotes from verified sellers matching your requirements.
              </p>
            </div>
            <div className="text-center relative z-10">
              <div className="bg-background border border-border w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-xl font-serif font-bold text-foreground">3</span>
              </div>
              <h3 className="text-lg font-medium mb-3">Complete Deal</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Choose the best offer and finalize your transaction securely.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
