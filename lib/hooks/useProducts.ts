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
    try {
      setLoading(true);
      setError(null);
      const data = await getListings({
        sellerId,
        category,
        status,
        search,
        limit,
      });
      setProducts(data);
    } catch (err) {
      setError(err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId, category, status, search, limit]);

  useEffect(() => {
    if (!isReady) return;
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
    if (!isReady) return;
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getListingById(id);
        if (!cancelled) setProduct(data);
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

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
