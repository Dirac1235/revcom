import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
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
  const mountedRef = useRef(false);

  const { sellerId, category, status, search, limit } = options;

  const fetchProducts = useCallback(async () => {
    const supabase = createClient();
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('listings').select('*');

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (status) {
        query = query.eq('status', status);
      } else {
        // Default to active products only
        query = query.eq('status', 'active');
      }

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err) {
      setError(err as Error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [sellerId, category, status, search, limit]);

  useEffect(() => {
    // Always fetch on mount
    fetchProducts();
    mountedRef.current = true;
  }, [fetchProducts]);

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

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProduct = async () => {
      const supabase = createClient();
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!mounted) return;
        setProduct(data);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [id]);

  return {
    product,
    loading,
    error,
  };
}
