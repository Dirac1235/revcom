"use client";

import { useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useProducts } from '@/lib/hooks/useProducts';
import { ProductCard } from '@/components/features/ProductCard';
import { EmptyState } from '@/components/features/EmptyState';
import { LoadingState } from '@/components/features/LoadingState';
import { SearchBar } from '@/components/features/SearchBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { CATEGORIES } from '@/lib/constants/categories';
import {
  Package,
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
  Tag,
  Banknote,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

const PER_PAGE = 12;
const MIN_PRICE = 0;
const MAX_PRICE = 1000000;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>(
    searchParams.get('categories')?.split(',').filter(Boolean) || []
  );
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    parseInt(searchParams.get('minPrice') || '0'),
    parseInt(searchParams.get('maxPrice') || String(MAX_PRICE)),
  ]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { products, loading, error } = useProducts({
    search: search || undefined,
    status: 'active',
  });

  const filteredProducts = products.filter(
    (p) =>
      (categories.length === 0 || categories.includes(p.category)) &&
      p.price >= priceRange[0] &&
      p.price <= priceRange[1]
  );

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const paginatedProducts = useMemo(
    () => filteredProducts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filteredProducts, page],
  );

  const updateURL = (cats: string[], q: string, price: [number, number]) => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (cats.length > 0) params.set('categories', cats.join(','));
    if (price[0] > MIN_PRICE) params.set('minPrice', String(price[0]));
    if (price[1] < MAX_PRICE) params.set('maxPrice', String(price[1]));
    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    updateURL(categories, query, priceRange);
  };

  const handleCategoryToggle = (category: string) => {
    const updated = categories.includes(category)
      ? categories.filter((c) => c !== category)
      : [...categories, category];
    setCategories(updated);
    setPage(1);
    updateURL(updated, search, priceRange);
  };

  const handlePriceChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    setPage(1);
    updateURL(categories, search, newRange);
  };

  const clearFilters = () => {
    setCategories([]);
    setSearch('');
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setPage(1);
    router.push('/products');
  };

  const hasActiveFilters = categories.length > 0 || search || priceRange[0] > MIN_PRICE || priceRange[1] < MAX_PRICE;

  const SidebarContent = () => (
    <div className="space-y-8">
      {/* Categories */}
      <section>
        <div className="flex items-center gap-2 mb-4 text-primary">
          <Tag className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Categories</h3>
        </div>
        <div className="grid gap-2.5">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="group flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 cursor-pointer transition-all"
            >
              <Checkbox
                checked={categories.includes(cat)}
                onCheckedChange={() => handleCategoryToggle(cat)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </section>

      <Separator className="bg-border/60" />

      {/* Price Range */}
      <section>
        <div className="flex items-center gap-2 mb-6 text-primary">
          <Banknote className="w-4 h-4" />
          <h3 className="text-sm font-bold uppercase tracking-wider">Price Range</h3>
        </div>
        <Slider
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={1000}
          value={priceRange}
          onValueChange={(value) => handlePriceChange(value as [number, number])}
          className="mb-6"
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Min (ETB)</span>
            <div className="px-3 py-2 bg-secondary/30 rounded-md border border-border/40 text-sm font-medium">
              {priceRange[0].toLocaleString()}
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Max (ETB)</span>
            <div className="px-3 py-2 bg-secondary/30 rounded-md border border-border/40 text-sm font-medium">
              {priceRange[1].toLocaleString()}
            </div>
          </div>
        </div>
      </section>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all gap-2"
        >
          <X className="w-3.5 h-3.5" />
          Reset All Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="bg-white dark:bg-card border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-2">
            Marketplace
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Showing high-quality products from verified sellers across Ethiopia.
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-8 p-1">
              <SidebarContent />
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            
            {/* Unified Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 p-2  ">
              <div className="relative w-full">
                <SearchBar
                  placeholder="Search products..."
                  defaultValue={search}
                  onSearch={handleSearch}
                />
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                <div className="flex items-center gap-2">
                  <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:w-80 overflow-y-auto">
                      <SheetHeader className="mb-8">
                        <SheetTitle className="text-left flex items-center gap-2">
                          <SlidersHorizontal className="w-5 h-5" />
                          Refine Results
                        </SheetTitle>
                      </SheetHeader>
                      <SidebarContent />
                    </SheetContent>
                  </Sheet>

                  <div className="h-8 w-[1px] bg-border/60 mx-1 hidden md:block" />

                  <div className="flex bg-secondary/40 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                      className="h-8 w-8 rounded-md transition-all shadow-sm"
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                      className="h-8 w-8 rounded-md transition-all shadow-sm"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Active Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {search && (
                  <Badge variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-border/60 bg-white shadow-sm hover:bg-destructive/5 hover:text-destructive group transition-all">
                    Search: {search}
                    <X className="w-3 h-3 cursor-pointer opacity-60 group-hover:opacity-100" onClick={() => handleSearch('')} />
                  </Badge>
                )}
                {categories.map((cat) => (
                  <Badge key={cat} variant="secondary" className="pl-2 pr-1 py-1 gap-1 border-border/60 bg-white shadow-sm hover:bg-destructive/5 hover:text-destructive group transition-all">
                    {cat}
                    <X className="w-3 h-3 cursor-pointer opacity-60 group-hover:opacity-100" onClick={() => handleCategoryToggle(cat)} />
                  </Badge>
                ))}
              </div>
            )}

            {/* Content State */}
            {loading ? (
              <LoadingState count={8} type="card" />
            ) : error ? (
              <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="py-10 text-center text-destructive font-medium">
                  Failed to load products. Please check your connection.
                </CardContent>
              </Card>
            ) : filteredProducts.length > 0 ? (
              <>
                <div className={
                  viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6' 
                  : 'flex flex-col gap-4'
                }>
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination - Minimalist */}
                {totalPages > 1 && (
                  <div className="mt-16 flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === 1}
                      onClick={() => { setPage(page - 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="rounded-xl border-border/60"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-1 bg-white dark:bg-card border border-border/60 p-1 rounded-xl">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                        <Button
                          key={p}
                          variant={page === p ? "default" : "ghost"}
                          size="sm"
                          onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className={`h-8 w-8 p-0 rounded-lg ${page === p ? 'shadow-md' : ''}`}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page === totalPages}
                      onClick={() => { setPage(page + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="rounded-xl border-border/60"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="mt-10">
                <EmptyState
                  icon={Package}
                  title="No matches found"
                  description="Try adjusting your filters or search terms to find what you're looking for."
                  actionLabel="Clear all filters"
                  onAction={clearFilters}
                />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-muted-foreground animate-pulse font-medium">Loading Marketplace...</div>}>
      <ProductsContent />
    </Suspense>
  );
}