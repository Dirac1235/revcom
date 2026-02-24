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
import {
  Package,
  FileText,
  ArrowRight,
  Send,
  Smartphone,
  ShoppingBag,
  Home,
  Wrench,
  Heart,
  Briefcase,
  BookOpen,
  Car,
  Truck,
  Shield,
  Star,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const { products, loading: productsLoading } = useProducts({ limit: 8, status: "active" });
  const { requests, loading: requestsLoading } = useRequests({ limit: 8 });
  const [stats, setStats] = useState({
    products: 0,
    requests: 0,
    sellers: 0,
    orders: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const supabase = createClient();
      const [productsCount, requestsCount, sellersRes, ordersRes] =
        await Promise.all([
          getListingsCount({ status: "active" }),
          getRequestsCount({ status: "open" }),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .in("user_type", ["seller", "both"]),
          supabase
            .from("orders")
            .select("id", { count: "exact", head: true }),
        ]);
      setStats({
        products: productsCount,
        requests: requestsCount,
        sellers: sellersRes.count || 0,
        orders: ordersRes.count || 0,
      });
    };
    fetchStats();
  }, []);

  const handleSearch = (query: string) => {
    router.push(`/products?q=${encodeURIComponent(query)}`);
  };

  const featuredCategories: { name: string; icon: LucideIcon }[] = [
    { name: "Electronics", icon: Smartphone },
    { name: "Clothing", icon: ShoppingBag },
    { name: "Home & Garden", icon: Home },
    { name: "Industrial Equipment", icon: Wrench },
    { name: "Health & Beauty", icon: Heart },
    { name: "Automotive", icon: Car },
    { name: "Books", icon: BookOpen },
    { name: "Services", icon: Briefcase },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-foreground/2 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-foreground/2 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main hero content */}
          <div className="text-center max-w-4xl mx-auto mb-12">

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold mb-6 leading-[1.1] tracking-tight">
              <span className="text-primary">Stop Searching.</span>
              <br />
              <span className="text-foreground">Start Getting Found.</span>
            </h1>

            <p className="text-lg md:text-xl text-foreground/60 mb-10 max-w-2xl mx-auto leading-relaxed font-sans">
              Post what you need. Receive competitive offers from verified
              sellers. Choose the best deal.
            </p>

            {/* Search / Quick Actions */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                placeholder="Search products, or describe what you need..."
                onSearch={handleSearch}
                className=""
              />
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-xs text-foreground/40 font-sans">
                  {stats.products.toLocaleString()} products •{" "}
                  {stats.requests.toLocaleString()} buyer requests
                </span>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!user ? (
                <>
                  <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 gap-2 shadow-sm"
                    >
                      Post Your First Request
                      <Send className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-8 border-foreground/20 hover:bg-foreground/5"
                    >
                      Browse Products
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                    <Button
                      size="lg"
                      className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-8 gap-2 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                      Post Request
                    </Button>
                  </Link>
                  <Link href={ROUTES.PRODUCTS}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-xl px-8 border-foreground/20 hover:bg-foreground/5"
                    >
                      <Package className="w-4 h-4" />
                      Browse Products
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              {
                label: "Products Listed",
                value: stats.products.toLocaleString(),
              },
              {
                label: "Active Requests",
                value: stats.requests.toLocaleString(),
              },
              {
                label: "Verified Sellers",
                value: stats.sellers.toLocaleString(),
              },
              {
                label: "Orders Completed",
                value: stats.orders.toLocaleString(),
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="text-center p-4 rounded-xl bg-card border border-foreground/8"
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-foreground/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* How it works - Visual Flow */}
        <section className="relative py-16">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3 font-sans">
              How It Works
            </p>
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
              Two Ways to Do Business
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto font-sans">
              Whether you're buying or selling, RevCom makes it effortless
            </p>
          </div>

          {/* Visual Split Flow */}
          <div className="space-y-12">
            {/* Buyer Flow - Horizontal */}
            <div className="relative">
              

              <div className="flex items-start gap-8 md:gap-12 relative">
                {/* Connecting line */}
                <div
                  className="absolute top-7 left-7 right-7 h-0.5 bg-primary/10 hidden md:block"
                  style={{ width: "calc(100% - 3.5rem)" }}
                />

                {[
                  { step: "01", action: "Post", detail: "your requirement" },
                  {
                    step: "02",
                    action: "Receive",
                    detail: "competitive offers",
                  },
                  { step: "03", action: "Choose", detail: "the best deal" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 relative z-10">
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center font-serif font-bold text-lg text-primary group-hover:border-primary group-hover:bg-primary/5 transition-all mb-4">
                        {item.step}
                      </div>
                      <div className="font-bold text-lg text-foreground font-sans mb-1">
                        {item.action}
                      </div>
                      <div className="text-sm text-foreground/50 font-sans">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Horizontal Divider */}
            <div className="w-full h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

            {/* Seller Flow - Horizontal */}
            <div className="relative">
              

              <div className="flex items-start gap-8 md:gap-12 relative">
                {/* Connecting line */}
                <div
                  className="absolute top-7 left-7 right-7 h-0.5 bg-primary/10 hidden md:block"
                  style={{ width: "calc(100% - 3.5rem)" }}
                />

                {[
                  { step: "01", action: "Browse", detail: "real buyer demand" },
                  { step: "02", action: "Offer", detail: "your best proposal" },
                  { step: "03", action: "Win", detail: "and fulfill orders" },
                ].map((item, i) => (
                  <div key={i} className="flex-1 relative z-10">
                    <div className="flex flex-col items-center text-center group">
                      <div className="w-14 h-14 rounded-full border-2 border-primary/30 bg-background flex items-center justify-center font-serif font-bold text-lg text-primary group-hover:border-primary group-hover:bg-primary/5 transition-all mb-4">
                        {item.step}
                      </div>
                      <div className="font-bold text-lg text-foreground font-sans mb-1">
                        {item.action}
                      </div>
                      <div className="text-sm text-foreground/50 font-sans">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 font-sans">
                Categories
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                What Are You Looking For?
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {featuredCategories.map((cat, i) => (
              <Link
                key={i}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group"
              >
                <div className="bg-card border border-foreground/8 rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all h-full flex flex-col items-center text-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/8 border border-primary/15 flex items-center justify-center group-hover:bg-primary/15 group-hover:border-primary/30 transition-all">
                    <cat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Requests (Default) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 font-sans">
                Latest Opportunities
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Recent Buyer Requests
              </h2>
            </div>
            <Link href={ROUTES.REQUESTS}>
              <Button
                variant="ghost"
                className="text-foreground/60 hover:text-foreground gap-2 group"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {requestsLoading ? (
            <LoadingState count={8} type="card" />
          ) : requests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  userId={user?.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No requests yet"
              description="Be the first buyer to post a request"
              actionLabel="Post Request"
              actionHref={ROUTES.BUYER_REQUEST_CREATE}
            />
          )}
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2 font-sans">
                Marketplace
              </p>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                Featured Products
              </h2>
            </div>
            <Link href={ROUTES.PRODUCTS}>
              <Button
                variant="ghost"
                className="text-foreground/60 hover:text-foreground gap-2 group"
              >
                Browse All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <LoadingState count={8} type="card" />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Package}
              title="No products yet"
              description="Check back soon for listings"
            />
          )}
        </section>

        {/* Why RevCom */}
        <section className="bg-foreground/2 border border-foreground/8 rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary mb-3">
              Why Choose RevCom?
            </h2>
            <p className="text-foreground/60 max-w-2xl mx-auto font-sans">
              Built specifically for Ethiopian B2B commerce
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                title: "No More Scrolling",
                desc: "Post needs, get offers delivered to you",
              },
              {
                title: "Competitive Pricing",
                desc: "Sellers compete for your business",
              },
              {
                title: "Fast & Efficient",
                desc: "Orders placed in hours, not days",
              },
              {
                title: "Verified & Trusted",
                desc: "Rated sellers, secure transactions",
              },
            ].map((feature, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl font-bold text-primary/20 mb-3 font-serif">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="font-bold mb-2 text-foreground font-sans">
                  {feature.title}
                </h3>
                <p className="text-sm text-foreground/60 leading-relaxed font-sans">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Dual CTA */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 md:p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary/70 font-sans">
                  Buyers
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3 text-primary">
                Need to Source Products?
              </h3>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed font-sans">
                Post your requirement and receive competitive offers from
                verified sellers
              </p>
              {user ? (
                <Link href={ROUTES.BUYER_REQUEST_CREATE}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm">
                    Post Your First Request
                  </Button>
                </Link>
              ) : (
                <Link href={ROUTES.SIGNUP}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm">
                    Create Buyer Account
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-8 md:p-10 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary/70 font-sans">
                  Sellers
                </span>
              </div>
              <h3 className="text-2xl font-serif font-bold mb-3 text-primary">
                Ready to Grow Your Business?
              </h3>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed font-sans">
                Start receiving orders from verified buyers today
              </p>
              {user ? (
                <Link href={ROUTES.SELLER_PRODUCTS}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm">
                    Add Your First Product
                  </Button>
                </Link>
              ) : (
                <Link href={ROUTES.SIGNUP}>
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-sm">
                    Create Seller Account
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
