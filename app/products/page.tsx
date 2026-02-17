"use client";

import { useState, useEffect, Suspense } from 'react';
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
import { Package, Filter, Grid, List } from 'lucide-react';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { products, loading, error } = useProducts({
    category: category || undefined,
    search: search || undefined,
    status: 'active',
  });

  const handleSearch = (query: string) => {
    setSearch(query);
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    router.push(`/products?${params.toString()}`);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value === 'all' ? '' : value);
    const params = new URLSearchParams();
    if (search) params.set('q', search);
    if (value !== 'all') params.set('category', value);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-serif font-bold text-foreground mb-3">
            Browse Products
          </h1>
          <p className="text-muted-foreground text-lg">
            Discover products from verified sellers across Ethiopia
          </p>
        </div>

        {/* Filters */}
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

        {/* Active Filters */}
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
                "{search}" <span className="ml-2 opacity-50">✕</span>
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-sm font-medium text-muted-foreground uppercase tracking-wider">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <LoadingState count={8} type="card" />
        ) : error ? (
          <div className="text-center py-12 text-destructive">
            Error loading products. Please try again.
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8' : 'space-y-6'}>
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
