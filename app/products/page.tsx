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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES } from '@/lib/constants/categories';
import { Package, Filter, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react';

const PER_PAGE = 12;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { products, loading, error } = useProducts({
    category: category || undefined,
    search: search || undefined,
    status: 'active',
  });

  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const paginatedProducts = useMemo(
    () => products.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [products, page],
  );

  const handleSearch = (query: string) => {
    setSearch(query);
    setPage(1);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value);
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (value !== 'all') params.set('category', value);
    router.push(`/products?${params.toString()}`);
  };

  const pageNumbers = useMemo(() => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Browse Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover products from verified sellers across Ethiopia
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search products..."
              defaultValue={search}
              onSearch={handleSearch}
            />
          </div>
          
          <Select value={category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-50 border-border focus:ring-0 focus:border-foreground h-10">
              <Filter className="w-4 h-4 mr-2 opacity-50" />
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className={viewMode === 'grid' ? 'shadow-none' : 'border-border'}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'shadow-none' : 'border-border'}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {(category || search) && (
          <div className="mb-8 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground mr-2">Active filters:</span>
            {category && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-1"
                onClick={() => handleCategoryChange('all')}
              >
                {category} <span className="ml-2 opacity-50">✕</span>
              </Badge>
            )}
            {search && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors px-3 py-1"
                onClick={() => handleSearch('')}
              >
                &quot;{search}&quot; <span className="ml-2 opacity-50">✕</span>
              </Badge>
            )}
          </div>
        )}

        {!loading && (
          <div className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </div>
        )}

        {loading ? (
          <LoadingState count={8} type="card" />
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading products. Please try again.
          </div>
        ) : products.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8' : 'space-y-6'}>
              {paginatedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
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
                    <span key={`dots-${i}`} className="px-2 text-sm text-muted-foreground">
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
            icon={Package}
            title="No products found"
            description={
              category || search
                ? "Try adjusting your filters or search query."
                : "Be the first seller to list a product!"
            }
            actionLabel={category || search ? "Clear Filters" : undefined}
            onAction={() => {
              setCategory('');
              setSearch('');
              router.push('/products');
            }}
          />
        )}
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingState count={1} type="card" /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
