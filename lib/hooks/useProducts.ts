import { useEffect, useState, useCallback } from 'react';
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

  const supabase = createClient();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('listings').select('*');

      if (options.sellerId) {
        query = query.eq('seller_id', options.sellerId);
      }

      if (options.category) {
        query = query.eq('category', options.category);
      }

      if (options.status) {
        query = query.eq('status', options.status);
      } else {
        // Default to active products only
        query = query.eq('status', 'active');
      }

      if (options.search) {
        query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
      }

      query = query.order('created_at', { ascending: false });

      if (options.limit) {
        query = query.limit(options.limit);
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
  }, [options.sellerId, options.category, options.status, options.search, options.limit]);

  useEffect(() => {
    fetchProducts();
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

  const supabase = createClient();

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchProduct = async () => {
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
