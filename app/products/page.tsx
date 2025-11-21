"use client";

import { useState, useEffect } from 'react';
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

export default function ProductsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/30 dark:from-blue-950/10 dark:via-indigo-950/10 dark:to-purple-950/10">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Browse Products
          </h1>
          <p className="text-muted-foreground">
            Discover products from verified sellers across Ethiopia
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              placeholder="Search products..."
              defaultValue={search}
              onSearch={handleSearch}
            />
          </div>
          
          <Select value={category || 'all'} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <Filter className="w-4 h-4 mr-2" />
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
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Active Filters */}
        {(category || search) && (
          <div className="mb-6 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {category && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleCategoryChange('all')}
              >
                {category} ✕
              </Badge>
            )}
            {search && (
              <Badge
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleSearch('')}
              >
                "{search}" ✕
              </Badge>
            )}
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-muted-foreground">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </div>
        )}

        {/* Products Grid/List */}
        {loading ? (
          <LoadingState count={8} type="card" />
        ) : error ? (
          <div className="text-center py-12 text-red-600">
            Error loading products. Please try again.
          </div>
        ) : products.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6' : 'space-y-4'}>
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
