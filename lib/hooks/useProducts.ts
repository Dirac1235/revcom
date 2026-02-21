import { useEffect, useState, useCallback } from 'react';
import { getListings, getListingById } from '@/lib/data/listings-server';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Product } from '@/lib/types';

interface UseProductsOptions {
  sellerId?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'sold';
  search?: string;
  limit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useAuth(); // Wait for auth to be ready

  const { sellerId, category, status, search, limit } = options;

  const fetchProducts = useCallback(async () => {
    console.log('[useProducts] fetchProducts called');
    
    try {
      setLoading(true);
      setError(null);

      const data = await getListings({
        sellerId,
        category,
        status,
        search,
        limit
      });

      console.log('[useProducts] fetchProducts succeeded with', data.length, 'products');
      setProducts(data);
    } catch (err) {
      console.error('[useProducts] fetchProducts failed:', err);
      setError(err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId, category, status, search, limit]);

  useEffect(() => {
    // Only fetch when auth is ready
    if (!isReady) {
      console.log('[useProducts] Waiting for auth to be ready...');
      return;
    }

    console.log('[useProducts] Auth is ready, fetching products...');
    fetchProducts();
  }, [fetchProducts, isReady]);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
}

export function useProduct(id: string | null) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isReady } = useAuth();

  useEffect(() => {
    if (!isReady) {
      console.log('[useProduct] Waiting for auth to be ready...');
      return;
    }

    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      console.log('[useProduct] Fetching product with id:', id);
      
      try {
        setLoading(true);
        setError(null);

        const data = await getListingById(id);

        if (!cancelled) {
          console.log('[useProduct] Product fetch succeeded:', data ? 'found' : 'not found');
          setProduct(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useProduct] Product fetch failed:', err);
          setError(err as Error);
          setProduct(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id, isReady]);

  return {
    product,
    loading,
    error,
  };
}
